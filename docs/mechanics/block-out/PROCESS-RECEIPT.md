# Replication process receipt: `block-out-v1`

- Process version: `reference-replication.v3`
- Status: `operator-disposition-required`
- Class authority: [`CLASS-BRIEF.md`](CLASS-BRIEF.md)
- Golden scenarios: [`GOLDEN-SCENARIOS.md`](GOLDEN-SCENARIOS.md)
- Gesture traces: [`GESTURE-TRACES.v1.json`](GESTURE-TRACES.v1.json)
- Probe matrix: [`PROBE-MATRIX.md`](PROBE-MATRIX.md)
- Primary-reference amendment:
  [`REFERENCE-AMENDMENT-FALCON-2026-07-31.md`](REFERENCE-AMENDMENT-FALCON-2026-07-31.md)
- Native frame ledger:
  [`FALCON-FRAME-LEDGER-2026-07-31.md`](FALCON-FRAME-LEDGER-2026-07-31.md)
- Reference Twin:
  [`REFERENCE-TWIN.md`](REFERENCE-TWIN.md)
- Final review packet:
  [`FINAL-REVIEW-PACKET-2026-07-31.md`](FINAL-REVIEW-PACKET-2026-07-31.md)
- Correction round 1:
  [`CORRECTION-1-2026-07-31.md`](CORRECTION-1-2026-07-31.md)
- Final disposition: `pending`

## Efficiency

| Metric | Value | Evidence |
| --- | ---: | --- |
| Operator minutes | not timed | device authorization plus six completed decisions across two review sessions |
| Choice sessions | `2 / 2 complete` | initial matched review and correction review complete |
| Unique choice decisions | `3 / 3 complete` | Reference→Twin round 1, Twin→Original and corrected Reference→Twin |
| Hidden repeat decisions | `3 / 3 complete` | all repeats are semantically consistent after mapping resolution |
| Recaptures | `1` | short instrumented hold recording rejected and repeated; zero-life run rejected before evidence attachment |
| Targeted probes | `2 pairs` | gate-consume and held-at-gate pairs verify at pHash distance `0/4` |
| Automatic correction rounds | `2 / 2` | native cadence calibration, then front-to-back fragment correction after matched review |
| Auto-verified parity rows | `6 / 6` | contract/profile, first-rAF pickup raster, Twin replay, browser runtime and production-deny tests |
| Rework after first taste gate | `1 bounded correction` | front-to-back fragment propagation and guarded review surface |

## Gate receipts

| Gate | Result | Evidence / next condition |
| --- | --- | --- |
| Authority ready | pass | Falcon/CYLINDER build is primary; must-match projection and stop rule are frozen |
| Evidence ready | pass for vertical slice | doctor passes; both Level 2 pairs verify with perceptual distance `0`; other scenarios remain explicit gaps |
| Twin ready | pass | exact internal Level 2 dataset validates/replays in the canonical runtime; production bundle deny passes |
| Vertical slice | operator disposition required | Twin→Original feel is preserved; corrected Reference→Twin still identifies Reference `2/2` |
| Runtime unified | pass | Twin and Original use one rules/engine/validator/presentation profile |
| Presentation parity | machine-pass/operator-blocked | corrected profile is inside contract; `28/28` tests and Review 4 browser receipt `38042c1…` pass, but causal parity is not operator-supported |

## Stop-rule disposition

- All MUST machine assertions green: `6/6` parity rows carry machine evidence.
- Round-1 Twin→Original feel preservation is green (`same / same`).
- Corrected Reference→Twin again selected Reference `2/2` after A/B mapping
  reversal; receipt SHA-256 `86adeae753763693d68e4bc1efdb583a6e49ea3bc1d3b9fd16718d9288b3aacc`.
- Automatic correction budget is exhausted. Open blocker: explicit operator
  disposition on diagnostic-only re-alignment, accepting the known delta, or
  granting an exceptional additional correction round after diagnosis.
- Operator budget exceeded: no.
- Trusted isolated `adb` and the target Android device make doctor pass; the
  Homebrew cask checksum mismatch was not bypassed.
- The previous Grand Games platform blocker is superseded by the explicit
  operator selection of the installed Falcon/CYLINDER Android title.
- Lives were consumed only by Level 2 starts/retries. No ad, purchase or
  real-money action occurred.
- Capture settings, notifications, stay-awake and network were restored; all
  exported device-side capture files were removed after hash verification.
