# Class Brief: `block-out-v1`

- Дата: **29.07.2026**
- Статус: **review — Review 2 blocked on operator packet**
- Владелец taste-решения: **оператор**
- Автор brief: **Codex**
- Независимый reviewer: **не назначен; нужен для Review 3**
- Reference packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)

> Brief фиксирует исследовательскую декомпозицию и typed boundaries. Primary
> reference, target difficulty, defaults и gameplay contract пока имеют статус
> `P`, не `O`; документ не разрешает implementation или rollout.

## Evidence notation

- `R` — измерено/наблюдено по exact source;
- `O` — явно утверждено оператором;
- `P` — предложение до operator approve.

Ни одно feel-значение не считается `R` только потому, что оно выглядит
правдоподобно. На текущем этапе gameplay/feel значений `O` нет.

## VISION-триаж

- Принцип/ступень VISION: фабрика от сильного эталона; короткий first-party
  puzzle class с autoplay -> takeover.
- Продуктовая неопределённость: способен ли drag-routing class пройти
  `reference -> typed pack -> solver -> generator -> series -> feed` и дать
  новый interaction primitive после tap-centric классов.
- Почему допустимо сейчас: это самостоятельная research/brief initiative; она
  не меняет `playables`, не открывает rollout и не нарушает параллельную Arrows
  implementation.
- Требуемое решение оператора: exact game/link, progression slice, recording,
  must-preserve и `Defaults approve`/exceptions.
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
- Старт реализации до operator/default approval.

## Точный эталон

### Proposed primary reference

- Название (`P`): **Block Out! - Color Sort Puzzle**.
- Developer (`R`): **Grand Games A.Ş.**
- Listing snapshot (`R`): App Store page observed 29.07.2026; live listing
  version/build может измениться.
