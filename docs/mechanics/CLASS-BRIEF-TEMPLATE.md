# Class Brief: `[mechanic-id]`

- Дата: `YYYY-MM-DD`
- Статус: `draft | review | approved-for-prototype | evidence-ready | closed`
- Владелец taste-решения:
- Автор brief:
- Независимый reviewer:

> Шаблон описывает один класс механики до параллельной разработки. Он не
> заменяет playable release brief и не даёт authority на публикацию.

## VISION-триаж

- Принцип/ступень VISION:
- Какую продуктовую неопределённость сокращаем:
- Почему работа допустима сейчас:
- Требуемое решение оператора:
- Что документ не разрешает:

## Цель

Одно проверяемое предложение:

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

### Secondary references

| Референс | Что берём | Что не берём |
| --- | --- | --- |
| | | |

### Rights boundary

- Не копируем:
- Собственные replacements:
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

### Evidence

- [ ] Reference packet приложен.
- [ ] Visual proof приложен.
- [ ] Runtime checks приложены.
- [ ] Reference delta list заполнен.
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
