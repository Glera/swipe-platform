# Class Brief: `arrows-v1`

- Дата: **30.07.2026**
- Статус: **operator-revision v3 / re-review-required** — A1–A2 независимого
  Review 3 сохраняются; A3 camera/input, A4 manual auto-move и A5
  launch/presentation boundary пересмотрены оператором и требуют нового proof
  до admission
- Владелец taste-решения: **оператор**
- Автор brief: **Codex**
- Независимый reviewer: **Claude** —
  [`REVIEW-3-INDEPENDENT-2026-07-29.md`](REVIEW-3-INDEPENDENT-2026-07-29.md)
- Reference packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)

> Brief описывает baseline класса. Он не разрешает rollout и не подменяет
> release brief конкретного playable.
>
> Operator corrections 30.07.2026: baseline обязан поддерживать manual mode с
> pan/pinch-to-zoom и кнопку одного auto-move с расходом жизни. Autoplay
> является только host-owned entry behavior Swipe-платформы: standalone
> factory sample всегда открывается в manual mode и не содержит Lab/proof
> chrome внутри gameplay. Предыдущий запрет manual pan/pinch отменён.

## VISION-триаж

- Принцип/ступень VISION: фабрика от сильного эталона; новый first-party
  puzzle-class для swipe-ленты.
- Продуктовая неопределённость: можем ли мы воспроизводимо пройти путь
  `reference -> typed level -> solver -> generator -> autoplay -> takeover`.
- Почему допустимо сейчас: Arrows выбран оператором после Review 2.
- Решение оператора: polyline baseline; пять собственных уровней; Level 15
  как holdout.
- Что документ не разрешает: отклонение параллельных реализаций от typed
  boundaries, публикацию, копирование layout/assets референса.

## Цель

На целевом устройстве оператор не может назвать, чем 30-секундный
side-by-side прототипа и уровней 10–15 Arrows – Puzzle Escape различаются по
темпу ухода стрелки, ясности blocked feedback, camera framing и ощущению
сложности, при собственной визуальной идентичности прототипа.

## Non-goals

- Мета, экономика, реклама, progression map, магазин и liveops.
- Копирование точных уровней 10–15 или фирменных assets.
- Телепорты, движущиеся blockers, timers и model-generated levels.
- Двухфазная large-board camera choreography и принудительный post-move
  reframe в первых пяти уровнях.
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
| Exit screen speed | `1.20` gameplay-card heights/s nominal, `1.05–1.35` target | native measured / presentation target |
| Exit duration | path-dependent, measured `375–700 ms` | native/public measured |
| Small-board load fit | `450 ± 80 ms` | Level 15 measured |
| Large-board overview/play zoom | `1,967 ms + 2,233 ms` | Level 43 native measured |
| Visible tap response | `≤33 ms` | native measured |
| Tap ripple | `200 ± 33 ms` | native measured |
| Tap haptic | `0–20 ms`, `selection/light` | operator intent / device review |
| Blocked haptic | `0–33 ms` from visual onset, `error/rigid` | operator intent / device review |
| Blocked card wash | `533 ± 33 ms` | native measured |
| Blocked motion | head travels to nearest blocker, then arrow returns to authored path | operator correction; re-review required |
| Blocked arrow state | only the latest accepted blocked selection is coral/red; next accepted different arrow clears it | operator correction; re-review required |
| Manual tap during exit | next engine step; concurrent visual exits | Review 3 target (`P`), overlap-case absent in recording |
| Tap during blocked wash | discarded for `533 ms`, no queue/no life loss | Review 3 target (`P`) |
| Repeat same red arrow | after wash costs another life | approved error default (`O/P`) |
| Third error -> fail modal | `1,033 ms`; settle `200 ms` | native measured |
| Manual camera | one-finger pan + pinch-to-zoom; clamped readable bounds | operator correction; re-review required |
| Manual auto-move | one deterministic legal move costs one life | operator correction; last-life policy pending re-review |

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

## Первый экран и launch autoplay

