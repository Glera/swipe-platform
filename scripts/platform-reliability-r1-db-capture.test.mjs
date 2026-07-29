import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  captureSnapshot,
  stageCredentialUrl,
} from './platform-reliability-r1-db-capture.mjs';

function managedCredentialPath(directory = os.tmpdir()) {
  return path.join(
    directory,
    `p4g-r1-db-url-${process.pid}-${crypto.randomUUID()}`,
  );
}

function validSnapshot(timestamp = '2026-07-30 08:40:00 UTC') {
  return [
    ['snapshot_meta', timestamp, 'swipe', 'on', 'UTC', '160014', '1000', '1000 bytes'],
    ['schema', '2', '0067'],
    ['relation_totals', '2', '1', '600', '600 bytes', '100', '100 bytes', '200', '200 bytes'],
    ['exact_row_count', 'public.a', '10'],
    ['exact_row_summary', '1', '10'],
    ['runtime', 'database_stats', '10', '2', '3', '4', '0', '0', '17', '0', ''],
    ['snapshot_complete', 'ok'],
  ].map((row) => row.join('\t')).join('\n');
}

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'p4g-r1-capture-test-'));
  const fakePsql = path.join(directory, 'fake-psql.mjs');
  const trace = path.join(directory, 'trace.json');
  const snapshotInput = path.join(directory, 'snapshot-input.tsv');
  const exitCode = path.join(directory, 'exit-code.txt');
  const output = path.join(directory, 'snapshot.tsv');
  fs.writeFileSync(
    fakePsql,
    [
      '#!/usr/bin/env node',
      "import fs from 'node:fs';",
      "import path from 'node:path';",
      "import { fileURLToPath } from 'node:url';",
      'const directory = path.dirname(fileURLToPath(import.meta.url));',
      "const trace = path.join(directory, 'trace.json');",
      "const snapshot = path.join(directory, 'snapshot-input.tsv');",
      "const exitCode = path.join(directory, 'exit-code.txt');",
      'fs.writeFileSync(trace, JSON.stringify({',
      '  argv: process.argv.slice(2),',
      '  host: process.env.PGHOST,',
      '  port: process.env.PGPORT,',
      '  database: process.env.PGDATABASE,',
      '  user: process.env.PGUSER,',
      '  password: process.env.PGPASSWORD,',
      '  sslmode: process.env.PGSSLMODE,',
      '  options: process.env.PGOPTIONS,',
      '  inheritedDatabaseUrl: process.env.DATABASE_URL ?? null,',
      '  inheritedService: process.env.PGSERVICE ?? null,',
      '}));',
      "process.stdout.write(fs.readFileSync(snapshot, 'utf8'));",
      "process.exit(fs.existsSync(exitCode) ? Number(fs.readFileSync(exitCode, 'utf8')) : 0);",
      '',
    ].join('\n'),
    { mode: 0o700 },
  );
  fs.writeFileSync(snapshotInput, validSnapshot());
  return {
    directory,
    fakePsql,
    trace,
    snapshotInput,
    exitCode,
    output,
    cleanup() {
      fs.rmSync(directory, { recursive: true, force: true });
    },
  };
}

function writeCredential(contents, mode = 0o600, directory = os.tmpdir()) {
  if (mode === 0o600) {
    return stageCredentialUrl(contents, { directory });
  }
  const credential = managedCredentialPath(directory);
  fs.writeFileSync(credential, contents, { flag: 'wx', mode });
  return credential;
}

