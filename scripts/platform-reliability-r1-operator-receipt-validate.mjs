#!/usr/bin/env node

import crypto from 'node:crypto';
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
const REQUIRED_SECRET_EXPOSURE_ID =
  'r1-prewindow-blueprint-sync-hook-dom-20260729';
const REQUIRED_SECRET_EXPOSURE_KIND =
  'render_blueprint_sync_hook_dom_exposure';
const REQUIRED_SECRET_EXPOSURE_OBSERVED_AT = '2026-07-29T15:01:19Z';
const SECRET_EXPOSURE_METHODS = Object.freeze({
  render_blueprint_sync_hook_dom_exposure: Object.freeze([
    'regenerate_sync_hook',
    'revoke_sync_hook',
  ]),
  render_database_credential_dom_exposure: Object.freeze([
    'rotate_database_credential',
    'revoke_database_credential',
  ]),
});
const ACCEPTED_RENDER_RESIDUAL_MITIGATIONS = Object.freeze([
  'do_not_read_copy_or_use_hook',
  'durable_empty_database_ip_allowlist_before_r1_completion',
  'record_autosync_final_state',
  'stop_on_unexpected_blueprint_sync',
]);
const ACCEPTED_RENDER_RESIDUAL_REOPEN_TRIGGERS = Object.freeze([
  'before_cohort_expansion',
  'before_triple_digit_dau',
  'before_second_blueprint_operator_or_automation',
  'before_render_strategic_commitment',
  'on_unexpected_blueprint_sync',
]);
const SHA256_RE = /^[a-f0-9]{64}$/;
const GIT_SHA_RE = /^[a-f0-9]{40}$/;
const SAFE_ID_RE = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const INCIDENT_ID_RE =
  /^r1-window-(blueprint-sync-hook|database-credential)-dom-(\d{8})-\d{1,3}$/;
const DECISION_ID_RE = /^r1-decision-(\d{8})-\d{1,3}$/;
const SECRET_ACTION_ID_RE = /^r1-secret-action-(\d{8})-\d{1,3}$/;
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

function safeIdValue(value, location) {
  if (typeof value !== 'string' || !SAFE_ID_RE.test(value)) {
    fail(location, 'must be a lowercase safe identifier');
  }
  return value;
}

function structuredIdValue(value, location, pattern) {
  if (typeof value !== 'string' || !pattern.test(value)) {
    fail(location, 'must use the required non-opaque structured identifier');
  }
  return value;
}

function utcDayToken(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10).replaceAll('-', '');
}

function credentialProofBinding(proof) {
  if (proof === null) {
    return '`none`';
  }
  return (
    `\`${proof.observedAt}\` / `
    + `\`${proof.terminalOutcome}\` / `
    + `\`sha256:${proof.usernameSha256}\` / `
    + `\`sha256:${proof.evidenceSha256}\``
  );
}

function exactStringArray(value, location, expected) {
  if (
    !Array.isArray(value)
    || value.length !== expected.length
    || value.some((item, index) => item !== expected[index])
  ) {
    fail(location, `must exactly equal ${expected.join('|')}`);
  }
  return value;
}

