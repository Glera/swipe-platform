# Handoff для продолжения в Claude — 2026-07-17

## Цель и неизменяемые границы

Продолжить пакет из пяти ТЗ без production-overclaim и без включения новых
властей. Все новые поверхности остаются default-off. Не деплоить и не менять
Render env до отдельного живого smoke-плана.

Нельзя смешивать scopes:

- `catalog:read` — только чтение;
- `catalog:recall` — только recall broker;
- `catalog:publish` — только content-bound TMA Approve;
- `analytics:read`, `operator:flags:write`, будущий `feed.roster:write` — отдельные singleton grants.

`levelSeries` остаётся `false` до реального backend/runtime/TMA evidence. Stubbed
browser E2E не называть production E2E. Worker rework runner остаётся выключен
до атомарного переключения generator compatibility identity/path.

## Что уже находится в master

### swipe-backend

- `7fe3b93` — dedicated default-off `catalog:recall` broker, migration `0039`.
- Physical PostgreSQL/roundtrip run `29557829874` полностью зелёный.
- Pure suite после merge: `657 passed / 158 skipped / 10 subtests`.
- `bd289dd` — честный status/spec handoff по supersession, recall и worker.
- После этого в master появились независимые docs commits `9ae1bec`, `efee3f0`,
  `a8001c9`; не терять их при будущих merge.

### feed-prototype

- `61d5c62` — двухвкладочный ticket supersession browser DoD.
- Exact server-owned old/replacement authority, stale CP/start/results terminal,
  chest только у replacement. Independent GO.
- Это production frontend bundle против stub API/runtime, не deployed smoke.

### swipe-generator

- Master `cbccbfb`: field-flag rework handoff с durable backend ACK уже замкнут.
- Provider dispatch разрешён только после exact persisted handoff receipt.

## Замороженные ветки для продолжения

### 1. Backend `catalog:read` — главный следующий merge

Worktree:

`/Users/gleb/My projects/p4g-platform-workspace/swipe-backend-catalog-read`

Branch: `codex/catalog-read-backend` (проверить `git symbolic-ref --short HEAD`).

Commit: `3b590b2` (base `bd289dd`). Не merged/deployed.

Скоуп:

- migration `0040_catalog_read_scope`;
- default-off `ENABLE_CATALOG_READ=false`;
- отдельный singleton `catalog:read`;
- read-only routes:
  - `GET /catalog/browser/entries`
  - `GET /catalog/browser/entries/{entry_id}`;
- stable cursor `(state_changed_at, entry_id)`;
- exact entry/series/LevelSpec/SkinSpec/evaluation/runtime/publish/recall closure;
- preview доступен только при exact runtime requirements + manifest compat +
  host-verified active runtime;
- никаких mutation routes.

Backend-owned golden:

`swipe-backend-catalog-read/docs/specs/fixtures/catalog-browser-read-v1.golden.json`

Frozen byte SHA-256:

`03638d348bdf0e7e0c3e1aafc54495e9f08f7dfa118c5b0b040d294dab7d1fb4`

Старый ранний digest `a4e9…` не использовать: shape не менялась, но fixture
один раз исправлен до внутренне валидных LevelSpec/SkinSpec/manifest identities.

Проверено автором: focused `52/52`, full pure
`662 passed / 162 skipped / 10 subtests`, compileall, Alembic head `0040`,
offline `base→head` и `0040→base`, diff-check. Не выполнены independent review
и physical PostgreSQL/CI; они обязательны до merge.

Особо проверить:

- exact runtime выбирается по entry requirements, не «последний active»;
- bounded list/detail, stable cursor;
- publish operation identity и recall broker receipt присутствуют;
- 401/403, foreign scope, disabled flag, invalid cursor, integrity failure;
- downgrade fail-closed при существующем `catalog:read` evidence.

### 2. Generator read-only catalog browser foundation

Worktree:

`/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-catalog-browser`

Branch: `codex/catalog-browser-lab`

Commit: `e116420 feat(generator): add read-only catalog browser foundation`

Сделано:

- auth-client принимает отдельный `catalog:read`;
- strict cross-repo wire validator читает backend golden напрямую, без копии;
- memory-only device token, bounded no-redirect GET client;
- Lab proxy routes status/auth/list/detail;
- вкладка «Каталог» показывает list/detail, QA history, SkinSpec, publish/recall
  receipts; write controls отсутствуют;
- `npm run verify`: `294/294` green.

Не сделано и не следует скрывать:

- нет catalog-specific CSS polish (разметка функциональна, но стили не добавлены);
- нет local exact preview host/iframe для catalog detail;
- нет browser E2E вкладки и server-route negative tests;
- ветка не прошла независимое adversarial review;
- не merge до финального backend `0040` wire/PG acceptance. Если backend golden
  изменится, сначала обновить cross-repo validator/test.

