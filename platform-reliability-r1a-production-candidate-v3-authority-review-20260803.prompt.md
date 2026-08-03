# Independent read-only review — R1-A candidate-v3 publication authority

Review exact substantive meta commit
`644d6cf4a1b49734c4d39e937a95216ceb05bb8b` in
`/private/tmp/p4g-r1a-meta.YPUxDz`.

Use Read only. Do not edit, fetch, browse, call external APIs or perform any
mutation. Return first line exactly `GO` only if no P1/P2 remains; otherwise
return `NO-GO` and list only precise P1/P2 findings with file and line. Keep
the response under 900 words.

Review these committed files and the committed evidence they cite:

- `platform-reliability-r1a-recovery-v3-merge-v2-corrective-acceptance-20260803.md`;
- `platform-reliability-r1a-production-candidate-v3-publication-authority-request-20260803.json`;
- `platform-reliability-r1a-production-candidate-v3-publication-authority-request-20260803.md`;
- `platform-reliability-r1a-production-candidate-v3-publication-runbook-20260803.md`;
- prior baseline/candidate/recovery/corrective receipts as needed.

Verify specifically:

1. The exact operator acceptance of corrective commit `f0811e...` is recorded
   without broadening it, and source merge `f2a840...` is used only as source
   authority for a new request.
2. The candidate source identity, parents/tree, exact workflow digest, frozen
   cross-repository sources and accepted baseline are internally consistent
   with cited committed receipts.
3. `code_min_revision=0072_mission_ops_receipts`,
   `code_max_revision=0073_platform_release_receipts`, and the LKG forward
   range `0069..0073` correctly express the workflow's predecessor/target and
   old-image-forward-smoke contract.
4. Using `master` is fail-closed enough: exact SHA is required twice with the
   second read immediately before the one dispatch, source/ref writes are
   forbidden, and master movement is a hard stop. Flag any remaining
   publication race or ambiguous authority as P1/P2.
5. The authority allows exactly one candidate publication only after a future
   operator GO and forbids baseline rebuild, retry, source write, merge,
   GitHub production-environment/Render mutation, deploy, migration,
   rehearsal, cutover and Stage 1 runtime action.
6. Required preflight/receipts can prove absence, exact inputs, OCI identity,
   sidecar, LKG binding, provenance/SBOM and no out-of-scope action.
7. No wording in the JSON, human request or runbook silently grants the
   publication now or grants a later rehearsal/cutover.

A GO is review evidence only. It does not grant workflow dispatch or any
operational authority.
