# R1-A candidate-v3 failure review — P3 disposition

Prepared: 2026-08-03 UTC.

Status: **ALL P3 NOTES ADDRESSED; FOCUSED R2 REQUIRED**.

| P3 note | Disposition |
| --- | --- |
| Compound status token could be parsed ambiguously | Split into `status=FAIL_CONTAINED`, `publicationOccurred=false` and `operatorAuthorityConsumed=true`. |
| Python-path reasoning lacked exact source-byte citations | Added baseline Dockerfile, smoke and workflow git blobs/sizes plus the exact layout/invocation facts; the corrective proposal pins all three. |
| Machine preflight omitted merge/PR and frozen release bindings summarized by the human receipt | Added exact merge parents/tree/PR #52 and frozen feed/playables/swipe-platform/release.json identities. |
| Human receipt called 76 seconds the run duration | Distinguished job wall time 76 seconds from run wall time 81 seconds in JSON and prose. |
| `migration=false` could obscure the ephemeral CI upgrade | Replaced it with `ephemeralCiDatabaseMigration=true` and `productionMigration=false`; prose explicitly distinguishes them. |

All changes are evidence-only and additive-restrictive. They grant no source
edit, branch/ref write, PR, merge, dispatch, publication, provider action,
deploy, production migration, rehearsal, cutover or Stage 1 runtime action.
