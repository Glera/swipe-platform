# Variant B credential preparation — execution receipt

- Date: 06.08.2026.
- Owner/orchestrator: Codex Sol.
- External credential actions: operator.
- Authority: operator GO for credential preparation only, followed by the
  independent conditional GO recorded in
  `platform-reliability-variant-b-credential-preparation-review-2026-08-06.md`.
- Result: **PASS — credential preparation complete; Phase 2 remains
  unauthorized**.

This receipt records read-only verification around credential preparation. It
grants no workflow dispatch, Render service mutation, deploy, migration,
roster write or activation.

## Bound authority

```text
route SHA-256 = 4041942bac4fbb86d918dfa040732e3f6a588110fd3343bfcbb722e377de3a53
capture tool SHA-256 = dc8f1d46cda2f173df1cabb70457c099cf25da8d5aff847e144d6d523870a25f
backend master = 0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4
candidate manifest SHA-256 = cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2
candidate image = ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4
```

## Armed window

The operator created exactly one temporary account-wide Render API key at
`2026-08-06T05:24:37Z`. The 90-minute credential deadline is therefore
`2026-08-06T06:54:37Z`.

Read-only dashboard observation after creation showed exactly one API-key row:

```text
name = r1a-variant-b-window-20260806
visible prefix = rnd_79UyEF…
row count = 1
```

The retained plaintext exists only in
`/Users/gleb/secure/r1a/variant-b-render-key`, mode `0600`, size 32 bytes.
Neither the bytes nor a reusable digest of them is recorded in git or chat.
The dashboard still displayed `Last used: Never` immediately after the probe;
that lagging label is not used as evidence of either use or non-use.

With the retained bytes, exact `GET https://api.render.com/v1/users` returned
HTTP 200 before any GitHub write or production-service mutation.

## Pre-window provider capture

The reviewed GET-only capture ran at `2026-08-06T05:25:45.293Z` and returned
`PASS`.

```text
secure receipt = /Users/gleb/secure/r1a/variant-b-pre-window-provider-capture.v1.json
mode = 0600
receipt SHA-256 = 4f8a0fce51d06b696b7ed0e159dca66e4d3e8e89ff0554435a61bf066d2a931c
syncs SHA-256 = 395a2935142bcd3517e2c436b1663db5021dffe75ac0cc70da6c01ea10072cb9
env pages = 2
sync pages = 1
```

The receipt proves the following sampled state:

```text
Blueprint = exs-d95qo3q8qa3s73ea23p0, paused, autoSync=false
service = srv-d95r3bfavr4c73aqsi4g, runtime=docker, autoDeploy=false
service imagePath = null
service registryCredentialId = null
service preDeployCommand = null
service healthCheckPath = /api/health
latest deploy = dep-d9mtmabm8hqs73cighmg, live
forbidden rollback authorization env keys = []
```

Both known preview IDs were requested explicitly. The API returned neither in
its sync listing and `pendingPreviewIds=[]`. As established by the reviewed
route, API absence does not prove deletion; both previews remain accepted
residual state and must never be approved.

## GitHub state after operator write

Read-only GitHub API verification at `2026-08-06T05:28:44Z` showed:

```text
environment = production
deployment branch policy = exactly [{name: master, type: branch, id: 56600753}]
environment secrets = exactly [RENDER_API_KEY]
RENDER_API_KEY updated_at = 2026-08-06T05:26:42Z
repository variables = exactly 6
RENDER_SERVICE_ID = srv-d95r3bfavr4c73aqsi4g
RENDER_BLUEPRINT_ID = exs-d95qo3q8qa3s73ea23p0
RENDER_OWNER_ID = tea-d1m4lmali9vc73euvelg
RENDER_REGISTRY_CREDENTIAL_ID = rgc-d9np7tajnfac73bi5ib0
PLATFORM_DATABASE_IDENTITY = swipe-production
PLATFORM_RELEASE_AUTHORITY_SCOPE = production
```

The secret plaintext is not readable through GitHub and was not emitted.

## Negative evidence and next boundary

At the final read-only check:

- `swipe-backend/master` still equalled exact `0e9e940`;
- the newest `platform-release-cutover.yml` run was still the historical
  02.08 run; no credential-window dispatch exists;
- no Render service write, deploy or migration was performed by this packet;
- production remained on live deploy `dep-d9mtmabm8hqs73cighmg` in the sampled
  provider receipt.

Credential preparation is complete. Exactly one `prepare-source` dispatch is
the next separately authorized act. Phase 3 remains forbidden until its own
operator GO and observed Render 2FA enablement.

If Phase 2 does not start under a fresh GO before
`2026-08-06T06:54:37Z`, or any pre-dispatch CAS fails, the operator must revoke
this exact key, prove the retained bytes now return HTTP 401, delete environment
secret `RENDER_API_KEY`, delete repository variable `RENDER_BLUEPRINT_ID`, and
delete the local plaintext holder. The durable `master` branch policy remains.
