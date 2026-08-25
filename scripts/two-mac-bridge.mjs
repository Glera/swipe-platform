#!/usr/bin/env node
// One observation/transition pass for the Phase 0 two-Mac Issue bridge.
//
// This is deliberately not a daemon or scheduler. A Codex in-chat heartbeat
// invokes one pass. GitHub Issues are the only durable transport; the raw GitHub
// token and raw Codex task ID are never printed or stored by this script.

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  CONTROL_WAKE_SCHEMA_V2,
  canonicalJson,
  composeControlWakeComment,
  createControlWake,
  createMachineBinding,
  createMachineHold,
  createEvent,
  decodeControlWakeComment,
  decodeEventMarkers,
  encodeMachineBindingMarker,
  encodeMachineHoldMarker,
  decodeTicketMarkers,
  encodeEventMarker,
  encodeTicketMarker,
  projectJournal,
  projectMachineBindingState,
  projectMachineBindings,
  sha256,
  ticketDigest,
} from './two-mac-bridge-contract.mjs';

const DEFAULT_REPO = 'Glera/p4g-workspace-meta';
const SHA256 = /^[0-9a-f]{64}$/u;
const GIT_SHA = /^[0-9a-f]{40}$/u;
const ERROR_CODE = /^[a-z][a-z0-9_]{2,95}$/u;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/u;
const REF = /^[A-Za-z0-9][A-Za-z0-9._/-]{0,239}$/u;
const CONTENT_HEAD_REPOSITORIES = new Set(['Glera/playables', 'Glera/swipe-generator']);
const PRIORITY_ISSUES = new Map([[91, 0], [82, 1]]);
const DEFAULT_CONTROL_ISSUE = 94;
const DEFAULT_GENERATOR_URL = 'http://127.0.0.1:4317/v1/playable-releases';
const OFFLINE_OBSERVATION_MS = 15 * 60 * 1000;

const USAGE = `Usage:
  node scripts/two-mac-bridge.mjs project --issue N [--repo OWNER/REPO]
  node scripts/two-mac-bridge.mjs observe --machine mac-a|mac-b \\
    [--control-issue N] [--repo OWNER/REPO]
  node scripts/two-mac-bridge.mjs scan-wakes --machine mac-a|mac-b \\
    --after-comment-id ID --after-wake-id ID [--control-issue N]
  node scripts/two-mac-bridge.mjs publish-wake --machine mac-a|mac-b \\
    --next-owner mac-a|mac-b --parent-comment-id ID \\
    --verdict HANDOFF_READY|NEEDS_HELP|AUTHORITY_REQUIRED|DONE|STOP \\
    --body-file PATH [--control-issue N] [--apply] \\
    [--ticket-issue N --lineage-id lin_HEX \\
     [--predecessor-wake-id wake_HEX] [--supersedes wake_HEX,wake_HEX,...]]
  node scripts/two-mac-bridge.mjs bootstrap --machine mac-a|mac-b \\
    [--control-issue N] [--supersede-binding-digest SHA256] \\
    [--replace-owner-task] [--apply]
  node scripts/two-mac-bridge.mjs bind-platform --issue N --machine mac-a \\
    [--control-issue N] [--apply]
  node scripts/two-mac-bridge.mjs bind-generator --issue N --machine mac-a \\
    --request-id REQUEST_ID [--control-issue N] [--generator-url LOOPBACK_URL] [--apply]
  node scripts/two-mac-bridge.mjs claim --issue N --machine mac-a|mac-b [--apply]
  node scripts/two-mac-bridge.mjs advance --issue N --machine mac-a|mac-b \\
    --state QUEUED:machine_offline|IN_PROGRESS|HANDOFF_READY|READY_TO_PLAY|NEEDS_HELP|DONE \\
    [state evidence] [--apply]

State evidence:
  HANDOFF_READY  --head-repository OWNER/REPO --head-ref BRANCH --head-sha SHA
  READY_TO_PLAY  --head-repository OWNER/REPO --head-ref BRANCH --head-sha SHA \\
                 --candidate-url HTTPS_URL --candidate-sha256 SHA256
  NEEDS_HELP     --error-code CODE
  DONE           --receipt-id ID   (Mac A only)

Wake lineage (publish-wake only): --ticket-issue and --lineage-id are required
together, so a partial lineage is refused instead of guessed. An absent
--predecessor-wake-id is null and an absent --supersedes is empty. Without any
of the four options the published wake stays the exact v1 record.

Mutations are dry-run unless --apply. The local task binding is derived from
CODEX_THREAD_ID and compared to the ticket; it is never accepted as CLI input.
`;

const LINEAGE_OPTION_KEYS = Object.freeze([
  'ticketIssue', 'lineageId', 'predecessorWakeId', 'supersedesWakeIds',
]);

// A lineage option is "absent" only as null: every parsed value (including an
// unparsable --ticket-issue) counts as present so a partial lineage fails
// closed here instead of silently publishing a v1 wake.
function lineageOptionsPresent(options) {
  return LINEAGE_OPTION_KEYS.some((key) => options[key] !== null);
}

// Field validation stays in the contract; this only shapes the declared claim.
function controlWakeLineage(options) {
  if (!lineageOptionsPresent(options)) return null;
  return {
    ticketIssue: options.ticketIssue,
    lineageId: options.lineageId,
    predecessorWakeId: options.predecessorWakeId,
    supersedesWakeIds: options.supersedesWakeIds ?? [],
  };
}

function takeValue(argv, index, option) {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) throw new Error(`${option} requires a value`);
  return value;
}

export function parseArgs(argv) {
  const options = {
    command: null,
    repo: DEFAULT_REPO,
    issue: null,
    machine: null,
    state: null,
    errorCode: null,
    headRepository: null,
    headRef: null,
    headSha: null,
    candidateUrl: null,
    candidateSha256: null,
    receiptId: null,
    controlIssue: DEFAULT_CONTROL_ISSUE,
    requestId: null,
    nextOwner: null,
    parentCommentId: null,
    verdict: null,
    bodyFile: null,
    ticketIssue: null,
    lineageId: null,
    predecessorWakeId: null,
    supersedesWakeIds: null,
    afterCommentId: '0',
    afterWakeId: '0',
    supersedeBindingDigest: null,
    replaceOwnerTask: false,
    generatorUrl: DEFAULT_GENERATOR_URL,
    apply: false,
    help: false,
    lockHeld: false,
  };
  const [command, ...rest] = argv;
  options.command = command ?? null;
  for (let index = 0; index < rest.length; index += 1) {
    const arg = rest[index];
    if (arg === '--repo') {
      options.repo = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--issue') {
      options.issue = Number(takeValue(rest, index, arg)); index += 1;
    } else if (arg === '--machine') {
      options.machine = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--state') {
      options.state = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--error-code') {
      options.errorCode = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--head-repository') {
      options.headRepository = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--head-ref') {
      options.headRef = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--head-sha') {
      options.headSha = takeValue(rest, index, arg).toLowerCase(); index += 1;
    } else if (arg === '--candidate-url') {
      options.candidateUrl = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--candidate-sha256') {
      options.candidateSha256 = takeValue(rest, index, arg).replace(/^sha256:/u, '').toLowerCase(); index += 1;
    } else if (arg === '--receipt-id') {
      options.receiptId = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--control-issue') {
      options.controlIssue = Number(takeValue(rest, index, arg)); index += 1;
    } else if (arg === '--request-id') {
      options.requestId = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--next-owner') {
      options.nextOwner = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--parent-comment-id') {
      options.parentCommentId = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--verdict') {
      options.verdict = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--body-file') {
      options.bodyFile = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--ticket-issue') {
      options.ticketIssue = Number(takeValue(rest, index, arg)); index += 1;
    } else if (arg === '--lineage-id') {
      options.lineageId = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--predecessor-wake-id') {
      options.predecessorWakeId = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--supersedes') {
      options.supersedesWakeIds = takeValue(rest, index, arg).split(','); index += 1;
    } else if (arg === '--after-comment-id') {
      options.afterCommentId = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--after-wake-id') {
      options.afterWakeId = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--supersede-binding-digest') {
      options.supersedeBindingDigest = takeValue(rest, index, arg).toLowerCase(); index += 1;
    } else if (arg === '--replace-owner-task') {
      options.replaceOwnerTask = true;
    } else if (arg === '--generator-url') {
      options.generatorUrl = takeValue(rest, index, arg); index += 1;
    } else if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--lock-held') {
      options.lockHeld = true;
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else {
      throw new Error(`unknown option: ${arg}`);
    }
  }
  if (options.help) return options;
  if (!['project', 'observe', 'scan-wakes', 'publish-wake', 'bootstrap', 'bind-platform', 'bind-generator', 'claim', 'advance'].includes(options.command)) {
    throw new Error('command must be project, observe, scan-wakes, publish-wake, bootstrap, bind-platform, bind-generator, claim, or advance');
  }
  if (!REPOSITORY.test(options.repo)) throw new Error('--repo must be OWNER/REPO');
  if (options.repo !== DEFAULT_REPO) throw new Error(`--repo is allowlisted to ${DEFAULT_REPO}`);
  if (['project', 'bind-platform', 'bind-generator', 'claim', 'advance'].includes(options.command)
      && (!Number.isSafeInteger(options.issue) || options.issue < 1)) {
    throw new Error('--issue must be a positive strict integer');
  }
  if (['observe', 'scan-wakes', 'publish-wake', 'bootstrap', 'bind-platform', 'bind-generator', 'claim', 'advance'].includes(options.command)
      && !['mac-a', 'mac-b'].includes(options.machine)) {
    throw new Error('--machine must be mac-a or mac-b');
  }
  if (['observe', 'scan-wakes', 'publish-wake', 'bootstrap', 'bind-platform', 'bind-generator', 'claim', 'advance'].includes(options.command)
      && (!Number.isSafeInteger(options.controlIssue) || options.controlIssue < 1)) {
    throw new Error('--control-issue must be a positive strict integer');
  }
  if (options.supersedeBindingDigest !== null
      && (options.command !== 'bootstrap' || !SHA256.test(options.supersedeBindingDigest))) {
    throw new Error('--supersede-binding-digest is valid only for bootstrap and must be SHA-256');
  }
  if (options.replaceOwnerTask
      && (options.command !== 'bootstrap' || options.supersedeBindingDigest === null)) {
    throw new Error('--replace-owner-task is valid only for bootstrap with --supersede-binding-digest');
  }
  if (options.command === 'bind-platform' && options.machine !== 'mac-a') {
    throw new Error('bind-platform is a Mac A command');
  }
  if (options.command === 'bind-generator') {
    if (options.machine !== 'mac-a') throw new Error('bind-generator is a Mac A command');
    if (!safeIdentity(options.requestId)) throw new Error('--request-id is invalid');
    validateGeneratorUrl(options.generatorUrl);
  }
  if (options.command === 'scan-wakes') {
    validateCursor(options.afterCommentId, '--after-comment-id');
    validateCursor(options.afterWakeId, '--after-wake-id');
    if (BigInt(options.afterWakeId) > BigInt(options.afterCommentId)) {
      throw new Error('--after-wake-id cannot exceed --after-comment-id');
    }
  }
  if (options.command !== 'publish-wake' && lineageOptionsPresent(options)) {
    throw new Error('lineage options are valid only for publish-wake');
  }
  if (options.command === 'publish-wake') {
    if (!['mac-a', 'mac-b'].includes(options.nextOwner)) {
      throw new Error('--next-owner must be mac-a or mac-b');
    }
    validateCommentId(options.parentCommentId, '--parent-comment-id');
    if (!['HANDOFF_READY', 'NEEDS_HELP', 'AUTHORITY_REQUIRED', 'DONE', 'STOP'].includes(options.verdict)) {
      throw new Error('--verdict is invalid for publish-wake');
    }
    if (typeof options.bodyFile !== 'string' || options.bodyFile.length < 1 || /[\0\r\n]/u.test(options.bodyFile)) {
      throw new Error('--body-file is invalid');
    }
    // A partial lineage is invalid: the missing half is never inferred from the
    // parent comment or the previous wake.
    if (lineageOptionsPresent(options)
        && (options.ticketIssue === null || options.lineageId === null)) {
      throw new Error('--ticket-issue and --lineage-id are required together for a lineage wake');
    }
  }
  if (options.command === 'advance') validateAdvanceOptions(options);
  return options;
}

