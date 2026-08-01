import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  compareProfiles,
  parseProfile,
  renderMarkdown,
} from './platform-reliability-r1-db-capability-compare.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CLI = path.join(HERE, 'platform-reliability-r1-db-capability-compare.mjs');

function row(value) {
  return JSON.stringify(value);
}

function profile({
  user = 'old_user',
  sessionUser = user,
  observedAt = '2026-07-30T08:40:00.000Z',
  database = 'swipe_55ht',
  databaseOid = '16384',
  systemIdentifier = '7665679002992390791',
  serverAddress = '10.0.0.7',
  relationIdentity = 'public.events',
  relationSelect = true,
  columnSelect = true,
  policyApplies = true,
  roleConfig = [],
  sessionCredential = {},
  complete = true,
  extraRows = [],
} = {}) {
  const rows = [
    {
      kind: 'meta',
      observedAt,
      database,
      databaseOid,
      user,
      sessionUser,
      readOnly: true,
      timezone: 'UTC',
      serverVersionNum: '160010',
      serverAddress,
      serverPort: 5432,
      systemIdentifier,
    },
    {
      kind: 'sessionCredential',
      identity: 'session',
      delegated: sessionUser !== user,
      superuser: false,
      login: true,
      inherit: true,
      createRole: false,
      createDb: false,
      replication: false,
      bypassRls: false,
      connectionLimit: -1,
      roleConfig: sessionUser === user
        ? []
        : ['role=CURRENT_EFFECTIVE_USER'],
      directMembershipCount: sessionUser === user ? 0 : 1,
      currentRoleMembership: true,
      allDirectMembershipsCoveredByEffective: true,
      allDirectSetCoveredByEffective: true,
      allDirectMembershipAdminsFalse: true,
      ...sessionCredential,
    },
    {
      kind: 'role',
      identity: 'current',
      superuser: false,
      login: true,
      inherit: true,
      createRole: false,
      createDb: false,
      replication: false,
      bypassRls: false,
      connectionLimit: -1,
      searchPath: '"$user", public',
      rowSecuritySetting: 'on',
      roleConfig,
    },
    {
      kind: 'membership',
      identity: 'app_owner',
      member: true,
      usage: true,
      setRole: false,
      adminOption: false,
    },
    {
      kind: 'database',
      identity: database,
      owner: 'app_owner',
      ownerMember: true,
      connect: true,
      connectGrant: false,
      create: true,
      createGrant: false,
      temporary: true,
      temporaryGrant: false,
    },
    {
      kind: 'schema',
      identity: 'public',
      owner: 'app_owner',
      ownerMember: true,
      usage: true,
      usageGrant: false,
      create: true,
      createGrant: false,
    },
    {
      kind: 'relation',
      identity: relationIdentity,
      relationKind: 'r',
      owner: 'app_owner',
      ownerMember: true,
      rowSecurity: false,
      forceRowSecurity: false,
      rowSecurityActive: false,
      select: relationSelect,
      selectGrant: false,
      insert: true,
      insertGrant: false,
      update: true,
      updateGrant: false,
      delete: true,
      deleteGrant: false,
      truncate: true,
      truncateGrant: false,
      references: true,
      referencesGrant: false,
      trigger: true,
      triggerGrant: false,
      maintain: null,
      maintainGrant: null,
    },
    {
      kind: 'column',
      identity: `${relationIdentity}.payload`,
      select: columnSelect,
      selectGrant: false,
      insert: true,
      insertGrant: false,
      update: true,
      updateGrant: false,
      references: true,
      referencesGrant: false,
    },
    {
      kind: 'sequence',
      identity: 'public.events_id_seq',
      owner: 'app_owner',
      ownerMember: true,
      usage: true,
      usageGrant: false,
      select: true,
      selectGrant: false,
      update: true,
      updateGrant: false,
    },
    {
      kind: 'routine',
      identity: 'public.worker(integer)',
      owner: 'app_owner',
      ownerMember: true,
      execute: true,
      executeGrant: false,
    },
    {
      kind: 'type',
      identity: 'public.event_kind',
      owner: 'app_owner',
      ownerMember: true,
      usage: true,
      usageGrant: false,
    },
    {
      kind: 'policy',
      identity: 'public.events.owner_only',
      permissive: true,
      command: '*',
      roles: ['app_owner'],
      applies: policyApplies,
      usingExpression: '(owner_id = current_user_id())',
      checkExpression: null,
    },
    {
      kind: 'defaultAcl',
      identity: 'public:r',
      acl: ['app_owner=arwdDxt/app_owner'],
    },
    {
      kind: 'setting',
      identity: 'all-databases',
      config: ['statement_timeout=30s'],
    },
    ...extraRows,
  ];
  if (complete) {
    rows.push({
      kind: 'complete',
      roleCount: 1,
      membershipCount: 1,
      databaseCount: 1,
      schemaCount: 1,
      relationCount: 1,
      columnCount: 1,
      sequenceCount: 1,
      routineCount: 1,
      typeCount: 1,
      policyCount: 1,
      defaultAclCount: 1,
      settingCount: 1,
      status: 'ok',
    });
  }
  return `${rows.map(row).join('\n')}\n`;
}

