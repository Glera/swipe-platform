# Platform Reliability R1-A — disposable rehearsal runbook

Status: **corrective disposable contract fully executed; no production
authority**. Exact candidate-v7 deploy, refusal proofs, forward-only rollback,
resource cleanup and credential revocation all passed under the recorded
R12/operator GO and USD 3 ceiling. Independent review of exact evidence commit
`1c2a1ec` returned GO with no P1/P2. Production Render resources were never mutation targets; the
only shared production namespace is the explicitly retained immutable GHCR
package.

## Exact source set

| Role | Exact identity |
| --- | --- |
| provider source-build baseline | `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725` on frozen successor ref `codex/r1a-rehearsal-baseline-v2-20260801` (`0070_published_test_delivery`); this remains the already-proved Blueprint/web/cron source identity |
| immutable image baseline | `8cb8239e04bf30f54f7fe1f85758da8f4fe7caac` on frozen final ref `codex/r1a-rehearsal-baseline-v4-20260801` (`0070_published_test_delivery` + Buildx attestation-driver fix + reviewed raw-Render-URL driver normalization) |
| immutable image candidate | `9d3dc995b5f2976acbf18d3bac62ad3fc138f022` on frozen final ref `codex/r1a-rehearsal-candidate-v7-20260801` (`0071_platform_release_receipts` + executable authority separation, compensating env CAS/retry, bounded live-command failures, Buildx fix and the same URL normalization) |
| rebased client guard | `e804c73d41f5e94401caa3bb5acb92f691866101` on durable new ref `codex/r1a-client-guard-20260801` |
| registration sentinel | `5ef857f493016501a0eaa733d174eb39ba221d2a` on new ref `codex/r1a-workflow-registration` |
| rehearsal Blueprint source | frozen successor ref `codex/r1a-rehearsal-blueprint-v2-20260801`; exact ref SHA is bound by `platform-reliability-r1a-blueprint-v2-publication-receipt-20260801.md`; reviewed `render.r1a-rehearsal.yaml` blob `809aa531176f44890f72dfa4953ee36148113629`, SHA-256 `4361c8c826f6868de1d9bd34b2050fc0af1d05e2fa1974f2c832e8790b2c6710` |
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

The successor backend ranges were rebased onto backend
`9277047852c0d73f4d3b9a081e1b0b586f48ae3c`; the client default branch remains
`96780f55a28e2fdf98d33290a87e1865431826c8`, so the accepted client guard ref
did not move. The final v4/v7 pair adds no migration or product behavior beyond
the accepted release boundary; it combines the Buildx `docker-container`
driver required for SBOM/provenance attestations with the reviewed normalization
of Render's raw PostgreSQL URL at release-tooling engine creation sites. The
final targeted release suite is `40 passed`; both Mission guards and workflow
YAML checks pass. Earlier recovery acceptance remains recorded in
`platform-reliability-r1a-buildx-recovery-receipt-20260801.md`.
The accepted v2 source-range acceptance remains `74 passed, 3 skipped` for the
candidate and `39 passed, 3 skipped` for the baseline; the client guard
mutants/build remain accepted. Independent post-sentinel review returned GO
for this exact successor source set. Its one P3 forbids opening the baseline as
a PR or dispatching full PostgreSQL acceptance against it; the authorized
baseline image workflow does not contain that orphaned migration-test leg.
External execution remains separately gated below.

The first authorized baseline publication, run `30707737253` at source SHA
`0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`, failed before producing any
package version or Actions artifact because the workflow requested
attestations while still using Docker's unsupported default driver. It is
never rerun. The exact failure, absence proofs, 11-line Buildx recovery delta
and independent Claude GO are recorded in
`platform-reliability-r1a-buildx-recovery-receipt-20260801.md`. The new image
refs above are immutable successors; the already-proved provider source-build
ref remains v2 and is not rewritten.

The feed input is the exact `feedCommit` in the public release archive at the
listed `swipe-platform` SHA. It is not mislabeled as the client-guard review
head; those are separate identities in the manifest.

### Executed recovery chain

The first attended workspace proved the coordinator and rollback path but only
deployed candidate v6. Independent final-audit R1 correctly rejected that as
insufficient coverage for the retained v7 image. Its history remains in the
R1 disposition; it is not the final execution authority.

