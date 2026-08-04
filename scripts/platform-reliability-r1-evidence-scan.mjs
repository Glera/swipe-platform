#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { TextDecoder } from 'node:util';
import { fileURLToPath } from 'node:url';

import {
  analyzeDeltaEvidence,
  toMarkdown as deltaToMarkdown,
} from './platform-reliability-r1-db-delta.mjs';
import {
  compareBlueprintReplacementEvidence,
} from './platform-reliability-r1-blueprint-replacement-compare.mjs';
import {
  REQUIRED_BLUEPRINT_REPLACEMENT_INCIDENT_ID,
  validateOperatorEvidence,
} from './platform-reliability-r1-operator-receipt-validate.mjs';

const MAX_ARTIFACT_BYTES = 5 * 1024 * 1024;
const OUTPUT_RECEIPT = 'platform-reliability-r1-secret-scan-receipt.json';
const SCANNER_SOURCE_PATH = fileURLToPath(import.meta.url);
const OPERATOR_VALIDATOR_SOURCE_PATH = fileURLToPath(
  new URL('./platform-reliability-r1-operator-receipt-validate.mjs', import.meta.url),
);
const DELTA_ANALYZER_SOURCE_PATH = fileURLToPath(
  new URL('./platform-reliability-r1-db-delta.mjs', import.meta.url),
);
const BLUEPRINT_COMPARATOR_SOURCE_PATH = fileURLToPath(
  new URL(
    './platform-reliability-r1-blueprint-replacement-compare.mjs',
    import.meta.url,
  ),
);
const UTF8_DECODER = new TextDecoder('utf-8', { fatal: true });
const SNAPSHOT_BASELINE =
  'platform-reliability-r1-0-snapshot-baseline.json';
const PROVIDER_BASELINE =
  'platform-reliability-r1-0-render-receipt.json';
const BLUEPRINT_SUPPORT_RESPONSE =
  'platform-reliability-r1-gate-c-render-support-response.json';

export const REQUIRED_EVIDENCE_FILES = Object.freeze([
  'platform-reliability-r1-0-snapshot-2.tsv',
  'platform-reliability-r1-0-snapshot-2-db-capture-receipt.json',
  'platform-reliability-r1-0-snapshot-2-render-receipt.json',
  'platform-reliability-r1-0-snapshot-delta.json',
  'platform-reliability-r1-0-snapshot-delta.md',
  'platform-reliability-r1-gate-c0-blueprint-before.json',
  'platform-reliability-r1-gate-c0-blueprint-after.json',
  'platform-reliability-r1-gate-c0-blueprint-comparison.json',
  'platform-reliability-r1-operator-receipt.json',
  'platform-reliability-r1-final-evidence.md',
]);

