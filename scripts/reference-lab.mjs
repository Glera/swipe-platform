#!/usr/bin/env node
// Reference Device Lab 0–1.
//
// Agent-operated, allowlisted Android capture using adb. Raw media and private
// transport identity stay under .artifacts/reference-lab/ (gitignored).
// Exported manifests contain content hashes, never the adb serial.
//
// Process authority: docs/mechanics/REFERENCE-REPLICATION-PROCESS.md
// Device contract: docs/mechanics/REFERENCE-DEVICE-LAB.md
//
// Requirements: Node >= 20, Android Platform Tools, no npm dependencies.

import crypto from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(SCRIPT_DIR, '..');
const DEFAULT_LAB_ROOT = path.join(
  WORKSPACE_ROOT,
  '.artifacts',
  'reference-lab',
);
const LOCAL_ADB = path.join(
  DEFAULT_LAB_ROOT,
  'tools',
  'platform-tools',
  'adb',
);
const PRIVATE_DEVICE_FILE = '.device.json';
const RECORDING_STATE_FILE = '.recording.json';
const SESSION_FILE = 'session.json';
const ACTIONS_FILE = 'actions.jsonl';
const MANIFEST_FILE = 'manifest.json';
const MAX_ADB_OUTPUT = 128 * 1024 * 1024;
const MAX_RECORD_SECONDS = 180;
const PACKAGE_RE =
  /^[A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z][A-Za-z0-9_]*)+$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const LABEL_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function nowIso() {
  return new Date().toISOString();
}

function jsonOut(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function fail(message, code = 1) {
  const error = new Error(message);
  error.exitCode = code;
  throw error;
}

function assertSafeText(value, name, re = LABEL_RE) {
  if (typeof value !== 'string' || !re.test(value)) {
    fail(`invalid ${name}`);
  }
  return value;
}

function resolveLabRoot(input) {
  const root = path.resolve(input || DEFAULT_LAB_ROOT);
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  return fs.realpathSync(root);
}

function findOnPath(name) {
  for (const dir of String(process.env.PATH || '').split(path.delimiter)) {
    if (!dir) continue;
    const candidate = path.join(dir, name);
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      return candidate;
    } catch {
      // Keep searching.
    }
  }
  return null;
}

function resolveAdb(input, labRoot) {
  const candidates = [
    input,
    process.env.REFERENCE_LAB_ADB,
    path.join(labRoot, 'tools', 'platform-tools', 'adb'),
    LOCAL_ADB,
    process.env.ANDROID_HOME
      ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb')
      : null,
    process.env.ANDROID_SDK_ROOT
      ? path.join(process.env.ANDROID_SDK_ROOT, 'platform-tools', 'adb')
      : null,
    findOnPath('adb'),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const absolute = path.resolve(candidate);
    try {
      fs.accessSync(absolute, fs.constants.X_OK);
      return absolute;
    } catch {
      // Keep searching.
    }
  }
  fail(
    'adb not found; install Android Platform Tools or set REFERENCE_LAB_ADB',
    2,
  );
}

function redact(value, serial) {
  const text = String(value || '');
  return serial ? text.split(serial).join('<device>') : text;
}

function adbRun(
  adb,
  serial,
  args,
  { binary = false, allowFailure = false, timeout = 30_000 } = {},
) {
  const fullArgs = serial ? ['-s', serial, ...args] : args;
  const result = spawnSync(adb, fullArgs, {
    encoding: binary ? null : 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout,
    maxBuffer: MAX_ADB_OUTPUT,
    env: process.env,
  });
  if (result.error) {
    fail(`adb execution failed: ${redact(result.error.message, serial)}`);
  }
  if (result.status !== 0 && !allowFailure) {
    const stderr = redact(
      binary
        ? Buffer.from(result.stderr || '').toString('utf8')
        : result.stderr,
      serial,
    ).trim();
    fail(`adb command failed${stderr ? `: ${stderr}` : ''}`);
  }
  return {
    ok: result.status === 0,
    status: result.status ?? 1,
    stdout: result.stdout ?? (binary ? Buffer.alloc(0) : ''),
    stderr: result.stderr ?? (binary ? Buffer.alloc(0) : ''),
  };
}

function parseDevices(output) {
  const devices = [];
  for (const raw of String(output).split('\n').slice(1)) {
    const line = raw.trim();
    if (!line) continue;
    const parts = line.split(/\s+/);
    const serial = parts[0];
    const state = parts[1] || 'unknown';
    const attributes = {};
    for (const token of parts.slice(2)) {
      const separator = token.indexOf(':');
      if (separator > 0) {
        attributes[token.slice(0, separator)] = token.slice(separator + 1);
      }
    }
    devices.push({ serial, state, attributes });
  }
  return devices;
}

function publicDeviceId(serial) {
  return `device-${sha256(Buffer.from(serial)).slice(0, 12)}`;
}

