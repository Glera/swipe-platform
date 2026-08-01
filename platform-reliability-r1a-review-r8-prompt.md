# Independent R1-A rehearsal closure review R8

Read-only adversarial review. Do not edit, push, create/merge PRs, dispatch
workflows, publish images or touch provider state. Return GO first only if the
local package is safe to advance to the explicitly gated operator actions;
otherwise NO-GO with every P1/P2 and exact file/line. P3 separately.

Exact local package:

- meta 0f6bf75 in /private/tmp/p4g-r1a-meta.YPUxDz;
- sentinel 5ef857f in /private/tmp/p4g-r1a-workflow-registration;
- candidate c7c62ad in /private/tmp/p4g-r1a-r3-backend-fixes;
- baseline 1aee3e0 in /private/tmp/p4g-r1a-rehearsal-baseline;
- client e804c73 in /private/tmp/p4g-r1a-r3-client-fixes.

Read R7 raw/disposition, the complete corrected runbook/Blueprint and packet
§§10,17,18. Recheck all five R7 blockers and relevant P3 closures.

Important authority distinction: GitHub Pro and new remote refs are
deliberately not active yet. Do not call their absence a blocker to a local GO
if the contract now fails closed until Pro capability is proven and enumerates
safe immutable publication under new refs. A GO authorizes only those next
operator/publication prerequisites, not sentinel merge, paid Render resources,
workflow dispatch, image publication, rehearsal or production.

Specifically challenge:

1. whether private GitHub environment authority stays impossible to bypass;
2. whether new ref names are consistent across source table, Blueprint,
   environment restriction and every workflow dispatch, while old reviewed
   refs remain durable;
3. whether the exact meta/frozen-branch/custom-path Blueprint triple and
   mutation-free validation eliminate accidental production render.yaml use;
4. whether the shared GHCR package scope, exact two retained versions,
   read:packages-only pull credential and cleanup/retention language are
   coherent with later exact-digest production cutover;
5. whether a fresh single-use production capture truly gates the sentinel
   master merge as well as PR 33;
6. workflow registration/ref semantics probe, release no-rerun exception,
   pre/post-image provider evidence, health evidence and complete cleanup;
7. any remaining hidden production mutation, unavailable Render capability,
   ambiguous credential or non-executable step.

R5 implementation GO remains separate. Stage 1 is out of scope and must remain
untouched.
