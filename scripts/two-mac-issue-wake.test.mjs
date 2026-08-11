import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PassThrough } from 'node:stream';
import test from 'node:test';

import {
  createMachineBinding,
  encodeMachineBindingMarker,
} from './two-mac-bridge-contract.mjs';
import {
  createIssueWake,
  createIssueWakeInstall,
  createIssueWakeReceipt,
  encodeIssueWakeMarker,
  encodeIssueWakeReceiptMarker,
  projectIssueWakeJournal,
  sha256,
} from './two-mac-issue-wake-contract.mjs';
import {
  activateWithDurableReceipt,
  AppServerClient,
  appendTerminalReceipt,
  deriveTaskDigest,
  findExactThread,
  observeWake,
  parseArgs,
  signalWake,
  verifyInstalledFiles,
} from './two-mac-issue-wake.mjs';

const REPOSITORY_ID = '1305418803';
const MAC_A_THREAD = '019fe7a1-b167-7412-8f94-9d58edd1430c';
const MAC_B_THREAD = '019ff000-0000-7000-8000-00000000000b';
const MAC_A_TASK = sha256(`codex-thread-v1\0${MAC_A_THREAD}`);
const MAC_B_TASK = sha256(`codex-thread-v1\0${MAC_B_THREAD}`);
const MAC_A_BINDING = 'a'.repeat(64);
const MAC_B_BINDING = 'b'.repeat(64);
const BRIDGE_HEAD = '1'.repeat(40);
const WAKE_HEAD = '2'.repeat(40);
const SOURCE_A = 'bounded mac-b orchestrator wake evidence';
const SOURCE_B = 'merge locked capability bootstrap evidence';

function binding(machine, taskDigest, bindingDigest) {
  const value = createMachineBinding({
    controlIssue: 94,
    repositoryId: REPOSITORY_ID,
    machine,
    taskDigest,
    bridgeCommit: BRIDGE_HEAD,
    registeredAt: '2026-08-11T10:00:00.000Z',
  });
  assert.equal(value.bindingDigest.length, 64);
  // Tests use the contract-computed binding digest, not the mnemonic constant.
  return value;
}

function makeIssue() {
  const macA = binding('mac-a', MAC_A_TASK, MAC_A_BINDING);
  const macB = binding('mac-b', MAC_B_TASK, MAC_B_BINDING);
  return {
    number: 94,
    body: '',
    htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/94',
    comments: [
      { id: 1, body: encodeMachineBindingMarker(macA), htmlUrl: 'https://example.test/1', createdAt: macA.registeredAt },
      { id: 2, body: encodeMachineBindingMarker(macB), htmlUrl: 'https://example.test/2', createdAt: macB.registeredAt },
      { id: 5254002547, body: SOURCE_A, htmlUrl: 'https://example.test/a', createdAt: '2026-08-11T13:44:52.000Z' },
      { id: 5254495049, body: SOURCE_B, htmlUrl: 'https://example.test/b', createdAt: '2026-08-11T14:26:48.000Z' },
    ],
    macA,
    macB,
  };
}

class FakeTransport {
  constructor(issue = makeIssue()) {
    this.issue = issue;
    this.nextId = 6000000000;
    this.posts = [];
  }

  async getRepositoryId() { return REPOSITORY_ID; }

  async getIssue() { return structuredClone(this.issue); }

  async postComment(_repo, _issue, body) {
    const comment = {
      id: this.nextId,
      body,
      htmlUrl: `https://example.test/${this.nextId}`,
      createdAt: '2026-08-11T16:00:00.000Z',
    };
    this.nextId += 1;
    this.issue.comments.push(comment);
    this.posts.push(comment);
    return structuredClone(comment);
  }

  async resolveRef() { return WAKE_HEAD; }
}

function wakeFor(issue) {
  return createIssueWake({
    controlIssue: 94,
    repositoryId: REPOSITORY_ID,
    bindingDigest: issue.macB.bindingDigest,
    taskDigest: MAC_B_TASK,
    bridgeCommit: BRIDGE_HEAD,
    wakeCommit: WAKE_HEAD,
    sourceComments: [
      { commentId: 5254002547, bodySha256: sha256(SOURCE_A) },
      { commentId: 5254495049, bodySha256: sha256(SOURCE_B) },
    ],
    createdAt: '2026-08-11T16:00:00.000Z',
    expiresAt: '2026-08-12T16:00:00.000Z',
  });
}

