# Platform Reliability R1 — Gate C contract

Status: **BLOCKED, NOT APPLIED**

Prepared: `2026-08-02`

Authority: only an explicit operator `GO Gate C0` bound to the exact reviewed
freeze candidate permits merging that candidate and deletion/recreation of the
Blueprint object. Only a later explicit `GO Gate C` permits Render **Approve**
of the reviewed credential-switch Preview. Reviewer GO is evidence, not either
operator authorization.

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
    unchanged service IDs/configuration, the exact policy-bound live-source →
    freeze-merge transition and Auto Sync `No`. Merely disabling Auto Sync or
    disconnecting/reconnecting does not
    satisfy this precondition.
11. Gate C0 source-freeze evidence proves that backend master was exact
    `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4` / tree
    `7b6f8955eb081fd7110a469d078a54ea786db1cc` immediately before the freeze,
    that the bounded replacement completed or aborted, and that the complete
    freeze merge was reverted before Gate C. The post-revert backend tree must
    again equal `7b6f8955eb081fd7110a469d078a54ea786db1cc`; a later reviewed source
    change is separate and must be pinned by the fresh Gate C Preview.
12. The operator has issued a fresh, explicit `GO Gate C` after reviewing this
    contract and all evidence artifacts, including the terminal freeze-revert
    receipt.

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

On `2026-08-04`, the same authenticated support thread supplied the bounded
continuity answer: `fromDatabase` materializes real environment variables on
the linked services, cron schedules live on the cron services, and deleting or
recreating the Blueprint does not change those existing services. This is
provider confirmation of control-plane semantics, not provider observation of
our future replacement execution. Gate C0 therefore still quiesces both cron
services, forbids a web restart and bounds one active replacement attempt to
15 minutes. Both human responses are captured without connection values in
the strict v2 support receipt.

The follow-up note about Sync Hook apply-versus-Preview authority was explicitly
framed as a guess and is not captured in the strict provider receipt or treated
as provider fact. Until Render supplies a factual answer, Gate C0 assumes the
stronger behavior: a private Sync Hook invocation can apply current
`render.yaml` without a separate Dashboard **Approve**. The source freeze below
makes that assumption fail-closed; Gate C0 does not depend on the unanswered
question becoming favorable.

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
4. The strict v2 support receipt must bind Render's `2026-08-04` confirmation
   that service environment variables and cron schedules are materialized on
   the existing services and remain unchanged by Blueprint replacement. It
   must also retain `providerHasNotObservedReplacementExecution=true`.
5. The immutable policy
   `platform-reliability-r1-gate-c0-source-freeze-policy.json` must parse exactly
   and still bind backend PR #54 to base
   `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4` / tree
   `7b6f8955eb081fd7110a469d078a54ea786db1cc`, candidate head
   `739d5b78ab0262dc7e97a9096d8067c92fc8a424` / tree
   `32c8fd38a829389c788bd833ba96e39b7e330f55`, and a merge commit with those
   ordered parents and candidate tree. This exact rebound head and its checks
   must be independently reviewed all-green before operator authorization. Its
   `render.yaml` must be byte-identical
   to reviewed live source `7b41e96ad0d979863159ebdd356122af6295a203`,
   and its sentinel must fail before application startup or database access.
   The policy also pins the exact Git-object digests for live `render.yaml`,
   the freeze manifest and sentinel, plus absence of
   `scripts/start-bake-runtime.sh`; observation JSON cannot supply or override
   those hashes.
   Backend PR #54 remains draft and unmerged before operator authorization.
6. Show the operator the exact backend PR #54 head, old Blueprint target, both cron
   targets, the 15-minute replacement deadline, a separate source-freeze
   reversion deadline no more than 60 minutes after merge, and the rollback
   boundary. Then obtain a fresh `GO Gate C0`. That GO authorizes exactly the
   backend PR #54 merge, cron suspension and Blueprint replacement in this one
   attended window; it does not authorize credential deletion or any
   production deployment.

After approval:

1. Recheck backend master and tree, backend PR #54 exact head/tree and required
   checks against the immutable policy. Merge only that reviewed candidate with
   merge-commit semantics. Before any Render action, require the merge commit's
   ordered parents to equal the policy's base and candidate head and its tree to
   equal `32c8fd38a829389c788bd833ba96e39b7e330f55`; otherwise stop and revert
   before continuing. Record the merge SHA and a source-freeze reversion deadline
   no more than 60 minutes after merge. The freeze is one attended operator
   window: do not pause work, merge unrelated source or initiate a production
   deployment while it is active. If an urgent hotfix is needed, abort Gate C0,
   revert the complete freeze merge first, prove the exact pre-freeze tree is
   restored, and only then use the normal separately authorized deploy path.
2. Suspend `swipe-seq-shadow-run` and `swipe-c1-materialize`; capture their
   provider state and prove that no scheduled run can start in the window.
   Record a start time and hard deadline no more than 900 seconds later.
