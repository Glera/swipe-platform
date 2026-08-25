#!/usr/bin/env node
// Model-free #136 piece 3 host watcher.
//
// Default invocation is read-only. `--run` is intentionally required before
// this process may write local cursor state or resume one bound Codex session.
// Installing/enabling the launchd plist is a separate operator action.

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  rmSync,
} from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  WAKE_GATE_TICK_SCHEMA,
  addBoundedUnique,
  advanceIdleState,
  atomicWriteJson,
  compactBodiesAfterScan,
  fetchCompactComments,
  initialWakeGateState,
  markDispatchStarted,
  markDispatchSucceeded,
  markDispatchUnknown,
  observeWakeGate,
  preparePending,
  readWakeGateConfig,
  readWakeGateState,
  rotationDue,
  validateWakeGateState,
  wakePrompt,
} from './two-mac-wake-gate-core.mjs';
import { sha256 } from './two-mac-bridge-contract.mjs';

const STATE_FILENAME = 'wake-gate-state.v1.json';
const LOCK_DIRNAME = 'wake-gate.single-flight.lock';
const ATTENTION_FILENAME = 'wake-gate-attention.v1.json';

const USAGE = `Usage:
  node scripts/two-mac-wake-gate.mjs --config ABSOLUTE_PATH [--run]
  node scripts/two-mac-wake-gate.mjs --config ABSOLUTE_PATH --run \
    --clear-attention COMMENT_ID
  node scripts/two-mac-wake-gate.mjs --config ABSOLUTE_PATH --run \
    --resolve-outcome WAKE_ID --resolution consumed|not-started

Without --run the gate performs a read-only GitHub scan and prints what it
would do. --run requires config.enabled=true, persists the durable cursor and
may resume at most one exact bound Codex session. It never posts to GitHub.
`;

function parseArgs(argv) {
  const result = {
    configPath: null,
    run: false,
    help: false,
    clearAttention: null,
    resolveOutcome: null,
    resolution: null,
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--config') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--config requires a value');
      result.configPath = value;
      index += 1;
    } else if (arg === '--run') {
      result.run = true;
    } else if (arg === '--clear-attention') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--clear-attention requires a value');
      result.clearAttention = value;
      index += 1;
    } else if (arg === '--resolve-outcome') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--resolve-outcome requires a value');
      result.resolveOutcome = value;
      index += 1;
    } else if (arg === '--resolution') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error('--resolution requires a value');
      result.resolution = value;
      index += 1;
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else {
      throw new Error(`unknown option: ${arg}`);
    }
  }
  if (!result.help && (!result.configPath || !path.isAbsolute(result.configPath))) {
    throw new Error('--config must be one absolute path');
  }
  if ((result.clearAttention !== null || result.resolveOutcome !== null) && !result.run) {
    throw new Error('local recovery requires --run');
  }
  if (result.clearAttention !== null && !/^(?:0|[1-9][0-9]{0,31})$/u.test(result.clearAttention)) {
    throw new Error('--clear-attention must be one comment id');
  }
  if (result.resolveOutcome !== null && !/^wake_[0-9a-f]{64}$/u.test(result.resolveOutcome)) {
    throw new Error('--resolve-outcome must be one wake id');
  }
  if ((result.resolveOutcome === null) !== (result.resolution === null)) {
    throw new Error('--resolve-outcome and --resolution are required together');
  }
  if (result.resolution !== null && !['consumed', 'not-started'].includes(result.resolution)) {
    throw new Error('--resolution must be consumed or not-started');
  }
  if (result.clearAttention !== null && result.resolveOutcome !== null) {
    throw new Error('only one local recovery action is allowed per invocation');
  }
  return result;
}

function execute(executable, args, options = {}) {
  return spawnSync(executable, args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: 30_000,
    ...options,
  });
}

function checked(result, label) {
  if (result.error) throw new Error(`${label} failed`);
  if (result.status !== 0) {
    throw new Error(`${label} failed`);
  }
  return String(result.stdout ?? '');
}

function localHead(config, run = execute) {
  const value = checked(
    run('/usr/bin/git', ['rev-parse', 'HEAD'], { cwd: config.metaCheckout }),
    'reading local bridge head',
  ).trim().toLowerCase();
  if (!/^[0-9a-f]{40}$/u.test(value)) throw new Error('local bridge head is invalid');
  return value;
}

