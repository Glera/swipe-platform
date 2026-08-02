# Platform Reliability R1-A — disposable rehearsal runtime receipt

Evidence window: 2026-08-01 through 2026-08-02 UTC.

Status: **corrective candidate-v7 rehearsal PASS; cleanup PASS; independent
acceptance GO**. This receipt does not authorize production cutover, a
production mutation, or any Stage 1 merge/rollout.

## Immutable identities retained for cutover

| Role | Frozen ref / SHA | Build run | OCI index | Manifest SHA-256 | Actions artifact |
| --- | --- | ---: | --- | --- | --- |
| baseline-v4 | `codex/r1a-rehearsal-baseline-v4-20260801` / `8cb8239e04bf30f54f7fe1f85758da8f4fe7caac` | `30712414323` | `sha256:2230743aa443d481a1e5ee7fff1a7830403ebd94ca8a3464b497d879e722264b` | `ab33c178ca0671efc5ee5054d2971b898e217b9deca0624ed0b24e8bcc103bc3` | `8822315596`, expires `2026-10-30` |
| candidate-v7 | `codex/r1a-rehearsal-candidate-v7-20260801` / `9d3dc995b5f2976acbf18d3bac62ad3fc138f022` | `30712534528` | `sha256:837612eda640e037f6d5322dc57c5ca9706a665ea8a9a38d6c986a5b54cdd2fb` | `5cd2d48fa4d87944d6cca124f6bddc238b738f1ef2c4285f13ce2c708c1496e0` | `8822349919`, expires `2026-10-30` |

Neither image publication was rerun. These exact retained package versions
and sidecars are the only intentional rehearsal residue.

## Corrective disposable authority

- workspace: `tea-d9n4a3lbedkc73aiovr0`;
- Blueprint: `exs-d9neefrncjis73a0r0lg`;
- web: `srv-d9nef7e417fc73d6qfqg`;
- crons: `crn-d9neeiu417fc73d6p9fg`, `crn-d9neeiu417fc73d6p9g0`;
- PostgreSQL: `dpg-d9neeiu417fc73d6p9j0-a`;
- registry credential: `rgc-d9negffqj5pc73endqpg`;
- Blueprint source: `ccf690d106d7dd1f1d06279972a1851117287053`,
  `render.r1a-rehearsal.yaml` blob
  `809aa531176f44890f72dfa4953ee36148113629`, file SHA-256
  `4361c8c826f6868de1d9bd34b2050fc0af1d05e2fa1974f2c832e8790b2c6710`.

Render assigned the physical database name
`swipe_r1a_rehearsal_rlaj`, not the requested literal suffix-free name. The
release authority therefore used the separately fixed and independently
verified identity `PLATFORM_DATABASE_IDENTITY=r1a-rehearsal-20260801`; no
receipt equates that authority identity with Render's generated physical name.

## Executed corrective matrix

| Proof | Exact authority | Result |
| --- | --- | --- |
| fail-closed expired credential | run `30736707325`, job `91466681756` | expected operational failure `render_api_failed`; log SHA-256 `00f12aea39d1fa7efaed5c9c8362d40f946efdb11674e95cadb83f64f6ad11b8`; source, deploy and environment unchanged |
| prepare candidate-v7 source | run `30736957896` | PASS; receipt SHA-256 `46c943971e1276708c3fcac4f73484fa0a269ac3d7ce708f53645e21fb7fe18d`; source only changed, no deploy |
| deploy exact candidate-v7 | run `30737041825`; deploy `dep-d9nencdaeets73bpdta0` | PASS; coordinator receipt SHA-256 `7fc9875e2b320a6109ecc72d78fabef3193b5f09d27913074cd66f8402ea14e8` |
| candidate verification | Render job `job-d9nenmlaeets73bpeir0` | PASS; DB `0070_published_test_delivery` → `0071_platform_release_receipts`; stored receipt SHA-256 `842abbc13a54edc61f7e2ba7896ded3f7d2980b9d670bb54df69df43d27a4843` |
| exact receipt replay | job `job-d9nepctaeets73bphqt0` | PASS; identical stored receipt; log SHA-256 `5ecc439c876bc5d387122e42cd426ec34bb9b3e6f4d0a795e038d6d4be234ff5` |
| compact-image protective smoke | job `job-d9neq9vqj5pc73eo1kfg` | PASS; in-image import/assert probe verified protective routes, flags and runner isolation |
| stale source CAS | run `30737336650`, job `91468452323` | expected `source_cas_mismatch`; log SHA-256 `161aa08c1f61642ce2330e07cc6d0bf549fdf677336d33fde47cf154f1b20d8f`; no provider/environment/deploy change |
| conflicting receipt binding | job `job-d9netalaeets73bppj6g` | expected `deploy_identity_conflict`; log SHA-256 `f027f6ad7d5a8fe961d0338bdfd97a6fed1c2158c23be77ca364714f2240240c`; temporary two-key environment mutation restored exactly |
| post-conflict DB verification | job `job-d9netth42hec73ffua00` | PASS; DB still `0071`; stored receipt unchanged; log SHA-256 `a977ed7b51d94f186f7e6fb31eff03653eff7fdc8b70da3f8034bc0f60048320` |
| forward-only rollback | run `30737537372`; deploy `dep-d9neuhfqj5pc73eoaiv0` | PASS to exact baseline-v4; coordinator receipt SHA-256 `f03e9497e27f0d4ac1ac7f5c708d3f45f6c8a1f01511646c237507b7f8ab277a` |
| rollback verification | job `job-d9neurfqj5pc73eobau0` | PASS; DB remained `0071`; log SHA-256 `14ca5d5db5028fc713d1aac790295605a158bf1bf4a043023b2a7a59c5fcd34f`; inner receipt SHA-256 `3f7f0df52a903fdb801f59e37356c7b0b8bb82d4d1f3e9b1200436e24975c490` |