function selectDevice(adb, requestedSerial) {
  const output = adbRun(adb, null, ['devices', '-l']).stdout;
  const devices = parseDevices(output);
  if (requestedSerial) {
    const exact = devices.find((device) => device.serial === requestedSerial);
    if (!exact) fail('requested Android device is not connected');
    if (exact.state !== 'device') {
      fail(
        exact.state === 'unauthorized'
          ? 'Android device is unauthorized; unlock it and accept the RSA prompt'
          : `Android device is not ready (${exact.state})`,
      );
    }
    return exact;
  }

  const ready = devices.filter((device) => device.state === 'device');
  if (ready.length === 1) return ready[0];
  if (ready.length > 1) {
    fail(
      `multiple Android devices are connected (${ready
        .map((device) => publicDeviceId(device.serial))
        .join(', ')}); pass --serial`,
    );
  }
  const unauthorized = devices.filter(
    (device) => device.state === 'unauthorized',
  );
  if (unauthorized.length > 0) {
    fail('Android device is unauthorized; unlock it and accept the RSA prompt');
  }
  fail('no authorized Android device is connected');
}

function shellText(adb, serial, args, options) {
  return String(adbRun(adb, serial, ['shell', ...args], options).stdout).trim();
}

function parseWmSize(output) {
  const override = String(output).match(/Override size:\s*(\d+)x(\d+)/i);
  const physical = String(output).match(/Physical size:\s*(\d+)x(\d+)/i);
  const match = override || physical || String(output).match(/(\d+)x(\d+)/);
  if (!match) fail('cannot parse Android display size');
  return [Number(match[1]), Number(match[2])];
}

function parseWmDensity(output) {
  const override = String(output).match(/Override density:\s*(\d+)/i);
  const physical = String(output).match(/Physical density:\s*(\d+)/i);
  const match = override || physical || String(output).match(/(\d+)/);
  return match ? Number(match[1]) : null;
}

function foregroundPackage(adb, serial) {
  const outputs = [
    shellText(adb, serial, ['dumpsys', 'window', 'windows'], {
      allowFailure: true,
    }),
    shellText(adb, serial, ['dumpsys', 'activity', 'activities'], {
      allowFailure: true,
    }),
  ];
  const patterns = [
    /mCurrentFocus=.*?\s([A-Za-z0-9_.$]+)\//,
    /mFocusedApp=.*?\s([A-Za-z0-9_.$]+)\//,
    /mResumedActivity:.*?\s([A-Za-z0-9_.$]+)\//,
    /topResumedActivity=.*?\s([A-Za-z0-9_.$]+)\//,
  ];
  for (const output of outputs) {
    for (const pattern of patterns) {
      const match = output.match(pattern);
      if (match) return match[1];
    }
  }
  return null;
}

function displayInfo(adb, serial) {
  const displayPx = parseWmSize(shellText(adb, serial, ['wm', 'size']));
  const densityDpi = parseWmDensity(
    shellText(adb, serial, ['wm', 'density'], { allowFailure: true }),
  );
  const displayDump = shellText(adb, serial, ['dumpsys', 'display'], {
    allowFailure: true,
  });
  const refreshMatch =
    displayDump.match(/mRefreshRate=([0-9.]+)/) ||
    displayDump.match(/\bfps=([0-9.]+)/) ||
    displayDump.match(/\brefreshRate=([0-9.]+)/);
  return {
    displayPx,
    densityDpi,
    refreshRateHz: refreshMatch ? Number(refreshMatch[1]) : null,
    orientation:
      displayPx[1] >= displayPx[0] ? 'portrait' : 'landscape',
  };
}

function prop(adb, serial, name) {
  return shellText(adb, serial, ['getprop', name], {
    allowFailure: true,
  });
}

function systemSetting(adb, serial, name) {
  return shellText(adb, serial, ['settings', 'get', 'system', name], {
    allowFailure: true,
  });
}

function sanitizeDeviceInfo(adb, device) {
  return {
    id: publicDeviceId(device.serial),
    transport: device.serial.includes(':') ? 'network' : 'usb',
    manufacturer: prop(adb, device.serial, 'ro.product.manufacturer') || null,
    model:
      prop(adb, device.serial, 'ro.product.model') ||
      device.attributes.model ||
      null,
    androidVersion:
      prop(adb, device.serial, 'ro.build.version.release') || null,
    apiLevel: Number(prop(adb, device.serial, 'ro.build.version.sdk')) || null,
    bootCompleted: prop(adb, device.serial, 'sys.boot_completed') === '1',
    captureSettings: {
      showTouches: systemSetting(adb, device.serial, 'show_touches') === '1',
      pointerLocation:
        systemSetting(adb, device.serial, 'pointer_location') === '1',
    },
    ...displayInfo(adb, device.serial),
  };
}

function packageInfo(adb, serial, packageId) {
  const installed = adbRun(
    adb,
    serial,
    ['shell', 'pm', 'path', packageId],
    { allowFailure: true },
  );
  if (!installed.ok || !String(installed.stdout).includes('package:')) {
    fail(`package is not installed: ${packageId}`);
  }
  const dump = shellText(adb, serial, ['dumpsys', 'package', packageId]);
  const versionName = dump.match(/\bversionName=([^\s]+)/)?.[1] || null;
  const versionCode = dump.match(/\bversionCode=(\d+)/)?.[1] || null;
  return {
    packageId,
    versionName,
    versionCode,
  };
}

function commonInfo(adb, device, packageId) {
  const info = {
    schema: 'reference-device-info.v1',
    capturedAt: nowIso(),
    device: sanitizeDeviceInfo(adb, device),
    foregroundPackage: foregroundPackage(adb, device.serial),
  };
  if (packageId) {
    info.app = packageInfo(adb, device.serial, packageId);
  }
  return info;
}

