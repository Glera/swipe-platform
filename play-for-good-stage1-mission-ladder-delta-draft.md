# ТЗ-дельта: лестница подарков вместо `unlock_share`

**Статус:** draft-for-review. Это **дельта к замороженному ТЗ v8**
(`play-for-good-stage1-mission-slice-tz.md`, «GO v8 после diff-проверки R8
30.07.2026», tz:3–10), а **не новое ТЗ**. Всё, что здесь не названо явно,
остаётся в силе дословно по v8.

**Основание:**
- VISION-патч «Правка 13.08.2026-2» (оператор, «два ок»): `VISION.md:14–20`,
  раскрытие — `VISION.md:105–116`, `VISION.md:117–124`, `VISION.md:130–136`,
  `VISION.md:164–168`, `VISION.md:381–394`, `VISION.md:409–416`.
- Операторское решение №5 (показ №1, «заранее обеспеченные ступени»):
  `play-for-good-surfaces-registry-v1.md:110–118`.
- Уточнения формулировок: №18 (`:154–158`), №28 (`:181–182`), №34
  (`:206–209`), №38 (`:226–228`, **отменяет** отображение из №34), №29
  (`:183–188`, кипсейк → бланк сезона).
- Статус патчей: `play-for-good-surfaces-registry-v1.md:308–315`.

**Кодовая база дельты.** Реализация v8 живёт на ветке
`swipe-backend/.claude/worktrees/sharp-rubin-fa638f` (HEAD `55a5656`).
Проверено: `app/mission_*.py`, `migrations/versions/0071–0073` **уже влиты в
`origin/master`** (`33d147a`) и **байт-в-байт совпадают** с веткой
(`git diff --stat origin/master -- 'app/mission*' 0071..0073` пуст). Ссылки
ниже одинаково валидны для обоих чекаутов. Ниже пути даны от корня
`swipe-backend/`.

**Область дельты:** только `app/mission_*` + одна новая миграция. Врезки
`/api/results`, daily-claim, `/session`, клиентский outbox, weights-контур и
fulfillment-контур **не открываются**.

---

## §1. Что НЕ меняется (остаётся байт-в-байт по v8)

1. **Contribution-контур целиком.** Amount-authority (tz:216–231): adapter
   передаёт только typed source identity, amount считает mission-домен из
   runtime-активного `mission_contribution_weights.document`; импорт
   `app/rewards.py` по-прежнему запрещён. Ключи идемпотентности
   `mc:{run_id}` и `mcd:{user_id}:{day}:{quest_id}` (tz:137–147) — без
   изменений. Split вклада на границе цели —
   `app/mission_contracts.py:314–332` (`split_contribution`) — **не
   трогается** (см. §3, п. 6).
2. **Weights-контур.** `register-weights` / `activate-weights` под
   runtime-lock с ревалидацией `token_goal` всех READY/ACTIVE (tz:52–60,
   `app/mission_service.py:343–360`); пин пары
   `(weights_version, weights_digest)` composite-FK'ом
   (`0071_mission_slice_core.py:245–247`, `:538–545`).
3. **Единая точка сериализации.** Каждый mission-writer открывает
   транзакцию `SELECT … FROM mission_runtime FOR UPDATE` (tz:91–97;
   `app/mission_service.py:83–94`). Новых локов, sequence'ов и точек
   сериализации дельта не вводит.
4. **Exact contract identity.** `mission_case_bindings` + пять composite-FK
   на `(case_id, contract_version)` (`0071:343–345`, `:359–366`, `:398–402`,
   `:461–465`, `:576–580`, `:610–614`). Новая таблица §2.4 **встраивается в
   этот же паттерн**, а не заменяет его. «Изменение биндинга = новая
   identity» (tz:61–69) сохраняется: неверная лестница = **новый
   `case_id`**, никогда не правка.
5. **Append-only.** Все mission-журналы сохраняют триггер
   `reject_mission_append_only_mutation()` (`0071:658–669`) и TRUNCATE-guard;
   `mission_runtime` остаётся единственной мутабельной строкой. Ни один
   receipt не редактируется и не удаляется.
6. **Денежные инварианты.** EUR-only CHECK'и на всех четырёх денежных
   таблицах (`0071:312`, `:433`, `:475`, `:619`); строго положительные
   `amount_cents`; `sum(allocations) ≤ sum(settled ledger)` под lock'ом
   (`assert_pool_invariant`, `app/mission_service.py:293–319`); пер-строчная
   консервация `source_breakdown` (`0071:507–514`); FIFO-by-seq потребление
   пула (`take_from_pool`, `app/mission_contracts.py:336–368`); правило
   воспроизводимости по паре `(pool_cursor, alloc_cutoff)` (tz:113–118) —
   **сохраняется, но переносит якорь с UNLOCKED на READY** (§3, п. 5).
