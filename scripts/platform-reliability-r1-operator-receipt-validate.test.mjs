import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
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

function digest(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function acceptKnownRenderResidual(receipt) {
  const previous = receipt.secretExposureIncidents[0].disposition;
  receipt.secretExposureIncidents[0].disposition = {
    kind: 'operator_accepted_residual',
    actionId: previous.actionId,
    startedAt: previous.startedAt,
    completedAt: previous.completedAt,
    terminalOutcome: 'accepted_residual',
    riskClass: 'unauthorized_blueprint_sync',
    environmentClass: 'non_strategic_dogfood',
    reviewBy: '2026-08-29T08:59:00Z',
    mitigations: [
      'do_not_read_copy_or_use_hook',
      'durable_empty_database_ip_allowlist_before_r1_completion',
      'record_autosync_final_state',
      'stop_on_unexpected_blueprint_sync',
    ],
    reopenTriggers: [
      'before_cohort_expansion',
      'before_triple_digit_dau',
      'before_second_blueprint_operator_or_automation',
      'before_render_strategic_commitment',
      'on_unexpected_blueprint_sync',
    ],
    blueprintContinuity: clone(previous.blueprintContinuity),
    acceptanceEvidenceSha256: digest('operator-render-residual-acceptance'),
    secretsCaptured: false,
  };
  return receipt;
}

function makeDatabaseExposureIncident(receipt, {
  ordinal,
  observedAt,
  confirmedAt,
  startedAt,
  completedAt,
  beforeObservedAt,
  providerObservedAt,
}) {
  const targetSha256 = digest(`database-user-exposed-${ordinal}`);
  return {
    ...clone(receipt.secretExposureIncidents[0]),
    incidentId:
      `r1-window-database-credential-dom-20260730-${ordinal}`,
    kind: 'render_database_credential_dom_exposure',
    observedAt,
    targetIdentityKind: 'database_username',
    targetSha256,
    operatorDecision: {
      decisionId: `r1-decision-20260730-${ordinal}`,
      confirmedAt,
      decision: 'approved',
      targetSha256,
    },
    disposition: {
      ...clone(receipt.secretExposureIncidents[0].disposition),
      actionId: `r1-secret-action-20260730-${ordinal}`,
      startedAt,
      completedAt,
      terminalOutcome: 'invalidated',
      providerMethod: 'revoke_database_credential',
      providerReceipt: {
        kind: 'render_dashboard_terminal_observation',
        observedAt: providerObservedAt,
        action: 'revoke_database_credential',
        terminalOutcome: 'invalidated',
        targetSha256,
        evidenceSha256: digest(`provider-receipt-${ordinal}`),
        secretsCaptured: false,
      },
      credentialNegativeProof: {
        observedAt: completedAt,
        terminalOutcome: 'authentication_rejected',
        usernameSha256: targetSha256,
        evidenceSha256: digest(`negative-proof-${ordinal}`),
        secretsCaptured: false,
      },
      blueprintContinuity: {
        ...clone(
          receipt.secretExposureIncidents[0].disposition.blueprintContinuity,
        ),
        before: {
          ...clone(
            receipt.secretExposureIncidents[0].disposition
              .blueprintContinuity.before,
          ),
          observedAt: beforeObservedAt,
          evidenceSha256: digest(`blueprint-before-${ordinal}`),
        },
        after: {
          ...clone(
            receipt.secretExposureIncidents[0].disposition
              .blueprintContinuity.after,
          ),
          observedAt: completedAt,
          evidenceSha256: digest(`blueprint-after-${ordinal}`),
        },
      },
    },
  };
}

function addBlueprintReplacementIncident(receipt) {
  const oldBlueprintId = 'blueprint-main';
  const newBlueprintId = 'blueprint-replacement';
  const targetSha256 = digest(oldBlueprintId);
  const linkedServiceIdsSha256 = digest('srv-cron\nsrv-web');
  const linkedServiceConfigurationSha256 = digest('stable-service-config');
  const sourceSha = 'a'.repeat(40);
  for (const consumer of receipt.consumerClosure.consumers) {
    consumer.blueprintReferenceId = newBlueprintId;
    consumer.pinnedSourceSha = sourceSha;
  }
  receipt.ingressClosure.autoSyncControl.linkedBlueprintId = newBlueprintId;
  receipt.secretExposureIncidents.push({
    incidentId: 'r1-window-blueprint-sync-hook-dom-20260730-2',
    kind: 'render_blueprint_sync_hook_dom_exposure',
    observedAt: '2026-07-30T10:50:10Z',
    targetIdentityKind: 'render_blueprint_id',
    targetSha256,
    operatorDecision: {
      decisionId: 'r1-decision-20260730-2',
      confirmedAt: '2026-07-30T10:51:00Z',
      decision: 'approved',
      targetSha256,
    },
    disposition: {
      actionId: 'r1-secret-action-20260730-2',
      startedAt: '2026-07-30T10:52:00Z',
      completedAt: '2026-07-30T10:54:00Z',
      terminalOutcome: 'invalidated',
      providerMethod: 'replace_blueprint',
      providerReceipt: {
        kind: 'render_dashboard_terminal_observation',
        observedAt: '2026-07-30T10:53:30Z',
        action: 'replace_blueprint',
        terminalOutcome: 'invalidated',
        targetSha256,
        evidenceSha256: digest('blueprint-replacement-provider-receipt'),
        secretsCaptured: false,
      },
      credentialNegativeProof: null,
      blueprintContinuity: {
        evidenceClass: 'operator_attested',
        before: {
          observedAt: '2026-07-30T10:51:30Z',
          blueprintId: oldBlueprintId,
          sourceRepository: 'Glera/swipe-backend',
          sourceBranch: 'master',
          blueprintPath: 'render.yaml',
          sourceSha,
          evidenceSha256: digest('old-blueprint-evidence'),
          linkedServiceIdsSha256,
          linkedServiceConfigurationSha256,
          autoSyncState: 'disabled',
        },
        after: {
          observedAt: '2026-07-30T10:54:00Z',
          blueprintId: newBlueprintId,
          sourceRepository: 'Glera/swipe-backend',
          sourceBranch: 'master',
          blueprintPath: 'render.yaml',
          sourceSha,
          evidenceSha256: digest('new-blueprint-evidence'),
          linkedServiceIdsSha256,
          linkedServiceConfigurationSha256,
          autoSyncState: 'disabled',
        },
        comparisonResult: 'replaced_same_source_and_services',
      },
      terminalProofSha256: digest('blueprint-replacement-terminal-proof'),
      secretsCaptured: false,
    },
  });
  return receipt;
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
    secretExposureIncidentCount: 1,
    completionRequirementCount: 12,
    placeholdersResolved: true,
    sourceContinuityEqual: true,
    recoveryDeleted: true,
    externalIngressClosed: true,
    secretsCaptured: false,
  });
});

