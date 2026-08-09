<!-- mechanics-process-version: 2 -->
# Class Brief: `bubble-shooter`

- Дата: `2026-08-09`
- Статус: `implementation-spike-authorized / Review 3 pending`
- Владелец taste-решения: operator (user request, 2026-08-09)
- Автор brief: Codex
- Независимый reviewer: pending before merge/rollout

> Этот brief разрешает локальный bounded prototype и evidence work. Он не
> разрешает публикацию, roster mutation или использование reference IP.

## VISION-триаж

- Принцип: фабрика от точного эталона, быстрый one-finger loop, серия `1..N`.
- Неопределённость: можно ли получить Bubble Witch-like aim/impact/drop feel в
  лёгком детерминированном Canvas2D runtime с полностью заменяемым артом.
- Работа допустима сейчас: оператор выбрал точный reference и предоставил
  физическое устройство; изменения остаются локальным prototype/evidence.
- Требуемое решение оператора: Review 4 taste disposition после side-by-side.
- Документ не разрешает: production rollout, брендовый арт или копирование
  protected assets.

## Цель

В real-time side-by-side одинакового action script оператор не может назвать,
чем prototype хуже primary reference по aim response, projectile path, snap,
match burst, unsupported drop, target cadence и terminal anticipation; визуальная
идентичность при этом очевидно собственная и схематичная.

## Non-goals

- Meta-map, lives economy, currency, boosters, ads, social и narrative scenes.
- Reference characters, UI, copy, music, bubble faces or backgrounds.
- Later-level blockers, ceiling pressure, streak/power bubble system.
- Procedural art; current skin is code-drawn and deliberately disposable.

## Точный эталон

### Primary reference

- Название: Bubble Witch 3 Saga.
- Версия/дата: Android `10.16.1.0`, captured `2026-08-09`.
- Package: `com.king.bubblewitch3`.
- Screen recording: [`evidence/reference/`](evidence/reference/).
- Диапазон уровней: onboarding Levels `1–2`.

### Secondary references

Нет. Общая bubble-shooter традиция не подменяет конкретную temporal authority.

### Числовой feel-разбор

Authority: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#геометрия-и-feel--числа-до-engine).
Engine constants may use only an `R` range or an explicit `P` target from that
table. Any new guess must be added as a visible delta before code changes.

### Reference parity checklist

Authority: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#reference-parity-checklist).

### Transition parity matrix

| Pre-state | Input/action script | Reaction checkpoint | Settle/effect checkpoint | Final state | Naive failure caught | Reference evidence | Executable fixture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Level 1 opening: yellow current and a yellow support bridge below every target | hold straight upward and release once | counter decrements on release; shot follows preview; contact precedes structure change | yellow `popBatch`; post-pop `dropBatch`; six ordered `rescue` events; terminal after final rescue | `won`, target `6/6`, no target identity remains | match-only implementation leaves unsupported graph floating or wins before rescue settle | `bubble-level1-success.mp4`; Level 1 `10 fps` sheet | `bubble-shooter-engine.test.mjs / terminal support-cut emits ordered match-drop-rescue-win trace` |
| Level 2 opening: red current and direct lane blocked by lower blue subtree | left-wall bounce action | preview and live shot share wall contact, reflected segment and landing cell | red pop precedes lower blue detach; exactly two target ids rescue | `ready`, target `2/6`, upper anchored graph unchanged | visual preview bounce with a different engine ray; nearest-Euclidean snap to another cell | `bubble-level2-reference.mp4`; bounce `10 fps` sheet | `bubble-shooter-presentation.test.mjs / bounce preview and shot resolve the same landing cell` |
| No connected red pair at lower blue boundary | direct red shot into legal empty neighbor | typed `shot-landed` identifies incoming id/cell; no `match` event | `220 ms` no-match settle and queue promotion | incoming red persists, counter decremented, objective unchanged | `2` bubbles treated as a match or incoming bubble discarded on no-match | `bubble-level2-no-match.png` | `bubble-shooter-engine.test.mjs / no-match appends exactly one stable cell` |
| Two player-created red bubbles are connected below the same boundary | third red shot into pair | incoming id lands before flood fill; match set is exactly the connected three | three pop; survivors retain ids/cells; no unrelated support cut | created three absent; objective unchanged | global same-color delete or support detection before match removal | `bubble-level2-two-reds.png`; `bubble-level2-match3-effect.png` | `bubble-shooter-engine.test.mjs / third red pops only its connected component` |
| Mutated Level 2 in terminal fail presentation | Retry | active transitions are invalidated by revision; reset reaction crossfades | exact LevelSpec snapshot is re-projected; no stale callback can settle | opening cells, shots `32`, target `0/6`, initial queue | reset counters only while keeping changed grid or stale shot settling after restart | `bubble-fail-restart-reference.mp4`; `bubble-after-retry.png` | `bubble-shooter-engine.test.mjs / restart invalidates stale transitions and restores snapshot` |

