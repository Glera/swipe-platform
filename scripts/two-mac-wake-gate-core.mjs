import { createHash, randomBytes } from 'node:crypto';
import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeSync,
} from 'node:fs';
import path from 'node:path';

import {
  projectMachineBindingState,
  sha256,
} from './two-mac-bridge-contract.mjs';
import { scanControlWakeComments } from './two-mac-bridge.mjs';

export const WAKE_GATE_CONFIG_SCHEMA = 'two-mac.wake-gate.config.v1';
export const WAKE_GATE_STATE_SCHEMA = 'two-mac.wake-gate.state.v1';
export const WAKE_GATE_PAYLOAD_SCHEMA = 'two-mac.wake-gate.payload.v1';
export const WAKE_GATE_TICK_SCHEMA = 'two-mac.wake-gate.tick.v1';

export const DEFAULT_PAGE_SIZE = 100;
export const DEFAULT_MAX_PAGES = 10;
export const DEFAULT_ROTATION_COMMENT_THRESHOLD = 400;
export const MAX_COMMENT_BODY_BYTES = 64 * 1024;
export const MAX_CACHED_COMMENTS = 2_000;
export const MAX_CACHED_BODY_BYTES = 16 * 1024 * 1024;
export const HANDLED_WAKE_LIMIT = 128;

const SHA256 = /^[0-9a-f]{64}$/u;
const GIT_SHA = /^[0-9a-f]{40}$/u;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;
const COMMENT_ID = /^(?:0|[1-9][0-9]{0,31})$/u;
const CANONICAL_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const SAFE_NOTIFICATION_KEY = /^[A-Za-z0-9_.:@/+ -]{1,240}$/u;
const RETAINED_MARKER = /<!--\s*two-mac-bridge-(?:control-wake|machine-binding|machine-hold):v1\b/u;

const CONFIG_KEYS = Object.freeze([
  'codexExecutable',
  'codexHome',
  'codexSessionId',
  'controlIssue',
  'enabled',
  'ghExecutable',
  'intakeDrainConfigPath',
  'initialConsumedWakeCommentId',
  'initialScannedCommentId',
  'machine',
  'maxPages',
  'metaCheckout',
  'notificationTitle',
  'pageSize',
  'repo',
  'rotationCommentThreshold',
  'schema',
  'trustedCommentAuthorIds',
  'workspaceDir',
].sort());

const COMMENT_KEYS = Object.freeze([
  'authorId', 'body', 'createdAt', 'htmlUrl', 'id', 'oversize', 'updatedAt',
].sort());

const STATE_KEYS = Object.freeze([
  'attention',
  'comments',
  'handledWakeIds',
  'lastConsumedWakeCommentId',
  'lastFetchedAt',
  'lastScannedCommentId',
  'machine',
  'notifiedKeys',
  'pending',
  'schema',
].sort());

const PENDING_KEYS = Object.freeze([
  'commentId',
  'commentUrl',
  'createdAt',
  'payloadPath',
  'payloadSha256',
  'promptSha256',
  'startedAt',
  'status',
  'wakeId',
].sort());

const ATTENTION_KEYS = Object.freeze([
  'code', 'commentId', 'commentUrl', 'createdAt', 'wakeId',
].sort());

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

function assertAbsolute(value, label) {
  if (typeof value !== 'string' || !path.isAbsolute(value) || /[\0\r\n]/u.test(value)
      || value.split('/').includes('..')) {
    throw new Error(`${label} must be one absolute normalized path`);
  }
}

