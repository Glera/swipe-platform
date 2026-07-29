# TT-R: reference packet — Triple-tile

- Дата исследовательского среза: **29.07.2026**
- Статус: **Review 1/2 — research / blocked on operator choice**
- Рекомендованный primary reference: **Triple Tile: Match Puzzle Game**
- Рекомендованный secondary reference: **Zen Match**
- Предлагаемый target band: **Triple Tile Levels 20–30**
- Связанный brief: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)

> Пакет фиксирует taxonomy boundary и предлагает точный эталон. Он не
> разрешает gameplay-код, presentation work, rollout или копирование
> референсных layouts/assets. До решения оператора primary, target levels и
> fidelity defaults остаются proposal.

## Обозначения authority

- `R` — наблюдено или измерено по указанному reference evidence;
- `O` — явно утверждено оператором;
- `P` — предложение для следующего review;
- `B` — blocking: значения или evidence недостаточно для presentation work.

`R-web` означает наблюдение по публичной записи или store/help-материалу.
Публичные walkthrough могут относиться к старой версии приложения, поэтому
не заменяют `R-native` из записи утверждённого оператором current build.

## Taxonomy boundary

### Выбранное ядро (`O`)

```text
tap exposed tile
  -> tile moves into a bounded bottom tray
  -> three identical tray tiles auto-remove
  -> clear every board tile to win
  -> fill/overflow the tray to fail
```

Плитка доступна только тогда, когда ни одна live tile не перекрывает её по
утверждённому exposure contract. Пространственное чтение слоёв и управление
давлением tray — одна механика.

### Что не входит в этот класс (`O`)

| Соседний класс | Другое ядро | Почему не объединяем |
| --- | --- | --- |
| Mahjong Solitaire | две одинаковые свободные плитки удаляются прямо с поля | нет tray-pressure; другая availability rule и solver |
| Tile sorting | предметы распределяются по контейнерам/ячейкам | цель — сортировка пространства, а не exposure graph |
| Swap Match-3 | соседние элементы меняются местами и создают линии/каскады | другой input, board transition и генерация |
| Hidden-object | предмет ищется по сцене/списку, обычно без tray triples | визуальный поиск не задаёт тот же дискретный state |

Маркетинговые слова `mahjong`, `match-3`, `3D` и `zen` в store listing не
меняют taxonomy. Класс определяется переходом состояния, а не тегом.

## Источники

