import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  run,
} from './platform-reliability-r1-blueprint-replacement-compare.mjs';
import {
  createBlueprintGitFixture,
} from './platform-reliability-r1-blueprint-git-fixture.test-helper.mjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'platform-reliability-r1-blueprint-replacement-compare.mjs',
);

const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hash = (character) => character.repeat(64);

function fixture() {
  const oldBlueprintId = 'exs-old-blueprint';
  const sourceSha = 'a'.repeat(40);
  const services = [
    {
      serviceId: 'srv-web',
      kind: 'web',
      status: 'live',
      plan: 'starter',
      schedule: null,
      executionState: 'running',
      runtime: 'docker',
      dockerfilePath: './Dockerfile.bake',
      dockerCommand: null,
      environmentKeyNames: ['PUBLIC_BASE_URL', 'DATABASE_URL'],
      databaseBinding: {
        environmentKey: 'DATABASE_URL',
        sourceDatabaseServiceId: 'dpg-source',
        sourceProperty: 'connectionString',
      },
    },
    {
      serviceId: 'srv-cron-b',
      kind: 'cron',
      status: 'available',
      plan: 'starter',
      schedule: '0 * * * *',
      executionState: 'suspended',
      runtime: 'docker',
      dockerfilePath: './Dockerfile.bake',
      dockerCommand: 'python -m app.content_analytics run-once',
      environmentKeyNames: ['ENABLE_CONTENT_ANALYTICS', 'DATABASE_URL'],
      databaseBinding: {
        environmentKey: 'DATABASE_URL',
        sourceDatabaseServiceId: 'dpg-source',
        sourceProperty: 'connectionString',
      },
    },
    {
      serviceId: 'srv-cron-a',
      kind: 'cron',
      status: 'available',
      plan: 'starter',
      schedule: '15 * * * *',
      executionState: 'suspended',
      runtime: 'docker',
      dockerfilePath: './Dockerfile.bake',
      dockerCommand: 'python -m app.feed_sequencing_shadow_runner run-once',
      environmentKeyNames: ['ENABLE_FEED_SEQUENCING_SHADOW_OPS', 'DATABASE_URL'],
      databaseBinding: {
        environmentKey: 'DATABASE_URL',
        sourceDatabaseServiceId: 'dpg-source',
        sourceProperty: 'connectionString',
      },
    },
  ];
  const common = {
    schema: 'platform-reliability-r1-blueprint-replacement-observation.v3',
    sourceDatabase: {
      serviceId: 'dpg-source',
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
    observedAt: '2026-08-03T07:00:00Z',
    blueprint: {
      id: oldBlueprintId,
      sourceRepository: 'Glera/swipe-backend',
      sourceBranch: 'master',
      blueprintPath: 'render.yaml',
      sourceSha,
      autoSyncState: 'disabled',
      lastSyncAt: '2026-07-30T15:09:14Z',
    },
    oldBlueprintAbsence: null,
  };
  const after = {
    ...structuredClone(common),
    phase: 'after',
    observedAt: '2026-08-03T07:05:00Z',
    blueprint: {
      ...structuredClone(before.blueprint),
      id: 'exs-new-blueprint',
      lastSyncAt: null,
    },
    oldBlueprintAbsence: {
      blueprintId: oldBlueprintId,
      observedAt: '2026-08-03T07:05:00Z',
      terminalOutcome: 'not_found',
      observationSurface: 'authenticated_render_dashboard_blueprint_lookup',
    },
  };
  const support = {
    schema: 'platform-reliability-r1-render-support-response.v2',
    observedAt: '2026-08-04T06:34:25Z',
    channel: 'authenticated_render_dashboard_support_conversation',
    affectedBlueprintId: oldBlueprintId,
    affectedBlueprintIdentitySha256: `sha256:${digest(oldBlueprintId)}`,
    remediationResponse: {
      responseActorKind: 'human_render_support_agent',
      responseDate: '2026-08-03',
      responseTimestampPrecision: 'date_only',
      providerStatements: {
        supportedRemediation: 'delete_existing_blueprint_then_create_new_blueprint',
        oldHookInvalidatedByRemediation: true,
        newBlueprintReceivesNewHook: true,
        existingServicesDeletedWithBlueprint: false,
        existingServicesExpectedToRelinkByDetection: true,
        lastObservedSyncAt: '2026-07-30T15:09:14Z',
        hookCanInitiateBlueprintSync: true,
        hookAloneCanChangeConnectedRepository: false,
        providerIncidentAssessment: 'fairly_minor',
      },
    },
    continuityResponse: {
      responseActorKind: 'human_render_support_agent',
      responseDate: '2026-08-04',
      responseTimestampPrecision: 'date_only',
      providerStatements: {
        fromDatabaseMaterializesServiceEnvironmentVariables: true,
        cronSchedulesStoredOnCronServices: true,
        blueprintReplacementChangesExistingServices: false,
      },
    },
    evidenceLimits: {
      providerHasNotExecutedRemediation: true,
      oldHookTerminallyInvalidated: false,
      providerHasNotObservedReplacementExecution: true,
      providerSideActorAuditProvided: false,
      lastSyncTimestampImpliesNoPostExposureSync: true,
    },
    nextAuthorizedBoundary: 'operator_go_required_before_blueprint_delete_recreate',
    secretValueSubmitted: false,
    secretValueCaptured: false,
  };
  return { before, after, support };
}

function writeFixture(root, candidate = fixture()) {
  const gitFixture = createBlueprintGitFixture(root);
  if (candidate.before.blueprint.sourceSha === 'a'.repeat(40)) {
    candidate.before.blueprint.sourceSha = gitFixture.liveBlueprintSourceSha;
  }
  if (candidate.after.blueprint.sourceSha === 'a'.repeat(40)) {
    candidate.after.blueprint.sourceSha = gitFixture.afterSourceSha;
  }
  const paths = {
    before: path.join(root, 'before.json'),
    after: path.join(root, 'after.json'),
    support: path.join(root, 'support.json'),
    comparison: path.join(root, 'comparison.json'),
    sourcePolicy: gitFixture.policyPath,
    backendRepo: gitFixture.repository,
  };
  fs.writeFileSync(paths.before, `${JSON.stringify(candidate.before, null, 2)}\n`);
  fs.writeFileSync(paths.after, `${JSON.stringify(candidate.after, null, 2)}\n`);
  fs.writeFileSync(paths.support, `${JSON.stringify(candidate.support, null, 2)}\n`);
  return paths;
}

function comparisonArgs(paths, extra = []) {
  return [
    '--before', paths.before,
    '--after', paths.after,
    '--support', paths.support,
    '--source-policy', paths.sourcePolicy,
    '--backend-repo', paths.backendRepo,
    ...extra,
  ];
}

test('proves a different Blueprint with reviewed source transition and service continuity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const paths = writeFixture(root);
  const { result, output } = run(comparisonArgs(paths));
  assert.equal(result.boundedReplacementConsistent, true);
  assert.equal(result.evidenceClass, 'operator_attested');
  assert.equal(result.providerVerifiedServiceContinuity, false);
  assert.equal(result.providerConfirmedFromDatabaseContinuity, true);
  assert.equal(
    result.hookDispositionBasis,
    'provider_contract_plus_terminal_old_blueprint_absence',
  );
  assert.deepEqual(result.differences, []);
  assert.equal(result.oldBlueprintAbsent, true);
  assert.equal(result.executionQuiescenceObserved, true);
  assert.notEqual(result.beforeSourceSha, result.afterSourceSha);
  assert.equal(
    result.sourceTransition.authority,
    'exact_git_objects_bound_by_reviewed_freeze_policy',
  );
  assert.equal(result.sourceTransition.renderBytesEqual, true);
  assert.equal(result.sourceTransition.forbiddenRuntimePathAbsent, true);
  assert.equal(result.secretsCaptured, false);
  fs.writeFileSync(paths.comparison, output);
  const verified = run(comparisonArgs(paths, [
    '--verify-json', paths.comparison,
  ]));
  assert.equal(verified.result.boundedReplacementConsistent, true);
});

