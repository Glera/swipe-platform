# Labs Fast Lane backend flag corrective — independent review

Status: **SECOND-PASS P2 DISPOSITION APPLIED; final micro-delta review pending.
This is not an operator GO.**

Reviewed artifact:
`docs/receipts/labs-fast-lane-backend-flag-corrective-2026-08-07.md` at meta
`f81a549`.

Reviewer: Claude Opus 5, fresh read-only subscription CLI session with only
`Read`, `Grep` and `Glob` tools. The session had no write or external-mutation
authority. A prior Fable CLI attempt was terminated without a verdict after a
permission-handshake stall and supplied no review evidence.

Verdict first line: **GO — no P1; two P2 pre-save checks required.**

## Findings and dispositions

### P2-1 — both sibling chains must be proved before enabling the child gate

The player and Lab routers each require
`ENABLE_FEED_PLAYABLE_RELEASE=true`, but they have different parent chains:
`ENABLE_OPERATOR_LEVEL_FLAGS` for the player route and
`ENABLE_CATALOG_LAB_AUTH` plus `ENABLE_OPERATOR_LEVEL_FLAGS_LAB` for the Lab
route. Only the player surface was proved by the visible TMA button in the
original draft.

Disposition: **accepted**. The same captured production OpenAPI was queried and
contains both `/api/operator-level-flags` and
`/api/admin/operator-level-flags`, while both child rework routes are absent.
The action now also requires the two non-secret Lab parent env values to be
true on the same Render edit page before Save.

### P2-2 — the log code is not a unique discriminator

The Labs client maps any non-200 Lab response to
`operator_flags_lab_response_invalid`; that log alone cannot distinguish an
absent route, denied scope or invalid token.

Disposition: **accepted**. Causality now rests on the OpenAPI path matrix, not
the collapsed client error. Both sibling routes are present and all three
`ENABLE_FEED_PLAYABLE_RELEASE` child routes are absent.

### P3-1 — pending retry is process-local

Disposition: **accepted**. The packet now distinguishes same-card in-session
retry from re-entry after TMA reload or occurrence change.

### P3-2 — preDeploy reads persistent release environment

Disposition: **accepted**. The packet now requires
`PLATFORM_RELEASE_OPERATION=deploy` or absence and preserves the manifest,
deploy and database identities. It explicitly permits an idempotent platform
release-receipt replay or one exact append-only platform receipt.

### P3-3 — rollback must cover boot/deploy failure

Disposition: **accepted**. The rollback trigger now includes both failure to
become live and unhealthy routes after live.

## Independently verified invariants

- the database is already at target `0074`, so the unchanged manifest selects
  `target_verified_retry` and does not run Alembic upgrade;
- the flag mounts routers only; it adds no lifespan/background writer;
- claim/close reuse the existing operator-flags Lab scope;
- a normal existing-mechanic update remains static content plus exact Telegram
  approval after this one-time enabling correction;
- the edit affects only the web service, not the two cron services.

## Delta pass at `c2a678f`

Verdict: **NO-GO with one P2, no P1**. The reviewer verified literal closure
of every first-pass finding, then found that the acceptance expected only two
new routes even though the same flag also mounts the server-owned
`/api/feed/playable-releases/apply` route and makes its release-bound write
scope grantable.

Disposition: **accepted**. The observed-before matrix now names all three
absent child routes. PASS requires all three to appear, and states that the
apply route remains inert until a separately authorized exact release obtains
`feed.playable-release:write`. STOP likewise covers absence of any of the three
routes. No mutation authority was added to the corrective action itself.
