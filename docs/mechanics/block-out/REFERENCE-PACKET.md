# BO-R: reference packet — Block Out!

- Дата среза: **29.07.2026**
- Статус: **Review 1 research complete / Review 2 blocked on operator packet**
- Предлагаемый primary reference (`P`): **Block Out! - Color Sort Puzzle,
  Grand Games A.Ş.**
- Предлагаемый fidelity band (`P`): **ранние статические уровни 6–10**
- Связанный brief: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)

> Документ разводит несколько разных core loop'ов, которые рынок называет
> похожими именами. Он не утверждает primary reference, gameplay defaults,
> числовой feel или право начать реализацию. До exact link, native recording,
> target levels, must-preserve и `Defaults approve`/exceptions от оператора
> `BO-E/BO-S/BO-F/BO-P/BO-I` не стартуют.

## Обозначения evidence

- `R` — измерено или непосредственно наблюдено по указанному референсу;
- `O` — явно утверждено оператором;
- `P` — предлагаемое значение или правило, ещё не ставшее authority.

`R` относится к конкретному source snapshot. Store-copy подтверждает identity и
заявленные правила, но не заменяет покадровое измерение. Публичный montage
подтверждает видимый loop, однако не даёт надёжного touch-down, haptic и
sub-frame timing.

На этом review:

- gameplay/feel-решений со статусом `O` **нет**;
- recommendation и defaults имеют только статус `P`;
- числовой feel остаётся blocking до operator recording.

## Taxonomy decision: что здесь называется Block Out!

Рабочее определение класса:

> **Color-gate clear-all spatial routing:** игрок drag'ом перемещает
> разноформенные цветные блоки по ограниченному ортогональному полю, освобождает
> пространство и выводит каждый блок через совпадающую граничную дверь; победа —
> очистить поле, базовый fail выбранных рыночных референсов — исчерпать таймер.

Это отдельный класс от:

| Не смешивать | Другое ядро |
| --- | --- |
| Block Blast / placement blocks | фигуры кладутся из внешнего tray; очищаются заполненные строки/колонки |
| falling blocks / Blockout 3D | фигуры падают в real time под гравитацией |
| Rush Hour / Unblock Me | вывести один target block; остальные блоки не сортируются по цветным воротам |
| Parking Jam | очистить транспорт вдоль его оси/на выезд; нет color-gate matching |
| Arrows / Tap Away | tap удаляет объект по направлению; нет drag и свободного reposition |
| tube/ball color sort | содержимое перекладывается между контейнерами; нет пространственной маршрутизации форм |
| Sokoban | игрок толкает ящики аватаром; пространство действий определяется позицией героя |

Поздние elevators, block generators, shutters, ivy и другие modifiers — не
отдельный genre, но и не часть автоматически принятого baseline. Они требуют
versioned rules и отдельного operator approve после статического ядра.

## Источники

