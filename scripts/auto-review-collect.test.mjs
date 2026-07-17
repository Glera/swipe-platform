// auto-review-collect.test.mjs — deterministic tests on temporary fixture repos.
//
// Spec: docs/specs/dev-loop.md, WS2 "Приёмка — Детерминированная (обязательная)".
//
// Each fixture is a self-contained git repo (plus an optional bare origin) built
// in a fresh mkdtemp dir, driven into a known base/staged/unstaged/untracked/
// binary/secret state. The script is run as a child process and its JSON
// manifest / exit code / on-disk effects are asserted.
//
// Run: node --test scripts/auto-review-collect.test.mjs   (from the workspace root)

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPT_DIR, 'auto-review-collect.mjs');

// Deterministic, isolated git environment (no global/system config).
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
function gitInit(...args) {
  return execFileSync('git', args, { env: GIT_ENV, encoding: 'utf8' });
}
function write(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

// Run the collect script; return parsed manifest (throws on non-zero exit).
function runCollect(repoPath, extraEnv = {}) {
  const out = execFileSync('node', [SCRIPT, repoPath], {
    env: { ...GIT_ENV, ...extraEnv },
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  return JSON.parse(out);
}
// Run collect expecting failure; return { status, stderr }.
function runCollectExpectFail(repoPath, extraEnv = {}) {
  try {
    execFileSync('node', [SCRIPT, repoPath], {
      env: { ...GIT_ENV, ...extraEnv },
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stderr: '' };
  } catch (e) {
    return {
      status: typeof e.status === 'number' ? e.status : 1,
      stderr: e.stderr ? e.stderr.toString() : '',
    };
  }
}
function runCleanup(checkoutPath) {
  return execFileSync('node', [SCRIPT, '--cleanup', checkoutPath], {
    env: GIT_ENV,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

const BINARY_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x00, 0x01, 0x02, 0x00, 0xff, 0xfe, 0x7a, 0x00,
]); // contains NUL -> git-style binary.

// Two distinct binary blobs (both contain NUL) for the per-layer hashing test.
const BIN_A = Buffer.from([0x00, 0x11, 0x22, 0x33, 0x44]);
const BIN_B = Buffer.from([0x00, 0xaa, 0xbb, 0xcc, 0xdd, 0xee]);

// Build the primary fixture with all four layers + secrets + binary.
// Returns { base, main, checkout(after collect) }.
function buildMainFixture() {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'arc-main-')),
  );
  const originDir = path.join(base, 'origin.git');
  const main = path.join(base, 'main');

  gitInit('-c', 'init.defaultBranch=master', 'init', '--bare', originDir);
  gitInit('-c', 'init.defaultBranch=master', 'init', main);

  // Base commit (this becomes merge-base with origin/master).
  write(path.join(main, 'base.txt'), 'base\n');
  write(path.join(main, 'staged-target.txt'), 's0\n');
  write(path.join(main, 'unstaged-target.txt'), 'u0\n');
  git(main, 'add', '-A');
  git(main, 'commit', '-m', 'initial');
  git(main, 'remote', 'add', 'origin', originDir);
  git(main, 'push', 'origin', 'master');
  git(main, 'fetch', 'origin');

  // Layer 1: one commit on a feature branch ahead of origin/master.
  git(main, 'checkout', '-b', 'feature');
  write(path.join(main, 'committed.txt'), 'committed\n');
  write(path.join(main, 'base.txt'), 'base\nc1\n');
  git(main, 'add', '-A');
  git(main, 'commit', '-m', 'feature commit');

  // Layer 2: staged (index) change.
  write(path.join(main, 'staged-target.txt'), 's0\nstaged\n');
  git(main, 'add', 'staged-target.txt');

  // Layer 3: unstaged (working) change.
  write(path.join(main, 'unstaged-target.txt'), 'u0\nunstaged\n');

  // Layer 4: untracked text + binary; plus two secrets (name + content).
  write(path.join(main, 'untracked.txt'), 'new untracked\n');
  fs.writeFileSync(path.join(main, 'blob.bin'), BINARY_BYTES);
  write(path.join(main, '.env'), 'API_SECRET=supersecret\n');
  write(path.join(main, 'leak.txt'), 'aws = AKIAABCDEFGHIJKLMNOP done\n');

  return { base, main };
}

// ---------------------------------------------------------------------------
let fx; // primary fixture
let statusBefore;
let manifest;
let statusAfter;

before(() => {
  fx = buildMainFixture();
  statusBefore = git(fx.main, 'status', '--porcelain');
  manifest = runCollect(fx.main);
  statusAfter = git(fx.main, 'status', '--porcelain');
});

after(() => {
  try {
    if (manifest && manifest.checkoutPath && fs.existsSync(manifest.checkoutPath)) {
      runCleanup(manifest.checkoutPath);
    }
  } catch {
    /* ignore */
  }
  if (fx) fs.rmSync(fx.base, { recursive: true, force: true });
});

// (a) all four layers collected separately -----------------------------------
test('(a) four layers are captured separately', () => {
  assert.equal(manifest.upstream, 'origin/master');
  assert.equal(manifest.baseFallback, undefined);

  assert.equal(manifest.layers.commits.length, 1, 'one committed layer entry');
  assert.equal(manifest.layers.commits[0].subject, 'feature commit');
  assert.match(manifest.layers.commits[0].sha, /^[0-9a-f]{40}$/);

  assert.deepEqual(
    manifest.layers.staged.map((r) => `${r.status} ${r.path}`),
    ['M staged-target.txt'],
  );
  assert.deepEqual(
    manifest.layers.unstaged.map((r) => `${r.status} ${r.path}`),
    ['M unstaged-target.txt'],
  );
  assert.ok(
    manifest.layers.untracked.includes('untracked.txt'),
    'untracked text file listed',
  );
});

// (b) checkout reproduces the working tree; source repo untouched -------------
test('(b) checkout is build-identical to the working tree; source unchanged', () => {
  const co = manifest.checkoutPath;
  const targets = [
    'committed.txt', // layer 1 (commit)
    'base.txt', // layer 1 (commit modifies base)
    'staged-target.txt', // layer 2 (staged)
    'unstaged-target.txt', // layer 3 (unstaged)
    'untracked.txt', // layer 4 (untracked text)
  ];
  for (const rel of targets) {
    const inCheckout = fs.readFileSync(path.join(co, rel));
    const inWorking = fs.readFileSync(path.join(fx.main, rel));
    assert.ok(
      inCheckout.equals(inWorking),
      `${rel}: checkout bytes must equal working-tree bytes`,
    );
  }

  // Source worktree + index must be byte-identical before and after collect.
  assert.equal(
    statusAfter,
    statusBefore,
    'git status --porcelain of source repo must be unchanged',
  );
  assert.equal(
    git(fx.main, 'diff', '--cached', '--name-status'),
    'M\tstaged-target.txt\n',
    'source index (staged set) must be unchanged',
  );
});

// (c) secrets excluded from reviewer material AND from the checkout -----------
test('(c) .env and AKIA-content file are excluded and absent from checkout', () => {
  assert.ok(
    manifest.excludedSecrets.some((e) => e.path === '.env' && e.reason === 'name'),
    '.env excluded by name',
  );
  assert.ok(
    manifest.excludedSecrets.some((e) => e.path === 'leak.txt' && e.reason === 'content'),
    'leak.txt excluded by AKIA content rule',
  );
  assert.ok(
    !manifest.layers.untracked.includes('.env'),
    '.env not in reviewer untracked list',
  );
  assert.equal(manifest.secretsOmittedFromCheckout, true);

  const co = manifest.checkoutPath;
  assert.ok(!fs.existsSync(path.join(co, '.env')), '.env must not be in checkout');
  assert.ok(
    !fs.existsSync(path.join(co, 'leak.txt')),
    'leak.txt must not be in checkout',
  );
});

// (d) binary file recorded with sha256 and copied byte-for-byte --------------
test('(d) binary untracked file is in the manifest and copied verbatim', () => {
  const entry = manifest.binaryManifest.find((b) => b.path === 'blob.bin');
  assert.ok(entry, 'blob.bin present in binaryManifest');
  assert.equal(entry.layer, 'untracked');
  assert.equal(entry.size, BINARY_BYTES.length);
  assert.equal(entry.sha256, crypto.createHash('sha256').update(BINARY_BYTES).digest('hex'));

  const copied = fs.readFileSync(path.join(manifest.checkoutPath, 'blob.bin'));
  assert.ok(copied.equals(BINARY_BYTES), 'blob.bin copied byte-for-byte');
});

// (e) over-limit diff exits with code 2 --------------------------------------
test('(e) aggregate text diff over 300 KB exits with code 2', () => {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'arc-big-')),
  );
  const repo = path.join(base, 'r');
  gitInit('-c', 'init.defaultBranch=master', 'init', repo);
  write(path.join(repo, 'seed.txt'), 'seed\n');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', 'seed');
  // 400 KB untracked text file -> reviewer text over the 300 KB limit.
  fs.writeFileSync(path.join(repo, 'big.txt'), 'x'.repeat(400 * 1024));

  const wtBefore = git(repo, 'worktree', 'list', '--porcelain');
  const res = runCollectExpectFail(repo);
  const wtAfter = git(repo, 'worktree', 'list', '--porcelain');

  assert.equal(res.status, 2, 'exit code must be 2 for over-limit diff');
  assert.match(res.stderr, /300 KB|limit/i);
  assert.equal(wtBefore, wtAfter, 'no worktree registered for an over-limit run');

  fs.rmSync(base, { recursive: true, force: true });
});

