import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  REQUIRED_EVIDENCE_FILES,
  scanEvidence,
} from './platform-reliability-r1-evidence-scan.mjs';
import {
  analyzeDeltaEvidence,
  toMarkdown as deltaToMarkdown,
} from './platform-reliability-r1-db-delta.mjs';
import {
  run as compareBlueprintReplacement,
} from './platform-reliability-r1-blueprint-replacement-compare.mjs';
import {
  makeValidFinalEvidence,
  makeValidOperatorReceipt,
} from './platform-reliability-r1-operator-receipt-test-fixture.mjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'platform-reliability-r1-evidence-scan.mjs',
);
const REPO_ROOT = path.resolve(path.dirname(SCRIPT), '..');
const BASE_REF = 'master';

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function writeValidDeltaEvidence(root, { providerAfterOverrides = {} } = {}) {
  const baselinePath = path.join(
    root,
    'platform-reliability-r1-0-snapshot-baseline.json',
  );
  const providerBeforePath = path.join(
    root,
    'platform-reliability-r1-0-render-receipt.json',
  );
  const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
  const providerAfter = JSON.parse(
    fs.readFileSync(providerBeforePath, 'utf8'),
  );
  providerAfter.observedAt = '2026-07-30T08:31:46Z';
  providerAfter.database.storage.usedPercent += 0.1;
  Object.assign(providerAfter, providerAfterOverrides);
  const after = [
    [
      'snapshot_meta',
      '2026-07-30 08:31:46 UTC',
      baseline.database,
      'on',
      'UTC',
      baseline.postgresVersionNum,
      baseline.databaseBytes + 1,
      'n/a',
    ],
    ['schema', baseline.publicTableCount, baseline.alembicHeads],
    [
      'relation_totals',
      baseline.relationCount,
      1,
      baseline.relationBytes + 1,
      'n/a',
      baseline.heapBytes,
      'n/a',
      baseline.indexBytes,
      'n/a',
    ],
    ['exact_row_count', 'public.fixture_table', baseline.exactRowsTotal + 1],
    ['exact_row_summary', 1, baseline.exactRowsTotal + 1],
    [
      'runtime',
      'database_stats',
      baseline.databaseStats.commits + 1,
      baseline.databaseStats.rollbacks,
      baseline.databaseStats.blocksRead,
      baseline.databaseStats.blocksHit + 1,
      baseline.databaseStats.tempFiles,
      baseline.databaseStats.tempBytes,
      baseline.databaseStats.deadlocks,
      baseline.databaseStats.conflicts,
      baseline.databaseStats.statsReset ?? '',
    ],
    ['snapshot_complete', 'ok'],
  ].map((row) => row.join('\t')).join('\n');
  const afterBytes = Buffer.from(after);
  const captureAfter = {
    schema: 'platform-reliability-r1-db-capture-receipt.v1',
    status: 'ok',
    capturedAt: '2026-07-30T08:31:46.000Z',
    outputSha256: crypto.createHash('sha256').update(afterBytes).digest('hex'),
    outputBytes: afterBytes.length,
    readOnly: true,
    completionSentinel: 'ok',
    credentialFileConsumed: true,
    credentialInArgv: false,
    secretsCaptured: false,
  };
  const afterPath = path.join(
    root,
    'platform-reliability-r1-0-snapshot-2.tsv',
  );
  const captureAfterPath = path.join(
    root,
    'platform-reliability-r1-0-snapshot-2-db-capture-receipt.json',
  );
  const providerAfterPath = path.join(
    root,
    'platform-reliability-r1-0-snapshot-2-render-receipt.json',
  );
  fs.writeFileSync(afterPath, afterBytes);
  fs.writeFileSync(
    captureAfterPath,
    `${JSON.stringify(captureAfter, null, 2)}\n`,
  );
  fs.writeFileSync(
    providerAfterPath,
    `${JSON.stringify(providerAfter, null, 2)}\n`,
  );
  const result = analyzeDeltaEvidence({
    beforePath: baselinePath,
    beforeBytes: fs.readFileSync(baselinePath),
    afterPath,
    afterBytes,
    captureAfterBytes: fs.readFileSync(captureAfterPath),
    providerBeforeBytes: fs.readFileSync(providerBeforePath),
    providerAfterBytes: fs.readFileSync(providerAfterPath),
  });
  fs.writeFileSync(
    path.join(root, 'platform-reliability-r1-0-snapshot-delta.json'),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  fs.writeFileSync(
    path.join(root, 'platform-reliability-r1-0-snapshot-delta.md'),
    deltaToMarkdown(result),
  );
}

function writeValidBlueprintEvidence(root, receipt) {
  const supportPath = path.join(
    root,
    'platform-reliability-r1-gate-c-render-support-response.json',
  );
  const support = JSON.parse(fs.readFileSync(supportPath, 'utf8'));
  const oldBlueprintId = support.affectedBlueprintId;
  const newBlueprintId = 'exs-replacement-blueprint';
  const sourceSha = 'a'.repeat(40);
  const services = receipt.consumerClosure.consumers.map((consumer, index) => ({
    serviceId: consumer.serviceId,
    kind: consumer.kind,
    status: consumer.kind === 'web' ? 'live' : 'available',
    plan: 'starter',
    schedule: consumer.kind === 'web' ? null : `${index} * * * *`,
    executionState: consumer.kind === 'web' ? 'running' : 'suspended',
    runtime: 'docker',
    dockerfilePath: './Dockerfile.bake',
    dockerCommand: consumer.kind === 'web'
      ? null
      : `python -m app.test_runner ${index}`,
    environmentKeyNames: ['DATABASE_URL', `SAFE_KEY_${index}`],
    databaseBinding: {
      environmentKey: 'DATABASE_URL',
      sourceDatabaseServiceId: receipt.sourceDatabaseServiceId,
      sourceProperty: 'connectionString',
    },
  }));
  const common = {
    schema: 'platform-reliability-r1-blueprint-replacement-observation.v3',
    sourceDatabase: {
      serviceId: receipt.sourceDatabaseServiceId,
      status: 'available',
      plan: 'basic-256mb',
      logicalDatabaseName: 'swipe-db',
      postgresMajorVersion: 16,
      allocatedStorageGiB: 1,
      storageAutoscalingEnabled: false,
    },
    services,
    safetyWindow: {
      startedAt: '2026-08-03T07:00:00Z',
      deadlineAt: '2026-08-03T07:15:00Z',
      maximumDurationSeconds: 900,
      cronExecutionState: 'suspended',
      webRestartObserved: false,
      unexpectedSyncObserved: false,
      providerFromDatabaseContinuity:
        'provider_confirmed_existing_service_environment_and_schedule_continuity',
    },
    hookValueObserved: false,
    secretsCaptured: false,
  };
  const before = {
    ...structuredClone(common),
    phase: 'before',
    observedAt: '2026-08-03T07:01:30Z',
    blueprint: {
      id: oldBlueprintId,
      sourceRepository: 'Glera/swipe-backend',
      sourceBranch: 'master',
      blueprintPath: 'render.yaml',
      sourceSha,
      autoSyncState: 'disabled',
      lastSyncAt:
        support.remediationResponse.providerStatements.lastObservedSyncAt,
    },
    oldBlueprintAbsence: null,
  };
  const after = {
    ...structuredClone(common),
    phase: 'after',
    observedAt: '2026-08-03T07:05:00Z',
    blueprint: {
      ...structuredClone(before.blueprint),
      id: newBlueprintId,
      lastSyncAt: null,
    },
    oldBlueprintAbsence: {
      blueprintId: oldBlueprintId,
      observedAt: '2026-08-03T07:05:00Z',
      terminalOutcome: 'not_found',
      observationSurface: 'authenticated_render_dashboard_blueprint_lookup',
    },
  };
  const beforePath = path.join(
    root,
    'platform-reliability-r1-gate-c0-blueprint-before.json',
  );
  const afterPath = path.join(
    root,
    'platform-reliability-r1-gate-c0-blueprint-after.json',
  );
  const comparisonPath = path.join(
    root,
    'platform-reliability-r1-gate-c0-blueprint-comparison.json',
  );
  fs.writeFileSync(beforePath, `${JSON.stringify(before, null, 2)}\n`);
  fs.writeFileSync(afterPath, `${JSON.stringify(after, null, 2)}\n`);
  const comparison = compareBlueprintReplacement([
    '--before', beforePath,
    '--after', afterPath,
    '--support', supportPath,
  ]);
  fs.writeFileSync(comparisonPath, comparison.output);
  const fileSha256 = (target) => crypto.createHash('sha256')
    .update(fs.readFileSync(target)).digest('hex');
  const beforeSha256 = fileSha256(beforePath);
  const afterSha256 = fileSha256(afterPath);
  const comparisonSha256 = fileSha256(comparisonPath);
  const oldTargetSha256 = crypto.createHash('sha256')
    .update(oldBlueprintId).digest('hex');

  const knownIncident = receipt.secretExposureIncidents[0];
  knownIncident.targetSha256 = oldTargetSha256;
  knownIncident.operatorDecision.targetSha256 = oldTargetSha256;
  knownIncident.disposition.providerReceipt.targetSha256 = oldTargetSha256;
  knownIncident.disposition.blueprintContinuity.before.blueprintId =
    oldBlueprintId;
  knownIncident.disposition.blueprintContinuity.after.blueprintId =
    oldBlueprintId;
  for (const consumer of receipt.consumerClosure.consumers) {
    consumer.blueprintReferenceId = newBlueprintId;
    consumer.pinnedSourceSha = sourceSha;
  }
  receipt.ingressClosure.autoSyncControl.linkedBlueprintId = newBlueprintId;
  receipt.window.completedAt = '2026-08-03T07:10:00Z';
  receipt.secretExposureIncidents.push({
    incidentId: 'r1-window-blueprint-sync-hook-dom-20260802-1',
    kind: 'render_blueprint_sync_hook_dom_exposure',
    observedAt: '2026-08-02T19:10:00Z',
    targetIdentityKind: 'render_blueprint_id',
    targetSha256: oldTargetSha256,
    operatorDecision: {
      decisionId: 'r1-decision-20260803-1',
      confirmedAt: '2026-08-03T07:01:00Z',
      decision: 'approved',
      targetSha256: oldTargetSha256,
    },
    disposition: {
      actionId: 'r1-secret-action-20260803-1',
      startedAt: '2026-08-03T07:02:00Z',
      completedAt: '2026-08-03T07:05:00Z',
      terminalOutcome: 'invalidated',
      providerMethod: 'replace_blueprint',
      providerReceipt: {
        kind: 'render_dashboard_terminal_observation',
        observedAt: '2026-08-03T07:05:00Z',
        action: 'replace_blueprint',
        terminalOutcome: 'invalidated',
        targetSha256: oldTargetSha256,
        evidenceSha256: afterSha256,
        secretsCaptured: false,
      },
      credentialNegativeProof: null,
      blueprintContinuity: {
        evidenceClass: comparison.result.evidenceClass,
        before: {
          observedAt: before.observedAt,
          blueprintId: oldBlueprintId,
          sourceRepository: 'Glera/swipe-backend',
          sourceBranch: 'master',
          blueprintPath: 'render.yaml',
          sourceSha,
          evidenceSha256: beforeSha256,
          linkedServiceIdsSha256:
            comparison.result.linkedServiceIdsSha256,
          linkedServiceConfigurationSha256:
            comparison.result.linkedServiceConfigurationSha256,
          autoSyncState: 'disabled',
        },
        after: {
          observedAt: after.observedAt,
          blueprintId: newBlueprintId,
          sourceRepository: 'Glera/swipe-backend',
          sourceBranch: 'master',
          blueprintPath: 'render.yaml',
          sourceSha,
          evidenceSha256: afterSha256,
          linkedServiceIdsSha256:
            comparison.result.linkedServiceIdsSha256,
          linkedServiceConfigurationSha256:
            comparison.result.linkedServiceConfigurationSha256,
          autoSyncState: 'disabled',
        },
        comparisonResult: 'replaced_same_source_and_services',
      },
      terminalProofSha256: comparisonSha256,
      secretsCaptured: false,
    },
  });
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-evidence-scan-'));
  git(root, ['init', '--initial-branch=master']);
  fs.writeFileSync(path.join(root, 'README.md'), 'fixture baseline\n');
  for (const filename of [
    'platform-reliability-r1-0-snapshot-baseline.json',
    'platform-reliability-r1-0-db-query-receipt.json',
    'platform-reliability-r1-0-render-receipt.json',
    'platform-reliability-r1-gate-c-render-support-response.json',
  ]) {
    fs.copyFileSync(path.join(REPO_ROOT, filename), path.join(root, filename));
  }
  git(root, ['add', 'README.md', ...[
    'platform-reliability-r1-0-snapshot-baseline.json',
    'platform-reliability-r1-0-db-query-receipt.json',
    'platform-reliability-r1-0-render-receipt.json',
    'platform-reliability-r1-gate-c-render-support-response.json',
  ]]);
  git(root, [
    '-c',
    'user.name=R1 Test',
    '-c',
    'user.email=r1-test@example.invalid',
    'commit',
    '-m',
    'fixture baseline',
  ]);
  git(root, ['switch', '--create', 'evidence']);

  for (const filename of REQUIRED_EVIDENCE_FILES) {
    const content = filename.endsWith('.json')
      ? `${JSON.stringify({
        schema: 'safe-receipt.v1',
        status: 'pass',
        sha256: 'a'.repeat(64),
      })}\n`
      : `${filename}\nstatus pass\nsha256 ${'a'.repeat(64)}\n`;
    fs.writeFileSync(path.join(root, filename), content);
  }
  writeValidDeltaEvidence(root);
  const operatorReceipt = makeValidOperatorReceipt();
  writeValidBlueprintEvidence(root, operatorReceipt);
  fs.writeFileSync(
    path.join(root, 'platform-reliability-r1-operator-receipt.json'),
    `${JSON.stringify(operatorReceipt)}\n`,
  );
  fs.writeFileSync(
    path.join(root, 'platform-reliability-r1-final-evidence.md'),
    makeValidFinalEvidence(operatorReceipt),
  );
  return {
    root,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function scan(root) {
  return scanEvidence(root, { baseRef: BASE_REF });
}

test('scans the exact git patch manifest and emits only hashes', () => {
  const files = fixture();
  try {
    const result = scan(files.root);
    assert.equal(result.status, 'pass');
    assert.equal(result.requiredFiles.length, REQUIRED_EVIDENCE_FILES.length);
    assert.equal(result.patchClosure.paths.length, REQUIRED_EVIDENCE_FILES.length);
    assert.equal(result.patchClosure.baseRef, BASE_REF);
    assert.match(result.patchClosure.mergeBaseSha, /^[a-f0-9]{40,64}$/);
    assert.equal(result.secretMatches, 0);
    assert.equal(result.exactIpv4Captured, false);
    assert.equal(result.secretsCaptured, false);
    assert.equal(result.operatorValidation.status, 'pass');
    assert.equal(result.operatorValidation.gateCount, 7);
    assert.equal(result.operatorValidation.completionRequirementCount, 12);
    assert.equal(result.operatorValidation.placeholdersResolved, true);
    assert.equal(result.deltaValidation.status, 'pass');
    assert.equal(
      result.deltaValidation.schema,
      'platform-reliability-r1-snapshot-delta.v1',
    );
    assert.match(result.ruleSetSha256, /^[a-f0-9]{64}$/);
    assert.match(result.scannerSourceSha256, /^[a-f0-9]{64}$/);
    assert.match(result.operatorValidatorSourceSha256, /^[a-f0-9]{64}$/);
    assert.match(result.deltaAnalyzerSourceSha256, /^[a-f0-9]{64}$/);
    assert.match(result.blueprintComparatorSourceSha256, /^[a-f0-9]{64}$/);
    assert.equal(result.blueprintReplacementValidation.status, 'pass');
    assert.equal(
      result.blueprintReplacementValidation.evidenceClass,
      'operator_attested',
    );
    assert.equal(
      result.blueprintReplacementValidation.providerVerifiedServiceContinuity,
      false,
    );
    assert.equal(
      result.blueprintReplacementValidation
        .providerConfirmedFromDatabaseContinuity,
      true,
    );
    for (const artifact of result.requiredFiles) {
      assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
      assert.equal(Object.hasOwn(artifact, 'content'), false);
    }

    const cli = JSON.parse(execFileSync(
      process.execPath,
      [SCRIPT, '--root', files.root, '--base-ref', BASE_REF],
      { encoding: 'utf8' },
    ));
    assert.deepEqual(cli, result);
  } finally {
    files.cleanup();
  }
});

test('rejects stale or independently modified delta outputs and inputs', () => {
  for (const mutate of [
    (root) => {
      fs.appendFileSync(
        path.join(root, 'platform-reliability-r1-0-snapshot-delta.md'),
        '\nstale review text\n',
      );
    },
    (root) => {
      const target = path.join(
        root,
        'platform-reliability-r1-0-snapshot-delta.json',
      );
      const delta = JSON.parse(fs.readFileSync(target, 'utf8'));
      delta.database.deltaBytes += 1;
      fs.writeFileSync(target, `${JSON.stringify(delta, null, 2)}\n`);
    },
    (root) => {
      const target = path.join(
        root,
        'platform-reliability-r1-0-snapshot-2-render-receipt.json',
      );
      const provider = JSON.parse(fs.readFileSync(target, 'utf8'));
      provider.database.storage.usedPercent += 0.1;
      fs.writeFileSync(target, `${JSON.stringify(provider, null, 2)}\n`);
    },
    (root) => {
      const target = path.join(
        root,
        'platform-reliability-r1-0-snapshot-delta.json',
      );
      fs.writeFileSync(
        target,
        Buffer.concat([
          Buffer.from([0xef, 0xbb, 0xbf]),
          fs.readFileSync(target),
        ]),
      );
    },
    (root) => {
      const target = path.join(
        root,
        'platform-reliability-r1-0-snapshot-delta.md',
      );
      fs.writeFileSync(
        target,
        Buffer.concat([
          Buffer.from([0xef, 0xbb, 0xbf]),
          fs.readFileSync(target),
        ]),
      );
    },
  ]) {
    const files = fixture();
    try {
      mutate(files.root);
      assert.throws(
        () => scan(files.root),
        /delta JSON\/Markdown pair does not match the exact evidence inputs/,
      );
    } finally {
      files.cleanup();
    }
  }
});

test('rejects stale or unbound Blueprint replacement evidence', () => {
  for (const mutate of [
    (root) => {
      const target = path.join(
        root,
        'platform-reliability-r1-gate-c0-blueprint-after.json',
      );
      const after = JSON.parse(fs.readFileSync(target, 'utf8'));
      after.services[0].plan = 'different';
      fs.writeFileSync(target, `${JSON.stringify(after, null, 2)}\n`);
    },
    (root) => {
      const target = path.join(
        root,
        'platform-reliability-r1-gate-c0-blueprint-comparison.json',
      );
      const comparison = JSON.parse(fs.readFileSync(target, 'utf8'));
      comparison.sourceSha = 'b'.repeat(40);
      fs.writeFileSync(target, `${JSON.stringify(comparison, null, 2)}\n`);
    },
    (root) => {
      const receiptPath = path.join(
        root,
        'platform-reliability-r1-operator-receipt.json',
      );
      const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      receipt.secretExposureIncidents[1].disposition.terminalProofSha256 =
        'f'.repeat(64);
      fs.writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
      fs.writeFileSync(
        path.join(root, 'platform-reliability-r1-final-evidence.md'),
        makeValidFinalEvidence(receipt),
      );
    },
    (root) => {
      const receiptPath = path.join(
        root,
        'platform-reliability-r1-operator-receipt.json',
      );
      const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
      receipt.secretExposureIncidents[1].disposition.providerReceipt
        .evidenceSha256 = 'e'.repeat(64);
      fs.writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
      fs.writeFileSync(
        path.join(root, 'platform-reliability-r1-final-evidence.md'),
        makeValidFinalEvidence(receipt),
      );
    },
  ]) {
    const files = fixture();
    try {
      mutate(files.root);
      assert.throws(
        () => scan(files.root),
        /published comparison|Blueprint replacement|operator receipt is not bound/,
      );
    } finally {
      files.cleanup();
    }
  }
});

test('rejects non-exact comparison bytes even when the receipt rebinds their hash', () => {
  const files = fixture();
  try {
    const comparisonPath = path.join(
      files.root,
      'platform-reliability-r1-gate-c0-blueprint-comparison.json',
    );
    const comparison = JSON.parse(fs.readFileSync(comparisonPath, 'utf8'));
    comparison.callerAuthored = true;
    fs.writeFileSync(comparisonPath, `${JSON.stringify(comparison, null, 2)}\n`);
    const comparisonSha256 = crypto.createHash('sha256')
      .update(fs.readFileSync(comparisonPath)).digest('hex');
    const receiptPath = path.join(
      files.root,
      'platform-reliability-r1-operator-receipt.json',
    );
    const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    receipt.secretExposureIncidents[1].disposition.terminalProofSha256 =
      comparisonSha256;
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
    fs.writeFileSync(
      path.join(files.root, 'platform-reliability-r1-final-evidence.md'),
      makeValidFinalEvidence(receipt),
    );

    assert.throws(
      () => scan(files.root),
      /published comparison does not match the exact inputs/,
    );
  } finally {
    files.cleanup();
  }
});

test('rejects an exact but inconsistent Blueprint comparison before receipt binding', () => {
  const files = fixture();
  try {
    const beforePath = path.join(
      files.root,
      'platform-reliability-r1-gate-c0-blueprint-before.json',
    );
    const afterPath = path.join(
      files.root,
      'platform-reliability-r1-gate-c0-blueprint-after.json',
    );
    const supportPath = path.join(
      files.root,
      'platform-reliability-r1-gate-c-render-support-response.json',
    );
    const comparisonPath = path.join(
      files.root,
      'platform-reliability-r1-gate-c0-blueprint-comparison.json',
    );
    const after = JSON.parse(fs.readFileSync(afterPath, 'utf8'));
    after.oldBlueprintAbsence.observedAt = '2026-08-03T07:04:59Z';
    fs.writeFileSync(afterPath, `${JSON.stringify(after, null, 2)}\n`);
    const comparison = compareBlueprintReplacement([
      '--before', beforePath,
      '--after', afterPath,
      '--support', supportPath,
    ]);
    assert.equal(comparison.result.boundedReplacementConsistent, false);
    fs.writeFileSync(comparisonPath, comparison.output);

    const fileSha256 = (target) => crypto.createHash('sha256')
      .update(fs.readFileSync(target)).digest('hex');
    const receiptPath = path.join(
      files.root,
      'platform-reliability-r1-operator-receipt.json',
    );
    const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
    const disposition = receipt.secretExposureIncidents[1].disposition;
    disposition.providerReceipt.evidenceSha256 = fileSha256(afterPath);
    disposition.blueprintContinuity.after.evidenceSha256 = fileSha256(afterPath);
    disposition.terminalProofSha256 = fileSha256(comparisonPath);
    fs.writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
    fs.writeFileSync(
      path.join(files.root, 'platform-reliability-r1-final-evidence.md'),
      makeValidFinalEvidence(receipt),
    );

    assert.throws(
      () => scan(files.root),
      /not bounded and internally consistent/,
    );
  } finally {
    files.cleanup();
  }
});

test('accepts complete operator evidence and the all-IPv4 sentinel', () => {
  const files = fixture();
  try {
    writeValidDeltaEvidence(files.root, {
      providerAfterOverrides: {
        preWindowRule: '0.0.0.0/0',
      },
    });
    fs.writeFileSync(
      path.join(files.root, 'platform-reliability-r1-final-evidence.md'),
      [
        makeValidFinalEvidence(JSON.parse(fs.readFileSync(
          path.join(
            files.root,
            'platform-reliability-r1-operator-receipt.json',
          ),
          'utf8',
        ))),
        'The previous all-IPv4 rule was replaced by a single-host rule and then',
        'an empty allowlist. Fresh internal database queries passed; a fresh',
        'external PostgreSQL protocol request was refused before SQL execution.',
        'Only SHA-256 identity digests are retained.',
        '',
      ].join('\n'),
    );

    assert.equal(scan(files.root).status, 'pass');
  } finally {
    files.cleanup();
  }
});

test('rejects an unexpected tracked or untracked artifact outside the manifest', () => {
  for (const [filename, commit] of [
    ['operator-debug.log', false],
    ['supporting-evidence.md', true],
  ]) {
    const files = fixture();
    try {
      fs.writeFileSync(path.join(files.root, filename), 'apparently safe\n');
      if (commit) {
        git(files.root, ['add', filename]);
        git(files.root, [
          '-c',
          'user.name=R1 Test',
          '-c',
          'user.email=r1-test@example.invalid',
          'commit',
          '-m',
          'unexpected evidence',
        ]);
      }
      assert.throws(
        () => scan(files.root),
        /git patch contains artifacts outside the evidence manifest/,
      );
    } finally {
      files.cleanup();
    }
  }
});

test('rejects credentials, identities, tokens, libpq forms, and IPs without echoing them', () => {
  const cases = [
    ['postgres-url', 'postgresql://user:pw@db.example.test/swipe'],
    ['credentialed-url', 'https://alice:correct-horse@example.test/path'],
    ['render-postgres-host', 'db-name.oregon-postgres.render.com'],
    ['libpq-password', 'password=p@ss'],
    ['libpq-user', 'host=db.example.test user=u'],
    ['pg-environment', 'PGPASSWORD=p@ss'],
    ['raw-identity-field', '{"username":"raw_operator_name"}'],
    ['github-token-ghp', `ghp_${'A'.repeat(24)}`],
    ['github-token-gho', `gho_${'A'.repeat(24)}`],
    ['github-token-ghu', `ghu_${'A'.repeat(24)}`],
    ['github-token-ghs', `ghs_${'A'.repeat(24)}`],
    ['github-token-ghr', `ghr_${'A'.repeat(24)}`],
    ['github-token-fine-grained', `github_pat_${'A'.repeat(24)}`],
    ['openai-key', `sk-${'B'.repeat(24)}`],
    ['render-database-username', 'old user swipe_example_user_random'],
    ['literal-ipv4', 'operator cidr 203.0.113.42/32'],
  ];

  for (const [label, secret] of cases) {
    const files = fixture();
    const target = path.join(
      files.root,
      'platform-reliability-r1-final-evidence.md',
    );
    fs.writeFileSync(target, `safe prefix\n${secret}\nsafe suffix\n`);
    try {
      let observed;
      assert.throws(
        () => scan(files.root),
        (error) => {
          observed = error.message;
          return /secret hygiene rule/.test(error.message);
        },
        label,
      );
      assert.equal(observed.includes(secret), false, `${label} leaked in error`);
    } finally {
      files.cleanup();
    }
  }
});

test('parses JSON and rejects decoded escapes or sensitive keys', () => {
  const cases = [
    ['escaped-ip', '{"note":"203\\u002e0\\u002e113\\u002e42"}'],
    [
      'escaped-url',
      '{"note":"postgresql\\u003a\\u002f\\u002fuser\\u003apw\\u0040db.test/swipe"}',
    ],
    ['sensitive-string-key', '{"password":"short"}'],
    ['sensitive-non-string-key', '{"PGPASSWORD":false}'],
  ];

  for (const [label, content] of cases) {
    const files = fixture();
    fs.writeFileSync(
      path.join(
        files.root,
        'platform-reliability-r1-operator-receipt.json',
      ),
      `${content}\n`,
    );
    try {
      assert.throws(
        () => scan(files.root),
        /secret hygiene rule/,
        label,
      );
    } finally {
      files.cleanup();
    }
  }
});

test('fails closed for missing, linked, invalid JSON, binary, and oversized artifacts', () => {
  {
    const files = fixture();
    fs.rmSync(path.join(files.root, REQUIRED_EVIDENCE_FILES[0]));
    try {
      assert.throws(
        () => scan(files.root),
        /required artifact is (?:missing|outside the git patch)/,
      );
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    const artifact = path.join(files.root, REQUIRED_EVIDENCE_FILES[0]);
    fs.rmSync(artifact);
    fs.symlinkSync('README.md', artifact);
    try {
      assert.throws(
        () => scan(files.root),
        /could not be opened without following links/,
      );
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    fs.writeFileSync(
      path.join(
        files.root,
        'platform-reliability-r1-operator-receipt.json',
      ),
      '{not-json}\n',
    );
    try {
      assert.throws(() => scan(files.root), /JSON artifact is invalid/);
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    fs.writeFileSync(
      path.join(files.root, REQUIRED_EVIDENCE_FILES[0]),
      Buffer.from([0x73, 0x61, 0x66, 0x65, 0x00]),
    );
    try {
      assert.throws(() => scan(files.root), /binary NUL bytes/);
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    fs.writeFileSync(
      path.join(files.root, REQUIRED_EVIDENCE_FILES[0]),
      Buffer.alloc(5 * 1024 * 1024 + 1, 0x61),
    );
    try {
      assert.throws(() => scan(files.root), /size is outside/);
    } finally {
      files.cleanup();
    }
  }
});

test('CLI rejects malformed arguments before reading evidence', () => {
  assert.throws(
    () => execFileSync(process.execPath, [SCRIPT, '--typo', '.'], {
      encoding: 'utf8',
    }),
    /usage:/,
  );
});
