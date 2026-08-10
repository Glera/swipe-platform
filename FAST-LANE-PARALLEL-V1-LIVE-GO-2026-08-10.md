# Fast Lane parallel v1 — executable attended GO route

Status: **ROUTE READY; EXECUTION NOT AUTHORIZED**. This is the single merge,
rollout, rollback and smoke text for the candidate stack. It does not itself
authorize a merge, workflow dispatch, live Lab restart, Telegram task,
notification, publication, activation, approval, rejection or cancellation.

When an operator signs this exact packet, the maximum authorized scope is:

1. merge the four exact reviewed PR heads in the order below;
2. publish one feed-only static archive;
3. publish and cut over one exact backend image, migrating production DB
   `0075 → 0076 → 0077` through the normal preDeploy path;
4. restart the Lab once from the exact merged Generator head;
5. perform the zero-task, read-only live compatibility smoke below.

The ten real Telegram-task smoke is **STOP / NOT AUTHORIZED** because the
current production contract cannot remove its durable READY projections from
the operator queue after local cancellation. The deterministic ten-task
acceptance remains the authority until a separately reviewed terminal cleanup
contract exists.

## 1. Frozen inputs and live baseline

The following values are CAS inputs, not values to rediscover as “latest”:

| Authority | Exact value before execution |
| --- | --- |
| Backend PR #62 head | `8aed0109a1c20eb79dce647da8ddfcce5616fae7` |
| Backend master before merge | `3c3693ae71d3e6ca22961a018adf18d1f1e0abe0` |
| Feed PR #30 head | `69e449bcd8c7517a018fa77870efa955cc444103` |
| Feed master before merge | `02f398f0c2697884d3184eb4ca4a0218bc191e4d` |
| Generator PR #27 head | `0d9770183e6322b255628cbe7c28dde69dc23cb5` |
| Generator master before merge | `adea2c8aa0ad7532530bcb199f55befd8a9ad464` |
| Meta master before PR #87 | `5da309bf927c1681bb5989f4a55152ca1153e864` |
| Playables/tooling pin | `ee9e181bd6cb0054b583282ee5770ea3a01a38b2` |
| Release-profile helper SHA-256 | `25634ba0f58472e2674f043b3dc90aeb85112623185c7ffc7b87e50068b6cc34` |
| Feed build sibling (`swipe-ugc`) | `65f1d52bca68afc976b0ea9e0a4d0a1e7685016b` |
| Audited `swipe-ugc` master | `8cd1e8598b699766bb02ccd22f63e38ab9ffe1ee` |
| Static archive before rollout | `swipe-platform@46144eb2a05a276fa122ae5f74876e4b9b7801cc` |
| Existing static `release.json` feed pin | `e3b273f9a685fb0554bac57a1703af699bf044c1` |
| Existing static deploy-tooling pin | `cb581e71e57f60822247d8ac2077e73adff86e88` |
| Live backend source | `bbc8026bfc775470b257ffecf8e56adb977506bb` |
| Live DB revision | `0075_playable_rework_status` |
| Live backend image build | run `31187976429`, attempt 1 |
| Live/LKG manifest SHA-256 | `f56c6705b7e2805260e6cb0b40c0079be550ba8bfe632c01265e1d87b7a32f18` |
| Live/LKG image digest | `sha256:3d2889a6646de067b5c6951c3410f0c07b6ea38c637396163bee8c3c85f99ce5` |
| Live Render deploy CAS | `dep-d9quqaqd0e5s73b5u01g` |
| Previous live Generator | `8c9b4ad0906005f848fdbbcc466136e6babbf203` |

The Generator baseline is a clean, non-divergent Fast Lane descendant of the
earlier blocked-status rollout: PR #23 merged as `bcbe937e9ca2acbecde5e149774c4186028fe43d`
(technical validation profiles), PR #24 merged as
`2ede43a1d764ed8fb13d82f6d51d368ded1971e4` (strict new-mechanic profiles used
by Two Dots), and PR #25 merged as
`8c9b4ad0906005f848fdbbcc466136e6babbf203` (durable remote-source intake
recovery). This exact live evolution is recorded in `STATE.md`,
`labs-fast-lane-dogfood-validation-retry-receipt-2026-08-07.md` and
`labs-fast-lane-two-dots-add-dogfood-receipt-2026-08-07.md`.

