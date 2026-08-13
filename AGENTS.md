# Workspace map for agents

Карта репозиториев workspace: назначение, authoritative docs, verify-команда,
границы. Durable-решения и инварианты — в [CLAUDE.md](CLAUDE.md) (ledger).
Продуктовое направление — `VISION.md` (появится в WS5). Спецификация
dev-loop: [docs/specs/dev-loop.md](docs/specs/dev-loop.md).

Cross-repo research каталога игровых классов и шаблон декомпозиции:
[docs/mechanics/README.md](docs/mechanics/README.md). Это proposal для выбора
и подготовки прототипов, не implementation status и не product authority.

## Роли моделей и оркестрация (операторские решения 04.08, 07.08 и 12.08.2026)

- Оркестрация инициатив, архитектура, вкусовые решения и финальные
  vision/authority-решения — только frontier-модели. Claude Fable вызывается
  только как исключительная frontier-эскалация с явным обоснованием и effort
  `high`; `max` запрещён без отдельного явного запроса оператора.
- Обычный blind code review, включая exact-head Tier 1/Tier 2, по умолчанию
  выполняет Claude Opus 5 с effort `high`. Opus может подписывать code verdict,
  но не оркестрирует frontier-агентов и не заменяет vision/authority-подпись.
- Маршрутизация вниз — ответственность frontier-оркестратора, не оператора:
  frontier сам решает, какие задачи отдать Opus-субагентам, и сам ревьюит
  результат. Оператор не управляет выбором модели и не получает «даунгрейд»
  оркестрирующей сессии.
- Механическая работа — всегда вниз, даже когда «быстрее сделать самому»:
  скриншоты и навигация по дашбордам, сбор логов, поллинг CI, массовые
  правки по готовому списку, перебор файлов. Frontier оставляет за собой
  суждение: что проверять, что означает результат, что делать дальше.
  Признак нарушения — frontier-сессия несколько ходов подряд выполняет
  шаги без принятия решений.
- Необратимые и authority-changing действия во внешних системах
  (Approve/Reject чужого контента, секреты и credentials, permissions,
  биллинг, инфраструктура, миграции живой БД, destructive acts, rollback с
  потерей данных) не делегируются агентам: их выполняет оператор по точной
  инструкции и evidence.
- Узкое исключение для prototype fast lane: frontier-владелец может сам
  запустить **один штатный обратимый deploy** уже проверенного `master`, если
  исходный запрос оператора явно просит обновить/опубликовать результат,
  существующий deploy-path не меняется, миграций/секретов/env/permissions/
  инфраструктуры нет, CAS и CI зелёные, а rollback заранее известен. Отдельное
  операторское нажатие или микро-GO перед кнопкой не требуется. Агент сверяет
  live CAS, запускает один раз, наблюдает terminal result и сообщает receipt;
  retry или rollback после ошибки требуют новой оценки, не выполняются по
  инерции.
- Один владелец на контур в каждый момент; смена владельца — только через
  письменный хэндофф. Независимый reviewer — адверсариальный ревьюер, не
  со-владелец.
- Необратимые шаги (контур «ядро» в [CLAUDE.md](CLAUDE.md)) исполняются
  только со второй подписью: оператор или frontier-сессия поверх вердикта
  владельца контура.
- Подпись привязана к уровню модели, не к сессии: если оркестрирующая
  сессия обнаруживает себя на не-frontier модели (даунгрейд клиента,
  авто-выбор), она НЕ даёт подписей/GO, явно сообщает об этом оператору и
  ограничивается статусом по STATE.md до восстановления frontier. Уже данные
  подписи остаются действительными для подписанного exact head.
- Запрос GO обязан назвать категорию ядра из `CLAUDE.md`. Если категория не
  названа, scope/authority не расширены и действие входит в standing authority,
  агент продолжает сам и не создаёт процедурный GO. Любая live-миграция БД
  пока остаётся отдельным операторским актом.
- Standing authority неизменного подписанного scope: read-only evidence,
  bounded correction, PR/CI/merge, один штатный reversible deploy/restart и
  одна заранее описанная recovery. Оно не покрывает scope expansion, новые
  secrets/credentials/settings/permissions/infrastructure, irreversible acts,
  live DB migration, automatic retry/rollback или product/taste decision.
