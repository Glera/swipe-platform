# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v2

Статус: **DRAFT v2 после кросс-ревью R1** (author: Claude; reviewer:
Codex; findings R1: №3 dogfood-изоляция writers, №4 singleton
ACTIVE/очередь, №5 receipt до клиента, №6 typed fulfillment/деньги,
№7 инвариант суммы allocations, UX-watermark — все внесены).
Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §1–2.
**Предусловие реализации: чистый Island-off baseline (Этап 0 применён
и проверен).**

Цель: один маленький реальный кейс проходит полный честный цикл
`READY → ACTIVE → авто-вклады → UNLOCKED → следующий ACTIVE → реальная
передача → FULFILLED → evidence` на прод-инфраструктуре; игроки —
только enrolled dogfood-пользователи (оператор). Всё default-off;
для не-enrolled пользователей поведение платформы не меняется ни в
чтении, ни в записи.

Не-цели v0: коллекции и их вклад (Этап 2), приют-карта, campaign
share, «Попросить помочь», holdout, подписка/VIP, голосование,
sponsored-бюджеты, TMA-аппрув кейсов (v0 — internal CLI), автоматика
FULFILLED, мультивалютность (v0 жёстко EUR).

---

## Бэкенд: namespace `mission_*` (одна новая миграция)

Все журналы append-only; образцы — island_completion_claims/outcomes,
island_moderation_actions, feed_policy_config_versions, award_*.

1. **`mission_case_contracts`** — immutable контракт кейса:
   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
   `document` JSONB schema `mission.case-contract.v1`: получатель;
   потребность `scalable|fixed`; guaranteed deliverable;
   **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
   `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
   (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
   `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
   `latest_fulfillment_at`; `queue_position`; ожидаемый вид
   подтверждения. `registered_by/at`.
2. **`mission_runtime`** — **singleton-строка** (PK-константа,
   CHECK id=1): `active_case_id` (nullable), `updated_seq`.
   **Единая точка сериализации: каждый lifecycle- и
   contribution-writer начинает транзакцию с
   `SELECT … FROM mission_runtime FOR UPDATE`** — двух ACTIVE-кейсов
   не существует by construction, авторитет «какой кейс ACTIVE» —
   эта строка (проекция, воспроизводимая из событий).
