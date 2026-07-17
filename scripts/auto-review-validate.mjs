#!/usr/bin/env node
// auto-review-validate.mjs — disposition validator for the auto-review skill.
//
// Spec: docs/specs/dev-loop.md, WS2 step 5 ("Диспозиция по КАЖДОМУ ID …
// Молчаливый пропуск запрещён — skill валидирует, что каждый ID получил
// disposition"). This is the mechanical check behind that rule.
//
// Input: a JSON file of the shape
//   { "findings":     [{ "id", "severity", "file", "line", "desc" }, ...],
//     "dispositions": [{ "id", "action": "fixed" | "rejected", "reason"? }, ...],
//     "verify":       [{ "command", "exitCode" }, ...] }
//
// Validates (strict schema — any violation is listed and exits 1):
//   - finding id matches ^F\d{3,}$; severity in {P1,P2,P3}; file is a
//     non-empty string; line is an integer >= 1; desc is a non-empty string;
//   - every finding ID has EXACTLY ONE disposition (no missing, no duplicate);
//   - every "rejected" disposition carries a non-empty reason;
//   - no disposition references an unknown finding ID;
//   - no duplicate finding IDs in the findings list itself;
//   - verify is a non-empty array of { command: non-empty string,
//     exitCode: integer } — the recorded re-run of the repo's verify commands
//     (skill step 6); a missing or empty verify section fails.
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

  const ID_RE = /^F\d{3,}$/;
  const SEVERITIES = new Set(['P1', 'P2', 'P3']);
  const nonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

  // Findings: strict per-field schema + duplicate-ID detection.
  const findingIds = [];
  const findingSeen = new Set();
  for (const [i, f] of findings.entries()) {
    const label = (field) => `findings[${i}]${f?.id ? ` (${f.id})` : ''}: ${field}`;
    const id = f?.id;
    if (typeof id !== 'string' || !ID_RE.test(id)) {
      errors.push(
        `findings[${i}] has a malformed id ${JSON.stringify(id ?? null)} ` +
          '(want ^F\\d{3,}$, e.g. "F001")',
      );
    } else if (findingSeen.has(id)) {
      errors.push(`duplicate finding id in findings: ${id}`);
    } else {
      findingSeen.add(id);
      findingIds.push(id);
    }
    if (!SEVERITIES.has(f?.severity)) {
      errors.push(
        label(`severity ${JSON.stringify(f?.severity ?? null)} invalid (want P1|P2|P3)`),
      );
    }
    if (!nonEmptyString(f?.file)) {
      errors.push(label('file must be a non-empty string'));
    }
    if (!Number.isInteger(f?.line) || f.line < 1) {
      errors.push(label(`line ${JSON.stringify(f?.line ?? null)} must be an integer >= 1`));
    }
    if (!nonEmptyString(f?.desc)) {
      errors.push(label('desc must be a non-empty string'));
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

  // Verify section: the recorded re-run of the repo's verify commands (skill
  // step 6). Must be present and non-empty — a summary without recorded
  // verify commands/exit codes is not acceptable.
  const verify = data?.verify;
  if (!Array.isArray(verify) || verify.length === 0) {
    errors.push(
      '`verify` must be a non-empty array of {command, exitCode} entries ' +
        '(re-run the repo verify commands and record their exit codes)',
    );
  } else {
    for (const [i, v] of verify.entries()) {
      if (!nonEmptyString(v?.command)) {
        errors.push(`verify[${i}]: command must be a non-empty string`);
      }
      if (!Number.isInteger(v?.exitCode)) {
        errors.push(
          `verify[${i}]: exitCode ${JSON.stringify(v?.exitCode ?? null)} must be an integer`,
        );
      }
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
    `auto-review-validate: OK — ${findingIds.length} finding(s), each with ` +
      `exactly one disposition; ${verify.length} verify command(s) recorded.\n`,
  );
  process.exit(0);
}

main();
