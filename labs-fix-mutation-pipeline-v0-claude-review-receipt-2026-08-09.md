# FIX MUTATION PIPELINE v0 — independent Claude review receipt

Date: 2026-08-09

Status: **GO — no P1/P2 findings**

Ticket: [Glera/p4g-workspace-meta#78](https://github.com/Glera/p4g-workspace-meta/issues/78).

This was the single independent blind cross-provider review required by the
ticket. The reviewer was Claude Fable 5 at max effort. It received the ticket
contract, authority documents and exact committed patches, but not the author
transcript or self-assessment. The reviewer was instructed not to edit, commit,
push or mutate external state.

## Exact reviewed inputs

| repository | base | reviewed head |
| --- | --- | --- |
| `swipe-ugc` | `83357fb27782d722aeed11aba75ba369ced31d27` | `36c15aff1cb59d008833dd09e0c612504dcbb546` |
| `swipe-generator` | `8c9b4ad0906005f848fdbbcc466136e6babbf203` | `333d69c16357fc88ea43d0748a008e88e957cfd9` |
| meta authority | `d007deea66285a4aca9653bdc17118a2fc6a0168` | ticket contract and frozen authority only |

Authority packet:

- `AGENTS.md`;
- `CLAUDE.md`;
- `STATE.md`;
- `docs/specs/two-mac-development-operating-model.md`;
- `labs-mechanic-variation-throughput-audit-execution-receipt-2026-08-09.md`;
- `labs-fix-mutation-pipeline-v0-td-o2-request-2026-08-09.json`.

## Reviewer verification

The reviewer independently:

- read both exact diffs and their tests;
- ran all 20 new tests: UGC `7/7`, Generator `13/13`;
- resolved both live remote refs and every pinned commit/root-tree/source-tree;
- reproduced the exact full-index binary patch, 14-path allowlist, plan blob,
  plan bytes, lockfile and ancestry closure;
- ran the full TD-O2 pipeline twice from the committed request;
- observed the same candidate
  `orthogonal-link-v1-td-o2-d213b0e79592` and runtime digest
  `sha256:1f00d79ac06adc87413501f9807bafdcca45d51b6030ec2a424644e9d957bf77`;
- observed replay on the second run and byte-identical UGC and Generator
  snapshots;
- probed dirty/hidden-index, non-descended, allowlist-superset and cross-layer
  identity tampering rejects;
- confirmed marker-gated roots and the durable
  `publicationEligible=false`, `catalogEligible=false`,
  `feedEligible=false`, `review=null` boundary.

The reviewer's unattended golden run took `1m57s`. It did not edit either
reviewed checkout and did not push or touch production.

## Findings and dispositions

There were no P1 or P2 findings. Per the ticket, no post-review code edits were
made.

The reviewer recorded seven non-blocking P3 findings. They remain deliberately
unfixed in this scope:

1. Require trace runtime manifest/file closure earlier, so a future incomplete
   runner fails before UGC materialization rather than at registration.
2. Add a stubbed orchestration-layer test and explicit negative tests for
   ancestry and exact changed-set rejection.
3. Pin Git diff config (`noprefix`, rename detection and external diff) to avoid
   config-dependent fail-closed mismatches.
4. Unify source/candidate identifier length bounds across the three layers.
5. Document and reject unsupported runtime closures or technical suites that
   need additional sibling inputs earlier and with typed diagnostics.
6. Exclude attestation harness paths under `scripts/` from mutation allowlists.
7. Persist a deterministic verified-provenance subset before any future Family
   A consumer relies on direct registrar records.

These findings do not create publication/catalog/feed authority and do not
invalidate the golden path. They are follow-up candidates, not hidden work in
the present PRs.

## Acceptance matrix

| acceptance criterion | verdict |
| --- | --- |
| server-owned exact repository/ref/commit/tree/source-tree verification | PASS |
| dirty, stale, missing and mismatched identity rejection | PASS |
| request-only mutation; no per-mutation UGC/Generator edits | PASS |
| TD-O2 golden replay | PASS |
| byte-stable candidate with false/false/false/null safety | PASS |
| evidence sufficient for before/after bottleneck-N comparison | PASS |
| one independent review, P1/P2-only fix policy | PASS |

Frozen reviewer verdict: **GO — No P1/P2 findings.**
