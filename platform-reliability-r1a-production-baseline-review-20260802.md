# R1-A production baseline and publication-plan review

Final verdict: **GO — no P1/P2 findings**.

Reviewed:

- accepted base `a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`;
- final production baseline head
  `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3`;
- production candidate head
  `11c9bce9891ae5b041215056ac4521551a056cb5`;
- `platform-reliability-r1a-production-image-publication-plan-20260802.md`.

## Review rounds

1. The first broad session (`8f40a6ad-e5d7-49bd-94d0-a931d85c7c8d`)
   exhausted its bounded budget without emitting a verdict. It grants no
   authority. Follow-up inspection of its scope found that the historical
   rehearsal baseline still carried a pre-hardening cutover workflow.
2. The baseline was corrected before push: its cutover workflow now has only
   `contents: read`, no production environment/Render secret/coordinator or
   package write, and unconditionally exits 2. A negative test enforces those
   absences; the exact workflow test set passed 36/36.
3. Focused read-only review session
   `1397ea4f-f96f-4c4a-be88-65d6a7bee8a5` returned GO with no P1/P2. It
   directly checked the image workflow, inert cutover workflow, schema/file
   boundary, island protective smoke, Mission guard and both publication input
   tables. Its only scope note was inability to execute `git range-diff`.
4. Shell session `61d36bd7-e33a-4faa-b5f9-4299b486ebae` confirmed head,
   base/merge-base and final-commit paths but reported a tooling-only P2 because
   the default Git 2.17 lacked `range-diff`.
5. Resolution session `6ff1d2db-665d-4306-aa3d-c99a24386ba1` reran the exact
   commands with `/usr/bin/git` and returned GO: base and merge-base matched,
   all 17 range-diff pairs were `=` with no unmatched patches, and the final
   safety commit touched only the cutover workflow plus its test.
6. Initial PR CI then exposed one truthful baseline mismatch: the historical
   acceptance matrix still advertised isolated migration 0071 although the
   rollback image intentionally ends at 0070. Commit
   `05119812b5943a9ad825573369dc548033348bd8` removes only that stale matrix
   row/test and adds two negative assertions. Independent delta-review session
   `8751e0d1-f2b7-463f-825e-9a05602b756b` returned GO and confirmed that every
   real 0001–0070 acceptance path is untouched.
7. The next exact-head full-PostgreSQL run proved all real migration jobs but
   exposed one more candidate-only file: its two tests require the 0071 receipt
   table and construct an LKG by deleting a 0071 migration that is intentionally
   absent here. Final commit
   `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3` removes that file and adds a
   negative assertion preventing its return on the baseline ref.
8. Tool-enabled delta session `6feb3492-9394-47a6-8366-b9b696daacd0`
   exhausted its budget before a verdict and grants no authority. A bounded,
   no-tools review of the exact delta and the preceding CI evidence in session
   `d5a601ea-5089-43de-a52f-570ddeb3d3cf` returned GO with no P1/P2.
9. Exact-head CI is terminal green: nonpublishing compact-image run
   `30764220924` succeeded; PostgreSQL run `30764220931` succeeded with 526
   tests passed and 40 skipped in the main suite, 18 device-flow tests passed,
   durable-authorization acceptance passed, every advertised real migration
   through 0070 passed, and reverse drift passed.

## Accepted boundary

The baseline is accepted in draft PR #50 after exact-head CI. It is not
authorized for image publication or merge. The successful CI result does not
expand that authority. The production pair may be published only after a
separate operator GO naming the committed plan and both accepted heads.

Reported CLI metering across the conclusive read-only sessions was internal
telemetry and does not assert a separate invoice outside the operator's
subscription. No reviewer used web access or mutation tools.
