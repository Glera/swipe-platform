# Platform Reliability R1-A — Buildx publication recovery receipt

Date: 2026-08-01 (Asia/Nicosia).

Scope: disposable rehearsal image publication only. This receipt authorizes no
production cutover, Stage 1 merge/rollout or provider mutation outside the
already approved disposable workspace.

## Failed immutable attempt

- workflow run: `30707737253`;
- source ref: `codex/r1a-rehearsal-baseline-v2-20260801`;
- source SHA: `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`;
- typed failure site: `Build and publish immutable candidate`;
- exact error: `Attestation is not supported for the docker driver`;
- failed-run JSON SHA-256:
  `7d1d1c5e7166c6069d32498f742492c6cc11ea3282d1e5fc88f60eff65995061`;
- failed log SHA-256:
  `6a529175621314d7ee3ebd08024e263a723d19647f6fc4e4c7d1802615baba40`;
- Actions-artifact inventory SHA-256:
  `244563f989470892c537c9a4622920af0d228ee4528f7d00c64a06d6cd95856c`,
  with `total_count=0`;
- authenticated GHCR lookup after failure: HTTP `404` (`swipe-backend`
  package absent).

The failed SHA is never rerun. It produced neither an immutable package
version nor a sidecar artifact.

## Deterministic recovery

The recovery adds `docker/setup-buildx-action@v3` on the publish-only path
before GHCR login and `docker buildx build`, plus a regression assertion for
presence and ordering. It changes no migration, product behavior, release
manifest semantics, permissions, concurrency or non-publishing PR build path.

New immutable refs:

- image baseline: `codex/r1a-rehearsal-baseline-v3-20260801` →
  `5cfe17896d90c639dbfcbca996fd4731dff52097`;
- image candidate: `codex/r1a-rehearsal-candidate-v5-20260801` →
  `1e285238f33283047eb8c3b3c52d352ea3b587fa`.

The already-proved Render Blueprint/web/cron source remains v2 at
`0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725`; it is not rewritten or relabeled
as the image baseline.

Verification:

- candidate focused release suite: `80 passed`;
- baseline focused suite available at that frozen source: `32 passed`;
- Mission architecture guard: PASS on both source ranges;
- workflow YAML parse: PASS;
- diff check: clean.

Independent Claude review (Sonnet, high effort, read-only, API-equivalent USD
1 computation cap)
returned **GO**, no P1/P2. It confirmed the failure/root-cause match, that the
action selects Buildx's default `docker-container` driver capable of
SBOM/provenance attestations on GitHub-hosted runners, and that the existing
publish guard, permissions, immutable naming and no-rerun policy remain
intact. The CLI reported API-equivalent usage of USD `0.8362525`; current auth
is `claude.ai` / Claude Max, so this is subscription telemetry, not a separate
charge.

Optional P3s were not required for recovery: spell out the default driver and
assert the duplicate `if` guard text. The independent GO explicitly authorizes
committing/pushing the delta and one new disposable baseline publication
attempt only.

A second independent inline drift review of the exact runbook/evidence diff
also returned **GO**, no P1/P2. It verified that every live provider source
selector remains v2, every image publication selector uses baseline v3 or
candidate v5, the GitHub environment/cutover branch is v5, the failed run is
never rerun, and the schema revision ranges did not move.

## Later runtime correction and final retained pair

The v3/v5 pair above is the immutable Buildx recovery history, but it is no
longer the retained cutover pair. Disposable runtime execution later exposed a
separate fail-closed issue: release tooling received Render's raw PostgreSQL URL
outside application `Settings`, so SQLAlchemy selected an unavailable default
driver before any database command. The reviewed correction normalizes only
the two raw schemes to the explicit psycopg driver at every release-tooling
engine-creation site; it does not log or persist the URL and does not alter
Alembic's existing application path.

Independent inline review returned **GO**, no P1/P2. Its exact result is bound
by the local review receipt whose SHA-256 is recorded in the final runtime
packet; CLI API-equivalent usage was USD 0.1155432 under Claude Max and was not
a separate charge.

The final immutable pair is:

- baseline v4: `8cb8239e04bf30f54f7fe1f85758da8f4fe7caac`, build run
  `30712414323`, OCI index
  `sha256:2230743aa443d481a1e5ee7fff1a7830403ebd94ca8a3464b497d879e722264b`,
  manifest SHA-256
  `ab33c178ca0671efc5ee5054d2971b898e217b9deca0624ed0b24e8bcc103bc3`;
- candidate v7: `9d3dc995b5f2976acbf18d3bac62ad3fc138f022`, build run
  `30712534528`, OCI index
  `sha256:837612eda640e037f6d5322dc57c5ca9706a665ea8a9a38d6c986a5b54cdd2fb`,
  manifest SHA-256
  `5cd2d48fa4d87944d6cca124f6bddc238b738f1ef2c4285f13ce2c708c1496e0`.

No earlier frozen ref moved and no failed SHA was rerun. The final evidence
packet and `platform-reliability-r1a-rehearsal-runtime-receipt-20260801.md`
are authoritative for the retained pair.
