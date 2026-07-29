# AR-R: reference packet — Arrows

- Дата среза: **29.07.2026**
- Статус: **approved-for-prototype**
- Вкусовой эталон: **Arrows – Puzzle Escape**
- Целевой диапазон: **уровни 10–15**
- Связанный brief: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)

> Документ фиксирует наблюдаемые свойства референса и отделяет их от
> продуктовых решений прототипа. Review 3 закрыт решениями оператора и
> нативной записью от 29.07.2026.

## Решение оператора

### Сохранить

1. характер ухода стрелки;
2. подсветку заблокированного хода;
3. zoom/reframe игрового поля;
4. чистый и простой дизайн;
5. сложность и проходимость уровня как самостоятельное качество;
6. генерацию уровней с обратной раскладкой и solver-проверкой;
7. haptic на любой tap по стрелке и отдельный haptic ошибки.

### Утверждённые defaults

- заблокированный tap отнимает одну жизнь;
- допускается несколько корректных решений;
- takeover продолжает точное состояние autoplay;
- bounded prototype — пять уровней;
- baseline использует polyline-стрелки;
- уровни синтезируются самостоятельно; Level 15 — holdout;
- таймера нет.

Ранее утверждённый default «простые единичные стрелки» заменён явным решением
Review 3: выбранный эталон использует ортогональные ломаные разной длины,
поэтому polyline-геометрия входит в первый baseline.

## Источники