function githubPageReader(config, run = execute) {
  return async ({ page, pageSize }) => {
    const args = [
      'api', '--method', 'GET',
      `repos/${config.repo}/issues/${config.controlIssue}/comments`,
      '-f', `per_page=${pageSize}`,
      '-f', `page=${page}`,
    ];
    const raw = checked(run(config.ghExecutable, args, { cwd: config.metaCheckout }), 'reading control comments');
    let value;
    try { value = JSON.parse(raw); } catch { throw new Error('GitHub comments returned invalid JSON'); }
    return value;
  };
}

function acquireSingleFlight(dataRoot) {
  const lockPath = path.join(dataRoot, LOCK_DIRNAME);
  try {
    mkdirSync(lockPath, { mode: 0o700 });
  } catch (error) {
    if (error?.code === 'EEXIST') return null;
    throw error;
  }
  return () => rmSync(lockPath, { recursive: true, force: true });
}

function codexWriterLock(config) {
  return path.join(config.codexHome, 'thread-writer-locks', `${config.codexSessionId}.lock`);
}

function sessionBusy(config, run = execute) {
  const lockPath = codexWriterLock(config);
  if (!existsSync(lockPath)) throw new Error('Codex writer lock is unavailable');
  const result = run('/usr/sbin/lsof', ['-t', '--', lockPath]);
  if (result.error) throw new Error('checking Codex writer lock failed');
  if (result.status === 1 && !String(result.stdout || '').trim()) return false;
  if (result.status !== 0) {
    throw new Error('checking Codex writer lock failed');
  }
  const pids = String(result.stdout || '').trim().split(/\s+/u).filter(Boolean);
  if (pids.length === 0) return false;
  for (const pid of pids) {
    if (!/^[1-9][0-9]{0,15}$/u.test(pid)) throw new Error('Codex writer lock owner is invalid');
    const owner = run('/bin/ps', ['-ww', '-p', pid, '-o', 'command=']);
    if (owner.error || owner.status !== 0) throw new Error('checking Codex writer owner failed');
    const command = String(owner.stdout || '').trim();
    if (/\bcodex\b.*\bapp-server\b/u.test(command)) {
      throw new Error('headless owner task is loaded by Codex Desktop app-server');
    }
    if (!/\bcodex\b.*\bexec\s+resume\b/u.test(command)) {
      throw new Error('Codex writer lock has an unrecognized owner');
    }
  }
  return true;
}

function notify(config, message, run = execute) {
  const script = [
    '-e', 'on run argv',
    '-e', 'display notification (item 1 of argv) with title (item 2 of argv)',
    '-e', 'end run',
    '--', message.slice(0, 500), config.notificationTitle,
  ];
  const result = run('/usr/bin/osascript', script);
  return !result.error && result.status === 0;
}

function runIntakeDrain(config, run = execute) {
  if (config.intakeDrainConfigPath === null) return { configured: false };
  const scriptPath = path.join(config.metaCheckout, 'scripts', 'intake-drain-watcher.mjs');
  const result = run(process.execPath, [scriptPath, '--config', config.intakeDrainConfigPath], {
    cwd: config.metaCheckout,
  });
  return {
    configured: true,
    ok: !result.error && result.status === 0,
    status: result.status,
  };
}

function writeAttention(dataRoot, attention, message) {
  atomicWriteJson(path.join(dataRoot, ATTENTION_FILENAME), {
    schema: 'two-mac.wake-gate.attention.v1',
    attention,
    message,
  });
}

function notifyOnce({ config, state, key, message, dataRoot, run }) {
  writeAttention(dataRoot, state.attention ?? {
    code: key.split(':')[0], commentId: '0', commentUrl: null, wakeId: null,
    createdAt: new Date().toISOString(),
  }, message);
  // The durable attention file is the primary operator-visible signal and
  // must be recreated after an explicit recovery even when a prior desktop
  // notification for the same key was already delivered.
  if (state.notifiedKeys.includes(key)) return state;
  if (!notify(config, message, run)) return state;
  return { ...state, notifiedKeys: addBoundedUnique(state.notifiedKeys, key) };
}

function notificationKeysForAttention(config, attention) {
  return new Set([
    `${attention.code}:${attention.commentId}`,
    `${attention.code}:${config.controlIssue}`,
  ]);
}

function runLogPaths(dataRoot, pending) {
  const stem = `${pending.commentId}-${pending.wakeId}`;
  return {
    stdoutPath: path.join(dataRoot, 'runs', `${stem}.jsonl`),
    stderrPath: path.join(dataRoot, 'runs', `${stem}.stderr.log`),
  };
}

function codexPreflight(config, run = execute) {
  checked(run(config.codexExecutable, ['--version'], { timeout: 10_000 }), 'Codex capability probe');
}

