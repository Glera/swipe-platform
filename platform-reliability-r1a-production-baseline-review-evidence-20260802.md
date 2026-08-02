# R1-A production baseline — bounded review evidence

This is a read-only review aid, not rollout authority.

## Git identity and replay proof

- base and merge-base:
  `a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`;
- proposed head: `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3`;
- `git range-diff` over the original rehearsal baseline-v4 range and the first
  17 rebased production-baseline commits reports 17/17 pairs with `=` and no
  unmatched patch;
- commit 18 is the already accepted Mission-policy reanchor for current
  `app/models.py` bytes;
- commit 19 changes only the baseline cutover workflow to an inert refusal and
  adds its negative unit test;
- commit 20 removes the stale isolated `0071` acceptance row/test from the
  `0070` baseline and adds negative assertions that it cannot advertise a
  nonexistent successor migration;
- commit 21 removes the remaining candidate-only PostgreSQL test file, whose
  two tests require or delete 0071, and adds a negative assertion preventing
  that file from returning on the baseline ref.

The 17 replayed subjects, in order, are:

1. build compact immutable web image;
2. serialize deploys with durable receipts;
3. enforce reviewed backend boundary;
4. smoke protective contours from image;
5. gate image source cutover by remote CAS;
6. isolate closed-delivery image smoke;
7. record cutover and break-glass contract;
8. make first immutable release provenance explicit;
9. reject bootstrap provenance inside preDeploy;
10. isolate destructive migration acceptance database;
11. bind rollback compatibility to exact LKG manifest;
12. close post-Stage-0 cutover conditions;
13. close R1-A post-Stage-0 review conditions;
14. bind Alembic to the preDeploy interpreter;
15. pin baseline at migration 0070;
16. enable Buildx attestations;
17. normalize Render database URLs.

## Schema and product boundary

- `alembic heads` returns exactly
  `0070_published_test_delivery (head)`;
- `migrations/versions/0071_platform_release_receipts.py` is absent;
- no `app/mission_*`, `mission_*` migration or Stage 1 implementation exists;
- Stage 0 files from the accepted base were preserved by a conflict-free
  rebase; the added image smoke explicitly starts with legacy island surfaces
  and runners off while protective and closed-delivery surfaces remain on.

## Workflow authority boundary

The full image workflow:

- grants only `actions: read`, `contents: read`, `packages: write`;
- uses `packages: write` only for GHCR login/build push when an explicit manual
  dispatch has `publish=true`;
- has no GitHub environment, Render secret/API call, merge or deploy step;
- builds without publication for PR events or `publish=false`;
- tags only the exact backend SHA and uploads exact-byte sidecars after
  successful publication.

The baseline cutover workflow:

- has only `contents: read`;
- contains no `environment: production`, `secrets.RENDER_API_KEY`, coordinator
  invocation or `packages: write`;
- has one job, `Refuse production-baseline execution`, which exits 2.

This refusal was added during follow-up inspection after the first bounded
review attempt exhausted its budget without a verdict. The inspection found
that the replayed historical baseline workflow predated final
production-authority hardening. The unsafe historical cutover workflow was
replaced before push.

## Verification

- Mission architecture guard: `PASS`, policy SHA-256
  `2a609c129c90e5b3f32643f8ce4c984cbe2a3a1342fb02c584c40da2c45c2250`;
- exact local workflow-declared test set: 36/36 passed;
- negative baseline-authority test proves the four forbidden workflow strings
  and both candidate-only PostgreSQL test files remain absent;
- `git diff --check`: clean.

Exact-head GitHub CI is terminal green. Nonpublishing compact-image run
`30764220924` passed. PostgreSQL run `30764220931` passed: the main suite
reported 526 passed / 40 skipped, device-flow reported 18 passed,
durable-authorization acceptance reported 1 passed, every advertised real
migration through 0070 passed, and reverse drift passed. No 0071 job is
advertised. Independent focused review of each baseline-only correction
returned GO with no P1/P2.

## Publication input observations

Remote master identities were read without mutation:

- feed: `1d05bb13acfaa08ec607f3b1fc0010902a91ece6`;
- playables/tooling: `45d5dc81a73184f6ebac1f5dcb197ec0f143f872`;
- swipe-platform: `28193c34ac461235ac42c5555ea9e870fac5fed1`.

The selected `release.json` v2 pins the same feed and tooling identities.
Attended GitHub UI inspection after final CI showed 5 tagged and 10 untagged
active package versions. Neither proposed production SHA is present as a tag.
