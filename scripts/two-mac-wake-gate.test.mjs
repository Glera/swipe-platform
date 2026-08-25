import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  composeControlWakeComment,
  createControlWake,
  createMachineBinding,
  createMachineHold,
  encodeMachineBindingMarker,
  encodeMachineHoldMarker,
  sha256,
} from './two-mac-bridge-contract.mjs';
import {
  WAKE_GATE_CONFIG_SCHEMA,
  addBoundedUnique,
  atomicWriteJson,
  assertExactBoundSession,
  compactGitHubComment,
  createHeadlessOwnerReceipt,
  fetchCompactComments,
  initialWakeGateState,
  markDispatchStarted,
  markDispatchSucceeded,
  markDispatchUnknown,
  observeWakeGate,
  preparePending,
  readHeadlessOwnerReceipt,
  readWakeGateConfig,
  readWakeGateState,
  rotationDue,
  taskDigestForSession,
  validateWakeGateConfig,
  validateWakeGateState,
  wakePrompt,
} from './two-mac-wake-gate-core.mjs';
import {
  bootstrapMachine,
  scanControlIssueWakes,
} from './two-mac-bridge.mjs';
import {
  parseArgs,
  runWakeGate,
  writeHeadlessOwnerReceipt,
} from './two-mac-wake-gate.mjs';

const A_SESSION = '019fb1a2-9d68-7c63-9bb4-84c3154fe353';
const B_SESSION = '019fb1a2-1111-7222-8333-84c3154fe353';
const C_SESSION = '019fb1a2-2222-7333-8444-84c3154fe353';
const D_SESSION = '019fb1a2-3333-7444-8555-84c3154fe353';
const A_TASK = taskDigestForSession(A_SESSION);
const B_TASK = taskDigestForSession(B_SESSION);
const C_TASK = taskDigestForSession(C_SESSION);
const D_TASK = taskDigestForSession(D_SESSION);
const HEAD = 'a'.repeat(40);
const CLOCK = () => new Date('2026-08-25T12:00:00.000Z');

function config(root, overrides = {}) {
  return {
    schema: WAKE_GATE_CONFIG_SCHEMA,
    machine: 'mac-a',
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    enabled: true,
    ghExecutable: '/usr/local/bin/gh',
    codexExecutable: '/Applications/ChatGPT.app/Contents/Resources/codex',
    codexHome: path.join(root, 'codex-home'),
    codexSessionId: A_SESSION,
    metaCheckout: path.join(root, 'meta'),
    workspaceDir: path.join(root, 'workspace'),
    intakeDrainConfigPath: null,
    initialScannedCommentId: '0',
    initialConsumedWakeCommentId: '0',
    trustedCommentAuthorIds: ['28346276'],
    pageSize: 100,
    maxPages: 10,
    rotationCommentThreshold: 400,
    notificationTitle: 'P4G Two-Mac',
    ...overrides,
  };
}

function binding(machine, taskDigest, id) {
  return createMachineBinding({
    controlIssue: 94,
    repositoryId: '1305418803',
    machine,
    taskDigest,
    bridgeCommit: HEAD,
    registeredAt: `2026-08-25T11:00:0${id}.000Z`,
  });
}

function rawComment(id, body, overrides = {}) {
  return {
    id: Number(id),
    body,
    user: { id: 28346276 },
    html_url: `https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-${id}`,
    created_at: `2026-08-25T11:00:${String(id).padStart(2, '0')}.000Z`,
    updated_at: `2026-08-25T11:00:${String(id).padStart(2, '0')}.000Z`,
    ...overrides,
  };
}

function wakeComment({ id = 4, machine = 'mac-a', verdict = 'HANDOFF_READY', receipt = 'Exact work packet.' } = {}) {
  const wake = createControlWake({
    controlIssue: 94,
    parentCommentId: '3',
    assignedMachine: machine,
    targetTaskDigest: machine === 'mac-a' ? A_TASK : B_TASK,
    callbackTaskDigest: machine === 'mac-b' ? A_TASK : null,
    verdict,
    receiptBody: receipt,
    createdAt: '2026-08-25T11:00:04.000Z',
    lineage: {
      ticketIssue: 151,
      lineageId: 'lin_1234567890abcdef',
      predecessorWakeId: null,
      supersedesWakeIds: [],
    },
  });
  return { wake, raw: rawComment(id, composeControlWakeComment(receipt, wake)) };
}

function rawControlComments(extra = []) {
  return [
    rawComment(1, encodeMachineBindingMarker(binding('mac-a', A_TASK, 1))),
    rawComment(2, encodeMachineBindingMarker(binding('mac-b', B_TASK, 2))),
    rawComment(3, 'Exact parent receipt.'),
    ...extra,
  ];
}

