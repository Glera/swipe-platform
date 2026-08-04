# R1-A LKG smoke source-merge retry-v2 R1 — disposition

Prepared: 2026-08-04 UTC.

Status: **ALL THREE P2 FINDINGS AND ALL SEVEN P3 ADVISORIES ACCEPTED**.

| Finding | Disposition |
| --- | --- |
| P2-1: full value-surface hard stop was not carried forward | Accepted and fixed. The packet restores argv, history, chat, clipboard, tool parameters, returned objects, stdout/stderr, snapshots/screenshots, receipts, git and hash; adds the literal value-or-derivative hard stop; and repeats the ban in prose and runbook. |
| P2-2: eventual reveal/Done elements were misfiled as pre-grounded | Accepted and fixed. Contracts are split into `preGroundedBeforeSubmitLocators`, `postSubmitCreateLocatorContract` and `preCommittedRevokeLocatorContract`; only the first set is live-grounded before submit. |
| P2-3: provider exception text could escape from block failures | Accepted and fixed. Every post-submit locator operation is locally caught; provider exception text, markup, DOM text and stack data cannot be rethrown; the only outward block status is integer 0 or 1. |
| P3-1: source-fix and settled-baseline traceability dropped | Accepted and restored with exact commit/session and settled authority identity. |
| P3-2: CSS selector provenance overstated | Accepted. The packet states it was observed in the contained operator cleanup session and is not independently live-validated. |
| P3-3: block-local counts relax NC-2 silently | Accepted. The packet explicitly reconciles the diagnostic ban: counts stay block-local and un-emitted. |
| P3-4: exact non-secret key-name rule absent | Accepted. A timestamped fixed format is generated once in-window and recorded in receipts. |
| P3-5: GitHub authority absence too loose | Accepted. Exact `RENDER_*` and `PLATFORM_RELEASE_*` repository secret/variable absence is restored. |
| P3-6: several operational guard details dropped | Accepted. Shared-home/regular `0600`/post-write size hard stops, restore-draft failure policy, host validation and exact capture CLI are restored. |
| P3-7: prose deny-list omitted exact PR and auto-merge/retry | Accepted and restored. |

The follow-up remains non-authoritative until focused R2 returns GO and a final
review commit is named by a new operator authorization.
