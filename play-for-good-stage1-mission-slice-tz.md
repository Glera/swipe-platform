# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v5

Статус: **DRAFT v5 после кросс-ревью R4** (author: Claude; reviewer:
Codex; R1–R3 внесены ранее; R4: `mission_funding_policies` — денежная
политика версионируется и пинится контрактом/receipt'ами;
`mission_contribution_weights` — веса вклада версионируются,
предусловие token_goal проверяется с обеих сторон).
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

0a. **`mission_funding_policies`** — immutable денежная политика
   (образец feed_policy_config_versions): PK `policy_version`,
   `policy_digest`, `document` JSONB schema
   `mission.funding-policy.v1`: полная формула gift, правило
   snapshot/cursor (`eligible = ledger.seq ≤ cursor`), определение
   eligible pool и допустимых источников, правило округления (вниз до
   целых центов), валюта. Контракт кейса пинит точную пару
   `(funding_policy_version, policy_digest)`; UNLOCKED-receipt пинит и
   контракт, и политику — по какой денежной политике рассчитан
   подарок, доказуемо из самого receipt, а не из глобального текста ТЗ.
0b. **`mission_contribution_weights`** — immutable versioned веса
   источников вклада (серия/дейлик; позже коллекции): amount-правила
   по источникам, `weights_version`, digest (требование gap-карты
   «веса — versioned config»). Каждый contribution пинит точную
   версию весов. Регистрация новой версии весов **отклоняется**, если
   её максимальный одиночный вклад превышает `token_goal` любого
   текущего READY/ACTIVE кейса — предусловие проверяется совместно с
   обеих сторон. Runtime-защита: вклад, не помещающийся в две
   child-строки, отклоняется retryable-ошибкой до операторской
   резолюции — каскад по N кейсам в v0 запрещён.
0c. **`mission_case_bindings`** — immutable биндинг «кейс ↔ ровно одна
   версия контракта»: PK `case_id`, `contract_version` (FK на
   contracts; пара UNIQUE), `bound_at`. Создаётся при `ready` и никогда
   не меняется: новая версия потребности = **новый case_id** (в
   культуре «изменение биндинга = новая identity»). Все остальные
   таблицы ссылаются composite-FK `(case_id, contract_version)` на
   bindings, а не на contracts напрямую — расхождение версий вдоль
   lifecycle-цепочки (READY на v1, UNLOCKED на v3) невозможно by
   construction.
1. **`mission_case_contracts`** — immutable контракт кейса:
   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
   `document` JSONB schema `mission.case-contract.v1`: получатель;
   потребность `scalable|fixed`; guaranteed deliverable;
   **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
   `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
   (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
   `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
   `latest_fulfillment_at`; `queue_position`; ожидаемый вид
   подтверждения; **пин `(funding_policy_version, policy_digest)`** —
   денежная политика входит в contract_digest. `registered_by/at`.
2. **`mission_runtime`** — **singleton-строка** (PK-константа,
   CHECK id=1): пара `active_case_id + active_contract_version`
   (nullable вместе), `updated_seq`.
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
4. **`mission_pool_ledger`** — rolling pool: **монотонный `seq`
   (BIGSERIAL)**; строки immutable и вставляются только уже settled
   (`settled_at` фиксируется при insert, задним числом строки не
   settled-ятся); `source ∈
   seed|revenue_share|partner|subscription_share` (v0 — только seed),
   `amount_cents`, `currency` (CHECK `='EUR'`), `meta`,
   `idempotency_key` UNIQUE. **Правило cursor'а:** `pool_cursor`
   allocation'а = max `ledger.seq` на момент снапшота; `settled
   unallocated eligible pool на cursor` = `sum(ledger.amount при seq ≤
   cursor) − sum(предыдущих allocations)`. Поздние строки получают
   больший `seq` и в прошлый снапшот не входят — immutable
   UNLOCKED-сумма воспроизводима by construction.
5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
   reserve_guaranteed|gift_additional`, `(case_id,
   contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
   `pool_cursor`, FK на породивший lifecycle event, `receipt`.
   **Финансовая идемпотентность и границы:** UNIQUE idempotency
   identity (`res:{case_id}:{contract_version}` /
   `gift:{case_id}:{contract_version}`); округление
   `unlock_share × cents` — вниз до целых центов; CHECK-и:
   `unlock_share ∈ [0,1]` (в receipt), `guaranteed_cents ≤
   confirmed_need_cents + stretch_cap_cents` (на контракте),
   положительные `amount_cents` в ledger и allocations. Инвариант (в
   транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
   ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
   unlock_share(progress) × settled unallocated pool на cursor,
   confirmed_need_cents + stretch_cap_cents)`.
