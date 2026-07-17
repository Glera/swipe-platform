#!/usr/bin/env node
// auto-review-collect.mjs — patch identity + isolated checkout for auto-review.
//
// Spec: docs/specs/dev-loop.md, section WS2 ("Patch identity", "Цикл v1").
//
// Purpose: collect the FULL patch identity (base -> working tree) of a repo as
// four separate layers, build an isolated detached worktree that reproduces the
// working-tree state for build/tests, and emit a JSON manifest describing it.
//
// HARD INVARIANT: the source worktree and its index are NEVER modified. This
// script only ever runs read-only git inspection commands against the source
// repo (diff / diff --cached / log / ls-files / merge-base / rev-parse /
// worktree list). No `git add`, `git stash`, `git checkout`, `git apply`, or
// any writing command is ever run in the source repo. All mutation happens
// inside a throwaway detached worktree created under the OS temp dir.
//
// Requirements: Node >= 20, ES modules, built-in modules only (no npm deps).
//
// Usage:
//   node scripts/auto-review-collect.mjs [--allow-large-binary <path>]... <repo-path>
//       -> collects the patch, builds the isolated checkout, prints the JSON
//          manifest to stdout. The checkout is LEFT ON DISK for the reviewer.
//          --allow-large-binary (repeatable) opts a specific untracked binary
//          path (repo-relative) out of the >5MB fail-closed size exclusion;
//          admitted paths are recorded in the manifest as allowedLargeBinaries.
//   node scripts/auto-review-collect.mjs --cleanup <checkoutPath>
//       -> removes the isolated worktree (git worktree remove --force) on
//          behalf of its owning source repo.
//
// Exit codes:
//   0  success
//   2  aggregate text diff exceeds the 300 KB v1 limit (narrow the scope)
//   1  any other error

import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';

const TEXT_DIFF_LIMIT_BYTES = 300 * 1024; // v1 limit: 300 KB of reviewer text.
const BINARY_SNIFF_BYTES = 8000; // git's own NUL-sniff window.
// Full untracked content (text AND binary) is scanned for secrets up to this
// cap. A larger file cannot be fully scanned, so it is treated as suspicious
// and excluded fail-closed with reason "size"; a specific oversized BINARY may
// be opted back in with --allow-large-binary <path> (recorded in the manifest).
const SECRET_CONTENT_SCAN_LIMIT_BYTES = 5 * 1024 * 1024; // 5 MB.

