#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PROCESS_VERSION = 'reference-replication.v3.1';
const COMPARISONS = new Set(['reference-twin', 'twin-original']);

const fail = (message) => {
  throw new Error(message);
};

const safeJson = (value) => JSON.stringify(value).replaceAll('<', '\\u003c');

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const token = argv[index];
    const value = argv[index + 1];
    if (!token?.startsWith('--') || value === undefined) fail('expected --config <json> --output <html>');
    options[token.slice(2)] = value;
  }
  if (!options.config || !options.output) fail('expected --config <json> --output <html>');
  return options;
}

const swapFor = (seed, pairId) => {
  const digest = createHash('sha256').update(`${seed}\0${pairId}`).digest();
  return (digest[0] & 1) === 1;
};

export function normalizeReviewConfig(input) {
  if (input.processVersion !== PROCESS_VERSION) fail(`processVersion must be ${PROCESS_VERSION}`);
  if (!COMPARISONS.has(input.comparison)) fail('comparison must be reference-twin or twin-original');
  if (!input.sessionId || !input.seed) fail('sessionId and seed are required');
  const coverage = input.acceptanceCoverage;
  if (!coverage
    || coverage.model !== 'pass'
    || coverage.browserInput !== 'pass'
    || coverage.rawCleanRaster !== 'pass'
    || coverage.diagnosticSoleAuthority !== false
    || typeof coverage.receiptSha256 !== 'string'
    || !/^[0-9a-f]{64}$/.test(coverage.receiptSha256)) {
    fail('v3.1 review requires a SHA-256-bound model/browser-input/raw-clean-raster coverage receipt; diagnostic cannot be sole authority');
  }
  const cleanPair = coverage.referenceCleanPair;
  if (cleanPair?.status !== 'pass-current-candidate'
    || typeof cleanPair.receiptSha256 !== 'string'
    || !/^[0-9a-f]{64}$/.test(cleanPair.receiptSha256)
    || typeof cleanPair.referenceVideoSha256 !== 'string'
    || !/^[0-9a-f]{64}$/.test(cleanPair.referenceVideoSha256)
    || typeof cleanPair.candidateVideoSha256 !== 'string'
    || !/^[0-9a-f]{64}$/.test(cleanPair.candidateVideoSha256)
    || typeof cleanPair.candidateCommit !== 'string'
    || !/^[0-9a-f]{40}$/.test(cleanPair.candidateCommit)) {
    fail('v3.1 review requires a current SHA-256-bound Reference↔Twin clean pair; candidate-only raw raster invariants are insufficient');
  }
  if (input.comparison === 'twin-original') {
    const twin = coverage.surfaces?.referenceTwin;
    const original = coverage.surfaces?.productionOriginal;
    const hasQuorum = (surface) => surface?.model === 'pass'
      && surface?.browserInput === 'pass'
      && surface?.rawCleanRaster === 'pass'
      && surface?.fullPointerReplay === 'pass';
    if (!hasQuorum(twin)
      || twin.productionBundleDeny !== 'pass'
      || !hasQuorum(original)
      || original.nearDuplicate !== 'pass') {
      fail('twin-original review requires independent Reference Twin and Production Original model/browser/raw/full-pointer quorums, a current Reference↔Twin clean pair, Twin production deny, and Original near-duplicate pass');
    }
  }
  if (input.comparison === 'reference-twin') {
    if (input.normalization?.method !== 'causal-occupancy-v3'
      || input.normalization?.staticIdentitySuppressed !== true
      || input.normalization?.spatiallyAligned !== true
      || input.normalization?.causalWindowOnly !== true
      || input.normalization?.backgroundSubtracted !== true
      || input.normalization?.spatialAnchor !== 'gate-center-and-width') {
      fail('reference-twin requires causal-occupancy-v3 with a causal-only, background-subtracted, static-identity-suppressed channel aligned by gate center and width');
    }
  }
  if (!Array.isArray(input.pairs) || input.pairs.length < 1 || input.pairs.length > 8) {
    fail('pairs must contain 1..8 decisions');
  }
  const ids = new Set();
  const normalizedPairs = input.pairs.map((pair) => {
    if (!pair.id || ids.has(pair.id)) fail(`duplicate or empty pair id ${pair.id ?? ''}`);
    ids.add(pair.id);
    for (const side of ['first', 'second']) {
      const media = pair[side];
      if (!media?.url || !media.source) fail(`${pair.id}.${side} requires url and source`);
      if (!Number.isFinite(media.eventOffsetMs) || media.eventOffsetMs < 0) {
        fail(`${pair.id}.${side}.eventOffsetMs must be non-negative`);
      }
    }
    const swap = swapFor(input.seed, pair.id);
    return {
      id: pair.id,
      scenarioId: pair.scenarioId ?? pair.id,
      repeatOf: pair.repeatOf ?? null,
      a: swap ? pair.second : pair.first,
      b: swap ? pair.first : pair.second,
    };
  });
  for (const pair of normalizedPairs) {
    if (pair.repeatOf !== null && !ids.has(pair.repeatOf)) fail(`${pair.id} repeats unknown ${pair.repeatOf}`);
  }
  return {
    schema: 'reference-review-session.v1',
    processVersion: PROCESS_VERSION,
    sessionId: input.sessionId,
    comparison: input.comparison,
    seed: input.seed,
    acceptanceCoverage: structuredClone(coverage),
    normalization: input.normalization ?? null,
    pairs: normalizedPairs,
  };
}

