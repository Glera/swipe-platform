import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  buildDevelopmentTicketEvent,
  developmentTicketCommandHash,
  developmentTicketEventHash,
  formatDevelopmentTicketEventComment,
  reduceDevelopmentTicketEvents,
  validateDevelopmentTicketEvent,
  validateDevelopmentTicketMarkdown,
} from './development-ticket.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const script = fileURLToPath(new URL('./development-ticket.mjs', import.meta.url));
const ticketId = 'Glera/p4g-workspace-meta#123';
const writerLogin = 'development-ticket-bridge[bot]';

function event(previous, toState, extra = {}) {
  return buildDevelopmentTicketEvent({
    ticketId,
    eventId: randomUUID(),
    mutationId: randomUUID(),
    sequence: (previous?.sequence ?? 0) + 1,
    createdAt: `2026-08-09T12:00:${String(previous?.sequence ?? 0).padStart(2, '0')}.000Z`,
    previousEventId: previous?.eventId ?? null,
    previousEventHash: previous?.eventHash ?? null,
    fromState: previous?.toState ?? null,
    toState,
    reasonCode: null,
    safeSummary: `safe transition to ${toState}`,
    candidate: null,
    blocker: null,
    nothingPublished: false,
    ...extra,
  });
}

function comment(id, eventValue, createdAt = eventValue.createdAt) {
  return {
    id,
    created_at: createdAt,
    updated_at: createdAt,
    user: { login: writerLogin },
    body: formatDevelopmentTicketEventComment(eventValue),
  };
}

function rawEventComment(id, eventValue, createdAt = eventValue.createdAt) {
  return {
    id,
    created_at: createdAt,
    updated_at: createdAt,
    user: { login: writerLogin },
    body: `<!-- development-ticket-event.v1\n${JSON.stringify(eventValue)}\n-->`,
  };
}

const reduce = (comments, options = {}) => reduceDevelopmentTicketEvents(
  comments,
  { writerLogin, ...options },
);

function rehash(value) {
  const copy = structuredClone(value);
  copy.commandHash = developmentTicketCommandHash(copy);
  copy.eventHash = developmentTicketEventHash(copy);
  return copy;
}

test('template and both dry-run packets satisfy the development-ticket contract', () => {
  for (const relative of [
    '.github/ISSUE_TEMPLATE/development-ticket.md',
    'docs/fixtures/development-ticket-dry-run-platform-v1.md',
    'docs/fixtures/development-ticket-dry-run-mechanic-v1.md',
  ]) {
    const file = path.join(root, relative);
    const result = validateDevelopmentTicketMarkdown(readFileSync(file, 'utf8'), { file });
    assert.equal(result.valid, true, result.errors.join('\n'));
  }
});

test('validator lists routing and authority violations', () => {
  const fixture = readFileSync(
    path.join(root, 'docs/fixtures/development-ticket-dry-run-platform-v1.md'),
    'utf8',
  );
  const invalid = fixture
    .replace('- Assigned cell: `Mac A`', '- Assigned cell: `Mac B`')
    .replace('- [x] Ticket itself grants no merge', '- [ ] Ticket itself grants no merge');
  const result = validateDevelopmentTicketMarkdown(invalid, { file: 'bad-platform.md' });
  assert.equal(result.valid, false);
  assert.match(result.errors.join('\n'), /platform routing must be Assigned cell Mac A/u);
  assert.match(result.errors.join('\n'), /Authority checklist item 1 must be checked/u);
});

