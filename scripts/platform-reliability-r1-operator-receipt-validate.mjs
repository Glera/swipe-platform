#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const R1_COMPLETION_REQUIREMENTS = Object.freeze([
  'Snapshot 2/delta',
  'Exact single-host ingress',
  'New credential',
  'All consumers rotated',
  'Old credential retired',
  'PITR works',
  'Source untouched',
  'Temporary cost closed',
  'RPO/RTO observed',
  'External ingress closed',
  'Internal remains green',
  'Secret hygiene',
]);

const GATES = Object.freeze(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
const SHA256_RE = /^[a-f0-9]{64}$/;
const GIT_SHA_RE = /^[a-f0-9]{40}$/;
const UTC_RE =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?Z$/;

function fail(location, message) {
  throw new Error(`${location}: ${message}`);
}

function plainObject(value, location) {
  if (
    value === null
    || typeof value !== 'object'
    || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(location, 'must be a plain object');
  }
  return value;
}

function exactKeys(value, location, keys) {
  plainObject(value, location);
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (
    actual.length !== expected.length
    || actual.some((key, index) => key !== expected[index])
  ) {
    fail(location, 'does not match the strict schema');
  }
}

function nonemptyString(value, location) {
  if (
    typeof value !== 'string'
    || !value.trim()
    || value.length > 512
    || /[\u0000-\u001f]/.test(value)
  ) {
    fail(location, 'must be a bounded nonempty string');
  }
  return value;
}

function enumValue(value, location, allowed) {
  if (!allowed.includes(value)) {
    fail(location, `must be one of ${allowed.join('|')}`);
  }
  return value;
}

function booleanValue(value, location) {
  if (typeof value !== 'boolean') {
    fail(location, 'must be a boolean');
  }
  return value;
}

function integerValue(value, location, { min = 0 } = {}) {
  if (!Number.isSafeInteger(value) || value < min) {
    fail(location, `must be an integer >= ${min}`);
  }
  return value;
}

function numberValue(value, location) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    fail(location, 'must be a finite nonnegative number');
  }
  return value;
}

function sha256Value(value, location) {
  if (typeof value !== 'string' || !SHA256_RE.test(value)) {
    fail(location, 'must be a lowercase SHA-256 digest');
  }
  return value;
}

function gitShaValue(value, location) {
  if (typeof value !== 'string' || !GIT_SHA_RE.test(value)) {
    fail(location, 'must be a full lowercase git SHA');
  }
  return value;
}

function utcValue(value, location) {
  const match = typeof value === 'string' ? UTC_RE.exec(value) : null;
  if (!match) {
    fail(location, 'must be an explicit UTC RFC3339 timestamp');
  }
  const [, yearText, monthText, dayText, hourText, minuteText, secondText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const daysInMonth = month >= 1 && month <= 12
    ? new Date(Date.UTC(year, month, 0)).getUTCDate()
    : 0;
  if (
    year < 1
    || day < 1
    || day > daysInMonth
    || hour > 23
    || minute > 59
    || second > 59
  ) {
    fail(location, 'must be a real timestamp');
  }
  const millis = Date.parse(value);
  if (!Number.isFinite(millis)) {
    fail(location, 'must be a real timestamp');
  }
  return millis;
}

function nullableString(value, location) {
  if (value === null) return null;
  return nonemptyString(value, location);
}

function assertNoPlaceholders(value, location = 'receipt') {
  if (typeof value === 'string') {
    if (value.includes('{{') || value.includes('}}')) {
      fail(location, 'contains an unresolved placeholder');
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoPlaceholders(
      entry,
      `${location}[${index}]`,
    ));
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      assertNoPlaceholders(child, `${location}.${key}`);
    }
  }
}

function validateSyncIdentity(value, location) {
  exactKeys(value, location, ['available', 'id', 'typedAbsence']);
  const available = booleanValue(value.available, `${location}.available`);
  const id = nullableString(value.id, `${location}.id`);
  const typedAbsence = nullableString(
    value.typedAbsence,
    `${location}.typedAbsence`,
  );
  if (available && (id === null || typedAbsence !== null)) {
    fail(location, 'available identity requires id and no typed absence');
  }
  if (!available && (id !== null || typedAbsence === null)) {
    fail(location, 'unavailable identity requires a typed absence and no id');
  }
}

function equalStringSets(left, right) {
  return (
    left.length === right.length
    && [...left].sort().every((entry, index) => entry === [...right].sort()[index])
  );
}

function closeEnough(actual, expected) {
  return Math.abs(actual - expected) <= 0.001;
}

