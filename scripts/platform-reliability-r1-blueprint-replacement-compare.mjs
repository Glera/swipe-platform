#!/usr/bin/env node

import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OBSERVATION_SCHEMA =
  'platform-reliability-r1-blueprint-replacement-observation.v3';
const COMPARISON_SCHEMA =
  'platform-reliability-r1-blueprint-replacement-comparison.v4';
const SOURCE_POLICY_SCHEMA =
  'platform-reliability-r1-gate-c0-source-freeze-policy.v2';
const SUPPORT_SCHEMA = 'platform-reliability-r1-render-support-response.v2';
const INCIDENT_OBSERVED_AT = '2026-08-02T19:10:00Z';
const MAXIMUM_REPLACEMENT_WINDOW_SECONDS = 15 * 60;
const PROVIDER_CONTINUITY_AUTHORITY =
  'provider_confirmed_existing_service_environment_and_schedule_continuity';
const SHA256_RE = /^[a-f0-9]{64}$/;
const GIT_SHA_RE = /^[a-f0-9]{40}$/;
const SAFE_ID_RE = /^[a-z0-9][a-z0-9._:-]{0,127}$/;
const ENVIRONMENT_KEY_RE = /^[A-Z][A-Z0-9_]{0,127}$/;
const SAFE_GIT_PATH_RE = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))[A-Za-z0-9._/-]{1,256}$/;
const MAX_GIT_OBJECT_BYTES = 5 * 1024 * 1024;
const GIT_EXECUTABLE = '/usr/bin/git';

function fail(message) {
  throw new Error(message);
}

function plainObject(value, label) {
  if (
    value === null
    || typeof value !== 'object'
    || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype
  ) {
    fail(`${label} must be a plain object`);
  }
  return value;
}

function exactKeys(value, expected, label) {
  plainObject(value, label);
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  if (
    actual.length !== wanted.length
    || actual.some((key, index) => key !== wanted[index])
  ) {
    fail(`${label} does not match the strict schema`);
  }
}

function enumValue(value, allowed, label) {
  if (!allowed.includes(value)) {
    fail(`${label} must be one of ${allowed.join('|')}`);
  }
  return value;
}

function safeString(value, label, maximum = 256) {
  if (
    typeof value !== 'string'
    || value.length < 1
    || value.length > maximum
    || /[\u0000-\u001f]/.test(value)
  ) {
    fail(`${label} must be a bounded nonempty string`);
  }
  return value;
}

function safeId(value, label) {
  if (typeof value !== 'string' || !SAFE_ID_RE.test(value)) {
    fail(`${label} must be a bounded provider identifier`);
  }
  return value;
}

function sha256Value(value, label) {
  if (typeof value !== 'string' || !SHA256_RE.test(value)) {
    fail(`${label} must be a lowercase SHA-256`);
  }
  return value;
}

function gitShaValue(value, label) {
  if (typeof value !== 'string' || !GIT_SHA_RE.test(value)) {
    fail(`${label} must be a full lowercase git SHA`);
  }
  return value;
}

function booleanValue(value, label) {
  if (typeof value !== 'boolean') fail(`${label} must be a boolean`);
  return value;
}

function integerValue(value, label, minimum, maximum) {
  if (
    !Number.isSafeInteger(value)
    || value < minimum
    || value > maximum
  ) {
    fail(`${label} must be an integer between ${minimum} and ${maximum}`);
  }
  return value;
}

function codePointCompare(left, right) {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort(codePointCompare)
        .map((key) => [key, stableValue(value[key])]),
    );
  }
  return value;
}

function nullableUtc(value, label) {
  if (value === null) return value;
  return utcValue(value, label);
}

function nullableString(value, label) {
  if (value === null) return value;
  return safeString(value, label);
}

function utcValue(value, label) {
  safeString(value, label, 64);
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value)) {
    fail(`${label} must be canonical UTC`);
  }
  const timestamp = Date.parse(value);
  const fraction = value.match(/\.(\d{1,3})Z$/)?.[1] ?? null;
  const normalized = fraction === null
    ? value.replace(/Z$/, '.000Z')
    : value.replace(/\.\d{1,3}Z$/, `.${fraction.padEnd(3, '0')}Z`);
  if (
    !Number.isFinite(timestamp)
    || new Date(timestamp).toISOString() !== normalized
  ) {
    fail(`${label} must be a real canonical UTC instant`);
  }
  return value;
}

function utcDateValue(value, label) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    fail(`${label} must be a canonical UTC date`);
  }
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(timestamp)
    || new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    fail(`${label} must be a real UTC date`);
  }
  return value;
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function gitPathValue(value, label) {
  if (typeof value !== 'string' || !SAFE_GIT_PATH_RE.test(value)) {
    fail(`${label} must be a bounded repository-relative path`);
  }
  return value;
}

