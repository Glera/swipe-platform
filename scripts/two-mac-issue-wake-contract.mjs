import { createHash } from 'node:crypto';

export const ISSUE_WAKE_SCHEMA = 'two-mac.issue-wake.v1';
export const ISSUE_WAKE_RECEIPT_SCHEMA = 'two-mac.issue-wake-receipt.v1';
export const ISSUE_WAKE_INSTALL_SCHEMA = 'two-mac.issue-wake-install.v1';
export const ISSUE_WAKE_ACTIONS = Object.freeze(['OBSERVE_ASSIGNED_QUEUE']);
export const ISSUE_WAKE_STATUSES = Object.freeze(['CLAIM', 'DONE', 'STOP', 'NEEDS_HELP']);

const SHA256 = /^[0-9a-f]{64}$/u;
const GIT_SHA = /^[0-9a-f]{40}$/u;
const DECIMAL_ID = /^[1-9][0-9]{0,31}$/u;
const ERROR_CODE = /^[a-z][a-z0-9_]{2,95}$/u;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;

const WAKE_KEYS = Object.freeze([
  'action',
  'bindingDigest',
  'bridgeCommit',
  'controlIssue',
  'createdAt',
  'expiresAt',
  'repositoryId',
  'schema',
  'sourceComments',
  'targetMachine',
  'taskDigest',
  'wakeCommit',
  'wakeDigest',
]);

const SOURCE_COMMENT_KEYS = Object.freeze(['bodySha256', 'commentId']);

const RECEIPT_KEYS = Object.freeze([
  'bindingDigest',
  'bridgeCommit',
  'code',
  'controlIssue',
  'occurredAt',
  'parentReceiptDigest',
  'receiptDigest',
  'receiptId',
  'repositoryId',
  'schema',
  'status',
  'targetMachine',
  'taskDigest',
  'wakeCommit',
  'wakeDigest',
]);

const INSTALL_KEYS = Object.freeze([
  'bindingDigest',
  'bridgeCommit',
  'bridgeContractSha256',
  'codexPath',
  'configDigest',
  'contractSha256',
  'controlIssue',
  'ghPath',
  'installedAt',
  'machine',
  'nodePath',
  'repository',
  'repositoryId',
  'schema',
  'scriptSha256',
  'sourceDir',
  'taskDigest',
  'wakeCommit',
]);

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  const actual = Object.keys(value).sort();
  if (actual.length !== expected.length
      || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${label} has unexpected fields: ${actual.join(',')}`);
  }
}

function canonicalize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(',')}]`;
  return `{${Object.keys(value).sort().map(
    (key) => `${JSON.stringify(key)}:${canonicalize(value[key])}`,
  ).join(',')}}`;
}

export function canonicalJson(value) {
  return canonicalize(value);
}

export function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function digestObject(value, omittedKey) {
  return sha256(canonicalJson(Object.fromEntries(
    Object.entries(value).filter(([key]) => key !== omittedKey),
  )));
}

