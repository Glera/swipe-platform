# STATE.md — текущий контрольный экран

Обновлено: 17.08.2026 (вечер) после закрытия критического пути Mac A:
#114/#121 terminal, Labs unlocked. Это не ledger: история — в git, GitHub
Issue/PR и canonical receipts. Читать первым, обновлять последним; предел —
150 строк.

## Владение и транспорт

- Mac A owner: Claude Fable сессия по письменному операторскому handoff
  17.08.2026; Codex Mac A owner-сессия PARKED. Binding mac-a `f2c0e31a…`
  не менялся; автоматики PAUSED; heartbeat `p4g` — read-only relay.
- Очередь #94 **пуста**: все wake 17.08 терминально закрыты
  (`5313116448` → `5313715774` → `5313955544` → `5314648640` →
  `5315123241` → `5315329603`). Открытых mac-a/mac-b wake нет.

## Терминальные результаты 17.08

- **Issue #114 — TERMINAL.** V16 correction merged
  (`Glera/swipe-generator#44` → master `b2fb235b…`, CI `32022840740`);
  adoption выполнен. Dogfood terminal: receipt `#114` comment `5316412961`.
  Post-V16 successor-цикл «инструкция → hosted READY» ≈ 60–85 сек — SLO
  P50≤15m выполнен с запасом; исторические 7ч08м — ~99% transport-era.
  Short Drama recovery **PARKED** (оператор 17.08): старая lane
  неоживляема by design, маршрут восстановления задокументирован там же;
  продуктовая правка уже в `creatives-main` (`78fe5741`).
- **Issue #121 — TERMINAL.** Desktop adapter merged
  (`Glera/swipe-generator#45` → final master `61678b5b…`, CI
  `32023465035`). Backend `Glera/swipe-backend#72` merged после Tier-2
  PASS (P1/P2=0): master `000d042b…`, один reversible deploy
  `dep-d9vlnh3l…` → `dep-da1d1rugekts738338k0` (миграций нет, DB `0081`),
  health 200; receipt `#121` comment `5314176665`. Mac A desktop-intake
  binding подтверждён серверно (grant до `2026-09-14`).
- **Решения оператора reconciled read-only** (оба от 15.08 04:58–04:59Z,
  зеркалированы 17.08 после восстановления grant): Klondike → rework →
  successor release `8426a388…` кандидат `f9c4ec0e…` **READY, ждёт
  наигрыша**; Smash → accept → **PUBLISHED** (static push + verified +
  Telegram). Pins — **LIVE с 13.08 18:09** (прежняя строка о notification
  recovery была устаревшей; журнал: accept 18:08, delivered msg 84).
- **Runtime:** live Generator LaunchAgent на exact merged master
  `61678b5b…` (один kickstart, health PASS, координатор работает без
  ошибок); live backend image `sha256:fd7c3bf5…`, manifest `1c64efc9…`.
- **Labs UNLOCKED:** durable receipt `Glera/p4g-workspace-meta#122`
  comment `5316419272`. Следующий разрешённый слайс — **S2/S2a** (lineage
  presenter, честные статусы; Mac B; phone-source НЕ нужен). S1 — только
  после принятого cross-repo phone-source (`/api/admin/mobile-reviews`;
  старые R7 NO-GO драфты пересобираются, не мержатся). S3 после S1;
  5а/5б/5в после phone dogfood; Phase 0 не переоткрывать.
- **Сервисные гранты Lab:** `operator:flags:write` продлён оператором до
  `2026-09-16`; `catalog:read`, `analytics:read`, `catalog:recall`
  истекли (июльская партия, 30-дневный TTL) — переподтвердить картами Lab
  при удобном случае; конвейер они не блокируют.
- Issue #120 — NEEDS_HELP / terminal sequence mismatch: без изменений
  (receipt `5294292655`); retry/successor/rollback не запускать.