3. Capture the v3 `before` observation after suspension. It must show web
   `live/running`, both cron services `suspended`, no observed web restart, no
   unexpected sync and
   `provider_confirmed_existing_service_environment_and_schedule_continuity`.
   The comparator cross-binds that typed value to the strict Render Support
   receipt; an operator-authored observation cannot upgrade itself to
   provider-confirmed.
4. Delete only old Blueprint `exs-d95qo3q8qa3s73ea23p0`.
5. Prove the old Blueprint is absent while every baseline service keeps the
   same ID and remains available.
6. Start creation of a new Blueprint from the exact same repo, branch and
   `render.yaml` path. Do not read or expose the new Sync Hook.
7. Before any final create/apply action, inspect the provider Preview. It must
   relink the existing service IDs and must not create/delete a service, change
   plan/storage/schedule/command/source, or enable commit-triggered deploys.
8. If Blueprint replacement automatically starts a build/deploy, a terminal
   sentinel failure with exit `78` before application or database access is
   the expected containment result. Record the deploy identity and continue
   only if the previous Live deployment remains serving and the web has not
   restarted. A successful/Live deploy, application startup or database access
   by that candidate proves the freeze did not bind and is an immediate
   **NO-GO** incident.
9. If Render cannot show that bounded Preview, if the web restarts, if either
   cron becomes runnable, or if the 900-second deadline expires, stop. Leave
   both cron services suspended, retain both database credentials, alert the
   operator and require a new baseline plus a new explicit GO for any later
   recreation attempt. Blueprint deletion alone remains containment.
10. After creation, record the different new Blueprint ID, exact source SHA,
    Auto Sync `No`, unchanged linked service IDs and terminal old-ID absence.
    Capture every sync identity observed since the window start; each must be
    attributable to the single bounded replacement operation. Any other sync,
    or any sync after the terminal `after` observation, is unexpected. Capture
    the v3 `after` observation before the deadline and while both cron services
    remain suspended; it must set `unexpectedSyncObserved=false`. Do not resume
    them in Gate C0.
11. Publish the no-secret observations as
    `platform-reliability-r1-gate-c0-blueprint-before.json` and
    `platform-reliability-r1-gate-c0-blueprint-after.json`, then generate
    `platform-reliability-r1-gate-c0-blueprint-comparison.json` only with:

    ```bash
    node scripts/platform-reliability-r1-blueprint-replacement-compare.mjs \
      --before platform-reliability-r1-gate-c0-blueprint-before.json \
      --after platform-reliability-r1-gate-c0-blueprint-after.json \
      --support platform-reliability-r1-gate-c-render-support-response.json \
      --source-policy platform-reliability-r1-gate-c0-source-freeze-policy.json \
      --backend-repo /absolute/path/to/clean/swipe-backend-worktree
    ```

    A standalone rerun with the same policy and backend worktree plus
    `--verify-json` must PASS before Gate C is prepared. The comparator reads
    both source commits, the ordered merge parents/tree, live/freeze
    `render.yaml`, the freeze manifest, sentinel and forbidden runtime path
    directly from the exact Git objects. It emits
    `sourceTransition.authority=exact_git_objects_bound_by_reviewed_freeze_policy`,
    `evidenceClass=operator_attested`,
    `providerVerifiedServiceContinuity=false`,
    `providerConfirmedFromDatabaseContinuity=true` and derives
    service/database digests from raw bounded projections with code-point
    ordering and stable object-key ordering. It rejects either observation when
    `unexpectedSyncObserved` is true. The final evidence scanner replays the
    comparison from the exact bytes it scanned and the same exact backend Git
    objects, then cross-binds both source SHAs and all three evidence files to
    the operator receipt.

Any duplicate resource proposal, unexpected sync, source drift, service-ID
change or deploy outcome other than the bounded sentinel failure above is
**NO-GO**. The old database credential remains available; no database user is
deleted in Gate C0.

Immediately after a terminal Gate C0 comparison, and also on any abort, revert
the complete backend PR #54 freeze merge before the recorded 60-minute deadline
and before preparing Gate C. The revert receipt must pin the freeze merge SHA,
its ordered parents/tree, the revert commit and parent, elapsed seconds, and the
post-revert tree. It passes only when the post-revert tree is exactly
`7b6f8955eb081fd7110a469d078a54ea786db1cc`, no unrelated commit entered the
window, and `unexpectedSyncObserved=false`. A partial revert, an expired
source-freeze deadline, a frozen source left unattended or any attempt to begin
Gate C before this proof is **NO-GO**. Gate C then requires a fresh Preview
pinned to the then-current reviewed backend source; the sentinel freeze is never
active during Gate C.

After terminal replacement, the exposed old hook is inert by the combination
of Render's human remediation contract and observed terminal absence of the
old Blueprint. Render confirmed the relevant service-binding semantics but did
not observe our replacement execution; the resulting continuity evidence
remains `operator_attested`. The retained local session file remains a contained copy
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
