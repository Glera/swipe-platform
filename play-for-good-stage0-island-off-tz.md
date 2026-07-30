# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v6

Статус: **DRAFT v6 после кросс-ревью R5** (author: Claude; reviewer:
Codex; R1–R4 внесены ранее; R5: `island_friendships` (только
`removed_at` синхронно с block) и `island_meta_events` (только строки
защитных актов) выведены из freeze-списка в allowlist — protective
smoke больше не нарушает freeze by construction). Автономная петля
остановлена на лимите 3 раундов; финальная перепроверка — в чат-треде
оператора. Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4.

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
`api_island_social.py` — public, visits, likes, и **artifact-url
(:159), который является closed-delivery resolver'ом, а НЕ
legacy-поверхностью**; **user-block живёт в `api_island_p2.py:250`**;
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
   island-маршрутов с файлом-источником, целевым контуром и
   **ожидаемым статусом после Этапа 0** (404 для контура (a); живой
   ответ для (b)/(c)/(d)). Smoke проверяется против этой колонки, а не
   сплошным 404.
1. **Разделить роутеры на четыре независимых контура** (по
   manifest'у):
   a) legacy: state (`api_island_state`), public/visits/likes
      (`api_island_social` БЕЗ artifact-url и block), theme/bake
      generation (`api_island`);
   b) closed-delivery resolver — **включая artifact-url endpoint
      (`api_island_social.py:159`)**: это выдача signed GET на уже
      опубликованные артефакты, не legacy;
   c) защитный пользовательский контур: **public report И user block**
      (`/island/friends/{user_id}/block` из `api_island_p2.py:250`) —
      VISION требует report/block вместе;
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
5. **Prod smoke:** curl-набор по route manifest'у — **каждый маршрут
   отвечает ожидаемым статусом своего контура**: legacy (a) → 404;
   artifact-url выдаёт signed GET на существующий артефакт; report,
   user block и модерационная консоль отвечают живыми статусами; в
   логах нет bot/notification/bake/theme runner'ов.

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
   `island_notification_outbox`, `island_notification_attempts`,
   `island_bake_jobs`, `island_theme_jobs`.
   Через ≥24 ч: **ноль новых записей в freeze-списке**. Вне
   freeze-списка — защитный allowlist с audit-правилами (каждое
   изменение соответствует конкретному защитному акту):
   `island_reports`, `island_moderation_actions`,
   `island_friend_blocks`; **`island_friendships`** — разрешено только
   изменение `removed_at`, и только синхронно с block-актом
   (`api_island_p2.py:281`); **`island_meta_events`** — только строки,
   порождённые report/block/takedown-актами (перечень kind'ов — в
   manifest'е). Protective smoke по построению не нарушает freeze.
   Manifest — receipt пакета.
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
(manifest/схема/доки). Каждый шаг — отдельный receipt; прод-верификация
до следующего шага.

## Общий acceptance Этапа 0

- Свежий клиент: ноль island-запросов.
- Backend: контур (a) → 404; bake/theme/bot/notification runners не
  стартуют; queued jobs заморожены (status/attempts без изменений).
- Closed delivery (artifact-url) / public report / user block /
  модерация / recall — проверены руками, работают.
- Старый cached-клиент: pre-prod E2E пройден до применения, prod smoke
  после.
- Rollback записан; минимум один шаг проверен обратным включением вне
  прода.
- Data-manifest: ноль записей в freeze-списке после cutoff; защитные
  writes — только с audit-receipt; данные не удалены.

Только после этого acceptance начинается реализация Этапа 1.