test('accepts only the exact known Render residual with bounded review triggers', () => {
  const receipt = acceptKnownRenderResidual(makeValidOperatorReceipt());
  assert.equal(
    validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)).status,
    'pass',
  );
  assert.throws(
    () => validateOperatorEvidence(
      receipt,
      makeValidFinalEvidence(receipt).replace(
        receipt.secretExposureIncidents[0].disposition
          .acceptanceEvidenceSha256,
        digest('unbound-acceptance'),
      ),
    ),
    /secretExposureIncidents/,
  );

  for (const mutate of [
    (candidate) => {
      candidate.secretExposureIncidents[0].disposition.reviewBy =
        '2026-09-30T08:59:00Z';
    },
    (candidate) => {
      candidate.secretExposureIncidents[0].disposition.reopenTriggers.pop();
    },
    (candidate) => {
      candidate.secretExposureIncidents[0].disposition.mitigations[0] =
        'ignore_hook';
    },
  ]) {
    const candidate = acceptKnownRenderResidual(makeValidOperatorReceipt());
    mutate(candidate);
    assert.throws(
      () => validateOperatorEvidence(
        candidate,
        makeValidFinalEvidence(candidate),
      ),
      /reviewBy|reopenTriggers|mitigations/,
    );
  }
});

test('never permits accepted residual for a new incident or database credential', () => {
  {
    const receipt = acceptKnownRenderResidual(makeValidOperatorReceipt());
    const extra = clone(receipt.secretExposureIncidents[0]);
    extra.incidentId = 'r1-window-blueprint-sync-hook-dom-20260730-2';
    extra.observedAt = '2026-07-30T10:42:00Z';
    extra.operatorDecision.decisionId = 'r1-decision-20260730-8';
    extra.disposition.actionId = 'r1-secret-action-20260730-8';
    receipt.secretExposureIncidents.push(extra);
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        makeValidFinalEvidence(receipt),
      ),
      /operator-accepted residual is limited/,
    );
  }
  {
    const receipt = acceptKnownRenderResidual(makeValidOperatorReceipt());
    const incident = receipt.secretExposureIncidents[0];
    incident.kind = 'render_database_credential_dom_exposure';
    incident.targetIdentityKind = 'database_username';
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        makeValidFinalEvidence(receipt),
      ),
      /known Blueprint Sync Hook incident|operator-accepted residual is limited/,
    );
  }
});