function validateCommentId(value, label) {
  if (typeof value !== 'string' || !/^[1-9][0-9]{0,31}$/u.test(value)) {
    throw new Error(`${label} must be a positive decimal GitHub comment ID`);
  }
}

function validateCursor(value, label) {
  if (typeof value !== 'string' || !/^(?:0|[1-9][0-9]{0,31})$/u.test(value)) {
    throw new Error(`${label} must be a non-negative decimal GitHub comment ID`);
  }
}

function validateAdvanceOptions(options) {
  if (!['QUEUED:machine_offline', 'IN_PROGRESS', 'HANDOFF_READY', 'READY_TO_PLAY', 'NEEDS_HELP', 'DONE'].includes(options.state)) {
    throw new Error('--state is invalid for advance');
  }
  if (['HANDOFF_READY', 'READY_TO_PLAY'].includes(options.state)) {
    if (!REPOSITORY.test(String(options.headRepository || ''))) throw new Error('--head-repository is required');
    if (!validRef(options.headRef)) throw new Error('--head-ref is invalid');
    if (!GIT_SHA.test(String(options.headSha || ''))) throw new Error('--head-sha must be a full lowercase SHA');
  }
  if (options.state === 'READY_TO_PLAY') {
    let parsed;
    try { parsed = new URL(options.candidateUrl); } catch { throw new Error('--candidate-url is invalid'); }
    if (parsed.protocol !== 'https:') throw new Error('--candidate-url must use HTTPS');
    if (!SHA256.test(String(options.candidateSha256 || ''))) throw new Error('--candidate-sha256 is invalid');
  }
  if (options.state === 'NEEDS_HELP' && !ERROR_CODE.test(String(options.errorCode || ''))) {
    throw new Error('NEEDS_HELP requires --error-code');
  }
  if (options.state === 'QUEUED:machine_offline'
      && (options.machine !== 'mac-a' || options.errorCode !== 'machine_offline')) {
    throw new Error('QUEUED:machine_offline requires Mac A and --error-code machine_offline');
  }
  if (options.state === 'DONE'
      && (options.machine !== 'mac-a' || !safeIdentity(options.receiptId))) {
    throw new Error('DONE requires Mac A and --receipt-id');
  }
  if (!['NEEDS_HELP', 'QUEUED:machine_offline'].includes(options.state)
      && options.errorCode !== null) {
    throw new Error('--error-code is valid only for NEEDS_HELP or machine_offline');
  }
}

function validRef(value) {
  return typeof value === 'string' && REF.test(value)
    && !value.includes('..') && !value.includes('//') && !value.includes('@{')
    && !value.endsWith('/') && !value.endsWith('.') && !value.endsWith('.lock');
}

function safeIdentity(value) {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/@+-]{0,255}$/u.test(value);
}

function validateGeneratorUrl(value) {
  let parsed;
  try { parsed = new URL(value); } catch { throw new Error('--generator-url is invalid'); }
  if (parsed.protocol !== 'http:'
      || !['127.0.0.1', 'localhost'].includes(parsed.hostname)
      || parsed.pathname !== '/v1/playable-releases'
      || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('--generator-url must be the exact loopback playable-releases endpoint');
  }
  return parsed;
}

export function deriveTaskDigest(env) {
  const threadId = env.CODEX_THREAD_ID;
  if (typeof threadId !== 'string' || threadId.length < 8 || threadId.length > 256
      || /[\0\r\n]/u.test(threadId)) {
    throw new Error('CODEX_THREAD_ID is required for this command');
  }
  return sha256(`codex-thread-v1\0${threadId}`);
}

function executeGh(args, cwd = process.cwd()) {
  const result = spawnSync('gh', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'gh failed').trim());
  }
  return result.stdout;
}

function parseJson(value, label) {
  try { return JSON.parse(value); } catch { throw new Error(`${label} returned invalid JSON`); }
}

export function createGitHubTransport({ execute = executeGh, cwd = process.cwd() } = {}) {
  const apiJson = (args, label) => parseJson(execute(['api', ...args], cwd), label);
  return {
    async getRepositoryId(repo) {
      const result = apiJson([`repos/${repo}`], 'reading repository identity');
      const id = String(result.id || '');
      if (!/^[1-9][0-9]{0,31}$/u.test(id)) throw new Error('GitHub repository ID is invalid');
      return id;
    },
    async listOpenIssues(repo) {
      const pages = apiJson([
        '--paginate', `repos/${repo}/issues?state=open&per_page=100`,
        '--slurp',
      ], 'listing Issues');
      const result = Array.isArray(pages) ? pages.flat() : [];
      return result.filter((issue) => !issue.pull_request).map((issue) => ({
        number: issue.number,
        body: issue.body || '',
        htmlUrl: issue.html_url,
        updatedAt: issue.updated_at,
      }));
    },
    async getIssue(repo, issueNumber) {
      const issue = apiJson([`repos/${repo}/issues/${issueNumber}`], 'reading Issue');
      const commentPages = apiJson([
        '--paginate', `repos/${repo}/issues/${issueNumber}/comments?per_page=100`,
        '--slurp',
      ], 'reading Issue comments');
      const comments = Array.isArray(commentPages) ? commentPages.flat() : [];
      return {
        number: issue.number,
        body: issue.body || '',
        htmlUrl: issue.html_url,
        updatedAt: issue.updated_at,
        comments: comments.map((comment) => ({
          id: String(comment.id),
          body: comment.body || '',
          htmlUrl: comment.html_url,
          createdAt: comment.created_at,
        })),
      };
    },
    async searchIssues(repo, needle) {
      if (!safeIdentity(needle)) throw new Error('Issue search identity is invalid');
      const query = encodeURIComponent(`repo:${repo} "${needle}" in:comments type:issue`);
      const pages = apiJson([
        '--paginate', `search/issues?q=${query}&per_page=100`, '--slurp',
      ], 'searching Issues');
      return (Array.isArray(pages) ? pages : []).flatMap((page) => (
        Array.isArray(page?.items) ? page.items : []
      )).map((issue) => ({
        number: issue.number,
        body: issue.body || '',
        htmlUrl: issue.html_url,
        updatedAt: issue.updated_at,
      }));
    },
    async postComment(repo, issueNumber, body) {
      return apiJson([
        '--method', 'POST', `repos/${repo}/issues/${issueNumber}/comments`,
        '-f', `body=${body}`,
      ], 'posting Issue comment');
    },
    async resolveRef(repo, ref) {
      const encoded = ref.split('/').map(encodeURIComponent).join('/');
      const result = apiJson([`repos/${repo}/git/ref/heads/${encoded}`], 'resolving remote ref');
      return String(result?.object?.sha || '').toLowerCase();
    },
  };
}

