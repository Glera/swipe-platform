# Platform Reliability R1 — final evidence template

Этот файл — каркас, а не runtime-evidence и не разрешение на operator
действия. Перед окном скопировать его в корень meta-repo как
`platform-reliability-r1-final-evidence.md`, заменить каждый `{{PLACEHOLDER}}`
наблюдённым несекретным фактом и удалить эту инструкцию.

Запрещено вставлять connection strings, пароли, PSQL-команды, точный внешний
IP/CIDR, raw database username или фрагменты stderr. Для адреса и username
сохраняются только SHA-256 канонической строки; диагностические ошибки —
только typed outcome и digest полного operator-local текста.

## 1. Verdict

- Overall status: `{{PASS_OR_FAIL}}`
- Evidence branch: `{{BRANCH}}`
- Base `origin/master`: `{{FULL_SHA}}`
- Evidence head: `{{FULL_SHA}}`
- Operator window: `{{UTC_START}}` → `{{UTC_END}}`
- Source database service: `{{RENDER_SERVICE_ID}}`
- Production mutations before reviewed operator window: `{{NONE_OR_TYPED_DEVIATION}}`
- Unresolved deviations: `{{NONE_OR_LIST}}`

## 2. Snapshot 2 and bounded delta

| Evidence | Identity / outcome |
|---|---|
| Snapshot TSV | `sha256:{{SHA256}}`, server time `{{UTC}}`, completion sentinel `{{PASS_OR_FAIL}}` |
| DB capture receipt | `sha256:{{SHA256}}`, byte binding `{{PASS_OR_FAIL}}`, credential tempfile removed `{{PASS_OR_FAIL}}` |
| Render receipt | service `{{ID}}`, observed `{{UTC}}`, status `{{STATUS}}`, PG `{{MAJOR}}` |
| Delta JSON | `sha256:{{SHA256}}`, analyzer exit `{{INTEGER}}` |
| Delta Markdown | `sha256:{{SHA256}}` |

Gate C0 Blueprint replacement evidence:

- `platform-reliability-r1-gate-c0-source-freeze-policy.json`: `sha256:{{SHA256}}`, exact policy replay `{{PASS_OR_FAIL}}`
- source-freeze execution receipt: pre-freeze master/tree `{{FULL_SHA}}` / `{{TREE_SHA}}`, freeze merge `{{FULL_SHA}}` with ordered parents/tree `{{FULL_SHA}}` / `{{FULL_SHA}}` / `{{TREE_SHA}}`, revert `{{FULL_SHA}}` / parent `{{FULL_SHA}}` / post-revert tree `{{TREE_SHA}}`, elapsed `{{SECONDS}}`, exact reversion `{{PASS_OR_FAIL}}`, independent review `{{REVIEW_ID}}`
- `platform-reliability-r1-gate-c0-blueprint-before.json`: `sha256:{{SHA256}}`
- `platform-reliability-r1-gate-c0-blueprint-after.json`: `sha256:{{SHA256}}`
- `platform-reliability-r1-gate-c0-blueprint-comparison.json`: `sha256:{{SHA256}}`, exact-byte replay `{{PASS_OR_FAIL}}`

Observation window: `{{SECONDS}}` seconds.

Provider continuity authority: Render confirmed materialized service
environment variables and cron schedules remain on existing services;
`providerConfirmedFromDatabaseContinuity={{PASS_OR_FAIL}}`, actual replacement
evidence remains `operator_attested` and
`providerVerifiedServiceContinuity=false`; unexpected sync observed
`{{TRUE_OR_FALSE}}` (PASS requires `false`). Gate C is forbidden until the
source-freeze receipt proves the exact post-revert tree.

| Surface | Before | After | Delta | Normalized rate | Disposition |
|---|---:|---:|---:|---:|---|
| Provider storage | `{{VALUE}}` | `{{VALUE}}` | `{{VALUE}}` | `{{VALUE}}` | `{{PASS_OR_NOTE}}` |
| `pg_database_size` | `{{BYTES}}` | `{{BYTES}}` | `{{BYTES}}` | `{{VALUE}}` | `{{PASS_OR_NOTE}}` |
| User relations | `{{BYTES}}` | `{{BYTES}}` | `{{BYTES}}` | `{{VALUE}}` | `{{PASS_OR_NOTE}}` |
| Provider minus relations | `{{VALUE}}` | `{{VALUE}}` | `{{VALUE}}` | `{{VALUE_OR_INCONCLUSIVE}}` | `{{PASS_OR_NOTE}}` |
| Exact rows | `{{COUNT}}` | `{{COUNT}}` | `{{COUNT}}` | `{{VALUE}}` | `{{PASS_OR_NOTE}}` |
| Deadlocks | `{{COUNT}}` | `{{COUNT}}` | `{{COUNT_OR_INCONCLUSIVE}}` | `n/a` | `{{PASS_OR_NOTE}}` |

