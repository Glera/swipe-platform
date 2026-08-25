# Queens R1 — capture failure ledger

| ID | Boundary | Failure | Disposition |
| --- | --- | --- | --- |
| `QR1-F01` | package identity | The initially installed package was a different title and opened a Cannon Smash playable ad. | Force-stopped immediately; no interaction. `initial/queens-r1-*` rejected. Exact ZooDoku package installed by operator before resuming. |
| `QR1-F02` | tutorial action | First planned double-tap recording ran while device state was locked/unready; no intended placement occurred. | Video rejected. Tutorial was completed with screenshot/action receipts after unlock. |
| `QR1-F03` | low-level input | Direct `adb shell sendevent` lacked device permission. | No escalation or settings change. Used bounded scrcpy HID/control fallback and documented it. |
| `QR1-F04` | Unity capture | Android `screenrecord` produced a static Level 12 video although state changed. | Video, frames and contact sheet rejected. Re-captured gameplay once on Level 13 via scrcpy; accepted. |
| `QR1-F05` | screenshot contamination | A Level 12 completion screenshot was captured later on the leaderboard and included a notification overlay. | Rejected; never publish or use as evidence. |
| `QR1-F06` | rewarded boundary | Tapping a zero-count magnifier opened a rewarded ad immediately. | No ad/store interaction. App force-stopped; frame classified only as safety-boundary receipt. |
| `QR1-F07` | human timing | Device solves were agent-operated and include transcription/capture overhead. | Values labeled capture wall durations. Organic human curve remains an explicit operator taste-session gap. |

No failure was hidden by a retry. The only semantic recapture was the bounded
Level 13 replacement for the demonstrably invalid static Unity recording.
