import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const digest = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex');

function git(repository, args, { env = {} } = {}) {
  return execFileSync('git', ['-C', repository, ...args], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
}

function commit(repository, message) {
  git(repository, ['add', '--all']);
  git(repository, [
    '-c', 'user.name=R1 Test',
    '-c', 'user.email=r1-test@example.invalid',
    'commit', '-m', message,
  ]);
  return git(repository, ['rev-parse', 'HEAD']);
}

export function createBlueprintGitFixture(parentDirectory) {
  const repository = path.join(parentDirectory, 'backend-git-fixture');
  fs.mkdirSync(repository);
  git(repository, ['init', '--initial-branch=master']);
  git(repository, [
    'remote', 'add', 'origin', 'https://github.com/Glera/swipe-backend.git',
  ]);

  const liveRender = Buffer.from([
    'services:',
    '  - type: web',
    '    name: swipe-backend',
    '    dockerfilePath: ./Dockerfile.bake',
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(repository, 'render.yaml'), liveRender);
  fs.writeFileSync(path.join(repository, 'README.md'), 'live source\n');
  const liveBlueprintSourceSha = commit(repository, 'live source');

  fs.mkdirSync(path.join(repository, 'scripts'));
  fs.writeFileSync(
    path.join(repository, 'render.yaml'),
    'services:\n  - type: web\n    dockerfilePath: ./Dockerfile\n',
  );
  fs.writeFileSync(
    path.join(repository, 'scripts', 'start-bake-runtime.sh'),
    '#!/bin/sh\nalembic upgrade head\n',
  );
  const preFreezeMasterSha = commit(repository, 'r1a source');
  const preFreezeMasterTree = git(repository, ['rev-parse', 'HEAD^{tree}']);

  fs.writeFileSync(path.join(repository, 'render.yaml'), liveRender);
  fs.rmSync(path.join(repository, 'scripts', 'start-bake-runtime.sh'));
  fs.mkdirSync(path.join(repository, 'deploy'));
  const sentinel = Buffer.from([
    '#!/bin/sh',
    'echo "Gate C0 source freeze: deploy forbidden" >&2',
    'exit 78',
    '',
  ].join('\n'));
  fs.writeFileSync(path.join(repository, 'Dockerfile.bake'), sentinel);
  const manifest = {
    schema: 'platform-reliability-r1-gate-c0-freeze.v1',
    purpose: 'temporary_relink_only_blueprint_replacement',
    baselineSourceSha: preFreezeMasterSha,
    liveRenderSourceSha: liveBlueprintSourceSha,
    liveRenderSha256: digest(liveRender),
    r1aRenderSha256: digest(Buffer.from(
      'services:\n  - type: web\n    dockerfilePath: ./Dockerfile\n',
    )),
    sentinelDockerfileSha256: digest(sentinel),
    allowedAction: 'blueprint_relink_only',
    deployAllowed: false,
    requiredAutoDeployTrigger: 'off',
    revertEntireFreezeCommitRequired: true,
    secretsCaptured: false,
  };
  const manifestBytes = Buffer.from(`${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(
    path.join(repository, 'deploy', 'platform-reliability-r1-gate-c0-freeze.v1.json'),
    manifestBytes,
  );
  const freezeCandidateHead = commit(repository, 'freeze candidate');
  const freezeCandidateTree = git(repository, ['rev-parse', 'HEAD^{tree}']);
  const afterSourceSha = git(repository, [
    '-c', 'user.name=R1 Test',
    '-c', 'user.email=r1-test@example.invalid',
    'commit-tree', freezeCandidateTree,
    '-p', preFreezeMasterSha,
    '-p', freezeCandidateHead,
    '-m', 'merge freeze candidate',
  ], {
    env: {
      GIT_AUTHOR_DATE: '2026-08-04T00:00:00Z',
      GIT_COMMITTER_DATE: '2026-08-04T00:00:00Z',
    },
  });

  const policy = {
    schema: 'platform-reliability-r1-gate-c0-source-freeze-policy.v2',
    status: 'reviewed_candidate_not_authorized',
    backendRepository: 'Glera/swipe-backend',
    backendPullRequest: 54,
    blueprintSourceBranch: 'master',
    blueprintPath: 'render.yaml',
    liveBlueprintSourceSha,
    liveRenderSha256: digest(liveRender),
    freezeManifestPath: 'deploy/platform-reliability-r1-gate-c0-freeze.v1.json',
    freezeManifestSha256: digest(manifestBytes),
    sentinelDockerfilePath: 'Dockerfile.bake',
    sentinelDockerfileSha256: digest(sentinel),
    forbiddenRuntimePath: 'scripts/start-bake-runtime.sh',
    preFreezeMasterSha,
    preFreezeMasterTree,
    freezeCandidateHead,
    freezeCandidateTree,
    mergeMethod: 'merge_commit',
    expectedMergeFirstParent: preFreezeMasterSha,
    expectedMergeSecondParent: freezeCandidateHead,
    expectedMergeTree: freezeCandidateTree,
    requiredPostRevertTree: preFreezeMasterTree,
    maximumFreezeSeconds: 3600,
    revertBeforeGateC: true,
    expectedReplacementDeployOutcome:
      'sentinel_exit_78_before_app_or_database_access',
    successfulOrLiveDeployForbidden: true,
    unexpectedSyncForbidden: true,
    operatorAuthorityRequired: true,
    secretsCaptured: false,
  };
  const policyPath = path.join(parentDirectory, 'source-policy.json');
  fs.writeFileSync(policyPath, `${JSON.stringify(policy, null, 2)}\n`);
  return {
    repository,
    policy,
    policyPath,
    liveBlueprintSourceSha,
    afterSourceSha,
  };
}
