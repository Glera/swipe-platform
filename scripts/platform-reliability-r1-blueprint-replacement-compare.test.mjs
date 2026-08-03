import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  run,
} from './platform-reliability-r1-blueprint-replacement-compare.mjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'platform-reliability-r1-blueprint-replacement-compare.mjs',
);

const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const hash = (character) => character.repeat(64);

function fixture() {
  const oldBlueprintId = 'exs-old-blueprint';
  const sourceSha = 'a'.repeat(40);
  const services = [
    {
      serviceId: 'srv-web',
      kind: 'web',
      status: 'live',
      plan: 'starter',
      schedule: null,
      commandSha256: hash('1'),
      databaseBindingSha256: hash('2'),
      environmentShapeSha256: hash('3'),
    },
    {
      serviceId: 'srv-cron-b',
      kind: 'cron',
      status: 'available',
      plan: 'starter',
      schedule: '0 * * * *',
      commandSha256: hash('4'),
      databaseBindingSha256: hash('5'),
      environmentShapeSha256: hash('6'),
    },
    {
      serviceId: 'srv-cron-a',
      kind: 'cron',
      status: 'available',
      plan: 'starter',
      schedule: '15 * * * *',
      commandSha256: hash('7'),
      databaseBindingSha256: hash('8'),
      environmentShapeSha256: hash('9'),
    },
  ];
  const common = {
    schema: 'platform-reliability-r1-blueprint-replacement-observation.v1',
    sourceDatabase: {
      serviceId: 'dpg-source',
      status: 'available',
      configurationSha256: hash('a'),
    },
    services,
    hookValueObserved: false,
    secretsCaptured: false,
  };
  const before = {
    ...structuredClone(common),
    phase: 'before',
    observedAt: '2026-08-03T07:00:00Z',
    blueprint: {
      id: oldBlueprintId,
      sourceRepository: 'Glera/swipe-backend',
      sourceBranch: 'master',
      blueprintPath: 'render.yaml',
      sourceSha,
      autoSyncState: 'disabled',
      lastSyncAt: '2026-07-30T15:09:14Z',
    },
    oldBlueprintAbsence: null,
  };
  const after = {
    ...structuredClone(common),
    phase: 'after',
    observedAt: '2026-08-03T07:05:00Z',
    blueprint: {
      ...structuredClone(before.blueprint),
      id: 'exs-new-blueprint',
      lastSyncAt: null,
    },
    oldBlueprintAbsence: {
      blueprintId: oldBlueprintId,
      observedAt: '2026-08-03T07:05:00Z',
      terminalOutcome: 'not_found',
      evidenceSha256: hash('b'),
    },
  };
  const support = {
    schema: 'platform-reliability-r1-render-support-response.v1',
    affectedBlueprintId: oldBlueprintId,
    affectedBlueprintIdentitySha256: `sha256:${digest(oldBlueprintId)}`,
    providerStatements: {
      supportedRemediation: 'delete_existing_blueprint_then_create_new_blueprint',
      oldHookInvalidatedByRemediation: true,
      existingServicesDeletedWithBlueprint: false,
      existingServicesExpectedToRelinkByDetection: true,
      lastObservedSyncAt: '2026-07-30T15:09:14Z',
    },
    evidenceLimits: {
      providerHasNotExecutedRemediation: true,
      oldHookTerminallyInvalidated: false,
    },
    secretValueCaptured: false,
  };
  return { before, after, support };
}

function writeFixture(root, candidate = fixture()) {
  const paths = {
    before: path.join(root, 'before.json'),
    after: path.join(root, 'after.json'),
    support: path.join(root, 'support.json'),
    comparison: path.join(root, 'comparison.json'),
  };
  fs.writeFileSync(paths.before, `${JSON.stringify(candidate.before, null, 2)}\n`);
  fs.writeFileSync(paths.after, `${JSON.stringify(candidate.after, null, 2)}\n`);
  fs.writeFileSync(paths.support, `${JSON.stringify(candidate.support, null, 2)}\n`);
  return paths;
}

