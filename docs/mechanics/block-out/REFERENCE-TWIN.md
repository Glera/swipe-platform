# Block Out v1 — Falcon Reference Twin

- Process: `reference-replication.v3`
- Status: **machine-ready; operator comparison pending**
- Primary source: Falcon/CYLINDER Android `1.0.177+177`
- Playables implementation commit: `9d7f203`
- Native scenarios: `BO-FC-GS-01-L2-GATE`,
  `BO-FC-GS-02-L2-HOLD-GATE`

## Dataset boundary

The internal dataset `block-out-v1/twin/FALCON-L2.v1.json` reproduces the
captured Level 2 equality classes, four 2×2 footprints, gate roles and initial
layout. It injects through `src/reference-twin.ts` into the canonical Block Out
rules, engine, validator and presentation sampler. Production Original keeps
its own layouts, roles, palette and UI.

The Twin is not imported by the production entry graph. An executable deny
test scans both AppLovin and SWIPE bundles for the Twin ID, Falcon package ID,
scenario ID and capture provenance. All forbidden tokens are absent after the
final rebuild.

## Deterministic receipt

- exact Twin layout validates under the canonical runtime digest;
- matched top-gate micro-scenario replays byte-equivalent;
- exactly one logical exit is committed;
- shipping presentation profile is inside the Falcon contract bands;
- Production Original browser receipt records `manualInputBlocked=false`,
  stable host-pause digest and `0` page errors;
- pickup raster changes on the first rAF (`20,773/39,600` sampled pixels);
- browser cadence: median `16.7 ms`, p95 `16.8 ms`, `0/496` frames above
  `50 ms`.

The internal rendered Twin artifact remains outside git. Its `twin.webm`
SHA-256 is
`ee38f9d7b0f0a3b285ab6aabd84c6d5aeef0b17b9b3fc8ca462cc6497ad7a52a`.

## Review surface

The final review contains two short sessions, each with one unique comparison
and one hidden repeat:

1. Reference→Twin uses blurred edge/silhouette channels aligned to gate
   takeover. It asks identification, not visual preference.
2. Twin→Production Original uses full own-identity clips aligned to consume
   onset. It asks forced preference or `no meaningful difference`.

Source labels stay hidden until the immutable choice receipt is exported.
The exact operator packet is
[`FINAL-REVIEW-PACKET-2026-07-31.md`](FINAL-REVIEW-PACKET-2026-07-31.md).
