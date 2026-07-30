OpenAI Codex v0.146.0-alpha.3.1
--------
workdir: /Users/gleb/My projects/p4g-platform-workspace
model: gpt-5.6-sol
provider: openai
approval: never
sandbox: read-only
reasoning effort: xhigh
reasoning summaries: none
session id: 019fb2ab-0eb8-7951-bce1-9d980a713426
--------
user
Роль: независимый ревьюер (author ≠ reviewer), режим только-чтение.

Ревьюируемая идентичность: коммит
f86c489523977dcca8d3959e73e9bcfb9f556c9e. Сначала выполни
`git rev-parse HEAD` и убедись, что HEAD равен этому SHA (untracked
review-файлы допустимы); если не равен — остановись и сообщи об этом
вместо ревью.

Проревьюй два файла этого коммита:
- play-for-good-stage0-island-off-tz.md (v5)
- play-for-good-stage1-mission-slice-tz.md (v5)

Это раунд R5 после твоих findings R1–R4. Проверь прежде всего внесение
findings R4:
(1) mission_funding_policies: денежная политика версионируется,
    контракт пинит (policy_version, policy_digest), UNLOCKED-receipt
    пинит контракт и политику;
(2) mission_contribution_weights: contribution пинит weights_version,
    предусловие token_goal двустороннее (register-contract и
    регистрация новой версии весов), runtime-нарушение → retryable,
    каскад v0 запрещён;
(3) block в api_island_p2.py:250, route manifest с колонкой ожидаемых
    статусов, smoke по ней.
Затем: контрактная целостность против VISION.md (v3.0.1) и
play-for-good-gap-map-v1.md того же коммита; новые противоречия,
внесённые правками v5.

Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
нет. Только ревью — никаких правок файлов.

codex
Сначала проверю идентичность HEAD ровно указанной командой. Если SHA совпадёт, прочитаю diff и договорные документы в режиме только-чтение, затем дам только findings либо GO.
exec
/bin/zsh -lc 'git rev-parse HEAD' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
f86c489523977dcca8d3959e73e9bcfb9f556c9e

codex
HEAD совпадает. Теперь сопоставляю v5 с предыдущей версией, затем точечно трассирую три группы R4 по схемам, инвариантам, runtime-поведению и smoke/manifest, после чего сверю их с VISION v3.0.1 и gap map этого же коммита.
  → Определить diff коммита и точные версии/пути четырёх документов
  • Проверить внесение трёх групп findings R4 в двух v5-документах
  • Сверить контрактную целостность с VISION.md и gap map, проверить новые противоречия
  • Сформировать findings с точными строками либо вердикт GO
exec
/bin/zsh -lc "rg --files -g 'play-for-good-stage0-island-off-tz.md' -g 'play-for-good-stage1-mission-slice-tz.md' -g 'VISION.md' -g 'play-for-good-gap-map-v1.md' -g 'CLAUDE.md'" in /Users/gleb/My projects/p4g-platform-workspace
 exited 127 in 0ms:
zsh:1: command not found: rg

codex
`rg` в окружении недоступен; переключаюсь на `find` и продолжаю тот же read-only аудит.
exec
/bin/zsh -lc "find . -type f \\( -name 'play-for-good-stage0-island-off-tz.md' -o -name 'play-for-good-stage1-mission-slice-tz.md' -o -name 'VISION.md' -o -name 'play-for-good-gap-map-v1.md' -o -name 'CLAUDE.md' \\) -print" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 4782ms:
./playables-pins-rollout/CLAUDE.md
./playables-triple-tile-v1-development/CLAUDE.md
./play4good_test/CLAUDE.md
./liveops-shared/CLAUDE.md
./p4g-platform/client/CLAUDE.md
./p4g-platform/CLAUDE.md
./.claude/worktrees/xenodochial-chatterjee-eabcfa/VISION.md
./.claude/worktrees/xenodochial-chatterjee-eabcfa/CLAUDE.md
./.claude/worktrees/festive-cohen-8d02b6/VISION.md
./.claude/worktrees/festive-cohen-8d02b6/CLAUDE.md
./play-for-good-stage0-island-off-tz.md
./treasure-hunt/CLAUDE.md
./merge-event/CLAUDE.md
./playables-merge-raster-art/CLAUDE.md
./play-for-good-stage1-mission-slice-tz.md
./VISION.md
./mahjong-core/CLAUDE.md
./play-for-good-gap-map-v1.md
./playables-deploy/CLAUDE.md
./dungeon-dig/CLAUDE.md
./solitaire-core/CLAUDE.md
./CLAUDE.md
./playables-dogfood-release/CLAUDE.md
./playables-feed-deploy/CLAUDE.md
./playables/CLAUDE.md

exec
/bin/zsh -lc "git show --no-ext-diff --stat --oneline --decorate=short f86c489523977dcca8d3959e73e9bcfb9f556c9e && git show --no-ext-diff --name-status --format='' f86c489523977dcca8d3959e73e9bcfb9f556c9e" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
f86c489 (HEAD -> master, origin/master) docs: ТЗ Этапов 0/1 v5 после автономного R4 (2×P1+1×P2) + receipts
 play-for-good-stage0-island-off-tz.md     |   34 +-
 play-for-good-stage1-mission-slice-tz.md  |   51 +-
 play-for-good-tz-review-r4-disposition.md |   13 +
 play-for-good-tz-review-r4-prompt.md      |   37 +
 play-for-good-tz-review-r4-raw.md         | 3996 +++++++++++++++++++++++++++++
 5 files changed, 4103 insertions(+), 28 deletions(-)
M	play-for-good-stage0-island-off-tz.md
M	play-for-good-stage1-mission-slice-tz.md
A	play-for-good-tz-review-r4-disposition.md
A	play-for-good-tz-review-r4-prompt.md
A	play-for-good-tz-review-r4-raw.md

exec
/bin/zsh -lc 'git diff --no-ext-diff --unified=40 f86c489523977dcca8d3959e73e9bcfb9f556c9e''^ f86c489523977dcca8d3959e73e9bcfb9f556c9e -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
diff --git a/play-for-good-stage0-island-off-tz.md b/play-for-good-stage0-island-off-tz.md
index b78f695..23c92c2 100644
--- a/play-for-good-stage0-island-off-tz.md
+++ b/play-for-good-stage0-island-off-tz.md
@@ -1,170 +1,174 @@
-# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v4
+# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v5
 
-Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
-Codex; R1–R2 внесены ранее; R3: artifact-url переклассифицирован в
-closed-delivery контур (b); user block добавлен в защитный контур (c),
-`island_friend_blocks` выведен из freeze-списка в allowlist).
+Статус: **DRAFT v5 после кросс-ревью R4** (author: Claude; reviewer:
+Codex; R1–R3 внесены ранее; R4: block локализован в
+`api_island_p2.py:250`; route manifest получил колонку ожидаемых
+статусов, smoke проверяется по ней, а не сплошным 404).
 Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
 
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
 
 Фактическое состояние (проверено 30.07.2026, уточнено R2):
 `app/main.py` — `island_state_router` и `island_social_router`
 смонтированы безусловно (:193–194); **модерация смонтирована внутри
 `if settings.enable_island_social:`** (:195–200) и авторизуется
 server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth);
 `island_router` из `api_island.py` — **theme/bake generation**;
-`api_island_social.py` — public, visits, likes, user-block, и
-**artifact-url (:159), который является closed-delivery resolver'ом,
-а НЕ legacy-поверхностью**;
+`api_island_social.py` — public, visits, likes, и **artifact-url
+(:159), который является closed-delivery resolver'ом, а НЕ
+legacy-поверхностью**; **user-block живёт в `api_island_p2.py:250`**;
 `start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
 `lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
 одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
 ни генерационные runners. **Первый деливерабл П2 — точный route
 manifest**: каждый island-маршрут → файл → целевой контур; физическое
 разделение выполняется только по manifest'у, не по памяти.
 
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
 
 Изменения (одна PR в swipe-backend; прод-деплой — только в П4, после
 pre-set компенсирующих флагов):
 
 0. **Route manifest** (деливерабл до кода): полный список
-   island-маршрутов с файлом-источником и целевым контуром.
+   island-маршрутов с файлом-источником, целевым контуром и
+   **ожидаемым статусом после Этапа 0** (404 для контура (a); живой
+   ответ для (b)/(c)/(d)). Smoke проверяется против этой колонки, а не
+   сплошным 404.
 1. **Разделить роутеры на четыре независимых контура** (по
    manifest'у):
    a) legacy: state (`api_island_state`), public/visits/likes
       (`api_island_social` БЕЗ artifact-url и block), theme/bake
       generation (`api_island`);
    b) closed-delivery resolver — **включая artifact-url endpoint
       (`api_island_social.py:159`)**: это выдача signed GET на уже
       опубликованные артефакты, не legacy;
    c) защитный пользовательский контур: **public report И user block**
