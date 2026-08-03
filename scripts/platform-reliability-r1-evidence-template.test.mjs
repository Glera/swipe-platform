import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  R1_COMPLETION_REQUIREMENTS,
} from './platform-reliability-r1-operator-receipt-validate.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FINAL_TEMPLATE = path.join(
  ROOT,
  'docs/templates/platform-reliability-r1-final-evidence-template.md',
);
const RECEIPT_TEMPLATE = path.join(
  ROOT,
  'docs/templates/platform-reliability-r1-operator-receipt-template.json',
);
const OPERATOR_RUNBOOK = path.join(
  ROOT,
  'platform-reliability-r1-operator-runbook.md',
);
const GATE_C_CONTRACT = path.join(
  ROOT,
  'platform-reliability-r1-gate-c-contract.md',
);
const RENDER_SUPPORT_RESPONSE = path.join(
  ROOT,
  'platform-reliability-r1-gate-c-render-support-response.json',
);

test('final evidence template preserves every completion requirement and gate', () => {
  const markdown = fs.readFileSync(FINAL_TEMPLATE, 'utf8');

  for (const requirement of R1_COMPLETION_REQUIREMENTS) {
    assert.equal(
      markdown.includes(`| ${requirement} |`),
      true,
      `missing completion requirement: ${requirement}`,
    );
  }
  for (const gate of ['A', 'B', 'C', 'D', 'E', 'F', 'G']) {
    assert.match(markdown, new RegExp(`\\| ${gate} —`));
  }
  assert.match(markdown, /platform-reliability-r1-evidence-scan\.mjs/);
  assert.match(
    markdown,
    /platform-reliability-r1-gate-c0-blueprint-comparison\.json/,
  );
  assert.match(markdown, /Blueprint replacement comparator source digest/);
  assert.match(markdown, /--base-ref origin\/master/);
  assert.match(
    markdown,
    /R1 is complete only when every/,
  );
  assert.match(markdown, /r1-window-blueprint-sync-hook-dom-20260802-1/);
  assert.match(markdown, /replace_blueprint/);
  assert.match(markdown, /replaced_same_source_and_services/);
});

test('operator receipt template is valid JSON with exact A-G confirmations', () => {
  const receipt = JSON.parse(fs.readFileSync(RECEIPT_TEMPLATE, 'utf8'));

  assert.equal(
    receipt.schema,
    'platform-reliability-r1-operator-receipt.v1',
  );
  assert.deepEqual(
    receipt.operatorConfirmations.map((confirmation) => confirmation.gate),
    ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  );
  assert.equal(receipt.secretsCaptured, false);
  assert.equal(receipt.ingressNarrowing.cidrKind, 'single-ipv4');
  assert.ok(Array.isArray(receipt.consumerClosure.consumers));
  assert.ok(Array.isArray(receipt.actions));
  assert.ok(Array.isArray(receipt.secretExposureIncidents));
  assert.equal(
    receipt.secretExposureIncidents[0].kind,
    'render_blueprint_sync_hook_dom_exposure',
  );
  assert.equal(
    receipt.secretExposureIncidents[0].incidentId,
    'r1-prewindow-blueprint-sync-hook-dom-20260729',
  );
  assert.equal(
    receipt.secretExposureIncidents[0].targetIdentityKind,
    'render_blueprint_id',
  );
  assert.ok(receipt.secretExposureIncidents[0].operatorDecision.decisionId);
  assert.ok(receipt.secretExposureIncidents[0].disposition.actionId);
  assert.equal(
    receipt.secretExposureIncidents[0].disposition.kind,
    'operator_accepted_residual',
  );
  assert.equal(
    receipt.secretExposureIncidents[0].disposition.terminalOutcome,
    'accepted_residual',
  );
  assert.equal(
    receipt.secretExposureIncidents[0].disposition.environmentClass,
    'non_strategic_dogfood',
  );
  assert.ok(receipt.secretExposureIncidents[0].disposition.reviewBy);
  assert.ok(
    receipt.secretExposureIncidents[0].disposition.reopenTriggers.includes(
      'before_render_strategic_commitment',
    ),
  );
  assert.equal(
    receipt.secretExposureIncidents[0].disposition
      .blueprintContinuity.before.blueprintId,
    receipt.secretExposureIncidents[0].disposition
      .blueprintContinuity.after.blueprintId,
  );
  assert.equal(
    receipt.secretExposureIncidents[0].disposition
      .blueprintContinuity.comparisonResult,
    'equal',
  );
  assert.equal(
    receipt.secretExposureIncidents[0].disposition.secretsCaptured,
    false,
  );
  assert.equal(
    receipt.secretExposureIncidents[1].incidentId,
    'r1-window-blueprint-sync-hook-dom-20260802-1',
  );
  assert.equal(
    receipt.secretExposureIncidents[1].disposition.providerMethod,
    'replace_blueprint',
  );
  assert.equal(
    receipt.secretExposureIncidents[1].disposition
      .blueprintContinuity.comparisonResult,
    'replaced_same_source_and_services',
  );
  assert.equal(
    receipt.secretExposureIncidents[1].disposition
      .blueprintContinuity.evidenceClass,
    'operator_attested',
  );
  assert.ok(Array.isArray(receipt.ingressClosure.internalFreshProofs));
  assert.ok(receipt.restoreDrill.beforeObservation.observedDbAt);
  assert.ok(receipt.restoreDrill.afterTerminalRun.runId);
  assert.ok(receipt.restoreDrill.startRecoveryDbClock);
  assert.ok(receipt.restoreDrill.startRecoveryObservationSha256);
  assert.ok(receipt.restoreDrill.sourceContinuity.before.deployIdentities);
  assert.ok(receipt.restoreDrill.sourceContinuity.after.bindingsSha256);
  assert.ok(Object.hasOwn(receipt.restoreDrill.cleanup, 'namedOwner'));
  assert.ok(Object.hasOwn(receipt.restoreDrill.cleanup, 'financeNotificationId'));
  assert.ok(Object.hasOwn(receipt.restoreDrill.cleanup, 'deletionDeadline'));
  for (const field of [
    'rotationDeployOrRunId',
    'postClosureDeployOrRunId',
    'rotationRuntimeIdentitySha256',
    'newUsernameSha256',
  ]) {
    assert.ok(Object.hasOwn(receipt.ingressClosure.internalFreshProofs[0], field));
  }
  for (const field of [
    'actionId',
    'operationId',
    'resolvesActionId',
  ]) {
    assert.ok(Object.hasOwn(receipt.actions[0], field));
  }
  assert.equal(
    Object.hasOwn(receipt, 'password')
      || Object.hasOwn(receipt, 'databaseUrl')
      || Object.hasOwn(receipt, 'connectionString'),
    false,
  );
});

