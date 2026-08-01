# Каталог классов механик: research, приоритеты и карта разработки

- Дата исследовательского среза: **29.07.2026**
- Статус: **proposal / living research**, не утверждённый roadmap
- Область: swipe-платформа, first-party серии и будущие фабрики от эталона

## Назначение документа

Документ нужен для четырёх задач:

1. хранить общий список обязательных классов механик и не смешивать похожие,
   но технически разные игровые ядра;
2. сравнивать кандидатов по одному набору критериев;
3. выбирать следующий эталонный прототип осознанно;
4. делить подготовку и разработку на независимые workstream'ы с проверяемыми
   результатами.

Это не implementation status и не разрешение на публикацию. Изменчивое
состояние платформы живёт в authority-документах соответствующих репозиториев.
Утверждённый продуктовый смысл живёт в [`VISION.md`](../../VISION.md).

## VISION-триаж

- **В направлении:** исследование напрямую поддерживает фабрики от эталона,
  регулярный ручной ввод сильных рыночных механик и разнообразие ленты.
- **Текущая продуктовая ступень:** документ готовит будущий supply механик, но
  не отменяет мораторий из VISION и сам не открывает новый платформенный
  контур.
- **Human authority:** оператор выбирает механику, утверждает эталон,
  принимает taste-решения и разрешает rollout.
- **Machine authority:** solver, генератор, runtime- и visual-gate могут
  доказать техническую играбельность, но не качество и не право публикации.

## Связанные документы

- [`VISION.md`](../../VISION.md) — продуктовый authority.
- [`feed-prototype/README.md`](../../../feed-prototype/README.md) — устройство
  swipe-ленты и staged boot.
- [`playables/docs/BRIEF_TEMPLATE.md`](../../../playables/docs/BRIEF_TEMPLATE.md)
  — бриф конкретного playable.
- [`playables/docs/SPEC.md`](../../../playables/docs/SPEC.md) — общие стандарты
  короткого playable.
- [`CLASS-BRIEF-TEMPLATE.md`](CLASS-BRIEF-TEMPLATE.md) — шаблон глубокого
  исследования и разработки одного класса.
- [`REFERENCE-REPLICATION-PROCESS.md`](REFERENCE-REPLICATION-PROCESS.md) —
  единственный authority процесса fidelity replication v3.
- [`REFERENCE-DEVICE-LAB.md`](REFERENCE-DEVICE-LAB.md) — fail-closed Android
  capture preflight и clean/instrumented scenario receipts.
- [`PROCESS-RECEIPT-TEMPLATE.md`](PROCESS-RECEIPT-TEMPLATE.md) — метрики
  внимания, переделок и эффективности процесса на класс.

## Контекст платформы, влияющий на выбор

Обычный рейтинг мобильных жанров недостаточен. Механика для swipe-платформы
должна учитывать:

- автоплей, который объясняет правило до касания;
- незаметный перехват управления;
- один короткий раунд внутри карточки;
- серию `1..N` уровней, обычно пять в текущем шаблоне кампаний;
- паузу off-screen и восстановление без расхождения состояния;
- лёгкий staged boot и контролируемый `mountCost`;
- детерминированный результат и повторяемый `seed`;
- возможность представить уровень компактным typed-паком;
- машинную проверку проходимости там, где она заявлена;
- ясный `completed`-сигнал для хоста;
- достаточную визуальную читаемость на маленьком portrait-экране.

## Метод оценки

Каждый класс оценивается по шкале `1..5`.

| Критерий | 1 | 5 |
| --- | --- | --- |
| **Feed hook** | правило трудно считать в автодемо | правило понятно за несколько секунд |
| **Короткий раунд** | естественная сессия длинная | естественно укладывается в 20–60 секунд |
| **Генерация** | контент преимущественно ручной | уровни легко порождать и валидировать |
| **Переиспользование** | одноразовое ядро | даёт примитивы нескольким будущим классам |
| **Простота прототипа** | много связанных систем/ассетов | ядро можно изолировать быстро |

Обозначение объёма первого прототипа:

- `S` — локальная логика, минимум ассетов, простой runtime;
- `M` — нужен solver, дискретная физика или заметный UX;
- `L` — real-time баланс, тяжёлая графика либо несколько связанных систем.

Оценки являются инженерной гипотезой для сравнения, а не календарным
обязательством.

## Таксономия: какие направления нельзя смешивать

Первичный список раскладывается минимум на пятнадцать разных ядер.

| Семейство | Отдельные классы |
| --- | --- |
| Tile puzzle | Mahjong Solitaire; triple-tile / Zen Match |
| Solitaire | Klondike/Spider/FreeCell; TriPeaks/Pyramid; Word Solitaire |
| Blocks | falling blocks; placement block puzzle / Block Blast |
| Dependency puzzle | Arrows / Tap Away |
| Character control | survivor micro-wave; carry-stack/production |
| Words | word search; fillwords; word wheel/crossword |
| Vehicle puzzle | Rush Hour target-exit; Parking Jam clear-all |
| Matching | swap Match-3; Bubble Shooter |
| Logic grid | Sudoku |
| Sliding/sorting | Block Out! color gates |
| Satisfying tools | cleaning/scraping/cutting/makeover anthology |
| Strategy | path Tower Defense; merge TD; abstract lane/crowd strategy |
| Aim-and-shoot | bubble cluster shooter; physics destruction / Smash Fest |

Расширение одного семейства не должно незаметно подменять разработку другого
класса. Например, движок Bubble Shooter не является ядром Smash Fest, а
carry-stack/production не является режимом survivor только потому, что оба
используют one-finger controller.

## Существующий портфель как базовые классы

Каталог сравнивает кандидатов относительно уже доказанных классов платформы —
колонка Reuse и решения о приоритете обязаны учитывать этот якорь:

| Живой класс | Таксономия | Статус |
| --- | --- | --- |
| Sort (`marble-sort-swipe`, эталон) | Sliding/sorting | прод-лента; фабричная вертикаль Series Order |
| Pins (pull-the-pin) | Dependency puzzle | прод-лента + FTUE/AppLovin таргеты |
| Merge (`granular-grid` merge+blast) | Matching/merge | прототипы, активная разработка |
| Short-drama timepress | Timing | прод-лента, фид-ведомые уровни |
| Gen-tap и вариации | — | прод-лента |

