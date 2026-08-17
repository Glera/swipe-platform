import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  CADENCE_ACTIVE_MINUTES,
  CADENCE_IDLE_MINUTES,
  CADENCE_SIGNALS,
  IDLE_EPOCH_RECEIPT_FILENAME,
  IDLE_EPOCH_RECEIPT_SCHEMA,
  OWNERS_AVAILABLE_MESSAGE,
  availabilityTransition,
  deriveOwnersAvailability,
  idleEpochReceiptPath,
  readIdleEpochReceipt,
  recommendCadence,
  validateIdleEpochReceipt,
  writeIdleEpochReceipt,
} from './two-mac-cadence.mjs';

const cadence = recommendCadence;

const OBSERVED_AT = '2026-08-17T09:00:00.000Z';
const STALENESS_MS = 10 * 60 * 1000;
const A_TASK = 'a'.repeat(64);
const B_TASK = 'b'.repeat(64);

function at(offsetMs = 0) {
  return () => new Date(Date.parse(OBSERVED_AT) + offsetMs);
}

function instant(offsetMs = 0) {
  return new Date(Date.parse(OBSERVED_AT) + offsetMs).toISOString();
}

// One owner task entry. Freshness (`statusObservedAt`, re-read every poll) and
// idle-stretch identity (`idleSinceAt`, the onset of the current status) are
// separate inputs, so a test can move either one without moving the other.
function ownerTask(machine, {
  taskDigest = machine === 'mac-a' ? A_TASK : B_TASK,
  status = 'idle',
  idleSinceAt,
  statusObservedAt,
} = {}) {
  return { machine, taskDigest, status, idleSinceAt, statusObservedAt };
}

function idleState(overrides = {}) {
  return {
    bindings: { macA: 'c'.repeat(64), macB: 'd'.repeat(64) },
    ownerTasks: [
      ownerTask('mac-a', { idleSinceAt: instant(-60_000), statusObservedAt: instant(-60_000) }),
      ownerTask('mac-b', { idleSinceAt: instant(-30_000), statusObservedAt: instant(-30_000) }),
    ],
    unreadTargetedWakes: 0,
    activeSignals: [],
    operatorDecisionCount: 0,
    lastActivityMarker: 'comment:5296770192',
    ...overrides,
  };
}

function dataRoot() {
  return path.join(mkdtempSync(path.join(tmpdir(), 'two-mac-cadence-')), 'state');
}

function receipt(idleEpochId, overrides = {}) {
  return {
    schema: IDLE_EPOCH_RECEIPT_SCHEMA,
    idleEpochId,
    emittedAt: OBSERVED_AT,
    idempotencyKey: `owners-available:${idleEpochId}`,
    deliveryState: 'pending',
    ...overrides,
  };
}

test('cadence is 15 minutes only in the fully idle state and 2 minutes otherwise', () => {
  const idle = { ownersKnown: true, activeSignals: [], waitingForOtherOwner: false };
  assert.deepEqual(cadence(idle), { intervalMinutes: CADENCE_IDLE_MINUTES });
  assert.equal(CADENCE_IDLE_MINUTES, 15);
  assert.equal(CADENCE_ACTIVE_MINUTES, 2);

  // 15 -> 2 on any single live signal, on every token of the closed set.
  for (const signal of CADENCE_SIGNALS) {
    assert.deepEqual(
      cadence({ ...idle, activeSignals: [signal] }),
      { intervalMinutes: CADENCE_ACTIVE_MINUTES },
      `${signal} must keep the fast cadence`,
    );
  }
  // Fail-active: an unknown owner state is treated exactly like a live signal.
  assert.deepEqual(
    cadence({ ...idle, ownersKnown: false }),
    { intervalMinutes: CADENCE_ACTIVE_MINUTES },
  );
  assert.deepEqual(
    cadence({ ...idle, waitingForOtherOwner: true }),
    { intervalMinutes: CADENCE_ACTIVE_MINUTES },
  );
  // 2 -> 15 only when every reason for the fast pass is gone.
  assert.deepEqual(
    cadence({ ownersKnown: true, activeSignals: [], waitingForOtherOwner: false }),
    { intervalMinutes: CADENCE_IDLE_MINUTES },
  );
});

