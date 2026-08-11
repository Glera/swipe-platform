import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMachineBinding,
  createEvent,
  encodeEventMarker,
  encodeMachineBindingMarker,
  encodeTicketMarker,
  sha256,
} from './two-mac-bridge-contract.mjs';
import {
  bindGeneratorIssue,
  bindPlatformIssue,
  bootstrapMachine,
  advanceIssue,
  claimIssue,
  deriveGeneratorTicket,
  derivePlatformTicket,
  deriveTaskDigest,
  parseArgs,
  planWake,
  projectIssue,
  runCli,
  selectWakes,
} from './two-mac-bridge.mjs';

const THREAD = '019fb1a2-9d68-7c63-9bb4-84c3154fe353';
const B_THREAD = '019fb1a2-1111-7222-8333-84c3154fe353';
const A_TASK = sha256(`codex-thread-v1\0${THREAD}`);
const B_TASK = sha256(`codex-thread-v1\0${B_THREAD}`);
const HEAD = 'd'.repeat(40);

function ticket(overrides = {}) {
  return {
    schema: 'two-mac.bridge-ticket.v1',
    ticketId: 'meta-91/two-dots-434c',
    issueNumber: 91,
    repositoryId: '123456789',
    sourceKind: 'mechanic',
    requestId: '434c895a-57ff-4f99-a888-bdbba5ffe378',
    requestHash: 'c'.repeat(64),
    mutationId: null,
    parentRequestId: '6c267c01-1fc5-4137-a2c6-e81142d67972',
    sourceId: 'orthogonal-link-v1',
    sourceRepository: 'Glera/playables',
    sourceCommit: HEAD,
    sourceTree: 'e'.repeat(40),
    assignedMachine: 'mac-b',
    authority: 'content-factory',
    targetTaskDigest: B_TASK,
    instruction: 'Exact Two Dots rematerialization handoff.',
    createdAt: '2026-08-11T09:00:00.000Z',
    ...overrides,
  };
}

function queue(value = ticket()) {
  return createEvent({
    ticket: value,
    state: 'QUEUED',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'queue-two-dots',
    occurredAt: '2026-08-11T09:00:00.000Z',
  });
}

function issue(value = ticket(), events = [queue(value)]) {
  return {
    number: value.issueNumber,
    body: `contract request ${value.requestId}\n${encodeTicketMarker(value)}`,
    htmlUrl: `https://github.com/Glera/p4g-workspace-meta/issues/${value.issueNumber}`,
    updatedAt: '2026-08-11T09:00:00Z',
    comments: events.map((event, index) => ({
      id: String(index + 1),
      body: encodeEventMarker(event, value),
      htmlUrl: `https://github.example/comments/${index + 1}`,
      createdAt: event.occurredAt,
    })),
  };
}

function memoryTransport(initialIssue, { onPost = null } = {}) {
  let current = structuredClone(initialIssue);
  const posts = [];
  let reads = 0;
  return {
    posts,
    get reads() { return reads; },
    async getRepositoryId() { return '123456789'; },
    async listOpenIssues() { return [{ ...current, comments: undefined }]; },
    async getIssue() { reads += 1; return structuredClone(current); },
    async postComment(repo, issueNumber, body) {
      posts.push({ repo, issueNumber, body });
      current.comments.push({
        id: String(current.comments.length + 1), body,
        htmlUrl: `https://github.example/comments/${current.comments.length + 1}`,
        createdAt: '2026-08-11T09:00:01Z',
      });
      if (onPost) current = await onPost({ current, posts }) ?? current;
      return { id: current.comments.length };
    },
    async resolveRef() { return HEAD; },
  };
}

function multiIssueTransport(initialIssues) {
  const issues = new Map(initialIssues.map((value) => [value.number, structuredClone(value)]));
  const posts = [];
  return {
    posts,
    async getRepositoryId() { return '123456789'; },
    async listOpenIssues() {
      return [...issues.values()].map((value) => ({ ...structuredClone(value), comments: undefined }));
    },
    async getIssue(repo, issueNumber) {
      const value = issues.get(issueNumber);
      if (!value) throw new Error(`missing Issue ${issueNumber}`);
      return structuredClone(value);
    },
    async searchIssues(repo, needle) {
      return [...issues.values()].filter((value) => [
        value.body, ...value.comments.map((comment) => comment.body),
      ].join('\n').includes(needle)).map((value) => ({
        number: value.number, body: value.body, htmlUrl: value.htmlUrl,
        updatedAt: value.updatedAt,
      }));
    },
    async postComment(repo, issueNumber, body) {
      const value = issues.get(issueNumber);
      posts.push({ repo, issueNumber, body });
      value.comments.push({
        id: String(value.comments.length + 1), body,
        htmlUrl: `https://github.example/issues/${issueNumber}/comments/${value.comments.length + 1}`,
        createdAt: '2026-08-11T09:00:01Z',
      });
      return { id: value.comments.length };
    },
    async resolveRef() { return HEAD; },
  };
}

