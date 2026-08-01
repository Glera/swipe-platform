# Platform Reliability R1-A — disposable rehearsal runbook

Status: prepared execution contract; **no external authority**. Creating a
Render/GitHub resource, publishing an image, dispatching a workflow or changing
provider state requires the operator's action-time confirmation. Production
Render resources are never mutation targets; the only shared production
namespace in rehearsal is the explicitly declared immutable GHCR package.

## Exact source set

| Role | Exact identity |
| --- | --- |
| rebased baseline backend | `1aee3e0bf596121d8d326951519d1f897e46ced1` on frozen new ref `codex/r1a-rehearsal-baseline-20260801` (`0070_published_test_delivery`) |
| rebased candidate backend | `c7c62ad893c361b78ddaba687e22254045525512` on frozen new ref `codex/r1a-rehearsal-candidate-20260801` (`0071_platform_release_receipts`) |
| rebased client guard | `e804c73d41f5e94401caa3bb5acb92f691866101` on durable new ref `codex/r1a-client-guard-20260801` |
| registration sentinel | `5ef857f493016501a0eaa733d174eb39ba221d2a` on new ref `codex/r1a-workflow-registration` |
| rehearsal Blueprint source | `183336a1765933e8707a26747b7baf60d5212c1e` on frozen new ref `codex/r1a-rehearsal-blueprint-20260801`; custom path `render.r1a-rehearsal.yaml` |
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
default-branch versions execute. The attended run selects the full workflow by
exact path and reviewed ref; the baseline run below is the fail-closed proof of
which version GitHub executes. This sentinel merge is not backend PR #33 and
grants no cutover authority.

The repository is private and presently on GitHub Free. Before the sentinel
merge or rehearsal, the operator must activate GitHub Pro (or move the exact
release contour to an approved Team organization). A read-only receipt must
then prove that private-repository environment secrets/variables and selected
deployment branches are available. Repository-scoped Render credentials are
not an accepted substitute: they would give every branch a strictly broader
authority than the production workflow contract.

The sentinel merge is itself a push to the production branch. Immediately
before it, run the same reviewed production provider capture required before
backend PR #33: Blueprint Auto Sync and Auto Deploy for the web plus both
surviving crons must be OFF, with exact stored branch/Dockerfile paths,
observation time and receipt SHA-256. Any unreadable/enabled state means no
merge. The receipt is fresh for one attended merge only and cannot be reused
for PR #33 later.

The baseline dispatch is the executable ref-semantics probe. Invoke the
workflow by exact path with `--ref codex/r1a-rehearsal-baseline-20260801`; the
path is `.github/workflows/platform-release-image.yml`. The run must report
that exact `head_sha` and execute the full image job. If the default-branch
refusal sentinel runs instead, or the selected SHA differs, rehearsal stops
before publication.

## Frozen ref publication

Do not rewrite the R4/R5-reviewed remote refs. After the follow-up delta review
accepts the local package, publish these new refs in this exact order and
record the remote value after each push:

1. backend baseline `codex/r1a-rehearsal-baseline-20260801` →
   `1aee3e0bf596121d8d326951519d1f897e46ced1`;
2. backend candidate `codex/r1a-rehearsal-candidate-20260801` →
   `c7c62ad893c361b78ddaba687e22254045525512`;
3. client evidence `codex/r1a-client-guard-20260801` →
   `e804c73d41f5e94401caa3bb5acb92f691866101`;
4. backend sentinel `codex/r1a-workflow-registration` →
   `5ef857f493016501a0eaa733d174eb39ba221d2a`;
5. meta evidence branch fast-forward → its accepted exact head, then create
   the immutable Blueprint source ref
   `codex/r1a-rehearsal-blueprint-20260801` at
   `183336a1765933e8707a26747b7baf60d5212c1e`.

Every new rehearsal ref is immutable after publication. A mismatch or later
movement requires a new review identity and a new ref name; no force-push is
permitted.

## Disposable provider set

