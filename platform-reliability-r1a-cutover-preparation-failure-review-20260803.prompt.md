Independent fail-closed review of the R1-A pre-cutover preparation retry.

You are the reviewer, not the author. Do not edit files and do not perform any
external action. Read only these files in the current repository:

- platform-reliability-r1a-cutover-preparation-runbook-20260803.md
- platform-reliability-r1a-cutover-preparation-authority-request-20260803.json
- platform-reliability-r1a-cutover-preparation-authority-request-20260803.md
- platform-reliability-r1a-cutover-preparation-failure-20260803.json
- platform-reliability-r1a-cutover-preparation-failure-20260803.md
- platform-reliability-r1a-github-production-environment-payload-20260803.json
- platform-reliability-r1a-github-production-branch-policy-payload-20260803.json

Context: an operator authorized commit
3d933b1f09ad621d9dfb584c612af9145c319f35. The action-time GitHub preflight
passed. The single temporary Render API key was created, but the one-time key
reveal appeared in a technical browser DOM snapshot. The key was never stored
or used. It was immediately revoked, the Render UI then showed no provisioned
API keys, the empty handoff artifacts were removed, and no provider request,
DB job, GitHub production environment, secret, variable, dispatch, merge,
deploy, migration, image publication or Stage 1 mutation occurred.

Review the current uncommitted delta against commit 3d933b1. Focus on P1/P2:

1. Does the failure receipt accurately and minimally prove containment without
   persisting the secret or falsely claiming a stronger rejection proof?
2. Does the hardened runbook make the reveal a true no-observation zone and
   require direct memory-to-0600-file transfer before any output?
3. Does it fail closed and forbid replacement-key creation under the consumed
   GO if any output contains the key?
4. Does the refreshed authority request clearly consume the failed window and
   require a new committed SHA and operator GO?
5. Did any restriction on merge, dispatch, Render mutation, deploy, migration,
   publication or Stage 1 weaken?

Return `GO` as the first word if no P1/P2 remains. Otherwise return concise
findings labeled `[P1]` or `[P2]` with exact file and line references. Ignore
P3/editorial suggestions.
