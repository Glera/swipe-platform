Independent read-only acceptance review of an R1-A recovery and bounded image
publication authority. Reply first line exactly `GO` if no P1/P2 remains;
otherwise list only precise P1/P2 blockers. No tools, no web, no mutations.

Operator authority `099f3de` was correctly refused before external authority
because backend master moved. The proposed recovery replays the already
reviewed R1-A candidate onto exact new master, preserves PR #49's Auto Deploy
Off pins, runs local/CI/review gates, and asks for a future operator GO allowing
exactly one new candidate publication while reusing the accepted baseline.

Review the appended committed files from exact meta commit
`775ae7aad26e6a05fb5e27a359471be01884ffd2` for:

1. whether the old pre-cutover authority is unmistakably consumed and
   non-executable;
2. whether successor-v2 evidence is sufficient and free of product/Stage 1
   drift;
3. whether reusing the exact accepted baseline and publishing only one new
   candidate is sound;
4. whether the proposed one-run authority is fail-closed against retries,
   identity drift, merge, GitHub production-environment changes, Render,
   deploy, migration and Stage 1 mutation;
5. any internal contradiction that could allow an action beyond the stated
   operator decision.

The future GO is not present. This review must not grant publication itself;
it only decides whether the committed request is safe to present to the
operator.
