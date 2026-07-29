import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  validateOperatorEvidence,
} from './platform-reliability-r1-operator-receipt-validate.mjs';
import {
  makeValidFinalEvidence,
  makeValidOperatorReceipt,
} from './platform-reliability-r1-operator-receipt-test-fixture.mjs';

function clone(value) {
  return structuredClone(value);
}

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'platform-reliability-r1-operator-receipt-validate.mjs',
);

test('accepts a complete PASS receipt and returns bounded summary only', () => {
  const result = validateOperatorEvidence(
    makeValidOperatorReceipt(),
    makeValidFinalEvidence(),
  );

  assert.deepEqual(result, {
    schema: 'platform-reliability-r1-operator-evidence-validation.v1',
    status: 'pass',
    gateCount: 7,
    actionCount: 7,
    consumerCount: 2,
    completionRequirementCount: 12,
    placeholdersResolved: true,
    sourceContinuityEqual: true,
    recoveryDeleted: true,
    externalIngressClosed: true,
    secretsCaptured: false,
  });
});

test('requires server-owned PITR ordering and recomputable RPO/RTO', () => {
  const cases = [
    (receipt) => {
      delete receipt.restoreDrill.beforeObservation;
    },
    (receipt) => {
      receipt.restoreDrill.afterTerminalRun.terminalAt =
        '2026-07-30T09:25:30Z';
    },
    (receipt) => {
      receipt.restoreDrill.startRecoveryDbClock =
        '2026-07-30T09:30:00Z';
    },
    (receipt) => {
      receipt.restoreDrill.observedRpoSeconds = 1;
    },
    (receipt) => {
      receipt.restoreDrill.observedProvisionRtoSeconds = 1;
    },
    (receipt) => {
      receipt.restoreDrill.startRecoveryDbClock =
        '2026-07-30T09:50:00Z';
      receipt.restoreDrill.observedRpoSeconds = 1440;
    },
  ];

  for (const mutate of cases) {
    const receipt = makeValidOperatorReceipt();
    mutate(receipt);
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /receipt\.restoreDrill/,
    );
  }
});

test('requires exact source service, deploy, and binding continuity', () => {
  const cases = [
    (receipt) => {
      receipt.restoreDrill.sourceContinuity.after.serviceId = 'other-source';
    },
    (receipt) => {
      receipt.restoreDrill.sourceContinuity.after.deployIdentities =
        ['deploy-web-3', 'run-cron-2'];
    },
    (receipt) => {
      receipt.restoreDrill.sourceContinuity.after.bindingsSha256 =
        '0'.repeat(64);
    },
    (receipt) => {
      receipt.restoreDrill.sourceContinuity.after.observedAt =
        '2026-07-30T10:19:00Z';
    },
    (receipt) => {
      receipt.restoreDrill.sourceContinuity.before.deployIdentities =
        ['invented-web', 'invented-cron'];
      receipt.restoreDrill.sourceContinuity.after.deployIdentities =
        ['invented-cron', 'invented-web'];
    },
  ];

  for (const mutate of cases) {
    const receipt = makeValidOperatorReceipt();
    mutate(receipt);
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /sourceContinuity/,
    );
  }
});

test('validates suspended cleanup containment and forbids it for final PASS', () => {
  const receipt = makeValidOperatorReceipt();
  receipt.status = 'fail';
  Object.assign(receipt.restoreDrill.cleanup, {
    terminalOutcome: 'suspended',
    namedOwner: 'operator',
    financeNotificationId: 'finance-notice-1',
    deletionDeadline: '2026-07-31T10:34:00Z',
  });

  assert.equal(
    validateOperatorEvidence(
      receipt,
      makeValidFinalEvidence(receipt),
      { requirePass: false },
    ).recoveryDeleted,
    false,
  );
  assert.throws(
    () => validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)),
    /must be pass for final evidence/,
  );

  for (const mutate of [
    (candidate) => {
      candidate.restoreDrill.cleanup.namedOwner = null;
    },
    (candidate) => {
      candidate.restoreDrill.cleanup.financeNotificationId = null;
    },
    (candidate) => {
      candidate.restoreDrill.cleanup.deletionDeadline =
        '2026-07-31T10:36:00Z';
    },
  ]) {
    const candidate = clone(receipt);
    mutate(candidate);
    assert.throws(
      () => validateOperatorEvidence(
        candidate,
        makeValidFinalEvidence(candidate),
        { requirePass: false },
      ),
      /suspension requires/,
    );
  }
});

