# Zen Match Z3 completion audit

- Audit date: **31.07.2026**
- Playables branch: `codex/zen-reference-twin`
- Runtime/R1 evidence commits: `d8b78d0`, `bf0f56a`, `40cdfc0`
- Docs branch: `codex/zen-reference-twin-docs`
- Overall disposition: **technical objective implemented; operator taste gate
  pending**
- Merge and rollout: **not authorized**

This audit evaluates the full Z3 objective. A passing unit test is accepted as
evidence only where the test covers the named requirement; no technical row
is allowed to substitute for operator taste authority.

## Requirement-by-requirement evidence

| Requirement | Authoritative current evidence | Audit result |
| --- | --- | --- |
| Zen Match build `220000.1.755` Levels `6–10` is primary/taste authority | capture UUID and manifest digest remain frozen in Class Brief, Reference Packet, fixture provenance and verifier | **proved** |
| Former `4174` experience supplies the canonical presentation baseline | one runtime uses logical `720×1600`, direct normalized geometry, full vertical board→tray travel and responsive `≥35 CSS px` hit targets | **proved** |
| Twin and Original are datasets, not separate game versions | canonical `main.ts` imports one injected `active-series` boundary; local alias changes only series data; review shell contains exactly one game iframe | **proved** |
| Same renderer/input/presentation/viewport/terminal/lifecycle in A/B | static import-boundary test plus browser test of one full-height iframe and dataset/level switching | **proved** |
| Calibration is local-only | loopback host gate, build refusal under calibration flag, capture verification in launcher | **proved** |
| Production cannot contain Twin fixtures or selector | resolved-module/content deny, production Original forcing, production build scan and browser release test | **proved** |
| Exact Levels `6–10` Twin traces remain immutable | fixture digests, evidence-index bindings and deterministic replay for ordinary/special scenarios | **proved** |
| R0 remains reproducible but is not the active baseline | frozen R0 recipes/digests and explicit `taste parity failed` disposition; active exports point to R1 | **proved** |
| R1 uses independent production layouts/assets | five first-party branch-field profiles, production provenance and no Twin module import | **proved** |
| R1 is solver-valid without boosters | deterministic solver/checkpoint receipts for all five levels | **proved** |
| R1 preserves both objective models and residual goal wins | goal levels `6/7/8/10` and clear-all Level `9`; construction/autoplay residual assertion remains enforced | **proved** |
| R1 matches measurable level-feel without copying layouts | v2 report measures captured/observable-authority silhouette, opening, blockers, choice/unlock, availability, tray, cadence and effort; every R1 anchor beats R0 | **proved for candidate selection** |
| R1 passes near-duplicate containment | all 25 R1/reference comparisons score `0.227644…0.540676 < 0.88`; exact geometry/exposure always fails | **proved** |
| Local review is practical and unbiased by autoplay/viewport | `calibration.html` forces `auto=0`, keeps `720px`-high iframe and exposes only external dataset/level controls | **proved** |
| Operator accepts R1 taste parity | no post-R1 operator disposition exists | **missing — blocking authority** |
| Independent review covers final post-taste state | Z2 review predates Z3; process requires a new review after taste disposition | **pending after operator gate** |

## Verification receipts

Current playables evidence:

- `npm run test:triple-tile` → **42/42**;
- logic includes objective ordering, special Twin actions, R0 reproducibility,
  R1 signature regeneration, originality and residual-goal assertions;
- browser lifecycle includes production build/deny, manual/autoplay takeover,
  fail/retry, pause/resume, device layouts and exact-once completion;
- calibration browser test includes one iframe, full `720px` height,
  `Twin ↔ Original R1`, Levels `6–10` selector contract and forced manual mode;
- clean production build excludes `calibration.html`, `Original R1` selector
  strings and `dataset=twin`.

Current docs evidence:

- `docs-boundary-lint: clean`;
- docs-boundary tests: **2/2**;
- `git diff --check: clean`.

## Remaining decision

The implementation must not be declared accepted merely because R1 scores are
higher than R0. The next authoritative input is one of:

- `R1 taste accepted for Levels 6–10`;
- a per-level delta such as `Twin better on 6 and 9`;
- `R1 taste rejected` with the observed feel difference.

After a positive disposition, repeat independent containment/evidence review.
Merge to `master` and rollout remain separate explicit decisions.

`REFERENCE-DELTA` row `ZD-11` (validate the process on another mechanic) is a
separate cross-mechanic follow-up explicitly deferred by the operator; it does
not reopen this Zen implementation.
