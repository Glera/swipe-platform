import crypto from 'node:crypto';

import { R1_COMPLETION_REQUIREMENTS } from './platform-reliability-r1-operator-receipt-validate.mjs';

const hash = (character) => character.repeat(64);
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const credentialProofBinding = (proof) => {
  if (proof === null) {
    return '`none`';
  }
  return (
    `\`${proof.observedAt}\` / `
    + `\`${proof.terminalOutcome}\` / `
    + `\`sha256:${proof.usernameSha256}\` / `
    + `\`sha256:${proof.evidenceSha256}\``
  );
};
const incidentEvidenceLine = (incident) => {
  const disposition = incident.disposition;
  const prefix = (
    `- Secret-exposure incident \`${incident.incidentId}\`: `
    + `\`${incident.kind}\` observed \`${incident.observedAt}\`; `
    + `target \`${incident.targetIdentityKind}\` / `
    + `\`sha256:${incident.targetSha256}\`; approval `
    + `\`${incident.operatorDecision.decisionId}\` / `
    + `\`${incident.operatorDecision.confirmedAt}\` / `
    + `\`${incident.operatorDecision.decision}\`; disposition `
  );
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
    + (
      disposition.providerMethod === 'replace_blueprint'
        ? `source \`${disposition.blueprintContinuity.before.sourceSha}\` / `
        : ''
    )
    + `\`sha256:${disposition.blueprintContinuity.before.evidenceSha256}\` / `
    + `after \`${disposition.blueprintContinuity.after.observedAt}\` / `
    + `\`${disposition.blueprintContinuity.after.blueprintId}\` / `
    + `\`${disposition.blueprintContinuity.after.sourceRepository}\` / `
    + `\`${disposition.blueprintContinuity.after.sourceBranch}\` / `
    + `\`${disposition.blueprintContinuity.after.blueprintPath}\` / `
    + (
      disposition.providerMethod === 'replace_blueprint'
        ? `source \`${disposition.blueprintContinuity.after.sourceSha}\` / `
        : ''
    )
    + `\`sha256:${disposition.blueprintContinuity.after.evidenceSha256}\` / `
    + (
      disposition.providerMethod === 'replace_blueprint'
        ? (
          `services \`sha256:${disposition.blueprintContinuity.before.linkedServiceIdsSha256}\` -> `
          + `\`sha256:${disposition.blueprintContinuity.after.linkedServiceIdsSha256}\` / `
          + `configuration \`sha256:${disposition.blueprintContinuity.before.linkedServiceConfigurationSha256}\` -> `
          + `\`sha256:${disposition.blueprintContinuity.after.linkedServiceConfigurationSha256}\` / `
          + `auto sync \`${disposition.blueprintContinuity.before.autoSyncState}\` -> `
          + `\`${disposition.blueprintContinuity.after.autoSyncState}\` / `
        )
        : ''
    )
    + `continuity \`${disposition.blueprintContinuity.comparisonResult}\` / `
    + `terminal \`sha256:${disposition.terminalProofSha256}\`; `
    + `secrets captured \`${disposition.secretsCaptured}\``
  );
};

