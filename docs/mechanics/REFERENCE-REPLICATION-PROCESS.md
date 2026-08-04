# Fidelity replication process

- Версия процесса: **v2**
- Решение оператора: **30.07.2026**
- Область: исследование мобильной механики, эталонный playable и подготовка
  фабрики уровней для swipe-платформы
- Шаблон класса:
  [`CLASS-BRIEF-TEMPLATE.md`](CLASS-BRIEF-TEMPLATE.md)
- Сбор evidence с устройства:
  [`REFERENCE-DEVICE-LAB.md`](REFERENCE-DEVICE-LAB.md)

## Цель

Получить не просто работающую механику, а воспроизводимый class baseline,
который:

1. повторяет правила, управление и feel выбранного референса;
2. отделяет доказанное наблюдение от продуктового решения и догадки;
3. использует точные reference-уровни для внутренней калибровки;
4. выпускает только собственные layouts, visual identity и assets;
5. даёт фабрике измеримую модель качества, а не просьбу «сделай похоже»;
6. минимизирует время оператора: evidence по умолчанию собирает агент.

`Green tests` доказывают только названные инварианты. Они не доказывают
визуальное или тактильное соответствие референсу.

## Authority и артефакты

Этот документ — процессная authority для fidelity replication. Он не хранит
implementation status конкретной механики и не разрешает rollout.

На каждый класс создаются:

| Артефакт | Что фиксирует |
| --- | --- |
| `CLASS-BRIEF.md` | gameplay, input, platform и acceptance contract |
| `REFERENCE-PACKET.md` | reference identity, observations, measurements |
| `CAPTURE-MANIFEST.md` или `.json` | app/build/device/session/file identity |
| `PROBE-MATRIX.md` | успешные, ошибочные и граничные действия |
| `REFERENCE-TWIN.md` | exact internal calibration fixtures и traces |
| `PARITY-CHECKLIST.md` | наблюдаемые must-match свойства |
| `REFERENCE-DELTA.md` | известные отличия и их disposition |
| solver/runtime/visual receipts | машинное evidence реализации |

Большие видео и кадры лежат вне репозитория:
`.artifacts/reference-lab/<mechanic>/<capture-id>/`. В Git входят manifest,
hashes, измерения и решения, но не чужие media/assets.

## Два обязательных контура

### A. Reference Twin

`Reference Twin` — точная, нейтрально оформленная внутренняя реконструкция
`3–5` уровней или сценариев референса.

Разрешено:

- повторить exact geometry/layout, начальное состояние и action sequence;
- воспроизвести правила, collision, camera, timings и phase ordering;
- хранить solver witness и timestamped input trace;
- использовать простые геометрические примитивы и собственные diagnostic
  markers;
- выбирать fixture отдельным development-only ID/query.

Обязательно:

- `internal-only`, `non-shipping`;
- отдельный build/registry namespace;
- никаких reference screenshots, sprites, audio, fonts, UI chrome, brand или
  текстов в bundle;
- production build fail-closed, если twin ID или fixture попал в manifest;
- visual acceptance остаётся side-by-side judgment, а не только pixel metric.

Reference Twin нужен не как будущий контент. Это измерительный прибор:
он отделяет ошибку engine/presentation от ошибки собственной фабрики уровней.

### B. Production Original

Production-контур сохраняет доказанное правило и feel, но использует:

- собственные layouts и progression;
- собственные symbols, palette, background, UI и audio;
- versioned SkinSpec;
- factory provenance;
- near-duplicate gate против Reference Twin и известных reference layouts.

