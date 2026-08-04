# R1-A LKG smoke source-merge failure review — P3 disposition

Prepared: 2026-08-04 UTC.

Status: **GO ACCEPTED; ALL P3 ADVISORIES DISPOSITIONED; FAILURE REMAINS
TERMINAL**.

| P3 | Disposition |
| --- | --- |
| Pinned CI run IDs and zero-artifact facts are omitted from the compact failure preflight | Accepted as non-blocking. Exact run identities remain in the reviewed authority packet and accepted source-fix receipt; the failure receipt intentionally records the final 28/28 aggregate. A future retry packet must restate the exact runs. |
| Inventory `count=20` differs from older larger counts | Accepted. Render's current endpoint returned a bounded newest page of 20; `count` is page cardinality, not historical total. The newest page contained only terminal states and therefore no active operation. A future schema must name this field `boundedPageCount`. |
| preDeploy has no independent field | Accepted. The current endpoint represents preDeploy as deploy lifecycle statuses; every returned status was terminal. A future capture should project lifecycle phase explicitly if the provider exposes it. |
| Disposable receipt directory / venv teardown was not in the reviewed commit | Accepted with action. After evidence was copied and independently reviewed, the exact mktemp directory was deleted; the handoff/probe inventory under `/Users/gleb` was rechecked empty. The machine cleanup receipt records this follow-up. |
| Prose clarity nits | Accepted without rewriting the already-reviewed execution receipt. The machine ledger includes generative-feed expansion in the deny-list; post-containment GitHub fields are read-only confirmation, not the withheld merge-authorizing final CAS; timestamp formats denote the same UTC zone. |
| Render revoke UI structurally shows a masked prefix | Accepted as a blocking design requirement for any future attempt. A future independently reviewed runbook must avoid snapshots and text observations on both key inventory and confirmation dialog, using pre-grounded structural locators and non-emitting containment actions. |

The prior operator authority is consumed. No replacement key or merge retry is
authorized by this disposition.