6. **`mission_contributions`** (+ child
   **`mission_contribution_allocations`**) — вклад: `user_id`,
   `source ∈ series|daily`, `amount`, `source_ref`,
   `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
   **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
   `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
   **пин `weights_version`** (по какой версии весов посчитан amount);
   `seq` под runtime-lock; receipt в той же транзакции, replay
   byte-identical. Child-allocations (каждая пинит `(case_id,
   contract_version)`): обычно одна строка; при пересечении
   `token_goal` — детерминированно две. **Инвариант
   `sum(child)=amount` — service-level в той же транзакции +
   reconciliation-тест** (обычный SQL CHECK не читает другие строки;
   constraint trigger — опциональное усиление позже).
7. **`mission_fulfillments`** (+ child
   **`mission_fulfillment_allocations`**) — typed transfer receipt
   `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
   `amount_cents`, `currency` (CHECK `='EUR'`), `recipient`,
   `transfer_reference`/`transfer_date`, `evidence_digest`, immutable
   content-addressed `artifact_url`. Child-строки связывают receipt с
   **каждой** покрываемой allocation-строкой (обычный перевод
   покрывает две: `reserve_guaranteed` + `gift_additional`). Сервис
   принимает fulfill только при полном покрытии зафиксированного gift
   (`sum(child) = amount_cents = зарезервировано+открыто кейса`);
   `FULFILLED` event пишется атомарно в той же транзакции. Публичное
   «реально передано» проецируется **только** из fulfillment-receipts.

**Exact contract identity проходит через всю схему:** runtime,
case-events, pool-allocations, contribution-allocations и
fulfillments пинят точную пару `(case_id, contract_version)`
composite-FK **на `mission_case_bindings`** — версия у кейса ровно
одна на весь lifecycle, из каждой строки доказуемо, по какой версии
посчитаны goal и деньги, а расхождение версий между событиями
исключено схемой, не только тестом.

### State machine и очередь

`register-contract` → **`ready`** (отдельная CLI-команда: резервирует
гарантию из pool — allocation `reserve_guaranteed` — и пишет
ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
(допустим только при `active_case_id IS NULL`; берёт head очереди
READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
`unlock-cutoff`) **в той же транзакции активирует следующий READY из
очереди**. Правила:

- Включение `ENABLE_MISSION_CORE` требует **DB-preflight** —
  CLI-команда и startup-проверка, не config-validator (у него нет
  доступа к БД): существует ACTIVE и ≥1 READY-successor.
- Аварийный путь пустой очереди (VISION-совместимый): транзакция
  пересекающего вклада **не коммитится** и возвращает retryable
  **503** — клиентский outbox сохраняет результат и повторит после
  появления READY-кейса. Не 409: существующий result-outbox считает
  409 terminal и удалит запись. `unlock-cutoff` при отсутствующем
  successor отказывает до создания READY-кейса. Операционный
  инвариант — держать очередь непустой; 503-ветка — предохранитель,
  не рабочий режим.
- Предусловие v0 (проверяется с ОБЕИХ сторон): при
  `register-contract` — `token_goal` кейса ≥ максимального одиночного
  вклада **активной версии `mission_contribution_weights`**; при
  регистрации новой версии весов — её максимум не превышает
  `token_goal` ни одного READY/ACTIVE кейса (иначе отказ). Пересечение
  затрагивает максимум два кейса, двух child-строк достаточно;
  runtime-нарушение → retryable-отказ. Каскад по N кейсам — только с
  крупными collection-наградами (Этап 2).

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
(golden), вкладов нет, capability нет**; пустая очередь → 503
retryable, outbox сохраняет и повторяет после появления READY, вклад
не потерян и не задублирован; fulfillment покрывает обе allocation
child-строками, частичное покрытие → отказ без FULFILLED-события;
пин `(case_id, contract_version)` присутствует во всех receipts;
негативный тест расхождения версий (событие/allocation с версией, не
совпадающей с binding → FK-отказ); снапшот воспроизводим из
`ledger.seq ≤ cursor` при любых поздних строках; округление вниз и
границы CHECK-ов; up/down миграции.

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
