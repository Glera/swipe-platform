# Zen Match targeted probe matrix

Full recapture of Levels 6–10 is out of scope. Add a probe only after existing
frames/video/actions fail to answer a parity question.

| ID | Gap | Existing evidence first | Minimal probe | Output / stop condition | Status |
| --- | --- | --- | --- | --- | --- |
| ZP-01 | exact cold assembly offsets/timing | Level 9 entry fragment, 10 fps contact sheet | none | first response `≤100 ms`; settled/interactive approximately `0.8–0.9 s` | measured; no probe |
| ZP-02 | unavailable-tap onset/duration | action log and adjacent screenshots do not span a known covered tap through rest | Level 8 neutral setup; one deliberate covered-tile tap; uninterrupted `≤8 s`; `zp02-unavailable.mp4` | touch, first response and rest frames at 60 fps | concrete probe required before exact cadence claim |
| ZP-03 | fail UI cadence | Level 8 fail actions occur after Android recording deadline | deterministic captured pre-fail state; seventh tap; uninterrupted `≤12 s`; `zp03-fail.mp4` | seventh landing, fail onset, stable UI | concrete probe required |
| ZP-04 | goal counter closure cadence | Level 8 result fragment is hashed but invalid MP4 (`moov` absent); other terminals cross recording deadlines | Level 8 pre-terminal state; final target tap; uninterrupted `≤10 s`; `zp04-goal-win.mp4` | third landing, counter zero, win onset, stable result | concrete probe required |
| ZP-05 | Continue restoration transition | Level 8 before/fail/after state digests are proven; timing fragment is the invalid MP4 | captured fail state; tap Play On `300`; uninterrupted `≤8 s`; `zp05-continue.mp4` | tap, restored tray/board, input-ready frame | timing-only probe required |

Every added row must name build, level, setup state, exact stimulus, maximum
duration and expected file names. Captcha, purchase, ads and real-money
actions are never implicit probe steps.
