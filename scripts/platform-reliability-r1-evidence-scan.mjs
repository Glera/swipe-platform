#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX_ARTIFACT_BYTES = 5 * 1024 * 1024;

export const REQUIRED_EVIDENCE_FILES = Object.freeze([
  'platform-reliability-r1-0-snapshot-2.tsv',
  'platform-reliability-r1-0-snapshot-2-db-capture-receipt.json',
  'platform-reliability-r1-0-snapshot-2-render-receipt.json',
  'platform-reliability-r1-0-snapshot-delta.json',
  'platform-reliability-r1-0-snapshot-delta.md',
  'platform-reliability-r1-operator-receipt.json',
  'platform-reliability-r1-final-evidence.md',
]);

const SECRET_RULES = Object.freeze([
  {
    id: 'private-key',
    test: (text) => /-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(text),
  },
  {
    id: 'aws-access-key',
    test: (text) => /AKIA[0-9A-Z]{16}/.test(text),
  },
  {
    id: 'github-token',
    test: (text) => (
      /(?:gh[op]|github_pat_)[A-Za-z0-9_]{20,}/.test(text)
    ),
  },
  {
    id: 'openai-key',
    test: (text) => /sk-[A-Za-z0-9]{20,}/.test(text),
  },
  {
    id: 'slack-token',
    test: (text) => /xox[aboprs]-[A-Za-z0-9-]{10,}/.test(text),
  },
  {
    id: 'jwt',
    test: (text) => (
      /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]+/
        .test(text)
    ),
  },
  {
    id: 'postgres-url',
    test: (text) => /\bpostgres(?:ql)?:\/\/\S+/i.test(text),
  },
  {
    id: 'credentialed-url',
    test: (text) => (
      /\b[a-z][a-z0-9+.-]*:\/\/[^\s/:]+:[^@\s/]+@[^\s]+/i.test(text)
    ),
  },
  {
    id: 'render-postgres-host',
    test: (text) => (
      /\b[a-z0-9-]+(?:\.[a-z0-9-]+)*-postgres\.render\.com\b/i.test(text)
    ),
  },
  {
    id: 'raw-credential-field',
    test: (text) => (
      /["'](?:password|database_url|databaseUrl|connectionString|externalDatabaseUrl|internalDatabaseUrl|psqlCommand|username|current_user|currentUser|user)["']\s*:\s*["'][^"'\r\n]+["']/i
        .test(text)
      || /^(?:password|database_url|connection_string|external_database_url|internal_database_url|psql_command|username|current_user|user)\s*:\s*\S+/im
        .test(text)
    ),
  },
  {
    id: 'render-database-username',
    test: (text) => /\bswipe_[a-z0-9_]{2,}_user(?:_[a-z0-9_]+)?\b/i.test(text),
  },
  {
    id: 'generic-secret-assignment',
    test: (text) => (
      /(?:api[_-]?key|secret|token|passw(?:or)?d|private[_-]?key)\s*[:=]\s*['"]?[A-Za-z0-9_\-/+=]{16,}/i
        .test(text)
    ),
  },
  {
    id: 'psql-connection-command',
    test: (text) => (
      /\bpsql\s+[^\r\n]*(?:postgres(?:ql)?:\/\/|(?:--host|-h)\s+\S+)/i
        .test(text)
    ),
  },
  {
    id: 'literal-ipv4',
    test: containsIpv4,
  },
]);

function fail(message) {
  throw new Error(message);
}

function containsIpv4(text) {
  const candidates = text.match(
    /(?<![A-Za-z0-9])(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?(?![A-Za-z0-9])/g,
  ) ?? [];
  return candidates.some((candidate) => {
    const [address, prefix] = candidate.split('/');
    const validAddress = address
      .split('.')
      .every((octet) => Number(octet) >= 0 && Number(octet) <= 255);
    return validAddress && (
      prefix === undefined || (Number(prefix) >= 0 && Number(prefix) <= 32)
    );
  });
}

function sha256(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

function readArtifact(root, relativePath) {
  const artifactPath = path.join(root, relativePath);
  let stat;
  try {
    stat = fs.lstatSync(artifactPath);
  } catch {
    fail(`required artifact is missing: ${relativePath}`);
  }
  if (stat.isSymbolicLink() || !stat.isFile() || stat.nlink !== 1) {
    fail(`required artifact is not a singly linked regular file: ${relativePath}`);
  }
  if (stat.size < 1 || stat.size > MAX_ARTIFACT_BYTES) {
    fail(`required artifact size is outside the accepted range: ${relativePath}`);
  }
  const bytes = fs.readFileSync(artifactPath);
  if (bytes.includes(0)) {
    fail(`required artifact contains binary NUL bytes: ${relativePath}`);
  }
  const text = bytes.toString('utf8');
  if (text.includes('\uFFFD')) {
    fail(`required artifact is not valid UTF-8: ${relativePath}`);
  }
  for (const rule of SECRET_RULES) {
    if (rule.test(text)) {
      fail(`secret hygiene rule ${rule.id} matched: ${relativePath}`);
    }
  }
  return {
    path: relativePath,
    bytes: bytes.length,
    sha256: sha256(bytes),
  };
}

export function scanEvidence(rootInput) {
  const root = fs.realpathSync(path.resolve(rootInput));
  const files = REQUIRED_EVIDENCE_FILES.map(
    (relativePath) => readArtifact(root, relativePath),
  );
  return {
    schema: 'platform-reliability-r1-secret-scan-receipt.v1',
    status: 'pass',
    ruleSetSha256: sha256(Buffer.from(JSON.stringify(
      SECRET_RULES.map((rule) => rule.id),
    ))),
    requiredFiles: files,
    secretMatches: 0,
    exactIpv4Captured: false,
    secretsCaptured: false,
  };
}

function parseArgs(argv) {
  if (argv.length !== 2 || argv[0] !== '--root' || !argv[1]) {
    fail('usage: platform-reliability-r1-evidence-scan.mjs --root <directory>');
  }
  return { root: argv[1] };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  process.stdout.write(`${JSON.stringify(scanEvidence(args.root), null, 2)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`platform-reliability-r1-evidence-scan: ${error.message}\n`);
    process.exitCode = 1;
  }
}
