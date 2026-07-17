import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

// Enforcing gate: the meta-repo has no remote/CI, so docs-boundary-lint runs
// here as part of `node --test scripts/*.test.mjs`. This asserts the real
// root CLAUDE.md stays free of mutable-status claims (their authority is
// Alembic/CI/IMPLEMENTATION-STATUS.md — see AGENTS.md), and that the lint
// still fires on the phrasings we split out, without hitting durable gate forms.

const script = fileURLToPath(new URL('./docs-boundary-lint.mjs', import.meta.url));
const claudeMd = fileURLToPath(new URL('../CLAUDE.md', import.meta.url));

const run = (args) =>
  spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });

test('root CLAUDE.md is free of mutable-status claims', () => {
  const r = run([claudeMd]);
  assert.equal(r.status, 0, `docs-boundary-lint flagged CLAUDE.md:\n${r.stdout}`);
});

test('lint fires on status phrasings but not on durable gate forms', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'docs-lint-'));
  try {
    const bad = path.join(dir, 'bad.md');
    writeFileSync(
      bad,
      [
        'a: this path passed local HTTP+PostgreSQL E2E',
        'b: the E2E passes end to end',
        'c: tests are green now',
        'd: текущий migration head is 0040',
      ].join('\n'),
    );
    const rb = run([bad]);
    assert.equal(rb.status, 1, 'expected violations in bad.md');
    assert.match(rb.stdout, /E2E/);

    const good = path.join(dir, 'good.md');
    writeFileSync(
      good,
      [
        'levelSeries=false until the full manifest-bound E2E is green.',
        'a server-owned release registry proves their mapping to a digest.',
        'the E2E closure is a coverage contract (run status with CI, not here).',
      ].join('\n'),
    );
    const rg = run([good]);
    assert.equal(rg.status, 0, `durable gate forms wrongly flagged:\n${rg.stdout}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
