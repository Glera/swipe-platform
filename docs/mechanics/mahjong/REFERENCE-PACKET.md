# MJ-R — Vita Mahjong reference packet

- Дата исследования: `2026-08-01`; transition-delta capture: `2026-08-02`
- Статус: `revised-after-transition-parity-rework`
- Исследователь: Codex `/root`
- Primary reference: Vita Mahjong, Android package `com.vitastudio.mahjong`
- Исследованная версия: `3.32.0` (`versionCode 1817`)
- Устройство: Samsung SM-A326B, Android, `720×1600`, density `300 dpi`
- Официальная карточка: <https://play.google.com/store/apps/details?id=com.vitastudio.mahjong>
- Локальные записи: [`evidence/reference/`](evidence/reference/)

> Это наблюдательный пакет, а не разрешение копировать trade dress, контент,
> бренд или мета-слой Vita Mahjong. Метки `R` ниже означают измеренный или
> непосредственно наблюдавшийся reference-факт; `P` — целевой параметр
> bounded prototype, который должен пройти taste-review.

## Классификация механики

Vita Mahjong — не traditional Mahjong, не чистый classic exposed-pair и не
triple-tile tray. Исследованная версия использует гибрид:

1. Игрок может выбрать только открытую плитку: её не перекрывает плитка выше,
   и свободна хотя бы одна горизонтальная сторона.
2. Выбранная плитка летит в верхний буфер: без пары — в правый свободный
   слот; при уже лежащей парной плитке — непосредственно рядом с ней, сдвигая
   последующие плитки вправо.
3. Две плитки одного вида в буфере сразу исчезают как пара.
4. Четыре несовпавшие плитки заполняют буфер и немедленно дают fail
   `Out of space`.
5. Победа наступает после очистки доски и буфера.

Этим наблюдением закрывается открытый вопрос каталога механик для данного
эталона: для Vita Mahjong нужен **exposed-pair + four-slot holding tray**, а не
triple-tile tray.

## Метод и покрытие

Референс исследован на физическом устройстве через Android screen recording и
последовательные скриншоты. Пройден полный Level 1, отдельно воспроизведены
locked tap, hint, undo, заполнение буфера, fail и restart; просмотрен старт
Level 2. Нативная запись даёт около 60 кадров/с, но отдельные latency-оценки по
ADB screenshot имеют более грубую верхнюю границу и помечены соответственно.

| Сценарий | Покрытие | Evidence |
| --- | --- | --- |
| Первые 10–15 секунд и tutorial | R | `vita-onboarding-60s.mp4` |
| Выбор плитки и очистка пары | R | `vita-pair-clear-12s.mp4` |
| Различающий переход `A,B,A` | R | `vita-tray-aba.mp4`, `vita-tray-aba-contact.png` |
| Locked tap | R | `vita-level1-blocked.png` |
| Hint | R | `vita-hint-12s.mp4`, `vita-hint-active.png` |
| Undo | R | `vita-undo-one.png`, `vita-undo-two.png` |
| Буфер и fail | R | `vita-tray-four.png`, `vita-fail-modal-12s.mp4` |
| Restart | R | `vita-after-restart-tap.png` и полевой журнал ниже |
| Полный success | R | `vita-level1-success-full.mp4`, `vita-success-current.png` |
| Следующая ступень | R | `vita-level2.png`, `vita-level2-fail.png` |

## Первые 10–15 секунд

Tutorial начинает не с текста меню, а с маленькой рабочей сцены. Первая пара
сопровождается коротким объяснением `Match identical tiles...`: первый tap
переносит плитку в видимый четырёхслотовый буфер, второй tap показывает
совпадение и очистку. Следующая сцена — ряд из четырёх плиток: две центральные
закрыты соседями, а снятие крайних демонстрирует правило освобождения. После
этого открывается полноценная доска Level 1.

Считываемая без текста причинная цепочка референса:

```text
tap open tile -> tile inserts beside tray mate (or appends) -> pair bursts
tap blocked tile -> no move + dim/toast
four unmatched in tray -> Out of space
```