function incidentEvidenceLine(incident) {
  const prefix = (
    `- Secret-exposure incident \`${incident.incidentId}\`: `
    + `\`${incident.kind}\` observed \`${incident.observedAt}\`; `
    + `target \`${incident.targetIdentityKind}\` / `
    + `\`sha256:${incident.targetSha256}\`; approval `
    + `\`${incident.operatorDecision.decisionId}\` / `
    + `\`${incident.operatorDecision.confirmedAt}\` / `
    + `\`${incident.operatorDecision.decision}\`; disposition `
  );
  const disposition = incident.disposition;
  if (disposition.kind === 'operator_accepted_residual') {
    return (
      prefix
      + `\`${disposition.kind}\` / `
      + `\`${disposition.actionId}\` / `
      + `\`${disposition.startedAt}\` / `
      + `\`${disposition.completedAt}\` / `
      + `\`${disposition.terminalOutcome}\` / `
      + `risk \`${disposition.riskClass}\` / `
      + `environment \`${disposition.environmentClass}\` / `
      + `review by \`${disposition.reviewBy}\` / `
      + `mitigations \`${disposition.mitigations.join(',')}\` / `
      + `reopen \`${disposition.reopenTriggers.join(',')}\`; `
      + `before \`${disposition.blueprintContinuity.before.observedAt}\` / `
      + `\`${disposition.blueprintContinuity.before.blueprintId}\` / `
      + `\`${disposition.blueprintContinuity.before.sourceRepository}\` / `
      + `\`${disposition.blueprintContinuity.before.sourceBranch}\` / `
      + `\`${disposition.blueprintContinuity.before.blueprintPath}\` / `
      + `\`sha256:${disposition.blueprintContinuity.before.evidenceSha256}\` / `
      + `after \`${disposition.blueprintContinuity.after.observedAt}\` / `
      + `\`${disposition.blueprintContinuity.after.blueprintId}\` / `
      + `\`${disposition.blueprintContinuity.after.sourceRepository}\` / `
      + `\`${disposition.blueprintContinuity.after.sourceBranch}\` / `
      + `\`${disposition.blueprintContinuity.after.blueprintPath}\` / `
      + `\`sha256:${disposition.blueprintContinuity.after.evidenceSha256}\` / `
      + `continuity \`${disposition.blueprintContinuity.comparisonResult}\` / `
      + `acceptance \`sha256:${disposition.acceptanceEvidenceSha256}\`; `
      + `secrets captured \`${disposition.secretsCaptured}\``
    );
  }
  return (
    prefix
    + `\`${disposition.actionId}\` / `
    + `\`${disposition.startedAt}\` / `
    + `\`${disposition.completedAt}\` / `
    + `\`${disposition.terminalOutcome}\` / `
    + `\`${disposition.providerMethod}\` / `
    + `\`${disposition.providerReceipt.kind}\` / `
    + `\`${disposition.providerReceipt.observedAt}\` / `
    + `\`${disposition.providerReceipt.action}\` / `
    + `\`${disposition.providerReceipt.terminalOutcome}\` / `
    + `\`sha256:${disposition.providerReceipt.targetSha256}\` / `
    + `\`sha256:${disposition.providerReceipt.evidenceSha256}\` / `
    + `credential proof ${credentialProofBinding(
      disposition.credentialNegativeProof,
    )}; `
    + `before \`${disposition.blueprintContinuity.before.observedAt}\` / `
    + `\`${disposition.blueprintContinuity.before.blueprintId}\` / `
    + `\`${disposition.blueprintContinuity.before.sourceRepository}\` / `
    + `\`${disposition.blueprintContinuity.before.sourceBranch}\` / `
    + `\`${disposition.blueprintContinuity.before.blueprintPath}\` / `
    + `\`sha256:${disposition.blueprintContinuity.before.evidenceSha256}\` / `
    + `after \`${disposition.blueprintContinuity.after.observedAt}\` / `
    + `\`${disposition.blueprintContinuity.after.blueprintId}\` / `
    + `\`${disposition.blueprintContinuity.after.sourceRepository}\` / `
    + `\`${disposition.blueprintContinuity.after.sourceBranch}\` / `
    + `\`${disposition.blueprintContinuity.after.blueprintPath}\` / `
    + `\`sha256:${disposition.blueprintContinuity.after.evidenceSha256}\` / `
    + `continuity \`${disposition.blueprintContinuity.comparisonResult}\` / `
    + `terminal \`sha256:${disposition.terminalProofSha256}\`; `
    + `secrets captured \`${disposition.secretsCaptured}\``
  );
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

function validateFinalEvidenceStructure(markdown) {
  if (typeof markdown !== 'string' || !markdown.trim()) {
    fail('finalEvidence', 'must be nonempty Markdown');
  }
  if (markdown.includes('{{') || markdown.includes('}}')) {
    fail('finalEvidence', 'contains an unresolved placeholder');
  }
  if (!markdown.includes('- Overall status: `PASS`')) {
    fail('finalEvidence', 'overall status must be PASS');
  }
  for (let section = 1; section <= 12; section += 1) {
    if (!new RegExp(`^## ${section}\\. `, 'm').test(markdown)) {
      fail('finalEvidence', `missing authority section ${section}`);
    }
  }
  for (const artifact of [
    'platform-reliability-r1-0-snapshot-2.tsv',
    'platform-reliability-r1-0-snapshot-2-db-capture-receipt.json',
    'platform-reliability-r1-0-snapshot-2-render-receipt.json',
    'platform-reliability-r1-0-snapshot-delta.json',
    'platform-reliability-r1-0-snapshot-delta.md',
    'platform-reliability-r1-secret-scan-receipt.json',
  ]) {
    if (!markdown.includes(artifact)) {
      fail('finalEvidence', `missing evidence artifact ${artifact}`);
    }
  }
  for (const gate of GATES) {
    if (!new RegExp(`^\\| ${gate} —`, 'm').test(markdown)) {
      fail('finalEvidence.operatorTimeline', `missing gate ${gate}`);
    }
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
  if (!markdown.includes('- Manual Sync preview expected-only: `PASS`')) {
    fail(
      'finalEvidence.ingressClosure.manualPreviewExpectedOnly',
      'must explicitly be PASS',
    );
  }
}

function requireMarkdownValue(markdown, value, location) {
  const text = String(value);
  const codeBound = markdown.includes(`\`${text}\``);
  const digestBound = SHA256_RE.test(text)
    && markdown.includes(`sha256:${text}`);
  if (!codeBound && !digestBound) {
    fail(location, 'is not bound into final evidence');
  }
}

function markdownSectionLines(markdown, sectionNumber, location) {
  const lines = markdown.split(/\r?\n/);
  const sectionPattern = new RegExp(`^## ${sectionNumber}\\. `);
  const sectionStarts = lines
    .map((line, index) => (sectionPattern.test(line) ? index : -1))
    .filter((index) => index >= 0);
  if (sectionStarts.length !== 1) {
    fail(location, `requires exactly one section ${sectionNumber}`);
  }
  const [start] = sectionStarts;
  const next = lines.findIndex((line, index) => (
    index > start && /^## \d+\. /.test(line)
  ));
  const sectionLines = lines.slice(start, next < 0 ? undefined : next);
  if (sectionLines.some((line) => /^(?:```|~~~)/.test(line.trim()))) {
    fail(location, 'must not contain fenced code blocks');
  }
  if (
    markdown.includes('<!--')
    || markdown.includes('-->')
    || sectionLines.some((line) => /<\/?[A-Za-z][^>]*>/.test(line))
  ) {
    fail(location, 'must not contain HTML comments or containers');
  }
  return sectionLines;
}

function requireControlledMarkdownLine(
  allLines,
  sectionLines,
  label,
  expected,
  location,
) {
  const matches = allLines.filter((line) => line.includes(label));
  if (
    matches.length !== 1
    || matches[0] !== expected
    || !sectionLines.includes(expected)
  ) {
    fail(location, 'requires exactly one exact receipt-bound line');
  }
}

function validateFinalEvidenceBindings(markdown, receipt) {
  requireMarkdownValue(
    markdown,
    receipt.sourceDatabaseServiceId,
    'finalEvidence.sourceDatabaseServiceId',
  );
  requireMarkdownValue(
    markdown,
    receipt.consumerClosure.consumerSetSha256,
    'finalEvidence.consumerSetSha256',
  );
  for (const consumer of receipt.consumerClosure.consumers) {
    for (const [key, value] of Object.entries({
      serviceId: consumer.serviceId,
      pinnedSourceSha: consumer.pinnedSourceSha,
      postSyncDeployOrRunId: consumer.postSyncDeployOrRunId,
      rotationRuntimeIdentitySha256:
        consumer.rotationRuntimeIdentitySha256,
      freshDatabaseProofSha256: consumer.freshDatabaseProofSha256,
    })) {
      requireMarkdownValue(
        markdown,
        value,
        `finalEvidence.consumer.${consumer.serviceId}.${key}`,
      );
    }
  }
  for (const action of receipt.actions) {
    requireMarkdownValue(
      markdown,
      action.actionId,
      `finalEvidence.action.${action.actionId}`,
    );
    requireMarkdownValue(
      markdown,
      action.operationId,
      `finalEvidence.action.${action.actionId}.operationId`,
    );
    if (action.terminalOutcome === 'failed') {
      requireMarkdownValue(
        markdown,
        action.rollbackOutcome,
        `finalEvidence.action.${action.actionId}.rollbackOutcome`,
      );
    }
    if (action.resolvesActionId !== null) {
      requireMarkdownValue(
        markdown,
        action.resolvesActionId,
        `finalEvidence.action.${action.actionId}.resolvesActionId`,
      );
    }
  }
  for (const [key, value] of Object.entries({
    operatorEgressCidrSha256:
      receipt.ingressNarrowing.operatorEgressCidrSha256,
    renderRuleCidrSha256: receipt.ingressNarrowing.renderRuleCidrSha256,
    oldUsernameSha256: receipt.credentialRotation.oldUsernameSha256,
    newUsernameSha256: receipt.credentialRotation.newUsernameSha256,
    capabilityComparisonSha256:
      receipt.credentialRotation.capabilityComparisonSha256,
  })) {
    requireMarkdownValue(markdown, value, `finalEvidence.${key}`);
  }
  const drill = receipt.restoreDrill;
  for (const [key, value] of Object.entries({
    financeDispositionId: drill.financeDispositionId,
    recoveryServiceId: drill.recoveryServiceId,
    beforeReceiptSha256: drill.beforeObservation.receiptSha256,
    restorePoint: drill.restorePoint,
    afterRunId: drill.afterTerminalRun.runId,
    afterReceiptSha256: drill.afterTerminalRun.receiptSha256,
    startRecoveryDbClock: drill.startRecoveryDbClock,
    startRecoveryObservationSha256: drill.startRecoveryObservationSha256,
    sourceBindingsSha256: drill.sourceContinuity.before.bindingsSha256,
    observedRpoSeconds: drill.observedRpoSeconds,
    observedProvisionRtoSeconds: drill.observedProvisionRtoSeconds,
    observedValidationRtoSeconds: drill.observedValidationRtoSeconds,
    cleanupOutcome: drill.cleanup.terminalOutcome,
  })) {
    requireMarkdownValue(markdown, value, `finalEvidence.restoreDrill.${key}`);
  }
  for (const identity of drill.sourceContinuity.before.deployIdentities) {
    requireMarkdownValue(
      markdown,
      identity,
      'finalEvidence.restoreDrill.sourceDeployIdentities',
    );
  }
  const ingress = receipt.ingressClosure;
  for (const [key, value] of Object.entries({
    backendPr: ingress.backendPr,
    backendHeadSha: ingress.backendHeadSha,
    backendMergeSha: ingress.backendMergeSha,
    reviewId: ingress.independentPatchReview.id,
    reviewVerdict: ingress.independentPatchReview.verdict,
    allowlistRuleCount: ingress.allowlistRuleCount,
    externalOutcome: ingress.externalProtocolProof.terminalOutcome,
    externalStderrSha256:
      ingress.externalProtocolProof.sanitizedStderrSha256,
  })) {
    requireMarkdownValue(markdown, value, `finalEvidence.ingressClosure.${key}`);
  }
  for (const proof of ingress.internalFreshProofs) {
    for (const [key, value] of Object.entries({
      consumerId: proof.consumerId,
      postClosureDeployOrRunId: proof.postClosureDeployOrRunId,
      evidenceSha256: proof.evidenceSha256,
    })) {
      requireMarkdownValue(
        markdown,
        value,
      `finalEvidence.ingressClosure.${proof.consumerId}.${key}`,
      );
    }
  }
  const autoSync = ingress.autoSyncControl;
  const syncIdentity = ingress.blueprintSyncIdentity.available
    ? ingress.blueprintSyncIdentity.id
    : ingress.blueprintSyncIdentity.typedAbsence;
  const ingressLines = markdownSectionLines(
    markdown,
    8,
    'finalEvidence.ingressClosure',
  );
  const allMarkdownLines = markdown.split(/\r?\n/);
  for (const [key, [label, line]] of Object.entries({
    linkedBlueprint: [
      'Linked Blueprint/source:',
      `- Linked Blueprint/source: \`${autoSync.linkedBlueprintId}\` — `
        + `\`${autoSync.sourceRepository}\` / \`${autoSync.sourceBranch}\` / `
        + `\`${autoSync.blueprintPath}\``,
    ],
    autoSyncPreMerge: [
      'Auto Sync observed disabled before merge:',
      `- Auto Sync observed disabled before merge: `
        + `\`${autoSync.preMergeState}\` at \`${autoSync.observedDisabledAt}\`; `
        + `\`sha256:${autoSync.preMergeStateEvidenceSha256}\``,
    ],
    mergeObserved: [
      'Merge observed at:',
      `- Merge observed at: \`${autoSync.mergeObservedAt}\``,
    ],
    manualPreview: [
      'Manual Sync preview:',
      `- Manual Sync preview: \`${autoSync.manualPreviewObservedAt}\`; `
        + `\`sha256:${autoSync.manualPreviewSha256}\``,
    ],
    manualPreviewExpectedOnly: [
      'Manual Sync preview expected-only:',
      '- Manual Sync preview expected-only: `PASS`',
    ],
    blueprintSyncIdentity: [
      'Blueprint sync identity:',
      `- Blueprint sync identity: \`${syncIdentity}\``,
    ],
    manualSyncTerminal: [
      'Manual Sync terminal:',
      `- Manual Sync terminal: `
        + `\`${ingress.manualSyncTerminal.terminalOutcome}\` at `
        + `\`${ingress.manualSyncTerminal.observedAt}\`; `
        + `\`sha256:${ingress.manualSyncTerminal.evidenceSha256}\``,
    ],
    closureSaved: [
      'Closure saved at:',
      `- Closure saved at: \`${ingress.savedAt}\``,
    ],
    autoSyncFinal: [
      'Auto Sync final state:',
      `- Auto Sync final state: \`${autoSync.finalState}\` at `
        + `\`${autoSync.finalStateObservedAt}\`; `
        + `\`sha256:${autoSync.finalStateEvidenceSha256}\``,
    ],
  })) {
    requireControlledMarkdownLine(
      allMarkdownLines,
      ingressLines,
      label,
      line,
      `finalEvidence.ingressClosure.${key}`,
    );
  }

  const incidentLines = markdownSectionLines(
    markdown,
    11,
    'finalEvidence.secretExposureIncidents',
  );
  const expectedIncidentLines = receipt.secretExposureIncidents.map(
    incidentEvidenceLine,
  );
  const observedIncidentLines = allMarkdownLines.filter(
    (line) => line.includes('Secret-exposure incident'),
  );
  if (
    observedIncidentLines.length !== expectedIncidentLines.length
    || expectedIncidentLines.some((line) => (
      !incidentLines.includes(line)
      || observedIncidentLines.filter((candidate) => candidate === line).length
        !== 1
    ))
  ) {
    fail(
      'finalEvidence.secretExposureIncidents',
      'must exactly and uniquely bind every structured incident disposition',
    );
  }
}

export function validateOperatorEvidence(
  receiptInput,
  finalEvidenceMarkdown,
  { requirePass = true } = {},
) {
  const receipt = plainObject(receiptInput, 'receipt');
  assertNoPlaceholders(receipt);
  validateFinalEvidenceStructure(finalEvidenceMarkdown);

  exactKeys(receipt, 'receipt', [
    'schema',
    'status',
    'sourceDatabaseServiceId',
    'window',
    'consumerClosure',
    'operatorConfirmations',
    'actions',
    'secretExposureIncidents',
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
  const actionsById = new Map();
  for (const [index, action] of receipt.actions.entries()) {
    const location = `receipt.actions[${index}]`;
    exactKeys(action, location, [
      'actionId',
      'operationId',
      'gate',
      'kind',
      'startedAt',
      'completedAt',
      'targetId',
      'terminalOutcome',
      'evidenceSha256',
      'rollbackOutcome',
      'resolvesActionId',
      'secretsCaptured',
    ]);
    const actionId = nonemptyString(action.actionId, `${location}.actionId`);
    if (actionsById.has(actionId)) {
      fail(`${location}.actionId`, 'duplicates an action');
    }
    const operationId = nonemptyString(
      action.operationId,
      `${location}.operationId`,
    );
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
    enumValue(
      action.rollbackOutcome,
      `${location}.rollbackOutcome`,
      ['not_needed', 'rolled_back', 'contained', 'rollback_failed', 'pending'],
    );
    const resolvesActionId = nullableString(
      action.resolvesActionId,
      `${location}.resolvesActionId`,
    );
    if (
      action.terminalOutcome === 'succeeded'
      && action.rollbackOutcome !== 'not_needed'
    ) {
      fail(location, 'successful action must use rollbackOutcome not_needed');
    }
    if (action.secretsCaptured !== false) {
      fail(`${location}.secretsCaptured`, 'must be false');
    }
    const normalizedAction = {
      actionId,
      operationId,
      gate,
      targetId: action.targetId,
      startedAt,
      completedAt,
      terminalOutcome: action.terminalOutcome,
      rollbackOutcome: action.rollbackOutcome,
      resolvesActionId,
    };
    actionsById.set(actionId, normalizedAction);
    actionsByGate.get(gate).push(normalizedAction);
  }

  for (const action of actionsById.values()) {
    if (action.resolvesActionId !== null) {
      const failed = actionsById.get(action.resolvesActionId);
      if (
        action.terminalOutcome !== 'succeeded'
        || !failed
        || failed.terminalOutcome !== 'failed'
        || failed.completedAt > action.startedAt
        || failed.gate !== action.gate
        || failed.operationId !== action.operationId
        || failed.targetId !== action.targetId
      ) {
        fail(
          `receipt.actions.${action.actionId}.resolvesActionId`,
          'does not resolve an earlier failed action for the same operation and target',
        );
      }
    }
  }
  for (const failed of [...actionsById.values()].filter(
    (action) => action.terminalOutcome === 'failed',
  )) {
    const contained = ['rolled_back', 'contained'].includes(
      failed.rollbackOutcome,
    );
    const resolved = [...actionsById.values()].some(
      (action) => action.resolvesActionId === failed.actionId,
    );
    if (!contained && !resolved) {
      fail(
        `receipt.actions.${failed.actionId}`,
        'failed action has no rollback, containment, or linked resolution',
      );
    }
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

  const incidents = receipt.secretExposureIncidents;
  if (!Array.isArray(incidents) || incidents.length < 1) {
    fail(
      'receipt.secretExposureIncidents',
      'must include the known Blueprint Sync Hook exposure',
    );
  }
  const incidentIds = new Set();
  const incidentDecisionIds = new Set();
  const incidentActionIds = new Set();
  const authorityIds = new Set(actionsById.keys());
  const normalizedIncidents = [];
  let requiredIncidentCount = 0;
  for (const [index, incident] of incidents.entries()) {
    const location = `receipt.secretExposureIncidents[${index}]`;
    exactKeys(incident, location, [
      'incidentId',
      'kind',
      'observedAt',
      'targetIdentityKind',
      'targetSha256',
      'operatorDecision',
      'disposition',
    ]);
    const incidentId = incident.incidentId === REQUIRED_SECRET_EXPOSURE_ID
      ? incident.incidentId
      : structuredIdValue(
        incident.incidentId,
        `${location}.incidentId`,
        INCIDENT_ID_RE,
      );
    if (incidentIds.has(incidentId)) {
      fail(`${location}.incidentId`, 'duplicates an incident');
    }
    if (authorityIds.has(incidentId)) {
      fail(`${location}.incidentId`, 'duplicates another authority identity');
    }
    incidentIds.add(incidentId);
    authorityIds.add(incidentId);
    const incidentKind = enumValue(
      incident.kind,
      `${location}.kind`,
      Object.keys(SECRET_EXPOSURE_METHODS),
    );
    if (incidentId === REQUIRED_SECRET_EXPOSURE_ID) {
      if (
        incidentKind !== REQUIRED_SECRET_EXPOSURE_KIND
        || incident.observedAt !== REQUIRED_SECRET_EXPOSURE_OBSERVED_AT
        || utcValue(incident.observedAt, `${location}.observedAt`) >= windowStart
      ) {
        fail(
          location,
          'known Blueprint Sync Hook incident must retain its pre-window identity',
        );
      }
      requiredIncidentCount += 1;
    }
    const observedAt = utcValue(incident.observedAt, `${location}.observedAt`);
    if (incidentId !== REQUIRED_SECRET_EXPOSURE_ID) {
      const [, idKind, idDay] = incidentId.match(INCIDENT_ID_RE);
      const expectedIdKind =
        incidentKind === 'render_blueprint_sync_hook_dom_exposure'
          ? 'blueprint-sync-hook'
          : 'database-credential';
      if (
        idKind !== expectedIdKind
        || idDay !== utcDayToken(observedAt)
      ) {
        fail(
          `${location}.incidentId`,
          'must bind the incident kind and observed UTC day',
        );
      }
    }
    if (observedAt > windowEnd) {
      fail(`${location}.observedAt`, 'is after the operator window');
    }
    const targetIdentityKind = enumValue(
      incident.targetIdentityKind,
      `${location}.targetIdentityKind`,
      ['render_blueprint_id', 'database_username'],
    );
    const expectedTargetIdentityKind =
      incidentKind === 'render_blueprint_sync_hook_dom_exposure'
        ? 'render_blueprint_id'
        : 'database_username';
    if (targetIdentityKind !== expectedTargetIdentityKind) {
      fail(
        `${location}.targetIdentityKind`,
        'does not match the incident kind',
      );
    }
    const targetDigest = sha256Value(
      incident.targetSha256,
      `${location}.targetSha256`,
    );

    const decision = incident.operatorDecision;
    exactKeys(decision, `${location}.operatorDecision`, [
      'decisionId',
      'confirmedAt',
      'decision',
      'targetSha256',
    ]);
    const decisionId = structuredIdValue(
      decision.decisionId,
      `${location}.operatorDecision.decisionId`,
      DECISION_ID_RE,
    );
    if (incidentDecisionIds.has(decisionId)) {
      fail(`${location}.operatorDecision.decisionId`, 'duplicates a decision');
    }
    incidentDecisionIds.add(decisionId);
    if (authorityIds.has(decisionId)) {
      fail(
        `${location}.operatorDecision.decisionId`,
        'duplicates another authority identity',
      );
    }
    authorityIds.add(decisionId);
    const decisionAt = utcValue(
      decision.confirmedAt,
      `${location}.operatorDecision.confirmedAt`,
    );
    if (
      decisionId.match(DECISION_ID_RE)[1] !== utcDayToken(decisionAt)
    ) {
      fail(
        `${location}.operatorDecision.decisionId`,
        'must bind the decision UTC day',
      );
    }
    if (decisionAt < windowStart || decisionAt > windowEnd) {
      fail(`${location}.operatorDecision.confirmedAt`, 'is outside the window');
    }
    enumValue(
      decision.decision,
      `${location}.operatorDecision.decision`,
      ['approved', 'denied'],
    );
    if (
      sha256Value(
        decision.targetSha256,
        `${location}.operatorDecision.targetSha256`,
      ) !== targetDigest
    ) {
      fail(`${location}.operatorDecision.targetSha256`, 'does not match target');
    }
    if (requirePass && decision.decision !== 'approved') {
      fail(`${location}.operatorDecision.decision`, 'must be approved for PASS');
    }

    const disposition = incident.disposition;
    const acceptedRenderResidual =
      disposition?.kind === 'operator_accepted_residual';
    if (acceptedRenderResidual) {
      if (
        incidentId !== REQUIRED_SECRET_EXPOSURE_ID
        || incidentKind !== REQUIRED_SECRET_EXPOSURE_KIND
      ) {
        fail(
          `${location}.disposition.kind`,
          'operator-accepted residual is limited to the known pre-window Render Blueprint Sync Hook incident',
        );
      }
      exactKeys(disposition, `${location}.disposition`, [
        'kind',
        'actionId',
        'startedAt',
        'completedAt',
        'terminalOutcome',
        'riskClass',
        'environmentClass',
        'reviewBy',
        'mitigations',
        'reopenTriggers',
        'blueprintContinuity',
        'acceptanceEvidenceSha256',
        'secretsCaptured',
      ]);
    } else {
      exactKeys(disposition, `${location}.disposition`, [
        'actionId',
        'startedAt',
        'completedAt',
        'terminalOutcome',
        'providerMethod',
        'providerReceipt',
        'credentialNegativeProof',
        'blueprintContinuity',
        'terminalProofSha256',
        'secretsCaptured',
      ]);
    }
    const dispositionActionId = structuredIdValue(
      disposition.actionId,
      `${location}.disposition.actionId`,
      SECRET_ACTION_ID_RE,
    );
    if (
      incidentActionIds.has(dispositionActionId)
      || actionsById.has(dispositionActionId)
    ) {
      fail(`${location}.disposition.actionId`, 'duplicates another action');
    }
    incidentActionIds.add(dispositionActionId);
    if (authorityIds.has(dispositionActionId)) {
      fail(
        `${location}.disposition.actionId`,
        'duplicates another authority identity',
      );
    }
    authorityIds.add(dispositionActionId);
    const dispositionStartedAt = utcValue(
      disposition.startedAt,
      `${location}.disposition.startedAt`,
    );
    const dispositionCompletedAt = utcValue(
      disposition.completedAt,
      `${location}.disposition.completedAt`,
    );
    if (
      dispositionActionId.match(SECRET_ACTION_ID_RE)[1]
        !== utcDayToken(dispositionStartedAt)
    ) {
      fail(
        `${location}.disposition.actionId`,
        'must bind the action start UTC day',
      );
    }
    if (
      observedAt > decisionAt
      || decisionAt > dispositionStartedAt
      || dispositionStartedAt > dispositionCompletedAt
      || dispositionStartedAt < windowStart
      || dispositionCompletedAt > windowEnd
    ) {
      fail(location, 'incident approval/disposition chronology is invalid');
    }
    let providerObservedAt = dispositionCompletedAt;
    if (acceptedRenderResidual) {
      enumValue(
        disposition.terminalOutcome,
        `${location}.disposition.terminalOutcome`,
        ['accepted_residual'],
      );
      enumValue(
        disposition.riskClass,
        `${location}.disposition.riskClass`,
        ['unauthorized_blueprint_sync'],
      );
      enumValue(
        disposition.environmentClass,
        `${location}.disposition.environmentClass`,
        ['non_strategic_dogfood'],
      );
      const reviewBy = utcValue(
        disposition.reviewBy,
        `${location}.disposition.reviewBy`,
      );
      const maximumReviewBy =
        dispositionCompletedAt + (31 * 24 * 60 * 60 * 1000);
      if (reviewBy <= windowEnd || reviewBy > maximumReviewBy) {
        fail(
          `${location}.disposition.reviewBy`,
          'must be after the operator window and no more than 31 days after acceptance',
        );
      }
      exactStringArray(
        disposition.mitigations,
        `${location}.disposition.mitigations`,
        ACCEPTED_RENDER_RESIDUAL_MITIGATIONS,
      );
      exactStringArray(
        disposition.reopenTriggers,
        `${location}.disposition.reopenTriggers`,
        ACCEPTED_RENDER_RESIDUAL_REOPEN_TRIGGERS,
      );
      sha256Value(
        disposition.acceptanceEvidenceSha256,
        `${location}.disposition.acceptanceEvidenceSha256`,
      );
    } else {
      enumValue(
        disposition.terminalOutcome,
        `${location}.disposition.terminalOutcome`,
        ['rotated', 'invalidated'],
      );
      const providerMethod = enumValue(
        disposition.providerMethod,
        `${location}.disposition.providerMethod`,
        SECRET_EXPOSURE_METHODS[incidentKind],
      );
      const expectedTerminalOutcome = providerMethod.startsWith('revoke_')
        ? 'invalidated'
        : 'rotated';
      if (disposition.terminalOutcome !== expectedTerminalOutcome) {
        fail(
          `${location}.disposition.terminalOutcome`,
          'does not match the provider method',
        );
      }
      const providerReceipt = disposition.providerReceipt;
      exactKeys(providerReceipt, `${location}.disposition.providerReceipt`, [
        'kind',
        'observedAt',
        'action',
        'terminalOutcome',
        'targetSha256',
        'evidenceSha256',
        'secretsCaptured',
      ]);
      enumValue(
        providerReceipt.kind,
        `${location}.disposition.providerReceipt.kind`,
        ['render_dashboard_terminal_observation'],
      );
      providerObservedAt = utcValue(
        providerReceipt.observedAt,
        `${location}.disposition.providerReceipt.observedAt`,
      );
      if (
        providerObservedAt < dispositionStartedAt
        || providerObservedAt > dispositionCompletedAt
      ) {
        fail(
          `${location}.disposition.providerReceipt.observedAt`,
          'must be observed during the disposition action',
        );
      }
      if (
        enumValue(
          providerReceipt.action,
          `${location}.disposition.providerReceipt.action`,
          SECRET_EXPOSURE_METHODS[incidentKind],
        ) !== providerMethod
        || enumValue(
          providerReceipt.terminalOutcome,
          `${location}.disposition.providerReceipt.terminalOutcome`,
          ['rotated', 'invalidated'],
        ) !== disposition.terminalOutcome
        || sha256Value(
          providerReceipt.targetSha256,
          `${location}.disposition.providerReceipt.targetSha256`,
        ) !== targetDigest
      ) {
        fail(
          `${location}.disposition.providerReceipt`,
          'does not bind the exact method, outcome, and typed target',
        );
      }
      sha256Value(
        providerReceipt.evidenceSha256,
        `${location}.disposition.providerReceipt.evidenceSha256`,
      );
      if (providerReceipt.secretsCaptured !== false) {
        fail(
          `${location}.disposition.providerReceipt.secretsCaptured`,
          'must be false',
        );
      }
    }
    const credentialNegativeProof = disposition.credentialNegativeProof;
    if (
      !acceptedRenderResidual
      && incidentKind === 'render_database_credential_dom_exposure'
    ) {
      const proofLocation =
        `${location}.disposition.credentialNegativeProof`;
      exactKeys(credentialNegativeProof, proofLocation, [
        'observedAt',
        'terminalOutcome',
        'usernameSha256',
        'evidenceSha256',
        'secretsCaptured',
      ]);
      const proofObservedAt = utcValue(
        credentialNegativeProof.observedAt,
        `${proofLocation}.observedAt`,
      );
      if (
        proofObservedAt < providerObservedAt
        || proofObservedAt > dispositionCompletedAt
        || enumValue(
          credentialNegativeProof.terminalOutcome,
          `${proofLocation}.terminalOutcome`,
          ['authentication_rejected'],
        ) !== 'authentication_rejected'
        || sha256Value(
          credentialNegativeProof.usernameSha256,
          `${proofLocation}.usernameSha256`,
        ) !== targetDigest
      ) {
        fail(
          proofLocation,
          'must prove authentication rejection for the exact exposed username',
        );
      }
      sha256Value(
        credentialNegativeProof.evidenceSha256,
        `${proofLocation}.evidenceSha256`,
      );
      if (credentialNegativeProof.secretsCaptured !== false) {
        fail(`${proofLocation}.secretsCaptured`, 'must be false');
      }
    } else if (!acceptedRenderResidual && credentialNegativeProof !== null) {
      fail(
        `${location}.disposition.credentialNegativeProof`,
        'must be null for a non-credential incident',
      );
    }
    const blueprintContinuity = disposition.blueprintContinuity;
    exactKeys(
      blueprintContinuity,
      `${location}.disposition.blueprintContinuity`,
      ['before', 'after', 'comparisonResult'],
    );
    const continuityObservations = {};
    for (const phase of ['before', 'after']) {
      const observation = blueprintContinuity[phase];
      const observationLocation =
        `${location}.disposition.blueprintContinuity.${phase}`;
      exactKeys(observation, observationLocation, [
        'observedAt',
        'blueprintId',
        'sourceRepository',
        'sourceBranch',
        'blueprintPath',
        'evidenceSha256',
      ]);
      continuityObservations[phase] = {
        observedAt: utcValue(
          observation.observedAt,
          `${observationLocation}.observedAt`,
        ),
        blueprintId: safeIdValue(
          observation.blueprintId,
          `${observationLocation}.blueprintId`,
        ),
        sourceRepository: enumValue(
          observation.sourceRepository,
          `${observationLocation}.sourceRepository`,
          ['Glera/swipe-backend'],
        ),
        sourceBranch: enumValue(
          observation.sourceBranch,
          `${observationLocation}.sourceBranch`,
          ['master'],
        ),
        blueprintPath: enumValue(
          observation.blueprintPath,
          `${observationLocation}.blueprintPath`,
          ['render.yaml'],
        ),
        evidenceSha256: sha256Value(
          observation.evidenceSha256,
          `${observationLocation}.evidenceSha256`,
        ),
      };
    }
    if (
      continuityObservations.before.observedAt > dispositionStartedAt
      || continuityObservations.before.observedAt < decisionAt
      || continuityObservations.after.observedAt < dispositionCompletedAt
      || continuityObservations.before.observedAt < windowStart
      || continuityObservations.after.observedAt > windowEnd
      || (
        observedAt < windowStart
        && continuityObservations.after.observedAt
          > gateBounds.get('A').gateStart
      )
      || JSON.stringify({
        ...continuityObservations.before,
        observedAt: null,
        evidenceSha256: null,
      }) !== JSON.stringify({
        ...continuityObservations.after,
        observedAt: null,
        evidenceSha256: null,
      })
      || blueprintContinuity.comparisonResult !== 'equal'
      || continuityObservations.before.evidenceSha256
        === continuityObservations.after.evidenceSha256
    ) {
      fail(
        `${location}.disposition.blueprintContinuity`,
        'must prove equal dated observations before and after disposition',
      );
    }
    const continuityBlueprintId = continuityObservations.after.blueprintId;
    const closedBlueprintIds = new Set(
      [...consumers.values()].map((consumer) => consumer.blueprintReferenceId),
    );
    if (
      closedBlueprintIds.size !== 1
      || !closedBlueprintIds.has(continuityBlueprintId)
    ) {
      fail(
        `${location}.disposition.blueprintContinuity`,
        'does not bind the exact closed Blueprint target',
      );
    }
    if (
      incidentKind === REQUIRED_SECRET_EXPOSURE_KIND
      && targetDigest !== crypto
        .createHash('sha256')
        .update(continuityBlueprintId)
        .digest('hex')
    ) {
      fail(
        `${location}.targetSha256`,
        'does not bind the typed provider target',
      );
    }
    if (!acceptedRenderResidual) {
      sha256Value(
        disposition.terminalProofSha256,
        `${location}.disposition.terminalProofSha256`,
      );
    }
    if (disposition.secretsCaptured !== false) {
      fail(`${location}.disposition.secretsCaptured`, 'must be false');
    }

    normalizedIncidents.push({
      actionId: dispositionActionId,
      observedAt,
      dispositionStartedAt,
      dispositionCompletedAt,
    });
    if (observedAt < windowStart) {
      if (dispositionCompletedAt > gateBounds.get('A').gateStart) {
        fail(
          location,
          'known pre-window incident lacks a terminal provider disposition or explicit operator risk acceptance before Gate A',
        );
      }
    }
  }
  if (requiredIncidentCount !== 1) {
    fail(
      'receipt.secretExposureIncidents',
      'must contain exactly one known Blueprint Sync Hook exposure',
    );
  }
  const unifiedActions = [
    ...actionsById.values(),
    ...normalizedIncidents.map((incident) => ({
      actionId: incident.actionId,
      startedAt: incident.dispositionStartedAt,
      completedAt: incident.dispositionCompletedAt,
      terminalOutcome: 'succeeded',
      rollbackOutcome: 'not_needed',
      kind: 'secret-disposition',
    })),
  ];
  for (const incident of normalizedIncidents.filter(
    (candidate) => candidate.observedAt >= windowStart,
  )) {
    for (const action of unifiedActions) {
      if (action.actionId === incident.actionId) {
        continue;
      }
      const spansObservation =
        action.startedAt < incident.observedAt
        && action.completedAt > incident.observedAt;
      const containedBeforeDisposition =
        action.kind !== 'secret-disposition'
        && action.terminalOutcome === 'failed'
        && ['rolled_back', 'contained'].includes(action.rollbackOutcome)
        && action.completedAt <= incident.dispositionStartedAt;
      const startsBeforeDisposition =
        action.startedAt >= incident.observedAt
        && action.startedAt < incident.dispositionCompletedAt;
      if (
        (spansObservation && !containedBeforeDisposition)
        || startsBeforeDisposition
      ) {
        fail(
          'receipt.secretExposureIncidents',
          'an action continued or started before incident disposition',
        );
      }
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
    'startRecoveryObservationSha256',
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
  sha256Value(
    drill.startRecoveryObservationSha256,
    'receipt.restoreDrill.startRecoveryObservationSha256',
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
  if (Math.abs(startRecoveryDbClock - recoveryStartedAt) > 60 * 1000) {
    fail(
      'receipt.restoreDrill.startRecoveryDbClock',
      'is more than 60 seconds from the Start Recovery action',
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
  const expectedRuntimeIdentities = [...consumers.values()].map(
    (consumer) => consumer.postSyncDeployOrRunId,
  );
  const continuityEqual = (
    continuity.before.status === 'available'
    && continuity.after.status === 'available'
    && equalStringSets(
      continuity.before.deployIdentities,
      expectedRuntimeIdentities,
    )
    && equalStringSets(
      continuity.after.deployIdentities,
      expectedRuntimeIdentities,
    )
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
    'autoSyncControl',
    'blueprintSyncIdentity',
    'manualSyncTerminal',
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
  const autoSync = ingress.autoSyncControl;
  exactKeys(autoSync, 'receipt.ingressClosure.autoSyncControl', [
    'linkedBlueprintId',
    'sourceRepository',
    'sourceBranch',
    'blueprintPath',
    'preMergeState',
    'observedDisabledAt',
    'preMergeStateEvidenceSha256',
    'mergeObservedAt',
    'manualPreviewObservedAt',
    'manualPreviewExpectedOnly',
    'manualPreviewSha256',
    'finalState',
    'finalStateObservedAt',
    'finalStateEvidenceSha256',
  ]);
  nonemptyString(
    autoSync.linkedBlueprintId,
    'receipt.ingressClosure.autoSyncControl.linkedBlueprintId',
  );
  enumValue(
    autoSync.sourceRepository,
    'receipt.ingressClosure.autoSyncControl.sourceRepository',
    ['Glera/swipe-backend'],
  );
  enumValue(
    autoSync.sourceBranch,
    'receipt.ingressClosure.autoSyncControl.sourceBranch',
    ['master'],
  );
  enumValue(
    autoSync.blueprintPath,
    'receipt.ingressClosure.autoSyncControl.blueprintPath',
    ['render.yaml'],
  );
  enumValue(
    autoSync.preMergeState,
    'receipt.ingressClosure.autoSyncControl.preMergeState',
    ['disabled'],
  );
  const autoSyncDisabledAt = utcValue(
    autoSync.observedDisabledAt,
    'receipt.ingressClosure.autoSyncControl.observedDisabledAt',
  );
  sha256Value(
    autoSync.preMergeStateEvidenceSha256,
    'receipt.ingressClosure.autoSyncControl.preMergeStateEvidenceSha256',
  );
  const mergeObservedAt = utcValue(
    autoSync.mergeObservedAt,
    'receipt.ingressClosure.autoSyncControl.mergeObservedAt',
  );
  const manualPreviewObservedAt = utcValue(
    autoSync.manualPreviewObservedAt,
    'receipt.ingressClosure.autoSyncControl.manualPreviewObservedAt',
  );
  if (
    booleanValue(
      autoSync.manualPreviewExpectedOnly,
      'receipt.ingressClosure.autoSyncControl.manualPreviewExpectedOnly',
    ) !== true
  ) {
    fail(
      'receipt.ingressClosure.autoSyncControl.manualPreviewExpectedOnly',
      'must be true',
    );
  }
  sha256Value(
    autoSync.manualPreviewSha256,
    'receipt.ingressClosure.autoSyncControl.manualPreviewSha256',
  );
  enumValue(
    autoSync.finalState,
    'receipt.ingressClosure.autoSyncControl.finalState',
    ['disabled'],
  );
  const autoSyncFinalObservedAt = utcValue(
    autoSync.finalStateObservedAt,
    'receipt.ingressClosure.autoSyncControl.finalStateObservedAt',
  );
  sha256Value(
    autoSync.finalStateEvidenceSha256,
    'receipt.ingressClosure.autoSyncControl.finalStateEvidenceSha256',
  );
  validateSyncIdentity(
    ingress.blueprintSyncIdentity,
    'receipt.ingressClosure.blueprintSyncIdentity',
  );
  if (
    ingress.blueprintSyncIdentity.available === false
    && ingress.blueprintSyncIdentity.typedAbsence
      !== 'dashboard_did_not_expose_opaque_id'
  ) {
    fail(
      'receipt.ingressClosure.blueprintSyncIdentity.typedAbsence',
      'must describe only an unavailable opaque sync id',
    );
  }
  const manualSyncTerminal = ingress.manualSyncTerminal;
  exactKeys(
    manualSyncTerminal,
    'receipt.ingressClosure.manualSyncTerminal',
    ['terminalOutcome', 'observedAt', 'evidenceSha256'],
  );
  enumValue(
    manualSyncTerminal.terminalOutcome,
    'receipt.ingressClosure.manualSyncTerminal.terminalOutcome',
    ['succeeded'],
  );
  const manualSyncTerminalObservedAt = utcValue(
    manualSyncTerminal.observedAt,
    'receipt.ingressClosure.manualSyncTerminal.observedAt',
  );
  sha256Value(
    manualSyncTerminal.evidenceSha256,
    'receipt.ingressClosure.manualSyncTerminal.evidenceSha256',
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
  for (const [location, timestamp] of [
    ['observedDisabledAt', autoSyncDisabledAt],
    ['mergeObservedAt', mergeObservedAt],
    ['manualPreviewObservedAt', manualPreviewObservedAt],
    ['manualSyncTerminal.observedAt', manualSyncTerminalObservedAt],
    ['finalStateObservedAt', autoSyncFinalObservedAt],
  ]) {
    if (
      timestamp < gateBounds.get('G').gateStart
      || timestamp > gateBounds.get('G').gateEnd
    ) {
      fail(
        `receipt.ingressClosure.autoSyncControl.${location}`,
        'is outside Gate G',
      );
    }
  }
  if (
    !(
      autoSyncDisabledAt < mergeObservedAt
      && mergeObservedAt < manualPreviewObservedAt
      && manualPreviewObservedAt < manualSyncTerminalObservedAt
      && manualSyncTerminalObservedAt < ingressSavedAt
      && ingressSavedAt < autoSyncFinalObservedAt
    )
  ) {
    fail(
      'receipt.ingressClosure.autoSyncControl',
      'must prove disabled-before-merge, preview-before-sync, and disabled-final ordering',
    );
  }
  const blueprintReferenceIds = new Set(
    [...consumers.values()].map((consumer) => consumer.blueprintReferenceId),
  );
  if (
    blueprintReferenceIds.size !== 1
    || !blueprintReferenceIds.has(autoSync.linkedBlueprintId)
  ) {
    fail(
      'receipt.ingressClosure.autoSyncControl.linkedBlueprintId',
      'must match the exact closed consumer Blueprint authority',
    );
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
    const postClosureDeployOrRunId = nonemptyString(
      proof.postClosureDeployOrRunId,
      `${location}.postClosureDeployOrRunId`,
    );
    if (
      consumer.kind !== 'web'
      && postClosureDeployOrRunId === proof.rotationDeployOrRunId
    ) {
      fail(
        `${location}.postClosureDeployOrRunId`,
        'run-based consumer must have a fresh post-closure run identity',
      );
    }
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

  validateFinalEvidenceBindings(finalEvidenceMarkdown, receipt);

  return {
    schema: 'platform-reliability-r1-operator-evidence-validation.v1',
    status: receipt.status,
    gateCount: GATES.length,
    actionCount: receipt.actions.length,
    consumerCount: consumers.size,
    secretExposureIncidentCount: incidents.length,
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
