# Independent review — bounded R1-A LKG smoke source-fix request

Review exact meta commit
`7a930942234f88a36ff630a7e7313c7f69407efd` in
`/private/tmp/p4g-r1a-meta.YPUxDz`.

Use Read only. Do not edit, fetch, browse, call external APIs or perform any
mutation. Return first line exactly `GO` if no P1/P2 remains; otherwise
`NO-GO` with exact P1/P2 file/line findings. Keep under 900 words.

Review:

- `platform-reliability-r1a-lkg-smoke-source-fix-authority-request-20260803.{json,md}`;
- `platform-reliability-r1a-lkg-smoke-source-fix-runbook-20260803.md`;
- independently accepted failure evidence at exact commit
  `6cb47b16148956fdeaaeb04d6cafd61b95700f95` as needed.

Verify:

1. The new request does not reuse candidate-v3 publication authority or permit
   rerun/redispatch of `30845173288`/`f2a840...`.
2. Exact base, branch absence, failure-producing blobs and authority-absence
   checks are sufficient and fail closed before source mutation.
3. The proposed workflow change is exactly one `-e PYTHONPATH=/app` inside the
   LKG forward-smoke container; test assertions require it exactly once and in
   the correct order, with a meaningful red-on-base/green-after proof.
4. The allowed two-file diff and test set are sufficient to fix only the
   bootstrap defect without weakening the smoke, changing LKG ranges,
   rebuilding baseline, changing product/Mission runtime or touching provider
   authority.
5. One branch, commit, push and draft DO NOT MERGE PR plus automatic CI and
   independent review are bounded; second push, automatic repair, manual
   dispatch/rerun and merge are clearly forbidden.
6. Any failure requires a new decision, and the next source merge and
   candidate-v4 publication remain separate later authorities.
7. JSON, human request and runbook agree on actions, hard stops, costs and
   deny-list, with no silent source or operational grant before a future exact
   operator GO.

A GO is review evidence only and grants no source edit, branch/PR write, merge,
workflow dispatch, publication or operational action.
