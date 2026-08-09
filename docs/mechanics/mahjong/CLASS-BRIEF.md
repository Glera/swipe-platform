<!-- mechanics-process-version: 2 -->
# Class Brief: `mahjong-buffer-pairs`

- Дата: `2026-08-01`
- Статус: `reopened-after-reference-transition-delta`; прежний Review 3
  superseded для tray transition semantics
- Владелец taste-решения: human operator
- Автор brief: Codex `/root`
- Независимый reviewer: Codex agent `/root/mahjong_review3`
- Reference packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)

> Brief описывает bounded prototype `mahjong-v1`. Он не даёт authority на
> rollout, публикацию, store submission или копирование trade dress референса.

## VISION-триаж

- Принцип/ступень VISION: deterministic production of a swipe-native playable
  class; autoplay-to-takeover; female puzzle 30+.
- Какую продуктовую неопределённость сокращаем: читается ли гибрид
  exposed-pair + four-slot buffer в ленте без длинного tutorial и сохраняет ли
  он напряжение Mahjong Solitaire в 20–60-секундной сессии.
- Почему работа допустима сейчас: пользователь явно поставил новую цель;
  moratorium на самовольное расширение направления не применяется.
- Требуемое решение оператора: taste-disposition после Review 4
  (`accept`, `revise`, `reject`) и отдельное authority на rollout.
- Что документ не разрешает: публикацию, production roster mutation,
  monetization, бренд/контент Vita Mahjong.

## Цель

На целевом Android-устройстве оператор не различает 30-секундный side-by-side
клип Vita Mahjong и `mahjong-v1` по причинному ощущению выбора открытой плитки,
перелёта в четырёхслотовый буфер, очистки пары, освобождения stack и риска
переполнения — при заведомо собственной визуальной идентичности prototype.

## Non-goals

- Traditional Mahjong, triple-tile matching, scoring hands или multiplayer.
- Полная 70-плиточная сессия, metagame, IQ/combo, currency, revive, ads, daily.
- Pixel-copy комнаты, Mahjong faces, logo, text, audio или palette референса.
- Rollout в production feed/store: prototype заканчивается Review 4 disposition.

## Точный эталон

### Primary reference

- Название: Vita Mahjong.
- Версия/дата: Android `3.32.0` (`1817`), исследована `2026-08-01`.
- Ссылка: <https://play.google.com/store/apps/details?id=com.vitastudio.mahjong>
- Screen recording: [`evidence/reference/`](evidence/reference/), manifest будет
  заморожен перед Review 4.
- Диапазон: tutorial, полный Level 1, старт/fail Level 2.

### Secondary references

Нет. Платформенные ограничения — не secondary feel reference, а обязательный
runtime contract.

### Числовой feel-разбор

Engine и Presentation используют числовые R/P targets из раздела
`Числовой feel-разбор` в `REFERENCE-PACKET.md`. Blocking values определены:
4 slots; `430±40 ms` flight; `≤50 ms` response; `≤100 ms` fail onset;
`520–720 ms` burst; mate insertion beside the existing kind; animated survivor
compaction; `≤650 ms` autoplay first motion; `≤2.2 s` first pair.

### Reference parity checklist

Приёмочным чек-листом Review 4 является полный список из
`REFERENCE-PACKET.md`; сокращать его downstream-workstream нельзя.

### Transition parity matrix

Матрица фиксирует промежуточные наблюдаемые состояния, а не только итог reducer.
Каждая строка обязана иметь reference evidence и executable presentation trace.

| Pre-state | Input | During reaction | At settle/effect | Final | Naive failure caught | Reference evidence | Executable fixture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `[]` | `A` | flight→slot 0 | `[A]` | `[A]` | grouping or clearing without a mate | pair clip | engine/presentation append fixture |
| `[A]` | `A` | flight→slot 1 | `[A,A]` hold, then adjacent burst | `[]` | pair vanishes without visible adjacency or burst targets wrong slots | pair clip | last-pair presentation fixture |
| `[A,B]` | `A` | incoming→1; `B:1→2` | `[A,A,B]` hold; burst `0,1`; `B:2→0` | `[B]` | append-right, non-adjacent clear or survivor teleport | `vita-tray-aba*` | A/B/A engine+presentation+browser trace |
| `[A,B,C]` | `B` | incoming→2; `C:2→3` | `[A,B,B,C]`; `C:3→1` | `[A,C]` | hard-coded front-mate or wrong survivor origin | generalized middle-mate trace | generalized middle-mate fixture |
| `[A,B,C]` | `D` | flight→3 | `[A,B,C,D]`, no clear | failed | premature fail, accidental grouping or clear | fail clip | four-unlike browser fixture |

Final-state-only assertions do not satisfy this matrix. The event trace must
identify incoming target, every displaced survivor, adjacent clear slots and
post-clear compaction.

### Rights boundary