Capacity conclusion and action threshold:

`{{FACT_BOUND_CONCLUSION}}`

Independent snapshot review: `{{REVIEW_ID_OR_URL}}` at
`{{EXACT_HEAD}}` — `{{VERDICT}}`.

## 3. Stop-before-start

Every row must be `PASS` before Gate A.

| Requirement | Result | Evidence identity |
|---|---|---|
| Snapshot 2 after boundary and analyzer PASS | `{{STATUS}}` | `{{SHA_OR_RECEIPT}}` |
| Independent snapshot review has no P1/P2 blockers | `{{STATUS}}` | `{{REVIEW_ID}}` |
| Source database is available | `{{STATUS}}` | `{{RENDER_OBSERVATION}}` |
| Workspace-wide consumer set is closed | `{{STATUS}}` | `{{DIGEST}}` |
| No active deploy/sync/recovery/export | `{{STATUS}}` | `{{RENDER_OBSERVATION}}` |
| Operator has approved the full window | `{{STATUS}}` | `{{UTC}}` |
| Temporary recovery cost is approved | `{{STATUS}}` | `{{DISPOSITION_ID}}` |
| Pinned source and last-known-good identities retained | `{{STATUS}}` | `{{DIGEST}}` |
| Old external credential retained only ephemerally | `{{STATUS}}` | `{{ASSERTION}}` |

## 4. Consumer closure

Inventory was rebuilt at `{{UTC}}`; database values were not read or retained.

| Consumer | Kind | Blueprint/env authority | Pinned source | Last-known-good | Fresh post-sync proof |
|---|---|---|---|---|---|
| `{{SERVICE_ID}}` | `{{WEB_OR_CRON_OR_WORKER}}` | `{{REFERENCE_ID}}` | `{{FULL_SHA}}` | `{{DEPLOY_OR_RUN_ID}}` | `{{RECEIPT_SHA256}}` |

Closed-set digest: `sha256:{{SHA256}}`.

Manual/external permanent consumers: `{{NONE_OR_DISPOSITION}}`.

## 5. Operator-window timeline

Every external action is also represented in
`platform-reliability-r1-operator-receipt.json`.

| Gate | Operator confirmation | Action interval | Terminal result | Rollback |
|---|---|---|---|---|
| A — exact single-host ingress | `{{UTC}}` | `{{UTC}}` → `{{UTC}}` | `{{RESULT}}` | `{{NOT_NEEDED_OR_RESULT}}` |
| B — new default credential | `{{UTC}}` | `{{UTC}}` → `{{UTC}}` | `{{RESULT}}` | `{{NOT_NEEDED_OR_RESULT}}` |
| C — Blueprint sync | `{{UTC}}` | `{{UTC}}` → `{{UTC}}` | `{{RESULT}}` | `{{NOT_NEEDED_OR_RESULT}}` |
| D — old credential deletion | `{{UTC}}` | `{{UTC}}` → `{{UTC}}` | `{{RESULT}}` | `{{NOT_NEEDED_OR_RESULT}}` |
| E — isolated PITR recovery | `{{UTC}}` | `{{UTC}}` → `{{UTC}}` | `{{RESULT}}` | `{{NOT_NEEDED_OR_RESULT}}` |
| F — recovery cleanup | `{{UTC}}` | `{{UTC}}` → `{{UTC}}` | `{{RESULT}}` | `{{NOT_NEEDED_OR_RESULT}}` |
| G — durable empty allowlist | `{{UTC}}` | `{{UTC}}` → `{{UTC}}` | `{{RESULT}}` | `{{NOT_NEEDED_OR_RESULT}}` |

## 6. Ingress narrowing and credential rotation

- CIDR kind: `single-ipv4`
- Operator egress CIDR digest: `sha256:{{SHA256}}`
- Render rule CIDR digest: `sha256:{{SHA256}}`
- Digest equality: `{{TRUE}}`
- External PostgreSQL protocol query after narrowing: `{{PASS}}`
- Old credential identity digest: `sha256:{{SHA256}}`
- New credential identity digest: `sha256:{{SHA256}}`
- New credential creation time: `{{UTC}}`
- Capability comparison: `sha256:{{SHA256}}`, profiles equal
  `{{TRUE_OR_FALSE}}`
- Read-only Alembic check against pinned source: `{{PASS_OR_FAIL}}`
- Blueprint preview unexpected changes: `{{NONE_OR_TYPED_DIFF}}`
- Blueprint sync identity: `{{SYNC_ID_OR_TYPED_ABSENCE}}`
- Fresh consumers on new credential: `{{PASS_OR_FAIL}}`
- Old sessions after bounded drain: `{{INTEGER}}`
- Old credential after deletion: `{{TYPED_OUTCOME}}`
- New credential after deletion: `{{TYPED_OUTCOME}}`

