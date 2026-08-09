# Review 3 — независимый вердикт по `mahjong-buffer-pairs`

- Дата: **2026-08-01**
- Initial disposition: **`revise`** — superseded by Delta Review 2
  `approved-for-prototype` below.
- Current overall disposition: **`approved-for-prototype`**.
- Ревьюер: **Codex reviewer agent `/root/mahjong_review3`**
- Автор пакета: Codex `/root` (**author != reviewer**)
- Предмет: `REFERENCE-PACKET.md` SHA-256
  `526f9a2c3449bdd00f29b16e826709275b4c319b4e3c90e36e7226c94cef2d29`
  и `CLASS-BRIEF.md` SHA-256
  `c868b861a62c7d3f5de2f300413d508e9e8646ac946eeb04597bb9509237a5b1`
- Evidence manifest: SHA-256
  `f7a6a83f21a41866b6acc4bef721025f60a6e3ae1388081d39f3c6c590c7d835`
- Вопрос гейта: достаточно ли точно описаны правило, границы и acceptance,
  чтобы независимые `MJ-E/S/F/P/I/A/Q` не приняли разные продуктовые решения?

## Исходный вердикт: **revise**

Reference packet закрывает выбор класса, наблюдаемый feel, bounded delta и
rights boundary заметно лучше минимального порога Review 3. Однако gameplay
brief пока не даёт единственной реализации geometry, tray/undo reducer,
pause/resume и solver equivalence. Кроме того, wall-clock участвует в
candidate rejection, что нарушает детерминированность фабрики, а нижняя часть
обязательного class-brief acceptance отсутствует.

Это **не критический человеческий гейт**: открытого taste-решения, без которого
нельзя продолжить, не найдено. Нужна ограниченная редакционная ревизия
контракта и короткий delta-review. До неё `MJ-E/S/F/P/I` не должны начинаться,
поскольку сам brief разрешает implementation только после
`approved-for-prototype`. `MJ-A` может подготовить только черновую event-map,
не закрепляя state semantics.

## Что принято

- Класс зафиксирован однозначно: exposed-pair Mahjong с четырёхслотовым
  holding tray, pair-of-two clear и fail на четырёх unmatched; это не
  traditional Mahjong и не triple-tile.
- Primary reference имеет exact package/version/device, полный success,
  locked/hint/undo/fail/restart evidence и hash-bound manifest.
- R/P разделены честно. Core timings измеримы: response `<=50 ms`, flight
  `430+-40 ms`, pair burst `520-720 ms`, fail onset `<=100 ms`, first autoplay
  motion `<=650 ms`, first pair `<=2.2 s`.
- Сокращение `70 -> 12-20` плиток и `7+ min -> 20-45 s` явно оформлено как
  platform delta, а не выдано за reference parity.
- Scope соответствует VISION: один раунд, пять параметризованных уровней,
  deterministic runtime/factory, autoplay-to-takeover, без внутренних level
  loops, production roster mutation и publication authority.
- Rights boundary сильный: Vita brand, room, Mahjong faces, palette, audio,
  copy и meta-layer исключены; production bundle не содержит reference media.
- Presentation targets наблюдаемы и не полагаются только на цвет; собственная
  `Soft Geometry` identity совместима с SkinSpec-направлением.

## B1 · P1 — geometry не является exact typed authority

Формулы близки к достаточным, но `x2/y2` не объявлены центром либо углом
плитки, не заданы точные half-open occupied intervals и проверка containment в
`width2/height2`. Поэтому два корректных исполнителя могут по-разному решить
border, edge-touch и half-step overlap. Отдельно не закрыто, разрешены ли
«висящие» `z>0` плитки без опоры; validator при текущем тексте может принять
их, хотя core fantasy обещает читаемую layered construction.

`leftBlocked/rightBlocked` ограничены `b.z===a.z`, но не сказано явно, что это
сознательная authority и плитка на другом `z` никогда не создаёт боковую
блокировку после отдельного `topBlocked` test. Это значимо для solver,
renderer open-badge и factory grammar.

**Минимально закрыть:** определить смысл `x2/y2`, integer domain, occupied
rectangle и board containment одной формулой; зафиксировать positive-area
overlap против edge/corner touch; явно утвердить same-layer-only side rule;
добавить exact support invariant для `z>0` либо явно разрешить floating tiles
и вынести их запрет в readability validator. Добавить boundary fixtures для
edge touch, half overlap, one-side free, both-sides blocked, higher overlap и
разных `z`.