export function buildReviewHtml(config) {
  const session = normalizeReviewConfig(config);
  const question = session.comparison === 'reference-twin'
    ? 'Which normalized channel is the reference?'
    : 'Which version feels closer or more pleasant?';
  const aLabel = session.comparison === 'reference-twin' ? 'A is reference' : 'A feels closer';
  const bLabel = session.comparison === 'reference-twin' ? 'B is reference' : 'B feels closer';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Reference fidelity review</title>
  <style>
    :root { color-scheme: dark; font-family: system-ui, sans-serif; background: #111; color: #eee; }
    body { margin: 0 auto; max-width: 1180px; padding: 16px; }
    header, .toolbar, .choices { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
    header { justify-content: space-between; }
    button, input { font: inherit; }
    button { border: 1px solid #666; border-radius: 8px; background: #292929; color: #fff; padding: 10px 14px; }
    button:disabled { opacity: .4; }
    .stage { position: relative; margin: 16px 0; background: #000; min-height: 320px; }
    .side { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
    video { width: 100%; max-height: 70vh; background: #000; object-fit: contain; }
    .blend { display: block; }
    .blend video { position: absolute; inset: 0; width: 100%; height: 100%; }
    .blend video:first-child { position: relative; }
    .blend .video-b { opacity: .5; }
    .source { display: none; }
    .result { white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 12px; }
  </style>
</head>
<body>
  <header><strong>Fidelity review · <span id="progress"></span></strong><span>Sources hidden · coverage quorum bound</span></header>
  <div class="toolbar">
    <button id="play">Play synchronized</button>
    <button id="rewind">Align to event</button>
    <button id="mode">Mode: side-by-side</button>
    <label>Blend <input id="blend" type="range" min="0" max="1" value="0.5" step="0.01"></label>
  </div>
  <div id="stage" class="stage side">
    <video id="a" class="video-a" playsinline controls preload="metadata"></video>
    <video id="b" class="video-b" playsinline controls preload="metadata"></video>
  </div>
  <h2>${question}</h2>
  <div class="choices">
    <button data-choice="a">${aLabel}</button>
    <button data-choice="b">${bLabel}</button>
    <button data-choice="same">No meaningful difference</button>
    <button id="export" disabled>Export receipt</button>
  </div>
  <p id="result" class="result"></p>
  <script>
    const session = ${safeJson(session)};
    const answers = [];
    let index = 0;
    let blendMode = false;
    const a = document.querySelector('#a');
    const b = document.querySelector('#b');
    const stage = document.querySelector('#stage');
    const progress = document.querySelector('#progress');
    const result = document.querySelector('#result');
    const pair = () => session.pairs[index];
    function loadPair() {
      const current = pair();
      a.src = current.a.url;
      b.src = current.b.url;
      progress.textContent = (index + 1) + ' / ' + session.pairs.length + ' · ' + current.scenarioId;
      result.textContent = '';
    }
    function align() {
      const current = pair();
      a.currentTime = current.a.eventOffsetMs / 1000;
      b.currentTime = current.b.eventOffsetMs / 1000;
    }
    function logicalMs(video, offset) { return video.currentTime * 1000 - offset; }
    function syncFrom(source, target, sourceOffset, targetOffset) {
      const targetTime = (logicalMs(source, sourceOffset) + targetOffset) / 1000;
      if (Math.abs(target.currentTime - targetTime) > 0.04) target.currentTime = Math.max(0, targetTime);
    }
    document.querySelector('#play').onclick = async () => {
      const current = pair();
      syncFrom(a, b, current.a.eventOffsetMs, current.b.eventOffsetMs);
      await Promise.allSettled([a.play(), b.play()]);
    };
    document.querySelector('#rewind').onclick = () => { a.pause(); b.pause(); align(); };
    a.addEventListener('seeking', () => syncFrom(a, b, pair().a.eventOffsetMs, pair().b.eventOffsetMs));
    document.querySelector('#mode').onclick = (event) => {
      blendMode = !blendMode;
      stage.className = 'stage ' + (blendMode ? 'blend' : 'side');
      event.currentTarget.textContent = 'Mode: ' + (blendMode ? 'blend' : 'side-by-side');
    };
    document.querySelector('#blend').oninput = (event) => { b.style.opacity = event.target.value; };
    document.querySelectorAll('[data-choice]').forEach((button) => {
      button.onclick = () => {
        const current = pair();
        answers.push({
          pairId: current.id,
          scenarioId: current.scenarioId,
          repeatOf: current.repeatOf,
          choice: button.dataset.choice,
          decidedAt: new Date().toISOString(),
        });
        a.pause(); b.pause();
        index += 1;
        if (index < session.pairs.length) loadPair();
        else {
          progress.textContent = 'complete · ' + session.pairs.length + ' decisions';
          document.querySelectorAll('[data-choice]').forEach((item) => { item.disabled = true; });
          document.querySelector('#export').disabled = false;
          result.textContent = 'Review complete. Export the receipt; source mapping is included only there.';
        }
      };
    });
    document.querySelector('#export').onclick = () => {
      const receipt = {
        schema: 'reference-review-result.v1',
        processVersion: session.processVersion,
        sessionId: session.sessionId,
        comparison: session.comparison,
        completedAt: new Date().toISOString(),
        acceptanceCoverage: session.acceptanceCoverage,
        answers,
        sourceMapping: session.pairs.map(({ id, a, b }) => ({ pairId: id, a: a.source, b: b.source })),
      };
      const blob = new Blob([JSON.stringify(receipt, null, 2) + '\\n'], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = session.sessionId + '.review.json';
      link.click();
      URL.revokeObjectURL(link.href);
    };
    loadPair();
  </script>
</body>
</html>\n`;
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const config = JSON.parse(readFileSync(options.config, 'utf8'));
  const html = buildReviewHtml(config);
  writeFileSync(options.output, html, { flag: 'wx' });
  process.stdout.write(`reference-review-page: wrote ${path.resolve(options.output)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`reference-review-page: ${error.message}\n`);
    process.exitCode = 2;
  }
}
