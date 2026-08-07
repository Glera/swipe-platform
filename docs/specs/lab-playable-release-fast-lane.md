# ТЗ: быстрый выпуск playable-механик через Labs

Статус: **IMPLEMENTING — продуктовая схема утверждена оператором 06.08.2026;
Fast Lane core включён, автоматический Telegram intake и жизненный цикл
фабрик проходят dogfood 07.08.2026**.

Область: только first-party прототипы из `playables`, опубликованные в
дефолтной swipe-ленте. Это временный быстрый контур для стадии без аудитории,
а не универсальная release-платформа.

После двух успешных dogfood-проходов этот документ заменяет штатный
операторский UX из `swipe-backend/docs/specs/mechanic-onboarding.md` для
first-party content-only изменений. Composer остаётся ручным fallback.

## 1. Результат

Оператор работает только в Labs, Telegram и Mini App:

```text
Telegram-задача из живой механики
  → bounded-агент меняет только exact playable
  → supervisor проверяет diff, тесты, build и visual proof
  → Labs автоматически готовит candidate
  → одно точное подтверждение в Telegram
  → Labs публикует и проверяет production
  → оператор открывает Mini App
```

Git остаётся обязательным audit trail и механизмом rollback, но не является
операторским интерфейсом. Оператор не открывает GitHub, не запускает команды в
терминале, не создаёт Render-ключи и не нажимает Manual Deploy.

Временные целевые бюджеты от отправки bounded Telegram-задачи до проверяемого
production (для уже готового commit ручной fallback просто пропускает agent-шаг):

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
7. **Прототипный quality budget.** Затронутые тесты, runtime smoke, сборка,
   preview и covers обязательны. Полный многочасовой release/review-контур
   запускается только при изменении shared runtime, backend/DB или по явному
   запросу оператора.
8. **Один запуск Mini App.** Новая `/session` должна быть применена до первого
   mount; двухсессионное staging roster не должно оставаться частью
   операторского acceptance.

### 2.1 Два уровня проверки: dogfood и «Открыть всем»

Fast Lane по умолчанию выпускает изменение только в `exact-user` dogfood для
разрешённых Telegram ID. В этом режиме автоматическая проверка делится не на
«строгую» и «выключенную», а на два разных типа требований:

| Тип | Dogfood | Что относится |
| --- | --- | --- |
| **Техническая безопасность** | всегда блокирует release | механика собирается и монтируется; не падает; принимает реальный ввод; игровая петля продвигается; уровень принципиально проходим; restart очищает старое состояние; нет runtime-ошибок, зависаний и неограниченного ожидания |
| **Геймфил** | не блокирует изменение внутри существующих versioned bounds; оценивается оператором в Mini App | продолжительность, скорость, сложность, размеры элементов, анимации и звук |

Это не универсальная галочка **Игнорировать тесты**. Изменение структурного
runtime-контракта, выход за versioned bounds или любой провал технической
безопасности остаются `blocked`. Но тест не может замораживать старое
балансное число только потому, что оно раньше было golden: если длительность
зависит от разрешённой tuning-настройки, технический proof обязан проверять
достижимость в вычисляемой границе, а не требовать прежний темп.

Цикл прототипа:

```text
правка из Telegram
  → строгий technical profile
  → exact-user dogfood release
  → игра и полишинг с телефона
  → отдельное «Открыть всем»
  → technical profile + строгая gamefeel-приёмка
```

Действие **Открыть всем** не является частью каждого Fast Lane update и в v0
ещё не реализовано: до живой широкой аудитории оно получит отдельный exact
release plan, human gamefeel review и rollout authority. Нельзя неявно
расширить `exact-user` candidate на всех игроков.

Для поддерживаемой механики source-agent запускает явный
`test:<mechanic>:technical`. Presentation/layout golden-проверки могут
оставаться в широком suite или отдельном `:gamefeel`, но не должны блокировать
dogfood только из-за осознанного изменения вкусового параметра. При этом
browser/lifecycle proof технического профиля нельзя заменить одним unit-тестом
на tuning-константу.

## 3. Временные границы v0

- один operator Telegram account из существующего allowlist;
- один локальный Labs на доверенной машине;
- один production origin `swipe-platform.onrender.com`;
- first-party playable уже находится в `playables/master`;
- source commit готовит bounded-агент в изолированном worktree; ручной
  IDE/готовый commit остаётся fallback, оператор не нажимает GitHub-кнопки;
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
- автоматическое начало exact Telegram approval; кнопка в Labs остаётся
  аварийным fallback, но не входит в happy path.

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