- Не копируем: весь trade dress и meta-layer Vita, перечисленные в MJ-R.
- Replacements: `Soft Geometry` SkinSpec — тёплая тканевая поверхность,
  молочные объёмные плитки, ink/peach/blue геометрические glyphs, собственные
  particles и synthesised chimes.
- Review 4 taste-параметр: финальная насыщенность/контраст skin; это не меняет
  правило, timing, layout или rights boundary и не блокирует implementation.

## Core fantasy

> Я спокойно читаю многослойную конструкцию, нахожу безопасную открытую пару и
> аккуратно разбираю её, не забивая маленький буфер лишними плитками.

## Core loop

> Каждые 3–5 секунд игрок распознаёт доступную пару, отправляет две плитки в
> буфер, получает ясную очистку и открывает следующий кусок stack.

## Первый экран и autoplay

- Первый frame: крупная layered board, четыре пустых tray slots сверху, undo и
  hint как вторичные controls; никаких interstitial/menu.
- Правило без текста: общий cursor сначала показывает две открытые одинаковые
  плитки, обе летят в tray и исчезают; затем снимается pair-blocker и визуально
  открывает нижнюю плитку.
- Autoplay: solver-proven witness, 2 пары, только реальные engine actions.
- Длина фрагмента: `4–6 s`; первое движение `≤650 ms`, первая пара `≤2.2 s`.
- Оптимальность: autoplay минимизирует peak unmatched tray occupancy, затем
  число ходов до следующей очистки; tie-break — stable tile id.
- Takeover: первый manual `pointerdown` атомарно отменяет queued cursor/action.
- Состояние: сохраняется точно; restart/новый раунд при takeover запрещён.

## Input contract

| Input | Условие | State transition | Feedback |
| --- | --- | --- | --- |
| `tapTile(id)` | `phase=ready`, tile live+open | remove from live; `ready→moving`; set tile+token | immediate lift/outline, flight |
| `settleMotion` | token matches current moving tile | normative settle algorithm below | snap, burst, fail/win |
| `tapTile(id)` | tile live but locked | logical no-op | dim + 2 px shake + lock badge |
| `tapUndo` | tray non-empty, `phase=ready` | pop last tray tile and restore it live | `360±40 ms` reverse flight |
| `tapHint` | ready, continuation exists | logical no-op; return typed `HintPlan` | pulse on one/two legal targets |
| `tapRestart` | `phase=failed` only | restore canonical initial puzzle snapshot | `180±30 ms` crossfade, clean tray |
| first manual `pointerdown` | autoplay active | cancel autoplay, keep state | shared cursor fades out |

Вертикальный swipe принадлежит host. Численный drag threshold берётся только
из shared runtime authority; class не дублирует его. Real-feed fixture обязан
доказать, что host-classified vertical drag не превращается в tile tap.

## State machine

```text
runtime: boot -> static_ready -> preparing -> interactive_ready -> disposed
mode:    autoplay -> manual (one-way on first manual pointerdown)
engine:  ready -> moving -> ready | won | failed
engine:  failed -> ready (restart only)
host:    active <-> paused from every non-disposed runtime/engine state
host:    won -> completed (exactly-once bridge event; engine remains won)
```

- Engine phase, runtime mode and host pause are orthogonal typed fields.
- В `moving` новый gameplay tap игнорируется; lock не длиннее `470 ms` от tap
  до settle. Pair burst is a presentation overlay and never a logical phase.
- Pause never dispatches an engine action and never rewrites engine phase. The
  runtime scheduler stores `{token, remainingMs}` for an in-flight settle,
  cancels its timer/RAF and freezes cursor/audio. Resume schedules exactly one
  settle for the same token after the stored remaining duration. If remaining
  is zero, settle is queued in the next task. Token mismatch is a no-op.
- Pause is valid during `ready`, `moving`, `won` and `failed`; resume returns to
  the identical engine phase and mode. Dispose cannot resume.
- Runtime `completed` flag and host completion event are idempotent.

## Win / fail / restart

- Win: `liveBoard.size===0 && tray.length===0` after normative settle.
- Fail: after pair resolution `tray.length===4`.
- Ошибка без конца: tap locked tile; unresolved legal pick увеличивает tray
  pressure, но не является ошибкой engine.
- Restart: restore a canonical initial **puzzle** snapshot for the same content
  hash; session `revision` and runtime epoch remain monotone and are excluded
  from puzzle equivalence/hash.
- Undo: tray itself is the only unresolved LIFO history. Pop its final id and
  restore that tile to live; a resolved pair is absent from tray and cannot be
  restored.
- Hint: `HintPlanV1 { firstTileId, secondTileId: string | null }`. If a tray
  tile has a solver-safe open mate, return that one board id and `null`; else
  return the first two board taps of a solver-proven continuation. Both ids
  must be legal when their turn is replayed through the reducer.
- Таймер: telemetry-only, не влияет на исход.
- Лимит: tray capacity `4`; lives/moves отсутствуют.

## Duration budget