test('reports source, service, database, identity, and absence drift', () => {
  for (const mutate of [
    (candidate) => {
      candidate.after.blueprint.id = candidate.before.blueprint.id;
    },
    (candidate) => {
      candidate.after.services[0].plan = 'pro';
    },
    (candidate) => {
      candidate.after.sourceDatabase.plan = 'different';
    },
    (candidate) => {
      candidate.after.oldBlueprintAbsence.blueprintId = 'exs-other';
    },
    (candidate) => {
      candidate.support.affectedBlueprintIdentitySha256 = `sha256:${hash('d')}`;
    },
    (candidate) => {
      candidate.support.remediationResponse.providerStatements.lastObservedSyncAt =
        '2026-08-03T07:00:00Z';
      candidate.before.blueprint.lastSyncAt = '2026-08-03T07:00:00Z';
    },
  ]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const candidate = fixture();
    mutate(candidate);
    const paths = writeFixture(root, candidate);
    const { result } = run(comparisonArgs(paths));
    assert.equal(result.boundedReplacementConsistent, false);
    assert.ok(result.differences.length >= 1);
  }
});

test('fails closed on unsafe observation structure and stale comparison bytes', () => {
  const structuralCases = [
    (candidate) => {
      candidate.before.hookValueObserved = true;
    },
    (candidate) => {
      candidate.after.secretsCaptured = true;
    },
    (candidate) => {
      candidate.after.blueprint.autoSyncState = 'enabled';
    },
    (candidate) => {
      candidate.after.services.push(structuredClone(candidate.after.services[0]));
    },
    (candidate) => {
      candidate.after.extra = true;
    },
    (candidate) => {
      candidate.before.services[1].executionState = 'running';
    },
    (candidate) => {
      candidate.after.safetyWindow.deadlineAt = '2026-08-03T07:15:01Z';
    },
    (candidate) => {
      candidate.after.safetyWindow.unexpectedSyncObserved = true;
    },
    (candidate) => {
      candidate.after.services[0].databaseBinding.sourceDatabaseServiceId =
        'dpg-foreign';
    },
    (candidate) => {
      candidate.before.services[0].commandSha256 = hash('f');
    },
    (candidate) => {
      candidate.before.safetyWindow.providerFromDatabaseContinuity =
        'unconfirmed_compensated_by_quiescence';
    },
  ];
  for (const mutate of structuralCases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const candidate = fixture();
    mutate(candidate);
    const paths = writeFixture(root, candidate);
    assert.throws(
      () => run(comparisonArgs(paths)),
    );
  }

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const paths = writeFixture(root);
  fs.writeFileSync(paths.comparison, '{}\n');
  assert.throws(
    () => run(comparisonArgs(paths, ['--verify-json', paths.comparison])),
    /published comparison/,
  );
});

