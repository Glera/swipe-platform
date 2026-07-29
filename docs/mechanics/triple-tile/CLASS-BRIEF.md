# Class Brief: `triple-tile-v1`

- Дата: **29.07.2026**
- Статус: **Review 3 logic GO / TT-P fidelity blocked**
- Владелец taste-решения: **оператор**
- Автор brief: **Codex**
- Независимый reviewer: **Claude** —
  [`REVIEW-INDEPENDENT-2026-07-29.md`](REVIEW-INDEPENDENT-2026-07-29.md)
- Reference packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)

> Brief — typed boundary для solver-first разработки. Оператор разрешил
> TT-G/TT-S/TT-E после merge документации. Presentation work, публикация и
> rollout не разрешены; fidelity `P/B` блокируют TT-P.

## Authority legend

- `R` — измерено/наблюдено по reference evidence;
- `O` — утверждено оператором;
- `P` — предлагаемое значение;
- `B` — blocking до указанного review/workstream.

## VISION-триаж

- Принцип/ступень VISION: фабрика от точного эталона, typed content,
  deterministic validator/solver, human taste gate (`O`).
- Продуктовая неопределённость: можно ли превратить layered triple-tile в
  короткую серию, где solver доказывает проходимость, а reference fidelity не
  зависит от фирменных assets (`O`).
- Почему допустимо сейчас: отдельная research-инициатива готовит future
  supply и не открывает новый platform contour (`O`).
- Утверждено оператором: Triple Tile primary, Zen Match secondary, captures
  `20 / 25 / 30`, отсутствие boosters/crowns/meta (`O`).
- Fail-on-7th утверждён оператором; haptic/audio и полный primary recording
  нужны только перед TT-P (`O/B`).
- Что документ не разрешает: TT-P fidelity code до primary evidence,
  rollout, exact reference layouts/assets и смешение с Mahjong Solitaire
  (`O`).

## Цель

После утверждения эталона оператор на устройстве не может назвать, чем
30-секундный side-by-side прототипа и target Triple Tile отличаются по
tap response, tile flight, tray grouping/compression, triple removal,
readability и win/fail cadence, при собственной visual identity (`P`).

## Non-goals

- Pair-matching Mahjong Solitaire, tile sorting, swap Match-3 и hidden-object
  (`O`).
- Копирование exact layouts, symbols, palette, UI, background, audio или
  progression reference (`O`).
- Boosters, Undo, Shuffle, Hint, extra slot, continue, revive, blockers,
  timer, meta, map, currency, ads и liveops в bounded v1 (`O`).
- Golden crowns/collectible goals, face-down hidden-symbol rules, bombs, ice,
  glue, chain, curtain, producer и goal-based clear (`O`).
- Runtime randomness, server generation и model-in-gameplay (`O`).
- Объявлять solver-valid уровень интересным без taste review (`O`).

## Точный эталон

### Primary reference (`O`)

