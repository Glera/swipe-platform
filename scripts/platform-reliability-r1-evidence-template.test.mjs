import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FINAL_TEMPLATE = path.join(
  ROOT,
  'docs/templates/platform-reliability-r1-final-evidence-template.md',
);
const RECEIPT_TEMPLATE = path.join(
  ROOT,
  'docs/templates/platform-reliability-r1-operator-receipt-template.json',
);

const COMPLETION_REQUIREMENTS = Object.freeze([
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

test('final evidence template preserves every completion requirement and gate', () => {
  const markdown = fs.readFileSync(FINAL_TEMPLATE, 'utf8');

  for (const requirement of COMPLETION_REQUIREMENTS) {
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
  assert.equal(
    Object.hasOwn(receipt, 'password')
      || Object.hasOwn(receipt, 'databaseUrl')
      || Object.hasOwn(receipt, 'connectionString'),
    false,
  );
});