// (f) apply/build failure leaves no garbage in the source repo ---------------
test('(f) failure while building the checkout leaves the source repo clean', () => {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'arc-fail-')),
  );
  const repo = path.join(base, 'r');
  gitInit('-c', 'init.defaultBranch=master', 'init', repo);
  write(path.join(repo, 'f.txt'), 'a\n');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', 'init');
  write(path.join(repo, 'f.txt'), 'a\nb\n'); // an unstaged change to apply

  const statusPre = git(repo, 'status', '--porcelain');
  const wtPre = git(repo, 'worktree', 'list', '--porcelain');

  // Inject a failure AFTER the worktree is added + layers applied.
  const res = runCollectExpectFail(repo, { AUTO_REVIEW_TEST_FAIL_AFTER_APPLY: '1' });

  const statusPost = git(repo, 'status', '--porcelain');
  const wtPost = git(repo, 'worktree', 'list', '--porcelain');

  assert.notEqual(res.status, 0, 'injected failure must produce a non-zero exit');
  assert.equal(statusPost, statusPre, 'source status must be unchanged');
  assert.equal(
    wtPost,
    wtPre,
    'no leaked worktree registration in the source repo after failure',
  );

  fs.rmSync(base, { recursive: true, force: true });
});

// (g) local-master fallback is flagged in the manifest -----------------------
test('(g) local-master fallback is recorded when no origin/upstream exists', () => {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'arc-fallback-')),
  );
  const repo = path.join(base, 'r'); // no origin, no tracking branch
  gitInit('-c', 'init.defaultBranch=master', 'init', repo);
  write(path.join(repo, 'a.txt'), 'a\n');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', 'base');
  git(repo, 'checkout', '-b', 'feature');
  write(path.join(repo, 'b.txt'), 'b\n');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', 'feature work');

  const m = runCollect(repo);
  assert.equal(m.upstream, 'master');
  assert.equal(m.baseFallback, 'local-master');
  assert.equal(m.layers.commits.length, 1);

  try {
    if (m.checkoutPath && fs.existsSync(m.checkoutPath)) runCleanup(m.checkoutPath);
  } catch {
    /* ignore */
  }
  fs.rmSync(base, { recursive: true, force: true });
});