Candidate and rollback health bodies are byte-identical, include `ok=true` and
`island.bake_runtime.state=local`, and have SHA-256
`3d5f2a2d1c514ff30c67eb1b1adda17bd1259eac126b882102d6bcd01e8b5036`.

The first protective-smoke attempt, job `job-d9nepse417fc73d7e72g`, failed
because the development helper script is intentionally absent from the compact
runtime image. It performed no mutation. The corrected successful job used an
inline probe equivalent to the CI smoke. Render returned no log body for that
short successful job, so the bounded evidence is its succeeded status plus
the exact saved `startCommand`; this limitation is explicit rather than
represented as a nonexistent log receipt.

## Cleanup and credential revocation

- the GitHub `production` rehearsal environment was deleted (DELETE 204, then
  GET 404); repository-level `RENDER_*` secrets and variables remain absent;
- web was suspended and deleted; both crons, PostgreSQL, Blueprint connection
  and registry credential were deleted; every direct GET returned 404 and all
  owner-scoped inventories were empty;
- the disposable workspace was deleted; its direct owner GET is 404 and the
  visible owner inventory contains only the production owner;
- both temporary GitHub PATs (`5092363019`, `5090043869`) were revoked; both
  HTTP token probes return 401; browser-absence receipt SHA-256
  `1049668a09d6a08ec84b6ec13a9cd454171f2ae4e354a04cdca45ac4fa8f0eab`,
  HTTP-rejection receipt SHA-256
  `2d5b433f1402c761c96ce13f73577d2fd30935cb724f70282a88230c2a92dab2`;
- Render API key `r1a-rehearsal-20260801-runtime3` was revoked; API probe
  returns 401; browser-absence receipt SHA-256
  `8e35cdba679ab95d70dc06452b0176dfcb8db36d68de4291cd5ecc5d4f31a85b`,
  HTTP-rejection receipt SHA-256
  `4904629d82401aa8221c70c8ddaef0dc544940519e9798c010fde439ee577c37`;
- the exact local files containing those credentials were deleted.

The first rehearsal's displayed charge was USD 0.02. The corrective resources
ran for less than one hour and are estimated below USD 0.01; cumulative spend
is therefore estimated below USD 0.03, well inside the approved USD 3 cap. No
claim of a provider-finalized exact corrective charge is made.

## Production non-target proof

The production provider projection is byte-equal before and after the
corrective window after removing observation time; normalized SHA-256:
`6df8e2f1d819fc3fcee30e01f446ff87bcc0ec9ef2256a92e65fb92176ebc2e8`.
The production database projection is also byte-equal; normalized SHA-256:
`a62df65f1f45f8284425bb365cd251382f82cc5187b4850d49a13e224d296b20`.

The earlier rehearsal window did observe a concurrent production database
credential/ingress delta. It remains explicitly attributed and independently
disposed in
`platform-reliability-r1a-concurrent-r1-db-disposition-20260801.md`; this
corrective run supplies the stronger independent before/after proof without
rewriting that history.

## Isolation and remaining gate

Stage 1 backend PR #41 remains draft `DO NOT MERGE` at
`2029867495578310dda92c170a2e07c71203eefa`. The client branch
`claude/stage1-p4-mission-client` remains at
`43f92693b55057d4c22652cbd81dad4ab67f0171`. No Stage 1 merge or rollout was
performed. Generative-feed scope was not changed.

Independent Claude review of the exact committed evidence chain returned
**GO**, with no P1/P2. Its raw verdict and disposition are recorded in
`platform-reliability-r1a-rehearsal-final-review-r2-raw.md` and
`platform-reliability-r1a-rehearsal-final-review-r2-disposition.md`.
Rehearsal PASS still does not authorize production; production needs a fresh
provider capture, a separately reviewed successor and a new exact operator GO.