function bootstrapTransport(initialComments) {
  const issue = {
    number: 94,
    body: 'Phase 0 control',
    comments: structuredClone(initialComments),
  };
  return {
    async resolveRef() { return HEAD; },
    async getRepositoryId() { return '1305418803'; },
    async getIssue() { return structuredClone(issue); },
    async postComment(repo, issueNumber, body) {
      const id = String(issue.comments.length + 1);
      issue.comments.push({
        id,
        body,
        htmlUrl: `https://github.example/comments/${id}`,
        createdAt: `2026-08-25T11:00:${id.padStart(2, '0')}.000Z`,
      });
      return { id };
    },
  };
}

function compact(raw, scanned = '0') {
  return raw.map((comment) => compactGitHubComment(comment, scanned));
}

function tempConfig(overrides = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'p4g-wake-gate-'));
  mkdirSync(path.join(root, 'codex-home', 'thread-writer-locks'), { recursive: true });
  mkdirSync(path.join(root, 'meta'), { recursive: true });
  mkdirSync(path.join(root, 'workspace'), { recursive: true });
  const value = config(root, overrides);
  writeFileSync(path.join(root, 'codex-home', 'thread-writer-locks', `${value.codexSessionId}.lock`), '');
  const configPath = path.join(root, 'config.json');
  writeFileSync(configPath, `${JSON.stringify(value)}\n`, { mode: 0o600 });
  chmodSync(configPath, 0o600);
  const fixture = { root, config: value, configPath };
  writeExactHeadlessOwnerReceipt(fixture);
  return fixture;
}

function writeExactHeadlessOwnerReceipt(fixture, overrides = {}) {
  const ownerConfig = overrides.config ?? fixture.config;
  const ownerBinding = overrides.binding ?? binding(
    ownerConfig.machine,
    taskDigestForSession(ownerConfig.codexSessionId),
    ownerConfig.machine === 'mac-a' ? 1 : 2,
  );
  const receipt = createHeadlessOwnerReceipt({
    config: ownerConfig,
    binding: ownerBinding,
    localBridgeCommit: HEAD,
    createdAt: '2026-08-25T11:30:00.000Z',
  });
  const receiptPath = path.join(fixture.root, 'headless-owner-receipt.v1.json');
  atomicWriteJson(receiptPath, receipt);
  return { receipt, receiptPath };
}

