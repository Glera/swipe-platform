# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline) — v2

Статус: **DRAFT v2 после кросс-ревью R1** (author: Claude; reviewer:
Codex; findings R1: №1 разделение роутеров, №2 bake/theme runners,
№8 порядок проверки cached-клиента, №9 snapshot manifest — все
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

Фактическое состояние (проверено 30.07.2026): `app/main.py` —
`island_state_router` и `island_social_router` смонтированы безусловно
(:193–194); **модерация смонтирована внутри
`if settings.enable_island_social:`** (:195–200) и авторизуется
server-side allowlist'ом `ISLAND_MODERATOR_IDS` (не Lab auth); старый
`island_router` (public/visit/like + artifact-url) — безусловно
(:201); `start_bake_runner()` / `start_theme_runner()` вызываются
безусловно в `lifespan` (:76–77). Поэтому простое `ENABLE_ISLAND_
SOCIAL=false` одновременно убило бы модерацию и не остановило бы ни
legacy-роуты, ни генерационные runners.

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

Изменения (одна PR в swipe-backend, деплоится при ещё включённых
env-флагах — поведение прода не меняется):

1. **Разделить роутеры на четыре независимых контура**:
   a) legacy state/public/visit/like (включая `island_state_router`,
      `island_social_router`, старый `island_router` без
      закрытой доставки);
   b) closed-delivery resolver;
   c) public report (кнопка репорта — защитный контур);
   d) operator moderation/takedown (allowlist `ISLAND_MODERATOR_IDS`).
   Контуры (b), (c), (d) выводятся из-под `ENABLE_ISLAND_SOCIAL` и
   получают собственные гейты: (b) — существующий
   `ENABLE_ISLAND_CLOSED_DELIVERY`; (c) и (d) — новый
   `ENABLE_ISLAND_PROTECTIVE_SURFACE` (default **true**: защитный
   контур не должен выключаться случайно).
2. **`ENABLE_ISLAND_LEGACY_SURFACE` (default false)** гейтит: контур
   (a) целиком И запуск `start_bake_runner()` / `start_theme_runner()`
   в `lifespan` (при false runners не стартуют и не claim'ят jobs).
3. Cross-flag валидатор: явные ветки на новые комбинации.

Acceptance (тесты + локально): при `LEGACY_SURFACE=false` — все пути
контура (a) → 404, bake/theme runners не стартуют, **status/attempts
существующих queued jobs не изменяются**; при `SOCIAL=false` —
модерация, report и closed delivery продолжают работать; полный
тест-сьют зелёный. Rollback: env-flip `LEGACY_SURFACE=true`.

## П3 — pre-prod проверка старого cached-клиента (ДО прод-применения)

Работы: browser/E2E **старого прод-билда клиента** против локального
backend с выключенными флагами П2: пройти серию до сундука; убедиться,
что island-запросы получают 404 и деградация тихая — лента играет,
крашей нет, поллинг останавливается/уходит в backoff; код-осмотр
обработчиков ошибок island-путей (state sync, `pollIslandActivity`,
visit-award, лайки).

Acceptance: E2E зелёный. Найденная жёсткая зависимость — blocking
finding: чинится до П4.

## П4 — прод-применение

Порядок внутри шага: деплой кода П2 (флаги прода ещё on — поведение
не меняется) → env-флипы одним изменением `render.yaml`:
`ENABLE_ISLAND_SOCIAL=false`, `ENABLE_ISLAND_BOTS=false`,
`ENABLE_ISLAND_VISIT_AWARDS=false`, `ENABLE_ISLAND_NOTIFICATIONS=false`,
явно `ISLAND_REWARDS_ENABLED=false` (default true — полагаться на
отсутствие нельзя); `ENABLE_ISLAND_LEGACY_SURFACE` не задаётся
(default false); `ENABLE_ISLAND_CLOSED_DELIVERY=true` и
`ENABLE_ISLAND_PROTECTIVE_SURFACE=true` сохраняются.

Prod smoke: curl-набор по списку legacy-роутов → 404; closed delivery
выдаёт signed GET на существующий артефакт; report-запрос и
модерационная консоль работают; в логах нет bot/notification/bake/theme
runner'ов.

Rollback: env-flip обратно; повторное включение ботов безопасно by
design (immutable per-day планы, bounded catch-up).

## П5 — snapshot manifest, схема и доки

1. **Data-manifest вместо голых row counts**: после drain (П4)
   зафиксировать snapshot: row counts + max seq/id по всем `island_*`
   таблицам, список queued/running bake/theme jobs со status/attempts,
   digest mutable-state (`island_states` revisions). Через ≥24 ч
   проверить: ни одной новой island-write после cutoff, jobs не
   изменились. Manifest — receipt пакета.
2. Пересобрать и переопубликовать `platform-scheme` (провенанс VISION
   v3.0.1).
3. Доки: `IMPLEMENTATION-STATUS.md` (остров выключен: дата, коммиты,
   состав), durable-строка в корневой `CLAUDE.md`, при необходимости
   `AGENTS.md`.

Acceptance: manifest-проверка чистая; схема опубликована;
`docs-boundary-lint` чистый.

---

## Порядок применения

П1 (клиент) → П2 (код, деплой без смены поведения) → П3 (pre-prod E2E
старого клиента) → П4 (env-флипы + prod smoke) → П5
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
- Data-manifest: ни одной island-write после cutoff; данные не
  удалены.

Только после этого acceptance начинается реализация Этапа 1.
