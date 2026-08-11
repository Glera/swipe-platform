import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canonicalJson,
  createIssueWake,
  createIssueWakeInstall,
  createIssueWakeReceipt,
  decodeIssueWakeMarkers,
  decodeIssueWakeReceiptMarkers,
  encodeIssueWakeMarker,
  encodeIssueWakeReceiptMarker,
  projectIssueWakeJournal,
  selectPendingIssueWake,
  validateIssueWake,
  validateIssueWakeInstall,
} from './two-mac-issue-wake-contract.mjs';

const DIGEST_A = 'a'.repeat(64);
const DIGEST_B = 'b'.repeat(64);
const DIGEST_C = 'c'.repeat(64);
const BRIDGE_HEAD = '1'.repeat(40);
const WAKE_HEAD = '2'.repeat(40);

function makeWake(overrides = {}) {
  return createIssueWake({
    controlIssue: 94,
    repositoryId: '1305418803',
    bindingDigest: DIGEST_A,
    taskDigest: DIGEST_B,
    bridgeCommit: BRIDGE_HEAD,
    wakeCommit: WAKE_HEAD,
    sourceComments: [
      { commentId: 5254002547, bodySha256: DIGEST_C },
      { commentId: 5254495049, bodySha256: DIGEST_A },
    ],
    createdAt: '2026-08-11T16:00:00.000Z',
    expiresAt: '2026-08-12T16:00:00.000Z',
    ...overrides,
  });
}

test('issue wake marker round-trips canonical structured data only', () => {
  const wake = makeWake();
  const marker = encodeIssueWakeMarker(wake);
  assert.deepEqual(decodeIssueWakeMarkers(`bounded\n${marker}`), [wake]);
  assert.equal(marker.includes('OBSERVE_ASSIGNED_QUEUE'), false);
  assert.equal(marker.includes('sourceComments'), false);
});

test('marker-like framing corruption is never downgraded to prose', () => {
  const marker = encodeIssueWakeMarker(makeWake());
  const malformed = marker.replace(' -->', '  -->');
  assert.throws(() => decodeIssueWakeMarkers(malformed), /marker is malformed/u);
  assert.throws(() => projectIssueWakeJournal([malformed]), /marker is malformed/u);
});

test('issue wake rejects arbitrary actions, unsorted evidence, and broad TTL', () => {
  assert.throws(() => makeWake({ action: 'RUN_SHELL' }), /action is invalid/u);
  const unsorted = makeWake();
  unsorted.sourceComments.reverse();
  assert.throws(() => validateIssueWake(unsorted), /sorted/u);
  assert.throws(() => makeWake({ expiresAt: '2026-08-12T16:00:00.001Z' }), /within 24 hours/u);
});

test('wake digest detects any source-comment byte or binding mutation', () => {
  const wake = makeWake();
  const mutatedSource = structuredClone(wake);
  mutatedSource.sourceComments[0].bodySha256 = DIGEST_B;
  assert.throws(() => validateIssueWake(mutatedSource), /digest does not match/u);
  const mutatedBinding = structuredClone(wake);
  mutatedBinding.bindingDigest = DIGEST_C;
  assert.throws(() => validateIssueWake(mutatedBinding), /digest does not match/u);
});

test('CLAIM and terminal receipts form one exact append-only chain', () => {
  const wake = makeWake();
  const claim = createIssueWakeReceipt({
    wake,
    status: 'CLAIM',
    occurredAt: '2026-08-11T16:01:00.000Z',
  });
  const done = createIssueWakeReceipt({
    wake,
    status: 'DONE',
    claim,
    occurredAt: '2026-08-11T16:02:00.000Z',
  });
  const bodies = [
    encodeIssueWakeMarker(wake),
    encodeIssueWakeReceiptMarker(claim),
    encodeIssueWakeReceiptMarker(done),
  ];
  const [projection] = projectIssueWakeJournal(bodies, { now: Date.parse('2026-08-11T16:03:00.000Z') });
  assert.equal(projection.state, 'DONE');
  assert.equal(projection.claim.receiptDigest, done.parentReceiptDigest);
  assert.deepEqual(decodeIssueWakeReceiptMarkers(bodies[1]), [claim]);
});