Create a new temporary Render workspace first. The Blueprint source triple is
exact and non-default:

- repository: `Glera/p4g-workspace-meta`;
- frozen branch: `codex/r1a-rehearsal-blueprint-20260801`;
- custom Blueprint path: `render.r1a-rehearsal.yaml`.

Before clicking Deploy Blueprint, submit that exact file to Render's
mutation-free `POST /v1/blueprints/validate` for the new workspace owner ID.
The documented validation response must have `valid=true`, exact service names
`swipe-backend` / `swipe-seq-shadow-run` / `swipe-c1-materialize`, exact
database name `swipe-db`, empty key-value/environment-group sets and the exact
expected action count. This validates the uploaded bytes only; it does not
prove which Git repository/branch/path the Dashboard later binds or expose all
plan/region fields. Save the response bytes and SHA-256, then visually bind the
creation form to the exact source triple above. Another source or name/action
set is a stop-the-line failure.

This isolation permits the reviewed production-name-bound capture to verify
exact service names without accepting a production resource ID. Use the
validated file in that workspace and record every resulting opaque ID before
continuing:

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
- one temporary GHCR registry credential in that workspace using an
  operator-owned classic PAT with exactly `read:packages` (no `write:packages`,
  `delete:packages` or `repo`), bound by exact ID in the GitHub rehearsal
  environment; delete the credential and revoke the PAT during cleanup;
- one short-lived Render API key, revoked during cleanup;
- one temporary GitHub `production` environment, available only after the
  GitHub-plan prerequisite above, whose selected deployment branch is exactly
  `codex/r1a-rehearsal-candidate-20260801`, containing only disposable
  service/Blueprint/database/registry identities and the temporary Render key.

No production Render service, Blueprint, database, credential, environment
variable or deployment is a mutation target. Reusing a production provider ID
is a stop-the-line failure. The shared private package
`ghcr.io/glera/swipe-backend` is explicitly in scope for exactly two immutable
release versions tagged by the exact baseline/candidate backend SHA. Those
digests, provenance/SBOM attestations and 90-day sidecars are deliberately
retained as the rehearsed LKG/candidate for production cutover; they are not
disposable resources and are listed in the final evidence packet. Container
registry storage is currently free, but publication still requires the
operator's action-time confirmation.

## Attended sequence

0. **Authorize prerequisites and register the workflows.** Require the final
   local review GO, activate and verify GitHub Pro, then publish only the new
   immutable refs in the preceding order. Before any environment is created,
   save read-only GitHub API receipts proving the backend repository has no
   repository secret or variable whose name starts with `RENDER_`, and no
   pre-existing `production` environment. Open the inert sentinel PR. Run the
   fresh single-use production provider capture described above; only after it
   passes and the operator gives merge GO may the sentinel PR merge. Then
   record the Render GitHub App's repository access list. Confirm
   `Glera/swipe-backend` is already readable and grant additive read access to
   exactly `Glera/p4g-workspace-meta` if it is absent; never remove or replace
   an existing authorized repository. Record before/after state. If the App is
   already authorized for all repositories, record that no access mutation is
   needed. This shared GitHub authorization change is part of the action-time
   operator GO and happens only after the production provider gate.
1. **Provision only.** Create the disposable database, source-backed web and
   both crons only after
   `refs/heads/codex/r1a-rehearsal-baseline-20260801` on origin
   resolves to `1aee3e0bf596121d8d326951519d1f897e46ced1`. Save the temporary
   workspace/Blueprint/resource IDs and initial deploy IDs. No R1-A
   coordinator action yet. The Blueprint source ref is frozen before creation,
   so the brief initial Auto Sync window cannot observe changing bytes; set
   Auto Sync to **No** immediately after provisioning and require no unexpected
   sync/deploy in the sync history. Create the GitHub `production` environment
   in the production backend repository only after the disposable IDs/key are
   known; it must not pre-exist. Read-only GitHub API receipts must prove the
   selected-branch policy is exactly
   `codex/r1a-rehearsal-candidate-20260801`, its secret-name set is exactly
   `{RENDER_API_KEY}`, and its variable-name set is exactly
   `{RENDER_SERVICE_ID, RENDER_BLUEPRINT_ID, RENDER_OWNER_ID,
   RENDER_REGISTRY_CREDENTIAL_ID, PLATFORM_DATABASE_IDENTITY}`. Repeat the
   repository-level no-`RENDER_*` assertion after environment creation.
