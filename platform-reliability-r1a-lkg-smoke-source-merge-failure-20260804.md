# Platform Reliability R1-A — LKG smoke source-merge contained failure

Prepared: 2026-08-04 UTC.

Status: **FAIL CONTAINED; NO SOURCE MERGE**.

The operator authorized exact reviewed packet
`c7aa22eef03e5290aa73919bd02671c42ec2c212`. All GitHub and local preflight
gates passed. The temporary provider window proved the production baseline
merge-safe, but a credential-surface hard stop fired before the final GitHub
CAS and before any draft-state or ref mutation.

## What passed

- Backend `master` remained
  `f2a840517956c4f480fc9d8aaf6f832ebde489d9`; PR #53 was open, draft and
  clean at exact head `223ab97cf6e24e0542337d2a39e1bce9529f5d00`, tree
  `75dbd88045b5b301a903d9bc917c006cd2ceaffe`, with 28/28 successful checks.
- The GitHub `production` environment and repository-level release authority
  remained absent; no workflow was active.
- A fresh `0700` receipt directory, empty `0600` handoff and Python 3.13.7
  disposable environment were prepared before key creation. The final pinned
  package inventory is recorded in the machine receipt.
- The one non-secret shared-home probe passed in both directions and was
  removed. A file-cursor mistake in its first browser-to-host write was
  corrected on the same probe before key creation and before any HTTP request.
- The committed canonical provider capture returned `PASS`: exact Blueprint
  and service identities, branch `master`, `./Dockerfile.bake`, Blueprint Auto
  Sync off and all three service Auto Deploy controls off.
- The bounded GET-only inventory found zero active Blueprint syncs, deploys,
  preDeploys or web jobs. Its first local projection stopped on Render's
  `state` versus `status` field shape without writing evidence; a keys-only
  GET probe grounded the final successful projection.

## Hard stop and containment

After the reveal was closed and provider evidence was complete, a browser UI
observation used to locate the revoke control emitted Render's masked
credential prefix. A later targeted confirmation-dialog observation repeated
the same masked representation. The actual material is deliberately not
reproduced or hashed in this receipt.

The authority packet explicitly forbids the credential value or any derivative
from entering a DOM snapshot or tool output. The masked prefix therefore
triggered the hard stop. PR #53 was never marked ready and no merge command was
attempted.

The only temporary key was immediately revoked. The UI showed an empty API-key
inventory, a bounded GET with the former credential returned exact HTTP 401,
and the `0600` handoff was removed. No replacement key was created.

## Preserved evidence

- `platform-reliability-r1a-lkg-smoke-source-merge-failure-provider-capture-20260804.json`
  — canonical provider capture; canonical receipt SHA-256
  `d23c4efa1784c9f0128870aec072b432b212ae4b77a7e337565f341db37b9f8e`.
- `platform-reliability-r1a-lkg-smoke-source-merge-failure-provider-inventory-20260804.json`
  — bounded GET-only activity projection; tracked SHA-256
  `dc8a748f8d5cf36acdb1c3377f92301e093809ccd3f311f785182d5bb91247f0`.
- `platform-reliability-r1a-lkg-smoke-source-merge-failure-20260804.json`
  — machine-readable action ledger and containment state.

## Boundary

No workflow dispatch/rerun, image action, GitHub-environment mutation,
persistent Render service mutation, deploy, production migration, rehearsal,
cutover or Stage 1 runtime action occurred. Backend `master` remains unchanged
and PR #53 remains draft.

The named operator authority is consumed. It permits neither a replacement key
nor a merge retry. Independent disposition and a newly reviewed exact operator
authority are required before another source-merge attempt.