test('terminal without exact CLAIM and conflicting receipt replay fail closed', () => {
  const wake = makeWake();
  const claim = createIssueWakeReceipt({
    wake,
    status: 'CLAIM',
    occurredAt: '2026-08-11T16:01:00.000Z',
  });
  const done = createIssueWakeReceipt({
    wake,
    status: 'DONE',
    claim,
    occurredAt: '2026-08-11T16:02:00.000Z',
  });
  assert.throws(
    () => projectIssueWakeJournal([encodeIssueWakeMarker(wake), encodeIssueWakeReceiptMarker(done)]),
    /not bound to the exact CLAIM/u,
  );
  const conflictingClaim = createIssueWakeReceipt({
    wake,
    status: 'CLAIM',
    occurredAt: '2026-08-11T16:01:01.000Z',
  });
  assert.throws(
    () => projectIssueWakeJournal([
      encodeIssueWakeMarker(wake),
      encodeIssueWakeReceiptMarker(claim),
      encodeIssueWakeReceiptMarker(conflictingClaim),
    ]),
    /conflicting issue wake receipt/u,
  );
});

test('selection requires every existing binding/task/bridge/wake CAS field', () => {
  const wake = makeWake();
  const projections = projectIssueWakeJournal([encodeIssueWakeMarker(wake)]);
  const expected = {
    controlIssue: 94,
    repositoryId: '1305418803',
    targetMachine: 'mac-b',
    bindingDigest: DIGEST_A,
    taskDigest: DIGEST_B,
    bridgeCommit: BRIDGE_HEAD,
    wakeCommit: WAKE_HEAD,
  };
  assert.equal(selectPendingIssueWake(projections, expected).wake.wakeDigest, wake.wakeDigest);
  for (const key of ['repositoryId', 'bindingDigest', 'taskDigest', 'bridgeCommit', 'wakeCommit']) {
    assert.equal(selectPendingIssueWake(projections, { ...expected, [key]: key.includes('Commit') ? '3'.repeat(40) : DIGEST_C }), null);
  }
});

test('two pending exact wakes refuse implicit serialization', () => {
  const first = makeWake();
  const second = makeWake({
    sourceComments: [{ commentId: 5254495049, bodySha256: DIGEST_A }],
    createdAt: '2026-08-11T16:05:00.000Z',
    expiresAt: '2026-08-12T16:05:00.000Z',
  });
  const projections = projectIssueWakeJournal([
    encodeIssueWakeMarker(first),
    encodeIssueWakeMarker(second),
  ]);
  assert.throws(() => selectPendingIssueWake(projections, {
    controlIssue: 94,
    repositoryId: '1305418803',
    targetMachine: 'mac-b',
    bindingDigest: DIGEST_A,
    taskDigest: DIGEST_B,
    bridgeCommit: BRIDGE_HEAD,
    wakeCommit: WAKE_HEAD,
  }), /multiple pending exact issue wakes/u);
});

test('install config stores only the task digest and reviewed file checksums', () => {
  const config = createIssueWakeInstall({
    repository: 'Glera/p4g-workspace-meta',
    controlIssue: 94,
    repositoryId: '1305418803',
    bindingDigest: DIGEST_A,
    taskDigest: DIGEST_B,
    bridgeCommit: BRIDGE_HEAD,
    wakeCommit: WAKE_HEAD,
    sourceDir: '/tmp/p4g-wake',
    bridgeContractSha256: DIGEST_B,
    nodePath: '/usr/local/bin/node',
    codexPath: '/Applications/ChatGPT.app/Contents/Resources/codex',
    ghPath: '/usr/local/bin/gh',
    scriptSha256: DIGEST_C,
    contractSha256: DIGEST_A,
    installedAt: '2026-08-11T16:00:00.000Z',
  });
  assert.equal(validateIssueWakeInstall(config), config);
  assert.equal(canonicalJson(config).includes('019f'), false);
  const mutated = structuredClone(config);
  mutated.scriptSha256 = DIGEST_B;
  assert.throws(() => validateIssueWakeInstall(mutated), /digest does not match/u);
});