test('an unknown or unreadable cadence token is a hard error, never a quiet idle', () => {
  const idle = { ownersKnown: true, activeSignals: [], waitingForOtherOwner: false };
  assert.throws(
    () => cadence({ ...idle, activeSignals: ['owner_sleeping'] }),
    /unknown token: "owner_sleeping"/u,
  );
  assert.throws(() => cadence({ ...idle, activeSignals: ['ci', 'ci'] }), /must be unique/u);
  assert.throws(() => cadence({ ...idle, activeSignals: ['review', 'ci'] }), /must be sorted/u);
  assert.throws(() => cadence({ ...idle, activeSignals: 'ci' }), /must be an array/u);
  assert.throws(() => cadence({ ...idle, ownersKnown: 'yes' }), /must be a boolean/u);
  assert.throws(() => cadence({ ...idle, extra: true }), /has unexpected fields/u);
  assert.throws(() => cadence({ ownersKnown: true, activeSignals: [] }), /has unexpected fields/u);
});

test('an unchanged tick recommends the same cadence, which is the no-notify signal', () => {
  const observation = {
    ownersKnown: true,
    activeSignals: ['ci', 'review'],
    waitingForOtherOwner: false,
  };
  const first = recommendCadence(observation);
  const second = recommendCadence({ ...observation });
  assert.deepEqual(first, second);
  assert.deepEqual(Object.keys(first), ['intervalMinutes']);
});

test('owners are available only when both bindings, both idle tasks and zero signals agree', () => {
  const available = deriveOwnersAvailability(idleState(), { now: at(), stalenessMs: STALENESS_MS });
  assert.equal(available.available, true);
  assert.equal(available.reason, null);
  assert.match(available.idleEpochId, /^[0-9a-f]{64}$/u);

  // Pending operator decisions are carried, never a blocker.
  const withDecisions = deriveOwnersAvailability(
    idleState({ operatorDecisionCount: 3 }),
    { now: at(), stalenessMs: STALENESS_MS },
  );
  assert.equal(withDecisions.available, true);
  assert.equal(withDecisions.idleEpochId, available.idleEpochId);
});

test('an unknown, busy, stale or conflicting owner is a typed refusal, not an exception', () => {
  const withMacA = (overrides) => idleState({
    ownerTasks: [
      ownerTask('mac-a', {
        idleSinceAt: instant(-60_000), statusObservedAt: instant(-60_000), ...overrides,
      }),
      ownerTask('mac-b', { idleSinceAt: instant(-30_000), statusObservedAt: instant(-30_000) }),
    ],
  });
  const cases = [
    [idleState({ bindings: { macA: null, macB: 'd'.repeat(64) } }), 'bindings_unknown'],
    [withMacA({ status: 'active' }), 'owner_task_busy'],
    [withMacA({ status: 'unknown' }), 'owner_task_unknown'],
    [withMacA({ status: 'paused' }), 'owner_task_invalid'],
    [withMacA({ idleSinceAt: undefined }), 'owner_task_invalid'],
    [withMacA({ statusObservedAt: undefined }), 'owner_task_invalid'],
    [idleState({
      ownerTasks: [
        ownerTask('mac-a', { idleSinceAt: instant(-60_000), statusObservedAt: instant(-60_000) }),
      ],
    }), 'owner_task_missing'],
    [idleState({
      ownerTasks: [
        ...idleState().ownerTasks,
        ownerTask('mac-b', {
          taskDigest: 'e'.repeat(64), idleSinceAt: instant(0), statusObservedAt: instant(0),
        }),
      ],
    }), 'owner_task_conflicting'],
    // Only the observation instant can go stale, and both directions of the
    // bound refuse: too old to trust, and impossibly ahead of the clock.
    [withMacA({ statusObservedAt: instant(-STALENESS_MS - 1) }), 'owner_task_stale'],
    [withMacA({ statusObservedAt: instant(60_000) }), 'owner_task_stale'],
    [idleState({ unreadTargetedWakes: 1 }), 'unread_wakes'],
    [idleState({ activeSignals: ['handoff'] }), 'active_signals'],
  ];
  for (const [state, reason] of cases) {
    assert.deepEqual(
      deriveOwnersAvailability(state, { now: at(), stalenessMs: STALENESS_MS }),
      { available: false, reason, idleEpochId: null },
      `expected ${reason}`,
    );
  }

  // A malformed caller contract is still a hard error.
  assert.throws(
    () => deriveOwnersAvailability(idleState(), { now: at() }),
    /positive staleness bound/u,
  );
  assert.throws(
    () => deriveOwnersAvailability(idleState({ unreadTargetedWakes: -1 }), {
      now: at(), stalenessMs: STALENESS_MS,
    }),
    /non-negative strict integer/u,
  );
  assert.throws(
    () => deriveOwnersAvailability(idleState({ activeSignals: ['nap'] }), {
      now: at(), stalenessMs: STALENESS_MS,
    }),
    /unknown token/u,
  );
  assert.throws(
    () => deriveOwnersAvailability({ ...idleState(), extra: 1 }, {
      now: at(), stalenessMs: STALENESS_MS,
    }),
    /has unexpected fields/u,
  );
});

