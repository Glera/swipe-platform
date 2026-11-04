## ISSUE #151 ROW 4 MACHINE-RELATIVE RELEASE ATTRIBUTION — HANDOFF_READY

This is the single frontier recovery for durable Mac B STOP comment
`5435187447`. The stopped job preserved its local-only row-4 delta and did not
start row 5, commit, push, create a PR, mutate a request/release or touch
runtime/product state.

Independent exact-master attribution on Mac A used a disposable clean worktree
at Playables `937e788a026015b2a8f603b439a88d993cddcf56`, exact lockfile `npm ci`,
and exactly one `npm run release smash-fest-v1`. It passed 10/10 gates,
including all 39 production-bundle runtime smoke checks. This proves master is
not globally broken, but it does not distinguish Mac B environmental timing
from the row-4 delta.

Authorized Mac B continuation:

1. Preserve the existing local row-4 authoring delta byte-exact. Do not edit,
   recreate or rerun its failed release gate.
2. In one disposable clean worktree at exact unchanged Playables master
   `937e788a026015b2a8f603b439a88d993cddcf56`, install the exact lockfile and
   run exactly one baseline `npm run release smash-fest-v1` on the same Mac B.
3. If and only if the clean Mac B baseline reproduces the same two failure
   classes — market-return re-tap surface/open failure and premium CPU×1 FPS
   below floor — with no package-specific test failure or additional release
   failure, classify those two names as a one-time machine-relative baseline
   for this exact delta. Do not turn the names into a standing allowlist.
4. Under that exact classification, continue the preserved delta through one
   normal Tier-1 ladder: one blind discovery, one common P1/P2 correction if
   needed, one correction-only delta verification, then PR/native CI/merge
   only on PASS. All row-4 model/physics/presentation and Swipe runtime tests
   must remain green; official repository CI must be fully green.
5. If the clean baseline passes, differs in failure class, adds any failure,
   the preserved delta is missing/drifted, review yields a new P1/P2 after its
   single correction, or native CI fails, STOP without another run.
6. Only after row 4 is merged and master CI is terminal green, begin row 5
   under the original bounded contract. Return one causal exact-master handoff
   for both rows to Mac A.

No request/release reset, retry or recreation; no second baseline/release run;
no Approve/Reject, adoption, restart, publication, promotion, public rollout,
backend, Feed, live DB, credential, setting, permission, infrastructure or
product/taste act is authorized.
