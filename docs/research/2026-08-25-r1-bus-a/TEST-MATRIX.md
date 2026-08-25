# Bus A — future prototype acceptance matrix

This matrix is a handoff contract only. No implementation is authorized by
the R1 pack.

| ID | Parent | Assertion | Verification | Gate |
| --- | --- | --- | --- | --- |
| `BR1-T01` | `BR1-MM01` | Each receiver consumes exactly three passengers and each color count equals three times its receiver count. | generator invariant + fixtures | MUST |
| `BR1-T02` | `BR1-MM01` | Only passengers with an orthogonal empty route to egress are selectable; blocked taps are no-ops. | reachability adversarial cases | MUST |
| `BR1-T03` | `BR1-MM02` | Matching selection boards directly; nonmatching selection occupies the leftmost free staging tile. | event/state trace | MUST |
| `BR1-T04` | `BR1-MM02` | Receiver change automatically boards staged matches and frees their tiles deterministically. | transition fixture | MUST |
| `BR1-T05` | `BR1-MM02` | Third seat emits exactly one receiver-full event and advances receiver order once. | deterministic event test | MUST |
| `BR1-T06` | `BR1-MM03` | Twin capacity-full policy fails on the fifth tile; Original policy is independently configured and cannot inherit economy. | paired policy fixtures | MUST |
| `BR1-T07` | `BR1-MM03` | Restart restores the exact initial logical fingerprint with no life/currency mutation. | state fingerprint | MUST |
| `BR1-T08` | `BR1-MM04` | Final receiver departure emits one win and locks duplicate actions. | event + visual witness | MUST |
| `BR1-T09` | optional tunnel | Tunnel reveal is deterministic and count semantics match its serialized state. | focused extension fixture | MAJOR after first slice |
| `BR1-T10` | input | Feed takeover swipe never selects a passenger; gameplay remains tap-only. | browser/device witness | MUST |
| `BR1-T11` | assist | Undo, if included, restores the immediately preceding legal logical state without ad/economy. | state-machine test | MAJOR |
| `BR1-T12` | rights | Shipping graph/bytes contain no reference package, title, transport art, layouts, copy, capture paths or provenance. | production deny scan | MUST |
| `BR1-T13` | presentation | Original tokens have a secondary non-color cue and first-party theme. | operator/color-accessibility review | MUST |
| `BR1-T14` | pacing | Any claimed session band is supported by a fresh novice session, not capture duration. | operator receipt | MUST before selection |

## Adversarial checks

1. A passenger surrounded by occupied cells must remain immobile even when its
   color matches the active receiver.
2. A nonmatching passenger with a full staging buffer must exercise the chosen
   overflow policy without partially mutating the board.
3. A receiver change with staged matches must normalize automatic moves before
   the next input is accepted.
4. Restart after native-style overflow must equal the original logical hash.
5. A generated level with a non-multiple-of-three color count must be rejected
   before solver search.

## Golden scenario plan

- `BR1-G01`: original two-color board, one staged mismatch, automatic unload,
  final receiver and one win.
- `BR1-G02`: original three-color board, fill staging to policy boundary,
  fail/reject, restart and exact fingerprint.
- `BR1-G03`: later optional original tunnel fixture with deterministic reveal
  and Undo; not part of the first neutral slice.

Exact reference layouts are never shipping fixtures. A separately authorized
Twin may encode them only under neutral presentation and a production deny.
