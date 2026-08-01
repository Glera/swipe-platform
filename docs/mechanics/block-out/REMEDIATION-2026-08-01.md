# Block Out v3.1 remediation — 01.08.2026

- Trigger: [`FIELD-PLAY-REJECTION-2026-08-01.md`](FIELD-PLAY-REJECTION-2026-08-01.md)
- Process: `reference-replication.v3.1`
- Reference: Falcon/CYLINDER Android `1.0.177+177`
- Status: dual-surface machine quorum pass; final Twin + Original field play pending
- Final runtime implementation commit: `a3efaa71c5c9daef8f7be4ccdcc726e374762a47`
- Clean-pair capture/tooling candidate commit: `bfdb351f83ebe3c11c5ab98f1666cb79f31b867f`
- Final calibration-binding commit: `726d955d98a3dd1f07600ac67415d12229d1a205`
- Production HTML SHA-256: `f634fe3a6b49823a574d119052adc8956447e0d7394c2522501a1ae821c59fa6`
- Reference Twin review HTML SHA-256: `721791fb404a86cea472bb322c1d058f1053a1b4ddb80b996f151369b6fafc20`
- Review4 receipt SHA-256: `46343b1c40d43095a2108e0c18845877f230b0e0b7fe51c45213f739eac5ce7f`
- Fresh clean-pair receipt SHA-256: `f8a91d39531b5c11b9bf4d1c407032572befd34b2a8c748bee8f155808b9381f`
- Twin/Original calibration receipt SHA-256: `258b44cd2032a3b8acba7b9fee7ed794e344018b82c80b5d5e4b923f60093c65`

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
- Carried scale is exactly `1`; a cheap layered white silhouette is drawn
  outside the role-colour body without changing collision geometry. It remains
  constant through a stationary hold and uses no live `shadowBlur`.
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

## Fourth acceptance correction: temporal input and trajectory invariants

The subsequent field play exposed checks that were still point-sampled rather
than causal: the outline was only checked on the first rAF, gate capture was
tested only as eventual exit, the centre corridor used ideal model input, and
performance came from autoplay. A connected-component measurement also merged
the touching gate and body and falsely implied a lateral centring snap.

The corrected authority is:

- carried outline sampled at `50/450 ms` with no pointermove; white occupancy
  persists while role-colour bounds remain byte-equivalent;
- compatible offset gate captures before pointerup when the body centre enters
  the in-board suction aperture, while pre-takeover out-of-board traversal
  still requires the full footprint;
- consume preserves the captured cross-axis coordinate and moves strictly
  axially; raw measurement uses per-pixel inward centroid, never a merged bbox;
- the exact Level 2 corridor receives a five-sample `±0.35–0.46 cell` noisy
  browser trace and its expected stable anchor is asserted;
- active-input frame and pointer→rAF metrics are collected in an isolated
  window that excludes screenshots, raster reads and restarts;
- Review4 surface and autoplay run in independent browser processes and bind
  one aggregate receipt, so accumulated browser state cannot erase evidence.
- Stable scenes are invalidation-driven rather than repainted on every rAF;
  drag, snap, gate consume and celebration remain frame-driven. The production
  runtime benchmark improved from `28 fps` fail to `59 fps` pass without
  lowering any threshold.

This correction also found a rules boundary: the sticky centre criterion is
valid only for in-board takeover. Before takeover, crossing the board boundary
requires full footprint containment in the aperture. The packaged autoplay
witness is verified independently from the solver's arbitrary equal-cost
tie-break order.

## Third acceptance correction: fresh Reference↔Twin raw pair

The first dual-surface quorum still overloaded `raw clean raster`: its samples
proved candidate occlusion and leak invariants, but did not recapture the
corrected Twin next to Falcon. The historical causal pair belonged to the
field-rejected implementation and could not be promoted again.

`block-out-reference-clean-pair.mjs` now records the exact red-top Level 2
micro-scenario through a continuous real pointer gesture. It binds the native
clean source, current Twin video, candidate commit, trace/digests and seven
event-relative unmodified keyframes. The current source video hashes are
`3cb021d2…` (Falcon) and `40195f43…` (Twin); contact sheet `c98fc325…` and
receipt `f8a91d39…`. Candidate-only Canvas assertions remain a separate
surface, and normalized occupancy remains supplemental-only.

The first fresh pair was still not a semantic pass. It reused the instrumented
takeover PTS `2.778 s` for the clean recording, whose direct takeover bracket
is `(2.297300, 2.314733] s`. Correct independent alignment exposed an overly
fast cubic body collapse and particle area only `0.437×` Falcon. The final
candidate replaces the body curve with the measured mild ease and calibrates
emission density, depth and sparse late survivors from raw clean frames.

The current receipt now fail-closes on 19 class-specific checks rather than
merely attaching a contact sheet: body correlation `0.9983` / NRMSE `0.0340`,
particle correlation `0.9819` / NRMSE `0.1018`, total area ratio `1.0018`,
tail ratio `1.1606`, centroid-depth RMSE `0.0079`, component count/size ratios
inside frozen bands, and post-takeover cross-axis drift `0` versus native
`0.0054` gate widths. Clean and instrumented offsets are stored separately.

Candidate samples are selected from the nearest rendered rAF on both sides of
each target, with a fail-closed sampling-error bound. This replaced the old
"first frame after target" rule, which could label a `266 ms` frame as
`250 ms` and flip a frozen particle-area check without any runtime change.

## Automated results

- Block Out model/fidelity/reference/originality: `49/49` pass.
- Review4 production bundle: all positive and negative pointer/raster assertions
  pass; raw samples cover approximately `60/120/250/380/515 ms`.
- Platform runtime: `39 pass`, `1` expected production-debug warning, `0 fail`.
- Active manual drag: p95 `16.7 ms`, `0` frames over `50 ms`; held outline
  occupancy is identical at `50/450 ms` (`8361 px`).
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
