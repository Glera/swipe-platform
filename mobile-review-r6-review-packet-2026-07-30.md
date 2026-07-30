# Mobile-first Lab review queue — R6 independent review packet

Date: 2026-07-30.

This packet answers the R5 NO-GO in
`mobile-review-independent-review-r5-2026-07-29.md`. The four implementation
branches are committed and clean. Nothing in this packet has been merged,
pushed, deployed, enabled, or granted production authority.

## Review heads

| Repository | R5 base | R6 head |
| --- | --- | --- |
| `swipe-backend` | `6a526ac9950de650947e162ab5bd2239e1094474` | `2b9207d92dfa7fb46d9fd697dd835a7434d58117` |
| `feed-prototype` | `fd7c6b1718c1fd333f2969778146b20cf4cd5ec1` | `1d7fe0c19c02aff74f74d6fda157d2da73399321` |
| `swipe-generator` | `c8cc5335fcf299ed0ad2b75ee89baa56dce12237` | `c160bcef02cd0e15e90b1a5a7a9f291c550b9bae` |
| `swipe-agents` | `c69f5a868a23cec19455ca144fe0f71b2347235f` | `45f3847127183c586011c733b767329203725b8a` |

All four use branch `codex/mobile-review-r6` in isolated worktrees under
`/private/tmp/*-mobile-r6`. The normal generator checkout and its unrelated
dirty work were not touched.

## R5 blocker disposition

### R5-B1: prototype verdict had no preview evidence

- `prototype_review` now carries one exact `preview` union.
- A configured result binds `reviewTargetId` and `runtimeArtifactDigest`.
- A blocked result records one typed reason:
  `delivery_failed | digest_mismatch | response_invalid | unresponsive`.
- Backend validation replays exact key sets and verifies configured evidence
  against the ticket's current runtime membership.
- Coordinator revalidates the same evidence before persisting the review.
- Browser tests prove an early verdict cannot POST, then assert the exact
  evidence on the accepted decision.

Attack again with a re-signed foreign digest, missing preview, extra keys,
configured evidence for a blocked preview, and an unknown blocked reason.

### R5-B2: 750 ms false sandbox accusation

- The one-shot deadline is replaced by a 500 ms challenge loop with an 8 s
  deadline.
- A deliberately busy 1100 ms prototype still becomes configured.
- Failure copy is neutral: the preview is not responding; no claim of escape.
- A visible retry action remounts the exact captured bytes.

Attack with a slow main thread, a bridge receipt that never arrives, a late
receipt after unmount, and repeated retry.

### R5-B3: stale mounts survived navigation

- Every HTML preview mount returns a cleanup function.
- Cleanup aborts fetches, removes `message` listeners, clears timers and
  removes the stage.
- `renderDone`, `renderView`, inbox load and bundle load all unmount the
  previous preview first.
- Browser coverage switches bundles while the first fetch is still pending
  and proves the late result cannot mutate the new review.

### R5-B4: one transient continuation failure lost a human Approve

- Exact publication attempts now have bounded retry state with delays
  `2s, 5s, 15s, 30s, 60s`.
- Only transport, timeout, rate-limit, HTTP 429 and HTTP 5xx are retryable.
- Attempt identity fences retry state; an explicit successor attempt clears
  the block.
- Exhaustion writes a typed visible
  `series_publish_continuation_exhausted` failure on that exact attempt.
- Non-retryable publisher-owned terminal failures are not overwritten.

Attack with one 503 then success, perpetual 503, a new exact attempt after
exhaustion, and a non-retryable terminal response.

### R5-B5: phantom Telegram rows suppressed live alerts

- `otherSendableCount` excludes terminal `outcome_unknown` rows and terminal
  render-error phantoms.
- Render-invalid/config-missing terminal rows are recoverable by exact
  production reference.
- Recovery is bounded to one attempt per reference per process, and confirms
  the replacement through the normal sender path.
- Empty `/review@` commands and five legacy Telegram-forward identity fields
  are rejected.
- `event_id` is explicitly retained only on monitoring messages; production
  review/action messages follow the human-copy contract.

Attack with enough phantom rows to fill both budget terms, two real alerts,
render failure followed by corrected configuration, process restart,
`/review@`, and every legacy forward field.

## R5 supporting-boundary disposition

### Digest, frozen bridge and database identity

