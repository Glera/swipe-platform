# BO-R: reference packet — Block Out!

- Дата среза: **29.07.2026**
- Статус: **Review 1 accepted / Review 2 complete / ready for Review 3**
- Primary reference (`O`): **Block Out! - Color Sort Puzzle,
  Grand Games A.Ş.**
- Fidelity band (`O`): **ранние статические уровни 6–10**
- Связанный brief: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)
- Независимое ревью:
  [`REVIEW-1-INDEPENDENT-2026-07-29.md`](REVIEW-1-INDEPENDENT-2026-07-29.md)

> Документ разводит несколько разных core loop'ов, которые рынок называет
> похожими именами. Operator ruling утвердил reference, target band, continuous
> collision-constrained drag, no-inertia release, no-timer v1 и no-stuck
> invariant. Code authority не открывается этим research packet.

## Обозначения evidence

- `R-web` — измерено или непосредственно наблюдено по указанному web-source;
- `R-native` — измерено или непосредственно наблюдено в operator recording;
- `O` — явно утверждено оператором;
- `P` — предлагаемое значение или правило, ещё не ставшее authority.
- `B` — blocking: данных или решения пока недостаточно.

Любой `R-*` относится к конкретному source snapshot. Store-copy подтверждает
identity и заявленные правила, но не заменяет покадровое измерение. Публичный montage
подтверждает видимый loop, однако не даёт надёжного touch-down, haptic и
sub-frame timing.

На этом review:

- primary, target band, movement core, no-timer и no-stuck имеют статус `O`;
- quick flick не имеет inertia и заканчивается обычным grid snap (`O`);
- часть числового feel остаётся `B`: полученные clips не содержат invalid/fail
  probes и не являются 60 fps feel capture.

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
| `BO-R-N1` | operator clip `telegram-cloud-document-2-5424755505455214087.mp4`, SHA-256 `0fb2e58e902a1a354443bf42e1b8ee57f19cce965165aaaba5476598d77cda9a` | Grand Games Level 11, 384×832, 30 fps, 67.20 s; success, `02:00` budget, numbered/generator-like content, win flow | no fail/invalid/release probe; haptic физически не измерим |
| `BO-R-N2` | operator clip `telegram-cloud-document-2-5427007305268896417.mp4`, SHA-256 `3b463279a64c647153a370f97c432de1a91576b4aa6eb4a0e55955180213f9d1`, 384×832, 29.97 fps, 134.43 s | Grand Games Levels 12–13; continuous carried pose, timer budgets `02:00`/`02:15`, exits, numbered/ice-like content, success flow | montage из двух success runs; no fail/invalid/release probe |

N-2 verification boundary закрыта независимой byte/frame проверкой Claude:
полные SHA-256, metadata, level identity/content и timer deltas совпали с
packet; противоречащих кадров не найдено.

Store metadata и live progression меняются. Поэтому operator recording после
Review 1 становится fidelity authority, если он расходится с публичным видео.

## Candidate matrix

| Candidate | Точное ядро | Управление | Win / fail | Наблюдаемая длительность | Модель сложности | Disposition |
| --- | --- | --- | --- | --- | --- | --- |
| **Block Out! — Grand Games** | вывести все polyomino blocks через matching boundary gates, переставляя их внутри тесного поля | `R-native/O`: continuous two-axis drag through free configuration space; collision clamps carry; release snaps to lattice without inertia | `R-web/R-native`: reference clear-all/timer; `O`: own v1 clear-all/no timer | `R-web`: `6:50 / 15 ≈ 27 s` и `9:49 / 20 ≈ 29 s` gross на ранний уровень; `R-native`: L11–13 расходуют ≈55/57/51 s видимого active timer | формы, occupancy, число ворот, gate contention, detours, order dependencies; позднее generators/elevators/shutters и более жёсткий timer | **primary (`O`)** |
| **Color Block Jam — Rollic/Gybe** | тот же color-gate clear-all family, но с быстро растущим modifier language | `R-web`: store прямо говорит «slide freely»; video показывает grid drag и direction-constrained blocks | `R-web`: clear all / timer expiry | `R-web`: `11:34 / 20 ≈ 35 s`; independent recording `15:08 / 20 ≈ 45 s` gross | shapes, свободное место, directional blocks, blockers, moving paths, later obstacle language | secondary/fallback |
| **Wood Out: Color Jam — Loop Games** | деревянные color blocks к matching doors плюс obstacle anthology | `R-web`: slide/move blocks; exact snap semantics не измерены | `R-web`: clear all; timer подтверждён listing reviews, exact fail UX не измерен | `B`: не измерено | Arrow, Locked, Ice, Double Layer; difficulty сильно зависит от special rules | secondary only |
| **Unblock Me — Kiragames** | вывести один красный target block, переставляя axis-locked blockers | `R-web`: drag blocks вдоль собственной оси | `R-web`: target exits; Relax без time fail, Challenge добавляет pressure | `B`: не измерено для этого packet | minimal moves, blockers, corridor depth, dependency chain | negative control; solver inspiration only |

