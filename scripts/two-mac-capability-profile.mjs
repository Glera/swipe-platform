// Host-local reviewer capability profile: one durable record that a specific
// local review capability was already probed on this machine — CLI executable
// and version, runner and command-contract digests, model, effort, tool and
// permission envelope, supported schema digest and config digest.
//
// The profile can skip only a repeated capability probe, never a code review or
// signature. It carries no review outcome and no authority: a verdict-like
// field makes the file malformed, and a malformed file is deleted rather than
// read. Every identity field must match the expectation exactly, the record
// lives at most 24 hours, and a miss is a typed result, never an error — the
// caller simply probes again.
//
// This module is host-local storage only. It has no transport, no CLI and no
// bridge integration; owner sessions call it directly.

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

export const CAPABILITY_PROFILE_SCHEMA = 'two-mac.capability-profile.v1';
export const CAPABILITY_PROFILE_FILENAME = 'capability-profile.v1.json';
export const CAPABILITY_PROFILE_MAX_TTL_MS = 24 * 60 * 60 * 1000;

const CAPABILITY_EFFORTS = Object.freeze(['low', 'medium', 'high', 'xhigh', 'max']);

const SHA256 = /^[0-9a-f]{64}$/u;
const CLI_VERSION = /^[A-Za-z0-9][A-Za-z0-9._+-]{0,63}$/u;
const MODEL_ID = /^[a-z0-9][a-z0-9._-]{2,63}$/u;
const TOOL_NAME = /^[A-Za-z][A-Za-z0-9_.:-]{0,63}$/u;
const PERMISSION_ENVELOPE = /^[a-z][a-z0-9_-]{2,63}$/u;
const CANONICAL_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
// A capability record can never carry a review outcome. This is checked before
// the exact-key contract so the reason is typed instead of "unexpected field".
const VERDICT_LIKE_KEY = /verdict|finding|review|approv|signature|disposition|blocking/iu;

const CAPABILITY_IDENTITY_KEYS = Object.freeze([
  'cliExecutable',
  'cliVersion',
  'commandContractDigest',
  'configDigest',
  'effort',
  'machineBindingDigest',
  'model',
  'permissionEnvelope',
  'runnerDigest',
  'supportedSchemaDigest',
  'toolsEnvelope',
]);

const CAPABILITY_PROFILE_KEYS = Object.freeze([
  ...CAPABILITY_IDENTITY_KEYS,
  'expiresAt',
  'profileDigest',
  'recordedAt',
  'schema',
].sort());

const CAPABILITY_PROFILE_INPUT_KEYS = Object.freeze([
  ...CAPABILITY_IDENTITY_KEYS,
  'expiresAt',
].sort());

const TOOLS_ENVELOPE_LIMIT = 64;

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

function expectedProfileDigest(profile) {
  return sha256(canonicalJson(Object.fromEntries(
    Object.entries(profile).filter(([key]) => key !== 'profileDigest'),
  )));
}

function instantFrom(now, label) {
  if (typeof now !== 'function') throw new Error(`${label} requires an injected now() clock`);
  const value = now();
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`${label} clock must return a valid Date`);
  }
  return value;
}

function snakeReason(prefix, key) {
  return `${prefix}_${key.replace(/[A-Z]/gu, (letter) => `_${letter.toLowerCase()}`)}`;
}

function toolsEnvelopeReason(value) {
  if (!Array.isArray(value) || value.length > TOOLS_ENVELOPE_LIMIT) return 'invalid_tools_envelope';
  if (value.some((tool) => typeof tool !== 'string' || !TOOL_NAME.test(tool))) {
    return 'invalid_tools_envelope';
  }
  if (new Set(value).size !== value.length) return 'invalid_tools_envelope';
  const sorted = [...value].sort();
  if (sorted.some((tool, index) => tool !== value[index])) return 'invalid_tools_envelope';
  return null;
}

