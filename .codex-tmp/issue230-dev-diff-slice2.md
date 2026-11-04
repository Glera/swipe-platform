## Objective

Complete the next read-only slice of the frozen selective-promotion contract without adding publication authority:

1. replace the placeholder `sort/base · данных пока нет` with a server-owned catalog dev/public identity;
2. stop showing an exact-user adoption after the same candidate bytes are already present in the public static mechanic manifest;
3. keep platform terminal status sourced from the existing durable development-intake terminal receipt.

Inputs: meta PR #118 comments `5329395150` and `5370482737`; frozen contract `docs/specs/developer-feed-selective-promotion-reconciliation-20260818.md`.

## Bounded scope

### Backend (`swipe-backend`)

- Add an operator-only, read-only catalog projection to `/api/session` under the already-existing operator-surface gate.
- V1 is intentionally the existing pilot identity `sort/base` only.
- Project exact candidate/canary/paused and published entry identities from authoritative catalog rows, with their state/version/change time and compatible runtime release identity when resolvable.
- Fail closed to an explicit unavailable projection on integrity ambiguity; never strand session identity/balance bootstrap.
- No migration, no new feature flag, no mutation route.

### Feed (`feed-prototype`)

- Strictly validate the additive session projection and render dev/public catalog identity in `Изменения dev-ленты`.
- Compare the adopted candidate digest with the already-fetched public `versions.json`; if the exact bytes match, suppress the stale exact-user overlay and its false `Только мне` row.
- Preserve the current durable platform-intake terminal vocabulary and existing capability-gap/superseded presentations.
- No `Продвинуть…` control and no publication action in this slice.

## Acceptance

- Foreign/disabled sessions remain byte-compatible: the new field is absent.
- Authorized operator session gets one exact `feed.developer-catalog-diff.v1` projection.
- `sort/base` shows distinct dev/public identities or an honest server-owned unavailable reason.
- A candidate whose digest equals the public manifest is not mounted or counted as exact-user dev state.
- A genuinely different candidate remains exact-user and unchanged.
- Existing platform terminal receipts still render READY/NEEDS_HELP without a GitHub call from the client.
- Focused backend/feed tests, full native CI, and one blind Tier-2 exact-head review for the shared wire are required before merge.

## Explicit non-goals

- no static dev channel, cohort manager, bulk publish, environment manager, task scheduler or dispatcher;
- no catalog admission/promotion mutation;
- no live migration, deploy, settings, credentials, permissions or infrastructure;
- no change to #229 Generator transfer or the parked #136 bridge.
