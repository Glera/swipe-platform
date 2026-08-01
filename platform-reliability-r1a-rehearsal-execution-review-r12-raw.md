# R1-A disposable rehearsal execution review R12 — raw verdict

Source: <https://claude.ai/chat/2b5dbc26-0a72-4cbc-a257-d815ea7c9883>

## R12 Verdict: GO for the authorized disposable rehearsal only

The reviewer read all thirteen files, including the provider-capture source and
tests omitted from R11, and verified both R11 P1 fixes directly in code.

### P1 dispositions verified

1. `app/platform_release.py:main()` now catches every exception for the live
   `predeploy-env` and `verify-applied-db` commands, maps unknown failures to
   `unexpected_error`, and emits canonical `platform-release-command-failure.v1`
   bytes plus SHA-256 without a traceback or exception detail. Parametrized
   tests cover typed/unknown failures and no-clobber replay.
2. `scripts/platform-release-provider-capture.py` is GET-only. Its normalization
   fails closed on unreadable or inconsistent Auto Deploy fields, conflicting
   Dockerfile paths, malformed nested shapes and reused IDs. `mergeSafe` is true
   only when Blueprint Auto Sync and all three service Auto Deploy states are
   false. The supplied tests cover plain and live response shapes.

### P2 dispositions verified

- production registry authority is unconfigured and therefore every production
  invocation fails closed until a later reviewed exact-ID pin;
- env restoration retries each key three times, continues across exhausted
  keys, raises typed `release_env_restore_failed`, and never posts a deploy on
  exhaustion; runbook recovery matches the code;
- the CAS-to-POST residual is named honestly and constrained by the workflow
  concurrency group plus attended no-concurrent Render access.

### Remaining conditions

- GO applies only to the exact disposable rehearsal, USD 3 ceiling and accepted
  temporary account-wide Render key blast radius;
- it is not production-cutover authority;
- the operator action-time GO remains required by the runbook.

The operator had already supplied that exact action-time GO before R12:
“Да, запускай rehearsal до $3; принимаю временный account-wide scope Render API
key только для disposable workspace”.

No further code changes were requested before execution.
