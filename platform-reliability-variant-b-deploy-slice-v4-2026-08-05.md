# Вариант B — минимальный production deploy, редакция 4

- Дата: 05.08.2026.
- Владелец исполнения: Codex / frontier-оркестратор.
- Независимый ревьюер: Claude, один delta-проход перед production-окном.
- Наследует отревьюенный маршрут редакции 3, чьи Phase 1 bytes имеют SHA-256
  `324bac0cf95493de5a93760f40f50cff453bd41d6a75e8093e64a4033aa2eb8f`.
- Phase 1 завершена и принята в
  `platform-reliability-variant-b-phase1-publication-receipt-2026-08-05.md`
  (`981db1531556958eb91b3a3863cc6c5a7896482d`).
- Исторический статус до pre-Phase-2 поправок: **CLAUDE R2 GO на exact content
  head `7506a670a5260a9a2b4d0749dafd66be96afb12f`; Phase 1 PASS.**
- Текущий статус: **DRAFT — второй preview и executable capture-path внесены;
  credential preparation и Phase 2 запрещены до отдельной независимой
  Claude-review квитанции exact bytes и нового двойного GO.**

## 1. Цель и сознательное упрощение

Цель этого маршрута ровно одна: backend `0e9e940` работает в production,
preDeploy переводит БД с `0070_published_test_delivery` на
`0073_platform_release_receipts`, health и release receipt подтверждены.

Не входят в маршрут: Gate C0, disposable rehearsal, миграция `0074`, закрытие
DB ingress, Stage 1 runtime и активация сапёра. Аудитории нет, простой допустим;
при неоднозначном состоянии мы останавливаемся и читаем факты, а не строим
дополнительную availability-инфраструктуру.

Полный маршрут содержит три dispatch, из которых первый уже завершён:

1. publish immutable image — без Render и без Render key;
2. prepare-source — PATCH конфигурации, без deploy;
3. deploy — единственный deploy POST и preDeploy `0070→0073`.

Phase 1 уже завершена и повторению не подлежит. Render API key разрешается
идентифицировать, создавать, проверять или менять только в отдельном
credential-preparation окне после нового двойного GO.

## 2. Immutable authority