function controlIssue(bindings = []) {
  return {
    number: 94,
    body: 'Phase 0 control',
    htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/94',
    updatedAt: '2026-08-11T09:00:00Z',
    comments: bindings.map((binding, index) => ({
      id: `binding-${index}`,
      body: encodeMachineBindingMarker(binding),
      htmlUrl: `https://github.example/binding-${index}`,
      createdAt: binding.registeredAt,
    })),
  };
}

function machineBinding(machine, taskDigest) {
  return createMachineBinding({
    controlIssue: 94,
    repositoryId: '123456789',
    machine,
    taskDigest,
    bridgeCommit: HEAD,
    registeredAt: '2026-08-11T09:00:00.000Z',
  });
}

function generatorSnapshot(requestId = '434c895a-57ff-4f99-a888-bdbba5ffe378') {
  return {
    schema: 'lab.playable-release-list.v1',
    playableReworks: [{
      requestId,
      requestHash: 'c'.repeat(64),
      createdAt: '2026-08-10T07:34:05.686Z',
      request: {
        schema: 'feed.playable-rework.request.v1',
        mutationId: 'e3251fe9-5828-4183-a9bf-68aa023c6b8f',
        playableId: 'orthogonal-link-v1-swipe',
        instruction: 'Fix the exact tutorial hand and board-frame behavior.',
        runtime: { sourceCommit: 'a'.repeat(40) },
      },
    }],
    agentTasks: [{
      requestId,
      state: 'source_ready',
      sourceId: 'orthogonal-link-v1',
      sourceCommit: 'b'.repeat(40),
    }],
    releases: [{
      releaseId: '6c267c01-1fc5-4137-a2c6-e81142d67972',
      reworkRequestId: requestId,
    }],
  };
}

function platformIssue(number = 95) {
  const requestId = '11111111-2222-4333-8444-555555555555';
  return {
    number,
    body: [
      `<!-- p4g-development-ticket:v1 sourceKind=platform sourceRequestId=${requestId} sourceRequestHash=${'9'.repeat(64)} -->`,
      '<!-- schema: development-ticket.v1 -->',
      '',
      '## Request identity',
      '',
      '- Requested at: `2026-08-11T10:00:00.000Z`',
      '',
      '## Original request',
      '',
      '> Исправить &lt;точный&gt; экран &amp; сохранить lifecycle.',
      '',
      '## Captured context',
      '',
      `- Client/platform build SHA: \`server-verified ${'8'.repeat(40)}\``,
    ].join('\n'),
    htmlUrl: `https://github.com/Glera/p4g-workspace-meta/issues/${number}`,
    updatedAt: '2026-08-11T10:00:00Z',
    comments: [],
  };
}

test('CLI is dry-run by default and never accepts a task digest or command payload', () => {
  assert.equal(parseArgs(['claim', '--issue', '91', '--machine', 'mac-b']).apply, false);
  assert.throws(
    () => parseArgs(['claim', '--issue', '91', '--machine', 'mac-b', '--task-digest', B_TASK]),
    /unknown option/u,
  );
  assert.throws(
    () => parseArgs(['claim', '--issue', '91', '--machine', 'mac-b', '--command', 'rm']),
    /unknown option/u,
  );
  assert.throws(
    () => parseArgs(['project', '--issue', '91.5']),
    /strict integer/u,
  );
  assert.throws(
    () => parseArgs(['project', '--issue', '91', '--repo', 'Glera/other']),
    /allowlisted/u,
  );
});

test('task binding is derived locally and raw thread identity is absent', () => {
  assert.equal(deriveTaskDigest({ CODEX_THREAD_ID: B_THREAD }), B_TASK);
  assert.doesNotMatch(B_TASK, new RegExp(B_THREAD.slice(0, 8), 'u'));
  assert.throws(() => deriveTaskDigest({}), /CODEX_THREAD_ID is required/u);
});

