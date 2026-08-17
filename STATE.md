# STATE.md — текущий контрольный экран

Обновлено: 17.08.2026 (поздний вечер). За день: критический путь #114/#121
закрыт, Labs unlocked, #107 реализован и выкачен до операционных гейтов,
owners-available контур задеплоен с live-миграцией 0082. Это не ledger;
читать первым, обновлять последним; предел — 150 строк.

## Владение и транспорт

- Mac A owner: Claude Fable сессия по письменному операторскому handoff
  17.08.2026; Codex Mac A owner-сессия PARKED. Binding mac-a `f2c0e31a…`
  не менялся; автоматики PAUSED; heartbeat `p4g` — read-only relay.
- Очередь #94 пуста; все wake 17.08 терминальны. Транспорт переведён на
  **v2 с causal lineage**: первый полный круг доказан на живом тикете —
  dispatch `5317765274` (v2, `lin_346ec3d6…`) → Mac B scanner прочёл →
  receipt `5317906443` (v2, та же линия, predecessor сохранён).

## #107 — implementation merged; rollout до операционных гейтов

- Ядро merged: meta PR #130 → master `0050a803…` (lineage v2, capability
  profile, cadence; Tier-2: discovery STOP → одна коррекция → delta PASS
  P1/P2=0). V2-writer merged: PR #131 → `6850a19…` (Tier-1 PASS). Приёмка
  переносимая: v1-байты заморожены голденами; noop только для STOP при
  явной supersession строго более ранним wake той же линии.
- Rollout: шаги 1–6 DONE; dual-reader подтверждён на обеих машинах.
  Остаток — операционный, за одной командой оператора «возобнови
  heartbeat»: cadence adoption (2/15 мин) + включение
  `ENABLE_OWNER_AVAILABILITY_NOTIFICATIONS` + первый живой busy→idle с
  ровно одним сообщением. Capability profile: inline-ревьюеру нужна
  стабильная runner-identity (наблюдение Mac B) — в adoption-пакет.
- Receipts: старт `5316754362`, merge `5317438984`, live-rollout
  `5319617693`; операторские решения: получатель = чат READY-карточек
  (`5316947791`), GO на backend-пакет (`5317393190`).

## Owners-available контур — LIVE (выключен)

- `Glera/swipe-backend#73` merged после Tier-2 PASS (P1/P2=0): master
  `d34bc1b8…`; publish `32059348353` (image `sha256:bd902d4c…`, manifest
  `120daa77…`, алгебра LKG-forward `[0080,0081,0082]` доказана офлайн);
  операторское подтверждение → один cutover `32063356466` PASS:
  **live deploy `dep-da1mgdjm8hqs73be8ksg`**, live-миграция `0081→0082`
  применена (DB-verify `job-da1mgqegekts738bpv80`), health 200.
- Rollback boundary: LKG-пин = прежний live-образ `sha256:fd7c3bf5…`,
  доказан CI против схемы 0082; откат миграции — отдельный акт (не
  понадобился). Флаг OFF: роут не существует до включения.

## Терминальные результаты дня (кратко)

- #114/#121 TERMINAL (подробности: receipts `5316412961`, `5314176665`).
  Short Drama recovery PARKED (маршрут в `5316412961`).
- Решения оператора reconciled: Smash PUBLISHED; Klondike successor
  `8426a388…` — оператор принял в 11:46, **LIVE** (полный цикл
  «замечание→LIVE» ≈ 5 минут); Pins LIVE с 13.08.
- #119 — **уже в проде с 14.08**: PR #40 предок live-фида, деплой не
  нужен; инженерный smoke на живом бандле PASS (receipt `5316621465`).
  Остаток — casual визуальная проверка оператора, не блокирует.
- Labs UNLOCKED (`#122` comment `5316419272`): S2a admitted; Mac B довёл
  S2a до публикации (exact head `2e936bc…` → push + draft PR + native CI
  + correction-only delta). S1 — за пересборкой phone-source контура.
- Runtime: Generator live `61678b5b…` (координатор здоров); backend live
  `dep-da1mgdjm8hqs73be8ksg`, image `bd902d4c…`, **DB 0082**.
- Гранты Lab: flags до 16.09; `catalog:recall` истекает **~20.08**,
  `feed-sequencing` ~30.08, `catalog:read`/`analytics:read` истекли —
  батч переподтверждения картами Lab при удобном случае.
- #120 NEEDS_HELP / #117 frozen fixture — без изменений.

## Ближайшая очередь

| # | Работа | Владелец | Состояние |
| --- | --- | --- | --- |
| 1 | «Возобнови heartbeat» → cadence adoption + включение owners-available + первый живой busy→idle сигнал | оператор (команда) → Mac A | ждёт команды |
| 2 | Батч грантов Lab (recall до ~20.08) + наигрыш #91/#92 + casual-проверка #119 | оператор | when convenient |
| 3 | Labs S2a: push `2e936bc…` → draft PR → CI → delta review | Mac B | in progress |
| 4 | #108 Telegram platform intake (контракт из #105 rescue → vertical) | Mac A | next |
| 5 | PR #118 selective promotion: reconciliation контракта (+вход: accept уже публикует общие байты — diff по audience/roster-оси) | Mac A | после #108 |
| 6 | Platform-половина #109 (после Labs S2a) | Mac A | queued |
| 7 | Bounded polish batch: P3×3 (#130 discovery) + P3×5 (Tier-1 #131) + P3×2 (#73) + readiness-budget hardening (сессия оператора) + флейки/maxBuffer/path-space/sibling-пины | Mac A/B по путям | одна партия |

## Действующие процессные решения 13.08

- GO — только с названной категорией ядра; standing authority покрывает
  read-only evidence, bounded correction, PR/CI/merge, один reversible
  deploy/restart, одну заранее описанную recovery.
- Один review-раунд: discovery → все P1/P2 разом → один узкий delta;
  P3 — в bounded polish batch.
- Tier 0/1 review и обычные receipts — в Issue/PR/task output.
- До 10–20 two-Mac тикетов не строить merge queue, lock, quota optimizer,
  task store или новый dispatcher.
- Worktree cleanup — еженедельно после raw census; в census 17.08 вошли
  новые: meta-107, swipe-generator-baseline/preview44/preview45,
  swipe-backend-issue121-n001, swipe-backend-owners-available.

## Parked / не запускать сейчас

- S8 ad-матрица — до UA-плана; Short Drama recovery — вместе с ней.
- S9 mobile review — после Labs gate; старые R7 NO-GO драфты не мержить.
- #81 Family A publication — до founder taste и Labs gate.
- Новая инфраструктура dev-dispatch, credentials, settings, permissions,
  runner, DB/table или альтернативный successor-протокол — вне scope.
