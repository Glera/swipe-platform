# R1-A rehearsal review R9 — disposition

Verdict: **GO**. No P1/P2 remain. R5's implementation GO stands and the local
rehearsal contract is closed.

| R9 observation | Disposition |
| --- | --- |
| P3 stale production-source rationale | Accepted. The runbook distinguishes master (`./Dockerfile.bake`, live schedules) from the later candidate (`./Dockerfile`, different schedules/database plan); neither pins the dated rehearsal branch. |
| P3 no origin-resolution receipt for Blueprint ref | Accepted. Step 1 now requires origin `codex/r1a-rehearsal-blueprint-20260801` to resolve exactly to `183336a1765933e8707a26747b7baf60d5212c1e`. |
| P3 environment variable names but not values | Accepted. Every readable value must equal the recorded disposable resource identity and exact database identity. |
| P3 Render API key blast radius unstated | Accepted. The runbook declares account-wide authority over visible workspaces, requires a complete owner/workspace inventory, forbids production IDs as targets and requires explicit operator acceptance. |
| P3 Team-organization alternate | Accepted by elimination. The contract now requires GitHub Pro for the personal account only. |
| P3 sentinel CI cost omitted | Accepted. Step 0 names PostgreSQL acceptance on the PR and PostgreSQL acceptance plus browser E2E on merge; these have no provider authority but consume Actions minutes. |

No external state was changed by these documentation-only dispositions.
GitHub Pro purchase, branch publication, sentinel PR/merge, GitHub App access,
GitHub environment/secrets, Render resources, workflow dispatches, GHCR image
publication, rehearsal and production cutover remain separately gated.