The corrective workspace then ran the complete final pair: prepare exact
candidate-v7 source, deploy the exact retained candidate-v7 digest, advance
`0070_published_test_delivery` to `0071_platform_release_receipts`, replay the
durable receipt, prove stale-CAS and conflicting-binding refusal, and deploy
exact baseline-v4 forward-only while leaving the database at `0071`. Candidate
and rollback health responses were byte-identical. The complete bounded matrix
and cleanup receipts are in
`platform-reliability-r1a-rehearsal-runtime-receipt-20260801.md`.

An expired `read:packages` PAT caused the first corrective prepare-source run
to fail closed before mutation. After replacing it with a one-day,
`read:packages`-only PAT, the same reviewed operation passed. Both the expired
and replacement PATs, the Render API key, the registry credential, GitHub
environment and every disposable Render resource/workspace were then removed
and independently probed absent.

## Default-branch registration prerequisite

GitHub requires a `workflow_dispatch` workflow file on the default branch even
when another exact ref is selected. Registration PR #45 has been merged as
`9277047852c0d73f4d3b9a081e1b0b586f48ae3c`; its default-branch sentinels have
no checkout, secrets, environment, package write or provider authority and
always refuse execution. The attended run selects the full workflow from the
reviewed successor ref. The baseline run below is the fail-closed proof of
which version GitHub executes.

The private-repository plan prerequisite is satisfied. The pre-merge provider
window is recorded by
`platform-reliability-r1a-sentinel-merge-receipt-20260801.md`; the accepted
post-merge capture is
`platform-reliability-r1a-production-provider-capture-20260801.json` with
receipt SHA-256
`2522351f7774605d0032b959824adce5e28fb767ddc970e4c4170c41ef13a79f`.
That receipt is historical evidence for the sentinel merge only and is not a
substitute for the fresh production gate required before PR #33 cutover.

The successful final baseline dispatch is the executable ref-semantics probe.
Invoke the workflow by exact path with
`--ref codex/r1a-rehearsal-baseline-v4-20260801`; the
path is `.github/workflows/platform-release-image.yml`. The run must report
that exact `head_sha` and execute the full image job. If the default-branch
refusal sentinel runs instead, or the selected SHA differs, rehearsal stops
before publication.

## Frozen ref publication

Do not rewrite any reviewed remote ref. The two backend successors, unchanged
client evidence and sentinel are already published and were resolved back from
origin. The Blueprint successor is published only after the final contract
delta is committed. The publication ledger is:

1. provider source baseline `codex/r1a-rehearsal-baseline-v2-20260801` →
   `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`;
2. immutable image baseline `codex/r1a-rehearsal-baseline-v4-20260801` →
   `8cb8239e04bf30f54f7fe1f85758da8f4fe7caac`;
3. immutable image candidate `codex/r1a-rehearsal-candidate-v7-20260801` →
   `9d3dc995b5f2976acbf18d3bac62ad3fc138f022` after independent recovery acceptance;
4. client evidence `codex/r1a-client-guard-20260801` →
   `e804c73d41f5e94401caa3bb5acb92f691866101`;
5. backend sentinel `codex/r1a-workflow-registration` →
   `5ef857f493016501a0eaa733d174eb39ba221d2a`;
6. meta evidence branch fast-forward → its accepted exact head, then create
   the immutable Blueprint source ref
   `codex/r1a-rehearsal-blueprint-v2-20260801`; its exact SHA and
   `render.r1a-rehearsal.yaml` SHA-256 are recorded in the v2 publication
   receipt named in the source table. The receipt must also reproduce the
   reviewed YAML blob and SHA-256 in that table.

Every new rehearsal ref is immutable after publication. A mismatch or later
movement requires a new review identity and a new ref name; no force-push is
permitted.

## Disposable provider set

Create a new temporary Render workspace first. The Blueprint source triple is
exact and non-default:

- repository: `Glera/p4g-workspace-meta`;
- frozen branch: `codex/r1a-rehearsal-blueprint-v2-20260801`;
- custom Blueprint path: `render.r1a-rehearsal.yaml`.

Before clicking Deploy Blueprint, first prove that the selected destination is
the newly created temporary workspace: record its exact owner ID; use
authenticated read-only inventory calls to require zero existing services and
zero databases in that owner; and save the bounded response bytes plus
SHA-256. The dashboard destination shown at click time must display that same
owner/workspace. A non-empty inventory, unreadable owner, mismatched owner ID
or production owner is a stop-the-line failure before Blueprint validation or
deployment.

