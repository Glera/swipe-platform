import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createMachineBinding,
  createMachineHold,
  createEvent,
  decodeMachineBindingMarkers,
  decodeEventMarkers,
  decodeTicketMarkers,
  encodeEventMarker,
  encodeMachineBindingMarker,
  encodeMachineHoldMarker,
  encodeTicketMarker,
  projectJournal,
  projectMachineBindings,
  projectMachineBindingState,
  ticketDigest,
} from './two-mac-bridge-contract.mjs';

const A_TASK = 'a'.repeat(64);
const B_TASK = 'b'.repeat(64);
const REQUEST_HASH = 'c'.repeat(64);
const HEAD = 'd'.repeat(40);
const TREE = 'e'.repeat(40);

function ticket(overrides = {}) {
  return {
    schema: 'two-mac.bridge-ticket.v1',
    ticketId: 'meta-94/two-dots-434c',
    issueNumber: 91,
    repositoryId: '123456789',
    sourceKind: 'mechanic',
    requestId: '434c895a-57ff-4f99-a888-bdbba5ffe378',
    requestHash: REQUEST_HASH,
    mutationId: null,
    parentRequestId: '6c267c01-1fc5-4137-a2c6-e81142d67972',
    sourceId: 'orthogonal-link-v1',
    sourceRepository: 'Glera/playables',
    sourceCommit: HEAD,
    sourceTree: TREE,
    assignedMachine: 'mac-b',
    authority: 'content-factory',
    targetTaskDigest: B_TASK,
    callbackTaskDigest: A_TASK,
    instruction: 'Rematerialize the exact legacy source through the reviewed path.',
    createdAt: '2026-08-11T09:00:00.000Z',
    ...overrides,
  };
}

function append(events, value) {
  const next = createEvent({
    ticket: value.ticket,
    previous: events.at(-1) ?? null,
    state: value.state,
    actorMachine: value.actorMachine,
    actorTaskDigest: value.actorTaskDigest,
    idempotencyKey: value.idempotencyKey,
    occurredAt: value.occurredAt ?? `2026-08-11T09:00:0${events.length}.000Z`,
    evidence: value.evidence ?? [],
    errorCode: value.errorCode ?? null,
  });
  events.push(next);
  return next;
}

function queue(value = ticket()) {
  const events = [];
  append(events, {
    ticket: value,
    state: 'QUEUED',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'queue-434c',
  });
  return events;
}

test('ticket marker preserves exact request, parent, source and route identities', () => {
  const value = ticket({ instruction: 'line one\nline two with --> safely encoded' });
  const marker = encodeTicketMarker(value);
  assert.doesNotMatch(marker, /line one/u);
  assert.deepEqual(decodeTicketMarkers(`contract\n${marker}\nprose`), [value]);
  assert.equal(ticketDigest(decodeTicketMarkers(marker)[0]), ticketDigest(value));
});

test('A to B to A journal becomes executable only after confirmed claim', () => {
  const value = ticket();
  const events = queue(value);
  assert.equal(projectJournal(value, events).executable, false);

  append(events, {
    ticket: value,
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'claim-proposed-434c',
  });
  assert.equal(projectJournal(value, events).executable, false);

  append(events, {
    ticket: value,
    state: 'CLAIMED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'claim-confirmed-434c',
  });
  assert.equal(projectJournal(value, events).executable, true);

  append(events, {
    ticket: value,
    state: 'IN_PROGRESS',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'started-434c',
  });
  append(events, {
    ticket: value,
    state: 'HANDOFF_READY',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'handoff-434c',
    evidence: [{
      kind: 'git_head',
      identity: `Glera/swipe-generator@master:${HEAD}`,
      url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`,
      sha256: null,
    }],
  });
  append(events, {
    ticket: value,
    state: 'READY_TO_PLAY',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'ready-434c',
    evidence: [
      {
        kind: 'git_head',
        identity: `Glera/swipe-generator@master:${HEAD}`,
        url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`,
        sha256: null,
      },
      {
        kind: 'candidate',
        identity: `sha256:${'f'.repeat(64)}`,
        url: 'https://candidate.example/two-dots',
        sha256: 'f'.repeat(64),
      },
    ],
  });
  append(events, {
    ticket: value,
    state: 'DONE',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'notified-434c',
    evidence: [{
      kind: 'telegram_receipt',
      identity: 'provider-message-id:123',
      url: null,
      sha256: null,
    }],
  });

  const projection = projectJournal(value, events);
  assert.equal(projection.state, 'DONE');
  assert.equal(projection.terminal, true);
  assert.equal(projection.eventCount, 7);
});

