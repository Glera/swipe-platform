# Block Out v1 targeted probe matrix

Full replay is not authorized merely to improve coverage. Each probe closes a
named golden-scenario gap and produces a clean/instrumented pair.

| ID | Scenario | Gap | Minimal probe | Output / stop condition | Status |
| --- | --- | --- | --- | --- | --- |
| `BO-PR-01` | `BO-GS-01` | exact pickup onset and release/snap cadence | stable one-block setup; one L trace; `≤8 s` per channel | input PTS, first carried frame, release, settled pose | planned; locate stable Falcon state |
| `BO-PR-02` | `BO-GS-02/03/05` | corridor/corner/two-block contact pose progression | three deterministic slow traces; `≤10 s` each | poses at `0/25/50/75/100%`; overlap/classification receipt | planned; locate Falcon states |
| `BO-PR-03` | `BO-GS-04` | feedback/capture/control-transfer/fragment cadence | aligned compatible gate plus held-at-gate trace | pre-release takeover, body/fragment keyframes, tail end; exact depth may remain open | closed for vertical-slice cadence by two verified Falcon Level 2 pairs; exact depth dispositioned open |
| `BO-PR-04` | `BO-GS-06` | next-input latency during active tail | exit first block, pointerdown second before tail ends; `≤10 s` | logical exit anchor, second pickup response, overlapping tails | planned; locate reachable Falcon state |
| `BO-PR-05` | `BO-GS-07` | exact reference behavior with a figure directly in the gate throat | place/locate two aligned figures; drag rear figure toward gate | rear figure never exits through front figure; contact keyframes | operator behavior is authority; targeted native clip only if implementation boundary remains ambiguous |
| `BO-PR-06` | `BO-GS-08` | foreign-role gate negative behavior | drag each visible role into one mismatched gate | zero exit; role/gate visual ledger | operator bug report establishes required negative; native replay optional for timing only |
| `BO-PR-07` | `BO-GS-09` | reverse corridor pose progression | forward/reverse slow gesture in same corridor | keyframes and event-segmentation receipt | operator behavior is authority; exact curve may require targeted native clip |
| `BO-PR-08` | `BO-GS-10` | intact scale, occlusion order and grinding boundary | slow clear-gate consume | raw clean body bounds, gate foreground pixels and particle onset plane | operator description + existing Falcon clean clips; recapture only if raw frames cannot resolve boundary |
| `BO-PR-09` | `BO-GS-11` | held highlight persistence without pointermove | first-rAF plus `450 ms` stationary hold crop | white-outline occupancy stable; role-colour bounds exact | closed by Review4 raw Canvas samples |
| `BO-PR-10` | `BO-GS-12` | sticky offset takeover before alignment | lateral offset then one outward pointer sample; keep pressed | exit before pointerup; actual capture pose retained as trace authority | closed in candidate and refreshed Falcon clean semantic receipt |
| `BO-PR-11` | `BO-GS-13` | noisy exact-clearance input and active-drag latency | five sparse/wiggled real pointer samples through Level 2 centre corridor | anchor `[2,2]`; p95 frame/pointer latency frozen; no `>50 ms` long frames in measurement window | closed by Twin browser input; low-tier Android field confirmation remains operator gate |
| `BO-PR-12` | `BO-GS-14` | complete footprint can remain partly outside the aperture after offset takeover | exact-width and wider apertures; repeat with an obstacle in the lateral correction path | actual→nearest-fit poses, full containment before plane, obstructed correction rejected, raw cross centroid stable after fit | closed by `BO-FX-GATE-APERTURE-ALIGN` plus Review4 `20/95/130 ms` raster/geometry receipt |
| `BO-PR-13` | `BO-GS-15` | release near gate rolls back and fractional depth depends on event segmentation | lateral moved release inside field; static/outside controls; one-delta and segmented boundary crossing | one exact exit/no rollback; controls preserve digest; identical threshold pose for all segmentations | closed by `BO-FX-GATE-NEAR-RELEASE/GATE-THRESHOLD` and Review4 real-pointer release |

## Falcon amendment status — 31.07.2026

The primary reference changed after this matrix was frozen. Native scenario
`BO-FC-GS-01-L2-GATE` and `BO-FC-GS-02-L2-HOLD-GATE` are verified Level 2
clean/instrumented pairs and close `BO-PR-03` for the vertical slice. They do
not inherit the former Grand Games one-cell threshold. `BO-PR-01/02/04` remain
planned against Falcon states that must first be located on-device.

Every probe declares package/build, level/setup, exact trace ID, maximum
duration, channel and expected filenames before device mutation. Ads, purchase,
captcha and real-money actions are never implicit steps.
