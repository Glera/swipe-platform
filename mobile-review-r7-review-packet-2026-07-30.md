# Mobile-first Lab review queue — R7 independent review packet

Date: 2026-07-30.

This packet answers the R6 NO-GO in
`mobile-review-independent-review-r6-2026-07-30.md`. Unlike R6, the packet is
being handed off only after all four branches were pushed, draft PRs pointed
at the exact review heads, and remote CI returned literal
`conclusion=success` on every exact SHA.

Nothing has been merged, deployed, enabled, or granted production authority.
The four PRs remain drafts pending independent R7 GO.

## Exact review heads

| Repository | R6 reviewed head | R7 review head | Draft PR |
| --- | --- | --- | --- |
| `swipe-backend` | `2b9207d92dfa7fb46d9fd697dd835a7434d58117` | `8f21f2d1e2afc4cb10c298088c70bd3b7204e47a` | [#30](https://github.com/Glera/swipe-backend/pull/30) |
| `feed-prototype` | `1d7fe0c19c02aff74f74d6fda157d2da73399321` | `9a997c0ca4123209fa66eb89fc77d2ce9d78f8c9` | [#14](https://github.com/Glera/feed-prototype/pull/14) |
| `swipe-generator` | `c160bcef02cd0e15e90b1a5a7a9f291c550b9bae` | `ed7d06d8e8083ea36f9e882dda2945e5d4f64aa5` | [#6](https://github.com/Glera/swipe-generator/pull/6) |
| `swipe-agents` | `45f3847127183c586011c733b767329203725b8a` | `3d91793f4242720f91572c836619b5e7f51df540` | [#10](https://github.com/Glera/swipe-agents/pull/10) |

All four branches are named `codex/mobile-review-r6`; the name is retained so
the R7 reviewer can diff directly from the already-reviewed R6 commit. The
isolated worktrees are `/private/tmp/*-mobile-r6`. The normal generator
checkout and its unrelated dirty work were not touched.

## Literal remote CI evidence

| Repository | Workflow | Exact SHA | Conclusion |
| --- | --- | --- | --- |
| `swipe-backend` | [PostgreSQL acceptance 30545179928](https://github.com/Glera/swipe-backend/actions/runs/30545179928) | `8f21f2d1e2afc4cb10c298088c70bd3b7204e47a` | `success` |
| `feed-prototype` | [verify 30544611959](https://github.com/Glera/feed-prototype/actions/runs/30544611959) | `9a997c0ca4123209fa66eb89fc77d2ce9d78f8c9` | `success` |
| `swipe-generator` | [verify 30544613785](https://github.com/Glera/swipe-generator/actions/runs/30544613785) | `ed7d06d8e8083ea36f9e882dda2945e5d4f64aa5` | `success` |
| `swipe-agents` | [swipe-agents CI 30544619941](https://github.com/Glera/swipe-agents/actions/runs/30544619941) | `3d91793f4242720f91572c836619b5e7f51df540` | `success` |

The first backend run on `5a4c486` exposed a test-isolation mistake: one test
counted every preview-delivery receipt left by the full shared PG run instead
of the two rows for its own exact bundle and artifact. The new migration
roundtrip was already green in that run. Commit `8f21f2d` scoped the assertion
to its exact evidence, and the complete workflow above then passed. No
product code changed between those two backend SHAs.

## R6 blocker disposition

### R6-B1: configured preview evidence was self-asserted

- Migration `0073_mobile_preview_delivery` adds immutable
  `mobile_review_preview_deliveries`.
- Redeeming signed preview bytes writes one append-only receipt bound to exact
  `(bundle_id, artifact_digest, actor_user_id)`, ticket expiry and a digest of
  the ticket signature.
- Configured prototype decisions now require the same actor's exact committed
  receipt. A receipt owned by another operator does not authorize the
  decision.
- The signed preview route itself now requires the existing TMA dev-user
  authentication; the client sends those headers on byte fetch.
- Configured evidence additionally binds `reviewTargetId` to the exact
  `bundle.action.identity`, closing the R6 P3 cross-action gap.
- The physical PG test proves no receipt → reject, other actor's receipt →
  reject, exact actor's receipt → accept, idempotent redeem, append-only
  mutation rejection and guarded downgrade.

Attack again by posting configured evidence without fetching bytes, by
fetching as a second actor, or by re-signing a preview from another action.

### R6-B2: production sandbox literal and CSP path were not pinned

- The production iframe has one named constant and exact literal sandbox:
  `allow-scripts allow-pointer-lock`.
- Adding `allow-same-origin` is now observable on the actual mounted frame,
  not on a parallel test harness.
- All 45 adversarial documents are served as real content-addressed mobile
  artifacts across three real review bundles and mounted through the same
  ticket → authenticated fetch → verified bytes → `srcdoc` path used in
  production.
- Each document attempts external script/image fetch, inline execution,
  `parent.localStorage`, and `parent.fetch`. The corpus is run in both
  Chromium and WebKit.
- Every actual frame is asserted to retain both the exact sandbox and the
  Chromium `iframe[csp]` policy. The embedded frozen CSP remains the
  engine-neutral boundary.
- The frozen bridge listener now runs in capture phase, so a child capture
  listener cannot make an otherwise healthy artifact WebKit-only
  `unresponsive`.

Attack by adding `allow-same-origin`, removing `iframe[csp]`, altering the
embedded CSP, or letting any corpus request reach the escape server.

### R6-B3: unmount had no red-then-green proof

- The lifecycle test now mounts an exact malicious artifact, lets it
  self-navigate to `about:blank` while its eight-second receipt deadline is
  live, abandons the mount, opens the healthy current bundle, obtains exact
  configured evidence, waits beyond the abandoned deadline, and submits.
- The persisted decision must still contain only the healthy bundle's exact
  configured receipt.
- A direct red mutation was run before commit: removing the two production
  `unmountRuntime()` calls made this test fail because the abandoned
  `unresponsive` deadline overwrote the current evidence. Restoring the calls
  made the same test green on both engines.

### R6-B4: publication continuation could remain pending forever

- Retry state now belongs to the exact attempt for the whole continuation
  window; a successful no-op poll does not erase prior failures.
- A state transition may reset the failure count, but never the wall-clock
  start.
- `Retry-After` is combined with local exponential backoff using the larger
  delay.
- The complete continuation has a bounded default 15-minute wall-clock
  deadline.
- Retry exhaustion, wall-clock exhaustion and non-retryable responses all
  terminalize the exact attempt with an explicit typed reason. A 404 or
  malformed terminal response can no longer leave a live Telegram-code card
  with `failure: null`.
- Coverage uses the real `createCatalogLabAuthClient`, including 429
  `slow_down`, no-op polls, `Retry-After`, a wall deadline and a non-retryable
  response. It does not test only a publisher stub.

Attack with 250 no-op ticks, repeated 429/5xx, a `Retry-After` larger than the
local backoff, wall-clock expiry, 404/non-JSON, and a successor exact attempt.

### R6-B5: real Telegram `gave_up` loss was silent

- One durable `failed{gave_up}` delivery earns exactly one replacement through
  the normal enqueue/send FSM.
- The right survives process restart because the bound is derived from the
  append-only store, not process memory.
- A live or confirmed replacement suppresses reconciliation; if the
  replacement also reaches `gave_up`, two terminal rows forbid a third.
- Breaker-summary messages use the same rule and are covered explicitly.
- `StoreWatcher` exposes distinct unresolved `gave_up` references as
  `terminalTelegramLosses` and forces at least the attention band even below
  ordinary volume thresholds. A live replacement clears the signal.

Attack with one ordinary alert, one breaker summary, process restart, a live
replacement, and a second terminal `gave_up`.

### R6-B6: generator preview-evidence gate was inert

`assertPrototypePreviewEvidence` is exported and guarded by re-signed negative
tests for:

1. a foreign artifact digest;
2. a preview target different from `bundle.action.identity`;
3. an extra key in the preview document;
4. an invalid blocked reason.

Removing the gate or replacing it with an unconditional return makes the
focused suite red.

## Verification-hygiene disposition

- The accepted historical UGC release is one frozen commit
  (`70f50d4...`) selected by `test/helpers/accepted-ugc-release.mjs`.
- Local tests discover an already-existing exact worktree and never mutate a
  sibling repository. An explicit env override must point to that exact
  commit.
- Generator CI already checks out both the current UGC sibling and the exact
  historical release; a test now asserts the workflow paths and literal
  revision. The full local verify is green with both override variables
  removed.
- Competing `npm run build` calls were removed from individual agents race,
  property and supervised tests. Each public suite command builds once before
  Vitest. The loaded full run is stable.

## Additional R6 P3 disposition

Closed in R7:

- bridge listener is capture-phase and engine-neutral;
- configured evidence is action-bound;
- prototype verdict buttons are visibly disabled until preview evidence
  exists;
- signed preview bytes require TMA dev-user authorization.

Still intentionally non-blocking and not claimed as solved:

- a bundle with `runtime: null` still needs a separate product decision for a
  useful operator exit;
- liveness is proven at initial configuration, not continuously re-probed
  throughout a long review;
- the guarded historical `0072` downgrade remains intentionally restrictive
  once immutable artifact evidence exists.

## Local verification evidence

### `swipe-backend`

- Final exact head full suite:
  `1192 passed, 597 skipped, 10 subtests passed`.
- Focused migration/contract run: `39 passed, 1 skipped`.
- Alembic head: `0073_mobile_preview_delivery`.
- Base → head offline SQL generated successfully (`9874` lines).
- Physical PG16 isolated `0073` downgrade/upgrade and full shared acceptance
  are green in remote CI.

### `feed-prototype`

- Full `npm run lint`, production build and WebKit acceptance passed.
- Standalone production-mount corpus passed in Chromium and WebKit.
- WebKit is a literal step of the remote workflow.
- Red mutation of the unmount boundary failed at the intended stale-evidence
  assertion.

### `swipe-generator`

- Full verify without either sibling override:
  `653 tests`, `651 passed`, `2 skipped`, `0 failed`.
- Remote CI also verifies the pinned experiment-worker cross-repo closure.

### `swipe-agents`

- Full: `70` files, `450` tests passed; typecheck passed.
- The run includes the gave-up replacement, breaker-summary, watcher and
  concurrent-build regressions.

### Workspace tooling

- `git diff --check`: clean in all four worktrees before commit.
- All four worktrees are clean at the pushed heads.
- Root tooling/docs suite: `103 passed`.
- `docs-boundary-lint`: clean.

## Required independent R7 attacks

1. Post configured preview evidence with no delivery receipt, a foreign
   actor's receipt, a foreign action, and a stale bundle.
2. Mutate `allow-same-origin`, `iframe[csp]`, embedded CSP and the bridge
   listener independently; run the real 45-artifact mount on both engines.
3. Remove production unmount calls and reproduce abandoned-deadline
   corruption of a healthy current bundle.
4. Drive the real auth client through no-op polls, repeated `Retry-After`,
   wall timeout and non-retryable proxy errors; assert every exact attempt
   becomes visibly terminal.
5. Exhaust a real alert and breaker summary to `gave_up`; restart; prove
   exactly one replacement, observability, and no third attempt.
6. Replace the generator evidence assertion with an unconditional return and
   ensure the re-signed negative matrix fails.
7. Run generator tests without sibling env overrides and verify the workflow
   pins the accepted historical commit literally.
8. Re-run the exact four remote workflows and compare their `headSha` with the
   table above.

## Merge and rollout boundary

Independent R7 GO is required before any merge. After GO:

1. merge the four reviewed heads while preserving cross-repo pins;
2. re-run default-branch CI on the merge heads;
3. update `IMPLEMENTATION-STATUS.md` only from merged CI/deploy authority;
4. deploy default-off;
5. run one live Telegram/iOS WebKit E2E;
6. ask the operator separately about `operator.review:write` and production
   notification enablement.

No status document was advanced because this implementation is not merged or
enabled.