- Целевая длительность: median `20–45 s` manual с takeover state.
- Действия: `12–20` tile taps (`6–10` pairs), не считая hint/undo.
- Максимальная: контентный target `<60 s`; auto-timeout запрещён.
- Idle: host autoplay; standalone fallback стартует после `6500 ms` без input.

## Bounded prototype

### Входит

- Один production-shaped playable `mahjong-v1`, пять deterministic levels.
- Exact engine, solver/validator, generator receipts, own SkinSpec,
  autoplay/takeover, hint, undo, fail/restart, win/completion.
- Portrait/landscape layout, low-tier/reduced-effects, lifecycle harness,
  analytics map и Review 4 evidence.

### Не входит

- Revive, ads, currency, score, daily, progression screen, store packaging.
- Full reference length, remote assets, backend, production feed roster rollout.

### Disposable spike

Разрешены одноразовые geometry visualizers, solver corpus runners и capture
harnesses. Они не могут стать runtime source of truth.

### Baseline class

Версионированный LevelSpec; pure engine; exact availability rule; typed actions,
events и projection; exhaustive bounded solver; deterministic factory receipt;
shared cursor takeover и staged runtime обязаны пережить prototype.

## Level/content schema

```ts
type TileKind = string;

interface MahjongTileSpecV1 {
  id: string;
  kind: TileKind;
  x2: number; // integer top-left coordinate; x grows right
  y2: number; // integer top-left coordinate; y grows down
  z: number;  // non-negative integer layer
}

interface MahjongLevelSpecV1 {
  schema: "p4g.mahjong.level";
  version: 1;
  id: string;
  seed: number;
  trayCapacity: 4;
  board: { width2: number; height2: number };
  tiles: MahjongTileSpecV1[];
  generator: {
    grammar: "soft-stack-v1";
    candidate: number;
    inputHash: string;
  };
}
```

- Version: exactly `1`; unknown versions reject.
- Stable identity: `schema/version/id/seed` plus SHA-256 canonical content hash.
- Seed: unsigned 32-bit; no ambient `Math.random()`.
- Initial state: sorted immutable tile specs, empty tray, `ready` phase.
- Randomness: only factory from explicit seed; runtime has none.
- Compatibility: additive optional fields only within v1; semantic changes bump
  schema version.
- Content rule: every kind occurs exactly twice in bounded prototype.

## Exact availability geometry

`x2/y2/z/width2/height2` are integers. `(x2,y2)` is the top-left corner; x
grows right and y grows down. Tile `a` occupies half-open rectangle
`Xa=[a.x2,a.x2+2)`, `Ya=[a.y2,a.y2+2)`. Board containment is exactly
`0≤x2`, `x2+2≤width2`, `0≤y2`, `y2+2≤height2`. Positive-area interval overlap
is `max(0, min(endA,endB)-max(startA,startB))>0`; edge/corner touch is not
planar overlap.

- Same-layer positive-area overlap on both axes is invalid geometry.
- `topBlocked(a)`: some live `b` has `b.z>a.z` and positive-area overlap with
  `a` on both x and y. Layer distance does not matter.
- `leftBlocked(a)`: some live `b` has `b.z===a.z`, `b.x2+2===a.x2` and
  positive-area y overlap.
- `rightBlocked(a)`: some live `b` has `b.z===a.z`, `b.x2===a.x2+2` and
  positive-area y overlap.
- A different-z tile **never** side-blocks. This is deliberate prototype
  authority; it can only participate in `topBlocked`.
- `open(a) = !topBlocked(a) && (!leftBlocked(a) || !rightBlocked(a))`.
- Support: every initial tile with `z>0` must have tiles exactly at `z-1`
  whose positive overlap areas with it sum to at least `2` lattice-square
  units (50% of its area). Same-layer non-overlap makes the sum disjoint.
  Unsupported/floating content is a validator reject.

Out-of-bounds, duplicate ids, negative z, invalid same-layer overlap,
insufficient support, non-paired kinds and non-4 capacity are rejects.
Normative geometry fixtures:

| Fixture | Expected |
| --- | --- |
| half-open edge/corner touch without side adjacency | no top/planar overlap |
| same-z positive half-step overlap | invalid geometry |
| one touching side, other free | open if no top blocker |
| both touching sides | locked |
| higher-z positive overlap by one lattice unit | top-blocked |
| different-z edge contact only | never side-blocked |
| z1 tile with support area 1 | invalid; area 2 | valid |
| tile ending exactly at board width/height | valid; one unit beyond | invalid |

## Engine action/state

```ts
type MahjongAction =
  | { type: "tap-tile"; tileId: string; source: "manual" | "autoplay" }
  | { type: "settle-motion"; token: number }
  | { type: "undo" }
  | { type: "hint" }
  | { type: "restart" };

interface MahjongStateV1 {
  levelId: string;
  phase: "ready" | "moving" | "won" | "failed";
  liveTileIds: readonly string[];
  trayTileIds: readonly string[];
  movingTileId: string | null;
  moveToken: number;
  revision: number;
}

interface MahjongRuntimeStateV1 {
  mode: "autoplay" | "manual";
  hostPaused: boolean;
  settle: { token: number; remainingMs: number } | null;
  completed: boolean;
}
```