Gross averages не являются target feel: записи включают start/win transitions,
а игроки знают решение. Они показывают лишь совместимость family с короткой
карточкой. Target duration утверждается отдельно.

## Три кандидата на primary

### A — Block Out! / Grand Games, раннее статическое ядро

**Operator decision (`O`): primary.**

Почему:

- это exact title из каталога и самый сильный identity match;
- ранние уровни показывают чистое правило до усложнения dynamic modifiers;
- формы уже разнообразнее Traffic/Rush Hour, но state остаётся дискретным;
- публичные записи подтверждают короткий gross clear;
- выбранный store listing явно показывает, что generators/elevators — развитие,
  а не обязательное правило первого уровня.

Fidelity band (`O`): **levels 6–10** из operator reference.
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

`O`: выбран **Block Out! - Color Sort Puzzle by Grand Games** и fidelity band
**6–10**, но реализовывать не layouts, а пять собственных
уровней той же воспринимаемой сложности.

Baseline:

- static rectangular board (`P`);
- rigid, non-rotating orthogonal polyomino blocks (`P`);
- matching boundary gates (`P`);
- continuous two-axis drag inside the collision-free corridor (`O`);
- figures cannot overlap; carried pose stops at other figures/walls (`O`);
- release snaps to a legal lattice cell (`O`);
- clear-all win, no timer fail (`O`);
- no reachable unsolvable state in accepted v1 levels (`O`);
- без generators, elevators, shutters, ivy, locks, ice, boosters и meta (`P`).

Quick flick (`O`) не продолжает движение после release: velocity игнорируется,
gesture заканчивается обычным grid snap.

## Operator ruling — 29.07.2026

| Решение | Authority |
| --- | --- |
| Exact game: current linked Grand Games Block Out! | `O` |
| Target progression: levels `6–10` | `O` |
| Во время hold фигура свободно перемещается по двум осям и может менять направление без release | `O` |
| Continuous pose ограничен walls/другими figures; overlap и invalid pose физически недостижимы | `O` |
| Release привязывает фигуру к legal lattice cell | `O` |
| Timer отсутствует в own v1 | `O` |
| Accepted level не имеет reachable unsolvable state | `O` |
| Must-preserve: максимальная близость к reference по carry, collision, snap, gate consume, feedback, win cadence и board clarity в пределах IP boundary | `O` |
| Haptic | deferred; отдельное нетривиальное решение, не v1 blocker |
| Quick flick: no inertia, ordinary grid snap | `O` |

«Максимально близко» не разрешает копировать layouts, assets или trade dress и
не превращает ещё не измеренный feel в `R-native`.

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

Предлагаемый contract (`P`, не `R-*`):

1. scene-visible frame сразу показывает board, blocks и gates;
2. scene visible -> input-ready settle занимает `≤450 ms` (`P`) и измеряется
   отдельно от объясняющего действия;
3. AutoCursor берёт один очевидный block, визуально несёт его и выводит через
   matching gate;
4. первый completed exit происходит за `≤1.50 s` от scene-visible frame (`P`);
5. autoplay делает `2` legal moves или не более `25%` witness trace (`P`);
6. первый pointerdown по live block атомарно переводит в manual;
7. takeover сохраняет exact logical state и in-flight presentation, без restart
   и скрытого autoplay move;
