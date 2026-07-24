# Island Social Core — независимое Codex-ревью реализации P1, R1

Дата: 2026-07-24  
Вердикт: **NO-GO до фикс-раунда**  
Блокеры: **5 P1**  
Неблокирующие находки: **6 P2**

## 1. Что проверено

Ревью выполнено по чистым patch-only checkout:

- backend: `swipe-backend`, `17b21c1..bb8430b`, ветка
  `island-social-core-p1`;
- client: `feed-prototype`, `5f062d8..c27b58b`, ветка
  `island-social-core-p1`;
- evidence-пакет: `p4g-workspace-meta@77469a7`,
  `island-social-core-p1-review-packet.md`;
- нормативная база: `island-social-core.md` v1.3 и VISION v2.5.

В обоих code-repo patch identity совпала с пакетом: локальных staged,
unstaged и untracked изменений нет. Проведены три независимых слепых
прохода: backend, client и cross-repo; затем находки перепроверены по
контракту и коду.

Заявленные автором результаты тестов и browser/PG E2E приняты как evidence,
но не переисполнялись в этом проходе: checkout intentionally не содержал
секретов и рабочего интеграционного стенда.

## 2. P1 — обязательные исправления

### F001 — бот-кап применяется к домику, а не к игроку

`app/island_bots.py:398-412`

Спека §2.4 ограничивает активность **1–3 claim/день на `(бот, игрок)`**.
`build_plan()` независимо выбирает `n` внутри цикла по каждому
`(owner_id, building_id)`. Игрок с четырьмя домиками получает до 12 событий
от одного бота вместо трёх. Это ускоряет стадии и `pending_gifts`, а также
непредсказуемо съедает глобальный cap 200.

Исправление: сначала детерминированно выбрать 1–3 события на
`(bot, owner, day)`, затем детерминированно распределить их по доступным
домикам. Добавить тест игрока с несколькими домиками и invariant
`claims(bot, player, day) <= configured max`.

### F002 — immutable builtin binding не является runtime authority

`feed-prototype/src/island.ts:3263-3277`

Для бот-домика backend возвращает binding
`{mechanicId, rosterRevision, versionsDigest}`, но клиент игнорирует его и
запускает текущий stock URL только из `b.tpl`. Это нарушает F007: сыгранный
runtime может не совпасть с зафиксированной identity/revision. Текущий E2E
не обнаруживает расхождение, потому что его route-fixture отдаёт одинаковый
playable для всех `*.html`.

Исправление: резолвить runtime строго по builtin binding, fail closed при
невозможности подтвердить binding/digest. Добавить негативный E2E, где
`tpl` и `builtin.mechanicId` различаются, и проверку точной запрошенной
ревизии/manifest digest.

### F003 — быстрый честный win теряет completion claim

`feed-prototype/src/island.ts:3349-3380`

Клиент ждёт только минимум legacy `/complete` (примерно 850 мс), затем
сразу вызывает `/result`. Backend по умолчанию допускает `/result` лишь
через 8000 мс от `started_at`. Ответ 425 на `/result` только логируется:
retry отсутствует. В результате plays увеличивается, но claim, stage,
подарок гостю и `pending_gifts` владельца не создаются.

Исправление: отдельно дождаться server min-win boundary либо повторить
тот же `/result` по `Retry-After`, сохранив тот же `visit_id`; transient
ошибки также должны иметь bounded retry/outbox. Добавить browser-кейс
победы раньше восьмой секунды с DB-сверкой одного claim/outcome.

### F004 — первый friend deep link гоняется с созданием пользователя

`feed-prototype/src/feed.ts:826, 840-842, 887-918`

Конструктор запускает accept `f_<code>` и загрузку friends HUD до завершения
`/api/session`. Для нового Telegram-пользователя friends endpoint может
прийти раньше создания FK-backed user row, показать
«Приглашение недоступно» и больше не повториться.

Исправление: запускать friend accept/HUD refresh после успешного session
bootstrap; сохранить код до успеха и делать bounded retry тем же intent.
Добавить cold-user E2E без предварительного `/session`.

### F005 — клиентский kill switch не гейтит весь остров

`feed-prototype/src/main.ts:57-65`, `src/feed.ts:177-181, 843`