| Authority | Exact value |
| --- | --- |
| backend workflow ref | `master == 0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4` |
| feed | `c1681d8044c28124be6d8e099a9a73849b59921e` |
| playables | `67fedba6901cf492bc0d60ac051560e89d443f3b` |
| swipe-platform | `12033fa72d0dfaba4bde49264e2d543bf19e928a` |
| service | `srv-d95r3bfavr4c73aqsi4g` |
| live Blueprint | `exs-d95qo3q8qa3s73ea23p0` |
| owner | `tea-d1m4lmali9vc73euvelg` |
| registry credential | `rgc-d9np7tajnfac73bi5ib0` |
| database identity | `swipe-production` |
| authority scope | `production` |
| current source deploy | `dep-d9mtmabm8hqs73cighmg` (`09fa0cd`) |
| LKG build run | `30789375002` |
| LKG image | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` |
| LKG manifest SHA-256 | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |
| candidate build run | `31028527617` |
| candidate manifest SHA-256 | `cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2` |
| candidate image | `ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4` |

Before every remaining external mutation, all four Git commits are resolved
independently from their repositories. Any mismatch burns the packet.

The existing LKG is not the current production runtime: its backend source
`cd6fb13a` is ahead of production `09fa0cd`. `operation=rollback` therefore is
an emergency forward-compatible image, not an exact return to today's state.
No automatic rollback is part of this route; a rollback decision gets its own
operator GO after reading the observed state.

## 3. Phase 0 — read-only preflight

The Phase 1 observations remain historical evidence. Before the next external
mutation, repeat every mutable observation below:

1. GitHub `swipe-backend/master` is exactly `0e9e940`; its migration head is
   exactly `0073_platform_release_receipts`.
2. `.github/workflows/platform-release-image.yml`,
   `.github/workflows/platform-release-cutover.yml` and
   `scripts/platform-release-coordinator.py` are read from that exact commit.
3. GitHub environment `production` exists. Five stable repository variables
   already exist and equal §2: `RENDER_SERVICE_ID`, `RENDER_OWNER_ID`,
   `RENDER_REGISTRY_CREDENTIAL_ID`, `PLATFORM_DATABASE_IDENTITY`,
   `PLATFORM_RELEASE_AUTHORITY_SCOPE`. `RENDER_BLUEPRINT_ID` is deliberately
   added only immediately before phase 2 and must equal the live Blueprint in
   §2.
4. Conditional containment is complete under
   `platform-reliability-variant-b-old-key-containment-receipt-2026-08-05.md`:
   the old Render key is absent, environment `production` contains no
   `RENDER_API_KEY`, and the cutover job therefore fails closed before any
   provider call. Re-observe those two absences before credential preparation.
   The next window creates exactly one new temporary key and one new GitHub
   secret; it does not update or reuse the contained credential.
5. Current production is observed read-only: live backend `09fa0cd`, DB
   `0070`, and the sole live deploy is `dep-d9mtmabm8hqs73cighmg`. If these
   changed, stop and rebuild the packet.
6. Two exact unapproved Blueprint previews are known residuals and are never
   opened for approval or approved:
   - `exe-d9nercqjnfac73aunbvg`, captured
     `2026-08-02T17:54:51.176Z` from stale source `a12ca7e` with
     `approved=false`, `stale=true` and an enabled Approve action;
   - `exe-d9pg7s3m8hqs73fguv80`, created by the unapproved manual sync on
     `2026-08-05` and left pending.
   The first preview is dispositioned as an exact stale residual rather than
   silently omitted: either preview may be absent, remain `created|pending`, or
   become terminal `error`; either becoming `running|success` is STOP.
7. The complete Blueprint-sync instrument is the official paginated endpoint
   `GET /v1/blueprints/exs-d95qo3q8qa3s73ea23p0/syncs?limit=100`, following
   every returned cursor until exhaustion. Normalize every item to
   `(id, state, commit.id, startedAt, completedAt)`, sort by `id`, and hash the
   canonical array. The OpenAPI states are `created`, `pending`, `running`,
   `error` and `success`; no dashboard inference substitutes for this API.
8. The executable read-only instrument is
   `scripts/platform-reliability-variant-b-provider-capture.mjs`, SHA-256
   `dc8f1d46cda2f173df1cabb70457c099cf25da8d5aff847e144d6d523870a25f`.
   It performs GET only; exhausts cursor pagination for `/syncs` and
   `/env-vars`; reads the exact Blueprint, service and latest deploy; emits RFC
   8785 canonical JSON with no API key or env values; and fails closed on an
   unknown nonterminal sync, unsafe known-preview state, forbidden rollback
   authorization name, pagination failure or unreadable projection. At
   `pre-window` it additionally requires the exact source state
   `runtime=docker` and `imagePath=null` before any mutation.
9. The Blueprint Sync Hook recorded by the containment receipt remains a live
   credential outside this route. Never invoke it. A hook-triggered sync would
   be caught only at the three sampled captures; a residual gap remains after
   Capture B and before the Phase 3 coordinator POST. Any observed new sync or
   source/runtime drift is STOP, not an invitation to continue.

## 4. Phase 1 — completed immutable candidate publication

Phase 1 is historical, complete and consumed. Do not dispatch it again. Run
`31028527617` executed `platform-release-image.yml` once with `ref=master`,
`head_sha=0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4` and the following inputs:

```text
publish             = true
feed_sha            = c1681d8044c28124be6d8e099a9a73849b59921e
playables_sha       = 67fedba6901cf492bc0d60ac051560e89d443f3b
swipe_platform_sha  = 12033fa72d0dfaba4bde49264e2d543bf19e928a
code_min_revision   = 0070_published_test_delivery
code_max_revision   = 0073_platform_release_receipts
lkg_min_revision    = 0069_arrows_runtime_variant
lkg_max_revision    = 0073_platform_release_receipts
lkg_kind            = image
lkg_build_run_id    = 30789375002
lkg_image_digest    = sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb
lkg_manifest_sha256 = b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88
```

Downloaded-artifact acceptance completed before any Phase 1 Render action:

- run metadata is `completed/success`, `event=workflow_dispatch`,
  `head_sha=0e9e940`; status alone was not used as acceptance;
- exactly one candidate manifest is downloaded;
- sidecar SHA-256 equals the workflow output;
- `sources.backend.sha=0e9e940` and the three cross-repo pins equal §2;
- `database.targetRevision=0073`, `expectedPredecessor=0072`, and
  `acceptedRevisions` contains the exact ordered `0070..0073` chain;
- candidate image is the exact digest in §2;
- the manifest pins the LKG run, digest and manifest from §2.

The reviewed receipt in §1 persists the run, manifest SHA-256 and image path.
No rerun or second image dispatch is authorized.

## 5. Opening the short production window

Only after a separate credential-preparation double GO:

1. Reconfirm the completed containment state from §3: the old Render key is
   absent and environment `production` has no `RENDER_API_KEY`. Any mismatch is
   STOP; do not create or overwrite a credential.
2. Create exactly one temporary window key with one pinned Render key identity
   and exact bytes in one non-emitting local secure holder. No other Render key
   or GitHub secret is reused.
3. With those exact retained bytes, exact
   `GET https://api.render.com/v1/users` returns 200.