function parseTargetLevels(value) {
  if (!value) return [];
  const result = [];
  for (const part of value.split(',')) {
    const token = part.trim();
    const range = token.match(/^(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      if (start > end || end - start > 99) fail('invalid target level range');
      for (let current = start; current <= end; current += 1) {
        result.push(String(current));
      }
    } else if (/^\d+$/.test(token)) {
      result.push(String(Number(token)));
    } else if (LABEL_RE.test(token)) {
      result.push(token);
    } else {
      fail('invalid target level');
    }
  }
  return [...new Set(result)];
}

function ensureInside(root, candidate, label) {
  const relative = path.relative(root, candidate);
  if (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  ) {
    return candidate;
  }
  fail(`${label} must stay inside the reference lab root`);
}

function resolveSession(labRoot, input) {
  if (!input) fail('--session is required');
  let candidate;
  if (input.includes('/') || input.includes(path.sep)) {
    candidate = path.resolve(input);
  } else {
    const matches = [];
    for (const mechanic of fs.readdirSync(labRoot, { withFileTypes: true })) {
      if (!mechanic.isDirectory() || mechanic.name === 'tools') continue;
      const possible = path.join(labRoot, mechanic.name, input);
      if (fs.existsSync(path.join(possible, SESSION_FILE))) matches.push(possible);
    }
    if (matches.length !== 1) {
      fail(
        matches.length === 0
          ? `unknown capture id: ${input}`
          : `ambiguous capture id: ${input}`,
      );
    }
    [candidate] = matches;
  }
  ensureInside(labRoot, candidate, 'session');
  const real = fs.realpathSync(candidate);
  ensureInside(labRoot, real, 'session');
  if (!fs.existsSync(path.join(real, SESSION_FILE))) {
    fail('invalid reference lab session');
  }
  return real;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    fail(`invalid JSON state: ${path.basename(file)}`);
  }
}

function validateSessionState(session) {
  if (
    !session ||
    session.schema !== 'reference-session.v1' ||
    typeof session.captureId !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      session.captureId,
    ) ||
    !SLUG_RE.test(session.mechanic || '') ||
    !PACKAGE_RE.test(session.packageId || '')
  ) {
    fail('invalid reference lab session state');
  }
  return session;
}

function validatePrivateDeviceState(privateDevice) {
  if (
    !privateDevice ||
    privateDevice.schema !== 'reference-private-device.v1' ||
    typeof privateDevice.serial !== 'string' ||
    privateDevice.serial.length < 1 ||
    privateDevice.serial.length > 200 ||
    privateDevice.serial.startsWith('-') ||
    /[\r\n\0]/.test(privateDevice.serial)
  ) {
    fail('invalid private Android device binding');
  }
  return privateDevice;
}

function validateRecordingState(state) {
  const remotePid = state?.remotePid || state?.pid;
  if (
    !state ||
    state.schema !== 'reference-recording-state.v1' ||
    typeof state.recordingId !== 'string' ||
    !/^[0-9a-f-]{36}$/i.test(state.recordingId) ||
    typeof remotePid !== 'string' ||
    !/^[1-9]\d{0,9}$/.test(remotePid) ||
    (state.hostPid !== undefined &&
      (typeof state.hostPid !== 'string' ||
        !/^[1-9]\d{0,9}$/.test(state.hostPid))) ||
    typeof state.startedAt !== 'string' ||
    !Number.isFinite(Date.parse(state.startedAt)) ||
    !Number.isInteger(state.timeLimitSeconds) ||
    state.timeLimitSeconds < 1 ||
    state.timeLimitSeconds > MAX_RECORD_SECONDS ||
    state.remotePath !==
      `/sdcard/p4g-reference-lab-${state.recordingId}.mp4`
  ) {
    fail('invalid recording state');
  }
  state.remotePid = remotePid;
  return state;
}

function writeJson(file, value, mode = 0o600) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, {
    mode,
    flag: 'w',
  });
  fs.chmodSync(file, mode);
}

function sessionContext(labRoot, sessionInput, adbOverride, serialOverride) {
  const sessionDir = resolveSession(labRoot, sessionInput);
  const session = validateSessionState(
    readJson(path.join(sessionDir, SESSION_FILE)),
  );
  const privateDevice = validatePrivateDeviceState(
    readJson(path.join(sessionDir, PRIVATE_DEVICE_FILE)),
  );
  const adb = resolveAdb(adbOverride, labRoot);
  const requestedSerial = serialOverride || privateDevice.serial;
  if (
    serialOverride &&
    privateDevice.serial &&
    serialOverride !== privateDevice.serial
  ) {
    fail('session is bound to a different Android device');
  }
  const device = selectDevice(adb, requestedSerial);
  return { sessionDir, session, adb, device };
}

function readActions(sessionDir) {
  const file = path.join(sessionDir, ACTIONS_FILE);
  if (!fs.existsSync(file)) return [];
  const actions = fs
    .readFileSync(file, 'utf8')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        fail('actions.jsonl contains invalid JSON');
      }
    });
  let previous = null;
  actions.forEach((action, index) => {
    if (action.seq !== index + 1) fail('actions.jsonl sequence is invalid');
    if (action.prevSha256 !== previous) {
      fail('actions.jsonl hash chain is invalid');
    }
    const { entrySha256, ...payload } = action;
    const expected = sha256(Buffer.from(JSON.stringify(payload)));
    if (entrySha256 !== expected) fail('actions.jsonl entry hash is invalid');
    previous = entrySha256;
  });
  return actions;
}

