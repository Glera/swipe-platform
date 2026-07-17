#!/usr/bin/env node
// docs-boundary lint (dev-loop WS5): root CLAUDE.md — durable ledger, не
// статусная страница. Фейлит на изменчивых утверждениях, чьи authority —
// Alembic graph / CI / IMPLEMENTATION-STATUS.md (см. AGENTS.md).
// Advisory до завершения разделения документации (WS5), затем enforcing.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const targets = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [path.join(root, 'CLAUDE.md')];

// Явный список запрещённых изменчивых паттернов. Дополнять — здесь,
// правило описано в AGENTS.md.
const FORBIDDEN = [
  { re: /текущ\w*\s+(migration\s+)?head/iu, why: 'текущий head → authority: Alembic graph' },
  { re: /сейчас\s+зелён/iu, why: 'сейчас зелёное → authority: CI' },
  { re: /последн\w+\s+миграци/iu, why: 'последняя миграция → authority: Alembic graph' },
  { re: /green as of/i, why: 'green as of → authority: CI' },
  { re: /now passes\b/i, why: '«now passes» → authority: CI' },
  { re: /tests?\s+(are|is)\s+green/i, why: 'статус тестов → authority: CI' },
  { re: /passes\s+clean\s+`?\d{4}/i, why: 'диапазон миграций как статус → authority: Alembic graph + CI' },
  // «passes/passed … E2E» и «E2E passes» — утверждение, что прогон СЕЙЧАС
  // зелёный. Вечная форма-гейт «… until the … E2E is green» не задевается
  // (в ней нет pass/passed рядом с E2E).
  { re: /pass(es|ed)\b[^.\n]{0,48}\bE2E\b/i, why: '«passes/passed … E2E» — статус прогона → authority: CI' },
  { re: /\bE2E\s+pass(es|ed)\b/i, why: '«E2E passes» — статус прогона → authority: CI' },
];

let violations = 0;
for (const file of targets) {
  let text;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    console.error(`docs-boundary-lint: cannot read ${file}`);
    process.exitCode = 2;
    continue;
  }
  text.split('\n').forEach((line, i) => {
    for (const { re, why } of FORBIDDEN) {
      if (re.test(line)) {
        violations += 1;
        console.log(`${path.relative(root, file)}:${i + 1}: ${why}`);
        console.log(`    ${line.trim().slice(0, 120)}`);
      }
    }
  });
}

if (violations > 0) {
  console.log(`\n${violations} violation(s). Изменчивые факты живут у своих authority (AGENTS.md), не в ledger.`);
  process.exitCode = 1;
} else {
  console.log('docs-boundary-lint: clean');
}
