#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OBSERVATION_SCHEMA =
  'platform-reliability-r1-blueprint-replacement-observation.v1';
const COMPARISON_SCHEMA =
  'platform-reliability-r1-blueprint-replacement-comparison.v1';
const SUPPORT_SCHEMA = 'platform-reliability-r1-render-support-response.v1';
const INCIDENT_OBSERVED_AT = '2026-08-02T19:10:00Z';
const SHA256_RE = /^[a-f0-9]{64}$/;
const GIT_SHA_RE = /^[a-f0-9]{40}$/;
const SAFE_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;

function fail(message) {
  throw new Error(message);
}

function plainObject(value, label) {
  if (
    value === null
    || typeof value !== 'object'
    || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(`${label} must be a plain object`);
  }
  return value;
}

function exactKeys(value, expected, label) {
  plainObject(value, label);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length
    || actual.some((key, index) => key !== wanted[index])
  ) {
    fail(`${label} does not match the strict schema`);
  }
}

function enumValue(value, allowed, label) {
  if (!allowed.includes(value)) {
    fail(`${label} must be one of ${allowed.join('|')}`);
  }
  return value;
}

function safeString(value, label, maximum = 256) {
  if (
    typeof value !== 'string'
    || value.length < 1
    || value.length > maximum
    || /[\u0000-\u001f]/.test(value)
  ) {
    fail(`${label} must be a bounded nonempty string`);
  }
  return value;
}

function safeId(value, label) {
  if (typeof value !== 'string' || !SAFE_ID_RE.test(value)) {
    fail(`${label} must be a bounded provider identifier`);
  }
  return value;
}

function sha256Value(value, label) {
  if (typeof value !== 'string' || !SHA256_RE.test(value)) {
    fail(`${label} must be a lowercase SHA-256`);
  }
  return value;
}

function gitShaValue(value, label) {
  if (typeof value !== 'string' || !GIT_SHA_RE.test(value)) {
    fail(`${label} must be a full lowercase git SHA`);
  }
  return value;
}

function booleanValue(value, label) {
  if (typeof value !== 'boolean') fail(`${label} must be a boolean`);
  return value;
}

function nullableUtc(value, label) {
  if (value === null) return value;
  return utcValue(value, label);
}

function nullableString(value, label) {
  if (value === null) return value;
  return safeString(value, label);
}

function utcValue(value, label) {
  safeString(value, label, 64);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) {
    fail(`${label} must be canonical UTC`);
  }
  const timestamp = Date.parse(value);
  const fraction = value.match(/\.(\d{1,3})Z$/)?.[1] ?? null;
  const normalized = fraction === null
    ? value.replace(/Z$/, '.000Z')
    : value.replace(/\.\d{1,3}Z$/, `.${fraction.padEnd(3, '0')}Z`);
  if (
    !Number.isFinite(timestamp)
    || new Date(timestamp).toISOString() !== normalized
  ) {
    fail(`${label} must be a real canonical UTC instant`);
  }
  return value;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readJson(filePath, label) {
  const bytes = fs.readFileSync(filePath);
  let value;
  try {
    value = JSON.parse(bytes.toString('utf8'));
  } catch {
    fail(`${label} is not valid JSON`);
  }
  return { bytes, value };
}

function parseService(value, label) {
  exactKeys(value, [
    'serviceId',
    'kind',
    'status',
    'plan',
    'schedule',
    'commandSha256',
    'databaseBindingSha256',
    'environmentShapeSha256',
  ], label);
  return {
    serviceId: safeId(value.serviceId, `${label}.serviceId`),
    kind: enumValue(value.kind, ['web', 'cron', 'worker'], `${label}.kind`),
    status: enumValue(
      value.status,
      ['available', 'live'],
      `${label}.status`,
    ),
    plan: safeString(value.plan, `${label}.plan`),
    schedule: nullableString(value.schedule, `${label}.schedule`),
    commandSha256: sha256Value(
      value.commandSha256,
      `${label}.commandSha256`,
    ),
    databaseBindingSha256: sha256Value(
      value.databaseBindingSha256,
      `${label}.databaseBindingSha256`,
    ),
    environmentShapeSha256: sha256Value(
      value.environmentShapeSha256,
      `${label}.environmentShapeSha256`,
    ),
  };
}

