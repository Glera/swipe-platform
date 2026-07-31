import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  compareInitialStates,
  hammingHex,
  parseAdbDevices,
  parseArgs,
  runDoctor,
} from './reference-lab.mjs';

test('argument parser separates commands, values and json flag', () => {
  assert.deepEqual(
    parseArgs(['scenario', 'verify', '--scenario-dir', '/tmp/example', '--json']),
    {
      positionals: ['scenario', 'verify'],
      options: { 'scenario-dir': '/tmp/example', json: true },
    },
  );
});

test('adb device parser retains authorization and useful metadata', () => {
  const devices = parseAdbDevices([
    'List of devices attached',
    'SERIAL1 device product:a model:Pixel_8 transport_id:1',
    'SERIAL2 unauthorized usb:2-1',
    '',
  ].join('\n'));
  assert.equal(devices.length, 2);
  assert.equal(devices[0].state, 'device');
  assert.equal(devices[0].metadata.model, 'Pixel_8');
  assert.equal(devices[1].state, 'unauthorized');
});

test('initial-state equivalence is structural and pHash-bounded, not exact-file identity', () => {
  const clean = {
    appBuild: '100',
    level: '6',
    normalizedStateFingerprint: 'state-a',
    perceptualHash: '000f',
    instrumentation: false,
  };
  const instrumented = { ...clean, perceptualHash: '000e', instrumentation: true };
  assert.equal(hammingHex('000f', '000e'), 1);
  assert.equal(compareInitialStates(clean, instrumented, 1).ok, true);
  assert.equal(compareInitialStates(clean, instrumented, 0).ok, false);
});

test('doctor fails closed when dependencies and a device are unavailable', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'reference-lab-doctor-'));
  try {
    const fakeSpawn = () => ({ status: null, stdout: '', stderr: '', error: new Error('missing') });
    const report = runDoctor({ artifactRoot: root, spawn: fakeSpawn });
    assert.equal(report.status, 'fail');
    assert.equal(report.checks.find(({ id }) => id === 'artifact-root').ok, true);
    assert.equal(report.checks.find(({ id }) => id === 'adb').ok, false);
    assert.equal(report.checks.find(({ id }) => id === 'single-authorized-device').ok, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('doctor rejects a non-directory artifact root', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'reference-lab-file-'));
  const missing = path.join(root, 'missing');
  mkdirSync(path.join(root, 'existing'));
  try {
    const fakeSpawn = () => ({ status: null, stdout: '', stderr: '', error: new Error('missing') });
    const report = runDoctor({ artifactRoot: missing, spawn: fakeSpawn });
    assert.equal(report.status, 'fail');
    assert.equal(report.checks[0].id, 'artifact-root');
    assert.equal(report.checks[0].ok, false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
