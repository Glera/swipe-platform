# Platform Reliability R1 — Gate C contract

Status: **BLOCKED, NOT APPLIED**

Prepared: `2026-08-02`

Authority: only an explicit operator `GO Gate C0` permits deletion/recreation
of the Blueprint object, and only a later explicit `GO Gate C` permits Render
**Approve** of the reviewed credential-switch Preview.

The first Preview is explicitly stale and must never be approved. It would
have restored commit-triggered production deploys for the web service and both
DB-backed cron jobs. Backend PR #49 was independently reviewed GO and merged
source-only as `7b41e96ad0d979863159ebdd356122af6295a203`; it pins all three to
`autoDeployTrigger: "off"`. Gate C requires a fresh Preview, source SHA and
sync identity after this merge.

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

1. Backend source includes PR #47 plus reviewed/merged PR #49
   (`7b41e96ad0d979863159ebdd356122af6295a203`), and the fresh Preview is
   pinned to the exact then-current source SHA. The read-only Alembic check
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
    provider-supported invalidation proof bound to old Blueprint identity
    digest
    `sha256:556758c36536ddbc9a77c97faafcf68f7f89e34053a4e8721cd2ac938be0a19a`.
    For this incident the supported path is deletion of the old Blueprint and
    creation of a new Blueprint. PASS requires a separate operator `GO Gate
    C0`, terminal absence of the old Blueprint, a different new Blueprint ID,
    unchanged service IDs/configuration, exact source continuity and Auto Sync
    `No`. Merely disabling Auto Sync or disconnecting/reconnecting does not
    satisfy this precondition.
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
secret value. On `2026-08-03`, a human Render Support agent supplied the
provider-supported remediation: delete the old Blueprint and create a new
one. Render states that deletion removes the current hook, the new Blueprint
gets a new hook, and the existing services are not deleted and should be
detected for relinking. Render also reports the last Blueprint sync at
`2026-07-30T15:09:14Z`, before this incident. The exact bounded receipt is
`platform-reliability-r1-gate-c-render-support-response.json`.

Render did **not** establish what happens to already-resolved
`fromDatabase.connectionString` environment bindings while the owning
Blueprint object is absent (`serviceRelinkContinuityObserved=false`). A
follow-up question must remain in the same authenticated support thread; its
answer, if any, is captured without connection values. Until a provider answer
is committed, Gate C0 treats this continuity as unconfirmed and compensates by
quiescing both cron services, forbidding a web restart, and bounding one active
replacement attempt to 15 minutes.

This response is a remediation contract, not terminal evidence: the old
Blueprint still exists and its hook is not yet invalidated. Gate C and every
later operator action therefore remain stopped. A separate `GO Gate C0`,
terminal Blueprint replacement evidence and explicit later `GO Gate C` are
mandatory before this contract can return to `PREPARED`. Replacing the old
Blueprint will close both exposures of that same hook; the historical
2026-07-29 residual is not treated as authority for the new incident.

## Blueprint replacement sub-gate — Gate C0

Status: **PREPARED, NOT AUTHORIZED**.

Gate C0 is destructive only to the old Blueprint control object. It is not
authorized to delete, recreate, resize, redeploy or reconfigure any service,
cron or database. Before its operator confirmation:

1. PR #49 has independent GO and is merged at
   `7b41e96ad0d979863159ebdd356122af6295a203`. The exact current backend source
   must still declare `autoDeployTrigger: "off"` for the web and both DB-backed
   cron consumers.
2. Capture a read-only, no-secret inventory of the old Blueprint ID,
   repo/branch/path, Auto Sync `No`, last sync, and the exact service IDs,
   plans, schedules, and raw non-secret command/environment-key/database-
   binding projections that must survive unchanged. Comparison hashes are
   computed from these projections; inputs cannot supply configuration hashes.
3. Recheck that web, both cron consumers and the source database are healthy;
   both old and new database credentials remain valid.
4. Send the bounded `fromDatabase` continuity question in the already-open
   Render Support thread. If Render has not answered by the operator window,
   record `unconfirmed_compensated_by_quiescence`; this is not provider proof.
5. Show the operator the exact old Blueprint target, both cron targets, the
   15-minute deadline and rollback boundary, then obtain a fresh `GO Gate C0`.
   That GO authorizes cron suspension and Blueprint replacement in this one
   window; it does not authorize credential deletion.

After approval:

1. Suspend `swipe-seq-shadow-run` and `swipe-c1-materialize`; capture their
   provider state and prove that no scheduled run can start in the window.
   Record a start time and hard deadline no more than 900 seconds later.
2. Capture the v2 `before` observation after suspension. It must show web
   `live/running`, both cron services `suspended`, no observed web restart and
   `unconfirmed_compensated_by_quiescence` for the `fromDatabase` question.
   A later Render answer requires a separately reviewed schema revision; an
   operator-authored observation cannot upgrade itself to provider-confirmed.
3. Delete only old Blueprint `exs-d95qo3q8qa3s73ea23p0`.
4. Prove the old Blueprint is absent while every baseline service keeps the
   same ID and remains available.
5. Start creation of a new Blueprint from the exact same repo, branch and
   `render.yaml` path. Do not read or expose the new Sync Hook.
6. Before any final create/apply action, inspect the provider Preview. It must
   relink the existing service IDs and must not create/delete a service, change
   plan/storage/schedule/command/source, or enable commit-triggered deploys.
7. If Render cannot show that bounded Preview, if the web restarts, if either
   cron becomes runnable, or if the 900-second deadline expires, stop. Leave
   both cron services suspended, retain both database credentials, alert the
   operator and require a new baseline plus a new explicit GO for any later
   recreation attempt. Blueprint deletion alone remains containment.
8. After creation, record the different new Blueprint ID, exact source SHA,
   Auto Sync `No`, unchanged linked service IDs and terminal old-ID absence.
   Capture the v2 `after` observation before the deadline and while both cron
   services remain suspended. Do not resume them in Gate C0.
9. Publish the no-secret observations as
   `platform-reliability-r1-gate-c0-blueprint-before.json` and
   `platform-reliability-r1-gate-c0-blueprint-after.json`, then generate
   `platform-reliability-r1-gate-c0-blueprint-comparison.json` only with:

   ```bash
   node scripts/platform-reliability-r1-blueprint-replacement-compare.mjs \
     --before platform-reliability-r1-gate-c0-blueprint-before.json \
     --after platform-reliability-r1-gate-c0-blueprint-after.json \
     --support platform-reliability-r1-gate-c-render-support-response.json
   ```

   A standalone rerun with `--verify-json` must PASS before Gate C is
   prepared. The comparator emits `evidenceClass=operator_attested`,
   `providerVerifiedServiceContinuity=false` and derives service/database
   digests from raw bounded projections with code-point ordering and stable
   object-key ordering. The final evidence scanner replays the comparison
   from the exact bytes it scanned and cross-binds all three files to the
   operator receipt.

Any duplicate resource proposal, unexpected deploy/sync, source drift or
service-ID change is **NO-GO**. The old database credential remains available;
no database user is deleted in Gate C0.

After terminal replacement, the exposed old hook is inert by the combination
of Render's human remediation contract and observed terminal absence of the
old Blueprint. This is not retroactively described as provider-observed
service continuity. The retained local session file remains a contained copy
until that terminal proof exists; immediately afterward it must either be
securely removed under a separate local cleanup receipt or remain an explicitly
accepted local residual with owner and deletion deadline.

## Authorized action

After Gate C0 and all later Gate C preconditions pass, the
operator-authorized executor may click the
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
