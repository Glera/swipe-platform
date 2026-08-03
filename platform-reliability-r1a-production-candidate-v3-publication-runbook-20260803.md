# R1-A candidate-v3 publication — bounded execution runbook

Prepared: 2026-08-03 UTC.

Status: **DRAFT; NOT EXECUTABLE WITHOUT AN INDEPENDENTLY REVIEWED PACKET AND
AN EXACT OPERATOR GO**.

Authority companion:
`platform-reliability-r1a-production-candidate-v3-publication-authority-request-20260803.{json,md}`.

## 1. Preconditions

Record a fresh machine-readable preflight before any mutation. Perform all
checks from the JSON request and fail closed. At minimum:

- resolve the operator-named meta commit and compare it to the reviewed packet;
- read backend `master`, merge parents/tree, PR #52 and exact source CI;
- read baseline run/artifact and verify the downloaded manifest's exact bytes,
  digest and image binding;
- hash the workflow bytes at exact source;
- resolve the three frozen cross-repository commits and verify `release.json`;
- list exact-source workflow runs and tagged GHCR versions;
- list GitHub environments and repository-level `RENDER_` /
  `PLATFORM_RELEASE_` names;
- verify the linear candidate migration graph and exact target/predecessor.

The preflight is read-only. It creates no Render key, GitHub environment,
branch or tag.

## 2. Final compare-and-dispatch

Construct the workflow input argument array only from the reviewed JSON
companion. Do not interpolate mutable current repository heads.

Immediately before the one dispatch, reread
`repos/Glera/swipe-backend/git/ref/heads/master` and require exact
`f2a840517956c4f480fc9d8aaf6f832ebde489d9`. Then execute one GitHub workflow
dispatch on `master` with `publish=true` and every exact committed input.

There is no second attempt. If the API response is ambiguous, treat the
dispatch authority as consumed, list runs read-only and stop for a new
decision.

## 3. Observe and verify

Observe only the run created by the dispatch to terminal state. Require:

- event `workflow_dispatch`, attempt `1`, exact head SHA and success;
- exactly one matching run for the source;
- exact candidate manifest source identities, code compatibility and LKG
  binding;
- OCI index and linux/amd64 digests, provenance and SBOM attestations;
- one unexpired sidecar artifact with verified exact-byte SHA-256;
- one private GHCR package version linked to `Glera/swipe-backend` and tagged
  by the exact backend SHA.

Record the run URL, API identities and every digest. Do not expose package or
repository credentials; the workflow uses its scoped `GITHUB_TOKEN`.

## 4. Stop conditions

Stop before dispatch on any preflight mismatch. Stop after the one dispatch on
failure, cancellation, timeout, partial publication or ambiguity. Preserve
evidence; do not delete a partial package identity and do not redispatch.

At every point the following remain forbidden: baseline rebuild, source or
ref write, merge, cutover workflow, GitHub production-environment mutation,
Render access/mutation, deploy, migration, rehearsal, cutover and Stage 1
runtime action.

## 5. Receipt and next gate

Commit the exact preflight and publication receipts without secrets, run the
repository checks and obtain an independent read-only review. A successful
publication is not rehearsal or cutover authority. Only after independent GO
may a separate rehearsal request be prepared for operator review.
