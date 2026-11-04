# STATE.md — текущий контрольный экран

Обновлено: 27.08.2026 после terminal Mac A continuation Issue #151 row 4. Это не ledger: история находится в git, GitHub
Issue/PR и canonical core/release receipts. Читать первым, обновлять последним;
целевой предел — 150 строк.

## Немедленный priority override 14.08

- Issue #151 row 5 — **TERMINAL-ONLY TRANSPORT STOP / ZERO EXTERNAL
  MUTATION**: recovery body exact (`80264f40…`), но первый repository-native
  active-binding CAS завершился `github_transport_unavailable`. Bridge
  dry-run/apply и causal successor не запускались; implementation/PR/CI/
  merge/runtime/request/release остались без изменений.
- Issue #159 PR #82 — **TRANSPORT STOP / ZERO MUTATION**: correction-delta
  body локально exact (`917ad403…`), но fresh GitHub binding/PR/CI/duplicate
  CAS не состоялся из-за `github_transport_unavailable`. Bridge dry-run/apply,
  wake, review, merge и runtime actions не запускались; нужен один новый
  transport-only запуск после восстановления read access, без raw POST.
- Issue #136 piece 3 — **MAC A IDE OWNER PREPARED / GATE UNLOADED**: durable
  meta checkout clean detached на exact master `f2744944…`, tree `124e5151…`,
  master CI `32931325928` SUCCESS и Tier-2 PASS `5420706217`. Headless binding
  `0587843a…` held append-only; active Mac A binding `88ec705f…` принадлежит
  IDE task `f2c0e31a…`. Config `0600`, `enabled=false`, exact IDE session;
  state/attention и legacy headless receipt byte-stable, app-server receipt
  отсутствует, LaunchAgent unloaded. Enable/receipt/load/tick остаются отдельным
  activation packet; Mac B preparation отдельна.
- Issue #151 row 2 — **NEEDS_HELP / SINGLE RELEASE FAILED AT COVERS**: Mac A
  принял Generator `d2149b96…`/tree `09d972a1…`, один раз перезапустил
  LaunchAgent (`68858 → 79842`, health PASS), append-only добавил `SOURCE_READY`
  и один `RELEASE_STARTED` (`6ef34060…`). Pin/test/build прошли; covers terminal
  `FAILED`, отсутствовал `merge-timepress-v1@1/dist-swipe/cover.jpg`; candidate/
  artifacts/review/READY нет, request open. Без retry/reset/replay/replacement/
  restart. Diagnosis `5430295161`; correction wake `5430334698` (`wake_453e…`)
  ушёл Mac B; recovery failed release остаётся отдельным Mac A актом.
- Issue #151 row 4 — **MATERIALIZED / HANDOFF_READY TO MAC B**: preserved Smash
  request `c974b0a8…`/hash `9d5e2ac6…`, deployed ancestor `bdcd900d…`; reviewed
  source `94fae2be…` ancestor exact remote master `3856cb94…`. Dry-run PASS;
  Mac A append-only применил ровно один `MANUAL_SOURCE_READY`, event `f0334adc…`.
  Request остаётся open, release не создан, notification не отправлен. Atomic
  causal v2 receipt+wake: `5436465340` / `wake_09f7d534…`, predecessor
  `wake_adb5bed…`, lineage `lin_15100000000000000000000000000001`; Mac B
  продолжает только row-5 source reconciliation, без replay/reset/retry/recreate.