function machineBindingsFromIssue(issue) {
  return projectMachineBindings(
    issue.number,
    [issue.body, ...(issue.comments || []).map((comment) => comment.body)],
  );
}

function machineBindingStateFromIssue(issue) {
  return projectMachineBindingState(
    issue.number,
    [issue.body, ...(issue.comments || []).map((comment) => comment.body)],
  );
}

function requireActiveTaskBinding({ issue, machine, taskDigest }) {
  const state = machineBindingStateFromIssue(issue);
  const binding = state.active[machine];
  if (!binding || binding.taskDigest !== taskDigest) {
    throw new Error(`exact active ${machine} task binding is required`);
  }
  return { binding, state };
}

function nextStepHeading(line) {
  const normalized = line.trim()
    .replace(/^(?:>\s+)?(?:#{1,6}\s*|[-*+]\s+|[0-9]+[.)]\s+)?/u, '')
    .replace(/\*\*|__/gu, '')
    .trim();
  return normalized.match(
    /^(?:(?:required|exact)\s+)?next\s+step\s*:\s*(.*)$|^следующ(?:ий|его)\s+шаг\s*:\s*(.*)$/iu,
  );
}

function dispatchItemTargetsMachine(item, machine) {
  const letter = machine === 'mac-a' ? 'a' : 'b';
  const machineMention = new RegExp('\\bmac[_ -]?' + letter + '\\b', 'iu');
  const dispatchVerb = /\b(?:consume(?:s|d|ing)?|continue(?:s|d|ing)?|dispatch(?:es|ed|ing)?|execute(?:s|d|ing)?|perform(?:s|ed|ing)?|receive(?:s|d|ing)?|resolve(?:s|d|ing)?|resume(?:s|d|ing)?|review(?:s|ed|ing)?|run(?:s|ning)?|take(?:s|n|ing)?)\b|(?:выполн|продолж|провер|получ|подхват|возобнов)/iu;
  const negation = /\b(?:do|must|should)\s+not\b|\bnever\b|(?:^|\s)не(?:\s|$)/iu;
  return item.split(/(?:[.;]\s+|[—–]\s*)/u).some((clause) => {
    if (!machineMention.test(clause)) return false;
    const action = dispatchVerb.exec(clause);
    if (!action) return false;
    return !negation.test(clause.slice(0, action.index));
  });
}

function nextStepTargetsMachine(lines, machine) {
  for (let index = 0; index < lines.length; index += 1) {
    const heading = nextStepHeading(lines[index]);
    if (!heading) continue;
    const items = [];
    let current = String(heading[1] ?? heading[2] ?? '').trim();
    for (let offset = 1; offset < 12 && index + offset < lines.length; offset += 1) {
      const line = lines[index + offset].trim();
      if (!line) {
        if (current) items.push(current);
        current = '';
        break;
      }
      if (/^(?:#{1,6}\s+|\*\*[^*]+\*\*\s*:?)$/u.test(line)) break;
      const bullet = line.match(/^(?:[-*+]\s+|[0-9]+[.)]\s+)(.*)$/u);
      if (bullet) {
        if (current) items.push(current);
        current = bullet[1].trim();
      } else {
        current = current ? current + ' ' + line : line;
      }
    }
    if (current) items.push(current);
    if (items.some((item) => dispatchItemTargetsMachine(item, machine))) return true;
  }
  return false;
}

function targetedWakeProse(body, machine) {
  if (typeof body !== 'string') return false;
  const letter = machine === 'mac-a' ? 'a' : 'b';
  const machineToken = `mac[_ -]?${letter}`;
  const targeted = new RegExp(
    `(?:${machineToken}).{0,48}(?:wake|next\\s*owner)`
      + `|(?:wake|next\\s*owner).{0,48}(?:${machineToken})`,
    'iu',
  );
  const lines = body.split(/\n/u);
  return lines.some((line) => targeted.test(line)) || nextStepTargetsMachine(lines, machine);
}

function numericCommentId(comment) {
  const value = String(comment?.id ?? '');
  validateCommentId(value, 'comment.id');
  return value;
}

// Causal lineage state for one control Issue, accumulated in one forward pass
// over ascending comment ids. A wake is classified against evidence that is
// strictly earlier than itself, so the same comment list always yields the same
// classification and no wake can silence itself with its own claim.
function lineageKey(wake) {
  return `${wake.ticketIssue}\0${wake.lineageId}`;
}

function createLineageIndex() {
  return {
    byWakeId: new Map(),
    supersededByLineage: new Map(),
    supersedeClaimLineages: new Map(),
  };
}

function observeLineage(lineage, wake) {
  if (!lineage.byWakeId.has(wake.wakeId)) lineage.byWakeId.set(wake.wakeId, wake);
  if (wake.schema !== CONTROL_WAKE_SCHEMA_V2) return;
  const key = lineageKey(wake);
  const superseded = lineage.supersededByLineage.get(key) ?? new Set();
  for (const supersededWakeId of wake.supersedesWakeIds) {
    // Supersession claims are declarative and never recursive.
    superseded.add(supersededWakeId);
    const claimants = lineage.supersedeClaimLineages.get(supersededWakeId) ?? new Set();
    claimants.add(key);
    lineage.supersedeClaimLineages.set(supersededWakeId, claimants);
  }
  lineage.supersededByLineage.set(key, superseded);
}

export function classifyControlWake(wake, lineage) {
  // A v1 wake carries no causal claim: it is classified exactly as before v2,
  // and an absent supersession record is never a guessed noop.
  if (wake.schema !== CONTROL_WAKE_SCHEMA_V2) return 'normal';
  const key = lineageKey(wake);
  const predecessor = wake.predecessorWakeId;
  if (predecessor !== null) {
    const known = lineage.byWakeId.get(predecessor);
    if (known && known.schema === CONTROL_WAKE_SCHEMA_V2 && lineageKey(known) !== key) {
      return 'ambiguous';
    }
    const claimants = lineage.supersedeClaimLineages.get(predecessor);
    if (claimants && [...claimants].some((claimant) => claimant !== key)) return 'ambiguous';
  }
  // Exactly one thing is ever silenced: a STOP whose OWN named predecessor
  // branch was explicitly superseded by a strictly earlier wake of the same
  // lineage. The forward pass guarantees that set holds only earlier claims, so
  // the proof is always about this branch and never about the lineage around it.
  // A verdict that once looked terminal does not close a lineage: work can
  // continue and mint a fresh dispatch, whose own STOP terminal is live. Every
  // non-STOP verdict is execution evidence and is always delivered.
  if (wake.verdict !== 'STOP' || predecessor === null) return 'normal';
  return lineage.supersededByLineage.get(key)?.has(predecessor)
    ? 'historical_noop'
    : 'normal';
}

export function scanControlWakeComments({
  controlIssue,
  comments,
  machine,
  taskDigest,
  acceptedTaskDigests = [taskDigest],
  callbackTaskDigest = null,
  acceptedCallbackTaskDigests = [callbackTaskDigest],
  lastScannedCommentId = '0',
  lastConsumedWakeCommentId = '0',
}) {
  if (!Number.isSafeInteger(controlIssue) || controlIssue < 1) {
    throw new Error('controlIssue must be a positive strict integer');
  }
  if (!Array.isArray(comments)) throw new Error('control wake comments must be an array');
  if (!['mac-a', 'mac-b'].includes(machine) || !SHA256.test(String(taskDigest || ''))) {
    throw new Error('control wake scanner identity is invalid');
  }
  if (!Array.isArray(acceptedTaskDigests)
      || acceptedTaskDigests.length < 1
      || acceptedTaskDigests.length > 2
      || acceptedTaskDigests[0] !== taskDigest
      || new Set(acceptedTaskDigests).size !== acceptedTaskDigests.length
      || acceptedTaskDigests.some((value) => !SHA256.test(String(value || '')))) {
    throw new Error('control wake scanner accepted task identities are invalid');
  }
  if (machine === 'mac-b' && !SHA256.test(String(callbackTaskDigest || ''))) {
    throw new Error('Mac B control wake scanner callback binding is invalid');
  }
  if (machine === 'mac-a' && callbackTaskDigest !== null) {
    throw new Error('Mac A control wake scanner callback binding must be null');
  }
  if (!Array.isArray(acceptedCallbackTaskDigests)
      || acceptedCallbackTaskDigests.length < 1
      || acceptedCallbackTaskDigests.length > 2
      || acceptedCallbackTaskDigests[0] !== callbackTaskDigest
      || new Set(acceptedCallbackTaskDigests).size !== acceptedCallbackTaskDigests.length
      || acceptedCallbackTaskDigests.some((value) => (
        machine === 'mac-a' ? value !== null : !SHA256.test(String(value || ''))
      ))) {
    throw new Error('control wake scanner accepted callback identities are invalid');
  }
  const acceptedTargets = new Set(acceptedTaskDigests);
  const acceptedCallbacks = new Set(acceptedCallbackTaskDigests);
  validateCursor(lastScannedCommentId, 'lastScannedCommentId');
  validateCursor(lastConsumedWakeCommentId, 'lastConsumedWakeCommentId');
  if (BigInt(lastConsumedWakeCommentId) > BigInt(lastScannedCommentId)) {
    throw new Error('lastConsumedWakeCommentId cannot exceed lastScannedCommentId');
  }

  const ordered = comments.map((comment) => ({
    ...comment,
    id: numericCommentId(comment),
  })).sort((left, right) => (BigInt(left.id) < BigInt(right.id) ? -1 : 1));
  const byId = new Map(ordered.map((comment) => [comment.id, comment]));
  const observedThroughCommentId = ordered.reduce(
    (maximum, comment) => (BigInt(comment.id) > BigInt(maximum) ? comment.id : maximum),
    '0',
  );
  if (BigInt(lastScannedCommentId) > BigInt(observedThroughCommentId)
      || BigInt(lastConsumedWakeCommentId) > BigInt(observedThroughCommentId)) {
    throw new Error('control wake cursor exceeds the append-only comment high-water mark');
  }

  const attention = [];
  const pending = [];
  const historicalNoopCommentIds = [];
  const seenWakeIds = new Set();
  const lineage = createLineageIndex();
  for (const comment of ordered) {
    const body = String(comment.body || '');
    const isNew = BigInt(comment.id) > BigInt(lastScannedCommentId);
    const afterConsumed = BigInt(comment.id) > BigInt(lastConsumedWakeCommentId);
    const markerLike = body.includes('two-mac-bridge-control-wake:v1');
    if (!markerLike) {
      if (isNew && targetedWakeProse(body, machine)) {
        attention.push({
          action: 'NEEDS_HELP',
          code: 'malformed_targeted_wake',
          commentId: comment.id,
          commentUrl: comment.htmlUrl ?? null,
        });
      }
      continue;
    }

    let decoded;
    try {
      decoded = decodeControlWakeComment(body);
      if (decoded.wake.controlIssue !== controlIssue) {
        throw new Error('control wake belongs to another control Issue');
      }
      const parent = byId.get(decoded.wake.parentCommentId);
      if (!parent || BigInt(decoded.wake.parentCommentId) >= BigInt(comment.id)) {
        throw new Error('control wake parent comment is missing or not earlier');
      }
    } catch {
      if (isNew) {
        attention.push({
          action: 'NEEDS_HELP',
          code: 'malformed_targeted_wake',
          commentId: comment.id,
          commentUrl: comment.htmlUrl ?? null,
        });
      }
      continue;
    }

    const { wake, receiptBody } = decoded;
    // Classify against strictly earlier evidence, then record this wake's own
    // claim for the wakes that follow it. Lineage evidence is collected for
    // every decoded wake in the Issue, including wakes routed to the other
    // machine and wakes behind the cursor.
    const classification = classifyControlWake(wake, lineage);
    observeLineage(lineage, wake);
    if (wake.assignedMachine !== machine) continue;
    if (!acceptedTargets.has(wake.targetTaskDigest)) {
      if (afterConsumed) {
        attention.push({
          action: 'STOP',
          code: 'target_task_binding_mismatch',
          commentId: comment.id,
          commentUrl: comment.htmlUrl ?? null,
          wakeId: wake.wakeId,
        });
      }
      continue;
    }
    if (!acceptedCallbacks.has(wake.callbackTaskDigest)) {
      if (afterConsumed) {
        attention.push({
          action: 'STOP',
          code: 'callback_task_binding_mismatch',
          commentId: comment.id,
          commentUrl: comment.htmlUrl ?? null,
          wakeId: wake.wakeId,
        });
      }
      continue;
    }
    const alreadySeen = seenWakeIds.has(wake.wakeId);
    seenWakeIds.add(wake.wakeId);
    if (!afterConsumed || alreadySeen) continue;
    if (classification === 'historical_noop') {
      // Deterministically acknowledged: never dispatched, never attention, and
      // never an input a successor wake can be minted from.
      historicalNoopCommentIds.push(comment.id);
      continue;
    }
    if (classification === 'ambiguous') {
      attention.push({
        action: 'NEEDS_HELP',
        code: 'ambiguous_wake_lineage',
        commentId: comment.id,
        commentUrl: comment.htmlUrl ?? null,
        wakeId: wake.wakeId,
      });
    }
    const action = wake.verdict === 'STOP'
      ? 'STOP'
      : wake.verdict === 'AUTHORITY_REQUIRED'
        ? 'AUTHORITY_REQUIRED'
        : 'DISPATCH';
    pending.push({
      action,
      classification,
      commentId: comment.id,
      commentUrl: comment.htmlUrl ?? null,
      receiptBody,
      wake,
    });
  }

  const nextWake = pending.at(0) ?? null;
  return {
    schema: 'two-mac.control-wake-observation.v1',
    machine,
    cursors: {
      lastScannedCommentId: observedThroughCommentId,
      // A historical noop must not block the consumed cursor: with no actionable
      // wake left, acknowledging through the last noop is safe and terminates.
      lastConsumedWakeCommentId,
      acknowledgeAfterHandlingCommentId:
        nextWake?.commentId ?? historicalNoopCommentIds.at(-1) ?? null,
    },
    attention,
    historicalNoopCommentIds,
    nextWake,
    pendingWakeCount: pending.length,
  };
}

export async function scanControlIssueWakes({
  transport,
  repo,
  controlIssue,
  machine,
  lastScannedCommentId,
  lastConsumedWakeCommentId,
}) {
  const issue = await transport.getIssue(repo, controlIssue);
  const state = machineBindingStateFromIssue(issue);
  const target = state.active[machine];
  if (!target) throw new Error(`exact active ${machine} target binding is required`);
  return scanControlWakeComments({
    controlIssue,
    comments: issue.comments,
    machine,
    taskDigest: target.taskDigest,
    callbackTaskDigest: machine === 'mac-b' ? state.active['mac-a']?.taskDigest ?? null : null,
    lastScannedCommentId,
    lastConsumedWakeCommentId,
  });
}

export async function publishControlWake({
  transport,
  repo,
  controlIssue,
  actorMachine,
  actorTaskDigest,
  nextOwner,
  parentCommentId,
  verdict,
  receiptBody,
  bridgeCommit,
  apply,
  lineage = null,
  clock = () => new Date(),
}) {
  const [issue, repositoryId] = await Promise.all([
    transport.getIssue(repo, controlIssue),
    transport.getRepositoryId(repo),
  ]);
  const { binding, state } = requireActiveTaskBinding({
    issue, machine: actorMachine, taskDigest: actorTaskDigest,
  });
  if (binding.bridgeCommit !== bridgeCommit || binding.repositoryId !== repositoryId) {
    throw new Error(`exact active ${actorMachine} machine binding is required`);
  }
  const target = state.active[nextOwner];
  if (!target) throw new Error(`exact active ${nextOwner} target binding is required`);
  const callbackTaskDigest = nextOwner === 'mac-b'
    ? state.active['mac-a']?.taskDigest ?? null
    : null;
  if (!issue.comments.some((comment) => String(comment.id) === String(parentCommentId))) {
    throw new Error('control wake parent comment does not exist');
  }
  const wake = createControlWake({
    controlIssue,
    parentCommentId,
    assignedMachine: nextOwner,
    targetTaskDigest: target.taskDigest,
    callbackTaskDigest,
    verdict,
    receiptBody,
    createdAt: now(clock),
    // An absent lineage keeps the exact v1 record and its frozen wakeId.
    lineage: lineage ?? null,
  });
  const replay = issue.comments
    .map((comment) => {
      try {
        const decoded = decodeControlWakeComment(String(comment.body || ''));
        return decoded.wake.wakeId === wake.wakeId ? { comment, decoded } : null;
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((left, right) => (
      BigInt(String(left.comment.id)) < BigInt(String(right.comment.id)) ? -1 : 1
    ))
    .at(0);
  if (replay) {
    return {
      status: 'REPLAY',
      commentId: String(replay.comment.id),
      commentUrl: replay.comment.htmlUrl ?? null,
      wake: replay.decoded.wake,
    };
  }
  const body = composeControlWakeComment(receiptBody, wake);
  if (!apply) return { status: 'DRY_RUN', wake, body };

  const posted = await transport.postComment(repo, controlIssue, body);
  const commentId = String(posted?.id ?? '');
  validateCommentId(commentId, 'posted comment ID');
  if (BigInt(commentId) <= BigInt(parentCommentId)) {
    throw new Error('posted control wake comment does not follow its parent');
  }
  const verifiedIssue = await transport.getIssue(repo, controlIssue);
  const verifiedComment = verifiedIssue.comments.find((comment) => String(comment.id) === commentId);
  if (!verifiedComment) throw new Error('posted control wake comment is not durable after write');
  const decoded = decodeControlWakeComment(verifiedComment.body);
  if (decoded.wake.wakeDigest !== wake.wakeDigest || decoded.receiptBody !== receiptBody) {
    throw new Error('posted control wake comment bytes differ after write');
  }
  return {
    status: 'APPLIED',
    commentId,
    commentUrl: verifiedComment.htmlUrl ?? null,
    wake,
  };
}

async function requireExactMachineBinding({
  transport,
  repo,
  controlIssue,
  machine,
  taskDigest,
  bridgeCommit,
  ticketRepositoryId = null,
}) {
  const repositoryId = await transport.getRepositoryId(repo);
  const state = machineBindingStateFromIssue(await transport.getIssue(repo, controlIssue));
  const binding = state.active[machine];
  if (!binding
      || binding.taskDigest !== taskDigest
      || binding.bridgeCommit !== bridgeCommit
      || binding.repositoryId !== repositoryId
      || (ticketRepositoryId !== null && ticketRepositoryId !== repositoryId)) {
    throw new Error(`exact active ${machine} machine binding is required`);
  }
  return { binding, repositoryId, state };
}

function resolveLocalHead(cwd = process.cwd()) {
  const result = spawnSync('git', ['rev-parse', 'HEAD'], {
    cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  });
  const head = String(result.stdout || '').trim().toLowerCase();
  if (result.status !== 0 || !GIT_SHA.test(head)) throw new Error('cannot resolve exact local bridge HEAD');
  return head;
}

export async function bootstrapMachine({
  transport,
  repo,
  controlIssue,
  machine,
  taskDigest,
  bridgeCommit,
  supersedeBindingDigest = null,
  replaceOwnerTask = false,
  apply,
  clock = () => new Date(),
}) {
  const remote = await transport.resolveRef(repo, 'master');
  if (remote !== bridgeCommit) throw new Error(`bridge bootstrap requires exact ${repo}/master ${remote}`);
  const repositoryId = await transport.getRepositoryId(repo);
  const issue = await transport.getIssue(repo, controlIssue);
  let state = machineBindingStateFromIssue(issue);
  const existing = state.active[machine];
  if (existing) {
    if (existing.taskDigest === taskDigest && existing.bridgeCommit === bridgeCommit
        && existing.repositoryId === repositoryId) {
      if (supersedeBindingDigest) {
        const held = state.held[supersedeBindingDigest];
        const heldTaskMatches = replaceOwnerTask
          ? held?.taskDigest !== taskDigest
          : held?.taskDigest === taskDigest;
        if (!held || held.machine !== machine || !heldTaskMatches
            || held.repositoryId !== repositoryId) {
          throw new Error(`superseded ${machine} binding is not exact durable HOLD evidence`);
        }
      }
      return { status: 'REUSE', binding: existing, held: state.held };
    }
    if (!supersedeBindingDigest) {
      throw new Error(`active ${machine} binding requires explicit machine-readable supersession`);
    }
    if (existing.bindingDigest !== supersedeBindingDigest
        || existing.repositoryId !== repositoryId) {
      throw new Error(`superseded ${machine} binding does not match the exact local task and repository`);
    }
    if (replaceOwnerTask ? existing.taskDigest === taskDigest : existing.taskDigest !== taskDigest) {
      throw new Error(replaceOwnerTask
        ? `replacement ${machine} owner task must be new`
        : `superseded ${machine} binding does not match the exact local task and repository`);
    }
  }
  const previouslyHeld = supersedeBindingDigest ? state.held[supersedeBindingDigest] : null;
  if (!existing && supersedeBindingDigest
      && (!previouslyHeld
        || previouslyHeld.machine !== machine
        || (replaceOwnerTask
          ? previouslyHeld.taskDigest === taskDigest
          : previouslyHeld.taskDigest !== taskDigest)
        || previouslyHeld.repositoryId !== repositoryId)) {
    throw new Error(`superseded ${machine} binding is not exact durable HOLD evidence`);
  }

  const binding = createMachineBinding({
    controlIssue, repositoryId, machine, taskDigest, bridgeCommit,
    registeredAt: now(clock),
  });
  const hold = existing ? createMachineHold({ binding: existing, heldAt: now(clock) }) : null;
  if (!apply) return { status: 'DRY_RUN', binding, hold, held: state.held };
  if (hold) {
    await transport.postComment(repo, controlIssue, [
      `Phase 0 machine-readable HOLD: \`${machine}\``, '',
      encodeMachineHoldMarker(hold),
    ].join('\n'));
    state = machineBindingStateFromIssue(await transport.getIssue(repo, controlIssue));
    if (state.active[machine]
        || state.held[existing.bindingDigest]?.bindingDigest !== existing.bindingDigest) {
      throw new Error('stale machine binding did not become one exact durable HOLD');
    }
  }
  await transport.postComment(repo, controlIssue, [
    `Phase 0 local binding: \`${machine}\``, '',
    encodeMachineBindingMarker(binding),
  ].join('\n'));
  const verified = machineBindingStateFromIssue(await transport.getIssue(repo, controlIssue));
  if (verified.active[machine]?.bindingDigest !== binding.bindingDigest
      || (supersedeBindingDigest
        && verified.held[supersedeBindingDigest]?.bindingDigest !== supersedeBindingDigest)) {
    throw new Error('machine binding is not uniquely durable after write');
  }
  return { status: 'BOOTSTRAPPED', binding: verified.active[machine], held: verified.held };
}

function exactGeneratorRecord(records, requestId, label) {
  if (!Array.isArray(records)) throw new Error(`Generator ${label} projection is not an array`);
  const matches = records.filter((record) => record?.requestId === requestId);
  if (matches.length !== 1) throw new Error(`Generator ${label} projection has ${matches.length} records for ${requestId}`);
  return matches[0];
}

export function deriveGeneratorTicket({
  snapshot,
  issueNumber,
  repositoryId,
  requestId,
  targetTaskDigest,
  callbackTaskDigest,
}) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) {
    throw new Error('Generator projection is invalid');
  }
  const rework = exactGeneratorRecord(snapshot.playableReworks, requestId, 'rework');
  const task = exactGeneratorRecord(snapshot.agentTasks, requestId, 'agent task');
  const request = rework.request;
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw new Error('Generator request payload is invalid');
  }
  if (!SHA256.test(String(rework.requestHash || ''))) throw new Error('Generator requestHash is invalid');
  const parentFromRequest = request.parentReleaseId ?? null;
  const matchingParents = Array.isArray(snapshot.releases)
    ? snapshot.releases.filter((release) => release?.reworkRequestId === requestId)
    : [];
  const parentIds = parentFromRequest
    ? [parentFromRequest]
    : [...new Set(matchingParents.map((release) => release.releaseId).filter(Boolean))];
  if (parentIds.length !== 1 || !safeIdentity(parentIds[0])) {
    throw new Error('Generator parent release identity is missing or ambiguous');
  }
  const sourceId = task.sourceId || request.sourceId
    || String(request.playableId || '').replace(/-swipe$/u, '');
  const sourceCommitCandidates = [task.sourceCommit, request.sourceCommit, request.runtime?.sourceCommit]
    .filter((value) => typeof value === 'string' && GIT_SHA.test(value));
  const sourceCommit = sourceCommitCandidates[0] ?? null;
  const mutationId = request.mutationId ?? null;
  const createdAt = rework.createdAt ?? request.createdAt;
  return {
    schema: 'two-mac.bridge-ticket.v1',
    ticketId: `meta-${issueNumber}/${requestId}`,
    issueNumber,
    repositoryId,
    sourceKind: 'mechanic',
    requestId,
    requestHash: rework.requestHash,
    mutationId,
    parentRequestId: parentIds[0],
    sourceId,
    sourceRepository: 'Glera/playables',
    sourceCommit,
    sourceTree: null,
    assignedMachine: 'mac-b',
    authority: 'content-factory',
    targetTaskDigest,
    callbackTaskDigest,
    instruction: request.instruction,
    createdAt,
  };
}

async function readGeneratorSnapshot(url, fetchImpl) {
  validateGeneratorUrl(url);
  const response = await fetchImpl(url, { method: 'GET', redirect: 'error' });
  if (!response.ok) throw new Error(`Generator projection returned HTTP ${response.status}`);
  const snapshot = await response.json();
  if (snapshot?.schema !== 'lab.playable-release-list.v1') {
    throw new Error('Generator projection schema is invalid');
  }
  return snapshot;
}

export async function bindGeneratorIssue({
  transport,
  repo,
  issueNumber,
  controlIssue,
  requestId,
  generatorUrl,
  taskDigest,
  bridgeCommit,
  apply,
  fetchImpl = fetch,
  clock = () => new Date(),
}) {
  const repositoryId = await transport.getRepositoryId(repo);
  const bindings = machineBindingsFromIssue(await transport.getIssue(repo, controlIssue));
  for (const machine of ['mac-a', 'mac-b']) {
    const binding = bindings[machine];
    if (!binding || binding.repositoryId !== repositoryId || binding.bridgeCommit !== bridgeCommit) {
      throw new Error(`exact ${machine} bootstrap is required before mechanic binding`);
    }
  }
  if (bindings['mac-a'].taskDigest !== taskDigest) {
    throw new Error('bind-generator is running in another Mac A task');
  }
  const githubIssue = await transport.getIssue(repo, issueNumber);
  const existingTickets = [githubIssue.body, ...githubIssue.comments.map((comment) => comment.body)]
    .flatMap(decodeTicketMarkers);
  if (existingTickets.length > 0) {
    const projected = projectIssue(githubIssue);
    if (projected.ticket.requestId !== requestId) {
      throw new Error(`Issue #${issueNumber} is already bound to another ticket`);
    }
    return { status: 'REUSE', ticket: projected.ticket, projection: projected.projection };
  }

  const searchHits = await transport.searchIssues(repo, requestId);
  const boundElsewhere = [];
  for (const hit of searchHits) {
    const candidate = await transport.getIssue(repo, hit.number);
    const candidateTickets = [candidate.body, ...candidate.comments.map((comment) => comment.body)]
      .flatMap(decodeTicketMarkers)
      .filter((item) => item.requestId === requestId);
    if (candidateTickets.length > 0) boundElsewhere.push(candidate.number);
  }
  const uniqueIssues = [...new Set(boundElsewhere)];
  if (uniqueIssues.length > 0) {
    throw new Error(`Generator request ${requestId} is already bound to Issue #${uniqueIssues.join(',#')}`);
  }
  const snapshot = await readGeneratorSnapshot(generatorUrl, fetchImpl);
  const ticket = deriveGeneratorTicket({
    snapshot, issueNumber, repositoryId, requestId,
    targetTaskDigest: bindings['mac-b'].taskDigest,
    callbackTaskDigest: bindings['mac-a'].taskDigest,
  });
  const queued = createEvent({
    ticket,
    state: 'QUEUED',
    actorMachine: 'mac-a',
    actorTaskDigest: taskDigest,
    idempotencyKey: `queue:${ticketDigest(ticket).slice(0, 32)}`,
    occurredAt: now(clock),
  });
  if (!apply) return { status: 'DRY_RUN', ticket, queued };
  await transport.postComment(repo, issueNumber, [
    `Phase 0 mechanic binding: \`${requestId}\` → \`mac-b\``, '',
    encodeTicketMarker(ticket), '', encodeEventMarker(queued, ticket),
  ].join('\n'));
  const verified = projectIssue(await transport.getIssue(repo, issueNumber));
  if (verified.projection.ticketDigest !== ticketDigest(ticket)
      || verified.projection.lastEventDigest !== queued.eventDigest) {
    throw new Error('mechanic ticket binding is not uniquely durable after write');
  }
  return { status: 'BOUND', ticket, projection: verified.projection };
}

function decodeBackendInstruction(value) {
  return value.replaceAll('&gt;', '>').replaceAll('&lt;', '<').replaceAll('&amp;', '&');
}

export function derivePlatformTicket({ issue, repositoryId, targetTaskDigest }) {
  const markerPattern = /<!-- p4g-development-ticket:v1 sourceKind=platform sourceRequestId=([A-Za-z0-9._:@+-]+) sourceRequestHash=([0-9a-f]{64}) -->/gu;
  const markers = [...String(issue.body || '').matchAll(markerPattern)];
  if (markers.length !== 1) throw new Error(`platform Issue has ${markers.length} exact backend source markers`);
  if (!String(issue.body).includes('<!-- schema: development-ticket.v1 -->')) {
    throw new Error('platform Issue development-ticket schema marker is missing');
  }
  const requestedAt = String(issue.body).match(/^- Requested at: `([^`]+)`$/mu)?.[1];
  const requestSection = String(issue.body).match(/## Original request\n\n([\s\S]*?)\n\n## Captured context/u)?.[1];
  if (!requestedAt || !requestSection?.startsWith('> ')) {
    throw new Error('platform Issue server-owned request fields are missing');
  }
  const buildSha = String(issue.body).match(/^- Client\/platform build SHA: .*server-verified ([0-9a-f]{7,64}).*$/mu)?.[1] ?? null;
  return {
    schema: 'two-mac.bridge-ticket.v1',
    ticketId: `meta-${issue.number}/${markers[0][1]}`,
    issueNumber: issue.number,
    repositoryId,
    sourceKind: 'platform',
    requestId: markers[0][1],
    requestHash: markers[0][2],
    mutationId: null,
    parentRequestId: null,
    sourceId: 'platform-intake',
    sourceRepository: DEFAULT_REPO,
    sourceCommit: buildSha && GIT_SHA.test(buildSha) ? buildSha : null,
    sourceTree: null,
    assignedMachine: 'mac-a',
    authority: 'product-control-plane',
    targetTaskDigest,
    callbackTaskDigest: null,
    instruction: decodeBackendInstruction(requestSection.slice(2)),
    createdAt: requestedAt,
  };
}

export async function bindPlatformIssue({
  transport,
  repo,
  issueNumber,
  controlIssue,
  taskDigest,
  bridgeCommit,
  apply,
  clock = () => new Date(),
}) {
  const repositoryId = await transport.getRepositoryId(repo);
  const bindings = machineBindingsFromIssue(await transport.getIssue(repo, controlIssue));
  const binding = bindings['mac-a'];
  if (!binding || binding.repositoryId !== repositoryId || binding.bridgeCommit !== bridgeCommit) {
    throw new Error('exact mac-a bootstrap is required before platform binding');
  }
  if (binding.taskDigest !== taskDigest) throw new Error('bind-platform is running in another Mac A task');
  const githubIssue = await transport.getIssue(repo, issueNumber);
  const ticket = derivePlatformTicket({ issue: githubIssue, repositoryId, targetTaskDigest: taskDigest });
  const existingTickets = [githubIssue.body, ...githubIssue.comments.map((comment) => comment.body)]
    .flatMap(decodeTicketMarkers);
  if (existingTickets.length > 0) {
    const projected = projectIssue(githubIssue);
    if (projected.projection.ticketDigest !== ticketDigest(ticket)) {
      throw new Error(`Issue #${issueNumber} is already bound to another ticket`);
    }
    return { status: 'REUSE', ticket, projection: projected.projection };
  }
  const queued = createEvent({
    ticket,
    state: 'QUEUED',
    actorMachine: 'mac-a',
    actorTaskDigest: taskDigest,
    idempotencyKey: `queue:${ticketDigest(ticket).slice(0, 32)}`,
    occurredAt: now(clock),
  });
  if (!apply) return { status: 'DRY_RUN', ticket, queued };
  await transport.postComment(repo, issueNumber, [
    `Phase 0 platform binding: \`${ticket.requestId}\` → \`mac-a\``, '',
    encodeTicketMarker(ticket), '', encodeEventMarker(queued, ticket),
  ].join('\n'));
  const verified = projectIssue(await transport.getIssue(repo, issueNumber));
  if (verified.projection.ticketDigest !== ticketDigest(ticket)
      || verified.projection.lastEventDigest !== queued.eventDigest) {
    throw new Error('platform ticket binding is not uniquely durable after write');
  }
  return { status: 'BOUND', ticket, projection: verified.projection };
}