4. Before any GitHub or production-service mutation, run the exact §3 tool from
   its reviewed meta commit and verify its file SHA-256. The pre-window command
   is literal (the key exists only in the non-emitting environment):

   ```bash
   test "$(shasum -a 256 scripts/platform-reliability-variant-b-provider-capture.mjs | awk '{print $1}')" = \
     dc8f1d46cda2f173df1cabb70457c099cf25da8d5aff847e144d6d523870a25f
   node scripts/platform-reliability-variant-b-provider-capture.mjs \
     --stage pre-window \
     --blueprint-id exs-d95qo3q8qa3s73ea23p0 \
     --service-id srv-d95r3bfavr4c73aqsi4g \
     --expected-owner-id tea-d1m4lmali9vc73euvelg \
     --expected-current-deploy dep-d9mtmabm8hqs73cighmg \
     --known-preview-id exe-d9nercqjnfac73aunbvg \
     --known-preview-id exe-d9pg7s3m8hqs73fguv80 \
     --output variant-b-pre-window-provider-capture.v1.json
   ```

   Persist its complete JCS receipt and `syncsSha256` as
   `<pre_window_syncs>` / `<pre_window_syncs_sha256>`. The nonterminal subset
   may be any subset of the two exact §3 residuals in `created|pending`;
   `running|success` for either known preview is STOP. Any other nonterminal
   sync, pagination failure or unreadable field is STOP while production
   remains untouched; revoke/clean the selected key. The receipt must also show
   `service.runtime=docker`, `service.imagePath=null`, the exact old live deploy,
   and no rollback-authorization env-key names.
5. Operator writes the same bytes to environment secret `RENDER_API_KEY` and
   records the GitHub secret update timestamp. GitHub cannot return plaintext;
   the local holder remains mandatory.
6. Set repository variable `RENDER_BLUEPRINT_ID` to
   `exs-d95qo3q8qa3s73ea23p0` and re-read all six variables.
7. Confirm there is no concurrent Render UI/API deploy, no other
   `platform-production-release` workflow in progress, and no intentional use
   of the still-live Blueprint Sync Hook. The sampled capture cannot prove the
   hook was unused in the interval after it was taken.
8. Re-read `dep-d9mtmabm8hqs73cighmg`; it must still be live. This exact ID is the
   `expected_current_deploy` for both cutover dispatches.

The window ends only after §10 cleanup, regardless of success or failure.

## 6. Phase 2 — prepare-source

Immediately before dispatch: `swipe-backend/master == 0e9e940` and the exact
workflow/coordinator blobs match phase 0.

Exactly one `workflow_dispatch`:

```text
workflow                     = platform-release-cutover.yml
ref                          = master
operation                    = prepare-source
candidate_build_run_id       = 31028527617
candidate_manifest_sha256    = cf2cb0cf705588f7ed7a59726e1f8405fa4afffa38955fedb8d2a82da7c37cc2
lkg_build_run_id             = 30789375002
expected_current_deploy      = dep-d9mtmabm8hqs73cighmg
```

Expected result: coordinator receipt PASS; service configuration is switched
to the exact candidate image; no deploy is created;
`dep-d9mtmabm8hqs73cighmg` stays live. Render documents that updating service
configuration does not deploy it until the deploy API is called.