- Issue #114 — **V16 STOP / P1/P2 CORRECTION QUEUED**: live Generator
  принят один раз на exact master `e49be26b…`, tree `d7c842e6…`, master CI
  `31836674871` SUCCESS; тот же LaunchAgent healthy, PID `21325`;
  backend master `8fecf37e…` live на deploy `dep-d9vlnh3l550s73920680`, image
  `sha256:d39a31d4…`, manifest `0edeb800…`, DB `0081`. Для трёх исходных
  requests dry-run прошёл и ровно по одному append-only `MANUAL_SOURCE_READY`
  применено без reset/retry/recreate. Klondike release `206f3cfc…` и Smash
  `190bf352…` дошли до `READY_FOR_APPROVAL`, по одной confirmed notification
  (`99`/`100`), fast lane ждёт physical surface PASS. Short Drama release
  `033141e9…` FAILED/preparation: release-service всё ещё hardcodes `master`
  вместо admitted `creatives-main`; затем старый authoring `FAILED` конфликтует
  со вторым release `FAILED`, coordinator повторяет `playable_fast_lane_conflict`.
  V16 correction сохранена локально clean на `abbd162d…`, tree `5cd47297…`;
  focused verify green, PR/CI/merge не начинались. Replacement Opus 5/high
  review `5301028428` завершён FAIL: P1=1/P2=4/P3=3. Blocking batch: exact
  logical→physical source mapping, ancestry вместо remote-head equality,
  UUID validation до path/lock, конфликтная identity для null-release failure
  и server-owned MANUAL_SOURCE_READY binding на manual-start; P3 deferred.
  Canonical correction-only wake `5302040224` опубликован byte-exact один раз
  (wake `wake_dcc0fb…`, target Mac B `be9b2496…`): одна correction batch,
  focused/verify + exact-head CI и один narrow delta review; без merge/runtime/
  recovery и без изменения более поздних FIFO wakes.
- Issue #120 — **NEEDS_HELP / TERMINAL SEQUENCE MISMATCH**: source/covers и
  release `139cd01b…` зелёные, но actor-bound accept/auth обогнали physical
  dev-only gate и обновили shared static master `c90397f1…`. Receipt
  `5294292655`; physical PASS не inferred, retry/successor/rollback не запускать.
- Issue #119 — Feed PR #40 merged at `acc68d89…`, master CI `31806916379`
  SUCCESS; deploy отложен текущим portfolio override.
- Issue #121 — **IN_PROGRESS / BACKEND LIVE 0081**: backend
  PR #71 exact signed head `64e5bf2a…` merged once as master `8fecf37e…`, tree
  `9eef5295…`; master Browser `31826397594` и PostgreSQL `31826397638`
  SUCCESS, включая ephemeral roundtrip `0081`. Tier-2 receipt `5296483162`
  сохранил P1/P2=0, F006–F008 deferred P3. Один publish `31827696427` и один
  cutover `31827922956` завершились SUCCESS: live deploy `dep-d9vlnh3l…`, image
  `sha256:d39a31d4…`, manifest `0edeb800…`, DB-authoritative job
  `job-d9vlnregekts73dabbr0` подтвердил `0081_playable_feedback_queue`.
  Terminal receipt `5296743776`. Feed queue UI PR #41 merged as master
  `b236a99a…`, exact/master CI `31832929549`/`31833639878` SUCCESS и одним
  feed-only rollout опубликован: static master `1a4f6b2a…`, tree `2e989632…`,
  `release.json` feed=`b236a99a…`, exportedPlayablesCommit=null, профиль
  `44298d1a…`; public index/metadata/versions byte-match, mechanics unchanged.
  Durable rollout receipt `5297934235`.
  Desktop capture backend PR #72 исправлен после Tier-2 discovery `5297890020`:
  exact head `2fd65693…`, tree `a3fba6dc…`, image/PostgreSQL CI
  `31838652624`/`31838652625` SUCCESS; server выводит actor/machine/lane/
  roster/runtime и принимает от Codex только mutation/playable/instruction.
  Один correction-delta review wake `5298029662` передан exact Mac B owner
  FIFO после #114 V16; merge/deploy запрещены до terminal P1/P2=0.
  Feed PR #42 exact corrected head `72f23a08…` добавляет явный operator choice
  Mac A/Mac B только для desktop-intake scope и fail-closed сверяет server
  receipt; Opus 5/high discovery + одна correction/delta, exact/master CI,
  merge и feed-only rollout завершились green (`b69f021c…` live; receipt
  `5298407690`). Первый Mac A normal auth истёк без approval/binding
  (`5298508772`); replacement flow для client `286a8468…` авторизован
  оператором как server-owned `mac-a`, scope `operator:flags:write`, durable
  grant до `2026-09-14T05:13:08.427Z`. Для Mac B один
  existing-flow auth wake `5298439201` опубликован FIFO после #114 V16 и #121
  PR72 delta review. Generator-only desktop feedback adapter wake `5298479645`
  опубликован FIFO строго после Mac B auth, не supersede/preempt предыдущие
  пакеты. Existing heartbeat `p4g` обновлён на месте без смены task/automation:
  его task digest `47093cc8…` не совпадает с exact Mac B binding `be9b2496…`,
  поэтому он больше не запускает bound scanner и служит только read-only relay
  Mac A terminal/successor evidence; cadence остаётся 2 min.
  Adapter implementation/PR/runtime adoption ещё не выполнены. Three-mechanic
  dogfood также не выполнен; legacy NULL bindings остаются fail-closed.