function installConfig(issue) {
  return createIssueWakeInstall({
    repository: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    repositoryId: REPOSITORY_ID,
    bindingDigest: issue.macB.bindingDigest,
    taskDigest: MAC_B_TASK,
    bridgeCommit: BRIDGE_HEAD,
    bridgeContractSha256: 'e'.repeat(64),
    wakeCommit: WAKE_HEAD,
    sourceDir: '/tmp/p4g-wake',
    nodePath: '/usr/local/bin/node',
    codexPath: '/Applications/ChatGPT.app/Contents/Resources/codex',
    ghPath: '/usr/local/bin/gh',
    scriptSha256: 'c'.repeat(64),
    contractSha256: 'd'.repeat(64),
    installedAt: '2026-08-11T16:00:00.000Z',
  });
}

function noCadence() {
  return {
    readCadenceImpl: async () => ({
      schema: 'two-mac.issue-wake-cadence.v1',
      nextNetworkAt: 0,
      lastWakeDigest: null,
    }),
    writeCadenceImpl: async () => {},
  };
}

test('CLI surface has no task id, prompt, command, repository, or credential inputs', () => {
  assert.deepEqual(parseArgs([
    'signal', '--machine', 'mac-a', '--source-comment-id', '5254002547',
  ]).sourceCommentIds, [5254002547]);
  for (const option of ['--task-id', '--task-digest', '--prompt', '--command', '--repo', '--token']) {
    assert.throws(() => parseArgs(['signal', '--machine', 'mac-a', '--source-comment-id', '1', option, 'x']), /unknown option/u);
  }
  assert.throws(() => parseArgs(['observe', '--machine', 'mac-b', '--config', 'relative.json']), /absolute/u);
});

test('task identity is locally derived and exact thread matching is singular', () => {
  assert.equal(deriveTaskDigest({ CODEX_THREAD_ID: MAC_B_THREAD }), MAC_B_TASK);
  const thread = findExactThread([
    { id: MAC_A_THREAD, status: { type: 'notLoaded' } },
    { id: MAC_B_THREAD, status: { type: 'notLoaded' } },
  ], MAC_B_TASK);
  assert.equal(thread.id, MAC_B_THREAD);
  assert.throws(() => findExactThread([], MAC_B_TASK), /count is 0/u);
  assert.throws(() => findExactThread([{ id: MAC_B_THREAD }, { id: MAC_B_THREAD }], MAC_B_TASK), /count is 2/u);
});

test('App Server interactive requests are explicitly denied and fail fast', async () => {
  const child = new EventEmitter();
  child.stdin = new PassThrough();
  child.stdout = new PassThrough();
  child.stderr = new PassThrough();
  child.kill = () => { child.emit('exit', 0); };
  const writes = [];
  child.stdin.on('data', (chunk) => writes.push(String(chunk)));
  const client = new AppServerClient({
    codexPath: '/usr/local/bin/codex',
    cwd: '/tmp',
    spawnImpl: () => child,
  });
  const pending = client.request('thread/list', {});
  child.stdout.write(`${JSON.stringify({
    id: 91,
    method: 'item/commandExecution/requestApproval',
    params: {},
  })}\n`);
  await assert.rejects(pending, /requested unsupported interaction/u);
  const messages = writes.join('').trim().split('\n').map((line) => JSON.parse(line));
  assert.deepEqual(messages.at(-1), {
    id: 91,
    error: { code: -32000, message: 'issue-only wake denies interactive requests' },
  });
  client.close();
});

test('Mac A signal binds exact source bytes and both existing machine bindings', async () => {
  const transport = new FakeTransport();
  const result = await signalWake({
    transport,
    taskDigest: MAC_A_TASK,
    wakeCommit: WAKE_HEAD,
    sourceCommentIds: [5254002547, 5254495049],
    apply: true,
    clock: () => new Date('2026-08-11T16:00:00.000Z'),
  });
  assert.equal(result.status, 'SIGNALED');
  assert.equal(result.wake.taskDigest, MAC_B_TASK);
  assert.equal(result.wake.bindingDigest, transport.issue.macB.bindingDigest);
  assert.equal(result.wake.sourceComments[0].bodySha256, sha256(SOURCE_A));
  const replay = await signalWake({
    transport,
    taskDigest: MAC_A_TASK,
    wakeCommit: WAKE_HEAD,
    sourceCommentIds: [5254002547, 5254495049],
    apply: true,
    clock: () => new Date('2026-08-11T16:01:00.000Z'),
  });
  assert.equal(replay.status, 'REUSE');
  assert.equal(transport.posts.length, 1);
});