3. **`mission_case_events`** — lifecycle: `seq` (nextval
   `mission_case_events_seq` под runtime-lock), пин контракта
   (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
   `payload`, `receipt_digest`; UNIQUE `(case_id, kind)`. Derived
   state кейса = последний kind по `seq DESC`.
4. **`mission_pool_ledger`** — rolling pool: `source ∈
   seed|revenue_share|partner|subscription_share` (v0 — только seed),
   `amount_cents`, `currency` (CHECK `='EUR'`), `settled_at`, `meta`,
   `idempotency_key` UNIQUE.
5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
   reserve_guaranteed|gift_additional`, `case_id`, `amount_cents`,
   `currency` (CHECK `='EUR'`), `pool_cursor`, `receipt`. Инвариант
   (в транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
   ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
   unlock_share(progress) × settled unallocated pool на cursor,
   confirmed_need_cents + stretch_cap_cents)`.
6. **`mission_contributions`** (+ child
   **`mission_contribution_allocations`**) — вклад: `user_id`,
   `source ∈ series|daily`, `amount`, `source_ref`,
   `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
   **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
   `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
   `seq` под runtime-lock; receipt в той же транзакции, replay
   byte-identical. Child-allocations: обычно одна строка; при
   пересечении `token_goal` — детерминированно две. **Инвариант
   `sum(child)=amount` — service-level в той же транзакции +
   reconciliation-тест** (обычный SQL CHECK не читает другие строки;
   constraint trigger — опциональное усиление позже).
7. **`mission_fulfillments`** — typed transfer receipt
   `mission.fulfillment-receipt.v1`: `case_id` + gift/allocation
   identity (FK на конкретные allocations), `amount_cents`,
   `currency` (CHECK `='EUR'`), `recipient`,
   `transfer_reference`/`transfer_date`, `evidence_digest`,
   immutable content-addressed `artifact_url`. Сервис проверяет, что
   transfer покрыт указанными allocations кейса (сумма совпадает).
   Публичное «реально передано» проецируется **только** из
   fulfillment-receipts.

### State machine и очередь

`register-contract` → **`ready`** (отдельная CLI-команда: резервирует
гарантию из pool — allocation `reserve_guaranteed` — и пишет
ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
(допустим только при `active_case_id IS NULL`; берёт head очереди
READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
`unlock-cutoff`) **в той же транзакции активирует следующий READY из
очереди**. Правила:

- Включение `ENABLE_MISSION_CORE` требует preflight: существует ACTIVE
  и ≥1 READY-successor (проверка конфиг-валидатором/CLI).
- Fallback пустой очереди: если пересекающий вклад пришёл, а READY
  successor отсутствует — остаток зачисляется текущему кейсу сверх
  цели (бар честно показывает >100%), вклад не теряется; операционный
  инвариант — держать очередь непустой.

### Dogfood-изоляция (writers И readers)

Единый server-owned allowlist `MISSION_DOGFOOD_USER_IDS` применяется:
(а) во врезках `/api/results` и daily-claim — **вклад создаётся только
enrolled-пользователям**, для остальных поведение байт-в-байт прежнее;
(б) в read API; (в) в `/session` отдаётся capability
`mission_dogfood` (образец operator-debug-entry capability) — клиент
монтирует миссию только при `VITE_MISSION_ENABLED && capability`.

### Врезки и доставка receipt до клиента

- `POST /api/results` (терминальная серия) и daily-claim: в той же
  транзакции, что RewardLedger, — mission contribution; в ответ
  добавляется **optional блок `mission_contribution`** (receipt: id,
  amount, allocations по кейсам, состояние бара после). Ответ
  фиксируется как обычно; **`_verified_replay_response` восстанавливает
  тот же блок** (replay возвращает committed-байты; у receipts,
  созданных до включения флага, блока нет — это корректно).
- Клиент: `ResultResp → outbox ResultReceipt` расширяется переносом
  `mission_contribution`; церемония вклада в series-win флоу читает
  **только** этот receipt (никакого optimistic). Аналогично для
  daily-ответа.

### Операторский CLI `python -m app.mission_ops`

Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
`unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
digest + artifact URL). Все dry-run по умолчанию, `--apply` с
обязательными exact-identity аргументами; каждый apply = case-event +
receipt. Отдельный флаг `ENABLE_MISSION_OPS`, HTTP-маршрутов нет;
impact-полномочия не смешиваются с контентными скоупами.

### Read API

`ENABLE_MISSION_READ` + capability: `GET /api/mission/case` — текущий
ACTIVE (токен-бар, четыре числа: вклад сообщества / гарантировано /
зарезервировано и открыто / реально передано-из-fulfillments, контракт
в один тап), мой вклад, последний FULFILLED (**с immutable event id для
клиентского watermark**). Ответ — проекция только из receipts.

### Тесты (PG, обязательные)

Полный E2E цикл; идемпотентность (`mc:{run_id}`, `mcd:` реплей →
byte-identical); конкуренция под runtime-lock (два вклада добивают
goal — ровно один UNLOCKED, остаток второго — новому ACTIVE);
двух ACTIVE не существует (негативный тест `activate` при занятом
runtime); split-инвариант + reconciliation; pool-инвариант; snapshot
не меняется от поздних settled-строк; fulfillment coverage (transfer =
сумма указанных allocations; чужие allocations → отказ);
**не-enrolled пользователь: `/results`/daily байт-в-байт прежние
(golden), вкладов нет, capability нет**; пустая очередь → бар >100%,
вклад не потерян; up/down миграции.

## Клиент (feed-prototype, `VITE_MISSION_ENABLED` + capability)

- HUD-ретеминг: бейдж пазлов → «лапки»; значение = мой вклад в текущий
  кейс (server-derived). Старый puzzle-баланс уходит с поверхности
  (данные не трогаются). Optimistic ко вкладу не применяется.
- Виджет кейса + экран кейса (четыре числа, контракт, история).
- Церемония вклада в series-win флоу — из `mission_contribution`
  receipt результата (до challenge-пилюли); дейлик-клейм показывает
  лапки из receipt daily-ответа.
- Церемонии UNLOCKED и FULFILLED — по read API; **client watermark по
  immutable event id** (образец island-celebrated-stages): каждая
  церемония показывается один раз, не при каждом входе.
- Прод-сборка не меняется: без capability миссия не монтируется даже
  при включённом VITE-флаге.

## Операционка (вне кода, owner — оператор)

Договорённость с локальным приютом; кейс №1 — масштабируемая
потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
READY до включения core** (требование preflight).

## Acceptance Этапа 1 (dogfood)

Полный реальный цикл: контракт → посев → READY (резервирование) →
ACTIVE → enrolled-оператор играет серии/дейлики, вклады с receipts →
UNLOCKED (snapshot-receipt; кейс №2 ACTIVE) → реальная закупка корма и
передача → FULFILLED с typed transfer receipt и evidence → обе
церемонии показаны один раз (watermark). Все receipts воспроизводимы;
для не-enrolled пользователей не изменилось ничего (проверено golden).

## Rollback

Флаги off → поведение платформы прежнее; `mission_*` таблицы остаются
(append-only, ни на что не влияют); миграция down — только вне прода.