| ID | Источник | Что подтверждает | Ограничение |
| --- | --- | --- | --- |
| `TT-R-S1` | [Triple Tile — App Store](https://apps.apple.com/us/app/triple-tile-match-puzzle-game/id1572661625) | identity, clear-by-triples, layered layouts, progression, market proxy, version snapshot | нет точных tray/timing |
| `TT-R-S2` | [Triple Tile Level 20 — no boosters](https://www.youtube.com/watch?v=okG_yeEDoI8) | lower target anchor, successful round, no-booster path, public duration | third-party recording; old/unknown build |
| `TT-R-S3` | [Triple Tile Level 30 walkthrough](https://www.youtube.com/watch?v=ZBxxq-RZ3VM) | upper target anchor, layering, tray pressure, load/win choreography | third-party recording; old/unknown build; touch/haptic не видны |
| `TT-R-S4` | [Zen Match — App Store](https://apps.apple.com/us/app/zen-match-relaxing-puzzle/id1560124228) | identity, triple clear, progression/meta, version snapshot | нет точных timing |
| `TT-R-S5` | [Zen Match: How do I play?](https://support.zenmatchgame.com/hc/en-us/articles/9516848294034-How-do-I-play-Zen-Match) | holder, triples, clear/fail semantics, lives | help illustration не является fidelity evidence |
| `TT-R-S6` | [Zen Match: Boosters](https://support.zenmatchgame.com/hc/en-us/articles/9516941992722-How-can-I-use-Boosters-to-enhance-my-game) | usual capacity `7`, extra slot `8`, undo/shuffle/magnet/spring/plane | booster-rich current game, не bounded baseline |
| `TT-R-S7` | [Zen Match: tricky levels](https://support.zenmatchgame.com/hc/en-us/articles/9517005346322-How-can-I-conquer-tricky-levels) | layers, tray monitoring, matches work across intervening tiles | не задаёт visual insertion order |
| `TT-R-S8` | [Zen Match: blockers](https://support.zenmatchgame.com/hc/en-us/articles/18374346351762-What-are-Blockers) | bomb/box/chain/curtain/hidden/ice/glue/producer/yoga progression | всё это вне первого baseline |
| `TT-R-S9` | [Tile Busters — App Store](https://apps.apple.com/us/app/tile-busters-match-3-tiles/id6443449716) | triple core, blockers, five boosters, time challenge, market proxy | listing не раскрывает точный tray |
| `TT-R-S10` | [Tile Busters Level 30](https://www.youtube.com/watch?v=BS_Ho5bpnu0) | visible layers, seven-slot tray, grouped removal, early blockers, public duration | third-party recording; old/unknown build |
| `TT-R-S11` | [Tile Club — App Store](https://apps.apple.com/us/app/tile-club-matching-game/id1640075364) | triple core, undo/boosters, progression, social wrapper | нет точных tray/timing |
| `TT-R-S12` | [Tile Club Level 30](https://www.youtube.com/watch?v=xuDeVJ316hc) | compact successful round and public duration | third-party recording; old/unknown build |
| `TT-R-S13` | [Tile Family — App Store](https://apps.apple.com/us/app/tile-family-match-puzzle-game/id6444056676) | three identical, seven-tile fail, no timer, hint, strong market proxy | narrative/meta wrapper; нет feel timings |
| `TT-R-S14` | [Tile Family Levels 27–30](https://www.youtube.com/watch?v=zwwVZA7m8wM) | early-band cadence and public aggregate duration | third-party recording; old/unknown build |

Store snapshot на дату среза:

| Reference | Store version | US App Store ratings (`R-web`, market proxy only) |
| --- | --- | ---: |
| Triple Tile | `2.75.03` | `267K` |
| Zen Match | `220000.1.750` | `255K` |
| Tile Busters | `4.0.5` | `51K` |
| Tile Club | `3.5.2` | `37K` |
| Tile Family | `2.05.1` | `280K` |

Ratings показывают наличие устойчивой аудитории, но не качество конкретного
правила, target band или соответствие swipe-формату.

## Сравнение exact core

### Правило, tray и fail

| Reference | Availability / overlap | Tray и порядок | Win / fail | Undo / shuffle / hint |
| --- | --- | --- | --- | --- |
| **Triple Tile** | layered board; tap только видимой верхней плитки (`R-web`) | `7` видимых slots в Level 20/30; совпадение работает по типу; grouped insertion против stable append требует native подтверждения (`R-web/B`) | clear all (`R-web`); точный `7th vs 8th` fail требует current-build fail clip (`B`) | три in-level tools видны в записи; точные semantics/inventory требуют native capture (`B`) |
| **Zen Match** | следить за layers; поздние blockers дополнительно меняют availability (`R-web`) | usual capacity `7`, extra-slot booster даёт `8`; три одинаковые match даже через другие tiles (`R-web`) | clear board или отдельная goal-based цель; overload holder завершает round (`R-web`) | Undo, Super Undo, Shuffle, Magnet; pre-level Plane/Extra Slot/Spring (`R-web`) |
| **Tile Busters** | layered overlap + Ice/Chain/Glue/Tile Maker (`R-web`) | семь slots видны в Level 30; auto-remove triple; insertion order не подтверждён (`R-web/B`) | clear board; также есть blocker/timed fails (`R-web`) | listing заявляет пять boosters; точные функции требуют native capture (`B`) |
| **Tile Club** | layered triple-tile layouts (`R-web`) | bounded tray наблюдается; точный capacity/order не зафиксирован current build (`B`) | clear board; tray fail наблюдаем в genre, но нужен exact clip (`B`) | listing явно называет undo и powerful boosters (`R-web`) |
| **Tile Family** | layered triple-tile board (`R-web`) | `7` tiles; точный visual insertion order не раскрыт (`R-web/B`) | clear all tiles; board/tray filled with `7` tiles loses (`R-web`) | Hint указан явно; остальной набор требует capture (`R-web/B`) |

### Раунд, autoplay-readability и progression

| Reference | Публичный round/action evidence | Autoplay / визуальная плотность | Progression |
| --- | --- | --- | --- |
| **Triple Tile** | Level 20 `1:17`; Level 30 `2:34` (`R-web`); comparative action band `36–60` taps (`P/B`, нужен recount) | правило читается за одну показанную triple; density Level 30 высокая, но symbols и layers различимы (`R-web`) | world map, новые layouts/layers, weekly content; чистый core остаётся центром (`R-web`) |
| **Zen Match** | walkthrough Levels 11–20 занимает `15:23`, около `92 s/level` (`R-web`); comparative action band `45–90` taps (`P/B`) | спокойная сцена и крупные tiles; поздний HUD/meta тяжелее clean feed card (`R-web`) | goal-based levels, blockers, rooms/journey/gems/dailies (`R-web`) |
| **Tile Busters** | Level 30 video `1:11` (`R-web`); comparative `30–45` taps с producer/blockers (`P/B`) | компактная центральная pile хорошо читается; blocker counters повышают semantic density (`R-web`) | Ice, Chain, Glue, Tile Maker, tournaments, time challenges, towns (`R-web`) |
| **Tile Club** | Level 30 video `1:22` (`R-web`); comparative `30–45` taps (`P/B`) | самый компактный ранний cadence среди просмотренных; social/meta UI вне раунда (`R-web`) | `10K+` levels, travel, clubs, tournaments, backgrounds (`R-web`) |
| **Tile Family** | Levels 27–30 video `5:18`, около `80 s/level` (`R-web`); comparative `30–48` taps/level (`P/B`) | обычная средне-плотная pile; narrative wrapper сильнее отделён от core (`R-web`) | story/help framing, frequent level drops, hints (`R-web`) |

Публичные durations нельзя переносить в prototype как обязательные числа:
swipe-card требует более короткого собственного уровня. Они полезны только для
сравнения плотности и выбора band.

## Recommendation Review 1/2

### Primary: Triple Tile (`P`)

Причины:

1. чистое ядро остаётся главным содержанием уровня без обязательных blockers;
2. сильный market proxy и длинная level-линейка;
3. Level 20 и Level 30 дают два доступных no-special anchors;
4. высокая визуальная ясность overlap и tray pressure;
5. presentation достаточно выразительна для fidelity-разбора, но не требует
   тяжёлой real-time симуляции.

### Secondary: Zen Match (`P`)

Используем для проверки:

- capacity `7` и временного расширения;
- match-by-type независимо от расстояния между tiles в holder;
- зрелой семантики undo/shuffle;
- карты поздних blockers, чтобы сознательно исключить их из v1.

Не переносим room/meta, goal-based уровни, blocker zoo и монетизационную
каденцию.

### Target band: Triple Tile Levels 20–30 (`P`)

- **Level 20** — lower anchor: no-booster success, уже не tutorial.
- **Levels 21–29** — sampling band для tile count/type count/layer depth.
- **Level 30** — upper holdout: не копируется как layout; используется для
  perceived difficulty, tray pressure и fidelity.

Перед Review 3 оператор должен подтвердить тот же band на current build:
store levels могли измениться. Если Level 20 теперь tutorial-like либо Level
30 содержит special rule, band пересматривается, а не подгоняется документ.

## Конкретный recording plan

### Public provisional slices (`R-web`)

Из `TT-R-S3`, Triple Tile Level 30:

| Участок | Что разбирать |
| --- | --- |
| `00:00–00:08` | board reveal/load, первый доступный tap, tile-to-tray trajectory |
| `00:55–01:35` | mixed tray, одинаковые tiles, insertion/grouping, compression после triple |
| `02:20–02:34` | последние triples, board clear, win cadence |

Эти timecodes служат только navigation aids. Они не закрывают feel-table
из-за неизвестной версии, монтажа, fps и отсутствия touch/haptic evidence.

### Required native capture (`P/B`)

Запись утверждённого current build, portrait, native resolution, `60 fps`
если устройство поддерживает:

1. полный успешный Level 20 без boosters;
2. полный успешный Level 30 без boosters;
3. Level 25 либо ближайший midpoint для проверки ladder;
4. намеренный tap по covered/unavailable tile;
5. намеренный tray fail;
6. пример, где новый tile совпадает с уже лежащим, но не соседним в tray;
7. один Undo, один Shuffle и один Hint/closest equivalent;
8. последний triple, win и restart;
9. touch indicator или отдельный input log;
10. короткая операторская заметка по haptic/audio, которые screen recording
    физически не фиксирует.

## Feel: preliminary targets

Таблица отделяет предложения от reference evidence. Presentation work
**заблокирован**, пока каждое `P/B` не будет заменено/подтверждено числом
`R-native` либо явным решением `O`.

| Параметр | Preliminary target | Статус | Что требуется |
| --- | ---: | :---: | --- |
| Tap -> первый visual response | `≤50 ms` | `P/B` | touch indicator + 60-fps current-build clip |
| Tile lift/selection phase | `40–80 ms`, scale `1.00 -> 1.04` | `P/B` | frame measurement |
| Tile flight to tray | `220–320 ms` | `P/B` | минимум 6 paths разной длины |
| Flight trajectory | quadratic arc, peak normal offset `0.04–0.08` card width | `P/B` | измерить reference path в screen coordinates |
| Flight easing | fast launch + `ease-out`, без overshoot | `P/B` | curve fit по frames |
| New tile insertion | после same-type run, иначе append | `P/B` | non-adjacent same-type capture |
| Tray rearrange/compression | `140–220 ms`, stable relative order остальных | `P/B` | before/after slot positions |
| Triple recognition delay after landing | `50–100 ms` | `P/B` | frame measurement |
| Triple removal | `180–260 ms`, scale/fade together | `P/B` | current successful triple clip |
| Newly exposed tile enable | не позже `50 ms` после logical removal cover | `P/B` | chained tap clip |
| Covered/unavailable tap onset | `≤50 ms` | `P/B` | deliberate invalid tap |
| Covered feedback | `120–180 ms` pulse; geometry не перемещается | `P/B` | reference may use another cue |
| Board load/settle | `450–750 ms` | `P/B` | current L20/L30 start |
| Camera after settle | static; no per-move zoom/reframe | `P/B` | verify full successful round |
| Accepted-tap haptic | `selection/light`, `0–20 ms` | `P/B` | operator device review |
| Triple haptic | `success/soft`, at removal onset | `P/B` | operator device review |
| Unavailable/fail haptic | `warning/rigid`, at visual onset | `P/B` | operator device review |
| Last triple -> win onset | `200–350 ms` | `P/B` | current win clip |
| Win feedback duration before completed | `650–950 ms` | `P/B` | platform cadence review |
| Fail recognition -> fail UI | `300–500 ms` | `P/B` | exact seven/eight-slot fail clip |
| First live frame -> first autoplay tap | `≤650 ms` | `P/B` | platform proposal |
| First live frame -> first autoplay triple | `≤2.20 s` | `P/B` | time-to-rule acceptance |

### Blocked facts

- exact tray capacity/fail threshold in current Triple Tile;
- stable append versus grouped insertion;
- whether input is accepted while another tile is in flight;
- whether exposure changes logically at tap, landing or triple removal;
- covered-tap visual/audio/haptic;
- exact fail and revive choreography;
- exact current booster set and whether any are mandatory in target levels.

## Preliminary reference parity checklist

Каждый пункт становится acceptance только после `O` и заполнения
`R-native` чисел.

### Rule and state

- [ ] Tap принимается только по live exposed tile.
- [ ] Любая overlap dependency имеет единственный deterministic outcome.
- [ ] Accepted tile удаляется из board state ровно один раз.
- [ ] Exact tray order после каждого tap воспроизводим.
- [ ] Три одинаковых удаляются независимо от промежуточных типов.
- [ ] Triple resolve происходит до проверки tray fail.
- [ ] Seventh/eighth-slot boundary совпадает с утверждённой fail policy.
- [ ] Clear board даёт win только после завершения обязательных resolves.
- [ ] Restart возвращает exact initial board, tray и RNG-independent state.
- [ ] Boosters не требуются ни одному solver witness v1.

### Motion and feedback

- [ ] Первый visible response начинается за утверждённый tap budget.
- [ ] Tile-to-tray flight использует утверждённые duration/path/easing.
- [ ] Long и short paths не меняют logical input semantics.
- [ ] Same-type insertion/rearrange совпадает с reference.
- [ ] Остальные tray tiles сохраняют deterministic stable order.
- [ ] Triple removal начинается после утверждённого recognition delay.
- [ ] Removal не скрывает tray occupancy дольше утверждённого budget.
- [ ] Covered tap не меняет board/tray state.
- [ ] Haptic semantics различают accepted, triple и unavailable/fail.
- [ ] Sound-off сохраняет полный gameplay feedback.

### Layout, autoplay and lifecycle

- [ ] Все tiles target level читаемы в compact и tall portrait.
- [ ] Symbol различим по силуэту/line detail, а не только цвету.
- [ ] Board settle укладывается в утверждённый load budget.
- [ ] Первый autoplay triple завершён за утверждённый time-to-rule.
- [ ] Autoplay использует deterministic no-booster witness.
- [ ] Takeover продолжает exact board+tray state без reset.
- [ ] Host pause замораживает flight/rearrange/removal clocks.
- [ ] Cover совпадает с первым live frame до board choreography.
- [ ] Win/fail completion отправляется ровно один раз.

## IP / art boundary

### Не копируем (`O`)

- названия, logos, icons, store creatives и тексты;
- exact layouts и sequence target levels;
- exact symbol set, рисунок tile face, palette, shadows и background;
- UI chrome, booster icons, map/meta, audio и haptic pattern как assets;
- анимационные кривые как извлечённые proprietary assets.

### Собственный symbol set (`P`)

Baseline-набор **Garden Curios**:

1. acorn;
2. ginkgo leaf;
3. spiral shell;
4. paper kite;
5. teacup;
6. watering can;
7. lantern;
8. ribbon bow;
9. mushroom;
10. cloud;
11. sunburst;
12. crescent moon.

Каждый symbol получает собственный silhouette, внутренний line-detail и
semantic id. Target band использует подмножество `8–10` типов (`P`).
Gameplay должен оставаться читаемым на theme-neutral debug glyphs до
подключения first-party skin.

### SkinSpec requirements (`P`)

- `symbolSetId` + version и provenance для каждого SVG;
- tile face/base/edge/shadow tokens;
- exposed, covered, selected, in-flight и tray states;
- tray slot, capacity-warning и fail tokens;
- background, safe margins, success particles;
- sound/haptic semantic mappings отдельно от assets;
- contrast и color-independent readability checks;
- compact/tall scale constraints;
- owned/generated provenance и replaceability каждого asset;
- deterministic mapping `tileType -> symbolKey`, не принадлежащий engine.

## Решение, требуемое от оператора

Минимальный Review 2 input:

- [ ] primary: Triple Tile либо другой exact-core reference;
- [ ] target: Levels `20–30`, включая lower/mid/holdout exact ids;
- [ ] native recordings из recording plan;
- [ ] обязательные feel-моменты;
- [ ] tray slot count, fail-on-fill/overflow и insertion/grouping policy;
- [ ] boosters, явно исключённые из v1;
- [ ] haptic/audio expectations;
- [ ] допустимая длительность собственного swipe-уровня;
- [ ] разрешение перейти к Review 3 class brief.

## Disposition TT-R

- Taxonomy: **accept split** — Triple-tile и Mahjong Solitaire разные классы.
- Priority: **research complete enough for operator choice**.
- Primary/secondary/band: **proposal, not approved**.
- Fidelity: **blocked on native current-build evidence and defaults**.
- Gameplay/presentation code: **не разрешён**.
