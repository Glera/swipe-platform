# R1-A recovery-v3 merge-window v2 — corrective acceptance request

Prepared: 2026-08-03 UTC.

Status: **DRAFT; REQUIRES INDEPENDENT REVIEW; NOT YET AN OPERATOR REQUEST**.

The exact review target is the future meta commit containing:

- `platform-reliability-r1a-recovery-v3-merge-v2-20260803.{json,md}`;
- both provider evidence receipts;
- `platform-reliability-r1a-recovery-v3-merge-v2-corrective-disposition-20260803.md`;
- this request.

The requested decision is disposition-only. It makes the already completed,
provider-isolated source merge usable as source authority for drafting the next
candidate publication packet. It grants no operational action.

Operator form, not an authorization:

> ACCEPT R1-A recovery-v3 merge-window v2 corrective disposition for packet
> `<exact-reviewed-substantive-commit>` only. Accept NC-1 as an authority-document
> defect with settled pre-cutover baseline
> `master + ./Dockerfile.bake`; accept NC-2 as a contained process
> nonconformity without credential exposure; accept NC-3 as a local bootstrap
> note. Treat backend merge
> `f2a840517956c4f480fc9d8aaf6f832ebde489d9` as valid source authority for
> preparing a separately reviewed candidate-publication request. This grants
> no workflow dispatch, image publication, Render key or provider mutation,
> GitHub-environment mutation, deploy, migration, rehearsal, cutover or Stage 1
> runtime action.

The final handoff must replace the placeholder in the operator's message with
the exact independently reviewed substantive commit. The tracked template
cannot self-pin the SHA of the commit that contains itself.