// (h) base is taken from the CONFIGURED upstream, not origin/master ----------
test('(h) base is computed from the configured upstream (origin/feature)', () => {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'arc-upstream-')),
  );
  const originDir = path.join(base, 'origin.git');
  const main = path.join(base, 'main');
  gitInit('-c', 'init.defaultBranch=master', 'init', '--bare', originDir);
  gitInit('-c', 'init.defaultBranch=master', 'init', main);

  // commit A on master -> origin/master.
  write(path.join(main, 'a.txt'), 'a\n');
  git(main, 'add', '-A');
  git(main, 'commit', '-m', 'A initial');
  git(main, 'remote', 'add', 'origin', originDir);
  git(main, 'push', 'origin', 'master');

  // commit B on feature (one ahead of master) -> origin/feature.
  git(main, 'checkout', '-b', 'feature');
  write(path.join(main, 'b.txt'), 'b\n');
  git(main, 'add', '-A');
  git(main, 'commit', '-m', 'B feature base');
  git(main, 'push', 'origin', 'feature');
  git(main, 'fetch', 'origin');
  const shaB = git(main, 'rev-parse', 'HEAD').trim();

  // local branch `work` tracking origin/feature, with one commit C ahead.
  git(main, 'checkout', '-b', 'work', 'origin/feature');
  git(main, 'branch', '--set-upstream-to=origin/feature', 'work');
  write(path.join(main, 'c.txt'), 'c\n');
  git(main, 'add', '-A');
  git(main, 'commit', '-m', 'C work commit');

  const m = runCollect(main);
  // If precedence were wrong (origin/master first) base would be A and two
  // commits (B, C) would show; the correct upstream yields base=B and only C.
  assert.equal(m.upstream, 'origin/feature', 'configured upstream must win');
  assert.equal(m.base, shaB, 'base must be merge-base with origin/feature (B)');
  assert.equal(m.layers.commits.length, 1, 'only commit C is ahead of upstream');
  assert.equal(m.layers.commits[0].subject, 'C work commit');
  assert.equal(m.baseFallback, undefined);

  try {
    if (m.checkoutPath && fs.existsSync(m.checkoutPath)) runCleanup(m.checkoutPath);
  } catch {
    /* ignore */
  }
  fs.rmSync(base, { recursive: true, force: true });
});

