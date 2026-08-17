// Adaptive heartbeat cadence and the owners-available transition.
//
// Two pure decisions and one durable local receipt:
//   * how often the next observation pass should run (active 2 min, idle 15),
//   * whether both owners are provably free right now, and
//   * whether that fact is a NEW idle epoch that deserves exactly one message.
//
// Everything is fail-active or fail-quiet in the safe direction: an unknown
// owner, a stale observation or any live signal keeps the fast cadence and
// refuses the idle claim, while an unknown cadence token is a hard error.
//
// DELIVERY BOUNDARY — this module contains no Telegram transport, no token, no
// HTTP call and no daemon. It decides only whether a message is owed and what
// its exact text and idempotency key are; delivering it is a separate bounded
// backend packet that needs one migration and one default-off setting, both
// core-category acts requiring their own ticket and operator GO. The 17.08
// reconnaissance found no safe existing backend entry point: every sender is
// domain-bound, the closest state machine (development_ticket_notifications)
// excludes an idle-epoch event by its delivery_id FK and terminal_state CHECK,
// and notify-live is explicitly non-durable.

import { createHash, randomBytes } from 'node:crypto';
import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeSync,
} from 'node:fs';
import path from 'node:path';

export const IDLE_EPOCH_RECEIPT_SCHEMA = 'two-mac.idle-epoch-receipt.v1';
export const IDLE_EPOCH_RECEIPT_FILENAME = 'idle-epoch-receipt.v1.json';

export const CADENCE_ACTIVE_MINUTES = 2;
export const CADENCE_IDLE_MINUTES = 15;

// The closed token set. A signal outside it is not a weaker signal, it is an
// unreadable observation: the caller is wrong and must be stopped.
export const CADENCE_SIGNALS = Object.freeze([
  'callback',
  'ci',
  'correction',
  'deploy',
  'handoff',
  'merge',
  'next_action',
  'observation',
  'owner_busy',
  'recovery',
  'restart',
  'review',
  'unread_wake',
]);

export const OWNER_MACHINES = Object.freeze(['mac-a', 'mac-b']);
export const OWNER_TASK_STATUSES = Object.freeze(['active', 'idle', 'unknown']);
export const DELIVERY_STATES = Object.freeze(['ambiguous', 'delivered', 'pending']);

// Sub-second jitter in a recorded observation must not mint a new idle epoch.
export const OWNER_TASK_OBSERVATION_FLOOR_MS = 1_000;

export const OWNERS_AVAILABLE_MESSAGE = 'Оба мака свободны. Можно дать следующую задачу.';

const SHA256 = /^[0-9a-f]{64}$/u;
const ACTIVITY_MARKER = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,255}$/u;
const CANONICAL_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;

const CADENCE_OBSERVATION_KEYS = Object.freeze([
  'activeSignals',
  'ownersKnown',
  'waitingForOtherOwner',
]);

const OWNERS_AVAILABILITY_STATE_KEYS = Object.freeze([
  'activeSignals',
  'bindings',
  'lastActivityMarker',
  'operatorDecisionCount',
  'ownerTasks',
  'unreadTargetedWakes',
]);

const BINDINGS_KEYS = Object.freeze(['macA', 'macB']);
const OWNER_TASK_KEYS = Object.freeze(['machine', 'observedAt', 'status', 'taskDigest']);
const AVAILABILITY_KEYS = Object.freeze(['available', 'idleEpochId', 'reason']);
const IDLE_EPOCH_RECEIPT_KEYS = Object.freeze([
  'deliveryState',
  'emittedAt',
  'idempotencyKey',
  'idleEpochId',
  'schema',
]);

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  if (actual.length !== expected.length
      || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} has unexpected fields: ${actual.join(',')}`);
  }
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map(
    (key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`,
  ).join(',')}}`;
}

export function canonicalJson(value) {
  return canonicalize(value);
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function instantFrom(now, label) {
  if (typeof now !== 'function') throw new Error(`${label} requires an injected now() clock`);
  const value = now();
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`${label} clock must return a valid Date`);
  }
  return value;
}

function countOf(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative strict integer`);
  }
  return value;
}

function validateSignals(signals, label) {
  if (!Array.isArray(signals) || signals.length > CADENCE_SIGNALS.length) {
    throw new Error(`${label} must be an array of at most ${CADENCE_SIGNALS.length} tokens`);
  }
  for (const signal of signals) {
    if (!CADENCE_SIGNALS.includes(signal)) {
      throw new Error(`${label} contains an unknown token: ${JSON.stringify(signal)}`);
    }
  }
  if (new Set(signals).size !== signals.length) throw new Error(`${label} must be unique`);
  const sorted = [...signals].sort();
  if (sorted.some((signal, index) => signal !== signals[index])) {
    throw new Error(`${label} must be sorted`);
  }
  return signals;
}

/**
 * Pure cadence recommendation. Anything other than a fully proven idle state
 * keeps the fast pass: an unknown owner or a wait on the other owner is treated
 * exactly like a live signal.
 */
