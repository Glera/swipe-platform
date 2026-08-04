import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPT_DIR, 'reference-lab.mjs');
const fixtures = [];

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function makeFixture(overrides = {}) {
  const root = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'reference-lab-')),
  );
  fixtures.push(root);
  const labRoot = path.join(root, 'lab');
  const statePath = path.join(root, 'fake-adb-state.json');
  const fakeAdb = path.join(root, 'adb');
  const state = {
    serial: 'SERIAL-PRIVATE-123',
    deviceState: 'device',
    foreground: 'com.android.launcher',
    recording: false,
    commands: [],
    ...overrides,
  };
  fs.writeFileSync(statePath, `${JSON.stringify(state)}\n`);
  const fakeSource = `#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const statePath = process.env.FAKE_ADB_STATE;
let state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
let args = process.argv.slice(2);
if (args[0] === '-s') {
  if (args[1] !== state.serial) {
    process.stderr.write('unknown device\\n');
    process.exit(1);
  }
  args = args.slice(2);
}
const save = () => fs.writeFileSync(statePath, JSON.stringify(state));
const text = (value) => process.stdout.write(String(value));
const log = () => {
  state.commands.push(args);
  save();
};
if (args[0] === 'version') {
  text('Android Debug Bridge version 1.0.41\\nVersion 99.0.0-test\\n');
} else if (args[0] === 'devices') {
  text('List of devices attached\\n');
  text(state.serial + '\\t' + state.deviceState + ' product:test model:Test_Phone device:test transport_id:1\\n');
  for (const extra of state.extraDevices || []) {
    text(extra.serial + '\\t' + extra.state + ' product:test model:Other device:test transport_id:2\\n');
  }
} else if (args[0] === 'exec-out' && args[1] === 'screencap') {
  process.stdout.write(Buffer.concat([
    Buffer.from([137,80,78,71,13,10,26,10]),
    Buffer.from('fake-png-payload'),
  ]));
} else if (args[0] === 'pull') {
  fs.mkdirSync(path.dirname(args[2]), { recursive: true });
  fs.writeFileSync(args[2], Buffer.from('fake-mp4-payload'));
  text('1 file pulled\\n');
} else if (args[0] === 'shell') {
  const shell = args.slice(1);
  if (shell[0] === 'getprop') {
    const props = {
      'ro.product.manufacturer': 'TestCorp',
      'ro.product.model': 'Test Phone',
      'ro.build.version.release': '16',
      'ro.build.version.sdk': '36',
      'sys.boot_completed': '1',
    };
    text((props[shell[1]] || '') + '\\n');
  } else if (shell[0] === 'wm' && shell[1] === 'size') {
    text('Physical size: 1080x2400\\n');
  } else if (shell[0] === 'wm' && shell[1] === 'density') {
    text('Physical density: 420\\n');
  } else if (shell[0] === 'settings' && shell[1] === 'get' && shell[2] === 'system') {
    text((shell[3] === 'show_touches' ? '1' : '0') + '\\n');
  } else if (shell[0] === 'dumpsys' && shell[1] === 'display') {
    text('DisplayDeviceInfo{mRefreshRate=120.0}\\n');
  } else if (shell[0] === 'dumpsys' && shell[1] === 'window') {
    text('mCurrentFocus=Window{abc u0 ' + state.foreground + '/.MainActivity}\\n');
  } else if (shell[0] === 'dumpsys' && shell[1] === 'activity') {
    text('mResumedActivity: ActivityRecord{abc u0 ' + state.foreground + '/.MainActivity}\\n');
  } else if (shell[0] === 'dumpsys' && shell[1] === 'package') {
    text('Packages:\\n  versionCode=321 minSdk=23\\n  versionName=7.8.9\\n');
  } else if (shell[0] === 'pm' && shell[1] === 'path') {
    if (shell[2] === 'com.example.game') text('package:/data/app/base.apk\\n');
    else process.exit(1);
  } else if (
    shell[0] === 'cmd' &&
    shell[1] === 'package' &&
    shell[2] === 'resolve-activity'
  ) {
    text('com.example.game/.MainActivity\\n');
  } else if (shell[0] === 'am' && shell[1] === 'start') {
    const componentIndex = shell.indexOf('-n');
    state.foreground = shell[componentIndex + 1].split('/')[0];
    log();
    text('Status: ok\\n');
  } else if (shell[0] === 'input') {
    log();
  } else if (shell[0] === 'pidof' && shell[1] === 'screenrecord') {
    if (state.recording) text('4242\\n');
    else process.exit(1);
  } else if (shell[0] === 'screenrecord') {
    state.recording = true;
    log();
    const stop = () => {
      state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      state.recording = false;
      save();
      process.exit(0);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    setInterval(() => {}, 1000);
  } else if (shell[0] === 'sh' && shell[1] === '-c') {
    state.recording = true;
    log();
    text('4242\\n');
  } else if (shell[0] === 'kill' && shell[1] === '-0') {
    process.exit(state.recording ? 0 : 1);
  } else if (shell[0] === 'kill' && shell[1] === '-INT') {
    state.recording = false;
    log();
  } else if (shell[0] === 'stat') {
    text('1234\\n');
  } else if (shell[0] === 'rm') {
    log();
  } else {
    process.stderr.write('unsupported fake adb shell command: ' + shell.join(' ') + '\\n');
    process.exit(1);
  }
} else {
  process.stderr.write('unsupported fake adb command: ' + args.join(' ') + '\\n');
  process.exit(1);
}
`;
  fs.writeFileSync(fakeAdb, fakeSource, { mode: 0o755 });
  fs.chmodSync(fakeAdb, 0o755);

  const env = {
    ...process.env,
    REFERENCE_LAB_ADB: fakeAdb,
    FAKE_ADB_STATE: statePath,
  };
  return {
    root,
    labRoot,
    statePath,
    fakeAdb,
    env,
    readState: () => JSON.parse(fs.readFileSync(statePath, 'utf8')),
    writeState: (value) =>
      fs.writeFileSync(statePath, `${JSON.stringify(value)}\n`),
  };
}

