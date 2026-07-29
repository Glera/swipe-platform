import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  compareSnapshots,
  parseBaseline,
  parseSnapshot,
  toMarkdown,
  verifyBaselineProvenance,
  verifyCaptureReceipt,
} from './platform-reliability-r1-db-delta.mjs';

const SCRIPT = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'platform-reliability-r1-db-delta.mjs',
);

function snapshot({
  at,
  databaseBytes,
  relationBytes,
  deadlocks,
  statsReset = '',
  head = '0067',
  exact = [],
  readOnly = 'on',
  timezone = 'UTC',
  commits = '10',
  database = 'swipe',
}) {
  const nonemptyRelationCount = new Set(exact.map(([table]) => table)).size;
  const exactRowsTotal = exact.reduce((sum, [, rows]) => sum + Number(rows), 0);
  return [
    ['snapshot_meta', at, database, readOnly, timezone, '160014', databaseBytes, 'n/a'],
    ['schema', '145', head],
    [
      'relation_totals',
      '145',
      String(nonemptyRelationCount),
      relationBytes,
      'n/a',
      '100',
      'n/a',
      '200',
      'n/a',
    ],
    ...exact.map(([table, rows]) => ['exact_row_count', table, rows]),
    ['exact_row_summary', String(nonemptyRelationCount), String(exactRowsTotal)],
    ['runtime', 'database_stats', commits, '2', '3', '4', '0', '0', deadlocks, '0', statsReset],
    ['snapshot_complete', 'ok'],
  ].map((row) => row.join('\t')).join('\n');
}

function receipt({
  at,
  percent,
  usedBytes,
  serviceId = 'dpg-test',
  name = 'swipe-db',
  logicalDatabaseName = 'swipe',
}) {
  const storage = {
    allocatedGiB: 1,
    usedPercent: percent,
    displayPrecisionPercentagePoints: 0.1,
    autoscalingEnabled: false,
  };
  if (usedBytes !== undefined) storage.usedBytes = usedBytes;
  return {
    schema: 'platform-reliability-r1-render-observation.v1',
    observedAt: at,
    database: {
      name,
      serviceId,
      logicalDatabaseName,
      storage,
    },
    secretsCaptured: false,
    mutationsPerformed: false,
  };
}

function captureReceipt(snapshotBytes, capturedAt) {
  return {
    schema: 'platform-reliability-r1-db-capture-receipt.v1',
    status: 'ok',
    capturedAt,
    outputSha256: crypto
      .createHash('sha256')
      .update(snapshotBytes)
      .digest('hex'),
    outputBytes: Buffer.byteLength(snapshotBytes),
    readOnly: true,
    completionSentinel: 'ok',
    credentialFileConsumed: true,
    credentialInArgv: false,
    secretsCaptured: false,
  };
}

function aggregateBaseline(overrides = {}) {
  return {
    schema: 'platform-reliability-r1-db-snapshot-baseline.v1',
    timestamp: '2026-07-29T08:31:46Z',
    database: 'swipe',
    renderServiceId: 'dpg-test',
    observationTimes: {
      database: '2026-07-29T08:31:46Z',
      relations: '2026-07-29T08:31:46Z',
      rows: '2026-07-29T08:31:46Z',
      deadlocks: '2026-07-29T08:31:46Z',
    },
    readOnly: true,
    timezone: 'UTC',
    postgresVersionNum: '160014',
    databaseBytes: 1000,
    publicTableCount: 145,
    alembicHeads: '0067',
    relationCount: 145,
    nonemptyRelationCount: 2,
    relationBytes: 600,
    heapBytes: 100,
    indexBytes: 200,
    exactRowsTotal: 10,
    exactRowsByTable: null,
    databaseStats: {
      commits: 10,
      rollbacks: 2,
      blocksRead: 3,
      blocksHit: 4,
      tempFiles: 0,
      tempBytes: 0,
      deadlocks: 17,
      conflicts: 0,
      statsReset: null,
    },
    provenance: {
      databaseQueryReceipt: 'platform-reliability-r1-0-db-query-receipt.json',
      databaseQueryReceiptSha256: 'a'.repeat(64),
    },
    ...overrides,
  };
}