The static baseline already contains the preserved Two Dots preview commit.
Every static operation below is append-only on top of that head; it must not
delete or rewrite any existing `playable-previews/` path.

The Playables tooling pin is a clean descendant of the previous
`b072a97305de749ce35c6f6f4323c3ba462b9ddf` pin through PR #19
(`dc8755ad1b84f1261f953bc800a657186693db01`) and PR #15 (the pinned master
above). The no-argument deploy script, release-profile helper and pinned
profile bytes are unchanged. The descendant is required because
`deploy-swipe.sh` refuses a Playables checkout that is not its published
tracked upstream.

If any master, PR head, live deploy, DB revision, image/manifest pin or static
archive differs, this packet is stale: **STOP, do not rebase, merge, build,
retry or substitute a newer value under this GO**.

## 2. Exact merge order with before-each-merge CAS

Merge order is fixed:

1. Backend PR #62.
2. Feed PR #30.
3. Generator PR #27.
4. Meta PR #87, using the exact `META_HEAD` and packet SHA-256 recorded in the
   PR body receipt. The packet cannot self-record its own commit SHA.

Immediately before each merge, execute the equivalent of this block with the
row's repository, PR, expected base and expected head:

```bash
REPO=Glera/swipe-backend
PR=62
EXPECTED_BASE=3c3693ae71d3e6ca22961a018adf18d1f1e0abe0
EXPECTED_HEAD=8aed0109a1c20eb79dce647da8ddfcce5616fae7

test "$(gh api "repos/$REPO/git/ref/heads/master" --jq .object.sha)" = "$EXPECTED_BASE"
test "$(gh pr view "$PR" -R "$REPO" --json headRefOid --jq .headRefOid)" = "$EXPECTED_HEAD"
test "$(gh pr view "$PR" -R "$REPO" --json isDraft --jq .isDraft)" = true
test "$(gh pr view "$PR" -R "$REPO" --json mergeStateStatus --jq .mergeStateStatus)" = CLEAN
gh pr checks "$PR" -R "$REPO"

# This is an operator action after GO, never part of packet preparation.
gh pr ready "$PR" -R "$REPO"
gh pr merge "$PR" -R "$REPO" --merge --match-head-commit "$EXPECTED_HEAD"

MERGE_SHA="$(gh pr view "$PR" -R "$REPO" --json mergeCommit --jq .mergeCommit.oid)"
test "$(gh api "repos/$REPO/commits/$MERGE_SHA" --jq '.parents[0].sha')" = "$EXPECTED_BASE"
test "$(gh api "repos/$REPO/commits/$MERGE_SHA" --jq '.parents[1].sha')" = "$EXPECTED_HEAD"
test "$(gh api "repos/$REPO/git/ref/heads/master" --jq .object.sha)" = "$MERGE_SHA"
```

Use these remaining rows without changing the block's semantics:

| Repository / PR | `EXPECTED_BASE` | `EXPECTED_HEAD` |
| --- | --- | --- |
| `Glera/feed-prototype` #30 | `02f398f0c2697884d3184eb4ca4a0218bc191e4d` | `69e449bcd8c7517a018fa77870efa955cc444103` |
| `Glera/swipe-generator` #27 | `adea2c8aa0ad7532530bcb199f55befd8a9ad464` | `0d9770183e6322b255628cbe7c28dde69dc23cb5` |
| `Glera/p4g-workspace-meta` #87 | `5da309bf927c1681bb5989f4a55152ca1153e864` | exact `META_HEAD` from the PR #87 receipt |

Do not squash or rebase: the merge receipts and later runtime pins use the
resulting merge commits. Record them as `BACKEND_MERGE_SHA`, `FEED_MERGE_SHA`,
`GENERATOR_MERGE_SHA` and `META_MERGE_SHA`.

## 3. Safe rollout order and compatibility handshake

The live order is deliberately **feed static → backend image/cutover →
Generator restart**.

- The feed is published first because the backend image manifest must pin the
  exact post-merge Feed SHA and the exact generated `swipe-platform` archive.
  The existing feed deploy operation has no non-live archive/promotion mode.
- During this short window, the new candidate-review route is fail-closed
  against the old backend: it does not boot `/session` or the normal feed,
  cannot accept a caller-authored candidate URL, and exposes no approval CTA
  without a valid server-owned review binding. Do not open an existing review
  or submit a task in this window.
- Backend is next. Old Generator and old normal-feed behavior remain compatible
  because `0076` and `0077` are additive/default-off until the new writer is
  installed.
- Generator is last because only the new Generator emits the new READY
  projection/notification/review handshake.

### 3.1 Publish the feed-only static archive

Use the only existing feed release operation: `playables/scripts/deploy-swipe.sh`
with no playable IDs, as documented by `feed-prototype/README.md`, section
`Деплой`. Prepare clean Feed, Playables and static checkouts whose tracked
branches are exact master. The production Vite config also imports one
build-only sibling, `swipe-ugc`; use the exact detached Feed-CI pin below,
never a floating checkout.

Before running it:

```bash
test "$(git -C feed-prototype status --porcelain --untracked-files=all)" = ""
test "$(git -C playables status --porcelain --untracked-files=all)" = ""
test "$(git -C swipe-platform status --porcelain --untracked-files=all)" = ""
test "$(git -C swipe-ugc status --porcelain --untracked-files=all)" = ""
git -C feed-prototype fetch origin master
git -C playables fetch origin master
git -C swipe-platform fetch origin master
git -C swipe-ugc fetch origin master
test "$(git -C feed-prototype rev-parse HEAD)" = "$FEED_MERGE_SHA"
test "$(git -C feed-prototype rev-parse origin/master)" = "$FEED_MERGE_SHA"
test "$(git -C playables rev-parse HEAD)" = ee9e181bd6cb0054b583282ee5770ea3a01a38b2
test "$(git -C playables rev-parse origin/master)" = ee9e181bd6cb0054b583282ee5770ea3a01a38b2
test "$(git -C swipe-platform rev-parse HEAD)" = 46144eb2a05a276fa122ae5f74876e4b9b7801cc
test "$(git -C swipe-platform rev-parse origin/master)" = 46144eb2a05a276fa122ae5f74876e4b9b7801cc
test "$(git -C swipe-ugc rev-parse HEAD)" = 65f1d52bca68afc976b0ea9e0a4d0a1e7685016b
test "$(git -C swipe-ugc rev-parse origin/master)" = 8cd1e8598b699766bb02ccd22f63e38ab9ffe1ee
git -C swipe-ugc merge-base --is-ancestor \
  65f1d52bca68afc976b0ea9e0a4d0a1e7685016b \
  8cd1e8598b699766bb02ccd22f63e38ab9ffe1ee
test "$(git -C swipe-ugc diff --name-only \
  65f1d52bca68afc976b0ea9e0a4d0a1e7685016b..8cd1e8598b699766bb02ccd22f63e38ab9ffe1ee -- \
  recipes/sort/recipe.mjs recipes/sort/recipe.json recipes/sort/theme-prompt.txt \
  preview/sort-v2.html bases/sort-v2/payload.js)" = ""
EVIDENCE_DIR="$(mktemp -d)"
shasum -a 256 swipe-platform/versions.json > "$EVIDENCE_DIR/versions-before.sha256"

NODE_24_BIN="/usr/local/Cellar/node@24/24.19.0/bin/node"
PROFILE_HELPER="playables/scripts/catalog-dogfood-release-profile.mjs"
test -x "$NODE_24_BIN"
test "$("$NODE_24_BIN" --version)" = v24.19.0
test "$(shasum -a 256 "$PROFILE_HELPER" | awk '{print $1}')" = \
  25634ba0f58472e2674f043b3dc90aeb85112623185c7ffc7b87e50068b6cc34
RESOLVE_STDOUT="$("$NODE_24_BIN" "$PROFILE_HELPER" resolve \
  2>"$EVIDENCE_DIR/helper-resolve.stderr")" || exit 1
test ! -s "$EVIDENCE_DIR/helper-resolve.stderr"
test "$(printf '%s' "$RESOLVE_STDOUT" | shasum -a 256 | awk '{print $1}')" = \
  5a51cbe9c8da54d1bfc8be7a5460e952e4f59649d9f33fb5bcd6451a1ae40a8e
ISLAND_STDOUT="$("$NODE_24_BIN" "$PROFILE_HELPER" resolve-island \
  2>"$EVIDENCE_DIR/helper-resolve-island.stderr")" || exit 1
test ! -s "$EVIDENCE_DIR/helper-resolve-island.stderr"
test "$(printf '%s' "$ISLAND_STDOUT" | shasum -a 256 | awk '{print $1}')" = \
  8b65d442d54e4a5601e40d6ef36fed7aed7f032fe652835e0444e3a22d4a5897
```

Then execute exactly once:

```bash
(cd playables && bash scripts/deploy-swipe.sh)
```

The no-argument form rebuilds only the Feed, writes `release.json`, commits the
content and deploy-stamp commits, pushes `swipe-platform/master`, and lets the
existing Render Static auto-deploy run. It does not export a playable.

After terminal Render Static success, record `STATIC_CONTENT_SHA` and the final
`STATIC_SHA`, then require:

```bash
test "$(git -C swipe-platform rev-parse HEAD)" = "$(git -C swipe-platform rev-parse origin/master)"
STATIC_SHA="$(git -C swipe-platform rev-parse HEAD)"
test "$(jq -r .feedCommit swipe-platform/release.json)" = "$FEED_MERGE_SHA"
test "$(jq -r .deployToolingCommit swipe-platform/release.json)" = ee9e181bd6cb0054b583282ee5770ea3a01a38b2
test "$(jq -r .exportedPlayablesCommit swipe-platform/release.json)" = null
shasum -a 256 -c "$EVIDENCE_DIR/versions-before.sha256"
curl -fsS https://swipe-platform.onrender.com/release.json > "$EVIDENCE_DIR/live-release.json"
test "$(jq -r .feedCommit "$EVIDENCE_DIR/live-release.json")" = "$FEED_MERGE_SHA"
test "$(jq -r .deployToolingCommit "$EVIDENCE_DIR/live-release.json")" = ee9e181bd6cb0054b583282ee5770ea3a01a38b2
```

Record SHA-256 for the repository and live `index.html`, `release.json` and
`versions.json`. No candidate-review or Telegram action occurs yet.

### 3.2 Publish the exact backend image

Dispatch `Glera/swipe-backend/.github/workflows/platform-release-image.yml`
from `BACKEND_MERGE_SHA`, once, with `publish=true` and these exact inputs:

| Input | Source / value |
| --- | --- |
| `feed_sha` | `FEED_MERGE_SHA` from the verified Feed merge receipt |
| `playables_sha` | `ee9e181bd6cb0054b583282ee5770ea3a01a38b2` |
| `swipe_platform_sha` | final `STATIC_SHA` from §3.1 |
| `code_min_revision` | `0075_playable_rework_status` |
| `code_max_revision` | `0077_fast_lane_parallel_ready` |
| `lkg_min_revision` | `0074_feed_playable_release_scope` |
| `lkg_max_revision` | `0077_fast_lane_parallel_ready` |
| `lkg_kind` | `image` |
| `lkg_build_run_id` | `31187976429` |
| `lkg_image_digest` | `sha256:3d2889a6646de067b5c6951c3410f0c07b6ea38c637396163bee8c3c85f99ce5` |
| `lkg_manifest_sha256` | `f56c6705b7e2805260e6cb0b40c0079be550ba8bfe632c01265e1d87b7a32f18` |

Before dispatch, re-read all four source refs and require them to equal
`BACKEND_MERGE_SHA`, `FEED_MERGE_SHA`, the Playables pin and `STATIC_SHA`.
The workflow itself downloads and verifies the pinned LKG sidecar, builds one
immutable GHCR digest, and writes `platform-release-manifest.v1.json` only
after publication.

Record the unique workflow-dispatch run as `CANDIDATE_BUILD_RUN_ID`; require
terminal success and `head_sha == BACKEND_MERGE_SHA`. Download artifact
`platform-release-$BACKEND_MERGE_SHA`, compute the manifest SHA-256 locally,
and record it as `CANDIDATE_MANIFEST_SHA256`. Reject any manifest whose sources
do not equal the four pins above or whose compatibility path is not contiguous
`0075 → 0076 → 0077` with target `0077`.

### 3.3 Production source preparation and cutover

The sole authority is the existing `Platform production release` workflow
`.github/workflows/platform-release-cutover.yml` at `BACKEND_MERGE_SHA`, using
the normal contour and cutover checklist in
`swipe-backend/docs/specs/platform-release-r1a.md` §§ `Normal contour` and
`Cutover checklist`. No Render dashboard “Deploy latest”, local coordinator or
Alembic command is an alternative route.

Immediately before the first dispatch, the read-only provider capture required
by that checklist must still show Blueprint Auto Sync and all three Auto Deploy
controls off, the expected service identities, and current deploy exactly
`dep-d9quqaqd0e5s73b5u01g`. Its canonical receipt SHA-256 is attached to the
cutover evidence. The protected Render IDs come only from the backend GitHub
`production` environment; the API key remains its secret.

Dispatch operation `prepare-source` with:

```text
candidate_build_run_id = CANDIDATE_BUILD_RUN_ID
candidate_manifest_sha256 = CANDIDATE_MANIFEST_SHA256
lkg_build_run_id = 31187976429
expected_current_deploy = dep-d9quqaqd0e5s73b5u01g
```

Require terminal PASS and save its coordinator receipt. It is non-deploying;
the current deploy CAS must remain `dep-d9quqaqd0e5s73b5u01g`.

Dispatch operation `deploy` once with the same four inputs. The serialized
preDeploy lock must observe DB `0075_playable_rework_status`, apply both
additive revisions `0076_single_mac_platform_loop` and
`0077_fast_lane_parallel_ready`, and write the exact-byte DB receipt. Success
requires all of:

- candidate Render deploy becomes live by exact image digest;
- post-deploy DB verifier reports exactly `0077_fast_lane_parallel_ready`;
- `/api/health` PASS;
- coordinator receipt binds `BACKEND_MERGE_SHA`, candidate manifest SHA-256,
  image digest, old deploy CAS, new deploy ID and verification job ID.

Do not retry a failed dispatch. A failure returns to the rollback decision in
§6 and needs a new operator instruction.

### 3.4 Restart the Lab from the exact merged Generator

Only after §3.3 is fully PASS, use a clean runtime-host checkout whose tracked
`master` and `HEAD` both equal `GENERATOR_MERGE_SHA`. Record the previous
LaunchAgent status, plist WorkingDirectory, preserved environment and data-root
path. Do not copy or delete `.data`.

Before changing any runtime checkout or plist, require the re-baselined live
identity and preserved state to match exactly:

```bash
CURRENT_LIVE_ROOT="/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-live"
CURRENT_DATA_ROOT="/Users/gleb/My projects/p4g-platform-workspace/swipe-generator/.data"
CURRENT_PLIST="$HOME/Library/LaunchAgents/com.p4g.swipe-generator.plist"

test "$(git -C "$CURRENT_LIVE_ROOT" rev-parse HEAD)" = \
  8c9b4ad0906005f848fdbbcc466136e6babbf203
test "$(git -C "$CURRENT_LIVE_ROOT" status --porcelain --untracked-files=all)" = ""
test "$(plutil -extract Label raw -o - "$CURRENT_PLIST")" = com.p4g.swipe-generator
test "$(plutil -extract WorkingDirectory raw -o - "$CURRENT_PLIST")" = \
  "$CURRENT_LIVE_ROOT"
test "$(plutil -extract EnvironmentVariables.SWIPE_GENERATOR_DATA raw -o - \
  "$CURRENT_PLIST")" = "$CURRENT_DATA_ROOT"
test "$(launchctl print gui/$(id -u)/com.p4g.swipe-generator |
  awk '/^[[:space:]]*working directory =/{sub(/^[^=]*= /,""); print; exit}')" = \
  "$CURRENT_LIVE_ROOT"
```

The one normal install may point `WorkingDirectory` at the prepared clean
`GENERATOR_MERGE_SHA` checkout, but it must preserve `SWIPE_GENERATOR_DATA`
byte-for-byte as `CURRENT_DATA_ROOT`. Any current-head, plist, WorkingDirectory
or data-root mismatch is STOP before install or restart.

Run the existing service operation once:

```bash
(cd swipe-generator && npm run service:install)
(cd swipe-generator && npm run service:status)
test "$(git -C swipe-generator rev-parse HEAD)" = "$GENERATOR_MERGE_SHA"
curl -fsS http://127.0.0.1:4317/health
curl -fsS http://127.0.0.1:4317/v1/playable-releases
```

The installer performs the one `launchctl kickstart -k` and preserves the
configured data root, platform origin, deploy manifest and backend endpoint.
Require Node 24, health `ok=true`, one service PID, the expected WorkingDirectory
and unchanged existing release IDs. Do not approve, cancel, retry or notify any
existing release.

## 4. Ten-task disposition: STOP, reserve identities only

The terminal audit found no safe production cleanup path for ten live READY
records:

- Generator `POST /v1/playable-releases/{id}/cancel` accepts local READY/FAILED
  and appends local `CANCELLED`, but does not clear the backend projection;
- backend durable preparation projection has `preparing`,
  `ready_for_approval` and `needs_help`, but no server-owned cancel/archive
  transition for the linked rework request;
- READY notification rows are durable evidence and must not be deleted;
- frozen `playable-previews/<releaseId>/` commits are immutable publication
  evidence; local cancel neither deletes nor should rewrite them.

Therefore the ten requested identities are reserved but **must not be
submitted** under this packet:

| Slot | Reserved marker | Disposition |
| --- | --- | --- |
| 01 | `FLP1-LIVE-<UTCSTAMP>-01` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 02 | `FLP1-LIVE-<UTCSTAMP>-02` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 03 | `FLP1-LIVE-<UTCSTAMP>-03` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 04 | `FLP1-LIVE-<UTCSTAMP>-04` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 05 | `FLP1-LIVE-<UTCSTAMP>-05` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 06 | `FLP1-LIVE-<UTCSTAMP>-06` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 07 | `FLP1-LIVE-<UTCSTAMP>-07` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 08 | `FLP1-LIVE-<UTCSTAMP>-08` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 09 | `FLP1-LIVE-<UTCSTAMP>-09` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |
| 10 | `FLP1-LIVE-<UTCSTAMP>-10` | `NOT_CREATED_TERMINAL_CLEANUP_MISSING` |

No mechanic is assigned, no Telegram request or READY notification is sent,
and no branch, preview, immutable artifact or backend row exists for these
markers. Two Dots/`orthogonal-link-v1`, Klondike/`solitaire-v1`, Smash/
`smash-fest-v1`, release `6c267c01-1fc5-4137-a2c6-e81142d67972`, ticket #82
and receipt-only PR #83 are explicitly excluded from any future smoke.

The evidence retained for slots 01–10 is the deterministic test output and
exact CI runs already attached to PRs #27/#30/#62. Nothing is deleted. A
follow-up may authorize real tasks only after a reviewed, idempotent
server-owned terminal transition removes the operator-queue projection while
retaining request, outbox and immutable artifact evidence.

## 5. Executable smaller live smoke: zero-task/read-only

This packet permits no live task write. The attended live smoke is limited to
10–15 minutes of compatibility and fail-closed observation:

1. Capture SHA-256 of live `index.html`, `release.json` and `versions.json`,
   the live static `STATIC_SHA`, backend `/api/health`, DB verifier receipt,
   Generator `/health`, and Generator `GET /v1/playable-releases`.
2. On Telegram mobile aspect and desktop aspect, open the focused negative
   route
   `https://swipe-platform.onrender.com/?candidateReview=00000000-0000-4000-8000-000000000000`.
   It must show unavailable/invalid server binding, no approval CTA, no game,
   and no caller-authored URL. Network evidence must contain no POST/PATCH/
   DELETE, no `/session`, no normal feed boot and no `versions.json` fetch from
   the focused route.
