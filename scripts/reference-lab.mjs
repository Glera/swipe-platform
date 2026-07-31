#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  accessSync,
  constants,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PROCESS_VERSION = 'reference-replication.v3';

const fail = (message) => {
  throw new Error(message);
};

export function parseArgs(argv) {
  const positionals = [];
  const options = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const key = token.slice(2);
    if (!key) fail('empty option');
    if (key === 'json') {
      options.json = true;
      continue;
    }
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) fail(`missing value for --${key}`);
    options[key] = value;
    index += 1;
  }
  return { positionals, options };
}

export function parseAdbDevices(output) {
  return String(output)
    .split(/\r?\n/u)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state, ...fields] = line.split(/\s+/u);
      const metadata = Object.fromEntries(fields
        .filter((field) => field.includes(':'))
        .map((field) => field.split(/:(.*)/su).slice(0, 2)));
      return { serial, state, metadata };
    });
}

const run = (command, args, spawn = spawnSync) => spawn(command, args, {
  encoding: 'utf8',
  timeout: 15_000,
});

const commandCheck = (command, args, spawn) => {
  const result = run(command, args, spawn);
  return {
    ok: result.status === 0,
    command,
    detail: result.status === 0
      ? String(result.stdout || result.stderr).split(/\r?\n/u)[0].trim()
      : String(result.error?.message || result.stderr || 'not available').trim(),
  };
};

const adbShell = (serial, args, spawn) => {
  const result = run('adb', ['-s', serial, 'shell', ...args], spawn);
  return result.status === 0 ? String(result.stdout).trim() : null;
};

const parseBattery = (text) => {
  if (!text) return null;
  const level = /^\s*level:\s*(\d+)/imu.exec(text)?.[1];
  const status = /^\s*status:\s*(\d+)/imu.exec(text)?.[1];
  const temperatureTenthsC = /^\s*temperature:\s*(\d+)/imu.exec(text)?.[1];
  return {
    levelPercent: level === undefined ? null : Number(level),
    chargingStatusCode: status === undefined ? null : Number(status),
    temperatureC: temperatureTenthsC === undefined
      ? null
      : Number(temperatureTenthsC) / 10,
  };
};

export function interpretAnimationScale(value) {
  if (value === 'null') {
    return { ok: true, effective: 1, detail: 'unset (Android default 1.0)' };
  }
  if (value === null) {
    return { ok: false, effective: null, detail: 'unavailable' };
  }
  const effective = Number(value);
  return {
    ok: Number.isFinite(effective) && effective === 1,
    effective: Number.isFinite(effective) ? effective : null,
    detail: value,
  };
}

export function runDoctor({ artifactRoot, spawn = spawnSync, access = accessSync }) {
  if (!artifactRoot || !path.isAbsolute(artifactRoot)) {
    fail('--artifact-root must be an absolute existing directory');
  }

  const checks = [];
  try {
    access(artifactRoot, constants.R_OK | constants.W_OK);
    checks.push({ id: 'artifact-root', ok: statSync(artifactRoot).isDirectory(), detail: artifactRoot });
  } catch (error) {
    checks.push({ id: 'artifact-root', ok: false, detail: error.message });
  }

  checks.push({ id: 'adb', ...commandCheck('adb', ['version'], spawn) });
  checks.push({ id: 'ffmpeg', ...commandCheck('ffmpeg', ['-version'], spawn) });
  checks.push({ id: 'ffprobe', ...commandCheck('ffprobe', ['-version'], spawn) });

  let device = null;
  const adbReady = checks.find(({ id }) => id === 'adb')?.ok;
  if (adbReady) {
    const devicesResult = run('adb', ['devices', '-l'], spawn);
    const devices = devicesResult.status === 0 ? parseAdbDevices(devicesResult.stdout) : [];
    const authorized = devices.filter(({ state }) => state === 'device');
    checks.push({
      id: 'single-authorized-device',
      ok: authorized.length === 1,
      detail: `${authorized.length} authorized / ${devices.length} connected`,
    });
    if (authorized.length === 1) {
      const { serial, metadata } = authorized[0];
      const scales = {
        animator: adbShell(serial, ['settings', 'get', 'global', 'animator_duration_scale'], spawn),
        transition: adbShell(serial, ['settings', 'get', 'global', 'transition_animation_scale'], spawn),
        window: adbShell(serial, ['settings', 'get', 'global', 'window_animation_scale'], spawn),
      };
      for (const [name, value] of Object.entries(scales)) {
        const interpreted = interpretAnimationScale(value);
        checks.push({
          id: `animation-scale-${name}`,
          ...interpreted,
        });
      }
      device = {
        serial,
        metadata,
        displaySize: adbShell(serial, ['wm', 'size'], spawn),
        displayDensity: adbShell(serial, ['wm', 'density'], spawn),
        refreshRate: adbShell(serial, ['dumpsys', 'display'], spawn)?.match(/\b(?:mRefreshRate|refreshRate)=?\s*(\d+(?:\.\d+)?)/u)?.[1] ?? null,
        scales,
        showTouches: adbShell(serial, ['settings', 'get', 'system', 'show_touches'], spawn),
        pointerLocation: adbShell(serial, ['settings', 'get', 'system', 'pointer_location'], spawn),
        lowPower: adbShell(serial, ['settings', 'get', 'global', 'low_power'], spawn),
        battery: parseBattery(adbShell(serial, ['dumpsys', 'battery'], spawn)),
        thermal: adbShell(serial, ['dumpsys', 'thermalservice'], spawn),
      };
    }
  } else {
    checks.push({ id: 'single-authorized-device', ok: false, detail: 'adb unavailable' });
  }

  const report = {
    schema: 'reference-lab-doctor.v1',
    processVersion: PROCESS_VERSION,
    checkedAt: new Date().toISOString(),
    artifactRoot,
    status: checks.every(({ ok }) => ok) ? 'pass' : 'fail',
    checks,
    device,
  };
  return report;
}