Pure reducer returns `{state, events}`. A legal tap removes the tile from live
immediately, records it as moving and increments token/revision. Presentation
may dispatch only token-matched settle. Stale settle after restart is a no-op;
pause is owned by the runtime scheduler and leaves engine state untouched.

### Normative settle / undo / restart algorithm

```text
settle(token):
  require phase=moving and token=moveToken, otherwise no-op
  id := movingTileId
  mateIndex := index in trayTileIds with the same kind
  insertionIndex := mateIndex+1 if mate exists, otherwise trayTileIds.length
  nextTray := trayTileIds with id inserted at insertionIndex
  if mateIndex exists:
    transient observable order is mate,id,then displaced survivors
    remove mate and inserted id atomically after settle
    preserve relative order of every survivor; compact survivors left
    emit pair-cleared(mate,id); visual burst may overlap future ready input
  movingTileId := null
  if liveTileIds is empty and nextTray is empty: phase := won
  else if nextTray.length == trayCapacity: phase := failed
  else: phase := ready
  revision := revision + 1

undo():
  require phase=ready and tray non-empty
  id := rightmost tray id; remove it; add id back to live set
  phase stays ready; revision := revision + 1

restart():
  require phase=failed
  restore initial live ids, empty tray, null moving id, phase=ready
  moveToken := moveToken + 1; revision := revision + 1
```

Because each kind occurs exactly twice, at most one earlier mate exists.
`trayTileIds` is both ordered slot content and complete unresolved undo history;
no second history structure exists. Pair resolution precedes win/fail. Canonical
fixtures: `A,B,A` targets slot 1, exposes `[A,A,B]`, then becomes `[B]` with
animated `B:2→0`; `A,B,C,D -> failed`; `A,B,A` then undo restores B;
last matching pair with empty live set -> won; restart then old settle -> no-op.

### Canonical serialization and hashes

- Level content serialization is `JSON.stringify` of a fixed-order array:
  `["p4g.mahjong.level",1,id,seed,4,width2,height2,tiles]`, where each tile is
  `[id,kind,x2,y2,z]` and tiles are sorted by Unicode code-point id. Generator
  metadata/receipt is excluded to avoid self-reference.
- Logical state serialization is the fixed-order array
  `["p4g.mahjong.state",1,levelContentHash,phase,liveIds,movingIdOrEmpty,
  moveToken,trayIds]`; live ids follow canonical tile order and tray order is
  preserved. `revision`, runtime mode/pause, clocks and visual effects are
  excluded.
- Puzzle snapshot serialization is
  `["p4g.mahjong.puzzle",1,levelContentHash,liveIds,movingIdOrEmpty,trayIds]`;
  it excludes phase, token and revision and is used only for restart equality.
- Hash is lowercase SHA-256 hex of the UTF-8 bytes of that JSON string.
- Restart acceptance requires equality with the initial puzzle-snapshot hash;
  transition trace uses the full logical-state hash. Raw `revision` is never
  an identity field.

## Solver / validator

- Validator proves schema/geometry invariants, exact paired multiplicity,
  deterministic canonical hash and that solver returns a valid winning trace.
- Solver proves existence of a trace from initial/current ready state to empty
  board and tray without capacity fail, using the exact reducer settle rules.
- Не доказывает: human fun, visual readability, reference feel or unique solve.
- Legal move: tap any currently open live tile; resolution semantics exactly
  equal engine semantics.
- State key: full live tile bitset plus ordered tray **tile ids**. V1 performs no
  same-kind choice pruning: equal kinds in different coordinates can unlock
  different blockers. Graph-automorphism pruning is explicitly deferred.
- Terminal: win iff board/tray empty; fail iff tray has four unmatched after
  resolution; dead end iff no legal continuation reaches win.
- Difficulty uses the exact integer `MahjongFeaturesV1` schema below.
- Trace: ordered tile ids plus state hash before/after every action.
- Traversal: depth-first, legal moves in canonical tile-id order, deterministic
  memoization; first winning trace is canonical. Semantic budget is exactly
  `100,000` newly expanded state keys. Budget exhaustion rejects candidate but
  never labels it unsolvable.
- Wall time is evidence only: `>200 ms` emits a performance warning and never
  changes status, trace, features, candidate ranking or receipt.
- Replay property: every solver tap and settle is executed by the same reducer;
  recorded before/after logical hashes must equal a fresh reducer replay.
- Reject reasons are typed: `schema`, `geometry`, `pairing`, `no-open-tile`,
  `unsolved`, `budget`, `difficulty-band`, `duplicate`, `readability`.

## Generation strategy

- Layout grammar creates small own stack topologies on half-tile lattice;
  xorshift32 seeded kind assignment generates candidates; zero state maps to
  constant `0x6d2b79f5`. Candidate `i` derives from `seed XOR
  imul(i+1,0x9e3779b9)` with unsigned 32-bit arithmetic.
