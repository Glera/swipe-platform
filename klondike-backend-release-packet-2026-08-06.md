# Klondike backend release packet — 06.08.2026

Status: **DRAFT — image publication and production deploy require separate
operator GO**.

Scope: deploy the reviewed one-game Klondike series policy. This release has
no migration and does not change the active roster.

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

## Phase 2 — direct image-to-image deploy

There is deliberately no `prepare-source` phase. Production is already
image-backed. At the reviewed coordinator source, `operation=deploy` first
requires `runtime=image`, stages the candidate release identity, posts exactly
one deploy naming the immutable digest, waits for live, runs
`verify-applied-db`, and checks public health. `prepare-source` exists only to
convert a source-backed service and would be redundant here.

Immediately before a separately authorized deploy window:

1. operator creates one temporary Render API key;
2. read-only capture proves the service is image-backed on the LKG digest,
   auto-deploy is off, the current live deploy is unique, DB is `0073`, and
   no concurrent cutover run exists;
3. the same key is stored only as GitHub environment secret
   `production/RENDER_API_KEY`;
4. repository variables remain the existing six reviewed identities;
5. dispatch exactly one `platform-release-cutover.yml` run from master with
   `operation=deploy`, the accepted candidate run and manifest, LKG run
   `31028527617`, and the freshly observed current live deploy ID;
6. at every terminal outcome revoke the Render key, prove it unusable, delete
   the GitHub secret and local holder, and preserve non-secret variables.

STOP on any source/master mismatch, schema other than `0073`, non-image
runtime, multiple live deploys, pending cutover run, changed GitHub variables,
or artifact mismatch. Retry, rollback, manual Render deploy and service edits
are not authorized by this packet.

## Remaining product step

The deploy only makes the one-game server policy live. Klondike still requires
its reviewed mapping, Composer roster registration/CAS activation and two Mini
App restarts before product acceptance.
