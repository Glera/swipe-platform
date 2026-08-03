# Platform Reliability R1-A — contained pre-cutover preparation failure

Observed: 2026-08-03 UTC.

Status: **FAIL CONTAINED — no production preparation authority remains**.

The attended window for commit
`3d933b1f09ad621d9dfb584c612af9145c319f35` stopped while handing off the
single temporary Render API key. Render's one-time reveal appeared in a
technical browser snapshot. The key value is intentionally absent from this
receipt and must not be copied into any durable artifact.

The key was never written to the handoff file, never used for an API request
and was immediately revoked. Render then reported `No provisioned API keys`.
The empty handoff file and empty receipt directory were removed.

No provider capture, database job, GitHub `production` environment, secret,
variable, workflow dispatch, merge, deploy, migration, image publication or
Stage 1 mutation occurred. GitHub read-back at cleanup showed zero
`production` environments and zero candidate cutover runs. The 60-minute
decision deadline never started because environment verification never
occurred.

The runbook now defines the key reveal as a no-observation zone: no browser or
tool output is legal until the value has moved directly to the `0600` handoff
file and the reveal dialog is closed. Any future exposure is a terminal failure
for that window; a replacement key requires a fresh committed packet and a new
operator GO.

The JSON companion is the machine-readable authority receipt.
