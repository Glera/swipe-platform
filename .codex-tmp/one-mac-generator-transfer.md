## Objective

Transfer the single live `swipe-generator` / Lab runtime from Mac A to its permanent domain owner, Mac B, without copying credentials, replaying requests, or running two consumers concurrently.

This is the one-time topology migration authorized by the operator on 2026-08-27. It implements the authoritative one-Mac-per-domain decision. It is not a revival of the parked cross-Mac auto-wake experiment in #136.

## Frozen source identity and Mac A preflight

- Generator master: `e273a3f34d19d142b6cb8253146b7402485140a6`
- Tree: `3dab3382c7cceeaf9ba5454dfa833ccbbc1e6850`
- Master CI: https://github.com/Glera/swipe-generator/actions/runs/33064984596 — `SUCCESS`
- Current Mac A runtime health: `ok=true`, `queued=1`, `running=0`, `deferred=0`, `reviewPending=0`
- Release projection: `enabled=true`, `reworkAvailable=true`, `PREPARING=0`, agent `running=0`, `automaticIntake=true`
- Current runtime host: Mac A LaunchAgent `com.p4g.swipe-generator`

The single queued item is durable backend work and must not be reset, recreated, or executed by two runtimes at once.

## Authority and hard boundaries

Authorized:

1. Create one fresh, server-owned Mac B device authorization for scope `operator:flags:write`, using the normal device flow and client name `Mechanic Lab · Mac B Content`.
2. Prepare one exact detached Mac B live checkout at the frozen Generator identity above.
3. Install one standard Mac B LaunchAgent with the existing non-secret production endpoints and a fresh Mac-B-local data root.
4. Disable and unload the legacy Mac B cross-Mac wake gate while preserving its state and receipts as audit evidence.
5. After durable `MAC_B_PREPARED`, unload the Mac A Generator once; only after durable `MAC_A_CUTOVER_RELEASED`, load the Mac B Generator once and run health/auth/list smokes.

Forbidden:

- copying the Mac A authorization, refresh token, data root, or any credential file;
- adding Render secrets, permissions, infrastructure, or a second runtime consumer;
- request reset/retry/recreate/replay, release/publication/product actions;
- automatic retry or rollback after any deviation;
- reviving #136 session binding or cross-Mac prompt transport.

If an indispensable local-only draft/state is found on Mac A or Mac B, or any identity/CAS/auth/health check differs, stop and publish a typed receipt. Do not improvise a state copy.

## Phase 1 — Mac B PREPARE (no runtime load)

The existing Mac B owner session performs exactly one bounded preparation pass:

1. Fetch and verify the frozen Generator commit/tree and green CI above in a clean detached live checkout.
2. Verify the normal GitHub repository access already present on Mac B; do not create a credential if absent.
3. Disable/unload `com.p4g.two-mac-wake-gate` if present; preserve config/state/receipts, and do not consume/replay any wake.
4. Create a fresh mode-0700 Mac-B-local Generator data directory. Do not seed it with Mac A data or auth material.
5. Start exactly one normal device-authorization flow for `operator:flags:write`, client name `Mechanic Lab · Mac B Content`. Return only the safe `verificationUri`, `userCode`, and expiry to the operator.
6. After the operator approves `Mac B · Content/Labs`, poll the same flow to durable `authorized` and verify the server-held `submitter_machine=mac-b`. Never print access or refresh tokens.
7. Render/install the standard Generator plist but leave it unloaded. Reuse the current non-secret production endpoints and feature switches; do not add secrets.
8. Publish one `MAC_B_PREPARED` comment here containing exact checkout commit/tree, sanitized plist/config identities, data-root path, device authorization id/grant expiry, machine binding readiness, wake-gate disabled evidence, and confirmation that the Generator process is not running.

Then stop and wait. Do not load the Generator before the Mac A release marker.

## Phase 2 — Mac A RELEASE

After exact `MAC_B_PREPARED` is read and verified, the Mac A owner:

1. Rechecks `running=0` and `PREPARING=0` on the live Generator.
2. Unloads `com.p4g.swipe-generator` exactly once and verifies zero Generator processes on Mac A.
3. Preserves the Mac A data root and old authorization read-only as audit evidence; does not delete or copy them.
4. Publishes `MAC_A_CUTOVER_RELEASED` here with timestamp, prior exact runtime identity, and zero-process evidence.

Any drift is `STOP`; no unload retry or rollback.

## Phase 3 — Mac B ACTIVATE

Only after reading the exact `MAC_A_CUTOVER_RELEASED` marker, the same Mac B owner:

1. Loads the prepared LaunchAgent exactly once.
2. Proves exactly one Generator process on Mac B and none on Mac A according to the release receipt.
3. Runs `/health`, authorized release-list/rework-list, and capability/intake read-only smokes; proves `automaticIntake=true`, `PREPARING=0`, agent `running=0`, and the Mac B server-owned binding.
4. Does not approve, publish, promote, retry, or recreate any request/release.
5. Publishes one terminal `HANDOFF_READY` receipt here with process identity, exact commit/tree, health/auth/list evidence, and LaunchAgent state.

## Acceptance

- Mac B is the only live Generator/Lab runtime host.
- Mac A Generator is unloaded and preserved only as audit state.
- Fresh server-owned Mac B authorization is proven; no Mac A token was copied.
- Legacy #136 gate is disabled on both Macs and stays out of the product path.
- No request/release replay and no duplicate consumer occurred.
- The next mechanic request can run entirely inside the Mac B domain; the next platform request remains entirely inside Mac A.