test('expired nonterminal wake still blocks a replacement signal', async () => {
  const issue = makeIssue();
  const expired = wakeFor(issue);
  issue.comments.push({
    id: 9,
    body: encodeIssueWakeMarker(expired),
    htmlUrl: 'https://example.test/9',
    createdAt: expired.createdAt,
  });
  const transport = new FakeTransport(issue);
  await assert.rejects(() => signalWake({
    transport,
    taskDigest: MAC_A_TASK,
    wakeCommit: WAKE_HEAD,
    sourceCommentIds: [5254495049],
    apply: true,
    clock: () => new Date('2026-08-12T16:01:00.000Z'),
  }), /another nonterminal issue wake already exists/u);
  assert.equal(transport.posts.length, 0);
});

test('source-comment mutation after signal fails closed before task resume', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  issue.comments.push({ id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt });
  issue.comments.find((comment) => comment.id === 5254002547).body = `${SOURCE_A} changed`;
  const transport = new FakeTransport(issue);
  let appStarted = false;
  await assert.rejects(() => observeWake({
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory: () => { appStarted = true; throw new Error('must not start'); },
    verifyInstall: async () => {},
    ...noCadence(),
    apply: true,
    clock: () => new Date('2026-08-11T16:02:00.000Z'),
  }), /source comment bytes changed/u);
  assert.equal(appStarted, false);
  assert.equal(transport.posts.length, 0);
});

test('remote wake CAS mismatch fails before task lookup or Issue mutation', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  issue.comments.push({ id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt });
  const transport = new FakeTransport(issue);
  transport.resolveRef = async () => '3'.repeat(40);
  let appStarted = false;
  await assert.rejects(() => observeWake({
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory: () => { appStarted = true; throw new Error('must not start'); },
    verifyInstall: async () => {},
    ...noCadence(),
    apply: true,
    clock: () => new Date('2026-08-11T16:02:00.000Z'),
  }), /remote wake master changed/u);
  assert.equal(appStarted, false);
  assert.equal(transport.posts.length, 0);
});

test('active exact task is never duplicated or claimed', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  issue.comments.push({ id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt });
  const transport = new FakeTransport(issue);
  let starts = 0;
  const result = await observeWake({
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory: () => ({
      async initialize() {},
      async listThreads() { return [{ id: MAC_B_THREAD, status: { type: 'active' } }]; },
      async startBoundTurn() { starts += 1; },
      close() {},
    }),
    verifyInstall: async () => {},
    ...noCadence(),
    apply: true,
    clock: () => new Date('2026-08-11T16:02:00.000Z'),
  });
  assert.equal(result.status, 'TASK_ACTIVE');
  assert.equal(starts, 0);
  assert.equal(transport.posts.length, 0);
});

test('one pending wake starts exactly the bound task and requires one terminal receipt', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  issue.comments.push({ id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt });
  const transport = new FakeTransport(issue);
  const seen = { starts: 0, prompt: '' };
  const cadenceWrites = [];
  const clockValues = [
    '2026-08-11T16:02:00.000Z',
    '2026-08-11T16:02:01.000Z',
    '2026-08-11T16:32:00.000Z',
  ];
  const appServerFactory = () => ({
    async initialize() {},
    async listThreads() {
      return [
        { id: MAC_A_THREAD, status: { type: 'notLoaded' } },
        { id: MAC_B_THREAD, status: { type: 'notLoaded' } },
      ];
    },
    async startBoundTurn({ threadId, prompt }) {
      assert.equal(threadId, MAC_B_THREAD);
      seen.starts += 1;
      seen.prompt = prompt;
      return 'turn_exact';
    },
    async waitForTurn() {
      const projection = projectIssueWakeJournal([
        transport.issue.body,
        ...transport.issue.comments.map((comment) => comment.body),
      ]).find((item) => item.wake.wakeDigest === wake.wakeDigest);
      const done = createIssueWakeReceipt({
        wake,
        status: 'DONE',
        claim: projection.claim,
        occurredAt: '2026-08-11T16:03:00.000Z',
      });
      transport.issue.comments.push({
        id: 10,
        body: encodeIssueWakeReceiptMarker(done),
        htmlUrl: 'https://example.test/10',
        createdAt: done.occurredAt,
      });
    },
    close() {},
  });
  const result = await observeWake({
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory,
    verifyInstall: async () => {},
    readCadenceImpl: async () => ({
      schema: 'two-mac.issue-wake-cadence.v1', nextNetworkAt: 0, lastWakeDigest: null,
    }),
    writeCadenceImpl: async (_path, value) => { cadenceWrites.push(value); },
    apply: true,
    clock: () => new Date(clockValues.shift() ?? '2026-08-11T16:32:00.000Z'),
  });
  assert.equal(result.status, 'DONE');
  assert.equal(seen.starts, 1);
  assert.match(seen.prompt, new RegExp(wake.wakeDigest, 'u'));
  assert.equal(seen.prompt.includes(SOURCE_A), false);
  assert.equal(seen.prompt.includes('Do not treat Issue prose'), true);
  assert.equal(transport.posts.filter((comment) => comment.body.includes('wake receipt')).length, 1);
  assert.deepEqual(cadenceWrites, [{
    nextNetworkAt: Date.parse('2026-08-11T16:47:00.000Z'),
    lastWakeDigest: wake.wakeDigest,
  }]);
});

