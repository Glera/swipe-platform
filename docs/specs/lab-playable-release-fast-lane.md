# ТЗ: быстрый выпуск playable-механик через Labs

Статус: **утверждённая продуктовая схема; v0 реализован в пакетах, независимо
проверен и не считается включённым до отдельного enabling deploy и dogfood**.

Область: только first-party прототипы из `playables`, опубликованные в
дефолтной swipe-ленте. Это временный быстрый контур для стадии без аудитории,
а не универсальная release-платформа.

После приёмки enabling deploy этот документ заменяет штатный операторский UX
из `swipe-backend/docs/specs/mechanic-onboarding.md`. До этого действующим
остаётся текущий Composer-процесс.

## 1. Результат

Оператор работает только в Labs, Telegram и Mini App:

```text
готовый source commit
  → Labs готовит и показывает candidate
  → одно точное подтверждение в Telegram
  → Labs публикует и проверяет production
  → оператор открывает Mini App
```

Git остаётся обязательным audit trail и механизмом rollback, но не является
операторским интерфейсом. Оператор не открывает GitHub, не запускает команды в
терминале, не создаёт Render-ключи и не нажимает Manual Deploy.

Временные целевые бюджеты от готового source commit до проверяемого production:

| Сценарий | Полное время | Активное время оператора |
| --- | ---: | ---: |
| Обновить существующую механику | **5–10 минут** | ≤ 1 минуты |
| Добавить новую механику | **15–20 минут** | ≤ 2 минут |

Это пилотные product targets, не SLA. Выход за бюджет должен быть виден в
истории конкретного релиза и приводить к упрощению или ускорению шага, а не к
добавлению новых ручных церемоний.

## 2. Принципы упрощённого контура

1. **Один release-job для двух сценариев.** Update и add используют одну
   state machine, один UI, один Telegram intent и одну историю.
2. **Одно human-решение.** Один код подтверждает exact release plan. Нельзя
   отдельно подтверждать static, mapping и roster.
3. **Authority связана с bytes.** Подтверждение содержит source SHA, mechanic,
   runtime digest, cover digests, режим `update|add` и, для новой механики,
   exact placement/CAS.
4. **Публикация content-only не является backend release.** Обычный update не
   трогает backend, БД, Render или roster.
5. **Новая механика становится видимой последней.** Сначала публикуется и
   проверяется статика, затем атомарно создаются server-owned identity/mapping
   и CAS-активация roster. Незавершённый релиз остаётся невидимым игроку.
6. **Обложки пересобираются автоматически.** Оператор не должен помнить о
   дополнительной галочке после визуальной правки.
7. **Прототипный quality budget.** Затронутые mechanic tests, сборка, играбельный
   HTTPS candidate и covers обязательны. Отдельный автоматический runtime smoke
   и полный release/review-контур запускаются при изменении shared runtime,
   backend/DB или по явному запросу оператора; в content-only v0 smoke выполняет
   оператор, играя candidate перед Approve.
8. **Один запуск Mini App.** Новая `/session` должна быть применена до первого
   mount; двухсессионное staging roster не должно оставаться частью
   операторского acceptance.

## 3. Временные границы v0

- один operator Telegram account из существующего allowlist;
- один локальный Labs на доверенной машине;
- один production origin `swipe-platform.onrender.com`;
- first-party playable уже находится в `playables/master`;
- source PR/merge готовит агент/IDE; оператор не нажимает GitHub-кнопки;
- для новой механики series length по умолчанию равен `1`;
- кастомная series policy допустима только если она уже выражается versioned
  content config без backend/client deploy;
- новая механика добавляется в существующий default roster по одному anchor;
- нет расписаний, cohort rollout, multi-environment promotion, параллельных
  approver-ов и автоматической публикации без человека;
- независимый review не является гейтом прототипной content-only правки.
  Он остаётся обязательным для shared runtime, backend/DB, credentials и иных
  изменений контура «ядро».