function queryReceiptForBaseline(baseline) {
  function observation(callId, selectedOutput) {
    const fullOutput = `Script completed\nOutput:\n${selectedOutput}\n`;
    return {
      callId,
      responseTimestamp: baseline.timestamp,
      selectedOutput,
      fullOutput,
      fullOutputSha256: crypto
        .createHash('sha256')
        .update(fullOutput)
        .digest('hex'),
    };
  }
  return {
    schema: 'platform-reliability-r1-db-query-receipt.v1',
    capturedAt: baseline.timestamp,
    renderServiceId: baseline.renderServiceId,
    source: {
      transactionGuard: 'PGOPTIONS=-c default_transaction_read_only=on',
    },
    observations: [
      observation(
        'call_WAgay0vJbFMwSOKvDvr8LJk1',
        `${baseline.database}|on|${baseline.postgresVersionNum}|n/a`,
      ),
      observation(
        'call_iibpAOgLzpvsPq81tY8TMl7s',
        `2026-07-29 08:31:46 UTC\t${baseline.databaseBytes}\tn/a`,
      ),
      observation(
        'call_sQZryqGlw7AHUiKxGfw5jXTM',
        `alembic_heads\t${baseline.alembicHeads}\n`
          + `public_tables\t${baseline.publicTableCount}`,
      ),
      observation(
        'call_qvZ6BdFds2tGEuoc3FPUGd08',
        `${baseline.relationCount}\t0\t${baseline.relationBytes}\tn/a\t`
          + `${baseline.heapBytes}\tn/a\t${baseline.indexBytes}\tn/a`,
      ),
      observation(
        'call_WblVfuixrAyhOtNuiJqVIB3F',
        `${baseline.exactRowsTotal}|${baseline.nonemptyRelationCount}`,
      ),
      observation(
        'call_SNUk8YuiuOIsMS87p9E0gNgX',
          `stats\t${baseline.databaseStats.commits}\t`
          + `${baseline.databaseStats.rollbacks}\t`
          + `${baseline.databaseStats.blocksRead}\t`
          + `${baseline.databaseStats.blocksHit}\t100.00\t`
          + `${baseline.databaseStats.tempFiles}\t`
          + `${baseline.databaseStats.tempBytes}\t`
          + `${baseline.databaseStats.deadlocks}\t`
          + `${baseline.databaseStats.conflicts}\t`
          + `${baseline.databaseStats.statsReset ?? ''}`,
      ),
    ],
    secretsCaptured: false,
    mutationsPerformed: false,
  };
}

test('compares provider, relation, row, and bounded deadlock deltas', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '17',
    exact: [['public.a', '10'], ['public.empties_later', '3']],
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1300',
    relationBytes: '800',
    deadlocks: '19',
    exact: [['public.a', '12'], ['public.new_table', '4']],
  }));
  const result = compareSnapshots(
    before,
    after,
    receipt({ at: before.timestamp, percent: 11.5 }),
    receipt({ at: after.timestamp, percent: 11.6 }),
  );

  assert.equal(result.database.deltaBytes, 300);
  assert.equal(result.relations.deltaBytes, 200);
  assert.equal(result.rows.delta, 3);
  assert.equal(result.deadlocks.comparable, true);
  assert.equal(result.deadlocks.delta, 2);
  assert.ok(
    result.providerStorage.deltaLowerBoundBytes
      < result.providerStorage.deltaEstimateBytes,
  );
  assert.ok(
    result.providerStorage.deltaUpperBoundBytes
      > result.providerStorage.deltaEstimateBytes,
  );
});

