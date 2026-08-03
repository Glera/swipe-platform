# Independent review disposition — R1-A recovery-v3 merge-window v2

Reviewed: 2026-08-03 UTC.

Status: **GO; NO P1/P2; READY FOR OPERATOR DECISION**.

Independent safe-mode session `9c9946e1-8916-4a0c-8085-042e209f0d49`
reviewed exact substantive commit
`f1435dc88be96e8c9c53a6c5ff319a212d57f981` and returned GO with no P1/P2.

It accepted the contained-failure truthfulness, consumed-authority boundary,
shared-home root-cause fix, bidirectional probe, exclusive `0600` handoff,
post-submit `Done`/hidden reveal rule, GET-only provider inventory, pre-merge
revocation, exact GitHub CAS and post-merge parents/tree proof.

P3 dispositions:

1. The five HTTP 400 probes were issued from the isolated browser runtime.
   V2's revocation proof instead runs from the host using the now-shared
   handoff. A non-secret host probe with an invalid Render-shaped token returned
   exact HTTP 401 after containment, proving the host endpoint/header form is
   correct. The actual revoked key must still return 401 or v2 stops.
2. Live UI names cannot be committed without risking a repeat secret leak.
   V2 therefore grounds and count-checks every control at action time, emits
   nothing during reveal, uses `Done` after the state transition and waits for
   the dialog to be hidden before any observation.

The prompt and verbatim result are committed beside this disposition. This GO
accepts only the failure receipt and v2 request/runbook for a new operator
decision. It does not authorize key creation, provider capture or merge.
