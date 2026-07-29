# TT-R: reference packet — Triple-tile

- Дата исследовательского среза: **29.07.2026**
- Статус: **Review 3 logic GO / TT-P blocked on primary fidelity**
- Primary reference: **Triple Tile: Match Puzzle Game (`O`)**
- Secondary reference: **Zen Match (`O`)**
- Target captures: **Triple Tile Levels 20 / 25 / 30 (`O`)**
- Связанный brief: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)
- Независимое ревью:
  [`REVIEW-INDEPENDENT-2026-07-29.md`](REVIEW-INDEPENDENT-2026-07-29.md)

> Пакет фиксирует taxonomy boundary и утверждённый эталон. Он не
> разрешает gameplay-код, presentation work, rollout или копирование
> референсных layouts/assets. Оператор утвердил fail-on-7th и разрешил
> solver-first разработку TT-G/TT-S/TT-E после merge. Fidelity defaults
> остаются blocking до TT-P.

## Обозначения authority

- `R` — наблюдено или измерено по указанному reference evidence;
- `O` — явно утверждено оператором;
- `P` — предложение для следующего review;
- `B` — blocking: значения или evidence недостаточно для presentation work.

`R-web` означает наблюдение по публичной записи или store/help-материалу.
`R-native-secondary` означает измерение по operator-provided current-build
записи secondary reference: оно закрывает observed behavior, но не заменяет
primary fidelity capture. Публичные walkthrough могут относиться к старой
версии приложения, поэтому не заменяют `R-native-primary`.

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
| `TT-R-S15` | Operator-provided Zen Match Level 17 recording, SHA-256 `18101e019f8a2b2f6241bff67f16d9b16eae1ddf2fac9e126651d3e96e4e68fb` | current-build grouped insertion, concurrent flights, seven visible slots, successful win and Level 18 entry | secondary reference; no fail, touch indicator, audible audio or haptic evidence |

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
| **Triple Tile** | layered board; tap только видимой верхней плитки (`R-web`) | `7` видимых slots в Level 20/30; совпадение работает по type; visual grouping требует primary capture только для TT-P (`R-web/B`) | clear all (`R-web`); reference boundary не снят clip, но v1 утверждён как fail-on-7th (`O`) | три in-level tools видны, но весь booster/tool contour исключён из v1 (`R-web/O`) |
| **Zen Match** | следить за layers; поздние blockers дополнительно меняют availability (`R-web`) | usual capacity `7`, extra-slot booster даёт `8`; три одинаковые match даже через другие tiles (`R-web`) | clear board или отдельная goal-based цель; overload holder завершает round (`R-web`) | Undo, Super Undo, Shuffle, Magnet; pre-level Plane/Extra Slot/Spring (`R-web`) |
| **Tile Busters** | layered overlap + Ice/Chain/Glue/Tile Maker (`R-web`) | семь slots видны в Level 30; auto-remove triple; insertion order не подтверждён (`R-web/B`) | clear board; также есть blocker/timed fails (`R-web`) | listing заявляет пять boosters; точные функции требуют native capture (`B`) |
| **Tile Club** | layered triple-tile layouts (`R-web`) | bounded tray наблюдается; точный capacity/order не зафиксирован current build (`B`) | clear board; tray fail наблюдаем в genre, но нужен exact clip (`B`) | listing явно называет undo и powerful boosters (`R-web`) |
| **Tile Family** | layered triple-tile board (`R-web`) | `7` tiles; точный visual insertion order не раскрыт (`R-web/B`) | clear all tiles; board/tray filled with `7` tiles loses (`R-web`) | Hint указан явно; остальной набор требует capture (`R-web/B`) |

### Раунд, autoplay-readability и progression

