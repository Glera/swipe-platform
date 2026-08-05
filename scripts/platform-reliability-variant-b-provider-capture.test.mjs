import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  CaptureError,
  canonicalize,
  capture,
  createRequestClient,
  parseArgs,
} from './platform-reliability-variant-b-provider-capture.mjs';

const BLUEPRINT_ID = 'exs-aaaaaaaaaaaaaaaaaaaa';
const SERVICE_ID = 'srv-bbbbbbbbbbbbbbbbbbbb';
const OWNER_ID = 'tea-cccccccccccccccccccc';
const DEPLOY_ID = 'dep-dddddddddddddddddddd';
const REGISTRY_ID = 'rgc-eeeeeeeeeeeeeeeeeeee';
const PREVIEW_1 = 'exe-11111111111111111111';
const PREVIEW_2 = 'exe-22222222222222222222';
const IMAGE = 'ghcr.io/glera/swipe-backend@sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
const PREDEPLOY = 'python -m app.platform_release predeploy-env';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function sync(id, state, overrides = {}) {
  return {
    cursor: `cursor-${id}`,
    sync: {
      commit: { id: overrides.commitId ?? `commit-${id}` },
      completedAt: overrides.completedAt,
      id,
      startedAt: overrides.startedAt,
      state,
    },
  };
}

function service(stage = 'pre-window', overrides = {}) {
  const envSpecificDetails = stage === 'prepared'
    ? {
      preDeployCommand: PREDEPLOY,
      registryCredential: { id: REGISTRY_ID, name: 'ghcr' },
    }
    : {
      dockerCommand: '',
      dockerContext: '.',
      dockerfilePath: './Dockerfile',
    };
  return {
    autoDeploy: 'no',
    autoDeployTrigger: 'off',
    id: SERVICE_ID,
    imagePath: stage === 'prepared' ? IMAGE : undefined,
    ownerId: OWNER_ID,
    registryCredential: stage === 'prepared'
      ? { id: REGISTRY_ID, name: 'ghcr' }
      : undefined,
    serviceDetails: {
      envSpecificDetails,
      healthCheckPath: '/api/health',
      runtime: stage === 'prepared' ? 'image' : 'docker',
    },
    type: 'web_service',
    ...overrides,
  };
}

function options(stage = 'pre-window') {
  return {
    baseline: null,
    blueprintId: BLUEPRINT_ID,
    equalCapture: null,
    expectedCurrentDeploy: DEPLOY_ID,
    expectedHealthCheckPath: stage === 'prepared' ? '/api/health' : null,
    expectedImagePath: stage === 'prepared' ? IMAGE : null,
    expectedOwnerId: OWNER_ID,
    expectedPreDeployCommand: stage === 'prepared' ? PREDEPLOY : null,
    expectedRegistryCredentialId: stage === 'prepared' ? REGISTRY_ID : null,
    knownPreviewIds: [PREVIEW_1, PREVIEW_2],
    output: 'unused.json',
    serviceId: SERVICE_ID,
    stage,
  };
}

function fakeRequest({
  stage = 'pre-window',
  serviceOverride = {},
  syncPages = [[
    sync('exe-33333333333333333333', 'success', {
      completedAt: '2026-08-01T00:01:00Z',
      startedAt: '2026-08-01T00:00:00Z',
    }),
    sync(PREVIEW_1, 'pending', { startedAt: '2026-08-02T17:54:51Z' }),
    sync(PREVIEW_2, 'error', { completedAt: '2026-08-05T12:00:00Z' }),
  ]],
  envPages = [[
    { cursor: 'env-a', envVar: { key: 'DATABASE_URL', value: 'never-retain-me' } },
  ]],
} = {}) {
  const calls = [];
  const requestJson = async (requestPath) => {
    calls.push(requestPath);
    if (requestPath === `/blueprints/${BLUEPRINT_ID}`) {
      return { autoSync: false, id: BLUEPRINT_ID, status: 'paused' };
    }
    if (requestPath === `/services/${SERVICE_ID}`) {
      return service(stage, serviceOverride);
    }
    if (requestPath === `/services/${SERVICE_ID}/deploys?limit=1`) {
      return [{ cursor: 'deploy-cursor', deploy: { id: DEPLOY_ID, status: 'live' } }];
    }
    if (requestPath.startsWith(`/blueprints/${BLUEPRINT_ID}/syncs?`)) {
      const parsed = new URL(`https://capture.invalid${requestPath}`);
      const cursor = parsed.searchParams.get('cursor');
      if (cursor === null) return syncPages[0] ?? [];
      const pageIndex = syncPages.findIndex((page) => (
        page.length > 0 && page[page.length - 1].cursor === cursor
      ));
      return syncPages[pageIndex + 1] ?? [];
    }
    if (requestPath.startsWith(`/services/${SERVICE_ID}/env-vars?`)) {
      const parsed = new URL(`https://capture.invalid${requestPath}`);
      const cursor = parsed.searchParams.get('cursor');
      if (cursor === null) return envPages[0] ?? [];
      const pageIndex = envPages.findIndex((page) => (
        page.length > 0 && page[page.length - 1].cursor === cursor
      ));
      return envPages[pageIndex + 1] ?? [];
    }
    throw new Error(`unexpected request ${requestPath}`);
  };
  return { calls, requestJson };
}

