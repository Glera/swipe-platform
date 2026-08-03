# Platform Reliability R1-A — production immutable-pair receipt

Captured: 2026-08-03 UTC.

Verdict: **PASS — the exact production baseline/candidate pair is published,
machine-verified and independently accepted. Production cutover is not
authorized.**

The operator authorized at most two `workflow_dispatch` runs with
`publish=true`, in strict order. Exactly those two runs occurred, once per
reviewed SHA; the dispatch budget is exhausted and no redispatch is allowed.

| role | exact backend | run | OCI index | manifest SHA-256 |
| --- | --- | ---: | --- | --- |
| baseline | `cd6fb13ab222b8c6f93b2c9fed12d86820f368a3` | `30789375002/1` | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |
| candidate | `11c9bce9891ae5b041215056ac4521551a056cb5` | `30789817457/1` | `sha256:1969bd9afeb948d9ab40432dd11e629d22ef37cc863204b97d6f45ef5ff6b8df` | `1e708f6418ddc88689ab0aae5cd67b7ce65ceb962cc50eaea81d7973b991613b` |

The machine-readable companion
`platform-reliability-r1a-production-image-publication-receipt-20260803.json`
contains the complete action, artifact, file, package, schema and review
identities.

## Baseline

- Run `30789375002`, attempt 1, completed successfully; its sole job was
  `91609534606`.
- Artifact `8846489671` is unexpired through 2026-11-01. The upload log binds
  archive SHA-256
  `7d90775c8b303b9796dde35656ad1a467e6f0454adb2208994274f3afd828f74`.
- The downloaded canonical sidecar passed the exact branch verifier. It binds
  the reviewed backend/feed/playables identities, PostgreSQL 16, migration
  range 0069–0070 and `lastKnownGood={kind: bootstrap-root}`.
- Authenticated GHCR inspection showed a Private, repository-linked package:
  version `1092313648`, Linux/amd64 digest
  `sha256:9002e9b2b5cb94eb50c68c170f9919ee4da9d51bc92cc3c54d0f402bec8edfe4`
  and attestation digest
  `sha256:0abde2cbb1f29ff6c9797b5f93b97cbaab5fecc210eebe9395febb454d6c323a`.
- Independent review session `d0a332e9-e5d4-41e3-bb54-9664e2153258`
  returned GO before the candidate dispatch.

## Candidate

- Run `30789817457`, attempt 1, completed successfully; its sole job was
  `91610795922`.
- Artifact `8846642394` is unexpired through 2026-11-01. The upload log binds
  archive SHA-256
  `2851f4b25de3186a1f805abf8f399cfa4634e9bc3290436d02372646d2687d46`.
- Every release gate passed, including exact LKG sidecar/provenance, execution
  of Render-style PostgreSQL URLs in the baseline image, source-build SHA
  fallback, compact inventory, Stage 0 protective smoke and the exact
  post-publication manifest.
- The downloaded sidecar passed the candidate branch verifier. It binds
  candidate code compatibility 0070–0071, baseline compatibility 0069–0070
  and forward rollback compatibility 0069–0071. Its LKG fields equal the
  accepted production baseline run, image and manifest — not a rehearsal.
- Authenticated GHCR inspection showed Private/Latest version `1092330826`,
  Linux/amd64 digest
  `sha256:6c2443de972f681bfce5c5023037acb7206a26d8e8533c90de50ae19c15f7607`
  and attestation digest
  `sha256:b3464cfaca24587f7a05ad68c85a4fbfff27a60c2efe626088117870a0d3d193`.
- Independent review session `79deb8fd-3875-4c7b-82a7-e33fae09bc90`
  returned GO with no P1/P2.

## Preserved boundary

Backend `master` remains
`a12ca7ecea0f47e8862b4ba91879dff63cb46bfc`; successor PR #48 remains open,
draft and unmerged at the reviewed candidate SHA; the GitHub `production`
environment remains absent. No Render mutation, provider source change,
deployment, migration or Stage 1 mutation occurred.

The cutover packet now binds this pair but remains incomplete until a separately
authorized window adds the fresh provider/database capture and protected
environment receipt. A later operator GO must name that final packet. This
receipt grants no merge or deploy authority.
