import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  REQUIRED_EVIDENCE_FILES,
  scanEvidence,
} from './platform-reliability-r1-evidence-scan.mjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'platform-reliability-r1-evidence-scan.mjs',
);

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-evidence-scan-'));
  for (const filename of REQUIRED_EVIDENCE_FILES) {
    fs.writeFileSync(
      path.join(root, filename),
      `${filename}\nstatus=pass\nsha256=${'a'.repeat(64)}\n`,
    );
  }
  return {
    root,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

test('scans the exact required evidence set and emits only hashes', () => {
  const files = fixture();
  try {
    const result = scanEvidence(files.root);
    assert.equal(result.status, 'pass');
    assert.equal(result.requiredFiles.length, REQUIRED_EVIDENCE_FILES.length);
    assert.equal(result.secretMatches, 0);
    assert.equal(result.exactIpv4Captured, false);
    assert.equal(result.secretsCaptured, false);
    assert.match(result.ruleSetSha256, /^[a-f0-9]{64}$/);
    for (const artifact of result.requiredFiles) {
      assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
      assert.equal(Object.hasOwn(artifact, 'content'), false);
    }

    const cli = JSON.parse(execFileSync(
      process.execPath,
      [SCRIPT, '--root', files.root],
      { encoding: 'utf8' },
    ));
    assert.deepEqual(cli, result);
  } finally {
    files.cleanup();
  }
});

test('rejects credential, host, raw identity, token, and IP forms without echoing them', () => {
  const cases = [
    ['postgres-url', 'postgresql://user:pw@db.example.test/swipe'],
    ['credentialed-url', 'https://alice:correct-horse@example.test/path'],
    ['render-postgres-host', 'db-name.oregon-postgres.render.com'],
    ['raw-credential-field', '{"password":"this-is-the-raw-password"}'],
    ['raw-identity-field', '{"username":"raw_operator_name"}'],
    ['github-token', `github_pat_${'A'.repeat(24)}`],
    ['openai-key', `sk-${'B'.repeat(24)}`],
    ['render-database-username', 'old user swipe_example_user_random'],
    ['literal-ipv4', 'operator cidr 203.0.113.42/32'],
  ];

  for (const [label, secret] of cases) {
    const files = fixture();
    const target = path.join(files.root, REQUIRED_EVIDENCE_FILES[0]);
    fs.writeFileSync(target, `safe prefix\n${secret}\nsafe suffix\n`);
    try {
      let observed;
      assert.throws(
        () => scanEvidence(files.root),
        (error) => {
          observed = error.message;
          return /secret hygiene rule/.test(error.message);
        },
        label,
      );
      assert.equal(observed.includes(secret), false, `${label} leaked in error`);
    } finally {
      files.cleanup();
    }
  }
});

test('fails closed for missing, linked, binary, and oversized artifacts', () => {
  {
    const files = fixture();
    fs.rmSync(path.join(files.root, REQUIRED_EVIDENCE_FILES[0]));
    try {
      assert.throws(
        () => scanEvidence(files.root),
        /required artifact is missing/,
      );
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    const target = path.join(files.root, 'target');
    const artifact = path.join(files.root, REQUIRED_EVIDENCE_FILES[0]);
    fs.writeFileSync(target, 'safe');
    fs.rmSync(artifact);
    fs.symlinkSync(target, artifact);
    try {
      assert.throws(
        () => scanEvidence(files.root),
        /not a singly linked regular file/,
      );
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    fs.writeFileSync(
      path.join(files.root, REQUIRED_EVIDENCE_FILES[0]),
      Buffer.from([0x73, 0x61, 0x66, 0x65, 0x00]),
    );
    try {
      assert.throws(() => scanEvidence(files.root), /binary NUL bytes/);
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    fs.writeFileSync(
      path.join(files.root, REQUIRED_EVIDENCE_FILES[0]),
      Buffer.alloc(5 * 1024 * 1024 + 1, 0x61),
    );
    try {
      assert.throws(() => scanEvidence(files.root), /size is outside/);
    } finally {
      files.cleanup();
    }
  }
});

test('CLI rejects malformed arguments before reading evidence', () => {
  assert.throws(
    () => execFileSync(process.execPath, [SCRIPT, '--typo', '.'], {
      encoding: 'utf8',
    }),
    /usage:/,
  );
});
