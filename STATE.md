# STATE.md — текущий контрольный экран

Обновлено: 17.08.2026 после owner-handoff Mac A → Fable-сессия и публикации
объединённого Mac B handoff. Это не ledger: история — в git, GitHub Issue/PR
и canonical receipts. Читать первым, обновлять последним; предел — 150 строк.

## Владение и транспорт 17.08

- Mac A owner: Claude Fable сессия по письменному операторскому handoff
  17.08.2026; Codex Mac A owner-сессия PARKED и параллельно не работает.
  Машинный binding mac-a `f2c0e31a…` не менялся и не пере-бутстрапился;
  существующие автоматики остаются PAUSED; heartbeat `p4g` — только
  read-only relay. Mac B — Content/Labs, владение без изменений.
- Очередь #94: четыре mac-a wake (`5302199801`, `5302298913`, `5302458429`,
  `5303139845`) консьюмлены FIFO одним receipt. Объединённый ordered handoff
  Mac B опубликован: comment `5313116448`, wake `wake_94dc5b63…`, target
  `be9b2496…`. Три work item: (1) публикация #114 V16 correction
  `1d93128f…`; (2) публикация #121 desktop adapter `991f0e3c…`; (3) один
  narrow author-blind delta review `Glera/swipe-backend#72`. Merge обоих
  Generator-пакетов гейтится per-head neutrality attribution: F_base(B) на
  чистом master по именам падений, 0 cancelled, green exact-head CI.
  **Ожидает запуска Mac B owner-сессии оператором.**

## Немедленный priority override

- Issue #114 — V16 correction package готов на Mac B (delta review PASS,
  P1/P2=0); публикация и merge авторизованы wake `5313116448` item 1. После
  merge: Mac A runtime adoption и отдельная CAS-gated recovery Short Drama
  (`creatives-main`). Klondike `206f3cfc…` и Smash `190bf352…` остаются
  `READY_FOR_APPROVAL` с подтверждёнными notifications (`99`/`100`), ждут
  физического surface PASS оператора.
- Issue #121 — backend PR #72 исправлен по N001 bounded-коррекцией Mac A:
  exact head `1a8ce9ec…`, tree `63ee4b27…`; delta 5,958 B
  `6464ad90…`; image CI `32004594148` и PostgreSQL `32004594232` SUCCESS
  (32/32 check-runs). Draft до Mac B narrow delta signature (item 3), затем
  merge Mac A + один ordinary reversible deploy (миграций в PR нет).
  Mac A device auth остаётся expired-without-binding (`5298508772`):
  отдельный operator-present акт в TMA (10-мин окно), батчить с наигрышем.
