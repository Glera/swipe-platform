# Independent R1-A rehearsal delta review R7

Act as a read-only, adversarial release reviewer. Do not edit files, create
resources, dispatch workflows, publish images, push branches, open/merge PRs or
mutate GitHub/Render. You may run local read-only commands and consult current
primary GitHub/Render documentation.

Return `GO` as the first word only if no P1/P2 remains. Otherwise return
`NO-GO` first. List every P1/P2 with exact file/line or workflow field and a
concrete failure mode. Put non-blocking observations under P3. A GO authorizes
only asking the operator for action-time approval; it grants no external or
production authority.

## Exact package

- meta evidence/runbook: `p4g-workspace-meta@aea206b` in
  `/private/tmp/p4g-r1a-meta.YPUxDz`;
- registration sentinel: `swipe-backend@5ef857f` in
  `/private/tmp/p4g-r1a-workflow-registration`;
- rebased candidate backend: `swipe-backend@c7c62ad` in
  `/private/tmp/p4g-r1a-r3-backend-fixes`;
- rebased predecessor backend: `swipe-backend@1aee3e0` in
  `/private/tmp/p4g-r1a-rehearsal-baseline`;
- rebased client guard: `feed-prototype@e804c73` in
  `/private/tmp/p4g-r1a-r3-client-fixes`.

Historical implementation review R5 is GO with no P1/P2. R6 rejected the
first rehearsal draft. Read:

- `platform-reliability-r1a-review-r5-{raw,disposition}.md`;
- `platform-reliability-r1a-review-r6-{raw,disposition}.md`;
- `platform-reliability-r1a-disposable-rehearsal-runbook.md`;
- `render.r1a-rehearsal.yaml`;
- `platform-reliability-r1a-implementation-review-packet.md`.

## Required checks

1. Reproduce the three `git range-diff` comparisons in §17 and confirm every
   patch is identical after the later backend/client master advances. Check
   that Stage 0 is preserved and Stage 1 branches/code remain outside R1-A.
2. Compare both sentinel workflow names and complete `workflow_dispatch.input`
   schemas with the full workflows at `c7c62ad`. Prove the default versions
   have no checkout, secrets, environment, package/provider write authority or
   executable path other than unconditional refusal. Challenge whether this
   actually resolves GitHub's default-branch registration requirement while
   selecting the full workflow from an exact non-default `--ref`.
3. Review the corrected runbook against every retained R6 P1/P2 and against
   the full implementation contracts. In particular verify all baseline and
   candidate dispatch inputs, the no-repeat rule, exact container SHA proof,
   LKG linkage, provider-CAS sequencing, replay/conflict evidence and
   forward-only rollback.
4. Parse/review the disposable Blueprint against current Render constraints.
   It intentionally creates a new temporary Render workspace containing exact
   production-named resources so the fail-closed reviewed capture can run
   without accepting production IDs. Challenge the isolation proof, resource
   identities, plans, Auto Sync/Deploy gates, cron source-build proof,
   temporary registry credential/API key/GitHub environment and complete
   cleanup contract.
5. Reconcile `scripts/platform-release-provider-capture.py`, the live
   pre-switch evidence, coordinator receipts and the post-image service
   snapshot. No Git-backed branch/Dockerfile capture may be required after the
   switch.
6. Look for any path that touches production, mutates external state before
   explicit operator confirmation, requires a capability unavailable on the
   selected Render plans, cannot execute on GitHub as written, or makes the
   evidence non-replayable/ambiguous.

Primary contracts if browsing is useful:

- GitHub manual workflow dispatch:
  https://docs.github.com/actions/managing-workflow-runs/manually-running-a-workflow
- GitHub workflow version/ref semantics:
  https://docs.github.com/en/actions/concepts/workflows-and-actions/workflows
- Render Blueprint specification: https://render.com/docs/blueprint-spec
- Render free limitations: https://render.com/docs/free
- Render deploy/preDeploy: https://render.com/docs/deploys
- Render retrieve-service fields:
  https://api-docs.render.com/reference/service-fields
