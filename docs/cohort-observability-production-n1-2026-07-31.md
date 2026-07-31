# Cohort Observability Component A — production N=1 receipt

Date: `2026-07-31T20:11:26Z`

Status: **Pass. The operator-only diagnostic N=1 was registered,
materialized, delivered once and replay-verified. Production cron, participant
invitations, unattended A1 and A1.1/B1 remain disabled.**

## Authority and containment

The operator separately authorized the production N=1 diagnostic dry-run.
The run used the existing Render web service and existing product-bot
destination. No destination chat ID, Telegram user ID, bot token or mapping key
was printed or copied into this receipt.

The persistent Render value of `ENABLE_COHORT_OBSERVABILITY` remained `false`.
Mutating CLI invocations received `ENABLE_COHORT_OBSERVABILITY=true` only in
their one-shot process environment. No service restart, environment edit,
cron, HTTP route, application hook or unattended process was created.

## Production identity and preflight

| Field | Receipt |
|---|---|
| Render service | `srv-d95r3bfavr4c73aqsi4g` |
| Deployed commit | `4165b5f37992d35daef5aeb38653e996727aefb4` |
| Alembic | `0070_published_test_delivery (head)` |
| Content analytics | enabled |
| Cohort CLI | present |
| Mapping key / bot token / threshold version | configured; values not read or emitted |
| Destination | non-zero integer; value not emitted |
| Operator mapping source | exactly one configured operator ID; value not emitted |

The first local packet-preparation attempt passed the destination as a string
and the typed contract correctly refused it before any file write, database
write or Telegram call. The preparation was repeated with an integer, then all
subsequent gates passed.

## Registration

| Field | Receipt |
|---|---|
| Config version | `cohort.operator-v1` |
| Config digest | `29630be7fea54edf64be4636a576d6526a00953cc8e13ff293460896ba237fe0` |
| Public subjects | `operator` only |
| Secret mapping count | `1` |
| Dry-run | `apply:false`; digest matched |
| Apply | `registered:true`; digest matched |

The mode-0600 plaintext mapping file was deleted immediately after successful
registration. The encrypted production mapping remains under the Component A
database contract. The remaining temporary public packet and its directory
were deleted after final verification.

## Dry-run review

All four required no-write commands ran before materialization:
`materialize`, `run-once`, `deliver` and `status` without `--apply`.
Pre-apply status had no report, digest, run receipt, outbox row or delivery
attempt.

The generated document passed the bounded content review:

| Contract | Result |
|---|---|
| `diagnosticN1` | `true` |
| Operational window | `settled:false` |
| Settled reference | `available:false` |
| Discipline | `C2-выводов нет` |
| Forbidden render tokens | none |
| Render length | `234` characters |
| Configured / active / completed | `1 / 1 / 1` |
| Technical failures | `0` |
| Aggregate data quality | honest `inconclusive: intervention_overlap` |
| Operator subject quality | `pass` |

The report used real C1 facts rather than invented zeros: one qualified play,
one completed series and typed unfinished-series ordinals were present. No C2
verdict, recommendation, retention or runway field was introduced.

## Materialization and delivery

Materialization committed one operational report, its exact input manifest,
one digest and one deterministic queued delivery:

| Artifact | Identity |
|---|---|
| Data cutoff | `2026-07-31T20:10:04.657755Z` |
| Report ID | `cb3b4629-aac0-5a7f-b389-81a4e11eb328` |
| Report digest | `885cd86997e4d7db105bff41f81fbeccc1aeab731c7fd530f90cf2e8bcec538b` |
| Digest ID | `6459ccb0-3802-50f1-bd95-67a78cddb074` |
| Digest document digest | `65a6abaf06ecb3ea259d5d292fe7e5d43eb42cf021c8c6d276770d7ae83d7190` |
| Materialize run | `88df4fd1-88f1-4c61-8824-98edfa43ac08`; `materialized` |
| Materialize receipt digest | `34d9fac757911b1a5f23ac5a00c6f0708db660449c91b989a582f4cd51ca07db` |

Delivery then produced exactly one provider attempt:

| Field | Receipt |
|---|---|
| Delivery ID | `d2118d42-db28-571b-ab00-beeb4b76b792` |
| Attempt | `1` |
| Outcome | `confirmed` |
| Breaker | closed |
| Delivery run | `e49d107a-43ec-45ed-a502-a7dc239f5cc9`; `delivered` |
| Delivery receipt digest | `3ab6c9fbab6f1f34dbfae88e75e692d0db9e03f3934ccc124b195741d7c6b763` |

Final status reported `deliveryAttemptCount:1` and
`outboxByStatus:{"confirmed":1}`. There was no `send_started`,
`outcome_unknown`, retry or second provider message.

## Exact replay

Materialization was repeated with the exact stored data cutoff. It returned the
same report ID/digest and digest ID/digest, `replayed:true`, `enqueued:false`
and an operator receipt with `outcome:noop`:

```text
d0c9d203-984f-42f5-86a3-d989deb991b5
```

Post-replay status still contained exactly one confirmed outbox row and one
delivery attempt. This closes the production idempotency/no-double-send check.

## Result and remaining gates

Component A production N=1 is complete. The diagnostic result is intentionally
not a C2 or product-success claim; aggregate quality remains inconclusive for
the typed reason above.

Still requires separate human authority:

- participant invitations or cohort expansion;
- creation and enablement of any production cohort cron;
- A1.1/B1 release, credentials and its own acceptance period;
- unattended A1 enablement.
