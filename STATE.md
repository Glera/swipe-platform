# STATE.md — текущий контрольный экран

Обновлено: 13.08.2026 после process-simplification GO. Это не ledger: история находится в git, GitHub
Issue/PR и canonical core/release receipts. Читать первым, обновлять последним;
целевой предел — 150 строк.

## Приоритет: phone-first, затем одна bounded polish batch

Новые Labs-инициативы не начинать до green gate. Сначала доказать полный
телефонный путь для механик и платформы, сыграть готовые кандидаты и собрать
одну общую партию замечаний. Отдельные P3/полиш не протаскивать по одному.

| # | Инициатива | Состояние | Следующий результат | Оценка |
| --- | --- | --- | --- | --- |
| 0 | Phone mechanic recovery: `orthogonal-link-v1`, `pins-l5`, `smash-fest-v1` | **IN_PROGRESS / HOLD**. Все три исходных request остаются terminal `NEEDS_HELP`, без reset/retry. V16 exact commit `657bb381…` опубликован без изменения как Generator draft PR #34; local verify зелёный, exact-head CI run `31680067358` запущен | существующий Mac A owner получил typed handoff на ровно один blind review exact head. При P1/P2=0 и green CI — один exact Generator restart и ровно одна recovery исходных requests; drift/repeated failure → `STOP` | review/CI `1–3h`; recovery smoke `20–40m`; P90 `1 day` |
| 1 | Platform ticket #99 — screenshot UX | **DELIVERED LIVE** | телефонный smoke: крупный screenshot без ручного редактирования и удаление добавленного screenshot; findings — в общую batch | `10–15m` operator |
| 2 | Issue #98 — capability successor | **DONE / PASS**. Production window и clean smoke завершены; exact successor создан один раз; результат дошёл до ленты через Telegram | продуктовый наигрыш уже положительный; странный warning/status после успешной rework считать UX finding, не повторять lifecycle | инженерная работа закрыта |
| 3 | Issues #91/#92 — Candidate Decision Loop + Arrows Wave 1 | **READY_TO_PLAY**; #92 имеет 3/3 кандидата | сыграть кандидаты, собрать taste/UX notes; затем максимум одна bounded polish batch | play `1–2h`; polish `0.5–1 day` |
| 4 | Issue #88 — bottom control/back navigation | code/CI/founder play зелёные, ждёт terminal Fast Lane condition | exact CAS → merge → один feed-only static deploy → smoke | `1–2h` после снятия зависимости |
| 5 | Issues #82/#81 hygiene | #82 выполнен; #81 = `3/3 library_ready`, без publication authority | закрыть #82; #81 оставить parked до Labs gate | `0.5–1h` |

## Production checkpoint

- Issue #98 canonical outcome: meta Issue #98 comment `5272895976`; terminal
  pointer Issue #94 comment `5272897481`.
- Live backend deploy `dep-d9udvfe5djic739q8shg`, DB authority at migration
  `0080_playable_capability_succ`; live Generator exact master `513f95eb…`.
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
  порядке; не смешивать с текущей recovery трёх mechanic requests.
- #81 Family A publication/materialization — до founder taste и Labs gate.
- Новая инфраструктура dev-dispatch, credentials, settings, permissions,
  runner, DB/table или альтернативный successor-протокол — вне текущего scope.
