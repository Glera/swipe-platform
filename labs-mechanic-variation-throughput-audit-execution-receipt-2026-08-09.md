# Labs mechanic-variation throughput audit — execution receipt

Date: 2026-08-09

Status: **COMPLETE — `FIX MUTATION PIPELINE`**

Authority: `LABS-MECHANIC-VARIATION-THROUGHPUT-AUDIT-HANDOFF-2026-08-09.md`.
Frozen inputs: `labs-mechanic-variation-throughput-audit-pre-start-brief-2026-08-09.md`
at `dfdb6682a8fb83511a303c2c88b52735b19c439c`.
Durable ticket: `Glera/p4g-workspace-meta#76`.

This receipt closes the bounded phase `-1` throughput audit. It does not
authorize Family A, production publication, catalog/roster/feed activation,
deployment, migration, secret use, or a new experimentation platform.

## 1. Telemetry spike and selected baseline

- Spike window: `2026-08-09T17:51:36Z` to `2026-08-09T18:03:18Z`;
  hard cutoff was `2026-08-09T19:51:36Z`.
- Result: **YES — Two Dots selected**. Sorting fallback was not entered.
- Exact pinned source: `playables@cb581e71e57f60822247d8ac2077e73adff86e88`;
  repository tree `b9bc5870ee349bf054b632edd0d22d477f6271f7`;
  `orthogonal-link-v1` subtree
  `e8173eb409361e4bb2c7667c39dba2292fffb03f`.
- Reusable candidate-local trace harness:
  `playables@7d02ed189274e54c4d2bd6d32b1c2ebe777b2c52`, remote branch
  `codex/labs-variation-audit-20260809`.
- Same trace schema, real-pointer path, SWIPE build and strict technical
  profile were used for the control and every changed candidate. No backend,
  DB or shared-runtime code was required for trace closure.

The first capture rework was fail-closed: the SWIPE wrapper referenced the
exact external `payload.js`, so the local evidence server was restricted to
the runtime-manifest file set rather than weakening artifact verification.

## 2. Candidate results and exact identities

| candidate | role | exact source commit / tree | runtime digest | trace SHA-256 | constructive result | result |
| --- | --- | --- | --- | --- | --- | --- |
| `TD-B0` | unchanged baseline | `cb581e71…` / `b9bc5870…` | `sha256:37da6de7f3f0cd4f7ace784d23e90ab3b2130be7e445931e69585679f24e04f5` | `d0478ed61b31057082d76666e9f2f7c803d924e3657856cb9890a91132cc5583` | 6 manual actions, no rejects/autoplay/page errors, terminal `won` | valid control |
| `TD-C1` | config control | `64e10c77…` / `d9313278…` | `sha256:88b52a81285957cf821cf7a6b2e2ba37a10c2d8f676fb7621f808b4499061edf` | `a4448a23fb47c450ed018ac55abe490e7ed01c5cc3bfc749632fe328dcfee005` | same six paths, boards and objective deltas as baseline; moves exactly `+2` throughout | valid mutation |
| `TD-O2` | Level-2 `obstacle` | `ccfa9869…` / `b95c8c11…` | `sha256:1f00d79ac06adc87413501f9807bafdcca45d51b6030ec2a424644e9d957bf77` | `6914b209808fb4c68612b225f3eb598edc28f3e0ab6d4740c4a737a32fed4ce2` | opener changes to `[[0,1],[0,2],[1,2]]`; lock `1→0` before `[2,2]` is used; terminal `won` | valid mutation |
| `TD-G2` | Level-2 `additional_goal` | `a87e81b0…` / `ef6356d4…` | `sha256:504ae4b8d313c1effaac417f8d7f068839ac90b16caedf695373a367e6d4c894` | `c1ac8518147433d8ea2a421c3fada6cd838e6e871e910392dbe39fc41b70c959` | opener changes to `[[0,0],[0,1],[0,2]]`; target `1→0`; terminal `won` | valid mutation |
| `TD-R2` | Level-2 `delayed_reward` | `243b7c1d…` / `5aa45f75…` | `sha256:69bf41e902ad7ff9d19b3c224a5d1250c3c1e7bede7753670dd5802af9852ba2` | `6699c326e400a966e4f3a360e83c434db2deb265e74e13f7815d4b413e844218` | action 1 creates entity `7`; action 2 moves the same entity `[1,2]→[3,2]`; action 3 alone emits a four-cell mixed-color row reward and consumes it; terminal `won` | valid mutation |

Full remote candidate branches:

- config: `codex/labs-variation-config-20260809` at
  `67cb2681466f6b84d11542c05e9115fa9ca28a10` (artifact source is the
  preceding product commit `64e10c77…` recorded in its trace);
- obstacle: `codex/labs-variation-obstacle-20260809` at
  `ccfa98692a1512790ee9b199047f5b7e1c0b789d`;
- additional goal: `codex/labs-variation-additional-goal-20260809` at
  `a87e81b0c870b1aeaaaf8d3bb76e9742d874526b`;
