# Labs Fast Lane — Two Dots add dogfood receipt

Date: 2026-08-07 (UTC)

Status: **server-side LIVE; operator Mini App gameplay smoke pending**.

This receipt records the first end-to-end `add` pass through the prototype
Labs Fast Lane. It is execution evidence, not product authority. The product
contract remains `docs/specs/lab-playable-release-fast-lane.md`.

## Exact inputs

- source: `orthogonal-link-v1` (product name: Threads; Two Dots-inspired
  mechanic without reference-product bytes in the production target);
- reviewed `playables/master`: `1ac40a2bce2af1d75264065ee3766e37021eb9a3`;
- technical profile: `test:orthogonal-link-v1:technical`;
- playable: `orthogonal-link-v1-swipe`;
- catalog identity: `connect/orthogonal-link-v1`;
- family: `connect`;
- placement: immediately after `solitaire-v1-swipe`;
- series length: `1`;
- release id: `9869f144-894f-4b12-bba8-69fb9ebf15b2`.

## Pre-release verification

The source integration and conventional technical-profile support were
reviewed independently with Claude Opus 5. The production SWIPE target was
exercised in real Chromium, including real input, progress, win/fail, restart,
page-error absence and a negative scan proving that the reference Twin marker
was absent. Engine/solver checks and the separate gamefeel profile also passed.

The generic Fast Lane convention is now a non-empty package script named
`test:<sourceId>:technical`; the release service rejects an unknown mechanic
without that script on every release. Generator PR #24 merged as
`2ede43a1d764ed8fb13d82f6d51d368ded1971e4`; exact-head CI run `31201191991`
completed successfully in 7m28s. This was a one-time Fast Lane capability
change, not per-mechanic release latency.

## Timeline

| Event | UTC | Delta |
| --- | --- | ---: |
| release created | 17:21:38.595 | — |
| source pinned | 17:21:40.364 | 1.8s |
| technical tests passed | 17:22:16.377 | 36.0s |
| SWIPE build completed | 17:22:19.594 | 3.2s |
| both covers baked | 17:22:22.105 | 2.5s |
| artifacts frozen | 17:22:22.847 | 0.7s |
| candidate commit prepared | 17:22:24.303 | 1.5s |
| HTTPS candidate hosted | 17:22:44.999 | 20.7s |
| Telegram authorization received | 17:40:31.361 | 17m46.4s human wait |
| static published | 17:40:40.066 | 8.7s |
| production static verified | 17:41:00.878 | 20.8s |
| mapping + roster applied | 17:41:01.260 | 0.4s |
| projection verified | 17:41:01.538 | 0.3s |
| LIVE | 17:41:01.542 | 0.0s |
| Telegram completion delivered | 17:41:02.533 | 1.0s |

System latency was 1m06.4s from start to a playable candidate and 30.2s from
approval to LIVE. End-to-end wall time was 19m22.9s; 17m46.4s of it was the
operator response window. An immediate approval would put the repeatable
system path at about 1m37s.

## Production evidence

- static commit: `a5bf6e7a0ac65aa0c5b4c893b45279909de280eb`;
- production manifest SHA-256:
  `f20e901715a83ba0033c261f5f8ca43dd3f37f983bd4029a8096c41ee89b138f`;
- runtime digest:
  `sha256:8a7cda5b70e77e8ece012f59070d0861a1564d8a5a82f5f76c80ca9d17bfdf7f`;
- mapping id: `cd996015-b930-578f-a880-c501baeaf5f2`, classification
  `create`, mapping digest
  `d16b46b95aa115e585d848a9258564383673917ca1fa3abade9992e490a45dc6`;
- roster activation: `5671e39c-7512-48c6-8769-4ebca5945a2f`, previous
  activation `f3e4aee7-c5cf-4ea8-a21d-652274f76740`, actor
  `telegram:42692410`;