- Issue #117 — **FAILED_DEV_DOGFOOD / FROZEN FIXTURE**: точные receipts и
  operator-visible bugs сохранены; новый old-path correction cycle не запускать.

## Приоритет: phone-first, затем одна bounded polish batch

Новые Labs-инициативы не начинать до green gate. Сначала доказать полный
телефонный путь для механик и платформы, сыграть готовые кандидаты и собрать
одну общую партию замечаний. Отдельные P3/полиш не протаскивать по одному.

| # | Инициатива | Состояние | Следующий результат | Оценка |
| --- | --- | --- | --- | --- |
| 0 | Phone mechanic recovery: `orthogonal-link-v1`, `pins-l5`, `smash-fest-v1` | **READY_FOR_APPROVAL / NOTIFICATION NEEDS_HELP**. V25 retried the same Pins release `6fa778a6…` exactly once on live Generator `e6cf81bf…`; technical/build/covers/artifacts/review binding and hosted bytes passed, candidate commit `50723642…`. Original request/instruction stayed exact and open. READY Telegram receipt is `outcome_unknown` with `operator_flags_lab_response_invalid`; no retry or product action. Orthogonal and Smash remain untouched and released | play the exact hosted Pins candidate if its READY message is visible; otherwise diagnose/disposition notification recovery separately. Product accept/rework/reject remains operator-owned | play `10–15m`; notification recovery TBD |
| 1 | Platform ticket #99 — screenshot UX | **DELIVERED LIVE** | телефонный smoke: крупный screenshot без ручного редактирования и удаление добавленного screenshot; findings — в общую batch | `10–15m` operator |
| 2 | Issue #98 — capability successor | **DONE / PASS**. Production window и clean smoke завершены; exact successor создан один раз; результат дошёл до ленты через Telegram | продуктовый наигрыш уже положительный; странный warning/status после успешной rework считать UX finding, не повторять lifecycle | инженерная работа закрыта |
| 3 | Issues #91/#92 — Candidate Decision Loop + Arrows Wave 1 | **READY_TO_PLAY**; #92 имеет 3/3 кандидата | сыграть кандидаты, собрать taste/UX notes; затем максимум одна bounded polish batch | play `1–2h`; polish `0.5–1 day` |
| 4 | Issue #88 — bottom control/back navigation | code/CI/founder play зелёные, ждёт terminal Fast Lane condition | exact CAS → merge → один feed-only static deploy → smoke | `1–2h` после снятия зависимости |
| 5 | Issues #82/#81 hygiene | #82 выполнен; #81 = `3/3 library_ready`, без publication authority | закрыть #82; #81 оставить parked до Labs gate | `0.5–1h` |

## Production checkpoint

- Issue #98 canonical outcome: meta Issue #98 comment `5272895976`; terminal
  pointer Issue #94 comment `5272897481`.
