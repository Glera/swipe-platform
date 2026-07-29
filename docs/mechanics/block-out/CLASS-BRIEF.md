# Class Brief: `block-out-v1`

- Дата: **29.07.2026**
- Статус: **Review 1 accepted — Review 2 ruling captured; quick flick `B`**
- Владелец taste-решения: **оператор**
- Автор brief: **Codex**
- Независимый reviewer: **Claude (Review 1); Review 3 ещё нужен**
- Reference packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)
- Review 1:
  [`REVIEW-1-INDEPENDENT-2026-07-29.md`](REVIEW-1-INDEPENDENT-2026-07-29.md)

> Brief фиксирует исследовательскую декомпозицию и typed boundaries. Primary
> reference, target band и core movement/no-timer/no-stuck decisions утверждены
> оператором (`O`). Quick-flick policy и measured presentation feel остаются
> открыты; документ сам по себе не разрешает implementation или rollout.

## Evidence notation

- `R-web` — измерено/наблюдено по exact web source;
- `R-native` — измерено/наблюдено в operator recording;
- `O` — явно утверждено оператором;
- `P` — предложение до operator approve.
- `B` — blocking: evidence или operator decision отсутствует.

Ни одно feel-значение не считается `R-*` только потому, что оно выглядит
правдоподобно. Operator decisions маркируются отдельно от native measurements.

## VISION-триаж

- Принцип/ступень VISION: фабрика от сильного эталона; короткий first-party
  puzzle class с autoplay -> takeover.
- Продуктовая неопределённость: способен ли drag-routing class пройти
  `reference -> typed pack -> solver -> generator -> series -> feed` и дать
  новый interaction primitive после tap-centric классов.
- Почему допустимо сейчас: это самостоятельная research/brief initiative; она
  не меняет `playables`, не открывает rollout и не нарушает параллельную Arrows
  implementation.
- Operator ruling: exact game/link, progression slice, movement core,
  no-timer/no-stuck и must-preserve direction получены; quick flick остаётся
  `B`, haptic deferred.
- Что документ не разрешает: code, prototype, публикацию, перенос Arrows
  gameplay decisions, копирование levels/assets или старт downstream packages.

## Цель

После Review 2/3 и будущей реализации оператор на целевом устройстве не может
назвать, чем 30-секундный side-by-side prototype и approved Block Out reference
хуже по ощущению carry, collision, snap, gate consume, timer pressure и board
clarity, при пяти собственных уровнях и собственной visual identity.

## Non-goals

- Block Blast/placement, falling blocks, Rush Hour, Parking Jam или Tap Away.
- Dynamic generators, elevators, shutters, ivy, ice, locks и booster language в
  static baseline.
- Копирование точных layouts, art, palette, sounds, meta и monetization.
- Runtime physics, WebGL или solver в пользовательском request path.
- Доказательство fun/retention одной solver solvability.
- Внутренний progression между уровнями: серию ведёт feed.
- Старт реализации до отдельного prototype authorization.

## Точный эталон

### Approved primary reference

- Название (`O`): **Block Out! - Color Sort Puzzle**.
- Developer (`R-web`): **Grand Games A.Ş.**
- Listing snapshot (`R-web`): App Store page observed 29.07.2026; live listing
  version/build может измениться.