## 7. Isolated restore drill

- Finance disposition: `{{APPROVED_ID}}`
- Operator-approved recovery target: `{{RECOVERY_NAME_OR_ID}}`
- Source database identity: `{{SOURCE_SERVICE_ID}}`
- Recovery database identity: `{{RECOVERY_SERVICE_ID}}`
- Requested restore point: `{{UTC}}`
- Start Recovery: `{{UTC}}`
- Start Recovery DB-clock receipt: `sha256:{{SHA256}}`; observed skew
  `{{SECONDS}}` seconds
- Recovery Available: `{{UTC}}`
- Validation complete: `{{UTC}}`
- Before-receipt digest: `sha256:{{SHA256}}`, present
  `{{TRUE_OR_FALSE}}`
- After-receipt digest: `sha256:{{SHA256}}`, absent
  `{{TRUE_OR_FALSE}}`
- PostgreSQL major/schema/table/sample validation: `{{PASS_OR_FAIL}}`
- Source remained available and bindings unchanged: `{{PASS_OR_FAIL}}`
- Source before/after binding digest: `sha256:{{SHA256}}`
- Source before/after deploy/run identities: `{{IDENTITY_LIST}}`
- Observed RPO: `{{SECONDS}}` seconds
- Observed provision RTO: `{{SECONDS}}` seconds
- Observed validation RTO: `{{SECONDS}}` seconds
- Recovery cleanup confirmation: `{{UTC}}`
- Recovery terminal deletion: `{{RESULT}}`
- Temporary recurring cost remaining: `{{NONE_OR_TYPED_DISPOSITION}}`

These are one-drill observations, not an SLA.

## 8. Durable external-ingress closure

- Backend PR/head: `{{PR_URL}}` / `{{FULL_SHA}}`
- Independent patch review: `{{REVIEW_ID}}` — `{{VERDICT}}`
- Linked Blueprint/source: `{{BLUEPRINT_ID}}` — `Glera/swipe-backend` / `master` / `render.yaml`
- Auto Sync observed disabled before merge: `disabled` at `{{UTC}}`; `sha256:{{SHA256}}`
- Merge identity: `{{FULL_SHA}}`
- Merge observed at: `{{UTC}}`
- Manual Sync preview: `{{UTC}}`; `sha256:{{SHA256}}`
- Manual Sync preview expected-only: `{{PASS_OR_FAIL}}`
- Blueprint sync identity: `{{SYNC_ID_OR_TYPED_ABSENCE}}`
- Manual Sync terminal: `{{TYPED_OUTCOME}}` at `{{UTC}}`; `sha256:{{SHA256}}`
- Render allowlist rule count after sync: `{{INTEGER}}`
- Closure saved at: `{{UTC}}`
- Auto Sync final state: `disabled` at `{{UTC}}`; `sha256:{{SHA256}}`

Paired proof strictly after closure:

| Proof | Timestamp | Result | Evidence |
|---|---|---|---|
| Fresh web DB query through private network | `{{UTC}}` | `{{TYPED_OUTCOME}}` | `sha256:{{SHA256}}` |
| Fresh DB-backed cron/worker run | `{{UTC}}` | `{{TYPED_OUTCOME}}` | `{{RUN_ID}}` |
| Fresh external PostgreSQL protocol request | `{{UTC}}` | `{{TYPED_OUTCOME}}`; SQL executed `{{TRUE_OR_FALSE}}` | `sha256:{{SANITIZED_STDERR_SHA256}}` |
| External DNS/HTTPS reachability control | `{{UTC}}` | `{{PASS_OR_FAIL}}` | `sha256:{{SHA256}}` |

No health-only or TCP-only check is used as database evidence.

## 9. Completion matrix

| Requirement | Result | Evidence |
|---|---|---|
| Snapshot 2/delta | `{{PASS}}` | `{{ARTIFACTS}}` |
| Exact single-host ingress | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| New credential | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| All consumers rotated | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| Old credential retired | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| PITR works | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| Source untouched | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| Temporary cost closed | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| RPO/RTO observed | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| External ingress closed | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| Internal remains green | `{{PASS}}` | `{{RECEIPT_PATH}}` |
| Secret hygiene | `{{PASS}}` | `platform-reliability-r1-secret-scan-receipt.json` |

## 10. Deviations, failures, and rollback

`{{NONE_OR_COMPLETE_TYPED_TIMELINE}}`