function fieldReason(profile) {
  for (const key of ['machineBindingDigest', 'runnerDigest', 'commandContractDigest',
    'supportedSchemaDigest', 'configDigest']) {
    if (typeof profile[key] !== 'string' || !SHA256.test(profile[key])) {
      return snakeReason('invalid', key);
    }
  }
  if (typeof profile.cliExecutable !== 'string'
      || !profile.cliExecutable.startsWith('/')
      || profile.cliExecutable.length > 1_024
      || /[\0\r\n]/u.test(profile.cliExecutable)
      || profile.cliExecutable.split('/').includes('..')) {
    return 'invalid_cli_executable';
  }
  if (typeof profile.cliVersion !== 'string' || !CLI_VERSION.test(profile.cliVersion)) {
    return 'invalid_cli_version';
  }
  if (typeof profile.model !== 'string' || !MODEL_ID.test(profile.model)) return 'invalid_model';
  if (!CAPABILITY_EFFORTS.includes(profile.effort)) return 'invalid_effort';
  const tools = toolsEnvelopeReason(profile.toolsEnvelope);
  if (tools) return tools;
  if (typeof profile.permissionEnvelope !== 'string'
      || !PERMISSION_ENVELOPE.test(profile.permissionEnvelope)) {
    return 'invalid_permission_envelope';
  }
  for (const key of ['recordedAt', 'expiresAt']) {
    if (typeof profile[key] !== 'string'
        || !CANONICAL_INSTANT.test(profile[key])
        || Number.isNaN(Date.parse(profile[key]))) {
      return snakeReason('invalid', key);
    }
  }
  if (typeof profile.profileDigest !== 'string' || !SHA256.test(profile.profileDigest)) {
    return 'invalid_profile_digest';
  }
  if (profile.profileDigest !== expectedProfileDigest(profile)) return 'digest_mismatch';
  return null;
}

export function capabilityIdentity(profile) {
  return Object.fromEntries(CAPABILITY_IDENTITY_KEYS.map((key) => [key, profile?.[key]]));
}

/**
 * Total content validation: never throws for a bad record, so a corrupted or
 * stale file is a typed miss instead of a crash. It still throws when the
 * caller's own expectation or clock is malformed — that is a programming error,
 * not a cache miss.
 */
export function validateCapabilityProfile(profile, expectedIdentity, { now } = {}) {
  exactKeys(expectedIdentity, CAPABILITY_IDENTITY_KEYS, 'capability profile expected identity');
  const observedAt = instantFrom(now, 'capability profile validation').getTime();
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    return { valid: false, reason: 'malformed' };
  }
  if (Object.keys(profile).some((key) => VERDICT_LIKE_KEY.test(key))) {
    return { valid: false, reason: 'verdict_like_field' };
  }
  try {
    exactKeys(profile, CAPABILITY_PROFILE_KEYS, 'capability profile');
  } catch {
    return { valid: false, reason: 'malformed' };
  }
  if (profile.schema !== CAPABILITY_PROFILE_SCHEMA) return { valid: false, reason: 'wrong_schema' };
  const invalidField = fieldReason(profile);
  if (invalidField) return { valid: false, reason: invalidField };

  const recordedAt = Date.parse(profile.recordedAt);
  const expiresAt = Date.parse(profile.expiresAt);
  if (expiresAt <= recordedAt) return { valid: false, reason: 'ttl_not_positive' };
  if (expiresAt - recordedAt > CAPABILITY_PROFILE_MAX_TTL_MS) {
    return { valid: false, reason: 'ttl_exceeded' };
  }
  if (recordedAt > observedAt) return { valid: false, reason: 'recorded_in_future' };
  if (expiresAt <= observedAt) return { valid: false, reason: 'expired' };

  for (const key of CAPABILITY_IDENTITY_KEYS) {
    if (canonicalJson(profile[key]) !== canonicalJson(expectedIdentity[key])) {
      return { valid: false, reason: snakeReason('mismatch', key) };
    }
  }
  return { valid: true };
}

