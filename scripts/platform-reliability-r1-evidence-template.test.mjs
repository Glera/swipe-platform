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
  assert.match(markdown, /--base-ref origin\/master/);
  assert.match(markdown, /R1 is complete only when every completion-matrix row is `PASS`/);
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