export function makeValidOperatorReceipt() {
  const consumers = [
    {
      serviceId: 'srv-web',
      kind: 'web',
      blueprintReferenceId: 'blueprint-main',
      pinnedSourceSha: 'a'.repeat(40),
      lastKnownGoodDeployOrRunId: 'deploy-web-1',
      postSyncDeployOrRunId: 'deploy-web-2',
      rotationRuntimeIdentitySha256: hash('4'),
      newUsernameSha256: hash('2'),
      freshDatabaseProofSha256: hash('5'),
    },
    {
      serviceId: 'srv-cron',
      kind: 'cron',
      blueprintReferenceId: 'blueprint-main',
      pinnedSourceSha: 'b'.repeat(40),
      lastKnownGoodDeployOrRunId: 'run-cron-1',
      postSyncDeployOrRunId: 'run-cron-2',
      rotationRuntimeIdentitySha256: hash('6'),
      newUsernameSha256: hash('2'),
      freshDatabaseProofSha256: hash('7'),
    },
  ];
  const gateTimes = {
    A: ['2026-07-30T09:00:00Z', '2026-07-30T09:01:00Z', '2026-07-30T09:05:00Z'],
    B: ['2026-07-30T09:05:00Z', '2026-07-30T09:06:00Z', '2026-07-30T09:09:00Z'],
    C: ['2026-07-30T09:09:00Z', '2026-07-30T09:10:00Z', '2026-07-30T09:19:00Z'],
    D: ['2026-07-30T09:19:00Z', '2026-07-30T09:20:00Z', '2026-07-30T09:24:00Z'],
    E: ['2026-07-30T09:29:00Z', '2026-07-30T09:30:00Z', '2026-07-30T10:30:00Z'],
    F: ['2026-07-30T10:30:00Z', '2026-07-30T10:31:00Z', '2026-07-30T10:35:00Z'],
    G: ['2026-07-30T10:39:00Z', '2026-07-30T10:40:00Z', '2026-07-30T10:50:00Z'],
  };

  return {
    schema: 'platform-reliability-r1-operator-receipt.v1',
    status: 'pass',
    sourceDatabaseServiceId: 'dpg-source',
    window: {
      startedAt: '2026-07-30T08:55:00Z',
      completedAt: '2026-07-30T11:00:00Z',
    },
    consumerClosure: {
      observedAt: '2026-07-30T08:55:00Z',
      status: 'closed',
      consumerSetSha256: hash('3'),
      manualExternalConsumers: {
        status: 'none',
        dispositionId: null,
      },
      consumers,
    },
    operatorConfirmations: Object.entries(gateTimes).map(
      ([gate, [confirmedAt]], index) => ({
        gate,
        confirmedAt,
        decision: 'approved',
        targetSha256: hash(String(index + 1)),
      }),
    ),
    actions: Object.entries(gateTimes).map(
      ([gate, [, startedAt, completedAt]], index) => ({
        actionId: `action-${gate.toLowerCase()}-1`,
        operationId: `operation-${gate.toLowerCase()}`,
        gate,
        kind: `gate-${gate.toLowerCase()}-action`,
        startedAt,
        completedAt,
        targetId: `target-${gate.toLowerCase()}`,
        terminalOutcome: 'succeeded',
        evidenceSha256: hash(String(index + 1)),
        rollbackOutcome: 'not_needed',
        resolvesActionId: null,
        secretsCaptured: false,
      }),
    ),
    secretExposureIncidents: [
      {
        incidentId: 'r1-prewindow-blueprint-sync-hook-dom-20260729',
        kind: 'render_blueprint_sync_hook_dom_exposure',
        observedAt: '2026-07-29T15:01:19Z',
        targetIdentityKind: 'render_blueprint_id',
        targetSha256: digest('blueprint-main'),
        operatorDecision: {
          decisionId: 'r1-decision-20260730-1',
          confirmedAt: '2026-07-30T08:56:00Z',
          decision: 'approved',
          targetSha256: digest('blueprint-main'),
        },
        disposition: {
          actionId: 'r1-secret-action-20260730-1',
          startedAt: '2026-07-30T08:57:00Z',
          completedAt: '2026-07-30T08:59:00Z',
          terminalOutcome: 'rotated',
          providerMethod: 'regenerate_sync_hook',
          providerReceipt: {
            kind: 'render_dashboard_terminal_observation',
            observedAt: '2026-07-30T08:59:00Z',
            action: 'regenerate_sync_hook',
            terminalOutcome: 'rotated',
            targetSha256: digest('blueprint-main'),
            evidenceSha256: hash('c'),
            secretsCaptured: false,
          },
          credentialNegativeProof: null,
          blueprintContinuity: {
            before: {
              observedAt: '2026-07-30T08:56:30Z',
              blueprintId: 'blueprint-main',
              sourceRepository: 'Glera/swipe-backend',
              sourceBranch: 'master',
              blueprintPath: 'render.yaml',
              evidenceSha256: hash('e'),
            },
            after: {
              observedAt: '2026-07-30T08:59:00Z',
              blueprintId: 'blueprint-main',
              sourceRepository: 'Glera/swipe-backend',
              sourceBranch: 'master',
              blueprintPath: 'render.yaml',
              evidenceSha256: hash('f'),
            },
            comparisonResult: 'equal',
          },
          terminalProofSha256: hash('d'),
          secretsCaptured: false,
        },
      },
    ],
    ingressNarrowing: {
      cidrKind: 'single-ipv4',
      operatorEgressCidrSha256: hash('8'),
      renderRuleCidrSha256: hash('8'),
      digestsEqual: true,
      protocolQuerySucceeded: true,
    },
    credentialRotation: {
      oldUsernameSha256: hash('1'),
      newUsernameSha256: hash('2'),
      newCredentialCreatedAt: '2026-07-30T09:07:00Z',
      capabilityComparisonSha256: hash('9'),
      profilesEqual: true,
      alembicCheckPassed: true,
      blueprintSyncIdentity: {
        available: true,
        id: 'sync-1',
        typedAbsence: null,
      },
      oldSessionsAfterDrain: 0,
      oldCredentialPostDeletionOutcome: 'authentication_rejected',
      newCredentialPostDeletionOutcome: 'query_succeeded',
    },
    restoreDrill: {
      financeDispositionId: 'finance-approval-1',
      recoveryServiceId: 'dpg-recovery',
      beforeObservation: {
        observedDbAt: '2026-07-30T09:25:00Z',
        receiptSha256: hash('a'),
      },
      restorePoint: '2026-07-30T09:26:00Z',
      afterTerminalRun: {
        runId: 'run-after-boundary',
        terminalAt: '2026-07-30T09:27:00Z',
        receiptSha256: hash('b'),
      },
      startRecoveryDbClock: '2026-07-30T09:40:00Z',
      startRecoveryObservationSha256: hash('8'),
      startedAt: '2026-07-30T09:40:00Z',
      availableAt: '2026-07-30T10:00:00Z',
      validatedAt: '2026-07-30T10:20:00Z',
      validation: {
        postgresMajorMatches: true,
        alembicHeadMatches: true,
        schemaAndTableCountsMatch: true,
        immutableSamplesMatch: true,
        beforePresent: true,
        afterAbsent: true,
      },
      sourceContinuity: {
        before: {
          observedAt: '2026-07-30T09:29:00Z',
          serviceId: 'dpg-source',
          status: 'available',
          deployIdentities: ['deploy-web-2', 'run-cron-2'],
          bindingsSha256: hash('c'),
        },
        after: {
          observedAt: '2026-07-30T10:21:00Z',
          serviceId: 'dpg-source',
          status: 'available',
          deployIdentities: ['run-cron-2', 'deploy-web-2'],
          bindingsSha256: hash('c'),
        },
        comparisonResult: 'equal',
      },
      observedRpoSeconds: 840,
      observedProvisionRtoSeconds: 1200,
      observedValidationRtoSeconds: 2400,
      cleanup: {
        operatorConfirmedAt: '2026-07-30T10:31:00Z',
        completedAt: '2026-07-30T10:35:00Z',
        terminalOutcome: 'deleted',
        namedOwner: null,
        financeNotificationId: null,
        deletionDeadline: null,
      },
    },
    ingressClosure: {
      backendPr: 26,
      backendHeadSha: 'c'.repeat(40),
      backendMergeSha: 'd'.repeat(40),
      independentPatchReview: {
        id: 'review-ingress-1',
        verdict: 'pass',
      },
      autoSyncControl: {
        linkedBlueprintId: 'blueprint-main',
        sourceRepository: 'Glera/swipe-backend',
        sourceBranch: 'master',
        blueprintPath: 'render.yaml',
        preMergeState: 'disabled',
        observedDisabledAt: '2026-07-30T10:40:30Z',
        preMergeStateEvidenceSha256: hash('8'),
        mergeObservedAt: '2026-07-30T10:41:00Z',
        manualPreviewObservedAt: '2026-07-30T10:41:30Z',
        manualPreviewExpectedOnly: true,
        manualPreviewSha256: hash('9'),
        finalState: 'disabled',
        finalStateObservedAt: '2026-07-30T10:43:00Z',
        finalStateEvidenceSha256: hash('0'),
      },
      blueprintSyncIdentity: {
        available: false,
        id: null,
        typedAbsence: 'dashboard_did_not_expose_opaque_id',
      },
      manualSyncTerminal: {
        terminalOutcome: 'succeeded',
        observedAt: '2026-07-30T10:42:00Z',
        evidenceSha256: hash('7'),
      },
      savedAt: '2026-07-30T10:42:30Z',
      allowlistRuleCount: 0,
      internalFreshProofs: consumers.map((consumer, index) => ({
        consumerId: consumer.serviceId,
        kind: consumer.kind,
        observedAt: `2026-07-30T10:4${5 + index}:00Z`,
        terminalOutcome: consumer.kind === 'web'
          ? 'query_succeeded'
          : 'run_succeeded',
        rotationDeployOrRunId: consumer.postSyncDeployOrRunId,
        postClosureDeployOrRunId: consumer.kind === 'web'
          ? 'deploy-web-2'
          : 'run-cron-3',
        rotationRuntimeIdentitySha256:
          consumer.rotationRuntimeIdentitySha256,
        newUsernameSha256: consumer.newUsernameSha256,
        evidenceSha256: hash(index === 0 ? 'd' : 'e'),
      })),
      externalProtocolProof: {
        observedAt: '2026-07-30T10:47:00Z',
        terminalOutcome: 'network_policy_refused',
        sqlExecuted: false,
        sanitizedStderrSha256: hash('f'),
        controlReachabilityPassed: true,
      },
    },
    secretsCaptured: false,
  };
}