Then submit that exact file to Render's
mutation-free `POST /v1/blueprints/validate` for the new workspace owner ID.
The documented validation response must have `valid=true`, exact service names
`swipe-backend` / `swipe-seq-shadow-run` / `swipe-c1-materialize`, exact
database name `swipe-db`, empty key-value/environment-group sets and exactly
four create actions (one database plus three services). This validates the
uploaded bytes only; it does not
prove which Git repository/branch/path the Dashboard later binds or expose all
plan/region fields. Save the response bytes and SHA-256, then visually bind the
creation form to both the exact source triple above and the already proven
empty destination owner. Another source, owner or name/action set is a
stop-the-line failure.

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
- one short-lived Render API key, revoked during cleanup. The key is
  user/account authority across every Render workspace visible to that
  account, not a credential scoped to the disposable workspace. Immediately
  before use, list and record every visible owner/workspace; none of the known
  production resource IDs may appear in the GitHub environment values or any
  mutation target. Exact disposable IDs, the selected-branch environment and
  provider CAS checks are compensating controls, not least privilege. The
  operator must explicitly accept this blast radius for the attended window;
- one temporary GitHub `production` environment, available only after the
  GitHub-plan prerequisite above, whose selected deployment branch is exactly
  `codex/r1a-rehearsal-candidate-v7-20260801`, containing only disposable
  service/Blueprint/database/registry identities and the temporary Render key.

The reviewed coordinator requires an environment-owned
`PLATFORM_RELEASE_AUTHORITY_SCOPE`. For rehearsal it must be exactly
`rehearsal`: the executable gate rejects the known production owner,
Blueprint and web-service IDs and requires database identity
`r1a-rehearsal-20260801` before constructing the Render client. Production
scope is deliberately unavailable in this rehearsal successor until a later,
separately reviewed cutover-only change pins the exact production registry
credential ID in addition to the captured production owner/Blueprint/web/
database tuple. An arbitrary registry credential cannot pass production
scope. The exact reviewed code SHA, not this prose alone, is the authority
boundary.

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

0. **Reconfirm prerequisites and provider boundaries.** The successor backend
   refs have independent GO and are published immutably; the Blueprint ref is
   published only after this final contract delta is committed. The GitHub plan
   and default-branch registration prerequisites are satisfied. Before any
   disposable environment is created, save fresh read-only GitHub API receipts
   proving the backend repository has no repository secret or variable whose
   name starts with `RENDER_`, and no pre-existing `production` environment.
   Record the Render GitHub App's repository access list. Confirm
   `Glera/swipe-backend` is already readable and grant additive read access to
   exactly `Glera/p4g-workspace-meta` if it is absent; never remove or replace
   an existing authorized repository. Record before/after state. If the App is
   already authorized for all repositories, record that no access mutation is
   needed. This shared GitHub authorization change is part of the action-time
   operator GO and happens only after the production provider gate. Record the
   expected remaining GitHub Actions and package-transfer cost before starting
   the two-build sequence.
   Before creating the Render API key, record its account-wide blast radius
   and the complete owner/workspace inventory. The action-time GO must name
   that scope explicitly; a generic "temporary key" approval is insufficient.
   Immediately after key creation and before its first mutating call, run the
   GET-only provider capture against the known production Blueprint/web/crons
   and a bounded GET/projection for the known production database. Save the
   canonical receipts and SHA-256. This is the pre-window half of the
   production non-target proof; it never substitutes for the executable deny
   gate.
1. **Provision only.** Create the disposable database, source-backed web and
   both crons only after
   `refs/heads/codex/r1a-rehearsal-baseline-v2-20260801` on origin
   resolves to `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`, and the origin
   `refs/heads/codex/r1a-rehearsal-blueprint-v2-20260801` resolves to the exact
   SHA, YAML blob and SHA-256 in
   `platform-reliability-r1a-blueprint-v2-publication-receipt-20260801.md`.
   Save the temporary
   workspace/Blueprint/resource IDs and initial deploy IDs. No R1-A
   coordinator action yet. The Blueprint source ref is frozen before creation,
   so the brief initial Auto Sync window cannot observe changing bytes; set
   Auto Sync to **No** immediately after provisioning and require no unexpected
   sync/deploy in the sync history. Create the GitHub `production` environment
   in the production backend repository only after the disposable IDs/key are
   known; it must not pre-exist. Read-only GitHub API receipts must prove the
   selected-branch policy is exactly
   `codex/r1a-rehearsal-candidate-v7-20260801`, its secret-name set is exactly
   `{RENDER_API_KEY}`, and its variable-name set is exactly
   `{RENDER_SERVICE_ID, RENDER_BLUEPRINT_ID, RENDER_OWNER_ID,
   RENDER_REGISTRY_CREDENTIAL_ID, PLATFORM_DATABASE_IDENTITY,
   PLATFORM_RELEASE_AUTHORITY_SCOPE}`. Repeat the
   repository-level no-`RENDER_*` assertion after environment creation. Read
   each environment variable value and require it to equal the recorded
   disposable service/Blueprint/workspace/registry IDs and exact database
   identity `r1a-rehearsal-20260801`; authority scope must equal `rehearsal`;
   names alone are insufficient.