function markersFromIssue(issue) {
  const bodies = [issue.body, ...(issue.comments || []).map((comment) => comment.body)];
  const tickets = bodies.flatMap((body) => decodeTicketMarkers(body));
  if (tickets.length === 0) return null;
  const uniqueTickets = new Map(tickets.map((ticket) => [ticketDigest(ticket), ticket]));
  if (uniqueTickets.size !== 1) throw new Error(`Issue #${issue.number} has conflicting bridge tickets`);
  const [ticket] = uniqueTickets.values();
  if (ticket.issueNumber !== issue.number) throw new Error(`Issue #${issue.number} carries another issueNumber`);
  const events = bodies.flatMap((body) => decodeEventMarkers(body, ticket));
  return { ticket, projection: projectJournal(ticket, events) };
}

export function projectIssue(issue) {
  const result = markersFromIssue(issue);
  if (!result) throw new Error(`Issue #${issue.number} has no Phase 0 ticket marker`);
  return result;
}

export function planWake({ ticket, projection, machine, taskDigest, observedAt = Date.now() }) {
  if (!['mac-a', 'mac-b'].includes(machine) || !SHA256.test(taskDigest)) {
    throw new Error('wake observer identity is invalid');
  }
  if (!projection.state || projection.state === 'DONE') return null;
  if (ticket.assignedMachine === machine) {
    if (ticket.targetTaskDigest !== taskDigest) {
      return { action: 'STOP', code: 'task_binding_mismatch', issueNumber: ticket.issueNumber };
    }
    if (['QUEUED', 'QUEUED:machine_offline'].includes(projection.state)) {
      return { action: 'CLAIM', issueNumber: ticket.issueNumber, state: projection.state };
    }
    if (projection.state === 'CLAIMED') {
      return { action: 'START', issueNumber: ticket.issueNumber, state: projection.state };
    }
    if (['CLAIM_PROPOSED', 'IN_PROGRESS'].includes(projection.state)) {
      return { action: 'CONTINUE', issueNumber: ticket.issueNumber, state: projection.state };
    }
    return null;
  }
  if (machine === 'mac-a' && ticket.assignedMachine === 'mac-b'
      && ticket.callbackTaskDigest !== taskDigest) {
    return { action: 'STOP', code: 'callback_binding_mismatch', issueNumber: ticket.issueNumber };
  }
  if (machine === 'mac-a' && ticket.assignedMachine === 'mac-b'
      && projection.state === 'HANDOFF_READY') {
    return { action: 'HOST_RUNTIME', issueNumber: ticket.issueNumber, state: projection.state };
  }
  if (machine === 'mac-a' && ticket.assignedMachine === 'mac-b'
      && ['READY_TO_PLAY', 'NEEDS_HELP'].includes(projection.state)) {
    return { action: 'CONSUME_TERMINAL', issueNumber: ticket.issueNumber, state: projection.state };
  }
  if (machine === 'mac-a' && ticket.assignedMachine === 'mac-b'
      && projection.state === 'QUEUED') {
    const queuedAt = Date.parse(projection.events.at(-1)?.occurredAt || '');
    if (Number.isFinite(queuedAt) && observedAt - queuedAt >= OFFLINE_OBSERVATION_MS) {
      return { action: 'MARK_OFFLINE', issueNumber: ticket.issueNumber, state: projection.state };
    }
  }
  return null;
}

