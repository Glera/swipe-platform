# Independent review — R1-A LKG smoke source fix execution

Review exact source head
`223ab97cf6e24e0542337d2a39e1bce9529f5d00` in
`/private/tmp/p4g-r1a-lkg-fix.zuuYQM/backend` against parent
`f2a840517956c4f480fc9d8aaf6f832ebde489d9`.

Review exact meta evidence commit
`dbbc5d1f3c6acca71c81784248a87cebd984ed8b` in
`/private/tmp/p4g-r1a-meta.YPUxDz`, especially:

- `platform-reliability-r1a-lkg-smoke-source-fix-execution-20260803.{json,md}`;
- authority request/runbook/review files named
  `platform-reliability-r1a-lkg-smoke-source-fix-*`;
- accepted candidate-v3 failure evidence as needed.

Use Read and the explicitly permitted local read-only git commands only.
Do not edit, fetch, browse, use `gh`, call external APIs, access credentials,
or perform any mutation. Return first line exactly `GO` if no P1/P2 remains;
otherwise `NO-GO` with exact P1/P2 file/line findings. Keep under 900 words.

Verify:

1. Source head is exactly one commit on the pinned parent and touches only
   `.github/workflows/platform-release-image.yml` and
   `tests/test_platform_release.py`.
2. The workflow adds exactly one `-e PYTHONPATH=/app` only inside the
   LKG-forward smoke container, after `EXPECTED_SCHEMA_REVISION` and before
   feature flags/mount, without changing smoke semantics, ranges, build,
   publication, manifest, product or Mission runtime.
3. Tests require exact count and ordering inside the bounded `lkg_smoke`
   block and would fail on the parent for precisely the missing argument.
4. The red/green, diff, interpreter, guard, PR and automatic CI receipts are
   internally consistent with the committed source and sufficient for this
   source-fix stage. CI was pull-request-triggered and no behavioral
   candidate-v4 claim is made.
5. The PR is explicitly draft/DO NOT MERGE and the execution stayed inside one
   source push, no rerun/dispatch, no image publication, no provider/runtime
   mutation and no Stage 1 rollout.
6. A GO grants review evidence only. Source merge, candidate-v4 publication,
   rehearsal and cutover remain separate future operator authorities.