- Транспорт между машинами — durable GitHub Issue event по Phase 0 contract с
  exact refs/evidence. Разрешающий следующую работу handoff обязан в том же
  record содержать typed discoverable wake; evidence и wake не разделяются.
  Control-Issue follow-up публикуется только через
  `node scripts/two-mac-bridge.mjs publish-wake`, а heartbeat читает его через
  `scan-wakes` с отдельными scanned/consumed cursors. Заголовок не является
  dispatch; адресованный prose/malformed wake даёт
  `NEEDS_HELP:malformed_targeted_wake`, а не `no work`.
  Отдельный файл нужен только для canonical core/release outcome, не для Tier
  0/1 review-раундов. Пересказ и перенос оператором не используются.
- Контрольный док портфеля: `STATE.md` в корне — каждая оркестрирующая
  сессия читает его первым и обновляет последним. Это экран до 150 строк, не
  исторический ledger.

## Two-Mac Zero-Transfer Bridge Phase 0 (операторское решение 11.08.2026)

- Полный контракт:
  [docs/specs/two-mac-zero-transfer-bridge-phase-0.md](docs/specs/two-mac-zero-transfer-bridge-phase-0.md),
  durable ticket/closure ledger —
  [meta #94](https://github.com/Glera/p4g-workspace-meta/issues/94). Single-Mac
  v1 и исходный two-Mac v1 superseded как operating authority, но их evidence
  и merged default-off intake переиспользуются.
- Mac A — Product Control Plane и единственная authority для meta/`STATE.md`,
  platform/backend/feed, production/deploy и live Lab host. Mac B — Content
  Factory author/merge owner только `swipe-generator` и `playables`; никаких
  Telegram/backend/Render/production/publication credentials или authority.
- Routing typed: platform → Mac A; mechanic/Labs create/copy/variation → Mac B;
  platform dependency → `NEEDS_PLATFORM_CHANGE` + linked Mac A Issue. Никакой
  model/provider/subscription выбор route не делает.
- GitHub Issue — единственный durable ticket и transport. One-shot bridge pass
  читает append-only exact events; существующая in-chat Codex heartbeat
  возобновляет ту же bound task. Это не background runner или новый scheduler.
  Claim требует proposal и два полных reread; fork/stale/replay/route/task
  mismatch fail closed, offline ticket не крадётся и не переназначается.
- Запрещены arbitrary remote-command API, distributed lease/repo lock, merge
  queue, shared task DB, universal agent platform, quota optimizer и
  `swipe-agents` integration. Local task binding выводится из локальной Codex
  identity; оператор не переносит prompts/receipts/SHA/task IDs.
- Mac B single author slot: сначала Two Dots #91, затем Smash #82, затем
  Generator bridge, если владелец Mac B письменно не сериализовал иначе.
  Arrows parked; Labs visual/performance/mobile polish ждёт terminal Phase 0.
- Review tier следует реально затронутой границе. Bounded bridge/Labs patch —
  один blind cross-provider review; backend/auth/shared authority — Tier 2.
  Один раунд = один discovery со всей партией findings, общая коррекция P1/P2
  и один узкий author-blind delta-verification нового exact head; P3 не
  блокируют по умолчанию. Новый полный discovery — только по явному запросу
  оператора либо при расширении scope/authority.
  New credential/permission/setting, destructive act или publication требуют
  consolidated operator window; обычный reviewed merge/deploy без них следует
  текущим CAS/CI правилам.
- `NEEDS_HELP` не позднее следующего orchestration/heartbeat окна триажится
  frontier-оркестратором: technical внутри standing authority → тому же owner;
  product/taste/new authority → оператору; repeated failure/CAS ambiguity →
  typed terminal `STOP`. Portfolio priority conflict решает оператор.
- До измерения 10–20 реальных bridge tickets не добавлять новый dispatcher,
  task-store/DB, merge queue, repo-lock/lease или quota optimizer.

## Репозитории

| репозиторий | назначение | authoritative docs | verify | границы / запреты |
| --- | --- | --- | --- | --- |
| `swipe-backend` | Backend ленты/каталога (FastAPI, SQLAlchemy 2, Alembic, PostgreSQL) | `swipe-backend/docs/specs/` — `feed-policy.md`, `operator-console.md`, `agent-team.md`, `IMPLEMENTATION-STATUS.md` | `pytest` по затронутым модулям; полная приёмка — CI `postgres-acceptance.yml` (чистый PG16, base→head, roundtrip-матрица) | Активация только по server-owned evidence; никакого caller-authored JSON в маршрутах активации; фичефлаги default-off |
| `feed-prototype` | Frontend ленты (Vite/TS, Telegram-first) | `feed-prototype/README.md`, `feed-prototype/ISLAND.md` + spec-ссылки в backend | `npm run lint` (tsc + полный набор check:* включая browser) | Читает backend fixtures (sibling); три фронтенд-гейта default-off (`VITE_*`) |
| `swipe-generator` | Ночная фабрика контента + Lab/operator console (Node, .mjs) | `swipe-generator/README.md` | `npm run verify` (check + node --test) | Тесты читают sibling `swipe-ugc`/`swipe-backend`/`playables`; публикация только через TMA-approve цепочку |
| `swipe-ugc` | Worker: bake/preview/QA-baseline | `swipe-ugc/docs/` | `npm run verify` (lint + test + bake --check-base + test:preview) | — |
| `playables` | Механики playable ads; 3 таргета: applovin / ftue / swipe | `playables/CLAUDE.md` | `npm run release <id>` (полный, 20 Playwright-проверок); `--no-runtime` для static; финальный гейт `npm run ship <id>` | `pins-ftue` — frozen FTUE-fork: правка = только целевой уровень; `pins-v1` frozen applovin |
| `swipe-agents` | A1 production-ops: deterministic supervisor + watchers + Telegram + SQLite. **No LLM** | `swipe-backend/docs/specs/agent-team.md`, `swipe-agents/docs/runbook-a1.md` | `npm run typecheck && npm test` (Node ≥24) | НЕ смешивать с dev-loop; `AGENTS_ENABLE_BOT` off до B1; никаких mutating external authorities |
| корень (meta-repo) | Workspace tooling/docs | `docs/specs/dev-loop.md` | `node --test 'scripts/*.test.mjs'` | Отслеживает только tooling/docs; вложенные репо — в `.gitignore` явным списком |

Legacy P4G-контур (`liveops-shared`, `solitaire-core`, `p4g-platform`, …) —
отдельный старый npm-workspace (`npm run verify` корневого `package.json`);
к swipe-платформе не относится.

## Authority по типу факта

| тип факта | authority |
| --- | --- |
| migration head | Alembic graph (`swipe-backend/alembic/`) |
| результаты проверок | CI соответствующего репо |
| rollout/readiness | `swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md` |
| durable decisions, инварианты | root `CLAUDE.md` |
| продуктовый смысл | `VISION.md` |

Правило: документ не дублирует изменчивый факт чужого authority — он
ссылается на него. В root `CLAUDE.md` допустимы стабильные ссылки на
миграции как identity («инвариант X введён миграцией 0016»); запрещены
утверждения вида «текущий head», «сейчас зелёное», «последняя миграция»,
«passes/passed … E2E». Изменчивый статус миграций и готовности живёт в
`swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md` + CI.
Проверка: `node scripts/docs-boundary-lint.mjs` — **enforcing**, входит в
`node --test 'scripts/*.test.mjs'` через `scripts/docs-boundary-lint.test.mjs`.

## Когда тянуться за dev-loop инструментами (для агентов)

Рефлексы по умолчанию. Гид: [docs/dev-loop-guide.md](docs/dev-loop-guide.md).

| Триггер | Инструмент |
| --- | --- |
| Готовишь нетривиальное изменение backend/generator (или любую правку логики) к commit/PR/merge | skill `auto-review` — слепой ревьюер до слияния, findings → диспозиции |
| Изменил playable-механику/уровень | `playables/`: `npm run visual-proof <id> -- --include <пути>` — ролики before/after |
| Конец рабочей сессии или после вливания веток | `node scripts/worktree-status.mjs` — показать stale-копии |
| Правишь root `CLAUDE.md` | не вноси изменчивый статус (ловит docs-boundary-lint); статус → `IMPLEMENTATION-STATUS.md` + CI |
| Идея/фича/фидбек на триаж | сверь с `VISION.md` (в направлении / мимо) |

**Граница merge (детерминированное напоминание, не память):** во всех пяти
swipe-репозиториях стоит warning-only git pre-push hook
(`scripts/hooks/pre-push`, ставится `node scripts/install-dev-loop-hooks.mjs`).
При push в master/main он напоминает про независимое ревью — не блокирует.
Появился новый клон/репо — перезапусти установщик.