export function createCapabilityProfile(input, { now } = {}) {
  exactKeys(input, CAPABILITY_PROFILE_INPUT_KEYS, 'capability profile input');
  const recordedAt = instantFrom(now, 'capability profile creation').toISOString();
  const profile = {
    schema: CAPABILITY_PROFILE_SCHEMA,
    machineBindingDigest: input.machineBindingDigest,
    cliExecutable: input.cliExecutable,
    cliVersion: input.cliVersion,
    runnerDigest: input.runnerDigest,
    commandContractDigest: input.commandContractDigest,
    model: input.model,
    effort: input.effort,
    toolsEnvelope: Array.isArray(input.toolsEnvelope)
      ? [...input.toolsEnvelope]
      : input.toolsEnvelope,
    permissionEnvelope: input.permissionEnvelope,
    supportedSchemaDigest: input.supportedSchemaDigest,
    configDigest: input.configDigest,
    recordedAt,
    expiresAt: input.expiresAt,
    profileDigest: '',
  };
  profile.profileDigest = expectedProfileDigest(profile);
  const verdict = validateCapabilityProfile(profile, capabilityIdentity(profile), { now });
  if (!verdict.valid) throw new Error(`capability profile is invalid: ${verdict.reason}`);
  return profile;
}

export function capabilityProfilePath(dataRoot) {
  if (typeof dataRoot !== 'string' || !path.isAbsolute(dataRoot)) {
    throw new Error('capability profile dataRoot must be an absolute path');
  }
  return path.join(dataRoot, CAPABILITY_PROFILE_FILENAME);
}

export function writeCapabilityProfile(dataRoot, profile, { fs = null } = {}) {
  const target = capabilityProfilePath(dataRoot);
  // Writing never re-decides freshness: the record is validated against its own
  // recorded instant, so only a structurally broken profile is refused here.
  const recordedAt = typeof profile?.recordedAt === 'string' ? Date.parse(profile.recordedAt) : NaN;
  if (!Number.isFinite(recordedAt)) {
    throw new Error('refusing to write capability profile: malformed');
  }
  const verdict = validateCapabilityProfile(
    profile,
    capabilityIdentity(profile),
    { now: () => new Date(recordedAt) },
  );
  if (!verdict.valid) throw new Error(`refusing to write capability profile: ${verdict.reason}`);
  const io = {
    mkdirSync, openSync, writeSync, fsyncSync, closeSync, renameSync, rmSync, ...(fs ?? {}),
  };
  io.mkdirSync(dataRoot, { recursive: true, mode: 0o700 });
  const temporary = `${target}.${randomBytes(8).toString('hex')}.tmp`;
  let descriptor;
  try {
    descriptor = io.openSync(temporary, 'wx', 0o600);
    io.writeSync(descriptor, `${JSON.stringify(profile, null, 2)}\n`);
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
 * A miss is never an error. Any file that is not an exact, live, matching
 * capability record is deleted so the next call re-probes instead of reasoning
 * about a stale record.
 */
export function readCapabilityProfile(dataRoot, expectedIdentity, { now } = {}) {
  const target = capabilityProfilePath(dataRoot);
  exactKeys(expectedIdentity, CAPABILITY_IDENTITY_KEYS, 'capability profile expected identity');
  let text;
  try {
    text = readFileSync(target, 'utf8');
  } catch (error) {
    return { profile: null, reason: error?.code === 'ENOENT' ? 'absent' : 'unreadable' };
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    rmSync(target, { force: true });
    return { profile: null, reason: 'malformed' };
  }
  const verdict = validateCapabilityProfile(parsed, expectedIdentity, { now });
  if (!verdict.valid) {
    rmSync(target, { force: true });
    return { profile: null, reason: verdict.reason };
  }
  return { profile: parsed, reason: null };
}
