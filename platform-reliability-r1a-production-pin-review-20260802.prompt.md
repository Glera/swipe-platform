# Independent review request — R1-A production GHCR credential pin

Act as the independent, read-only reviewer for Platform Reliability R1-A.
Review the exact successor delta and production evidence. Do not mutate files,
GitHub, Render, packages, credentials, or any provider state. Do not publish an
image, merge, deploy, or request secrets.

## Exact code boundary

- repository: `/private/tmp/p4g-r1a-prod-successor.0REhzc`
- parent: `7728b89b329318bf59da67c117382e85d3a43ada`
- reviewed head: `11c9bce9891ae5b041215056ac4521551a056cb5`
- draft PR: `Glera/swipe-backend#48`
- relevant files:
  - `scripts/platform-release-coordinator.py`
  - `tests/test_platform_release_coordinator.py`

Confirm that the delta only pins the exact production registry credential,
keeps rehearsal fail-closed against that production identity, and tests both
the correct identity and wrong-target rejection. Treat any missing exact
binding or weakened production/rehearsal boundary as a blocker.

## Exact evidence boundary

Read these non-secret receipts from
`/private/tmp/p4g-r1a-prod-precutover.MzJ9iO`:

- `render-production-registry-credential-created.json`
- `registry-credentials-after-create.raw.json`
- `render-production-registry-credential-direct.json`
- `github-pat-user.headers`
- `github-pat-user.body.json`
- `github-pat-package.headers`
- `github-pat-package.body.json`
- `provider-capture-before-pin.v1.json`
- `provider-capture-before-pin.normalized.json`
- `provider-capture-after-credential.v1.json`
- `provider-capture-after-credential.normalized.json`
- `render-retry-api-key-revocation.json`
- `render-retry-api-key-after-revoke.body`

Confirm:

1. the registry credential identity in all Render receipts is exactly
   `rgc-d9np7tajnfac73bi5ib0` and the code pins that same literal;
2. GitHub reports identity `Glera`, exact OAuth scope `read:packages`, and
   readable private package `swipe-backend`; no broader OAuth scope is present;
3. the post-create provider capture passes and its normalized provider state is
   byte-equivalent to the pre-pin normalized state, including unchanged current
   deploy IDs;
4. the temporary Render API key was revoked and its post-revocation request was
   rejected;
5. no evidence indicates a merge, image publication, provider source change,
   deploy, migration, or Stage 1 action.

The GitHub PAT and Render API key values are not present in the reviewed files;
do not search for or print secrets. The temporary local secret files have been
deleted. The durable PAT remains intentionally encapsulated in the Render
registry credential and must not be revoked by this review.

## Known verification

- targeted coordinator/provider-capture tests: 50 passed;
- broader platform-release test set: 71 passed;
- the authoritative CI result may still be in progress while you review; do
  not convert an in-progress check into a code finding. Report CI separately.

## Required response

Start with exactly `GO` if there are no P1/P2 blockers. Otherwise start with
the highest-priority finding. Findings must cite exact `file:line` locations
or an exact receipt filename and conflicting fields. Briefly state:

- reviewed parent/head;
- whether the exact pin and authority boundaries are sound;
- whether the credential/evidence identity is internally consistent;
- whether any P1/P2 remains;
- CI status as independently observed, without treating pending CI as a code
  defect.