test('the idle epoch is stable while nothing happens and new after any activity', () => {
  const first = deriveOwnersAvailability(idleState(), { now: at(), stalenessMs: STALENESS_MS });
  // A later pass over the unchanged world, and sub-second jitter in the recorded
  // idle onset, are the same idle epoch.
  const later = deriveOwnersAvailability(idleState(), {
    now: at(5 * 60 * 1000), stalenessMs: STALENESS_MS,
  });
  const jittered = deriveOwnersAvailability(idleState({
    ownerTasks: [
      ownerTask('mac-a', { idleSinceAt: instant(-59_600), statusObservedAt: instant(-59_600) }),
      ownerTask('mac-b', { idleSinceAt: instant(-29_100), statusObservedAt: instant(-29_100) }),
    ],
  }), { now: at(), stalenessMs: STALENESS_MS });
  assert.equal(later.idleEpochId, first.idleEpochId);
  assert.equal(jittered.idleEpochId, first.idleEpochId);

  // Every fact that ends an idle stretch mints a different epoch.
  for (const overrides of [
    { lastActivityMarker: 'comment:5296770193' },
    { bindings: { macA: 'c'.repeat(64), macB: 'f'.repeat(64) } },
    {
      ownerTasks: [
        ownerTask('mac-a', { idleSinceAt: instant(-60_000), statusObservedAt: instant(-60_000) }),
        ownerTask('mac-b', {
          taskDigest: 'e'.repeat(64),
          idleSinceAt: instant(-30_000),
          statusObservedAt: instant(-30_000),
        }),
      ],
    },
    {
      ownerTasks: [
        ownerTask('mac-a', { idleSinceAt: instant(-60_000), statusObservedAt: instant(-60_000) }),
        ownerTask('mac-b', { idleSinceAt: instant(-5_000), statusObservedAt: instant(-5_000) }),
      ],
    },
  ]) {
    const changed = deriveOwnersAvailability(idleState(overrides), {
      now: at(), stalenessMs: STALENESS_MS,
    });
    assert.equal(changed.available, true);
    assert.notEqual(changed.idleEpochId, first.idleEpochId);
  }
});