export function recommendCadence(observation) {
  exactKeys(observation, CADENCE_OBSERVATION_KEYS, 'cadence observation');
  if (typeof observation.ownersKnown !== 'boolean') {
    throw new Error('cadence observation ownersKnown must be a boolean');
  }
  if (typeof observation.waitingForOtherOwner !== 'boolean') {
    throw new Error('cadence observation waitingForOtherOwner must be a boolean');
  }
  validateSignals(observation.activeSignals, 'cadence observation activeSignals');
  const active = !observation.ownersKnown
    || observation.waitingForOtherOwner
    || observation.activeSignals.length > 0;
  return { intervalMinutes: active ? CADENCE_ACTIVE_MINUTES : CADENCE_IDLE_MINUTES };
}

function ownerTaskReason(task) {
  try {
    exactKeys(task, OWNER_TASK_KEYS, 'owner task');
  } catch {
    return 'owner_task_invalid';
  }
  if (!OWNER_MACHINES.includes(task.machine)) return 'owner_task_invalid';
  if (typeof task.taskDigest !== 'string' || !SHA256.test(task.taskDigest)) {
    return 'owner_task_invalid';
  }
  if (typeof task.observedAt !== 'string'
      || !CANONICAL_INSTANT.test(task.observedAt)
      || Number.isNaN(Date.parse(task.observedAt))) {
    return 'owner_task_invalid';
  }
  if (!OWNER_TASK_STATUSES.includes(task.status)) return 'owner_task_invalid';
  return null;
}

/**
 * The idle epoch identifies one uninterrupted idle stretch. It is derived only
 * from facts that stay constant while nothing happens — both bindings, both
 * owner tasks with the instant they were observed to become idle, and the last
 * activity marker — so a repeated pass over an unchanged world yields the same
 * id and cannot mint a second message. `now` is deliberately absent.
 */
function idleEpochIdFrom(state) {
  return sha256(canonicalJson({
    bindings: { macA: state.bindings.macA, macB: state.bindings.macB },
    lastActivityMarker: state.lastActivityMarker,
    ownerTasks: [...state.ownerTasks]
      .sort((left, right) => left.machine.localeCompare(right.machine))
      .map((task) => ({
        machine: task.machine,
        observedAtFloor: Math.floor(
          Date.parse(task.observedAt) / OWNER_TASK_OBSERVATION_FLOOR_MS,
        ),
        taskDigest: task.taskDigest,
      })),
  }));
}

/**
 * Fail-quiet availability: a status problem is a typed refusal, never an
 * exception. Only a malformed caller contract (shape, counters, clock or
 * staleness bound) throws. `operatorDecisionCount` is carried, never a blocker.
 */
export function deriveOwnersAvailability(state, { now, stalenessMs } = {}) {
  exactKeys(state, OWNERS_AVAILABILITY_STATE_KEYS, 'owners availability state');
  if (!Number.isSafeInteger(stalenessMs) || stalenessMs < 1) {
    throw new Error('owners availability requires a positive staleness bound in milliseconds');
  }
  const observedAt = instantFrom(now, 'owners availability').getTime();
  exactKeys(state.bindings, BINDINGS_KEYS, 'owners availability bindings');
  countOf(state.unreadTargetedWakes, 'owners availability unreadTargetedWakes');
  countOf(state.operatorDecisionCount, 'owners availability operatorDecisionCount');
  validateSignals(state.activeSignals, 'owners availability activeSignals');
  if (state.lastActivityMarker !== null
      && (typeof state.lastActivityMarker !== 'string'
        || !ACTIVITY_MARKER.test(state.lastActivityMarker))) {
    throw new Error('owners availability lastActivityMarker must be null or one bounded token');
  }
  if (!Array.isArray(state.ownerTasks)) {
    throw new Error('owners availability ownerTasks must be an array');
  }
  const refuse = (reason) => ({ available: false, reason, idleEpochId: null });

  if (BINDINGS_KEYS.some((key) => typeof state.bindings[key] !== 'string'
      || !SHA256.test(state.bindings[key]))) {
    return refuse('bindings_unknown');
  }
  for (const task of state.ownerTasks) {
    const reason = ownerTaskReason(task);
    if (reason) return refuse(reason);
  }
  for (const machine of OWNER_MACHINES) {
    const matches = state.ownerTasks.filter((task) => task.machine === machine);
    if (matches.length === 0) return refuse('owner_task_missing');
    if (matches.length > 1) return refuse('owner_task_conflicting');
  }
  if (state.ownerTasks.some((task) => task.status === 'active')) return refuse('owner_task_busy');
  if (state.ownerTasks.some((task) => task.status === 'unknown')) {
    return refuse('owner_task_unknown');
  }
  if (state.ownerTasks.some((task) => {
    const age = observedAt - Date.parse(task.observedAt);
    return age < 0 || age > stalenessMs;
  })) {
    return refuse('owner_task_stale');
  }
  if (state.unreadTargetedWakes > 0) return refuse('unread_wakes');
  if (state.activeSignals.length > 0) return refuse('active_signals');
  return { available: true, reason: null, idleEpochId: idleEpochIdFrom(state) };
}

