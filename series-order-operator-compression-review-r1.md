# Series Order operator compression — independent review R1

- Reviewer: Claude (независимая сессия; author ≠ reviewer).
- Scope reviewed: `swipe-generator` branch `codex/series-order-operator-compression`,
  commits `116b86b..0800583` (диапазон `cd3f4ac..0800583`, 13 файлов,
  +2160/−51); backend docs worktree `codex/series-order-docs`, commits
  `1bcb0f4`, `b8c9d90`.
- Method: полное чтение диффа и `series-order-delegation.mjs`; трассировка всех
  14 заявленных authority boundaries по коду (`delegate`/`drive`/
  `delegatedAction`/`operatorPacket`/store); прогон профильных сьютов;
  собственные исполняемые репро.

## Verification observed

- Профильные сьюты воспроизведены: `series-order-delegation` +
  `series-order-service` + `series-order-http` + `lab-ui-series-orders` =
  **43 passed / 0 failed** — совпадает с пакетом.
- Репро-файл ревью (untracked, не коммитить):
  `swipe-generator/test/series-order-compression-review-r1-repro.test.mjs`.
  Ассерты в нём записаны как **должно быть по спеке**: A/B/C падают (красные =
  подтверждённые findings), D зелёный (документирует текущий brick-сценарий).

## Authority boundaries — подтверждено

Проверены по коду все 14 пунктов пакета; держатся: draft-order без initial
approval не получает delegation target (`lastEventId === null` до первого
approve-события); provider-free гейт (`modelPlan === null` +
`maxInvocations === 0`) закрывает model-assisted заказы от `delegate`;
`delegatedAction` останавливается на любых approval kinds кроме
`campaign`/`qa_repair`; `selection_repair` и `taste_replacement` остаются
человеческими (kind `qa_repair` со stage `selection_repair` не делегируется);
в делегированных путях нет publish/recall/roster/Telegram вызовов; policy
rotation ставит драйвер на паузу; replay-идентичность claim/effect/release не
включает `createdAt`; crash-recovery материализации переиспользует durable
claim; параллельный tick сериализуется; effect ищет claim строго по
`beforeEventId + mutationId`; release только с frozen reason, committed effect
не release-ится; repair-limit даёт `action_required`; UI сверяет байты create-
эха и пересчитанный orderHash до auto-approve (forged-response тест есть).

## Findings

### F1 — P1: не-approval остановки драйвера навсегда прячутся под `working`

Спека (b8c9d90, §13.2) обещает: «Driver … не остаётся в бесконечном
`working`»; DoD §13.4: «packet никогда не скрывает человеческий blocker под
состоянием `working`». Реализация выполняет это только для остановок, у
которых есть `approvalTarget` (repair/campaign limit на approve-стадии).
`operatorPacket` не смотрит на `delegatedNext.stop`/статус драйвера: если стоп
случился на чистой advance-стадии, packet остаётся
`{state: "working", headline: "Система выполняет технические шаги", actions: []}`
навсегда, со спиннером и подписью «можно закрыть Lab».

Исполняемые репро (оба красные):

- **REPRO A**: `maxAutomaticTransitions` исчерпан на advance-стадии
  (`driver.reason = 'delegation_transition_limit'`, `approvalTarget = null`,
  ноль pending jobs — заказ гарантированно мёртв) → packet `working`.
  Прямое нарушение фразы спеки про bounded limit.
- **REPRO B**: ротация policy (заявленная граница №7) → драйвер честно
  `paused: delegation_policy_stale`, но packet `working` с пустыми actions.
  Оператор никогда не узнаёт, что нужна ре-делегация.

Тот же класс без отдельного репро: любое исключение `invokeDelegatedAction`
вне четырёх whitelisted `waiting`-кодов пробрасывается в tick, глотается
`console.error` в `server.mjs` и повторяется каждые 5 секунд — packet всё так
же `working`. Статус драйвера вообще не доступен по HTTP (роут `drive`
отсутствует), т.е. packet — единственное окно оператора.

