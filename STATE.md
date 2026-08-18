# STATE.md — текущий контрольный экран

Обновлено: 18.08.2026, поздний вечер (terminal checkpoint перед test-day
19.08). Не ledger; читать первым, обновлять последним; предел — 150 строк.
**Активна заморозка деплоев/рестартов до конца операторского test-day.**

## Владение и транспорт

- Mac A owner: Claude Fable по письменному handoff 17.08; Codex Mac A
  PARKED (лимиты, возврат ~чт 20.08). Mac B: Codex, binding перепривязана
  штатным bootstrap на meta `7808349…` (bindingDigest `ddb5b819…`).
- Транспорт v2 (causal lineage) боевой: полный день S1/#136 прошёл через
  wake→receipt циклы. FIFO #94 пуст, все линии терминальны.
- Автоматики Codex PAUSED. Новый model-free слой: launchd
  `com.p4g.intake-drain-watcher` (Mac A, тик 60с, без AI) — LIVE из
  `-live/p4g-workspace-meta@16f1ec0`, грант `operator:flags:write`
  до ~17.09.

## Production checkpoint (18.08 вечер)

- **backend**: master `c512ce96…`; live = кандидат publish-run
  `32171097358` (image `sha256:551cdcf4…`, manifest `06938c68…`);
  **DB `0083_mobile_review_inbox`**. Флаги ON: ticket bridge,
  ticket notifications, mobile review (+operator). Owners-available
  флаг OFF (ждёт #136 piece 3). Deploy-id волатилен — источник истины
  дашборд, не этот файл (урок CAS-клина 18.08).
- **static**: swipe-platform `de8439d` (feed `8d960b7`, stamp `d89dace`);
  Render build-pin = `8d960b7…` (актуален). В ленте живут: шит
  «Изменения dev-ленты» (#118 slice 1), клавиатурный фикс форм,
  intake-вертикаль.
- **generator**: live detached `5af6f6df…` (S1-половина);
  `SWIPE_MOBILE_REVIEW_ENABLED=1`; мост отсмотра подключён грантом
  `operator.review:write`. Очередь durable: 1 parked (Short Drama
  request). Мониторинг: три чистые адопции за 18.08, stderr Δ0.
- **Интейк-петля целиком автоматическая**: кнопка → outbox → watcher
  (≤60с) → drain → GitHub Issue + Telegram-пинг. Доказано на #134/#135
  (второй круг: 19 мин доставка→прод).

## Терминалы 18.08 (однострочно; детали в receipts)

- #108 CLOSED терминально (receipt 5327569707; петли #134/#135 с
  приёмкой на устройстве). #112, #129 закрыты административно.
- S1 #133: обе половины merged (backend PR #74 → `8150ab25`, generator
  PR #51 → `5af6f6df`), **live-миграция 0083** (receipt 5328682955 —
  включая Render-флейк с применённой миграцией и CAS-клин координатора),
  рантаймы предзагружены, флаги включены сетапом 18.08.
- #136: drain endpoint (backend PR #75, Tier-2 PASS,
  CLI-lock=ACCEPT_RECORDED_HAZARD) + watcher v0 (meta PR #137, Tier-1
  FAIL→коррекция→delta PASS) — LIVE; piece 3 (conditional AI wake)
  не начат. Сводный полиш-лист: #136 comment 5331552479.
- #118: reconciliation заморожен v1 (операторские решения: carrier =
  catalog, без «Команда тестирует», порядок diff-экран → promotion);
  slice 1 (read-only шит) в проде; gap-лист/словари — comment 5329395150.
- Generator polish batch (PR #49/#50), NEEDS_HELP-диспозиции #121/#112
  (среда/flake, подтверждены rerun'ами), rebind mac-b — терминальны.

## Очередь (после test-day)

| # | Работа | Владелец | Состояние |
| --- | --- | --- | --- |
| 1 | **Test-day 19.08**: три оси (механики ∥, платформа, S1 отсмотр с телефона), статусы в шите, duplicate/replay, NEEDS_HELP/terminal. Находки партией, не чинить на лету | оператор | назначен |
| 2 | Один correction batch по находкам теста | Mac A/B по путям | после 1 |
| 3 | S1 e2e acceptance: первый настоящий кандидат → инбокс → решение → Композер → terminal | оператор + Mac A | после 1 |
| 4 | Playables PR #33 (build-pin fail-closed) — path-disjoint Tier-1 | Mac B | в очереди |
| 5 | #118 promotion-половина: server-owned diff + «Продвинуть» для marble-sort; #109 следом | Mac A | после 2–3 |
| 6 | #136 piece 3: exactly-once AI resume + owners-available хвост #107 (cadence, ровно одно idle-сообщение) | Mac A (+Codex после лимитов) | после 2 |
| 7 | Polish batch единой партией (список: #136 c.5331552479) | Mac A/B | одна партия |
| 8 | Гранты: подтвердить статус батча recall/read/analytics (шаг 2 сетапа); flags до 16.09; watcher до ~17.09 | оператор | проверить |

## Действующие процессные решения 13.08 — без изменений

- GO только с названной категорией ядра; standing authority: read-only
  evidence, bounded correction, PR/CI/merge, один reversible
  deploy/restart, одна описанная recovery.
- Один review-раунд: discovery → все P1/P2 → один узкий delta; P3 — в
  polish batch. Receipts Tier 0/1 — в Issue/PR.
- До 10–20 two-Mac тикетов: без merge queue/lock/optimizer/task store.
  (Счётчик ~15: решение о пост-пилотной инфраструктуре близко.)

## Parked / не запускать

- S8 ad-матрица + Short Drama recovery — до UA-плана (request в очереди
  Generator). #81 Family A — до founder taste (#91/#92). #117/#120 —
  disposition в гигиеническую партию. Старые R7 mobile-review PR —
  NO-GO навсегда (S1 заменил). Новая инфраструктура вне #136 — вне scope.