| ID | Источник | Что подтверждает | Ограничение |
| --- | --- | --- | --- |
| `AR-R-S1` | [App Store: Arrows – Puzzle Escape](https://apps.apple.com/us/app/arrows-puzzle-escape/id6748397500) | identity, no-timer puzzle, collision rule, hints, рыночный proxy | не даёт покадровых timing |
| `AR-R-S2` | [Gameplay walkthrough, levels 1–30](https://www.youtube.com/watch?v=yePg-DPqfeA) | layout, успешные ходы, Level 15, exit motion, camera framing, win | публичный монтаж; touch/haptic не видны; есть реклама |
| `AR-R-S3` | описание оператора | target 10–15, обязательный juice, haptic semantics | нет чисел интенсивности/длительности |
| `AR-R-S4` | operator recording `2026-07-29 13.13.06.mp4` | native path-following polyline exit, blocked feedback, lives, fail, adaptive intro camera | Level 43 Hard; не используется как difficulty target |

На дату среза App Store показывает разработчика Lessmore GmbH и версию
`0.20.1`; точная версия приложения в ролике неизвестна. В случае расхождения
между текущим приложением и роликом вкусовым эталоном этого прототипа является
именно предоставленная запись.

Native evidence:

- portrait `384×832`;
- `29.986 fps`, frame interval `33.35 ms`;
- duration `69.333 s`, size `6,068,764 bytes`;
- SHA-256:
  `b9dd021516a0d65751ae5d31c244265c44cc2ef86590b4ede307ad2279b4953f`;
- Level 43 Hard используется только для feel/rule evidence; сложность
  bounded prototype по-прежнему калибруется уровнями 10–15.

## Граница видеореференса

- Исходный ролик имеет landscape-композицию, но gameplay находится только в
  центральной portrait-области.
- Размытые auto-expanded боковины — монтажное заполнение, не часть UI.
- Предварительный crop для анализа — центральные примерно `36–64%` ширины
  видеокадра; перед final evidence crop проверяется по исходному recording.
- Баннеры и полноэкранные вставки сторонней рекламы не входят в visual target
  и исключаются из timing.
- Тайминги ниже измерены по публичному YouTube-потоку. События короче
  `100 ms`, точный touch-down и haptic из него достоверно не измеряются.

## Наблюдаемое правило

1. Поле состоит из тонких тёмных ортогональных стрелок на светлой точечной
   сетке.
2. Игрок нажимает на стрелку.
3. Если объект может целиком уйти в направлении наконечника без столкновения,
   он покидает поле.
4. Если траектория заблокирована другой стрелкой, объект остаётся на поле,
   показывается отрицательный feedback и теряется одна жизнь.
5. Победа наступает после удаления всех стрелок.
6. Таймера нет; сложность создаётся порядком освобождения и пространственным
   чтением, а не скоростью.
7. Камера сохраняет читаемый масштаб и меняет framing по мере очистки поля.

### Подтверждённая path-following геометрия

Native recording меняет предварительную rigid-body гипотезу. Выбранная
ломаная целиком подсвечивается, но не переносится как жёсткая фигура:
наконечник продолжает движение по `exitDir`, а хвост втягивается вперёд по
собственному пути. Это видно на U-образной стрелке `17.1667–17.8333`.
Typed-контракт:

- хранить линию как упорядоченный Manhattan-path `tail -> head`;
- направление выхода равно направлению последнего сегмента;
- при успешном ходе render-route равен исходному `path`, продолженному прямым
  лучом по `exitDir` за bounds;
- видимый stroke — окно постоянной arc-length, продвигающееся по render-route:
  tail освобождает исходный path, head движется наружу;
- ход legal, если открытый луч от head по `exitDir` до bounds не пересекает
  occupancy другой live arrow с учётом fixed stroke clearance;
- на blocked tap stroke не продвигается ни на один пиксель и получает
  persistent error-state.

Следствие для solver: не нужно симулировать rigid swept-body. Нужен
детерминированный ray/segment intersection перед head; собственный path уже
занят самой стрелкой и освобождается с хвоста.

## Числовой feel-разбор

`R` — измерено по референсу; `O` — выбор оператора; `P` — реализационный
target, проверяемый на Review 4.

| Параметр | Target | Статус | Основание |
| --- | ---: | :---: | --- |
| Начало видимого ответа после tap | `≤33 ms` | `R/P` | native: состояние меняется в первом 30-fps frame после принятого tap |
| Скорость ухода | nominal `36` grid units/s после короткого acceleration; target `32–40` | `R/P` | native: короткая стрелка `~433 ms`, U-polyline `~667 ms`; grid-normalized estimate |
| Длительность ухода | вычисляется из `pathArcLength + headExitDistance`; reference samples `375–700 ms` | `R` | public Level 15 `~375 ms`; native `15.8667–16.3000` и `17.1667–17.8333` |
| Траектория ухода | tail следует исходному path, head продолжает прямой `exitDir`; `0` остаточных px после clip | `R` | native U-polyline `17.1667–17.8333` |
| Прозрачность во время ухода | `100%` до выхода, без dissolve | `R` | видимая линия сохраняет контраст; исчезает за границей |
| Selected exit color | вся polyline переходит в cold blue accent в первый frame; accent decays к base stroke за `160–233 ms` | `R` | native `15.8667–16.0667`, `17.1667–17.4000` |
| Tap ripple | `200–333 ms`, полупрозрачный круг у точки tap/head | `R` | native success/error frame sequences |
| Motion character | быстрое ускорение, directional blur/anti-alias trail, без overshoot назад | `R/P` | native + public Level 15 |
| Small-board load fit | `450 ± 80 ms` | `R` | public Level 15: появление/fit `424.541–425.040` |
| Large-board intro: reveal -> overview | `1,967 ± 67 ms` | `R` | native Level 43: `3.533–5.500` |
| Large-board intro: overview -> play scale | `2,233 ± 67 ms` | `R` | native Level 43: `5.500–7.733` |
| HUD crossfade at end of intro | `267 ± 33 ms` | `R` | native: примерно `7.500–7.767` |
| Масштаб камеры | overview fit всех arrows; play scale сохраняет читаемый stroke/cell и может crop-ить большое поле | `R` | native двухфазный intro |
| Толщина основной линии | `0.11–0.14` grid cell | `R/P` | измерение по central crop, зависит от рескейла YouTube |
| Длина наконечника | `0.35–0.45` grid cell | `R/P` | измерение по central crop |
| Контраст grid dots | opacity `6–10%` относительно линии | `R/P` | визуальный анализ central crop |
| Tap haptic | в пределах `0–20 ms` от принятого tap; semantic `selection/light` | `O/P` | событие утверждено оператором; профиль требует device-review |
| Blocked haptic | вслед за tap haptic, `0–33 ms` от visual error onset; semantic `error/rigid` | `O/P` | событие утверждено оператором; физический профиль — Review 4 |
| Blocked response onset | `≤33 ms`; geometry displacement `0 px` | `R` | native: stable `23.5333`, первый error frame `23.5667` |
| Blocked card wash | total `533 ± 33 ms`; peak первые `100–133 ms`, затем decay | `R` | native: `23.5667–24.1000` |
| Blocked arrow state | coral/red stroke сохраняется до удаления arrow или restart | `R` | native: одна и та же blocked arrow остаётся красной при camera movement |
| Life decrement | одно сердце сереет в первый error frame (`≤33 ms`) | `R/O` | native `23.5667`; policy утверждена оператором |
| Потеря жизни | `1` за один завершённый blocked tap | `O` | утверждённый default |
| Third-error -> fail modal onset | `1,033 ± 67 ms` | `R` | native: third pulse `64.6000`, modal starts `65.6333` |
| Fail modal settle | `200 ± 33 ms` | `R` | native: `65.6333–65.8333` |
| Win feedback | начинается не позднее `150 ms` после ухода последней стрелки | `P` | public recording; exact Review 4 target |

### Adaptive camera contract

Native Level 43 показывает две фазы: сначала поле уменьшается до полного
overview, затем увеличивается до читаемого play scale. Public Level 15
показывает короткий `~450 ms` fit без заметной длинной overview-фазы.

Baseline camera выводит оба случая из одной политики:

1. вычислить `overviewScale = fit(all initial arrows)`;
2. вычислить `playScale = max(overviewScale, minReadableScale)`;
3. если отношение `playScale / overviewScale < 1.15`, выполнить один
   `450 ms` fit;
4. иначе показать двухфазный overview/play choreography с measured upper
   timings `1.97 s + 2.23 s`;
5. camera choreography не меняет logical state и не принимает gameplay input;
6. ручные pan/pinch и автоматический reframe после каждого хода не входят в
   bounded prototype уровней 10–15.

Точный haptic физически не извлекается из screen recording. Semantic events
зафиксированы для реализации; интенсивность принимается оператором на
устройстве в Review 4 и больше не блокирует AR-E/S/P.

## Reference parity checklist

### Правило и состояние

- [ ] Tap принимается только по live arrow; промах по фону не меняет state.
- [ ] Legal move определяется свободным exit-ray от head; rigid-body sweep не
      используется.
- [ ] Успешный tap удаляет ровно одну стрелку.
- [ ] Заблокированный tap не меняет геометрию поля.
- [ ] Один blocked tap отнимает ровно одну жизнь.
- [ ] После третьей ошибки раунд переходит в fail.
- [ ] Победа наступает только при `remainingArrowCount === 0`.
- [ ] Несколько корректных порядков удаления принимаются одинаково.
- [ ] Restart возвращает exact initial state, lives и camera state.

### Motion и feedback

- [ ] Первый видимый ответ на tap начинается за `≤33 ms`.
- [ ] Exit движется со скоростью `32–40` grid units/s после acceleration.
- [ ] Total exit duration вычисляется из arc-length и попадает в measured
      samples `375–700 ms`.
- [ ] Tail проходит по исходной polyline, head продолжает прямой `exitDir`.
- [ ] После exit в clip остаётся `0 px` выбранного stroke.
- [ ] Exit не использует fade, bounce-back или вращение.
- [ ] Вся выбранная polyline становится blue-accent в первый frame; цвет
      возвращается к base stroke за `160–233 ms`.
- [ ] Tap ripple видим `200–333 ms` и не перекрывает наконечник.
- [ ] Directional blur не мешает узнать polyline в первой половине движения.
- [ ] Tap haptic вызывается один раз на каждый принятый tap.
- [ ] Blocked tap вызывает обычный tap haptic и один семантически более сильный
      error haptic.
- [ ] Blocked geometry сдвигается на `0 px`.
- [ ] Card wash длится `500–566 ms`, достигая peak за `100–133 ms`.
- [ ] Blocked polyline остаётся coral/red до удаления или restart.
- [ ] Одно сердце сереет за `≤33 ms`; cue различим не только цветом.
- [ ] После третьей ошибки modal начинается через `966–1,100 ms` и settles за
      `167–233 ms`.
- [ ] Последний exit и начало success feedback разделены не более чем `150 ms`.

### Layout и камера

- [ ] Фон светлый нейтральный; gameplay читается без декоративной иллюстрации.
- [ ] Grid dots остаются вторичными: их контраст не превышает `10%` контраста
      основной линии.
- [ ] Основные линии используют единый stroke `0.11–0.14` cell.
- [ ] Small board fit-ится за `370–530 ms`.
- [ ] Большое поле проходит overview phase за `1.90–2.04 s` и play-scale phase
      за `2.16–2.30 s`.
- [ ] В overview ни одна initial arrow не обрезана.
- [ ] В play scale stroke/cell не мельче утверждённого readable minimum.
- [ ] Bounded prototype не требует manual pan/pinch или reframe после хода.
- [ ] Gameplay layout не содержит размытую боковую заливку и сторонние
      рекламные баннеры из ролика.
- [ ] Compact и tall portrait используют одну геометрию уровня, меняя только
      camera fit и safe margins.

### Platform behavior

- [ ] Autoplay использует deterministic legal trace.
- [ ] Takeover продолжает exact autoplay state без restart или скрытого хода.
- [ ] Host pause замораживает exit/camera animations без изменения результата.
- [ ] Первый live frame визуально совпадает с cover.
- [ ] Completion отправляется ровно один раз.

## Level-design contract

### Почему reverse construction

Если целевой порядок удаления — `a1, a2, …, an`, уровень строится из пустого
поля в обратном порядке `an, …, a2, a1`.

При добавлении `ai`:

1. exit-ray `ai` обязан быть свободен относительно уже размещённых
   `ai+1…an`;
2. `ai` желательно блокирует хотя бы одну уже размещённую позднюю стрелку;
3. все path/spacing-инварианты валидируются;
4. после полной сборки solver подтверждает хотя бы одно решение;
5. отдельный enumerator оценивает альтернативные порядки и branching.

Так construction гарантирует один witness trace, но не гарантирует хорошую
сложность. Taste формируется фильтрами и серийным review.

### Difficulty features

| Feature | Смысл |
| --- | --- |
| `arrowCount` | объём чтения и длительность |
| `occupiedCellCount` | визуальная плотность с учётом длины polyline |
| `initialLegalCount` | сколько очевидных стартов |
| `forcedPrefixLength` | длина однозначного начала |
| `meanLegalBranching` | среднее число безопасных выборов |
| `dependencyDepth` | длина максимальной цепочки разблокировок |
| `dependencyWidth` | параллельные независимые ветви |
| `blockedTapExposure` | доля визуально правдоподобных, но blocked arrows |
| `turnCount` | число углов в polyline и стоимость визуального трекинга |
| `solutionOrderEntropy` | разнообразие допустимых порядков |
| `cameraScaleMin` | насколько мелким становится поле |

Плотность сама по себе не является сложностью: кандидат с большим
`arrowCount`, но широким набором legal moves, может быть проще меньшего поля с
длинной dependency chain.

### Пять прототипных уровней

Утверждено не копировать layouts 10–15. Все шесть уровней задают target band;
фабрика синтезирует пять собственных уровней:

| Уровень | Цель | Предварительный target |
| ---: | --- | --- |
| 1 | быстро считать правило | `8–10` arrows, `2–3` initial legal, depth `2–3` |
| 2 | увидеть первое освобождение цепочки | `10–12`, forced prefix `1–2`, depth `3` |
| 3 | выбрать между двумя ветвями | `12–15`, branching `2–3`, depth `3–4` |
| 4 | удержать длинную зависимость | `15–18`, depth `4–5`, scale `≥0.9×` |
| 5 | верх target-band без скачка | `18–22`, depth `5–6`, initial legal `2–4` |

Точные диапазоны калибруются после разметки референсных layouts. Уровень 15
утверждён как holdout для visual/difficulty review и не пересобирается
буквально.

## Rights boundary

Не копируем:

- название, иконку, логотип, тексты и store creative;
- точные layouts уровней 10–15;
- фирменные цвета, шрифты, звук, haptic pattern и win-art как assets;
- рекламные элементы и монтаж ролика.

Сохраняем как genre/fidelity contract:

- правило порядка освобождения;
- темп и направление exit-motion;
- минималистичную информационную иерархию;
- auto-fit/reframe как функцию читаемости;
- сложностной диапазон, но не конкретные карты.

Собственная visual identity создаётся через SkinSpec; baseline skin остаётся
theme-neutral и не встраивается в engine.

## Disposition AR-R

- Эталон, target band и собственная five-level policy: **утверждены**.
- Polyline path-following/ray rule: **утверждён**.
- Успешный exit, blocked feedback, lives и adaptive intro camera:
  **измерены по native evidence**.
- Reverse-construction: **готова для AR-S/F design**.
- Haptic semantics: **утверждены**; физическая интенсивность остаётся
  acceptance-параметром Review 4.
- AR-R disposition: **ready for parallel implementation**.
