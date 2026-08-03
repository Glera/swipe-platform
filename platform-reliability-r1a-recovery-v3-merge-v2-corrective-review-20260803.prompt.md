# Independent corrective review — R1-A recovery-v3 source merge

Review exact meta commit
`73121940d6c195b7e5277dfd30da88535821f10d` in
`/private/tmp/p4g-r1a-meta.YPUxDz`.

Primary files:

- `platform-reliability-r1a-recovery-v3-merge-v2-20260803.{json,md}`;
- `platform-reliability-r1a-recovery-v3-merge-v2-provider-capture-20260803.json`;
- `platform-reliability-r1a-recovery-v3-merge-v2-provider-inventory-20260803.json`;
- `platform-reliability-r1a-recovery-v3-merge-v2-corrective-disposition-20260803.md`;
- `platform-reliability-r1a-recovery-v3-merge-v2-corrective-authority-request-20260803.md`.

Read-only review. Do not edit files, use web tools, call external mutation APIs
or perform production actions. Return `GO` first only if there is no P1/P2;
otherwise `NO-GO` and every P1/P2 with exact file/line. List P3 separately.
Stay under 900 words.

Verify independently:

1. The source merge identity, exact parents/tree, CI and negative-action ledger
   are internally consistent with the receipts and current git history.
2. NC-1 is correctly classified: the settled pre-merge production authority
   really pins `master + ./Dockerfile.bake`, the newer runbook's
   `./Dockerfile` is the contradictory text, and Auto Sync/Deploy-off makes
   the source merge provider-isolated.
3. Accepting NC-1 does not silently approve a future source-path state,
   publication, deploy or cutover.
4. NC-2 does not understate a credential exposure. Check the recorded sequence
   and confirm whether sanitized count/method/tag/length observations while the
   reveal stayed open can be terminally classified as a process
   nonconformity when no credential bytes/derivative were emitted and the key
   was revoked + proved 401 before merge.
5. The future reveal hardening actually prevents recurrence: DIV
   `textContent` grounded before submit, one non-emitting final call, no
   post-submit diagnostics, fail to immediate revoke.
6. NC-3 accurately distinguishes local bootstrap failures before HTTP from
   provider actions and specifies an adequate future preflight.
7. The proposed operator form accepts only the three dispositions and the
   already completed source merge as source authority. It grants no workflow
   dispatch, image publication, Render key/provider action, GitHub environment
   mutation, deploy, migration, rehearsal, cutover or Stage 1 runtime action.
8. No rollback or new key rotation is required by the evidence; if either is
   required, explain exactly why.

A GO is review evidence only. It does not accept the disposition on the
operator's behalf and grants no operational authority.