test('captures a validated snapshot without putting credentials in argv', () => {
  const files = fixture();
  const credential = writeCredential(
    'postgresql://new%20user:p%40ss@db.example.test:5433/swipe?sslmode=require',
  );
  try {
    const receipt = captureSnapshot({
      credentialFile: credential,
      outputFile: files.output,
      notBefore: '2026-07-30T08:31:00Z',
      psqlBinary: files.fakePsql,
      sourceEnvironment: {
        PATH: process.env.PATH,
        DATABASE_URL: 'postgresql://ambient:secret@wrong.invalid/db',
        PGSERVICE: 'ambient-service',
      },
    });
    const trace = JSON.parse(fs.readFileSync(files.trace, 'utf8'));

    assert.deepEqual(trace.argv, [
      '-X',
      '-q',
      '-v',
      'ON_ERROR_STOP=1',
      '-f',
      path.join(
        path.dirname(fileURLToPath(import.meta.url)),
        'platform-reliability-r1-db-snapshot.sql',
      ),
    ]);
    assert.equal(JSON.stringify(trace.argv).includes('p@ss'), false);
    assert.equal(JSON.stringify(trace.argv).includes('postgresql://'), false);
    assert.equal(trace.host, 'db.example.test');
    assert.equal(trace.port, '5433');
    assert.equal(trace.database, 'swipe');
    assert.equal(trace.user, 'new user');
    assert.equal(trace.password, 'p@ss');
    assert.equal(trace.sslmode, 'require');
    assert.match(trace.options, /default_transaction_read_only=on/);
    assert.equal(trace.inheritedDatabaseUrl, null);
    assert.equal(trace.inheritedService, null);
    assert.equal(receipt.status, 'ok');
    assert.equal(receipt.credentialInArgv, false);
    assert.equal(receipt.secretsCaptured, false);
    assert.equal(fs.existsSync(credential), false);
    assert.equal(fs.statSync(files.output).mode & 0o777, 0o600);
    assert.equal(fs.readFileSync(files.output, 'utf8'), validSnapshot());
  } finally {
    fs.rmSync(credential, { force: true });
    files.cleanup();
  }
});

test('removes the credential and partial output when psql fails', () => {
  const files = fixture();
  const credential = writeCredential(
    'postgresql://user:password@db.example.test/swipe?sslmode=require',
  );
  try {
    fs.writeFileSync(files.snapshotInput, 'partial');
    fs.writeFileSync(files.exitCode, '2');
    assert.throws(
      () => captureSnapshot({
        credentialFile: credential,
        outputFile: files.output,
        notBefore: '2026-07-30T08:31:00Z',
        psqlBinary: files.fakePsql,
        sourceEnvironment: {
          PATH: process.env.PATH,
        },
      }),
      /psql snapshot failed with exit 2/,
    );
    assert.equal(fs.existsSync(credential), false);
    assert.equal(fs.existsSync(files.output), false);
  } finally {
    fs.rmSync(credential, { force: true });
    files.cleanup();
  }
});

test('fails closed on insecure credential permissions and consumes the temp file', () => {
  const files = fixture();
  const credential = writeCredential(
    'postgresql://user:password@db.example.test/swipe?sslmode=require',
    0o640,
  );
  try {
    assert.throws(
      () => captureSnapshot({
        credentialFile: credential,
        outputFile: files.output,
        notBefore: '2026-07-30T08:31:00Z',
        psqlBinary: files.fakePsql,
        sourceEnvironment: {
          PATH: process.env.PATH,
        },
      }),
      /must not be readable or writable by group\/other/,
    );
    assert.equal(fs.existsSync(credential), false);
    assert.equal(fs.existsSync(files.output), false);
    assert.equal(fs.existsSync(files.trace), false);
  } finally {
    fs.rmSync(credential, { force: true });
    files.cleanup();
  }
});

test('rejects a snapshot captured before the evidence boundary', () => {
  const files = fixture();
  const credential = writeCredential(
    'postgresql://user:password@db.example.test/swipe?sslmode=require',
  );
  try {
    fs.writeFileSync(
      files.snapshotInput,
      validSnapshot('2026-07-30 08:30:59 UTC'),
    );
    assert.throws(
      () => captureSnapshot({
        credentialFile: credential,
        outputFile: files.output,
        notBefore: '2026-07-30T08:31:00Z',
        psqlBinary: files.fakePsql,
        sourceEnvironment: {
          PATH: process.env.PATH,
        },
      }),
      /precedes required/,
    );
    assert.equal(fs.existsSync(credential), false);
    assert.equal(fs.existsSync(files.output), false);
  } finally {
    fs.rmSync(credential, { force: true });
    files.cleanup();
  }
});

