#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeReviewConfig } from './reference-review-page.mjs';

const fail = (message) => { throw new Error(message); };

function parseArgs(argv) {
  const options = {};
  for (let index = 0; index < argv.length; index += 2) {
    const token = argv[index];
    const value = argv[index + 1];
    if (!token?.startsWith('--') || value === undefined) fail('expected --config <json> --receipt <json>');
    options[token.slice(2)] = value;
  }
  if (!options.config || !options.receipt) fail('expected --config <json> --receipt <json>');
  return options;
}

function selectedSource(pair, choice) {
  if (choice === 'same') return 'same';
  if (choice !== 'a' && choice !== 'b') fail(`invalid choice ${choice}`);
  return pair[choice].source;
}

export function dispositionReview(configInput, receipt) {
  const session = normalizeReviewConfig(configInput);
  if (receipt.schema !== 'reference-review-result.v1') fail('invalid receipt schema');
  for (const field of ['processVersion', 'sessionId', 'comparison']) {
    if (receipt[field] !== session[field]) fail(`${field} does not match review session`);
  }
  if (JSON.stringify(receipt.acceptanceCoverage) !== JSON.stringify(session.acceptanceCoverage)) {
    fail('acceptance coverage binding does not match review session');
  }
  if (!Array.isArray(receipt.answers) || receipt.answers.length !== session.pairs.length) {
    fail('receipt answer count does not match review session');
  }
  const expectedMapping = session.pairs.map(({ id, a, b }) => ({
    pairId: id,
    a: a.source,
    b: b.source,
  }));
  if (JSON.stringify(receipt.sourceMapping) !== JSON.stringify(expectedMapping)) {
    fail('receipt source mapping does not match seeded session');
  }

  const answers = new Map();
  for (let index = 0; index < session.pairs.length; index += 1) {
    const pair = session.pairs[index];
    const answer = receipt.answers[index];
    if (answer.pairId !== pair.id || answer.scenarioId !== pair.scenarioId
      || (answer.repeatOf ?? null) !== pair.repeatOf) {
      fail(`answer ${index + 1} identity does not match review session`);
    }
    answers.set(pair.id, {
      pair,
      answer,
      selectedSource: selectedSource(pair, answer.choice),
    });
  }

  const contradictions = [];
  for (const item of answers.values()) {
    if (!item.pair.repeatOf) continue;
    const parent = answers.get(item.pair.repeatOf);
    if (!parent || parent.selectedSource !== item.selectedSource) {
      contradictions.push({
        pairId: item.pair.id,
        repeatOf: item.pair.repeatOf,
        selectedSource: item.selectedSource,
        parentSelectedSource: parent?.selectedSource ?? null,
      });
    }
  }

  const unique = [...answers.values()].filter(({ pair }) => !pair.repeatOf);
  let disposition;
  if (contradictions.length > 0) {
    disposition = 'replay-required';
  } else if (session.comparison === 'reference-twin') {
    disposition = unique.some(({ selectedSource: source }) => source === 'reference')
      ? 'correction-required'
      : 'parity-supported';
  } else {
    disposition = unique.every(({ selectedSource: source }) => source === 'same')
      ? 'feel-preserved'
      : 'stable-preference';
  }

  return {
    schema: 'reference-review-disposition.v1',
    processVersion: session.processVersion,
    sessionId: session.sessionId,
    comparison: session.comparison,
    repeatConsistent: contradictions.length === 0,
    contradictions,
    decisions: [...answers.values()].map(({ pair, selectedSource: source }) => ({
      pairId: pair.id,
      repeatOf: pair.repeatOf,
      selectedSource: source,
    })),
    disposition,
  };
}

export function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  const config = JSON.parse(readFileSync(options.config, 'utf8'));
  const receipt = JSON.parse(readFileSync(options.receipt, 'utf8'));
  process.stdout.write(`${JSON.stringify(dispositionReview(config, receipt), null, 2)}\n`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) {
    process.stderr.write(`reference-review-disposition: ${error.message}\n`);
    process.exitCode = 2;
  }
}