test('treats a missing exact_row_count row as zero instead of dropping the table', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '17',
    exact: [['public.became_empty', '7']],
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '17',
    exact: [],
  }));
  const result = compareSnapshots(
    before,
    after,
    receipt({ at: before.timestamp, usedBytes: 100 }),
    receipt({ at: after.timestamp, usedBytes: 100 }),
  );

  assert.deepEqual(result.rows.byTable, [{
    table: 'public.became_empty',
    beforeRows: 7,
    afterRows: 0,
    deltaRows: -7,
  }]);
  assert.equal(result.rows.delta, -7);
});

test('compares an aggregate-only snapshot 1 without inventing per-table rows', () => {
  const before = parseBaseline(JSON.stringify(aggregateBaseline()));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1300',
    relationBytes: '800',
    deadlocks: '18',
    exact: [['public.a', '8'], ['public.b', '5']],
  }));
  const result = compareSnapshots(
    before,
    after,
    receipt({ at: before.timestamp, usedBytes: 100 }),
    receipt({ at: after.timestamp, usedBytes: 150 }),
  );

  assert.equal(result.rows.before, 10);
  assert.equal(result.rows.after, 13);
  assert.equal(result.rows.delta, 3);
  assert.equal(result.rows.byTableComparable, false);
  assert.equal(result.rows.byTable, null);
  assert.match(result.warnings.join('\n'), /per-table row delta is unavailable/);
  assert.match(toMarkdown(result), /snapshot 1 retained only the exact aggregate/);
});

test('normalizes each reconstructed aggregate surface by its own window', () => {
  const before = parseBaseline(JSON.stringify(aggregateBaseline({
    observationTimes: {
      database: '2026-07-29T08:31:46Z',
      relations: '2026-07-29T06:31:46Z',
      rows: '2026-07-29T04:31:46Z',
      deadlocks: '2026-07-29T02:31:46Z',
    },
  })));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1100',
    relationBytes: '700',
    deadlocks: '18',
    exact: [['public.a', '14']],
  }));
  const result = compareSnapshots(
    before,
    after,
    receipt({ at: '2026-07-29T06:31:46Z', usedBytes: 100 }),
    receipt({ at: '2026-07-30T08:31:46Z', usedBytes: 150 }),
  );

  assert.equal(result.window.surfaces.database.elapsedHours, 24);
  assert.equal(result.window.surfaces.relations.elapsedHours, 26);
  assert.equal(result.window.surfaces.rows.elapsedHours, 28);
  assert.equal(result.window.surfaces.deadlocks.elapsedHours, 30);
  assert.equal(result.rows.deltaPerDay, 4 * 24 / 28);
  assert.equal(result.deadlocks.deltaPerDay, 24 / 30);
});

test('rejects an aggregate baseline without receipt provenance', () => {
  const invalid = aggregateBaseline({
    provenance: {},
  });
  assert.throws(
    () => parseBaseline(JSON.stringify(invalid)),
    /must prove READ ONLY, UTC, and exact DB-query receipt provenance/,
  );
});

test('rejects an aggregate baseline whose table map does not match its total', () => {
  const invalid = aggregateBaseline({
    exactRowsByTable: { 'public.a': 7 },
  });
  assert.throws(
    () => parseBaseline(JSON.stringify(invalid)),
    /does not sum to exactRowsTotal/,
  );
});

test('rejects an incomplete or zero-containing aggregate table map', () => {
  assert.throws(
    () => parseBaseline(JSON.stringify(aggregateBaseline({
      exactRowsByTable: { 'public.a': 10 },
    }))),
    /size does not match nonemptyRelationCount/,
  );
  assert.throws(
    () => parseBaseline(JSON.stringify(aggregateBaseline({
      exactRowsByTable: { 'public.a': 10, 'public.empty': 0 },
    }))),
    /must be omitted when its exact rows are zero/,
  );
});

test('marks deadlock delta inconclusive when stats_reset changes', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '17',
    statsReset: '2026-07-20 00:00:00 UTC',
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1100',
    relationBytes: '700',
    deadlocks: '1',
    statsReset: '2026-07-30 00:00:00 UTC',
  }));
  const result = compareSnapshots(
    before,
    after,
    receipt({ at: before.timestamp, usedBytes: 100 }),
    receipt({ at: after.timestamp, usedBytes: 110 }),
  );

  assert.equal(result.deadlocks.comparable, false);
  assert.equal(result.deadlocks.delta, null);
  assert.match(result.warnings.join('\n'), /deadlock delta is inconclusive/);
});