test('proves a different Blueprint with exact source and service continuity', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const paths = writeFixture(root);
  const { result, output } = run([
    '--before', paths.before,
    '--after', paths.after,
    '--support', paths.support,
  ]);
  assert.equal(result.replacementSafe, true);
  assert.deepEqual(result.differences, []);
  assert.equal(result.oldBlueprintAbsent, true);
  assert.equal(result.autoSyncDisabled, true);
  assert.equal(result.secretsCaptured, false);
  fs.writeFileSync(paths.comparison, output);
  const verified = run([
    '--before', paths.before,
    '--after', paths.after,
    '--support', paths.support,
    '--verify-json', paths.comparison,
  ]);
  assert.equal(verified.result.replacementSafe, true);
});

test('reports source, service, database, identity, and absence drift', () => {
  for (const mutate of [
    (candidate) => {
      candidate.after.blueprint.id = candidate.before.blueprint.id;
    },
    (candidate) => {
      candidate.after.blueprint.sourceSha = 'b'.repeat(40);
    },
    (candidate) => {
      candidate.after.services[0].plan = 'pro';
    },
    (candidate) => {
      candidate.after.sourceDatabase.configurationSha256 = hash('c');
    },
    (candidate) => {
      candidate.after.oldBlueprintAbsence.blueprintId = 'exs-other';
    },
    (candidate) => {
      candidate.support.affectedBlueprintIdentitySha256 = `sha256:${hash('d')}`;
    },
    (candidate) => {
      candidate.support.providerStatements.lastObservedSyncAt =
        '2026-08-03T07:00:00Z';
      candidate.before.blueprint.lastSyncAt = '2026-08-03T07:00:00Z';
    },
  ]) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const candidate = fixture();
    mutate(candidate);
    const paths = writeFixture(root, candidate);
    const { result } = run([
      '--before', paths.before,
      '--after', paths.after,
      '--support', paths.support,
    ]);
    assert.equal(result.replacementSafe, false);
    assert.ok(result.differences.length >= 1);
  }
});

test('fails closed on unsafe observation structure and stale comparison bytes', () => {
  const structuralCases = [
    (candidate) => {
      candidate.before.hookValueObserved = true;
    },
    (candidate) => {
      candidate.after.secretsCaptured = true;
    },
    (candidate) => {
      candidate.after.blueprint.autoSyncState = 'enabled';
    },
    (candidate) => {
      candidate.after.services.push(structuredClone(candidate.after.services[0]));
    },
    (candidate) => {
      candidate.after.extra = true;
    },
  ];
  for (const mutate of structuralCases) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
    const candidate = fixture();
    mutate(candidate);
    const paths = writeFixture(root, candidate);
    assert.throws(
      () => run([
        '--before', paths.before,
        '--after', paths.after,
        '--support', paths.support,
      ]),
    );
  }

  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const paths = writeFixture(root);
  fs.writeFileSync(paths.comparison, '{}\n');
  assert.throws(
    () => run([
      '--before', paths.before,
      '--after', paths.after,
      '--support', paths.support,
      '--verify-json', paths.comparison,
    ]),
    /published comparison/,
  );
});

test('CLI exits 0 for continuity, 2 for drift, and rejects unknown options', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-blueprint-'));
  const paths = writeFixture(root);
  const output = execFileSync(process.execPath, [
    SCRIPT,
    '--before', paths.before,
    '--after', paths.after,
    '--support', paths.support,
  ], { encoding: 'utf8' });
  assert.equal(JSON.parse(output).replacementSafe, true);

  const drift = fixture();
  drift.after.services[0].plan = 'pro';
  const driftPaths = writeFixture(root, drift);
  const driftRun = spawnSync(process.execPath, [
    SCRIPT,
    '--before', driftPaths.before,
    '--after', driftPaths.after,
    '--support', driftPaths.support,
  ], { encoding: 'utf8' });
  assert.equal(driftRun.status, 2);
  assert.equal(JSON.parse(driftRun.stdout).replacementSafe, false);

  const invalid = spawnSync(process.execPath, [SCRIPT, '--unknown', 'x'], {
    encoding: 'utf8',
  });
  assert.equal(invalid.status, 1);
  assert.match(invalid.stderr, /unknown option/);
});