function appendAction(sessionDir, event, details = {}) {
  const actions = readActions(sessionDir);
  const payload = {
    schema: 'reference-action.v1',
    seq: actions.length + 1,
    at: nowIso(),
    event,
    ...details,
    prevSha256:
      actions.length > 0 ? actions[actions.length - 1].entrySha256 : null,
  };
  const action = {
    ...payload,
    entrySha256: sha256(Buffer.from(JSON.stringify(payload))),
  };
  fs.appendFileSync(
    path.join(sessionDir, ACTIONS_FILE),
    `${JSON.stringify(action)}\n`,
    { mode: 0o600 },
  );
  return action;
}

function artifactRecord(sessionDir, file) {
  const bytes = fs.readFileSync(file);
  return {
    path: path.relative(sessionDir, file).split(path.sep).join('/'),
    sha256: sha256(bytes),
    bytes: bytes.length,
  };
}

function safeArtifactLabel(input, fallback) {
  if (!input) return fallback;
  return assertSafeText(input, 'artifact label');
}

function timestampForFile() {
  return nowIso().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function requireForeground(adb, serial, packageId) {
  const foreground = foregroundPackage(adb, serial);
  if (!foreground) {
    fail('cannot determine foreground package; no input was sent');
  }
  if (foreground !== packageId) {
    fail(
      `allowlist guard: session package is not foreground (${foreground})`,
    );
  }
  return foreground;
}

function coordinates(adb, serial, options, prefix = '') {
  const [width, height] = displayInfo(adb, serial).displayPx;
  const xName = prefix ? `${prefix}x` : 'x';
  const yName = prefix ? `${prefix}y` : 'y';
  const nxName = prefix ? `${prefix}nx` : 'nx';
  const nyName = prefix ? `${prefix}ny` : 'ny';
  const hasPixels = options[xName] !== undefined || options[yName] !== undefined;
  const hasNormalized =
    options[nxName] !== undefined || options[nyName] !== undefined;
  if (hasPixels === hasNormalized) {
    fail(
      `provide either --${xName}/--${yName} or --${nxName}/--${nyName}`,
    );
  }

  let x;
  let y;
  if (hasPixels) {
    x = integerOption(options[xName], xName, 0, width - 1);
    y = integerOption(options[yName], yName, 0, height - 1);
  } else {
    const nx = numberOption(options[nxName], nxName, 0, 1);
    const ny = numberOption(options[nyName], nyName, 0, 1);
    x = Math.round(nx * (width - 1));
    y = Math.round(ny * (height - 1));
  }
  return {
    px: [x, y],
    normalized: [
      Number((x / Math.max(1, width - 1)).toFixed(6)),
      Number((y / Math.max(1, height - 1)).toFixed(6)),
    ],
    displayPx: [width, height],
  };
}

function numberOption(value, name, min, max) {
  if (value === undefined) fail(`--${name} is required`);
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    fail(`invalid --${name}`);
  }
  return number;
}

function integerOption(value, name, min, max) {
  const number = numberOption(value, name, min, max);
  if (!Number.isInteger(number)) fail(`--${name} must be an integer`);
  return number;
}

function commandDoctor(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const adb = resolveAdb(options.adb, labRoot);
  const device = selectDevice(adb, options.serial);
  const version = adbRun(adb, null, ['version']).stdout
    .split('\n')
    .filter(Boolean)
    .slice(0, 3);
  const info = commonInfo(adb, device, options.package);
  return {
    schema: 'reference-lab-doctor.v1',
    ok: true,
    checkedAt: nowIso(),
    adb: {
      version,
      executableSha256: sha256(fs.readFileSync(adb)),
    },
    device: info.device,
    foregroundPackage: info.foregroundPackage,
    app: info.app || null,
    checks: {
      authorized: true,
      bootCompleted: info.device.bootCompleted,
      displayReadable:
        info.device.displayPx[0] > 0 && info.device.displayPx[1] > 0,
      showTouchesEnabled: info.device.captureSettings.showTouches,
    },
  };
}

function commandInfo(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  if (options.session) {
    const context = sessionContext(
      labRoot,
      options.session,
      options.adb,
      options.serial,
    );
    return commonInfo(
      context.adb,
      context.device,
      context.session.packageId,
    );
  }
  const adb = resolveAdb(options.adb, labRoot);
  const device = selectDevice(adb, options.serial);
  const packageId = options.package
    ? assertSafeText(options.package, 'package', PACKAGE_RE)
    : null;
  return commonInfo(adb, device, packageId);
}

function commandSessionStart(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const adb = resolveAdb(options.adb, labRoot);
  const device = selectDevice(adb, options.serial);
  const mechanic = assertSafeText(options.mechanic, 'mechanic', SLUG_RE);
  const packageId = assertSafeText(options.package, 'package', PACKAGE_RE);
  const accountCohort = options['account-cohort']
    ? assertSafeText(options['account-cohort'], 'account cohort')
    : null;
  const targetLevels = parseTargetLevels(options['target-levels']);
  const info = commonInfo(adb, device, packageId);
  const captureId = crypto.randomUUID();
  const sessionDir = path.join(labRoot, mechanic, captureId);
  fs.mkdirSync(path.join(sessionDir, 'captures'), {
    recursive: true,
    mode: 0o700,
  });
  fs.mkdirSync(path.join(sessionDir, 'recordings'), {
    recursive: true,
    mode: 0o700,
  });
  const session = {
    schema: 'reference-session.v1',
    captureId,
    createdAt: nowIso(),
    mechanic,
    packageId,
    app: info.app,
    device: info.device,
    targetLevels,
    accountCohort,
  };
  writeJson(path.join(sessionDir, SESSION_FILE), session);
  writeJson(
    path.join(sessionDir, PRIVATE_DEVICE_FILE),
    {
      schema: 'reference-private-device.v1',
      serial: device.serial,
    },
    0o600,
  );
  appendAction(sessionDir, 'session.start', {
    captureId,
    mechanic,
    packageId,
    app: info.app,
    device: info.device,
    targetLevels,
    accountCohort,
  });
  return {
    schema: 'reference-session-start.v1',
    captureId,
    sessionDir,
    session,
  };
}

