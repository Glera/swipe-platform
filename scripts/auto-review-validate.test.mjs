// auto-review-validate.test.mjs — tests for the disposition validator.
//
// Spec: docs/specs/dev-loop.md, WS2 step 5 (every finding ID needs exactly one
// disposition; rejected needs a reason; no stray/duplicate IDs).
//
// Run: node --test scripts/auto-review-validate.test.mjs   (from the workspace root)

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPT_DIR, 'auto-review-validate.mjs');

// Write `obj` as JSON to a temp file, run the validator, return {status,out,err}.
function run(obj) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'arv-'));
  const file = path.join(dir, 'disp.json');
  fs.writeFileSync(file, JSON.stringify(obj));
  try {
    const out = execFileSync('node', [SCRIPT, file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    return { status: 0, stdout: out, stderr: '' };
  } catch (e) {
    return {
      status: typeof e.status === 'number' ? e.status : 1,
      stdout: e.stdout ? e.stdout.toString() : '',
      stderr: e.stderr ? e.stderr.toString() : '',
    };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const F = (id) => ({
  id,
  severity: 'P2',
  file: 'src/a.js',
  line: 12,
  desc: 'off-by-one in the loop bound',
});
const VERIFY = [{ command: 'npm test', exitCode: 0 }];

test('valid full input: findings + dispositions + verify all well-formed', () => {
  const res = run({
    findings: [F('F001'), F('F002')],
    dispositions: [
      { id: 'F001', action: 'fixed' },
      { id: 'F002', action: 'rejected', reason: 'false positive: guarded above' },
    ],
    verify: [
      { command: 'npm test', exitCode: 0 },
      { command: 'npm run typecheck', exitCode: 0 },
    ],
  });
  assert.equal(res.status, 0, res.stderr);
  assert.match(res.stdout, /OK/);
  assert.match(res.stdout, /2 verify command\(s\)/);
});

test('invalid: a finding without a disposition fails (silent skip)', () => {
  const res = run({
    findings: [F('F001'), F('F002')],
    dispositions: [{ id: 'F001', action: 'fixed' }],
    verify: VERIFY,
  });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /F002 has no disposition/);
});

test('invalid: a rejected disposition without a reason fails', () => {
  const res = run({
    findings: [F('F001')],
    dispositions: [{ id: 'F001', action: 'rejected' }],
    verify: VERIFY,
  });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /missing a reason/);
});

test('invalid: duplicate and unknown dispositions fail', () => {
  const res = run({
    findings: [F('F001')],
    dispositions: [
      { id: 'F001', action: 'fixed' },
      { id: 'F001', action: 'fixed' },
      { id: 'F999', action: 'fixed' },
    ],
    verify: VERIFY,
  });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /exactly one/);
  assert.match(res.stderr, /unknown finding id: F999/);
});

test('invalid: malformed finding id (not ^F\\d{3,}$) fails', () => {
  const res = run({
    findings: [{ ...F('F001'), id: 'bug-1' }],
    dispositions: [{ id: 'bug-1', action: 'fixed' }],
    verify: VERIFY,
  });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /malformed id "bug-1"/);
});

test('invalid: missing severity / bad line / empty desc fail with a list', () => {
  const res = run({
    findings: [{ id: 'F001', file: 'src/a.js', line: 0, desc: '' }],
    dispositions: [{ id: 'F001', action: 'fixed' }],
    verify: VERIFY,
  });
  assert.equal(res.status, 1);
  assert.match(res.stderr, /severity null invalid \(want P1\|P2\|P3\)/);
  assert.match(res.stderr, /line 0 must be an integer >= 1/);
  assert.match(res.stderr, /desc must be a non-empty string/);
});

test('invalid: missing or empty verify section fails', () => {
  const missing = run({
    findings: [F('F001')],
    dispositions: [{ id: 'F001', action: 'fixed' }],
  });
  assert.equal(missing.status, 1);
  assert.match(missing.stderr, /`verify` must be a non-empty array/);

  const empty = run({
    findings: [F('F001')],
    dispositions: [{ id: 'F001', action: 'fixed' }],
    verify: [],
  });
  assert.equal(empty.status, 1);
  assert.match(empty.stderr, /`verify` must be a non-empty array/);

  const badEntry = run({
    findings: [F('F001')],
    dispositions: [{ id: 'F001', action: 'fixed' }],
    verify: [{ command: '', exitCode: 'zero' }],
  });
  assert.equal(badEntry.status, 1);
  assert.match(badEntry.stderr, /verify\[0\]: command must be a non-empty string/);
  assert.match(badEntry.stderr, /verify\[0\]: exitCode "zero" must be an integer/);
});
