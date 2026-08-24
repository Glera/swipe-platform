<!-- Провенанс: авторство Mac B (playables branch codex/arrows-v1-prototype,
commit 3a81b6f, 24.08.2026, case study Ball Drain Rescue). Принят в meta
docs/mechanics как детальная методика evidence-based реконструкции внутри
процесса REFERENCE-REPLICATION-PROCESS (v3 остаётся umbrella-authority
конвейера/гейтов; этот playbook — авторитет на слой «как добываются и
маркируются доказательства»). Researcher full-packs обязаны следовать его
provenance-статусам (OBSERVED/SOURCE/INFERRED/DECISION) и таблицам
Definition of fidelity. -->

# Playbook: реконструкция механики playable по URL и записи с телефона

Версия: 1.0

Статус: процесс для переноса в другой проект; итоговая визуальная и тактильная приёмка остаётся за человеком.
Case study: Ball Drain Rescue по референсу `7eaa081ca0d5aea5`.

## 1. Что именно мы копируем

Цель процесса — не «сделать что-то похожее», а восстановить наблюдаемый контракт механики настолько точно, чтобы различия можно было перечислить, измерить и осознанно принять.

Контракт состоит из шести независимых слоёв:

1. **Логика**: допустимые действия, изменение состояния, условия победы/поражения, отсутствие ходов.
2. **Контент**: размеры поля, начальная раскладка, порядок типов, параметры уровня.
3. **Тайминги и feedback**: длительность swap, откат, удаление, подсказки, задержки terminal state.
4. **Физика**: формы collider-ов, collision matrix, слои, частота spawn, recycling, sensors.
5. **Ad lifecycle**: первый интерактивный тап, CTA, endcard, пауза/resume, момент `mraid.open()`.
6. **Производительность**: число активных тел, CPU/GPU budget, память, деградация на слабом устройстве.

Совпадение только внешнего вида не считается совпадением механики. Совпадение логики на десктопе без реального Android также не считается готовностью playable.

### Граница допустимого заимствования

По умолчанию переносим правила, измеренные параметры и собственную реализацию. Не переносим из референса бренд, тексты, иллюстрации, звук, шрифты, исходные ассеты или обфусцированный runtime. Для сложных проектов полезно вести clean-room журнал: один человек описывает наблюдаемый контракт, другой реализует его по спецификации.

Если продукту нужна буквальная копия визуального контента, права на неё должны быть подтверждены отдельно. Этот документ не заменяет юридическую проверку.

## 2. Главный принцип: сначала доказательства, затем код

Нельзя начинать с догадки «наверное, здесь обычный match-3» или «для performance у них наверняка hard cap». В Ball Drain обе догадки привели к заметному расхождению.

Используем иерархию доказательств:

| Приоритет | Источник | Что он доказывает |
|---:|---|---|
| 1 | Исполняемый код и serialized scene/prefab | Фактические ветки, inspector constants, collision groups, node sizes |
| 2 | Запись реального устройства + CDP trace | Наблюдаемое поведение, тайминги, lifecycle и device-specific проблемы |
| 3 | Синхронная запись клона на том же устройстве | Измеримое отличие от референса |
| 4 | Десктопный browser trace | Быстрая диагностика логики и производительности |
| 5 | Скриншоты и чужие видео | Геометрия и визуальные состояния, но не скрытая логика |
| 6 | Воспоминание/ощущение | Только гипотеза, требующая проверки |

Каждую находку помечаем одним из четырёх статусов:

- `OBSERVED` — видно на видео или в runtime;
- `SOURCE` — подтверждено исполняемым кодом/scene;
- `INFERRED` — вывод из нескольких наблюдений;
- `DECISION` — сознательное продуктовое отличие.

Это не бюрократия. Такая маркировка не даёт продуктовой гипотезе незаметно превратиться в «логику референса».

## 3. Набор артефактов, который должен получить другой проект

Рекомендуемая структура:

```text
mechanics/<mechanic-id>/
  README.md                     # цель, владелец, статус, ссылки
  REFERENCE-MANIFEST.md         # URL, время доступа, hashes, device/build identity
  OBSERVATIONS.md               # события и измерения с provenance
  SPEC.md                       # исполняемый контракт механики
  DELTAS.md                     # осознанные отличия от референса
  FAILURE-LEDGER.md             # ошибки, причины и принятые решения
  TEST-MATRIX.md                # автоматические и ручные проверки
  REVIEW.md                     # статус human acceptance
  recordings/
    reference/raw/
    candidate/raw/
    normalized/
    contact-sheets/
  traces/
    reference/
    candidate/
  frames/
  evidence/
    manifest.json               # SHA-256 всех артефактов
    runtime.json
    device-perf.json
```

Минимальный handoff не должен состоять только из ссылки на билд и устного «там всё как в игре». Другому проекту нужны спецификация, точная версия кандидата, запись референса, запись кандидата, список известных отличий и способ повторить проверки.

## 4. Phase 0 — формулировка задания и критериев приёмки

До исследования фиксируем:

- референсный URL, приложение и нужную сцену;
- целевые сети и лимит размера;
- ориентации;
- минимальный Android/device tier;
- целевую длительность попытки;
- какая часть должна совпадать буквально, а где разрешена адаптация;
- кто принимает визуальное ощущение и на каком физическом устройстве;
- какие события аналитики обязательны;
- разрешено ли открытие store, когда и с какого CTA.

### Definition of fidelity

Для каждого слоя задаём метрику. Пример:

| Слой | Критерий |
|---|---|
| Logic | одинаковые действия дают одинаковый state transition |
| Layout | все 108 типов на тех же клетках |
| Timing | swap 150 ms; invalid round-trip 300 ms |
| Physics | шарик не проходит через закрытую стену; collision groups совпадают |
| Fail | 10+ опасных шариков непрерывно 1 s, затем 8 s countdown |
| Store | trigger не открывает store сам; следующий явный tap вызывает `mraid.open` |
| Performance | device receipt без записи проходит согласованный frame budget |

Фраза «один в один» без таблицы метрик бесполезна: разные участники будут понимать её по-разному.

## 5. Phase 1 — исследование референса по URL

### 5.1 Зафиксировать входной артефакт

Сохраняем:

- полный URL с query string;
- UTC-время доступа;
- HTTP headers и финальный URL после redirects;
- SHA-256 загруженного HTML и каждого обнаруженного bundle;
- screenshot первого стабильного состояния;
- viewport, DPR, user agent, ориентацию;
- console/page errors отдельно от игровых ошибок.

Пример read-only команд:

```bash
curl -L --fail --silent --show-error \
  'https://example.test/playable/index.html' \
  -o reference-index.html
shasum -a 256 reference-index.html
wc -c reference-index.html
```

Сырой файл хранится только как исследовательское доказательство с согласованным доступом; в кандидат и export он не попадает.

### 5.2 Развернуть loader до фактического runtime

У playable HTML часто лишь оболочка. Последовательно ищем:

1. `<script src>` и динамические script injection;
2. `al_renderHtml`, `document.write`, Blob URLs и base64 payload;
3. custom 6/7-bit encoding, gzip/deflate или ZIP;
4. embedded scene JSON, prefabs и inspector values;
5. engine signature: Cocos, Unity WebGL, Phaser, Pixi, custom Canvas/WebGL;
6. SDK wrapper: MRAID, AppLovin, Unity, Meta и другие adapters.

Важно разделять:

- **исполняемый путь**;
- **serialized inspector value**, который реально читает компонент;
- **мертвый код/неиспользуемый prefab**;
- **anti-tamper/obfuscation noise**;
- **wrapper logic**, не относящуюся к игре.

Найденная константа сама по себе ничего не доказывает. Нужно показать, где она читается и в какую ветку попадает.

### 5.3 Статический анализ должен отвечать на вопросы, а не производить тонны текста

Ищем по категориям:

- input: `touchstart`, `pointerdown`, swipe threshold, coordinate transforms;
- board: row/column count, item type/name, initial matrix;
- state: swap, match, clear, refill, reshuffle, no-move;
- physics: gravity, fixed step, iteration count, shapes, filters, sensors;
- spawn/pool: frequency, burst structure, lifetime, recycle condition;
- terminal: win/fail thresholds and delays;
- SDK: `mraid.open`, end markers, CTA overlay and hit area;
- lifecycle: `viewableChange`, visibility, pause/resume, audio;
- tutorial: idle timeout, target selection, cancellation.

Результат статического анализа — не декомпилированный файл, а таблица «вопрос → ответ → доказательство → уверенность».

### 5.4 Динамическое исследование в браузере

Проходим как минимум сценарии:

1. загрузка без касания;
2. первый тап;
3. неправильный ход;
4. правильный ход;
5. быстрое повторное действие во время анимации;
6. первый частично открытый путь;
7. победа;
8. поражение;
9. отсутствие ходов;
10. hide/show tab или host pause;
11. tap по CTA и tap мимо CTA;
12. portrait/landscape resize.

Для каждого события записываем timestamps, изменения DOM/canvas, console, network и SDK calls. Скриншот помогает сравнить состояние, но не заменяет trace.

### 5.5 Сетевые правила важнее поведения сомнительного референса