- Первый frame: чистое поле в `camera_fit.start`, без title-card; cover
  совпадает с этой геометрией.
- Camera: каждый из пяти уровней выполняет один `450 ms` fit; HUD проявляется
  в конце fit.
- Standalone factory sample и direct playable URL стартуют в `manual`.
  Технические label, status, counters, start/stop/reset и proof metadata
  принадлежат Lab shell и не рендерятся внутри gameplay viewport.
- Только Swipe host может явно запросить launch autoplay через runtime API.
  Без host-сигнала autoplay не стартует и его controls не появляются.
- В launch autoplay правило считывается без текста: AutoCursor нажимает
  очевидно свободную стрелку; та уходит по направлению наконечника и открывает
  следующую. Число ходов и stop-condition принадлежат versioned host policy,
  а не LevelSpec или фабрике.
- Time-to-rule: первый autoplay tap принят за `≤650 ms`, первый exit полностью
  завершён за `≤1,350 ms` от первого live frame, когда host запросил launch
  autoplay.
- Оптимальность: legal и воспроизводимый trace; среди равных ходов выбирает
  наиболее визуально объясняющий зависимость.
- Takeover: первый принятый user tap атомарно отключает AutoCursor.
- Состояние: exact current state сохраняется; in-flight autoplay exit
  продолжается визуально, а user tap обрабатывается сразу по уже обновлённому
  logical state.
- После takeover игрок остаётся в manual mode; pan и pinch-to-zoom не
  перезапускают autoplay и не меняют logical state.
- Кнопка manual auto-move запрашивает ровно следующий deterministic legal
  solver move и расходует одну жизнь. Поведение при одной оставшейся жизни
  должно быть принято отдельным A4 verdict до реализации/admission.

## Input contract

| Input | Условие | State transition | Feedback |
| --- | --- | --- | --- |
| `tapArrow(id)` legal | `autoplay/manual`, wash inactive, включая active exits | atomically remove from `live`, append visual exit | light haptic, exit motion |
| `tapArrow(id)` blocked | `manual`, lives `>1`, wash inactive | lives `-1`; path-following travel to nearest blocker and exact return; enter wash | tap + error haptic, blocked cue |
| `tapArrow(id)` blocked | `manual`, lives `===1`, wash inactive | same travel/return, then `fail` | blocked cue, fail feedback |
| tap live/red arrow during blocked wash | wash active | discarded; no queue/state change | none |
| tap same red blocked arrow after wash | wash inactive | another blocked attempt, lives `-1` | wash/haptics restart |
| tap different live arrow after blocked wash | wash inactive | clear previous red before processing the accepted tap | selected arrow feedback |
| tap exiting/removed arrow | manual | no-op | none |
| tap background | manual | no-op | none |
| first user tap | autoplay | cancel queued autoplay; process tap against exact state | no reset |
| `panCamera(delta)` | manual, camera gesture accepted | update clamped camera translation; cancel pending arrow tap | direct camera motion |
| `pinchCamera(scale, focalPoint)` | manual, camera gesture accepted | update clamped camera scale around focal point; cancel pending arrow tap | direct camera motion |
| `requestAutoMove()` | manual, lives available, wash inactive | lives `-1`; execute exactly one deterministic legal solver move | heart decrement + normal exit motion |
| host pause | any animated state | snapshot + pause animation clocks | none |
| restart | fail/manual | initial state | load fit |

Gesture arbitration: touch, начатый внутри interactive board, сначала является
tap-candidate. Пересечение camera-pan threshold отменяет tap и передаёт
gesture камере; pinch всегда принадлежит камере. Feed swipe остаётся
platform-owned gesture и не должен случайно срабатывать во время принятого
camera gesture. Конкретные thresholds и правила arena берутся из platform
runtime authority, не дублируются в классе; их совместимость доказывается в
реальном feed shell.

## State machine

