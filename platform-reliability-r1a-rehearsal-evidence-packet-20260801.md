# Platform Reliability R1-A — final disposable rehearsal evidence packet

Evidence window: 2026-08-01 through 2026-08-02 UTC.

Status: **corrective execution matrix PASS; cleanup PASS; independent final
acceptance pending**. This packet is evidence only. It is not merge, deploy,
provider-mutation, production-cutover or Stage 1 authority.

Execution contract:
`platform-reliability-r1a-disposable-rehearsal-runbook.md`. Runtime receipt:
`platform-reliability-r1a-rehearsal-runtime-receipt-20260801.md`. Earlier
incomplete execution and its accepted correction are retained in
`platform-reliability-r1a-rehearsal-final-audit-r1-disposition.md`.

## 1. Operator authority and boundary

The operator authorized a disposable rehearsal up to USD 3 and accepted the
temporary account-wide Render API-key scope only for that disposable
workspace. Production owner `tea-d1m4lmali9vc73euvelg` and its Blueprint, web,
cron and PostgreSQL IDs were denylisted by the executable rehearsal authority.

The first rehearsal's displayed cost was USD 0.02. Corrective resources ran
for less than one hour and are estimated below USD 0.01. Cumulative spend is
therefore estimated below USD 0.03; no provider-finalized exact corrective
charge is claimed.

## 2. Immutable reviewed inputs

| Role | Frozen ref | Exact SHA / digest |
| --- | --- | --- |
| source-build baseline | `codex/r1a-rehearsal-baseline-v2-20260801` | `0add5f3fbd2fa60a3a0a3ae2ba6f20ed333dd725` |
| image baseline-v4 | `codex/r1a-rehearsal-baseline-v4-20260801` | `8cb8239e04bf30f54f7fe1f85758da8f4fe7caac` / `sha256:2230743aa443d481a1e5ee7fff1a7830403ebd94ca8a3464b497d879e722264b` |
| image candidate-v7 | `codex/r1a-rehearsal-candidate-v7-20260801` | `9d3dc995b5f2976acbf18d3bac62ad3fc138f022` / `sha256:837612eda640e037f6d5322dc57c5ca9706a665ea8a9a38d6c986a5b54cdd2fb` |
| client guard | `codex/r1a-client-guard-20260801` | `e804c73d41f5e94401caa3bb5acb92f691866101` |
| registration sentinel | `codex/r1a-workflow-registration` | `5ef857f493016501a0eaa733d174eb39ba221d2a` |
| corrective Blueprint | `codex/r1a-rehearsal-blueprint-v2-20260801` | `ccf690d106d7dd1f1d06279972a1851117287053` |

Blueprint path `render.r1a-rehearsal.yaml`, blob
`809aa531176f44890f72dfa4953ee36148113629`, file SHA-256
`4361c8c826f6868de1d9bd34b2050fc0af1d05e2fa1974f2c832e8790b2c6710`.

Retained build authorities:

| Role | Run | Manifest SHA-256 | Sidecar artifact / expiry |
| --- | ---: | --- | --- |
| baseline-v4 | `30712414323` | `ab33c178ca0671efc5ee5054d2971b898e217b9deca0624ed0b24e8bcc103bc3` | `8822315596` / `2026-10-30` |
| candidate-v7 | `30712534528` | `5cd2d48fa4d87944d6cca124f6bddc238b738f1ef2c4285f13ce2c708c1496e0` | `8822349919` / `2026-10-30` |

Both builds are successful single attempts. No publication rerun occurred.

## 3. Corrective disposable provider set

| Resource | Exact identity |
| --- | --- |
| workspace | `tea-d9n4a3lbedkc73aiovr0` |
| Blueprint | `exs-d9neefrncjis73a0r0lg` |
| web | `srv-d9nef7e417fc73d6qfqg` |
| sequencing cron | `crn-d9neeiu417fc73d6p9fg` |
| materialize cron | `crn-d9neeiu417fc73d6p9g0` |
| PostgreSQL | `dpg-d9neeiu417fc73d6p9j0-a` |
| registry credential | `rgc-d9negffqj5pc73endqpg` |

Render generated database name `swipe_r1a_rehearsal_rlaj`. The independently
fixed release-authority identity was
`PLATFORM_DATABASE_IDENTITY=r1a-rehearsal-20260801`; it did not depend on the
provider-generated suffix. Currency, production data and Stage 1 resources
were outside this rehearsal.

