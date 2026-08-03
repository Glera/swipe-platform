# Independent review — R1-A recovery after concurrent master advance

Scope: proposal commit `291e099b0ccf1b9b445053e09f7658c0882d13e6`,
backend authority `47a0a0a6b4841212c44382c73dbeb0b26037e850` and
disposable replay `7351cba15101594348f740e99e6d663b718112f2` (scratch,
non-authoritative). Read-only review; no edits made.

## Verdict: GO

No P1/P2 survives. The proposal is what it claims to be: a read-only,
correctly-scoped recovery design that authorizes nothing beyond itself and
correctly asks the operator to choose between A/B.

## Findings

1. **Graph and semantics.** Backend `47a0a0a...` has the real chain
   `0070 -> 0071_mission_slice_core -> 0072_mission_ops_receipts`. The
   scratch rename changes only the R1-A migration's identity, predecessor and
   matching test identities; its `upgrade()`/`downgrade()` bodies are
   unchanged. The proposed `0073` is the minimal non-branching result.
2. **Stage 1 additivity.** The Stage 1 upgrades only create new tables,
   indexes, sequences, functions and triggers. Their only relationship to an
   old table is the new referencing FK from
   `mission_contributions.user_id` to `users.id`; they do not alter `users`.
   The guarded downgrades are correctly not the forward-only image rollback
   path.
3. **Replay/test identity.** One scratch-only hard-coded literal remained:
   `tests/test_platform_release_migration_postgres.py` still set
   `PRIOR = "0070_published_test_delivery"`. At the recovered graph that would
   test a cascade through both Mission downgrades instead of the intended
   one-step `0073 -> 0072` roundtrip. The PostgreSQL-gated file was one of the
   three locally skipped tests, so the local 86-pass result did not exercise
   it. This is P3 because it is contained to unpushed scratch and must be
   corrected before real CI.
4. **Forward compatibility.** Pulling the exact accepted baseline image and
   making its own `app.main`/`app.db` issue zero-row selects for every table in
   its own `Base.metadata` against candidate-head PG16 is materially stronger
   than the current simulated LKG test and is sufficient for the required old
   image/read-shape proof.
5. **Authority conflict.** The proposal correctly states that current-master
   ancestry makes `0071/0072` unavoidable before R1-A. Option B (pause, without
   revert or divergent deployment) is the only literal preservation of the
   old no-Stage-1-production boundary.
6. **Authority separation.** PR #51/candidate v2 remain historical only;
   recovery PR, candidate-v3 publication, new pre-cutover preparation and
   cutover stay separately authorized.

## P3

- Name every hard-coded predecessor/downgrade revision literal explicitly in
  recovery step 2, including `PRIOR` in the migration PostgreSQL test.
- Document the implicit `RESTRICT` behavior of
  `mission_contributions.user_id -> users.id` for the future Mission rollout.

This GO accepts only the recovery proposal and its request for an explicit
operator A/B choice. It authorizes no backend edit, branch, PR, image
publication, GitHub environment, workflow dispatch, Render mutation,
migration, deploy or Stage 1 runtime rollout.

Review session: `94ec5872-7491-4003-a726-ab75d5574282`, Claude Sonnet 5,
safe mode, plan permissions, no web requests. CLI internal subscription meter:
`0.9623399`; this is not asserted as a separate invoice.
