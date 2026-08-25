import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  composeControlWakeComment,
  createControlWake,
  createMachineBinding,
  createEvent,
  decodeControlWakeComment,
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
  publishControlWake,
  projectIssue,
  runCli,
  scanControlWakeComments,
  scanControlIssueWakes,
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
    callbackTaskDigest: A_TASK,
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

function nextCommentId(comments) {
  const maximum = comments.reduce((value, comment) => (
    /^[1-9][0-9]*$/u.test(String(comment.id)) && BigInt(comment.id) > value
      ? BigInt(comment.id)
      : value
  ), 0n);
  return String(maximum + 1n);
}

function memoryTransport(initialIssue, { onPost = null, control = null } = {}) {
  let current = structuredClone(initialIssue);
  let controlState = structuredClone(control ?? (initialIssue.number === 94
    ? initialIssue
    : controlIssue([machineBinding('mac-b', B_TASK)])));
  const posts = [];
  let reads = 0;
  return {
    posts,
    get reads() { return reads; },
    async getRepositoryId() { return '123456789'; },
    async listOpenIssues() {
      return current.number === 94 ? [] : [{ ...current, comments: undefined }];
    },
    async getIssue(repo, issueNumber) {
      reads += 1;
      if (issueNumber === 94 && current.number !== 94) return structuredClone(controlState);
      return structuredClone(current);
    },
    async postComment(repo, issueNumber, body) {
      posts.push({ repo, issueNumber, body });
      const destination = issueNumber === 94 && current.number !== 94 ? controlState : current;
      const id = nextCommentId(destination.comments);
      destination.comments.push({
        id, body,
        htmlUrl: `https://github.example/comments/${id}`,
        createdAt: '2026-08-11T09:00:01Z',
      });
      if (destination === current && onPost) current = await onPost({ current, posts }) ?? current;
      return { id };
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
      const id = nextCommentId(value.comments);
      value.comments.push({
        id, body,
        htmlUrl: `https://github.example/issues/${issueNumber}/comments/${id}`,
        createdAt: '2026-08-11T09:00:01Z',
      });
      return { id };
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

function controlWakeIssue(extraComments = []) {
  const bindings = [machineBinding('mac-a', A_TASK), machineBinding('mac-b', B_TASK)];
  return {
    number: 94,
    body: 'Phase 0 control',
    htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/94',
    updatedAt: '2026-08-13T08:24:52Z',
    comments: [
      ...bindings.map((binding, index) => ({
        id: String(5277000001 + index),
        body: encodeMachineBindingMarker(binding),
        htmlUrl: `https://github.example/binding-${index}`,
        createdAt: binding.registeredAt,
      })),
      ...extraComments,
    ],
  };
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
  assert.equal(parseArgs([
    'bootstrap', '--machine', 'mac-b', '--supersede-binding-digest', 'f'.repeat(64),
  ]).supersedeBindingDigest, 'f'.repeat(64));
  assert.equal(parseArgs([
    'bootstrap', '--machine', 'mac-b', '--supersede-binding-digest', 'f'.repeat(64),
    '--replace-owner-task',
  ]).replaceOwnerTask, true);
  assert.throws(() => parseArgs([
    'bootstrap', '--machine', 'mac-b', '--replace-owner-task',
  ]), /with --supersede-binding-digest/u);
  assert.throws(() => parseArgs([
    'claim', '--issue', '91', '--machine', 'mac-b',
    '--supersede-binding-digest', 'f'.repeat(64),
  ]), /valid only for bootstrap/u);
  assert.throws(
    () => parseArgs(['project', '--issue', '91.5']),
    /strict integer/u,
  );
  assert.throws(
    () => parseArgs(['project', '--issue', '91', '--repo', 'Glera/other']),
    /allowlisted/u,
  );
  assert.throws(
    () => parseArgs([
      'publish-wake', '--machine', 'mac-a', '--parent-comment-id', '5277813712',
      '--verdict', 'NEEDS_HELP', '--body-file', '/tmp/receipt.md',
    ]),
    /--next-owner/u,
  );
  assert.throws(
    () => parseArgs([
      'scan-wakes', '--machine', 'mac-b', '--after-comment-id', '10', '--after-wake-id', '11',
    ]),
    /cannot exceed/u,
  );
});

test('the real V17 nested-heading receipt is typed NEEDS_HELP instead of silent no-work', () => {
  const receipt = `## MAC_A_V17_OPUS_REVIEW_NEEDS_HELP — blocking findings + same-owner correction wake

Terminal verdict: **NEEDS_HELP**. PR #34 remains frozen.

### MAC_B_V17_CORRECTION_WAKE — same existing owner only

The same existing Mac B owner may perform one bounded correction pass for F001–F004.`;
  const result = scanControlWakeComments({
    controlIssue: 94,
    comments: [{
      id: '5277813712',
      body: receipt,
      htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5277813712',
      createdAt: '2026-08-13T08:16:44Z',
    }],
    machine: 'mac-b',
    taskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    lastScannedCommentId: '5277580994',
    lastConsumedWakeCommentId: '5277580994',
  });
  assert.deepEqual(result.attention, [{
    action: 'NEEDS_HELP',
    code: 'malformed_targeted_wake',
    commentId: '5277813712',
    commentUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5277813712',
  }]);
  assert.equal(result.nextWake, null);
  assert.deepEqual(result.cursors, {
    lastScannedCommentId: '5277813712',
    lastConsumedWakeCommentId: '5277580994',
    acknowledgeAfterHandlingCommentId: null,
  });

  const macA = scanControlWakeComments({
    controlIssue: 94,
    comments: [{
      id: '5277813712', body: receipt, htmlUrl: null,
      createdAt: '2026-08-13T08:16:44Z',
    }],
    machine: 'mac-a',
    taskDigest: A_TASK,
    lastScannedCommentId: '5277580994',
    lastConsumedWakeCommentId: '5277580994',
  });
  assert.deepEqual(macA.attention, []);
});

test('the real V18 terminal receipt is typed attention on its first scanner pass', () => {
  const receipt = `## MAC_B_V18_HANDOFF_READY — exact F001–F004 correction for narrow Mac A delta review

Terminal: \`HANDOFF_READY\`

Required next step:
- the same Mac A owner performs exactly one narrow author-blind Claude Opus 5 / effort \`high\` delta review
- V16 recovery may continue only after unresolved P1/P2=\`0\`

Boundaries preserved: no merge, restart, retry or recovery.`;
  const receiptComment = {
    id: '5278452171',
    body: receipt,
    htmlUrl: 'https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5278452171',
    createdAt: '2026-08-13T09:22:18Z',
  };
  const laterBindingComment = {
    id: '5278487691',
    body: 'Phase 0 local binding: `mac-b`',
    htmlUrl: 'https://github.example/mac-b-binding',
    createdAt: '2026-08-13T09:25:42Z',
  };
  const result = scanControlWakeComments({
    controlIssue: 94,
    comments: [receiptComment, laterBindingComment],
    machine: 'mac-a',
    taskDigest: A_TASK,
    lastScannedCommentId: '5278314524',
    lastConsumedWakeCommentId: '5277887625',
  });
  assert.deepEqual(result.attention, [{
    action: 'NEEDS_HELP',
    code: 'malformed_targeted_wake',
    commentId: receiptComment.id,
    commentUrl: receiptComment.htmlUrl,
  }]);
  assert.equal(result.nextWake, null);
  assert.deepEqual(result.cursors, {
    lastScannedCommentId: laterBindingComment.id,
    lastConsumedWakeCommentId: '5277887625',
    acknowledgeAfterHandlingCommentId: null,
  });

  const macB = scanControlWakeComments({
    controlIssue: 94,
    comments: [receiptComment, laterBindingComment],
    machine: 'mac-b',
    taskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    lastScannedCommentId: '5278314524',
    lastConsumedWakeCommentId: '5277887625',
  });
  assert.deepEqual(macB.attention, []);
});

test('informational owner mentions and explicit holds are not treated as dispatch', () => {
  for (const body of [
    'Mac A owner remains idle.\n\nNext step: operator approval.',
    'Required next step:\n- do not resume the same Mac A owner before authority is granted',
  ]) {
    const result = scanControlWakeComments({
      controlIssue: 94,
      comments: [{ id: '5278452171', body, htmlUrl: null }],
      machine: 'mac-a',
      taskDigest: A_TASK,
      lastScannedCommentId: '0',
      lastConsumedWakeCommentId: '0',
    });
    assert.deepEqual(result.attention, []);
  }
});

test('a non-dispatch prohibition on the assignment line cannot hide the targeted wake', () => {
  const result = scanControlWakeComments({
    controlIssue: 94,
    comments: [{
      id: '5278452171',
      body: 'Required next step:\n- do not merge or restart; the same Mac A owner must review the exact delta',
      htmlUrl: null,
    }],
    machine: 'mac-a',
    taskDigest: A_TASK,
    lastScannedCommentId: '0',
    lastConsumedWakeCommentId: '0',
  });
  assert.deepEqual(result.attention.map((item) => [item.action, item.code]), [
    ['NEEDS_HELP', 'malformed_targeted_wake'],
  ]);
});

test('markdown next-step headings and wrapped assignments cannot become no-work', () => {
  for (const body of [
    '**Required next step:**\n- the same Mac A owner performs the exact delta review',
    '- Next step:\n  the same Mac A owner reviews the exact delta',
    '> Next step:\n> - the same Mac A owner continues V16',
    '1. Next step:\n- run the exact delta review\n  by the same Mac A owner',
  ]) {
    const result = scanControlWakeComments({
      controlIssue: 94,
      comments: [{ id: '5278452171', body, htmlUrl: null }],
      machine: 'mac-a',
      taskDigest: A_TASK,
      lastScannedCommentId: '0',
      lastConsumedWakeCommentId: '0',
    });
    assert.deepEqual(result.attention.map((item) => [item.action, item.code]), [
      ['NEEDS_HELP', 'malformed_targeted_wake'],
    ]);
  }
});

test('next-step parser does not confuse other Mac product names or later context with an owner', () => {
  for (const body of [
    'Next step:\n- run the smoke on MacBook and Mac Air',
    'Next step:\n- operator approval\n\nContext: Mac A previously ran the review',
  ]) {
    const result = scanControlWakeComments({
      controlIssue: 94,
      comments: [{ id: '5278452171', body, htmlUrl: null }],
      machine: 'mac-a',
      taskDigest: A_TASK,
      lastScannedCommentId: '0',
      lastConsumedWakeCommentId: '0',
    });
    assert.deepEqual(result.attention, []);
  }
});

test('ordinary capitalization in a targeted legacy wake cannot become no-work', () => {
  for (const body of [
    '### Next owner: Mac B — continue the bounded correction',
    '## Mac B Wake',
    '### macB nextOwner',
  ]) {
    const result = scanControlWakeComments({
      controlIssue: 94,
      comments: [{ id: '5277813712', body, htmlUrl: null }],
      machine: 'mac-b',
      taskDigest: B_TASK,
      callbackTaskDigest: A_TASK,
      lastScannedCommentId: '0',
      lastConsumedWakeCommentId: '0',
    });
    assert.deepEqual(result.attention.map((item) => [item.action, item.code]), [
      ['NEEDS_HELP', 'malformed_targeted_wake'],
    ]);
  }
});

test('structured wake selection ignores the visible heading and advances cursors separately', () => {
  const parent = {
    id: '5277813712',
    body: 'Mac A exact review receipt; no dispatch in this record.',
    htmlUrl: 'https://github.example/parent',
    createdAt: '2026-08-13T08:16:44Z',
  };
  const receiptBody = 'Correction is authorized on the same exact package.';
  const wake = createControlWake({
    controlIssue: 94,
    parentCommentId: parent.id,
    assignedMachine: 'mac-b',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    verdict: 'NEEDS_HELP',
    receiptBody,
    createdAt: '2026-08-13T08:24:52.000Z',
  });
  const wakeComment = {
    id: '5277887625',
    body: composeControlWakeComment(receiptBody, wake),
    htmlUrl: 'https://github.example/wake',
    createdAt: '2026-08-13T08:24:52Z',
  };
  const result = scanControlWakeComments({
    controlIssue: 94,
    comments: [parent, wakeComment],
    machine: 'mac-b',
    taskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    lastScannedCommentId: parent.id,
    lastConsumedWakeCommentId: parent.id,
  });
  assert.equal(result.attention.length, 0);
  assert.equal(result.nextWake.commentId, wakeComment.id);
  assert.equal(result.nextWake.receiptBody, receiptBody);
  assert.equal(result.nextWake.wake.wakeId, wake.wakeId);
  assert.deepEqual(result.cursors, {
    lastScannedCommentId: wakeComment.id,
    lastConsumedWakeCommentId: parent.id,
    acknowledgeAfterHandlingCommentId: wakeComment.id,
  });

  const acknowledged = scanControlWakeComments({
    controlIssue: 94,
    comments: [parent, wakeComment],
    machine: 'mac-b',
    taskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    lastScannedCommentId: wakeComment.id,
    lastConsumedWakeCommentId: wakeComment.id,
  });
  assert.equal(acknowledged.nextWake, null);
  assert.equal(acknowledged.pendingWakeCount, 0);
});

test('malformed envelope is NEEDS_HELP and callback binding drift is STOP', () => {
  const parent = {
    id: '5277813712', body: 'Parent receipt.', htmlUrl: null,
    createdAt: '2026-08-13T08:16:44Z',
  };
  const malformed = {
    id: '5277887000',
    body: '<!-- two-mac-bridge-control-wake:v1 payload=not+base64 -->',
    htmlUrl: 'https://github.example/malformed',
    createdAt: '2026-08-13T08:20:00Z',
  };
  const receiptBody = 'Exact bounded correction.';
  const wrongCallbackWake = createControlWake({
    controlIssue: 94,
    parentCommentId: parent.id,
    assignedMachine: 'mac-b',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: 'f'.repeat(64),
    verdict: 'NEEDS_HELP',
    receiptBody,
    createdAt: '2026-08-13T08:24:52.000Z',
  });
  const wrongCallback = {
    id: '5277887625',
    body: composeControlWakeComment(receiptBody, wrongCallbackWake),
    htmlUrl: 'https://github.example/wrong-callback',
    createdAt: '2026-08-13T08:24:52Z',
  };
  const result = scanControlWakeComments({
    controlIssue: 94,
    comments: [parent, malformed, wrongCallback],
    machine: 'mac-b',
    taskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    lastScannedCommentId: parent.id,
    lastConsumedWakeCommentId: parent.id,
  });
  assert.deepEqual(result.attention.map((item) => [item.action, item.code]), [
    ['NEEDS_HELP', 'malformed_targeted_wake'],
    ['STOP', 'callback_task_binding_mismatch'],
  ]);
  assert.equal(result.nextWake, null);
});

test('an already-consumed wakeId suppresses a later exact semantic replay', () => {
  const parent = { id: '10', body: 'Receipt.', htmlUrl: null };
  const receiptBody = 'Perform one bounded correction.';
  const first = createControlWake({
    controlIssue: 94,
    parentCommentId: parent.id,
    assignedMachine: 'mac-b',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    verdict: 'NEEDS_HELP',
    receiptBody,
    createdAt: '2026-08-13T08:24:52.000Z',
  });
  const replay = createControlWake({
    controlIssue: 94,
    parentCommentId: parent.id,
    assignedMachine: 'mac-b',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    verdict: 'NEEDS_HELP',
    receiptBody,
    createdAt: '2026-08-13T08:25:52.000Z',
  });
  assert.equal(replay.wakeId, first.wakeId);
  const result = scanControlWakeComments({
    controlIssue: 94,
    comments: [
      parent,
      { id: '11', body: composeControlWakeComment(receiptBody, first), htmlUrl: null },
      { id: '12', body: composeControlWakeComment(receiptBody, replay), htmlUrl: null },
    ],
    machine: 'mac-b',
    taskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    lastScannedCommentId: '11',
    lastConsumedWakeCommentId: '11',
  });
  assert.equal(result.nextWake, null);
  assert.equal(result.pendingWakeCount, 0);
});

test('STOP and AUTHORITY_REQUIRED are typed terminal wakes, not dispatch', () => {
  for (const verdict of ['STOP', 'AUTHORITY_REQUIRED']) {
    const parent = { id: '10', body: 'Receipt.', htmlUrl: null };
    const receiptBody = `${verdict} exact lifecycle.`;
    const wake = createControlWake({
      controlIssue: 94,
      parentCommentId: parent.id,
      assignedMachine: 'mac-b',
      targetTaskDigest: B_TASK,
      callbackTaskDigest: A_TASK,
      verdict,
      receiptBody,
      createdAt: '2026-08-13T08:24:52.000Z',
    });
    const result = scanControlWakeComments({
      controlIssue: 94,
      comments: [
        parent,
        { id: '11', body: composeControlWakeComment(receiptBody, wake), htmlUrl: null },
      ],
      machine: 'mac-b',
      taskDigest: B_TASK,
      callbackTaskDigest: A_TASK,
      lastScannedCommentId: '10',
      lastConsumedWakeCommentId: '10',
    });
    assert.equal(result.nextWake.action, verdict);
    assert.equal(result.cursors.acknowledgeAfterHandlingCommentId, '11');
  }
});

// Causal lineage fixtures, sanitized from the real Issue #94 V32–V37 control
// chain of 13.08.2026: a Mac A → Mac B dispatch ping-pong where each new
// dispatch supersedes the previous one, several late STOP terminals arrive from
// branches that were already superseded, and one executed NEEDS_HELP terminal
// asks for help from a branch nothing superseded. Comment ids are sequential
// placeholders inside the observed range and package identity is replaced; only
// the causal shape and the arrival order are the real ones.
const TIER2_TICKET_ISSUE = 106;
const TIER2_LINEAGE = `lin_${sha256('two-mac.issue-94.v32-v37').slice(0, 32)}`;
const OTHER_LINEAGE = `lin_${sha256('two-mac.issue-94.unrelated').slice(0, 32)}`;

const TIER2_BASE_COMMENT_ID = '5278600001';
const TIER2_STEPS = Object.freeze([
  {
    name: 'w33', id: '5278600010', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: null, supersedes: [],
  },
  {
    name: 'w34', id: '5278600020', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: 'w33', supersedes: ['w33'],
  },
  {
    name: 't33stop', id: '5278600030', to: 'mac-a', verdict: 'STOP',
    predecessor: 'w33', supersedes: [],
  },
  {
    name: 'w35', id: '5278600040', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: 'w34', supersedes: ['w34'],
  },
  {
    name: 't34stop', id: '5278600050', to: 'mac-a', verdict: 'STOP',
    predecessor: 'w34', supersedes: [],
  },
  {
    name: 'w36', id: '5278600060', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: 'w35', supersedes: ['w35'],
  },
  {
    name: 't35stop', id: '5278600070', to: 'mac-a', verdict: 'STOP',
    predecessor: 'w35', supersedes: [],
  },
  {
    name: 'w37', id: '5278600080', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: 'w36', supersedes: ['w36'],
  },
  {
    name: 't36', id: '5278600090', to: 'mac-a', verdict: 'NEEDS_HELP',
    predecessor: 'w36', supersedes: [],
  },
  {
    name: 't37stop', id: '5278600100', to: 'mac-a', verdict: 'STOP',
    predecessor: 'w37', supersedes: [],
  },
]);

// An unrelated lineage interleaved into the same control Issue: its ids fall
// between the tier-2 ids, and its last STOP arrives after the tier-2 lineage
// already delivered an executed terminal.
const OTHER_BASE_COMMENT_ID = '5278600005';
const OTHER_STEPS = Object.freeze([
  {
    name: 'w1', id: '5278600015', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: null, supersedes: [],
  },
  {
    name: 't1stop', id: '5278600025', to: 'mac-a', verdict: 'STOP',
    predecessor: 'w1', supersedes: [],
  },
  {
    name: 't2stop', id: '5278600095', to: 'mac-a', verdict: 'STOP',
    predecessor: 'w1', supersedes: [],
  },
]);

// One lineage where a terminal verdict is followed by more work: a NEEDS_HELP
// terminal, then a fresh same-lineage dispatch that nothing supersedes, then
// that dispatch's own STOP terminal. Nothing here is superseded at all.
const REOPENED_BASE_COMMENT_ID = '5278800001';
const REOPENED_STEPS = Object.freeze([
  {
    name: 'w1', id: '5278800010', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: null, supersedes: [],
  },
  {
    name: 't1help', id: '5278800020', to: 'mac-a', verdict: 'NEEDS_HELP',
    predecessor: 'w1', supersedes: [],
  },
  {
    name: 'wnext', id: '5278800030', to: 'mac-b', verdict: 'HANDOFF_READY',
    predecessor: 't1help', supersedes: [],
  },
  {
    name: 'tnextstop', id: '5278800040', to: 'mac-a', verdict: 'STOP',
    predecessor: 'wnext', supersedes: [],
  },
]);

function chainInstant(index) {
  return new Date(Date.parse('2026-08-13T10:00:00.000Z') + index * 60_000).toISOString();
}

function controlChain({
  steps = TIER2_STEPS,
  baseCommentId = TIER2_BASE_COMMENT_ID,
  lineageId = TIER2_LINEAGE,
  ticketIssue = TIER2_TICKET_ISSUE,
  withLineage = true,
} = {}) {
  const ids = { base: baseCommentId };
  const wakes = {};
  const bodies = {};
  const order = [];
  const comments = [{
    id: baseCommentId,
    body: 'Exact Mac A review receipt; no dispatch in this record.',
    htmlUrl: `https://github.example/c/${baseCommentId}`,
    createdAt: chainInstant(0),
  }];
  steps.forEach((step, index) => {
    const receiptBody = `Exact ${step.name} record on the same reviewed package.`;
    const lineage = withLineage
      ? {
        ticketIssue,
        lineageId,
        predecessorWakeId: step.predecessor ? wakes[step.predecessor].wakeId : null,
        supersedesWakeIds: step.supersedes.map((name) => wakes[name].wakeId),
      }
      : null;
    const wake = createControlWake({
      controlIssue: 94,
      parentCommentId: comments.at(-1).id,
      assignedMachine: step.to,
      targetTaskDigest: step.to === 'mac-b' ? B_TASK : A_TASK,
      callbackTaskDigest: step.to === 'mac-b' ? A_TASK : null,
      verdict: step.verdict,
      receiptBody,
      createdAt: chainInstant(index + 1),
      lineage,
    });
    ids[step.name] = step.id;
    wakes[step.name] = wake;
    bodies[step.name] = receiptBody;
    order.push(step.name);
    comments.push({
      id: step.id,
      body: composeControlWakeComment(receiptBody, wake),
      htmlUrl: `https://github.example/c/${step.id}`,
      createdAt: chainInstant(index + 1),
    });
  });
  return {
    ids,
    wakes,
    bodies,
    comments,
    through(name) {
      return comments.slice(0, order.indexOf(name) + 2);
    },
  };
}

function scanAsMacA(comments, cursor) {
  return scanControlWakeComments({
    controlIssue: 94,
    comments,
    machine: 'mac-a',
    taskDigest: A_TASK,
    lastScannedCommentId: cursor,
    lastConsumedWakeCommentId: cursor,
  });
}

test('F-V34: a late STOP whose predecessor was superseded is a historical noop', () => {
  const chain = controlChain();
  // W35 supersedes W34, and only then does W34's own STOP terminal arrive.
  assert.deepEqual(chain.wakes.w35.supersedesWakeIds, [chain.wakes.w34.wakeId]);
  assert.equal(chain.wakes.t34stop.predecessorWakeId, chain.wakes.w34.wakeId);

  const result = scanAsMacA(chain.through('t34stop'), chain.ids.w35);
  assert.deepEqual(result.historicalNoopCommentIds, [chain.ids.t34stop]);
  assert.equal(result.nextWake, null);
  assert.equal(result.pendingWakeCount, 0);
  assert.deepEqual(result.attention, []);
  // The cursor still advances through the noop, so the pass terminates and no
  // successor wake can be minted from it.
  assert.deepEqual(result.cursors, {
    lastScannedCommentId: chain.ids.t34stop,
    lastConsumedWakeCommentId: chain.ids.w35,
    acknowledgeAfterHandlingCommentId: chain.ids.t34stop,
  });
});

test('F-V35: the historical-noop rule repeats for every superseded STOP branch', () => {
  const chain = controlChain();
  const result = scanAsMacA(chain.through('t35stop'), chain.ids.w34);
  assert.deepEqual(result.historicalNoopCommentIds, [
    chain.ids.t33stop,
    chain.ids.t34stop,
    chain.ids.t35stop,
  ]);
  assert.equal(result.nextWake, null);
  assert.equal(result.pendingWakeCount, 0);
  assert.deepEqual(result.attention, []);
  assert.equal(result.cursors.acknowledgeAfterHandlingCommentId, chain.ids.t35stop);
});

test('F-V36: an executed terminal is never swallowed by a later supersession claim', () => {
  const chain = controlChain();
  // W37 supersedes W36 and T36 is W36's executed NEEDS_HELP terminal: a naive
  // "predecessor is in some supersedes list" check marks T36 historical here
  // and loses real execution evidence.
  assert.deepEqual(chain.wakes.w37.supersedesWakeIds, [chain.wakes.w36.wakeId]);
  assert.equal(chain.wakes.t36.predecessorWakeId, chain.wakes.w36.wakeId);

  const result = scanAsMacA(chain.comments, chain.ids.w37);
  assert.notEqual(result.nextWake, null);
  assert.equal(result.nextWake.commentId, chain.ids.t36);
  assert.equal(result.nextWake.classification, 'normal');
  assert.equal(result.nextWake.action, 'DISPATCH');
  assert.equal(result.nextWake.wake.wakeId, chain.wakes.t36.wakeId);
  assert.equal(result.nextWake.receiptBody, chain.bodies.t36);
  // T36 and the never-superseded T37stop terminal behind it.
  assert.equal(result.pendingWakeCount, 2);
  assert.deepEqual(result.attention, []);
  assert.equal(result.cursors.acknowledgeAfterHandlingCommentId, chain.ids.t36);

  // Delivered and consumable exactly once: acknowledging T36 hands over to the
  // next terminal rather than re-offering this one.
  const consumed = scanAsMacA(chain.comments, chain.ids.t36);
  assert.equal(consumed.nextWake.commentId, chain.ids.t37stop);
  assert.equal(consumed.pendingWakeCount, 1);

  // reg-P1-late-needs-help, the post-closure variant of the same rule: the
  // lineage already delivered a NEEDS_HELP terminal (T36) AND W37 is superseded
  // by a fresh dispatch, yet W37's own late NEEDS_HELP terminal is still real
  // execution evidence and is delivered.
  const extended = controlChain({
    steps: [
      ...TIER2_STEPS,
      {
        name: 'w38', id: '5278600110', to: 'mac-b', verdict: 'HANDOFF_READY',
        predecessor: 'w37', supersedes: ['w37'],
      },
      {
        name: 't37help', id: '5278600120', to: 'mac-a', verdict: 'NEEDS_HELP',
        predecessor: 'w37', supersedes: [],
      },
    ],
  });
  const late = scanAsMacA(extended.comments, extended.ids.t37stop);
  assert.deepEqual(extended.wakes.w38.supersedesWakeIds, [extended.wakes.w37.wakeId]);
  assert.equal(late.nextWake.commentId, extended.ids.t37help);
  assert.equal(late.nextWake.classification, 'normal');
  assert.equal(late.nextWake.action, 'DISPATCH');
  assert.equal(late.pendingWakeCount, 1);
  assert.deepEqual(late.historicalNoopCommentIds, []);
  assert.deepEqual(late.attention, []);
});

test('F-V37: a late STOP on a never-superseded branch is delivered, not swallowed', () => {
  const chain = controlChain();
  // W37 is in no supersedes list, so T37stop is the first and only terminal of a
  // live branch. The earlier NEEDS_HELP terminal T36 belongs to a different
  // branch and is not evidence about this one: silencing T37stop because "the
  // lineage looked closed" would drop a real ordering terminal.
  const superseded = Object.values(chain.wakes).flatMap((wake) => wake.supersedesWakeIds);
  assert.equal(superseded.includes(chain.wakes.w37.wakeId), false);
  assert.equal(chain.wakes.t36.verdict, 'NEEDS_HELP');
  assert.equal(chain.wakes.t37stop.predecessorWakeId, chain.wakes.w37.wakeId);

  const result = scanAsMacA(chain.comments, chain.ids.t36);
  assert.deepEqual(result.historicalNoopCommentIds, []);
  assert.equal(result.nextWake.commentId, chain.ids.t37stop);
  assert.equal(result.nextWake.classification, 'normal');
  assert.equal(result.nextWake.action, 'STOP');
  assert.equal(result.nextWake.wake.wakeId, chain.wakes.t37stop.wakeId);
  assert.equal(result.pendingWakeCount, 1);
  assert.deepEqual(result.attention, []);
  assert.deepEqual(result.cursors, {
    lastScannedCommentId: chain.ids.t37stop,
    lastConsumedWakeCommentId: chain.ids.t36,
    acknowledgeAfterHandlingCommentId: chain.ids.t37stop,
  });

  // Delivered and consumable exactly once.
  const consumed = scanAsMacA(chain.comments, chain.ids.t37stop);
  assert.equal(consumed.nextWake, null);
  assert.equal(consumed.pendingWakeCount, 0);
});

test('reg-P1-dispatch-after-close: a dispatch minted after a terminal keeps a live STOP', () => {
  // The exact shape the removed closed-lineage arm swallowed: a NEEDS_HELP
  // terminal, then work continues and a NEW dispatch is minted in the same
  // lineage, and only then does that dispatch's own STOP terminal arrive. W_next
  // is in no supersedes list, so its terminal is live in every direction.
  const chain = controlChain({
    baseCommentId: REOPENED_BASE_COMMENT_ID,
    steps: REOPENED_STEPS,
  });
  const superseded = Object.values(chain.wakes).flatMap((wake) => wake.supersedesWakeIds);
  assert.deepEqual(superseded, []);
  assert.equal(chain.wakes.t1help.verdict, 'NEEDS_HELP');
  assert.equal(chain.wakes.tnextstop.predecessorWakeId, chain.wakes.wnext.wakeId);

  const result = scanAsMacA(chain.comments, chain.ids.t1help);
  assert.equal(result.nextWake.commentId, chain.ids.tnextstop);
  assert.equal(result.nextWake.classification, 'normal');
  assert.equal(result.nextWake.action, 'STOP');
  assert.equal(result.nextWake.wake.wakeId, chain.wakes.tnextstop.wakeId);
  assert.equal(result.pendingWakeCount, 1);
  assert.deepEqual(result.historicalNoopCommentIds, []);
  assert.deepEqual(result.attention, []);
  assert.equal(result.cursors.acknowledgeAfterHandlingCommentId, chain.ids.tnextstop);

  // Consumable exactly once, and the earlier NEEDS_HELP terminal on the first
  // branch is delivered too — nothing in this lineage is silenced.
  const consumed = scanAsMacA(chain.comments, chain.ids.tnextstop);
  assert.equal(consumed.nextWake, null);
  assert.equal(consumed.pendingWakeCount, 0);
  const fromStart = scanAsMacA(chain.comments, '0');
  assert.equal(fromStart.pendingWakeCount, 2);
  assert.equal(fromStart.nextWake.commentId, chain.ids.t1help);
  assert.deepEqual(fromStart.historicalNoopCommentIds, []);
});

test('F-NEG-unrelated: another lineage in the same control Issue is never ignored', () => {
  const tier2 = controlChain();
  const other = controlChain({
    steps: OTHER_STEPS,
    baseCommentId: OTHER_BASE_COMMENT_ID,
    lineageId: OTHER_LINEAGE,
    ticketIssue: 121,
  });
  const comments = [...tier2.comments, ...other.comments];

  const result = scanAsMacA(comments, '0');
  assert.equal(result.nextWake.commentId, other.ids.t1stop);
  assert.equal(result.nextWake.classification, 'normal');
  assert.equal(result.nextWake.action, 'STOP');
  assert.equal(result.pendingWakeCount, 4);
  assert.deepEqual(result.historicalNoopCommentIds, [
    tier2.ids.t33stop,
    tier2.ids.t34stop,
    tier2.ids.t35stop,
  ]);
  assert.deepEqual(result.attention, []);

  // A dense supersession record in the tier-2 lineage never silences a terminal
  // of the unrelated one, whose own branch nothing ever superseded.
  const afterClosure = scanAsMacA(comments, tier2.ids.t36);
  assert.equal(afterClosure.nextWake.commentId, other.ids.t2stop);
  assert.equal(afterClosure.nextWake.classification, 'normal');
  assert.equal(afterClosure.pendingWakeCount, 2);
  assert.deepEqual(afterClosure.historicalNoopCommentIds, []);
});

test('a supersession claim from another lineage is ambiguous and fails closed', () => {
  const base = { name: 'w1', id: '5278700010', to: 'mac-b', verdict: 'HANDOFF_READY' };
  const terminal = { name: 't1stop', id: '5278700030', to: 'mac-a', verdict: 'STOP' };
  const build = (claimLineage) => {
    const chain = controlChain({
      baseCommentId: '5278700001',
      steps: [
        { ...base, predecessor: null, supersedes: [] },
        { ...terminal, predecessor: 'w1', supersedes: [] },
      ],
    });
    const claimant = createControlWake({
      controlIssue: 94,
      parentCommentId: chain.ids.w1,
      assignedMachine: 'mac-b',
      targetTaskDigest: B_TASK,
      callbackTaskDigest: A_TASK,
      verdict: 'HANDOFF_READY',
      receiptBody: 'Replacement dispatch minted outside this lineage.',
      createdAt: chainInstant(9),
      lineage: {
        ...claimLineage,
        predecessorWakeId: null,
        supersedesWakeIds: [chain.wakes.w1.wakeId],
      },
    });
    const claimComment = {
      id: '5278700020',
      body: composeControlWakeComment(
        'Replacement dispatch minted outside this lineage.',
        claimant,
      ),
      htmlUrl: 'https://github.example/c/5278700020',
      createdAt: chainInstant(9),
    };
    return { chain, comments: [...chain.comments, claimComment] };
  };

  for (const claimLineage of [
    { ticketIssue: TIER2_TICKET_ISSUE, lineageId: OTHER_LINEAGE },
    { ticketIssue: 121, lineageId: TIER2_LINEAGE },
  ]) {
    const { chain, comments } = build(claimLineage);
    const result = scanAsMacA(comments, '0');
    assert.equal(result.nextWake.commentId, chain.ids.t1stop);
    assert.equal(result.nextWake.classification, 'ambiguous');
    assert.equal(result.nextWake.action, 'STOP');
    assert.deepEqual(result.historicalNoopCommentIds, []);
    assert.deepEqual(result.attention, [{
      action: 'NEEDS_HELP',
      code: 'ambiguous_wake_lineage',
      commentId: chain.ids.t1stop,
      commentUrl: `https://github.example/c/${chain.ids.t1stop}`,
      wakeId: chain.wakes.t1stop.wakeId,
    }]);
  }

  // The exact same shape inside one lineage is the provable historical noop.
  const { chain, comments } = build({
    ticketIssue: TIER2_TICKET_ISSUE,
    lineageId: TIER2_LINEAGE,
  });
  const sameLineage = scanAsMacA(comments, '0');
  assert.equal(sameLineage.nextWake, null);
  assert.deepEqual(sameLineage.historicalNoopCommentIds, [chain.ids.t1stop]);
  assert.deepEqual(sameLineage.attention, []);
});

test('F-V1-COMPAT: v1 markers keep the exact pre-lineage observation', () => {
  const chain = controlChain({ withLineage: false });
  assert.equal(chain.wakes.t34stop.schema, 'two-mac.control-wake.v1');
  // Same fixture and same cursor as F-V34: without a causal claim in the record
  // nothing may be guessed historical, so the late STOP stays actionable.
  const result = scanAsMacA(chain.through('t34stop'), chain.ids.w35);
  assert.deepEqual(result.historicalNoopCommentIds, []);
  assert.equal(result.nextWake.classification, 'normal');

  const { classification, ...legacyNextWake } = result.nextWake;
  const { historicalNoopCommentIds, ...legacyObservation } = result;
  assert.deepEqual({ ...legacyObservation, nextWake: legacyNextWake }, {
    schema: 'two-mac.control-wake-observation.v1',
    machine: 'mac-a',
    cursors: {
      lastScannedCommentId: chain.ids.t34stop,
      lastConsumedWakeCommentId: chain.ids.w35,
      acknowledgeAfterHandlingCommentId: chain.ids.t34stop,
    },
    attention: [],
    nextWake: {
      action: 'STOP',
      commentId: chain.ids.t34stop,
      commentUrl: `https://github.example/c/${chain.ids.t34stop}`,
      receiptBody: chain.bodies.t34stop,
      wake: chain.wakes.t34stop,
    },
    pendingWakeCount: 1,
  });
  // The observation is extended by exactly two fields, not reshaped.
  assert.deepEqual(Object.keys(result), [
    'schema', 'machine', 'cursors', 'attention', 'historicalNoopCommentIds',
    'nextWake', 'pendingWakeCount',
  ]);
  assert.deepEqual(Object.keys(result.nextWake), [
    'action', 'classification', 'commentId', 'commentUrl', 'receiptBody', 'wake',
  ]);
});

test('F-DEDUPE-2829: a stale cursor and a manual redelivery yield exactly one record', () => {
  const chain = controlChain();
  // The #28/#29 delivery race observed on Issue #107: the same exact wake bytes
  // are posted a second time while the reader cursor is still behind both.
  const original = chain.comments.find((comment) => comment.id === chain.ids.t36);
  const redelivered = {
    ...original,
    id: '5296770192',
    htmlUrl: 'https://github.example/c/5296770192',
  };
  assert.equal(redelivered.body, original.body);
  const comments = [...chain.comments, redelivered];

  const result = scanAsMacA(comments, chain.ids.w37);
  // T36 and the live T37stop terminal; the redelivered T36 bytes are not a
  // third wake.
  assert.equal(result.pendingWakeCount, 2);
  assert.equal(result.nextWake.commentId, chain.ids.t36);
  assert.equal(result.nextWake.classification, 'normal');
  assert.deepEqual(result.historicalNoopCommentIds, []);
  assert.deepEqual(result.attention, []);
  assert.equal(result.cursors.acknowledgeAfterHandlingCommentId, chain.ids.t36);

  // Acknowledging the canonical record retires the duplicate too: no loss and
  // no second delivery, only the genuinely next terminal remains.
  const acknowledged = scanAsMacA(comments, chain.ids.t36);
  assert.equal(acknowledged.pendingWakeCount, 1);
  assert.equal(acknowledged.nextWake.commentId, chain.ids.t37stop);
  assert.deepEqual(acknowledged.attention, []);

  // Once that is acknowledged as well, the duplicate still mints nothing.
  const drained = scanAsMacA(comments, chain.ids.t37stop);
  assert.equal(drained.nextWake, null);
  assert.equal(drained.pendingWakeCount, 0);
  assert.deepEqual(drained.attention, []);
});

test('a lineage claim never bypasses the exact target binding check', () => {
  const chain = controlChain();
  const receiptBody = 'Late STOP bound to a stale Mac A task.';
  const stale = createControlWake({
    controlIssue: 94,
    parentCommentId: chain.ids.t37stop,
    assignedMachine: 'mac-a',
    targetTaskDigest: 'f'.repeat(64),
    callbackTaskDigest: null,
    verdict: 'STOP',
    receiptBody,
    createdAt: chainInstant(20),
    lineage: {
      ticketIssue: TIER2_TICKET_ISSUE,
      lineageId: TIER2_LINEAGE,
      predecessorWakeId: chain.wakes.w37.wakeId,
      supersedesWakeIds: [],
    },
  });
  const comments = [...chain.comments, {
    id: '5278600110',
    body: composeControlWakeComment(receiptBody, stale),
    htmlUrl: 'https://github.example/c/5278600110',
    createdAt: chainInstant(20),
  }];
  const result = scanAsMacA(comments, chain.ids.t36);
  assert.deepEqual(result.attention.map((item) => [item.action, item.code, item.commentId]), [
    ['STOP', 'target_task_binding_mismatch', '5278600110'],
  ]);
  assert.equal(result.historicalNoopCommentIds.includes('5278600110'), false);
});

test('publish-wake posts receipt and route marker atomically, then the same scanner selects it', async () => {
  const parent = {
    id: '5277813712',
    body: 'Exact Mac A review receipt.',
    htmlUrl: 'https://github.example/parent',
    createdAt: '2026-08-13T08:16:44Z',
  };
  const transport = multiIssueTransport([controlWakeIssue([parent])]);
  const receiptBody = '## NEEDS_HELP\n\nResolve F001–F004 in one bounded correction.';
  const published = await publishControlWake({
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    nextOwner: 'mac-b',
    parentCommentId: parent.id,
    verdict: 'NEEDS_HELP',
    receiptBody,
    bridgeCommit: HEAD,
    apply: true,
    clock: () => new Date('2026-08-13T08:24:52.000Z'),
  });
  assert.equal(published.status, 'APPLIED');
  assert.equal(transport.posts.length, 1);
  assert.equal(transport.posts[0].body.match(/two-mac-bridge-control-wake:v1/gu)?.length, 1);

  const selected = await scanControlIssueWakes({
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    machine: 'mac-b',
    lastScannedCommentId: parent.id,
    lastConsumedWakeCommentId: parent.id,
  });
  assert.equal(selected.nextWake.commentId, published.commentId);
  assert.equal(selected.nextWake.receiptBody, receiptBody);

  const replayed = await publishControlWake({
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    nextOwner: 'mac-b',
    parentCommentId: parent.id,
    verdict: 'NEEDS_HELP',
    receiptBody,
    bridgeCommit: HEAD,
    apply: true,
    clock: () => new Date('2026-08-13T08:25:52.000Z'),
  });
  assert.equal(replayed.status, 'REPLAY');
  assert.equal(replayed.commentId, published.commentId);
  assert.equal(transport.posts.length, 1);
});

test('publish-wake cannot route nextOwner=mac-b without the exact active target binding', async () => {
  const parent = {
    id: '5277813712', body: 'Exact review receipt.', htmlUrl: null,
    createdAt: '2026-08-13T08:16:44Z',
  };
  const control = controlWakeIssue([parent]);
  control.comments = [control.comments[0], parent];
  const transport = multiIssueTransport([control]);
  await assert.rejects(publishControlWake({
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    nextOwner: 'mac-b',
    parentCommentId: parent.id,
    verdict: 'NEEDS_HELP',
    receiptBody: 'Bounded correction.',
    bridgeCommit: HEAD,
    apply: true,
  }), /exact active mac-b target binding/u);
  assert.equal(transport.posts.length, 0);
});

test('publish-wake refuses a stale local bridge commit', async () => {
  const parent = { id: '5277813712', body: 'Receipt.', htmlUrl: null };
  const transport = multiIssueTransport([controlWakeIssue([parent])]);
  await assert.rejects(publishControlWake({
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    nextOwner: 'mac-b',
    parentCommentId: parent.id,
    verdict: 'NEEDS_HELP',
    receiptBody: 'Bounded correction.',
    bridgeCommit: 'a'.repeat(40),
    apply: true,
  }), /exact active mac-a machine binding/u);
  assert.equal(transport.posts.length, 0);
});

// The frozen v1 publish-wake record, captured from the pre-lineage writer for
// this exact route/receipt/clock. Enabling the v2 writer must not move a single
// byte of it while no lineage option is passed.
const V1_GOLDEN = Object.freeze({
  parentCommentId: '5277813712',
  receiptBody: 'Bounded correction is ready for Mac B.',
  createdAt: '2026-08-13T08:24:52.000Z',
  wakeId: 'wake_627e99876f4dbadbe0b6a8b1375106e4a72fcc3cc1916c9b594a3d93b392ab27',
  wakeDigest: '0a492932c10fba8a39007f6387856f632535774ae15da5ddf852e3e140d911e0',
  commentSha256: '84be31006b55038506571a38d9b1c7c4feacb41a3f9f81be6f0bde245e87a17c',
  keys: Object.freeze([
    'assignedMachine', 'bodySha256', 'callbackTaskDigest', 'controlIssue', 'createdAt',
    'parentCommentId', 'schema', 'targetTaskDigest', 'verdict', 'wakeDigest', 'wakeId',
  ]),
});

const PUBLISH_WAKE_PARENT = Object.freeze({
  id: V1_GOLDEN.parentCommentId,
  body: 'Exact Mac A review receipt.',
  htmlUrl: 'https://github.example/parent',
  createdAt: '2026-08-13T08:16:44Z',
});

const LINEAGE_ARGS = Object.freeze([
  '--ticket-issue', String(TIER2_TICKET_ISSUE), '--lineage-id', TIER2_LINEAGE,
]);

function publishWakeArgs(extra = [], bodyFile = '/tmp/receipt.md') {
  return [
    'publish-wake', '--machine', 'mac-a', '--next-owner', 'mac-b',
    '--parent-comment-id', V1_GOLDEN.parentCommentId,
    '--verdict', 'HANDOFF_READY', '--body-file', bodyFile,
    ...extra,
  ];
}

// One real CLI pass: the receipt body is a file on disk exactly as an operator
// would pass it, and only the transport, clock and bridge HEAD are injected.
async function runPublishWakeCli(extra, transport) {
  const directory = mkdtempSync(path.join(tmpdir(), 'two-mac-wake-'));
  const bodyFile = path.join(directory, 'receipt.md');
  writeFileSync(bodyFile, V1_GOLDEN.receiptBody, 'utf8');
  const stdout = [];
  const stderr = [];
  try {
    const status = await runCli([...publishWakeArgs(extra, bodyFile), '--apply'], {
      env: { CODEX_THREAD_ID: THREAD },
      transport,
      writeOut: (value) => stdout.push(value),
      writeErr: (value) => stderr.push(value),
      clock: () => new Date(V1_GOLDEN.createdAt),
      resolveHead: () => HEAD,
    });
    return { status, stdout: stdout.join(''), stderr: stderr.join('') };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('publish-wake parses the four lineage options, including the comma-separated supersedes list', () => {
  const predecessor = `wake_${'1'.repeat(64)}`;
  const superseded = [`wake_${'2'.repeat(64)}`, `wake_${'3'.repeat(64)}`];
  const options = parseArgs(publishWakeArgs([
    ...LINEAGE_ARGS,
    '--predecessor-wake-id', predecessor,
    '--supersedes', superseded.join(','),
  ]));
  assert.equal(options.ticketIssue, TIER2_TICKET_ISSUE);
  assert.equal(options.lineageId, TIER2_LINEAGE);
  assert.equal(options.predecessorWakeId, predecessor);
  assert.deepEqual(options.supersedesWakeIds, superseded);

  const bare = parseArgs(publishWakeArgs());
  assert.deepEqual(
    [bare.ticketIssue, bare.lineageId, bare.predecessorWakeId, bare.supersedesWakeIds],
    [null, null, null, null],
  );
  assert.throws(
    () => parseArgs(['claim', '--issue', '91', '--machine', 'mac-b', ...LINEAGE_ARGS]),
    /valid only for publish-wake/u,
  );
});

test('publish-wake with lineage options posts one v2 wake carrying the exact declared lineage', async () => {
  const transport = multiIssueTransport([controlWakeIssue([{ ...PUBLISH_WAKE_PARENT }])]);
  const predecessor = `wake_${'1'.repeat(64)}`;
  const superseded = [`wake_${'2'.repeat(64)}`, `wake_${'3'.repeat(64)}`];
  const published = await runPublishWakeCli([
    ...LINEAGE_ARGS,
    '--predecessor-wake-id', predecessor,
    '--supersedes', superseded.join(','),
  ], transport);
  assert.equal(published.status, 0);
  assert.equal(transport.posts.length, 1);

  const decoded = decodeControlWakeComment(transport.posts[0].body);
  assert.equal(decoded.receiptBody, V1_GOLDEN.receiptBody);
  assert.equal(decoded.wake.schema, 'two-mac.control-wake.v2');
  assert.equal(decoded.wake.ticketIssue, TIER2_TICKET_ISSUE);
  assert.equal(decoded.wake.lineageId, TIER2_LINEAGE);
  assert.equal(decoded.wake.predecessorWakeId, predecessor);
  assert.deepEqual(decoded.wake.supersedesWakeIds, superseded);

  // The v2 identity is derived over the lineage, so the same route no longer
  // collides with its frozen v1 wakeId.
  const expected = createControlWake({
    controlIssue: 94,
    parentCommentId: V1_GOLDEN.parentCommentId,
    assignedMachine: 'mac-b',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    verdict: 'HANDOFF_READY',
    receiptBody: V1_GOLDEN.receiptBody,
    createdAt: V1_GOLDEN.createdAt,
    lineage: {
      ticketIssue: TIER2_TICKET_ISSUE,
      lineageId: TIER2_LINEAGE,
      predecessorWakeId: predecessor,
      supersedesWakeIds: superseded,
    },
  });
  assert.equal(decoded.wake.wakeId, expected.wakeId);
  assert.notEqual(decoded.wake.wakeId, V1_GOLDEN.wakeId);
  assert.equal(JSON.parse(published.stdout).status, 'APPLIED');
  assert.equal(JSON.parse(published.stdout).wake.wakeId, expected.wakeId);

  // Absent optional flags are declared as an empty causal claim, never guessed
  // from the parent comment or the previous wake.
  const minimal = multiIssueTransport([controlWakeIssue([{ ...PUBLISH_WAKE_PARENT }])]);
  assert.equal((await runPublishWakeCli([...LINEAGE_ARGS], minimal)).status, 0);
  const minimalWake = decodeControlWakeComment(minimal.posts[0].body).wake;
  assert.equal(minimalWake.schema, 'two-mac.control-wake.v2');
  assert.equal(minimalWake.predecessorWakeId, null);
  assert.deepEqual(minimalWake.supersedesWakeIds, []);
});

test('publish-wake without lineage options stays byte-identical to the frozen v1 wake', async () => {
  const transport = multiIssueTransport([controlWakeIssue([{ ...PUBLISH_WAKE_PARENT }])]);
  const published = await runPublishWakeCli([], transport);
  assert.equal(published.status, 0);
  assert.equal(transport.posts.length, 1);
  assert.equal(sha256(transport.posts[0].body), V1_GOLDEN.commentSha256);
  const decoded = decodeControlWakeComment(transport.posts[0].body);
  assert.equal(decoded.wake.schema, 'two-mac.control-wake.v1');
  assert.equal(decoded.wake.wakeId, V1_GOLDEN.wakeId);
  assert.equal(decoded.wake.wakeDigest, V1_GOLDEN.wakeDigest);
  assert.deepEqual(Object.keys(decoded.wake).sort(), [...V1_GOLDEN.keys]);
});

test('a partial or malformed lineage fails closed before publish-wake posts anything', async () => {
  const partials = [
    ['--ticket-issue', String(TIER2_TICKET_ISSUE)],
    ['--lineage-id', TIER2_LINEAGE],
    ['--predecessor-wake-id', `wake_${'1'.repeat(64)}`],
    ['--supersedes', `wake_${'2'.repeat(64)}`],
    ['--lineage-id', TIER2_LINEAGE, '--supersedes', `wake_${'2'.repeat(64)}`],
    ['--ticket-issue', String(TIER2_TICKET_ISSUE), '--predecessor-wake-id', `wake_${'1'.repeat(64)}`],
  ];
  for (const partial of partials) {
    const transport = multiIssueTransport([controlWakeIssue([{ ...PUBLISH_WAKE_PARENT }])]);
    const refused = await runPublishWakeCli(partial, transport);
    assert.equal(refused.status, 1);
    assert.match(refused.stderr, /^STOP: --ticket-issue and --lineage-id are required together/u);
    assert.equal(transport.posts.length, 0);
    assert.throws(() => parseArgs(publishWakeArgs(partial)), /required together/u);
  }

  // Field validation stays in the contract; the CLI only surfaces it as STOP.
  const transport = multiIssueTransport([controlWakeIssue([{ ...PUBLISH_WAKE_PARENT }])]);
  const malformed = await runPublishWakeCli([
    '--ticket-issue', String(TIER2_TICKET_ISSUE), '--lineage-id', 'lineage-1',
  ], transport);
  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /^STOP: control wake lineageId is invalid/u);
  assert.equal(transport.posts.length, 0);
});

test('heartbeat CLI uses the contract selector and exposes both cursor high-water marks', async () => {
  const parent = {
    id: '5277813712',
    body: 'Exact review receipt.',
    htmlUrl: 'https://github.example/parent',
    createdAt: '2026-08-13T08:16:44Z',
  };
  const receiptBody = 'Bounded correction is ready for Mac B.';
  const wake = createControlWake({
    controlIssue: 94,
    parentCommentId: parent.id,
    assignedMachine: 'mac-b',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    verdict: 'HANDOFF_READY',
    receiptBody,
    createdAt: '2026-08-13T08:24:52.000Z',
  });
  const wakeComment = {
    id: '5277887625',
    body: composeControlWakeComment(receiptBody, wake),
    htmlUrl: 'https://github.example/wake',
    createdAt: '2026-08-13T08:24:52Z',
  };
  const transport = multiIssueTransport([controlWakeIssue([parent, wakeComment])]);
  const stdout = [];
  const status = await runCli([
    'scan-wakes', '--machine', 'mac-b',
    '--after-comment-id', parent.id,
    '--after-wake-id', parent.id,
  ], {
    env: {},
    transport,
    writeOut: (value) => stdout.push(value),
    writeErr: () => {},
  });
  assert.equal(status, 0);
  const output = JSON.parse(stdout.join(''));
  assert.equal(output.nextWake.commentId, wakeComment.id);
  assert.deepEqual(output.cursors, {
    lastScannedCommentId: wakeComment.id,
    lastConsumedWakeCommentId: parent.id,
    acknowledgeAfterHandlingCommentId: wakeComment.id,
  });
});

test('heartbeat CLI exits typed attention for a structured STOP wake', async () => {
  const parent = { id: '5277813712', body: 'Receipt.', htmlUrl: null };
  const receiptBody = 'Stop this exact lifecycle.';
  const wake = createControlWake({
    controlIssue: 94,
    parentCommentId: parent.id,
    assignedMachine: 'mac-b',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    verdict: 'STOP',
    receiptBody,
    createdAt: '2026-08-13T08:24:52.000Z',
  });
  const transport = multiIssueTransport([controlWakeIssue([
    parent,
    { id: '5277887625', body: composeControlWakeComment(receiptBody, wake), htmlUrl: null },
  ])]);
  const stdout = [];
  const status = await runCli([
    'scan-wakes', '--machine', 'mac-b',
    '--after-comment-id', parent.id,
    '--after-wake-id', parent.id,
  ], {
    env: {}, transport,
    writeOut: (value) => stdout.push(value),
    writeErr: () => {},
  });
  assert.equal(status, 2);
  assert.equal(JSON.parse(stdout.join('')).nextWake.action, 'STOP');
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
    /explicit machine-readable supersession/u,
  );
});

test('replacement bootstrap requires explicit HOLD, preserves stale evidence, and replays once', async () => {
  const stale = createMachineBinding({
    controlIssue: 94,
    repositoryId: '123456789',
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: '7'.repeat(40),
    registeredAt: '2026-08-11T09:00:00.000Z',
  });
  const transport = memoryTransport(controlIssue([stale]));
  const args = {
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: HEAD,
    apply: true,
    clock: () => new Date('2026-08-11T10:00:00.000Z'),
  };
  await assert.rejects(bootstrapMachine(args), /explicit machine-readable supersession/u);
  await assert.rejects(
    bootstrapMachine({ ...args, supersedeBindingDigest: 'f'.repeat(64) }),
    /does not match the exact local task and repository/u,
  );
  assert.equal(transport.posts.length, 0);

  const dryRun = await bootstrapMachine({
    ...args, apply: false, supersedeBindingDigest: stale.bindingDigest,
  });
  assert.equal(dryRun.status, 'DRY_RUN');
  assert.equal(dryRun.hold.bindingDigest, stale.bindingDigest);
  assert.equal(transport.posts.length, 0);

  const replacement = await bootstrapMachine({
    ...args, supersedeBindingDigest: stale.bindingDigest,
  });
  assert.equal(replacement.status, 'BOOTSTRAPPED');
  assert.equal(replacement.held[stale.bindingDigest].taskDigest, B_TASK);
  assert.equal(replacement.binding.bridgeCommit, HEAD);
  assert.equal(transport.posts.length, 2);

  const replay = await bootstrapMachine({
    ...args, supersedeBindingDigest: stale.bindingDigest,
  });
  assert.equal(replay.status, 'REUSE');
  assert.equal(transport.posts.length, 2);
});

test('operator-authorized owner replacement binds a new headless task and retains the old task as HOLD', async () => {
  const stale = createMachineBinding({
    controlIssue: 94,
    repositoryId: '123456789',
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: HEAD,
    registeredAt: '2026-08-11T09:00:00.000Z',
  });
  const transport = memoryTransport(controlIssue([stale]));
  const args = {
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    machine: 'mac-b',
    taskDigest: A_TASK,
    bridgeCommit: HEAD,
    supersedeBindingDigest: stale.bindingDigest,
    apply: true,
    clock: () => new Date('2026-08-11T10:00:00.000Z'),
  };
  await assert.rejects(
    bootstrapMachine(args),
    /does not match the exact local task and repository/u,
  );
  const replacement = await bootstrapMachine({ ...args, replaceOwnerTask: true });
  assert.equal(replacement.status, 'BOOTSTRAPPED');
  assert.equal(replacement.binding.taskDigest, A_TASK);
  assert.equal(replacement.held[stale.bindingDigest].taskDigest, B_TASK);
  assert.equal(transport.posts.length, 2);

  const replay = await bootstrapMachine({ ...args, replaceOwnerTask: true });
  assert.equal(replay.status, 'REUSE');
  assert.equal(transport.posts.length, 2);
});

test('prose HOLD cannot authorize observation or replace the machine-readable stale binding', async () => {
  const stale = createMachineBinding({
    controlIssue: 94,
    repositoryId: '123456789',
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: '7'.repeat(40),
    registeredAt: '2026-08-11T09:00:00.000Z',
  });
  const control = controlIssue([stale]);
  control.comments.push({
    id: 'prose-hold',
    body: 'HOLD — do not run this binding',
    htmlUrl: 'https://github.example/prose-hold',
    createdAt: '2026-08-11T09:01:00Z',
  });
  const transport = multiIssueTransport([control, issue(ticket())]);
  const stdout = [];
  const stderr = [];
  const status = await runCli(['observe', '--machine', 'mac-b'], {
    env: { CODEX_THREAD_ID: B_THREAD },
    transport,
    resolveHead: () => HEAD,
    writeOut: (text) => stdout.push(text),
    writeErr: (text) => stderr.push(text),
  });
  assert.equal(status, 1);
  assert.equal(stdout.length, 0);
  assert.match(stderr.join(''), /exact active mac-b machine binding is required/u);
  await assert.rejects(bootstrapMachine({
    transport,
    repo: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: HEAD,
    apply: false,
  }), /explicit machine-readable supersession/u);
  assert.equal(transport.posts.length, 0);
});

test('Generator adapter derives exact Two Dots and Smash parent lineage from server projection', () => {
  const twoDots = deriveGeneratorTicket({
    snapshot: generatorSnapshot(), issueNumber: 91, repositoryId: '123456789',
    requestId: '434c895a-57ff-4f99-a888-bdbba5ffe378', targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
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
    requestId, targetTaskDigest: B_TASK, callbackTaskDigest: A_TASK,
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
    callbackTaskDigest: A_TASK,
  }), /has 0 records/u);
  assert.throws(() => deriveGeneratorTicket({
    snapshot: { ...base, playableReworks: [base.playableReworks[0], base.playableReworks[0]] },
    issueNumber: 91, repositoryId: '123456789', requestId, targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
  }), /has 2 records/u);
  assert.throws(() => deriveGeneratorTicket({
    snapshot: { ...base, releases: [] }, issueNumber: 91,
    repositoryId: '123456789', requestId, targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
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
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-b', B_TASK)]), corrupt, issue(ticket()),
  ]);
  const stdout = [];
  const status = await runCli(['observe', '--machine', 'mac-b'], {
    env: { CODEX_THREAD_ID: B_THREAD }, transport,
    writeOut: (text) => stdout.push(text), writeErr: () => {},
    resolveHead: () => HEAD,
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
  assert.deepEqual(planWake({ ...queued, machine: 'mac-a', taskDigest: '9'.repeat(64) }), {
    action: 'STOP', code: 'callback_binding_mismatch', issueNumber: 91,
  });

  const events = [queue(value)];
  for (const [state, id] of [
    ['CLAIM_PROPOSED', 'proposed'], ['CLAIMED', 'claimed'], ['IN_PROGRESS', 'started'],
    ['HANDOFF_READY', 'handoff'],
  ]) {
    events.push(createEvent({
      ticket: value,
      previous: events.at(-1),
      state,
      actorMachine: 'mac-b',
      actorTaskDigest: B_TASK,
      idempotencyKey: id,
      occurredAt: `2026-08-11T09:00:0${events.length}.000Z`,
      evidence: state === 'HANDOFF_READY' ? [{
        kind: 'git_head', identity: `Glera/swipe-generator@master:${HEAD}`,
        url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`, sha256: null,
      }] : [],
    }));
  }
  events.push(createEvent({
    ticket: value,
    previous: events.at(-1),
    state: 'READY_TO_PLAY',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'ready',
    occurredAt: '2026-08-11T09:00:05.000Z',
    evidence: [
      {
        kind: 'git_head', identity: `Glera/swipe-generator@master:${HEAD}`,
        url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`, sha256: null,
      },
      {
        kind: 'candidate', identity: `sha256:${'f'.repeat(64)}`,
        url: 'https://candidate.example/two-dots', sha256: 'f'.repeat(64),
      },
    ],
  }));
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
  assert.deepEqual(selectWakes([
    { action: 'CLAIM', issueNumber: 105, state: 'QUEUED' },
    { action: 'HOST_RUNTIME', issueNumber: 91, state: 'HANDOFF_READY' },
  ], 'mac-a').map((wake) => wake.issueNumber), [91]);
});

test('Mac B handoff wakes Mac A runtime host, which records terminal READY', async () => {
  const value = ticket();
  const events = [queue(value)];
  for (const [state, key] of [
    ['CLAIM_PROPOSED', 'host-proposal'],
    ['CLAIMED', 'host-claim'],
    ['IN_PROGRESS', 'host-work'],
  ]) {
    events.push(createEvent({
      ticket: value, previous: events.at(-1), state,
      actorMachine: 'mac-b', actorTaskDigest: B_TASK,
      idempotencyKey: key,
      occurredAt: `2026-08-11T09:00:0${events.length}.000Z`,
    }));
  }
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-a', A_TASK), machineBinding('mac-b', B_TASK)]),
    issue(value, events),
  ]);
  const handoff = await advanceIssue({
    transport,
    options: parseArgs([
      'advance', '--issue', '91', '--machine', 'mac-b', '--state', 'HANDOFF_READY',
      '--head-repository', 'Glera/swipe-generator', '--head-ref', 'master',
      '--head-sha', HEAD, '--apply',
    ]),
    taskDigest: B_TASK,
    bridgeCommit: HEAD,
    clock: () => new Date('2026-08-11T09:00:04.000Z'),
  });
  assert.equal(handoff.projection.state, 'HANDOFF_READY');
  const projected = projectIssue(await transport.getIssue('Glera/p4g-workspace-meta', 91));
  assert.deepEqual(planWake({ ...projected, machine: 'mac-a', taskDigest: A_TASK }), {
    action: 'HOST_RUNTIME', issueNumber: 91, state: 'HANDOFF_READY',
  });

  const candidate = Buffer.from('<html>hosted exact candidate</html>', 'utf8');
  const digest = sha256(candidate);
  const ready = await advanceIssue({
    transport,
    options: parseArgs([
      'advance', '--issue', '91', '--machine', 'mac-a', '--state', 'READY_TO_PLAY',
      '--head-repository', 'Glera/swipe-generator', '--head-ref', 'master',
      '--head-sha', HEAD, '--candidate-url', 'https://candidate.example/two-dots',
      '--candidate-sha256', digest, '--apply',
    ]),
    taskDigest: A_TASK,
    bridgeCommit: HEAD,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => String(candidate.length) },
      arrayBuffer: async () => Uint8Array.from(candidate).buffer,
    }),
    clock: () => new Date('2026-08-11T09:00:05.000Z'),
  });
  assert.equal(ready.projection.state, 'READY_TO_PLAY');
  assert.equal(ready.projection.events.at(-2).actorMachine, 'mac-b');
  assert.equal(ready.projection.events.at(-1).actorMachine, 'mac-a');
});