2. **Live API-shape and provider-state gate.** The first post-provision check
   runs the reviewed production-name-bound GET-only capture against the
   temporary workspace's exact Blueprint, web and two cron IDs. It must prove
   boolean top-level `autoDeploy`, string top-level `branch`/`dockerfilePath`,
   exact expected names/types, Blueprint Auto Sync false and every disposable
   service Auto Deploy **Off** (not After CI Checks Pass). A hard-fail is
   evidence, not permission to weaken parsing during the window. Save an
   attended dashboard screenshot bound to service IDs and observation time for
   the UI-only distinction between **Off** and **After CI Checks Pass**.
   Deterministically query the same three `GET /v1/services/{id}` resources and
   `GET /v1/postgres/{id}` into no-clobber JSON receipts, recording exact bytes
   and SHA-256. Require every owner ID to equal the new temporary workspace;
   every service branch to equal
   `codex/r1a-rehearsal-baseline-20260801`, every Dockerfile path to equal
   `./Dockerfile`, every service plan to equal `starter`, every region to equal
   `frankfurt`, both cron schedules to equal `0 0 1 1 *`, and the database to
   have name `swipe-db`, plan `free`, region `frankfurt` and database name
   `swipe_r1a_rehearsal`. In addition, run a deterministic `jq -e` assertion
   over the canonical provider-capture receipt for those exact branch/path
   values. An absent/unreadable/different field is a hard failure. These values
   distinguish the rehearsal source from production `render.yaml`, whose
   services use `master`, legacy `./Dockerfile.bake` and live schedules.
3. **Provider exact-SHA proof.** Let both disposable crons build the reviewed
   `./Dockerfile` from the exact baseline ref without a caller-supplied Docker
   build arg. Manually run the inert cron command, which prints only
   `/app/platform-backend-sha`; require the exact rebased baseline SHA and bind
   it to the service/deploy/job IDs and logs. A build receipt without this
   container-level value is insufficient. Suspend both crons after saving the
   bounded receipts.
4. **Publish immutable baseline.** After confirming the remote branch still
   equals the exact rebased SHA and no run exists for it, capture the account's
   current container-package inventory. Require `swipe-backend` to be absent
   or to contain no version/tag/digest outside an explicitly reviewed prior
   receipt; an unexplained existing version stops publication. Then dispatch
   `Platform release image` by exact workflow path on
   `codex/r1a-rehearsal-baseline-20260801` exactly once with:

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

   Record run ID, image digest and manifest SHA-256. Before publishing the
   candidate, prove the newly created package is private, inherits/is linked
   to `Glera/swipe-backend`, and contains only the exact baseline version.
   Compute the compressed byte size from its OCI manifest. Conservatively
   budget at least six candidate pulls plus two baseline pulls for deploy,
   one-off/replay/conflict and rollback; add the candidate size after step 5
   and stop if the projected external transfer exceeds the remaining GitHub
   Pro Packages allowance. Record the calculation and plan headroom.
5. **Publish immutable candidate.** After confirming the remote candidate
   branch is still `c7c62ad893c361b78ddaba687e22254045525512` and no run exists
   for it, dispatch the workflow by exact path on
   `codex/r1a-rehearsal-candidate-20260801` exactly once with:

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

   Record the candidate run ID, digest and manifest SHA-256. Never repeat or
   rerun a publishing workflow for the same SHA by default: a retry can collide
   with immutable artifact names or rewrite the SHA tag to another digest. If
   and only if the failed run proves that neither a package version nor an
   Actions artifact was created, a new independent recovery review may
   authorize `gh run rerun --failed`; otherwise a deterministic fix needs a
   new reviewed commit/ref. The general cheap-CI rerun rule does not override
   this release exception. Both Actions artifact sets expire after 90 days and
   the cutover workflow downloads them by run ID; therefore the production
   cutover deadline is 60 days after the older build, preserving a 30-day
   margin. Missing that deadline requires a new reviewed image pair/rehearsal,
   even though the GHCR digests themselves remain available.
