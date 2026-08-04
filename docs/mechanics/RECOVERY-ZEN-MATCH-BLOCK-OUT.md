# Recovery plan: Zen Match и Block Out

- Дата решения: **30.07.2026**
- Тип: **bounded recovery recommendation**, не implementation status
- Parent process:
  [`REFERENCE-REPLICATION-PROCESS.md`](REFERENCE-REPLICATION-PROCESS.md)
- Device evidence:
  [`REFERENCE-DEVICE-LAB.md`](REFERENCE-DEVICE-LAB.md)

## Решение

Не запускать обе реализации с нуля.

Нужно перезапустить только fidelity-контур:

```text
Device evidence
  -> exact neutral Reference Twin
  -> gameplay/feel contract re-freeze
  -> focused implementation deltas
  -> Production Original
  -> factory/device review
```

Существующие engine, schema, solver и factory сохраняются, пока exact twin
trace не докажет конкретное несовместимое расхождение. Generated levels не
используются как замена reference fixtures.

## Общий порядок с минимальным временем оператора

1. Сначала сделать `Reference Device Lab 0–1` один раз для всех механик.
2. Оператор один раз подключает dedicated Android, устанавливает/авторизует
   Zen Match и Block Out и утверждает package/build.
3. Агент самостоятельно проходит и записывает оба target band.
4. Первым восстанавливается Zen Match: его core/solver ближе к usable, а
   основная неопределённость находится в presentation.
5. Затем Block Out: сначала movement/gate harness, потом art/polish.
6. Оператор смотрит только два коротких side-by-side пакета и даёт dispositions.

Новая ручная запись экрана оператором не является prerequisite.

# Zen Match

## Что сохранить

Пока evidence не докажет обратное, сохраняются:

- deterministic board/tray state;
- exposed-tile rule;
- fail-on-capacity contract;
- solver и reverse construction;
- autoplay/takeover infrastructure;
- swipe runtime shell;
- собственный symbol/SkinSpec контур как replaceable production layer.

Номера `6–10` текущей original series не считаются reference parity только
потому, что имеют те же progression labels.

## Что перезапустить

- exact target evidence Levels 6–10 одного app build/account cohort;
- cold assembly;
- tile flight и concurrent input;
- grouped tray insertion/rearrange;
- third landing → recognition → sequential removal;
- covered/unavailable tap;
- deliberate tray fail;
- last triple → win;
- composition, density, depth silhouette и readable tile scale.

## Минимальный план

### Z1 — autonomous capture

На свежем progression агент:

1. доходит до Levels 6–10;
2. записывает uncut success каждого уровня;
3. повторяет минимум один уровень с deliberate fail;
4. делает scripted rapid-tap/covered-tap probes;
5. отдельно снимает cold load и win transition;
6. экспортирует exact initial states, action traces и keyframes.

Если live app выдаёт другие Levels 6–10 из-за новой версии/A/B, authority —
captured build/session, а не старый walkthrough.

Immutable receipt для captured Zen session от `30.07.2026`:
[`triple-tile/CAPTURE-MANIFEST-ZEN-2026-07-30.md`](triple-tile/CAPTURE-MANIFEST-ZEN-2026-07-30.md).
Он фиксирует build `220000.1.755`, Levels `6–10`, rule observations и
ограничения video coverage. Это evidence input для Z2, а не утверждение
implementation readiness.

### Z2 — Reference Twin 6–10

Сделать пять internal-only neutral fixtures:

- exact geometry/layers/type allocation;
- exact action traces;
- reference phase timings;
- diagnostic flat symbols допустимы;
- production series остаётся отдельной.

Twin сначала подключается к существующему engine. Если reference trace проходит
с теми же state transitions, engine не переписывается.

### Z3 — presentation harness

Presentation калибруется на fixed twin state, без factory:

- board assembly;
- tap response;
- curved flight;
- overlapping flights;
- tray compression;
- triple removal;
- win/fail cadence.

Каждое исправление закрывает одну строку `REFERENCE-DELTA.md`. Не делать ещё
один большой mixed «align with Zen feel» patch.

### Z4 — Production Original и factory

После принятия twin:

- вернуть собственный SkinSpec;
- проверить текущие original levels по density/topology/action distributions;
- пересобрать только уровни, вышедшие из target band;
- включить similarity gate против twin 6–10;
- сделать physical-device side-by-side.

## Когда всё-таки переписывать core