function validateFinalEvidence(markdown) {
  if (typeof markdown !== 'string' || !markdown.trim()) {
    fail('finalEvidence', 'must be nonempty Markdown');
  }
  if (markdown.includes('{{') || markdown.includes('}}')) {
    fail('finalEvidence', 'contains an unresolved placeholder');
  }
  if (!markdown.includes('- Overall status: `PASS`')) {
    fail('finalEvidence', 'overall status must be PASS');
  }
  for (const requirement of R1_COMPLETION_REQUIREMENTS) {
    const escaped = requirement.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const row = new RegExp(
      `^\\| ${escaped} \\| \`PASS\` \\| [^\\r\\n]+\\|$`,
      'm',
    );
    if (!row.test(markdown)) {
      fail(
        'finalEvidence.completionMatrix',
        `missing PASS row for ${requirement}`,
      );
    }
  }
}

export function validateOperatorEvidence(
  receiptInput,
  finalEvidenceMarkdown,
  { requirePass = true } = {},
) {
  const receipt = plainObject(receiptInput, 'receipt');
  assertNoPlaceholders(receipt);
  validateFinalEvidence(finalEvidenceMarkdown);

  exactKeys(receipt, 'receipt', [
    'schema',
    'status',
    'sourceDatabaseServiceId',
    'window',
    'consumerClosure',
    'operatorConfirmations',
    'actions',
    'ingressNarrowing',
    'credentialRotation',
    'restoreDrill',
    'ingressClosure',
    'secretsCaptured',
  ]);
  if (receipt.schema !== 'platform-reliability-r1-operator-receipt.v1') {
    fail('receipt.schema', 'unsupported schema');
  }
  enumValue(receipt.status, 'receipt.status', ['pass', 'fail']);
  if (requirePass && receipt.status !== 'pass') {
    fail('receipt.status', 'must be pass for final evidence');
  }
  const sourceServiceId = nonemptyString(
    receipt.sourceDatabaseServiceId,
    'receipt.sourceDatabaseServiceId',
  );
  if (receipt.secretsCaptured !== false) {
    fail('receipt.secretsCaptured', 'must be false');
  }

  exactKeys(receipt.window, 'receipt.window', ['startedAt', 'completedAt']);
  const windowStart = utcValue(
    receipt.window.startedAt,
    'receipt.window.startedAt',
  );
  const windowEnd = utcValue(
    receipt.window.completedAt,
    'receipt.window.completedAt',
  );
  if (windowEnd < windowStart) {
    fail('receipt.window', 'completedAt precedes startedAt');
  }

  const closure = receipt.consumerClosure;
  exactKeys(closure, 'receipt.consumerClosure', [
    'observedAt',
    'status',
    'consumerSetSha256',
    'manualExternalConsumers',
    'consumers',
  ]);
  utcValue(closure.observedAt, 'receipt.consumerClosure.observedAt');
  enumValue(closure.status, 'receipt.consumerClosure.status', ['closed', 'open']);
  sha256Value(
    closure.consumerSetSha256,
    'receipt.consumerClosure.consumerSetSha256',
  );
  exactKeys(
    closure.manualExternalConsumers,
    'receipt.consumerClosure.manualExternalConsumers',
    ['status', 'dispositionId'],
  );
  const externalStatus = enumValue(
    closure.manualExternalConsumers.status,
    'receipt.consumerClosure.manualExternalConsumers.status',
    ['none', 'dispositioned'],
  );
  const externalDisposition = nullableString(
    closure.manualExternalConsumers.dispositionId,
    'receipt.consumerClosure.manualExternalConsumers.dispositionId',
  );
  if (
    (externalStatus === 'none' && externalDisposition !== null)
    || (externalStatus === 'dispositioned' && externalDisposition === null)
  ) {
    fail(
      'receipt.consumerClosure.manualExternalConsumers',
      'status and dispositionId disagree',
    );
  }
  if (!Array.isArray(closure.consumers) || closure.consumers.length < 1) {
    fail('receipt.consumerClosure.consumers', 'must be a nonempty array');
  }

  const consumers = new Map();
  for (const [index, consumer] of closure.consumers.entries()) {
    const location = `receipt.consumerClosure.consumers[${index}]`;
    exactKeys(consumer, location, [
      'serviceId',
      'kind',
      'blueprintReferenceId',
      'pinnedSourceSha',
      'lastKnownGoodDeployOrRunId',
      'postSyncDeployOrRunId',
      'rotationRuntimeIdentitySha256',
      'newUsernameSha256',
      'freshDatabaseProofSha256',
    ]);
    const serviceId = nonemptyString(consumer.serviceId, `${location}.serviceId`);
    if (consumers.has(serviceId)) {
      fail(location, 'duplicates a consumer serviceId');
    }
    enumValue(consumer.kind, `${location}.kind`, ['web', 'cron', 'worker']);
    nonemptyString(
      consumer.blueprintReferenceId,
      `${location}.blueprintReferenceId`,
    );
    gitShaValue(consumer.pinnedSourceSha, `${location}.pinnedSourceSha`);
    nonemptyString(
      consumer.lastKnownGoodDeployOrRunId,
      `${location}.lastKnownGoodDeployOrRunId`,
    );
    nonemptyString(
      consumer.postSyncDeployOrRunId,
      `${location}.postSyncDeployOrRunId`,
    );
    sha256Value(
      consumer.rotationRuntimeIdentitySha256,
      `${location}.rotationRuntimeIdentitySha256`,
    );
    sha256Value(
      consumer.newUsernameSha256,
      `${location}.newUsernameSha256`,
    );
    sha256Value(
      consumer.freshDatabaseProofSha256,
      `${location}.freshDatabaseProofSha256`,
    );
    consumers.set(serviceId, consumer);
  }
  if (requirePass && closure.status !== 'closed') {
    fail('receipt.consumerClosure.status', 'must be closed for final evidence');
  }

  if (
    !Array.isArray(receipt.operatorConfirmations)
    || receipt.operatorConfirmations.length !== GATES.length
  ) {
    fail(
      'receipt.operatorConfirmations',
      'must contain exactly one entry for every gate A-G',
    );
  }
  const confirmations = new Map();
  for (const [index, confirmation] of receipt.operatorConfirmations.entries()) {
    const location = `receipt.operatorConfirmations[${index}]`;
    exactKeys(confirmation, location, [
      'gate',
      'confirmedAt',
      'decision',
      'targetSha256',
    ]);
    const gate = enumValue(confirmation.gate, `${location}.gate`, GATES);
    if (confirmations.has(gate)) {
      fail(location, 'duplicates a gate confirmation');
    }
    const confirmedAt = utcValue(
      confirmation.confirmedAt,
      `${location}.confirmedAt`,
    );
    if (confirmedAt < windowStart || confirmedAt > windowEnd) {
      fail(location, 'confirmation is outside the operator window');
    }
    enumValue(
      confirmation.decision,
      `${location}.decision`,
      ['approved', 'denied'],
    );
    sha256Value(confirmation.targetSha256, `${location}.targetSha256`);
    confirmations.set(gate, { confirmation, confirmedAt });
  }
  if (!GATES.every((gate) => confirmations.has(gate))) {
    fail('receipt.operatorConfirmations', 'does not cover A-G exactly');
  }

  if (!Array.isArray(receipt.actions) || receipt.actions.length < GATES.length) {
    fail('receipt.actions', 'must cover every gate and every external action');
  }
  const actionsByGate = new Map(GATES.map((gate) => [gate, []]));
  for (const [index, action] of receipt.actions.entries()) {
    const location = `receipt.actions[${index}]`;
    exactKeys(action, location, [
      'gate',
      'kind',
      'startedAt',
      'completedAt',
      'targetId',
      'terminalOutcome',
      'evidenceSha256',
      'rollbackOutcome',
      'secretsCaptured',
    ]);
    const gate = enumValue(action.gate, `${location}.gate`, GATES);
    nonemptyString(action.kind, `${location}.kind`);
    const startedAt = utcValue(action.startedAt, `${location}.startedAt`);
    const completedAt = utcValue(action.completedAt, `${location}.completedAt`);
    if (
      startedAt < windowStart
      || completedAt > windowEnd
      || completedAt < startedAt
    ) {
      fail(location, 'action interval is invalid or outside the window');
    }
    if (confirmations.get(gate).confirmedAt > startedAt) {
      fail(location, 'action started before its operator confirmation');
    }
    nonemptyString(action.targetId, `${location}.targetId`);
    enumValue(
      action.terminalOutcome,
      `${location}.terminalOutcome`,
      ['succeeded', 'failed'],
    );
    sha256Value(action.evidenceSha256, `${location}.evidenceSha256`);
    nonemptyString(action.rollbackOutcome, `${location}.rollbackOutcome`);
    if (action.secretsCaptured !== false) {
      fail(`${location}.secretsCaptured`, 'must be false');
    }
    actionsByGate.get(gate).push({
      startedAt,
      completedAt,
      terminalOutcome: action.terminalOutcome,
    });
  }

  let previousGateEnd = windowStart;
  const gateBounds = new Map();
  for (const gate of GATES) {
    const actions = actionsByGate.get(gate);
    if (actions.length === 0) {
      fail('receipt.actions', `missing action for gate ${gate}`);
    }
    const gateStart = Math.min(...actions.map((action) => action.startedAt));
    const gateEnd = Math.max(...actions.map((action) => action.completedAt));
    const confirmationTime = confirmations.get(gate).confirmedAt;
    if (
      confirmationTime < previousGateEnd
      || confirmationTime > gateStart
      || gateStart < previousGateEnd
    ) {
      fail(
        'receipt.actions',
        'gate confirmation/action intervals are out of A-G order',
      );
    }
    previousGateEnd = gateEnd;
    gateBounds.set(gate, { gateStart, gateEnd });
    if (
      requirePass
      && confirmations.get(gate).confirmation.decision !== 'approved'
    ) {
      fail(
        `receipt.operatorConfirmations.${gate}`,
        'must be approved for final evidence',
      );
    }
    if (
      requirePass
      && actions
        .toSorted((left, right) => left.completedAt - right.completedAt)
        .at(-1).terminalOutcome !== 'succeeded'
    ) {
      fail(`receipt.actions.${gate}`, 'last action must succeed for final evidence');
    }
  }

  const narrowing = receipt.ingressNarrowing;
  exactKeys(narrowing, 'receipt.ingressNarrowing', [
    'cidrKind',
    'operatorEgressCidrSha256',
    'renderRuleCidrSha256',
    'digestsEqual',
    'protocolQuerySucceeded',
  ]);
  if (narrowing.cidrKind !== 'single-ipv4') {
    fail('receipt.ingressNarrowing.cidrKind', 'must be single-ipv4');
  }
  const egressDigest = sha256Value(
    narrowing.operatorEgressCidrSha256,
    'receipt.ingressNarrowing.operatorEgressCidrSha256',
  );
  const ruleDigest = sha256Value(
    narrowing.renderRuleCidrSha256,
    'receipt.ingressNarrowing.renderRuleCidrSha256',
  );
  booleanValue(narrowing.digestsEqual, 'receipt.ingressNarrowing.digestsEqual');
  booleanValue(
    narrowing.protocolQuerySucceeded,
    'receipt.ingressNarrowing.protocolQuerySucceeded',
  );
  if (
    requirePass
    && (
      !narrowing.digestsEqual
      || egressDigest !== ruleDigest
      || !narrowing.protocolQuerySucceeded
    )
  ) {
    fail('receipt.ingressNarrowing', 'does not prove exact single-host access');
  }

  const rotation = receipt.credentialRotation;
  exactKeys(rotation, 'receipt.credentialRotation', [
    'oldUsernameSha256',
    'newUsernameSha256',
    'newCredentialCreatedAt',
    'capabilityComparisonSha256',
    'profilesEqual',
    'alembicCheckPassed',
    'blueprintSyncIdentity',
    'oldSessionsAfterDrain',
    'oldCredentialPostDeletionOutcome',
    'newCredentialPostDeletionOutcome',
  ]);
  const oldUsernameDigest = sha256Value(
    rotation.oldUsernameSha256,
    'receipt.credentialRotation.oldUsernameSha256',
  );
  const newUsernameDigest = sha256Value(
    rotation.newUsernameSha256,
    'receipt.credentialRotation.newUsernameSha256',
  );
  if (oldUsernameDigest === newUsernameDigest) {
    fail('receipt.credentialRotation', 'old and new username digests are equal');
  }
  const newCredentialCreatedAt = utcValue(
    rotation.newCredentialCreatedAt,
    'receipt.credentialRotation.newCredentialCreatedAt',
  );
  if (
    newCredentialCreatedAt < gateBounds.get('B').gateStart
    || newCredentialCreatedAt > gateBounds.get('B').gateEnd
  ) {
    fail(
      'receipt.credentialRotation.newCredentialCreatedAt',
      'is outside Gate B',
    );
  }
  sha256Value(
    rotation.capabilityComparisonSha256,
    'receipt.credentialRotation.capabilityComparisonSha256',
  );
  booleanValue(rotation.profilesEqual, 'receipt.credentialRotation.profilesEqual');
  booleanValue(
    rotation.alembicCheckPassed,
    'receipt.credentialRotation.alembicCheckPassed',
  );
  validateSyncIdentity(
    rotation.blueprintSyncIdentity,
    'receipt.credentialRotation.blueprintSyncIdentity',
  );
  integerValue(
    rotation.oldSessionsAfterDrain,
    'receipt.credentialRotation.oldSessionsAfterDrain',
  );
  nonemptyString(
    rotation.oldCredentialPostDeletionOutcome,
    'receipt.credentialRotation.oldCredentialPostDeletionOutcome',
  );
  nonemptyString(
    rotation.newCredentialPostDeletionOutcome,
    'receipt.credentialRotation.newCredentialPostDeletionOutcome',
  );
  if (
    requirePass
    && (
      !rotation.profilesEqual
      || !rotation.alembicCheckPassed
      || rotation.oldSessionsAfterDrain !== 0
      || rotation.oldCredentialPostDeletionOutcome !== 'authentication_rejected'
      || rotation.newCredentialPostDeletionOutcome !== 'query_succeeded'
    )
  ) {
    fail('receipt.credentialRotation', 'does not prove safe credential rotation');
  }
  for (const consumer of consumers.values()) {
    if (consumer.newUsernameSha256 !== newUsernameDigest) {
      fail(
        'receipt.consumerClosure.consumers',
        'consumer username digest does not match rotation',
      );
    }
  }

  const drill = receipt.restoreDrill;
  exactKeys(drill, 'receipt.restoreDrill', [
    'financeDispositionId',
    'recoveryServiceId',
    'beforeObservation',
    'restorePoint',
    'afterTerminalRun',
    'startRecoveryDbClock',
    'startedAt',
    'availableAt',
    'validatedAt',
    'validation',
    'sourceContinuity',
    'observedRpoSeconds',
    'observedProvisionRtoSeconds',
    'observedValidationRtoSeconds',
    'cleanup',
  ]);
  nonemptyString(
    drill.financeDispositionId,
    'receipt.restoreDrill.financeDispositionId',
  );
  const recoveryServiceId = nonemptyString(
    drill.recoveryServiceId,
    'receipt.restoreDrill.recoveryServiceId',
  );
  if (recoveryServiceId === sourceServiceId) {
    fail('receipt.restoreDrill.recoveryServiceId', 'matches the source service');
  }
  exactKeys(drill.beforeObservation, 'receipt.restoreDrill.beforeObservation', [
    'observedDbAt',
    'receiptSha256',
  ]);
  const beforeDbAt = utcValue(
    drill.beforeObservation.observedDbAt,
    'receipt.restoreDrill.beforeObservation.observedDbAt',
  );
  sha256Value(
    drill.beforeObservation.receiptSha256,
    'receipt.restoreDrill.beforeObservation.receiptSha256',
  );
  const restorePoint = utcValue(
    drill.restorePoint,
    'receipt.restoreDrill.restorePoint',
  );
  exactKeys(drill.afterTerminalRun, 'receipt.restoreDrill.afterTerminalRun', [
    'runId',
    'terminalAt',
    'receiptSha256',
  ]);
  nonemptyString(
    drill.afterTerminalRun.runId,
    'receipt.restoreDrill.afterTerminalRun.runId',
  );
  const afterTerminalAt = utcValue(
    drill.afterTerminalRun.terminalAt,
    'receipt.restoreDrill.afterTerminalRun.terminalAt',
  );
  sha256Value(
    drill.afterTerminalRun.receiptSha256,
    'receipt.restoreDrill.afterTerminalRun.receiptSha256',
  );
  const startRecoveryDbClock = utcValue(
    drill.startRecoveryDbClock,
    'receipt.restoreDrill.startRecoveryDbClock',
  );
  const recoveryStartedAt = utcValue(
    drill.startedAt,
    'receipt.restoreDrill.startedAt',
  );
  const recoveryAvailableAt = utcValue(
    drill.availableAt,
    'receipt.restoreDrill.availableAt',
  );
  const recoveryValidatedAt = utcValue(
    drill.validatedAt,
    'receipt.restoreDrill.validatedAt',
  );
  if (
    !(beforeDbAt < restorePoint)
    || !(restorePoint < afterTerminalAt)
    || afterTerminalAt > startRecoveryDbClock
  ) {
    fail(
      'receipt.restoreDrill',
      'does not prove before < restore point < after <= Start Recovery DB clock',
    );
  }
  if ((startRecoveryDbClock - restorePoint) / 1000 < 600) {
    fail('receipt.restoreDrill.restorePoint', 'is less than 10 minutes old');
  }
  if (
    recoveryAvailableAt < recoveryStartedAt
    || recoveryValidatedAt < recoveryAvailableAt
    || recoveryStartedAt < gateBounds.get('E').gateStart
    || recoveryValidatedAt > gateBounds.get('E').gateEnd
  ) {
    fail('receipt.restoreDrill', 'recovery lifecycle timestamps are out of order');
  }

  exactKeys(drill.validation, 'receipt.restoreDrill.validation', [
    'postgresMajorMatches',
    'alembicHeadMatches',
    'schemaAndTableCountsMatch',
    'immutableSamplesMatch',
    'beforePresent',
    'afterAbsent',
  ]);
  for (const [key, value] of Object.entries(drill.validation)) {
    booleanValue(value, `receipt.restoreDrill.validation.${key}`);
    if (requirePass && !value) {
      fail(`receipt.restoreDrill.validation.${key}`, 'must be true');
    }
  }

  exactKeys(drill.sourceContinuity, 'receipt.restoreDrill.sourceContinuity', [
    'before',
    'after',
    'comparisonResult',
  ]);
  const continuity = {};
  for (const side of ['before', 'after']) {
    const location = `receipt.restoreDrill.sourceContinuity.${side}`;
    const observation = drill.sourceContinuity[side];
    exactKeys(observation, location, [
      'observedAt',
      'serviceId',
      'status',
      'deployIdentities',
      'bindingsSha256',
    ]);
    const observedAt = utcValue(observation.observedAt, `${location}.observedAt`);
    const serviceId = nonemptyString(
      observation.serviceId,
      `${location}.serviceId`,
    );
    if (serviceId !== sourceServiceId) {
      fail(`${location}.serviceId`, 'does not match source database service');
    }
    nonemptyString(observation.status, `${location}.status`);
    if (
      !Array.isArray(observation.deployIdentities)
      || observation.deployIdentities.length < 1
    ) {
      fail(`${location}.deployIdentities`, 'must be a nonempty array');
    }
    const deployIdentities = observation.deployIdentities.map(
      (identity, index) => nonemptyString(
        identity,
        `${location}.deployIdentities[${index}]`,
      ),
    );
    if (new Set(deployIdentities).size !== deployIdentities.length) {
      fail(`${location}.deployIdentities`, 'contains duplicates');
    }
    const bindingsSha256 = sha256Value(
      observation.bindingsSha256,
      `${location}.bindingsSha256`,
    );
    continuity[side] = {
      observedAt,
      status: observation.status,
      deployIdentities,
      bindingsSha256,
    };
  }
  enumValue(
    drill.sourceContinuity.comparisonResult,
    'receipt.restoreDrill.sourceContinuity.comparisonResult',
    ['equal', 'different'],
  );
  if (
    continuity.before.observedAt > recoveryStartedAt
    || continuity.after.observedAt < recoveryValidatedAt
  ) {
    fail('receipt.restoreDrill.sourceContinuity', 'does not bracket the drill');
  }
  const continuityEqual = (
    continuity.before.status === 'available'
    && continuity.after.status === 'available'
    && equalStringSets(
      continuity.before.deployIdentities,
      continuity.after.deployIdentities,
    )
    && continuity.before.bindingsSha256 === continuity.after.bindingsSha256
  );
  if (
    requirePass
    && (
      !continuityEqual
      || drill.sourceContinuity.comparisonResult !== 'equal'
    )
  ) {
    fail('receipt.restoreDrill.sourceContinuity', 'source identity changed');
  }

  const observedRpo = numberValue(
    drill.observedRpoSeconds,
    'receipt.restoreDrill.observedRpoSeconds',
  );
  const observedProvisionRto = numberValue(
    drill.observedProvisionRtoSeconds,
    'receipt.restoreDrill.observedProvisionRtoSeconds',
  );
  const observedValidationRto = numberValue(
    drill.observedValidationRtoSeconds,
    'receipt.restoreDrill.observedValidationRtoSeconds',
  );
  if (
    !closeEnough(observedRpo, (startRecoveryDbClock - restorePoint) / 1000)
    || !closeEnough(
      observedProvisionRto,
      (recoveryAvailableAt - recoveryStartedAt) / 1000,
    )
    || !closeEnough(
      observedValidationRto,
      (recoveryValidatedAt - recoveryStartedAt) / 1000,
    )
  ) {
    fail('receipt.restoreDrill', 'RPO/RTO values do not match timestamps');
  }

  exactKeys(drill.cleanup, 'receipt.restoreDrill.cleanup', [
    'operatorConfirmedAt',
    'completedAt',
    'terminalOutcome',
    'namedOwner',
    'financeNotificationId',
    'deletionDeadline',
  ]);
  const cleanupConfirmedAt = utcValue(
    drill.cleanup.operatorConfirmedAt,
    'receipt.restoreDrill.cleanup.operatorConfirmedAt',
  );
  const cleanupCompletedAt = utcValue(
    drill.cleanup.completedAt,
    'receipt.restoreDrill.cleanup.completedAt',
  );
  if (
    cleanupConfirmedAt > cleanupCompletedAt
    || cleanupCompletedAt < recoveryValidatedAt
    || cleanupConfirmedAt < gateBounds.get('F').gateStart
    || cleanupCompletedAt > gateBounds.get('F').gateEnd
  ) {
    fail('receipt.restoreDrill.cleanup', 'cleanup timestamps are out of order');
  }
  enumValue(
    drill.cleanup.terminalOutcome,
    'receipt.restoreDrill.cleanup.terminalOutcome',
    ['deleted', 'suspended'],
  );
  const cleanupOwner = nullableString(
    drill.cleanup.namedOwner,
    'receipt.restoreDrill.cleanup.namedOwner',
  );
  const cleanupFinance = nullableString(
    drill.cleanup.financeNotificationId,
    'receipt.restoreDrill.cleanup.financeNotificationId',
  );
  const deletionDeadline = drill.cleanup.deletionDeadline === null
    ? null
    : utcValue(
      drill.cleanup.deletionDeadline,
      'receipt.restoreDrill.cleanup.deletionDeadline',
    );
  if (drill.cleanup.terminalOutcome === 'suspended') {
    if (
      cleanupOwner === null
      || cleanupFinance === null
      || deletionDeadline === null
      || deletionDeadline <= cleanupCompletedAt
      || deletionDeadline - cleanupCompletedAt > 24 * 60 * 60 * 1000
    ) {
      fail(
        'receipt.restoreDrill.cleanup',
        'suspension requires owner, finance notice, and <=24h deletion deadline',
      );
    }
  } else if (
    cleanupOwner !== null
    || cleanupFinance !== null
    || deletionDeadline !== null
  ) {
    fail(
      'receipt.restoreDrill.cleanup',
      'deleted recovery must not retain suspension containment fields',
    );
  }
  if (requirePass && drill.cleanup.terminalOutcome !== 'deleted') {
    fail('receipt.restoreDrill.cleanup', 'recovery must be deleted for PASS');
  }

  const ingress = receipt.ingressClosure;
  exactKeys(ingress, 'receipt.ingressClosure', [
    'backendPr',
    'backendHeadSha',
    'backendMergeSha',
    'independentPatchReview',
    'blueprintSyncIdentity',
    'savedAt',
    'allowlistRuleCount',
    'internalFreshProofs',
    'externalProtocolProof',
  ]);
  integerValue(ingress.backendPr, 'receipt.ingressClosure.backendPr', { min: 1 });
  gitShaValue(ingress.backendHeadSha, 'receipt.ingressClosure.backendHeadSha');
  gitShaValue(ingress.backendMergeSha, 'receipt.ingressClosure.backendMergeSha');
  exactKeys(
    ingress.independentPatchReview,
    'receipt.ingressClosure.independentPatchReview',
    ['id', 'verdict'],
  );
  nonemptyString(
    ingress.independentPatchReview.id,
    'receipt.ingressClosure.independentPatchReview.id',
  );
  enumValue(
    ingress.independentPatchReview.verdict,
    'receipt.ingressClosure.independentPatchReview.verdict',
    ['pass', 'fail'],
  );
  validateSyncIdentity(
    ingress.blueprintSyncIdentity,
    'receipt.ingressClosure.blueprintSyncIdentity',
  );
  const ingressSavedAt = utcValue(
    ingress.savedAt,
    'receipt.ingressClosure.savedAt',
  );
  integerValue(
    ingress.allowlistRuleCount,
    'receipt.ingressClosure.allowlistRuleCount',
  );
  if (ingressSavedAt < cleanupCompletedAt) {
    fail('receipt.ingressClosure.savedAt', 'precedes recovery cleanup');
  }
  if (
    ingressSavedAt < gateBounds.get('G').gateStart
    || ingressSavedAt > gateBounds.get('G').gateEnd
  ) {
    fail('receipt.ingressClosure.savedAt', 'is outside Gate G');
  }
  if (
    !Array.isArray(ingress.internalFreshProofs)
    || ingress.internalFreshProofs.length !== consumers.size
  ) {
    fail(
      'receipt.ingressClosure.internalFreshProofs',
      'must exactly cover the closed consumer set',
    );
  }
  const proofConsumers = new Set();
  for (const [index, proof] of ingress.internalFreshProofs.entries()) {
    const location = `receipt.ingressClosure.internalFreshProofs[${index}]`;
    exactKeys(proof, location, [
      'consumerId',
      'kind',
      'observedAt',
      'terminalOutcome',
      'rotationDeployOrRunId',
      'postClosureDeployOrRunId',
      'rotationRuntimeIdentitySha256',
      'newUsernameSha256',
      'evidenceSha256',
    ]);
    const consumerId = nonemptyString(proof.consumerId, `${location}.consumerId`);
    if (proofConsumers.has(consumerId) || !consumers.has(consumerId)) {
      fail(location, 'duplicates or does not belong to the closed consumer set');
    }
    proofConsumers.add(consumerId);
    const consumer = consumers.get(consumerId);
    if (proof.kind !== consumer.kind) {
      fail(`${location}.kind`, 'does not match consumer closure');
    }
    const observedAt = utcValue(proof.observedAt, `${location}.observedAt`);
    if (observedAt < ingressSavedAt) {
      fail(location, 'proof predates ingress closure');
    }
    if (observedAt > gateBounds.get('G').gateEnd) {
      fail(location, 'proof is outside Gate G');
    }
    enumValue(
      proof.terminalOutcome,
      `${location}.terminalOutcome`,
      ['query_succeeded', 'run_succeeded'],
    );
    if (
      (consumer.kind === 'web' && proof.terminalOutcome !== 'query_succeeded')
      || (
        consumer.kind !== 'web'
        && proof.terminalOutcome !== 'run_succeeded'
      )
    ) {
      fail(`${location}.terminalOutcome`, 'does not match consumer kind');
    }
    if (
      nonemptyString(
        proof.rotationDeployOrRunId,
        `${location}.rotationDeployOrRunId`,
      ) !== consumer.postSyncDeployOrRunId
    ) {
      fail(`${location}.rotationDeployOrRunId`, 'does not match rotation receipt');
    }
    nonemptyString(
      proof.postClosureDeployOrRunId,
      `${location}.postClosureDeployOrRunId`,
    );
    if (
      sha256Value(
        proof.rotationRuntimeIdentitySha256,
        `${location}.rotationRuntimeIdentitySha256`,
      ) !== consumer.rotationRuntimeIdentitySha256
      || sha256Value(
        proof.newUsernameSha256,
        `${location}.newUsernameSha256`,
      ) !== newUsernameDigest
    ) {
      fail(location, 'runtime or username identity does not match rotation');
    }
    sha256Value(proof.evidenceSha256, `${location}.evidenceSha256`);
  }

  const externalProof = ingress.externalProtocolProof;
  exactKeys(externalProof, 'receipt.ingressClosure.externalProtocolProof', [
    'observedAt',
    'terminalOutcome',
    'sqlExecuted',
    'sanitizedStderrSha256',
    'controlReachabilityPassed',
  ]);
  const externalObservedAt = utcValue(
    externalProof.observedAt,
    'receipt.ingressClosure.externalProtocolProof.observedAt',
  );
  if (externalObservedAt < ingressSavedAt) {
    fail(
      'receipt.ingressClosure.externalProtocolProof',
      'proof predates ingress closure',
    );
  }
  if (externalObservedAt > gateBounds.get('G').gateEnd) {
    fail(
      'receipt.ingressClosure.externalProtocolProof',
      'proof is outside Gate G',
    );
  }
  nonemptyString(
    externalProof.terminalOutcome,
    'receipt.ingressClosure.externalProtocolProof.terminalOutcome',
  );
  booleanValue(
    externalProof.sqlExecuted,
    'receipt.ingressClosure.externalProtocolProof.sqlExecuted',
  );
  sha256Value(
    externalProof.sanitizedStderrSha256,
    'receipt.ingressClosure.externalProtocolProof.sanitizedStderrSha256',
  );
  booleanValue(
    externalProof.controlReachabilityPassed,
    'receipt.ingressClosure.externalProtocolProof.controlReachabilityPassed',
  );
  if (
    requirePass
    && (
      ingress.independentPatchReview.verdict !== 'pass'
      || ingress.allowlistRuleCount !== 0
      || externalProof.terminalOutcome !== 'network_policy_refused'
      || externalProof.sqlExecuted
      || !externalProof.controlReachabilityPassed
    )
  ) {
    fail('receipt.ingressClosure', 'does not prove durable paired closure');
  }

  return {
    schema: 'platform-reliability-r1-operator-evidence-validation.v1',
    status: receipt.status,
    gateCount: GATES.length,
    actionCount: receipt.actions.length,
    consumerCount: consumers.size,
    completionRequirementCount: R1_COMPLETION_REQUIREMENTS.length,
    placeholdersResolved: true,
    sourceContinuityEqual: continuityEqual,
    recoveryDeleted: drill.cleanup.terminalOutcome === 'deleted',
    externalIngressClosed: ingress.allowlistRuleCount === 0,
    secretsCaptured: false,
  };
}

function parseArgs(argv) {
  if (
    argv.length !== 4
    || argv[0] !== '--receipt'
    || !argv[1]
    || argv[2] !== '--final-evidence'
    || !argv[3]
  ) {
    fail(
      'arguments',
      'usage: platform-reliability-r1-operator-receipt-validate.mjs '
      + '--receipt <json> --final-evidence <markdown>',
    );
  }
  return {
    receiptPath: path.resolve(argv[1]),
    finalEvidencePath: path.resolve(argv[3]),
  };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  let receipt;
  let finalEvidence;
  try {
    receipt = JSON.parse(fs.readFileSync(args.receiptPath, 'utf8'));
    finalEvidence = fs.readFileSync(args.finalEvidencePath, 'utf8');
  } catch {
    fail('input', 'could not parse the required evidence files');
  }
  process.stdout.write(
    `${JSON.stringify(validateOperatorEvidence(receipt, finalEvidence), null, 2)}\n`,
  );
}

if (
  process.argv[1]
  && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
) {
  try {
    main();
  } catch (error) {
    process.stderr.write(
      `platform-reliability-r1-operator-receipt-validate: ${error.message}\n`,
    );
    process.exitCode = 1;
  }
}