V0 не должен хардкодить конкретный Telegram ID в UI или release job. Он читает
server-owned capability текущего пользователя, даже если на первом dogfood
capability выдана только оператору.

## 4. Поверхность Labs

Внутри **Композера** появляется секция **Релизы механик**. Новый отдельный
продукт или generic workflow builder не создаётся.

### 4.1 Карточка подготовки

Поля и действия:

- mechanic/playable selector;
- source commit (по умолчанию exact `playables/master`);
- автоматически определённый режим `update` или `add`;
- для `add`: `catalogMechanic`, `mechanicFamily`, anchor/позиция и
  `seriesLength=1`;
- кнопка **Подготовить обновление** / **Подготовить новую механику**;
- candidate iframe;
- before/after covers;
- exact diff production manifest;
- кнопка **Подтвердить публикацию в Telegram**.

### 4.2 История шагов

Каждый релиз получает `releaseId` и видимую временную шкалу:

```text
13:21  Source зафиксирован
13:23  Swipe build завершён
13:24  Тесты пройдены
13:25  Обложки пересобраны
13:26  Candidate готов
13:28  Подтверждено в Telegram
13:29  Статика опубликована
13:30  Production digest совпал
13:30  Live
```

V0 показывает время и имя последних шагов, candidate, terminal receipt и
короткую безопасную ошибку; append-only journal сохраняет полную связь событий.
Раскрываемые command logs и вычисленные длительности добавляются только если
первые dogfood не позволяют понять превышение бюджета. Ошибка остаётся на своём
шаге; Labs предлагает **Повторить этот шаг**, а не начать процесс заново.
Изменившиеся bytes всегда требуют нового candidate и нового Telegram intent.

Минимальная state machine:

```text
DRAFT → PREPARING → READY_FOR_APPROVAL → AUTHORIZED
      → PUBLISHING_STATIC → APPLYING_FEED? → VERIFYING → LIVE
                           ↘ FAILED → retry
      READY_FOR_APPROVAL/FAILED → CANCELLED
```

`APPLYING_FEED` существует только для `add`.

### 4.3 Что хранится

Labs ведёт простой append-only JSON journal под своим существующим `.data`, а
не новую распределённую workflow-систему. Release record содержит:

- `releaseId`, mode, playable/catalog identity;
- source SHA;
- candidate runtime/version/digests;
- before/after cover digests;
- test summary;
- exact Telegram-authorized intent digest; actor остаётся в backend
  device-auth authority и typed add receipt, а не копируется caller-ом;
- static Git commit и production manifest digest;
- mapping/activation receipts для `add`;
- timestamps, terminal status и failure code. V0 выводит длительность из
  соседних timestamps; отдельный per-step metrics store не создаётся.

Git хранит исходники и опубликованные bytes. Backend остаётся authority mapping
и roster. Labs journal только связывает их для операторской истории.

### 4.4 Mobile-first вход из живой ленты

Оператор должен иметь возможность начать весь цикл с телефона в момент игры,
не вспоминая позже, где и что было не так.

Для exact operator Telegram ID на карточке/в меню механики появляется действие
**Доработать механику**. Оно открывает TMA-форму, уже связанную с server-owned
контекстом текущего показа:

- `playableId`, mapping и roster activation;
- production runtime version/digest;
- уровень/ordinal, seed и session/run identity, если они есть;
- позиция в ленте и timestamp;
- явно добавленный screenshot либо честный `not_attached`; автоматический кадр
  добавляется позже только при реально доступном capture API;
- текстовая инструкция; диктовка заполняет редактируемое текстовое поле.

Оператор не вводит SHA, UUID или технические identity. Он пишет, например:

> Сделать номиналы карт крупнее; на маленьком экране плохо читаются 10/J/Q/K.

Кнопка **Отдать в работу** создаёт rework request, но не даёт production
authority и поэтому не требует отдельного device code. Authority здесь —
подписанный Telegram `initData` и exact operator allowlist. Запрос попадает в
существующие operator flags/rework/mobile-review контуры, а не в новый
таск-трекер.

