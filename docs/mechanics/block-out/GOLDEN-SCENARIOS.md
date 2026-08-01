# Block Out v1 golden scenarios

- Process: `reference-replication.v3.1`
- Status: v3.1 machine quorum pass; full operator field play pending
- Vertical slice: `BO-GS-04`
- Gesture data: [`GESTURE-TRACES.v1.json`](GESTURE-TRACES.v1.json)
- Gap acquisition: [`PROBE-MATRIX.md`](PROBE-MATRIX.md)
- Primary-reference amendment:
  [`REFERENCE-AMENDMENT-FALCON-2026-07-31.md`](REFERENCE-AMENDMENT-FALCON-2026-07-31.md)

Golden scenarios — постоянный acceptance contract. Probe может закрыться;
scenario остаётся в regression/review наборе.

Falcon scenarios `BO-FC-GS-01-L2-GATE` and
`BO-FC-GS-02-L2-HOLD-GATE` now map into `BO-GS-04`. They preserve the
mid-drag takeover and measured consume cadence, but do not preserve the
historical Grand Games one-cell threshold by assumption.

## Frozen scenario rules

- Coordinates normalized to the gameplay board viewport `[0,1] × [0,1]`.
- Replay preserves ordered samples and normalized elapsed time; device delivery
  jitter записывается отдельно.
- Manual v0 comparison uses poses at `0/25/50/75/100%` progress plus declared
  semantic events. Generic continuous CV tracking не требуется.
- Native visual/timing authority требует `clean + instrumented` pair with one
  scenario ID and equivalent initial-state receipt.
- Exact reference layouts/assets do not enter Production Original fixtures.

## Must-match projection

| Must-match | Moment | Golden scenarios |
| --- | --- | --- |
| `BO-MM-01` | pickup and continuous carried response | `BO-GS-01` |
| `BO-MM-02` | collision contact slides without overlap/sticky stop | `BO-GS-02/03/05` |
| `BO-MM-03` | compatible gate wakes on approach and takes control mid-drag before release | `BO-GS-04` |
| `BO-MM-04` | whole-body pull becomes same-role fragments while next input is available | `BO-GS-04/06` |
| `BO-MM-05` | gate exit is physically and role constrained | `BO-GS-07/08` |
| `BO-MM-06` | legal corridors remain reversible under continuous drag | `BO-GS-09` |
| `BO-MM-07` | intact body keeps scale and disappears behind gate art while particles emerge at the boundary | `BO-GS-10` |

## Scenarios

| ID | Initial state | Exact stimulus | Required observations | Pair |
| --- | --- | --- | --- | --- |
| `BO-GS-01` | one live block with open 2D area | pointerdown at block centroid; L-shaped trace; release between anchors | pickup onset; carried offset; no inertia; deterministic snap | clean + instrumented |
| `BO-GS-02` | block fits a corridor with zero clearance at contact boundaries | diagonal trace into wall, then continue along free axis | contact legal; blocked axis clamps; free axis progresses; overlap area `0` | clean + instrumented |
| `BO-GS-03` | block approaches an inside corner | diagonal trace whose both residual axes become blocked | no tunnelling; pose settles at last valid contact; release remains legal | clean + instrumented |
| `BO-GS-04` | compatible unlocked gate; block aligned outside capture | slow aligned gate trace plus held-at-gate trace | feedback onset; pre-release control transfer; body/fragment keyframes; exact depth may remain a declared gap | clean + instrumented |
| `BO-GS-05` | two live blocks with a legal contact face | carried block presses diagonally against the stationary block | positive-area overlap `0`; tangential slide remains; stationary block does not move | clean + instrumented |
| `BO-GS-06` | one consume tail active and another live block reachable | pointerdown second block after first logical exit, before fragment tail ends | zero extra manual lock; both presentations overlap; stable action order deterministic | clean + instrumented |
| `BO-GS-07` | compatible block aligned with gate but another live figure occupies the throat between capture pose and boundary | drag toward gate and hold/release at contact | no logical exit; no overlap; blocker remains; pointerdown/release cannot synthesize capture | clean + instrumented |
| `BO-GS-08` | block aligned with a foreign-role gate; own gate elsewhere | drag into foreign gate, tap in capture-adjacent pose and release | no foreign-role exit in model/browser; role and rendered gate marker agree | clean + instrumented |
| `BO-GS-09` | narrow corridor/shoulder contact with a legal outward route | replay path forward, exact reverse and two alternative event segmentations | returns to initial pose within tolerance; no carried-silhouette enlargement beyond collision geometry | clean + instrumented |
| `BO-GS-10` | compatible clear gate with intact multi-cell block | slow gate consume sampled at `0/25/50/75/100%` pull | body scale constant; body progressively occluded behind foreground gate art; no intact pixels over foreground; fragments appear only at/outside gate plane | clean + instrumented |

## Initial-state binding

Each pair receipt must bind:

```text
package/build + scenario ID
+ board bounds and gate-role vector
+ stable block anchors/footprints/roles
+ counter/object-class vector
+ cropped pHash with declared threshold
```

Exact screenshot SHA identifies each media artifact but is not pair equality.

## Vertical-slice acceptance

`BO-GS-04` is first because it combines the highest-salience carry, gate
sensitivity, control transfer and fragmentation sequence.

Scale-out remains blocked until:

- both native channels verify;
- `BO-P-03` has no failed machine assertion;
- body/fragment poses at `0/25/50/75/100%` have dispositions;
- one matched Twin/Original micro-scenario receives operator disposition;
- no implementation number is relabelled `R-native` without source PTS.

Historical vertical-slice closure is superseded. New Close additionally
requires `BO-GS-07..10` on model, real browser pointer delivery and raw-clean
raster surfaces. Diagnostic occupancy is supplemental only.
