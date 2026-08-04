# R1-A GitHub inputs — preflight receipt

**Observed at:** `2026-08-04T19:22:39Z`

**Repository:** `Glera/swipe-backend`

**Authority:** operator-approved non-secret GitHub transport setup. This receipt
does not authorize workflow dispatch, Render action, migration, deploy, C0 or
Stage 1 mutation.

## Environment

GitHub environment `production` was created as transport required by
`.github/workflows/platform-release-cutover.yml`:

- environment ID: `19295476006`;
- node ID: `EN_kwDOTPQMbc8AAAAEfhmZJg`;
- `protection_rules=[]`;
- `deployment_branch_policy=null`;
- environment secrets: `total_count=0`.

An initial request that explicitly sent `wait_timer=0` returned HTTP 422 because
the current billing plan does not support that protection rule. It did not
create the environment. The successful request omitted all protection payload,
producing the empty rules above.

`RENDER_API_KEY` was not created, read or handled. The operator supplies and
later deletes that environment secret in the separately authorized production
window.

## Repository variables

Read-back from `actions/variables`:

| name | exact value | created/updated UTC |
| --- | --- | --- |
| `PLATFORM_DATABASE_IDENTITY` | `swipe-production` | `2026-08-04T19:22:22Z` |
| `PLATFORM_RELEASE_AUTHORITY_SCOPE` | `production` | `2026-08-04T19:22:22Z` |
| `RENDER_OWNER_ID` | `tea-d1m4lmali9vc73euvelg` | `2026-08-04T19:22:30Z` |
| `RENDER_REGISTRY_CREDENTIAL_ID` | `rgc-d9np7tajnfac73bi5ib0` | `2026-08-04T19:22:22Z` |
| `RENDER_SERVICE_ID` | `srv-d95r3bfavr4c73aqsi4g` | `2026-08-04T19:22:22Z` |

The first concurrent write of `RENDER_OWNER_ID` received a GitHub HTTP 500; a
single bounded retry succeeded and the table records its verified read-back.

`RENDER_BLUEPRINT_ID` is intentionally absent. Gate C0 has not created its new
Blueprint ID yet. Setting the deleted old ID or a placeholder would make the
workflow configuration false. After terminal C0, patch C merge and creation of
this sixth repository variable form one bounded, independently reviewed apply;
their exact equality is required before candidate publication.

## Negative evidence

- no GitHub Actions secret was created or changed;
- no workflow was dispatched or rerun;
- no Render resource, credential or environment variable was read or mutated;
- no database connection or migration occurred;
- `RENDER_BLUEPRINT_ID` remains absent, so production workflow preflight remains
  fail-closed until C0 + patch C.
