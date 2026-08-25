# STATE.md — текущий контрольный экран

Обновлено: 25.08.2026 (#136 transport activation STOP; прежний gate восстановлен). Не ledger;
читать первым, обновлять последним; предел — 150 строк.
**Активна заморозка деплоев/рестартов до конца операторского mobile soak.**
**Портфельная доска маховика: [FLYWHEEL.md](FLYWHEEL.md).**

## Владение и транспорт

- **Handback 21.08 (операторское решение)**: авторство платформы Mac A →
  Codex-сессия Mac A. Claude Fable удерживает portfolio/meta authority,
  STATE/checkpoint, review-участие, продуктовые контракты (Mission Slice
  v0, Researcher R0/R1) и frontier-эскалацию. Mac B: Codex, binding на
  meta `0fbce08…` (bindingDigest `f885760a…`).
- Транспорт v2 (causal lineage) боевой: полный день S1/#136 прошёл через
  wake→receipt циклы. #151 F7 получил cross-Mac delta PASS; merge, rollout
  и Generator adoption закрыты receipt `5407651598`.
- Автоматики Codex PAUSED. Новый model-free слой: launchd
  `com.p4g.intake-drain-watcher` (Mac A, тик 60с, без AI) — LIVE из
  `-live/p4g-workspace-meta@16f1ec0`, грант `operator:flags:write`
  до ~17.09. #136 piece 3: PR #175/#181 и headless-idle PR #184 merged;
  receipt contract review/CI green. Единственная свежая activation остановлена
  до POST: bridge не разобрал nested `gh --paginate --slurp` response.
  Mac A возвращён на `ec9a080…`, gate/intake healthy; bindings, Mac B и wake
  `5410446094` не затронуты. STOP receipt `5412136852`.
- Первый writer после handback append-only перепривязал Mac A transport к
  meta `8869029…`; PR #77/#78 Tier-2/delta и exact-head цепочки завершены.

## Активный correction batch 24–25.08

- **#151 Mac A F1/F2**: backend PR #77 merged as `e5348e2c…`, Feed PR #48
  merged as `9879e3d1…`; post-merge Browser/PostgreSQL/Feed CI SUCCESS.
  Backend-половина live; Feed static rollout `4e0ec0ec…` live, exact-user
  profile сохранён; diff только `index.html` + `release.json`, mechanics unchanged.
- **#151 F7**: второй явно разрешённый correction-only пакет закрыл replay
  lock-order P1; focused `94`, full suite `1718` pass, финальный Opus delta
  PASS P1/P2=0. PR #78 merged: backend master `33d147a2…`; master CI
  `32825299025/32825299055` SUCCESS. Publish `32826628556`, cutover
  `32826900075` SUCCESS; DB live на `0086`; Generator live `09d12fc…`.

## Production checkpoint (25.08)

- **backend**: master/live `33d147a2…`; publish `32826628556`, image
  `sha256:e20f9514…`, manifest `9933c1b1…`; live deploy
  `dep-da6l56qjnfac73b3ivvg`; **DB `0086_playable_rework_attention`**
  (0085+0086 по explicit GO). Флаги ON: ticket bridge, notifications,
  mobile review (+operator). Owners-available OFF (ждёт #136 piece 3).
  Deploy-id волатилен — истина в дашборде. Канонический LKG-digest брать
  ТОЛЬКО из successful publish-run (урок 20.08).
- **static**: swipe-platform `4e0ec0ec…` (feed source `9879e3d1…`, stamp
  `0d18e85`; no mechanic export, `versions.json` byte-identical). Playables
  master `6e45905d…`; exact-user profile `42692410` сохранён. Deploy tooling
  включает fail-closed build-pin PR #33; Short Drama baseline PR #34 неизменён.
  В ленте: шит dev-diff,
  клавиатурный фикс, intake-вертикаль, фикс short-drama.
- **generator**: live detached `09d12fc…`, tree `daaa9467…`;
  `SWIPE_MOBILE_REVIEW_ENABLED=1`; мост отсмотра подключён грантом
  `operator.review:write`. Очередь durable: 1 parked (Short Drama
  request). Один штатный restart 25.08, post-restart health PASS.
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
  FAIL→коррекция→delta PASS) — LIVE. Piece 3 (conditional AI wake) —
  package PR #175 после discovery + bounded N001 correction + final delta
  PASS P1/P2=0; PR #181 merged. PR #184 добавил signed mode-0600 owner receipt,
  review/CI green; activation typed STOP
  `github_transport_paginated_slurp_shape_invalid`. Полиш: c.5331552479.
- #118: reconciliation заморожен v1 (операторские решения: carrier =
  catalog, без «Команда тестирует», порядок diff-экран → promotion);
  slice 1 (read-only шит) в проде; gap-лист/словари — comment 5329395150.
- Generator polish batch (PR #49/#50), NEEDS_HELP-диспозиции #121/#112
  (среда/flake, подтверждены rerun'ами), rebind mac-b — терминальны.

## Очередь (операторское решение 25.08: транспорт раньше экранов)

| # | Работа | Владелец | Состояние |
| --- | --- | --- | --- |
| 1 | #151 терминал: физическая приёмка 5 правок | оператор | backend 0086, Generator 09d12fc и Feed 9879e3d1 live; receipt `5407846339` |
| 2 | **#136 piece 3 — первым после #151**: model-free scanner на обоих маках, exactly-once resume bound-сессий, durable pending, компактное постраничное чтение #94 + ротация control-Issue, ноль периодических AI-тиков | Codex A (+сканер Mac B) | PR #175/#181/#184 merged; activation STOP до POST на nested pagination shape; нужен отдельный parser disposition |
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