test('requires terminal disposition of the known secret exposure before Gate A', () => {
  const cases = [
    (receipt) => {
      receipt.secretExposureIncidents = [];
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].kind = 'other-secret-exposure';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].operatorDecision.decision = 'denied';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].operatorDecision.targetSha256 =
        '0'.repeat(64);
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.terminalOutcome =
        'pending';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.completedAt =
        '2026-07-30T09:02:00Z';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].operatorDecision.confirmedAt =
        '2026-07-30T08:54:59Z';
    },
  ];

  for (const mutate of cases) {
    const receipt = makeValidOperatorReceipt();
    mutate(receipt);
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)),
      /secretExposureIncidents|known pre-window incident|terminalOutcome|operatorDecision/,
    );
  }
});

test('stops later gate actions until a new in-window exposure is disposed', () => {
  {
    const receipt = makeValidOperatorReceipt();
    const targetSha256 = digest('database-user-exposed-1');
    receipt.secretExposureIncidents.push({
      ...clone(receipt.secretExposureIncidents[0]),
      incidentId: 'r1-window-database-credential-dom-20260730-1',
      kind: 'render_database_credential_dom_exposure',
      observedAt: '2026-07-30T09:05:10Z',
      targetIdentityKind: 'database_username',
      operatorDecision: {
        decisionId: 'r1-decision-20260730-2',
        confirmedAt: '2026-07-30T09:05:20Z',
        decision: 'approved',
        targetSha256,
      },
      targetSha256,
      disposition: {
        actionId: 'r1-secret-action-20260730-2',
        startedAt: '2026-07-30T09:05:30Z',
        completedAt: '2026-07-30T09:05:50Z',
        terminalOutcome: 'invalidated',
        providerMethod: 'revoke_database_credential',
        providerReceipt: {
          kind: 'render_dashboard_terminal_observation',
          observedAt: '2026-07-30T09:05:50Z',
          action: 'revoke_database_credential',
          terminalOutcome: 'invalidated',
          targetSha256,
          evidenceSha256: 'd'.repeat(64),
          secretsCaptured: false,
        },
        credentialNegativeProof: {
          observedAt: '2026-07-30T09:05:50Z',
          terminalOutcome: 'authentication_rejected',
          usernameSha256: targetSha256,
          evidenceSha256: 'e'.repeat(64),
          secretsCaptured: false,
        },
        blueprintContinuity: {
          ...clone(
            receipt.secretExposureIncidents[0].disposition.blueprintContinuity,
          ),
          before: {
            ...clone(
              receipt.secretExposureIncidents[0].disposition
                .blueprintContinuity.before,
            ),
            observedAt: '2026-07-30T09:05:25Z',
          },
          after: {
            ...clone(
              receipt.secretExposureIncidents[0].disposition
                .blueprintContinuity.after,
            ),
            observedAt: '2026-07-30T09:05:50Z',
          },
        },
        terminalProofSha256: 'f'.repeat(64),
        secretsCaptured: false,
      },
    });
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
    const targetSha256 = digest('database-user-exposed-2');
    receipt.secretExposureIncidents.push({
      ...clone(receipt.secretExposureIncidents[0]),
      incidentId: 'r1-window-database-credential-dom-20260730-2',
      kind: 'render_database_credential_dom_exposure',
      observedAt: '2026-07-30T09:06:30Z',
      targetIdentityKind: 'database_username',
      operatorDecision: {
        decisionId: 'r1-decision-20260730-3',
        confirmedAt: '2026-07-30T09:07:00Z',
        decision: 'approved',
        targetSha256,
      },
      targetSha256,
      disposition: {
        actionId: 'r1-secret-action-20260730-3',
        startedAt: '2026-07-30T09:07:10Z',
        completedAt: '2026-07-30T09:07:30Z',
        terminalOutcome: 'invalidated',
        providerMethod: 'revoke_database_credential',
        providerReceipt: {
          kind: 'render_dashboard_terminal_observation',
          observedAt: '2026-07-30T09:07:30Z',
          action: 'revoke_database_credential',
          terminalOutcome: 'invalidated',
          targetSha256,
          evidenceSha256: 'd'.repeat(64),
          secretsCaptured: false,
        },
        credentialNegativeProof: {
          observedAt: '2026-07-30T09:07:30Z',
          terminalOutcome: 'authentication_rejected',
          usernameSha256: targetSha256,
          evidenceSha256: 'e'.repeat(64),
          secretsCaptured: false,
        },
        blueprintContinuity: {
          ...clone(
            receipt.secretExposureIncidents[0].disposition.blueprintContinuity,
          ),
          before: {
            ...clone(
              receipt.secretExposureIncidents[0].disposition
                .blueprintContinuity.before,
            ),
            observedAt: '2026-07-30T09:07:05Z',
          },
          after: {
            ...clone(
              receipt.secretExposureIncidents[0].disposition
                .blueprintContinuity.after,
            ),
            observedAt: '2026-07-30T09:07:30Z',
          },
        },
        terminalProofSha256: 'f'.repeat(64),
        secretsCaptured: false,
      },
    });
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        makeValidFinalEvidence(receipt),
      ),
      /action continued or started/,
    );
  }
});

