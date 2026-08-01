import assert from 'node:assert/strict';
import test from 'node:test';

import { buildReviewHtml, normalizeReviewConfig } from './reference-review-page.mjs';

const pair = (id, repeatOf) => ({
  id,
  scenarioId: 'BO-GS-04',
  ...(repeatOf ? { repeatOf } : {}),
  first: { url: `${id}-first.mp4`, eventOffsetMs: 200, source: 'twin' },
  second: { url: `${id}-second.mp4`, eventOffsetMs: 350, source: 'original' },
});

const config = {
  processVersion: 'reference-replication.v3.1',
  sessionId: 'block-out-v0',
  comparison: 'twin-original',
  seed: 'fixed-seed',
  acceptanceCoverage: {
    model: 'pass',
    browserInput: 'pass',
    rawCleanRaster: 'pass',
    diagnosticSoleAuthority: false,
    receiptSha256: 'a'.repeat(64),
    referenceCleanPair: {
      status: 'pass-current-candidate',
      receiptSha256: 'b'.repeat(64),
      referenceVideoSha256: 'c'.repeat(64),
      candidateVideoSha256: 'd'.repeat(64),
      candidateCommit: 'e'.repeat(40),
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
  pairs: [pair('p1'), pair('p2', 'p1')],
};

test('review config randomizes labels deterministically and preserves hidden repeats', () => {
  const first = normalizeReviewConfig(config);
  const second = normalizeReviewConfig(config);
  assert.deepEqual(first, second);
  assert.equal(first.pairs[1].repeatOf, 'p1');
  assert.equal(first.pairs.length, 2);
});

test('Twin to Original surface asks preference, not reference identification', () => {
  const html = buildReviewHtml(config);
  assert.match(html, /Which version feels closer or more pleasant\?/u);
  assert.match(html, /Mode: side-by-side/u);
  assert.match(html, /No meaningful difference/u);
  assert.doesNotMatch(html, />twin</u);
});

test('Reference to Twin surface limits identification to its declared channel', () => {
  const html = buildReviewHtml({
    ...config,
    comparison: 'reference-twin',
    normalization: {
      method: 'causal-occupancy-v3',
      staticIdentitySuppressed: true,
      spatiallyAligned: true,
      causalWindowOnly: true,
      backgroundSubtracted: true,
      spatialAnchor: 'gate-center-and-width',
    },
  });
  assert.match(html, /Which normalized channel is the reference\?/u);
  assert.match(html, /A is reference/u);
});

test('Reference to Twin rejects channels that retain static identity', () => {
  assert.throws(
    () => normalizeReviewConfig({ ...config, comparison: 'reference-twin' }),
    /static-identity-suppressed/u,
  );
});

test('review rejects diagnostic-only acceptance without the three-surface quorum', () => {
  assert.throws(
    () => normalizeReviewConfig({ ...config, acceptanceCoverage: undefined }),
    /model\/browser-input\/raw-clean-raster/u,
  );
  assert.throws(
    () => normalizeReviewConfig({
      ...config,
      acceptanceCoverage: { ...config.acceptanceCoverage, diagnosticSoleAuthority: true },
    }),
    /diagnostic cannot be sole authority/u,
  );
});

test('review rejects candidate-only raster proof without a current raw Reference to Twin pair', () => {
  const { referenceCleanPair: _pair, ...withoutPair } = config.acceptanceCoverage;
  assert.throws(
    () => normalizeReviewConfig({
      ...config,
      acceptanceCoverage: withoutPair,
    }),
    /current SHA-256-bound Reference↔Twin clean pair/u,
  );
  assert.throws(
    () => normalizeReviewConfig({
      ...config,
      acceptanceCoverage: {
        ...config.acceptanceCoverage,
        referenceCleanPair: {
          ...config.acceptanceCoverage.referenceCleanPair,
          candidateCommit: 'superseded',
        },
      },
    }),
    /candidate-only raw raster invariants are insufficient/u,
  );
});

test('Twin to Original rejects a combined pass without independent executable surface quorums', () => {
  const { surfaces: _surfaces, ...combinedOnly } = config.acceptanceCoverage;
  assert.throws(
    () => normalizeReviewConfig({ ...config, acceptanceCoverage: combinedOnly }),
    /independent Reference Twin and Production Original/u,
  );
  assert.throws(
    () => normalizeReviewConfig({
      ...config,
      acceptanceCoverage: {
        ...config.acceptanceCoverage,
        surfaces: {
          ...config.acceptanceCoverage.surfaces,
          productionOriginal: {
            ...config.acceptanceCoverage.surfaces.productionOriginal,
            fullPointerReplay: 'missing',
          },
        },
      },
    }),
    /full-pointer quorums/u,
  );
});

test('Reference to Twin rejects the old channel that mixed input and static art', () => {
  assert.throws(
    () => normalizeReviewConfig({
      ...config,
      comparison: 'reference-twin',
      normalization: {
        method: 'motion-energy-v2',
        staticIdentitySuppressed: true,
        spatiallyAligned: true,
      },
    }),
    /causal-occupancy-v3/u,
  );
});

test('review session rejects more than eight decisions and unknown repeats', () => {
  assert.throws(
    () => normalizeReviewConfig({ ...config, pairs: Array.from({ length: 9 }, (_, index) => pair(`p${index}`)) }),
    /1\.\.8 decisions/u,
  );
  assert.throws(
    () => normalizeReviewConfig({ ...config, pairs: [pair('p1', 'missing')] }),
    /repeats unknown/u,
  );
});
