#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROFILE_SCHEMA = 'platform-reliability-r1-db-capability-profile.v1';
const COMPARISON_SCHEMA =
  'platform-reliability-r1-db-capability-comparison.v1';

const RECORD_KINDS = [
  'role',
  'membership',
  'database',
  'schema',
  'relation',
  'column',
  'sequence',
  'routine',
  'type',
  'policy',
  'defaultAcl',
  'setting',
];

const COUNT_FIELDS = Object.fromEntries(
  RECORD_KINDS.map((kind) => [
    kind,
    `${kind.charAt(0).toLowerCase()}${kind.slice(1)}Count`,
  ]),
);

const META_KEYS = [
  'kind',
  'observedAt',
  'database',
  'databaseOid',
  'user',
  'sessionUser',
  'readOnly',
  'timezone',
  'serverVersionNum',
  'serverAddress',
  'serverPort',
  'systemIdentifier',
];

const FIELD_TYPES = {
  role: {
    superuser: 'boolean',
    login: 'boolean',
    inherit: 'boolean',
    createRole: 'boolean',
    createDb: 'boolean',
    replication: 'boolean',
    bypassRls: 'boolean',
    connectionLimit: 'integer',
    searchPath: 'string',
    rowSecuritySetting: 'string',
    roleConfig: 'stringArray',
  },
  membership: {
    member: 'boolean',
    usage: 'boolean',
    setRole: 'nullableBoolean',
    adminOption: 'boolean',
  },
  database: {
    owner: 'string',
    ownerMember: 'boolean',
    connect: 'boolean',
    connectGrant: 'boolean',
    create: 'boolean',
    createGrant: 'boolean',
    temporary: 'boolean',
    temporaryGrant: 'boolean',
  },
  schema: {
    owner: 'string',
    ownerMember: 'boolean',
    usage: 'boolean',
    usageGrant: 'boolean',
    create: 'boolean',
    createGrant: 'boolean',
  },
  relation: {
    relationKind: 'string',
    owner: 'string',
    ownerMember: 'boolean',
    rowSecurity: 'boolean',
    forceRowSecurity: 'boolean',
    rowSecurityActive: 'boolean',
    select: 'boolean',
    selectGrant: 'boolean',
    insert: 'boolean',
    insertGrant: 'boolean',
    update: 'boolean',
    updateGrant: 'boolean',
    delete: 'boolean',
    deleteGrant: 'boolean',
    truncate: 'boolean',
    truncateGrant: 'boolean',
    references: 'boolean',
    referencesGrant: 'boolean',
    trigger: 'boolean',
    triggerGrant: 'boolean',
    maintain: 'nullableBoolean',
    maintainGrant: 'nullableBoolean',
  },
  column: {
    select: 'boolean',
    selectGrant: 'boolean',
    insert: 'boolean',
    insertGrant: 'boolean',
    update: 'boolean',
    updateGrant: 'boolean',
    references: 'boolean',
    referencesGrant: 'boolean',
  },
  sequence: {
    owner: 'string',
    ownerMember: 'boolean',
    usage: 'boolean',
    usageGrant: 'boolean',
    select: 'boolean',
    selectGrant: 'boolean',
    update: 'boolean',
    updateGrant: 'boolean',
  },
  routine: {
    owner: 'string',
    ownerMember: 'boolean',
    execute: 'boolean',
    executeGrant: 'boolean',
  },
  type: {
    owner: 'string',
    ownerMember: 'boolean',
    usage: 'boolean',
    usageGrant: 'boolean',
  },
  policy: {
    permissive: 'boolean',
    command: 'string',
    roles: 'stringArray',
    applies: 'boolean',
    usingExpression: 'nullableString',
    checkExpression: 'nullableString',
  },
  defaultAcl: {
    acl: 'stringArray',
  },
  setting: {
    config: 'stringArray',
  },
};

const RECORD_KEYS = Object.fromEntries(
  Object.entries(FIELD_TYPES).map(([kind, fields]) => [
    kind,
    ['kind', 'identity', ...Object.keys(fields)],
  ]),
);

function fail(message) {
  throw new Error(message);
}

function assertExactKeys(value, expected, label) {
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length
    || actual.some((key, index) => key !== wanted[index])
  ) {
    fail(`${label} has unexpected or missing keys`);
  }
}