Следующий атомарный срез здесь:

1. Independent review `e116420` против финального backend golden.
2. Добавить CSS.
3. Сделать local catalog preview host, который заново читает exact detail,
   монтирует только `preview.indexLocator`, проверяет origin/source, посылает
   `configure_level` с exact LevelSpec + SkinSpec и требует двойной ACK.
4. Series ordinals переключаются только по server-owned `preview.levels`.
5. Browser E2E: authorize → list → detail → exact configured preview; no
   publish/recall network surfaces.

### 3. Worker reconcile — принят, но намеренно не в master

Исходное dirty main дерево НЕ ТРОГАТЬ:

`/Users/gleb/My projects/p4g-platform-workspace/swipe-ugc`

Там остаётся пользовательский WIP:

- `README.md`
- `scripts/lint.mjs`
- `worker/experiment.mjs`
- untracked `test/worktree-integrity.test.mjs`
- untracked `worker/worktree-integrity.mjs`

Безопасная интеграционная копия:

`/Users/gleb/My projects/p4g-platform-workspace/swipe-ugc-worker-reconcile`

Branch: `codex/worker-reconcile`

Commits:

- `561dbc3` — checkpoint пользовательского legacy worker hardening только в
  isolated branch;
- `eb386d2` — merge accepted exact rework worker + legacy hardening.

Independent review: GO. Проверки:

- full suite `100 pass / 1 intentional skip / 0 fail`;
- lint `13/13`;
- exact `experiment-rework.mjs` и contract/security files совпадают с accepted
  `431deb9`;
- legacy hash-pin осознанно обновлён на
  `a2abed25926276944f49849618647d369f216e70f342e6949bb40d1064536716`;
- README исправлен: legacy читает model/effort/attempts, exact rework — только
  signed input.

Граница: legacy worker всё ещё не sealed от delayed background source writes.
Его нельзя использовать для rework. Rework запускается только через
`worker/experiment-rework.mjs`.

Перед merge в `swipe-ugc/master`:

1. Сравнить dirty main bytes с checkpoint `561dbc3` и убедиться, что ничего
   нового не появилось после handoff.
2. Не reset/stash main.
3. Получить явную вторую подпись на итог `eb386d2` при необходимости.
4. Merge/cherry-pick только после сохранения пользовательского WIP.
5. Runner всё ещё OFF. Отдельным срезом атомарно переключить generator worker
   path + compatibility digest на committed `experiment-rework.mjs`, затем
   fenced acceptance; только потом думать о трафике.

## Оставшийся порядок пяти ТЗ

1. Закрыть `catalog:read` backend `0040` + PG, затем merge.
2. Закрыть generator catalog browser read-only + exact preview + browser E2E.
3. Подключить отдельный `catalog:recall` UI к уже готовому broker `0039`:
   explicit whole-entry warning, reason, expected epoch, exact receipt; browser
   E2E soft recall. Никакого publish scope.
4. Закрыть roster composer (ТЗ-A): `feed.roster:write`, draft production-bundle
   preview, CAS activation/diff/receipt/rollback. Клиентский parser уже был
   реализован ранее; сверить актуальный статус перед кодом.
5. Default-off deploy smoke: сначала все flags false и routes absent, затем
   узкий временный canary только для Telegram user `42692410`, после smoke снова
   false. Это требует явного участия владельца аккаунта.
6. До первой friend cohort закончить C1 read cards; C2/autopsy только после
   достаточного числа независимых игроков и settled окон.

## Команды первого часа в Claude

```bash
cd "/Users/gleb/My projects/p4g-platform-workspace"

git -C swipe-backend status --short
git -C swipe-backend-catalog-read status --short
git -C swipe-backend-catalog-read symbolic-ref --short HEAD
git -C swipe-generator-catalog-browser show --stat --oneline e116420
git -C swipe-ugc-worker-reconcile show --stat --oneline eb386d2
git -C swipe-ugc status --short
```

После этого:

- сначала завершить/ревьюить backend `0040`;
- не редактировать основной dirty `swipe-ugc`;
- не включать Render flags;
- не запускать provider jobs до exact durable ACK;
- каждое «implemented / tested / deployed / enabled» отмечать отдельно.

## Рекомендуемый стартовый prompt для Claude

> Прочитай полностью `CLAUDE-HANDOFF-2026-07-17.md` и указанные в нём ТЗ.
> Сначала только read-only проверь все branch/worktree/status/commit assertions.
> Не трогай dirty `swipe-ugc/master`, не деплой и не включай flags. Заверши
> backend `catalog:read` migration 0040 до commit, independent review и physical
> PostgreSQL acceptance. Затем сверь generator branch `e116420` с финальным
> backend-owned golden и продолжи exact preview/browser E2E. В каждом отчёте
> отдельно пиши implemented, test evidence, merged, deployed, enabled.
