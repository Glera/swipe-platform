# Platform Reliability R1-A — closure review R5 raw transcript

```text
# GO

**These exact commits may advance to disposable rehearsal integration. No remaining P1/P2.**
**This verdict authorizes neither merge nor production cutover.**

Nothing was edited, written, pushed, or deployed; both working trees are clean. All mutation was done in `mkdtemp` copies.

## Condition 1 — capitalized Mission variants: MET

`dd3d021` case-folds all three lexical predicates and adds `.` to the specifier separator class, plus re-export and dynamic-import edge extraction (`scripts/mission-architecture-guard.mjs:8,11,24-37,64`). I authored 12 mutants not in the shipped suite — **all caught**: `src/MISSION.ts`→`./island`, `src/MISSION/hidden.ts`, inbound `./MISSION`, `Mission-Service.mts`, `Mission_x.ts`, `export * from`, `export * as ns from`, `import('./Mission.mjs')`, template-literal dynamic import, `import type`, mission-file `export {x} from './island'`, capitalized `Mission` token in `island.ts`.

## Condition 2 — baseline anchor: MET, and the mutants are sound

`growth <= 0` forces a SHA-256 compare (`:83-88`). Both baseline files are also in `integrationLineBudgets`, so no baseline entry escapes. `island.ts` (budget 0) is byte-pinned. Caught in my run: `feed.ts` same-line swap, `feed.ts` 50-line same-count rewrite, `island.ts` net-negative; shipped suite covers the mirrors.

Decisive check: I reverted each of the **9** behaviours the fix introduces, one at a time, and re-ran the shipped suite — **all 9 detected**, unmutated it passes. No vacuous mutants.

## Condition 3 — Render capture: the prior finding does not survive

`service-fields` scopes itself to retrieval ("When you retrieve a service's details with the Render API…") and lists `autoDeploy` **boolean**, `branch`/`dockerfilePath` top-level, with no `serviceDetails` on the page — exactly what `platform-release-provider-capture.py:58-71` implements. The `"yes"`/`"no"` enum and `serviceDetails` nesting are the create/update request model, used correctly in the coordinator's PATCH body with legacy-tolerant acceptance (`coordinator:205,229-241,247`). And decisively: **no shape deviation can yield a false PASS** — identity checks on `True`/`False`, str+regex branch, two exact dockerfile paths, `unwrap` raising on non-dict; every deviation exits 2 with no receipt.

## Residuals (P3, none blocking)

1. **Render's docs contradict themselves** — `/reference/retrieve-service` and `/reference/list-services` still publish `autoDeploy` as the `"yes"`/`"no"` enum with `dockerfilePath` nested. If the live API matches the OpenAPI, the capture hard-fails `service_autodeploy_unreadable` every run and the gate is unpassable. Fail-closed, so rehearsal-entry is fine — but make **one authenticated GET against a disposable service the first rehearsal action**, not a cutover-window discovery.
2. **`autoDeployTrigger` is unobservable via the API.** `blueprint-spec` maps only `off`↔false and `commit`↔true; `checksPass` is unmapped, so it could in principle read as `mergeSafe`. Not fixable in-tool. Mitigated by `render.yaml` declaring `autoDeployTrigger: "off"` ×3 (test-pinned) — the attended step should confirm the dashboard reads **Off**, not *After CI Checks Pass*.
3. The anchor binds size, not content, in the positive-growth window: a wholesale rewrite of all 10,457 lines of `feed.ts` at net **+1** produces zero errors (verified).
4. Case-symmetric lexical residuals: camelCase `MissionService.ts`, and `.tsx`/`.TS`/`.js` are never scanned (`tsconfig` `include:["src"]` would compile a `.tsx`). Parity holds; unchanged by this commit.
5. **The backend guard is untouched and still case-sensitive** — `scripts/mission-architecture-guard.py:37-54`, so `app/Mission.py` escapes. Same class of gap as the one the client fix closes; flagging so condition (1) isn't recorded as repo-wide.

## One verification I could not perform

Backend tests were **not executed** — no interpreter here has `pytest`/`rfc8785`, and installing would mutate the environment. Static collection reconciles exactly to 29 (16 + 7 + 6), and `platform-release-image.yml:226` now runs the new capture file, so they are CI-enforced. Client suite was executed and passes.

Full report: `/Users/gleb/.claude/plans/focused-independent-r1-a-r5-lexical-scroll.md`

Sources: [Service fields](https://api-docs.render.com/reference/service-fields) · [Retrieve service](https://api-docs.render.com/reference/retrieve-service) · [List services](https://api-docs.render.com/reference/list-services) · [Blueprint spec](https://render.com/docs/blueprint-spec) · [Deploys](https://render.com/docs/deploys)
```