test('validate CLI exits nonzero and prints every ticket error', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'development-ticket-'));
  try {
    const file = path.join(dir, 'bad.md');
    writeFileSync(file, '<!-- schema: development-ticket.v1 -->\n## Request identity\n- Type: `wrong`\n');
    const result = spawnSync(process.execPath, [script, 'validate', file], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing section "Original request"/u);
    assert.match(result.stderr, /Type must be one of/u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('reducer folds a deterministic chain and recognizes exact mutation replay', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const queued = event(triaged, 'QUEUED');
  const projection = reduce([
    comment(30, queued),
    comment(10, submitted),
    comment(20, triaged),
    comment(31, queued, '2026-08-09T12:00:03.000Z'),
    { id: 1, created_at: '2026-08-09T11:59:59.000Z', body: 'human note' },
  ]);
  assert.equal(projection.state, 'QUEUED');
  assert.equal(projection.sequence, 3);
  assert.deepEqual(projection.events.map((item) => item.commentId), ['10', '20', '30']);
  assert.equal(projection.replays.length, 1);
  assert.equal(projection.integrityConflicts.length, 0);
  assert.equal(projection.ignoredComments, 1);
});

test('same-head race has one numeric-comment-id winner and one integrity conflict', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const queued = event(triaged, 'QUEUED');
  const first = event(queued, 'IN_PROGRESS');
  const second = event(queued, 'IN_PROGRESS', { eventId: randomUUID(), mutationId: randomUUID() });
  const projection = reduce([
    comment(1, submitted), comment(2, triaged), comment(3, queued),
    comment(11, second, '2026-08-09T12:01:00.000Z'),
    comment(10, first, '2026-08-09T12:01:00.000Z'),
  ]);
  assert.equal(projection.state, 'IN_PROGRESS');
  assert.equal(projection.headEventId, first.eventId);
  assert.equal(projection.events.length, 4);
  assert.equal(projection.integrityConflicts.length, 1);
  assert.equal(projection.integrityConflicts[0].code, 'development_ticket_event_stale_or_fork');
});

test('bad hash and disallowed transition are ignored as integrity conflicts', () => {
  const submitted = event(null, 'SUBMITTED');
  const badHash = { ...event(submitted, 'TRIAGED'), eventHash: `sha256:${'0'.repeat(64)}` };
  const disallowed = event(submitted, 'TRIAGED');
  disallowed.toState = 'LIVE';
  const invalidEdge = rehash(disallowed);
  assert.throws(() => validateDevelopmentTicketEvent(invalidEdge), /not allowed/u);
  const projection = reduce([
    comment(1, submitted),
    rawEventComment(2, badHash),
    rawEventComment(3, invalidEdge),
  ]);
  assert.equal(projection.state, 'SUBMITTED');
  assert.equal(projection.integrityConflicts.length, 2);
});

test('READY_TO_PLAY requires HTTPS candidate identity', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const queued = event(triaged, 'QUEUED');
  const inProgress = event(queued, 'IN_PROGRESS');
  assert.throws(
    () => event(inProgress, 'READY_TO_PLAY'),
    /requires exact candidate identity/u,
  );
  const ready = event(inProgress, 'READY_TO_PLAY', {
    candidate: {
      repository: 'Glera/swipe-platform',
      commitSha: 'a'.repeat(40),
      artifactDigest: `sha256:${'b'.repeat(64)}`,
      url: 'https://candidate.example.test/feed/123/',
    },
  });
  const projection = reduce([
    comment(1, submitted), comment(2, triaged), comment(3, queued),
    comment(4, inProgress), comment(5, ready),
  ]);
  assert.equal(projection.state, 'READY_TO_PLAY');
  assert.equal(projection.candidate.commitSha, 'a'.repeat(40));
});

test('NEEDS_HELP requires safe blocker and explicit nothingPublished then recovers to QUEUED', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const queued = event(triaged, 'QUEUED');
  const inProgress = event(queued, 'IN_PROGRESS');
  assert.throws(
    () => event(inProgress, 'NEEDS_HELP'),
    /requires a safe blocker and nothingPublished=true/u,
  );
  const needsHelp = event(inProgress, 'NEEDS_HELP', {
    reasonCode: 'checks_failed',
    blocker: { code: 'checks_failed', summary: 'Checks failed; no changes were published.' },
    nothingPublished: true,
  });
  const recovered = event(needsHelp, 'QUEUED', { reasonCode: 'operator_retry' });
  const projection = reduce([
    comment(1, submitted), comment(2, triaged), comment(3, queued),
    comment(4, inProgress), comment(5, needsHelp), comment(6, recovered),
  ]);
  assert.equal(projection.state, 'QUEUED');
  assert.equal(projection.integrityConflicts.length, 0);
});