- Artifact upload tests pass through the real upload path and fail if either
  frozen-bridge validation or byte-digest validation is removed.
- Migration `0072_mobile_review_evidence` adds a database CHECK:
  `artifact_digest = 'sha256:' || encode(sha256(content), 'hex')`.
- ORM metadata contains the same check.
- A PostgreSQL test bypasses the application and inserts mismatched bytes.
- The migration has literal/drift assertions and a guarded downgrade.

### Ticket lifetime and membership

- A ticket is invalid at `expires_at_epoch <= now`.
- Redeem verifies the signature, current bundle, current ticket and current
  artifact membership again.
- Tests use valid HMACs for expired, over-future and foreign-digest tickets, so
  they reach the intended semantic guards instead of failing at signature
  parsing.
- The old unbound raw artifact route has been removed and is asserted 404.

### Browser policy layers

- Production uses already-verified `srcdoc` bytes. No path is reopened after
  capture.
- The embedded frozen policy is tested alone in both Chromium and WebKit.
- `iframe[csp]` is tested separately: it contains Chromium, and the test
  deliberately demonstrates that WebKit does not enforce it.
- The actual `srcdoc` path runs the adversarial document corpus.
- Parent `frame-src` is asserted with an external-navigation attack.
- CI installs and runs WebKit explicitly.

## Verification evidence

### `swipe-backend`

- Focused: `37 passed, 16 skipped`.
- Full suite: `1192 passed, 595 skipped, 10 subtests passed`.
- Alembic static SQL: base → head and head → base both generated successfully.
- Root and touched-spec docs-boundary lint: clean.
- Sixteen opt-in PostgreSQL tests are collected but skipped locally. A
  physical clean PostgreSQL 16 acceptance run is still a merge condition.

### `feed-prototype`

- `npm run lint`: passed.
- `npm run build`: passed.
- Chromium mobile-review browser acceptance: passed.
- WebKit mobile-review browser acceptance: passed, both standalone and after
  the full lint/build sequence.
- Existing three-level dogfood browser completed with its honest
  `harness_verified_not_production` verdict; no rollout claim is made.

### `swipe-generator`

- Focused mobile review/publication tests: `41/41`.
- Full verify with the accepted sibling worker pinned at
  `/Users/gleb/.codex/worktrees/swipe-ugc`: `649 tests`, `647 passed`,
  `2 skipped`, `0 failed`.
- An initial unpinned `/private/tmp` run failed only because sibling paths and
  the frozen UGC digest resolved against the wrong checkout. It is not counted
  as acceptance evidence; the explicit accepted pin above is.

### `swipe-agents`

- Focused Telegram tests: `69 passed`.
- Full: `70 files`, `447 tests passed`; typecheck passed.

Across all four repositories, `git diff --check` passed before commit and every
review worktree is clean after commit.

## Required independent attacks

1. Re-sign prototype decisions with forged, absent, contradictory or
   extra-key preview evidence.
2. Hold artifact delivery and attempt a verdict before configuration.
3. Use a healthy prototype with >1 s synchronous work and an unresponsive
   prototype past 8 s.
4. Navigate A → B before A's fetch/receipt completes and try to corrupt B.
5. Delete either embedded CSP or `iframe[csp]` coverage independently; verify
   WebKit depends only on embedded bytes.
6. Remove the parent `frame-src` restriction and retry URL navigation.
7. Bypass application upload with digest-mismatched bytes in PostgreSQL.
8. Redeem expired, future, evicted-bundle and foreign-member signed tickets;
   probe the removed raw digest route.
9. Return one transient 503, then perpetual 503, then create a successor
   publication attempt.
10. Fill Telegram accounting with terminal phantom rows, then enqueue two real
    alerts; also reproduce terminal render recovery.
11. Mutate `/review@` and each legacy forwarded-message field.
12. Run clean PostgreSQL 16 base → head plus guarded downgrade acceptance.

## Merge and rollout boundary

Independent R6 GO is required before any merge. After GO:

1. merge the four heads while preserving exact cross-repo pins;
2. run each repository's remote CI, including clean PostgreSQL 16 and WebKit;
3. update `IMPLEMENTATION-STATUS.md` from CI/deploy authority;
4. deploy default-off;
5. run one live Telegram/iOS WebKit E2E;
6. only then ask the operator separately about `operator.review:write` and
   production notification enablement.

No status document was advanced in this branch because implementation is not
yet merged or enabled.
