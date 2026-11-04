## Objective

Complete the Mac A half of the frozen one-Mac-per-domain operating model: a model-free local dispatcher turns one new durable platform intake Issue into exactly one bounded local Codex author job. It must not revive #136 cross-Mac wake/session transport.

Authority: `docs/specs/one-mac-per-domain-operating-model.md`, especially §§2, 4–7.

## Bounded scope

- Meta/tooling only: one deterministic scanner/dispatcher, tests, launchd template and runbook.
- Read only open GitHub Issues carrying the exact `p4g-development-ticket:v1` marker and `sourceKind=platform`.
- Ignore mechanic tickets and every Issue without the exact server-authored marker.
- Before starting AI, append one deterministic machine claim bound to repository id, issue number, source request id/hash, domain and exact dispatcher profile digest.
- At most one Issue/job per tick. Empty tick is model-free and performs no mutation.
- Start a fresh local `codex exec --json` job in the configured Mac A workspace; no saved-session id, resume, wake FIFO, second Mac identity or cross-Mac prompt.
- Require one durable terminal receipt bound to the claim. If the process does not start, exits non-zero, times out or returns without the terminal receipt, publish one typed local NEEDS_HELP receipt and never retry automatically.
- Preserve an operator-visible bounded local JSONL/log receipt and expose deterministic status via `--status`/dry-run.
- Config/state/claim parsing is fail-closed; secrets are never logged. Launchd remains disabled until one reviewed package is merged and a separate one-time local activation is performed.

## Acceptance

- Open platform ticket is selected FIFO; mechanic/untrusted/closed/already claimed tickets are ignored.
- Two concurrent ticks cannot start two jobs; a durable pre-start claim prevents replay after crash/restart.
- Empty polling invokes neither Codex nor another model and creates no GitHub comment.
- One successful fake job with a causally bound terminal receipt advances the local cursor exactly once.
- Start failure, timeout, non-zero exit and missing/mismatched receipt each produce one terminal NEEDS_HELP and no retry.
- Tests cover marker spoofing, profile drift, claim replay, concurrency, bounded output and control-character sanitization.
- Repository-native CI and one blind Tier-1 review are green before merge.

## Explicit non-goals

- no Mac B routing, cross-Mac wake, task/session binding or IDE resume;
- no shared task database, daemon, cron service, queue optimizer or AI idle tick;
- no backend/feed/product code, deploy, migration, settings, credentials, permissions or infrastructure;
- no automatic merge/deploy/publication/Approve.
