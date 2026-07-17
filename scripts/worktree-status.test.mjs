// worktree-status.test.mjs — deterministic tests on temporary fixture repos.
//
// Each fixture is a self-contained set of git repositories built in a fresh
// mkdtemp directory: a bare "origin" repo (so origin/master exists and the
// merged-logic is exercised against origin/master), a main working repo, and a
// set of linked worktrees in known states. The script is executed as a child
// process against the fixture repo path and its stdout is asserted.
//
// Run: node --test scripts/worktree-status.test.mjs   (from the workspace root)

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPT_DIR, 'worktree-status.mjs');

// Deterministic, isolated git environment (no global/system config, fixed identity/date).
const GIT_ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_SYSTEM: '/dev/null',
  GIT_AUTHOR_NAME: 'Fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.com',
  GIT_COMMITTER_NAME: 'Fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.com',
  GIT_AUTHOR_DATE: '2026-01-02T03:04:05 +0000',
  GIT_COMMITTER_DATE: '2026-01-02T03:04:05 +0000',
};

function git(cwd, ...args) {
  return execFileSync('git', ['-C', cwd, ...args], {
    env: GIT_ENV,
    encoding: 'utf8',
  });
}

function gitInit(dir, ...args) {
  return execFileSync('git', [...args], { env: GIT_ENV, encoding: 'utf8' });
}

function writeFile(p, content) {
  fs.writeFileSync(p, content);
}

function runScript(...repoPaths) {
  return execFileSync('node', [SCRIPT, ...repoPaths], {
    encoding: 'utf8',
    // stderr (warnings) separated from stdout.
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

// --- Build a fixture with a bare origin (origin/master) + main repo + worktrees.
function buildFixture() {
  // realpath so paths match git's porcelain output (macOS /var -> /private/var).
  const base = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'wt-status-')));
  const originDir = path.join(base, 'origin.git');
  const mainDir = path.join(base, 'main');

  // Bare origin repo.
  gitInit(base, '-c', 'init.defaultBranch=master', 'init', '--bare', originDir);

  // Main working repo with a first commit on master.
  gitInit(base, '-c', 'init.defaultBranch=master', 'init', mainDir);
  writeFile(path.join(mainDir, 'README.md'), 'hello\n');
  git(mainDir, 'add', 'README.md');
  git(mainDir, 'commit', '-m', 'initial');
  git(mainDir, 'remote', 'add', 'origin', originDir);
  git(mainDir, 'push', 'origin', 'master');
  // Establish the remote-tracking ref origin/master.
  git(mainDir, 'fetch', 'origin');

  const paths = {};

  // 1) clean + merged linked worktree (branch at master tip) -> should be suggested.
  paths.merged = path.join(base, 'wt-merged');
  git(mainDir, 'worktree', 'add', '-b', 'merged-branch', paths.merged, 'master');

  // 2) clean + merged worktree whose PATH contains a single quote -> exercises
  //    shell-quote escaping in the printed command.
  paths.quote = path.join(base, "wt-quo'te");
  git(mainDir, 'worktree', 'add', '-b', 'quote-branch', paths.quote, 'master');

  // 3) dirty worktree -> not suggested.
  paths.dirty = path.join(base, 'wt-dirty');
  git(mainDir, 'worktree', 'add', '-b', 'dirty-branch', paths.dirty, 'master');
  writeFile(path.join(paths.dirty, 'uncommitted.txt'), 'work in progress\n');

  // 4) locked worktree -> not suggested.
  paths.locked = path.join(base, 'wt-locked');
  git(mainDir, 'worktree', 'add', '-b', 'locked-branch', paths.locked, 'master');
  git(mainDir, 'worktree', 'lock', paths.locked);

  // 5) unmerged / ahead worktree (one extra commit) -> not suggested.
  paths.ahead = path.join(base, 'wt-ahead');
  git(mainDir, 'worktree', 'add', '-b', 'ahead-branch', paths.ahead, 'master');
  writeFile(path.join(paths.ahead, 'feature.txt'), 'new feature\n');
  git(paths.ahead, 'add', 'feature.txt');
  git(paths.ahead, 'commit', '-m', 'ahead commit');

  // 6) missing worktree (directory removed manually) -> prune recommendation.
  paths.missing = path.join(base, 'wt-missing');
  git(mainDir, 'worktree', 'add', '-b', 'missing-branch', paths.missing, 'master');
  fs.rmSync(paths.missing, { recursive: true, force: true });

  return { base, mainDir, paths };
}