test('bootstrap is exact-master bound, replay-safe, and conflicting task fails closed', async () => {
  const transport = memoryTransport(controlIssue());
  const first = await bootstrapMachine({
    transport, repo: 'Glera/p4g-workspace-meta', controlIssue: 94,
    machine: 'mac-b', taskDigest: B_TASK, bridgeCommit: HEAD, apply: true,
    clock: () => new Date('2026-08-11T09:00:00.000Z'),
  });
  assert.equal(first.status, 'BOOTSTRAPPED');
  assert.equal(transport.posts.length, 1);
  const replay = await bootstrapMachine({
    transport, repo: 'Glera/p4g-workspace-meta', controlIssue: 94,
    machine: 'mac-b', taskDigest: B_TASK, bridgeCommit: HEAD, apply: true,
  });
  assert.equal(replay.status, 'REUSE');
  assert.equal(transport.posts.length, 1);
  await assert.rejects(
    bootstrapMachine({
      transport, repo: 'Glera/p4g-workspace-meta', controlIssue: 94,
      machine: 'mac-b', taskDigest: A_TASK, bridgeCommit: HEAD, apply: true,
    }),
    /conflicting mac-b bootstrap/u,
  );
});

test('Generator adapter derives exact Two Dots and Smash parent lineage from server projection', () => {
  const twoDots = deriveGeneratorTicket({
    snapshot: generatorSnapshot(), issueNumber: 91, repositoryId: '123456789',
    requestId: '434c895a-57ff-4f99-a888-bdbba5ffe378', targetTaskDigest: B_TASK,
  });
  assert.equal(twoDots.parentRequestId, '6c267c01-1fc5-4137-a2c6-e81142d67972');
  assert.equal(twoDots.sourceCommit, 'b'.repeat(40));
  assert.equal(twoDots.mutationId, 'e3251fe9-5828-4183-a9bf-68aa023c6b8f');

  const requestId = '599bb964-f5f6-5fca-907b-0a3b31e97e68';
  const smash = generatorSnapshot(requestId);
  smash.playableReworks[0].request = {
    schema: 'feed.playable-release-successor.v1',
    requestId,
    mutationId: '44c48114-ec57-5466-a8ec-054adeed61e8',
    parentReleaseId: 'ab5e07b9-f129-4fc3-aa91-3880bb4f1df7',
    sourceId: 'smash-fest-v1',
    sourceCommit: 'a'.repeat(40),
    instruction: 'Keep only the exact fifth level.',
    createdAt: '2026-08-11T06:13:16.704Z',
  };
  smash.agentTasks[0] = { requestId, state: 'failed', sourceId: 'smash-fest-v1', sourceCommit: null };
  smash.releases = [{ releaseId: 'ab5e07b9-f129-4fc3-aa91-3880bb4f1df7' }];
  const bound = deriveGeneratorTicket({
    snapshot: smash, issueNumber: 82, repositoryId: '123456789',
    requestId, targetTaskDigest: B_TASK,
  });
  assert.equal(bound.parentRequestId, 'ab5e07b9-f129-4fc3-aa91-3880bb4f1df7');
  assert.equal(bound.sourceId, 'smash-fest-v1');
  assert.equal(bound.sourceCommit, 'a'.repeat(40));
});

test('Generator adapter fails closed on missing, duplicated, or parentless source truth', () => {
  const requestId = '434c895a-57ff-4f99-a888-bdbba5ffe378';
  const base = generatorSnapshot(requestId);
  assert.throws(() => deriveGeneratorTicket({
    snapshot: { ...base, agentTasks: [] }, issueNumber: 91,
    repositoryId: '123456789', requestId, targetTaskDigest: B_TASK,
  }), /has 0 records/u);
  assert.throws(() => deriveGeneratorTicket({
    snapshot: { ...base, playableReworks: [base.playableReworks[0], base.playableReworks[0]] },
    issueNumber: 91, repositoryId: '123456789', requestId, targetTaskDigest: B_TASK,
  }), /has 2 records/u);
  assert.throws(() => deriveGeneratorTicket({
    snapshot: { ...base, releases: [] }, issueNumber: 91,
    repositoryId: '123456789', requestId, targetTaskDigest: B_TASK,
  }), /parent release identity is missing/u);
});

