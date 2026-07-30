import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildRerunCommand,
  chooseExistingRun,
  parseArgs,
  runCli,
} from './ci-run-once.mjs';

const SHA = 'a'.repeat(40);
const OTHER_SHA = 'b'.repeat(40);

function makeRun(overrides = {}) {
  return {
    databaseId: 123,
    status: 'completed',
    conclusion: 'success',
    url: 'https://github.example/runs/123',
    createdAt: '2026-07-30T12:00:00Z',
    event: 'pull_request',
    headSha: SHA,
    headBranch: 'codex/example',
    ...overrides,
  };
}

function harness({
  runLists = [[]],
  remoteShas = [SHA],
  gitRef = 'codex/example',
  gitSha = SHA,
  dispatchStatus = 0,
} = {}) {
  const calls = [];
  const stdout = [];
  const stderr = [];
  let runIndex = 0;
  let remoteIndex = 0;

  const execute = (command, args) => {
    calls.push([command, ...args]);
    if (command === 'git' && args[0] === 'symbolic-ref') {
      return { status: 0, stdout: `${gitRef}\n`, stderr: '' };
    }
    if (command === 'git' && args[0] === 'rev-parse') {
      return { status: 0, stdout: `${gitSha}\n`, stderr: '' };
    }
    if (command === 'gh' && args[0] === 'run' && args[1] === 'list') {
      const value = runLists[Math.min(runIndex, runLists.length - 1)];
      runIndex += 1;
      return {
        status: 0,
        stdout: `${JSON.stringify(value)}\n`,
        stderr: '',
      };
    }
    if (command === 'gh' && args[0] === 'api') {
      const value =
        remoteShas[Math.min(remoteIndex, remoteShas.length - 1)];
      remoteIndex += 1;
      return { status: 0, stdout: `${value}\n`, stderr: '' };
    }
    if (command === 'gh' && args[0] === 'workflow' && args[1] === 'run') {
      return {
        status: dispatchStatus,
        stdout: '',
        stderr: dispatchStatus === 0 ? '' : 'dispatch rejected',
      };
    }
    throw new Error(`unexpected command: ${command} ${args.join(' ')}`);
  };

  return {
    calls,
    stdout,
    stderr,
    execute,
    writeOut: (text) => stdout.push(text),
    writeErr: (text) => stderr.push(text),
  };
}

const requiredArgs = [
  '--repo',
  'Glera/swipe-backend',
  '--workflow',
  'postgres-acceptance.yml',
];

test('argument parser is strict and defaults to dry-run', () => {
  assert.deepEqual(parseArgs(requiredArgs), {
    apply: false,
    help: false,
    repo: 'Glera/swipe-backend',
    workflow: 'postgres-acceptance.yml',
    ref: null,
    sha: null,
  });
  assert.throws(
    () => parseArgs(['--repo', 'Glera/swipe-backend']),
    /--workflow is required/,
  );
  assert.throws(
    () => parseArgs([...requiredArgs, '--ref', '../master']),
    /unsupported branch ref/,
  );
  assert.throws(
    () => parseArgs([...requiredArgs, '--sha', 'abc123']),
    /full commit SHA/,
  );
});

test('decision prefers an active run, then any successful run', () => {
  const failedNewer = makeRun({
    databaseId: 300,
    conclusion: 'failure',
    createdAt: '2026-07-30T14:00:00Z',
  });
  const activeOlder = makeRun({
    databaseId: 200,
    status: 'in_progress',
    conclusion: '',
    createdAt: '2026-07-30T13:00:00Z',
  });
  assert.equal(
    chooseExistingRun([failedNewer, activeOlder]).kind,
    'active',
  );

  const successOlder = makeRun({
    databaseId: 100,
    createdAt: '2026-07-30T11:00:00Z',
  });
  assert.equal(
    chooseExistingRun([failedNewer, successOlder]).kind,
    'success',
  );
});

test('active exact-SHA run is reused without remote lookup or dispatch', async () => {
  const h = harness({
    runLists: [[makeRun({ status: 'queued', conclusion: '' })]],
  });
  const status = await runCli(requiredArgs, h);
  assert.equal(status, 0);
  assert.match(h.stdout.join(''), /REUSE.*already active/u);
  assert.equal(h.calls.filter((call) => call[1] === 'api').length, 0);
  assert.equal(h.calls.filter((call) => call[1] === 'workflow').length, 0);
});

