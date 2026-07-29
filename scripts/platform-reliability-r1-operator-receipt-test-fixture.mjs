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
        gate,
        kind: `gate-${gate.toLowerCase()}-action`,
        startedAt,
        completedAt,
        targetId: `target-${gate.toLowerCase()}`,
        terminalOutcome: 'succeeded',
        evidenceSha256: hash(String(index + 1)),
        rollbackOutcome: 'not_needed',
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

export function makeValidFinalEvidence() {
  return [
    '# Platform Reliability R1 final evidence',
    '',
    '- Overall status: `PASS`',
    '',
    '## Completion matrix',
    '',
    '| Requirement | Result | Evidence |',
    '|---|---|---|',
    ...R1_COMPLETION_REQUIREMENTS.map(
      (requirement) => `| ${requirement} | \`PASS\` | receipt |`,
    ),
    '',
  ].join('\n');
}
