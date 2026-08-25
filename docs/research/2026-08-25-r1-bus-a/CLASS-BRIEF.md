# CLASS-BRIEF — bounded Bus A copy-ticket handoff

- Brief version: `bus-a-r1-class-brief.v1`
- Evidence status: `reference_ready`
- Product selection: not granted
- Implementation authority: not granted
- Process version: `reference-replication.v3.1`
- Process receipt: [`PROCESS-RECEIPT.md`](PROCESS-RECEIPT.md)

> This brief is evidence authority, not implementation or publication authority.

## VISION triage

- Uncertainty: whether the dependency + five-slot buffer loop stays legible and
  fair in a portrait feed after removing transport identity.
- Proven: native rule/input, three-seat receivers, five staging tiles,
  auto-board, capacity fail/restart, early ramp and first assist.
- Required decision: a separate durable copy/selection GO after independent
  pack review.
- Forbidden: automatic code, shipping dataset, production economy or deploy.

## Goal

Prove one neutral first-party vertical slice in which reachability, staging,
receiver change, auto-board and win remain causally readable. Reference → Twin
tests rule/input causality; Twin → Original tests overflow policy, original
metaphor, novice pacing and feed takeover on matched logical state.

## Non-goals

- reproduction of Bus Jam naming, buses, road, characters, UI or economy;
- tunnels, hidden information or level factory in the first slice;
- exact motion/audio fidelity;
- autoplay or production adoption;
- claiming a human session band before operator taste.

## Exact reference

- Bus Jam 82.6.1 (`versionCode=5625`), `com.nt.games.busjam`.
- Google Play install by operator; iOS `6450176534` unified identity.
- Device range: first launch, completed levels 1–7, level 8 Undo sample.
- Raw manifest:
  `2358aab827bb1f3dd42548a557ada54f6690ee5892567efbb257db3d1ad89479`.
- Canonical gameplay:
  `05dea09f4e44948b97d7acdc682ea829cab1fd7d544ed134f036777b6d9f25a1`.

### Operator must-match moments

| ID | Moment | Why salient | Golden scenario | Status |
| --- | --- | --- | --- | --- |
| `BR1-MM01` | A blocked dependency opens and the newly reachable token becomes selectable | defines board causality | `BR1-G01` | provisional |
| `BR1-MM02` | A mismatch enters staging; matching receiver arrival unloads it automatically | defines the buffer loop | `BR1-G01` | provisional |
| `BR1-MM03` | Staging reaches its policy boundary and restart is immediately understandable | fairness / recovery | `BR1-G02` | operator choice required |
| `BR1-MM04` | Third matching token completes the receiver and one terminal follows | causal payoff | `BR1-G01` | provisional |

MUST parity is not frozen until an operator choice session assigns disposition.

### Evidence boundary

- Agent-operated Android capture; raw bytes and device ID local-only.
- Clean/instrumented pair passes at pHash distance 0.
- Levels 1–7, one capacity fail/retry and level 8 Undo sampled.
- Ads, purchases, Store navigation, login and APK copying were forbidden.
- Native lives/currency/ads are observations and excluded from Original.

### Machine-readable authority

- [`OBSERVATIONS.v1.json`](OBSERVATIONS.v1.json) — SHA-256
  `4ef94861774a957fd77965fef626fbf357e23961d4574e29e404d7afc9c9672e`.
- [`FIDELITY-CONTRACT.v1.json`](FIDELITY-CONTRACT.v1.json) — SHA-256
  `f3e9a56edaf66961ea69cabc9a6993dfcd9e3499d7eccc4b73da1737b4c95ba1`.
- [`PRESENTATION-PROFILE.v1.json`](PRESENTATION-PROFILE.v1.json) — SHA-256
  `0862d9adca1cdd8df17f919168f2917796125e9a1ace728a14c8d4a445afad13`.
- [`evidence/manifest.json`](evidence/manifest.json) — SHA-256
  `1a2f04b12908ba8a1e48d7df3f45e6f45a9d4ace00af8b3896fa85d92d0c9b54`.

Implementation, if separately authorized, consumes only the presentation
profile. Provisional and unresolved fields fail closed for scale-out.

### Parity checklist

| ID | Parent | Salience | Assertion | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| `BR1-P01` | `MM01` | MUST | reachable-only tap and blocked no-op | solver fixtures | evidence-ready |
| `BR1-P02` | `MM02` | MUST | capacity `3`, staging `5`, leftmost fill | state trace | evidence-ready |
| `BR1-P03` | `MM02` | MUST | staged matches auto-board on receiver change | transition trace | evidence-ready |
| `BR1-P04` | `MM03` | MUST | Twin native overflow and Original chosen policy remain separate | paired fixtures | proposed |
| `BR1-P05` | `MM03` | MUST | restart restores exact initial fingerprint | state hash | evidence-ready |
| `BR1-P06` | `MM04` | MUST | exactly one win after final receiver | event + video | proposed |
| `BR1-P07` | input | MUST | feed takeover cannot select | device witness | blocked on slice |
| `BR1-P08` | rights | MUST | no reference identity/layout in production bytes | deny scan | blocked on build |

### Transition parity matrix

| Pre-state | Input | Reaction | Settle/effect | Final state | Naive failure caught |
| --- | --- | --- | --- | --- | --- |
| reachable matching token | tap | token leaves cell | receiver load +1 | ready | teleport/incorrect target |
| reachable mismatch, free staging | tap | token takes leftmost tile | board cell empty | ready | unordered buffer |
| receiver load 2 | matching tap | third seat fills | receiver advances; staged matches unload | ready/win | duplicate receiver event |
| full staging | mismatch tap | policy-specific rejection/fail | no partial mutation | ready/failed | hidden economy dependency |
| failed | restart | terminal closes | exact initial hash | ready | stale buffer/tunnel state |

## Rights / Twin boundary

- Never copy: Bus Jam/Rollic naming, transport/road identity, character
  proportions, blue panel system, buttons, copy, audio, exact boards,
  progression, ads or economy.
- Replace with an original capacity/queue metaphor, tokens, secondary color
  cues, palette, type, feedback, motion and original datasets.
- Exact captured layouts may exist only in an internal neutral Twin with
  provenance and production deny.
- Twin and Original share one renderer, input state machine, viewport mapping
  and clocks; the selector changes data/presentation profile only.
- Release fails closed to Original and contains no Twin IDs or capture paths.

## Core fantasy and loop

Fantasy: untangle a crowded dependency field by routing each token to the
right limited-capacity receiver without exhausting temporary holding space.
Loop: read active/next receiver → expose a reachable token → send direct or
stage → exploit automatic unload → complete the sequence.

## First screen / input

Portrait frame shows the active receiver, original dependency board and five
holding positions with no timer. Input intent is one tap to select plus
restart; optional Undo is nonmonetized. Feed takeover safety is unproven.

## Review gates

1. Independent reference-pack review.
2. Freeze one first-party presentation profile by operator choice.
3. One neutral vertical slice only.
4. Reference → Twin causal proof.
5. Twin → Original operator session: overflow policy, novice timing and feed
   takeover.
6. Production deny scan before any release authority.

Until all relevant gates have durable dispositions, implementation and
scale-out remain blocked.