function dispatchCodex({ config, pending, prompt, dataRoot, run = execute }) {
  const runRoot = path.join(dataRoot, 'runs');
  mkdirSync(runRoot, { recursive: true, mode: 0o700 });
  const { stdoutPath, stderrPath } = runLogPaths(dataRoot, pending);
  const stdoutFd = openSync(stdoutPath, 'wx', 0o600);
  const stderrFd = openSync(stderrPath, 'wx', 0o600);
  try {
    return run(
      config.codexExecutable,
      ['exec', 'resume', '--json', config.codexSessionId, '-'],
      {
        cwd: config.workspaceDir,
        env: { ...process.env, CODEX_HOME: config.codexHome },
        input: prompt,
        stdio: ['pipe', stdoutFd, stderrFd],
        encoding: undefined,
        maxBuffer: undefined,
        timeout: 4 * 60 * 60 * 1_000,
      },
    );
  } finally {
    closeSync(stdoutFd);
    closeSync(stderrFd);
  }
}

function removeSuccessfulRunLogs(dataRoot, pending) {
  const paths = runLogPaths(dataRoot, pending);
  for (const target of Object.values(paths)) rmSync(target, { force: true });
}

function classifyOperationalError(error) {
  const message = String(error?.message ?? '');
  if (/task binding|bridge binding/u.test(message)) return 'binding_drift';
  if (/loaded by Codex Desktop/u.test(message)) return 'headless_owner_loaded_in_desktop';
  if (/unrecognized owner|writer owner/u.test(message)) return 'owner_lock_unrecognized';
  if (/writer lock/u.test(message)) return 'owner_lock_unavailable';
  if (/comment (?:changed|disappeared)/u.test(message)) return 'control_comment_changed';
  if (/pagination/u.test(message)) return 'control_pagination_incomplete';
  if (/comment (?:body )?cache/u.test(message)) return 'control_issue_rotation_required';
  if (/pending wake no longer matches/u.test(message)) return 'pending_wake_mismatch';
  if (/payload hash|prompt hash/u.test(message)) return 'pending_payload_changed';
  if (/trusted|marker author/u.test(message)) return 'untrusted_marker_author';
  if (/Codex capability probe/u.test(message)) return 'codex_capability_unavailable';
  return 'wake_gate_internal_error';
}

function tickResult(config, extra = {}) {
  return { schema: WAKE_GATE_TICK_SCHEMA, machine: config.machine, ...extra };
}

