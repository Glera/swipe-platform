# A1.1 + Island Social Core — Alembic merge preparation

Date: 2026-07-25.  
Status: **prepared on feature branches; master, deploys and flags untouched**.

## Resulting order

The competing `0050` revisions and the later P3/P4 collision were replaced by
one linear chain:

```text
0049_cohort_observability
  → 0050_a11_cohort_watch_read
  → 0051_island_social_core
  → 0052_friendship_user_hi_idx
  → 0053_island_theme_jobs
  → 0054_island_mod_action_seq
```

No table/column/constraint semantics were changed by the renumbering. Only
filenames, `revision`, `down_revision`, migration-test labels and the CI matrix
entry were adjusted.

## Exact pushed heads

| Branch | Head | Role |
|---|---|---|
| `codex/a11-cohort-watch-backend` | `24a6409` | retains cohort migration `0050` |
| `island-social-core-p1` | `630b8e1` | merges A1.1, reparents island P1 as `0051–0052` |
| `island-theme-async` | `c10726a` | stacks on updated P1, theme becomes `0053` |
| `island-moderation` | `546b271` | stacks on P4, moderation becomes `0054` |
| `codex/a11-cohort-watch-evidence` | `cf38b3b` | fixes spec link, review wording and records this merge gate |

Client branches were not changed: the conflict was backend/Alembic-only.

## Verification

- final `alembic heads`: exactly
  `0054_island_mod_action_seq`;
- physical disposable PostgreSQL:
  `upgrade head → downgrade 0049 → upgrade head` — PASS;
- P1 isolated migration tests (cohort + island): **3 passed**;
- combined island PG suites on the final P3 head
  (core + bots + theme + moderation): **78 passed**;
- combined targeted pure suite during P1 merge preparation: **46 passed**;
- full pure backend suite on the combined A1.1+P1 head:
  **844 passed, 305 skipped, 10 subtests passed**;
- two blind `auto-review` passes: **0 findings**; disposition validators green.

## Remaining gates

This work removes the migration collision only. It does not override the
package review verdicts:

- P1 still needs Codex R2-F001 exact runtime revision/digest;
- P4 still needs per-physical-call attempt receipts and complete resume identity;
- P3 has GO with the pagination retry UI condition.

Before merging to master, rerun CI on the new exact feature heads and preserve
the order A1.1 → P1 → P4 → P3. Nothing here authorizes deployment or enabling
any default-off flag.