const SENSITIVE_JSON_KEYS = Object.freeze([
  'connectionstring',
  'currentuser',
  'databaseurl',
  'externaldatabaseurl',
  'internaldatabaseurl',
  'password',
  'pgdatabase',
  'pghost',
  'pghostaddr',
  'pgpassfile',
  'pgpassword',
  'pgport',
  'pgservice',
  'pgservicefile',
  'pgsslmode',
  'pguser',
  'psqlcommand',
  'user',
  'username',
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
      /(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/
        .test(text)
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
    id: 'postgres-environment',
    test: (text) => (
      /(?:^|[\s"'`])(?:DATABASE_URL|PGHOST|PGHOSTADDR|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|PGPASSFILE|PGSERVICE|PGSERVICEFILE|PGSSLMODE)\s*[:=]\s*[^\s,;}\]]+/im
        .test(text)
    ),
  },
  {
    id: 'libpq-conninfo',
    test: (text) => (
      /(?:^|\s)(?:host|hostaddr|port|dbname|user|password|passfile|sslkey|sslpassword|service)\s*=\s*(?:'[^']+'|"[^"]+"|[^\s]+)/im
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
    test: containsDisallowedIpv4,
  },
]);

function fail(message) {
  throw new Error(message);
}

function containsDisallowedIpv4(text) {
  const candidates = text.match(
    /(?<![A-Za-z0-9])(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?(?![A-Za-z0-9])/g,
  ) ?? [];
  return candidates.some((candidate) => {
    if (candidate === '0.0.0.0/0') {
      return false;
    }
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

function git(root, args) {
  try {
    return execFileSync('git', ['-C', root, ...args], {
      encoding: 'buffer',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    fail('could not establish the git patch boundary');
  }
}

function parseNulList(bytes) {
  return bytes
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
}

function establishPatchClosure(root, baseRef) {
  const gitRoot = fs.realpathSync(
    git(root, ['rev-parse', '--show-toplevel']).toString('utf8').trim(),
  );
  if (gitRoot !== root) {
    fail('evidence root must be the git worktree root');
  }

  const mergeBaseSha = git(
    root,
    ['merge-base', 'HEAD', baseRef],
  ).toString('utf8').trim();
  if (!/^[a-f0-9]{40,64}$/.test(mergeBaseSha)) {
    fail('git merge base is not a full commit identity');
  }

  const trackedChanges = parseNulList(git(
    root,
    ['diff', '--name-only', '-z', mergeBaseSha, '--'],
  ));
  const untrackedChanges = parseNulList(git(
    root,
    ['ls-files', '--others', '--exclude-standard', '-z'],
  ));
  const changedPaths = [...new Set([...trackedChanges, ...untrackedChanges])]
    .sort();
  const allowedPaths = new Set([...REQUIRED_EVIDENCE_FILES, OUTPUT_RECEIPT]);

  const unexpected = changedPaths.filter((candidate) => !allowedPaths.has(candidate));
  if (unexpected.length > 0) {
    fail('git patch contains artifacts outside the evidence manifest');
  }
  for (const requiredPath of REQUIRED_EVIDENCE_FILES) {
    if (!changedPaths.includes(requiredPath)) {
      fail(`required artifact is outside the git patch: ${requiredPath}`);
    }
  }

  return {
    baseRef,
    mergeBaseSha,
    paths: changedPaths,
    outputReceiptPresentAtStart: changedPaths.includes(OUTPUT_RECEIPT),
  };
}

function testText(text, relativePath) {
  for (const rule of SECRET_RULES) {
    if (rule.test(text)) {
      fail(`secret hygiene rule ${rule.id} matched: ${relativePath}`);
    }
  }
}

function testDecodedJson(value, relativePath) {
  if (Array.isArray(value)) {
    for (const item of value) {
      testDecodedJson(item, relativePath);
    }
    return;
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      const normalizedKey = key.replaceAll(/[_-]/g, '').toLowerCase();
      if (SENSITIVE_JSON_KEYS.includes(normalizedKey)) {
        fail(`secret hygiene rule sensitive-json-key matched: ${relativePath}`);
      }
      testText(key, relativePath);
      testDecodedJson(child, relativePath);
    }
    return;
  }
  if (typeof value === 'string') {
    testText(value, relativePath);
  }
}

function readArtifact(root, relativePath) {
  const artifactPath = path.join(root, relativePath);
  if (typeof fs.constants.O_NOFOLLOW !== 'number') {
    fail('O_NOFOLLOW is unavailable; refusing to scan evidence');
  }

  let descriptor;
  try {
    descriptor = fs.openSync(
      artifactPath,
      fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW,
    );
  } catch (error) {
    if (error?.code === 'ENOENT') {
      fail(`required artifact is missing: ${relativePath}`);
    }
    fail(`required artifact could not be opened without following links: ${relativePath}`);
  }

  try {
    const before = fs.fstatSync(descriptor, { bigint: true });
    if (!before.isFile() || before.nlink !== 1n) {
      fail(`required artifact is not a singly linked regular file: ${relativePath}`);
    }
    if (
      before.size < 1n
      || before.size > BigInt(MAX_ARTIFACT_BYTES)
    ) {
      fail(`required artifact size is outside the accepted range: ${relativePath}`);
    }

    const bytes = fs.readFileSync(descriptor);
    const after = fs.fstatSync(descriptor, { bigint: true });
    if (
      before.dev !== after.dev
      || before.ino !== after.ino
      || before.size !== after.size
      || before.mtimeNs !== after.mtimeNs
      || before.ctimeNs !== after.ctimeNs
      || BigInt(bytes.length) !== before.size
    ) {
      fail(`required artifact changed while it was being scanned: ${relativePath}`);
    }
    if (bytes.includes(0)) {
      fail(`required artifact contains binary NUL bytes: ${relativePath}`);
    }

    let text;
    try {
      text = UTF8_DECODER.decode(bytes);
    } catch {
      fail(`required artifact is not valid UTF-8: ${relativePath}`);
    }
    testText(text, relativePath);
    let decoded = null;
    if (relativePath.endsWith('.json')) {
      try {
        decoded = JSON.parse(text);
      } catch {
        fail(`required JSON artifact is invalid: ${relativePath}`);
      }
      testDecodedJson(decoded, relativePath);
    }

    return {
      metadata: {
        path: relativePath,
        bytes: bytes.length,
        sha256: sha256(bytes),
      },
      text,
      decoded,
      bytes,
    };
  } finally {
    fs.closeSync(descriptor);
  }
}

export function scanEvidence(rootInput, { baseRef } = {}) {
  if (typeof baseRef !== 'string' || !baseRef.trim()) {
    fail('baseRef is required');
  }
  const root = fs.realpathSync(path.resolve(rootInput));
  const patchClosure = establishPatchClosure(root, baseRef);
  const artifacts = REQUIRED_EVIDENCE_FILES.map(
    (relativePath) => readArtifact(root, relativePath),
  );
  const byPath = new Map(
    artifacts.map((artifact) => [artifact.metadata.path, artifact]),
  );
  const snapshotBaseline = readArtifact(root, SNAPSHOT_BASELINE);
  const providerBaseline = readArtifact(root, PROVIDER_BASELINE);
  const blueprintSupport = readArtifact(root, BLUEPRINT_SUPPORT_RESPONSE);
  const expectedDelta = analyzeDeltaEvidence({
    beforePath: path.join(root, SNAPSHOT_BASELINE),
    beforeBytes: snapshotBaseline.bytes,
    afterPath: path.join(
      root,
      'platform-reliability-r1-0-snapshot-2.tsv',
    ),
    afterBytes:
      byPath.get('platform-reliability-r1-0-snapshot-2.tsv').bytes,
    captureAfterBytes:
      byPath
        .get('platform-reliability-r1-0-snapshot-2-db-capture-receipt.json')
        .bytes,
    providerBeforeBytes: providerBaseline.bytes,
    providerAfterBytes:
      byPath
        .get('platform-reliability-r1-0-snapshot-2-render-receipt.json')
        .bytes,
  });
  const expectedDeltaJson = `${JSON.stringify(expectedDelta, null, 2)}\n`;
  const expectedDeltaMarkdown = deltaToMarkdown(expectedDelta);
  if (
    !byPath
      .get('platform-reliability-r1-0-snapshot-delta.json')
      .bytes
      .equals(Buffer.from(expectedDeltaJson))
    || !byPath
      .get('platform-reliability-r1-0-snapshot-delta.md')
      .bytes
      .equals(Buffer.from(expectedDeltaMarkdown))
  ) {
    fail('delta JSON/Markdown pair does not match the exact evidence inputs');
  }
  const beforeArtifact = byPath.get(
    'platform-reliability-r1-gate-c0-blueprint-before.json',
  );
  const afterArtifact = byPath.get(
    'platform-reliability-r1-gate-c0-blueprint-after.json',
  );
  const comparisonArtifact = byPath.get(
    'platform-reliability-r1-gate-c0-blueprint-comparison.json',
  );
  const blueprintValidation = compareBlueprintReplacementEvidence({
    beforeBytes: beforeArtifact.bytes,
    afterBytes: afterArtifact.bytes,
    supportBytes: blueprintSupport.bytes,
    publishedComparisonBytes: comparisonArtifact.bytes,
  }).result;
  if (
    blueprintValidation.evidenceClass !== 'operator_attested'
    || blueprintValidation.providerVerifiedServiceContinuity !== false
    || blueprintValidation.providerConfirmedFromDatabaseContinuity !== true
    || blueprintValidation.hookDispositionBasis
      !== 'provider_contract_plus_terminal_old_blueprint_absence'
    || !blueprintValidation.boundedReplacementConsistent
  ) {
    fail('Blueprint replacement evidence is not bounded and internally consistent');
  }
  const operatorValidation = validateOperatorEvidence(
    byPath.get('platform-reliability-r1-operator-receipt.json').decoded,
    byPath.get('platform-reliability-r1-final-evidence.md').text,
  );
  const operatorReceipt =
    byPath.get('platform-reliability-r1-operator-receipt.json').decoded;
  const replacementIncident = operatorReceipt.secretExposureIncidents.find(
    (incident) => (
      incident.incidentId
        === REQUIRED_BLUEPRINT_REPLACEMENT_INCIDENT_ID
    ),
  );
  const replacementDisposition = replacementIncident?.disposition;
  if (
    replacementDisposition?.providerMethod !== 'replace_blueprint'
    || replacementDisposition.blueprintContinuity.evidenceClass
      !== blueprintValidation.evidenceClass
    || replacementDisposition.providerReceipt.evidenceSha256
      !== afterArtifact.metadata.sha256
    || replacementDisposition.terminalProofSha256
      !== comparisonArtifact.metadata.sha256
    || replacementDisposition.blueprintContinuity.before.evidenceSha256
      !== beforeArtifact.metadata.sha256
    || replacementDisposition.blueprintContinuity.after.evidenceSha256
      !== afterArtifact.metadata.sha256
    || replacementDisposition.blueprintContinuity.before.blueprintId
      !== blueprintValidation.oldBlueprintId
    || replacementDisposition.blueprintContinuity.after.blueprintId
      !== blueprintValidation.newBlueprintId
    || replacementDisposition.blueprintContinuity.before.sourceSha
      !== blueprintValidation.sourceSha
    || replacementDisposition.blueprintContinuity.after.sourceSha
      !== blueprintValidation.sourceSha
    || replacementDisposition.blueprintContinuity
      .before.linkedServiceIdsSha256
      !== blueprintValidation.linkedServiceIdsSha256
    || replacementDisposition.blueprintContinuity
      .after.linkedServiceIdsSha256
      !== blueprintValidation.linkedServiceIdsSha256
    || replacementDisposition.blueprintContinuity
      .before.linkedServiceConfigurationSha256
      !== blueprintValidation.linkedServiceConfigurationSha256
    || replacementDisposition.blueprintContinuity
      .after.linkedServiceConfigurationSha256
      !== blueprintValidation.linkedServiceConfigurationSha256
  ) {
    fail('operator receipt is not bound to exact Blueprint replacement evidence');
  }
  const files = artifacts.map((artifact) => artifact.metadata);
  const ruleDefinitions = {
    regexAndFunctionRules: SECRET_RULES.map((rule) => ({
      id: rule.id,
      definition: rule.test.toString(),
    })),
    sensitiveJsonKeys: [...SENSITIVE_JSON_KEYS],
    allowedNetworkConstants: ['all-ipv4-sentinel'],
    operatorValidatorSourceSha256: sha256(
      fs.readFileSync(OPERATOR_VALIDATOR_SOURCE_PATH),
    ),
    deltaAnalyzerSourceSha256: sha256(
      fs.readFileSync(DELTA_ANALYZER_SOURCE_PATH),
    ),
    blueprintComparatorSourceSha256: sha256(
      fs.readFileSync(BLUEPRINT_COMPARATOR_SOURCE_PATH),
    ),
  };
  return {
    schema: 'platform-reliability-r1-secret-scan-receipt.v2',
    status: 'pass',
    scannerSourceSha256: sha256(fs.readFileSync(SCANNER_SOURCE_PATH)),
    operatorValidatorSourceSha256:
      ruleDefinitions.operatorValidatorSourceSha256,
    deltaAnalyzerSourceSha256:
      ruleDefinitions.deltaAnalyzerSourceSha256,
    blueprintComparatorSourceSha256:
      ruleDefinitions.blueprintComparatorSourceSha256,
    ruleSetSha256: sha256(Buffer.from(JSON.stringify(ruleDefinitions))),
    patchClosure,
    operatorValidation,
    deltaValidation: {
      schema: expectedDelta.schema,
      status: 'pass',
      provenance: expectedDelta.provenance,
    },
    blueprintReplacementValidation: {
      schema: blueprintValidation.schema,
      status: 'pass',
      evidenceClass: blueprintValidation.evidenceClass,
      providerVerifiedServiceContinuity:
        blueprintValidation.providerVerifiedServiceContinuity,
      providerConfirmedFromDatabaseContinuity:
        blueprintValidation.providerConfirmedFromDatabaseContinuity,
      beforeSha256: blueprintValidation.beforeSha256,
      afterSha256: blueprintValidation.afterSha256,
      supportSha256: blueprintValidation.supportSha256,
      comparisonSha256: comparisonArtifact.metadata.sha256,
    },
    requiredFiles: files,
    secretMatches: 0,
    exactIpv4Captured: false,
    secretsCaptured: false,
  };
}

function parseArgs(argv) {
  if (
    argv.length !== 4
    || argv[0] !== '--root'
    || !argv[1]
    || argv[2] !== '--base-ref'
    || !argv[3]
  ) {
    fail(
      'usage: platform-reliability-r1-evidence-scan.mjs '
      + '--root <directory> --base-ref <git-ref>',
    );
  }
  return { root: argv[1], baseRef: argv[3] };
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  process.stdout.write(
    `${JSON.stringify(scanEvidence(args.root, { baseRef: args.baseRef }), null, 2)}\n`,
  );
}

if (process.argv[1] && SCANNER_SOURCE_PATH === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`platform-reliability-r1-evidence-scan: ${error.message}\n`);
    process.exitCode = 1;
  }
}