// (i) secret guard: full-content scan + expanded signatures + size fail-closed
test('(i) secret guard scans full content, catches expanded signatures, excludes oversize', () => {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'arc-secret-')),
  );
  const repo = path.join(base, 'r');
  gitInit('-c', 'init.defaultBranch=master', 'init', repo);
  write(path.join(repo, 'seed.txt'), 'seed\n');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', 'seed');

  // secret AFTER a >4KB innocuous prefix (old scanner only saw the first 4KB).
  write(path.join(repo, 'deep.txt'), 'a'.repeat(5000) + '\nghp_' + 'A'.repeat(25) + '\n');
  // github_pat_ signature.
  write(path.join(repo, 'pat.txt'), 'x = github_pat_' + 'B'.repeat(24) + '\n');
  // JWT.
  write(path.join(repo, 'jwt.txt'), 'auth eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NX0.sig\n');
  // generic API_KEY assignment.
  write(path.join(repo, 'config.txt'), 'API_KEY="0123456789abcdef0123"\n');
  // benign prose that merely mentions "token" -> must NOT be excluded.
  write(path.join(repo, 'notes.txt'), 'the token stream parser handles the token buffer\n');
  // oversized text file -> excluded fail-closed with reason "size".
  fs.writeFileSync(path.join(repo, 'huge.txt'), 'x'.repeat(6 * 1024 * 1024));

  const m = runCollect(repo);
  const reason = Object.fromEntries(m.excludedSecrets.map((e) => [e.path, e.reason]));
  assert.equal(reason['deep.txt'], 'content', 'secret past the 4KB prefix is caught');
  assert.equal(reason['pat.txt'], 'content', 'github_pat_ is caught');
  assert.equal(reason['jwt.txt'], 'content', 'JWT is caught');
  assert.equal(reason['config.txt'], 'content', 'generic API_KEY= is caught');
  assert.equal(reason['huge.txt'], 'size', 'oversized text file excluded with reason size');
  assert.ok(!('notes.txt' in reason), 'benign prose with the word token is not excluded');
  assert.ok(m.layers.untracked.includes('notes.txt'), 'benign file reaches the reviewer');

  for (const name of ['deep.txt', 'pat.txt', 'jwt.txt', 'config.txt', 'huge.txt']) {
    assert.ok(
      !fs.existsSync(path.join(m.checkoutPath, name)),
      `${name} must be absent from the checkout`,
    );
  }

  try {
    if (m.checkoutPath && fs.existsSync(m.checkoutPath)) runCleanup(m.checkoutPath);
  } catch {
    /* ignore */
  }
  fs.rmSync(base, { recursive: true, force: true });
});

