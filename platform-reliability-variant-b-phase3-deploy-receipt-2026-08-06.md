# Variant B Phase 3 deploy and cleanup — execution receipt

- Date: 06.08.2026.
- Owner/orchestrator: Codex Sol.
- Production dispatch and credential controls: operator.
- Route: `platform-reliability-variant-b-deploy-slice-v4-2026-08-05.md`,
  SHA-256
  `4041942bac4fbb86d918dfa040732e3f6a588110fd3343bfcbb722e377de3a53`.
- Result: **PASS — candidate live, DB verified at 0073, health PASS, credential
  cleanup PASS**.

The operator GO authorized exactly one `operation=deploy` dispatch. It allowed
the reviewed preDeploy migration `0070→0073` and one production deploy. Retry,
rollback, a second dispatch and manual Render changes were forbidden. Terminal
cleanup was mandatory at every outcome.

## Final Phase 3 preconditions

Before the GO, a read-only Render DOM observation showed the Two-Factor
Authentication switch checked with state `Enabled`. No seed, code or recovery
material was read or retained.

Fresh Capture B ran at `2026-08-06T05:41:45.340Z` and returned `PASS`:

```text
secure receipt = /Users/gleb/secure/r1a/variant-b-capture-b-provider-capture.v1.json
receipt SHA-256 = 67a40d6e094ba5c551070e205f1117e9b84422e5ef1396837a9f34a82c1bbdc9
equalCaptureSha256 = aa966096dfa840da3c68034b4044142c059490b0c56d9d3f0978db8f17c049ab
latest deploy = dep-d9mtmabm8hqs73cighmg, live
syncs SHA-256 = 395a2935142bcd3517e2c436b1663db5021dffe75ac0cc70da6c01ea10072cb9
```

The equality digest binds Capture B to the Phase 2 Capture A receipt. Every
provider projection other than the capture timestamp matched.

The final GitHub CAS at `2026-08-06T05:46:14Z` proved:

```text
swipe-backend/master = 0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4
active cutover runs = []
only prior window run = Phase 2 run 31074614067, success
environment secrets = exactly [RENDER_API_KEY]
repository variables = exact six identities from route v4
RENDER_BLUEPRINT_ID = exs-d95qo3q8qa3s73ea23p0
```

## Exact deploy dispatch

The operator dispatched once at `2026-08-06T05:46:35Z`:

```text
run = 31075139056
run attempt = 1
event = workflow_dispatch
ref = master
head SHA = 0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4
operation = deploy
candidate_build_run_id = 31028527617
candidate_manifest_sha256 = cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2
lkg_build_run_id = 30789375002
expected_current_deploy = dep-d9mtmabm8hqs73cighmg
```

The run completed `success` at `2026-08-06T05:48:20Z`. It was the only Phase 3
run. There was no rerun, rollback or second dispatch.

## Downloaded coordinator authority

Artifact `platform-release-coordinator-31075139056-1`, artifact id
`8957208266`, is stored outside git at
`/Users/gleb/secure/r1a/phase3-run-31075139056/`.

```text
artifact archive digest = sha256:3563ba065b3969213756592cbafc7b1bce2e673a371f0baa356d5a07c944260c
coordinator receipt SHA-256 = f362d0ed7a627a2ca6ad355653d4c5b06019be72fe5360fa1de5eeca75029644
status = PASS
schema = platform-release-coordinator-receipt.v1
operation = deploy
coordinatorRun = gh-31075139056-1
fromDeployId = dep-d9mtmabm8hqs73cighmg
toDeployId = dep-d9q1vo7avr4c73akv7k0
verificationJobId = job-d9q202e1egvs73d5bdbg
manifestSha256 = cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2
targetImageDigest = sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4
```

## Production acceptance

Read-only provider evidence showed candidate deploy
`dep-d9q1vo7avr4c73akv7k0` `live`; the old source deploy became `deactivated`.
The new deploy names the exact candidate image ref and immutable registry
digest.

Verification job `job-d9q202e1egvs73d5bdbg` ran from
`2026-08-06T05:47:53Z` through `2026-08-06T05:48:07Z` and finished
`succeeded`. At exact backend `0e9e940`, the coordinator creates this job with
the fixed command:

```text
python -m app.platform_release verify-applied-db
```

That pinned command succeeds only after all of the following database checks:

- the committed `platform_release_receipts` row exists for deploy identity
  `gh-31075139056-1`;
- its manifest, image, database identity and schema-capability bindings match;
- the live Alembic revision equals manifest target
  `0073_platform_release_receipts`.

Thus the successful exact verification job is the DB revision and release
receipt evidence required by route v4; no inference from workflow status alone
is used.

Fresh post-deploy provider capture at `2026-08-06T05:49:11.421Z` returned
`PASS`:

```text
secure receipt = /Users/gleb/secure/r1a/variant-b-post-deploy-provider-capture.v1.json
receipt SHA-256 = e148d7ed381e1a7fbdd58375d73c89946056b3735767df7f1d83e94f1c5f4c0f
service runtime = image
imagePath = ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4
latest deploy = dep-d9q1vo7avr4c73akv7k0, live
pendingPreviewIds = []
forbidden rollback authorization env keys = []
syncs SHA-256 = 395a2935142bcd3517e2c436b1663db5021dffe75ac0cc70da6c01ea10072cb9
```

Public `GET https://swipe-backend-541t.onrender.com/api/health` returned HTTP
200 with `ok=true` and `service=swipe-backend` both before and after cleanup.

The applied service identity contains exactly the five expected release keys:

```text
PLATFORM_DATABASE_IDENTITY
PLATFORM_DEPLOY_IDENTITY
PLATFORM_RELEASE_MANIFEST_B64
PLATFORM_RELEASE_MANIFEST_SHA256
PLATFORM_RELEASE_OPERATION
```

Neither rollback-authorization key is present. These five applied-release
identity values remain until a separately reviewed later release replaces
them.

## Terminal credential cleanup

The operator revoked only Render key `r1a-variant-b-window-20260806`, visible
prefix `rnd_79UyEF…`. Using the exact retained bytes after revocation, exact
`GET https://api.render.com/v1/users` returned HTTP **401**.

The operator then deleted only GitHub environment secret `RENDER_API_KEY`.
Read-only GitHub verification showed:

```text
environment secrets = []
repository variables = exactly 6
```

The six retained variables are non-secret release identities. The local holder
`/Users/gleb/secure/r1a/variant-b-render-key` was deleted. A bounded scan of
`/Users/gleb/secure/r1a` found zero files matching the holder bytes. No secret
value or reusable digest is recorded in this receipt.

Terminal cleanup is **PASS**. Blueprint previews, hooks and SSH keys were not
touched by this window.

## Handoff

The Variant B recovery route is complete. The next independently reviewed
package is `minesweeper-feed-roster-packet-2026-08-05.md`: mapping dry-run and
apply, roster register dry-run and apply, then exact CAS activation. Minesweeper
is intentionally not required to appear until that package completes.
