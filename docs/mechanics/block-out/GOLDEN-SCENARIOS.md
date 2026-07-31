# Block Out v1 golden scenarios

- Process: `reference-replication.v3`
- Status: pre-capture contract
- Vertical slice: `BO-GS-04`
- Gesture data: [`GESTURE-TRACES.v1.json`](GESTURE-TRACES.v1.json)
- Gap acquisition: [`PROBE-MATRIX.md`](PROBE-MATRIX.md)
- Primary-reference amendment:
  [`REFERENCE-AMENDMENT-FALCON-2026-07-31.md`](REFERENCE-AMENDMENT-FALCON-2026-07-31.md)

Golden scenarios — постоянный acceptance contract. Probe может закрыться;
scenario остаётся в regression/review наборе.

Falcon acquisition scenario `BO-FC-GS-01-L2-GATE` maps into `BO-GS-04` only
after its PTS ledger is dispositioned. It does not preserve the historical
Grand Games `1.50 → 0.90 cell` stimulus or one-cell threshold by assumption.

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
| `BO-MM-03` | compatible gate wakes near one cell and takes control mid-drag | `BO-GS-04` |
| `BO-MM-04` | whole-body pull becomes same-role fragments while next input is available | `BO-GS-04/06` |

## Scenarios

| ID | Initial state | Exact stimulus | Required observations | Pair |
| --- | --- | --- | --- | --- |
| `BO-GS-01` | one live block with open 2D area | pointerdown at block centroid; L-shaped trace; release between anchors | pickup onset; carried offset; no inertia; deterministic snap | clean + instrumented |
| `BO-GS-02` | block fits a corridor with zero clearance at contact boundaries | diagonal trace into wall, then continue along free axis | contact legal; blocked axis clamps; free axis progresses; overlap area `0` | clean + instrumented |
| `BO-GS-03` | block approaches an inside corner | diagonal trace whose both residual axes become blocked | no tunnelling; pose settles at last valid contact; release remains legal | clean + instrumented |
| `BO-GS-04` | compatible unlocked gate; block aligned just outside feedback field | slow trace from `1.50` to `0.90` in-board cells | feedback onset; first one-cell entry; immediate control transfer; body/fragment keyframes | clean + instrumented |
| `BO-GS-05` | two live blocks with a legal contact face | carried block presses diagonally against the stationary block | positive-area overlap `0`; tangential slide remains; stationary block does not move | clean + instrumented |
| `BO-GS-06` | one consume tail active and another live block reachable | pointerdown second block after first logical exit, before fragment tail ends | zero extra manual lock; both presentations overlap; stable action order deterministic | clean + instrumented |

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
