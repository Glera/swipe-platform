#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';

const ACTIONS = new Set(['DOWN', 'MOVE', 'UP']);

const fail = (message) => {
  throw new Error(message);
};

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const token = argv[index];
    const value = argv[index + 1];
    if (!token?.startsWith('--') || value === undefined) {
      fail('expected --serial <adb-serial> --trace <json> --receipt <json>');
    }
    options[token.slice(2)] = value;
  }
  for (const key of ['serial', 'trace', 'receipt']) {
    if (!options[key]) fail(`missing --${key}`);
  }
  return options;
}

export function validateTrace(input) {
  if (input?.schema !== 'reference-device-gesture.v1') {
    fail('trace schema must be reference-device-gesture.v1');
  }
  if (!input.traceId || !Array.isArray(input.events) || input.events.length < 2) {
    fail('traceId and at least two events are required');
  }
  let priorAt = -1;
  const events = input.events.map((event, index) => {
    const atMs = Number(event.atMs);
    const x = Number(event.x);
    const y = Number(event.y);
    if (!Number.isFinite(atMs) || atMs < 0 || atMs < priorAt) {
      fail(`event ${index} has invalid or non-monotonic atMs`);
    }
    if (!ACTIONS.has(event.action)) fail(`event ${index} has invalid action`);
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) {
      fail(`event ${index} has invalid coordinates`);
    }
    priorAt = atMs;
    return { atMs, action: event.action, x, y };
  });
  if (events[0].action !== 'DOWN' || events.at(-1).action !== 'UP') {
    fail('trace must start with DOWN and end with UP');
  }
  if (events.slice(1, -1).some(({ action }) => action !== 'MOVE')) {
    fail('events between DOWN and UP must be MOVE');
  }
  return {
    schema: input.schema,
    traceId: input.traceId,
    coordinateSpace: input.coordinateSpace ?? 'device-pixels',
    events,
  };
}

const waitUntil = async (deadlineMs, now = () => performance.now()) => {
  while (true) {
    const remaining = deadlineMs - now();
    if (remaining <= 0) return;
    await new Promise((resolve) => setTimeout(resolve, Math.min(remaining, 25)));
  }
};

export async function replayTrace({
  serial,
  trace,
  spawn = spawnSync,
  now = () => performance.now(),
  wallNow = () => new Date().toISOString(),
}) {
  const validated = validateTrace(trace);
  const startedAt = now();
  const wallStartedAt = wallNow();
  const deliveries = [];
  for (const event of validated.events) {
    await waitUntil(startedAt + event.atMs, now);
    const invokedAt = now();
    const result = spawn('adb', [
      '-s', serial,
      'shell', 'input', 'touchscreen', 'motionevent',
      event.action, String(event.x), String(event.y),
    ], { encoding: 'utf8', timeout: 5_000 });
    const completedAt = now();
    deliveries.push({
      ...event,
      invokedAtMs: invokedAt - startedAt,
      completedAtMs: completedAt - startedAt,
      scheduleDriftMs: invokedAt - startedAt - event.atMs,
      commandDurationMs: completedAt - invokedAt,
      ok: result.status === 0,
      detail: result.status === 0
        ? null
        : String(result.stderr || result.error?.message || 'adb input failed').trim(),
    });
  }
  return {
    schema: 'reference-device-gesture-receipt.v1',
    traceId: validated.traceId,
    serial,
    wallStartedAt,
    durationMs: now() - startedAt,
    status: deliveries.every(({ ok }) => ok) ? 'pass' : 'fail',
    deliveries,
  };
}

async function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (!path.isAbsolute(options.trace) || !path.isAbsolute(options.receipt)) {
    fail('--trace and --receipt must be absolute paths');
  }
  const trace = JSON.parse(readFileSync(options.trace, 'utf8'));
  const receipt = await replayTrace({ serial: options.serial, trace });
  writeFileSync(options.receipt, `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  if (receipt.status !== 'pass') process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    process.stderr.write(`reference-gesture-replay: ${error.message}\n`);
    process.exitCode = 2;
  }
}
