# Fidelity replication process v3.1

Статус: authority процесса для механик, восстанавливаемых по внешнему
референсу.

- Process ID: `reference-replication.v3.1`
- Revision trigger: `2026-08-01 Block Out field-play false positive`.
- Human authority: оператор утверждает must-match moments, taste disposition
  и rollout.
- Machine authority: capture integrity, deterministic replay, измеримые
  parity-строки, containment и originality gates.

```text
Device Evidence
  -> Reference Twin dataset (exact, neutral, internal-only)
  -> early vertical-slice taste gate
                         \
                          -> one canonical runtime
                         /
  -> Production Original dataset (own layout/assets)
  -> matched-scenario taste parity
  -> Factory calibration
```

Reference Twin и Production Original — разные datasets одного runtime, а не
две реализации игры. Renderer, input loop, presentation projection, viewport,
lifecycle и debug instrumentation по умолчанию общие.

## Roles and authority

- Агент собирает evidence, ведёт action log, manifests, hashes и измеримые
  parity-проверки.
- Оператор подключается только для install/login/captcha/purchase authority,
  двух must-match тактов, bounded choice-session и rollout decision.
- Отсутствие оператора не разрешает рекламу, purchase, account mutation или
  обход protection.
- Неизвестное значение остаётся gap. Оно не становится измерением из-за того,
  что implementation уже нуждается в константе.

## 0. Authority freeze

До реализации фиксируются:

- точный app/build, target slice и capture manifest digest;
- primary/secondary hierarchy и evidence grade;
- rights boundary и explicit out-of-scope;
- 3–7 provisional operator must-match moments;
- golden scenarios и exact stimuli;
- stop rule и operator-attention budget;
- process version во всех создаваемых artifacts.

Must-match таблица проходит второй и последний такт после первого evidence:
агент предлагает измеримые проекции, оператор одной сессией исправляет и
freeze-ит их.

## 1. Device Evidence

Evidence session содержит device/app/build identity, clean/instrumented media,
action JSONL, monotonic timestamps, per-file hashes, declared gaps и safety/
economy receipts.

### Clean/instrumented pair

Каждый native golden scenario, используемый одновременно для визуальной и
timing authority, имеет две записи с одним `scenarioId`:

- `clean` — без Show taps/debug overlays, authority полного визуального кадра;
- `instrumented` — с touch/action instrumentation, authority синхронизации.

Пара связывается не exact screenshot SHA, а initial-state receipt:
app/build, level/scenario, normalized state fingerprint, counters/classes и
cropped perceptual hash с объявленным порогом. Exact SHA идентифицирует файл,
но не доказывает эквивалентность двух запусков.

Повторный полный run не делается, если capture покрывает target. Gap закрывает
минимальный targeted probe.

## 2. Evidence grades and measurements

Разрешённые grades:

- `R-native-clean`;
- `R-native-instrumented`;
- `R-public`;
- `R-derived`;
- `O` — operator decision;
- `P` — production decision;
- `B` — blocking gap.

Каждое числовое измерение хранит value/range, uncertainty, source grade,
source frame PTS или action ID, method и confidence. Допуск не может быть уже
frame interval/uncertainty источника. `R-public` остаётся provisional, если
для freeze доступна native-перемерка.

## 3. Three-file authority boundary

Feel не переносится напрямую из capture в shipping-код. Для каждого класса
существуют три versioned machine-readable artifacts:

1. `OBSERVATIONS.v1.json` — immutable измерения и provenance;
2. `FIDELITY-CONTRACT.v1.json` — утверждённые диапазоны, must-match projections
   и hard/soft gates;
3. `PRESENTATION-PROFILE.v1.json` — first-party shipping параметры.

Implementation потребляет только presentation profile. Machine receipt
сравнивает profile с fidelity contract и связывает оба с observations digest.
Изменение observation не переписывает shipping profile молча.

## 4. Reference Twin

Twin может точно повторять captured layouts, equality classes, objectives,
state/action traces и causal presentation sequence. Он neutral-skinned,
internal-only и имеет machine-enforced production deny gate.

Twin и Original выбираются dependency/data injection одного runtime.
Переключение dataset не меняет renderer, input semantics, presentation clocks,
viewport mapping или lifecycle. Release build fail-closed выбирает Original и
запрещает Twin selector, fixture namespace и capture provenance.

