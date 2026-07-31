# Class Brief: `[mechanic-id]`

- Дата: `YYYY-MM-DD`
- Статус: `draft | review | approved-for-prototype | evidence-ready | closed`
- Владелец taste-решения:
- Автор brief:
- Независимый reviewer:
- Process version: `reference-replication.v3`
- Process receipt:

> Шаблон описывает один класс механики до параллельной разработки. Он не
> заменяет playable release brief и не даёт authority на публикацию.

## VISION-триаж

- Принцип/ступень VISION:
- Какую продуктовую неопределённость сокращаем:
- Почему работа допустима сейчас:
- Требуемое решение оператора:
- Что документ не разрешает:

## Цель

Одно проверяемое предложение. Оно отдельно называет `Reference -> Twin`
causal fidelity и `Twin -> Original` matched-scenario taste parity. Полный
визуальный identification не требуется: Twin neutral-skinned, Original имеет
собственную identity.

> _Заполнить._

## Non-goals

- _Заполнить._
- _Заполнить._

## Точный эталон

### Primary reference

- Название:
- Версия/дата:
- Ссылка:
- Screen recording:
- Диапазон уровней:
- Immutable capture session:
- Capture manifest SHA-256:
- Capture report:

### Operator must-match moments

Первый такт provisional до evidence, второй такт freeze после предложения
агента. MUST parity не заводится без parent ID из этой таблицы.

| ID | Moment | Почему заметен | Golden scenario | Статус |
| --- | --- | --- | --- | --- |
| `[id]-MM-01` | | | | `provisional | frozen` |

### Evidence acquisition boundary

- Кто собирает evidence:
- Clean/instrumented pair policy:
- Initial-state fingerprint/crop/pHash threshold:
- JSONL action log:
- Screenshot/video inventory:
- Hash-chain/manifest verification:
- Declared recording gaps:
- Разрешённые targeted probes:
- Запрещённые device/economy actions:

### Secondary references

| Референс | Что берём | Что не берём |
| --- | --- | --- |
| | | |

### Machine-readable fidelity authority

- `OBSERVATIONS.v1.json` + digest:
- `FIDELITY-CONTRACT.v1.json` + digest:
- `PRESENTATION-PROFILE.v1.json` + digest:
- Profile-vs-contract receipt:

Implementation потребляет только presentation profile. Спорное или
незаполненное MUST-значение — blocking.

| Metric ID | Value/range | Uncertainty | Grade | PTS/action | Method/confidence |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

### Reference parity checklist

Каждая строка имеет parent must-match, salience и verification mode. Composite
score не закрывает failed MUST.

| ID | Parent must-match | Salience | Assertion | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| | | `MUST | MAJOR | MINOR | INFO` | | `machine | operator` | |

### Golden scenarios

| Scenario ID | Initial state binding | Exact stimulus | Key events/keyframes | Required channels |
| --- | --- | --- | --- | --- |
| | | | | `clean + instrumented` |

- `GOLDEN-SCENARIOS` path/digest:
- `PROBE-MATRIX` path/digest:
- `GESTURE-TRACES` path/digest:

### Early vertical-slice gate

- Выбранный golden scenario:
- Reference -> Twin evidence:
- Twin -> Original matched pair:
- Operator choice-session disposition:
- Downstream scale-out: `authorized | blocked`

### Rights boundary

- Не копируем:
- Собственные replacements (visual identity — через SkinSpec-пайплайн):
- Открытые IP/taste-вопросы:

## Core fantasy

Что должен чувствовать игрок:

> _Заполнить._

## Core loop

Что игрок делает каждые 3–5 секунд:

> _Заполнить._

## Первый экран и autoplay

- Что видно в первом frame:
- Как правило считывается без текста:
- Что делает autoplay:
- Длина autoplay-фрагмента:
- Оптимален ли autoplay:
- Что происходит при takeover:
- Состояние сохраняется или раунд начинается заново:

## Input contract

| Input | Условие | State transition | Feedback |
| --- | --- | --- | --- |
| | | | |

Конфликт с вертикальным swipe:

## State machine

```text
boot
  -> ready
  -> autoplay | manual
  -> win | fail
  -> completed
```

Уточнённые состояния и переходы:

## Win / fail / restart

- Win:
- Fail:
- Ошибка, не завершающая раунд:
- Restart:
- Undo:
- Hint:
- Таймер:
- Лимит действий/ресурса:

## Duration budget

- Целевая длительность:
- Целевое число действий:
- Максимальная длительность:
- Idle policy:

## Bounded prototype

### Входит

- _Заполнить._
- _Заполнить._

### Не входит

- _Заполнить._
- _Заполнить._

### Disposable spike

Что разрешено сделать одноразово:

### Baseline class

Что обязано пережить прототип и стать контрактом класса:

## Level/content schema

```ts
interface LevelSpec {
  // draft
}
```

- Version:
- Stable identity:
- Seed:
- Initial state:
- Allowed randomness:
- Backward compatibility:

## Solver / validator