function canonicalInstant(value, label) {
  if (typeof value !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)
      || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be canonical UTC milliseconds`);
  }
}

function validateCommon(value, label) {
  if (!Number.isSafeInteger(value.controlIssue) || value.controlIssue < 1) {
    throw new Error(`${label} controlIssue must be a positive strict integer`);
  }
  if (typeof value.repositoryId !== 'string' || !DECIMAL_ID.test(value.repositoryId)) {
    throw new Error(`${label} repositoryId is invalid`);
  }
  if (value.targetMachine !== 'mac-b') throw new Error(`${label} targetMachine must be mac-b`);
  if (!SHA256.test(String(value.bindingDigest || ''))) throw new Error(`${label} bindingDigest is invalid`);
  if (!SHA256.test(String(value.taskDigest || ''))) throw new Error(`${label} taskDigest is invalid`);
  if (!GIT_SHA.test(String(value.bridgeCommit || ''))) throw new Error(`${label} bridgeCommit is invalid`);
  if (!GIT_SHA.test(String(value.wakeCommit || ''))) throw new Error(`${label} wakeCommit is invalid`);
}

export function validateIssueWake(wake) {
  exactKeys(wake, WAKE_KEYS, 'issue wake');
  if (wake.schema !== ISSUE_WAKE_SCHEMA) throw new Error('issue wake schema is invalid');
  validateCommon(wake, 'issue wake');
  if (!ISSUE_WAKE_ACTIONS.includes(wake.action)) throw new Error('issue wake action is invalid');
  if (!Array.isArray(wake.sourceComments) || wake.sourceComments.length < 1
      || wake.sourceComments.length > 8) {
    throw new Error('issue wake sourceComments must contain 1..8 entries');
  }
  let previous = 0;
  for (const source of wake.sourceComments) {
    exactKeys(source, SOURCE_COMMENT_KEYS, 'issue wake source comment');
    if (!Number.isSafeInteger(source.commentId) || source.commentId < 1
        || source.commentId <= previous) {
      throw new Error('issue wake source comment IDs must be positive, unique, and sorted');
    }
    if (!SHA256.test(String(source.bodySha256 || ''))) {
      throw new Error('issue wake source comment bodySha256 is invalid');
    }
    previous = source.commentId;
  }
  canonicalInstant(wake.createdAt, 'issue wake createdAt');
  canonicalInstant(wake.expiresAt, 'issue wake expiresAt');
  const created = Date.parse(wake.createdAt);
  const expires = Date.parse(wake.expiresAt);
  if (expires <= created || expires - created > 24 * 60 * 60 * 1000) {
    throw new Error('issue wake expiry must be within 24 hours after creation');
  }
  if (!SHA256.test(String(wake.wakeDigest || ''))
      || wake.wakeDigest !== digestObject(wake, 'wakeDigest')) {
    throw new Error('issue wake digest does not match wake bytes');
  }
  return wake;
}

export function createIssueWake({
  controlIssue,
  repositoryId,
  bindingDigest,
  taskDigest,
  bridgeCommit,
  wakeCommit,
  sourceComments,
  createdAt,
  expiresAt,
  action = 'OBSERVE_ASSIGNED_QUEUE',
}) {
  const wake = {
    schema: ISSUE_WAKE_SCHEMA,
    controlIssue,
    repositoryId,
    targetMachine: 'mac-b',
    bindingDigest,
    taskDigest,
    bridgeCommit,
    wakeCommit,
    action,
    sourceComments: [...sourceComments].sort((a, b) => a.commentId - b.commentId),
    createdAt,
    expiresAt,
    wakeDigest: '',
  };
  wake.wakeDigest = digestObject(wake, 'wakeDigest');
  return validateIssueWake(wake);
}

export function validateIssueWakeReceipt(receipt) {
  exactKeys(receipt, RECEIPT_KEYS, 'issue wake receipt');
  if (receipt.schema !== ISSUE_WAKE_RECEIPT_SCHEMA) throw new Error('issue wake receipt schema is invalid');
  validateCommon(receipt, 'issue wake receipt');
  if (!SHA256.test(String(receipt.wakeDigest || ''))) throw new Error('issue wake receipt wakeDigest is invalid');
  if (!ISSUE_WAKE_STATUSES.includes(receipt.status)) throw new Error('issue wake receipt status is invalid');
  const expectedId = receipt.status === 'CLAIM'
    ? `claim:${receipt.wakeDigest}`
    : `terminal:${receipt.wakeDigest}`;
  if (receipt.receiptId !== expectedId) throw new Error('issue wake receiptId is invalid');
  if (receipt.status === 'CLAIM') {
    if (receipt.code !== null || receipt.parentReceiptDigest !== null) {
      throw new Error('CLAIM receipt cannot carry code or parent');
    }
  } else {
    if (!SHA256.test(String(receipt.parentReceiptDigest || ''))) {
      throw new Error('terminal receipt requires exact CLAIM parent');
    }
    if (receipt.status === 'DONE') {
      if (receipt.code !== null) throw new Error('DONE receipt code must be null');
    } else if (typeof receipt.code !== 'string' || !ERROR_CODE.test(receipt.code)) {
      throw new Error('STOP/NEEDS_HELP receipt requires a bounded code');
    }
  }
  canonicalInstant(receipt.occurredAt, 'issue wake receipt occurredAt');
  if (!SHA256.test(String(receipt.receiptDigest || ''))
      || receipt.receiptDigest !== digestObject(receipt, 'receiptDigest')) {
    throw new Error('issue wake receipt digest does not match receipt bytes');
  }
  return receipt;
}

export function createIssueWakeReceipt({ wake, status, code = null, claim = null, occurredAt }) {
  validateIssueWake(wake);
  if (!ISSUE_WAKE_STATUSES.includes(status)) throw new Error('issue wake receipt status is invalid');
  const receipt = {
    schema: ISSUE_WAKE_RECEIPT_SCHEMA,
    controlIssue: wake.controlIssue,
    repositoryId: wake.repositoryId,
    targetMachine: wake.targetMachine,
    bindingDigest: wake.bindingDigest,
    taskDigest: wake.taskDigest,
    bridgeCommit: wake.bridgeCommit,
    wakeCommit: wake.wakeCommit,
    wakeDigest: wake.wakeDigest,
    receiptId: status === 'CLAIM' ? `claim:${wake.wakeDigest}` : `terminal:${wake.wakeDigest}`,
    status,
    code,
    parentReceiptDigest: status === 'CLAIM' ? null : claim?.receiptDigest ?? null,
    occurredAt,
    receiptDigest: '',
  };
  receipt.receiptDigest = digestObject(receipt, 'receiptDigest');
  return validateIssueWakeReceipt(receipt);
}

function encodeMarker(prefix, value) {
  const payload = Buffer.from(canonicalJson(value), 'utf8').toString('base64url');
  return `<!-- ${prefix} payload=${payload} -->`;
}

function decodeMarkers(body, prefix, validator) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const markerLike = new RegExp(`<!--\\s*${escapedPrefix}[^>]*-->`, 'gu');
  const exact = new RegExp(`^<!-- ${escapedPrefix} payload=([A-Za-z0-9_-]+) -->$`, 'u');
  const result = [];
  for (const [marker] of String(body || '').matchAll(markerLike)) {
    const match = marker.match(exact);
    if (!match) throw new Error(`${prefix} marker is malformed`);
    let decoded;
    try { decoded = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8')); }
    catch { throw new Error(`${prefix} marker is not valid canonical JSON`); }
    validator(decoded);
    if (canonicalJson(decoded) !== Buffer.from(match[1], 'base64url').toString('utf8')) {
      throw new Error(`${prefix} marker JSON is not canonical`);
    }
    result.push(decoded);
  }
  return result;
}

export function encodeIssueWakeMarker(wake) {
  return encodeMarker('two-mac-issue-wake:v1', validateIssueWake(wake));
}

export function decodeIssueWakeMarkers(body) {
  return decodeMarkers(body, 'two-mac-issue-wake:v1', validateIssueWake);
}

export function encodeIssueWakeReceiptMarker(receipt) {
  return encodeMarker('two-mac-issue-wake-receipt:v1', validateIssueWakeReceipt(receipt));
}

export function decodeIssueWakeReceiptMarkers(body) {
  return decodeMarkers(body, 'two-mac-issue-wake-receipt:v1', validateIssueWakeReceipt);
}

export function projectIssueWakeJournal(bodies, { now = Date.now() } = {}) {
  const wakes = bodies.flatMap(decodeIssueWakeMarkers);
  const receipts = bodies.flatMap(decodeIssueWakeReceiptMarkers);
  const uniqueWakes = new Map();
  for (const wake of wakes) {
    const identity = `${wake.targetMachine}:${wake.wakeDigest}`;
    const previous = uniqueWakes.get(identity);
    if (previous && canonicalJson(previous) !== canonicalJson(wake)) {
      throw new Error(`conflicting issue wake ${wake.wakeDigest}`);
    }
    uniqueWakes.set(identity, wake);
  }
  const projections = [];
  for (const wake of uniqueWakes.values()) {
    const matching = receipts.filter((receipt) => receipt.wakeDigest === wake.wakeDigest);
    for (const receipt of matching) {
      for (const key of ['controlIssue', 'repositoryId', 'targetMachine', 'bindingDigest', 'taskDigest', 'bridgeCommit', 'wakeCommit']) {
        if (receipt[key] !== wake[key]) throw new Error(`issue wake receipt ${key} mismatch`);
      }
    }
    const byId = new Map();
    for (const receipt of matching) {
      const previous = byId.get(receipt.receiptId);
      if (previous && canonicalJson(previous) !== canonicalJson(receipt)) {
        throw new Error(`conflicting issue wake receipt ${receipt.receiptId}`);
      }
      byId.set(receipt.receiptId, receipt);
    }
    const claim = byId.get(`claim:${wake.wakeDigest}`) ?? null;
    const terminal = byId.get(`terminal:${wake.wakeDigest}`) ?? null;
    if (terminal && (!claim || terminal.parentReceiptDigest !== claim.receiptDigest)) {
      throw new Error('terminal issue wake receipt is not bound to the exact CLAIM');
    }
    projections.push({
      wake,
      claim,
      terminal,
      expired: now > Date.parse(wake.expiresAt),
      state: terminal?.status ?? (claim ? 'CLAIMED' : 'PENDING'),
    });
  }
  projections.sort((left, right) => (
    Date.parse(left.wake.createdAt) - Date.parse(right.wake.createdAt)
      || left.wake.wakeDigest.localeCompare(right.wake.wakeDigest)
  ));
  return projections;
}

export function selectPendingIssueWake(projections, expected) {
  const eligible = projections.filter(({ wake, terminal }) => (
    !terminal
      && wake.controlIssue === expected.controlIssue
      && wake.repositoryId === expected.repositoryId
      && wake.targetMachine === expected.targetMachine
      && wake.bindingDigest === expected.bindingDigest
      && wake.taskDigest === expected.taskDigest
      && wake.bridgeCommit === expected.bridgeCommit
      && wake.wakeCommit === expected.wakeCommit
  ));
  if (eligible.length > 1) throw new Error('multiple pending exact issue wakes are not serializable');
  return eligible[0] ?? null;
}

export function validateIssueWakeInstall(config) {
  exactKeys(config, INSTALL_KEYS, 'issue wake install');
  if (config.schema !== ISSUE_WAKE_INSTALL_SCHEMA) throw new Error('issue wake install schema is invalid');
  if (config.machine !== 'mac-b') throw new Error('issue wake install machine must be mac-b');
  if (!REPOSITORY.test(String(config.repository || ''))) throw new Error('issue wake install repository is invalid');
  validateCommon({ ...config, targetMachine: config.machine }, 'issue wake install');
  for (const key of ['sourceDir', 'nodePath', 'codexPath', 'ghPath']) {
    if (typeof config[key] !== 'string' || !config[key].startsWith('/') || /[\0\r\n]/u.test(config[key])) {
      throw new Error(`issue wake install ${key} must be an absolute path`);
    }
  }
  if (!SHA256.test(String(config.scriptSha256 || ''))
      || !SHA256.test(String(config.bridgeContractSha256 || ''))
      || !SHA256.test(String(config.contractSha256 || ''))) {
    throw new Error('issue wake install file digests are invalid');
  }
  canonicalInstant(config.installedAt, 'issue wake install installedAt');
  if (!SHA256.test(String(config.configDigest || ''))
      || config.configDigest !== digestObject(config, 'configDigest')) {
    throw new Error('issue wake install digest does not match config bytes');
  }
  return config;
}

export function createIssueWakeInstall(values) {
  const config = {
    schema: ISSUE_WAKE_INSTALL_SCHEMA,
    repository: values.repository,
    controlIssue: values.controlIssue,
    repositoryId: values.repositoryId,
    machine: 'mac-b',
    bindingDigest: values.bindingDigest,
    taskDigest: values.taskDigest,
    bridgeCommit: values.bridgeCommit,
    bridgeContractSha256: values.bridgeContractSha256,
    wakeCommit: values.wakeCommit,
    sourceDir: values.sourceDir,
    nodePath: values.nodePath,
    codexPath: values.codexPath,
    ghPath: values.ghPath,
    scriptSha256: values.scriptSha256,
    contractSha256: values.contractSha256,
    installedAt: values.installedAt,
    configDigest: '',
  };
  config.configDigest = digestObject(config, 'configDigest');
  return validateIssueWakeInstall(config);
}