2. **Live API-shape and provider-state gate.** The first post-provision check
   runs the reviewed production-name-bound GET-only capture against the
   temporary workspace's exact Blueprint, web and two cron IDs. It must prove
   one of the two accepted strict Render response shapes: boolean top-level
   `autoDeploy` with top-level `dockerfilePath`, or the observed string enum
   `autoDeploy="no"` plus `autoDeployTrigger="off"` with Dockerfile path under
   `serviceDetails.envSpecificDetails`. It must also prove exact expected
   names/types, Blueprint Auto Sync false and every disposable service Auto
   Deploy **Off** (not After CI Checks Pass). In the observed nested/string
   provider shape the parser checks `autoDeployTrigger="off"` live but the
   canonical receipt intentionally normalizes it to `autoDeploy:false`; the
   attended screenshot retains the provider-label evidence. A hard-fail is
   evidence, not permission to weaken parsing during the window. Save an
   attended dashboard screenshot bound to service IDs and observation time for
   the UI-only distinction between **Off** and **After CI Checks Pass**.
   Deterministically query the same three `GET /v1/services/{id}` resources and
   `GET /v1/postgres/{id}` into no-clobber JSON receipts, recording exact bytes
   and SHA-256. A deterministic `jq -e` assertion over every raw service
   receipt must require the expected branch and either the accepted boolean
   top-level shape (`autoDeploy == false`, top-level Dockerfile path) or the
   observed string/nested shape (`autoDeploy == "no"`,
   `autoDeployTrigger == "off"`, nested Dockerfile path). Require every owner
   ID to equal the new temporary workspace;
   every service branch to equal
   `codex/r1a-rehearsal-baseline-v2-20260801`, every Dockerfile path to equal
   `./Dockerfile`, every service plan to equal `starter`, every region to equal
   `frankfurt`, both cron schedules to equal `0 0 1 1 *`, and the database to
   have name `swipe-db`, plan `free`, region `frankfurt` and database name
   `swipe_r1a_rehearsal`. In addition, run a deterministic `jq -e` assertion
   over the canonical provider-capture receipt for those exact branch/path
   values. An absent/unreadable/different field is a hard failure. These values
   distinguish the rehearsal source from production sources: production
   `master` uses `./Dockerfile.bake` with live schedules, while the later R1-A
   candidate uses `./Dockerfile` but retains different schedules/database plan;
   neither pins the dated rehearsal branch.
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
   `codex/r1a-rehearsal-baseline-v4-20260801` exactly once with:

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
   branch is still `9d3dc995b5f2976acbf18d3bac62ad3fc138f022` and no run exists
   for it, dispatch the workflow by exact path on
   `codex/r1a-rehearsal-candidate-v7-20260801` exactly once with:

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
   `--ref codex/r1a-rehearsal-candidate-v7-20260801` through the temporary GitHub
   environment; the path is
   `.github/workflows/platform-release-cutover.yml`. Run `prepare-source`
   against the exact current disposable deploy CAS. Confirm it changes only
   the disposable web source, preDeploy/liveness settings and no application
   release variables.
