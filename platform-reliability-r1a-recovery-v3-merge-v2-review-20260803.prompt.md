# Independent review — R1-A merge handoff failure and v2 window

Review exact meta commit
`f1435dc88be96e8c9c53a6c5ff319a212d57f981` in
`/private/tmp/p4g-r1a-meta.YPUxDz`:

- `platform-reliability-r1a-recovery-v3-merge-failure-20260803.{json,md}`;
- `platform-reliability-r1a-recovery-v3-merge-v2-authority-request-20260803.md`;
- `platform-reliability-r1a-recovery-v3-merge-v2-runbook-20260803.md`.

Read-only review: do not edit, use web tools or call mutation APIs. Return `GO`
first only if no P1/P2 remains; otherwise `NO-GO` and every P1/P2 with exact
file/line. List P3 separately. Under 800 words.

Context:

- exact packet `a063ed91...` authorized one temporary Render key plus provider
  capture and PR #52 source merge;
- GitHub preflight passed, but browser runtime and host `/private/tmp` mounts
  were isolated: runtime stat was nonzero while host stat was zero;
- a post-submit reveal dialog did not close because the call used the
  pre-submit `Close modal` control; the next broad DOM snapshot exposed the
  temporary key in tool output;
- key was never available to host/provider capture, was immediately revoked,
  UI inventory is empty, both secret files were removed, PR #52 stayed draft,
  master unchanged, and no merge/dispatch/deploy/migration occurred;
- post-revoke runtime probes returned 400 rather than the exact expected 401;
  this is explicitly recorded, not claimed as proof;
- a later non-secret bidirectional probe proved `/Users/gleb` and the workspace
  root are shared between browser runtime and host; all probe files were
  deleted;
- v2 changes only the handoff: exclusive shared-home file, mandatory
  bidirectional probe before key creation, fsync, post-submit `Done`, wait for
  hidden reveal, host verification, then the existing canonical GET-only
  provider capture and previously reviewed direct GET inventory;
- v2 revokes and proves the key unusable before any GitHub merge.

Verify:

1. Failure receipt is honest and complete: no secret value, no hidden claim of
   401/provider capture/merge, and cleanup evidence is adequate for containment.
2. Consumed authority cannot be reused and no replacement key is allowed.
3. Shared-home handoff avoids the exact root cause without introducing a
   symlink, stdout, argv, clipboard, DOM-snapshot or git leak.
4. The no-observation call uses controls that exist in the observed Render UI
   contract and cannot return before the reveal is closed and file fsynced.
5. Provider/inventory steps are GET-only, fail closed on unknown status and
   cover Auto Sync, all Auto Deploy controls and active sync/deploy/preDeploy/job.
6. Key revocation/401/file removal happens before PR-ready/merge.
7. All GitHub CAS, merge parent/tree proof and cleanup paths remain complete.
8. Exact operator form matches the body and does not authorize publication,
   Render mutation, deploy, migration, rehearsal, cutover or Mission runtime.

A GO accepts only the failure disposition and v2 request/runbook for a new
operator decision. It grants no execution authority.
