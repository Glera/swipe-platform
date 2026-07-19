#!/usr/bin/env node
// Installs the shared dev-loop pre-push hook (scripts/hooks/pre-push) into each
// swipe repo's git hooks dir. WARNING-only hook; never blocks a push.
//
// Idempotent: re-running refreshes our managed hook. Non-clobbering: if a repo
// already has a pre-push hook that is NOT ours, we skip it and report — never
// overwrite a foreign hook. Worktrees share the main repo's hooks dir, so
// installing per main repo also covers its worktrees.
//
// Usage: node scripts/install-dev-loop-hooks.mjs [--uninstall]

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, chmodSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(ROOT, 'scripts', 'hooks', 'pre-push');
const MARKER = 'dev-loop-managed-hook';
const REPOS = ['swipe-backend', 'swipe-generator', 'swipe-ugc', 'feed-prototype', 'playables'];
const uninstall = process.argv.includes('--uninstall');

const hooksDir = (repo) => {
  const abs = path.join(ROOT, repo);
  if (!existsSync(abs)) return null;
  try {
    const common = execFileSync('git', ['-C', abs, 'rev-parse', '--git-common-dir'], {
      encoding: 'utf8',
    }).trim();
    // git-common-dir may be relative to the repo root.
    const resolved = path.isAbsolute(common) ? common : path.join(abs, common);
    return path.join(resolved, 'hooks');
  } catch {
    return null;
  }
};

const source = readFileSync(SOURCE, 'utf8');
let installed = 0;
let skipped = 0;

for (const repo of REPOS) {
  const dir = hooksDir(repo);
  if (!dir) {
    console.log(`- ${repo}: not a git repo, skipped`);
    skipped += 1;
    continue;
  }
  const target = path.join(dir, 'pre-push');

  if (existsSync(target)) {
    const current = readFileSync(target, 'utf8');
    if (!current.includes(MARKER)) {
      console.log(`! ${repo}: existing NON-managed pre-push hook — left untouched`);
      skipped += 1;
      continue;
    }
    if (uninstall) {
      rmSync(target);
      console.log(`- ${repo}: managed hook removed`);
      installed += 1;
      continue;
    }
  } else if (uninstall) {
    console.log(`- ${repo}: no managed hook to remove`);
    continue;
  }

  writeFileSync(target, source);
  chmodSync(target, 0o755);
  console.log(`✓ ${repo}: pre-push hook ${uninstall ? 'reset' : 'installed'}`);
  installed += 1;
}

console.log(`\n${uninstall ? 'Removed' : 'Installed'} ${installed}, skipped ${skipped}.`);