The temporary GitHub `production` environment admitted only branch
`codex/r1a-rehearsal-candidate-v7-20260801`, exactly one secret
`RENDER_API_KEY`, and six bounded variables:
`RENDER_SERVICE_ID`, `RENDER_BLUEPRINT_ID`, `RENDER_OWNER_ID`,
`RENDER_REGISTRY_CREDENTIAL_ID`, `PLATFORM_DATABASE_IDENTITY` and
`PLATFORM_RELEASE_AUTHORITY_SCOPE=rehearsal`. Repository-level `RENDER_*`
secret and variable names remained absent.

## 4. Corrective execution matrix

| Step | Authority | Evidence and result |
| --- | --- | --- |
| expired-PAT fail-closed probe | run `30736707325`, job `91466681756` | `render_api_failed`; full log SHA-256 `00f12aea39d1fa7efaed5c9c8362d40f946efdb11674e95cadb83f64f6ad11b8`; source/deploy/env unchanged |
| prepare exact candidate-v7 | run `30736957896`, job `91467387041` | PASS; receipt SHA-256 `46c943971e1276708c3fcac4f73484fa0a269ac3d7ce708f53645e21fb7fe18d`; no deploy |
| candidate-v7 deploy | run `30737041825`, job `91467618071` | PASS; deploy `dep-d9nencdaeets73bpdta0`; receipt SHA-256 `7fc9875e2b320a6109ecc72d78fabef3193b5f09d27913074cd66f8402ea14e8` |
| candidate verification | job `job-d9nenmlaeets73bpeir0` | PASS; DB advanced `0070` → `0071`; stored receipt SHA-256 `842abbc13a54edc61f7e2ba7896ded3f7d2980b9d670bb54df69df43d27a4843` |
| exact replay | job `job-d9nepctaeets73bphqt0` | PASS; identical receipt; log SHA-256 `5ecc439c876bc5d387122e42cd426ec34bb9b3e6f4d0a795e038d6d4be234ff5` |
| protective runtime probe | job `job-d9neq9vqj5pc73eo1kfg` | PASS; exact saved command asserted protective routers, gates and runners inside compact image |
| stale source CAS | run `30737336650`, job `91468452323` | expected `source_cas_mismatch`; log SHA-256 `161aa08c1f61642ce2330e07cc6d0bf549fdf677336d33fde47cf154f1b20d8f`; no mutation |
| conflicting receipt binding | job `job-d9netalaeets73bppj6g` | expected `deploy_identity_conflict`; log SHA-256 `f027f6ad7d5a8fe961d0338bdfd97a6fed1c2158c23be77ca364714f2240240c` |
| post-conflict DB check | job `job-d9netth42hec73ffua00` | PASS; schema/receipt unchanged; log SHA-256 `a977ed7b51d94f186f7e6fb31eff03653eff7fdc8b70da3f8034bc0f60048320` |
| forward-only rollback | run `30737537372`, job `91468973815` | PASS to exact baseline-v4, deploy `dep-d9neuhfqj5pc73eoaiv0`; receipt SHA-256 `f03e9497e27f0d4ac1ac7f5c708d3f45f6c8a1f01511646c237507b7f8ab277a` |
| rollback verification | job `job-d9neurfqj5pc73eobau0` | PASS; DB remained `0071`; log SHA-256 `14ca5d5db5028fc713d1aac790295605a158bf1bf4a043023b2a7a59c5fcd34f`; inner receipt `3f7f0df52a903fdb801f59e37356c7b0b8bb82d4d1f3e9b1200436e24975c490` |

Candidate and rollback health payloads are byte-identical at SHA-256
`3d5f2a2d1c514ff30c67eb1b1adda17bd1259eac126b882102d6bcd01e8b5036`.
They contain `ok=true`, `service=swipe-backend` and
`island.bake_runtime.state=local`.

The first protective probe tried to invoke the development-only helper script,
which the compact image intentionally excludes, and failed without mutation.
The corrected inline probe passed. Render returned no log body for that short
successful job; its succeeded status and exact saved command are the bounded
evidence. This is an explicit evidence limitation, not a fabricated log hash.

## 5. Negative and restoration proofs

The conflicting manifest differed only at `.sources.feed.sha`; after removing
that field, authoritative and conflicting objects were byte-equal at SHA-256
`4a80454e4018ae5a46ac4f474fa6247cd23558c2bc2fcdd252a473639b834ce2`.
The conflict manifest SHA-256 was
`53766a4fb26aca20ebc763c7a96d92fe79e59a800ce0829211868f3b161d1a85`.

Only the manifest-bytes and manifest-digest environment keys were changed for
the conflict job. Both were restored exactly; the seven-key environment digest
returned to
`57bf394e585284b88f9cd7413b6bc675f1bc04153c4591c180913ead7de91b9a`.
The current deploy and database receipt did not change.

