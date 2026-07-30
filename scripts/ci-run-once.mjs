#!/usr/bin/env node
// ci-run-once.mjs — exact-SHA guard for manual GitHub Actions dispatches.
//
// Dry-run by default. A workflow_dispatch is allowed only with --apply, when:
// - no run for the same repository + workflow + exact commit SHA exists; and
// - the remote branch still resolves to that exact SHA.
//
// Existing failed/cancelled runs are never replaced with a fresh dispatch.
// The helper prints a gh rerun command instead. All subprocesses use argument
// arrays (no shell), and every GitHub/API error fails closed.
//
// Requirements: Node >= 20, git, gh authenticated for the target repository.

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ACTIVE_STATUSES = new Set([
  'queued',
  'in_progress',
  'waiting',
  'requested',
  'pending',
]);

const FAILED_CONCLUSIONS = new Set([
  'failure',
  'timed_out',
  'startup_failure',
  'stale',
]);

const USAGE = `Usage:
  node scripts/ci-run-once.mjs --repo OWNER/REPO --workflow WORKFLOW [options]

Options:
  --apply             Dispatch when no exact-SHA run exists (default: dry-run)
  --ref BRANCH        Remote branch to dispatch (default: current branch)
  --sha SHA           Exact local commit to guard (default: HEAD)
  -h, --help          Show this help

Examples:
  node scripts/ci-run-once.mjs \\
    --repo Glera/swipe-backend \\
    --workflow postgres-acceptance.yml

  node scripts/ci-run-once.mjs \\
    --repo Glera/swipe-backend \\
    --workflow postgres-acceptance.yml \\
    --apply
`;

function defaultExecute(command, args, { cwd }) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return {
    status:
      typeof result.status === 'number'
        ? result.status
        : 1,
    stdout: result.stdout || '',
    stderr:
      result.stderr ||
      (result.error ? result.error.message : ''),
  };
}

function takeValue(argv, index, option) {
  const value = argv[index + 1];
  if (value === undefined || value.startsWith('--')) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

export function parseArgs(argv) {
  const parsed = {
    apply: false,
    help: false,
    repo: null,
    workflow: null,
    ref: null,
    sha: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') {
      parsed.apply = true;
    } else if (arg === '--help' || arg === '-h') {
      parsed.help = true;
    } else if (arg === '--repo') {
      parsed.repo = takeValue(argv, index, '--repo');
      index += 1;
    } else if (arg === '--workflow') {
      parsed.workflow = takeValue(argv, index, '--workflow');
      index += 1;
    } else if (arg === '--ref') {
      parsed.ref = takeValue(argv, index, '--ref');
      index += 1;
    } else if (arg === '--sha') {
      parsed.sha = takeValue(argv, index, '--sha');
      index += 1;
    } else {
      throw new Error(`unknown option: ${arg}`);
    }
  }

  if (parsed.help) return parsed;
  if (!parsed.repo) throw new Error('--repo is required');
  if (!parsed.workflow) throw new Error('--workflow is required');

  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(parsed.repo)) {
    throw new Error('--repo must have the form OWNER/REPO');
  }
  if (
    parsed.workflow.length > 240 ||
    /[\0\r\n]/u.test(parsed.workflow)
  ) {
    throw new Error('--workflow contains unsupported characters');
  }
  if (parsed.ref) validateRef(parsed.ref);
  if (parsed.sha) parsed.sha = validateSha(parsed.sha);

  return parsed;
}

function validateRef(ref) {
  if (
    ref.length > 240 ||
    !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/u.test(ref) ||
    ref.includes('..') ||
    ref.includes('//') ||
    ref.includes('@{') ||
    ref.endsWith('/') ||
    ref.endsWith('.') ||
    ref.endsWith('.lock')
  ) {
    throw new Error(`unsupported branch ref: ${ref}`);
  }
  return ref;
}

function validateSha(sha) {
  const normalized = String(sha).trim().toLowerCase();
  if (!/^(?:[0-9a-f]{40}|[0-9a-f]{64})$/u.test(normalized)) {
    throw new Error(`expected a full commit SHA, got: ${sha}`);
  }
  return normalized;
}

function newestFirst(left, right) {
  const timeDelta =
    Date.parse(right.createdAt || '') - Date.parse(left.createdAt || '');
  if (Number.isFinite(timeDelta) && timeDelta !== 0) return timeDelta;
  return Number(right.databaseId || 0) - Number(left.databaseId || 0);
}