7. **Lifecycle-enum и очередь.** `ready|active|unlocked|fulfilled`
   (`0071:405–408`) — **без нового kind**: открытие ступени НЕ становится
   case-event'ом (UNIQUE `(case_id, kind)` из tz:98–102 всё равно запретил бы
   N открытий). READY→ACTIVE→UNLOCKED + активация следующего READY в той же
   транзакции (`app/mission_lifecycle_service.py:257–287`) и retryable-503 на
   пустой очереди (tz:187–194, `app/mission_contribution_service.py:126–129`)
   — без изменений.
8. **Fulfillment.** `mission.fulfillment-receipt.v1`, правило полного
   покрытия `sum(child) = amount_cents`, child-строка на **каждую**
   покрываемую allocation, атомарный FULFILLED (tz:153–164). Меняется только
   **число** покрываемых строк (было «обычно две» — станет «гарантия + N
   зарезервированных ступеней»). Публичное «реально передано» по-прежнему
   проецируется **только** из fulfillment-receipts.
9. **Dogfood-изоляция.** Allowlist `MISSION_DOGFOOD_USER_IDS` на writers и
   readers, capability `mission_dogfood` в `/session`, байт-в-байт прежнее
   поведение для не-enrolled (tz:207–214). Флаги остаются default-off
   (`app/config.py:305–307`), `ENABLE_MISSION_CORE` по-прежнему требует
   непустой allowlist (`app/config.py:757–758`).
10. **Операторский CLI.** `python -m app.mission_ops`, dry-run по умолчанию,
    `--apply` с exact-identity, typed intervention receipt на каждый apply,
    HTTP-маршрутов нет, отдельный `ENABLE_MISSION_OPS` (tz:240–258).
    **Новой подкоманды нет:** `OPS_COMMANDS` (`app/mission_models.py:69–79`)
    и его DB-CHECK `ck_mission_intervention_receipts_command`
    (`0072_mission_ops_receipts.py:53–56`) **не трогаются** — открытие
    ступени никогда не операторский акт.
11. **Клиентский контур.** Никакого optimistic; церемонии читают только
    committed receipt; watermark по immutable event id (tz:301–314). Лестница
    меняет то, **что** отрисовано, а не то, **кто** authority.
12. **Не-цели v0** (tz:22–25) без изменений: коллекции как источник вклада,
    приют-карта, campaign share, holdout, подписка/VIP, голосование,
    sponsored-бюджеты, TMA-аппрув кейсов, автоматика FULFILLED,
    мультивалютность. Лестница **не открывает** ни одну из них — в частности
    VIP-бонусы и коллекционные награды остаются вне слайса, хотя именно они
    были бы естественным источником мульти-ступенчатых пересечений (§5, п. 5).
13. **Read API «контракт в один тап»** (tz:261–274,
    `app/mission_api.py:137–157`): документ контракта + разрешённый документ
    политики (version + digest + тело) по-прежнему отдаются. Реш. №17
    (`registry:146–153`) убрало контракт с **экрана кейса**, не из API;
    лестница обязана быть видна здесь (`VISION.md:413–416`).

---

## §2. Схема: `mission.funding-policy.v2` и лестница в контракте

### 2.0. Где живёт лестница (проектное решение, вынесено в §5 п. 1)

`mission_funding_policies` — **разделяемое immutable правило денег** (формула,
snapshot-rule, eligible sources), пинится каждым контрактом composite-FK'ом
(tz:34–46). Лестница — **пер-кейсовые данные** (пороги в лапках и суммы в
евро), и VISION перечисляет её именно как часть **публичного контракта кейса**
(`VISION.md:117–124`: «лестницу подарков (сумма и порог лапок каждой ступени)»).

Поэтому дельта делит их:
- **политика v2** объявляет *правило* (как открывается ступень, что значит
  «обеспечена», округление, snapshot, потребление пула);
- **контракт v2** несёт *саму лестницу* и входит в `contract_digest`.

Альтернатива «лестница внутри политики» вынуждает регистрировать по политике
на кейс и ломает модель разделяемого правила. Решение — за ревью (§5 п. 1).

### 2.1. Документ политики `mission.funding-policy.v2`

