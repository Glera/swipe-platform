# R1-A LKG smoke source-fix authority review — P3 disposition

Prepared: 2026-08-03 UTC.

Status: **ALL P3 ADVISORIES DISPOSITIONED; NO AUTHORITY-DOCUMENT CHANGE
REQUIRED**.

| P3 | Disposition |
| --- | --- |
| The package proves the source diff at string level, not successful LKG behavior | Accepted by design. The source-fix window may prove red/green tests and automatic PR CI only. The real LKG forward-smoke remains deferred to a separately authorized candidate-v4 publication. |
| Recheck that automatic PR CI did not create a GHCR version | Accepted as a read-only post-CI observation in the implementation receipt. It grants no registry mutation or workflow dispatch. Any unexpected version stops the window. |
| Ordering constraints depend on the current workflow layout | Safe and fail-closed. Exact backend base and workflow blob are preconditions; the required red/green assertion stops the window if the layout cannot satisfy the committed placement. |
| Failure signature and evidence filenames are not repeated in every request document | The authority request pins the independently accepted failure packet at `6cb47b16148956fdeaaeb04d6cafd61b95700f95`; the implementation receipt will additionally quote the exact `ImportError` and source evidence filenames for operator traceability. Duplication in the reviewed authority documents is unnecessary. |

No P3 changes the allowed source diff, action count, costs or deny-list. The
reviewed request remains non-executable until an exact operator GO names the
final reviewed packet commit.
