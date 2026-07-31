# Falcon Block Out — native frame ledger

- Date: **31.07.2026**
- Primary build: `com.fc.block.out.wood.puzzle` `1.0.177+177`
- Device: Samsung SM-A326B, 720×1600, 60 Hz
- Scenario: `BO-FC-GS-01-L2-GATE`
- Pair status: **verified**
- Authority amendment:
  [`REFERENCE-AMENDMENT-FALCON-2026-07-31.md`](REFERENCE-AMENDMENT-FALCON-2026-07-31.md)

## Source quality

Instrumented media contains 483 video frames across `8.013556 s` of PTS span.
Frame intervals are variable: median `16.544 ms`, p95 `19.311 ms`, maximum
`32.389 ms`. Event tolerances below never claim a narrower bound than the
adjacent source-frame interval.

Initial clean/instrumented screenshots are byte-identical. Pair verification
reports no structural mismatch and perceptual distance `0` against threshold
`4`.

## Event ledger

| Event | PTS / bracket | Relative to takeover | Authority | Method / confidence |
| --- | ---: | ---: | :---: | --- |
| Carried outline becomes established | first changed frame near `1.174 s`; preceding input marker is not visually separable from the block | n/a | `R-native-instrumented` | top-block crop + frame-difference onset; `0.75` |
| Last stable carried pose before control transfer | `2.746 s` | `-32 ms` | `R-native-paired` | board YDIF remains on carried-motion cadence; `0.85` |
| Gate takeover / body-pull discontinuity | `(2.746, 2.778] s` | `0` at `2.778 s` projection | `R-native-paired` | first discontinuity after stable carry; adjacent interval `32.389 ms`; `0.9` |
| First visible same-role fragments | `(2.829, 2.846] s` | `+68 ms` projection | `R-native-paired` | 30 fps inspection sheet plus original PTS neighbourhood; `0.85` |
| Fragments enter the above-gate particle zone | `(2.863, 2.878] s` | `+99 ms` projection | `R-native-paired` | saturation departs exact baseline; `0.95` |
| Whole body is no longer present below the gate | `(3.277, 3.292] s` | `+514 ms` projection | `R-native-paired` | body-zone saturation reaches post-consume baseline; `0.9` |
| Above-gate particle density reaches its maximum | `3.484 s` | `+705 ms` | `R-derived` | maximum saturation in fixed particle crop; `0.8`, proxy for throat/exhaust transition |
| Last particle crop above baseline | `(4.325, 4.342] s` | `+1,563 ms` projection | `R-native-paired` | saturation returns to pre-event baseline; `0.95` |

`R-derived` means the number is computed from a declared crop and is not
silently promoted to a semantic reference event. In particular, maximum pixel
density is only a proposal proxy for the presentation profile's
`fragmentThroatMs`.

## Falcon profile projection

These bands are the narrowest values justified by this scenario. They do not
yet authorize Production Original changes.

| Profile field | Falcon projection | Current candidate before Falcon | Disposition |
| --- | ---: | ---: | --- |
| `gatePullMs` | `480–550 ms` | `220 ms` | current candidate is materially too fast |
| `fragmentStartMs` | `50–100 ms` | `80 ms` | current candidate remains compatible |
| `fragmentThroatMs` | `650–760 ms` | `430 ms` | current candidate likely turns outward too early |
| `fragmentEndMs` | `1,500–1,620 ms` | `1,250 ms` | current candidate tail is too short |

No Falcon value is yet available for snap settle, exact pickup latency,
proximity feedback depth, win cadence or haptic envelope.

## Mid-drag rule probe

Scenario `BO-FC-GS-02-L2-HOLD-GATE` places a block at the gate and schedules
`UP` after the final `MOVE`. Its clean/instrumented pair verifies with pHash
distance `0/4`: clean duration `7.998611 s`, instrumented duration
`15.016744 s`, clean SHA-256 `0ded9cf3dd650de5071349ca3f2112f780f6175b5136c31765714a1b6fc717ed`
and instrumented SHA-256
`a08cbacebdc562c92cff506e8e1abed18870de1654c21fff35ba50310d3afe1e`.

Both channels show gate fragmentation before `UP`, so mid-drag capture is
`R-native-paired` with confidence `0.95`. Exact spatial depth remains open.
The gesture receipts also expose ADB delivery cost instead of hiding it: the
valid instrumented `MOVE` was invoked `794.0 ms` behind its planned offset,
while `UP` was invoked within `0.6 ms` of plan. An earlier home-screen attempt
with zero lives and an `8 s` recording that cut off the consume tail were
rejected and retained outside git.
