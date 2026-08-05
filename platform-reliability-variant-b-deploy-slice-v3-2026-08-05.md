# Вариант B — минимальный production deploy, редакция 3

- Дата: 05.08.2026.
- Владелец исполнения: Codex / frontier-оркестратор.
- Независимый ревьюер: Claude, один delta-проход перед production-окном.
- Заменяет редакцию 2 (`abc3f8f`) после NO-GO
  `platform-reliability-variant-b-deploy-slice-v2-review-2026-08-05.md`.
- Статус: **CORRECTIVE DELTA REVIEW — прежний Claude GO закрывает весь
  маршрут, кроме уточнённого Phase 1 `ref=master`; ни одного dispatch или
  Render-изменения до delta-GO и отдельного operator GO.**

## 1. Цель и сознательное упрощение

Цель этого маршрута ровно одна: backend `0e9e940` работает в production,
preDeploy переводит БД с `0070_published_test_delivery` на
`0073_platform_release_receipts`, health и release receipt подтверждены.

Не входят в маршрут: Gate C0, disposable rehearsal, миграция `0074`, закрытие
DB ingress, Stage 1 runtime и активация сапёра. Аудитории нет, простой допустим;
при неоднозначном состоянии мы останавливаемся и читаем факты, а не строим
дополнительную availability-инфраструктуру.

Маршрут содержит три dispatch:

1. publish immutable image — без Render и без Render key;
2. prepare-source — PATCH конфигурации, без deploy;
3. deploy — единственный deploy POST и preDeploy `0070→0073`.

Render API key создаётся только после успешной публикации и проверки образа.
Поэтому падение фазы 1 не требует credential-cleanup.

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
| LKG build run | `30789375002` |
| LKG image | `sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb` |
| LKG manifest SHA-256 | `b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88` |

Before execution, all four Git commits are resolved independently from their
repositories. Any mismatch burns the packet.

The existing LKG is not the current production runtime: its backend source
`cd6fb13a` is ahead of production `09fa0cd`. `operation=rollback` therefore is
an emergency forward-compatible image, not an exact return to today's state.
No automatic rollback is part of this route; a rollback decision gets its own
operator GO after reading the observed state.

## 3. Phase 0 — read-only preflight

Before the first dispatch:

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
4. `secrets.RENDER_API_KEY` is not needed and is not touched in phases 0–1.
5. Current production is observed read-only: live backend `09fa0cd`, DB
   `0070`, and one exact live deploy ID `<source_deploy_id>`. If these changed,
   stop and rebuild the packet.
6. Pending Blueprint preview `exe-d9pg7s3m8hqs73fguv80` is never opened for
   approval and never approved.

## 4. Phase 1 — publish immutable candidate

Immediately re-read `swipe-backend/master`; it must equal exact
`0e9e940a2a762f0e35f93c3e35f3afcfea6baaa4`. Then perform exactly one
`workflow_dispatch` of `platform-release-image.yml` with `ref=master`.
GitHub's dispatch API accepts a branch or tag ref, not a raw commit SHA; the
pre-dispatch CAS plus the resulting `head_sha` bind execution to the commit.

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

Acceptance before any Render credential is created:

- run is `completed/success`, `event=workflow_dispatch`, `head_sha=0e9e940`;
- exactly one candidate manifest is downloaded;
- sidecar SHA-256 equals the workflow output;
- `sources.backend.sha=0e9e940` and the three cross-repo pins equal §2;
- `database.targetRevision=0073`, `expectedPredecessor=0072`, and
  `acceptedRevisions` contains the exact ordered `0070..0073` chain;
- candidate image is `ghcr.io/glera/swipe-backend@sha256:<candidate_digest>`;
- the manifest pins the LKG run, digest and manifest from §2.

Persist `<candidate_run_id>`, `<candidate_manifest_sha256>` and
`<candidate_image_path>` in the reviewed execution receipt. If any check
fails: STOP. Render is untouched, so no production cleanup is necessary.

## 5. Opening the short production window

Only after phase 1 PASS:

1. Operator creates one temporary Render API key and retains the exact same
   bytes in one non-emitting local secure holder until terminal cleanup.
2. With those bytes, exact `GET https://api.render.com/v1/users` returns 200.
3. Operator writes the same key to environment secret `RENDER_API_KEY`.
   GitHub cannot return its plaintext later; the local holder is therefore
   mandatory.
4. Set repository variable `RENDER_BLUEPRINT_ID` to
   `exs-d95qo3q8qa3s73ea23p0` and re-read all six variables.
