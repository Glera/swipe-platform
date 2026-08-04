# Independent R2 review — R1-A LKG-smoke source-merge retry-v2

Review the exact authority hardening delta:

- parent packet commit: `d0782c8e72271acb580fbbde2f89f0a5b0125a67`
- R1 hardening commit: `26f3f2352b3b6e4ca003bf5e50ab0b967285d786`
- repository: current meta-repository worktree

This is a documentation/authority review only. It grants no operator authority.
Do not use the network, browser, GitHub CLI, credential stores or provider APIs.
Do not edit files or mutate git state.

Read the R1 raw review and disposition, then inspect the exact delta and the three
retry-v2 authority/runbook files. Confirm that all three P2 findings and all seven
P3 advisories are correctly resolved:

1. the full literal credential value-surface ban is restored, including a hard
   stop on value or derivative exposure;
2. pre-grounded locators, eventual post-submit create contracts and eventual
   revoke contracts are correctly separated;
3. all post-submit locator/count/click/wait failures are locally suppressed and
   can emit only a fixed integer status, never provider text, markup or stacks;
4. accepted source-fix/review and settled-baseline pins are restored;
5. selector provenance, NC-2 reconciliation and exact non-secret key-name rule
   are honest and complete;
6. repository authority absence, shared-home/mode/size hard stops, exact capture
   CLI, restore-draft failure handling and the complete prose deny-list are
   restored;
7. no wording authorizes source mutation, merge beyond the exact PR/head/CAS,
   dispatch/rerun, image action, GitHub-environment mutation, persistent Render
   mutation, deploy, migration, rehearsal, cutover or Stage 1 runtime action.

Also check JSON validity, commit ancestry/pins and internal consistency. Findings
must cite exact file and line. Classify blockers as P1/P2 and optional polish as
P3. Start the answer with exactly one of:

- `GO` if there are no P1/P2 findings; or
- `NO-GO` if any P1/P2 finding remains.

Do not treat this review as permission to execute the operational retry.