Sort и Pins уже прошли путь «эталон → серия → лента»; новый класс, который
переиспользует их примитивы (staged boot, AutoCursor, series+params, SkinSpec),
дешевле класса, который строит всё заново.

## Сводная матрица

| Класс | Feed | Раунд | Генерация | Reuse | Прототип | Основной риск | Предварительно |
| --- | ---: | ---: | ---: | ---: | --- | --- | ---: |
| Arrows / Tap Away | 5 | 5 | 5 | 4 | S | калибровка сложности | 1 |
| Block Out! | 5 | 5 | 4 | 4 | M | solver + динамические элементы | 2 |
| Survivor micro-wave | 5 | 5 | 4 | 5 | L | perf + баланс | 3 |
| Placement blocks / Block Blast | 4 | 4 | 4 | 4 | S–M | честная выдача фигур | 4 |
| Triple-tile / tray triples | 5 | 5 | 3 | 4 | M | гарантированная проходимость | 5 |
| Word Search / Fillwords | 3 | 4 | 5 | 4 | S–M | качество языка | 6 |
| Traffic / Parking Jam | 5 | 5 | 3 | 4 | M | solver + жесты | 7 |
| Bubble Shooter | 5 | 5 | 3 | 4 | M | hex collision + trajectory | 8 |
| ASMR single-tool | 5 | 5 | 1–2 | 5 | L | asset/content production | 9 |
| Match-3 micro-board | 5 | 5 | 2–3 | 5 | L | level design + cascades | 10 |
| Sudoku | 2 | 2 | 5 | 3 | S–M | длинная статичная сессия | 11 |
| Solitaire classics | 2–3 | 2 | 3 | 4 | M–L | UX + длительность | 12 |
| Micro Tower Defense | 4 | 4 | 2–3 | 5 | L | число связанных систем | 13 |
| Smash Fest / destruction | 5 | 5 | 1 | 4 | L | rigid-body + ручные уровни | отдельный bet |

Порядок — начальная рекомендация для обсуждения. После reference packet,
prototype spike или новых продуктовых данных строка пересматривается отдельным
review-решением.

Открытое возражение к строке 3 (зафиксировано на priority review): Survivor
micro-wave не тренирует фабрику (волновой баланс не доказывается солвером —
это другая производственная парадигма) и слабее топ-5 попадает в ICP
(пазловая женская 30+). Альтернатива на обсуждение: поднять Placement blocks и
Triple-tile, а Survivor вести как отдельный action-bet рядом со Smash Fest.

## Рыночный срез

Количество оценок в американском App Store — только наблюдаемый proxy
устойчивого спроса, а не размер аудитории или TAM. Значения ниже относятся к
дате среза и не являются изменяемым implementation status платформы.

