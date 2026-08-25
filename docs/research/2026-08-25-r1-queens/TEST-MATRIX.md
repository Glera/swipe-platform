# Queens — future prototype acceptance matrix

This matrix is a handoff contract only. No implementation exists or is
authorized by this R1 pack.

| ID | Parent | Assertion | Verification | Gate |
| --- | --- | --- | --- | --- |
| `QR1-T01` | `QR1-MM01` | Every accepted board has exactly one solution under row/column/region/adjacency rules. | exhaustive solver fixture | MUST |
| `QR1-T02` | `QR1-MM01` | Two pieces at Chebyshev distance 1 are illegal; distant diagonal pieces remain legal. | adversarial unit cases | MUST |
| `QR1-T03` | `QR1-MM02` | Mark toggle never changes solution state or consumes a failure resource. | state-machine test | MUST |
| `QR1-T04` | `QR1-MM02` | Place/remove preserves unrelated marks and givens. | transition test | MUST |
| `QR1-T05` | `QR1-MM02` | Feed takeover gesture cannot accidentally place a piece. | browser/device input witness | MUST |
| `QR1-T06` | `QR1-MM03` | Last valid placement emits one win event and locks duplicate terminal actions. | deterministic event test | MUST |
| `QR1-T07` | `QR1-MM03` | Restart reconstructs exact initial givens and clears all user state. | state fingerprint | MUST |
| `QR1-T08` | `QR1-MM04` | Explain-hint names a logically supported cell before optional application. | fixture + copy snapshot | MAJOR |
| `QR1-T09` | rights | Shipping module graph/bytes contain no reference package, title, animal assets, capture paths or exact layout IDs. | production deny scan | MUST |
| `QR1-T10` | presentation | Original profile uses first-party shapes/palette/copy; masked comparison never relies on ZooDoku branding. | operator review | MUST |
| `QR1-T11` | pacing | Early ladder uses a sawtooth size band and removes givens deliberately rather than monotonically scaling N. | dataset inspection | MAJOR |
| `QR1-T12` | timing gap | Any advertised session band is supported by a fresh novice taste-session, not agent capture durations. | operator receipt | MUST before selection |

## Adversarial board checks

1. A board whose proposed solution has one row/column/region each but two
   diagonally adjacent pieces must be rejected. This catches an implementation
   that omits the king-adjacency rule.
2. A board with no adjacent pieces but two pieces on a long diagonal must be
   accepted if all other rules hold. This catches an implementation that uses
   classic full-diagonal N-Queens by mistake.
3. A locally conflict-free cell that is not part of the committed unique
   solution must remain legal in `constraint-only` mode. This catches a hidden
   correctness oracle leaking into the first-party profile.

## Golden scenario plan

- `QR1-G01`: 4×4 onboarding, one given, mark → place → final placement.
- `QR1-G02`: 6×6 zero-given, invalid adjacency contrast, remove/recover.
- `QR1-G03`: 8×8, one explain-hint, complete without timer/economy.

Exact reference layouts are not fixtures for shipping. Twin fixtures, if ever
authorized, are neutral-skinned, review-only and production-denied.
