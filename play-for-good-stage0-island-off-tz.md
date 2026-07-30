# ТЗ Этап 0 — полное выключение legacy-острова (Island-off baseline)

Статус: **DRAFT, ждёт кросс-ревью** (author: Claude; reviewer: Codex).
Основание: VISION v3.0.1 (`96df90a`), gap-карта v2 §4, решение
оператора 30.07.2026. Реализация — отдельным обратимым
shutdown-пакетом, ДО реализации Этапа 1.

Цель: обратимо вывести legacy-остров из прода целиком — клиентскую
поверхность, backend-writers и runners — оставив защитные read-path'ы
(closed delivery, moderation, recall) и не удаляя данных. Результат —
«чистый Island-off baseline», предусловие реализации mission-slice.

Не-цели: удаление кода/таблиц/данных; ретеминг в приют (Этап 3);
любые изменения feed/каталога/challenge; mission-функциональность.

Инварианты пакета: данные не удаляются нигде; каждый шаг обратим одним
env-flip или откатом клиентского билда; closed delivery, операторская
модерация и recall работают на каждом шаге.

---

## П1 — снятие клиентской поверхности

Изменения: релиз feed-prototype с выключенными `VITE_ISLAND_ENABLED`,
`VITE_ISLAND_VISIT_AWARDS_ENABLED`, `VITE_ISLAND_NOTIFICATIONS_ENABLED`
(сначала зафиксировать фактические текущие значения деплой-окружения в
receipt пакета). Код не меняется — вся поверхность уже за флагами
(`src/feed.ts:202-210`, deep-links в `src/main.ts`).

Acceptance: свежая сессия — нет вкладки «мета», друзей в HUD,
island-обработки deep-links; в network ноль запросов `/api/island/*`.
Rollback: откат на предыдущий клиентский билд.

## П2 — остановка rewards / bots / notifications / social core

Изменения (`swipe-backend/render.yaml` — единственный источник
Blueprint-переменных): `ENABLE_ISLAND_SOCIAL=false`,
`ENABLE_ISLAND_BOTS=false`, `ENABLE_ISLAND_VISIT_AWARDS=false`,
`ENABLE_ISLAND_NOTIFICATIONS=false`, и **явно**
`ISLAND_REWARDS_ENABLED=false` (его default — true, полагаться на
отсутствие нельзя). До применения: локальный прогон конфиг-валидатора
на целевой комбинации (совместимость с
`ENABLE_ISLAND_CLOSED_DELIVERY=true` и модерацией — проверить зависимые
ветки валидатора в `app/config.py`).

Acceptance: чистый старт сервиса; в логах нет bot tick и notification
runner (оба стартера no-op при выключенных флагах); social-core и
visit-award endpoints → 404 (роутеры не смонтированы).
Rollback: env-flip обратно; повторное включение ботов безопасно by
design (immutable per-day планы, bounded catch-up).

## П3 — верхнеуровневое закрытие безусловных island-роутов (код)

Проблема: в `app/main.py:193+` безусловно монтируются
`island_state_router` (GET+PUT state), старые public/visit/like routes,
theme- и bake-generation. При выключенном П2 они остаются доступны:
кэшированный клиент или прямой запрос может писать состояние и
создавать model/storage cost.

Изменения: новый флаг `ENABLE_ISLAND_LEGACY_SURFACE` (default
**false**) гейтит монтирование всего перечисленного набора. Сами роуты
не меняются. Тесты, которым нужны эти роуты, включают флаг явно.

Границы (НЕ гейтится, остаётся живым): closed-delivery resolver (свой
флаг, остаётся true), операторская модерация (за lab auth), recall.

Acceptance: при выключенном флаге curl-набор по полному списку
legacy-роутов → 404; closed delivery выдаёт signed GET на существующий
артефакт; модерационная консоль работает; полный тест-сьют backend
зелёный. Rollback: env-flip `ENABLE_ISLAND_LEGACY_SURFACE=true`.

## П4 — проверка старого cached-клиента

Сценарий: уже открытая сессия старого клиента (включая
BFCache-восстановление) продолжает слать island-запросы и получает 404.

Работы: код-осмотр обработчиков ошибок island-путей клиента
(island-state sync, activity-поллинг `pollIslandActivity`,
visit-award, лайки) — деградация обязана быть тихой: лента играет,
крашей и бесконечного ретрая нет; затем ручная прод-проверка: в старой
сессии пройти серию до сундука при уже закрытом backend.

Acceptance: серия и сундук проходятся при 404 от island; поллинг
останавливается или уходит в backoff; видимых ошибок нет.
Если найдена жёсткая зависимость — это blocking finding: чинится до
применения П3 в проде.

## П5 — platform-scheme и доки

Работы: пересобрать и переопубликовать `platform-scheme` (провенанс
VISION v3.0.1); обновить `swipe-backend/docs/specs/IMPLEMENTATION-STATUS.md`
(остров выключен: дата, коммиты, состав пакета); durable-строка в
корневой `CLAUDE.md` (остров выключен решением оператора 30.07.2026;
данные сохранены; closed delivery/moderation/recall живы); при
необходимости — `AGENTS.md`.

Acceptance: схема опубликована с новым провенансом;
`docs-boundary-lint` чистый.

---

## Порядок применения

П1 (клиент) → П2 (env-флаги) → П3 (деплой gate) → П4 (проверка
cached-клиента) → П5 (доки/схема). Каждый шаг — отдельный receipt (что
изменено, кем, когда, как проверено) и прод-верификация до следующего
шага.

## Общий acceptance Этапа 0

- Свежий клиент: ноль island-запросов.
- Backend: все legacy island writers → 404; runners не стартуют.
- Closed delivery / moderation / recall — проверены руками, работают.
- Старый cached-клиент деградирует тихо (П4 пройден).
- Rollback-процедура записана; минимум один шаг проверен обратным
  включением вне прода.
- Данные: row counts `island_*` таблиц до/после пакета совпадают.

Только после этого acceptance начинается реализация Этапа 1
(`play-for-good-stage1-mission-slice-tz.md`).
