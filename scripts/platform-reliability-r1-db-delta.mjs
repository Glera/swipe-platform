#!/usr/bin/env node

import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GIB = 1024 ** 3;

function fail(message) {
  throw new Error(message);
}

function integer(value, label) {
  if (!/^-?\d+$/.test(value ?? '')) fail(`${label} must be an integer`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) fail(`${label} exceeds safe integer range`);
  if (parsed < 0) fail(`${label} must be non-negative`);
  return parsed;
}

function finiteNumber(value, label) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${label} must be a finite JSON number`);
  }
  return value;
}

function one(rows, marker, predicate = () => true) {
  const matches = rows.filter((row) => row[0] === marker && predicate(row));
  if (matches.length !== 1) {
    fail(`expected exactly one ${marker} row, got ${matches.length}`);
  }
  return matches[0];
}

export function parseSnapshot(raw) {
  const rows = raw
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line) => line.split('\t'));

  const meta = one(rows, 'snapshot_meta');
  const schema = one(rows, 'schema');
  const relations = one(rows, 'relation_totals');
  const exactSummary = one(rows, 'exact_row_summary');
  const complete = one(rows, 'snapshot_complete');
  const databaseStats = one(
    rows,
    'runtime',
    (row) => row[1] === 'database_stats',
  );

  if (meta[3] !== 'on') fail('snapshot was not captured READ ONLY');
  if (meta[4] !== 'UTC') fail(`snapshot timezone must be UTC, got ${meta[4]}`);
  if (!meta[2]) fail('snapshot requires a server-derived database identity');
  if (complete[1] !== 'ok') fail('snapshot completion sentinel is invalid');

  const timestamp = new Date(meta[1]);
  if (Number.isNaN(timestamp.getTime())) fail(`invalid snapshot timestamp: ${meta[1]}`);

  const exactRows = new Map();
  for (const row of rows.filter((candidate) => candidate[0] === 'exact_row_count')) {
    if (!row[1]) fail('exact_row_count requires a table identity');
    if (exactRows.has(row[1])) fail(`duplicate exact_row_count for ${row[1]}`);
    exactRows.set(row[1], integer(row[2], `${row[1]} exact rows`));
  }
  const nonemptyRelationCount = integer(exactSummary[1], 'exact nonempty count');
  const exactRowsTotal = integer(exactSummary[2], 'exact rows total');
  if (exactRows.size !== nonemptyRelationCount) {
    fail(
      'exact_row_count coverage does not match exact-row summary '
      + `(${exactRows.size} != ${nonemptyRelationCount})`,
    );
  }
  const mappedExactRowsTotal =
    [...exactRows.values()].reduce((sum, rowCount) => sum + rowCount, 0);
  if (mappedExactRowsTotal !== exactRowsTotal) {
    fail(
      'exact_row_count total does not match exact-row summary '
      + `(${mappedExactRowsTotal} != ${exactRowsTotal})`,
    );
  }

  return {
    evidenceKind: 'collector-tsv',
    renderServiceId: null,
    timestamp: timestamp.toISOString(),
    observationTimes: {
      database: timestamp.toISOString(),
      relations: timestamp.toISOString(),
      rows: timestamp.toISOString(),
      deadlocks: timestamp.toISOString(),
    },
    database: meta[2],
    readOnly: meta[3] === 'on',
    timezone: meta[4],
    postgresVersionNum: meta[5],
    databaseBytes: integer(meta[6], 'database bytes'),
    publicTableCount: integer(schema[1], 'public table count'),
    alembicHeads: schema[2],
    relationCount: integer(relations[1], 'relation count'),
    nonemptyRelationCount,
    relationBytes: integer(relations[3], 'relation bytes'),
    heapBytes: integer(relations[5], 'heap bytes'),
    indexBytes: integer(relations[7], 'index bytes'),
    exactRows,
    exactRowsTotal,
    exactRowsByTableComplete: true,
    databaseStats: {
      commits: integer(databaseStats[2], 'commits'),
      rollbacks: integer(databaseStats[3], 'rollbacks'),
      blocksRead: integer(databaseStats[4], 'blocks read'),
      blocksHit: integer(databaseStats[5], 'blocks hit'),
      tempFiles: integer(databaseStats[6], 'temp files'),
      tempBytes: integer(databaseStats[7], 'temp bytes'),
      deadlocks: integer(databaseStats[8], 'deadlocks'),
      conflicts: integer(databaseStats[9], 'conflicts'),
      statsReset: databaseStats[10] || null,
    },
  };
}

function baselineInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) {
    fail(`${label} must be a non-negative safe integer`);
  }
  return value;
}

export function parseBaseline(raw) {
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return parseSnapshot(raw);

  let baseline;
  try {
    baseline = JSON.parse(trimmed);
  } catch {
    fail('baseline JSON is invalid');
  }
  if (baseline?.schema !== 'platform-reliability-r1-db-snapshot-baseline.v1') {
    fail('unsupported database baseline schema');
  }
  if (
    baseline.readOnly !== true
    || baseline.timezone !== 'UTC'
    || baseline.provenance?.databaseQueryReceipt
      !== 'platform-reliability-r1-0-db-query-receipt.json'
    || typeof baseline.provenance?.databaseQueryReceiptSha256 !== 'string'
    || !/^[a-f0-9]{64}$/.test(baseline.provenance.databaseQueryReceiptSha256)
  ) {
    fail('baseline must prove READ ONLY, UTC, and exact DB-query receipt provenance');
  }
  if (
    typeof baseline.renderServiceId !== 'string'
    || baseline.renderServiceId.trim().length === 0
  ) {
    fail('baseline requires a Render service identity');
  }
  if (typeof baseline.database !== 'string' || baseline.database.trim().length === 0) {
    fail('baseline requires a server-derived database identity');
  }
  const timestamp = new Date(baseline.timestamp);
  if (Number.isNaN(timestamp.getTime())) fail(`invalid baseline timestamp: ${baseline.timestamp}`);

  const baselineExactRowsTotal =
    baselineInteger(baseline.exactRowsTotal, 'exact rows total');
  const baselineNonemptyRelationCount = baselineInteger(
    baseline.nonemptyRelationCount,
    'nonempty relation count',
  );
  const exactRowsByTable = baseline.exactRowsByTable;
  let exactRows = null;
  if (exactRowsByTable !== null) {
    if (
      typeof exactRowsByTable !== 'object'
      || Array.isArray(exactRowsByTable)
    ) {
      fail('exactRowsByTable must be an object or null');
    }
    exactRows = new Map(Object.entries(exactRowsByTable).map(([table, rows]) => {
      const parsedRows = baselineInteger(rows, `${table} exact rows`);
      if (parsedRows === 0) fail(`${table} must be omitted when its exact rows are zero`);
      return [table, parsedRows];
    }));
    const mappedTotal = [...exactRows.values()].reduce((sum, rows) => sum + rows, 0);
    if (mappedTotal !== baselineExactRowsTotal) {
      fail('exactRowsByTable does not sum to exactRowsTotal');
    }
    if (exactRows.size !== baselineNonemptyRelationCount) {
      fail('exactRowsByTable size does not match nonemptyRelationCount');
    }
  }

  const databaseStats = baseline.databaseStats;
  if (!databaseStats || typeof databaseStats !== 'object') {
    fail('baseline requires databaseStats');
  }
  return {
    evidenceKind: 'reconstructed-aggregate-baseline',
    renderServiceId: baseline.renderServiceId,
    timestamp: timestamp.toISOString(),
    observationTimes: Object.fromEntries(
      ['database', 'relations', 'rows', 'deadlocks'].map((surface) => {
        const value = baseline.observationTimes?.[surface];
        if (typeof value !== 'string') {
          fail(`baseline observationTimes.${surface} must be an ISO timestamp`);
        }
        const parsed = new Date(value);
        if (Number.isNaN(parsed.getTime())) {
          fail(`invalid baseline observationTimes.${surface}: ${value}`);
        }
        return [surface, parsed.toISOString()];
      }),
    ),
    database: baseline.database,
    readOnly: true,
    timezone: 'UTC',
    postgresVersionNum: String(baseline.postgresVersionNum),
    databaseBytes: baselineInteger(baseline.databaseBytes, 'database bytes'),
    publicTableCount: baselineInteger(
      baseline.publicTableCount,
      'public table count',
    ),
    alembicHeads: baseline.alembicHeads,
    relationCount: baselineInteger(baseline.relationCount, 'relation count'),
    nonemptyRelationCount: baselineNonemptyRelationCount,
    relationBytes: baselineInteger(baseline.relationBytes, 'relation bytes'),
    heapBytes: baselineInteger(baseline.heapBytes, 'heap bytes'),
    indexBytes: baselineInteger(baseline.indexBytes, 'index bytes'),
    exactRows,
    exactRowsTotal: baselineExactRowsTotal,
    exactRowsByTableComplete: exactRows !== null,
    databaseStats: {
      commits: baselineInteger(databaseStats.commits, 'commits'),
      rollbacks: baselineInteger(databaseStats.rollbacks, 'rollbacks'),
      blocksRead: baselineInteger(databaseStats.blocksRead, 'blocks read'),
      blocksHit: baselineInteger(databaseStats.blocksHit, 'blocks hit'),
      tempFiles: baselineInteger(databaseStats.tempFiles, 'temp files'),
      tempBytes: baselineInteger(databaseStats.tempBytes, 'temp bytes'),
      deadlocks: baselineInteger(databaseStats.deadlocks, 'deadlocks'),
      conflicts: baselineInteger(databaseStats.conflicts, 'conflicts'),
      statsReset: databaseStats.statsReset ?? null,
    },
    provenance: {
      databaseQueryReceipt: baseline.provenance.databaseQueryReceipt,
      databaseQueryReceiptSha256:
        baseline.provenance.databaseQueryReceiptSha256,
    },
  };
}

export function verifyBaselineProvenance(snapshot, baselinePath) {
  if (snapshot.evidenceKind !== 'reconstructed-aggregate-baseline') return;
  const receiptPath = path.resolve(
    path.dirname(baselinePath),
    snapshot.provenance.databaseQueryReceipt,
  );
  const receiptBytes = fs.readFileSync(receiptPath);
  const actualDigest = crypto.createHash('sha256').update(receiptBytes).digest('hex');
  if (actualDigest !== snapshot.provenance.databaseQueryReceiptSha256) {
    fail('database query receipt digest does not match aggregate baseline');
  }
  let receipt;
  try {
    receipt = JSON.parse(receiptBytes);
  } catch {
    fail('database query receipt JSON is invalid');
  }
  if (
    receipt?.schema !== 'platform-reliability-r1-db-query-receipt.v1'
    || receipt.renderServiceId !== snapshot.renderServiceId
    || typeof receipt.capturedAt !== 'string'
    || new Date(receipt.capturedAt).getTime()
      !== new Date(snapshot.timestamp).getTime()
    || receipt.mutationsPerformed !== false
    || receipt.secretsCaptured !== false
  ) {
    fail('database query receipt identity or safety contract does not match baseline');
  }
  if (!receipt.source?.transactionGuard?.includes('default_transaction_read_only=on')) {
    fail('database query receipt does not preserve the READ ONLY guard');
  }

  const receiptObservationTimes = new Map();
  function selectedOutput(callId) {
    const matches = receipt.observations?.filter(
      (observation) => observation.callId === callId,
    ) ?? [];
    if (
      matches.length !== 1
      || typeof matches[0].selectedOutput !== 'string'
      || typeof matches[0].fullOutput !== 'string'
      || typeof matches[0].responseTimestamp !== 'string'
      || !/^[a-f0-9]{64}$/.test(matches[0].fullOutputSha256 ?? '')
    ) {
      fail(`database query receipt requires one hashed ${callId} observation`);
    }
    const fullOutputDigest = crypto
      .createHash('sha256')
      .update(matches[0].fullOutput)
      .digest('hex');
    if (fullOutputDigest !== matches[0].fullOutputSha256) {
      fail(`database query receipt ${callId} fullOutput digest mismatch`);
    }
    if (!matches[0].fullOutput.includes(matches[0].selectedOutput)) {
      fail(`database query receipt ${callId} selectedOutput is not in fullOutput`);
    }
    const responseTimestamp = new Date(matches[0].responseTimestamp);
    if (Number.isNaN(responseTimestamp.getTime())) {
      fail(`database query receipt ${callId} responseTimestamp is invalid`);
    }
    receiptObservationTimes.set(callId, responseTimestamp.toISOString());
    return matches[0].selectedOutput;
  }

  const serverIdentity =
    selectedOutput('call_WAgay0vJbFMwSOKvDvr8LJk1').split('|');
  const meta = selectedOutput('call_iibpAOgLzpvsPq81tY8TMl7s').split('\t');
  const schemaLines = selectedOutput('call_sQZryqGlw7AHUiKxGfw5jXTM')
    .split('\n')
    .map((line) => line.split('\t'));
  const schemaMap = new Map(schemaLines);
  const relations = selectedOutput('call_qvZ6BdFds2tGEuoc3FPUGd08').split('\t');
  const exact = selectedOutput('call_WblVfuixrAyhOtNuiJqVIB3F').split('|');
  const stats = selectedOutput('call_SNUk8YuiuOIsMS87p9E0gNgX').split('\t');

  const receiptFacts = {
    database: serverIdentity[0],
    readOnly: serverIdentity[1] === 'on',
    postgresVersionNum: serverIdentity[2],
    timestamp: new Date(meta[0]).toISOString(),
    databaseBytes: integer(meta[1], 'receipt database bytes'),
    alembicHeads: schemaMap.get('alembic_heads'),
    publicTableCount: integer(
      schemaMap.get('public_tables'),
      'receipt public table count',
    ),
    relationCount: integer(relations[0], 'receipt relation count'),
    relationBytes: integer(relations[2], 'receipt relation bytes'),
    heapBytes: integer(relations[4], 'receipt heap bytes'),
    indexBytes: integer(relations[6], 'receipt index bytes'),
    exactRowsTotal: integer(exact[0], 'receipt exact rows total'),
    nonemptyRelationCount: integer(exact[1], 'receipt exact nonempty count'),
    databaseStats: {
      commits: integer(stats[1], 'receipt commits'),
      rollbacks: integer(stats[2], 'receipt rollbacks'),
      blocksRead: integer(stats[3], 'receipt blocks read'),
      blocksHit: integer(stats[4], 'receipt blocks hit'),
      tempFiles: integer(stats[6], 'receipt temp files'),
      tempBytes: integer(stats[7], 'receipt temp bytes'),
      deadlocks: integer(stats[8], 'receipt deadlocks'),
      conflicts: integer(stats[9], 'receipt conflicts'),
      statsReset: stats[10] || null,
    },
  };
  for (const key of [
    'database',
    'readOnly',
    'postgresVersionNum',
    'timestamp',
    'databaseBytes',
    'alembicHeads',
    'publicTableCount',
    'relationCount',
    'relationBytes',
    'heapBytes',
    'indexBytes',
    'exactRowsTotal',
    'nonemptyRelationCount',
  ]) {
    if (snapshot[key] !== receiptFacts[key]) {
      fail(`aggregate baseline ${key} does not match DB-query receipt`);
    }
  }
  for (const [key, value] of Object.entries(receiptFacts.databaseStats)) {
    if (snapshot.databaseStats[key] !== value) {
      fail(`aggregate baseline databaseStats.${key} does not match DB-query receipt`);
    }
  }
  const expectedObservationTimes = {
    database: receiptObservationTimes.get('call_iibpAOgLzpvsPq81tY8TMl7s'),
    relations: receiptObservationTimes.get('call_qvZ6BdFds2tGEuoc3FPUGd08'),
    rows: receiptObservationTimes.get('call_WblVfuixrAyhOtNuiJqVIB3F'),
    deadlocks: receiptObservationTimes.get('call_SNUk8YuiuOIsMS87p9E0gNgX'),
  };
  for (const [surface, value] of Object.entries(expectedObservationTimes)) {
    if (snapshot.observationTimes[surface] !== value) {
      fail(`aggregate baseline observationTimes.${surface} does not match receipt`);
    }
  }
}

export function verifyCaptureReceipt(snapshot, snapshotBytes, receipt) {
  if (
    receipt?.schema !== 'platform-reliability-r1-db-capture-receipt.v1'
    || receipt.status !== 'ok'
    || receipt.readOnly !== true
    || receipt.completionSentinel !== 'ok'
    || receipt.credentialFileConsumed !== true
    || receipt.credentialInArgv !== false
    || receipt.secretsCaptured !== false
  ) {
    fail('capture receipt does not prove the required secure completed capture');
  }
  if (
    !Number.isSafeInteger(receipt.outputBytes)
    || receipt.outputBytes < 1
    || receipt.outputBytes !== snapshotBytes.length
  ) {
    fail('capture receipt outputBytes does not match snapshot bytes');
  }
  if (
    typeof receipt.outputSha256 !== 'string'
    || !/^[a-f0-9]{64}$/.test(receipt.outputSha256)
  ) {
    fail('capture receipt outputSha256 is invalid');
  }
  const actualDigest = crypto
    .createHash('sha256')
    .update(snapshotBytes)
    .digest('hex');
  if (actualDigest !== receipt.outputSha256) {
    fail('capture receipt digest does not match snapshot bytes');
  }
  const capturedAt = new Date(receipt.capturedAt);
  if (
    typeof receipt.capturedAt !== 'string'
    || Number.isNaN(capturedAt.getTime())
    || capturedAt.toISOString() !== snapshot.timestamp
  ) {
    fail('capture receipt timestamp does not match server snapshot timestamp');
  }
}

function providerObservation(receipt) {
  if (receipt?.schema !== 'platform-reliability-r1-render-observation.v1') {
    fail('unsupported Render receipt schema');
  }
  if (typeof receipt.observedAt !== 'string' || receipt.observedAt.trim().length === 0) {
    fail('Render observedAt must be a non-empty string');
  }
  const observedAt = new Date(receipt.observedAt);
  if (Number.isNaN(observedAt.getTime())) fail('invalid Render observedAt');
  if (
    typeof receipt?.database?.name !== 'string'
    || receipt.database.name.trim().length === 0
    || typeof receipt.database.serviceId !== 'string'
    || receipt.database.serviceId.trim().length === 0
    || typeof receipt.database.logicalDatabaseName !== 'string'
    || receipt.database.logicalDatabaseName.trim().length === 0
  ) {
    fail(
      'Render receipt requires non-empty service name, serviceId, and logicalDatabaseName',
    );
  }
  if (receipt.mutationsPerformed !== false || receipt.secretsCaptured !== false) {
    fail('Render receipt must prove no mutations and no captured secrets');
  }

  const storage = receipt?.database?.storage;
  const allocatedGiB = finiteNumber(storage?.allocatedGiB, 'allocatedGiB');
  const allocatedBytes = allocatedGiB * GIB;
  if (!Number.isSafeInteger(allocatedBytes) || allocatedBytes <= 0) {
    fail('allocated storage bytes must be a positive safe integer');
  }

  if (storage.usedBytes !== undefined) {
    const measuredBytes = baselineInteger(storage.usedBytes, 'usedBytes');
    return {
      observedAt: observedAt.toISOString(),
      logicalDatabaseName: receipt.database.logicalDatabaseName,
      allocatedBytes,
      measuredBytes,
      uncertaintyBytes: 0,
      source: 'usedBytes',
    };
  }

  const usedPercent = finiteNumber(storage?.usedPercent, 'usedPercent');
  const precisionPercentagePoints = finiteNumber(
    storage?.displayPrecisionPercentagePoints,
    'displayPrecisionPercentagePoints',
  );
  if (usedPercent < 0 || usedPercent > 100 || precisionPercentagePoints <= 0) {
    fail('provider percentage inputs are outside valid bounds');
  }
  return {
    observedAt: observedAt.toISOString(),
    logicalDatabaseName: receipt.database.logicalDatabaseName,
    allocatedBytes,
    measuredBytes: Math.round(allocatedBytes * usedPercent / 100),
    uncertaintyBytes: Math.ceil(
      allocatedBytes * (precisionPercentagePoints / 2) / 100,
    ),
    source: `usedPercent (${precisionPercentagePoints} percentage-point display precision)`,
  };
}

function delta(after, before) {
  return after - before;
}

function perDay(value, elapsedHours) {
  return value * 24 / elapsedHours;
}

export function compareSnapshots(before, after, beforeReceipt, afterReceipt) {
  if (before.database !== after.database) {
    fail('database identity changed');
  }
  const surfaceWindows = {};
  for (const surface of ['database', 'relations', 'rows', 'deadlocks']) {
    const surfaceStart = new Date(before.observationTimes[surface]);
    const surfaceEnd = new Date(after.observationTimes[surface]);
    const surfaceElapsedHours = (surfaceEnd - surfaceStart) / 3_600_000;
    if (!(surfaceElapsedHours > 0)) {
      fail(`${surface} observation order must be strictly increasing`);
    }
    surfaceWindows[surface] = {
      before: surfaceStart.toISOString(),
      after: surfaceEnd.toISOString(),
      elapsedHours: surfaceElapsedHours,
    };
  }
  const start = new Date(surfaceWindows.database.before);
  const end = new Date(surfaceWindows.database.after);
  const elapsedHours = surfaceWindows.database.elapsedHours;

  const providerBefore = providerObservation(beforeReceipt);
  const providerAfter = providerObservation(afterReceipt);
  if (
    beforeReceipt.database.serviceId !== afterReceipt.database.serviceId
    || beforeReceipt.database.name !== afterReceipt.database.name
  ) {
    fail('Render database identity changed');
  }
  if (
    providerBefore.logicalDatabaseName !== before.database
    || providerAfter.logicalDatabaseName !== after.database
  ) {
    fail('server-derived SQL database identity does not match Render receipt');
  }
  if (
    before.renderServiceId !== null
    && before.renderServiceId !== beforeReceipt.database.serviceId
  ) {
    fail('aggregate baseline Render service identity does not match receipt');
  }
  if (
    after.renderServiceId !== null
    && after.renderServiceId !== afterReceipt.database.serviceId
  ) {
    fail('aggregate after-snapshot Render service identity does not match receipt');
  }
  const providerElapsedHours =
    (new Date(providerAfter.observedAt) - new Date(providerBefore.observedAt))
    / 3_600_000;
  if (!(providerElapsedHours > 0)) {
    fail('Render observation order must be strictly increasing');
  }

  const providerDeltaEstimate = delta(
    providerAfter.measuredBytes,
    providerBefore.measuredBytes,
  );
  const providerDeltaUncertainty =
    providerBefore.uncertaintyBytes + providerAfter.uncertaintyBytes;

  const tableRowsComparable =
    before.exactRowsByTableComplete
    && after.exactRowsByTableComplete;
  const tableRowDeltas = tableRowsComparable
    ? [...new Set([...before.exactRows.keys(), ...after.exactRows.keys()])]
      .map((table) => {
        const beforeRows = before.exactRows.get(table) ?? 0;
        const afterRows = after.exactRows.get(table) ?? 0;
        return { table, beforeRows, afterRows, deltaRows: afterRows - beforeRows };
      })
      .sort((left, right) =>
        Math.abs(right.deltaRows) - Math.abs(left.deltaRows)
        || left.table.localeCompare(right.table),
      )
    : null;

  const exactRowsBefore = before.exactRowsTotal;
  const exactRowsAfter = after.exactRowsTotal;
  const cumulativeStatsKeys = [
    'commits',
    'rollbacks',
    'blocksRead',
    'blocksHit',
    'tempFiles',
    'tempBytes',
    'deadlocks',
    'conflicts',
  ];
  const cumulativeStatsMonotonic = cumulativeStatsKeys.every(
    (key) => after.databaseStats[key] >= before.databaseStats[key],
  );
  const deadlocksComparable =
    before.databaseStats.statsReset === after.databaseStats.statsReset
    && cumulativeStatsMonotonic;
  const deadlockDelta = deadlocksComparable
    ? after.databaseStats.deadlocks - before.databaseStats.deadlocks
    : null;

  const relationBytesDelta = delta(after.relationBytes, before.relationBytes);
  const databaseBytesDelta = delta(after.databaseBytes, before.databaseBytes);
  const exactRowsDelta = exactRowsAfter - exactRowsBefore;
  const warnings = [];
  if (before.alembicHeads !== after.alembicHeads) {
    warnings.push(
      `Alembic identity changed: ${before.alembicHeads} -> ${after.alembicHeads}`,
    );
  }
  if (!deadlocksComparable) {
    warnings.push('deadlock delta is inconclusive because pg_stat_database reset or decreased');
  }
  if (providerDeltaUncertainty > 0) {
    warnings.push('provider delta is bounded by dashboard percentage quantization');
  }
  if (providerBefore.allocatedBytes !== providerAfter.allocatedBytes) {
    warnings.push('provider allocated storage changed inside the comparison window');
  }
  if (!tableRowsComparable) {
    warnings.push(
      'per-table row delta is unavailable because snapshot 1 retained only the exact aggregate',
    );
  }
  const providerSkewBeforeSeconds =
    (new Date(providerBefore.observedAt)
      - new Date(surfaceWindows.relations.before)) / 1_000;
  const providerSkewAfterSeconds =
    (new Date(providerAfter.observedAt)
      - new Date(surfaceWindows.relations.after)) / 1_000;
  const providerRelationComparable =
    Math.abs(providerSkewBeforeSeconds) <= 900
    && Math.abs(providerSkewAfterSeconds) <= 900;
  if (!providerRelationComparable) {
    warnings.push(
      'provider-vs-relation comparison is inconclusive because endpoint skew exceeds 15 minutes',
    );
  }
  const beforeSurfaceTimes = Object.values(before.observationTimes)
    .map((value) => new Date(value).getTime());
  const beforeSurfaceSpreadSeconds =
    (Math.max(...beforeSurfaceTimes) - Math.min(...beforeSurfaceTimes)) / 1_000;
  if (beforeSurfaceSpreadSeconds > 0) {
    warnings.push(
      `snapshot 1 aggregate surfaces were observed across ${beforeSurfaceSpreadSeconds} seconds`,
    );
  }

  return {
    schema: 'platform-reliability-r1-snapshot-delta.v1',
    window: {
      before: before.timestamp,
      after: after.timestamp,
      elapsedHours,
      surfaces: surfaceWindows,
      providerBefore: providerBefore.observedAt,
      providerAfter: providerAfter.observedAt,
      providerElapsedHours,
      providerSkewBeforeSeconds,
      providerSkewAfterSeconds,
    },
    identity: {
      database: after.database ?? before.database,
      renderServiceId: beforeReceipt.database.serviceId,
      alembicBefore: before.alembicHeads,
      alembicAfter: after.alembicHeads,
    },
    providerStorage: {
      before: providerBefore,
      after: providerAfter,
      deltaEstimateBytes: providerDeltaEstimate,
      deltaLowerBoundBytes: providerDeltaEstimate - providerDeltaUncertainty,
      deltaUpperBoundBytes: providerDeltaEstimate + providerDeltaUncertainty,
      deltaEstimateBytesPerDay: perDay(providerDeltaEstimate, providerElapsedHours),
    },
    database: {
      beforeBytes: before.databaseBytes,
      afterBytes: after.databaseBytes,
      deltaBytes: databaseBytesDelta,
      deltaBytesPerDay: perDay(databaseBytesDelta, elapsedHours),
    },
    relations: {
      beforeBytes: before.relationBytes,
      afterBytes: after.relationBytes,
      deltaBytes: relationBytesDelta,
      deltaBytesPerDay:
        perDay(relationBytesDelta, surfaceWindows.relations.elapsedHours),
      providerComparisonComparable: providerRelationComparable,
      providerMinusRelationDeltaEstimateBytesPerDay:
        providerRelationComparable
          ? perDay(providerDeltaEstimate, providerElapsedHours)
            - perDay(relationBytesDelta, surfaceWindows.relations.elapsedHours)
          : null,
    },
    rows: {
      before: exactRowsBefore,
      after: exactRowsAfter,
      delta: exactRowsDelta,
      deltaPerDay: perDay(exactRowsDelta, surfaceWindows.rows.elapsedHours),
      byTableComparable: tableRowsComparable,
      byTable: tableRowDeltas,
    },
    deadlocks: {
      before: before.databaseStats.deadlocks,
      after: after.databaseStats.deadlocks,
      statsResetBefore: before.databaseStats.statsReset,
      statsResetAfter: after.databaseStats.statsReset,
      comparable: deadlocksComparable,
      cumulativeStatsMonotonic,
      delta: deadlockDelta,
      deltaPerDay: deadlockDelta === null
        ? null
        : perDay(deadlockDelta, surfaceWindows.deadlocks.elapsedHours),
    },
    warnings,
  };
}

function formatNumber(value, digits = 2) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(value);
}

export function toMarkdown(result) {
  const provider = result.providerStorage;
  const lines = [
    '# Platform Reliability R1 — snapshot delta',
    '',
    `Database-size window: \`${result.window.before}\` → \`${result.window.after}\` `
      + `(${formatNumber(result.window.elapsedHours)} hours).`,
    `Render provider window: \`${result.window.providerBefore}\` → `
      + `\`${result.window.providerAfter}\` `
      + `(${formatNumber(result.window.providerElapsedHours)} hours).`,
    '',
    '| Surface | Window | Delta | Normalized / day |',
    '|---|---:|---:|---:|',
    `| Render provider storage | ${formatNumber(result.window.providerElapsedHours)}h | `
      + `${formatNumber(provider.deltaEstimateBytes)} bytes `
      + `(${formatNumber(provider.deltaLowerBoundBytes)}…`
      + `${formatNumber(provider.deltaUpperBoundBytes)}) | `
      + `${formatNumber(provider.deltaEstimateBytesPerDay)} bytes |`,
    `| pg_database_size | ${formatNumber(result.window.surfaces.database.elapsedHours)}h | `
      + `${formatNumber(result.database.deltaBytes)} bytes | `
      + `${formatNumber(result.database.deltaBytesPerDay)} bytes |`,
    `| User relations | ${formatNumber(result.window.surfaces.relations.elapsedHours)}h | `
      + `${formatNumber(result.relations.deltaBytes)} bytes | `
      + `${formatNumber(result.relations.deltaBytesPerDay)} bytes |`,
    `| Exact rows | ${formatNumber(result.window.surfaces.rows.elapsedHours)}h | `
      + `${formatNumber(result.rows.delta)} | `
      + `${formatNumber(result.rows.deltaPerDay)} |`,
    `| Deadlocks | ${formatNumber(result.window.surfaces.deadlocks.elapsedHours)}h | `
      + `${result.deadlocks.delta ?? 'inconclusive'} | `
      + `${result.deadlocks.deltaPerDay === null
        ? 'inconclusive'
        : formatNumber(result.deadlocks.deltaPerDay)} |`,
    '',
  ];
  if (result.rows.byTableComparable) {
    lines.push(
      '## Largest row deltas',
      '',
      '| Table | Before | After | Delta |',
      '|---|---:|---:|---:|',
      ...result.rows.byTable.slice(0, 15).map(
        (row) => `| \`${row.table}\` | ${row.beforeRows} | ${row.afterRows} | ${row.deltaRows} |`,
      ),
    );
  } else {
    lines.push(
      '## Per-table row deltas',
      '',
      'Unavailable for this pair: snapshot 1 retained only the exact aggregate row count.',
    );
  }
  if (result.warnings.length) {
    lines.push('', '## Warnings', '', ...result.warnings.map((warning) => `- ${warning}`));
  }
  return `${lines.join('\n')}\n`;
}