test('rejects incident identity, provider receipt, and Blueprint continuity bypasses', () => {
  const cases = [
    (receipt) => {
      const incident = receipt.secretExposureIncidents[0];
      incident.observedAt = '2026-07-30T10:51:00Z';
      incident.operatorDecision.confirmedAt = '2026-07-30T10:52:00Z';
      incident.disposition.startedAt = '2026-07-30T10:53:00Z';
      incident.disposition.completedAt = '2026-07-30T10:54:00Z';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].incidentId = 'secret=value';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].incidentId = 'a'.repeat(64);
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].operatorDecision.decisionId =
        'decision secret';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].operatorDecision.decisionId =
        'a'.repeat(64);
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].operatorDecision.decisionId =
        'r1-decision-19990101-1';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.actionId =
        'action/secret';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.actionId =
        'a'.repeat(64);
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.actionId =
        'r1-secret-action-19990101-1';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.providerMethod =
        'disconnect_blueprint';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.providerReceipt.kind =
        'free_text';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.providerReceipt.action =
        'revoke_sync_hook';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.providerReceipt.observedAt =
        '2026-07-30T09:00:00Z';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].targetIdentityKind =
        'database_username';
    },
    (receipt) => {
      receipt.actions[0].actionId =
        receipt.secretExposureIncidents[0].operatorDecision.decisionId;
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.blueprintContinuity.disconnected =
        true;
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.blueprintContinuity
        .after.sourceBranch = 'other';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.blueprintContinuity
        .after.blueprintId =
        'different-blueprint';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].disposition.terminalOutcome =
        'invalidated';
    },
    (receipt) => {
      receipt.secretExposureIncidents[0].targetSha256 = '0'.repeat(64);
      receipt.secretExposureIncidents[0].operatorDecision.targetSha256 =
        '0'.repeat(64);
      receipt.secretExposureIncidents[0].disposition.providerReceipt.targetSha256 =
        '0'.repeat(64);
    },
  ];

  for (const mutate of cases) {
    const receipt = makeValidOperatorReceipt();
    mutate(receipt);
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)),
      /secretExposureIncidents|structured identifier|UTC day|provider method|providerReceipt|authority identity|Blueprint|typed provider target|targetIdentityKind|pre-window identity|exactly these keys/,
    );
  }
});

