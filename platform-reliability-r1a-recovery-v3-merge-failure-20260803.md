# Platform Reliability R1-A — contained recovery-v3 merge-window failure

Observed: 2026-08-03 UTC.

Status: **FAIL CONTAINED; AUTHORITY `a063ed91…` CONSUMED**.

The operator authorized the exact recovery-v3 merge window at meta commit
`a063ed91fb8cd09894097d26a099498294a6c8b2`. All GitHub preconditions passed
at `2026-08-03T17:25:38Z`: backend master/base, PR #52 head/tree/draft state,
28 successful checks, absent GitHub `production` environment, absent
repository `RENDER_*` authority and zero active cutover/publication runs.

One temporary Render API key was then created. The reviewed no-observation
call read the one-time value without emitting it and wrote it to the requested
`/private/tmp` path. The browser runtime's own `stat` saw a non-empty `0600`
file, but the host saw a different file at the same path with size zero. The
browser runtime and host have isolated `/private/tmp` mounts.

The same call targeted the pre-submit `Close modal` control after the dialog
had transitioned to its reveal state; the reveal remained open. The next broad
DOM verification therefore exposed the full temporary key in tool output.
The value is deliberately absent from every committed receipt.

## Containment

- the key was never available to a host process and never used for provider
  capture;
- the reveal was closed and the exact temporary key was revoked in Render;
- the Render UI then reported `No provisioned API keys`;
- the browser-runtime secret file and the empty host handoff were removed;
- five post-revoke runtime probes returned HTTP 400, so the previous exact
  `401` proof was not obtained; no success response or provider data was
  returned;
- PR #52 remained open/draft at exact head `8ea6f1d…`, backend master remained
  `f0cc933…`, and GitHub production authority remained absent;
- no provider capture, PR-ready transition, merge, workflow dispatch, image
  publication, persistent Render service mutation, deploy, migration or
  Mission runtime action occurred.

The exact bounded machine receipt is
`platform-reliability-r1a-recovery-v3-merge-failure-20260803.json`.

## Root cause and verified replacement boundary

Only `/private/tmp` was isolated. A non-secret bidirectional probe performed
after containment proved that `/Users/gleb` is shared between the local browser
runtime and the host: the runtime wrote a `0600` sentinel under the home
directory, the host read the exact sentinel and removed it. A workspace-root
probe produced the same result; both probe files were deleted.

The next runbook therefore uses a unique, pre-created
`/Users/gleb/.codex-r1a-render-key.XXXXXX` handoff, requires a fresh
bidirectional non-secret roundtrip before key creation, uses the post-submit
`Done` control, waits for the reveal dialog to be hidden, and forbids any broad
DOM observation until host mode/non-zero-size verification passes. The
consumed GO cannot be reused and no replacement key was created.