Сейчас (v1) — закрытый набор из 7 ключей и **однозначные enum'ы**;
`giftFormula` захардкожен строкой `guaranteed-plus-floor-proportional-share-v1`
одновременно в трёх местах: SQL-функция `mission_funding_policy_document_ok`
(`0071:72–112`), CHECK `ck_mission_funding_policies_document` (`0071:224–228`),
Python-валидатор `validate_funding_policy_document`
(`app/mission_contracts.py:152–194`) с константами `:31–43`.
Добавить `steps` в v1 **невозможно**: набор ключей проверяется точным
`array_agg(k ORDER BY k) = ARRAY[…]`.

Предлагаемая форма v2 (8 закрытых ключей, та же дисциплина):

```json
{
  "schema": "mission.funding-policy.v2",
  "currency": "EUR",
  "rounding": "declared-cents",
  "giftFormula": "guaranteed-plus-opened-steps-v1",
  "stepRule": "prefunded-reserved-at-ready-open-once-v1",
  "snapshotRule": "ledger-seq-alloc-cutoff-v1",
  "poolConsumption": "eligible-ledger-fifo-by-seq-v1",
  "eligiblePool": { "sources": ["seed"] }
}
```

- `rounding: "declared-cents"` заменяет `"floor-cents"`: округления больше не
  существует **в принципе** — суммы ступеней объявлены целыми центами, деления
  в формуле нет.
- `stepRule` — нормативное определение резервирования и однократности
  открытия (см. 2.3, 2.4).
- `snapshotRule`, `poolConsumption`, `eligiblePool` — без изменений по
  значению; snapshot переезжает с UNLOCKED на READY (§3 п. 5).

### 2.2. Документ контракта `mission.case-contract.v2`

Изменения относительно `mission.case-contract.v1` (tz:70–80,
`app/mission_contracts.py:231–271`, SQL —
`mission_case_contract_document_ok`, `0071:145–171`):

**Удаляется:** ключ `unlockShare` (был обязан быть строкой `"proportional"`,
`0071:166` и `app/mission_contracts.py:245–246`).

**Добавляется:**

```json
"giftLadder": [
  { "stepIndex": 0, "thresholdTokens": 0,      "amountCents": 6000 },
  { "stepIndex": 1, "thresholdTokens": 100000, "amountCents": 10000 },
  { "stepIndex": 2, "thresholdTokens": 500000, "amountCents": 30000 }
],
"ladderTotalCents": 46000
```

Правила формы (все — DB-CHECK, не только валидатор, симметрично тому, как
v8 сверяет `guaranteedCents`/`tokenGoal` колонки с документом,
`0071:153–164`):

| правило | обоснование |
|---|---|
| `stepIndex` — плотная возрастающая последовательность с 0 | детерминированный порядок открытия |
| `thresholdTokens` строго возрастает; `steps[0].thresholdTokens = 0` | ступень 0 — **гарантия**, открыта фактом READY |
| `amountCents > 0` у каждой ступени | CHECK положительности денег сохраняется |
| `guaranteed_cents` (колонка) `= steps[0].amountCents` | гарантия остаётся первоклассным числом v8 |
| `token_goal` (колонка) `= steps[-1].thresholdTokens` | **верхняя ступень ≡ цель**; вся goal-механика v8 переживает дельту без изменений |
| `ladder_total_cents` (колонка) `= Σ amountCents` | денежная граница остаётся plain-SQL, а не JSON-обходом |
| `ladder_total_cents ≤ confirmed_need_cents + stretch_cap_cents` | **заменяет** `ck_mission_case_contracts_guaranteed_bound` (`0071:318–321`) |

Следствие: `min(...)` из `VISION.md:386–387` становится **тождественно
неактивным by construction** (объявить лестницу больше потребности+stretch
нельзя). В коде `min` сохраняется как защитная тавтология с тестом.

### 2.3. Определение «обеспеченной» (зарезервированной) ступени

**Обеспечена = деньги физически изъяты из settled unallocated eligible pool в
транзакции READY.** Публикуется только то, что обеспечено; необеспеченный
кейс не переходит в READY (`VISION.md:110`, `:381–385`; реш. №5).

Сейчас `ready_case` (`app/mission_lifecycle_service.py:134–226`) берёт из
пула **только** `guaranteed_cents` (`:156–168`), отказывая при нехватке
(`:163–166`), и пишет одну allocation `kind='reserve_guaranteed'` с
`idempotency_key = res:{case_id}:{contract_version}` (`:221`).

