# Block Out v1 — Falcon Reference Twin

- Process: `reference-replication.v3.1`
- Status: **dual-surface machine pass; final operator field play pending**
- Primary source: Falcon/CYLINDER Android `1.0.177+177`
- Playables clean-pair candidate commit: `ecd22889c7b2dad837e319aa01af91a6a08fe776`
- Calibration binding commit: `6c4f06b0c3766843a8c13c51760a0698e7e57dbd`
- Native scenarios: `BO-FC-GS-01-L2-GATE`,
  `BO-FC-GS-02-L2-HOLD-GATE`

## Dataset boundary

The internal dataset `block-out-v1/twin/FALCON-L2.v1.json` reproduces the
captured Level 2 equality classes, four 2×2 footprints, gate roles and initial
layout. It injects through `src/reference-twin.ts` into the canonical Block Out
rules, engine, validator and presentation sampler. Production Original keeps
its own layouts, roles, palette and UI.

The Twin has a separate executable review-only build selected by compile-time
module resolution. It is not imported by the production entry graph. An executable deny
test scans both AppLovin and SWIPE bundles for the Twin ID, Falcon package ID,
scenario ID and capture provenance. All forbidden tokens are absent after the
final rebuild.

The review HTML SHA-256 is
`2d5590ef8f88a4000b4d3f69100281811705b48ae161e0e436a4945b4422c6b2`.
It is regenerated locally and excluded from git; it cannot replace `dist/` or
`dist-swipe/`.

## Deterministic receipt

- exact Twin layout validates under the canonical runtime digest;
- matched top-gate micro-scenario replays byte-equivalent;
- exactly one logical exit is committed;
- the full exact four-action board completes through real pointer events with
  model/browser digest equality after every action;
- static tap preserves the Twin digest;
- five raw consume samples report `0 px` gate-foreground overwrite and `0 px`
  intact-body leak outside the gate plane;
- a fresh clean Falcon→current-Twin pair binds native video `3cb021d2…`,
  candidate video `34b7c151…`, contact sheet `93b3bf13…` and receipt
  `f57038ab…`; candidate raster invariants are recorded separately;
- shipping presentation profile is inside the Falcon contract bands;
- Production Original browser receipt records `manualInputBlocked=false`,
  stable host-pause digest and `0` page errors;
- pickup raster changes on the first rAF (`18,203` sampled pixels);
- browser cadence: median/p95 `16.7/16.7 ms`, `0/497` frames above
  `50 ms`.

The historical rendered Twin artifact remains outside git. Its `twin.webm`
SHA-256 is
`ee38f9d7b0f0a3b285ab6aabd84c6d5aeef0b17b9b3fc8ca462cc6497ad7a52a`.

## Review surface

All v3 choice receipts below are historical and remain immutable, but the
01.08.2026 field-play rejection classifies their acceptance disposition as
`superseded-false-positive`. They are diagnostic evidence only. The current
gate is a full live play of the new executable Twin followed by Production
Original; its machine calibration receipt SHA-256 is
`73b2925ec6acd25af1e7aa3b00d410fbb7ecffc288cf103ed7565c426cf9315a`.

Round 1 contained two short sessions, each with one unique comparison and one
hidden repeat:

1. Reference→Twin used blurred edge/silhouette channels aligned to gate
   takeover. That surface was later superseded because static identity remained.
2. Twin→Production Original uses full own-identity clips aligned to consume
   onset. It asks forced preference or `no meaningful difference`.

Correction 1 asked only the first identification question again, using guarded
motion-energy channels. Source labels stayed hidden until the immutable choice
receipt was exported. The exact operator packet is
[`FINAL-REVIEW-PACKET-2026-07-31.md`](FINAL-REVIEW-PACKET-2026-07-31.md).

Round 1 preserved Twin→Original feel (`same / same`) but identified Reference
`2/2`. The bounded fragment-propagation correction and identity-suppressed
motion-energy repeat are recorded in
[`CORRECTION-1-2026-07-31.md`](CORRECTION-1-2026-07-31.md).

Correction 1 also identified Reference `2/2` after the hidden mapping reversal.
Diagnosis showed that surface still mixed non-causal capture deltas into the
question. Evidence correction 2 removes the late burst and non-native gate
glow, progressively emits gate-facing fragments, and compares only causal
background-subtracted occupancy aligned by gate center and width. Its final
receipt returns repeat-consistent `same / same` and `parity-supported`; see
[`EVIDENCE-CORRECTION-2-2026-07-31.md`](EVIDENCE-CORRECTION-2-2026-07-31.md).
