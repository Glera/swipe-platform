#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TICKET_SCHEMA = 'development-ticket.v1';
const EVENT_SCHEMA = 'development-ticket-event.v1';
const PROJECTION_SCHEMA = 'development-ticket-projection.v1';

const TYPES = Object.freeze(['mechanic', 'labs', 'platform', 'impact', 'engineering-os']);
const CELLS = Object.freeze(['Mac A', 'Mac B']);
const TIERS = Object.freeze(['0', '1', '2']);
const STATES = Object.freeze([
  'SUBMITTED',
  'TRIAGED',
  'QUEUED',
  'IN_PROGRESS',
  'NEEDS_HELP',
  'READY_TO_PLAY',
  'ACCEPTED',
  'MERGING/DEPLOYING',
  'LIVE',
  'CLOSED',
  'REWORK_REQUESTED',
  'CANCELLED',
]);

const TRANSITIONS = Object.freeze({
  SUBMITTED: Object.freeze(['TRIAGED', 'NEEDS_HELP', 'CANCELLED']),
  TRIAGED: Object.freeze(['QUEUED', 'NEEDS_HELP', 'CANCELLED']),
  QUEUED: Object.freeze(['IN_PROGRESS', 'NEEDS_HELP', 'CANCELLED']),
  IN_PROGRESS: Object.freeze(['READY_TO_PLAY', 'NEEDS_HELP', 'CANCELLED']),
  NEEDS_HELP: Object.freeze(['QUEUED', 'CANCELLED']),
  READY_TO_PLAY: Object.freeze(['ACCEPTED', 'REWORK_REQUESTED', 'NEEDS_HELP', 'CANCELLED']),
  REWORK_REQUESTED: Object.freeze(['QUEUED', 'CANCELLED']),
  ACCEPTED: Object.freeze(['MERGING/DEPLOYING', 'NEEDS_HELP', 'CANCELLED']),
  'MERGING/DEPLOYING': Object.freeze(['LIVE', 'NEEDS_HELP']),
  LIVE: Object.freeze(['CLOSED', 'NEEDS_HELP']),
  CLOSED: Object.freeze([]),
  CANCELLED: Object.freeze([]),
});

const MANDATORY_SECTIONS = Object.freeze([
  'Request identity',
  'Original request',
  'Captured context',
  'Expected outcome',
  'Acceptance criteria',
  'Routing',
  'Execution identity',
  'Safe operator status',
  'Authority checklist',
]);

const MANDATORY_FIELDS = Object.freeze({
  'Request identity': Object.freeze([
    'Ticket ID', 'Request actor', 'Requested at', 'Source request ID/hash', 'Type',
  ]),
  'Captured context': Object.freeze([
    'Surface/route', 'Mechanic/playable', 'Client/platform build SHA',
    'Runtime/candidate identity', 'Screenshot/evidence',
  ]),
  Routing: Object.freeze([
    'Assigned cell', 'Line owner', 'Ticket author', 'Review tier', 'Tier reason',
    'Intended repositories/paths', 'Overlap check',
  ]),
  'Execution identity': Object.freeze([
    'Genesis state', 'Branch/worktree', 'Imported head', 'Candidate/PR identity', 'Evidence',
  ]),
  'Safe operator status': Object.freeze(['Current summary', 'Blocker/NEEDS_HELP']),
});

const EVENT_KEYS = Object.freeze([
  'blocker',
  'candidate',
  'commandHash',
  'createdAt',
  'eventHash',
  'eventId',
  'fromState',
  'mutationId',
  'nothingPublished',
  'previousEventHash',
  'previousEventId',
  'reasonCode',
  'safeSummary',
  'schema',
  'sequence',
  'ticketId',
  'toState',
]);

const COMMAND_KEYS = Object.freeze([
  'blocker',
  'candidate',
  'fromState',
  'mutationId',
  'nothingPublished',
  'previousEventHash',
  'previousEventId',
  'reasonCode',
  'safeSummary',
  'schema',
  'ticketId',
  'toState',
]);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u;
const HASH = /^sha256:[0-9a-f]{64}$/u;
const SHA = /^[0-9a-f]{40}$/u;
const TICKET_ID = /^Glera\/p4g-workspace-meta#[1-9][0-9]*$/u;
const DRY_TICKET_ID = /^DRY-[AB]-[0-9]{3}$/u;
const GITHUB_LOGIN = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?)(?:\[bot\])?$/u;
const REASON_CODE = /^[a-z][a-z0-9_]{2,63}$/u;
const CANONICAL_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u;
const SERVER_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u;