## Наблюдаемые состояния

### Legal selection and pair clear

- R: без ранее отложенной плитки того же вида source-плитка летит в правый
  свободный слот.
- R: если в tray уже лежит тот же вид, новая плитка целится в слот сразу после
  него; все последующие unresolved-плитки сдвигаются вправо во время перелёта.
- R: перелёт занимает примерно `400–500 ms`, с плавным торможением к слоту.
- R: после прибытия второй одинаковой плитки пара очищается белой вспышкой и
  лёгкими частицами примерно за `600–800 ms`.
- R: освобождённые плитки становятся доступными после удаления blocker.
- P: engine фиксирует выбор атомарно, presentation проигрывает `430 ms`
  перелёта; pair resolution начинается на settle, следующий input разрешён не
  позже `470 ms` после tap.

### Mate insertion and survivor compaction (`A,B,A`)

Это различающий сценарий: конечное логическое состояние одинаково для
append-only и Vita-семантики, поэтому проверка только результата `[B]` его не
ловит.

| Checkpoint | Наблюдаемое содержимое tray | Наблюдаемое движение |
| --- | --- | --- |
| `t0`, до третьего tap | `[A,B]` | — |
| flight | `[A,_,B→]` | `B` освобождает slot 1 и едет `1→2`; новая `A` летит в slot 1 |
| settle | `[A,A,B]` | одинаковые плитки стоят рядом |
| pair effect | `[×,×,B]` | очищаются соседние slots `0,1`; `B` удерживается в slot 2 |
| compaction | `[B]` | survivor `B` сдвигается `2→0` |

R: в 10 fps contact sheet первый различимый сдвиг `B` начинается во время
полёта третьей `A`; состояние `[A,A,B]` достигнуто к её settle. После начала
pair effect survivor остаётся справа и затем возвращается в первый slot во
второй половине эффекта. Evidence cells идут слева направо, сверху вниз с шагом
`100 ms`, начиная примерно с `1.45 s` клипа `vita-tray-aba.mp4`.

P: incoming flight и insertion shift имеют общий settle; pair burst использует
только соседние slots; post-clear compaction является отдельным наблюдаемым
переходом, а не мгновенной перепроекцией финального массива.

### Locked tap

- R: закрытая плитка не попадает в буфер и не меняет puzzle state.
- R: она кратко сереет; появляется причина вроде `Locked by left and right`.
- R: feedback виден на screenshot, снятом примерно через `120 ms` после tap;
  истинная visual onset по 60 fps записи укладывается в первые кадры.
- P: onset `≤50 ms`, dim/edge shake `180–240 ms`, причина передаётся не только
  цветом; текстовый toast необязателен для первого prototype.

### Hint

- R: hint подсвечивает предложенные одинаковые плитки cyan fill/glow.
- R: onset `≤100 ms`; пульсация продолжается несколько секунд или до действия,
  наблюдавшийся pulse period около `0.9–1.2 s`.
- R: Level 1 показывает free affordance, Level 2 — расходуемый счётчик.
- P: hint строится только solver-ом из текущего состояния, показывает
  безопасный следующий pair plan и никогда не является источником истины для
  engine/factory.

### Undo

- R: каждое нажатие возвращает одну последнюю несовпавшую плитку из буфера на
  её исходное место; два undo последовательно опустошили буфер из двух плиток.
- R: success-экран всё равно сообщил `No mistakes`, то есть эта фраза относится
  к мета-скорингу, а не к логическому контракту.
- P: bounded prototype поддерживает один шаг undo только для последнего
  **неразрешённого** tray placement; очищенную пару не восстанавливает.

### Fail and restart

- R: четвёртая несовпавшая плитка после прибытия даёт немедленный modal
  `Out of space` на затемнённом фоне.
- R: в Level 1 доступны `Revive Free` и `Restart`; в Level 2 revive уже
  расходуемый (`-4 to revive`).
- R: Restart не требует confirm и возвращает игровую доску; коммерческий
  revive относится к meta/monetization, а не к core rule.