Минимальный фикс: в `operatorPacket` использовать `delegatedNext.stop` (и/или
durable последний driver-статус): stop без packet-action ⇒ `action_required`
или `blocked` с typed headline и действием (ре-делегация / решение о лимите);
тест на оба репро.

### F2 — P2: жизненный цикл claim не замкнут относительно release

Механизм release (`5898a8d`) — заголовочная фича ветки, но:

- **REPRO C (красный)**: released claim при возврате evidence к прежнему
  переходу на том же head «replayed»-ится обратно (`claimEffect` ищет
  `priorByMutation` по всем claims, включая released) и затем `recordEffect`
  спокойно привязывает committed effect к claim, у которого уже есть
  append-only release-запись. Инвариант release ⊻ effect нигде не
  энфорсится — аудиторская цепочка "этот intent отменён" ломается.
- **REPRO D (зелёный, документирует)**: `mutationId` драйвера детерминирован
  от `delegationDigest + head + action + effectClass` — **units не входят**.
  Successor-claim после release с тем же классом, но другим числом
  replacement-слотов получает тот же `mutationId` и навсегда упирается в
  `series_order_delegation_conflict` — драйвер-цикл кирпичится (и, по F1,
  молча). Сегодня это недостижимо только потому, что terminal QA-результаты
  неизменяемы при неизменном head — далёкий инвариант, локально не
  проверяемый.

Фикс в одном месте: включить `units` (или порядковый номер release на head) в
derivation `mutationId` и заставить `claimEffect`/`recordEffect` отвергать
claims, имеющие release-запись.

### F3 — P3: one-click может создать дубликат заказа

`submitCreate` вызывает `clearMutation(mutationKey)` сразу после create, до
approve/delegate. Транзиентная ошибка на approve → повторный клик генерирует
новый `mutationId` → второй identичный immutable заказ (и при повторном
успехе — вторая делегированная генерация). Чистить create-ключ следует после
завершения всей цепочки.

### F4 — P3: starvation при >4 делегированных заказах

`driveDelegated` берёт `slice(0, maxOrders)` от стабильно отсортированного
списка: пятый активный делегированный заказ не обслуживается, пока один из
первых четырёх не станет terminal. Нужна ротация/курсор.

### F5 — P3-реестр (без блокировки)

1. `committedEventForClaim` для materialize фоллбэком матчит
   `materialization_started` только по `expectedEventId`: ручная
   материализация из expert-режима, гонящаяся с pending delegated claim на том
   же head, будет атрибутирована делегации (audit fidelity + расход бюджета;
   authority не расширяется).
2. `loadSeriesOrderDelegationPolicy` возвращает shallow-frozen объект —
   `policy.limits` мутируем в рантайме (профильный тест сам этим пользуется).
3. Packet-action `exact_approval` при repair-limit ведёт по URL на ту же
   страницу заказа, где единственная рабочая кнопка спрятана в expert
   `<details>`; headline `blocked`-статуса может быть сырым machine-кодом
   (`String(actions.blocker)`).

## Decision R1

**NO-GO в текущем виде.** Authority-границы (все 14) держатся — вкус, фабрики,
selection и Telegram не утекли в делегацию; но F1 ломает центральный DoD самой
инициативы («никогда не бесконечный working») с двумя исполняемыми репро, а
F2 оставляет незамкнутым свежедобавленный release-механизм. После фикса
F1 + F2 (и дисп. F3/F4 по вкусу) — GO без повторного полного ревью: достаточно
зелёных версий REPRO A/B/C и красного→зелёного нового поведения D.

---

# R2 re-review — generator `b36bd7d`, docs `eed7633`

Scope: узкий, по запросу fix-раунда — перепроверка F1–F5, повторный прогон
репро и профиля, дифф `0800583..b36bd7d` целиком (6 файлов, +232/−29),
docs-коммит `eed7633`.