Шаг раскрывается в короткий лог с входами, длительностью и receipt. Ошибка
остаётся на своём шаге; Labs предлагает **Повторить этот шаг**, а не начать
процесс заново. Изменившиеся bytes всегда требуют нового candidate и нового
Telegram intent.

Минимальная state machine:

```text
DRAFT → PREPARING → READY_FOR_APPROVAL → AUTHORIZED
      → PUBLISHING_STATIC → APPLYING_FEED? → VERIFYING → LIVE
                           ↘ FAILED
```

`APPLYING_FEED` существует только для `add`.

### 4.3 Что хранится

Labs ведёт простой append-only JSON journal под своим существующим `.data`, а
не новую распределённую workflow-систему. Release record содержит:

- `releaseId`, mode, playable/catalog identity;
- source SHA и список затронутых source paths;
- candidate runtime/version/digests;
- before/after cover digests;
- test summary;
- exact Telegram-authorized intent digest и actor;
- static Git commit и production manifest digest;
- mapping/activation receipts для `add`;
- timestamps, durations, terminal status и failure code.

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
- автоматически снятый кадр либо явно добавленный screenshot;
- текстовая инструкция; диктовка заполняет редактируемое текстовое поле.

Оператор не вводит SHA, UUID или технические identity. Он пишет, например:

> Сделать номиналы карт крупнее; на маленьком экране плохо читаются 10/J/Q/K.

Кнопка **Отдать в работу** создаёт rework request, но не даёт production
authority и поэтому не требует отдельного device code. Authority здесь —
подписанный Telegram `initData` и exact operator allowlist. Запрос попадает в
существующие operator flags/rework/mobile-review контуры, а не в новый
таск-трекер.

Labs читает durable очередь сам. Нормальный путь не содержит второго действия
**Взять в Fast Lane**: при подключённом Mac oldest-open задача автоматически
получает bounded source-agent, exact source commit и один release job. В UI
Labs ручная подстановка остаётся только раскрываемым fallback. На телефоне
состояние `open|claimed` перечитывается с backend после каждого запуска Mini
App, поэтому «В работе» не является page-local оптимистической меткой.

Если bounded-агент или supervisor останавливается до candidate, Labs переводит
durable execution-проекцию задачи в `blocked`, не меняя исходный request и не
создавая release. В ленте правая кнопка становится янтарно-красной **`! Нужна
помощь`**; по нажатию видны исходная инструкция, короткая безопасная причина и
буквальное подтверждение, что изменения не опубликованы в production. Сырой
лог модели/тестов в TMA не передаётся. Тот же первый переход в `blocked`
best-effort отправляет оператору Telegram-сообщение со ссылкой **Открыть
SwipeIt**; durable badge остаётся гарантированным fallback при временном сбое
Telegram. Идемпотентное повторение той же проекции не дублирует сообщение. После
исправления supervisor recoverable reset архивирует вместе journal и прежний
visual proof, затем execution возвращается в `accepted`; обычный Fast Lane
продолжается без новой пользовательской задачи и без operator-клика в Labs.

Развёртывание этой additive execution-проекции имеет фиксированный rolling
порядок: сначала backend migration и route (обычный `accepted` сохраняет прежние
bytes wire), затем Feed, умеющий читать оба wire, и последним Generator-writer.
Так старый Generator остаётся работоспособным до своего обновления и ни один
writer не обращается к отсутствующему route. Backend добавляет `execution`
только для `blocked`; после создания первой blocked-проекции откат Generator к
версии без поддержки `execution` запрещён.

Когда candidate готов, бот присылает сообщение:

```text
Klondike · доработка готова
«Увеличить номиналы карт»

[Поиграть в candidate] [Нужна ещё правка] [Принять и опубликовать]
```

Candidate обязан открываться с телефона по HTTPS; `localhost` не является
mobile preview. **Принять и опубликовать** совмещает taste-acceptance результата
и единственный exact `feed.playable-release:write` Approve. Второго desktop- или
GitHub-подтверждения нет. После live verification бот присылает **Открыть в
ленте**.

Если нужна ещё правка, новый комментарий создаёт следующий semantic cycle того
же root request с сохранённой историей parent → candidate → feedback.

### 4.5 Что доступно с телефона, а что требует вычислителя

С телефона оператор может:

- пометить exact механику прямо во время игры;
- оставить текст/диктовку и screenshot;
- отправить задачу в работу и видеть её timeline;
- сыграть в HTTPS candidate;
- запросить следующий rework cycle;
- принять exact candidate и разрешить production;
- открыть и проверить live-версию либо запросить rollback.