3. In an attended production DB console, run the following before and after
   step 2 inside `BEGIN TRANSACTION READ ONLY`; both result sets must be
   byte-identical:

```sql
SELECT 'catalog_entries' AS authority, count(*) AS rows,
       md5(coalesce(string_agg(to_jsonb(t)::text, E'\n' ORDER BY to_jsonb(t)::text), '')) AS digest
FROM catalog_entries AS t
UNION ALL
SELECT 'feed_mechanic_mappings', count(*),
       md5(coalesce(string_agg(to_jsonb(t)::text, E'\n' ORDER BY to_jsonb(t)::text), ''))
FROM feed_mechanic_mappings AS t
UNION ALL
SELECT 'feed_roster_activations', count(*),
       md5(coalesce(string_agg(to_jsonb(t)::text, E'\n' ORDER BY to_jsonb(t)::text), ''))
FROM feed_roster_activations AS t
UNION ALL
SELECT 'feed_slot_authorizations', count(*),
       md5(coalesce(string_agg(to_jsonb(t)::text, E'\n' ORDER BY to_jsonb(t)::text), ''))
FROM feed_slot_authorizations AS t
UNION ALL
SELECT 'feed_decisions', count(*),
       md5(coalesce(string_agg(to_jsonb(t)::text, E'\n' ORDER BY to_jsonb(t)::text), ''))
FROM feed_decisions AS t
ORDER BY authority;
```

4. Re-fetch the three live static files and require their SHA-256 values and
   `swipe-platform/master` to remain unchanged from step 1.

This proves the reduced smoke did not mutate manifest, catalog, mapping,
roster or allocation authority. It does **not** claim positive live READY,
Telegram delivery, in-platform candidate lifecycle or ten-task concurrency.

The positive ten-task acceptance remains deterministic and is re-runnable on
the exact merged sources without production writes:

```bash
(cd swipe-generator && node --test \
  test/playable-rework-auto-coordinator.test.mjs \
  test/playable-release-service.test.mjs)
(cd swipe-backend && .venv/bin/python -m pytest -q \
  tests/test_playable_release_ready.py \
  tests/test_catalog_lab_auth.py)
(cd feed-prototype && npm run check:catalog-lab-entry-browser && \
  npm run check:feed-roster-browser && \
  npm run check:operator-playable-reworks)
```

## 6. Rollback

Rollback is attended and never automatic.

1. **Static failure before backend deploy:** require
   `swipe-platform/master == STATIC_SHA`; revert only the two feed deploy
   commits, newest first, and push the revert commits. Do not reset history or
   touch `playable-previews/`. Wait for Render Static terminal success and
   verify live bytes equal the §1 baseline.
2. **Backend candidate became live:** dispatch the same `Platform production
   release` workflow with `operation=rollback`, the same candidate build run,
   candidate manifest SHA-256 and LKG run `31187976429`, and
   `expected_current_deploy=<exact candidate deploy id>`. Rollback is image-only
   to the pinned digest; it verifies DB `0077` compatibility and never runs
   `alembic downgrade`.
3. **Backend deploy never became live:** keep the original deploy; do not issue
   a rollback or retry. Revert the static feed as in step 1 if the window must
   close.
4. **Generator restart failure:** reinstall once from the preserved clean
   previous live Generator `e3f960120510c56c81b259725229ebf3d051561d`
   with the same data root/environment. Do not remove `.data`, journals,
   outbox state or immutable previews.
5. End only after exact backend deploy/image, DB revision, static hashes,
   Generator checkout/PID and all pre-existing release IDs are recorded.

Any retry, data rollback, schema downgrade, task creation, replacement
notification, approval/cancel, publication or activation requires a new
operator decision.

## 7. Terminal decision

- Exact merge/rollout route: **READY FOR A SEPARATE OPERATOR GO**.
- Zero-task/read-only live compatibility smoke: **READY FOR THE SAME GO**.
- Ten real Telegram tasks and full live acceptance: **STOP**.
- Estimated attended time after GO: **45–90 minutes** for merge, static build,
  image publication, production cutover and one Generator restart, plus
  **10–15 minutes** for the read-only smoke.

Until the operator signs the exact meta head and packet SHA-256, execute
nothing in this document.
