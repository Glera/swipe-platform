# Platform Reliability R1-A — candidate-v2 publication receipt

Published: 2026-08-03 UTC.

Status: **PASS, INDEPENDENTLY ACCEPTED**.

Independent safe-mode review of exact evidence commit `4d8f18b` returned GO
with no P1/P2. Its complete text and the later budget-exhausted CLI envelope
are both preserved in
`platform-reliability-r1a-production-candidate-v2-publication-review-20260803.*`.

Operator authority named exact meta packet
`5e88f4efc94e73e264e430b83b7a2bf45cfd55ce` and allowed exactly one
candidate publication. Action-time preflight passed at
`2026-08-03T13:47:36Z`; the sole dispatch was accepted at
`2026-08-03T13:48:27Z`. The authority is exhausted and no redispatch is
permitted.

## Workflow and immutable identity

| Field | Exact value |
| --- | --- |
| workflow run | [`30819666007/1`](https://github.com/Glera/swipe-backend/actions/runs/30819666007), success |
| job | `91706119919`, success, 3m11s |
| backend source | `4714e339b60e3af747d138486ad7eadadec72dac` |
| OCI index | `sha256:d6aae406275945b30475aa6c797f73d52af6108a715f5c5a4bcfe109fddcd05b` |
| release manifest | `a0e128be8ed3fa2484c74108cf324c8a6449be23daa7da5c25943b22b4c4e9e5` |
| schema capability | `e31eaf82a8386d20954002577e9b7ec63fe11f4626a2c2f1aab46df2e3fc72b0` |
| GHCR version | `1093812331`, Private/Latest, linked to `Glera/swipe-backend` |
| linux/amd64 | `sha256:d01d0531d44a76e9c81cc3d1420f4e5c5b04478056a7c352e5ff9e6dd87e8467` |
| attestation | `sha256:4781164a3f127fd0d86b8b878637f35c82c8e720893909b021c49c8efa06aa21` |

All workflow gates passed: exact manual inputs, baseline-sidecar download and
provenance, Mission architecture guard, ephemeral PG16 capability, immutable
OCI publication, LKG execution against Render-style PostgreSQL URLs, source
fallback, compact runtime inventory, Stage 0 protective smoke, canonical
manifest and artifact upload.

The downloaded manifest was then verified independently from the job using
the committed release code and exact local migration/release bytes. It binds:

- backend `4714e339...`, feed `1d05bb...`, playables `45d5dc...` and the exact
  public release archive;
- code compatibility `0070..0071`, target `0071` and predecessor `0070`;
- existing baseline run `30789375002`, OCI
  `sha256:39f354...5eedb`, manifest `b2ddb48a...bbc88`;
- LKG compatibility `0069..0070` and forward compatibility `0069..0071`;
- PostgreSQL 16 and typed absence of the retired UGC runtime.

## Artifact

Artifact `8858370713`,
`platform-release-4714e339b60e3af747d138486ad7eadadec72dac`, is unexpired
until `2026-11-01T13:48:34Z`. Its deterministic four-file content-set digest is
`8837d2c4ffac258004e4bcff221df14070822f0bdba53c36d6815d4de875b57e`;
individual hashes are recorded in the JSON companion.

## Boundary

Post-checks prove exactly one candidate publishing dispatch and zero cutover
dispatches. PR #51 remains draft/unmerged, backend `master` is unchanged, the
GitHub `production` environment and repository-level Render authority remain
absent, no Render key was created, and no Render mutation, deploy, migration or
Stage 1 mutation occurred.

The actual job occupied 191 seconds, billed as at most four rounded Linux
minutes: USD 0.024 if no included allowance remains. Render spend was zero.

This receipt does not authorize merge, pre-cutover preparation or deploy.
