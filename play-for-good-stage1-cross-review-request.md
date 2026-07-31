# Запрос кросс-ревью: Stage 1 Mission-slice v0 (реализация)

Статус: **ОТКРЫТ 31.07.2026.** Автор реализации: Claude (Opus-агенты,
оркестрация и внутреннее ревью — Fable). Требуется независимое
кросс-ревью (Codex, второй аккаунт/мак). Этот файл — самодостаточное
задание; всё нужное — в git.

## Ревьюируемая идентичность

**Часть A — backend (ГОТОВА к ревью):**
- Репо `swipe-backend`, ветка `claude/stage1-p1-mission-core`,
  exact head **`ba5c8fb92d1ea11dc9bcdd4c20c1ca5c99a85a9b`**.
  Перед ревью: `git fetch origin claude/stage1-p1-mission-core` и
  сверь head; если ветка уехала — ревьюй ровно этот SHA.
- Состав: миграции `0071_mission_slice_core` + `0072_mission_ops_receipts`;
  домен `app/mission_{models,contracts,service,lifecycle_service,
  contribution_service,entry,api,ops}.py`; врезки `api_results/api_daily/
  api_session/main/config`; тесты `tests/test_mission_{core,api,
  migration_postgres,e2e_postgres}.py`; CI-wiring в
  `postgres-acceptance.yml`.

**Часть B — клиент (ГОТОВА к ревью):**
- Репо `feed-prototype`, ветка `claude/stage1-p4-mission-client`,
  exact head **`525de9e7853f1f9adbcd107d2c6965ccfbb9a0ba`**.
- Состав: `src/mission-core.mjs` (+`.d.mts`), `src/mission-ui.ts`,
  `src/mission.ts`, `scripts/check-mission-core.mjs` (93 assertions,
  включён в lint); правки `feed.ts` (+37), `api.ts`, `outbox.ts`
  (перенос mission_contribution через durable-квитанцию), `styles.css`.
- Клиентские проверки: двойной гейт `VITE_MISSION_ENABLED &&
  session.mission_dogfood` на каждой точке входа (structural check);
  без гейта — ни DOM, ни запросов, флаг реально сворачивается Vite
  (проверено по бандлам); церемонии только из committed receipts;
  watermark по eventSeq с коммитом до показа; island.ts = 0 строк.

**Клиентские отклонения, одобренные внутренним ревью (оспорь при
несогласии):**
- «История вкладов» на экране кейса — локальные СОБСТВЕННЫЕ receipts
  (user-scoped, дедуп по seq), честно подписано «Мои последние
  вклады»: read API список вкладов не проецирует. Серверная проекция —
  follow-up.
- Имя кейса: в `mission.case-contract.v1` нет поля названия — fallback
  `title`→`guaranteedDeliverable`→`caseId`. Follow-up backend: optional
  `title` в схему контракта.
- В списке дейликов строка награды остаётся в пазлах (реальные числа
  старого ledger); лапки — в церемонии клейма из receipt (числа
  различаются by design: вклад считается weights-документом).
  Вкусовой проход — позже.

## Authority для сверки (в порядке старшинства)

1. `p4g-workspace-meta:play-for-good-stage1-mission-slice-tz.md` (ТЗ v8
   + правка `77d951f` amount-authority) — единственный источник
   требований.
2. `p4g-workspace-meta:VISION.md` v3.0.1 — инварианты (human-true,
   no-guilt, receipts, «токены не деньги»).
3. Граница §7 R1-A: `deploy/mission-architecture-policy.v1.json` на
   ветке `codex/platform-reliability-r1a-implementation` swipe-backend
   (PR #33) + §7 плана в PR #40 meta (head a340792). Guard ещё не
   enforcing — но реализация обязана ему соответствовать.
4. `play-for-good-gap-map-v1.md` v2 — контекст.

## Что проверить (минимум)

1. Соответствие каждой таблицы/CHECK/FK ТЗ v8 (bindings-версия одна на
   lifecycle; UNIQUE-пары policies/weights; пара cutoff'ов
   pool_cursor+alloc_cutoff; append-only триггеры).
2. Инварианты исполнения: ВСЕ writers под runtime-lock; amount ТОЛЬКО
   из weights.document (app.rewards не импортируется); split/UNLOCKED
   в одной транзакции; 503-путь пустой очереди (не 409) с полным
   откатом; byte-identical replay (в т.ч. через
   _verified_replay_response); golden не-enrolled байт-в-байт.
3. §7-граница: net-диффы integration-файлов против бюджетов
   (results≤40/daily≤35/session≤20/main≤20/config≤25), модули ≤600,
   сумма ≤3200, импорты домена.
4. Миграции: единственный head, номера против текущего master
   (master движется — при устаревании down_revision это finding);
   guarded downgrade.
5. CI-wiring: mission-тесты реально исполняются (glob + явный шаг +
   2 roundtrip-джобы).
6. Качество тестов: конкурентный тест (два треда, FOR UPDATE) —
   оценить хрупкость тайминга в CI.

## Отклонения, одобренные внутренним ревью (оспорь, если не согласен)

- 4-й/5-й доменные модули (split по бюджету ≤600 — предписанное
  средство политики).
- `mission_models` импортирует `app.models` (только metadata ради FK
  на users) и `app.content_identity` (JCS) — требует расширения
  allowedLocalImports в §7-политике при rebase R1-A (записано).
- Миграция `0072_mission_ops_receipts` (intervention receipts вне
  закрытого CHECK'а interventions).
- `_legacy_result` тоже создаёт вклад (мост инертен: cutoff
  2026-07-12; используется тестами как harness).
- Roundtrip-джобы CI по node-id, а не file-level (две миграции в
  одном тест-модуле, каждой — своя джоба).
- Replay-restore гейтится только ENABLE_MISSION_CORE (не enrolment):
  committed receipt реплеится как committed.

## Формат отчёта (обязательный)

Файл `play-for-good-stage1-cross-review-r1-report.md` в корне
`p4g-workspace-meta`, закоммиченный тобой (ветка `codex/*` + PR или
прямой push в master — как удобно). Шапка: ревьюированные exact SHA
(Части A/B), модель/effort. Первое слово вердикта: **GO** или
**NO-GO**. Findings списком `[P1]/[P2]/[P3]` с точными файлами/строками
ревьюируемой ветки. Ревью read-only: ветки реализации не менять,
фиксы — за автором после disposition.

Ответ автора: disposition-файл
`play-for-good-stage1-cross-review-r1-disposition.md` тем же форматом
(таблица finding → принято/оспорено → фикс-SHA).