test('requires exact post-closure coverage and rotation identity per consumer', () => {
  const cases = [
    (receipt) => {
      receipt.ingressClosure.internalFreshProofs.pop();
    },
    (receipt) => {
      receipt.ingressClosure.internalFreshProofs[0].consumerId = 'unknown';
    },
    (receipt) => {
      receipt.ingressClosure.internalFreshProofs[0].rotationDeployOrRunId =
        'different-deploy';
    },
    (receipt) => {
      receipt.ingressClosure.internalFreshProofs[0]
        .rotationRuntimeIdentitySha256 = '0'.repeat(64);
    },
    (receipt) => {
      receipt.ingressClosure.internalFreshProofs[0].newUsernameSha256 =
        '0'.repeat(64);
    },
    (receipt) => {
      receipt.ingressClosure.internalFreshProofs[1]
        .postClosureDeployOrRunId = 'run-cron-2';
    },
  ];

  for (const mutate of cases) {
    const receipt = makeValidOperatorReceipt();
    mutate(receipt);
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /internalFreshProofs|rotation|runtime or username/,
    );
  }
});

test('rejects stringly typed booleans/numbers and unresolved placeholders', () => {
  const cases = [
    (receipt) => {
      receipt.ingressNarrowing.digestsEqual = 'true';
    },
    (receipt) => {
      receipt.credentialRotation.oldSessionsAfterDrain = '0';
    },
    (receipt) => {
      receipt.ingressClosure.allowlistRuleCount = '0';
    },
    (receipt) => {
      receipt.restoreDrill.observedRpoSeconds = '840';
    },
    (receipt) => {
      receipt.credentialRotation.blueprintSyncIdentity.available = 'false';
    },
    (receipt) => {
      receipt.actions[0].terminalOutcome = '{{TYPED_OUTCOME}}';
    },
    (receipt) => {
      receipt.window.completedAt = '2026-02-31T11:00:00Z';
    },
  ];

  for (const mutate of cases) {
    const receipt = makeValidOperatorReceipt();
    mutate(receipt);
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /must be|placeholder/,
    );
  }
});

test('requires strict A-G/action structure and all 12 PASS matrix rows', () => {
  {
    const receipt = makeValidOperatorReceipt();
    receipt.operatorConfirmations.pop();
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /exactly one entry for every gate/,
    );
  }
  {
    const receipt = makeValidOperatorReceipt();
    receipt.actions = receipt.actions.filter((action) => action.gate !== 'D');
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /cover every gate|missing action/,
    );
  }
  {
    const receipt = makeValidOperatorReceipt();
    receipt.actions[1].startedAt = '2026-07-30T09:04:00Z';
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /out of A-G order|before its operator confirmation/,
    );
  }
  {
    const receipt = makeValidOperatorReceipt();
    receipt.operatorConfirmations[6].confirmedAt = '2026-07-30T09:00:00Z';
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /out of A-G order/,
    );
  }
  {
    const receipt = makeValidOperatorReceipt();
    receipt.actions[6].terminalOutcome = 'failed';
    receipt.actions[6].rollbackOutcome = 'contained';
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence()),
      /last action must succeed/,
    );
  }
  {
    const markdown = makeValidFinalEvidence().replace(
      '| PITR works | `PASS` | receipt |',
      '| PITR works | `FAIL` | receipt |',
    );
    assert.throws(
      () => validateOperatorEvidence(makeValidOperatorReceipt(), markdown),
      /missing PASS row for PITR works/,
    );
  }
  {
    const markdown = `${makeValidFinalEvidence()}\n{{UNRESOLVED}}\n`;
    assert.throws(
      () => validateOperatorEvidence(makeValidOperatorReceipt(), markdown),
      /unresolved placeholder/,
    );
  }
  {
    const markdown = [
      '# Synthetic',
      '',
      '- Overall status: `PASS`',
      '',
      '| Requirement | Result | Evidence |',
      '|---|---|---|',
      ...[
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
      ].map((requirement) => `| ${requirement} | \`PASS\` | receipt |`),
      '',
    ].join('\n');
    assert.throws(
      () => validateOperatorEvidence(makeValidOperatorReceipt(), markdown),
      /missing authority section/,
    );
  }
});