function parseObservation(value, expectedPhase, label) {
  exactKeys(value, [
    'schema',
    'phase',
    'observedAt',
    'blueprint',
    'sourceDatabase',
    'services',
    'oldBlueprintAbsence',
    'hookValueObserved',
    'secretsCaptured',
  ], label);
  if (value.schema !== OBSERVATION_SCHEMA) fail(`${label}.schema is unsupported`);
  if (value.phase !== expectedPhase) fail(`${label}.phase must be ${expectedPhase}`);
  const observedAt = utcValue(value.observedAt, `${label}.observedAt`);
  exactKeys(value.blueprint, [
    'id',
    'sourceRepository',
    'sourceBranch',
    'blueprintPath',
    'sourceSha',
    'autoSyncState',
    'lastSyncAt',
  ], `${label}.blueprint`);
  const blueprint = {
    id: safeId(value.blueprint.id, `${label}.blueprint.id`),
    sourceRepository: enumValue(
      value.blueprint.sourceRepository,
      ['Glera/swipe-backend'],
      `${label}.blueprint.sourceRepository`,
    ),
    sourceBranch: enumValue(
      value.blueprint.sourceBranch,
      ['master'],
      `${label}.blueprint.sourceBranch`,
    ),
    blueprintPath: enumValue(
      value.blueprint.blueprintPath,
      ['render.yaml'],
      `${label}.blueprint.blueprintPath`,
    ),
    sourceSha: gitShaValue(
      value.blueprint.sourceSha,
      `${label}.blueprint.sourceSha`,
    ),
    autoSyncState: enumValue(
      value.blueprint.autoSyncState,
      ['disabled'],
      `${label}.blueprint.autoSyncState`,
    ),
    lastSyncAt: nullableUtc(
      value.blueprint.lastSyncAt,
      `${label}.blueprint.lastSyncAt`,
    ),
  };
  exactKeys(value.sourceDatabase, [
    'serviceId',
    'status',
    'configurationSha256',
  ], `${label}.sourceDatabase`);
  const sourceDatabase = {
    serviceId: safeId(
      value.sourceDatabase.serviceId,
      `${label}.sourceDatabase.serviceId`,
    ),
    status: enumValue(
      value.sourceDatabase.status,
      ['available'],
      `${label}.sourceDatabase.status`,
    ),
    configurationSha256: sha256Value(
      value.sourceDatabase.configurationSha256,
      `${label}.sourceDatabase.configurationSha256`,
    ),
  };
  if (!Array.isArray(value.services) || value.services.length < 1) {
    fail(`${label}.services must be a nonempty array`);
  }
  const services = value.services.map((service, index) => (
    parseService(service, `${label}.services[${index}]`)
  )).sort((left, right) => left.serviceId.localeCompare(right.serviceId));
  const serviceIds = new Set(services.map((service) => service.serviceId));
  if (serviceIds.size !== services.length) {
    fail(`${label}.services contains a duplicate serviceId`);
  }
  let oldBlueprintAbsence = null;
  if (expectedPhase === 'before') {
    if (value.oldBlueprintAbsence !== null) {
      fail(`${label}.oldBlueprintAbsence must be null before replacement`);
    }
  } else {
    exactKeys(value.oldBlueprintAbsence, [
      'blueprintId',
      'observedAt',
      'terminalOutcome',
      'evidenceSha256',
    ], `${label}.oldBlueprintAbsence`);
    oldBlueprintAbsence = {
      blueprintId: safeId(
        value.oldBlueprintAbsence.blueprintId,
        `${label}.oldBlueprintAbsence.blueprintId`,
      ),
      observedAt: utcValue(
        value.oldBlueprintAbsence.observedAt,
        `${label}.oldBlueprintAbsence.observedAt`,
      ),
      terminalOutcome: enumValue(
        value.oldBlueprintAbsence.terminalOutcome,
        ['not_found'],
        `${label}.oldBlueprintAbsence.terminalOutcome`,
      ),
      evidenceSha256: sha256Value(
        value.oldBlueprintAbsence.evidenceSha256,
        `${label}.oldBlueprintAbsence.evidenceSha256`,
      ),
    };
  }
  if (booleanValue(value.hookValueObserved, `${label}.hookValueObserved`)) {
    fail(`${label}.hookValueObserved must be false`);
  }
  if (booleanValue(value.secretsCaptured, `${label}.secretsCaptured`)) {
    fail(`${label}.secretsCaptured must be false`);
  }
  return {
    observedAt,
    blueprint,
    sourceDatabase,
    services,
    oldBlueprintAbsence,
  };
}

function parseSupport(value) {
  plainObject(value, 'support response');
  if (value.schema !== SUPPORT_SCHEMA) fail('support response schema is unsupported');
  const statements = plainObject(
    value.providerStatements,
    'support response providerStatements',
  );
  const limits = plainObject(value.evidenceLimits, 'support response evidenceLimits');
  if (
    statements.supportedRemediation
      !== 'delete_existing_blueprint_then_create_new_blueprint'
    || statements.oldHookInvalidatedByRemediation !== true
    || statements.existingServicesDeletedWithBlueprint !== false
    || statements.existingServicesExpectedToRelinkByDetection !== true
    || limits.providerHasNotExecutedRemediation !== true
    || limits.oldHookTerminallyInvalidated !== false
    || value.secretValueCaptured !== false
  ) {
    fail('support response does not authorize the bounded replacement path');
  }
  return {
    blueprintId: safeId(value.affectedBlueprintId, 'support response blueprintId'),
    blueprintIdentitySha256: (() => {
      const candidate = safeString(
        value.affectedBlueprintIdentitySha256,
        'support response blueprintIdentitySha256',
      );
      if (!/^sha256:[a-f0-9]{64}$/.test(candidate)) {
        fail('support response blueprintIdentitySha256 is invalid');
      }
      return candidate;
    })(),
    lastSyncAt: utcValue(statements.lastObservedSyncAt, 'support response lastSyncAt'),
  };
}

