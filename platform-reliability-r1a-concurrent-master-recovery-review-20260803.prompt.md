# Independent review — R1-A recovery after concurrent master advance

Review exact meta proposal commit
`291e099b0ccf1b9b445053e09f7658c0882d13e6` in the current repository and
current backend GitHub-authority commit
`47a0a0a6b4841212c44382c73dbeb0b26037e850`. This is a read-only design and
safety review. Do not edit files, use the web or call external mutation APIs.

Return `GO` as the first word only if no P1/P2 remains; otherwise return
`NO-GO` and list every P1/P2 with exact file/section. Keep the complete answer
under 1,000 words; list P3 separately.

Primary files:

- `platform-reliability-r1a-concurrent-master-recovery-plan-20260803.md`
- `platform-reliability-r1a-goal-completion-audit-20260803.md`
- `platform-reliability-r1a-cutover-preparation-v2-concurrent-drift-20260803.md`

Backend sources are available read-only at
`/Users/gleb/My projects/p4g-platform-workspace/swipe-backend`. Inspect exact
objects with `git show <sha>:<path>`; do not trust its checked-out worktree.
The disposable replay is at `/private/tmp/r1a-recovery-sim.qPPU71/repo` on
scratch head `7351cba15101594348f740e99e6d663b718112f2`, with the migration-topology
changes intentionally uncommitted. Treat it only as reproducible supporting
evidence, never as authority.

Confirm or reject:

1. The recommended linear graph
   `0070 -> 0071_mission_slice_core -> 0072_mission_ops_receipts ->
   0073_platform_release_receipts` is the minimal non-branching recovery and
   does not silently change either migration's body semantics.
2. Stage 1 migrations are additive to a production database at `0070`: they
   create new Mission objects and reference `users`, but do not alter/drop
   existing tables or data. Identify any overlooked runtime or downgrade
   interaction relevant to forward-only image rollback.
3. Replaying R1-A on exact `47a0...`, keeping both acceptance contours and
   renaming only its migration identity/tests, is a safe new-review starting
   point. Check whether the proposal overlooks any other path collision or
   stale hard-coded revision.
4. The accepted baseline image can remain the LKG in principle. Judge whether
   the proposed exact-baseline forward-compatibility test (old image imports
   `app.main`, connects using its own DB module, and zero-row-selects every
   baseline `Base.metadata` table against candidate-head PG16) is meaningful
   and sufficient before publication, or name the missing gate precisely.
5. The proposal truthfully surfaces the authority conflict: current master
   ancestry and preDeploy necessarily bring Stage 1 storage schema to
   production even with every Mission runtime flag off. Verify that option A
   is technically bounded and that option B is the only literal way to retain
   the old no-Stage-1-production constraint without inventing an unsafe branch.
6. The sequence preserves separate authority for recovery PR, candidate-v3
   publication, fresh pre-cutover preparation and cutover, and does not reuse
   PR #51/candidate v2 as current authority.

A GO accepts only the recovery proposal and its request for an explicit
operator choice. It authorizes no backend edit, PR, image publication, GitHub
environment, workflow dispatch, Render mutation, migration, deploy or Stage 1
runtime rollout.