- PRNG initializes derived state, applies the zero mapping once before its first
  step, then each word uses exactly: `x=(x^((x<<13)>>>0))>>>0;
  x=(x^(x>>>17))>>>0; x=(x^((x<<5)>>>0))>>>0; return x>>>0`. Returned x is
  both output and next state.
- Candidate indexes are exactly `0..299`; exact solver accepts only a winning
  trace and candidates inside the requested numeric band.
- Dedup topology hash is SHA-256 of fixed-order `[width2,height2,tuples]`, where
  tuples are `[x2,y2,z]` sorted by numeric ascending comparator `(z,y2,x2)`;
  kind labels and tile ids are ignored. Series rejects repeated topology hash.
- Accepted candidate rank is ascending tuple
  `[bandCenterDistance2, candidateIndex, contentHash]`. For every feature column
  listed in the requested band, distance is the integer
  `sum(abs(2*feature-(low+high)))`; no midpoint division occurs.
  `branchingMeanMilli` is integer nearest-to-mean with exact formula
  `floor((2000*sumLegalMoves+n)/(2*n))`, ties upward, over the `n=witnessLength`
  pre-tap ready states of the canonical trace. No wall clock enters rank.
- Series is selected in level order 1→5. A candidate is eligible only if its
  topology is new and strict monotonic fields below hold against the previous
  accepted level. Failure after candidate 299 is explicit factory failure.
- Provenance receipt: generator version, seed, candidate index, input/content
  hashes, solver version, witness, features, reject histogram.
- Human review: contact sheet + autoplay clip before series acceptance; factory
  cannot publish or self-approve.

### Exact feature schema

```ts
interface MahjongFeaturesV1 {
  tileCount: number;
  layerCount: number;             // max(z)+1
  initialOpenCount: number;
  initialPairChoices: number;     // kinds with two open tiles initially
  unlockDepth: number;            // max settle checkpoint before first open
  forcedPrefix: number;           // consecutive uniquely winning opening taps, cap 8
  branchingMeanMilli: number;     // mean legal moves on canonical trace ×1000
  decoyExposure: number;          // checkpoints with an open non-immediate-pair tile
  optimalPeakTray: number;        // minimum possible peak unmatched tray size
  solutionCountCapped: number;    // winning traces, saturated at 64
  witnessLength: number;          // always tileCount for a complete forward trace
}
```

- Checkpoints for `unlockDepth/decoyExposure` are initial state and every
  post-settle ready state on the canonical witness. A tile's first-open
  checkpoint is the first such index; `unlockDepth` is their maximum.
- An immediate-pair tile belongs to a kind represented by another open tile or
  by a tray tile. `decoyExposure` counts checkpoints with at least one other
  open tile; it is a readability/pressure feature, not a claim of bad play.
- `forcedPrefix` follows the canonical witness for at most eight taps. At each
  state it asks the exact memoized solver which legal first taps have any
  winning continuation; counting stops unless exactly one such tap exists.
- `optimalPeakTray` is computed by a second deterministic search minimizing the
  maximum post-settle tray length; tie-break uses canonical trace order.
- `solutionCountCapped=min(actual,64)`; enumeration stops deterministically at
  64. No human label enters features or candidate ranking.

## Difficulty ladder

| Lv | Tiles | Layers | Open | Pair choices | Unlock depth | Forced prefix | Branch mean ×1000 | Decoy | Optimal peak | Solutions cap |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | 12 | 1–2 | 4–10 | 2–5 | 1–3 | 0–2 | 3500–9000 | 0–2 | 1–2 | 2–64 |
| 2 | 14 | 2–2 | 4–10 | 1–4 | 2–4 | 0–3 | 3000–8500 | 1–4 | 1–2 | 2–64 |
| 3 | 16 | 2–3 | 4–9 | 1–4 | 3–5 | 0–4 | 2800–8000 | 2–6 | 2–2 | 2–64 |
| 4 | 18 | 3–3 | 4–9 | 1–3 | 4–7 | 0–5 | 2500–7500 | 3–8 | 2–3 | 2–64 |
| 5 | 20 | 3–4 | 4–8 | 1–3 | 5–9 | 0–6 | 2200–7000 | 4–10 | 2–3 | 2–64 |

Strict monotonic fields are `tileCount` (exact `+2` each level),
`unlockDepth` (non-decreasing) and `decoyExposure` (non-decreasing). Other
features must stay inside their per-level inclusive band but need not be
monotone. No undefined notions such as “obvious”, “safe” or “normalized
feature vector” participate in machine acceptance.

## Presentation

- Art: `Soft Geometry`, own calm editorial palette; no Mahjong symbols.
- Layout: tray above board; board centered in safe rectangle; ≥44 px controls;
  portrait tile face target ≥72×88 CSS px, landscape recomputes scale.
- Essential animation: lift `≤50 ms`, flight `430±40 ms`, pair burst
  `520–720 ms`, mate insertion shift during flight, post-pair survivor
  compaction, blocker reveal, locked shake.
