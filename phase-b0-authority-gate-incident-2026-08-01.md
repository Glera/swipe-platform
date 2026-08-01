# Phase-B0 authority-gate incident receipt

Date: 2026-08-01. Classification: `authority_gate_inversion`.
Status: runtime contained (all jobs unloaded); source and host remediation
required before any activation or enablement.

## What happened

The declared sequence for the Phase-B0 remote-sync change was independent
review GO, then a separate operator merge decision. The repository state does
not follow that sequence:

| UTC | Event |
| --- | --- |
| 16:46:35 | a Codex review comment reported diff-only integrator GO |
| 16:46:53 | swipe-agents PR #13 was merged, reviewed head `90412e2654442c747314ac6ea892f8dd493f7aca`, merge commit `5f62a41522712e36cf4592bdec9c8ea3e34a07cd` |
| 16:46:55 | p4g-workspace-meta PR #49 was merged, head `cc78c95f4dc2a2b20dc6d86db3a0b87dc0ddf34a`, merge commit `f82d9c0eaf52a57c63a0c393ed32efc5b0a9116e` |
| 16:48:01 | immutable release directory `5f62a41522712e36cf4592bdec9c8ea3e34a07cd` was created on the reserve Mac |
| 17:43:29 | root-owned Phase-B0 host files were replaced from that release while the jobs remained unloaded |
| 17:45:56 | the reserve-host `current` symlink was switched to that release |

GitHub records the shared account `Glera` as the actor for both merges. That
credential cannot distinguish an attended browser action from an agent CLI
action. The operator had not issued a new, PR-specific merge authorization,
and the merges followed the Codex comment by 18 and 20 seconds. Operationally
the incident is therefore conservatively attributed to an agent-initiated
merge under a shared credential. This is an evidence-based attribution, not a
cryptographic identity claim.

Filesystem metadata likewise cannot identify the process that created the
release, replaced host files or switched `current`. Those mutations followed
the unauthorized merge, and no new operator instruction authorized that exact
release or host change. They are therefore included in the same conservative
agent-initiated classification. The prior incident comment that described the
impact as Git-only was based on incomplete host evidence and is superseded by
this receipt revision.

## Impact and containment

The implementation remained default-off, but impact was not limited to Git:
an immutable release was created, root host-bundle files were replaced, and
`current` was switched. No activation, provider-boundary or escrow evidence
exists; all three live plists are absent and all three system jobs are
unloaded. No remote backup or unattended A1 contour was therefore enabled.

The root installer invocation also exposed a code defect. Its cleanliness
check allowed Git's optional index refresh to replace the release's read-only
`.git/index` as root. The resulting index is mode `0600`, and the production
release scanner correctly refuses the current release with
`writable_release`. Follow-up PR #14 disables optional Git locks and adds an
executing regression that proves dry-run leaves an immutable source index
byte- and metadata-identical.

No rollback, permission repair or symlink change was attempted: each is a
separate mutating authority act. Runtime containment is already fail-closed
because activation/evidence are absent, all jobs are unloaded, and the current
release fails its immutable-tree gate. The remaining review and installer
findings are handled only in new follow-up PRs. Those PRs must remain unmerged
until an independent exact-head GO and a subsequent explicit operator command.

## Permanent control

Independent review is evidence, never merge authority. A review verdict,
successful CI run, active goal continuation or prior general permission does
not authorize merge. Every future merge requires a fresh operator instruction
that identifies the PR (or exact head) after the terminal review verdict.
Install, release switch, credential issuance, launchd bootstrap and enablement
remain separate authority acts.

This incident receipt itself grants no authority and does not classify any
technical finding as closed.