function commandLaunch(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  packageInfo(context.adb, context.device.serial, context.session.packageId);
  const resolved = shellText(context.adb, context.device.serial, [
    'cmd',
    'package',
    'resolve-activity',
    '--brief',
    '-a',
    'android.intent.action.MAIN',
    '-c',
    'android.intent.category.LAUNCHER',
    context.session.packageId,
  ]);
  const component = resolved
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith(`${context.session.packageId}/`));
  if (
    !component ||
    !/^[A-Za-z0-9_.]+\/[A-Za-z0-9_.$]+$/.test(component)
  ) {
    fail(`could not resolve launcher activity for ${context.session.packageId}`);
  }
  const result = adbRun(context.adb, context.device.serial, [
    'shell',
    'am',
    'start',
    '-W',
    '-n',
    component,
  ]);
  const action = appendAction(context.sessionDir, 'app.launch', {
    packageId: context.session.packageId,
    component,
    accepted: true,
  });
  return {
    schema: 'reference-launch.v1',
    ok: result.ok,
    packageId: context.session.packageId,
    action,
  };
}

function commandStop(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  packageInfo(context.adb, context.device.serial, context.session.packageId);
  adbRun(context.adb, context.device.serial, [
    'shell',
    'am',
    'force-stop',
    context.session.packageId,
  ]);
  const action = appendAction(context.sessionDir, 'app.stop', {
    packageId: context.session.packageId,
    accepted: true,
  });
  return {
    schema: 'reference-stop.v1',
    ok: true,
    packageId: context.session.packageId,
    action,
  };
}

function commandScreenshot(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  const label = safeArtifactLabel(options.label, 'screen');
  const output = adbRun(
    context.adb,
    context.device.serial,
    ['exec-out', 'screencap', '-p'],
    { binary: true, timeout: 60_000 },
  ).stdout;
  if (
    output.length < 8 ||
    !Buffer.from(output.subarray(0, 8)).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
  ) {
    fail('adb screencap did not return a PNG');
  }
  const file = path.join(
    context.sessionDir,
    'captures',
    `${timestampForFile()}-${label}.png`,
  );
  fs.writeFileSync(file, output, { mode: 0o600, flag: 'wx' });
  const artifact = artifactRecord(context.sessionDir, file);
  const action = appendAction(context.sessionDir, 'screen.capture', {
    packageId: context.session.packageId,
    foregroundPackage: foregroundPackage(
      context.adb,
      context.device.serial,
    ),
    artifact,
  });
  return {
    schema: 'reference-screenshot.v1',
    artifact,
    absolutePath: file,
    action,
  };
}

function commandTap(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  const foreground = requireForeground(
    context.adb,
    context.device.serial,
    context.session.packageId,
  );
  const point = coordinates(
    context.adb,
    context.device.serial,
    options,
  );
  adbRun(context.adb, context.device.serial, [
    'shell',
    'input',
    'tap',
    String(point.px[0]),
    String(point.px[1]),
  ]);
  const action = appendAction(context.sessionDir, 'input.tap', {
    packageId: context.session.packageId,
    foregroundPackage: foreground,
    point,
  });
  return {
    schema: 'reference-tap.v1',
    accepted: true,
    point,
    action,
  };
}

function commandSwipe(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  const foreground = requireForeground(
    context.adb,
    context.device.serial,
    context.session.packageId,
  );
  const from = coordinates(
    context.adb,
    context.device.serial,
    options,
    'from-',
  );
  const to = coordinates(
    context.adb,
    context.device.serial,
    options,
    'to-',
  );
  if (
    from.displayPx[0] !== to.displayPx[0] ||
    from.displayPx[1] !== to.displayPx[1]
  ) {
    fail('display changed while preparing swipe');
  }
  const durationMs = integerOption(
    options['duration-ms'],
    'duration-ms',
    50,
    60_000,
  );
  adbRun(context.adb, context.device.serial, [
    'shell',
    'input',
    'swipe',
    String(from.px[0]),
    String(from.px[1]),
    String(to.px[0]),
    String(to.px[1]),
    String(durationMs),
  ]);
  const action = appendAction(context.sessionDir, 'input.swipe', {
    packageId: context.session.packageId,
    foregroundPackage: foreground,
    from,
    to,
    durationMs,
  });
  return {
    schema: 'reference-swipe.v1',
    accepted: true,
    from,
    to,
    durationMs,
    action,
  };
}

