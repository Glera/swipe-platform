# Platform Reliability R1 — Gate C contract

Status: **PREPARED, NOT APPLIED**  
Prepared: `2026-08-02`  
Authority: only an explicit operator `GO Gate C` permits Render **Approve**.

## Purpose

Gate C moves the closed production consumer set from the old Render-managed
PostgreSQL credential to the new default credential through the linked
Blueprint. It must preserve database authority, declarative source, service
shape and availability. It does not delete the old credential; that is the
separate Gate D.

## Preconditions

Every item is mandatory before **Approve**:

1. Backend source is `a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`
   (PR #47), with the read-only Alembic check receipt already reviewed as
   `exit 0`, SHA-256 `855ec70c…`.
2. Capability implementation includes meta PR #54 merge
   `6f68be6de57276885633cc95e5c5c539edd5766b` and both required GitHub checks are green:
   `verify` and `postgres-16-capability-proof`.
3. The committed comparison receipt
   `platform-reliability-r1-gate-c-capability-comparison.json` has schema v2,
   `profilesEqual=true`, no differences and `secretsCaptured=false`.
4. Its exact SHA-256 is
   `73cd60e81865a818b90b2b9bdea24eb5078133f423bebde4c96e913dadc68cd8`.
   Raw capability profiles remain operator-local and are not committed.
5. The new session role has `directAclCount=0` and
   `directSettingsCount=1`; the sole setting is the declared global delegated
   role setting. The old and new effective roles are equal by digest.
6. The committed exact visible Preview capture
   `platform-reliability-r1-gate-c-blueprint-preview.json` is still the page
   being approved, with sync identity `exe-d9nercqjnfac73aunbvg` and source
   `a12ca7e`.
7. Preview changes are limited to all six expected lines:
   - `DATABASE_URL` refresh for web `swipe-backend`;
   - `DATABASE_URL` refresh for cron `swipe-seq-shadow-run`;
   - `DATABASE_URL` refresh for cron `swipe-c1-materialize`;
   - `auto-deploy-trigger=commit` for those same three consumers.
8. Preview contains no create/delete, plan, storage, schedule, source,
   additional environment-variable or consumer-set change.
9. Blueprint Auto Sync remains disabled before the manual act. Both old and
   new credentials remain valid. No credential deletion is part of Gate C.
10. The operator has issued a fresh, explicit `GO Gate C` after reviewing this
    contract and the two evidence artifacts.

Any mismatch is **NO-GO**. Do not approve a regenerated or changed Preview
under this contract; capture and review a new one.

## Authorized action

After all preconditions pass, the operator-authorized executor may click the
single **Approve** button on the exact Preview above. It must then record:

- Blueprint sync ID, start/end UTC and terminal status;
- exact pinned source SHA;
- affected consumer set;
- web deploy ID and terminal `Live` state;
- a fresh application-mediated read-only DB proof for web;
- one fresh successful idempotent run and run ID for each DB-backed cron;
- a post-drain `pg_stat_activity` proof that the new username digest is in use
  and the old username has zero sessions.

`/api/health` alone is not a DB proof.

## Rollback and containment

The old credential stays valid through Gate C and until the separate Gate D.
The old URL remains only in the operator-local `0600` staging file; it is not
committed or printed.

If the Preview cannot be approved or the sync itself fails, no credential is
deleted. The last Live web instance remains the serving candidate and both
users are retained. Record the failure and stop.

If the new deployment becomes Live but any fresh DB proof fails:

1. stop cron execution and do not delete either credential;
2. record which username digest is serving each consumer;
3. keep or redeploy the pinned last-known-good application image only when it
   has already passed the new credential capability check;
4. do not claim that an image rollback restores the old dynamic
   `fromDatabase.connectionString` — after sync it resolves to the new default;
5. if the last-known-good image also cannot obtain a fresh DB proof, stop with
   both users preserved and require a separately reviewed recovery plan before
   any further Blueprint or environment mutation.

There is deliberately no silent automatic repoint to the old URL. A temporary
explicit old-URL override would transmit a credential and change Blueprint
authority; it is outside Gate C and requires its own operator-approved,
secret-safe recovery procedure.

## Exit

Gate C passes only when the Blueprint sync is terminal-successful and all three
consumers provide fresh post-sync DB-backed evidence. Until then the state is
`IN_PROGRESS` or `CONTAINED`, never `PASS`. Successful Gate C unlocks Gate D;
it does not authorize old-credential deletion by itself.