test('advance dry-run validates transition before append and cannot wedge the journal', async () => {
  const value = ticket();
  const events = [queue(value)];
  for (const [state, key] of [
    ['CLAIM_PROPOSED', 'dry-proposal'], ['CLAIMED', 'dry-claim'],
  ]) {
    events.push(createEvent({
      ticket: value, previous: events.at(-1), state,
      actorMachine: 'mac-b', actorTaskDigest: B_TASK,
      idempotencyKey: key,
      occurredAt: `2026-08-11T09:00:0${events.length}.000Z`,
    }));
  }
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-b', B_TASK)]), issue(value, events),
  ]);
  await assert.rejects(advanceIssue({
    transport,
    options: parseArgs([
      'advance', '--issue', '91', '--machine', 'mac-b', '--state', 'HANDOFF_READY',
      '--head-repository', 'Glera/swipe-generator', '--head-ref', 'master',
      '--head-sha', HEAD,
    ]),
    taskDigest: B_TASK,
    bridgeCommit: HEAD,
    clock: () => new Date('2026-08-11T09:00:03.000Z'),
  }), /invalid transition CLAIMED -> HANDOFF_READY/u);
  assert.equal(transport.posts.length, 0);
  assert.equal(projectIssue(await transport.getIssue('Glera/p4g-workspace-meta', 91)).projection.state, 'CLAIMED');
});

