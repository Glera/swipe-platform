# Platform Reliability R1-A — запрос pre-cutover authority

Prepared: 2026-08-03 UTC.

Status: **READY FOR OPERATOR DECISION — AUTHORITY NOT GRANTED**.

Immutable production pair is complete and accepted at evidence commit
`e7d782bdac44198ca4ed63e7211eb8a0db37577f`. The remaining prerequisite for a
final cutover GO is a fresh attended production-state capture plus an exact
GitHub `production` environment. This document requests only that preparation
window. It does not request merge or deploy authority.

## Fixed release identities

| Role | Exact value |
| --- | --- |
| successor PR/head | `Glera/swipe-backend#48` at `11c9bce9891ae5b041215056ac4521551a056cb5` |
| reviewed workflow ref | `codex/r1a-production-cutover-v1-20260802` |
| baseline run/image/manifest | `30789375002`; `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb`; `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |
| candidate run/image/manifest | `30789817457`; `sha256:1969bd9afeb948d9ab40432dd11e629d22ef37cc863204b97d6f45ef5ff6b8df`; `1e708f6418ddc88689ab0aae5cd67b7ce65ceb962cc50eaea81d7973b991613b` |

Both allowed publishing dispatches are consumed. This window must not rebuild
or redispatch either image.

## Requested actions

One attended window may:

1. create one temporary account-wide Render API key, held outside argv, logs
   and git;
2. run the reviewed GET-only provider capture against the exact production
   owner, Blueprint, web, two surviving crons, PostgreSQL and durable GHCR
   credential;
3. create one Render web-service job with the exact command `alembic current`;
   no upgrade, downgrade or schema write;
4. create GitHub environment `production`, restricted to the one reviewed
   custom branch `codex/r1a-production-cutover-v1-20260802`;
5. add exactly one environment secret, `RENDER_API_KEY`, and these six
   environment variables:

   | key | exact value |
   | --- | --- |
   | `RENDER_SERVICE_ID` | `srv-d95r3bfavr4c73aqsi4g` |
   | `RENDER_BLUEPRINT_ID` | `exs-d95qo3q8qa3s73ea23p0` |
   | `RENDER_OWNER_ID` | `tea-d1m4lmali9vc73euvelg` |
   | `RENDER_REGISTRY_CREDENTIAL_ID` | `rgc-d9np7tajnfac73bi5ib0` |
   | `PLATFORM_DATABASE_IDENTITY` | `swipe-production` |
   | `PLATFORM_RELEASE_AUTHORITY_SCOPE` | `production` |

6. read back bounded receipts proving the exact branch policy, secret-name
   set, variable set and continued absence of repository-level `RENDER_*`
   authority;
7. commit the fresh evidence and obtain independent review of the final
   cutover packet.

GitHub environment configuration is exact: zero-minute wait, no reviewers,
`prevent_self_review=false`, custom-branch policy enabled, protected-branch
policy disabled. Human authorization remains this explicit operator gate;
the environment isolates the secret and prevents execution from any other
ref. The workflow's concurrency group remains the single-flight writer.

## Hard stops

Stop before any mutation beyond cleanup if a reviewed SHA/digest moves, PR #48
is not draft/unmerged at the exact head, backend `master` moved from accepted
Stage 0 SHA `a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`, `production` unexpectedly
pre-exists, repository `RENDER_*` authority appears, any Render identity or
consumer changes, Auto Sync/Deploy is not provably off, an operation is active,
the current deploys differ from the accepted capture, or the database is not
exactly PostgreSQL 16 at `0070_published_test_delivery`.

The last accepted deploys are only stop sentinels until the fresh capture:

- web `dep-d9mtmabm8hqs73cighmg`;
- sequencing `dep-d9mtmabm8hqs73cigjk0`;
- materialize `dep-d9mtmajm8hqs73cigkc0`.

Any difference requires explanation and a newly reviewed packet, not silent
substitution.

## Explicitly forbidden

No PR merge; no cutover workflow dispatch; no `prepare-source`, `deploy` or
`rollback`; no Render source/image/environment/Auto Deploy/Blueprint change;
no migration; no image publication; no Stage 1 rebase, merge or rollout.

If preparation fails, delete only the newly created `production` environment
and revoke only the temporary Render API key. Preserve the durable GHCR pull
credential. No service rollback is needed because this window cannot mutate a
service.

The final cutover decision is attended and time-bounded: if the separate
cutover GO is not received within 60 minutes after environment verification,
delete the environment and revoke the temporary key. A later attempt repeats
the entire fresh capture; it never reuses this packet as live authority.

## Exact operator wording

The following is a request template, not authorization:

> GO R1-A pre-cutover preparation for packet `<commit>` only. Create one
> temporary account-wide Render API key; run the exact production provider
> capture and one `alembic current` job; create GitHub environment `production`
> with the exact candidate-branch policy, one secret and six variables from
> the packet; produce receipts and independent review. Merge, cutover workflow
> dispatch, Render service mutation, deploy, migration, image publication and
> Stage 1 mutation remain forbidden. On failure, delete the created environment
> and revoke the temporary key. If the separate cutover GO is not received
> within 60 minutes after environment verification, perform the same cleanup.

After this preparation passes, the final packet will name its commit, capture
digest/time, exact current deploy and database revision. A second, separate
operator GO will be required for the attended merge and cutover sequence.

The exact execution sequence and no-clobber payloads are frozen in
`platform-reliability-r1a-cutover-preparation-runbook-20260803.md` and the two
`platform-reliability-r1a-github-production-*-payload-20260803.json` files.
They do not grant authority independently.