function commandKey(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  const foreground = requireForeground(
    context.adb,
    context.device.serial,
    context.session.packageId,
  );
  const key = String(options.key ?? '').toLowerCase();
  const keycodes = {
    back: 'KEYCODE_BACK',
    home: 'KEYCODE_HOME',
  };
  const keycode = keycodes[key];
  if (!keycode) fail('--key must be back or home');
  adbRun(context.adb, context.device.serial, [
    'shell',
    'input',
    'keyevent',
    keycode,
  ]);
  const action = appendAction(context.sessionDir, 'input.key', {
    packageId: context.session.packageId,
    foregroundPackage: foreground,
    key,
    keycode,
  });
  return {
    schema: 'reference-key.v1',
    accepted: true,
    key,
    keycode,
    action,
  };
}

function commandRecordStart(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  requireForeground(
    context.adb,
    context.device.serial,
    context.session.packageId,
  );
  const stateFile = path.join(context.sessionDir, RECORDING_STATE_FILE);
  if (fs.existsSync(stateFile)) {
    const previous = validateRecordingState(readJson(stateFile));
    const processCheck = adbRun(
      context.adb,
      context.device.serial,
      ['shell', 'kill', '-0', previous.remotePid],
      { allowFailure: true },
    );
    fail(
      processCheck.ok
        ? 'a recording is already active'
        : 'the previous recording segment has ended and is finalizable; run record stop or record rotate before starting another segment',
    );
  }
  const existingRecorder = shellText(
    context.adb,
    context.device.serial,
    ['pidof', 'screenrecord'],
    { allowFailure: true },
  );
  if (existingRecorder) {
    fail('another screenrecord process is already active on the device');
  }
  const timeLimitSeconds = integerOption(
    options['time-limit-seconds'] ?? String(MAX_RECORD_SECONDS),
    'time-limit-seconds',
    1,
    MAX_RECORD_SECONDS,
  );
  const recordingId = crypto.randomUUID();
  const remotePath = `/sdcard/p4g-reference-lab-${recordingId}.mp4`;
  const adbArgs = [
    '-s',
    context.device.serial,
    'shell',
    'screenrecord',
    '--time-limit',
    String(timeLimitSeconds),
    remotePath,
  ];
  const child = spawn(context.adb, adbArgs, {
    detached: true,
    stdio: 'ignore',
    env: process.env,
  });
  if (!child.pid) fail('could not start the host adb recorder process');
  child.unref();
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 500);
  const remotePidOutput = shellText(
    context.adb,
    context.device.serial,
    ['pidof', 'screenrecord'],
    { allowFailure: true },
  );
  const remotePid = remotePidOutput.match(/\d+/)?.[0];
  if (!remotePid) {
    try {
      process.kill(-child.pid, 'SIGINT');
    } catch {
      // The failed child may already be gone.
    }
    fail('screenrecord did not stay active on the Android device');
  }
  const state = {
    schema: 'reference-recording-state.v1',
    recordingId,
    remotePath,
    remotePid,
    hostPid: String(child.pid),
    startedAt: nowIso(),
    timeLimitSeconds,
  };
  writeJson(stateFile, state);
  const action = appendAction(context.sessionDir, 'record.start', {
    recordingId,
    timeLimitSeconds,
  });
  return {
    schema: 'reference-record-start.v1',
    recordingId,
    startedAt: state.startedAt,
    timeLimitSeconds,
    action,
  };
}

function commandRecordStatus(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  const stateFile = path.join(context.sessionDir, RECORDING_STATE_FILE);
  if (!fs.existsSync(stateFile)) {
    return {
      schema: 'reference-record-status.v1',
      active: false,
    };
  }
  const state = validateRecordingState(readJson(stateFile));
  const result = adbRun(
    context.adb,
    context.device.serial,
    ['shell', 'kill', '-0', state.remotePid],
    { allowFailure: true },
  );
  const now = Date.now();
  const startedAtMs = Date.parse(state.startedAt);
  const deadlineAtMs = startedAtMs + state.timeLimitSeconds * 1000;
  return {
    schema: 'reference-record-status.v1',
    active: result.ok,
    finalizable: !result.ok,
    expired: !result.ok && now >= deadlineAtMs,
    recordingId: state.recordingId,
    startedAt: state.startedAt,
    deadlineAt: new Date(deadlineAtMs).toISOString(),
    elapsedSeconds: Math.max(0, Math.floor((now - startedAtMs) / 1000)),
    remainingSeconds: Math.max(0, Math.ceil((deadlineAtMs - now) / 1000)),
    timeLimitSeconds: state.timeLimitSeconds,
  };
}

