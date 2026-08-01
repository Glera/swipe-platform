# Platform Reliability R1-A — production provider UI preflight

Observed at: `2026-08-01T12:01:30Z`  
Provider: Render authenticated dashboard  
Mode: read-only UI inspection; no provider setting, secret, resource or deploy
was changed.

This is an early attended preflight, not the reviewed single-use API capture
receipt required by the cutover runbook.

## Observed production identities

| Resource | Render ID | Stored branch | Stored Dockerfile | Deploy control |
| --- | --- | --- | --- | --- |
| Blueprint `swipe-backend` | `exs-d95qo3q8qa3s73ea23p0` | `master` | n/a | `Manual sync` |
| Web `swipe-backend` | `srv-d95r3bfavr4c73aqsi4g` | `master` | `./Dockerfile.bake` | Auto-Deploy `On Commit` |
| Cron `swipe-seq-shadow-run` | `crn-d9kej0u1egvs73engu7g` | `master` | `./Dockerfile.bake` | Auto-Deploy `On Commit` |
| Cron `swipe-c1-materialize` | `crn-d9e6vmtaeets73ai8cj0` | `master` | `./Dockerfile.bake` | Auto-Deploy `On Commit` |

## Disposition

**FAIL / STOP.** Blueprint Auto Sync is already off (`Manual sync`), but all
three surviving Git-backed services can deploy automatically from `master`.
This violates the reviewed pre-merge condition that Blueprint Auto Sync and
web plus both cron Auto-Deploy controls are all off before the sentinel or
R1-A backend merge.

No Render API key is needed while the attended UI state is known to fail. No
sentinel merge, R1-A backend merge, workflow dispatch, rehearsal or production
cutover is authorized by this preflight.

The next provider mutation requires a separate operator confirmation: change
Auto-Deploy to **Off** on the web service and both cron services while keeping
the Blueprint on Manual sync. Immediately after that change, run the reviewed
single-use API capture against the exact IDs above, preserve its no-clobber JCS
receipt, and ask for the separate operator GO to merge sentinel PR #45.
