import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { lintMechanicsContracts } from './mechanics-contract-lint.mjs';

const MARKER = '<!-- mechanics-process-version: 2 -->';

test('checked-in process-v2 mechanic briefs have a concrete transition parity matrix', async () => {
  const root = path.resolve(import.meta.dirname, '..');
  assert.deepEqual(await lintMechanicsContracts(root), []);
});

test('process-v2 brief without temporal transition evidence fails closed', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mechanics-contract-lint-'));
  const mechanics = path.join(root, 'docs', 'mechanics');
  await mkdir(path.join(mechanics, 'broken'), { recursive: true });
  const validHeading = `${MARKER}\n### Transition parity matrix\n\n`
    + '| Pre-state | Input | Reaction | Settle | Final | Naive failure | Evidence | Fixture |\n'
    + '| --- | --- | --- | --- | --- | --- | --- | --- |\n';
  await writeFile(path.join(mechanics, 'CLASS-BRIEF-TEMPLATE.md'), validHeading);
  await writeFile(
    path.join(mechanics, 'broken', 'CLASS-BRIEF.md'),
    `${MARKER}\n# Broken brief\n`,
  );
  const failures = await lintMechanicsContracts(root);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /missing ### Transition parity matrix/);
});

test('process-v2 brief needs adversarial contrast rows with no empty evidence cells', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'mechanics-contract-contrast-'));
  const mechanics = path.join(root, 'docs', 'mechanics');
  await mkdir(path.join(mechanics, 'thin'), { recursive: true });
  const heading = `${MARKER}\n### Transition parity matrix\n\n`
    + '| Pre-state | Input | Reaction | Settle | Final | Naive failure | Evidence | Fixture |\n'
    + '| --- | --- | --- | --- | --- | --- | --- | --- |\n';
  await writeFile(path.join(mechanics, 'CLASS-BRIEF-TEMPLATE.md'), heading);
  await writeFile(
    path.join(mechanics, 'thin', 'CLASS-BRIEF.md'),
    `${heading}| empty | A | flight | settle | A | append-only | clip | test |\n`,
  );
  const failures = await lintMechanicsContracts(root);
  assert.equal(failures.length, 1);
  assert.match(failures[0], /at least two concrete contrast rows/);
});