test('bind-generator derives one durable ticket from server projection and replays without a second write', async () => {
  const bindings = [machineBinding('mac-a', A_TASK), machineBinding('mac-b', B_TASK)];
  const target = {
    number: 91,
    body: 'Existing Two Dots engineering Issue',
    htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/91',
    updatedAt: '2026-08-11T09:00:00Z',
    comments: [],
  };
  const transport = multiIssueTransport([controlIssue(bindings), target]);
  let fetchCount = 0;
  const fetchImpl = async () => {
    fetchCount += 1;
    return ({
    ok: true, status: 200, json: async () => generatorSnapshot(),
    });
  };
  const args = {
    transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 91,
    controlIssue: 94, requestId: '434c895a-57ff-4f99-a888-bdbba5ffe378',
    generatorUrl: 'http://127.0.0.1:4317/v1/playable-releases',
    taskDigest: A_TASK, bridgeCommit: HEAD, apply: true, fetchImpl,
    clock: () => new Date('2026-08-11T09:00:01.000Z'),
  };
  const first = await bindGeneratorIssue(args);
  assert.equal(first.status, 'BOUND');
  assert.equal(first.projection.state, 'QUEUED');
  assert.equal(transport.posts.length, 1);
  const replay = await bindGeneratorIssue(args);
  assert.equal(replay.status, 'REUSE');
  assert.equal(transport.posts.length, 1);
  assert.equal(fetchCount, 1, 'replay must not depend on a later Generator projection');
});

test('one Generator request cannot bind to a second Issue', async () => {
  const value = ticket();
  const bound = issue(value);
  const target = {
    number: 96, body: 'Another engineering Issue',
    htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/96',
    updatedAt: '2026-08-11T09:00:00Z', comments: [],
  };
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-a', A_TASK), machineBinding('mac-b', B_TASK)]),
    bound,
    target,
  ]);
  await assert.rejects(bindGeneratorIssue({
    transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 96,
    controlIssue: 94, requestId: value.requestId,
    generatorUrl: 'http://127.0.0.1:4317/v1/playable-releases',
    taskDigest: A_TASK, bridgeCommit: HEAD, apply: true,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => generatorSnapshot() }),
  }), /already bound to Issue #91/u);
  assert.equal(transport.posts.length, 0);
});

test('bind-generator forbids remote endpoints and waits for both exact machine bindings', async () => {
  assert.throws(() => parseArgs([
    'bind-generator', '--issue', '91', '--machine', 'mac-a',
    '--request-id', '434c895a-57ff-4f99-a888-bdbba5ffe378',
    '--generator-url', 'https://generator.example/v1/playable-releases',
  ]), /exact loopback/u);
  const transport = multiIssueTransport([controlIssue([machineBinding('mac-a', A_TASK)]), {
    number: 91, body: '', htmlUrl: 'https://github.example/issues/91',
    updatedAt: '2026-08-11T09:00:00Z', comments: [],
  }]);
  await assert.rejects(bindGeneratorIssue({
    transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 91,
    controlIssue: 94, requestId: '434c895a-57ff-4f99-a888-bdbba5ffe378',
    generatorUrl: 'http://127.0.0.1:4317/v1/playable-releases',
    taskDigest: A_TASK, bridgeCommit: HEAD, apply: false,
    fetchImpl: async () => ({ ok: true, status: 200, json: async () => generatorSnapshot() }),
  }), /exact mac-b bootstrap is required/u);
});

test('platform adapter derives the server-owned request without treating prose as a command', () => {
  const value = derivePlatformTicket({
    issue: platformIssue(), repositoryId: '123456789', targetTaskDigest: A_TASK,
  });
  assert.equal(value.sourceKind, 'platform');
  assert.equal(value.assignedMachine, 'mac-a');
  assert.equal(value.requestHash, '9'.repeat(64));
  assert.equal(value.instruction, 'Исправить <точный> экран & сохранить lifecycle.');
  assert.equal(value.sourceCommit, '8'.repeat(40));
});

