# Platform Reliability R1-A — pre-cutover preparation v2 authority request

Prepared: 2026-08-03 UTC.

Status: **AUTHORITY CONSUMED; CONCURRENT MASTER/STAGE 1 DRIFT; FAIL
CONTAINED**.

The operator granted this exact request for packet `f40e526`. During execution,
Stage 1 PR #41 merged and backend `master` advanced again before the mandatory
read-after-write CAS. The environment and temporary key were removed, and no
cutover action occurred. Exact result:
`platform-reliability-r1a-cutover-preparation-v2-concurrent-drift-20260803.{json,md}`.
This request is historical and cannot be reused.

Independent safe-mode review of exact substantive commit `80768ed` returned
GO with no P1/P2. Exact review receipts are
`platform-reliability-r1a-cutover-preparation-v2-review-20260803.*`.

This request replaces the blocked, non-executable successor-v1 request. It is
bound to accepted evidence head `3ebc6f2`, draft PR #51 at exact successor-v2
head `4714e339b60e3af747d138486ad7eadadec72dac`, and the independently
accepted immutable candidate below.

## Immutable boundary

| Role | Run | OCI index | Manifest |
| --- | ---: | --- | --- |
| retained baseline | `30789375002/1` | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |
| candidate v2 | `30819666007/1` | `sha256:d6aae406275945b30475aa6c797f73d52af6108a715f5c5a4bcfe109fddcd05b` | `a0e128be8ed3fa2484c74108cf324c8a6449be23daa7da5c25943b22b4c4e9e5` |

The candidate's schema capability is
`e31eaf82a8386d20954002577e9b7ec63fe11f4626a2c2f1aab46df2e3fc72b0`;
artifact `8858370713` is unexpired. Neither image may be rebuilt or
redispatched under this request.

At preparation time backend `master` and PR #51 base are exact
`7b41e96ad0d979863159ebdd356122af6295a203`. PR #51 is open, draft,
unmerged and mergeable; its two required CI workflows are green. These facts
are only preparation observations and must pass again immediately before any
temporary key is created.

## Exact bounded window

If and only if the operator names the eventual exact commit containing this
request, the attended window may:

1. repeat every git/GitHub/immutable-image/Stage 1 CAS check;
2. create one temporary account-wide Render API key;
3. run the reviewed GET-only provider capture against the exact production
   owner, Blueprint, web, two cron, database and registry-credential IDs;
4. create exactly one web-service job whose command is `alembic current` and
   require exact output `0070_published_test_delivery (head)`;
5. create GitHub environment `production` with the committed custom branch
   policy allowing only `codex/r1a-production-cutover-v2-20260803`;
6. add exactly one environment secret, `RENDER_API_KEY`, and exactly these six
   variables:

   | Name | Exact value |
   | --- | --- |
   | `PLATFORM_DATABASE_IDENTITY` | `swipe-production` |
   | `PLATFORM_RELEASE_AUTHORITY_SCOPE` | `production` |
   | `RENDER_BLUEPRINT_ID` | `exs-d95qo3q8qa3s73ea23p0` |
   | `RENDER_OWNER_ID` | `tea-d1m4lmali9vc73euvelg` |
   | `RENDER_REGISTRY_CREDENTIAL_ID` | `rgc-d9np7tajnfac73bi5ib0` |
   | `RENDER_SERVICE_ID` | `srv-d95r3bfavr4c73aqsi4g` |

7. read back exact environment policy, secret-name set and variable values,
   prove repository-level `RENDER_*` authority remains absent, and commit
   bounded receipts for independent review.

The plan-compatible environment payload deliberately omits unsupported
wait-timer/reviewer fields. The operator GO remains the human gate. The
environment payload is reused at SHA-256
`2a6cb895a3d98f5f17d7c36082cde31d6870476992d28a86f7950a95109cde1e`;
the new candidate-v2 branch payload is
`caee59d6415c614dafda4fe6b4208e2acac761e358f576cc7604351761c7b9b0`.

## Action-time stops

Before the key is created, stop if any exact master/PR/CI/image/artifact or
Stage 1 identity differs, if `production` exists, if any repository
`RENDER_*` authority exists, if a cutover run exists, or if an earlier
temporary Render key remains.

After the key is created, the last confirmed provider values are comparison
sentinels, not replaceable defaults: Blueprint Auto Sync and all three Auto
Deploy controls must remain off; latest deploys must remain
`dep-d9mtmabm8hqs73cighmg`, `dep-d9mtmabm8hqs73cigjk0` and
`dep-d9mtmajm8hqs73cigkc0`; no operation may be active; PostgreSQL must remain
available at major 16 and revision `0070_published_test_delivery`.

Any mismatch stops the window. Do not silently update the packet to whatever
was found.

## Hard prohibition and cleanup

This request does **not** authorize:

- any PR merge or workflow dispatch;
- source/image/environment mutation on a Render service;
- deploy, rollback, `alembic upgrade` or downgrade;
- image publication or rebuild;
- Stage 1 mutation/rebase/merge/rollout;
- generative-feed scope expansion.

Once the environment has been verified, a 60-minute decision deadline starts.
On any failure, declined final decision or expired deadline, delete only the
`production` environment created by this exact window, revoke the temporary
Render key, remove its local handoff, and prove environment `404` plus revoked
key `401`. Preserve the durable GHCR registry credential. No service rollback
is involved because service mutation is forbidden.

Even a successful independently accepted preparation receipt grants no merge
or deploy authority. A later final cutover packet and separate operator GO are
mandatory.

Operator form, not an authorization:

> GO R1-A pre-cutover preparation v2 for packet `<exact-commit>` only. Create
> one temporary account-wide Render API key; run exact GET-only production
> capture and one `alembic current` job; create GitHub environment
> `production` with the committed candidate-v2 branch policy, one secret and
> six variables; produce receipts and independent review. Merge, workflow
> dispatch, persistent Render service mutation, deploy, migration, image publication and
> Stage 1 mutation remain forbidden. On failure or deadline, delete only the
> environment created by this window and revoke the temporary key.
