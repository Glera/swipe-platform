# Klondike backend — Phase 1 image publication receipt

Date: 2026-08-06

Status: **PASS — Phase 1 authorization exhausted**

Scope: exactly one `workflow_dispatch` of
`Glera/swipe-backend/.github/workflows/platform-release-image.yml` from
`ref=master`; immutable image publication only.

This receipt does **not** authorize a Render API key or secret, Render service
mutation, `prepare-source`, deploy, migration, retry, rerun or a second image
dispatch.

## Authority binding

- reviewed release packet:
  `klondike-backend-release-packet-2026-08-06.md` at meta commit `2b37a9e`;
- authorized backend source:
  `ad65ac5ae09ab7b855b59f4b0a7d89328de5caab`;
- operator authorization: `GO Klondike backend Phase 1 image publication for
  packet 2b37a9e only` with exactly one dispatch and the exclusions above;
- dispatch branch: `master`.

Before dispatch, GitHub CAS returned the authorized backend source, the current
packet blob matched the reviewed `2b37a9e` blob, and no earlier manual image
run existed for that backend SHA.

## Exact dispatch

- GitHub run:
  [31101029853](https://github.com/Glera/swipe-backend/actions/runs/31101029853);
- job: `92614374079`;
- event: `workflow_dispatch`;
- head: `ad65ac5ae09ab7b855b59f4b0a7d89328de5caab`;
- created: `2026-08-06T12:21:11Z`;
- completed: `2026-08-06T12:23:35Z`;
- attempt: `1`;
- conclusion: `success`;
- no rerun and no second dispatch occurred.

The downloaded BuildKit provenance preserved these exact inputs:

| Input | Value |
| --- | --- |
| `publish` | `true` |
| `feed_sha` | `1c4a221edd337e3a4ec5cfe21c78ea377b72e3a0` |
| `playables_sha` | `3f17df6b94cdd99ced6edeaf62f9657d09776d13` |
| `swipe_platform_sha` | `feb982d3ad6ed8635b01983b6210bad6a24d1f8f` |
| `code_min_revision` | `0070_published_test_delivery` |
| `code_max_revision` | `0073_platform_release_receipts` |
| `lkg_min_revision` | `0070_published_test_delivery` |
| `lkg_max_revision` | `0073_platform_release_receipts` |
| `lkg_kind` | `image` |
| `lkg_build_run_id` | `31028527617` |
| `lkg_image_digest` | `sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4` |
| `lkg_manifest_sha256` | `cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2` |

## Downloaded artifact acceptance

GitHub exposed exactly one artifact:

- id: `8967525171`;
- name: `platform-release-ad65ac5ae09ab7b855b59f4b0a7d89328de5caab`;
- archive digest:
  `sha256:148ac11c5efca58ef6303e28155b804a2cec44c0028a5fd8385defad45abc855`;
- size: `91634` bytes;
- created: `2026-08-06T12:23:30Z`;
- expired: `false`.

It contained four sidecar files and exactly one release manifest:

- `build-metadata.json`;
- `manifest-summary.json`;
- `platform-release-manifest.v1.json`;
- `platform-schema-capability.v1.json`.

Byte-level result:

- `platform-release-manifest.v1.json` SHA-256:
  `3c74aa6f0b039f1be8da1bb60e4d3a42f6495840e0cc39d803af4fb3adb45ace`;
- `manifest-summary.json` reports that same digest and `status=PASS`;
- candidate image:
  `ghcr.io/glera/swipe-backend@sha256:32a6eca8ac6c4f50a9eb9875aaa1724ad29962ad39a6ff194441eb4389d37b52`;
- schema-capability SHA-256:
  `d9464ecd886518d56ac1af71e99689c49296c3db1efdc367ccbb04a4835de3ba`.

Twenty-seven exact assertions over downloaded bytes passed. They prove:

- backend, feed, playables and swipe-platform identities equal the authorized
  inputs;
- target is `0073_platform_release_receipts` and expected predecessor is
  `0072_mission_ops_receipts`;
- code, LKG and LKG-forward accepted revisions are exactly ordered
  `0070`, `0071`, `0072`, `0073`;
- LKG kind, run id, image digest, manifest digest and compatibility bounds
  equal the authorized inputs;
- candidate digest agrees between the manifest and BuildKit metadata;
- provenance binds the build to `refs/heads/master`, `workflow_dispatch`, run
  `31101029853`, attempt `1` and backend workflow SHA `ad65ac5...`.

The exact pinned LKG forward-smoke, compact-runtime checks and Stage 0
protective-contour smoke all completed successfully. Run status was observed
but was not used instead of artifact acceptance.

## Terminal boundary

Phase 1 is complete and its GO is consumed. The immutable candidate exists in
GHCR, but production remains unchanged: this window created no Render key or
GitHub secret, performed no Render operation, and initiated no deploy or
migration.

Any credential preparation and `prepare-source` require a new, separately
bounded operator GO using the candidate manifest and digest recorded here.