function parseSourcePolicy(bytes) {
  if (!Buffer.isBuffer(bytes)) fail('source policy bytes must be a Buffer');
  const input = parseJsonBytes(bytes, 'source policy');
  const value = input.value;
  exactKeys(value, [
    'schema',
    'status',
    'backendRepository',
    'backendPullRequest',
    'blueprintSourceBranch',
    'blueprintPath',
    'liveBlueprintSourceSha',
    'liveRenderSha256',
    'freezeManifestPath',
    'freezeManifestSha256',
    'sentinelDockerfilePath',
    'sentinelDockerfileSha256',
    'forbiddenRuntimePath',
    'preFreezeMasterSha',
    'preFreezeMasterTree',
    'freezeCandidateHead',
    'freezeCandidateTree',
    'mergeMethod',
    'expectedMergeFirstParent',
    'expectedMergeSecondParent',
    'expectedMergeTree',
    'requiredPostRevertTree',
    'maximumFreezeSeconds',
    'revertBeforeGateC',
    'expectedReplacementDeployOutcome',
    'successfulOrLiveDeployForbidden',
    'unexpectedSyncForbidden',
    'operatorAuthorityRequired',
    'secretsCaptured',
  ], 'source policy');
  if (value.schema !== SOURCE_POLICY_SCHEMA) {
    fail(`source policy schema must be ${SOURCE_POLICY_SCHEMA}`);
  }
  if (value.status !== 'reviewed_candidate_not_authorized') {
    fail('source policy status must remain reviewed_candidate_not_authorized');
  }
  if (value.backendRepository !== 'Glera/swipe-backend') {
    fail('source policy backendRepository is not authorized');
  }
  integerValue(value.backendPullRequest, 'source policy backendPullRequest', 1, 1_000_000);
  if (value.blueprintSourceBranch !== 'master') {
    fail('source policy blueprintSourceBranch must be master');
  }
  if (value.mergeMethod !== 'merge_commit') {
    fail('source policy mergeMethod must be merge_commit');
  }
  if (
    value.expectedMergeFirstParent !== value.preFreezeMasterSha
    || value.expectedMergeSecondParent !== value.freezeCandidateHead
    || value.expectedMergeTree !== value.freezeCandidateTree
    || value.requiredPostRevertTree !== value.preFreezeMasterTree
  ) {
    fail('source policy merge identity is internally inconsistent');
  }
  if (
    value.revertBeforeGateC !== true
    || value.expectedReplacementDeployOutcome
      !== 'sentinel_exit_78_before_app_or_database_access'
    || value.successfulOrLiveDeployForbidden !== true
    || value.unexpectedSyncForbidden !== true
    || value.operatorAuthorityRequired !== true
    || value.secretsCaptured !== false
  ) {
    fail('source policy weakens the reviewed fail-closed boundary');
  }
  integerValue(
    value.maximumFreezeSeconds,
    'source policy maximumFreezeSeconds',
    1,
    3600,
  );
  return {
    ...value,
    blueprintPath: gitPathValue(value.blueprintPath, 'source policy blueprintPath'),
    freezeManifestPath: gitPathValue(
      value.freezeManifestPath,
      'source policy freezeManifestPath',
    ),
    sentinelDockerfilePath: gitPathValue(
      value.sentinelDockerfilePath,
      'source policy sentinelDockerfilePath',
    ),
    forbiddenRuntimePath: gitPathValue(
      value.forbiddenRuntimePath,
      'source policy forbiddenRuntimePath',
    ),
    liveBlueprintSourceSha: gitShaValue(
      value.liveBlueprintSourceSha,
      'source policy liveBlueprintSourceSha',
    ),
    liveRenderSha256: sha256Value(
      value.liveRenderSha256,
      'source policy liveRenderSha256',
    ),
    freezeManifestSha256: sha256Value(
      value.freezeManifestSha256,
      'source policy freezeManifestSha256',
    ),
    sentinelDockerfileSha256: sha256Value(
      value.sentinelDockerfileSha256,
      'source policy sentinelDockerfileSha256',
    ),
    preFreezeMasterSha: gitShaValue(
      value.preFreezeMasterSha,
      'source policy preFreezeMasterSha',
    ),
    preFreezeMasterTree: gitShaValue(
      value.preFreezeMasterTree,
      'source policy preFreezeMasterTree',
    ),
    freezeCandidateHead: gitShaValue(
      value.freezeCandidateHead,
      'source policy freezeCandidateHead',
    ),
    freezeCandidateTree: gitShaValue(
      value.freezeCandidateTree,
      'source policy freezeCandidateTree',
    ),
    expectedMergeFirstParent: gitShaValue(
      value.expectedMergeFirstParent,
      'source policy expectedMergeFirstParent',
    ),
    expectedMergeSecondParent: gitShaValue(
      value.expectedMergeSecondParent,
      'source policy expectedMergeSecondParent',
    ),
    expectedMergeTree: gitShaValue(
      value.expectedMergeTree,
      'source policy expectedMergeTree',
    ),
    requiredPostRevertTree: gitShaValue(
      value.requiredPostRevertTree,
      'source policy requiredPostRevertTree',
    ),
    policySha256: sha256(bytes),
  };
}

function gitEnvironment() {
  const environment = { ...process.env };
  delete environment.GIT_DIR;
  delete environment.GIT_WORK_TREE;
  delete environment.GIT_INDEX_FILE;
  delete environment.GIT_OBJECT_DIRECTORY;
  delete environment.GIT_ALTERNATE_OBJECT_DIRECTORIES;
  environment.GIT_CONFIG_GLOBAL = '/dev/null';
  environment.GIT_CONFIG_SYSTEM = '/dev/null';
  environment.GIT_NO_REPLACE_OBJECTS = '1';
  environment.GIT_OPTIONAL_LOCKS = '0';
  return environment;
}