Только если twin докажет хотя бы одно:

- logical availability отличается от engine;
- tray insertion/removal меняет canonical gameplay outcome, а не только
  presentation;
- fail boundary не выражается текущей state machine;
- concurrent input нельзя воспроизвести без скрытых/потерянных actions.

Иначе полный restart потратит время, но не улучшит fidelity.

## Zen acceptance

- пять twin levels воспроизводят reference traces;
- cold load, flight, tray и removal имеют measured tolerances;
- intentional fail и win просмотрены side-by-side;
- Production Original выглядит собственно, но не хуже по читаемости и cadence;
- operator review ограничен коротким montage, а не ручным прохождением всей
  серии.

# Block Out

## Что сохранить

Условно сохраняются:

- LevelSpec/polyomino representation;
- deterministic snapshots/replay;
- solver/validator infrastructure;
- autoplay/takeover/runtime shell;
- reusable rendering/layout primitives.

Solver можно сохранить только если он использует тот же movement predicate,
который подтвердит Reference Twin. Отдельная «solver-физика» недопустима.

## Что перезапустить

- pointer carry semantics;
- collision projection/sliding;
- diagonal и turn behavior;
- release/snap;
- gate suction/capture threshold;
- shape-preserving exit;
- invalid/non-matching gate feedback;
- tactile presentation и gate/win cadence.

Target evidence должен относиться к Levels 6–10 того же build. Записи Levels
11–15 полезны как дополнительные probes, но не заменяют target band.

## Минимальный план

### B1 — autonomous capture

Агент проходит Levels 6–10 и запускает отдельную probe matrix:

1. slow/fast horizontal и vertical drag;
2. diagonal drag;
3. turn around corner без release;
4. drag вдоль препятствия;
5. release mid-corridor;
6. release рядом с occupied/illegal anchor;
7. partial matching-gate entry;
8. non-matching gate;
9. quick flick;
10. final exit и win.

Записываются полный gesture path, duration, frames и final state.

### B2 — movement harness раньше уровня

Собрать маленькие exact neutral scenes для каждого probe:

- один block и wall;
- corridor;
- corner;
- matching gate;
- non-matching gate;
- two-block contact.

Сначала current input/engine/solver прогоняются по этим traces. Расхождение
локализуется в одном shared movement predicate.

### B3 — focused rule repair

Порядок исправления:

1. pointer-to-board coordinate mapping;
2. continuous collision projection;
3. axis-decomposed sliding/turning;
4. legal release/snap;
5. gate suction/capture;
6. solver equivalence;
7. exit/win presentation.

Art и particles не добавляются до прохождения B1–B6: иначе polish маскирует
неправильную физику.

### B4 — Reference Twin Levels 6–10

После probe harness сделать exact internal boards и replay successful traces.
Они калибруют:

- spatial pressure;
- block/gate sizes;
- gate contention;
- detours;
- action count;
- camera/readability;
- timing и visual weight.

### B5 — tactile Production Original

Только затем:

- first-party tactile block skin;
- depth/stud/material cues;
- carry lift/shadow;
- gate reaction/suction;
- shape-preserving exit;
- haptic disposition;
- original factory levels с near-duplicate gate.

## Когда переписывать core

Focused rewrite movement layer нужен, если current engine:

- хранит только lattice teleports и не может выразить continuous carried pose;
- разрешает input state, который solver считает illegal, или наоборот;
- не может slide/turn без release;
- commit'ит exit по другому predicate, чем presentation.

Даже в этом случае не переписываются schema, runtime bridge и factory tooling,
которые не зависят от неверного predicate.

## Block Out acceptance

- все scripted gestures имеют observed reference outcome;
- input, engine и solver используют один predicate;
- twin Levels 6–10 replay-ятся теми же gesture classes;
- carry/sliding/gate capture проверены на физическом устройстве;
- art review начинается после movement parity;
- operator получает короткий probe montage плюс один полный уровень.

# Приоритет инвестиции

Рекомендуемый следующий implementation scope:

1. `Reference Device Lab 0–1`;
2. autonomous Zen Match capture;
3. Zen Reference Twin и isolated presentation recovery;
4. autonomous Block Out capture;
5. Block movement harness и focused repair;
6. Block Reference Twin и presentation;
7. обе Production Original series и factory similarity gates.

Это дешевле двух greenfield restarts и превращает затраты на reference
acquisition в переиспользуемую инфраструктуру для всех следующих классов.