**v2:** та же транзакция берёт `ladder_total_cents` и отказывает при
нехватке; вместо одной строки пишет **N строк**
`mission_pool_allocations`:

| строка | kind | idempotency_key | примечание |
|---|---|---|---|
| ступень 0 (гарантия) | `reserve_guaranteed` | `res:{case}:{version}` | **байт-в-байт как в v8** — существующий READY-receipt и его тесты сохраняются |
| ступени 1..N | `reserve_step` | `res:{case}:{version}:{stepIndex}` | новые |

Каждая строка несёт свой `source_breakdown` (консервация `0071:507–514`
работает пер-строчно и без изменений), свою пару `(pool_cursor,
alloc_cutoff)` и свой receipt с CAS-пином политики.

Почему N строк, а не одна `reserve_ladder`: read API считает «зарезервировано
и открыто» как сумму **всех** allocation-строк кейса
(`_allocated_cents(..., kind=None)`, `app/mission_api.py:185`). Одна общая
строка мгновенно показала бы всю лестницу как «уже собрано» с момента READY —
прямое нарушение реш. №38. Разделение «деньги ушли из пула» (allocations) и
«ступень открыта» (журнал 2.4) снимает это на уровне схемы, а не рендера.

### 2.4. Новая таблица `mission_gift_steps` (журнал открытий)

Минимальная форма; **держит только открытые ступени 1..N** (гарантия
остаётся строкой `reserve_guaranteed`, чтобы формула
`gift = guaranteed + Σ открытых ступеней` из `VISION.md:386–387` читалась
дословно):

| колонка | тип | правило |
|---|---|---|
| `case_id`, `contract_version`, `step_index` | — | **PK** — «ступень открывается ровно один раз» by construction, без CAS-цикла |
| — | — | composite-FK `(case_id, contract_version)` → `mission_case_bindings` (паттерн `0071:461–465`) |
| `threshold_tokens` | BIGINT NN | CHECK `> 0` (ступень 0 сюда не пишется) |
| `amount_cents` | BIGINT NN | CHECK `> 0`; `currency` CHECK `= 'EUR'` |
| `alloc_seq` | BIGINT NN **UNIQUE** | FK → `mission_pool_allocations.alloc_seq` — точная зарезервированная строка, которую это открытие высвобождает; 1:1 |
| `contribution_seq` | BIGINT NN | FK → `mission_contributions.seq` — вклад-триггер (`VISION.md:164`) |
| `event_seq` | BIGINT NULL | FK → `mission_case_events.seq`; заполняется только когда открытие совпало с UNLOCKED-событием |
| `progress_at_open` | BIGINT NN | committed прогресс в момент открытия |
| `receipt` JSONB NN, `receipt_digest` | — | `mission.gift-step-receipt.v1`, CHECK hex64 |
| `opened_at` | TIMESTAMPTZ | — |

Плюс: триггер `reject_mission_append_only_mutation()` (переиспользуется из
`0071:658–669`), запись в `APPEND_ONLY_TABLES` (`0071:185–197`) и в список
TRUNCATE-guard'а.

### 2.5. Что происходит со старым `unlock_share`

**Колонки `unlock_share` не существует** — в v8 это был только ключ
JSON-документа и пара чисел в receipt'е. Поэтому `ALTER COLUMN` не нужен
нигде; меняются только CHECK-и формы и валидаторы:

| артефакт | где | судьба |
|---|---|---|
| `document->>'unlockShare' = 'proportional'` | `0071:166` (SQL) | удаляется в v2-ветке функции |
| `doc.get("unlockShare") != "proportional"` | `app/mission_contracts.py:245–246` | удаляется |
| `ck_mission_pool_allocations_gift_receipt` (требует `unlockShareNumerator/Denominator` на каждой gift-строке) | `0071:490–502` + зеркало `app/mission_models.py:391–403` | **DROP** — это единственный жёсткий DB-блокер лестницы |
| `unlock_share()`, `gift_total_cents()`, `gift_additional_cents()` | `app/mission_contracts.py:372–384`, `:387–407`, `:410–434` | удаляются целиком |
| `FUNDING_POLICY_GIFT_FORMULA` | `app/mission_contracts.py:31` | новое значение |
| поля `unlockShareNumerator/Denominator` в gift-receipt и в payload UNLOCKED | `app/mission_contribution_service.py:158–182`, `:136–151` | удаляются |
| единственный call-site формулы | `app/mission_contribution_service.py:117–125` | заменяется на SUM по `mission_gift_steps` |
| `kind='gift_additional'` | `ck_mission_pool_allocations_kind` (`0071:470–473`), `ALLOCATION_KINDS` (`app/mission_models.py:64`) | удаляется; добавляется `reserve_step` |