function wakePriority(left, right) {
  const actionOrder = {
    CONSUME_TERMINAL: 0, HOST_RUNTIME: 1, MARK_OFFLINE: 2,
    CLAIM: 3, START: 4, CONTINUE: 5, STOP: 6,
  };
  const byAction = (actionOrder[left.action] ?? 99) - (actionOrder[right.action] ?? 99);
  if (byAction !== 0) return byAction;
  const byPinned = (PRIORITY_ISSUES.get(left.issueNumber) ?? 99)
    - (PRIORITY_ISSUES.get(right.issueNumber) ?? 99);
  if (byPinned !== 0) return byPinned;
  return left.issueNumber - right.issueNumber;
}

export function selectWakes(wakes, machine) {
  const sorted = [...wakes].sort(wakePriority);
  const safeErrors = sorted.filter((wake) => wake.action === 'STOP').slice(0, 10);
  const terminal = machine === 'mac-a'
    ? sorted.filter((wake) => wake.action === 'CONSUME_TERMINAL').slice(0, 10)
    : [];
  const monitoring = machine === 'mac-a'
    ? sorted.filter((wake) => wake.action === 'MARK_OFFLINE').slice(0, 10)
    : [];
  const hosting = machine === 'mac-a'
    ? sorted.find((wake) => wake.action === 'HOST_RUNTIME')
    : null;
  const author = sorted.find((wake) => ['CLAIM', 'START', 'CONTINUE'].includes(wake.action));
  return [
    ...safeErrors,
    ...terminal,
    ...monitoring,
    ...(hosting ? [hosting] : (author ? [author] : [])),
  ];
}