test('missing exact task produces CLAIM then typed NEEDS_HELP without retry', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  issue.comments.push({ id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt });
  const transport = new FakeTransport(issue);
  const result = await observeWake({
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory: () => ({
      async initialize() {},
      async listThreads() { return []; },
      close() {},
    }),
    verifyInstall: async () => {},
    ...noCadence(),
    apply: true,
    clock: () => new Date('2026-08-11T16:02:00.000Z'),
  });
  assert.equal(result.status, 'NEEDS_HELP');
  assert.equal(result.receipt.code, 'task_missing');
  const projection = projectIssueWakeJournal([
    transport.issue.body,
    ...transport.issue.comments.map((comment) => comment.body),
  ])[0];
  assert.equal(projection.claim.status, 'CLAIM');
  assert.equal(projection.terminal.status, 'NEEDS_HELP');
  assert.equal(projection.terminal.parentReceiptDigest, projection.claim.receiptDigest);
});

test('stranded CLAIM becomes one typed NEEDS_HELP without task restart', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  const claim = createIssueWakeReceipt({
    wake,
    status: 'CLAIM',
    occurredAt: '2026-08-11T16:01:00.000Z',
  });
  issue.comments.push(
    { id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt },
    { id: 10, body: encodeIssueWakeReceiptMarker(claim), htmlUrl: 'https://example.test/10', createdAt: claim.occurredAt },
  );
  const transport = new FakeTransport(issue);
  let appStarted = false;
  const result = await observeWake({
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory: () => { appStarted = true; throw new Error('must not start'); },
    verifyInstall: async () => {},
    ...noCadence(),
    apply: true,
    clock: () => new Date('2026-08-11T16:17:00.000Z'),
  });
  assert.equal(result.status, 'NEEDS_HELP');
  assert.equal(result.receipt.code, 'wake_claim_stranded');
  assert.equal(appStarted, false);
  assert.equal(transport.posts.length, 1);
});

test('expired wake stops without opening App Server', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  issue.comments.push({ id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt });
  const transport = new FakeTransport(issue);
  let appStarted = false;
  const result = await observeWake({
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory: () => { appStarted = true; throw new Error('must not start'); },
    verifyInstall: async () => {},
    ...noCadence(),
    apply: true,
    clock: () => new Date('2026-08-12T16:00:00.001Z'),
  });
  assert.equal(result.status, 'STOP');
  assert.equal(result.receipt.code, 'wake_expired');
  assert.equal(appStarted, false);
  assert.equal(transport.posts.length, 2);
});

test('empty queue writes a 15-minute network gate only in apply mode', async () => {
  const issue = makeIssue();
  const transport = new FakeTransport(issue);
  const writes = [];
  const common = {
    config: installConfig(issue),
    configPath: '/tmp/config.json',
    cadencePath: '/tmp/cadence.json',
    transport,
    appServerFactory: () => { throw new Error('must not start'); },
    verifyInstall: async () => {},
    readCadenceImpl: async () => ({
      schema: 'two-mac.issue-wake-cadence.v1', nextNetworkAt: 0, lastWakeDigest: null,
    }),
    writeCadenceImpl: async (_path, value) => { writes.push(value); },
    clock: () => new Date('2026-08-11T16:02:00.000Z'),
  };
  const dryRun = await observeWake({ ...common, apply: false });
  assert.equal(dryRun.status, 'IDLE');
  assert.deepEqual(writes, []);
  const applied = await observeWake({ ...common, apply: true });
  assert.equal(applied.status, 'IDLE');
  assert.deepEqual(writes, [{
    nextNetworkAt: Date.parse('2026-08-11T16:17:00.000Z'), lastWakeDigest: null,
  }]);
});

test('failed durable install receipt deactivates the LaunchAgent before returning', async () => {
  const events = [];
  await assert.rejects(() => activateWithDurableReceipt({
    activate: async () => { events.push('activate'); },
    verifyActive: async () => { events.push('verify'); },
    writeReceipt: async () => { events.push('receipt'); throw new Error('GitHub unavailable'); },
    deactivate: async () => { events.push('deactivate'); },
  }), /GitHub unavailable/u);
  assert.deepEqual(events, ['activate', 'verify', 'receipt', 'deactivate']);
});