- Issue #119 — Feed PR #40 merged `acc68d89…`; deploy можно вернуть в
  очередь: portfolio override снят с закрытием #114/#121.
- Issue #117 — FAILED_DEV_DOGFOOD / frozen fixture: без изменений.

## Ближайшая очередь

| # | Работа | Владелец | Состояние |
| --- | --- | --- | --- |
| 1 | Наиграть Klondike successor `8426a388…` (READY-карточка в Telegram) и решить; при rework цикл ≈1 мин | оператор | READY |
| 2 | #107 meta PR: causal lineage → capability profile → adaptive cadence; start gate выполнен (dogfood terminal, wake consumed, owners idle) | Mac A | след. bounded window |
| 3 | Labs S2a lineage presenter (fixtures 17.08: ложный «нужна помощь» при успешном successor; grant-expiry UX) | Mac B | admitted |
| 4 | #119 deploy (feed) — вернувшийся из override | Mac A | queued |
| 5 | Наиграть #91/#92 (Labs-only, 3/3 кандидата) + одна общая polish batch | оператор | READY_TO_PLAY |

## Production checkpoint

- Live backend deploy `dep-da1d1rugekts738338k0`, image `sha256:fd7c3bf5…`,
  manifest `1c64efc9…`; DB authority `0081_playable_feedback_queue`; live
  Generator exact `61678b5b…`.
- Issue #98 canonical outcome: meta #98 comment `5272895976`; blocked root
  byte-stable; successor `4fe07219…` один раз; система forward-only.
- Product accept/reject, publication, activation, mapping, catalog и roster
  не выводятся из инженерного smoke.

## Labs gate (полный, для L1+)

Полное открытие очереди L1–L4 — по прежним четырём условиям (см. историю);
S2a admitted отдельно receipt-ом `5316419272`. Оценки слайсов — в
`docs/lab-simplification-plan-2026-08-13.md` (v2.3).

## Действующие процессные решения 13.08

- GO — только с названной категорией ядра. Standing authority: read-only
  evidence, bounded correction, PR/CI/merge, один reversible deploy/restart,
  одна заранее описанная recovery. Live DB migration — отдельный
  операторский акт.
- Один review-раунд: discovery → все P1/P2 разом → один узкий delta;
  P3 — в bounded polish batch.
- Tier 0/1 review и обычные receipts — в Issue/PR/task output; root-файл —
  только canonical core/release outcome.
- До 10–20 two-Mac тикетов не строить merge queue, lock, quota optimizer,
  task store или новый dispatcher.
- Worktree cleanup — еженедельно после raw census (в этот census войдут
  новые worktree 17.08: `swipe-generator-baseline-20260817`,
  `swipe-generator-preview44/45-20260817`, `swipe-backend-issue121-n001`).

## Parked / не запускать сейчас

- S8 ad-матрица — до UA-плана. **Short Drama recovery** — вместе с ней:
  маршрут в `#114` comment `5316412961` (строчка в package.json
  creatives-main от Mac B → новый запрос оператора → одна admission).
- S9 mobile review flag/consumer/digest — после Labs gate; старый флаг не
  включать (R7 NO-GO).
- #81 Family A publication — до founder taste и Labs gate.
- Bounded polish batch (P3, копятся): ложный «нужна помощь» при успешном
  successor (S2a fixture); advance-warning для истечения сервисных грантов;
  `maxBuffer` в executeGh (two-mac-bridge); path-with-space bug
  `test/mechanic-sandbox-registration` (swipe-generator); локальные
  sibling-пины для generator full verify; PR #72 P3 (logging деградации
  конфликта). Readiness-budget hardening тестовых хелперов — уже идёт
  отдельной локальной сессией (task chip 17.08), принять её результат как
  обычный bounded PR Mac B.
- Новая инфраструктура dev-dispatch, credentials, settings, permissions,
  runner, DB/table или альтернативный successor-протокол — вне scope.