async function loadProjection(transport, repo, issueNumber) {
  return projectIssue(await transport.getIssue(repo, issueNumber));
}

async function appendOnce({ transport, repo, issueNumber, ticket, projection, event, apply }) {
  const existing = projection.events.find((item) => item.idempotencyKey === event.idempotencyKey);
  if (existing) {
    if (existing.eventDigest !== event.eventDigest) throw new Error(`idempotency conflict for ${event.idempotencyKey}`);
    return { posted: false, event: existing };
  }
  if (!apply) return { posted: false, event };
  await transport.postComment(repo, issueNumber, [
    `Bridge transition: \`${event.state}\``,
    '',
    encodeEventMarker(event, ticket),
  ].join('\n'));
  return { posted: true, event };
}

function now(clock) {
  return clock().toISOString().replace(/\.\d{3}Z$/u, (value) => value);
}

export async function claimIssue({
  transport,
  repo,
  issueNumber,
  controlIssue,
  machine,
  taskDigest,
  bridgeCommit,
  apply,
  clock = () => new Date(),
}) {
  let current = await loadProjection(transport, repo, issueNumber);
  const { ticket } = current;
  await requireExactMachineBinding({
    transport, repo, controlIssue, machine, taskDigest, bridgeCommit,
    ticketRepositoryId: ticket.repositoryId,
  });
  if (ticket.assignedMachine !== machine || ticket.targetTaskDigest !== taskDigest) {
    throw new Error('ticket is assigned to another machine or task');
  }
  if (current.projection.state === 'CLAIMED') {
    if (!current.projection.executable) throw new Error('existing claim is not executable');
    return { status: 'REUSE', projection: current.projection };
  }
  if (!['QUEUED', 'QUEUED:machine_offline', 'CLAIM_PROPOSED'].includes(current.projection.state)) {
    throw new Error(`ticket is not claimable from ${current.projection.state}`);
  }

  if (current.projection.state !== 'CLAIM_PROPOSED') {
    const proposed = createEvent({
      ticket,
      previous: current.projection.events.at(-1),
      state: 'CLAIM_PROPOSED',
      actorMachine: machine,
      actorTaskDigest: taskDigest,
      idempotencyKey: `claim-proposed:${ticketDigest(ticket).slice(0, 32)}`,
      occurredAt: now(clock),
    });
    const result = await appendOnce({ transport, repo, issueNumber, ticket, projection: current.projection, event: proposed, apply });
    if (!apply) return { status: 'DRY_RUN', nextEvent: result.event, projection: current.projection };
    current = await loadProjection(transport, repo, issueNumber);
    if (current.projection.lastEventDigest !== proposed.eventDigest) {
      throw new Error('claim proposal was not the unique current event');
    }
  }

  const confirmed = createEvent({
    ticket,
    previous: current.projection.events.at(-1),
    state: 'CLAIMED',
    actorMachine: machine,
    actorTaskDigest: taskDigest,
    idempotencyKey: `claim-confirmed:${ticketDigest(ticket).slice(0, 32)}`,
    occurredAt: now(clock),
  });
  const result = await appendOnce({ transport, repo, issueNumber, ticket, projection: current.projection, event: confirmed, apply });
  if (!apply) return { status: 'DRY_RUN', nextEvent: result.event, projection: current.projection };

  const first = await loadProjection(transport, repo, issueNumber);
  const second = await loadProjection(transport, repo, issueNumber);
  if (!first.projection.executable || !second.projection.executable
      || first.projection.lastEventDigest !== confirmed.eventDigest
      || second.projection.lastEventDigest !== confirmed.eventDigest) {
    throw new Error('claim confirmation did not survive two complete independent reads');
  }
  return { status: 'CLAIMED', projection: second.projection };
}