8. pointerdown/drag по background остаётся host swipe по platform authority;
9. autoplay никогда не демонстрирует fail, booster или monetization.

Числа выше — design proposals, не measurements. После нужного evidence они
либо заменяются `R-native`, либо становятся явными `O`.

## Генеративность и solver authority

### Дискретная модель

- board — finite lattice;
- block — stable id, role/color, immutable polyomino footprint и mutable anchor;
- rotation disabled;
- gate — boundary span, role/color и exit direction;
- solver identity — canonical tuple `rulesVersion + live block ids + anchors`;
- runtime resource и presentation phase входят в runtime snapshot, но
  исключены из spatial solver identity;
- legal move (`O`) — любой target lattice anchor в том же collision-free
  configuration-space component; gesture может идти по двум осям и поворачивать
  без release;
- transient carried pose clamp'ится на configuration-space boundary и не
  становится solver state;
- release (`O`) commit'ит legal lattice anchor; pointer velocity не создаёт
  inertia или дополнительный solver action;
- terminal success — no live blocks.

Solver legal transition строится через configuration-space reachability для
полного footprint. Input, engine и solver используют одну collision authority;
solver не моделирует raw pointer samples.

### Что может утверждать solver

- schema/geometry validity;
- legal transitions;
- наличие хотя бы одного all-clear witness;
- strong solvability: каждый reachable stable state accepted level имеет путь к
  all-clear (`O` publication invariant);
- minimal или bounded move count при утверждённой action semantics;
- deterministic witness trace;
- feature vector и duplicate fingerprint;
- отсутствие runtime randomness.

Solver **не** утверждает:

- fun, fairness или visual readability;
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
7. отбросить trivial, duplicate, unreadable и не strong-solvable candidates;
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
- dead-end exposure (`0` для accepted v1 pack, `O`);
- minimum readable cell size;
- reference timer budget как comparative evidence, не own fail rule.

Density сама по себе не равна difficulty.

### Dead ends и stuck state

Operator ruling (`O`): reachable stuck/unsolvable state в accepted v1 level
невозможен. Поэтому:

- runtime не объявляет dead-end и не имеет timer-only fail;
- offline solver проверяет strong solvability всего reachable stable-state
  graph, а не только initial witness;
- generator отклоняет candidate при первом reachable state без all-clear path;
- `deadEndExposure` для принятого pack равен `0`;
- restart может оставаться user convenience, но не recovery из допустимого
  stuck state.

Если exhaustive proof не помещается в утверждённый offline budget, candidate
не проходит validation; ослаблять invariant до эвристики нельзя.

## WebView performance risk

Оценка: **low/medium для static baseline**, **medium/high для dynamic modifiers**.

Baseline не требует rigid-body physics, WebGL или runtime solver. Основные
риски:

- `pointermove` на high-DPR устройствах;
- footprint collision/path reachability на каждом event;
- full-canvas redraw, shadows и частицы во время drag;
- несколько concurrent exit animations;
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
| Early compilation gross duration | `~27–29 s/level` | `R-web` | YouTube metadata `9:49/20` и `6:50/15`; включает transitions, не target |
| Color Block Jam early gross duration | `~35–45 s/level` | `R-web` | YouTube metadata `11:34/20` и `15:08/20`; comparison only |
| Reference timer budgets L11/L12/L13 | `02:00 / 02:00 / 02:15` | `R-native` | visible HUD values in `BO-R-N1/N2`; own v1 timer disabled (`O`) |
| L11/L12/L13 active timer consumed to success | `≈55/57/51 s` | `R-native` | `BO-R-N1/N2`; разность видимых timer values, не frame-accurate feel timing |
| Scene visible -> input-ready settle | `≤450 ms` | `P` | отдельный feed settle budget |
| Scene visible -> first completed exit | `≤1,500 ms` | `P` | feed-hook proposal; native timing pending |
| Autoplay moves | `2` или `≤25%` witness | `P` | takeover proposal |
| Bounded manual duration | `20–45 s`, hard review at `60 s` | `P` | swipe-card proposal, не reference measurement |
| Board fit / portrait crop | `384×832`, levels fit without camera motion | `R-native` | `BO-R-N1/N2`; cell-size px measurement not yet requested |
| Continuous carried pose while held | observed at 30/29.97 fps | `R-native` | `BO-R-N1/N2`; does not determine release policy |
| Touch-down response | `B` | `B` | нужен native `60 fps` probe |
| Carry easing / snap / release | `B` | `B` | exact release semantics не подтверждена |
| Gate consume duration | `B` | `B` | нужен 60 fps successful-exit close-up |
| Invalid drag feedback | `B` | `B` | нужен scripted error episode |
| Win onset and settle | success observed; exact timing `B` | `R-native/B` | clips содержат success; own v1 не имеет fail (`O`) |
| Haptic semantics/intensity | deferred | `O` | отдельное нетривиальное решение; не входит в v1 |