test('requires every failed action to be contained or explicitly resolved', () => {
  {
    const receipt = makeValidOperatorReceipt();
    receipt.actions.splice(1, 0, {
      ...receipt.actions[0],
      actionId: 'action-a-failed',
      startedAt: '2026-07-30T09:01:00Z',
      completedAt: '2026-07-30T09:02:00Z',
      terminalOutcome: 'failed',
      rollbackOutcome: 'not_needed',
    });
    receipt.actions[0].startedAt = '2026-07-30T09:03:00Z';
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        makeValidFinalEvidence(receipt),
      ),
      /no rollback, containment, or linked resolution/,
    );

    receipt.actions[0].resolvesActionId = 'action-a-failed';
    assert.equal(
      validateOperatorEvidence(
        receipt,
        makeValidFinalEvidence(receipt),
      ).status,
      'pass',
    );
  }
  {
    const receipt = makeValidOperatorReceipt();
    receipt.actions.splice(1, 0, {
      ...receipt.actions[0],
      actionId: 'action-a-contained',
      startedAt: '2026-07-30T09:01:00Z',
      completedAt: '2026-07-30T09:02:00Z',
      terminalOutcome: 'failed',
      rollbackOutcome: 'contained',
    });
    receipt.actions[0].startedAt = '2026-07-30T09:03:00Z';
    assert.equal(
      validateOperatorEvidence(
        receipt,
        makeValidFinalEvidence(receipt),
      ).status,
      'pass',
    );
  }
});

test('cross-binds key receipt identities into the full final synthesis', () => {
  const receipt = makeValidOperatorReceipt();
  const markdown = makeValidFinalEvidence(receipt);
  for (const value of [
    receipt.consumerClosure.consumerSetSha256,
    receipt.consumerClosure.consumers[0].postSyncDeployOrRunId,
    receipt.credentialRotation.newUsernameSha256,
    receipt.restoreDrill.startRecoveryObservationSha256,
    receipt.restoreDrill.sourceContinuity.before.bindingsSha256,
    receipt.ingressClosure.backendMergeSha,
    receipt.ingressClosure.internalFreshProofs[1].evidenceSha256,
    receipt.ingressClosure.externalProtocolProof.sanitizedStderrSha256,
  ]) {
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        markdown.replaceAll(value, 'removed-evidence-value'),
      ),
      /is not bound into final evidence/,
    );
  }
});

test('CLI validates the two final artifacts without echoing their content', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-receipt-cli-'));
  const receiptPath = path.join(directory, 'receipt.json');
  const evidencePath = path.join(directory, 'evidence.md');
  try {
    fs.writeFileSync(receiptPath, JSON.stringify(makeValidOperatorReceipt()));
    fs.writeFileSync(evidencePath, makeValidFinalEvidence());
    const result = JSON.parse(execFileSync(
      process.execPath,
      [
        SCRIPT,
        '--receipt',
        receiptPath,
        '--final-evidence',
        evidencePath,
      ],
      { encoding: 'utf8' },
    ));
    assert.equal(result.status, 'pass');
    assert.equal(result.consumerCount, 2);
    assert.equal(Object.hasOwn(result, 'receipt'), false);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
