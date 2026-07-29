# Независимое ревью: mobile-first Lab review queue + Lab performance

Дата: 2026-07-29. Ревьюер: Claude (оркестратор) + четыре адверсариальных Opus-агента
по зонам. Автор ≠ ревьюер соблюдён. Пакет автора:
`mobile-review-performance-review-packet.md`.

Ревьюируемые head-и: backend `b67a60c` (PR #25), generator `163400e` (PR #5),
feed/TMA `3b82b0f` (PR #13), agents `fd899e5` (PR #9).
Ничего не мержилось, не деплоилось; авторские worktree и data root не тронуты.

## Вердикт: **NO-GO**

Все четыре зоны вернули NO-GO независимо друг от друга. Направление и
инженерное качество высокие — большинство заявленных инвариантов **доказано**
(перечислены ниже), но найдены блокеры двух классов: нарушение
publication-authority и невыполнение собственного GO-условия пакета
(«все P1/P2 закрыты исполняемыми регрессиями»).

Условие пакета «reviewer must require literal `conclusion=success`» не
выполнено: generator PR #5 на head `163400e` — **FAILURE**.
(backend 24/24 SUCCESS, feed SUCCESS, agents SUCCESS.)

## Блокеры (P1)

### B1 · Фоновый мост сам инициирует и завершает публикацию (generator)
`mobile-review-coordinator.mjs:166-189` для любого заказа в `telegram_required`
вызывает `catalogSeriesPublish.initiate(...)` — это `CATALOG_PUBLISH_SCOPE`,
`bakePreview` (внешняя запись) и реальный device-грант `auth.start()`; далее
`poll(...)` при `state==='authorized'` выполняет `publishSeries(...)`
(`catalog-series-publish-initiation.mjs:453-486`, `:519`, `:539`). Триггер —
безусловный `setInterval(…, 5000)` (`server.mjs:2435-2440`) плюс стартовый тик.
Человеческий Approve в Telegram сохраняется, но **инициация публикационного
device-flow и финальный publish становятся побочным эффектом фонового
отсмотрового цикла**, без действия оператора в Lab. Прямо противоречит
durable-решению «evaluation и publication никогда не делят грант; публикация —
отдельный человеческий акт» и заявленному инварианту 15.

### B2 · Побег из sandbox без JavaScript (TMA)
`src/mobile-review.ts:325-345`: CSP применяется только к исходному документу,
родительская страница не несёт CSP, поэтому `frame-src` не действует.
`<meta http-equiv="refresh" content="1;url=https://evil.example/…">` уводит
фрейм на внешний хост. Воспроизведено на реальном vite-билде: внешний хост
получил запрос, приложение продолжает показывать «Exact-прототип загружен»
и принимает вердикт; родитель не замечает (`load`-listener `{once:true}`).
Учётные данные не утекают (fetch/XHR/beacon/cookies/localStorage реально
блокируются) — но внутри доверенного review-WebView оператора оказывается
полностью подконтрольная атакующему страница (фишинг, перехват ввода).
Инвариант 20 фальсифицирован как написан. Проверенный фикс: `Content-Security-Policy: frame-src 'self' blob:` на родительском документе
(закрывает и scripted, и meta-refresh вектор; заодно чинит island-UGC фреймы).

### B3 · `IntegrityError` выходит наружу как 500 на обеих мутационных ветках (backend)
`db.flush()` стоит **вне** `try` в четырёх местах (`mobile_review_service.py:246,
366, 429, 529`), поэтому блоки `except IntegrityError` (`:263-270, :374-378,
:436-440, :537-541`) недостижимы, а нарушение constraint уходит мимо
`api_mobile_reviews._call` в FastAPI как 500. Воспроизведено вживую на PG.

**Связка B3 × F5 (TMA) — реальный пользовательский сценарий.** Клиент при
retry после потерянного ответа минтит **новый** `mutationId`, потому что
`playedMs = Date.now() - startedAt` пересчитывается в момент клика и входит в
identity (`src/mobile-review.ts:741`, `:109-121`). Второе решение по тому же
bundle нарушает unique-constraint → 500 вместо идемпотентного replay.
Инвариант 12 («lost response replays the same decision») фальсифицирован для
самого частого класса действий (taste); non-taste действия не затронуты.

### B4 · Красный CI: тесты читают gitignored-состояние машины автора (generator)
Три из четырёх падающих тестов передают `ugcRoot: resolve('../swipe-ugc')` и
требуют артефакты `wild-sort-a2a23ae982` из `.local-experiments/` и
`u/local-experiments/` — обе директории в `.gitignore` swipe-ugc; в CI-чекауте
пина `b8be78d0` их нет. Воспроизведено на обоих деревьях (авторское — pass,
CI-дерево — та же ошибка, что в CI). Четвёртый тест (`factory conflict…`)
синхронизируется на смене URL вместо самого тоста
(`test/lab-ui-series-orders.test.mjs:1546-1553` против
`public/series-orders-ui.js:1655-1657`), а добавленный в этом PR четвёртый
запрос `/v1/mobile-reviews/status` сдвинул окно — падение детерминировано в
обоих CI-прогонах. Это **не** «timing under parallel load» и не known-drift
worker-pin (тот отдельно подтверждён).
Правильный паттерн уже есть в репо: синтетический ugcRoot во временной
директории (`test/experiment-rework-evidence.test.mjs:28-42`).

### B5 · Нулевое исполняемое покрытие storage/HTTP-слоя (backend)
Все 16 тестов — чистая Pydantic-валидация. Не покрыто ничем: append-only
lifecycle, genesis-гонка, идемпотентность decision/consume/close, 4 MiB
streaming-guard, проверка digest артефакта, отсутствие роутов при флаге off,
отказ `telegram_approve` через роут. Инварианты держатся сегодня (проверены
вручную и живыми пробами), но ничто не мешает им молча сломаться завтра.
В репо есть домашняя конвенция ровно для этого (`tests/test_*_postgres.py`,
579 таких тестов; `tests/test_api_catalog_allocation.py:103` — образец
проверки физического отсутствия роута).

### B6 · Очередь Telegram-outbox клинится навсегда (agents)
`renderDelivery` бросает при отсутствующем `AGENTS_PRODUCTION_REVIEW_URL`
(`src/bot/render.ts:81`), а `Sender.sendOne` рендерит **до** `send_started`
(`src/bot/sender.ts:190`) — строка навсегда остаётся `queued` и, будучи первой
по `ORDER BY q.ord`, блокирует всё поставленное после неё, включая
**инцидентные алерты**. Сценарий штатный: откат фичи = снятие env-переменной.
Нарушен собственный контракт модуля «never throw in the send path».

### B7 · `render.yaml` включает флаг в проде (backend)
`render.yaml:48-51`: `ENABLE_MOBILE_SERIES_ORDER_REVIEW: "true"`. Merge
разворачивает новый authority-scope, шесть таблиц и десять роутов сразу в
production. Все сопоставимые поверхности репозитория (allocation, sequencing
apply, shadow ops, recall) едут default-off до прохождения своих гейтов.
Код-дефолт корректный (`config.py:69`), его переопределяет манифест деплоя.

## Существенные P2

- **Исполняются не те байты, что проверены дайджестом (TMA).** CSP-префикс
  вставлен перед `<!doctype html>` → документ уходит в quirks mode (измерено
  `BackCompat`); плюс BOM срезается декодером (22 байта → 19). Правильный
  паттерн есть в этом же репо: инъекция CSP внутрь `<head>`
  (`vite.config.ts:42-45`).
- **Регрессия против утечки provider вакуумная (TMA).**
  `check-mobile-review-browser.mjs:285` ищет строку в `innerText`, а поля лежат
  в свёрнутом `<details>`: `bodyInnerTextHasProvider:false`,
  `domHtmlHasProvider:true`. Тест физически не может упасть. Клиент дампит
  `technicalDetails` целиком — нужен allowlist (backend их тоже не скрабит,
  F-7: инвариант 8 полностью generator/TMA-side).
- **Фишинговый URL в прод-чат (agents).** `AGENTS_LAB_PUBLIC_ORIGIN` не
  валидируется ничем (`env.ts:165`) и рендерится в сообщение
  (`render.ts:91-92`); отрендерено вживую:
  `https://operator:s3cr3t@lab-login.evil.example/lab?…` — одновременно
  non-HTTPS-вариант, non-t.me и credential-bearing. Отдельно:
  `AGENTS_PRODUCTION_REVIEW_URL` не привязан к своему боту — принимается любой
  t.me-путь (`https://t.me/evil_phish_bot?startapp=review` → ACCEPTED), порт не
  проверяется. Атакующий с доступом только к деплой-конфигу уводит оператора в
  чужой Mini App, не трогая секреты.
- **Нет per-order fault-изоляции (generator).** Один сбойный заказ роняет весь
  тик: не грузятся остальные заказы, все standalone-кандидаты, не применяются
  решения, не обновляется notification-снимок. Невалидное решение остаётся в
  голове очереди и роняет каждый следующий тик.
- **`rework`-вердикт теряется с ложным `superseded` (generator).**
  `saveReview` → `createLevelRework`; падение второго (409 `rework_busy`) даёт:
  ревью записано, rework не стартовал, телефон показывает «отменено», ретрая
  нет. У apply-пути нет локального ключа идемпотентности (`saveReview` не
  принимает `mutationId`, в отличие от `savePrototypeReview`).
- **Контракт допускает бандлы ~17× больше DB-cap (backend).** 642 114 байт
  проходят Pydantic и умирают на `ck_..._document_identity` (≤524 288);
  вместе с B3 это 500, без B3 — вечный «identity race» 409, действие никогда
  не доходит до телефона.
- **Server-Timing отсутствует на самом медленном маршруте (generator).**
  Заголовок ставится только при `!res.headersSent`, а `sendFile` уже
  стримит: в собственном evidence автора `serverMs: null` у `/lab` и `/lab.js`
  (там же p95 shell 62 мс). Инвариант perf-7 «на каждом ответе» — BROKEN.
- **Порог ослаблен внутри PR про производительность:** `overviewP95Ms`
  1500 → 3000 (`scripts/check-lab-performance.mjs:8`).
- **Латентность измерена с выключенным мостом.** `catalogBaseUrl` не задан →
  координатор `null`, то есть ни один гейт не покрывает нагрузку самого
  5-секундного цикла; замеренная стоимость — ≈291 мс блокировки event-loop на
  штатной границе 100 кандидатов, каждые 5 секунд.
- **Auto-follow открывает шаг чужого заказа (TMA).** Фолбэк выбирает любой
  другой элемент inbox без scoping по заказу и без жеста пользователя;
  измерено: после вердикта по одному заказу автоматически отрисовался
  `UNRELATED ORDER` с живой кнопкой «Подтвердить exact шаг».
- **Чекбоксы factory-review не переживают reload (TMA)** — единственный класс
  форм без persist (5 → 0 после перезагрузки).
- **Повторный пинг по заказу невозможен (agents).** `actionKey` дедуплицирует
  на весь заказ навсегда: после первого уведомления новое, реально текущее
  review-действие того же заказа никогда не даст пинга.

## Что доказано (принимается)

Backend: синглтон-scope без комбинирования с publish/recall/eval/roster
(с проверкой live-constraint'ов на PG); физическое отсутствие роутов при
выключенном флаге (OpenAPI-проба); append-only через `BEFORE UPDATE OR DELETE`
триггеры на шести таблицах (живой отказ UPDATE/DELETE); сериализация
genesis-гонки через `pg_advisory_xact_lock` (8 потоков → 1 current);
валидация полного decision domain до `decided`; невозможность
`telegram_approve` через `operator.review:write` (живая проба: 422, bundle
остался `current`); 4 MiB-guard **в стриминге** (200 MiB chunked → 413 после
вычитки лишь 5 MiB); идемпотентный replay по `mutationId` и типизированный 409
на forged digest; миграции 0068/0069 round-trip чисто.

Generator: пересборка bundle из свежего authority; stale/cross-action решение
не мутирует заказ; `superseded` без бесконечного ретрая; standalone identity
только из immutable evidence; отсутствие provider/model до вердикта (включая
прод-путь); async-подготовка публикации без unhandled rejection и с
ack < 1 c; видимый прогресс factory review.

TMA: mobile route не бутит `/api/session` и фид (проверено ассертом
`sessionRequests === 0`); «Надиктовать» — только `focus()`, ни
`SpeechRecognition`, ни `getUserMedia`, ни `MediaRecorder` в коде нет; SHA-256
пересчитывается над теми же байтами, что идут в Blob (TOCTOU нет), путь
digest→URL закреплён регуляркой; double-tap гасится синхронным disable до
`await`; `telegramUrl` принимается, но никуда не навигируется.

Agents: `/review` — argument-free, freshness (900 c), exact operator, exact
prod-chat, replay-safe по update id (рестарт-репро: одна доставка,
`diffLiveVsReplay=[]`); ready-проекция не показывает действие до backend-ACK;
технических id в видимом тексте нет; полный сьют 431 passed, известный flaky
backup-race прошёл за 25.4 с при таймауте 30 с (маржу стоит поднять).

## Минимум для повторного ревью

1. B1: убрать инициацию/выполнение `catalog:publish` из фонового моста —
   публикация начинается только явным действием оператора (или операторское
   решение, явно разрешающее иное).
2. B2: `frame-src 'self' blob:` на родительском документе + регрессия с
   meta-refresh пейлоадом.
3. B3: `db.flush()` внутрь `try` во всех четырёх функциях + различимые типы
   ошибок; и/или стабилизировать mutation identity на клиенте (исключить
   `playedMs` из ключа) — с регрессией на «потерянный ответ → retry».
4. B4: три standalone-теста на синтетический ugcRoot; `factory conflict` —
   ждать тост, а не URL. CI должен стать literal success.
5. B5: `tests/test_mobile_review_postgres.py` по домашней конвенции
   (genesis-гонка, четыре replay-пути, append-only триггеры, отказ
   `telegram_approve` через роут, streaming-guard, отсутствие роутов при
   флаге off).
6. B6: send-path не бросает (деградированный текст либо терминальный
   `failed{config_missing}`).
7. B7: `render.yaml` → `"false"` до прохождения enable-гейта.
8. P2-минимум: валидация `AGENTS_LAB_PUBLIC_ORIGIN` тем же fail-closed
   способом; CSP внутрь `<head>`; провер­ка утечки provider по DOM, а не
   `innerText`; per-order fault-изоляция; идемпотентность apply-пути rework;
   согласование границ контракта с DB-cap; Server-Timing на статике;
   возврат `overviewP95Ms` (или обоснование); перезамер латентности с
   **включённым** мостом.

Порядок включения после зелёного повторного ревью не меняется: merge →
миграция/деплой backend → деплой TMA → рестарт generator и supervisor →
один живой прогон `/review` с телефона. Выдача `operator.review:write` и
переключение прод-уведомлений остаются операторскими гейтами.