No failed attempt may be omitted. A rollback is recorded as an outcome, not
silently replaced by the later successful attempt. Every failed action is
named by `actionId` and either records containment/rollback or a later
successful action that resolves the same `operationId` and target.

## 11. Secret hygiene and patch closure

Final command:

```bash
node scripts/platform-reliability-r1-evidence-scan.mjs \
  --root . \
  --base-ref origin/master \
  > platform-reliability-r1-secret-scan-receipt.json
```

- Scanner status: `{{PASS_OR_FAIL}}`
- Scanner source digest: `sha256:{{SHA256}}`
- Operator validator source digest: `sha256:{{SHA256}}`
- Blueprint replacement comparator source digest: `sha256:{{SHA256}}`
- Rule-set digest: `sha256:{{SHA256}}`
- Exact patch closure: `{{OBSERVED_PATH_LIST_OR_DIGEST}}`
- Secret matches: `{{INTEGER}}`
- Exact operator IPv4 captured: `{{TRUE_OR_FALSE}}`
- Secrets captured: `{{TRUE_OR_FALSE}}`
- The pre-window incident was accepted as a bounded residual at Gate A. The later in-window incident triggered the provider-supported Blueprint replacement; terminal replacement evidence invalidates the same old hook without rewriting the historical operator decision.
- Secret-exposure incident `r1-prewindow-blueprint-sync-hook-dom-20260729`: `render_blueprint_sync_hook_dom_exposure` observed `2026-07-29T15:01:19Z`; target `render_blueprint_id` / `sha256:{{SHA256}}`; approval `{{DECISION_ID}}` / `{{UTC}}` / `approved`; disposition `operator_accepted_residual` / `{{ACTION_ID}}` / `{{UTC}}` / `{{UTC}}` / `accepted_residual` / risk `unauthorized_blueprint_sync` / environment `non_strategic_dogfood` / review by `{{UTC_WITHIN_31_DAYS}}` / mitigations `do_not_read_copy_or_use_hook,durable_empty_database_ip_allowlist_before_r1_completion,record_autosync_final_state,stop_on_unexpected_blueprint_sync` / reopen `before_cohort_expansion,before_triple_digit_dau,before_second_blueprint_operator_or_automation,before_render_strategic_commitment,on_unexpected_blueprint_sync`; before `{{UTC}}` / `{{RENDER_BLUEPRINT_ID}}` / `Glera/swipe-backend` / `master` / `render.yaml` / `sha256:{{SHA256}}` / after `{{UTC}}` / `{{RENDER_BLUEPRINT_ID}}` / `Glera/swipe-backend` / `master` / `render.yaml` / `sha256:{{SHA256}}` / continuity `equal` / acceptance `sha256:{{SHA256}}`; secrets captured `false`
- Secret-exposure incident `r1-window-blueprint-sync-hook-dom-20260802-1`: `render_blueprint_sync_hook_dom_exposure` observed `2026-08-02T19:10:00Z`; target `render_blueprint_id` / `sha256:{{SHA256_OLD_BLUEPRINT_ID}}`; approval `{{DECISION_ID}}` / `{{UTC}}` / `approved`; disposition `{{ACTION_ID}}` / `{{UTC}}` / `{{UTC}}` / `invalidated` / `replace_blueprint` / `render_dashboard_terminal_observation` / `{{UTC}}` / `replace_blueprint` / `invalidated` / `sha256:{{SHA256_OLD_BLUEPRINT_ID}}` / `sha256:{{SHA256}}` / credential proof `none`; before `{{UTC}}` / `exs-d95qo3q8qa3s73ea23p0` / `Glera/swipe-backend` / `master` / `render.yaml` / source `{{FULL_SHA}}` / `sha256:{{SHA256}}` / after `{{UTC}}` / `{{NEW_RENDER_BLUEPRINT_ID}}` / `Glera/swipe-backend` / `master` / `render.yaml` / source `{{SAME_FULL_SHA_AS_BEFORE}}` / `sha256:{{SHA256}}` / services `sha256:{{SHA256}}` -> `sha256:{{SAME_SHA256_AS_BEFORE}}` / configuration `sha256:{{SHA256}}` -> `sha256:{{SAME_SHA256_AS_BEFORE}}` / evidence class `operator_attested` / auto sync `disabled` -> `disabled` / continuity `replaced_same_source_and_services` / terminal `sha256:{{SHA256}}`; secrets captured `false`

## 12. Independent final review

Independent final review starts only after the evidence and scan receipt are
committed. Its exact-head verdict lives in the PR/review authority rather than
self-referencing this pre-review artifact.

R1 is complete only when every
completion-matrix row is `PASS`, final review has no open condition, the
recovery database is deleted, production external PostgreSQL ingress is empty,
the historical residual decision remains visible, and the later replacement
proves the old hook terminally invalidated.
