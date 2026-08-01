# Platform Reliability R1-A — final review R3 raw transcript

```text
GO WITH CONDITIONS

This authorizes only the disposable Render-compatible rehearsal. It does not authorize merging PR #33/#15/#40, publishing an image, mutating Render, or cutover. (Note: `Write`/`ExitPlanMode` are not available in this context, so the receipt is delivered inline rather than to a plan file.)

## Identity and scope verified

All three local heads match exactly and all worktrees are clean: meta `ed4c290`, backend `6ee95ca`, client `747cef6`. Against `origin/master` the package is backend 14 commits / 23 files, client 3 commits / 4 files (guard only), meta 6 commits / 3 docs. No Stage 1 product code (`app/mission*` and `src/mission*` do not exist). `docs/specs/IMPLEMENTATION-STATUS.md` is untouched. Stage 1 backend PR #41 is an open draft titled "DO NOT MERGE"; the client Stage 1 branch has no PR.

## Evidence checked independently, not taken on assertion

- image run `30688574743`: `success`, `headSha 6ee95ca…`, event `pull_request`.
- PG run `30688574761`: `success`, `headSha 6ee95ca…`, **25/25 jobs success**; in-log `528 passed, 41 skipped`, `18 passed` (device flow), `1 passed` (durable authorization), and `post-acceptance alembic head verified: 0071_platform_release_receipts`.
- client run `30688335662`: `success`, `headSha 747cef6…`.
- red run `30688336208` at `4b84fa7`: `failure`, `1 failed, 527 passed, 41 skipped`, root cause `FileNotFoundError: [Errno 2] No such file or directory: 'alembic'`. Not rerun in place, not waived. `6ee95ca` fixes **production** code, not just the test — `app/platform_release.py:844` is now `[sys.executable, "-m", "alembic", …]`, pinned by `tests/test_platform_release.py:298`.
- meta head reproduced locally: `node --test 'scripts/*.test.mjs'` → **130 tests, 130 pass, 0 fail**; `docs-boundary-lint: clean`; `git diff --check` clean.

## R2 closure

1. **LKG pinning — closed.** `lkgCompatibility` is copied byte-for-byte from the pinned manifest's own `codeCompatibility` (`app/platform_release.py:455`) and must terminate at its target (`:456`). `lkgForwardCompatibility` is separately validated as exact-prefix-plus-candidate-target in manifest build (`:462-472`), the shared validator (`:631-659`), rollback preDeploy (`:1084`), `verify-applied-db` (`:1237`), coordinator (`scripts/platform-release-coordinator.py:229`, before the Render client at `:241`), and workflow (`platform-release-cutover.yml:116-126`). Widening fails with zero remote calls (`tests/test_platform_release_coordinator.py:291-320`).
2. **Real PG16 coverage — closed.** `tests/test_platform_release_postgres.py:201-387` builds a genuine second graph by copying `migrations/`, deleting `0071` and rewriting `script_location`; `assert lkg_fingerprint["targetRevision"] == predecessor` (`:236`) makes silent single-graph reuse impossible. Covers `predecessor_to_target`, exact replay, `predeploy_busy`, `deploy_identity_conflict`, forward-only rollback with no downgrade. Helper uses `python -m alembic` (`:53`).
3. **Cron exact-SHA path — partially closed.** See P2-2, P2-3.
4. **Mission guards — closed backend, partially closed client.** See P2-1. Backend mutants cover bare `mission.py`, nested `app/mission/`, unreviewed inbound, and `app.config`; the guard runs in the unfiltered `postgres-acceptance.yml`.
5. **Truthful CI wording — closed.** `postgres-acceptance.yml` has a bare `pull_request:` trigger; client `verify.yml` runs `npm run lint`, which now starts with `check:mission-architecture`.

## Findings

No P1. Nothing here blocks the disposable rehearsal.

**[P2-1] `feed-prototype/scripts/mission-architecture-guard.mjs:9-12` and `:15-29`** — `missionImport()` requires `mission` to be followed by end/`-`/`_`/`/`, so `./mission.mjs` does not match, and this repo's own convention is extensioned relative imports (30+ `./x.mjs` imports in `src/`). A bare `src/mission.mjs` is still treated as a reviewed domain module by `missionBasename`, but no import of it is checked; `src/island.ts`'s zero-budget regex `/\bmission(?:_|[A-Z])/` (`:118`) also misses it. Separately, `sourceImports()` collects only `ts.isImportDeclaration`, so `export … from './mission-x.mjs'` and dynamic `import('./mission-x.mjs')` are invisible in both directions — inbound edge and the domain's own `./island` ban. The Python guard has no equivalent hole. Failure: add `src/mission.mjs`, then `import { x } from './mission.mjs'` in `src/island.ts` → `scanMissionArchitecture()` returns `[]`, CI green. Fix: `mission(?:$|[-_/.])`, plus collect `ts.isExportDeclaration` and dynamic-import specifiers. Required before the guard is relied on as the Stage 1 merge gate — not before rehearsal.

**[P2-2] `swipe-backend/render.yaml:365,383`; `docs/specs/platform-release-r1a.md:110-114`; packet §10.9** — `Dockerfile.bake` is deleted and both crons are repointed at `./Dockerfile`. With Blueprint Auto Sync OFF, which is a hard merge precondition, Render keeps each cron's *stored* `dockerfilePath: ./Dockerfile.bake`. The pre-merge provider capture covers Auto Sync and the **web service's** Auto Deploy only; `autoDeploy` is unset for both crons in `render.yaml` and Render's blueprint default is on. Failure: merge PR #33 → push to master → a cron auto-deploys → build fails on a missing `./Dockerfile.bake`, and that contour silently keeps running a stale image. Fix: extend the pre-merge capture to both cron services' Auto Deploy, or sequence the Blueprint sync so their `dockerfilePath` moves before any master push.

**[P2-3] `swipe-backend/Dockerfile:15-20`; `.github/workflows/platform-release-image.yml:275-285`** — the CI step proves the fallback only when the caller supplies `--build-arg RENDER_GIT_COMMIT=…`. Render documents `RENDER_GIT_COMMIT` as available at build time, and documents translating *service-configured* env vars into Docker build args, but does not document translating its own default env vars. R2's literal requirement holds — the hex/length check at `Dockerfile:37-43` makes an empty or non-hex value fail the build, never an invented SHA — but the exact-source build path for the two surviving crons is unproven against the provider and sits outside the rehearsal scope in `docs/specs/platform-release-r1a.md:127` and packet §10.7. Fix: add one real cron source-build to the rehearsal or cutover checklist before their Dockerfile path is switched.

**[P3-1]** `swipe-backend/README.md:99-108` and `docs/OVERVIEW.md:102-106` still describe `Dockerfile.bake`, `scripts/start-bake-runtime.sh` and `GITHUB_TOKEN` as live infrastructure this PR deletes; `tests/test_platform_release.py:355-364` guards only `render.yaml` and the Dockerfile.

**[P3-2]** `.github/workflows/platform-release-cutover.yml:106-131` checks status/conclusion/head_sha for both build runs but, unlike `platform-release-image.yml:170`, never asserts `.name == "Platform release image"`.

**[P3-3]** Packet §13 row 4 (line 369) says the guard runs "unconditionally on every PR" for "acceptance/release-image"; `platform-release-image.yml:4-14` is path-filtered. The claim survives via the unfiltered `postgres-acceptance.yml`, but the sentence overstates the release-image workflow.

**[P3-4]** `app/main.py:111` keeps `island.bake_runtime` in `/api/health`; in the compact image it will read `{"state":"local"}` rather than the P5-era `ready`. `ok`/`service` are unchanged so the coordinator smoke (`scripts/platform-release-coordinator.py:187-191`) is unaffected, but any monitor keyed on that field flips at cutover — record the expected post-cutover payload.

**[P3-5]** `tests/test_platform_release_postgres.py:363` reaches forward-only rollback by calling `_run_rollback_predeploy` directly, so the two-graph case never passes through `run_predeploy_env` → `_manifest_from_env`; the LKG image verifying its *own* local migration bytes is covered only in the single-graph test at `:191`. The rehearsal is the real proof.

**[P3-6]** The compact image drops the swipe-ugc checkout and `UGC_REPO_PATH`, which `app/runtime_release_bootstrap.py:355-366` needs for the trusted probe bundle. That CLI is gated off, but the path needs re-planning before runtime-release registration resumes.

## Preserved invariants confirmed

Stage 0 is intact: the built-image smoke asserts the six legacy routes absent and the six protective routes present, all runner flags off, protective and closed-delivery on, and every runner task `None`; `tests/test_island_social.py` **adds** a takedown-before-sign resolver test and weakens nothing. One Alembic head `0071`, confirmed both by CI's `get_current_head()` assertion and by `migration_fingerprint`'s `migration_heads_invalid` gate. `0071` is append-only by trigger and refuses a nonempty downgrade, proven physically. The destructive durable-authorization acceptance now runs on its own database, so the receipt guard was isolated rather than weakened. No image was published, no Render setting changed, no deploy triggered, and no production database command run.
```