## Preliminary parity checklist

Пункты с числами `P` становятся acceptance только после Review 2. Остальные
получат `R-native/O/B` значения из native evidence и operator decisions.

### Rule/state

- [ ] Один и тот же approved movement rule используется input, engine и solver.
- [ ] Block footprint не пересекает walls или live blocks в stable state.
- [ ] Rotation отсутствует, если отдельно не утверждена оператором.
- [ ] Через gate выходит только block совпадающего gameplay role.
- [ ] Exit принимается только когда footprint целиком совместим с gate opening.
- [ ] Successful exit удаляет ровно один live block.
- [ ] Win наступает только после выхода всех required blocks.
- [ ] Accepted pack подтверждён strong-solvable из каждого reachable stable
  state; timer/fail state отсутствует (`O`).
- [ ] Restart, если оставлен как convenience, возвращает exact initial state.

### Drag/feedback

- [ ] Pointerdown по live block начинает carry без state teleport.
- [ ] Visual carried block следует finger; исходный block не рисуется дважды.
- [ ] Collision response и release snap совпадают с native reference.
- [ ] Collision clamp не допускает invalid carried pose; release commit'ит
  legal lattice anchor и не создаёт скрытого solver move.
- [ ] Gate consume сохраняет shape identity до утверждённой exit phase.
- [ ] Color-independent marker остаётся читаем во время carry и в gate.
- [ ] Success feedback работает без звука; fail state отсутствует (`O`).

### Feed/runtime

- [ ] Первый completed autoplay exit происходит за `≤1,500 ms` (`P`).
- [ ] Autoplay использует deterministic solver witness.
- [ ] Takeover продолжает exact state без restart/hidden move.
- [ ] Background vertical gesture остаётся feed swipe по runtime authority.
- [ ] Host pause замораживает carry, exit и autoplay clocks.
- [ ] Completion отправляется ровно один раз.
- [ ] Cover совпадает с scene-visible frame.

## Review 2 operator packet — disposition

| Требуемый вход | Получено | Статус |
| --- | --- | --- |
| Exact link/game | current linked Grand Games Block Out! | `O`, closed |
| Progression slice | levels `6–10` | `O`, closed |
| Native recording | success L11–13, byte/frame verified | `R-native`, partial feel evidence |
| Movement semantics | continuous two-axis collision-constrained drag; turn/diagonal allowed; release to grid without inertia; invalid pose unreachable | `O`, closed |
| Must-preserve | максимально близко по перечисленным parity dimensions в IP boundary | `O`, closed as taste direction |
| Defaults/exceptions | no timer; no reachable stuck state; haptic deferred | `O`, closed |

Minimum logic packet закрыт: quick flick не имеет inertia и заканчивается
обычным grid snap (`O`).

Для `BO-P` по-прежнему нужны 60 fps measurements pickup/snap/gate/win, но они
калибруют утверждённый fidelity target и не переопределяют gameplay rules.

## Disposition BO-R

- Taxonomy: **split complete** — class не смешивается с placement, target-exit
  или Tap Away.
- Primary: **Block Out! / Grand Games (`O`)**.
- Target: **levels 6–10 static band (`O`)**.
- Review 2: **complete; ready for independent Review 3**.
- Implementation authority: **none**.
