NO-GO

# Кросс-ревью Stage 1 Mission-slice v0 — R3

- Дата: 01.08.2026.
- Reviewer: OpenAI Codex, read-only review; ветки реализации не изменялись.
- Часть A backend: `swipe-backend` exact head
  `2029867495578310dda92c170a2e07c71203eefa`.
- Часть B client: `feed-prototype` exact head
  `43f92693b55057d4c22652cbd81dad4ab67f0171`.
- R1-A policy candidate: backend
  `9ec641a5c1bfdbf2241cc7974142aa0b680a300b`; это ещё не production
  authority и не разрешение merge.

## Finding

1. **[P2] Fixed Stage 1 всё ещё не проходит согласованную executable §7
   границу: два domain-модуля импортируют глобально неразрешённый
   `app.config`.** После post-Stage-0 rebase policy узко расширена ровно двумя
   согласованными shared dependencies — `app.models` для metadata/FK и
   `app.content_identity` для JCS
   (`deploy/mission-architecture-policy.v1.json:49`). Обновлённый parser
   корректно распознаёт `from . import models` как `app.models`, и оба
   согласованных исключения проходят. Но запуск этого exact guard на backend
   head R3 возвращает ровно две ошибки:

   - `app/mission_entry.py:31`: `from .config import get_settings`;
   - `app/mission_ops.py:42`: `from .config import get_settings`.

   Оба файла входят в `app/mission_*.py`, поэтому для guard это Mission domain,
   а `app.config` отсутствует в `missionDomain.allowedLocalImports`. Это не
   косметика: после R1-A cutover required PostgreSQL acceptance будет запускать
   guard и Stage 1 merge станет красным. Глобально добавлять `app.config` в
   разрешения без authority-diff нельзя — оператор явно согласовал только
   metadata/JCS исключения. Автору нужно либо убрать эти зависимости, либо
   предложить более узкое per-module adapter-исключение для
   `mission_entry`/`mission_ops` и получить author≠reviewer approval. До этого
   Stage 1 остаётся DO NOT MERGE.

## Findings R2 — закрытие подтверждено

### R2/F1: DB/service validator parity — closed

- Funding-policy SQL validator закрывает nested keys, null/non-string,
  duplicate/empty/unknown sources.
- Weights SQL validator закрывает document/rule keys и принимает только exact
  integer amount ≥1; fractional `1.5` больше не становится runtime `1`.
- `activate_weights` повторяет service validation и digest binding перед тем,
  как строка становится amount-authority.
- Регрессии direct INSERT + activation присутствуют в
  `tests/test_mission_migration_postgres.py`; exact-head PG16 run
  `30686386702` завершился success, включая Full PostgreSQL acceptance и обе
  mission roundtrip jobs.
- Локальный pure-contract прогон: `tests/test_mission_core.py` — 48 passed.

### R2/F2: one-tap funding contract — closed

- UI рендерит поля из собственных keys закрытого wire-document, поэтому новое
  денежное поле видно raw, а не молча теряется.
- Показаны exact enum values и объяснения `giftFormula`, `snapshotRule`,
  `poolConsumption`, `rounding`, `currency`, `eligiblePool`; fixture совпадает
  с backend closed schema.
- Локально на exact head: mission core — 123 assertions; production browser
  path — PASS, включая exact key-set/value assertions.

## Дополнительные проверки

- Backend budget после validator-parity fix: восемь `mission_*.py`, максимум
  592 строки, aggregate `3185/3200`; `app/config.py` — `22/25`. Рост с
  прежних 3144 до 3185 вызван R2/F1 fix и остаётся внутри ceiling, но запас
  теперь 15 строк.
- Client budget/Island boundary в R3 не менялись finding'ом F2; targeted
  browser/core acceptance зелёный.
- Ни одна production/main ветка не изменена, Stage 1 migrations 0071/0072 не
  merged. После R1-A cutover они всё равно требуют rebase/renumber, потому что
  R1-A занимает следующий master revision 0071.

## Условие R4

Закрыть единственный P2 выше и прислать fixed backend exact SHA. R4 повторяет
R1-A Mission guard на fixed head и проверяет, что решение не расширяет
глобальную authority сверх согласованных `app.models`/`app.content_identity`.
Money/browser suites повторять не требуется, если соответствующие файлы не
меняются.