test('rejects unreviewed source transitions and altered Git-object policy', () => {
  {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const paths = writeFixture(root);
    const after = JSON.parse(fs.readFileSync(paths.after, 'utf8'));
    const before = JSON.parse(fs.readFileSync(paths.before, 'utf8'));
    after.blueprint.sourceSha = before.blueprint.sourceSha;
    fs.writeFileSync(paths.after, `${JSON.stringify(after, null, 2)}\n`);
    assert.throws(
      () => run(comparisonArgs(paths)),
      /exact reviewed freeze merge/,
    );
  }

  for (const mutatePolicy of [
    (policy) => {
      policy.liveRenderSha256 = hash('f');
    },
    (policy) => {
      policy.sentinelDockerfileSha256 = hash('e');
    },
    (policy) => {
      policy.forbiddenRuntimePath = 'README.md';
    },
    (policy) => {
      policy.expectedMergeSecondParent = policy.expectedMergeFirstParent;
    },
  ]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const paths = writeFixture(root);
    const policy = JSON.parse(fs.readFileSync(paths.sourcePolicy, 'utf8'));
    mutatePolicy(policy);
    fs.writeFileSync(
      paths.sourcePolicy,
      `${JSON.stringify(policy, null, 2)}\n`,
    );
    assert.throws(() => run(comparisonArgs(paths)));
  }

  {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const paths = writeFixture(root);
    execFileSync(
      'git',
      ['-C', paths.backendRepo, 'remote', 'set-url', 'origin', 'https://example.invalid/forged.git'],
    );
    assert.throws(
      () => run(comparisonArgs(paths)),
      /origin does not match/,
    );
  }
});

