# Replication process receipt: `block-out-v1`

- Process version: `reference-replication.v3`
- Status: `capture-blocked-platform-mismatch`
- Class authority: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)
- Golden scenarios: [`GOLDEN-SCENARIOS.md`](GOLDEN-SCENARIOS.md)
- Gesture traces: [`GESTURE-TRACES.v1.json`](GESTURE-TRACES.v1.json)
- Probe matrix: [`PROBE-MATRIX.md`](PROBE-MATRIX.md)
- Final disposition: `pending`

## Efficiency

| Metric | Value | Evidence |
| --- | ---: | --- |
| Operator minutes | not timed | one device-setup/authorization session; capture did not start |
| Operator sessions | `1` | Android device connected and authorized |
| Unique choice decisions | `0 / 6` | vertical slice pending |
| Hidden repeat decisions | `0 / 2` | vertical slice pending |
| Recaptures | `0` | capture not started |
| Targeted probes | `0 / 4` | Lab doctor passes; exact reference is unavailable on the connected Android device |
| Automatic correction rounds | `0 / 2` | vertical slice pending |
| Auto-verified parity rows | pending | contract validator lives with playable profile |
| Rework after first taste gate | `0` | gate not yet held |

## Gate receipts

| Gate | Result | Evidence / next condition |
| --- | --- | --- |
| Authority ready | partial | latest one-cell gate authority and v3 scenarios present; must-match second-takt pending native pair |
| Evidence ready | blocked | doctor passes on Samsung SM-A326B; the official Grand Games Google Play profile exposes Magic Sort and Car Match, not Block Out; exact-title device search finds only unrelated publishers |
| Twin ready | pending | first `BO-GS-04` pair first |
| Vertical slice | pending | matched `BO-GS-04` operator disposition |
| Runtime unified | candidate | existing Block Out runtime; re-check after evidence binding |
| Presentation parity | pending | no failed MUST and profile-vs-contract receipt required |

## Stop-rule disposition

- All MUST green: no; capture gaps remain.
- Open MAJOR owner: BO-P/agent after BO-PR-03.
- Operator budget exceeded: no.
- Trusted isolated `adb` and the target Android device make doctor pass; the
  Homebrew cask checksum mismatch was not bypassed.
- Work stops before capture because the approved exact reference is published
  for iPhone/iPad, while its official Google Play developer profile does not
  offer Block Out and exact-title search on the connected device finds only
  unrelated publishers. A supplementary direct app-id probe also returned
  `Item not found`. Third-party APK mirrors are not acceptable identity
  authority.
- Next unblock condition: an iPhone/iPad with the Grand Games build installed,
  or an explicit operator ruling that selects a different Android reference.