Exact device-auth экран Telegram Mini App показывает:

```text
Klondike · доработка готова
«Увеличить номиналы карт»

[Поиграть в candidate] [Отклонить] [Принять и опубликовать]
```

Candidate обязан открываться с телефона по HTTPS; `localhost` не является
mobile preview. **Принять и опубликовать** совмещает taste-acceptance результата
и единственный exact `feed.playable-release:write` Approve. Второго desktop- или
GitHub-подтверждения нет. После live verification Labs показывает итоговый
receipt; оператор открывает Mini App обычным Telegram-входом.

В v0 Labs показывает одноразовый code/link, а оператор открывает существующий
device-auth экран в Telegram. Проактивная отправка сообщения ботом и push
**Открыть в ленте** — неблокирующее улучшение после первых двух dogfood, если
ручной переход действительно мешает уложиться в 5–20 минут. Отдельный messaging
контур до измерения не строится.

Если нужна ещё правка, оператор отклоняет exact authorization, отменяет
candidate в Labs и создаёт следующий rework из живой ленты. Связанный
многошаговый thread parent → candidate → feedback — улучшение после dogfood.

### 4.5 Что доступно с телефона, а что требует вычислителя

С телефона оператор может:

- пометить exact механику прямо во время игры;
- оставить текст/диктовку и screenshot;
- отправить задачу в работу и видеть её входной статус;
- сыграть в HTTPS candidate;
- запросить следующий rework cycle;
- принять exact candidate и разрешить production;
- открыть и проверить live-версию.

Timeline релиза v0 живёт в Labs; с телефона видны исходная задача, exact
candidate и итоговый approval. Редактирование source, сборка, тесты и Git
выполняются агентом на вычислителе.
Оператору компьютер для них не нужен, но в v0 этим вычислителем остаётся
локальный Mac с Labs. Backend хранит входящую задачу, пока Mac offline; UI честно
показывает **Ждёт подключения Labs**. Always-on cloud runner, удалённая IDE и
browser code editor намеренно не входят в v0.

## 5. Обновление существующей механики — 5–10 минут

### 5.1 Preparation

Labs:

1. проверяет, что source commit достижим из `playables/master`;
2. определяет существующий playable в production `versions.json`;
3. запускает mechanic unit tests и swipe build; операторский runtime smoke —
   обязательная игра в HTTPS candidate перед Approve;
4. для визуально затронутого playable показывает candidate iframe;
5. всегда выпекает tall и compact covers;
6. показывает manifest diff: old/new version, source SHA, runtime digest,
   payload bytes и cover digests;
7. блокирует подтверждение при ошибке build/test/cover или source drift.

### 5.2 Telegram intent

Пример экрана:

```text
Обновить Klondike в production

source: 92f56c0
version: 89239f835a → dee840674f
runtime: sha256:c90451…
изменены: playable, tall cover, compact cover
roster и mapping не меняются

[Подтвердить] [Отменить]
```

### 5.3 Apply

После подтверждения Labs:

1. повторяет CAS `playables/master == authorized source`;
2. повторяет CAS ожидаемой головы `swipe-platform/master`;
3. экспортирует exact candidate в `swipe-platform`;
4. создаёт content commit и пушит `master` существующими локальными Git
   credentials;
5. ждёт production `versions.json` и exact runtime/cover bytes;
6. помечает release `LIVE` и показывает terminal receipt; оператор открывает
   Mini App обычным Telegram-входом.

Mapping, roster, backend и Render не меняются.

## 6. Добавление новой механики — 15–20 минут

### 6.1 Дополнительный input

Labs запрашивает только:

- `playableId`;
- `catalogMechanic` и `mechanicFamily`;
- anchor: «после какой карточки»;
- series length, default `1`.

UUID, mapping digest, roster JSON и activation ID оператор не вводит.

