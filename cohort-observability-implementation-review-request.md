# Independent review request — Cohort Observability Component A

Authority/spec base: meta commit `98fc826`,
`cohort-observability-handoff.md` v1.1.

Review targets:

- `swipe-backend` PR <https://github.com/Glera/swipe-backend/pull/7>,
  immutable author commit `69ad03afdccaf7e5527db9398e120a75927dbbad`;
- `swipe-agents` PR <https://github.com/Glera/swipe-agents/pull/2>,
  immutable author head `d88ed17` at the time of this request.

This is an author-not-reviewer gate. Review the diffs and full repositories,
not the author transcript. Do not merge, deploy, enable flags, register a
production cohort, send Telegram messages, install unattended service, start a
quiet week, or enable A1.1/B1.

## Backend review scope

Confirm the implementation remains strictly inside Component A:

1. C1 facts only; no verdict, recommendation, retention, return, causal claim
   or runway.
2. `ENABLE_COHORT_OBSERVABILITY` is false by default and there is no HTTP route,
   FastAPI router or lifespan/scheduler hook.
3. UTC operational identity binds cutoff, config, implementation and exact
   input manifest; a fixed identity replays exact bytes.
4. Source loading is restricted to decrypted cohort user ids while public
   documents and Telegram render contain only `cohortSubjectId`.
5. Telegram user id is AES-256-GCM encrypted with config+subject AAD; the key,
   plaintext id, bot token and raw chat id never enter evidence.
6. Mapping UPDATE/direct DELETE/reinsert is refused and the privacy procedure
   writes an append-only tombstone before ciphertext deletion.
7. Materialize writes report, membership, digest and deterministic outbox in
   one transaction; two materializers converge on one identity.
8. Delivery commits `send_started` before HTTP, records confirmed provider
   message id, treats timeout as `outcome_unknown`, terminalizes retry
   exhaustion, and reconciles stranded sends.
9. PostgreSQL triggers reject append-only mutations, illegal lease/outbox
   transitions and non-queued outbox INSERT.
10. Settled is only a digest-checked bounded reference to an already committed
    canonical C1 report; its verdict rows are not copied or interpreted.

Inspect especially:

- `app/cohort_observability_contract.py`;
- `app/cohort_observability.py`;
- `app/cohort_observability_delivery.py`;
- `app/cohort_observability_scheduler.py`;
- `migrations/versions/0049_cohort_observability.py`;
- `tests/test_cohort_observability*.py`;
- `docs/runbooks/cohort-observability.md`.

Repository verification commands are recorded in the PR and enforced by
`.github/workflows/postgres-acceptance.yml`. CI is the authority for their
result.

## Reserve-host review scope

PR #2 fixes realpath entrypoint guards and refuses zero Telegram channel ids.
Review the new factual ledger:

`swipe-agents/docs/reserve-host-acceptance-2026-07-23.md`.

Confirm it does not mistake any of these for a completed gate:

- installed host release still predates PR #2;
- captured start had zero attention/incident ids;
- physical backup/restore and reboot takeover are not recorded;
- quiet week has not started;
- backup root is on the same physical disk;
- unattended bot, A1.1 and B1 remain disabled.

## Required response

Return findings only in this format:

```text
N. [P1|P2|P3] repo/path:line — problem and why it is a correctness,
privacy, authority or operational risk
```

If there are no findings, state explicitly that both PRs have no P1/P2/P3
findings, but keep merge/deploy/production actions as separate human gates.
Any finding will receive an explicit fixed/rejected disposition from the author
branch before another verification pass.