function commandRecordStop(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  const stateFile = path.join(context.sessionDir, RECORDING_STATE_FILE);
  if (!fs.existsSync(stateFile)) fail('no recording is active');
  const state = validateRecordingState(readJson(stateFile));
  if (state.hostPid) {
    try {
      process.kill(-Number(state.hostPid), 'SIGINT');
    } catch {
      // Host adb may already have exited at the time limit.
    }
  }
  adbRun(
    context.adb,
    context.device.serial,
    ['shell', 'kill', '-INT', state.remotePid],
    { allowFailure: true },
  );
  const label = safeArtifactLabel(options.label, 'run');
  const localFile = path.join(
    context.sessionDir,
    'recordings',
    `${timestampForFile()}-${label}.mp4`,
  );
  let remoteReady = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const processCheck = adbRun(
      context.adb,
      context.device.serial,
      ['shell', 'kill', '-0', state.remotePid],
      { allowFailure: true },
    );
    const check = adbRun(
      context.adb,
      context.device.serial,
      ['shell', 'stat', '-c', '%s', state.remotePath],
      { allowFailure: true },
    );
    const bytes = Number(String(check.stdout).trim());
    if (
      !processCheck.ok &&
      check.ok &&
      Number.isFinite(bytes) &&
      bytes > 0
    ) {
      remoteReady = true;
      break;
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 250);
  }
  if (!remoteReady) {
    appendAction(context.sessionDir, 'record.failed', {
      recordingId: state.recordingId,
      startedAt: state.startedAt,
      failedAt: nowIso(),
      reason: 'remote-artifact-missing-or-unfinalized',
    });
    fs.unlinkSync(stateFile);
    fail('recording did not finalize on the Android device');
  }
  adbRun(
    context.adb,
    context.device.serial,
    ['pull', state.remotePath, localFile],
    { timeout: 120_000 },
  );
  const artifact = artifactRecord(context.sessionDir, localFile);
  if (artifact.bytes === 0) fail('pulled recording is empty');
  adbRun(
    context.adb,
    context.device.serial,
    ['shell', 'rm', '-f', state.remotePath],
  );
  fs.unlinkSync(stateFile);
  const action = appendAction(context.sessionDir, 'record.stop', {
    recordingId: state.recordingId,
    startedAt: state.startedAt,
    stoppedAt: nowIso(),
    artifact,
  });
  return {
    schema: 'reference-record-stop.v1',
    recordingId: state.recordingId,
    artifact,
    absolutePath: localFile,
    action,
  };
}

function commandRecordRotate(options) {
  const stopped = commandRecordStop(options);
  const started = commandRecordStart(options);
  return {
    schema: 'reference-record-rotate.v1',
    stopped,
    started,
  };
}

function walkFiles(root, current = root) {
  const files = [];
  for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
    const absolute = path.join(current, entry.name);
    const relative = path.relative(root, absolute).split(path.sep).join('/');
    if (
      relative === PRIVATE_DEVICE_FILE ||
      relative === RECORDING_STATE_FILE ||
      relative === MANIFEST_FILE
    ) {
      continue;
    }
    if (entry.isSymbolicLink()) fail('session contains a symbolic link');
    if (entry.isDirectory()) {
      files.push(...walkFiles(root, absolute));
    } else if (entry.isFile()) {
      files.push(absolute);
    } else {
      fail('session contains an unsupported filesystem entry');
    }
  }
  return files.sort();
}

function commandExport(options) {
  const labRoot = resolveLabRoot(options['lab-root']);
  const context = sessionContext(
    labRoot,
    options.session,
    options.adb,
    options.serial,
  );
  if (fs.existsSync(path.join(context.sessionDir, RECORDING_STATE_FILE))) {
    fail('stop the active recording before export');
  }
  const app = packageInfo(
    context.adb,
    context.device.serial,
    context.session.packageId,
  );
  const device = sanitizeDeviceInfo(context.adb, context.device);
  appendAction(context.sessionDir, 'session.export', {
    captureId: context.session.captureId,
    packageId: context.session.packageId,
  });
  const files = walkFiles(context.sessionDir).map((file) =>
    artifactRecord(context.sessionDir, file),
  );
  const manifest = {
    schema: 'reference-capture.v1',
    captureId: context.session.captureId,
    createdAt: context.session.createdAt,
    exportedAt: nowIso(),
    mechanic: context.session.mechanic,
    packageId: context.session.packageId,
    appVersionName: app.versionName,
    appVersionCode: app.versionCode,
    device: {
      manufacturer: device.manufacturer,
      model: device.model,
      androidVersion: device.androidVersion,
      apiLevel: device.apiLevel,
      displayPx: device.displayPx,
      densityDpi: device.densityDpi,
      refreshRateHz: device.refreshRateHz,
      orientation: device.orientation,
    },
    accountCohort: context.session.accountCohort,
    targetLevels: context.session.targetLevels,
    files,
  };
  const manifestPath = path.join(context.sessionDir, MANIFEST_FILE);
  writeJson(manifestPath, manifest);
  return {
    schema: 'reference-export.v1',
    manifestPath,
    manifestSha256: sha256(fs.readFileSync(manifestPath)),
    artifactCount: files.length,
    manifest,
  };
}

function parseOptions(tokens) {
  const options = {};
  const positionals = [];
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const equals = token.indexOf('=');
    const key = token.slice(2, equals > 0 ? equals : undefined);
    if (!key || Object.hasOwn(options, key)) fail(`duplicate option --${key}`);
    if (equals > 0) {
      options[key] = token.slice(equals + 1);
      continue;
    }
    const value = tokens[index + 1];
    if (value === undefined || value.startsWith('--')) {
      options[key] = true;
    } else {
      options[key] = value;
      index += 1;
    }
  }
  return { options, positionals };
}

