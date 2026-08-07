# Labs Fast Lane — enabling exit receipt

Status: **IN PROGRESS — backend/static/Labs enabled and temporary credentials
cleaned up; first Telegram update-dogfood is still required. This document is
not a terminal PASS receipt yet.**

Authority packet:
`docs/receipts/labs-fast-lane-enabling-deploy-packet-2026-08-06.md`, exact
SHA-256
`9db293d7099ad67c1d8ee47c460ce06218349d18bbfec25ba7139f46dadc1b89`.
Operator GO covered the complete bounded enabling window.

## 1. Reviewed source merges

| Plane | Reviewed head | Merge | Ordered parents / tree proof |
| --- | --- | --- | --- |
| backend | `96a6d80d0bbe0f4db3f0f1b5caff1f2049c09138` | `e5ec2f3eb084fd458f60d4c9b20657f0aefd822a` | parent 1 `ad65ac5ae09ab7b855b59f4b0a7d89328de5caab`; parent 2 is the reviewed head; merge tree equals reviewed-head tree |
| generator | `ec2d43aeb88b9353e417f47d90b856e881845ccb` | `4538c9276f39c965eb1d81fbc240378a3d936107` | parent 1 `d8619d328e148b46d09ee6b170c95df175678887`; parent 2 is the reviewed head; merge tree equals reviewed-head tree |
| feed | `965486d9b177584ed2e495e97ec34abd117693b4` | `e781c7bc1e688e8ab70a30bfc267782daa259ef5` | parent 1 `1c4a221edd337e3a4ec5cfe21c78ea377b72e3a0`; parent 2 is the reviewed head; merge tree equals reviewed-head tree |

Exact-head independent review and CI are linked from the authority packet.
Automatic master checks passed for generator and feed. Backend browser E2E
passed; 26/27 PostgreSQL jobs passed and the remaining job stopped before
checkout/tests after three Docker Hub timeouts pulling `postgres:16`. No
manual rerun or duplicate dispatch was made; the byte-identical reviewed tree
had a green exact-head PostgreSQL matrix.

## 2. Immutable backend publication and deploy

Preflight observed production at migration
`0073_platform_release_receipts`, live deploy
`dep-d9q832tbedkc73b9tov0`, and LKG image
`sha256:32a6eca8ac6c4f50a9eb9875aaa1724ad29962ad39a6ff194441eb4389d37b52`.

- image workflow: run `31149688950`, attempt 1, exact backend merge
  `e5ec2f3eb084fd458f60d4c9b20657f0aefd822a`, success;
- candidate manifest SHA-256:
  `36579743f06b2df0690a690a30e8d51bce8732805ff3b8907887c39ca00429a0`;
- candidate image:
  `sha256:fdd5bab35a5b8892caf47d3f9a5e66f36dff21543fc210f6997321d265e0d0a6`;
- compatibility: exact code range
  `0073_platform_release_receipts` →
  `0074_feed_playable_release_scope`; LKG forward range remains
  `0070_published_test_delivery` →
  `0074_feed_playable_release_scope`;
- `prepare-source`: run `31150197148`, attempt 1, success, receipt SHA-256
  `e31a60ee07b6d4f71f0c430168dde6e0439c6377b7c87dc333eb9443ba8a411b`;
- `deploy`: run `31150249214`, attempt 1, success, receipt SHA-256
  `68c99eaa37ce63863842b45e73c7138b150ce6226f249bdc368ee8b88a77f9c7`;
- new live deploy: `dep-d9qmm8cs728c73a5lusg`; verification job:
  `job-d9qmmics728c73a5mm00`;
- public `/api/health`: HTTP 200 / `ok=true`;
- independent read-only Alembic observation after deploy:
  `0074_feed_playable_release_scope (head)`.

There was one dispatch for each of image publication, `prepare-source`, and
`deploy`. There was no retry, rollback, Blueprint replacement, manual
migration, or manual Render deploy.

## 3. Static feed publication

The feed-only release used clean exact sources and no playable IDs or profile
environment overrides:

- playables/deploy tooling:
  `92f56c0aa218dbde5c8956370560840bfc78beef`;
- feed: `e781c7bc1e688e8ab70a30bfc267782daa259ef5`;
- previous platform master:
  `09610cc6a010a45b873238018d1ae81d2f6c798f`;
- resulting platform master:
  `3ea6fd4bae7283ea99ece682cde37e4c8a79ec43`;
- release profile: `cohort-operator`, file SHA-256
  `44298d1a7b0d0783f9bd51c82ac939b7146d9940d12b6cf2932ac03eafc5092f`;
- `release.json` pins the merged feed and exact-user operator
  `telegram:42692410`; all three Island client flags remain false;
- public `index.html` SHA-256
  `835bc244b9076ffee092ddd7ceedbc7e0d358bc161bdaac3014eae80a216cd57`
  equals the exact bytes in platform master.

No playable was rebuilt and no mapping, roster, or backend record was changed
by this feed-only publication.

## 4. Local Labs activation

The dedicated clean checkout
`/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-live` was
updated to exact generator merge
`4538c9276f39c965eb1d81fbc240378a3d936107` and the existing LaunchAgent was
reinstalled once with `SWIPE_PLAYABLE_RELEASE_ENABLED=1`.

- runtime: pinned Node `v24.14.0`;
- service: `com.p4g.swipe-generator`, running from the dedicated clean
  checkout;
- preserved data root:
  `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator/.data`;
- preserved platform/catalog/manifest endpoints;
- `GET /health`: `ok=true`;
- `GET /v1/playable-releases`: schema
  `lab.playable-release-list.v1`, `enabled=true`, zero release records;
- Lab HTML contains **Композер → Релизы механик**;
- enabling the flag did not start a release.

## 5. Required terminal evidence — pending

The exit receipt remains open until all rows below have direct evidence.

| Requirement | Current evidence |
| --- | --- |
| revoke temporary Render key `labs-fast-lane-enabling-20260807` | **PASS**; authenticated Render dashboard lists zero rows with that exact name after operator revocation |
| remove GitHub environment secret `RENDER_API_KEY` | **PASS**; environment secret inventory is `[]` |
| delete local secret holder / prove unusable | **PASS WITH SUBSTITUTE PROOF**; plaintext was deliberately not retained for a 401 probe, active-key inventory is zero for the exact name, GitHub secret is absent, and a bounded local name search outside docs/receipts found no holder |
| one tiny reviewed update prepared in Labs | **PENDING INPUT** |
| exact Telegram approval | **PENDING** |
| static commit, hosted byte verification and `LIVE` receipt | **PENDING** |
| Mini App observation of the intended change | **PENDING OPERATOR OBSERVATION** |
| mapping/roster/backend/DB unchanged across the update dogfood | **PENDING POST-DOGFOOD CHECK** |
| independent review of this terminal receipt | **PENDING AFTER ALL EVIDENCE EXISTS** |

Credential cleanup did not remove the six non-secret repository variables and
did not invoke any workflow, service mutation, deploy, migration, or rollback.
