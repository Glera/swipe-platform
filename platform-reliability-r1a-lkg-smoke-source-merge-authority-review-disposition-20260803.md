# R1-A LKG smoke source merge authority review — P3 disposition

Prepared: 2026-08-03 UTC.

Status: **ALL P3 ADVISORIES DISPOSITIONED; NO AUTHORITY-DOCUMENT CHANGE
REQUIRED**.

| P3 | Disposition |
| --- | --- |
| Three backend blobs are pinned but not separately named as preflight gates | Accepted as redundant defense. Exact backend head/tree is a hard precondition and therefore binds all three blobs; the orchestrator independently resolved the pins before authoring the packet. |
| The 28-success count is not expanded in the earlier execution JSON | Accepted. The exact PR observation recorded all-success rollup and exact aggregate CI runs; merge preflight independently requires exactly 28 completed successes and fails on divergence. |
| JSON includes submit in the final sequence while prose places submit immediately before the non-emitting block | Accepted because every representation establishes the same no-observation zone from submit until hidden. The final block performs shape validation, text transfer, fsync, Done and hidden without emitting diagnostics; no unsafe intermediate observation is allowed. |
| DO NOT MERGE remains in the PR title and therefore may appear in the merge message | Accepted as cosmetic audit language. The packet authorizes no title edit, and merge identity is proven by exact parents/tree rather than message text. |

No P3 changes the merge safety properties, action count, cleanup or deny-list.
The reviewed packet remains non-executable until an operator names the final
reviewed meta commit exactly.
