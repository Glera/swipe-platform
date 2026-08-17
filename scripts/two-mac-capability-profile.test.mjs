import test from 'node:test';
import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  CAPABILITY_PROFILE_FILENAME,
  CAPABILITY_PROFILE_MAX_TTL_MS,
  canonicalJson,
  capabilityIdentity,
  capabilityProfilePath,
  createCapabilityProfile,
  readCapabilityProfile,
  sha256,
  validateCapabilityProfile,
  writeCapabilityProfile,
} from './two-mac-capability-profile.mjs';

const RECORDED_AT = '2026-08-17T09:00:00.000Z';
const CLOCK = () => new Date(RECORDED_AT);

function identity(overrides = {}) {
  return {
    machineBindingDigest: 'a'.repeat(64),
    cliExecutable: '/usr/local/bin/claude',
    cliVersion: '2.14.3',
    runnerDigest: 'b'.repeat(64),
    commandContractDigest: 'c'.repeat(64),
    model: 'claude-opus-5',
    effort: 'high',
    toolsEnvelope: ['Bash', 'Grep', 'Read'],
    permissionEnvelope: 'read_only_review',
    supportedSchemaDigest: 'd'.repeat(64),
    configDigest: 'e'.repeat(64),
    ...overrides,
  };
}

function expiresAt(offsetMs = 60 * 60 * 1000) {
  return new Date(Date.parse(RECORDED_AT) + offsetMs).toISOString();
}

function profile(overrides = {}, clock = CLOCK) {
  return createCapabilityProfile(
    { ...identity(), expiresAt: expiresAt(), ...overrides },
    { now: clock },
  );
}

function dataRoot() {
  return path.join(mkdtempSync(path.join(tmpdir(), 'two-mac-capability-')), 'state');
}

function at(offsetMs) {
  return () => new Date(Date.parse(RECORDED_AT) + offsetMs);
}

// A hand-written record that is internally consistent: the reader must still
// enforce the contract instead of trusting a well-formed self-hash.
function reseal({ profileDigest, ...rest }) {
  return { ...rest, profileDigest: sha256(canonicalJson(rest)) };
}

test('capability profile round-trips through create, atomic write and read', () => {
  const root = dataRoot();
  const record = profile();
  assert.equal(record.schema, 'two-mac.capability-profile.v1');
  assert.deepEqual(Object.keys(record).sort(), [
    'cliExecutable', 'cliVersion', 'commandContractDigest', 'configDigest', 'effort',
    'expiresAt', 'machineBindingDigest', 'model', 'permissionEnvelope', 'profileDigest',
    'recordedAt', 'runnerDigest', 'schema', 'supportedSchemaDigest', 'toolsEnvelope',
  ]);
  assert.equal(record.recordedAt, RECORDED_AT);

  const written = writeCapabilityProfile(root, record);
  assert.equal(written, capabilityProfilePath(root));
  assert.equal(path.basename(written), CAPABILITY_PROFILE_FILENAME);
  assert.equal(statSync(root).mode & 0o777, 0o700);
  assert.equal(statSync(written).mode & 0o777, 0o600);
  assert.deepEqual(readdirSync(root), [CAPABILITY_PROFILE_FILENAME]);
  assert.deepEqual(JSON.parse(readFileSync(written, 'utf8')), record);

  const hit = readCapabilityProfile(root, identity(), { now: at(30 * 60 * 1000) });
  assert.deepEqual(hit, { profile: record, reason: null });
  // A hit never consumes the record: the same live probe result is reusable.
  assert.equal(existsSync(written), true);
  assert.deepEqual(capabilityIdentity(record), identity());
});

test('every identity field mismatch is exactly one typed miss that deletes the record', () => {
  const mutations = [
    ['machineBindingDigest', '1'.repeat(64), 'mismatch_machine_binding_digest'],
    ['cliExecutable', '/opt/homebrew/bin/claude', 'mismatch_cli_executable'],
    ['cliVersion', '2.14.4', 'mismatch_cli_version'],
    ['runnerDigest', '2'.repeat(64), 'mismatch_runner_digest'],
    ['commandContractDigest', '3'.repeat(64), 'mismatch_command_contract_digest'],
    ['model', 'claude-sonnet-5', 'mismatch_model'],
    ['effort', 'medium', 'mismatch_effort'],
    ['toolsEnvelope', ['Bash', 'Grep'], 'mismatch_tools_envelope'],
    ['permissionEnvelope', 'write_review', 'mismatch_permission_envelope'],
    ['supportedSchemaDigest', '4'.repeat(64), 'mismatch_supported_schema_digest'],
    ['configDigest', '5'.repeat(64), 'mismatch_config_digest'],
  ];
  assert.equal(mutations.length, Object.keys(identity()).length);

  for (const [key, value, reason] of mutations) {
    const root = dataRoot();
    const record = profile();
    writeCapabilityProfile(root, record);
    const miss = readCapabilityProfile(root, identity({ [key]: value }), { now: CLOCK });
    assert.deepEqual(miss, { profile: null, reason }, `${key} must miss as ${reason}`);
    // The stale record is gone: a mismatch can never be reused later.
    assert.equal(existsSync(capabilityProfilePath(root)), false);
    assert.deepEqual(
      readCapabilityProfile(root, identity(), { now: CLOCK }),
      { profile: null, reason: 'absent' },
    );
  }
});

