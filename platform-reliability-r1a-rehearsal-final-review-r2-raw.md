# Platform Reliability R1-A — final rehearsal review R2 raw verdict

Date: 2026-08-02.

Reviewer: independent Claude Code session
`26815846-801f-4aa7-ab0d-8c45c9e0adea` (Claude Sonnet 5, high effort,
read-only). Reviewed exact meta commit `1c2a1ec` and bounded receipt directory
`/private/tmp/p4g-r1a-rehearsal-v7.ZIHAq0`.

Authentication used the operator's Claude subscription. CLI
`total_cost_usd=1.3259446` is API-equivalent subscription telemetry, not a
separate API invoice.

## Raw verdict

**GO** — the corrective rehearsal packet earns final rehearsal GO. The
production cutover packet is safe (prepared-not-authorized, no production
action implied). No P1/P2 findings.

The reviewer independently verified:

- exact candidate-v7 run `30737041825`, deploy
  `dep-d9nencdaeets73bpdta0`, image digest
  `sha256:837612eda640e037f6d5322dc57c5ca9706a665ea8a9a38d6c986a5b54cdd2fb`,
  revision `0071_platform_release_receipts` and stored receipt
  `842abbc13a54edc61f7e2ba7896ded3f7d2980b9d670bb54df69df43d27a4843`;
- exact baseline-v4 forward-only rollback while the database remained at
  `0071`, plus byte-identical candidate/rollback health SHA-256
  `3d5f2a2d1c514ff30c67eb1b1adda17bd1259eac126b882102d6bcd01e8b5036`;
- real `source_cas_mismatch` and `deploy_identity_conflict` refusal logs;
- provider-side credential revocation from both browser-absence and HTTP-401
  receipts;
- the narrow concurrent-R1 attribution without claiming that separate
  initiative complete;
- live read-only Stage 1/backend/meta/client heads and absence of scope drift;
- the cutover packet's requirement for a new successor, new production image
  pair, fresh provider capture and new operator GO because backend `master`
  advanced.

## Non-blocking notes

1. The runtime receipt and evidence packet originally cited different hashes
   for credential revocation. They are valid hashes of two separate proofs
   (browser absence and HTTP 401), but both should be cited in both documents.
2. Four successful coordinator runs' job-level numeric IDs were not
   independently re-derivable from the retained snapshot. Their run IDs, head
   SHA, conclusion, image/deploy identity and receipt hashes were independently
   verified. Future packets should retain `jobs[]` for every dispatched run.

No finding authorizes merge, deploy or production cutover. Those remain gated
on the separate exact operator GO defined in the cutover packet.