Спека §1/§4 требует: `VITE_ISLAND_ENABLED` гейтит **весь остров**.
Реализация намеренно оставляет `i_<owner>` и `?island=<owner>` активными.
При включённом backend-флаге пользователь вне клиентской когорты получает
полноценный island surface, обходя rollout isolation.

Исправление: при выключенном `VITE_ISLAND_ENABLED` не резолвить public
island и не монтировать island world. Добавить тест прямого `i_` и query
deep link при flag off. Если обход действительно нужен продукту, сначала
изменить ТЗ и явно определить второй rollout gate; текущая реализация
контракту не соответствует.

## 3. P2 — исправить до включения когорты

### F006 — replay `/result` не авторизует владельца receipt и не проверяет reuse

`app/api_island_social_core.py:166-170`

Fast path возвращает receipt до проверки `existing.guest_id == caller.id`.
Также изменённые `outcome`/`duration_ms` получают 200, хотя §2.2 требует
409 при reuse identity с другими inputs. Проверять caller и сохранённый
request fingerprint до replay.

### F007 — block не скрывает public island и не защищает legacy complete

`app/api_island_social.py:141-177` и legacy `/complete`

`blocked_between()` влияет только на `gift_available_today`; содержимое
острова всё равно выдаётся, а `/complete` может увеличить plays до отказа
на `/result`. Контракт требует исключить обе стороны из public responses,
visits и claims. Это особенно важно до добавления UI block в P2.

### F008 — bot seed не ротирует изменившийся builtin binding

`app/island_bots.py:287` и seed path

При изменении roster/mechanic новый building ID вычисляется, но существующий
`island_states` остаётся из-за `ON CONFLICT DO NOTHING`; новые social rows
становятся orphaned, старый binding продолжает публиковаться. Реализовать
атомарную замену snapshot: новый ID доступен, старый retired; покрыть
обязательным F007 rotation test из §7.

### F009 — успешный gift не синхронизирует puzzle HUD

`feed-prototype/src/island.ts:3375`

Guest result показывает `+N` в модалке, но `addPuzzles` передаётся только
для собственного острова и session balance не обновляется. После server
grant HUD остаётся старым до будущей синхронизации/reload.

### F010 — после claim остаются stale stage и gift marker

`feed-prototype/src/island.ts:3375-3377`

Авторитетные `stage`/`foreign_claims` лишь логируются; локальная модель не
обновляется, `gift_available_today` не сбрасывается. Возврат на остров
показывает старую стадию и предлагает уже потреблённый подарок.

### F011 — browser evidence для friend flow допускает ложный результат

`feed-prototype/scripts/check-island-social-browser.mjs:306-313`

Waiter на `/friends/accept` устанавливается после navigation/session и может
пропустить быстрый auto-accept. HUD assertion проверяет attachment, но не
visibility; приложенный D1 screenshot всё ещё закрыт loading overlay.
Установить waiter до navigation, дождаться снятия preloader и проверять
видимую/кликабельную ячейку.

## 4. Принятые долги, не переоткрытые этим ревью

- immutable daily bot plan не перепроверяет takedown/block внутри дня —
  оставлено как явно принятое окно до P3;
- collect при kill switch/daily cap обнуляет накопленное;
- backend read surfaces остаются вне `ENABLE_ISLAND_SOCIAL`;
- глобальный bot cap применяется в execution time.

Эти решения допустимы только при сохранении default-off и отсутствии
внешней когорты до соответствующих гейтов.

## 5. Условия следующего GO

1. Закрыть F001–F005 кодом и regression-тестами.
2. Для F002 приложить evidence, что runtime действительно выбран по exact
   immutable binding, а не по mutable `tpl/current roster`.
3. Для F003 приложить fast-win E2E с DB-сверкой claim/outcome/ledger/pending.
4. Для F004 приложить cold-user invite E2E без предварительного session.
5. Для F005 доказать, что оба direct-entry варианта inert при client flag off.
6. Дать disposition по F006–F011; F006–F008 желательно закрыть тем же
   фикс-раундом, поскольку это backend correctness и обязательный DoD.

После этого достаточно diff-only R2 по фикс-коммитам; повторять весь
dogfood-пакет не требуется, кроме затронутых вертикалей.