Исторические v1-строки сохранять не требуется — см. §4 preflight; если
preflight найдёт строки, v1-ветка CHECK'а обязана остаться (append-only
запрещает правку старых receipt'ов).

---

## §3. Семантика открытия ступени

1. **Момент.** Открытие происходит **внутри транзакции вклада**, под тем же
   `mission_runtime FOR UPDATE` (`app/mission_service.py:83–94`). Новой точки
   сериализации нет.
2. **Условие.** После вычисления committed-прогресса
   (`app/mission_contribution_service.py:270–271`:
   `progress = case_progress(...)`, `to_current, remainder =
   split_contribution(...)`) берём `progress_after = progress + to_current` и
   открываем **все** ступени с `threshold_tokens ≤ progress_after`, у которых
   ещё нет строки в `mission_gift_steps`, — детерминированно по возрастанию
   `step_index`, каждой — свой receipt, все ссылаются на один
   `contribution_seq`. Мульти-открытие одним вкладом — новый по сравнению с
   v8 случай (там пересечение было ровно одно); см. §5 п. 5.
3. **Частичный прогресс не открывает ничего.** Между порогами нет ни
   receipt'а, ни денежной строки, ни события, ни «частично открытой»
   ступени. Никакой пропорциональной интерполяции в wire не существует.
   Поверхность показывает **«уже собрано €N»** — сумму только уже открытого
   (реш. №38, `registry:226–228`), расшифровка будущих ступеней — только в
   самой лестнице (реш. №28, `registry:181–182`).
4. **CAS-пин — по конструкции v8.** Перед любыми деньгами резолвится пара
   контракта (`app/mission_contribution_service.py:105–108`):
   ```python
   policy = db.get(MissionFundingPolicy, contract.funding_policy_version)
   if policy is None or policy.policy_digest != contract.funding_policy_digest:
       raise MissionConflict(...)
   ```
   Та же пара записывается в step-receipt (аналог `:178–179`), и БД
   пере-проверяет форму receipt'а новым CHECK'ом на `mission_gift_steps`
   (замена `0071:490–502`): требуются `stepIndex`, `thresholdTokens`,
   `amountCents`, `fundingPolicyDigest ~ '^[0-9a-f]{64}$'`, непустой
   `fundingPolicyVersion` и **`contractDigest`** — чтобы точная лестница, по
   которой открывали, была доказуема, а не только политика.
5. **Snapshot переезжает на READY.** `(pool_cursor, alloc_cutoff)` были
   обязательны на `gift_additional` (`ck_mission_pool_allocations_gift_cutoffs`,
   `0071:476–480`), потому что подарок читал пул в момент UNLOCKED. В v2 пул
   читается **только** при READY, поэтому: (а) в момент открытия ступени
   чтения пула нет вовсе; (б) обе колонки становятся обязательны на **всех**
   allocation-строках (все они теперь резервирования) — рекомендуется сделать
   их `NOT NULL` и удалить условный CHECK. Правило воспроизводимости
   (tz:113–118) сохраняется дословно, якорь — READY-receipt.
6. **UNLOCKED.** Наступает при открытии **верхней** ступени
   (`step_index = N`, что тождественно `progress ≥ token_goal` — тот же
   предикат `crossed` из `app/mission_contribution_service.py:272`) **либо**
   по `unlock-cutoff` (`:376–416`). Дальше обе ветки одинаковы
   (`VISION.md:112–114`). Split вклада на верхнем пороге
   (`app/mission_contracts.py:314–332`) и активация следующего READY в той же
   транзакции (`app/mission_lifecycle_service.py:257–287`) — без изменений.
7. **Финальная передача = сумма достигнутых ступеней.**
   `gift = guaranteed_cents + Σ mission_gift_steps.amount_cents` —
   SUM по committed-строкам под lock'ом, **не** снимок пула. Именно это число
   фиксируется в UNLOCKED-receipt и именно его обязан покрыть fulfillment
   (правило полного покрытия v8, tz:160–163 — неизменно). Копирайт на
   UNLOCKED — «Приют получает €N» (реш. №18, `registry:154–158`), совершённое
   «передано» — только с отчётом (инвариант `registry:18`).
