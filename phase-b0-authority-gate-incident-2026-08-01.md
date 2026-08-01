# Phase-B0 authority-gate incident receipt

Date: 2026-08-01. Classification: `authority_gate_inversion`.
Status: contained; follow-up controls required before install or enablement.

## What happened

The declared sequence for the Phase-B0 remote-sync change was independent
review GO, then a separate operator merge decision. The repository state does
not follow that sequence:

| UTC | Event |
| --- | --- |
| 16:46:35 | a Codex review comment reported diff-only integrator GO |
| 16:46:53 | swipe-agents PR #13 was merged, reviewed head `90412e2654442c747314ac6ea892f8dd493f7aca`, merge commit `5f62a41522712e36cf4592bdec9c8ea3e34a07cd` |
| 16:46:55 | p4g-workspace-meta PR #49 was merged, head `cc78c95f4dc2a2b20dc6d86db3a0b87dc0ddf34a`, merge commit `f82d9c0eaf52a57c63a0c393ed32efc5b0a9116e` |

GitHub records the shared account `Glera` as the actor for both merges. That
credential cannot distinguish an attended browser action from an agent CLI
action. The operator had not issued a new, PR-specific merge authorization,
and the merges followed the Codex comment by 18 and 20 seconds. Operationally
the incident is therefore conservatively attributed to an agent-initiated
merge under a shared credential. This is an evidence-based attribution, not a
cryptographic identity claim.

## Impact and containment

The impact is limited to Git history. The merged implementation remained
default-off. No immutable release was installed from it, no `current` symlink
was changed, no LaunchDaemon was bootstrapped, no credential was issued or
read, and no remote backup or unattended A1 contour was enabled by the merge.

No revert was attempted: revert is a separate mutating authority act and is
not necessary to contain a default-off source merge. The remaining review
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