test('rejects forged or broadened support authority', () => {
  for (const mutate of [
    (candidate) => {
      candidate.support.remediationResponse.responseActorKind = 'automated_bot_reply';
    },
    (candidate) => {
      candidate.support.channel = 'anonymous_forum_post';
    },
    (candidate) => {
      candidate.support.nextAuthorizedBoundary = 'no_operator_go_required';
    },
    (candidate) => {
      candidate.support.secretValueSubmitted = true;
    },
    (candidate) => {
      candidate.support.observedAt = 'not-a-timestamp';
    },
    (candidate) => {
      candidate.support.remediationResponse.responseDate = '2026-02-31';
    },
    (candidate) => {
      candidate.support.remediationResponse.providerStatements.unreviewedAuthority = true;
    },
    (candidate) => {
      candidate.support.evidenceLimits.providerSideActorAuditProvided = true;
    },
    (candidate) => {
      candidate.support.continuityResponse.responseActorKind =
        'automated_bot_reply';
    },
    (candidate) => {
      candidate.support.continuityResponse.providerStatements
        .fromDatabaseMaterializesServiceEnvironmentVariables = false;
    },
    (candidate) => {
      candidate.support.continuityResponse.providerStatements
        .cronSchedulesStoredOnCronServices = false;
    },
    (candidate) => {
      candidate.support.continuityResponse.providerStatements
        .blueprintReplacementChangesExistingServices = true;
    },
    (candidate) => {
      candidate.support.evidenceLimits.providerHasNotObservedReplacementExecution =
        false;
    },
    (candidate) => {
      candidate.support.continuityResponse.providerStatements
        .unreviewedAuthority = true;
    },
    (candidate) => {
      candidate.support.continuityResponse.responseDate = '2026-08-02';
    },
  ]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const candidate = fixture();
    mutate(candidate);
    const paths = writeFixture(root, candidate);
    assert.throws(
      () => run(comparisonArgs(paths)),
      /support response|canonical UTC/,
    );
  }
});

test('derives locale-independent service digests from raw projections', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const candidate = fixture();
  candidate.before.services[1].serviceId = 'd95zq3';
  candidate.after.services[1].serviceId = 'd95zq3';
  candidate.before.services[2].serviceId = 'd95tq3';
  candidate.after.services[2].serviceId = 'd95tq3';
  const paths = writeFixture(root, candidate);
  const executeWithLocale = (locale) => JSON.parse(execFileSync(
    process.execPath,
    [
      SCRIPT,
      '--before', paths.before,
      '--after', paths.after,
      '--support', paths.support,
      '--source-policy', paths.sourcePolicy,
      '--backend-repo', paths.backendRepo,
    ],
    {
      encoding: 'utf8',
      env: { ...process.env, LANG: locale, LC_ALL: locale },
    },
  ));
  const resultA = executeWithLocale('en_US.UTF-8');
  const resultB = executeWithLocale('et_EE.UTF-8');

  assert.equal(
    resultA.linkedServiceIdsSha256,
    resultB.linkedServiceIdsSha256,
  );
  assert.equal(
    resultA.linkedServiceConfigurationSha256,
    resultB.linkedServiceConfigurationSha256,
  );
  assert.equal(resultA.boundedReplacementConsistent, true);
  assert.equal(resultB.boundedReplacementConsistent, true);
});

test('does not trust a PATH-shadowed git executable for source proof', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const paths = writeFixture(root);
  const fakeBin = path.join(root, 'fake-bin');
  fs.mkdirSync(fakeBin);
  const fakeGit = path.join(fakeBin, 'git');
  fs.writeFileSync(fakeGit, '#!/bin/sh\nexit 99\n');
  fs.chmodSync(fakeGit, 0o755);
  const output = execFileSync(
    process.execPath,
    [SCRIPT, ...comparisonArgs(paths)],
    {
      encoding: 'utf8',
      env: { ...process.env, PATH: fakeBin },
    },
  );
  assert.equal(JSON.parse(output).boundedReplacementConsistent, true);
});

test('CLI exits 0 for continuity, 2 for drift, and rejects unknown options', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const paths = writeFixture(root);
  const output = execFileSync(
    process.execPath,
    [SCRIPT, ...comparisonArgs(paths)],
    { encoding: 'utf8' },
  );
  assert.equal(JSON.parse(output).boundedReplacementConsistent, true);

  const drift = fixture();
  drift.after.services[0].plan = 'pro';
  const driftRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const driftPaths = writeFixture(driftRoot, drift);
  const driftRun = spawnSync(process.execPath, [
    SCRIPT,
    ...comparisonArgs(driftPaths),
  ], { encoding: 'utf8' });
  assert.equal(driftRun.status, 2);
  assert.equal(JSON.parse(driftRun.stdout).boundedReplacementConsistent, false);

  const invalid = spawnSync(process.execPath, [SCRIPT, '--unknown', 'x'], {
    encoding: 'utf8',
  });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /unknown option/);
});