let fx;
let stdout;

before(() => {
  fx = buildFixture();
  stdout = runScript(fx.mainDir);
});

after(() => {
  if (fx) fs.rmSync(fx.base, { recursive: true, force: true });
});

// Helper: lines within the "Safe to remove" section.
function removeSection(out) {
  const start = out.indexOf('Safe to remove (suggestions only):');
  const end = out.indexOf('Prunable (missing worktree dirs');
  return out.slice(start, end);
}
function pruneSection(out) {
  return out.slice(out.indexOf('Prunable (missing worktree dirs'));
}

test('1) main worktree is never suggested for removal', () => {
  const section = removeSection(stdout);
  assert.ok(
    !section.includes(`worktree remove '${fx.mainDir}'`),
    'main worktree path must not appear in remove suggestions',
  );
});

test('2) clean+merged linked worktree is suggested, with shell-quoted paths', () => {
  const section = removeSection(stdout);
  const expected = `git -C '${fx.mainDir}' worktree remove '${fx.paths.merged}'`;
  assert.ok(
    section.includes(expected),
    `expected suggestion line:\n${expected}\n--- got section ---\n${section}`,
  );
});

test('2b) single-quote in worktree path is escaped as \'\\\'\' in the command', () => {
  const section = removeSection(stdout);
  // fx.paths.quote contains a literal single quote; the printed command must
  // escape it. Build the expected escaped rendering.
  const escaped = fx.paths.quote.replace(/'/g, `'\\''`);
  const expected = `worktree remove '${escaped}'`;
  assert.ok(
    section.includes(expected),
    `expected escaped path in section:\n${expected}\n--- got ---\n${section}`,
  );
  // Sanity: the escape sequence is present.
  assert.ok(section.includes(`'\\''`), 'escape sequence \'\\\'\' must be present');
});

test('3) dirty worktree is not suggested', () => {
  const section = removeSection(stdout);
  assert.ok(
    !section.includes(`worktree remove '${fx.paths.dirty}'`),
    'dirty worktree must not be suggested',
  );
});

test('4) locked worktree is not suggested', () => {
  const section = removeSection(stdout);
  assert.ok(
    !section.includes(`worktree remove '${fx.paths.locked}'`),
    'locked worktree must not be suggested',
  );
});

test('5) unmerged (ahead) worktree is not suggested', () => {
  const section = removeSection(stdout);
  assert.ok(
    !section.includes(`worktree remove '${fx.paths.ahead}'`),
    'ahead/unmerged worktree must not be suggested',
  );
});

test('6) missing worktree dir gets a prune recommendation, not remove', () => {
  const remove = removeSection(stdout);
  const prune = pruneSection(stdout);
  assert.ok(
    !remove.includes(`worktree remove '${fx.paths.missing}'`),
    'missing worktree must NOT get a remove suggestion',
  );
  const expectedPrune = `git -C '${fx.mainDir}' worktree prune`;
  assert.ok(
    prune.includes(expectedPrune),
    `expected prune recommendation:\n${expectedPrune}\n--- got ---\n${prune}`,
  );
  assert.ok(
    prune.includes(fx.paths.missing),
    'prune section should reference the missing worktree path',
  );
});

test('7) rerun on unchanged fixture yields identical stdout and does not mutate git status', () => {
  const before = git(fx.mainDir, 'status', '--porcelain');
  const secondRun = runScript(fx.mainDir);
  const after = git(fx.mainDir, 'status', '--porcelain');

  assert.equal(secondRun, stdout, 'stdout must be identical across runs');
  assert.equal(before, after, 'git status of the fixture repo must be unchanged');
  assert.equal(after.trim(), '', 'fixture main repo must remain clean');
});