```text
boot
  -> static_ready
  -> preparing
  -> camera_fit
  -> ready
       -> autoplay
            --legal tap--> autoplay + exit_visual[]
            -> manual
       -> manual
            --legal tap--> manual + exit_visual[]
            -> blocked_feedback -> manual
            -> blocked_feedback -> fail
       --live empty--> draining_exits
            --active exits empty--> win_feedback
  -> completed(success=true | success=false)

host_pause(any interactive state) -> paused(snapshot) -> previous state
restart(fail | manual) -> preparing -> camera_fit -> ready
```

Инварианты:

- legal tap удаляет arrow из logical occupancy в том же engine step, в котором
  создаётся visual exit;
- visual exits могут перекрываться; глобального exit-lock и input queue нет;
- следующий manual tap обрабатывается в следующем engine step по обновлённому
  live-set;
- blocked feedback единственный gameplay-action lock: входные tap и
  `requestAutoMove` отбрасываются на `533 ms`, а не queue-ятся; camera
  pan/pinch остаются доступны;
- blocked travel использует то же постоянное arc-length stroke-window, что и
  успешный exit: head доходит до ближайшего чужого blocker, затем окно
  возвращается по route до exact authored path;
- только последняя принятая blocked selection может оставаться красной;
  следующий принятый tap по другой live arrow очищает предыдущую отметку;
- gameplay input заблокирован до конца camera fit;
- camera fit не меняет logical state;
- manual camera transform не меняет logical state, сохраняется между ходами и
  при pause/resume; restart возвращает initial fit;
- logical win ждёт завершения всех `exit_visual[]`, затем переходит в
  `win_feedback`;
- completion emitted ровно один раз;
- pause/resume не меняет solver trace или remaining duration.

## Win / fail / restart

- Win: все стрелки `removed`.
- Fail: третья blocked attempt расходует последнюю жизнь.
- Незавершающая ошибка: blocked tap при `lives > 1`.
- Повторный blocked tap по уже красной стрелке после завершения wash считается
  новой ошибкой и снова расходует жизнь.
- Restart: exact initial level, `3` lives, error marks и visual exits очищены;
  выполняется camera fit; autoplay запускается только новым явным host entry
  request и не перезапускается после manual takeover.
- Undo: отсутствует в bounded prototype.
- Textual hint отсутствует в первом prototype; manual auto-move использует
  solver API и расходует жизнь.
- Таймер: отсутствует.
- Ресурс: `3` lives.

## Duration budget

- Целевая длительность manual: `20–45 s`.
- Целевое число успешных действий: `8–22`.
- Максимальная длительность: `60 s` без принудительного fail.
- First-live-frame -> first completed autoplay exit: `≤1.35 s`.
- Idle policy: gameplay ждёт; host может вернуть autoplay/demo только новым
  раундом, но не скрытым ходом в manual state.

## Bounded prototype

### Входит

- Пять собственных seed-уровней в difficulty band референсов 10–15.
- Один утверждённый polyline arrow type.
- Three-life error policy.
- Concurrent path-following exits, persistent blocked feedback и однофазный
  `450 ms` camera fit.
- Deterministic autoplay/takeover/pause/restart/completion.
- Manual camera pan/pinch-to-zoom с readable bounds и сохранением camera state
  между ходами.
- Manual auto-move control: один deterministic legal move за одну жизнь;
  A4 закрывает last-life policy до admission.
- Typed pack, validator, solver и bounded reverse generator.

### Не входит

- Точные layouts референса, meta/progression, ads, currency и hint UX.
- Special tiles, teleport, moving blockers, timed mode.
- Two-phase large-board intro, camera crop и принудительный post-move reframe.
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
- occupancy состоит только из lattice vertices и unit edges;
- initial arrows не делят vertex или unit edge;
- head exit-ray intersection вычисляется дискретно; visual stroke clearance
  не влияет на legality;
- минимум один initial legal move;
- solver подтверждает solvability.

## Solver / validator

- Validator доказывает schema/geometry invariants и отсутствие initial overlap.
- Solver доказывает существование порядка удаления всех стрелок без ошибок.
- Solver не доказывает fun, визуальную читаемость и соответствие target band.
- Legal move: lattice exit-ray сразу после head по `exitDir` до первого vertex
  за bounds не пересекает vertices/unit edges других live arrows.