export function chooseExistingRun(runs) {
  const sorted = [...runs].sort(newestFirst);
  const active = sorted.find((run) => ACTIVE_STATUSES.has(run.status));
  if (active) return { kind: 'active', run: active };

  const success = sorted.find(
    (run) => run.status === 'completed' && run.conclusion === 'success',
  );
  if (success) return { kind: 'success', run: success };

  if (sorted.length > 0) {
    return { kind: 'terminal', run: sorted[0] };
  }
  return { kind: 'absent', run: null };
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

export function buildRerunCommand(run, repo) {
  const base = [
    'gh',
    'run',
    'rerun',
    String(run.databaseId),
  ];
  if (FAILED_CONCLUSIONS.has(run.conclusion)) base.push('--failed');
  base.push('--repo', repo);
  return base.map(shellQuote).join(' ');
}

function requireSuccess(result, label) {
  if (result.status !== 0) {
    const detail = result.stderr.trim() || result.stdout.trim() || 'unknown error';
    throw new Error(`${label} failed: ${detail}`);
  }
  return result.stdout.trim();
}

function resolveLocalContext(options, execute, cwd) {
  let ref = options.ref;
  if (!ref) {
    ref = requireSuccess(
      execute(
        'git',
        ['symbolic-ref', '--quiet', '--short', 'HEAD'],
        { cwd },
      ),
      'resolving current branch',
    );
  }
  validateRef(ref);

  let sha = options.sha;
  if (!sha) {
    sha = requireSuccess(
      execute('git', ['rev-parse', 'HEAD'], { cwd }),
      'resolving HEAD',
    );
  }
  return { ref, sha: validateSha(sha) };
}

function listRuns({ repo, workflow, sha }, execute, cwd) {
  const output = requireSuccess(
    execute(
      'gh',
      [
        'run',
        'list',
        '--repo',
        repo,
        '--workflow',
        workflow,
        '--commit',
        sha,
        '--limit',
        '100',
        '--json',
        'databaseId,status,conclusion,url,createdAt,event,headSha,headBranch',
      ],
      { cwd },
    ),
    'listing exact-SHA workflow runs',
  );

  let parsed;
  try {
    parsed = JSON.parse(output || '[]');
  } catch {
    throw new Error('GitHub returned invalid JSON while listing workflow runs');
  }
  if (!Array.isArray(parsed)) {
    throw new Error('GitHub run-list response must be an array');
  }

  return parsed.filter(
    (run) =>
      typeof run === 'object' &&
      run !== null &&
      String(run.headSha || '').toLowerCase() === sha,
  );
}

function resolveRemoteSha({ repo, ref }, execute, cwd) {
  const output = requireSuccess(
    execute(
      'gh',
      [
        'api',
        `repos/${repo}/git/ref/heads/${ref}`,
        '--jq',
        '.object.sha',
      ],
      { cwd },
    ),
    `resolving remote branch ${repo}:${ref}`,
  );
  return validateSha(output);
}

function runLabel(run) {
  const identity = run.url || `run #${run.databaseId}`;
  const conclusion = run.conclusion ? `/${run.conclusion}` : '';
  return `${identity} (${run.status}${conclusion})`;
}

function reportExisting(decision, repo, writeOut) {
  if (decision.kind === 'active') {
    writeOut(`REUSE: exact-SHA run is already active: ${runLabel(decision.run)}\n`);
    return 0;
  }
  if (decision.kind === 'success') {
    writeOut(`REUSE: exact-SHA run already succeeded: ${runLabel(decision.run)}\n`);
    return 0;
  }

  writeOut(`STOP: exact-SHA run already exists: ${runLabel(decision.run)}\n`);
  if (
    FAILED_CONCLUSIONS.has(decision.run.conclusion) ||
    decision.run.conclusion === 'cancelled'
  ) {
    writeOut(`Reuse it instead of dispatching a new run:\n${buildRerunCommand(decision.run, repo)}\n`);
  } else {
    writeOut('Inspect the existing run; a new dispatch for this SHA is blocked.\n');
  }
  return 2;
}

async function runGuard(options, dependencies) {
  const {
    execute,
    cwd,
    writeOut,
  } = dependencies;
  const local = resolveLocalContext(options, execute, cwd);
  const target = {
    repo: options.repo,
    workflow: options.workflow,
    ref: local.ref,
    sha: local.sha,
  };

  const firstDecision = chooseExistingRun(listRuns(target, execute, cwd));
  if (firstDecision.kind !== 'absent') {
    return reportExisting(firstDecision, target.repo, writeOut);
  }

  const firstRemoteSha = resolveRemoteSha(target, execute, cwd);
  if (firstRemoteSha !== target.sha) {
    throw new Error(
      `remote branch ${target.repo}:${target.ref} points to ${firstRemoteSha}, not ${target.sha}; push the intended SHA first`,
    );
  }

  const dispatchCommand = [
    'gh',
    'workflow',
    'run',
    target.workflow,
    '--repo',
    target.repo,
    '--ref',
    target.ref,
  ];
  const renderedDispatch = dispatchCommand.map(shellQuote).join(' ');

  if (!options.apply) {
    writeOut(
      `DRY RUN: no ${target.workflow} run exists for ${target.sha}.\n` +
      `Remote ${target.ref} matches the exact SHA.\n` +
      `Would dispatch:\n${renderedDispatch}\n` +
      'Add --apply to execute.\n',
    );
    return 0;
  }

  // Re-check immediately before the mutation. This closes the common race in
  // which an automatic push/PR run appears during the initial preflight.
  const secondDecision = chooseExistingRun(listRuns(target, execute, cwd));
  if (secondDecision.kind !== 'absent') {
    return reportExisting(secondDecision, target.repo, writeOut);
  }

  const secondRemoteSha = resolveRemoteSha(target, execute, cwd);
  if (secondRemoteSha !== target.sha) {
    throw new Error(
      `remote branch moved during preflight: ${target.ref} now points to ${secondRemoteSha}, not ${target.sha}`,
    );
  }

  requireSuccess(
    execute('gh', dispatchCommand.slice(1), { cwd }),
    'dispatching workflow',
  );
  writeOut(
    `DISPATCHED: ${target.workflow} for ${target.repo}:${target.ref} at ${target.sha}.\n`,
  );
  return 0;
}

export async function runCli(
  argv,
  {
    execute = defaultExecute,
    cwd = process.cwd(),
    writeOut = (text) => process.stdout.write(text),
    writeErr = (text) => process.stderr.write(text),
  } = {},
) {
  try {
    const options = parseArgs(argv);
    if (options.help) {
      writeOut(USAGE);
      return 0;
    }
    return await runGuard(options, { execute, cwd, writeOut });
  } catch (error) {
    writeErr(`ERROR: ${error.message}\n`);
    return 1;
  }
}

const isEntrypoint =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isEntrypoint) {
  process.exitCode = await runCli(process.argv.slice(2));
}
