# Platform Reliability R1 — Gate C contract

Status: **BLOCKED, NOT APPLIED**

Prepared: `2026-08-02`

Authority: only an explicit operator `GO Gate C` permits Render **Approve**.

The first Preview is explicitly stale and must never be approved. It would
have restored commit-triggered production deploys for the web service and both
DB-backed cron jobs. Backend PR #49 pins all three to
`autoDeployTrigger: "off"`; after its independent review and merge, Gate C
requires a fresh Preview, source SHA and sync identity.

PR #49 is deploy-path hardening, not containment for the Sync Hook incident.
Service commit triggers and the private Blueprint sync trigger are distinct
authority paths.

## Purpose

Gate C moves the closed production consumer set from the old Render-managed
PostgreSQL credential to the new default credential through the linked
Blueprint. It must preserve database authority, declarative source, service
shape and availability. It does not delete the old credential; that is the
separate Gate D.

## Preconditions

Every item is mandatory before **Approve**:

1. Backend source includes PR #47 plus reviewed PR #49, and the fresh Preview
   is pinned to that exact post-merge source SHA. The read-only Alembic check
   receipt remains reviewed as `exit 0`, SHA-256 `855ec70c…`.
2. Capability implementation includes meta PR #54 merge
   `6f68be6de57276885633cc95e5c5c539edd5766b` and both required GitHub checks are green:
   `verify` and `postgres-16-capability-proof`.
3. The committed comparison receipt
   `platform-reliability-r1-gate-c-capability-comparison.json` has schema v2,
   `profilesEqual=true`, no differences and `secretsCaptured=false`.
4. Its exact SHA-256 is
   `73cd60e81865a818b90b2b9bdea24eb5078133f423bebde4c96e913dadc68cd8`.
   Raw capability profiles remain operator-local and are not committed.
5. Successful schema-v2 comparison proves that direct ACL authority is within
   the declared delegated-session allowance and direct settings equal the
   declared global delegated-role setting. The old and new effective roles are
   equal by digest; raw counts and identities are intentionally not committed.
6. The committed exact visible Preview capture
   `platform-reliability-r1-gate-c-blueprint-preview.json` has `stale=false`
   and is still the exact page being approved. Its sync identity and full
   source SHA are rechecked immediately before the click.
7. Preview changes are limited to three expected lines:
   - `DATABASE_URL` refresh for web `swipe-backend`;
   - `DATABASE_URL` refresh for cron `swipe-seq-shadow-run`;
   - `DATABASE_URL` refresh for cron `swipe-c1-materialize`.
   Any `auto-deploy-trigger=commit` line is **NO-GO**. The post-merge source
   must declare `autoDeployTrigger: "off"` for all three consumers.
8. Preview contains no create/delete, plan, storage, schedule, source,
   additional environment-variable or consumer-set change.
9. `platform-reliability-r1-gate-c-blueprint-autosync.json` proves one unique
   disabled `autoSync No` control, `syncStatus=paused` and
   `secretsCaptured=false`. Auto Sync is rechecked immediately before the act.
   Both old and new credentials remain valid; deletion is not part of Gate C.
10. Secret incident `r1-window-blueprint-sync-hook-dom-20260802-1` has terminal
    provider-supported rotation/invalidation proof bound to Blueprint identity
    digest
    `sha256:556758c36536ddbc9a77c97faafcf68f7f89e34053a4e8721cd2ac938be0a19a`
    and a separate operator approval. Auto Sync `No`, disconnect/reconnect or
    another residual-risk acceptance do not satisfy this precondition.
11. The operator has issued a fresh, explicit `GO Gate C` after reviewing this
    contract and all evidence artifacts.

Any mismatch is **NO-GO**. Do not approve a regenerated or changed Preview
under this contract; capture and review a new one.

## Secret incident containment

At `2026-08-02T19:10Z`, a broad DOM snapshot of Blueprint Settings returned a
private Blueprint Sync Hook into retained tool output. The value is not copied,
used, hashed into public evidence or repeated here. The incident ID is
`r1-window-blueprint-sync-hook-dom-20260802-1`; current disposition is
`contained_pending_provider_invalidation`.

A bounded local scan found zero repository matches and one retained Codex
session match. The session directory was narrowed from `0755` to `0700` and
the affected file from `0644` to `0600`; content was not deleted or rewritten.
Exact bounded evidence is in
`platform-reliability-r1-gate-c-hook-incident-receipt.json`.

The operator-authorized Render Support request was submitted without any
secret value. Render's automated agent confirmed the public self-service gap
and acknowledged escalation to a human agent. The request asks for terminal
rotation/invalidation, disconnect/reconnect semantics, exact hook authority
and a provider-side audit of non-Dashboard syncs over the prior 24 hours.

Gate C and every later operator action are stopped. Current public Render API
and Dashboard documentation expose no Blueprint Sync Hook regeneration or
revocation control. A provider-supported terminal rotation/invalidation proof
and explicit operator approval are mandatory before this contract can return
to `PREPARED`. The historical 2026-07-29 accepted residual cannot be extended
to this new incident.

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