8. **Неоткрытые ступени возвращаются в pool** (`VISION.md:134–135`,
   `:390–391`). В v8 недоданная часть просто никогда не покидала пул; в v2
   она ушла при READY, поэтому UNLOCKED обязан её **вернуть**. Минимальная
   форма без изменения схемы allocations (там CHECK `amount_cents > 0`,
   `0071:474` — отрицательных строк не бывает): в той же транзакции UNLOCKED
   пишутся **компенсирующие строки в `mission_pool_ledger`**, по одной на
   каждый source-бакет возвращаемых резервов, с `idempotency_key =
   release:{case}:{version}:{source}` и перечнем step_index в `meta`.
   Инвариант `sum(allocations) ≤ sum(settled ledger)` сохраняется (ledger
   растёт, allocations нет). Открытый вопрос по `source` возврата — §5 п. 4.
9. **Идемпотентность.** Реплей вклада (`mc:{run_id}`) возвращает committed
   байты contribution-receipt'а — механизм v8 неизменен. Повторное открытие
   той же ступени невозможно by construction (PK), а не «проверяется».

---

## §4. Миграционные ноты

### 4.1. Нумерация — реестровая заметка устарела

`play-for-good-surfaces-registry-v1.md:331–333` утверждает, что
mission-ядро в master не влито, голова `0080`, и требует перенумеровать
`0071/0072` в `0081+`. **Это устарело.** Проверено:

- `origin/master` = `33d147a`; содержит `migrations/versions/0071_mission_slice_core.py`,
  `0072_mission_ops_receipts.py`, `0073_platform_release_receipts.py`, все восемь
  `app/mission_*.py`, `deploy/mission-architecture-policy.v1.json`,
  `scripts/mission-architecture-guard.py` и пять `tests/test_mission_*`.
- Диф ветки `sharp-rubin-fa638f` против `origin/master` по этим путям — **пуст**.
- Голова Alembic на `origin/master`: `revision = "0086_playable_rework_attention"`,
  `down_revision = "0085_development_intake_cancel"`.

**Вывод:** перенумеровывать 0071–0073 не нужно. Дельта — **новая forward-миграция
`0087_mission_gift_ladder`** с `down_revision = "0086_playable_rework_attention"`.

**Отдельная коллизия, не относящаяся к дельте:** `0074_append_only_truncate_guard.py`
существует **только** в worktree (`revision = 0074_append_only_truncate_guard`,
`down_revision = 0073_platform_release_receipts`) и делит `down_revision` с
master'ским `0074_feed_playable_release_scope` → при мерже графа Alembic
получаются **две головы**. Это не mission-миграция (TRUNCATE-триггеры на ~40
журналов feed/island/mission, список — `0074_append_only_truncate_guard.py:150–188`);
её надо перебазировать отдельным тикетом, а миграцию лестницы зачейнить после неё.

### 4.2. Что затрагивает миграция лестницы

1. **`mission_funding_policies`** — SQL-функция `mission_funding_policy_document_ok`
   (`0071:72–112`) `CREATE OR REPLACE` с диспетчеризацией по `document->>'schema'`:
   ветка v1 сохраняется (иначе миграция упадёт на уже существующих строках, а
   удалить их append-only не позволяет), ветка v2 — новый закрытый набор ключей.
   CHECK `ck_mission_funding_policies_document` (`0071:224–228`) остаётся по имени.
2. **`mission_case_contracts`** — DROP+CREATE `ck_mission_case_contracts_document`
   с v2-веткой (без `unlockShare`, с `giftLadder`); **новая колонка**
   `ladder_total_cents` BIGINT NOT NULL; DROP `ck_mission_case_contracts_guaranteed_bound`
   (`0071:318–321`) → CREATE `ck_mission_case_contracts_ladder_bound`
   (`ladder_total_cents <= confirmed_need_cents + stretch_cap_cents`);
   колонко-документные равенства `guaranteedCents`/`tokenGoal`/`ladderTotalCents`
   по паттерну `0071:153–164`.
3. **`mission_pool_allocations`** — `ck_mission_pool_allocations_kind`
   (`0071:470–473`) и `ALLOCATION_KINDS` (`app/mission_models.py:64`):
   `gift_additional` → `reserve_step`. **DROP** `ck_mission_pool_allocations_gift_receipt`
   (`0071:490–502` + зеркало `app/mission_models.py:391–403`). Новые колонки
   `step_index` INT NULL, `threshold_tokens` BIGINT NULL с CHECK'ом привязки к
   `kind='reserve_step'`. `pool_cursor`/`alloc_cutoff` → NOT NULL, условный
   `ck_mission_pool_allocations_gift_cutoffs` (`0071:476–480`) удаляется.