Если Twin входит в финальное сравнение, одного импортируемого dataset/test
fixture недостаточно. Обязателен отдельный executable review-only build,
который проходит полный browser-input witness и raw-clean-raster probes. Он
собирается в отдельный output и никогда не подменяет production output.
Production deny проверяется после сборки обоих shipping targets: exact Twin ID,
reference package/scenario IDs и capture provenance не должны присутствовать
в их module graph или bytes.

## 5. Early vertical-slice taste gate

До разработки серии, factory и широкого polish реализуется один golden
scenario end-to-end:

```text
reference -> Twin slice -> Original slice -> operator choice-session
```

Проверяются первый live frame, input response, главное движение и один
terminal/error event. Если viewport, scale, travel, cadence или control feel
отклонены, исправляется slice; downstream work не начинается.

## 6. Two comparison loops

### Reference -> Twin

Проверяет rule/geometry/timing/causal fidelity. Identification-at-chance
допустим только для identity-normalized каналов: silhouette/edge render,
motion overlay, masked UI или normalized event sequence. Полный кадр не может
быть blind, поскольку Twin neutral-skinned.

### Twin -> Production Original

Проверяет сохранение feel при собственной identity. Используются matched
micro-scenarios и randomized preference choice:

- `A closer`;
- `B closer`;
- `no meaningful difference`.

V3-сессия содержит не более восьми решений: шесть уникальных пар и два
скрытых повтора. Это operator disposition, не статистическое доказательство
эквивалентности. MUST проходит, если нет устойчивого предпочтения Twin и
повторы не противоречат друг другу.

V0 review surface собирается
[`scripts/reference-review-page.mjs`](../../scripts/reference-review-page.mjs):
статическая HTML-страница, event-offset sync, side-by-side/blend, hidden source
labels и export immutable-choice receipt. Difference/CV/auto-alignment не
входят в v0.

## 7. Must-match and parity salience

Must-match moments Gate 0 и MUST parity — одна таблица, не две таксономии.
Каждая parity-строка имеет ID, parent must-match ID, verification mode и
salience:

- `MUST` — любой fail блокирует;
- `MAJOR` — влияет на сходство и correction priority;
- `MINOR` — bounded polish;
- `INFO` — observation без gate.

MUST без parent must-match запрещён: сначала дополняется исходная таблица.
Composite score не может скрыть красный MUST.

### Acceptance-surface quorum

Нормализованный diagnostic-канал помогает локализовать причинную дельту, но
никогда не является единственным доказательством parity. Каждая MUST-строка
закрывается одним coverage receipt, в котором присутствуют все применимые
поверхности:

1. `model` — positive и negative rule/invariant probes;
2. `browser-input` — тот же сценарий доставлен реальными pointer events в
   production bundle, а не вызовом engine/debug API;
3. `raw-clean-raster` — исходный clean кадр/клип и production raster без
   silhouette/occupancy downsample как единственного verdict;
4. `diagnostic` — motion/edge/occupancy канал только как дополнительное
   причинное измерение.

Machine pass на одной поверхности не переносится на остальные. В частности,
solver/model не доказывает browser event semantics, а совпадение `16×16`
occupancy не доказывает scale, draw order, occlusion, colour-role mapping или
particle-boundary emission.

Если класс использует Twin и Production Original, coverage receipt содержит
два независимых `surfaceQuorum`: `referenceTwin` и `productionOriginal`.
Общий engine/profile уменьшает implementation drift, но не переносит browser
или raster pass одного dataset на другой.

Review config обязан byte-bind SHA-256 coverage receipt. Review tooling
fail-closed отклоняет сессию без `model/browser-input/raw-clean-raster=pass`
или с `diagnosticSoleAuthority=true`; тот же binding входит в экспортируемый
operator receipt и проверяется disposition tool.

Для каждого interaction MUST coverage matrix содержит минимум один успешный и
один запрещённый сценарий. Для drag/collision/gate классов обязательны:

- blocked path рядом с destination/gate;
- foreign-role/colour destination;
- forward + reversed gesture trace с разной event segmentation;
- pointerdown без движения и release вне фактического capture crossing;
- model state ↔ browser trace ↔ rendered silhouette congruence.

Для каждого уровня, входящего в operator field play или release candidate,
solver witness полностью переигрывается реальными pointer events в браузере.
Каждый stable action обязан дать тот же digest, что модель; terminal state,
trace length и live-set сравниваются отдельно. Replay проходит связный путь
anchor-by-anchor, включая повороты и reposition actions. Успешный solver плюс
один прямой autoplay prefix не является browser proof.