test('config is exact, local-only and mode 0600', () => {
  const { root, config: value, configPath } = tempConfig();
  try {
    assert.deepEqual(readWakeGateConfig(configPath), value);
    chmodSync(configPath, 0o644);
    assert.throws(() => readWakeGateConfig(configPath), /mode 0600/u);
    assert.throws(
      () => validateWakeGateConfig({ ...value, taskDigest: A_TASK }),
      /unexpected fields/u,
    );
    assert.throws(
      () => validateWakeGateConfig({ ...value, codexSessionId: 'not-a-session' }),
      /codexSessionId/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('headless owner receipt is mode 0600 and bound to exact config and binding', () => {
  const fixture = tempConfig();
  try {
    const exactBinding = binding('mac-a', A_TASK, 1);
    const { receipt, receiptPath } = writeExactHeadlessOwnerReceipt(fixture, {
      binding: exactBinding,
    });
    assert.deepEqual(readHeadlessOwnerReceipt(receiptPath, {
      config: fixture.config,
      binding: exactBinding,
      localBridgeCommit: HEAD,
    }), receipt);
    chmodSync(receiptPath, 0o644);
    assert.throws(
      () => readHeadlessOwnerReceipt(receiptPath, {
        config: fixture.config, binding: exactBinding, localBridgeCommit: HEAD,
      }),
      /mode 0600/u,
    );
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('headless owner receipt writer is dry-run by default and writes once on apply', async () => {
  const fixture = tempConfig();
  const calls = [];
  rmSync(path.join(
    fixture.config.codexHome,
    'thread-writer-locks',
    `${fixture.config.codexSessionId}.lock`,
  ), { force: true });
  rmSync(path.join(fixture.root, 'headless-owner-receipt.v1.json'), { force: true });
  try {
    const options = {
      configPath: fixture.configPath,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments() : []),
    };
    const dryRun = await writeHeadlessOwnerReceipt({ ...options, apply: false });
    assert.equal(dryRun.action, 'would_write_headless_owner_receipt');
    const receiptPath = path.join(fixture.root, 'headless-owner-receipt.v1.json');
    assert.equal(existsSync(receiptPath), false);
    const applied = await writeHeadlessOwnerReceipt({ ...options, apply: true });
    assert.equal(applied.action, 'headless_owner_receipt_written');
    assert.equal(statSync(receiptPath).mode & 0o777, 0o600);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('headless owner receipt writer refuses a session with a live writer-lock identity', async () => {
  const fixture = tempConfig();
  rmSync(path.join(fixture.root, 'headless-owner-receipt.v1.json'), { force: true });
  try {
    await assert.rejects(
      writeHeadlessOwnerReceipt({
        configPath: fixture.configPath,
        apply: true,
        now: CLOCK,
        run: runner({ calls: [], busy: true }),
        listPage: async ({ page }) => (page === 1 ? rawControlComments() : []),
      }),
      /requires an idle headless session/u,
    );
    assert.equal(existsSync(path.join(fixture.root, 'headless-owner-receipt.v1.json')), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('compact pagination retains bridge markers and only unread prose', async () => {
  const first = rawControlComments([wakeComment().raw]);
  const calls = [];
  const fetched = await fetchCompactComments({
    listPage: async ({ page, since }) => {
      calls.push({ page, since });
      return page === 1 ? first : [];
    },
    existing: [],
    lastFetchedAt: null,
    lastScannedCommentId: '3',
    pageSize: 4,
    maxPages: 2,
  });
  assert.equal(fetched.comments.length, 4);
  assert.match(fetched.comments[0].body, /machine-binding/u);
  assert.equal(fetched.comments[2].body, '');
  assert.match(fetched.comments[3].body, /control-wake/u);
  assert.deepEqual(calls, [{ page: 1, since: null }, { page: 2, since: null }]);
  const oversize = compactGitHubComment(rawComment(5, 'x'.repeat(128 * 1024 + 1)), '4');
  assert.equal(oversize.oversize, true);
  assert.equal(oversize.body, '');
});

test('pagination is fail-closed when its configured page bound is exhausted', async () => {
  await assert.rejects(
    fetchCompactComments({
      listPage: async () => [rawComment(1, 'one')],
      existing: [],
      lastFetchedAt: null,
      lastScannedCommentId: '0',
      pageSize: 1,
      maxPages: 1,
    }),
    /pagination exceeded/u,
  );
});

test('exact session digest, machine binding and bridge head are all required', () => {
  const { root, config: value } = tempConfig();
  try {
    const comments = compact(rawControlComments());
    assert.equal(
      assertExactBoundSession({ config: value, comments, localBridgeCommit: HEAD }).taskDigest,
      A_TASK,
    );
    assert.throws(
      () => assertExactBoundSession({
        config: { ...value, codexSessionId: B_SESSION }, comments, localBridgeCommit: HEAD,
      }),
      /exact active mac-a task binding/u,
    );
    assert.throws(
      () => assertExactBoundSession({ config: value, comments, localBridgeCommit: 'b'.repeat(40) }),
      /bridge binding/u,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('headless replacement accepts only the immediate held owner for queued FIFO work', () => {
  const { root, config: value } = tempConfig({ codexSessionId: B_SESSION });
  try {
    const stale = createMachineBinding({
      controlIssue: 94,
      repositoryId: '1305418803',
      machine: 'mac-a',
      taskDigest: A_TASK,
      bridgeCommit: HEAD,
      registeredAt: '2026-08-25T11:00:01.000Z',
    });
    const hold = createMachineHold({ binding: stale, heldAt: '2026-08-25T11:00:03.000Z' });
    const replacement = createMachineBinding({
      ...stale,
      taskDigest: B_TASK,
      registeredAt: '2026-08-25T11:00:02.000Z',
    });
    const wake = createControlWake({
      controlIssue: 94,
      parentCommentId: '4',
      assignedMachine: 'mac-a',
      targetTaskDigest: A_TASK,
      callbackTaskDigest: null,
      verdict: 'HANDOFF_READY',
      receiptBody: 'Queued before the owner replacement.',
      createdAt: '2026-08-25T11:00:05.000Z',
      lineage: {
        ticketIssue: 151,
        lineageId: 'lin_1234567890abcdef',
        predecessorWakeId: null,
        supersedesWakeIds: [],
      },
    });
    const comments = compact([
      rawComment(1, encodeMachineBindingMarker(stale)),
      rawComment(2, encodeMachineHoldMarker(hold)),
      rawComment(3, encodeMachineBindingMarker(replacement)),
      rawComment(4, 'Exact parent receipt.'),
      rawComment(5, composeControlWakeComment('Queued before the owner replacement.', wake)),
    ]);
    const identity = assertExactBoundSession({ config: value, comments, localBridgeCommit: HEAD });
    assert.deepEqual(identity.acceptedTaskDigests, [B_TASK, A_TASK]);
    const observed = observeWakeGate({
      config: value,
      state: initialWakeGateState('mac-a', {
        lastScannedCommentId: '4', lastConsumedWakeCommentId: '4',
      }),
      comments,
      localBridgeCommit: HEAD,
      now: CLOCK,
    });
    assert.equal(observed.kind, 'dispatch');
    assert.equal(observed.scan.nextWake.wake.wakeId, wake.wakeId);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Mac B carries one queued wake across bootstrap-produced target and callback replacement', async () => {
  const { root, config: value } = tempConfig({ machine: 'mac-b', codexSessionId: D_SESSION });
  try {
    const staleA = createMachineBinding({
      controlIssue: 94, repositoryId: '1305418803', machine: 'mac-a',
      taskDigest: A_TASK, bridgeCommit: HEAD, registeredAt: '2026-08-25T11:00:01.000Z',
    });
    const staleB = createMachineBinding({
      controlIssue: 94, repositoryId: '1305418803', machine: 'mac-b',
      taskDigest: C_TASK, bridgeCommit: HEAD, registeredAt: '2026-08-25T11:00:02.000Z',
    });
    const transport = bootstrapTransport([
      { id: '1', body: encodeMachineBindingMarker(staleA) },
      { id: '2', body: encodeMachineBindingMarker(staleB) },
    ]);
    await bootstrapMachine({
      transport, repo: 'Glera/p4g-workspace-meta', controlIssue: 94,
      machine: 'mac-a', taskDigest: B_TASK, bridgeCommit: HEAD,
      supersedeBindingDigest: staleA.bindingDigest, replaceOwnerTask: true, apply: true,
      clock: () => new Date('2026-08-25T11:00:03.000Z'),
    });
    await bootstrapMachine({
      transport, repo: 'Glera/p4g-workspace-meta', controlIssue: 94,
      machine: 'mac-b', taskDigest: D_TASK, bridgeCommit: HEAD,
      supersedeBindingDigest: staleB.bindingDigest, replaceOwnerTask: true, apply: true,
      clock: () => new Date('2026-08-25T11:00:05.000Z'),
    });
    const wake = createControlWake({
      controlIssue: 94,
      parentCommentId: '7',
      assignedMachine: 'mac-b',
      targetTaskDigest: C_TASK,
      callbackTaskDigest: A_TASK,
      verdict: 'HANDOFF_READY',
      receiptBody: 'Exact queued Mac B work.',
      createdAt: '2026-08-25T11:00:08.000Z',
      lineage: {
        ticketIssue: 151,
        lineageId: 'lin_1234567890abcdef',
        predecessorWakeId: null,
        supersedesWakeIds: [],
      },
    });
    await transport.postComment(null, 94, 'Exact parent receipt.');
    await transport.postComment(
      null, 94, composeControlWakeComment('Exact queued Mac B work.', wake),
    );
    const cliScan = await scanControlIssueWakes({
      transport,
      repo: 'Glera/p4g-workspace-meta',
      controlIssue: 94,
      machine: 'mac-b',
      lastScannedCommentId: '7',
      lastConsumedWakeCommentId: '7',
    });
    assert.equal(cliScan.nextWake.wake.wakeId, wake.wakeId);
    const issue = await transport.getIssue();
    const comments = compact(issue.comments.map(
      (comment) => rawComment(comment.id, comment.body),
    ));
    const identity = assertExactBoundSession({ config: value, comments, localBridgeCommit: HEAD });
    assert.deepEqual(identity.acceptedTaskDigests, [D_TASK, C_TASK]);
    assert.deepEqual(identity.acceptedCallbackTaskDigests, [B_TASK, A_TASK]);
    const observed = observeWakeGate({
      config: value,
      state: initialWakeGateState('mac-b', {
        lastScannedCommentId: '7', lastConsumedWakeCommentId: '7',
      }),
      comments,
      localBridgeCommit: HEAD,
      now: CLOCK,
    });
    assert.equal(observed.kind, 'dispatch');
    assert.equal(observed.scan.nextWake.wake.wakeId, wake.wakeId);
    assert.equal(observed.scan.nextWake.wake.wakeId, cliScan.nextWake.wake.wakeId);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('one actionable wake becomes one immutable local payload', () => {
  const { root, config: value } = tempConfig();
  try {
    const item = wakeComment();
    const comments = compact(rawControlComments([item.raw]));
    const state = initialWakeGateState('mac-a');
    const observed = observeWakeGate({ config: value, state, comments, localBridgeCommit: HEAD, now: CLOCK });
    assert.equal(observed.kind, 'dispatch');
    assert.equal(observed.scan.pendingWakeCount, 1);
    const prepared = preparePending({
      config: value,
      nextWake: observed.scan.nextWake,
      dataRoot: root,
      now: CLOCK,
    });
    const bytes = readFileSync(prepared.pending.payloadPath);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), prepared.pending.payloadSha256);
    assert.equal(sha256(prepared.prompt), prepared.pending.promptSha256);
    assert.match(prepared.prompt, new RegExp(prepared.pending.payloadSha256, 'u'));
    assert.doesNotMatch(prepared.prompt, /Exact work packet/u);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('started and unknown dispatches cannot be silently retried', () => {
  const { root, config: value } = tempConfig();
  try {
    const item = wakeComment();
    const comments = compact(rawControlComments([item.raw]));
    const observed = observeWakeGate({
      config: value,
      state: initialWakeGateState('mac-a'),
      comments,
      localBridgeCommit: HEAD,
      now: CLOCK,
    });
    const prepared = preparePending({ config: value, nextWake: observed.scan.nextWake, dataRoot: root, now: CLOCK });
    let state = { ...initialWakeGateState('mac-a'), pending: prepared.pending };
    state = markDispatchStarted(state, CLOCK);
    assert.equal(state.pending.status, 'started');
    const unknown = markDispatchUnknown(state);
    assert.equal(unknown.pending.status, 'outcome_unknown');
    assert.deepEqual(unknown.handledWakeIds, []);
    const succeeded = markDispatchSucceeded(state);
    assert.equal(succeeded.pending, null);
    assert.equal(succeeded.lastConsumedWakeCommentId, '4');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

function runner({
  head = HEAD,
  codexStatus = 0,
  busy = false,
  desktopOwner = false,
  notificationStatus = 0,
  calls,
}) {
  return (executable, args) => {
    calls.push({ executable, args });
    if (executable === '/usr/bin/git') return { status: 0, stdout: `${head}\n`, stderr: '' };
    if (executable === '/usr/sbin/lsof') {
      return busy
        ? { status: 0, stdout: '123\n', stderr: '' }
        : { status: 1, stdout: '', stderr: '' };
    }
    if (executable === '/bin/ps') {
      return {
        status: 0,
        stdout: desktopOwner
          ? '/Applications/ChatGPT.app/Contents/Resources/codex app-server\n'
          : `/Applications/ChatGPT.app/Contents/Resources/codex exec resume --json ${A_SESSION} -\n`,
        stderr: '',
      };
    }
    if (executable === '/usr/bin/osascript') {
      return { status: notificationStatus, stdout: '', stderr: '' };
    }
    if (executable.endsWith('/codex')) {
      return args[0] === '--version'
        ? { status: 0, stdout: 'codex-cli 0.148.0\n', stderr: '' }
        : { status: codexStatus, stdout: '', stderr: '' };
    }
    return { status: 0, stdout: '', stderr: '' };
  };
}

test('dry-run performs no local state write and never calls Codex', async () => {
  const fixture = tempConfig();
  const calls = [];
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: false,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(result.action, 'would_dispatch');
    assert.equal(result.headlessOwnerReceipt, 'exact');
    assert.equal(result.wakeId, item.wake.wakeId);
    assert.equal(calls.some((call) => call.executable.endsWith('/codex')), false);
    assert.equal(readWakeGateState(path.join(fixture.root, 'wake-gate-state.v1.json'), 'mac-a').lastScannedCommentId, '0');
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('busy owner leaves one durable queued wake and spends zero AI calls', async () => {
  const fixture = tempConfig();
  const calls = [];
  const lockPath = path.join(fixture.config.codexHome, 'thread-writer-locks', `${A_SESSION}.lock`);
  writeFileSync(lockPath, '');
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, busy: true }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(result.action, 'owner_busy');
    const state = readWakeGateState(path.join(fixture.root, 'wake-gate-state.v1.json'), 'mac-a');
    assert.equal(state.pending.status, 'queued');
    assert.equal(state.pending.wakeId, item.wake.wakeId);
    assert.equal(calls.some((call) => call.executable.endsWith('/codex')), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('Desktop-owned thread is durable attention instead of permanent owner_busy', async () => {
  const fixture = tempConfig();
  const calls = [];
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, busy: true, desktopOwner: true }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(result.action, 'attention');
    assert.equal(result.attention.code, 'headless_owner_loaded_in_desktop');
    assert.equal(calls.some(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ), false);
    const state = readWakeGateState(path.join(fixture.root, 'wake-gate-state.v1.json'), 'mac-a');
    assert.equal(state.pending.status, 'queued');
    assert.equal(state.attention.code, 'headless_owner_loaded_in_desktop');
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('successful resume consumes exactly one wake and a second tick is idle', async () => {
  const fixture = tempConfig();
  const calls = [];
  const item = wakeComment();
  try {
    const first = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(first.action, 'dispatched');
    const second = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(second.action, 'idle');
    assert.equal(calls.filter(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ).length, 1);
    const state = readWakeGateState(path.join(fixture.root, 'wake-gate-state.v1.json'), 'mac-a');
    assert.equal(state.lastConsumedWakeCommentId, '4');
    assert.deepEqual(state.handledWakeIds, [item.wake.wakeId]);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('failed resume is outcome_unknown and the next tick never retries it', async () => {
  const fixture = tempConfig();
  const calls = [];
  const item = wakeComment();
  try {
    const first = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, codexStatus: 2 }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(first.action, 'resume_outcome_unknown');
    const second = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, codexStatus: 0 }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(second.action, 'blocked_outcome_unknown');
    assert.equal(calls.filter(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ).length, 1);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('missing writer lock without exact headless receipt is durable attention and spends zero AI', async () => {
  const fixture = tempConfig();
  const calls = [];
  const lockPath = path.join(
    fixture.config.codexHome,
    'thread-writer-locks',
    `${fixture.config.codexSessionId}.lock`,
  );
  rmSync(lockPath, { force: true });
  rmSync(path.join(fixture.root, 'headless-owner-receipt.v1.json'), { force: true });
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    assert.equal(result.action, 'attention');
    assert.equal(result.attention.code, 'headless_owner_receipt_invalid');
    assert.equal(calls.some(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ), false);
    const state = readWakeGateState(path.join(fixture.root, 'wake-gate-state.v1.json'), 'mac-a');
    assert.equal(state.attention.code, 'headless_owner_receipt_invalid');
    assert.equal(state.pending.status, 'queued');
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('orphaned unowned writer-lock cannot bypass a missing headless receipt', async () => {
  const fixture = tempConfig();
  const calls = [];
  rmSync(path.join(fixture.root, 'headless-owner-receipt.v1.json'), { force: true });
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    assert.equal(result.action, 'attention');
    assert.equal(result.attention.code, 'headless_owner_receipt_invalid');
    assert.equal(calls.some(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('dry-run reports an invalid headless receipt without local mutation or AI', async () => {
  const fixture = tempConfig();
  const calls = [];
  rmSync(path.join(fixture.root, 'headless-owner-receipt.v1.json'), { force: true });
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: false,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async () => rawControlComments([item.raw]),
    });
    assert.equal(result.action, 'would_dispatch');
    assert.equal(result.headlessOwnerReceipt, 'invalid');
    assert.equal(existsSync(path.join(fixture.root, 'wake-gate-state.v1.json')), false);
    assert.equal(calls.some(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('clean headless exit with absent writer lock and exact receipt resumes once', async () => {
  const fixture = tempConfig();
  const calls = [];
  const lockPath = path.join(
    fixture.config.codexHome,
    'thread-writer-locks',
    `${fixture.config.codexSessionId}.lock`,
  );
  rmSync(lockPath, { force: true });
  writeExactHeadlessOwnerReceipt(fixture);
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    assert.equal(result.action, 'dispatched');
    assert.equal(calls.filter(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ).length, 1);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('absent writer lock with stale receipt cannot resume', async () => {
  const fixture = tempConfig();
  const calls = [];
  const lockPath = path.join(
    fixture.config.codexHome,
    'thread-writer-locks',
    `${fixture.config.codexSessionId}.lock`,
  );
  rmSync(lockPath, { force: true });
  const staleConfig = { ...fixture.config, codexSessionId: C_SESSION };
  writeExactHeadlessOwnerReceipt(fixture, {
    config: staleConfig,
    binding: binding('mac-a', C_TASK, 1),
  });
  try {
    const item = wakeComment();
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    assert.equal(result.action, 'attention');
    assert.equal(result.attention.code, 'headless_owner_receipt_invalid');
    assert.equal(calls.some(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('binding drift persists attention and retries a failed local notification', async () => {
  const fixture = tempConfig();
  const calls = [];
  try {
    const first = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, head: 'b'.repeat(40), notificationStatus: 1 }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments() : []),
    });
    assert.equal(first.attention.code, 'binding_drift');
    const second = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, notificationStatus: 1 }),
      listPage: async () => assert.fail('blocked attention must not rescan GitHub'),
    });
    assert.equal(second.action, 'blocked_attention');
    assert.equal(calls.filter((call) => call.executable === '/usr/bin/osascript').length, 2);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('cleared recurring attention recreates its file and notifies again', async () => {
  const fixture = tempConfig();
  const calls = [];
  try {
    const first = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, head: 'b'.repeat(40) }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments() : []),
    });
    assert.equal(first.attention.code, 'binding_drift');
    const cleared = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      recovery: { clearAttention: '0', resolveOutcome: null, resolution: null },
      now: CLOCK,
      run: runner({ calls }),
      listPage: async () => assert.fail('local recovery must not scan'),
    });
    assert.equal(cleared.action, 'attention_cleared');
    const repeated = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, head: 'b'.repeat(40) }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments() : []),
    });
    assert.equal(repeated.attention.code, 'binding_drift');
    assert.equal(calls.filter((call) => call.executable === '/usr/bin/osascript').length, 2);
    const attention = JSON.parse(readFileSync(
      path.join(fixture.root, 'wake-gate-attention.v1.json'),
      'utf8',
    ));
    assert.equal(attention.attention.code, 'binding_drift');
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('single-flight lock is acquired before durable state is read', async () => {
  const fixture = tempConfig();
  mkdirSync(path.join(fixture.root, 'wake-gate.single-flight.lock'), { mode: 0o700 });
  writeFileSync(path.join(fixture.root, 'wake-gate-state.v1.json'), '{broken');
  try {
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls: [] }),
      listPage: async () => assert.fail('single-flight loser must not scan'),
    });
    assert.equal(result.action, 'single_flight_busy');
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('untrusted bridge marker author fails closed before dispatch', async () => {
  const fixture = tempConfig();
  const calls = [];
  const item = wakeComment();
  item.raw.user = { id: 999 };
  try {
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    assert.equal(result.action, 'attention');
    assert.equal(result.attention.code, 'untrusted_marker_author');
    assert.equal(calls.some(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('malformed targeted wake becomes durable attention, never an AI call', async () => {
  const fixture = tempConfig();
  const calls = [];
  const malformed = rawComment(
    4,
    'broken\n\n<!-- two-mac-bridge-control-wake:v1 payload=not-base64 -->',
  );
  try {
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([malformed]) : []),
    });
    assert.equal(result.action, 'attention');
    const state = readWakeGateState(path.join(fixture.root, 'wake-gate-state.v1.json'), 'mac-a');
    assert.notEqual(state.attention, null);
    assert.equal(calls.some(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ), false);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('full bounded reread detects disappeared and edited comments without since', async () => {
  const priorRaw = rawControlComments();
  const existing = compact(priorRaw);
  await assert.rejects(
    fetchCompactComments({
      listPage: async () => [],
      existing,
      lastFetchedAt: '2026-08-25T11:00:03.000Z',
      lastScannedCommentId: '3',
      pageSize: 100,
      maxPages: 2,
    }),
    /disappeared/u,
  );
  const edited = priorRaw.map((comment) => (
    comment.id === 1 ? { ...comment, updated_at: '2026-08-25T11:01:01.000Z' } : comment
  ));
  const calls = [];
  await assert.rejects(
    fetchCompactComments({
      listPage: async ({ page, since }) => {
        calls.push({ page, since });
        return page === 1 ? edited : [];
      },
      existing,
      lastFetchedAt: '2026-08-25T11:00:03.000Z',
      lastScannedCommentId: '3',
      pageSize: 100,
      maxPages: 2,
    }),
    /changed/u,
  );
  assert.equal(calls[0].since, null);
});

test('operator recovery is identity-bound and outcome_unknown is not deduped', async () => {
  const fixture = tempConfig();
  const calls = [];
  const item = wakeComment();
  try {
    await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, codexStatus: 2 }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    const recovered = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      recovery: {
        clearAttention: null,
        resolveOutcome: item.wake.wakeId,
        resolution: 'not-started',
      },
      now: CLOCK,
      run: runner({ calls }),
      listPage: async () => assert.fail('local recovery must not scan'),
    });
    assert.equal(recovered.action, 'outcome_resolved_not_started');
    const queued = readWakeGateState(path.join(fixture.root, 'wake-gate-state.v1.json'), 'mac-a');
    assert.equal(queued.pending.status, 'queued');
    assert.deepEqual(queued.handledWakeIds, []);
    const repeatedFailure = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls, codexStatus: 2 }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    assert.equal(repeatedFailure.action, 'resume_outcome_unknown');
    assert.equal(calls.filter((call) => call.executable === '/usr/bin/osascript').length, 2);
    const repeatedState = readWakeGateState(
      path.join(fixture.root, 'wake-gate-state.v1.json'),
      'mac-a',
    );
    assert.equal(repeatedState.pending.status, 'outcome_unknown');
    assert.deepEqual(repeatedState.handledWakeIds, []);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('Mac B run-level callback binding dispatches only its exact wake', async () => {
  const fixture = tempConfig({ machine: 'mac-b', codexSessionId: B_SESSION });
  const calls = [];
  const item = wakeComment({ machine: 'mac-b' });
  try {
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: true,
      now: CLOCK,
      run: runner({ calls }),
      listPage: async ({ page }) => (page === 1 ? rawControlComments([item.raw]) : []),
    });
    assert.equal(result.action, 'dispatched');
    assert.equal(result.wakeId, item.wake.wakeId);
    assert.equal(calls.filter(
      (call) => call.executable.endsWith('/codex') && call.args[0] === 'exec',
    ).length, 1);
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('threshold-crossing actionable wake dispatches before rotation blocks idle', async () => {
  const fixture = tempConfig({ rotationCommentThreshold: 100 });
  const prose = Array.from({ length: 97 }, (_, index) => rawComment(index + 3, `prose-${index}`, {
    created_at: `2026-08-25T11:01:${String(index % 60).padStart(2, '0')}.000Z`,
    updated_at: `2026-08-25T11:01:${String(index % 60).padStart(2, '0')}.000Z`,
  }));
  const item = wakeComment({ id: 100 });
  item.raw.created_at = '2026-08-25T11:02:00.000Z';
  item.raw.updated_at = '2026-08-25T11:02:00.000Z';
  const comments = [
    rawComment(1, encodeMachineBindingMarker(binding('mac-a', A_TASK, 1))),
    rawComment(2, encodeMachineBindingMarker(binding('mac-b', B_TASK, 2))),
    ...prose,
    item.raw,
  ];
  try {
    const result = await runWakeGate({
      configPath: fixture.configPath,
      apply: false,
      now: CLOCK,
      run: runner({ calls: [] }),
      listPage: async ({ page }) => (page === 1 ? comments : []),
    });
    assert.equal(comments.length, 100);
    assert.equal(result.action, 'would_dispatch');
  } finally {
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test('recovery CLI requires --run and exact identities', () => {
  assert.throws(
    () => parseArgs(['--config', '/tmp/config', '--resolve-outcome', `wake_${'a'.repeat(64)}`, '--resolution', 'consumed']),
    /requires --run/u,
  );
  assert.deepEqual(
    parseArgs([
      '--config', '/tmp/config', '--run', '--resolve-outcome', `wake_${'a'.repeat(64)}`,
      '--resolution', 'not-started',
    ]).resolution,
    'not-started',
  );
  assert.equal(parseArgs([
    '--config', '/tmp/config', '--write-headless-owner-receipt',
  ]).writeHeadlessOwnerReceipt, true);
  assert.throws(
    () => parseArgs([
      '--config', '/tmp/config', '--run', '--write-headless-owner-receipt',
      '--clear-attention', '1',
    ]),
    /cannot be combined/u,
  );
});

test('A→B→A routing wakes only the exact bound owner at each step', () => {
  const { root, config: aConfig } = tempConfig();
  try {
    const bConfig = config(root, { machine: 'mac-b', codexSessionId: B_SESSION });
    const toB = wakeComment({ id: 4, machine: 'mac-b', receipt: 'Mac B content work.' });
    const commentsB = compact(rawControlComments([toB.raw]));
    assert.equal(observeWakeGate({
      config: aConfig,
      state: initialWakeGateState('mac-a'),
      comments: commentsB,
      localBridgeCommit: HEAD,
      now: CLOCK,
    }).kind, 'idle');
    assert.equal(observeWakeGate({
      config: bConfig,
      state: initialWakeGateState('mac-b'),
      comments: commentsB,
      localBridgeCommit: HEAD,
      now: CLOCK,
    }).kind, 'dispatch');

    const toA = wakeComment({ id: 5, machine: 'mac-a', receipt: 'Mac A callback work.' });
    const commentsA = compact(rawControlComments([toB.raw, toA.raw]));
    const bAfter = { ...initialWakeGateState('mac-b'), lastScannedCommentId: '4', lastConsumedWakeCommentId: '4' };
    assert.equal(observeWakeGate({
      config: bConfig, state: bAfter, comments: commentsA, localBridgeCommit: HEAD, now: CLOCK,
    }).kind, 'idle');
    assert.equal(observeWakeGate({
      config: aConfig, state: initialWakeGateState('mac-a'), comments: commentsA,
      localBridgeCommit: HEAD, now: CLOCK,
    }).kind, 'dispatch');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rotation threshold is deterministic and notification keys stay bounded', () => {
  const { root, config: value } = tempConfig({ rotationCommentThreshold: 100 });
  try {
    assert.equal(rotationDue(value, Array.from({ length: 99 })), false);
    assert.equal(rotationDue(value, Array.from({ length: 100 })), true);
    let keys = [];
    for (let index = 0; index < 140; index += 1) keys = addBoundedUnique(keys, `key-${index}`);
    assert.equal(keys.length, 128);
    assert.equal(keys.at(0), 'key-12');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('state refuses cursor inversion and unknown fields', () => {
  const state = initialWakeGateState('mac-a');
  assert.throws(
    () => validateWakeGateState({ ...state, lastScannedCommentId: '3', lastConsumedWakeCommentId: '4' }, 'mac-a'),
    /consumed cursor exceeds/u,
  );
  assert.throws(
    () => validateWakeGateState({ ...state, retryCount: 0 }, 'mac-a'),
    /unexpected fields/u,
  );
});

test('wake prompt contains only local payload identity, not receipt text', () => {
  const prompt = wakePrompt('/tmp/p4g/pending/wake.json', 'f'.repeat(64));
  assert.match(prompt, /process exactly one durable control wake/u);
  assert.match(prompt, /f{64}/u);
  assert.doesNotMatch(prompt, /retry|fallback/iu);
});