async function captureFixture(stage = 'pre-window', fixture = {}) {
  const fake = fakeRequest({ stage, ...fixture });
  const value = await capture(options(stage), {
    now: new Date('2026-08-05T18:00:00Z'),
    requestJson: fake.requestJson,
  });
  return { fake, value };
}

test('pre-window capture enumerates provider state and never retains env values', async () => {
  const { fake, value } = await captureFixture();

  assert.equal(value.status, 'PASS');
  assert.equal(value.latestDeploy.id, DEPLOY_ID);
  assert.deepEqual(value.pendingPreviewIds, [PREVIEW_1]);
  assert.deepEqual(value.forbiddenRollbackEnvKeysPresent, []);
  assert.equal(value.pageCounts.syncs, 1);
  assert.equal(value.syncs.length, 3);
  assert.equal(JSON.stringify(value).includes('never-retain-me'), false);
  assert.deepEqual(fake.calls, [
    `/blueprints/${BLUEPRINT_ID}`,
    `/services/${SERVICE_ID}`,
    `/services/${SERVICE_ID}/deploys?limit=1`,
    `/blueprints/${BLUEPRINT_ID}/syncs?limit=100`,
    `/services/${SERVICE_ID}/env-vars?limit=100`,
  ]);
});

test('prepared capture proves exact immutable image projection', async () => {
  const baseline = (await captureFixture()).value;
  const preparedOptions = options('prepared');
  preparedOptions.baseline = baseline;
  const fake = fakeRequest({ stage: 'prepared' });

  const value = await capture(preparedOptions, {
    now: new Date('2026-08-05T18:01:00Z'),
    requestJson: fake.requestJson,
  });

  assert.equal(value.service.runtime, 'image');
  assert.equal(value.service.imagePath, IMAGE);
  assert.equal(value.service.registryCredentialId, REGISTRY_ID);
  assert.equal(value.service.preDeployCommand, PREDEPLOY);
  assert.equal(value.baselineSyncsSha256, baseline.syncsSha256);
});

test('prepared capture fails closed on image and preDeploy drift', async () => {
  const baseline = (await captureFixture()).value;
  for (const [serviceOverride, code] of [
    [{ imagePath: `${IMAGE}-wrong` }, 'prepared_image_path_mismatch'],
    [{
      serviceDetails: {
        envSpecificDetails: { registryCredential: { id: REGISTRY_ID } },
        healthCheckPath: '/api/health',
        runtime: 'image',
      },
    }, 'prepared_predeploy_command_mismatch'],
  ]) {
    const preparedOptions = options('prepared');
    preparedOptions.baseline = baseline;
    const fake = fakeRequest({ stage: 'prepared', serviceOverride });
    await assert.rejects(
      capture(preparedOptions, { requestJson: fake.requestJson }),
      (error) => error instanceof CaptureError && error.code === code,
    );
  }
});

