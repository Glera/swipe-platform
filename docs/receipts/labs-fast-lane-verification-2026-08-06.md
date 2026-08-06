# Labs Fast Lane — verification receipt

Date: 2026-08-06

This receipt records local verification of the exact reviewed commits. No
production service, database, secret, roster, or static origin was changed.

## `swipe-backend@3640b75`

- full repository suite against the configured PostgreSQL test paths:
  **1375 passed, 659 skipped, 10 subtests passed** in 101.18 seconds;
- focused Fast Lane/backend contract suite: **81 passed**;
- final completion-audit rerun of the pure release/rework/auth contract files:
  **33 passed**;
- disposable PostgreSQL base-to-head migration and Fast Lane acceptance passed;
- after the first CI exposed its stale synthetic-LKG filename, the corrected
  fixture independently resolved to `0073_platform_release_receipts` when the
  exact 0074 head was removed; the other affected local tests passed **45/45**;
- `git diff --check`: clean.

The exact migration introduced by this package is
`0074_feed_playable_release_scope`. The separately preserved Stage 2 branch
`claude/mission-truncate-guard@55a5656` also used provisional number `0074` and
therefore must be rebased and renumbered before any future merge. It was not
merged or deployed by this work.

## `swipe-generator@ec2d43a`

- `npm run check`: passed;
- focused service/UI/recovery suite: **46 passed**;
- final real service/UI delta suite after journal and claim-order fixes:
  **9 passed**;
- hermetic CI preparation/retry suite after removing private-sibling reliance:
  **8 passed** under Node 24, including an empty-home/no-global-Git-identity
  run after the disposable repositories received repository-local test-only
  identity;
- detached-worktree update simulation: passed;
- detached-worktree add simulation through frozen static and exact backend
  receipt reread: passed;
- Node 24 server smoke: passed;
- final drift-recovery UI delta: `npm run check` and focused UI test passed;
- `git diff --check`: clean.

A final exact-head `npm run verify` under bundled Node 24.14 completed
**713 passed, 6 skipped, 4 failed**. Every Fast Lane assertion passed. The four
failures are pre-existing checkout-environment drift: three require an absent
trusted sibling `swipe-ugc` worker path and one observes the already-drifted
frozen derivation identity in the sibling `playables` checkout. Re-running
those exact four tests on the untouched PR base `d8619d3` produced the same
four failures and messages. Clean repository CI with its pinned checkout
layout remains the merge authority and must be green on the exact PR head.

## `feed-prototype@965486d`

- full `npm run lint` (TypeScript plus the repository's complete check matrix):
  passed again on the final exact head during completion audit;
- catalog Lab browser check: public HTTPS candidate accepted and unsafe local
  candidate blocked;
- feed-roster browser check: one-open fresh roster, exact mobile context,
  idempotent timeout replay, capability-off behavior, and forced authorization
  challenge passed;
- `git diff --check`: clean.

## Remaining gates

1. exact-head GitHub CI on all three final PR heads;
2. merge without any production side effect;
3. one separately authorized enabling window: backend image/migration, static
   feed publication, and local Labs service reinstall/restart;
4. two operator dogfood runs (one update, one add) against the acceptance
   budgets in the spec.
