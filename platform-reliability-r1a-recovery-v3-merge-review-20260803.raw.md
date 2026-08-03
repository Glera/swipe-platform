# Independent review raw result — R1-A recovery v3 merge window

Reviewed exact meta commit:
`b285d3085bb24facd4396f9d040224e9ec0b1399`.

Session: `d839b02b-1329-4abe-afc6-0918770762aa`.

Mode: Claude Haiku, safe mode, plan/read-only permissions, no web tools. The
initial inspection reached its internal subscription budget meter without a
verdict (`0.3081478`); the same session then returned the final verdict without
tools (`0.1313607`). These are CLI subscription meters, not separate invoices.

## Verbatim final result

**GO** — no P1/P2 remains in
`platform-reliability-r1a-recovery-v3-merge-authority-request-20260803.md` or
`platform-reliability-r1a-recovery-v3-merge-runbook-20260803.md` at commit
`b285d3085bb24facd4396f9d040224e9ec0b1399`.

**Basis:**

- Authority boundary is narrow and explicit: request lines ~15 and ~113–124
  forbid workflow dispatch, image publication, GitHub-environment mutation,
  Render mutation, deploy/rollback/migration/job, rehearsal, cutover, and Stage
  1/Mission runtime action. Runbook confines execution to `gh pr ready` + `gh
  pr merge --match-head-commit`, bars auto-merge, and stops before
  publication/rehearsal/cutover.
- Only two external mutations are named (temporary Render key; PR ready+merge),
  with cleanup specified on every failure path (reveal exposure,
  non-synchronous merge, postcondition mismatch).
- Base `f0cc933...`, head `8ea6f1d...`, tree `a7e4c64...` and the five Render
  IDs are identical and internally consistent across both files and prior
  receipts.
- `gh pr merge --merge --match-head-commit` is valid, produces the required
  two-parent merge commit, and auto-merge is explicitly disallowed.
- The GitHub merge API's missing exact-base parameter is explicitly disclosed
  and mitigated via a final pre-merge master read plus mandatory post-merge
  parent/tree verification, with deviation treated as a contained,
  non-actionable evidence failure.
- candidate-v2 (`4714e339...`) is explicitly marked historical and barred from
  reuse as the recovery-merge candidate.
- The operator form matches the body: it requires naming the exact meta-commit,
  targets the same head, repeats the same forbidden set, and includes the same
  failure-path restore/revoke instructions.

**P3 (non-blocking):**

- Authority request's short forbidden-list summary (line ~15) omits
  "rehearsal," which appears only in the fuller "Explicitly forbidden" block
  and operator form — cosmetic, since actual scope is unaffected.
- The 30-minute window bound is enforced by runbook discipline rather than a
  programmatic timeout.