## B2 · P1 — tray, pair resolution и undo не замкнуты одним reducer-алгоритмом

Input contract говорит `add to tray; pair-clear / fail / win / ready`, но не
фиксирует:

- append/slot-compaction и относительный порядок оставшихся плиток;
- точный поиск и атомарное удаление пары после settle;
- когда paired ids удаляются из `unresolvedHistory`;
- является ли history отдельной структурой или всегда совпадает с ordered
  unresolved tray;
- приоритет terminal checks в последовательностях `pair -> empty board`,
  `pair -> non-empty tray` и `fourth unmatched -> fail`;
- какое logical состояние остаётся во время non-blocking burst.

Из-за этого `MJ-E`, `MJ-S`, autoplay и hint могут получить разные state hashes.
Фраза `byte-equivalent initial logical state` при restart также конфликтует с
полем `revision`: либо revision сбрасывается, либо состояние уже не
byte-equivalent.

**Минимально закрыть:** дать короткий normative pseudocode settle-перехода
(`append -> remove the unique matching pair preserving survivor order ->
update undo history -> win/fail/ready`) и LIFO undo; определить tray slot
compaction; определить restart/revision и состав canonical logical state hash.
Закрепить fixtures минимум для `A,B,A -> [B]`, `A,B,C,D -> failed`, undo после
middle-pair clear и win с последней парой.

## B3 · P1 — pause/mode state machine расходится с объявленными типами

Диаграмма вводит `autoplay`, `manual`, `restarting` и `completed`, но
`MahjongStateV1.phase` их не содержит. Она разрешает `paused <-> ready |
autoplay | manual`, тогда как host способен скрыть карточку во время
`moving/resolving`; именно этот случай требует exact resume. `pause` заменяет
phase на `paused`, но тип не хранит `pausedFrom` и remaining motion time.
Одновременно presentation владеет settle timer и stale settle после pause
объявлен no-op — после resume не определено, кто и на какой remaining delay
создаёт новый settle.

**Минимально закрыть:** разделить и типизировать engine phase, runtime mode и
host pause либо добавить resume snapshot (`phaseBeforePause`, remaining
motion, mode). Описать pause в каждой reachable phase, token/timer behavior и
ровно один resume path. Привести diagram и `MahjongStateV1` к одной модели;
добавить fixture `pause during flight -> resume -> one settle` и
`restart -> stale settle is no-op`.

## B4 · P1 — solver pruning и budget могут менять корректность/артефакт

Фраза «symmetry canonicalizes same-kind tile choices» небезопасна. Две плитки
одного kind в разных координатах снимают разные blockers; их промежуточные
состояния неэквивалентны без доказанной automorphism geometry/dependency
graph. Простое схлопывание такого выбора может отбросить единственное решение.

Кроме того, `<=200 ms` указан рядом с `<=100,000 expanded states`, а budget
exhaustion отклоняет candidate. Wall-clock cutoff делает один и тот же
`seed+version` зависимым от машины и нагрузки, что противоречит VISION о
детерминированном production.

**Минимально закрыть:** убрать same-kind pruning либо разрешать его только по
доказанному canonical graph automorphism; сделать expansion count (и
детерминированный traversal/tie-break) единственной semantic границей.
`200 ms` оставить performance evidence/alert, но не причиной различного
candidate disposition. Зафиксировать replay property: solver trace проходит
тем же reducer и совпадает по before/after logical hashes.

## B5 · P1 — factory identity и difficulty acceptance допускают разные серии

`canonical content hash`, state hashes, «normalized feature vector»,
`safe decoy`, `obvious blocker pair`, `solver-only pixel target` и
`solutionCountCap` не имеют нормативных определений. Не задан deterministic
tie-break для одинаковой lexicographic distance. Поэтому независимые `MJ-F`
и `MJ-Q` могут принять разные пять уровней при одинаковом seed, хотя receipt
будет формально заполнен.

**Минимально закрыть:** определить canonical serialization и hash algorithm;
дать точный feature schema, cap и per-level numeric bands; перечислить поля,
по которым требуется monotonicity (вместо неопределённого normalized vector);
определить candidate/tie-break order. Человеческая оценка красоты остаётся
после machine receipt и не должна менять hash-bound candidate скрыто.

