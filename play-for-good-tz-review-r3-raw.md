OpenAI Codex v0.146.0-alpha.3.1
--------
workdir: /Users/gleb/My projects/p4g-platform-workspace
model: gpt-5.6-sol
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: none
session id: 019fb29a-4795-7482-a63d-094f02ac7ac8
--------
user
Роль: независимый ревьюер (author ≠ reviewer), режим только-чтение.

Ревьюируемая идентичность: коммит
4738103258e1866ba19a22187098448665612759. Сначала выполни
`git rev-parse HEAD` и убедись, что HEAD равен этому SHA (untracked
review-файлы допустимы); если не равен — остановись и сообщи об этом
вместо ревью.

Проревьюй два файла этого коммита:
- play-for-good-stage0-island-off-tz.md (v3)
- play-for-good-stage1-mission-slice-tz.md (v3)

Это раунд R3 после твоих же findings R1/R2. Проверь:
1) корректно ли внесены все findings R2: staged rollout с pre-set
   компенсирующих флагов; раздельные гейты роутов/runners и
   quiesce/drain; freeze-список таблиц с allowlist защитных writes;
   исправленная карта роутеров + route manifest; аварийный 503-путь
   пустой очереди (не 409) с отказом unlock-cutoff и DB-preflight;
   exact contract identity (case_id, contract_version) во всей схеме;
   mission_fulfillment_allocations и атомарный FULFILLED при полном
   покрытии; финансовая идемпотентность, округление вниз,
   CHECK-границы; предусловие token_goal;
2) контрактную целостность против VISION.md (v3.0.1) и
   play-for-good-gap-map-v1.md того же коммита;
3) не внесли ли правки v3 новых противоречий.

Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
нет. Только ревью — никаких правок файлов.

codex
Сначала проверю точную идентичность checkout. Если `HEAD` не совпадёт с указанным SHA, остановлюсь без просмотра содержания.
exec
/bin/zsh -lc 'git rev-parse HEAD' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
4738103258e1866ba19a22187098448665612759

codex
`HEAD` совпадает с `4738103258e1866ba19a22187098448665612759`. Теперь сверяю обе v3-спецификации с их diff, `VISION.md` v3.0.1 и gap map из этого же коммита; отдельно трассирую каждый пункт R2 по точным строкам.
exec
/bin/zsh -lc "rg --files | rg '("'^|/)(play-for-good-stage0-island-off-tz'"\\.md|play-for-good-stage1-mission-slice-tz\\.md|play-for-good-gap-map-v1\\.md|VISION\\.md)"'$'"'" in /Users/gleb/My projects/p4g-platform-workspace
 exited 127 in 0ms:
zsh:1: command not found: rg
zsh:1: command not found: rg

exec
/bin/zsh -lc "find . -type f \\( -name 'play-for-good-stage0-island-off-tz.md' -o -name 'play-for-good-stage1-mission-slice-tz.md' -o -name 'play-for-good-gap-map-v1.md' -o -name 'VISION.md' \\) -print" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 6035ms:
./.claude/worktrees/xenodochial-chatterjee-eabcfa/VISION.md
./.claude/worktrees/festive-cohen-8d02b6/VISION.md
./play-for-good-stage0-island-off-tz.md
./play-for-good-stage1-mission-slice-tz.md
./VISION.md
./play-for-good-gap-map-v1.md

exec
/bin/zsh -lc 'wc -l VISION.md play-for-good-gap-map-v1.md play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md
git diff 4738103258e1866ba19a22187098448665612759''^ 4738103258e1866ba19a22187098448665612759 --stat -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md play-for-good-gap-map-v1.md VISION.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     616 VISION.md
     309 play-for-good-gap-map-v1.md
     180 play-for-good-stage0-island-off-tz.md
     223 play-for-good-stage1-mission-slice-tz.md
    1328 total
 play-for-good-stage0-island-off-tz.md    | 144 +++++++++++++++++++------------
 play-for-good-stage1-mission-slice-tz.md |  90 +++++++++++++------
 2 files changed, 151 insertions(+), 83 deletions(-)

