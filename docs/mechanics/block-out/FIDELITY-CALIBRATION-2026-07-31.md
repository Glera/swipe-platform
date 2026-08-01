# Block Out! v1 — fidelity calibration ledger

- Дата среза: **31.07.2026**
- Primary (`O`): **Falcon/CYLINDER Android `1.0.177+177`**
- Target (`O`): **levels 6–10 как taste/feature band**
- Статус: **evidence-correction-2 accepted; causal parity supported**
- Runtime source: `playables/block-out-v1/src/presentation.ts`
- Prototype ledger: `playables/block-out-v1/REFERENCE-CALIBRATION.md`

## Новая operator-цель

Operator 31.07.2026 запросил отдельную цель: самостоятельно заново исследовать
референс и максимально точно воспроизвести game feel, включая level design и
effects. Явно приоритетны чувствительность ворот, near-gate activation,
control takeover, дробление на одноцветные частицы и качество деталей.

Это `O` taste direction и authorization на prototype calibration. Это не
разрешение копировать exact layouts, trade dress/assets/logo/audio, включать
locked gates без новой rules version, публиковать или делать rollout.

## Что удалось измерить из native evidence

| Episode | Наблюдение | Authority | Ограничение |
| --- | --- | :---: | --- |
| N1 L11 `~56.43–56.53 s` | целая зелёная фигура передаётся верхним воротам; в следующих 30 fps кадрах появляется устойчивый одноцветный fragment stream | `R-native` | touch indicator отсутствует; exact trigger/easing остаются `B` |
| N1 L11 `~57.27 s` | следующая зелёная фигура уже имеет carried outline, пока частицы предыдущего выхода ещё видны | `R-native` | доказывает отсутствие полного input-lock, не точную latency |
| N1 L11 `~61.23–61.73 s` | после очистки есть короткий empty-board settle до затемнения | `R-native` | approximate 30 fps bracket |
| N1 L11 `~61.73–62.73 s` | success mark собирается до/вместе с первым полным confetti burst | `R-native` | собственная версия не копирует logo/art |
| N3 L15 `23.1–24.5 s` | fragments/particles имеют длинный tail | `R-native` | locked-gate particle effects накладываются, поэтому single-exit duration не извлекается честно |
| Operator narration | capture примерно за одну клетку, immediate control loss, no inertia, haptic throughout consume | `O` | haptic waveform в видео не существует |

## Build/progression drift

Публичные walkthrough `BO-R-S2` и `BO-R-S3` расходятся в feature ordering на
levels 6–10: ice/numbered/obstacle content появляется на разных номерах и в
разных layouts. Поэтому:

- номера `6–10` остаются `O` taste anchor;
- public video — `R-web` evidence семейства и feature progression;
- exact current-build layouts levels 6–10 — `B`;
- own pack калибруется по static feature vector и не копирует ни одну карту;
- ice/locks/counters остаются вне v1.

## `BlockOutFeelSpecV1`

Typed source identifies itself as schema `p4g.block-out.feel`, version `1`.

| Dimension | Candidate | Authority |
| --- | ---: | :---: |
| Snap settle | `120 ms` | `P` |
| Feedback-field start | `1.35 cells` in-board | `P` |
| Capture depth | `1.00 cell` in-board | `O` |
| Whole-body pull | `515 ms` | Falcon `R-native-paired` projection |
| Fragment onset | `75 ms` | Falcon `R-native-paired` projection |
| Throat convergence | `705 ms` | `R-derived/P` |
| Fragment/exhaust tail | `1,565 ms` | Falcon `R-native-paired` projection |
| Extra manual input lock after logical exit | `0 ms` | ordering `R-native/O`, exact projection `P` |
| Autoplay rest before next route | `120 ms` | `P` |
| Final-exit → own win overlay | `900 ms` | `P` |
| Own success badge entrance | `620 ms` | `P` |
| Own confetti delay/duration | `430 / 1,850 ms` | `P` |
| Haptic | soft @ `0`, rigid @ `150`, soft @ `430`, medium @ `820 ms` | behavior `O`; envelope `P/B` |

Falcon paired capture provides the timing bands above; derived throat remains
labelled `R-derived/P`. Final causal review returned repeat-consistent
`same / same`. Exact tactile waveform remains `B` because no captured haptic
signal exists.

## Own level-design feature ladder

| Level | Board | Blocks | Roles/gates | Occupied | Witness | Non-exit moves | Initial legal |
| ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 1 | `6×7` | 8 | `4/4` | `25/42 = 59.5%` | 8 | 0 | 9 |
| 2 | `6×6` | 9 | `4/4` | `25/36 = 69.4%` | 9 | 0 | 12 |
| 3 | `5×5` | 10 | `5/5` | `22/25 = 88.0%` | 10 | 0 | 6 |
| 4 | `5×5` | 10 | `4/4` | `21/25 = 84.0%` | 10 | 0 | 9 |
| 5 | `5×5` | 10 | `4/4` | `19/25 = 76.0%` | 11 | 1 | 5 |

Все layouts original. Repeated roles дают reusable-gate streak и исчезновение
gate только после последней фигуры role. Level 5 меняет axis сложности: меньше
initial branches и один обязательный reposition вместо простого роста density.

## Parity gate

Review 4 проверяет не менее 20 observables: touch/carry visibility, 2D path,
positive-area collision, sliding, zero inertia, deterministic snap, feedback
depth, capture depth, body pull, fragment onset/throat/tail/colour, next-input
overlap, replay order, gate reuse/cleanup, empty-board settle, win staging,
exact-once completion, portrait frame cadence и compact-aspect mount.

Executable browser evidence: `npm run review4:block-out`. Before/after:
`npm run visual-proof block-out-v1 -- --level 1 --base 2add4d0 --include
block-out-v1/src/main.ts,block-out-v1/src/presentation.ts`.

Final receipts:

- Review 4 browser receipt SHA-256:
  `db17c3f583a3b7da637f142cccb723e50942f5bd8208aff712061351ea3b70da`;
  five boards, trace length `8`, host-pause digest/consume preserved, no page
  errors, frame median/p95 `16.7/16.8 ms`, `0/497` samples over `50 ms`;
- visual-proof base `2add4d037da1`, exact two-file patch SHA-256
  `aef0a90f5765981e0964b893f864b8f81c76b6201eafa25b5d618d67f3f4a3a1`;
  before and after both end in a real win;
- artifact inventory and composite hashes are pinned in
  `playables/block-out-v1/REVIEW-4-PACKET.md`; artifacts/reference media stay
  outside git.

## Final disposition

- causal Reference→Twin: `same / same`, `parity-supported`;
- Twin→Original: `same / same`, feel preserved;
- exact haptic waveform: explicit `B`; provisional supported-host stages stay
  without an exact Falcon parity claim;
- five own levels: solver/signature/provenance/near-duplicate pass;
- deferred outside prototype: publication taste, locked/countdown gates and
  all other modifiers.