test('unknown nonterminal sync and unsafe known preview state stop capture', async () => {
  for (const [syncPages, code] of [
    [[[sync('exe-44444444444444444444', 'pending')]], 'unknown_nonterminal_sync'],
    [[[sync(PREVIEW_1, 'success')]], 'known_preview_state_unsafe'],
    [[[sync(PREVIEW_2, 'running')]], 'known_preview_state_unsafe'],
  ]) {
    const fake = fakeRequest({ syncPages });
    await assert.rejects(
      capture(options(), { requestJson: fake.requestJson }),
      (error) => error instanceof CaptureError && error.code === code,
    );
  }
});

test('complete pagination follows the last cursor and rejects duplicate identity', async () => {
  const firstPage = Array.from({ length: 100 }, (_, index) => sync(
    `exe-${String(index).padStart(20, '0')}`,
    'success',
    {
      completedAt: '2026-08-01T00:01:00Z',
      startedAt: '2026-08-01T00:00:00Z',
    },
  ));
  const finalItem = sync(PREVIEW_1, 'pending');
  const fake = fakeRequest({ syncPages: [firstPage, [finalItem]] });

  const value = await capture(options(), { requestJson: fake.requestJson });

  assert.equal(value.pageCounts.syncs, 2);
  assert.equal(value.syncs.length, 101);
  assert.ok(fake.calls.includes(
    `/blueprints/${BLUEPRINT_ID}/syncs?limit=100&cursor=${encodeURIComponent(firstPage[99].cursor)}`,
  ));

  const duplicate = fakeRequest({
    syncPages: [[
      finalItem,
      { ...finalItem, cursor: 'different-cursor-for-same-sync' },
    ]],
  });
  await assert.rejects(
    capture(options(), { requestJson: duplicate.requestJson }),
    (error) => error instanceof CaptureError && error.code === 'sync_identity_duplicate',
  );
});

test('baseline comparison permits bounded residual progress but no new sync', async () => {
  const baseline = (await captureFixture()).value;
  const preparedOptions = options('prepared');
  preparedOptions.baseline = baseline;
  const progressed = fakeRequest({
    stage: 'prepared',
    syncPages: [[
      sync('exe-33333333333333333333', 'success', {
        completedAt: '2026-08-01T00:01:00Z',
        startedAt: '2026-08-01T00:00:00Z',
      }),
      sync(PREVIEW_1, 'error', {
        completedAt: '2026-08-05T18:00:30Z',
        startedAt: '2026-08-02T17:54:51Z',
      }),
      sync(PREVIEW_2, 'error', { completedAt: '2026-08-05T12:00:00Z' }),
    ]],
  });
  const value = await capture(preparedOptions, { requestJson: progressed.requestJson });
  assert.equal(value.syncs.find((item) => item.id === PREVIEW_1).state, 'error');

  const newTerminal = fakeRequest({
    stage: 'prepared',
    syncPages: [[
      ...baseline.syncs.map((item) => sync(item.id, item.state, {
        commitId: item.commitId,
        completedAt: item.completedAt ?? undefined,
        startedAt: item.startedAt ?? undefined,
      })),
      sync('exe-55555555555555555555', 'error'),
    ]],
  });
  await assert.rejects(
    capture(preparedOptions, { requestJson: newTerminal.requestJson }),
    (error) => error instanceof CaptureError && error.code === 'new_sync_identity',
  );
});

test('Capture B equality ignores only timestamp and rejects projection drift', async () => {
  const baseline = (await captureFixture()).value;
  const preparedOptions = options('prepared');
  preparedOptions.baseline = baseline;
  const firstFake = fakeRequest({ stage: 'prepared' });
  const first = await capture(preparedOptions, {
    now: new Date('2026-08-05T18:01:00Z'),
    requestJson: firstFake.requestJson,
  });

  const secondOptions = { ...preparedOptions, equalCapture: first };
  const secondFake = fakeRequest({ stage: 'prepared' });
  const second = await capture(secondOptions, {
    now: new Date('2026-08-05T18:02:00Z'),
    requestJson: secondFake.requestJson,
  });
  assert.equal(typeof second.equalCaptureSha256, 'string');

  const driftFake = fakeRequest({
    stage: 'prepared',
    serviceOverride: { type: 'web' },
  });
  await assert.rejects(
    capture(secondOptions, {
      now: new Date('2026-08-05T18:02:00Z'),
      requestJson: driftFake.requestJson,
    }),
    (error) => error instanceof CaptureError
      && error.code === 'equal_capture_projection_mismatch',
  );
});

