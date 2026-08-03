# Platform Reliability R1-A — запрос на публикацию candidate v2

Prepared: 2026-08-03 UTC.

Status: **READY FOR OPERATOR DECISION; AUTHORITY NOT GRANTED**.

PR #49 moved backend `master` after the old candidate image was published.
Reviewed successor v2 is now exact head
`4714e339b60e3af747d138486ad7eadadec72dac` in draft PR
[#51](https://github.com/Glera/swipe-backend/pull/51), with both CI workflows
green and independent review GO. Its source identity is not yet present in the
immutable registry.

The accepted production baseline does not need rebuilding. This request is
therefore intentionally one-sided: **one candidate publication, zero baseline
publications**.

## Exact allowed dispatch

- repository: `Glera/swipe-backend`;
- workflow: `.github/workflows/platform-release-image.yml`;
- ref: `codex/r1a-production-cutover-v2-20260803`;
- required ref SHA: `4714e339b60e3af747d138486ad7eadadec72dac`;
- maximum: exactly one `workflow_dispatch` with `publish=true`.

| Input | Exact value |
| --- | --- |
| `feed_sha` | `1d05bb13acfaa08ec607f3b1fc0010902a91ece6` |
| `playables_sha` | `45d5dc81a73184f6ebac1f5dcb197ec0f143f872` |
| `swipe_platform_sha` | `28193c34ac461235ac42c5555ea9e870fac5fed1` |
| `code_min_revision` | `0070_published_test_delivery` |
| `code_max_revision` | `0071_platform_release_receipts` |
| `lkg_min_revision` | `0069_arrows_runtime_variant` |
| `lkg_max_revision` | `0071_platform_release_receipts` |
| `lkg_kind` | `image` |
| `lkg_build_run_id` | `30789375002` |
| `lkg_image_digest` | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` |
| `lkg_manifest_sha256` | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |

Before dispatch, all exact branch, PR, CI, baseline-artifact, absence and
Stage 1 freeze checks in the JSON companion must pass. The currently observed
state has zero publishing runs for this head and no GitHub `production`
environment, but those facts must be reread immediately before dispatch.
The Stage 1 CAS values are backend PR #41 at
`2029867495578310dda92c170a2e07c71203eefa` and client ref
`claude/stage1-p4-mission-client` at
`43f92693b55057d4c22652cbd81dad4ab67f0171`.

## Hard boundary

This request does **not** authorize:

- baseline rebuild or a second dispatch;
- retry after failure or ambiguous/partial publication;
- merge of PR #51 or any other PR;
- cutover workflow dispatch or GitHub `production` environment mutation;
- Render key creation or any Render mutation;
- deploy, migration or any Stage 1 mutation.

On success, the receipt must prove the OCI digest, exact candidate manifest,
exact LKG binding, artifact identity/expiry and private linked GHCR version.
On failure, stop and request a new decision; do not repair by redispatching the
same SHA.

The expected cost is about three rounded Linux minutes, roughly USD 0.02 only
if no included GitHub Actions allowance remains. Render spend is zero.

Example operator form, not an authorization:

> GO R1-A candidate-v2 publication for packet `<commit>` only. Dispatch once
> on exact successor `4714e339...` with the committed inputs; no baseline
> rebuild, merge, cutover, Render, deploy, migration or Stage 1 action.
