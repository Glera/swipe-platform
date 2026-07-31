import assert from 'node:assert/strict';
import test from 'node:test';

import { replayTrace, validateTrace } from './reference-gesture-replay.mjs';

const TRACE = {
  schema: 'reference-device-gesture.v1',
  traceId: 'hold-at-gate',
  events: [
    { atMs: 0, action: 'DOWN', x: 10, y: 20 },
    { atMs: 100, action: 'MOVE', x: 30, y: 40 },
    { atMs: 600, action: 'UP', x: 30, y: 40 },
  ],
};

test('trace validation requires ordered DOWN/MOVE/UP device events', () => {
  assert.equal(validateTrace(TRACE).events.length, 3);
  assert.throws(
    () => validateTrace({ ...TRACE, events: [TRACE.events[1], TRACE.events[2]] }),
    /start with DOWN/u,
  );
  assert.throws(
    () => validateTrace({ ...TRACE, events: [TRACE.events[0], { ...TRACE.events[2], atMs: -1 }] }),
    /invalid or non-monotonic/u,
  );
});

test('replay receipt records scheduling drift and adb delivery duration', async () => {
  let clock = 0;
  const calls = [];
  const receipt = await replayTrace({
    serial: 'SERIAL',
    trace: {
      ...TRACE,
      events: [
        { atMs: 0, action: 'DOWN', x: 10, y: 20 },
        { atMs: 0, action: 'UP', x: 10, y: 20 },
      ],
    },
    now: () => clock,
    wallNow: () => '2026-07-31T00:00:00.000Z',
    spawn: (command, args) => {
      calls.push([command, args]);
      clock += 12;
      return { status: 0, stdout: '', stderr: '' };
    },
  });
  assert.equal(receipt.status, 'pass');
  assert.equal(receipt.deliveries[0].commandDurationMs, 12);
  assert.equal(receipt.deliveries[1].scheduleDriftMs, 12);
  assert.deepEqual(calls[0][1].slice(-6), ['input', 'touchscreen', 'motionevent', 'DOWN', '10', '20']);
});