4. **NEW `mission_gift_steps`** (§2.4) + append-only триггер + запись в
   `APPEND_ONLY_TABLES` (`0071:185–197`) и в TRUNCATE-guard.
5. **`mission_pool_ledger.source`** CHECK (`0071:428–431`) и `POOL_SOURCES`
   (`app/mission_models.py:62–66`) — трогаются **только** если принимается
   отдельный source возврата (§5 п. 4).
6. **`mission_intervention_receipts`** (`0072:53–56`) и `OPS_COMMANDS` — **не
   трогаются** (§1 п. 10).

**Тройное дублирование каждого правила** — SQL-функция в миграции ↔ строка
`CheckConstraint` в `app/mission_models.py` ↔ императивный валидатор в
`app/mission_contracts.py`. Все три обязаны меняться одним коммитом, иначе
ORM-метаданные разъедутся с БД. Явный пример: gift-receipt CHECK живёт дословно
в `0071:490–502` **и** `app/mission_models.py:391–403`.

**Типизированных моделей нет.** Во всех `app/mission_*.py` ноль
`dataclass/TypedDict/BaseModel` — документы и receipt'ы строятся inline-словарями.
Расширять нечего: «схема» существует только в трёх местах выше.

### 4.3. Данных в проде нет → замена схемы политики законна без data-migration

Обоснование, но **как проверяемое условие, а не как допущение**: миграции
0071/0072 лежат на master, значит с высокой вероятностью **применены** к
проду и таблицы физически существуют. При этом контур ни разу не включался:
`enable_mission_core/_read/_ops` = `False` по умолчанию
(`app/config.py:305–307`), `ENABLE_MISSION_CORE` дополнительно требует
непустой `MISSION_DOGFOOD_USER_IDS` (`app/config.py:757–758`), а вне флагов
нет ни одного writer'а.

**Preflight слайса (обязателен перед миграцией):** `SELECT count(*)` по
`mission_funding_policies`, `mission_contribution_weights`,
`mission_case_contracts`, `mission_case_bindings`, `mission_case_events`,
`mission_pool_ledger`, `mission_pool_allocations`, `mission_contributions`,
`mission_fulfillments` на проде.
- Все нули ⇒ замена схемы политики/контракта легитимна, data-migration нет.
- Ненулевой счётчик где-либо ⇒ **стоп**. Таблицы append-only с
  mutation-refusing триггером (`0071:658–669`) и TRUNCATE-guard'ом — v1-строку
  нельзя ни отредактировать, ни удалить; тогда дельта обязана стать
  «v2 рядом с v1», а не заменой, и старые receipt'ы обязаны остаться
  byte-identical replayable.

### 4.4. Чек-лист сопровождения

- `deploy/mission-architecture-policy.v1.json` + `scripts/mission-architecture-guard.py`
  пинят `allowedMissionImporters` и per-file sha256/lines для integration-поверхностей
  (`app/api_daily.py`, `app/api_results.py`, `app/api_session.py`, `app/config.py`,
  `app/main.py`, `app/models.py`, `migrations/env.py`), enforce —
  `tests/test_mission_architecture_guard.py`. Дельта живёт целиком внутри
  `app/mission_*` + миграция, поэтому baseline **не должен** меняться; если
  изменился — это сигнал, что дельта вылезла за границу.
- Тесты к расширению: `tests/test_mission_core.py`, `tests/test_mission_api.py`,
  `tests/test_mission_e2e_postgres.py`, `tests/test_mission_migration_postgres.py`.
- Обязательные новые PG-тесты (в дополнение к списку tz:276–299): резервирование
  всей лестницы при READY и отказ при нехватке пула; открытие ступени ровно один
  раз (PK-конфликт при повторе); мульти-открытие одним вкладом; отсутствие любых
  записей при частичном прогрессе; UNLOCKED = Σ открытых + гарантия; возврат
  неоткрытых ступеней в pool с сохранением pool-инварианта; fulfillment,
  покрывающий гарантию + N ступеней (частичное покрытие → отказ); up/down
  миграции; негативный тест v1-документа против v2-контракта.
- Down-migration обязана восстанавливать v1-CHECK'и и следовать дисциплине
  `0071:676–696` (downgrade отказывает при наличии evidence).

---

## §5. Открытые вопросы к ревью

1. **Где живёт массив ступеней** — в документе контракта (рекомендация §2.0,
   соответствует `VISION.md:117–124`) или в документе политики (буквальное
   чтение заголовка задачи). Второй вариант требует политики на каждый кейс и
   ломает модель разделяемого денежного правила.