exec
/bin/zsh -lc 'nl -ba play-for-good-stage0-island-off-tz.md
nl -ba play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v3
     2	
     3	Статус: **DRAFT v3 после кросс-ревью R2** (author: Claude; reviewer:
     4	Codex; R1: разделение роутеров, runners, порядок проверки, manifest;
     5	R2: staged rollout с pre-set true, quiesce/drain runners,
     6	freeze-список вместо «ноль writes», точная карта роутеров — все
     7	внесены). Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
     8	
     9	Цель: обратимо вывести legacy-остров из прода целиком — клиентскую
    10	поверхность, backend-writers и генерационные runners — сохранив
    11	защитные контуры (closed delivery, public report, операторская
    12	модерация/takedown, recall) и не удаляя данных. Результат — «чистый
    13	Island-off baseline», предусловие реализации Этапа 1.
    14	
    15	Не-цели: удаление кода/таблиц/данных; ретеминг в приют; изменения
    16	feed/каталога/challenge; mission-функциональность.
    17	
    18	Инварианты пакета: данные не удаляются нигде; каждый шаг обратим одним
    19	env-flip или откатом билда; closed delivery, public report, модерация
    20	и recall работают на каждом шаге (проверяется в acceptance каждого
    21	шага, где применимо).
    22	
    23	Фактическое состояние (проверено 30.07.2026, уточнено R2):
    24	`app/main.py` — `island_state_router` и `island_social_router`
    25	смонтированы безусловно (:193–194); **модерация смонтирована внутри
    26	`if settings.enable_island_social:`** (:195–200) и авторизуется
    27	server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth);
    28	`island_router` из `api_island.py` — **theme/bake generation**;
    29	`api_island_social.py` — **artifact-url, public, visits, likes**;
    30	`start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
    31	`lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
    32	одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
    33	ни генерационные runners. **Первый деливерабл П2 — точный route
    34	manifest**: каждый island-маршрут → файл → целевой контур; физическое
    35	разделение выполняется только по manifest'у, не по памяти.
    36	
    37	---
    38	
    39	## П1 — снятие клиентской поверхности
    40	
    41	Изменения: релиз feed-prototype с выключенными `VITE_ISLAND_ENABLED`,
    42	`VITE_ISLAND_VISIT_AWARDS_ENABLED`, `VITE_ISLAND_NOTIFICATIONS_ENABLED`
    43	(предварительно зафиксировать фактические значения деплой-окружения в
    44	receipt). Код не меняется — поверхность уже за флагами
    45	(`src/feed.ts:202-210`, deep-links в `src/main.ts`).
    46	
    47	Acceptance: свежая сессия — нет вкладки «мета», друзей в HUD,
    48	island-обработки deep-links; ноль запросов `/api/island/*`.
    49	Rollback: предыдущий клиентский билд.
    50	
    51	## П2 — backend-код: физическое разделение контуров + гейты runners
    52	
    53	Изменения (одна PR в swipe-backend; прод-деплой — только в П4, после
    54	pre-set компенсирующих флагов):
    55	
    56	0. **Route manifest** (деливерабл до кода): полный список
    57	   island-маршрутов с файлом-источником и целевым контуром.
    58	1. **Разделить роутеры на четыре независимых контура** (по
    59	   manifest'у):
    60	   a) legacy: state (`api_island_state`), public/visits/likes/
    61	      artifact-url (`api_island_social`), theme/bake generation
    62	      (`api_island`);
    63	   b) closed-delivery resolver;
    64	   c) public report (кнопка репорта — защитный контур);
    65	   d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    66	   Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    67	   получают собственные гейты: (b) — существующий
    68	   `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
    69	   `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
    70	   контур не должен выключаться случайно).
    71	2. **Два раздельных гейта вместо одного** (нужны для quiesce):
    72	   `ENABLE_ISLAND_LEGACY_SURFACE` (default false) — роуты контура (a);
    73	   `ENABLE_ISLAND_GENERATION_RUNNERS` (default false) — запуск/claim
    74	   `start_bake_runner()` / `start_theme_runner()` в `lifespan`.
    75	   Раздельность позволяет состояние «роуты закрыты, runners доживают
    76	   очередь».
    77	3. Cross-flag валидатор: явные ветки на новые комбинации.
    78	
    79	Acceptance (тесты + локально): при `LEGACY_SURFACE=false` все пути
    80	контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
    81	и **status/attempts существующих queued jobs не изменяются**; при
    82	`SOCIAL=false` — модерация, report и closed delivery продолжают
    83	работать; полный тест-сьют зелёный. Rollback: env-flip
    84	соответствующего флага в true.
    85	
    86	## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)
    87	
    88	Работы: browser/E2E **старого прод-билда клиента** против локального
    89	backend с выключенными флагами П2: пройти серию до сундука; убедиться,
    90	что island-запросы получают 404 и деградация тихая — лента играет,
    91	крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
    92	обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
    93	visit-award, лайки).
    94	
    95	Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
    96	finding: чинится до П4.
    97	
    98	## П4 — прод-применение (staged, каждый под-шаг — receipt + проверка)
    99	
   100	1. **Pre-set (до деплоя кода!):** в `render.yaml` заранее добавить
   101	   `ENABLE_ISLAND_LEGACY_SURFACE=true` и
   102	   `ENABLE_ISLAND_GENERATION_RUNNERS=true` (плюс явные
   103	   `ENABLE_ISLAND_PROTECTIVE_SURFACE=true`,
   104	   `ENABLE_ISLAND_CLOSED_DELIVERY=true`). Затем задеплоить код П2 —
   105	   деплой не меняет поведение прода (default-false флаги
   106	   компенсированы pre-set'ом). Smoke: legacy-роуты отвечают, runners
   107	   работают, модерация работает.
   108	2. **Flip поверхности:** `ENABLE_ISLAND_SOCIAL=false`,
   109	   `ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
   110	   `ENABLE_ISLAND_NOTIFICATIONS=false`, явно
   111	   `ISLAND_REWARDS_ENABLED=false` (default true),
   112	   `ENABLE_ISLAND_LEGACY_SURFACE=false`. Новые theme/bake jobs
   113	   невозможны (роуты закрыты); runners ещё включены.
   114	3. **Quiesce/drain:** дождаться terminal-состояния всех queued/running
   115	   bake/theme jobs (новых нет; bounded wait по lease TTL; job,
   116	   зависший в `generating`, резолвится вручную по runbook'у до
   117	   продолжения). Проверка: ноль незавершённых jobs.
   118	4. **Flip runners:** `ENABLE_ISLAND_GENERATION_RUNNERS=false`
   119	   (рестарт; runners больше не стартуют; ничего не оборвано
   120	   посередине — очередь пуста).
   121	5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
   122	   delivery выдаёт signed GET на существующий артефакт; report и
   123	   модерационная консоль работают; в логах нет
   124	   bot/notification/bake/theme runner'ов.
   125	
   126	Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
   127	включение ботов безопасно by design (immutable per-day планы, bounded
   128	catch-up).
   129	
   130	## П5 — snapshot manifest, схема и доки
   131	
   132	1. **Data-manifest с явным freeze-списком** (после drain П4):
   133	   snapshot row counts + max seq/id + digest mutable-state по
   134	   **freeze-списку** legacy/social/economy таблиц: `island_states`,
   135	   `island_building_social`, `island_visits`, `island_building_likes`,
   136	   `island_completion_claims`, `island_completion_outcomes`,
   137	   `island_collect_claims`, `island_visit_awards`, `island_bots`,
   138	   `island_bot_daily_plans`, `island_friend_codes`,
   139	   `island_friendships`, `island_friend_blocks`,
   140	   `island_notification_outbox`, `island_notification_attempts`,
   141	   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
   142	   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
   143	   таблицы (`island_reports`, `island_moderation_actions`) в
   144	   freeze-список **не входят**: их writes разрешены и проверяются как
   145	   audit receipts — каждая новая строка соответствует конкретному
   146	   report/moderation-акту. Manifest — receipt пакета.
   147	2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
   148	   v3.0.1).
   149	3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
   150	   состав), durable-строка в корневой `CLAUDE.md`, при необходимости
   151	   `AGENTS.md`.
   152	
   153	Acceptance: manifest-проверка чистая; схема опубликована;
   154	`docs-boundary-lint` чистый.
   155	
   156	---
   157	
   158	## Порядок применения
   159	
   160	П1 (клиент) → П2 (код: route manifest + разделение, PR без
   161	прод-деплоя) → П3 (pre-prod E2E старого клиента) → П4 (pre-set →
   162	деплой → staged env-flip'ы → drain → prod smoke) → П5
   163	(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
   164	до следующего шага.
   165	
   166	## Общий acceptance Этапа 0
   167	
   168	- Свежий клиент: ноль island-запросов.
   169	- Backend: контур (a) → 404; bake/theme/bot/notification runners не
   170	  стартуют; queued jobs заморожены (status/attempts без изменений).
   171	- Closed delivery / public report / модерация / recall — проверены
   172	  руками, работают.
   173	- Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
   174	  после.
   175	- Rollback записан; минимум один шаг проверен обратным включением вне
   176	  прода.
   177	- Data-manifest: ноль записей в freeze-списке после cutoff; защитные
   178	  writes — только с audit-receipt; данные не удалены.
   179	
   180	Только после этого acceptance начинается реализация Этапа 1.
     1	# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v3
     2	
     3	Статус: **DRAFT v3 после кросс-ревью R2** (author: Claude; reviewer:
     4	Codex; R1: dogfood-изоляция, singleton, receipt-доставка, fulfillment,
     5	инварианты; R2: 503-путь пустой очереди вместо >100%, exact contract
     6	identity во всей схеме, fulfillment↔N allocations, финансовая
     7	идемпотентность/округление, предусловие token_goal — все внесены).
     8	Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §1–2.
     9	**Предусловие реализации: чистый Island-off baseline (Этап 0 применён
    10	и проверен).**
    11	
    12	Цель: один маленький реальный кейс проходит полный честный цикл
    13	`READY → ACTIVE → авто-вклады → UNLOCKED → следующий ACTIVE → реальная
    14	передача → FULFILLED → evidence` на прод-инфраструктуре; игроки —
    15	только enrolled dogfood-пользователи (оператор). Всё default-off;
    16	для не-enrolled пользователей поведение платформы не меняется ни в
    17	чтении, ни в записи.
    18	
    19	Не-цели v0: коллекции и их вклад (Этап 2), приют-карта, campaign
    20	share, «Попросить помочь», holdout, подписка/VIP, голосование,
    21	sponsored-бюджеты, TMA-аппрув кейсов (v0 — internal CLI), автоматика
    22	FULFILLED, мультивалютность (v0 жёстко EUR).
    23	
    24	---
    25	
    26	## Бэкенд: namespace `mission_*` (одна новая миграция)
    27	
    28	Все журналы append-only; образцы — island_completion_claims/outcomes,
    29	island_moderation_actions, feed_policy_config_versions, award_*.
    30	
    31	1. **`mission_case_contracts`** — immutable контракт кейса:
    32	   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
    33	   `document` JSONB schema `mission.case-contract.v1`: получатель;
    34	   потребность `scalable|fixed`; guaranteed deliverable;
    35	   **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
    36	   `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
    37	   (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
    38	   `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
    39	   `latest_fulfillment_at`; `queue_position`; ожидаемый вид
    40	   подтверждения. `registered_by/at`.
    41	2. **`mission_runtime`** — **singleton-строка** (PK-константа,
    42	   CHECK id=1): пара `active_case_id + active_contract_version`
    43	   (nullable вместе), `updated_seq`.
    44	   **Единая точка сериализации: каждый lifecycle- и
    45	   contribution-writer начинает транзакцию с
    46	   `SELECT … FROM mission_runtime FOR UPDATE`** — двух ACTIVE-кейсов
    47	   не существует by construction, авторитет «какой кейс ACTIVE» —
    48	   эта строка (проекция, воспроизводимая из событий).
    49	3. **`mission_case_events`** — lifecycle: `seq` (nextval
    50	   `mission_case_events_seq` под runtime-lock), пин контракта
    51	   (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
    52	   `payload`, `receipt_digest`; UNIQUE `(case_id, kind)`. Derived
    53	   state кейса = последний kind по `seq DESC`.
    54	4. **`mission_pool_ledger`** — rolling pool: `source ∈
    55	   seed|revenue_share|partner|subscription_share` (v0 — только seed),
    56	   `amount_cents`, `currency` (CHECK `='EUR'`), `settled_at`, `meta`,
    57	   `idempotency_key` UNIQUE.
    58	5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
    59	   reserve_guaranteed|gift_additional`, `(case_id,
    60	   contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
    61	   `pool_cursor`, FK на породивший lifecycle event, `receipt`.
    62	   **Финансовая идемпотентность и границы:** UNIQUE idempotency
    63	   identity (`res:{case_id}:{contract_version}` /
    64	   `gift:{case_id}:{contract_version}`); округление
    65	   `unlock_share × cents` — вниз до целых центов; CHECK-и:
    66	   `unlock_share ∈ [0,1]` (в receipt), `guaranteed_cents ≤
    67	   confirmed_need_cents + stretch_cap_cents` (на контракте),
    68	   положительные `amount_cents` в ledger и allocations. Инвариант (в
    69	   транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
    70	   ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
    71	   unlock_share(progress) × settled unallocated pool на cursor,
    72	   confirmed_need_cents + stretch_cap_cents)`.
    73	6. **`mission_contributions`** (+ child
    74	   **`mission_contribution_allocations`**) — вклад: `user_id`,
    75	   `source ∈ series|daily`, `amount`, `source_ref`,
    76	   `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
    77	   **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
    78	   `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
    79	   `seq` под runtime-lock; receipt в той же транзакции, replay
    80	   byte-identical. Child-allocations (каждая пинит `(case_id,
    81	   contract_version)`): обычно одна строка; при пересечении
    82	   `token_goal` — детерминированно две. **Инвариант
    83	   `sum(child)=amount` — service-level в той же транзакции +
    84	   reconciliation-тест** (обычный SQL CHECK не читает другие строки;
    85	   constraint trigger — опциональное усиление позже).
    86	7. **`mission_fulfillments`** (+ child
    87	   **`mission_fulfillment_allocations`**) — typed transfer receipt
    88	   `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
    89	   `amount_cents`, `currency` (CHECK `='EUR'`), `recipient`,
    90	   `transfer_reference`/`transfer_date`, `evidence_digest`, immutable
    91	   content-addressed `artifact_url`. Child-строки связывают receipt с
    92	   **каждой** покрываемой allocation-строкой (обычный перевод
    93	   покрывает две: `reserve_guaranteed` + `gift_additional`). Сервис
    94	   принимает fulfill только при полном покрытии зафиксированного gift
    95	   (`sum(child) = amount_cents = зарезервировано+открыто кейса`);
    96	   `FULFILLED` event пишется атомарно в той же транзакции. Публичное
    97	   «реально передано» проецируется **только** из fulfillment-receipts.
    98	
    99	**Exact contract identity проходит через всю схему:** runtime,
   100	case-events, pool-allocations, contribution-allocations и
   101	fulfillments пинят точную пару `(case_id, contract_version)`
   102	composite-FK — из каждой строки доказуемо, по какой версии контракта
   103	посчитаны goal и деньги.
   104	
   105	### State machine и очередь
   106	
   107	`register-contract` → **`ready`** (отдельная CLI-команда: резервирует
   108	гарантию из pool — allocation `reserve_guaranteed` — и пишет
   109	ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
   110	(допустим только при `active_case_id IS NULL`; берёт head очереди
   111	READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
   112	`unlock-cutoff`) **в той же транзакции активирует следующий READY из
   113	очереди**. Правила:
   114	
   115	- Включение `ENABLE_MISSION_CORE` требует **DB-preflight** —
   116	  CLI-команда и startup-проверка, не config-validator (у него нет
   117	  доступа к БД): существует ACTIVE и ≥1 READY-successor.
   118	- Аварийный путь пустой очереди (VISION-совместимый): транзакция
   119	  пересекающего вклада **не коммитится** и возвращает retryable
   120	  **503** — клиентский outbox сохраняет результат и повторит после
   121	  появления READY-кейса. Не 409: существующий result-outbox считает
   122	  409 terminal и удалит запись. `unlock-cutoff` при отсутствующем
   123	  successor отказывает до создания READY-кейса. Операционный
   124	  инвариант — держать очередь непустой; 503-ветка — предохранитель,
   125	  не рабочий режим.
   126	- Предусловие v0 (валидируется при `register-contract`): `token_goal`
   127	  каждого кейса ≥ максимально возможного одиночного вклада (максимум
   128	  серии/дейлика из reward-функций) — пересечение затрагивает максимум
   129	  два кейса, двух child-строк достаточно. Каскадное распределение по N
   130	  кейсам понадобится для крупных collection-наград (Этап 2).
   131	
   132	### Dogfood-изоляция (writers И readers)
   133	
   134	Единый server-owned allowlist `MISSION_DOGFOOD_USER_IDS` применяется:
   135	(а) во врезках `/api/results` и daily-claim — **вклад создаётся только
   136	enrolled-пользователям**, для остальных поведение байт-в-байт прежнее;
   137	(б) в read API; (в) в `/session` отдаётся capability
   138	`mission_dogfood` (образец operator-debug-entry capability) — клиент
   139	монтирует миссию только при `VITE_MISSION_ENABLED && capability`.
   140	
   141	### Врезки и доставка receipt до клиента
   142	
   143	- `POST /api/results` (терминальная серия) и daily-claim: в той же
   144	  транзакции, что RewardLedger, — mission contribution; в ответ
   145	  добавляется **optional блок `mission_contribution`** (receipt: id,
   146	  amount, allocations по кейсам, состояние бара после). Ответ
   147	  фиксируется как обычно; **`_verified_replay_response` восстанавливает
   148	  тот же блок** (replay возвращает committed-байты; у receipts,
   149	  созданных до включения флага, блока нет — это корректно).
   150	- Клиент: `ResultResp → outbox ResultReceipt` расширяется переносом
   151	  `mission_contribution`; церемония вклада в series-win флоу читает
   152	  **только** этот receipt (никакого optimistic). Аналогично для
   153	  daily-ответа.
   154	
   155	### Операторский CLI `python -m app.mission_ops`
   156	
   157	Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
   158	`unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
   159	digest + artifact URL). Все dry-run по умолчанию, `--apply` с
   160	обязательными exact-identity аргументами; каждый apply = case-event +
   161	receipt. Отдельный флаг `ENABLE_MISSION_OPS`, HTTP-маршрутов нет;
   162	impact-полномочия не смешиваются с контентными скоупами.
   163	
   164	### Read API
   165	
   166	`ENABLE_MISSION_READ` + capability: `GET /api/mission/case` — текущий
   167	ACTIVE (токен-бар, четыре числа: вклад сообщества / гарантировано /
   168	зарезервировано и открыто / реально передано-из-fulfillments, контракт
   169	в один тап), мой вклад, последний FULFILLED (**с immutable event id для
   170	клиентского watermark**). Ответ — проекция только из receipts.
   171	
   172	### Тесты (PG, обязательные)
   173	
   174	Полный E2E цикл; идемпотентность (`mc:{run_id}`, `mcd:` реплей →
   175	byte-identical); конкуренция под runtime-lock (два вклада добивают
   176	goal — ровно один UNLOCKED, остаток второго — новому ACTIVE);
   177	двух ACTIVE не существует (негативный тест `activate` при занятом
   178	runtime); split-инвариант + reconciliation; pool-инвариант; snapshot
   179	не меняется от поздних settled-строк; fulfillment coverage (transfer =
   180	сумма указанных allocations; чужие allocations → отказ);
   181	**не-enrolled пользователь: `/results`/daily байт-в-байт прежние
   182	(golden), вкладов нет, capability нет**; пустая очередь → 503
   183	retryable, outbox сохраняет и повторяет после появления READY, вклад
   184	не потерян и не задублирован; fulfillment покрывает обе allocation
   185	child-строками, частичное покрытие → отказ без FULFILLED-события;
   186	пин `(case_id, contract_version)` присутствует во всех receipts;
   187	округление вниз и границы CHECK-ов; up/down миграции.
   188	
   189	## Клиент (feed-prototype, `VITE_MISSION_ENABLED` + capability)
   190	
   191	- HUD-ретеминг: бейдж пазлов → «лапки»; значение = мой вклад в текущий
   192	  кейс (server-derived). Старый puzzle-баланс уходит с поверхности
   193	  (данные не трогаются). Optimistic ко вкладу не применяется.
   194	- Виджет кейса + экран кейса (четыре числа, контракт, история).
   195	- Церемония вклада в series-win флоу — из `mission_contribution`
   196	  receipt результата (до challenge-пилюли); дейлик-клейм показывает
   197	  лапки из receipt daily-ответа.
   198	- Церемонии UNLOCKED и FULFILLED — по read API; **client watermark по
   199	  immutable event id** (образец island-celebrated-stages): каждая
   200	  церемония показывается один раз, не при каждом входе.
   201	- Прод-сборка не меняется: без capability миссия не монтируется даже
   202	  при включённом VITE-флаге.
   203	
   204	## Операционка (вне кода, owner — оператор)
   205	
   206	Договорённость с локальным приютом; кейс №1 — масштабируемая
   207	потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
   208	формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
   209	READY до включения core** (требование preflight).
   210	
   211	## Acceptance Этапа 1 (dogfood)
   212	
   213	Полный реальный цикл: контракт → посев → READY (резервирование) →
   214	ACTIVE → enrolled-оператор играет серии/дейлики, вклады с receipts →
   215	UNLOCKED (snapshot-receipt; кейс №2 ACTIVE) → реальная закупка корма и
   216	передача → FULFILLED с typed transfer receipt и evidence → обе
   217	церемонии показаны один раз (watermark). Все receipts воспроизводимы;
   218	для не-enrolled пользователей не изменилось ничего (проверено golden).
   219	
   220	## Rollback
   221	
   222	Флаги off → поведение платформы прежнее; `mission_*` таблицы остаются
   223	(append-only, ни на что не влияют); миграция down — только вне прода.

exec
/bin/zsh -lc "grep -nE '"'^#|''^##|''^###|мисси|Мисси|остров|Остров|ACTIVE|READY|UNLOCKED|FULFILLED|гарант|contract|receipt|приют|unlock|rollover|pool|пул|token|вклад|передан'"' VISION.md
nl -ba play-for-good-gap-map-v1.md" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
1:# VISION — Play for Good puzzle platform
5:гарантированным минимумом, unlock_share и immutable receipts; коллекции
6:и приют-монумент вместо генеративной меты как центра;
16:## Обещание игроку
23:приюту. Платформа гарантирует реальную помощь независимо от активности
35:## Что мы строим
42:Над лентой находится миссионный слой:
46:3. коллекции дают те же токены и являются более сильным источником вклада;
47:4. заработанный вклад заметно двигает общий прогресс к token goal;
48:5. достижение token goal активирует подарок и первую церемонию;
50:6. результат остаётся в общем приюте-монументе и в личной истории игрока.
58:## Для кого первый продукт (гипотеза ICP)
66:миссию помощи животным — проверяемые гипотезы, не свойства пола или возраста,
73:## Основной продуктовый цикл
75:`лента → любимая механика → серия → сундук/коллекция → вклад → текущий
76:сезон-кейс → подарок (UNLOCKED) → подтверждённая передача (FULFILLED) →
82:Mission contribution = server-owned contribution receipt о зачислении
86:### Активный кейс (= текущий сезон)
90:  Кейс — одно животное или одна точно описанная потребность приюта.
93:- Жизненный цикл: `READY (потребность проверена, гарантированный
94:  подарок зарезервирован) → ACTIVE (сезон публичен, сообщество копит
95:  токены) → UNLOCKED (сумма подарка зафиксирована immutable receipt) →
96:  FULFILLED (помощь реально передана, evidence опубликован)`. Кейс
97:  публикуется только из READY: активный кейс всегда уже обеспечен
98:  деньгами. UNLOCKED наступает либо при достижении token goal, либо по
99:  опубликованному unlock cutoff с фактическим частичным прогрессом —
100:  дальше обе ветки одинаковы. После UNLOCKED сразу стартует следующий
101:  сезон; после FULFILLED предыдущий появляется постоянной точкой в
102:  приюте.
104:  гарантированный deliverable, допустимые stretch deliverables, правило
105:  rollover излишков (токенов и денег) следующему сезону, token goal,
106:  правило pool-снапшота на UNLOCKED (settled unallocated eligible pool
107:  + cursor), unlock cutoff (момент открытия подарка, если token goal
112:  определяет количество; якорь честности — receipt передачи) и
115:- Недостигнутый token goal не создаёт failure-состояния: по unlock
116:  cutoff кейс всё равно проходит UNLOCKED с фактическим частичным
117:  прогрессом — гарантированный подарок плюс открытая прогрессом часть
119:  гарантировала и зарезервировала подарок, сообщество открыло ещё X».
120:  «Передали» звучит только на FULFILLED. Следующий сезон стартует как
122:- Кейс закрыт (FULFILLED) только после реального выполнения и проверки
125:- Темп сезона задаёт token goal — отдельный versioned-параметр, а не
135:### Вклад
140:  завершение коллекции создаёт server-owned contribution receipt, и
141:  лапки сразу попадают в текущий ACTIVE-кейс. Личного кошелька,
143:- Игрок видит отдельную церемонию вклада («ты принёс 20 лапок» — общий
144:  бар сдвинулся); публичный бар двигается только после server receipt,
146:  запуска следующего кейса, вклад идёт в текущий ACTIVE-кейс, и
147:  receipt явно это показывает.
148:- Вклад, пересекающий token goal, делится детерминированно: часть до
149:  цели зачисляется текущему кейсу (он проходит UNLOCKED, следующий
150:  становится ACTIVE), остаток зачисляется новому ACTIVE-кейсу; один
151:  receipt показывает обе allocation-строки.
152:- Первый вклад должен быть достижим рано, чтобы миссия была пережита до
154:- Серии и дейлики дают обычный вклад; завершение коллекции даёт
156:- Пользовательский язык — «твой вклад», «двинуть общее дело», «поиграй с
159:## Во что мы верим (принципы)
161:1. **Миссия — смысл, игра — любимый ритуал.** Play for Good не прикручивает
170:   сундуки, коллекции, вклады и возвраты к текущему кейсу.
175:   выдаче ленты или расчёте миссионного вклада.
184:   | Impact-кейс | impact-оператор; партнёр подтверждает потребность и результат, но не получает platform authority | exact case contract, funding, publication и closure evidence | миссионная поверхность |
209:    проверка партнёра → публичный контракт → append-only вклады →
212:11. **Публичная миссия human-true.** Боты могут тестировать только явно
219:## Куда хотим прийти (целевая картина)
222:  видит один понятный кейс, регулярно вносит заработанный вклад и возвращается
225:  животного, свои коллекции и кипсейк. Сезоны идут встык — UNLOCKED
230:- **Приют как общая мета.** Нынешняя идея острова переосмысляется в
231:  приют-карту: текущий кейс, общий монумент закрытых кейсов и личная витрина
246:  deep-link, первый слот и миссионную кампанию без подмены фактов. Платформа
249:  отвалов и миссионного эффекта → briefs фабрикам и решения impact-оператора.
258:  гарантированный и дополнительный impact-контур.
265:## Сезоны, коллекции и личная память
268:  стартует сразу после UNLOCKED предыдущего.
271:  переякоривается на миссию.
272:- Завершённая сезонная коллекция даёт заметный вклад и evidence-bearing
278:  строим рейтинги «кто добрее» и не превращаем объём вклада в моральный
287:  календаря: FULFILLED-подтверждения пополняют монумент и кипсейки
290:## Проверяемые продуктовые гипотезы
298:3. **Миссия понятна без объяснения:** игрок различает игровой токен, вклад
301:4. **Миссия ощущается, а не декларируется:** ранний вклад, видимый прогресс и
304:Каузальный эффект миссии на retention и share доказывается не retention
305:самих вкладчиков: они уже являются self-selected вовлечённой группой.
306:Доказательство — versioned holdout «миссионный слой против базового
309:миссионному UX, а не уменьшает уже обещанный животному гарантированный
311:контрольная группа получает миссионный слой после окна сравнения, никто
312:не остаётся в продукте без миссии постоянно. Пользователи, пришедшие по
314:обещан миссионный опыт. Causal-вывод требует рассчитанного sample-size
318:Очередь гипотез после: миссионный слой → incremental active days/retention;
323:## North Star tree
340:  retention вкладчиков и заполнение progress bar сами по себе успехом не
343:## Impact-экономика
345:### Кто платит
348:- Глобального cap помощи нет: `impact pool += X% × eligible net
350:  буквальное определение eligible net revenue — комиссии платформ,
352:  token goal версионируются и меняются только для будущих сезонов,
354:- Каждый кейс получает гарантированный подарок независимо от
355:  активности: он резервируется из посева/pool до публикации кейса
356:  (READY). Кейс, который платформа не может гарантировать, не
359:  правило. При UNLOCKED размер подарка фиксируется immutable receipt:
360:  `gift = min(guaranteed minimum + unlock_share(token-прогресс) ×
361:  settled unallocated eligible pool на снапшоте UNLOCKED,
363:  snapshot/cursor пула; всё, что settled позже cursor'а, достаётся
365:  `unlock_share` — опубликованная детерминированная функция прогресса
366:  к token goal (пропорция или ступени; при достигнутой цели = 100%):
369:  части остаются в pool и переходят следующему сезону. Считается
373:  кейса и далее по правилу rollover следующему сезону. Это граница
379:- На старте гарантированный подарок и первые кейсы могут полностью
380:  сидироваться основателем. Это не маскируется под вклад рекламной выручки.
384:### Что видит игрок
387:  вклад сообщества (токены к token goal), гарантировано платформой,
388:  зарезервировано и открыто, реально передано. Токен-бар никогда не
391:  eligible revenue, формула, snapshot/cursor пула, гарантированный и
392:  stretch deliverables, правило rollover, получатель и closure
396:- Нельзя обещать причинность, которой нет: если деньги уже гарантированы,
400:### Остальная экономика
407:- **Подписка отменяет рекламу и участвует в миссии двумя контурами.**
409:  в impact pool — это единственное благотворительное обещание подписки;
410:  ad-free игрок не становится менее ценным участником миссии. (2)
424:  коллекциями и автоматически поступают во вклад текущего кейса
425:  отдельными server-owned contribution receipts; исторический
426:  puzzle-баланс вкладом не становится. Токены больше не являются
428:- Токены участия нельзя купить напрямую за деньги/Stars: миссионный
429:  вклад подтверждает игру и коллекционный прогресс, а не покупку
445:## Виральность
458:  закрытие коллекций и усиливать общий вклад; любая коллекция
473:## Trust, safety и rights
475:### Миссионный контур
477:- **Операционный контур помощи — функция продукта.** Верификация приюта и
480:- **Append-only evidence.** Case contract, изменения, игровые вклады,
481:  funding, payout и closure receipts сохраняются как воспроизводимые факты.
488:- **Human-true production.** Публичный вклад и публичная активность могут
495:  обещание («доля цены подписки идёт в impact pool») допускается только
499:### Контентный контур
515:- **Anti-abuse:** игровые и миссионные награды выводятся из server-owned
516:  evidence и фиксированных пулов, а не caller-authored событий.
518:## Лестница продуктового доказательства
526:   вклад, закрытие и evidence.
528:   миссии, ранний вклад, отсутствие ложного понимания «я пожертвовал деньги»,
536:   контента/impact, D7/active days и versioned holdout миссионного слоя.
548:полный виртуальный приют и decoration-систему. Любое другое исключение —
551:## Что мы сознательно НЕ делаем
555:- Не продаём миссионные токены и не превращаем денежную покупку в публичный
568:- Не изображаем виртуальный приют как реально построенный объект, если это не
570:- Не показываем ботов на публичных миссионных поверхностях.
587:## Горизонты (июль 2026)
591:  контракт, вклад, реальное закрытие и evidence. Параллельно завершаются уже
593:- **Следом:** сезон/коллекции как миссионное топливо (server-owned
597:- **Дальше:** расширенная карта приюта; голосование за следующий
602:## Как использовать этот документ (для агентов)
     1	# Gap-карта Play for Good — v2 (30.07.2026)
     2	
     3	Основание: VISION v3.0 (workspace `cbe08ac`) + протокол решений
     4	`vision-patch-play-for-good-proposal.md`. Метод: три параллельные
     5	read-only разведки 30.07.2026 (swipe-backend / feed-prototype /
     6	остальной воркспейс). v2: внесены поправки кросс-ревью Codex (§18 в
     7	`play-for-good-gap-map-codex-research.md`) и решения оператора
     8	30.07.2026 (авто-вклад, полный пакет выключения острова, лапки без
     9	миграции ledger). Формат: по контурам — что есть → что требует
    10	v3.0 → вердикт (**строить / переиспользовать / ретемить / заморозить /
    11	не трогать**).
    12	
    13	## TL;DR
    14	
    15	| Контур | Вердикт |
    16	|---|---|
    17	| Миссионное ядро (кейсы/сезоны/подарки/pool) | **Строить с нуля** — на бэкенде 0 совпадений по season/impact/mission; но все паттерны готовы в island_*/feed_* |
    18	| Токены участия («лапки») | **Решено**: UX-ретеминг puzzles→лапки БЕЗ миграции старого ledger; вклад — новые human-true contribution receipts |
    19	| Вклад | **Решено: автоматический** — server-owned receipt за серию/дейлик/коллекцию, без кошелька/spend и без optimistic UI; церемония дискретна |
    20	| Коллекции | **Строить server-owned** — клиент чисто презентационный, сервер: 0 таблиц |
    21	| Остров → приют | **Ретемить с крупным реюзом**; UGC-центр — заморозить |
    22	| Share/campaign | **Переякорить** готовый challenge-рельс |
    23	| Holdout/телеметрия | **Строить по образцу** `feed_policy_assignments` |
    24	| Подписка/monetization | **Ничего не делать** до monetization-гейта |
    25	| Фабрика/консоль/деплой | **Точечные правки**, ядро не трогается |
    26	| Legacy (p4g-platform, play4good, liveops-shared, platform-bot) | **Не трогать** |
    27	
    28	---
    29	
    30	## 1. Миссионное ядро — строить (backend: `mission_*` namespace)
    31	
    32	Сейчас: `grep season|impact|mission|donation` по `swipe-backend/app/` —
    33	0 совпадений. Есть два per-user ledger'а (`reward_ledger` stars,
    34	`puzzle_ledger` puzzles), пула нет.
    35	
    36	Строить, с прямыми образцами из существующего кода:
    37	
    38	- **Контракт кейса** — immutable versioned документ с digest; образец:
    39	  `feed_policy_config_versions` (composite PK kind/version, digest-CHECK,
    40	  жёсткая связка kind↔schema, composite-FK «пин» из потребителей).
    41	- **Lifecycle READY→ACTIVE→UNLOCKED→FULFILLED** — append-only журнал
    42	  переходов + derived state по `seq DESC`; образец:
    43	  `island_moderation_actions` (commit-order truth, никакого мутабельного
    44	  статуса).
    45	- **Журнал вкладов** — `seq` из sequence под row-lock кейса + immutable
    46	  terminal receipt в той же транзакции (byte-identical replay); образец:
    47	  пара `island_completion_claims` + `island_completion_outcomes`
    48	  (docstring контракта в `app/api_island_social_core.py:1-10`).
    49	- **Impact pool ledger** — новый append-only журнал rolling-пула
    50	  (источники: seed / revenue_share / partner / subscription_share) +
    51	  receipt резервирования гарантированного подарка при READY;
    52	  UNLOCKED-receipt фиксирует снапшот пула:
    53	  `gift = min(guaranteed + unlock_share(progress) × settled unallocated
    54	  eligible pool at UNLOCKED snapshot, need + stretch)` — receipt хранит
    55	  snapshot/cursor, всё settled позже cursor'а достаётся следующим
    56	  кейсам; отдельного «окна сезона» нет; излишки остаются в pool.
    57	  Писать идемпотентными writer'ами по паттерну
    58	  `award_stars_with_status` (`ON CONFLICT DO NOTHING RETURNING`).
    59	- **Evidence FULFILLED** — фото/видео/мини-отчёт; образец хранения:
    60	  `mobile_review_artifacts` (CAS по digest), но потребуется расширение
    61	  типов (сейчас только text/html, ≤4 MiB) или R2-паттерн из island P5.
    62	- **Внешние эффекты/уведомления** («случилось хорошее», выплаты) —
    63	  outbox+attempts; образец: `island_notification_outbox` +
    64	  `island_notification_attempts` (lease, dedup_key, quiet hours).
    65	- **Флаги**: `ENABLE_MISSION_*` default-off, гейтят монтирование
    66	  роутеров + cross-flag валидатор в `config.py` (существующая
    67	  дисциплина).
    68	
    69	**Операторский контур кейса** (публикация/закрытие кейса = human
    70	authority): реюз целиком существующего паттерна — `catalog_lab_auth`
    71	(grant/scope), `mobile_review_bundles/decisions/consumptions`
    72	(server-derived actor, explicit TMA Approve) и
    73	`catalog_operator_promotion` (CLI dry-run-first, CAS + append-only
    74	state log + intervention receipt). Важно: переиспользуется **паттерн**,
    75	а не журнал полномочий — impact-полномочия живут в отдельных scopes и
    76	отдельных `mission_review_*` таблицах, контентный `action_kind` не
    77	расширяется (evaluation / publication / impact / financial authority не
    78	смешиваются — инвариант VISION).
    79	Authority-таблица VISION уже содержит строку «Impact-кейс».
    80	
    81	**Клиент**: поверхности нет вообще. Строить: виджет текущего кейса
    82	(токен-бар к token goal + 4 числа: вклад сообщества / гарантировано /
    83	зарезервировано+открыто / передано), церемония вклада, церемонии
    84	UNLOCKED и FULFILLED. Точки врезки в `feed-prototype/src/feed.ts`:
    85	series-win экран (`showSeriesWinScreen` :4937) и стек CTA после сундука
    86	(сейчас: island-visit-award ИЛИ challenge-пилюля — стек надо
    87	пересобрать с вклад-церемонией).
    88	
    89	## 2. Токены участия «лапки» — решено: UX-ретеминг без миграции ledger
    90	
    91	Сейчас на клиенте три понятия: **stars** (level-ring, server-auth),
    92	**puzzles** (реальная мета-валюта: HUD-бейдж, optimistic+rollback,
    93	`PuzzleLedger`, дейлики платят puzzles), и два мёртвых `tokens`
    94	(зеркало puzzles в острове; мок `metaTokens`).
    95	
    96	Решения (оператор + кросс-ревью, 30.07.2026):
    97	
    98	- **В UX лапки заменяют puzzles.** Переиспользуются иконки, анимации,
    99	  детерминированные reward-функции (`app/rewards.py` /
   100	  `src/rewards.mjs`) и result-интеграция.
   101	- **Исторический `PuzzleLedger` НЕ конвертируется во вклад**: баланс
   102	  загрязнён starter grant 120, старыми daily-наградами, island
   103	  gifts/collect и bot-derived начислениями — он не human-true. Новые
   104	  лапки пишутся отдельными contribution receipts в mission-домене;
   105	  старый puzzle-баланс благотворительным вкладом не становится.
   106	- **Вклад автоматический**: серия / дейлик / завершение коллекции
   107	  создаёт server-owned contribution receipt, лапки сразу попадают в
   108	  текущий ACTIVE-кейс. Личного кошелька, spend-акта и «неиспользованных
   109	  токенов» нет; HUD показывает вклад, а не баланс. Публичный бар
   110	  двигается только после server receipt — optimistic-контур puzzles ко
   111	  вкладу не применяется. Церемония остаётся дискретной: «ты принёс 20
   112	  лапок» → бар сдвинулся. Если результат принят сервером после запуска
   113	  следующего кейса — вклад идёт в новый ACTIVE, и receipt явно это
   114	  показывает. Вклад, пересекающий token goal, делится детерминированно:
   115	  до цели — текущему кейсу (он проходит UNLOCKED), остаток — новому
   116	  ACTIVE; один receipt с двумя allocation-строками. Источник вклада —
   117	  «завершённая qualified-серия» (не отдельный уровень), дейлик,
   118	  завершение коллекции.
   119	- **Дейлики — источник вклада** (решение оператора); веса источников —
   120	  versioned config.
   121	
   122	## 3. Коллекции — строить server-owned
   123	
   124	Сейчас: клиент `src/collections.ts` — один хардкод-набор
   125	(«Золотые хиты», 10 карт), дроп карточек из сундука «presentation-only»
   126	(1–3 карты всегда, прогресс НЕ меняется — комментарий в
   127	`feed.ts:4834`), прогресс в localStorage с демо-предзаполнением; фид
   128	прогресс никогда не пишет. Backend: **0 таблиц, 0 endpoints**.
   129	
   130	Строить:
   131	- Server-owned инвентарь/прогресс + дроп как server-derived receipt
   132	  (детерминированно от run_id, тем же паттерном, что rewards);
   133	  клиентский дроп из сундука перестаёт быть косметикой.
   134	- Сезонная привязка коллекции (коллекция сезона-кейса), архив +
   135	  дозакрытие, универсальные фрагменты.
   136	- Токены за завершение коллекции («заметно больший вклад» + малая
   137	  церемония).
   138	- «Попросить помочь»: ссылка сезон+карточка+отправитель → qualified
   139	  серия друга → receipt: фрагмент владельцу, токены помощнику. Реюз:
   140	  `island_friend_codes`/`island_friendships` (соц-граф уже есть,
   141	  включая `source='challenge'`), deep-link паттерн challenge.
   142	- Контент-пайплайн карточек сезона: первую коллекцию собираем руками
   143	  (как и drop-config), НЕ ставя её в зависимость от setting factory;
   144	  фабричная тематизация — позже, отдельным шагом.
   145	
   146	## 4. Остров → приют — ретемить, UGC-центр заморозить
   147	
   148	Реюз (backend): `island_states` (CAS-снапшот) как образец состояния
   149	карты приюта; social-проекции и журналы; notification outbox; соц-граф
   150	друзей; advisory-lock паттерны. Клиент: `island.ts` (4279 строк) —
   151	SVG-карта, церемонии апгрейда, полёты — годится как каркас
   152	приют-поверхности (карта: текущий кейс + монумент FULFILLED + личная
   153	витрина с коллекциями/кипсейками).
   154	
   155	Заморозить (уходит из центра, код остаётся за флагами):
   156	- UGC-генерация в острове: `bakeAndHost`, `generatePackage`,
   157	  `runExperiment`, `publishExperiment` (island.ts), `island_bake_jobs`,
   158	  `island_theme_jobs`, swipe-ugc воркер — расширение только после
   159	  отдельного доказательства пользы для PFG (VISION).
   160	- Механики-как-здания и рост от чужих плеев; гостевые визиты и
   161	  visit-award карточка после сундука (`island_visit_awards`) —
   162	  отложены до gap-анализа приюта v2.
   163	- **Боты**: bot scheduler (`app/island_bots.py`) — human-true инвариант
   164	  запрещает бот-факты на миссионных поверхностях. Приютские поверхности
   165	  строятся без бот-источников с первого дня; legacy-остров выключается
   166	  полным пакетом Этапа 0 (см. ниже).
   167	- «Кто-то сыграл» поллинг (`pollIslandActivity`, feed.ts:4616) →
   168	  перенастроить на миссионные факты («кто-то внёс», «случилось
   169	  хорошее» после FULFILLED).
   170	
   171	Namespace-решение: **новый `mission_*` рядом, island_* не мигрируем и
   172	не делаем authority приюта** — переиспользуются паттерны и визуальные
   173	компоненты, не семантика данных.
   174	
   175	**Пакет полного выключения острова (Этап 0; решение оператора
   176	30.07.2026, состав дополнен кросс-ревью):** четырёх `ENABLE_ISLAND_*`
   177	флагов недостаточно — в `swipe-backend/app/main.py:193+` безусловно
   178	монтируются `island_state_router`, старые public/visit/like routes,
   179	theme- и bake-generation, а `ISLAND_REWARDS_ENABLED` имеет default
   180	**true**. Полный пакет:
   181	1) выпустить клиент без island/visit/notification-флагов;
   182	2) `ENABLE_ISLAND_SOCIAL/BOTS/VISIT_AWARDS/NOTIFICATIONS = false`;
   183	3) явно выставить `ISLAND_REWARDS_ENABLED = false`;
   184	4) добавить верхнеуровневый gate для state/public/theme/bake routes —
   185	   иначе кэшированный клиент или прямой запрос продолжит ходить в API
   186	   и создавать model/storage cost;
   187	5) данные не удалять.
   188	`ENABLE_ISLAND_CLOSED_DELIVERY` **остаётся включённым** вместе с
   189	moderation/recall — это защитный read-path уже опубликованных
   190	private-UGC артефактов, не engagement-механика.
   191	
   192	## 5. Share/campaign — переякорить challenge-рельс
   193	
   194	Есть и работает: challenge v1 бэкенд (specs/bindings/events/receipts,
   195	`mini_app_deep_link`, share_url), клиентская пилюля на series-win,
   196	`ENABLE_CHALLENGE_V1` off в проде; вход игрока — `swipe-bot`
   197	(startapp).
   198	
   199	Строить/менять:
   200	- Campaign-ссылка текущего кейса — тот же server-issued deep-link
   201	  паттерн; приём startapp-параметра кейса в `main.ts` (рядом с
   202	  `i_`/`f_`/uuid-challenge).
   203	- Пометка campaign-привлечённых юзеров (для исключения из holdout) —
   204	  на моменте первой сессии.
   205	- CTA-стек series-win пересобрать: вклад-церемония (главная) →
   206	  campaign share → challenge (вторичен).
   207	- «Попросить помочь» — третий линк-тип (см. §3).
   208	
   209	## 6. Подписка/monetization — не строить
   210	
   211	Кода подписки нет нигде (ни флага, ни таблицы). По VISION — включение
   212	не раньше числовых когорт, после legal review. Единственное требование
   213	сейчас: impact pool ledger проектировать с полем источника
   214	(seed | revenue_share | partner | subscription_share), чтобы позже не
   215	мигрировать.
   216	
   217	## 7. Holdout и телеметрия — строить по готовому образцу
   218	
   219	Есть: `feed_policy_assignments` — ровно нужный паттерн (immutable
   220	ITT-назначение до первой инспекции, UNIQUE (user, namespace, kind),
   221	receipt+digest, composite-FK пин из потребителей); простой inline
   222	вариант — `island_visit_awards.holdout` + `_bucket(seed)`.
   223	
   224	Строить: mission-namespace assignment (exposure gate всей миссионной
   225	поверхности на клиенте), delayed re-exposure, исключение
   226	campaign-трафика. **Authority-граница:** факты вклада и exposure —
   227	только server-derived (contribution receipts, assignment receipts);
   228	best-effort cp/client events — вспомогательная телеметрия, не
   229	authority. **Отчётность — отдельный mission experiment/report контур:**
   230	контракт C1 прямо исключает retention и causal-гипотезы — C1 даёт
   231	только игровые знаменатели; North Star дерево миссии (leading mission /
   232	impact operations / anti-metrics) — в новый отчёт +
   233	`platform-scheme/hypotheses.json`. Инфраструктуру holdout можно
   234	включить с когорты 30–50, но causal-вывод — только после power
   235	calculation (вероятно, сотни пользователей); для friend cohort все
   236	видят миссию.
   237	
   238	## 8. Фабрика/консоль/деплой — точечные правки
   239	
   240	- **swipe-generator** (фабрика + Lab-консоль): ядро не трогается.
   241	  Позже: сезонная тематизация брифов (`night.series-brief.v1`,
   242	  setting-фабрика под тему кейса), возможный Lab-экран кейсов. TMA
   243	  publish-паттерн (`catalog.promotion-binding`, Approve только в
   244	  Telegram) — реюз для кейсов, см. §1.
   245	- **platform-scheme**: правило репо — после правки VISION.md
   246	  пересобрать и переопубликовать схему (build.mjs вшивает VISION с
   247	  провенансом). **Немедленный долг после `cbe08ac`.**
   248	  `hypotheses.json` (asOf 2026-07-28) — обновить под миссионные
   249	  гипотезы.
   250	- **Корневые доки**: CLAUDE.md — добавить durable-строку о пивоте и
   251	  миссионном контуре (после первых миграций); AGENTS.md — карта нового
   252	  контура; AGENT-ROLES.md — impact-authority уже в VISION.
   253	- **swipe-bot** — точка входа campaign-ссылок (см. §5);
   254	  playables/деплой-контур не затрагивается.
   255	- Мок `?metaworld=1` (Creator District, `metaTokens`) — мёртвый
   256	  прототип, кандидат на удаление при ретеминге бара (вопрос №4).
   257	
   258	## 9. Не трогать
   259	
   260	feed_* shadow/effectful/sequencing контур (≈50 таблиц — ортогонален),
   261	каталожный контур и его гейты (`levelSeries=false` неизменен), legacy:
   262	`p4g-platform`, `play4good`, `play4good_test`, `liveops-shared`,
   263	`platform-bot`, `solitaire-core`/`mahjong-core`/прочие старые пакеты,
   264	`playables-feed-deploy` (stale worktree).
   265	
   266	## 10. Последовательность
   267	
   268	- **Этап 0 (сейчас):** VISION v3.0.1 зафиксирован (`96df90a`:
   269	  авто-вклад, rolling pool); осталось: пересборка platform-scheme;
   270	  полный пакет выключения legacy-острова (§4); durable-запись в
   271	  CLAUDE.md.
   272	- **Этап 1 — Mission-slice v0 (founder dogfood):** backend `mission_*`
   273	  ядро (контракт кейса + посев/резервирование + журнал вкладов +
   274	  UNLOCKED receipt + ручное FULFILLED evidence через операторский
   275	  паттерн), минимальная клиентская поверхность кейса + вклад-церемония;
   276	  всё default-off; реальный маленький кейс с локальным приютом.
   277	  Параллельно (вне кода): договорённость с приютом, права на медиа,
   278	  формат отчёта.
   279	- **Этап 2 — server-owned коллекции:** инвентарь, server-derived дропы,
   280	  сезонная привязка, токены за завершение.
   281	- **Этап 3 — приют v1:** карта (кейс + монумент + витрина) за вкладкой
   282	  «мета» вместо острова.
   283	- **Этап 4 — campaign share + «Попросить помочь».**
   284	- **Этап 5 — holdout-инфра** (перед когортой 30–50).
   285	
   286	Каждый этап — по существующей культуре: default-off флаги, append-only
   287	receipts, dry-run CLI, author≠reviewer, операторские гейты.
   288	
   289	## Решения оператора (30.07.2026, включая кросс-ревью Codex)
   290	
   291	1. **Валюта вклада: puzzles → «лапки» в UX, без миграции ledger** —
   292	   исторический puzzle-баланс вкладом не становится; новые лапки =
   293	   отдельные contribution receipts (§2).
   294	2. **Вклад — автоматический**: server-owned receipt за завершённую
   295	   qualified-серию / дейлик / коллекцию, без личного кошелька и
   296	   spend-акта, без optimistic UI; церемония дискретна. Зафиксировано в
   297	   VISION v3.0.1 (`96df90a`).
   298	3. **Legacy-остров выключить сейчас полным пакетом** (см. §4:
   299	   +`ISLAND_REWARDS_ENABLED=false`, +верхнеуровневый gate безусловно
   300	   смонтированных routes; closed delivery + moderation/recall остаются
   301	   включёнными; данные не удаляются).
   302	4. **Дейлики — источник вклада: да**; веса — versioned config.
   303	5. **`?metaworld=1`** — подтверждено: удалить при ретеминге бара
   304	   (Этап 3).
   305	6. **Параметры карточных дропов и первая коллекция** — руками в
   306	   versioned config, без зависимости от setting factory.
   307	
   308	Следующий шаг: ТЗ Этапа 1 (mission-slice v0) + пакет выключения
   309	острова (Этап 0).

exec
/bin/zsh -lc "nl -ba VISION.md | sed -n '1,160p'
nl -ba VISION.md | sed -n '340,405p'
nl -ba VISION.md | sed -n '473,535p'
nl -ba VISION.md | sed -n '587,616p'
nl -ba play-for-good-gap-map-v1.md | sed -n '30,90p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# VISION — Play for Good puzzle platform
     2	
     3	Утверждено юзером 30.07.2026 (v3.0: Play for Good — пользовательский
     4	смысл продукта; один активный кейс = сезон; подарок-модель с
     5	гарантированным минимумом, unlock_share и immutable receipts; коллекции
     6	и приют-монумент вместо генеративной меты как центра;
     7	trust/human-true/no-guilt инварианты; протокол решений —
     8	`vision-patch-play-for-good-proposal.md`; v2.7 и более ранние версии —
     9	в git-истории).
    10	Правки — только через юзера.
    11	
    12	Это продуктовый authority и фильтр триажа: агент, получивший
    13	идею/фичу/фидбек, сверяется с этим документом и отвечает «в направлении» или
    14	«мимо».
    15	
    16	## Обещание игроку
    17	
    18	**Твои любимые пазлы теперь ещё и помогают.**
    19	
    20	Play for Good превращает привычное время отдыха в простой коллективный способ
    21	делать реальное добро. Пользователь играет в короткие любимые пазлы, получает
    22	игровые токены участия и вносит их в один текущий кейс помощи животному или
    23	приюту. Платформа гарантирует реальную помощь независимо от активности
    24	игроков; подтверждённая игра сообщества открывает дополнительную помощь из
    25	заранее описанного impact-бюджета.
    26	
    27	Игрок не жертвует собственные деньги, а токен не притворяется деньгами.
    28	Компания финансирует помощь; игрок своим участием двигает текущий кейс,
    29	видит общий прогресс и получает подтверждение результата.
    30	
    31	У доброго дела нет слишком маленького размера: оно либо честно сделано, либо
    32	нет. «Передали 100 кг корма» — законченный результат. Это не повод называть
    33	его «спасением животного», если фактически сделано именно первое.
    34	
    35	## Что мы строим
    36	
    37	Пользовательская поверхность — социальная лента играбельного контента:
    38	пользователь свайпает короткие игровые моменты так же легко, как видео, но
    39	каждый момент можно **играть**. Telegram-first. Автоплей показывает геймплей
    40	до касания; перехват управления происходит незаметно, в том же темпе.
    41	
    42	Над лентой находится миссионный слой:
    43	
    44	1. в каждый момент времени на поверхности один конкретный активный кейс;
    45	2. завершённая серия даёт сундук и токены участия;
    46	3. коллекции дают те же токены и являются более сильным источником вклада;
    47	4. заработанный вклад заметно двигает общий прогресс к token goal;
    48	5. достижение token goal активирует подарок и первую церемонию;
    49	   реальная передача помощи подтверждается evidence и становится второй;
    50	6. результат остаётся в общем приюте-монументе и в личной истории игрока.
    51	
    52	Под лентой — **самоподдерживающийся продакшен**: платформа сама производит,
    53	отбирает и продвигает игровые механики. Человек остаётся источником эталонов
    54	и вкуса; всё остальное — конвейер. Фабрика контента — supply-moat и способ
    55	давать игроку любимые пазлы без голодания ленты, но не пользовательский смысл
    56	продукта.
    57	
    58	## Для кого первый продукт (гипотеза ICP)
    59	
    60	Кор-аудитория пазлового жанра: преимущественно женская, 30+, привычная к
    61	коротким лентам. Telegram — преимущество, потому что эта аудитория уже живёт
    62	в чатах/каналах и вход не требует установки: ссылка открывает играбельный
    63	момент мгновенно.
    64	
    65	Пересечение этой аудитории с Instagram-паттерном потребления и её отклик на
    66	миссию помощи животным — проверяемые гипотезы, не свойства пола или возраста,
    67	объявленные фактом.
    68	
    69	Friend cohort стремимся набирать из этого профиля. Удобная выборка «просто
    70	друзья» доказывает понятность UX, но не спрос — это ограничение фиксируем
    71	честно при чтении её результатов.
    72	
    73	## Основной продуктовый цикл
    74	
    75	`лента → любимая механика → серия → сундук/коллекция → вклад → текущий
    76	сезон-кейс → подарок (UNLOCKED) → подтверждённая передача (FULFILLED) →
    77	память`
    78	
    79	Qualified play = **сыгранная до конца серия** (до сундука). Всё дерево
    80	игровых метрик считается от этого акта.
    81	
    82	Mission contribution = server-owned contribution receipt о зачислении
    83	заработанных токенов участия в текущий публичный кейс. Это не денежный
    84	перевод игрока и не обещание фиксированной денежной стоимости токена.
    85	
    86	### Активный кейс (= текущий сезон)
    87	
    88	- В v1 одновременно активен один публичный кейс, и он же — текущий
    89	  сезон: сезон носит имя своего кейса и несёт его коллекции и кипсейк.
    90	  Кейс — одно животное или одна точно описанная потребность приюта.
    91	- Кейс всегда доступен с основной поверхности и не спрятан за выбором
    92	  между несколькими получателями.
    93	- Жизненный цикл: `READY (потребность проверена, гарантированный
    94	  подарок зарезервирован) → ACTIVE (сезон публичен, сообщество копит
    95	  токены) → UNLOCKED (сумма подарка зафиксирована immutable receipt) →
    96	  FULFILLED (помощь реально передана, evidence опубликован)`. Кейс
    97	  публикуется только из READY: активный кейс всегда уже обеспечен
    98	  деньгами. UNLOCKED наступает либо при достижении token goal, либо по
    99	  опубликованному unlock cutoff с фактическим частичным прогрессом —
   100	  дальше обе ветки одинаковы. После UNLOCKED сразу стартует следующий
   101	  сезон; после FULFILLED предыдущий появляется постоянной точкой в
   102	  приюте.
   103	- Публичный контракт фиксирует: получателя, потребность,
   104	  гарантированный deliverable, допустимые stretch deliverables, правило
   105	  rollover излишков (токенов и денег) следующему сезону, token goal,
   106	  правило pool-снапшота на UNLOCKED (settled unallocated eligible pool
   107	  + cursor), unlock cutoff (момент открытия подарка, если token goal
   108	  не достигнут раньше), latest fulfillment date реальной передачи (без
   109	  тревожного countdown) и ожидаемый вид подтверждения.
   110	- Потребности двух типов: масштабируемая (корм, лекарства, расходники —
   111	  точная денежная цель заранее не объявляется, размер подарка
   112	  определяет количество; якорь честности — receipt передачи) и
   113	  фиксированная (например, операция известной стоимости — денежная цель
   114	  декларируется).
   115	- Недостигнутый token goal не создаёт failure-состояния: по unlock
   116	  cutoff кейс всё равно проходит UNLOCKED с фактическим частичным
   117	  прогрессом — гарантированный подарок плюс открытая прогрессом часть
   118	  допсуммы, церемония позитивна и точна по состоянию: «платформа
   119	  гарантировала и зарезервировала подарок, сообщество открыло ещё X».
   120	  «Передали» звучит только на FULFILLED. Следующий сезон стартует как
   121	  обычно.
   122	- Кейс закрыт (FULFILLED) только после реального выполнения и проверки
   123	  обещанного действия. Заполненный игровой progress bar сам по себе
   124	  кейс не закрывает.
   125	- Темп сезона задаёт token goal — отдельный versioned-параметр, а не
   126	  денежный размер потребности: потребность и длительность сезона
   127	  настраиваются независимо. Для пилота предпочтительны небольшие
   128	  проверяемые потребности, позволяющие быстро пройти полный trust-loop.
   129	
   130	Выбор между параллельными кейсами не входит в v1: он размазывает общий
   131	прогресс и создаёт лишний моральный груз. Голосование за **следующий** кейс —
   132	отложенная гипотеза: оно меняет порядок очереди, а не отказывает кому-то в
   133	помощи.
   134	
   135	### Вклад
   136	
   137	- Вклад автоматический, но переживается как дискретный акт (решение
   138	  оператора 30.07.2026, заменяет прежнюю manual-vs-auto
   139	  pilot-гипотезу): каждая завершённая qualified-серия, дейлик или
   140	  завершение коллекции создаёт server-owned contribution receipt, и
   141	  лапки сразу попадают в текущий ACTIVE-кейс. Личного кошелька,
   142	  ручного «внести» и «неиспользованных токенов» нет.
   143	- Игрок видит отдельную церемонию вклада («ты принёс 20 лапок» — общий
   144	  бар сдвинулся); публичный бар двигается только после server receipt,
   145	  без optimistic-отрисовки. Если результат принят сервером после
   146	  запуска следующего кейса, вклад идёт в текущий ACTIVE-кейс, и
   147	  receipt явно это показывает.
   148	- Вклад, пересекающий token goal, делится детерминированно: часть до
   149	  цели зачисляется текущему кейсу (он проходит UNLOCKED, следующий
   150	  становится ACTIVE), остаток зачисляется новому ACTIVE-кейсу; один
   151	  receipt показывает обе allocation-строки.
   152	- Первый вклад должен быть достижим рано, чтобы миссия была пережита до
   153	  гринда; номиналы источников — versioned config.
   154	- Серии и дейлики дают обычный вклад; завершение коллекции даёт
   155	  существенно больший и отдельную церемонию.
   156	- Пользовательский язык — «твой вклад», «двинуть общее дело», «поиграй с
   157	  нами — это помогает». Не используем «право помочь нужно заслужить».
   158	
   159	## Во что мы верим (принципы)
   160	
   340	  retention вкладчиков и заполнение progress bar сами по себе успехом не
   341	  считаются. Все они управляемы платформой или подвержены selection bias.
   342	
   343	## Impact-экономика
   344	
   345	### Кто платит
   346	
   347	- Платформа, а не игрок, является источником денежной помощи.
   348	- Глобального cap помощи нет: `impact pool += X% × eligible net
   349	  revenue` (реклама, подписка, будущие партнёрские поступления;
   350	  буквальное определение eligible net revenue — комиссии платформ,
   351	  налоги, refunds — фиксируется на monetization/legal гейте). X% и
   352	  token goal версионируются и меняются только для будущих сезонов,
   353	  никогда задним числом.
   354	- Каждый кейс получает гарантированный подарок независимо от
   355	  активности: он резервируется из посева/pool до публикации кейса
   356	  (READY). Кейс, который платформа не может гарантировать, не
   357	  публикуется.
   358	- Дополнительная сумма заранее числом не объявляется — объявляется
   359	  правило. При UNLOCKED размер подарка фиксируется immutable receipt:
   360	  `gift = min(guaranteed minimum + unlock_share(token-прогресс) ×
   361	  settled unallocated eligible pool на снапшоте UNLOCKED,
   362	  подтверждённая потребность + stretch)`. Receipt фиксирует
   363	  snapshot/cursor пула; всё, что settled позже cursor'а, достаётся
   364	  следующим кейсам — отдельного «окна выручки сезона» не существует.
   365	  `unlock_share` — опубликованная детерминированная функция прогресса
   366	  к token goal (пропорция или ступени; при достигнутой цели = 100%):
   367	  игра действительно открывает дополнительную помощь, и частичный
   368	  прогресс открывает её частично. Неоткрытая и превышающая потребность
   369	  части остаются в pool и переходят следующему сезону. Считается
   370	  только settled/recognized выручка; поздние корректировки никогда не
   371	  уменьшают открытый подарок — они учитываются в следующих кейсах.
   372	- Излишек сверх подтверждённой потребности идёт в stretch deliverables
   373	  кейса и далее по правилу rollover следующему сезону. Это граница
   374	  потребности конкретного кейса, не cap добра.
   375	- Денежная часть подарка никогда не случайна и не зависит от скрытой
   376	  вероятности (charity-lootbox запрещён). Сюрприз — только неизвестная
   377	  заранее будущая выручка и церемония; формула доступна в один тап.
   378	- Токены не создают глобального курса «токен → деньги».
   379	- На старте гарантированный подарок и первые кейсы могут полностью
   380	  сидироваться основателем. Это не маскируется под вклад рекламной выручки.
   381	- В будущем impact-бюджет может финансироваться партнёром или спонсором, но
   382	  это не даёт ему publication authority и требует той же прозрачности.
   383	
   384	### Что видит игрок
   385	
   386	- Основная поверхность показывает связанные, но разные факты: игровой
   387	  вклад сообщества (токены к token goal), гарантировано платформой,
   388	  зарезервировано и открыто, реально передано. Токен-бар никогда не
   389	  выдаётся за деньги.
   390	- Рядом доступен полный публичный контракт: источник, определение
   391	  eligible revenue, формула, snapshot/cursor пула, гарантированный и
   392	  stretch deliverables, правило rollover, получатель и closure
   393	  evidence.
   394	- Игровой токен не имеет денежного курса, не redeemable и не является
   395	  собственностью, пожертвованием или платёжным инструментом игрока.
   396	- Нельзя обещать причинность, которой нет: если деньги уже гарантированы,
   397	  говорим, что игра двигает общий прогресс и открывает дополнительное, а не
   398	  что без конкретного игрока животное останется без помощи.
   399	
   400	### Остальная экономика
   401	
   402	- **Реклама остаётся основой.** Рекламная единица может быть контентной
   403	  единицей: playable рекламодателя — обычная играбельная карточка ленты плюс
   404	  видео-формат. Продаём CPE, а не показы; append-only телеметрия даёт
   405	  evidence-backed отчёт. Impact-бюджет не является разрешением увеличить
   473	## Trust, safety и rights
   474	
   475	### Миссионный контур
   476	
   477	- **Операционный контур помощи — функция продукта.** Верификация приюта и
   478	  потребности, договорённость, funding, передача, документы, права на
   479	  историю/медиа и follow-up имеют владельца, очередь и наблюдаемый SLA.
   480	- **Append-only evidence.** Case contract, изменения, игровые вклады,
   481	  funding, payout и closure receipts сохраняются как воспроизводимые факты.
   482	  Исправление не переписывает историю молча.
   483	- **Точность заявления.** Публичное описание равно подтверждаемому действию:
   484	  корм — это корм, вакцинация — вакцинация, операция — операция.
   485	- **Достоинство без tragedy porn.** Используем конкретное имя и историю, но
   486	  не максимизируем distress, не драматизируем страдание и не превращаем
   487	  срочность в retention-механику.
   488	- **Human-true production.** Публичный вклад и публичная активность могут
   489	  исходить только от реального пользователя. Бот-тесты живут в отдельном
   490	  непубличном case scope и исключены из денег, проекций и метрик.
   491	- **Юридическая граница.** Модель «компания платит» не объявляется
   492	  автоматическим освобождением от требований к коммерческим благотворительным
   493	  партнёрствам, рекламе, отчётности, налогам, данным и медиа. Перед публичным
   494	  запуском проводится review по целевым юрисдикциям. Транзакционное
   495	  обещание («доля цены подписки идёт в impact pool») допускается только
   496	  точным, финансово обеспеченным, публично раскрытым и прошедшим review
   497	  целевых юрисдикций; скрывать существенное правило нельзя.
   498	
   499	### Контентный контур
   500	
   501	- **UGC-модерация — staged post-moderation (решение оператора
   502	  24.07.2026).** Автор может опубликовать exact UGC-артефакт после машинного
   503	  гейта проходимости. Этот гейт доказывает только техническую играбельность,
   504	  не безопасность содержания. До первого показа гостю обязательны:
   505	  report/block, мгновенный takedown по exact artifact revision,
   506	  операторская очередь новых публикаций с наблюдаемым review SLA и
   507	  отзываемая доставка артефакта.
   508	- Аудитория UGC расширена до всех пользователей явным решением оператора
   509	  25.07.2026; защитный контур этого решения остаётся обязательным, даже
   510	  когда UGC больше не является центром меты. Автоматизация moderation —
   511	  отдельное явное решение с fraud/abuse и safety evidence.
   512	- **Report/takedown** обязателен до любого расширения аудитории UGC.
   513	- **IP/бренды в промптах**: политика сознательно отложена; до решения — не
   514	  блокируем и не рекламируем; вопрос открыт.
   515	- **Anti-abuse:** игровые и миссионные награды выводятся из server-owned
   516	  evidence и фиксированных пулов, а не caller-authored событий.
   517	
   518	## Лестница продуктового доказательства
   519	
   520	Каждый шаг имеет записанные exit/kill критерии; переход — явное решение
   521	оператора.
   522	
   523	1. **Founder dogfood базовой ленты** — пройдено: полный цикл
   524	   фабрика→шлюз→лента→сундук работает на операторе. Mission-slice сначала
   525	   проходит собственный founder dogfood: один сидированный локальный кейс,
   526	   вклад, закрытие и evidence.
   527	2. **3–10 друзей** (стремимся к профилю ICP). Проверяем понятность ленты и
   528	   миссии, ранний вклад, отсутствие ложного понимания «я пожертвовал деньги»,
   529	   доверие к закрытию и желание вернуться. Exit — «хочется возвращаться»,
   530	   «всё понятно», qualified play у большинства и самостоятельные возвраты за
   531	   новой серией/кейсом без пинга; числовой порог сознательно не фиксируется.
   532	   Kill — устойчивые «непонятно / неинтересно / не верю / чувствую давление»
   533	   после честных итераций. Маленькая когорта не доказывает causal retention
   534	   effect.
   535	3. **30–50 закрытых пользователей.** Включаются числовые пороги, SLA
   587	## Горизонты (июль 2026)
   588	
   589	- **Сейчас:** friend cohort и подготовка минимального mission-slice: один
   590	  локальный shelter-партнёр, один небольшой сидированный кейс, публичный
   591	  контракт, вклад, реальное закрытие и evidence. Параллельно завершаются уже
   592	  взятые обязательства базовой ленты.
   593	- **Следом:** сезон/коллекции как миссионное топливо (server-owned
   594	  коллекции — предпосылка соц-помощи и токенов из коллекций); shelter
   595	  surface v1 (текущий кейс + общий архив + личная витрина); когорта
   596	  30–50 и holdout; campaign-first share/deep-link; «Попросить помочь».
   597	- **Дальше:** расширенная карта приюта; голосование за следующий
   598	  сезон-кейс как отдельная гипотеза; географические сезоны; sponsored
   599	  impact-бюджеты; mechanic-matched acquisition; Phase B только после
   600	  соответствующих гейтов.
   601	
   602	## Как использовать этот документ (для агентов)
   603	
   604	При триаже идеи ответь на пять вопросов:
   605	
   606	1. Усиливает ли она обещание «любимые пазлы теперь ещё и помогают»?
   607	2. Как она влияет на основной цикл от qualified play до подтверждённого
   608	   закрытия кейса?
   609	3. Не превращает ли она сострадание в давление, токен — в ложные деньги, а
   610	   рекламу — в моральную обязанность?
   611	4. В какой уровень лестницы доказательства и горизонт она попадает?
   612	5. Требует ли она человеческого вкуса, impact-, publication- или financial
   613	   authority — и где записан этот гейт?
   614	
   615	Нарушение trust/human-true/no-guilt инвариантов, раздела «НЕ делаем» или
   616	моратория — повод отклонить без эскалации.
    30	## 1. Миссионное ядро — строить (backend: `mission_*` namespace)
    31	
    32	Сейчас: `grep season|impact|mission|donation` по `swipe-backend/app/` —
    33	0 совпадений. Есть два per-user ledger'а (`reward_ledger` stars,
    34	`puzzle_ledger` puzzles), пула нет.
    35	
    36	Строить, с прямыми образцами из существующего кода:
    37	
    38	- **Контракт кейса** — immutable versioned документ с digest; образец:
    39	  `feed_policy_config_versions` (composite PK kind/version, digest-CHECK,
    40	  жёсткая связка kind↔schema, composite-FK «пин» из потребителей).
    41	- **Lifecycle READY→ACTIVE→UNLOCKED→FULFILLED** — append-only журнал
    42	  переходов + derived state по `seq DESC`; образец:
    43	  `island_moderation_actions` (commit-order truth, никакого мутабельного
    44	  статуса).
    45	- **Журнал вкладов** — `seq` из sequence под row-lock кейса + immutable
    46	  terminal receipt в той же транзакции (byte-identical replay); образец:
    47	  пара `island_completion_claims` + `island_completion_outcomes`
    48	  (docstring контракта в `app/api_island_social_core.py:1-10`).
    49	- **Impact pool ledger** — новый append-only журнал rolling-пула
    50	  (источники: seed / revenue_share / partner / subscription_share) +
    51	  receipt резервирования гарантированного подарка при READY;
    52	  UNLOCKED-receipt фиксирует снапшот пула:
    53	  `gift = min(guaranteed + unlock_share(progress) × settled unallocated
    54	  eligible pool at UNLOCKED snapshot, need + stretch)` — receipt хранит
    55	  snapshot/cursor, всё settled позже cursor'а достаётся следующим
    56	  кейсам; отдельного «окна сезона» нет; излишки остаются в pool.
    57	  Писать идемпотентными writer'ами по паттерну
    58	  `award_stars_with_status` (`ON CONFLICT DO NOTHING RETURNING`).
    59	- **Evidence FULFILLED** — фото/видео/мини-отчёт; образец хранения:
    60	  `mobile_review_artifacts` (CAS по digest), но потребуется расширение
    61	  типов (сейчас только text/html, ≤4 MiB) или R2-паттерн из island P5.
    62	- **Внешние эффекты/уведомления** («случилось хорошее», выплаты) —
    63	  outbox+attempts; образец: `island_notification_outbox` +
    64	  `island_notification_attempts` (lease, dedup_key, quiet hours).
    65	- **Флаги**: `ENABLE_MISSION_*` default-off, гейтят монтирование
    66	  роутеров + cross-flag валидатор в `config.py` (существующая
    67	  дисциплина).
    68	
    69	**Операторский контур кейса** (публикация/закрытие кейса = human
    70	authority): реюз целиком существующего паттерна — `catalog_lab_auth`
    71	(grant/scope), `mobile_review_bundles/decisions/consumptions`
    72	(server-derived actor, explicit TMA Approve) и
    73	`catalog_operator_promotion` (CLI dry-run-first, CAS + append-only
    74	state log + intervention receipt). Важно: переиспользуется **паттерн**,
    75	а не журнал полномочий — impact-полномочия живут в отдельных scopes и
    76	отдельных `mission_review_*` таблицах, контентный `action_kind` не
    77	расширяется (evaluation / publication / impact / financial authority не
    78	смешиваются — инвариант VISION).
    79	Authority-таблица VISION уже содержит строку «Impact-кейс».
    80	
    81	**Клиент**: поверхности нет вообще. Строить: виджет текущего кейса
    82	(токен-бар к token goal + 4 числа: вклад сообщества / гарантировано /
    83	зарезервировано+открыто / передано), церемония вклада, церемонии
    84	UNLOCKED и FULFILLED. Точки врезки в `feed-prototype/src/feed.ts`:
    85	series-win экран (`showSeriesWinScreen` :4937) и стек CTA после сундука
    86	(сейчас: island-visit-award ИЛИ challenge-пилюля — стек надо
    87	пересобрать с вклад-церемонией).
    88	
    89	## 2. Токены участия «лапки» — решено: UX-ретеминг без миграции ledger
    90	

exec
/bin/zsh -lc 'git diff --unified=40 4738103258e1866ba19a22187098448665612759''^ 4738103258e1866ba19a22187098448665612759 -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
diff --git a/play-for-good-stage0-island-off-tz.md b/play-for-good-stage0-island-off-tz.md
index e81e905..e517693 100644
--- a/play-for-good-stage0-island-off-tz.md
+++ b/play-for-good-stage0-island-off-tz.md
@@ -1,146 +1,180 @@
-# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v2
+# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v3
 
-Статус: **DRAFT v2 после кросс-ревью R1** (author: Claude; reviewer:
-Codex; findings R1: №1 разделение роутеров, №2 bake/theme runners,
-№8 порядок проверки cached-клиента, №9 snapshot manifest — все
+Статус: **DRAFT v3 после кросс-ревью R2** (author: Claude; reviewer:
+Codex; R1: разделение роутеров, runners, порядок проверки, manifest;
+R2: staged rollout с pre-set true, quiesce/drain runners,
+freeze-список вместо «ноль writes», точная карта роутеров — все
 внесены). Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
 
 Цель: обратимо вывести legacy-остров из прода целиком — клиентскую
 поверхность, backend-writers и генерационные runners — сохранив
 защитные контуры (closed delivery, public report, операторская
 модерация/takedown, recall) и не удаляя данных. Результат — «чистый
 Island-off baseline», предусловие реализации Этапа 1.
 
 Не-цели: удаление кода/таблиц/данных; ретеминг в приют; изменения
 feed/каталога/challenge; mission-функциональность.
 
 Инварианты пакета: данные не удаляются нигде; каждый шаг обратим одним
 env-flip или откатом билда; closed delivery, public report, модерация
 и recall работают на каждом шаге (проверяется в acceptance каждого
 шага, где применимо).
 
-Фактическое состояние (проверено 30.07.2026): `app/main.py` —
-`island_state_router` и `island_social_router` смонтированы безусловно
-(:193–194); **модерация смонтирована внутри
+Фактическое состояние (проверено 30.07.2026, уточнено R2):
+`app/main.py` — `island_state_router` и `island_social_router`
+смонтированы безусловно (:193–194); **модерация смонтирована внутри
 `if settings.enable_island_social:`** (:195–200) и авторизуется
-server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth); старый
-`island_router` (public/visit/like + artifact-url) — безусловно
-(:201); `start_bake_runner()` / `start_theme_runner()` вызываются
-безусловно в `lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_
-SOCIAL=false` одновременно убило бы модерацию и не остановило бы ни
-legacy-роуты, ни генерационные runners.
+server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth);
+`island_router` из `api_island.py` — **theme/bake generation**;
+`api_island_social.py` — **artifact-url, public, visits, likes**;
+`start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
+`lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
+одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
+ни генерационные runners. **Первый деливерабл П2 — точный route
+manifest**: каждый island-маршрут → файл → целевой контур; физическое
+разделение выполняется только по manifest'у, не по памяти.
 
 ---
 
 ## П1 — снятие клиентской поверхности
 
 Изменения: релиз feed-prototype с выключенными `VITE_ISLAND_ENABLED`,
 `VITE_ISLAND_VISIT_AWARDS_ENABLED`, `VITE_ISLAND_NOTIFICATIONS_ENABLED`
 (предварительно зафиксировать фактические значения деплой-окружения в
 receipt). Код не меняется — поверхность уже за флагами
 (`src/feed.ts:202-210`, deep-links в `src/main.ts`).
 
 Acceptance: свежая сессия — нет вкладки «мета», друзей в HUD,
 island-обработки deep-links; ноль запросов `/api/island/*`.
 Rollback: предыдущий клиентский билд.
 
 ## П2 — backend-код: физическое разделение контуров + гейты runners
 
-Изменения (одна PR в swipe-backend, деплоится при ещё включённых
-env-флагах — поведение прода не меняется):
+Изменения (одна PR в swipe-backend; прод-деплой — только в П4, после
+pre-set компенсирующих флагов):
 
-1. **Разделить роутеры на четыре независимых контура**:
-   a) legacy state/public/visit/like (включая `island_state_router`,
-      `island_social_router`, старый `island_router` без
-      закрытой доставки);
+0. **Route manifest** (деливерабл до кода): полный список
+   island-маршрутов с файлом-источником и целевым контуром.
+1. **Разделить роутеры на четыре независимых контура** (по
+   manifest'у):
+   a) legacy: state (`api_island_state`), public/visits/likes/
+      artifact-url (`api_island_social`), theme/bake generation
+      (`api_island`);
    b) closed-delivery resolver;
    c) public report (кнопка репорта — защитный контур);
    d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    получают собственные гейты: (b) — существующий
    `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
    `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
    контур не должен выключаться случайно).
-2. **`ENABLE_ISLAND_LEGACY_SURFACE` (default false)** гейтит: контур
-   (a) целиком И запуск `start_bake_runner()` / `start_theme_runner()`
-   в `lifespan` (при false runners не стартуют и не claim'ят jobs).
+2. **Два раздельных гейта вместо одного** (нужны для quiesce):
+   `ENABLE_ISLAND_LEGACY_SURFACE` (default false) — роуты контура (a);
+   `ENABLE_ISLAND_GENERATION_RUNNERS` (default false) — запуск/claim
+   `start_bake_runner()` / `start_theme_runner()` в `lifespan`.
+   Раздельность позволяет состояние «роуты закрыты, runners доживают
+   очередь».
 3. Cross-flag валидатор: явные ветки на новые комбинации.
 
-Acceptance (тесты + локально): при `LEGACY_SURFACE=false` — все пути
-контура (a) → 404, bake/theme runners не стартуют, **status/attempts
-существующих queued jobs не изменяются**; при `SOCIAL=false` —
-модерация, report и closed delivery продолжают работать; полный
-тест-сьют зелёный. Rollback: env-flip `LEGACY_SURFACE=true`.
+Acceptance (тесты + локально): при `LEGACY_SURFACE=false` все пути
+контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
+и **status/attempts существующих queued jobs не изменяются**; при
+`SOCIAL=false` — модерация, report и closed delivery продолжают
+работать; полный тест-сьют зелёный. Rollback: env-flip
+соответствующего флага в true.
 
 ## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)
 
 Работы: browser/E2E **старого прод-билда клиента** против локального
 backend с выключенными флагами П2: пройти серию до сундука; убедиться,
 что island-запросы получают 404 и деградация тихая — лента играет,
 крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
 обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
 visit-award, лайки).
 
 Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
 finding: чинится до П4.
 
-## П4 — прод-применение
-
-Порядок внутри шага: деплой кода П2 (флаги прода ещё on — поведение
-не меняется) → env-флипы одним изменением `render.yaml`:
-`ENABLE_ISLAND_SOCIAL=false`, `ENABLE_ISLAND_BOTS=false`,
-`ENABLE_ISLAND_VISIT_AWARDS=false`, `ENABLE_ISLAND_NOTIFICATIONS=false`,
-явно `ISLAND_REWARDS_ENABLED=false` (default true — полагаться на
-отсутствие нельзя); `ENABLE_ISLAND_LEGACY_SURFACE` не задаётся
-(default false); `ENABLE_ISLAND_CLOSED_DELIVERY=true` и
-`ENABLE_ISLAND_PROTECTIVE_SURFACE=true` сохраняются.
-
-Prod smoke: curl-набор по списку legacy-роутов → 404; closed delivery
-выдаёт signed GET на существующий артефакт; report-запрос и
-модерационная консоль работают; в логах нет bot/notification/bake/theme
-runner'ов.
-
-Rollback: env-flip обратно; повторное включение ботов безопасно by
-design (immutable per-day планы, bounded catch-up).
+## П4 — прод-применение (staged, каждый под-шаг — receipt + проверка)
+
+1. **Pre-set (до деплоя кода!):** в `render.yaml` заранее добавить
+   `ENABLE_ISLAND_LEGACY_SURFACE=true` и
+   `ENABLE_ISLAND_GENERATION_RUNNERS=true` (плюс явные
+   `ENABLE_ISLAND_PROTECTIVE_SURFACE=true`,
+   `ENABLE_ISLAND_CLOSED_DELIVERY=true`). Затем задеплоить код П2 —
+   деплой не меняет поведение прода (default-false флаги
+   компенсированы pre-set'ом). Smoke: legacy-роуты отвечают, runners
+   работают, модерация работает.
+2. **Flip поверхности:** `ENABLE_ISLAND_SOCIAL=false`,
+   `ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
+   `ENABLE_ISLAND_NOTIFICATIONS=false`, явно
+   `ISLAND_REWARDS_ENABLED=false` (default true),
+   `ENABLE_ISLAND_LEGACY_SURFACE=false`. Новые theme/bake jobs
+   невозможны (роуты закрыты); runners ещё включены.
+3. **Quiesce/drain:** дождаться terminal-состояния всех queued/running
+   bake/theme jobs (новых нет; bounded wait по lease TTL; job,
+   зависший в `generating`, резолвится вручную по runbook'у до
+   продолжения). Проверка: ноль незавершённых jobs.
+4. **Flip runners:** `ENABLE_ISLAND_GENERATION_RUNNERS=false`
+   (рестарт; runners больше не стартуют; ничего не оборвано
+   посередине — очередь пуста).
+5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
+   delivery выдаёт signed GET на существующий артефакт; report и
+   модерационная консоль работают; в логах нет
+   bot/notification/bake/theme runner'ов.
+
+Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
+включение ботов безопасно by design (immutable per-day планы, bounded
+catch-up).
 
 ## П5 — snapshot manifest, схема и доки
 
-1. **Data-manifest вместо голых row counts**: после drain (П4)
-   зафиксировать snapshot: row counts + max seq/id по всем `island_*`
-   таблицам, список queued/running bake/theme jobs со status/attempts,
-   digest mutable-state (`island_states` revisions). Через ≥24 ч
-   проверить: ни одной новой island-write после cutoff, jobs не
-   изменились. Manifest — receipt пакета.
+1. **Data-manifest с явным freeze-списком** (после drain П4):
+   snapshot row counts + max seq/id + digest mutable-state по
+   **freeze-списку** legacy/social/economy таблиц: `island_states`,
+   `island_building_social`, `island_visits`, `island_building_likes`,
+   `island_completion_claims`, `island_completion_outcomes`,
+   `island_collect_claims`, `island_visit_awards`, `island_bots`,
+   `island_bot_daily_plans`, `island_friend_codes`,
+   `island_friendships`, `island_friend_blocks`,
+   `island_notification_outbox`, `island_notification_attempts`,
+   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
+   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
+   таблицы (`island_reports`, `island_moderation_actions`) в
+   freeze-список **не входят**: их writes разрешены и проверяются как
+   audit receipts — каждая новая строка соответствует конкретному
+   report/moderation-акту. Manifest — receipt пакета.
 2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
    v3.0.1).
 3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
    состав), durable-строка в корневой `CLAUDE.md`, при необходимости
    `AGENTS.md`.
 
 Acceptance: manifest-проверка чистая; схема опубликована;
 `docs-boundary-lint` чистый.
 
 ---
 
 ## Порядок применения
 
-П1 (клиент) → П2 (код, деплой без смены поведения) → П3 (pre-prod E2E
-старого клиента) → П4 (env-флипы + prod smoke) → П5
+П1 (клиент) → П2 (код: route manifest + разделение, PR без
+прод-деплоя) → П3 (pre-prod E2E старого клиента) → П4 (pre-set →
+деплой → staged env-flip'ы → drain → prod smoke) → П5
 (manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
 до следующего шага.
 
 ## Общий acceptance Этапа 0
 
 - Свежий клиент: ноль island-запросов.
 - Backend: контур (a) → 404; bake/theme/bot/notification runners не
   стартуют; queued jobs заморожены (status/attempts без изменений).
 - Closed delivery / public report / модерация / recall — проверены
   руками, работают.
 - Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
   после.
 - Rollback записан; минимум один шаг проверен обратным включением вне
   прода.
-- Data-manifest: ни одной island-write после cutoff; данные не
-  удалены.
+- Data-manifest: ноль записей в freeze-списке после cutoff; защитные
+  writes — только с audit-receipt; данные не удалены.
 
 Только после этого acceptance начинается реализация Этапа 1.
diff --git a/play-for-good-stage1-mission-slice-tz.md b/play-for-good-stage1-mission-slice-tz.md
index e0bfb7b..3ca0a0f 100644
--- a/play-for-good-stage1-mission-slice-tz.md
+++ b/play-for-good-stage1-mission-slice-tz.md
@@ -1,189 +1,223 @@
-# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v2
+# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v3
 
-Статус: **DRAFT v2 после кросс-ревью R1** (author: Claude; reviewer:
-Codex; findings R1: №3 dogfood-изоляция writers, №4 singleton
-ACTIVE/очередь, №5 receipt до клиента, №6 typed fulfillment/деньги,
-№7 инвариант суммы allocations, UX-watermark — все внесены).
+Статус: **DRAFT v3 после кросс-ревью R2** (author: Claude; reviewer:
+Codex; R1: dogfood-изоляция, singleton, receipt-доставка, fulfillment,
+инварианты; R2: 503-путь пустой очереди вместо >100%, exact contract
+identity во всей схеме, fulfillment↔N allocations, финансовая
+идемпотентность/округление, предусловие token_goal — все внесены).
 Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §1–2.
 **Предусловие реализации: чистый Island-off baseline (Этап 0 применён
 и проверен).**
 
 Цель: один маленький реальный кейс проходит полный честный цикл
 `READY → ACTIVE → авто-вклады → UNLOCKED → следующий ACTIVE → реальная
 передача → FULFILLED → evidence` на прод-инфраструктуре; игроки —
 только enrolled dogfood-пользователи (оператор). Всё default-off;
 для не-enrolled пользователей поведение платформы не меняется ни в
 чтении, ни в записи.
 
 Не-цели v0: коллекции и их вклад (Этап 2), приют-карта, campaign
 share, «Попросить помочь», holdout, подписка/VIP, голосование,
 sponsored-бюджеты, TMA-аппрув кейсов (v0 — internal CLI), автоматика
 FULFILLED, мультивалютность (v0 жёстко EUR).
 
 ---
 
 ## Бэкенд: namespace `mission_*` (одна новая миграция)
 
 Все журналы append-only; образцы — island_completion_claims/outcomes,
 island_moderation_actions, feed_policy_config_versions, award_*.
 
 1. **`mission_case_contracts`** — immutable контракт кейса:
    PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
    `document` JSONB schema `mission.case-contract.v1`: получатель;
    потребность `scalable|fixed`; guaranteed deliverable;
    **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
    `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
    (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
    `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
    `latest_fulfillment_at`; `queue_position`; ожидаемый вид
    подтверждения. `registered_by/at`.
 2. **`mission_runtime`** — **singleton-строка** (PK-константа,
-   CHECK id=1): `active_case_id` (nullable), `updated_seq`.
+   CHECK id=1): пара `active_case_id + active_contract_version`
+   (nullable вместе), `updated_seq`.
    **Единая точка сериализации: каждый lifecycle- и
    contribution-writer начинает транзакцию с
    `SELECT … FROM mission_runtime FOR UPDATE`** — двух ACTIVE-кейсов
    не существует by construction, авторитет «какой кейс ACTIVE» —
    эта строка (проекция, воспроизводимая из событий).
 3. **`mission_case_events`** — lifecycle: `seq` (nextval
    `mission_case_events_seq` под runtime-lock), пин контракта
    (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
    `payload`, `receipt_digest`; UNIQUE `(case_id, kind)`. Derived
    state кейса = последний kind по `seq DESC`.
 4. **`mission_pool_ledger`** — rolling pool: `source ∈
    seed|revenue_share|partner|subscription_share` (v0 — только seed),
    `amount_cents`, `currency` (CHECK `='EUR'`), `settled_at`, `meta`,
    `idempotency_key` UNIQUE.
 5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
-   reserve_guaranteed|gift_additional`, `case_id`, `amount_cents`,
-   `currency` (CHECK `='EUR'`), `pool_cursor`, `receipt`. Инвариант
-   (в транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
+   reserve_guaranteed|gift_additional`, `(case_id,
+   contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
+   `pool_cursor`, FK на породивший lifecycle event, `receipt`.
+   **Финансовая идемпотентность и границы:** UNIQUE idempotency
+   identity (`res:{case_id}:{contract_version}` /
+   `gift:{case_id}:{contract_version}`); округление
+   `unlock_share × cents` — вниз до целых центов; CHECK-и:
+   `unlock_share ∈ [0,1]` (в receipt), `guaranteed_cents ≤
+   confirmed_need_cents + stretch_cap_cents` (на контракте),
+   положительные `amount_cents` в ledger и allocations. Инвариант (в
+   транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
    ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
    unlock_share(progress) × settled unallocated pool на cursor,
    confirmed_need_cents + stretch_cap_cents)`.
 6. **`mission_contributions`** (+ child
    **`mission_contribution_allocations`**) — вклад: `user_id`,
    `source ∈ series|daily`, `amount`, `source_ref`,
    `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
    **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
    `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
    `seq` под runtime-lock; receipt в той же транзакции, replay
-   byte-identical. Child-allocations: обычно одна строка; при
-   пересечении `token_goal` — детерминированно две. **Инвариант
+   byte-identical. Child-allocations (каждая пинит `(case_id,
+   contract_version)`): обычно одна строка; при пересечении
+   `token_goal` — детерминированно две. **Инвариант
    `sum(child)=amount` — service-level в той же транзакции +
    reconciliation-тест** (обычный SQL CHECK не читает другие строки;
    constraint trigger — опциональное усиление позже).
-7. **`mission_fulfillments`** — typed transfer receipt
-   `mission.fulfillment-receipt.v1`: `case_id` + gift/allocation
-   identity (FK на конкретные allocations), `amount_cents`,
-   `currency` (CHECK `='EUR'`), `recipient`,
-   `transfer_reference`/`transfer_date`, `evidence_digest`,
-   immutable content-addressed `artifact_url`. Сервис проверяет, что
-   transfer покрыт указанными allocations кейса (сумма совпадает).
-   Публичное «реально передано» проецируется **только** из
-   fulfillment-receipts.
+7. **`mission_fulfillments`** (+ child
+   **`mission_fulfillment_allocations`**) — typed transfer receipt
+   `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
+   `amount_cents`, `currency` (CHECK `='EUR'`), `recipient`,
+   `transfer_reference`/`transfer_date`, `evidence_digest`, immutable
+   content-addressed `artifact_url`. Child-строки связывают receipt с
+   **каждой** покрываемой allocation-строкой (обычный перевод
+   покрывает две: `reserve_guaranteed` + `gift_additional`). Сервис
+   принимает fulfill только при полном покрытии зафиксированного gift
+   (`sum(child) = amount_cents = зарезервировано+открыто кейса`);
+   `FULFILLED` event пишется атомарно в той же транзакции. Публичное
+   «реально передано» проецируется **только** из fulfillment-receipts.
+
+**Exact contract identity проходит через всю схему:** runtime,
+case-events, pool-allocations, contribution-allocations и
+fulfillments пинят точную пару `(case_id, contract_version)`
+composite-FK — из каждой строки доказуемо, по какой версии контракта
+посчитаны goal и деньги.
 
 ### State machine и очередь
 
 `register-contract` → **`ready`** (отдельная CLI-команда: резервирует
 гарантию из pool — allocation `reserve_guaranteed` — и пишет
 ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
 (допустим только при `active_case_id IS NULL`; берёт head очереди
 READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
 `unlock-cutoff`) **в той же транзакции активирует следующий READY из
 очереди**. Правила:
 
-- Включение `ENABLE_MISSION_CORE` требует preflight: существует ACTIVE
-  и ≥1 READY-successor (проверка конфиг-валидатором/CLI).
-- Fallback пустой очереди: если пересекающий вклад пришёл, а READY
-  successor отсутствует — остаток зачисляется текущему кейсу сверх
-  цели (бар честно показывает >100%), вклад не теряется; операционный
-  инвариант — держать очередь непустой.
+- Включение `ENABLE_MISSION_CORE` требует **DB-preflight** —
+  CLI-команда и startup-проверка, не config-validator (у него нет
+  доступа к БД): существует ACTIVE и ≥1 READY-successor.
+- Аварийный путь пустой очереди (VISION-совместимый): транзакция
+  пересекающего вклада **не коммитится** и возвращает retryable
+  **503** — клиентский outbox сохраняет результат и повторит после
+  появления READY-кейса. Не 409: существующий result-outbox считает
+  409 terminal и удалит запись. `unlock-cutoff` при отсутствующем
+  successor отказывает до создания READY-кейса. Операционный
+  инвариант — держать очередь непустой; 503-ветка — предохранитель,
+  не рабочий режим.
+- Предусловие v0 (валидируется при `register-contract`): `token_goal`
+  каждого кейса ≥ максимально возможного одиночного вклада (максимум
+  серии/дейлика из reward-функций) — пересечение затрагивает максимум
+  два кейса, двух child-строк достаточно. Каскадное распределение по N
+  кейсам понадобится для крупных collection-наград (Этап 2).
 
 ### Dogfood-изоляция (writers И readers)
 
 Единый server-owned allowlist `MISSION_DOGFOOD_USER_IDS` применяется:
 (а) во врезках `/api/results` и daily-claim — **вклад создаётся только
 enrolled-пользователям**, для остальных поведение байт-в-байт прежнее;
 (б) в read API; (в) в `/session` отдаётся capability
 `mission_dogfood` (образец operator-debug-entry capability) — клиент
 монтирует миссию только при `VITE_MISSION_ENABLED && capability`.
 
 ### Врезки и доставка receipt до клиента
 
 - `POST /api/results` (терминальная серия) и daily-claim: в той же
   транзакции, что RewardLedger, — mission contribution; в ответ
   добавляется **optional блок `mission_contribution`** (receipt: id,
   amount, allocations по кейсам, состояние бара после). Ответ
   фиксируется как обычно; **`_verified_replay_response` восстанавливает
   тот же блок** (replay возвращает committed-байты; у receipts,
   созданных до включения флага, блока нет — это корректно).
 - Клиент: `ResultResp → outbox ResultReceipt` расширяется переносом
   `mission_contribution`; церемония вклада в series-win флоу читает
   **только** этот receipt (никакого optimistic). Аналогично для
   daily-ответа.
 
 ### Операторский CLI `python -m app.mission_ops`
 
 Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
 `unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
 digest + artifact URL). Все dry-run по умолчанию, `--apply` с
 обязательными exact-identity аргументами; каждый apply = case-event +
 receipt. Отдельный флаг `ENABLE_MISSION_OPS`, HTTP-маршрутов нет;
 impact-полномочия не смешиваются с контентными скоупами.
 
 ### Read API
 
 `ENABLE_MISSION_READ` + capability: `GET /api/mission/case` — текущий
 ACTIVE (токен-бар, четыре числа: вклад сообщества / гарантировано /
 зарезервировано и открыто / реально передано-из-fulfillments, контракт
 в один тап), мой вклад, последний FULFILLED (**с immutable event id для
 клиентского watermark**). Ответ — проекция только из receipts.
 
 ### Тесты (PG, обязательные)
 
 Полный E2E цикл; идемпотентность (`mc:{run_id}`, `mcd:` реплей →
 byte-identical); конкуренция под runtime-lock (два вклада добивают
 goal — ровно один UNLOCKED, остаток второго — новому ACTIVE);
 двух ACTIVE не существует (негативный тест `activate` при занятом
 runtime); split-инвариант + reconciliation; pool-инвариант; snapshot
 не меняется от поздних settled-строк; fulfillment coverage (transfer =
 сумма указанных allocations; чужие allocations → отказ);
 **не-enrolled пользователь: `/results`/daily байт-в-байт прежние
-(golden), вкладов нет, capability нет**; пустая очередь → бар >100%,
-вклад не потерян; up/down миграции.
+(golden), вкладов нет, capability нет**; пустая очередь → 503
+retryable, outbox сохраняет и повторяет после появления READY, вклад
+не потерян и не задублирован; fulfillment покрывает обе allocation
+child-строками, частичное покрытие → отказ без FULFILLED-события;
+пин `(case_id, contract_version)` присутствует во всех receipts;
+округление вниз и границы CHECK-ов; up/down миграции.
 
 ## Клиент (feed-prototype, `VITE_MISSION_ENABLED` + capability)
 
 - HUD-ретеминг: бейдж пазлов → «лапки»; значение = мой вклад в текущий
   кейс (server-derived). Старый puzzle-баланс уходит с поверхности
   (данные не трогаются). Optimistic ко вкладу не применяется.
 - Виджет кейса + экран кейса (четыре числа, контракт, история).
 - Церемония вклада в series-win флоу — из `mission_contribution`
   receipt результата (до challenge-пилюли); дейлик-клейм показывает
   лапки из receipt daily-ответа.
 - Церемонии UNLOCKED и FULFILLED — по read API; **client watermark по
   immutable event id** (образец island-celebrated-stages): каждая
   церемония показывается один раз, не при каждом входе.
 - Прод-сборка не меняется: без capability миссия не монтируется даже
   при включённом VITE-флаге.
 
 ## Операционка (вне кода, owner — оператор)
 
 Договорённость с локальным приютом; кейс №1 — масштабируемая
 потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
 формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
 READY до включения core** (требование preflight).
 
 ## Acceptance Этапа 1 (dogfood)
 
 Полный реальный цикл: контракт → посев → READY (резервирование) →
 ACTIVE → enrolled-оператор играет серии/дейлики, вклады с receipts →
 UNLOCKED (snapshot-receipt; кейс №2 ACTIVE) → реальная закупка корма и
 передача → FULFILLED с typed transfer receipt и evidence → обе
 церемонии показаны один раз (watermark). Все receipts воспроизводимы;
 для не-enrolled пользователей не изменилось ничего (проверено golden).
 
 ## Rollback
 
 Флаги off → поведение платформы прежнее; `mission_*` таблицы остаются
 (append-only, ни на что не влияют); миграция down — только вне прода.

codex
Первичная трассировка показывает, что заявленные R2-изменения присутствуют. Перехожу к более строгой проверке: не только наличие формулировок, но и выполнимость схемы — полнота island freeze/route-контуров, FK/idempotency модели денег и атомарность lifecycle при replay/ошибках.
exec
/bin/zsh -lc "grep -RhoE \"__tablename__[[:space:]]*=[[:space:]]*['\\\"]island_["'^'"'\\\"]+\" swipe-backend/app swipe-backend/alembic 2>/dev/null | sort -u
grep -RhnE '"'^(@[''^ ]*router|router'"\\.(get|post|put|delete|patch)|[A-Za-z_]+_router[[:space:]]*=|include_router\\()' swipe-backend/app/api_island*.py swipe-backend/app/main.py 2>/dev/null" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 35ms:
__tablename__ = "island_bake_jobs
__tablename__ = "island_bot_daily_plans
__tablename__ = "island_bots
__tablename__ = "island_building_likes
__tablename__ = "island_building_social
__tablename__ = "island_collect_claims
__tablename__ = "island_completion_claims
__tablename__ = "island_completion_outcomes
__tablename__ = "island_friend_blocks
__tablename__ = "island_friend_codes
__tablename__ = "island_friendships
__tablename__ = "island_meta_events
__tablename__ = "island_moderation_actions
__tablename__ = "island_notification_attempts
__tablename__ = "island_notification_outbox
__tablename__ = "island_reports
__tablename__ = "island_states
__tablename__ = "island_theme_jobs
__tablename__ = "island_visit_awards
__tablename__ = "island_visits
337:@router.post("/island/theme", status_code=status.HTTP_202_ACCEPTED)
453:@router.get("/island/theme/{job_id}")
465:@router.delete("/island/theme/{job_id}")
1022:@router.post("/island/bake", status_code=status.HTTP_202_ACCEPTED)
1090:@router.get("/island/bake/{job_id}")
157:@router.post("/island/buildings/{building_id}/report")
240:@router.get("/island/moderation/publications")
354:@router.get("/island/moderation/reports")
415:@router.post("/island/moderation/takedown")
461:@router.post("/island/moderation/restore")
507:@router.post("/island/moderation/reports/{report_id}/resolve")
250:@router.put("/island/friends/{user_id}/block")
311:@router.post("/island/visit-award/from-chest")
458:@router.post("/island/visit-award/{roll_id}/accept")
472:@router.post("/island/visit-award/{roll_id}/decline")
486:@router.put("/island/notifications/write-access")
159:@router.get("/island/artifact-url")
210:@router.get("/island/public/{owner_id}")
277:@router.post("/island/visits/start")
333:@router.post("/island/visits/{visit_id}/complete")
391:@router.put("/island/buildings/{building_id}/like")
166:@router.get("/island/activity")
258:@router.post("/island/visits/{visit_id}/result")
444:@router.post("/island/buildings/{building_id}/collect")
619:@router.post("/island/friends/code")
658:@router.post("/island/friends/accept")
719:@router.get("/island/friends")
750:@router.delete("/island/friends/{user_id}")
496:@router.get("/island/state")
508:@router.put("/island/state")

exec
/bin/zsh -lc "grep -nHE '"'^(router|[A-Za-z_]+_router)[[:space:]]*=|''^@router'"\\.(get|post|put|delete|patch)' swipe-backend/app/api_island*.py
nl -ba swipe-backend/app/main.py | sed -n '55,215p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
swipe-backend/app/api_island.py:39:router = APIRouter()
swipe-backend/app/api_island.py:337:@router.post("/island/theme", status_code=status.HTTP_202_ACCEPTED)
swipe-backend/app/api_island.py:453:@router.get("/island/theme/{job_id}")
swipe-backend/app/api_island.py:465:@router.delete("/island/theme/{job_id}")
swipe-backend/app/api_island.py:1022:@router.post("/island/bake", status_code=status.HTTP_202_ACCEPTED)
swipe-backend/app/api_island.py:1090:@router.get("/island/bake/{job_id}")
swipe-backend/app/api_island_moderation.py:58:router = APIRouter()
swipe-backend/app/api_island_moderation.py:157:@router.post("/island/buildings/{building_id}/report")
swipe-backend/app/api_island_moderation.py:240:@router.get("/island/moderation/publications")
swipe-backend/app/api_island_moderation.py:354:@router.get("/island/moderation/reports")
swipe-backend/app/api_island_moderation.py:415:@router.post("/island/moderation/takedown")
swipe-backend/app/api_island_moderation.py:461:@router.post("/island/moderation/restore")
swipe-backend/app/api_island_moderation.py:507:@router.post("/island/moderation/reports/{report_id}/resolve")
swipe-backend/app/api_island_p2.py:45:router = APIRouter()
swipe-backend/app/api_island_p2.py:250:@router.put("/island/friends/{user_id}/block")
swipe-backend/app/api_island_p2.py:311:@router.post("/island/visit-award/from-chest")
swipe-backend/app/api_island_p2.py:458:@router.post("/island/visit-award/{roll_id}/accept")
swipe-backend/app/api_island_p2.py:472:@router.post("/island/visit-award/{roll_id}/decline")
swipe-backend/app/api_island_p2.py:486:@router.put("/island/notifications/write-access")
swipe-backend/app/api_island_social.py:48:router = APIRouter()
swipe-backend/app/api_island_social.py:159:@router.get("/island/artifact-url")
swipe-backend/app/api_island_social.py:210:@router.get("/island/public/{owner_id}")
swipe-backend/app/api_island_social.py:277:@router.post("/island/visits/start")
swipe-backend/app/api_island_social.py:333:@router.post("/island/visits/{visit_id}/complete")
swipe-backend/app/api_island_social.py:391:@router.put("/island/buildings/{building_id}/like")
swipe-backend/app/api_island_social_core.py:55:router = APIRouter()
swipe-backend/app/api_island_social_core.py:166:@router.get("/island/activity")
swipe-backend/app/api_island_social_core.py:258:@router.post("/island/visits/{visit_id}/result")
swipe-backend/app/api_island_social_core.py:444:@router.post("/island/buildings/{building_id}/collect")
swipe-backend/app/api_island_social_core.py:619:@router.post("/island/friends/code")
swipe-backend/app/api_island_social_core.py:658:@router.post("/island/friends/accept")
swipe-backend/app/api_island_social_core.py:719:@router.get("/island/friends")
swipe-backend/app/api_island_social_core.py:750:@router.delete("/island/friends/{user_id}")
swipe-backend/app/api_island_state.py:36:router = APIRouter()
swipe-backend/app/api_island_state.py:496:@router.get("/island/state")
swipe-backend/app/api_island_state.py:508:@router.put("/island/state")
    55	from .api_island_state import router as island_state_router
    56	from .api_island_social import router as island_social_router
    57	from .api_island_social_core import router as island_social_core_router
    58	from .api_island_p2 import router as island_p2_router
    59	from .api_island_moderation import router as island_moderation_router
    60	from .island_bots import start_bot_runner, stop_bot_runner
    61	from .island_notifications import start_notification_runner, stop_notification_runner
    62	from .api_operator_level_flags import (
    63	    lab_router as operator_level_flags_lab_router,
    64	    router as operator_level_flags_router,
    65	)
    66	from .api_results import router as results_router
    67	from .api_runs import router as runs_router
    68	from .api_session import router as session_router
    69	from .api_stats import router as stats_router
    70	from .config import BACKEND_VERSION, get_settings
    71	from .catalog_lab_auth import validate_catalog_lab_auth_settings
    72	from .control_plane_lifecycle import start_control_plane_maintenance, stop_control_plane_maintenance
    73	
    74	@asynccontextmanager
    75	async def lifespan(_: FastAPI):
    76	    start_bake_runner()
    77	    start_theme_runner()
    78	    start_control_plane_maintenance()
    79	    start_bot_runner()
    80	    start_notification_runner()
    81	    try:
    82	        yield
    83	    finally:
    84	        await stop_notification_runner()
    85	        await stop_bot_runner()
    86	        await stop_control_plane_maintenance()
    87	        await stop_theme_runner()
    88	        await stop_bake_runner()
    89	
    90	
    91	settings = get_settings()
    92	validate_catalog_lab_auth_settings(settings)
    93	app = FastAPI(title="Swipe Backend", version="0.1.0", lifespan=lifespan)
    94	
    95	# CORS: the TMA (a Render Static Site) calls this backend cross-origin. Preflight
    96	# cached 24h (max_age) so there's no per-request OPTIONS round-trip on event batches.
    97	app.add_middleware(
    98	    CORSMiddleware,
    99	    allow_origins=settings.cors_origins,
   100	    allow_credentials=False,          # auth is a bearer header, not cookies
   101	    allow_methods=["*"],
   102	    allow_headers=["*"],
   103	    expose_headers=["X-Content-SHA256"],
   104	    max_age=86400,
   105	)
   106	
   107	api = APIRouter(prefix="/api")
   108	
   109	
   110	@api.get("/health")
   111	def health() -> dict:
   112	    """Liveness + keep-alive target (Render Cron pings this every 10 min so the
   113	    free instance doesn't spin down). Deliberately does NOT touch the DB — it must
   114	    stay green even if Postgres is briefly unreachable."""
   115	    s = get_settings()
   116	    return {
   117	        "ok": True,
   118	        "service": "swipe-backend",
   119	        "version": app.version,
   120	        "build": BACKEND_VERSION,
   121	        "island": {
   122	            "theme_configured": bool(s.anthropic_api_key),
   123	            "theme_model": s.island_theme_model,
   124	            "bake_runtime": bake_runtime_status(),
   125	        },
   126	    }
   127	
   128	
   129	api.include_router(session_router)
   130	api.include_router(daily_router)
   131	api.include_router(runs_router)
   132	api.include_router(results_router)
   133	api.include_router(challenges_router)
   134	api.include_router(control_plane_router)
   135	api.include_router(events_router)
   136	api.include_router(stats_router)
   137	if settings.enable_catalog_lab_auth:
   138	    api.include_router(catalog_lab_auth_router)
   139	    api.include_router(catalog_evaluations_router)
   140	    if settings.enable_operator_level_flags_lab:
   141	        api.include_router(operator_level_flags_lab_router)
   142	    if settings.enable_content_analytics_lab:
   143	        api.include_router(content_analytics_lab_router)
   144	    if settings.enable_c1_materialize_scheduler:
   145	        api.include_router(content_analytics_scheduler_router)
   146	    if settings.enable_catalog_publish:
   147	        api.include_router(catalog_publish_router)
   148	    if settings.enable_catalog_recall:
   149	        api.include_router(catalog_recall_router)
   150	    if settings.enable_catalog_read:
   151	        api.include_router(catalog_read_router)
   152	    if settings.enable_feed_roster_write:
   153	        api.include_router(feed_roster_router)
   154	    if settings.enable_mobile_series_order_review:
   155	        api.include_router(mobile_reviews_admin_router)
   156	        api.include_router(mobile_reviews_tma_router)
   157	    # Operator sequencing console: read+draft under one flag, and the
   158	    # committing route only under the separate apply flag, so it is
   159	    # physically absent from the app and OpenAPI until then.
   160	    if settings.enable_feed_sequencing_console:
   161	        api.include_router(feed_sequencing_console_router)
   162	        if settings.enable_feed_sequencing_console_apply:
   163	            api.include_router(feed_sequencing_console_apply_router)
   164	# Machine-to-machine read principal: a separate machine router + operator admin
   165	# router, both mounted ONLY under this flag and independent of ENABLE_DEV_ROUTES
   166	# (agents-m2m-read §5/§4a). Human routes are unchanged.
   167	if settings.enable_agents_m2m_read:
   168	    api.include_router(agents_content_analytics_router)
   169	    api.include_router(agents_principals_router)
   170	    if settings.enable_cohort_watch_read:
   171	        api.include_router(agents_cohort_watch_router)
   172	if settings.enable_catalog_allocation:
   173	    api.include_router(catalog_allocation_router)
   174	if settings.enable_catalog_player_v2:
   175	    api.include_router(catalog_player_v2_router)
   176	    if settings.enable_catalog_canary_dogfood:
   177	        api.include_router(catalog_canary_dogfood_router)
   178	if settings.enable_feed_effectful_authority:
   179	    api.include_router(feed_effectful_authority_router)
   180	    api.include_router(feed_generated_offer_router)
   181	# Read-only sequencing debug; absent from the app and OpenAPI while off, and
   182	# still allowlist-gated when on.
   183	if settings.enable_feed_sequencing_debug:
   184	    api.include_router(feed_sequencing_debug_router)
   185	if settings.enable_catalog_three_level_production_evidence:
   186	    api.include_router(catalog_three_level_evidence_router)
   187	if settings.enable_operator_level_flags:
   188	    api.include_router(operator_level_flags_router)
   189	if settings.enable_dev_routes and settings.dev_user_id_set:
   190	    api.include_router(dev_router)
   191	    if settings.enable_content_analytics:
   192	        api.include_router(content_analytics_router)
   193	api.include_router(island_state_router)
   194	api.include_router(island_social_router)
   195	if settings.enable_island_social:
   196	    api.include_router(island_social_core_router)
   197	    api.include_router(island_p2_router)
   198	    # P3 report + operator moderation (F011/F015). Operator routes additionally
   199	    # enforce the island_moderator_ids allowlist server-side on every request.
   200	    api.include_router(island_moderation_router)
   201	api.include_router(island_router)
   202	app.include_router(api)

exec
/bin/zsh -lc "nl -ba swipe-backend/app/api_island_social.py | sed -n '130,215p'
grep -RniE 'closed.delivery|closed_delivery|ENABLE_ISLAND_CLOSED_DELIVERY|enable_island_closed_delivery|signed GET|artifact-url' swipe-backend/app swipe-backend/docs/specs | head -200" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 789ms:
swipe-backend/app/config.py:293:    # P5 closed delivery. Default-off until legacy hosted artifacts have been
swipe-backend/app/config.py:296:    enable_island_closed_delivery: bool = False
swipe-backend/app/api_island.py:501:    if getattr(get_settings(), "enable_island_closed_delivery", False):
swipe-backend/app/api_island.py:510:    if require_enabled and not settings.enable_island_closed_delivery:
swipe-backend/app/api_island.py:588:        closed_delivery = s.enable_island_closed_delivery
swipe-backend/app/api_island.py:589:        if closed_delivery:
swipe-backend/app/api_island.py:628:        if closed_delivery:
swipe-backend/app/api_island.py:1040:    if s.enable_island_closed_delivery:
Binary file swipe-backend/app/__pycache__/config.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/api_island_state.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/api_island.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/api_island_social.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/island_health.cpython-313.pyc matches
swipe-backend/app/island_health.py:121:            "closedDelivery": bool(settings.enable_island_closed_delivery),
swipe-backend/app/api_island_social.py:122:        if getattr(settings, "enable_island_closed_delivery", False):
swipe-backend/app/api_island_social.py:125:    if getattr(settings, "enable_island_closed_delivery", False):
swipe-backend/app/api_island_social.py:159:@router.get("/island/artifact-url")
swipe-backend/app/api_island_social.py:166:    if not settings.enable_island_closed_delivery:
swipe-backend/app/api_island_social.py:237:        if get_settings().enable_island_closed_delivery:
swipe-backend/app/api_island_state.py:158:    # the default-off backend is deploying. Closed delivery strips it from every
swipe-backend/app/api_island_state.py:353:    if get_settings().enable_island_closed_delivery:
swipe-backend/app/api_island_state.py:401:    if get_settings().enable_island_closed_delivery:
swipe-backend/app/api_island_state.py:446:        if building.rel is not None and get_settings().enable_island_closed_delivery:
swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md:355:| Island Social Core · P1/P3/P4/P5 | P1 social facts/боты/друзья/сбор, P3 staged post-moderation, P4 async-only theme и P5 closed delivery смержены и задеплоены. Island UGC доступен всем пользователям; server moderator allowlist, block/takedown/current-identity re-check остаются authority. P4 wire — только durable `202 {job_id}` + polling. P5 migration `0057` хранит `rel + contentDigest`, private R2 resolver выдаёт 600-second signed GET без persistence/logging bearer; public Render UGC origin остановлен, UGC repo приватизирован. Owner-facing activity теперь читает только append-only `guest_visit`/`bot_schedule` completion claims через cursor-paged `GET /island/activity`; первый read ставит high-water без исторического replay, human/bot визуально различимы, simulator не возвращён | Social/bots/client/P2/P5 включены. Device matrix iOS/Android/macOS и production migration/replay/smoke закрыты 26.07.2026. Real-activity rollout: backend `ff67326`, feed `25d850c3`, platform content `e574a4e`; unauthenticated production probe нового route = 401, shipped profile на тот момент `true/true/true` (с 28.07 12:44 UTC — `true/false/false`, см. строку P2 ниже; сам `VITE_ISLAND_ENABLED` остаётся `true`), browser acceptance закрыл baseline → resume → human/bot toast. Уже загруженные байты живут до конца открытой сессии; новая выдача закрывается сразу, выданный bearer — не более 600 секунд. Автоматизация модерации остаётся отдельным операторским решением |
swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md:445:    `ENABLE_ISLAND_CLOSED_DELIVERY`.
swipe-backend/docs/specs/island-social-core.md:615:- `GET /island/artifact-url?building_id=…` выдаёт URL только после проверки
swipe-backend/docs/specs/island-social-core.md:691:artifact-url, 409 на несовпадающую ревизию (P3).
swipe-backend/docs/specs/share-challenge-v1.md:47:> `0057_island_closed_delivery`: Island P5 занял `0057`).
swipe-backend/docs/specs/share-challenge-v1.md:65:> `0057_island_closed_delivery`; единственный alembic head `0058`).
swipe-backend/docs/specs/share-challenge-v1.md:449:  (down_revision `0057_island_closed_delivery` — v1.4.3; Island P5 занял 0057). *Альтернатива — переиспользовать

exec
/bin/zsh -lc "find . -maxdepth 2 -type f \\( -iname '*r2*' -o -iname '*review*' -o -iname '*codex*' \\) -print | sort
git status --short" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
./art/Gemini_Generated_Image_3k5vj63k5vj63k5v-removebg-preview.png
./cohort-observability-implementation-review-request.md
./cohort-observability-independent-review-2026-07-23.md
./cohort-observability-review-dispositions-2026-07-23.md
./docs/island-social-core-cross-review-2026-07-24.md
./docs/island-social-core-cross-review-r2-2026-07-24.md
./docs/island-social-core-cross-review-r3-2026-07-24.md
./docs/island-social-core-cross-review-r4-2026-07-24.md
./island-social-core-p1-codex-review-r1.md
./island-social-core-p1-codex-review-r2.md
./island-social-core-p1-codex-review-r3.md
./island-social-core-p1-review-packet.md
./island-social-core-p2-review-packet.md
./island-social-core-p3-codex-review-r1.md
./island-social-core-p3-codex-review-r2.md
./island-social-core-p3-review-packet.md
./island-social-core-p4-codex-review-r1.md
./island-social-core-p4-codex-review-r2.md
./island-social-core-p4-review-packet.md
./mahjong-core/codex-review.sh
./mobile-review-independent-review-2026-07-29.md
./mobile-review-independent-review-r2-2026-07-29.md
./mobile-review-independent-review-r3-2026-07-29.md
./mobile-review-independent-review-r4-2026-07-29.md
./mobile-review-independent-review-r5-2026-07-29.md
./mobile-review-performance-review-packet.md
./mobile-review-r3-fix-review-packet-2026-07-29.md
./mobile-review-r4-fix-review-packet-2026-07-29.md
./mobile-review-r5-review-packet-2026-07-29.md
./play-for-good-gap-map-codex-research.md
./play-for-good-tz-review-r3-prompt.md
./play-for-good-tz-review-r3-raw.md
./play4good_test/codex-agent.sh
./play4good_test/codex-review.sh
./scratchpad/auto-review-generated-feed-client.json
./scratchpad/auto-review-raster-canary-backend.json
./scratchpad/codex-island-review-r2.md
./scratchpad/codex-island-review.md
./scratchpad/codex-p1-impl-review-r1.md
./scratchpad/generated-offer-backend-auto-review.json
./scratchpad/generated-offer-frontend-auto-review.json
./scratchpad/island-social-core-p1-codex-review-r2.md
./scratchpad/island-social-core-p3-codex-review-r1.md
./scratchpad/island-social-core-p4-codex-review-r1.md
./scratchpad/lab-performance-isolated-2026-07-29-r2.json
./scripts/auto-review-collect.mjs
./scripts/auto-review-collect.test.mjs
./scripts/auto-review-validate.mjs
./scripts/auto-review-validate.test.mjs
./series-order-compression-followups-review-packet.md
./series-order-operator-compression-review-packet.md
./series-order-operator-compression-review-r1.md
./share-challenge-v1-b-review-packet.md
./share-challenge-v1a-review-packet.md
./solitaire-core/codex-review.sh
 M AGENTS.md
 M CLAUDE.md
 M docs/mechanics/CLASS-BRIEF-TEMPLATE.md
 M docs/mechanics/README.md
 M docs/mechanics/arrows/CLASS-BRIEF.md
 M docs/mechanics/arrows/REFERENCE-PACKET.md
?? SHARE_FEATURE_PLAN_V1.html
?? SWIPE_PLATFORM_PITCH_V3.html
?? SWIPE_W5_BACKLOG_WEEKS1-3_V1.html
?? VARIATION_GEN_RESEARCH_V1.html
?? docs/mechanics/RECOVERY-ZEN-MATCH-BLOCK-OUT.md
?? docs/mechanics/REFERENCE-DEVICE-LAB.md
?? docs/mechanics/REFERENCE-REPLICATION-PROCESS.md
?? feed-sequencing-orchestration-handoff-2026-07-27.md
?? first-sort-curriculum.v1.json
?? package-lock.json
?? package.json
?? pins-ftue-L1-video-compliance.pdf
?? play-for-good-tz-review-r3-prompt.md
?? play-for-good-tz-review-r3-raw.md
?? playable-tickets.html
?? playables-status.html
?? scratchpad/
?? series-order-compression-followups-review-packet.md
?? series-order-operator-compression-review-packet.md
?? series-order-operator-compression-review-r1.md
?? smoke-test.js

exec
/bin/zsh -lc "wc -l play-for-good-tz-review-r3-prompt.md play-for-good-tz-review-r3-raw.md
sed -n '1,260p' play-for-good-tz-review-r3-raw.md" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
      29 play-for-good-tz-review-r3-prompt.md
    2206 play-for-good-tz-review-r3-raw.md
    2235 total
OpenAI Codex v0.146.0-alpha.3.1
--------
workdir: /Users/gleb/My projects/p4g-platform-workspace
model: gpt-5.6-sol
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: none
session id: 019fb29a-4795-7482-a63d-094f02ac7ac8
--------
user
Роль: независимый ревьюер (author ≠ reviewer), режим только-чтение.

Ревьюируемая идентичность: коммит
4738103258e1866ba19a22187098448665612759. Сначала выполни
`git rev-parse HEAD` и убедись, что HEAD равен этому SHA (untracked
review-файлы допустимы); если не равен — остановись и сообщи об этом
вместо ревью.

Проревьюй два файла этого коммита:
- play-for-good-stage0-island-off-tz.md (v3)
- play-for-good-stage1-mission-slice-tz.md (v3)

Это раунд R3 после твоих же findings R1/R2. Проверь:
1) корректно ли внесены все findings R2: staged rollout с pre-set
   компенсирующих флагов; раздельные гейты роутов/runners и
   quiesce/drain; freeze-список таблиц с allowlist защитных writes;
   исправленная карта роутеров + route manifest; аварийный 503-путь
   пустой очереди (не 409) с отказом unlock-cutoff и DB-preflight;
   exact contract identity (case_id, contract_version) во всей схеме;
   mission_fulfillment_allocations и атомарный FULFILLED при полном
   покрытии; финансовая идемпотентность, округление вниз,
   CHECK-границы; предусловие token_goal;
2) контрактную целостность против VISION.md (v3.0.1) и
   play-for-good-gap-map-v1.md того же коммита;
3) не внесли ли правки v3 новых противоречий.

Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
нет. Только ревью — никаких правок файлов.

codex
Сначала проверю точную идентичность checkout. Если `HEAD` не совпадёт с указанным SHA, остановлюсь без просмотра содержания.
exec
/bin/zsh -lc 'git rev-parse HEAD' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
4738103258e1866ba19a22187098448665612759

codex
`HEAD` совпадает с `4738103258e1866ba19a22187098448665612759`. Теперь сверяю обе v3-спецификации с их diff, `VISION.md` v3.0.1 и gap map из этого же коммита; отдельно трассирую каждый пункт R2 по точным строкам.
exec
/bin/zsh -lc "rg --files | rg '("'^|/)(play-for-good-stage0-island-off-tz'"\\.md|play-for-good-stage1-mission-slice-tz\\.md|play-for-good-gap-map-v1\\.md|VISION\\.md)"'$'"'" in /Users/gleb/My projects/p4g-platform-workspace
 exited 127 in 0ms:
zsh:1: command not found: rg
zsh:1: command not found: rg

exec
/bin/zsh -lc "find . -type f \\( -name 'play-for-good-stage0-island-off-tz.md' -o -name 'play-for-good-stage1-mission-slice-tz.md' -o -name 'play-for-good-gap-map-v1.md' -o -name 'VISION.md' \\) -print" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 6035ms:
./.claude/worktrees/xenodochial-chatterjee-eabcfa/VISION.md
./.claude/worktrees/festive-cohen-8d02b6/VISION.md
./play-for-good-stage0-island-off-tz.md
./play-for-good-stage1-mission-slice-tz.md
./VISION.md
./play-for-good-gap-map-v1.md

exec
/bin/zsh -lc 'wc -l VISION.md play-for-good-gap-map-v1.md play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md
git diff 4738103258e1866ba19a22187098448665612759''^ 4738103258e1866ba19a22187098448665612759 --stat -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md play-for-good-gap-map-v1.md VISION.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     616 VISION.md
     309 play-for-good-gap-map-v1.md
     180 play-for-good-stage0-island-off-tz.md
     223 play-for-good-stage1-mission-slice-tz.md
    1328 total
 play-for-good-stage0-island-off-tz.md    | 144 +++++++++++++++++++------------
 play-for-good-stage1-mission-slice-tz.md |  90 +++++++++++++------
 2 files changed, 151 insertions(+), 83 deletions(-)

exec
/bin/zsh -lc 'nl -ba play-for-good-stage0-island-off-tz.md
nl -ba play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v3
     2	
     3	Статус: **DRAFT v3 после кросс-ревью R2** (author: Claude; reviewer:
     4	Codex; R1: разделение роутеров, runners, порядок проверки, manifest;
     5	R2: staged rollout с pre-set true, quiesce/drain runners,
     6	freeze-список вместо «ноль writes», точная карта роутеров — все
     7	внесены). Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
     8	
     9	Цель: обратимо вывести legacy-остров из прода целиком — клиентскую
    10	поверхность, backend-writers и генерационные runners — сохранив
    11	защитные контуры (closed delivery, public report, операторская
    12	модерация/takedown, recall) и не удаляя данных. Результат — «чистый
    13	Island-off baseline», предусловие реализации Этапа 1.
    14	
    15	Не-цели: удаление кода/таблиц/данных; ретеминг в приют; изменения
    16	feed/каталога/challenge; mission-функциональность.
    17	
    18	Инварианты пакета: данные не удаляются нигде; каждый шаг обратим одним
    19	env-flip или откатом билда; closed delivery, public report, модерация
    20	и recall работают на каждом шаге (проверяется в acceptance каждого
    21	шага, где применимо).
    22	
    23	Фактическое состояние (проверено 30.07.2026, уточнено R2):
    24	`app/main.py` — `island_state_router` и `island_social_router`
    25	смонтированы безусловно (:193–194); **модерация смонтирована внутри
    26	`if settings.enable_island_social:`** (:195–200) и авторизуется
    27	server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth);
    28	`island_router` из `api_island.py` — **theme/bake generation**;
    29	`api_island_social.py` — **artifact-url, public, visits, likes**;
    30	`start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
    31	`lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
    32	одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
    33	ни генерационные runners. **Первый деливерабл П2 — точный route
    34	manifest**: каждый island-маршрут → файл → целевой контур; физическое
    35	разделение выполняется только по manifest'у, не по памяти.
    36	
    37	---
    38	
    39	## П1 — снятие клиентской поверхности
    40	
    41	Изменения: релиз feed-prototype с выключенными `VITE_ISLAND_ENABLED`,
    42	`VITE_ISLAND_VISIT_AWARDS_ENABLED`, `VITE_ISLAND_NOTIFICATIONS_ENABLED`
    43	(предварительно зафиксировать фактические значения деплой-окружения в
    44	receipt). Код не меняется — поверхность уже за флагами
    45	(`src/feed.ts:202-210`, deep-links в `src/main.ts`).
    46	
    47	Acceptance: свежая сессия — нет вкладки «мета», друзей в HUD,
    48	island-обработки deep-links; ноль запросов `/api/island/*`.
    49	Rollback: предыдущий клиентский билд.
    50	
    51	## П2 — backend-код: физическое разделение контуров + гейты runners
    52	
    53	Изменения (одна PR в swipe-backend; прод-деплой — только в П4, после
    54	pre-set компенсирующих флагов):
    55	
    56	0. **Route manifest** (деливерабл до кода): полный список
    57	   island-маршрутов с файлом-источником и целевым контуром.
    58	1. **Разделить роутеры на четыре независимых контура** (по
    59	   manifest'у):
    60	   a) legacy: state (`api_island_state`), public/visits/likes/
    61	      artifact-url (`api_island_social`), theme/bake generation
    62	      (`api_island`);
    63	   b) closed-delivery resolver;
    64	   c) public report (кнопка репорта — защитный контур);
    65	   d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    66	   Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    67	   получают собственные гейты: (b) — существующий
    68	   `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
    69	   `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
    70	   контур не должен выключаться случайно).
    71	2. **Два раздельных гейта вместо одного** (нужны для quiesce):
    72	   `ENABLE_ISLAND_LEGACY_SURFACE` (default false) — роуты контура (a);
    73	   `ENABLE_ISLAND_GENERATION_RUNNERS` (default false) — запуск/claim
    74	   `start_bake_runner()` / `start_theme_runner()` в `lifespan`.
    75	   Раздельность позволяет состояние «роуты закрыты, runners доживают
    76	   очередь».
    77	3. Cross-flag валидатор: явные ветки на новые комбинации.
    78	
    79	Acceptance (тесты + локально): при `LEGACY_SURFACE=false` все пути
    80	контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
    81	и **status/attempts существующих queued jobs не изменяются**; при
    82	`SOCIAL=false` — модерация, report и closed delivery продолжают
    83	работать; полный тест-сьют зелёный. Rollback: env-flip
    84	соответствующего флага в true.
    85	
    86	## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)
    87	
    88	Работы: browser/E2E **старого прод-билда клиента** против локального
    89	backend с выключенными флагами П2: пройти серию до сундука; убедиться,
    90	что island-запросы получают 404 и деградация тихая — лента играет,
    91	крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
    92	обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
    93	visit-award, лайки).
    94	
    95	Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
    96	finding: чинится до П4.
    97	
    98	## П4 — прод-применение (staged, каждый под-шаг — receipt + проверка)
    99	
   100	1. **Pre-set (до деплоя кода!):** в `render.yaml` заранее добавить
   101	   `ENABLE_ISLAND_LEGACY_SURFACE=true` и
   102	   `ENABLE_ISLAND_GENERATION_RUNNERS=true` (плюс явные
   103	   `ENABLE_ISLAND_PROTECTIVE_SURFACE=true`,
   104	   `ENABLE_ISLAND_CLOSED_DELIVERY=true`). Затем задеплоить код П2 —
   105	   деплой не меняет поведение прода (default-false флаги
   106	   компенсированы pre-set'ом). Smoke: legacy-роуты отвечают, runners
   107	   работают, модерация работает.
   108	2. **Flip поверхности:** `ENABLE_ISLAND_SOCIAL=false`,
   109	   `ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
   110	   `ENABLE_ISLAND_NOTIFICATIONS=false`, явно
   111	   `ISLAND_REWARDS_ENABLED=false` (default true),
   112	   `ENABLE_ISLAND_LEGACY_SURFACE=false`. Новые theme/bake jobs
   113	   невозможны (роуты закрыты); runners ещё включены.
   114	3. **Quiesce/drain:** дождаться terminal-состояния всех queued/running
   115	   bake/theme jobs (новых нет; bounded wait по lease TTL; job,
   116	   зависший в `generating`, резолвится вручную по runbook'у до
   117	   продолжения). Проверка: ноль незавершённых jobs.
   118	4. **Flip runners:** `ENABLE_ISLAND_GENERATION_RUNNERS=false`
   119	   (рестарт; runners больше не стартуют; ничего не оборвано
   120	   посередине — очередь пуста).
   121	5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
   122	   delivery выдаёт signed GET на существующий артефакт; report и
   123	   модерационная консоль работают; в логах нет
   124	   bot/notification/bake/theme runner'ов.
   125	
   126	Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
   127	включение ботов безопасно by design (immutable per-day планы, bounded
   128	catch-up).
   129	
   130	## П5 — snapshot manifest, схема и доки
   131	
   132	1. **Data-manifest с явным freeze-списком** (после drain П4):
   133	   snapshot row counts + max seq/id + digest mutable-state по
   134	   **freeze-списку** legacy/social/economy таблиц: `island_states`,
   135	   `island_building_social`, `island_visits`, `island_building_likes`,
   136	   `island_completion_claims`, `island_completion_outcomes`,
   137	   `island_collect_claims`, `island_visit_awards`, `island_bots`,
   138	   `island_bot_daily_plans`, `island_friend_codes`,
   139	   `island_friendships`, `island_friend_blocks`,
   140	   `island_notification_outbox`, `island_notification_attempts`,
   141	   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
   142	   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
   143	   таблицы (`island_reports`, `island_moderation_actions`) в
   144	   freeze-список **не входят**: их writes разрешены и проверяются как
   145	   audit receipts — каждая новая строка соответствует конкретному
   146	   report/moderation-акту. Manifest — receipt пакета.
   147	2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
   148	   v3.0.1).
   149	3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
   150	   состав), durable-строка в корневой `CLAUDE.md`, при необходимости
   151	   `AGENTS.md`.
   152	
   153	Acceptance: manifest-проверка чистая; схема опубликована;
   154	`docs-boundary-lint` чистый.
   155	
   156	---
   157	
   158	## Порядок применения
   159	
   160	П1 (клиент) → П2 (код: route manifest + разделение, PR без
   161	прод-деплоя) → П3 (pre-prod E2E старого клиента) → П4 (pre-set →
   162	деплой → staged env-flip'ы → drain → prod smoke) → П5
   163	(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
   164	до следующего шага.
   165	
   166	## Общий acceptance Этапа 0
   167	
   168	- Свежий клиент: ноль island-запросов.
   169	- Backend: контур (a) → 404; bake/theme/bot/notification runners не
   170	  стартуют; queued jobs заморожены (status/attempts без изменений).
   171	- Closed delivery / public report / модерация / recall — проверены
   172	  руками, работают.
   173	- Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
   174	  после.
   175	- Rollback записан; минимум один шаг проверен обратным включением вне
   176	  прода.

exec
/bin/zsh -lc "find . -type f -iname 'play-for-good*t*z*review*' -print | sort
grep -Rnl --exclude='play-for-good-tz-review-r3-raw.md' 'staged rollout с pre-set' . 2>/dev/null | head -40" in /Users/gleb/My projects/p4g-platform-workspace
exec
/bin/zsh -lc "grep -Rnl --exclude='play-for-good-tz-review-r3-raw.md' --exclude='play-for-good-stage1-mission-slice-tz.md' --exclude='play-for-good-stage0-island-off-tz.md' 'unlock-cutoff' . 2>/dev/null | head -80
git log --all --oneline --decorate -12" in /Users/gleb/My projects/p4g-platform-workspace
exec
/bin/zsh -lc 'git log --all --oneline -12' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
4738103 docs: ТЗ Этапов 0/1 v3 после кросс-ревью R2 (6×P1 + 3×P2 внесены)
d4a0b93 docs: ТЗ Этапов 0/1 v2 после кросс-ревью R1 (6×P1 + 3×P2 внесены)
f378953 review: R5 mobile-review — NO-GO, но sandbox-класс закрыт по конструкции на обоих движках (42 вектора x 4 конфигурации, WebKit проверен); блокеры: prototype_review без доказательства, 750мс обвиняет честный прототип, нет unmount, 503 выбрасывает Approve, фантомы глушат алерты; несущие границы не закреплены (digest-байты, bridge на пути загрузки, frame-src), WebKit отсутствует в CI
deb925c Merge remote-tracking branch 'origin/master'
1f53046 docs: ТЗ Этапов 0/1 Play for Good + фикс decision log gap-карты
d70acac Merge pull request #38 from Glera/codex/platform-reliability-r1-multimac-deferral
b594790 docs(r1): defer hardening during multi-Mac dogfood
f2b7b39 Merge pull request #37 from Glera/codex/platform-reliability-r1-render-residual
a45bfb9 Merge remote-tracking branch 'origin/master'
96df90a VISION v3.0.1: auto-вклад и rolling pool + gap-карта Play for Good v2
2d1271b docs(r1): reconcile residual preflight
499fd19 docs(r1): accept bounded Render hook residual

exec
/bin/zsh -lc 'git show -s --format=fuller 4738103258e1866ba19a22187098448665612759
git show -s --format=%B d4a0b93' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
commit 4738103258e1866ba19a22187098448665612759
Author:     Gleb <>
AuthorDate: Thu Jul 30 13:35:22 2026 +0300
Commit:     Gleb <>
CommitDate: Thu Jul 30 13:35:22 2026 +0300

    docs: ТЗ Этапов 0/1 v3 после кросс-ревью R2 (6×P1 + 3×P2 внесены)
    
    Stage 0: staged rollout — pre-set ENABLE_ISLAND_LEGACY_SURFACE=true +
    GENERATION_RUNNERS=true до деплоя кода (деплой не меняет поведение),
    раздельные гейты роутов и runners для quiesce/drain (роуты закрыты →
    очередь доживает до terminal → flip runners), freeze-список таблиц
    вместо «ноль island-writes» (защитные island_reports /
    island_moderation_actions — по allowlist с audit-receipts), исправлена
    карта роутеров (api_island=theme/bake; api_island_social=artifact-url/
    public/visits/likes) + route manifest как первый деливерабл.
    
    Stage 1: аварийный путь пустой очереди = некоммит + retryable 503
    (не 409 — outbox считает его terminal), unlock-cutoff отказывает без
    successor, DB-preflight вместо config-validator; exact contract
    identity (case_id, contract_version) через runtime/events/allocations/
    contributions/fulfillments; mission_fulfillment_allocations child +
    атомарный FULFILLED только при полном покрытии gift; финансовая
    идемпотентность (res:/gift: identity, FK на lifecycle event),
    округление вниз, CHECK-границы; предусловие token_goal >= max
    одиночного вклада.
    
    Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
docs: ТЗ Этапов 0/1 v2 после кросс-ревью R1 (6×P1 + 3×P2 внесены)

Stage 0: физическое разделение island-роутеров на 4 контура (legacy /
closed delivery / public report / moderation) с независимыми гейтами —
модерация выводится из-под ENABLE_ISLAND_SOCIAL (факт: смонтирована
внутри этого if, main.py:195-200); ENABLE_ISLAND_LEGACY_SURFACE гейтит
также запуск bake/theme runners (безусловны в lifespan);
pre-prod E2E старого клиента ДО прод-применения; snapshot manifest
вместо row counts.

Stage 1: mission_runtime singleton как единая точка FOR UPDATE (двух
ACTIVE не существует by construction) + очередь READY + CLI ready +
preflight successor; dogfood-изоляция writers и readers через единый
allowlist + session capability; mission_contribution блок в
results/daily ответах и в verified replay + перенос через outbox;
daily-ключ по player-local DailyQuest.day; typed
mission.fulfillment-receipt.v1 с coverage-проверкой allocations; EUR
жёстко в v0 + числовые границы need/stretch в контракте; sum(child)
инвариант service-level + reconciliation; client watermark церемоний.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>


exec
/bin/zsh -lc "grep -RniE 'ResultReceipt|result.?outbox|daily.*outbox|Daily.*Receipt|claimDaily|daily.*claim|verified_replay_response' feed-prototype/src swipe-backend/app | head -240" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 1520ms:
feed-prototype/src/outbox.ts:21:import { ResultReceiptWaiters } from './result-receipts.mjs';
feed-prototype/src/outbox.ts:50:export type ResultReceipt =
feed-prototype/src/outbox.ts:56:const resultReceiptWaiters = new ResultReceiptWaiters<ResultReceipt>();
feed-prototype/src/outbox.ts:63:function settleResultReceipt(receipt: ResultReceipt): void {
feed-prototype/src/outbox.ts:64:  resultReceiptWaiters.settle(receipt);
feed-prototype/src/outbox.ts:246:export function queueResultWithReceipt(r: ResultIn): Promise<ResultReceipt> {
feed-prototype/src/outbox.ts:247:  const receipt = resultReceiptWaiters.wait(r.run_id);
feed-prototype/src/outbox.ts:249:    settleResultReceipt({ runId: r.run_id, status: 'storage_error', code: 'result_not_persisted' });
feed-prototype/src/outbox.ts:379:    settleResultReceipt({ runId: result.run_id, status: 'confirmed', balances: confirmed });
feed-prototype/src/outbox.ts:428:  settleResultReceipt({
feed-prototype/src/result-receipts.d.mts:1:export class ResultReceiptWaiters<Receipt extends { runId: string }> {
feed-prototype/src/styles.css:892:/* "!" attention badge on a bottom-bar tab (daily rewards ready to claim, island
feed-prototype/src/styles.css:3518:.daily-panel__claim {
feed-prototype/src/styles.css:3527:.daily-panel__claim:disabled {
feed-prototype/src/result-receipts.mjs:3:export class ResultReceiptWaiters {
feed-prototype/src/api.ts:758:/** Claim the daily quest reward. Keeps the failure KIND. The optimistic claim path has to
feed-prototype/src/api.ts:768:export function apiDailyClaimRequired(questId: string): Promise<DailyStateResp> {
feed-prototype/src/api.ts:770:    '/api/daily/claim',
feed-prototype/src/feed.ts:40:  apiDailySync, apiDailyClaimRequired, currentTzOffsetMinutes,
feed-prototype/src/feed.ts:329:// Backoff for an optimistic daily claim whose response was lost. The endpoint is
feed-prototype/src/feed.ts:331:const DAILY_CLAIM_RETRY_DELAYS_MS = [1500, 4000, 9000];
feed-prototype/src/feed.ts:637:  private dailyClaiming = new Set<string>();
feed-prototype/src/feed.ts:2819:    const ready = !!this.dailyState?.quests.some((quest) => quest.completed && !quest.claimed);
feed-prototype/src/feed.ts:2961:      btn.className = 'daily-panel__claim';
feed-prototype/src/feed.ts:2962:      const claiming = this.dailyClaiming.has(quest.id);
feed-prototype/src/feed.ts:2970:        void this.claimDailyQuest(quest.id, btn, reward);
feed-prototype/src/feed.ts:3006:  //                          idempotent by quest id, see apiDailyClaimRequired).
feed-prototype/src/feed.ts:3007:  private async claimDailyQuest(
feed-prototype/src/feed.ts:3012:    if (this.dailyClaiming.has(questId)) return;
feed-prototype/src/feed.ts:3026:    this.dailyClaiming.add(questId);
feed-prototype/src/feed.ts:3044:    void this.sendDailyClaim(questId, reward, reconcile);
feed-prototype/src/feed.ts:3046:    this.launchDailyPuzzleReward(rewardEl, origin, reward, puzzleBalanceBeforeClaim + reward, () => {
feed-prototype/src/feed.ts:3055:  private async sendDailyClaim(
feed-prototype/src/feed.ts:3061:      const state = await apiDailyClaimRequired(questId);
feed-prototype/src/feed.ts:3063:        this.dailyClaiming.delete(questId);
feed-prototype/src/feed.ts:3076:        this.dailyClaiming.delete(questId);
feed-prototype/src/feed.ts:3077:        this.scheduleDailyClaimRetry(questId, reward);
feed-prototype/src/feed.ts:3081:        this.dailyClaiming.delete(questId);
feed-prototype/src/feed.ts:3086:        this.showActivityNotifier(this.dailyClaimRefusalText(error));
feed-prototype/src/feed.ts:3092:  private dailyClaimRefusalText(error: unknown): string {
feed-prototype/src/feed.ts:3111:  private scheduleDailyClaimRetry(questId: string, reward: number, attempt = 0): void {
feed-prototype/src/feed.ts:3112:    if (attempt >= DAILY_CLAIM_RETRY_DELAYS_MS.length) return;
feed-prototype/src/feed.ts:3116:          const state = await apiDailyClaimRequired(questId);
feed-prototype/src/feed.ts:3125:            this.showActivityNotifier(this.dailyClaimRefusalText(error));
feed-prototype/src/feed.ts:3129:          this.scheduleDailyClaimRetry(questId, reward, attempt + 1);
feed-prototype/src/feed.ts:3132:    }, DAILY_CLAIM_RETRY_DELAYS_MS[attempt]);
swipe-backend/app/config.py:399:    island_bot_daily_claims_cap: int = 200
swipe-backend/app/api_results.py:141:def _verified_replay_response(db: Session, *, run: VerifiedRun) -> dict:
swipe-backend/app/api_results.py:593:        response = _verified_replay_response(db, run=existing)
swipe-backend/app/api_results.py:616:        response = _verified_replay_response(db, run=existing)
Binary file swipe-backend/app/__pycache__/api_daily.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/config.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/api_island_social_core.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/api_results.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/models.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/feed_shadow_evidence.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/island_bots.cpython-313.pyc matches
Binary file swipe-backend/app/__pycache__/island_health.cpython-313.pyc matches
swipe-backend/app/api_daily.py:22:class DailyClaimIn(BaseModel):
swipe-backend/app/api_daily.py:52:@router.post("/daily/claim")
swipe-backend/app/api_daily.py:53:def post_daily_claim(
swipe-backend/app/api_daily.py:54:    body: DailyClaimIn,
swipe-backend/app/island_bots.py:361:        "dailyClaimsCap": int(settings.island_bot_daily_claims_cap),
swipe-backend/app/island_bots.py:632:    cap = int(settings.island_bot_daily_claims_cap)

exec
/bin/zsh -lc "grep -Rni 'ResultReceipt' feed-prototype/src swipe-backend/app | head -80" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 221ms:
feed-prototype/src/outbox.ts:21:import { ResultReceiptWaiters } from './result-receipts.mjs';
feed-prototype/src/outbox.ts:50:export type ResultReceipt =
feed-prototype/src/outbox.ts:56:const resultReceiptWaiters = new ResultReceiptWaiters<ResultReceipt>();
feed-prototype/src/outbox.ts:63:function settleResultReceipt(receipt: ResultReceipt): void {
feed-prototype/src/outbox.ts:64:  resultReceiptWaiters.settle(receipt);
feed-prototype/src/outbox.ts:246:export function queueResultWithReceipt(r: ResultIn): Promise<ResultReceipt> {
feed-prototype/src/outbox.ts:247:  const receipt = resultReceiptWaiters.wait(r.run_id);
feed-prototype/src/outbox.ts:249:    settleResultReceipt({ runId: r.run_id, status: 'storage_error', code: 'result_not_persisted' });
feed-prototype/src/outbox.ts:379:    settleResultReceipt({ runId: result.run_id, status: 'confirmed', balances: confirmed });
feed-prototype/src/outbox.ts:428:  settleResultReceipt({
feed-prototype/src/result-receipts.d.mts:1:export class ResultReceiptWaiters<Receipt extends { runId: string }> {
feed-prototype/src/result-receipts.mjs:3:export class ResultReceiptWaiters {

exec
/bin/zsh -lc "grep -RniE 'daily.*claim|claim.*daily|/daily' feed-prototype/src | head -160
nl -ba feed-prototype/src/outbox.ts | sed -n '40,80p;230,270p;340,450p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 211ms:
feed-prototype/src/styles.css:892:/* "!" attention badge on a bottom-bar tab (daily rewards ready to claim, island
feed-prototype/src/styles.css:3518:.daily-panel__claim {
feed-prototype/src/styles.css:3527:.daily-panel__claim:disabled {
feed-prototype/src/api.ts:755:  return post<DailyStateResp>('/api/daily/sync', { tz_offset_minutes: tzOffsetMinutes() });
feed-prototype/src/api.ts:758:/** Claim the daily quest reward. Keeps the failure KIND. The optimistic claim path has to
feed-prototype/src/api.ts:768:export function apiDailyClaimRequired(questId: string): Promise<DailyStateResp> {
feed-prototype/src/api.ts:770:    '/api/daily/claim',
feed-prototype/src/feed.ts:40:  apiDailySync, apiDailyClaimRequired, currentTzOffsetMinutes,
feed-prototype/src/feed.ts:329:// Backoff for an optimistic daily claim whose response was lost. The endpoint is
feed-prototype/src/feed.ts:331:const DAILY_CLAIM_RETRY_DELAYS_MS = [1500, 4000, 9000];
feed-prototype/src/feed.ts:637:  private dailyClaiming = new Set<string>();
feed-prototype/src/feed.ts:2819:    const ready = !!this.dailyState?.quests.some((quest) => quest.completed && !quest.claimed);
feed-prototype/src/feed.ts:2961:      btn.className = 'daily-panel__claim';
feed-prototype/src/feed.ts:2962:      const claiming = this.dailyClaiming.has(quest.id);
feed-prototype/src/feed.ts:2970:        void this.claimDailyQuest(quest.id, btn, reward);
feed-prototype/src/feed.ts:3006:  //                          idempotent by quest id, see apiDailyClaimRequired).
feed-prototype/src/feed.ts:3007:  private async claimDailyQuest(
feed-prototype/src/feed.ts:3012:    if (this.dailyClaiming.has(questId)) return;
feed-prototype/src/feed.ts:3026:    this.dailyClaiming.add(questId);
feed-prototype/src/feed.ts:3044:    void this.sendDailyClaim(questId, reward, reconcile);
feed-prototype/src/feed.ts:3046:    this.launchDailyPuzzleReward(rewardEl, origin, reward, puzzleBalanceBeforeClaim + reward, () => {
feed-prototype/src/feed.ts:3055:  private async sendDailyClaim(
feed-prototype/src/feed.ts:3061:      const state = await apiDailyClaimRequired(questId);
feed-prototype/src/feed.ts:3063:        this.dailyClaiming.delete(questId);
feed-prototype/src/feed.ts:3075:        // background. If every attempt fails the next /daily/sync reconciles.
feed-prototype/src/feed.ts:3076:        this.dailyClaiming.delete(questId);
feed-prototype/src/feed.ts:3077:        this.scheduleDailyClaimRetry(questId, reward);
feed-prototype/src/feed.ts:3081:        this.dailyClaiming.delete(questId);
feed-prototype/src/feed.ts:3086:        this.showActivityNotifier(this.dailyClaimRefusalText(error));
feed-prototype/src/feed.ts:3092:  private dailyClaimRefusalText(error: unknown): string {
feed-prototype/src/feed.ts:3111:  private scheduleDailyClaimRetry(questId: string, reward: number, attempt = 0): void {
feed-prototype/src/feed.ts:3112:    if (attempt >= DAILY_CLAIM_RETRY_DELAYS_MS.length) return;
feed-prototype/src/feed.ts:3116:          const state = await apiDailyClaimRequired(questId);
feed-prototype/src/feed.ts:3125:            this.showActivityNotifier(this.dailyClaimRefusalText(error));
feed-prototype/src/feed.ts:3129:          this.scheduleDailyClaimRetry(questId, reward, attempt + 1);
feed-prototype/src/feed.ts:3132:    }, DAILY_CLAIM_RETRY_DELAYS_MS[attempt]);
    40	}
    41	
    42	export interface ResultTerminalEvent {
    43	  runId: string;
    44	  ticketId: string | null;
    45	  stage: string;
    46	  status: number;
    47	  code: string | null;
    48	}
    49	
    50	export type ResultReceipt =
    51	  | { runId: string; status: 'confirmed'; balances: ConfirmedBalances }
    52	  | { runId: string; status: 'rejected'; code: string | null; httpStatus: number }
    53	  | { runId: string; status: 'storage_error'; code: 'result_not_persisted' };
    54	
    55	const resultTerminalListeners = new Set<(event: ResultTerminalEvent) => void>();
    56	const resultReceiptWaiters = new ResultReceiptWaiters<ResultReceipt>();
    57	
    58	export function onResultTerminal(listener: (event: ResultTerminalEvent) => void): () => void {
    59	  resultTerminalListeners.add(listener);
    60	  return () => resultTerminalListeners.delete(listener);
    61	}
    62	
    63	function settleResultReceipt(receipt: ResultReceipt): void {
    64	  resultReceiptWaiters.settle(receipt);
    65	}
    66	
    67	function storageKeys(): { queue: string; ever: string; scoped: boolean } {
    68	  const userId = telegramUserId();
    69	  const keys = userId
    70	    ? { queue: `${KEY}:${userId}`, ever: `${EVER_KEY}:${userId}`, scoped: true }
    71	    : { queue: KEY, ever: EVER_KEY, scoped: false };
    72	  if (keys.scoped) migrateLegacy(keys);
    73	  return keys;
    74	}
    75	
    76	function migrateLegacy(keys: { queue: string; ever: string }): void {
    77	  if (migratedScopes.has(keys.queue)) return;
    78	  try {
    79	    // Also adopt an unscoped v2 entry created before Telegram exposed the user
    80	    // identity during this page boot.
   230	export function pendingCount(): number {
   231	  return load().length;
   232	}
   233	
   234	/** Enqueue a win and try to flush immediately. */
   235	export function queueResult(r: ResultIn): Promise<ConfirmedBalances | null> {
   236	  persistResult(r);
   237	  return flushResults();
   238	}
   239	
   240	/**
   241	 * Persist a result and wait for that exact run's server receipt. Unlike
   242	 * `queueResult`, this never treats another item from the shared flush as this
   243	 * run's confirmation. Used by catalog chest presentation, where a false
   244	 * positive would paint a reward after recall.
   245	 */
   246	export function queueResultWithReceipt(r: ResultIn): Promise<ResultReceipt> {
   247	  const receipt = resultReceiptWaiters.wait(r.run_id);
   248	  if (!persistResult(r)) {
   249	    settleResultReceipt({ runId: r.run_id, status: 'storage_error', code: 'result_not_persisted' });
   250	    return receipt;
   251	  }
   252	  void flushResults();
   253	  return receipt;
   254	}
   255	
   256	function persistResult(r: ResultIn): boolean {
   257	  const q = load();
   258	  if (!q.some((x) => x.run_id === r.run_id)) {
   259	    q.push(r);
   260	    save(q);
   261	    try {
   262	      const keys = storageKeys();
   263	      localStorage.setItem(keys.ever, String(starsEverQueued() + (r.stars ?? 1)));
   264	    } catch { /* noop */ }
   265	  }
   266	  return load().some((item) => item.run_id === r.run_id);
   267	}
   268	
   269	let flushPromise: Promise<ConfirmedBalances | null> | null = null;
   270	let resultRetryTimer: number | null = null;
   340	        console.warn(`[results] dropping expired run ticket ${ticket.ticket_id}`);
   341	        notifyTerminalResult(result, 'ticket start', 410, 'catalog_ticket_expired');
   342	        continue;
   343	      }
   344	      const waitMs = Date.parse(ticket.next_result_at) - Date.now();
   345	      if (waitMs > 0) await new Promise((resolve) => window.setTimeout(resolve, Math.min(waitMs + 25, 5000)));
   346	    }
   347	    let response;
   348	    try {
   349	      response = await apiPostResultRequired(result);
   350	    } catch (error) {
   351	      if (dropTerminalResult(result, error, 'result submit')) continue;
   352	      logRetryableResult(result, error, 'result submit');
   353	      break;
   354	    }
   355	    const afterResult = load();
   356	    const stored = afterResult.find((candidate) => candidate.run_id === result.run_id);
   357	    if (stored) {
   358	      stored.server_confirmed = true;
   359	      save(afterResult);
   360	    }
   361	    confirmed = {
   362	      stars: response.balance,
   363	      puzzles: typeof response.puzzle_balance === 'number' ? response.puzzle_balance : null,
   364	    };
   365	    if (result.complete_challenge_id) {
   366	      let challenge;
   367	      try {
   368	        challenge = await apiCompleteChallengeRequired(result.complete_challenge_id, result.run_id);
   369	      } catch (error) {
   370	        if (dropTerminalResult(result, error, 'challenge completion')) continue;
   371	        break; // result is safe; retain only the durable social action
   372	      }
   373	      confirmed = {
   374	        stars: challenge.balance,
   375	        puzzles: confirmed.puzzles,
   376	        challenge,
   377	      };
   378	    }
   379	    settleResultReceipt({ runId: result.run_id, status: 'confirmed', balances: confirmed });
   380	    save(load().filter((candidate) => candidate.run_id !== result.run_id));
   381	    resetResultRetryBackoff();
   382	  }
   383	  return confirmed;
   384	}
   385	
   386	function logRetryableResult(result: ResultIn, error: unknown, stage: string): void {
   387	  const status = error instanceof ApiRequestError ? error.status : 0;
   388	  const code = error instanceof ApiRequestError ? error.code : null;
   389	  console.warn(
   390	    `[results] retaining outbox item ${result.run_id}; ${stage} will retry`
   391	      + ` (HTTP ${status}${code ? `, ${code}` : ''})`,
   392	  );
   393	}
   394	
   395	function dropResult(runId: string): void {
   396	  save(load().filter((candidate) => candidate.run_id !== runId));
   397	}
   398	
   399	function dropTerminalResult(result: ResultIn, error: unknown, stage: string): boolean {
   400	  if (!(error instanceof ApiRequestError)) return false;
   401	  // These statuses cannot heal through another retry. In particular, 428 is
   402	  // how the backend retires ticketless entries left by an old client build.
   403	  // Network/auth/rate-limit/too-early failures remain durable in the queue.
   404	  if (![400, 404, 409, 410, 422, 428].includes(error.status)) return false;
   405	  notifyTerminalResult(result, stage, error.status, error.code);
   406	  return true;
   407	}
   408	
   409	function notifyTerminalResult(
   410	  result: ResultIn,
   411	  stage: string,
   412	  status: number,
   413	  code: string | null,
   414	): void {
   415	  console.warn(
   416	    `[results] dropping rejected outbox item ${result.run_id} at ${stage}`
   417	      + ` (HTTP ${status}${code ? `, ${code}` : ''})`,
   418	  );
   419	  const terminal: ResultTerminalEvent = {
   420	    runId: result.run_id,
   421	    ticketId: result.run_ticket?.ticket_id ?? null,
   422	    stage,
   423	    status,
   424	    code,
   425	  };
   426	  dropResult(result.run_id);
   427	  resetResultRetryBackoff();
   428	  settleResultReceipt({
   429	    runId: result.run_id,
   430	    status: 'rejected',
   431	    code,
   432	    httpStatus: status,
   433	  });
   434	  for (const listener of resultTerminalListeners) {
   435	    try { listener(terminal); } catch { /* diagnostics must not block queue progress */ }
   436	  }
   437	}
   438	
   439	/** Clear the queue (used by the debug reset). */
   440	export function clearOutbox(): void {
   441	  resetResultRetryBackoff();
   442	  save([]);
   443	  try { currentRunStartOutbox().clear(); } catch { /* storage blocked */ }
   444	}