## B6 · P1 — Review 4 acceptance неполон как исполняемый контракт

`CLASS-BRIEF.md` заканчивается разделом Review gates и опускает обязательные
части шаблона: risks, open decisions/dispositions, acceptance по Gameplay /
Content / Platform / Presentation / Fidelity / Evidence, kill criteria,
evidence index и final decision. Parity checklist в MJ-R силён, но не
покрывает неоднозначные reducer/geometry/lifecycle fixtures выше и не говорит,
каким артефактом проверяется каждый platform claim.

**Минимально закрыть:** добавить компактную, но полную acceptance matrix с
machine command/evidence path для reducer, geometry, solver/factory,
deterministic replay, aspect/device, staged boot, pause/cleanup, exactly-once
completion, AutoCursor before/after и Android side-by-side; перечислить
reference deltas и known limitations; добавить kill criteria и explicit
`open decisions: none` либо владельца каждого оставшегося решения.

## Неблокирующие замечания

- **P2 · Hint shape.** Указать, возвращает ли hint один tile id (когда mate уже
  в tray) или один/два board ids; это позволит P и A одинаково считать
  `hint_shown`.
- **P2 · Undo feel.** Reverse flight, restart crossfade, cursor fade и win
  settle не имеют числовых P-timings. Они могут быть taste parameters, но
  перед Review 4 их следует записать в delta list, а не спорить постфактум.
- **P2 · Explicit restart while ready.** Input contract допускает
  `tapRestart` как secondary control, state diagram показывает restart только
  из fail. Выбрать одно поведение; core fail/restart от этого не зависит.
- **P3 · Performance language.** `60 fps` лучше принимать через frame-time
  distribution и device clip, а не как абсолют без оговорки о capture; long
  frame `>50 ms` уже является полезным observable guardrail.
- **P3 · Gesture arbitration.** Не дублировать числовой swipe threshold в
  class brief; сослаться на runtime authority и доказать tap-vs-vertical-drag
  в реальном feed shell.

## Checklist Review 3

| Область | Результат | Основание |
| --- | --- | --- |
| Exact reference/class choice | PASS | package/version/device и rule hybrid зафиксированы |
| Reference success/error/hint/undo/restart | PASS | curated hash-bound evidence manifest |
| Числовой feel до Engine | PASS | R/P timings и layout targets присутствуют |
| Rule closure | FAIL | settle/history/terminal order не нормативны |
| Availability geometry | FAIL | coordinate/bounds/support semantics неполны |
| Tray/pair/fail | FAIL | core intent ясен, reducer sequence не замкнут |
| Undo/restart | FAIL | history cleanup и restart hash/revision неоднозначны |
| Autoplay/takeover | PASS | real actions, solver trace, exact-state takeover |
| Pause/resume/cleanup | FAIL | state/type/timer model расходится |
| Bounded prototype | PASS | 5 levels, 12-20 tiles, one round, <60 s target |
| VISION/platform scope | PASS | explicit user goal; no roster/publication authority |
| Rights boundary | PASS | own skin/assets; reference media excluded from build |
| Typed boundaries | FAIL | hash/runtime and reducer semantics недостаточны |
| Solver correctness/determinism | FAIL | unsound symmetry wording + wall-clock disposition |
| Factory feasibility | FAIL | bands, normalization, tie-break и hash undefined |
| Review 4 observability | FAIL | parity силён, acceptance/evidence matrix отсутствует |
| Critical human choice | PASS | человеческого блокера до prototype нет |

## Минимальные обязательные правки для повторного гейта

1. Замкнуть geometry: coordinate rectangles, bounds, overlap/touch, z-side и
   support policy плюс fixtures.
2. Замкнуть settle/tray/pair/undo/restart reducer и logical hash fixtures.
3. Свести state machine с typed phase/mode/pause и доказать pause-in-flight.
4. Убрать недоказанное same-kind pruning и wall-clock semantic cutoff.
5. Зафиксировать canonical hashes, deterministic factory ordering и exact
   difficulty bands/monotonic fields.
6. Дописать исполняемую Review 4 acceptance/evidence matrix, risks/open
   decisions, kill criteria и final-decision placeholder.

После этих шести правок нужен только независимый delta-review; новое
reference-исследование не требуется, если geometry choices честно помечены
как prototype `P`, а не как наблюдавшиеся `R`.

## Подпись reviewer