6. **Prepare source.** Dispatch the reviewed cutover workflow by exact path and
   `--ref codex/r1a-rehearsal-candidate-20260801` through the temporary GitHub
   environment; the path is
   `.github/workflows/platform-release-cutover.yml`. Run `prepare-source`
   against the exact current disposable deploy CAS. Confirm it changes only
   the disposable web source, preDeploy/liveness settings and no application
   release variables.
7. **Candidate deploy.** Run `deploy` with the new exact current deploy CAS.
   Require predecessor→target migration, committed immutable DB receipt,
   one-off `verify-applied-db`, `/api/health` with `ok=true` and
   `island.bake_runtime.state=local`, and protective compact-image smoke. Save
   the exact bounded health JSON with its SHA-256 because the coordinator's
   internal health check proves only `ok`/`service`.
8. **Replay and refusal proofs.** Continue dispatching the exact candidate ref.
   Re-run the exact preDeploy binding as a disposable one-off job and compare
   its printed receipt identity/SHA-256; exercise a stale source-CAS refusal
   through the reviewed workflow. Build a
   second locally verified manifest for the same candidate image/target but a
   distinct non-authoritative source identity, then run it only as an isolated
   one-off job under the already committed deploy identity; require typed
   `deploy_identity_conflict` and no changed DB/provider state.
9. **Forward-only rollback.** Run `rollback` through the same exact candidate
   workflow ref and concurrency domain. Require the pinned baseline image to
   serve the newer `0071_platform_release_receipts` schema without downgrade,
   then rerun health and DB verification.
10. **Cleanup.** Suspend/delete disposable web, both crons and database;
    disconnect the temporary Blueprint; delete the temporary registry
    credential and revoke its `read:packages` PAT; revoke the Render key;
    delete temporary GitHub environment secrets/variables and the temporary
    environment itself; then delete the temporary Render workspace. Record
    cleanup timestamps and confirm every
    disposable resource ID is absent or terminally suspended/deleted. Do not
    delete the two rehearsed GHCR versions or their sidecars after PASS: they
    remain pinned to the later production cutover. If rehearsal is rejected,
    deletion is a separate operator decision recorded against the exact
    package version IDs. If step 0 added meta-repository access to the Render
    GitHub App, remove exactly that one additive grant and prove the original
    access list is restored; never alter the pre-existing backend grant. Repeat
    the repository-level secret/variable inventory and require no `RENDER_*`
    name, plus prove the temporary `production` environment is absent.

## Required evidence packet

- exact IDs/SHA/digests for both image builds and their sidecars;
- exact GHCR package version IDs/tags/digests, visibility/access state and the
  explicit retained-for-cutover decision;
- provider capture plus discriminating service/database inventory before
  mutation; after the source switch, use only evidence already emitted by the
  reviewed coordinator: the `prepare-source` workflow log bound to its
  run/attempt and receipt proves the PATCH response's exact image-backed
  `env`/`imagePath`, while the later `deploy` log binds its fresh-GET
  `env == image` check to the deploy receipt. The deploy is issued by exact
  digest; no claim is made that a fresh-GET `imagePath` is stored in a receipt;
- cron provider-build receipt proving exact source identity;
- prepare-source, deploy, replay/refusal and rollback receipts;
- database revision before candidate, after candidate and after rollback;
- bounded health payloads and protective smoke;
- cleanup/revocation receipt;
- independent acceptance of the exact packet;
- an explicit separate operator GO before any backend/client/meta PR merge or
  production cutover action.