test('V31 budget gate: a changed configDigest costs exactly one new probe', () => {
  const root = dataRoot();
  const counter = { probes: 0 };
  const resolve = (current, clock = CLOCK) => {
    const hit = readCapabilityProfile(root, current, { now: clock });
    if (hit.profile) return { probed: false, reason: hit.reason };
    counter.probes += 1;
    writeCapabilityProfile(
      root,
      createCapabilityProfile({ ...current, expiresAt: expiresAt() }, { now: clock }),
    );
    return { probed: true, reason: hit.reason };
  };

  assert.deepEqual(resolve(identity()), { probed: true, reason: 'absent' });
  assert.deepEqual(resolve(identity()), { probed: false, reason: null });
  assert.deepEqual(resolve(identity()), { probed: false, reason: null });
  assert.equal(counter.probes, 1);

  // The real V31 failure: the review config changed, so the cached capability
  // is not evidence about the new one — one probe, then reuse again.
  const rotated = identity({ configDigest: 'f'.repeat(64) });
  assert.deepEqual(resolve(rotated), { probed: true, reason: 'mismatch_config_digest' });
  assert.deepEqual(resolve(rotated), { probed: false, reason: null });
  assert.deepEqual(resolve(rotated), { probed: false, reason: null });
  assert.equal(counter.probes, 2);
});

test('V33 schema rejection: a changed supportedSchemaDigest costs exactly one new probe', () => {
  const root = dataRoot();
  const before = identity();
  const after = identity({ supportedSchemaDigest: '9'.repeat(64) });
  writeCapabilityProfile(root, profile());

  // The real V33 failure: the runner rejected the record schema it had just
  // been told it supported. A schema move invalidates the cached capability.
  assert.deepEqual(
    readCapabilityProfile(root, after, { now: CLOCK }),
    { profile: null, reason: 'mismatch_supported_schema_digest' },
  );
  assert.equal(existsSync(capabilityProfilePath(root)), false);

  const reprobed = createCapabilityProfile({ ...after, expiresAt: expiresAt() }, { now: CLOCK });
  writeCapabilityProfile(root, reprobed);
  assert.deepEqual(
    readCapabilityProfile(root, after, { now: CLOCK }),
    { profile: reprobed, reason: null },
  );
  assert.deepEqual(
    readCapabilityProfile(root, before, { now: CLOCK }),
    { profile: null, reason: 'mismatch_supported_schema_digest' },
  );
});

test('the 24 hour cap is enforced when the record is created and when it is read', () => {
  assert.throws(
    () => profile({ expiresAt: expiresAt(CAPABILITY_PROFILE_MAX_TTL_MS + 1) }),
    /ttl_exceeded/u,
  );
  assert.throws(() => profile({ expiresAt: RECORDED_AT }), /ttl_not_positive/u);
  assert.doesNotThrow(() => profile({ expiresAt: expiresAt(CAPABILITY_PROFILE_MAX_TTL_MS) }));

  const root = dataRoot();
  const record = profile({ expiresAt: expiresAt(CAPABILITY_PROFILE_MAX_TTL_MS) });
  writeCapabilityProfile(root, record);
  assert.deepEqual(
    readCapabilityProfile(root, identity(), { now: at(CAPABILITY_PROFILE_MAX_TTL_MS - 1) }),
    { profile: record, reason: null },
  );

  // Expiry is strict: the exact expiry instant is already a miss, and the
  // expired record is deleted rather than reasoned about.
  assert.deepEqual(
    readCapabilityProfile(root, identity(), { now: at(CAPABILITY_PROFILE_MAX_TTL_MS) }),
    { profile: null, reason: 'expired' },
  );
  assert.equal(existsSync(capabilityProfilePath(root)), false);

  // A self-consistent record that claims a longer life is refused on read too:
  // the cap is the reader's rule, not the writer's claim.
  writeCapabilityProfile(root, record);
  const overlong = reseal({
    ...record,
    expiresAt: expiresAt(CAPABILITY_PROFILE_MAX_TTL_MS + 60_000),
  });
  writeFileSync(capabilityProfilePath(root), `${JSON.stringify(overlong, null, 2)}\n`);
  assert.deepEqual(
    readCapabilityProfile(root, identity(), { now: CLOCK }),
    { profile: null, reason: 'ttl_exceeded' },
  );
  assert.equal(existsSync(capabilityProfilePath(root)), false);
  assert.throws(() => writeCapabilityProfile(root, overlong), /ttl_exceeded/u);
});

