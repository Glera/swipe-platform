# Platform Reliability R1-A — rehearsal review R6 captured output

Capture note: the independent CLI review returned a condensed terminal report
and did not persist a longer plan/transcript. This file records the complete
verdict and finding set available to the audit trail; it does not reconstruct
unavailable reviewer prose.

Verdict: **NO-GO** for executing the first rehearsal draft. The prior R5
implementation GO was not withdrawn.

## P1

1. Both manual release workflows existed only on non-default R1-A branches.
   GitHub requires a `workflow_dispatch` workflow to exist on the default
   branch before a run can select another ref, so rehearsal steps 4–9 were
   circular and non-executable while the main implementation merge remained
   deliberately withheld.

## P2

1. The disposable provider set did not provision the registry credential
   required by the coordinator.
2. Baseline image dispatch did not enumerate every workflow input under the
   no-repeat-per-SHA rule.
3. A provider build receipt alone did not prove the SHA embedded inside the
   source-built cron container.
4. `61110cdd…` was labeled as the reviewed client/feed head even though the
   implementation review head and the public release archive's `feedCommit`
   are different identities.
5. The first live API-shape gate described behavior but had no reviewed
   executable artifact behind it.
6. The runbook required the Git-backed provider capture after switching the
   service to an immutable image, when `branch` and `dockerfilePath` are no
   longer meaningful fields for that service state.

The reviewer also reported eight P3 observations in its condensed summary,
but their individual text was not retained. The follow-up review therefore
must inspect the complete corrected runbook and Blueprint rather than treating
only the seven retained blockers as its scope.

No external resource, workflow dispatch, image publication or provider
mutation occurred during R6.