- Что доказывает validator:
- Что доказывает solver:
- Что они принципиально не доказывают:
- Legal move:
- Terminal state:
- Solvability:
- Difficulty features:
- Deterministic trace:
- Time/budget limits:
- Reject reasons:

## Generation strategy

- Construction method:
- Candidate budget:
- Deduplication:
- Difficulty targeting:
- Series assembly:
- Provenance:
- Human review point:
- Production near-duplicate metric family:
- Hard rejects:
- Threshold и момент freeze:
- Fail-closed behavior при Twin import:

## Difficulty ladder

| Уровень | Новое требование | Target features | Запрещённые скачки |
| ---: | --- | --- | --- |
| 1 | | | |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

## Presentation

- Art direction:
- Layout:
- Essential animation:
- Essential sound:
- Haptic:
- Success feedback:
- Error feedback:
- Fail feedback:
- Color-independent cues:
- Low-tier/reduced-effects:
- Cover/live-frame match:

## Assets

| Asset | Source/provenance | Format | Budget | Replaceable by skin |
| --- | --- | --- | ---: | --- |
| | | | | |

## Runtime/platform integration

- Target build:
- Staged boot:
- Host pause:
- Autoplay/manual mode:
- Completion:
- Level selection:
- Cleanup:
- Expected mount cost:
- Expected prefetch bytes:
- External media:

## Analytics questions

| Продуктовый вопрос | Наблюдение/event | Интерпретация | Не доказывает |
| --- | --- | --- | --- |
| Считывается ли autoplay? | | | |
| Срабатывает ли takeover? | | | |
| Понятна ли ошибка? | | | |
| Проходят ли серию? | | | |

## Work packages

| ID | Workstream | Scope | Inputs | Outputs | Не трогает | Reviewer |
| --- | --- | --- | --- | --- | --- | --- |
| `[id]-R` | Reference | | | | | |
| `[id]-E` | Engine | | | | | |
| `[id]-S` | Solver | | | | | |
| `[id]-F` | Factory | | | | | |
| `[id]-P` | Presentation | | | | | |
| `[id]-I` | Integration | | | | | |
| `[id]-A` | Analytics | | | | | |
| `[id]-Q` | QA | | | | | |

## Typed integration boundaries

- Level schema:
- Engine action/state:
- Solver result:
- Solver trace:
- Presentation projection:
- Runtime bridge:
- Validation receipt:

## Risks

| Risk | Вероятность | Ущерб | Ранний тест | Stop/mitigation |
| --- | --- | --- | --- | --- |
| | | | | |

## Stop rule and attention budget

- Automatic correction rounds: `≤2`
- Operator sessions: `≤2`
- Decisions per choice-session: `≤8` (`6` unique + `2` hidden repeats)
- Operator minutes per session: `≤15`
- Required: all MUST green
- Allowed open MINOR: `≤2`, each explicitly disposed
- Open MAJOR policy:

## Открытые решения

| Вопрос | Почему блокирует | Кто решает | Deadline/trigger | Disposition |
| --- | --- | --- | --- | --- |
| | | | | |

## Acceptance

### Gameplay

- [ ] Core loop совпадает с утверждённым эталоном.
- [ ] Win/fail/restart воспроизводимы.
- [ ] Autoplay и takeover следуют brief.
- [ ] Нет скрытых правил, отсутствующих в brief.

### Content

- [ ] Level schema versioned.
- [ ] Seed/state воспроизводимы.
- [ ] Validator покрывает invalid fixtures.
- [ ] Solver/инварианты покрывают valid fixtures.
- [ ] Difficulty ladder различима на пяти уровнях.

### Platform

- [ ] Staged boot работает.
- [ ] Off-screen pause не меняет игровой результат.
- [ ] Cleanup не оставляет timers/listeners/audio.
- [ ] Completion отправляется ровно по контракту.
- [ ] Cover регистрируется с первым live frame.

### Presentation

- [ ] Tall и compact aspect проверены.
- [ ] Gameplay читаем без звука.
- [ ] Ошибка и успех различимы без одного только цвета.
- [ ] Low-tier path проверен, если нужен.

### Fidelity

- [ ] Must-match таблица frozen вторым тактом и совпадает с MUST parity.
- [ ] Three-file authority и profile-vs-contract receipt приложены.
- [ ] Early vertical-slice taste gate пройден до scale-out.
- [ ] Parity checklist пройден; failed MUST нет.
- [ ] Matched-scenario choice-session содержит не более восьми решений.
- [ ] Before/after GIF (AutoCursor) приложены к каждой feel-итерации.

### Evidence

- [ ] Reference packet приложен (включая feel-таблицу и parity checklist).
- [ ] Visual proof приложен.
- [ ] Runtime checks приложены.
- [ ] Reference delta list заполнен.
- [ ] Process receipt заполнен.
- [ ] Независимый reviewer дал dispositions.

## Kill criteria

- _Заполнить._
- _Заполнить._

## Evidence index

| Evidence | Path/URL | Digest/version | Reviewer disposition |
| --- | --- | --- | --- |
| | | | |

## Final decision

- Decision: `accept baseline | disposable spike only | rework | reject`
- Operator note:
- Follow-up scope:
- Explicitly deferred:
