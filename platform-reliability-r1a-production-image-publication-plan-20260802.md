# Platform Reliability R1-A — production immutable-pair publication plan

Prepared: 2026-08-02 UTC.

Status: **DRAFT — BASELINE REF EXACT-HEAD CI GREEN IN DRAFT PR #50;
PUBLICATION AUTHORITY NOT GRANTED**. The branch push and draft PR are
preparation only. This plan
authorizes no publishing workflow dispatch, package write, GitHub environment
mutation, merge, Render mutation, deploy or Stage 1 action.

## Why a production baseline ref is required

The default-branch `platform-release-image.yml` is intentionally an inert
registration sentinel. It refuses before checkout or package access. A
production baseline therefore cannot be built directly from `master`; the
exact Stage 0 master tree needs the already reviewed baseline-only release
tooling while remaining at migration `0070_published_test_delivery`.

The local branch `codex/r1a-production-baseline-v1-20260802` was constructed
from exact accepted backend `master`
`a12ca7ecea0f47e8862b4ba91879dff63cb46bfc` by replaying the 17-commit
rehearsal baseline-v4 patch range. `git range-diff` reports all 17 commits
content-identical (`=`) to the independently exercised range
`9277047852c0d73f4d3b9a081e1b0b586f48ae3c..8cb8239e04bf30f54f7fe1f85758da8f4fe7caac`.
Four post-replay commits reapply the already accepted Mission-policy reanchor
for the current master's `app/models.py` bytes, replace the baseline ref's
cutover workflow with a fail-closed refusal, and remove two candidate-only
0071 acceptance gates from this 0070 baseline. Negative assertions preserve
those boundaries. The baseline ref can publish its rollback image but can
never receive GitHub `production` environment or Render authority.

Exact baseline head:
`cd6fb13ab222b8c6f93b2c9fed12d86820f368a3`.

Verified locally:

- Alembic has exactly one head: `0070_published_test_delivery`;
- migration `0071_platform_release_receipts` is absent;
- Mission architecture guard returns `PASS`;
- baseline release/coordinator/guard tests pass 36/36, including a negative
  test that forbids `environment: production`, Render API secrets, coordinator
  execution and package-write authority in the cutover workflow;
- the branch has no production registry pin and its cutover workflow always
  refuses; it exists only to build the rollback image.

Independent review returned GO with no remaining P1/P2. Exact-head
nonpublishing image run `30764220924` and PostgreSQL run `30764220931` are
terminal green. The baseline ref remains only in draft backend PR #50 and
cannot become a package-publication input without separate operator authority.

## Exact candidate and cross-repository identities

| Role | Exact identity |
| --- | --- |
| production baseline | `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3` |
| production candidate | `11c9bce9891ae5b041215056ac4521551a056cb5` |
| feed | `1d05bb13acfaa08ec607f3b1fc0010902a91ece6` |
| playables/tooling identity | `45d5dc81a73184f6ebac1f5dcb197ec0f143f872` |
| public swipe-platform archive | `28193c34ac461235ac42c5555ea9e870fac5fed1` |

The three cross-repository values were read from exact remote `master` refs.
The selected `swipe-platform/release.json` v2 pins the same feed and
playables/tooling identities. Any remote movement before dispatch is a stop:
the reviewed literal values remain the inputs; they are never replaced by a
new `master` implicitly.

## Publication A — baseline

Only after exact-head CI/review GO and separate operator publication GO,
dispatch `.github/workflows/platform-release-image.yml` on the exact baseline
branch once with:

| input | exact value |
| --- | --- |
| `publish` | `true` |
| `feed_sha` | `1d05bb13acfaa08ec607f3b1fc0010902a91ece6` |
| `playables_sha` | `45d5dc81a73184f6ebac1f5dcb197ec0f143f872` |
| `swipe_platform_sha` | `28193c34ac461235ac42c5555ea9e870fac5fed1` |
| `code_min_revision` | `0069_arrows_runtime_variant` |
| `code_max_revision` | `0070_published_test_delivery` |
| `lkg_min_revision` | `0069_arrows_runtime_variant` |
| `lkg_max_revision` | `0070_published_test_delivery` |
| `lkg_kind` | `bootstrap-root` |
| `lkg_build_run_id` | empty |
| `lkg_image_digest` | empty |
| `lkg_manifest_sha256` | empty |

Before dispatch, require all of the following in one attended read-only
preflight:

1. the remote baseline branch equals the reviewed 40-hex head;
2. no `workflow_dispatch` Platform release image run exists for that head
   (the expected `pull_request` compact-image CI run is non-publishing and does
   not collide);
3. GHCR contains no tag equal to that head;
4. package visibility remains private and repository linkage remains
   `Glera/swipe-backend`;
5. the workflow at the exact ref is the full reviewed publisher, not the
   default-branch sentinel.

On success, capture run ID/attempt, OCI index digest, linux/amd64 digest,
manifest SHA-256, Actions artifact identity/expiry and exact package version.
Any partial publication is a hard stop; never redispatch the same SHA.

## Publication B — candidate

Only after the baseline receipt is independently machine-checked, dispatch
the same workflow once on exact candidate branch
`codex/r1a-production-cutover-v1-20260802` with:

| input | exact value |
| --- | --- |
| `publish` | `true` |
| `feed_sha` | `1d05bb13acfaa08ec607f3b1fc0010902a91ece6` |
| `playables_sha` | `45d5dc81a73184f6ebac1f5dcb197ec0f143f872` |
| `swipe_platform_sha` | `28193c34ac461235ac42c5555ea9e870fac5fed1` |
| `code_min_revision` | `0070_published_test_delivery` |
| `code_max_revision` | `0071_platform_release_receipts` |
| `lkg_min_revision` | `0069_arrows_runtime_variant` |
| `lkg_max_revision` | `0071_platform_release_receipts` |
| `lkg_kind` | `image` |
| `lkg_build_run_id` | exact successful production baseline run ID |
| `lkg_image_digest` | exact baseline OCI index digest |
| `lkg_manifest_sha256` | exact baseline manifest SHA-256 |

The workflow itself must download the exact baseline sidecar, bind the run to
the baseline backend SHA, prove the digest/manifest bytes and test that the
pinned LKG can execute Render-style PostgreSQL URLs. On success, capture the
same immutable identities as for the baseline and prove the candidate manifest
pins the production baseline — never a rehearsal image.

## Existing package inventory and cost envelope

Attended GitHub UI inspection before publication showed a private,
repository-linked package with 5 tagged and 10 untagged active versions. The
only tagged versions are prior rehearsal/recovery SHAs; neither proposed
production SHA exists as a tag.

The successful rehearsal baseline/candidate publication runs took 129 and 121
seconds wall time. The production pair is expected to consume about six
rounded standard-Linux minutes total. Under the current GitHub overage rate of
USD 0.006/minute, the pair's Actions-minute ceiling based on those runs is
approximately USD 0.04 if no included minutes remain; otherwise it consumes
the included allowance. GitHub currently states that Container Registry image
storage and bandwidth are free. Actions sidecars remain subject to the
account's shared artifact allowance and expire after 90 days.

No Render resource is created or used by image publication. The durable Render
registry credential is only a later deploy-time pull dependency.

## Stop boundaries and next authority

- Baseline push/draft PR/CI are preparation, not package-publication authority.
- Image publication requires a separate GO naming this plan's committed SHA,
  the exact accepted baseline and candidate heads, and a maximum of two
  publish workflow runs.
- The GO does not authorize creation of the GitHub `production` environment,
  merge, provider source preparation, migration or deploy.
- After both image receipts pass independent review, a new cutover packet and
  a later operator GO are required for protected-environment authority and
  the single-flight merge/cutover sequence.