function canonical(value) {
  return JSON.stringify(value);
}

export function compareBlueprintReplacement({
  before,
  after,
  support,
  beforeSha256,
  afterSha256,
  supportSha256,
}) {
  const differences = [];
  const difference = (field) => differences.push(field);
  if (before.blueprint.id !== support.blueprintId) difference('oldBlueprintId');
  if (
    sha256(Buffer.from(before.blueprint.id))
      !== support.blueprintIdentitySha256.replace(/^sha256:/, '')
  ) difference('oldBlueprintIdentitySha256');
  if (before.blueprint.id === after.blueprint.id) difference('newBlueprintId');
  for (const field of [
    'sourceRepository',
    'sourceBranch',
    'blueprintPath',
    'sourceSha',
  ]) {
    if (before.blueprint[field] !== after.blueprint[field]) difference(field);
  }
  if (
    before.blueprint.autoSyncState !== 'disabled'
    || after.blueprint.autoSyncState !== 'disabled'
  ) difference('autoSyncState');
  if (
    before.blueprint.lastSyncAt !== support.lastSyncAt
    || Date.parse(support.lastSyncAt) >= Date.parse(INCIDENT_OBSERVED_AT)
  ) difference('lastSyncAt');
  if (Date.parse(after.observedAt) <= Date.parse(before.observedAt)) {
    difference('observationOrder');
  }
  if (
    after.oldBlueprintAbsence.blueprintId !== before.blueprint.id
    || Date.parse(after.oldBlueprintAbsence.observedAt)
      < Date.parse(after.observedAt)
  ) difference('oldBlueprintAbsence');
  if (canonical(before.sourceDatabase) !== canonical(after.sourceDatabase)) {
    difference('sourceDatabase');
  }
  if (canonical(before.services) !== canonical(after.services)) {
    difference('services');
  }
  const linkedServiceIdsSha256 = sha256(Buffer.from(
    before.services.map((service) => service.serviceId).join('\n'),
  ));
  const linkedServiceConfigurationSha256 = sha256(Buffer.from(
    canonical(before.services),
  ));
  return {
    schema: COMPARISON_SCHEMA,
    beforeObservedAt: before.observedAt,
    afterObservedAt: after.observedAt,
    oldBlueprintId: before.blueprint.id,
    newBlueprintId: after.blueprint.id,
    sourceSha: before.blueprint.sourceSha,
    linkedServiceIdsSha256,
    linkedServiceConfigurationSha256,
    oldBlueprintAbsent: !differences.includes('oldBlueprintAbsence'),
    sourceDatabaseUnchanged: !differences.includes('sourceDatabase'),
    autoSyncDisabled: !differences.includes('autoSyncState'),
    replacementSafe: differences.length === 0,
    differences,
    beforeSha256,
    afterSha256,
    supportSha256,
    secretsCaptured: false,
  };
}

function parseArgs(argv) {
  const allowed = new Set(['--before', '--after', '--support', '--verify-json']);
  const values = new Map();
  if (argv.length % 2 !== 0) fail('every option requires a value');
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!allowed.has(key)) fail(`unknown option ${String(key)}`);
    if (values.has(key)) fail(`duplicate option ${key}`);
    if (!value || value.startsWith('--')) fail(`${key} requires a value`);
    values.set(key, value);
  }
  for (const key of ['--before', '--after', '--support']) {
    if (!values.has(key)) fail(`missing required option ${key}`);
  }
  return {
    beforePath: values.get('--before'),
    afterPath: values.get('--after'),
    supportPath: values.get('--support'),
    verifyJsonPath: values.get('--verify-json') ?? null,
  };
}

export function run(argv) {
  const options = parseArgs(argv);
  const beforeInput = readJson(options.beforePath, 'before observation');
  const afterInput = readJson(options.afterPath, 'after observation');
  const supportInput = readJson(options.supportPath, 'support response');
  const before = parseObservation(beforeInput.value, 'before', 'before observation');
  const after = parseObservation(afterInput.value, 'after', 'after observation');
  const support = parseSupport(supportInput.value);
  const result = compareBlueprintReplacement({
    before,
    after,
    support,
    beforeSha256: sha256(beforeInput.bytes),
    afterSha256: sha256(afterInput.bytes),
    supportSha256: sha256(supportInput.bytes),
  });
  const output = `${JSON.stringify(result, null, 2)}\n`;
  if (options.verifyJsonPath !== null) {
    const published = fs.readFileSync(options.verifyJsonPath);
    if (!published.equals(Buffer.from(output))) {
      fail('published comparison does not match the exact inputs');
    }
  }
  return { result, output };
}

const isMain =
  process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    const { result, output } = run(process.argv.slice(2));
    process.stdout.write(output);
    if (!result.replacementSafe) process.exitCode = 2;
  } catch (error) {
    process.stderr.write(
      `platform-reliability-r1-blueprint-replacement-compare: ${error.message}\n`,
    );
    process.exitCode = 1;
  }
}
