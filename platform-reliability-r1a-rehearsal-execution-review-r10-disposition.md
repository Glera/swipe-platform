# R1-A disposable rehearsal execution review R10 — dispositions

Status: every blocking finding accepted; successor candidate v3 prepared for
follow-up independent review. No workflow was dispatched and no provider
resource was created.

| Finding | Disposition |
| --- | --- |
| P1 executable production deny gate | Accepted. Candidate v3 requires `PLATFORM_RELEASE_AUTHORITY_SCOPE`; rehearsal rejects the captured production owner/Blueprint/web IDs and requires exact rehearsal DB identity before a Render client is constructed. Production scope is bound to the exact captured production tuple. Negative tests cover each actionable target class. |
| P1 second-CAS mutation leak | Accepted. All seven release env values are snapshotted first. Any write failure or second-CAS ID/status mismatch compensates every possibly written key to its exact previous presence/value before returning failure. The key is tracked before each HTTP request to cover a committed-write/lost-response ambiguity. Tests cover a source race and partial PUT failure. |
| P1 missing executable files | Accepted. Follow-up review packet includes both `app/platform_release.py` and `app/render_release_client.py` in addition to workflows, coordinator and docs. |
| P2 unexpected exceptions | Accepted. The coordinator emits a bounded `unexpected_error` FAIL receipt without exception details; the no-clobber receipt boundary is retained. |
| P2 production non-target proof | Accepted. The runbook now combines the executable deny gate with GET-only normalized production provider/database boundary snapshots immediately before and after the attended window. It claims boundary-state equality, not a complete provider audit log. |
| P2 cleanup order | Accepted. Disposable GitHub/Render resources and credentials are removed and verified while the key still works; the account-wide Render key is revoked last and revocation is verified. |
| P2 temporary `production` environment | Accepted risk for this frozen workflow. It must not pre-exist, is exact-branch restricted, holds exactly one secret and six exact variables including rehearsal scope, and is deleted first during cleanup. |
| P3 second-CAS status | Accepted. The second CAS now requires both exact deploy ID and `status=live`. |
| P3 manual spend stop | Accepted residual. The rehearsal stays attended, requires an action-time USD 3 cap, and stops before each paid expansion; Render offers no per-workspace automatic cap in this contract. |
| P3 workflow provenance | Accepted residual. Exact run path/event/head, canonical manifest bytes, image digest, provenance/SBOM and pinned LKG are all bound. Provider-native signing is outside R1-A. |

Local verification on candidate
`2273e5deebfef180d2faa42f73d8c939daf2ab33`:

- release/provider/platform/mission-guard tests: `75 passed`;
- mission architecture guard: `PASS`;
- workflow YAML parse and `git diff --check`: `PASS`.

This disposition is not a GO. Candidate v3 remains unpublished until the
follow-up independent review accepts the exact packet.