`Codex reviewer agent /root/mahjong_review3`, independent Review 3,
`2026-08-01`. Disposition: **`revise`**.

---

# Delta Review 1 — `2026-08-01`

- Ревьюер: **Codex reviewer agent `/root/mahjong_review3`**
- Обновлённый `CLASS-BRIEF.md`: SHA-256
  `ede6f805a6f6f472a89e82ed3135bf1be10e741125ac0868d3bda833602470a0`
- `REFERENCE-PACKET.md` и evidence manifest: без изменений относительно
  исходного Review 3.
- Delta disposition: **`revise`**
- Critical human gate: **нет**

Author patch существенно продвинул brief: B1–B4 и B6 закрыты, все исходные P2
замечания получили нормативную диспозицию. B5 закрыт почти полностью, но exact
factory contract всё ещё оставляет несколько битовых неоднозначностей на
границах candidate acceptance. Они исправляются несколькими строками без
повторного исследования и без продуктового решения оператора.

## Delta dispositions B1–B6

| Finding | Delta status | Проверка |
| --- | --- | --- |
| B1 geometry | **RESOLVED** | top-left integer coordinates, half-open `2×2` rectangles, exact bounds, positive-area overlap, edge/corner policy, same-layer-only side authority и 50% support rule заданы; boundary fixtures перечислены |
| B2 tray/pair/undo/restart | **RESOLVED** | append/right compaction, unique pair removal, terminal priority, tray-as-LIFO-history, failed-only restart и stale-token fixture нормативны; content/logical/puzzle hashes разделены |
| B3 phase/mode/pause | **RESOLVED** | engine phase, runtime mode и host pause ортогональны; pause не мутирует reducer, in-flight remaining time+token сохраняются, resume даёт один settle, completion idempotent |
| B4 solver determinism | **RESOLVED** | same-kind pruning удалён; canonical tile-id traversal, deterministic memoization и 100k expansion budget являются semantic authority; `200 ms` только warning/evidence |
| B5 factory identity/difficulty | **NOT RESOLVED** | schema, bands, monotonic fields, candidate range и rank tuple заданы, но PRNG recurrence, topology tuple sort и integer feature rounding пока не exact |
| B6 Review 4 acceptance | **RESOLVED** | risks, closed/open decisions, executable matrix, six acceptance domains, deltas, kill criteria, evidence index и final placeholder присутствуют; rollout явно deferred |

### Единственный оставшийся blocker · B5 delta

Термин `xorshift32` не задаёт shift triplet и порядок unsigned coercion. Нулевая
подстановка и candidate seed derivation уже определены, но разные допустимые
xorshift32 variants породят разные candidates. Аналогично topology hash говорит
`sorted [x2,y2,z]`, не задавая numeric tuple comparator. Наконец,
`branchingMeanMilli` не задаёт floor/round/tie policy; кандидат на границе band
может получить разный disposition в разных реализациях.

**Минимальная обязательная правка:** добавить три нормативные строки:

1. точную PRNG step recurrence, например `x ^= x << 13; x ^= x >>> 17;
   x ^= x << 5; return x >>> 0`, и место применения zero-state mapping;
2. точный numeric comparator topology tuples, например `(z,y2,x2)` либо
   `(x2,y2,z)` — выбрать один;
3. точную integer формулу/rounding для `branchingMeanMilli` и, желательно,
   удвоенную integer-формулу band-center distance
   `sum(abs(2*feature-(low+high)))`, чтобы rank не зависел от трактовки
   midpoint.

После этой правки B5 можно закрыть документарным delta без нового corpus или
reference capture.

## Delta dispositions по исходным P2/P3 notes

- Hint shape — **RESOLVED**: `HintPlanV1` различает один tray-mate id и два
  последовательных board ids.
- Undo/restart/cursor/win feel timings — **RESOLVED**: добавлены числовые P
  targets.
- Explicit restart while ready — **RESOLVED**: restart разрешён только из
  `failed`.
- Performance language — **RESOLVED**: frame distribution и long-frame
  guardrail заменили абсолютный FPS claim.
- Gesture arbitration — **RESOLVED**: численный threshold оставлен shared
  runtime authority; real-feed fixture обязателен.

Неблокирующее уточнение для MJ-I: при реализации pause в `won` pending
completion delay должен храниться/замораживаться так же надёжно, как flight
settle. Observable contract и acceptance уже однозначны (`700±100 ms`, pause
delays, exactly once), поэтому конкретная внутренняя форма scheduler state не
требует ещё одной правки brief.

