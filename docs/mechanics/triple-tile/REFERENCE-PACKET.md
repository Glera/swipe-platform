# TT-R: reference packet — Triple-tile

- Дата исследовательского среза: **29.07.2026**
- Статус: **development GO / Zen Match primary / TT-P prototype acceptance**
- Primary reference: **Zen Match (`O`, supersedes Review 2 choice)**
- Secondary reference: **Triple Tile: Match Puzzle Game (`O`)**
- Structural target band: **Zen Match early Levels 6–10 (`O`)**
- Связанный brief: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)
- Независимое ревью:
  [`REVIEW-INDEPENDENT-2026-07-29.md`](REVIEW-INDEPENDENT-2026-07-29.md)

> Пакет фиксирует taxonomy boundary и обновлённый эталон. Оператор разрешил
> разработку и открыл TT-P после смены primary на Zen Match: native Level 17
> — feel authority, early Levels 6–10 — только structural anchors. Rollout и
> копирование exact layouts/assets по-прежнему не разрешены.

## Обозначения authority

- `R` — наблюдено или измерено по указанному reference evidence;
- `O` — явно утверждено оператором;
- `P` — предложение для следующего review;
- `B` — blocking: значения или evidence недостаточно для presentation work.

`R-web` означает наблюдение по публичной записи или store/help-материалу.
`R-native-primary` означает измерение по operator-provided Zen Match
current-build recording. Публичный early-level walkthrough может относиться
к старой версии приложения и используется только для topology/progression
archetypes, не для pixel/layout fidelity.

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
| `TT-R-S15` | Operator-provided Zen Match Level 17 recording, SHA-256 `18101e019f8a2b2f6241bff67f16d9b16eae1ddf2fac9e126651d3e96e4e68fb` | current-build grouped insertion, concurrent flights, sequential triple removal, seven visible slots, successful win and Level 18 entry | primary feel evidence; no cold load, fail, touch indicator, audible audio or haptic evidence |
| `TT-R-S16` | [Zen Match Levels 6–10 walkthrough](https://appsmenow.com/walkthrough/183750-zen-match-relaxing-puzzle/level-6-10) | provisional early progression/topology navigation | 2022 public build; structural archetypes only, never exact layouts or feel timing |

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
| **Triple Tile** | layered board; tap только видимой верхней плитки (`R-web`) | `7` видимых slots в Level 20/30; совпадение работает по type (`R-web`) | clear all (`R-web`); reference boundary не снят clip, но v1 утверждён как fail-on-7th (`O`) | три in-level tools видны, но весь booster/tool contour исключён из v1 (`R-web/O`) |
| **Zen Match** | следить за layers; поздние blockers дополнительно меняют availability (`R-web`) | usual capacity `7`, extra-slot booster даёт `8`; три одинаковые match даже через другие tiles (`R-web`) | clear board или отдельная goal-based цель; overload holder завершает round (`R-web`) | Undo, Super Undo, Shuffle, Magnet; pre-level Plane/Extra Slot/Spring (`R-web`) |
| **Tile Busters** | layered overlap + Ice/Chain/Glue/Tile Maker (`R-web`) | семь slots видны в Level 30; auto-remove triple; insertion order не подтверждён (`R-web/B`) | clear board; также есть blocker/timed fails (`R-web`) | listing заявляет пять boosters; точные функции требуют native capture (`B`) |
| **Tile Club** | layered triple-tile layouts (`R-web`) | bounded tray наблюдается; точный capacity/order не зафиксирован current build (`B`) | clear board; tray fail наблюдаем в genre, но нужен exact clip (`B`) | listing явно называет undo и powerful boosters (`R-web`) |
| **Tile Family** | layered triple-tile board (`R-web`) | `7` tiles; точный visual insertion order не раскрыт (`R-web/B`) | clear all tiles; board/tray filled with `7` tiles loses (`R-web`) | Hint указан явно; остальной набор требует capture (`R-web/B`) |

### Раунд, autoplay-readability и progression

| Reference | Публичный round/action evidence | Autoplay / визуальная плотность | Progression |
| --- | --- | --- | --- |
| **Triple Tile** | Level 20 `1:17`; Level 30 `2:34` (`R-web`); comparative action band `36–60` taps (`P/B`, нужен recount) | правило читается за одну показанную triple; density Level 30 высокая, но symbols и layers различимы (`R-web`) | world map, новые layouts/layers, weekly content; чистый core остаётся центром (`R-web`) |
| **Zen Match** | walkthrough Levels 11–20 занимает `15:23`, около `92 s/level` (`R-web`); supplied Level 17 round занимает около `98 s` от раскрытого board до win onset (`R-native-primary`) | спокойная сцена и крупные tiles; current recording показывает тяжёлый HUD, crowns/goals и meta (`R-native-primary`) | goal-based levels, blockers, rooms/journey/gems/dailies (`R-web/R-native-primary`) |
| **Tile Busters** | Level 30 video `1:11` (`R-web`); comparative `30–45` taps с producer/blockers (`P/B`) | компактная центральная pile хорошо читается; blocker counters повышают semantic density (`R-web`) | Ice, Chain, Glue, Tile Maker, tournaments, time challenges, towns (`R-web`) |
| **Tile Club** | Level 30 video `1:22` (`R-web`); comparative `30–45` taps (`P/B`) | самый компактный ранний cadence среди просмотренных; social/meta UI вне раунда (`R-web`) | `10K+` levels, travel, clubs, tournaments, backgrounds (`R-web`) |
| **Tile Family** | Levels 27–30 video `5:18`, около `80 s/level` (`R-web`); comparative `30–48` taps/level (`P/B`) | обычная средне-плотная pile; narrative wrapper сильнее отделён от core (`R-web`) | story/help framing, frequent level drops, hints (`R-web`) |

Публичные durations нельзя переносить в prototype как обязательные числа:
swipe-card требует более короткого собственного уровня. Они полезны только для
сравнения плотности и выбора band.

## Operator reference override

Review 2 выбор Triple Tile primary и band `20 / 25 / 30` исторически
зафиксирован в independent review, но superseded последующим operator
решением (`O`).

### Primary: Zen Match (`O`)

Причины обновления:

1. native `TT-R-S15` уже показывает фундаментальный feel: board→tray flights,
   concurrent input, grouped insertion и последовательное удаление triple;
2. более спокойная, объёмная tile presentation лучше соответствует
   выбранному ICP и желаемому tactile baseline;
3. чистое exposed→tray→triples ядро остаётся главным содержанием, а crowns,
   goals, boosters и blocker zoo явно исключены;
4. primary можно разложить на независимые logic и presentation contracts без
   заимствования фирменных assets.

### Secondary: Triple Tile (`O`)

Сохраняется для taxonomy/core-loop comparison, no-booster public paths и
контраста density. Его levels `20 / 25 / 30` больше не являются target band
или fidelity gate.

### Structural band: Zen Match Levels 6–10 (`O`)

- пять prototype slots соответствуют progression anchors `6 / 7 / 8 / 9 /
  10`;
- `TT-R-S16` используется только для формы progression: tile/type count,
  exposure depth, initial branching и общая silhouette/topology;
- каждый playable level имеет собственную geometry, seed, type allocation и
  solver receipts;
- exact layout, sequence, symbols, palette, UI и background не копируются;
- никаких boosters, crowns, goals, hidden-face rules или special mechanics.

### Bounded swipe rules (`O`)

- Никаких in-level или pre-level boosters: без Undo, Shuffle, Hint, revive,
  extra slot и continue.
- Fail ведёт только к replay того же deterministic уровня; booster
  monetization не является целью.
- Golden crowns, collectible goals и аналогичная progression/meta логика из
  `TT-R-S15` игнорируются.
- Единственная win condition v1: board empty и tray empty после auto-resolve.

### Что закрыла supplied запись (`R-native-primary`)

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
- Triple removal начинается после landing третьей и идёт последовательно с
  небольшим particle/sparkle feedback.
- Audio track фактически silent; operator выбрал audio off (`O`).
- Haptics screen recording не фиксирует; operator выбрал light accepted,
  soft triple и rigid unavailable/fail (`O`).
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

Быстрые taps во время flight и grouped insertion подтверждены `TT-R-S15`.
Оба остаются presentation-only и не входят в logical state/digest.
Intentional fail clip optional: fail-on-7th уже закрыт operator authority.

### Remaining fidelity evidence (`P`)

Не блокирует prototype implementation, но остаётся до final device parity:

1. Zen Match cold board load/assembly;
2. deliberate covered/unavailable tap;
3. intentional fail и fail UI cadence;
4. touch indicator для точного tap-response budget;
5. сильно частично перекрытый symbol для device readability threshold;
6. side-by-side prototype/native review.

Booster, crown/meta, revive и exact early-layout capture не требуются (`O`).

## Feel: prototype acceptance targets

Таблица отделяет observed primary evidence, operator decisions и prototype
defaults. `P` допускает implementation и TT-Q measurement; final device
parity по-прежнему требует evidence/disposition.

| Параметр | Preliminary target | Статус | Что требуется |
| --- | ---: | :---: | --- |
| Tap -> первый visual response | `≤50 ms` | `P` | browser/device measurement |
| Tile lift/selection phase | отдельная задержка отсутствует; flight начинается сразу | `O/P` | user prioritizes visible flight |
| Tile flight to tray | `280–380 ms` | `R-native-primary/P` | measured range refined in TT-Q |
| Flight trajectory | quadratic arc, control point `≈54 px` above direct midpoint | `R-native-primary/P` | side-by-side tune |
| Flight easing | fast launch + `ease-out`, без overshoot | `R-native-primary/P` | side-by-side tune |
| Input during another flight | accepted; logical actions serial, flights may overlap | `R-native-primary/O` | acceptance test |
| New tile insertion | grouped after same-type run, otherwise append | `R-native-primary/O` | presentation-only |
| Tray rearrange/compression | `180 ms`, stable relative order остальных | `R-native-primary/P` | browser/device measurement |
| Triple recognition delay after landing | `70 ms` | `R-native-primary/P` | acceptance test |
| Triple removal | `190 ms` each, stagger `68 ms`, light particles | `R-native-primary/P` | sequential-removal test |
| Newly exposed tile enable | immediate logical transition; visual flight may continue | `O/P` | engine/presentation parity |
| Covered/unavailable tap onset | `≤50 ms` | `P` | deliberate invalid tap still requested |
| Covered feedback | `180 ms` pulse; geometry не перемещается | `P` | device review |
| Board load/settle | `300 ms` per tile, `12 ms` cascade, input gate `760 ms` | `P` | native cold load unavailable |
| Camera after settle | static; no per-move zoom/reframe | `O/P` | prototype default |
| Accepted-tap haptic | `light`, at manual accepted transition | `O/P` | operator approved; autoplay silent |
| Triple haptic | `soft`, at manual-play removal onset after third landing | `O/P` | operator approved; autoplay silent |
| Unavailable/fail haptic | `rigid`, at feedback/fail onset | `O` | operator approved |
| Audio | off | `O` | supplied primary recording effectively silent |
| Last triple -> win onset | after presentation queue drains | `O/P` | single-completion test |
| Fail recognition -> fail UI | after accepted flights/rearrange drain | `O/P` | intentional fail test |
| Scene visible -> first autoplay tap | after assembly input gate, target `≤900 ms` | `P` | TT-Q measurement |
| Scene visible -> first autoplay triple | target `≤3.0 s`; construction witness opens with a triple | `P` | TT-Q measurement |

### Remaining final-parity facts

- device minimum readable diagnostic fraction for partially covered symbols;
- exact cold-load choreography, deliberate covered cue and fail cadence;
- side-by-side operator disposition. Они не блокируют prototype code, но
  блокируют claim о final native parity.

## Preliminary reference parity checklist

Чеклист является implementation/device acceptance; observed и operator
requirements не требуют повторного подтверждения перед кодом.

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

- [x] primary изменён на **Zen Match**, secondary — **Triple Tile** (`O`);
- [x] structural anchors **Zen Match 6–10**; exact layouts не копируются (`O`);
- [x] без boosters, revive, extra slot, crown goals и monetization (`O`);
- [x] concurrent taps during flight наблюдены (`R-native-primary`);
- [x] grouped insertion классифицирована как presentation-only
  (`R-native-primary` + independent review F1);
- [x] autoplay default-on только в swipe, проходит весь уровень и ждёт
  accepted takeover tap (`O`);
- [x] audio off; haptics light accepted / soft triple / rigid
  unavailable+fail (`O`).

Минимум для Review 3 logic:

- [x] fail-on-7th утверждён оператором; седьмая placement, завершившая
  triple и оставившая occupancy `<7`, безопасна (`O`).

До final fidelity claim:

- [ ] cold-load, covered/partial-overlap и intentional-fail evidence;
- [ ] side-by-side device disposition по assembly/flight/removal;
- [ ] minimum readable diagnostic fraction.

## Disposition TT-R

- Taxonomy: **accept split** — Triple-tile и Mahjong Solitaire разные классы.
- Priority: **research accepted; development active**.
- Primary/secondary/band, no-booster rule, full swipe autoplay и haptic/audio
  semantics: **approved (`O`)**.
- Logic: **TT-G/TT-S/TT-E/TT-F implementation authorized (`O`)**.
- Presentation: **TT-P prototype implementation authorized** по
  `TT-R-S15 + O`; final parity остаётся device-review gate.
- Rollout/publication: **не разрешены этим packet**.