Contact sheets are fixed gameplay crops at `10 fps`. Typed presentation events
name `incomingId`, `landingCell`, ordered `matchedIds`, `dropBatchId`, ordered
`droppedIds`, ordered `rescuedTargetIds` and the engine `revision`.

### Rights boundary

- Не копируем: names, characters, art, copy, map, score UI, audio, music,
  typography, backgrounds or original level layouts as shippable content.
- Replacement: code-drawn `Signal Garden` skin with abstract orbs and sprouts.
- Open IP/taste question: none blocks the logic spike; final skin and narrative
  require a separate SkinSpec and human approval.

## Core fantasy

Игрок одним точным рикошетом срезает цветную опору и наблюдает, как целый
подвешенный сад эффектно распадается, освобождая спрятанные ростки.

## Core loop

Удержать и прицелиться → отпустить шар → увидеть snap/match → получить pop или
support-cut drop → сразу прочитать следующий цвет и выбрать новый угол.

## Первый экран и autoplay

- First frame: board, current/next orb, shots, target progress; no modal copy.
- Rule without text: AutoCursor traces a visible bounce and releases into a
  three-color support cut.
- Autoplay: exact solver-authored shot sequence, not randomized play.
- First autoplay fragment: first aim by `650 ms`, release by `1450 ms`, structural
  result visible by `2600 ms`.
- Optimal: yes for the first teaching shot; later shots may demonstrate a safe
  near-optimal route only if explicitly listed in LevelSpec.
- Takeover: first accepted user pointer atomically stops AutoCursor.
- State: live state is preserved; no hidden restart.

## Input contract

| Input | Условие | State transition | Feedback |
| --- | --- | --- | --- |
| pointerdown within launcher zone | `ready`, not paused | `ready → aiming` | aim line ≤`33 ms`, launcher squash |
| pointermove while captured | `aiming` | recompute exact ray/bounce/collision preview only | continuous glowing path |
| pointerup/cancel after valid aim | `aiming` | `aiming → flight`, shots `-1` | release recoil + light haptic |
| pointerdown outside launcher | `ready` | no gameplay state change | subtle launcher pulse, no shot |
| any pointer during structural lock | `flight/pop/drop/rescue/win-settle` | discarded, never queued | none |
| first manual pointer during autoplay | autoplay active | stop autoplay, preserve state | cursor fade `120±30 ms` |
| Restart | `failed` | revision increment + exact initial snapshot | `180±30 ms` crossfade |

Vertical swipe conflict: only a pointerdown inside the launcher capture zone can
become aim. Before takeover, feed owns vertical swipes. After capture, pointer
events are local until release/cancel; a motion that began outside the launcher
never shoots.

## State machine

```text
boot -> static_ready -> preparing -> interactive_ready
  -> ready -> aiming -> flight -> snap
  -> no_match_settle -> ready
  -> pop -> drop -> rescue -> ready | win_settle -> won
  -> failed -> restart -> ready
```

All transient transitions carry an engine `revision`; pause freezes remaining
logical time, cleanup cancels them, restart makes stale completions no-op.

## Win / fail / restart

- Win: `rescuedTargetCount === targetCount` after the last rescue settles.
- Fail: shots reach zero after the last structural effect and target remains.
- Non-terminal error: no-match is legal and only consumes one shot.
- Restart: fail-only in player UI; debug/runtime API may restart deterministically.
- Undo: not included.
- Hint: not included; autoplay trace is separate from manual UX.
- Timer: none.
- Resource: versioned `shots` in LevelSpec.

