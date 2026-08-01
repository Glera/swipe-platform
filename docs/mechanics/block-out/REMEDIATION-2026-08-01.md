# Block Out v3.1 remediation — 01.08.2026

- Trigger: [`FIELD-PLAY-REJECTION-2026-08-01.md`](FIELD-PLAY-REJECTION-2026-08-01.md)
- Process: `reference-replication.v3.1`
- Reference: Falcon/CYLINDER Android `1.0.177+177`
- Status: machine quorum pass; final full field play pending
- Implementation commit: `534955d6fb37394ab995b207b65d9b95ff94d4ce`
- Machine-receipt commit: `c987b4d`
- Production HTML SHA-256: `c51bcaf7ba973943ffc5a2ebdca5538c3c76bab71de5cc7c389ddf19fdd0ba5d`
- Review4 receipt SHA-256: `d2caaf6eb6f5482ea96e5a59370e8300ea6af08d076e0d5b2f7ff67da86ad5f7`

## Red-before-green reproduction

Before implementation changes, new tests reproduced five distinct failures:

| Failure | Red proof |
| --- | --- |
| rear block exits through a figure at the gate mouth | `BO-FX-GATE-THROAT-BLOCKED` returned a gate at contact |
| corridor cannot be reversed | reverse target stopped one cell away |
| foreign-role exit is not fail-closed at the engine boundary | only generic reachability rejection existed |
| wrong visible gate colour | Level 5 contained two pairs of exactly overlapping apertures |
| consume body shrinks | presentation samples returned `1.035 → 0.855` scale |

The old browser pickup check was also invalid: it treated the raster change
caused by immediate pointerdown exit as proof of pickup response.

## Runtime corrections

- Gate capture now requires a collision-free axial sweep from capture pose
  through the complete gate throat. Boundary contact remains legal, but a live
  figure touching the leading face blocks takeover.
- `pointerdown` and `pointerup` cannot synthesize exit. Only an outward
  continuous pointermove through a compatible clear gate can capture.
- Engine exit rejects block/gate role mismatch explicitly. Level validation
  rejects positive-span gate overlap; the ambiguous Level 5 gold/mint gates
  were moved to distinct apertures and the level hash/witness regenerated.
- Collision response evaluates both axis projection orders and selects the
  pose closest to the pointer. Forward/reverse traces are invariant for
  `1/2/8` event segmentations.
- Carried scale is exactly `1`; highlight is drawn inside the collision
  silhouette.
- Consume body scale/opacity stay intact through pull. An axis-aligned Canvas
  clip at the gate plane progressively hides the body; this is a scissor-like
  draw operation, not a bitmap/resource mask or offscreen buffer. Fragments
  reveal only at/outside the same plane, and gate art is the final foreground
  pass.

## Acceptance-surface quorum

| Scenario | Model | Real browser input | Raw clean raster |
| --- | --- | --- | --- |
| static pickup/tap | pass | tap preserves digest; pickup changes next rAF | carried silhouette does not grow |
| blocked throat | pass | rear coral remains live at contact | stable block remains rendered |
| foreign-role gate | explicit role reject + no overlapping apertures | violet pushed into coral gate remains live | gate role/read is unambiguous |
| reverse corridor/contact | pass for `1/2/8` segmentation | forward then reverse restores anchor | carried silhouette stays within collision bounds |
| consume | scale/boundary cadence pass | actual outward drag starts one exit | gate foreground `0 px` overwrite at five time samples; pre-fragment outside-body leak `0 px` |

Diagnostic occupancy remains supplemental; it is not used as the sole verdict.

## Automated results

- Block Out model/fidelity/reference/originality: `41/41` pass after binding
  the immutable machine receipt (`40/40` on the candidate implementation
  before the receipt assertion was added).
- Review4 production bundle: all positive and negative pointer/raster assertions
  pass; raw samples cover approximately `60/120/250/380/515 ms`.
- Platform runtime: `39 pass`, `1` expected production-debug warning, `0 fail`.
- Five levels remain solver-valid and below the frozen near-duplicate threshold.

## Open gate

Machine evidence does not restore the historical acceptance. The remaining
gate is one full operator field play covering ordinary carry/collision plus the
four reported failures and the complete gate-consume feel. Only that session
may change the receipt from `rejected-after-field-play` to accepted.
