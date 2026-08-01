# R1-A / Stage 1 adapter-policy R4 — disposition

Verdict: **GO**. No P1/P2 remain.

The accepted backend implementation is
`4bfc1d6868d3a41c5439972375292305e13a50c0` on PR #33. It changes exactly the
policy JSON, parser and guard tests; Stage 1 backend/client branches are
unchanged.

| R4 observation | Disposition |
| --- | --- |
| P3 mission_* package-directory contour | Accepted as pre-existing follow-up. It is outside the narrow authority-diff; current Stage 1 modules are flat. |
| P3 duplicate JSON keys | Accepted as separate parser hardening. Policy SHA receipt makes edits visible; no silent grant exists in the accepted bytes. |
| P3 forbidden module may be named in adapter policy | No authority impact: forbidden precedence remains enforced and has a dedicated mutant. |
| P3 extra malformed-shape/CLI tests | Existing required mutants plus independent adversarial reproduction are sufficient for this package. |
| P3 dynamic imports | Pre-existing static-analysis boundary; no Stage 1 mission module uses it. |

Fresh PR CI completed successfully for the accepted head:

- Platform release image run
  [`30698637146`](https://github.com/Glera/swipe-backend/actions/runs/30698637146),
  `2026-08-01T11:55:10Z`–`11:56:40Z`;
- PostgreSQL acceptance run
  [`30698637190`](https://github.com/Glera/swipe-backend/actions/runs/30698637190),
  `2026-08-01T11:55:10Z`–`12:02:43Z`.

Both runs pin head
`4bfc1d6868d3a41c5439972375292305e13a50c0`. No rerun or duplicate dispatch
was used.

R4 itself authorizes no merge, workflow dispatch, rehearsal, provider mutation
or production action.