## Duration budget

- Target: `25–45 s` manual.
- Actions: `4–9` releases.
- Maximum: `60 s` for bounded levels; no auto-fail on time.
- Idle: Swipe host may run autoplay; standalone remains stable and manual.

## Bounded prototype

### Входит

- Five original deterministic levels; colors, targets, shots and queue in data.
- One-bounce preview/shot, hex snap, match-3, unsupported drop and targets.
- Win/fail/restart, autoplay/takeover, pause/resume/cleanup.
- Code-drawn replaceable skin, particles, synthesized SFX and semantic haptics.

### Не входит

- Meta, score economy, boosters, swap bubble, ceiling descent and blockers.
- Reference art/media in any build.
- Model-based generation or public rollout.

### Disposable spike

Particle shapes, palette, copy, backdrop and target icon are replaceable. Level
layouts may be replaced after feel acceptance; engine events and timings may not.

### Baseline class

`LevelSpecV1`, axial/grid conversion, deterministic collision/snap, connected
match, ceiling support, typed transition trace, lifecycle and replay fixtures.

## Level/content schema

```ts
type BubbleColor = 'coral' | 'cyan' | 'gold' | 'violet';
type Cell = { row: number; col: number };

interface BubbleShooterLevelSpecV1 {
  schema: 'bubble-shooter.level.v1';
  id: string;
  seed: string;
  rows: Array<{ offset: 0 | 1; cells: Array<{
    col: number;
    color: BubbleColor;
    target?: { id: string };
  }> }>;
  shots: number;
  queue: BubbleColor[];
  autoplay: Array<{ aimX: number; aimY: number }>;
  difficulty: { expectedShots: number; bounceShots: number; supportCutMax: number };
}
```

- Version: `bubble-shooter.level.v1`.
- Stable identity: `id + canonical spec hash`.
- Seed: required even for authored packs.
- Initial state: cells, shots, queue, target ids.
- Allowed randomness: presentation-only identity-derived drop wobble/particles.
- Backward compatibility: new rules require new schema/version; v1 never
  infers missing gameplay fields.

## Solver / validator

- Validator: schema, unique cells/targets, queue sufficiency, ceiling anchors,
  legal colors, shots and autoplay action syntax.
- Solver: bounded angle/landing-cell search proving at least one solution within
  shots; emits exact landing cells and structural trace.
- Does not prove: human fun, visual readability or reference-quality feel.
- Legal move: one reachable empty cell along a direct/one-bounce ray.
- Terminal: all targets rescued; fail only after pending effects settle.
- Solvability: witness length `≤shots`.
- Difficulty: solution length, legal landing count, required bounces, maximum
  support cut, off-plan no-match traps.
- Trace: deterministic actions plus expected landing/match/drop/rescue ids.
- Budget: `≤50k` expanded states or `250 ms` per authored candidate in CI.

## Generation strategy

- Construction: reverse attach target subtrees under removable colored bridges.
- Candidate budget: `200` per band for future factory; not part of first spike.
- Dedup: canonical colored/target graph plus mirror normalization.
- Difficulty: hard ranges from solver features, then human taste review.
- Series: exactly five increasing levels, no new rule after Level 3.
- Provenance: authored-original v1 pack and solver receipt.
- Human review: before any catalog/roster proposal.

## Difficulty ladder

| Уровень | Новое требование | Target features | Запрещённые скачки |
| ---: | --- | --- | --- |
| 1 | direct support cut | `3–4` shots, one large drop | bounce required |
| 2 | first wall bounce | one required bounce, one no-match trap | new color + blocker together |
| 3 | choose between two colors | `4–6` shots, two targets branches | swap mechanic |
| 4 | preserve a bridge | `5–7` shots, branching `2–3` | off-screen landing |
| 5 | two-stage cut | `6–9` shots, two required bounces | new rules or booster |

## Presentation

- Art: `Signal Garden`, original soft geometric field; programmatic only.
- Layout: portrait-first; board uses upper `62%`, launcher lower center, minimal
  HUD at safe top.