| Reference | Публичный round/action evidence | Autoplay / визуальная плотность | Progression |
| --- | --- | --- | --- |
| **Triple Tile** | Level 20 `1:17`; Level 30 `2:34` (`R-web`); comparative action band `36–60` taps (`P/B`, нужен recount) | правило читается за одну показанную triple; density Level 30 высокая, но symbols и layers различимы (`R-web`) | world map, новые layouts/layers, weekly content; чистый core остаётся центром (`R-web`) |
| **Zen Match** | walkthrough Levels 11–20 занимает `15:23`, около `92 s/level` (`R-web`); supplied Level 17 round занимает около `98 s` от раскрытого board до win onset (`R-native-secondary`) | спокойная сцена и крупные tiles; current recording показывает тяжёлый HUD, crowns/goals и meta (`R-native-secondary`) | goal-based levels, blockers, rooms/journey/gems/dailies (`R-web/R-native-secondary`) |
| **Tile Busters** | Level 30 video `1:11` (`R-web`); comparative `30–45` taps с producer/blockers (`P/B`) | компактная центральная pile хорошо читается; blocker counters повышают semantic density (`R-web`) | Ice, Chain, Glue, Tile Maker, tournaments, time challenges, towns (`R-web`) |
| **Tile Club** | Level 30 video `1:22` (`R-web`); comparative `30–45` taps (`P/B`) | самый компактный ранний cadence среди просмотренных; social/meta UI вне раунда (`R-web`) | `10K+` levels, travel, clubs, tournaments, backgrounds (`R-web`) |
| **Tile Family** | Levels 27–30 video `5:18`, около `80 s/level` (`R-web`); comparative `30–48` taps/level (`P/B`) | обычная средне-плотная pile; narrative wrapper сильнее отделён от core (`R-web`) | story/help framing, frequent level drops, hints (`R-web`) |

Публичные durations нельзя переносить в prototype как обязательные числа:
swipe-card требует более короткого собственного уровня. Они полезны только для
сравнения плотности и выбора band.

## Review 2 operator decision

### Primary: Triple Tile (`O`)

Причины:

1. чистое ядро остаётся главным содержанием уровня без обязательных blockers;
2. сильный market proxy и длинная level-линейка;
3. Level 20 и Level 30 дают два доступных no-special anchors;
4. высокая визуальная ясность overlap и tray pressure;
5. presentation достаточно выразительна для fidelity-разбора, но не требует
   тяжёлой real-time симуляции.

### Secondary: Zen Match (`O`)

Используем для проверки:

- capacity `7` и временного расширения;
- match-by-type независимо от расстояния между tiles в holder;
- grouped insertion и приёма быстрых taps во время flight;
- карты поздних blockers, чтобы сознательно исключить их из v1.

Не переносим room/meta, goal-based уровни, golden-crown collection, blocker
zoo, boosters и монетизационную каденцию (`O`).

### Target band: Triple Tile Levels 20 / 25 / 30 (`O`)

- **Level 20** — lower anchor: no-booster success, уже не tutorial.
- **Level 25** — exact midpoint capture для tile count/type count/layer depth.
- **Level 30** — upper holdout: не копируется как layout; используется для
  perceived difficulty, tray pressure и fidelity.

Если current Level 20 теперь tutorial-like либо Level 30 содержит special
rule, отклонение фиксируется evidence и band возвращается оператору, а не
подгоняется документ.

### Bounded swipe rules (`O`)

- Никаких in-level или pre-level boosters: без Undo, Shuffle, Hint, revive,
  extra slot и continue.
- Fail ведёт только к replay того же deterministic уровня; booster
  monetization не является целью.
- Golden crowns, collectible goals и аналогичная progression/meta логика из
  `TT-R-S15` игнорируются.
- Единственная win condition v1: board empty и tray empty после auto-resolve.

### Что закрыла supplied запись (`R-native-secondary`)

`TT-R-S15` — portrait `384×832`, `108.27 s`, около `29.87 fps`; game board
полностью виден примерно с `00:01`, win onset — около `01:39`.
Метод: container timing + покадровые contact sheets с шагом `100 ms`;
таймкоды сняты по frame PTS, не по captions/player subtitles.

- Между `00:48.2–00:48.7` одновременно видны несколько выбранных tiles in
  flight: следующий tap принимается до settle предыдущей плитки.
- Между `00:57.5–00:58.5` второй flame вставляется рядом с первым, сдвигая
  уже лежащий справа pomegranate: presentation использует grouped insertion.
- Tray показывает семь visual slots.
- Level 18 entry показывает сильно перекрытые и полностью скрытые faces.
  Это evidence риска F2, но не разрешение переносить hidden-face rule.