function nonEmptyString(value, label) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`);
  }
  return value;
}

function nullableString(value, label) {
  if (value === null) return value;
  return nonEmptyString(value, label);
}

function integer(value, label) {
  if (!Number.isSafeInteger(value)) fail(`${label} must be a safe integer`);
  return value;
}

function nonNegativeInteger(value, label) {
  integer(value, label);
  if (value < 0) fail(`${label} must be non-negative`);
  return value;
}

function nullableNonNegativeInteger(value, label) {
  if (value === null) return value;
  return nonNegativeInteger(value, label);
}

function boolean(value, label) {
  if (typeof value !== 'boolean') fail(`${label} must be a boolean`);
  return value;
}

function nullableBoolean(value, label) {
  if (value === null) return value;
  return boolean(value, label);
}

function stringArray(value, label) {
  if (!Array.isArray(value)) fail(`${label} must be an array`);
  value.forEach((item, index) =>
    nonEmptyString(item, `${label}[${index}]`));
  return value;
}

function numericString(value, label) {
  nonEmptyString(value, label);
  if (!/^\d+$/.test(value)) fail(`${label} must be numeric`);
  return value;
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => (
          left < right ? -1 : left > right ? 1 : 0
        ))
        .map(([key, child]) => [key, stable(child)]),
    );
  }
  return value;
}

function canonical(value) {
  return JSON.stringify(stable(value));
}

function sha256(value) {
  return `sha256:${crypto.createHash('sha256').update(value).digest('hex')}`;
}

function parseTimestamp(value, label) {
  const raw = nonEmptyString(value, label);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) fail(`${label} must be an ISO timestamp`);
  if (parsed.toISOString() !== raw) {
    fail(`${label} must be a canonical UTC ISO timestamp`);
  }
  return raw;
}

function parseLines(raw) {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) fail('capability profile is empty');

  return lines.map((line, index) => {
    let value;
    try {
      value = JSON.parse(line);
    } catch {
      fail(`line ${index + 1} is not JSON`);
    }
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      fail(`line ${index + 1} must be a JSON object`);
    }
    return value;
  });
}

function validateField(value, type, label) {
  switch (type) {
    case 'boolean':
      return boolean(value, label);
    case 'nullableBoolean':
      return nullableBoolean(value, label);
    case 'integer':
      return integer(value, label);
    case 'string':
      return nonEmptyString(value, label);
    case 'nullableString':
      return nullableString(value, label);
    case 'stringArray':
      return stringArray(value, label);
    default:
      fail(`internal error: unsupported field type ${type}`);
  }
}

function validateVersionDependentFields(row, serverVersionNumber, label) {
  if (row.kind === 'membership') {
    const supported = serverVersionNumber >= 160000;
    if (supported !== (row.setRole !== null)) {
      fail(`${label} setRole support does not match PostgreSQL version`);
    }
  }
  if (row.kind === 'relation') {
    const supported = serverVersionNumber >= 170000;
    if (
      supported !== (row.maintain !== null)
      || supported !== (row.maintainGrant !== null)
    ) {
      fail(`${label} MAINTAIN support does not match PostgreSQL version`);
    }
  }
}

export function parseProfile(raw) {
  const rows = parseLines(raw);
  const metas = rows.filter((row) => row.kind === 'meta');
  const completes = rows.filter((row) => row.kind === 'complete');
  if (metas.length !== 1) fail(`expected one meta row, got ${metas.length}`);
  if (completes.length !== 1) {
    fail(`expected one complete row, got ${completes.length}`);
  }

  const meta = metas[0];
  assertExactKeys(meta, META_KEYS, 'meta');
  if (meta.kind !== 'meta') fail('invalid meta kind');
  if (meta.readOnly !== true) fail('capability profile was not READ ONLY');
  if (meta.timezone !== 'UTC') fail('capability profile timezone must be UTC');
  const observedAt = parseTimestamp(meta.observedAt, 'meta.observedAt');
  const database = nonEmptyString(meta.database, 'meta.database');
  const databaseOid = numericString(meta.databaseOid, 'meta.databaseOid');
  const user = nonEmptyString(meta.user, 'meta.user');
  const sessionUser = nonEmptyString(meta.sessionUser, 'meta.sessionUser');
  if (sessionUser !== user) {
    fail('meta.sessionUser must equal meta.user; SET ROLE captures are invalid');
  }
  const serverVersionNum = numericString(
    meta.serverVersionNum,
    'meta.serverVersionNum',
  );
  const serverVersionNumber = Number(serverVersionNum);
  if (!Number.isSafeInteger(serverVersionNumber)) {
    fail('meta.serverVersionNum is outside the safe integer range');
  }
  const serverAddress = nullableString(
    meta.serverAddress,
    'meta.serverAddress',
  );
  const serverPort = nullableNonNegativeInteger(
    meta.serverPort,
    'meta.serverPort',
  );
  const systemIdentifier = numericString(
    meta.systemIdentifier,
    'meta.systemIdentifier',
  );

  const complete = completes[0];
  assertExactKeys(
    complete,
    ['kind', 'status', ...Object.values(COUNT_FIELDS)],
    'complete',
  );
  if (complete.kind !== 'complete') fail('invalid complete kind');
  if (complete.status !== 'ok') {
    fail('capability completion sentinel is invalid');
  }

  const records = new Map();
  const counts = Object.fromEntries(RECORD_KINDS.map((kind) => [kind, 0]));
  const recordKindSet = new Set(RECORD_KINDS);
  for (const [index, row] of rows.entries()) {
    if (row.kind === 'meta' || row.kind === 'complete') continue;
    if (!recordKindSet.has(row.kind)) {
      fail(`line ${index + 1} has unsupported kind ${String(row.kind)}`);
    }
    const identity = nonEmptyString(
      row.identity,
      `line ${index + 1} identity`,
    );
    const label = `${row.kind} ${identity}`;
    assertExactKeys(row, RECORD_KEYS[row.kind], label);
    for (const [field, type] of Object.entries(FIELD_TYPES[row.kind])) {
      validateField(row[field], type, `${label} ${field}`);
    }
    validateVersionDependentFields(row, serverVersionNumber, label);

    const key = `${row.kind}\u0000${identity}`;
    if (records.has(key)) {
      fail(`duplicate capability record ${row.kind} ${identity}`);
    }
    records.set(key, stable(row));
    counts[row.kind] += 1;
  }

  for (const [kind, countField] of Object.entries(COUNT_FIELDS)) {
    const expected = nonNegativeInteger(
      complete[countField],
      `complete.${countField}`,
    );
    if (counts[kind] !== expected) {
      fail(
        `${kind} coverage does not match completion sentinel `
        + `(${counts[kind]} != ${expected})`,
      );
    }
  }

  const normalizedMeta = {
    ...meta,
    observedAt,
    database,
    databaseOid,
    user,
    sessionUser,
    serverVersionNum,
    serverAddress,
    serverPort,
    systemIdentifier,
  };
  const clusterIdentity = {
    database,
    databaseOid,
    serverVersionNum,
    systemIdentifier,
  };
  const profileDocument = {
    schema: PROFILE_SCHEMA,
    meta: normalizedMeta,
    complete: stable(complete),
    records: [...records.entries()].sort(([left], [right]) =>
      (left < right ? -1 : left > right ? 1 : 0)),
  };
  return {
    observedAt,
    database,
    databaseOid,
    user,
    serverVersionNum,
    serverAddress,
    serverPort,
    systemIdentifier,
    clusterIdentitySha256: sha256(canonical(clusterIdentity)),
    records,
    profileSha256: sha256(canonical(profileDocument)),
  };
}

function sanitizedDifferenceValue(value) {
  if (value === undefined) return null;
  if (
    value === null
    || typeof value === 'boolean'
    || typeof value === 'number'
  ) {
    return value;
  }
  return sha256(canonical(value));
}

function fieldDiffs(left, right) {
  const keys = new Set([...Object.keys(left ?? {}), ...Object.keys(right ?? {})]);
  return [...keys]
    .sort()
    .filter((key) => canonical(left?.[key]) !== canonical(right?.[key]))
    .map((field) => ({
      field,
      old: sanitizedDifferenceValue(left?.[field]),
      new: sanitizedDifferenceValue(right?.[field]),
    }));
}

export function compareProfiles(oldProfile, newProfile) {
  if (oldProfile.database !== newProfile.database) {
    fail('old and new capability profiles target different databases');
  }
  if (oldProfile.databaseOid !== newProfile.databaseOid) {
    fail('database OID changed between capability profiles');
  }
  if (oldProfile.systemIdentifier !== newProfile.systemIdentifier) {
    fail('PostgreSQL cluster system identifier changed between profiles');
  }
  if (oldProfile.serverVersionNum !== newProfile.serverVersionNum) {
    fail('PostgreSQL server version changed between capability profiles');
  }
  if (oldProfile.user === newProfile.user) {
    fail('old and new capability profiles must use different users');
  }
  if (new Date(newProfile.observedAt) <= new Date(oldProfile.observedAt)) {
    fail('new capability profile must be observed after the old profile');
  }

  const keys = new Set([
    ...oldProfile.records.keys(),
    ...newProfile.records.keys(),
  ]);
  const differences = [...keys]
    .sort()
    .flatMap((key) => {
      const oldRecord = oldProfile.records.get(key);
      const newRecord = newProfile.records.get(key);
      const [kind, identity] = key.split('\u0000');
      const identitySha256 = sha256(identity);
      if (!oldRecord) {
        return [{
          kind,
          identitySha256,
          disposition: 'new-only',
          fields: [],
        }];
      }
      if (!newRecord) {
        return [{
          kind,
          identitySha256,
          disposition: 'old-only',
          fields: [],
        }];
      }
      const fields = fieldDiffs(oldRecord, newRecord);
      if (fields.length === 0) return [];
      return [{
        kind,
        identitySha256,
        disposition: 'changed',
        fields,
      }];
    });

  return {
    schema: COMPARISON_SCHEMA,
    databaseSha256: sha256(oldProfile.database),
    clusterIdentitySha256: oldProfile.clusterIdentitySha256,
    serverVersionNum: oldProfile.serverVersionNum,
    oldObservedAt: oldProfile.observedAt,
    newObservedAt: newProfile.observedAt,
    oldUserSha256: sha256(oldProfile.user),
    newUserSha256: sha256(newProfile.user),
    oldProfileSha256: oldProfile.profileSha256,
    newProfileSha256: newProfile.profileSha256,
    profilesEqual: differences.length === 0,
    differences,
    secretsCaptured: false,
  };
}

function parseArgs(argv) {
  const allowed = new Set(['--old', '--new', '--format']);
  const values = new Map();
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!allowed.has(key)) fail(`unknown option ${String(key)}`);
    if (values.has(key)) fail(`duplicate option ${key}`);
    if (value === undefined || value.startsWith('--')) {
      fail(`${key} requires a value`);
    }
    values.set(key, value);
  }
  for (const required of ['--old', '--new']) {
    if (!values.has(required)) fail(`missing required option ${required}`);
  }
  const format = values.get('--format') ?? 'json';
  if (!['json', 'markdown'].includes(format)) {
    fail('--format must be json or markdown');
  }
  return {
    oldPath: values.get('--old'),
    newPath: values.get('--new'),
    format,
  };
}

function markdownCell(value) {
  return String(value)
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll('`', '\\`')
    .replace(/\r?\n/g, ' ');
}

function inlineCode(value) {
  return `\`${markdownCell(value)}\``;
}

