# Bus A R1 — native observations

All observations below refer to Bus Jam `82.6.1+5625` unless explicitly
marked as a first-party proposal. Raw media remains local.

## Rule and input

- The only observed gameplay input is one tap on a visible passenger. Drag is
  not required.
- A passenger can move only when an orthogonal route to the boarding edge is
  clear. Taps on passengers blocked by occupied cells are no-ops.
- Empty board cells remain empty; passengers do not fall or compact.
- A matching passenger goes directly to the active three-seat receiver.
- A nonmatching passenger occupies the leftmost free one of five staging
  tiles.
- When the active receiver fills, it leaves, the next receiver arrives and
  already staged passengers of its color board automatically.
- The native surface visibly exposes the active receiver and one next-receiver
  preview. The full future order was not visible in levels 1–8.
- Reaching five occupied staging tiles triggers `Out Of Tiles` immediately,
  even when a matching legal move remains on the board. This is capacity-full
  failure, not true deadlock detection.
- Win fires after the final full receiver departs; no submit action is needed.
- No gameplay timer was observed through level 8.

## State / economy boundary

- Receiver capacity: `3`.
- Staging capacity: `5`.
- Lives: `5`; `Give Up` after overflow consumes one life and starts an
  approximately 30-minute refill clock.
- The overflow modal offered `+2` staging for `500` soft currency. It was not
  used.
- Completion paid `10` soft currency and exposed a video-marked x2 path. It
  was not used.
- Level 8 unlocked one free `Undo`. After use, its refill surface was
  video-marked and not touched.
- Passive ads and a `No Ads` purchase surface were present. No ad, purchase or
  store action occurred.

These economy systems are observations, not first-party requirements.

## Early ramp

| Level | Observed structural step | Outcome |
| --- | --- | --- |
| 1 | two colors, two receivers, direct tutorial | completed |
| 2 | two parallel depth-three lanes | completed |
| 3 | two interleaved colors; staging and auto-board required | completed |
| 4 | three colors; five-tile overflow deliberately demonstrated | failed once, exact retry, completed |
| 5 | three colors; one counted tunnel (`3`) with hidden sequence | completed |
| 6 | three colors; two counted tunnels (`2` each) | completed |
| 7 | four colors and an irregular mask | completed |
| 8 | five colors, multiple counted tunnels (`2/4/2`), Undo unlock | bounded assist probe; not completed |

Every completed early receiver carried three passengers. The observed counts
remain consistent with the R0 per-color multiple-of-three generator invariant.
Exact layouts are evidence only and are forbidden as shipping datasets.

## Counted tunnels

A tunnel has a visible count and withholds future passenger identities. When
the current outlet passenger clears, the count decrements and another
passenger can appear. Levels 5 and 6 demonstrate deterministic reveal, but R1
does not establish the complete serialization contract or whether the displayed
count includes the currently exposed passenger. Tunnels are therefore a later
layer, not part of a first neutral slice.

## Media-derived timing bands

Measurements use a 10 Hz grayscale motion detector over the gameplay region.
Uncertainty is at least `±0.1 s`; no easing curve is claimed.

| Reaction | Native windows | Working band |
| --- | --- | --- |
| passenger → receiver | `0.8 / 1.0 / 0.9 / 0.9 s` | about `0.8–1.0 s` |
| passenger → staging | `0.4 / 0.5 / 0.6 / 0.6 / 0.7 s` | about `0.4–0.7 s` |
| full receiver leaves + next arrives | `2.2 s` | about `2.0–2.4 s` |
| final receiver through completion terminal | `4.4 s` | about `4.2–4.6 s` |

The first-launch clean recording has scene onsets at PTS `4.597`, `9.775`,
`23.943`, `40.304` and `47.972 s` for launcher-to-app transition, terms,
publisher splash, title splash and tutorial gameplay. The recorder began on
the operator-opened Store page, so those PTS values are media landmarks, not
cold-start SLA.

## Clean/instrumented parity

- Scenario: stable level-1 completion modal plus one tap on noninteractive
  dimmed background.
- Clean / instrumented media: `7.873589 / 7.995300 s`.
- Normalized state fingerprint matches.
- Start aHash: `047e7e3c1800ff00` in both channels.
- Hamming distance: `0`, allowed threshold: `12`.
- High-resolution control timestamp is absent; latency claims are blocked.

## Honest uncertainty

- Organic novice solve-time and feed takeover comfort are unmeasured.
- Full future receiver order and over-capacity staged auto-load were not
  exercised.
- Native audio was not captured.
- No explanatory solver hint was observed through level 8; only Undo.
- Color-only identity needs a first-party secondary cue.
- Shipping overflow semantics remain an operator taste decision: native
  capacity-full fail versus a fairer reject/deadlock rule.
