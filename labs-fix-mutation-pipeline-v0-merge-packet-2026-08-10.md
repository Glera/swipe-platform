# FIX MUTATION PIPELINE v0 — bounded merge packet

Date: 2026-08-10

Status: **CODE UPSTREAMS MERGED; META CLOSURE READY**

Ticket: [Glera/p4g-workspace-meta#78](https://github.com/Glera/p4g-workspace-meta/issues/78).

The operator gave one explicit authorization for exactly this sequence:

1. `swipe-ugc` PR #7;
2. `swipe-generator` PR #26 after verification against the new UGC master;
3. meta PR #79 last, carrying the factual upstream merge identities.

The authorization did not include Family A, deploy, live Lab restart, Fast
Lane, production, catalog, roster, feed, credentials or migrations. None of
those actions was performed.

## 1. UGC pre-merge packet

| field | exact value |
| --- | --- |
| base | `83357fb27782d722aeed11aba75ba369ced31d27` |
| reviewed head | `36c15aff1cb59d008833dd09e0c612504dcbb546` |
| CI | [run 31334153902](https://github.com/Glera/swipe-ugc/actions/runs/31334153902), SUCCESS |
| independent review | GO — no P1/P2, exact `83357fb…36c15aff` |
| GitHub state before merge | OPEN, MERGEABLE, CLEAN, non-draft |
| merge method | squash, matching the repository history |
| resulting master | `8cd1e8598b699766bb02ccd22f63e38ab9ffe1ee` |

Reviewed file set:

- `scripts/lint.mjs`;
- `scripts/package-mechanic-sandbox-candidate.mjs`;
- `test/mechanic-sandbox-candidate.test.mjs`.

Post-merge fetch proved parent `83357fb`, exact reviewed tree
`b52ea850ceb096991f64bf6955a4502072439cf6`, and a clean worktree.

## 2. Generator pre-merge packet

| field | exact value |
| --- | --- |
| base | `8c9b4ad0906005f848fdbbcc466136e6babbf203` |
| reviewed head | `333d69c16357fc88ea43d0748a008e88e957cfd9` |
| CI | [run 31334153674](https://github.com/Glera/swipe-generator/actions/runs/31334153674), SUCCESS |
| independent review | GO — no P1/P2, exact `8c9b4ad…333d69c` |
| GitHub state before merge | OPEN, MERGEABLE, CLEAN, non-draft |
| merge method | merge commit, matching the repository history |
| resulting master | `adea2c8aa0ad7532530bcb199f55befd8a9ad464` |

Reviewed file set:

- `package.json`;
- `scripts/register-mechanic-sandbox-candidate.mjs`;
- `scripts/run-mechanic-mutation-pipeline.mjs`;
- `test/mechanic-mutation-pipeline.test.mjs`;
- `test/mechanic-sandbox-registration.test.mjs`.

The required post-UGC check used Node `24.14.0`, current UGC master
`8cd1e859` as the normal sibling and immutable UGC `70f50d4` for
`SWIPE_EXPERIMENT_WORKER_UGC_ROOT` and `SWIPE_LEVELS_UGC_ROOT`:

- Generator `npm run verify`: 762 pass, 0 fail, 6 skipped;
- reciprocal UGC worker contract/publication/integrity suites: 29/29 pass.

An initial diagnostic under Node `26.6.0` was rejected by the existing
`content_factory_runtime_stale` Node-24 guard and was not treated as a code or
compatibility result. No source was changed; the exact check was rerun on the
required Node 24 runtime.

Post-merge fetch proved parents `8c9b4ad` and `333d69c`, exact reviewed tree
`6c94298a4b2d3bde18a23887924cd7e715a4cf49`, and a clean worktree.

## 3. Meta closure contract

Meta PR #79 is last. Its base is
`d007deea66285a4aca9653bdc17118a2fc6a0168`; its final exact head, CI and merge
SHA are recorded by the canonical GitHub PR record and the post-merge terminal
comment on ticket #78.

The independent Claude receipt is GO for the exact two implementation patches
and ticket contract. There were no post-review code edits. Meta-only changes
are the frozen request, execution/review receipts, this merge packet and the
last `STATE.md` update; they carry no runtime or product authority.

The terminal merge receipt is the post-merge ticket comment because a file
inside PR #79 cannot truthfully contain its own future GitHub merge SHA.