function transitionEvidence(options) {
  if (['HANDOFF_READY', 'READY_TO_PLAY'].includes(options.state)) {
    const evidence = [{
      kind: 'git_head',
      identity: `${options.headRepository}@${options.headRef}:${options.headSha}`,
      url: `https://github.com/${options.headRepository}/commit/${options.headSha}`,
      sha256: null,
    }];
    if (options.state === 'READY_TO_PLAY') {
      evidence.push({
        kind: 'candidate',
        identity: `sha256:${options.candidateSha256}`,
        url: options.candidateUrl,
        sha256: options.candidateSha256,
      });
    }
    return evidence;
  }
  if (options.state === 'DONE') {
    return [{ kind: 'telegram_receipt', identity: options.receiptId, url: null, sha256: null }];
  }
  return [];
}

async function verifyCandidateBytes(url, expectedSha256, fetchImpl) {
  const response = await fetchImpl(url, { method: 'GET', redirect: 'error' });
  if (!response.ok) throw new Error(`candidate returned HTTP ${response.status}`);
  const contentLength = Number(response.headers?.get?.('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 8 * 1024 * 1024) {
    throw new Error('candidate exceeds the 8 MiB bridge evidence limit');
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > 8 * 1024 * 1024) throw new Error('candidate exceeds the 8 MiB bridge evidence limit');
  const actual = sha256(bytes);
  if (actual !== expectedSha256) {
    throw new Error(`candidate bytes sha256 ${actual} do not match expected evidence`);
  }
}

export async function advanceIssue({
  transport,
  options,
  taskDigest,
  bridgeCommit = null,
  fetchImpl = fetch,
  clock = () => new Date(),
}) {
  const current = await loadProjection(transport, options.repo, options.issue);
  const { ticket, projection } = current;
  const exactBinding = await requireExactMachineBinding({
    transport,
    repo: options.repo,
    controlIssue: options.controlIssue,
    machine: options.machine,
    taskDigest,
    bridgeCommit,
    ticketRepositoryId: ticket.repositoryId,
  });
  if (options.machine === 'mac-a' && ticket.assignedMachine === 'mac-b'
      && ticket.callbackTaskDigest !== exactBinding.binding.taskDigest) {
    throw new Error('exact mac-a callback binding is required for this transition');
  }
  if (options.state === 'HANDOFF_READY'
      && (ticket.assignedMachine !== 'mac-b'
        || options.machine !== 'mac-b'
        || ticket.targetTaskDigest !== taskDigest)) {
    throw new Error('HANDOFF_READY belongs only to the assigned Mac B task');
  }
  if (ticket.assignedMachine === 'mac-b'
      && ['HANDOFF_READY', 'READY_TO_PLAY'].includes(options.state)
      && (!CONTENT_HEAD_REPOSITORIES.has(options.headRepository)
        || options.headRef !== 'master')) {
    throw new Error('Mac B handoff head must be merged master in an allowlisted content repository');
  }
  if (projection.state === 'HANDOFF_READY'
      && ['READY_TO_PLAY', 'NEEDS_HELP'].includes(options.state)
      && (options.machine !== 'mac-a' || ticket.callbackTaskDigest !== taskDigest)) {
    throw new Error('post-handoff terminal transition belongs only to the exact Mac A callback task');
  }
  if (['HANDOFF_READY', 'READY_TO_PLAY'].includes(options.state)) {
    const remote = await transport.resolveRef(options.headRepository, options.headRef);
    if (remote !== options.headSha) throw new Error(`remote ${options.headRef} is ${remote}, not ${options.headSha}`);
  }
  if (options.state === 'READY_TO_PLAY') {
    if (ticket.assignedMachine === 'mac-b' && projection.state === 'HANDOFF_READY') {
      const handedOffHead = projection.events.at(-1).evidence.find(
        (item) => item.kind === 'git_head',
      );
      const requestedHead = transitionEvidence(options).find((item) => item.kind === 'git_head');
      if (!handedOffHead || canonicalJson(handedOffHead) !== canonicalJson(requestedHead)) {
        throw new Error('READY_TO_PLAY head differs from HANDOFF_READY evidence');
      }
    }
    await verifyCandidateBytes(options.candidateUrl, options.candidateSha256, fetchImpl);
  }
  const macAHostCompletion = options.machine === 'mac-a'
    && ticket.assignedMachine === 'mac-b'
    && projection.state === 'HANDOFF_READY'
    && ['READY_TO_PLAY', 'NEEDS_HELP'].includes(options.state);
  if (options.state !== 'DONE'
      && options.state !== 'QUEUED:machine_offline'
      && !(options.state === 'NEEDS_HELP' && ['task_missing', 'machine_offline'].includes(options.errorCode)
        && options.machine === 'mac-a')
      && !macAHostCompletion
      && (ticket.assignedMachine !== options.machine || ticket.targetTaskDigest !== taskDigest)) {
    throw new Error('transition belongs to another machine or task');
  }
  const event = createEvent({
    ticket,
    previous: projection.events.at(-1),
    state: options.state,
    actorMachine: options.machine,
    actorTaskDigest: taskDigest,
    idempotencyKey: `${options.state.toLowerCase()}:${ticketDigest(ticket).slice(0, 32)}`,
    occurredAt: now(clock),
    evidence: transitionEvidence(options),
    errorCode: options.errorCode,
  });
  const nextProjection = projectJournal(ticket, [...projection.events, event]);
  const result = await appendOnce({
    transport,
    repo: options.repo,
    issueNumber: options.issue,
    ticket,
    projection,
    event,
    apply: options.apply,
  });
  if (!options.apply) {
    return { status: 'DRY_RUN', nextEvent: result.event, projection: nextProjection };
  }
  const verified = await loadProjection(transport, options.repo, options.issue);
  if (verified.projection.lastEventDigest !== event.eventDigest) {
    throw new Error('transition is not the unique current event after write');
  }
  return { status: 'APPLIED', projection: verified.projection };
}

export async function runCli(argv, {
  env = process.env,
  transport = createGitHubTransport(),
  writeOut = (value) => process.stdout.write(value),
  writeErr = (value) => process.stderr.write(value),
  clock = () => new Date(),
  fetchImpl = fetch,
  resolveHead = () => resolveLocalHead(),
} = {}) {
  let options;
  try {
    options = parseArgs(argv);
    if (options.help) { writeOut(USAGE); return 0; }
    if (options.command === 'project') {
      const result = await loadProjection(transport, options.repo, options.issue);
      writeOut(`${JSON.stringify(result.projection, null, 2)}\n`);
      return 0;
    }
    if (options.command === 'scan-wakes') {
      const result = await scanControlIssueWakes({
        transport,
        repo: options.repo,
        controlIssue: options.controlIssue,
        machine: options.machine,
        lastScannedCommentId: options.afterCommentId,
        lastConsumedWakeCommentId: options.afterWakeId,
      });
      writeOut(`${JSON.stringify(result, null, 2)}\n`);
      return result.attention.length > 0
        || ['STOP', 'AUTHORITY_REQUIRED'].includes(result.nextWake?.action)
        ? 2
        : 0;
    }
    const taskDigest = deriveTaskDigest(env);
    if (options.command === 'bootstrap') {
      const result = await bootstrapMachine({
        transport, repo: options.repo, controlIssue: options.controlIssue,
        machine: options.machine, taskDigest, bridgeCommit: resolveHead(),
        supersedeBindingDigest: options.supersedeBindingDigest,
        replaceOwnerTask: options.replaceOwnerTask,
        apply: options.apply, clock,
      });
      writeOut(`${JSON.stringify(result, null, 2)}\n`);
      return 0;
    }
    if (options.command === 'bind-platform') {
      const result = await bindPlatformIssue({
        transport, repo: options.repo, issueNumber: options.issue,
        controlIssue: options.controlIssue, taskDigest,
        bridgeCommit: resolveHead(), apply: options.apply, clock,
      });
      writeOut(`${JSON.stringify(result, null, 2)}\n`);
      return 0;
    }
    if (options.command === 'bind-generator') {
      const result = await bindGeneratorIssue({
        transport, repo: options.repo, issueNumber: options.issue,
        controlIssue: options.controlIssue, requestId: options.requestId,
        generatorUrl: options.generatorUrl, taskDigest,
        bridgeCommit: resolveHead(), apply: options.apply, fetchImpl, clock,
      });
      writeOut(`${JSON.stringify(result, null, 2)}\n`);
      return 0;
    }
    if (options.command === 'publish-wake') {
      const receiptBody = readFileSync(options.bodyFile, 'utf8');
      const result = await publishControlWake({
        transport,
        repo: options.repo,
        controlIssue: options.controlIssue,
        actorMachine: options.machine,
        actorTaskDigest: taskDigest,
        nextOwner: options.nextOwner,
        parentCommentId: options.parentCommentId,
        verdict: options.verdict,
        receiptBody,
        bridgeCommit: resolveHead(),
        apply: options.apply,
        lineage: controlWakeLineage(options),
        clock,
      });
      writeOut(`${JSON.stringify(result, null, 2)}\n`);
      return 0;
    }
    if (options.command === 'observe') {
      await requireExactMachineBinding({
        transport,
        repo: options.repo,
        controlIssue: options.controlIssue,
        machine: options.machine,
        taskDigest,
        bridgeCommit: resolveHead(),
      });
      const issues = await transport.listOpenIssues(options.repo);
      const wakes = [];
      for (const issue of issues) {
        let result;
        try { result = projectIssue(await transport.getIssue(options.repo, issue.number)); }
        catch (error) {
          if (/no Phase 0 ticket marker/u.test(error.message)) continue;
          wakes.push({
            action: 'STOP', code: 'issue_journal_invalid',
            issueNumber: issue.number, issueUrl: issue.htmlUrl,
          });
          continue;
        }
        const wake = planWake({ ...result, machine: options.machine, taskDigest });
        if (wake) wakes.push({
          ...wake,
          issueUrl: issue.htmlUrl,
          ticketDigest: result.projection.ticketDigest,
        });
      }
      const selected = selectWakes(wakes, options.machine);
      writeOut(`${JSON.stringify({ schema: 'two-mac.bridge-observation.v1', machine: options.machine, wakes: selected }, null, 2)}\n`);
      return selected.some((wake) => wake.action === 'STOP') ? 2 : 0;
    }
    if (options.command === 'claim') {
      const result = await claimIssue({
        transport, repo: options.repo, issueNumber: options.issue,
        controlIssue: options.controlIssue, machine: options.machine,
        taskDigest, bridgeCommit: resolveHead(), apply: options.apply, clock,
      });
      writeOut(`${JSON.stringify(result, null, 2)}\n`);
      return 0;
    }
    const result = await advanceIssue({
      transport, options, taskDigest, bridgeCommit: resolveHead(), fetchImpl, clock,
    });
    writeOut(`${JSON.stringify(result, null, 2)}\n`);
    return 0;
  } catch (error) {
    writeErr(`STOP: ${error.message}\n`);
    return 1;
  }
}

function lockPath(repo, machine) {
  return `/tmp/p4g-two-mac-bridge-${repo.replaceAll('/', '-')}-${machine}.lock`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let parsed;
  try { parsed = parseArgs(process.argv.slice(2)); } catch (error) {
    process.stderr.write(`STOP: ${error.message}\n`);
    process.exitCode = 1;
  }
  if (parsed && parsed.apply && ['bootstrap', 'bind-platform', 'bind-generator', 'publish-wake', 'claim', 'advance'].includes(parsed.command) && !parsed.lockHeld) {
    const args = [
      '-t', '0', lockPath(parsed.repo, parsed.machine),
      process.execPath, fileURLToPath(import.meta.url),
      ...process.argv.slice(2), '--lock-held',
    ];
    const result = spawnSync('/usr/bin/lockf', args, { stdio: 'inherit' });
    process.exitCode = typeof result.status === 'number' ? result.status : 1;
  } else if (parsed) {
    process.exitCode = await runCli(process.argv.slice(2));
  }
}