The expired PAT incident is classified as an operational credential-expiry
test. It demonstrated fail-closed behavior before provider mutation; it is not
represented as a product-code failure or omitted from the chain.

## 6. Cleanup and revocation

| Action | Proof |
| --- | --- |
| delete GitHub rehearsal environment | DELETE 204; subsequent GET 404; HTTP receipt SHA-256 `3cf79e14ca18ab73fb5eb5ab5e0e2dea146806467410eb117ea70ca5f03a5e62` |
| keep repository authority absent | secret inventory SHA-256 `0bcafa2828bac6a4bc3f93da8c93ca39daf8351b61e1f8b50a799e6e1df74c6a`; variable inventory `8fb236d9855d43b214ea37db3296df40b54f11ee84dd9c96394813c4fbdf6423` |
| delete web/crons/database/Blueprint/registry credential | every DELETE/disconnect returned 204; every direct GET returned 404; owner inventories empty |
| delete disposable workspace | owner GET 404; owners inventory contains only production; inventory SHA-256 `9d6b8d0f8b7ab264654ee3f3652fb762b21795fda14dac583865f5949b4954ec` |
| revoke both GitHub PATs | PAT IDs `5092363019`, `5090043869` absent in UI; both HTTP probes 401; receipt SHA-256 `2d5b433f1402c761c96ce13f73577d2fd30935cb724f70282a88230c2a92dab2` |
| revoke Render API key | `r1a-rehearsal-20260801-runtime3` absent in UI; API probe 401; receipt SHA-256 `4904629d82401aa8221c70c8ddaef0dc544940519e9798c010fde439ee577c37` |
| remove local credential material | exact permission-restricted PAT and Render-key files unlinked after provider-side revocation |

Only retained baseline-v4 and candidate-v7 GHCR versions plus their Actions
sidecars remain intentionally.

## 7. Production non-target proof

Corrective-window production provider projections are byte-equal after
removing observation time, normalized SHA-256
`6df8e2f1d819fc3fcee30e01f446ff87bcc0ec9ef2256a92e65fb92176ebc2e8`.
Corrective-window production database projections are also byte-equal,
normalized SHA-256
`a62df65f1f45f8284425bb365cd251382f82cc5187b4850d49a13e224d296b20`.

The earlier workspace observed a real concurrent production credential and
ingress change owned by the separate Platform Reliability R1 Gate A/B window.
Its exact attribution and independent disposition remain in
`platform-reliability-r1a-concurrent-r1-db-disposition-20260801.md`. This
packet neither erases that history nor uses it as an exception for the
corrective run.

## 8. Scope-isolation proof

- Stage 1 backend PR #41 remains draft `DO NOT MERGE` at
  `2029867495578310dda92c170a2e07c71203eefa`;
- Stage 1 client branch `claude/stage1-p4-mission-client` remains at
  `43f92693b55057d4c22652cbd81dad4ab67f0171`;
- no Stage 1 merge, deployment or production mutation occurred;
- generative-feed scope was unchanged.

These heads must be refreshed read-only before final publication of this
packet; any drift is reported, not silently normalized.

## 9. Completion audit

| Gate | Result |
| --- | --- |
| exact candidate-v7 deployed and verified | PASS |
| exact baseline-v4 forward-only rollback; DB remains at `0071` | PASS |
| replay, stale-CAS and conflicting-binding behavior | PASS |
| disposable provider and GitHub authorities removed | PASS |
| temporary credentials revoked and rejected | PASS |
| corrective production provider/database projections unchanged | PASS |
| earlier concurrent-R1 delta explicitly disposed | PASS |
| Stage 1 and generative-feed boundaries preserved | PASS |
| independent reviewer verdict on this exact packet | PENDING |

Final rehearsal verdict remains pending only on the independent review above.
Even a GO does not authorize production cutover.

## 10. Required production handoff after independent GO

The cutover packet must separately pin:

1. a reviewed successor PR based on the current backend default branch;
2. the retained build runs, image digests and manifest hashes above;
3. a fresh production provider and database inventory;
4. action-time proof that Blueprint Auto Sync and all deployable services'
   Auto Deploy are Off;
5. a production registry-credential ID explicitly pinned in reviewed code;
6. exact prepare-source, deploy, verify and forward-only rollback actions, each
   with its own stop point and receipt;
7. current production and Stage 1 heads captured immediately before mutation;
8. a new operator GO naming the exact packet.

Historical PR #33 is audit history and must not be reused as the merge vehicle.
No reviewed frozen ref is force-pushed. The retained Actions sidecars expire
on 2026-10-30; a later cutover requires a newly reviewed pair.
