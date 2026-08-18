#!/usr/bin/env node
// Model-free intake drain watcher, v0 (meta issue #136, piece 1 — drain-only).
//
// One PROCESS per tick (launchd StartInterval): no daemon loop, no AI, no
// tokens spent. Each tick re-exchanges the durable device-flow grant for a
// short-lived bearer and POSTs one bounded drain; an empty outbox is a pure
// DB read on the server (deviation from the #136 sketch's read-only pending
// probe, recorded there: the drain endpoint performs no external I/O when
// nothing is claimable, so a separate probe endpoint is not needed for v0).
//
// Fail-closed: any auth failure writes a durable pending marker and exits
// non-zero; the watcher never retries inside a tick, never falls back to
// anything, and never touches AI. Config and state live in ONE operator-owned
// directory with 0600 files.
//
//   node scripts/intake-drain-watcher.mjs --config ~/.p4g-intake-watcher/config.json [--dry-run]
//
// config.json: {
//   "baseUrl": "https://swipe-backend-541t.onrender.com",
//   "deviceCode": "<durable device-flow code approved by the operator>",
//   "maxDeliveries": 3,
//   "maxNotifications": 3
// }

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';

const MAX_BODY = 64 * 1024;

function fail(code, detail) {
  const line = JSON.stringify(
    detail === null
      ? { at: new Date().toISOString(), code }
      : { at: new Date().toISOString(), code, detail },
  );
  try {
    const dir = stateDir();
    mkdirSync(dir, { recursive: true, mode: 0o700 });
    writeFileSync(join(dir, 'pending-failure.json'), `${line}\n`, { mode: 0o600 });
  } catch {
    // The marker is best-effort; the exit code is the durable signal.
  }
  console.error(`intake-drain-watcher: ${code}`);
  process.exit(2);
}

let configPath = null;
let dryRun = false;
for (let i = 2; i < process.argv.length; i += 1) {
  const arg = process.argv[i];
  if (arg === '--config') { configPath = process.argv[i + 1]; i += 1; }
  else if (arg === '--dry-run') { dryRun = true; }
  else fail('usage_invalid', arg);
}
if (!configPath) fail('usage_invalid', '--config is required');

function stateDir() { return dirname(configPath); }

function clearPendingMarker() {
  try {
    rmSync(join(stateDir(), 'pending-failure.json'), { force: true });
  } catch {
    // Best-effort: a stale marker is preferable to failing a healthy tick.
  }
}

let config;
try {
  config = JSON.parse(readFileSync(configPath, 'utf8'));
} catch {
  // No detail: V8 parse errors embed a source snippet, and the config holds
  // the durable device code.
  fail('config_unreadable', null);
}
const baseUrl = typeof config.baseUrl === 'string' ? config.baseUrl.replace(/\/+$/u, '') : '';
const deviceCode = typeof config.deviceCode === 'string' ? config.deviceCode : '';
const maxDeliveries = Number.isInteger(config.maxDeliveries) ? config.maxDeliveries : 3;
const maxNotifications = Number.isInteger(config.maxNotifications) ? config.maxNotifications : 3;
if (!/^https:\/\/[a-z0-9.-]+$/u.test(baseUrl)) fail('config_invalid', 'baseUrl');
if (deviceCode.length < 16) fail('config_invalid', 'deviceCode');
if (maxDeliveries < 1 || maxDeliveries > 10 || maxNotifications < 1 || maxNotifications > 10) {
  fail('config_invalid', 'bounds');
}

async function post(path, body, bearer) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...(bearer ? { authorization: `Bearer ${bearer}` } : {}),
    },
    body: JSON.stringify(body),
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
  const raw = await response.text();
  if (raw.length > MAX_BODY) return { status: response.status, json: null, oversize: true };
  let json = null;
  try { json = JSON.parse(raw); } catch { /* non-JSON stays null */ }
  return { status: response.status, json, oversize: false };
}

const exchange = await post('/api/admin/device-auth/token', { deviceCode }).catch(
  (error) => fail('token_transport', String(error?.message ?? error)),
);
if (exchange.status !== 200 || typeof exchange.json?.access_token !== 'string') {
  // invalid_grant / expired_token: the durable window closed or the grant was
  // revoked. Never loop, never guess — surface and stop.
  fail('token_refused', `status=${exchange.status} error=${exchange.json?.error ?? 'unknown'}`);
}

if (dryRun) {
  clearPendingMarker();
  console.log(JSON.stringify({ schema: 'intake-drain-watcher-tick.v0', dryRun: true, auth: 'ok' }));
  process.exit(0);
}

const drain = await post(
  '/api/admin/development-intake/drain',
  { maxDeliveries, maxNotifications },
  exchange.json.access_token,
).catch((error) => fail('drain_transport', String(error?.message ?? error)));
if (drain.status === 409) {
  // Another drain holds the single-flight lock — bounded refusal, healthy.
  clearPendingMarker();
  console.log(JSON.stringify({ schema: 'intake-drain-watcher-tick.v0', drained: false, busy: true }));
  process.exit(0);
}
if (drain.oversize) {
  // The server very likely committed the drain; only the response is
  // unreadable. A distinct code keeps this from masquerading as a refusal.
  fail('drain_response_oversize', `status=${drain.status}`);
}
const receipt = drain.json;
const sections = receipt !== null && typeof receipt === 'object' && !Array.isArray(receipt)
  && receipt.schema === 'platform.development-intake.drain.receipt.v1'
  && receipt.delivery !== null && typeof receipt.delivery === 'object'
  && receipt.notifications !== null && typeof receipt.notifications === 'object';
if (drain.status !== 200) fail('drain_refused', `status=${drain.status}`);
if (!sections) fail('drain_unexpected_body', `status=${drain.status}`);
clearPendingMarker();
console.log(JSON.stringify({
  schema: 'intake-drain-watcher-tick.v0',
  drained: true,
  delivery: receipt.delivery,
  notifications: receipt.notifications,
}));
