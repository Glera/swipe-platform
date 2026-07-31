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
  processVersion: 'reference-replication.v3',
  sessionId: 'block-out-v0',
  comparison: 'twin-original',
  seed: 'fixed-seed',
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