- Secondary timings: undo reverse flight `360±40 ms`; restart crossfade
  `180±30 ms`; takeover cursor fade `120±30 ms`; win settle `700±100 ms`.
- Sound: own short synthesized pickup/match/fail/win cues; sound-off safe.
- Haptic: optional host-capability pulse on pair/fail, never correctness cue.
- Success: board breath + compact own `Cleared` treatment; no IQ/combo clone.
- Error: dim + shake + small lock glyph, not color-only.
- Fail: four occupied slots visibly remain, dim layer, `No space`, Restart.
- Color independence: glyph geometry, outline, motion and lock badge carry state.
- Low-tier/reduced: cap particles, replace blur with alpha/scale, keep timings.
- Cover/live: cover is captured from the exact Level 1 live composition; no
  misleading fake board.

## Assets

| Asset | Source/provenance | Format | Budget | Skin replaceable |
| --- | --- | --- | ---: | --- |
| Tile/glyph atlas | code-generated in repo | Canvas2D | 0 network bytes | yes |
| Background texture | deterministic procedural | Canvas2D | 0 network bytes | yes |
| Particles | code-generated primitives | Canvas2D | 0 network bytes | yes |
| Micro-sounds | repository-authored synthesis | WebAudio | 0 network bytes | yes |

No Vita evidence or external media enters the production bundle.

## Runtime/platform integration

- Target: `playables/mahjong-v1`, Canvas2D, shared playable runtime.
- Staged boot: cheap static frame → `prepareInteractive` → interactive ready;
  autoplay cannot act before host mode+prepare.
- Host pause: exact orthogonal scheduler contract from State machine; engine
  phase is unchanged, remaining flight time is preserved and one settle resumes.
- Modes: host autoplay/manual, standalone idle fallback `6500 ms`.
- Completion: one `playable:complete` after `700±100 ms` win settle; fail remains
  restartable. Pause delays the settle/completion without duplicating it.
- Level selection: explicit `levelId`, default `mahjong-01`; no internal loop.
- Cleanup: remove listeners/timers/RAF/audio nodes; idempotent dispose.
- Mount target: `≤20 ms` p95 static mount on desktop harness; interactive prepare
  `≤80 ms` p95; verify Android separately. Frame evidence reports p50/p95/max;
  happy-path p95 target `≤20 ms`, no long frame `>50 ms` during the measured
  30-second device clip. This is a measured target, not an absolute FPS claim.
- Prefetch: target gzip bundle `<250 KB`, total release `<5 MB`.
- External media: none.

## Analytics questions

| Вопрос | Наблюдение/event | Интерпретация | Не доказывает |
| --- | --- | --- | --- |
| Считывается autoplay? | `autoplay_pair_cleared`, latency | completed pair before takeover | rule understood |
| Срабатывает takeover? | `takeover` with revision/tray count | exact manual continuation rate | player preference |
| Понятна ошибка? | locked tap then next legal tap; no repeat loop | recovery after cue | semantic comprehension |
| Чувствуется tray risk? | peak occupancy, undo, fail/restart | observed planning pressure | fun by itself |
| Проходят ли серию? | win/fail/restart by `levelId` | relative completion envelope | publication quality |

Events carry no raw pointer path or personal data. Required fields: schema
version, playable version, level id, mode, state revision, elapsed bucket and
typed reason. Analytics never changes engine state.

## Work packages

| ID | Stream | Scope | Inputs | Outputs | Не трогает | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| MJ-R | Reference | observation, timings, rights | Vita 3.32.0 | packet+evidence | source/runtime | Review 3 |
| MJ-E | Engine | schema, geometry, reducer, events | MJ-G | pure modules+tests | visuals/factory | MJ-Q |
| MJ-S | Solver | exact search, trace, features | MJ-E contracts | solver+corpus | UI/runtime | MJ-Q |
| MJ-F | Factory | grammar, candidates, receipts, five levels | MJ-S | deterministic artifacts | renderer | MJ-Q |
| MJ-P | Presentation | SkinSpec, layout, motion, sound | MJ-R/MJ-E projection | renderer+clips | solver semantics | Review 4 |
| MJ-I | Integration | staged boot, host mode/pause/completion | E/P/A | playable build+harness | production roster | MJ-Q |
| MJ-A | Analytics | versioned event map | MJ-G/E events | analytics contract | state decisions | MJ-Q |
| MJ-Q | QA | tests, Android clips, parity, perf | all | Review 4 packet | implementation authorship | independent reviewer |

## Typed integration boundaries

- Level: `MahjongLevelSpecV1` and canonical content hash.
- Engine: `MahjongStateV1`, `MahjongAction`, typed domain events.
- Solver: `{status, trace, features, expandedStates, durationMs}`.
- Trace: tile id plus before/after state hashes; engine replays it in tests.
- Presentation projection: read-only tiles with `open/locked/moving` flags,
  ordered tray, phase, hint ids and animation events; renderer cannot infer rules.
