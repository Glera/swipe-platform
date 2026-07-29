# R4 fix-review packet: mobile-first Lab review queue

Date: 2026-07-29.

Purpose: a focused fourth-round review of the blockers in
`mobile-review-independent-review-r3-2026-07-29.md`. This packet does not
authorize merge or deploy. Author and reviewer must remain different people.

## Exact heads

All four repositories use branch `codex/mobile-review-performance`:

| Repository | Head | CI |
| --- | --- | --- |
| `swipe-backend` | `cfb499d12f5e63863e808c727d038416061e2dd2` | [PostgreSQL acceptance 30466659177](https://github.com/Glera/swipe-backend/actions/runs/30466659177), success |
| `feed-prototype` | `4fdfa96a1e9c4ae43994d8475fe6ad8a46283cf5` | [verify 30466659225](https://github.com/Glera/feed-prototype/actions/runs/30466659225), success |
| `swipe-generator` | `20e25fabd540a685856cef8ba6dad20b34e089c8` | [verify 30466662189](https://github.com/Glera/swipe-generator/actions/runs/30466662189), success on rerun after a runner-side Chromium download stall |
| `swipe-agents` | `67fad8a1af40facadf292ba66774c438427109d0` | [swipe-agents CI 30466659492](https://github.com/Glera/swipe-agents/actions/runs/30466659492), success |

No head above has been merged or deployed.

## R3 disposition

### 1. R3-B1: CSP parser injection and doctype regression

Closed across `swipe-backend` and `feed-prototype` by removing HTML rewriting
from the trust boundary.

- The backend serves exact stored artifact bytes through a short-lived signed
  preview capability and a real HTTP `Content-Security-Policy` response
  header.
- The preview ticket is authenticated and is bound to exact bundle,
  artifact, actor, and digest identity. The signed GET rechecks exact bundle
  membership before returning bytes.
- The TMA verifies response digest and bytes, then renders the exact signed
  URL. It does not parse or splice artifact HTML and uses the same URL for
  evidence.
- A second iframe navigation invalidates the evidence and removes the frame.
- Artifact admission again requires valid UTF-8 and the canonical doctype.
- The browser suite exercises the original 45-document corpus against actual
  response headers. Malicious remote script/image requests remain blocked.

Suggested attacks:

1. Replay the R3 quote-state and non-HTML-whitespace documents and prove the
   executed URL carries the response-header CSP.
2. Navigate the iframe after load and prove the item cannot be decided.
3. Change bundle membership after issuing a ticket and prove the GET fails.
4. Remove or vary the canonical doctype and prove admission fails.

### 2. R3-B2: hostile JSON produced HTTP 500 and unbounded recursion

Closed in the backend HTTP boundary.

- Bundle, closure, consumption, and decision routes parse bounded raw request
  bytes through one strict JSON entry point.
- The parser rejects non-JSON content type, oversize input, `NaN`,
  `Infinity`, exponent overflow such as `1e400`, invalid UTF-8/lone
  surrogates, and nesting deeper than 64.
- Rejections return only the generic typed
  `mobile_review_request_invalid`; attacker-authored JSON is not reflected in
  the error body.
- Recursive string validation covers both keys and values.

Suggested attacks: send each R3 payload (`NaN`, `Infinity`, `1e400`,
`\ud800`, depth 900) to every mutating mobile-review route and assert a typed
non-500 response plus no stored row.

### 3. R3-B3: CHECK misclassification and partial decision size bound

Closed in `swipe-backend`.

- PostgreSQL SQLSTATE `23514` is classified before the general
  `IntegrityError` conflict path and maps to typed
  `mobile_review_storage_invalid`.
- Decision validation bounds the entire persisted command document, not only
  the nested `decision` payload.
- The contract and database constraint now measure the same persisted domain.

Suggested attack: replay the measured R3 boundary document and inject a real
CHECK violation; both must be typed storage-invalid rather than identity
conflict.

### 4. R3-B4: inert order-lock test

Closed with deterministic PostgreSQL instrumentation.

- The concurrent genesis-bundle test opens a controlled window after the
  order lock and before commit.
- Two different bundle identities race on the same order.
- With the lock, one current bundle is committed; the losing path observes
  the committed state.
- A lock-removal mutant fails the regression instead of surviving scheduler
  timing.

Suggested attack: replace `_lock_order` with a no-op and run only the
instrumented PostgreSQL race; the test must fail deterministically.

### 5. R3-B5: Deny caused queue loss or a crash loop

Closed in `swipe-generator`.

- Denied, failed, expired, or cancelled review decisions re-arm an exact
  `publication_prepare` action instead of dropping the order.
- A late decision for the previous preparation is consumed as superseded and
  cannot dereference a missing preflight.
- Each preparation has an explicit `attemptId`; the immutable bundle identity
  includes source action identity, attempt, and prior failure. A re-armed
  preparation therefore cannot reuse a bundle ID with different bytes.
- A new exact decision starts only the new attempt. Fake
  `telegram_approve` review decisions remain superseded.

Suggested attack: Deny preparation A, submit A again after preparation B
exists, then approve B. A must be superseded, no tick may throw, and exactly B
may initiate publication.

### 6. R3-B6: event-loop blocking and invisible publication failure

Closed in `swipe-generator`.

- Production sources in the affected rework path no longer call
  `Atomics.wait`; contention fails fast.
- The outer asynchronous coordinator retries busy work with `setTimeout`
  rather than blocking the process.
- The source assertion scans the actual affected modules.
- A timer-progress regression proves the event loop advances during
  contention.
- Publication rejection remains a visible failed status with failure and
  attempt identity. Explicit re-initiation is possible; the state is not
  erased by `abandon()`.

Suggested attacks: hold the store lock while a short timer runs, and inject a
catalog rejection. The timer must fire; the failure must remain visible until
an explicit retry.

### 7. R3-B7: factory review was unreachable on a 390×760 phone

Closed in `feed-prototype`.

- The review header is no longer sticky over the first checklist control.
- The browser regression uses real pointer input, not synthetic
  `element.click()`, for all five checkboxes at 390×760.
- The same test reloads and proves the exact form state remains usable.

Suggested attack: run the browser test on the stated viewport with a safe-area
top inset and confirm each checkbox receives a real pointer event.

### 8. Previously inert proof claims

Each R3 mutation now has a regression that observes the behavior it protects:

| Boundary | R4 executable evidence |
| --- | --- |
| persistent mutation ID | close and reopen a page in the same browser context; `localStorage` identity survives |
| digest rebinding | changing exact artifact digest changes the mutation identity |
| no automatic follow | wait 2.5 seconds; no item changes without the explicit next action |
| preparation failure | failed status and retry control remain visible |
| `telegram_approve` superseded | an injected fake decision is consumed without review authority |
| scheduler live-state drift | changing live flow after scheduling prevents the stale exact effect |
| order lock | deterministic instrumented PostgreSQL race fails under lock removal |
| event-loop blocking | actual-source scan plus timer-progress test |

### 9. `swipe-agents` R3 caveat

Closed without restoring technical IDs to the human production message.

- The production-review message contract and runbook now consistently promise
  a short human description; dedup identity is an internal action key.
- Invalid production action prefix or malformed payload is classified as
  typed `delivery_render_invalid`.
- Only that exact permanent row is terminalized. Transient database/read
  failures remain queued and cannot wedge later valid deliveries.
- Monitoring/attention messages retain their diagnostic IDs.

Suggested attack: place one malformed production-review row before a valid
row, then inject a transient database failure. The malformed row alone must
terminalize; the valid row must later send and the transient row must remain
retryable.

## Additional defect found and closed during R4

The first Deny recovery implementation exposed an immutable-identity collision:
a re-armed `publication_prepare` could change bytes while retaining its old
bundle ID. The final implementation includes the source action, explicit
attempt ID, and prior failure identity in the content-addressed preparation.
The exact Deny/re-arm/late-decision regression covers the complete sequence.

## Verification evidence

- Backend full local suite: `1179 passed, 587 skipped, 10 subtests`; PostgreSQL
  opt-in tests are delegated to the exact-SHA acceptance CI.
- Feed/TMA: full `npm run lint`, including TypeScript, all contract checks, and
  browser suites.
- Generator focused R4 profile: 83 tests pass. The ordinary workspace full
  run is `640/646 pass, 2 skip, 4 fail`, where all four failures are the
  expected sibling `swipe-ugc` drift (`83357fb` versus accepted
  `70f50d4`). The affected pin-dependent files pass `20/20` against the exact
  accepted checkout, which is also what generator CI uses.
- Agents: `npm run typecheck` and full `npm test`, `443/443` pass.
- Root `node scripts/docs-boundary-lint.mjs`: clean.

## Requested R4 review

Review only the four exact heads above against the nine disposition classes.
Re-run the suggested attacks, with special attention to the signed preview
capability and the Deny/re-arm identity chain. A GO requires all four
exact-SHA CI jobs to be terminal `success`.

Do not merge or deploy from this packet. Return an independent signed
GO/NO-GO first.