- Название: **Triple Tile: Match Puzzle Game**
- Listing snapshot: App Store `2.75.03`, наблюдение 29.07.2026 (`R-web`).
- Ссылка: [App Store](https://apps.apple.com/us/app/triple-tile-match-puzzle-game/id1572661625).
- Public screen recordings:
  [Level 20](https://www.youtube.com/watch?v=okG_yeEDoI8),
  [Level 30](https://www.youtube.com/watch?v=ZBxxq-RZ3VM) (`R-web`).
- Capture set: **Levels 20 / 25 / 30**; Level 30 — holdout (`O`).
- Native current-build primary recording: **отсутствует (`B` для TT-P)**.

### Secondary references

| Reference | Что берём | Что не берём | Status |
| --- | --- | --- | :---: |
| Zen Match | capacity/holder semantics, match across intervening tray tiles, grouped insertion, concurrent flights | boosters, blockers, rooms, crowns/goals, monetization | `R-web/R-native-secondary/O` |
| Tile Busters | progression boundary и readable blocker examples | blockers и timed challenge из v1 | `R-web/P` |
| Tile Club | compact early-round cadence | club/tournament/meta | `R-web/P` |
| Tile Family | explicit seven-tile fail и no-timer baseline | story wrapper, exact art/UI | `R-web/P` |

Полное сравнение: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#сравнение-exact-core).

### Числовой feel-разбор

`TT-P` заблокирован, пока все строки не получат `R-native` или `O`.

| Параметр | Proposed value | Status |
| --- | ---: | :---: |
| Visible response after tap | `≤50 ms` | `P/B` |
| Lift phase | `40–80 ms`, scale to `1.04` | `P/B` |
| Tile flight | primary target `220–320 ms`; supplied Zen paths about `300–400 ms` | `R-native-secondary/P/B` |
| Flight arc | normal offset `0.04–0.08` card width | `P/B` |
| Tray rearrange | `140–220 ms` | `P/B` |
| Triple recognition delay | `50–100 ms` | `P/B` |
| Triple removal | `180–260 ms` | `P/B` |
| Covered tap feedback | onset `≤50 ms`, duration `120–180 ms` | `P/B` |
| Board settle | `300–450 ms` scene-visible to input-ready | `P/B` |
| Input during flight | accepted; logical actions serial, flights may overlap | `R-native-secondary/P` |
| Accepted-tap haptic | `selection/light`, `0–20 ms` | `P/B` |
| Triple haptic | `success/soft` at removal onset | `P/B` |
| Last triple -> win | `200–350 ms` | `P/B` |
| Fail recognition -> fail UI | `300–500 ms` | `P/B` |
| Scene visible -> first autoplay tap | `≤650 ms` | `P/B` |
| Scene visible -> first autoplay triple | `≤2.20 s` | `P/B` |

Source/measurement plan и полный parity checklist:
[`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#feel-preliminary-targets).

### Rights boundary

- Не копируем exact layouts, brand, texts, store creative, symbol set, tile
  face, palette, UI, background, booster icons, audio/haptic assets (`O`).
- Собственная замена: Garden Curios symbol set + theme-neutral debug glyphs
  через SkinSpec (`P`).
- Gameplay state не содержит brand/theme fields (`P`).

## Core fantasy

> Снимать верхние слои красивой pile в правильном порядке и удерживать tray
> под контролем, пока каждая собранная тройка мгновенно освобождает место
> (`P`).

## Core loop

> Игрок выбирает открытую плитку; её type атомарно попадает в logical tray,
> а visual tile летит в presentation tray. Третья того же type удаляет
> triple и освобождает occupancy; выборы меняют доступность нижних слоёв и
> запас восстановления (`P`).

## Первый экран и autoplay

- Первый frame: exact initial board/tray geometry без title-card; cover
  совпадает с pre-settle scene (`P`).
- Load: deterministic settle `300–450 ms`, не меняющий state (`P/B`).
- Правило без текста: AutoCursor собирает одну очевидную triple, открывая
  нижнюю плитку и освобождая tray (`P`).
- Autoplay: deterministic no-booster solver witness (`O`).
- Длина: `4–7 s`, `3–6` taps, не более `20%` уровня (`P`).
- Time-to-rule от scene visible: первый tap `≤650 ms`, первая triple
  resolved `≤2.20 s`; overlapping flights разрешены (`P/B`).
- Autoplay не обязан быть единственным/оптимальным; он выбирает trace,
  максимально ясно показывающий exposure -> tray -> triple (`P`).
- Takeover: первый принятый user tap отменяет будущий AutoCursor action
  атомарно (`P`).
- Exact board + tray state продолжается без restart/reshuffle (`O/P`).

## Input contract

| Input | Условие | State transition | Feedback | Status |
| --- | --- | --- | --- | :---: |
| `tapTile(id)` | tile live + exposed + interactive | pure placement/resolve transition | flight + light haptic | `O/P` |
| tap covered tile | tile live, blocked by live cover | no state change | covered cue | `P/B` |
| tap removed/in-flight tile | id no longer board-live | no-op | none | `P` |
| tap background | interactive | no-op | none | `P` |
| exposed tap that reaches fail threshold after resolve | interactive/manual | terminal fail | fail cue | `O/P` |
| first manual tap | autoplay | cancel queued autoplay, apply against exact state | no reset | `O/P` |
| host pause | any interactive/animated state | snapshot + freeze clocks | none | `O/P` |
| restart | manual/fail | exact initial state | load choreography | `P` |

Конфликт с vertical swipe: host владеет gesture threshold. Gameplay tap
принимается только после takeover classification; pointer move,
классифицированный как feed swipe, не создаёт action (`P`).

Accepted taps во время предыдущего flight разрешены (`R-native-secondary/P`).
Каждый action читает уже обновлённое logical state и сериализуется атомарно;
presentation может одновременно показывать несколько flights.

## State machine

```text
boot
  -> static_ready
  -> preparing
  -> board_settle
  -> ready
       -> autoplay
            --safe exposed tap--> autoplay + flight[]
            -> manual
       -> manual
            --safe exposed tap--> manual + flight[]
            --covered tap--> manual + unavailable_feedback
            --failing exposed tap--> fail_feedback
       --board empty + tray empty + animations drained--> win_feedback
  -> completed(success=true | success=false)

host_pause(any interactive/animated state)
  -> paused(snapshot)
  -> previous state

restart(manual | fail)
  -> preparing -> board_settle -> ready
```

### Logical versus visual transition (`P`)

Один accepted tap выполняет чистый logical transition атомарно:

1. удалить tile из `remaining`;
2. обновить exposure counts;
3. увеличить count выбранного type в tray multiset;
4. если count выбранного type стал `3`, вычесть эту triple из multiset;
5. проверить win;
6. проверить fail по утверждённому threshold;
7. добавить presentation events: flight, grouped insertion, rearrange,
   removal, reveal.

Visual order не меняет legality, resolve, fail или content digest. Следующий
input обрабатывается по уже обновлённому state. Presentation projection
хранит/reconstructs exact visible order только для continuity (`P`).

## Win / fail / restart

- Win: `remaining.size === 0 && trayOccupancy === 0` после deterministic
  auto-resolve (`O/P`).
- Fail: post-resolve tray occupancy достигает `7` (`O`).
- Covered tap: не ошибка ресурса и не fail (`P/B`).
- Restart: exact initial remaining/exposure/tray/mode; runtime randomness `0`
  (`O/P`).
- Undo/Shuffle/Hint: отсутствуют в bounded v1 (`O`).
- Timer: отсутствует (`O`).
- Boosters/revive/continue/extra slot: отсутствуют (`O`).
- После fail доступен только deterministic replay того же level (`O`).

### Capacity decision — fail on 7th (`O`)

При семи нарисованных slots существуют два разных правила:

1. **Fail on 7th:** седьмая не удалившаяся tile занимает последний slot и
   немедленно завершает round.
2. **Fail on attempted 8th:** семь unresolved tiles ещё допустимы; fail
   возникает только при следующей placement.

Различие меняет legal/safe move solver. Visual grouped insertion к этому
решению отношения не имеет. Для v1 утверждено:

- `traySlotCount = 7` (`O`);
- `failAtResolvedCount = 7` — седьмая tile, не удалённая triple, завершает
  round (`O`);
- move, который на седьмой placement завершает triple и после resolve
  оставляет меньше `7`, безопасен (`O`);
- solver-safe edge требует `trayOccupancy < failAtResolvedCount`
  (`O`).

Intentional primary fail clip остаётся optional parity evidence для TT-P и
не блокирует schema/solver (`O`).

## Duration budget

- Собственный swipe-round: `30–50 s` (`P`).
- Tile taps: `24–39`, то есть `8–13` triples (`P`).
- Максимальная длительность без принудительного fail: `60 s` (`P`).
- Idle: state ждёт; никаких hidden moves/reshuffle (`O/P`).
- Публичные target levels длиннее; их duration не копируется автоматически
  (`R-web/P`).

## Bounded prototype

### Входит (`P`)

- пять собственных уровней, калиброванных по Triple Tile 20–30;
- один static layered-board rule;
- один tray policy и capacity/fail threshold;
- `4–6` symbol types из собственного набора;
- deterministic autoplay/takeover/pause/restart/completion;
- versioned typed pack, validator, exact solver и reverse generator;
- theme-neutral baseline + один first-party SkinSpec.

### Не входит (`P`)

- exact reference levels/symbols/theme;
- undo/shuffle/hint/revive/extra slot/continue;
- bombs, ice, chain, glue, curtain, hidden faces и producers;
- timers, target-goal levels и score;
- map/meta/story/rooms/tournaments/clubs/currency/ads;
- server factory и rollout.

### Disposable spike

После Review 3 можно разрешить отдельный mocked-state motion harness для
flight/insertion/triple removal. Он не определяет gameplay semantics и
удаляется либо изолируется после TT-P evidence (`P/B`).

### Baseline class

Должны пережить prototype:

- `TripleTileLevelSpecV1`;
- pure `legalMoves/applyAction/isTerminal` над tray multiset;
- canonical `TripleTileEngineStateV1`;
- deterministic solver trace/replay;
- validation/solver/generator receipts;
- presentation projection без theme authority;
- platform lifecycle bridge (`P`).

## Level/content schema

```ts
type TileId = string;
type TileTypeId = string;

interface TileSpecV1 {
  id: TileId;
  type: TileTypeId;
  center: readonly [x: number, y: number]; // normalized board space
  size: readonly [w: number, h: number];
  z: number;
  blockedBy: readonly TileId[]; // canonical exposure authority
}

interface TripleTileLevelSpecV1 {
  schema: "p4g.triple-tile.level";
  version: 1;
  id: string;
  seed: string;
  board: {
    aspect: number;
    overlapRuleVersion: "axis-overlap-v1";
  };
  tray: {
    slotCount: 7; // O
    failAtResolvedCount: 7; // O
  };
  tileTypes: readonly TileTypeId[];
  tiles: readonly TileSpecV1[];
  generator: {
    version: string;
    recipe: string;
    targetBand: "triple-tile-20-30";
  };
}

interface TripleTileEngineStateV1 {
  remaining: ReadonlySet<TileId>;
  liveBlockerCount: ReadonlyMap<TileId, number>;
  trayCounts: ReadonlyMap<TileTypeId, 1 | 2>; // non-zero entries only
  phase: "autoplay" | "manual" | "win" | "fail";
}

interface TripleTilePresentationProjectionV1 {
  visibleTrayOrder: readonly TileId[]; // deterministic animation continuity
  inFlight: readonly TileId[];
}
```

- Version: `1` (`P`).
- Stable identity: digest canonical level JSON без receipts (`P`).
- Seed: обязателен для generated content, runtime после bake не использует
  randomness (`O/P`).
- Initial state: все tiles remaining, tray empty, blocker counts derived
  exactly from `blockedBy` (`P`).
- `insertionPolicy` отсутствует в LevelSpec: visual grouping принадлежит
  SkinSpec/presentation profile и не меняет content digest (`O/P`).
- Canonical tray encoding содержит только ненулевые entries, сортированные
  lexicographically по stable `TileTypeId`; zero entry запрещён, а
  `trayOccupancy` выводится как сумма counts и не входит в state digest
  отдельно (`P`).
- Backward compatibility: engine принимает только declared versions;
  миграция offline (`P`).

### Geometry and exposure authority (`P`)

- `blockedBy` — единственная runtime/solver authority.
- Bake-validator recomputes graph из `center/size/z` и требует exact equality.
- Edge `A -> B` означает: live `A` геометрически перекрывает `B`, поэтому
  `B` unavailable.
- Graph обязан быть DAG; equal-z overlap запрещён.
- Любая положительная area intersection выше epsilon создаёт dependency;
  epsilon и edge-touch policy versioned (`B` до reference capture).
- Hit-test выбирает только exposed tile; decorative shadow не влияет на
  exposure.
- Для каждой covered tile validator вычисляет
  `visibleDiagnosticFraction` центральной theme-neutral symbol region.
- Предварительный readability threshold: `≥0.60` для type, знание которого
  требуется до полного expose (`P/B` до primary device capture).

### Schema invariants (`P`)

- ids уникальны, type существует;
- tile count каждого type кратен `3`;
- total tile count кратен `3`;
- все rectangles finite и внутри board bounds;
- z deterministic, exposure graph acyclic;
- geometry-derived graph равен stored `blockedBy`;
- minimum symbol/tile size и covered diagnostic fraction проходят
  readability gate;
- каждый используемый type представлен минимум `6` tiles и всегда кратен
  `3`;
- initial exposed set не пуст;
- solver подтверждает no-booster clear;
- runtime rule/default digest совпадает с solver receipt.

## Solver / validator

### Authority (`O`)

```text
state = remaining tiles + exposure graph/live blocker counts + tray multiset
```

Solver использует ту же pure transition function, что и engine. Presentation
events и visible tray order не входят в solver state.

### Legal/safe move (`O/P`)

1. tile существует в `remaining` (`O`);
2. у неё нет live blockers (`O`);
3. placement увеличивает count type и автоматически удаляет count `3`
   независимо от visual order (`O`);
4. post-resolve tray occupancy `< 7` (`O`).

Exposed tap, который ведёт в fail, runtime принимает как terminal failing
action; в winning search он не является safe edge (`P`).

### Solver должен доказывать (`O`)

- полную очистку без boosters;
- deterministic witness;
- отсутствие hidden rule changes через единый versioned transition digest;
- корректный terminal fail при tray threshold;
- воспроизводимость canonical state digest после каждого witness step.

### Solver не доказывает

- fun, fairness, readability и reference fidelity;
- что первый найденный witness похож на человеческую игру;
- что shuffle/undo сохраняют solvability;
- taste и право публикации (`O`).

### Search contract (`P`)

- Exact DFS/IDA* с transposition table по
  `remainingBitset + canonicalTrayTypeCounts`, где counts encoded как
  sorted non-zero `[TileTypeId, 1 | 2]` entries.
- Live blocker counts выводятся из remaining; могут кэшироваться, но не
  добавляют state identity.
- Stable tie-break: presentation rank, затем lexicographic `tile.id`;
  rank/version входят в receipt.
- Симметричные tiles одного type можно quotient-ить только при одинаковом
  exposure future; optimization не меняет witness semantics.
- Prototype bound: до `39` tiles (`P`).
- Timeout даёт `unknown`, никогда не `unsolvable`.

### Required fixtures (`P`)

- clear с contiguous triple;
- clear с тремя одинаковыми через другие tray types;
- разные visual permutations одного tray multiset дают одинаковые
  legality, terminal result и transposition key;
- seventh placement completes triple и не fails;
- post-resolve occupancy `7` с mixed counts, например `2 + 2 + 2 + 1`,
  даёт exact fail при approved fail-on-7th policy;
- covered tile no-op;
- multi-layer reveal;
- два winning orders с deterministic chosen witness;
- valid schema, но unsolvable exposure/tray-pressure state;
- mismatch runtime/solver rule digest rejected.

### Difficulty features (`O/P`)

| Feature | Exact definition proposal |
| --- | --- |
| `tileCount` | число board tiles |
| `tileTypeCount` | число distinct `type` |
| `exposureDepth` | longest path в exposure DAG |
| `initialLegalBranching` | число initial exposed solver-safe moves |
| `forcedPrefixLength` | длина prefix, где в каждом state ровно один safe equivalence class |
| `trayPressure` | maximum post-resolve occupancy вдоль witness; также minimum по найденным solutions |
| `recoverySlack` | minimum `failAt - 1 - trayOccupancy` после не-witness safe deviation с возможным recovery |
| `temporaryUnpairedTypeCount` | max distinct tray types с count `1` или `2` |
| `solutionOrderEntropy` | `log2` числа winning equivalence-class traces в bounded enumeration/sample |
| `falseAffordances` | exposed taps, которые legal as input, но terminal-fail/unsolvable |
| `requiredCoveredIdentityDecisionRate` | доля witness decision states, где safe equivalence class меняется в зависимости от type с `visibleDiagnosticFraction` ниже threshold |

Дополнительно receipt хранит mean safe branching, exposure width, count
winning traces/sample confidence, max consecutive non-clearing taps и
minimum required diagnostic fraction (`P`).

## Reverse generation strategy

### Construction (`O/P`)

1. Начать с пустого board/tray и списка будущих triples (`O`).
2. Сгенерировать deterministic forward witness как sequence tile ids,
   сгруппированную/переплетённую по types для target tray pressure (`P`).
3. Добавлять гарантированные triples в обратном порядке (`O`).
4. При reverse placement новая ранняя-forward tile кладётся над уже
   размещёнными поздними-forward tiles, создавая exposure dependencies
   (`O/P`).
5. После каждого добавленного triple валидировать geometry/DAG, проигрывать
   partial witness и запускать exact solver (`O`).
6. Симулировать tray multiset, peak pressure, unpaired types и recovery
   slack (`O`).
7. После полной сборки перечислить winning alternatives, difficulty vector
   и false affordances (`O/P`).
8. Отклонять solver-valid кандидаты, которые тривиальны, нечитаемы,
   монотонны или требуют угадывания hidden/insufficiently-visible symbol
   (`O`).
9. Повторить witness в observable-information model: type ниже
   `visibleDiagnosticFraction` threshold считается неизвестным; если safe
   choice зависит от него, candidate hard-reject (`P`).

### Factory proposal

- Candidate budget: `5,000` attempts на accepted level (`P`).
- Deduplication: canonical exposure graph + quantized geometry + type-orbit,
  без exact reference layouts (`P`).
- Hard filters: schema, readable scale, solvable, target duration/taps,
  fail-policy fixtures, no booster,
  `requiredCoveredIdentityDecisionRate === 0` (`P`).
- Soft rank: band distance по difficulty features + layout balance (`P`).
- Provenance: seed, generator/validator/solver/rule versions, candidate
  digest, reject histogram, witness, feature vector (`O/P`).
- Human review: оператор выбирает final five из blinded solver-valid
  candidates; factory не объявляет taste (`O`).

## Difficulty ladder (`P`)

| Уровень | Новое требование | Target features | Запрещённый скачок |
| ---: | --- | --- | --- |
| 1 | считать exposure -> triple | `24` tiles, `4` types, depth `2–3`, pressure `≤3` | false affordances и tight tray |
| 2 | держать один незакрытый pair | `27–30`, `4–5` types, depth `3`, unpaired `≤2` | рост types и depth одновременно |
| 3 | выбрать между двумя ветвями | `30–33`, `5` types, branching `2–4`, pressure `4–5` | required covered-identity decision |
| 4 | восстановиться после tempting tap | `33–36`, `5–6` types, recovery slack `1–2`, false affordances `1–2` | fail-only branch без visual cue |
| 5 | upper holdout feel | `36–39`, `6` types, depth `4–5`, pressure `5–6`, multiple solutions | новый blocker/booster/rule |

Reference Level 30 — perceived-difficulty holdout, не layout fixture (`P`).
Точные ranges калибруются только после native target recordings (`B`).

## Presentation

- Art: own Garden Curios symbols, light tactile tile faces, calm but не
  reference-identical palette/background (`P`).
- Layout: portrait-first; board `65–72%` card height, tray в нижней safe zone
  (`P/B`).
- Essential motion: lift, arced flight, same-type insertion, stable
  compression, triple removal, reveal (`P/B`).
- Camera: static after one board settle; no per-move zoom (`P/B`).
- Essential sound: light pick, ceramic/wooden landing, soft triple chime;
  sound-off остаётся полон (`P/B`).
- Haptic: light accepted tap; soft success triple; rigid unavailable/fail
  (`P/B`).
- Success: last triple, short board-clear breath, restrained particles
  (`P/B`).
- Error: covered tile does not move; cover/edge pulse shows cause (`P/B`).
- Fail: tray warning differentiated from win by motion, shape and sound,
  not only color (`P/B`).
- Color-independent cues: unique symbol silhouettes + line detail; slot
  warning uses outline/scale, not only red (`P`).
- Low-tier: no blur/particles; same timings, paths and logical projection
  (`P`).
- Cover/live match: exact board/tray geometry before deterministic settle
  (`P`).

## Assets and SkinSpec

| Asset | Source/provenance | Format | Budget | Skin-replaceable | Status |
| --- | --- | --- | ---: | --- | :---: |
| 12 Garden Curios symbols | owned/generated, per-asset provenance | SVG | `≤48 KB` total | yes | `P` |
| Tile face/edge/shadow | code/SkinSpec tokens | CSS/SVG | `≤12 KB` | yes | `P` |
| Background | owned/generated | AVIF/WebP | `≤80 KB` | yes | `P` |
| Tray/slot states | code/SkinSpec | vector/CSS | `≤8 KB` | yes | `P` |
| Pick/land/triple/fail audio | owned/generated | compressed audio | `≤40 KB` total | yes | `P` |
| Haptics | platform semantic bridge | events | n/a | profile only | `P/B` |
| Particles | generated in code | runtime | low-tier off | yes | `P` |

SkinSpec обязан version/provenance-log каждого symbol, tile tokens, states,
tray warning, background, audio/haptics mappings, aspect constraints и
accessibility cues (`P`).

## Runtime/platform integration

- Target: swipe build в real feed shell; Telegram-first WebView (`O/P`).
- Staged boot: static board/cover до `prepareInteractive` (`P`).
- Host pause: freezes logical scheduling and all motion clocks (`O/P`).
- Modes: deterministic autoplay/manual (`O`).
- Completion: ровно один platform bridge event с success/fail + content
  identity (`P`).
- Level selection: host-supplied stable id из five-level pack (`P`).
- Cleanup: timers, animation frames, listeners, audio/haptic handles (`P`).
- Mount/prefetch budgets: берутся из platform authority и измеряются TT-I/Q,
  не задаются этим proposal (`O`).
- External media: отсутствует (`P`).

## Analytics questions

| Product question | Event/observation | Interpretation | Не доказывает |
| --- | --- | --- | --- |
| Считалось ли правило в autoplay? | time-to-first-triple, takeover, first manual safe tap | exposure/tray/triple вероятно поняты | fun |
| Takeover бесшовный? | state digest до/после, cancelled autoplay id | нет reset/hidden action | readability |
| Понятна ли unavailable tile? | repeated covered id, next chosen tile safe | cue изменил выбор | fidelity |
| Считывается ли tray pressure? | peak tray, warning exposure, failAt step | игрок реагирует на capacity | fairness |
| Уровни проходимы человеком? | completion/fail, solve time, deviations | ladder не создаёт cliff | long-term retention |
| Factory попадает в band? | feature receipt + blinded taste disposition | metrics коррелируют с taste | универсальность features |

VISION qualified outcome остаётся завершённой серией, а не отдельным tap,
triple или takeover (`O`).

## Work packages

| ID | Workstream | Scope | Inputs | Outputs | Не трогает | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| `TT-R` | Reference/fidelity | current capture, frame metrics, parity | operator primary/levels/recording | approved reference packet | implementation | operator |
| `TT-G` | Gameplay/schema | exact rule, state, schema, defaults | TT-R decisions | Review 3 brief | code | independent |
| `TT-E` | Engine/tray state | pure transition, tray multiset, replay/pause | approved TT-G | headless runtime/tests | theme/generation | independent |
| `TT-S` | Validator/solver | schema, search, witness, fail fixtures | TT-G schema | solver API/receipts/tests | rendering | independent |
| `TT-F` | Reverse generator/series | candidates, filters, ladder, pack | TT-S API | five-level pack + provenance | taste authority | operator |
| `TT-P` | Motion/camera/skin | mocked projection, feel, SkinSpec | approved TT-R/G | visual harness + own skin | engine rules | operator |
| `TT-I` | Swipe lifecycle | staged boot, takeover, completion, cleanup | TT-E + platform authority | feed build/evidence | solver internals | independent |
| `TT-A` | Analytics | question -> event mapping | TT-G | measurement brief | success authority | operator |
| `TT-Q` | Device fidelity/evidence | device/aspect/parity/runtime | integrated candidate | Review 4 packet | product changes | independent |

После merge документации TT-G/TT-S/TT-E разрешены в отдельной
implementation-ветке. Partial-visibility threshold блокирует финальный
TT-F content acceptance и TT-P, но не logical state contract (`O/B`).

## Typed integration boundaries

- Level: `TripleTileLevelSpecV1`.
- Engine action: `tapTile`, `restart`, `setMode`, `hostPause/resume`.
- Engine state: remaining ids, blocker counts, canonical non-zero tray type
  counts, derived occupancy, phase, completion flag.
- Solver result: solvable/unknown, witness, features, explored states,
  rule digest.
- Solver trace: ordered stable tile ids + state digests.
- Presentation projection: immutable board geometry, exposure/flight,
  visible tray order/grouping и feedback semantics; no solver access.
- Runtime bridge: platform-owned lifecycle/completion.
- Receipt: content digest, seed, generator/validator/solver/rule versions,
  witness, features, reject provenance (`P`).

## Risks

| Risk | Вероятность | Ущерб | Ранний тест | Stop/mitigation |
| --- | --- | --- | --- | --- |
| Triple-tile снова назван Mahjong и получает pair rules | medium | high | taxonomy fixtures/docs review | отдельный schema/mechanic id |
| Fail threshold расходится engine/solver | low после O | high | fail-on-7th fixtures | versioned threshold `7` |
| Presentation order протекает в logic/content digest | medium | high | permutation fixtures + digest comparison | tray multiset authority; order only in projection |
| Solver-valid levels требуют угадывания | high | high | observable-information replay + visibility feature | reject `requiredCoveredIdentityDecisionRate > 0` |
| Symbols сливаются на compact screen | medium | high | debug glyph/aspect test | silhouette/line-detail gate |
| Public walkthrough устарел | high | high | native current build capture | do not start TT-P |
| Autoplay слишком долго показывает triple | medium | high | `≤2.20 s` time-to-rule | shorter obvious opening |
| Concurrent taps читают stale exposure/tray | medium | high | chained input fixtures | atomic logical transition |

## Открытые решения

| Вопрос | Почему блокирует | Кто решает | Trigger | Status |
| --- | --- | --- | --- | :---: |
| Triple Tile — primary? | определяет fidelity | operator | Review 2 | `O` |
| Levels 20 / 25 / 30? | difficulty/recording | operator | Review 2 | `O` |
| `7th` или `8th` fail? | schema/solver/engine | operator | Review 3 | `O: fail on 7th` |
| Grouped insertion или stable append? | presentation motion only | primary recording | before TT-P | `R-native-secondary/B` |
| Concurrent taps during flight? | engine cadence | supplied recording | Review 2 | `R-native-secondary/P` |
| Minimum covered diagnostic fraction? | generator fairness/readability | operator/device | before TT-F/TT-P | `P/B` |
| Какой covered feedback? | fidelity/input | operator/reference | before TT-P | `B` |
| Какие boosters explicitly excluded? | bounded rule | operator | Review 2 | `O: all` |
| Haptic/audio semantics? | device fidelity | operator | before TT-P | `B` |
| Round `30–50 s`, `24–39` taps? | feed fit/ladder | operator | Review 3 | `P/B` |

## Acceptance

### Review 2 logic disposition

- [x] Taxonomy split принят.
- [x] Primary/secondary утверждены.
- [x] Target captures `20 / 25 / 30` утверждены.
- [x] Secondary native recording приложен и разобран.
- [x] Boosters/crowns/meta исключены.
- [x] Exact fail threshold: post-resolve occupancy `7` (`O`).

### Review 3 gameplay

- [ ] Pure transition, tray multiset и exposure authority однозначны.
- [ ] Win/fail/restart воспроизводимы.
- [ ] Autoplay/takeover следуют brief.
- [ ] Нет hidden rules/defaults.
- [ ] Independent reviewer дал dispositions.

### Content

- [ ] Schema versioned и content identity stable.
- [ ] Validator покрывает invalid graph/type counts/readability.
- [ ] Solver покрывает solvable/unsolvable/fail fixtures.
- [ ] Reverse generator проверяется после каждого triple.
- [ ] Five-level ladder различим и не копирует reference layouts.

### Platform/presentation

- [ ] Primary native captures `20 / 25 / 30` приложены.
- [ ] Haptic/audio expectations записаны.
- [ ] Staged boot, pause/resume, cleanup и single completion проверены.
- [ ] Compact/tall gameplay читаем без звука и без одного цвета.
- [ ] Feel-table закрыта `R/O` до TT-P.
- [ ] Parity checklist + side-by-side приняты на устройстве.
- [ ] Before/after GIF приложены к каждой feel-итерации.

## Kill criteria (`P`)

- Current target reference использует другой core loop либо обязательные
  special rules в captures `20 / 25 / 30`.
- Первый autoplay triple не укладывается в утверждённый time-to-rule.
- Менее `20%` solver-valid candidates получают human-accept после трёх
  generator-итераций без ручного ремонта.
- Compact aspect требует symbols ниже readability minimum или скрывает
  overlap.
- Доля candidates с `requiredCoveredIdentityDecisionRate > 0` не снижается
  hard filters.
- Deterministic runtime replay расходится с solver state digest.

## Evidence index

| Evidence | Path/URL | Version/digest | Disposition |
| --- | --- | --- | --- |
| Reference packet | [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md) | snapshot 29.07.2026 | Review 1/2 proposal |
| Triple Tile listing | [App Store](https://apps.apple.com/us/app/triple-tile-match-puzzle-game/id1572661625) | observed `2.75.03` | identity/market only |
| Public Level 20 | [YouTube](https://www.youtube.com/watch?v=okG_yeEDoI8) | unknown build | provisional lower anchor |
| Public Level 30 | [YouTube](https://www.youtube.com/watch?v=ZBxxq-RZ3VM) | unknown build | provisional upper holdout |
| Supplied Zen Match Level 17 | operator-provided; binary not committed | SHA-256 `18101e019f8a2b2f6241bff67f16d9b16eae1ddf2fac9e126651d3e96e4e68fb` | current secondary behavior; closes concurrent taps and shows grouped presentation |
| Independent Review 1/2 | [`REVIEW-INDEPENDENT-2026-07-29.md`](REVIEW-INDEPENDENT-2026-07-29.md) | `a52b52e` / merged via `a35a8a6` | accept as research; F1–F4 incorporated |
| Primary native captures `20 / 25 / 30` | operator-provided | — | blocking TT-P |
| Primary intentional fail clip | operator-provided | — | optional TT-P parity evidence |

## Final decision

- Decision: **Review 3 logic GO; solver-first development authorized**.
- Approved: Triple Tile primary, Zen Match secondary, captures
  `20 / 25 / 30`; fail-on-7th; no boosters/crowns/meta (`O`).
- Next for logic: TT-G → TT-S → TT-E in a separate implementation branch.
- Next for presentation: full primary feel packet and haptic/audio decision.
- Explicitly deferred: all gameplay/presentation code, boosters, blockers,
  meta, server factory, rollout.
