# Independent review — R1-A recovery v3 PR #52

Review exact backend PR #52 head
`8ea6f1de6d2fe4bbb43b56698fd135649130d3c5` against exact base
`f0cc933fb813be2e4784200592efced196d74973` in
`/private/tmp/r1a-recovery-v3-sim-f0`. Read-only review: do not edit, use web
tools or call mutation APIs.

Return `GO` first only if no P1/P2 remains; otherwise `NO-GO` and every P1/P2
with exact file/line. P3 separately. Keep the answer under 900 words.

Context:

- old independently reviewed R1-A head is `4714e339...`;
- current master contains additive Mission migrations
  `0071_mission_slice_core -> 0072_mission_ops_receipts`;
- operator selected option A: those storage migrations may accompany R1-A,
  while all Mission runtime flags must remain false;
- merge commit `678ce836...` preserves old R1-A history;
- final commit changes R1-A migration identity to
  `0073_platform_release_receipts -> 0072_mission_ops_receipts` and strengthens
  exact-LKG forward compatibility before publication;
- proposal/review/receipt live in
  `/private/tmp/p4g-r1a-meta.YPUxDz/platform-reliability-r1a-concurrent-master-recovery-{plan,review,scratch-proof}-20260803.md`
  and `platform-reliability-r1a-recovery-v3-pr-receipt-20260803.md`.

Verify:

1. PR history/diff contains the accepted R1-A contour plus current master,
   with no accidental Stage 1 product implementation changes beyond ancestry.
2. Alembic is single-head at `0073`; the R1-A body is unchanged; the physical
   test roundtrips only `0073 -> 0072 -> 0073`; every stale R1-A hard-coded
   revision is handled.
3. Both Mission and R1-A PostgreSQL acceptance jobs survive conflict resolution.
4. The exact pinned LKG gate executes before candidate build/publication,
   targets candidate-head PG16, uses the old image's own `app.main`/`app.db`
   and reads all of its own ORM tables/read models. Check networking,
   credentials, revision binding and whether it can pass vacuously.
5. Mission core/read/ops remain default false and are not enabled by
   production Render config or the image workflow.
6. No change grants merge/deploy authority or reuses stale PR #51/candidate-v2.

A GO accepts the draft recovery implementation only. It grants no merge,
workflow dispatch, image publication, GitHub environment, Render mutation,
production migration, deploy or Mission runtime rollout.
