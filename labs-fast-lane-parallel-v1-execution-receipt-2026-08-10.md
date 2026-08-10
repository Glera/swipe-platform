# Fast Lane parallel preparation v1 — candidate receipt

Date: 2026-08-10  
Ticket: [p4g-workspace-meta #84](https://github.com/Glera/p4g-workspace-meta/issues/84)  
Decision: **LOCAL CANDIDATE READY; LIVE GO NOT YET GIVEN**

## Exact candidate stack

| Repository | Base | Candidate head | Draft PR |
| --- | --- | --- | --- |
| `swipe-generator` | `adea2c8aa0ad7532530bcb199f55befd8a9ad464` | `0d9770183e6322b255628cbe7c28dde69dc23cb5` | [#27](https://github.com/Glera/swipe-generator/pull/27) |
| `feed-prototype` | `02f398f0c2697884d3184eb4ca4a0218bc191e4d` | `69e449bcd8c7517a018fa77870efa955cc444103` | [#30](https://github.com/Glera/feed-prototype/pull/30) |
| `swipe-backend` | `3c3693ae71d3e6ca22961a018adf18d1f1e0abe0` | `06fb08945552669c6a6cd21c9a336bef8e22a2da` | [#62](https://github.com/Glera/swipe-backend/pull/62) |

The root meta head and PR are recorded after this receipt is committed. No
`playables`, `swipe-ugc`, live platform checkout, candidate record, catalog,
roster or release record was changed.

## Acceptance matrix

| # | Acceptance | Deterministic evidence | Result |
| --- | --- | --- | --- |
| 1 | Admit/model 10 tasks for different mechanics | coordinator ten-task barrier creates ten distinct source/release inputs | PASS |
| 2 | At least two tasks are simultaneously PREPARING | service harness observes two real releases in `PREPARING`; source barrier observes max concurrency 10 | PASS |
| 3 | READY does not stop the rest | one READY approval progresses in the same tick as another mechanic preparation; denied/incompatible READY cannot starve later READY | PASS |
| 4 | Each READY has exactly one matching Telegram event under retry/restart/replay | unique per-release backend outbox, confirmed replay fence, ambiguous fail-closed path, ten-event test matching each original request and deep-link | PASS |
| 5 | Russian feed states | browser/contract checks assert «Готовится», «Готово к проверке», «Нужна помощь» from server `releaseExecution` | PASS |
| 6 | Publications never overlap | F006 drives two real `authAction(..., "poll")` publications, holds the first token provider and measures `maximumTokenProviders === 1` | PASS |
| 7 | One failure affects only its task | injected preparation failure projects only that release to `NEEDS_HELP`; next mechanic starts | PASS |
| 8 | Older candidate keeps exact identity after a newer candidate | two-repository harness verifies ancestor chain and SHA-256 bytes for both immutable preview directories | PASS |
| 9 | Existing single-task and terminal paths do not regress | full backend/generator/feed suites plus restart, retry, cancel, LIVE and legacy binding cases | PASS |
| 10 | No Two Dots/Klondike/Smash live mutation | all release tests use temporary local repositories and synthetic journals; development run made no live HTTP mutation or Telegram send | PASS |

Supplemental operator acceptance is also covered:

- update mode uses durable server-owned `reworkRequestId` and a Two Dots-shaped
  request; add mode falls back to source identity rather than a model summary;
- READY notification and review card contain the same exact/bounded original
  request, mechanic and server-derived review deep-link;
- missing original linkage is explicit and approval fails closed;
- the focused feed review mounts only the server-bound frozen candidate and
  proves `static_ready → prepareInteractive → interactive_ready → autoplay`,
  tap-to-manual, restart and terminal messages in the responsive platform slot;
- review startup does not fetch or mutate normal feed session, manifest,
  catalog, roster or allocation state.

## Verification

- `swipe-generator`: full `npm run verify` on Node `24.14.0`, current UGC
  `8cd1e8598b699766bb02ccd22f63e38ab9ffe1ee` and immutable worker UGC
  `70f50d4a6c18cffe726b18d5cae80ad84ef73ace` — **778 passed, 2 skipped**.
- `swipe-backend`: `.venv/bin/python -m pytest -q` — **1417 passed, 662
  skipped, 10 subtests passed**; Alembic has one head
  `0077_fast_lane_parallel_ready`.
- `feed-prototype`: full `npm run lint` after rebase onto current master —
  **PASS**. The pre-existing feed-sequencing drift guard reports its documented
  skip because its separate sibling worktree is absent; all core and browser
  checks run by the command passed.
- all four worktrees pass `git diff --check`; root script suite is recorded in
  the final meta commit.

## Blind cross-provider review

Exactly one bounded blind pass used Claude Fable at medium effort. Input was
the isolated, sanitized pre-fix patch set with SHA-256 identities:

- generator `efdb2c9c485ccac987dc4e3e2580bda82440cb8e614f963e8dcdc05814842761`;
- feed `8da9fb3ef52773b486cc7ee96332a3db5d7a0a6139f2bc0b06797002e47dd186`;
- backend `0375d13d0a7a225ad4adf2b954601a2ff627b4cecd22a1aa443de87b33d1a540`;
- root `32968b8b6c0dcd24f0f753722ae1711a9532befc2a748a13c7ef3b527c6538f1`.

Verdict: **GO_WITH_FINDINGS**. Findings: two P2 and five P3, no P1. All seven
were accepted, fixed and covered by regressions; none were rejected. Durable
machine-validated detail:
`labs-fast-lane-parallel-v1-auto-review-dispositions-2026-08-10.json`.
`excludedSecrets` was empty and no second architecture/review round was run.

## Explicitly not done

No merge, live backend migration, feed/backend deploy, live Lab restart,
production rollout, real ten-task Telegram smoke, Telegram notification,
publication, activation, approval, rejection or cancellation was performed.
Two Dots release `6c267c01-1fc5-4137-a2c6-e81142d67972`, Smash ticket #82 and
receipt-only meta PR #83 remain unchanged.