- Audio track фактически silent; haptics screen recording не фиксирует.
- Намеренного fail нет, поэтому запись не доказывает reference boundary;
  operator authority утвердил для v1 fail-on-7th (`O`).

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

### Logic decision (`O`)

Оператор утвердил fail-on-7th:

1. если placement завершает triple и post-resolve occupancy меньше `7`, ход
   безопасен;
2. если post-resolve occupancy достигает `7`, round немедленно завершается
   fail;
3. attempted eighth не является отдельным состоянием baseline.

Быстрые taps во время flight уже подтверждены `TT-R-S15`. Grouped insertion
не является logical input: она перенесена в full feel packet. Intentional
primary fail clip теперь optional parity evidence для TT-P, не blocker logic.

### Full feel capture before TT-P (`P/B`)

Запись утверждённого current Triple Tile build, portrait, native resolution,
`60 fps` если устройство поддерживает:

1. полный успешный Level 20 без boosters;
2. полный успешный Level 25 без boosters;
3. полный успешный Level 30 без boosters;
4. load/settle и первый accepted tap;
5. минимум шесть short/long flight paths;
6. намеренный tap по covered/unavailable tile;
7. non-adjacent same-type insertion и compression после triple;
8. эпизод с сильно частично перекрытым symbol: измерить visible diagnostic
   fraction и проверить, требует ли выбор знания закрытого type;
9. последний triple, win и restart/replay;
10. touch indicator или отдельный input log;
11. короткая операторская заметка по haptic/audio, которые screen recording
    физически не фиксирует.

Booster, crown/meta и revive clips не требуются (`O`).

## Feel: preliminary targets

Таблица отделяет предложения от reference evidence. Presentation work
**заблокирован**, пока каждое `P/B` не будет заменено/подтверждено числом
`R-native` либо явным решением `O`.

| Параметр | Preliminary target | Статус | Что требуется |
| --- | ---: | :---: | --- |
| Tap -> первый visual response | `≤50 ms` | `P/B` | touch indicator + 60-fps current-build clip |
| Tile lift/selection phase | `40–80 ms`, scale `1.00 -> 1.04` | `P/B` | frame measurement |
| Tile flight to tray | primary target `220–320 ms`; supplied Zen paths visually около `300–400 ms` | `R-native-secondary/P/B` | минимум 6 primary paths разной длины |
| Flight trajectory | quadratic arc, peak normal offset `0.04–0.08` card width | `P/B` | измерить reference path в screen coordinates |
| Flight easing | fast launch + `ease-out`, без overshoot | `P/B` | curve fit по frames |
| Input during another flight | accepted; logical actions serial, flights may overlap | `R-native-secondary/P` | primary parity before TT-P |
| New tile insertion | presentation: после same-type run, иначе append | `R-native-secondary/P/B` | primary non-adjacent same-type capture |
| Tray rearrange/compression | `140–220 ms`, stable relative order остальных | `P/B` | before/after slot positions |
| Triple recognition delay after landing | `50–100 ms` | `P/B` | frame measurement |
| Triple removal | `180–260 ms`, scale/fade together | `P/B` | current successful triple clip |
| Newly exposed tile enable | не позже `50 ms` после logical removal cover | `P/B` | chained tap clip |
| Covered/unavailable tap onset | `≤50 ms` | `P/B` | deliberate invalid tap |
| Covered feedback | `120–180 ms` pulse; geometry не перемещается | `P/B` | reference may use another cue |
| Board load/settle | `300–450 ms` from scene visible to input-ready | `P/B` | current L20/L25/L30 start |
| Camera after settle | static; no per-move zoom/reframe | `P/B` | verify full successful round |
| Accepted-tap haptic | `selection/light`, `0–20 ms` | `P/B` | operator device review |
| Triple haptic | `success/soft`, at removal onset | `P/B` | operator device review |
| Unavailable/fail haptic | `warning/rigid`, at visual onset | `P/B` | operator device review |
| Last triple -> win onset | `200–350 ms` | `P/B` | current win clip |
| Win feedback duration before completed | `650–950 ms` | `P/B` | platform cadence review |
| Fail recognition -> fail UI | `300–500 ms` | `P/B` | exact seven/eight-slot fail clip |
| Scene visible -> first autoplay tap | `≤650 ms` | `P/B` | includes settle; removes F3 contradiction |
| Scene visible -> first autoplay triple | `≤2.20 s` | `P/B` | overlapping flights allowed; device acceptance |