- Собственный path выбранной стрелки исключён из blockers целиком: exit-ray
  разрешено пересекать собственный tail.
- Touch чужого vertex, crossing или движение вдоль чужого unit edge — blocked.
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
  dependency graph, difficulty band miss, duplicate canonical graph/layout,
  camera fit ниже readable minimum.

## Generation strategy

- Construction: reverse placement from empty по witness order.
- Candidate budget: provisional `2,000` attempts на один accepted level и
  `250 ms` median offline target; hard CI budget задаётся после spike.
- Deduplication: canonicalized geometry under translation + rotations/reflection
  только если skin не кодирует orientation.
- Difficulty targeting: hard ranges по features + soft score к reference band.
- Diversity gates применяются к каждому accepted level, а не только к серии:
  представлены все четыре `exitDir`, ни одно направление не доминирует более
  чем в `45%` стрелок, есть straight/one-turn/multi-turn archetypes и минимум
  `30%` стрелок имеют два или более излома. Final bounds обрезаются по
  фактической геометрии с gameplay-safe margin: пустая половина board
  считается density miss, а не допустимой вариацией.
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
- Layout: portrait-first, игровое поле центрировано. Gameplay HUD повторяет
  утверждённую структуру референсного prototype: hearts сверху слева, рядом
  отдельная pill-кнопка `HINT · −1 ♥`; фабрика не меняет их структуру,
  порядок или угол экрана.
- Essential animation: path-following exit с постоянной линейной
  screen-space скоростью `1.20` gameplay-card heights/s (`1.05–1.35`) без
  easing; маршрут заканчивается только после того, как кончик хвоста целиком
  пересёк фактическую clip-границу viewport на текущем device/camera
  transform. Blue accent decay и tap ripple; однофазный `450 ms` fit.
- Essential sound: optional light tick/air whoosh; sound-off полон.
- Haptic: light/selection на tap; error/rigid на blocked.
- Success: отдельный короткий state после последнего exit.
- Error: выбранная polyline path-following окном доезжает до ближайшего
  blocker и возвращается на authored path; card wash `533 ms`, polyline
  остаётся coral/red до следующего принятого выбора другой стрелки, одно
  сердце сразу становится пустым.
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
| `AR-A` | Analytics | measurement mapping | AR-G | event brief | success authority | operator |
| `AR-Q` | QA | parity/runtime/device | integrated candidate | Review 4 packet | product changes | independent |

## Typed integration boundaries

- Level: `ArrowsLevelSpecV1`.
- Engine action: `tapArrow`, `restart`, `setMode`, `hostPause/resume`.
- Engine state: live ids, lives, mode, phase, `activeExits[]`,
  `blockedUntil`, completion flag.
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
| Swipe/pan/tap конфликт | high | high | feed-shell gesture-arena test | explicit platform arbitration + device proof |

## Review 3 dispositions

| Вопрос | Решение | Evidence / follow-up |
| --- | --- | --- |
| Polyline или single-cell | **Polyline с первого baseline** | operator approve + native path-following exit |
| Blocked feedback | `≤33 ms` onset, travel до blocker + exact return, `533 ms` wash, latest-selection red, `-1` heart | operator correction 30.07.2026; new proof required |
| Camera intro | все пять prototype levels: one-phase `450 ms`; large overview/play `1.97 s + 2.23 s` — только future evidence | public Level 15 + native Level 43 |
| Five-level policy | пять собственных уровней, band 10–15; Level 15 holdout | operator approve |
| Haptic | `selection/light` на tap, затем `error/rigid` на blocked | device intensity принимается Review 4 |
| A1 collision authority | lattice vertices/unit edges; no gameplay stroke clearance; own path ignored | Review 3 recommendation accepted |
| A2 exit chaining | manual legal tap processes next step; logical removal immediate; visual exits overlap | запись не содержит unambiguous overlap-case, поэтому explicit `P` |
| A2 blocked wash/repeat | wash locks/throws away tap `533 ms`; same red arrow after wash costs another life | explicit `P` + approved per-blocked-tap policy |
| A3 camera/time-to-rule | intro fit и time-to-rule сохраняются; manual pan/pinch после takeover теперь обязательны | operator correction 30.07.2026; gesture/clamp proof required |
| A4 manual auto-move | один deterministic legal move расходует одну жизнь | operator correction 30.07.2026; last-life policy требует verdict |
| A5 launch/presentation boundary | autoplay только по явному Swipe-host request; standalone sample manual; Lab chrome вне gameplay; HUD structure immutable | operator correction 30.07.2026 |