- delayed reward: `codex/labs-variation-delayed-reward-20260809` at
  `243b7c1d94d79695abe8aa3bf8afa28eac8db861`.

All three Level-2 candidates satisfy the minimum feel contract: the new
entity is visible, interaction has immediate feedback, and subgoal completion
has explicit feedback. Their focused, strict engine/solver, real-pointer
browser, SWIPE build and before/after visual-proof checks all completed
successfully. Changed candidates had zero capture rejects, zero autoplay
actions and no page errors.

## 3. Candidate-only sandbox materialization

Existing production paths were not used. Materialization is confined to two
new physical marker-gated roots:

- UGC artifacts:
  `swipe-ugc/.local-experiments/mechanic-variation-audit-20260809-sandbox`;
- Generator records:
  `swipe-generator/.data/mechanic-variation-audit-20260809-sandbox`.

Marker SHA-256 values are respectively
`3a3b590b82a1e82956a4e00b81720c62dd30d42a4df4162375871009a92bcc83`
and
`388e973412d68e08d9e9daf61aae6664d4c58614a6c9d4bbbaaa29d8063a4548`.
The roots contain 26 UGC files and 21 Generator records.

| ordinal | prototype id | research-pack digest |
| --- | --- | --- |
| 1 | `two-dots-baseline-control-340b65f002a0` | `sha256:76a3f1ce26e335cb79e73c96690dc1e5dd804d41dbece5a8decf00a481086d72` |
| 2 | `two-dots-config-control-a456cb229878` | `sha256:94a31ddcb829565dd107cb87dba45d74a0ed2d072ee2c198517200fce48e3c2f` |
| 3 | `two-dots-obstacle-86d563fb421f` | `sha256:a24bc3b47d8a4874d0f2cd7395b814df3f652b07041ec55a37acb075fd2adc3a` |
| 4 | `two-dots-additional-goal-61dc6bfba976` | `sha256:9cff85aa3db5413c9894129bb23b551d6a7e163048985abf01d973c96086ef44` |
| 5 | `two-dots-delayed-reward-bc60a1dbeda3` | `sha256:4c4a520ead63c9d3767ddf11fc3411c9d6e36202ffa6a095736ec4f5f81a21af` |

Every projection is literal `publicationEligible=false`,
`catalogEligible=false`, `feedEligible=false`, with `review=null`. A second
complete registration pass returned `replayed=true` and `replayed` for every
pack, job, run and projection; the raw candidate artifacts were reverified on
that pass. No publish, review-admission, catalog, roster, feed or deployment
route was called.

Audit-only implementation branches:

- `swipe-ugc@5c88e56f37648348be0b7285b6ae316cf131c2bb`, branch
  `codex/labs-variation-audit-package-20260809`;
- `swipe-generator@32d4958bca38db6e143c182b8d63dd00a0f83e56`, branch
  `codex/labs-variation-audit-package-20260809`.

These branches are audit evidence, not approved production merges.

## 4. X — active effort

`X` is active agent-equivalent wall time, not a claim about human engineer
labor. Level-2 total windows are exact; sub-bucket splits are bounded to the
recorded commit/build/capture milestones and rounded to 0.001 h.

| candidate / shared work | rule logic | minimum feel | technical QA | telemetry / trace | rework | total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `TD-B0` + spike | 0.000 | 0.000 | 0.000 | 0.175 | 0.020 | **0.195 h** |
| `TD-C1` | 0.009 | 0.000 | 0.026 | 0.012 | 0.022 | **0.069 h** |
| `TD-O2` | 0.050 | 0.025 | 0.030 | 0.025 | 0.030 | **0.160 h** |
| `TD-G2` | 0.035 | 0.018 | 0.022 | 0.019 | 0.020 | **0.114 h** |
| `TD-R2` | 0.050 | 0.022 | 0.026 | 0.021 | 0.030 | **0.149 h** |
| shared audit packaging/admission | 0.000 | 0.000 | 0.130 | 0.220 | 0.230 | **0.580 h** |
| total | **0.144** | **0.065** | **0.234** | **0.472** | **0.352** | **1.267 h** |

Candidate-only total was `0.687 h`. Average Level-2 effort was `0.141 h`
(8m28s). The measured trend was:

`config 4m10s → obstacle 9m37.563s → additional_goal 6m50.149s → delayed_reward 8m55.624s`.

The first Level-2 candidate paid first-rule cost; the two later Level-2
candidates did not trend upward. The shared `0.580 h` is all integration and
assembly outside the exact playable: admission scripts, fail-closed repair and
materialization. Independent model-review usage is recorded in `Y`, not
silently converted to person-hours in `X`.

## 5. Y — cash, CI and model usage

- Marginal cash spend observed: **USD 0.00**.
- Remote CI runs: **0**. Verification was local on the pinned worktrees; no CI
  result is claimed as repository authority.