- P: prototype сохраняет capacity `4`, modal `No space`, единственную кнопку
  `Restart` и точный возврат к сериализованному initial state. Revive исключён.

### Success

- R: Level 1 завершён полной очисткой; наблюдавшийся success screen:
  `Brilliant!`, `Time 08:25`, `IQ 150.5`, `Combo 40`, CTA Level 2.
- R: полный solve потребовал 35 пар, то есть доска содержала 70 плиток.
- R: три последовательных raw-записи полного прохода суммарно дают примерно
  `7m13s`; экранный таймер включает паузы исследования и capture overhead.
- P: prototype не копирует IQ/combo/progression; он даёт короткий tactile
  success, один раз сообщает host `playable:complete` и остаётся в win-state.

## Числовой feel-разбор

| Параметр | R: reference | P: prototype target | Источник/оговорка |
| --- | ---: | ---: | --- |
| Native viewport | `720×1600` | responsive portrait/landscape | Android device report |
| Частота записи | `≈59.5–60 fps` | `60 fps`, без long frames >50 ms в happy path | ffprobe/frame cadence |
| Плитка на full board | `≈130×160 px` | min face `72×88 CSS px` portrait, hit area `≥72×88` | `vita-level1-board.png` |
| Доля ширины плитки | `≈18%` | `14–20%`, adaptive | screenshot measurement |
| Доска | `≈92% W × 69% H` | `≥88% W`, без overlap controls | screenshot measurement |
| Буфер | `≈340×115 px` | 4 слота, `42–52% W` | x≈190–530, y≈133–248 |
| Слотов | `4` | `4` | direct observation |
| Tap → visual response | `≤120 ms` upper bound | `≤50 ms` | ADB screenshot bound |
| Board → tray | `≈400–500 ms` | `430±40 ms` | 10 fps contact sheet |
| Mate insertion shift | during incoming flight | delay `≈95 ms`, settle together with flight | `vita-tray-aba-contact.png` |
| Adjacent pair hold | `≈100–150 ms` visible `[A,A,B]` checkpoint | `120 ms` | `vita-tray-aba-contact.png` |
| Pair burst | `≈600–800 ms` | `520–720 ms`, non-blocking after logical settle | frame review |
| Survivor compaction after pair | second half of pair effect | delay `360 ms`, slide `240 ms` | `vita-tray-aba-contact.png` |
| Hint onset | `≤100 ms` | `≤100 ms` | screen recording |
| Hint pulse | `≈0.9–1.2 s` | `1.0±0.1 s` | visual estimate |
| Locked feedback | immediate | onset `≤50 ms`, duration `180–240 ms` | screenshot + recording |
| Fail onset | after 4th arrival | `≤100 ms` after settle | direct observation |
| Reference Level 1 | `70 tiles / 35 pairs` | `12–20 tiles / 6–10 pairs` | full success run |
| Prototype duration | n/a | median `20–45 s`, hard target `<60 s` | feed contract adaptation |

## Success path и error path

### Success path

1. Найти две открытые одинаковые плитки.
2. Выбрать первую: без tray-mate она занимает правый свободный слот.
3. Выбрать вторую: она вставляется рядом с mate, последующие плитки уступают
   место, затем соседняя пара очищается и survivors уплотняются влево.
4. Повторять, освобождая верхние и боковые blockers.
5. Очистить доску и пустой буфер.

### Recoverable error

Игрок выбирает открытую плитку без доступной пары. Она остаётся в буфере и
сокращает пространство. Игрок может подобрать её пару позже либо применить
undo. Tap по закрытой плитке не расходует слот.

### Terminal fail

После settle четвёртой плитки engine сначала проверяет pair resolution. Если
совпадения нет и буфер содержит четыре плитки, состояние становится failed.

## Reference parity checklist для Review 4