Даже если старый референс делает агрессивный store handoff, новый playable должен проходить контракт целевой сети. AppLovin запрещает auto-click/auto-redirect, требует, чтобы первый тап был игровым, и предписывает store переход через `mraid.open()`; Unity также запрещает автоматический переход и требует single-file ad без внешних запросов. См. [AppLovin creative specs](https://support-preview.axon.ai/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines), [Unity playable specifications](https://docs.unity.com/en-us/grow/acquire/creatives/playable/specifications) и [IAB MRAID](https://iabtechlab.com/standards/mobile-rich-media-ad-interface-definitions-mraid/).

Различаем два события:

- `ad outcome marker` — аналитический solved/failed/end marker;
- `store navigation` — только новый пользовательский tap по разрешённой CTA surface.

Смешение этих событий породило ошибочное ощущение, что Ball Drain сам отправляет игрока в store.

## 6. Phase 2 — запись референса и кандидата на Android по USB

Десктопная эмуляция полезна для разработки, но не воспроизводит мобильную архитектуру CPU/GPU и особенности WebView. Chrome прямо называет Device Mode приближением и рекомендует проверять на реальном устройстве: [Device Mode limitations](https://developer.chrome.com/docs/devtools/device-mode).

### 6.1 Подготовка устройства

1. Включить Developer options и USB debugging.
2. Подключить устройство исправным data-кабелем напрямую, по возможности без hub.
3. Подтвердить RSA prompt на телефоне.
4. Зафиксировать модель, Android build, Chrome/WebView version, частоту экрана и заряд/температуру.
5. Отключить battery saver, floating overlays и уведомления, если они не являются частью теста.
6. Зафиксировать ориентацию и одинаковую яркость для визуального сравнения.
7. Если показываем касания — включить `Show taps` и вернуть исходную настройку после записи.

Проверка:

```bash
adb devices -l
adb shell getprop ro.product.manufacturer
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
adb shell getprop ro.build.fingerprint
adb shell dumpsys package com.android.chrome | grep -m1 versionName
```

Тестовый receipt должен содержать serial или его стабильный redacted hash, модель, Android, Chrome/WebView version и SHA-256 кандидата.

### 6.2 Открыть локальный кандидат на физическом телефоне

Если dev server работает на Mac на порту `4683`:

```bash
adb reverse tcp:4683 tcp:4683
```

После этого на телефоне открываем `http://127.0.0.1:4683/`. Это официальный рекомендуемый Android workflow: [Access a local development server](https://developer.android.com/develop/ui/views/layout/webapps/access-local-server).

Для удалённой отладки:

1. открыть `chrome://inspect/#devices` на Mac;
2. убедиться, что обнаружен нужный tab;
3. нажать Inspect;
4. использовать Console, Performance, Memory и Network;
5. при нескольких устройствах всегда указывать `adb -s <serial>`.

Подробности: [Remote debug Android devices](https://developer.chrome.com/devtools/docs/remote-debugging).

После теста убрать только созданный mapping:

```bash
adb reverse --remove tcp:4683
```

### 6.3 Два разных прогона: видео и performance

Нельзя выдавать FPS из screen-recording прогона за чистую производительность. Запись кодирует видео и создаёт дополнительную нагрузку.

Обязательны два отдельных прогона одной и той же версии:

- **visual capture** — запись экрана, taps, синхронизация и ручная оценка;
- **no-capture performance** — без screenrecord/screencast, со встроенными timestamps или CDP sampling.

В Mahjong Review 4 именно no-capture receipt на физическом Samsung был источником performance claim; видео использовалось только как визуальное доказательство.

### 6.4 Запись экрана через ADB

Android `screenrecord` пишет MP4, по умолчанию ограничен тремя минутами, не пишет audio и не поддерживает вращение в процессе. Поэтому ориентацию выставляем до старта. Официальное описание: [ADB screenrecord](https://developer.android.com/tools/adb#screenrecord).

Пример portrait-записи:

```bash
adb shell screenrecord \
  --size 720x1280 \
  --bit-rate 6000000 \
  --time-limit 180 \
  /sdcard/p4g-reference-001.mp4
```

Остановить раньше можно `Ctrl-C`, затем:

```bash
adb pull /sdcard/p4g-reference-001.mp4 ./recordings/reference/raw/
ffprobe -hide_banner ./recordings/reference/raw/p4g-reference-001.mp4
```

Если запись самого устройства нестабильна, допустима Android Studio Device Mirroring/recording, но метод обязательно указываем в manifest. Не смешиваем material, снятый камерой другого телефона, с direct screen capture без маркировки.

### 6.5 Сценарий записи

Для референса и кандидата используем один shot list:

1. 2 s стабильного idle после загрузки;
2. первый tap;
3. один invalid move;
4. один valid move;
5. три быстрых последовательных действия;
6. открытие первого пути;
7. terminal win либо fail;
8. tap вне CTA;
9. tap по CTA;
10. 2 s после store call/закрытия тестового mock.

Отдельные ролики делаем для edge cases: нет ходов, pause/resume, orientation, background/foreground, длинный кадр/CPU throttle.

Перед каждым дублем:

- reload страницы;
- очистить только относящееся к тесту состояние;
- дождаться одинакового стартового кадра;
- использовать одинаковый уровень и seed;
- записать дубль и причину брака;
- не выбирать «красивый» дубль с другой логикой.

### 6.6 Нормализация и сравнение видео

Сохраняем raw MP4 без перекодирования. Для анализа создаём производные файлы:

```bash
ffmpeg -i reference.mp4 -vf "fps=10,scale=360:-2" reference-analysis.mp4
ffmpeg -i candidate.mp4 -vf "fps=10,scale=360:-2" candidate-analysis.mp4
ffmpeg -i reference.mp4 -vf "fps=2,scale=240:-2,tile=5x4" reference-contact.jpg
```

Синхронизируем не по началу файла, а по первому однозначному событию: pointer highlight, начало swap или появление первого шарика. Для side-by-side приводим к одинаковому viewport и FPS, но raw originals остаются неизменными.

Измеряем:

- latency от касания до первого изменённого кадра;
- длительность каждого animation leg;
- время до tutorial;
- spawn cadence и видимую плотность;
- момент открытия пути;
- время reveal health bar;
- terminal delay;
- момент появления CTA и момент фактического store call.

Видео само по себе не показывает, почему событие произошло. Тайминги подтверждаем source/CDP, если это возможно.

## 7. Phase 3 — превратить наблюдения в исполняемую спецификацию

### 7.1 State machine

Описываем фазы и разрешённые события:

```text
loading -> ready -> interacting -> terminal-reveal -> endcard
                      |                 |
                      +-> store-armed --+-> store-open (только новый tap)
```

Для Ball Drain полезнее детальная модель:

```text
pointerdown(active brick)
  -> touchCounter += 1
  -> gesture tracks dominant-axis swipe (>20 reference pixels)
  -> swap adjacent pair (150 ms)
       -> no line 3+: reverse swap (150 ms), model unchanged
       -> line 3+: clear union, 400 ms visual collapse
                    -> rebuild collision geometry
                    -> at 500 ms check open paths and remaining moves
```

В спецификации для каждого event указываем:

- preconditions;
- state mutation;
- emitted analytics;
- visual/audio feedback;
- timing;
- whether input remains accepted;
- terminal/lifecycle side effects.

### 7.2 Сначала чистая модель, затем визуал

Модель должна быть детерминированной и не зависеть от Canvas, DOM или wall-clock. Удобный контракт:

```ts
type Transition = (state: Readonly<GameState>, action: Action) => {
  state: GameState;
  events: DomainEvent[];
};
```

Это позволяет:

- проверить точную раскладку и каждый ход;
- генерировать solver witness;
- воспроизводить trace;
- отделять ошибку логики от ошибки рендера/физики;
- ставить timestamps только в orchestration layer;
- хешировать logical state для evidence.

У Arrows один и тот же geometry source использовался для render и collision; solver replay доказывал каждый ход. В Bubble Shooter preview path и released shot path были сведены к одной траектории. Это сильнее, чем отдельная «похожая» визуальная подсказка.

### 7.3 Контент — данные, а не hand-coded side effects

Размер поля, item types, positions и параметры уровней храним как immutable data. Для буквальной раскладки сохраняем:

- dimensions;
- coordinate system и порядок row/column;
- semantic item type;
- визуальную тему отдельно;
- content hash;
- parser/validator;
- solver result.

Тип айтема нельзя определять по текущему CSS color: тема может измениться. В Ball Drain match сравнивает stable `type`, а цвет лишь визуализирует его.

### 7.4 Тайминги храним как измеренные constants

Не разбрасываем `150`, `400`, `500` и `2800` по draw loop. Используем именованные constants с provenance:

```ts
const SWAP_LEG_MS = 150;          // SOURCE: Brick touch handler
const CLEAR_VISUAL_MS = 400;      // SOURCE: cc.tween(... .to(.4 ...))
const ROUTE_CHECK_MS = 500;       // SOURCE: scheduleOnce(..., .5)
const TUTOR_IDLE_MS = 2800;       // SOURCE: guide idle threshold
```

Анимация может быть визуальной, но момент физического удаления collider-а и логической проверки пути обязан быть явно зафиксирован.

## 8. Phase 4 — реконструкция физики

### 8.1 Не начинать с выбора библиотеки

Сначала восстанавливаем физический контракт:

- какие группы сталкиваются между собой;
- какие collider-ы static, dynamic или sensor;
- форма каждого collider-а;
- gravity/initial velocity;
- spawn cadence;
- lifetime/recycling;
- sleep/wake behaviour;
- что происходит на длинном кадре;
- какие слои только декоративные.

После этого выбираем Box2D/Matter/custom analytic solver. Универсальный движок не гарантирует сходство, а собственный solver не гарантирует performance.

### 8.2 Collision matrix важнее общего числа шариков

Визуально «много шариков» может быть несколькими независимыми слоями, которые не сталкиваются друг с другом. Если заставить все слои сталкиваться, получим:

- огромную стоимость broad/narrow phase;
- чрезмерное давление и overlap;
- другую скорость потока;
- другой draw order;
- ложные попадания в sensor.

Каждая группа должна иметь `category`, `mask`, z/draw order и recycle rule. Sensor считает только разрешённые категории.

### 8.3 Object pool не является hard cap

Pool решает allocations, но не разрешает незаметно удалять живой объект. Возможны два разных контракта:

- pool preallocation + instantiate when empty;
- жёсткий максимум с честным прекращением spawn.

Нельзя переиспользовать глубоко лежащий видимый шарик, телепортируя его наверх: игрок видит исчезновение, меняется давление кучи и fail timing. Именно такой промежуточный fix в Ball Drain был отвергнут.

### 8.4 Масштабируем отношения, а не экранные пиксели

Радиус шарика надо выводить из геометрии прохода:

```text
reference passage width / reference ball diameter
  == candidate passage width / candidate ball diameter
```

В Ball Drain масштабирование от общей ширины экрана дало `r=5.1` и узкий проход шириной лишь `2.57` диаметра. По отношению reference cell pitch `57` к diameter `19` получено около `2.95` диаметра; для cell `28` это `r≈4.75`. После этого одноячеечные стоки перестали системно забиваться.

### 8.5 Закрытая стена должна быть математически закрытой

Визуальный gap между tiles не должен становиться физической щелью. Рабочие варианты:

- collider pitch без зазора;
- вертикальное перекрытие соседних row slabs;
- merged collider для непрерывного ряда;
- точные chamfered corners, если они есть у референса.

Но нельзя горизонтально расширять slab в уже открытую колонку: это «лечит протечки» и одновременно пережимает дренаж.

Для Ball Drain финальный подход:

- непрерывные активные блоки ряда объединены в один slab;
- вертикальное перекрытие `1.8 px` закрывает шов рядов;
- горизонтального выступа в пустую колонку нет;
- `cornerRadius=2.5` имитирует срезанные углы и создаёт funnel;
- swept circle-vs-slab/previous-position guard закрывает tunneling на длинном кадре;
- диагностический `embeddedBalls` обязан оставаться нулём в sealed-grid soak.

### 8.6 Удаление опоры должно будить динамические тела

Если физический движок усыпил стопку на block collider-е, удаление collider-а не всегда будит тела. Симптом: клетка очищена, но шарики висят.

После изменения static geometry:

1. rebuild только затронутых/static collider-ов;
2. wake тела в расширенном AABB над изменением;
3. выполнить bounded settling/static pass;
4. проверить отсутствие embedded/stalled balls.

Глобальный wake всех тел допустим в маленьком playable, но лучше измерить его цену.

### 8.7 Fixed step и длинные кадры

Правила:

- physics `dt` ограничен;
- длинный кадр делится на небольшое bounded число slices;
- unbounded catch-up loop запрещён;
- continuous/swept collision нужен для быстрых маленьких шариков;
- renderer может работать реже physics на low tier;
- `requestAnimationFrame` timestamp используется вместо предположения о 60 Hz.

`requestAnimationFrame` приостанавливается в background tabs и имеет частоту дисплея, а не всегда 60 FPS: [MDN requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame). На `visibilitychange` приостанавливаем симуляцию, timers и audio, затем корректно resume: [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API).

## 9. Phase 5 — реализация в правильном порядке

Рекомендуемый порядок вертикальных срезов:

1. **Host shell**: viewport, lifecycle, SDK mock, no external requests.
2. **Pure model**: layout, action reducer, terminal states, solver/checker.
3. **Input mapping**: pointer/touch, thresholds, dominant axis, coordinate transforms.
4. **Flat renderer**: условные shapes без polish.
5. **Feedback timing**: invalid return, clear, hints, terminal reveal.
6. **Physics skeleton**: static geometry и один collision group.
7. **Full collision matrix**: layers, sensors, pooling/recycling.
8. **Store/endcard**: сеть-совместимые CTA surfaces и exact-once events.
9. **Performance tiers**: DPR/effects/render cadence.
10. **Polish**: art/audio/haptics, не меняя state contract.

Каждый срез должен быть проверяем. Если строить весь эффект сразу, визуальная проблема, physics bug и lifecycle bug смешиваются.

### Input и анимации

- Gesture определяется в одной координатной системе после InputMapper.
- Swipe threshold измеряется относительно reference logical canvas, не случайного CSS scale.
- Invalid swap проходит полный forward leg и полный reverse leg.
- В accepted swap логическая модель может commit-иться сразу, но visual/physics milestones должны сохранять reference timings.
- Глобальная блокировка input во время любой анимации делает механику вязкой. Блокируем только cells/objects, которые реально участвуют в конфликтующей анимации.
- Tutorial прекращается на реальном пользовательском input и не перехватывает gesture.

## 10. Phase 6 — performance для слабых Android

### 10.1 Измеряем три бюджета отдельно

1. **CPU frame time**: simulation, collisions, model, render submission.
2. **GPU/fill rate**: canvas backing size, overdraw, alpha, shadows, blurs.
3. **Memory/GC**: live objects, arrays/maps per frame, decoded assets, pool growth.

При 60 Hz на работу остаётся примерно 10 ms после браузерного overhead; длинная задача свыше 50 ms уже блокирует main thread. См. [Rendering performance](https://web.dev/articles/rendering-performance) и [Optimize long tasks](https://web.dev/articles/optimize-long-tasks).

### 10.2 Приёмы, доказавшие полезность

- spatial hash по independent collision groups;
- merged static row slabs вместо 108 отдельных collider-ов;
- rebuild static geometry только после match;
- Canvas paths batch-ами по layer/color;
- отключение outlines, highlights, shadows и particles на low tier;
- backing canvas `DPR=1` для схематичного арта;
- render cap 30 FPS на low, physics на каждом доступном RAF;
- предвыделенные arrays/objects и нулевые allocations в hot loop;
- pool для временных объектов без visible teleport;
- tight offscreen canvases только для действительно повторяющегося дорогого контента;
- stop/pause loops при hidden/terminal/dispose.

Canvas best practices: группировать drawing calls и заранее рисовать повторяемый дорогой контент в небольшие offscreen buffers, а не в oversized canvas: [Canvas performance](https://web.dev/articles/canvas-performance). Object pools полезны против allocation churn, но требуют контроля роста: [Static memory JavaScript with object pools](https://web.dev/articles/speed-static-mem-pools). Параллельно следим за общей памятью и detached objects: [Monitor total page memory usage](https://web.dev/articles/monitor-total-page-memory-usage).

### 10.3 Что логировать во встроенной диагностике

Для физического playable:

```text
fps / p50 / p95 / p99 / max frame delta
frames >20 ms / >50 ms
simulationMs / physicsMs / renderMs
activeBalls / ballsByGroup / pooledBalls
spawnedTotal / recycledTotal
embeddedBalls / stalledBalls / headRestingBalls
staticColliderCount / pairChecks / solverIterations
DPR / canvas backing size / viewport
pageErrors / unhandledRejections
```

Receipt привязывается к SHA-256 build artifact, устройству и сценарию. Историческая запись другой версии помечается `stale`; её нельзя использовать как доказательство текущего кандидата.

### 10.4 Как снимать no-capture receipt

На физическом Chrome через CDP:

1. открыть страницу с build token в query string;
2. дождаться `interactive=true`;
3. запустить детерминированный scenario;
4. собирать deltas каждого `requestAnimationFrame` не меньше целевой сессии;
5. сохранить p50/p95/p99/max и domain diagnostics;
6. проверить zero page errors;
7. записать `capture: none`;
8. закрыть CDP socket и dispose runtime.

CPU throttling в DevTools полезен как стресс-тест, особенно после калибровки, но не заменяет physical receipt: [CPU throttling calibration](https://developer.chrome.com/docs/devtools/settings/throttling/). Performance panel используем для поиска long tasks и hot functions: [Chrome Performance](https://developer.chrome.com/docs/devtools/performance).

## 11. Phase 7 — QA и доказательства

### 11.1 Пирамида проверок

**Static gates**

- single minified HTML;
- размер и отсутствие external requests;
- видео/изображения в поддерживаемых форматах;
- MRAID calls и store URLs;
- no source maps/debug controls в release.

**Model tests**

- exact initial content hash;
- все action preconditions;
- invalid action не меняет state;
- match/clear union;
- win/fail/no-moves;
- solver witness и replay;
- exact-once analytics.

**Runtime tests**

- pointer/swipe mapping;
- animation milestones;
- pause/resume;
- resize/orientation;
- cleanup всех RAF/listeners/timers;
- no page errors;
- mock `mraid.open` получает ожидаемый URL.

**Physics tests**

- sealed-grid soak;
- long-frame tunneling;
- cell removal wakes stack;
- one-cell drain throughput;
- collision-group isolation;
- sensor threshold/reset;
- natural recycle without visible disappearance;
- terminal stops or continues emission по спецификации.

**Physical device tests**

- visual capture;
- no-capture performance;
- memory over full session;
- touch latency and gesture conflicts;
- store call through MRAID preview;
- portrait and landscape;
- minimum supported device.

**Human review**

- синхронный side-by-side reference/candidate;
- ощущение input и animation weight;
- визуальная плотность и depth order;
- читаемость tutorial/CTA;
- haptics/audio на реальном устройстве;
- финальная отметка accepted/rejected с замечаниями.

Машинные проверки не должны сами утверждать «визуально один в один». В Arrows ambiguous arrowheads и один terminal hook потребовали операторской коррекции после device playtest. В Mahjong первая версия review была отклонена, хотя код работал: autoplay решал всю доску вместо bounded demo двух пар за 4–6 s, а записи не были синхронизированы. Машина доказала новый timing и takeover-ready state, но human gate всё равно остался.

### 11.2 Evidence manifest

Для каждого release candidate сохраняем:

```json
{
  "schema": "mechanic-review.v1",
  "candidate": {
    "gitCommit": "<sha>",
    "artifactSha256": "<sha256>",
    "url": "<published-or-local-url>"
  },
  "reference": {
    "url": "<reference-url>",
    "htmlSha256": "<sha256>",
    "capturedAt": "<ISO-8601>"
  },
  "device": {
    "model": "<model>",
    "android": "<version>",
    "browser": "<version>"
  },
  "artifacts": [
    { "path": "recordings/reference/raw/001.mp4", "sha256": "<sha256>" },
    { "path": "recordings/candidate/raw/001.mp4", "sha256": "<sha256>" },
    { "path": "evidence/device-perf.json", "sha256": "<sha256>" }
  ]
}
```

Если build изменился после записи, evidence не удаляем, но ставим `staleForCandidate: true`.

## 12. Packaging, export и публикация кандидата

### 12.1 Собирать нужно ровно тот artifact, который был проверен

В этом workspace канонический production pipeline для одного playable:

```bash
cd playables
npm run release <playable-id>
shasum -a 256 <playable-id>/dist/index.html
```

`release` выполняет TypeScript strict check, production Vite build, size/single-file gates, source policy, static AppLovin checks и runtime smoke. Если менялись baked assets, сначала выполняем требуемый prerender, затем запускаем `release` повторно. Не подменяем полный release обычным dev build для финального кандидата.

Перед выгрузкой:

- заменить placeholder store URLs;
- проверить `mraid.open()` через local mock;
- пройти AppLovin/target-network preview;
- записать SHA-256 `dist/index.html` в evidence manifest;
- не пересобирать HTML после device review без нового review receipt.

### 12.2 Export repo и Render

Текущий workflow копирует уже проверенный single-file artifact в соседний репозиторий:

```bash
cd playables
npm run export <playable-id>

cd ../playables-export
git diff -- <playable-id>.html index.html
shasum -a 256 <playable-id>.html
git add <playable-id>.html index.html
git commit -m "export <playable-id>"
git push
```

`npm run export` не строит playable: он копирует существующий `<id>/dist/index.html` и заново генерирует listing `index.html`. Поэтому release должен быть выполнен перед export, а hashes source dist и exported HTML должны совпадать.

Render публикует корень `playables-export` как static site. Stable URL имеет вид:

```text
https://playables-export.onrender.com/<playable-id>.html
```

У Render-конфигурации сейчас `Cache-Control: public, max-age=3600`. После push браузер может до часа показывать предыдущую версию по тому же URL. Для review используем cache-busting identity и проверяем удалённый hash:

```bash
curl -L --fail --silent --show-error \
  'https://playables-export.onrender.com/<playable-id>.html?candidate=<artifact-sha-prefix>' \
  -o /tmp/p4g-published-candidate.html
shasum -a 256 /tmp/p4g-published-candidate.html
```

Временный файл после проверки можно удалить. В review manifest сохраняем URL с `candidate` token и фактический remote hash. Статус Render «deployed» не доказывает, что конкретный телефон уже получил новый файл.

### 12.3 Что коммитить

В source repo:

- исходники, spec, tests, маленькие receipts/manifests;
- documented deltas и review status.

В export repo:

- только release HTML и сгенерированный listing/нужные deployment manifests.

Raw reference/candidate video может быть слишком большим для обычного Git. Его храним в согласованном artifact storage или Git LFS, а в source repo — path/URL, SHA-256, capture metadata и retention policy. Никогда не заменяем raw file перекодированной копией под тем же именем/hash claim.

### 12.4 Post-deploy smoke на телефоне

После Render deployment на том же устройстве:

1. открыть cache-busted published URL;
2. проверить build token/diagnostics и remote artifact hash;
3. повторить first tap, valid/invalid move и CTA;
4. проверить отсутствие external network errors;
5. снять короткий published smoke capture;
6. не переиспользовать local-server performance receipt как доказательство hosted build, если hashes не совпадают.

## 13. Case study — что в точности найдено в Ball Drain reference

### 13.1 Идентичность источника

- Reference URL: <https://x-ad-assets.s3.amazonaws.com/media_asset/7eaa081ca0d5aea5/index.html?>
- Outer HTML: около `853 B`.
- AppLovin loader: около `9.17 MB`.
- Embedded ZIP содержит `otherScript` около `8.43 MB`.
- Engine: Cocos Creator `2.3.3` с Box2D-style collision groups.
- Loader декодирует custom 7-bit payload и распаковывает его через JSZip.

Вывод: исследовать только outer HTML бессмысленно. Реальная механика находится в embedded Cocos runtime/scene.

### 13.2 Точная match-3 логика

| Параметр | Reference contract |
|---|---|
| Поле | 9 rows × 12 columns, 108 items |
| Стартовые матчи | нет |
| Валидные стартовые swaps | 66 |
| Input | dominant-axis swipe, threshold >20 scene px |
| Swap | только соседняя активная клетка |
| Проверка | line 3+ только в двух переставленных позициях |
| Accepted | union horizontal/vertical matches удаляется |
| Invalid | 150 ms вперёд + 150 ms назад |
| Accepted animation | swap 150 ms |
| Clear | 400 ms `backIn`, scale→0 и движение к centroid группы |
| Physics reopen | после визуального clear milestone |
| Route check | 500 ms после начала clear sequence |
| Gravity/refill blocks | отсутствуют |
| No valid swaps | попытка завершается, reshuffle отсутствует |
| Tutorial | guide после примерно 2.8 s без input |

Удаление по tap одиночного блока было ошибкой первого прототипа. Это excavation match-3: блоки исчезают только после валидного swap.

### 13.3 Точная матрица типов

Легенда: `Y=yellow`, `G=green`, `B=blue`, `R=red`. Порядок — сверху вниз, слева направо.

```text
Y G B Y Y R Y Y R G G R
G B G B B Y R R G R R Y
R R G G B B R R G R B G
G G B B R R Y Y B G B B
B B R R Y Y B B G G Y G
G G R Y G Y G G B B Y B
R R G G B B R R Y Y G B
Y Y B B R R Y Y G G B R
B B Y Y G G R G R R G R
```

В production code матрица должна хранить semantic type; palette не является логикой.

### 13.4 Drain connectivity

Reference BFS ищет связанную orthogonal пустоту от верхней строки до нижней. В source камеры заданы не как три равных блока по четыре колонки, а явно:

```text
left:   columns 0..2
center: columns 4..7
right:  columns 9..11
```

Колонки `3` и `8` являются разделителями. Базовый clone обобщил камеры как `0..3 / 4..7 / 8..11`; это известное логическое отличие, которое нельзя называть буквальным совпадением. В новом проекте использовать exact ranges из source или оформить обобщение как `DECISION` и покрыть тестом.

Открытие любого одного пути активирует ранний store handoff layer. Все три открытых пути запускают 5-second grace и затем end page.

### 13.5 Fail и health bar

Head sensor считает только `Ball_0` и `Ball_1`.

```text
count < 10
  -> danger hold reset
  -> head collider active
  -> visible countdown tween-out and full reset, если он уже начался

count >= 10 continuously for 1 s
  -> disable HeadCollider
  -> show countdown: scale 0 -> 0.75 за 0.4 s backOut
  -> drain health over exactly 8 s
  -> at zero: 1.7 s fail reveal -> end page
```

Health bar до заполнения head zone появляться не должен. Важны сразу три условия: category filter, порог 10 и непрерывный hold 1 s. Проверка только положения шарика без collision category даёт ложное срабатывание декоративных слоёв.

### 13.6 Spawn, pool и ощущение бесконечного потока

Serialized scene:

```text
ballsPerSecond = 10
ballInitSpeed = -600
spawnAreas = 3, each width about 100
spawn area x ~= -224.508, -3.87, 236.121 on 720-wide scene
ballGroups = 5 active groups
poolInitialSize = 1000 per group
totalTime = 25 s
```

Название `ballsPerSecond` вводит в заблуждение. Каждый 100 ms tick проходит по `3 spawn areas × 5 groups`, то есть планирует 15 emissions. Номинально это до `150 balls/s` в течение 25 s, с offsets `0.05×area + 0.05×group`.

Pool не является лимитом: если он пуст, source instantiate-ит новый ball.

Reference radius `9.5` на logical width `720`, но главное отношение — passage pitch `57` к diameter `19`, а не линейное масштабирование screen width.

### 13.7 Collision matrix и recycling

Упрощённая таблица:

| Group | Self collision | Bricks/walls | Head | Sensor | Recycle |
|---|---:|---:|---:|---:|---|
| `Ball_0` | да | да, свой contour | нет | да | natural hole/exit или overflow >0.5 s |
| `Ball_1` | да | да, свой contour | да | да | natural hole/exit или overflow >0.5 s |
| `Ball_2` | да | нет | нет | нет | local `y<30` у верхней границы grid |
| `Ball_3` | да | нет | нет | нет | local `y<30` у верхней границы grid |
| `Ball_4` | нет | нет | нет | нет | local `y<30` у верхней границы grid |
| `Ball_5` | settings/code path есть | не участвует в активной пятислойной scene | нет | нет | тот же декоративный recycle path |

Практический смысл:

- плотность наверху создают дешёвые декоративные слои;
- только два слоя образуют дорогую опасную кучу;
- декоративные шарики recycle-ятся у верхней границы brick-grid и не рисуются под целыми блоками;
- только front layer лежит на голове;
- видимый опасный ball нельзя извлекать из глубины ради cap.

### 13.8 Store transition — фактическая логика

Счётчик `shortTimeBrickUp` увеличивается на **каждом touch start активного кирпича**, не на successful match.

```text
touch #1..#6 -> обычная игра
touch #7
  -> один раз GameEnd(false) / failed marker
  -> showShortFx()
       -> canClickToJump = true
       -> hide guide
       -> activate full-stage clickDownload node (720×1280)
       -> show arrows/hole light
  -> triggering touch продолжает игровую обработку

next user tap
  -> full-stage DownloadButton
  -> ClickDownloadBar
  -> mraid.open(storeUrl)
  -> stop emission
```

`showShortFx()` также вызывается после первого открытого drain. Поэтому референс действительно создаёт импульс незавершённости, но не делает автоматический redirect. Он «вооружает» full-stage CTA; store открывается следующим пользовательским tap.

На normal end page работает только download button; background закрыт `BlockInputEvents`. В production-клоне выбор full-stage CTA после раннего trigger должен отдельно пройти policy сети. Если сеть разрешает только явную видимую CTA, сохраняем ранний marker/visual handoff, но не invisible tap-anywhere.

### 13.9 Что реализовано в нашем Ball Drain и где искать историю

Исходники:

- `ball-drain-rescue-v1/src/model.ts`
- `ball-drain-rescue-v1/src/main.ts`
- `ball-drain-rescue-v1/BRIEF.md`

Ключевые commits:

| Commit | Смысл |
|---|---|
| `0b12d8e` | первичная reference-faithful реализация |
| `da86e12` | base + network×locale ad matrix |
| `efbce85` | sharp swipe, invalid return/polish, endcard CTA scope, tutorial hand |
| `d635347` | видимый store handoff, reference layering, спокойнее tutorial |
| `98ac562` | только front ball layer сталкивается с головой |
| `4b0fd56` | reference passage/ball ratio, thin drains no longer clog |

Поздние исправления находятся на `origin/ball-drain-ad-rollout`; их нельзя считать частью любой другой ветки без merge/cherry-pick и повторной проверки.

## 14. Failure ledger — все собранные косяки и чему они научили

| № | Симптом | Ошибочная/неполная попытка | Корневая причина | Переносимый вывод |
|---:|---|---|---|---|
| 1 | Шарики пролезают в щели между квадратами | увеличивать visual tile | collider повторял visual gap | render gap и physics seal — разные параметры; sealed-grid soak обязателен |
| 2 | Тап удаляет одиночный квадрат | shortcut ради быстрого прототипа | не исследован swap handler | сначала state contract: adjacent swap, line 3+, invalid rollback |
| 3 | Health bar виден слишком рано | считать balls по общей зоне | не восстановлены categories/hold threshold | sensor filter + 10 balls + continuous 1 s + reset |
| 4 | После удаления клетки шарики не падают | ждать обычную gravity | sleeping bodies не проснулись после static change | wake AABB/all bodies и bounded settle после collider rebuild |
| 5 | Общее ощущение торможения | визуально снизить spawn | CPU/GPU/recording overhead не были разделены | измерять phase timings и no-capture physical receipt |
| 6 | Шарики остаются на голове | убрать head collider всегда | reference collisions различаются по layer и меняются после danger | только `Ball_1` сталкивается с head; sensor считает 0/1; collider отключается после hold |
| 7 | Поток останавливается | жёсткий cap active balls | pool ошибочно принят за лимит | source instantiate-ит при пустом pool; плотность обеспечивают recyclable layers |
| 8 | Для сохранения cap исчезает глубокий шарик | recycle самого старого/глубокого наверх | optimisation нарушил наблюдаемую массу | никогда не телепортировать видимое threat body; recycle только в source-defined exits |
| 9 | Шарики летят под неубранными блоками | decorative layers игнорируют bricks без раннего recycle | пропущена `y<30` recycle boundary | декоративный layer должен исчезать до brick-grid, а не проходить сквозь него |
| 10 | Единичные шарики всё ещё tunneling | только overlap статических collider-ов | длинный frame перескакивает тонкий slab | swept/previous-position collision и bounded substeps |
| 11 | Шарики сильно накладываются, будто много слоёв | объединить все группы в один collision set или рисовать без source order | collision matrix и layering не восстановлены | independent groups, exact masks и deterministic draw order |
| 12 | Узкий открытый drain забивается | горизонтально расширить collider strips и оставить `r=5.1` | seal protruded into hole; ball scaled от screen, не passage | overlap только по Y, chamfered corner, ratio-based `r≈4.75` |
| 13 | Match-3 ощущается вязко | глобально блокировать input до конца clear | presentation владела model lock | commit model отдельно; lock only animating cells; timings сохранить |
| 14 | Неправильный ход резко прыгает назад | мгновенный rollback | отсутствовал второй 150 ms leg | accepted 150 ms; invalid 150+150 ms |
| 15 | Удаление выглядит плоско | просто скрыть tile | потерян reference tween | 400 ms scale/centroid с `backIn`, collision milestone отдельно |
| 16 | Store logic считалась auto-redirect | смешаны `GameEnd(false)` и DownloadButton | marker и navigation находятся в разных handlers | trace next input и фактический `mraid.open`, не судить по названию функции |
| 17 | Store handoff выглядит как зависание | невидимый armed overlay | состояние изменилось без feedback | показать CTA/рамку/arrow cue и прекращать stream только после store tap по контракту |
| 18 | Tutorial раздражает или появляется не вовремя | fixed timer от load | reference timer зависит от no-touch idle | reset на input, около 2.8 s, отмена при terminal/store |
| 19 | Логика камеры названа exact, но границы отличаются | три равных диапазона 4+4+4 | generalized clone вместо source ranges | literal source constants должны иметь regression test; delta документировать |
| 20 | Документация противоречит runtime | brief упомянул reshuffle, хотя reference no-move ends | docs drift после итераций | tests и evidence — источник истины; docs проверять против текущего commit |
| 21 | Видео «доказывает» FPS | performance измерялся при screenrecord | encoder съедает frame budget | visual capture и no-capture performance — два разных receipts |
| 22 | Review выглядит убедительно, но не сравнимо | ролики стартуют в разное время/на разных условиях | нет event sync и candidate identity | sync по событию, одинаковое устройство/seed, hashes и manifest |
| 23 | Autoplay демонстрирует не тот FTUE | Mahjong autoplay решил весь board | acceptance не был формализован | bounded demo: точные действия, длительность, takeover state, no completion |
| 24 | Solver говорит «валидно», но визуально стрелка самоблокируется | особое логическое исключение | render/collision geometry расходились | одна geometry для render/collision, human correction без allowlist |
| 25 | Старое видео используется после изменений | recording не привязан к build | нет artifact hash | evidence всегда hash-bound; устаревшее явно помечать stale |

## 15. Выводы из других попыток реконструкции

### Arrows

- Публичное видео разбиралось по точным timestamps settled frames.
- Геометрия threshold-илась только внутри gameplay board; blurred surround и бренд исключались.
- Connected components переводились на quarter-cell lattice.
- Неоднозначные arrowheads разрешались через rendered geometry + solver, а не на глаз.
- Одна geometry обслуживала render, collision и exit ray.
- Никаких reference-only collision allowlists.
- Даже после machine pass один hook был исправлен по operator device playtest.

Переносимый урок: solver нужен для логической доказуемости, но не отменяет человеческую проверку визуальной очевидности.

### Mahjong

- Первый review rejected: autoplay был длиннее и решал весь уровень; side-by-side не был синхронным.
- Rework зафиксировал ровно две пары за 4–6 s, без completion, с takeover-ready state.
- Видеозапись и no-capture Android performance были разными артефактами.
- Candidate artifact, test receipts и device identity связывались hashes.
- Runtime обязан освобождать RAF/listeners/resources idempotently.

Переносимый урок: «работает» не равно «демонстрирует правильный рекламный сценарий».

### Bubble Shooter

- Pure reducer/solver доказывал exact reflection, snap, pop, drop и rescue.
- Preview trajectory и released shot использовали одну математическую модель.
- Записи и contact sheets делались на физическом Samsung с зафиксированными параметрами.
- Старые device artifacts после изменения build помечались stale.
- Haptics и playfeel оставались human-only gate.

Переносимый урок: preview, simulation и evidence должны описывать один и тот же candidate, иначе возникают «три правды».

## 16. Release checklist

### Reference

- [ ] URL, timestamp и SHA-256 сохранены.
- [ ] Loader распакован до фактического runtime.
- [ ] Engine, scene, prefabs и inspector constants определены.
- [ ] Live code отделён от dead/obfuscated code.
- [ ] Записаны valid/invalid/win/fail/no-move/store/lifecycle сценарии.
- [ ] Reference video снято на целевом физическом устройстве.

### Specification

- [ ] State machine и action table готовы.
- [ ] Layout/content hash зафиксирован.
- [ ] Все timing constants имеют provenance.
- [ ] Collision matrix и recycle rules выписаны.
- [ ] Store marker отделён от navigation.
- [ ] Все сознательные отличия находятся в `DELTAS.md`.

### Implementation

- [ ] Pure model покрыта тестами.
- [ ] Solver/checker replay проходит.
- [ ] Render и collision используют общий geometry source, где применимо.
- [ ] Invalid input не мутирует state.
- [ ] Static geometry rebuild не оставляет sleeping stacks.
- [ ] Visible live bodies не телепортируются ради cap.
- [ ] Lifecycle pause/resume/dispose idempotent.
- [ ] CTA соответствует policy целевой сети.

### Performance

- [ ] Нет allocations в physics hot loop либо они измерены.
- [ ] Spatial partitioning/masks уменьшают pair count.
- [ ] DPR и quality tiers зафиксированы.
- [ ] Long-frame tunneling test проходит.
- [ ] `embeddedBalls=0` в sealed soak.
- [ ] Device performance снят без screen capture.
- [ ] Visual capture не используется как FPS claim.
- [ ] Memory не растёт после полного restart/dispose.

### Evidence и human acceptance

- [ ] Reference/candidate recordings синхронизированы по событию.
- [ ] Артефакты привязаны к commit и SHA-256 release HTML.
- [ ] Известные stale artifacts помечены.
- [ ] Machine gates прошли.
- [ ] Оператор проверил на физическом low-tier Android.
- [ ] Оператор явно поставил `accepted` или вернул numbered defect list.

## 17. Шаблон передачи в другой проект

В handoff-сообщении должны быть:

1. **Что строим** — одно предложение о core loop.
2. **Reference identity** — URL, hash, дата.
3. **Exact mechanics** — ссылка на `SPEC.md`.
4. **Exact content** — layout file + content hash.
5. **Physics contract** — collision matrix, sensors, spawn/recycle.
6. **Lifecycle contract** — CTA/store/endcard/pause/resume.
7. **Known deltas** — без формулировки «почти незаметно».
8. **Failure ledger** — чтобы команда не повторила старые fixes.
9. **Commands** — build/check/preview/device test.
10. **Evidence** — reference/candidate video, no-capture perf, manifest.
11. **Human gate** — устройство, имя/роль принимающего, статус и замечания.

Пример статуса:

```text
Mechanic: ball-drain-rescue
Candidate: <git sha> / <artifact sha256>
Machine gates: PASS
Physical device: Samsung <model>, Android <version>, Chrome <version>
Reference comparison: PASS with deltas D-03, D-07
Human acceptance: PENDING
Do not publish as “reference-exact” until D-03 is resolved or approved.
```

## 18. Официальные источники и полезные материалы

- [AppLovin creative specs and guidelines](https://support-preview.axon.ai/en/growth/promoting-your-apps/welcome-to-applovin/creative-specs-and-guidelines)
- [Unity playable ad specifications](https://docs.unity.com/en-us/grow/acquire/creatives/playable/specifications)
- [IAB MRAID](https://iabtechlab.com/standards/mobile-rich-media-ad-interface-definitions-mraid/)
- [Android Debug Bridge](https://developer.android.com/tools/adb)
- [Access a local development server from Android](https://developer.android.com/develop/ui/views/layout/webapps/access-local-server)
- [Remote debug Android devices](https://developer.chrome.com/devtools/docs/remote-debugging)
- [Chrome Performance panel](https://developer.chrome.com/docs/devtools/performance)
- [Device Mode limitations](https://developer.chrome.com/docs/devtools/device-mode)
- [CPU throttling calibration](https://developer.chrome.com/docs/devtools/settings/throttling/)
- [Canvas performance](https://web.dev/articles/canvas-performance)
- [Rendering performance](https://web.dev/articles/rendering-performance)
- [Optimize long tasks](https://web.dev/articles/optimize-long-tasks)
- [Static memory with object pools](https://web.dev/articles/speed-static-mem-pools)
- [Monitor total page memory usage](https://web.dev/articles/monitor-total-page-memory-usage)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

## 19. Короткий итог

Надёжная реконструкция строится по цепочке:

```text
reference identity
  -> source/device evidence
  -> measured executable spec
  -> deterministic model
  -> physics/lifecycle implementation
  -> machine receipts
  -> synchronized real-device comparison
  -> human acceptance
```

Самые дорогие ошибки происходят, когда цепочку сокращают: начинают кодировать по первому впечатлению, оптимизируют до восстановления collision/recycle contract, считают marker переходом в store, используют запись как performance receipt или называют generalized clone буквальной копией. Этот playbook специально сохраняет не только успешные решения, но и неудачные попытки, чтобы следующий проект не повторял их.