// (j) diffPath exists and contains every layer's changes ----------------------
test('(j) manifest.diffPath is a file containing all layers', () => {
  assert.ok(manifest.diffPath, 'manifest exposes diffPath');
  assert.ok(fs.existsSync(manifest.diffPath), 'diffPath file exists on disk');
  const diff = fs.readFileSync(manifest.diffPath, 'utf8');
  assert.match(diff, /layer: commits/);
  assert.match(diff, /committed\.txt/, 'committed layer present');
  assert.match(diff, /layer: staged/);
  assert.match(diff, /staged-target\.txt/, 'staged layer present');
  assert.match(diff, /\+staged/, 'staged content line present');
  assert.match(diff, /layer: unstaged/);
  assert.match(diff, /unstaged-target\.txt/, 'unstaged layer present');
  assert.match(diff, /\+unstaged/, 'unstaged content line present');
  assert.match(diff, /untracked\.txt/, 'untracked layer present');
});

// (k) staged-then-modified binary hashes the correct blob per layer -----------
test('(k) binary manifest hashes staged bytes and unstaged bytes separately', () => {
  const base = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'arc-binlayer-')),
  );
  const repo = path.join(base, 'r');
  gitInit('-c', 'init.defaultBranch=master', 'init', repo);
  write(path.join(repo, 'seed.txt'), 'seed\n');
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', 'seed');

  fs.writeFileSync(path.join(repo, 'blob.bin'), BIN_A); // will be staged as A
  git(repo, 'add', 'blob.bin'); // index (staged) holds bytes A
  fs.writeFileSync(path.join(repo, 'blob.bin'), BIN_B); // working tree holds bytes B

  const m = runCollect(repo);
  const staged = m.binaryManifest.find((b) => b.path === 'blob.bin' && b.layer === 'staged');
  const unstaged = m.binaryManifest.find((b) => b.path === 'blob.bin' && b.layer === 'unstaged');
  assert.ok(staged, 'staged binary entry present');
  assert.ok(unstaged, 'unstaged binary entry present');
  assert.equal(
    staged.sha256,
    crypto.createHash('sha256').update(BIN_A).digest('hex'),
    'staged layer hashes the index blob (A)',
  );
  assert.equal(staged.size, BIN_A.length);
  assert.equal(
    unstaged.sha256,
    crypto.createHash('sha256').update(BIN_B).digest('hex'),
    'unstaged layer hashes the working-tree blob (B)',
  );
  assert.equal(unstaged.size, BIN_B.length);

  try {
    if (m.checkoutPath && fs.existsSync(m.checkoutPath)) runCleanup(m.checkoutPath);
  } catch {
    /* ignore */
  }
  fs.rmSync(base, { recursive: true, force: true });
});