test('bind-platform creates one queued marker after exact Mac A bootstrap and replays', async () => {
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-a', A_TASK)]),
    platformIssue(),
  ]);
  const args = {
    transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 95,
    controlIssue: 94, taskDigest: A_TASK, bridgeCommit: HEAD,
    apply: true, clock: () => new Date('2026-08-11T10:00:01.000Z'),
  };
  const first = await bindPlatformIssue(args);
  assert.equal(first.status, 'BOUND');
  assert.equal(first.projection.state, 'QUEUED');
  assert.equal(transport.posts.length, 1);
  const replay = await bindPlatformIssue(args);
  assert.equal(replay.status, 'REUSE');
  assert.equal(transport.posts.length, 1);
});

test('platform adapter rejects missing or duplicated backend identity', () => {
  const missing = platformIssue();
  missing.body = missing.body.replace(/<!-- p4g-development-ticket:v1[^\n]+ -->\n/u, '');
  assert.throws(() => derivePlatformTicket({
    issue: missing, repositoryId: '123456789', targetTaskDigest: A_TASK,
  }), /0 exact backend source markers/u);
  const duplicate = platformIssue();
  duplicate.body = `${duplicate.body}\n${duplicate.body.match(/<!-- p4g-development-ticket:v1[^\n]+ -->/u)[0]}`;
  assert.throws(() => derivePlatformTicket({
    issue: duplicate, repositoryId: '123456789', targetTaskDigest: A_TASK,
  }), /2 exact backend source markers/u);
});

test('one malformed bridge marker is a bounded STOP and does not wedge another Issue wake', async () => {
  const corrupt = {
    number: 97,
    body: '<!-- two-mac-bridge-ticket:v1 payload=not+base64 -->',
    htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/97',
    updatedAt: '2026-08-11T09:00:00Z', comments: [],
  };
  const transport = multiIssueTransport([corrupt, issue(ticket())]);
  const stdout = [];
  const status = await runCli(['observe', '--machine', 'mac-b'], {
    env: { CODEX_THREAD_ID: B_THREAD }, transport,
    writeOut: (text) => stdout.push(text), writeErr: () => {},
  });
  assert.equal(status, 2);
  const output = JSON.parse(stdout.join(''));
  assert.deepEqual(output.wakes.map((wake) => [wake.action, wake.issueNumber]), [
    ['STOP', 97], ['CLAIM', 91],
  ]);
  assert.equal(output.wakes[0].code, 'issue_journal_invalid');
});

test('projector reads one exact ticket and comment journal', () => {
  const value = ticket();
  const result = projectIssue(issue(value));
  assert.equal(result.ticket.requestId, value.requestId);
  assert.equal(result.projection.state, 'QUEUED');
  assert.equal(result.projection.executable, false);
});

test('observer routes only to the assigned bound task and Mac A consumes terminal callbacks', () => {
  const value = ticket();
  const queued = projectIssue(issue(value));
  assert.deepEqual(planWake({ ...queued, machine: 'mac-b', taskDigest: B_TASK }), {
    action: 'CLAIM', issueNumber: 91, state: 'QUEUED',
  });
  assert.equal(planWake({
    ...queued, machine: 'mac-a', taskDigest: A_TASK,
    observedAt: Date.parse('2026-08-11T09:10:00.000Z'),
  }), null);
  assert.deepEqual(planWake({
    ...queued, machine: 'mac-a', taskDigest: A_TASK,
    observedAt: Date.parse('2026-08-11T09:15:00.000Z'),
  }), { action: 'MARK_OFFLINE', issueNumber: 91, state: 'QUEUED' });
  assert.deepEqual(planWake({ ...queued, machine: 'mac-b', taskDigest: A_TASK }), {
    action: 'STOP', code: 'task_binding_mismatch', issueNumber: 91,
  });

  const events = [queue(value)];
  for (const [state, id] of [
    ['CLAIM_PROPOSED', 'proposed'], ['CLAIMED', 'claimed'], ['IN_PROGRESS', 'started'],
    ['READY_TO_PLAY', 'ready'],
  ]) {
    events.push(createEvent({
      ticket: value,
      previous: events.at(-1),
      state,
      actorMachine: 'mac-b',
      actorTaskDigest: B_TASK,
      idempotencyKey: id,
      occurredAt: `2026-08-11T09:00:0${events.length}.000Z`,
      evidence: state === 'READY_TO_PLAY' ? [{
        kind: 'candidate', identity: 'sha256:proof',
        url: 'https://candidate.example/two-dots', sha256: null,
      }] : [],
    }));
  }
  const terminal = projectIssue(issue(value, events));
  assert.deepEqual(planWake({ ...terminal, machine: 'mac-a', taskDigest: A_TASK }), {
    action: 'CONSUME_TERMINAL', issueNumber: 91, state: 'READY_TO_PLAY',
  });
});