function gitObject(repository, args, label) {
  try {
    return execFileSync(GIT_EXECUTABLE, ['-C', repository, ...args], {
      encoding: null,
      env: gitEnvironment(),
      maxBuffer: MAX_GIT_OBJECT_BYTES,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    fail(`could not read ${label} from the exact backend Git objects`);
  }
}

function gitObjectExists(repository, objectExpression) {
  const result = spawnSync(
    GIT_EXECUTABLE,
    ['-C', repository, 'cat-file', '-e', objectExpression],
    {
      encoding: null,
      env: gitEnvironment(),
      maxBuffer: MAX_GIT_OBJECT_BYTES,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
  if (result.error) fail('could not execute git for object existence proof');
  if (result.status === 0) return true;
  if (result.status === 1 || result.status === 128) return false;
  fail('git returned an unexpected status for object existence proof');
}

function parseCommit(repository, sha, label) {
  const raw = gitObject(repository, ['cat-file', '-p', `${sha}^{commit}`], label);
  const header = raw.toString('utf8').split('\n\n', 1)[0].split('\n');
  const tree = header.find((line) => line.startsWith('tree '))?.slice(5);
  const parents = header
    .filter((line) => line.startsWith('parent '))
    .map((line) => line.slice(7));
  return {
    tree: gitShaValue(tree, `${label} tree`),
    parents: parents.map((parent, index) => (
      gitShaValue(parent, `${label} parent ${index}`)
    )),
  };
}

function normalizedRepositoryFromRemote(remote) {
  const trimmed = remote.trim().replace(/\.git$/, '');
  const match = trimmed.match(
    /^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([^/]+\/[^/]+)$/,
  );
  return match?.[1] ?? null;
}

function verifySourceTransition({ before, after, policy, backendRepo }) {
  if (typeof backendRepo !== 'string' || !backendRepo.trim()) {
    fail('backendRepo is required for exact Git-object source proof');
  }
  let repository;
  try {
    repository = fs.realpathSync(path.resolve(backendRepo));
  } catch {
    fail('backendRepo does not resolve to a readable path');
  }
  const remote = gitObject(
    repository,
    ['remote', 'get-url', 'origin'],
    'backend origin URL',
  ).toString('utf8');
  if (normalizedRepositoryFromRemote(remote) !== policy.backendRepository) {
    fail('backend Git origin does not match the reviewed source policy');
  }

  const beforeCommit = parseCommit(
    repository,
    before.blueprint.sourceSha,
    'before Blueprint source commit',
  );
  const preFreezeCommit = parseCommit(
    repository,
    policy.preFreezeMasterSha,
    'pre-freeze master commit',
  );
  const candidateCommit = parseCommit(
    repository,
    policy.freezeCandidateHead,
    'freeze candidate commit',
  );
  const afterCommit = parseCommit(
    repository,
    after.blueprint.sourceSha,
    'after Blueprint source commit',
  );
  if (before.blueprint.sourceSha !== policy.liveBlueprintSourceSha) {
    fail('before Blueprint source SHA is not the reviewed live source');
  }
  if (preFreezeCommit.tree !== policy.preFreezeMasterTree) {
    fail('pre-freeze master tree does not match the reviewed source policy');
  }
  if (candidateCommit.tree !== policy.freezeCandidateTree) {
    fail('freeze candidate tree does not match the reviewed source policy');
  }
  if (
    afterCommit.tree !== policy.expectedMergeTree
    || afterCommit.parents.length !== 2
    || afterCommit.parents[0] !== policy.expectedMergeFirstParent
    || afterCommit.parents[1] !== policy.expectedMergeSecondParent
  ) {
    fail('after Blueprint source is not the exact reviewed freeze merge');
  }

  const beforeRender = gitObject(
    repository,
    ['cat-file', 'blob', `${before.blueprint.sourceSha}:${policy.blueprintPath}`],
    'before render.yaml blob',
  );
  const afterRender = gitObject(
    repository,
    ['cat-file', 'blob', `${after.blueprint.sourceSha}:${policy.blueprintPath}`],
    'after render.yaml blob',
  );
  const manifest = gitObject(
    repository,
    ['cat-file', 'blob', `${after.blueprint.sourceSha}:${policy.freezeManifestPath}`],
    'freeze manifest blob',
  );
  const sentinel = gitObject(
    repository,
    ['cat-file', 'blob', `${after.blueprint.sourceSha}:${policy.sentinelDockerfilePath}`],
    'freeze sentinel blob',
  );
  const beforeRenderSha256 = sha256(beforeRender);
  const afterRenderSha256 = sha256(afterRender);
  const freezeManifestSha256 = sha256(manifest);
  const sentinelDockerfileSha256 = sha256(sentinel);
  if (
    beforeRenderSha256 !== policy.liveRenderSha256
    || afterRenderSha256 !== policy.liveRenderSha256
    || !beforeRender.equals(afterRender)
  ) {
    fail('render.yaml is not byte-identical across the reviewed source transition');
  }
  if (freezeManifestSha256 !== policy.freezeManifestSha256) {
    fail('freeze manifest blob does not match the reviewed source policy');
  }
  if (sentinelDockerfileSha256 !== policy.sentinelDockerfileSha256) {
    fail('freeze sentinel blob does not match the reviewed source policy');
  }
  if (
    gitObjectExists(
      repository,
      `${after.blueprint.sourceSha}:${policy.forbiddenRuntimePath}`,
    )
  ) {
    fail('forbidden runtime migration path is present in the freeze merge');
  }
  return {
    authority: 'exact_git_objects_bound_by_reviewed_freeze_policy',
    repository: policy.backendRepository,
    branch: policy.blueprintSourceBranch,
    blueprintPath: policy.blueprintPath,
    beforeSourceSha: before.blueprint.sourceSha,
    beforeSourceTree: beforeCommit.tree,
    afterSourceSha: after.blueprint.sourceSha,
    afterSourceTree: afterCommit.tree,
    afterSourceParents: afterCommit.parents,
    beforeRenderSha256,
    afterRenderSha256,
    renderBytesEqual: true,
    freezeManifestSha256,
    sentinelDockerfileSha256,
    forbiddenRuntimePathAbsent: true,
    sourcePolicySha256: policy.policySha256,
  };
}

function parseJsonBytes(bytes, label) {
  let value;
  try {
    value = JSON.parse(bytes.toString('utf8'));
  } catch {
    fail(`${label} is not valid JSON`);
  }
  return { bytes, value };
}

function parseService(value, label) {
  exactKeys(value, [
    'serviceId',
    'kind',
    'status',
    'plan',
    'schedule',
    'executionState',
    'runtime',
    'dockerfilePath',
    'dockerCommand',
    'environmentKeyNames',
    'databaseBinding',
  ], label);
  const kind = enumValue(value.kind, ['web', 'cron'], `${label}.kind`);
  const status = enumValue(
    value.status,
    ['available', 'live'],
    `${label}.status`,
  );
  const executionState = enumValue(
    value.executionState,
    ['running', 'suspended'],
    `${label}.executionState`,
  );
  if (
    (kind === 'web' && (status !== 'live' || executionState !== 'running'))
    || (kind === 'cron' && executionState !== 'suspended')
  ) {
    fail(`${label} does not prove web-live / cron-suspended quiescence`);
  }
  if (!Array.isArray(value.environmentKeyNames) || value.environmentKeyNames.length < 1) {
    fail(`${label}.environmentKeyNames must be a nonempty array`);
  }
  const environmentKeyNames = value.environmentKeyNames.map((key, index) => {
    if (typeof key !== 'string' || !ENVIRONMENT_KEY_RE.test(key)) {
      fail(`${label}.environmentKeyNames[${index}] is invalid`);
    }
    return key;
  }).sort(codePointCompare);
  if (new Set(environmentKeyNames).size !== environmentKeyNames.length) {
    fail(`${label}.environmentKeyNames contains a duplicate`);
  }
  if (!environmentKeyNames.includes('DATABASE_URL')) {
    fail(`${label}.environmentKeyNames must include the database binding key`);
  }
  exactKeys(value.databaseBinding, [
    'environmentKey',
    'sourceDatabaseServiceId',
    'sourceProperty',
  ], `${label}.databaseBinding`);
  const databaseBinding = {
    environmentKey: enumValue(
      value.databaseBinding.environmentKey,
      ['DATABASE_URL'],
      `${label}.databaseBinding.environmentKey`,
    ),
    sourceDatabaseServiceId: safeId(
      value.databaseBinding.sourceDatabaseServiceId,
      `${label}.databaseBinding.sourceDatabaseServiceId`,
    ),
    sourceProperty: enumValue(
      value.databaseBinding.sourceProperty,
      ['connectionString'],
      `${label}.databaseBinding.sourceProperty`,
    ),
  };
  const schedule = nullableString(value.schedule, `${label}.schedule`);
  const dockerCommand = nullableString(
    value.dockerCommand,
    `${label}.dockerCommand`,
  );
  if ((kind === 'web' && schedule !== null) || (kind === 'cron' && schedule === null)) {
    fail(`${label}.schedule does not match the service kind`);
  }
  if (kind === 'cron' && dockerCommand === null) {
    fail(`${label}.dockerCommand must be present for a cron service`);
  }
  return {
    serviceId: safeId(value.serviceId, `${label}.serviceId`),
    kind,
    status,
    plan: safeString(value.plan, `${label}.plan`),
    schedule,
    executionState,
    runtime: enumValue(value.runtime, ['docker'], `${label}.runtime`),
    dockerfilePath: enumValue(
      value.dockerfilePath,
      ['./Dockerfile.bake'],
      `${label}.dockerfilePath`,
    ),
    dockerCommand,
    environmentKeyNames,
    databaseBinding,
  };
}

function parseObservation(value, expectedPhase, label) {
  exactKeys(value, [
    'schema',
    'phase',
    'observedAt',
    'blueprint',
    'sourceDatabase',
    'services',
    'safetyWindow',
    'oldBlueprintAbsence',
    'hookValueObserved',
    'secretsCaptured',
  ], label);
  if (value.schema !== OBSERVATION_SCHEMA) fail(`${label}.schema is unsupported`);
  if (value.phase !== expectedPhase) fail(`${label}.phase must be ${expectedPhase}`);
  const observedAt = utcValue(value.observedAt, `${label}.observedAt`);
  exactKeys(value.blueprint, [
    'id',
    'sourceRepository',
    'sourceBranch',
    'blueprintPath',
    'sourceSha',
    'autoSyncState',
    'lastSyncAt',
  ], `${label}.blueprint`);
  const blueprint = {
    id: safeId(value.blueprint.id, `${label}.blueprint.id`),
    sourceRepository: enumValue(
      value.blueprint.sourceRepository,
      ['Glera/swipe-backend'],
      `${label}.blueprint.sourceRepository`,
    ),
    sourceBranch: enumValue(
      value.blueprint.sourceBranch,
      ['master'],
      `${label}.blueprint.sourceBranch`,
    ),
    blueprintPath: enumValue(
      value.blueprint.blueprintPath,
      ['render.yaml'],
      `${label}.blueprint.blueprintPath`,
    ),
    sourceSha: gitShaValue(
      value.blueprint.sourceSha,
      `${label}.blueprint.sourceSha`,
    ),
    autoSyncState: enumValue(
      value.blueprint.autoSyncState,
      ['disabled'],
      `${label}.blueprint.autoSyncState`,
    ),
    lastSyncAt: nullableUtc(
      value.blueprint.lastSyncAt,
      `${label}.blueprint.lastSyncAt`,
    ),
  };
  exactKeys(value.sourceDatabase, [
    'serviceId',
    'status',
    'plan',
    'logicalDatabaseName',
    'postgresMajorVersion',
    'allocatedStorageGiB',
    'storageAutoscalingEnabled',
  ], `${label}.sourceDatabase`);
  const sourceDatabase = {
    serviceId: safeId(
      value.sourceDatabase.serviceId,
      `${label}.sourceDatabase.serviceId`,
    ),
    status: enumValue(
      value.sourceDatabase.status,
      ['available'],
      `${label}.sourceDatabase.status`,
    ),
    plan: safeString(value.sourceDatabase.plan, `${label}.sourceDatabase.plan`),
    logicalDatabaseName: safeString(
      value.sourceDatabase.logicalDatabaseName,
      `${label}.sourceDatabase.logicalDatabaseName`,
    ),
    postgresMajorVersion: integerValue(
      value.sourceDatabase.postgresMajorVersion,
      `${label}.sourceDatabase.postgresMajorVersion`,
      12,
      99,
    ),
    allocatedStorageGiB: integerValue(
      value.sourceDatabase.allocatedStorageGiB,
      `${label}.sourceDatabase.allocatedStorageGiB`,
      1,
      65536,
    ),
    storageAutoscalingEnabled: booleanValue(
      value.sourceDatabase.storageAutoscalingEnabled,
      `${label}.sourceDatabase.storageAutoscalingEnabled`,
    ),
  };
  if (!Array.isArray(value.services) || value.services.length < 1) {
    fail(`${label}.services must be a nonempty array`);
  }
  const services = value.services.map((service, index) => (
    parseService(service, `${label}.services[${index}]`)
  )).sort((left, right) => codePointCompare(left.serviceId, right.serviceId));
  const serviceIds = new Set(services.map((service) => service.serviceId));
  if (serviceIds.size !== services.length) {
    fail(`${label}.services contains a duplicate serviceId`);
  }
  if (
    services.some(
      (service) => service.databaseBinding.sourceDatabaseServiceId
        !== sourceDatabase.serviceId,
    )
  ) {
    fail(`${label}.services contains a foreign database binding`);
  }
  exactKeys(value.safetyWindow, [
    'startedAt',
    'deadlineAt',
    'maximumDurationSeconds',
    'cronExecutionState',
    'webRestartObserved',
    'unexpectedSyncObserved',
    'providerFromDatabaseContinuity',
  ], `${label}.safetyWindow`);
  const safetyWindow = {
    startedAt: utcValue(
      value.safetyWindow.startedAt,
      `${label}.safetyWindow.startedAt`,
    ),
    deadlineAt: utcValue(
      value.safetyWindow.deadlineAt,
      `${label}.safetyWindow.deadlineAt`,
    ),
    maximumDurationSeconds: integerValue(
      value.safetyWindow.maximumDurationSeconds,
      `${label}.safetyWindow.maximumDurationSeconds`,
      MAXIMUM_REPLACEMENT_WINDOW_SECONDS,
      MAXIMUM_REPLACEMENT_WINDOW_SECONDS,
    ),
    cronExecutionState: enumValue(
      value.safetyWindow.cronExecutionState,
      ['suspended'],
      `${label}.safetyWindow.cronExecutionState`,
    ),
    webRestartObserved: booleanValue(
      value.safetyWindow.webRestartObserved,
      `${label}.safetyWindow.webRestartObserved`,
    ),
    unexpectedSyncObserved: booleanValue(
      value.safetyWindow.unexpectedSyncObserved,
      `${label}.safetyWindow.unexpectedSyncObserved`,
    ),
    providerFromDatabaseContinuity: enumValue(
      value.safetyWindow.providerFromDatabaseContinuity,
      [PROVIDER_CONTINUITY_AUTHORITY],
      `${label}.safetyWindow.providerFromDatabaseContinuity`,
    ),
  };
  if (safetyWindow.webRestartObserved) {
    fail(`${label}.safetyWindow.webRestartObserved must be false`);
  }
  if (safetyWindow.unexpectedSyncObserved) {
    fail(`${label}.safetyWindow.unexpectedSyncObserved must be false`);
  }
  const startedAtMs = Date.parse(safetyWindow.startedAt);
  const deadlineAtMs = Date.parse(safetyWindow.deadlineAt);
  if (
    deadlineAtMs <= startedAtMs
    || deadlineAtMs - startedAtMs
      > MAXIMUM_REPLACEMENT_WINDOW_SECONDS * 1000
    || Date.parse(observedAt) < startedAtMs
    || Date.parse(observedAt) > deadlineAtMs
  ) {
    fail(`${label}.safetyWindow does not bound this observation`);
  }
  let oldBlueprintAbsence = null;
  if (expectedPhase === 'before') {
    if (value.oldBlueprintAbsence !== null) {
      fail(`${label}.oldBlueprintAbsence must be null before replacement`);
    }
  } else {
    exactKeys(value.oldBlueprintAbsence, [
      'blueprintId',
      'observedAt',
      'terminalOutcome',
      'observationSurface',
    ], `${label}.oldBlueprintAbsence`);
    oldBlueprintAbsence = {
      blueprintId: safeId(
        value.oldBlueprintAbsence.blueprintId,
        `${label}.oldBlueprintAbsence.blueprintId`,
      ),
      observedAt: utcValue(
        value.oldBlueprintAbsence.observedAt,
        `${label}.oldBlueprintAbsence.observedAt`,
      ),
      terminalOutcome: enumValue(
        value.oldBlueprintAbsence.terminalOutcome,
        ['not_found'],
        `${label}.oldBlueprintAbsence.terminalOutcome`,
      ),
      observationSurface: enumValue(
        value.oldBlueprintAbsence.observationSurface,
        ['authenticated_render_dashboard_blueprint_lookup'],
        `${label}.oldBlueprintAbsence.observationSurface`,
      ),
    };
  }
  if (booleanValue(value.hookValueObserved, `${label}.hookValueObserved`)) {
    fail(`${label}.hookValueObserved must be false`);
  }
  if (booleanValue(value.secretsCaptured, `${label}.secretsCaptured`)) {
    fail(`${label}.secretsCaptured must be false`);
  }
  return {
    observedAt,
    blueprint,
    sourceDatabase,
    services,
    safetyWindow,
    oldBlueprintAbsence,
  };
}

function parseSupport(value) {
  exactKeys(value, [
    'schema',
    'observedAt',
    'channel',
    'affectedBlueprintId',
    'affectedBlueprintIdentitySha256',
    'remediationResponse',
    'continuityResponse',
    'evidenceLimits',
    'nextAuthorizedBoundary',
    'secretValueSubmitted',
    'secretValueCaptured',
  ], 'support response');
  if (value.schema !== SUPPORT_SCHEMA) fail('support response schema is unsupported');
  const observedAt = utcValue(value.observedAt, 'support response observedAt');
  enumValue(
    value.channel,
    ['authenticated_render_dashboard_support_conversation'],
    'support response channel',
  );
  exactKeys(value.remediationResponse, [
    'responseActorKind',
    'responseDate',
    'responseTimestampPrecision',
    'providerStatements',
  ], 'support response remediationResponse');
  enumValue(
    value.remediationResponse.responseActorKind,
    ['human_render_support_agent'],
    'support response remediationResponse responseActorKind',
  );
  const remediationResponseDate = utcDateValue(
    value.remediationResponse.responseDate,
    'support response remediationResponse responseDate',
  );
  enumValue(
    value.remediationResponse.responseTimestampPrecision,
    ['date_only'],
    'support response remediationResponse responseTimestampPrecision',
  );
  exactKeys(value.remediationResponse.providerStatements, [
    'supportedRemediation',
    'oldHookInvalidatedByRemediation',
    'newBlueprintReceivesNewHook',
    'existingServicesDeletedWithBlueprint',
    'existingServicesExpectedToRelinkByDetection',
    'lastObservedSyncAt',
    'hookCanInitiateBlueprintSync',
    'hookAloneCanChangeConnectedRepository',
    'providerIncidentAssessment',
  ], 'support response remediationResponse providerStatements');
  const statements = value.remediationResponse.providerStatements;
  exactKeys(value.continuityResponse, [
    'responseActorKind',
    'responseDate',
    'responseTimestampPrecision',
    'providerStatements',
  ], 'support response continuityResponse');
  enumValue(
    value.continuityResponse.responseActorKind,
    ['human_render_support_agent'],
    'support response continuityResponse responseActorKind',
  );
  const continuityResponseDate = utcDateValue(
    value.continuityResponse.responseDate,
    'support response continuityResponse responseDate',
  );
  enumValue(
    value.continuityResponse.responseTimestampPrecision,
    ['date_only'],
    'support response continuityResponse responseTimestampPrecision',
  );
  exactKeys(value.continuityResponse.providerStatements, [
    'fromDatabaseMaterializesServiceEnvironmentVariables',
    'cronSchedulesStoredOnCronServices',
    'blueprintReplacementChangesExistingServices',
  ], 'support response continuityResponse providerStatements');
  const continuity = value.continuityResponse.providerStatements;
  if (
    continuityResponseDate < remediationResponseDate
    || continuityResponseDate > observedAt.slice(0, 10)
  ) {
    fail('support response chronology is invalid');
  }
  exactKeys(value.evidenceLimits, [
    'providerHasNotExecutedRemediation',
    'oldHookTerminallyInvalidated',
    'providerHasNotObservedReplacementExecution',
    'providerSideActorAuditProvided',
    'lastSyncTimestampImpliesNoPostExposureSync',
  ], 'support response evidenceLimits');
  const limits = value.evidenceLimits;
  if (
    statements.supportedRemediation
      !== 'delete_existing_blueprint_then_create_new_blueprint'
    || statements.oldHookInvalidatedByRemediation !== true
    || statements.newBlueprintReceivesNewHook !== true
    || statements.existingServicesDeletedWithBlueprint !== false
    || statements.existingServicesExpectedToRelinkByDetection !== true
    || statements.hookCanInitiateBlueprintSync !== true
    || statements.hookAloneCanChangeConnectedRepository !== false
    || statements.providerIncidentAssessment !== 'fairly_minor'
    || continuity.fromDatabaseMaterializesServiceEnvironmentVariables !== true
    || continuity.cronSchedulesStoredOnCronServices !== true
    || continuity.blueprintReplacementChangesExistingServices !== false
    || limits.providerHasNotExecutedRemediation !== true
    || limits.oldHookTerminallyInvalidated !== false
    || limits.providerHasNotObservedReplacementExecution !== true
    || limits.providerSideActorAuditProvided !== false
    || limits.lastSyncTimestampImpliesNoPostExposureSync !== true
    || value.nextAuthorizedBoundary
      !== 'operator_go_required_before_blueprint_delete_recreate'
    || value.secretValueSubmitted !== false
    || value.secretValueCaptured !== false
  ) {
    fail('support response does not authorize the bounded replacement path');
  }
  return {
    blueprintId: safeId(value.affectedBlueprintId, 'support response blueprintId'),
    blueprintIdentitySha256: (() => {
      const candidate = safeString(
        value.affectedBlueprintIdentitySha256,
        'support response blueprintIdentitySha256',
      );
      if (!/^sha256:[a-f0-9]{64}$/.test(candidate)) {
        fail('support response blueprintIdentitySha256 is invalid');
      }
      return candidate;
    })(),
    lastSyncAt: utcValue(statements.lastObservedSyncAt, 'support response lastSyncAt'),
    providerFromDatabaseContinuity: PROVIDER_CONTINUITY_AUTHORITY,
  };
}

function canonical(value) {
  return JSON.stringify(stableValue(value));
}

export function compareBlueprintReplacement({
  before,
  after,
  support,
  sourceTransition,
  beforeSha256,
  afterSha256,
  supportSha256,
}) {
  const differences = [];
  const difference = (field) => differences.push(field);
  if (before.blueprint.id !== support.blueprintId) difference('oldBlueprintId');
  if (
    sha256(Buffer.from(before.blueprint.id))
      !== support.blueprintIdentitySha256.replace(/^sha256:/, '')
  ) difference('oldBlueprintIdentitySha256');
  if (before.blueprint.id === after.blueprint.id) difference('newBlueprintId');
  if (
    before.blueprint.sourceRepository !== sourceTransition.repository
    || after.blueprint.sourceRepository !== sourceTransition.repository
  ) {
    difference('sourceRepository');
  }
  if (
    before.blueprint.sourceBranch !== sourceTransition.branch
    || after.blueprint.sourceBranch !== sourceTransition.branch
  ) {
    difference('sourceBranch');
  }
  if (
    before.blueprint.blueprintPath !== sourceTransition.blueprintPath
    || after.blueprint.blueprintPath !== sourceTransition.blueprintPath
  ) {
    difference('blueprintPath');
  }
  if (
    before.blueprint.lastSyncAt !== support.lastSyncAt
    || Date.parse(support.lastSyncAt) >= Date.parse(INCIDENT_OBSERVED_AT)
  ) difference('lastSyncAt');
  if (Date.parse(after.observedAt) <= Date.parse(before.observedAt)) {
    difference('observationOrder');
  }
  if (
    after.oldBlueprintAbsence.blueprintId !== before.blueprint.id
    || Date.parse(after.oldBlueprintAbsence.observedAt)
      < Date.parse(after.observedAt)
  ) difference('oldBlueprintAbsence');
  if (canonical(before.sourceDatabase) !== canonical(after.sourceDatabase)) {
    difference('sourceDatabase');
  }
  if (canonical(before.services) !== canonical(after.services)) {
    difference('services');
  }
  if (canonical(before.safetyWindow) !== canonical(after.safetyWindow)) {
    difference('safetyWindow');
  }
  if (
    before.safetyWindow.providerFromDatabaseContinuity
      !== support.providerFromDatabaseContinuity
    || after.safetyWindow.providerFromDatabaseContinuity
      !== support.providerFromDatabaseContinuity
  ) {
    difference('providerFromDatabaseContinuityAuthority');
  }
  const linkedServiceIdsSha256 = sha256(Buffer.from(
    before.services.map((service) => service.serviceId).join('\n'),
  ));
  const linkedServiceConfigurationSha256 = sha256(Buffer.from(
    canonical(before.services),
  ));
  const sourceDatabaseConfigurationSha256 = sha256(Buffer.from(
    canonical(before.sourceDatabase),
  ));
  const boundedReplacementConsistent = differences.length === 0;
  return {
    schema: COMPARISON_SCHEMA,
    evidenceClass: 'operator_attested',
    providerVerifiedServiceContinuity: false,
    providerConfirmedFromDatabaseContinuity:
      !differences.includes('providerFromDatabaseContinuityAuthority'),
    beforeObservedAt: before.observedAt,
    afterObservedAt: after.observedAt,
    oldBlueprintId: before.blueprint.id,
    newBlueprintId: after.blueprint.id,
    beforeSourceSha: sourceTransition.beforeSourceSha,
    afterSourceSha: sourceTransition.afterSourceSha,
    sourceTransition,
    linkedServiceIdsSha256,
    linkedServiceConfigurationSha256,
    sourceDatabaseConfigurationSha256,
    oldBlueprintAbsent: !differences.includes('oldBlueprintAbsence'),
    sourceDatabaseUnchanged: !differences.includes('sourceDatabase'),
    executionQuiescenceObserved: !differences.includes('safetyWindow'),
    maximumWindowSeconds: MAXIMUM_REPLACEMENT_WINDOW_SECONDS,
    hookDispositionBasis: boundedReplacementConsistent
      ? 'provider_contract_plus_terminal_old_blueprint_absence'
      : 'not_established',
    boundedReplacementConsistent,
    differences,
    beforeSha256,
    afterSha256,
    supportSha256,
    secretsCaptured: false,
  };
}

export function compareBlueprintReplacementEvidence({
  beforeBytes,
  afterBytes,
  supportBytes,
  sourcePolicyBytes,
  backendRepo,
  publishedComparisonBytes = null,
}) {
  for (const [bytes, label] of [
    [beforeBytes, 'before observation'],
    [afterBytes, 'after observation'],
    [supportBytes, 'support response'],
    [sourcePolicyBytes, 'source policy'],
  ]) {
    if (!Buffer.isBuffer(bytes)) fail(`${label} bytes must be a Buffer`);
  }
  if (
    publishedComparisonBytes !== null
    && !Buffer.isBuffer(publishedComparisonBytes)
  ) {
    fail('published comparison bytes must be a Buffer');
  }
  const beforeInput = parseJsonBytes(beforeBytes, 'before observation');
  const afterInput = parseJsonBytes(afterBytes, 'after observation');
  const supportInput = parseJsonBytes(supportBytes, 'support response');
  const before = parseObservation(beforeInput.value, 'before', 'before observation');
  const after = parseObservation(afterInput.value, 'after', 'after observation');
  const support = parseSupport(supportInput.value);
  const sourcePolicy = parseSourcePolicy(sourcePolicyBytes);
  const sourceTransition = verifySourceTransition({
    before,
    after,
    policy: sourcePolicy,
    backendRepo,
  });
  const result = compareBlueprintReplacement({
    before,
    after,
    support,
    sourceTransition,
    beforeSha256: sha256(beforeBytes),
    afterSha256: sha256(afterBytes),
    supportSha256: sha256(supportBytes),
  });
  const output = `${JSON.stringify(result, null, 2)}\n`;
  if (
    publishedComparisonBytes !== null
    && !publishedComparisonBytes.equals(Buffer.from(output))
  ) {
    fail('published comparison does not match the exact inputs');
  }
  return { result, output };
}

function parseArgs(argv) {
  const allowed = new Set([
    '--before',
    '--after',
    '--support',
    '--source-policy',
    '--backend-repo',
    '--verify-json',
  ]);
  const values = new Map();
  if (argv.length % 2 !== 0) fail('every option requires a value');
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!allowed.has(key)) fail(`unknown option ${String(key)}`);
    if (values.has(key)) fail(`duplicate option ${key}`);
    if (!value || value.startsWith('--')) fail(`${key} requires a value`);
    values.set(key, value);
  }
  for (const key of [
    '--before',
    '--after',
    '--support',
    '--source-policy',
    '--backend-repo',
  ]) {
    if (!values.has(key)) fail(`missing required option ${key}`);
  }
  return {
    beforePath: values.get('--before'),
    afterPath: values.get('--after'),
    supportPath: values.get('--support'),
    sourcePolicyPath: values.get('--source-policy'),
    backendRepo: values.get('--backend-repo'),
    verifyJsonPath: values.get('--verify-json') ?? null,
  };
}

export function run(argv) {
  const options = parseArgs(argv);
  return compareBlueprintReplacementEvidence({
    beforeBytes: fs.readFileSync(options.beforePath),
    afterBytes: fs.readFileSync(options.afterPath),
    supportBytes: fs.readFileSync(options.supportPath),
    sourcePolicyBytes: fs.readFileSync(options.sourcePolicyPath),
    backendRepo: options.backendRepo,
    publishedComparisonBytes: options.verifyJsonPath === null
      ? null
      : fs.readFileSync(options.verifyJsonPath),
  });
}

const isMain =
  process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  try {
    const { result, output } = run(process.argv.slice(2));
    process.stdout.write(output);
    if (!result.boundedReplacementConsistent) process.exitCode = 2;
  } catch (error) {
    process.stderr.write(
      `platform-reliability-r1-blueprint-replacement-compare: ${error.message}\n`,
    );
    process.exitCode = 1;
  }
}
