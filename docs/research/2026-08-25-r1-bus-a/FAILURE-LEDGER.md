# Bus A R1 — capture failure ledger

| ID | Boundary | Failure / qualification | Disposition |
| --- | --- | --- | --- |
| `BR1-F01` | reference identity | Initial R1 preflight found no authoritative package and stopped before UI interaction. | Durable typed blocker c.5410170233; resumed only after unified identity c.5410816905 and operator install. |
| `BR1-F02` | device package | Operator install claim first arrived before the package was visible on the connected device. | Second typed blocker c.5410905609; no launch until `pm path` resolved. |
| `BR1-F03` | installer metadata | Android 11 does not support `cmd package get-install-source`. | Used `dumpsys package` installer field plus on-device split hashes; no source copy. |
| `BR1-F04` | host display utility | `displayplacer` was unavailable. | Used adb display size/density and doctor refresh-rate evidence; no capture impact. |
| `BR1-F05` | progression interruption | After level 2 the app automatically opened a local profile editor; a scripted tap reached the keyboard. | Dismissed without save or login. Screenshot is raw-only and supports no mechanic claim. |
| `BR1-F06` | input inference | Repeated taps targeted cells already emptied by the first move. | No claim about animation-time input queuing; only distinct accepted moves support observations. |
| `BR1-F07` | pair timing | Clean/instrumented tap used a shell `2 s` offset without an independent high-resolution control timestamp. | Pair accepted for state/channel equivalence only; latency remains unsupported. |
| `BR1-F08` | assist taxonomy | No explanatory solver hint was found through level 8. | Undo is recorded as reversible assist, not mislabeled as a hint. Explain-hint remains optional Original design. |
| `BR1-F09` | ads/economy | Passive banners and video-marked reward/refill controls appeared. | No ad, purchase or Store interaction; economy frames are boundary evidence only. |
| `BR1-F10` | progression scope | Level 8 was not completed after the Undo probe. | Intentional bounded stop; levels 1–7 plus first assist close early-ramp evidence. |
| `BR1-F11` | human timing | Agent play includes inspection and capture-tool latency. | Only media reaction windows are reported; novice solve-time remains a taste-session gap. |

No failed probe was silently converted into supporting evidence. Every raw file,
accepted or qualified, is covered by the immutable local manifest.