const sha256File = (file) => {
  const hash = createHash('sha256');
  hash.update(readFileSync(file));
  return hash.digest('hex');
};

export function hammingHex(left, right) {
  if (!/^[0-9a-f]+$/iu.test(left) || left.length !== right.length) {
    fail('perceptual hashes must be equal-length hexadecimal strings');
  }
  let distance = 0;
  for (let index = 0; index < left.length; index += 1) {
    const xor = Number.parseInt(left[index], 16) ^ Number.parseInt(right[index], 16);
    distance += xor.toString(2).replaceAll('0', '').length;
  }
  return distance;
}

export function compareInitialStates(clean, instrumented, threshold) {
  const equalFields = ['appBuild', 'level', 'normalizedStateFingerprint'];
  const mismatches = equalFields.filter((field) => clean[field] !== instrumented[field]);
  const perceptualDistance = hammingHex(clean.perceptualHash, instrumented.perceptualHash);
  if (clean.instrumentation !== false) mismatches.push('clean.instrumentation');
  if (instrumented.instrumentation !== true) mismatches.push('instrumented.instrumentation');
  return {
    ok: mismatches.length === 0 && perceptualDistance <= threshold,
    mismatches,
    perceptualDistance,
    threshold,
  };
}

const scenarioPath = (scenarioDir) => path.join(scenarioDir, 'scenario.json');

function initScenario(options) {
  const required = ['scenario-dir', 'mechanic', 'scenario-id', 'package', 'build', 'level', 'phash-threshold'];
  for (const key of required) if (!options[key]) fail(`scenario init requires --${key}`);
  if (!path.isAbsolute(options['scenario-dir'])) fail('--scenario-dir must be absolute');
  const threshold = Number(options['phash-threshold']);
  if (!Number.isInteger(threshold) || threshold < 0) fail('--phash-threshold must be a non-negative integer');
  mkdirSync(options['scenario-dir'], { recursive: false });
  const receipt = {
    schema: 'reference-scenario-pair.v1',
    processVersion: PROCESS_VERSION,
    mechanic: options.mechanic,
    scenarioId: options['scenario-id'],
    packageId: options.package,
    appBuild: options.build,
    level: options.level,
    perceptualHashThreshold: threshold,
    status: 'planned',
    channels: { clean: null, instrumented: null },
    gaps: [],
  };
  writeFileSync(scenarioPath(options['scenario-dir']), `${JSON.stringify(receipt, null, 2)}\n`, { flag: 'wx' });
  return receipt;
}

function attachScenario(options) {
  const required = ['scenario-dir', 'channel', 'video', 'state-receipt'];
  for (const key of required) if (!options[key]) fail(`scenario attach requires --${key}`);
  if (!['clean', 'instrumented'].includes(options.channel)) fail('--channel must be clean or instrumented');
  const receiptFile = scenarioPath(options['scenario-dir']);
  const receipt = JSON.parse(readFileSync(receiptFile, 'utf8'));
  const video = path.resolve(options.video);
  const stateReceipt = path.resolve(options['state-receipt']);
  if (!video.startsWith(`${path.resolve(options['scenario-dir'])}${path.sep}`)) {
    fail('--video must live inside --scenario-dir');
  }
  if (!stateReceipt.startsWith(`${path.resolve(options['scenario-dir'])}${path.sep}`)) {
    fail('--state-receipt must live inside --scenario-dir');
  }
  JSON.parse(readFileSync(stateReceipt, 'utf8'));
  receipt.channels[options.channel] = {
    video: path.relative(options['scenario-dir'], video),
    videoSha256: sha256File(video),
    stateReceipt: path.relative(options['scenario-dir'], stateReceipt),
    stateReceiptSha256: sha256File(stateReceipt),
  };
  receipt.status = 'pair-incomplete';
  writeFileSync(receiptFile, `${JSON.stringify(receipt, null, 2)}\n`);
  return receipt;
}

