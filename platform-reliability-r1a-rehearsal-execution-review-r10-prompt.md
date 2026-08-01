# Independent R1-A disposable rehearsal execution review R10

Read-only pre-execution review. Do not edit, write, push, dispatch, publish,
create resources, or touch provider state.

Review exact local documents:

- `/private/tmp/p4g-r1a-meta.YPUxDz/platform-reliability-r1a-disposable-rehearsal-runbook.md`;
- `/private/tmp/p4g-r1a-meta.YPUxDz/platform-reliability-r1a-rehearsal-evidence-packet-20260801.md`;
- `/private/tmp/p4g-r1a-meta.YPUxDz/platform-reliability-r1a-rehearsal-cost-preflight-20260801.md`.

Review executable candidate:

- `/private/tmp/p4g-r1a-r3-backend-fixes/.github/workflows/platform-release-image.yml`;
- `/private/tmp/p4g-r1a-r3-backend-fixes/.github/workflows/platform-release-cutover.yml`;
- `/private/tmp/p4g-r1a-r3-backend-fixes/scripts/platform-release-coordinator.py`;
- `/private/tmp/p4g-r1a-r3-backend-fixes/app/platform_release.py`.

Exact candidate SHA is
`d0a9fa11cd88e3ae4202f7cafa631a319b622492`. Review only; this grants no
authority.

A fresh audit found and corrected one issue: exact replay and
`deploy_identity_conflict` are now Render one-off jobs, not coordinator
workflow runs. Render one-off jobs snapshot the base service build and env, so
the conflict proof temporarily replaces only
`PLATFORM_RELEASE_MANIFEST_B64` and
`PLATFORM_RELEASE_MANIFEST_SHA256` while Auto Deploy is Off, creates the job,
immediately restores the values, then proves env/deploy/DB equality.

Return `GO` first only if the attended contract is executable and fail-closed
enough to request operator authority for the <=USD 3 disposable rehearsal.
Otherwise return `NO-GO` with all P1/P2 findings and exact file:line
references. List P3 separately. Specifically check:

1. workflow input names and execution semantics match runbook/evidence;
2. exact replay can prove identical receipt bytes/SHA under the same deploy
   identity;
3. conflict proof reaches `deploy_identity_conflict` rather than an earlier
   identity error and restores provider state;
4. stale CAS, rollback, health, DB revision and cleanup receipts are
   sufficient;
5. no step can mutate known production IDs or silently exceed authority/cost;
6. any unexecutable claim or missing provider fact that should be resolved
   before paid creation.