-      (`/island/friends/{user_id}/block`) — VISION требует report/block
-      вместе;
+      (`/island/friends/{user_id}/block` из `api_island_p2.py:250`) —
+      VISION требует report/block вместе;
    d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    получают собственные гейты: (b) — существующий
    `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
    `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
    контур не должен выключаться случайно).
 2. **Два раздельных гейта вместо одного** (нужны для quiesce):
    `ENABLE_ISLAND_LEGACY_SURFACE` (default false) — роуты контура (a);
    `ENABLE_ISLAND_GENERATION_RUNNERS` (default false) — запуск/claim
    `start_bake_runner()` / `start_theme_runner()` в `lifespan`.
    Раздельность позволяет состояние «роуты закрыты, runners доживают
    очередь».
 3. Cross-flag валидатор: явные ветки на новые комбинации.
 
 Acceptance (тесты + локально): при `LEGACY_SURFACE=false` все пути
 контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
 и **status/attempts существующих queued jobs не изменяются**; при
 `SOCIAL=false` — модерация, report и closed delivery продолжают
 работать; полный тест-сьют зелёный. Rollback: env-flip
 соответствующего флага в true.
 
 ## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)
 
 Работы: browser/E2E **старого прод-билда клиента** против локального
 backend с выключенными флагами П2: пройти серию до сундука; убедиться,
 что island-запросы получают 404 и деградация тихая — лента играет,
 крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
 обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
 visit-award, лайки).
 
 Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
 finding: чинится до П4.
 
 ## П4 — прод-применение (staged, каждый под-шаг — receipt + проверка)
 
 1. **Pre-set (до деплоя кода!):** в `render.yaml` заранее добавить
    `ENABLE_ISLAND_LEGACY_SURFACE=true` и
    `ENABLE_ISLAND_GENERATION_RUNNERS=true` (плюс явные
    `ENABLE_ISLAND_PROTECTIVE_SURFACE=true`,
    `ENABLE_ISLAND_CLOSED_DELIVERY=true`). Затем задеплоить код П2 —
    деплой не меняет поведение прода (default-false флаги
    компенсированы pre-set'ом). Smoke: legacy-роуты отвечают, runners
    работают, модерация работает.
 2. **Flip поверхности:** `ENABLE_ISLAND_SOCIAL=false`,
    `ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
    `ENABLE_ISLAND_NOTIFICATIONS=false`, явно
    `ISLAND_REWARDS_ENABLED=false` (default true),
    `ENABLE_ISLAND_LEGACY_SURFACE=false`. Новые theme/bake jobs
    невозможны (роуты закрыты); runners ещё включены.
 3. **Quiesce/drain:** дождаться terminal-состояния всех queued/running
    bake/theme jobs (новых нет; bounded wait по lease TTL; job,
    зависший в `generating`, резолвится вручную по runbook'у до
    продолжения). Проверка: ноль незавершённых jobs.
 4. **Flip runners:** `ENABLE_ISLAND_GENERATION_RUNNERS=false`
    (рестарт; runners больше не стартуют; ничего не оборвано
    посередине — очередь пуста).
-5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
-   delivery (artifact-url) выдаёт signed GET на существующий артефакт;
-   report, user block и модерационная консоль работают; в логах нет
-   bot/notification/bake/theme runner'ов.
+5. **Prod smoke:** curl-набор по route manifest'у — **каждый маршрут
+   отвечает ожидаемым статусом своего контура**: legacy (a) → 404;
+   artifact-url выдаёт signed GET на существующий артефакт; report,
+   user block и модерационная консоль отвечают живыми статусами; в
+   логах нет bot/notification/bake/theme runner'ов.
 
 Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
 включение ботов безопасно by design (immutable per-day планы, bounded
 catch-up).
 
 ## П5 — snapshot manifest, схема и доки
 
 1. **Data-manifest с явным freeze-списком** (после drain П4):
    snapshot row counts + max seq/id + digest mutable-state по
    **freeze-списку** legacy/social/economy таблиц: `island_states`,
    `island_building_social`, `island_visits`, `island_building_likes`,
    `island_completion_claims`, `island_completion_outcomes`,
    `island_collect_claims`, `island_visit_awards`, `island_bots`,
    `island_bot_daily_plans`, `island_friend_codes`,
    `island_friendships`,
    `island_notification_outbox`, `island_notification_attempts`,
    `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
    Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
    таблицы (`island_reports`, `island_moderation_actions`,
    **`island_friend_blocks`** — пользовательский block остаётся живым
    контуром) в freeze-список **не входят**: их writes разрешены и
    проверяются как audit receipts — каждая новая строка соответствует
    конкретному report/block/moderation-акту. Manifest — receipt
    пакета.
 2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
    v3.0.1).
 3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
    состав), durable-строка в корневой `CLAUDE.md`, при необходимости
    `AGENTS.md`.
 
 Acceptance: manifest-проверка чистая; схема опубликована;
 `docs-boundary-lint` чистый.
 
 ---
 
 ## Порядок применения
 
 П1 (клиент) → П2 (код: route manifest + разделение, PR без
 прод-деплоя) → П3 (pre-prod E2E старого клиента) → П4 (pre-set →
 деплой → staged env-flip'ы → drain → prod smoke) → П5
diff --git a/play-for-good-stage1-mission-slice-tz.md b/play-for-good-stage1-mission-slice-tz.md
index d97488b..e20afd1 100644
--- a/play-for-good-stage1-mission-slice-tz.md
+++ b/play-for-good-stage1-mission-slice-tz.md
@@ -1,189 +1,214 @@
-# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v4
+# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v5
 
-Статус: **DRAFT v4 после кросс-ревью R3** (author: Claude; reviewer:
-Codex; R1–R2 внесены ранее; R3: `mission_case_bindings` — версия
-контракта одна на весь lifecycle by construction; монотонный
-`ledger.seq` + правило `eligible at cursor` для воспроизводимого
-UNLOCKED-снапшота).
+Статус: **DRAFT v5 после кросс-ревью R4** (author: Claude; reviewer:
+Codex; R1–R3 внесены ранее; R4: `mission_funding_policies` — денежная
+политика версионируется и пинится контрактом/receipt'ами;
+`mission_contribution_weights` — веса вклада версионируются,
+предусловие token_goal проверяется с обеих сторон).
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
 
-0. **`mission_case_bindings`** — immutable биндинг «кейс ↔ ровно одна
+0a. **`mission_funding_policies`** — immutable денежная политика
+   (образец feed_policy_config_versions): PK `policy_version`,
+   `policy_digest`, `document` JSONB schema
+   `mission.funding-policy.v1`: полная формула gift, правило
+   snapshot/cursor (`eligible = ledger.seq ≤ cursor`), определение
+   eligible pool и допустимых источников, правило округления (вниз до
+   целых центов), валюта. Контракт кейса пинит точную пару
+   `(funding_policy_version, policy_digest)`; UNLOCKED-receipt пинит и
+   контракт, и политику — по какой денежной политике рассчитан
+   подарок, доказуемо из самого receipt, а не из глобального текста ТЗ.
+0b. **`mission_contribution_weights`** — immutable versioned веса
+   источников вклада (серия/дейлик; позже коллекции): amount-правила
+   по источникам, `weights_version`, digest (требование gap-карты
+   «веса — versioned config»). Каждый contribution пинит точную
+   версию весов. Регистрация новой версии весов **отклоняется**, если
+   её максимальный одиночный вклад превышает `token_goal` любого
+   текущего READY/ACTIVE кейса — предусловие проверяется совместно с
+   обеих сторон. Runtime-защита: вклад, не помещающийся в две
+   child-строки, отклоняется retryable-ошибкой до операторской
+   резолюции — каскад по N кейсам в v0 запрещён.
+0c. **`mission_case_bindings`** — immutable биндинг «кейс ↔ ровно одна
    версия контракта»: PK `case_id`, `contract_version` (FK на
    contracts; пара UNIQUE), `bound_at`. Создаётся при `ready` и никогда
    не меняется: новая версия потребности = **новый case_id** (в
    культуре «изменение биндинга = новая identity»). Все остальные
    таблицы ссылаются composite-FK `(case_id, contract_version)` на
    bindings, а не на contracts напрямую — расхождение версий вдоль
    lifecycle-цепочки (READY на v1, UNLOCKED на v3) невозможно by
    construction.
 1. **`mission_case_contracts`** — immutable контракт кейса:
    PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
    `document` JSONB schema `mission.case-contract.v1`: получатель;
    потребность `scalable|fixed`; guaranteed deliverable;
    **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
    `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
    (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
    `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
    `latest_fulfillment_at`; `queue_position`; ожидаемый вид
-   подтверждения. `registered_by/at`.
+   подтверждения; **пин `(funding_policy_version, policy_digest)`** —
+   денежная политика входит в contract_digest. `registered_by/at`.
 2. **`mission_runtime`** — **singleton-строка** (PK-константа,
    CHECK id=1): пара `active_case_id + active_contract_version`
    (nullable вместе), `updated_seq`.
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
 4. **`mission_pool_ledger`** — rolling pool: **монотонный `seq`
    (BIGSERIAL)**; строки immutable и вставляются только уже settled
    (`settled_at` фиксируется при insert, задним числом строки не
    settled-ятся); `source ∈
    seed|revenue_share|partner|subscription_share` (v0 — только seed),
    `amount_cents`, `currency` (CHECK `='EUR'`), `meta`,
    `idempotency_key` UNIQUE. **Правило cursor'а:** `pool_cursor`
    allocation'а = max `ledger.seq` на момент снапшота; `settled
    unallocated eligible pool на cursor` = `sum(ledger.amount при seq ≤
    cursor) − sum(предыдущих allocations)`. Поздние строки получают
    больший `seq` и в прошлый снапшот не входят — immutable
    UNLOCKED-сумма воспроизводима by construction.
 5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
    reserve_guaranteed|gift_additional`, `(case_id,
    contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
    `pool_cursor`, FK на породивший lifecycle event, `receipt`.
    **Финансовая идемпотентность и границы:** UNIQUE idempotency
    identity (`res:{case_id}:{contract_version}` /
    `gift:{case_id}:{contract_version}`); округление
    `unlock_share × cents` — вниз до целых центов; CHECK-и:
    `unlock_share ∈ [0,1]` (в receipt), `guaranteed_cents ≤
    confirmed_need_cents + stretch_cap_cents` (на контракте),
    положительные `amount_cents` в ledger и allocations. Инвариант (в
    транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
    ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
    unlock_share(progress) × settled unallocated pool на cursor,
    confirmed_need_cents + stretch_cap_cents)`.
 6. **`mission_contributions`** (+ child
    **`mission_contribution_allocations`**) — вклад: `user_id`,
    `source ∈ series|daily`, `amount`, `source_ref`,
    `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
    **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
    `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
+   **пин `weights_version`** (по какой версии весов посчитан amount);
    `seq` под runtime-lock; receipt в той же транзакции, replay
    byte-identical. Child-allocations (каждая пинит `(case_id,
    contract_version)`): обычно одна строка; при пересечении
    `token_goal` — детерминированно две. **Инвариант
    `sum(child)=amount` — service-level в той же транзакции +
    reconciliation-тест** (обычный SQL CHECK не читает другие строки;
    constraint trigger — опциональное усиление позже).
 7. **`mission_fulfillments`** (+ child
    **`mission_fulfillment_allocations`**) — typed transfer receipt
    `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
    `amount_cents`, `currency` (CHECK `='EUR'`), `recipient`,
    `transfer_reference`/`transfer_date`, `evidence_digest`, immutable
    content-addressed `artifact_url`. Child-строки связывают receipt с
    **каждой** покрываемой allocation-строкой (обычный перевод
    покрывает две: `reserve_guaranteed` + `gift_additional`). Сервис
    принимает fulfill только при полном покрытии зафиксированного gift
    (`sum(child) = amount_cents = зарезервировано+открыто кейса`);
    `FULFILLED` event пишется атомарно в той же транзакции. Публичное
    «реально передано» проецируется **только** из fulfillment-receipts.
 
 **Exact contract identity проходит через всю схему:** runtime,
 case-events, pool-allocations, contribution-allocations и
 fulfillments пинят точную пару `(case_id, contract_version)`
 composite-FK **на `mission_case_bindings`** — версия у кейса ровно
 одна на весь lifecycle, из каждой строки доказуемо, по какой версии
 посчитаны goal и деньги, а расхождение версий между событиями
 исключено схемой, не только тестом.
 
 ### State machine и очередь
 
 `register-contract` → **`ready`** (отдельная CLI-команда: резервирует
 гарантию из pool — allocation `reserve_guaranteed` — и пишет
 ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
 (допустим только при `active_case_id IS NULL`; берёт head очереди
 READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
 `unlock-cutoff`) **в той же транзакции активирует следующий READY из
 очереди**. Правила:
 
 - Включение `ENABLE_MISSION_CORE` требует **DB-preflight** —
   CLI-команда и startup-проверка, не config-validator (у него нет
   доступа к БД): существует ACTIVE и ≥1 READY-successor.
 - Аварийный путь пустой очереди (VISION-совместимый): транзакция
   пересекающего вклада **не коммитится** и возвращает retryable
   **503** — клиентский outbox сохраняет результат и повторит после
   появления READY-кейса. Не 409: существующий result-outbox считает
   409 terminal и удалит запись. `unlock-cutoff` при отсутствующем
   successor отказывает до создания READY-кейса. Операционный
   инвариант — держать очередь непустой; 503-ветка — предохранитель,
   не рабочий режим.
-- Предусловие v0 (валидируется при `register-contract`): `token_goal`
-  каждого кейса ≥ максимально возможного одиночного вклада (максимум
-  серии/дейлика из reward-функций) — пересечение затрагивает максимум
-  два кейса, двух child-строк достаточно. Каскадное распределение по N
-  кейсам понадобится для крупных collection-наград (Этап 2).
+- Предусловие v0 (проверяется с ОБЕИХ сторон): при
+  `register-contract` — `token_goal` кейса ≥ максимального одиночного
+  вклада **активной версии `mission_contribution_weights`**; при
+  регистрации новой версии весов — её максимум не превышает
+  `token_goal` ни одного READY/ACTIVE кейса (иначе отказ). Пересечение
+  затрагивает максимум два кейса, двух child-строк достаточно;
+  runtime-нарушение → retryable-отказ. Каскад по N кейсам — только с
+  крупными collection-наградами (Этап 2).
 
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

exec
/bin/zsh -lc 'wc -l CLAUDE.md VISION.md play-for-good-gap-map-v1.md play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md play-for-good-tz-review-r4-disposition.md play-for-good-tz-review-r4-prompt.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     291 CLAUDE.md
     616 VISION.md
     309 play-for-good-gap-map-v1.md
     192 play-for-good-stage0-island-off-tz.md
     270 play-for-good-stage1-mission-slice-tz.md
      13 play-for-good-tz-review-r4-disposition.md
      37 play-for-good-tz-review-r4-prompt.md
    1728 total

exec
/bin/zsh -lc 'nl -ba play-for-good-tz-review-r4-disposition.md && nl -ba play-for-good-tz-review-r4-prompt.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# Disposition R4 (автономная петля codex exec, 30.07.2026)
     2	
     3	Раунд R4 (второй автономный; gpt-5.6-sol, effort xhigh — заголовок в
     4	raw). Сырой ответ целиком: `play-for-good-tz-review-r4-raw.md`.
     5	
     6	| # | Finding | Disposition |
     7	|---|---------|-------------|
     8	| 1 | [P1] Контракт кейса не фиксирует денежную политику (funding source, eligible pool, формула, snapshot/cursor остаются глобальным текстом) — digest не доказывает политику расчёта | **Принято.** Новая `mission_funding_policies` (immutable versioned, образец 0018): формула, правило cursor'а, определение eligible pool/источников, округление; контракт пинит `(policy_version, policy_digest)` и включает пин в contract_digest; UNLOCKED-receipt пинит и контракт, и политику (Stage 1 v5) |
     9	| 2 | [P1] token_goal-предусловие проверяется только при регистрации против текущих reward-функций; смена номиналов может дать вклад больше максимума и >2 кейсов | **Принято.** Новая `mission_contribution_weights` (versioned, по требованию gap-карты); contribution пинит weights_version; предусловие двустороннее: register-contract против активных весов И регистрация новой версии весов против token_goal всех READY/ACTIVE; runtime-нарушение → retryable-отказ, каскад в v0 запрещён (Stage 1 v5) |
    10	| 3 | [P2] Block на самом деле в `api_island_p2.py:250` (не api_island_social); smoke «весь manifest → 404» противоречит живым защитным роутам | **Принято.** Факт-состояние и контур (c) исправлены; route manifest получил колонку «ожидаемый статус после Этапа 0», smoke проверяется по ней (Stage 0 v5) |
    11	
    12	Authority-эскалаций нет. R5 — последний автономный раунд по
    13	заявленному лимиту петли (3); при не-GO — эскалация оператору.
     1	Роль: независимый ревьюер (author ≠ reviewer), режим только-чтение.
     2	
     3	Ревьюируемая идентичность: коммит
     4	eaa7ca943a1994eab0fa51cafe2cc987d7274c86. Сначала выполни
     5	`git rev-parse HEAD` и убедись, что HEAD равен этому SHA (untracked
     6	review-файлы допустимы); если не равен — остановись и сообщи об этом
     7	вместо ревью.
     8	
     9	Проревьюй два файла этого коммита:
    10	- play-for-good-stage0-island-off-tz.md (v3)
    11	- play-for-good-stage1-mission-slice-tz.md (v3)
    12	
    13	Это раунд R4 после твоих findings R1–R3. Проверь:
    14	1) корректно ли внесены все findings R2: staged rollout с pre-set
    15	   компенсирующих флагов; раздельные гейты роутов/runners и
    16	   quiesce/drain; freeze-список таблиц с allowlist защитных writes;
    17	   исправленная карта роутеров + route manifest; аварийный 503-путь
    18	   пустой очереди (не 409) с отказом unlock-cutoff и DB-preflight;
    19	   exact contract identity (case_id, contract_version) во всей схеме;
    20	   mission_fulfillment_allocations и атомарный FULFILLED при полном
    21	   покрытии; финансовая идемпотентность, округление вниз,
    22	   CHECK-границы; предусловие token_goal;
    23	2) контрактную целостность против VISION.md (v3.0.1) и
    24	   play-for-good-gap-map-v1.md того же коммита;
    25	3) не внесли ли правки v3 новых противоречий.
    26	
    27	Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
    28	файлами/строками, либо явный вердикт "GO" первым словом, если блокеров
    29	нет. Только ревью — никаких правок файлов.
    30	
    31	Дополнение R4: проверь прежде всего внесение findings R3 —
    32	(1) artifact-url в контуре (b) closed delivery, smoke непротиворечив;
    33	(2) user block в защитном контуре (c), island_friend_blocks вне
    34	freeze-списка (в allowlist); (3) mission_case_bindings: одна версия
    35	контракта на весь lifecycle by construction; (4) монотонный ledger.seq
    36	и правило eligible-at-cursor. Если блокеров нет — вердикт "GO" первым
    37	словом.

exec
/bin/zsh -lc "grep -nE '"'^'"\\[P[123]\\]|\\[P[123]\\]' play-for-good-tz-review-r4-raw.md | tail -n 30" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
39:Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
3013:    12	| 1 | [P1] artifact-url отнесён к legacy, хотя это closed-delivery resolver (`api_island_social.py:159`); LEGACY_SURFACE=false требовал бы 404 при smoke, требующем signed GET | **Принято.** Контур (b) теперь явно включает artifact-url; факт-состояние и smoke исправлены (Stage 0 v4) |
3014:    13	| 2 | [P1] Потерян пользовательский block: report сохранён, `/island/friends/{user_id}/block` — нет; `island_friend_blocks` во freeze без allowlist | **Принято.** Контур (c) = report И block; `island_friend_blocks` выведен из freeze-списка в allowlist защитных writes с audit-receipts (Stage 0 v4) |
3015:    14	| 3 | [P1] UNIQUE(case_id, kind) допускает READY на v1 / UNLOCKED на v3 — версия не закреплена вдоль цепочки | **Принято.** Новая `mission_case_bindings` (case_id PK ↔ ровно одна contract_version, создаётся при ready, новая версия = новый case_id); все таблицы composite-FK на bindings — расхождение исключено схемой; негативный тест добавлен (Stage 1 v4) |
3016:    15	| 4 | [P2] `pool_cursor` невоспроизводим: у ledger нет монотонного порядка и правила eligible-at-cursor | **Принято.** `ledger.seq` BIGSERIAL, строки immutable и вставляются только settled; cursor = max seq на снапшоте; eligible = seq ≤ cursor; поздние строки в прошлый снапшот не входят by construction (Stage 1 v4) |
3021:39:Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
3023:2252:Формат ответа: findings списком с [P1]/[P2]/[P3] и точными
3026:2865:- [P1] [play-for-good-stage0-island-off-tz.md:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:60>) относит `artifact-url` к legacy-контуру, хотя это и есть closed-delivery resolver ([api_island_social.py:159](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_social.py:159>)). Поэтому `LEGACY_SURFACE=false` требует для него 404, одновременно smoke требует signed GET ([строки 121–123](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:121>)). Оба условия невыполнимы; route manifest уже предписан неверной классификацией.
3027:2867:- [P1] В защитном контуре потерян пользовательский block: четыре контура сохраняют report, но не `/island/friends/{user_id}/block` ([строки 58–70](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), а `island_friend_blocks` включён в freeze без allowlist защитных writes ([строки 132–146](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:132>)). Это противоречит обязательному `report/block` и требованию сохранять safety-контур после ухода UGC из центра продукта ([VISION.md:501](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:501>)).
3028:2869:- [P1] Exact contract identity добавлена в отдельные строки, но не закреплена для всей lifecycle-цепочки. `UNIQUE (case_id, kind)` допускает `READY` на v1, `ACTIVE` на v2 и `UNLOCKED` на v3 ([строки 49–53](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:49>)); отдельные composite FK этого не запрещают. Заявление на [строках 99–103](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:99>) и тест лишь присутствия пары не обеспечивают совпадение версии между событиями, runtime и финансовыми allocations.
3029:2871:- [P2] Не определён воспроизводимый cursor rolling pool. `mission_pool_ledger` не задаёт монотонный `seq/id`, тогда как allocation хранит `pool_cursor`, формула зависит от него ([строки 54–72](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:54>)), а тест требует неизменности snapshot после поздних settled-строк ([строка 179](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:179>)). Без точного порядка и правила `eligible at cursor` immutable UNLOCKED-сумма не воспроизводима.
3030:2874:- [P1] [play-for-good-stage0-island-off-tz.md:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:60>) относит `artifact-url` к legacy-контуру, хотя это и есть closed-delivery resolver ([api_island_social.py:159](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_social.py:159>)). Поэтому `LEGACY_SURFACE=false` требует для него 404, одновременно smoke требует signed GET ([строки 121–123](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:121>)). Оба условия невыполнимы; route manifest уже предписан неверной классификацией.
3031:2876:- [P1] В защитном контуре потерян пользовательский block: четыре контура сохраняют report, но не `/island/friends/{user_id}/block` ([строки 58–70](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), а `island_friend_blocks` включён в freeze без allowlist защитных writes ([строки 132–146](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:132>)). Это противоречит обязательному `report/block` и требованию сохранять safety-контур после ухода UGC из центра продукта ([VISION.md:501](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:501>)).
3032:2878:- [P1] Exact contract identity добавлена в отдельные строки, но не закреплена для всей lifecycle-цепочки. `UNIQUE (case_id, kind)` допускает `READY` на v1, `ACTIVE` на v2 и `UNLOCKED` на v3 ([строки 49–53](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:49>)); отдельные composite FK этого не запрещают. Заявление на [строках 99–103](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:99>) и тест лишь присутствия пары не обеспечивают совпадение версии между событиями, runtime и финансовыми allocations.
3033:2880:- [P2] Не определён воспроизводимый cursor rolling pool. `mission_pool_ledger` не задаёт монотонный `seq/id`, тогда как allocation хранит `pool_cursor`, формула зависит от него ([строки 54–72](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:54>)), а тест требует неизменности snapshot после поздних settled-строк ([строка 179](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:179>)). Без точного порядка и правила `eligible at cursor` immutable UNLOCKED-сумма не воспроизводима.
3977:- [P1] Защитный `user block` всё ещё несовместим с freeze-инвариантом. В freeze остаются [`island_friendships` и `island_meta_events`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:138>), а allowlist охватывает только `island_friend_blocks`. Реальный block обновляет `island_friendships.removed_at` и пишет `island_meta_events` ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); unblock удаляет строку block и также пишет meta-event ([api_island_p2.py:291](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:291>)). Поэтому работающий защитный контур нарушит 24-часовую freeze-проверку и mutable-state digest.
3979:- [P1] `ledger.seq` не гарантирует заявленную воспроизводимость snapshot. [`BIGSERIAL` и утверждение «поздние строки получают больший seq»](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>) неверны при конкурентных транзакциях: транзакция может получить меньший `seq`, остаться незакоммиченной, а после фиксации cursor закоммититься и ретроактивно попасть в `seq ≤ cursor`. Общий runtime-lock предписан только lifecycle/contribution writers ([строки 53–55](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:53>)), но не `seed-pool`. Кроме того, `sum(предыдущих allocations)` не привязан к event/allocation cutoff: более поздний READY reserve способен изменить повторный расчёт старого snapshot при том же ledger cursor.
3981:- [P1] Immutable case contract не фиксирует весь публичный финансовый контракт. Перечень полей [`mission_case_contracts`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:40>) не содержит funding source, определения eligible pool/revenue, версии полной формулы и правила snapshot/cursor. Эти правила остаются глобальной логикой в [описании ledger/allocations](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>), поэтому `(case_id, contract_version)` и digest не доказывают, по какой именно денежной политике рассчитан подарок. Это расходится с обязательным составом контракта в [VISION.md:103](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:103>) и [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).
3983:- [P1] Предусловие `token_goal` проверяется только при регистрации против текущих reward-функций ([строки 145–149](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:145>)), но contribution schema не пинит версию reward-config ([строки 90–102](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)). После изменения номинала один вклад может превысить зарегистрированный максимум, пересечь больше двух кейсов и сломать ограничение «двух child-строк достаточно». Gap map прямо требует versioned weights ([play-for-good-gap-map-v1.md:119](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-gap-map-v1.md:119>)).
3985:- [P2] Карта роутеров и smoke остаются неточными. Фактическое состояние ошибочно относит block к `api_island_social.py` ([stage0:29](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:29>)); endpoint находится в [api_island_p2.py:250](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:250>). Кроме того, manifest определён как список всех island-маршрутов ([stage0:58](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), но prod smoke требует, чтобы curl-набор «по route manifest» целиком дал 404, одновременно требуя успешные artifact-url/report/block/moderation ([stage0:127](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:127>)). Буквально такой acceptance невыполним; ожидаемые статусы должны задаваться по каждому контуру.
3988:- [P1] Защитный `user block` всё ещё несовместим с freeze-инвариантом. В freeze остаются [`island_friendships` и `island_meta_events`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:138>), а allowlist охватывает только `island_friend_blocks`. Реальный block обновляет `island_friendships.removed_at` и пишет `island_meta_events` ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); unblock удаляет строку block и также пишет meta-event ([api_island_p2.py:291](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:291>)). Поэтому работающий защитный контур нарушит 24-часовую freeze-проверку и mutable-state digest.
3990:- [P1] `ledger.seq` не гарантирует заявленную воспроизводимость snapshot. [`BIGSERIAL` и утверждение «поздние строки получают больший seq»](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>) неверны при конкурентных транзакциях: транзакция может получить меньший `seq`, остаться незакоммиченной, а после фиксации cursor закоммититься и ретроактивно попасть в `seq ≤ cursor`. Общий runtime-lock предписан только lifecycle/contribution writers ([строки 53–55](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:53>)), но не `seed-pool`. Кроме того, `sum(предыдущих allocations)` не привязан к event/allocation cutoff: более поздний READY reserve способен изменить повторный расчёт старого snapshot при том же ledger cursor.
3992:- [P1] Immutable case contract не фиксирует весь публичный финансовый контракт. Перечень полей [`mission_case_contracts`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:40>) не содержит funding source, определения eligible pool/revenue, версии полной формулы и правила snapshot/cursor. Эти правила остаются глобальной логикой в [описании ledger/allocations](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>), поэтому `(case_id, contract_version)` и digest не доказывают, по какой именно денежной политике рассчитан подарок. Это расходится с обязательным составом контракта в [VISION.md:103](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:103>) и [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).
3994:- [P1] Предусловие `token_goal` проверяется только при регистрации против текущих reward-функций ([строки 145–149](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:145>)), но contribution schema не пинит версию reward-config ([строки 90–102](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)). После изменения номинала один вклад может превысить зарегистрированный максимум, пересечь больше двух кейсов и сломать ограничение «двух child-строк достаточно». Gap map прямо требует versioned weights ([play-for-good-gap-map-v1.md:119](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-gap-map-v1.md:119>)).
3996:- [P2] Карта роутеров и smoke остаются неточными. Фактическое состояние ошибочно относит block к `api_island_social.py` ([stage0:29](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:29>)); endpoint находится в [api_island_p2.py:250](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:250>). Кроме того, manifest определён как список всех island-маршрутов ([stage0:58](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), но prod smoke требует, чтобы curl-набор «по route manifest» целиком дал 404, одновременно требуя успешные artifact-url/report/block/moderation ([stage0:127](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:127>)). Буквально такой acceptance невыполним; ожидаемые статусы должны задаваться по каждому контуру.

exec
/bin/zsh -lc "sed -n '3920,3996p' play-for-good-tz-review-r4-raw.md" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
111:   принимает fulfill только при полном покрытии зафиксированного gift
114:   «реально передано» проецируется **только** из fulfillment-receipts.
117:case-events, pool-allocations, contribution-allocations и
118:fulfillments пинят точную пару `(case_id, contract_version)`
127:гарантию из pool — allocation `reserve_guaranteed` — и пишет
135:  CLI-команда и startup-проверка, не config-validator (у него нет
145:- Предусловие v0 (валидируется при `register-contract`): `token_goal`
165:  amount, allocations по кейсам, состояние бара после). Ответ
176:Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
177:`unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
187:зарезервировано и открыто / реально передано-из-fulfillments, контракт
198:не меняется от поздних settled-строк; fulfillment coverage (transfer =
199:сумма указанных allocations; чужие allocations → отказ);
203:не потерян и не задублирован; fulfillment покрывает обе allocation
205:пин `(case_id, contract_version)` присутствует во всех receipts;
206:негативный тест расхождения версий (событие/allocation с версией, не
208:`ledger.seq ≤ cursor` при любых поздних строках; округление вниз и
229:потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
230:формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
235:Полный реальный цикл: контракт → посев → READY (резервирование) →
4:Codex; R1–R2 внесены ранее; R3: artifact-url переклассифицирован в
5:closed-delivery контур (b); user block добавлен в защитный контур (c),
6:`island_friend_blocks` выведен из freeze-списка в allowlist).
29:`api_island_social.py` — public, visits, likes, user-block, и
30:**artifact-url (:159), который является closed-delivery resolver'ом,
36:manifest**: каждый island-маршрут → файл → целевой контур; физическое
37:разделение выполняется только по manifest'у, не по памяти.
58:0. **Route manifest** (деливерабл до кода): полный список
61:   manifest'у):
63:      (`api_island_social` БЕЗ artifact-url и block), theme/bake
65:   b) closed-delivery resolver — **включая artifact-url endpoint
68:   c) защитный пользовательский контур: **public report И user block**
69:      (`/island/friends/{user_id}/block`) — VISION требует report/block
86:контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
96:что island-запросы получают 404 и деградация тихая — лента играет,
101:Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
127:5. **Prod smoke:** curl-набор по route manifest'у → 404; closed
128:   delivery (artifact-url) выдаёт signed GET на существующий артефакт;
129:   report, user block и модерационная консоль работают; в логах нет
136:## П5 — snapshot manifest, схема и доки
138:1. **Data-manifest с явным freeze-списком** (после drain П4):
140:   **freeze-списку** legacy/social/economy таблиц: `island_states`,
144:   `island_bot_daily_plans`, `island_friend_codes`,
145:   `island_friendships`,
147:   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
148:   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
150:   **`island_friend_blocks`** — пользовательский block остаётся живым
151:   контуром) в freeze-список **не входят**: их writes разрешены и
153:   конкретному report/block/moderation-акту. Manifest — receipt
161:Acceptance: manifest-проверка чистая; схема опубликована;
168:П1 (клиент) → П2 (код: route manifest + разделение, PR без
171:(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
177:- Backend: контур (a) → 404; bake/theme/bot/notification runners не
179:- Closed delivery (artifact-url) / public report / user block /
185:- Data-manifest: ноль записей в freeze-списке после cutoff; защитные

codex
- [P1] Защитный `user block` всё ещё несовместим с freeze-инвариантом. В freeze остаются [`island_friendships` и `island_meta_events`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:138>), а allowlist охватывает только `island_friend_blocks`. Реальный block обновляет `island_friendships.removed_at` и пишет `island_meta_events` ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); unblock удаляет строку block и также пишет meta-event ([api_island_p2.py:291](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:291>)). Поэтому работающий защитный контур нарушит 24-часовую freeze-проверку и mutable-state digest.

- [P1] `ledger.seq` не гарантирует заявленную воспроизводимость snapshot. [`BIGSERIAL` и утверждение «поздние строки получают больший seq»](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>) неверны при конкурентных транзакциях: транзакция может получить меньший `seq`, остаться незакоммиченной, а после фиксации cursor закоммититься и ретроактивно попасть в `seq ≤ cursor`. Общий runtime-lock предписан только lifecycle/contribution writers ([строки 53–55](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:53>)), но не `seed-pool`. Кроме того, `sum(предыдущих allocations)` не привязан к event/allocation cutoff: более поздний READY reserve способен изменить повторный расчёт старого snapshot при том же ledger cursor.

- [P1] Immutable case contract не фиксирует весь публичный финансовый контракт. Перечень полей [`mission_case_contracts`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:40>) не содержит funding source, определения eligible pool/revenue, версии полной формулы и правила snapshot/cursor. Эти правила остаются глобальной логикой в [описании ledger/allocations](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>), поэтому `(case_id, contract_version)` и digest не доказывают, по какой именно денежной политике рассчитан подарок. Это расходится с обязательным составом контракта в [VISION.md:103](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:103>) и [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).

- [P1] Предусловие `token_goal` проверяется только при регистрации против текущих reward-функций ([строки 145–149](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:145>)), но contribution schema не пинит версию reward-config ([строки 90–102](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)). После изменения номинала один вклад может превысить зарегистрированный максимум, пересечь больше двух кейсов и сломать ограничение «двух child-строк достаточно». Gap map прямо требует versioned weights ([play-for-good-gap-map-v1.md:119](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-gap-map-v1.md:119>)).

- [P2] Карта роутеров и smoke остаются неточными. Фактическое состояние ошибочно относит block к `api_island_social.py` ([stage0:29](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:29>)); endpoint находится в [api_island_p2.py:250](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:250>). Кроме того, manifest определён как список всех island-маршрутов ([stage0:58](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), но prod smoke требует, чтобы curl-набор «по route manifest» целиком дал 404, одновременно требуя успешные artifact-url/report/block/moderation ([stage0:127](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:127>)). Буквально такой acceptance невыполним; ожидаемые статусы должны задаваться по каждому контуру.
tokens used
115,393
- [P1] Защитный `user block` всё ещё несовместим с freeze-инвариантом. В freeze остаются [`island_friendships` и `island_meta_events`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:138>), а allowlist охватывает только `island_friend_blocks`. Реальный block обновляет `island_friendships.removed_at` и пишет `island_meta_events` ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); unblock удаляет строку block и также пишет meta-event ([api_island_p2.py:291](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:291>)). Поэтому работающий защитный контур нарушит 24-часовую freeze-проверку и mutable-state digest.

- [P1] `ledger.seq` не гарантирует заявленную воспроизводимость snapshot. [`BIGSERIAL` и утверждение «поздние строки получают больший seq»](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>) неверны при конкурентных транзакциях: транзакция может получить меньший `seq`, остаться незакоммиченной, а после фиксации cursor закоммититься и ретроактивно попасть в `seq ≤ cursor`. Общий runtime-lock предписан только lifecycle/contribution writers ([строки 53–55](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:53>)), но не `seed-pool`. Кроме того, `sum(предыдущих allocations)` не привязан к event/allocation cutoff: более поздний READY reserve способен изменить повторный расчёт старого snapshot при том же ledger cursor.

- [P1] Immutable case contract не фиксирует весь публичный финансовый контракт. Перечень полей [`mission_case_contracts`](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:40>) не содержит funding source, определения eligible pool/revenue, версии полной формулы и правила snapshot/cursor. Эти правила остаются глобальной логикой в [описании ledger/allocations](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:63>), поэтому `(case_id, contract_version)` и digest не доказывают, по какой именно денежной политике рассчитан подарок. Это расходится с обязательным составом контракта в [VISION.md:103](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:103>) и [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).

- [P1] Предусловие `token_goal` проверяется только при регистрации против текущих reward-функций ([строки 145–149](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:145>)), но contribution schema не пинит версию reward-config ([строки 90–102](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)). После изменения номинала один вклад может превысить зарегистрированный максимум, пересечь больше двух кейсов и сломать ограничение «двух child-строк достаточно». Gap map прямо требует versioned weights ([play-for-good-gap-map-v1.md:119](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-gap-map-v1.md:119>)).

- [P2] Карта роутеров и smoke остаются неточными. Фактическое состояние ошибочно относит block к `api_island_social.py` ([stage0:29](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:29>)); endpoint находится в [api_island_p2.py:250](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:250>). Кроме того, manifest определён как список всех island-маршрутов ([stage0:58](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:58>)), но prod smoke требует, чтобы curl-набор «по route manifest» целиком дал 404, одновременно требуя успешные artifact-url/report/block/moderation ([stage0:127](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:127>)). Буквально такой acceptance невыполним; ожидаемые статусы должны задаваться по каждому контуру.

exec
/bin/zsh -lc 'nl -ba play-for-good-stage0-island-off-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v5
     2	
     3	Статус: **DRAFT v5 после кросс-ревью R4** (author: Claude; reviewer:
     4	Codex; R1–R3 внесены ранее; R4: block локализован в
     5	`api_island_p2.py:250`; route manifest получил колонку ожидаемых
     6	статусов, smoke проверяется по ней, а не сплошным 404).
     7	Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.
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
    29	`api_island_social.py` — public, visits, likes, и **artifact-url
    30	(:159), который является closed-delivery resolver'ом, а НЕ
    31	legacy-поверхностью**; **user-block живёт в `api_island_p2.py:250`**;
    32	`start_bake_runner()` / `start_theme_runner()` вызываются безусловно в
    33	`lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_SOCIAL=false`
    34	одновременно убило бы модерацию и не остановило бы ни legacy-роуты,
    35	ни генерационные runners. **Первый деливерабл П2 — точный route
    36	manifest**: каждый island-маршрут → файл → целевой контур; физическое
    37	разделение выполняется только по manifest'у, не по памяти.
    38	
    39	---
    40	
    41	## П1 — снятие клиентской поверхности
    42	
    43	Изменения: релиз feed-prototype с выключенными `VITE_ISLAND_ENABLED`,
    44	`VITE_ISLAND_VISIT_AWARDS_ENABLED`, `VITE_ISLAND_NOTIFICATIONS_ENABLED`
    45	(предварительно зафиксировать фактические значения деплой-окружения в
    46	receipt). Код не меняется — поверхность уже за флагами
    47	(`src/feed.ts:202-210`, deep-links в `src/main.ts`).
    48	
    49	Acceptance: свежая сессия — нет вкладки «мета», друзей в HUD,
    50	island-обработки deep-links; ноль запросов `/api/island/*`.
    51	Rollback: предыдущий клиентский билд.
    52	
    53	## П2 — backend-код: физическое разделение контуров + гейты runners
    54	
    55	Изменения (одна PR в swipe-backend; прод-деплой — только в П4, после
    56	pre-set компенсирующих флагов):
    57	
    58	0. **Route manifest** (деливерабл до кода): полный список
    59	   island-маршрутов с файлом-источником, целевым контуром и
    60	   **ожидаемым статусом после Этапа 0** (404 для контура (a); живой
    61	   ответ для (b)/(c)/(d)). Smoke проверяется против этой колонки, а не
    62	   сплошным 404.
    63	1. **Разделить роутеры на четыре независимых контура** (по
    64	   manifest'у):
    65	   a) legacy: state (`api_island_state`), public/visits/likes
    66	      (`api_island_social` БЕЗ artifact-url и block), theme/bake
    67	      generation (`api_island`);
    68	   b) closed-delivery resolver — **включая artifact-url endpoint
    69	      (`api_island_social.py:159`)**: это выдача signed GET на уже
    70	      опубликованные артефакты, не legacy;
    71	   c) защитный пользовательский контур: **public report И user block**
    72	      (`/island/friends/{user_id}/block` из `api_island_p2.py:250`) —
    73	      VISION требует report/block вместе;
    74	   d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
    75	   Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
    76	   получают собственные гейты: (b) — существующий
    77	   `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
    78	   `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
    79	   контур не должен выключаться случайно).
    80	2. **Два раздельных гейта вместо одного** (нужны для quiesce):
    81	   `ENABLE_ISLAND_LEGACY_SURFACE` (default false) — роуты контура (a);
    82	   `ENABLE_ISLAND_GENERATION_RUNNERS` (default false) — запуск/claim
    83	   `start_bake_runner()` / `start_theme_runner()` в `lifespan`.
    84	   Раздельность позволяет состояние «роуты закрыты, runners доживают
    85	   очередь».
    86	3. Cross-flag валидатор: явные ветки на новые комбинации.
    87	
    88	Acceptance (тесты + локально): при `LEGACY_SURFACE=false` все пути
    89	контура (a) → 404; при `GENERATION_RUNNERS=false` runners не стартуют
    90	и **status/attempts существующих queued jobs не изменяются**; при
    91	`SOCIAL=false` — модерация, report и closed delivery продолжают
    92	работать; полный тест-сьют зелёный. Rollback: env-flip
    93	соответствующего флага в true.
    94	
    95	## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)
    96	
    97	Работы: browser/E2E **старого прод-билда клиента** против локального
    98	backend с выключенными флагами П2: пройти серию до сундука; убедиться,
    99	что island-запросы получают 404 и деградация тихая — лента играет,
   100	крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
   101	обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
   102	visit-award, лайки).
   103	
   104	Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
   105	finding: чинится до П4.
   106	
   107	## П4 — прод-применение (staged, каждый под-шаг — receipt + проверка)
   108	
   109	1. **Pre-set (до деплоя кода!):** в `render.yaml` заранее добавить
   110	   `ENABLE_ISLAND_LEGACY_SURFACE=true` и
   111	   `ENABLE_ISLAND_GENERATION_RUNNERS=true` (плюс явные
   112	   `ENABLE_ISLAND_PROTECTIVE_SURFACE=true`,
   113	   `ENABLE_ISLAND_CLOSED_DELIVERY=true`). Затем задеплоить код П2 —
   114	   деплой не меняет поведение прода (default-false флаги
   115	   компенсированы pre-set'ом). Smoke: legacy-роуты отвечают, runners
   116	   работают, модерация работает.
   117	2. **Flip поверхности:** `ENABLE_ISLAND_SOCIAL=false`,
   118	   `ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
   119	   `ENABLE_ISLAND_NOTIFICATIONS=false`, явно
   120	   `ISLAND_REWARDS_ENABLED=false` (default true),
   121	   `ENABLE_ISLAND_LEGACY_SURFACE=false`. Новые theme/bake jobs
   122	   невозможны (роуты закрыты); runners ещё включены.
   123	3. **Quiesce/drain:** дождаться terminal-состояния всех queued/running
   124	   bake/theme jobs (новых нет; bounded wait по lease TTL; job,
   125	   зависший в `generating`, резолвится вручную по runbook'у до
   126	   продолжения). Проверка: ноль незавершённых jobs.
   127	4. **Flip runners:** `ENABLE_ISLAND_GENERATION_RUNNERS=false`
   128	   (рестарт; runners больше не стартуют; ничего не оборвано
   129	   посередине — очередь пуста).
   130	5. **Prod smoke:** curl-набор по route manifest'у — **каждый маршрут
   131	   отвечает ожидаемым статусом своего контура**: legacy (a) → 404;
   132	   artifact-url выдаёт signed GET на существующий артефакт; report,
   133	   user block и модерационная консоль отвечают живыми статусами; в
   134	   логах нет bot/notification/bake/theme runner'ов.
   135	
   136	Rollback: обратные env-flip'ы пошагово в обратном порядке; повторное
   137	включение ботов безопасно by design (immutable per-day планы, bounded
   138	catch-up).
   139	
   140	## П5 — snapshot manifest, схема и доки
   141	
   142	1. **Data-manifest с явным freeze-списком** (после drain П4):
   143	   snapshot row counts + max seq/id + digest mutable-state по
   144	   **freeze-списку** legacy/social/economy таблиц: `island_states`,
   145	   `island_building_social`, `island_visits`, `island_building_likes`,
   146	   `island_completion_claims`, `island_completion_outcomes`,
   147	   `island_collect_claims`, `island_visit_awards`, `island_bots`,
   148	   `island_bot_daily_plans`, `island_friend_codes`,
   149	   `island_friendships`,
   150	   `island_notification_outbox`, `island_notification_attempts`,
   151	   `island_meta_events`, `island_bake_jobs`, `island_theme_jobs`.
   152	   Через ≥24 ч: **ноль новых записей в freeze-списке**. Защитные
   153	   таблицы (`island_reports`, `island_moderation_actions`,
   154	   **`island_friend_blocks`** — пользовательский block остаётся живым
   155	   контуром) в freeze-список **не входят**: их writes разрешены и
   156	   проверяются как audit receipts — каждая новая строка соответствует
   157	   конкретному report/block/moderation-акту. Manifest — receipt
   158	   пакета.
   159	2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
   160	   v3.0.1).
   161	3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
   162	   состав), durable-строка в корневой `CLAUDE.md`, при необходимости
   163	   `AGENTS.md`.
   164	
   165	Acceptance: manifest-проверка чистая; схема опубликована;
   166	`docs-boundary-lint` чистый.
   167	
   168	---
   169	
   170	## Порядок применения
   171	
   172	П1 (клиент) → П2 (код: route manifest + разделение, PR без
   173	прод-деплоя) → П3 (pre-prod E2E старого клиента) → П4 (pre-set →
   174	деплой → staged env-flip'ы → drain → prod smoke) → П5
   175	(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
   176	до следующего шага.
   177	
   178	## Общий acceptance Этапа 0
   179	
   180	- Свежий клиент: ноль island-запросов.
   181	- Backend: контур (a) → 404; bake/theme/bot/notification runners не
   182	  стартуют; queued jobs заморожены (status/attempts без изменений).
   183	- Closed delivery (artifact-url) / public report / user block /
   184	  модерация / recall — проверены руками, работают.
   185	- Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
   186	  после.
   187	- Rollback записан; минимум один шаг проверен обратным включением вне
   188	  прода.
   189	- Data-manifest: ноль записей в freeze-списке после cutoff; защитные
   190	  writes — только с audit-receipt; данные не удалены.
   191	
   192	Только после этого acceptance начинается реализация Этапа 1.

exec
/bin/zsh -lc 'nl -ba play-for-good-stage1-mission-slice-tz.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# ТЗ Этап 1 — Mission-slice v0 (founder dogfood) — v5
     2	
     3	Статус: **DRAFT v5 после кросс-ревью R4** (author: Claude; reviewer:
     4	Codex; R1–R3 внесены ранее; R4: `mission_funding_policies` — денежная
     5	политика версионируется и пинится контрактом/receipt'ами;
     6	`mission_contribution_weights` — веса вклада версионируются,
     7	предусловие token_goal проверяется с обеих сторон).
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
    31	0a. **`mission_funding_policies`** — immutable денежная политика
    32	   (образец feed_policy_config_versions): PK `policy_version`,
    33	   `policy_digest`, `document` JSONB schema
    34	   `mission.funding-policy.v1`: полная формула gift, правило
    35	   snapshot/cursor (`eligible = ledger.seq ≤ cursor`), определение
    36	   eligible pool и допустимых источников, правило округления (вниз до
    37	   целых центов), валюта. Контракт кейса пинит точную пару
    38	   `(funding_policy_version, policy_digest)`; UNLOCKED-receipt пинит и
    39	   контракт, и политику — по какой денежной политике рассчитан
    40	   подарок, доказуемо из самого receipt, а не из глобального текста ТЗ.
    41	0b. **`mission_contribution_weights`** — immutable versioned веса
    42	   источников вклада (серия/дейлик; позже коллекции): amount-правила
    43	   по источникам, `weights_version`, digest (требование gap-карты
    44	   «веса — versioned config»). Каждый contribution пинит точную
    45	   версию весов. Регистрация новой версии весов **отклоняется**, если
    46	   её максимальный одиночный вклад превышает `token_goal` любого
    47	   текущего READY/ACTIVE кейса — предусловие проверяется совместно с
    48	   обеих сторон. Runtime-защита: вклад, не помещающийся в две
    49	   child-строки, отклоняется retryable-ошибкой до операторской
    50	   резолюции — каскад по N кейсам в v0 запрещён.
    51	0c. **`mission_case_bindings`** — immutable биндинг «кейс ↔ ровно одна
    52	   версия контракта»: PK `case_id`, `contract_version` (FK на
    53	   contracts; пара UNIQUE), `bound_at`. Создаётся при `ready` и никогда
    54	   не меняется: новая версия потребности = **новый case_id** (в
    55	   культуре «изменение биндинга = новая identity»). Все остальные
    56	   таблицы ссылаются composite-FK `(case_id, contract_version)` на
    57	   bindings, а не на contracts напрямую — расхождение версий вдоль
    58	   lifecycle-цепочки (READY на v1, UNLOCKED на v3) невозможно by
    59	   construction.
    60	1. **`mission_case_contracts`** — immutable контракт кейса:
    61	   PK `(case_id, contract_version)`, `contract_digest` (JCS sha256),
    62	   `document` JSONB schema `mission.case-contract.v1`: получатель;
    63	   потребность `scalable|fixed`; guaranteed deliverable;
    64	   **числовые границы `guaranteed_cents`, `confirmed_need_cents`,
    65	   `stretch_cap_cents`** (без них `min(...)` невычислим); `currency`
    66	   (v0 CHECK `='EUR'`); stretch deliverables; правило rollover;
    67	   `token_goal`; `unlock_share` (v0 — пропорция); `unlock_cutoff_at`;
    68	   `latest_fulfillment_at`; `queue_position`; ожидаемый вид
    69	   подтверждения; **пин `(funding_policy_version, policy_digest)`** —
    70	   денежная политика входит в contract_digest. `registered_by/at`.
    71	2. **`mission_runtime`** — **singleton-строка** (PK-константа,
    72	   CHECK id=1): пара `active_case_id + active_contract_version`
    73	   (nullable вместе), `updated_seq`.
    74	   **Единая точка сериализации: каждый lifecycle- и
    75	   contribution-writer начинает транзакцию с
    76	   `SELECT … FROM mission_runtime FOR UPDATE`** — двух ACTIVE-кейсов
    77	   не существует by construction, авторитет «какой кейс ACTIVE» —
    78	   эта строка (проекция, воспроизводимая из событий).
    79	3. **`mission_case_events`** — lifecycle: `seq` (nextval
    80	   `mission_case_events_seq` под runtime-lock), пин контракта
    81	   (composite FK), `kind ∈ ready|active|unlocked|fulfilled`,
    82	   `payload`, `receipt_digest`; UNIQUE `(case_id, kind)`. Derived
    83	   state кейса = последний kind по `seq DESC`.
    84	4. **`mission_pool_ledger`** — rolling pool: **монотонный `seq`
    85	   (BIGSERIAL)**; строки immutable и вставляются только уже settled
    86	   (`settled_at` фиксируется при insert, задним числом строки не
    87	   settled-ятся); `source ∈
    88	   seed|revenue_share|partner|subscription_share` (v0 — только seed),
    89	   `amount_cents`, `currency` (CHECK `='EUR'`), `meta`,
    90	   `idempotency_key` UNIQUE. **Правило cursor'а:** `pool_cursor`
    91	   allocation'а = max `ledger.seq` на момент снапшота; `settled
    92	   unallocated eligible pool на cursor` = `sum(ledger.amount при seq ≤
    93	   cursor) − sum(предыдущих allocations)`. Поздние строки получают
    94	   больший `seq` и в прошлый снапшот не входят — immutable
    95	   UNLOCKED-сумма воспроизводима by construction.
    96	5. **`mission_pool_allocations`** — деньги→кейс: `kind ∈
    97	   reserve_guaranteed|gift_additional`, `(case_id,
    98	   contract_version)`, `amount_cents`, `currency` (CHECK `='EUR'`),
    99	   `pool_cursor`, FK на породивший lifecycle event, `receipt`.
   100	   **Финансовая идемпотентность и границы:** UNIQUE idempotency
   101	   identity (`res:{case_id}:{contract_version}` /
   102	   `gift:{case_id}:{contract_version}`); округление
   103	   `unlock_share × cents` — вниз до целых центов; CHECK-и:
   104	   `unlock_share ∈ [0,1]` (в receipt), `guaranteed_cents ≤
   105	   confirmed_need_cents + stretch_cap_cents` (на контракте),
   106	   положительные `amount_cents` в ledger и allocations. Инвариант (в
   107	   транзакции под runtime-lock): `sum(allocations) ≤ sum(settled
   108	   ledger)`. UNLOCKED-снапшот: `gift = min(guaranteed_cents +
   109	   unlock_share(progress) × settled unallocated pool на cursor,
   110	   confirmed_need_cents + stretch_cap_cents)`.
   111	6. **`mission_contributions`** (+ child
   112	   **`mission_contribution_allocations`**) — вклад: `user_id`,
   113	   `source ∈ series|daily`, `amount`, `source_ref`,
   114	   `idempotency_key` UNIQUE: серия — `mc:{run_id}`; дейлик —
   115	   **`mcd:{user_id}:{day}:{quest_id}`, где `day` — player-local
   116	   `DailyQuest.day` (пин точной строки квеста; НЕ utc_date)**;
   117	   **пин `weights_version`** (по какой версии весов посчитан amount);
   118	   `seq` под runtime-lock; receipt в той же транзакции, replay
   119	   byte-identical. Child-allocations (каждая пинит `(case_id,
   120	   contract_version)`): обычно одна строка; при пересечении
   121	   `token_goal` — детерминированно две. **Инвариант
   122	   `sum(child)=amount` — service-level в той же транзакции +
   123	   reconciliation-тест** (обычный SQL CHECK не читает другие строки;
   124	   constraint trigger — опциональное усиление позже).
   125	7. **`mission_fulfillments`** (+ child
   126	   **`mission_fulfillment_allocations`**) — typed transfer receipt
   127	   `mission.fulfillment-receipt.v1`: `(case_id, contract_version)`,
   128	   `amount_cents`, `currency` (CHECK `='EUR'`), `recipient`,
   129	   `transfer_reference`/`transfer_date`, `evidence_digest`, immutable
   130	   content-addressed `artifact_url`. Child-строки связывают receipt с
   131	   **каждой** покрываемой allocation-строкой (обычный перевод
   132	   покрывает две: `reserve_guaranteed` + `gift_additional`). Сервис
   133	   принимает fulfill только при полном покрытии зафиксированного gift
   134	   (`sum(child) = amount_cents = зарезервировано+открыто кейса`);
   135	   `FULFILLED` event пишется атомарно в той же транзакции. Публичное
   136	   «реально передано» проецируется **только** из fulfillment-receipts.
   137	
   138	**Exact contract identity проходит через всю схему:** runtime,
   139	case-events, pool-allocations, contribution-allocations и
   140	fulfillments пинят точную пару `(case_id, contract_version)`
   141	composite-FK **на `mission_case_bindings`** — версия у кейса ровно
   142	одна на весь lifecycle, из каждой строки доказуемо, по какой версии
   143	посчитаны goal и деньги, а расхождение версий между событиями
   144	исключено схемой, не только тестом.
   145	
   146	### State machine и очередь
   147	
   148	`register-contract` → **`ready`** (отдельная CLI-команда: резервирует
   149	гарантию из pool — allocation `reserve_guaranteed` — и пишет
   150	ready-event; кейс встаёт в очередь по `queue_position`) → `activate`
   151	(допустим только при `active_case_id IS NULL`; берёт head очереди
   152	READY) → UNLOCKED (в транзакции пересекающего вклада или CLI
   153	`unlock-cutoff`) **в той же транзакции активирует следующий READY из
   154	очереди**. Правила:
   155	
   156	- Включение `ENABLE_MISSION_CORE` требует **DB-preflight** —
   157	  CLI-команда и startup-проверка, не config-validator (у него нет
   158	  доступа к БД): существует ACTIVE и ≥1 READY-successor.
   159	- Аварийный путь пустой очереди (VISION-совместимый): транзакция
   160	  пересекающего вклада **не коммитится** и возвращает retryable
   161	  **503** — клиентский outbox сохраняет результат и повторит после
   162	  появления READY-кейса. Не 409: существующий result-outbox считает
   163	  409 terminal и удалит запись. `unlock-cutoff` при отсутствующем
   164	  successor отказывает до создания READY-кейса. Операционный
   165	  инвариант — держать очередь непустой; 503-ветка — предохранитель,
   166	  не рабочий режим.
   167	- Предусловие v0 (проверяется с ОБЕИХ сторон): при
   168	  `register-contract` — `token_goal` кейса ≥ максимального одиночного
   169	  вклада **активной версии `mission_contribution_weights`**; при
   170	  регистрации новой версии весов — её максимум не превышает
   171	  `token_goal` ни одного READY/ACTIVE кейса (иначе отказ). Пересечение
   172	  затрагивает максимум два кейса, двух child-строк достаточно;
   173	  runtime-нарушение → retryable-отказ. Каскад по N кейсам — только с
   174	  крупными collection-наградами (Этап 2).
   175	
   176	### Dogfood-изоляция (writers И readers)
   177	
   178	Единый server-owned allowlist `MISSION_DOGFOOD_USER_IDS` применяется:
   179	(а) во врезках `/api/results` и daily-claim — **вклад создаётся только
   180	enrolled-пользователям**, для остальных поведение байт-в-байт прежнее;
   181	(б) в read API; (в) в `/session` отдаётся capability
   182	`mission_dogfood` (образец operator-debug-entry capability) — клиент
   183	монтирует миссию только при `VITE_MISSION_ENABLED && capability`.
   184	
   185	### Врезки и доставка receipt до клиента
   186	
   187	- `POST /api/results` (терминальная серия) и daily-claim: в той же
   188	  транзакции, что RewardLedger, — mission contribution; в ответ
   189	  добавляется **optional блок `mission_contribution`** (receipt: id,
   190	  amount, allocations по кейсам, состояние бара после). Ответ
   191	  фиксируется как обычно; **`_verified_replay_response` восстанавливает
   192	  тот же блок** (replay возвращает committed-байты; у receipts,
   193	  созданных до включения флага, блока нет — это корректно).
   194	- Клиент: `ResultResp → outbox ResultReceipt` расширяется переносом
   195	  `mission_contribution`; церемония вклада в series-win флоу читает
   196	  **только** этот receipt (никакого optimistic). Аналогично для
   197	  daily-ответа.
   198	
   199	### Операторский CLI `python -m app.mission_ops`
   200	
   201	Команды: `register-contract` / `seed-pool` / **`ready`** / `activate` /
   202	`unlock-cutoff` / `fulfill` (typed fulfillment-receipt + evidence
   203	digest + artifact URL). Все dry-run по умолчанию, `--apply` с
   204	обязательными exact-identity аргументами; каждый apply = case-event +
   205	receipt. Отдельный флаг `ENABLE_MISSION_OPS`, HTTP-маршрутов нет;
   206	impact-полномочия не смешиваются с контентными скоупами.
   207	
   208	### Read API
   209	
   210	`ENABLE_MISSION_READ` + capability: `GET /api/mission/case` — текущий
   211	ACTIVE (токен-бар, четыре числа: вклад сообщества / гарантировано /
   212	зарезервировано и открыто / реально передано-из-fulfillments, контракт
   213	в один тап), мой вклад, последний FULFILLED (**с immutable event id для
   214	клиентского watermark**). Ответ — проекция только из receipts.
   215	
   216	### Тесты (PG, обязательные)
   217	
   218	Полный E2E цикл; идемпотентность (`mc:{run_id}`, `mcd:` реплей →
   219	byte-identical); конкуренция под runtime-lock (два вклада добивают
   220	goal — ровно один UNLOCKED, остаток второго — новому ACTIVE);
   221	двух ACTIVE не существует (негативный тест `activate` при занятом
   222	runtime); split-инвариант + reconciliation; pool-инвариант; snapshot
   223	не меняется от поздних settled-строк; fulfillment coverage (transfer =
   224	сумма указанных allocations; чужие allocations → отказ);
   225	**не-enrolled пользователь: `/results`/daily байт-в-байт прежние
   226	(golden), вкладов нет, capability нет**; пустая очередь → 503
   227	retryable, outbox сохраняет и повторяет после появления READY, вклад
   228	не потерян и не задублирован; fulfillment покрывает обе allocation
   229	child-строками, частичное покрытие → отказ без FULFILLED-события;
   230	пин `(case_id, contract_version)` присутствует во всех receipts;
   231	негативный тест расхождения версий (событие/allocation с версией, не
   232	совпадающей с binding → FK-отказ); снапшот воспроизводим из
   233	`ledger.seq ≤ cursor` при любых поздних строках; округление вниз и
   234	границы CHECK-ов; up/down миграции.
   235	
   236	## Клиент (feed-prototype, `VITE_MISSION_ENABLED` + capability)
   237	
   238	- HUD-ретеминг: бейдж пазлов → «лапки»; значение = мой вклад в текущий
   239	  кейс (server-derived). Старый puzzle-баланс уходит с поверхности
   240	  (данные не трогаются). Optimistic ко вкладу не применяется.
   241	- Виджет кейса + экран кейса (четыре числа, контракт, история).
   242	- Церемония вклада в series-win флоу — из `mission_contribution`
   243	  receipt результата (до challenge-пилюли); дейлик-клейм показывает
   244	  лапки из receipt daily-ответа.
   245	- Церемонии UNLOCKED и FULFILLED — по read API; **client watermark по
   246	  immutable event id** (образец island-celebrated-stages): каждая
   247	  церемония показывается один раз, не при каждом входе.
   248	- Прод-сборка не меняется: без capability миссия не монтируется даже
   249	  при включённом VITE-флаге.
   250	
   251	## Операционка (вне кода, owner — оператор)
   252	
   253	Договорённость с локальным приютом; кейс №1 — масштабируемая
   254	потребность (корм), guaranteed ≈ €100 посева; права на фото/видео;
   255	формат мини-отчёта; latest fulfillment date; **кейс №2 доведён до
   256	READY до включения core** (требование preflight).
   257	
   258	## Acceptance Этапа 1 (dogfood)
   259	
   260	Полный реальный цикл: контракт → посев → READY (резервирование) →
   261	ACTIVE → enrolled-оператор играет серии/дейлики, вклады с receipts →
   262	UNLOCKED (snapshot-receipt; кейс №2 ACTIVE) → реальная закупка корма и
   263	передача → FULFILLED с typed transfer receipt и evidence → обе
   264	церемонии показаны один раз (watermark). Все receipts воспроизводимы;
   265	для не-enrolled пользователей не изменилось ничего (проверено golden).
   266	
   267	## Rollback
   268	
   269	Флаги off → поведение платформы прежнее; `mission_*` таблицы остаются
   270	(append-only, ни на что не влияют); миграция down — только вне прода.

codex
Внесённые R4-пункты формально присутствуют, но я проверяю их как исполнимые инварианты, а не только как упоминания. Уже отдельно перепроверяю связанные зоны, где новые формулировки могут оставлять гонки, неполную identity/receipt-связь или противоречить freeze-acceptance.
exec
/bin/zsh -lc "nl -ba VISION.md | sed -n '1,220p'" in /Users/gleb/My projects/p4g-platform-workspace
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
   161	1. **Миссия — смысл, игра — любимый ритуал.** Play for Good не прикручивает
   162	   благотворительность сбоку: реальные закрытые кейсы являются продуктовой
   163	   петлёй наряду с поиском любимой механики и возвращением за новой серией.
   164	2. **Сострадание без давления.** Гарантированный минимум не зависит от
   165	   активности. Игра открывает дополнительное добро, а не спасает животное от
   166	   бездействия платформы. Никаких guilt-trip, tragedy porn и тревожных
   167	   сообщений «без тебя не успеем».
   168	3. **Спрос выводится из поведения, а не запрашивается.** Никаких кнопок
   169	   «ещё такого» — сигналом служит сама игра: досмотры, перехваты, серии,
   170	   сундуки, коллекции, вклады и возвраты к текущему кейсу.
   171	4. **Продакшн детерминирован; модели — фоновое R&D.** В пользовательском
   172	   запросе не существует синхронного model-response: всё модельное — это
   173	   отдельный generation job → валидация trusted-компилятором → typed pack →
   174	   уведомление о готовности. LLM никогда не участвуют в gameplay, control,
   175	   выдаче ленты или расчёте миссионного вклада.
   176	5. **Контент попадает к аудитории только после явного решения
   177	   соответствующего человека, привязанного к точной identity.**
   178	
   179	   | Контент | Кто решает | Что именно утверждает | Аудитория |
   180	   |---|---|---|---|
   181	   | First-party серия/скин | оператор-публикатор | exact promotion-binding | вся лента |
   182	   | UGC-рескин | автор-игрок — initial publish exact artifact; оператор — moderation/takedown exact artifact revision | Build + machine playability gate; до первого гостевого показа действуют report/takedown и операторская очередь пост-модерации | все пользователи при live post-moderation контуре (решение оператора 25.07.2026) |
   183	   | Закупочный плеебл | UA-оператор | exact creative + бюджет кампании | внешняя аудитория |
   184	   | Impact-кейс | impact-оператор; партнёр подтверждает потребность и результат, но не получает platform authority | exact case contract, funding, publication и closure evidence | миссионная поверхность |
   185	   | Recall | оператор recall-полномочия | exact entry/runtime/case scope | — |
   186	
   187	   Зелёная метрика — evidence, не authority. Автор-игрок не получает
   188	   публикации в общую ленту; first-party и impact-гейты не ослабляются
   189	   ничем.
   190	6. **Вкус — узкое место, и это нормально.** Инструменты (ревью-очереди,
   191	   visual-proof, мгновенные play-ссылки) существуют, чтобы дешевле кормить
   192	   человеческий вкус, а не чтобы заменить его.
   193	7. **Бесконечность контента = серии + вариации + фабрика + регулярный
   194	   ручной ввод топовых механик с рынка.** Фабрика масштабирует, но не
   195	   заменяет кураторский ввод. Единица потребления — серия, а не одиночный
   196	   уровень (продуктово `1..N` уровней + сундук; пилотный delivery-контракт
   197	   `1..6`; текущий шаблон кампаний обычно 5).
   198	8. **Один factory kernel — много исполнителей.** Общие для всего
   199	   генеративного: identity, формат brief, бюджеты/квоты, provenance,
   200	   интерфейс trusted-компилятора, QA-квитанции и человеческий шлюз.
   201	   Lane-исполнители разные — новый контур подключается к ядру, а не
   202	   изобретает свои правила.
   203	9. **Агенты экономят внимание, не забирают authority.** Команда агентов
   204	   (роли — `AGENT-ROLES.md`) обслуживает аналитику, продакшен, ресерч,
   205	   инфраструктуру и read-only финансовый контроль; каждый
   206	   публикационный, финансовый, impact- и продуктовый акт остаётся за
   207	   человеком.
   208	10. **Trust-loop — часть продукта.** Кейс не заканчивается переводом:
   209	    проверка партнёра → публичный контракт → append-only вклады →
   210	    финансирование → подтверждение выполнения → продолжение истории. Без
   211	    последнего шага петля не закрыта.
   212	11. **Публичная миссия human-true.** Боты могут тестировать только явно
   213	    непубличные тестовые кейсы. Они не влияют на публичные progress bar,
   214	    истории активности, деньги, отчётность или продуктовые метрики.
   215	12. **Добро не оправдывает рекламную нагрузку.** Ad load подчинён
   216	    удержанию и качеству опыта. Нельзя повышать его под лозунгом «больше
   217	    рекламы — больше помощи».
   218	
   219	## Куда хотим прийти (целевая картина)
   220	

exec
/bin/zsh -lc "nl -ba VISION.md | sed -n '221,440p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   221	- **Ежедневный Play for Good-ритуал.** Игрок приходит за любимыми пазлами,
   222	  видит один понятный кейс, регулярно вносит заработанный вклад и возвращается
   223	  увидеть его реальное завершение.
   224	- **Сезоны добра.** Сезон = кейс: у каждого сезона имя и история его
   225	  животного, свои коллекции и кипсейк. Сезоны идут встык — UNLOCKED
   226	  предыдущего открывает следующий. Это нарративная дуга, а не deadline
   227	  для помощи. Позднее возможны географические сезоны (локально
   228	  актуальный кейс для игрока) — не раньше масштабирования
   229	  операционного контура помощи.
   230	- **Приют как общая мета.** Нынешняя идея острова переосмысляется в
   231	  приют-карту: текущий кейс, общий монумент закрытых кейсов и личная витрина
   232	  коллекций/достижений. Это виртуальная карта памяти, а не заявление о
   233	  строительстве реального объекта без соответствующего evidence. Закрытые
   234	  результаты не исчезают с окончанием сезона.
   235	- **Ступень 1 — фабрики от эталона.** Оператор отдаёт эталонную механику.
   236	  Фабрика левел-дизайна и фабрика сеттинга/стиля собирают серии этой
   237	  механики в разных сеттингах. Ночь генерит → утренний пакет → человеческий
   238	  шлюз → каталог → лента. Exit-критерий: серия, собранная фабрикой без
   239	  ручной сборки уровней, регулярно проходит шлюз и живёт в ленте.
   240	- **Ступень 2 — платформа сама находит вариации механик.** Experiment-lane
   241	  предлагает новые вариации; дальше — те же фабрики и тот же шлюз.
   242	  Exit-критерий: вариация, предложенная платформой, прошла шлюз и показала
   243	  qualified plays у реальных игроков.
   244	- **Рост через собственный продакшен.** Каждая механика рождается
   245	  playable-совместимой; platform identity связывает закупочный playable,
   246	  deep-link, первый слот и миссионную кампанию без подмены фактов. Платформа
   247	  встречает игрока той же механикой, из которой он пришёл.
   248	- **Learning loop.** Append-only факты → evidence-отчёты → матрица спроса,
   249	  отвалов и миссионного эффекта → briefs фабрикам и решения impact-оператора.
   250	- **Самодостаточная система.** Платформа предлагает следующие цели из
   251	  VISION, состояния, scoreboard и контекста; оператор утверждает подмножество;
   252	  дорогая модель оркестрирует, дешёвые модели исполняют; author ≠ reviewer;
   253	  evidence возвращается в scoreboard. Агентные роли проходят явную лестницу
   254	  автономии: attended → deterministic cron → supervised LLM → выделенный
   255	  Phase-B host; каждая ступень открывается acceptance-гейтом, а не дрейфом.
   256	- **Экономика.** Закупка окупается удержанием; выручка — реклама, подписка и
   257	  будущие партнёрские impact-бюджеты. Часть экономики финансирует
   258	  гарантированный и дополнительный impact-контур.
   259	
   260	UGC, генерация механик игроками и механики-как-здания больше не являются
   261	центром пользовательской меты. Построенные контуры сохраняют свои safety- и
   262	authority-инварианты, но их дальнейшее расширение должно отдельно доказать,
   263	что оно помогает Play for Good, а не конкурирует с ним за внимание.
   264	
   265	## Сезоны, коллекции и личная память
   266	
   267	- Сезон и кейс — одно целое: один активный сезон-кейс, следующий
   268	  стартует сразу после UNLOCKED предыдущего.
   269	- Коллекции остаются самостоятельной игровой мотивацией и сильным источником
   270	  токенов участия. Их core-loop сохраняется, но reward-семантика
   271	  переякоривается на миссию.
   272	- Завершённая сезонная коллекция даёт заметный вклад и evidence-bearing
   273	  keepsake: память не только о виртуальной редкости, но и о реальных итогах
   274	  сезона.
   275	- Личная витрина показывает собранные коллекции, keepsakes, историю участия и
   276	  уровень. Общая карта показывает совокупный масштаб сделанного.
   277	- Уровень — мера игровой причастности, а не добродетели человека. Не
   278	  строим рейтинги «кто добрее» и не превращаем объём вклада в моральный
   279	  статус. Личный уровень и keepsake считаются от базовой игровой
   280	  активности; подписочный VIP-бонус двигает общий бар кейса и виден
   281	  отдельной строкой, но личный показатель причастности не покупает.
   282	- Завершение сезона мягкое: игрок сохраняет то, что успел сделать, без
   283	  наказания и стыда. Прошлая коллекция уходит в архив и остаётся
   284	  completable (обычные дропы, универсальные фрагменты, помощь друзей);
   285	  позднее завершение обновляет keepsake прошлого сезона. Никакого «не
   286	  успела — потеряла навсегда». Реальная помощь не обрывается из-за
   287	  календаря: FULFILLED-подтверждения пополняют монумент и кипсейки
   288	  задним числом.
   289	
   290	## Проверяемые продуктовые гипотезы
   291	
   292	Первые гипотезы проверяются на friend cohort:
   293	
   294	1. **Autoplay → быстрый первый восторг:** автоплей с незаметным перехватом
   295	   сокращает время до первого qualified play против «нажми чтобы играть».
   296	2. **Серия → возврат:** игрок, прошедший серию, возвращается сам, чтобы
   297	   найти и пройти ещё одну.
   298	3. **Миссия понятна без объяснения:** игрок различает игровой токен, вклад
   299	   платформы и реальную помощь; не считает, что пожертвовал собственные
   300	   деньги или что токен имеет заявленный денежный курс.
   301	4. **Миссия ощущается, а не декларируется:** ранний вклад, видимый прогресс и
   302	   подтверждённое закрытие создают причастность без чувства давления.
   303	
   304	Каузальный эффект миссии на retention и share доказывается не retention
   305	самих вкладчиков: они уже являются self-selected вовлечённой группой.
   306	Доказательство — versioned holdout «миссионный слой против базового
   307	продукта» на достаточной когорте. Friend cohort даёт качественный и
   308	directional-сигнал, но не причинный вывод. Holdout изолирует exposure к
   309	миссионному UX, а не уменьшает уже обещанный животному гарантированный
   310	минимум или меняет публичный funding-контракт. Holdout — delayed:
   311	контрольная группа получает миссионный слой после окна сравнения, никто
   312	не остаётся в продукте без миссии постоянно. Пользователи, пришедшие по
   313	campaign-ссылке конкретного кейса, в holdout не попадают — им уже
   314	обещан миссионный опыт. Causal-вывод требует рассчитанного sample-size
   315	gate от baseline retention и минимального эффекта (возможно, сотни
   316	пользователей и больше).
   317	
   318	Очередь гипотез после: миссионный слой → incremental active days/retention;
   319	закрытие кейса → organic share; сезонные коллекции → возвраты; разнообразие
   320	→ active days; mechanic-match закупка > generic landing; human-good/min
   321	растёт без ухудшения player outcome.
   322	
   323	## North Star tree
   324	
   325	- **Outcome:** incremental удержание qualified-игроков, создаваемое Play for
   326	  Good, относительно holdout. На пилоте до достаточной когорты остаются
   327	  active days и «вернулся за новой серией/текущим кейсом без пинга».
   328	- **Leading gameplay:** time-to-first-qualified-play; сколько механик
   329	  посмотрел до любимой; series completion; возврат за следующей серией.
   330	- **Leading mission:** time-to-first-contribution; доля игроков, увидевших
   331	  реальный progress move; возврат к тому же кейсу; просмотр closure evidence;
   332	  завершение коллекций; campaign-first share.
   333	- **Supply:** свежий eligible runway на любимый сегмент.
   334	- **Impact operations:** case cycle time; доля закрытий с полным evidence;
   335	  payout/reconciliation completeness; partner/closure SLA.
   336	- **Guardrails:** loader/runtime failure rate; content starvation; review
   337	  backlog; cost per human-good; mission comprehension; trust complaints;
   338	  guilt/distress feedback; fraud/bot leakage; ad load.
   339	- **Anti-metrics:** сумма помощи, число выпущенных токенов, ad views,
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
   406	  рекламную частоту.
   407	- **Подписка отменяет рекламу и участвует в миссии двумя контурами.**
   408	  (1) Безусловная раскрытая доля цены каждой ступени подписки поступает
   409	  в impact pool — это единственное благотворительное обещание подписки;
   410	  ad-free игрок не становится менее ценным участником миссии. (2)
   411	  VIP-бонус — чисто игровой перк, возможно в нескольких ступенях:
   412	  каждая ступень добавляет к каждой завершённой qualified-серии
   413	  фиксированную или процентную прибавку токенов (например VIP +10,
   414	  Super VIP +20; или +10% / +25%; «+10 лапок за серию · +10 VIP»).
   415	  Бонус прикрепляется только к завершённым сериям — не к отдельным
   416	  уровням, и без игры подписка токенов не даёт; неиспользованный
   417	  потенциал не несёт семантики «потерянная помощь», потому что деньги
   418	  от игры не зависят никогда. Размеры бонусов, ступени и возможные
   419	  капы — versioned config; включение — отдельная monetization-гипотеза
   420	  после legal review. VIP-бонус двигает общий бар кейса; личный уровень
   421	  и keepsake считаются от базовой игровой активности — без покупки
   422	  морального статуса и без рейтингов платящих.
   423	- **Токены участия («лапки»)** зарабатываются сериями, дейликами и
   424	  коллекциями и автоматически поступают во вклад текущего кейса
   425	  отдельными server-owned contribution receipts; исторический
   426	  puzzle-баланс вкладом не становится. Токены больше не являются
   427	  центральной валютой генерации/кастомизации механик и локаций.
   428	- Токены участия нельзя купить напрямую за деньги/Stars: миссионный
   429	  вклад подтверждает игру и коллекционный прогресс, а не покупку
   430	  добродетели. Подписочный VIP-бонус не является продажей токенов — он
   431	  прикрепляется исключительно к завершённым qualified-сериям и без
   432	  игры ничего не начисляет.
   433	- **Личная прогрессия** питается коллекциями, уровнем участия, keepsakes и
   434	  историей закрытых кейсов, а не обязательной decoration-экономикой.
   435	- Прямые денежные пожертвования игроков не входят в v1 и потребуют отдельного
   436	  продуктового, платёжного и юридического решения.
   437	- Монетизационные тесты включаются не раньше числовых когорт и только явным
   438	  решением оператора. Джокеры, near-miss и вероятность редкости,
   439	  подстраиваемая под платёж, отложены: они конфликтуют с guardrail «без вреда
   440	  игроку» и граничат с loot-box регулированием.

exec
/bin/zsh -lc "nl -ba VISION.md | sed -n '441,616p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   441	- Attribution закупки и продажи переходов остаётся симметричным
   442	  identity-JOIN-контрактом; production-затраты моделей — квотируемый
   443	  R&D-бюджет.
   444	
   445	## Виральность
   446	
   447	- **Главная виральная единица — campaign-first playable link.** Получатель
   448	  видит текущий кейс и сразу попадает в autoplay → перехват. Позитивная
   449	  рамка: «поиграй с нами — это помогает», а не «от тебя зависит жизнь».
   450	- **Играбельный challenge сохраняется.** Exact identity уровня делает
   451	  соревнование честным; challenge и campaign используют один attribution
   452	  kernel. Ghost-повтор отправителя остаётся отложенной гипотезой.
   453	- **Закрытие кейса — естественный share-момент.** Делимся подтверждённым
   454	  результатом и общей радостью, не тревожным незакрытым сбором.
   455	- **Приют и коллекции — социальная память.** Игрок может показать личную
   456	  витрину и общий масштаб закрытых кейсов.
   457	- **Друзья помогают коллекциям (positive-sum).** Друзья могут ускорять
   458	  закрытие коллекций и усиливать общий вклад; любая коллекция
   459	  закрываема соло — друзья ускоряют, но не являются gate. Направление
   460	  v1 — «Попросить помочь»: ссылка на конкретную карточку, помощь
   461	  засчитывается только за завершённую qualified-серию друга, с капами
   462	  и идемпотентностью. Обязательные social-only коллекции — отдельная
   463	  гипотеза после наблюдения реального sharing.
   464	- **Рефералка — TG-native и evidence-bound.** Награда возможна только за
   465	  qualified-активность приведённого, не за клик/рассылку.
   466	- **Guardrails.** Шаринг только по явному действию; никаких наград за
   467	  массовую рассылку и сообщений, эксплуатирующих страх, вину или срочность.
   468	- **Метрики.** K-factor, acceptance, qualified activity и share закрытых
   469	  кейсов считаются отдельно; friend cohort даёт directional-сигнал, причинный
   470	  эффект требует достаточной когорты/holdout. Закупка, рефералка, challenge и
   471	  campaign-first share используют один identity-JOIN kernel.
   472	
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
   536	   контента/impact, D7/active days и versioned holdout миссионного слоя.
   537	   Holdout здесь запускается технически и даёт directional-сигнал;
   538	   causal-доказательство — только при рассчитанном sample-size gate.
   539	4. **Первая mechanic/campaign-matched acquisition cohort.** Identity-JOIN
   540	   встреча, сравнение с generic landing, проверка campaign-first share и
   541	   paid acquisition без guilt framing.
   542	5. **Только затем** расширенная shelter-мета, C2-driven production и Phase B
   543	   autonomy.
   544	
   545	**Мораторий:** до прохождения шага 2 не открываем новые платформенные
   546	контуры. Минимальный mission-slice является новым ядром продукта и заменяет,
   547	а не дополняет прежнее расширение Island/UGC; до causal evidence не строим
   548	полный виртуальный приют и decoration-систему. Любое другое исключение —
   549	только через явный апрув оператора.
   550	
   551	## Что мы сознательно НЕ делаем
   552	
   553	- Не называем токены деньгами, пожертвованиями игрока или валютой с
   554	  подразумеваемым курсом.
   555	- Не продаём миссионные токены и не превращаем денежную покупку в публичный
   556	  показатель доброты.
   557	- Не запускаем несколько параллельных публичных кейсов в v1.
   558	- Не используем guilt-trip, tragedy porn, жёсткий mission-FOMO и
   559	  тревожные сообщения «без тебя не успеем».
   560	- Не строим публичный рейтинг доброты и не приравниваем уровень к моральной
   561	  ценности человека.
   562	- Не повышаем ad load ради impact-метрики.
   563	- Не закрываем кейс игровым progress bar без реального closure evidence и не
   564	  преувеличиваем сделанное.
   565	- Не делаем денежную часть подарка случайной или зависящей от скрытой
   566	  вероятности (charity-lootbox) и не уменьшаем задним числом уже
   567	  открытый подарок.
   568	- Не изображаем виртуальный приют как реально построенный объект, если это не
   569	  подтверждено case evidence.
   570	- Не показываем ботов на публичных миссионных поверхностях.
   571	- Не строим классическую decoration-мету как обязательный sink для токенов.
   572	- Не возвращаем генерацию механик/локаций игроком в центр без отдельного
   573	  доказательства пользы для Play for Good.
   574	- Не строим UI запроса предпочтений контента в ленте; UGC-промпты и
   575	  операторские заказы фабрике остаются отдельными разрешёнными контурами.
   576	- Не пускаем модели в production-runtime и автопубликацию.
   577	- Не делаем внутренние циклы уровней в фид-механиках: лента ведёт, механика
   578	  играет один раунд.
   579	- Не смешиваем evaluation, publication, impact и financial authority.
   580	- Не promote'им QA-артефакты в production по конвенции имени: разные
   581	  полномочия используют разные креды и явные гейты.
   582	- Не оптимизируем метрики, которые нельзя воспроизвести из append-only
   583	  фактов.
   584	- Не даём агентам publication, financial, impact или scheduling authority
   585	  сверх явно выданной server-owned policy.
   586	
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

exec
/bin/zsh -lc "nl -ba play-for-good-gap-map-v1.md | sed -n '1,180p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
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

exec
/bin/zsh -lc "nl -ba play-for-good-gap-map-v1.md | sed -n '181,309p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
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
/bin/zsh -lc "grep -nEi 'mission|island|receipt|VISION|Play for Good|contract|fund|contribution|freeze' CLAUDE.md" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
41:  active flow with exact draft/revision/binding identity, and a catalog refusal
47:  reuses an already-active known-good runtime (artifact+contract+capabilities)
49:  directly; any new runtime/contract/capability boundary — or an explicit
51:  candidate→canary→published ladder. Every admission writes one append-only
52:  `catalog_admission_receipt` bound to the exact publish receipt and its
78:  coverage contract (run status with CI, not here); regardless, no production
84:  append-only, persists bounded canary/player admission and binds each allocated
106:  exact current built-in, and quota is the prior `W-1` receipts plus current.
113:  admission or ticket. Migration `0021` now adds the operational shadow loop:
115:  leases/failure receipts, live status, and a DB-clocked immutable UTC report.
120:  elect one committed receipt and replay its exact bytes. The internal CLI is
132:  and plan-bound authorization; it never promotes a shadow receipt. The main
146:  permission to enable the route: production runtime/bootstrap, real-backend browser E2E,
169:- Island Social Core is a separate `island_*` namespace, outside the
171:  Island audience were explicitly approved and enabled 25.07.2026 under VISION
180:- The island measurement unit is a **client-asserted completion claim**
195:- All balance-changing island events take `seq` from one DB sequence under a
197:  (`island_completion_claims`, `island_collect_claims`,
198:  `island_completion_outcomes`, `island_visit_awards`,
199:  `island_moderation_actions`, `island_meta_events`) are the source of truth;
201:  its immutable terminal outcome receipt in the same transaction as its first
202:  insert — without the receipt the claim does not exist. Replay reads only the
203:  receipt and never re-evaluates time, caps, flags or config: the same request
205:  Re-enabling `island_rewards_enabled` is never retroactively payable; back-pay
213:  caller). A level-receipt, another user or a `legacy_no_ticket` record is a
218:  `{mechanicId, rosterRevision, versionsDigest}`: `mechanicId` is the client's
234:- Island UGC moderation is **staged post-moderation** (VISION v2.5, operator-
237:  the merged VISION patch; before any guest sees UGC, report/block,
238:  exact-artifact-revision takedown, an operator publication/report queue with
240:  Every moderation action writes an append-only receipt bound to the exact
241:  `artifact_rel`; a mismatched revision is 409. The single-operator auth is an
244:  contract is gated on "moderators > 1". Audience was expanded to ALL users
245:  by explicit operator decision 25.07.2026 (global Island enablement,
247:  envelope; VISION patch recording this is tracked separately). Moderation
250:- Island migrations `0050_a11` (cohort-watch base), `0051`–`0052` (island
251:  core), `0053` (async `/island/theme` jobs), `0054` (moderation-action
252:  seq) and `0055_island_p2` (visit-award response/config-digest +
253:  notification outbox/attempt-receipts) are merged to master (unified
254:  island, backend `c21d40f`→`36a7d2a`, client `d560076`→`dd9efbd`); P2
261:  reviewer) AND independent Codex review (GO). Island is **globally enabled
263:  `a3dcdf7`/PR #11: `ENABLE_ISLAND_SOCIAL`/`ENABLE_ISLAND_BOTS` on,
269:  requires a lock first). P4 reached its final async-only production contract
272:  branch or opt-in header. VISION Part B is applied in v2.7.
290:  decision requires is a coverage contract (run status with CI, not here);

exec
/bin/zsh -lc "nl -ba CLAUDE.md | sed -n '155,280p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   155	  new tickets but preserves exact replay of a committed ticket/lost response;
   156	  client-chosen `run_id` is serialized across tickets. The real HTTP→PostgreSQL
   157	  E2E covers `allocate → ticket → level → chest`, backend-only (run status
   158	  with CI, not here).
   159	  Migration `0024` adds default-off append-only recall actions: one scoped
   160	  endpoint handles first soft/hard recall and epoch-CAS `soft→hard`; hard action,
   161	  unfinished-ticket revocation and exact `invalidated` facts commit atomically
   162	  under `runtime → entry → ticket`, and late replay uses the same committed
   163	  `recall_id`. The sequential PG lifecycle, frontend no-reward recovery, and
   164	  both orderings of `/results`↔hard-recall and pending-attempt-replay↔recall
   165	  are coverage this decision requires (run status with CI, not here); the
   166	  durable invariant is that committed results stay exact-replayable and late
   167	  attempts receive exactly one invalidation with the same action id. Operator
   168	  UI and production E2E remain enable gates.
   169	- Island Social Core is a separate `island_*` namespace, outside the
   170	  catalog/feed contours; Creator District is untouched. P1/P3/P4 and the global
   171	  Island audience were explicitly approved and enabled 25.07.2026 under VISION
   172	  v2.6: post-moderation/report/takedown is the protective envelope for the empty,
   173	  zero-traffic bootstrap. P2 safety remove/block belongs to that live envelope;
   174	  P2 visit-card/holdout and consent-bound outbound Telegram notifications were
   175	  independently approved and enabled by the operator on 25.07.2026. Their code
   176	  defaults and rollback controls remain separate: cards use versioned
   177	  30%/10%-holdout/cap-5 settings; delivery uses 21:00–08:00 UTC quiet hours and
   178	  max 3 physical attempts, with consent/block re-check before I/O. Moderation
   179	  automation still requires a new fraud/abuse evidence decision.
   180	- The island measurement unit is a **client-asserted completion claim**
   181	  (never "win": there is no ticket/oracle path for UGC), gated server-side by
   182	  visit/min-time/per-day cooldowns/caps. Claims never enter qualified-play,
   183	  affinity, retention, creator payout or ad evidence — they are a separate
   184	  `claimed` analytics class. House stage is `min(foreign_claims, 10)`; own
   185	  plays never count (`owner <> guest`). Gifts v1 are puzzles only
   186	  (collection cards deferred until collections are server-owned).
   187	- Owner-facing «кто-то сыграл» is a projection of those same append-only
   188	  completion claims, never a timer, visit-start or local simulation. The
   189	  authenticated read is cursor-paged by the global claim `seq`; a missing
   190	  cursor returns only the current high-water mark so enabling the surface cannot
   191	  replay historical bot activity. Human and bot facts remain visibly distinct;
   192	  removed/taken-down buildings and currently blocked actors are not surfaced.
   193	  The cursor advances across hidden facts so lifting a block cannot resurrect
   194	  an old notification.
   195	- All balance-changing island events take `seq` from one DB sequence under a
   196	  `FOR UPDATE` social row (total order per building). The append-only journals
   197	  (`island_completion_claims`, `island_collect_claims`,
   198	  `island_completion_outcomes`, `island_visit_awards`,
   199	  `island_moderation_actions`, `island_meta_events`) are the source of truth;
   200	  materialized counters are derived and replayable by `seq`. Every claim writes
   201	  its immutable terminal outcome receipt in the same transaction as its first
   202	  insert — without the receipt the claim does not exist. Replay reads only the
   203	  receipt and never re-evaluates time, caps, flags or config: the same request
   204	  on any later day or under any config returns a byte-identical response.
   205	  Re-enabling `island_rewards_enabled` is never retroactively payable; back-pay
   206	  is only a separate append-only operator-authorized process. All randomness is
   207	  derived from a stable seed (visit_id / claim_id / chest-closure run_id) —
   208	  never `random()` in a request.
   209	- Visit-award (P2) chest evidence is an **exact server-resolved closure**, not
   210	  client context: the terminal `VerifiedRun` with `metric_key='series'`, its
   211	  consumed ticket, and the matching `RewardLedger` row
   212	  (`lw:{run_id}`, `reason='series_complete'`, exact `meta.ticket_id`, owner =
   213	  caller). A level-receipt, another user or a `legacy_no_ticket` record is a
   214	  typed 404 `chest_not_found` — no roll without a real chest. One chest is at
   215	  most one roll by construction (`run_id` PK, server-derived `roll_id`); the
   216	  30% chance and daily caps are versioned config; holdout hides the card.
   217	- Builtin bot binding is a typed **immutable identity**
   218	  `{mechanicId, rosterRevision, versionsDigest}`: `mechanicId` is the client's
   219	  sole runtime authority (fail-closed on unknown mechanics), and a changed
   220	  binding on re-seed is a new `buildingId`. Immutable runtime *delivery* for
   221	  builtin is **not** claimed in P1 — builtin mechanics ship over mutable deploy
   222	  (a builtin-house guest plays the same bytes as the feed at that moment);
   223	  exact by-digest delivery waits for a content-addressed contour and is tied to
   224	  the P5/closed-CDN horizon. Bots are server-side active accounts in a reserved
   225	  id range (`>= 900_000_000_000_000`, outside the Telegram range), operator-
   226	  approved as a bootstrap mechanic, distinguishable as actor/source everywhere
   227	  (`source`, `is_bot`, separate `bot_likes`, excluded from product metrics and
   228	  future creator economy). The bot scheduler is fenced from v1: a PostgreSQL
   229	  advisory lock held on one physical session for the whole tick and released in
   230	  `finally`, one immutable per-day plan seeded once from
   231	  `(bot, utc_date, config_digest)`, effects only in the transaction where the
   232	  claim INSERT is proven via `RETURNING`, bounded same-day catch-up; a config/
   233	  persona change takes effect only from the next UTC day.
   234	- Island UGC moderation is **staged post-moderation** (VISION v2.5, operator-
   235	  approved 24.07.2026): the machine playability gate proves technical
   236	  playability only, not content safety. P3 moderation semantics stay gated on
   237	  the merged VISION patch; before any guest sees UGC, report/block,
   238	  exact-artifact-revision takedown, an operator publication/report queue with
   239	  an observable review SLA, and revocable artifact delivery are mandatory.
   240	  Every moderation action writes an append-only receipt bound to the exact
   241	  `artifact_rel`; a mismatched revision is 409. The single-operator auth is an
   242	  allowlist enforced by the server on every request (`?diag=1`/a hidden page
   243	  is navigation, not an authorization boundary); the full scoped-grant
   244	  contract is gated on "moderators > 1". Audience was expanded to ALL users
   245	  by explicit operator decision 25.07.2026 (global Island enablement,
   246	  swipe-backend PR #11; the live post-moderation contour is the protective
   247	  envelope; VISION patch recording this is tracked separately). Moderation
   248	  automation remains a new explicit operator decision with fraud/abuse and
   249	  safety evidence.
   250	- Island migrations `0050_a11` (cohort-watch base), `0051`–`0052` (island
   251	  core), `0053` (async `/island/theme` jobs), `0054` (moderation-action
   252	  seq) and `0055_island_p2` (visit-award response/config-digest +
   253	  notification outbox/attempt-receipts) are merged to master (unified
   254	  island, backend `c21d40f`→`36a7d2a`, client `d560076`→`dd9efbd`); P2
   255	  (visit-card + consent-bound notifications + remove/block UI) is enabled
   256	  in production by operator decision 25.07.2026 with versioned config
   257	  (card 30%/holdout 10%/cap 5/day; notifications only after native
   258	  requestWriteAccess consent, quiet hours 21:00–08:00 UTC, ≤3 attempts,
   259	  consent+block re-checked before I/O); the legacy client visit simulator
   260	  is removed (server facts only); P1/P3/P4 passed internal adversarial review (author ≠
   261	  reviewer) AND independent Codex review (GO). Island is **globally enabled
   262	  in production** by explicit operator decision 25.07.2026 (backend
   263	  `a3dcdf7`/PR #11: `ENABLE_ISLAND_SOCIAL`/`ENABLE_ISLAND_BOTS` on,
   264	  moderator allowlist `42692410`; client `19aece3`; rationale: empty
   265	  platform, zero traffic, post-moderation contour live before real
   266	  traffic). Known accepted deviations: bot seed runs `--apply`
   267	  idempotently on service startup (ТЗ §3.1 said CLI dry-run-first; no
   268	  advisory lock — single-instance assumption, multi-instance scaling
   269	  requires a lock first). P4 reached its final async-only production contract
   270	  on 25.07.2026: backend `01d3bf2` exposes only `202 {job_id}` and performs no
   271	  model I/O in POST; client `2b827cd` (platform `5d0aa12`) has no dual-mode
   272	  branch or opt-in header. VISION Part B is applied in v2.7.
   273	  P5 closed delivery completed 26.07.2026 after the real-device gate passed on
   274	  Telegram iOS/Android/macOS (fresh, resume, expired-link block, re-resolve and
   275	  revoke semantics all PASS). Private Cloudflare R2 Standard stores
   276	  content-addressed single-file HTML; state schema v5 persists only
   277	  `rel + contentDigest`, never a bearer. Backend `89138b8` serves a
   278	  consent-independent authenticated resolver with block/takedown/current-
   279	  identity checks and 600-second signed GETs; client `c121121`
   280	  (`swipe-platform@9d2c1ed`) has no public-UGC URL path. Migration `0057`

exec
/bin/zsh -lc "nl -ba swipe-backend/app/api_island_p2.py | sed -n '230,315p' && nl -ba swipe-backend/app/api_island_social.py | sed -n '140,185p' && nl -ba swipe-backend/app/main.py | sed -n '65,210p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   230	            db,
   231	            owner_id=owner_id,
   232	            guest_id=user_id,
   233	            day=day,
   234	        ):
   235	            continue
   236	        (bots if bot is not None else humans).append(owner_id)
   237	    pool = sorted(humans) or sorted(bots)
   238	    if not pool:
   239	        return None
   240	    index = _bucket(f"{roll_id}:target") % len(pool)
   241	    return pool[index]
   242	
   243	
   244	def _award_response(row: IslandVisitAward) -> dict:
   245	    value = _canonical(dict(row.response))
   246	    value["state"] = row.state
   247	    return value
   248	
   249	
   250	@router.put("/island/friends/{user_id}/block")
   251	def island_friend_block(
   252	    user_id: int,
   253	    body: IslandFriendBlockIn,
   254	    caller: TmaUser = Depends(require_tma_user),
   255	    db: Session = Depends(get_db),
   256	) -> dict:
   257	    get_or_create_user(db, caller)
   258	    if user_id == caller.id:
   259	        raise HTTPException(status_code=400, detail="cannot block yourself")
   260	    if db.get(User, user_id) is None:
   261	        raise HTTPException(status_code=404, detail="user not found")
   262	
   263	    _lock_users(db, caller.id, user_id)
   264	    lo, hi = sorted((caller.id, user_id))
   265	    friendship = db.execute(
   266	        select(IslandFriendship)
   267	        .where(
   268	            IslandFriendship.user_lo == lo,
   269	            IslandFriendship.user_hi == hi,
   270	        )
   271	        .with_for_update()
   272	    ).scalar_one_or_none()
   273	    removed = False
   274	    if body.blocked:
   275	        inserted = db.execute(
   276	            pg_insert(IslandFriendBlock)
   277	            .values(blocker_id=caller.id, blocked_id=user_id)
   278	            .on_conflict_do_nothing()
   279	            .returning(IslandFriendBlock.blocker_id)
   280	        ).scalar_one_or_none()
   281	        if friendship is not None and friendship.removed_at is None:
   282	            friendship.removed_at = utc_now()
   283	            removed = True
   284	        if inserted is not None:
   285	            _record_event(
   286	                db,
   287	                user_id=caller.id,
   288	                event_type="friend_blocked",
   289	                payload={"blocked_user_id": user_id, "friendship_removed": removed},
   290	            )
   291	    else:
   292	        deleted = db.execute(
   293	            delete(IslandFriendBlock)
   294	            .where(
   295	                IslandFriendBlock.blocker_id == caller.id,
   296	                IslandFriendBlock.blocked_id == user_id,
   297	            )
   298	            .returning(IslandFriendBlock.blocker_id)
   299	        ).scalar_one_or_none()
   300	        if deleted is not None:
   301	            _record_event(
   302	                db,
   303	                user_id=caller.id,
   304	                event_type="friend_unblocked",
   305	                payload={"unblocked_user_id": user_id},
   306	            )
   307	    db.commit()
   308	    return {"blocked": bool(body.blocked), "friendship_removed": removed}
   309	
   310	
   311	@router.post("/island/visit-award/from-chest")
   312	def island_visit_award_from_chest(
   313	    body: IslandVisitAwardFromChestIn,
   314	    caller: TmaUser = Depends(require_tma_user),
   315	    db: Session = Depends(get_db),
   140	    return {
   141	        "building_id": str(social.building_id),
   142	        "plays": _display_plays(social),
   143	        "likes": int(social.likes),
   144	        "liked": db.get(IslandBuildingLike, (social.building_id, guest_id)) is not None,
   145	    }
   146	
   147	
   148	def _visit_view(db: Session, visit: IslandVisit, social: IslandBuildingSocial) -> dict:
   149	    return {
   150	        "visit_id": str(visit.id),
   151	        "building_id": str(visit.building_id),
   152	        "owner_id": int(visit.owner_id),
   153	        "state": "completed" if visit.completed_at is not None else "active",
   154	        "expires_at": visit.expires_at.isoformat(),
   155	        "social": _social_view(db, social, visit.guest_id),
   156	    }
   157	
   158	
   159	@router.get("/island/artifact-url")
   160	def island_artifact_url(
   161	    building_id: uuid.UUID,
   162	    caller: TmaUser = Depends(require_tma_user),
   163	    db: Session = Depends(get_db),
   164	):
   165	    settings = get_settings()
   166	    if not settings.enable_island_closed_delivery:
   167	        raise HTTPException(status_code=404, detail="closed Island delivery is unavailable")
   168	    get_or_create_user(db, caller)
   169	    social = db.get(IslandBuildingSocial, building_id)
   170	    if social is None:
   171	        raise HTTPException(status_code=404, detail="island building not found")
   172	    owner_id = int(social.owner_id)
   173	    if caller.id != owner_id and blocked_between(db, caller.id, owner_id):
   174	        raise HTTPException(status_code=404, detail="island building not found")
   175	    _, _, building, _ = current_island_building(
   176	        db,
   177	        owner_id=owner_id,
   178	        building_id=building_id,
   179	        viewer_id=caller.id,
   180	    )
   181	    _require_public_artifact(owner_id, building)
   182	    if is_taken_down(db, building_id):
   183	        raise HTTPException(status_code=404, detail="island building not found")
   184	    content_digest = str(building.contentDigest or "")
   185	    try:
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
/bin/zsh -lc 'git log --oneline --decorate=short -8 -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md && git rev-parse f86c489523977dcca8d3959e73e9bcfb9f556c9e''^' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 4ms:
eaa7ca943a1994eab0fa51cafe2cc987d7274c86

exec
/bin/zsh -lc 'git status --short --untracked-files=all' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
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
?? mobile-review-r6-review-packet-2026-07-30.md
?? package-lock.json
?? package.json
?? pins-ftue-L1-video-compliance.pdf
?? play-for-good-tz-review-r5-prompt.md
?? play-for-good-tz-review-r5-raw.md
?? playable-tickets.html
?? playables-status.html
?? scratchpad/auto-review-generated-feed-client.json
?? scratchpad/auto-review-raster-canary-backend.json
?? scratchpad/codex-island-review-r2.md
?? scratchpad/codex-island-review.md
?? scratchpad/codex-p1-impl-review-r1.md
?? scratchpad/generated-offer-backend-auto-review.json
?? scratchpad/generated-offer-frontend-auto-review.json
?? scratchpad/handoff.md
?? scratchpad/island-social-core-p1-codex-review-r2.md
?? scratchpad/island-social-core-p3-codex-review-r1.md
?? scratchpad/island-social-core-p4-codex-review-r1.md
?? scratchpad/lab-performance-isolated-2026-07-29-r2.json
?? scratchpad/pg-e2e-real/data/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/1/112
?? scratchpad/pg-e2e-real/data/base/1/113
?? scratchpad/pg-e2e-real/data/base/1/1247
?? scratchpad/pg-e2e-real/data/base/1/1247_fsm
?? scratchpad/pg-e2e-real/data/base/1/1247_vm
?? scratchpad/pg-e2e-real/data/base/1/1249
?? scratchpad/pg-e2e-real/data/base/1/1249_fsm
?? scratchpad/pg-e2e-real/data/base/1/1249_vm
?? scratchpad/pg-e2e-real/data/base/1/1255
?? scratchpad/pg-e2e-real/data/base/1/1255_fsm
?? scratchpad/pg-e2e-real/data/base/1/1255_vm
?? scratchpad/pg-e2e-real/data/base/1/1259
?? scratchpad/pg-e2e-real/data/base/1/1259_fsm
?? scratchpad/pg-e2e-real/data/base/1/1259_vm
?? scratchpad/pg-e2e-real/data/base/1/13838
?? scratchpad/pg-e2e-real/data/base/1/13838_fsm
?? scratchpad/pg-e2e-real/data/base/1/13838_vm
?? scratchpad/pg-e2e-real/data/base/1/13841
?? scratchpad/pg-e2e-real/data/base/1/13842
?? scratchpad/pg-e2e-real/data/base/1/13843
?? scratchpad/pg-e2e-real/data/base/1/13843_fsm
?? scratchpad/pg-e2e-real/data/base/1/13843_vm
?? scratchpad/pg-e2e-real/data/base/1/13846
?? scratchpad/pg-e2e-real/data/base/1/13847
?? scratchpad/pg-e2e-real/data/base/1/13848
?? scratchpad/pg-e2e-real/data/base/1/13848_fsm
?? scratchpad/pg-e2e-real/data/base/1/13848_vm
?? scratchpad/pg-e2e-real/data/base/1/13851
?? scratchpad/pg-e2e-real/data/base/1/13852
?? scratchpad/pg-e2e-real/data/base/1/13853
?? scratchpad/pg-e2e-real/data/base/1/13853_fsm
?? scratchpad/pg-e2e-real/data/base/1/13853_vm
?? scratchpad/pg-e2e-real/data/base/1/13856
?? scratchpad/pg-e2e-real/data/base/1/13857
?? scratchpad/pg-e2e-real/data/base/1/1417
?? scratchpad/pg-e2e-real/data/base/1/1418
?? scratchpad/pg-e2e-real/data/base/1/174
?? scratchpad/pg-e2e-real/data/base/1/175
?? scratchpad/pg-e2e-real/data/base/1/2187
?? scratchpad/pg-e2e-real/data/base/1/2224
?? scratchpad/pg-e2e-real/data/base/1/2228
?? scratchpad/pg-e2e-real/data/base/1/2328
?? scratchpad/pg-e2e-real/data/base/1/2336
?? scratchpad/pg-e2e-real/data/base/1/2337
?? scratchpad/pg-e2e-real/data/base/1/2579
?? scratchpad/pg-e2e-real/data/base/1/2600
?? scratchpad/pg-e2e-real/data/base/1/2600_fsm
?? scratchpad/pg-e2e-real/data/base/1/2600_vm
?? scratchpad/pg-e2e-real/data/base/1/2601
?? scratchpad/pg-e2e-real/data/base/1/2601_fsm
?? scratchpad/pg-e2e-real/data/base/1/2601_vm
?? scratchpad/pg-e2e-real/data/base/1/2602
?? scratchpad/pg-e2e-real/data/base/1/2602_fsm
?? scratchpad/pg-e2e-real/data/base/1/2602_vm
?? scratchpad/pg-e2e-real/data/base/1/2603
?? scratchpad/pg-e2e-real/data/base/1/2603_fsm
?? scratchpad/pg-e2e-real/data/base/1/2603_vm
?? scratchpad/pg-e2e-real/data/base/1/2604
?? scratchpad/pg-e2e-real/data/base/1/2605
?? scratchpad/pg-e2e-real/data/base/1/2605_fsm
?? scratchpad/pg-e2e-real/data/base/1/2605_vm
?? scratchpad/pg-e2e-real/data/base/1/2606
?? scratchpad/pg-e2e-real/data/base/1/2606_fsm
?? scratchpad/pg-e2e-real/data/base/1/2606_vm
?? scratchpad/pg-e2e-real/data/base/1/2607
?? scratchpad/pg-e2e-real/data/base/1/2607_fsm
?? scratchpad/pg-e2e-real/data/base/1/2607_vm
?? scratchpad/pg-e2e-real/data/base/1/2608
?? scratchpad/pg-e2e-real/data/base/1/2608_fsm
?? scratchpad/pg-e2e-real/data/base/1/2608_vm
?? scratchpad/pg-e2e-real/data/base/1/2609
?? scratchpad/pg-e2e-real/data/base/1/2609_fsm
?? scratchpad/pg-e2e-real/data/base/1/2609_vm
?? scratchpad/pg-e2e-real/data/base/1/2610
?? scratchpad/pg-e2e-real/data/base/1/2610_fsm
?? scratchpad/pg-e2e-real/data/base/1/2610_vm
?? scratchpad/pg-e2e-real/data/base/1/2611
?? scratchpad/pg-e2e-real/data/base/1/2612
?? scratchpad/pg-e2e-real/data/base/1/2612_fsm
?? scratchpad/pg-e2e-real/data/base/1/2612_vm
?? scratchpad/pg-e2e-real/data/base/1/2613
?? scratchpad/pg-e2e-real/data/base/1/2615
?? scratchpad/pg-e2e-real/data/base/1/2615_fsm
?? scratchpad/pg-e2e-real/data/base/1/2615_vm
?? scratchpad/pg-e2e-real/data/base/1/2616
?? scratchpad/pg-e2e-real/data/base/1/2616_fsm
?? scratchpad/pg-e2e-real/data/base/1/2616_vm
?? scratchpad/pg-e2e-real/data/base/1/2617
?? scratchpad/pg-e2e-real/data/base/1/2617_fsm
?? scratchpad/pg-e2e-real/data/base/1/2617_vm
?? scratchpad/pg-e2e-real/data/base/1/2618
?? scratchpad/pg-e2e-real/data/base/1/2618_fsm
?? scratchpad/pg-e2e-real/data/base/1/2618_vm
?? scratchpad/pg-e2e-real/data/base/1/2619
?? scratchpad/pg-e2e-real/data/base/1/2619_fsm
?? scratchpad/pg-e2e-real/data/base/1/2619_vm
?? scratchpad/pg-e2e-real/data/base/1/2620
?? scratchpad/pg-e2e-real/data/base/1/2650
?? scratchpad/pg-e2e-real/data/base/1/2651
?? scratchpad/pg-e2e-real/data/base/1/2652
?? scratchpad/pg-e2e-real/data/base/1/2653
?? scratchpad/pg-e2e-real/data/base/1/2654
?? scratchpad/pg-e2e-real/data/base/1/2655
?? scratchpad/pg-e2e-real/data/base/1/2656
?? scratchpad/pg-e2e-real/data/base/1/2657
?? scratchpad/pg-e2e-real/data/base/1/2658
?? scratchpad/pg-e2e-real/data/base/1/2659
?? scratchpad/pg-e2e-real/data/base/1/2660
?? scratchpad/pg-e2e-real/data/base/1/2661
?? scratchpad/pg-e2e-real/data/base/1/2662
?? scratchpad/pg-e2e-real/data/base/1/2663
?? scratchpad/pg-e2e-real/data/base/1/2664
?? scratchpad/pg-e2e-real/data/base/1/2665
?? scratchpad/pg-e2e-real/data/base/1/2666
?? scratchpad/pg-e2e-real/data/base/1/2667
?? scratchpad/pg-e2e-real/data/base/1/2668
?? scratchpad/pg-e2e-real/data/base/1/2669
?? scratchpad/pg-e2e-real/data/base/1/2670
?? scratchpad/pg-e2e-real/data/base/1/2673
?? scratchpad/pg-e2e-real/data/base/1/2674
?? scratchpad/pg-e2e-real/data/base/1/2675
?? scratchpad/pg-e2e-real/data/base/1/2678
?? scratchpad/pg-e2e-real/data/base/1/2679
?? scratchpad/pg-e2e-real/data/base/1/2680
?? scratchpad/pg-e2e-real/data/base/1/2681
?? scratchpad/pg-e2e-real/data/base/1/2682
?? scratchpad/pg-e2e-real/data/base/1/2683
?? scratchpad/pg-e2e-real/data/base/1/2684
?? scratchpad/pg-e2e-real/data/base/1/2685
?? scratchpad/pg-e2e-real/data/base/1/2686
?? scratchpad/pg-e2e-real/data/base/1/2687
?? scratchpad/pg-e2e-real/data/base/1/2688
?? scratchpad/pg-e2e-real/data/base/1/2689
?? scratchpad/pg-e2e-real/data/base/1/2690
?? scratchpad/pg-e2e-real/data/base/1/2691
?? scratchpad/pg-e2e-real/data/base/1/2692
?? scratchpad/pg-e2e-real/data/base/1/2693
?? scratchpad/pg-e2e-real/data/base/1/2696
?? scratchpad/pg-e2e-real/data/base/1/2699
?? scratchpad/pg-e2e-real/data/base/1/2701
?? scratchpad/pg-e2e-real/data/base/1/2702
?? scratchpad/pg-e2e-real/data/base/1/2703
?? scratchpad/pg-e2e-real/data/base/1/2704
?? scratchpad/pg-e2e-real/data/base/1/2753
?? scratchpad/pg-e2e-real/data/base/1/2753_fsm
?? scratchpad/pg-e2e-real/data/base/1/2753_vm
?? scratchpad/pg-e2e-real/data/base/1/2754
?? scratchpad/pg-e2e-real/data/base/1/2755
?? scratchpad/pg-e2e-real/data/base/1/2756
?? scratchpad/pg-e2e-real/data/base/1/2757
?? scratchpad/pg-e2e-real/data/base/1/2830
?? scratchpad/pg-e2e-real/data/base/1/2831
?? scratchpad/pg-e2e-real/data/base/1/2832
?? scratchpad/pg-e2e-real/data/base/1/2833
?? scratchpad/pg-e2e-real/data/base/1/2834
?? scratchpad/pg-e2e-real/data/base/1/2835
?? scratchpad/pg-e2e-real/data/base/1/2836
?? scratchpad/pg-e2e-real/data/base/1/2836_fsm
?? scratchpad/pg-e2e-real/data/base/1/2836_vm
?? scratchpad/pg-e2e-real/data/base/1/2837
?? scratchpad/pg-e2e-real/data/base/1/2838
?? scratchpad/pg-e2e-real/data/base/1/2838_fsm
?? scratchpad/pg-e2e-real/data/base/1/2838_vm
?? scratchpad/pg-e2e-real/data/base/1/2839
?? scratchpad/pg-e2e-real/data/base/1/2840
?? scratchpad/pg-e2e-real/data/base/1/2840_fsm
?? scratchpad/pg-e2e-real/data/base/1/2840_vm
?? scratchpad/pg-e2e-real/data/base/1/2841
?? scratchpad/pg-e2e-real/data/base/1/2995
?? scratchpad/pg-e2e-real/data/base/1/2996
?? scratchpad/pg-e2e-real/data/base/1/3079
?? scratchpad/pg-e2e-real/data/base/1/3079_fsm
?? scratchpad/pg-e2e-real/data/base/1/3079_vm
?? scratchpad/pg-e2e-real/data/base/1/3080
?? scratchpad/pg-e2e-real/data/base/1/3081
?? scratchpad/pg-e2e-real/data/base/1/3085
?? scratchpad/pg-e2e-real/data/base/1/3118
?? scratchpad/pg-e2e-real/data/base/1/3119
?? scratchpad/pg-e2e-real/data/base/1/3164
?? scratchpad/pg-e2e-real/data/base/1/3256
?? scratchpad/pg-e2e-real/data/base/1/3257
?? scratchpad/pg-e2e-real/data/base/1/3258
?? scratchpad/pg-e2e-real/data/base/1/3350
?? scratchpad/pg-e2e-real/data/base/1/3351
?? scratchpad/pg-e2e-real/data/base/1/3379
?? scratchpad/pg-e2e-real/data/base/1/3380
?? scratchpad/pg-e2e-real/data/base/1/3381
?? scratchpad/pg-e2e-real/data/base/1/3394
?? scratchpad/pg-e2e-real/data/base/1/3394_fsm
?? scratchpad/pg-e2e-real/data/base/1/3394_vm
?? scratchpad/pg-e2e-real/data/base/1/3395
?? scratchpad/pg-e2e-real/data/base/1/3429
?? scratchpad/pg-e2e-real/data/base/1/3430
?? scratchpad/pg-e2e-real/data/base/1/3431
?? scratchpad/pg-e2e-real/data/base/1/3433
?? scratchpad/pg-e2e-real/data/base/1/3439
?? scratchpad/pg-e2e-real/data/base/1/3440
?? scratchpad/pg-e2e-real/data/base/1/3455
?? scratchpad/pg-e2e-real/data/base/1/3456
?? scratchpad/pg-e2e-real/data/base/1/3456_fsm
?? scratchpad/pg-e2e-real/data/base/1/3456_vm
?? scratchpad/pg-e2e-real/data/base/1/3466
?? scratchpad/pg-e2e-real/data/base/1/3467
?? scratchpad/pg-e2e-real/data/base/1/3468
?? scratchpad/pg-e2e-real/data/base/1/3501
?? scratchpad/pg-e2e-real/data/base/1/3502
?? scratchpad/pg-e2e-real/data/base/1/3503
?? scratchpad/pg-e2e-real/data/base/1/3534
?? scratchpad/pg-e2e-real/data/base/1/3541
?? scratchpad/pg-e2e-real/data/base/1/3541_fsm
?? scratchpad/pg-e2e-real/data/base/1/3541_vm
?? scratchpad/pg-e2e-real/data/base/1/3542
?? scratchpad/pg-e2e-real/data/base/1/3574
?? scratchpad/pg-e2e-real/data/base/1/3575
?? scratchpad/pg-e2e-real/data/base/1/3576
?? scratchpad/pg-e2e-real/data/base/1/3596
?? scratchpad/pg-e2e-real/data/base/1/3597
?? scratchpad/pg-e2e-real/data/base/1/3598
?? scratchpad/pg-e2e-real/data/base/1/3599
?? scratchpad/pg-e2e-real/data/base/1/3600
?? scratchpad/pg-e2e-real/data/base/1/3600_fsm
?? scratchpad/pg-e2e-real/data/base/1/3600_vm
?? scratchpad/pg-e2e-real/data/base/1/3601
?? scratchpad/pg-e2e-real/data/base/1/3601_fsm
?? scratchpad/pg-e2e-real/data/base/1/3601_vm
?? scratchpad/pg-e2e-real/data/base/1/3602
?? scratchpad/pg-e2e-real/data/base/1/3602_fsm
?? scratchpad/pg-e2e-real/data/base/1/3602_vm
?? scratchpad/pg-e2e-real/data/base/1/3603
?? scratchpad/pg-e2e-real/data/base/1/3603_fsm
?? scratchpad/pg-e2e-real/data/base/1/3603_vm
?? scratchpad/pg-e2e-real/data/base/1/3604
?? scratchpad/pg-e2e-real/data/base/1/3605
?? scratchpad/pg-e2e-real/data/base/1/3606
?? scratchpad/pg-e2e-real/data/base/1/3607
?? scratchpad/pg-e2e-real/data/base/1/3608
?? scratchpad/pg-e2e-real/data/base/1/3609
?? scratchpad/pg-e2e-real/data/base/1/3712
?? scratchpad/pg-e2e-real/data/base/1/3764
?? scratchpad/pg-e2e-real/data/base/1/3764_fsm
?? scratchpad/pg-e2e-real/data/base/1/3764_vm
?? scratchpad/pg-e2e-real/data/base/1/3766
?? scratchpad/pg-e2e-real/data/base/1/3767
?? scratchpad/pg-e2e-real/data/base/1/3997
?? scratchpad/pg-e2e-real/data/base/1/4143
?? scratchpad/pg-e2e-real/data/base/1/4144
?? scratchpad/pg-e2e-real/data/base/1/4145
?? scratchpad/pg-e2e-real/data/base/1/4146
?? scratchpad/pg-e2e-real/data/base/1/4147
?? scratchpad/pg-e2e-real/data/base/1/4148
?? scratchpad/pg-e2e-real/data/base/1/4149
?? scratchpad/pg-e2e-real/data/base/1/4150
?? scratchpad/pg-e2e-real/data/base/1/4151
?? scratchpad/pg-e2e-real/data/base/1/4152
?? scratchpad/pg-e2e-real/data/base/1/4153
?? scratchpad/pg-e2e-real/data/base/1/4154
?? scratchpad/pg-e2e-real/data/base/1/4155
?? scratchpad/pg-e2e-real/data/base/1/4156
?? scratchpad/pg-e2e-real/data/base/1/4157
?? scratchpad/pg-e2e-real/data/base/1/4158
?? scratchpad/pg-e2e-real/data/base/1/4159
?? scratchpad/pg-e2e-real/data/base/1/4160
?? scratchpad/pg-e2e-real/data/base/1/4163
?? scratchpad/pg-e2e-real/data/base/1/4164
?? scratchpad/pg-e2e-real/data/base/1/4165
?? scratchpad/pg-e2e-real/data/base/1/4166
?? scratchpad/pg-e2e-real/data/base/1/4167
?? scratchpad/pg-e2e-real/data/base/1/4168
?? scratchpad/pg-e2e-real/data/base/1/4169
?? scratchpad/pg-e2e-real/data/base/1/4170
?? scratchpad/pg-e2e-real/data/base/1/4171
?? scratchpad/pg-e2e-real/data/base/1/4172
?? scratchpad/pg-e2e-real/data/base/1/4173
?? scratchpad/pg-e2e-real/data/base/1/4174
?? scratchpad/pg-e2e-real/data/base/1/5002
?? scratchpad/pg-e2e-real/data/base/1/548
?? scratchpad/pg-e2e-real/data/base/1/549
?? scratchpad/pg-e2e-real/data/base/1/6102
?? scratchpad/pg-e2e-real/data/base/1/6104
?? scratchpad/pg-e2e-real/data/base/1/6106
?? scratchpad/pg-e2e-real/data/base/1/6110
?? scratchpad/pg-e2e-real/data/base/1/6111
?? scratchpad/pg-e2e-real/data/base/1/6112
?? scratchpad/pg-e2e-real/data/base/1/6113
?? scratchpad/pg-e2e-real/data/base/1/6116
?? scratchpad/pg-e2e-real/data/base/1/6117
?? scratchpad/pg-e2e-real/data/base/1/6175
?? scratchpad/pg-e2e-real/data/base/1/6176
?? scratchpad/pg-e2e-real/data/base/1/6228
?? scratchpad/pg-e2e-real/data/base/1/6229
?? scratchpad/pg-e2e-real/data/base/1/6237
?? scratchpad/pg-e2e-real/data/base/1/6238
?? scratchpad/pg-e2e-real/data/base/1/6239
?? scratchpad/pg-e2e-real/data/base/1/826
?? scratchpad/pg-e2e-real/data/base/1/827
?? scratchpad/pg-e2e-real/data/base/1/828
?? scratchpad/pg-e2e-real/data/base/1/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/1/pg_filenode.map
?? scratchpad/pg-e2e-real/data/base/4/112
?? scratchpad/pg-e2e-real/data/base/4/113
?? scratchpad/pg-e2e-real/data/base/4/1247
?? scratchpad/pg-e2e-real/data/base/4/1247_fsm
?? scratchpad/pg-e2e-real/data/base/4/1247_vm
?? scratchpad/pg-e2e-real/data/base/4/1249
?? scratchpad/pg-e2e-real/data/base/4/1249_fsm
?? scratchpad/pg-e2e-real/data/base/4/1249_vm
?? scratchpad/pg-e2e-real/data/base/4/1255
?? scratchpad/pg-e2e-real/data/base/4/1255_fsm
?? scratchpad/pg-e2e-real/data/base/4/1255_vm
?? scratchpad/pg-e2e-real/data/base/4/1259
?? scratchpad/pg-e2e-real/data/base/4/1259_fsm
?? scratchpad/pg-e2e-real/data/base/4/1259_vm
?? scratchpad/pg-e2e-real/data/base/4/13838
?? scratchpad/pg-e2e-real/data/base/4/13838_fsm
?? scratchpad/pg-e2e-real/data/base/4/13838_vm
?? scratchpad/pg-e2e-real/data/base/4/13841
?? scratchpad/pg-e2e-real/data/base/4/13842
?? scratchpad/pg-e2e-real/data/base/4/13843
?? scratchpad/pg-e2e-real/data/base/4/13843_fsm
?? scratchpad/pg-e2e-real/data/base/4/13843_vm
?? scratchpad/pg-e2e-real/data/base/4/13846
?? scratchpad/pg-e2e-real/data/base/4/13847
?? scratchpad/pg-e2e-real/data/base/4/13848
?? scratchpad/pg-e2e-real/data/base/4/13848_fsm
?? scratchpad/pg-e2e-real/data/base/4/13848_vm
?? scratchpad/pg-e2e-real/data/base/4/13851
?? scratchpad/pg-e2e-real/data/base/4/13852
?? scratchpad/pg-e2e-real/data/base/4/13853
?? scratchpad/pg-e2e-real/data/base/4/13853_fsm
?? scratchpad/pg-e2e-real/data/base/4/13853_vm
?? scratchpad/pg-e2e-real/data/base/4/13856
?? scratchpad/pg-e2e-real/data/base/4/13857
?? scratchpad/pg-e2e-real/data/base/4/1417
?? scratchpad/pg-e2e-real/data/base/4/1418
?? scratchpad/pg-e2e-real/data/base/4/174
?? scratchpad/pg-e2e-real/data/base/4/175
?? scratchpad/pg-e2e-real/data/base/4/2187
?? scratchpad/pg-e2e-real/data/base/4/2224
?? scratchpad/pg-e2e-real/data/base/4/2228
?? scratchpad/pg-e2e-real/data/base/4/2328
?? scratchpad/pg-e2e-real/data/base/4/2336
?? scratchpad/pg-e2e-real/data/base/4/2337
?? scratchpad/pg-e2e-real/data/base/4/2579
?? scratchpad/pg-e2e-real/data/base/4/2600
?? scratchpad/pg-e2e-real/data/base/4/2600_fsm
?? scratchpad/pg-e2e-real/data/base/4/2600_vm
?? scratchpad/pg-e2e-real/data/base/4/2601
?? scratchpad/pg-e2e-real/data/base/4/2601_fsm
?? scratchpad/pg-e2e-real/data/base/4/2601_vm
?? scratchpad/pg-e2e-real/data/base/4/2602
?? scratchpad/pg-e2e-real/data/base/4/2602_fsm
?? scratchpad/pg-e2e-real/data/base/4/2602_vm
?? scratchpad/pg-e2e-real/data/base/4/2603
?? scratchpad/pg-e2e-real/data/base/4/2603_fsm
?? scratchpad/pg-e2e-real/data/base/4/2603_vm
?? scratchpad/pg-e2e-real/data/base/4/2604
?? scratchpad/pg-e2e-real/data/base/4/2605
?? scratchpad/pg-e2e-real/data/base/4/2605_fsm
?? scratchpad/pg-e2e-real/data/base/4/2605_vm
?? scratchpad/pg-e2e-real/data/base/4/2606
?? scratchpad/pg-e2e-real/data/base/4/2606_fsm
?? scratchpad/pg-e2e-real/data/base/4/2606_vm
?? scratchpad/pg-e2e-real/data/base/4/2607
?? scratchpad/pg-e2e-real/data/base/4/2607_fsm
?? scratchpad/pg-e2e-real/data/base/4/2607_vm
?? scratchpad/pg-e2e-real/data/base/4/2608
?? scratchpad/pg-e2e-real/data/base/4/2608_fsm
?? scratchpad/pg-e2e-real/data/base/4/2608_vm
?? scratchpad/pg-e2e-real/data/base/4/2609
?? scratchpad/pg-e2e-real/data/base/4/2609_fsm
?? scratchpad/pg-e2e-real/data/base/4/2609_vm
?? scratchpad/pg-e2e-real/data/base/4/2610
?? scratchpad/pg-e2e-real/data/base/4/2610_fsm
?? scratchpad/pg-e2e-real/data/base/4/2610_vm
?? scratchpad/pg-e2e-real/data/base/4/2611
?? scratchpad/pg-e2e-real/data/base/4/2612
?? scratchpad/pg-e2e-real/data/base/4/2612_fsm
?? scratchpad/pg-e2e-real/data/base/4/2612_vm
?? scratchpad/pg-e2e-real/data/base/4/2613
?? scratchpad/pg-e2e-real/data/base/4/2615
?? scratchpad/pg-e2e-real/data/base/4/2615_fsm
?? scratchpad/pg-e2e-real/data/base/4/2615_vm
?? scratchpad/pg-e2e-real/data/base/4/2616
?? scratchpad/pg-e2e-real/data/base/4/2616_fsm
?? scratchpad/pg-e2e-real/data/base/4/2616_vm
?? scratchpad/pg-e2e-real/data/base/4/2617
?? scratchpad/pg-e2e-real/data/base/4/2617_fsm
?? scratchpad/pg-e2e-real/data/base/4/2617_vm
?? scratchpad/pg-e2e-real/data/base/4/2618
?? scratchpad/pg-e2e-real/data/base/4/2618_fsm
?? scratchpad/pg-e2e-real/data/base/4/2618_vm
?? scratchpad/pg-e2e-real/data/base/4/2619
?? scratchpad/pg-e2e-real/data/base/4/2619_fsm
?? scratchpad/pg-e2e-real/data/base/4/2619_vm
?? scratchpad/pg-e2e-real/data/base/4/2620
?? scratchpad/pg-e2e-real/data/base/4/2650
?? scratchpad/pg-e2e-real/data/base/4/2651
?? scratchpad/pg-e2e-real/data/base/4/2652
?? scratchpad/pg-e2e-real/data/base/4/2653
?? scratchpad/pg-e2e-real/data/base/4/2654
?? scratchpad/pg-e2e-real/data/base/4/2655
?? scratchpad/pg-e2e-real/data/base/4/2656
?? scratchpad/pg-e2e-real/data/base/4/2657
?? scratchpad/pg-e2e-real/data/base/4/2658
?? scratchpad/pg-e2e-real/data/base/4/2659
?? scratchpad/pg-e2e-real/data/base/4/2660
?? scratchpad/pg-e2e-real/data/base/4/2661
?? scratchpad/pg-e2e-real/data/base/4/2662
?? scratchpad/pg-e2e-real/data/base/4/2663
?? scratchpad/pg-e2e-real/data/base/4/2664
?? scratchpad/pg-e2e-real/data/base/4/2665
?? scratchpad/pg-e2e-real/data/base/4/2666
?? scratchpad/pg-e2e-real/data/base/4/2667
?? scratchpad/pg-e2e-real/data/base/4/2668
?? scratchpad/pg-e2e-real/data/base/4/2669
?? scratchpad/pg-e2e-real/data/base/4/2670
?? scratchpad/pg-e2e-real/data/base/4/2673
?? scratchpad/pg-e2e-real/data/base/4/2674
?? scratchpad/pg-e2e-real/data/base/4/2675
?? scratchpad/pg-e2e-real/data/base/4/2678
?? scratchpad/pg-e2e-real/data/base/4/2679
?? scratchpad/pg-e2e-real/data/base/4/2680
?? scratchpad/pg-e2e-real/data/base/4/2681
?? scratchpad/pg-e2e-real/data/base/4/2682
?? scratchpad/pg-e2e-real/data/base/4/2683
?? scratchpad/pg-e2e-real/data/base/4/2684
?? scratchpad/pg-e2e-real/data/base/4/2685
?? scratchpad/pg-e2e-real/data/base/4/2686
?? scratchpad/pg-e2e-real/data/base/4/2687
?? scratchpad/pg-e2e-real/data/base/4/2688
?? scratchpad/pg-e2e-real/data/base/4/2689
?? scratchpad/pg-e2e-real/data/base/4/2690
?? scratchpad/pg-e2e-real/data/base/4/2691
?? scratchpad/pg-e2e-real/data/base/4/2692
?? scratchpad/pg-e2e-real/data/base/4/2693
?? scratchpad/pg-e2e-real/data/base/4/2696
?? scratchpad/pg-e2e-real/data/base/4/2699
?? scratchpad/pg-e2e-real/data/base/4/2701
?? scratchpad/pg-e2e-real/data/base/4/2702
?? scratchpad/pg-e2e-real/data/base/4/2703
?? scratchpad/pg-e2e-real/data/base/4/2704
?? scratchpad/pg-e2e-real/data/base/4/2753
?? scratchpad/pg-e2e-real/data/base/4/2753_fsm
?? scratchpad/pg-e2e-real/data/base/4/2753_vm
?? scratchpad/pg-e2e-real/data/base/4/2754
?? scratchpad/pg-e2e-real/data/base/4/2755
?? scratchpad/pg-e2e-real/data/base/4/2756
?? scratchpad/pg-e2e-real/data/base/4/2757
?? scratchpad/pg-e2e-real/data/base/4/2830
?? scratchpad/pg-e2e-real/data/base/4/2831
?? scratchpad/pg-e2e-real/data/base/4/2832
?? scratchpad/pg-e2e-real/data/base/4/2833
?? scratchpad/pg-e2e-real/data/base/4/2834
?? scratchpad/pg-e2e-real/data/base/4/2835
?? scratchpad/pg-e2e-real/data/base/4/2836
?? scratchpad/pg-e2e-real/data/base/4/2836_fsm
?? scratchpad/pg-e2e-real/data/base/4/2836_vm
?? scratchpad/pg-e2e-real/data/base/4/2837
?? scratchpad/pg-e2e-real/data/base/4/2838
?? scratchpad/pg-e2e-real/data/base/4/2838_fsm
?? scratchpad/pg-e2e-real/data/base/4/2838_vm
?? scratchpad/pg-e2e-real/data/base/4/2839
?? scratchpad/pg-e2e-real/data/base/4/2840
?? scratchpad/pg-e2e-real/data/base/4/2840_fsm
?? scratchpad/pg-e2e-real/data/base/4/2840_vm
?? scratchpad/pg-e2e-real/data/base/4/2841
?? scratchpad/pg-e2e-real/data/base/4/2995
?? scratchpad/pg-e2e-real/data/base/4/2996
?? scratchpad/pg-e2e-real/data/base/4/3079
?? scratchpad/pg-e2e-real/data/base/4/3079_fsm
?? scratchpad/pg-e2e-real/data/base/4/3079_vm
?? scratchpad/pg-e2e-real/data/base/4/3080
?? scratchpad/pg-e2e-real/data/base/4/3081
?? scratchpad/pg-e2e-real/data/base/4/3085
?? scratchpad/pg-e2e-real/data/base/4/3118
?? scratchpad/pg-e2e-real/data/base/4/3119
?? scratchpad/pg-e2e-real/data/base/4/3164
?? scratchpad/pg-e2e-real/data/base/4/3256
?? scratchpad/pg-e2e-real/data/base/4/3257
?? scratchpad/pg-e2e-real/data/base/4/3258
?? scratchpad/pg-e2e-real/data/base/4/3350
?? scratchpad/pg-e2e-real/data/base/4/3351
?? scratchpad/pg-e2e-real/data/base/4/3379
?? scratchpad/pg-e2e-real/data/base/4/3380
?? scratchpad/pg-e2e-real/data/base/4/3381
?? scratchpad/pg-e2e-real/data/base/4/3394
?? scratchpad/pg-e2e-real/data/base/4/3394_fsm
?? scratchpad/pg-e2e-real/data/base/4/3394_vm
?? scratchpad/pg-e2e-real/data/base/4/3395
?? scratchpad/pg-e2e-real/data/base/4/3429
?? scratchpad/pg-e2e-real/data/base/4/3430
?? scratchpad/pg-e2e-real/data/base/4/3431
?? scratchpad/pg-e2e-real/data/base/4/3433
?? scratchpad/pg-e2e-real/data/base/4/3439
?? scratchpad/pg-e2e-real/data/base/4/3440
?? scratchpad/pg-e2e-real/data/base/4/3455
?? scratchpad/pg-e2e-real/data/base/4/3456
?? scratchpad/pg-e2e-real/data/base/4/3456_fsm
?? scratchpad/pg-e2e-real/data/base/4/3456_vm
?? scratchpad/pg-e2e-real/data/base/4/3466
?? scratchpad/pg-e2e-real/data/base/4/3467
?? scratchpad/pg-e2e-real/data/base/4/3468
?? scratchpad/pg-e2e-real/data/base/4/3501
?? scratchpad/pg-e2e-real/data/base/4/3502
?? scratchpad/pg-e2e-real/data/base/4/3503
?? scratchpad/pg-e2e-real/data/base/4/3534
?? scratchpad/pg-e2e-real/data/base/4/3541
?? scratchpad/pg-e2e-real/data/base/4/3541_fsm
?? scratchpad/pg-e2e-real/data/base/4/3541_vm
?? scratchpad/pg-e2e-real/data/base/4/3542
?? scratchpad/pg-e2e-real/data/base/4/3574
?? scratchpad/pg-e2e-real/data/base/4/3575
?? scratchpad/pg-e2e-real/data/base/4/3576
?? scratchpad/pg-e2e-real/data/base/4/3596
?? scratchpad/pg-e2e-real/data/base/4/3597
?? scratchpad/pg-e2e-real/data/base/4/3598
?? scratchpad/pg-e2e-real/data/base/4/3599
?? scratchpad/pg-e2e-real/data/base/4/3600
?? scratchpad/pg-e2e-real/data/base/4/3600_fsm
?? scratchpad/pg-e2e-real/data/base/4/3600_vm
?? scratchpad/pg-e2e-real/data/base/4/3601
?? scratchpad/pg-e2e-real/data/base/4/3601_fsm
?? scratchpad/pg-e2e-real/data/base/4/3601_vm
?? scratchpad/pg-e2e-real/data/base/4/3602
?? scratchpad/pg-e2e-real/data/base/4/3602_fsm
?? scratchpad/pg-e2e-real/data/base/4/3602_vm
?? scratchpad/pg-e2e-real/data/base/4/3603
?? scratchpad/pg-e2e-real/data/base/4/3603_fsm
?? scratchpad/pg-e2e-real/data/base/4/3603_vm
?? scratchpad/pg-e2e-real/data/base/4/3604
?? scratchpad/pg-e2e-real/data/base/4/3605
?? scratchpad/pg-e2e-real/data/base/4/3606
?? scratchpad/pg-e2e-real/data/base/4/3607
?? scratchpad/pg-e2e-real/data/base/4/3608
?? scratchpad/pg-e2e-real/data/base/4/3609
?? scratchpad/pg-e2e-real/data/base/4/3712
?? scratchpad/pg-e2e-real/data/base/4/3764
?? scratchpad/pg-e2e-real/data/base/4/3764_fsm
?? scratchpad/pg-e2e-real/data/base/4/3764_vm
?? scratchpad/pg-e2e-real/data/base/4/3766
?? scratchpad/pg-e2e-real/data/base/4/3767
?? scratchpad/pg-e2e-real/data/base/4/3997
?? scratchpad/pg-e2e-real/data/base/4/4143
?? scratchpad/pg-e2e-real/data/base/4/4144
?? scratchpad/pg-e2e-real/data/base/4/4145
?? scratchpad/pg-e2e-real/data/base/4/4146
?? scratchpad/pg-e2e-real/data/base/4/4147
?? scratchpad/pg-e2e-real/data/base/4/4148
?? scratchpad/pg-e2e-real/data/base/4/4149
?? scratchpad/pg-e2e-real/data/base/4/4150
?? scratchpad/pg-e2e-real/data/base/4/4151
?? scratchpad/pg-e2e-real/data/base/4/4152
?? scratchpad/pg-e2e-real/data/base/4/4153
?? scratchpad/pg-e2e-real/data/base/4/4154
?? scratchpad/pg-e2e-real/data/base/4/4155
?? scratchpad/pg-e2e-real/data/base/4/4156
?? scratchpad/pg-e2e-real/data/base/4/4157
?? scratchpad/pg-e2e-real/data/base/4/4158
?? scratchpad/pg-e2e-real/data/base/4/4159
?? scratchpad/pg-e2e-real/data/base/4/4160
?? scratchpad/pg-e2e-real/data/base/4/4163
?? scratchpad/pg-e2e-real/data/base/4/4164
?? scratchpad/pg-e2e-real/data/base/4/4165
?? scratchpad/pg-e2e-real/data/base/4/4166
?? scratchpad/pg-e2e-real/data/base/4/4167
?? scratchpad/pg-e2e-real/data/base/4/4168
?? scratchpad/pg-e2e-real/data/base/4/4169
?? scratchpad/pg-e2e-real/data/base/4/4170
?? scratchpad/pg-e2e-real/data/base/4/4171
?? scratchpad/pg-e2e-real/data/base/4/4172
?? scratchpad/pg-e2e-real/data/base/4/4173
?? scratchpad/pg-e2e-real/data/base/4/4174
?? scratchpad/pg-e2e-real/data/base/4/5002
?? scratchpad/pg-e2e-real/data/base/4/548
?? scratchpad/pg-e2e-real/data/base/4/549
?? scratchpad/pg-e2e-real/data/base/4/6102
?? scratchpad/pg-e2e-real/data/base/4/6104
?? scratchpad/pg-e2e-real/data/base/4/6106
?? scratchpad/pg-e2e-real/data/base/4/6110
?? scratchpad/pg-e2e-real/data/base/4/6111
?? scratchpad/pg-e2e-real/data/base/4/6112
?? scratchpad/pg-e2e-real/data/base/4/6113
?? scratchpad/pg-e2e-real/data/base/4/6116
?? scratchpad/pg-e2e-real/data/base/4/6117
?? scratchpad/pg-e2e-real/data/base/4/6175
?? scratchpad/pg-e2e-real/data/base/4/6176
?? scratchpad/pg-e2e-real/data/base/4/6228
?? scratchpad/pg-e2e-real/data/base/4/6229
?? scratchpad/pg-e2e-real/data/base/4/6237
?? scratchpad/pg-e2e-real/data/base/4/6238
?? scratchpad/pg-e2e-real/data/base/4/6239
?? scratchpad/pg-e2e-real/data/base/4/826
?? scratchpad/pg-e2e-real/data/base/4/827
?? scratchpad/pg-e2e-real/data/base/4/828
?? scratchpad/pg-e2e-real/data/base/4/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/4/pg_filenode.map
?? scratchpad/pg-e2e-real/data/base/5/112
?? scratchpad/pg-e2e-real/data/base/5/113
?? scratchpad/pg-e2e-real/data/base/5/1247
?? scratchpad/pg-e2e-real/data/base/5/1247_fsm
?? scratchpad/pg-e2e-real/data/base/5/1247_vm
?? scratchpad/pg-e2e-real/data/base/5/1249
?? scratchpad/pg-e2e-real/data/base/5/1249_fsm
?? scratchpad/pg-e2e-real/data/base/5/1249_vm
?? scratchpad/pg-e2e-real/data/base/5/1255
?? scratchpad/pg-e2e-real/data/base/5/1255_fsm
?? scratchpad/pg-e2e-real/data/base/5/1255_vm
?? scratchpad/pg-e2e-real/data/base/5/1259
?? scratchpad/pg-e2e-real/data/base/5/1259_fsm
?? scratchpad/pg-e2e-real/data/base/5/1259_vm
?? scratchpad/pg-e2e-real/data/base/5/13838
?? scratchpad/pg-e2e-real/data/base/5/13838_fsm
?? scratchpad/pg-e2e-real/data/base/5/13838_vm
?? scratchpad/pg-e2e-real/data/base/5/13841
?? scratchpad/pg-e2e-real/data/base/5/13842
?? scratchpad/pg-e2e-real/data/base/5/13843
?? scratchpad/pg-e2e-real/data/base/5/13843_fsm
?? scratchpad/pg-e2e-real/data/base/5/13843_vm
?? scratchpad/pg-e2e-real/data/base/5/13846
?? scratchpad/pg-e2e-real/data/base/5/13847
?? scratchpad/pg-e2e-real/data/base/5/13848
?? scratchpad/pg-e2e-real/data/base/5/13848_fsm
?? scratchpad/pg-e2e-real/data/base/5/13848_vm
?? scratchpad/pg-e2e-real/data/base/5/13851
?? scratchpad/pg-e2e-real/data/base/5/13852
?? scratchpad/pg-e2e-real/data/base/5/13853
?? scratchpad/pg-e2e-real/data/base/5/13853_fsm
?? scratchpad/pg-e2e-real/data/base/5/13853_vm
?? scratchpad/pg-e2e-real/data/base/5/13856
?? scratchpad/pg-e2e-real/data/base/5/13857
?? scratchpad/pg-e2e-real/data/base/5/1417
?? scratchpad/pg-e2e-real/data/base/5/1418
?? scratchpad/pg-e2e-real/data/base/5/174
?? scratchpad/pg-e2e-real/data/base/5/175
?? scratchpad/pg-e2e-real/data/base/5/2187
?? scratchpad/pg-e2e-real/data/base/5/2224
?? scratchpad/pg-e2e-real/data/base/5/2228
?? scratchpad/pg-e2e-real/data/base/5/2328
?? scratchpad/pg-e2e-real/data/base/5/2336
?? scratchpad/pg-e2e-real/data/base/5/2337
?? scratchpad/pg-e2e-real/data/base/5/2579
?? scratchpad/pg-e2e-real/data/base/5/2600
?? scratchpad/pg-e2e-real/data/base/5/2600_fsm
?? scratchpad/pg-e2e-real/data/base/5/2600_vm
?? scratchpad/pg-e2e-real/data/base/5/2601
?? scratchpad/pg-e2e-real/data/base/5/2601_fsm
?? scratchpad/pg-e2e-real/data/base/5/2601_vm
?? scratchpad/pg-e2e-real/data/base/5/2602
?? scratchpad/pg-e2e-real/data/base/5/2602_fsm
?? scratchpad/pg-e2e-real/data/base/5/2602_vm
?? scratchpad/pg-e2e-real/data/base/5/2603
?? scratchpad/pg-e2e-real/data/base/5/2603_fsm
?? scratchpad/pg-e2e-real/data/base/5/2603_vm
?? scratchpad/pg-e2e-real/data/base/5/2604
?? scratchpad/pg-e2e-real/data/base/5/2605
?? scratchpad/pg-e2e-real/data/base/5/2605_fsm
?? scratchpad/pg-e2e-real/data/base/5/2605_vm
?? scratchpad/pg-e2e-real/data/base/5/2606
?? scratchpad/pg-e2e-real/data/base/5/2606_fsm
?? scratchpad/pg-e2e-real/data/base/5/2606_vm
?? scratchpad/pg-e2e-real/data/base/5/2607
?? scratchpad/pg-e2e-real/data/base/5/2607_fsm
?? scratchpad/pg-e2e-real/data/base/5/2607_vm
?? scratchpad/pg-e2e-real/data/base/5/2608
?? scratchpad/pg-e2e-real/data/base/5/2608_fsm
?? scratchpad/pg-e2e-real/data/base/5/2608_vm
?? scratchpad/pg-e2e-real/data/base/5/2609
?? scratchpad/pg-e2e-real/data/base/5/2609_fsm
?? scratchpad/pg-e2e-real/data/base/5/2609_vm
?? scratchpad/pg-e2e-real/data/base/5/2610
?? scratchpad/pg-e2e-real/data/base/5/2610_fsm
?? scratchpad/pg-e2e-real/data/base/5/2610_vm
?? scratchpad/pg-e2e-real/data/base/5/2611
?? scratchpad/pg-e2e-real/data/base/5/2612
?? scratchpad/pg-e2e-real/data/base/5/2612_fsm
?? scratchpad/pg-e2e-real/data/base/5/2612_vm
?? scratchpad/pg-e2e-real/data/base/5/2613
?? scratchpad/pg-e2e-real/data/base/5/2615
?? scratchpad/pg-e2e-real/data/base/5/2615_fsm
?? scratchpad/pg-e2e-real/data/base/5/2615_vm
?? scratchpad/pg-e2e-real/data/base/5/2616
?? scratchpad/pg-e2e-real/data/base/5/2616_fsm
?? scratchpad/pg-e2e-real/data/base/5/2616_vm
?? scratchpad/pg-e2e-real/data/base/5/2617
?? scratchpad/pg-e2e-real/data/base/5/2617_fsm
?? scratchpad/pg-e2e-real/data/base/5/2617_vm
?? scratchpad/pg-e2e-real/data/base/5/2618
?? scratchpad/pg-e2e-real/data/base/5/2618_fsm
?? scratchpad/pg-e2e-real/data/base/5/2618_vm
?? scratchpad/pg-e2e-real/data/base/5/2619
?? scratchpad/pg-e2e-real/data/base/5/2619_fsm
?? scratchpad/pg-e2e-real/data/base/5/2619_vm
?? scratchpad/pg-e2e-real/data/base/5/2620
?? scratchpad/pg-e2e-real/data/base/5/2650
?? scratchpad/pg-e2e-real/data/base/5/2651
?? scratchpad/pg-e2e-real/data/base/5/2652
?? scratchpad/pg-e2e-real/data/base/5/2653
?? scratchpad/pg-e2e-real/data/base/5/2654
?? scratchpad/pg-e2e-real/data/base/5/2655
?? scratchpad/pg-e2e-real/data/base/5/2656
?? scratchpad/pg-e2e-real/data/base/5/2657
?? scratchpad/pg-e2e-real/data/base/5/2658
?? scratchpad/pg-e2e-real/data/base/5/2659
?? scratchpad/pg-e2e-real/data/base/5/2660
?? scratchpad/pg-e2e-real/data/base/5/2661
?? scratchpad/pg-e2e-real/data/base/5/2662
?? scratchpad/pg-e2e-real/data/base/5/2663
?? scratchpad/pg-e2e-real/data/base/5/2664
?? scratchpad/pg-e2e-real/data/base/5/2665
?? scratchpad/pg-e2e-real/data/base/5/2666
?? scratchpad/pg-e2e-real/data/base/5/2667
?? scratchpad/pg-e2e-real/data/base/5/2668
?? scratchpad/pg-e2e-real/data/base/5/2669
?? scratchpad/pg-e2e-real/data/base/5/2670
?? scratchpad/pg-e2e-real/data/base/5/2673
?? scratchpad/pg-e2e-real/data/base/5/2674
?? scratchpad/pg-e2e-real/data/base/5/2675
?? scratchpad/pg-e2e-real/data/base/5/2678
?? scratchpad/pg-e2e-real/data/base/5/2679
?? scratchpad/pg-e2e-real/data/base/5/2680
?? scratchpad/pg-e2e-real/data/base/5/2681
?? scratchpad/pg-e2e-real/data/base/5/2682
?? scratchpad/pg-e2e-real/data/base/5/2683
?? scratchpad/pg-e2e-real/data/base/5/2684
?? scratchpad/pg-e2e-real/data/base/5/2685
?? scratchpad/pg-e2e-real/data/base/5/2686
?? scratchpad/pg-e2e-real/data/base/5/2687
?? scratchpad/pg-e2e-real/data/base/5/2688
?? scratchpad/pg-e2e-real/data/base/5/2689
?? scratchpad/pg-e2e-real/data/base/5/2690
?? scratchpad/pg-e2e-real/data/base/5/2691
?? scratchpad/pg-e2e-real/data/base/5/2692
?? scratchpad/pg-e2e-real/data/base/5/2693
?? scratchpad/pg-e2e-real/data/base/5/2696
?? scratchpad/pg-e2e-real/data/base/5/2699
?? scratchpad/pg-e2e-real/data/base/5/2701
?? scratchpad/pg-e2e-real/data/base/5/2702
?? scratchpad/pg-e2e-real/data/base/5/2703
?? scratchpad/pg-e2e-real/data/base/5/2704
?? scratchpad/pg-e2e-real/data/base/5/2753
?? scratchpad/pg-e2e-real/data/base/5/2753_fsm
?? scratchpad/pg-e2e-real/data/base/5/2753_vm
?? scratchpad/pg-e2e-real/data/base/5/2754
?? scratchpad/pg-e2e-real/data/base/5/2755
?? scratchpad/pg-e2e-real/data/base/5/2756
?? scratchpad/pg-e2e-real/data/base/5/2757
?? scratchpad/pg-e2e-real/data/base/5/2830
?? scratchpad/pg-e2e-real/data/base/5/2831
?? scratchpad/pg-e2e-real/data/base/5/2832
?? scratchpad/pg-e2e-real/data/base/5/2833
?? scratchpad/pg-e2e-real/data/base/5/2834
?? scratchpad/pg-e2e-real/data/base/5/2835
?? scratchpad/pg-e2e-real/data/base/5/2836
?? scratchpad/pg-e2e-real/data/base/5/2836_fsm
?? scratchpad/pg-e2e-real/data/base/5/2836_vm
?? scratchpad/pg-e2e-real/data/base/5/2837
?? scratchpad/pg-e2e-real/data/base/5/2838
?? scratchpad/pg-e2e-real/data/base/5/2838_fsm
?? scratchpad/pg-e2e-real/data/base/5/2838_vm
?? scratchpad/pg-e2e-real/data/base/5/2839
?? scratchpad/pg-e2e-real/data/base/5/2840
?? scratchpad/pg-e2e-real/data/base/5/2840_fsm
?? scratchpad/pg-e2e-real/data/base/5/2840_vm
?? scratchpad/pg-e2e-real/data/base/5/2841
?? scratchpad/pg-e2e-real/data/base/5/2995
?? scratchpad/pg-e2e-real/data/base/5/2996
?? scratchpad/pg-e2e-real/data/base/5/3079
?? scratchpad/pg-e2e-real/data/base/5/3079_fsm
?? scratchpad/pg-e2e-real/data/base/5/3079_vm
?? scratchpad/pg-e2e-real/data/base/5/3080
?? scratchpad/pg-e2e-real/data/base/5/3081
?? scratchpad/pg-e2e-real/data/base/5/3085
?? scratchpad/pg-e2e-real/data/base/5/3118
?? scratchpad/pg-e2e-real/data/base/5/3119
?? scratchpad/pg-e2e-real/data/base/5/3164
?? scratchpad/pg-e2e-real/data/base/5/3256
?? scratchpad/pg-e2e-real/data/base/5/3257
?? scratchpad/pg-e2e-real/data/base/5/3258
?? scratchpad/pg-e2e-real/data/base/5/3350
?? scratchpad/pg-e2e-real/data/base/5/3351
?? scratchpad/pg-e2e-real/data/base/5/3379
?? scratchpad/pg-e2e-real/data/base/5/3380
?? scratchpad/pg-e2e-real/data/base/5/3381
?? scratchpad/pg-e2e-real/data/base/5/3394
?? scratchpad/pg-e2e-real/data/base/5/3394_fsm
?? scratchpad/pg-e2e-real/data/base/5/3394_vm
?? scratchpad/pg-e2e-real/data/base/5/3395
?? scratchpad/pg-e2e-real/data/base/5/3429
?? scratchpad/pg-e2e-real/data/base/5/3430
?? scratchpad/pg-e2e-real/data/base/5/3431
?? scratchpad/pg-e2e-real/data/base/5/3433
?? scratchpad/pg-e2e-real/data/base/5/3439
?? scratchpad/pg-e2e-real/data/base/5/3440
?? scratchpad/pg-e2e-real/data/base/5/3455
?? scratchpad/pg-e2e-real/data/base/5/3456
?? scratchpad/pg-e2e-real/data/base/5/3456_fsm
?? scratchpad/pg-e2e-real/data/base/5/3456_vm
?? scratchpad/pg-e2e-real/data/base/5/3466
?? scratchpad/pg-e2e-real/data/base/5/3467
?? scratchpad/pg-e2e-real/data/base/5/3468
?? scratchpad/pg-e2e-real/data/base/5/3501
?? scratchpad/pg-e2e-real/data/base/5/3502
?? scratchpad/pg-e2e-real/data/base/5/3503
?? scratchpad/pg-e2e-real/data/base/5/3534
?? scratchpad/pg-e2e-real/data/base/5/3541
?? scratchpad/pg-e2e-real/data/base/5/3541_fsm
?? scratchpad/pg-e2e-real/data/base/5/3541_vm
?? scratchpad/pg-e2e-real/data/base/5/3542
?? scratchpad/pg-e2e-real/data/base/5/3574
?? scratchpad/pg-e2e-real/data/base/5/3575
?? scratchpad/pg-e2e-real/data/base/5/3576
?? scratchpad/pg-e2e-real/data/base/5/3596
?? scratchpad/pg-e2e-real/data/base/5/3597
?? scratchpad/pg-e2e-real/data/base/5/3598
?? scratchpad/pg-e2e-real/data/base/5/3599
?? scratchpad/pg-e2e-real/data/base/5/3600
?? scratchpad/pg-e2e-real/data/base/5/3600_fsm
?? scratchpad/pg-e2e-real/data/base/5/3600_vm
?? scratchpad/pg-e2e-real/data/base/5/3601
?? scratchpad/pg-e2e-real/data/base/5/3601_fsm
?? scratchpad/pg-e2e-real/data/base/5/3601_vm
?? scratchpad/pg-e2e-real/data/base/5/3602
?? scratchpad/pg-e2e-real/data/base/5/3602_fsm
?? scratchpad/pg-e2e-real/data/base/5/3602_vm
?? scratchpad/pg-e2e-real/data/base/5/3603
?? scratchpad/pg-e2e-real/data/base/5/3603_fsm
?? scratchpad/pg-e2e-real/data/base/5/3603_vm
?? scratchpad/pg-e2e-real/data/base/5/3604
?? scratchpad/pg-e2e-real/data/base/5/3605
?? scratchpad/pg-e2e-real/data/base/5/3606
?? scratchpad/pg-e2e-real/data/base/5/3607
?? scratchpad/pg-e2e-real/data/base/5/3608
?? scratchpad/pg-e2e-real/data/base/5/3609
?? scratchpad/pg-e2e-real/data/base/5/3712
?? scratchpad/pg-e2e-real/data/base/5/3764
?? scratchpad/pg-e2e-real/data/base/5/3764_fsm
?? scratchpad/pg-e2e-real/data/base/5/3764_vm
?? scratchpad/pg-e2e-real/data/base/5/3766
?? scratchpad/pg-e2e-real/data/base/5/3767
?? scratchpad/pg-e2e-real/data/base/5/3997
?? scratchpad/pg-e2e-real/data/base/5/4143
?? scratchpad/pg-e2e-real/data/base/5/4144
?? scratchpad/pg-e2e-real/data/base/5/4145
?? scratchpad/pg-e2e-real/data/base/5/4146
?? scratchpad/pg-e2e-real/data/base/5/4147
?? scratchpad/pg-e2e-real/data/base/5/4148
?? scratchpad/pg-e2e-real/data/base/5/4149
?? scratchpad/pg-e2e-real/data/base/5/4150
?? scratchpad/pg-e2e-real/data/base/5/4151
?? scratchpad/pg-e2e-real/data/base/5/4152
?? scratchpad/pg-e2e-real/data/base/5/4153
?? scratchpad/pg-e2e-real/data/base/5/4154
?? scratchpad/pg-e2e-real/data/base/5/4155
?? scratchpad/pg-e2e-real/data/base/5/4156
?? scratchpad/pg-e2e-real/data/base/5/4157
?? scratchpad/pg-e2e-real/data/base/5/4158
?? scratchpad/pg-e2e-real/data/base/5/4159
?? scratchpad/pg-e2e-real/data/base/5/4160
?? scratchpad/pg-e2e-real/data/base/5/4163
?? scratchpad/pg-e2e-real/data/base/5/4164
?? scratchpad/pg-e2e-real/data/base/5/4165
?? scratchpad/pg-e2e-real/data/base/5/4166
?? scratchpad/pg-e2e-real/data/base/5/4167
?? scratchpad/pg-e2e-real/data/base/5/4168
?? scratchpad/pg-e2e-real/data/base/5/4169
?? scratchpad/pg-e2e-real/data/base/5/4170
?? scratchpad/pg-e2e-real/data/base/5/4171
?? scratchpad/pg-e2e-real/data/base/5/4172
?? scratchpad/pg-e2e-real/data/base/5/4173
?? scratchpad/pg-e2e-real/data/base/5/4174
?? scratchpad/pg-e2e-real/data/base/5/5002
?? scratchpad/pg-e2e-real/data/base/5/548
?? scratchpad/pg-e2e-real/data/base/5/549
?? scratchpad/pg-e2e-real/data/base/5/6102
?? scratchpad/pg-e2e-real/data/base/5/6104
?? scratchpad/pg-e2e-real/data/base/5/6106
?? scratchpad/pg-e2e-real/data/base/5/6110
?? scratchpad/pg-e2e-real/data/base/5/6111
?? scratchpad/pg-e2e-real/data/base/5/6112
?? scratchpad/pg-e2e-real/data/base/5/6113
?? scratchpad/pg-e2e-real/data/base/5/6116
?? scratchpad/pg-e2e-real/data/base/5/6117
?? scratchpad/pg-e2e-real/data/base/5/6175
?? scratchpad/pg-e2e-real/data/base/5/6176
?? scratchpad/pg-e2e-real/data/base/5/6228
?? scratchpad/pg-e2e-real/data/base/5/6229
?? scratchpad/pg-e2e-real/data/base/5/6237
?? scratchpad/pg-e2e-real/data/base/5/6238
?? scratchpad/pg-e2e-real/data/base/5/6239
?? scratchpad/pg-e2e-real/data/base/5/826
?? scratchpad/pg-e2e-real/data/base/5/827
?? scratchpad/pg-e2e-real/data/base/5/828
?? scratchpad/pg-e2e-real/data/base/5/PG_VERSION
?? scratchpad/pg-e2e-real/data/base/5/pg_filenode.map
?? scratchpad/pg-e2e-real/data/global/1213
?? scratchpad/pg-e2e-real/data/global/1213_fsm
?? scratchpad/pg-e2e-real/data/global/1213_vm
?? scratchpad/pg-e2e-real/data/global/1214
?? scratchpad/pg-e2e-real/data/global/1232
?? scratchpad/pg-e2e-real/data/global/1233
?? scratchpad/pg-e2e-real/data/global/1260
?? scratchpad/pg-e2e-real/data/global/1260_fsm
?? scratchpad/pg-e2e-real/data/global/1260_vm
?? scratchpad/pg-e2e-real/data/global/1261
?? scratchpad/pg-e2e-real/data/global/1261_fsm
?? scratchpad/pg-e2e-real/data/global/1261_vm
?? scratchpad/pg-e2e-real/data/global/1262
?? scratchpad/pg-e2e-real/data/global/1262_fsm
?? scratchpad/pg-e2e-real/data/global/1262_vm
?? scratchpad/pg-e2e-real/data/global/2396
?? scratchpad/pg-e2e-real/data/global/2396_fsm
?? scratchpad/pg-e2e-real/data/global/2396_vm
?? scratchpad/pg-e2e-real/data/global/2397
?? scratchpad/pg-e2e-real/data/global/2671
?? scratchpad/pg-e2e-real/data/global/2672
?? scratchpad/pg-e2e-real/data/global/2676
?? scratchpad/pg-e2e-real/data/global/2677
?? scratchpad/pg-e2e-real/data/global/2694
?? scratchpad/pg-e2e-real/data/global/2695
?? scratchpad/pg-e2e-real/data/global/2697
?? scratchpad/pg-e2e-real/data/global/2698
?? scratchpad/pg-e2e-real/data/global/2846
?? scratchpad/pg-e2e-real/data/global/2847
?? scratchpad/pg-e2e-real/data/global/2964
?? scratchpad/pg-e2e-real/data/global/2965
?? scratchpad/pg-e2e-real/data/global/2966
?? scratchpad/pg-e2e-real/data/global/2967
?? scratchpad/pg-e2e-real/data/global/3592
?? scratchpad/pg-e2e-real/data/global/3593
?? scratchpad/pg-e2e-real/data/global/4060
?? scratchpad/pg-e2e-real/data/global/4061
?? scratchpad/pg-e2e-real/data/global/4175
?? scratchpad/pg-e2e-real/data/global/4176
?? scratchpad/pg-e2e-real/data/global/4177
?? scratchpad/pg-e2e-real/data/global/4178
?? scratchpad/pg-e2e-real/data/global/4181
?? scratchpad/pg-e2e-real/data/global/4182
?? scratchpad/pg-e2e-real/data/global/4183
?? scratchpad/pg-e2e-real/data/global/4184
?? scratchpad/pg-e2e-real/data/global/4185
?? scratchpad/pg-e2e-real/data/global/4186
?? scratchpad/pg-e2e-real/data/global/6000
?? scratchpad/pg-e2e-real/data/global/6001
?? scratchpad/pg-e2e-real/data/global/6002
?? scratchpad/pg-e2e-real/data/global/6100
?? scratchpad/pg-e2e-real/data/global/6114
?? scratchpad/pg-e2e-real/data/global/6115
?? scratchpad/pg-e2e-real/data/global/6243
?? scratchpad/pg-e2e-real/data/global/6244
?? scratchpad/pg-e2e-real/data/global/6245
?? scratchpad/pg-e2e-real/data/global/6246
?? scratchpad/pg-e2e-real/data/global/6247
?? scratchpad/pg-e2e-real/data/global/pg_control
?? scratchpad/pg-e2e-real/data/global/pg_filenode.map
?? scratchpad/pg-e2e-real/data/pg_hba.conf
?? scratchpad/pg-e2e-real/data/pg_ident.conf
?? scratchpad/pg-e2e-real/data/pg_logical/replorigin_checkpoint
?? scratchpad/pg-e2e-real/data/pg_multixact/members/0000
?? scratchpad/pg-e2e-real/data/pg_multixact/offsets/0000
?? scratchpad/pg-e2e-real/data/pg_stat/pgstat.stat
?? scratchpad/pg-e2e-real/data/pg_subtrans/0000
?? scratchpad/pg-e2e-real/data/pg_wal/000000010000000000000001
?? scratchpad/pg-e2e-real/data/pg_xact/0000
?? scratchpad/pg-e2e-real/data/postgresql.auto.conf
?? scratchpad/pg-e2e-real/data/postgresql.conf
?? scratchpad/pg-e2e-real/initdb.log
?? scratchpad/pg-e2e-real/seed_manifest.json
?? scratchpad/pg-e2e-real/serve.log
?? scratchpad/pg-e2e-real/uvicorn.log
?? scratchpad/pr3.diff
?? scratchpad/pr7.diff
?? scratchpad/pr8.diff
?? series-order-compression-followups-review-packet.md
?? series-order-operator-compression-review-packet.md
?? series-order-operator-compression-review-r1.md
?? smoke-test.js

exec
/bin/zsh -lc "git status --short -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md VISION.md play-for-good-gap-map-v1.md && git diff --no-ext-diff --quiet -- play-for-good-stage0-island-off-tz.md play-for-good-stage1-mission-slice-tz.md VISION.md play-for-good-gap-map-v1.md; printf '%s\\n' \""'$?"' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
0

exec
/bin/zsh -lc "find . -maxdepth 1 -type f -name 'play-for-good-tz-review-r*-disposition.md' -print | sort" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
./play-for-good-tz-review-r3-disposition.md
./play-for-good-tz-review-r4-disposition.md

exec
/bin/zsh -lc "find . -maxdepth 1 -type f -name 'play-for-good-tz-review-r*' -print | sort" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
./play-for-good-tz-review-r3-disposition.md
./play-for-good-tz-review-r3-prompt.md
./play-for-good-tz-review-r3-raw.md
./play-for-good-tz-review-r4-disposition.md
./play-for-good-tz-review-r4-prompt.md
./play-for-good-tz-review-r4-raw.md
./play-for-good-tz-review-r5-prompt.md
./play-for-good-tz-review-r5-raw.md

exec
/bin/zsh -lc 'nl -ba play-for-good-tz-review-r3-disposition.md' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
     1	# Disposition R3 (автономная петля codex exec, 30.07.2026)
     2	
     3	Раунд: R3, первый автономный (bundled codex-cli 0.146.0-alpha.3.1,
     4	`codex exec -s read-only`, промпт пинит SHA `4738103`; попытка
     5	`codex review --commit <sha> - < prompt` отклонена CLI — в этой версии
     6	`--commit` взаимоисключён с кастомным промптом; отклонение от
     7	предложенного протокола зафиксировано). Сырой ответ целиком:
     8	`play-for-good-tz-review-r3-raw.md` (финальный вердикт — в конце).
     9	
    10	| # | Finding | Disposition |
    11	|---|---------|-------------|
    12	| 1 | [P1] artifact-url отнесён к legacy, хотя это closed-delivery resolver (`api_island_social.py:159`); LEGACY_SURFACE=false требовал бы 404 при smoke, требующем signed GET | **Принято.** Контур (b) теперь явно включает artifact-url; факт-состояние и smoke исправлены (Stage 0 v4) |
    13	| 2 | [P1] Потерян пользовательский block: report сохранён, `/island/friends/{user_id}/block` — нет; `island_friend_blocks` во freeze без allowlist | **Принято.** Контур (c) = report И block; `island_friend_blocks` выведен из freeze-списка в allowlist защитных writes с audit-receipts (Stage 0 v4) |
    14	| 3 | [P1] UNIQUE(case_id, kind) допускает READY на v1 / UNLOCKED на v3 — версия не закреплена вдоль цепочки | **Принято.** Новая `mission_case_bindings` (case_id PK ↔ ровно одна contract_version, создаётся при ready, новая версия = новый case_id); все таблицы composite-FK на bindings — расхождение исключено схемой; негативный тест добавлен (Stage 1 v4) |
    15	| 4 | [P2] `pool_cursor` невоспроизводим: у ledger нет монотонного порядка и правила eligible-at-cursor | **Принято.** `ledger.seq` BIGSERIAL, строки immutable и вставляются только settled; cursor = max seq на снапшоте; eligible = seq ≤ cursor; поздние строки в прошлый снапшот не входят by construction (Stage 1 v4) |
    16	
    17	Authority-эскалаций нет: ни одна находка не требует правок VISION,
    18	прод-флагов или денег. Следующий раунд R4 — той же петлёй по новому
    19	коммиту.

exec
/bin/zsh -lc "grep -RIn --exclude-dir=node_modules --exclude-dir=.git -E 'daily.*claim|claim.*daily|DailyQuest|result-outbox|pending.*result' feed-prototype/src swipe-backend/app | head -n 120" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 162ms:
feed-prototype/src/outbox.ts:25:const LEGACY_KEY = 'swipe_pending_results_v1';
feed-prototype/src/outbox.ts:27:const KEY = 'swipe_pending_results_v2';
feed-prototype/src/outbox.ts:302:/** Retry pending results in order; drop each once the server confirms. Stops at
feed-prototype/src/styles.css:892:/* "!" attention badge on a bottom-bar tab (daily rewards ready to claim, island
feed-prototype/src/styles.css:3518:.daily-panel__claim {
feed-prototype/src/styles.css:3527:.daily-panel__claim:disabled {
feed-prototype/src/island.ts:1312:.isl-candidates{display:grid;gap:8px}.isl-candidate{width:100%;display:block;text-align:left;border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:0 0 10px;overflow:hidden;background:rgba(255,255,255,.045);color:#fff}.isl-candidate--ready{border-color:rgba(143,216,194,.48)}.isl-candidate[role=button]{cursor:pointer}.isl-candidate[role=button]:focus-visible{outline:2px solid #8FD8C2;outline-offset:2px}.isl-candidate__media{position:relative;height:112px;overflow:hidden;background:#090d12}.isl-candidate__media--capture{height:168px}.isl-candidate__media svg{width:100%;height:100%;object-fit:cover}.isl-candidate__media--pending{display:flex;align-items:center;justify-content:center;gap:7px}.isl-candidate__media--pending b{width:7px;height:7px;border-radius:50%;background:#EF9F27;animation:isl-puls 1.2s ease-in-out infinite}.isl-candidate__media--pending b:nth-child(2){animation-delay:.18s}.isl-candidate__media--pending b:nth-child(3){animation-delay:.36s}.isl-candidate__media [data-real-cover],.isl-board [data-real-cover]{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;background:#090d12}.isl-candidate__head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 11px 0}.isl-candidate__head>span{display:flex;align-items:center;gap:7px}.isl-candidate__head em{font-style:normal;font-size:8px;font-weight:900;color:#8FD8C2;border:1px solid rgba(143,216,194,.35);padding:3px 5px;border-radius:4px}.isl-candidate__head b{font-size:12.5px}.isl-candidate__head>i{font-style:normal;font-size:8px;font-weight:900;color:#F2B33D;max-width:42%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.isl-candidate__detail{display:block;padding:6px 11px 0;font-size:10.5px;line-height:1.35;color:rgba(255,255,255,.58)}.isl-candidate__actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:9px 11px 0}.isl-candidate__actions--three{grid-template-columns:repeat(3,minmax(0,1fr))}.isl-candidate__actions button{min-width:0;min-height:34px;border:1px solid rgba(255,255,255,.16);border-radius:7px;background:rgba(255,255,255,.07);color:#fff;font:800 11px/1 system-ui,sans-serif}.isl-candidate__actions button[data-keep]{background:#fff;color:#101720;border-color:#fff}.isl-candidate__result{color:#8FD8C2}.isl-progressmeta{display:flex;justify-content:space-between;gap:12px;margin:10px 0;font-size:11px;color:rgba(255,255,255,.62)}.isl-progressmeta b{color:#fff}.isl-progresslog{max-height:148px;overflow:auto;border-top:1px solid rgba(255,255,255,.1);padding-top:8px;margin-top:10px}.isl-progresslog div{font:10px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;color:rgba(255,255,255,.56);margin-bottom:5px}.isl-progresslog b{color:#8FD8C2;font-weight:800}
feed-prototype/src/debug.ts:4: * pending-results outbox or reset your own server state. QA tool; no-op unless
feed-prototype/src/debug.ts:84:      pending_results: pendingCount(),
feed-prototype/src/api.ts:728:export interface DailyQuestView {
feed-prototype/src/api.ts:743:  quests: DailyQuestView[];
feed-prototype/src/api.ts:758:/** Claim the daily quest reward. Keeps the failure KIND. The optimistic claim path has to
feed-prototype/src/api.ts:770:    '/api/daily/claim',
feed-prototype/src/control-plane-outbox.mjs:100:    if (this._state.pending.length === 0) return result('empty', 0, 0, 0, this);
feed-prototype/src/feed.ts:329:// Backoff for an optimistic daily claim whose response was lost. The endpoint is
feed-prototype/src/feed.ts:2819:    const ready = !!this.dailyState?.quests.some((quest) => quest.completed && !quest.claimed);
feed-prototype/src/feed.ts:2961:      btn.className = 'daily-panel__claim';
feed-prototype/src/feed.ts:2962:      const claiming = this.dailyClaiming.has(quest.id);
feed-prototype/src/feed.ts:2970:        void this.claimDailyQuest(quest.id, btn, reward);
feed-prototype/src/feed.ts:3007:  private async claimDailyQuest(
swipe-backend/app/api_dev.py:21:    DailyQuest,
swipe-backend/app/api_dev.py:51:    db.execute(delete(DailyQuest).where(DailyQuest.user_id == uid))
swipe-backend/app/api_dev.py:87:    claim_prefix = f"daily:{caller.id}:{day.isoformat()}:%"
swipe-backend/app/api_dev.py:102:        delete(DailyQuest).where(DailyQuest.user_id == caller.id, DailyQuest.day == day)
swipe-backend/app/config.py:399:    island_bot_daily_claims_cap: int = 200
swipe-backend/app/config.py:400:    # Per (bot, player) claims a daily plan may schedule (§2.4: 1..3).
swipe-backend/app/models.py:354:class DailyQuest(Base):
swipe-backend/app/api_daily.py:12:from .models import DailyQuest
swipe-backend/app/api_daily.py:52:@router.post("/daily/claim")
swipe-backend/app/api_daily.py:53:def post_daily_claim(
swipe-backend/app/api_daily.py:62:        select(DailyQuest)
swipe-backend/app/api_daily.py:63:        .where(DailyQuest.user_id == caller.id, DailyQuest.day == day, DailyQuest.quest_id == body.quest_id)
swipe-backend/app/island_bots.py:361:        "dailyClaimsCap": int(settings.island_bot_daily_claims_cap),
swipe-backend/app/island_bots.py:632:    cap = int(settings.island_bot_daily_claims_cap)
swipe-backend/app/daily.py:15:from .models import DailyQuest, PuzzleLedger
swipe-backend/app/daily.py:19:class DailyQuestSpec:
swipe-backend/app/daily.py:26:DAILY_QUESTS: tuple[DailyQuestSpec, ...] = (
swipe-backend/app/daily.py:27:    DailyQuestSpec("login", "Зайди в игру", 1, 5),
swipe-backend/app/daily.py:28:    DailyQuestSpec("levels_10", "Пройди 10 уровней", 10, 10),
swipe-backend/app/daily.py:29:    DailyQuestSpec("stars_50", "Заработай 50 звезд", 50, 20),
swipe-backend/app/daily.py:57:            pg_insert(DailyQuest)
swipe-backend/app/daily.py:91:        update(DailyQuest)
swipe-backend/app/daily.py:93:            DailyQuest.user_id == user_id,
swipe-backend/app/daily.py:94:            DailyQuest.day == day,
swipe-backend/app/daily.py:95:            DailyQuest.quest_id == quest_id,
swipe-backend/app/daily.py:98:            progress=func.least(DailyQuest.target, DailyQuest.progress + int(amount)),
swipe-backend/app/daily.py:142:            select(DailyQuest).where(DailyQuest.user_id == user_id, DailyQuest.day == day)

exec
/bin/zsh -lc "nl -ba feed-prototype/src/feed.ts | sed -n '3000,3105p' && nl -ba feed-prototype/src/api.ts | sed -n '750,785p' && nl -ba swipe-backend/app/api_daily.py | sed -n '45,105p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
  3000	  // in the same tick as the tap, and the claim request runs in parallel with the
  3001	  // animation instead of gating it. The server stays the only authority over the
  3002	  // balance — its answer is a reconcile, not the trigger:
  3003	  //   • success            → adopt the server state/balance silently;
  3004	  //   • determined refusal → undo the local delta and re-render from the server;
  3005	  //   • lost response      → keep the optimistic state and retry (the claim is
  3006	  //                          idempotent by quest id, see apiDailyClaimRequired).
  3007	  private async claimDailyQuest(
  3008	    questId: string,
  3009	    button: HTMLButtonElement,
  3010	    rewardEl: HTMLElement,
  3011	  ): Promise<void> {
  3012	    if (this.dailyClaiming.has(questId)) return;
  3013	    const before = this.dailyState?.quests.find((q) => q.id === questId);
  3014	    const reward = before && before.completed && !before.claimed ? before.reward_puzzles : 0;
  3015	    if (reward <= 0) return;
  3016	    const puzzleBalanceBeforeClaim = this.totalPuzzles;
  3017	    const sourceIcon = rewardEl.querySelector<HTMLElement>('img') ?? rewardEl;
  3018	    const sourceRect = sourceIcon.getBoundingClientRect();
  3019	    const viewportRect = this.viewport.getBoundingClientRect();
  3020	    const origin = {
  3021	      x: sourceRect.left - viewportRect.left + sourceRect.width / 2,
  3022	      y: sourceRect.top - viewportRect.top + sourceRect.height / 2,
  3023	    };
  3024	    // Double-tap stays impossible on two independent locks: the in-flight set AND
  3025	    // the optimistic `claimed` flag (which makes `reward` 0 on a second entry).
  3026	    this.dailyClaiming.add(questId);
  3027	    button.disabled = true;
  3028	    button.textContent = 'Получено';
  3029	    if (before) before.claimed = true;
  3030	    this.updateDailyNavAlert();
  3031	
  3032	    let animationDone = false;
  3033	    let deferredReconcile: (() => void) | null = null;
  3034	    // The server answer may land while pieces are still in flight; hold it until
  3035	    // the animation has finished so the counter keeps its landing cadence and the
  3036	    // correction is invisible.
  3037	    const reconcile = (apply: () => void) => {
  3038	      if (animationDone) apply();
  3039	      else deferredReconcile = apply;
  3040	    };
  3041	
  3042	    // Started BEFORE the animation, not after it: the request and the reward fly
  3043	    // together, so the player never waits for the round trip.
  3044	    void this.sendDailyClaim(questId, reward, reconcile);
  3045	
  3046	    this.launchDailyPuzzleReward(rewardEl, origin, reward, puzzleBalanceBeforeClaim + reward, () => {
  3047	      animationDone = true;
  3048	      const pending = deferredReconcile;
  3049	      deferredReconcile = null;
  3050	      if (pending) pending();
  3051	      else this.renderDailyPanel();
  3052	    });
  3053	  }
  3054	
  3055	  private async sendDailyClaim(
  3056	    questId: string,
  3057	    reward: number,
  3058	    reconcile: (apply: () => void) => void,
  3059	  ): Promise<void> {
  3060	    try {
  3061	      const state = await apiDailyClaimRequired(questId);
  3062	      reconcile(() => {
  3063	        this.dailyClaiming.delete(questId);
  3064	        this.dailyState = state;
  3065	        this.applyServerPuzzles(state.puzzle_balance);
  3066	        this.renderDailyPanel();
  3067	        this.updateDailyNavAlert();
  3068	      });
  3069	    } catch (error) {
  3070	      const status = error instanceof ApiRequestError ? error.status : 0;
  3071	      const refused = status >= 400 && status < 500;
  3072	      if (!refused) {
  3073	        // Network / timeout / server fault: nothing is known about the claim, so
  3074	        // the optimistic state stays and the idempotent claim is retried in the
  3075	        // background. If every attempt fails the next /daily/sync reconciles.
  3076	        this.dailyClaiming.delete(questId);
  3077	        this.scheduleDailyClaimRetry(questId, reward);
  3078	        return;
  3079	      }
  3080	      reconcile(() => {
  3081	        this.dailyClaiming.delete(questId);
  3082	        // The server said no. Take the optimistic reward back and re-render from
  3083	        // the server — no rollback animation, just an honest counter and a line
  3084	        // of text about what happened.
  3085	        this.rollbackOptimisticPuzzles(reward);
  3086	        this.showActivityNotifier(this.dailyClaimRefusalText(error));
  3087	        void this.syncDaily(false);
  3088	      });
  3089	    }
  3090	  }
  3091	
  3092	  private dailyClaimRefusalText(error: unknown): string {
  3093	    const status = error instanceof ApiRequestError ? error.status : 0;
  3094	    if (status === 409) return 'Задание ещё не выполнено';
  3095	    if (status === 404) return 'Задание обновилось — награда недоступна';
  3096	    return 'Не удалось забрать награду';
  3097	  }
  3098	
  3099	  /** Silently take back a local reward the server refused. The counter is
  3100	   *  corrected, never animated backwards. */
  3101	  private rollbackOptimisticPuzzles(amount: number): void {
  3102	    const next = Math.max(0, this.totalPuzzles - Math.max(0, Math.round(amount)));
  3103	    if (next === this.totalPuzzles) return;
  3104	    this.totalPuzzles = next;
  3105	    this.updatePuzzleCounter();
   750	export function currentTzOffsetMinutes(): number {
   751	  return tzOffsetMinutes();
   752	}
   753	
   754	export function apiDailySync(): Promise<DailyStateResp | null> {
   755	  return post<DailyStateResp>('/api/daily/sync', { tz_offset_minutes: tzOffsetMinutes() });
   756	}
   757	
   758	/** Claim the daily quest reward. Keeps the failure KIND. The optimistic claim path has to
   759	 *  tell a determined server refusal (4xx — not complete / unknown quest) apart
   760	 *  from a lost response (network, timeout, 5xx): the first rolls the optimistic
   761	 *  reward back, the second keeps it and retries. `post()` collapses both to
   762	 *  `null`, so it cannot drive that decision.
   763	 *
   764	 *  The backend claim is idempotent by `quest_id`: an already-claimed quest is a
   765	 *  no-op that returns the same state, and the puzzle award carries the
   766	 *  `daily:<user>:<day>:<quest>` idempotency key — so a retry can never pay
   767	 *  twice. */
   768	export function apiDailyClaimRequired(questId: string): Promise<DailyStateResp> {
   769	  return postRequired<DailyStateResp>(
   770	    '/api/daily/claim',
   771	    { quest_id: questId, tz_offset_minutes: tzOffsetMinutes() },
   772	    OUTBOX_REQUIRED_REQUEST_TIMEOUT_MS,
   773	  );
   774	}
   775	
   776	/** QA only: begin a fresh daily cycle while preserving already-earned puzzles. */
   777	export function apiResetDaily(): Promise<(DailyStateResp & { ok: boolean }) | null> {
   778	  return post<DailyStateResp & { ok: boolean }>('/api/reset-daily', { tz_offset_minutes: tzOffsetMinutes() });
   779	}
   780	
   781	// ── Challenges (W2) ─────────────────────────────────────────────────────────
   782	// "Beat my time?" — metric is solve time (ms), lower is better (server-authoritative).
   783	
   784	export interface ChallengeChallenger {
   785	  id: number;
    45	    get_or_create_user(db, caller)
    46	    touch_login_daily(db, user_id=caller.id, tz_offset_minutes=body.tz_offset_minutes)
    47	    payload = daily_state_payload(db, user_id=caller.id, tz_offset_minutes=body.tz_offset_minutes)
    48	    db.commit()
    49	    return payload
    50	
    51	
    52	@router.post("/daily/claim")
    53	def post_daily_claim(
    54	    body: DailyClaimIn,
    55	    caller: TmaUser = Depends(require_tma_user),
    56	    db: Session = Depends(get_db),
    57	) -> dict:
    58	    get_or_create_user(db, caller)
    59	    day, _, _ = daily_window(body.tz_offset_minutes)
    60	    ensure_daily_quests(db, caller.id, day)
    61	    row = db.execute(
    62	        select(DailyQuest)
    63	        .where(DailyQuest.user_id == caller.id, DailyQuest.day == day, DailyQuest.quest_id == body.quest_id)
    64	        .with_for_update()
    65	    ).scalar_one_or_none()
    66	    if row is None:
    67	        raise HTTPException(status_code=404, detail="daily quest not found")
    68	    if row.progress < row.target:
    69	        raise HTTPException(status_code=409, detail="daily quest is not complete")
    70	    if not row.claimed:
    71	        row.claimed = True
    72	        award_puzzles(
    73	            db,
    74	            user_id=caller.id,
    75	            reason="daily_quest",
    76	            puzzles=row.reward_puzzles,
    77	            idempotency_key=f"daily:{caller.id}:{day.isoformat()}:{row.quest_id}",
    78	            meta={"quest_id": row.quest_id, "day": day.isoformat()},
    79	        )
    80	    payload = daily_state_payload(db, user_id=caller.id, tz_offset_minutes=body.tz_offset_minutes)
    81	    db.commit()
    82	    return payload

exec
/bin/zsh -lc "git log -1 --format='%H %s' -- VISION.md && git log -1 --format='%H %s' -- play-for-good-gap-map-v1.md && git show f86c489523977dcca8d3959e73e9bcfb9f556c9e:VISION.md | sha256sum && sha256sum VISION.md && git show f86c489523977dcca8d3959e73e9bcfb9f556c9e:play-for-good-gap-map-v1.md | sha256sum && sha256sum play-for-good-gap-map-v1.md" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 617ms:
e54ee50f2959faba03a2d6fa970033ae0474cc053869d5c178ea52ce6fb63da9  -
e54ee50f2959faba03a2d6fa970033ae0474cc053869d5c178ea52ce6fb63da9  VISION.md
fbd0ba551e1aa900162f0dc6c85901ea3f412a14781d4e64f910b426c1d014b9  -
fbd0ba551e1aa900162f0dc6c85901ea3f412a14781d4e64f910b426c1d014b9  play-for-good-gap-map-v1.md

SHA и commit-content подтверждены; target/VISION/gap-map не имеют локальных tracked-отклонений. Diff v4→v5 и authoritative документы прочитаны, три R4-группы трассированы.
  ✓ Определить diff коммита и точные версии/пути четырёх документов
  ✓ Проверить внесение трёх групп findings R4 в двух v5-документах
  → Сверить контрактную целостность с VISION.md и gap map, проверить новые противоречия
  • Сформировать findings с точными строками либо вердикт GO
exec
/bin/zsh -lc 'git -C swipe-backend rev-parse HEAD && git -C swipe-backend status --short -- app/api_island_p2.py app/api_island_social.py app/main.py' in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
6a526ac9950de650947e162ab5bd2239e1094474

exec
/bin/zsh -lc "grep -RIn --exclude-dir=__pycache__ -E '@router\\.(post|put).*report|def .*report|IslandReport\\(' swipe-backend/app/api_island* | head -n 40 && grep -RIn --exclude-dir=__pycache__ -E 'IslandMetaEvent|_record_event\\(' swipe-backend/app/api_island_moderation.py swipe-backend/app/api_island_p2.py | head -n 80" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
swipe-backend/app/api_island_moderation.py:116:def _report_counts(db: Session, building_id: uuid.UUID) -> dict:
swipe-backend/app/api_island_moderation.py:147:def _report_view(report: IslandReport) -> dict:
swipe-backend/app/api_island_moderation.py:157:@router.post("/island/buildings/{building_id}/report")
swipe-backend/app/api_island_moderation.py:158:def island_report(
swipe-backend/app/api_island_moderation.py:204:    report = IslandReport(
swipe-backend/app/api_island_moderation.py:337:def _report_admin_view(db: Session, report: IslandReport) -> dict:
swipe-backend/app/api_island_moderation.py:355:def moderation_reports(
swipe-backend/app/api_island_moderation.py:507:@router.post("/island/moderation/reports/{report_id}/resolve")
swipe-backend/app/api_island_moderation.py:508:def moderation_resolve_report(
swipe-backend/app/api_island_moderation.py:49:    IslandMetaEvent,
swipe-backend/app/api_island_moderation.py:73:def _record_event(db: Session, *, user_id: int | None, event_type: str, payload: dict | None) -> None:
swipe-backend/app/api_island_moderation.py:74:    db.add(IslandMetaEvent(user_id=user_id, type=event_type, payload=payload))
swipe-backend/app/api_island_moderation.py:214:    _record_event(
swipe-backend/app/api_island_moderation.py:451:    _record_event(
swipe-backend/app/api_island_p2.py:285:            _record_event(
swipe-backend/app/api_island_p2.py:301:            _record_event(
swipe-backend/app/api_island_p2.py:386:    _record_event(
swipe-backend/app/api_island_p2.py:444:    _record_event(
swipe-backend/app/api_island_p2.py:494:    _record_event(

exec
/bin/zsh -lc "nl -ba swipe-backend/app/api_island_moderation.py | sed -n '150,225p' && nl -ba swipe-backend/app/api_island_moderation.py | sed -n '430,465p' && nl -ba swipe-backend/app/api_island_moderation.py | sed -n '500,550p'" in /Users/gleb/My projects/p4g-platform-workspace
 succeeded in 0ms:
   150	        "building_id": str(report.building_id),
   151	        "reason": report.reason,
   152	        "status": report.status,
   153	        "created_at": report.created_at.isoformat() if report.created_at else None,
   154	    }
   155	
   156	
   157	@router.post("/island/buildings/{building_id}/report")
   158	def island_report(
   159	    building_id: uuid.UUID,
   160	    body: IslandReportIn,
   161	    caller: TmaUser = Depends(require_tma_user),
   162	    db: Session = Depends(get_db),
   163	) -> dict:
   164	    get_or_create_user(db, caller)
   165	    social = db.get(IslandBuildingSocial, building_id)
   166	    if social is None:
   167	        raise HTTPException(status_code=404, detail="island building not found")
   168	    if int(social.owner_id) == caller.id:
   169	        raise HTTPException(status_code=403, detail="owners cannot report their own building")
   170	    # A block hides the building in both directions — same 404 as a missing one.
   171	    if blocked_between(db, caller.id, int(social.owner_id)):
   172	        raise HTTPException(status_code=404, detail="island building not found")
   173	
   174	    # Dedup by UNIQUE(building_id, reporter_id): a repeat report returns the saved
   175	    # row (200) with no new side effect and no rate-limit consumption.
   176	    existing = db.execute(
   177	        select(IslandReport).where(
   178	            IslandReport.building_id == building_id,
   179	            IslandReport.reporter_id == caller.id,
   180	        )
   181	    ).scalar_one_or_none()
   182	    if existing is not None:
   183	        return _report_view(existing)
   184	
   185	    # Pin the exact artifact revision at report time (F011). Only public,
   186	    # non-taken-down UGC (a hosted rel) is reportable; a bot builtin has no
   187	    # artifact to moderate.
   188	    _, _, building, _ = current_island_building(
   189	        db, owner_id=int(social.owner_id), building_id=building_id, viewer_id=caller.id
   190	    )
   191	    if building.publishing or not _is_public_artifact(int(social.owner_id), building) or not building.rel:
   192	        raise HTTPException(status_code=404, detail="published island building not found")
   193	    if is_taken_down(db, building_id):
   194	        raise HTTPException(status_code=404, detail="published island building not found")
   195	
   196	    s = get_settings()
   197	    consume_limit(
   198	        db,
   199	        user_id=caller.id,
   200	        scope="island-report:day",
   201	        limit=int(s.island_report_daily_limit),
   202	        window_seconds=86_400,
   203	    )
   204	    report = IslandReport(
   205	        id=uuid.uuid4(),
   206	        building_id=building_id,
   207	        artifact_rel=building.rel,
   208	        reporter_id=caller.id,
   209	        reason=body.reason,
   210	        text=body.text,
   211	        status="open",
   212	    )
   213	    db.add(report)
   214	    _record_event(
   215	        db,
   216	        user_id=caller.id,
   217	        event_type="report_created",
   218	        payload={"building_id": str(building_id), "reason": body.reason},
   219	    )
   220	    try:
   221	        db.commit()
   222	    except IntegrityError:
   223	        # A concurrent first report from the same reporter won the UNIQUE race —
   224	        # return the committed row (the rate-limit slot consumed above is a benign
   225	        # over-count on a genuinely simultaneous double submit).
   430	    # newer artifact.
   431	    if building.rel != body.artifact_rel:
   432	        raise HTTPException(
   433	            status_code=409,
   434	            detail={"code": "artifact_revision_mismatch", "current_rel": building.rel},
   435	        )
   436	    # Idempotent repeat: already down for this exact revision → no duplicate receipt.
   437	    if is_taken_down(db, body.building_id):
   438	        db.commit()
   439	        return {"building_id": str(body.building_id), "taken_down": True, "artifact_rel": building.rel}
   440	    db.add(
   441	        IslandModerationAction(
   442	            id=uuid.uuid4(),
   443	            actor_id=caller.id,
   444	            action="takedown",
   445	            building_id=body.building_id,
   446	            artifact_rel=body.artifact_rel,
   447	            report_id=None,
   448	            reason=body.reason,
   449	        )
   450	    )
   451	    _record_event(
   452	        db,
   453	        user_id=caller.id,
   454	        event_type="takedown",
   455	        payload={"building_id": str(body.building_id), "artifact_rel": body.artifact_rel},
   456	    )
   457	    db.commit()
   458	    return {"building_id": str(body.building_id), "taken_down": True, "artifact_rel": building.rel}
   459	
   460	
   461	@router.post("/island/moderation/restore")
   462	def moderation_restore(
   463	    body: IslandRestoreIn,
   464	    caller: TmaUser = Depends(require_tma_user),
   465	    db: Session = Depends(get_db),
   500	    @classmethod
   501	    def _status(cls, value: str) -> str:
   502	        if value not in _RESOLVE_STATUSES:
   503	            raise ValueError("status must be reviewed|dismissed|escalated")
   504	        return value
   505	
   506	
   507	@router.post("/island/moderation/reports/{report_id}/resolve")
   508	def moderation_resolve_report(
   509	    report_id: uuid.UUID,
   510	    body: IslandReportResolveIn,
   511	    caller: TmaUser = Depends(require_tma_user),
   512	    db: Session = Depends(get_db),
   513	) -> dict:
   514	    _require_moderator(caller)
   515	    get_or_create_user(db, caller)
   516	    report = db.execute(
   517	        select(IslandReport).where(IslandReport.id == report_id).with_for_update()
   518	    ).scalar_one_or_none()
   519	    if report is None:
   520	        raise HTTPException(status_code=404, detail="island report not found")
   521	    report.status = body.status
   522	    # A dismissal is a dismiss_report receipt; reviewed/escalated is a
   523	    # review_publication receipt (§2.2). The report lifecycle is mutable, but the
   524	    # decision itself is an append-only receipt bound to the report.
   525	    action = "dismiss_report" if body.status == "dismissed" else "review_publication"
   526	    db.add(
   527	        IslandModerationAction(
   528	            id=uuid.uuid4(),
   529	            actor_id=caller.id,
   530	            action=action,
   531	            building_id=report.building_id,
   532	            artifact_rel=report.artifact_rel,
   533	            report_id=report.id,
   534	            reason=body.reason,
   535	        )
   536	    )
   537	    db.commit()
   538	    return _report_admin_view(db, report)
   539	
   540	
   541	def _encode_keyset(key: tuple[object, object]) -> str:
   542	    """Encode a keyset cursor `(created_at, id)` as `"<iso>|<id>"`. An ISO-8601
   543	    timestamp never contains `|` and neither does a UUID, so a single split on the
   544	    first `|` round-trips unambiguously."""
   545	    created_at, ident = key
   546	    iso = created_at.isoformat() if hasattr(created_at, "isoformat") else str(created_at)
   547	    return f"{iso}|{ident}"
   548	
   549	
   550	def _parse_keyset(before: str | None):

codex
Сверка завершена: локализация block и manifest/status-smoke исправлены, а policy/weights добавлены. Однако обнаружены сохраняющиеся и новые контрактные дыры, поэтому итог будет не GO; сейчас фиксирую их с точными строками и воспроизводимыми сценариями нарушения.
Контрактная сверка завершена. Найдены блокирующие противоречия в freeze-защитных writes, воспроизводимости pool snapshot, полноте weights-инварианта и enforceable identity денежной политики.
  ✓ Определить diff коммита и точные версии/пути четырёх документов
  ✓ Проверить внесение трёх групп findings R4 в двух v5-документах
  ✓ Сверить контрактную целостность с VISION.md и gap map, проверить новые противоречия
  ✓ Сформировать findings с точными строками либо вердикт GO
codex
- [P1] Freeze-инвариант несовместим с сохранённым защитным контуром. В freeze-списке остаются `island_friendships` и `island_meta_events`, тогда как разрешёнными объявлены только три защитные таблицы ([stage0:142](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:142>)). Реальный block меняет `island_friendships.removed_at` и пишет meta-event ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); report/takedown также пишут `island_meta_events` ([api_island_moderation.py:214](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_moderation.py:214>)). Поэтому обязательный protective smoke сам нарушит 24-часовой freeze и mutable-state digest.

- [P1] `BIGSERIAL` не обеспечивает заявленный immutable pool snapshot ([stage1:84](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:84>)). Транзакция `seed-pool` может получить меньший `seq`, задержать commit, а UNLOCKED — увидеть уже закоммиченный больший `seq` и сохранить его как cursor; поздний commit первой транзакции ретроактивно попадёт в `seq ≤ cursor`. Runtime-lock предписан только lifecycle/contribution writers ([stage1:74](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:74>)), не pool writers. Дополнительно `sum(предыдущих allocations)` не имеет allocation/event cutoff ([stage1:90](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)), поэтому более поздний READY-reserve меняет повторный расчёт старого snapshot.

- [P1] Двустороннее предусловие весов не замкнуто по lifecycle. Контракт проверяется при `register-contract`, но binding и READY возникают позже ([stage1:148](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:148>)); новая версия весов проверяет только уже READY/ACTIVE кейсы ([stage1:167](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:167>)). Разрешён сценарий: зарегистрировать маленький `token_goal`, пока кейс не READY; активировать более крупные веса; затем перевести этот контракт в READY без повторной проверки. Следующий вклад потребует более двух child-строк и уйдёт в постоянный retryable-отказ. Нужны revalidation на `ready` и сериализация активации весов тем же runtime-lock.

- [P1] Пин денежной политики пока не является enforceable identity. `mission_funding_policies` задаёт PK только по `policy_version`, а контракт хранит `(funding_policy_version, policy_digest)` внутри JSON-документа ([stage1:31](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:31>), [stage1:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:60>)); не определены digest-CHECK, UNIQUE пары, composite FK либо обязательная CAS-проверка пары при регистрации и UNLOCKED. Ошибочная пара может быть запечатана `contract_digest` и повторена receipt’ом, не доказывая конкретный policy document. Это слабее требуемого gap-картой composite-FK pin.

- [P2] После вынесения формулы в `mission_funding_policies.document` Read API не требует возвращать разрешённый policy document: контракт содержит лишь version/digest, а ответ описан как проекция из receipts ([stage1:210](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:210>)). Поэтому источник, eligible revenue и формула не гарантированно доступны игроку «в один тап», как требует [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).
tokens used
156,732
- [P1] Freeze-инвариант несовместим с сохранённым защитным контуром. В freeze-списке остаются `island_friendships` и `island_meta_events`, тогда как разрешёнными объявлены только три защитные таблицы ([stage0:142](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage0-island-off-tz.md:142>)). Реальный block меняет `island_friendships.removed_at` и пишет meta-event ([api_island_p2.py:281](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_p2.py:281>)); report/takedown также пишут `island_meta_events` ([api_island_moderation.py:214](</Users/gleb/My projects/p4g-platform-workspace/swipe-backend/app/api_island_moderation.py:214>)). Поэтому обязательный protective smoke сам нарушит 24-часовой freeze и mutable-state digest.

- [P1] `BIGSERIAL` не обеспечивает заявленный immutable pool snapshot ([stage1:84](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:84>)). Транзакция `seed-pool` может получить меньший `seq`, задержать commit, а UNLOCKED — увидеть уже закоммиченный больший `seq` и сохранить его как cursor; поздний commit первой транзакции ретроактивно попадёт в `seq ≤ cursor`. Runtime-lock предписан только lifecycle/contribution writers ([stage1:74](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:74>)), не pool writers. Дополнительно `sum(предыдущих allocations)` не имеет allocation/event cutoff ([stage1:90](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:90>)), поэтому более поздний READY-reserve меняет повторный расчёт старого snapshot.

- [P1] Двустороннее предусловие весов не замкнуто по lifecycle. Контракт проверяется при `register-contract`, но binding и READY возникают позже ([stage1:148](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:148>)); новая версия весов проверяет только уже READY/ACTIVE кейсы ([stage1:167](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:167>)). Разрешён сценарий: зарегистрировать маленький `token_goal`, пока кейс не READY; активировать более крупные веса; затем перевести этот контракт в READY без повторной проверки. Следующий вклад потребует более двух child-строк и уйдёт в постоянный retryable-отказ. Нужны revalidation на `ready` и сериализация активации весов тем же runtime-lock.

- [P1] Пин денежной политики пока не является enforceable identity. `mission_funding_policies` задаёт PK только по `policy_version`, а контракт хранит `(funding_policy_version, policy_digest)` внутри JSON-документа ([stage1:31](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:31>), [stage1:60](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:60>)); не определены digest-CHECK, UNIQUE пары, composite FK либо обязательная CAS-проверка пары при регистрации и UNLOCKED. Ошибочная пара может быть запечатана `contract_digest` и повторена receipt’ом, не доказывая конкретный policy document. Это слабее требуемого gap-картой composite-FK pin.

- [P2] После вынесения формулы в `mission_funding_policies.document` Read API не требует возвращать разрешённый policy document: контракт содержит лишь version/digest, а ответ описан как проекция из receipts ([stage1:210](</Users/gleb/My projects/p4g-platform-workspace/play-for-good-stage1-mission-slice-tz.md:210>)). Поэтому источник, eligible revenue и формула не гарантированно доступны игроку «в один тап», как требует [VISION.md:390](</Users/gleb/My projects/p4g-platform-workspace/VISION.md:390>).