test('observer releases at most one author wake and preserves Mac B priority 91 then 82', () => {
  const wakes = [
    { action: 'CLAIM', issueNumber: 105, state: 'QUEUED' },
    { action: 'CLAIM', issueNumber: 82, state: 'QUEUED' },
    { action: 'CLAIM', issueNumber: 91, state: 'QUEUED' },
  ];
  assert.deepEqual(selectWakes(wakes, 'mac-b').map((wake) => wake.issueNumber), [91]);
  assert.deepEqual(selectWakes([
    ...wakes,
    { action: 'CONSUME_TERMINAL', issueNumber: 108, state: 'READY_TO_PLAY' },
  ], 'mac-a').map((wake) => wake.issueNumber), [108, 91]);
});

test('Mac A can record offline observation without taking Mac B execution authority', async () => {
  const value = ticket();
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-a', A_TASK)]),
    issue(value),
  ]);
  const options = parseArgs([
    'advance', '--issue', '91', '--machine', 'mac-a',
    '--state', 'QUEUED:machine_offline', '--error-code', 'machine_offline', '--apply',
  ]);
  const result = await advanceIssue({
    transport, options, taskDigest: A_TASK, bridgeCommit: HEAD,
    clock: () => new Date('2026-08-11T09:15:00.000Z'),
  });
  assert.equal(result.status, 'APPLIED');
  assert.equal(result.projection.state, 'QUEUED:machine_offline');
  assert.equal(result.projection.executable, false);
  assert.equal(result.projection.events.at(-1).assignedMachine, 'mac-b');
  assert.equal(result.projection.events.at(-1).actorMachine, 'mac-a');
});

test('Mac A authority transitions reject a self-asserted machine from an unbound task', async () => {
  const value = ticket();
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-a', A_TASK)]),
    issue(value),
  ]);
  const options = parseArgs([
    'advance', '--issue', '91', '--machine', 'mac-a',
    '--state', 'QUEUED:machine_offline', '--error-code', 'machine_offline', '--apply',
  ]);
  await assert.rejects(advanceIssue({
    transport, options, taskDigest: B_TASK, bridgeCommit: HEAD,
    clock: () => new Date('2026-08-11T09:15:00.000Z'),
  }), /exact mac-a control binding is required/u);
  assert.equal(transport.posts.length, 0);
});

test('claim posts proposal, confirms after reread, then requires two independent reads', async () => {
  const value = ticket();
  const transport = memoryTransport(issue(value));
  const times = [
    new Date('2026-08-11T09:00:01.000Z'),
    new Date('2026-08-11T09:00:02.000Z'),
  ];
  const result = await claimIssue({
    transport,
    repo: 'Glera/p4g-workspace-meta',
    issueNumber: 91,
    machine: 'mac-b',
    taskDigest: B_TASK,
    apply: true,
    clock: () => times.shift(),
  });
  assert.equal(result.status, 'CLAIMED');
  assert.equal(result.projection.executable, true);
  assert.equal(transport.posts.length, 2);
  // Initial read, proposal verification, then two full independent reads of
  // the confirmed claim. No executor is released before the final pair.
  assert.ok(transport.reads >= 4);
});

test('duplicate claim replay does not post or execute twice', async () => {
  const value = ticket();
  const transport = memoryTransport(issue(value));
  const clock = (() => {
    let second = 0;
    return () => new Date(`2026-08-11T09:00:0${++second}.000Z`);
  })();
  await claimIssue({ transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 91,
    machine: 'mac-b', taskDigest: B_TASK, apply: true, clock });
  const postCount = transport.posts.length;
  const replay = await claimIssue({ transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 91,
    machine: 'mac-b', taskDigest: B_TASK, apply: true, clock });
  assert.equal(replay.status, 'REUSE');
  assert.equal(transport.posts.length, postCount);
});

