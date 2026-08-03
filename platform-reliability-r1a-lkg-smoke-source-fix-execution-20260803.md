# R1-A LKG smoke source fix — execution receipt

Recorded: 2026-08-03 UTC.

Status: **DRAFT PR GREEN; AWAITING INDEPENDENT REVIEW**.

Operator authority: exact packet
`6093e50cbfb317042e7a0e3c8e49da1a7f689a3b`.

## Result

A single source commit
`223ab97cf6e24e0542337d2a39e1bce9529f5d00` was created from exact
backend base `f2a840517956c4f480fc9d8aaf6f832ebde489d9`, pushed once, and
opened as draft [PR #53](https://github.com/Glera/swipe-backend/pull/53) with
`DO NOT MERGE` in its title.

The diff is exactly two files and five insertions:

- one `-e PYTHONPATH=/app` argument in the LKG-forward smoke container;
- exact-count and placement assertions in the bounded `lkg_smoke` test block.

Diff SHA-256:
`9a5f619e927b1913775b153fff5bdc7ccadbd86dc80b659115f2c1d746923258`.

## Fail-closed evidence

Action-time preflight confirmed exact master, failure run
`30845173288/1`, zero artifacts, exact source blobs, absent fix branch,
absent GitHub production environment and repository release authority, and no
GHCR tag for the failed source.

The detached red proof changed only the two new test assertions. Its sole
failure was:

`assert lkg_smoke.count("-e PYTHONPATH=/app") == 1` (actual `0`);

20 other tests passed. The disposable mutation was removed before branch
creation.

After the workflow line was added:

- required local pytest set: 86 passed;
- Mission architecture guard: PASS, policy
  `3469120fba269c3be44eb4de4d829d83249cf01bcc426319b660f7256c0a3cc5`;
- diff-check: clean.

## Automatic CI

Only pull-request-triggered CI ran:

- Platform release image
  [30849622831/1](https://github.com/Glera/swipe-backend/actions/runs/30849622831):
  success, zero artifacts;
- PostgreSQL acceptance
  [30849622812/1](https://github.com/Glera/swipe-backend/actions/runs/30849622812):
  success, including every roundtrip job, zero artifacts.

Post-CI registry inspection confirmed no tag for either the PR head or the
failed source. The PR remains open and draft; master is unchanged.

## Boundary

No second push, manual dispatch/rerun, merge, image mutation, GitHub
environment mutation, Render access, deploy, production migration, rehearsal,
cutover, Stage 1 runtime action or generative-feed expansion occurred.

Source merge and candidate-v4 publication remain separate later operator
authorities.
