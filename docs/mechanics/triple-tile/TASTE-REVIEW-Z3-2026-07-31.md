# Zen Match Z3 taste review — single runtime refreeze

- Date: **31.07.2026**
- Operator verdict: **current Reference Twin experience is materially more
  pleasant than the current Production Original candidate**
- New status: **Z3 single-runtime / taste-parity recovery active**
- Previous Production Original disposition: **R0 / taste parity failed**
- Merge and rollout: **not authorized**

## What this review changes

Z2 proved capture integrity, rules, exact trace replay, originality,
solver-validity, aggregate solution effort and platform lifecycle. It did not
prove that the reverse-generated Original levels preserved moment-to-moment
level feel.

The two local URLs were also presented as if they were competing product
versions:

- the shipping-safe Garden Curios runtime/Original dataset;
- a separate local Reference Twin viewer.

That is the wrong product abstraction. Twin and Original are datasets. There
must be one canonical renderer, input loop, presentation projection, viewport
mapping and lifecycle.

## Evidence for the taste delta

The existing levels share density `51 / 54 / 72 / 36 / 60`, objective volume
and broad action-effort bands, but their decision topology differs materially:

| Level | Original initial exposed / types | Twin initial exposed / types | Original / Twin max direct blockers |
| ---: | ---: | ---: | ---: |
| 6 | `8 / 1` | `6 / 4` | `6 / 9` |
| 7 | `7 / 3` | `5 / 3` | `7 / 12` |
| 8 | `8 / 2` | `10 / 6` | `8 / 8` |
| 9 | `7 / 3` | `2 / 2` | `5 / 4` |
| 10 | `7 / 3` | `6 / 4` | `8 / 18` |

The current Original board framing is near-square (`aspect ≈ 0.94`); the
capture/Twin coordinate system is vertical (`aspect = 0.45`). Their
silhouettes, reveal cadence and travel distances therefore differ even when
tile counts and total action effort match.

The existing SWIPE artifact also defaults to autoplay, while the Twin viewer
is manual. Future taste A/B must force identical manual input conditions.

## Follow-up: viewport is part of the taste authority

The first single-runtime calibration technically shared `main.ts`, but inserted
Twin data into the old Production Original `390×700` board frame. Operator
review rejected that result: the same Twin layout felt worse because tile
scale, vertical composition, hit area and board-to-tray travel were materially
reduced.

The canonical direction is therefore not “move Twin data into the old Original
renderer.” It is:

- retain the former Twin `720×1600` calibration composition;
- map normalized level geometry directly into that space;
- run both Twin and Original through the same large-tile renderer, input,
  presentation and lifecycle;
- treat viewport mapping, tile scale and travel distance as measured
  presentation authority, not incidental UI.

The earlier `390×700` single-runtime projection is rejected evidence and must
not be used for taste approval.

## Binding decisions

1. `triple-tile-v1` has one canonical runtime.
2. `Twin` and `Original` are injected datasets, not separate gameplay
   implementations.
3. Local calibration uses the same renderer, first-party SkinSpec, input,
   presentation clocks, viewport and terminal flow for both datasets.
   The current frozen calibration viewport is `720×1600` with direct normalized
   geometry. Visual tile scale is unchanged across host sizes; input may expand
   only the invisible hit rectangle to preserve at least `35 CSS px`.
4. Twin fixture data remains immutable, neutral and local-only. Mapping its
   type classes to a first-party calibration skin does not alter the fixture.
5. Release builds force Original and fail closed on any Twin selector,
   namespace, capture ID or fixture provenance.
6. The current Garden Curios five-level pack is retained as `Original R0`
   evidence, not as an accepted product baseline.
7. The current Twin experience is the active taste baseline until a
   same-runtime A/B receives explicit operator approval.
8. Aggregate effort parity is necessary but no longer sufficient.

## Required level-feel signature

Every replacement Original candidate must report, per level:

- silhouette and occupied bounds;
- initial exposed count and exposed-type entropy;
- exposed choice curve after every accepted action;
- forced/choice ratio;
- blocker fan-in/fan-out and unlock curve;
- pair/triple availability curve;
- tray occupancy and peak-pressure curve;
- target reveal/completion cadence;
- solver and observable-online action effort.

The originality gate continues to reject exact geometry/exposure copies.
Signature parity defines a taste band, not permission to copy a layout.

## Z3 acceptance

- [x] Twin and Original run through one canonical runtime.
- [x] Dataset switching is local-only and changes data, not presentation or
  lifecycle.
- [x] Manual same-runtime A/B is reproducible for Levels 6–10.
- [x] Original R1 candidates publish complete level-feel signatures.
- [x] Original R1 remains solver-valid and passes provenance/near-duplicate
  gates.
- [ ] Operator accepts Original R1 taste parity against Twin.
- [ ] Independent review re-checks containment and evidence after the operator
  taste disposition.

The R1 evidence is frozen in `triple-tile-v1-swipe/LEVEL-FEEL-Z3.json` on the
`codex/zen-reference-twin` playables branch. Against R0, every captured anchor
improves under the same versioned signature comparator:

| Anchor | R0 | R1 |
| ---: | ---: | ---: |
| 6 | `0.7598` | `0.8978` |
| 7 | `0.7869` | `0.8739` |
| 8 | `0.7614` | `0.9215` |
| 9 | `0.7792` | `0.8801` |
| 10 | `0.7715` | `0.8901` |

The v2 report does not use an ideal DFS path as a manual-feel proxy. Captured
primary tap traces are authoritative for Levels `6/7/10`; booster-contaminated
Levels `8/9` compare both datasets with the same deterministic, booster-free
observable policy. Solver paths remain separate solvability evidence.

These scores prove candidate selection and measurable recovery, not operator
taste acceptance. Production build validation checks every R1 level against
all five exact Twin fixtures, not only the corresponding anchor.

The checked infrastructure rows are implemented on the
`codex/zen-reference-twin` playables branch. From that worktree:

```bash
npm run preview:zen
```

- One-page review: `http://127.0.0.1:4174/calibration.html`
- Twin: `http://127.0.0.1:4174/?dataset=twin&level=6&auto=0`
- Original R1: `http://127.0.0.1:4174/?dataset=original&level=6&auto=0`

The one-page surface is a local-only control shell around one full-height game
iframe; it does not implement or duplicate gameplay. Use `T / O`, `6–0`, or
`Space` to switch. Direct URLs remain available for phone review. The launcher
re-verifies the immutable capture, binds only to loopback and refuses
production builds. The older standalone Twin viewer remains an evidence/debug
projection, not a competing product version.

## Cross-mechanic follow-up

The single-runtime/two-dataset rule is binding for Zen. It will be tested on
one other captured mechanic before being promoted from process default to a
universal platform invariant.
