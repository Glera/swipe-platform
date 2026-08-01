# Platform Reliability R1-A — closure review R4 raw transcript

```text
# GO WITH CONDITIONS

No P1. Nothing blocks advancing these exact commits to disposable rehearsal integration.

**This verdict authorizes neither merge nor production cutover** — not image publication, not any Render mutation, not any production database command.

## Reproduced locally
- Backend: `pytest` over the three release suites → **29 passed** (matches reported evidence).
- Client: `mission-architecture-guard.mjs` → PASS receipt; `check-mission-architecture-mutants.mjs` → PASS.
- `render.yaml` parses; both worktrees clean; `git diff --check` clean.

## Verified clean
- **(2) docs** — `Dockerfile:51` CMD is uvicorn-only with no `alembic`; `render.yaml:9,13,21,24` back the `basic-256mb`/PG16/`starter`/`preDeployCommand` claims; no island router mounted in `app/main.py`.
- **(4) Blueprint syntax** — parent `6ee95ca:render.yaml` declared *no* auto-deploy control at all (Render default on). The commit adds `autoDeployTrigger: "off"` at service level on all three, quoted so it parses as the string `off`. Strict strengthening.
- **(5) build-run identity** — both identity blocks are in one `run:` step (`platform-release-cutover.yml:101-139`), so `run_json` is in scope for the `workflow_id` compare at `:138`. `.name` matches `platform-release-image.yml:1` with no `run-name:` override. `.event = workflow_dispatch` is correct: sidecars publish only under `workflow_dispatch && inputs.publish` (`:239,257`).
- **(6) no weakening** — no `app/` product code touched, workflow assertions and tests strictly additive, guard changes strictly widen detection.
- **(3) GET-only** — confirmed; `tests/test_platform_release_provider_capture.py:41-42` asserts method/body on every call. R3's P2-2, P2-3, P3-1, P3-2, P3-4, P3-6 are closed.

## Findings

**P2-1 — capitalized Mission modules bypass the entire client guard.** `mission-architecture-guard.mjs:8,11,64` stay case-sensitive; only the `src/island.ts` token regex at `:137` gained `/i`. Reproduced in tmp sandboxes, all returning `[]`: `src/Mission.ts` + `import from './Mission'`; `src/MissionService.ts` + import; `src/Mission/hidden.ts`; `src/Mission.ts` containing `import from './island'`. Lowercase control `src/mission-x.ts` correctly errors. Escapes the outside-contour check, inbound-edge check, both line budgets, and the `./island` authority ban.

**P2-2 — the SHA anchor binds only at exactly `growth === 0`** (`:83-88`). Net-negative edits escape both the budget (`:80`) and the anchor. `integrationLineBudgets["src/island.ts"]` is `0`, reading as frozen, but `splice(10, 301, ...300 arbitrary lines)` → `[]`. `src/feed.ts` delete 200 / insert 150 → `[]`.

**P2-3 — the capture's response-shape model is unverified and contradicted by this repo.** `platform-release-provider-capture.py:58-62` accepts boolean-only `autoDeploy`; `:67-71` reads a top-level `dockerfilePath`; `docs/specs/platform-release-r1a.md:160-163` asserts both as documented. But `platform-release-coordinator.py:205` accepts `not in (False, "no")` from the *same* `GET /services/{id}`, `:229` sends `"autoDeploy": "no"`, and `:235` PATCHes docker settings under nested `serviceDetails`. Both branches are fail-closed, so no false PASS — but the gate is likely unpassable against the real API.

**P3-1** — capture tests miss `service_autodeploy_unreadable`, `blueprint_autosync_unreadable`, name/type/branch/path-invalid, and `main()` entirely. **P3-2** — after `prepare-source` switches the web service to `env: image` (`coordinator.py:227-244`), the capture fails closed on absent `branch`/`dockerfilePath`. **P3-3** — `require('./mission.mjs')` not collected (low reachability; `"type": "module"`). **P3-4** — `app/render_release_client.py` now ships in the runtime image via `Dockerfile:32`, though only `scripts/` import it.

Full write-up with conditions is in the plan file.
```
