# R1-A candidate-v3 — initial read-only preflight observation

Observed: 2026-08-03T18:50:15Z.

Status: **READ-ONLY CORROBORATION; NOT ACTION-TIME AUTHORITY**.

GitHub API reads showed backend `master` at exact accepted source
`f2a840517956c4f480fc9d8aaf6f832ebde489d9`, with the accepted merge
parents/tree and successful push CI attempts. There was no Platform release
image run for that exact source.

The exact workflow blob is `a2befbfd7888ba69643a036159253c3ef2dceb66`
(16,224 bytes) and hashes to
`95d81d36dabbd6e901023ca40a62c041d2e60e991d889b54c130949a1640eb1d`.
The frozen `release.json` blob and its feed/deploy-tooling bindings were read
at exact swipe-platform source `28193c34...`.

The accepted baseline run remains successful and artifact `8846489671`
remains unexpired. The signed-in private GHCR package versions UI showed eight
tagged versions and no tag for exact source `f2a840...`. No GitHub
`production` environment or repository-level Render/release authority was
present.

The machine companion records the exact identities. These observations are
not a dispatch preflight receipt: every mutable fact must be reread after a
separate operator GO and immediately before the single dispatch.
