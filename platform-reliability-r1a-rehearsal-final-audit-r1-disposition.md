# Platform Reliability R1-A — final rehearsal audit R1 disposition

Date: 2026-08-01.

Reviewer: independent Claude Code session
`85442e88-08fd-4c55-a1d2-acab0b70742e` (Sonnet, high effort, read-only).
Verdict: **NO-GO**.

The CLI reported API-equivalent usage of USD `0.8955306`; authentication is the
operator's Claude Max subscription, so this is subscription telemetry rather
than a separate API charge.

## Findings and disposition

| Priority | Finding | Disposition |
| --- | --- | --- |
| P1 | The retained candidate-v7 image was not the target of the successful full candidate deploy. Candidate-v6 was deployed; v7 only received isolated LKG database smoke and supplied coordinator code for rollback to baseline-v4. The v6→v7 delta is the raw-Render-URL database-driver correction, which is itself part of the end-to-end DB path. | **Accepted.** Recreate a disposable workspace and run a complete candidate-v7 prepare-source/deploy/verify path followed by exact baseline-v4 forward-only rollback. Do not seek an evidence exception. |
| P1 | Production database projections differ, but the packet attributes the delta to a separate R1 operator window whose tracked runbook still says deferred and has no execution receipt. The implementation-only delegated-credential branch does not prove execution. | **Accepted.** Bind a real R1 execution receipt/updated authority or obtain an explicit operator disposition identifying the actor/window. Until then treat the mutation as unattributed; do not call it byte-equal or authorized. |
| P2 | The temporary account-wide Render API key and GitHub `read:packages` PAT remain live. | **Accepted.** They stay only through the corrective disposable pass, then are revoked provider-side, verified unusable/absent, and their exact permission-restricted local files are removed. |

## Remediation state

- corrective Hobby workspace
  `R1-A Rehearsal v7 2026-08-01`, exact owner
  `tea-d9n4a3lbedkc73aiovr0`, completed the full candidate-v7 matrix;
- exact candidate-v7 was prepared, deployed and verified; exact baseline-v4
  was then deployed forward-only while the database remained at `0071`;
- all disposable services, database, Blueprint, registry credential,
  workspace, GitHub environment and temporary credentials were deleted or
  revoked and probed absent;
- production cutover remains unauthorized and unstarted;
- Stage 1 remains outside this remediation.

The exact closure evidence is in
`platform-reliability-r1a-rehearsal-runtime-receipt-20260801.md` and
`platform-reliability-r1a-rehearsal-evidence-packet-20260801.md`. The original
NO-GO remains a truthful historical verdict; it is superseded only if a new
independent reviewer accepts that final corrective packet.

## DB-attribution remediation review

After adding
`platform-reliability-r1a-concurrent-r1-db-disposition-20260801.md`, an
independent Claude Code review (session
`68ceeeeb-8d0f-496e-ba7e-94604e411a64`, Sonnet, medium effort, read-only)
returned **GO** for the second P1. The reviewer found that the document:

- explicitly keeps the separate R1 initiative incomplete;
- attributes both the credential and operator-`/32` delta to timestamped PR
  #53/#47 evidence;
- binds the approximately four-second credential/provider timestamp match;
- claims only R1-A non-causation, not R1 completion.

CLI API-equivalent usage was USD `0.1572847` under Claude Max and was not a
separate charge. The preceding high-effort attempt stopped at its USD 0.75
telemetry cap without a verdict and is not used as evidence.
