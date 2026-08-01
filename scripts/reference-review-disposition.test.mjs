import assert from 'node:assert/strict';
import test from 'node:test';

import { dispositionReview } from './reference-review-disposition.mjs';
import { normalizeReviewConfig } from './reference-review-page.mjs';

const configFor = (comparison) => ({
  processVersion: 'reference-replication.v3.1',
  sessionId: `session-${comparison}`,
  comparison,
  seed: 'disposition-fixed-seed',
  acceptanceCoverage: {
    model: 'pass',
    browserInput: 'pass',
    rawCleanRaster: 'pass',
    diagnosticSoleAuthority: false,
    receiptSha256: 'b'.repeat(64),
    referenceCleanPair: {
      status: 'pass-current-candidate',
      semanticRawComparison: 'pass',
      channelTiming: 'independent-event-offsets',
      receiptSha256: 'c'.repeat(64),
      referenceVideoSha256: 'd'.repeat(64),
      candidateVideoSha256: 'e'.repeat(64),
      candidateCommit: 'f'.repeat(40),
    },
    surfaces: {
      referenceTwin: {
        model: 'pass',
        browserInput: 'pass',
        rawCleanRaster: 'pass',
        fullPointerReplay: 'pass',
        productionBundleDeny: 'pass',
      },
      productionOriginal: {
        model: 'pass',
        browserInput: 'pass',
        rawCleanRaster: 'pass',
        fullPointerReplay: 'pass',
        nearDuplicate: 'pass',
      },
    },
  },
  ...(comparison === 'reference-twin' ? {
    normalization: {
      method: 'causal-occupancy-v3',
      staticIdentitySuppressed: true,
      spatiallyAligned: true,
      causalWindowOnly: true,
      backgroundSubtracted: true,
      spatialAnchor: 'gate-center-and-width',
    },
  } : {}),
  pairs: [
    {
      id: 'p1',
      scenarioId: 's1',
      first: { url: 'one.mp4', eventOffsetMs: 100, source: comparison === 'reference-twin' ? 'reference' : 'twin' },
      second: { url: 'two.mp4', eventOffsetMs: 100, source: comparison === 'reference-twin' ? 'twin' : 'original' },
    },
    {
      id: 'p1-repeat',
      scenarioId: 's1-repeat',
      repeatOf: 'p1',
      first: { url: 'one.mp4', eventOffsetMs: 100, source: comparison === 'reference-twin' ? 'reference' : 'twin' },
      second: { url: 'two.mp4', eventOffsetMs: 100, source: comparison === 'reference-twin' ? 'twin' : 'original' },
    },
  ],
});

function receiptFor(config, selectedSources) {
  const session = normalizeReviewConfig(config);
  return {
    schema: 'reference-review-result.v1',
    processVersion: session.processVersion,
    sessionId: session.sessionId,
    comparison: session.comparison,
    completedAt: '2026-07-31T00:00:00.000Z',
    acceptanceCoverage: session.acceptanceCoverage,
    answers: session.pairs.map((pair, index) => ({
      pairId: pair.id,
      scenarioId: pair.scenarioId,
      repeatOf: pair.repeatOf,
      choice: selectedSources[index] === 'same'
        ? 'same'
        : pair.a.source === selectedSources[index] ? 'a' : 'b',
      decidedAt: '2026-07-31T00:00:00.000Z',
    })),
    sourceMapping: session.pairs.map(({ id, a, b }) => ({ pairId: id, a: a.source, b: b.source })),
  };
}

test('repeat-consistent Reference identification requires correction', () => {
  const config = configFor('reference-twin');
  assert.equal(dispositionReview(config, receiptFor(config, ['reference', 'reference'])).disposition, 'correction-required');
});

test('repeat-consistent Twin identification supports causal parity', () => {
  const config = configFor('reference-twin');
  assert.equal(dispositionReview(config, receiptFor(config, ['twin', 'twin'])).disposition, 'parity-supported');
});

test('repeat-consistent no-difference preserves Twin to Original feel', () => {
  const config = configFor('twin-original');
  assert.equal(dispositionReview(config, receiptFor(config, ['same', 'same'])).disposition, 'feel-preserved');
});

test('contradictory hidden repeat requires replay', () => {
  const config = configFor('twin-original');
  const result = dispositionReview(config, receiptFor(config, ['twin', 'original']));
  assert.equal(result.repeatConsistent, false);
  assert.equal(result.disposition, 'replay-required');
});

test('tampered source mapping fails closed', () => {
  const config = configFor('twin-original');
  const receipt = receiptFor(config, ['same', 'same']);
  receipt.sourceMapping[0].a = 'reference';
  assert.throws(() => dispositionReview(config, receipt), /source mapping/u);
});
