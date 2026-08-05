# Independent Claude review — Minesweeper production roster package

- Date: 05.08.2026.
- Reviewer: fresh read-only Claude Fable session.
- Meta target: `330fb4f614002856c35d5e0af91e69168206d57f`.
- Reviewed package SHA-256:
  `0c3af338326a1b02e7716b07b1a3e349d57ff062ea82a82e9d48ddef0116d330`.
- Mapping file SHA-256:
  `e160bbd50d1d154ce30f42ec1789cfe2edfb990fd5d0b9ced035ed76809f56f9`.
- Roster file SHA-256:
  `725a1f28002fa148bd3f1156003f8fc58666f167b5149cf98af2af311bb45dfd`.
- Executable pins: backend `0e9e940`, feed `c1681d8`, swipe-platform
  `12033fa`.
- Mode: detached clean worktrees, read-only tools; no DB write, workflow
  dispatch, merge or Render mutation.
- Verdict: **GO — no P1/P2 blockers.**

## Reproduced claims

- The short production path is executable after DB `0073` as
  **variant → mapping register → roster register → CAS activate**. Mapping,
  roster and session projection do not import or query ontology; no ontology
  activation or second backend deployment is required.
- Mapping digest `6237927d…`, roster hash `7a9418dd…`, both file hashes,
  generated variant ID, all 15 mapping IDs and position 5 reproduce exactly.
- The swipe-platform export reproduces `versions.json`, `release.json`,
  Minesweeper artifact, HTML/payload/cover hashes and source commit pins.
- Both CLIs are runnable with the documented syntax. Dry-run is default;
  mapping apply is fail-closed on `ENABLE_FEED_MAPPING_REGISTRY_OPS`, roster
  register/activate apply are fail-closed on `ENABLE_FEED_ROSTER_CONFIG`.
- The expected variant row equals the server-owned `ensure_variant` insert;
  mapping registration fails on a missing variant. A normal authenticated
  `/runs` path reaches `ensure_variant` without roster authority.
- Activation binds fresh `expected-current`, serializes under a transaction
  advisory lock and either commits one exact activation or rejects stale CAS.
- `/session` recomputes the ordered roster hash and returns activation and
  mapping identities. The client stages it for the next session, making the
  two-restart acceptance criterion literal.
- Rollback is forward-only: reuse/register the previous 14-entry roster and
  create a new CAS activation; immutable rows are not deleted.

## Accepted P3 documentation fixes

The reviewer noted three non-blocking omissions, incorporated without changing
authority: explicitly pass the existing roster feature gate to both roster
commands, name the authenticated `/runs→/results` variant path, and print the
15-entry count in the static verification snippet.

The GO remains controlled by the package's fresh production preflight and the
separate operator GOs for each apply. Any change to manifest bytes, identities,
ordered roster, CLI authority or CAS semantics burns this review.
