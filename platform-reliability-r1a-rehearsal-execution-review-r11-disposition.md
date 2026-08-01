# R1-A disposable rehearsal execution review R11 — dispositions

Candidate v4: `9ca101ad63627a98faa00a0fb4a03b1bccc352fa` on
`codex/r1a-rehearsal-candidate-v4-20260801` (local, unpublished pending R12).

| Finding | Disposition |
| --- | --- |
| P1 bounded live-command failures | Accepted. `app.platform_release.main()` now catches unexpected exceptions, maps them to the fixed `unexpected_error` reason and emits a canonical no-clobber failure receipt plus its SHA-256. Parametrized tests cover typed and unknown failures, redact exception detail and prove no-clobber replay. |
| P1 provider proof omitted from review | Accepted. R12 receives both `scripts/platform-release-provider-capture.py` and `tests/test_platform_release_provider_capture.py`; the implementation is GET-only and its existing tests are part of the focused run. |
| P2 exact production registry identity | Accepted fail-closed. Candidate v4 has no production registry ID and therefore rejects every production-scope invocation with `production_registry_identity_unconfigured`. A later cutover-only reviewed successor must pin exactly one registry ID; tests cover both the disabled state and exact/wrong pins. |
| P2 env-restore retry/recovery | Accepted. Every compensation key gets up to three attempts and restoration continues across keys; transient and exhausted paths are tested. The runbook now requires exact manual seven-key restoration/re-read or deletion of the disposable web and rehearsal failure. |
| P2 CAS→POST residual | Accepted as explicit provider residual. Code comments and the runbook state Render has no atomic deploy-if-current endpoint; the single workflow concurrency group plus attended no concurrent Render UI/API actions are compensating controls, not an atomicity claim. |
| P3 dated rehearsal | Accepted. Candidate v4 and its executable rehearsal database identity are frozen single-use inputs. |

Focused verification after these changes: 80 tests passed; Mission architecture
guard PASS; workflow YAML and `git diff --check` PASS.

This disposition does not authorize publication or provider mutation. R12 must
return GO on the exact v4 packet before the already granted operator authority
may be exercised.