test('a capability profile can never carry a review verdict', () => {
  const root = dataRoot();
  const record = profile();
  for (const key of ['verdict', 'findings', 'reviewOutcome', 'approvals', 'signature',
    'blockingCount', 'disposition']) {
    writeCapabilityProfile(root, record);
    writeFileSync(
      capabilityProfilePath(root),
      `${JSON.stringify({ ...record, [key]: 'NEEDS_HELP' }, null, 2)}\n`,
    );
    assert.deepEqual(
      readCapabilityProfile(root, identity(), { now: CLOCK }),
      { profile: null, reason: 'verdict_like_field' },
      `${key} must be refused as a review outcome`,
    );
    assert.equal(existsSync(capabilityProfilePath(root)), false);
  }
  // The same guard applies before the record is ever written.
  assert.throws(
    () => writeCapabilityProfile(root, { ...record, verdict: 'DONE' }),
    /verdict_like_field/u,
  );
  assert.throws(
    () => createCapabilityProfile(
      { ...identity(), expiresAt: expiresAt(), verdict: 'DONE' },
      { now: CLOCK },
    ),
    /capability profile input has unexpected fields/u,
  );
});

test('a malformed, tampered or foreign-schema record is deleted instead of read', () => {
  const record = profile();
  const cases = [
    ['not json at all', 'malformed'],
    [JSON.stringify({ ...record, model: 'claude-opus-5-x' }), 'digest_mismatch'],
    [JSON.stringify({ ...record, profileDigest: '0'.repeat(64) }), 'digest_mismatch'],
    [JSON.stringify({ ...record, schema: 'two-mac.capability-profile.v2' }), 'wrong_schema'],
    [JSON.stringify({ ...record, toolsEnvelope: ['Read', 'Bash'] }), 'invalid_tools_envelope'],
    [JSON.stringify({ ...record, cliExecutable: 'claude' }), 'invalid_cli_executable'],
    [JSON.stringify({ ...record, effort: 'ultra' }), 'invalid_effort'],
    [JSON.stringify({ ...record, recordedAt: '2026-08-17T09:00:00Z' }), 'invalid_recorded_at'],
    [JSON.stringify(Object.fromEntries(
      Object.entries(record).filter(([key]) => key !== 'configDigest'),
    )), 'malformed'],
    [JSON.stringify(null), 'malformed'],
  ];
  for (const [contents, reason] of cases) {
    const root = dataRoot();
    writeCapabilityProfile(root, record);
    writeFileSync(capabilityProfilePath(root), contents);
    assert.deepEqual(
      readCapabilityProfile(root, identity(), { now: CLOCK }),
      { profile: null, reason },
    );
    assert.equal(existsSync(capabilityProfilePath(root)), false);
  }
});

test('a failed write leaves neither a staged temporary file nor a partial record', () => {
  const root = dataRoot();
  const record = profile();
  assert.throws(
    () => writeCapabilityProfile(root, record, {
      fs: {
        fsyncSync: () => {
          throw new Error('injected fsync failure');
        },
      },
    }),
    /injected fsync failure/u,
  );
  assert.deepEqual(readdirSync(root), []);
  assert.deepEqual(
    readCapabilityProfile(root, identity(), { now: CLOCK }),
    { profile: null, reason: 'absent' },
  );

  // The previous record survives a failed replacement.
  writeCapabilityProfile(root, record);
  assert.throws(
    () => writeCapabilityProfile(root, record, {
      fs: {
        renameSync: () => {
          throw new Error('injected rename failure');
        },
      },
    }),
    /injected rename failure/u,
  );
  assert.deepEqual(readdirSync(root), [CAPABILITY_PROFILE_FILENAME]);
  assert.equal(readCapabilityProfile(root, identity(), { now: CLOCK }).profile.profileDigest,
    record.profileDigest);
});

test('the caller expectation and the injected clock are fail-closed inputs', () => {
  const root = dataRoot();
  writeCapabilityProfile(root, profile());
  assert.throws(
    () => readCapabilityProfile(root, { model: 'claude-opus-5' }, { now: CLOCK }),
    /expected identity has unexpected fields/u,
  );
  assert.throws(
    () => readCapabilityProfile(root, identity(), {}),
    /requires an injected now\(\) clock/u,
  );
  assert.throws(
    () => validateCapabilityProfile(profile(), identity(), { now: () => '2026-08-17' }),
    /clock must return a valid Date/u,
  );
  assert.throws(() => capabilityProfilePath('state'), /must be an absolute path/u);
  // A stale expectation never mutates the record through a throwing call.
  assert.equal(existsSync(capabilityProfilePath(root)), true);

  // A record from the future is refused: the clock is the reader's, not the file's.
  const ahead = profile({ expiresAt: expiresAt(2 * 60 * 60 * 1000) }, at(60 * 60 * 1000));
  assert.deepEqual(
    validateCapabilityProfile(ahead, identity(), { now: CLOCK }),
    { valid: false, reason: 'recorded_in_future' },
  );
});
