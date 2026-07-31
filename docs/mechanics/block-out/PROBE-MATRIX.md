# Block Out v1 targeted probe matrix

Full replay is not authorized merely to improve coverage. Each probe closes a
named golden-scenario gap and produces a clean/instrumented pair.

| ID | Scenario | Gap | Minimal probe | Output / stop condition | Status |
| --- | --- | --- | --- | --- | --- |
| `BO-PR-01` | `BO-GS-01` | exact pickup onset and release/snap cadence | stable one-block setup; one L trace; `≤8 s` per channel | input PTS, first carried frame, release, settled pose | planned; locate stable Falcon state |
| `BO-PR-02` | `BO-GS-02/03/05` | corridor/corner/two-block contact pose progression | three deterministic slow traces; `≤10 s` each | poses at `0/25/50/75/100%`; overlap/classification receipt | planned; locate Falcon states |
| `BO-PR-03` | `BO-GS-04` | feedback/capture/control-transfer/fragment cadence | aligned compatible gate; trace from `1.50` to `0.90` cells; `≤8 s` | feedback onset, one-cell entry, body/fragment keyframes, tail end | Falcon Level 2 pair captured; PTS ledger pending |
| `BO-PR-04` | `BO-GS-06` | next-input latency during active tail | exit first block, pointerdown second before tail ends; `≤10 s` | logical exit anchor, second pickup response, overlapping tails | planned; locate reachable Falcon state |

## Falcon amendment status — 31.07.2026

The primary reference changed after this matrix was frozen. Native scenario
`BO-FC-GS-01-L2-GATE` is a verified Level 2 clean/instrumented pair and becomes
the first acquisition input for `BO-PR-03`; it does not inherit the former
Grand Games one-cell threshold. `BO-PR-01/02/04` remain planned against Falcon
states that must first be located on-device.

Every probe declares package/build, level/setup, exact trace ID, maximum
duration, channel and expected filenames before device mutation. Ads, purchase,
captcha and real-money actions are never implicit steps.
