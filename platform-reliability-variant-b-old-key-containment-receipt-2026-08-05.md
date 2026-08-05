# Variant B v4 — conditional old-key containment receipt

- Executed at: `2026-08-05T18:44Z`–`2026-08-05T18:45Z` UTC.
- Repository authority before publication: meta `origin/master`
  `16c0042e1f78ab54507ac56478aceaa3b23e15d2`.
- Scope: revoke exactly one identified Render account API key and delete exactly
  one GitHub environment secret. No replacement credential or release action was
  authorized.
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

This matched the authorized identity exactly. The row menu and its confirmation
dialog both named `r1a-gate-c0` and displayed the same visible prefix. The
operator-authorized **Revoke API Key** action was applied once.

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

This receipt makes **no claim that the revoked key had been unused**. The prior
read-only provenance observation recorded:

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
close or rotate:

- the Blueprint Sync Hook secret URL;
- the service Deploy Hook secret URL;
- pending Blueprint preview `exe-d9pg7s3m8hqs73fguv80`, which remains
  approvable through the dashboard.

Both hook URLs remain credentials that can operate without the revoked API key
and without dashboard approval. No hook, preview, Blueprint, service, deploy or
database object was read for mutation or changed in this window.

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