export function renderMarkdown(result) {
  const lines = [
    '# PostgreSQL credential capability comparison',
    '',
    `- Database: ${inlineCode(result.databaseSha256)}`,
    `- Cluster: ${inlineCode(result.clusterIdentitySha256)}`,
    `- PostgreSQL: ${inlineCode(result.serverVersionNum)}`,
    `- Old profile: ${inlineCode(result.oldProfileSha256)}`,
    `- New profile: ${inlineCode(result.newProfileSha256)}`,
    `- Profiles equal: **${result.profilesEqual ? 'PASS' : 'FAIL'}**`,
    '',
  ];
  if (result.differences.length === 0) {
    lines.push('No capability differences.');
  } else {
    lines.push('| Kind | Object SHA-256 | Disposition | Fields |');
    lines.push('|---|---|---|---|');
    for (const difference of result.differences) {
      const fields = difference.fields.map((field) => field.field).join(', ');
      lines.push(
        `| ${markdownCell(difference.kind)} `
        + `| ${inlineCode(difference.identitySha256)} `
        + `| ${markdownCell(difference.disposition)} `
        + `| ${markdownCell(fields || '—')} |`,
      );
    }
  }
  return `${lines.join('\n')}\n`;
}

export function run(argv) {
  const options = parseArgs(argv);
  const oldProfile = parseProfile(fs.readFileSync(options.oldPath, 'utf8'));
  const newProfile = parseProfile(fs.readFileSync(options.newPath, 'utf8'));
  const result = compareProfiles(oldProfile, newProfile);
  const output = options.format === 'markdown'
    ? renderMarkdown(result)
    : `${JSON.stringify(result, null, 2)}\n`;
  return { result, output };
}

const isMain =
  process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    const { result, output } = run(process.argv.slice(2));
    process.stdout.write(output);
    if (!result.profilesEqual) process.exitCode = 2;
  } catch (error) {
    process.stderr.write(
      `platform-reliability-r1-db-capability-compare: ${error.message}\n`,
    );
    process.exitCode = 1;
  }
}