test('operator runbook narrowly records the accepted Render residual', () => {
  const runbook = fs.readFileSync(OPERATOR_RUNBOOK, 'utf8');

  assert.match(runbook, /Historical operator deferral 2026-07-30/);
  assert.match(runbook, /Gate A и Gate B исполнены/);
  assert.match(runbook, /Gate C остановлен новым Sync Hook incident/);
  assert.match(runbook, /R1 нельзя обозначать[\s\S]+complete/);
  assert.match(runbook, /не позже `2026-08-29`/);
  assert.match(runbook, /Старое[\s\S]+готов к operator window[\s\S]+не переносится/);
  assert.match(runbook, /provider_path_not_documented/);
  assert.match(
    runbook,
    /api-docs\.render\.com\/v1\.0\/openapi\/render-public-api-1\.json/,
  );
  assert.match(runbook, /operator_accepted_residual/);
  assert.match(runbook, /non_strategic_dogfood/);
  assert.match(runbook, /до 100 DAU/);
  assert.match(
    runbook,
    /каждый известный до окна[\s\S]+operator_accepted_residual/,
  );
  assert.doesNotMatch(
    runbook,
    /каждый известный до окна[\s\S]{0,240}обязательно закрывается/,
  );
  assert.match(runbook, /Выключение Auto Sync не доказывает инвалидирование hook/);
  assert.match(runbook, /Ни новый Sync Hook incident[\s\S]+принять нельзя/);
});

test('Gate C records the human Render remediation without claiming completion', () => {
  const response = JSON.parse(
    fs.readFileSync(RENDER_SUPPORT_RESPONSE, 'utf8'),
  );
  const contract = fs.readFileSync(GATE_C_CONTRACT, 'utf8');

  assert.equal(
    response.schema,
    'platform-reliability-r1-render-support-response.v1',
  );
  assert.equal(response.responseActorKind, 'human_render_support_agent');
  assert.equal(
    response.providerStatements.supportedRemediation,
    'delete_existing_blueprint_then_create_new_blueprint',
  );
  assert.equal(
    response.providerStatements.lastObservedSyncAt,
    '2026-07-30T15:09:14Z',
  );
  assert.equal(response.evidenceLimits.oldHookTerminallyInvalidated, false);
  assert.equal(response.secretValueCaptured, false);
  assert.match(contract, /Status: \*\*BLOCKED, NOT APPLIED\*\*/);
  assert.match(contract, /GO Gate C0/);
  assert.match(contract, /PREPARED, NOT AUTHORIZED/);
  assert.match(contract, /Delete only old Blueprint/);
  assert.match(contract, /unchanged service IDs/);
  assert.match(contract, /Do not read or expose the new Sync Hook/);
  assert.match(contract, /fromDatabase\.connectionString/);
  assert.match(contract, /Suspend `swipe-seq-shadow-run`/);
  assert.match(contract, /hard deadline no more than 900 seconds/);
  assert.match(contract, /unconfirmed_compensated_by_quiescence/);
  assert.match(contract, /evidenceClass=operator_attested/);
  assert.match(contract, /providerVerifiedServiceContinuity=false/);
});
