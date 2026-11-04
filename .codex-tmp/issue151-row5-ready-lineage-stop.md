## #151 row 5 — NEEDS_HELP / lineage contract conflict at mobile READY

The fifth distinct candidate was materialized once and is physically immutable/available, but the mobile READY boundary stopped fail-closed. No notification retry, release retry, reset, recreation, Approve, promotion, publication, or public rollout was performed.

### Exact candidate

- request: `e016bb33-cf2b-40af-acf7-d850cfee136b`
- request hash: `6914622c9a2cf4832e0525dd43d12377b60ffa6df299d5aa9e65006251e3e15a`
- instruction: `Хочу за первый заказ награду 123 монеты`
- source: `3517f984b90c048e6f96e78ca5cbeaf274140b13`
- source tree: `aa8e8b1eafa202e7e7b959decf507fd92a3a66f3`
- release: `4e532a9c-06b1-4df2-8a78-471353496ca7`
- candidate: https://swipe-platform.onrender.com/playable-previews/4e532a9c-06b1-4df2-8a78-471353496ca7/merge-timepress-v2-swipe.html
- candidate HTTP: `200`
- runtime artifact: `sha256:9b996b4244d308f08960010bbc3235f24f1f49fce44130fe206037d86ad1be46`
- review binding: `ddf619d3e2f665bd22ed2554d04359045bcd200f48df4f1c9219c8df630629f5`
- release state: `READY_FOR_APPROVAL`
- creation → hosted: `2026-08-27T13:07:23.668Z` → `2026-08-27T13:08:54.459Z` (~91s)

### Exact stop

`READY_NOTIFICATION_NEEDS_HELP` at `2026-08-27T13:08:54.784Z`:

- server code: `playable_rework_conflict`
- notification status: `failed_terminal`
- attempt count: `0`
- provider message id: `null`
- recorded: `false`

Read-only attribution proves a contract collision rather than a transport failure:

1. The preserved root request is still `open`, but its execution is the historical terminal capability-gap projection `blocked / playable_rework_agent_unsupported`.
2. Backend `is_immutable_capability_gap_root()` intentionally freezes exactly that root and rejects READY/preparation/claim mutation.
3. Generator's append-only manual-source continuation correctly recovered the same request and built the candidate, but it still binds READY to the frozen root request id.
4. Therefore retrying the same READY call cannot succeed; it would only repeat a definite rejection.

Typed blocker: `manual_source_candidate_bound_to_immutable_capability_gap_root`.

### Narrowest safe continuation

Do not weaken root immutability. Use the existing server-owned capability-successor contract: create one exact successor from the reviewed source/capability evidence, let the ordinary coordinator materialize its first release, and supersede the orphaned non-notified candidate without replaying authoring. This changes request/release identity by design and therefore requires explicit operator disposition before implementation/application.

Rows 1–4 remain unchanged. All five candidate URLs answer HTTP 200, but row 5 is not honestly phone-testable until the successor receives a confirmed READY projection.
