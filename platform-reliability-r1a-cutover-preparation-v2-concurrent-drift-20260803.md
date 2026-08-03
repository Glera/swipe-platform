# Platform Reliability R1-A — contained concurrent drift during pre-cutover v2

Observed: 2026-08-03 UTC.

Status: **FAIL CONTAINED; TEMPORARY AUTHORITIES REMOVED; CUTOVER NOT STARTED**.

The operator authorized pre-cutover preparation for exact meta packet
`f40e52665981b6b5bdde900158e5aa03acdd6221`. The initial action-time preflight
passed at `14:29:05Z` against backend `master`
`7b41e96ad0d979863159ebdd356122af6295a203`. The reviewed production capture
then passed, and the single authorized Render job returned exactly
`0070_published_test_delivery (head)`.

While that attended window was running, backend authority changed outside this
window:

- Stage 1 PR [#41](https://github.com/Glera/swipe-backend/pull/41), exact head
  `2029867495578310dda92c170a2e07c71203eefa`, merged at
  `2026-08-03T14:35:15Z` as `cd7c66564e92e9d54846e77954c7c49360d1d18a`;
- `feat: add Minesweeper series policy` was then committed directly to master
  at `14:38:38Z` as
  `47a0a0a6b4841212c44382c73dbeb0b26037e850`.

The GitHub `production` environment was verified at `14:41:59Z`, after those
concurrent changes. Its mandatory read-after-write CAS detected that master no
longer equalled the packet. Execution stopped before any merge, workflow
dispatch, persistent Render service mutation or deploy.

## Evidence before the stop

- canonical provider capture at `14:33:44Z`, SHA-256
  `8c62d398f4800a6787d7358cde4a9f011f79c536fcbf965bad986423f7dbb4c3`:
  Blueprint Auto Sync and all three Auto Deploy controls were off;
- exact provider/database inventory at `14:37:15Z`, SHA-256
  `9c62c61f32e6f698da03bda406aff80ba5877d2c965267852f4d1f28508f2129`:
  no active deploy/job, PostgreSQL 16 available, and the three latest deploy
  IDs matched the packet;
- the sole web-service job was
  `job-d9oaeur7uimc738u0vdg`, command `alembic current`, succeeded with the
  exact `0070_published_test_delivery (head)` output;
- the environment readback, SHA-256
  `05c93b51a7cd922062db3e140d724dc35bf92a2af0367c92ca953d89eac0fd05`,
  contained exactly the candidate-v2 branch policy, one secret name and six
  declared variables; repository-level `RENDER_*` authority stayed absent;
- a second provider capture at `14:43:17Z` and inventory at `14:44:07Z`
  proved Auto Sync/Deploy still off, no active deploy or job, unchanged live
  deploy IDs and exactly the one authorized revision-job delta;
- authenticated GitHub package readback still resolved candidate version
  `1093812331` and baseline version `1092313648` to their accepted OCI
  digests. There was still exactly one candidate image publication and zero
  candidate cutover workflow runs.

## Containment

The exact failure cleanup from the operator authority completed:

- only the `production` environment created by this window was deleted; its
  GET now returns 404;
- only temporary Render key `r1a-precutover-v2-20260803` was revoked; the key
  returns 401, the UI reports no provisioned API keys, and the mode-0600 local
  handoff was removed;
- the durable GHCR registry credential and all Render services were preserved;
- PR #51 remains draft, open and unmerged at exact head `4714e339...`;
- no cutover workflow dispatch, persistent service/source/image/environment
  mutation, deploy, migration or image publication was performed by this
  window.

Global Stage 1 state did change concurrently, so the packet cannot truthfully
prove the required Stage 1 freeze. The containment postcheck is PASS at
`14:53:37Z`, SHA-256
`e372d87a881242491fb650c45068831b234fa9cd72d597cb93d50fe6b8f0542d`.

## Consequence

This is not a cosmetic rebase. PR #51 contains migration
`0071_platform_release_receipts → 0070_published_test_delivery`, while new
master now contains `0071_mission_slice_core → 0070` and
`0072_mission_ops_receipts → 0071_mission_slice_core`. The reviewed successor
and its candidate-v2 image therefore cannot be merged or cut over under their
old authority.

Recovery requires a frozen new master, an explicit migration-topology decision,
a new R1-A successor and CI/review, then a newly authorized immutable candidate
and a fresh pre-cutover window. The accepted baseline and candidate images stay
immutable evidence; neither is silently relabelled as authority for the new
graph.