| ID | Источник | Что подтверждает | Ограничение |
| --- | --- | --- | --- |
| `BO-R-S1` | [App Store: Block Out! - Color Sort Puzzle](https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568) | exact identity, Grand Games, slide-to-matching-doors, elevators/generators, timed pressure | store-copy не определяет release snap/collision и timing |
| `BO-R-S2` | [Block Out! levels 1–20 gameplay](https://www.youtube.com/watch?v=VU9mQ_gleN8) | grid, polyomino blocks, boundary gates, timer, ранний progression и поздние numbered/dynamic элементы | public montage, версия build неизвестна, touch/haptic не видны |
| `BO-R-S3` | [Block Out! levels 1–15 walkthrough](https://www.youtube.com/watch?v=VwdvAFFBDiA) | второй independent public view ранних статических уровней, clear animation, timer | монтаж и переходы входят в duration |
| `BO-R-S4` | [App Store: Color Block Jam](https://apps.apple.com/in/app/color-block-jam/id6504332779) | Rollic identity, free sliding, matching doors, clear-all, blockers, timer | не выбранный title; exact rules могут отличаться |
| `BO-R-S5` | [Color Block Jam levels 1–20 gameplay](https://www.youtube.com/watch?v=bS3Kjyi5dx0) | timer, polyomino shapes, constrained blocks, clear-all, early progression | public recording, версия неизвестна |
| `BO-R-S5b` | [Color Block Jam levels 1–20 iOS gameplay](https://www.youtube.com/watch?v=sXslmdaKW9Y) | independent gross-duration comparison раннего progression | public recording, версия неизвестна |
| `BO-R-S6` | [App Store: Wood Out: Color Jam](https://apps.apple.com/gb/app/wood-out-color-jam/id6742745080) | matching doors, Arrow/Locked/Ice/Double Layer modifiers | exact duration/control не измерены |
| `BO-R-S7` | [App Store: Unblock Me Premium](https://apps.apple.com/us/app/unblock-me-premium/id315021242) | target-exit negative control и зрелая sliding-block difficulty model | другой core loop; не fidelity candidate |

Store metadata и live progression меняются. Поэтому operator recording после
Review 1 становится fidelity authority, если он расходится с публичным видео.

## Candidate matrix

| Candidate | Точное ядро | Управление | Win / fail | Наблюдаемая длительность | Модель сложности | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| **Block Out! — Grand Games** | вывести все polyomino blocks через matching boundary gates, переставляя их внутри тесного поля | `R`: one-finger drag, ортогональное grid-snap перемещение; exact free-stop vs slide-stop требует native clip | `R`: clear all / timer expiry; позднее lives/boosters принадлежат meta | `R`: public compilations дают `6:51 / 15 ≈ 27 s` и `9:48 / 20 ≈ 29 s` gross на ранний уровень, включая transitions | формы, occupancy, число ворот, gate contention, detours, order dependencies; позднее generators/elevators/shutters и более жёсткий timer | **primary (`P`)** |
| **Color Block Jam — Rollic/Gybe** | тот же color-gate clear-all family, но с быстро растущим modifier language | `R`: store прямо говорит «slide freely»; video показывает grid drag и direction-constrained blocks | `R`: clear all / timer expiry | `R`: public early recordings `11:35 / 20 ≈ 35 s` gross; другой recording `15:00 / 20 ≈ 45 s` gross | shapes, свободное место, directional blocks, blockers, moving paths, later obstacle language | secondary/fallback |
| **Wood Out: Color Jam — Loop Games** | деревянные color blocks к matching doors плюс obstacle anthology | `R`: slide/move blocks; exact snap semantics не измерены | `R`: clear all; timer подтверждён listing reviews, exact fail UX не измерен | `R`: не измерено | Arrow, Locked, Ice, Double Layer; difficulty сильно зависит от special rules | secondary only |
| **Unblock Me — Kiragames** | вывести один красный target block, переставляя axis-locked blockers | `R`: drag blocks вдоль собственной оси | `R`: target exits; Relax без time fail, Challenge добавляет pressure | `R`: не измерено для этого packet | minimal moves, blockers, corridor depth, dependency chain | negative control; solver inspiration only |

Gross averages не являются target feel: записи включают start/win transitions,
а игроки знают решение. Они показывают лишь совместимость family с короткой
карточкой. Target duration утверждается отдельно.

## Три кандидата на primary

### A — Block Out! / Grand Games, раннее статическое ядро

**Предложение (`P`): primary.**

Почему:

- это exact title из каталога и самый сильный identity match;
- ранние уровни показывают чистое правило до усложнения dynamic modifiers;
- формы уже разнообразнее Traffic/Rush Hour, но state остаётся дискретным;
- публичные записи подтверждают короткий gross clear;
- выбранный store listing явно показывает, что generators/elevators — развитие,
  а не обязательное правило первого уровня.

Предлагаемый fidelity band (`P`): **levels 6–10** из exact operator build.
Причина границы: диапазон уже содержит несколько цветов и polyomino shapes, но
по публичной записи остаётся до numbered/generator-like complexity, видимой
дальше. Если operator build имеет другой progression, номера не переносятся:
выбирается эквивалентный первый статический band.

### B — Color Block Jam / Rollic, ранний pre-modifier band

Сильный fallback, если оператор под «Block Out!» фактически имеет в виду эту
игру. Она лучше документирует free-slide wording и имеет зрелый modifier
language. Не рекомендуется смешивать её defaults с Grand Games: gate sizes,
direction-constrained blocks, timer и progression могут отличаться.

### C — Wood Out: Color Jam, ранний pre-special band

Подходит, только если taste-цель — деревянная tactile presentation и набор
Arrow/Locked/Ice rules. Как baseline хуже A: visual identity теснее связана с
wood/studded trade dress, а modifier anthology повышает schema и solver scope до
доказательства базового loop.

## Recommendation

`P`: выбрать **Block Out! - Color Sort Puzzle by Grand Games** и fidelity band
**6–10 в exact operator build**, но реализовывать не layouts, а пять собственных
уровней той же воспринимаемой сложности.

Baseline (`P`):

- static rectangular board;
- rigid, non-rotating orthogonal polyomino blocks;
- matching boundary gates;
- drag/reposition/exit;
- clear-all win;
- reference timer fail;
- без generators, elevators, shutters, ivy, locks, ice, boosters и meta.

Blocking rule до Review 2: определяется ли один solver action как свободный
release в любой reachable lattice anchor, slide до collision, либо серия
одноклеточных translations. Это нельзя вывести из названия или store-copy.

## Почему family подходит ICP и swipe-ленте

- Core audience VISION уже familiar с short spatial puzzles; color matching
  снижает verbal tutorial cost.
- Один finger, крупные shapes, clear board и немедленное освобождение
  пространства дают понятный «до/после» даже без звука.
- Successful gate exit — сильный autoplay hook: намерение, движение и результат
  видны в одном коротком жесте.
- Grid и короткая серия поддерживают deterministic replay, exact identity и
  shareable level.
- Own SkinSpec позволяет менять setting без изменения solver state.

Риски для ICP:

- таймер может превращать спокойную spatial puzzle в punitive dexterity test;
- цвет не может быть единственным gameplay channel;
- мелкие gates и близкие оттенки уже названы accessibility-проблемой в reviews;
- aggressive late-game monetization/boosters не являются fidelity target.

## Time-to-rule, autoplay и takeover

Предлагаемый contract (`P`, не `R`):

1. first live frame сразу показывает board, blocks и gates;
2. AutoCursor берёт один очевидный block, визуально несёт его и выводит через
   matching gate;
3. первый completed exit происходит за `≤1.50 s` от first live frame (`P`);
4. autoplay делает `2` legal moves или не более `25%` witness trace (`P`);
5. первый pointerdown по live block атомарно переводит в manual;
6. takeover сохраняет exact logical state и in-flight presentation, без restart
   и скрытого autoplay move;
7. pointerdown/drag по background остаётся host swipe по platform authority;
8. autoplay никогда не демонстрирует fail, booster или monetization.

Числа выше — design proposals, не measurements. После native recording они
либо заменяются `R`, либо становятся явными `O`.

## Генеративность и solver authority

### Дискретная модель (`P`, зависит от movement ruling)

- board — finite lattice;
- block — stable id, role/color, immutable polyomino footprint и mutable anchor;
- rotation disabled;
- gate — boundary span, role/color и exit direction;
- stable state — anchors live blocks + remaining timer/resource state;
- legal move — reachable collision-free translation и optional matching exit;
- terminal success — no live blocks.

Если drag разрешает поворот траектории без release, solver legal transition
строится через configuration-space reachability для footprint. Если каждый
swipe движет только по одной оси/до препятствия, graph другой. `BO-S` не выбирает
между ними самостоятельно.

### Что может утверждать solver

- schema/geometry validity;
- legal transitions;
- наличие хотя бы одного all-clear witness;
- minimal или bounded move count при утверждённой action semantics;
- deterministic witness trace;
- feature vector и duplicate fingerprint;
- отсутствие runtime randomness.

Solver **не** утверждает:

- fun, fairness или visual readability;
- достижимость таймера человеком без отдельной calibrated action-time model;
- taste-quality generated candidate;
- право публикации.

### Reverse construction / goal-pull

Предпочтительный research path (`P`) — **goal-pull reverse construction**:

1. начать с пустого board и набора typed gates;
2. вставить block через его matching gate в обратном направлении;
3. выполнить одну или несколько обратимых collision-free translations от gate;
4. добавить следующий block так, чтобы он создавал gate contention или
   dependency, не ломая сохранённый reverse witness;
5. после полной сборки решить уровень forward solver'ом;
6. измерить branching, forced order, detours, dead ends и minimum drag count;
7. отбросить trivial, duplicate, unreadable и timer-infeasible candidates;
8. передать solver-valid candidates human taste review.

Если утверждённая movement semantics необратима (например, forced slide to
collision), construction хранит точные inverse-predecessor constraints либо
переходит на bounded forward search from authored goal shells. «Reverse» не
считается доказанным до property tests `construct -> solve -> replay`.

### Difficulty features

- `blockCount`, `occupiedRatio`, `freeCellCount`;
- footprint area, turn count и shape complexity;
- `gateCount`, gate width, role multiplicity и gate contention;
- minimal moves и total anchor distance;
- forced-prefix length, mean branching, dependency depth/width;
- число non-exit reposition moves и reversals;
- reachable-state count в budget;
- dead-end exposure;
- minimum readable cell size;
- reference timer slack только после action-time calibration.

Density сама по себе не равна difficulty.

## WebView performance risk

Оценка: **low/medium для static baseline**, **medium/high для dynamic modifiers**.

Baseline не требует rigid-body physics, WebGL или runtime solver. Основные
риски:

- `pointermove` на high-DPR устройствах;
- footprint collision/path reachability на каждом event;
- full-canvas redraw, shadows и частицы во время drag;
- несколько exit animations и haptics;
- accidental main-thread solver/generator work;
- слишком маленькие клетки при сложных polyomino boards.

Mitigation contract (`P`):

- Canvas 2D, integer occupancy masks и fixed logical coordinates;
- presentation следует pointer, engine commit получает только stable
  lattice action;
- coalesced pointer samples, capped DPR/quality tier;
- solver/generator только offline;
- bounded particles, no external media, sound optional;
- staged boot, host pause и deterministic cleanup из shared runtime;
- device evidence на compact/tall WebView до Review 4.

## Reuse boundary: Sort, Pins и shared runtime

Переиспользовать как patterns/contracts:

- shared `AutoCursor` drag + carried payload и общий finger renderer;
- `static_ready -> prepareInteractive -> interactive_ready`, host pause/resume,
  completion, cleanup, viewport/input mapping, quality/perf sampling;
- series parameter delivery и stable level identity;
- Sort exact-key `LevelSpec`, canonical digest, runtime contract digest,
  fail-closed catalog handshake и отдельный `SkinSpec`;
- Sort role token -> display color/marker mapping, чтобы gameplay identity не
  зависела от palette;
- Pins/Sort visual-proof, device, pause/outcome и exact-once evidence patterns.

Не переиспользовать:

- Sort gameplay state, conveyor/stack rules или scheduler;
- Pins physics, pin/cascade state или authored levels;
- Arrows timing, camera, state machine, collision и solver decisions;
- поздние Block Out modifiers до versioned rule approval.

Block Out получает собственные engine, gesture translator, collision model и
solver. Shared primitives экономят runtime/evidence work, но не выбирают
gameplay semantics.

## IP / visual-identity boundary

Не копируем:

- название, logo, icon, characters, journey/meta и store creative;
- exact layouts или identifiable progression выбранных levels;
- studded toy-brick shapes как trade dress, фирменную palette, shaders, fonts;
- gate art, particles, sound, music, haptic pattern и win/fail screens;
- booster icons, monetization UI и ad cadence.

Сохраняем как gameplay/fidelity target после approve:

- color/role-gate clear-all rule;
- пространственное освобождение и order planning;
- читаемое carry/drag/exit ощущение;
- target difficulty и round cadence, но не exact maps.

Own visual identity:

- theme-neutral geometric prototype;
- `BlockOutSkinSpecV1`, не theme fields в engine;
- каждый gameplay role имеет color + independent marker/pattern/glyph;
- пять собственных generated/curated layouts;
- минимум один reference level остаётся visual/difficulty holdout.

## Числовой feel-разбор

До native recording таблица намеренно не выдаёт публичный montage за точное
измерение.

| Параметр | Значение | Статус | Основание / блокер |
| --- | ---: | :---: | --- |
| Early compilation gross duration | `~27–29 s/level` | `R` | `BO-R-S2/S3`; включает transitions, не target |
| Color Block Jam early gross duration | `~35–45 s/level` | `R` | `BO-R-S5/S5b`; comparison only |
| First live frame -> first completed exit | `≤1,500 ms` | `P` | feed-hook proposal; native timing pending |
| Autoplay moves | `2` или `≤25%` witness | `P` | takeover proposal |
| Bounded manual duration | `20–45 s`, hard review at `60 s` | `P` | swipe-card proposal, не reference measurement |
| Board fit, cell size, drag lag | blocking | — | нужен native crop и aspect |
| Touch-down response | blocking | — | нужен native `60 fps` recording |
| Carry easing / snap / release | blocking | — | exact movement semantics не подтверждена |
| Gate consume duration | blocking | — | нужен successful exit close-up |
| Invalid drag feedback | blocking | — | нужен error episode |
| Win/fail onset and settle | blocking | — | нужен full success + timer fail |
| Haptic semantics/intensity | blocking | — | recording не измеряет физический haptic; решение `O` |

## Preliminary parity checklist

Пункты с числами `P` становятся acceptance только после Review 2. Остальные
получат `R/O` значения из native evidence.

### Rule/state

- [ ] Один и тот же approved movement rule используется input, engine и solver.
- [ ] Block footprint не пересекает walls или live blocks в stable state.
- [ ] Rotation отсутствует, если отдельно не утверждена оператором.
- [ ] Через gate выходит только block совпадающего gameplay role.
- [ ] Exit принимается только когда footprint целиком совместим с gate opening.
- [ ] Successful exit удаляет ровно один live block.
- [ ] Win наступает только после выхода всех required blocks.
- [ ] Timer fail и restart возвращают exact documented state.

### Drag/feedback

- [ ] Pointerdown по live block начинает carry без state teleport.
- [ ] Visual carried block следует finger; исходный block не рисуется дважды.
- [ ] Collision response и release snap совпадают с native reference.
- [ ] Invalid release не создаёт скрытого solver move.
- [ ] Gate consume сохраняет shape identity до утверждённой exit phase.
- [ ] Color-independent marker остаётся читаем во время carry и в gate.
- [ ] Success/fail feedback работает без звука.

### Feed/runtime

- [ ] Первый completed autoplay exit происходит за `≤1,500 ms` (`P`).
- [ ] Autoplay использует deterministic solver witness.
- [ ] Takeover продолжает exact state без restart/hidden move.
- [ ] Background vertical gesture остаётся feed swipe по runtime authority.
- [ ] Host pause замораживает timer, carry и exit clocks.
- [ ] Completion отправляется ровно один раз.
- [ ] Cover совпадает с first live frame.

## Review 2 operator packet — пять обязательных входов

1. **Exact link:** store/developer URL выбранной игры; желательно версия/build
   и дата записи.
2. **Progression slice:** exact levels или непрерывный участок. Предложение
   (`P`) для Grand Games — `6–10`, либо эквивалентный static pre-modifier band.
3. **Native portrait screen recording:** минимум один полный success и один
   timer fail/restart; обязательно видны first frame, свободный reposition,
   blocked/invalid drag, matching gate exit, win и rapid second action.
   Предпочтительно `60 fps`, без ускорения и монтажных склеек.
4. **Must preserve:** `3–7` конкретных feel-моментов — carry, snap, gate
   consume, timer pressure, blocked feedback, win, haptic и т.п.
5. **Defaults:** точная строка `Defaults approve` либо исключения по movement,
   timer/fail, five-level band, static-only scope, autoplay/takeover и
   accessibility markers.

После получения packet `BO-R` выполняет frame/timestamp measurement и заменяет
blocking rows числами `R`; operator choices становятся `O`. Только затем
закрывается Review 2 и brief может идти в independent Review 3.

## Disposition BO-R

- Taxonomy: **split complete** — class не смешивается с placement, target-exit
  или Tap Away.
- Recommended primary: **Block Out! / Grand Games (`P`)**.
- Recommended target: **levels 6–10 static band (`P`)**.
- Review 2: **blocked on five operator inputs**.
- Implementation authority: **none**.