test('Mac B handoff accepts only merged master from allowlisted content repositories', async () => {
  const value = ticket();
  const events = [queue(value)];
  for (const [state, key] of [
    ['CLAIM_PROPOSED', 'allow-proposal'], ['CLAIMED', 'allow-claim'],
    ['IN_PROGRESS', 'allow-work'],
  ]) {
    events.push(createEvent({
      ticket: value, previous: events.at(-1), state,
      actorMachine: 'mac-b', actorTaskDigest: B_TASK,
      idempotencyKey: key,
      occurredAt: `2026-08-11T09:00:0${events.length}.000Z`,
    }));
  }
  for (const [repository, ref] of [
    ['Glera/swipe-backend', 'master'],
    ['Glera/swipe-generator', 'codex/scratch'],
  ]) {
    const transport = multiIssueTransport([
      controlIssue([machineBinding('mac-b', B_TASK)]), issue(value, events),
    ]);
    await assert.rejects(advanceIssue({
      transport,
      options: parseArgs([
        'advance', '--issue', '91', '--machine', 'mac-b', '--state', 'HANDOFF_READY',
        '--head-repository', repository, '--head-ref', ref, '--head-sha', HEAD,
      ]),
      taskDigest: B_TASK,
      bridgeCommit: HEAD,
    }), /merged master in an allowlisted content repository/u);
    assert.equal(transport.posts.length, 0);
  }
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
  }), /exact active mac-a machine binding is required/u);
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
    controlIssue: 94,
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: HEAD,
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
    controlIssue: 94, machine: 'mac-b', taskDigest: B_TASK,
    bridgeCommit: HEAD, apply: true, clock });
  const postCount = transport.posts.length;
  const replay = await claimIssue({ transport, repo: 'Glera/p4g-workspace-meta', issueNumber: 91,
    controlIssue: 94, machine: 'mac-b', taskDigest: B_TASK,
    bridgeCommit: HEAD, apply: true, clock });
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
      controlIssue: 94, machine: 'mac-b', taskDigest: B_TASK,
      bridgeCommit: HEAD, apply: true,
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
    ['HANDOFF_READY', 'handoff'],
  ]) {
    events.push(createEvent({
      ticket: value,
      previous: events.at(-1),
      state,
      actorMachine: 'mac-b',
      actorTaskDigest: B_TASK,
      idempotencyKey: key,
      occurredAt: `2026-08-11T09:00:0${events.length}.000Z`,
      evidence: state === 'HANDOFF_READY' ? [{
        kind: 'git_head', identity: `Glera/swipe-generator@master:${HEAD}`,
        url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`, sha256: null,
      }] : [],
    }));
  }
  const candidate = Buffer.from('<html>exact candidate</html>', 'utf8');
  const digest = sha256(candidate);
  const argv = [
    'advance', '--issue', '91', '--machine', 'mac-a', '--state', 'READY_TO_PLAY',
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
  const transport = multiIssueTransport([
    controlIssue([machineBinding('mac-a', A_TASK), machineBinding('mac-b', B_TASK)]),
    issue(value, events),
  ]);
  const result = await advanceIssue({
    transport, options: parseArgs(argv), taskDigest: A_TASK, bridgeCommit: HEAD,
    fetchImpl: async () => response(),
    clock: () => new Date('2026-08-11T09:00:04.000Z'),
  });
  assert.equal(result.status, 'APPLIED');
  assert.equal(result.projection.state, 'READY_TO_PLAY');

  const mismatch = multiIssueTransport([
    controlIssue([machineBinding('mac-a', A_TASK), machineBinding('mac-b', B_TASK)]),
    issue(value, events),
  ]);
  await assert.rejects(advanceIssue({
    transport: mismatch,
    options: parseArgs(argv.map((item) => (item === digest ? 'f'.repeat(64) : item))),
    taskDigest: A_TASK,
    bridgeCommit: HEAD,
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
    resolveHead: () => HEAD,
  });
  assert.equal(status, 0);
  const output = JSON.parse(stdout.join(''));
  assert.deepEqual(output.wakes.map((wake) => wake.action), ['CLAIM']);
  assert.deepEqual(Object.keys(output.wakes[0]).sort(), [
    'action', 'issueNumber', 'issueUrl', 'state', 'ticketDigest',
  ]);
});
