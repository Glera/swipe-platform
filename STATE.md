# STATE.md — контрольный док портфеля

## ▶ FAST LANE PARALLEL PREPARATION v1 — DRAFT STACK READY, LIVE GO PENDING (10.08)

- Ticket [#84](https://github.com/Glera/p4g-workspace-meta/issues/84) реализован
  candidate-only стеком: generator
  [PR #27](https://github.com/Glera/swipe-generator/pull/27), feed
  [PR #30](https://github.com/Glera/feed-prototype/pull/30), backend
  [PR #62](https://github.com/Glera/swipe-backend/pull/62) и связанный meta PR.
  До 10 разных механик готовятся параллельно; source/platform head mutations
  узко сериализованы, publication/activation остаётся одной FIFO lane.
- READY получает immutable per-release candidate/review binding, durable
  original-request linkage и один READY outbox event. Русские состояния:
  «Готовится», «Готово к проверке», «Нужна помощь». In-platform review
  воспроизводит exact frozen candidate в responsive slot с autoplay, manual
  takeover, restart и terminal lifecycle; raw URL не является acceptance.
- Детерминированная матрица закрывает 10 задач, реальную одновременность,
  READY non-blocking, task-local failure, exact older-candidate identity,
  request/notification association и две service-level publication попытки с
  измеренным максимумом concurrency 1. Полные repo verify зелёные на exact
  heads; изменчивые результаты и SHA зафиксированы в execution receipt/PR.
- Один blind Claude Fable medium-effort review дал `GO_WITH_FINDINGS`: 2 P2 и
  5 P3, все семь исправлены и покрыты regressions; валидируемая диспозиция —
  `labs-fast-lane-parallel-v1-auto-review-dispositions-2026-08-10.json`.
- Live GO ещё не дан. Не выполнены merge, миграция live DB, deploy, Lab restart,
  реальные Telegram-задачи/сообщения, публикация, активация или мутация
  сохранённых releases. Two Dots `6c267c01-…`, Smash #82 и receipt-only #83
  не менялись. Exact receipt:
  `labs-fast-lane-parallel-v1-execution-receipt-2026-08-10.md`; компактный
  attended пакет: `FAST-LANE-PARALLEL-V1-LIVE-GO-2026-08-10.md`.

## ▶ SINGLE-MAC PRODUCT DEVELOPMENT LOOP v1 — LOCAL CANDIDATE READY (09.08)

- Оператор отменил модель двух равноправных development-ячеек. Main Mac —
  единственный Product Control Plane для platform/backend/feed/Labs,
  PR/merge/deploy, portfolio и `STATE.md`; Second Mac — Content Factory only
  без platform/backend authority, credentials, deploy или STATE ownership.
- Действующий контракт:
  `docs/specs/single-mac-product-development-loop-v1.md`. Исторический
  `docs/specs/two-mac-development-operating-model.md` помечен superseded;
  нижняя two-Mac запись сохранена только как audit trail.
- Routing v1 typed и детерминированный: Telegram platform change → одна очередь
  Main Mac; Labs create/copy/variation → Content Factory; content dependency на
  платформу → `NEEDS_PLATFORM_CHANGE` + linked platform-ticket. AI-router,
  quota optimizer, distributed merge queue, repo-lock/lease и общая agent
  platform запрещены.
- Реализован local default-off candidate: Telegram Mini App intake → durable
  backend request/Issue outbox → один complete GitHub Issue POST → attended
  terminal receipt `READY_TO_PLAY|NEEDS_HELP` → durable Telegram notification,
  отправляемая explicit one-shot CLI attended Main-Mac session. Оператор сам
  CLI не запускает: он надиктовывает задачу, получает terminal notification и
  открывает результат. GitHub Issues — единственная development queue;
  background runner/scheduler/subscription launcher и generic candidate builder
  отсутствуют. Stub→PATCH и genesis-comment подсистема удалены.
- Exact branch/CI authority — draft PR meta #80, backend #61 и feed #28;
  изменчивые heads и результаты не дублируются здесь. Checkpoints
  `feac852`/`337609f` не являются ancestry и остались неизменными.
- Bounded correction уменьшает transport/schema без нового lifecycle или
  authority. Physical `0075↔0076`, full repo verify, negative proof и
  один новый blind full review остаются обязательными gates; их результаты
  фиксируются в PR/output, не в authority patch до собственного review.
- Открыты только draft PR: meta #80, backend #61, feed #28. Не выполнены и не
  авторизованы: real GitHub Issue/Telegram smoke, миграция живой БД,
  merge/deploy, credentials/env/settings или runtime schedules. Они остаются
  отдельными gates после операторского решения. Exact attended
  инструкция без secrets:
  `SINGLE-MAC-PRODUCT-DEVELOPMENT-LOOP-V1-LIVE-SMOKE-HANDOFF-2026-08-09.md`.
  Content Factory и Second Mac не менялись; исходный dirty workspace не
  затронут.

## ▶ FIX MUTATION PIPELINE v0 ЗАВЕРШЁН: GO FAMILY A (09.08)

- Ticket [#78](https://github.com/Glera/p4g-workspace-meta/issues/78)
  реализован candidate-only PR-ами: [UGC #7](https://github.com/Glera/swipe-ugc/pull/7)
  влит как `8cd1e859`, затем
  [Generator #26](https://github.com/Glera/swipe-generator/pull/26) после
  проверки против нового UGC master влит как `adea2c8a`. Meta closure —
  [PR #79](https://github.com/Glera/p4g-workspace-meta/pull/79). Production,
  catalog, roster, feed, live factories, deploy, credentials, migrations и
  live Lab не менялись.
- Один bounded request теперь приводит exact repo/ref/commit/root-tree/
  source-tree к существующим technical/build/action-trace/visual-proof,
  повторно проверяет remote CAS у write boundary и materialize-ит только в
  новых marker-gated roots. Dirty, hidden-index, stale, missing, mismatched,
  non-descended и out-of-bounds identity fail closed; DSL/координатор/UI не
  добавлены.
- Golden TD-O2 повторён новым путём без ручных UGC/Generator правок:
  `orthogonal-link-v1-td-o2-d213b0e79592`, runtime `sha256:1f00d79a…`,
  canonical trace `sha256:2c67fc7f…`, pack `sha256:c9e36be8…`. Два локальных
  и два reviewer replay дали byte-identical UGC/Generator roots и сохраняют
  `publicationEligible=false`, `catalogEligible=false`,
  `feedEligible=false`, `review=null`.
- Статья N устранена как ручная cross-repo работа: `34m48s → 0`; консервативно
  с unattended compute — `34m48s → 1m57s` (`−94.4%`). Один blind Claude Fable
  max-effort review exact patch дал **GO, P1/P2 нет**; семь P3 записаны без
  исправлений по ticket contract.
- Exact-head CI зелёный: UGC
  [run 31334153902](https://github.com/Glera/swipe-ugc/actions/runs/31334153902),
  Generator
  [run 31334153674](https://github.com/Glera/swipe-generator/actions/runs/31334153674)
  с полным `npm run verify` и pinned experiment-worker closure; root docs
  локально 166/166. Generator CI штатно использует два UGC checkout: current
  factory content и immutable worker `70f50d4`; локальный запуск с одним
  sibling не воспроизводит эту матрицу и не является acceptance failure.
- После UGC merge полный Generator verify на Node `24.14.0` против
  `UGC master@8cd1e859` + historical worker `70f50d4` прошёл 762/0/6;
  reciprocal UGC worker suites прошли 29/29. Generator merge tree совпадает с
  reviewed `333d69c`.
- Durable receipts:
  `labs-fix-mutation-pipeline-v0-execution-receipt-2026-08-09.md` и
  `labs-fix-mutation-pipeline-v0-claude-review-receipt-2026-08-09.md`;
  bounded merge packet —
  `labs-fix-mutation-pipeline-v0-merge-packet-2026-08-10.md`.
  Frozen terminal decision: **`GO FAMILY A`**; Family A в этой цели не
  запускалась и требует отдельного контракта.

## ▶ TWO-MAC DEVELOPMENT MODEL ЗАФИКСИРОВАН; АВТОМАТИЗАЦИЯ НЕ НАЧАТА (09.08)

- Целевая схема: две рабочие ячейки, на каждой Claude + Codex. Mac A владеет
  Product Platform/portfolio; Mac B — Playables/Labs/Engineering OS. Авторы
  тикетов ротируются, line owner и merge-authority фиксированы.
- Три review tier: prototype/content dogfood без модельного review; bounded
  platform/Labs code — один cross-provider раунд на том же Mac; core/shared
  authority — cross-Mac frontier review, exact-head CI и требуемый operator GO.
- Локальные и `wip/*`-ветки остаются разрешены без тикета. Durable ticket
  становится обязательным перед PR/candidate, cross-Mac handoff, merge или
  deploy; существующая ветка импортируется без пересоздания.
- Живой Lab остаётся на Mac A из detached master; код/merge generator — Mac B.
  `swipe-agents` остаётся no-LLM production ops и не смешивается с Engineering
  OS. Repo-lock, merge queue и quota optimizer в v1 не строятся.
- Authority: `docs/specs/two-mac-development-operating-model.md`. Исполняемый
  handoff: `TWO-MAC-DEVELOPMENT-OPERATING-MODEL-HANDOFF-2026-08-09.md`.
- Первый полезный vertical после отдельного GO: mobile platform ticket →
  GitHub Issue → Mac A implementation + Tier 1 review → единая
  READY_TO_PLAY/NEEDS_HELP очередь → операторский наигрыш.

## ▶ MECHANIC-VARIATION THROUGHPUT AUDIT ЗАВЕРШЁН: FIX MUTATION PIPELINE (09.08)

- Двухчасовой telemetry-spike остановлен с `YES` через 11m42s; выбран exact
  `orthogonal-link-v1@cb581e7`. Baseline, config-control и три независимые
  Level-2 мутации (`obstacle`, `additional_goal`, `delayed_reward`) получили
  одинаковый real-pointer trace, strict technical/build и visual-proof.
- Итог: `X=1.267` active agent-equivalent hours, `Y=$0` marginal cash и 0
  remote CI runs, `Z=59m17.171s`, `V=4/4` changed candidates и `3/3` Level-2.
  Полный exact receipt:
  `labs-mechanic-variation-throughput-audit-execution-receipt-2026-08-09.md`.
- Единственный `N` — mutation packaging/admission: дешёвые валидные правила
  потребовали ручной audit-only сборки в `swipe-ugc` и `swipe-generator` вне
  exact playable. Первый Claude review нашёл same-tree P2; delta-review после
  fail-closed исправления дал `GO` без P1/P2.
- Пять записей materialized только в новых marker-gated local roots; у всех
  `publicationEligible=false`, `catalogEligible=false`, `feedEligible=false`,
  `review=null`, byte-stable replay. Production, catalog, roster, feed,
  deploy, backend и DB не менялись; candidate/audit branches не одобрены к
  product merge.
- Frozen terminal decision: **`FIX MUTATION PIPELINE`**. Family A не запускать.
  Следующий отдельный scope — mechanism-agnostic candidate path с server-side
  git identity verification; вернуться к Family A только после повторения этих
  записей без audit-specific cross-repo assembly.

## ▶ FAST LANE INTAKE ИСПРАВЛЕН; TWO DOTS UPDATE LIVE (07.08)

- Первый полный `add` прошёл одним release
  `9869f144-894f-4b12-bba8-69fb9ebf15b2`: exact source
  `playables@1ac40a2`, strict technical profile, HTTPS candidate, одно
  Telegram-подтверждение, static publish, server-owned mapping create и CAS
  roster activation. Новый activation `5671e39c-…` содержит 17 entries;
  `orthogonal-link-v1-swipe` стоит на позиции 8 сразу после Klondike.
- Production manifest `f20e9017…`, runtime digest `sha256:8a7cda5b…`; HTML,
  payload и обе covers отвечают 200 и совпадают с frozen bytes. Telegram LIVE
  notification доставлен как message id `50`.
- Candidate был готов за 1m06s, после approval до LIVE — 30s; полный wall time
  19m23s включал 17m46s ожидания оператора. Подробный receipt:
  `labs-fast-lane-two-dots-add-dogfood-receipt-2026-08-07.md`.
- Точечный intake fix влит Generator PR #25 (`8c9b4ad`): source-agent разрешает
  source только из detached `origin/master`, читает стандартный
  `test:<sourceId>:technical`, а исключение до/вокруг agent-run получает
  durable FAILED journal и безопасную `blocked`-проекцию вместо бесконечного
  локального лога. Opus delta-review — GO; exact-head CI зелёный после одного
  `rerun --failed` известного polling-flake.
- Сохранённый мобильный request `098ac28e-…` продолжен без пересоздания.
  Первый candidate-edit честно остановил real-pointer browser test и показал
  `! Нужна помощь`; recoverable retry прошёл technical/build/visual proof,
  запушил `playables@cb581e7` и выпустил release `0231edce-…`.
- Update LIVE: `swipe-platform@ff613f2`, manifest version `260f3f1281`, runtime
  digest `sha256:476e0bb8…`, request закрыт тем же release receipt
  `e4ca6e29…`; Telegram completion доставлен как message id `54`. Следующая
  точка — операторский gameplay smoke увеличенной сетки/точек в свежем Mini
  App-сеансе.

## ▶ DOGFOOD VALIDATION ВЛИТ; SORTING ЗАВЕРШЁН (07.08)

- Fast Lane теперь явно разделяет проверки: technical safety всегда blocking,
  gamefeel внутри versioned bounds мягкий для `exact-user` dogfood. Действие
  «Открыть всем» остаётся отдельным будущим release с полной gamefeel-приёмкой;
  универсального bypass тестов нет.
- Playables PR #11 влит как `7358e9b`: Sorting сохраняет прежние 20 technical
  checks; Minesweeper/Arrows получили отдельные неиспаряемые input suites;
  presentation/layout остаются отдельно запускаемым gamefeel. Generator PR
  #23 влит как `bcbe937`: source-agent и release preparation симметрично
  используют `:technical`; exact-head CI PASS (`31191376316`, 7m33s).
- Два независимых Claude Fable прохода дали GO. P2 про real hit-testing и
  release-stage broad suite закрыты; финальный P2 про зелёный пустой
  `--test-name-pattern` закрыт переносом input checks в отдельные файлы.
- Целевая Sorting-настройка `2/3` до retry прошла technical 20/20 и реальный
  visual proof: win без page errors за 46s против 25s до правки, в пределах
  90s harness cap.
- Тот же request `01aaf0e3-…` recoverable-reset без нового ввода. Source-agent
  изменил один tuning-файл, technical/build/visual-proof PASS и запушил
  Playables commit `40ef388b`. Release `aae4ffbd-…` в
  дошёл до LIVE; последующий Sorting request также завершён и не держит
  публикационный слот.

## ▶ FAST LANE: BLOCKED-СТАТУС LIVE, ЖДЁТ MOBILE SMOKE И RETRY (07.08)

- Для автоматической доработки механики введена durable остановка `blocked`:
  в Mini App правая кнопка становится янтарно-красной **`! Нужна помощь`**,
  по нажатию показывает исходную просьбу, безопасную краткую причину и факт,
  что изменение не опубликовано. Первый переход best-effort отправляет то же
  уведомление в `swipe_it`; badge остаётся надёжным fallback.
- Исправленный supervisor не держит очередь: failed-задача проецируется в
  backend, следующая может исполняться. Recoverable retry архивирует journal и
  visual proof, возвращает тот же request в `accepted` и продолжает без новой
  задачи и без ручного нажатия в Labs.
- Независимый Claude Fable 5 delta-review: **GO**, P1/P2 нет. Review receipt:
  `labs-fast-lane-blocked-status-review-receipt-2026-08-07.md`; продуктовый
  контракт дополнен в `docs/specs/lab-playable-release-fast-lane.md`.
- Проверенные исходники влиты: Playables PR #10 → `affe8acd`, Generator PR
  #22 → `e3f9601`, Feed PR #27 → `d9cbafc`, Backend PR #60 → `bbc8026b`.
  Backend exact-head CI: image + full PostgreSQL acceptance + 24 migration
  roundtrip + reverse drift PASS; Feed exact-head CI PASS.
- Rolling rollout завершён до ручной точки наблюдения. Backend image
  `sha256:3d2889a6…` задеплоен run `31188304631` как Render deploy
  `dep-d9quqaqd0e5s73b5u01g`; coordinator PASS подтвердил миграцию
  `0074→0075` и verification job. Feed `d9cbafc` опубликован в
  `swipe-platform@54af248`, его live bytes совпали. Generator-writer live на
  `e3f9601` с сохранённым data-root.
- Контур подтверждён живыми Sorting и Two Dots retry: безопасное уведомление,
  detail-popover, архив failed-attempt, повтор **того же** request без нового
  ввода и последующий LIVE release. Durable rollout receipt:
  `labs-fast-lane-blocked-status-rollout-receipt-2026-08-07.md`.

## ▶ PROTOTYPE DEPLOY БЕЗ ПУСТОЙ ОПЕРАТОРСКОЙ КНОПКИ (07.08)

- Оператор снял обязательное финальное ручное нажатие для штатного обратимого
  deploy проверенного `master`: если исходная задача уже просит
  обновить/опубликовать результат, frontier-владелец после CAS+CI запускает
  один существующий workflow и наблюдает terminal result. Миграции, секреты,
  env/permissions, инфраструктура, destructive acts и rollback остаются за
  отдельным операторским authority.
- Текущий Render API key сохраняется как переиспользуемый prototype deploy
  credential в GitHub environment `production`, ограниченном веткой `master`;
  удаление после каждого обновления больше не является частью процесса.
  Ротация — при утечке/смене доступа либо перед живой аудиторией.
- Решение сразу проверено живым релизом: workflow `31181127806` один раз
  задеплоил backend `030ddb3` в Render deploy
  `dep-d9qth1qjnfac73e6ic1g`, coordinator receipt PASS, image
  `sha256:859eb260…f948`. DB migration не потребовалась. Новый
  `notify-live` route отвечает штатным auth-отказом `401`, а не прежним
  `404`. Generator PR #21 влит как `fb84936`, живой Lab перезапущен на этой
  голове под Node 24 и отвечает health PASS. Следующая приёмка — одна новая
  задача из Telegram до LIVE и получение финального сообщения в `swipe_it`.

## ▶ LABS FAST LANE ДЛЯ PLAYABLE — АВТОМАТИЧЕСКИЙ КОНТУР В РАБОТЕ (06–07.08)

- Оператор утвердил целевой UX first-party прототипов: существующая механика
  обновляется через Labs за 5–10 минут, новая добавляется за 15–20 минут;
  operator touchpoints — один exact Telegram Approve и наблюдение в Mini App.
- Git остаётся audit/rollback под капотом; GitHub, terminal, Render-ключи и
  backend deploy не входят в обычный content-only release.
- Обе обложки пересобираются по умолчанию; update не меняет mapping/roster,
  add после live static verification одним plan создаёт identity/mapping и
  CAS-активирует roster. Цель — одно открытие Mini App.
- В ТЗ добавлена mobile-first петля: operator помечает exact живую механику с
  телефона, отправляет instruction в существующий flags/rework контур, играет
  HTTPS candidate и тем же Telegram exact action принимает release. В v0 Mac
  остаётся вычислителем; offline-запрос ждёт подключения Labs, cloud IDE/farm
  вне scope.
- Authority двух сценариев —
  `docs/specs/lab-playable-release-fast-lane.md`; автоматический handoff из
  Telegram, source-agent и lifecycle фабрик реализованы и описаны в
  том же authority; review —
  `labs-fast-lane-automation-review-receipt-2026-08-07.md`. Последний
  незакрытый live-smoke — доставка Telegram-сигнала после перехода exact
  release в LIVE; backend и локальный notifier для него развёрнуты 07.08.

## ▶ ФАБРИКИ В MASTER И ЖИВОМ LAB; LEGACY SERIES ORDER ЗАКРЫТ (06.08)

- Klondike feed-пакет доведён до merge после bounded review Claude Opus 5
  через подписочный CLI. Первый проход нашёл один P1: обязательный cover-guard
  ошибочно охватывал legacy-механики со standard card. Scope исправлен до
  трёх явных custom-cover рецептов; delta-review — **GO**, P1/P2 нет.
  Backend PR #57 влит как `ad65ac5`, feed PR #22 — `1c4a221`, playables PR
  #7 — `3f17df6`; exact-head CI всех трёх зелёный. Серии теперь fail-safe:
  неизвестная механика получает 1 игру, `arrows-v1` явно сохраняет 5.
  Статика опубликована в production как `swipe-platform@feb982d`: feed,
  оба playable и четыре cover-файла отвечают HTTP 200 и побайтово совпадают
  с git. Backend release packet `klondike-backend-release-packet-2026-08-06.md`
  на `2b37a9e` прошёл независимый Opus 5 review — **GO**. Phase 1 завершена
  одним dispatch без Render authority: run `31101029853`, attempt 1, PASS;
  manifest `3c74aa6f…`, immutable candidate `sha256:32a6eca8…`. Artifact
  принят 27 exact-проверками, durable receipt —
  `klondike-backend-phase1-image-publication-receipt-2026-08-06.md`. GO
  израсходован; следующий акт требует отдельного разрешения на bounded
  credential preparation и `prepare-source`, затем отдельно deploy и
  Composer mapping/activation Klondike.

- Legacy `series_order_corrupt` закрыт без переписывания immutable-данных:
  чтение различает текущую и durable generation-verification. Изменение
  прошло независимый Claude Fable review (**GO**) и влито в
  `swipe-generator/master` через PR #12, merge
  `5d81c75a4740ebe5b009ad55d9a16561b554b712`; все три исторические записи
  снова читаются полной проекцией.
- Сохранённый WIP «Фабрики» `wip/live-checkout-2026-08-05@a7b5891`
  поднят, сведен с master и доведён до релиза. Независимый review нашёл три
  P2 (replay до compose, честность Arrows receipt, невмешивающийся background
  poll); все закрыты red-then-green. PR #13 влит merge-коммитом
  `e63767f260b443fa1ef31b166c4945a4d5bb539f`, exact-head CI зелёный,
  delta-review Claude Fable — **GO**.
- Живой Lab работает из чистого detached checkout
  `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-live`.
  Визуальный smoke страницы «Фабрики» PASS: доступны Сортинг и Стрелочки,
  показываются 9 sort-фабрик и 1 arrows-фабрика, error-панели нет;
  `/v1/series-orders?mode=summary` возвращает 25 записей без
  `series_order_corrupt`.
- Во время первого рестарта обнаружен дефект installer-а: три операционных
  env не переносились в новый LaunchAgent. Реальные `.data` не менялись;
  сервис сразу возвращён на прежний data-root. Durable fix прошёл отдельный
  независимый review (**GO**) и exact-head CI, влит через PR #14, merge
  `d8619d328e148b46d09ee6b170c95df175678887`. Обычный повторный
  `service:install` доказал сохранение data-root, platform origin, deploy
  manifest и catalog endpoint; финальный HTTP smoke PASS.
- Dirty checkout оператора не тронут. Неблокирующие P3 сохранены в review:
  старые dev-only Arrows receipts, узкое окно уже начатого poll и усиление
  source-contract тестов; живой контур они не блокируют.
- Minesweeper update + полный Klondike прошли три независимых Claude Fable
  review-раунда: два P2 сохранения/автоплея исправлены двухсессионными
  browser-тестами, финальный exact-head verdict — **GO**, findings нет.
  Playables PR #6 влит merge-коммитом
  `c54573c917f341a8489461c2349b86eb2d43dcdd`; reviewed source-head
  `bc9ba0728e4761cd3ca87f11f6794f8e5f586f7a`. Klondike: 23 unit + 3
  browser + 39 runtime PASS; Minesweeper regression suite и оба swipe-build
  PASS. Feed `b1a9e63` прошёл preflight (локальный fixture-drift объяснён
  dirty backend checkout; его bytes совпадают с `backend/origin/master`).
  Следующий акт — один operator-run `deploy-swipe.sh minesweeper-v1
  solitaire-v1`; production manifest и roster пока не менялись.

## ▶ ПЛАТФОРМА ВОССТАНОВЛЕНА; MINESWEEPER В ЛЕНТЕ (06.08)

- Это верхний актуальный срез; более ранние дневниковые записи ниже остаются
  историей и не переопределяют его.
- Variant B завершён по reviewed v4 route. Durable receipt:
  `platform-reliability-variant-b-phase3-deploy-receipt-2026-08-06.md`.
- Production backend: exact candidate image из backend `0e9e940`, deploy
  `dep-d9q1vo7avr4c73akv7k0` live. Public health PASS.
- DB verification job `job-d9q202e1egvs73d5bdbg` succeeded на exact команде
  `verify-applied-db`: committed release receipt и revision
  `0073_platform_release_receipts` доказаны pinned-кодом, а не run-status.
- Phase 2/3 были ровно двумя dispatch: `31074614067` prepare-source и
  `31075139056` deploy; оба exact head `0e9e940`, attempt 1, success. Retry и
  rollback не было.
- Terminal cleanup PASS: временный Render key отозван и даёт 401; GitHub
  environment secrets пусты; holder удалён; шесть non-secret release variables
  сохранены. Render 2FA enabled.
- Reviewed Minesweeper-пакет исполнен: active roster содержит 15 entries,
  Minesweeper стоит на позиции 5 после Arrows; activation
  `837fdee2-6d6f-4676-9080-2ad4d7434c57`.
- Наблюдаемая приёмка PASS: оператор увидел и сыграл Minesweeper; telemetry
  фиксирует `unit_shown` на `feed_pos=4`, first input, manual wins и
  `series_complete` без `roster_entry_unavailable`/`roster_fallback`.
  Durable receipt:
  `minesweeper-feed-roster-execution-receipt-2026-08-06.md`.
- Recovery-контур на этом заканчивается. Эталон mechanic onboarding принят:
  reviewed mapping apply → Lab Composer preview/diff/CAS activation → два
  запуска Mini App. Ручные roster JSON/UUID и три отдельных GO остаются только
  bootstrap-историей. Backend guide влит PR #56 (`3328858`), Composer docs и
  honest lost-response recovery — generator PR #10 (`1257aa7`); независимый
  Claude verdict — GO, receipt
  `mechanic-onboarding-standard-claude-review-2026-08-06.md`.
- Локальный Lab/Composer восстановлен: versioned Node `24.19.0`, launchd
  использует `/usr/local/opt/node@24/bin/node`, production manifest source
  `https://swipe-platform.onrender.com/versions.json`, preview origin явно
  пинится на `https://swipe-platform.onrender.com`; status/state проецируют
  active Minesweeper roster. Шаблон следующего пакета:
  `docs/mechanics/FEED-ONBOARDING-PACKET-TEMPLATE.md`.
- Credentials и прочие core-authority actions исполняет оператор. Штатный
  обратимый prototype deploy проверенного `master` после решения 07.08 может
  запускать frontier-владелец без отдельного ручного клика; Codex проверяет
  CAS/CI, запускает один раз, наблюдает и фиксирует receipt.

## ▶ CODEX ПРИНЯЛ FRONTIER-ОРКЕСТРАЦИЮ (05.08, вечер)

- Оператор передал Codex владение маршрутом, реализацией, коммитами и
  финальной приёмкой до наблюдаемого результата: backend master в production,
  БД на `0073`, Minesweeper виден и играется в ленте.
- Процесс возвращён к двухконтурной норме `CLAUDE.md`: инфраструктура
  заканчивается после этого результата; следующий приоритет — механики и
  game feel, а не дальнейшая достройка recovery-церемоний для нулевой
  аудитории.
- Claude сохраняется как независимый ревьюер только в двух осмысленных
  точках: один delta-review production deploy/migration-пакета и один review
  mapping/roster/CAS-пакета перед активацией. Дополнительные раунды возникают
  только при новой существенной находке или изменении executable authority.
- Gate C0 окончательно снят с критического пути. Текущий маршрут — Variant B:
  publish image → prepare-source → exact GET-only projection → deploy.
  Редакция 3 в
  `platform-reliability-variant-b-deploy-slice-v3-2026-08-05.md` получила
  независимый Claude **GO** на exact bytes `269c0400…0f69` против backend
  `0e9e940`; новых P1/P2 нет. Последняя read-only сверка поймала одну
  исполнимую формальность: GitHub `workflow_dispatch.ref` — branch/tag, поэтому
  Phase 1 уточнена до `ref=master` с непосредственным CAS
  `master==0e9e940`; Claude дал **delta-GO** на exact commit `12408b3` и
  подтвердил, что post-run `head_sha`/manifest binding не ослаблены. Dispatch
  и Render mutation ещё не выполнялись; следующий акт — отдельный operator GO
  на Phase 1 image publication без Render authority.
- Короткий путь Minesweeper подтверждён на локально восстановленном
  production dump: mapping → roster register → CAS activation проходит без
  ontology activation и второго backend deploy. Пакет обновлён в
  `minesweeper-feed-roster-packet-2026-08-05.md` и получил независимый Claude
  **GO** на meta `330fb4f` против backend `0e9e940`, feed `c1681d8` и
  swipe-platform `12033fa`; все identity/digests/CLI/CAS воспроизведены.
  Production writes ещё не выполнялись.
- Pending preview `exe-d9pg7s3m8hqs73fguv80` не одобрять никогда.

## ⇄ ХЭНДОФФ FRONTIER-ОРКЕСТРАЦИИ → Codex Sol (05.08 ~19:00)

Claude-клиент повторно даунгрейдит эту сессию на Opus вопреки пину модели.
Оператор переносит роль frontier-оркестратора на Codex Sol (frontier). Роль
вниз (Opus) НЕ передаётся. **Первым читать:
`HANDOFF-FRONTIER-ORCHESTRATION-2026-08-05.md`** — там операционная выжимка
по всем 5 контурам, открытая петля (frontier-ревью NO-GO среза B v2 +
встречное возражение по ontology сапёра, ждёт ответа хаба/R1-A) и
методические правила. Затем этот STATE целиком.

## ▶ ОРКЕСТРАЦИЯ АКТИВНА (пауза снята 05.08 ~18:30)

Разбор смен модели: лимиты НЕ исчерпаны (запас и по Fable, и по неделе) —
даунгрейды делала автоматическая пооходовая оценка задач клиента
(«safe routine coding»), не квота. Исправлено: модель ЗАПИННЕНА в
~/.claude/settings.json ("model": "claude-fable-5") — эвристика больше
не выбирает. Правило остаётся навсегда: подписи/GO/приёмки — только на
Fable; recovery платформы НЕ является «routine coding» (несущая часть —
суждение и ревью, а не нажатия; записано в память и AGENTS.md).

**Снимок вахты (что ждём / от кого / что делает frontier по приходу):**
1. Деплой-манёвр: обновлённый срез B (3 dispatch, полные inputs, terminal
   cleanup, пин ref) — от хаба → frontier: сверка правок с 6 findings
   R1-A. Затем сапёр-пакет (P1-3) — от R1-A → ревью хаба. Затем
   delta-проход R1-A → frontier+оператор: двойной GO на три dispatch.
2. Lab-интеграция mobile-review: фиксы 2 P2 + компактный пакет — от
   «SwipeIt development» → независимое ревью R1-A → frontier: подпись
   merge, согласование рестарта :4317 с оператором.
3. Секрет SWIPE_BACKEND_DEPLOY_KEY — отдельная запущенная сессия ведёт
   оператора; по завершении отметить в follow-ups Lab.
4. После Lab-интеграции: комнаты этап 1 (ТЗ готово:
   docs/lab-rooms-stage1-tz-2026-08-05.md) — запустить исполнителя.
5. Прочее без изменений: Stage 2 P4G за гейтом деплой→0074; макеты
   сезона ждут отсмотра оператора; feed-sequencing запаркован.

Возобновление: оператор пишет «продолжаем» на Fable-сессии → начать с
чтения этого снимка и входящих от исполнителей.

Правила: каждая оркестрирующая сессия читает этот файл первым и обновляет
последним. Один владелец на контур; смена владельца — только через письменный
хэндофф. Режим процесса — два контура (преамбула `CLAUDE.md`). Необратимые
акты — вторая подпись (оператор или frontier-сессия). Роли моделей —
`AGENTS.md`. Это изменчивый статус-док, не ledger.

## Активные контуры (лимит: 2 продуктовых + 1 фоновый)

### 1. Деплой-манёвр R1/R1-A
- Владелец: хаб-сессия «Видение продукта: Play for Good» (Opus) +
  исполнители R1 и R1-A (Codex №1).
- Цель-граница: «master деплоится, сапёр виден в ленте». После неё — стоп
  достройке Gate-механики, финальный хэндофф, закрытие сессии.
- Вторая подпись обязательна: вливание исключений merge-freeze, Gate C0,
  cutover. (Ручной догон БД `0070→0072` ОТМЕНЁН 04.08: патч A законно
  восстановлен в форме exact-пин `0070` — поправка `56c4c93`.)
- Факты 04.08: прод-бэкенд `09fa0cd` (01.08), БД `0070`; freeze
  `#26/#48/#33/#30/#25` + отложенная `0074`; патч B — GO с P2 (meta PR #57,
  R1 дописывает мутационные тесты до вливания); патч C — за R1-A. Критичная
  деталь патча C: GitHub var `RENDER_BLUEPRINT_ID` и константа
  `scripts/platform-release-coordinator.py:47` меняются ОДНИМ шагом между
  терминальным C0 и финальным master (`HANDOFF-P4G-STAGE1-2-2026-08-04.md` §4).
- Прогресс поздний вечер 04.08: R1 закрыл P2 (PR #57, exact head `578366c`,
  focused 8/8 + exact-head CI PASS) — ждёт diff-only re-review хаба; R1-A
  выполнил GitHub preflight (environment + 5 vars, PR #58 head `9095892`,
  патч C = один bounded post-C0 шаг) — ждёт re-review. Флажок «патч A»
  разобран 05.08: нарушения нет — хаб отозвал собственное возражение в
  переписке, не перенеся в артефакт (поправка `56c4c93` + правило «решение
  не изменено, пока не изменён артефакт»).
- 05.08: оба re-review — GO (PR #57: мутации 8/8 fail, P2+P3 закрыты;
  PR #58: входы сверены с константами координатора пофактно). Вторая
  подпись на вливание патча B ДАНА frontier-сессией после независимой
  проверки (head `578366c`, MERGEABLE, состав только meta, CI verify
  success). **Патч B ВЛИТ** 05.08 06:33 UTC (merge `a2ecde3`).
- 05.08: патч A (swipe-backend PR #55, DO NOT MERGE, head `6c78147`) —
  вердикт хаба **GO с двумя P2**: границы `acceptedRevisions` не связаны с
  графом миграций ни сверху (`accepted[-1] != target` нагружена, но не
  проверена — сборка требует только `target <= code_max`; сценарий
  срабатывает сразу после деплоя при входе `0074`), ни снизу (нижняя
  граница не связана с `expectedPredecessor`). Метод: независимый вывод
  10 мутаций из дифа ДО чтения карты исполнителя + параллельные
  адверсариальные линзы; 4 инертные мутации корректно списаны на
  вышестоящий `_validate_manifest_shape` (защита в глубину, не дефекты).
  Ход за R1-A: оба P2 в `build_manifest` + `_verify_manifest_payload` +
  два теста → diff-only re-review → вторая подпись на вливание вторым
  исключением заморозки. Следующие шаги: патч A → перепривязка PR #54 →
  Gate C0 → патч C → публикация образа → деплой.
- 05.08 (позже): re-review патча A — **GO** (head `9eebe3b`): 4 новых
  инварианта мутационно держатся в обеих точках, регресса нет; P2 №1
  хаб ретрактировал как собственную ошибку с опубликованным механизмом
  («инертность мутации ≠ недостижимость проверки — второй вопрос задавать
  отдельно»); добавленный инвариант оставлен как защита в глубину. CI
  28/28 на точной голове, MERGEABLE/CLEAN, состав — только
  `platform_release` + тесты + спека. **Вторая подпись на merge PR #55
  ДАНА frontier-сессией.** Далее: merge → перепривязка PR #54 → Gate C0
  (attended-окно: RENDER_API_KEY оператора) → патч C одним шагом → образ →
  деплой.
- 05.08: **Gate C0 ОСТАНОВЛЕН ДО СТАРТА** — при чтении source SHA в
  дашборде нажат Manual sync: создан pending preview
  `exe-d9pg7s3m8hqs73fguv80`, перезаписан одно-слотовый `lastSyncAt`
  (потеряна возможность переподтвердить неиспользование утёкшего хука
  наблюдением). Ни одно необратимое действие окна не выполнено; прод
  `09fa0cd`/`0070`, PR #54 не влит, заморозка в силе. Халт-оценка хаба:
  `platform-reliability-r1-gate-c0-halt-assessment-2026-08-05.md`
  (meta `3e00c87`). Решения (уточнено разведкой 05.08): кнопки Reject в
  Render НЕТ — отказ = бездействие; preview достижим только по прямому
  URL (/sync/ ед. число), Auto Sync = No, сам не применится; содержимое
  зафиксировано (ss_87847bypj: 8 изменений = контракт R1-A на 0e9e940).
  **Оператор закрыл вкладку 05.08 — экспозиция preview снята** (сам
  preview остаётся pending и достижим только по прямому URL; Approve не
  нажимать, если когда-либо открыт). Замещающее доказательство
  неиспользования хука собрано и двойно подтверждено
  (render-hook-nonuse-observation-2026-08-05.md + сверка хаба `c9015e7`:
  якоря сходятся с git до 3 секунд). Corrective-пакет пишет R1-A
  (5 требований хаба + frontier: замещающее доказательство из истории
  deploys/events провайдера за 30.07→05.08; read-only путь к source SHA
  через API; правило «дашборд: сначала скриншоты, ноль кликов»); прежний
  GO на C0 СГОРЕЛ — новое окно только с новым двойным GO.
- 05.08 (день): **corrective-пакет получил независимый GO** (168/168 PASS,
  блокеры R3 закрыты, прод/Blueprint не тронуты; пакет локально в
  /private/tmp/p4g-gate-c0-corrective-20260805/). Frontier: разрешение на
  commit/push/meta-PR дано; шаг «ответ Render Support о семантике хука»
  предложено снять с критического пути (non-use доказан, семантика
  зафиксирована эмпирически, хук умирает со старым Blueprint). Временный
  Render API ключ corrective-работ — оператору отозвать. **На оценке у
  хаба вариант C0′ «сборка сбоку»** (create-alongside вместо delete-first:
  новый Blueprint из того же отревьюенного контракта + restore дампа +
  repoint клиента; отпадают необратимость, 60-мин лимит и вопрос хука;
  добавляются repoint/ре-ввод секретов/двойная оплата на дни) — вопрос
  оператора «не проще ли собрать заново, аудитории нет»; решение за
  оператором после сравнения хаба.
- 05.08 (день): сравнение хаба опубликовано
  (`platform-reliability-completion-variants-2026-08-05.md`, meta
  `7bb4772`): **Gate C0 не лежит на пути к деплою** (координатор пинит
  живые ID, деплой = переключение на image digest) — C0 был нужен только
  для убийства хука, срочность которого сняли доказательства. C0′
  отклонён (fromDatabase → новая пустая база; смена service ID = больше
  перепиновки). **РЕШЕНИЕ ОПЕРАТОРА: вариант B подтверждён** — деплой
  сейчас, хук ретирится потом отдельной задачей. Принятый риск записан:
  хук жив (неиспользован, Approve-only, AutoSync off), дрейф «образ vs
  render.yaml» до ретирования; preview НЕ одобрять никогда. Параллельный
  вопрос Render Support: ротация Sync Hook без замены Blueprint (не
  блокирует). Ход хаба: деплой-срез B → один раунд ревью маршрута →
  новый двойной GO → исполнение.
- 05.08 (день): **деплой-срез B опубликован** (meta `4bfd38d`,
  `platform-reliability-variant-b-deploy-slice-2026-08-05.md`): 3 фазы,
  ноль необратимого до единственного deploy POST; образ публикуется без
  Render вообще; RENDER_BLUEPRINT_ID задаётся сейчас значением живого
  Blueprint. Frontier принял срез как основу; ревьюер — R1-A (автор ≠
  ревьюер), к вердикту три условия frontier: (1) rollback прочитать по
  коду + LKG-образ == реально работающему в проде; (2) критерий «сапёр
  виден» перенести после регистрации в ростере (у оператора активен
  серверный ростер без сапёра), 3.2 не ждёт 3.1; (3) 0074 вливается
  первой из разморозки. После вердикта — двойной GO (frontier +
  оператор), до него ни одного диспатча.
- 05.08 (вечер): все 4 условия frontier закрыты хабом фактами (2 вскрыли
  его ошибки: LKG на 25 коммитов ВПЕРЕДИ прода — rollback не возвращает
  текущее; ростер без сапёра; 2 закрыты в его пользу: rollback-gate по
  построению принимает 0073, деталь — перед откатом переустановить
  PLATFORM_ROLLBACK_AUTHORIZATION_*). Затем **ревью R1-A: NO-GO** —
  4×P1 (пропущен обязательный prepare-source: маршрут = ТРИ dispatch со
  STOP-порядком промежуточного состояния; неполные workflow inputs,
  включая publish=true, без которого образ не публикуется; «сапёр в
  ростер» не исполним без mapping/ontology/roster/activation-пакета;
  нет terminal cleanup и STOP-веток сбоев) + P2 (непиннутый workflow
  ref) + P3 (merge×6). Точные inputs фазы 1 выданы и подтверждены.
  Ходы: хаб правит срез (P1-1/2/4, P2, P3); R1-A параллельно готовит
  исполнимый пакет «сапёр в ростер» (P1-3) под ревью хаба; delta-проход
  R1-A → двойной GO. Исполнений нет.
- 05.08 (утро): **патч A ВЛИТ** (merge `0e9e940`, дерево == дереву
  проверенной головы `9eebe3b` — 28 зелёных прогонов покрывают master
  точно). Перепривязка подготовлена R1-A локально и отревьюена хабом по
  git-объектам: **GO по обеим половинам** (backend PR #54 кандидат
  `739d5b7`, meta PR #58 кандидат `23f22fe`); один P3 — семантика
  `baselineSourceSha` (решение: записать текстом, кандидата НЕ менять).
  **Вторая подпись на два force-with-lease ДАНА** (dd250d0→739d5b7,
  9095892→23f22fe; головы сверены). После пуша: CI на новых головах →
  отдельная подпись на Gate C0 — первый шаг, который дойдёт до прода.

### 2. Портфель + P4G (Stage 2 готов к переприоритизации)
- Владелец: frontier-сессия (Fable).
- Прежний технический гейт по `0074_append_only_truncate_guard` закрыт
  последующим rollout, дошедшим до `0075`; Stage 2 больше не считается
  заблокированным миграцией. Следующий ход — portfolio reprioritization и
  актуальный preflight по backend authority перед любым `mission_ops --apply`
  / `ENABLE_MISSION_CORE`, а не исполнение старой ветки/старых пинов из этого
  исторического раздела.
- Макеты сезона: продолжать в прототипном контуре. Черновик 3 из ~14
  поверхностей спасён: `season-mockups-draft-2026-08-04.html`. Открытый
  вопрос хаба: где «утверждённый прогресс-бар сезона с иконками друзей» —
  не найден.
- Lab-аудит выполнен 05.08 (4 Opus-аудитора + верификатор, по чистому
  origin/master @ bfe1e78): `docs/lab-audit-2026-08-05.md` — обрывов
  проводки нет; 4 P1 перфоманса, 16 фидбек-нарушений (включая денежный
  двойной запуск кампании), слепые зоны тестов, бэклог 4 волн.
- Живой прогон выполнен (§10 аудита): живой сервис = неслитая ветка
  mobile-review; поллинг-шторм и замирания подтверждены; кнопка «Играть»
  в Библиотеке мертва на живой сборке (передать владельцу mobile-review).
- **Волны 1–2 реализованы**: swipe-generator PR #8 (ветка
  lab-audit-fixes-w12, 2 коммита). Бонус-находка верификатора:
  lab-ui тест-гейт был ВАКУУМНЫМ (отсутствовал `/run-status-ui.js` в
  allowlist 11 харнессов) — починен, 37/37; одна регрессия волны 2
  поймана и закрыта red-then-green; полный `npm test` побайтово равен
  базлайну. Merge — по зелёному CI (Node 24).
- Проверка живого `localhost:4317` 05.08: процесс запущен из основного
  checkout `swipe-generator` на `codex/mobile-review-performance@c8cc533`,
  который относительно `origin/master@bfe1e78` имеет 12 своих и не содержит
  2 master-коммита; дерево содержит большой незакоммиченный WIP. PR #8 пока
  **не едет в master**: exact head `24384a4`, CI красный на
  `factory_proof_axis_missing` (`sceneColors`). Статика Lab читается с диска
  на каждый запрос, серверные модули загружены при старте — merge/правка в
  живом checkout без остановки может дать гибрид «новый UI / старый сервер».
  05.08: задание на реконсиляцию отправлено владельцу напрямую (сессия
  «SwipeIt development»), R1-A подтвердил готовность дать независимую
  финальную подпись перед cutover. Ход владельцу mobile-review:
  заморозить живой checkout, письменно
  зафиксировать WIP, примирить его в отдельном integration-worktree с
  актуальным master и только с прошедшими ревью/CI срезами (включая отдельный
  draft PR #6), прогнать приёмку; только на коротком cutover остановить старый
  сервис и перезапустить Lab из exact integration-head. Мёртвую кнопку
  «Играть» чинить и проверять в этом же интеграционном срезе.
- **Реконсиляция mobile-review НАЧАТА** (05.08, владелец контура): WIP живого
  checkout зафиксирован снапшот-веткой `wip/live-checkout-2026-08-05`
  (`a7b5891`, 60 файлов / +9692 строк, контур «Фабрики», НЕ mobile-review) —
  собран через временный индекс, рабочее дерево и живой Lab не тронуты.
  Дальше: integration-worktree от `origin/master@5d1ae26`, примирение 12
  master-коммитов с 9 своими, phone-review за default-off флаг, починка
  кнопки «Играть», verify+smoke, пакет на R1-A.
- **Волны 1–4 ПОЛНОСТЬЮ В MASTER** (05.08): PR #8 merged `433eea4`,
  PR #9 merged `5d1ae26`, master swipe-generator ЗЕЛЁНЫЙ (впервые с
  28.07). По пути найдено и закрыто сверх плана: вакуумный lab-ui гейт
  (11 харнессов), среда-лотерея sceneColors (ось из сида ← identity
  CI-раннера; 11/300 → 0/300, детерминированная соль вне policy-digest),
  две продакшн-гонки отсмотра (перезапуск живого превью съедал
  completion-evidence; поздний рефреш сбрасывал позицию оператора) —
  свипы под CPU-троттлингом 28/28. Заметное оператору: рефреш очереди
  больше не сбрасывает отсмотр; «удачно» гаснет при снятии превью.
  Follow-ups Lab: родственная гонка level-play-frame; бейдж «статистика
  недоступна» на уровне очереди; **секрет SWIPE_BACKEND_DEPLOY_KEY
  ЗАВЕДЁН 05.08** — оператор сгенерировал пару руками, read-only deploy
  key `swipe-generator goldens-drift` (id 159359243) в swipe-backend,
  приватная половина в секретах swipe-generator; первый прогон
  `sibling-contracts.yml` 31005179066 зелёный (4/4 голдена, skipped 0),
  суточный гард дрейфа вооружён, файлы ключа с Desktop удалены; док-долг
  по удалённым роутам в swipe-backend/docs (после снятия заморозки);
  вернуть Node 24 на мак (brew).
- **«Три комнаты» УТВЕРЖДЕНЫ оператором 05.08**: прототип
  `lab-rooms-mockup-2026-08-05.html`; этап 1 (навигационный слой) — ТЗ
  `docs/lab-rooms-stage1-tz-2026-08-05.md`. Порядок по решению оператора
  05.08 («сперва параллельная ветка по labs — в master»): посадка волн
  3–4 → **реконсиляция generator-половины mobile-review в master** →
  комнаты этап 1. Нюансы реконсиляции: рабочее дерево swipe-generator у
  оператора грязное на этой ветке (нужно согласие владельца на
  wip-снапшот или его push); backend-половина mobile-review ждёт снятия
  merge-freeze после деплоя → phone-review UI при реконсиляции прячется
  за default-off. Этап 2 комнат — центр допусков + слияние дублей;
  этап 3 — единый поток очереди отсмотра.

### 3. Механики + независимая верификация A1 (ждёт исполнителя)
- Владелец: первый Кодекс, освободившийся ПОСЛЕ деплой-манёвра. Уточнение
  оператора 04.08: оба Кодекса сейчас заняты манёвром — R1 (второй мак)
  закрывает P2 в meta PR #57, R1-A ведёт патч C и GitHub-входы. До конца
  манёвра контур не стартует; новых заданий кодексам не передавать.
- ТЗ: `mac2-codex-tz-mechanics-and-a1-v1.md`.
- Границы: не трогает `swipe-backend` и мастера платформенных репо; выход —
  ветки в origin + квитанции-файлы; деплой запускает только оператор/Мак 1.

## Прод сейчас (снимок 04.08)
- Лента: https://swipe-platform.onrender.com — клиент `c1681d8` (03.08),
  бэкенд `09fa0cd` (01.08), БД `0070`. Серверный ростер активен
  (13 mappings, активация `629d2b1e` от 28.07, БЕЗ minesweeper).
- **Живая дыра:** minesweeper есть в baked-ростере клиента, а бэкенд
  `09fa0cd` считает его серию длиной 5 → терминальный результат серии
  получает 409 `series_incomplete` → клиентский outbox молча дропает.
  Итог: первая сессия каждого нового пользователя теряет сундук сапёра;
  пользователи с ростер-снапшотом сапёра не видят вовсе. Решение — очередь №1.
- Фронтенд-гейты прод-профиля `cohort-operator`: control-plane/catalog —
  **true** (player-v2/canary ограничены аккаунтом 42692410;
  catalog-feed-dogfood открыт всем CP-игрокам), island-гейты — false.
  Формулировка «default-off» в CLAUDE.md описывает код-дефолты, не
  прод-профиль.

## Очередь решений оператора
1. ~~Minesweeper-дыра~~ — **решено 04.08: вариант (б)** — терпеть до деплоя
   бэкенда. Следствие: дыра живёт до деплоя, приоритет манёвра усилен.
2. ~~Block Out в ленту~~ — **решено 04.08: отложено** — оператор полирует
   механику сам; агентам Block Out не трогать до отметки GO здесь.
3. ~~Feed-sequencing O1–O4~~ — **решено 04.08: запарковано** до появления
   независимых игроков (закрытый тест 13.10 / friend cohort). Команды на
   включение (~полчаса): `docs/feed-sequencing-operator-steps-2026-08-04.md`.
4. ~~`island_visit_awards`~~ — **дефолт принят 04.08**: разобрать попутно
   при вливании `0074` (владелец — тот, кто вливает 0074); отдельного
   решения не требует.
5. ~~VISION.md «1..10»~~ — **подтверждено оператором 04.08** («лимит серии
   увеличивал до 10»); строка перенесена в master.
6. **`secrets.RENDER_API_KEY`** — ввести в окно деплоя, отозвать по §9 п.8
   (запрос хаба).
7. **Replication-WIP**: ветка `wip/replication-docs-pre-sync-2026-08-04`
   (arrows re-review v3, VISION 1..10, capture-правки) — вернуть сессии
   механик на rebase поверх свежего master.

## Парковки (условие возврата)
- **A1 supervised/enablement** — после деплоя + тихая неделя. R3.1 закрыт
  волной 7 ещё 17.07 (merge `2d40e18`) + R4/R4.1; идёт независимая
  верификация (контур 3).
- **P4G Stage 2** — технический гейт `0074` пройден; вернуть через portfolio
  reprioritization, актуальный backend preflight и готовность первых
  операторских кейсов/макетов, а не по старой ветке миграции.
- **C2 evidence** — data-gated (нужны независимые игроки / friend cohort).
- **Feed-sequencing O1–O4** — запаркован 04.08 (решение оператора); 13.10 или
  появление friend cohort запускает review разморозки, но не автоматическое
  включение.
- **Cohort observability** — слит, инертен (`ENABLE_COHORT_OBSERVABILITY=false`).
- **Mobile-review контур** — рабочие деревья swipe-backend / swipe-generator /
  swipe-agents стоят на `codex/mobile-review-performance` с грязными
  изменениями; в swipe-backend две опасные до-rebase миграции `0072`/`0073`
  (НЕ запускать alembic из этого дерева); разбор — владелец PR #25
  (HANDOFF §5б).

## Гигиена (следующий проход, не блокирует)
- Архив в `docs/archive/2026-08/`: series-order-* пакеты (R2 GO, код влит),
  html-питчи от 05.07, `pins-ftue-L1-video-compliance.pdf`,
  `playable-tickets.html`/`playables-status.html`,
  `feed-sequencing-orchestration-handoff-2026-07-27.md` (устарел: пакеты
  11–12 не отражены; архивировать после O1–O4).
- `scratchpad/`, `help-map-prototype/` → `.gitignore` или переезд;
  `package.json`/`package-lock.json` (легаси npm-workspace) → архив.
- `swipe-agents`: локальный `main` на 3 коммита впереди `origin/main` и на
  65 позади — сверить и примирить.
- Файл `=` удалён 04.08.

## Журнал передач
- 04.08 поздний вечер: решения оператора — сапёр ждёт деплоя; Block Out
  отложен (оператор полирует сам); feed-sequencing запаркован; VISION
  «1..10» подтверждён и перенесён в master; `island_visit_awards` —
  разобрать при 0074.
- 04.08 вечер: чекпойнт → разделение контуров; хэндофф хаба принят
  (`HANDOFF-P4G-STAGE1-2-2026-08-04.md`); созданы STATE.md, роли в
  AGENTS.md, двухконтурный режим в CLAUDE.md, ТЗ Мак 2; WIP
  replication-доков законсервирован веткой
  `wip/replication-docs-pre-sync-2026-08-04`.
