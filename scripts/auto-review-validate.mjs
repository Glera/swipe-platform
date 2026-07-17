#!/usr/bin/env node
// auto-review-validate.mjs — disposition validator for the auto-review skill.
//
// Spec: docs/specs/dev-loop.md, WS2 step 5 ("Диспозиция по КАЖДОМУ ID …
// Молчаливый пропуск запрещён — skill валидирует, что каждый ID получил
// disposition"). This is the mechanical check behind that rule.
//
// Input: a JSON file of the shape
//   { "findings":     [{ "id", "severity", "file", "line", "desc" }, ...],
//     "dispositions": [{ "id", "action": "fixed" | "rejected", "reason"? }, ...] }
//
// Validates:
//   - every finding ID has EXACTLY ONE disposition (no missing, no duplicate);
//   - every "rejected" disposition carries a non-empty reason;
//   - no disposition references an unknown finding ID;
//   - no duplicate finding IDs in the findings list itself.
//
// Exit codes: 0 = valid; 1 = invalid (or bad input). Problems are printed, one
// per line, to stderr.
//
// Usage: node scripts/auto-review-validate.mjs <dispositions.json>

import fs from 'node:fs';
import path from 'node:path';

function die(msg) {
  process.stderr.write(`auto-review-validate: ${msg}\n`);
  process.exit(1);
}

function main() {
  const arg = process.argv[2];
  if (!arg || arg.startsWith('--')) {
    die('usage: auto-review-validate.mjs <dispositions.json>');
  }
  const file = path.resolve(process.cwd(), arg);

  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch (e) {
    die(`cannot read input file: ${file} (${e.message})`);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    die(`input is not valid JSON: ${e.message}`);
  }

  const findings = Array.isArray(data?.findings) ? data.findings : null;
  const dispositions = Array.isArray(data?.dispositions) ? data.dispositions : null;
  if (!findings) die('`findings` must be an array');
  if (!dispositions) die('`dispositions` must be an array');

  const errors = [];

  // Finding IDs (also detects duplicate IDs among findings).
  const findingIds = [];
  const findingSeen = new Set();
  for (const [i, f] of findings.entries()) {
    const id = f?.id;
    if (typeof id !== 'string' || id.length === 0) {
      errors.push(`findings[${i}] has a missing or non-string id`);
      continue;
    }
    if (findingSeen.has(id)) {
      errors.push(`duplicate finding id in findings: ${id}`);
    } else {
      findingSeen.add(id);
      findingIds.push(id);
    }
  }

  // Disposition IDs + per-disposition validation.
  const dispCount = new Map(); // id -> how many dispositions reference it
  for (const [i, d] of dispositions.entries()) {
    const id = d?.id;
    if (typeof id !== 'string' || id.length === 0) {
      errors.push(`dispositions[${i}] has a missing or non-string id`);
      continue;
    }
    dispCount.set(id, (dispCount.get(id) || 0) + 1);

    const action = d?.action;
    if (action !== 'fixed' && action !== 'rejected') {
      errors.push(
        `disposition for ${id} has invalid action ${JSON.stringify(action)} ` +
          '(want "fixed" or "rejected")',
      );
    }
    if (action === 'rejected') {
      const reason = d?.reason;
      if (typeof reason !== 'string' || reason.trim().length === 0) {
        errors.push(`rejected disposition for ${id} is missing a reason`);
      }
    }
  }

  // Duplicate dispositions for one finding.
  for (const [id, count] of dispCount) {
    if (count > 1) {
      errors.push(`finding ${id} has ${count} dispositions (want exactly one)`);
    }
  }

  // Missing dispositions.
  for (const id of findingIds) {
    if (!dispCount.has(id)) errors.push(`finding ${id} has no disposition`);
  }

  // Extra dispositions referencing unknown findings.
  for (const id of dispCount.keys()) {
    if (!findingSeen.has(id)) {
      errors.push(`disposition references unknown finding id: ${id}`);
    }
  }

  if (errors.length) {
    process.stderr.write(
      `auto-review-validate: FAIL (${errors.length} problem` +
        `${errors.length === 1 ? '' : 's'}):\n` +
        errors.map((e) => `  - ${e}`).join('\n') +
        '\n',
    );
    process.exit(1);
  }

  process.stdout.write(
    `auto-review-validate: OK — ${findingIds.length} finding(s), ` +
      'each with exactly one disposition.\n',
  );
  process.exit(0);
}

main();
