import { createHash } from 'node:crypto';

export const TICKET_SCHEMA = 'two-mac.bridge-ticket.v1';
export const EVENT_SCHEMA = 'two-mac.bridge-event.v1';
export const MACHINE_BINDING_SCHEMA = 'two-mac.bridge-machine-binding.v1';

export const MACHINES = Object.freeze(['mac-a', 'mac-b']);
export const STATES = Object.freeze([
  'QUEUED',
  'QUEUED:machine_offline',
  'CLAIM_PROPOSED',
  'CLAIMED',
  'IN_PROGRESS',
  'READY_TO_PLAY',
  'NEEDS_HELP',
  'DONE',
]);

const SHA256 = /^[0-9a-f]{64}$/u;
const GIT_SHA = /^[0-9a-f]{40}$/u;
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,255}$/u;
const ERROR_CODE = /^[a-z][a-z0-9_]{2,95}$/u;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;
const EVENT_ID = /^evt_[0-9a-f]{64}$/u;

const TICKET_KEYS = Object.freeze([
  'assignedMachine',
  'authority',
  'createdAt',
  'instruction',
  'issueNumber',
  'mutationId',
  'parentRequestId',
  'repositoryId',
  'requestHash',
  'requestId',
  'schema',
  'sourceCommit',
  'sourceId',
  'sourceKind',
  'sourceRepository',
  'sourceTree',
  'targetTaskDigest',
  'ticketId',
]);

const EVENT_KEYS = Object.freeze([
  'actorMachine',
  'actorTaskDigest',
  'assignedMachine',
  'errorCode',
  'eventDigest',
  'eventId',
  'evidence',
  'idempotencyKey',
  'occurredAt',
  'parentEventDigest',
  'parentEventId',
  'schema',
  'sequence',
  'state',
  'ticketDigest',
]);

const EVIDENCE_KEYS = Object.freeze(['identity', 'kind', 'sha256', 'url']);
const MACHINE_BINDING_KEYS = Object.freeze([
  'bindingDigest',
  'bridgeCommit',
  'controlIssue',
  'machine',
  'registeredAt',
  'repositoryId',
  'schema',
  'taskDigest',
]);