Intermediate semantics are literal:

- Render **Restart Service** keeps the exact live instance configuration and
  commit; it is not the candidate deployment;
- a standard new deploy/redeploy uses the current image-backed service
  configuration and is forbidden between phases 2 and 3;
- no restart, deploy, UI edit or API write is allowed in this gap.

## 7. Inter-phase exact projection — fail closed

Use the retained key for two distinct GET-only captures:

- **Capture A** runs immediately after Phase 2 reaches terminal success.
- **Capture B** runs from fresh provider GETs immediately before requesting the
  Phase 3 GO. It must equal Capture A byte-for-byte after removing only the
  capture timestamp. Reusing Capture A as Capture B is forbidden.

Capture A executes the §3 tool with these exact arguments:

```bash
node scripts/platform-reliability-variant-b-provider-capture.mjs \
  --stage prepared \
  --blueprint-id exs-d95qo3q8qa3s73ea23p0 \
  --service-id srv-d95r3bfavr4c73aqsi4g \
  --expected-owner-id tea-d1m4lmali9vc73euvelg \
  --expected-current-deploy dep-d9mtmabm8hqs73cighmg \
  --known-preview-id exe-d9nercqjnfac73aunbvg \
  --known-preview-id exe-d9pg7s3m8hqs73fguv80 \
  --expected-image-path ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4 \
  --expected-registry-credential-id rgc-d9np7tajnfac73bi5ib0 \
  --expected-health-check-path /api/health \
  --expected-predeploy-command "python -m app.platform_release predeploy-env" \
  --baseline variant-b-pre-window-provider-capture.v1.json \
  --output variant-b-capture-a-provider-capture.v1.json
```

Capture B repeats fresh GETs with the same arguments, changes only `--output`
to `variant-b-capture-b-provider-capture.v1.json`, and adds:

```text
--equal-capture variant-b-capture-a-provider-capture.v1.json
```

The executable verifier excludes only `observedAt` (and the derived
`equalCaptureSha256`) from A/B equality. Every provider projection, sync row,
pagination count, forbidden-key result and immutable pin must otherwise match.

Each capture must prove all facts at once:

```text
blueprint.id                 = exs-d95qo3q8qa3s73ea23p0
blueprint.autoSync           = false
service.id                   = srv-d95r3bfavr4c73aqsi4g
service.type                 = web_service | web
service.ownerId              = tea-d1m4lmali9vc73euvelg
service runtime/env          = image
service.autoDeploy           = false | no
service.imagePath            = ghcr.io/glera/swipe-backend@sha256:d7db27136b117c45158f40f9cc261d6807aae413f53ef2d649e4d23079e1b8b4
service registry credential  = rgc-d9np7tajnfac73bi5ib0
service.healthCheckPath       = /api/health
service.preDeployCommand      = python -m app.platform_release predeploy-env
latest deploy.id             = dep-d9mtmabm8hqs73cighmg
latest deploy.status         = live
pending Blueprint previews   = any subset of [exe-d9nercqjnfac73aunbvg,
                               exe-d9pg7s3m8hqs73fguv80]
Blueprint sync-set SHA-256   = <capture_syncs_sha256>
new Blueprint sync IDs       = []
```

GET sources are `/v1/blueprints/{id}`, `/v1/services/{id}` and
`/v1/services/{id}/deploys?limit=1`, plus every page of the exact Blueprint
sync endpoint from §3. The receipt stores only normalized projections,
timestamps and SHA-256 values; it never stores the API key or env values.

Each capture compares the complete normalized sync array to
`<pre_window_syncs>`:

- no new sync ID may appear;
- every baseline item other than the two exact §3 residuals is byte-identical;
- either known residual may be absent, remain `created|pending`, or move
  monotonically to terminal `error`; neither may become `running|success`;
- therefore `pending Blueprint previews` is valid as any subset of the two
  named residuals, never as any other set.

Capture B must equal Capture A under the same normalization. Any unknown or new
sync, a disallowed state transition, pagination failure, or inability to
enumerate the complete set is STOP.
If the API does not expose any required association (especially registry
credential or preDeploy command), this is **not** treated as PASS by
assumption: STOP before phase 3 and obtain an observable exact proof or patch
the coordinator under a separately reviewed commit.

