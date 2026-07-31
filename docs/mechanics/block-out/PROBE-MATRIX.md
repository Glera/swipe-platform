# Block Out v1 targeted probe matrix

Full replay is not authorized merely to improve coverage. Each probe closes a
named golden-scenario gap and produces a clean/instrumented pair.

| ID | Scenario | Gap | Minimal probe | Output / stop condition | Status |
| --- | --- | --- | --- | --- | --- |
| `BO-PR-01` | `BO-GS-01` | exact pickup onset and release/snap cadence | stable one-block setup; one L trace; `≤8 s` per channel | input PTS, first carried frame, release, settled pose | blocked on Lab doctor/device |
| `BO-PR-02` | `BO-GS-02/03/05` | corridor/corner/two-block contact pose progression | three deterministic slow traces; `≤10 s` each | poses at `0/25/50/75/100%`; overlap/classification receipt | blocked on Lab doctor/device |
| `BO-PR-03` | `BO-GS-04` | feedback/capture/control-transfer/fragment cadence | aligned compatible gate; trace from `1.50` to `0.90` cells; `≤8 s` | feedback onset, one-cell entry, body/fragment keyframes, tail end | first vertical-slice probe; blocked on Lab doctor/device |
| `BO-PR-04` | `BO-GS-06` | next-input latency during active tail | exit first block, pointerdown second before tail ends; `≤10 s` | logical exit anchor, second pickup response, overlapping tails | blocked on Lab doctor/device |

Every probe declares package/build, level/setup, exact trace ID, maximum
duration, channel and expected filenames before device mutation. Ads, purchase,
captcha and real-money actions are never implicit steps.
