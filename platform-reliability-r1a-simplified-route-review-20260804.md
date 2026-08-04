# R1-A simplified route — advisory self-check receipt

**Date:** 2026-08-04

**Reviewer:** Claude Code Sonnet session invoked by Codex

**Author under review:** Codex

**Status:** advisory self-check of superseded bytes; not an independent contour
review, not operator GO and not current-route acceptance

## Exact historical bytes checked

| file | SHA-256 |
| --- | --- |
| `platform-reliability-route-a-runbook-v3-2026-08-04.md` | `9c6ae19f2a0269d6cdb100f3f471eae397752e0b313cac112870bb2e937e0df7` |
| `platform-reliability-r1a-candidate-v4-request-2026-08-04.md` | `9ba1ab4afbd09991a947bd713c245e79498a816a86074025ed6045db0ba3389b` |

Backend reference under that check:
`1b145d441378b884e17938632378542ac3bf2069`.

## Scope and limitation

The session checked candidate inputs, manifest/schema-capability behavior,
Render Save-only/source-switch/preDeploy ordering, credential lifecycle and the
then-written R1 boundary. It was a fresh read-only model session, but it was
started and scoped by the same Codex implementer. It therefore is not the
independent reviewer of this workstream and cannot produce operator authority.

The checked bytes contained two authority defects outside that session's scope:

1. They incorrectly treated Blueprint replacement/Gate C0 as removed, although
   the operator removed only the gates after C0. Without C0 the leaked Sync Hook
   remains an active credential capable of initiating Blueprint sync.
2. They prescribed a manual production `0070→0072` migration, contradicting the
   accepted patch A design: exact pinned `0070→0073` under the preDeploy advisory
   lock with one release receipt.

Those bytes and the earlier `GO` wording are superseded. Current v3 and the
withdrawn candidate-v4 tombstone require a new independent contour review.
No external mutation was performed by the self-check session. This receipt
grants no merge, dispatch, Render, database, deploy or Stage 1 authority.
