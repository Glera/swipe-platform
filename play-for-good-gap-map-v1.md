# Gap-карта Play for Good — v2 (30.07.2026)

Основание: VISION v3.0 (workspace `cbe08ac`) + протокол решений
`vision-patch-play-for-good-proposal.md`. Метод: три параллельные
read-only разведки 30.07.2026 (swipe-backend / feed-prototype /
остальной воркспейс). v2: внесены поправки кросс-ревью Codex (§18 в
`play-for-good-gap-map-codex-research.md`) и решения оператора
30.07.2026 (авто-вклад, полный пакет выключения острова, лапки без
миграции ledger). Формат: по контурам — что есть → что требует
v3.0 → вердикт (**строить / переиспользовать / ретемить / заморозить /
не трогать**).

## TL;DR

| Контур | Вердикт |
|---|---|
| Миссионное ядро (кейсы/сезоны/подарки/pool) | **Строить с нуля** — на бэкенде 0 совпадений по season/impact/mission; но все паттерны готовы в island_*/feed_* |
| Токены участия («лапки») | **Решено**: UX-ретеминг puzzles→лапки БЕЗ миграции старого ledger; вклад — новые human-true contribution receipts |
| Вклад | **Решено: автоматический** — server-owned receipt за серию/дейлик/коллекцию, без кошелька/spend и без optimistic UI; церемония дискретна |
| Коллекции | **Строить server-owned** — клиент чисто презентационный, сервер: 0 таблиц |
| Остров → приют | **Ретемить с крупным реюзом**; UGC-центр — заморозить |
| Share/campaign | **Переякорить** готовый challenge-рельс |
| Holdout/телеметрия | **Строить по образцу** `feed_policy_assignments` |
| Подписка/monetization | **Ничего не делать** до monetization-гейта |
| Фабрика/консоль/деплой | **Точечные правки**, ядро не трогается |
| Legacy (p4g-platform, play4good, liveops-shared, platform-bot) | **Не трогать** |

---

## 1. Миссионное ядро — строить (backend: `mission_*` namespace)

Сейчас: `grep season|impact|mission|donation` по `swipe-backend/app/` —
0 совпадений. Есть два per-user ledger'а (`reward_ledger` stars,
`puzzle_ledger` puzzles), пула нет.

Строить, с прямыми образцами из существующего кода:

- **Контракт кейса** — immutable versioned документ с digest; образец:
  `feed_policy_config_versions` (composite PK kind/version, digest-CHECK,
  жёсткая связка kind↔schema, composite-FK «пин» из потребителей).
- **Lifecycle READY→ACTIVE→UNLOCKED→FULFILLED** — append-only журнал
  переходов + derived state по `seq DESC`; образец:
  `island_moderation_actions` (commit-order truth, никакого мутабельного
  статуса).
- **Журнал вкладов** — `seq` из sequence под row-lock кейса + immutable
  terminal receipt в той же транзакции (byte-identical replay); образец:
  пара `island_completion_claims` + `island_completion_outcomes`
  (docstring контракта в `app/api_island_social_core.py:1-10`).
- **Impact pool ledger** — новый append-only журнал rolling-пула
  (источники: seed / revenue_share / partner / subscription_share) +
  receipt резервирования гарантированного подарка при READY;
  UNLOCKED-receipt фиксирует снапшот пула:
  `gift = min(guaranteed + unlock_share(progress) × settled unallocated
  eligible pool at UNLOCKED snapshot, need + stretch)` — receipt хранит
  snapshot/cursor, всё settled позже cursor'а достаётся следующим
  кейсам; отдельного «окна сезона» нет; излишки остаются в pool.
  Писать идемпотентными writer'ами по паттерну
  `award_stars_with_status` (`ON CONFLICT DO NOTHING RETURNING`).
- **Evidence FULFILLED** — фото/видео/мини-отчёт; образец хранения:
  `mobile_review_artifacts` (CAS по digest), но потребуется расширение
  типов (сейчас только text/html, ≤4 MiB) или R2-паттерн из island P5.
- **Внешние эффекты/уведомления** («случилось хорошее», выплаты) —
  outbox+attempts; образец: `island_notification_outbox` +
  `island_notification_attempts` (lease, dedup_key, quiet hours).
- **Флаги**: `ENABLE_MISSION_*` default-off, гейтят монтирование
  роутеров + cross-flag валидатор в `config.py` (существующая
  дисциплина).