- Live Generator: LaunchAgent PID `21325` на exact `e49be26b…` намеренно НЕ
  обновляется до merges — отставание от master только Labs-навигацией
  (PR #43); restart ради UI-лага не оправдан (оператор 17.08).
- Generator baseline (background control, не доказательство neutrality):
  полный `npm run verify` чистого master `33306906…` на Mac A =
  845 pass / 7 fail / 3 skip, все 7 environment-only; классы и CI-исключение
  зафиксированы в wake `5313116448`. Neutrality пакетов — только same-env
  прогонами на самих опубликованных heads (item 4 handoff).
- Issue #120 — NEEDS_HELP / terminal sequence mismatch: без изменений;
  receipt `5294292655`; physical PASS не inferred, retry/successor/rollback
  не запускать.
- Issue #119 — Feed PR #40 merged `acc68d89…`, master CI SUCCESS; deploy
  отложен текущим portfolio override.
- Issue #117 — FAILED_DEV_DOGFOOD / frozen fixture: receipts и bugs
  сохранены; новый old-path correction cycle не запускать.

## Приоритет: phone-first, затем одна bounded polish batch

Новые Labs-инициативы не начинать до green gate. Сначала полный телефонный
путь, наигрыш готовых кандидатов, одна общая партия замечаний.

| # | Инициатива | Состояние | Следующий результат | Оценка |
| --- | --- | --- | --- | --- |
| 0 | Phone mechanic recovery: `orthogonal-link-v1`, `pins-l5`, `smash-fest-v1` | **READY_FOR_APPROVAL / NOTIFICATION NEEDS_HELP**. Pins release `6fa778a6…` candidate `50723642…` hosted; READY receipt `outcome_unknown` (`operator_flags_lab_response_invalid`); без retry. Klondike/Smash READY (см. #114 выше); Short Drama — после V16 adoption | сыграть hosted Pins/Klondike/Smash кандидаты; notification recovery диагностировать отдельно; product accept — оператор | play `10–15m`; recovery TBD |
| 1 | Platform ticket #99 — screenshot UX | **DELIVERED LIVE** | телефонный smoke; findings — в общую batch | `10–15m` operator |
| 2 | Issue #98 — capability successor | **DONE / PASS** | наигрыш положительный; warning/status после rework — UX finding | закрыто |
| 3 | Issues #91/#92 — Candidate Decision Loop + Arrows Wave 1 | **READY_TO_PLAY**; #92 — 3/3 кандидата | сыграть, собрать taste/UX notes; затем одна bounded polish batch | play `1–2h`; polish `0.5–1d` |
| 4 | Issue #88 — bottom control/back navigation | ждёт terminal Fast Lane condition | exact CAS → merge → один feed-only deploy → smoke | `1–2h` после снятия |
| 5 | Issues #82/#81 hygiene | #82 выполнен; #81 = 3/3 library_ready | #81 parked до Labs gate | `0.5–1h` |

## Production checkpoint

- Live backend deploy `dep-d9vlnh3l550s73920680`, image `sha256:d39a31d4…`,
  manifest `0edeb800…`; DB authority `0081_playable_feedback_queue`; live
  Generator exact `e49be26b…` (см. override выше).
- Issue #98 canonical outcome: meta #98 comment `5272895976`; terminal
  pointer #94 comment `5272897481`. Blocked root byte-stable; successor
  `4fe07219…` создан один раз; система forward-only, downgrade запрещён.
- Product accept/reject, publication, activation, mapping, catalog и roster
  не выводятся из инженерного smoke.

## Labs gate

Открывается, когда одновременно: (1) #98 terminal clean smoke сохранён;
(2) platform и mechanic requests проходят с телефона до честного terminal
состояния без ручного переноса prompt/ID/SHA; (3) #91/#92 сыграны и одна
общая bounded polish batch закрыта; (4) exact-head CI зелёный, открытых
P1/P2 и незавершённого deploy/migration окна нет.
**Точка разблокировки Labs на Mac B (оператор 17.08)** — все четыре:
(1) пакеты #114 `1d93128f…` и #121 `991f0e3c…` опубликованы и terminal
(merged либо terminal STOP), local-only heads на Mac B не осталось;
(2) Generator master чистый/актуальный; (3) `Glera/swipe-backend#72` —
narrow Tier-2 verdict + terminal merge/disposition; (4) durable receipt
Mac A в `#122`, что #114/#121 больше не блокируют Labs admission.
После receipt — **сразу S2/S2a** (lineage presenter, статусы, комнаты):
phone-source для S2a не требуется. S1 — только после принятого cross-repo
phone-source контура `/api/admin/mobile-reviews`; S3 — после S1 и
телефонного proof; 5а/5б/5в — после phone dogfood; Phase 0/три комнаты не
переоткрывать. До receipt Labs — только read-only сверка и подготовка
acceptance. Старый mobile-review флаг не включать: старые PR (Backend
#25/#30, Feed #13/#14, Generator #6, Agents #9/#10) имеют R7 NO-GO —
пересборка на свежих masters.

## Первая очередь после gate

| # | Инициатива | Результат | Оценка |
| --- | --- | --- | --- |
| L1 | Mechanism-agnostic mutation pipeline | общий candidate path c reuse lineage/CAS; второй successor-контур запрещён | `2–4d` |
| L2 | Materialize Family A candidates | только после founder taste; без auto-publication | `1–2d` |
| L3 | Первый полный Labs family cycle | request → variants → proof → phone decision → library-ready | `2–4d` |
| L4 | Factory/series scale | только по измерениям L3 | TBD |

## Действующие процессные решения 13.08

- GO — только с названной категорией ядра. Standing authority в неизменном
  scope: read-only evidence, bounded correction, PR/CI/merge, один
  reversible deploy/restart, одна заранее описанная recovery. Live DB
  migration — отдельный операторский акт.
- Один review-раунд: discovery → все P1/P2 разом → один узкий delta.
  P3 не блокируют, собираются в bounded polish batch.
- Tier 0/1 review и обычные receipts живут в Issue/PR/task output;
  root-файл — только canonical core/release outcome.
- До 10–20 реальных two-Mac тикетов не строить merge queue, lock, quota
  optimizer, task store или новый dispatcher.
- Worktree cleanup — еженедельно после raw census; автоматически только
  clean+reachable+merged+unlocked+inactive.

## Parked / не запускать сейчас

- S8 ad-матрица — до UA-плана/реальной закупки второй сети.
- S9 mobile review flag/consumer/digest — после Labs gate, phone-first;
  порядок и scope: `docs/lab-simplification-plan-2026-08-13.md` (v2.3).
- #81 Family A publication — до founder taste и Labs gate.
- Новая инфраструктура dev-dispatch, credentials, settings, permissions,
  runner, DB/table или альтернативный successor-протокол — вне scope.
- P3-кандидаты в один bounded polish batch: `maxBuffer` в executeGh
  (two-mac-bridge), path-with-space bug `test/mechanic-sandbox-registration`
  (swipe-generator), локальные sibling-пины для generator full verify.
  Wake-driver Fable-сессии — disposable/uncommitted, не транспорт.
