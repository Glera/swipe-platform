# Independent review request — R1-A production baseline ref and publication plan

Act as an independent read-only reviewer. Do not edit files, push, open PRs,
dispatch workflows, write packages, create GitHub environments, merge, deploy,
or mutate any provider.

## Code boundary

- repository/worktree:
  `/private/tmp/p4g-r1a-production-baseline.1ScRrL`
- exact accepted base:
  `a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`
- final production baseline head:
  `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3`
- old proven baseline range:
  `9277047852c0d73f4d3b9a081e1b0b586f48ae3c..8cb8239e04bf30f54f7fe1f85758da8f4fe7caac`
- production candidate head:
  `11c9bce9891ae5b041215056ac4521551a056cb5`

Verify that:

1. `git range-diff` pairs all 17 replayed baseline commits as content-identical
   and the only post-replay commits are the already accepted `app/models.py`
   Mission policy reanchor, a fail-closed baseline-only cutover-workflow
   refusal, and removal of two candidate-only 0071 acceptance gates from the
   0070 baseline;
2. the proposed baseline is based on the exact accepted Stage 0 master and has
   exactly one Alembic head, `0070_published_test_delivery`, with no 0071;
3. its full non-sentinel image workflow can publish a `bootstrap-root`
   baseline but never deploys; its cutover workflow is an inert refusal with no
   GitHub environment, Render secret, coordinator invocation or package write;
4. it contains no Stage 1 implementation and does not weaken island protective
   contours or Mission architecture enforcement;
5. the 36/36 local test/guard result covers the exact baseline workflow's
   declared local test set; identify any missing P1/P2 acceptance needed before
   a push/PR.

## Plan boundary

Read
`/private/tmp/p4g-r1a-meta.YPUxDz/platform-reliability-r1a-production-image-publication-plan-20260802.md`.
The bounded command outputs and construction proof are recorded in
`/private/tmp/p4g-r1a-meta.YPUxDz/platform-reliability-r1a-production-baseline-review-evidence-20260802.md`;
cross-check them against the relevant workflow/tests, but do not rerun the
suite in this focused review.
Cross-check both input tables against the workflow and manifest semantics,
including schema ranges, bootstrap vs image LKG, exact cross-repository SHAs,
no-repeat behavior, package inventory preflight and authority split. Treat any
input that could produce a non-rollback-capable pair, pin a rehearsal image,
or allow merge/deploy as P1.

Required result: start with `GO` if there are no P1/P2 findings. Otherwise
start with the highest-severity finding. Cite exact `file:line` or plan section
and give the concrete correction. State the reviewed base/head and whether the
baseline is safe to push into a draft PR for exact-head CI. Pending CI is a
gate, not automatically a code finding.