- Live backend deploy `dep-d9vlnh3l550s73920680`, image `sha256:d39a31d4…`,
  manifest `0edeb800…`; DB authority at migration `0081_playable_feedback_queue`;
  live Generator exact master `e49be26b…`.
- Blocked root остался byte-stable; successor `4fe07219…` создан один раз,
  `replayed=false`; clean-smoke release дошёл до `READY_FOR_APPROVAL`, exact
  Playables CI и hosted bytes были зелёными, Telegram notification — одна.
- После successor система forward-only: downgrade/semantic rollback запрещён.
  Product accept/reject, publication, activation, mapping, catalog и roster не
  выводятся из инженерного smoke.

## Labs gate

Labs открывается, когда одновременно:

1. #98 terminal clean smoke сохранён, blocked root не переписан;
2. platform и mechanic requests проходят с телефона до честного terminal
   состояния без ручного переноса prompt/ID/SHA;
3. #91/#92 сыграны и одна общая bounded polish batch закрыта;
4. exact-head CI зелёный, открытых P1/P2 и незавершённого deploy/migration
   окна нет.

Оценка до gate: P50 `2–4` календарных дня; P90 `5–7` дней при реальном
blocking friction в phone soak или polish batch.

## Первая очередь после gate

| # | Инициатива | Результат | Оценка |
| --- | --- | --- | --- |
| L1 | Mechanism-agnostic mutation pipeline | общий candidate path с reuse lineage/deterministic identity/CAS из `feed.playable-capability-successor.v1`; второй successor-контур запрещён | `2–4 engineer-days` |
| L2 | Materialize выбранные Family A candidates | только прошедшие founder taste варианты; без автоматической publication/activation | `1–2 engineer-days` |
| L3 | Первый полный Labs family cycle | request → variants → proof → phone decision → library-ready | `2–4 engineer-days` |
| L4 | Factory/series scale | оценить только по измерениям L3 | TBD |

## Действующие процессные решения 13.08

- Приняты S1, S3–S7, S10; S2 действует только в границах
  [CLAUDE.md](CLAUDE.md). S8 отложен до UA-плана; S9 идёт по phone-first
  очереди после Labs gate.
- GO запрашивается только с названной категорией ядра. Read-only evidence,
  bounded correction, PR/CI/merge, один reversible deploy/restart и одна
  заранее описанная recovery в неизменном scope покрыты standing authority.
  Любая live DB migration пока остаётся отдельным операторским актом.
- Один review-раунд: discovery-партия → все P1/P2 разом → один узкий
  delta-verification exact head. P3 не блокируют по умолчанию.
- Tier 0/1 review и обычные handoff/CI receipts живут в Issue/PR/task output;
  root-файл — только canonical core/release outcome. `NEEDS_HELP` сначала
  триажит оркестратор; разрешённый handoff обязан сам содержать typed wake.
- До 10–20 реальных two-Mac тикетов не строить merge queue, repo-lock/lease,
  quota optimizer, task DB/store, новый bridge или dispatcher. Решение после
  пилота и конфликт portfolio-приоритетов принадлежат оператору.
- Worktree cleanup — еженедельно после raw census каждого repo; автоматически
  только clean+reachable+merged+unlocked+inactive без unique commits.

## Parked / не запускать сейчас

- S8 ad-матрица — до UA-плана/реальной закупки второй сети.
- S9 mobile review flag/consumer/digest — после Labs gate в phone-first
  порядке; не смешивать с текущей recovery трёх mechanic requests. Порядок
  и scope слайсов 1–5а/5б/5в: `docs/lab-simplification-plan-2026-08-13.md`
  (v2.2, proposal — перенос в durable authority отдельным чистым PR).
  Handoff владения → Codex-сессия:
  `HANDOFF-LABS-SIMPLIFICATION-2026-08-13.md` (Phase 0 сразу, код после GO).
- #81 Family A publication/materialization — до founder taste и Labs gate.
- Новая инфраструктура dev-dispatch, credentials, settings, permissions,
  runner, DB/table или альтернативный successor-протокол — вне текущего scope.