- Essential animation: aim, recoil, constant-speed flight, snap, pop, gravity
  drop, rescue cadence, next promotion, terminal anticipation.
- Sound: own WebAudio oscillator/noise drafts, silent before interaction.
- Haptic: light release, medium match, heavy large drop, rigid→heavy win.
- Success: target lift, progress pulse, short radial celebration.
- Error: no-match snap is readable without punishment modal.
- Fail: field dim + exact restart button, no automatic store redirect.
- Color-independent: each color has a distinct interior glyph.
- Low tier: fewer particles/glows; same timings and paths.
- Cover/live: exact same initial Level 1 projection.

## Assets

| Asset | Source/provenance | Format | Budget | Replaceable by skin |
| --- | --- | --- | ---: | --- |
| Board, orbs, glyphs, target, launcher, particles | original code | Canvas2D | `0` raster bytes | yes |
| Aim/recoil/pop/drop SFX | original synthesis | WebAudio | `0` media bytes | yes |
| AutoCursor hand | shared platform runtime | code/baked fallback | shared | no gameplay dependency |

## Runtime/platform integration

- Target: strict standalone/AppLovin plus Swipe build from same source.
- Staged boot: cheap static projection → host `prepareInteractive` → warm SFX /
  deterministic level → `interactive_ready`.
- Host pause: freezes logical scheduler and cursor; no state divergence.
- Autoplay/manual: Swipe only; exact witness and atomic takeover.
- Completion: `CHALLENGE_SOLVED → COMPLETED(won)` exactly once after win hold.
- Level: `?level=1..5`, host owns next level.
- Cleanup: idempotent listeners/RAF/timers/audio/API teardown.
- Mount target: desktop p95 `≤20 ms`; Android interactive p95 `≤80 ms`.
- Prefetch: `≤250 KB` gzip target, no external media.

## Analytics questions

| Продуктовый вопрос | Наблюдение/event | Интерпретация | Не доказывает |
| --- | --- | --- | --- |
| Считывается ли autoplay? | first manual aim lands in a legal cell after takeover | rule likely understood | enjoyment or retention |
| Срабатывает ли takeover? | `takeover` revision/phase before first manual aim | exact handoff occurred | user preferred manual |
| Понятна ли ошибка? | no-match followed by a corrected match within two shots | feedback supported correction | visual taste quality |
| Проходят ли серию? | exact terminal outcomes by level id | bounded completion | long-term retention |

## Work packages

| ID | Workstream | Scope | Inputs | Outputs | Не трогает | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| `BS-R` | Reference | Levels 1–2 capture, feel, parity | Android reference | packet/evidence | implementation | operator |
| `BS-E` | Engine | reducer, collision, typed trace | brief | deterministic runtime | art/meta | independent |
| `BS-S` | Solver | validation/witness | schema/engine | receipts/tests | presentation | independent |
| `BS-F` | Factory | bounded reverse candidates | solver | future candidate pack | rollout | taste reviewer |
| `BS-P` | Presentation | Signal Garden + juice | trace/feel | visual layer | reducer | operator |
| `BS-I` | Integration | staged boot/autoplay/lifecycle | engine/shared runtime | Swipe build | feed policy | platform reviewer |
| `BS-A` | Analytics | milestones/questions | gameplay states | event mapping | success authority | analyst |
| `BS-Q` | QA | parity/runtime/device evidence | all above | Review 4 packet | publication | independent |

## Typed integration boundaries

- Level schema: `BubbleShooterLevelSpecV1`.
- Engine action/state: `aim/release/tick/restart/pause` → immutable revisioned state.
- Solver result: `solved/unsolved/budget`, action witness and feature vector.
- Solver trace: landing/match/drop/rescue identities per shot.
- Presentation: ordered `ShotTransitionEvent[]`, never inferred from final grid.
- Runtime: shared staged boot, Swipe API and completion bridge.
- Receipt: schema/spec/engine/solver hashes plus witness and feature vector.

## Risks

