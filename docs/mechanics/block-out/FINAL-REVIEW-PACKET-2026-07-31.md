# Block Out v1 — final matched review packet

- Process: `reference-replication.v3`
- Primary: Falcon/CYLINDER Android `1.0.177+177`
- Playables commit: `63eca7617b662e0d5d82011afd6939f042b72083`
  (`codex/block-out-v1-prototype`)
- Automated parity: **6/6 machine-pass**; browser receipt SHA-256
  `db17c3f583a3b7da637f142cccb723e50942f5bd8208aff712061351ea3b70da`
- Review decisions: **6 complete** — every unique comparison has one hidden
  repeat
- Operator budget: **≤10 minutes**

## Round-1 session 1 — Reference→Twin (superseded surface)

The page showed blurred edge/silhouette channels and asked which channel was
the reference. It retained enough static board/layout identity to make the
comparison non-causal. Its receipt triggered the bounded correction but is not
accepted as motion-parity proof.

| Artifact | SHA-256 |
| --- | --- |
| `reference-normalized.mp4` | `58e13863c1e108a407d57b456de4d45904e6ce3438ecf68d96e33582e1932174` |
| `twin-normalized.mp4` | `db439471a27845089d11214bddbb6dcc109a81a11495295d90c829d7d2c463c5` |
| `reference-twin.review.json` | `c2cb531cb944422f43bd01ce851fa46fe050d2853370fbf9d3cd08d01b3822f8` |
| `reference-twin.html` | `9747512fb6001342b472e5a0f706a20f9eb6ac5ee0b2f293cc2a5a24f495c25f` |

## Round-1 session 2 — Twin→Production Original (complete)

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

## Round-1 result

- Reference→Twin: Reference selected `2/2`; correction required. Receipt
  SHA-256: `d917a4c053fc2f652b1ad0df6c5cdaab28cd0c6022236eaffa9407b65e2360b8`.
- Twin→Original: `same / same`; feel preservation passes. Receipt SHA-256:
  `3fdba2874561cbbc57746f4a665a79c921564754b1fe3167820cbeef001d0c4e`.

The Reference→Twin surface retained static board identity, so correction 1
also replaces it with the guarded motion-energy channel. Only that two-choice
repeat remains; Twin→Original is not repeated because the correction is shared
by Twin and Original.

## Correction-1 session — Reference→Twin (complete)

This page contains one gate-consume comparison and one hidden repeat. Both
channels are gate-centred adjacent-frame motion energy with static identity
suppressed, spatially aligned and matched to `500×500`, `1.966667 s` clips.

| Artifact | SHA-256 |
| --- | --- |
| `reference-motion-energy-v2.mp4` | `52395d6e3196d26612d0ddef804c78f157524bfce5307ff99a362c19214bc402` |
| `twin-motion-energy-v2.mp4` | `501a0c751cb8a0857dc1e6a4542e3725eb31f7b74652f4fc03be7df308788a41` |
| `reference-twin-correction-1.review.json` | `2ffded3747621d0855bb0b6befd7c9cc9fdaebe14bf6e0c530f6ad9692012d4f` |
| `reference-twin-correction-1.html` | `6e336f945a59feff826e34e86242c8ab6dd0ae51159dc80314d78083292b7cc0` |

Receipt SHA-256:
`86adeae753763693d68e4bc1efdb583a6e49ea3bc1d3b9fd16718d9288b3aacc`.
The operator selected Reference `2/2` despite the hidden A/B reversal. The
repeat is consistent and the machine disposition is `correction-required`.
Subsequent diagnosis found that the surface still included non-causal capture
and normalization differences, so its result triggers correction but is not
the final causal-parity verdict.

## Evidence-correction-2 session — Reference→Twin (pending operator receipt)

The final page contains the exact post-takeover window only. Both channels are
background-subtracted RGB-max occupancy at 16×16 analysis resolution, aligned
by measured gate center and width, expanded to 500×500 at 20 fps, and given an
identical 300 ms black pre-roll. It contains one comparison plus one hidden
repeat. Static art, pre-takeover gesture path and unmatched cell scale cannot
answer the question.

| Artifact | SHA-256 |
| --- | --- |
| `reference-causal-occupancy-v3.mp4` | `7d917735accc184c112999e9f2a91a90e05d71f16f68965368c5a53989dd9fe0` |
| `twin-final-causal-occupancy-v3.mp4` | `0af3132ff69b5f724772b25b00f8241962dfd025b4585970cb6618d168c00cba` |
| `block-out-falcon-reference-twin-final-causal-v3.config.json` | `fc273bb194424305d47040ae866e42206d330829875c9fb34cd9866ac37f2d91` |
| `block-out-falcon-reference-twin-final-causal-v3.html` | `27a819645470ae31d2a3548a65ed96f9cad31e88f873d7e5aff36dc7d16d5392` |

Machine comparison after pre-roll: overall Pearson correlation `0.945`,
normalized RMSE `0.106`, Twin/Reference occupancy-area ratio `0.875`;
particle-only correlation `0.801`, normalized RMSE `0.218`, area ratio `0.841`.
The operator receipt is the only remaining vertical-slice gate.

## Disposition rule

- Final causal Reference→Twin: failure to identify Reference consistently
  supports causal parity. Consistent identification triggers diagnosis; a
  measured MUST/MAJOR delta is fixed inside the goal, while a product tradeoff
  or missing authority returns to the operator.
- Twin→Original: `no meaningful difference` on a repeat-consistent pair closes
  feel preservation. A stable Twin or Original preference returns one bounded
  correction round.
- A contradictory correction repeat does not fail the mechanic; it triggers
  one replay of the same two decisions.

The correction receipt is exported and verified. Rollout/publication remains
outside this review.