function run(fixture, args, expectedStatus = 0) {
  const result = spawnSync(
    process.execPath,
    [SCRIPT, ...args, '--lab-root', fixture.labRoot],
    {
      encoding: 'utf8',
      env: fixture.env,
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  assert.equal(
    result.status,
    expectedStatus,
    `unexpected status\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function runJson(fixture, args) {
  return JSON.parse(run(fixture, args).stdout);
}

function startSession(fixture) {
  return runJson(fixture, [
    'session',
    'start',
    '--mechanic',
    'fixture-game',
    '--package',
    'com.example.game',
    '--target-levels',
    '6-8,10',
    '--account-cohort',
    'fresh-a',
  ]);
}

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});

test('doctor and info expose useful device facts without the adb serial', () => {
  const fixture = makeFixture();
  const doctorResult = run(fixture, ['doctor', '--package', 'com.example.game']);
  assert.doesNotMatch(doctorResult.stdout, /SERIAL-PRIVATE-123/);
  const doctor = JSON.parse(doctorResult.stdout);
  assert.equal(doctor.ok, true);
  assert.equal(doctor.device.id.startsWith('device-'), true);
  assert.deepEqual(doctor.device.displayPx, [1080, 2400]);
  assert.equal(doctor.device.refreshRateHz, 120);
  assert.equal(doctor.checks.showTouchesEnabled, true);
  assert.equal(doctor.app.versionName, '7.8.9');

  const info = runJson(fixture, ['info', '--package', 'com.example.game']);
  assert.equal(info.app.versionCode, '321');
  assert.equal(info.foregroundPackage, 'com.android.launcher');
  assert.doesNotMatch(JSON.stringify(info), /SERIAL-PRIVATE-123/);
});

test('full Lab 0–1 session logs actions and exports content hashes', () => {
  const fixture = makeFixture();
  const started = startSession(fixture);
  assert.equal(started.session.targetLevels.join(','), '6,7,8,10');
  assert.equal(
    fs.statSync(path.join(started.sessionDir, '.device.json')).mode & 0o777,
    0o600,
  );
  assert.doesNotMatch(
    fs.readFileSync(path.join(started.sessionDir, 'session.json'), 'utf8'),
    /SERIAL-PRIVATE-123/,
  );

  runJson(fixture, ['launch', '--session', started.captureId]);
  const screenshot = runJson(fixture, [
    'screenshot',
    '--session',
    started.captureId,
    '--label',
    'opening',
  ]);
  assert.equal(fs.existsSync(screenshot.absolutePath), true);
  assert.equal(
    screenshot.artifact.sha256,
    sha256(fs.readFileSync(screenshot.absolutePath)),
  );

  const tap = runJson(fixture, [
    'tap',
    '--session',
    started.captureId,
    '--nx',
    '0.5',
    '--ny',
    '0.25',
  ]);
  assert.deepEqual(tap.point.px, [540, 600]);

  const swipe = runJson(fixture, [
    'swipe',
    '--session',
    started.captureId,
    '--from-nx',
    '0.2',
    '--from-ny',
    '0.8',
    '--to-nx',
    '0.8',
    '--to-ny',
    '0.2',
    '--duration-ms',
    '900',
  ]);
  assert.equal(swipe.durationMs, 900);

  const key = runJson(fixture, [
    'key',
    '--session',
    started.captureId,
    '--key',
    'back',
  ]);
  assert.equal(key.key, 'back');
  assert.equal(key.keycode, 'KEYCODE_BACK');

  const recording = runJson(fixture, [
    'record',
    'start',
    '--session',
    started.captureId,
    '--time-limit-seconds',
    '60',
  ]);
  assert.equal(recording.timeLimitSeconds, 60);
  assert.equal(
    runJson(fixture, [
      'record',
      'status',
      '--session',
      started.captureId,
    ]).active,
    true,
  );
  const stopped = runJson(fixture, [
    'record',
    'stop',
    '--session',
    started.captureId,
    '--label',
    'level-6',
  ]);
  assert.equal(fs.existsSync(stopped.absolutePath), true);
  assert.equal(stopped.artifact.bytes, Buffer.byteLength('fake-mp4-payload'));

  const exported = runJson(fixture, [
    'export',
    '--session',
    started.captureId,
  ]);
  assert.equal(exported.manifest.schema, 'reference-capture.v1');
  assert.deepEqual(exported.manifest.targetLevels, ['6', '7', '8', '10']);
  assert.equal(
    exported.manifestSha256,
    sha256(fs.readFileSync(exported.manifestPath)),
  );
  const manifestText = fs.readFileSync(exported.manifestPath, 'utf8');
  assert.doesNotMatch(manifestText, /SERIAL-PRIVATE-123/);
  const paths = exported.manifest.files.map((file) => file.path);
  assert.equal(paths.includes('actions.jsonl'), true);
  assert.equal(paths.includes('session.json'), true);
  assert.equal(paths.some((file) => file.endsWith('.png')), true);
  assert.equal(paths.some((file) => file.endsWith('.mp4')), true);
  assert.equal(paths.includes('.device.json'), false);
  assert.equal(paths.includes('.recording.json'), false);
  assert.equal(paths.includes('manifest.json'), false);
  for (const artifact of exported.manifest.files) {
    const bytes = fs.readFileSync(path.join(started.sessionDir, artifact.path));
    assert.equal(artifact.bytes, bytes.length);
    assert.equal(artifact.sha256, sha256(bytes));
  }

  const actions = fs
    .readFileSync(path.join(started.sessionDir, 'actions.jsonl'), 'utf8')
    .trim()
    .split('\n')
    .map(JSON.parse);
  assert.deepEqual(
    actions.map((action) => action.event),
    [
      'session.start',
      'app.launch',
      'screen.capture',
      'input.tap',
      'input.swipe',
      'input.key',
      'record.start',
      'record.stop',
      'session.export',
    ],
  );
  actions.forEach((action, index) => {
    assert.equal(action.seq, index + 1);
    assert.equal(
      action.prevSha256,
      index === 0 ? null : actions[index - 1].entrySha256,
    );
    const { entrySha256, ...payload } = action;
    assert.equal(entrySha256, sha256(Buffer.from(JSON.stringify(payload))));
  });

  const fakeCommands = fixture.readState().commands;
  assert.equal(
    fakeCommands.some(
      (args) =>
        args[0] === 'shell' &&
        args[1] === 'input' &&
        args[2] === 'tap' &&
        args[3] === '540' &&
        args[4] === '600',
    ),
    true,
  );
  assert.equal(
    fakeCommands.some(
      (args) =>
        args[0] === 'shell' &&
        args[1] === 'input' &&
        args[2] === 'swipe',
    ),
    true,
  );
});

test('input and recording fail closed when the allowlisted app is not foreground', () => {
  const fixture = makeFixture();
  const started = startSession(fixture);
  const before = fixture.readState();
  before.foreground = 'com.android.settings';
  fixture.writeState(before);

  const tap = run(
    fixture,
    [
      'tap',
      '--session',
      started.captureId,
      '--nx',
      '0.5',
      '--ny',
      '0.5',
    ],
    1,
  );
  assert.match(tap.stderr, /allowlist guard/);
  assert.doesNotMatch(tap.stderr, /SERIAL-PRIVATE-123/);

  const record = run(
    fixture,
    ['record', 'start', '--session', started.captureId],
    1,
  );
  assert.match(record.stderr, /allowlist guard/);
  assert.equal(
    fixture
      .readState()
      .commands.some(
        (args) => args[0] === 'shell' && args[1] === 'input',
      ),
    false,
  );
});

test('expired recording state is finalizable and rotate archives it before restarting', () => {
  const fixture = makeFixture();
  const started = startSession(fixture);
  runJson(fixture, ['launch', '--session', started.captureId]);
  runJson(fixture, [
    'record',
    'start',
    '--session',
    started.captureId,
    '--time-limit-seconds',
    '60',
  ]);

  const endedState = fixture.readState();
  endedState.recording = false;
  fixture.writeState(endedState);

  const status = runJson(fixture, [
    'record',
    'status',
    '--session',
    started.captureId,
  ]);
  assert.equal(status.active, false);
  assert.equal(status.finalizable, true);
  assert.equal(typeof status.deadlineAt, 'string');
  assert.equal(status.remainingSeconds <= 60, true);

  const restart = run(
    fixture,
    ['record', 'start', '--session', started.captureId],
    1,
  );
  assert.match(restart.stderr, /ended and is finalizable/);

  const rotated = runJson(fixture, [
    'record',
    'rotate',
    '--session',
    started.captureId,
    '--label',
    'expired-segment',
    '--time-limit-seconds',
    '90',
  ]);
  assert.equal(rotated.schema, 'reference-record-rotate.v1');
  assert.equal(fs.existsSync(rotated.stopped.absolutePath), true);
  assert.equal(rotated.started.timeLimitSeconds, 90);
  assert.equal(
    runJson(fixture, [
      'record',
      'status',
      '--session',
      started.captureId,
    ]).active,
    true,
  );
  runJson(fixture, [
    'record',
    'stop',
    '--session',
    started.captureId,
    '--label',
    'rotated-segment',
  ]);
});

test('CLI rejects unsafe identities, invalid coordinates, and active export', () => {
  const fixture = makeFixture();
  const invalidPackage = run(
    fixture,
    [
      'session',
      'start',
      '--mechanic',
      'fixture-game',
      '--package',
      'com.example.game;rm',
    ],
    1,
  );
  assert.match(invalidPackage.stderr, /invalid package/);

  const invalidMechanic = run(
    fixture,
    [
      'session',
      'start',
      '--mechanic',
      '../escape',
      '--package',
      'com.example.game',
    ],
    1,
  );
  assert.match(invalidMechanic.stderr, /invalid mechanic/);

  const started = startSession(fixture);
  runJson(fixture, ['launch', '--session', started.captureId]);
  const invalidTap = run(
    fixture,
    [
      'tap',
      '--session',
      started.captureId,
      '--nx',
      '1.2',
      '--ny',
      '0.5',
    ],
    1,
  );
  assert.match(invalidTap.stderr, /invalid --nx/);

  runJson(fixture, ['record', 'start', '--session', started.captureId]);
  const exportWhileRecording = run(
    fixture,
    ['export', '--session', started.captureId],
    1,
  );
  assert.match(exportWhileRecording.stderr, /stop the active recording/);
  runJson(fixture, [
    'record',
    'stop',
    '--session',
    started.captureId,
    '--label',
    'cleanup',
  ]);
});

test('doctor explains unauthorized and multi-device states without raw serials', () => {
  const unauthorizedFixture = makeFixture({ deviceState: 'unauthorized' });
  const unauthorized = run(unauthorizedFixture, ['doctor'], 1);
  assert.match(unauthorized.stderr, /accept the RSA prompt/);
  assert.doesNotMatch(unauthorized.stderr, /SERIAL-PRIVATE-123/);

  const fixture = makeFixture();
  const state = fixture.readState();
  state.extraDevices = [{ serial: 'SECOND-PRIVATE', state: 'device' }];
  fixture.writeState(state);
  const multiple = run(fixture, ['doctor'], 1);
  assert.match(multiple.stderr, /multiple Android devices/);
  assert.doesNotMatch(multiple.stderr, /SERIAL-PRIVATE|SECOND-PRIVATE/);
});
