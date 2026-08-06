# Klondike backend release packet — 06.08.2026

Status: **DRAFT — image publication and production deploy require separate
operator GO**.

Scope: deploy the reviewed series policy: Klondike is explicitly one game,
Arrows explicitly remains five, and an unknown future mechanic now safely
defaults from five games to one. This release has no migration and does not
change the active roster; every mechanic in the current 15-entry roster still
matches an explicit policy branch and preserves its existing length.

## Immutable source facts

- backend master: `ad65ac5ae09ab7b855b59f4b0a7d89328de5caab`;
- reviewed PR head: `c9420acbebf3e248dc5e2987107dfc357cb38498`;
- both commits have tree `e0850f594fbbf824435019dfeb6c258d5712ff51`;
- migration head: `0073_platform_release_receipts`;
- feed master: `1c4a221edd337e3a4ec5cfe21c78ea377b72e3a0`;
- playables master: `3f17df6b94cdd99ced6edeaf62f9657d09776d13`;
- published swipe-platform master:
  `feb982d3ad6ed8635b01983b6210bad6a24d1f8f`.

The public release and all two playable HTML files plus four cover files were
observed with HTTP 200 and exact git-byte SHA-256 equality before this packet.
The exact public `versions.json` SHA-256 is
`780a381d6a76f251108af5e2d892cb5c5c813cd0de1341f88b909e38c6d910b6` and
the exact public `release.json` SHA-256 is
`61f392891ee8ca652cc6ef6e45e37febc7710ff274c479267f53f980d3dce8ff`;
the latter pins the feed and playables commits above.

At `2026-08-06T12:11:43Z` one PostgreSQL transaction declared `READ ONLY`
observed revision `0073_platform_release_receipts`, active activation
`837fdee2-6d6f-4676-9080-2ad4d7434c57`, and these 15 ordered playable IDs:

```text
merge-locked-v1-swipe, marble-sort-swipe, pins-swipe, arrows-v1-swipe,
minesweeper-v1-swipe, merge-timepress-v1-swipe, merge-timepress-v2-swipe,
merge-timepress-no-orders-v1-swipe, pins-l3-swipe, short-drama-swipe,
pins-l5-swipe, merge-second-board-v1-swipe, pins-l7-swipe,
merge-second-board-v2-swipe, pins-l9-swipe
```

Every ID resolves to an explicit branch in `app/run_policy.py`; the intended
default change therefore affects only future/unknown mechanics, not this live
roster.

## Current last-known-good image

- build run: `31028527617`;
- manifest SHA-256:
  `cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2`;
- image digest:
  `sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4`;
- backend source: `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`;
- code compatibility: exact ordered `0070`, `0071`, `0072`, `0073`.

The artifact was re-downloaded from GitHub and its manifest digest and fields
were recomputed before this packet.

## Phase 1 — publish exactly one candidate image

Dispatch `.github/workflows/platform-release-image.yml` from `ref=master`
only while master is the backend SHA above and no previous manual image run
exists for it. Exact inputs:

```text
publish=true
feed_sha=1c4a221edd337e3a4ec5cfe21c78ea377b72e3a0
playables_sha=3f17df6b94cdd99ced6edeaf62f9657d09776d13
swipe_platform_sha=feb982d3ad6ed8635b01983b6210bad6a24d1f8f
code_min_revision=0070_published_test_delivery
code_max_revision=0073_platform_release_receipts
lkg_min_revision=0070_published_test_delivery
lkg_max_revision=0073_platform_release_receipts
lkg_kind=image
lkg_build_run_id=31028527617
lkg_image_digest=sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4
lkg_manifest_sha256=cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2
```

One dispatch, attempt 1 only. No rerun. Acceptance is by downloaded artifact:
one manifest, exact candidate backend and cross-repo pins, target `0073`,
expected predecessor `0072`, accepted chain `0070..0073`, current LKG pins,
and the immutable candidate image digest.

## Phase 2 — bind the saved image configuration

Production is already image-backed, but `operation=deploy` does not verify the
saved `imagePath`, registry credential, health path or preDeploy command. A
separately authorized `operation=prepare-source` is therefore retained. In
this release it is an image-to-image configuration bind: it PATCHes the saved
service configuration to the reviewed candidate digest and verifies the
result without creating a deploy. This also keeps the executable route aligned
with the reviewed platform-release checklist.

Immediately before the bounded Phase 2–3 window:

1. operator creates one temporary Render API key;
2. repeat the read-only DB query above and STOP unless it still reports
   `0073`; then run the exact GET-only capture command below. It proves the
   service is image-backed on the LKG digest, auto-deploy is off, the current
   live deploy is unique, and no concurrent cutover run exists;
3. the same key is stored only as GitHub environment secret
   `production/RENDER_API_KEY`;
