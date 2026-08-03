# Platform Reliability R1-A — contained GitHub-plan preparation failure

Observed: 2026-08-03 UTC.

Status: **FAIL CONTAINED — authority at `7ed3c5d` is consumed**.

The fresh Render capture passed, all three latest deploys matched the accepted
sentinels, no operation was active, and the single authorized read-only job
returned exactly `0070_published_test_delivery (head)`. No migration ran.

GitHub then rejected the committed environment payload with HTTP `422`:
the private-repository billing plan does not support the required-reviewer
protection rule implied by sending the `reviewers`, `prevent_self_review` and
`wait_timer` fields. The API still created an empty `production` shell with no
protection rule, branch policy, secret or variable. It was detected by
read-back and immediately deleted.

The temporary Render key was revoked in the authenticated Render UI. A
post-revocation API request returned `401`; Render then showed no provisioned
API keys, and the local handoff file was deleted. GitHub read-back showed no
`production` environment, no repository-level `RENDER_*` authority and no
candidate cutover run. The 60-minute decision deadline never started because
the environment was never successfully verified.

There was no merge, workflow dispatch, Render service mutation, deploy,
migration, image publication or Stage 1 mutation. The JSON companion binds
the exact capture, inventory, job, GitHub error/read-back and cleanup digests.

The successor payload sends only the supported custom-branch policy selector.
It deliberately omits plan-gated wait-timer/reviewer fields; the explicit
operator GO remains the human authorization gate. It requires a new committed
packet, independent review and a new operator GO before another key or
environment may be created.
