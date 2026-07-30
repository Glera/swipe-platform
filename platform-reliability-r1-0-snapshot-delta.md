# Platform Reliability R1 — snapshot delta

Database-size window: `2026-07-29T08:31:46.000Z` → `2026-07-30T08:45:12.000Z` (24.22 hours).
Render provider window: `2026-07-29T08:31:46.000Z` → `2026-07-30T08:48:38.000Z` (24.28 hours).

| Surface | Window | Delta | Normalized / day |
|---|---:|---:|---:|
| Render provider storage | 24.28h | 858,993 bytes (268,434…1,449,552) | 849,048.13 bytes |
| pg_database_size | 24.22h | 729,088 bytes | 722,350.19 bytes |
| User relations | 24.27h | 720,896 bytes | 712,787.05 bytes |
| Exact rows | 24.19h | 1,152 | 1,143.17 |
| Deadlocks | 24.24h | 0 | 0 |

## Per-table row deltas

Unavailable for this pair: snapshot 1 retained only the exact aggregate row count.

## Warnings

- provider delta is bounded by dashboard percentage quantization
- per-table row delta is unavailable because snapshot 1 retained only the exact aggregate
- snapshot 1 aggregate surfaces were observed across 315.807 seconds

## Evidence provenance

| Input | SHA-256 |
|---|---|
| Snapshot 1 baseline | `f27c6179cea4672f8812e80aed4b505aa767be9a069de1f247d21f3076289304` |
| Snapshot 2 TSV | `e18869e077df507b95a01424e65a428a978b70a9871ff1c27993f0952a8f2cf7` |
| Snapshot 2 capture receipt | `c812bb79334ef6ee692754fc3886324c5c989028023690fa6d1a85691db79294` |
| Render receipt before | `c289f3c04bfab9fd22724e4a0ea502d8e19526b00877993c8c97cf273836a4ed` |
| Render receipt after | `e11b48fb29944d93574e5525774de6fec0de39a3eb27f3e9cc7be1b285a6b34a` |
