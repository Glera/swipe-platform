# Labs Fast Lane — one-time enabling deploy packet

Status: **FINAL INDEPENDENT REVIEW GO (no P1/P2); awaiting exact-head PR CI.
Not an operator GO and not permission to merge or deploy.**

Purpose: one bounded enabling window after which an ordinary first-party
playable update/add is performed from Labs + one Telegram approval. Render,
backend migration, GitHub release workflows, and terminal commands do **not**
belong to the recurring content-release path.

## 1. Packages

| Plane | PR | Expected base | Reviewed head | Merge condition |
| --- | --- | --- | --- | --- |
| backend authority + migration | `Glera/swipe-backend#58` | `ad65ac5ae09ab7b855b59f4b0a7d89328de5caab` | `3640b75c87b58cda54b437cedeb36c553bec3de3` | exact head is second parent; merge tree equals reviewed tree |
| Labs job/UI | `Glera/swipe-generator#15` | `d8619d328e148b46d09ee6b170c95df175678887` | `ec2d43aeb88b9353e417f47d90b856e881845ccb` | exact head is second parent; merge tree equals reviewed tree |
| feed/TMA mobile entry | `Glera/feed-prototype#23` | `1c4a221edd337e3a4ec5cfe21c78ea377b72e3a0` | `965486d9b177584ed2e495e97ec34abd117693b4` | exact head is second parent; merge tree equals reviewed tree |

Independent source review and local verification are recorded in:

- `docs/receipts/labs-fast-lane-independent-review-2026-08-06.md`;
- `docs/receipts/labs-fast-lane-verification-2026-08-06.md`.

The PR merges themselves are not production changes: the backend service is
image-backed, the static feed is published from `swipe-platform`, and the local
Labs service runs from its dedicated clean checkout.

## 2. Preflight (read-only)

Immediately before requesting the enabling GO, record:

- all three exact merge pins and green exact-head/merge CI;
- `playables/master` and `swipe-platform/master` pins;
- current live backend deploy ID, image digest/build run, manifest digest and
  public backend SHA;
- database revision, which must be exactly
  `0073_platform_release_receipts` before this package;
- current `swipe-generator-live` head, service plist environment and
  `http://127.0.0.1:4317/` health;
- current static `release.json`/`versions.json` and feed source identity.

STOP on any source drift, non-green required CI, unexpected database revision,
multiple live backend deploys, or dirty dedicated Labs checkout. No retry or
repair is implicit in this packet.

## 3. One attended enabling window

The operator gives one GO for the complete bounded window. Agents may prepare
commands and evidence, but the operator performs credential entry and any
irreversible dashboard action.

### 3.0 Merge the reviewed packages

For each PR, recheck exact head, expected unchanged base, mergeability and every
required exact-head check. Merge once with merge-commit semantics. Record the
merge SHA, ordered parents and tree; STOP unless parent 2 is the reviewed head
from §1 and the merge tree is byte-identical to that reviewed head. This
construction proves that no unreviewed source entered the enabling build.

Do not manually dispatch or rerun CI. Automatic master checks may run under the
repository's existing policy; record them without creating a duplicate run.
Only after all three merge proofs exist do the following phases begin.

### 3.1 Backend image and migration

1. Publish exactly one candidate image from the exact backend merge pin using
   `.github/workflows/platform-release-image.yml` with all cross-repository and
   LKG pins taken from §2. Candidate compatibility is the exact chain
   `0073_platform_release_receipts → 0074_feed_playable_release_scope`.
2. Accept by the downloaded immutable manifest, not by run status alone.
3. Create one bounded temporary Render API key and place it only in the GitHub
   `production` environment secret used by the existing cutover workflow.
4. Run the existing `prepare-source` operation once, then `deploy` once, each
   with the same candidate manifest and current-deploy CAS. The deploy may run
   Alembic `0073 → 0074` under the existing advisory lock and durable release
   receipt.
5. Verify the committed release receipt, exact image digest, public health,
   backend SHA and database revision `0074_feed_playable_release_scope`.
6. Revoke the temporary Render key, remove the GitHub secret, delete any local
   holder, and prove the key unusable. Non-secret repository variables remain.

No rehearsal, Blueprint replacement, extra dispatch, rerun, manual migration,
or manual Render deploy is part of this window.

### 3.2 Feed/TMA static publication

From clean exact `playables/master`, whose committed
`deploy-profiles/swipe-release-profile.json` must match the profile captured in
§2, run `bash scripts/deploy-swipe.sh` **without playable ids and without env
overrides**. The script builds `feed-prototype`, creates the corresponding
`swipe-platform` content/stamp commits and lets Render Static auto-deploy. No
playable is rebuilt and no roster/mapping changes.

Acceptance:

- public `index.html` equals the exact `swipe-platform` commit bytes;
- `release.json` records the exact merged feed source;
- `release.json` records the same pinned profile identity and digest captured
  in §2;
- one Mini App open receives the fresh session before ring construction;
- a non-operator does not see the rework action;
- the operator sees **Доработать механику** only for an exact active first-party
  mapping.

### 3.3 Local Labs activation

Update the dedicated clean checkout
`/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-live` to the
exact generator merge pin. Preserve the existing data root, platform origin,
deployed manifest, catalog endpoint and client labels. Reinstall the existing
LaunchAgent once with `SWIPE_PLAYABLE_RELEASE_ENABLED=1`; do not modify the
operator's dirty development checkout.

Acceptance:

- `npm run service:status` identifies the exact clean checkout;
- `http://127.0.0.1:4317/` is healthy;
- **Композер → Релизы механик** is visible and reports enabled;
- existing factory/mobile-review data is intact;
- no release begins merely because the feature was enabled.

## 4. End-to-end dogfood before closing the window

Use an intentionally tiny already-reviewed playable source change:

1. submit or claim one exact rework;
2. prepare the update in Labs;
3. open the public HTTPS candidate in Telegram;
4. approve the exact intent once;
5. observe the static commit, live byte verification and `LIVE` receipt;
6. open Mini App once and observe the change.

This dogfood is an **update**, so mapping, roster, backend, database and Render
must remain unchanged after §3. It proves the recurring 5–10 minute path.
The first new-mechanic add is a second product dogfood later; it uses the same
enabled system and should not require another platform deploy.

## 5. Rollback/STOP

- Before backend deploy: stop; revoke the temporary key and remove its GitHub
  secret. No other rollback is needed.
- Backend deploy terminal failure: capture state literally, perform terminal
  credential cleanup, and request a separate rollback GO. Blind retry is
  forbidden.
- Backend candidate is bad after deploy: existing cutover rollback returns to
  the exact pinned LKG image; the forward-compatible schema remains at 0074.
- Feed UI is bad: publish a normal revert of only the static feed commit. Do not
  rewrite `swipe-platform` history.
- Labs UI/job is bad: reinstall the same merged generator with
  `SWIPE_PLAYABLE_RELEASE_ENABLED=0`; journal/data remain intact.
- `envFlagEnabled('0') === false` is covered by the generator flag test and is
  rechecked before relying on the preceding rollback.
- Dogfood candidate is bad before approval: cancel it. Its content-addressed
  preview is inert and no production identity changes.

If `playables/master` or `swipe-platform/master` drifts after candidate
preparation, the frozen intent is burned by design: cancel and prepare a new
release. Labs must not offer the ineffective publication retry for either drift
code. A slow Render Static propagation may time out the live verifier without
changing approved bytes; after checking the exact static commit, retrying that
same publication verification is allowed.

## 6. Exit receipt

The terminal receipt must link exact backend/feed/generator/swipe-platform
commits, image and manifest digests, release receipt, database revision,
temporary-key cleanup, public/static byte checks, local service health, and the
first update timeline. Only then is Fast Lane marked enabled.