| Risk | Вероятность | Ущерб | Ранний тест | Stop/mitigation |
| --- | --- | --- | --- | --- |
| preview differs from shot | medium | critical feel break | ray/landing property tests + overlay trace | single collision authority |
| FPS-dependent snap | medium | invalid replay | 30/60/120 Hz scripted ticks | discrete cell result at release |
| juice hides board state | medium | gameplay unreadable | reduced/no-particle capture | state glyphs remain visible |
| support batch event loses identities | low | renderer guesses causality | adversarial fixtures | typed ordered ids |
| wide evidence files bloat repo | medium | review friction | manifest + H.264 derivatives | retain only bounded compressed clips |
| copied trade dress | low | rights risk | bundle asset/provenance audit | programmatic original skin only |

## Открытые решения

| Вопрос | Почему блокирует | Кто решает | Deadline/trigger | Disposition |
| --- | --- | --- | --- | --- |
| Exact different-color swap timing | needed only if swap enters v1 | operator/reference capture | before adding swap | deferred outside baseline |
| Natural shot-exhaustion presentation | Review 4 fail parity | operator/reference capture | before baseline acceptance | logic included; presentation marked P |
| Final drawn skin | required for production identity | art/taste owner | after mechanics baseline | intentionally deferred |
| Rollout | external authority | operator | after independent Review 4 | not authorized |

## Acceptance

### Gameplay

- [ ] Core loop matches selected reference rule.
- [ ] Win/fail/restart are deterministic.
- [ ] Autoplay/takeover follow this brief.
- [ ] Every state-changing input has a temporal parity fixture.
- [ ] Preview and shot resolve the same landing cell.

### Content

- [ ] Schema is versioned and stable.
- [ ] Five seeds reproduce exact initial states.
- [ ] Validator rejects overlap, missing queue and invalid target fixtures.
- [ ] Solver replays every witness.
- [ ] Difficulty ladder is visually and mechanically distinct.

### Platform

- [ ] Staged boot and cover/live match pass.
- [ ] Pause changes no gameplay result.
- [ ] Cleanup leaves no active RAF/listener/timer/audio/API.
- [ ] Completion is exact-once.
- [ ] Swipe mounts no internal CTA.

### Presentation

- [ ] Tall and compact aspects are captured.
- [ ] State is readable without sound or color alone.
- [ ] Reduced effects preserve timing.
- [ ] Original skin has no reference asset bytes.

### Fidelity

- [x] Feel table was filled before Engine.
- [ ] Parity checklist is dispositioned row by row.
- [ ] Same action scripts run reference/prototype in side-by-side.
- [ ] AutoCursor before/after exists for every feel iteration.
- [ ] Fixed-crop contact sheets prove all structural transitions.

### Evidence

- [x] Reference packet and raw capture exist locally.
- [ ] Visual proof, runtime receipts and delta list are attached.
- [ ] Prototype transition contact sheets are attached.
- [ ] Independent reviewer gives Review 3/4 dispositions.

## Kill criteria

- Aim preview misses actual landing cell in any deterministic fixture/device.
- Support-cut final state is right but event ordering/identities are wrong.
- Mid-range Android p95 frame exceeds `20 ms` after reduced-effects fallback.
- Operator can consistently distinguish prototype as worse in aim/impact/drop
  timing after three measured iterations.
- Any reference art/audio/brand byte enters a build.

## Evidence index

| Evidence | Path/URL | Digest/version | Reviewer disposition |
| --- | --- | --- | --- |
| Reference packet | `docs/mechanics/bubble-shooter/REFERENCE-PACKET.md` | process v2 | pending |
| Android recordings/screens | `docs/mechanics/bubble-shooter/evidence/reference/` | manifest pending compression | pending |
| Engine/tests | `playables/bubble-shooter-v1/`, `playables/test/bubble-shooter-*.test.mjs` | pending | pending |
| Review 4 | `playables/bubble-shooter-v1/REVIEW-4-PACKET.md` | pending | pending |

## Final decision

- Decision: `rework / Review 3 pending`.
- Operator note: local implementation spike requested on `2026-08-09`.
- Follow-up: measured implementation, device comparison, independent review.
- Explicitly deferred: drawn art, swap, later blockers, meta and rollout.