A1–A2 остаются закрыты прежними authority-решениями. A3 изменён после
independent Review 3, A4–A5 добавлены впервые; затронутые
camera/input/runtime/presentation workstreams и admission фабрики
заблокированы до нового proof/verdict.

## Acceptance

### Gameplay

- [ ] Core loop, head-ray collision и path-following exit подтверждены
      fixtures.
- [ ] Win/fail/restart воспроизводимы.
- [ ] Autoplay/takeover следуют brief без reset.
- [ ] Manual auto-move исполняет один deterministic legal move, расходует одну
      жизнь и следует принятому A4 last-life verdict.
- [ ] Concurrent tap fixtures доказывают immediate logical removal, overlapping
      visual exits и отсутствие потерянных/queued tap.
- [ ] Blocked-wash fixtures доказывают discard во время wash и повторную
      потерю жизни после wash.
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
- [ ] Feed swipe, camera pan, pinch и arrow tap корректно арбитрируются в
      реальном feed shell.

### Presentation

- [ ] Tall и compact проверены.
- [ ] Gameplay читаем без звука и без цвета как единственного cue.
- [ ] Exit, blocked feedback, однофазный camera fit и manual pan/pinch пройдены
      на устройстве.
- [ ] Pan/pinch сохраняют camera state между ходами и не меняют logical state.
- [ ] Первый autoplay exit завершён за `≤1.35 s` на каждом из пяти levels.
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
- Любой из пяти уровней требует двухфазной camera choreography или crop и
  остаётся нечитаемым в допустимом manual zoom range.
- Первый autoplay exit не завершается за `1.35 s` или takeover нельзя сделать
  без state discontinuity.
- Concurrent manual taps теряются, queue-ятся либо читают stale live-set.
- Camera pan/pinch нельзя отличить от tap/feed swipe на целевом устройстве или
  camera gesture меняет gameplay state.
- Exit/camera motion не достигают читаемости на target WebView без нарушения
  runtime budgets.

## Evidence index

| Evidence | Path/URL | Digest/version | Reviewer disposition |
| --- | --- | --- | --- |
| Independent Review 3 | [`REVIEW-3-INDEPENDENT-2026-07-29.md`](REVIEW-3-INDEPENDENT-2026-07-29.md) | commit `998a445` | A1–A2 retained; A3 superseded in part by operator correction |
| Reference packet | [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md) | snapshot 30.07.2026 | A3 revised; A4 added; re-review required |
| Public walkthrough | [YouTube](https://www.youtube.com/watch?v=yePg-DPqfeA) | external | source accepted |
| Native feel/error clip | operator recording `2026-07-29 13.13.06.mp4` | SHA-256 `b9dd0215…4953f` | timing evidence accepted |
| Solver/visual/runtime evidence | produced by AR-S/P/I/Q | — | pending |

## Final decision

- Decision: **operator-revision / re-review-required** — A1 collision authority
  и A2 tap chaining/error lock сохраняются; A3 теперь включает manual
  pan/pinch, A4 добавляет manual auto-move с расходом жизни.
- Operator note: polyline approve; own levels; Level 15 holdout; autoplay и
  manual camera controls обязательны одновременно.
- Follow-up: принять A4 last-life policy, доказать gesture arbitration и exact
  runtime preview; после этого повторить factory review.
- Explicitly deferred: rollout, meta, hints, special arrows, server factory.
