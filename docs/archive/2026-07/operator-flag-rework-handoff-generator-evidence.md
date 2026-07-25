# Operator flag rework handoff — generator evidence

## Scope

- Repository: `swipe-generator`
- Isolated worktree: `swipe-generator-operator-flag-rework-handoff`
- Branch: `operator-flag-rework-handoff-generator`
- Base: `fc1a12e`
- Implementation: `e34dab3 feat(generator): gate field rework dispatch on durable handoff`
- Backend-wire compatibility fix: `54297b4 fix(generator): match operator handoff receipt wire`
- Authority closure fix: `4c26cdc fix(generator): close operator handoff authority gaps`
- Route integration fix: `0ee7fd9 fix(generator): bind route actor into handoff`
- Final reviewed backend contract: `swipe-backend@dbf467e`
- Merge: not performed

The slice implements the Lab/generator half of
`catalog.operator-flag-rework-handoff.request.v1`. It does not modify backend,
feed, publish, recall, or catalog authority.

## Implemented boundary

1. A field flag with `edit_candidate` is prepared locally as an exact derived
   review plus immutable `lab.rework-request.v1`; preparation creates no model
   job.
2. The exact server handoff request is persisted to a private immutable outbox
   before any network request.
3. The Lab POSTs only through the existing `operator:flags:write` authority.
4. No provider job can be enqueued until an exact, content-addressed backend
   receipt has been stored durably and rebound to the local request.
5. Immediately before dispatch, the Lab revalidates the local review,
   LevelSpec/QA/runtime/evaluation/artifact closure and immutable model profile.
6. Reconciliation supports startup recovery, singular backend lookup after a
   lost response, actor receipt listing, and reconstruction of a missing local
   outbox from an open field flag plus deterministic local request state.
7. A field-origin review is marked immutably and the generic
   `createLevelRework` / `POST /v1/level-reworks` path fails closed for it.
   Only coordinator `resolveDispatch`, after a durable ACK, can create the
   physical provider job.
8. The expected actor is captured from the exact open flag into the immutable
   outbox and ACK. Receipt acceptance reconstructs and replays both the full
   server handoff digest and the exact resolution-request hash.
9. The real generator HTTP route propagates the actor returned by
   `localReworkInput` into coordinator preparation; actor-less flags fail before
   outbox creation.

## Backend wire verified against `dbf467e`

- `POST /api/admin/operator-level-flags/{flagId}/rework-handoffs`:
  exact wrapper `catalog.operator-flag-rework-handoff-response.v1` containing
  `{receipt, replayed}`.
- `GET /api/admin/operator-level-flags/{flagId}/rework-handoff`:
  raw exact receipt document.
- `GET /api/admin/operator-level-flags/rework-handoffs`:
  `catalog.operator-flag-rework-handoff-list.v1` with raw receipt items.
- Error responses expose the stable code at top-level `{code}`; the client
  preserves it as `detailCode` for durable delivery classification.

The final compatibility correction is isolated in `54297b4`; its test uses the
actual three response shapes above rather than locally invented stubs.

## NO-GO fix round (`4c26cdc`)

Two independently reviewed authority gaps are closed:

1. **PRE-ACK generic bypass:** the ordinary level-rework entry point rejects
   the immutable field-origin review with
   `operator_flag_rework_handoff_required`. The executable regression uses the
   real dispatcher and proves zero job/attempt before ACK, exactly one physical
   job/attempt through the ACK-gated dispatch path, and no duplicate through a
   subsequent generic replay.
2. **Receipt closure:** `actorUserId` is carried from the server-owned flag into
   immutable outbox and ACK records. Receipt validation reconstructs
   `catalog.operator-flag-rework-handoff.v1` from the exact local command plus
   server IDs/timestamp and replays its `handoffDigest`; it separately rebuilds
   `catalog.operator-flag-resolution.request.v1` and replays
   `resolutionRequestHash`. Re-signed mutations of actor, handoff digest, or
   resolution hash all fail closed.

## Route integration fix (`0ee7fd9`)

The route now passes `actorUserId: local.actorUserId` to the coordinator. A new
process-level HTTP test starts the real generator, a fake catalog/device-auth
server and a real QA parent. It proves:

- an actor-less flag is rejected by the real queue and rework endpoints with
  zero outbox files;
- a valid field rework POST creates an actor-bound outbox, ACK, receipt, one
  provider job and one physical attempt;
- the ordinary `/v1/level-reworks` POST returns the handoff-required conflict
  and cannot add a second job or attempt.

## Durability and crash cuts

- Crash after local request but before outbox: reconstruct from the open flag;
  zero provider attempts.
- Crash after outbox but before POST: durable pending delivery; zero provider
  attempts.
- Backend commit followed by lost response: singular GET or exact POST replay
  recovers the same receipt.
- Crash after durable ACK but before dispatch: startup reconciliation dispatches
  the exact job.
- Concurrent exact submit: one immutable outbox, one ACK and one physical job.
- Same identity with changed bytes: terminal local conflict.
- Terminal backend 409/422: dead-letter; zero provider dispatch.
- Local evidence removed or changed before dispatch: fail closed; zero enqueue.
- Repeated enqueue of an already queued job replays the existing physical job
  rather than attempting an invalid lifecycle transition.

## Verification

Final worktree state:

- `npm run verify`: **291 tests, 291 passed, 0 failed, 0 skipped**.
- Focused handoff/client/service/route run: **20 tests, 20 passed**.
- `git diff --check`: clean before both commits.
- Worktree: clean after `0ee7fd9`.
- Backend-owned golden is consumed directly from
  `swipe-backend/docs/specs/fixtures/operator-flag-rework-handoff-v1.golden.json`;
  there is no generator-owned copy.

## Independent review focus

The reviewer should concentrate on:

1. outbox/ACK no-overwrite semantics and byte-exact replay;
2. backend response shapes against `dbf467e`;
3. provider-dispatch impossibility before durable ACK;
4. dispatch-time revalidation of the full local parent closure;
5. one physical job under replay/concurrency;
6. recovery after each named crash cut;
7. absence of backend/publish/recall authority changes.
