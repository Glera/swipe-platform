# Platform Reliability R1-A — disposable rehearsal runbook

Status: prepared execution contract; **no external authority**. Creating a
Render/GitHub resource, publishing an image, dispatching a workflow or changing
provider state requires the operator's action-time confirmation. Production
resources are never in scope.

## Exact source set

| Role | Exact identity |
| --- | --- |
| rebased baseline backend | `1aee3e0bf596121d8d326951519d1f897e46ced1` (`0070_published_test_delivery`) |
| rebased candidate backend | `c7c62ad893c361b78ddaba687e22254045525512` (`0071_platform_release_receipts`) |
| rebased client guard | `e804c73d41f5e94401caa3bb5acb92f691866101` |
| public release feed identity | `61110cdd506f5364b015f8e2b0cd81c12fda46a1` |
| playables identity | `0960952a9fc7d2d7e6f3ae23b1dffe039d97ebb9` |
| release archive | `a3a78562d6c71808e19d84bd1c23ab0cfaa0fc27` |

Compatibility inputs:

- baseline: code `0069_arrows_runtime_variant` →
  `0070_published_test_delivery`; `lkg_kind=bootstrap-root`;
- candidate: code `0070_published_test_delivery` →
  `0071_platform_release_receipts`; pinned LKG prefix starts at
  `0069_arrows_runtime_variant`; forward authorization ends at
  `0071_platform_release_receipts`.

## Rebase evidence

The backend/client ranges were rebased without patch drift onto backend
`058c772ed5e0d46cf0e7ec4fcddf4f217b3f9ab2` and client
`96780f55a28e2fdf98d33290a87e1865431826c8`; local release tests are 29/29
(candidate), 22/22 (baseline), and the client guard mutants/build pass. An
independent delta review remains required before execution.

The feed input is the exact `feedCommit` in the public release archive at the
listed `swipe-platform` SHA. It is not mislabeled as the client-guard review
head; those are separate identities in the manifest.

## Default-branch registration prerequisite

GitHub requires a `workflow_dispatch` workflow file to exist on the default
branch, even when the selected run ref is another branch. The two full R1-A
workflows are not yet on backend `master`. A separate registration-only PR from
`codex/r1a-workflow-registration` must therefore be independently reviewed and
receive explicit operator merge GO before any workflow dispatch. Its two
sentinels reproduce the input schemas but have no checkout, secrets,
environment, package write or provider authority and always exit 2 when their
default-branch versions execute. GitHub uses the full workflow version from
the explicitly selected reviewed ref. This sentinel merge is not backend PR
#33 and grants no cutover authority.

## Disposable provider set

Create a new temporary Render workspace first. This isolation permits the
reviewed production-name-bound capture to verify exact service names without
ever accepting a production resource ID. Use the reviewed
`render.r1a-rehearsal.yaml` in that workspace and record every resulting opaque
ID before continuing:

- one temporary Blueprint with Auto Sync manually set to **No** immediately
  after creation;
- one temporary free PostgreSQL 16 database;
- one temporary Starter Git-backed web service at baseline SHA/branch,
  `./Dockerfile`, Auto Deploy **Off**, with a one-time predecessor bootstrap
  preDeploy of `python -m alembic upgrade 0070_published_test_delivery`;
- two temporary Starter crons at the same exact baseline source and
  `./Dockerfile`, Auto Deploy **Off**, with a far-future schedule and inert
  exact-SHA print command; suspend/delete immediately after the source-build
  receipt;
- one temporary GHCR registry credential in that workspace, bound by exact ID
  in the GitHub rehearsal environment and deleted during cleanup;
- one short-lived Render API key, revoked during cleanup;
- one temporary GitHub `production` environment whose deployment branch is
  restricted to `codex/r1a-review-r3-backend-fixes`, containing only disposable
  service/Blueprint/database/registry identities and the temporary Render key.

No production service, Blueprint, database, credential, environment variable
or deployment is read as a mutation target. Reusing a production resource ID
is a stop-the-line failure.

## Attended sequence

1. **Provision only.** Create the disposable database, source-backed web and
   both crons only after `refs/heads/codex/r1a-rehearsal-baseline` on origin
   resolves to `1aee3e0bf596121d8d326951519d1f897e46ced1`. Save the temporary
   workspace/Blueprint/resource IDs and initial deploy IDs. No R1-A
   coordinator action yet.
2. **Live API-shape and provider-state gate.** The first post-provision check
   runs the reviewed production-name-bound GET-only capture against the
   temporary workspace's exact Blueprint, web and two cron IDs. It must prove
   boolean top-level `autoDeploy`, string top-level `branch`/`dockerfilePath`,
   exact expected names/types, Blueprint Auto Sync false and every disposable
   service Auto Deploy **Off** (not After CI Checks Pass). A hard-fail is
   evidence, not permission to weaken parsing during the window.