const COMMON_OPTIONS = new Set(['adb', 'serial', 'lab-root']);
const COMMANDS = {
  doctor: {
    options: new Set([...COMMON_OPTIONS, 'package']),
    run: commandDoctor,
  },
  info: {
    options: new Set([...COMMON_OPTIONS, 'package', 'session']),
    run: commandInfo,
  },
  'session-start': {
    options: new Set([
      ...COMMON_OPTIONS,
      'mechanic',
      'package',
      'target-levels',
      'account-cohort',
    ]),
    required: ['mechanic', 'package'],
    run: commandSessionStart,
  },
  launch: {
    options: new Set([...COMMON_OPTIONS, 'session']),
    required: ['session'],
    run: commandLaunch,
  },
  stop: {
    options: new Set([...COMMON_OPTIONS, 'session']),
    required: ['session'],
    run: commandStop,
  },
  screenshot: {
    options: new Set([...COMMON_OPTIONS, 'session', 'label']),
    required: ['session'],
    run: commandScreenshot,
  },
  tap: {
    options: new Set([
      ...COMMON_OPTIONS,
      'session',
      'x',
      'y',
      'nx',
      'ny',
    ]),
    required: ['session'],
    run: commandTap,
  },
  swipe: {
    options: new Set([
      ...COMMON_OPTIONS,
      'session',
      'from-x',
      'from-y',
      'from-nx',
      'from-ny',
      'to-x',
      'to-y',
      'to-nx',
      'to-ny',
      'duration-ms',
    ]),
    required: ['session', 'duration-ms'],
    run: commandSwipe,
  },
  key: {
    options: new Set([...COMMON_OPTIONS, 'session', 'key']),
    required: ['session', 'key'],
    run: commandKey,
  },
  'record-start': {
    options: new Set([
      ...COMMON_OPTIONS,
      'session',
      'time-limit-seconds',
    ]),
    required: ['session'],
    run: commandRecordStart,
  },
  'record-status': {
    options: new Set([...COMMON_OPTIONS, 'session']),
    required: ['session'],
    run: commandRecordStatus,
  },
  'record-stop': {
    options: new Set([...COMMON_OPTIONS, 'session', 'label']),
    required: ['session'],
    run: commandRecordStop,
  },
  'record-rotate': {
    options: new Set([
      ...COMMON_OPTIONS,
      'session',
      'label',
      'time-limit-seconds',
    ]),
    required: ['session'],
    run: commandRecordRotate,
  },
  export: {
    options: new Set([...COMMON_OPTIONS, 'session']),
    required: ['session'],
    run: commandExport,
  },
};

function usage() {
  return `Reference Device Lab 0–1

Usage:
  node scripts/reference-lab.mjs doctor [--package <id>]
  node scripts/reference-lab.mjs info [--package <id> | --session <path|id>]
  node scripts/reference-lab.mjs session start --mechanic <slug> --package <id>
    [--target-levels 6-10] [--account-cohort <label>]
  node scripts/reference-lab.mjs launch --session <path|id>
  node scripts/reference-lab.mjs stop --session <path|id>
  node scripts/reference-lab.mjs screenshot --session <path|id> [--label <label>]
  node scripts/reference-lab.mjs tap --session <path|id> --x <px> --y <px>
  node scripts/reference-lab.mjs tap --session <path|id> --nx <0..1> --ny <0..1>
  node scripts/reference-lab.mjs swipe --session <path|id>
    (--from-x <px> --from-y <px> --to-x <px> --to-y <px> |
     --from-nx <0..1> --from-ny <0..1> --to-nx <0..1> --to-ny <0..1>)
    --duration-ms <50..60000>
  node scripts/reference-lab.mjs key --session <path|id> --key <back|home>
  node scripts/reference-lab.mjs record start --session <path|id>
    [--time-limit-seconds <1..180>]
  node scripts/reference-lab.mjs record status --session <path|id>
  node scripts/reference-lab.mjs record stop --session <path|id> [--label <label>]
  node scripts/reference-lab.mjs record rotate --session <path|id>
    [--label <label>] [--time-limit-seconds <1..180>]
  node scripts/reference-lab.mjs export --session <path|id>

Common overrides:
  --adb <absolute path> --serial <adb serial> --lab-root <path>

All commands emit JSON. Mutating input is rejected unless the session package
is the foreground app. Raw artifacts stay in .artifacts/reference-lab/.`;
}

function normalizeCommand(argv) {
  if (argv[0] === 'session' && argv[1] === 'start') {
    return { command: 'session-start', rest: argv.slice(2) };
  }
  if (
    argv[0] === 'record' &&
    ['start', 'status', 'stop', 'rotate'].includes(argv[1])
  ) {
    return { command: `record-${argv[1]}`, rest: argv.slice(2) };
  }
  return { command: argv[0], rest: argv.slice(1) };
}

function main(argv) {
  if (argv.length === 0 || argv[0] === '--help' || argv[0] === 'help') {
    process.stdout.write(`${usage()}\n`);
    return;
  }
  const { command, rest } = normalizeCommand(argv);
  const definition = COMMANDS[command];
  if (!definition) fail(`unknown command: ${command}`, 2);
  const { options, positionals } = parseOptions(rest);
  if (positionals.length > 0) fail(`unexpected argument: ${positionals[0]}`);
  for (const key of Object.keys(options)) {
    if (!definition.options.has(key)) fail(`unknown option --${key}`, 2);
    if (options[key] === true) fail(`--${key} requires a value`, 2);
  }
  for (const required of definition.required || []) {
    if (options[required] === undefined) fail(`--${required} is required`, 2);
  }
  jsonOut(definition.run(options));
}

try {
  main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(
    `${JSON.stringify(
      {
        schema: 'reference-lab-error.v1',
        error: error instanceof Error ? error.message : 'unknown error',
      },
      null,
      2,
    )}\n`,
  );
  process.exitCode =
    error && Number.isInteger(error.exitCode) ? error.exitCode : 1;
}