export function ownersAvailableMessage(operatorDecisionCount) {
  countOf(operatorDecisionCount, 'operatorDecisionCount');
  return operatorDecisionCount > 0
    ? `${OWNERS_AVAILABLE_MESSAGE} Также ждут вашего решения: ${operatorDecisionCount}.`
    : OWNERS_AVAILABLE_MESSAGE;
}

export function validateIdleEpochReceipt(receipt) {
  exactKeys(receipt, IDLE_EPOCH_RECEIPT_KEYS, 'idle epoch receipt');
  if (receipt.schema !== IDLE_EPOCH_RECEIPT_SCHEMA) {
    throw new Error('idle epoch receipt schema is invalid');
  }
  if (typeof receipt.idleEpochId !== 'string' || !SHA256.test(receipt.idleEpochId)) {
    throw new Error('idle epoch receipt idleEpochId is invalid');
  }
  if (typeof receipt.emittedAt !== 'string'
      || !CANONICAL_INSTANT.test(receipt.emittedAt)
      || Number.isNaN(Date.parse(receipt.emittedAt))) {
    throw new Error('idle epoch receipt emittedAt must be canonical UTC milliseconds');
  }
  if (receipt.idempotencyKey !== `owners-available:${receipt.idleEpochId}`) {
    throw new Error('idle epoch receipt idempotencyKey does not bind its idle epoch');
  }
  if (!DELIVERY_STATES.includes(receipt.deliveryState)) {
    throw new Error('idle epoch receipt deliveryState is invalid');
  }
  return receipt;
}

/**
 * One-shot per idle epoch. The receipt is the whole memory: an epoch that
 * already has one is never re-sent, and that includes an ambiguous delivery —
 * an unclear outcome is never blindly retried, because a duplicate ping costs
 * more than a missed one. Availability going false re-arms the next edge
 * implicitly, since the following idle stretch is a different epoch.
 */
export function availabilityTransition({
  previousReceipt = null,
  availability,
  operatorDecisionCount,
}) {
  exactKeys(availability, AVAILABILITY_KEYS, 'availability');
  countOf(operatorDecisionCount, 'operatorDecisionCount');
  if (typeof availability.available !== 'boolean') {
    throw new Error('availability available must be a boolean');
  }
  if (previousReceipt !== null) validateIdleEpochReceipt(previousReceipt);
  const quiet = { emit: false, message: null, idempotencyKey: null };
  if (!availability.available) return quiet;
  if (typeof availability.idleEpochId !== 'string' || !SHA256.test(availability.idleEpochId)) {
    throw new Error('an available state requires one exact idle epoch id');
  }
  if (previousReceipt && previousReceipt.idleEpochId === availability.idleEpochId) return quiet;
  return {
    emit: true,
    message: ownersAvailableMessage(operatorDecisionCount),
    idempotencyKey: `owners-available:${availability.idleEpochId}`,
  };
}

export function idleEpochReceiptPath(dataRoot) {
  if (typeof dataRoot !== 'string' || !path.isAbsolute(dataRoot)) {
    throw new Error('idle epoch receipt dataRoot must be an absolute path');
  }
  return path.join(dataRoot, IDLE_EPOCH_RECEIPT_FILENAME);
}

export function writeIdleEpochReceipt(dataRoot, receipt, { fs = null } = {}) {
  const target = idleEpochReceiptPath(dataRoot);
  validateIdleEpochReceipt(receipt);
  const io = {
    mkdirSync, openSync, writeSync, fsyncSync, closeSync, renameSync, rmSync, ...(fs ?? {}),
  };
  io.mkdirSync(dataRoot, { recursive: true, mode: 0o700 });
  const temporary = `${target}.${randomBytes(8).toString('hex')}.tmp`;
  let descriptor;
  try {
    descriptor = io.openSync(temporary, 'wx', 0o600);
    io.writeSync(descriptor, `${JSON.stringify(receipt, null, 2)}\n`);
    io.fsyncSync(descriptor);
    io.closeSync(descriptor);
    descriptor = undefined;
    io.renameSync(temporary, target);
  } catch (error) {
    if (descriptor !== undefined) {
      try {
        io.closeSync(descriptor);
      } catch {
        // The descriptor is already unusable; the staged file is removed below.
      }
    }
    io.rmSync(temporary, { force: true });
    throw error;
  }
  return target;
}

/**
 * Absent means "no message was ever emitted for any epoch" and is the only
 * quiet miss. A receipt that cannot be read is NOT deleted and NOT treated as
 * absent: unlike a capability probe, where a miss costs one extra probe, losing
 * this suppression record costs the operator a duplicate message, so the pass
 * stops instead.
 */
export function readIdleEpochReceipt(dataRoot) {
  const target = idleEpochReceiptPath(dataRoot);
  let text;
  try {
    text = readFileSync(target, 'utf8');
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('idle epoch receipt is unreadable and was not removed');
  }
  return validateIdleEpochReceipt(parsed);
}
