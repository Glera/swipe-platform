# Capture record — Zen Match Levels 6–10

- Captured: **30.07.2026**
- App/build: **Zen Match `220000.1.755`**
- Device session: `2bb6ac89-3da1-4641-b753-52c9f982f0d3`
- Manifest SHA-256:
  `70960297ef9308d3fbe537d708f63b442a92c0f4a4de357918a3ee10172febfa`
- Scope: Levels `6–10`

## Acquisition receipt

| Item | Result |
| --- | --- |
| Screenshots | `235` |
| Video fragments | `17` |
| JSONL actions | `704` |
| Hash chain | verified during acquisition |
| File manifests | verified during acquisition |
| Free Undo | one use |
| Game coins | `300` spent on Play On |
| Real money | none |
| Ads opened | none |
| Device end state | Level 10 result screen |

## Confirmed mechanics

- Fail on a non-resolving seventh tray tile.
- A seventh placement is safe if it resolves a triple below capacity.
- Continue/Play On restores the captured fail path for `300` virtual coins.
- Undo returns the captured prior state.
- Magnet executes the captured Level 9 tutorial path.
- Levels 6/7/8/10 can finish on target completion with remaining board/tray.
- Level 9 is clear-all.

## Storage and verification boundary

The original capture was created at:

```text
.artifacts/reference-lab/zen-match/
  2bb6ac89-3da1-4641-b753-52c9f982f0d3/
```

The artifact directory is intentionally outside git. A new checkout must
materialize it separately and verify the manifest SHA-256 before generating
or approving exact Twin fixtures. This document is an acquisition receipt,
not a substitute for the immutable bytes.

The playables Z2 branch provides a read-only verifier:

```text
npm run verify:zen-capture -- --session-dir \
  <path>/2bb6ac89-3da1-4641-b753-52c9f982f0d3
```

It fails closed on manifest identity, file-set, size/content digests, symlinks
or path traversal, media counts, JSONL sequence and a recomputable action hash
chain. Its machine receipt is required before fixture extraction.

Android `screenrecord` limits caused declared fragment boundaries. Do not
derive a continuous timing interval across a boundary. Use short probes only
for an explicitly identified timing gap.