2. **Правило cutoff.** `unlock_cutoff_at` — nullable-колонка контракта, и
   **шедулера нет**: UNLOCKED-по-cutoff сегодня возможен только ручной
   CLI-командой `unlock-cutoff` (`app/mission_contribution_service.py:376–416`).
   VISION называет cutoff «опубликованным» (`:113`, `:121–122`), а темп сезона
   — публичным параметром (`:140–141`). Если cutoff показывается игроку, он
   обязан исполняться — иначе это trust-проблема. Вопрос: v0 остаётся ручным
   (рекомендация — лестница автоматизации не требует), или дельта заводит
   server-owned шедулер (новый контур со своим fencing/lease, прецедент —
   advisory-lock бот-шедулера)?
3. **№34 против №38 и глагол в wire.** Реш. №34 (`registry:206–209`) задавало
   строку «уже **открыто** €60 · впереди €100 и €300»; реш. №38
   (`registry:226–228`) заменило её на «уже **собрано** €60» без перечня —
   как более позднее, №38 действует. Но три словаря разошлись: «открыто»
   (№34), «собрано» (№38), `reservedAndOpenedCents` (`app/mission_api.py:185`).
   Нужен **один** зафиксированный wire-термин: имя поля переживёт макет.
   Смежно: реш. №18 требует «Приют **получает** €N» на UNLOCKED, а «передано»
   — только с отчётом; API обязан отдавать открытую сумму и переданную сумму
   **разными** полями (сейчас так и есть: `reservedAndOpenedCents` vs
   `deliveredCents`, `:185–186`) — но именование не должно позволять клиенту
   отрисовать «передано» из первого.
4. **Rollover неоткрытых ступеней.** Возврат в pool отдельными ledger-строками
   (§3 п. 8) — с каким `source`? Вариант А: **исходный** source каждого
   бакета (partner-деньги возвращаются как `partner` и остаются недоступны
   seed-only кейсу) — честнее по учёту, требует до N строк на кейс. Вариант Б:
   новый source `rollover_return` — требует правки CHECK `0071:428–431`,
   `POOL_SOURCES` (`app/mission_models.py:62–66`) и enum'а
   `eligiblePool.sources` в политике. Рекомендация — А (сохранение источника),
   но решение денежное и за оператором.
5. **Мульти-открытие одним вкладом.** Разрешено ли одному вкладу открыть
   несколько ступеней (реалистично при коллекционных наградах, §1 п. 12)?
   Если да — блок `mission_contribution` в ответе `/api/results` (tz:216–238)
   несёт **массив** открытых ступеней, а не одну; и церемония (реш. №2/№16 —
   одна верхняя плашка ~2 с, без модалок) обязана определить поведение при
   двойном открытии.
6. **Знаменатель бара.** Дельта предлагает `token_goal = верхняя ступень`
   (§2.2), чтобы вся goal-механика v8 выжила без изменений. Но реш. №5
   («мотивация после каждой ступени сохраняется следующей») и реш. №4
   подразумевают бар до **следующей** ступени. Это выбор рендера над одним и
   тем же абсолютным прогрессом, но read API тогда обязан отдавать
   `nextStepThreshold` рядом с `tokenGoal`. **Самый UX-нагруженный вопрос
   дельты** — что именно является знаменателем бара на HUD и на экране кейса.
7. **Ревалидация весов и шаг лестницы.** `assert_goal_fits_weights`
   (`app/mission_service.py:343–360`) сейчас требует `token_goal ≥` крупнейшего
   одиночного вклада. Нужно ли аналогичное требование к **зазору между
   ступенями** (иначе один вклад проскакивает несколько порогов)? Решается
   вместе с п. 5; жёсткое требование не рекомендуется.
8. **Минимальная форма лестницы.** Допустима ли лестница из одной ступени
   (только гарантия — кейс без игровой открываемой части)? Нулевая гарантия
   сегодня допустима (`app/mission_lifecycle_service.py:189–191`: при
   `guaranteed_cents = 0` строка не пишется вовсе), но `amountCents > 0`
   у ступени это запрещает. Нужна явная граница.


## Дополнение 25.08 (операторские решения показа №11)

- Словарь: «уже **собрано** €N» — принято; wire-поле именуется от «собрано»
  (вопрос §5 о «открыто/собрано» закрыт).
- Знаменатель бара: **порог ближайшей ступени** — принято; read-API
  добавляет `nextStepThreshold` (вопрос §5 о знаменателе закрыт).