test('installed source verification covers the imported binding authority contract', async () => {
  const root = await mkdtemp(join(tmpdir(), 'p4g-wake-integrity-'));
  try {
    await mkdir(join(root, 'scripts'));
    const files = {
      'two-mac-issue-wake.mjs': 'export const wake = true;\n',
      'two-mac-issue-wake-contract.mjs': 'export const contract = true;\n',
      'two-mac-bridge-contract.mjs': 'export const binding = true;\n',
    };
    for (const [name, bytes] of Object.entries(files)) {
      await writeFile(join(root, 'scripts', name), bytes);
    }
    const git = (args) => {
      const result = spawnSync('/usr/bin/git', args, {
        cwd: root,
        encoding: 'utf8',
        env: {
          ...process.env,
          GIT_AUTHOR_NAME: 'Wake Test',
          GIT_AUTHOR_EMAIL: 'wake@example.test',
          GIT_COMMITTER_NAME: 'Wake Test',
          GIT_COMMITTER_EMAIL: 'wake@example.test',
        },
      });
      assert.equal(result.status, 0, result.stderr);
      return result.stdout.trim();
    };
    git(['init', '-q']);
    git(['add', 'scripts']);
    git(['commit', '-qm', 'fixture']);
    const config = createIssueWakeInstall({
      repository: 'Glera/p4g-workspace-meta',
      controlIssue: 94,
      repositoryId: REPOSITORY_ID,
      bindingDigest: 'a'.repeat(64),
      taskDigest: MAC_B_TASK,
      bridgeCommit: BRIDGE_HEAD,
      bridgeContractSha256: sha256(files['two-mac-bridge-contract.mjs']),
      wakeCommit: git(['rev-parse', 'HEAD']),
      sourceDir: root,
      nodePath: '/usr/local/bin/node',
      codexPath: '/usr/local/bin/codex',
      ghPath: '/usr/local/bin/gh',
      scriptSha256: sha256(files['two-mac-issue-wake.mjs']),
      contractSha256: sha256(files['two-mac-issue-wake-contract.mjs']),
      installedAt: '2026-08-11T16:00:00.000Z',
    });
    await verifyInstalledFiles(config);
    await writeFile(join(root, 'scripts', 'two-mac-bridge-contract.mjs'), 'export const binding = false;\n');
    await assert.rejects(() => verifyInstalledFiles(config), /reviewed checksums/u);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('terminal receipt can be written only by the exact bound Mac B task', async () => {
  const issue = makeIssue();
  const wake = wakeFor(issue);
  const claim = createIssueWakeReceipt({
    wake,
    status: 'CLAIM',
    occurredAt: '2026-08-11T16:01:00.000Z',
  });
  issue.comments.push(
    { id: 9, body: encodeIssueWakeMarker(wake), htmlUrl: 'https://example.test/9', createdAt: wake.createdAt },
    { id: 10, body: encodeIssueWakeReceiptMarker(claim), htmlUrl: 'https://example.test/10', createdAt: claim.occurredAt },
  );
  const transport = new FakeTransport(issue);
  let installVerified = false;
  await assert.rejects(() => appendTerminalReceipt({
    transport,
    config: installConfig(issue),
    taskDigest: MAC_A_TASK,
    status: 'DONE',
    code: null,
    apply: true,
    clock: () => new Date('2026-08-11T16:03:00.000Z'),
    verifyInstall: async () => { installVerified = true; },
  }), /bound Mac B task/u);
  assert.equal(installVerified, false);
  transport.resolveRef = async () => '3'.repeat(40);
  await assert.rejects(() => appendTerminalReceipt({
    transport,
    config: installConfig(issue),
    taskDigest: MAC_B_TASK,
    status: 'DONE',
    code: null,
    apply: true,
    clock: () => new Date('2026-08-11T16:03:00.000Z'),
    verifyInstall: async () => { installVerified = true; },
  }), /remote wake master changed/u);
  assert.equal(installVerified, true);
  assert.equal(transport.posts.length, 0);
  transport.resolveRef = async () => WAKE_HEAD;
  const result = await appendTerminalReceipt({
    transport,
    config: installConfig(issue),
    taskDigest: MAC_B_TASK,
    status: 'DONE',
    code: null,
    apply: true,
    clock: () => new Date('2026-08-11T16:03:00.000Z'),
    verifyInstall: async () => {},
  });
  assert.equal(result.receipt.status, 'DONE');
});