- [ ] Первый live frame показывает layered board и четыре пустых tray slots.
- [ ] Первое полезное движение autoplay начинается `≤650 ms` после live.
- [ ] Первая законченная пара считывается `≤2.2 s` после live.
- [ ] Legal tap даёт visual response `≤50 ms`.
- [ ] Плитка летит board→tray за `430±40 ms`.
- [ ] При `A,B,A` третья `A` целится в slot 1, а `B` во время flight сдвигается `1→2`.
- [ ] Перед очисткой виден порядок `[A,A,B]`; burst использует соседние slots `0,1`.
- [ ] После pair effect survivor `B` анимированно уплотняется `2→0`, без teleport.
- [ ] Источник освобождается визуально не позже settle выбранной плитки.
- [ ] Две одинаковые tray-плитки очищаются как пара.
- [ ] Pair burst длится `520–720 ms` и не скрывает следующую legal target.
- [ ] Буфер имеет ровно четыре устойчиво видимых места.
- [ ] Четыре разных вида дают fail `≤100 ms` после settle четвёртой плитки.
- [ ] Locked tile не меняет board/tray state.
- [ ] Locked feedback начинается `≤50 ms` и имеет non-color cue.
- [ ] Плитка доступна только без top blocker и при свободной левой или правой стороне.
- [ ] Удаление blocker в том же состоянии открывает зависимую плитку.
- [ ] Hint не предлагает illegal tile и ведёт к solver-proven continuation.
- [ ] Undo возвращает последнюю unresolved tray tile в исходную позицию.
- [ ] Restart восстанавливает byte-equivalent initial logical state.
- [ ] Win возможен только при пустых board и tray.
- [ ] Autoplay не использует скрытые действия и не может привести к fail.
- [ ] Первый manual pointer атомарно останавливает autoplay без reset.
- [ ] Takeover продолжает ровно текущее board/tray state.
- [ ] Портретный target имеет face не меньше `72×88 CSS px` и hit area `≥44 px`.
- [ ] Пять уровней проходят validator и solver с deterministic receipts.
- [ ] Один и тот же level+seed даёт одинаковые state hash и witness trace.
- [ ] Никакие Vita logo, tile faces, room art, copy, sounds или meta-currency не входят в build.
- [ ] На Android WebView нет scroll/zoom/selection во время tap gameplay.
- [ ] Success посылает ровно один host completion event.

## Fidelity deltas, принятые до prototype

| Reference | Prototype | Почему |
| --- | --- | --- |
| 70 плиток, много минут | 12–20 плиток, 20–45 секунд | обязательный feed duration budget |
| Японская комната и Mahjong faces | собственная мягкая геометрическая skin | rights boundary и различимость trade dress |
| IQ, combo, daily/meta, ads | отсутствуют | вне core mechanic |
| Revive/consumables | только deterministic Restart | monetization вне prototype |
| Restart может менять расклад/назначение | точный initial state | reproducibility и QA |
| Длинный текстовый tutorial | autoplay-witness + один короткий lock cue | first-tap gameplay и feed readability |

Эти deltas не меняют причинное ядро: exposed availability, перелёт в четыре
слота, pair clear, пространственное освобождение и риск переполнения.

## Rights boundary

Не копируются: название Vita, логотип, японский интерьер, падающие листья,
jade/brown palette, Mahjong/zodiac faces, тексты, звуки, шрифтовая композиция,
IQ/combo, daily layer, currency, revive economy, реклама и progression UI.

Prototype использует собственные программно нарисованные плитки, абстрактные
геометрические знаки, нейтральную тканевую поверхность, собственную палитру и
синтезированные micro-sounds. Reference evidence хранится только для внутренней
проверки механического feel и не поставляется в playable.

## Оставшиеся исследовательские ограничения

- Audio не был частью надёжно записанного канала, поэтому точный sound parity
  не заявляется; Review 4 оценивает только собственный функциональный sound.
- Restart shuffle в референсе наблюдался качественно, но не доказан как
  детерминированный; prototype сознательно фиксирует restart state.
- ADB screenshot даёт только верхнюю границу latency; точные prototype timings
  проверяются уже browser instrumentation и 60 fps video.

Ни одно из ограничений не меняет rule class и не блокирует MJ-G.