- Ссылка: [App Store](https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568).
- Public recording:
  [levels 1–20](https://www.youtube.com/watch?v=VU9mQ_gleN8).
- Native screen recording: **blocking — ждём оператора**.
- Диапазон (`P`): **levels 6–10 exact operator build** либо эквивалентный
  static pre-modifier band.

### Secondary references

| Reference | Что берём | Что не берём |
| --- | --- | --- |
| [Color Block Jam](https://apps.apple.com/in/app/color-block-jam/id6504332779) | family comparison, explicit free-slide wording, modifier taxonomy | movement/timer/defaults без отдельного approve |
| [Wood Out: Color Jam](https://apps.apple.com/gb/app/wood-out-color-jam/id6742745080) | obstacle taxonomy, tactile clarity comparison | wood/stud trade dress, special rules |
| [Unblock Me](https://apps.apple.com/us/app/unblock-me-premium/id315021242) | state-search/difficulty negative control | target-exit loop, axis-only rules |
| Existing Sort class | typed pack/identity/SkinSpec patterns | Sort gameplay/schema |
| Existing Pins class | runtime/evidence/release patterns | physics/cascade/gameplay |

### Числовой feel-разбор

Полная таблица:
[`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#числовой-feel-разбор).

| Параметр | Значение | Статус |
| --- | ---: | :---: |
| Block Out public early gross duration | `~27–29 s/level` | `R`, montage-inclusive |
| Manual target duration | `20–45 s`, review at `60 s` | `P` |
| First live frame -> first completed gate exit | `≤1,500 ms` | `P` |
| Autoplay demonstration | `2` moves или `≤25%` witness | `P` |
| Drag response/snap/gate/win/fail/haptic | blocking | native evidence required |

### Reference parity checklist

Review 2 seed checklist находится в
[`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#preliminary-parity-checklist).
Review 3 нельзя закрывать до числового `R/O/P` checklist.

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

- Первый frame (`P`): board полностью виден, blocks/gates читаются, timer
  присутствует если approve; title-card отсутствует.
- Правило без текста (`P`): AutoCursor берёт очевидный block и физически несёт
  его через matching gate.
- Autoplay (`P`): deterministic solver witness, `2` legal moves или `≤25%`
  solution.
- Time-to-rule (`P`): первый completed gate exit за `≤1.50 s`.
- Оптимальность (`P`): legal/reproducible, но первый ход выбирается по
  explainability среди solver-safe candidates.
- Takeover (`P`): первый pointerdown по live block атомарно отменяет будущие
  autoplay actions.
- State (`P`): exact logical state сохраняется; accepted in-flight action
  завершается только по approved commit boundary.
- Feed swipe: background vertical gesture остаётся у host; block hit начинает
  claim/takeover по platform gesture authority.

## Blocking gameplay questions

До approval ни один downstream stream не выбирает ответы самостоятельно:

1. `free-stop`: release в любой reachable lattice anchor;
2. `slide-stop`: выбранное направление движет до collision/gate;
3. `unit-step`: один gesture = одна дискретная translation;
4. разрешён ли drag path с поворотом без release;
5. когда logical state commit'ится — по crossing cell, release или gate consume;
6. invalid drag возвращает block, clamps к последней legal anchor или не
   начинает carry;
7. timer идёт во время autoplay и pause;
8. разрешены ли параллельные exit animations и следующий drag.

## Proposed input contract

Таблица имеет статус `P`; exact gestures заменяются после native recording.

| Input | Условие | State transition | Feedback |
| --- | --- | --- | --- |
| pointerdown block | manual/takeover, block live, input open | create gesture session, no stable-state mutation | pickup/carry response |
| pointermove | active gesture | presentation pose follows pointer; engine exposes legal frontier | collision/clamp cue |
| release at legal anchor | reachable stable placement | commit `move(blockId,to)` | snap/settle |
| release through matching gate | footprint fits approved exit | commit `exit(blockId,gateId)` | consume/clear |
| release invalid | blocked/out-of-bounds/wrong gate | exact policy blocking | invalid feedback |
| pointerdown background | no active game gesture | no game state change | host swipe remains available |
| first block pointerdown | autoplay | cancel future auto actions; process exact gesture | no restart |
| host pause | any interactive state | freeze logical/presentation/timer clocks | none |
| restart | fail/manual | exact initial state | approved load feedback |

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
            -> fail_feedback
       --live empty and visuals drained--> win_feedback
  -> completed(success=true | success=false)

host_pause(any interactive state) -> paused(snapshot) -> previous state
restart(fail | manual) -> ready(initial digest)
```

Invariants (`P`):

- stable logical state всегда lattice-valid;
- presentation drag не является solver move до commit;
- solver и engine используют одну rules version;
- timer использует logical active clock и заморожен host pause;
- completion exact-once;
- restart восстанавливает exact initial digest;
- no internal next-level transition.

## Win / fail / restart

- Win (`R/P`): все required blocks вышли через matching gates; exact win timing
  ждёт recording.
- Fail (`R/P`): reference timer expiry; exact budget/continue UX ждёт recording.
- Неверный drag (`P`): non-terminal, no hidden state mutation.
- Restart (`P`): exact initial anchors, live set, timer и presentation reset.
- Undo (`P`): не входит baseline; solver trace оставляет future hook.
- Hint (`P`): не входит baseline; не нужен для first prototype.
- Move limit (`P`): отсутствует, если reference packet не опровергнет.
- Lives/boosters (`P`): meta, не baseline gameplay.

## Duration budget

- Manual target: `20–45 s` (`P`).
- Hard review boundary: `60 s` (`P`), не forced fail сверх approved timer.
- Successful actions: blocking до solver annotation selected band.
- Time-to-rule: `≤1.50 s` (`P`).
- Idle (`P`): manual state не делает скрытых moves; host может сменить карточку.

## Bounded prototype

### Входит (`P`, только после approve)

- пять собственных levels в approved early static band;
- one versioned movement rule;
- rigid non-rotating orthogonal polyomino blocks;
- static walls/board и matching boundary gates;
- approved timer fail;
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
  movement: "blocking-review-2";
  rotation: false;
  timerMs: "blocking-review-2";
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

Schema fields blocked by Review 2 intentionally contain no invented numeric
default.

### Proposed schema invariants

- stable ids unique;
- each footprint connected, cells unique, non-empty;
- initial translated footprints are in bounds and non-overlapping;
- role has at least one compatible gate;
- gates have valid boundary span and independent accessibility cue;
- rotation disabled;
- modifiers empty for v1;
- exact rules digest matches engine/solver;
- solver confirms solvability;
- stable identity hashes gameplay only; receipt и skin hash отделены.

## Solver / validator

- Validator (`P`): exact schema keys, hashes/digests, footprint connectivity,
  bounds, overlap, gates, roles и baseline modifier exclusion.
- Solver (`P`): at least one all-clear witness under approved movement rules.
- Не доказывает: fun, beauty, human timer feasibility, accessibility or
  publication worthiness.
- Legal action: **blocking on Review 2 movement semantics**.
- Stable terminal: `liveBlockCount === 0`.
- Fail timer не используется для spatial solvability; отдельный feasibility
  receipt возможен только после calibrated action-time model.
- Difficulty: block/shape/gate counts, occupied/free cells, move distance,
  non-exit moves, reversals, branching, forced prefix, dependency depth/width,
  dead ends, gate contention, readable scale.
- Trace: ordered stable action records + rules/solver version.
- Search (`P`): BFS/A* or memoized state graph with canonical anchor tuple;
  budgets устанавливаются после approved rules spike.
- Reject: invalid geometry, missing role gate, unsolvable, trivial, duplicate,
  target-band miss, unreadable scale, budget exceeded.

## Generation strategy

- Construction (`P`): goal-pull reverse construction from gates.
- Step (`P`): insert block backward through matching gate, move it away via
  valid inverse transitions, then add dependencies/contested space.
- Proof: forward solver must replay all candidates; stored reverse witness alone
  недостаточен.
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

Exact target ranges получают `R/O` после Review 2.

## Presentation

- Art (`P`): own theme-neutral shapes, no studs; role token separated from
  display palette.
- Layout (`P`): portrait-first board, gates on boundary, HUD secondary.
- Essential animation: blocking `R` measurements for pickup/carry/snap/exit.
- Sound: optional; sound-off experience complete.
- Haptic: semantics/intensity require operator `O` and device review.
- Success/fail: exact onset/cadence blocking on recording.
- Invalid feedback: no color-only cue; exact motion blocking.
- Accessibility: marker/pattern/glyph per role in both block and gate.
- Low-tier: no heavy shadow/blur; same logical timing/trajectory.
- Cover/live: exact initial board/camera.

## Assets

| Asset | Source/provenance | Format | Budget | Skin-replaceable |
| --- | --- | --- | ---: | --- |
| Board/block/gate primitives | generated/owned | Canvas/vector | no external baseline media | yes |
| Role markers | generated/owned | vector | negligible | yes |
| Optional SFX | owned/generated, rights logged | compressed audio | blocking until BO-P | yes |
| Haptic profile | platform semantic bridge | events | n/a | partly |
| Particles | code-generated | runtime | low-tier capped/off | yes |

## Runtime/platform integration

- Target (`P`): swipe build in real feed shell, Telegram-first WebView.
- Staged boot: shared `static_ready`, host `prepareInteractive`,
  `interactive_ready`.
- Host pause: logical clock, timer, gesture, exits and autoplay frozen.
- Modes: deterministic autoplay/manual.
- Completion: shared exact-once outcome with stable level identity.
- Level selection: host-supplied id from five-level typed pack.
- Cleanup: pointer listeners, rAF/timers, audio/haptic and AutoCursor.
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
| Понятен invalid drag? | repeat invalid target, next recovery move | feedback изменил поведение | fairness |
| Timer не разрушает ICP? | timeout rate, idle/think time, retries | pressure может быть cliff | причинность без cohort test |
| Ladder различим? | solve time, moves, detours, fail by level | нет accidental spike | long retention |
| Factory попадает в band? | feature receipt + blind human disposition | filters correlate with taste | universal fun metric |
| Серия заканчивается? | VISION-qualified series completion | class supports qualified play | D7/return alone |

Telemetry не получает product authority; qualified outcome остаётся в VISION.

## Work packages

| ID | Workstream | Scope | Inputs | Typed outputs | Не трогает | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| `BO-R` | Reference | exact game, recording, frame measurements, parity | operator packet + public sources | `BlockOutReferenceEvidenceV1` | implementation | operator |
| `BO-G` | Gameplay | approved rule/state/schema/defaults | BO-R approved | `BlockOutRulesV1`, `BlockOutLevelSpecV1`, acceptance fixtures | code/art | operator + independent |
| `BO-E` | Engine | stable transitions, gesture commit, replay, pause | BO-G | `BlockOutActionV1`, `BlockOutStateV1`, headless tests | solver search/theme | independent |
| `BO-S` | Solver | validator/search/trace/features | BO-G schema/rules | `BlockOutSolverResultV1`, `BlockOutTraceV1` | rendering/taste | independent |
| `BO-F` | Factory | reverse/goal-pull candidates and series | BO-S API | typed pack + `BlockOutValidationReceiptV1` | taste declaration | operator |
| `BO-P` | Presentation | layout/carry/snap/exit/audio/haptic/skin | BO-R feel + BO-G projection | `BlockOutPresentationProjectionV1`, SkinSpec, visual harness | engine legality | operator |
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

Rules version, phase/mode, stable anchors/live ids, logical timer, sequence,
initial/current digest and completion guard. Presentation-only carry pose and
particles are excluded.

### `BlockOutSolverResultV1`

`valid`, `solvable`, witness/minimality claim, explored states, feature vector,
budget/exhaustion and solver/rules versions.

### `BlockOutTraceV1`

Ordered stable actions with before/after state digests and rule/solver version.
It drives replay/autoplay but presentation chooses motion from projection.

### `BlockOutPresentationProjectionV1`

Read-only board geometry, stable + transient visual poses, gesture semantic,
gate states, timer semantic, feedback and quality tier. It cannot call solver or
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
| Название скрывает другой core loop | high до exact link | high | operator exact link + recording | stop Review 2 |
| Input и solver реализуют разные drag semantics | high до recording | high | shared fixture per edge case | BO-G single rules authority |
| Vertical drag конфликтует со swipe feed | high | high | real feed-shell takeover test | block-hit claim; background remains host |
| Timer punitive для ICP | medium/high | high | friend cohort + reference comparison | operator exception/no-timer variant as separate decision |
| Color-only gates | high | high | grayscale/color-vision check | marker/pattern mandatory |
| Generator valid, но levels tedious | high | high | blind human rank vs features | rejection filters + taste gate |
| Pointermove/redraw jank in WebView | medium | high | low-tier device trace | occupancy masks, coalescing, capped DPR |
| Dynamic modifiers leak into v1 | medium | high | exact schema rejects modifiers | versioned future rule packs |
| Reference trade dress copied | medium | high | rights review/holdout | own SkinSpec, own layouts/assets |

## Review 2 defaults proposed for operator

Оператор может ответить `Defaults approve` либо перечислить исключения.

1. Primary: Grand Games Block Out (`P`).
2. Target band: exact build levels `6–10` or equivalent static band (`P`).
3. Five own levels; reference layouts not copied (`P`).
4. Static blocks + walls + matching gates only; modifiers empty (`P`).
5. Non-rotating rigid polyomino blocks (`P`).
6. Win clear-all; fail reference timer; no move limit/lives/boosters (`P`).
7. Movement/commit/invalid policy: **not defaulted**; copied from native evidence
   and explicitly approved.
8. Autoplay `2` moves/`≤25%`, exact-state takeover, time-to-rule `≤1.50 s`
   (`P`).
9. Color-independent role markers mandatory (`P`).
10. Own theme-neutral no-stud SkinSpec baseline (`P`).

## Открытые решения

| Вопрос | Почему блокирует | Кто решает | Trigger | Disposition |
| --- | --- | --- | --- | --- |
| Exact game/build | разные titles имеют разные rules | operator | exact link | blocking |
| Target progression | difficulty/modifiers drift | operator | levels/slice | blocking |
| Movement/free-stop/slide-stop | меняет engine/solver/generator | operator from recording | native edge cases | blocking |
| Commit + invalid release | меняет replay/takeover/feel | operator | native recording | blocking |
| Timer budget and pause | меняет fail/ICP | operator | success+fail recording | blocking |
| Must-preserve feel | задаёт BO-P acceptance | operator | list 3–7 | blocking |
| Haptic | screen recording не измеряет | operator/device | Review 2/4 | blocking for BO-P |
| Dynamic modifiers | schema explosion | operator | after static baseline | deferred |

## Acceptance gate status

### Review 1 — taxonomy

- [x] Exact color-gate clear-all family отделена от соседних loops.
- [x] `3–5` references сравнены.
- [x] Primary и target band предложены как `P`.

### Review 2 — reference/priority

- [ ] Exact link/build получен.
- [ ] Target levels/slice утверждён.
- [ ] Native success/fail/error recording получен.
- [ ] Must-preserve list утверждён.
- [ ] `Defaults approve` или exceptions получены.
- [ ] Feel table измерена и размечена `R/O/P`.

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
| Grand Games listing | [App Store](https://apps.apple.com/us/app/block-out-color-sort-puzzle/id6752672568) | live snapshot | primary proposal only |
| Grand Games public gameplay | [YouTube 1–20](https://www.youtube.com/watch?v=VU9mQ_gleN8) | public montage | rule/progression evidence, not feel authority |
| Color Block Jam listing | [App Store](https://apps.apple.com/in/app/color-block-jam/id6504332779) | live snapshot | secondary |
| Native operator packet | operator delivery | — | blocking |
| Review 3 / solver / visual / runtime | future BO-Q index | — | not started |

## Final decision

- Decision: **research only / blocked on operator choice**.
- Recommendation (`P`): Grand Games Block Out, static levels `6–10`.
- Implementation: **not authorized**.
- Explicitly deferred: code, dynamic modifiers, meta, rollout, publication.