test('marks deadlock delta inconclusive when any cumulative DB counter decreases', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '17',
    commits: '100',
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1100',
    relationBytes: '700',
    deadlocks: '18',
    commits: '5',
  }));
  const result = compareSnapshots(
    before,
    after,
    receipt({ at: before.timestamp, usedBytes: 100 }),
    receipt({ at: after.timestamp, usedBytes: 110 }),
  );

  assert.equal(result.deadlocks.cumulativeStatsMonotonic, false);
  assert.equal(result.deadlocks.comparable, false);
  assert.equal(result.deadlocks.delta, null);
});

test('normalizes provider growth by its own observation window and reports skew', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '0',
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1100',
    relationBytes: '700',
    deadlocks: '0',
  }));
  const result = compareSnapshots(
    before,
    after,
    receipt({ at: '2026-07-29T08:31:46Z', usedBytes: 100 }),
    receipt({ at: '2026-07-31T08:31:46Z', usedBytes: 300 }),
  );

  assert.equal(result.window.elapsedHours, 24);
  assert.equal(result.window.providerElapsedHours, 48);
  assert.equal(result.providerStorage.deltaEstimateBytesPerDay, 100);
  assert.equal(result.relations.providerComparisonComparable, false);
  assert.equal(result.relations.providerMinusRelationDeltaEstimateBytesPerDay, null);
  assert.match(result.warnings.join('\n'), /endpoint skew exceeds 15 minutes/);
});

test('rejects negative counters and sizes as corrupted evidence', () => {
  assert.throws(
    () => parseSnapshot(snapshot({
      at: '2026-07-29 08:31:46 UTC',
      databaseBytes: '-1',
      relationBytes: '600',
      deadlocks: '0',
    })),
    /database bytes must be non-negative/,
  );
  assert.throws(
    () => parseSnapshot(snapshot({
      at: '2026-07-29 08:31:46 UTC',
      databaseBytes: '1000',
      relationBytes: '600',
      deadlocks: '0',
      exact: [['public.corrupt', '-1']],
    })),
    /exact rows must be non-negative/,
  );
});

test('rejects Render receipts without exact database identity', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '0',
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1100',
    relationBytes: '700',
    deadlocks: '0',
  }));
  const invalid = receipt({ at: before.timestamp, usedBytes: 100 });
  delete invalid.database.serviceId;

  assert.throws(
    () => compareSnapshots(
      before,
      after,
      invalid,
      receipt({ at: after.timestamp, usedBytes: 110 }),
    ),
    /requires non-empty service name, serviceId, and logicalDatabaseName/,
  );
});

test('binds every SQL snapshot to the Render logical database identity', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '0',
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1100',
    relationBytes: '700',
    deadlocks: '0',
  }));

  const wrongReceipt = receipt({
    at: before.timestamp,
    usedBytes: 100,
    logicalDatabaseName: 'another_database',
  });
  assert.throws(
    () => compareSnapshots(
      before,
      after,
      wrongReceipt,
      receipt({ at: after.timestamp, usedBytes: 110 }),
    ),
    /server-derived SQL database identity does not match Render receipt/,
  );
});

