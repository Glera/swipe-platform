# Platform Reliability R1-A — candidate-v3 publication authority request

Prepared: 2026-08-03 UTC.

Status: **DRAFT; REQUIRES INDEPENDENT REVIEW AND EXPLICIT OPERATOR GO**.

The accepted corrective disposition makes backend merge
`f2a840517956c4f480fc9d8aaf6f832ebde489d9` valid source authority for
preparing this request. It does not itself authorize this publication.

The historical candidate-v2 image is older than the accepted recovery-v3
source. The accepted baseline image and its unexpired sidecar remain reusable,
so this request is intentionally one-sided: **one candidate publication and
zero baseline publications**.

## Exact requested dispatch

- repository: `Glera/swipe-backend`;
- workflow: `.github/workflows/platform-release-image.yml`;
- workflow SHA-256 at exact source:
  `95d81d36dabbd6e901023ca40a62c041d2e60e991d889b54c130949a1640eb1d`;
- ref: `master`, only while it resolves exactly to
  `f2a840517956c4f480fc9d8aaf6f832ebde489d9`;
- maximum: exactly one `workflow_dispatch` with `publish=true`.

| Input | Exact value |
| --- | --- |
| `feed_sha` | `1d05bb13acfaa08ec607f3b1fc0010902a91ece6` |
| `playables_sha` | `45d5dc81a73184f6ebac1f5dcb197ec0f143f872` |
| `swipe_platform_sha` | `28193c34ac461235ac42c5555ea9e870fac5fed1` |
| `code_min_revision` | `0072_mission_ops_receipts` |
| `code_max_revision` | `0073_platform_release_receipts` |
| `lkg_min_revision` | `0069_arrows_runtime_variant` |
| `lkg_max_revision` | `0073_platform_release_receipts` |
| `lkg_kind` | `image` |
| `lkg_build_run_id` | `30789375002` |
| `lkg_image_digest` | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` |
| `lkg_manifest_sha256` | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |

The code range is the candidate's expected predecessor through target. The
LKG forward range deliberately keeps the accepted baseline prefix and reaches
the candidate target; the workflow must prove that old immutable runtime
against candidate-head PostgreSQL before publishing the new manifest.

The frozen feed/playables/swipe-platform identities are reused from the
reviewed release archive instead of drifting to unrelated current repository
heads.

## Action-time CAS and absence boundary

Every check in the JSON companion is mandatory. In particular, immediately
before dispatch:

1. the reviewed meta packet must equal the SHA named by the operator;
2. backend `master` must resolve to the exact source twice, including a final
   read directly before dispatch;
3. the workflow bytes, merge parent/tree, PR #52, source CI, baseline run,
   artifact and frozen release identities must remain exact;
4. no Platform release image run and no tagged GHCR identity may exist for the
   exact source;
5. no GitHub `production` environment or repository-level Render/release
   authority may have appeared.

Any mismatch stops before dispatch. The accepted source branch is not moved,
tagged or otherwise mutated by this request.

The initial read-only corroboration is recorded in
`platform-reliability-r1a-production-candidate-v3-preflight-observation-20260803.{json,md}`;
all mutable facts in it must still be reread at action time.

## Hard boundary

This request does **not** authorize a baseline rebuild, second dispatch,
retry, branch/tag write, source push, merge, cutover workflow, GitHub
environment mutation, Render key or provider action, deploy, migration,
rehearsal, cutover or Stage 1 runtime action.

On success, the receipt must prove the exact run inputs, OCI index/platform
digests, provenance and SBOM, candidate manifest and LKG binding, artifact and
private linked GHCR identity. Independent receipt acceptance is required
before a rehearsal request can be prepared.

On failure or ambiguity, stop. No redispatch is allowed under the same GO.

Expected GitHub Actions use is about five rounded Linux minutes, about USD
0.03 only if no included allowance remains. Render spend is zero.

Example operator form, not an authorization:

> GO R1-A candidate-v3 publication for packet `<exact-reviewed-commit>` only.
> Dispatch exactly one candidate image publication from backend master only
> while it equals f2a840517956c4f480fc9d8aaf6f832ebde489d9, with the
> committed inputs. No baseline rebuild, retry, source write, merge, cutover,
> GitHub-environment or Render mutation, deploy, migration, rehearsal or Stage
> 1 runtime action.