test('binds dynamic incident IDs to kind/day and credential proof to username', () => {
  const receipt = makeValidOperatorReceipt();
  const targetSha256 = digest('database-user-exposed-3');
  const incident = {
    ...clone(receipt.secretExposureIncidents[0]),
    incidentId: 'r1-window-database-credential-dom-20260730-3',
    kind: 'render_database_credential_dom_exposure',
    observedAt: '2026-07-30T09:05:10Z',
    targetIdentityKind: 'database_username',
    targetSha256,
    operatorDecision: {
      decisionId: 'r1-decision-20260730-4',
      confirmedAt: '2026-07-30T09:05:20Z',
      decision: 'approved',
      targetSha256,
    },
    disposition: {
      ...clone(receipt.secretExposureIncidents[0].disposition),
      actionId: 'r1-secret-action-20260730-4',
      startedAt: '2026-07-30T09:05:30Z',
      completedAt: '2026-07-30T09:05:50Z',
      terminalOutcome: 'invalidated',
      providerMethod: 'revoke_database_credential',
      providerReceipt: {
        kind: 'render_dashboard_terminal_observation',
        observedAt: '2026-07-30T09:05:45Z',
        action: 'revoke_database_credential',
        terminalOutcome: 'invalidated',
        targetSha256,
        evidenceSha256: 'a'.repeat(64),
        secretsCaptured: false,
      },
      credentialNegativeProof: {
        observedAt: '2026-07-30T09:05:50Z',
        terminalOutcome: 'authentication_rejected',
        usernameSha256: targetSha256,
        evidenceSha256: 'b'.repeat(64),
        secretsCaptured: false,
      },
      blueprintContinuity: {
        ...clone(
          receipt.secretExposureIncidents[0].disposition.blueprintContinuity,
        ),
        before: {
          ...clone(
            receipt.secretExposureIncidents[0].disposition
              .blueprintContinuity.before,
          ),
          observedAt: '2026-07-30T09:05:25Z',
        },
        after: {
          ...clone(
            receipt.secretExposureIncidents[0].disposition
              .blueprintContinuity.after,
          ),
          observedAt: '2026-07-30T09:05:50Z',
        },
      },
    },
  };
  receipt.secretExposureIncidents.push(incident);
  assert.equal(
    validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)).status,
    'pass',
  );

  for (const mutate of [
    (candidate) => {
      candidate.incidentId =
        'r1-window-blueprint-sync-hook-dom-20260730-3';
    },
    (candidate) => {
      candidate.incidentId =
        'r1-window-database-credential-dom-19990101-3';
    },
    (candidate) => {
      candidate.disposition.credentialNegativeProof.usernameSha256 =
        '0'.repeat(64);
    },
    (candidate) => {
      candidate.disposition.credentialNegativeProof = null;
    },
  ]) {
    const candidateReceipt = makeValidOperatorReceipt();
    const candidate = clone(incident);
    mutate(candidate);
    candidateReceipt.secretExposureIncidents.push(candidate);
    assert.throws(
      () => validateOperatorEvidence(
        candidateReceipt,
        makeValidFinalEvidence(candidateReceipt),
      ),
      /incident kind|observed UTC day|credentialNegativeProof|exact exposed username/,
    );
  }
});

test('accepts provider-supported Blueprint replacement and rejects continuity shortcuts', () => {
  const receipt = addBlueprintReplacementIncident(
    acceptKnownRenderResidual(makeValidOperatorReceipt()),
  );
  assert.equal(
    validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)).status,
    'pass',
  );

  for (const mutate of [
    (candidate) => {
      candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.after.blueprintId = 'blueprint-main';
    },
    (candidate) => {
      candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.after.linkedServiceIdsSha256 = digest('different');
    },
    (candidate) => {
      const continuity = candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity;
      continuity.before.linkedServiceIdsSha256 = digest('invented');
      continuity.after.linkedServiceIdsSha256 = digest('invented');
    },
    (candidate) => {
      candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.after.linkedServiceConfigurationSha256 =
          digest('different-configuration');
    },
    (candidate) => {
      candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.after.sourceSha = 'b'.repeat(40);
    },
    (candidate) => {
      const continuity = candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity;
      continuity.before.sourceSha = 'b'.repeat(40);
      continuity.after.sourceSha = 'b'.repeat(40);
    },
    (candidate) => {
      candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.after.autoSyncState = 'enabled';
    },
    (candidate) => {
      candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.after.sourceBranch = 'feature';
    },
    (candidate) => {
      candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.comparisonResult = 'equal';
    },
    (candidate) => {
      delete candidate.secretExposureIncidents[1].disposition
        .blueprintContinuity.evidenceClass;
    },
    (candidate) => {
      candidate.consumerClosure.consumers[0].blueprintReferenceId =
        'blueprint-main';
    },
    (candidate) => {
      const incident = candidate.secretExposureIncidents[1];
      incident.targetSha256 = digest('blueprint-replacement');
      incident.operatorDecision.targetSha256 = incident.targetSha256;
      incident.disposition.providerReceipt.targetSha256 = incident.targetSha256;
    },
  ]) {
    const candidate = clone(receipt);
    mutate(candidate);
    assert.throws(
      () => validateOperatorEvidence(
        candidate,
        makeValidFinalEvidence(candidate),
      ),
      /Blueprint|linked services|closed Blueprint target|typed provider target|consumerClosure|sourceBranch|autoSyncState|strict schema/,
    );
  }
});