- Ссылка: [App Store](https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568).
- Public recording:
  [levels 1–20](https://www.youtube.com/watch?v=VU9mQ_gleN8).
- Native recordings (`R-native`): Levels 11–13 success получены и byte/frame
  verified; 60 fps pickup/snap/gate/win measurements остаются `B`.
- Диапазон (`O`): **levels 6–10** static pre-modifier band.

### Secondary references

| Reference | Что берём | Что не берём |
| --- | --- | --- |
| [Color Block Jam](https://apps.apple.com/in/app/color-block-jam/id6504332779) | family comparison, explicit free-slide wording, modifier taxonomy | movement/timer/defaults без отдельного approve |
| [Wood Out: Color Jam](https://apps.apple.com/gb/app/wood-out-color-jam/id6742745080) | obstacle taxonomy, tactile clarity comparison | wood/stud trade dress, special rules |
| [Unblock Me](https://apps.apple.com/us/app/unblock-me-premium/id315021242) | state-search/difficulty negative control | target-exit loop, axis-only rules |
| Existing Sort class | typed pack/identity/SkinSpec patterns | Sort gameplay/schema |
| Existing Pins class | runtime/evidence/release patterns | physics/cascade/gameplay |

### Operator ruling

- Continuous two-axis drag through collision-free space; direction may change
  without release (`O`).
- Walls/figures constrain carried pose continuously; figures never overlap and
  invalid pose is not enterable (`O`).
- Release commits to a legal lattice cell (`O`); exact tie-break between equally
  eligible snap cells remains presentation detail.
- Quick flick velocity/inertia is unanswered (`B`).
- Own v1 has no timer and no fail state (`O`).
- Every reachable stable state of an accepted level remains solvable (`O`);
  offline validation must prove this invariant.
- Fidelity goal: максимально близко к reference по carry, collision, snap, gate
  consume, feedback, win cadence и board clarity within IP boundary (`O`).
- Haptic is deferred to a separate non-trivial decision (`O` scope ruling).

### Числовой feel-разбор

Полная таблица:
[`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#числовой-feel-разбор).

| Параметр | Значение | Статус |
| --- | ---: | :---: |
| Block Out public early gross duration | `~27–29 s/level` | `R-web`, montage-inclusive |
| Reference timer budgets L11/L12/L13 | `02:00/02:00/02:15` | `R-native`; own timer disabled (`O`) |
| Levels 11/12/13 active timer consumed | `≈55/57/51 s` | `R-native`, visible-timer delta |
| Manual target duration | `20–45 s`, review at `60 s` | `P` |
| Scene visible -> input-ready settle | `≤450 ms` | `P` |
| Scene visible -> first completed gate exit | `≤1,500 ms` | `P` |
| Autoplay demonstration | `2` moves или `≤25%` witness | `P` |
| Carry/collision/grid-snap core | continuous 2D + collision clamp + release snap | `O` |
| Pickup/snap/gate/win timing | blocking | `B`, 60 fps evidence required |
| Timer/fail/haptic | absent/deferred | `O` scope ruling |

### Reference parity checklist

Review 2 seed checklist находится в
[`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#preliminary-parity-checklist).
Review 3 нельзя закрывать до числового `R-web/R-native/O/P/B` checklist.

### Rights boundary

- Не копируем exact layouts, name/logo, characters, studded toy-brick trade
  dress, palette, shaders, fonts, gate art, audio/haptics, boosters и meta.
- Own replacements: theme-neutral geometry + `BlockOutSkinSpecV1`; gameplay
  roles имеют independent marker/pattern помимо цвета.
- Открытый IP/taste-вопрос: насколько tactile/studded должен выглядеть own
  block. Default (`P`) — не использовать studs и узнаваемые toy-brick
  proportions.

## Core fantasy

> Освобождать тесное поле как пространственный замок: уверенно взять крупную
> форму, провести её через найденный коридор и отправить в свою дверь.

## Core loop

> Каждые `1–3 s` (`P`) игрок выбирает block, drag'ом reposition'ит или выводит
> его через matching gate; новый свободный объём меняет доступные маршруты и
> порядок следующих выходов.

## Первый экран и autoplay

- Scene-visible frame (`P`): board полностью виден, blocks/gates читаются;
  timer отсутствует (`O`), title-card отсутствует.
- Settle (`P`): scene visible -> input-ready `≤450 ms`; этот budget не
  скрывается внутри time-to-rule.
- Правило без текста (`P`): AutoCursor берёт очевидный block и физически несёт
  его через matching gate.
- Autoplay (`P`): deterministic solver witness, `2` legal moves или `≤25%`
  solution.
- Time-to-rule (`P`): первый completed gate exit за `≤1.50 s` от
  scene-visible frame.
- Оптимальность (`P`): legal/reproducible, но первый ход выбирается по
  explainability среди solver-safe candidates.
- Takeover (`P`): первый pointerdown по live block атомарно отменяет будущие
  autoplay actions.
- State (`P`): exact logical state сохраняется; accepted in-flight action
  завершается только по approved commit boundary.
- Feed swipe: background vertical gesture остаётся у host; block hit начинает
  claim/takeover по platform gesture authority.

## Gameplay rulings and remaining question

Утверждено оператором (`O`):

1. gesture может непрерывно перемещать фигуру по двум осям и менять направление
   без release;
2. полный footprint движется только внутри collision-free corridor;
3. walls и другие figures clamp'ят transient pose; overlap/invalid pose
   недостижимы;
4. stable logical move commit'ится на release в legal lattice cell либо при
   completed matching-gate exit;
5. accepted levels strong-solvable: reachable stuck state отсутствует;
6. timer/fail отсутствуют.

Остаётся `B`: быстрый flick имеет inertia/velocity effect либо заканчивается
обычным grid snap. Exact snap tie-break при равноудалённых legal anchors может
быть определён `BO-P`, не меняя reachability.

## Input contract

Gameplay rows имеют `O`; feedback timing/easing остаётся `R-native/P/B`.

| Input | Условие | State transition | Feedback |
| --- | --- | --- | --- |
| pointerdown block | manual/takeover, block live, input open | create gesture session, no stable-state mutation | pickup/carry response |
| pointermove | active gesture | continuous two-axis pose follows pointer inside configuration-space component; no stable mutation | collision clamp; no overlap |
| release | clamped pose has eligible legal lattice anchor | commit `move(blockId,to)` | grid snap/settle; exact tie-break presentation-owned |
| release through matching gate | footprint fits approved exit | commit `exit(blockId,gateId)` | consume/clear |
| pointer crosses invalid pose | wall/block/out-of-bounds/wrong gate | carried pose clamps before invalid boundary; no solver action | collision cue |
| pointerdown background | no active game gesture | no game state change | host swipe remains available |
| first block pointerdown | autoplay | cancel future auto actions; process exact gesture | no restart |
| host pause | any interactive state | freeze logical/presentation clocks | none |
| restart | manual | exact initial state | approved load feedback |

Gesture translator never writes arbitrary pointer coordinates into solver state.
It emits one stable typed action or no action.

## Proposed state machine

Status `P`; не implementation authority.

```text
boot
  -> static_ready
  -> preparing
  -> interactive_ready
  -> ready
       -> autoplay
            -> dragging_auto -> settling | exiting -> autoplay
            -> manual
       -> manual
            -> dragging_manual -> settling | exiting -> manual
       --live empty and visuals drained--> win_feedback
  -> completed(success=true)

host_pause(any interactive state) -> paused(snapshot) -> previous state
restart(manual) -> ready(initial digest)
```

Invariants (`P`):

- stable logical state всегда lattice-valid;
- presentation drag не является solver move до commit;
- solver и engine используют одну rules version;
- accepted pack strong-solvable from every reachable stable state;
- timer/fail state отсутствует;
- completion exact-once;
- restart восстанавливает exact initial digest;
- no internal next-level transition.

## Win / no-fail / restart

- Win (`R-native/P`): все required blocks вышли через matching gates; success
  flow виден в L11–13, exact 60 fps timing остаётся `B`.
- Fail (`O`): отсутствует; reference timer не переносится в own v1.
- Invalid pose (`O`): недостижим из-за continuous collision clamp; hidden state
  mutation отсутствует.
- Restart (`P` convenience): exact initial anchors, live set и presentation
  reset.
- Stuck (`O`): отсутствует по strong-solvability validation invariant.
- Undo (`P`): не входит baseline; solver trace оставляет future hook.
- Hint (`P`): не входит baseline; не нужен для first prototype.
- Move limit (`P`): отсутствует, если reference packet не опровергнет.
- Lives/boosters (`P`): meta, не baseline gameplay.

## Duration budget

- Manual target: `20–45 s` (`P`).
- Hard review boundary: `60 s` (`P`) как content-review сигнал, не forced fail.
- Successful actions: blocking до solver annotation selected band.
- Scene visible -> input-ready settle: `≤450 ms` (`P`).
- Scene visible -> first completed exit: `≤1.50 s` (`P`).
- Idle (`P`): manual state не делает скрытых moves; host может сменить карточку.

## Bounded prototype

### Входит (`P`, только после approve)

- пять собственных levels в approved early static band;
- one versioned movement rule;
- rigid non-rotating orthogonal polyomino blocks;
- static walls/board и matching boundary gates;
- no timer/fail state (`O`);
- deterministic autoplay/takeover/pause/restart/completion;
- typed pack, validator, solver и bounded generator;
- theme-neutral skin + color-independent role markers.

### Не входит

- reference layouts и assets;
- generators/elevators/shutters/ivy/locks/ice/layer blockers;
- boosters, currency, ads, lives economy и journey;
- rotation, real-time physics, WebGL и external media;
- server generation/publication;
- multiple skins before baseline evidence.

### Disposable spike

После Review 3 может быть разрешён отдельный gesture/configuration-space harness
для проверки approved drag/collision/snap. До Review 3 spike не создаётся.

### Baseline class

Должны пережить prototype:

- versioned rules + level schema;
- canonical identity and provenance;
- pure stable `legalActions/applyAction/isTerminal`;
- gesture-to-action translator;
- deterministic solver trace/replay;
- presentation projection без theme-dependent gameplay;
- runtime bridge;
- validation receipt/difficulty features.

## Draft level/content schema boundary

Это documentation draft (`P`), не разрешение написать код.

```ts
type BlockRole = string;
type Cell = readonly [x: number, y: number];

interface BlockShapeV1 {
  id: string;
  role: BlockRole;
  cells: readonly Cell[]; // local immutable footprint
  anchor: Cell;
}

interface GateSpecV1 {
  id: string;
  role: BlockRole;
  side: "top" | "right" | "bottom" | "left";
  offset: number;
  span: number;
}

interface BlockOutRulesV1 {
  movement: "continuous-2d-configuration-space";
  commit: "release-grid-snap";
  quickFlick: "blocking-operator-ruling";
  rotation: false;
  timerMs: null;
  requireStrongSolvability: true;
  modifiers: readonly [];
}

interface BlockOutLevelSpecV1 {
  schema: "p4g.block-out.level";
  version: 1;
  id: string;
  specHash: string;
  runtimeContractDigest: string;
  seed: string;
  bounds: { cols: number; rows: number };
  blocks: readonly BlockShapeV1[];
  gates: readonly GateSpecV1[];
  rules: BlockOutRulesV1;
  provenance: {
    recipe: string;
    generatorVersion: string;
    targetBand: string;
  };
}
```

Quick-flick policy намеренно остаётся blocking и не получает invented default.

### Proposed schema invariants

- stable ids unique;
- each footprint connected, cells unique, non-empty;
- initial translated footprints are in bounds and non-overlapping;
- role has at least one compatible gate;
- gates have valid boundary span and independent accessibility cue;
- rotation disabled;
- modifiers empty for v1;
- exact rules digest matches engine/solver;
- solver confirms all reachable stable states can reach all-clear;
- stable identity hashes gameplay only; receipt и skin hash отделены.

## Solver / validator

- Validator (`P`): exact schema keys, hashes/digests, footprint connectivity,
  bounds, overlap, gates, roles и baseline modifier exclusion.
- Solver (`P`): configuration-space reachability plus all-clear path from every
  reachable stable state under approved movement rules.
- Не доказывает: fun, beauty, accessibility or publication worthiness.
- Legal action (`O`): move to any lattice anchor reachable through continuous
  collision-free two-axis path, or exit through a compatible gate.
- Stable terminal: `liveBlockCount === 0`.
- Spatial search identity: canonical `rulesVersion + live block ids + anchors`;
  runtime resource/presentation phase не входят в memoization key.
- Timer/fail не входят в own rules (`O`).
- Difficulty: block/shape/gate counts, occupied/free cells, move distance,
  non-exit moves, reversals, branching, forced prefix, dependency depth/width,
  dead ends, gate contention, readable scale.
- Trace: ordered stable action records + rules/solver version.
- Search (`P`): BFS/A* or memoized state graph with canonical anchor tuple;
  budgets устанавливаются после approved rules spike.
- Reject: invalid geometry, missing role gate, любой reachable unsolvable
  state, trivial, duplicate, target-band miss, unreadable scale, budget
  exceeded.
- Dead-end exposure: `0` обязательно для accepted v1 pack (`O`). Exhaustive
  proof, а не initial witness или heuristic, является authority.

## Generation strategy

- Construction (`P`): goal-pull reverse construction from gates.
- Step (`P`): insert block backward through matching gate, move it away via
  valid inverse transitions, then add dependencies/contested space.
- Proof: forward solver enumerates reachable stable states and proves each can
  reach all-clear; stored reverse witness alone недостаточен.
- Fallback: bounded forward search from authored goal shells if approved move
  is not cleanly reversible.
- Candidate budget: blocking until solver benchmark.
- Dedup: canonical gameplay graph/geometry under only approved symmetries.
- Difficulty targeting: hard schema/readability filters + soft reference-band
  score; density never sole metric.
- Series: five levels, one feature axis rises at a time, no new rule.
- Provenance: seed, recipes, rule/validator/solver versions, reject histogram,
  witness, features.
- Human review: operator selects final candidates; factory cannot declare taste.

## Provisional difficulty ladder

Numbers intentionally remain blocking until selected reference levels are
annotated.

| Level | Новое требование | Target features | Запрещённые скачки |
| ---: | --- | --- | --- |
| 1 | считать matching gate | obvious direct exit, large free area | special rule, timer cliff |
| 2 | один reposition перед exit | short dependency | shape + density jump together |
| 3 | выбрать порядок двух gates | two branches, one detour | new modifier |
| 4 | освободить contested corridor | deeper dependency, more complex shape | unreadable cell scale |
| 5 | upper approved band | longer witness, controlled dead-end exposure | generator/elevator/shutter |

Exact target ranges получают `R-native/O` после Review 2.

## Presentation

- Art (`P`): own theme-neutral shapes, no studs; role token separated from
  display palette.
- Layout (`P`): portrait-first board, gates on boundary, HUD secondary.
- Essential animation: `R-native` success clips подтверждают continuous carried
  pose; pickup/snap/invalid/exit timing остаются `B`.
- Sound: optional; sound-off experience complete.
- Haptic: deferred outside v1 (`O` scope ruling).
- Success: exact onset/cadence blocking on 60 fps measurement.
- Collision feedback: no color-only cue; exact motion blocking.
- Accessibility: marker/pattern/glyph per role in both block and gate.
- Low-tier: no heavy shadow/blur; same logical timing/trajectory.
- Cover/live: exact initial board/camera.

## Assets

| Asset | Source/provenance | Format | Budget | Skin-replaceable |
| --- | --- | --- | ---: | --- |
| Board/block/gate primitives | generated/owned | Canvas/vector | no external baseline media | yes |
| Role markers | generated/owned | vector | negligible | yes |
| Optional SFX | owned/generated, rights logged | compressed audio | blocking until BO-P | yes |
| Particles | code-generated | runtime | low-tier capped/off | yes |

## Runtime/platform integration

- Target (`P`): swipe build in real feed shell, Telegram-first WebView.
- Staged boot: shared `static_ready`, host `prepareInteractive`,
  `interactive_ready`.
- Host pause: gesture, exits and autoplay clocks frozen; gameplay timer absent.
- Modes: deterministic autoplay/manual.
- Completion: shared exact-once outcome with stable level identity.
- Level selection: host-supplied id from five-level typed pack.
- Cleanup: pointer listeners, rAF tasks, audio and AutoCursor.
- Performance: fixed logical Canvas 2D, occupancy masks, capped DPR/quality;
  solver/generator offline.
- Mount/prefetch budgets: inherit platform authority and measure in `BO-I/Q`;
  brief не inventает чужие numbers.
- External media: none.

## Reuse plan

### Reuse

- shared staged boot/lifecycle/completion/viewport/input/quality/perf;
- shared AutoCursor drag, carried payload and canonical hand renderer;
- shared series delivery and host gesture boundary;
- Sort strict LevelSpec/contract digest/catalog handshake pattern;
- Sort separate SkinSpec and role token -> color + marker projection;
- Pins/Sort visual-proof, runtime tests, pause/outcome and device evidence
  patterns.

### Do not reuse

- Sort conveyor, stack, scheduler, rules/schema;
- Pins physics/cascade or authored levels;
- Arrows gameplay, timing, camera, state machine, solver or generator choices;
- any reference asset/layout.

## Analytics questions

| Вопрос | Event/наблюдение | Интерпретация | Не доказывает |
| --- | --- | --- | --- |
| Считывается ли autoplay? | first manual committed action legal; takeover time | вероятно считано drag->gate | удовольствие |
| Takeover непрерывен? | pre/post state digest, in-flight action disposition | нет reset/hidden move | puzzle clarity |
| Понятен collision clamp? | repeated blocked direction, next recovery move | feedback изменил поведение | fairness |
| Strong-solvability держится? | validation receipt + runtime state digest sampling | pack не содержит reachable dead end | taste/fun |
| Ladder различим? | solve time, moves, detours, fail by level | нет accidental spike | long retention |
| Factory попадает в band? | feature receipt + blind human disposition | filters correlate with taste | universal fun metric |
| Серия заканчивается? | VISION-qualified series completion | class supports qualified play | D7/return alone |

Telemetry не получает product authority; qualified outcome остаётся в VISION.

## Work packages

| ID | Workstream | Scope | Inputs | Typed outputs | Не трогает | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| `BO-R` | Reference | exact game, recording, frame measurements, parity | operator packet + public sources | `BlockOutReferenceEvidenceV1` | implementation | operator |
| `BO-G` | Gameplay | approved rule/state/schema/defaults | BO-R minimum logic packet approved | `BlockOutRulesV1`, `BlockOutLevelSpecV1`, acceptance fixtures | code/art | operator + independent |
| `BO-E` | Engine | stable transitions, gesture commit, replay, pause | BO-G | `BlockOutActionV1`, `BlockOutStateV1`, headless tests | solver search/theme | independent |
| `BO-S` | Solver | validator/search/trace/features | BO-G schema/rules | `BlockOutSolverResultV1`, `BlockOutTraceV1` | rendering/taste | independent |
| `BO-F` | Factory | reverse/goal-pull candidates and series | BO-S API | typed pack + `BlockOutValidationReceiptV1` | taste declaration | operator |
| `BO-P` | Presentation | layout/carry/snap/exit/audio/skin; haptic deferred | BO-R full presentation packet + BO-G projection | `BlockOutPresentationProjectionV1`, SkinSpec, visual harness | engine legality | operator |
| `BO-I` | Integration | feed lifecycle, staged boot, takeover, completion | BO-E + runtime authority | `BlockOutRuntimeBridgeV1`, swipe evidence | solver internals | independent |
| `BO-A` | Analytics | question/event mapping | BO-G milestones | `BlockOutMeasurementBriefV1` | success authority | operator |
| `BO-Q` | QA | parity/runtime/device/perf/reference delta | integrated candidate | Review 4 evidence packet | product changes | independent |

## Typed integration boundaries

### `BlockOutLevelSpecV1`

Immutable initial gameplay identity: bounds, block footprints/anchors, gates,
rules digest, seed/provenance. No skin, receipts or runtime animation.

### `BlockOutActionV1`

Stable solver/engine command after gesture translation:

- `move { blockId, from, to }`;
- `exit { blockId, from, gateId }`;
- lifecycle commands `restart`, `setMode`, `hostPause/resume`.

Exact action set follows approved movement rule. Raw pointer positions never
enter solver trace.

### `BlockOutStateV1`

Rules version, phase/mode, stable anchors/live ids, sequence, initial/current
digest and completion guard. Presentation-only carry pose and particles are
excluded. Solver identity is canonical rules version + live ids + anchors.

### `BlockOutSolverResultV1`

`valid`, `solvable`, witness/minimality claim, explored states, feature vector,
budget/exhaustion and solver/rules versions.

### `BlockOutTraceV1`

Ordered stable actions with before/after state digests and rule/solver version.
It drives replay/autoplay but presentation chooses motion from projection.

### `BlockOutPresentationProjectionV1`

Read-only board geometry, stable + transient visual poses, gesture semantic,
gate states, feedback and quality tier. It cannot call solver or
change legality.

### `BlockOutRuntimeBridgeV1`

Platform-owned staged boot, mode/takeover, host pause, level identity,
completion and cleanup surface. Wire names remain runtime authority.

### `BlockOutValidationReceiptV1`

Level/spec/skin digests, generator/validator/solver/rules versions, seed,
features, witness digest, reject provenance and budgets. Receipt proves machine
checks, not taste/publication.

### `BlockOutMeasurementBriefV1`

Milestone/event mapping with interpretation limits; append-only evidence cannot
redefine VISION success.

## Risks

| Risk | Вероятность | Ущерб | Ранний тест | Stop/mitigation |
| --- | --- | --- | --- | --- |
| Название скрывает другой core loop | resolved by `O` exact game | high | link + recording | taxonomy guard remains |
| Input и solver реализуют разные drag semantics | medium до fixtures | high | shared fixture per edge case | BO-G single rules authority |
| Vertical drag конфликтует со swipe feed | high | high | real feed-shell takeover test | block-hit claim; background remains host |
| Timer punitive для ICP | resolved for v1 | high | schema asserts `timerMs: null` | timer absent (`O`) |
| Legal move leaves player in unsolvable state | medium до solver proof | high | exhaustive reachable-state receipt | reject candidate unless strong-solvable |
| Color-only gates | high | high | grayscale/color-vision check | marker/pattern mandatory |
| Generator valid, но levels tedious | high | high | blind human rank vs features | rejection filters + taste gate |
| Pointermove/redraw jank in WebView | medium | high | low-tier device trace | occupancy masks, coalescing, capped DPR |
| Dynamic modifiers leak into v1 | medium | high | exact schema rejects modifiers | versioned future rule packs |
| Reference trade dress copied | medium | high | rights review/holdout | own SkinSpec, own layouts/assets |

## Review 2 rulings and remaining defaults

1. Primary: Grand Games Block Out (`O`).
2. Target band: levels `6–10` (`O`).
3. Five own levels; reference layouts not copied (`P`).
4. Static blocks + walls + matching gates only; modifiers empty (`P`).
5. Non-rotating rigid polyomino blocks (`P`).
6. Win clear-all; no timer/fail/move limit/lives/boosters (`O` for no timer,
   otherwise `P` baseline).
7. Continuous two-axis collision-constrained movement; direction turns allowed;
   release grid-snap; invalid pose unreachable (`O`). Quick flick remains `B`.
8. Autoplay `2` moves/`≤25%`, exact-state takeover, scene settle `≤450 ms`,
   scene-visible time-to-rule `≤1.50 s` (`P`).
9. Color-independent role markers mandatory (`P`).
10. Own theme-neutral no-stud SkinSpec baseline (`P`).
11. Every reachable stable state remains solvable; accepted pack
    `deadEndExposure === 0` (`O`).
12. Haptic deferred outside v1 (`O` scope ruling).

## Открытые решения

| Вопрос | Почему блокирует | Кто решает | Trigger | Disposition |
| --- | --- | --- | --- | --- |
| Quick flick velocity/inertia | может менять commit/replay | operator | one verbal ruling or probe | blocking |
| Exact snap tie-break | влияет на presentation determinism, не reachability | BO-P + operator | gesture harness | Review 3 |
| Parallel exit animation/next drag | влияет на input gating | BO-G/P | prototype fixture | Review 3 |
| Pickup/snap/gate/win timings | задаёт measured parity | BO-R/P | 60 fps capture | before BO-P acceptance |
| Dynamic modifiers | schema explosion | operator | after static baseline | deferred |

## Acceptance gate status

### Review 1 — taxonomy

- [x] Exact color-gate clear-all family отделена от соседних loops.
- [x] `3–5` references сравнены.
- [x] Primary и target band предложены, затем утверждены как `O`.

### Review 2 — reference/priority

- [x] Exact linked game утверждён.
- [x] Target levels `6–10` утверждены.
- [x] Native success recordings L11–13 byte/frame verified.
- [x] Must-preserve direction утверждён в IP boundary.
- [x] Core movement, no-timer, no-stuck и haptic deferral получены.
- [ ] Quick-flick policy утверждена.
- [x] Feel table размечена `R-web/R-native/O/P/B`; remaining `B` explicit.

### Review 3 — class brief

- [ ] Gameplay ambiguities закрыты.
- [ ] Typed fixtures приложены.
- [ ] Independent reviewer дал disposition.
- [ ] Статус может измениться на `approved-for-prototype`.

### Future Review 4 — evidence

- [ ] Parity checklist и reference delta list.
- [ ] Solver/validator receipts + deterministic replay.
- [ ] Side-by-side на устройстве.
- [ ] Before/after AutoCursor GIF каждой feel-итерации.
- [ ] Runtime/aspect/perf evidence.

## Kill criteria

- Rule нельзя однозначно показать одним autoplay exit за proposed feed budget.
- Block drag нельзя отделить от vertical feed swipe без false moves/resets.
- Solver и input не сходятся на approved edge-case fixtures.
- Пять own candidates требуют ручного ремонта для solvability.
- Board target band нечитаем на compact aspect без нового camera/pan rule.
- Static baseline не держит target WebView frame/input responsiveness.
- Accessibility требует color-only distinction.
- Own visual identity остаётся различимо derivative от reference trade dress.

## Evidence index

| Evidence | Path/URL | Version/digest | Disposition |
| --- | --- | --- | --- |
| Reference packet | [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md) | snapshot 29.07.2026 | Review 1 complete |
| Independent Review 1 | [`REVIEW-1-INDEPENDENT-2026-07-29.md`](REVIEW-1-INDEPENDENT-2026-07-29.md) | 29.07.2026 | accept as research; F1–F5 disposition |
| Grand Games listing | [App Store](https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568) | live snapshot | primary `O` |
| Grand Games public gameplay | [YouTube 1–20](https://www.youtube.com/watch?v=VU9mQ_gleN8) | public montage | rule/progression evidence, not feel authority |
| Color Block Jam listing | [App Store](https://apps.apple.com/in/app/color-block-jam/id6504332779) | live snapshot | secondary |
| Native success clips L11–13 | operator delivery | full SHA-256 in reference packet | byte/frame verified `R-native` |
| Review 3 / solver / visual / runtime | future BO-Q index | — | not started |

## Final decision

- Decision: **Review 2 conditional; quick-flick policy remains `B`**.
- Primary/target (`O`): Grand Games Block Out, static levels `6–10`.
- Gameplay (`O`): continuous 2D collision-constrained grid-snap, no timer,
  strong-solvable accepted pack.
- Implementation: **not authorized**.
- Explicitly deferred: code, dynamic modifiers, meta, rollout, publication.