- Factory: immutable level JSON + provenance receipt, both hash-bound.
- Analytics: consumes engine/runtime events only; no callbacks into reducer.
- Runtime bridge: `MahjongRuntimeStateV1`; host mode/pause/completion owns
  scheduler state but cannot rewrite engine state.
- Validation receipt: schema/content/topology hashes, exact features, solver
  trace+hash replay, expanded-state count, performance duration and warnings.

## Risks

| Risk | Probability | Damage | Early test | Stop/mitigation |
| --- | --- | --- | --- | --- |
| Four-slot hybrid is confused with triple-tile | medium | core rule unreadable | first-pair/no-copy autoplay clip | revise first 4 s; never change pair-of-two silently |
| Small stack loses spatial readability | medium | mobile mis-taps | 360×640 + SM-A326B hit-box overlay | reject layout under 72×88 face target |
| Solver/factory bands overconstrain corpus | medium | no five-level series | 300 candidates/level receipt | stop after candidate 299; revise brief explicitly |
| Pause/takeover races settle | medium | state discontinuity | deterministic fake-clock fixtures | block Review 4 on any duplicate/missing settle |
| Own skin drifts toward Vita trade dress | low | rights/fidelity risk | side-by-side silhouette/palette review | replace skin; keep engine/content |
| Burst jank on low tier | medium | feel failure | Android frame distribution | reduced-effects particle cap |

## Открытые решения

| Вопрос | Почему блокирует | Кто решает | Trigger | Disposition |
| --- | --- | --- | --- | --- |
| Rule/geometry/reducer/factory | — | — | Review 3 | **closed in this brief** |
| Skin saturation/contrast | does not block implementation | human operator | Review 4 device clip | taste parameter; revise skin only |
| Rollout/publication | outside prototype authority | human operator | after accepted Review 4 | explicitly deferred |

Critical open decisions before prototype: **none**.

## Acceptance

Every unchecked item blocks final `accept baseline` unless its row is recorded
as an explicit reference delta accepted by the independent Review 4 reviewer.

### Executable matrix

| Area/claim | Machine command or fixture | Evidence path |
| --- | --- | --- |
| Geometry boundaries/support | `npm run test:mahjong -- geometry` | `mahjong-v1/evidence/review4/geometry.json` |
| Settle/insertion/shift/compaction/undo/restart fixtures | `npm run test:mahjong -- engine` + presentation tests | `mahjong-v1/evidence/review4/engine.json` |
| Pause flight + stale settle | `npm run test:mahjong -- lifecycle` | `mahjong-v1/evidence/review4/lifecycle.json` |
| Solver reducer replay/hash | `npm run test:mahjong -- solver` | `mahjong-v1/evidence/review4/solver-receipts.json` |
| Factory determinism/bands/dedup | `npm run test:mahjong -- factory` | `mahjong-v1/evidence/review4/factory-receipts.json` |
| Analytics/takeover/completion | `npm run test:mahjong -- analytics` | `mahjong-v1/evidence/review4/analytics.json` |
| Staged boot/pause/cleanup | `npm run review4:mahjong` | `mahjong-v1/evidence/review4/runtime.json` |
| Real Feed gesture arbitration | `npm run review4:mahjong` | `mahjong-v1/evidence/review4/feed-shell.json` |
| Tall/compact/cover/low-tier | `npm run visual-proof mahjong-v1 -- --both` | `mahjong-v1/evidence/review4/visual-proof/` |
| AutoCursor before/after | Review 4 capture script | `mahjong-v1/evidence/review4/autocursor/` |
| Android real-time + side-by-side | SM-A326B device capture | `mahjong-v1/evidence/review4/device/` |
| Release/payload policy | `npm run release mahjong-v1` | `mahjong-v1/evidence/review4/release.txt` |
| Aggregate independent packet | `npm run review4:mahjong` | `mahjong-v1/REVIEW-4-PACKET.md` |

Final implementation may refine command filters, but `npm run test:mahjong`
and `npm run review4:mahjong` must remain stable aggregate entrypoints.

### Gameplay

- [ ] `A,B,A` targets slot 1, visibly passes through `[A,A,B]`, bursts adjacent
  slots and compacts `B:2→0`; generalized middle-mate, `A,B,C,D -> failed`,
  middle-pair undo, last-pair win and failed-only restart pass exact fixtures.
- [ ] Win/fail/restart are reproducible and no hidden rule exists.
- [ ] Autoplay performs only reducer actions from a solver replay.
- [ ] First manual pointer stops autoplay atomically and keeps exact logical hash.
- [ ] Hint one/two-id shapes replay as legal and solver-safe.

### Content

- [ ] Schema/hash serialization is versioned and deterministic across two runs.
- [ ] Geometry fixtures cover bounds, touch, overlap, z-side and support policy.
- [ ] Validator covers every typed reject; solver covers valid, unsolved and
  expansion-budget fixtures without wall-clock disposition.