### TT-P blocked facts

- minimum readable diagnostic fraction для partially covered symbols;
- primary grouped-insertion timings, covered-tap visual/audio/haptic,
  camera/load и win/fail cadence — blockers только TT-P;
- haptic/audio expectations; supplied audio silent.

## Preliminary reference parity checklist

Каждый пункт становится acceptance только после `O` и заполнения
`R-native` чисел.

### Rule and state

- [ ] Tap принимается только по live exposed tile.
- [ ] Любая overlap dependency имеет единственный deterministic outcome.
- [ ] Accepted tile удаляется из board state ровно один раз.
- [ ] Logical tray multiset после каждого tap воспроизводим и не зависит от
  visual insertion order.
- [ ] Canonical tray encoding не содержит zero counts и сортируется по
  stable `TileTypeId`.
- [ ] Три одинаковых удаляются независимо от промежуточных типов.
- [ ] Triple resolve происходит до проверки tray fail.
- [ ] Seventh/eighth-slot boundary совпадает с утверждённой fail policy.
- [ ] Clear board даёт win только после завершения обязательных resolves.
- [ ] Restart возвращает exact initial board, tray и RNG-independent state.
- [ ] Ни один booster/revive/continue не существует в ruleset v1.
- [ ] Быстрые accepted taps сериализуются атомарно; flights могут
  перекрываться без stale-state read.

### Motion and feedback

- [ ] Первый visible response начинается за утверждённый tap budget.
- [ ] Tile-to-tray flight использует утверждённые duration/path/easing.
- [ ] Long и short paths не меняют logical input semantics.
- [ ] Same-type insertion/rearrange совпадает с presentation reference.
- [ ] Остальные tray tiles сохраняют deterministic stable order.
- [ ] Triple removal начинается после утверждённого recognition delay.
- [ ] Removal не скрывает tray occupancy дольше утверждённого budget.
- [ ] Covered tap не меняет board/tray state.
- [ ] Haptic semantics различают accepted, triple и unavailable/fail.
- [ ] Sound-off сохраняет полный gameplay feedback.

### Layout, autoplay and lifecycle

- [ ] Все tiles target level читаемы в compact и tall portrait.
- [ ] Symbol различим по силуэту/line detail, а не только цвету.
- [ ] Witness не требует знания type ниже утверждённого visible diagnostic
  fraction.
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
semantic id. Один swipe-уровень использует подмножество `4–6` типов (`P`):
при minimum `6` tiles/type и prototype bound `39` седьмой type
неконструируем.
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

## Operator input after Review 2

Закрыто:

- [x] primary **Triple Tile**, secondary **Zen Match** (`O`);
- [x] target captures **20 / 25 / 30** (`O`);
- [x] без boosters, revive, extra slot, crown goals и monetization (`O`);
- [x] concurrent taps during flight наблюдены (`R-native-secondary`);
- [x] grouped insertion классифицирована как presentation-only
  (`R-native-secondary` + independent review F1).

Минимум для Review 3 logic:

- [x] fail-on-7th утверждён оператором; седьмая placement, завершившая
  triple и оставившая occupancy `<7`, безопасна (`O`).

Только перед TT-P:

- [ ] full primary feel packet Levels `20 / 25 / 30`;
- [ ] covered/partial-overlap, load, flight, compression, win/replay clips;
- [ ] haptic/audio expectations и допустимый presentation profile.

## Disposition TT-R

- Taxonomy: **accept split** — Triple-tile и Mahjong Solitaire разные классы.
- Priority: **research accepted; Review 3 logic gate closed**.
- Primary/secondary/band и no-booster rule: **approved (`O`)**.
- Logic: **Review 3 GO; TT-G/TT-S/TT-E authorized after merge (`O`)**.
- Fidelity: **blocked on primary current-build feel evidence and defaults**.
- Presentation code/final fidelity: **не разрешены до TT-P inputs**.