The same tool exhausts `/v1/services/{id}/env-vars` pagination, projects names
only in memory, and fails if `PLATFORM_ROLLBACK_AUTHORIZATION_B64` or
`PLATFORM_ROLLBACK_AUTHORIZATION_SHA256` exists. It never serializes or prints
an environment value.

## 8. Phase 3 — deploy

Required immediately before dispatch:

- §7 exact projection PASS;
- `master == 0e9e940` again;
- workflow and coordinator blobs unchanged;
- no concurrent deploy/workflow;
- `dep-d9mtmabm8hqs73cighmg` is still the unique latest live deploy.

Exactly one `workflow_dispatch`, identical to phase 2 except:

```text
operation = deploy
```

The coordinator stages the bounded `PLATFORM_*` values, repeats source CAS,
makes the only deploy POST, waits for live, starts
`python -m app.platform_release verify-applied-db`, and then checks health.
preDeploy accepts exact-pinned `0070`, upgrades the full `0070→0073` chain
under one advisory lock and writes one release receipt.

No retry or `gh run rerun` is allowed in this window. An observed failure is
classified through §9 first.

## 9. Failure classification by observed state

An error message never proves whether a remote mutation committed. Every
failure first gets GET-only capture: Blueprint/service projection, latest
deploy list and statuses, names of `PLATFORM_*` keys, and — when safely
available — DB revision and release receipt.

| Observed state | Disposition |
| --- | --- |
| pre-window capture reports source-runtime/image drift, latest-deploy mismatch/not-live, forbidden rollback key, provider read failure or any other non-sync mismatch | STOP before GitHub/service mutation; preserve the receipt/error code; revoke the temporary key and remove any holder created in the window |
| phase 2 failed; service remains exact source configuration and old deploy live | STOP; no retry; cleanup |
| phase 2 failed; service is exact §7 prepared image and old deploy live | STOP; preserve state; continuation needs fresh operator GO |
| phase 2 failed; service is partial, different or unreadable | terminal NO-GO; no deploy; preserve evidence; cleanup |
| pre-window sync capture, Capture A or Capture B contains a new/unknown sync, a disallowed known-residual transition, or incomplete enumeration | STOP; no next phase; preserve provider evidence; cleanup |
| Capture A reports a latest-deploy identity/status mismatch or any new deploy after prepare-source | terminal STOP; no phase 3; preserve service/deploy/sync state and coordinator receipt; cleanup credentials only |
| Capture A or B reports prepared image/registry/health/preDeploy mismatch or an unreadable required projection | STOP; no phase 3; preserve the partially prepared service and exact error; cleanup credentials only; correction needs a new reviewed route |
| Capture B reports `equal_capture_projection_mismatch` or lacks an `equalCaptureSha256` bound to Capture A | STOP; no phase 3; preserve both captures; cleanup credentials only; a fresh GO is required after disposition |
| any capture reports `rollback_authorization_present` | STOP; no next phase; preserve env-key-name evidence without values; removal or restoration requires a separate reviewed decision |
| phase 3 failed; no new deploy exists and old deploy remains live | STOP; no retry; capture env-key names; cleanup |
| new deploy is queued/building/pre-deploy/in-progress | wait read-only until terminal; no retry and no second deploy |
| new deploy is terminal failed | STOP; capture DB revision/receipt and config; no roster work |
| preDeploy failed **after** Alembic upgrade; DB=`0073` and a release receipt may already exist while the new deploy is terminal failed | STOP; preserve the staged `PLATFORM_*` state and exact DB/receipt/deploy evidence; no retry, downgrade, roster work or implicit rollback; fix-forward/rollback requires a new reviewed decision |
| new deploy is live but workflow failed after deploy | run manual phase-4 reads; never redeploy merely to obtain a workflow artifact |
| new deploy is live, DB=0073, exact release receipt exists and health passes | technical deploy may be accepted from manual receipt despite missing workflow artifact; Claude reviews this exceptional evidence before roster work |
| new deploy live but DB/receipt/health does not pass | terminal NO-GO; no roster work; rollback/fix-forward is a new decision |
| any phase-4 check fails | STOP; no roster work; capture literal state |
| any cleanup check fails | terminal NO-GO; name the live credential/state; do not declare completion |