test('requires a superseding Blueprint replacement after the superseded observation', () => {
  const receipt = addBlueprintReplacementIncident(makeValidOperatorReceipt());
  const prior = clone(receipt.secretExposureIncidents[0]);
  prior.incidentId = 'r1-window-blueprint-sync-hook-dom-20260730-3';
  prior.observedAt = '2026-07-30T10:48:00Z';
  prior.operatorDecision.decisionId = 'r1-decision-20260730-3';
  prior.operatorDecision.confirmedAt = '2026-07-30T10:49:00Z';
  prior.disposition.actionId = 'r1-secret-action-20260730-3';
  prior.disposition.startedAt = '2026-07-30T10:50:00Z';
  prior.disposition.completedAt = '2026-07-30T10:51:00Z';
  prior.disposition.providerReceipt.observedAt = '2026-07-30T10:51:00Z';
  prior.disposition.blueprintContinuity.before.observedAt =
    '2026-07-30T10:49:30Z';
  prior.disposition.blueprintContinuity.after.observedAt =
    '2026-07-30T10:55:00Z';
  receipt.secretExposureIncidents.push(prior);

  assert.throws(
    () => validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)),
    /does not bind the exact closed Blueprint target/,
  );
});

test('rejects a secret disposition that remains active across another incident', () => {
  const receipt = makeValidOperatorReceipt();
  receipt.secretExposureIncidents.push(
    makeDatabaseExposureIncident(receipt, {
      ordinal: 5,
      observedAt: '2026-07-30T09:05:10Z',
      confirmedAt: '2026-07-30T09:05:20Z',
      startedAt: '2026-07-30T09:05:30Z',
      completedAt: '2026-07-30T09:05:55Z',
      beforeObservedAt: '2026-07-30T09:05:25Z',
      providerObservedAt: '2026-07-30T09:05:50Z',
    }),
    makeDatabaseExposureIncident(receipt, {
      ordinal: 6,
      observedAt: '2026-07-30T09:05:35Z',
      confirmedAt: '2026-07-30T09:05:36Z',
      startedAt: '2026-07-30T09:05:40Z',
      completedAt: '2026-07-30T09:05:45Z',
      beforeObservedAt: '2026-07-30T09:05:38Z',
      providerObservedAt: '2026-07-30T09:05:44Z',
    }),
  );
  assert.throws(
    () => validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)),
    /action continued or started/,
  );
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