5. Confirm there is no concurrent Render UI/API deploy and no other
   `platform-production-release` workflow in progress.
6. Re-read `<source_deploy_id>`; it must still be live. This exact ID is the
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
candidate_build_run_id       = <candidate_run_id>
candidate_manifest_sha256    = <candidate_manifest_sha256>
lkg_build_run_id             = 30789375002
expected_current_deploy      = <source_deploy_id>
```

Expected result: coordinator receipt PASS; service configuration is switched
to the exact candidate image; no deploy is created; `<source_deploy_id>` stays
live. Render documents that updating service configuration does not deploy it
until the deploy API is called.

Intermediate semantics are literal:

- Render **Restart Service** keeps the exact live instance configuration and
  commit; it is not the candidate deployment;
- a standard new deploy/redeploy uses the current image-backed service
  configuration and is forbidden between phases 2 and 3;
- no restart, deploy, UI edit or API write is allowed in this gap.

## 7. Inter-phase exact projection — fail closed

Immediately after phase 2 and immediately before phase 3, use the retained
key for GET-only capture. The capture must prove all facts at once:

```text
blueprint.id                 = exs-d95qo3q8qa3s73ea23p0
blueprint.autoSync           = false
service.id                   = srv-d95r3bfavr4c73aqsi4g
service.type                 = web_service | web
service.ownerId              = tea-d1m4lmali9vc73euvelg
service runtime/env          = image
service.autoDeploy           = false | no
service.imagePath            = <candidate_image_path>
service registry credential  = rgc-d9np7tajnfac73bi5ib0
service.healthCheckPath       = /api/health
service.preDeployCommand      = python -m app.platform_release predeploy-env
latest deploy.id             = <source_deploy_id>
latest deploy.status         = live
```

GET sources are `/v1/blueprints/{id}`, `/v1/services/{id}` and
`/v1/services/{id}/deploys?limit=1`. The receipt stores only the normalized
projection, timestamp and SHA-256; it never stores the API key or env values.
If the API does not expose any required association (especially registry
credential or preDeploy command), this is **not** treated as PASS by
assumption: STOP before phase 3 and obtain an observable exact proof or patch
the coordinator under a separately reviewed commit.

Also GET the names (not values) of `PLATFORM_ROLLBACK_AUTHORIZATION_B64` and
`PLATFORM_ROLLBACK_AUTHORIZATION_SHA256`. Both must be absent before a deploy
operation. No secret or environment value is printed.

## 8. Phase 3 — deploy

Required immediately before dispatch:

- §7 exact projection PASS;
- `master == 0e9e940` again;
- workflow and coordinator blobs unchanged;
- no concurrent deploy/workflow;
- `<source_deploy_id>` is still the unique latest live deploy.

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
| phase 2 failed; service remains exact source configuration and old deploy live | STOP; no retry; cleanup |
| phase 2 failed; service is exact §7 prepared image and old deploy live | STOP; preserve state; continuation needs fresh operator GO |
| phase 2 failed; service is partial, different or unreadable | terminal NO-GO; no deploy; preserve evidence; cleanup |
| phase 3 failed; no new deploy exists and old deploy remains live | STOP; no retry; capture env-key names; cleanup |
| new deploy is queued/building/pre-deploy/in-progress | wait read-only until terminal; no retry and no second deploy |
| new deploy is terminal failed | STOP; capture DB revision/receipt and config; no roster work |
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
2. operator revokes the temporary key in Render;
3. using the **same retained bytes**, exact
   `GET https://api.render.com/v1/users` must return 401;
4. delete GitHub environment secret `RENDER_API_KEY` and confirm secret list
   no longer contains it;
5. delete the local secure holder and confirm no plaintext copy remains;
6. leave the six non-secret repository variables in place as release
   identities; they are not credentials.

Only after cleanup PASS is the deploy window closed. The next package is
`minesweeper-feed-roster-packet-2026-08-05.md`.

## 11. GO boundary

One independent Claude delta-review covers this file against the exact
workflow/coordinator at `0e9e940`. After `GO`, operator grants one GO for the
three-dispatch route. Fresh review is required only if executable files,
immutable pins, dispatch inputs or failure semantics change — not for receipt
timestamps or newly discovered run/deploy IDs that satisfy this contract.

External irreversible acts remain operator-owned: creation/revocation of the
Render key, dispatches and any rollback decision. Codex orchestrates, verifies
receipts and owns final acceptance.