`operation=rollback` is never launched implicitly. The LKG differs from the
previous production source, and schema rollback does not occur.

## 10. Phase 4 — acceptance and terminal cleanup

Deploy acceptance requires all of:

1. candidate deploy is `live` and serves the candidate backend identity;
2. `/api/health` returns the expected service identity;
3. `verify-applied-db` PASS;
4. Alembic revision is exactly `0073_platform_release_receipts`;
5. one release receipt binds candidate manifest, deploy identity and DB
   transition; no unrelated migration is present;
6. existing feed session opens and a known playable launches; no requirement
   that Minesweeper already appears in the server-owned roster.

Terminal cleanup runs at every outcome:

1. capture normalized Render state, latest deploy/status, DB revision and
   names of `PLATFORM_*` keys;
2. operator revokes the exact pinned window-key identity in Render;
3. using the **same retained bytes**, exact
   `GET https://api.render.com/v1/users` must return 401;
4. delete GitHub environment secret `RENDER_API_KEY` and confirm secret list
   no longer contains it;
5. delete the local secure holder and confirm no plaintext copy remains;
6. leave the six non-secret repository variables in place as release
   identities; they are not credentials.

Disposition of the service-level `PLATFORM_*` values is explicit:

- on successful deploy, retain exactly `PLATFORM_DATABASE_IDENTITY`,
  `PLATFORM_DEPLOY_IDENTITY`, `PLATFORM_RELEASE_MANIFEST_B64`,
  `PLATFORM_RELEASE_MANIFEST_SHA256` and
  `PLATFORM_RELEASE_OPERATION=deploy` as the applied-release identity until a
  separately reviewed later deploy replaces them;
- `PLATFORM_ROLLBACK_AUTHORIZATION_B64` and
  `PLATFORM_ROLLBACK_AUTHORIZATION_SHA256` must remain absent for deploy;
- after any failure occurring after Phase 3 staged these values, do not delete,
  restore or overwrite them by assumption. The coordinator can already have
  compensated the write inside `_set_release_env_with_cas`, and
  `release_env_restore_failed` can leave a partial set. Capture actual presence
  and non-secret digests; absence, a full set and a partial set are distinct
  evidence states and none proves whether staging happened. Freeze the observed
  state and require a new reviewed cleanup or fix-forward GO. Terminal cleanup
  may close the credential window but cannot declare the technical deploy
  complete.

Known residual: the workflow timeout is 35 minutes while deploy and verification
polls can each consume 1200 seconds. A workflow timeout is classified from
provider/DB state under §9; it never authorizes rerun or a second deploy merely
to obtain an artifact.

Only after cleanup PASS is the deploy window closed. The next package is
`minesweeper-feed-roster-packet-2026-08-05.md`.

## 11. GO boundary

One independent Claude delta-review must cover this file and the exact capture
tool against the workflow/coordinator at `0e9e940`. Its separate committed
artifact is
`platform-reliability-variant-b-v4-claude-review-2026-08-05.md`; it must bind
the reviewed route SHA-256, capture-tool SHA-256 and exact git head, and must
precede merge. A status line inside this route is not a review receipt. Phase 1
GO is exhausted. The remaining route requires three mandatory double-GO
boundaries; conditional containment boundary 0 is historical PASS:

0. historical PASS: the unretained pre-existing key was revoked and its GitHub
   secret holder removed under
   `platform-reliability-variant-b-old-key-containment-receipt-2026-08-05.md`;
1. credential preparation: bind/create/probe the one exact window key, perform
   the pre-window sync capture, write `RENDER_API_KEY`, and set
   `RENDER_BLUEPRINT_ID`;
2. Phase 2: one `prepare-source` dispatch;
3. Phase 3: only after both §7 captures pass, one `deploy` dispatch.

No GO is inherited across these boundaries. Fresh review is required if
executable files, immutable pins, dispatch inputs or failure semantics change —
not for receipt timestamps or newly discovered run/deploy IDs that satisfy this
contract.

External irreversible acts remain operator-owned: creation/revocation of the
Render key, dispatches and any rollback decision. Codex orchestrates, verifies
receipts and owns final acceptance.