**Операторский контур кейса** (публикация/закрытие кейса = human
authority): реюз целиком существующего паттерна — `catalog_lab_auth`
(grant/scope), `mobile_review_bundles/decisions/consumptions`
(server-derived actor, explicit TMA Approve) и
`catalog_operator_promotion` (CLI dry-run-first, CAS + append-only
state log + intervention receipt). Важно: переиспользуется **паттерн**,
а не журнал полномочий — impact-полномочия живут в отдельных scopes и
отдельных `mission_review_*` таблицах, контентный `action_kind` не
расширяется (evaluation / publication / impact / financial authority не
смешиваются — инвариант VISION).
Authority-таблица VISION уже содержит строку «Impact-кейс».

**Клиент**: поверхности нет вообще. Строить: виджет текущего кейса
(токен-бар к token goal + 4 числа: вклад сообщества / гарантировано /
зарезервировано+открыто / передано), церемония вклада, церемонии
UNLOCKED и FULFILLED. Точки врезки в `feed-prototype/src/feed.ts`:
series-win экран (`showSeriesWinScreen` :4937) и стек CTA после сундука
(сейчас: island-visit-award ИЛИ challenge-пилюля — стек надо
пересобрать с вклад-церемонией).

## 2. Токены участия «лапки» — решено: UX-ретеминг без миграции ledger

Сейчас на клиенте три понятия: **stars** (level-ring, server-auth),
**puzzles** (реальная мета-валюта: HUD-бейдж, optimistic+rollback,
`PuzzleLedger`, дейлики платят puzzles), и два мёртвых `tokens`
(зеркало puzzles в острове; мок `metaTokens`).

Решения (оператор + кросс-ревью, 30.07.2026):

- **В UX лапки заменяют puzzles.** Переиспользуются иконки, анимации,
  детерминированные reward-функции (`app/rewards.py` /
  `src/rewards.mjs`) и result-интеграция.
- **Исторический `PuzzleLedger` НЕ конвертируется во вклад**: баланс
  загрязнён starter grant 120, старыми daily-наградами, island
  gifts/collect и bot-derived начислениями — он не human-true. Новые
  лапки пишутся отдельными contribution receipts в mission-домене;
  старый puzzle-баланс благотворительным вкладом не становится.
- **Вклад автоматический**: серия / дейлик / завершение коллекции
  создаёт server-owned contribution receipt, лапки сразу попадают в
  текущий ACTIVE-кейс. Личного кошелька, spend-акта и «неиспользованных
  токенов» нет; HUD показывает вклад, а не баланс. Публичный бар
  двигается только после server receipt — optimistic-контур puzzles ко
  вкладу не применяется. Церемония остаётся дискретной: «ты принёс 20
  лапок» → бар сдвинулся. Если результат принят сервером после запуска
  следующего кейса — вклад идёт в новый ACTIVE, и receipt явно это
  показывает. Вклад, пересекающий token goal, делится детерминированно:
  до цели — текущему кейсу (он проходит UNLOCKED), остаток — новому
  ACTIVE; один receipt с двумя allocation-строками. Источник вклада —
  «завершённая qualified-серия» (не отдельный уровень), дейлик,
  завершение коллекции.
- **Дейлики — источник вклада** (решение оператора); веса источников —
  versioned config.

## 3. Коллекции — строить server-owned

Сейчас: клиент `src/collections.ts` — один хардкод-набор
(«Золотые хиты», 10 карт), дроп карточек из сундука «presentation-only»
(1–3 карты всегда, прогресс НЕ меняется — комментарий в
`feed.ts:4834`), прогресс в localStorage с демо-предзаполнением; фид
прогресс никогда не пишет. Backend: **0 таблиц, 0 endpoints**.

Строить:
- Server-owned инвентарь/прогресс + дроп как server-derived receipt
  (детерминированно от run_id, тем же паттерном, что rewards);
  клиентский дроп из сундука перестаёт быть косметикой.
- Сезонная привязка коллекции (коллекция сезона-кейса), архив +
  дозакрытие, универсальные фрагменты.
- Токены за завершение коллекции («заметно больший вклад» + малая
  церемония).
- «Попросить помочь»: ссылка сезон+карточка+отправитель → qualified
  серия друга → receipt: фрагмент владельцу, токены помощнику. Реюз:
  `island_friend_codes`/`island_friendships` (соц-граф уже есть,
  включая `source='challenge'`), deep-link паттерн challenge.
- Контент-пайплайн карточек сезона: первую коллекцию собираем руками
  (как и drop-config), НЕ ставя её в зависимость от setting factory;
  фабричная тематизация — позже, отдельным шагом.

## 4. Остров → приют — ретемить, UGC-центр заморозить

