# Independent review request — R1-A LKG smoke source-merge retry-v2

Review exact substantive meta commit
`d0782c8e72271acb580fbbde2f89f0a5b0125a67` in this repository.

Use Read and bounded local read-only git/hash commands only. Do not edit,
fetch, call `gh`, use web/MCP/browser/credentials, inspect external state or
perform any mutation.

Review:

- `platform-reliability-r1a-lkg-smoke-source-merge-retry-v2-authority-request-20260804.json`
- `platform-reliability-r1a-lkg-smoke-source-merge-retry-v2-authority-request-20260804.md`
- `platform-reliability-r1a-lkg-smoke-source-merge-retry-v2-runbook-20260804.md`

Cross-check against the accepted contained failure and review at exact commits
`69430e3444497249ca4d623ea403431b511bda47` and
`29d184e458509e37d7caec72b07d5b3d9a9f4e9c`, plus the prior reviewed packet
at `c7aa22eef03e5290aa73919bd02671c42ec2c212` and recovery-v3 NC-2 hardening.

Return `GO` only if there are no P1/P2 findings and the new packet is safe and
unambiguous. Focus especially on:

1. whether the distinction between a masked representation existing in
   unobserved provider DOM and entering tool/process output is precise and does
   not weaken the prior literal hard stop;
2. whether using an exact non-secret key name through a pre-committed
   `hasText`-style locator can remain non-observational when no row/dialog text
   is returned;
3. whether live revoke locators are honestly validated only after creation
   inside one non-emitting block, without claiming they can be grounded before
   submit;
4. whether the structural-mismatch fallback actually guarantees containment:
   no DOM observation, only attended manual operator revocation, exact 401,
   cleanup, terminal STOP and no merge;
5. whether every source/CI/provider/merge pin and deny-list remains identical
   to the accepted source-fix boundary;
6. whether any wording could authorize browser diagnostics, a replacement key,
   merge retry, publication, provider mutation, deploy, rehearsal, cutover or
   Stage 1 runtime action.

Format: `GO` with concise reasoning and P3 advisories, or `NO-GO` with exact
P1/P2 findings and file/line references. This review grants no operator
authority and permits no operational action.
