# Variant B Phase 2 `prepare-source` — execution receipt

- Date: 06.08.2026.
- Owner/orchestrator: Codex Sol.
- Dispatch: operator, under the exact Phase 2-only GO recorded in the active
  task.
- Result: **PASS — source configuration prepared; no deploy or migration**.
- Route: `platform-reliability-variant-b-deploy-slice-v4-2026-08-05.md`,
  SHA-256
  `4041942bac4fbb86d918dfa040732e3f6a588110fd3343bfcbb722e377de3a53`.

The GO authorized exactly one `platform-release-cutover.yml` dispatch with
`operation=prepare-source`. Retry, deploy and migration were forbidden. This
receipt does not authorize Phase 3.

## Final pre-dispatch CAS

At `2026-08-06T05:34:06Z` the read-only preflight proved:

```text
swipe-backend/master = 0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4
cutover workflow blob = 87f41e6374fbe09aa97a97ee6a5f4b8c5cf9c4e1
coordinator blob = aab687696ba8439b51d82c61d759d0b55df37194
migration head = 0073_platform_release_receipts
feed pin = c1681d8044c28124be6d8e099a9a73849b59921e
playables pin = 67fedba6901cf492bc0d60ac051560e89d443f3b
swipe-platform pin = 12033fa72d0dfaba4bde49264e2d543bf19e928a
active cutover runs = []
environment secrets = [RENDER_API_KEY]
repository variables = exact six identities from route v4
environment branch policies = exactly [{name: master, type: branch}]
```

A fresh GET-only provider capture at `2026-08-06T05:34:08.582Z` returned
`PASS`, receipt SHA-256
`20cdf764d5a79ac1e9d5d7036eb2884d354f7ddc92ec1707c2e9f276ac296818`.
It still showed source-backed service configuration and exact live deploy
`dep-d9mtmabm8hqs73cighmg`; no known preview was running or successful.

## Exact dispatch

The operator dispatched once at `2026-08-06T05:36:07Z`:

```text
run = 31074614067
run attempt = 1
event = workflow_dispatch
ref = master
head SHA = 0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4
operation = prepare-source
candidate_build_run_id = 31028527617
candidate_manifest_sha256 = cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2
lkg_build_run_id = 30789375002
expected_current_deploy = dep-d9mtmabm8hqs73cighmg
```

The run completed `success` at `2026-08-06T05:36:44Z`. It was the only new
cutover run, and no rerun or second dispatch occurred.

## Downloaded coordinator authority

Artifact `platform-release-coordinator-31074614067-1`, artifact id
`8956986973`, contained exactly the bounded coordinator receipt and summary.
The downloaded receipt is stored outside git at
`/Users/gleb/secure/r1a/phase2-run-31074614067/`.

```text
artifact archive digest = sha256:c392bd5b7e4192ae422edc6fda019b0caae68adfbc2abd4b35314b0df24391ca
coordinator receipt SHA-256 = c1c58bb45ce0834401522773a35eba233c53cfaf337a0f9537348f760dd59c59
status = PASS
schema = platform-release-coordinator-receipt.v1
operation = prepare-source
coordinatorRun = gh-31074614067-1
serviceId = srv-d95r3bfavr4c73aqsi4g
fromDeployId = dep-d9mtmabm8hqs73cighmg
manifestSha256 = cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2
targetImageDigest = sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4
```

## Capture A

The reviewed GET-only verifier ran from fresh provider reads at
`2026-08-06T05:37:24.956Z` and returned `PASS`.

```text
secure receipt = /Users/gleb/secure/r1a/variant-b-capture-a-provider-capture.v1.json
receipt SHA-256 = aa966096dfa840da3c68034b4044142c059490b0c56d9d3f0978db8f17c049ab
service runtime = image
imagePath = ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4
registryCredentialId = rgc-d9np7tajnfac73bi5ib0
preDeployCommand = python -m app.platform_release predeploy-env
healthCheckPath = /api/health
autoDeploy = false
latest deploy = dep-d9mtmabm8hqs73cighmg, live
pendingPreviewIds = []
forbidden rollback authorization env keys = []
syncs SHA-256 = 395a2935142bcd3517e2c436b1663db5021dffe75ac0cc70da6c01ea10072cb9
```

Therefore Phase 2 changed only the future deployment source configuration. The
currently serving instance remains the old source-built deploy. Until Phase 3
is separately authorized and completes, Restart, Redeploy, ordinary Deploy,
Render UI edits and further provider API writes are forbidden.

## Next boundary

Before requesting Phase 3 GO:

1. operator enables Render 2FA; only the enabled state is observed;
2. Capture B performs fresh GETs and must equal Capture A after excluding only
   `observedAt` and the derived equality digest;
3. backend/GitHub/run CAS is repeated;
4. Phase 3 receives a separate operator GO.

The temporary credential deadline remains `2026-08-06T06:54:37Z`. Every
terminal Phase 3 outcome proceeds to the reviewed cleanup; no retry is implied.