Реюз (backend): `island_states` (CAS-снапшот) как образец состояния
карты приюта; social-проекции и журналы; notification outbox; соц-граф
друзей; advisory-lock паттерны. Клиент: `island.ts` (4279 строк) —
SVG-карта, церемонии апгрейда, полёты — годится как каркас
приют-поверхности (карта: текущий кейс + монумент FULFILLED + личная
витрина с коллекциями/кипсейками).

Заморозить (уходит из центра, код остаётся за флагами):
- UGC-генерация в острове: `bakeAndHost`, `generatePackage`,
  `runExperiment`, `publishExperiment` (island.ts), `island_bake_jobs`,
  `island_theme_jobs`, swipe-ugc воркер — расширение только после
  отдельного доказательства пользы для PFG (VISION).
- Механики-как-здания и рост от чужих плеев; гостевые визиты и
  visit-award карточка после сундука (`island_visit_awards`) —
  отложены до gap-анализа приюта v2.
- **Боты**: bot scheduler (`app/island_bots.py`) — human-true инвариант
  запрещает бот-факты на миссионных поверхностях. Приютские поверхности
  строятся без бот-источников с первого дня; legacy-остров выключается
  полным пакетом Этапа 0 (см. ниже).
- «Кто-то сыграл» поллинг (`pollIslandActivity`, feed.ts:4616) →
  перенастроить на миссионные факты («кто-то внёс», «случилось
  хорошее» после FULFILLED).

Namespace-решение: **новый `mission_*` рядом, island_* не мигрируем и
не делаем authority приюта** — переиспользуются паттерны и визуальные
компоненты, не семантика данных.

**Пакет полного выключения острова (Этап 0; решение оператора
30.07.2026, состав дополнен кросс-ревью):** четырёх `ENABLE_ISLAND_*`
флагов недостаточно — в `swipe-backend/app/main.py:193+` безусловно
монтируются `island_state_router`, старые public/visit/like routes,
theme- и bake-generation, а `ISLAND_REWARDS_ENABLED` имеет default
**true**. Полный пакет:
1) выпустить клиент без island/visit/notification-флагов;
2) `ENABLE_ISLAND_SOCIAL/BOTS/VISIT_AWARDS/NOTIFICATIONS = false`;
3) явно выставить `ISLAND_REWARDS_ENABLED = false`;
4) добавить верхнеуровневый gate для state/public/theme/bake routes —
   иначе кэшированный клиент или прямой запрос продолжит ходить в API
   и создавать model/storage cost;
5) данные не удалять.
`ENABLE_ISLAND_CLOSED_DELIVERY` **остаётся включённым** вместе с
moderation/recall — это защитный read-path уже опубликованных
private-UGC артефактов, не engagement-механика.

## 5. Share/campaign — переякорить challenge-рельс

Есть и работает: challenge v1 бэкенд (specs/bindings/events/receipts,
`mini_app_deep_link`, share_url), клиентская пилюля на series-win,
`ENABLE_CHALLENGE_V1` off в проде; вход игрока — `swipe-bot`
(startapp).

Строить/менять:
- Campaign-ссылка текущего кейса — тот же server-issued deep-link
  паттерн; приём startapp-параметра кейса в `main.ts` (рядом с
  `i_`/`f_`/uuid-challenge).
- Пометка campaign-привлечённых юзеров (для исключения из holdout) —
  на моменте первой сессии.
- CTA-стек series-win пересобрать: вклад-церемония (главная) →
  campaign share → challenge (вторичен).
- «Попросить помочь» — третий линк-тип (см. §3).

## 6. Подписка/monetization — не строить

Кода подписки нет нигде (ни флага, ни таблицы). По VISION — включение
не раньше числовых когорт, после legal review. Единственное требование
сейчас: impact pool ledger проектировать с полем источника
(seed | revenue_share | partner | subscription_share), чтобы позже не
мигрировать.

## 7. Holdout и телеметрия — строить по готовому образцу

Есть: `feed_policy_assignments` — ровно нужный паттерн (immutable
ITT-назначение до первой инспекции, UNIQUE (user, namespace, kind),
receipt+digest, composite-FK пин из потребителей); простой inline
вариант — `island_visit_awards.holdout` + `_bucket(seed)`.