test('exact replay is idempotent and changed bytes under one key fail closed', () => {
  const value = ticket();
  const events = queue(value);
  const replay = structuredClone(events[0]);
  assert.equal(projectJournal(value, [...events, replay]).eventCount, 1);

  const conflict = structuredClone(replay);
  conflict.occurredAt = '2026-08-11T09:00:09.000Z';
  conflict.eventDigest = '0'.repeat(64);
  assert.throws(
    () => projectJournal(value, [...events, conflict]),
    /eventDigest does not match/u,
  );

  const second = createEvent({
    ticket: value,
    previous: null,
    state: 'QUEUED',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'queue-434c',
    occurredAt: '2026-08-11T09:00:09.000Z',
  });
  assert.throws(
    () => projectJournal(value, [...events, second]),
    /idempotency conflict/u,
  );
});

test('two independently proposed claims form a fork and neither is executable', () => {
  const value = ticket();
  const events = queue(value);
  const left = createEvent({
    ticket: value,
    previous: events[0],
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'claim-left',
    occurredAt: '2026-08-11T09:00:01.000Z',
  });
  const right = createEvent({
    ticket: value,
    previous: events[0],
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'claim-right',
    occurredAt: '2026-08-11T09:00:01.001Z',
  });
  assert.throws(
    () => projectJournal(value, [...events, left, right]),
    /forked journal at sequence 1/u,
  );
});

test('stale event parent and sequence gap fail closed', () => {
  const value = ticket();
  const events = queue(value);
  append(events, {
    ticket: value,
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'claim-proposed',
  });
  const stale = structuredClone(events[1]);
  stale.idempotencyKey = 'stale-comment';
  stale.eventId = `evt_${'f'.repeat(64)}`;
  stale.parentEventDigest = 'f'.repeat(64);
  stale.eventDigest = 'f'.repeat(64);
  assert.throws(
    () => projectJournal(value, [...events.slice(0, 1), stale]),
    /eventDigest does not match/u,
  );
  assert.throws(
    () => projectJournal(value, [events[1]]),
    /journal sequence gap/u,
  );
});

test('cross-machine claim and wrong task binding are rejected', () => {
  const value = ticket();
  const previous = queue(value)[0];
  assert.throws(() => createEvent({
    ticket: value,
    previous,
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'wrong-machine',
    occurredAt: '2026-08-11T09:00:01.000Z',
  }), /wrong machine or task binding/u);
  assert.throws(() => createEvent({
    ticket: value,
    previous,
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-b',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'wrong-task',
    occurredAt: '2026-08-11T09:00:01.000Z',
  }), /wrong machine or task binding/u);
});

test('offline ticket resumes on the assigned Mac without reassignment', () => {
  const value = ticket();
  const events = queue(value);
  append(events, {
    ticket: value,
    state: 'QUEUED:machine_offline',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'offline-434c',
    errorCode: 'machine_offline',
  });
  append(events, {
    ticket: value,
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'claim-after-offline',
  });
  append(events, {
    ticket: value,
    state: 'CLAIMED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'confirm-after-offline',
  });
  const projection = projectJournal(value, events);
  assert.equal(projection.state, 'CLAIMED');
  assert.equal(projection.executable, true);
  assert.ok(projection.events.every((event) => event.assignedMachine === 'mac-b'));
});

test('task disappearance is terminal NEEDS_HELP and exact replay stays idempotent', () => {
  const value = ticket();
  const events = queue(value);
  const missing = append(events, {
    ticket: value,
    state: 'NEEDS_HELP',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'task-missing-434c',
    errorCode: 'task_missing',
  });
  const projection = projectJournal(value, [...events, structuredClone(missing)]);
  assert.equal(projection.state, 'NEEDS_HELP');
  assert.equal(projection.terminal, true);
  assert.equal(projection.eventCount, 2);
  assert.equal(projection.executable, false);
});

test('task disappearance after confirmed claim can still terminate fail-closed', () => {
  const value = ticket();
  const events = queue(value);
  append(events, {
    ticket: value,
    state: 'CLAIM_PROPOSED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'claim-before-disappearance',
  });
  append(events, {
    ticket: value,
    state: 'CLAIMED',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'confirmed-before-disappearance',
  });
  append(events, {
    ticket: value,
    state: 'NEEDS_HELP',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'task-missing-after-claim',
    errorCode: 'task_missing',
  });
  const projection = projectJournal(value, events);
  assert.equal(projection.state, 'NEEDS_HELP');
  assert.equal(projection.executable, false);
  assert.equal(projection.terminal, true);
});