function later(overrides = {}) {
  return profile({
    user: 'new_user',
    observedAt: '2026-07-30T08:41:00.000Z',
    ...overrides,
  });
}

test('equal capabilities bind each profile digest to credential and time', () => {
  const oldProfile = parseProfile(profile());
  const newProfile = parseProfile(later());
  const result = compareProfiles(oldProfile, newProfile);

  assert.equal(result.profilesEqual, true);
  assert.deepEqual(result.differences, []);
  assert.match(result.oldUserSha256, /^sha256:[a-f0-9]{64}$/);
  assert.match(result.newUserSha256, /^sha256:[a-f0-9]{64}$/);
  assert.notEqual(result.oldProfileSha256, result.newProfileSha256);
  assert.notEqual(
    oldProfile.profileSha256,
    parseProfile(profile({
      observedAt: '2026-07-30T08:41:00.000Z',
    })).profileSha256,
  );
  assert.notEqual(
    oldProfile.profileSha256,
    parseProfile(profile({ user: 'different_user' })).profileSha256,
  );
  assert.match(result.clusterIdentitySha256, /^sha256:[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(result), /old_user|new_user|swipe_55ht/);
});

test('Render delegated login preserves effective authority without hiding extras', () => {
  const result = compareProfiles(
    parseProfile(profile()),
    parseProfile(profile({
      user: 'old_user',
      sessionUser: 'new_user',
      observedAt: '2026-07-30T08:41:00.000Z',
    })),
  );

  assert.equal(result.profilesEqual, true);
  assert.equal(result.rotationMode, 'delegated-effective-role-preserved');
  assert.equal(result.oldEffectiveUserSha256, result.newEffectiveUserSha256);
  assert.notEqual(result.oldUserSha256, result.newUserSha256);

  for (const sessionCredential of [
    { superuser: true },
    { roleConfig: ['role=CURRENT_EFFECTIVE_USER', 'search_path=private'] },
    { allDirectMembershipsCoveredByEffective: false },
    { allDirectSetCoveredByEffective: false },
    { allDirectMembershipAdminsFalse: false },
  ]) {
    assert.throws(
      () => parseProfile(profile({
        user: 'old_user',
        sessionUser: 'new_user',
        sessionCredential,
      })),
      /delegated session credential/,
    );
  }
});

test('table privilege mismatch is typed without exposing object identity', () => {
  const result = compareProfiles(
    parseProfile(profile()),
    parseProfile(later({ relationSelect: false })),
  );

  assert.equal(result.profilesEqual, false);
  assert.equal(result.differences.length, 1);
  assert.deepEqual(result.differences[0].fields, [
    { field: 'select', old: true, new: false },
  ]);
  assert.equal(result.differences[0].kind, 'relation');
  assert.match(
    result.differences[0].identitySha256,
    /^sha256:[a-f0-9]{64}$/,
  );
  assert.doesNotMatch(JSON.stringify(result), /public\.events/);
});

test('column ACL and RLS policy applicability are compared independently', () => {
  const result = compareProfiles(
    parseProfile(profile()),
    parseProfile(later({ columnSelect: false, policyApplies: false })),
  );

  assert.equal(result.profilesEqual, false);
  assert.deepEqual(
    result.differences.map((difference) => [
      difference.kind,
      difference.fields.map((field) => field.field),
    ]),
    [
      ['column', ['select']],
      ['policy', ['applies']],
    ],
  );
});

test('cluster or database identity changes fail before capability comparison', () => {
  const oldProfile = parseProfile(profile());
  assert.throws(
    () => compareProfiles(
      oldProfile,
      parseProfile(later({ systemIdentifier: '7665679002992390792' })),
    ),
    /cluster system identifier changed/,
  );
  assert.throws(
    () => compareProfiles(
      oldProfile,
      parseProfile(later({ databaseOid: '16385' })),
    ),
    /database OID changed/,
  );
  assert.throws(
    () => parseProfile(profile({ systemIdentifier: null })),
    /systemIdentifier must be a non-empty string/,
  );
  assert.throws(
    () => parseProfile(profile().replace(
      '"sessionUser":"old_user"',
      '"sessionUser":"different_login"',
    )),
    /delegated does not match/,
  );
});

test('missing completion sentinel and truncated coverage fail closed', () => {
  assert.throws(
    () => parseProfile(profile({ complete: false })),
    /expected one complete row/,
  );

  const sequence = row({
    kind: 'sequence',
    identity: 'public.events_id_seq',
    owner: 'app_owner',
    ownerMember: true,
    usage: true,
    usageGrant: false,
    select: true,
    selectGrant: false,
    update: true,
    updateGrant: false,
  });
  const truncated = profile().replace(`${sequence}\n`, '');
  assert.throws(
    () => parseProfile(truncated),
    /sequence coverage does not match completion sentinel/,
  );
});

test('same user, reversed time, unknown kind, and malformed schema fail closed', () => {
  const oldProfile = parseProfile(profile());
  assert.throws(
    () => compareProfiles(
      oldProfile,
      parseProfile(profile({ observedAt: '2026-07-30T08:41:00.000Z' })),
    ),
    /must use different session users/,
  );
  assert.throws(
    () => compareProfiles(
      oldProfile,
      parseProfile(later({ observedAt: '2026-07-30T08:39:00.000Z' })),
    ),
    /must be observed after/,
  );
  assert.throws(
    () => parseProfile(profile({
      extraRows: [{ kind: 'mystery', identity: 'x', allowed: true }],
    })),
    /unsupported kind/,
  );
  assert.throws(
    () => parseProfile(profile().replace('"select":true', '"select":"true"')),
    /select must be a boolean/,
  );
  assert.throws(
    () => parseProfile(profile().replace(',"triggerGrant":false', '')),
    /unexpected or missing keys/,
  );
});

test('version-dependent SET ROLE and MAINTAIN coverage fails closed', () => {
  assert.throws(
    () => parseProfile(profile().replace('"setRole":false', '"setRole":null')),
    /setRole support does not match PostgreSQL version/,
  );
  assert.throws(
    () => parseProfile(profile().replace('"maintain":null', '"maintain":false')),
    /MAINTAIN support does not match PostgreSQL version/,
  );
});

test('non-primitive differences and markdown never expose hostile values', () => {
  const hostile = 'public.events|INJECT\\n|bad|row|';
  const result = compareProfiles(
    parseProfile(profile({ relationIdentity: hostile })),
    parseProfile(later({
      relationIdentity: hostile,
      roleConfig: ['search_path=private|oops\nnext'],
    })),
  );
  const markdown = renderMarkdown(result);

  assert.equal(result.profilesEqual, false);
  assert.equal(result.differences[0].kind, 'role');
  assert.match(result.differences[0].fields[0].new, /^sha256:[a-f0-9]{64}$/);
  assert.doesNotMatch(JSON.stringify(result), /private|INJECT|bad|oops/);
  assert.doesNotMatch(markdown, /private|INJECT|bad|oops/);
});

test('CLI exits 0 for equality, 2 for mismatch, and rejects option mistakes', () => {
  const temporary = fs.mkdtempSync(
    path.join(os.tmpdir(), 'r1-capability-compare-'),
  );
  try {
    const oldPath = path.join(temporary, 'old.jsonl');
    const equalPath = path.join(temporary, 'equal.jsonl');
    const mismatchPath = path.join(temporary, 'mismatch.jsonl');
    fs.writeFileSync(oldPath, profile());
    fs.writeFileSync(equalPath, later());
    fs.writeFileSync(mismatchPath, later({ relationSelect: false }));

    const equal = spawnSync(
      process.execPath,
      [CLI, '--old', oldPath, '--new', equalPath, '--format', 'markdown'],
      { encoding: 'utf8' },
    );
    assert.equal(equal.status, 0, equal.stderr);
    assert.match(equal.stdout, /Profiles equal: \*\*PASS\*\*/);

    const mismatch = spawnSync(
      process.execPath,
      [CLI, '--old', oldPath, '--new', mismatchPath],
      { encoding: 'utf8' },
    );
    assert.equal(mismatch.status, 2, mismatch.stderr);
    assert.equal(JSON.parse(mismatch.stdout).profilesEqual, false);

    const unknown = spawnSync(
      process.execPath,
      [CLI, '--old', oldPath, '--new', equalPath, '--typo', 'x'],
      { encoding: 'utf8' },
    );
    assert.equal(unknown.status, 1);
    assert.match(unknown.stderr, /unknown option --typo/);

    const duplicate = spawnSync(
      process.execPath,
      [CLI, '--old', oldPath, '--old', equalPath, '--new', equalPath],
      { encoding: 'utf8' },
    );
    assert.equal(duplicate.status, 1);
    assert.match(duplicate.stderr, /duplicate option --old/);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
});
