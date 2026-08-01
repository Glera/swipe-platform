# Platform Reliability R1-A — disposable rehearsal runbook

Status: prepared execution contract; **no external authority**. Creating a
Render/GitHub resource, publishing an image, dispatching a workflow or changing
provider state requires the operator's action-time confirmation. Production
resources are never in scope.

## Exact source set

| Role | Exact identity |
| --- | --- |
| reviewed baseline backend | `66819a837fecb8028f3586c8ccabbc997c0ceb69` (`0070_published_test_delivery`) |
| reviewed candidate backend | `301504aeaf0ecc92e5bcdceefcbcb64b1f495216` (`0071_platform_release_receipts`) |
| reviewed feed | `61110cdd506f5364b015f8e2b0cd81c12fda46a1` |
| playables identity | `0960952a9fc7d2d7e6f3ae23b1dffe039d97ebb9` |
| release archive | `a3a78562d6c71808e19d84bd1c23ab0cfaa0fc27` |

Compatibility inputs:

- baseline: code `0069_arrows_runtime_variant` →
  `0070_published_test_delivery`; `lkg_kind=bootstrap-root`;
- candidate: code `0070_published_test_delivery` →
  `0071_platform_release_receipts`; pinned LKG prefix starts at
  `0069_arrows_runtime_variant`; forward authorization ends at
  `0071_platform_release_receipts`.

## Disposable provider set

Use the reviewed `render.r1a-rehearsal.yaml`, unique dated names and record
every resulting opaque ID before continuing:

- one temporary Blueprint with Auto Sync manually set to **No** immediately
  after creation;
- one temporary free PostgreSQL 16 database;
- one temporary Starter Git-backed web service at baseline SHA/branch,
  `./Dockerfile`, Auto Deploy **Off**, with a one-time predecessor bootstrap
  preDeploy of `python -m alembic upgrade 0070_published_test_delivery`;
- one temporary Starter cron at the same exact baseline source and
  `./Dockerfile`, Auto Deploy **Off**, with a far-future schedule and inert
  command; suspend/delete immediately after the source-build receipt;
- one short-lived Render API key, revoked during cleanup;
- one temporary GitHub `production` environment whose deployment branch is
  restricted to `codex/r1a-review-r3-backend-fixes`, containing only disposable
  service/Blueprint/database/registry identities and the temporary Render key.

No production service, Blueprint, database, credential, environment variable
or deployment is read as a mutation target. Reusing a production resource ID
is a stop-the-line failure.

## Attended sequence

1. **Provision only.** Create the disposable database, source-backed web and
   cron. Save provider IDs and initial deploy IDs. No R1-A coordinator action
   yet.
2. **Live API-shape gate.** The first post-provision provider check is an
   authenticated GET-only bounded shape probe using the reviewed shared Render
   client. It records only field names/types and must prove the live
   retrieve-service response exposes boolean top-level `autoDeploy`, string
   top-level `branch`/`dockerfilePath`, and that the disposable controls show
   Auto Deploy **Off** (not After CI Checks Pass). A hard-fail is evidence, not
   permission to weaken parsing during the window. The production-name-bound
   pre-merge capture remains a later production-only gate.
3. **Provider exact-SHA proof.** Let the disposable cron build the reviewed
   `./Dockerfile` from the exact baseline ref without a caller-supplied Docker
   build arg. Its image must contain the exact provider-supplied backend SHA;
   otherwise rehearsal is NO-GO. Suspend/delete the cron after saving the
   bounded build receipt.
4. **Publish immutable baseline.** Dispatch `Platform release image` on
   `codex/r1a-rehearsal-baseline` with `publish=true`, the exact cross-repo
   identities above, the baseline code range, `lkg_kind=bootstrap-root`, and no
   invented LKG fields. Record run ID, image digest and manifest SHA-256.
5. **Publish immutable candidate.** Dispatch the same workflow on
   `codex/r1a-review-r3-backend-fixes` with the candidate code range,
   `lkg_kind=image`, and the exact baseline run/digest/manifest. Record the
   candidate run ID, digest and manifest SHA-256. Never repeat either dispatch
   for the same SHA; a provider failure uses `gh run rerun --failed` only when
   the failure is infrastructure/flaky rather than deterministic.
6. **Prepare source.** Through the reviewed cutover workflow and temporary
   GitHub environment, run `prepare-source` against the exact current
   disposable deploy CAS. Confirm it changes only the disposable web source,
   preDeploy/liveness settings and no application release variables.
7. **Candidate deploy.** Run `deploy` with the new exact current deploy CAS.
   Require predecessor→target migration, committed immutable DB receipt,
   one-off `verify-applied-db`, `/api/health` with `ok=true` and
   `island.bake_runtime.state=local`, and protective compact-image smoke.
8. **Replay and refusal proofs.** Re-run the exact preDeploy binding as a
   disposable one-off job and compare the receipt identity/bytes; exercise a
   stale source-CAS refusal and conflicting binding refusal with zero remote
   mutation after the failing check.
9. **Forward-only rollback.** Run `rollback` through the same workflow and
   concurrency domain. Require the pinned baseline image to serve the newer
   `0071_platform_release_receipts` schema without downgrade, then rerun health
   and DB verification.
10. **Cleanup.** Suspend/delete disposable web, cron and database; disconnect
    the temporary Blueprint; revoke the Render key; delete temporary GitHub
    environment secrets/variables and the temporary environment itself. Record
    cleanup timestamps and confirm every disposable resource ID is absent or
    terminally suspended/deleted.

## Required evidence packet

- exact IDs/SHA/digests for both image builds and their sidecars;
- provider capture before mutation and after source/path changes;
- cron provider-build receipt proving exact source identity;
- prepare-source, deploy, replay/refusal and rollback receipts;
- database revision before candidate, after candidate and after rollback;
- bounded health payloads and protective smoke;
- cleanup/revocation receipt;
- independent acceptance of the exact packet;
- an explicit separate operator GO before any backend/client/meta PR merge or
  production cutover action.
