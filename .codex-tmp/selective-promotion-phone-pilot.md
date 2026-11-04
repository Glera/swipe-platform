## Objective

Complete the frozen selective-promotion v1 contract for the existing `sort/base` catalog pilot: from the phone, show the exact dev/public identity and let the exact operator advance the already reviewed catalog entry through the existing bounded promotion ladder without adding a second publication system.

Depends on terminal #109 presentation vocabulary and #230 read-only catalog projection. This ticket is the mutation slice after both.

## Product boundary already fixed

- Audience carrier is catalog/allocation; no dev-static or second delivery channel.
- V1 audiences are `Только мне` and `Доступно всем`; team cohort remains deferred.
- Entering the private dev feed has no confirmation-code step.
- The final dev/canary → public transition keeps an explicit content-bound confirmation code, as decided by the operator.

## Bounded implementation

### Backend

- Add an exact-operator TMA adapter over the existing `catalog_operator_promotion` domain service; do not duplicate its lifecycle/locking/evidence logic.
- Request identity is closed and minimal: schema, operation UUID, entry UUID, expected state version and requested transition. Actor comes only from verified TMA identity.
- Client cannot submit reason, runtime identity, canary envelope, evidence or public authority. Backend derives all of them from the locked catalog entry, original consumed human approval and one versioned pilot policy.
- Pilot policy v1 is code-pinned and reviewable. Proposed conservative envelope is `maxServes=20`, `maxPlayers=10`, `minObservationHours=24`; this exact product/rollout choice remains `NEEDS_OPERATOR_DECISION` before authoring. Paused is refused; canary → published keeps every existing observation/player/series closure.
- `prepare` returns the exact server-derived summary and action closure. For the public transition it also returns `confirmationCode = first 6 uppercase hex characters of SHA-256(JCS({entryId,stateVersion,runtimeArtifactDigest,action}))`.
- `apply` recomputes the closure under the same locks and requires the exact code only for `canary → published`. Any drift is a typed conflict. The code is anti-misclick friction, not a credential; TMA authentication and the original consumed content approval remain the authority.
- Reuse existing operation-id idempotency and append-only promotion receipt. No new table, migration, grant, secret, cron, dispatcher or scheduler.
- Existing `ENABLE_CATALOG_OPERATOR_PROMOTION` remains the default-off master gate; activation/settings are a later explicit operator act.

### Feed

- In `Изменения dev-ленты`, show `Начать проверку` only for an eligible candidate and `Сделать доступным всем` only for an eligible canary whose server projection says evidence is ready.
- Render exact entry/runtime/state-version summary before action. Public action requires typing the six-character code; private/canary action uses an ordinary confirm sheet.
- After success, refresh `/api/session` and render the server-owned resulting audience/state; never optimistically claim public.
- Mobile-first, text+icon semantics, no raw machine token in operator copy.

## Acceptance

1. Foreign/non-operator sessions have no additive wire or controls.
2. Malformed/stale/mismatched entry, action, state version or code fails closed without mutation.
3. Candidate → canary is exact replayable and uses only the operator-approved policy v1 values.
4. Canary → published refuses before the existing 24h/player/series evidence closes.
5. Exact public code + closed evidence produces one existing promotion receipt and the refreshed row reads `Доступно всем`.
6. Paused, recalled, already-published and ambiguous projections expose no unsafe action.
7. Focused + full Backend/Feed CI and one physical Mac B Tier-2 review of the shared wire before merge.
8. No deploy/settings/public act in the code package; activation and the first real public promotion remain separate operator acts.

## Explicit non-goals

No team cohort, bulk promotion, public-all button, environment manager, new auth framework, background worker, auto-promotion, second catalog publisher, #136 transport, Generator/Labs authoring or public rollout in this ticket.

## Operator decision before authoring

Confirm or replace the proposed pilot envelope: `20` total serves, `10` distinct players and `24` observation hours. No implementation or activation may infer this rollout policy from the example values in the older CLI documentation.
