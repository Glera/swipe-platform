## ISSUE #151 ROW 4 OFFICIAL SMASH CI + ROW 5 — HANDOFF_READY

This is the single frontier successor for durable Mac B STOP comment
`5435625248`. The stopped package is exact Playables PR #41 at base
`937e788a026015b2a8f603b439a88d993cddcf56`, reviewed head
`94fae2be73c5df79fa0d87ab8be78d51c6cd2470`, OPEN/CLEAN/MERGEABLE with
Tier-1 delta PASS and P1/P2=0. Row 5 has not started.

The STOP is accepted as a repository CI coverage defect, not a product-code
failure: no workflow on Playables master matches the touched
`smash-fest-v1/**` and `test/smash-fest-*.test.mjs` paths, so PR #41 has zero
check runs. Empty CI must not be treated as green.

Authorized Mac B continuation:

1. On the existing PR #41 branch, add exactly one minimal repository-native
   Smash technical workflow. It must trigger on pull requests and pushes to
   `master` for its own workflow file, `package.json`, `package-lock.json`,
   `smash-fest-v1/**`, `scripts/build-swipe.sh`, and
   `test/smash-fest-*.test.mjs`; use Node 24, the exact lockfile, install the
   Chromium runtime needed by the existing suite, and run the existing
   `npm run test:smash-fest-v1:technical` command. Do not weaken, skip, rename,
   baseline-allowlist, or rewrite any product/release test.
2. Treat this workflow as one bounded CI-contract slice, disjoint from the
   already signed product delta. Run one blind Tier-1 discovery on the
   workflow-only delta, one common P1/P2 correction if required, and one
   correction-only delta verification. Any unresolved/new P1/P2 after that
   single correction is a typed STOP.
3. Push one new exact PR #41 head and require its repository-native Smash
   workflow to finish SUCCESS. On PASS and unchanged reviewed product files,
   merge PR #41 once, then require the same workflow on exact master to finish
   SUCCESS. Any head drift, missing check, workflow failure, ambiguous result,
   or package failure is STOP without retry.
4. Only after row 4 is terminal on master, execute row 5 under the already
   frozen bounded contract: the distinct existing Timepress-v2 request
   `e016bb33c81fc5bdf9f704987b589579b279872467b62983abcc6543a44d6f14`
   changes the first-order reward to exactly 123 coins. Use its normal single
   authoring/review/CI/merge ladder; no scope expansion. New P1/P2 after the
   single delta review is STOP.
5. Return one causal exact-master handoff to Mac A for the ordinary one-time
   Generator adoption/restart and materialization of the preserved distinct
   rows. Preserve request and release identities; do not reset, retry,
   recreate, replay, Approve/Reject, publish, promote, or perform public
   rollout.

No backend, Feed, live DB, credential, setting, permission, infrastructure or
product/taste act is authorized. This successor authorizes the CI coverage
slice only because the operator already granted broad bounded authority to
complete #136/#151; it does not create a standing exception for empty CI.