test('rejects null and coercive provider values and requires explicit precision', () => {
  const before = parseSnapshot(snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '0',
  }));
  const after = parseSnapshot(snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1100',
    relationBytes: '700',
    deadlocks: '0',
  }));
  const nullDate = receipt({ at: before.timestamp, percent: 11.5 });
  nullDate.observedAt = null;
  assert.throws(
    () => compareSnapshots(
      before,
      after,
      nullDate,
      receipt({ at: after.timestamp, percent: 11.6 }),
    ),
    /observedAt must be a non-empty string/,
  );

  const nullPercent = receipt({ at: before.timestamp, percent: 11.5 });
  nullPercent.database.storage.usedPercent = null;
  assert.throws(
    () => compareSnapshots(
      before,
      after,
      nullPercent,
      receipt({ at: after.timestamp, percent: 11.6 }),
    ),
    /usedPercent must be a finite JSON number/,
  );

  const missingPrecision = receipt({ at: before.timestamp, percent: 11.5 });
  delete missingPrecision.database.storage.displayPrecisionPercentagePoints;
  assert.throws(
    () => compareSnapshots(
      before,
      after,
      missingPrecision,
      receipt({ at: after.timestamp, percent: 11.6 }),
    ),
    /displayPrecisionPercentagePoints must be a finite JSON number/,
  );
});

test('rejects a snapshot without the READ ONLY and UTC guards', () => {
  assert.throws(
    () => parseSnapshot(snapshot({
      at: '2026-07-29 08:31:46 UTC',
      databaseBytes: '1000',
      relationBytes: '600',
      deadlocks: '0',
      readOnly: 'off',
    })),
    /not captured READ ONLY/,
  );
  assert.throws(
    () => parseSnapshot(snapshot({
      at: '2026-07-29 08:31:46 UTC',
      databaseBytes: '1000',
      relationBytes: '600',
      deadlocks: '0',
      timezone: 'Europe\\/Nicosia',
    })),
    /timezone must be UTC/,
  );
});

test('rejects a truncated exact-row section', () => {
  const raw = snapshot({
    at: '2026-07-29 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '0',
    exact: [['public.a', '1']],
  }).replace(
    'exact_row_summary\t1\t1',
    'exact_row_summary\t2\t1',
  );

  assert.throws(
    () => parseSnapshot(raw),
    /exact_row_count coverage does not match exact-row summary/,
  );
});

test('capture receipt byte-binds the exact snapshot and safety assertions', () => {
  const raw = snapshot({
    at: '2026-07-30 08:31:46 UTC',
    databaseBytes: '1000',
    relationBytes: '600',
    deadlocks: '17',
    exact: [['public.a', '10']],
  });
  const parsed = parseSnapshot(raw);
  const valid = captureReceipt(raw, '2026-07-30T08:31:46.000Z');
  assert.doesNotThrow(() => verifyCaptureReceipt(parsed, Buffer.from(raw), valid));

  assert.throws(
    () => verifyCaptureReceipt(parsed, Buffer.from(`${raw}\n`), valid),
    /outputBytes does not match snapshot bytes/,
  );
  assert.throws(
    () => verifyCaptureReceipt(
      parsed,
      Buffer.from(raw),
      { ...valid, outputSha256: '0'.repeat(64) },
    ),
    /digest does not match snapshot bytes/,
  );
  assert.throws(
    () => verifyCaptureReceipt(
      parsed,
      Buffer.from(raw),
      { ...valid, credentialInArgv: true },
    ),
    /does not prove the required secure completed capture/,
  );
  assert.throws(
    () => verifyCaptureReceipt(
      parsed,
      Buffer.from(raw),
      { ...valid, capturedAt: '2026-07-30T08:31:47.000Z' },
    ),
    /timestamp does not match server snapshot timestamp/,
  );
});