### 6.2 Preparation

Помимо общего update-preflight Labs:

1. доказывает отсутствие collision playable/catalog identity;
2. создаёт deterministic candidate identity и mapping manifest;
3. читает fresh active roster и формирует diff:
   `added=[new]`, `removed=[]`, unrelated reorder=`false`;
4. проверяет anchor и текущий activation CAS;
5. показывает playable, обе обложки и будущую позицию в ленте;
6. формирует один composite release intent.

### 6.3 Telegram intent

```text
Добавить Klondike в production-ленту

source: 92f56c0
playable: solitaire-v1-swipe
catalog: solitaire/klondike
series: 1
позиция: после Minesweeper
roster: +1, removed 0, unrelated reorder false
runtime и covers: sha256:…

[Подтвердить] [Отменить]
```

### 6.4 Apply

Порядок фиксирован:

1. publish static content;
2. verify exact production manifest and bytes;
3. одним backend request под exact authorization:
   - server-side ensure builtin `Variant`;
   - immutable mapping create или exact replay;
   - register target roster;
   - CAS activate target roster;
4. перечитать server projection и убедиться, что exact target active;
5. показать **Live** и открыть Mini App.

Шаг 3 использует существующие mapping/roster сервисы и одну транзакцию. Он не
создаёт generic deployment API. Static, уже опубликованная до ошибки шага 3,
остаётся инертной и безопасной: активный roster на неё не ссылается.

## 7. Telegram authority

Текущее долговечное `feed.roster:write` сохраняется для ручной работы
Композера, но не является разрешением публиковать bytes.

Fast lane получает один новый one-shot scope:

```text
feed.playable-release:write
```

Требования:

- grant не долговечный и не переиспользуется для другого релиза;
- device authorization привязана к JCS digest exact release intent;
- intent показывает mode, source SHA, identities, runtime/covers и весь
  product-visible diff;
- одобренный exact job можно безопасно продолжить после transport failure,
  пока жив memory-only token; после рестарта/expiry Labs запрашивает новый код
  для того же frozen intent, а changed bytes/plan всегда требуют нового кода;
- повтор одного request hash возвращает exact receipt;
- Deny/expiry не оставляют mutation authority;
- существующий Telegram allowlist остаётся единственным actor authority.

Предпочтительная минимальная реализация переиспользует существующий device-auth
контур и его таблицы. Новая универсальная approval-система или отдельный бот не
создаются.

## 8. Политика обложек

- Для `add` tall и compact covers обязательны.
- Для `update` обе обложки пересобираются всегда.
- Labs показывает old/new side-by-side и отмечает identical/changed.
- Обычной галочки «пересобрать» нет: безопасное значение уже выбрано.
- Вторичное действие **Оставить текущую обложку** допустимо только для update,
  требует явной причины и попадает в Telegram intent.
- Missing/invalid cover блокирует релиз. Падение cover-baker не превращается в
  молчаливое сохранение старой картинки.

## 9. Failure и rollback

| Сбой | Поведение |
| --- | --- |
| Build/test/cover | production не меняется; повторяется exact шаг |
| Telegram deny/expiry | production не меняется; candidate остаётся в истории |
| Нужна ещё правка | release становится `CANCELLED`; candidate остаётся инертной историей, lane освобождается |
| Labs/Mac перезапущен во время шага | оборванная фаза становится `FAILED`; повтор использует тот же journal и frozen bytes |
| Static push CAS conflict | перечитать master и пересобрать candidate; старый intent сгорел |
| Static опубликована, live bytes не совпали | не выполнять mapping/roster; release `FAILED` |
| Mapping/roster apply упал | статика инертна; exact request можно resumed/replayed |
| Ответ apply потерян | сначала перечитать projection; blind second mutation запрещена |
| Update оказался плохим | тот же Fast Lane готовит новый update из предыдущего source commit и требует новый Telegram Approve |
| Новая механика оказалась плохой | существующий Composer CAS-активирует предыдущий roster; статика может остаться инертной |