test('successful exact-SHA run is reused even when a newer failure exists', async () => {
  const h = harness({
    runLists: [[
      makeRun(),
      makeRun({
        databaseId: 456,
        conclusion: 'failure',
        createdAt: '2026-07-30T13:00:00Z',
      }),
    ]],
  });
  const status = await runCli(requiredArgs, h);
  assert.equal(status, 0);
  assert.match(h.stdout.join(''), /already succeeded/u);
  assert.equal(h.calls.filter((call) => call[1] === 'workflow').length, 0);
});

test('failed exact-SHA run blocks dispatch and prints rerun --failed', async () => {
  const failed = makeRun({ conclusion: 'failure' });
  const h = harness({ runLists: [[failed]] });
  const status = await runCli([...requiredArgs, '--apply'], h);
  assert.equal(status, 2);
  assert.match(h.stdout.join(''), /STOP/u);
  assert.match(h.stdout.join(''), /'gh' 'run' 'rerun' '123' '--failed'/u);
  assert.equal(h.calls.filter((call) => call[1] === 'workflow').length, 0);
});

test('cancelled run recommends a full rerun, not a fresh dispatch', () => {
  const command = buildRerunCommand(
    makeRun({ conclusion: 'cancelled' }),
    'Glera/swipe-backend',
  );
  assert.equal(
    command,
    "'gh' 'run' 'rerun' '123' '--repo' 'Glera/swipe-backend'",
  );
});

test('dry-run verifies remote SHA and never dispatches', async () => {
  const h = harness();
  const status = await runCli(requiredArgs, h);
  assert.equal(status, 0);
  assert.match(h.stdout.join(''), /DRY RUN/u);
  assert.match(h.stdout.join(''), /Remote codex\/example matches/u);
  assert.equal(h.calls.filter((call) => call[1] === 'workflow').length, 0);
  assert.equal(h.calls.filter((call) => call[1] === 'api').length, 1);
});

test('--apply performs a second run and ref check, then one dispatch', async () => {
  const h = harness({
    runLists: [[], []],
    remoteShas: [SHA, SHA],
  });
  const status = await runCli([...requiredArgs, '--apply'], h);
  assert.equal(status, 0);
  assert.match(h.stdout.join(''), /DISPATCHED/u);
  assert.equal(
    h.calls.filter(
      (call) => call[0] === 'gh' && call[1] === 'workflow',
    ).length,
    1,
  );
  assert.equal(h.calls.filter((call) => call[1] === 'api').length, 2);
  assert.equal(
    h.calls.filter((call) => call[1] === 'run' && call[2] === 'list').length,
    2,
  );
});

test('--apply stops when an automatic run appears during preflight', async () => {
  const h = harness({
    runLists: [[], [makeRun({ status: 'in_progress', conclusion: '' })]],
  });
  const status = await runCli([...requiredArgs, '--apply'], h);
  assert.equal(status, 0);
  assert.match(h.stdout.join(''), /REUSE/u);
  assert.equal(h.calls.filter((call) => call[1] === 'workflow').length, 0);
});

test('remote branch mismatch fails closed before dispatch', async () => {
  const h = harness({ remoteShas: [OTHER_SHA] });
  const status = await runCli(requiredArgs, h);
  assert.equal(status, 1);
  assert.match(h.stderr.join(''), /points to .* not/u);
  assert.equal(h.calls.filter((call) => call[1] === 'workflow').length, 0);
});

test('GitHub lookup failure fails closed before dispatch', async () => {
  const h = harness();
  h.execute = (command, args) => {
    h.calls.push([command, ...args]);
    if (command === 'git' && args[0] === 'symbolic-ref') {
      return { status: 0, stdout: 'codex/example\n', stderr: '' };
    }
    if (command === 'git' && args[0] === 'rev-parse') {
      return { status: 0, stdout: `${SHA}\n`, stderr: '' };
    }
    return { status: 1, stdout: '', stderr: 'GitHub unavailable' };
  };
  const status = await runCli([...requiredArgs, '--apply'], h);
  assert.equal(status, 1);
  assert.match(h.stderr.join(''), /GitHub unavailable/u);
  assert.equal(h.calls.filter((call) => call[1] === 'workflow').length, 0);
});

test('run list is filtered defensively by full head SHA', async () => {
  const h = harness({
    runLists: [[makeRun({ headSha: OTHER_SHA })]],
  });
  const status = await runCli(requiredArgs, h);
  assert.equal(status, 0);
  assert.match(h.stdout.join(''), /DRY RUN/u);
});