test('CLI emits machine JSON and reviewable Markdown', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-delta-'));
  try {
    const beforePath = path.join(temp, 'before.tsv');
    const afterPath = path.join(temp, 'after.tsv');
    const captureAfterPath = path.join(temp, 'capture-after.json');
    const providerBeforePath = path.join(temp, 'provider-before.json');
    const providerAfterPath = path.join(temp, 'provider-after.json');
    fs.writeFileSync(beforePath, snapshot({
      at: '2026-07-29 08:31:46 UTC',
      databaseBytes: '1000',
      relationBytes: '600',
      deadlocks: '17',
      exact: [['public.a', '10']],
    }));
    const afterBytes = snapshot({
      at: '2026-07-30 08:31:46 UTC',
      databaseBytes: '1200',
      relationBytes: '700',
      deadlocks: '17',
      exact: [['public.a', '11']],
    });
    fs.writeFileSync(afterPath, afterBytes);
    fs.writeFileSync(
      captureAfterPath,
      JSON.stringify(captureReceipt(afterBytes, '2026-07-30T08:31:46.000Z')),
    );
    fs.writeFileSync(
      providerBeforePath,
      JSON.stringify(receipt({ at: '2026-07-29T08:31:46Z', usedBytes: 100 })),
    );
    fs.writeFileSync(
      providerAfterPath,
      JSON.stringify(receipt({ at: '2026-07-30T08:31:46Z', usedBytes: 150 })),
    );
    const common = [
      '--before', beforePath,
      '--after', afterPath,
      '--capture-after', captureAfterPath,
      '--provider-before', providerBeforePath,
      '--provider-after', providerAfterPath,
    ];

    const json = JSON.parse(execFileSync('node', [SCRIPT, ...common], { encoding: 'utf8' }));
    assert.equal(json.schema, 'platform-reliability-r1-snapshot-delta.v1');
    assert.equal(json.rows.delta, 1);
    assert.equal(
      json.provenance.afterSnapshotSha256,
      captureReceipt(afterBytes, '2026-07-30T08:31:46.000Z').outputSha256,
    );
    assert.match(json.provenance.captureAfterReceiptSha256, /^[a-f0-9]{64}$/);

    const markdown = execFileSync(
      'node',
      [SCRIPT, ...common, '--format', 'markdown'],
      { encoding: 'utf8' },
    );
    assert.equal(markdown, toMarkdown(json));
    assert.match(markdown, /Render provider storage/);
    assert.match(markdown, /Render provider window/);
    assert.match(markdown, /Largest row deltas/);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('CLI accepts the committed aggregate snapshot-1 baseline format', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-delta-baseline-'));
  try {
    const beforePath = path.join(temp, 'before.json');
    const afterPath = path.join(temp, 'after.tsv');
    const captureAfterPath = path.join(temp, 'capture-after.json');
    const providerBeforePath = path.join(temp, 'provider-before.json');
    const providerAfterPath = path.join(temp, 'provider-after.json');
    const queryReceiptPath = path.join(
      temp,
      'platform-reliability-r1-0-db-query-receipt.json',
    );
    const baseline = aggregateBaseline();
    const queryReceipt = queryReceiptForBaseline(baseline);
    const queryReceiptBytes = JSON.stringify(queryReceipt);
    fs.writeFileSync(queryReceiptPath, queryReceiptBytes);
    const queryReceiptSha256 = crypto
      .createHash('sha256')
      .update(queryReceiptBytes)
      .digest('hex');
    fs.writeFileSync(beforePath, JSON.stringify({
      ...baseline,
      provenance: {
        databaseQueryReceipt: 'platform-reliability-r1-0-db-query-receipt.json',
        databaseQueryReceiptSha256: queryReceiptSha256,
      },
    }));
    const afterBytes = snapshot({
      at: '2026-07-30 08:31:46 UTC',
      databaseBytes: '1200',
      relationBytes: '700',
      deadlocks: '17',
      exact: [['public.a', '11']],
    });
    fs.writeFileSync(afterPath, afterBytes);
    fs.writeFileSync(
      captureAfterPath,
      JSON.stringify(captureReceipt(afterBytes, '2026-07-30T08:31:46.000Z')),
    );
    fs.writeFileSync(
      providerBeforePath,
      JSON.stringify(receipt({ at: '2026-07-29T08:31:46Z', usedBytes: 100 })),
    );
    fs.writeFileSync(
      providerAfterPath,
      JSON.stringify(receipt({ at: '2026-07-30T08:31:46Z', usedBytes: 150 })),
    );

    const result = JSON.parse(execFileSync(
      'node',
      [
        SCRIPT,
        '--before', beforePath,
        '--after', afterPath,
        '--capture-after', captureAfterPath,
        '--provider-before', providerBeforePath,
        '--provider-after', providerAfterPath,
      ],
      { encoding: 'utf8' },
    ));

    assert.equal(result.rows.delta, 1);
    assert.equal(result.rows.byTableComparable, false);
    assert.equal(result.rows.byTable, null);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('committed snapshot-1 baseline is byte-bound to its DB-query receipt', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-delta-committed-'));
  try {
    const repoRoot = path.resolve(path.dirname(SCRIPT), '..');
    const afterPath = path.join(temp, 'after.tsv');
    const captureAfterPath = path.join(temp, 'capture-after.json');
    const providerAfterPath = path.join(temp, 'provider-after.json');
    const serviceId = 'dpg-d95r32favr4c73aqs4d0-a';
    const afterBytes = snapshot({
      at: '2026-07-30 08:31:46 UTC',
      databaseBytes: '39541784',
      relationBytes: '26656769',
      deadlocks: '17',
      exact: [['public.a', '27881']],
      commits: '1623588',
      database: 'swipe_55ht',
    });
    fs.writeFileSync(afterPath, afterBytes);
    fs.writeFileSync(
      captureAfterPath,
      JSON.stringify(captureReceipt(afterBytes, '2026-07-30T08:31:46.000Z')),
    );
    fs.writeFileSync(
      providerAfterPath,
      JSON.stringify(receipt({
        at: '2026-07-30T08:31:46Z',
        percent: 11.6,
        serviceId,
        logicalDatabaseName: 'swipe_55ht',
      })),
    );

    const result = JSON.parse(execFileSync(
      'node',
      [
        SCRIPT,
        '--before',
        path.join(repoRoot, 'platform-reliability-r1-0-snapshot-baseline.json'),
        '--after', afterPath,
        '--capture-after', captureAfterPath,
        '--provider-before',
        path.join(repoRoot, 'platform-reliability-r1-0-render-receipt.json'),
        '--provider-after', providerAfterPath,
      ],
      { encoding: 'utf8' },
    ));

    assert.equal(result.database.deltaBytes, 1);
    assert.equal(result.rows.delta, 1);
    assert.equal(result.identity.renderServiceId, serviceId);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('provenance rejects a rehashed receipt whose embedded full output was altered', () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'r1-delta-tamper-'));
  try {
    const baseline = aggregateBaseline();
    const queryReceipt = queryReceiptForBaseline(baseline);
    queryReceipt.observations[0].fullOutput += 'tampered';
    const queryReceiptBytes = JSON.stringify(queryReceipt);
    const queryReceiptPath = path.join(
      temp,
      'platform-reliability-r1-0-db-query-receipt.json',
    );
    const baselinePath = path.join(temp, 'baseline.json');
    fs.writeFileSync(queryReceiptPath, queryReceiptBytes);
    const receiptDigest = crypto
      .createHash('sha256')
      .update(queryReceiptBytes)
      .digest('hex');
    const boundBaseline = {
      ...baseline,
      provenance: {
        databaseQueryReceipt: 'platform-reliability-r1-0-db-query-receipt.json',
        databaseQueryReceiptSha256: receiptDigest,
      },
    };
    fs.writeFileSync(baselinePath, JSON.stringify(boundBaseline));

    assert.throws(
      () => verifyBaselineProvenance(
        parseBaseline(JSON.stringify(boundBaseline)),
        baselinePath,
      ),
      /fullOutput digest mismatch/,
    );
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
});

test('CLI rejects unknown and duplicate options', () => {
  assert.throws(
    () => execFileSync('node', [SCRIPT, '--typo', 'value'], { encoding: 'utf8' }),
    /unknown option --typo/,
  );
  assert.throws(
    () => execFileSync(
      'node',
      [
        SCRIPT,
        '--before', 'a',
        '--before', 'b',
        '--after', 'c',
        '--provider-before', 'd',
        '--provider-after', 'e',
      ],
      { encoding: 'utf8' },
    ),
    /duplicate option --before/,
  );
});
