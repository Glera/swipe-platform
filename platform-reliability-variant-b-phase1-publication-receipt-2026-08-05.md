# Variant B v3 — Phase 1 image publication receipt

Date: 2026-08-05

Status: **PASS — Phase 1 authorization exhausted**

Scope: exactly one `workflow_dispatch` of
`Glera/swipe-backend/.github/workflows/platform-release-image.yml` from
`ref=master`; image publication only.

This receipt does **not** authorize a Render API key, `/v1/users` probe,
GitHub secret or `RENDER_BLUEPRINT_ID` mutation, cutover phases 2–3, deploy,
migration, rerun, or a second dispatch.

## Authority binding

- Variant B v3 bytes:
  `platform-reliability-variant-b-deploy-slice-v3-2026-08-05.md`
- Variant B v3 SHA-256:
  `324bac0cf95493de5a93760f40f50cff453bd41d6a75e8093e64a4033aa2eb8f`
- Authorized backend source:
  `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`
- Dispatch branch: `master`
- The branch `codex/r1a-production-baseline-v1-20260802` was not used.

## Mandatory preflight

The preflight completed before dispatch.

1. GitHub CAS:
   `repos/Glera/swipe-backend/commits/master` returned exactly
   `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`.
2. No prior `workflow_dispatch` run of `platform-release-image.yml` existed
   for that exact backend SHA.
3. A read-only PostgreSQL transaction against `swipe-production` observed:
   - database: `swipe_55ht`;
   - Alembic revision: `0070_published_test_delivery`.
4. `GET https://swipe-backend-541t.onrender.com/api/health` returned HTTP 200
   and build `09fa0cd`.
5. The Render deploy list exposed exactly one entry marked `Live`:
   - service: `srv-d95r3bfavr4c73aqsi4g` (`swipe-backend`);
   - deploy: `dep-d9mtmabm8hqs73cighmg`;
   - build: `09fa0cd`;
   - deployed: 2026-08-01 14:40:25 GMT+3.

No Render control was invoked during this observation.

## Exact dispatch

- GitHub run: [31028527617](https://github.com/Glera/swipe-backend/actions/runs/31028527617)
- Run number: `38`
- Job: `92383036100`
- Dispatch requested: `2026-08-05T17:07:17Z`
- Run created: `2026-08-05T17:07:20Z`
- Within the first minute GitHub reported:
  - event: `workflow_dispatch`;
  - branch: `master`;
  - head SHA: `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`.
- Run attempt: `1`
- Terminal result: `success`
- No rerun and no second dispatch occurred.

All workflow inputs, as preserved by the downloaded BuildKit provenance:

| Input | Value |
| --- | --- |
| `publish` | `true` |
| `feed_sha` | `c1681d8044c28124be6d8e099a9a73849b59921e` |
| `playables_sha` | `67fedba6901cf492bc0d60ac051560e89d443f3b` |
| `swipe_platform_sha` | `12033fa72d0dfaba4bde49264e2d543bf19e928a` |
| `code_min_revision` | `0070_published_test_delivery` |
| `code_max_revision` | `0073_platform_release_receipts` |
| `lkg_min_revision` | `0069_arrows_runtime_variant` |
| `lkg_max_revision` | `0073_platform_release_receipts` |
| `lkg_kind` | `image` |
| `lkg_build_run_id` | `30789375002` |
| `lkg_image_digest` | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` |
| `lkg_manifest_sha256` | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |

## Downloaded artifact acceptance

GitHub exposed exactly one run artifact:

- artifact id: `8939714130`;
- name: `platform-release-0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`;
- size: `91698` bytes;
- created: `2026-08-05T17:09:39Z`;
- expired: `false`.

The downloaded artifact contained exactly these four files and exactly one
release manifest:

- `build-metadata.json`;
- `manifest-summary.json`;
- `platform-release-manifest.v1.json`;
- `platform-schema-capability.v1.json`.

Byte-level acceptance:

- `platform-release-manifest.v1.json` SHA-256:
  `cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2`;
- `manifest-summary.json` reports the same SHA-256 and `status=PASS`;
- immutable image:
  `ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4`.

Independent assertions over the downloaded bytes passed:

- backend SHA is the authorized `0e9e940a...`;
- feed, playables, and swipe-platform pins equal the dispatch inputs;
- target revision is `0073_platform_release_receipts`;
- expected predecessor is `0072_mission_ops_receipts`;
- candidate accepted revisions are exactly ordered `0070`, `0071`, `0072`,
  `0073`;
- LKG kind, run id, image digest, manifest SHA-256, and compatibility bounds
  equal the authorized inputs;
- BuildKit provenance binds the build to `refs/heads/master`,
  `workflow_dispatch`, run `31028527617`, and backend workflow SHA
  `0e9e940a...`.

The LKG forward-smoke step completed successfully in this run. Run status was
recorded but was not used as the acceptance criterion; acceptance above is
derived from the downloaded artifact bytes.

## Terminal boundary

Phase 1 is complete and its GO is consumed. The candidate image is published,
but production is unchanged: no Render key or configuration was created, no
service mutation occurred, and no migration or deploy was initiated.

Before any Phase 2–3 GO, Variant B v3 still requires the four amendments named
by the independent reviewer: enumerate all pending Blueprint previews/syncs;
make the two section-7 captures distinct; define cleanup for staged
`PLATFORM_*` environment; and add the explicit branch for preDeploy failure
after Alembic upgrade.