test('REWORK_REQUESTED returns to QUEUED', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const queued = event(triaged, 'QUEUED');
  const inProgress = event(queued, 'IN_PROGRESS');
  const ready = event(inProgress, 'READY_TO_PLAY', {
    candidate: {
      repository: 'Glera/swipe-platform',
      commitSha: 'b'.repeat(40),
      artifactDigest: `sha256:${'c'.repeat(64)}`,
      url: 'https://candidate.example.test/456/',
    },
  });
  const rework = event(ready, 'REWORK_REQUESTED');
  const returned = event(rework, 'QUEUED');
  const projection = reduce([
    submitted, triaged, queued, inProgress, ready, rework, returned,
  ].map((item, index) => comment(index + 1, item)));
  assert.equal(projection.state, 'QUEUED');
  assert.equal(projection.integrityConflicts.length, 0);
});

test('same mutation with changed command bytes conflicts', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const changed = rehash({ ...triaged, safeSummary: 'different safe summary' });
  const projection = reduce([
    comment(1, submitted), comment(2, triaged), comment(3, changed),
  ]);
  assert.equal(projection.state, 'TRIAGED');
  assert.equal(projection.integrityConflicts[0].code, 'development_ticket_mutation_conflict');
});

test('restart fold is byte-deterministic with no local state', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const comments = [comment(1, submitted), comment(2, triaged)];
  const before = reduce(comments);
  const after = reduce(JSON.parse(JSON.stringify(comments)));
  assert.deepEqual(after, before);
});

test('foreign or edited event comments fail closed', () => {
  const submitted = event(null, 'SUBMITTED');
  const foreign = { ...comment(1, submitted), user: { login: 'someone-else' } };
  const edited = { ...comment(2, submitted), updated_at: '2026-08-09T12:00:01.000Z' };
  const projection = reduce([foreign, edited]);
  assert.equal(projection.state, null);
  assert.deepEqual(
    projection.integrityConflicts.map((item) => item.code),
    ['development_ticket_comment_author_invalid', 'development_ticket_comment_edited'],
  );
});

test('READY_TO_PLAY rejects a non-exact candidate identity', () => {
  const submitted = event(null, 'SUBMITTED');
  const triaged = event(submitted, 'TRIAGED');
  const queued = event(triaged, 'QUEUED');
  const inProgress = event(queued, 'IN_PROGRESS');
  assert.throws(() => event(inProgress, 'READY_TO_PLAY', {
    candidate: { identity: 'mutable latest', url: 'https://candidate.example.test/latest/' },
  }), /candidate must contain exactly/u);
});

test('reduce CLI emits projection and fails nonzero on integrity conflict', () => {
  const submitted = event(null, 'SUBMITTED');
  const bad = { ...event(submitted, 'TRIAGED'), eventHash: `sha256:${'f'.repeat(64)}` };
  const dir = mkdtempSync(path.join(tmpdir(), 'development-ticket-events-'));
  try {
    const file = path.join(dir, 'comments.json');
    writeFileSync(file, JSON.stringify({ writerLogin, comments: [comment(1, submitted), {
      id: 2, created_at: bad.createdAt, updated_at: bad.createdAt,
      user: { login: writerLogin },
      body: `<!-- development-ticket-event.v1\n${JSON.stringify(bad)}\n-->`,
    }] }));
    const result = spawnSync(process.execPath, [script, 'reduce', file], { encoding: 'utf8' });
    assert.equal(result.status, 1, result.stderr);
    const projection = JSON.parse(result.stdout);
    assert.equal(projection.state, 'SUBMITTED');
    assert.equal(projection.integrityConflicts.length, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