Pointer harness берёт grab point внутри объявленной occupied cell. Центр
bounding box запрещён как универсальный grab point: для concave figures он
может попадать в пустую область или на общую boundary и выбирать соседний
объект, создавая ложный browser verdict.

Render semantics являются проверяемыми инвариантами: неизменный scale, если
scale change не измерен в reference; объявленный foreground/occlusion order;
fragment onset на пространственной boundary, а не внутри ещё видимого body.

## 8. Golden scenarios, probes and gesture traces

- `GOLDEN-SCENARIOS` — постоянный acceptance contract runtime.
- `PROBE-MATRIX` — временный план добычи отсутствующего evidence.
- `GESTURE-TRACES` — normalized input paths/timestamps для continuous input.

Artifacts используют общие scenario IDs, но не подменяют друг друга. Закрытый
probe не удаляет golden acceptance scenario.

Один позитивный vertical-slice scenario не закрывает класс. Перед Close
coverage matrix обязана включать все MUST и их negative controls. Raw clean
ключевые кадры хранятся рядом с diagnostic projection; review surface явно
показывает, какой канал является authority, а какой — локализатором.

## 9. Production Original and Factory

Production создаёт собственные layouts, allocation, assets, palette, UI и
SkinSpec. Каждый candidate проходит solver/validator, declared near-duplicate
metric, полный real-pointer witness replay и human visual review против Twin.
Similarity metric family, hard
rejects и threshold замораживаются до candidate generation.

Factory включается только после parity fixed fixtures. Generator не маскирует
расхождение Twin/runtime.

## 10. Stop rule and process receipt

До старта класса фиксируются defaults:

- не более двух blind/unmeasured correction rounds: это ограничение защищает
  от бесконечного taste-тюнинга без новой причинной информации;
- evidence-driven correction не расходует blind budget: если MUST/MAJOR не
  закрыт и измерение локализует causal delta, агент диагностирует и исправляет
  его в рамках исходной цели до parity или реального блокера;
- не более двух operator sessions по 10–15 минут;
- все MUST зелёные;
- не более двух открытых MINOR с explicit disposition;
- нерешённый MAJOR имеет owner и не закрывается общим score.

Невалидный review surface (static identity, несовпадающий input path,
масштаб/anchor или окно события) не считается taste-решением и пересобирается
без запроса новой продуктовой authority. Работа останавливается только на
реальном блокере, исчерпанной исходной authority или продуктовой развилке;
произвольное число раундов само по себе не является stop condition.

Каждый класс завершает `PROCESS-RECEIPT.md`: operator minutes, recaptures,
blind и evidence-driven correction rounds, auto-verified parity share, rework after first taste gate,
open deltas и process version.

### Field-play rejection

Любое воспроизводимое operator-наблюдение после формального Close, которое
нарушает MUST/MAJOR reference behavior, автоматически:

- переводит receipt в `rejected-after-field-play`;
- сохраняет, но помечает прежние receipts как `superseded/false-positive`;
- создаёт regression scenario до исправления implementation;
- переоткрывает все downstream gates, доказательства которых зависели от
  неполного scenario/surface coverage;
- требует нового полного field-play, а не review только исправленного клипа.

Лимит blind correction rounds не ограничивает исправление воспроизведённого
дефекта в рамках исходной цели. Он ограничивает только настройку без новой
причинной информации.

## Gates

| Gate | Required proof |
| --- | --- |
| Authority ready | reference/build/rights/must-match/golden scenarios/stop rule frozen |
| Evidence ready | verified clean+instrumented receipts or explicit gap dispositions |
| Twin ready | exact fixtures + separate review build + full real-pointer witness + raw raster + production deny |
| Vertical slice | one matched scenario + operator disposition before scale-out |
| Runtime unified | one renderer/input/presentation/viewport/lifecycle |
| Presentation parity | profile-vs-contract + raw-clean raster receipt; no failed MUST |
| Level-feel parity | matched-scenario choice-session + signature bands |
| Original ready | taste parity + solver + full per-level pointer witness + provenance + near-duplicate pass |
| Platform ready | lifecycle/autoplay/takeover/single completion proof |
| Close | separate Twin/Original coverage quorums + montage + delta + full two-surface field-play + process receipt |

Merge, production publish and rollout остаются отдельными explicit decisions.
