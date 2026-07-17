#!/usr/bin/env node
// worktree-status.mjs — read-only overview of git worktrees across workspace repos.
//
// Spec: swipe-backend/docs/specs/dev-loop.md, section WS1.
//
// Absolutely read-only: this script runs ONLY inspecting git commands
// (worktree list / status / rev-parse / merge-base / rev-list / show / log).
// It NEVER runs `git worktree remove`, `git worktree prune`, or any other
// mutating command. Removal / prune commands are printed as suggestions only.
//
// Requirements: Node >= 20, ES modules, built-in modules only (no npm deps).

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

// --- Default repositories (paths relative to the workspace root, which is the
// parent directory of scripts/). CLI arguments (a list of repo paths) override
// this default — needed for the deterministic fixture tests.
const DEFAULT_REPOS = [
  'feed-prototype',
  'swipe-generator',
  'swipe-backend',
  'swipe-ugc',
  'playables',
  'swipe-agents',
];

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(SCRIPT_DIR, '..');

// --- git helper: never throws, captures exit status + stdout/stderr.
function git(cwd, args) {
  try {
    const out = execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, out, err: '', status: 0 };
  } catch (e) {
    return {
      ok: false,
      out: e.stdout ? e.stdout.toString() : '',
      err: e.stderr ? e.stderr.toString() : '',
      status: typeof e.status === 'number' ? e.status : 1,
    };
  }
}

function warn(msg) {
  process.stderr.write(`WARNING: ${msg}\n`);
}