// --- Secret guard: fail-closed deny-list (WS2 "secret guard (fail-closed)").
// Name rules match the file BASENAME, case-insensitively.
const SECRET_NAME_RULES = [
  (n) => n === '.env',
  (n) => n.startsWith('.env.'),
  (n) => n.endsWith('.pem'),
  (n) => n.endsWith('.key'),
  (n) => n.startsWith('id_rsa'),
  (n) => n.startsWith('credentials'),
  (n) => n.includes('token'),
  (n) => n.includes('secret'),
];
// Content rules scan the file content (decoded as latin1 so byte offsets are
// exact). The first five are the original v1 signatures; the rest widen the net
// per WS2 hardening (github PATs, JWTs, generic key/secret/token assignments,
// OpenSSH private keys, AWS secret env var, full Slack token family).
const SECRET_CONTENT_RULES = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /gho_[A-Za-z0-9]{20,}/,
  /xox[bp]-/,
  /sk-[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\./,
  /(?:api[_-]?key|secret|token|passw(?:or)?d|private[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_\-/+=]{16,}/i,
  /-----BEGIN OPENSSH PRIVATE KEY-----/,
  /AWS_SECRET_ACCESS_KEY/,
  /xox[abposr]-/,
];

// --- git helper that THROWS on non-zero exit (for the main flow). Binary-safe:
// returns a Buffer when opts.buffer is set, otherwise utf8 string.
function git(cwd, args, opts = {}) {
  return execFileSync('git', ['-C', cwd, ...args], {
    encoding: opts.buffer ? null : 'utf8',
    maxBuffer: 512 * 1024 * 1024,
    input: opts.input,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

// --- git helper that never throws; reports ok/out/status (for probing).
function gitTry(cwd, args) {
  try {
    const out = execFileSync('git', ['-C', cwd, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { ok: true, out, status: 0 };
  } catch (e) {
    return {
      ok: false,
      out: e.stdout ? e.stdout.toString() : '',
      err: e.stderr ? e.stderr.toString() : '',
      status: typeof e.status === 'number' ? e.status : 1,
    };
  }
}

function fail(msg, code = 1) {
  process.stderr.write(`auto-review-collect: ${msg}\n`);
  process.exit(code);
}

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

// --- git-style binary detection: a NUL byte within the first 8000 bytes.
function looksBinary(buf) {
  const n = Math.min(buf.length, BINARY_SNIFF_BYTES);
  for (let i = 0; i < n; i++) if (buf[i] === 0) return true;
  return false;
}

function isSecretName(basename) {
  const n = basename.toLowerCase();
  return SECRET_NAME_RULES.some((r) => r(n));
}
// Scan the FULL content (capped at the scan limit) for any secret signature.
// Applies to text AND binary buffers alike: latin1 decoding maps every byte
// 1:1, so ASCII secret signatures embedded in binary payloads still match.
function isSecretContent(buf) {
  const scan =
    buf.length > SECRET_CONTENT_SCAN_LIMIT_BYTES
      ? buf.slice(0, SECRET_CONTENT_SCAN_LIMIT_BYTES)
      : buf;
  const text = scan.toString('latin1');
  return SECRET_CONTENT_RULES.some((r) => r.test(text));
}

// --- Parse `git diff --numstat` output; binary files show as "-\t-\tpath".
// Returns the set of binary paths (v1: simple/unquoted paths; renames noted).
function binaryPathsFromNumstat(numstat) {
  const out = [];
  for (const raw of numstat.split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line) continue;
    const parts = line.split('\t');
    if (parts.length >= 3 && parts[0] === '-' && parts[1] === '-') {
      // For a rename git emits "old => new" or a 4th field; take the last path.
      let p = parts.slice(2).join('\t');
      const arrow = p.indexOf(' => ');
      if (arrow !== -1) p = p.slice(arrow + 4);
      out.push(p);
    }
  }
  return out;
}

// --- Parse `git diff --name-status -z` into [{status, path}] (rename -> new path).
function parseNameStatusZ(z) {
  const toks = z.split('\0').filter((t) => t.length > 0);
  const rows = [];
  for (let i = 0; i < toks.length; ) {
    const status = toks[i++];
    if (/^[RC]/.test(status)) {
      const from = toks[i++];
      const to = toks[i++];
      rows.push({ status, path: to, from });
    } else {
      rows.push({ status, path: toks[i++] });
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// Main collection flow.
// ---------------------------------------------------------------------------
function collect(repoPathArg, allowLargeBinaryPaths = new Set()) {
  const repo = path.resolve(process.cwd(), repoPathArg);
  if (!fs.existsSync(repo)) fail(`repo path does not exist: ${repo}`);
  if (!gitTry(repo, ['rev-parse', '--git-dir']).ok) {
    fail(`not a git repository: ${repo}`);
  }
  if (!gitTry(repo, ['rev-parse', '--verify', '--quiet', 'HEAD']).ok) {
    fail(`repo has no HEAD commit: ${repo}`);
  }

  // --- Determine upstream ref, then base = merge-base(HEAD, upstream).
  const refExists = (ref) =>
    gitTry(repo, ['rev-parse', '--verify', '--quiet', ref]).ok;

  // Precedence per WS2 ("base = merge-base HEAD <upstream>, where upstream is
  // the CONFIGURED tracking branch; master is only a fallback"):
  //   1. the configured @{upstream} tracking branch;
  //   2. origin/master, if no upstream is configured;
  //   3. local master — last-resort fallback, flagged with baseFallback.
  let upstream = null;
  let baseFallback = null;
  const up = gitTry(repo, [
    'rev-parse',
    '--abbrev-ref',
    '--symbolic-full-name',
    '@{upstream}',
  ]);
  const configuredUpstream = up.ok ? up.out.trim() : '';
  if (
    configuredUpstream &&
    !configuredUpstream.includes('@{upstream}') &&
    refExists(configuredUpstream)
  ) {
    upstream = configuredUpstream;
  } else if (refExists('origin/master')) {
    upstream = 'origin/master';
  } else if (refExists('master')) {
    upstream = 'master';
    baseFallback = 'local-master';
  } else {
    fail(
      'no upstream found: configured @{upstream}, origin/master, and local ' +
        'master are all absent — cannot determine patch base',
    );
  }

  const base = git(repo, ['merge-base', 'HEAD', upstream]).trim();
  if (!base) fail(`merge-base HEAD..${upstream} is empty`);

  // --- Layer 1: committed branch delta base..HEAD (list of sha + subject).
  const logOut = git(repo, [
    'log',
    '--reverse',
    '--format=%H%x1f%s',
    `${base}..HEAD`,
  ]);
  const commits = logOut
    .split('\n')
    .filter((l) => l.length > 0)
    .map((l) => {
      const idx = l.indexOf('\x1f');
      return { sha: l.slice(0, idx), subject: l.slice(idx + 1) };
    });

  // --- Layer 2/3: staged + unstaged name-status (reviewer-facing metadata).
  const staged = parseNameStatusZ(
    git(repo, ['diff', '--cached', '--name-status', '-z']),
  );
  const unstaged = parseNameStatusZ(
    git(repo, ['diff', '--name-status', '-z']),
  );

  // --- Text diffs (NO --binary => binary content excluded, shown as a stub).
  //     These feed both the reviewer text and the size limit.
  const commitsTextDiff = commits.length
    ? git(repo, ['diff', `${base}..HEAD`])
    : '';
  const stagedTextDiff = git(repo, ['diff', '--cached']);
  const unstagedTextDiff = git(repo, ['diff']);

  // --- Binary changed files (tracked) from numstat, hashed from disk/blob.
  const binaryManifest = [];
  const recordBinary = (p, layer, bytes) => {
    binaryManifest.push({
      path: p,
      layer,
      size: bytes.length,
      sha256: sha256(bytes),
    });
  };
  // Each layer must hash the blob that BELONGS to that layer, not whatever the
  // working tree currently holds — otherwise a staged-then-modified binary would
  // report the unstaged bytes for both layers.
  //   committed (base..HEAD): the content at HEAD   -> git show HEAD:<path>
  //   staged (index vs HEAD):  the content in index -> git show :<path>
  //   unstaged (working vs index) & untracked:       the working-tree file
  const hashFromBlob = (p, layer, blobref) => {
    try {
      recordBinary(p, layer, git(repo, ['show', blobref], { buffer: true }));
    } catch {
      /* deleted/unavailable in this layer: skip binary hash */
    }
  };
  const hashFromWorkingTree = (p, layer) => {
    const abs = path.join(repo, p);
    try {
      if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
        recordBinary(p, layer, fs.readFileSync(abs));
      }
    } catch {
      /* deleted/unavailable: skip binary hash */
    }
  };
  if (commits.length) {
    for (const p of binaryPathsFromNumstat(git(repo, ['diff', '--numstat', `${base}..HEAD`]))) {
      hashFromBlob(p, 'commits', `HEAD:${p}`);
    }
  }
  for (const p of binaryPathsFromNumstat(git(repo, ['diff', '--cached', '--numstat']))) {
    hashFromBlob(p, 'staged', `:${p}`);
  }
  for (const p of binaryPathsFromNumstat(git(repo, ['diff', '--numstat']))) {
    hashFromWorkingTree(p, 'unstaged');
  }

  // --- Layer 4: untracked files (respecting .gitignore). Each is classified:
  //     secret (excluded from everything), binary (manifest + copied bytes),
  //     or text (content joins the reviewer text + copied).
  const untrackedZ = git(repo, [
    'ls-files',
    '--others',
    '--exclude-standard',
    '-z',
  ]);
  const untrackedPaths = untrackedZ.split('\0').filter((t) => t.length > 0);

  const excludedSecrets = [];
  const allowedLargeBinaries = []; // >5MB binaries explicitly opted in via flag
  const untrackedReviewer = []; // non-secret untracked paths (text + binary)
  const untrackedCopy = []; // { path, binary } to copy into the checkout
  const untrackedTextParts = [];

  for (const p of untrackedPaths) {
    const abs = path.join(repo, p);
    let st;
    try {
      st = fs.lstatSync(abs);
    } catch {
      continue; // vanished between ls-files and stat
    }
    if (!st.isFile()) continue; // skip dirs/symlinks in v1
    const buf = fs.readFileSync(abs);
    const basename = path.basename(p);
    // Fail-closed exclusions, each recorded with a reason. Name rule wins
    // first; then the content scan (text AND binary — a credential embedded in
    // a binary payload must never reach the checkout); then the size cap.
    if (isSecretName(basename)) {
      excludedSecrets.push({ path: p, reason: 'name' });
      continue;
    }
    if (isSecretContent(buf)) {
      excludedSecrets.push({ path: p, reason: 'content' });
      continue; // fail-closed: never in reviewer text, never in checkout
    }
    const binary = looksBinary(buf);
    if (buf.length > SECRET_CONTENT_SCAN_LIMIT_BYTES) {
      // Too large to fully scan -> suspicious. Only a BINARY may be opted back
      // in, per explicit --allow-large-binary <path>; the content scan above
      // has still covered its first 5 MB.
      if (binary && allowLargeBinaryPaths.has(p)) {
        allowedLargeBinaries.push(p);
      } else {
        excludedSecrets.push({ path: p, reason: 'size' });
        continue;
      }
    }
    untrackedReviewer.push(p);
    untrackedCopy.push({ path: p, binary });
    if (binary) {
      recordBinary(p, 'untracked', buf);
    } else {
      untrackedTextParts.push(
        `# untracked (new file): ${p}\n` + buf.toString('utf8'),
      );
    }
  }

  // --- Aggregate reviewer text and enforce the 300 KB limit BEFORE creating
  //     any worktree, so an over-limit run leaves nothing to clean up.
  // Concatenate every layer's textual diff with explicit section headers. This
  // is the full reviewer-facing diff; it is both size-limited and persisted to
  // <tmpBase>/patch.diff so the skill can hand a real text diff to the reviewer.
  const sections = [];
  if (commitsTextDiff)
    sections.push('# ===== layer: commits (base..HEAD) =====\n' + commitsTextDiff);
  if (stagedTextDiff)
    sections.push('# ===== layer: staged (index) =====\n' + stagedTextDiff);
  if (unstagedTextDiff)
    sections.push('# ===== layer: unstaged (working tree) =====\n' + unstagedTextDiff);
  if (untrackedTextParts.length)
    sections.push(
      '# ===== layer: untracked (new files) =====\n' + untrackedTextParts.join('\n'),
    );
  const textDiff = sections.join('\n');
  const diffBytes = Buffer.byteLength(textDiff, 'utf8');
  if (diffBytes > TEXT_DIFF_LIMIT_BYTES) {
    fail(
      `aggregate text diff is ${diffBytes} bytes, over the ${TEXT_DIFF_LIMIT_BYTES}` +
        ' byte (300 KB) v1 limit. Narrow the scope (stage/commit less, split the' +
        ' change, or exclude generated files) and retry.',
      2,
    );
  }

  // --- Build the isolated detached checkout under the OS temp dir.
  const parent = fs.realpathSync(
    fs.mkdtempSync(path.join(os.tmpdir(), 'auto-review-')),
  );
  const checkoutPath = path.join(parent, 'checkout');
  // Persist the full text diff next to the checkout (removed together with the
  // temp parent on cleanup / on failure) so the reviewer gets a real diff file.
  const diffPath = path.join(parent, 'patch.diff');
  fs.writeFileSync(diffPath, textDiff);
  git(repo, ['worktree', 'add', '--detach', checkoutPath, base]);

  try {
    // Apply the three tracked layers in order (each --binary so binary bytes
    // land in the checkout), skipping empty patches.
    const applyLayer = (name, revArgs, cachedFlag) => {
      const patchArgs = ['diff', '--binary'];
      if (cachedFlag) patchArgs.push('--cached');
      if (revArgs) patchArgs.push(revArgs);
      const patch = git(repo, patchArgs, { buffer: true });
      if (patch.length === 0) return;
      git(checkoutPath, ['apply', '--binary', '--whitespace=nowarn'], {
        input: patch,
      });
    };
    if (commits.length) applyLayer('commits', `${base}..HEAD`, false);
    applyLayer('staged', null, true);
    applyLayer('unstaged', null, false);

    // Copy every non-secret untracked file (real bytes) into the checkout.
    for (const u of untrackedCopy) {
      const src = path.join(repo, u.path);
      const dst = path.join(checkoutPath, u.path);
      fs.mkdirSync(path.dirname(dst), { recursive: true });
      fs.copyFileSync(src, dst);
    }

    // Test-only seam: exercise the cleanup-on-failure path deterministically.
    if (process.env.AUTO_REVIEW_TEST_FAIL_AFTER_APPLY === '1') {
      throw new Error('injected post-apply failure (test seam)');
    }
  } catch (e) {
    // Failure after the worktree was registered: remove it so the SOURCE repo's
    // worktree registry is left clean, then propagate the error.
    try {
      git(repo, ['worktree', 'remove', '--force', checkoutPath]);
    } catch {
      /* best effort */
    }
    try {
      fs.rmSync(parent, { recursive: true, force: true });
    } catch {
      /* best effort */
    }
    fail(`failed to build isolated checkout: ${e.message}`);
  }

  const manifest = {
    tool: 'auto-review-collect',
    version: 1,
    repo,
    base,
    upstream,
    ...(baseFallback ? { baseFallback } : {}),
    layers: {
      commits, // [{sha, subject}]
      staged, // [{status, path, from?}]
      unstaged, // [{status, path, from?}]
      untracked: untrackedReviewer, // non-secret untracked paths (text + binary)
    },
    binaryManifest, // [{path, layer, size, sha256}] — content NOT in text diff
    excludedSecrets, // [{path, reason}] fail-closed; never in reviewer text/checkout
    allowedLargeBinaries, // >5MB binaries admitted via --allow-large-binary
    secretsOmittedFromCheckout: true, // secrets are omitted from the checkout too
    checkoutPath,
    diffPath, // full text diff of all layers, on disk next to the checkout
    diffBytes,
  };

  process.stdout.write(JSON.stringify(manifest, null, 2) + '\n');
}

// ---------------------------------------------------------------------------
// Cleanup mode.
// ---------------------------------------------------------------------------
function cleanup(checkoutPathArg) {
  const checkoutPath = path.resolve(process.cwd(), checkoutPathArg);
  if (!fs.existsSync(checkoutPath)) {
    fail(`checkout path does not exist: ${checkoutPath}`);
  }
  // Find the owning (main) worktree from the checkout's registry, then run
  // `git worktree remove` on its behalf (git refuses to remove the worktree
  // you are standing in, so we drive it from the main worktree).
  const list = gitTry(checkoutPath, ['worktree', 'list', '--porcelain']);
  if (!list.ok) fail(`not a git worktree: ${checkoutPath}`);
  const firstLine = list.out.split('\n').find((l) => l.startsWith('worktree '));
  if (!firstLine) fail(`cannot resolve owning worktree for: ${checkoutPath}`);
  const mainWorktree = firstLine.slice('worktree '.length);

  git(mainWorktree, ['worktree', 'remove', '--force', checkoutPath]);
  // Best-effort removal of the temp parent dir created by collect().
  try {
    const parent = path.dirname(checkoutPath);
    if (path.basename(checkoutPath) === 'checkout' && fs.existsSync(parent)) {
      fs.rmSync(parent, { recursive: true, force: true });
    }
  } catch {
    /* best effort */
  }
  process.stdout.write(`removed isolated checkout: ${checkoutPath}\n`);
}

// ---------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--cleanup') {
    if (!args[1]) fail('usage: auto-review-collect.mjs --cleanup <checkoutPath>');
    cleanup(args[1]);
    return;
  }
  const usage =
    'usage: auto-review-collect.mjs [--allow-large-binary <path>]... ' +
    '<repo-path> | --cleanup <checkoutPath>';
  const allowLargeBinaryPaths = new Set();
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--allow-large-binary') {
      if (!args[i + 1]) fail(usage);
      allowLargeBinaryPaths.add(args[++i]);
    } else if (args[i].startsWith('--')) {
      fail(usage);
    } else {
      positional.push(args[i]);
    }
  }
  if (positional.length !== 1) fail(usage);
  collect(positional[0], allowLargeBinaryPaths);
}

main();