4. repository variables remain the existing six reviewed identities;
5. dispatch exactly one `platform-release-cutover.yml` run from master with
   `operation=prepare-source`, the accepted candidate run and manifest, LKG
   run `31028527617`, and the freshly observed current live deploy ID;
6. accept only its downloaded success receipt plus a fresh GET proving the
   saved runtime is image, `imagePath` is the candidate digest, registry
   credential is pinned, health path is `/api/health`, preDeploy is
   `python -m app.platform_release predeploy-env`, and the current live deploy
   ID did not change.

### Executable capture authority

The authority is
`scripts/platform-reliability-variant-b-provider-capture.mjs`, exact SHA-256
`dc8f1d46cda2f173df1cabb70457c099cf25da8d5aff847e144d6d523870a25f`.
The old Python provider capture and this tool's `pre-window` stage are
source-runtime only and must not be used here. Current production is captured
with `--stage prepared` and the LKG image:

```bash
node scripts/platform-reliability-variant-b-provider-capture.mjs \
  --stage prepared \
  --blueprint-id exs-d95qo3q8qa3s73ea23p0 \
  --service-id srv-d95r3bfavr4c73aqsi4g \
  --expected-owner-id tea-d1m4lmali9vc73euvelg \
  --expected-current-deploy "$current_deploy" \
  --known-preview-id exe-d9nercqjnfac73aunbvg \
  --known-preview-id exe-d9pg7s3m8hqs73fguv80 \
  --expected-image-path ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4 \
  --expected-registry-credential-id rgc-d9np7tajnfac73bi5ib0 \
  --expected-health-check-path /api/health \
  --expected-predeploy-command "python -m app.platform_release predeploy-env" \
  --baseline /Users/gleb/secure/r1a/variant-b-pre-window-provider-capture.v1.json \
  --output klondike-lkg-provider-capture.v1.json
```

Immediately after Phase 2, Capture A repeats that command with the accepted
candidate image ref as `--expected-image-path`, uses
`--baseline klondike-lkg-provider-capture.v1.json`, and writes
`klondike-candidate-capture-a.v1.json`. Immediately before Phase 3, Capture B
repeats fresh GETs with the same arguments and adds:

```text
--equal-capture klondike-candidate-capture-a.v1.json
--output klondike-candidate-capture-b.v1.json
```

Only `observedAt` may differ. The candidate image ref and current deploy are
copied from the accepted candidate manifest and fresh provider GET and are
recorded in the execution receipt before either command.

Both known preview IDs are permanent residuals. The tool must reject any new
sync and any transition of a known residual to `running` or `success`.
Provider enumeration has previously omitted a dashboard-visible pending
preview, so `exe-d9pg7s3m8hqs73fguv80` also remains an explicit manual STOP:
never Approve it and never use Manual sync during this window.

## Phase 3 — deploy the bound immutable image

After a fresh CAS proves backend master, workflow bytes, GitHub variables,
current live deploy and bound service fields are unchanged, dispatch exactly
one `platform-release-cutover.yml` run with `operation=deploy`, the same
candidate and LKG identities, and the same current live deploy ID. The
coordinator stages the release identity, posts one deploy naming the immutable
candidate digest, waits for live, runs `verify-applied-db`, and checks public
health. Post-deploy GET evidence must show the saved `imagePath` still equals
the candidate digest and the new deploy is the unique live deploy.

At every terminal outcome revoke the Render key, prove it unusable, delete the
GitHub secret and local holder, and preserve non-secret variables. The current
workflow uploads a coordinator receipt only on success; on failure the exact
run log and immediate provider capture are the terminal evidence. Fixing that
inherited P2 is a later reliability change, not authority for retry here.

If Phase 2 succeeds but Phase 3 is not authorized or reaches STOP, production
continues serving the LKG deploy while the saved service image points at the
candidate. Restart, redeploy, preview approval and every Render write are then
forbidden. Cleanup still runs; a separately reviewed recovery must either
restore the saved LKG image or resume Phase 3.

STOP on any source/master mismatch, schema other than `0073`, non-image
runtime, saved image/config mismatch, multiple live deploys, pending cutover
run, changed GitHub variables, artifact mismatch, or any deploy appearing
between Phase 2 and Phase 3. A known preview in `running`/`success`, any new
sync, or approval/manual-sync interaction is also STOP. Both workflow runs must report
`head_sha=ad65ac5ae09ab7b855b59f4b0a7d89328de5caab`. Retry, rollback, manual
Render deploy and service edits are not authorized by this packet.

## Remaining product step

The deploy only makes the one-game server policy live. Klondike still requires
its reviewed mapping, Composer roster registration/CAS activation and two Mini
App restarts before product acceptance.
