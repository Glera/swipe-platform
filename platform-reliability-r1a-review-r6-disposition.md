# Platform Reliability R1-A — rehearsal review R6 disposition

Status: all retained P1/P2 findings are closed in local review artifacts;
independent follow-up acceptance is still required before any rehearsal
authority. No external state has changed.

| Priority | Finding | Disposition |
| --- | --- | --- |
| P1 | Manual workflows absent from the default branch | Added two registration-only sentinel workflows on backend branch `codex/r1a-workflow-registration`. Their names and `workflow_dispatch` input schemas equal the full workflows; the default versions have no checkout, secrets, environment, package/provider authority and always exit 2. This separate sentinel PR needs independent review and explicit operator merge GO. |
| P2 | Missing registry credential | The disposable provider contract now provisions one temporary GHCR credential, pins its exact ID in the temporary GitHub environment and deletes it during cleanup. |
| P2 | Incomplete baseline inputs | The runbook now enumerates all twelve image-workflow inputs for baseline, including three explicitly empty optional LKG fields, and all twelve candidate inputs. |
| P2 | Provider build receipt did not prove embedded SHA | Both disposable source-built crons now run an inert command that prints `/app/platform-backend-sha`; the exact baseline SHA is bound to service/deploy/job/log IDs. |
| P2 | Feed identity mislabeled | `61110cdd…` is now labeled only as the public release archive's exact `feedCommit`; the rebased client guard has its own identity row. |
| P2 | API-shape gate had no reviewed implementation | The first authenticated action now invokes the reviewed GET-only `platform-release-provider-capture.py` against an isolated temporary Render workspace whose resources use the capture's exact expected names. Any shape/state mismatch exits 2. |
| P2 | Git-backed capture required after image switch | Post-switch evidence is now the immutable coordinator receipt plus a bounded image-backed service snapshot; the Git-backed capture runs only before mutation. |

Additional closure evidence:

- backend and client ranges were rebased onto the later accepted master heads;
  `/usr/bin/git range-diff` reports every patch as `=`;
- post-rebase local release suites are 29/29 for the candidate and 22/22 for
  the baseline; client guard mutants and production build pass;
- the disposable Blueprint parses and contains exactly the web/two-cron names,
  branch, Dockerfile, plans and default-off deploy state expected by capture;
- a structural check proves both sentinel input schemas equal the corresponding
  full workflow schemas and contain no privileged execution surface.

The corrected artifacts are
`platform-reliability-r1a-disposable-rehearsal-runbook.md` and
`render.r1a-rehearsal.yaml`. R6 authorizes neither the sentinel merge nor
creation of paid/disposable resources; those remain action-time operator
decisions after follow-up GO.