function verifyMedia(video, spawn = spawnSync) {
  const result = run('ffprobe', [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    video,
  ], spawn);
  const durationSeconds = Number(String(result.stdout).trim());
  return {
    ok: result.status === 0 && Number.isFinite(durationSeconds) && durationSeconds > 0,
    durationSeconds: Number.isFinite(durationSeconds) ? durationSeconds : null,
    detail: result.status === 0 ? null : String(result.stderr || result.error?.message || 'ffprobe failed').trim(),
  };
}

function verifyScenario(options, spawn = spawnSync) {
  if (!options['scenario-dir']) fail('scenario verify requires --scenario-dir');
  const receiptFile = scenarioPath(options['scenario-dir']);
  const receipt = JSON.parse(readFileSync(receiptFile, 'utf8'));
  const checks = [];
  const states = {};
  for (const channel of ['clean', 'instrumented']) {
    const entry = receipt.channels[channel];
    if (!entry) {
      checks.push({ id: `${channel}-attached`, ok: false, detail: 'missing' });
      continue;
    }
    const video = path.join(options['scenario-dir'], entry.video);
    const stateFile = path.join(options['scenario-dir'], entry.stateReceipt);
    checks.push({ id: `${channel}-video-hash`, ok: sha256File(video) === entry.videoSha256 });
    checks.push({ id: `${channel}-state-hash`, ok: sha256File(stateFile) === entry.stateReceiptSha256 });
    const media = verifyMedia(video, spawn);
    checks.push({ id: `${channel}-media`, ...media });
    states[channel] = JSON.parse(readFileSync(stateFile, 'utf8'));
  }
  if (states.clean && states.instrumented) {
    const comparison = compareInitialStates(
      states.clean,
      states.instrumented,
      receipt.perceptualHashThreshold,
    );
    checks.push({ id: 'initial-state-equivalence', ...comparison });
  }
  return {
    schema: 'reference-scenario-verification.v1',
    processVersion: PROCESS_VERSION,
    scenarioId: receipt.scenarioId,
    status: checks.length > 0 && checks.every(({ ok }) => ok) ? 'pass' : 'fail',
    checks,
  };
}

function printResult(result, json) {
  if (json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }
  process.stdout.write(`${result.schema}: ${result.status ?? 'ok'}\n`);
  for (const check of result.checks ?? []) {
    process.stdout.write(`  ${check.ok ? 'PASS' : 'FAIL'} ${check.id}${check.detail ? ` — ${check.detail}` : ''}\n`);
  }
}

function usage() {
  return [
    'usage:',
    '  reference-lab.mjs doctor --artifact-root <absolute-path> [--json]',
    '  reference-lab.mjs scenario init --scenario-dir <absolute-path> --mechanic <id> --scenario-id <id> --package <id> --build <id> --level <id> --phash-threshold <bits> [--json]',
    '  reference-lab.mjs scenario attach --scenario-dir <absolute-path> --channel clean|instrumented --video <path> --state-receipt <path> [--json]',
    '  reference-lab.mjs scenario verify --scenario-dir <absolute-path> [--json]',
  ].join('\n');
}

export function main(argv = process.argv.slice(2)) {
  const { positionals, options } = parseArgs(argv);
  let result;
  if (positionals[0] === 'doctor' && positionals.length === 1) {
    result = runDoctor({ artifactRoot: options['artifact-root'] });
  } else if (positionals[0] === 'scenario' && positionals[1] === 'init') {
    result = initScenario(options);
  } else if (positionals[0] === 'scenario' && positionals[1] === 'attach') {
    result = attachScenario(options);
  } else if (positionals[0] === 'scenario' && positionals[1] === 'verify') {
    result = verifyScenario(options);
  } else {
    fail(usage());
  }
  printResult(result, options.json);
  if (result.status === 'fail') process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`reference-lab: ${error.message}\n`);
    process.exitCode = 2;
  }
}