test('re-observing an unchanged idle stretch is one epoch and exactly one message', () => {
  // Three consecutive polls of the same world: `now` and every statusObservedAt
  // advance, because that is what a poll does, while the idle onset and the last
  // activity marker do not move. Freshness is re-proven each tick; identity is
  // not re-minted, so the operator is told once.
  const onset = { macA: instant(-60_000), macB: instant(-30_000) };
  const poll = (offsetMs) => deriveOwnersAvailability(idleState({
    ownerTasks: [
      ownerTask('mac-a', {
        idleSinceAt: onset.macA, statusObservedAt: instant(offsetMs - 1_000),
      }),
      ownerTask('mac-b', {
        idleSinceAt: onset.macB, statusObservedAt: instant(offsetMs - 2_000),
      }),
    ],
  }), { now: at(offsetMs), stalenessMs: STALENESS_MS });

  const drive = (availabilities, startingReceipt) => {
    let previousReceipt = startingReceipt;
    const emitted = [];
    for (const availability of availabilities) {
      const transition = availabilityTransition({
        previousReceipt, availability, operatorDecisionCount: 0,
      });
      if (!transition.emit) continue;
      emitted.push(transition.idempotencyKey);
      previousReceipt = receipt(availability.idleEpochId);
    }
    return { emitted, previousReceipt };
  };

  const ticks = [poll(0), poll(5 * 60_000), poll(10 * 60_000)];
  for (const tick of ticks) {
    assert.equal(tick.available, true);
    assert.equal(tick.idleEpochId, ticks[0].idleEpochId);
  }
  const firstStretch = drive(ticks, null);
  assert.deepEqual(firstStretch.emitted, [`owners-available:${ticks[0].idleEpochId}`]);

  // A busy interlude: one owner picks up work, which is a status change and so a
  // new onset. Nothing is emitted while busy.
  const busy = deriveOwnersAvailability(idleState({
    ownerTasks: [
      ownerTask('mac-a', {
        status: 'active',
        idleSinceAt: instant(11 * 60_000),
        statusObservedAt: instant(11 * 60_000),
      }),
      ownerTask('mac-b', { idleSinceAt: onset.macB, statusObservedAt: instant(11 * 60_000) }),
    ],
  }), { now: at(11 * 60_000), stalenessMs: STALENESS_MS });
  assert.deepEqual(busy, { available: false, reason: 'owner_task_busy', idleEpochId: null });
  assert.deepEqual(
    drive([busy], firstStretch.previousReceipt).emitted,
    [],
  );

  // Back to idle with a new onset: a genuinely different stretch, announced
  // exactly once no matter how many polls observe it.
  const resumedOnset = instant(20 * 60_000);
  const resumed = [25, 30, 35].map((minutes) => deriveOwnersAvailability(idleState({
    ownerTasks: [
      ownerTask('mac-a', {
        idleSinceAt: resumedOnset, statusObservedAt: instant(minutes * 60_000 - 1_000),
      }),
      ownerTask('mac-b', {
        idleSinceAt: onset.macB, statusObservedAt: instant(minutes * 60_000 - 2_000),
      }),
    ],
  }), { now: at(minutes * 60_000), stalenessMs: STALENESS_MS }));
  for (const tick of resumed) {
    assert.equal(tick.available, true);
    assert.equal(tick.idleEpochId, resumed[0].idleEpochId);
  }
  assert.notEqual(resumed[0].idleEpochId, ticks[0].idleEpochId);
  assert.deepEqual(
    drive(resumed, firstStretch.previousReceipt).emitted,
    [`owners-available:${resumed[0].idleEpochId}`],
  );

  // The two facts stay separable in both directions: an ancient onset with a
  // fresh observation is a long idle stretch, not staleness...
  const longIdle = deriveOwnersAvailability(idleState({
    ownerTasks: [
      ownerTask('mac-a', {
        idleSinceAt: instant(-72 * 60 * 60_000), statusObservedAt: instant(-1_000),
      }),
      ownerTask('mac-b', {
        idleSinceAt: instant(-72 * 60 * 60_000), statusObservedAt: instant(-2_000),
      }),
    ],
  }), { now: at(), stalenessMs: STALENESS_MS });
  assert.equal(longIdle.available, true);
  // ...while a fresh onset nobody has re-observed inside the bound still fails
  // quiet, exactly as before.
  const unobserved = deriveOwnersAvailability(idleState({
    ownerTasks: [
      ownerTask('mac-a', {
        idleSinceAt: instant(-1_000), statusObservedAt: instant(-STALENESS_MS - 1),
      }),
      ownerTask('mac-b', { idleSinceAt: instant(-1_000), statusObservedAt: instant(-2_000) }),
    ],
  }), { now: at(), stalenessMs: STALENESS_MS });
  assert.deepEqual(
    unobserved,
    { available: false, reason: 'owner_task_stale', idleEpochId: null },
  );
});

