# Workspace map for agents

Карта репозиториев workspace: назначение, authoritative docs, verify-команда,
границы. Durable-решения и инварианты — в [CLAUDE.md](CLAUDE.md) (ledger).
Продуктовое направление — `VISION.md` (появится в WS5). Спецификация
dev-loop: [docs/specs/dev-loop.md](docs/specs/dev-loop.md).

Cross-repo research каталога игровых классов и шаблон декомпозиции:
[docs/mechanics/README.md](docs/mechanics/README.md). Это proposal для выбора
и подготовки прототипов, не implementation status и не product authority.

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