test('requires Auto Sync disabled before merge and through final closure', () => {
  const cases = [
    (receipt) => {
      receipt.ingressClosure.autoSyncControl.manualPreviewExpectedOnly = false;
    },
    (receipt) => {
      receipt.ingressClosure.autoSyncControl.linkedBlueprintId =
        'blueprint-unrelated';
    },
    (receipt) => {
      receipt.ingressClosure.autoSyncControl.preMergeState = 'enabled';
    },
    (receipt) => {
      receipt.ingressClosure.autoSyncControl.finalState = 'enabled';
    },
    (receipt) => {
      receipt.ingressClosure.autoSyncControl.observedDisabledAt =
        '2026-07-30T10:41:01Z';
    },
    (receipt) => {
      receipt.ingressClosure.autoSyncControl.manualPreviewObservedAt =
        '2026-07-30T10:42:01Z';
    },
    (receipt) => {
      receipt.ingressClosure.autoSyncControl.sourceBranch = 'feature';
    },
    (receipt) => {
      receipt.ingressClosure.blueprintSyncIdentity.typedAbsence =
        'unknown_reason';
    },
    (receipt) => {
      receipt.ingressClosure.manualSyncTerminal.terminalOutcome = 'failed';
    },
    (receipt) => {
      receipt.ingressClosure.manualSyncTerminal.observedAt =
        '2026-07-30T10:41:29Z';
    },
  ];

  for (const mutate of cases) {
    const receipt = makeValidOperatorReceipt();
    mutate(receipt);
    assert.throws(
      () => validateOperatorEvidence(receipt, makeValidFinalEvidence(receipt)),
      /autoSyncControl|manualPreviewExpectedOnly|sourceBranch|blueprintSyncIdentity|manualSyncTerminal/,
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
    receipt.ingressClosure.autoSyncControl.preMergeStateEvidenceSha256,
    receipt.ingressClosure.autoSyncControl.manualPreviewSha256,
    receipt.ingressClosure.autoSyncControl.finalStateEvidenceSha256,
    receipt.ingressClosure.blueprintSyncIdentity.typedAbsence,
    receipt.ingressClosure.manualSyncTerminal.evidenceSha256,
    receipt.ingressClosure.savedAt,
    receipt.secretExposureIncidents[0].incidentId,
    receipt.secretExposureIncidents[0].targetSha256,
    receipt.secretExposureIncidents[0].operatorDecision.decisionId,
    receipt.secretExposureIncidents[0].disposition.actionId,
    receipt.secretExposureIncidents[0].disposition.terminalProofSha256,
    receipt.ingressClosure.internalFreshProofs[1].evidenceSha256,
    receipt.ingressClosure.externalProtocolProof.sanitizedStderrSha256,
  ]) {
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        markdown.replaceAll(value, 'removed-evidence-value'),
      ),
      /is not bound into final evidence|exact receipt-bound line|secretExposureIncidents/,
    );
  }
  {
    const incidentLine = markdown
      .split('\n')
      .find((line) => line.startsWith('- Secret-exposure incident `'));
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        markdown.replace(
          incidentLine,
          '- Secret-exposure incidents: `none`',
        ),
      ),
      /secretExposureIncidents/,
    );
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        `${markdown}\n- Secret-exposure incident \`invented\`: \`none\`\n`,
      ),
      /secretExposureIncidents/,
    );
  }
  assert.throws(
    () => validateOperatorEvidence(
      receipt,
      markdown.replace(
        '- Manual Sync preview expected-only: `PASS`',
        '- Manual Sync preview expected-only: `FAIL`',
      ),
    ),
    /manualPreviewExpectedOnly/,
  );
  assert.throws(
    () => validateOperatorEvidence(
      receipt,
      markdown.replace(
        '- Auto Sync observed disabled before merge: `disabled`',
        '- Auto Sync observed disabled before merge: `enabled`',
      ),
    ),
    /autoSyncPreMerge/,
  );
  assert.throws(
    () => validateOperatorEvidence(
      receipt,
      markdown.replace(
        '- Manual Sync terminal: `succeeded`',
        '- Manual Sync terminal: `failed`',
      ),
    ),
    /manualSyncTerminal/,
  );
  assert.throws(
    () => validateOperatorEvidence(
      receipt,
      markdown.replace(
        '## 9. Completion matrix',
        '- Auto Sync observed disabled before merge: `enabled`\n\n'
          + '## 9. Completion matrix',
      ),
    ),
    /autoSyncPreMerge/,
  );
  assert.throws(
    () => validateOperatorEvidence(
      receipt,
      markdown.replace(
        '## 9. Completion matrix',
        '- Manual Sync terminal: `failed`\n\n## 9. Completion matrix',
      ),
    ),
    /manualSyncTerminal/,
  );
  {
    const expectedLine = markdown
      .split('\n')
      .find((line) => line.startsWith('- Manual Sync terminal:'));
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        markdown.replace(expectedLine, `\`\`\`\n${expectedLine}\n\`\`\``),
      ),
      /fenced code blocks/,
    );
  }
  assert.throws(
    () => validateOperatorEvidence(
      receipt,
      `${markdown}\n- Manual Sync terminal: \`failed\`\n`,
    ),
    /manualSyncTerminal/,
  );
  {
    const expectedLine = markdown
      .split('\n')
      .find((line) => (
        line.startsWith('- Auto Sync observed disabled before merge:')
      ));
    assert.throws(
      () => validateOperatorEvidence(
        receipt,
        markdown.replace(expectedLine, `<!--\n${expectedLine}\n-->`),
      ),
      /HTML comments or containers/,
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
