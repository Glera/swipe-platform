# R1-A disposable rehearsal execution review R11 — raw verdict

Source: <https://claude.ai/chat/cc062de2-c042-4a8f-a788-0fcd54d22992>

## R11 Verdict: NO-GO

The reviewer read all eight supplied files. It found that R10's executable
production-ID denial and second-CAS compensation were genuinely fixed and
test-backed, but retained two P1 blockers.

### P1 — blocking

1. `platform_release.py:main()` still caught only `PlatformReleaseError`.
   `predeploy-env` and `verify-applied-db` are the live database gates and may
   raise unexpected exceptions; those would produce a traceback/default exit
   rather than a bounded, hash-bound failure receipt. The reviewer required the
   coordinator's generic-exception pattern to be mirrored into this entry
   point.
2. The executable before/after production-boundary proof could not be reviewed
   because `scripts/platform-release-provider-capture.py` and its tests were
   omitted from the eight uploaded files. The reviewer could not inspect its
   fail-closed normalization or GET-only behavior and would not accept the
   runbook's claim without the implementation.

### P2 — should fix, not independently blocking

1. Production scope pinned service, Blueprint, owner and database identity but
   did not pin the registry credential to one exact known ID; any syntactically
   valid `rgc-*` value passed.
2. `_restore_release_env` had no retry, and the runbook had no operator recovery
   path for `release_env_restore_failed`.
3. A residual race necessarily remains between the second source-CAS and the
   deploy POST because Render has no atomic deploy-if-current endpoint. The
   evidence must name the attended no-concurrent-access mitigation instead of
   implying full atomicity.

### Confirmed fixed

- rehearsal authority is checked against code-owned production identities
  before a Render client is constructed;
- ambiguous/partial env writes and the second-CAS mismatch compensate to the
  captured environment snapshot;
- `PLATFORM_RELEASE_AUTHORITY_SCOPE` is consistent across workflow, runbook,
  evidence and parser;
- replay/conflict and forward-only rollback semantics remained sound.

### P3

- the evidence packet is correctly still a pre-execution template;
- the dated rehearsal identity means any later rehearsal requires a new
  reviewed successor rather than changing a parameter.

Bottom line: do not request operator GO until the live command failure path is
bounded and the provider-capture implementation is supplied to the reviewer.
