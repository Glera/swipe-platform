# ТЗ Этап 1 — Mission-slice v0 (founder dogfood)

Статус: **DRAFT, ждёт кросс-ревью** (author: Claude; reviewer: Codex).
Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §1–2, протокол
раундов 1–10. **Предусловие реализации: чистый Island-off baseline
(Этап 0 применён и проверен).** Написание/ревью ТЗ — параллельно
Этапу 0, реализация — строго после.

Цель: один маленький реальный кейс проходит полный честный цикл
`READY → ACTIVE → авто-вклады → UNLOCKED → следующий ACTIVE → реальная
передача → FULFILLED → evidence` на прод-инфраструктуре; игрок —
оператор (founder dogfood). Всё default-off; публичная поверхность не
меняется.

Не-цели v0: коллекции и их вклад (Этап 2; источники вклада v0 —
завершённая qualified-серия и дейлик), приют-карта, campaign share,
«Попросить помочь», holdout-инфраструктура, подписка/VIP, голосование,
sponsored-бюджеты, TMA-аппрув кейсов (v0 — internal CLI), любая
автоматика FULFILLED.

---

## Бэкенд: namespace `mission_*` (одна новая миграция)

Все журналы append-only; паттерны-образцы — из gap-карты §1
(island_completion_claims/outcomes, island_moderation_actions,
feed_policy_config_versions, award_*-writers).

1. **`mission_case_contracts`** — immutable контракт кейса:
   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
   `document` JSONB schema `mission.case-contract.v1`: получатель;
   потребность `scalable|fixed`; guaranteed deliverable и сумма
   гарантии; stretch deliverables; правило rollover; `token_goal`;
   `unlock_share` (v0 — пропорция прогресса); `unlock_cutoff_at`;
   `latest_fulfillment_at`; ожидаемый вид подтверждения. CHECK-и
   формы по образцу feed_policy_config_versions; `registered_by/at`.