test('busy to idle emits once, idle to idle stays silent, a new epoch emits again', () => {
  const busy = deriveOwnersAvailability(idleState({ activeSignals: ['merge'] }), {
    now: at(), stalenessMs: STALENESS_MS,
  });
  assert.deepEqual(
    availabilityTransition({ previousReceipt: null, availability: busy, operatorDecisionCount: 0 }),
    { emit: false, message: null, idempotencyKey: null },
  );

  const idle = deriveOwnersAvailability(idleState(), { now: at(), stalenessMs: STALENESS_MS });
  const emitted = availabilityTransition({
    previousReceipt: null, availability: idle, operatorDecisionCount: 0,
  });
  assert.deepEqual(emitted, {
    emit: true,
    message: 'Оба мака свободны. Можно дать следующую задачу.',
    idempotencyKey: `owners-available:${idle.idleEpochId}`,
  });
  assert.equal(emitted.message, OWNERS_AVAILABLE_MESSAGE);

  // idle -> idle: the same epoch is never announced twice.
  const recorded = receipt(idle.idleEpochId);
  assert.deepEqual(
    availabilityTransition({
      previousReceipt: recorded, availability: idle, operatorDecisionCount: 0,
    }),
    { emit: false, message: null, idempotencyKey: null },
  );

  // idle -> busy -> idle: one hour later both owners are observed idle again
  // after real work, which is one new epoch and exactly one new message.
  const hour = 60 * 60 * 1000;
  const afterWork = deriveOwnersAvailability(idleState({
    lastActivityMarker: 'comment:5296770300',
    ownerTasks: [
      ownerTask('mac-a', {
        idleSinceAt: instant(hour - 30_000), statusObservedAt: instant(hour - 30_000),
      }),
      ownerTask('mac-b', {
        idleSinceAt: instant(hour - 20_000), statusObservedAt: instant(hour - 20_000),
      }),
    ],
  }), { now: at(hour), stalenessMs: STALENESS_MS });
  assert.equal(afterWork.available, true);
  assert.notEqual(afterWork.idleEpochId, idle.idleEpochId);
  const second = availabilityTransition({
    previousReceipt: recorded, availability: afterWork, operatorDecisionCount: 0,
  });
  assert.equal(second.emit, true);
  assert.equal(second.idempotencyKey, `owners-available:${afterWork.idleEpochId}`);
  assert.deepEqual(
    availabilityTransition({
      previousReceipt: receipt(afterWork.idleEpochId),
      availability: afterWork,
      operatorDecisionCount: 0,
    }),
    { emit: false, message: null, idempotencyKey: null },
  );
});

test('pending operator decisions are counted in the message, never a blocker', () => {
  const idle = deriveOwnersAvailability(idleState({ operatorDecisionCount: 2 }), {
    now: at(), stalenessMs: STALENESS_MS,
  });
  assert.equal(idle.available, true);
  assert.equal(
    availabilityTransition({
      previousReceipt: null, availability: idle, operatorDecisionCount: 2,
    }).message,
    'Оба мака свободны. Можно дать следующую задачу. Также ждут вашего решения: 2.',
  );
  assert.equal(
    availabilityTransition({
      previousReceipt: null, availability: idle, operatorDecisionCount: 0,
    }).message,
    'Оба мака свободны. Можно дать следующую задачу.',
  );
  assert.throws(
    () => availabilityTransition({
      previousReceipt: null, availability: idle, operatorDecisionCount: 1.5,
    }),
    /non-negative strict integer/u,
  );
  assert.throws(
    () => availabilityTransition({
      previousReceipt: null,
      availability: { available: true, reason: null, idleEpochId: 'not-a-digest' },
      operatorDecisionCount: 0,
    }),
    /requires one exact idle epoch id/u,
  );
});

