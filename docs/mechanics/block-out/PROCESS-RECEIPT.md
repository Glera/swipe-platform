# Replication process receipt: `block-out-v1`

- Process version: `reference-replication.v3`
- Status: `pre-capture`
- Class authority: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)
- Golden scenarios: [`GOLDEN-SCENARIOS.md`](GOLDEN-SCENARIOS.md)
- Gesture traces: [`GESTURE-TRACES.v1.json`](GESTURE-TRACES.v1.json)
- Probe matrix: [`PROBE-MATRIX.md`](PROBE-MATRIX.md)
- Final disposition: `pending`

## Efficiency

| Metric | Value | Evidence |
| --- | ---: | --- |
| Operator minutes | `0` for v3 capture | capture not started |
| Operator sessions | `0` | capture not started |
| Unique choice decisions | `0 / 6` | vertical slice pending |
| Hidden repeat decisions | `0 / 2` | vertical slice pending |
| Recaptures | `0` | capture not started |
| Targeted probes | `0 / 4` | Lab doctor: storage/ffmpeg/ffprobe pass; adb/device blocked |
| Automatic correction rounds | `0 / 2` | vertical slice pending |
| Auto-verified parity rows | pending | contract validator lives with playable profile |
| Rework after first taste gate | `0` | gate not yet held |

## Gate receipts

| Gate | Result | Evidence / next condition |
| --- | --- | --- |
| Authority ready | partial | latest one-cell gate authority and v3 scenarios present; must-match second-takt pending native pair |
| Evidence ready | blocked | host storage/ffmpeg/ffprobe pass; trusted `adb` install and target device remain |
| Twin ready | pending | first `BO-GS-04` pair first |
| Vertical slice | pending | matched `BO-GS-04` operator disposition |
| Runtime unified | candidate | existing Block Out runtime; re-check after evidence binding |
| Presentation parity | pending | no failed MUST and profile-vs-contract receipt required |

## Stop-rule disposition

- All MUST green: no; capture gaps remain.
- Open MAJOR owner: BO-P/agent after BO-PR-03.
- Operator budget exceeded: no.
- Work stops before device mutation until trusted `adb` and target device make
  doctor pass. Homebrew cask checksum mismatch was not bypassed.