// --- shell-quote a path with single quotes; inner single quotes escaped as '\''
function shellQuote(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`;
}

// --- parse `git worktree list --porcelain` into entries.
function parseWorktrees(porcelain) {
  const entries = [];
  let cur = null;
  for (const raw of porcelain.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (line.startsWith('worktree ')) {
      if (cur) entries.push(cur);
      cur = {
        path: line.slice('worktree '.length),
        head: '',
        branchRef: '',
        detached: false,
        bare: false,
        locked: false,
        prunable: false,
      };
    } else if (!cur) {
      continue;
    } else if (line.startsWith('HEAD ')) {
      cur.head = line.slice('HEAD '.length);
    } else if (line.startsWith('branch ')) {
      cur.branchRef = line.slice('branch '.length);
    } else if (line === 'detached') {
      cur.detached = true;
    } else if (line === 'bare') {
      cur.bare = true;
    } else if (line === 'locked' || line.startsWith('locked ')) {
      cur.locked = true;
    } else if (line === 'prunable' || line.startsWith('prunable ')) {
      cur.prunable = true;
    }
  }
  if (cur) entries.push(cur);
  return entries;
}

// --- Detect whether a worktree is locked. Newer git (>= 2.36) emits a
// `locked` line in porcelain; older git (e.g. 2.17) does not, so fall back to
// the on-disk lock marker in the worktree's admin directory.
function detectLocked(entry) {
  if (entry.locked) return true;
  try {
    const dotgit = path.join(entry.path, '.git');
    if (!fs.existsSync(dotgit)) return false;
    if (!fs.statSync(dotgit).isFile()) return false; // main worktree: .git is a dir
    const content = fs.readFileSync(dotgit, 'utf8');
    const m = content.match(/^gitdir:\s*(.+?)\s*$/m);
    if (!m) return false;
    return fs.existsSync(path.join(m[1].trim(), 'locked'));
  } catch {
    return false;
  }
}

// --- analyze one repository; returns an array of row objects (or null on error).
function analyzeRepo(repoPath) {
  const abs = path.resolve(repoPath);
  const name = path.basename(abs);

  if (!fs.existsSync(abs)) {
    warn(`skipping ${abs}: path does not exist`);
    return null;
  }
  if (!git(abs, ['rev-parse', '--git-dir']).ok) {
    warn(`skipping ${abs}: not a git repository`);
    return null;
  }
  const wl = git(abs, ['worktree', 'list', '--porcelain']);
  if (!wl.ok) {
    warn(`skipping ${abs}: cannot list worktrees (${wl.err.trim()})`);
    return null;
  }

  const entries = parseWorktrees(wl.out);
  // Upstream reference: prefer origin/master if it exists in this repo.
  const hasOriginMaster = git(abs, [
    'rev-parse',
    '--verify',
    '--quiet',
    'origin/master',
  ]).ok;

  const rows = [];
  entries.forEach((e, idx) => {
    const isMain = idx === 0;
    const existsOnDisk = fs.existsSync(e.path);
    const missing = !existsOnDisk || e.prunable;

    // --- determine upstream for merged/ahead-behind computations.
    let upstream = null;
    if (hasOriginMaster) {
      upstream = 'origin/master';
    } else if (!missing) {
      const up = git(e.path, ['rev-parse', '--abbrev-ref', '@{upstream}']);
      const val = up.ok ? up.out.trim() : '';
      if (val && !val.includes('@{upstream}')) upstream = val;
    }

    // --- clean / dirty / missing.
    let state;
    if (missing) {
      state = 'missing';
    } else {
      const st = git(e.path, ['status', '--porcelain']);
      if (!st.ok) state = 'unknown';
      else state = st.out.trim() === '' ? 'clean' : 'dirty';
    }

    // --- merged + ahead/behind relative to upstream.
    let merged = 'unknown';
    let ahead = '?';
    let behind = '?';
    if (upstream && e.head && !e.bare) {
      const anc = git(abs, ['merge-base', '--is-ancestor', e.head, upstream]);
      merged = anc.ok ? 'yes' : 'no';
      const rl = git(abs, [
        'rev-list',
        '--left-right',
        '--count',
        `${upstream}...${e.head}`,
      ]);
      if (rl.ok) {
        const parts = rl.out.trim().split(/\s+/);
        if (parts.length >= 2) {
          behind = parts[0]; // commits in upstream not in HEAD
          ahead = parts[1]; // commits in HEAD not in upstream
        }
      }
    }

    // --- last commit date (ISO 8601), resolved from repo root by SHA so it
    //     works even if the worktree directory is missing.
    let date = '?';
    if (e.head && !e.bare) {
      const d = git(abs, ['show', '-s', '--format=%cI', e.head]);
      if (d.ok && d.out.trim()) date = d.out.trim();
    }

    // --- display branch.
    let branch;
    if (e.branchRef) branch = e.branchRef.replace(/^refs\/heads\//, '');
    else if (e.bare) branch = '(bare)';
    else if (e.detached) branch = `detached@${(e.head || '').slice(0, 7)}`;
    else branch = '?';

    rows.push({
      repo: name,
      repoRoot: abs,
      branch,
      path: e.path,
      state,
      merged,
      ahead,
      behind,
      date,
      isMain,
      locked: detectLocked(e),
      missing,
      detached: e.detached,
      bare: e.bare,
      upstream: upstream || 'unknown',
    });
  });

  return rows;
}

// --- removal suggestion criterion (all conditions simultaneously).
function isSafeToRemove(r) {
  return (
    r.state === 'clean' &&
    r.merged === 'yes' && // merged relative to upstream, not an undefined local master
    !r.isMain && // never the main worktree of the repo
    !r.locked &&
    !r.missing &&
    !(r.detached && r.merged !== 'yes') // detached commit must be reachable from upstream
  );
}

// --- render a fixed-width table.
function renderTable(rows) {
  const headers = [
    'repo',
    'branch',
    'state',
    'merged',
    'ahead/behind',
    'last commit',
    'path',
  ];
  const data = rows.map((r) => [
    r.repo,
    r.branch,
    r.state,
    r.merged,
    `${r.ahead}/${r.behind}`,
    r.date,
    r.path,
  ]);

  const widths = headers.map((h, i) =>
    Math.max(h.length, ...data.map((row) => row[i].length)),
  );
  const fmt = (cols) =>
    cols.map((c, i) => c.padEnd(widths[i])).join('  ').replace(/\s+$/, '');

  const lines = [];
  lines.push(fmt(headers));
  lines.push(widths.map((w) => '-'.repeat(w)).join('  ').replace(/\s+$/, ''));
  for (const row of data) lines.push(fmt(row));
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const repoPaths =
    args.length > 0
      ? args.map((a) => path.resolve(process.cwd(), a))
      : DEFAULT_REPOS.map((r) => path.join(WORKSPACE_ROOT, r));

  const allRows = [];
  for (const rp of repoPaths) {
    const rows = analyzeRepo(rp);
    if (rows) allRows.push(...rows);
  }

  const out = [];
  out.push('Worktree status (read-only)');
  out.push('');
  if (allRows.length === 0) {
    out.push('No worktrees found.');
  } else {
    out.push(renderTable(allRows));
  }
  out.push('');

  // --- safe-to-remove suggestions (commands are printed only, never run).
  const removable = allRows.filter(isSafeToRemove);
  out.push('Safe to remove (suggestions only):');
  if (removable.length === 0) {
    out.push('  None — no linked worktree meets all removal criteria.');
  } else {
    for (const r of removable) {
      out.push(
        `  git -C ${shellQuote(r.repoRoot)} worktree remove ${shellQuote(r.path)}`,
      );
    }
  }
  out.push('');

  // --- prunable / missing worktrees: recommend manual verification + prune,
  //     never an automatic removal.
  const prunable = allRows.filter((r) => r.missing && !r.isMain);
  out.push('Prunable (missing worktree dirs — verify manually, then prune):');
  if (prunable.length === 0) {
    out.push('  None — no missing/prunable worktree directories.');
  } else {
    for (const r of prunable) {
      out.push(
        `  git -C ${shellQuote(r.repoRoot)} worktree prune   # ${r.repo}: missing ${r.path}`,
      );
    }
  }
  out.push('');

  process.stdout.write(out.join('\n'));
}

main();
