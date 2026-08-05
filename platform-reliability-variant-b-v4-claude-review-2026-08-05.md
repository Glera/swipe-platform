# Independent Claude review — Variant B deploy slice v4

- Date: 05.08.2026.
- Reviewer: Claude Code Opus 5, fresh independent read-only sessions.
- Reviewed meta head:
  `dad0de345f334b3dfafda1120fe7f9d1adc50ada`.
- Reviewed route:
  `platform-reliability-variant-b-deploy-slice-v4-2026-08-05.md`.
- Route SHA-256:
  `4041942bac4fbb86d918dfa040732e3f6a588110fd3343bfcbb722e377de3a53`.
- Capture tool SHA-256:
  `dc8f1d46cda2f173df1cabb70457c099cf25da8d5aff847e144d6d523870a25f`.
- Executable backend authority:
  `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`.
- Review sessions:
  `95e86f0f-b983-4433-90bd-9889baf9de98`,
  `b6040dda-50a2-4aef-b25e-4f92a3f05637`, and final delta session
  `76c0b427-ed90-4b76-a6ed-c442ab58981d`.
- Mode: detached clean worktrees with read-only `Read`, `Grep` and `Glob`;
  no credential access, dispatch, merge, provider mutation, migration or
  production write.
- Verdict: **GO for merge scope only**. This is not Phase 2 authority.

The two SHA-256 values above were computed locally after the reviewed head was
checked out. Targeted tests passed 14/14, the full root `scripts/*.test.mjs`
suite passed, `docs-boundary-lint` was clean, `git diff --check` was clean, and
GitHub PR #65 CI was green on its first reviewed head. CI on the final receipt
head remains the merge gate.

## Findings and disposition

The first full pass found no P1 and returned GO for the inert merge scope. It
identified five P2 conditions for the future production window:

1. The route still described the already-contained credential as present.
   The route now starts from the independently observed post-containment state:
   zero old Render keys and no `RENDER_API_KEY` secret, then creates exactly one
   temporary window key under a separate double GO.
2. Non-sync capture failures lacked complete STOP dispositions. Section 9 now
   classifies pre-window, Capture A and Capture B read failures, configuration
   drift, new/latest deploy mismatch, prepared projection mismatch, equality
   failure and forbidden rollback-key presence. Every branch stops before the
   next mutation and preserves evidence.
3. `preDeployCommand` was read from only one provider nesting. The capture now
   accepts either documented/provider nesting, rejects disagreement, and tests
   both the accepted and inconsistent paths with exact error codes.
4. Pre-window capture did not prove the source-backed starting state. It now
   requires `runtime=docker` and `imagePath=null` before any GitHub or Render
   mutation; both failure paths are exercised by exact-code tests.
5. The still-live Blueprint Sync Hook was absent from the threat model. The
   route now names it as an external credential, forbids its use, and records
   the residual sampled-observation gap between Capture B and the Phase 3 POST.

The delta pass found one remaining P2: latest-deploy/new-deploy mismatch was
classified for Capture A but not Capture B, and other non-sync A/B failures
had no catch-all. Exact head `dad0de3` widens the row to A or B and adds a
strict STOP catch-all. The final delta review returned **GO** and confirmed
that the new rows do not weaken any specific disposition or the independent
`§7 exact projection PASS` gate.

## Accepted non-blocking limits

- The provider capture is intentionally fail-closed. Alternate singleton
  response wrapping or inconsistent duplicate runtime fields can produce a
  false STOP, never a false PASS.
- Parser guards are directly readable but not every negative CLI combination
  has its own test. The high-consequence prepared-state, source-state,
  credential-value non-emission, pagination, preview-transition and equality
  branches are covered.
- The official Blueprint sync endpoint is the executable evidence source, but
  provider completeness for every unapproved preview remains a documented
  residual uncertainty. The route never treats absence of a known preview as
  proof that the preview was discarded.
- The literal commands assume `RENDER_API_KEY` is already present in a
  non-emitting environment and output paths are fresh. A local invocation
  mistake fails before provider mutation.

## Review boundary

This GO covers merging the reviewed route, GET-only capture tool, tests and
this add-only receipt. It grants no key creation, GitHub secret/variable write,
workflow dispatch, Render service mutation, deploy, migration or roster
activation. Any executable change, immutable-pin change, dispatch-input change
or failure-semantics change requires fresh independent review. Phase 2 still
requires the route's separate double-GO boundaries.