## Проверено

- **R1 repro: 4/4 зелёные** (A/B/C — spec-desired поведение достигнуто;
  D корректно продолжает документировать store-конфликт при одинаковом
  явном `mutationId` — из драйвера он теперь недостижим).
- **Канонический профиль: 46/46** (+ 4 репро = заявленные 50/50).
- **`npm run check`: чисто.**
- **F1 закрыт**: `operatorPacket` проецирует любой driver stop/issue без
  других actions в `action_required` + одно `expert_resolution` действие
  (typed labels для policy-stale/лимитов), state-ветка `blocked` с typed
  headline; driver-error запоминается per-head (`delegatedDriverIssues`) и
  сбрасывается по новому событию. Канонические тесты: transition-limit
  (ровно мой REPRO A, включая `jobs.length === 0`) и driver-error после
  synthetic materialization crash. UI автора скрывает expert `<details>`
  открытым при `expert_resolution` и ведёт якорем `#series-order-expert`.
- **F2 закрыт**: `recordEffect` отвергает released claim
  (`released delegated claim cannot accept a committed effect`, store-тест
  в каноне); `seriesOrderDelegatedMutationId` включает
  `action + effectClass + units` (unit-тест на различие/стабильность).
- **F3 закрыт**: create-mutation ключ живёт до конца всей цепочки
  (`createCommitted`, очистка после delegate); browser-тест с transient 503
  на approve доказывает `create → approve(fail) → create(replay, тот же
  mutationId) → delegate` без дубля. Ре-echo replayed заказа fail-closed:
  non-order approvalTarget на retry останавливает цепочку, не авто-аппрувит.
- **F4 закрыт**: round-robin курсор в `driveDelegated`; тест с пятью
  делегированными заказами доказывает выбор пятого на втором tick.
- **F5.1 закрыт**: `materialization_started` теперь несёт
  `command.mutationId`; `committedEventForClaim` матчит только exact claim
  mutation (ручная same-head материализация больше не атрибутируется
  делегации); recovery-цепочка started→all_drafts_committed сохранена;
  тест на exact attribution есть.
- **F5.2/F5.3**: отложены с явной диспозицией в пакете — принято,
  non-blocking.
- **Docs `eed7633`** приводит спеку в соответствие: release ⊻ effect в обе
  стороны, mutation identity с units, требование round-robin, обобщённое
  «никогда не вечный working» на rotation/driver-error, kind
  `expert_resolution`, retention create-mutation. Расхождений
  спека↔код не осталось.

## Реестр R2 (non-blocking)

1. `claimEffect` по-прежнему отдаёт released claim как `replayed`: в
   double-flip edge (evidence A→B→A с идентичной identity на одном head)
   invoke исполнится, событие закоммитится, и только `recordEffect` упадёт
   конфликтом — один переход останется без effect-receipt (не считается в
   лимиты), драйвер громко встанет `expert_resolution` и самовосстановится
   со следующего head. Рекомендация: отказывать released claims уже в
   `claimEffect`, чтобы fail случался до invoke.
2. Policy-stale surfacing покрыт только untracked REPRO B — рекомендую
   принять REPRO A/B/C в канонический сьют при merge (файл
   `test/series-order-compression-review-r1-repro.test.mjs` готов, D можно
   оставить как документацию store-инварианта).
3. `delegatedDriverIssues` — in-process память: после рестарта packet
   вернётся к `working` до первого 5-секундного tick, который переустановит
   issue. Приемлемо, фиксирую для полноты.

## Decision R2

**GO.** Все P1/P2 закрыты точечно и с каноническими регрессиями,
authority-поверхность не расширена (ни одного нового вызова
publish/recall/roster/Telegram в диффе), спека синхронизирована. Merge,
перезапуск Lab и живой полный прогон до Telegram publication разблокированы;
реестровые пункты выше — по вкусу, не блокируют.