| Референс | Наблюдение на дату среза |
| --- | --- |
| [Block Blast](https://apps.apple.com/us/app/block-blast/id1617391485) | 2,6 млн оценок |
| [Sudoku.com](https://apps.apple.com/us/app/sudoku-com-number-games/id1193508329) | 1,8 млн |
| [Word Search Explorer](https://apps.apple.com/us/app/word-search-explorer/id1602508478) | 824 тыс. |
| [Perfect Tidy](https://apps.apple.com/us/app/perfect-tidy/id6689516283) | 356 тыс. |
| [Zen Match](https://apps.apple.com/us/app/zen-match-relaxing-puzzle/id1560124228) | 255 тыс. |
| [Microsoft Solitaire Collection](https://apps.apple.com/us/app/microsoft-solitaire-collection/id1103438575) | 251 тыс. |
| [Survivor.io](https://apps.apple.com/us/app/survivor-io/id1528941310) | 244 тыс. |
| [Block Out!](https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568) | 117 тыс. |
| [Bubble Witch 3 Saga](https://apps.apple.com/us/app/bubble-witch-3-saga/id1095254858) | 106 тыс. |

Вывод из среза ограниченный: практически у всех выбранных классов есть
подтверждённая мобильная аудитория, поэтому первый выбор следует делать по
формату платформы и стоимости обучения фабрики.

# Карточки направлений

## 1. Arrows / Tap Away

### Референсы

- [Arrows – Puzzle Escape, Lessmore](https://apps.apple.com/us/app/arrows-puzzle-escape/id6748397500)
- [Arrow Puzzle — Tap Away Game, Easybrain](https://apps.apple.com/us/app/arrow-puzzle-tap-away-game/id6755482314)
- [Arrows Puzzle](https://arrows-puzzle.com/)

### Выбранный reference packet

Review 2 закрыт выбором **Arrows – Puzzle Escape**, target band — уровни
`10–15`. Подготовлены:

- [`arrows/REFERENCE-PACKET.md`](arrows/REFERENCE-PACKET.md) — AR-R,
  покадровый feel-разбор и parity checklist;
- [`arrows/CLASS-BRIEF.md`](arrows/CLASS-BRIEF.md) — AR-G, gameplay/schema/
  solver/generator contract и закрытие Review 3;
- [`arrows/REVIEW-3-INDEPENDENT-2026-07-29.md`](arrows/REVIEW-3-INDEPENDENT-2026-07-29.md)
  — независимый conditional GO и исходные замечания A1–A3.

Статус: `approved-for-prototype / ready for parallel implementation`.
Review 3 утвердил polyline baseline, пять собственных уровней в target band
`10–15` и Level 15 как holdout. После independent conditional GO зафиксированы
единая lattice collision authority, concurrent manual exits и однофазный
`450 ms` fit с `time-to-rule ≤1.35 s`. Native recording закрыл timing
успешного exit, blocked feedback, lives/fail и camera evidence; значения,
которых в записи нет, честно помечены `P`.

### Core loop

Игрок нажимает стрелку. Если прямой путь перед ней свободен, стрелка покидает
поле и открывает новые ходы. Нажатие заблокированной стрелки вызывает ошибку
или отнимает жизнь. Победа — очистить поле.

### Почему подходит платформе

- одиночный тап, не конфликтующий со swipe-жестом после перехвата;
- причинно-следственная связь видна в автодемо;
- минимальная локализация;
- компактное представление уровня;
- естественный короткий win state;
- подходит для deterministic autoplay.

### Генерация

Предпочтительный путь — reverse construction:

1. задать корректный порядок удаления;
2. разместить стрелки так, чтобы последующие элементы создавали нужные
   зависимости;
3. прогнать solver;
4. измерить минимальную длину, число безопасных ходов и ветвление;
5. отбросить тривиальные, неоднозначно лёгкие и непроходимые варианты.

### MVP

- одно поле;
- только прямые единичные стрелки;
- три ошибки либо fail без жизней — решение в брифе;
- пять seed-уровней;
- hint необязателен для первого interaction spike;
- autoplay показывает несколько корректных ходов;
- host pause/resume и `completed`.

### Не включать в первый MVP

- составные «змеи»;
- телепорты;
- движущиеся blockers;
- мету, currency, магазин;
- генерацию с моделью.

### Главные вопросы ревью

- Ошибка должна отнимать жизнь или просто давать отрицательный feedback?
- Допускаются ли несколько решений?
- Какой уровень случайности приемлем в серии?
- Должно ли автодемо играть оптимально или только правдоподобно?

## 2. Block Out! / color gates

### Review packet

Подготовлены:

- [`block-out/REFERENCE-PACKET.md`](block-out/REFERENCE-PACKET.md) — `BO-R`,
  taxonomy split, сравнение четырёх references, recommendation, evidence gaps
  и exact operator packet;
- [`block-out/CLASS-BRIEF.md`](block-out/CLASS-BRIEF.md) — `BO-G`,
  proposed gameplay/content/runtime boundaries и workstreams
  `BO-R/G/E/S/F/P/I/A/Q`;
- [`block-out/REVIEW-1-INDEPENDENT-2026-07-29.md`](block-out/REVIEW-1-INDEPENDENT-2026-07-29.md)
  — independent **accept as research**, findings F1–F5 и их disposition.
- [`block-out/REVIEW-3-INDEPENDENT-2026-07-29.md`](block-out/REVIEW-3-INDEPENDENT-2026-07-29.md)
  — independent conditional GO и blockers A1′–A3′.
- [`block-out/FIDELITY-CALIBRATION-2026-07-31.md`](block-out/FIDELITY-CALIBRATION-2026-07-31.md)
  — frame ledger, build-drift disposition, typed feel candidate, original
  level-feature ladder и Review 4 evidence contract.

Статус: **Reference-fidelity implementation candidate + reproducible
solver/browser/visual evidence; operator target-device Review 4 pending**.
Primary (`O`) —
[Block Out! — Color Sort Puzzle, Grand Games](https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568);
fidelity band (`O`) — levels `6–10`. Operator утвердил continuous two-axis
collision-constrained drag с grid snap, отсутствие timer/fail и strong-solvable
accepted pack; quick flick не имеет inertia (`O`). Operator clips L11–13 и
Level 15 gate-feel probe byte/frame verified как `R-native`;
полные SHA-256 находятся в packet. Review 3 зафиксировал contact-allowed
positive-area collision, unit-step anchor BFS, deterministic nearest snap и
monotonicity proof. Последующий operator amendment добавил axis-decomposed
sliding, `1.35`-cell mid-drag/release sticky gate suction, control transfer,
highlight/fragmentation и haptic priority, superseding full-crossing exit.
`BO-A/BO-E/BO-S/BO-P/BO-F/BO-I/BO-Q` prototype candidate реализован в
isolated branch. Candidate использует `BlockOutFeelSpecV1`, не блокирует новый
input particle tail'ом и имеет пять original feature-matched levels; exact
timing/haptic/level-taste parity ждёт operator device comparison.
Locked/countdown gates, rollout и publication не разрешены.

### Core loop

Игрок drag'ом reposition'ит разноформенные цветные блоки по ограниченному
ортогональному полю и выводит каждый через matching boundary gate. Победа —
очистить поле; reference использует timer, own v1 исключает timer/fail (`O`). Порядок
освобождения пространства определяет решение. Поздние уровни добавляют лифты,
генераторы, shutters и другие versioned modifiers.

### Платформенная ценность

- развивает дискретный puzzle-runtime после Arrows;
- добавляет drag, формы блоков и маршрутизацию;
- даёт основу для Traffic Jam, ice sliding и gate sorting;
- визуально хорошо читается в автодемо.

### MVP

- ортогональная сетка;
- блоки одного или нескольких размеров;
- статические стены;
- статические цветные выходы;
- continuous two-axis drag по collision-free corridor, с turns/diagonal и
  grid snap на release (`O`);
- contact legal, collision только при positive-area overlap;
- axis-decomposed sliding вдоль препятствий;
- compatible reusable gates перехватывают block mid-drag или после moved release в `1.35`-cell in-board
  suction band;
- deterministic nearest snap с tie-break `y,x`;
- initial witness + v1 monotonicity lemma доказывают strong solvability;
- без лифтов, generators, shutters и booster/meta rules;
- solver обязателен до фабричной генерации.

### Риски

- точная семантика движения сильно влияет на пространство состояний;
- цвет не должен быть единственным сигналом;
- drag должен отделяться от swipe ленты только после takeover;
- динамические элементы нельзя добавлять до versioned level schema.

## 3. Survivor micro-wave

### Референсы

- [Survivor.io](https://apps.apple.com/us/app/survivor-io/id1528941310)
- [Brotato](https://store.steampowered.com/app/1942280/Brotato/)

### Core loop

Игрок одним пальцем водит героя, атака срабатывает автоматически, враги
давят волнами, а победа достигается выживанием до таймера либо убийством босса.
Brotato использует волны порядка 20–90 секунд, что близко к размеру
платформенной единицы.

### MVP

- одна ограниченная арена;
- виртуальный joystick;
- одна auto-target атака;
- два обычных enemy archetype;
- один boss либо survival timer;
- 30 секунд;
- максимум один выбор усиления;
- object pooling и quality tier с первого spike.

### Переиспользуемые примитивы

- character controller;
- enemy steering;
- wave scheduler;
- projectile/area damage;
- targeting;
- health/damage/status;
- spawn budget;
- boss telegraph.

Эти примитивы затем уменьшают стоимость Micro TD и других action-классов.

### Риски

- нагрузка в Telegram WebView;
- читаемость толпы на маленьком экране;
- разрыв между красивым autoplay и честным takeover;
- баланс урона, плотности и скорости;
- выбор усиления может ломать темп короткой карточки.

## 4. Carry-stack / production

### Статус

Нужен отдельный reference packet. Сейчас направление намеренно отделено от
Survivor.

### Предполагаемый loop

Герой собирает предметы в видимую стопку, переносит их к приёмнику или станку,
получает продукт/ресурс и повторяет маршрут.

### Почему это отдельный класс

- другая win condition;
- нет боевого targeting;
- основная удовлетворяющая обратная связь — рост стопки и выгрузка;
- generator описывает маршруты, ёмкости и производственные зависимости, а не
  волны врагов.

### Следующий research-вопрос

Зафиксировать один точный референс и решить, что является ядром: перенос,
производственная цепочка, рост хвоста предметов или автоматизация станции.

## 5. Placement blocks / Block Blast

### Референс

- [Block Blast](https://apps.apple.com/us/app/block-blast/id1617391485)

### Core loop

Игрок размещает фигуры из ограниченного набора на сетке. Заполненные строки
и/или колонки очищаются. Нужно сохранять пространство и строить комбинации.

### Принципиальное разделение

Это не falling-blocks. Для первого платформенного класса рекомендуется
placement puzzle с конечной целью, а не бесконечная Tetris-подобная сессия.

### MVP

- поле 8×8 либо меньше после readability-теста;
- три доступные фигуры;
- drag-and-place;
- очистка строк/колонок;
- конечная цель: score, заданные клетки или ограниченное число наборов;
- deterministic piece sequence;
- fail только при отсутствии размещений.

### Генерация и риски

Случайная выдача фигур проста, но «честная» выдача нет. Для серии требуется:

- seed;
- проверка существования хода;
- оценка числа будущих размещений;
- запрет скрытого изменения очереди после решения игрока;
- отдельный puzzle mode, если обещается гарантированное решение.

### IP guardrail

Не копировать название, фирменный облик, guideline-цвета, музыку и trade dress
Tetris. Референс используется для исследования игрового взаимодействия, а не
для переноса защищённых материалов.

## 6. Triple-tile / tray triples

### Taxonomy boundary

Выбранное ядро: exposed tiles → bounded bottom tray → auto-remove triples.
Это **не** Mahjong Solitaire: pair-matching открытых плиток без tray является
отдельным будущим классом. Tile sorting, swap Match-3 и hidden-object также не
входят в этот baseline.

### Active authority and Z2 packet

Исследованы [Triple Tile](https://apps.apple.com/us/app/triple-tile-match-puzzle-game/id1572661625),
[Zen Match](https://apps.apple.com/us/app/zen-match-relaxing-puzzle/id1560124228),
[Tile Busters](https://apps.apple.com/us/app/tile-busters-match-3-tiles/id6443449716),
[Tile Club](https://apps.apple.com/us/app/tile-club-matching-game/id1640075364)
и [Tile Family](https://apps.apple.com/us/app/tile-family-match-puzzle-game/id6444056676).

Primary и taste authority — immutable Android capture Zen Match build
`220000.1.755`, Levels `6–10`, session
`2bb6ac89-3da1-4641-b753-52c9f982f0d3`, manifest SHA-256
`70960297ef9308d3fbe537d708f63b442a92c0f4a4de357918a3ee10172febfa`.
Старые Triple Tile Levels 20/25/30 и Zen Match Level 17 остаются
историческим secondary research.

Подготовлены:

- [`triple-tile/REFERENCE-PACKET.md`](triple-tile/REFERENCE-PACKET.md) —
  capture authority, две objective-модели и production decisions;
- [`triple-tile/CLASS-BRIEF.md`](triple-tile/CLASS-BRIEF.md) — Z3
  gameplay/schema/solver, single-runtime и Twin/Original dataset boundary;
- [`triple-tile/CAPTURE-MANIFEST-ZEN-2026-07-30.md`](triple-tile/CAPTURE-MANIFEST-ZEN-2026-07-30.md)
  — acquisition receipt;
- [`triple-tile/REFERENCE-TWIN.md`](triple-tile/REFERENCE-TWIN.md) —
  exact-fixture map и isolation gates;
- [`triple-tile/TASTE-REVIEW-Z3-2026-07-31.md`](triple-tile/TASTE-REVIEW-Z3-2026-07-31.md)
  — operator taste verdict, single-runtime refreeze и reopened Original gate;
- [`triple-tile/COMPLETION-AUDIT-Z3-2026-07-31.md`](triple-tile/COMPLETION-AUDIT-Z3-2026-07-31.md)
  — requirement-by-requirement evidence и два оставшихся authority gates;
- [`triple-tile/PROBE-MATRIX.md`](triple-tile/PROBE-MATRIX.md),
  [`triple-tile/PARITY-CHECKLIST.md`](triple-tile/PARITY-CHECKLIST.md) и
  [`triple-tile/REFERENCE-DELTA.md`](triple-tile/REFERENCE-DELTA.md) —
  targeted timing work и parity evidence;
- [`triple-tile/REVIEW-INDEPENDENT-2026-07-29.md`](triple-tile/REVIEW-INDEPENDENT-2026-07-29.md)
  — историческое review до нового capture; не является текущим parity
  disposition;
- [`triple-tile/REVIEW-INDEPENDENT-Z2-2026-07-30.md`](triple-tile/REVIEW-INDEPENDENT-Z2-2026-07-30.md)
  — историческое approval Z2 infrastructure до materialization реального
  capture; не является финальным parity disposition.
- [`triple-tile/REVIEW-Z2-INDEPENDENT-2026-07-30.md`](triple-tile/REVIEW-Z2-INDEPENDENT-2026-07-30.md)
  — финальный technical review Z2; сохраняется как исторический receipt, но
  предшествует Z3 operator taste delta.

Статус: `Z3 canonical runtime + Original R1 implemented; operator taste review
pending; rollout not authorized`. Z2 capture/rules/trace evidence сохраняется.
R0 остаётся reproducible taste-parity-failed evidence; активный R1 проходит
solver, complete level-feel v2 и все production deny/near-duplicate gates.
Twin и Original уже являются datasets одного runtime. До Original readiness
остаются explicit operator taste disposition и последующее independent review.
Exact layouts по-прежнему разрешены только local/internal и блокируются
production deny/near-duplicate gates.

### Core loop

Игрок выбирает доступные плитки, они попадают в ограниченный tray, три
одинаковые исчезают. Победа зависит от versioned objective: закрыть target
counters либо очистить board/tray. Проигрыш — post-resolve occupancy `7`.

### Proposed bounded baseline

- только triple matching;
- плоские слои с ясным overlap;
- `collect-target-types | clear-all`;
- fail-on-7th после triple resolution;
- undo/shuffle/hint/boosters/revive/extra slot отсутствуют;
- пять собственных solver-verified раскладок;
- logical tray state — multiset типов; visual order принадлежит presentation
  и не меняет solver/content digest;
- solver учитывает все допустимые выборы, а не только авторский witness;
- reverse generator симулирует tray pressure и не объявляет
  solver-valid уровень интересным;
- observable-information filter отклоняет раскладки, где safe choice требует
  знания недостаточно видимого symbol.

### Риски

- формально проходимый уровень может быть нечестным для человека;
- objective и fail-on-7th должны оставаться единым versioned contract в
  engine/solver;
- presentation order может ошибочно протечь в logical/content identity;
- частичное перекрытие может превратить solver-valid выбор в угадайку;
- hit areas перекрывающихся плиток;
- недостаточная различимость символов;
- слишком большое число типов плиток делает ранний уровень случайным;
- shuffle меняет семантику гарантии проходимости.

## 7. Word Search, Fillwords и Wordscapes-подобные

### Референсы

- [Word Search Explorer](https://apps.apple.com/us/app/word-search-explorer/id1602508478)
- [FillWords](https://fillwords.com/)
- [Wordscapes gameplay overview](https://peoplefun.helpshift.com/hc/en/6-wordscapes/faq/267-game-overview/)

### Классы

1. **Word Search:** слова идут по прямым линиям и могут пересекаться.
2. **Fillwords:** связанные цепочки слов покрывают поле.
3. **Word wheel/crossword:** слова собираются из общего набора букв и
   заполняют crossword-сетку.

### Рекомендация первого MVP

Тематический Word Search:

- компактная сетка;
- 3–5 слов;
- swipe по буквам;
- один язык в первом spike;
- список слов видим;
- уровень заканчивается после нахождения всех слов.

### Контентный pipeline

Геометрическая раскладка не является достаточной генерацией. Нужны:

- versioned словарь на язык;
- частотность и возрастная уместность;
- фильтр нежелательных подстрок;
- нормализация регистра и диакритики;
- морфологическая политика;
- тематический label/provenance;
- проверка размера и читаемости сетки.

### Риски

- текст слабее работает в беззвучном быстром autoplay;
- локализация является частью gameplay, а не UI-переводом;
- разные алфавиты требуют отдельных layout-ограничений;
- случайно допустимые дополнительные слова надо учитывать явно.

## 8. Traffic Jam / Parking Jam

### Референсы

- [Parking Jam 3D](https://play.google.com/store/apps/details?id=com.lszenlamzr.parkingjam)
- [Rush Hour rules](https://www.thinkfun.com/wp-content/uploads/2015/09/RushHJr-5041-Instructions.pdf)

### Разделение

- **Rush Hour:** вывести одну целевую машину.
- **Parking Jam:** освободить все машины в корректном порядке.

Для swipe-карточки предварительно предпочтителен clear-all: сцена постепенно
очищается и хорошо объясняет себя в autoplay.

### MVP

- ортогональные машины;
- движение только вдоль собственной оси;
- один выход;
- статические препятствия;
- без пешеходов, столкновений и сложной дорожной сцены;
- state-search solver;
- оценка уровня по minimal solution length и branching.

### Риски

- drag машин и swipe ленты;
- tap-to-exit и drag-to-move создают разные классы UX;
- 3D-представление может скрывать логическую клетку;
- декоративная физика не должна менять результат solver-а.

## 9. Match-3 micro-board

### Референсы

- [Royal Match gameplay guide](https://dreamgames.helpshift.com/hc/en/3-royal-match/faq/4-how-can-i-play-the-levels/)
- [Homescapes match-3 guide](https://playrix.helpshift.com/hc/en/14-homescapes/faq/1087-how-do-i-play-match-3-levels/)

### Core loop

Игрок меняет соседние фишки, собирает три и более, выполняет цель до окончания
лимита ходов. Большие совпадения создают power-ups; blockers и level goals
формируют содержание.

### MVP

- одна форма поля;
- 5–6 цветов;
- swap только с образованием match;
- один goal;
- один blocker;
- 8–12 ходов;
- фиксированный seed;
- line power-up как единственный специальный элемент;
- deterministic cascade semantics.

### Почему не первый класс

Базовый swap легко прототипировать, но production-quality класс требует:

- заполнения без стартовых совпадений;
- детекции отсутствия ходов;
- reshuffle policy;
- каскадов и специальных комбинаций;
- большого языка blockers;
- сложного difficulty/playtest pipeline.

## 10. Bubble Shooter

### Референс

- [Bubble Witch 3 gameplay](https://bubblewitch3.zendesk.com/hc/en-us/articles/115001528305-How-do-I-play-Bubble-Witch-3-Saga)

### Core loop

Игрок прицеливается и выпускает шар. Кластер из трёх и более одинаковых цветов
лопается, а потерявшие связь элементы падают. Уровень ограничен количеством
выстрелов или имеет конкретную цель.

### MVP

- hex-grid;
- видимая aim line;
- один bounce от стен;
- match-3 clusters;
- unsupported-drop;
- очередь из двух цветов;
- ограниченный запас выстрелов;
- одна цель уровня.

### Риски

- collision должен завершаться в дискретной клетке одинаково на всех FPS;
- aim preview обязан совпадать с реальным выстрелом;
- случайный следующий цвет не должен создавать невозможный уровень;
- visual juice легко скрывает состояние сетки.

## 11. Smash Fest / physics destruction

### Референс

- [Smash Fest, Flow Games](https://play.google.com/store/apps/details?id=com.flow.cannonball)

### Core loop

Игрок выбирает угол/силу, стреляет по конструкции и использует цепную реакцию
разрушений, чтобы убрать цели ограниченным числом снарядов.

### Почему это не Bubble Shooter

- непрерывная rigid-body simulation вместо дискретной сетки;
- материалы, масса и опоры вместо цветных кластеров;
- результат зависит от settling;
- уровни в основном пространственно авторские.

### Рекомендация

Хранить как отдельный visual bet. До разработки нужен spike
воспроизводимости Matter.js на целевых WebView и решение, достаточно ли
детерминизма для replay/autoplay.

## 12. Sudoku

### Референсы

- [Sudoku.com](https://apps.apple.com/us/app/sudoku-com-number-games/id1193508329)
- [Killer Sudoku](https://apps.apple.com/us/app/killer-sudoku-by-sudoku-com/id1505735640)

### Сильные стороны

- строгий generator/solver;
- понятная долговечная аудитория;
- ежедневные задания и difficulty tiers;
- низкая asset-стоимость.

### Проблема для ленты

Полное 9×9 Sudoku долгое, визуально статичное и требует сложного digit-first
или cell-first input, notes и error policy.

### Возможный micro-MVP

- 4×4 или 6×6;
- поставить последние 3–5 чисел;
- найти ошибку;
- один логический приём на уровень;
- полный 9×9 оставить отдельным долгим режимом, если платформа его введёт
  осознанно.

## 13. Solitaire

### Референсы

- [Microsoft Solitaire Collection](https://apps.apple.com/us/app/microsoft-solitaire-collection/id1103438575)
- [Word Solitaire: Categories](https://apps.apple.com/us/app/word-solitaire-categories/id6756303194)

### Разделение

- Klondike, Spider и FreeCell требуют разных правил движения и проверки;
- TriPeaks/Pyramid короче и лучше подходят one-tap карточке;
- Word Solitaire — semantic sorting, а не карточная patience-игра.

### Рекомендация

Если нужен первый solitaire-класс для swipe:

1. TriPeaks/Pyramid;
2. затем Word Solitaire;
3. только затем Klondike;
4. Spider — после общего card layout/input/runtime.

### Риски

- естественная длительность партии;
- малый размер карт на телефоне;
- drag/drop и auto-move;
- генерация случайной сдачи не гарантирует интересную сдачу;
- solver и понятие сложности различаются по вариантам.

## 14. ASMR / Perfect Tidy / makeover

### Референсы

- [Perfect Tidy](https://apps.apple.com/us/app/perfect-tidy/id6689516283)
- [Makeover Studio 3D](https://apps.apple.com/us/app/makeover-studio-3d/id1556676622)
- [ASMR Studio 3D](https://apps.apple.com/us/app/asmr-studio-3d-ultimate-relax/id1566369638)

### Это anthology, а не одно правило

Возможные tool-primitives:

- scrub/erase;
- wash/rinse;
- scrape/peel;
- cut/trim;
- squeeze/extract;
- sand/polish;
- sort/place;
- paint/fill.

### Первый MVP

Один инструмент и одна поверхность. Например:

- игрок водит scraper;
- маска загрязнения уменьшается;
- particles/audio/haptic дают feedback;
- победа при достижении coverage threshold;
- задача длится 20–30 секунд.

### Платформенная ценность

Сильный autoplay hook и one-finger takeover. Общий tool-surface-progress
runtime может поддержать множество тем.

### Риски

- производство исходных изображений и масок;
- высокая зависимость от звука, частиц и анимации;
- отсутствие puzzle depth;
- слабая процедурная генерация без art factory;
- потенциально чувствительные body/medical темы требуют отдельной taste/safety
  политики.

## 15. Micro Tower Defense

### Референсы

- [Kingdom Rush](https://apps.apple.com/us/app/kingdom-rush-tower-defense-td/id516378985)
- [Rush Royale](https://apps.apple.com/us/app/rush-royale-tower-defense-rpg/id1526121033)
- [Mob Control](https://apps.apple.com/us/app/mob-control/id1562817072)

### Возможные подклассы

- path TD с размещением башен;
- merge TD;
- abstract lane/crowd strategy.

Их не следует реализовывать одним «универсальным TD» до выбора точного
эталона.

### Path-TD MVP

- одна дорожка;
- три build spot;
- два типа башен;
- одно улучшение;
- 2–3 короткие волны;
- один тяжёлый противник;
- 30–45 секунд;
- без колоды, долгой экономики и меты.

### Зависимости

Рационально строить после Survivor micro-wave, переиспользуя enemy,
projectile, targeting, damage, wave scheduler и quality tier.

### Риски

- высокая связность систем;
- баланс экономики, пути и урона;
- autoplay может принимать стратегические решения вместо объяснения;
- слишком мало времени для осмысленного build choice.

# Рекомендация первого эталона

## Почему Arrows

Arrows лучше всего проверяет полный целевой контур «эталон → typed level →
solver → generator → серия → autoplay → takeover → completion», не требуя
дорогой графики и real-time симуляции.

Это важнее, чем просто быстро получить ещё один плейбл. Первый класс должен
научить систему воспроизводимо:

- описывать правило;
- хранить уровень как данные;
- доказывать проходимость;
- ранжировать сложность;
- строить серию;
- повторять автодемо;
- интегрироваться с feed lifecycle.

## Предлагаемый bounded prototype

- одна точная reference-версия правила;
- пять уровней;
- 20–60 секунд на уровень;
- один тип стрелки;
- фиксированная политика ошибки;
- autoplay с deterministic solver trace;
- takeover без перезапуска уровня либо с явно зафиксированной политикой;
- host pause/resume;
- completion success/fail;
- typed level pack;
- solver и базовый generator;
- visual proof на целевых aspect buckets;
- без меты и без модельной генерации.

## Kill/stop-сигналы

До расширения класса остановиться и пересмотреть подход, если:

- правило не считывается из автодемо без текста;
- takeover регулярно вызывает непреднамеренный ход;
- generated levels требуют ручного ремонта;
- solver trace нельзя детерминированно воспроизвести в runtime;
- пять уровней не дают заметного роста сложности;
- bundle/runtime не укладывается в общие ограничения feed.

# Общий контракт эталонного прототипа

Этот контракт используется для любого нового класса. Конкретные значения
фиксируются в class brief.

## Gameplay contract

- одно предложение core fantasy;
- одно предложение core loop;
- точные win/fail states;
- целевая длительность и число действий;
- tutorial policy;
- допустимая случайность;
- takeover semantics;
- autoplay policy;
- pause/resume semantics.

## Content contract

- versioned level schema;
- stable content identity;
- explicit seed, если есть случайность;
- сериализуемое начальное состояние;
- solver/validator version;
- difficulty features;
- provenance референса и generated pack;
- backward-compatibility policy.

## Runtime contract

- `static_ready`;
- `prepareInteractive`;
- `interactive_ready`;
- host pause;
- host autoplay/manual mode;
- `completed` с success;
- restart semantics;
- отсутствие внутренних переходов на следующий уровень;
- deterministic cleanup всех timers/listeners/audio.

Точные имена и wire-semantics не дублируются здесь: authority находится в
runtime-документации feed/playables.

## Presentation contract

- portrait-first layout;
- проверка compact и tall aspect;
- touch target не меньше установленного studio standard;
- читаемый state без цвета как единственного сигнала;
- reduced-effects/low-tier path для тяжёлых классов;
- sound-off остаётся полноценным опытом;
- cover совпадает с первым live frame.

## Evidence contract

- reference packet (включая числовой feel-разбор и parity checklist);
- class brief;
- solver/validator tests;
- deterministic replay;
- visual proof;
- **before/after GIF через AutoCursor на каждую feel-итерацию**;
- **side-by-side клип прототип/референс** для теста различимости;
- runtime checks;
- manual taste review;
- список известных расхождений с референсом;
- final disposition: accept / rework / reject.

## Fidelity contract — как попадать в референс

Точность к референсу решается подготовкой и критерием приёмки, а не объёмом
разработки. Обязательный процесс задан в
[`REFERENCE-REPLICATION-PROCESS.md`](REFERENCE-REPLICATION-PROCESS.md); этот
раздел оставляет краткий product-facing контракт:

1. **Reference packet с числами, а не ссылками.** До старта Engine feel-таблица
   заполнена конкретными значениями (мс, px, доли экрана, easing); спорные
   значения — blocking-вопросы brief, как и спорные правила.
2. **Два контура сравнения.** `Reference -> Twin` доказывает causal fidelity;
   identification применяется только к identity-normalized каналам.
   `Twin -> Original` использует matched-сценарии и bounded preference choice,
   поскольку собственная visual identity видна по определению.
3. **Приёмка — на устройстве, в темпе реального игрока.** Не в devtools и не
   ускоренным прогоном. Каждая feel-итерация сопровождается before/after GIF
   (AutoCursor), чтобы разница была видна в ревью без запуска.
4. **Taste проверяется до scale-out.** Один vertical slice получает
   operator disposition до реализации серии, factory и широкого polish.
5. **Evidence, contract и shipping profile разделены.** Код потребляет
   first-party presentation profile; измерения capture не становятся
   shipping authority напрямую.

Визуальная идентичность: референс воспроизводится по ощущению, арт — свой
через SkinSpec-пайплайн (одновременно rights-гигиена и вход в фабрику
сеттингов).

# Карта параллельной разработки

## Workstream R — Reference research

**Вход:** название класса и список кандидатов.

**Выход:** reference packet.

Содержимое:

- запись полного успешного раунда;
- запись ошибки/fail;
- запись restart/hint/undo;
- покадровая последовательность первых 10–15 секунд;
- **числовой feel-разбор**: из покадрового анализа — таблица параметров
  ощущения с числами (длительности анимаций в мс, easing, скорости и
  траектории, размеры и отступы в долях экрана, тайминг haptics, каденция
  «почти получилось»). «Сделай как в референсе» без чисел не является
  reference packet: исполнитель с таблицей сходится за 2–3 итерации,
  исполнитель со ссылкой на видео — нет;
- таблица правил и edge cases;
- список принципиального juice;
- **reference parity checklist**: ~20 наблюдаемых свойств, каждое
  формулируется проверяемо («стрелка стартует ≤50 мс после тапа», «при
  блокировке — отдача 4–6 px с bounce»), — он же становится приёмочным
  чек-листом Review 4;
- список того, что нельзя копировать: бренд, тексты, арт, музыка;
- решение, какой конкретный вариант правила является эталоном.

Не зависит от реализации и может идти первым либо параллельно общему runtime
spike.

## Workstream G — Gameplay specification

**Вход:** reference packet.

**Выход:** заполненный [`CLASS-BRIEF-TEMPLATE.md`](CLASS-BRIEF-TEMPLATE.md).

Фиксирует:

- state machine;
- input semantics;
- win/fail;
- autoplay/takeover;
- level schema draft;
- non-goals;
- acceptance examples.

Начало engine и generator до согласования неоднозначных правил создаёт
расходящиеся реализации; поэтому спорные поля brief являются блокером, а не
«деталью на потом».

## Workstream E — Engine/runtime

**Вход:** согласованный gameplay contract.

**Выход:** headless либо minimal-visual playable ядро.

Задачи:

- state transition;
- input;
- deterministic tick/step;
- pause/resume;
- restart;
- serialization;
- event bridge;
- autoplay hook.

Engine не владеет художественной темой и не генерирует уровни.

## Workstream S — Solver/validator

**Вход:** level schema и точные правила.

**Выход:** чистый валидатор и solver receipt.

Задачи:

- schema validation;
- legal moves;
- terminal state;
- solvability;
- minimal/acceptable solution;
- complexity features;
- deterministic trace;
- property/fuzz tests.

Для классов без полного solver-а workstream всё равно определяет
machine-checkable invariants.

## Workstream F — Level factory

**Вход:** validator/solver API.

**Выход:** seed → candidate pack → validation receipt.

Задачи:

- construction strategy;
- deduplication;
- difficulty targeting;
- rejection reasons;
- bounded budgets;
- series assembly;
- provenance.

Factory не может объявить уровень «хорошим»: она только производит кандидата
и evidence для taste review.

## Workstream P — Presentation and juice

**Вход:** эталонные состояния и minimal engine.

**Выход:** theme-neutral visual layer и один first-party skin.

Задачи:

- layout;
- sprites/shapes;
- motion language;
- blocked/success/fail feedback;
- audio/haptics;
- particles;
- quality tiers;
- accessibility signals.

Должен иметь mocked state harness, чтобы не ждать готовую фабрику.

## Workstream I — Feed integration

**Вход:** минимальный engine и platform runtime contract.

**Выход:** swipe-build, работающий внутри реального feed shell.

Задачи:

- staged boot;
- poster/live registration;
- host pause;
- autoplay/manual takeover;
- completion bridge;
- level parameter;
- mount-cost evidence;
- cleanup;
- cache/version identity.

## Workstream Q — QA and evidence

**Вход:** интегрированный кандидат.

**Выход:** review packet.

Задачи:

- runtime checks;
- aspect/device matrix;
- deterministic replay;
- visual proof;
- performance sample;
- reference delta list;
- fail/restart coverage;
- known limitations;
- reviewer dispositions.

Автор и финальный reviewer не должны быть одним и тем же исполнителем, когда
работа готовится к merge/rollout.

## Workstream A — Analytics and experiment design

**Вход:** gameplay milestones и продуктовая гипотеза.

**Выход:** measurement brief.

Минимальные вопросы:

- считывается ли автодемо;
- происходит ли takeover;
- time to first manual action;
- completion/fail;
- число ошибок;
- время решения;
- продолжение серии;
- возврат к другой серии.

Telemetry events не становятся новыми success-метриками автоматически:
квалифицированный исход определяется VISION.

## Зависимости workstream'ов

```text
R Reference
  └─> G Gameplay spec
        ├─> E Engine ──────────┐
        ├─> S Solver ─> F Factory
        ├─> P Presentation     ├─> I Feed integration ─> Q Evidence
        └─> A Measurement ─────┘
```

После фиксации gameplay spec параллельно могут идти `Engine`, `Solver`,
`Presentation` и `Measurement`. `Factory` зависит от solver/validator.
Полная feed-интеграция зависит от engine, но её shell-spike может начаться
раньше на mock state.

# Пример декомпозиции Arrows

| Пакет | Scope | Зависит от | Проверяемый результат |
| --- | --- | --- | --- |
| AR-R | два reference packet | — | утверждён один эталон правила |
| AR-G | state machine + schema | AR-R | brief без открытых blocking-вопросов |
| AR-E | tap/remove/fail runtime | AR-G | deterministic headless tests |
| AR-S | solver + trace | AR-G | решает fixtures и отклоняет invalid boards |
| AR-F | reverse generator | AR-S | bounded batch с receipts |
| AR-P | layout/juice/audio | AR-G | mocked visual proof на двух aspect buckets |
| AR-I | staged boot/takeover | AR-E | реальный feed lifecycle |
| AR-A | measurement brief | AR-G | события сопоставлены с вопросами |
| AR-Q | интеграционное ревью | AR-E/S/F/P/I/A | один evidence packet |

Рекомендуемая merge-граница — не «каждый поток вливает что получилось», а
согласованные typed interfaces:

- `level schema`;
- `engine state/action`;
- `solver result/trace`;
- `presentation state projection`;
- `runtime bridge`;
- `validation receipt`.

# Как ревьюить портфель

## Review 1 — Taxonomy

Вопрос: правильно ли разделены классы и выбран ли точный референс?

Результат:

- accept;
- split;
- merge;
- needs reference.

## Review 2 — Priority

Вопрос: какой класс сильнее приближает текущий продуктовый exit-критерий при
минимальной цене внимания и реализации?

Результат:

- next prototype;
- research only;
- defer;
- reject.

## Review 3 — Class brief

Вопрос: достаточно ли точно описаны правило, границы и acceptance, чтобы
независимые исполнители не принимали разные продуктовые решения?

Результат:

- ready for parallel implementation;
- rework;
- blocked on operator choice.

## Review 4 — Evidence

Вопрос: соответствует ли прототип эталону и платформенному контракту — и
проходит ли тест различимости (parity checklist + side-by-side, Fidelity
contract)?

Результат:

- accept as class baseline;
- accept as disposable spike;
- rework;
- reject.

# Открытые решения

Эти вопросы нельзя закрыть одним рыночным обзором:

1. Какая конкретная реализация «Стрелок» является вкусовым эталоном?
2. Нужна ли цена за ошибочный тап или только feedback?
3. Какой референс имеется в виду под carry-stack/production?
4. Block Blast нужен как endless score или как конечный puzzle?
5. Для Triple-tile решения закрыты: fail при post-resolve occupancy `7`;
   primary Zen Match, structural anchors `6–10`, full swipe autoplay,
   no-booster baseline, audio off и light/soft/rigid haptics утверждены.
   Exact layouts/assets не копируются; cold load/covered/fail evidence нужен
   до final parity, не до prototype TT-P. Classic exposed-pair Mahjong
   запускается только отдельной инициативой.
6. Для Word первого класса приоритетнее русский, английский или
   мультиязычность с первого дня?
7. Traffic Jam — target-exit или clear-all?
8. ASMR начинается с cleaning, scraping или makeover?
9. Micro TD — path placement, merge TD или crowd/lane strategy?
10. Является ли Smash Fest самостоятельным обязательным классом?

# Следующий review packet

Для финального выбора первого прототипа достаточно собрать по трём кандидатам:

- Arrows;
- Block Out!;
- Survivor micro-wave.

На каждый кандидат:

1. один полный screen recording;
2. один fail/error recording;
3. список из 3–7 принципиальных ощущений;
4. список допустимых упрощений;
5. ответ, что должно остаться тем же после смены темы и арта.

После этого заполняются три class brief, и priority review сравнивает уже
конкретные bounded-прототипы, а не названия жанров.