function error(message, code = 'development_ticket_invalid') {
  const result = new Error(message);
  result.code = code;
  return result;
}

function exactKeys(value, expected, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(expected)) {
    throw error(`${label} must contain exactly ${expected.join(', ')}`);
  }
}

function canonicalIso(value, label, pattern = CANONICAL_ISO) {
  if (typeof value !== 'string' || !pattern.test(value)
    || !Number.isFinite(Date.parse(value))) {
    throw error(`${label} must be a canonical UTC timestamp`);
  }
  return value;
}

function printable(value, label, { min = 1, max = 240 } = {}) {
  if (typeof value !== 'string' || value.trim() !== value
    || value.length < min || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(value)) {
    throw error(`${label} must be printable text between ${min} and ${max} characters`);
  }
  return value;
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function digest(value) {
  return `sha256:${createHash('sha256').update(JSON.stringify(canonicalize(value)), 'utf8').digest('hex')}`;
}

function stripTicks(value) {
  const trimmed = value.trim();
  return trimmed.startsWith('`') && trimmed.endsWith('`')
    ? trimmed.slice(1, -1).trim()
    : trimmed;
}

function sectionsOf(markdown) {
  const sections = new Map();
  const matches = [...markdown.matchAll(/^## ([^\n]+)\s*$/gmu)];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const start = match.index + match[0].length;
    const end = matches[index + 1]?.index ?? markdown.length;
    sections.set(match[1].trim(), markdown.slice(start, end).trim());
  }
  return sections;
}

function fieldValue(section, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&');
  const match = section.match(new RegExp(`^- ${escaped}:\\s*([^\\n]*)`, 'mu'));
  if (!match) return null;
  let value = match[1].trim();
  if (value.length === 0) {
    const tail = section.slice((match.index ?? 0) + match[0].length);
    const continuation = [];
    for (const line of tail.split('\n')) {
      if (/^\s{2,}\S/u.test(line)) continuation.push(line.trim());
      else if (line.trim() === '' && continuation.length === 0) continue;
      else break;
    }
    value = continuation.join(' ').trim();
  }
  return stripTicks(value);
}

function sectionContent(section) {
  return section
    .split('\n')
    .map((line) => line.replace(/^>\s?/u, '').trim())
    .filter(Boolean)
    .join(' ');
}

function hasAllChoices(value, choices) {
  const actual = new Set(value.split('|').map((item) => item.trim()));
  return choices.length === actual.size && choices.every((choice) => actual.has(choice));
}

export function validateDevelopmentTicketMarkdown(markdown, { file = '<memory>', template } = {}) {
  const errors = [];
  const add = (message) => errors.push(`${file}: ${message}`);
  if (typeof markdown !== 'string') {
    return { valid: false, errors: [`${file}: ticket must be UTF-8 markdown`], ticket: null };
  }
  const templateMode = template ?? /<issue-number>|name:\s*Development ticket v1/u.test(markdown);
  if (!markdown.includes(`<!-- schema: ${TICKET_SCHEMA} -->`)) {
    add(`missing schema marker ${TICKET_SCHEMA}`);
  }
  const sections = sectionsOf(markdown);
  for (const name of MANDATORY_SECTIONS) {
    if (!sections.has(name)) add(`missing section "${name}"`);
  }

  const fields = {};
  for (const [sectionName, labels] of Object.entries(MANDATORY_FIELDS)) {
    const section = sections.get(sectionName) ?? '';
    for (const label of labels) {
      const value = fieldValue(section, label)
        ?? null;
      fields[label] = value;
      if (!value) add(`missing field "${label}" in "${sectionName}"`);
    }
  }

  for (const name of ['Original request', 'Expected outcome']) {
    const content = sectionContent(sections.get(name) ?? '');
    if (!content) add(`section "${name}" must not be empty`);
  }

  const acceptance = [...(sections.get('Acceptance criteria') ?? '')
    .matchAll(/^- \[(?: |x|X)\]\s+(.+)$/gmu)];
  if (acceptance.length < 2) add('Acceptance criteria must contain at least two checklist items');

  const authoritySection = sections.get('Authority checklist') ?? '';
  const authority = [...authoritySection.matchAll(/^- \[([ xX])\]\s+(.+)$/gmu)];
  if (authority.length < 4) add('Authority checklist must contain at least four items');
  if (!templateMode) {
    authority.forEach((item, index) => {
      if (item[1].toLowerCase() !== 'x') add(`Authority checklist item ${index + 1} must be checked`);
    });
  }

  const requestedAt = fields['Requested at'];
  const type = fields.Type;
  const cell = fields['Assigned cell'];
  const tier = fields['Review tier'];
  const state = fields['Genesis state'];
  if (templateMode) {
    if (requestedAt && requestedAt !== '<canonical UTC>') add('template Requested at must be <canonical UTC>');
    if (type && !hasAllChoices(type, TYPES)) add(`template Type must enumerate ${TYPES.join(' | ')}`);
    if (cell && !hasAllChoices(cell, CELLS)) add(`template Assigned cell must enumerate ${CELLS.join(' | ')}`);
    if (tier && !hasAllChoices(tier, TIERS)) add(`template Review tier must enumerate ${TIERS.join(' | ')}`);
  } else {
    const dryRun = /`dry_run=true`/u.test(markdown);
    if (fields['Ticket ID'] && !(TICKET_ID.test(fields['Ticket ID'])
      || (dryRun && DRY_TICKET_ID.test(fields['Ticket ID'])))) {
      add('Ticket ID must identify the meta-repo Issue or an explicit DRY-A/DRY-B packet');
    }
    if (requestedAt && (!CANONICAL_ISO.test(requestedAt)
      || !Number.isFinite(Date.parse(requestedAt)))) add('Requested at must be canonical UTC ISO with milliseconds');
    if (fields['Source request ID/hash']
      && !/sha256:[0-9a-f]{64}/u.test(fields['Source request ID/hash'])) {
      add('Source request ID/hash must contain an exact sha256 digest');
    }
    if (type && !TYPES.includes(type)) add(`Type must be one of ${TYPES.join(', ')}`);
    if (cell && !CELLS.includes(cell)) add(`Assigned cell must be one of ${CELLS.join(', ')}`);
    if (tier && !TIERS.includes(tier)) add(`Review tier must be one of ${TIERS.join(', ')}`);
    if (type === 'platform' && (cell !== 'Mac A' || tier !== '1')) {
      add('platform routing must be Assigned cell Mac A with Review tier 1');
    }
    if (type === 'mechanic' && (cell !== 'Mac B' || tier !== '0')) {
      add('mechanic routing must be Assigned cell Mac B with Review tier 0');
    }
  }
  if (state && state !== 'SUBMITTED') add('Genesis state must be SUBMITTED');

  const ticket = errors.length === 0 ? {
    schema: TICKET_SCHEMA,
    template: templateMode,
    ticketId: fields['Ticket ID'],
    requestedAt,
    type,
    assignedCell: cell,
    reviewTier: tier,
    genesisState: state,
    acceptanceCriteria: acceptance.map((item) => item[1].trim()),
  } : null;
  return { valid: errors.length === 0, errors, ticket };
}

function normalCandidate(value) {
  if (value === null) return null;
  exactKeys(value, ['artifactDigest', 'commitSha', 'repository', 'url'], 'candidate');
  printable(value.repository, 'candidate.repository', { min: 3, max: 160 });
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u.test(value.repository)) {
    throw error('candidate.repository must be an owner/repository identity');
  }
  if (!SHA.test(String(value.commitSha ?? ''))) {
    throw error('candidate.commitSha must be an exact git SHA');
  }
  if (!HASH.test(String(value.artifactDigest ?? ''))) {
    throw error('candidate.artifactDigest must be a sha256 digest');
  }
  printable(value.url, 'candidate.url', { min: 9, max: 2048 });
  let url;
  try { url = new URL(value.url); } catch { throw error('candidate.url must be an HTTPS URL'); }
  if (url.protocol !== 'https:') throw error('candidate.url must be an HTTPS URL');
  return {
    repository: value.repository,
    commitSha: value.commitSha,
    artifactDigest: value.artifactDigest,
    url: value.url,
  };
}

function normalBlocker(value) {
  if (value === null) return null;
  exactKeys(value, ['code', 'summary'], 'blocker');
  if (typeof value.code !== 'string' || !REASON_CODE.test(value.code)) {
    throw error('blocker.code must be a safe machine code');
  }
  printable(value.summary, 'blocker.summary');
  return { code: value.code, summary: value.summary };
}

function commandIdentity(value) {
  return Object.fromEntries(COMMAND_KEYS.map((key) => [key, value[key]]));
}

function eventIdentity(value) {
  const identity = structuredClone(value);
  delete identity.eventHash;
  return identity;
}

export function developmentTicketCommandHash(raw) {
  return digest(commandIdentity(raw));
}

export function developmentTicketEventHash(raw) {
  return digest(eventIdentity(raw));
}

function validateTransition(fromState, toState) {
  if (fromState === null) {
    if (toState !== 'SUBMITTED') throw error('genesis event must transition null to SUBMITTED');
    return;
  }
  if (!TRANSITIONS[fromState]?.includes(toState)) {
    throw error(`transition ${fromState} -> ${toState} is not allowed`, 'development_ticket_transition_invalid');
  }
}

export function validateDevelopmentTicketEvent(raw) {
  const value = structuredClone(raw);
  exactKeys(value, EVENT_KEYS, 'development ticket event');
  if (value.schema !== EVENT_SCHEMA) throw error(`event schema must be ${EVENT_SCHEMA}`);
  if (!TICKET_ID.test(String(value.ticketId ?? ''))) throw error('ticketId must identify a meta-repo Issue');
  for (const key of ['eventId', 'mutationId']) {
    if (!UUID.test(String(value[key] ?? ''))) throw error(`${key} must be a canonical UUID`);
  }
  if (!Number.isSafeInteger(value.sequence) || value.sequence < 1) {
    throw error('sequence must be a positive safe integer');
  }
  canonicalIso(value.createdAt, 'createdAt');
  if ((value.previousEventId === null) !== (value.previousEventHash === null)) {
    throw error('previousEventId and previousEventHash must both be null or both be present');
  }
  if (value.previousEventId !== null && !UUID.test(String(value.previousEventId))) {
    throw error('previousEventId must be a canonical UUID');
  }
  if (value.previousEventHash !== null && !HASH.test(String(value.previousEventHash))) {
    throw error('previousEventHash must be a sha256 digest');
  }
  if (value.fromState !== null && !STATES.includes(value.fromState)) throw error('fromState is invalid');
  if (!STATES.includes(value.toState)) throw error('toState is invalid');
  if (!(value.reasonCode === null
    || (typeof value.reasonCode === 'string' && REASON_CODE.test(value.reasonCode)))) {
    throw error('reasonCode must be null or a safe machine code');
  }
  printable(value.safeSummary, 'safeSummary');
  value.candidate = normalCandidate(value.candidate);
  value.blocker = normalBlocker(value.blocker);
  if (typeof value.nothingPublished !== 'boolean') throw error('nothingPublished must be boolean');
  if (value.toState === 'READY_TO_PLAY' && value.candidate === null) {
    throw error('READY_TO_PLAY requires exact candidate identity');
  }
  if (value.toState === 'NEEDS_HELP'
    && (value.blocker === null || value.nothingPublished !== true)) {
    throw error('NEEDS_HELP requires a safe blocker and nothingPublished=true');
  }
  if (value.toState !== 'NEEDS_HELP' && value.blocker !== null) {
    throw error('blocker is only allowed for NEEDS_HELP');
  }
  validateTransition(value.fromState, value.toState);
  if (!HASH.test(String(value.commandHash ?? ''))
    || value.commandHash !== developmentTicketCommandHash(value)) {
    throw error('commandHash does not match event command bytes');
  }
  if (!HASH.test(String(value.eventHash ?? ''))
    || value.eventHash !== developmentTicketEventHash(value)) {
    throw error('eventHash does not match event bytes');
  }
  return value;
}

export function buildDevelopmentTicketEvent(input) {
  const value = {
    schema: EVENT_SCHEMA,
    ticketId: input.ticketId,
    eventId: input.eventId,
    mutationId: input.mutationId,
    sequence: input.sequence,
    createdAt: input.createdAt,
    previousEventId: input.previousEventId ?? null,
    previousEventHash: input.previousEventHash ?? null,
    fromState: input.fromState ?? null,
    toState: input.toState,
    reasonCode: input.reasonCode ?? null,
    safeSummary: input.safeSummary,
    candidate: input.candidate ?? null,
    blocker: input.blocker ?? null,
    nothingPublished: input.nothingPublished ?? false,
    commandHash: '',
    eventHash: '',
  };
  value.commandHash = developmentTicketCommandHash(value);
  value.eventHash = developmentTicketEventHash(value);
  return validateDevelopmentTicketEvent(value);
}

export function formatDevelopmentTicketEventComment(event) {
  const value = validateDevelopmentTicketEvent(event);
  return `<!-- ${EVENT_SCHEMA}\n${JSON.stringify(value)}\n-->`;
}

function parseEventBody(body) {
  if (typeof body !== 'string') return { eventLike: false, event: null };
  const trimmed = body.trim();
  let source = null;
  let eventLike = trimmed.includes(EVENT_SCHEMA);
  const html = trimmed.match(new RegExp(`<!--\\s*${EVENT_SCHEMA.replaceAll('.', '\\.')}\\s*\\n([\\s\\S]*?)\\n-->`, 'u'));
  const fence = trimmed.match(/```(?:json)?\s*\n([\s\S]*?)\n```/u);
  if (html) source = html[1];
  else if (fence && fence[1].includes(EVENT_SCHEMA)) source = fence[1];
  else if (trimmed.startsWith('{')) source = trimmed;
  if (source === null) return { eventLike, event: null };
  try {
    const parsed = JSON.parse(source);
    if (parsed?.schema !== EVENT_SCHEMA) return { eventLike, event: null };
    return { eventLike: true, event: parsed };
  } catch (cause) {
    if (!eventLike) return { eventLike: false, event: null };
    throw error(`event comment JSON is invalid: ${cause.message}`);
  }
}

function commentOrder(comment, writerLogin) {
  const rawId = comment?.id;
  const idText = typeof rawId === 'number' && Number.isSafeInteger(rawId)
    ? String(rawId)
    : typeof rawId === 'string' && /^[1-9][0-9]*$/u.test(rawId) ? rawId : null;
  const createdAt = comment?.createdAt ?? comment?.created_at;
  const updatedAt = comment?.updatedAt ?? comment?.updated_at;
  const authorLogin = comment?.authorLogin ?? comment?.user?.login;
  if (!idText || typeof createdAt !== 'string' || !SERVER_ISO.test(createdAt)
    || !Number.isFinite(Date.parse(createdAt))) {
    throw error('event comment requires numeric id and UTC createdAt', 'development_ticket_comment_invalid');
  }
  if (authorLogin !== writerLogin) {
    throw error('event comment author is not the pinned bridge writer', 'development_ticket_comment_author_invalid');
  }
  if (typeof updatedAt !== 'string' || updatedAt !== createdAt) {
    throw error('event comment was edited or lacks immutable timestamps', 'development_ticket_comment_edited');
  }
  return { comment, idText, numericId: BigInt(idText), createdAt };
}

function conflict(commentId, code, message) {
  return { commentId, code, message };
}

export function reduceDevelopmentTicketEvents(comments, { ticketId = null, writerLogin } = {}) {
  if (!Array.isArray(comments)) throw error('comments must be an array');
  if (ticketId !== null && !TICKET_ID.test(ticketId)) throw error('ticketId must identify a meta-repo Issue');
  if (typeof writerLogin !== 'string' || !GITHUB_LOGIN.test(writerLogin)) {
    throw error('writerLogin must pin the GitHub bridge author');
  }
  const sortable = [];
  const integrityConflicts = [];
  let ignoredComments = 0;
  for (const comment of comments) {
    const eventLike = typeof comment?.body === 'string' && comment.body.includes(EVENT_SCHEMA);
    try {
      sortable.push(commentOrder(comment, writerLogin));
    } catch (cause) {
      if (eventLike) integrityConflicts.push(conflict(String(comment?.id ?? '<unknown>'), cause.code, cause.message));
      else ignoredComments += 1;
    }
  }
  sortable.sort((left, right) => {
    const time = Date.parse(left.createdAt) - Date.parse(right.createdAt);
    if (time !== 0) return time;
    return left.numericId < right.numericId ? -1 : left.numericId > right.numericId ? 1 : 0;
  });

  const accepted = [];
  const mutations = new Map();
  const replays = [];
  let resolvedTicketId = ticketId;
  for (const item of sortable) {
    let parsed;
    try {
      parsed = parseEventBody(item.comment.body);
    } catch (cause) {
      integrityConflicts.push(conflict(item.idText, cause.code, cause.message));
      continue;
    }
    if (!parsed.eventLike) {
      ignoredComments += 1;
      continue;
    }
    if (!parsed.event) {
      integrityConflicts.push(conflict(item.idText, 'development_ticket_event_invalid', 'event marker has no event payload'));
      continue;
    }
    let event;
    try {
      event = validateDevelopmentTicketEvent(parsed.event);
    } catch (cause) {
      integrityConflicts.push(conflict(item.idText, cause.code, cause.message));
      continue;
    }
    if (resolvedTicketId === null) resolvedTicketId = event.ticketId;
    if (event.ticketId !== resolvedTicketId) {
      integrityConflicts.push(conflict(item.idText, 'development_ticket_ticket_conflict', 'event belongs to another ticket'));
      continue;
    }
    const seenMutation = mutations.get(event.mutationId);
    if (seenMutation) {
      if (seenMutation.commandHash === event.commandHash) {
        replays.push({
          commentId: item.idText,
          mutationId: event.mutationId,
          eventId: seenMutation.eventId,
        });
      } else {
        integrityConflicts.push(conflict(
          item.idText,
          'development_ticket_mutation_conflict',
          'mutationId is already bound to different command bytes',
        ));
      }
      continue;
    }
    mutations.set(event.mutationId, {
      commandHash: event.commandHash,
      eventId: event.eventId,
    });
    const head = accepted.at(-1)?.event ?? null;
    if (event.previousEventId !== (head?.eventId ?? null)
      || event.previousEventHash !== (head?.eventHash ?? null)
      || event.fromState !== (head?.toState ?? null)) {
      integrityConflicts.push(conflict(
        item.idText,
        'development_ticket_event_stale_or_fork',
        'event expected head differs from the deterministic current head',
      ));
      continue;
    }
    if (event.sequence !== (head?.sequence ?? 0) + 1) {
      integrityConflicts.push(conflict(
        item.idText,
        'development_ticket_event_gap',
        'event sequence contains a gap',
      ));
      continue;
    }
    accepted.push({ commentId: item.idText, event });
  }

  const head = accepted.at(-1)?.event ?? null;
  return {
    schema: PROJECTION_SCHEMA,
    ticketId: resolvedTicketId,
    state: head?.toState ?? null,
    sequence: head?.sequence ?? 0,
    headEventId: head?.eventId ?? null,
    headEventHash: head?.eventHash ?? null,
    safeSummary: head?.safeSummary ?? null,
    candidate: head?.toState === 'READY_TO_PLAY' ? head.candidate : null,
    blocker: head?.toState === 'NEEDS_HELP' ? head.blocker : null,
    nothingPublished: head?.toState === 'NEEDS_HELP' ? head.nothingPublished : null,
    events: accepted.map(({ commentId, event }) => ({ commentId, event })),
    replays,
    integrityConflicts,
    ignoredComments,
  };
}

function usage() {
  return 'usage: development-ticket.mjs validate <ticket.md...> | reduce <comments.json>';
}

export function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  if (command === 'validate') {
    if (args.length === 0) throw error(usage(), 'development_ticket_usage');
    let invalid = false;
    for (const file of args) {
      const markdown = readFileSync(file, 'utf8');
      const result = validateDevelopmentTicketMarkdown(markdown, { file });
      if (result.valid) process.stdout.write(`${file}: valid ${TICKET_SCHEMA}\n`);
      else {
        invalid = true;
        result.errors.forEach((message) => process.stderr.write(`${message}\n`));
      }
    }
    return invalid ? 1 : 0;
  }
  if (command === 'reduce') {
    if (args.length !== 1) throw error(usage(), 'development_ticket_usage');
    const input = JSON.parse(readFileSync(args[0], 'utf8'));
    if (Array.isArray(input)) {
      throw error('reduce input must include comments and writerLogin');
    }
    const comments = input.comments;
    const projection = reduceDevelopmentTicketEvents(comments, {
      ticketId: input.ticketId ?? null,
      writerLogin: input.writerLogin,
    });
    process.stdout.write(`${JSON.stringify(projection, null, 2)}\n`);
    return projection.integrityConflicts.length > 0 ? 1 : 0;
  }
  throw error(usage(), 'development_ticket_usage');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exitCode = main();
  } catch (cause) {
    process.stderr.write(`development-ticket: ${cause.message}\n`);
    process.exitCode = cause.code === 'development_ticket_usage' ? 2 : 1;
  }
}

export const DEVELOPMENT_TICKET_STATES = STATES;
export const DEVELOPMENT_TICKET_TRANSITIONS = TRANSITIONS;
