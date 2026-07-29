import { R1_COMPLETION_REQUIREMENTS } from './platform-reliability-r1-operator-receipt-validate.mjs';

const hash = (character) => character.repeat(64);

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
      startedAt: '2026-07-30T09:00:00Z',
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
      blueprintSyncIdentity: {
        available: false,
        id: null,
        typedAbsence: 'dashboard_did_not_expose_opaque_id',
      },
      savedAt: '2026-07-30T10:42:00Z',
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
    '',
    '## 12. Independent final review',
    '',
    'Requested after the exact evidence head is committed.',
    '',
  ].join('\n');
}