- [ ] Five factory receipts pass exact numeric bands, monotonic fields and
  unique topology hashes; same seed yields byte-identical level/receipt.
- [ ] Every recorded solver trace replays through the reducer with exact hashes.

### Platform

- [ ] Static/interactive staged boot has no gameplay before prepare+host mode.
- [ ] Pause in ready/moving/won/failed preserves engine hash; flight resume gives
  exactly one token-matched settle; stale settle after restart is no-op.
- [ ] Cleanup leaves no timers/listeners/RAF/audio; dispose is idempotent.
- [ ] Completion is exactly once after win settle, including pause/resume.
- [ ] Real feed shell proves vertical swipe does not produce tile tap.
- [ ] Cover registers from the exact first live Level 1 composition.

### Presentation

- [ ] 360×640 tall and 844×390 compact remain playable with ≥44 px controls;
  portrait tile face target remains ≥72×88 CSS px.
- [ ] Gameplay, locked/error, fail and win read without sound and not by color alone.
- [ ] Flight, insertion shift, adjacent burst, survivor compaction, undo,
  restart, cursor fade and win settle fit numeric targets.
- [ ] Reduced-effects path preserves logical/timing contract and Android clip has
  p95 frame `≤20 ms` with no measured long frame `>50 ms` in happy path.

### Fidelity

- [x] R/P feel table and parity checklist existed before Engine.
- [ ] Every MJ-R parity item is PASS or an explicitly accepted delta.
- [ ] 30-second real-time side-by-side is reviewed on the physical Android device.
- [ ] AutoCursor before/after evidence exists for every feel iteration.
- [ ] Visual identity is own while exposed/tray/pair/fail causality remains legible.

### Evidence

- [x] Hash-bound reference packet and manifest are attached.
- [ ] Geometry/engine/solver/factory/lifecycle/analytics receipts are attached.
- [ ] Visual proof, runtime/release output, device clips and delta list are attached.
- [ ] Independent Review 4 records Gameplay, Content, Platform, Presentation,
  Fidelity and Evidence dispositions separately.

## Known deltas and limitations

- Accepted bounded delta: 70 reference tiles become 12–20; session becomes
  20–45 seconds; own skin replaces all Vita trade dress.
- Accepted system delta: deterministic restart replaces unverified reference
  reshuffle; monetized revive/meta are absent.
- Reference audio was not measured reliably; own sound is functional/accessory,
  not fidelity evidence.
- Reference input latency has a screenshot-derived upper bound; prototype uses
  browser timing plus 60 fps device capture.

## Kill criteria

- Any core fixture has different state/tray/hash in engine and solver replay.
- Same `level+seed+generator version` yields different accepted content/receipt,
  including differences caused by wall time or machine load.
- Fewer than five levels meet bands within 300 candidates each without manual
  JSON repair; band changes require a new explicit brief revision.
- First pair misses `2.2 s`, flight misses `430±40 ms`, or takeover resets state
  after two presentation iterations.
- Tray capacity/rule, exposed geometry or pair-of-two must be hidden or changed
  to make the first 30 seconds readable.
- Target Android cannot keep p95 frame `≤20 ms` or produces a >50 ms happy-path
  long frame after reduced-effects mitigation.
- Own skin cannot be made clearly distinct from Vita trade dress.

## Evidence index

| Evidence | Path/URL | Digest/version | Reviewer disposition |
| --- | --- | --- | --- |
| Reference packet | [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md) | snapshot `2026-08-01` | ready |
| Reference manifest | [`evidence/reference/MANIFEST.md`](evidence/reference/MANIFEST.md) | SHA-256 in Review 3 | ready |
| Independent Review 3 | [`REVIEW-3-INDEPENDENT-2026-08-01.md`](REVIEW-3-INDEPENDENT-2026-08-01.md) | final brief `a06323bf…f521` | approved-for-prototype |
| Solver/factory/runtime/visual/device packet | `playables/mahjong-v1/evidence/review4/` | produced by MJ-S/F/I/P/Q | pending |
| Independent Review 4 | `playables/mahjong-v1/REVIEW-4-PACKET.md` | produced by MJ-Q | pending |

## Final decision

- Decision: **Review 3 approved-for-prototype**; class-baseline decision remains
  pending independent Review 4.
- Operator note: pending.
- Follow-up scope: MJ-E/S/P/A may run in parallel; MJ-F follows solver contract,
  MJ-I composes accepted modules, MJ-Q reviews.
- Explicitly deferred: rollout, production feed roster, stores, monetization,
  meta/progression and full-length Vita-equivalent content.

## Review gates

- Review 3: независимый reviewer подтверждает rule closure, exact geometry,
  timing targets, bounded scope, rights boundary и typed workstream boundaries.
- Implementation starts only after Review 3 `approved-for-prototype` or an
  explicit human override recorded next to the review.
- Review 4: Android side-by-side clip, AutoCursor before/after evidence,
  parity checklist, solver/factory receipts, lifecycle/perf/release evidence.
- Publication remains a separate human authority even after Review 4 accept.
