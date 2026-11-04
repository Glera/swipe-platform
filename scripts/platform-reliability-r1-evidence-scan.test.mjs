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
import {
  makeValidFinalEvidence,
  makeValidOperatorReceipt,
} from './platform-reliability-r1-operator-receipt-test-fixture.mjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'platform-reliability-r1-evidence-scan.mjs',
);
const BASE_REF = 'master';

function git(root, args) {
  return execFileSync('git', ['-C', root, ...args], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-evidence-scan-'));
  git(root, ['init']);
  git(root, ['symbolic-ref', 'HEAD', 'refs/heads/master']);
  fs.writeFileSync(path.join(root, 'README.md'), 'fixture baseline\n');
  git(root, ['add', 'README.md']);
  git(root, [
    '-c',
    'user.name=R1 Test',
    '-c',
    'user.email=r1-test@example.invalid',
    'commit',
    '-m',
    'fixture baseline',
  ]);
  git(root, ['checkout', '-b', 'evidence']);

  for (const filename of REQUIRED_EVIDENCE_FILES) {
    const content = filename.endsWith('.json')
      ? `${JSON.stringify({
        schema: 'safe-receipt.v1',
        status: 'pass',
        sha256: 'a'.repeat(64),
      })}\n`
      : `${filename}\nstatus pass\nsha256 ${'a'.repeat(64)}\n`;
    fs.writeFileSync(path.join(root, filename), content);
  }
  fs.writeFileSync(
    path.join(root, 'platform-reliability-r1-operator-receipt.json'),
    `${JSON.stringify(makeValidOperatorReceipt())}\n`,
  );
  fs.writeFileSync(
    path.join(root, 'platform-reliability-r1-final-evidence.md'),
    makeValidFinalEvidence(),
  );
  return {
    root,
    cleanup() {
      fs.rmSync(root, { recursive: true, force: true });
    },
  };
}

function scan(root) {
  return scanEvidence(root, { baseRef: BASE_REF });
}

test('scans the exact git patch manifest and emits only hashes', () => {
  const files = fixture();
  try {
    const result = scan(files.root);
    assert.equal(result.status, 'pass');
    assert.equal(result.requiredFiles.length, REQUIRED_EVIDENCE_FILES.length);
    assert.equal(result.patchClosure.paths.length, REQUIRED_EVIDENCE_FILES.length);
    assert.equal(result.patchClosure.baseRef, BASE_REF);
    assert.match(result.patchClosure.mergeBaseSha, /^[a-f0-9]{40,64}$/);
    assert.equal(result.secretMatches, 0);
    assert.equal(result.exactIpv4Captured, false);
    assert.equal(result.secretsCaptured, false);
    assert.equal(result.operatorValidation.status, 'pass');
    assert.equal(result.operatorValidation.gateCount, 7);
    assert.equal(result.operatorValidation.completionRequirementCount, 12);
    assert.equal(result.operatorValidation.placeholdersResolved, true);
    assert.match(result.ruleSetSha256, /^[a-f0-9]{64}$/);
    assert.match(result.scannerSourceSha256, /^[a-f0-9]{64}$/);
    assert.match(result.operatorValidatorSourceSha256, /^[a-f0-9]{64}$/);
    for (const artifact of result.requiredFiles) {
      assert.match(artifact.sha256, /^[a-f0-9]{64}$/);
      assert.equal(Object.hasOwn(artifact, 'content'), false);
    }

    const cli = JSON.parse(execFileSync(
      process.execPath,
      [SCRIPT, '--root', files.root, '--base-ref', BASE_REF],
      { encoding: 'utf8' },
    ));
    assert.deepEqual(cli, result);
  } finally {
    files.cleanup();
  }
});

test('accepts complete operator evidence and the all-IPv4 sentinel', () => {
  const files = fixture();
  try {
    fs.writeFileSync(
      path.join(
        files.root,
        'platform-reliability-r1-0-snapshot-2-render-receipt.json',
      ),
      `${JSON.stringify({
        schema: 'safe-render-receipt.v1',
        preWindowRule: '0.0.0.0/0',
        secretsCaptured: false,
      })}\n`,
    );
    fs.writeFileSync(
      path.join(files.root, 'platform-reliability-r1-final-evidence.md'),
      [
        makeValidFinalEvidence(),
        'The previous all-IPv4 rule was replaced by a single-host rule and then',
        'an empty allowlist. Fresh internal database queries passed; a fresh',
        'external PostgreSQL protocol request was refused before SQL execution.',
        'Only SHA-256 identity digests are retained.',
        '',
      ].join('\n'),
    );

    assert.equal(scan(files.root).status, 'pass');
  } finally {
    files.cleanup();
  }
});

test('rejects an unexpected tracked or untracked artifact outside the manifest', () => {
  for (const [filename, commit] of [
    ['operator-debug.log', false],
    ['supporting-evidence.md', true],
  ]) {
    const files = fixture();
    try {
      fs.writeFileSync(path.join(files.root, filename), 'apparently safe\n');
      if (commit) {
        git(files.root, ['add', filename]);
        git(files.root, [
          '-c',
          'user.name=R1 Test',
          '-c',
          'user.email=r1-test@example.invalid',
          'commit',
          '-m',
          'unexpected evidence',
        ]);
      }
      assert.throws(
        () => scan(files.root),
        /git patch contains artifacts outside the evidence manifest/,
      );
    } finally {
      files.cleanup();
    }
  }
});

test('rejects credentials, identities, tokens, libpq forms, and IPs without echoing them', () => {
  const cases = [
    ['postgres-url', 'postgresql://user:pw@db.example.test/swipe'],
    ['credentialed-url', 'https://alice:correct-horse@example.test/path'],
    ['render-postgres-host', 'db-name.oregon-postgres.render.com'],
    ['libpq-password', 'password=p@ss'],
    ['libpq-user', 'host=db.example.test user=u'],
    ['pg-environment', 'PGPASSWORD=p@ss'],
    ['raw-identity-field', '{"username":"raw_operator_name"}'],
    ['github-token-ghp', `ghp_${'A'.repeat(24)}`],
    ['github-token-gho', `gho_${'A'.repeat(24)}`],
    ['github-token-ghu', `ghu_${'A'.repeat(24)}`],
    ['github-token-ghs', `ghs_${'A'.repeat(24)}`],
    ['github-token-ghr', `ghr_${'A'.repeat(24)}`],
    ['github-token-fine-grained', `github_pat_${'A'.repeat(24)}`],
    ['openai-key', `sk-${'B'.repeat(24)}`],
    ['render-database-username', 'old user swipe_example_user_random'],
    ['literal-ipv4', 'operator cidr 203.0.113.42/32'],
  ];

  for (const [label, secret] of cases) {
    const files = fixture();
    const target = path.join(
      files.root,
      'platform-reliability-r1-final-evidence.md',
    );
    fs.writeFileSync(target, `safe prefix\n${secret}\nsafe suffix\n`);
    try {
      let observed;
      assert.throws(
        () => scan(files.root),
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

test('parses JSON and rejects decoded escapes or sensitive keys', () => {
  const cases = [
    ['escaped-ip', '{"note":"203\\u002e0\\u002e113\\u002e42"}'],
    [
      'escaped-url',
      '{"note":"postgresql\\u003a\\u002f\\u002fuser\\u003apw\\u0040db.test/swipe"}',
    ],
    ['sensitive-string-key', '{"password":"short"}'],
    ['sensitive-non-string-key', '{"PGPASSWORD":false}'],
  ];

  for (const [label, content] of cases) {
    const files = fixture();
    fs.writeFileSync(
      path.join(
        files.root,
        'platform-reliability-r1-operator-receipt.json',
      ),
      `${content}\n`,
    );
    try {
      assert.throws(
        () => scan(files.root),
        /secret hygiene rule/,
        label,
      );
    } finally {
      files.cleanup();
    }
  }
});

test('fails closed for missing, linked, invalid JSON, binary, and oversized artifacts', () => {
  {
    const files = fixture();
    fs.rmSync(path.join(files.root, REQUIRED_EVIDENCE_FILES[0]));
    try {
      assert.throws(
        () => scan(files.root),
        /required artifact is (?:missing|outside the git patch)/,
      );
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    const artifact = path.join(files.root, REQUIRED_EVIDENCE_FILES[0]);
    fs.rmSync(artifact);
    fs.symlinkSync('README.md', artifact);
    try {
      assert.throws(
        () => scan(files.root),
        /could not be opened without following links/,
      );
    } finally {
      files.cleanup();
    }
  }

  {
    const files = fixture();
    fs.writeFileSync(
      path.join(
        files.root,
        'platform-reliability-r1-operator-receipt.json',
      ),
      '{not-json}\n',
    );
    try {
      assert.throws(() => scan(files.root), /JSON artifact is invalid/);
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
      assert.throws(() => scan(files.root), /binary NUL bytes/);
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
      assert.throws(() => scan(files.root), /size is outside/);
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