3. **Provider exact-SHA proof.** Let both disposable crons build the reviewed
   `./Dockerfile` from the exact baseline ref without a caller-supplied Docker
   build arg. Manually run the inert cron command, which prints only
   `/app/platform-backend-sha`; require the exact rebased baseline SHA and bind
   it to the service/deploy/job IDs and logs. A build receipt without this
   container-level value is insufficient. Suspend both crons after saving the
   bounded receipts.
4. **Publish immutable baseline.** After confirming the remote branch still
   equals the exact rebased SHA and no run exists for it, dispatch `Platform
   release image` on `codex/r1a-rehearsal-baseline` exactly once with:

   | input | value |
   | --- | --- |
   | `publish` | `true` |
   | `feed_sha` | `61110cdd506f5364b015f8e2b0cd81c12fda46a1` |
   | `playables_sha` | `0960952a9fc7d2d7e6f3ae23b1dffe039d97ebb9` |
   | `swipe_platform_sha` | `a3a78562d6c71808e19d84bd1c23ab0cfaa0fc27` |
   | `code_min_revision` | `0069_arrows_runtime_variant` |
   | `code_max_revision` | `0070_published_test_delivery` |
   | `lkg_min_revision` | `0069_arrows_runtime_variant` |
   | `lkg_max_revision` | `0070_published_test_delivery` |
   | `lkg_kind` | `bootstrap-root` |
   | `lkg_build_run_id` | empty |
   | `lkg_image_digest` | empty |
   | `lkg_manifest_sha256` | empty |

   Record run ID, image digest and manifest SHA-256.
5. **Publish immutable candidate.** After confirming the remote candidate
   branch is still `c7c62ad893c361b78ddaba687e22254045525512` and no run exists
   for it, dispatch the workflow on
   `codex/r1a-review-r3-backend-fixes` exactly once with:

   | input | value |
   | --- | --- |
   | `publish` | `true` |
   | `feed_sha` | `61110cdd506f5364b015f8e2b0cd81c12fda46a1` |
   | `playables_sha` | `0960952a9fc7d2d7e6f3ae23b1dffe039d97ebb9` |
   | `swipe_platform_sha` | `a3a78562d6c71808e19d84bd1c23ab0cfaa0fc27` |
   | `code_min_revision` | `0070_published_test_delivery` |
   | `code_max_revision` | `0071_platform_release_receipts` |
   | `lkg_min_revision` | `0069_arrows_runtime_variant` |
   | `lkg_max_revision` | `0071_platform_release_receipts` |
   | `lkg_kind` | `image` |
   | `lkg_build_run_id` | exact successful baseline run ID |
   | `lkg_image_digest` | exact baseline `sha256:…` digest |
   | `lkg_manifest_sha256` | exact baseline manifest SHA-256 |

   Record the candidate run ID, digest and manifest SHA-256. Never repeat
   either dispatch for the same SHA; an infrastructure/flaky failure uses
   `gh run rerun --failed`, while a deterministic failure requires a new
   reviewed commit.
6. **Prepare source.** Through the reviewed cutover workflow and temporary
   GitHub environment, run `prepare-source` against the exact current
   disposable deploy CAS. Confirm it changes only the disposable web source,
   preDeploy/liveness settings and no application release variables.
7. **Candidate deploy.** Run `deploy` with the new exact current deploy CAS.
   Require predecessor→target migration, committed immutable DB receipt,
   one-off `verify-applied-db`, `/api/health` with `ok=true` and
   `island.bake_runtime.state=local`, and protective compact-image smoke.
8. **Replay and refusal proofs.** Re-run the exact preDeploy binding as a
   disposable one-off job and compare its printed receipt identity/SHA-256;
   exercise a stale source-CAS refusal through the reviewed workflow. Build a
   second locally verified manifest for the same candidate image/target but a
   distinct non-authoritative source identity, then run it only as an isolated
   one-off job under the already committed deploy identity; require typed
   `deploy_identity_conflict` and no changed DB/provider state.
9. **Forward-only rollback.** Run `rollback` through the same workflow and
   concurrency domain. Require the pinned baseline image to serve the newer
   `0071_platform_release_receipts` schema without downgrade, then rerun health
   and DB verification.
10. **Cleanup.** Suspend/delete disposable web, both crons and database;
    disconnect the temporary Blueprint; delete the temporary registry
    credential; revoke the Render key; delete temporary GitHub environment
    secrets/variables and the temporary environment itself; then delete the
    temporary Render workspace. Record cleanup timestamps and confirm every
    disposable resource ID is absent or terminally suspended/deleted.

## Required evidence packet

- exact IDs/SHA/digests for both image builds and their sidecars;
- provider capture before mutation; after the source switch, the coordinator
  receipt plus a bounded image-backed service snapshot (`env`/`imagePath`)
  replaces capture because Git-backed branch/Dockerfile fields no longer exist;
- cron provider-build receipt proving exact source identity;
- prepare-source, deploy, replay/refusal and rollback receipts;
- database revision before candidate, after candidate and after rollback;
- bounded health payloads and protective smoke;
- cleanup/revocation receipt;
- independent acceptance of the exact packet;
- an explicit separate operator GO before any backend/client/meta PR merge or
  production cutover action.
