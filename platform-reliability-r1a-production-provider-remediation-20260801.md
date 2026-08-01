# Platform Reliability R1-A — production provider remediation receipt

Attended window ended: `2026-08-01T12:30:38Z`  
Provider: Render authenticated dashboard and exact-ID Render API GETs  
Operator authority: explicit approval in the active Codex task to disable the
three Auto-Deploy controls and create, use, then revoke a temporary account API
key.

## Setting change

Blueprint `exs-d95qo3q8qa3s73ea23p0` remained on **Manual sync**. Auto-Deploy
was changed from `On Commit` to **Off** for the Blueprint-managed production
services and then read back as **Off** on each exact settings page:

| Resource | Render ID | Read-back |
| --- | --- | --- |
| Web `swipe-backend` | `srv-d95r3bfavr4c73aqsi4g` | branch `master`, Dockerfile `./Dockerfile.bake`, Auto-Deploy `Off` |
| Cron `swipe-seq-shadow-run` | `crn-d9kej0u1egvs73engu7g` | branch `master`, Dockerfile `./Dockerfile.bake`, Auto-Deploy `Off` |
| Cron `swipe-c1-materialize` | `crn-d9e6vmtaeets73ai8cj0` | branch `master`, Dockerfile `./Dockerfile.bake`, Auto-Deploy `Off` |

No deploy, Blueprint sync, merge, workflow dispatch or service/resource
provisioning was invoked while changing these controls.

## Temporary credential lifecycle

A single API key named `codex-r1a-capture-20260801` was created after the
account settings page showed no provisioned API keys. Its plaintext existed
only in the Render creation dialog and a local mode-`0600` temporary file. The
local file was deleted, the in-memory copy was cleared and the Render key was
revoked. The account settings page then again showed **No provisioned API
keys**. No key bytes are present in this receipt or the repository.

## First capture attempt

The reviewed capture command addressed only the exact Blueprint and three
service IDs above. It stopped fail-closed with
`service_autodeploy_unreadable` and published no receipt. A bounded diagnostic
GET against the same web-service ID established the non-secret live response
shape:

- `autoDeploy` is the exact string enum `"no"`;
- `autoDeployTrigger` is `"off"`;
- `branch` is top-level `"master"`;
- `dockerfilePath` is
  `serviceDetails.envSpecificDetails.dockerfilePath`, not top-level.

This is the response-shape incompatibility anticipated by independent review
R5. Backend successor
`4f4be2e3badfd9084e92bfe731e231f66ff92729` adapts the capture parser strictly
to the observed enum/nested form while retaining the previously reviewed
boolean/top-level form. Independent adapter review R1 found two surviving
mutants; both were fixed. R2 then returned **GO** with no P1/P2. A new
temporary key and capture still require fresh action-time operator authority.

This remediation receipt does **not** authorize sentinel merge, backend merge,
rehearsal or production cutover.
