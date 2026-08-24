# STATE.md — текущий контрольный экран

Обновлено: 21.08.2026 (census 19–21.08 + письменный handback). Не ledger;
читать первым, обновлять последним; предел — 150 строк.
**Активна заморозка деплоев/рестартов до конца операторского mobile soak.**

## Владение и транспорт

- **Handback 21.08 (операторское решение)**: авторство платформы Mac A →
  Codex-сессия Mac A. Claude Fable удерживает portfolio/meta authority,
  STATE/checkpoint, review-участие, продуктовые контракты (Mission Slice
  v0, Researcher R0/R1) и frontier-эскалацию. Mac B: Codex, binding на
  meta `7808349…` (bindingDigest `ddb5b819…`).
- Транспорт v2 (causal lineage) боевой: полный день S1/#136 прошёл через
  wake→receipt циклы. FIFO #94 пуст, все линии терминальны.
- Автоматики Codex PAUSED. Новый model-free слой: launchd
  `com.p4g.intake-drain-watcher` (Mac A, тик 60с, без AI) — LIVE из
  `-live/p4g-workspace-meta@16f1ec0`, грант `operator:flags:write`
  до ~17.09.

## Production checkpoint (18.08 вечер)

- **backend**: master = merge PR #76; live = кандидат publish-run
  `32348075736` (manifest `f364f701…`); **DB `0084_playable_admin_close`**
  (live-миграция по GO 20.08). Флаги ON: ticket bridge, notifications,
  mobile review (+operator). Owners-available OFF (ждёт #136 piece 3).
  Deploy-id волатилен — истина в дашборде. Канонический LKG-digest брать
  ТОЛЬКО из successful publish-run (урок 20.08).
- **static**: swipe-platform `e5c7c7a` (feed source `8d960b7`, stamp
  `2b13838`; short-drama-swipe экспортирован). Render build-pin =
  `8d960b7…` (актуален). Playables master `62f57c28` (PR #33 fail-closed
  build-pin + PR #34 Short Drama baseline). В ленте: шит dev-diff,
  клавиатурный фикс, intake-вертикаль, фикс short-drama.
- **generator**: live detached `5af6f6df…` (S1-половина);
  `SWIPE_MOBILE_REVIEW_ENABLED=1`; мост отсмотра подключён грантом
  `operator.review:write`. Очередь durable: 1 parked (Short Drama
  request). Мониторинг: три чистые адопции за 18.08, stderr Δ0.
- **Интейк-петля целиком автоматическая**: кнопка → outbox → watcher
  (≤60с) → drain → GitHub Issue + Telegram-пинг. Доказано на #134/#135
  (второй круг: 19 мин доставка→прод).

## Терминалы 19–21.08 (однострочно)

- **#139 terminal**: административное закрытие release-less rework +
  live-миграция **0084**; закрыты smash/solitaire/short-drama
  (`done_outside_fast_lane`; short-drama — после baseline #34 и деплоя
  `e5c7c7a`). merge-locked — иммутабельный capability-gap корень (→ #140).
  Открыты честно: marble-sort (первый запрос soak) и merge-locked.
- **#140 создан**: Escalation lane «вход один, полос две» — proposal,
  первый пакет Codex A. **#141 merged**: шпаргалка
  docs/specs/operator-decision-cheatsheet.md; gap-входы в #109/#118.
- Playables (Mac B): PR #33 (deploy сам запекает feed SHA, fail-closed —
  доказан живым деплоем 21.08) и PR #34 (Short Drama baseline, бинарники
  только в concept store) — merged.
- Стратегия 21.08: фокус на продуктовый proof — **Mission Slice v0**
  (Fable) и **Researcher R0/R1** (charter Fable → R1 Mac B после S1/S3);
  Finance v1-B остаётся PARKED.

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
| 1 | **Mobile soak**: три оси; первый запрос — marble-sort (=первый S1 E2E); находки партией | оператор | активен |
| 2 | Correction batch подтверждённых находок (без deploy до слова оператора) | **Codex A** | после 1 |
| 3 | #140 Escalation lane → #118 slice 2 → #109, последовательно | **Codex A** | после 2 |
| 4 | Researcher R0: charter + scorecard, затем первая Tier-A партия | Fable | сейчас |
| 5 | Mission Slice v0 execution contract (draft-for-decision) | Fable | сейчас |
| 6 | S1 E2E-поддержка + Labs S3; затем Research Radar R1 по frozen charter | Mac B | S3 → R1 |
| 7 | #136 piece 3 (exactly-once AI resume + owners-available хвост) | Codex A | после 3 |
| 8 | Polish batch единой партией (#136 c.5331552479 + новые P3) | по путям | одна партия |
| 9 | Гранты: батч recall/read/analytics не подтверждён; flags до 16.09; watcher до ~17.09; Tier-B доступы researcher (SensorTower MCP?/AppMagic/YT/Poki — чек-лист выдан) | оператор | открыт |

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
