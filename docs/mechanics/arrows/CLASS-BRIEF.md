# Class Brief: `arrows-v1`

- Дата: **29.07.2026**
- Статус: **approved-for-prototype**
- Владелец taste-решения: **оператор**
- Автор brief: **Codex**
- Независимый reviewer: **не назначен**
- Reference packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)

> Brief описывает baseline класса. Он не разрешает rollout и не подменяет
> release brief конкретного playable.

## VISION-триаж

- Принцип/ступень VISION: фабрика от сильного эталона; новый first-party
  puzzle-class для swipe-ленты.
- Продуктовая неопределённость: можем ли мы воспроизводимо пройти путь
  `reference -> typed level -> solver -> generator -> autoplay -> takeover`.
- Почему допустимо сейчас: Arrows выбран оператором после Review 2.
- Решение оператора: polyline baseline; пять собственных уровней; Level 15
  как holdout.
- Что документ не разрешает: начало расходящихся реализаций, публикацию,
  копирование layout/assets референса.

## Цель

На целевом устройстве оператор не может назвать, чем 30-секундный
side-by-side прототипа и уровней 10–15 Arrows – Puzzle Escape различаются по
темпу ухода стрелки, ясности blocked feedback, camera framing и ощущению
сложности, при собственной визуальной идентичности прототипа.

## Non-goals

- Мета, экономика, реклама, progression map, магазин и liveops.
- Копирование точных уровней 10–15 или фирменных assets.
- Телепорты, движущиеся blockers, timers и model-generated levels.
- Доказательство «интересности» только solver-метриками.
- Универсальный Tap Away engine для всех будущих вариантов до baseline.

## Точный эталон

### Primary reference

- Название: **Arrows – Puzzle Escape**
- Listing snapshot: App Store `0.20.1`, наблюдение 29.07.2026; build в ролике
  неизвестен.
