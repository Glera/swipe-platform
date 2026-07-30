# Zen Match targeted probe matrix

Full recapture of Levels 6–10 is out of scope. Add a probe only after existing
frames/video/actions fail to answer a parity question.

| ID | Gap | Existing evidence first | Minimal probe | Output / stop condition | Status |
| --- | --- | --- | --- | --- | --- |
| ZP-01 | exact cold assembly offsets/timing | Level start fragments + screenshots | one fresh level start, uninterrupted ≤15 s | frame-indexed assembly events | pending evidence extraction |
| ZP-02 | unavailable-tap onset/duration | blocked action + adjacent frames | one deliberate tap on a covered tile, ≤8 s | touch frame, first response, rest frame | pending evidence extraction |
| ZP-03 | fail UI cadence | seventh-slot fail fragment | one deterministic fail, ≤12 s | seventh landing, fail onset, stable UI | pending evidence extraction |
| ZP-04 | goal counter closure cadence | Level 6/7/8/10 terminal fragments | no probe unless fragment crosses a declared gap | third landing, counter zero, win onset | pending evidence extraction |
| ZP-05 | Continue restoration transition | captured Level 10 Play On action | no probe unless before/after state cannot be aligned | state digest before fail/after Continue | pending evidence extraction |

Every added row must name build, level, setup state, exact stimulus, maximum
duration and expected file names. Captcha, purchase, ads and real-money
actions are never implicit probe steps.
