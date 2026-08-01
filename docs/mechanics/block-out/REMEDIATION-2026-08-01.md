# Block Out v3.1 remediation — 01.08.2026

- Trigger: [`FIELD-PLAY-REJECTION-2026-08-01.md`](FIELD-PLAY-REJECTION-2026-08-01.md)
- Process: `reference-replication.v3.1`
- Reference: Falcon/CYLINDER Android `1.0.177+177`
- Status: dual-surface machine quorum pass; final Twin + Original field play pending
- Implementation commit: `534955d6fb37394ab995b207b65d9b95ff94d4ce`
- Machine-receipt commit: `c987b4d`
- Dual-surface implementation commit: `9259e28477a1085864d64b67cba524fb8649b67a`
- Calibration-receipt commit: `d1d623d`
- Production HTML SHA-256: `2820bfb0459011c34357469ab8271fc125936cb15ea7a98ea8a703314a43de54`
- Reference Twin review HTML SHA-256: `cb512789b9c8f8abc56bedd5932f8644074177afa2f8132cda9ceecce9f75fe4`
- Review4 receipt SHA-256: `5746632fd65085a0046ffce805c25b2f7dfb6db0757a6440b7b14e71e5e99ab2`
- Twin/Original calibration receipt SHA-256: `b40801383e3db4aaae7a41d8992669c5c13939a005be1743c7b39672fbc7e4d0`

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

- Block Out model/fidelity/reference/originality: `45/45` pass.
- Review4 production bundle: all positive and negative pointer/raster assertions
  pass; raw samples cover approximately `60/120/250/380/515 ms`.
- Platform runtime: `39 pass`, `1` expected production-debug warning, `0 fail`.
- Reference Twin is now an executable review-only build, completes its exact
  four-action board by real pointer delivery, and retains `0 px` foreground
  overwrite / outside-body leak at the five raw samples. Both production
  bundles remain byte-clean of Twin/reference identifiers.
- All five Original levels remain solver-valid, below the frozen near-duplicate
  threshold and complete by real pointer replay with trace lengths
  `8/9/10/11/11`. Every stable browser digest equals the model digest.

## Second acceptance correction: dataset-to-browser proof

The first v3.1 remediation still had two process gaps: the Twin existed only as
an imported test dataset, and Original browser evidence completed only one
level while the other four were model-only. A broad autoplay check then exposed
that the demo planner handled direct exits but not arbitrary turning paths.

Acceptance no longer uses autoplay completion as a proxy. Review4 computes a
connected model path for each witness action, delivers that path through real
pointer events and checks the browser digest after every action. The same
harness runs the exact Twin and every Original level. Grab points are sampled
inside an occupied cell, not from a concave bounding-box centre.

## Open gate

Machine evidence does not restore the historical acceptance. The remaining
gate is one full operator field play of both executable surfaces: Reference
Twin first, then Production Original. It covers ordinary carry/collision, the
four reported failures and the complete gate-consume feel. Only that session
may change the receipt from `rejected-after-field-play` to accepted.