Строить: mission-namespace assignment (exposure gate всей миссионной
поверхности на клиенте), delayed re-exposure, исключение
campaign-трафика. **Authority-граница:** факты вклада и exposure —
только server-derived (contribution receipts, assignment receipts);
best-effort cp/client events — вспомогательная телеметрия, не
authority. **Отчётность — отдельный mission experiment/report контур:**
контракт C1 прямо исключает retention и causal-гипотезы — C1 даёт
только игровые знаменатели; North Star дерево миссии (leading mission /
impact operations / anti-metrics) — в новый отчёт +
`platform-scheme/hypotheses.json`. Инфраструктуру holdout можно
включить с когорты 30–50, но causal-вывод — только после power
calculation (вероятно, сотни пользователей); для friend cohort все
видят миссию.

## 8. Фабрика/консоль/деплой — точечные правки

- **swipe-generator** (фабрика + Lab-консоль): ядро не трогается.
  Позже: сезонная тематизация брифов (`night.series-brief.v1`,
  setting-фабрика под тему кейса), возможный Lab-экран кейсов. TMA
  publish-паттерн (`catalog.promotion-binding`, Approve только в
  Telegram) — реюз для кейсов, см. §1.
- **platform-scheme**: правило репо — после правки VISION.md
  пересобрать и переопубликовать схему (build.mjs вшивает VISION с
  провенансом). **Немедленный долг после `cbe08ac`.**
  `hypotheses.json` (asOf 2026-07-28) — обновить под миссионные
  гипотезы.
- **Корневые доки**: CLAUDE.md — добавить durable-строку о пивоте и
  миссионном контуре (после первых миграций); AGENTS.md — карта нового
  контура; AGENT-ROLES.md — impact-authority уже в VISION.
- **swipe-bot** — точка входа campaign-ссылок (см. §5);
  playables/деплой-контур не затрагивается.
- Мок `?metaworld=1` (Creator District, `metaTokens`) — мёртвый
  прототип, кандидат на удаление при ретеминге бара (вопрос №4).

## 9. Не трогать

feed_* shadow/effectful/sequencing контур (≈50 таблиц — ортогонален),
каталожный контур и его гейты (`levelSeries=false` неизменен), legacy:
`p4g-platform`, `play4good`, `play4good_test`, `liveops-shared`,
`platform-bot`, `solitaire-core`/`mahjong-core`/прочие старые пакеты,
`playables-feed-deploy` (stale worktree).

## 10. Последовательность

- **Этап 0 (сейчас):** VISION v3.0.1 зафиксирован (`96df90a`:
  авто-вклад, rolling pool); осталось: пересборка platform-scheme;
  полный пакет выключения legacy-острова (§4); durable-запись в
  CLAUDE.md.
- **Этап 1 — Mission-slice v0 (founder dogfood):** backend `mission_*`
  ядро (контракт кейса + посев/резервирование + журнал вкладов +
  UNLOCKED receipt + ручное FULFILLED evidence через операторский
  паттерн), минимальная клиентская поверхность кейса + вклад-церемония;
  всё default-off; реальный маленький кейс с локальным приютом.
  Параллельно (вне кода): договорённость с приютом, права на медиа,
  формат отчёта.
- **Этап 2 — server-owned коллекции:** инвентарь, server-derived дропы,
  сезонная привязка, токены за завершение.
- **Этап 3 — приют v1:** карта (кейс + монумент + витрина) за вкладкой
  «мета» вместо острова.
- **Этап 4 — campaign share + «Попросить помочь».**
- **Этап 5 — holdout-инфра** (перед когортой 30–50).

Каждый этап — по существующей культуре: default-off флаги, append-only
receipts, dry-run CLI, author≠reviewer, операторские гейты.

## Решения оператора (30.07.2026, включая кросс-ревью Codex)

1. **Валюта вклада: puzzles → «лапки» в UX, без миграции ledger** —
   исторический puzzle-баланс вкладом не становится; новые лапки =
   отдельные contribution receipts (§2).
2. **Вклад — автоматический**: server-owned receipt за завершённую
   qualified-серию / дейлик / коллекцию, без личного кошелька и
   spend-акта, без optimistic UI; церемония дискретна. Зафиксировано в
   VISION v3.0.1 (`96df90a`).
3. **Legacy-остров выключить сейчас полным пакетом** (см. §4:
   +`ISLAND_REWARDS_ENABLED=false`, +верхнеуровневый gate безусловно
   смонтированных routes; closed delivery + moderation/recall остаются
   включёнными; данные не удаляются).
4. **Дейлики — источник вклада: да**; веса — versioned config.
5. **`?metaworld=1`** — подтверждено: удалить при ретеминге бара
   (Этап 3).
6. **Параметры карточных дропов и первая коллекция** — руками в
   versioned config, без зависимости от setting factory.

Следующий шаг: ТЗ Этапа 1 (mission-slice v0) + пакет выключения
острова (Этап 0).