- Ссылка: [App Store](https://apps.apple.com/us/app/arrows-puzzle-escape/id6748397500)
- Screen recording: [walkthrough levels 1–30](https://www.youtube.com/watch?v=yePg-DPqfeA)
- Диапазон уровней: **10–15**, Level 15 в ролике явно подтверждён.

### Secondary references

| Референс | Что берём | Что не берём |
| --- | --- | --- |
| Existing Pins class | tap primitive, deterministic trace, staged boot, completion | rules, art, level model |
| Platform SkinSpec | отделение state от visual identity | буквальную тему выбранного референса |

### Числовой feel-разбор

Полная таблица и происхождение значений:
[`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#числовой-feel-разбор).

| Параметр | Число | Статус |
| --- | ---: | --- |
| Exit speed | `36` grid units/s nominal, `32–40` target | native measured |
| Exit duration | path-dependent, measured `375–700 ms` | native/public measured |
| Small-board load fit | `450 ± 80 ms` | Level 15 measured |
| Large-board overview/play zoom | `1,967 ms + 2,233 ms` | Level 43 native measured |
| Visible tap response | `≤33 ms` | native measured |
| Tap ripple | `200 ± 33 ms` | native measured |
| Tap haptic | `0–20 ms`, `selection/light` | operator intent / device review |
| Blocked haptic | `0–33 ms` from visual onset, `error/rigid` | operator intent / device review |
| Blocked card wash | `533 ± 33 ms` | native measured |
| Blocked arrow state | persistent coral/red until removal/restart | native measured |
| Third error -> fail modal | `1,033 ms`; settle `200 ms` | native measured |

### Reference parity checklist

Review 4 использует checklist из
[`REFERENCE-PACKET.md`](REFERENCE-PACKET.md#reference-parity-checklist).

### Rights boundary

- Не копируем exact layouts, бренд, тексты, store creative, музыку, звуки и
  visual assets.
- Собственные replacements: theme-neutral shapes + первый SkinSpec.
- Открытый taste-вопрос: насколько близко baseline palette повторяет
  тёмную линию на светлом фоне; ответ не должен менять readability contract.

## Core fantasy

> Увидеть скрытый порядок в переплетённой схеме и одним точным tap
> освобождать поле, наблюдая, как целая стрелка уверенно уходит наружу.

## Core loop

> Каждые 1–3 секунды игрок выбирает стрелку: свободная улетает и меняет граф
> зависимостей; заблокированная ясно отвечает ошибкой и отнимает жизнь.

## Первый экран и autoplay

- Первый frame: чистое поле в `camera_intro.start`, без title-card; cover
  совпадает с этой геометрией.
- Camera intro: small board выполняет `450 ms` fit; большое поле показывает
  overview/play choreography. HUD проявляется в конце camera intro.
- Правило считывается без текста: AutoCursor нажимает очевидно свободную
  стрелку; та уходит по направлению наконечника и открывает следующую.
- Autoplay: deterministic solver trace, `3` успешных хода без ошибок.
- Длина autoplay после camera intro: `4–7 s`, не более `25%` ожидаемого
  решения.
- Оптимальность: legal и воспроизводимый trace; среди равных ходов выбирает
  наиболее визуально объясняющий зависимость.
- Takeover: первый принятый user tap атомарно отключает AutoCursor.
- Состояние: exact current state сохраняется; уже начатая autoplay-анимация
  завершается перед следующим user action.

## Input contract

| Input | Условие | State transition | Feedback |
| --- | --- | --- | --- |
| `tapArrow(id)` legal | `ready/manual`, нет активного exit | `arrow -> exiting -> removed` | light haptic, exit motion |
| `tapArrow(id)` blocked | `ready/manual`, lives `>1` | lives `-1`, geometry unchanged | tap + error haptic, blocked cue |
| `tapArrow(id)` blocked | lives `===1` | `fail` after feedback | blocked cue, fail feedback |
| tap background | manual | no-op | none |
| first user tap | autoplay | cancel queued autoplay; process tap against exact state | no reset |
| host pause | any animated state | snapshot + pause animation clocks | none |
| restart | fail/manual | initial state | load fit |

Конфликт с вертикальным swipe: arrow tap принимается только после host
takeover threshold; pointer displacement выше host threshold остаётся feed
swipe и не создаёт игрового хода. Конкретный threshold берётся из platform
runtime authority, не дублируется в классе.

## State machine

```text
boot
  -> static_ready
  -> preparing
  -> camera_intro
  -> ready
       -> autoplay
            -> exiting -> autoplay
            -> manual
       -> manual
            -> exiting -> manual
            -> blocked_feedback -> manual
            -> blocked_feedback -> fail
       -> win_feedback
  -> completed(success=true | success=false)

host_pause(any interactive state) -> paused(snapshot) -> previous state
restart(fail | manual) -> preparing -> ready
```

Инварианты:

- одновременно exit-анимируется не более одной стрелки;
- gameplay input заблокирован до конца camera intro;
- input lock действует от принятия хода до завершения exit/error feedback;
- camera intro не меняет logical state;
- completion emitted ровно один раз;
- pause/resume не меняет solver trace или remaining duration.

## Win / fail / restart

- Win: все стрелки `removed`.
- Fail: третья blocked attempt расходует последнюю жизнь.
- Незавершающая ошибка: blocked tap при `lives > 1`.
- Restart: exact initial level, `3` lives, error marks cleared; выполняется
  camera intro, autoplay не перезапускается после manual takeover.
- Undo: отсутствует в bounded prototype.
- Hint: отсутствует в первом prototype; solver API оставляет hook.
- Таймер: отсутствует.
- Ресурс: `3` lives.

## Duration budget

- Целевая длительность manual: `20–45 s`.
- Целевое число успешных действий: `8–22`.
- Максимальная длительность: `60 s` без принудительного fail.
- Idle policy: gameplay ждёт; host может вернуть autoplay/demo только новым
  раундом, но не скрытым ходом в manual state.

## Bounded prototype

### Входит

- Пять собственных seed-уровней в difficulty band референсов 10–15.
- Один polyline arrow type, если утверждён Review 3.
- Three-life error policy.
- Exit, persistent blocked feedback и adaptive intro camera.
- Deterministic autoplay/takeover/pause/restart/completion.
- Typed pack, validator, solver и bounded reverse generator.

### Не входит

- Точные layouts референса, meta/progression, ads, currency и hint UX.
- Special tiles, teleport, moving blockers, timed mode.
- Несколько skins в первой evidence-итерации.
- Server generation и публикационный pipeline.

### Disposable spike

Разрешён отдельный geometry harness для polyline path-following animation и
head-ray collision fixtures. Spike не становится runtime и удаляется после
фиксации семантики.

### Baseline class

Должны пережить прототип:

- versioned `LevelSpec`;
- чистые `legalMoves/applyAction/isTerminal`;
- deterministic trace и replay;
- engine state/action;
- presentation projection без theme fields;
- platform lifecycle bridge;
- validation receipt и difficulty features.

## Level/content schema

```ts
type Direction = "up" | "right" | "down" | "left";
type GridPoint = readonly [x: number, y: number];

interface ArrowSpecV1 {
  id: string;
  path: readonly GridPoint[]; // tail -> head; Manhattan-adjacent
  exitDir: Direction;         // equals final path segment direction
}

interface ArrowsLevelSpecV1 {
  schema: "p4g.arrows.level";
  version: 1;
  id: string;
  seed: string;
  bounds: { cols: number; rows: number };
  lives: 3;
  arrows: readonly ArrowSpecV1[];
  generator: {
    version: string;
    recipe: string;
    targetBand: "reference-10-15";
  };
}
```

- Version: `1`.
- Stable identity: digest canonical JSON без receipts.
- Seed: обязателен для generated levels; не влияет на runtime после bake.
- Initial state: все arrows live, lives `3`, camera derived from live bounds.
- Allowed randomness: только factory candidate search; runtime randomness `0`.
- Backward compatibility: engine читает только явно поддержанные versions;
  миграция контента выполняется offline.

### Schema invariants

- ids уникальны;
- path имеет минимум `2` точки для polyline contract;
- соседние точки Manhattan-adjacent, точки path уникальны;
- final segment согласован с `exitDir`;
- initial occupancies не пересекаются и находятся в bounds;
- head exit-ray intersection вычисляется дискретно и детерминированно;
- минимум один initial legal move;
- solver подтверждает solvability.

## Solver / validator

- Validator доказывает schema/geometry invariants и отсутствие initial overlap.
- Solver доказывает существование порядка удаления всех стрелок без ошибок.
- Solver не доказывает fun, визуальную читаемость и соответствие target band.
- Legal move: открытый ray от head по `exitDir` до bounds не пересекает
  occupancy других live arrows с fixed stroke clearance.
- Dependency edge `A -> B`: exit-ray `A` пересекает path `B`, поэтому `A`
  становится legal только после удаления `B`.
- Terminal: `remaining === 0`; fail policy не участвует в solvability.
- Solvability: хотя бы один all-remove trace.
- Difficulty: `arrowCount`, occupied cells, legal branching, forced prefix,
  dependency depth/width, false affordances, turns, solution-order entropy,
  minimum camera scale.
- Deterministic trace: lexicographic tie-break по stable arrow id после
  presentation-aware ranking, зафиксированной версией solver.
- Budget: exact search с memoized live-set для prototype max `22` arrows;
  soft candidate budget задаёт factory, не solver correctness.
- Reject: invalid geometry, overlap, no initial move, unsolvable, trivial
  dependency graph, difficulty band miss, duplicate canonical graph/layout.

## Generation strategy

- Construction: reverse placement from empty по witness order.
- Candidate budget: provisional `2,000` attempts на один accepted level и
  `250 ms` median offline target; hard CI budget задаётся после spike.
- Deduplication: canonicalized geometry under translation + rotations/reflection
  только если skin не кодирует orientation.
- Difficulty targeting: hard ranges по features + soft score к reference band.
- Series: пять уровней с монотонным ростом dependency depth/visual load, без
  одновременного скачка более чем двух features.
- Provenance: seed, generator/solver versions, reject histogram, witness trace.
- Human review: выбор финальных пяти из минимум `5` solver-valid кандидатов на
  ступень; factory не объявляет taste.

## Difficulty ladder

| Уровень | Новое требование | Target features | Запрещённые скачки |
| ---: | --- | --- | --- |
| 1 | считать exit rule | `8–10` arrows, legal `2–3`, depth `2–3` | мелкий scale, ложные сложные силуэты |
| 2 | увидеть unblock | `10–12`, forced prefix `1–2`, depth `3` | резкий рост turns и density вместе |
| 3 | выбрать ветвь | `12–15`, branching `2–3`, depth `3–4` | один очевидный полный коридор |
| 4 | удержать dependency chain | `15–18`, depth `4–5`, scale `≥0.9×` | scale ниже readable minimum |
| 5 | верх reference band | `18–22`, depth `5–6`, legal `2–4` | новый rule/special tile |

Уровень 15 референса используется как holdout: визуально и по perceived
difficulty, но не как layout fixture.

## Presentation

- Art: тёмные монолинии, нейтральный светлый фон, едва заметная точечная
  сетка; own palette/fonts/iconography.
- Layout: portrait-first, игровое поле центрировано, HUD вторичен.
- Essential animation: path-following exit со скоростью `36` grid units/s,
  blue accent decay и tap ripple; small-board fit `450 ms`; adaptive
  overview/play intro для больших полей.
- Essential sound: optional light tick/air whoosh; sound-off полон.
- Haptic: light/selection на tap; error/rigid на blocked.
- Success: отдельный короткий state после последнего exit.
- Error: geometry остаётся неподвижной; card wash `533 ms`, выбранная
  polyline остаётся coral/red, одно сердце сразу становится пустым.
- Fail: modal начинается примерно через `1,033 ms` после третьего error onset
  и settles за `200 ms`; рекламный `Play On` из референса не копируется.
- Color-independent cues: общий luminance wash + опустевшее сердце; prototype
  добавляет краткий stroke-weight pulse без изменения geometry.
- Low-tier: no blur, тот же duration/trajectory; camera transform сохраняется.
- Cover/live match: exact initial camera and geometry.

## Assets

| Asset | Source/provenance | Format | Budget | Skin-replaceable |
| --- | --- | --- | ---: | --- |
| Arrow/grid primitives | generated in code | vector/canvas | `0` external bytes | yes |
| Haptic profile | platform bridge | semantic events | n/a | no |
| Optional tap/whoosh | owned/generated, rights logged | compressed audio | `≤30 KB` total | yes |
| Success particles | code-generated | runtime | low-tier off | yes |

## Runtime/platform integration

- Target: swipe build в реальном feed shell; Telegram-first WebView.
- Staged boot: static geometry/cover до `prepareInteractive`.
- Host pause: замораживает logical и animation clocks.
- Modes: deterministic autoplay и manual.
- Completion: один bridge event с success/fail и level identity.
- Level selection: host-supplied stable level id из пяти-level pack.
- Cleanup: timers, animation frames, listeners, audio/haptic handles.
- Mount/prefetch budgets: inherited from playable/feed authority; evidence
  измеряется в AR-I/Q, не задаётся произвольным числом здесь.
- External media: отсутствует.

## Analytics questions

| Вопрос | Event/наблюдение | Интерпретация | Не доказывает |
| --- | --- | --- | --- |
| Считывается ли autoplay? | takeover time, первый manual move legal | вероятно правило считано | удовольствие |
| Срабатывает ли takeover? | state digest до/после takeover | нет reset/скрытого хода | понятность поля |
| Понятна ли ошибка? | repeat same blocked id, recovery next move | feedback помог изменить выбор | fidelity сам по себе |
| Проходят ли серию? | completion/fail, errors, solve time по level | ladder не создаёт cliff | долгий retention |
| Генератор попадает в band? | feature receipt + human disposition | machine filters коррелируют с taste | универсальность metric |

## Work packages

| ID | Workstream | Scope | Inputs | Outputs | Не трогает | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| `AR-R` | Reference | запись, feel, parity | sources/operator taste | reference packet | implementation | operator |
| `AR-G` | Gameplay | rule/state/schema | AR-R | approved brief | code | operator |
| `AR-E` | Engine | transitions/replay/pause | approved AR-G | headless runtime/tests | theme/generation | independent |
| `AR-S` | Solver | validator/search/trace | schema fixtures | solver receipt/tests | rendering | independent |
| `AR-F` | Factory | reverse candidates/series | AR-S API | pack + receipts | taste declaration | operator |
| `AR-P` | Presentation | motion/camera/haptic | state projection/AR-R | visual harness + skin | engine rules | operator |
| `AR-I` | Integration | feed lifecycle | AR-E + runtime authority | swipe build/evidence | solver internals | independent |
| `AR-A` | Analytics | measurement mapping | AR-G | event brief | success authority | product |
| `AR-Q` | QA | parity/runtime/device | integrated candidate | Review 4 packet | product changes | independent |

## Typed integration boundaries

- Level: `ArrowsLevelSpecV1`.
- Engine action: `tapArrow`, `restart`, `setMode`, `hostPause/resume`.
- Engine state: live ids, lives, mode, phase, active animation, completion flag.
- Solver result: solvable, witness trace, feature vector, explored states.
- Solver trace: ordered stable arrow ids + solver version.
- Presentation projection: immutable geometry, per-arrow visual phase, camera
  target, lives, feedback semantic; no solver access.
- Runtime bridge: platform-owned lifecycle/completion interface.
- Receipt: level digest, generator/validator/solver versions, seed, features,
  witness, reject provenance.

## Risks

| Risk | Вероятность | Ущерб | Ранний тест | Stop/mitigation |
| --- | --- | --- | --- | --- |
| Exit ошибочно реализован rigid-body переносом | medium | high | U-polyline frame fixture | path-following renderer до juice |
| Сложность сводится к density | high | high | feature matrix + blinded rank | dependency filters, human selection |
| Intro zoom задерживает feed hook | medium | high | time-to-rule на пяти small boards | collapse small-board path до `450 ms` |
| Error cue кажется punitive | medium | medium | три профиля + taste review | отделить tap и fail cadence |
| Solver state space растёт | low/medium | medium | max-22 benchmark | dependency DAG pruning/memoization |
| Swipe/tap конфликт | medium | high | feed-shell gesture test | host owns gesture threshold |

## Review 3 dispositions

| Вопрос | Решение | Evidence / follow-up |
| --- | --- | --- |
| Polyline или single-cell | **Polyline с первого baseline** | operator approve + native path-following exit |
| Blocked feedback | `≤33 ms` onset, `533 ms` wash, persistent red arrow, `-1` heart | native recording |
| Camera | adaptive intro; small `450 ms`, large overview/play `1.97 s + 2.23 s`; no manual pan/pinch в bounded prototype | public Level 15 + native Level 43 |
| Five-level policy | пять собственных уровней, band 10–15; Level 15 holdout | operator approve |
| Haptic | `selection/light` на tap, затем `error/rigid` на blocked | device intensity принимается Review 4 |

Открытых blocking-вопросов gameplay/schema для начала AR-E/S/P/A нет.

## Acceptance

### Gameplay

- [ ] Core loop, head-ray collision и path-following exit подтверждены
      fixtures.
- [ ] Win/fail/restart воспроизводимы.
- [ ] Autoplay/takeover следуют brief без reset.
- [ ] Нет скрытых правил.

### Content

- [ ] Schema versioned, state/seed воспроизводимы.
- [ ] Validator покрывает invalid geometry.
- [ ] Solver покрывает valid/unsolvable fixtures.
- [ ] Пять уровней различимы по ladder и остаются в target band.

### Platform

- [ ] Staged boot, pause/resume и cleanup проходят runtime checks.
- [ ] Completion отправляется ровно один раз.
- [ ] Cover совпадает с первым live frame.
- [ ] Feed swipe не создаёт tap.

### Presentation

- [ ] Tall и compact проверены.
- [ ] Gameplay читаем без звука и без цвета как единственного cue.
- [ ] Exit, blocked feedback и adaptive camera пройдены на устройстве.
- [ ] Low-tier path сохраняет timing и trajectory.

### Fidelity

- [x] Feel-таблица закрыта числами до старта затронутых workstream.
- [ ] Parity checklist пройден; delta list приложен.
- [ ] Оператор принял real-time side-by-side на устройстве.
- [ ] Before/after GIF приложены к каждой feel-итерации.

### Evidence

- [ ] Reference packet и class brief приложены.
- [ ] Solver/validator receipts и deterministic replay приложены.
- [ ] Visual proof, runtime checks и reference delta list приложены.
- [ ] Независимый reviewer дал dispositions.

## Kill criteria

- После трёх generator-итераций менее `20%` solver-valid кандидатов получают
  human-accept без ручного ремонта.
- Single-cell ограничение сохраняется, но side-by-side показывает
  систематически другой core feel.
- Autoplay не объясняет правило за `7 s` или takeover нельзя сделать без
  state discontinuity.
- Exit/camera motion не достигают читаемости на target WebView без нарушения
  runtime budgets.

## Evidence index

| Evidence | Path/URL | Digest/version | Reviewer disposition |
| --- | --- | --- | --- |
| Reference packet | [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md) | snapshot 29.07.2026 | Review 3 accepted |
| Public walkthrough | [YouTube](https://www.youtube.com/watch?v=yePg-DPqfeA) | external | source accepted |
| Native feel/error clip | operator recording `2026-07-29 13.13.06.mp4` | SHA-256 `b9dd0215…4953f` | Review 3 accepted |
| Solver/visual/runtime evidence | produced by AR-S/P/I/Q | — | pending |

## Final decision

- Decision: **approved-for-prototype / ready for parallel implementation**
- Operator note: polyline approve; own levels; Level 15 holdout.
- Follow-up: open AR-E/S/P/A in parallel; AR-F follows solver API.
- Explicitly deferred: rollout, meta, hints, special arrows, server factory.
