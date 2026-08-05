#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

const API_BASE = 'https://api.render.com/v1';
const MAX_RESPONSE_BYTES = 1_048_576;
const MAX_PAGES = 100;
const PAGE_LIMIT = 100;
const BLUEPRINT_ID_RE = /^exs-[0-9a-z]{20}$/;
const SERVICE_ID_RE = /^srv-[0-9a-z]{20}$/;
const DEPLOY_ID_RE = /^dep-[0-9a-z]{20}$/;
const EXECUTION_ID_RE = /^exe-[0-9a-z]{20}$/;
const OWNER_ID_RE = /^tea-[0-9a-z]{20}$/;
const REGISTRY_ID_RE = /^rgc-[0-9a-z]{20}$/;
const SYNC_STATES = new Set(['created', 'pending', 'running', 'error', 'success']);
const NONTERMINAL_SYNC_STATES = new Set(['created', 'pending', 'running']);
const ALLOWED_RESIDUAL_STATES = new Set(['created', 'pending', 'error']);
const DEPLOY_STATUSES = new Set([
  'created',
  'queued',
  'build_in_progress',
  'update_in_progress',
  'live',
  'deactivated',
  'build_failed',
  'update_failed',
  'canceled',
  'pre_deploy_in_progress',
  'pre_deploy_failed',
]);
const FORBIDDEN_ROLLBACK_KEYS = new Set([
  'PLATFORM_ROLLBACK_AUTHORIZATION_B64',
  'PLATFORM_ROLLBACK_AUTHORIZATION_SHA256',
]);

export class CaptureError extends Error {
  constructor(code) {
    super(code);
    this.name = 'CaptureError';
    this.code = code;
  }
}

function fail(code) {
  throw new CaptureError(code);
}

function assertPlainObject(value, code) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    fail(code);
  }
  return value;
}

function assertString(value, code, pattern = null) {
  if (typeof value !== 'string' || value.length === 0) {
    fail(code);
  }
  if (pattern !== null && !pattern.test(value)) {
    fail(code);
  }
  return value;
}

function optionalTimestamp(value, code) {
  if (value === undefined || value === null) return null;
  const result = assertString(value, code);
  if (!Number.isFinite(Date.parse(result))) fail(code);
  return result;
}

function assertWellFormedUnicode(value) {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) fail('canonical_unicode_invalid');
      index += 1;
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      fail('canonical_unicode_invalid');
    }
  }
}