codex
- [P1] [play-for-good-stage0-island-off-tz.md:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:60>) относит `artifact-url` к legacy-контуру, хотя это и есть closed-delivery resolver ([api_island_social.py:159](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_social.py:159>)). Поэтому `LEGACY_SURFACE=false` требует для него 404, одновременно smoke требует signed GET ([строки 121–123](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:121>)). Оба условия невыполнимы; route manifest уже предписан неверной классификацией.

- [P1] В защитном контуре потерян пользовательский block: четыре контура сохраняют report, но не `/island/friends/{user_id}/block` ([строки 58–70](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), а `island_friend_blocks` включён в freeze без allowlist защитных writes ([строки 132–146](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:132>)). Это противоречит обязательному `report/block` и требованию сохранять safety-контур после ухода UGC из центра продукта ([VISION.md:501](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:501>)).

- [P1] Exact contract identity добавлена в отдельные строки, но не закреплена для всей lifecycle-цепочки. `UNIQUE (case_id, kind)` допускает `READY` на v1, `ACTIVE` на v2 и `UNLOCKED` на v3 ([строки 49–53](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:49>)); отдельные composite FK этого не запрещают. Заявление на [строках 99–103](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:99>) и тест лишь присутствия пары не обеспечивают совпадение версии между событиями, runtime и финансовыми allocations.

- [P2] Не определён воспроизводимый cursor rolling pool. `mission_pool_ledger` не задаёт монотонный `seq/id`, тогда как allocation хранит `pool_cursor`, формула зависит от него ([строки 54–72](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:54>)), а тест требует неизменности snapshot после поздних settled-строк ([строка 179](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:179>)). Без точного порядка и правила `eligible at cursor` immutable UNLOCKED-сумма не воспроизводима.
tokens used
94,911
- [P1] [play-for-good-stage0-island-off-tz.md:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:60>) относит `artifact-url` к legacy-контуру, хотя это и есть closed-delivery resolver ([api_island_social.py:159](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_social.py:159>)). Поэтому `LEGACY_SURFACE=false` требует для него 404, одновременно smoke требует signed GET ([строки 121–123](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:121>)). Оба условия невыполнимы; route manifest уже предписан неверной классификацией.

- [P1] В защитном контуре потерян пользовательский block: четыре контура сохраняют report, но не `/island/friends/{user_id}/block` ([строки 58–70](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), а `island_friend_blocks` включён в freeze без allowlist защитных writes ([строки 132–146](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:132>)). Это противоречит обязательному `report/block` и требованию сохранять safety-контур после ухода UGC из центра продукта ([VISION.md:501](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:501>)).

- [P1] Exact contract identity добавлена в отдельные строки, но не закреплена для всей lifecycle-цепочки. `UNIQUE (case_id, kind)` допускает `READY` на v1, `ACTIVE` на v2 и `UNLOCKED` на v3 ([строки 49–53](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:49>)); отдельные composite FK этого не запрещают. Заявление на [строках 99–103](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:99>) и тест лишь присутствия пары не обеспечивают совпадение версии между событиями, runtime и финансовыми allocations.

- [P2] Не определён воспроизводимый cursor rolling pool. `mission_pool_ledger` не задаёт монотонный `seq/id`, тогда как allocation хранит `pool_cursor`, формула зависит от него ([строки 54–72](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:54>)), а тест требует неизменности snapshot после поздних settled-строк ([строка 179](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:179>)). Без точного порядка и правила `eligible at cursor` immutable UNLOCKED-сумма не воспроизводима.
