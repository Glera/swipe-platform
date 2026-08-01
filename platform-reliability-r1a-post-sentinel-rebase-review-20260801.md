# Platform Reliability R1-A — post-sentinel rebase acceptance

Review date: `2026-08-01`  
Reviewer: independent Claude Code read-only pass  
Verdict: **GO** — no P1/P2 blockers to publishing the successor refs and
running the attended rehearsal.

## Exact reviewed identities

| Role | Ref | SHA |
| --- | --- | --- |
| backend baseline successor | `codex/r1a-rehearsal-baseline-v2-20260801` | `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725` |
| backend candidate successor | `codex/r1a-rehearsal-candidate-v2-20260801` | `d0a9fa11cd88e3ae4202f7cafa631a319b622492` |
| unchanged client guard | `codex/r1a-client-guard-20260801` | `e804c73d41f5e94401caa3bb5acb92f691866101` |
| current backend base | `master` | `9277047852c0d73f4d3b9a081e1b0b586f48ae3c` |

The review verified that both real release-workflow blobs are byte-identical
to their previously accepted versions and fully replace the default-branch
registration sentinels. Later R1-A commits retain the same patch identities;
the provider live-shape and Mission adapter commits are patch-identical to
their separately reviewed predecessors.

The baseline still has the single Alembic head
`0070_published_test_delivery`; the candidate has the single head
`0071_platform_release_receipts`. No Stage 1 Mission implementation modules
are present.

Local evidence supplied to the reviewer:

- candidate focused acceptance: `74 passed, 3 skipped`;
- baseline focused acceptance: `39 passed, 3 skipped`;
- `git diff --check`: clean on both refs;
- candidate Mission architecture guard: `PASS`, policy SHA-256
  `b2c7995914744674ed96bb42d0e8fbfd2931e14035af6f77b1077ebd05c50d92`.

## Non-blocking finding and disposition

**[P3]** The intentionally migration-pinned baseline deletes migration `0071`
but retains its PostgreSQL migration test and matrix entry. That isolated
matrix leg would fail if the baseline were opened as a pull request or if the
full `postgres-acceptance` workflow were manually dispatched against it.

Disposition: accepted for the immutable rehearsal baseline. The baseline is
not a PR source and the full PostgreSQL matrix must not be dispatched on it.
Its only authorized CI path is the exact `Platform release image`
`workflow_dispatch`; that workflow upgrades its disposable database to the
baseline head and does not run the orphaned `0071` migration test. The
candidate retains migration `0071` and its test normally.

This GO authorizes neither GHCR publication, disposable Render creation nor
production cutover. Those remain action-time operator gates in the rehearsal
runbook.