test('concurrent sibling claim injected after proposal fails closed before execution', async () => {
  const value = ticket();
  let injected = false;
  const transport = memoryTransport(issue(value), {
    onPost: ({ current, posts }) => {
      if (posts.length !== 1 || injected) return current;
      injected = true;
      const projected = projectIssue(current);
      const sibling = createEvent({
        ticket: value,
        previous: projected.projection.events[0],
        state: 'CLAIM_PROPOSED',
        actorMachine: 'mac-b',
        actorTaskDigest: B_TASK,
        idempotencyKey: 'competing-heartbeat',
        occurredAt: '2026-08-11T09:00:01.001Z',
      });
      current.comments.push({
        id: 'competitor', body: encodeEventMarker(sibling, value),
        htmlUrl: 'https://github.example/competitor', createdAt: sibling.occurredAt,
      });
      return current;
    },
  });
  await assert.rejects(
    claimIssue({ transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 91,
      machine: 'mac-b', taskDigest: B_TASK, apply: true,
      clock: () => new Date('2026-08-11T09:00:01.000Z') }),
    /forked journal/u,
  );
  assert.equal(transport.posts.length, 1);
});

test('READY parser requires exact remote head and HTTPS candidate evidence', () => {
  const base = ['advance', '--issue', '91', '--machine', 'mac-b', '--state', 'READY_TO_PLAY'];
  assert.throws(() => parseArgs(base), /head-repository is required/u);
  assert.throws(() => parseArgs([
    ...base,
    '--head-repository', 'Glera/swipe-generator', '--head-ref', 'master',
    '--head-sha', HEAD, '--candidate-url', 'http://127.0.0.1:4317/candidate',
    '--candidate-sha256', 'f'.repeat(64),
  ]), /must use HTTPS/u);
});

test('READY fetches exact HTTPS candidate bytes and rejects a mismatched digest', async () => {
  const value = ticket();
  const events = [queue(value)];
  for (const [state, key] of [
    ['CLAIM_PROPOSED', 'proposal'], ['CLAIMED', 'claim'], ['IN_PROGRESS', 'work'],
  ]) {
    events.push(createEvent({
      ticket: value,
      previous: events.at(-1),
      state,
      actorMachine: 'mac-b',
      actorTaskDigest: B_TASK,
      idempotencyKey: key,
      occurredAt: `2026-08-11T09:00:0${events.length}.000Z`,
    }));
  }
  const candidate = Buffer.from('<html>exact candidate</html>', 'utf8');
  const digest = sha256(candidate);
  const argv = [
    'advance', '--issue', '91', '--machine', 'mac-b', '--state', 'READY_TO_PLAY',
    '--head-repository', 'Glera/swipe-generator', '--head-ref', 'master',
    '--head-sha', HEAD, '--candidate-url', 'https://candidate.example/two-dots',
    '--candidate-sha256', digest, '--apply',
  ];
  const response = () => ({
    ok: true,
    status: 200,
    headers: { get: (name) => (name === 'content-length' ? String(candidate.length) : null) },
    arrayBuffer: async () => Uint8Array.from(candidate).buffer,
  });
  const transport = memoryTransport(issue(value, events));
  const result = await advanceIssue({
    transport, options: parseArgs(argv), taskDigest: B_TASK,
    fetchImpl: async () => response(),
    clock: () => new Date('2026-08-11T09:00:04.000Z'),
  });
  assert.equal(result.status, 'APPLIED');
  assert.equal(result.projection.state, 'READY_TO_PLAY');

  const mismatch = memoryTransport(issue(value, events));
  await assert.rejects(advanceIssue({
    transport: mismatch,
    options: parseArgs(argv.map((item) => (item === digest ? 'f'.repeat(64) : item))),
    taskDigest: B_TASK,
    fetchImpl: async () => response(),
    clock: () => new Date('2026-08-11T09:00:04.000Z'),
  }), /do not match expected evidence/u);
  assert.equal(mismatch.posts.length, 0);
});

test('runCli observe emits bounded wake JSON and no remote instruction text', async () => {
  const value = ticket();
  const transport = memoryTransport(issue(value));
  const stdout = [];
  const status = await runCli(['observe', '--machine', 'mac-b'], {
    env: { CODEX_THREAD_ID: B_THREAD }, transport,
    writeOut: (text) => stdout.push(text), writeErr: () => {},
  });
  assert.equal(status, 0);
  const output = JSON.parse(stdout.join(''));
  assert.deepEqual(output.wakes.map((wake) => wake.action), ['CLAIM']);
  assert.deepEqual(Object.keys(output.wakes[0]).sort(), [
    'action', 'issueNumber', 'issueUrl', 'state', 'ticketDigest',
  ]);
});