Редактирование source, сборка, тесты и Git выполняются агентом на вычислителе.
Оператору компьютер для них не нужен, но в v0 этим вычислителем остаётся
локальный Mac с Labs. Backend хранит входящую задачу, пока Mac offline; UI честно
показывает **Ждёт подключения Labs**. Always-on cloud runner, удалённая IDE и
browser code editor намеренно не входят в v0.

### 4.6 Изменение runtime и готовые фабрики

Release не удаляет и не пересобирает все фабрики рефлекторно. По exact source
diff и old/new runtime digest Labs детерминированно присваивает затронутым
фабрикам один из трёх статусов:

- `current` — runtime bytes не изменились либо diff только presentation/assets;
- `needs_revalidation` — правила/темп runtime изменились без изменения
  versioned contract; готовые фабрики и их история сохраняются, но новые
  generation effects через них fail-closed до повторной проверки;
- `incompatible` — изменён contract/schema/runtime adapter; candidate можно
  сыграть, но публикация блокируется до обновления или retirement фабрики.

Для `runtime_tuning` затрагивается level-design factory; setting factory не
перезапускается без contract evidence. Contract-breaking изменение затрагивает
обе. Модель не выбирает класс сама: classifier использует только paths и
versioned digest. Исторические outputs остаются доступны как evidence и не
становятся «актуальными» молча. Повторная валидация/новая admission — отдельный
асинхронный follow-up; она не добавляет operator-клик в content release.

## 5. Обновление существующей механики — 5–10 минут

### 5.1 Preparation

Labs:

1. проверяет, что source commit достижим из `playables/master`;
2. определяет существующий playable в production `versions.json`;
3. запускает mechanic unit tests, swipe build и runtime smoke;
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
6. помечает release `LIVE` и показывает **Открыть в Mini App**.

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
- одобренный exact job можно безопасно продолжить после transport failure в
  пределах 60 минут; changed bytes/plan требуют нового кода;
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
| Static push CAS conflict | перечитать master и пересобрать candidate; старый intent сгорел |
| Static опубликована, live bytes не совпали | не выполнять mapping/roster; release `FAILED` |
| Mapping/roster apply упал | статика инертна; exact request можно resumed/replayed |
| Ответ apply потерян | сначала перечитать projection; blind second mutation запрещена |
| Update оказался плохим | кнопка rollback готовит новый exact release из предыдущей истории и требует новый Telegram Approve |
| Новая механика оказалась плохой | CAS-активировать предыдущий roster; статика может остаться инертной |

## 10. Минимальные implementation-пакеты

1. **Mobile capture**: operator-only действие в feed/TMA → существующий
   flags/rework outbox; exact context, инструкция и screenshot; offline Mac
   допускается.
2. **Automatic source intake**: oldest-open очередь → bounded subscription
   agent в isolated worktree → path budget → mechanic tests/build/visual proof
   → exact source commit с `Rework-Request` trailer; без auto-retry.
   Source directory разрешается exact-first (`<playableId>/`, если существует),
   и только затем через снятие `-swipe`; это не позволяет старому base-fork
   затереть одноимённый Swipe runtime. Общие dependencies подключаются только
   после завершения model-edit и проверки полного diff.
3. **Labs job + UI**: preparation, candidate preview, covers, timeline и
   локальный journal поверх существующих scripts/jobs.
4. **Mobile candidate review**: HTTPS candidate, следующий rework cycle и
   terminal accept из Telegram.
5. **Exact Telegram authority**: новый one-shot scope/binding и один apply
   endpoint для builtin mapping+roster. Предпочтительно без новой DB-таблицы.
6. **Static executor**: CAS, export, Git content commit/push и live verifier.
7. **Factory impact**: append-only local status, fail-closed selection и
   visible `current|needs_revalidation|incompatible` projection. Отдельная
   revalidation принимает только exact latest impact digest + runtime digest +
   новый evidence digest и append-only возвращает затронутый kind в `current`;
   произвольный «factory passed» статус старый impact не снимает.
8. **One-open roster delivery**: применить fresh `/session` до первого mount в
   новой Mini App-сессии.
9. **Один enabling deploy** backend/Labs/feed. После него content-only releases
   не требуют backend или Render deploy.

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
| Модель сделала лишние изменения | Labs показывает source diff, playable candidate и covers; Approve связан с exact bytes |
| Модель или build вышли за exact playable | Supervisor допускает только bounded paths/files/lines; нарушение не создаёт source commit и не запускает release |
| Обновлён runtime готовой фабрики | Presentation не мешает; tuning помечает `needs_revalidation`; contract change блокирует publish |
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

- [ ] оператор отправил задачу из живой механики и не использовал Labs-button/terminal/GitHub/Render;
- [ ] source commit с exact request trailer создан автоматически после bounded checks;
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
- [ ] release timeline и final approval были доступны в Telegram;
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
