# Fast Lane parallel v1 — attended live GO packet

Status: **STOP BEFORE GO**. This packet is an operator checklist, not rollout
authority. Exact candidate receipts are in
`labs-fast-lane-parallel-v1-execution-receipt-2026-08-10.md`.

## Preconditions for operator GO

1. Review and merge only the exact draft heads: backend PR #62, feed PR #30,
   generator PR #27 and the linked meta PR. Re-run required CI if any head
   changes; do not accept a substitute commit.
2. Confirm a recent database backup and the existing backend deploy runbook.
   Migration `0077_fast_lane_parallel_ready` is additive but introduces durable
   data that must not be discarded by an automatic downgrade.
3. Keep Two Dots release `6c267c01-1fc5-4137-a2c6-e81142d67972` and all existing
   Klondike/Smash records out of the smoke input set.
4. Confirm the Telegram bot username/base URL used to derive `startapp=pr_*`
   deep-links and that the operator allowlist is unchanged.

## Rollout order after explicit GO

1. Deploy backend exact merged head and apply Alembic through
   `0077_fast_lane_parallel_ready`; check one migration head and readiness.
2. Deploy feed exact merged head. Open one synthetic READY review deep-link on
   Telegram mobile and desktop and verify the exact frozen candidate in the
   responsive game slot before approval is enabled.
3. Hand the exact merged generator SHA to the runtime host and perform the one
   normal reversible Lab restart. Check the runtime reports that SHA.
4. Only then submit ten fresh tasks for ten distinct mechanics. Capture:
   at least two simultaneous `PREPARING`, all ten request/release identities,
   one notification row/message per READY, card/message original-request
   equality, one controlled task-local failure if an approved hermetic input is
   available, and zero overlapping publication executors.
5. Do not publish or activate any smoke candidate as part of preparation
   acceptance. Publication singleton acceptance is already deterministic; a
   real publish needs a separate named candidate and operator decision.

Expected attended wall time for the ten-task smoke is **25–40 minutes**:
roughly 2–5 minutes for admission/concurrency evidence, 10–20 minutes for the
slowest parallel build/test/visual/covers path, and 10–15 minutes to inspect
notifications plus one mobile/desktop in-platform candidate. Stop at 40
minutes and record `NEEDS_HELP` instead of silently extending or retrying.

## Pass conditions

- all ten tasks retain distinct durable request/release/binding identities;
- at least two were observed in «Готовится» at the same time;
- a READY and a controlled failed task did not stop unrelated preparations;
- every READY has one and only one confirmed notification whose mechanic,
  request text and deep-link match its review card;
- one READY exact frozen candidate completes autoplay, manual takeover,
  restart and terminal lifecycle on Telegram mobile and desktop;
- no manifest/catalog/roster/allocation changed and no publication or
  activation began.

Any mismatch is a **NO-GO / NEEDS_HELP**, not an instruction to repair live
records during the smoke.

## Rollback

1. Stop new Fast Lane intake with the existing default-off release gate before
   changing binaries. Preserve release journals and backend outbox rows.
2. Roll generator back to its pre-merge head and restart once through the
   normal runbook; do not delete immutable candidate directories or rewrite
   shared platform history.
3. Roll feed back to `02f398f0c2697884d3184eb4ca4a0218bc191e4d` if the review
   surface is the failure boundary.
4. Prefer a backend roll-forward fix. After any `0077` row has been written,
   leave the additive schema in place and do not run an automatic Alembic
   downgrade. If no `0077` writes occurred, the previous backend application
   head may run against the additive unused schema after operator review.
5. Confirm that intake remains off, singleton publication has no active lease,
   and existing Two Dots/Klondike/Smash rows are byte-for-byte unchanged before
   ending rollback.

Retrying a failed deploy, rolling back data, approving/cancelling a candidate,
or sending a replacement Telegram notification requires a new operator
decision; none is implicit in this packet.
