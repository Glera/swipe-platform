# Independent review — R1-A LKG smoke source-merge authority

Review exact substantive meta commit
`5ad3625b092d094d138bb218c91ea68b0008d784` in
`/private/tmp/p4g-r1a-meta.YPUxDz`.

Use Read and explicitly permitted local read-only git commands only. Do not
edit, fetch, browse, use `gh`, call external APIs, access credentials or
perform any mutation. Return first line exactly `GO` if no P1/P2 remains;
otherwise `NO-GO` with exact P1/P2 file/line findings. Keep under 1000 words.

Review:

- `platform-reliability-r1a-lkg-smoke-source-merge-authority-request-20260803.{json,md}`;
- `platform-reliability-r1a-lkg-smoke-source-merge-runbook-20260803.md`;
- accepted source-fix execution/review receipts at final evidence commit
  `d635398c5e87b33fb40bfa66ea952528e9fda68f`;
- accepted recovery-v3 provider/credential corrective disposition as needed.

Verify:

1. The packet grants no authority before a future exact operator GO and cannot
   reuse the consumed source-fix authority.
2. GitHub boundary pins only PR #53, exact base/head/tree, 28 successes, exact
   two CI runs and accepted independent review, with fail-closed preflight
   repeated before key creation and immediately before merge.
3. Fresh provider proof correctly uses the settled pre-cutover baseline
   `master + ./Dockerfile.bake`, exact resource identities, GET only,
   Auto Sync/Deploy off and zero active sync/deploy/preDeploy/job.
4. The temporary-key contract incorporates the accepted NC-2/NC-3 hardening:
   shared-home probe, precreated 0600 handoff, pinned interpreter/venv, one key,
   role=textbox DIV `textContent`, one non-emitting final reveal block,
   no credential/derivative surface, revocation before merge, empty inventory
   plus exact 401, no replacement.
5. Merge is exactly one synchronous merge-commit of head `223ab97…`, after
   revocation and final CAS, with expected ordered parents/tree; failed merge
   restores draft and cannot be retried, while a post-merge mismatch cannot be
   silently repaired or reverted.
6. Automatic push CI observation and receipts are allowed, while workflow
   dispatch/rerun, image action, GitHub-environment/provider mutation, deploy,
   migration, rehearsal, cutover and Stage 1 runtime remain forbidden.
7. JSON, request and runbook agree on actions, window, cleanup, failure policy
   and next authority. Identify any missing authority, unsafe secret path,
   impossible verifier or conflict with earlier accepted decisions.

A GO is review evidence only. It grants no key creation, provider access,
draft-state change, merge or other operational action.