test('consumes the credential even when local arguments fail before psql', () => {
  const files = fixture();
  const credential = writeCredential(
    'postgresql://user:password@db.example.test/swipe?sslmode=require',
  );
  try {
    assert.throws(
      () => captureSnapshot({
        credentialFile: credential,
        outputFile: path.join(files.directory, 'snapshot.txt'),
        notBefore: 'not-a-date',
        psqlBinary: files.fakePsql,
      }),
      /not-before must be an RFC 3339 timestamp with an explicit offset/,
    );
    assert.equal(fs.existsSync(credential), false);
    assert.equal(fs.existsSync(files.output), false);
    assert.equal(fs.existsSync(files.trace), false);
  } finally {
    fs.rmSync(credential, { force: true });
    files.cleanup();
  }
});

test('exclusive staging refuses a pre-created symlink without writing its target', () => {
  const files = fixture();
  const nonce = `collision-${process.pid}-${crypto.randomUUID()}`;
  const credential = path.join(os.tmpdir(), `p4g-r1-db-url-${nonce}`);
  const target = path.join(files.directory, 'attacker-target');
  fs.writeFileSync(target, 'unchanged');
  fs.symlinkSync(target, credential);
  try {
    assert.throws(
      () => stageCredentialUrl(
        'postgresql://user:password@db.example.test/swipe?sslmode=require',
        {
          directory: os.tmpdir(),
          randomUUID: () => nonce,
        },
      ),
      /exclusive credential staging failed/,
    );
    assert.equal(fs.readFileSync(target, 'utf8'), 'unchanged');
    assert.equal(fs.lstatSync(credential).isSymbolicLink(), true);
  } finally {
    fs.rmSync(credential, { force: true });
    files.cleanup();
  }
});

test('rejects timezone-less and coercive not-before values before psql', () => {
  for (const notBefore of ['2026-07-30T08:31:00', '0']) {
    const files = fixture();
    const credential = writeCredential(
      'postgresql://user:password@db.example.test/swipe?sslmode=require',
    );
    try {
      assert.throws(
        () => captureSnapshot({
          credentialFile: credential,
          outputFile: files.output,
          notBefore,
          psqlBinary: files.fakePsql,
        }),
        /RFC 3339 timestamp with an explicit offset/,
      );
      assert.equal(fs.existsSync(credential), false);
      assert.equal(fs.existsSync(files.trace), false);
    } finally {
      fs.rmSync(credential, { force: true });
      files.cleanup();
    }
  }
});

test('rejects impossible RFC 3339 calendar fields before psql', () => {
  for (const notBefore of [
    '2026-02-30T08:31:00Z',
    '2026-07-30T24:00:00Z',
    '2026-07-30T08:31:60Z',
    '2026-07-30T08:31:00+24:00',
  ]) {
    const files = fixture();
    const credential = writeCredential(
      'postgresql://user:password@db.example.test/swipe?sslmode=require',
    );
    try {
      assert.throws(
        () => captureSnapshot({
          credentialFile: credential,
          outputFile: files.output,
          notBefore,
          psqlBinary: files.fakePsql,
        }),
        /not a real calendar timestamp/,
      );
      assert.equal(fs.existsSync(credential), false);
      assert.equal(fs.existsSync(files.trace), false);
    } finally {
      fs.rmSync(credential, { force: true });
      files.cleanup();
    }
  }
});

test('accepts the documented /tmp credential path on macOS', (context) => {
  if (
    !fs.existsSync('/tmp')
    || fs.realpathSync('/tmp') === fs.realpathSync(os.tmpdir())
  ) {
    context.skip('/tmp and os.tmpdir() resolve to the same directory');
    return;
  }
  const files = fixture();
  const credential = writeCredential(
    'postgresql://user:password@db.example.test/swipe?sslmode=require',
    0o600,
    '/tmp',
  );
  try {
    const receipt = captureSnapshot({
      credentialFile: credential,
      outputFile: files.output,
      notBefore: '2026-07-30T08:31:00Z',
      psqlBinary: files.fakePsql,
      sourceEnvironment: {
        PATH: process.env.PATH,
      },
    });
    assert.equal(receipt.status, 'ok');
    assert.equal(fs.existsSync(credential), false);
  } finally {
    fs.rmSync(credential, { force: true });
    files.cleanup();
  }
});