test('an ambiguous delivery is never blindly retried', () => {
  const idle = deriveOwnersAvailability(idleState(), { now: at(), stalenessMs: STALENESS_MS });
  for (const deliveryState of ['pending', 'delivered', 'ambiguous']) {
    assert.deepEqual(
      availabilityTransition({
        previousReceipt: receipt(idle.idleEpochId, { deliveryState }),
        availability: idle,
        operatorDecisionCount: 0,
      }),
      { emit: false, message: null, idempotencyKey: null },
      `${deliveryState} must not re-emit its own epoch`,
    );
  }
  // Only a genuinely new idle stretch may speak again after an unclear delivery.
  const next = deriveOwnersAvailability(idleState({ lastActivityMarker: 'comment:5296770400' }), {
    now: at(), stalenessMs: STALENESS_MS,
  });
  assert.equal(
    availabilityTransition({
      previousReceipt: receipt(idle.idleEpochId, { deliveryState: 'ambiguous' }),
      availability: next,
      operatorDecisionCount: 0,
    }).emit,
    true,
  );
});

test('the idle epoch receipt round-trips atomically and fails closed when unreadable', () => {
  const root = dataRoot();
  const idle = deriveOwnersAvailability(idleState(), { now: at(), stalenessMs: STALENESS_MS });
  assert.equal(readIdleEpochReceipt(root), null);

  const record = receipt(idle.idleEpochId, { deliveryState: 'delivered' });
  const written = writeIdleEpochReceipt(root, record);
  assert.equal(written, idleEpochReceiptPath(root));
  assert.equal(statSync(root).mode & 0o777, 0o700);
  assert.equal(statSync(written).mode & 0o777, 0o600);
  assert.deepEqual(readdirSync(root), [IDLE_EPOCH_RECEIPT_FILENAME]);
  assert.deepEqual(readIdleEpochReceipt(root), record);

  // An unreadable suppression record is never deleted and never read as absent:
  // losing it would cost the operator a duplicate message.
  writeFileSync(written, 'not json at all');
  assert.throws(() => readIdleEpochReceipt(root), /unreadable and was not removed/u);
  assert.equal(existsSync(written), true);
  writeFileSync(written, JSON.stringify({ ...record, idempotencyKey: 'owners-available:other' }));
  assert.throws(() => readIdleEpochReceipt(root), /does not bind its idle epoch/u);
  assert.equal(existsSync(written), true);

  assert.throws(() => validateIdleEpochReceipt({ ...record, deliveryState: 'sent' }), /deliveryState is invalid/u);
  assert.throws(() => validateIdleEpochReceipt({ ...record, schema: 'other' }), /schema is invalid/u);
  assert.throws(() => writeIdleEpochReceipt(root, { ...record, emittedAt: '2026-08-17T09:00:00Z' }), /canonical UTC milliseconds/u);
  assert.throws(() => idleEpochReceiptPath('state'), /must be an absolute path/u);
});

test('a failed receipt write leaves no staged file and no partial suppression record', () => {
  const root = dataRoot();
  const idle = deriveOwnersAvailability(idleState(), { now: at(), stalenessMs: STALENESS_MS });
  assert.throws(
    () => writeIdleEpochReceipt(root, receipt(idle.idleEpochId), {
      fs: {
        fsyncSync: () => {
          throw new Error('injected fsync failure');
        },
      },
    }),
    /injected fsync failure/u,
  );
  assert.deepEqual(readdirSync(root), []);
  assert.equal(readIdleEpochReceipt(root), null);
});