const TRANSITIONS = new Map([
  ['QUEUED', new Set(['QUEUED:machine_offline', 'CLAIM_PROPOSED', 'NEEDS_HELP'])],
  ['QUEUED:machine_offline', new Set(['CLAIM_PROPOSED', 'NEEDS_HELP'])],
  ['CLAIM_PROPOSED', new Set(['CLAIMED', 'NEEDS_HELP'])],
  ['CLAIMED', new Set(['IN_PROGRESS', 'NEEDS_HELP'])],
  ['IN_PROGRESS', new Set(['READY_TO_PLAY', 'NEEDS_HELP'])],
  ['READY_TO_PLAY', new Set(['DONE'])],
  ['NEEDS_HELP', new Set(['DONE'])],
  ['DONE', new Set()],
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

function digestObject(value, omitted = new Set()) {
  return sha256(canonicalJson(Object.fromEntries(
    Object.entries(value).filter(([key]) => !omitted.has(key)),
  )));
}

function canonicalInstant(value, label) {
  if (typeof value !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value)
      || Number.isNaN(Date.parse(value))) {
    throw new Error(`${label} must be canonical UTC milliseconds`);
  }
}

function nullableId(value, label) {
  if (value !== null && (typeof value !== 'string' || !SAFE_ID.test(value))) {
    throw new Error(`${label} is invalid`);
  }
}

function nullableGitSha(value, label) {
  if (value !== null && (typeof value !== 'string' || !GIT_SHA.test(value))) {
    throw new Error(`${label} must be null or a full lowercase Git SHA`);
  }
}

function authorityFor(machine) {
  return machine === 'mac-a' ? 'product-control-plane' : 'content-factory';
}

export function validateTicket(ticket) {
  exactKeys(ticket, TICKET_KEYS, 'ticket');
  if (ticket.schema !== TICKET_SCHEMA) throw new Error('ticket schema is invalid');
  if (!SAFE_ID.test(String(ticket.ticketId || ''))) throw new Error('ticketId is invalid');
  if (!Number.isSafeInteger(ticket.issueNumber) || ticket.issueNumber < 1) {
    throw new Error('issueNumber must be a positive strict integer');
  }
  if (typeof ticket.repositoryId !== 'string' || !/^[1-9][0-9]{0,31}$/u.test(ticket.repositoryId)) {
    throw new Error('repositoryId must be a decimal identifier string');
  }
  if (!['platform', 'mechanic', 'labs'].includes(ticket.sourceKind)) {
    throw new Error('sourceKind is invalid');
  }
  if (!SAFE_ID.test(String(ticket.requestId || ''))) throw new Error('requestId is invalid');
  if (!SHA256.test(String(ticket.requestHash || ''))) throw new Error('requestHash is invalid');
  nullableId(ticket.mutationId, 'mutationId');
  nullableId(ticket.parentRequestId, 'parentRequestId');
  nullableId(ticket.sourceId, 'sourceId');
  if (!REPOSITORY.test(String(ticket.sourceRepository || ''))) {
    throw new Error('sourceRepository is invalid');
  }
  nullableGitSha(ticket.sourceCommit, 'sourceCommit');
  nullableGitSha(ticket.sourceTree, 'sourceTree');
  if (!MACHINES.includes(ticket.assignedMachine)) throw new Error('assignedMachine is invalid');
  if (ticket.authority !== authorityFor(ticket.assignedMachine)) {
    throw new Error('ticket authority does not match assignedMachine');
  }
  if (!SHA256.test(String(ticket.targetTaskDigest || ''))) {
    throw new Error('targetTaskDigest is invalid');
  }
  if (typeof ticket.instruction !== 'string'
      || ticket.instruction.length < 1
      || Buffer.byteLength(ticket.instruction, 'utf8') > 16_384
      || /[\0\r]/u.test(ticket.instruction)) {
    throw new Error('instruction is invalid');
  }
  canonicalInstant(ticket.createdAt, 'createdAt');
  return ticket;
}

export function ticketDigest(ticket) {
  validateTicket(ticket);
  return digestObject(ticket);
}

function expectedMachineBindingDigest(binding) {
  return digestObject(binding, new Set(['bindingDigest']));
}

export function validateMachineBinding(binding) {
  exactKeys(binding, MACHINE_BINDING_KEYS, 'machine binding');
  if (binding.schema !== MACHINE_BINDING_SCHEMA) throw new Error('machine binding schema is invalid');
  if (!Number.isSafeInteger(binding.controlIssue) || binding.controlIssue < 1) {
    throw new Error('machine binding controlIssue must be a positive strict integer');
  }
  if (typeof binding.repositoryId !== 'string' || !/^[1-9][0-9]{0,31}$/u.test(binding.repositoryId)) {
    throw new Error('machine binding repositoryId is invalid');
  }
  if (!MACHINES.includes(binding.machine)) throw new Error('machine binding machine is invalid');
  if (!SHA256.test(String(binding.taskDigest || ''))) throw new Error('machine binding taskDigest is invalid');
  if (!GIT_SHA.test(String(binding.bridgeCommit || ''))) throw new Error('machine binding bridgeCommit is invalid');
  canonicalInstant(binding.registeredAt, 'registeredAt');
  if (!SHA256.test(String(binding.bindingDigest || ''))
      || binding.bindingDigest !== expectedMachineBindingDigest(binding)) {
    throw new Error('machine binding digest does not match binding bytes');
  }
  return binding;
}

export function createMachineBinding({
  controlIssue,
  repositoryId,
  machine,
  taskDigest,
  bridgeCommit,
  registeredAt,
}) {
  const binding = {
    schema: MACHINE_BINDING_SCHEMA,
    controlIssue,
    repositoryId,
    machine,
    taskDigest,
    bridgeCommit,
    registeredAt,
    bindingDigest: '',
  };
  binding.bindingDigest = expectedMachineBindingDigest(binding);
  return validateMachineBinding(binding);
}

function validateEvidence(evidence) {
  if (!Array.isArray(evidence) || evidence.length > 16) {
    throw new Error('evidence must be an array with at most 16 entries');
  }
  for (const [index, item] of evidence.entries()) {
    exactKeys(item, EVIDENCE_KEYS, `evidence[${index}]`);
    if (!SAFE_ID.test(String(item.kind || ''))) throw new Error(`evidence[${index}].kind is invalid`);
    if (typeof item.identity !== 'string'
        || item.identity.length < 1
        || Buffer.byteLength(item.identity, 'utf8') > 2_048
        || /[\0\r\n]/u.test(item.identity)) {
      throw new Error(`evidence[${index}].identity is invalid`);
    }
    if (item.url !== null) {
      let parsed;
      try {
        parsed = new URL(item.url);
      } catch {
        throw new Error(`evidence[${index}].url is invalid`);
      }
      if (!['http:', 'https:'].includes(parsed.protocol) || item.url.length > 2_048) {
        throw new Error(`evidence[${index}].url is invalid`);
      }
    }
    if (item.sha256 !== null && !SHA256.test(String(item.sha256))) {
      throw new Error(`evidence[${index}].sha256 is invalid`);
    }
  }
}

function expectedEventDigest(event) {
  return digestObject(event, new Set(['eventDigest']));
}

export function validateEvent(event, ticket) {
  exactKeys(event, EVENT_KEYS, 'event');
  if (event.schema !== EVENT_SCHEMA) throw new Error('event schema is invalid');
  if (!EVENT_ID.test(String(event.eventId || ''))) throw new Error('eventId is invalid');
  if (!SHA256.test(String(event.eventDigest || ''))) throw new Error('eventDigest is invalid');
  if (event.eventDigest !== expectedEventDigest(event)) throw new Error('eventDigest does not match event bytes');
  if (!SHA256.test(String(event.ticketDigest || ''))) throw new Error('event ticketDigest is invalid');
  if (!Number.isSafeInteger(event.sequence) || event.sequence < 0) {
    throw new Error('event sequence must be a non-negative strict integer');
  }
  if (event.parentEventId !== null && !EVENT_ID.test(String(event.parentEventId))) {
    throw new Error('parentEventId is invalid');
  }
  if (event.parentEventDigest !== null && !SHA256.test(String(event.parentEventDigest))) {
    throw new Error('parentEventDigest is invalid');
  }
  if (!STATES.includes(event.state)) throw new Error('event state is invalid');
  if (!MACHINES.includes(event.assignedMachine)) throw new Error('event assignedMachine is invalid');
  if (!MACHINES.includes(event.actorMachine)) throw new Error('event actorMachine is invalid');
  if (!SHA256.test(String(event.actorTaskDigest || ''))) throw new Error('actorTaskDigest is invalid');
  if (!SAFE_ID.test(String(event.idempotencyKey || ''))) throw new Error('idempotencyKey is invalid');
  canonicalInstant(event.occurredAt, 'occurredAt');
  validateEvidence(event.evidence);
  if (event.errorCode !== null && !ERROR_CODE.test(String(event.errorCode))) {
    throw new Error('errorCode is invalid');
  }

  if (ticket) {
    validateTicket(ticket);
    if (event.ticketDigest !== ticketDigest(ticket)) throw new Error('event belongs to another ticket');
    if (event.assignedMachine !== ticket.assignedMachine) throw new Error('event route differs from ticket route');
    if (['CLAIM_PROPOSED', 'CLAIMED', 'IN_PROGRESS', 'READY_TO_PLAY'].includes(event.state)
        && (event.actorMachine !== ticket.assignedMachine
          || event.actorTaskDigest !== ticket.targetTaskDigest)) {
      throw new Error('assigned execution event has the wrong machine or task binding');
    }
    if (event.state === 'NEEDS_HELP'
        && !['task_missing', 'machine_offline'].includes(event.errorCode)
        && (event.actorMachine !== ticket.assignedMachine
          || event.actorTaskDigest !== ticket.targetTaskDigest)) {
      throw new Error('execution NEEDS_HELP has the wrong machine or task binding');
    }
  }
  if (event.state === 'READY_TO_PLAY' && event.errorCode !== null) {
    throw new Error('READY_TO_PLAY cannot carry an errorCode');
  }
  if (event.state === 'NEEDS_HELP' && event.errorCode === null) {
    throw new Error('NEEDS_HELP requires an errorCode');
  }
  if (!['NEEDS_HELP', 'QUEUED:machine_offline'].includes(event.state)
      && event.errorCode !== null) {
    throw new Error(`${event.state} cannot carry an errorCode`);
  }
  return event;
}

export function createEvent({
  ticket,
  previous = null,
  state,
  actorMachine,
  actorTaskDigest,
  idempotencyKey,
  occurredAt,
  evidence = [],
  errorCode = null,
}) {
  validateTicket(ticket);
  if (previous) validateEvent(previous, ticket);
  const sequence = previous ? previous.sequence + 1 : 0;
  const parentEventId = previous?.eventId ?? null;
  const parentEventDigest = previous?.eventDigest ?? null;
  const eventId = `evt_${sha256(`${ticketDigest(ticket)}\0${idempotencyKey}`)}`;
  const event = {
    schema: EVENT_SCHEMA,
    eventId,
    eventDigest: '',
    ticketDigest: ticketDigest(ticket),
    sequence,
    parentEventId,
    parentEventDigest,
    state,
    assignedMachine: ticket.assignedMachine,
    actorMachine,
    actorTaskDigest,
    idempotencyKey,
    occurredAt,
    evidence,
    errorCode,
  };
  event.eventDigest = expectedEventDigest(event);
  validateEvent(event, ticket);
  return event;
}

function validateTransition(previous, event, ticket) {
  if (event.sequence === 0) {
    if (previous !== null || event.state !== 'QUEUED'
        || event.parentEventId !== null || event.parentEventDigest !== null) {
      throw new Error('journal must start with one parentless QUEUED event');
    }
    return;
  }
  if (!previous) throw new Error('journal sequence has a gap');
  if (event.parentEventId !== previous.eventId
      || event.parentEventDigest !== previous.eventDigest) {
    throw new Error('stale or forked event parent');
  }
  if (!TRANSITIONS.get(previous.state)?.has(event.state)) {
    throw new Error(`invalid transition ${previous.state} -> ${event.state}`);
  }
  if (event.state === 'QUEUED:machine_offline' && event.errorCode !== 'machine_offline') {
    throw new Error('machine_offline projection requires matching errorCode');
  }
  if (event.state === 'CLAIM_PROPOSED' || event.state === 'CLAIMED') {
    if (event.actorMachine !== ticket.assignedMachine
        || event.actorTaskDigest !== ticket.targetTaskDigest) {
      throw new Error('claim does not belong to the assigned task');
    }
  }
}

export function projectJournal(ticket, inputEvents) {
  validateTicket(ticket);
  if (!Array.isArray(inputEvents)) throw new Error('events must be an array');

  const byEventId = new Map();
  const byIdempotencyKey = new Map();
  for (const raw of inputEvents) {
    const event = validateEvent(raw, ticket);
    const sameKey = byIdempotencyKey.get(event.idempotencyKey);
    if (sameKey && sameKey.eventDigest !== event.eventDigest) {
      throw new Error(`idempotency conflict for ${event.idempotencyKey}`);
    }
    const sameId = byEventId.get(event.eventId);
    if (sameId && sameId.eventDigest !== event.eventDigest) {
      throw new Error(`eventId collision for ${event.eventId}`);
    }
    byEventId.set(event.eventId, event);
    byIdempotencyKey.set(event.idempotencyKey, event);
  }

  const unique = [...byEventId.values()].sort(
    (left, right) => left.sequence - right.sequence || left.eventId.localeCompare(right.eventId),
  );
  const bySequence = new Map();
  for (const event of unique) {
    if (bySequence.has(event.sequence)) {
      throw new Error(`forked journal at sequence ${event.sequence}`);
    }
    bySequence.set(event.sequence, event);
  }

  let previous = null;
  for (let sequence = 0; sequence < unique.length; sequence += 1) {
    const event = bySequence.get(sequence);
    if (!event) throw new Error(`journal sequence gap at ${sequence}`);
    validateTransition(previous, event, ticket);
    previous = event;
  }

  return {
    schema: 'two-mac.bridge-projection.v1',
    ticketDigest: ticketDigest(ticket),
    eventCount: unique.length,
    state: previous?.state ?? null,
    lastEventId: previous?.eventId ?? null,
    lastEventDigest: previous?.eventDigest ?? null,
    executable: previous?.state === 'CLAIMED'
      && previous.actorMachine === ticket.assignedMachine
      && previous.actorTaskDigest === ticket.targetTaskDigest,
    terminal: ['READY_TO_PLAY', 'NEEDS_HELP', 'DONE'].includes(previous?.state),
    events: unique,
  };
}

function encodeMarker(kind, payload) {
  const encoded = Buffer.from(canonicalJson(payload), 'utf8').toString('base64url');
  return `<!-- two-mac-bridge-${kind}:v1 payload=${encoded} -->`;
}

function decodeMarkers(body, kind) {
  const prefix = `two-mac-bridge-${kind}:v1`;
  if (typeof body !== 'string') throw new Error('comment body must be a string');
  const markerLike = body.match(new RegExp(`<!--\\s*${prefix}[^>]*-->`, 'gu')) || [];
  const exact = new RegExp(`^<!-- ${prefix} payload=([A-Za-z0-9_-]+) -->$`, 'u');
  return markerLike.map((marker) => {
    const match = marker.match(exact);
    if (!match) throw new Error(`malformed ${kind} marker`);
    let parsed;
    try {
      parsed = JSON.parse(Buffer.from(match[1], 'base64url').toString('utf8'));
    } catch {
      throw new Error(`invalid ${kind} marker payload`);
    }
    return parsed;
  });
}

export function encodeTicketMarker(ticket) {
  validateTicket(ticket);
  return encodeMarker('ticket', ticket);
}

export function encodeEventMarker(event, ticket = null) {
  validateEvent(event, ticket);
  return encodeMarker('event', event);
}

export function encodeMachineBindingMarker(binding) {
  validateMachineBinding(binding);
  return encodeMarker('machine-binding', binding);
}

export function decodeTicketMarkers(body) {
  return decodeMarkers(body, 'ticket').map(validateTicket);
}

export function decodeEventMarkers(body, ticket = null) {
  return decodeMarkers(body, 'event').map((event) => validateEvent(event, ticket));
}

export function decodeMachineBindingMarkers(body) {
  return decodeMarkers(body, 'machine-binding').map(validateMachineBinding);
}

export function projectMachineBindings(controlIssueNumber, bodies) {
  if (!Number.isSafeInteger(controlIssueNumber) || controlIssueNumber < 1) {
    throw new Error('controlIssueNumber must be a positive strict integer');
  }
  if (!Array.isArray(bodies)) throw new Error('machine binding bodies must be an array');
  const all = bodies.flatMap(decodeMachineBindingMarkers);
  const result = {};
  for (const binding of all) {
    if (binding.controlIssue !== controlIssueNumber) {
      throw new Error('machine binding belongs to another control Issue');
    }
    const existing = result[binding.machine];
    if (existing && existing.bindingDigest !== binding.bindingDigest) {
      throw new Error(`conflicting ${binding.machine} machine bindings`);
    }
    result[binding.machine] = binding;
  }
  return result;
}