## 10. Минимальные implementation-пакеты

1. **Mobile capture**: operator-only действие в feed/TMA → существующий
   flags/rework outbox; exact context, инструкция и screenshot; offline Mac
   допускается.
2. **Labs job + UI**: preparation, candidate preview, covers, timeline и
   локальный journal поверх существующих scripts/jobs.
3. **Mobile candidate review**: существующий device-auth TMA показывает HTTPS
   candidate, exact summary и terminal accept; proactive bot message — только
   после dogfood при доказанной необходимости.
4. **Exact Telegram authority**: новый one-shot scope/binding и один apply
   endpoint для builtin mapping+roster. Предпочтительно без новой DB-таблицы.
5. **Static executor**: CAS, export, Git content commit/push и live verifier.
6. **One-open roster delivery**: применить fresh `/session` до первого mount в
   новой Mini App-сессии.
7. **Один enabling deploy** backend/Labs/feed. После него content-only releases
   не требуют backend или Render deploy.

### 10.1 Исполнительный выбор v0

Чтобы mobile preview не требовал нового хостинга, Labs переиспользует уже
отработанный паттерн catalog preview:

- exact source собирается во временном detached worktree, поэтому dirty checkout
  оператора и параллельные ветки не затрагиваются;
- candidate до подтверждения публикуется в `swipe-platform` только под
  content-addressed путём `playable-previews/<releaseId>/...`; эти bytes инертны,
  потому что production `versions.json` и roster на них не ссылаются;
- HTTPS candidate открывается с телефона с production static origin;
- после exact Telegram Approve тот же проверенный набор bytes отдельным content
  commit переносится на live-имена и в `versions.json`; повторная сборка между
  approval и публикацией запрещена;
- для `add` backend mapping+roster применяется только после проверки live static;
  для `update` backend вообще не вызывается.

Новый one-shot scope `feed.playable-release:write` добавляется в существующий
device-auth broker и связывается с полным release intent. Та же маленькая
миграция CHECK-ограничений broker-а добавляет одну узкую таблицу входящих
mobile-rework requests: она хранит точный контекст телефона и lifecycle
`open → claimed → closed`, но не является release engine и не получает publish
authority. Release timeline остаётся локальным append-only journal Labs.
Локально сохранённый Stage 2 guard с provisional revision `0074` до интеграции
перенумеровывается поверх фактической головы; два revision с одним номером в
merge-ready ветках одновременно не допускаются.

Пакеты могут быть отдельными PR ради ревью, но являются одной продуктовой
возможностью. Между ними не вводятся operator GO и production ceremonies.

## 11. Явно вне v0

- общий CI/CD-конструктор;
- Render API/ключи и image release для playable content;
- Kubernetes, workers, remote build farm и новая очередь;
- branch/environment promotion matrix;
- scheduled release и multi-approver workflow;
- автоматический taste review и автопубликация моделью;
- cohort/canary rollout;
- редактирование исходного кода в браузере Labs;
- always-on cloud runner и возможность вести разработку при выключенном Mac;
- миграция generated catalog publication в этот контур.

### Будущее: разработчики с доступом не ко всем механикам

На следующем этапе существующий Telegram allowlist должен поддержать несколько
разработчиков, но глобальный `DEV_USER_IDS` нельзя трактовать как право менять
любую механику.

Будущая server-owned assignment должна ограничивать одновременно:

- Telegram user ID;
- exact `playableId`, список механик либо `mechanicFamily`;
- действия: `flag`, `request_rework`, `review_candidate`, `approve_release`,
  `rollback`;
- срок действия и actor, выдавший назначение.

По умолчанию доступ отсутствует. Feed/TMA показывает debug/rework controls
только из capability projection для exact показанной механики. Например,
разработчик Solitaire может помечать и принимать candidate Klondike, не видя
production controls Minesweeper; право финального publish может остаться только
у оператора.