test('Mac B exact handoff wakes Mac A host before terminal READY', () => {
  const value = ticket();
  const events = queue(value);
  for (const [state, key] of [
    ['CLAIM_PROPOSED', 'handoff-proposal'],
    ['CLAIMED', 'handoff-claim'],
    ['IN_PROGRESS', 'handoff-work'],
    ['HANDOFF_READY', 'handoff-ready'],
  ]) {
    append(events, {
      ticket: value,
      state,
      actorMachine: 'mac-b',
      actorTaskDigest: B_TASK,
      idempotencyKey: key,
      evidence: state === 'HANDOFF_READY' ? [{
        kind: 'git_head',
        identity: `Glera/swipe-generator@master:${HEAD}`,
        url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`,
        sha256: null,
      }] : [],
    });
  }
  append(events, {
    ticket: value,
    state: 'READY_TO_PLAY',
    actorMachine: 'mac-a',
    actorTaskDigest: A_TASK,
    idempotencyKey: 'hosted-ready',
    evidence: [
      {
        kind: 'git_head',
        identity: `Glera/swipe-generator@master:${HEAD}`,
        url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`,
        sha256: null,
      },
      {
        kind: 'candidate',
        identity: `sha256:${'f'.repeat(64)}`,
        url: 'https://candidate.example/two-dots',
        sha256: 'f'.repeat(64),
      },
    ],
  });
  const projection = projectJournal(value, events);
  assert.equal(projection.state, 'READY_TO_PLAY');
  assert.equal(projection.terminal, true);
});

test('Mac A cannot skip HANDOFF_READY for a Mac B ticket', () => {
  const value = ticket();
  const events = queue(value);
  for (const [state, key] of [
    ['CLAIM_PROPOSED', 'skip-proposal'],
    ['CLAIMED', 'skip-claim'],
    ['IN_PROGRESS', 'skip-work'],
  ]) {
    append(events, {
      ticket: value, state, actorMachine: 'mac-b', actorTaskDigest: B_TASK,
      idempotencyKey: key,
    });
  }
  assert.throws(
    () => {
      const invalid = createEvent({
        ticket: value,
        previous: events.at(-1),
        state: 'READY_TO_PLAY',
        actorMachine: 'mac-a',
        actorTaskDigest: A_TASK,
        idempotencyKey: 'skip-handoff',
        occurredAt: '2026-08-11T09:00:05.000Z',
        evidence: [
          {
            kind: 'git_head',
            identity: `Glera/swipe-generator@master:${HEAD}`,
            url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`,
            sha256: null,
          },
          {
            kind: 'candidate', identity: `sha256:${'f'.repeat(64)}`,
            url: 'https://candidate.example/two-dots', sha256: 'f'.repeat(64),
          },
        ],
      });
      projectJournal(value, [...events, invalid]);
    },
    /Mac A READY_TO_PLAY requires HANDOFF_READY/u,
  );
});

test('handoff authority is exact-task-bound, Mac A-only, and exact-head-preserving', () => {
  const value = ticket();
  const events = queue(value);
  for (const [state, key] of [
    ['CLAIM_PROPOSED', 'authority-proposal'],
    ['CLAIMED', 'authority-claim'],
    ['IN_PROGRESS', 'authority-work'],
  ]) {
    append(events, {
      ticket: value, state, actorMachine: 'mac-b', actorTaskDigest: B_TASK,
      idempotencyKey: key,
    });
  }
  assert.throws(() => createEvent({
    ticket: value,
    previous: events.at(-1),
    state: 'HANDOFF_READY',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'empty-handoff',
    occurredAt: '2026-08-11T09:00:04.000Z',
  }), /requires only exact git_head evidence/u);
  append(events, {
    ticket: value,
    state: 'HANDOFF_READY',
    actorMachine: 'mac-b',
    actorTaskDigest: B_TASK,
    idempotencyKey: 'authority-handoff',
    evidence: [{
      kind: 'git_head', identity: `Glera/swipe-generator@master:${HEAD}`,
      url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`, sha256: null,
    }],
  });
  const readyEvidence = [
    {
      kind: 'git_head', identity: `Glera/swipe-generator@master:${HEAD}`,
      url: `https://github.com/Glera/swipe-generator/commit/${HEAD}`, sha256: null,
    },
    {
      kind: 'candidate', identity: `sha256:${'f'.repeat(64)}`,
      url: 'https://candidate.example/two-dots', sha256: 'f'.repeat(64),
    },
  ];
  assert.throws(() => createEvent({
    ticket: value, previous: events.at(-1), state: 'READY_TO_PLAY',
    actorMachine: 'mac-b', actorTaskDigest: B_TASK,
    idempotencyKey: 'mac-b-terminal', occurredAt: '2026-08-11T09:00:05.000Z',
    evidence: readyEvidence,
  }), /wrong machine or task binding/u);
  assert.throws(() => createEvent({
    ticket: value, previous: events.at(-1), state: 'READY_TO_PLAY',
    actorMachine: 'mac-a', actorTaskDigest: '9'.repeat(64),
    idempotencyKey: 'wrong-callback', occurredAt: '2026-08-11T09:00:05.000Z',
    evidence: readyEvidence,
  }), /wrong machine or task binding/u);
  const wrongHead = createEvent({
    ticket: value, previous: events.at(-1), state: 'READY_TO_PLAY',
    actorMachine: 'mac-a', actorTaskDigest: A_TASK,
    idempotencyKey: 'wrong-head', occurredAt: '2026-08-11T09:00:05.000Z',
    evidence: [
      {
        kind: 'git_head', identity: `Glera/swipe-generator@master:${'8'.repeat(40)}`,
        url: `https://github.com/Glera/swipe-generator/commit/${'8'.repeat(40)}`, sha256: null,
      },
      readyEvidence[1],
    ],
  });
  assert.throws(
    () => projectJournal(value, [...events, wrongHead]),
    /exact handed-off git_head/u,
  );

  const platform = ticket({
    assignedMachine: 'mac-a', authority: 'product-control-plane',
    targetTaskDigest: A_TASK, callbackTaskDigest: null,
  });
  assert.throws(() => createEvent({
    ticket: platform, previous: null, state: 'HANDOFF_READY',
    actorMachine: 'mac-a', actorTaskDigest: A_TASK,
    idempotencyKey: 'platform-handoff', occurredAt: '2026-08-11T09:00:00.000Z',
    evidence: [readyEvidence[0]],
  }), /assigned Mac B task/u);
});

test('encoded event round-trips and malformed marker fails closed', () => {
  const value = ticket();
  const event = queue(value)[0];
  assert.deepEqual(decodeEventMarkers(encodeEventMarker(event, value), value), [event]);
  assert.throws(
    () => decodeEventMarkers('<!-- two-mac-bridge-event:v1 payload=not+base64 -->', value),
    /malformed event marker/u,
  );
});

test('strict integer and exact SHA boundaries reject coercion and stale identities', () => {
  assert.throws(() => ticketDigest(ticket({ issueNumber: '91' })), /strict integer/u);
  assert.throws(() => ticketDigest(ticket({ sourceCommit: HEAD.slice(0, 12) })), /full lowercase Git SHA/u);
  assert.throws(() => ticketDigest(ticket({ assignedMachine: 'mac-a' })), /authority does not match/u);
});

test('machine binding hides raw task identity and conflicting bootstrap fails closed', () => {
  const binding = createMachineBinding({
    controlIssue: 94,
    repositoryId: '123456789',
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: HEAD,
    registeredAt: '2026-08-11T09:00:00.000Z',
  });
  const marker = encodeMachineBindingMarker(binding);
  assert.deepEqual(decodeMachineBindingMarkers(marker), [binding]);
  assert.deepEqual(projectMachineBindings(94, [marker, marker]), { 'mac-b': binding });

  const other = createMachineBinding({
    ...binding,
    taskDigest: 'f'.repeat(64),
    registeredAt: '2026-08-11T09:01:00.000Z',
  });
  assert.throws(
    () => projectMachineBindings(94, [marker, encodeMachineBindingMarker(other)]),
    /conflicting active mac-b machine bindings/u,
  );
});

test('machine-readable HOLD retains stale binding evidence and activates only its replacement', () => {
  const stale = createMachineBinding({
    controlIssue: 94,
    repositoryId: '123456789',
    machine: 'mac-b',
    taskDigest: B_TASK,
    bridgeCommit: '7'.repeat(40),
    registeredAt: '2026-08-11T09:00:00.000Z',
  });
  const hold = createMachineHold({
    binding: stale,
    heldAt: '2026-08-11T10:00:00.000Z',
  });
  const replacement = createMachineBinding({
    ...stale,
    bridgeCommit: HEAD,
    registeredAt: '2026-08-11T10:00:01.000Z',
  });
  const bodies = [
    encodeMachineBindingMarker(stale),
    encodeMachineHoldMarker(hold),
    encodeMachineBindingMarker(replacement),
  ];
  const state = projectMachineBindingState(94, bodies);
  assert.equal(state.active['mac-b'].bindingDigest, replacement.bindingDigest);
  assert.equal(state.held[stale.bindingDigest].taskDigest, B_TASK);
  assert.equal(state.holds[0].bindingDigest, stale.bindingDigest);
  assert.deepEqual(projectMachineBindings(94, [...bodies, encodeMachineHoldMarker(hold)]), {
    'mac-b': replacement,
  });
});