function parseArgs(argv) {
  const args = {};
  const allowed = new Set([
    'before',
    'after',
    'capture-after',
    'provider-before',
    'provider-after',
    'format',
  ]);
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith('--') || value === undefined) fail('arguments must be --key value pairs');
    const name = key.slice(2);
    if (!allowed.has(name)) fail(`unknown option --${name}`);
    if (Object.hasOwn(args, name)) fail(`duplicate option --${name}`);
    args[name] = value;
  }
  for (const required of [
    'before',
    'after',
    'capture-after',
    'provider-before',
    'provider-after',
  ]) {
    if (!args[required]) fail(`missing --${required}`);
  }
  if (args.format && !['json', 'markdown'].includes(args.format)) {
    fail('--format must be json or markdown');
  }
  return args;
}

export function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const beforePath = path.resolve(args.before);
  const afterPath = path.resolve(args.after);
  const snapshotBefore = parseBaseline(fs.readFileSync(beforePath, 'utf8'));
  const snapshotAfterBytes = fs.readFileSync(afterPath);
  const snapshotAfter = parseBaseline(snapshotAfterBytes.toString('utf8'));
  verifyBaselineProvenance(snapshotBefore, beforePath);
  verifyBaselineProvenance(snapshotAfter, afterPath);
  const captureAfterBytes = fs.readFileSync(path.resolve(args['capture-after']));
  const captureAfter = JSON.parse(captureAfterBytes.toString('utf8'));
  verifyCaptureReceipt(snapshotAfter, snapshotAfterBytes, captureAfter);
  const providerBefore = JSON.parse(
    fs.readFileSync(path.resolve(args['provider-before']), 'utf8'),
  );
  const providerAfter = JSON.parse(
    fs.readFileSync(path.resolve(args['provider-after']), 'utf8'),
  );
  const result = compareSnapshots(
    snapshotBefore,
    snapshotAfter,
    providerBefore,
    providerAfter,
  );
  result.provenance = {
    afterSnapshotSha256: captureAfter.outputSha256,
    captureAfterReceiptSha256: crypto
      .createHash('sha256')
      .update(captureAfterBytes)
      .digest('hex'),
  };
  process.stdout.write(
    args.format === 'markdown' ? toMarkdown(result) : `${JSON.stringify(result, null, 2)}\n`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`platform-reliability-r1-db-delta: ${error.message}\n`);
    process.exitCode = 1;
  }
}