export function makeValidFinalEvidence(
  receipt = makeValidOperatorReceipt(),
) {
  const rotation = receipt.credentialRotation;
  const drill = receipt.restoreDrill;
  const ingress = receipt.ingressClosure;
  return [
    '# Platform Reliability R1 final evidence',
    '',
    '## 1. Verdict',
    '',
    '- Overall status: `PASS`',
    `- Source database service: \`${receipt.sourceDatabaseServiceId}\``,
    `- Consumer set: \`sha256:${receipt.consumerClosure.consumerSetSha256}\``,
    '',
    '## 2. Snapshot 2 and bounded delta',
    '',
    '- platform-reliability-r1-0-snapshot-2.tsv',
    '- platform-reliability-r1-0-snapshot-2-db-capture-receipt.json',
    '- platform-reliability-r1-0-snapshot-2-render-receipt.json',
    '- platform-reliability-r1-0-snapshot-delta.json',
    '- platform-reliability-r1-0-snapshot-delta.md',
    '- platform-reliability-r1-gate-c0-blueprint-before.json',
    '- platform-reliability-r1-gate-c0-blueprint-after.json',
    '- platform-reliability-r1-gate-c0-blueprint-comparison.json',
    '- Snapshot completion sentinel: `PASS`',
    '',
    '## 3. Stop-before-start',
    '',
    '- Snapshot review: `PASS`',
    '- Consumer closure: `PASS`',
    '- Operator and finance approvals: `PASS`',
    '',
    '## 4. Consumer closure',
    '',
    '| Consumer | Pinned source | Rotated runtime | Fresh proof |',
    '|---|---|---|---|',
    ...receipt.consumerClosure.consumers.map((consumer) => (
      `| \`${consumer.serviceId}\` | \`${consumer.pinnedSourceSha}\` | `
      + `\`${consumer.postSyncDeployOrRunId}\` / `
      + `\`sha256:${consumer.rotationRuntimeIdentitySha256}\` | `
      + `\`sha256:${consumer.freshDatabaseProofSha256}\` |`
    )),
    '',
    '## 5. Operator-window timeline',
    '',
    '| Gate | Confirmation | Action | Result |',
    '|---|---|---|---|',
    ...receipt.actions.map((action) => {
      const confirmation = receipt.operatorConfirmations.find(
        (candidate) => candidate.gate === action.gate,
      );
      return (
        `| ${action.gate} — gate | \`${confirmation.confirmedAt}\` | `
        + `\`${action.actionId}\` / \`${action.operationId}\` | `
        + `\`${action.terminalOutcome}\` |`
      );
    }),
    '',
    '## 6. Ingress narrowing and credential rotation',
    '',
    `- Operator CIDR digest: \`sha256:${receipt.ingressNarrowing.operatorEgressCidrSha256}\``,
    `- Render CIDR digest: \`sha256:${receipt.ingressNarrowing.renderRuleCidrSha256}\``,
    `- Old username digest: \`sha256:${rotation.oldUsernameSha256}\``,
    `- New username digest: \`sha256:${rotation.newUsernameSha256}\``,
    `- Capability comparison: \`sha256:${rotation.capabilityComparisonSha256}\``,
    `- Old credential outcome: \`${rotation.oldCredentialPostDeletionOutcome}\``,
    `- New credential outcome: \`${rotation.newCredentialPostDeletionOutcome}\``,
    '',
    '## 7. Isolated restore drill',
    '',
    `- Finance disposition: \`${drill.financeDispositionId}\``,
    `- Recovery service: \`${drill.recoveryServiceId}\``,
    `- Before receipt: \`sha256:${drill.beforeObservation.receiptSha256}\``,
    `- Restore point: \`${drill.restorePoint}\``,
    `- After run: \`${drill.afterTerminalRun.runId}\` / \`sha256:${drill.afterTerminalRun.receiptSha256}\``,
    `- Start DB clock: \`${drill.startRecoveryDbClock}\` / \`sha256:${drill.startRecoveryObservationSha256}\``,
    `- RPO/RTO: \`${drill.observedRpoSeconds}\` / \`${drill.observedProvisionRtoSeconds}\` / \`${drill.observedValidationRtoSeconds}\` seconds`,
    `- Source binding: \`sha256:${drill.sourceContinuity.before.bindingsSha256}\``,
    `- Source deploy/run identities: ${drill.sourceContinuity.before.deployIdentities.map((identity) => `\`${identity}\``).join(', ')}`,
    `- Cleanup: \`${drill.cleanup.terminalOutcome}\``,
    '',
    '## 8. Durable external-ingress closure',
    '',
    `- Backend PR: \`${ingress.backendPr}\``,
    `- Backend head: \`${ingress.backendHeadSha}\``,
    `- Backend merge: \`${ingress.backendMergeSha}\``,
    `- Patch review: \`${ingress.independentPatchReview.id}\` / \`${ingress.independentPatchReview.verdict}\``,
    `- Linked Blueprint/source: \`${ingress.autoSyncControl.linkedBlueprintId}\` — \`${ingress.autoSyncControl.sourceRepository}\` / \`${ingress.autoSyncControl.sourceBranch}\` / \`${ingress.autoSyncControl.blueprintPath}\``,
    `- Auto Sync observed disabled before merge: \`${ingress.autoSyncControl.preMergeState}\` at \`${ingress.autoSyncControl.observedDisabledAt}\`; \`sha256:${ingress.autoSyncControl.preMergeStateEvidenceSha256}\``,
    `- Merge observed at: \`${ingress.autoSyncControl.mergeObservedAt}\``,
    `- Manual Sync preview: \`${ingress.autoSyncControl.manualPreviewObservedAt}\`; \`sha256:${ingress.autoSyncControl.manualPreviewSha256}\``,
    '- Manual Sync preview expected-only: `PASS`',
    `- Blueprint sync identity: \`${ingress.blueprintSyncIdentity.available ? ingress.blueprintSyncIdentity.id : ingress.blueprintSyncIdentity.typedAbsence}\``,
    `- Manual Sync terminal: \`${ingress.manualSyncTerminal.terminalOutcome}\` at \`${ingress.manualSyncTerminal.observedAt}\`; \`sha256:${ingress.manualSyncTerminal.evidenceSha256}\``,
    `- Closure saved at: \`${ingress.savedAt}\``,
    `- Auto Sync final state: \`${ingress.autoSyncControl.finalState}\` at \`${ingress.autoSyncControl.finalStateObservedAt}\`; \`sha256:${ingress.autoSyncControl.finalStateEvidenceSha256}\``,
    `- Allowlist rules: \`${ingress.allowlistRuleCount}\``,
    ...ingress.internalFreshProofs.map((proof) => (
      `- Internal proof \`${proof.consumerId}\`: `
      + `\`${proof.postClosureDeployOrRunId}\` / `
      + `\`sha256:${proof.evidenceSha256}\``
    )),
    `- External refusal: \`${ingress.externalProtocolProof.terminalOutcome}\` / \`sha256:${ingress.externalProtocolProof.sanitizedStderrSha256}\``,
    '',
    '## 9. Completion matrix',
    '',
    '| Requirement | Result | Evidence |',
    '|---|---|---|',
    ...R1_COMPLETION_REQUIREMENTS.map(
      (requirement) => `| ${requirement} | \`PASS\` | receipt |`,
    ),
    '',
    '## 10. Deviations, failures, and rollback',
    '',
    ...(receipt.actions.some((action) => action.terminalOutcome === 'failed')
      ? receipt.actions
        .filter((action) => action.terminalOutcome === 'failed')
        .map((action) => {
          const resolver = receipt.actions.find(
            (candidate) => candidate.resolvesActionId === action.actionId,
          );
          return (
            `- Failed action \`${action.actionId}\`: `
            + `\`${action.rollbackOutcome}\`; resolution `
            + `\`${resolver?.actionId ?? 'none'}\``
          );
        })
      : ['- Failed actions: `none`']),
    '',
    '## 11. Secret hygiene and patch closure',
    '',
    '- platform-reliability-r1-secret-scan-receipt.json',
    '- Scanner status: `PASS`',
    `- Blueprint replacement comparator source digest: \`sha256:${hash('d')}\``,
    ...receipt.secretExposureIncidents.map(incidentEvidenceLine),
    '',
    '## 12. Independent final review',
    '',
    'Requested after the exact evidence head is committed.',
    '',
  ].join('\n');
}