2. **`mission_case_events`** — lifecycle-журнал: `seq` (server_default
   nextval `mission_case_events_seq`), пин точного контракта
   (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
   `payload` JSONB, `receipt_digest`; UNIQUE `(case_id, kind)` —
   one-shot переходы; derived state = последний kind по `seq DESC`
   (мутабельного статуса нет).
3. **`mission_pool_ledger`** — rolling impact pool: `source ∈
   seed|revenue_share|partner|subscription_share` (v0 пишется только
   `seed`), `amount_cents`, `currency`, `settled_at`, `meta`,
   `idempotency_key` UNIQUE.
4. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
   reserve_guaranteed` (при READY) `| gift_additional` (при UNLOCKED),
   `case_id`, `amount_cents`, `pool_cursor` (id последней учтённой
   settled-строки ledger), `receipt` JSONB. Инвариант в транзакции под
   advisory-lock пула: `sum(allocations) ≤ sum(settled ledger)`.
   UNLOCKED-снапшот по VISION: `gift = min(guaranteed +
   unlock_share(progress) × settled unallocated pool на cursor,
   need + stretch)`.
5. **`mission_contributions`** (+ child
   **`mission_contribution_allocations`**) — вклад: `user_id`,
   `source ∈ series|daily`, `amount` (лапки), `source_ref`,
   `idempotency_key` UNIQUE (`mc:{run_id}` /
   `mcd:{user}:{utc_date}:{quest_id}`), `seq` из sequence под
   FOR UPDATE строки активного кейса; receipt пишется в той же
   транзакции, replay возвращает byte-identical ответ. Child-строки
   allocation: обычно одна; при пересечении `token_goal` —
   детерминированно две (до цели — текущему кейсу, остаток — новому
   ACTIVE); CHECK: сумма allocation-строк = `amount`.

Логика:

- **Врезка в `POST /api/results`**: при терминальном
  `metric_key='series'` в той же транзакции, что `RewardLedger`, —
  mission contribution (amount детерминирован от `run_id` теми же
  reward-функциями). Аналогичная врезка в daily-claim. За флагом
  `ENABLE_MISSION_CORE`; при выключенном флаге поведение `/results` и
  daily байт-в-байт прежнее (golden-тест обязательный).
- **Пересечение token_goal** — в одной транзакции: split вклада +
  `unlocked` case-event + gift-receipt (snapshot/cursor) + активация
  следующего контракта очереди (нет следующего → состояние «нет
  ACTIVE» допустимо в v0, вклад не начисляется и это видно в receipt).
- **Unlock cutoff** (goal не достигнут к дате): операторский CLI-акт →
  та же UNLOCKED-ветка с фактическим прогрессом (без
  failure-состояния).
- **FULFILLED** — только оператор: CLI-акт с evidence-документом
  (медиа вне БД; в payload — digest + ссылка), dry-run-first.

**Операторский CLI** `python -m app.mission_ops` (образец —
`catalog_operator_promotion`): `register-contract` / `seed-pool` /
`activate` / `unlock-cutoff` / `fulfill`; dry-run по умолчанию,
`--apply` с обязательными exact-identity аргументами; каждый apply =
case-event + intervention-style receipt. Отдельный флаг
`ENABLE_MISSION_OPS`, HTTP-маршрутов нет. Impact-полномочия не
смешиваются с контентными скоупами (отдельный контур; TMA-аппрув —
следующий этап).

**Read API** (`ENABLE_MISSION_READ` + allowlist
`MISSION_DOGFOOD_USER_IDS`, образец catalog dogfood):
`GET /api/mission/case` — текущий ACTIVE: токен-бар к token_goal,
четыре числа (вклад сообщества / гарантировано / зарезервировано и
открыто / реально передано), контракт «в один тап», мой вклад,
последний FULFILLED-кейс (для второй церемонии). Ответ — проекция
только из receipts.

**Тесты (PG, обязательные):** полный E2E цикл; идемпотентность вклада
(реплей `run_id` → byte-identical); конкуренция (два вклада добивают
goal — ровно один UNLOCKED, остаток второго уходит новому ACTIVE);
split-инвариант; pool-инвариант (`allocations ≤ settled`);
UNLOCKED-receipt фиксирует cursor и не меняется при поздних
settled-строках; `/results`/daily при выключенном флаге не изменены
(golden); up/down миграции.

## Клиент (feed-prototype, `VITE_MISSION_ENABLED` default-off)

- **HUD-ретеминг**: бейдж пазлов становится «лапками» (иконка/строки);
  значение = мой вклад в текущий кейс (server-derived из read API).
  Старый puzzle-баланс уходит с поверхности (данные не трогаются).
  Optimistic-контур ко вкладу не применяется.
- **Виджет кейса**: компактный прогресс + экран кейса по тапу (четыре
  числа, контракт, история).
- **Церемония вклада** — в series-win флоу после подтверждённого
  receipt: «ты принёс N лапок» → бар сдвинулся; до challenge-пилюли.
  Дейлик-клейм показывает лапки.
- **Церемонии UNLOCKED** (праздник сбора + «следующая цель открыта») и
  **FULFILLED** (фото/мини-отчёт) — по данным read API при входе.
- Гейт: флаг включается только в dogfood-сборке; прод-сборка не
  меняется.

## Операционка (вне кода, owner — оператор)

Договорённость с локальным приютом; кейс №1 — масштабируемая
потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
формат мини-отчёта; latest fulfillment date; кейс №2 в очереди (для
проверки перехода к следующему ACTIVE).

## Acceptance Этапа 1 (dogfood)

Полный реальный цикл: контракт зарегистрирован → посев в pool → READY
(резервирование) → ACTIVE → оператор играет серии/дейлики, вклады с
receipts → UNLOCKED (snapshot-receipt; кейс №2 ACTIVE) → реальная
закупка корма и передача → FULFILLED с evidence → обе церемонии видны
на клиенте. Все receipts воспроизводимы byte-identical; при выключенных
флагах ни одна публичная поверхность не изменилась.

## Rollback

Флаги off → поведение платформы прежнее; `mission_*` таблицы остаются
(append-only, ни на что не влияют); миграция down — только вне прода.
