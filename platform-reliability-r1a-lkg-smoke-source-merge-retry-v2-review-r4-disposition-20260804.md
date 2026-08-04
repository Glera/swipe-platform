# R4 disposition — final retry-v2 authority delta

R4 returned **GO** with no P1/P2 findings. Its four P3 items are accepted as
nonblocking and intentionally left unchanged to stop the editorial loop:

| Advisory | Disposition |
| --- | --- |
| Reorder the JSON pre-grounded locator array | No change. The array is a set; the runbook pins execution order explicitly. |
| Add an inline tag-diagnostic exception to the deny list | No change. The explicit allowed list narrowly permits only non-emitting block-local tag/role/shape validation; all outward values remain forbidden. |
| Repeat pre-dialog ordering in authority prose | No change. The exact sequencing authority is already explicit in the runbook. |
| Split the compound provider/inventory hard-stop grammar | No change. `expectedStatus`, `expectedMergeSafe` and the runbook make the capture-only scope unambiguous. |

Substantive authority commit `064542c451baf83daab7aee27829c45f8fa79ae1`
is independently accepted for publication as a request for a future separate
operator GO. No Render, GitHub PR, workflow, image, deploy, migration, rehearsal,
cutover or Stage 1 runtime action is authorized by this disposition.