function assertInstant(value, label) {
  if (typeof value !== 'string' || !CANONICAL_INSTANT.test(value)
      || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be one canonical UTC instant`);
  }
}

function assertCommentId(value, label) {
  if (typeof value !== 'string' || !COMMENT_ID.test(value)) {
    throw new Error(`${label} must be one decimal comment id`);
  }
}

function assertMode0600(filePath, label) {
  const mode = statSync(filePath).mode & 0o777;
  if (mode !== 0o600) throw new Error(`${label} must have mode 0600`);
}

export function validateWakeGateConfig(config) {
  exactKeys(config, CONFIG_KEYS, 'wake gate config');
  if (config.schema !== WAKE_GATE_CONFIG_SCHEMA) throw new Error('wake gate config schema is invalid');
  if (!['mac-a', 'mac-b'].includes(config.machine)) throw new Error('wake gate config machine is invalid');
  if (config.repo !== 'Glera/p4g-workspace-meta' || !REPOSITORY.test(config.repo)) {
    throw new Error('wake gate config repository is not allowlisted');
  }
  if (!Number.isSafeInteger(config.controlIssue) || config.controlIssue < 1) {
    throw new Error('wake gate config controlIssue is invalid');
  }
  if (typeof config.enabled !== 'boolean') throw new Error('wake gate config enabled is invalid');
  for (const [key, label] of [
    ['ghExecutable', 'ghExecutable'],
    ['codexExecutable', 'codexExecutable'],
    ['codexHome', 'codexHome'],
    ['metaCheckout', 'metaCheckout'],
    ['workspaceDir', 'workspaceDir'],
  ]) assertAbsolute(config[key], `wake gate config ${label}`);
  if (config.intakeDrainConfigPath !== null) {
    assertAbsolute(config.intakeDrainConfigPath, 'wake gate config intakeDrainConfigPath');
  }
  if (!UUID.test(config.codexSessionId)) throw new Error('wake gate config codexSessionId is invalid');
  assertCommentId(config.initialScannedCommentId, 'wake gate config initialScannedCommentId');
  assertCommentId(
    config.initialConsumedWakeCommentId,
    'wake gate config initialConsumedWakeCommentId',
  );
  if (BigInt(config.initialConsumedWakeCommentId) > BigInt(config.initialScannedCommentId)) {
    throw new Error('wake gate config initial consumed cursor exceeds scanned cursor');
  }
  if (!Array.isArray(config.trustedCommentAuthorIds)
      || config.trustedCommentAuthorIds.length < 1
      || config.trustedCommentAuthorIds.length > 8
      || config.trustedCommentAuthorIds.some(
        (value) => typeof value !== 'string' || !/^[1-9][0-9]{0,31}$/u.test(value),
      )
      || new Set(config.trustedCommentAuthorIds).size !== config.trustedCommentAuthorIds.length) {
    throw new Error('wake gate config trustedCommentAuthorIds is invalid');
  }
  if (!Number.isSafeInteger(config.pageSize) || config.pageSize < 1 || config.pageSize > 100) {
    throw new Error('wake gate config pageSize is invalid');
  }
  if (!Number.isSafeInteger(config.maxPages) || config.maxPages < 1 || config.maxPages > 50) {
    throw new Error('wake gate config maxPages is invalid');
  }
  if (!Number.isSafeInteger(config.rotationCommentThreshold)
      || config.rotationCommentThreshold < 100
      || config.rotationCommentThreshold > MAX_CACHED_COMMENTS) {
    throw new Error('wake gate config rotationCommentThreshold is invalid');
  }
  if (typeof config.notificationTitle !== 'string'
      || !SAFE_NOTIFICATION_KEY.test(config.notificationTitle)) {
    throw new Error('wake gate config notificationTitle is invalid');
  }
  return config;
}

export function readWakeGateConfig(configPath) {
  assertAbsolute(configPath, 'wake gate config path');
  assertMode0600(configPath, 'wake gate config');
  let config;
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    throw new Error('wake gate config is unreadable');
  }
  return validateWakeGateConfig(config);
}

export function taskDigestForSession(sessionId) {
  if (typeof sessionId !== 'string' || !UUID.test(sessionId)) {
    throw new Error('wake gate session id is invalid');
  }
  return sha256(`codex-thread-v1\0${sessionId}`);
}

export function initialWakeGateState(
  machine,
  { lastScannedCommentId = '0', lastConsumedWakeCommentId = '0' } = {},
) {
  if (!['mac-a', 'mac-b'].includes(machine)) throw new Error('wake gate state machine is invalid');
  assertCommentId(lastScannedCommentId, 'wake gate initial scanned cursor');
  assertCommentId(lastConsumedWakeCommentId, 'wake gate initial consumed cursor');
  if (BigInt(lastConsumedWakeCommentId) > BigInt(lastScannedCommentId)) {
    throw new Error('wake gate initial consumed cursor exceeds scanned cursor');
  }
  return {
    schema: WAKE_GATE_STATE_SCHEMA,
    machine,
    lastScannedCommentId,
    lastConsumedWakeCommentId,
    lastFetchedAt: null,
    comments: [],
    pending: null,
    attention: null,
    handledWakeIds: [],
    notifiedKeys: [],
  };
}

function validateComment(comment) {
  exactKeys(comment, COMMENT_KEYS, 'wake gate cached comment');
  assertCommentId(comment.id, 'wake gate cached comment id');
  if (typeof comment.body !== 'string') throw new Error('wake gate cached comment body is invalid');
  if (typeof comment.authorId !== 'string' || !/^[1-9][0-9]{0,31}$/u.test(comment.authorId)) {
    throw new Error('wake gate cached comment authorId is invalid');
  }
  if (comment.htmlUrl !== null && (typeof comment.htmlUrl !== 'string'
      || !comment.htmlUrl.startsWith('https://github.com/'))) {
    throw new Error('wake gate cached comment htmlUrl is invalid');
  }
  assertInstant(comment.createdAt, 'wake gate cached comment createdAt');
  assertInstant(comment.updatedAt, 'wake gate cached comment updatedAt');
  if (typeof comment.oversize !== 'boolean') throw new Error('wake gate cached comment oversize is invalid');
}

function validatePending(pending) {
  if (pending === null) return;
  exactKeys(pending, PENDING_KEYS, 'wake gate pending');
  assertCommentId(pending.commentId, 'wake gate pending commentId');
  if (pending.commentUrl !== null && (typeof pending.commentUrl !== 'string'
      || !pending.commentUrl.startsWith('https://github.com/'))) {
    throw new Error('wake gate pending commentUrl is invalid');
  }
  if (!/^wake_[0-9a-f]{64}$/u.test(pending.wakeId)) throw new Error('wake gate pending wakeId is invalid');
  assertAbsolute(pending.payloadPath, 'wake gate pending payloadPath');
  if (!SHA256.test(pending.payloadSha256) || !SHA256.test(pending.promptSha256)) {
    throw new Error('wake gate pending hash is invalid');
  }
  if (!['queued', 'started', 'outcome_unknown'].includes(pending.status)) {
    throw new Error('wake gate pending status is invalid');
  }
  assertInstant(pending.createdAt, 'wake gate pending createdAt');
  if (pending.startedAt !== null) assertInstant(pending.startedAt, 'wake gate pending startedAt');
  if (pending.status === 'queued' && pending.startedAt !== null) {
    throw new Error('queued wake gate pending cannot have startedAt');
  }
  if (pending.status !== 'queued' && pending.startedAt === null) {
    throw new Error('started wake gate pending requires startedAt');
  }
}

function validateAttention(attention) {
  if (attention === null) return;
  exactKeys(attention, ATTENTION_KEYS, 'wake gate attention');
  if (typeof attention.code !== 'string' || !/^[a-z][a-z0-9_]{2,95}$/u.test(attention.code)) {
    throw new Error('wake gate attention code is invalid');
  }
  assertCommentId(attention.commentId, 'wake gate attention commentId');
  if (attention.commentUrl !== null && (typeof attention.commentUrl !== 'string'
      || !attention.commentUrl.startsWith('https://github.com/'))) {
    throw new Error('wake gate attention commentUrl is invalid');
  }
  if (attention.wakeId !== null && !/^wake_[0-9a-f]{64}$/u.test(attention.wakeId)) {
    throw new Error('wake gate attention wakeId is invalid');
  }
  assertInstant(attention.createdAt, 'wake gate attention createdAt');
}

export function validateWakeGateState(state, machine) {
  exactKeys(state, STATE_KEYS, 'wake gate state');
  if (state.schema !== WAKE_GATE_STATE_SCHEMA || state.machine !== machine) {
    throw new Error('wake gate state identity is invalid');
  }
  assertCommentId(state.lastScannedCommentId, 'wake gate state lastScannedCommentId');
  assertCommentId(state.lastConsumedWakeCommentId, 'wake gate state lastConsumedWakeCommentId');
  if (BigInt(state.lastConsumedWakeCommentId) > BigInt(state.lastScannedCommentId)) {
    throw new Error('wake gate consumed cursor exceeds scanned cursor');
  }
  if (state.lastFetchedAt !== null) assertInstant(state.lastFetchedAt, 'wake gate state lastFetchedAt');
  if (!Array.isArray(state.comments) || state.comments.length > MAX_CACHED_COMMENTS) {
    throw new Error('wake gate state comments are invalid');
  }
  state.comments.forEach(validateComment);
  const sortedIds = [...state.comments].sort(
    (left, right) => (BigInt(left.id) < BigInt(right.id) ? -1 : 1),
  ).map((comment) => comment.id);
  if (sortedIds.some((id, index) => id !== state.comments[index].id)
      || new Set(sortedIds).size !== sortedIds.length) {
    throw new Error('wake gate state comments must be unique and sorted');
  }
  validatePending(state.pending);
  validateAttention(state.attention);
  for (const [key, values] of [
    ['handledWakeIds', state.handledWakeIds],
    ['notifiedKeys', state.notifiedKeys],
  ]) {
    if (!Array.isArray(values) || values.length > HANDLED_WAKE_LIMIT
        || values.some((value) => typeof value !== 'string' || value.length > 240)
        || new Set(values).size !== values.length) {
      throw new Error(`wake gate state ${key} is invalid`);
    }
  }
  return state;
}

export function readWakeGateState(statePath, machine, initialCursors = {}) {
  try {
    const state = JSON.parse(readFileSync(statePath, 'utf8'));
    return validateWakeGateState(state, machine);
  } catch (error) {
    if (error?.code === 'ENOENT') return initialWakeGateState(machine, initialCursors);
    throw new Error(`wake gate state is unreadable: ${error.message}`);
  }
}

export function atomicWriteJson(target, value, { fs = null } = {}) {
  const io = {
    closeSync, fsyncSync, mkdirSync, openSync, renameSync, rmSync, writeSync,
    ...(fs ?? {}),
  };
  io.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = `${target}.${randomBytes(8).toString('hex')}.tmp`;
  let descriptor;
  try {
    descriptor = io.openSync(temporary, 'wx', 0o600);
    io.writeSync(descriptor, `${JSON.stringify(value, null, 2)}\n`);
    io.fsyncSync(descriptor);
    io.closeSync(descriptor);
    descriptor = undefined;
    io.renameSync(temporary, target);
    const directory = io.openSync(path.dirname(target), 'r');
    try { io.fsyncSync(directory); } finally { io.closeSync(directory); }
  } catch (error) {
    if (descriptor !== undefined) {
      try { io.closeSync(descriptor); } catch { /* already unusable */ }
    }
    io.rmSync(temporary, { force: true });
    throw error;
  }
}

export function compactGitHubComment(raw, lastScannedCommentId) {
  const id = String(raw?.id ?? '');
  assertCommentId(id, 'GitHub comment id');
  const body = typeof raw?.body === 'string' ? raw.body : '';
  const bytes = Buffer.byteLength(body);
  const oversize = bytes > MAX_COMMENT_BODY_BYTES;
  const isNew = BigInt(id) > BigInt(lastScannedCommentId);
  const retained = !oversize && (RETAINED_MARKER.test(body) || isNew) ? body : '';
  const createdAt = new Date(raw?.created_at ?? raw?.createdAt ?? NaN).toISOString();
  const updatedAt = new Date(raw?.updated_at ?? raw?.updatedAt ?? NaN).toISOString();
  assertInstant(createdAt, 'GitHub comment createdAt');
  assertInstant(updatedAt, 'GitHub comment updatedAt');
  const htmlUrl = raw?.html_url ?? raw?.htmlUrl ?? null;
  const authorId = String(raw?.user?.id ?? raw?.authorId ?? '');
  const comment = { id, authorId, body: retained, htmlUrl, createdAt, updatedAt, oversize };
  validateComment(comment);
  return comment;
}

export function mergeCompactComments(existing, incoming) {
  const merged = new Map(existing.map((comment) => [comment.id, comment]));
  for (const comment of incoming) {
    const prior = merged.get(comment.id);
    if (prior && (prior.updatedAt !== comment.updatedAt
        || (prior.body && comment.body && prior.body !== comment.body))) {
      throw new Error(`append-only control comment changed: ${comment.id}`);
    }
    merged.set(comment.id, prior?.body && !comment.body ? prior : comment);
  }
  const result = [...merged.values()].sort(
    (left, right) => (BigInt(left.id) < BigInt(right.id) ? -1 : 1),
  );
  if (result.length > MAX_CACHED_COMMENTS) throw new Error('control comment cache exceeds its bound');
  if (result.reduce((total, comment) => total + Buffer.byteLength(comment.body), 0)
      > MAX_CACHED_BODY_BYTES) {
    throw new Error('control comment body cache exceeds its bound');
  }
  return result;
}

export async function fetchCompactComments({
  listPage,
  existing,
  lastFetchedAt,
  lastScannedCommentId,
  pageSize = DEFAULT_PAGE_SIZE,
  maxPages = DEFAULT_MAX_PAGES,
}) {
  // Always read the complete bounded append-only Issue. GitHub's `since`
  // cursor is based on updated_at and can skip a lagged creation; exact wake
  // delivery is more important than saving three small pages.
  const since = null;
  let comments = [];
  let completed = false;
  let maximumUpdatedAt = lastFetchedAt;
  for (let page = 1; page <= maxPages; page += 1) {
    const rawPage = await listPage({ page, pageSize, since });
    if (!Array.isArray(rawPage) || rawPage.length > pageSize) {
      throw new Error('GitHub comment page is invalid');
    }
    const compact = rawPage.map((comment) => compactGitHubComment(comment, lastScannedCommentId));
    comments = mergeCompactComments(comments, compact);
    for (const comment of compact) {
      if (maximumUpdatedAt === null || Date.parse(comment.updatedAt) > Date.parse(maximumUpdatedAt)) {
        maximumUpdatedAt = comment.updatedAt;
      }
    }
    if (rawPage.length < pageSize) {
      completed = true;
      break;
    }
  }
  if (!completed) throw new Error('GitHub comment pagination exceeded its bound');
  const freshById = new Map(comments.map((comment) => [comment.id, comment]));
  for (const prior of existing) {
    const fresh = freshById.get(prior.id);
    if (!fresh) throw new Error(`append-only control comment disappeared: ${prior.id}`);
    if (fresh.updatedAt !== prior.updatedAt
        || fresh.authorId !== prior.authorId
        || (prior.body && fresh.body && prior.body !== fresh.body)) {
      throw new Error(`append-only control comment changed: ${prior.id}`);
    }
  }
  return { comments, lastFetchedAt: maximumUpdatedAt };
}

export function compactBodiesAfterScan(comments, lastScannedCommentId) {
  return comments.map((comment) => (
    BigInt(comment.id) <= BigInt(lastScannedCommentId)
      && comment.body
      && !RETAINED_MARKER.test(comment.body)
      ? { ...comment, body: '' }
      : comment
  ));
}

export function assertExactBoundSession({ config, comments, localBridgeCommit }) {
  if (!GIT_SHA.test(localBridgeCommit)) throw new Error('local bridge commit is invalid');
  const bindingState = projectMachineBindingState(
    config.controlIssue,
    comments.map((comment) => comment.body),
  );
  const localDigest = taskDigestForSession(config.codexSessionId);
  const binding = bindingState.active[config.machine];
  if (!binding || binding.taskDigest !== localDigest) {
    throw new Error(`exact active ${config.machine} task binding is required`);
  }
  if (binding.bridgeCommit !== localBridgeCommit) {
    throw new Error(`exact active ${config.machine} bridge binding is required`);
  }
  const immediateHeldTask = (machine, active) => {
    const candidates = bindingState.holds
      .filter((hold) => hold.machine === machine
        && hold.repositoryId === active?.repositoryId
        && Date.parse(hold.heldAt) < Date.parse(active?.registeredAt ?? ''))
      .sort((left, right) => Date.parse(right.heldAt) - Date.parse(left.heldAt));
    return candidates[0]?.taskDigest ?? null;
  };
  const acceptedTaskDigests = [...new Set([
    localDigest,
    immediateHeldTask(config.machine, binding),
  ].filter(Boolean))];
  const callbackBinding = config.machine === 'mac-b'
    ? bindingState.active['mac-a'] ?? null
    : null;
  const callbackTaskDigest = callbackBinding?.taskDigest ?? null;
  if (config.machine === 'mac-b' && !SHA256.test(String(callbackTaskDigest ?? ''))) {
    throw new Error('exact active mac-a callback binding is required');
  }
  const acceptedCallbackTaskDigests = config.machine === 'mac-b'
    ? [...new Set([
      callbackTaskDigest,
      immediateHeldTask('mac-a', callbackBinding),
    ].filter(Boolean))]
    : [null];
  return {
    taskDigest: localDigest,
    acceptedTaskDigests,
    callbackTaskDigest,
    acceptedCallbackTaskDigests,
    binding,
  };
}

export function assertTrustedMarkerAuthors(config, comments) {
  const trusted = new Set(config.trustedCommentAuthorIds);
  const untrusted = comments.find(
    (comment) => comment.body && RETAINED_MARKER.test(comment.body) && !trusted.has(comment.authorId),
  );
  if (untrusted) throw new Error(`untrusted bridge marker author at comment ${untrusted.id}`);
}

export function observeWakeGate({ config, state, comments, localBridgeCommit, now }) {
  validateWakeGateConfig(config);
  validateWakeGateState(state, config.machine);
  const observedAt = now().toISOString();
  assertInstant(observedAt, 'wake gate observation time');
  const oversize = comments.find(
    (comment) => comment.oversize && BigInt(comment.id) > BigInt(state.lastScannedCommentId),
  );
  if (oversize) {
    return {
      kind: 'attention',
      attention: {
        code: 'comment_body_oversize',
        commentId: oversize.id,
        commentUrl: oversize.htmlUrl,
        wakeId: null,
        createdAt: observedAt,
      },
      scan: null,
    };
  }
  assertTrustedMarkerAuthors(config, comments);
  const identity = assertExactBoundSession({ config, comments, localBridgeCommit });
  const scan = scanControlWakeComments({
    controlIssue: config.controlIssue,
    comments,
    machine: config.machine,
    taskDigest: identity.taskDigest,
    acceptedTaskDigests: identity.acceptedTaskDigests,
    callbackTaskDigest: identity.callbackTaskDigest,
    acceptedCallbackTaskDigests: identity.acceptedCallbackTaskDigests,
    lastScannedCommentId: state.lastScannedCommentId,
    lastConsumedWakeCommentId: state.lastConsumedWakeCommentId,
  });
  if (scan.attention.length > 0) {
    const item = scan.attention[0];
    return {
      kind: 'attention',
      attention: {
        code: item.code,
        commentId: item.commentId,
        commentUrl: item.commentUrl,
        wakeId: item.wakeId ?? null,
        createdAt: observedAt,
      },
      scan,
    };
  }
  if (scan.nextWake && scan.nextWake.action !== 'DISPATCH') {
    return {
      kind: 'attention',
      attention: {
        code: scan.nextWake.action === 'STOP' ? 'durable_stop' : 'operator_authority_required',
        commentId: scan.nextWake.commentId,
        commentUrl: scan.nextWake.commentUrl,
        wakeId: scan.nextWake.wake.wakeId,
        createdAt: observedAt,
      },
      scan,
    };
  }
  if (!scan.nextWake) return { kind: 'idle', attention: null, scan };
  if (state.handledWakeIds.includes(scan.nextWake.wake.wakeId)) {
    return { kind: 'deduped', attention: null, scan };
  }
  return { kind: 'dispatch', attention: null, scan };
}

export function createWakePayload({ config, nextWake, now }) {
  const payload = {
    schema: WAKE_GATE_PAYLOAD_SCHEMA,
    machine: config.machine,
    controlIssue: config.controlIssue,
    commentId: nextWake.commentId,
    commentUrl: nextWake.commentUrl,
    wake: nextWake.wake,
    receiptBody: nextWake.receiptBody,
    createdAt: now().toISOString(),
    payloadDigest: '',
  };
  payload.payloadDigest = sha256(canonicalJson({ ...payload, payloadDigest: '' }));
  return payload;
}

export function wakePrompt(payloadPath, payloadSha256) {
  assertAbsolute(payloadPath, 'wake payload path');
  if (!SHA256.test(payloadSha256)) throw new Error('wake payload hash is invalid');
  return [
    'Model-free two-Mac wake gate: process exactly one durable control wake.',
    `Read the local payload at ${payloadPath}.`,
    `Verify its exact file SHA-256 is ${payloadSha256} before following it.`,
    'Do not scan the full control Issue and do not infer authority beyond that payload.',
    'Preserve the existing machine ownership, review tier, standing-authority and operator-only boundaries.',
    'On a terminal result, publish the required atomic durable receipt+wake through the existing bridge contract.',
  ].join('\n');
}

export function preparePending({ config, nextWake, dataRoot, now }) {
  const payload = createWakePayload({ config, nextWake, now });
  const payloadPath = path.join(dataRoot, 'pending', `${payload.wake.wakeId}.json`);
  atomicWriteJson(payloadPath, payload);
  const payloadBytes = readFileSync(payloadPath);
  const payloadSha256 = createHash('sha256').update(payloadBytes).digest('hex');
  const prompt = wakePrompt(payloadPath, payloadSha256);
  const pending = {
    commentId: nextWake.commentId,
    commentUrl: nextWake.commentUrl,
    wakeId: payload.wake.wakeId,
    payloadPath,
    payloadSha256,
    promptSha256: sha256(prompt),
    status: 'queued',
    createdAt: now().toISOString(),
    startedAt: null,
  };
  validatePending(pending);
  return { pending, prompt, payload };
}

export function addBoundedUnique(values, value) {
  return [...values.filter((item) => item !== value), value].slice(-HANDLED_WAKE_LIMIT);
}

export function advanceIdleState(state, scan) {
  const acknowledged = scan.nextWake === null
    ? scan.cursors.acknowledgeAfterHandlingCommentId
    : null;
  const consumed = acknowledged ?? state.lastConsumedWakeCommentId;
  return {
    ...state,
    lastScannedCommentId: scan.cursors.lastScannedCommentId,
    lastConsumedWakeCommentId: consumed,
    comments: compactBodiesAfterScan(state.comments, scan.cursors.lastScannedCommentId),
  };
}

export function markDispatchStarted(state, now) {
  if (state.pending?.status !== 'queued') throw new Error('wake gate has no queued dispatch');
  return {
    ...state,
    pending: { ...state.pending, status: 'started', startedAt: now().toISOString() },
  };
}

export function markDispatchSucceeded(state) {
  if (state.pending?.status !== 'started') throw new Error('wake gate dispatch is not started');
  return {
    ...state,
    lastConsumedWakeCommentId: state.pending.commentId,
    handledWakeIds: addBoundedUnique(state.handledWakeIds, state.pending.wakeId),
    pending: null,
  };
}

export function markDispatchUnknown(state) {
  if (state.pending?.status !== 'started') throw new Error('wake gate dispatch is not started');
  return {
    ...state,
    pending: { ...state.pending, status: 'outcome_unknown' },
  };
}

export function rotationDue(config, comments) {
  return comments.length >= config.rotationCommentThreshold;
}
