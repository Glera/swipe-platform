# Queens R1 — native observations

Grades follow `reference-replication.v3`: `R-native-clean`,
`R-native-instrumented`, `R-public`, `R-derived`, `B`.

## Rule and input

| ID | Observation | Grade | Evidence |
| --- | --- | --- | --- |
| `QR1-O01` | Board is `N×N` with exactly `N` colored regions. | `R-native-clean` | levels 1–13 |
| `QR1-O02` | Win requires one animal per row, column and region; adjacent animals are forbidden, including diagonal adjacency. Long diagonals are allowed. | `R-native-clean` | tutorial steps 1–8 |
| `QR1-O03` | Double-tap places an animal; tap places/removes X; swipe paints a row of X marks. | `R-native-clean` | full tutorial |
| `QR1-O04` | Correctness HUD `k/N` counts hidden-solution placements, not merely non-conflicting pieces. | `R-native-clean` | level 11 probes |
| `QR1-O05` | A double-tap on a hidden-solution-wrong cell immediately shows a red X and spends one heart. | `R-native-clean` | three-error sequence |
| `QR1-O06` | Correct final placement triggers completion automatically; there is no explicit submit. | `R-native-clean` | levels 1–13 |

The native app therefore uses an oracle-backed error model, unlike the R0
fan build which allowed conflicting pieces to remain. That oracle is product
surface, not required by the abstract puzzle rule.

## Failure, restart and hints

- The level starts with three hearts. Three wrong placements reach a modal
  offering rewarded revive or restart.
- Restart was selected: it restored three hearts and reset the board
  immediately. No cooldown, currency, passive refill or account was observed.
- Magnifier starts with count `3`; one tap directly places a correct animal
  and decrements the count.
- Lightbulb starts with count `3`; it explains/highlights a forced cell and
  applies the placement after Continue. The level-10 reward increased the
  count by one.
- At zero magnifier count, the control becomes a green-plus affordance. A tap
  immediately opened a rewarded ad, without an in-app confirmation. Capture
  stopped; the ad and store were not interacted with.

Shipping decision remains open. Hearts and rewarded ads are not part of the
mechanical copy contract and are excluded from the provisional first-party
profile.

## Difficulty and progression

| Level | N | Given | Capture wall duration, s |
| ---: | ---: | ---: | ---: |
| 1 | 4 | 1 | 36.689 |
| 2 | 4 | 1 | 16.421 |
| 3 | 6 | 1 | 29.148 |
| 4 | 6 | 1 | 23.566 |
| 5 | 8 | 1 | 40.438 |
| 6 | 6 | 1 | 30.237 |
| 7 | 6 | 1 | 22.300 |
| 8 | 8 | 1 | 71.388 |
| 9 | 8 | 1 | 33.019 |
| 10 | 8 | 1 | 30.185 |
| 11 | 6 | 0 | not comparable (failure/hint probes) |
| 12 | 6 | 0 | not comparable (recorder probe) |
| 13 | 8 | 0 | canonical scripted placement capture |

These are **agent-operated board-to-completion wall durations**. They include
visual transcription and capture overhead; level 8 additionally includes a
two-placement operator omission. They are not a human median and must not be
used as a session-duration claim.

The size curve is a sawtooth rather than a monotonic ladder:
`4,4,6,6,8,6,6,8,8,8,6,6,8`. Levels 1–10 supply one correct given; level 11+
starts at `0/N`. This gives two independent difficulty controls: board size
and starting information.

## Pacing and feedback

- The level board has no gameplay timer.
- Level 13 clean video is 23.840056 s. Recorder/control staging occupies the
  first ~10 s; the planned placement sequence itself is roughly 6–7 s and is
  not solve time.
- Positive placement labels observed across the sequence: `Observant`,
  `Good`, `Great`, `Excellent`, `Perfect`, `Amazing`, `Unbelievable`.
- Completion/leaderboard transition begins around PTS 17.09 s in the
  canonical video. Frame-level easing is not frozen by this pack.
- No automatic interstitial was observed between levels 1–11.
- After level 2 a daily reward track appeared; after level 4 an age survey
  was dismissed without an answer; after level 8 a rating prompt was
  dismissed; after level 10 a daily leaderboard and reward appeared. The
  reward announced a new animal and added one lightbulb hint.
- Later leaderboard panels show progression multipliers `×1/×2/×4/×8/×10`
  and a daily reset timer.

## Consent and safety

The app Terms screen was accepted to reach gameplay. In the consent manager,
all available toggles were turned off and choices confirmed. No personalized
data consent, login, payment, age, rating, ad completion or store navigation
was supplied.

## Derived implementation-neutral conclusions

1. Rule comprehension fits a short tutorial because the three constraints can
   each be demonstrated on the same 4×4 board.
2. Double-tap is a meaningful mis-tap risk in a swipe feed. A first-party
   playable should test a takeover-safe input mapping rather than inherit it
   blindly.
3. Correctness-counting and hearts soften/punish deduction simultaneously;
   both are surface choices, not causal requirements.
4. The sawtooth size ladder and removal of givens after ten levels are useful
   pacing patterns that can be reproduced with original datasets.
5. Organic human timing and first-party presentation remain taste gates.