Это **пометка на будущее**, не implementation requirement v0: сейчас один
оператор и никаких UI ролей, матриц доступа или новой таблицы не строится.

## 12. Риски и ограничения

| Риск | Как ограничиваем v0 |
| --- | --- |
| Проект превратится в мобильную IDE/agent platform | Телефон только ставит точную задачу, играет candidate и принимает результат; source редактирует агент |
| Mac выключен | Backend принимает request и показывает `waiting_for_lab`; работа начнётся после подключения |
| Помечена не та версия/уровень | Identity берётся из server-owned показа, не из ручных полей |
| Инструкция с телефона слишком расплывчата | Контекст+кадр прикладываются автоматически; агент может вернуть один bounded уточняющий вопрос |
| Модель сделала лишние изменения | Labs показывает exact source commit, playable candidate и covers; Approve связан с exact bytes |
| Случайная публикация без проверки | Final action доступен из карточки played candidate; Telegram показывает весь product-visible diff |
| Накопится слишком много задач и затрат | Не более одного active rework root на mechanic; без auto-retry; видимые elapsed/model/cost данные |
| Static опубликована, roster apply не прошёл | Новая механика остаётся инертной; exact apply resumable/idempotent |
| 30-дневный roster grant выглядит как publish authority | Release использует отдельный one-shot exact scope; durable grant не принимается |
| Preview доступен только с localhost | Mobile acceptance требует HTTPS candidate; localhost-ссылка блокирует телефонный review |

### Оценка сложности

- mobile capture в существующий flags/rework контур: **низкая–средняя**;
- Labs release job, covers, timeline и static executor: **средняя**;
- mobile candidate delivery + exact Telegram release authority: **средняя**;
- always-on cloud development без Mac: **высокая**, сейчас не оправдана.

Полная ограниченная v0-петля оценивается как **4–7 сфокусированных
инженерных дней** и один enabling deploy. Это оправдано только как multiplier
для регулярной работы над 10+ механиками, а не как отдельная инфраструктурная
инициатива. Stop/go после двух dogfood-проходов:

- update действительно укладывается в 10 минут;
- add — в 20 минут;
- оператор смог начать и закончить оба цикла с телефона;
- не понадобился terminal/GitHub/Render;
- система использована повторно, а не стала одноразовым UI.

## 13. Приёмка

### Update acceptance

- [ ] оператор передал source commit, но не использовал terminal/GitHub/Render;
- [ ] request мог быть создан из live-механики с телефона;
- [ ] preparation и covers завершились автоматически;
- [ ] candidate был доступен и проверен с телефона;
- [ ] Telegram показал exact update diff;
- [ ] было ровно одно человеческое подтверждение;
- [ ] mapping и roster не изменились;
- [ ] production manifest/digest совпали;
- [ ] изменение видно после одного открытия Mini App;
- [ ] полное время ≤10 минут либо превышение объяснено в timeline.

### Add acceptance

- [ ] оператор указал identity/anchor и не переносил UUID/hash между командами;
- [ ] release timeline был доступен в Labs, а candidate/summary/final approval —
  в Telegram;
- [ ] playable, payload и обе covers опубликованы и проверены;
- [ ] Telegram показал exact static+mapping+roster plan;
- [ ] было ровно одно человеческое подтверждение;
- [ ] mapping create/exact replay и roster activation имеют typed receipts;
- [ ] diff содержит только одну добавленную механику на утверждённой позиции;
- [ ] механика видна и играется после одного открытия Mini App;
- [ ] полное время ≤20 минут либо превышение объяснено в timeline.

## 14. Первый dogfood

1. С телефона пометить следующее небольшое изменение Klondike или Minesweeper,
   довести его до update acceptance.
2. Следующую готовую механику провести через mobile/Labs add acceptance с
   `seriesLength=1`.
3. После двух проходов измерить фактическое время каждого шага и удалить всё,
   что не повлияло на correctness или наблюдаемую приёмку.