test('rollback authorization values are never emitted even when detection fails', async () => {
  const secretValue = 'must-never-appear-in-receipt-or-error';
  const fake = fakeRequest({
    envPages: [[{
      cursor: 'forbidden',
      envVar: {
        key: 'PLATFORM_ROLLBACK_AUTHORIZATION_B64',
        value: secretValue,
      },
    }]],
  });

  await assert.rejects(
    capture(options(), { requestJson: fake.requestJson }),
    (error) => {
      assert.equal(error.message.includes(secretValue), false);
      return error instanceof CaptureError && error.code === 'rollback_authorization_present';
    },
  );
});

test('argument parser pins prepared requirements and exact known previews', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'variant-b-capture-'));
  const baselinePath = path.join(directory, 'baseline.json');
  fs.writeFileSync(baselinePath, JSON.stringify({
    schema: 'platform-reliability-variant-b-provider-capture.v1',
    syncs: [],
    syncsSha256: '0'.repeat(64),
  }));
  const parsed = parseArgs([
    '--stage', 'prepared',
    '--blueprint-id', BLUEPRINT_ID,
    '--service-id', SERVICE_ID,
    '--expected-owner-id', OWNER_ID,
    '--expected-current-deploy', DEPLOY_ID,
    '--known-preview-id', PREVIEW_1,
    '--known-preview-id', PREVIEW_2,
    '--expected-image-path', IMAGE,
    '--expected-registry-credential-id', REGISTRY_ID,
    '--expected-health-check-path', '/api/health',
    '--expected-predeploy-command', PREDEPLOY,
    '--baseline', baselinePath,
    '--output', path.join(directory, 'capture.json'),
  ]);
  assert.deepEqual(parsed.knownPreviewIds, [PREVIEW_1, PREVIEW_2]);
  assert.equal(parsed.stage, 'prepared');
  fs.rmSync(directory, { force: true, recursive: true });
});

test('JCS serialization is deterministic and rejects invalid Unicode', () => {
  assert.equal(canonicalize({ z: 1, a: [true, -0, 'x'] }), '{"a":[true,0,"x"],"z":1}');
  assert.throws(
    () => canonicalize({ bad: '\ud800' }),
    (error) => error instanceof CaptureError && error.code === 'canonical_unicode_invalid',
  );
});

test('HTTP client sends GET bearer auth but does not expose token in errors', async () => {
  const calls = [];
  const client = createRequestClient('secret-token', async (url, init) => {
    calls.push({ init, url });
    return {
      ok: true,
      text: async () => '{"ok":true}',
    };
  });
  assert.deepEqual(await client('/users'), { ok: true });
  assert.equal(calls[0].init.method, 'GET');
  assert.equal(calls[0].init.headers.Authorization, 'Bearer secret-token');

  const failed = createRequestClient('secret-token', async () => ({
    ok: false,
    text: async () => 'secret-token',
  }));
  await assert.rejects(
    failed('/users'),
    (error) => error instanceof CaptureError
      && error.code === 'render_api_failed'
      && !error.message.includes('secret-token'),
  );
});

test('route pins the exact capture bytes and both known preview identities', () => {
  const scriptPath = path.join(
    ROOT,
    'scripts',
    'platform-reliability-variant-b-provider-capture.mjs',
  );
  const route = fs.readFileSync(
    path.join(ROOT, 'platform-reliability-variant-b-deploy-slice-v4-2026-08-05.md'),
    'utf8',
  );
  const digest = crypto.createHash('sha256').update(fs.readFileSync(scriptPath)).digest('hex');

  assert.equal(digest, 'e1dc4484c591195d7ed2e5de9b2aa6d473d701af97081b0c55fa7a5286af0c82');
  assert.ok(route.includes(digest));
  assert.ok(route.includes('exe-d9nercqjnfac73aunbvg'));
  assert.ok(route.includes('exe-d9pg7s3m8hqs73fguv80'));
  assert.ok(route.includes('--stage pre-window'));
  assert.ok(route.includes('--stage prepared'));
  assert.ok(route.includes('--equal-capture'));
});