- Model/subscription usage, reported separately from cash: one frontier Codex
  orchestration session with two bounded worker lines; two independent Claude
  Fable subscription review passes at max effort (initial review and exact
  delta review). No token or dollar estimate is asserted for subscription
  usage.

## 6. Z — wall time to founder traces

Per the frozen ledger, `Z` begins at spike T0 (`17:51:36Z`), so setup is not
hidden. The final comparable `TD-R2` trace stopped at
`18:50:53.171Z`: **audit-global Z = 59m17.171s**.

| candidate | marginal candidate start → valid trace | T0 → final canonical trace |
| --- | ---: | ---: |
| `TD-B0` | first valid trace at 9m09s; later exact canonical rebuild | 27m29.796s |
| `TD-C1` | 1m40.863s | 20m11.863s |
| `TD-O2` | 9m20.940s | 41m26.940s |
| `TD-G2` | 6m38.382s | 49m19.288s |
| `TD-R2` | 8m27.926s | 59m17.171s |

The later canonical baseline rebuild explains why its final receipt timestamp
is after the config receipt; comparison used the exact pinned artifact and the
same schema.

## 7. Rework and technical disposition

- `TD-B0`: 1 — externalized runtime payload made the first mount fail closed;
  the local evidence server was restricted to exact manifest files.
- `TD-C1`: 1 — stale browser digest/move fixtures were rebound test-only.
- `TD-O2`: 2 — the old witness suffix was invalid after the frozen opener;
  stale frozen-profile geometry bindings were rebound test-only.
- `TD-G2`: 2 — solver expectation was corrected to its legitimate solution;
  a legacy square-feedback check was moved from a hard-coded Original action
  to the actual Twin loop. Frozen geometry was rebound test-only.
- `TD-R2`: 2 — frontier review rejected silent replacement of a live charged
  entity and added a negative test; solver expectation was rebound after the
  new rule changed its shortest witness.
- Shared packaging: 1 blocking review cycle — initial Claude verdict
  `NO-GO` because a non-baseline role could claim an unchanged candidate tree
  with a nonempty patch. Both admission layers now reject that case and bind
  raw trace role/mechanic/source/tree/runtime before writes.

No candidate relied on an unrecorded manual trace repair. The canonical trace
schema and closure remained structurally identical across all five entries.

## 8. Independent review

Initial blind review covered `swipe-ugc@a6a30d4…` and
`swipe-generator@2d719e1…` and returned `NO-GO` on the same-tree P2. The exact
fixes are `swipe-ugc@5c88e56…` and `swipe-generator@32d4958…`.

The independent Claude Fable delta review returned **GO** with no P1/P2. It
also ran an OS-temporary adversarial probe for cross-tree, cross-runtime,
cross-candidate, cross-mechanic and unchanged-tree inputs; all six expected
admissions/rejections behaved fail-closed. Focused Node 24 results were UGC
6/6 and Generator 4/4.

Accepted P3 residuals are bounded to this single-operator local audit tool:
an inert `review !== null` guard after forcing `review:null`, a concurrent
preflight/write TOCTOU that cannot overwrite bytes, a pre-existing `isMain`
CLI-import cosmetic, caller-claimed git identity that is independently checked
against the pushed refs in this receipt, and duplicated fail-closed TD-role
maps. None changes publication authority.

## 9. X/Y/Z/N/V and terminal decision

- `X`: **1.267 active agent-equivalent hours total**; `0.687 h` in candidate
  work and `0.580 h` in shared packaging/admission assembly.
- `Y`: **USD 0.00 marginal cash**, zero remote CI runs; subscription/model
  usage reported separately above.
- `Z`: **59m17.171s** from telemetry-spike T0 through the final valid founder
  trace.
- `N`: **the mutation packaging/admission path**. Existing
  `mechanic_sandbox` origination was Sort-only and could not honestly package
  or register exact Two Dots candidates. All three Level-2 rules were cheap
  inside the playable, but durable candidate records required new audit-only
  work in both `swipe-ugc` and `swipe-generator`, plus one blocking admission
  repair.
- `V`: **4/4 changed candidates valid**, including **3/3 Level-2 mutations**.
  `TD-B0` is a valid unchanged control and is excluded from the mutation
  numerator.

### Terminal decision: `FIX MUTATION PIPELINE`

This is selected under the frozen tree because valid candidates required
manual implementation and assembly outside the exact playable. The successful
3/3 Level-2 result is not `GO FAMILY A`: the removable pipeline bottleneck
must be fixed first. It is not `FIX EXPERIMENT HARNESS`: traces were complete,
structurally comparable and replay-verifiable after the bounded local adapter.
It is not `STOP`: per-rule cost was low and one concrete removable bottleneck
dominates.

Next boundary: do not launch Family A and do not merge the audit-only candidate
rules as product changes. A separate scoped initiative may make the existing
candidate pipeline mechanism-agnostic and server-verify git source identity;
only after that path can reproduce these records without audit-specific
cross-repo assembly should Family A be reconsidered.