7. **Candidate deploy.** Run `deploy` with the new exact current deploy CAS.
   From the second source-CAS read until the deploy POST returns, no operator,
   automation or other credential may use the Render UI/API to deploy or alter
   the disposable service. The GitHub concurrency group serializes coordinator
   runs, but Render offers no atomic `deploy-if-current` endpoint: this is an
   explicit residual CAS-to-POST race, not a claim of complete atomicity. Any
   unexpected latest-deploy change stops the rehearsal and triggers provider/
   env reconciliation before another attempt.
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

   These two one-off proofs are not additional coordinator runs. A coordinator
   run derives a new deploy identity from its GitHub run/attempt, whereas
   exact replay and conflicting reuse must exercise the already committed
   identity. Render's documented create-job contract snapshots the base
   service's latest successful build and all configured environment variables;
   it does not accept per-job environment overrides
   (<https://render.com/docs/one-off-jobs>). Execute the proofs as follows:

   1. save the current candidate release env values in a permission-restricted
      temporary file outside the repository; publish only their key set and
      SHA-256 bindings, never manifest base64 or credentials;
   2. create a one-off job whose only command is
      `python -m app.platform_release predeploy-env`; require success and the
      exact receipt SHA-256 printed by the original candidate preDeploy;
   3. build a canonical conflict manifest with the frozen candidate CLI and
      exact candidate/LKG sidecars, changing only `sources.feed.sha` to a
      declared non-authoritative 40-hex identity; compare parsed objects after
      deleting that one path and require equality, then record both manifest
      SHA-256 values;
   4. while Auto Deploy remains Off, update only
      `PLATFORM_RELEASE_MANIFEST_B64` and
      `PLATFORM_RELEASE_MANIFEST_SHA256` on the disposable web service. Do not
      change `PLATFORM_DEPLOY_IDENTITY`, database identity, operation, image or
      rollback authorization. Create the conflict one-off job, then restore
      both original manifest values immediately after Render returns the job
      ID; the job has already captured its immutable environment snapshot;
   5. require the conflict job to terminate with the exact bounded log token
      `platform-release: deploy_identity_conflict`. A timeout, success or any
      earlier identity/manifest error is a failed proof;
   6. after restoration, prove the service env key/value digests, latest deploy
      ID, image binding and database revision equal the pre-proof snapshot, and
      run `verify-applied-db` once more as a disposable one-off job.

   The temporary file containing restorable env values is deleted only after
   restoration is independently re-read. Failure to restore is a cleanup
   failure and blocks rehearsal PASS.

   The coordinator independently snapshots all seven application release env
   keys and retries each compensating PUT/DELETE up to three times. If it emits
   `release_env_restore_failed`, stop immediately: do not deploy, preserve the
   pre-run snapshot, keep Auto Deploy Off, restore every key to its exact prior
   presence/value manually, and re-read all seven values plus the latest deploy
   ID. If exact restoration cannot be proved, suspend/delete the disposable web
   service, record typed rehearsal failure, and do not claim PASS. This recovery
   path never authorizes a production mutation.
9. **Forward-only rollback.** Run `rollback` through the same exact candidate
   workflow ref and concurrency domain. Require the pinned baseline image to
   serve the newer `0071_platform_release_receipts` schema without downgrade,
   then rerun health and DB verification.
10. **Cleanup.** Delete the temporary GitHub environment
    secret/variables/environment; suspend/delete disposable web, both crons
    and database; disconnect/delete the temporary Blueprint; delete the
    temporary registry credential and revoke its `read:packages` PAT; then
    delete the disposable Render workspace. While the Render key is still
    valid, require every disposable ID to be absent or terminally deleted and
    repeat the same GET-only production provider/database projections used
    before the window. Compare canonical production projections after removing
    only observation timestamps and require byte equality. Revoke the
    account-wide Render API key **last**, then verify revocation. Record
    cleanup timestamps. Do not
    delete the two rehearsed GHCR versions or their sidecars after PASS: they
    remain pinned to the later production cutover. If rehearsal is rejected,
    deletion is a separate operator decision recorded against the exact
    package version IDs. If step 0 added meta-repository access to the Render
    GitHub App, remove exactly that one additive grant and prove the original
    access list is restored; never alter the pre-existing backend grant. Repeat
    the repository-level secret/variable inventory and require no `RENDER_*`
    name, plus prove the temporary `production` environment is absent. The
    evidence claim is precise: the reviewed rehearsal coordinator could not
    target the captured production identities, and their normalized boundary
    state is unchanged; before/after equality alone is not described as a
    complete provider audit log.

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
- executable rehearsal-authority rejection tests plus byte-equal normalized
  production provider/database projections from immediately before and after
  the attended window;
- independent acceptance of the exact packet;
- an explicit separate operator GO before any backend/client/meta PR merge or
  production cutover action.
