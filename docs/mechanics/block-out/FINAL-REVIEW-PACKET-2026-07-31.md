# Block Out v1 — final matched review packet

- Process: `reference-replication.v3`
- Primary: Falcon/CYLINDER Android `1.0.177+177`
- Playables commit: `9d7f203` (`codex/block-out-v1-prototype`)
- Automated parity: **6/6 machine-pass**; browser receipt SHA-256
  `939f10094859659de410f02bf3da6628e849a0b3f7606814b25446ea281be426`
- Review decisions: **4 total** — two unique comparisons and two hidden repeats
- Operator budget: **≤10 minutes**

## Session 1 — Reference→Twin

The page shows blurred edge/silhouette channels and asks which channel is the
reference. It contains one unique gate-consume comparison and one hidden
repeat. Event offsets are `1,278 ms` for native reference and `1,400 ms` for
Twin.

| Artifact | SHA-256 |
| --- | --- |
| `reference-normalized.mp4` | `58e13863c1e108a407d57b456de4d45904e6ce3438ecf68d96e33582e1932174` |
| `twin-normalized.mp4` | `db439471a27845089d11214bddbb6dcc109a81a11495295d90c829d7d2c463c5` |
| `reference-twin.review.json` | `c2cb531cb944422f43bd01ce851fa46fe050d2853370fbf9d3cd08d01b3822f8` |
| `reference-twin.html` | `9747512fb6001342b472e5a0f706a20f9eb6ac5ee0b2f293cc2a5a24f495c25f` |

## Session 2 — Twin→Production Original

The page shows full own-identity clips and asks which feels closer/more
pleasant, or `no meaningful difference`. It contains one unique matched
top-gate consume and one hidden repeat. Event offsets are `1,400 ms` for Twin
and `400 ms` for Original.

| Artifact | SHA-256 |
| --- | --- |
| `twin-matched.mp4` | `9c9cf48240bfb4897b6ff42a2ae60537cfb64b13e9abe3f89434b8e8cb186606` |
| `original-matched.mp4` | `01b3856d665f7f3ce7c7d961b038d69d635b07c87cd3b30556181e43d8b10c9c` |
| `twin-original.review.json` | `125709e840919151c4b4c13b854239fbeb46ae88a3dde03544e99e1e1dc93a42` |
| `twin-original.html` | `f3f042ba257564061d9512316d45efcea22298a9fa467097768b6c06431172a7` |

## Disposition rule

- Reference→Twin: a repeat-consistent identification miss supports causal
  parity; consistent identification returns the named visual/motion delta.
- Twin→Original: `no meaningful difference` on a repeat-consistent pair closes
  feel preservation. A stable Twin or Original preference returns one bounded
  correction round.
- Contradictory repeats do not fail the mechanic; they trigger one replay of
  the same four-decision session.

Export both immutable choice receipts. No source label is shown before export.
Rollout/publication remains outside this review.
