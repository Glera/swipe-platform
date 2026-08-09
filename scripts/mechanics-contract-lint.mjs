#!/usr/bin/env node

import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PROCESS_MARKER = '<!-- mechanics-process-version: 2 -->';
const REQUIRED_SECTION = '### Transition parity matrix';
const REQUIRED_TERMS = Object.freeze([
  'Pre-state',
  'Input',
  'reaction',
  'settle',
  'Final',
  'Evidence',
  'fixture',
  'Naive failure',
]);

function sectionBody(source) {
  const start = source.indexOf(REQUIRED_SECTION);
  if (start < 0) return '';
  const rest = source.slice(start + REQUIRED_SECTION.length);
  const next = rest.search(/^###?\s+/m);
  return next < 0 ? rest : rest.slice(0, next);
}

function validateV2Brief(relativePath, source, { template = false } = {}) {
  const failures = [];
  if (!source.includes(REQUIRED_SECTION)) {
    failures.push(`${relativePath}: missing ${REQUIRED_SECTION}`);
    return failures;
  }
  const body = sectionBody(source);
  for (const term of REQUIRED_TERMS) {
    if (!body.toLowerCase().includes(term.toLowerCase())) {
      failures.push(`${relativePath}: transition matrix is missing term "${term}"`);
    }
  }
  if (!template) {
    const rows = body.split('\n').filter((line) => /^\|.*\|$/.test(line.trim()));
    const headerCells = rows[0]?.split('|').slice(1, -1).map((cell) => cell.trim()) ?? [];
    const placeholder = /^(?:|_|-+|_?Заполнить\.?_?|TBD|TODO)$/i;
    const dataRows = rows.slice(2)
      .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
      .filter((cells) => cells.some((cell) => !placeholder.test(cell)));
    if (dataRows.length < 2) {
      failures.push(`${relativePath}: transition matrix needs at least two concrete contrast rows`);
    }
    for (const [index, cells] of dataRows.entries()) {
      if (cells.length !== headerCells.length || cells.some((cell) => placeholder.test(cell))) {
        failures.push(
          `${relativePath}: transition matrix row ${index + 1} must fill every checkpoint, evidence, fixture and naive-failure cell`,
        );
      }
    }
  }
  return failures;
}

export async function lintMechanicsContracts(rootDirectory) {
  const mechanicsDirectory = path.join(rootDirectory, 'docs', 'mechanics');
  const failures = [];
  const templatePath = path.join(mechanicsDirectory, 'CLASS-BRIEF-TEMPLATE.md');
  const template = await readFile(templatePath, 'utf8');
  if (!template.includes(PROCESS_MARKER)) {
    failures.push('docs/mechanics/CLASS-BRIEF-TEMPLATE.md: missing process v2 marker');
  } else {
    failures.push(...validateV2Brief('docs/mechanics/CLASS-BRIEF-TEMPLATE.md', template, {
      template: true,
    }));
  }

  for (const entry of await readdir(mechanicsDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const briefPath = path.join(mechanicsDirectory, entry.name, 'CLASS-BRIEF.md');
    let source;
    try {
      source = await readFile(briefPath, 'utf8');
    } catch (error) {
      if (error?.code === 'ENOENT') continue;
      throw error;
    }
    // Existing v1 briefs remain readable historical artifacts. Every brief
    // created from the v2 template carries the marker and is fail-closed.
    if (!source.includes(PROCESS_MARKER)) continue;
    failures.push(...validateV2Brief(
      path.relative(rootDirectory, briefPath),
      source,
    ));
  }
  return failures;
}

async function main() {
  const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const failures = await lintMechanicsContracts(rootDirectory);
  if (failures.length > 0) {
    for (const failure of failures) process.stderr.write(`${failure}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write('mechanics contract lint: PASS\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
