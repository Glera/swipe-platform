## #239 LIVE ROLLOUT — HANDOFF_READY

schema: p4g.issue239.rollout-receipt.v1
receiptType: HANDOFF_READY
ticket: Glera/p4g-workspace-meta#239
mergedPackage: https://github.com/Glera/p4g-workspace-meta/issues/239#issuecomment-5453895682
observedAt: 2026-08-28T16:53:00Z

The reviewed #239 package is now live through the ordinary immutable release path.

### Exact live identities

- Backend master: `a558608554a03132fc16fb7bbfd5653bba87ef92`.
- Feed master: `4b9dcd2f79c8b40add270d2943fcd715ce3b38be`.
- Static release archive: `cac135f309b89c16b203f8500e023bb372277fcd` (predecessor `ff2bc0831c044563d3d91da0e3f0c45b17791e5f`; diff exactly `index.html` + `release.json`).
- Static deploy tooling: `3856cb94873a6b23e3ee97d30f50695d67a9abe5`.
- Release profile: `cohort-operator`, exact user `42692410`, four catalog gates ON, island gates OFF; profile SHA-256 `44298d1a7b0d0783f9bd51c82ac939b7146d9940d12b6cf2932ac03eafc5092f`.
- Public `release.json` SHA-256: `21f635a7df2b5d6e5be6df9f516112630b997c03a5415a45d54143b57eebb3d6` (byte-exact).
- Public `index.html` SHA-256: `ccf1f7a2ba918de5cd428426de9632769709a946e585a6ba3d46c6a396340be0` (byte-exact).
- Public `versions.json` SHA-256: `20796e7171b8fd7368a3ee7d1526a2549dbcadb08442ee61f7a4172ee15866ac` (unchanged, byte-exact).

### Backend immutable release

- Image build: https://github.com/Glera/swipe-backend/actions/runs/33191553612 — SUCCESS.
- Candidate image: `sha256:aadaa1f1ba6a8170ee791553cbea00fceddeddb6ad7feb1198985a01e7b21aa4`.
- Candidate manifest SHA-256: `f8ae5500417c4b36a68ccd77a26fe9616ce61883d30048bb9dca24be72465fff`.
- Cutover: https://github.com/Glera/swipe-backend/actions/runs/33191791563 — SUCCESS.
- Deploy CAS: `dep-da893t0n74is739tktg0` -> `dep-da8roemgekts7384bb10`.
- DB verification job: `job-da8rorbtqb8s73f34i1g`.
- Coordinator receipt SHA-256: `d510407c4f4d28347faeb7fff9bc6a8f41e62b0ac1913833eb9855f5a78d6a16`.
- Schema remained at already-live `0089_research_party_intake`; no live migration ran.
- Public Backend `/api/health` and OpenAPI: HTTP 200.

### Operator-visible next step

Restart the Telegram Mini App, open an exact READY candidate and tap `Принять в тестовую ленту`. The expected terminal copy is `Кандидат принят в dev-ленту; дополнительный код не требуется`; no per-candidate user code or authorization card should appear. Public/catalog promotion remains separate and unchanged.

No Generator runtime, device flow, credential/settings/permission/infra change, public catalog promotion, retry or rollback was performed in this rollout.
