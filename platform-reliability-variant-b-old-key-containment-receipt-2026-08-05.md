# Variant B v4 — conditional old-key containment receipt

- Executed at: `2026-08-05T18:44Z`–`2026-08-05T18:45Z` UTC.
- Repository authority before publication: meta `origin/master`
  `16c0042e1f78ab54507ac56478aceaa3b23e15d2`.
- Scope: revoke exactly one identified Render account API key and delete exactly
  one GitHub environment secret. No replacement credential or release action was
  authorized.
- Authorizing route: `platform-reliability-variant-b-deploy-slice-v4-2026-08-05.md`,
  SHA-256
  `1a28d3eed67c53423d5eeaf823ebb84ba2ebf596ab92a65b0953f8f675c63ea0`.
- Authorization record: on `2026-08-05`, immediately before the execution
  window, operator Gleb transmitted the independent Claude verdict in this
  Codex task with the operative formulation: **“GO Variant B v4 conditional
  old-key containment only — approved with conditions.”** The task transport
  does not expose a trustworthy finer timestamp for that message; execution
  started at `18:44Z`, which is the upper bound recorded here. The authorized
  acts were exactly re-CAS, revoke the single matching Render key, prove its
  absence, delete only `production/RENDER_API_KEY`, and publish this receipt.
- Result: **PASS**.

## 1. Render API-key re-CAS and revocation

The pre-mutation read in Render **Account settings → API Keys** returned exactly
one active row:

| field | observed value |
| --- | --- |
| total active rows | `1` |
| name | `r1a-gate-c0` |
| visible key prefix | `rnd_iJEVru…` |
| dashboard-created age | `9h` |
| dashboard-last-used age | `6h` |

This matched the authorized identity exactly. Identification used the complete
dashboard table plus `name + visible prefix`; there was no retained plaintext
or retained creation receipt satisfying v4 §5.1. That weaker identity channel
was unambiguous in this bounded window because the complete pre-state contained
exactly one row, it matched both fields, and the complete post-state contained
zero rows. Any additional or mismatching row would have stopped the action. The
row menu and its confirmation dialog both named `r1a-gate-c0` and displayed the
same visible prefix. The operator-authorized **Revoke API Key** action was
applied once.

The post-mutation read returned `No provisioned API keys`; the exact name and
visible prefix both had zero matches. Because the plaintext value was not
retained, this complete active-key-table transition from exactly one matching
row to zero rows is the authorized substitute proof of revocation. No `200 →
401` plaintext probe was attempted.

## 2. GitHub environment-secret cleanup

The pre-mutation GitHub API read for
`Glera/swipe-backend/environments/production/secrets` returned:

```json
{"names":["RENDER_API_KEY"],"total_count":1}
```

Exactly `production/RENDER_API_KEY` was deleted. The post-mutation read returned:

```json
{"names":[],"total_count":0}
```

The `production` environment itself remains present. No repository variable,
environment policy, other secret, workflow or source object was changed.

## 3. Observed prior use — not a non-use claim

This receipt makes **no claim that the revoked key had been unused**. The source
record is the read-only provenance observation published at
[PR #63 comment 5195509642](https://github.com/Glera/p4g-workspace-meta/pull/63#issuecomment-5195509642).
Its channel was authenticated Render **Account settings → API Keys** dashboard
row metadata, observed with the dashboard session rather than with a request
authenticated by the API key itself. It therefore is not a self-attestation by
the key and does not depend on the key remaining valid. That observation
recorded:

- `createdAt = 2026-08-05T09:25:00.731874Z`;
- `lastUsedAt = 2026-08-05T11:45:24.986767Z`;
- GitHub `production/RENDER_API_KEY` creation at
  `2026-08-05T09:26:22Z`.

The review identified an approximate observed-use window of
`2026-08-05T11:23Z`–`12:22Z` with no corresponding CI run. The operating-thread
record attributes that use to the authorized R1-A read-only corrective/provider
probing performed directly against Render, rather than to a workflow dispatch.
This attribution does not broaden the proof above and does not claim that the
key was silent during its lifetime.

## 4. Residual exposure explicitly not contained here

This containment reduced the account API-key exposure only. It did **not**
close, rewrite or rotate:

- the Blueprint Sync Hook secret URL. The value remains in the contained local
  session file recorded by
  `platform-reliability-r1-gate-c-hook-incident-receipt.json`:
  `contentDeletedOrRewritten=false`, `terminalInvalidation=false`, disposition
  `provider_remediation_confirmed_operator_action_pending`;
- pending preview `exe-d9nercqjnfac73aunbvg`, captured on
  `2026-08-02T17:54:51.176Z` as `approved=false`, `stale=true`, with the
  dashboard Approve action still enabled. It requires a fresh disposition
  before Phase 2;
- pending preview `exe-d9pg7s3m8hqs73fguv80`, created by the unapproved manual
  sync on `2026-08-05`, which remains approvable through the dashboard.

The exposed Blueprint Sync Hook remains a credential that can operate without
the revoked API key and, under the accepted fail-closed threat model, without a
dashboard Approve step. This receipt makes no Deploy Hook exposure claim because
no separate incident source for such a leak was reviewed. No hook, preview,
Blueprint, service, deploy or database object was changed in this window.

## 5. Explicitly not performed

- no new Render API key or CLI token;
- no `/v1/users` probe;
- no GitHub secret replacement and no repository-variable write;
- no workflow dispatch or rerun;
- no Render service/configuration mutation;
- no deploy, migration, image publication, Blueprint sync or preview action;
- no Stage 1 runtime or roster action.

Before any Phase 2 GO, the separate review conditions remain open: disposition
preview `exe-d9nercqjnfac73aunbvg`; make the `/syncs` and `/deploys` capture path
executable (or define an explicit two-person manual procedure); publish an
independent v4 review receipt bound to the reviewed byte hash; and enforce
review-before-merge for the next authority artifact.
