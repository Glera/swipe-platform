# Claude delta-review — Variant B v3 dispatch ref

- Date: 05.08.2026.
- Reviewer: fresh read-only Claude Fable session.
- Meta commit: `12408b364423021f761bdc8f9ebd2e4902970f35` over
  `ef0500193b395f878a0f48092914b3faeaec0900`.
- Reviewed v3 SHA-256:
  `6afd70201d29bb3182efb8ebdc1cdc73e8cf5d8cda27f84924182f1018d4b456`.
- Backend executable: `0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`.
- Verdict: **GO — no P1/P2 findings.**

The delta touches only the Phase 1 dispatch preamble and matching status text.
GitHub workflow dispatch accepts a branch or tag ref, so `ref=master` is the
executable form; the previous raw-SHA wording was not.

The immutable binding is preserved:

1. immediately before dispatch, `master` must equal `0e9e940`;
2. the resulting workflow run must have `event=workflow_dispatch` and
   `head_sha=0e9e940`;
3. checkout source, computed `backend_sha`, image identity and manifest
   `sources.backend.sha` are all derived from that run SHA;
4. candidate sidecar and image digest are verified before any Render
   credential exists;
5. if master moves in the small CAS-to-dispatch window, post-run acceptance
   fails and the route stops with Render untouched.

No other route phase, credential rule, pin or failure semantic changed. This
delta therefore restores executability without weakening the previously
reviewed authority.