- active roster contains 17 entries and exactly one added Two Dots mapping at
  position 8, between Klondike and `merge-timepress-v2-swipe`;
- HTML, payload, tall cover, compact cover and runtime manifest each returned
  HTTP 200. Live HTML/payload and both cover hashes match the frozen release
  bytes;
- completion notification was delivered as Telegram message id `50`.

## Findings for the next mechanic

1. **Keep the release path.** Preparation and publication are already much
   faster than the 15–20 minute product target; no release ceremony should be
   removed for speed.
2. **Fix discovery, not authority.** The Labs source datalist enumerated the
   operator's stale dirty checkout and did not show the new source even though
   exact remote `playables/master` was valid. The next narrow UX patch should
   enumerate committed remote-master sources (or a server-owned source
   projection). The release service's exact-SHA check stays unchanged.
3. **Send the ready code proactively.** Automatic intake created and refreshed
   the Telegram device code, but no candidate-ready Telegram message was
   delivered; the operator had to request the code in chat. The bot should send
   one idempotent ready message with the instruction, candidate link, current
   code and expiry. Completion notification already works.
4. **Keep one publication writer, allow queued preparation later.** Sorting's
   stale open Labs page looked like it held the slot after the server had
   reached LIVE. PR #24 fixed client polling through automatic approval. The
   safe publication writer remains serial; a visible FIFO for task preparation
   is useful only after more real parallel demand, not as a prerequisite for
   the next mechanic.
5. **Hide catalog plumbing from the operator.** This pass required no UUID or
   digest transfer, but catalog family and anchor were chosen by the
   orchestrator. Keep that as an agent/default decision shown in the exact
   Telegram intent; do not add more operator form fields.

## Remaining acceptance

- [x] exact source commit and conventional strict technical profile;
- [x] HTTPS candidate and both covers;
- [x] one Telegram authorization;
- [x] static publication and exact production verification;
- [x] typed server-owned mapping and CAS roster receipts;
- [x] only one added roster entry at the approved position;
- [x] Telegram completion signal;
- [ ] operator sees and plays the mechanic after one fresh Mini App open.

## Follow-up update and intake recovery

The first mobile rework request for larger dots reused the same durable request
identity `098ac28e-20ee-4a41-969e-21ae915f5c21`; it was never recreated.
Generator PR #25 (`8c9b4ad0906005f848fdbbcc466136e6babbf203`) closed three
intake defects discovered by that request:

- source identity is resolved only after a detached `origin/master` worktree
  exists, so the operator's dirty checkout cannot hide a committed mechanic;
- any mechanic may provide the conventional non-empty
  `test:<sourceId>:technical` profile;
- exceptions before a normal agent result are journaled durably and projected
  as the safe mobile `blocked` state; a cleanup exception after an existing
  `SOURCE_READY` cannot create a false blocker.

The first bounded edit failed the real-pointer browser assertion and became a
visible blocker rather than a silent retry loop. After a recoverable reset, the
same request passed technical checks, build and visual proof and produced exact
source commit `cb581e71e57f60822247d8ac2077e73adff86e88`. Release
`0231edce-e058-49f5-8013-d7067eb2c9a7` reached LIVE at
`2026-08-07T19:52:41.526Z` with:

- static commit `ff613f2eb0e2b529064a980c0146a01f37fd5817`;
- manifest version `260f3f1281` and runtime digest
  `sha256:476e0bb83e84b3a259b310626cb5e0a7e5b5b417c28ad385ec4570dc23a6b32c`;
- close/live receipt digest
  `e4ca6e2913c5d6d93b5e46d278f621a0c890bc8028dc8790c6633ef35dfb46c7`;
- Telegram completion message id `54`.

The update increases 390px-viewport grid spacing from `46.02px` to `53.82px`
and rendered dot diameter from roughly `23.8px` to `29.1px`; both covers were
rebaked and changed. Final gameplay/taste acceptance remains the operator's
fresh Mini App smoke, not a claim made by this execution receipt.
