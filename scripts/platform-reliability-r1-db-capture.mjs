#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { parseSnapshot } from './platform-reliability-r1-db-delta.mjs';

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_SQL = path.join(
  SCRIPT_DIRECTORY,
  'platform-reliability-r1-db-snapshot.sql',
);
const CREDENTIAL_PREFIX = 'p4g-r1-db-url-';
const MAX_CREDENTIAL_BYTES = 4096;

function fail(message) {
  throw new Error(message);
}

function decodeUrlComponent(value, label) {
  try {
    return decodeURIComponent(value);
  } catch {
    fail(`database URL has invalid ${label} encoding`);
  }
}

function validateManagedCredentialPath(inputPath) {
  const resolved = path.resolve(inputPath);
  const temporaryDirectory = fs.realpathSync(os.tmpdir());
  const parent = fs.realpathSync(path.dirname(resolved));
  if (
    parent !== temporaryDirectory
    || !path.basename(resolved).startsWith(CREDENTIAL_PREFIX)
  ) {
    fail(
      `credential file must be a direct ${os.tmpdir()}/${CREDENTIAL_PREFIX}* file`,
    );
  }
  return resolved;
}

function readConnectionEnvironment(credentialFile) {
  const stat = fs.lstatSync(credentialFile);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    fail('credential file must be a regular non-symlink file');
  }
  if (typeof process.getuid === 'function' && stat.uid !== process.getuid()) {
    fail('credential file must be owned by the current user');
  }
  if ((stat.mode & 0o077) !== 0) {
    fail('credential file must not be readable or writable by group/other');
  }
  if (stat.size < 1 || stat.size > MAX_CREDENTIAL_BYTES) {
    fail('credential file size is outside the accepted range');
  }

  const credentialBytes = fs.readFileSync(credentialFile);
  try {
    const connectionText = credentialBytes.toString('utf8');
    if (connectionText !== connectionText.trim() || /[\r\n\0]/.test(connectionText)) {
      fail('credential file must contain exactly one unpadded database URL');
    }

    let connection;
    try {
      connection = new URL(connectionText);
    } catch {
      fail('credential file does not contain a valid database URL');
    }
    if (!['postgres:', 'postgresql:'].includes(connection.protocol)) {
      fail('credential URL protocol must be postgres or postgresql');
    }
    if (
      !connection.username
      || !connection.password
      || !connection.hostname
      || connection.pathname.length <= 1
      || connection.hash
    ) {
      fail('credential URL is missing required connection fields');
    }

    const queryKeys = [...new Set(connection.searchParams.keys())];
    if (queryKeys.some((key) => key !== 'sslmode')) {
      fail('credential URL contains unsupported query parameters');
    }
    if (connection.searchParams.getAll('sslmode').length > 1) {
      fail('credential URL contains duplicate sslmode parameters');
    }
    const sslmode = connection.searchParams.get('sslmode') || 'require';
    if (!['require', 'verify-ca', 'verify-full'].includes(sslmode)) {
      fail('credential URL must require TLS');
    }

    const database = decodeUrlComponent(connection.pathname.slice(1), 'database');
    if (!database || database.includes('/')) {
      fail('credential URL must name exactly one database');
    }

    return {
      PGHOST: connection.hostname,
      PGPORT: connection.port || '5432',
      PGDATABASE: database,
      PGUSER: decodeUrlComponent(connection.username, 'username'),
      PGPASSWORD: decodeUrlComponent(connection.password, 'password'),
      PGSSLMODE: sslmode,
    };
  } finally {
    credentialBytes.fill(0);
  }
}

function isolatedChildEnvironment(connectionEnvironment, sourceEnvironment) {
  const environment = { ...sourceEnvironment };
  for (const key of Object.keys(environment)) {
    if (key === 'DATABASE_URL' || key.startsWith('PG')) delete environment[key];
  }
  return {
    ...environment,
    ...connectionEnvironment,
    PGAPPNAME: 'p4g-r1-snapshot',
    PGCLIENTENCODING: 'UTF8',
    PGOPTIONS:
      '-c default_transaction_read_only=on '
      + '-c statement_timeout=30000 '
      + '-c lock_timeout=3000',
  };
}

function parseNotBefore(value) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) {
    fail('--not-before must be an ISO timestamp');
  }
  return parsed;
}

export function captureSnapshot({
  credentialFile: credentialFileInput,
  outputFile: outputFileInput,
  notBefore,
  psqlBinary = 'psql',
  sourceEnvironment = process.env,
}) {
  const credentialFile = validateManagedCredentialPath(credentialFileInput);
  let outputFile;
  let outputFd;
  let outputCreated = false;
  let connectionEnvironment;
  try {
    outputFile = path.resolve(outputFileInput);
    const earliest = parseNotBefore(notBefore);
    if (path.extname(outputFile) !== '.tsv') {
      fail('snapshot output must use a .tsv extension');
    }
    if (!psqlBinary) fail('psql binary is required');

    connectionEnvironment = readConnectionEnvironment(credentialFile);
    outputFd = fs.openSync(outputFile, 'wx', 0o600);
    outputCreated = true;

    const result = spawnSync(
      psqlBinary,
      ['-X', '-q', '-v', 'ON_ERROR_STOP=1', '-f', SNAPSHOT_SQL],
      {
        env: isolatedChildEnvironment(connectionEnvironment, sourceEnvironment),
        stdio: ['ignore', outputFd, 'pipe'],
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
      },
    );
    fs.fsyncSync(outputFd);
    fs.closeSync(outputFd);
    outputFd = undefined;

    if (result.error) fail('psql process could not be started');
    if (result.status !== 0) {
      fail(`psql snapshot failed with exit ${result.status ?? 'unknown'}`);
    }

    const outputBytes = fs.readFileSync(outputFile);
    const snapshot = parseSnapshot(outputBytes.toString('utf8'));
    const capturedAt = new Date(snapshot.timestamp);
    if (capturedAt < earliest) {
      fail(
        `snapshot timestamp ${snapshot.timestamp} precedes required ${earliest.toISOString()}`,
      );
    }

    return {
      schema: 'platform-reliability-r1-db-capture-receipt.v1',
      status: 'ok',
      capturedAt: snapshot.timestamp,
      outputSha256: crypto.createHash('sha256').update(outputBytes).digest('hex'),
      outputBytes: outputBytes.length,
      readOnly: snapshot.readOnly,
      completionSentinel: 'ok',
      credentialFileConsumed: true,
      credentialInArgv: false,
      secretsCaptured: false,
    };
  } catch (error) {
    if (outputFd !== undefined) fs.closeSync(outputFd);
    if (outputCreated && outputFile) fs.rmSync(outputFile, { force: true });
    throw error;
  } finally {
    if (connectionEnvironment) connectionEnvironment.PGPASSWORD = '';
    fs.rmSync(credentialFile, { force: true });
  }
}

function parseArgs(argv) {
  const args = {};
  const allowed = new Set(['url-file', 'output', 'not-before']);
  for (let index = 0; index < argv.length; index += 2) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) {
      fail('arguments must be --key value pairs');
    }
    const name = key.slice(2);
    if (!allowed.has(name)) fail(`unknown option --${name}`);
    if (Object.hasOwn(args, name)) fail(`duplicate option --${name}`);
    args[name] = value;
  }
  for (const required of allowed) {
    if (!args[required]) fail(`missing --${required}`);
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const receipt = captureSnapshot({
    credentialFile: args['url-file'],
    outputFile: args.output,
    notBefore: args['not-before'],
  });
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`platform-reliability-r1-db-capture: ${error.message}\n`);
    process.exitCode = 1;
  }
}
