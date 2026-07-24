# Author dispositions — Cohort Observability independent review

Independent review: meta commit `455f1ea`,
`cohort-observability-independent-review-2026-07-23.md`.

Originally reviewed backend head:
`e583bd6501599ce7e8c5033c137c7e62deacc995`.

Focused-fix backend head:
`7231f08521c913200bc6752730f435d97676977d`.

Focused rereview range:
`e583bd6501599ce7e8c5033c137c7e62deacc995..7231f08521c913200bc6752730f435d97676977d`.

## F001 — P3 subject id can poison the render allowlist

Disposition: **fixed**.

`CohortObservabilityConfigV1` now rejects any `cohortSubjectId` containing the
shared privacy/C2 render denylist before registration. The list is shared with
delivery, which retains its fail-closed whole-message scan as defense in depth.
It covers `telegramUserId`, `username`, `organicReturn`, `retention`,
`verdict`, `recommendation`, and `runway`.

Pure regression tests cover every token, including the review reproductions
`runway-a` and `verdict-x`.

## F002 — P3 legal cohort can deterministically exceed Telegram 4096

Disposition: **fixed**.

Config validation now computes a conservative upper bound from the exact
single-message format. Every rendered counter is represented at maximum
non-negative PostgreSQL `BIGINT` width, data quality uses the longest closed
value, and fixed ids/digests use their exact rendered widths. Registration
rejects the config when this upper bound exceeds 4096 characters.

Delivery keeps its exact 4096-character check for corrupted or otherwise
untrusted stored documents. Regression tests reject 50 maximum-length subject
ids and accept a cohort whose conservative bound fits.

## Verification

- focused pure cohort: `21 passed`;
- full local unit: `831 passed, 259 skipped, 10 subtests passed`;
- local cohort PostgreSQL: `9 passed`;
- GitHub backend run
  [30015784709](https://github.com/Glera/swipe-backend/actions/runs/30015784709):
  full PostgreSQL acceptance, all migration roundtrips, and reverse drift pass;
- `git diff --check`: clean.

No merge, deploy, feature flag, production cron, registration, Telegram send,
invite, A1.1, or B1 action was performed. The fixed backend head requires only
a focused author-not-reviewer rereview of the range above before the merge
decision.