## Итог Delta Review 1

Текущий disposition остаётся **`revise`** только из-за B5 exactness. Формальное
разрешение открыть `MJ-E/S/P/A` пока не выдаётся: сам brief связывает любой
implementation start с `approved-for-prototype`. После минимального B5 patch
нужна одна проверка изменённого абзаца; если recurrence/sort/rounding станут
однозначными, следующий delta может сразу выдать `approved-for-prototype`.

Подпись: `Codex reviewer agent /root/mahjong_review3`, independent delta
review, `2026-08-01`.

---

# Delta Review 2 — финальный Review 3 (`2026-08-01`)

- Ревьюер: **Codex reviewer agent `/root/mahjong_review3`**
- Автор brief: Codex `/root`; **author != reviewer** подтверждено.
- Финальный `CLASS-BRIEF.md`: SHA-256
  `a06323bf4876e30c236dfd1fec600e300e62614d34980c82c59def171834f521`
- Область delta: только три оставшихся B5 closure.
- Final Review 3 disposition: **`approved-for-prototype`**
- Critical human gate: **нет**

## Проверка B5 closure

- **PRNG — RESOLVED.** Зафиксированы derived unsigned state, единственная
  zero-state substitution перед первым step, точная последовательность
  `13/17/5` с `>>>0` после каждой операции и правило «returned word = next
  state». Seed/candidate больше не допускают вариантной реализации.
- **Topology canonical order — RESOLVED.** Hash input использует tuples
  `[x2,y2,z]` и точный numeric ascending comparator `(z,y2,x2)`; ids/kinds
  исключены осознанно.
- **Feature/rank integers — RESOLVED.** `branchingMeanMilli` использует exact
  half-up integer formula над `n=witnessLength` pre-tap states; band distance
  использует удвоенную integer-формулу без midpoint division. Wall clock по-
  прежнему не влияет на eligibility, rank или receipt.

B5 теперь закрыт. В совокупности с Delta Review 1 все исходные B1–B6 и P2/P3
замечания имеют disposition **RESOLVED**. Rule, geometry, reducer, typed
lifecycle, solver/factory determinism, bounded scope, rights boundary и
исполняемая Review 4 acceptance достаточно точны для независимой параллельной
реализации.

## Implementation authority

Review 3 **разрешает открыть `MJ-E`, `MJ-S`, `MJ-P` и `MJ-A`** по typed
границам текущего brief. `MJ-F` открывается после доступности solver API;
`MJ-I` собирает принятые E/P/A контракты; `MJ-Q` остаётся независимым evidence
review. Любая semantic правка geometry, tray capacity, pair-of-two, hashes,
RNG, bands или pause/completion contract требует новой brief revision.

Это разрешение ограничено разработкой и Review 4 evidence. Оно **не даёт**
authority на production roster mutation, rollout, публикацию, store
submission, monetization или использование trade dress Vita Mahjong. Даже
успешный Review 4 оставляет rollout отдельным явным человеческим решением.

## Итоговая подпись

`Codex reviewer agent /root/mahjong_review3`, independent Review 3 reviewer,
`2026-08-01`. Overall disposition: **`approved-for-prototype`**.

---

## Administrative seal — `2026-08-01`

- Current `CLASS-BRIEF.md` SHA-256:
  `02831c203de3668af8f424d171ab1116bb8713c3a1bcf15fe851dd82745a7b49`.
- Reviewed semantic snapshot SHA-256:
  `a06323bf4876e30c236dfd1fec600e300e62614d34980c82c59def171834f521`.
- Reviewer: Codex agent `/root/mahjong_review3`; **author != reviewer**.

Проверена точная обратная реконструкция: замена только четырёх
административных областей — header status/reviewer, строки Review 3 в Evidence
index и wording Final decision/follow-up — воспроизводит reviewed digest
`a06323bf…f521` byte-for-byte. Semantic sections rule/geometry/reducer,
hashing, solver/factory, timings, runtime и acceptance не изменились.

Administrative post-review update принят. Overall disposition сохраняется:
**`approved-for-prototype`**. Implementation authority из Delta Review 2
сохраняется; rollout/publication/store/production-roster authority по-прежнему
явно deferred до отдельного человеческого решения.