// RFC 8785 uses ECMAScript number/string serialization and UTF-16 key ordering.
export function canonicalize(value) {
  if (value === null || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'string') {
    assertWellFormedUnicode(value);
    return JSON.stringify(value);
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) fail('canonical_number_invalid');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalize(item)).join(',')}]`;
  }
  if (value !== null && typeof value === 'object') {
    const keys = Object.keys(value).sort();
    return `{${keys.map((key) => {
      assertWellFormedUnicode(key);
      if (value[key] === undefined) fail('canonical_value_invalid');
      return `${JSON.stringify(key)}:${canonicalize(value[key])}`;
    }).join(',')}}`;
  }
  fail('canonical_value_invalid');
}

function sha256Canonical(value) {
  return crypto.createHash('sha256').update(canonicalize(value)).digest('hex');
}

function normalizeAutoDeploy(value) {
  if (value === false || value === 'no') return false;
  if (value === true || value === 'yes') return true;
  fail('service_autodeploy_unreadable');
}

function normalizeBlueprint(payload, expectedId) {
  const blueprint = assertPlainObject(payload, 'blueprint_shape_invalid');
  if (blueprint.id !== expectedId) fail('blueprint_identity_mismatch');
  if (typeof blueprint.autoSync !== 'boolean') fail('blueprint_autosync_unreadable');
  if (blueprint.autoSync) fail('blueprint_autosync_enabled');
  return {
    autoSync: false,
    id: expectedId,
    status: assertString(blueprint.status, 'blueprint_status_invalid'),
  };
}

function registryId(service, envDetails) {
  const candidates = [];
  if (service.registryCredential !== undefined && service.registryCredential !== null) {
    candidates.push(assertPlainObject(
      service.registryCredential,
      'service_registry_credential_shape_invalid',
    ).id);
  }
  if (envDetails.registryCredential !== undefined && envDetails.registryCredential !== null) {
    candidates.push(assertPlainObject(
      envDetails.registryCredential,
      'service_registry_credential_shape_invalid',
    ).id);
  }
  const present = candidates.map((value) => assertString(
    value,
    'service_registry_credential_invalid',
    REGISTRY_ID_RE,
  ));
  if (new Set(present).size > 1) fail('service_registry_credential_inconsistent');
  return present[0] ?? null;
}

function preDeployCommand(details, envDetails) {
  const candidates = [details.preDeployCommand, envDetails.preDeployCommand]
    .filter((value) => value !== undefined && value !== null)
    .map((value) => assertString(value, 'service_predeploy_command_invalid'));
  if (new Set(candidates).size > 1) fail('service_predeploy_command_inconsistent');
  return candidates[0] ?? null;
}

function normalizeService(payload, options) {
  const service = assertPlainObject(payload, 'service_shape_invalid');
  if (service.id !== options.serviceId) fail('service_identity_mismatch');
  if (service.ownerId !== options.expectedOwnerId) fail('service_owner_mismatch');
  if (!['web', 'web_service'].includes(service.type)) fail('service_type_mismatch');
  if (normalizeAutoDeploy(service.autoDeploy)) fail('service_autodeploy_enabled');
  if (service.autoDeployTrigger !== undefined && service.autoDeployTrigger !== 'off') {
    fail('service_autodeploy_trigger_enabled');
  }
  const details = assertPlainObject(service.serviceDetails, 'service_details_invalid');
  const envDetails = assertPlainObject(
    details.envSpecificDetails,
    'service_env_details_invalid',
  );
  const runtime = details.runtime ?? details.env;
  const normalized = {
    autoDeploy: false,
    healthCheckPath: assertString(
      details.healthCheckPath,
      'service_health_check_path_invalid',
    ),
    id: options.serviceId,
    imagePath: service.imagePath ?? null,
    ownerId: options.expectedOwnerId,
    preDeployCommand: preDeployCommand(details, envDetails),
    registryCredentialId: registryId(service, envDetails),
    runtime: assertString(runtime, 'service_runtime_invalid'),
    type: service.type,
  };
  if (normalized.imagePath !== null && typeof normalized.imagePath !== 'string') {
    fail('service_image_path_invalid');
  }
  if (
    normalized.preDeployCommand !== null
    && typeof normalized.preDeployCommand !== 'string'
  ) {
    fail('service_predeploy_command_invalid');
  }
  if (options.stage === 'prepared') {
    if (normalized.runtime !== 'image') fail('prepared_runtime_mismatch');
    if (normalized.imagePath !== options.expectedImagePath) {
      fail('prepared_image_path_mismatch');
    }
    if (normalized.registryCredentialId !== options.expectedRegistryCredentialId) {
      fail('prepared_registry_credential_mismatch');
    }
    if (normalized.healthCheckPath !== options.expectedHealthCheckPath) {
      fail('prepared_health_check_path_mismatch');
    }
    if (normalized.preDeployCommand !== options.expectedPreDeployCommand) {
      fail('prepared_predeploy_command_mismatch');
    }
  } else {
    if (normalized.runtime !== 'docker') fail('prewindow_runtime_mismatch');
    if (normalized.imagePath !== null) fail('prewindow_image_path_mismatch');
  }
  return normalized;
}

function normalizeSync(item) {
  const wrapper = assertPlainObject(item, 'sync_wrapper_invalid');
  assertString(wrapper.cursor, 'sync_cursor_invalid');
  const sync = assertPlainObject(wrapper.sync, 'sync_shape_invalid');
  const state = assertString(sync.state, 'sync_state_invalid');
  if (!SYNC_STATES.has(state)) fail('sync_state_invalid');
  const commit = assertPlainObject(sync.commit, 'sync_commit_invalid');
  return {
    commitId: assertString(commit.id, 'sync_commit_invalid'),
    completedAt: optionalTimestamp(sync.completedAt, 'sync_completed_at_invalid'),
    id: assertString(sync.id, 'sync_id_invalid', EXECUTION_ID_RE),
    startedAt: optionalTimestamp(sync.startedAt, 'sync_started_at_invalid'),
    state,
  };
}

function normalizeDeployPage(payload, expectedDeployId) {
  if (!Array.isArray(payload) || payload.length !== 1) fail('latest_deploy_count_invalid');
  const wrapper = assertPlainObject(payload[0], 'deploy_wrapper_invalid');
  const deploy = assertPlainObject(wrapper.deploy, 'deploy_shape_invalid');
  const id = assertString(deploy.id, 'deploy_id_invalid', DEPLOY_ID_RE);
  if (id !== expectedDeployId) fail('latest_deploy_identity_mismatch');
  const status = assertString(deploy.status, 'deploy_status_invalid');
  if (!DEPLOY_STATUSES.has(status)) fail('deploy_status_invalid');
  if (status !== 'live') fail('latest_deploy_not_live');
  return { id, status };
}

async function paginated(requestJson, path, itemKey) {
  const items = [];
  const cursors = new Set();
  let cursor = null;
  let pageCount = 0;
  while (pageCount < MAX_PAGES) {
    const query = new URLSearchParams({ limit: String(PAGE_LIMIT) });
    if (cursor !== null) query.set('cursor', cursor);
    const page = await requestJson(`${path}?${query.toString()}`);
    if (!Array.isArray(page)) fail(`${itemKey}_page_invalid`);
    pageCount += 1;
    for (const wrapper of page) {
      const object = assertPlainObject(wrapper, `${itemKey}_wrapper_invalid`);
      assertPlainObject(object[itemKey], `${itemKey}_shape_invalid`);
      const itemCursor = assertString(object.cursor, `${itemKey}_cursor_invalid`);
      if (cursors.has(itemCursor)) fail(`${itemKey}_cursor_repeated`);
      cursors.add(itemCursor);
      items.push(object);
    }
    if (page.length < PAGE_LIMIT) return { items, pageCount };
    cursor = assertString(page[page.length - 1].cursor, `${itemKey}_cursor_invalid`);
  }
  fail(`${itemKey}_pagination_limit_exceeded`);
}

function validateSyncSet(syncs, knownPreviewIds) {
  const ids = new Set();
  const known = new Set(knownPreviewIds);
  for (const sync of syncs) {
    if (ids.has(sync.id)) fail('sync_identity_duplicate');
    ids.add(sync.id);
    if (known.has(sync.id) && !ALLOWED_RESIDUAL_STATES.has(sync.state)) {
      fail('known_preview_state_unsafe');
    }
    if (NONTERMINAL_SYNC_STATES.has(sync.state) && !known.has(sync.id)) {
      fail('unknown_nonterminal_sync');
    }
  }
}

function assertResidualTransition(before, after) {
  if (before.commitId !== after.commitId) fail('known_preview_commit_drift');
  const transitions = {
    created: new Set(['created', 'pending', 'error']),
    pending: new Set(['pending', 'error']),
    error: new Set(['error']),
  };
  if (!transitions[before.state]?.has(after.state)) {
    fail('known_preview_state_regression');
  }
  if (before.startedAt !== null && before.startedAt !== after.startedAt) {
    fail('known_preview_started_at_drift');
  }
  if (before.completedAt !== null && before.completedAt !== after.completedAt) {
    fail('known_preview_completed_at_drift');
  }
  if (after.completedAt !== null && after.state !== 'error') {
    fail('known_preview_completion_invalid');
  }
}

function compareBaselineSyncs(baseline, current, knownPreviewIds) {
  const baselineObject = assertPlainObject(baseline, 'baseline_capture_invalid');
  if (baselineObject.schema !== 'platform-reliability-variant-b-provider-capture.v1') {
    fail('baseline_capture_invalid');
  }
  if (!Array.isArray(baselineObject.syncs)) fail('baseline_syncs_invalid');
  const beforeById = new Map(baselineObject.syncs.map((sync) => [sync.id, sync]));
  const afterById = new Map(current.map((sync) => [sync.id, sync]));
  if (beforeById.size !== baselineObject.syncs.length) fail('baseline_syncs_invalid');
  for (const id of afterById.keys()) {
    if (!beforeById.has(id)) fail('new_sync_identity');
  }
  const known = new Set(knownPreviewIds);
  for (const [id, before] of beforeById.entries()) {
    const after = afterById.get(id);
    if (after === undefined) {
      if (!known.has(id)) fail('baseline_sync_missing');
      continue;
    }
    if (known.has(id)) assertResidualTransition(before, after);
    else if (canonicalize(before) !== canonicalize(after)) fail('baseline_sync_drift');
  }
}

function equalCaptureProjection(receipt) {
  const {
    observedAt: _observedAt,
    equalCaptureSha256: _equalCaptureSha256,
    ...projection
  } = receipt;
  return projection;
}

function parseCaptureFile(path, code) {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  } catch {
    fail(code);
  }
  return assertPlainObject(parsed, code);
}

export async function capture(options, dependencies = {}) {
  const requestJson = dependencies.requestJson;
  if (typeof requestJson !== 'function') fail('request_client_missing');
  const blueprint = normalizeBlueprint(
    await requestJson(`/blueprints/${options.blueprintId}`),
    options.blueprintId,
  );
  const service = normalizeService(
    await requestJson(`/services/${options.serviceId}`),
    options,
  );
  const deploy = normalizeDeployPage(
    await requestJson(`/services/${options.serviceId}/deploys?limit=1`),
    options.expectedCurrentDeploy,
  );
  const syncPage = await paginated(
    requestJson,
    `/blueprints/${options.blueprintId}/syncs`,
    'sync',
  );
  const syncs = syncPage.items.map(normalizeSync).sort((left, right) => (
    left.id < right.id ? -1 : left.id > right.id ? 1 : 0
  ));
  validateSyncSet(syncs, options.knownPreviewIds);
  const envPage = await paginated(
    requestJson,
    `/services/${options.serviceId}/env-vars`,
    'envVar',
  );
  const envKeys = envPage.items.map((wrapper) => assertString(
    wrapper.envVar.key,
    'env_key_invalid',
  ));
  if (new Set(envKeys).size !== envKeys.length) fail('env_key_duplicate');
  const forbiddenRollbackEnvKeysPresent = [...FORBIDDEN_ROLLBACK_KEYS]
    .filter((key) => envKeys.includes(key))
    .sort();
  if (forbiddenRollbackEnvKeysPresent.length !== 0) {
    fail('rollback_authorization_present');
  }
  if (options.baseline !== null) {
    compareBaselineSyncs(options.baseline, syncs, options.knownPreviewIds);
  }
  const observed = dependencies.now ?? new Date();
  if (!(observed instanceof Date) || !Number.isFinite(observed.getTime())) {
    fail('observation_time_invalid');
  }
  const receipt = {
    blueprint,
    forbiddenRollbackEnvKeysPresent,
    knownPreviewIds: [...options.knownPreviewIds].sort(),
    latestDeploy: deploy,
    observedAt: observed.toISOString(),
    pageCounts: {
      envVars: envPage.pageCount,
      syncs: syncPage.pageCount,
    },
    pendingPreviewIds: syncs
      .filter((sync) => ['created', 'pending'].includes(sync.state))
      .map((sync) => sync.id)
      .sort(),
    schema: 'platform-reliability-variant-b-provider-capture.v1',
    service,
    stage: options.stage,
    status: 'PASS',
    syncs,
    syncsSha256: sha256Canonical(syncs),
  };
  if (options.baseline !== null) {
    receipt.baselineSyncsSha256 = assertString(
      options.baseline.syncsSha256,
      'baseline_syncs_sha256_invalid',
      /^[0-9a-f]{64}$/,
    );
    if (receipt.baselineSyncsSha256 !== sha256Canonical(options.baseline.syncs)) {
      fail('baseline_syncs_sha256_mismatch');
    }
  }
  if (options.equalCapture !== null) {
    if (options.equalCapture.stage !== options.stage) fail('equal_capture_stage_mismatch');
    if (
      canonicalize(equalCaptureProjection(options.equalCapture))
      !== canonicalize(equalCaptureProjection(receipt))
    ) {
      fail('equal_capture_projection_mismatch');
    }
    receipt.equalCaptureSha256 = sha256Canonical(options.equalCapture);
  }
  return receipt;
}

export function parseArgs(argv) {
  const single = new Map();
  const knownPreviewIds = [];
  for (let index = 0; index < argv.length; index += 1) {
    const name = argv[index];
    if (!name.startsWith('--')) fail('argument_invalid');
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) fail('argument_value_missing');
    index += 1;
    if (name === '--known-preview-id') {
      knownPreviewIds.push(assertString(value, 'known_preview_id_invalid', EXECUTION_ID_RE));
    } else {
      if (single.has(name)) fail('argument_duplicate');
      single.set(name, value);
    }
  }
  const allowed = new Set([
    '--stage',
    '--blueprint-id',
    '--service-id',
    '--expected-owner-id',
    '--expected-current-deploy',
    '--expected-image-path',
    '--expected-registry-credential-id',
    '--expected-health-check-path',
    '--expected-predeploy-command',
    '--baseline',
    '--equal-capture',
    '--output',
  ]);
  for (const name of single.keys()) if (!allowed.has(name)) fail('argument_invalid');
  const required = (name) => assertString(single.get(name), 'argument_required');
  const stage = required('--stage');
  if (!['pre-window', 'prepared'].includes(stage)) fail('stage_invalid');
  if (knownPreviewIds.length === 0 || new Set(knownPreviewIds).size !== knownPreviewIds.length) {
    fail('known_preview_ids_invalid');
  }
  const options = {
    baseline: single.has('--baseline')
      ? parseCaptureFile(single.get('--baseline'), 'baseline_capture_invalid')
      : null,
    blueprintId: assertString(required('--blueprint-id'), 'blueprint_id_invalid', BLUEPRINT_ID_RE),
    equalCapture: single.has('--equal-capture')
      ? parseCaptureFile(single.get('--equal-capture'), 'equal_capture_invalid')
      : null,
    expectedCurrentDeploy: assertString(
      required('--expected-current-deploy'),
      'expected_deploy_id_invalid',
      DEPLOY_ID_RE,
    ),
    expectedHealthCheckPath: single.get('--expected-health-check-path') ?? null,
    expectedImagePath: single.get('--expected-image-path') ?? null,
    expectedOwnerId: assertString(
      required('--expected-owner-id'),
      'expected_owner_id_invalid',
      OWNER_ID_RE,
    ),
    expectedPreDeployCommand: single.get('--expected-predeploy-command') ?? null,
    expectedRegistryCredentialId: single.has('--expected-registry-credential-id')
      ? assertString(
        single.get('--expected-registry-credential-id'),
        'expected_registry_id_invalid',
        REGISTRY_ID_RE,
      )
      : null,
    knownPreviewIds,
    output: required('--output'),
    serviceId: assertString(required('--service-id'), 'service_id_invalid', SERVICE_ID_RE),
    stage,
  };
  if (stage === 'prepared') {
    for (const [name, value] of [
      ['expected_image_path_missing', options.expectedImagePath],
      ['expected_registry_id_missing', options.expectedRegistryCredentialId],
      ['expected_health_check_path_missing', options.expectedHealthCheckPath],
      ['expected_predeploy_command_missing', options.expectedPreDeployCommand],
    ]) {
      if (typeof value !== 'string' || value.length === 0) fail(name);
    }
    if (options.baseline === null) fail('prepared_baseline_missing');
  } else if (options.equalCapture !== null) {
    fail('prewindow_equal_capture_forbidden');
  }
  return options;
}

export function createRequestClient(token, fetchImpl = globalThis.fetch) {
  if (typeof token !== 'string' || token.length === 0) fail('render_token_missing');
  if (typeof fetchImpl !== 'function') fail('fetch_missing');
  return async (path) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    let response;
    try {
      response = await fetchImpl(`${API_BASE}${path}`, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        method: 'GET',
        signal: controller.signal,
      });
    } catch {
      fail('render_api_failed');
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) fail('render_api_failed');
    const raw = await response.text();
    if (Buffer.byteLength(raw, 'utf8') > MAX_RESPONSE_BYTES) {
      fail('render_response_too_large');
    }
    try {
      return JSON.parse(raw);
    } catch {
      fail('render_response_invalid');
    }
  };
}

function publishNoClobber(path, raw) {
  let descriptor;
  try {
    descriptor = fs.openSync(path, 'wx', 0o600);
    fs.writeFileSync(descriptor, raw, { encoding: 'utf8' });
    fs.fsyncSync(descriptor);
  } catch (error) {
    if (error?.code === 'EEXIST') fail('output_exists');
    fail('output_write_failed');
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor);
  }
}

export async function main(argv = process.argv.slice(2)) {
  let options;
  try {
    options = parseArgs(argv);
    const requestJson = createRequestClient(process.env.RENDER_API_KEY ?? '');
    const receipt = await capture(options, { requestJson });
    const raw = canonicalize(receipt);
    publishNoClobber(options.output, raw);
    process.stdout.write(`${JSON.stringify({
      observedAt: receipt.observedAt,
      receiptSha256: crypto.createHash('sha256').update(raw).digest('hex'),
      status: 'PASS',
    })}\n`);
    return 0;
  } catch (error) {
    const code = error instanceof CaptureError ? error.code : 'unexpected_error';
    process.stderr.write(`variant-b-provider-capture: ${code}\n`);
    return 2;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