export async function runWakeGate({
  configPath,
  apply,
  recovery = null,
  now = () => new Date(),
  run = execute,
  listPage = null,
} = {}) {
  const config = readWakeGateConfig(configPath);
  if (apply && !config.enabled) throw new Error('wake gate is disabled in config');
  const dataRoot = path.dirname(configPath);
  const statePath = path.join(dataRoot, STATE_FILENAME);
  const release = apply ? acquireSingleFlight(dataRoot) : () => {};
  if (apply && release === null) return tickResult(config, { action: 'single_flight_busy' });
  let state = null;
  try {
    state = readWakeGateState(statePath, config.machine, {
      lastScannedCommentId: config.initialScannedCommentId,
      lastConsumedWakeCommentId: config.initialConsumedWakeCommentId,
    });

    if (recovery?.clearAttention !== null && recovery?.clearAttention !== undefined) {
      if (state.attention === null || state.attention.commentId !== recovery.clearAttention) {
        throw new Error('local attention identity does not match');
      }
      const clearedKeys = notificationKeysForAttention(config, state.attention);
      state = {
        ...state,
        attention: null,
        notifiedKeys: state.notifiedKeys.filter((key) => !clearedKeys.has(key)),
      };
      rmSync(path.join(dataRoot, ATTENTION_FILENAME), { force: true });
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, { action: 'attention_cleared', commentId: recovery.clearAttention });
    }
    if (recovery?.resolveOutcome !== null && recovery?.resolveOutcome !== undefined) {
      if (state.pending?.status !== 'outcome_unknown'
          || state.pending.wakeId !== recovery.resolveOutcome) {
        throw new Error('local outcome identity does not match');
      }
      const pending = state.pending;
      const outcomeKey = `resume_outcome_unknown:${pending.wakeId}`;
      if (recovery.resolution === 'consumed') {
        state = {
          ...state,
          lastConsumedWakeCommentId: pending.commentId,
          handledWakeIds: addBoundedUnique(state.handledWakeIds, pending.wakeId),
          notifiedKeys: state.notifiedKeys.filter((key) => key !== outcomeKey),
          pending: null,
        };
      } else {
        state = {
          ...state,
          notifiedKeys: state.notifiedKeys.filter((key) => key !== outcomeKey),
          pending: { ...pending, status: 'queued', startedAt: null },
        };
        const paths = runLogPaths(dataRoot, pending);
        for (const target of Object.values(paths)) rmSync(target, { force: true });
      }
      rmSync(path.join(dataRoot, ATTENTION_FILENAME), { force: true });
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, {
        action: `outcome_resolved_${recovery.resolution.replace('-', '_')}`,
        wakeId: pending.wakeId,
      });
    }

    const intake = apply ? runIntakeDrain(config, run) : { configured: config.intakeDrainConfigPath !== null };
    if (state.attention !== null) {
      state = notifyOnce({
        config,
        state,
        key: `${state.attention.code}:${state.attention.commentId}`,
        message: `Two-Mac wake gate needs attention: ${state.attention.code}.`,
        dataRoot,
        run,
      });
      if (apply) atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, { action: 'blocked_attention', attention: state.attention, intake });
    }
    if (state.pending?.status === 'started') state = markDispatchUnknown(state);
    if (state.pending?.status === 'outcome_unknown') {
      state = notifyOnce({
        config,
        state,
        key: `resume_outcome_unknown:${state.pending.wakeId}`,
        message: `Two-Mac wake ${state.pending.wakeId} has an unknown resume outcome; no automatic retry will run.`,
        dataRoot,
        run,
      });
      if (apply) atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, { action: 'blocked_outcome_unknown', pending: state.pending, intake });
    }

    const fetched = await fetchCompactComments({
      listPage: listPage ?? githubPageReader(config, run),
      existing: state.comments,
      lastFetchedAt: state.lastFetchedAt,
      lastScannedCommentId: state.lastScannedCommentId,
      pageSize: config.pageSize,
      maxPages: config.maxPages,
    });
    state = { ...state, comments: fetched.comments, lastFetchedAt: fetched.lastFetchedAt };
    const head = localHead(config, run);
    let observation = observeWakeGate({ config, state, comments: state.comments, localBridgeCommit: head, now });
    while (observation.kind === 'deduped') {
      const wake = observation.scan.nextWake;
      state = {
        ...state,
        lastScannedCommentId: observation.scan.cursors.lastScannedCommentId,
        lastConsumedWakeCommentId: wake.commentId,
      };
      observation = observeWakeGate({ config, state, comments: state.comments, localBridgeCommit: head, now });
    }

    // Drain every already-durable actionable wake before asking for the rare
    // operator rollover. This keeps rotation from stranding a queued wake or
    // turning the threshold-crossing wake into an implicit skip.
    if (observation.kind === 'idle' && state.pending === null && rotationDue(config, state.comments)) {
      const attention = {
        code: 'control_issue_rotation_required',
        commentId: state.comments.at(-1)?.id ?? state.lastScannedCommentId,
        commentUrl: state.comments.at(-1)?.htmlUrl ?? null,
        wakeId: null,
        createdAt: now().toISOString(),
      };
      if (!apply) return tickResult(config, { action: 'would_require_rotation', attention, intake });
      state = { ...state, attention };
      state = notifyOnce({
        config,
        state,
        key: `${attention.code}:${config.controlIssue}`,
        message: `Two-Mac control Issue #${config.controlIssue} reached its bounded rollover threshold.`,
        dataRoot,
        run,
      });
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, { action: 'attention', attention, intake });
    }

    if (!apply) {
      return tickResult(config, {
        action: observation.kind === 'dispatch' ? 'would_dispatch' : observation.kind,
        commentId: observation.scan?.nextWake?.commentId ?? null,
        wakeId: observation.scan?.nextWake?.wake?.wakeId ?? null,
        pendingWakeCount: observation.scan?.pendingWakeCount ?? 0,
        rotationDue: false,
        intake,
      });
    }

    if (observation.kind === 'attention') {
      state = { ...state, attention: observation.attention };
      state = notifyOnce({
        config,
        state,
        key: `${observation.attention.code}:${observation.attention.commentId}`,
        message: `Two-Mac wake gate needs attention: ${observation.attention.code}. ${observation.attention.commentUrl ?? ''}`.trim(),
        dataRoot,
        run,
      });
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, { action: 'attention', attention: observation.attention, intake });
    }

    if (observation.kind === 'idle') {
      state = advanceIdleState(state, observation.scan);
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, {
        action: 'idle',
        pendingWakeCount: 0,
        rotationDue: false,
        intake,
      });
    }

    if (observation.kind !== 'dispatch') throw new Error(`unsupported observation: ${observation.kind}`);
    const nextWake = observation.scan.nextWake;
    if (state.pending === null) {
      const prepared = preparePending({ config, nextWake, dataRoot, now });
      state = {
        ...state,
        lastScannedCommentId: observation.scan.cursors.lastScannedCommentId,
        pending: prepared.pending,
      };
      state.comments = compactBodiesAfterScan(state.comments, state.lastScannedCommentId);
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
    } else if (state.pending.wakeId !== nextWake.wake.wakeId
        || state.pending.commentId !== nextWake.commentId) {
      throw new Error('durable pending wake no longer matches the first actionable wake');
    }

    const payloadBytes = readFileSync(state.pending.payloadPath);
    const payloadHash = createHash('sha256').update(payloadBytes).digest('hex');
    if (payloadHash !== state.pending.payloadSha256) {
      throw new Error('durable pending payload hash changed');
    }
    const prompt = wakePrompt(state.pending.payloadPath, state.pending.payloadSha256);
    if (sha256(prompt) !== state.pending.promptSha256) {
      throw new Error('durable pending prompt hash changed');
    }
    if (sessionBusy(config, run)) {
      return tickResult(config, {
        action: 'owner_busy',
        commentId: state.pending.commentId,
        wakeId: state.pending.wakeId,
        intake,
      });
    }

    codexPreflight(config, run);
    const logs = runLogPaths(dataRoot, state.pending);
    if (Object.values(logs).some(existsSync)) throw new Error('pending run log collision');
    state = markDispatchStarted(state, now);
    atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
    const result = dispatchCodex({ config, pending: state.pending, prompt, dataRoot, run });
    if (result.error || result.status !== 0) {
      state = markDispatchUnknown(state);
      state = notifyOnce({
        config,
        state,
        key: `resume_outcome_unknown:${state.pending.wakeId}`,
        message: `Two-Mac wake ${state.pending.wakeId} has an unknown resume outcome; no automatic retry will run.`,
        dataRoot,
        run,
      });
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, {
        action: 'resume_outcome_unknown',
        commentId: state.pending.commentId,
        wakeId: state.pending.wakeId,
        intake,
      });
    }

    const completed = state.pending;
    state = markDispatchSucceeded(state);
    atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
    removeSuccessfulRunLogs(dataRoot, completed);
    return tickResult(config, {
      action: 'dispatched',
      commentId: completed.commentId,
      wakeId: completed.wakeId,
      intake,
    });
  } catch (error) {
    if (!apply) throw error;
    if (state?.pending?.status === 'started') {
      state = markDispatchUnknown(state);
      state = notifyOnce({
        config,
        state,
        key: `resume_outcome_unknown:${state.pending.wakeId}`,
        message: `Two-Mac wake ${state.pending.wakeId} has an unknown resume outcome; no automatic retry will run.`,
        dataRoot,
        run,
      });
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
      return tickResult(config, {
        action: 'resume_outcome_unknown',
        commentId: state.pending.commentId,
        wakeId: state.pending.wakeId,
      });
    }
    const code = classifyOperationalError(error);
    const attention = {
      code,
      commentId: state?.lastScannedCommentId ?? '0',
      commentUrl: null,
      wakeId: state?.pending?.wakeId ?? null,
      createdAt: now().toISOString(),
    };
    if (state !== null) {
      state = { ...state, attention };
      state = notifyOnce({
        config,
        state,
        key: `${attention.code}:${attention.commentId}`,
        message: `Two-Mac wake gate needs attention: ${attention.code}.`,
        dataRoot,
        run,
      });
      atomicWriteJson(statePath, validateWakeGateState(state, config.machine));
    } else {
      writeAttention(dataRoot, attention, `Two-Mac wake gate needs attention: ${attention.code}.`);
      notify(config, `Two-Mac wake gate needs attention: ${attention.code}.`, run);
    }
    return tickResult(config, { action: 'attention', attention });
  } finally {
    release?.();
  }
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
    if (args.help) {
      process.stdout.write(USAGE);
      return;
    }
    const result = await runWakeGate({
      configPath: args.configPath,
      apply: args.run,
      recovery: {
        clearAttention: args.clearAttention,
        resolveOutcome: args.resolveOutcome,
        resolution: args.resolution,
      },
    });
    process.stdout.write(`${JSON.stringify(result)}\n`);
    if (['attention', 'blocked_attention', 'blocked_outcome_unknown', 'resume_outcome_unknown'].includes(result.action)) {
      process.exitCode = 2;
    }
  } catch (error) {
    process.stderr.write(`two-mac-wake-gate: ${error.message}\n`);
    process.exitCode = 2;
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  await main();
}

export { parseArgs };
