# STATE.md — текущий контрольный экран

Обновлено: 25.08.2026 (Issue #151 F7 Tier-2 review pending). Не ledger;
читать первым, обновлять последним; предел — 150 строк.
**Активна заморозка деплоев/рестартов до конца операторского mobile soak.**

## Владение и транспорт

- **Handback 21.08 (операторское решение)**: авторство платформы Mac A →
  Codex-сессия Mac A. Claude Fable удерживает portfolio/meta authority,
  STATE/checkpoint, review-участие, продуктовые контракты (Mission Slice
  v0, Researcher R0/R1) и frontier-эскалацию. Mac B: Codex, binding на
  meta `7808349…` (bindingDigest `ddb5b819…`).
- Транспорт v2 (causal lineage) боевой: полный день S1/#136 прошёл через
  wake→receipt циклы. В линии #151 один review-only wake F7 ожидает Mac B;
  terminal receipt по нему ещё не получен.
- Автоматики Codex PAUSED. Новый model-free слой: launchd
  `com.p4g.intake-drain-watcher` (Mac A, тик 60с, без AI) — LIVE из
  `-live/p4g-workspace-meta@16f1ec0`, грант `operator:flags:write`
  до ~17.09.
- Первый writer после handback append-only перепривязал Mac A transport к
  meta `8869029…`; PR #77 Tier-2/delta завершены. F7 review-only wake
  `5405313554` опубликован byte-exact в той же causal lineage; Mac B pending.

## Активный correction batch 24.08

- **#151 Mac A F1/F2**: backend PR #77 merged as `e5348e2c…`, Feed PR #48
  merged as `9879e3d1…`; post-merge Browser/PostgreSQL/Feed CI SUCCESS.
  Migration `0085` не live; deploy/restart заморожены до отдельного слова.
- **#151 F7**: второй явно разрешённый correction-only пакет закрыл replay
  lock-order P1; focused `94`, full suite `1718` pass, финальный Opus delta
  PASS P1/P2=0. Backend PR #78 exact head `b0119200…`, draft/CLEAN/MERGEABLE;
  image CI `32808894854` и PostgreSQL `32808894928` SUCCESS, включая
  isolated PG16 `0086` roundtrip. Обязательный cross-Mac Tier-2 review ждёт
  Mac B по wake `5405313554`; merge/migrations/deploy/restart запрещены.

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

## Очередь (операторское решение 25.08: транспорт раньше экранов)

| # | Работа | Владелец | Состояние |
| --- | --- | --- | --- |
| 1 | #151 терминал: delta-review PR #78 (head 6285a076) → merge → один rollout 0085+0086 (GO-категория live DB migration) → restart генератора на 09d12fc → физическая приёмка 5 правок | Codex A + Mac B + оператор | delta-wake застрял в transport старой bound-сессии; обход — pre-sign + byte-exact relay |
| 2 | **#136 piece 3 — первым после #151**: model-free scanner на обоих маках, exactly-once resume bound-сессий, durable pending, компактное постраничное чтение #94 + ротация control-Issue, ноль периодических AI-тиков | Codex A (+сканер Mac B) | поднят операторским решением 25.08 |
| 3 | #140 Escalation lane (отказ fast-lane → обычный тикет, один вход с телефона) | Codex A | после 2 |
| 4 | #118 slice 2 → #109 (единый список изменений, audience/lifecycle бейджи, promotion) | Codex A | после 3 |
| 5 | Researcher: R1 Queens full pack → Bus A; затем R2 #160 (запуск партий из Labs с телефона) | Mac B | после 1 |
| 6 | Mission-трек: приёмка альбома итер. 8 + карты (оператор) → коммит вижен-патчей/реестра в meta → #153 rework в implementation plan → ТЗ-дельта лестницы подарков | Fable + оператор | приёмка открыта |
| 7 | #159 Infinite favorite-mechanic stream v0 | платформа | после 2–4, приоритет оператора |
| 8 | Labs S3 (полный Labs-control с телефона) | Mac B | после 5/по приоритету |
| 9 | Polish единой партией (#136 c.5331552479, P3 #77 ×9, P3 #78 ×3, generator trust-path/порты; transport-polish входит в п.2) + census старых draft-PR | по путям | одна партия |
| 10 | Гранты: батч recall/read/analytics не подтверждён; flags до 16.09; watcher до ~17.09; Tier-B researcher (ST MCP?/AppMagic/Poki) | оператор | открыт |

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