Exact reference layout не публикуется без отдельной лицензии или юридической
disposition. Общая правовая логика: методы/правила игры и их конкретное
визуальное выражение имеют разные границы охраны; см.
[U.S. Copyright Office: Games](https://www.copyright.gov/register/tx-games.html)
и
[EU Software Directive 2009/24/EC](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32009L0024).
Это process guardrail, не юридическая консультация.

## Роли и бюджет внимания оператора

### Оператор

Оператор делает только то, что нельзя надёжно делегировать:

1. называет exact app/reference и taste goal;
2. один раз помогает с install/login/purchase/captcha, если это нужно;
3. утверждает `must match / may differ / must differ`;
4. принимает короткий side-by-side на физическом устройстве;
5. отдельно разрешает rollout.

Оператор не обязан вручную записывать полный reference corpus.

### Агент

Агент:

- сам играет и исследует reference через device lab;
- фиксирует build/device/session identity;
- собирает success/fail/edge-case traces;
- извлекает кадры и измеряет timing/geometry;
- строит Reference Twin;
- формирует parity checklist и delta list;
- реализует и проверяет Production Original;
- готовит компактный пакет на operator review.

## Gate 0 — короткое решение оператора

До исследования должны быть зафиксированы:

| Поле | Требование |
| --- | --- |
| Exact reference | название, store URL/package ID |
| Taste authority | app build либо конкретный captured session |
| Target band | точные уровни/режим/account cohort |
| Must match | 3–7 обязательных ощущений/правил |
| May differ | допустимые упрощения |
| Must differ | brand, assets и другие явные exclusions |
| Platform target | swipe/standalone/AppLovin/FTUE |
| Device access | способ install/auth и допустимые действия агента |

Если оператор меняет primary reference, работа возвращается в Gate 1. Нельзя
накладывать presentation нового primary поверх engine/factory старого primary
и продолжать считать brief закрытым.

## Gate 1 — agent-owned reference acquisition

Предпочтительный вход — самостоятельная игра агента через
[`REFERENCE-DEVICE-LAB.md`](REFERENCE-DEVICE-LAB.md). Ручная запись оператора
— fallback, а не default.

Минимальный capture corpus:

1. cold launch и cold level load;
2. `3–5` exact target levels, успешное прохождение без монтажа;
3. deliberate fail;
4. invalid/blocked input;
5. restart/retry;
6. быстрые и перекрывающиеся действия;
7. class-specific boundary probes;
8. win onset, settle и переход после win;
9. portrait device capture в реальном темпе;
10. отдельная человеческая пометка haptic, если haptic входит в must-match.

Для каждого события сохраняются:

- timestamp;
- input kind и координаты/path;
- pre/post screenshot или frame range;
- observed result;
- app/build/device identity;
- confidence: `R` observed, `O` operator decision, `P` prototype proposal,
  `B` blocking unknown.

`B` в must-match rule или feel блокирует Gate 2/3. Его нельзя молча превратить
в `P`, чтобы открыть реализацию.

## Gate 2 — Reference Twin

Агент реконструирует exact neutral fixtures и воспроизводит captured traces.

Минимальная приёмка:

- initial state совпадает по canonical geometry/state;
- reference action trace легален в twin;
- state sequence и terminal outcome совпадают;
- phase ordering совпадает;
- must-match timings лежат в утверждённом допуске;
- side-by-side показывает одну и ту же причинно-следственную картину;
- все fixtures решаются и replay-ятся детерминированно, если класс это
  допускает;
- production build не может импортировать fixtures.

Если twin не сходится, нельзя лечить расхождение собственной генерацией уровня
или декоративным polish.

## Gate 3 — freeze gameplay и feel contract

Перед Engine/Solver/Factory baseline:

- primary reference и build/session authority зафиксированы;
- exact input semantics закрыты;
- win/fail/restart закрыты;
- все must-match строки feel table имеют число/evidence/disposition;
- Reference Twin принят;
- parity checklist проверяем;
- открытые `P` относятся только к may-differ, а не к fidelity target.

После этого независимо могут идти Engine, Solver и Presentation. Factory
начинается после solver/validator и не используется для выяснения правил.

Каждое новое evidence, которое меняет правило, возвращает работу в Gate 2/3 и
требует повторной проверки общего movement/state predicate.

## Gate 4 — Production Original

Сначала меняются presentation identity и layouts, но не доказанное поведение.

Порядок:

1. подключить first-party SkinSpec;
2. создать небольшой original seed pack;
3. replay-нуть эквивалентные interaction traces;
4. проверить visual/readability parity;
5. проверить, что exact fixtures и reference assets отсутствуют;
6. принять delta list.

Большой смешанный патч `engine + factory + presentation + new reference` не
принимается: каждое расхождение должно иметь локализуемую причину.

## Gate 5 — Factory

Factory учится не на просьбе «сделай похожее», а на измеренных свойствах:

- shape/occupancy distribution;
- branching и dependency depth;
- action count и duration;
- pressure/error curve;
- topology/silhouette;
- reference player traces;
- false affordances;
- difficulty progression;
- camera/readability constraints.

Обязательные gates:

- validator/solver receipt;
- reproducible seed;
- holdout reference level, не использованный для tuning;
- canonical exact hash;
- similarity score к Reference Twin;
- reject near-duplicates выше утверждённого порога;
- human taste review ограниченного top-K, а не ручной ремонт всего batch.

## Gate 6 — platform и Review 4

Review 4 требует:

- реальный swipe runtime и autoplay/takeover;
- physical-device run в реальном темпе;
- deterministic replay;
- aspect/device matrix;
- visual proof;
- reference/prototype side-by-side;
- timing extraction;
- delta list с disposition каждой строки;
- независимый reviewer;
- operator decision: `accept baseline | rework | reject`.

Наличие unit tests, успешной сборки или solver receipt само по себе не даёт
`accept baseline`.

## Class-specific probes

### Tap/discrete dependency

- accepted и blocked tap;
- repeated blocked tap;
- tap во время exit/error;
- rapid legal taps;
- fail/restart;
- camera fit на малом и большом поле.

### Triple-tile

- cold assembly;
- covered/unavailable tap;
- несколько taps во время flight;
- same-type grouped insertion;
- третья tile: landing → recognition → sequential removal;
- tray overflow/fail;
- last triple → win;
- partially covered readability.

### Continuous drag / Block Out

- pointerdown response;
- медленный и быстрый drag;
- flick без/с inertia;
- diagonal и turn без release;
- sliding вдоль препятствия;
- release в середине corridor;
- release рядом с illegal anchor;
- partial gate entry;
- matching и non-matching gate;
- capture/suction threshold;
- win и timer/fail, если они входят в baseline.

## Stop/restart policy

Полный greenfield restart нужен только если Reference Twin доказывает, что
существующий canonical engine state или transition model не может выразить
reference behavior.

Во всех остальных случаях:

- сохраняются schema, engine, solver и factory pieces, прошедшие twin traces;
- заново выполняются только Reference, Twin и затронутые contracts;
- presentation переписывается изолированно;
- generated levels не используются как calibration evidence.

## Definition of done

Механика готова стать class baseline, только если:

- агент может повторить evidence acquisition из manifest;
- Reference Twin воспроизводит exact reference traces;
- Production Original сохраняет rule/feel parity;
- production layouts/assets оригинальны и проходят similarity/provenance gate;
- operator не называет существенного ухудшения в side-by-side;
- rollout остаётся отдельным явным решением.
