# R1-A rehearsal final local review R9 — raw report

Nothing was edited, pushed, dispatched, merged, published or provisioned; no
provider or GitHub API was called.

# GO

Local review is closed. The exact package is safe to advance to publication of
the new immutable refs and to the separately gated operator prerequisites.
R5's implementation GO is unchanged. **No P1 and no P2 remain.** Six P3
observations follow; none blocks publication or needs a new review cycle.

This GO authorizes nothing else — not Pro purchase, pushes, PR/merge, GitHub
App changes, environments/secrets, Render resources, workflow dispatch, image
publication, rehearsal or production.

**Package as verified:** meta `0eff5c8` (branch tip `14ab862` adds only the
45-line R9 prompt); Blueprint source `183336a`, whose
`render.r1a-rehearsal.yaml` is byte-identical to the reviewed tree (`sha256
f79362b5…7f92d0`); sentinel `5ef857f`, parent = master `058c772`, diff exactly
2 workflow files +118/−0; candidate `c7c62ad`, baseline `1aee3e0`, client
`e804c73` all unchanged since R8. Delta `0f6bf75 → 0eff5c8` is
documentation-only (5 markdown files, +263/−17). Absence of Pro and remote
refs was not counted against GO.

## R8 blockers — closed, verified against code

**P1 Blueprint discrimination.** Lines 112–121 now assert only `valid=true`,
exact names, empty key-value/environment-group sets and action count, and say
plainly that validation binds uploaded bytes, not source. Discrimination moved
post-create (lines 202–214). The `jq -e` assertion is executable:
`scripts/platform-release-provider-capture.py` really emits per-service
`branch`, `dockerfilePath`, `autoDeploy`, `id`, `name`, `role`, `type` plus
blueprint `autoSync`.

A wrong production `render.yaml` cannot pass — I checked both versions. Master
`058c772:render.yaml`: `./Dockerfile.bake` ×3, schedules `15 * * * *` / `30 2
* * *`, `databaseName: swipe`, **no `branch:` key at all**. Candidate
`c7c62ad:render.yaml`: `./Dockerfile`, `plan: basic-256mb`, same
names/schedules/`databaseName`. Either is rejected by branch, schedule,
`databaseName` and database plan.

**P2 post-switch evidence.** `prepare-source` verifies the PATCH response's
`env == "image"`, `autoDeploy`, and `imagePath ==
repository@candidateDigest`; the `deploy` path re-GETs in its own run, rejects
`service_not_image_backed`, and deploys by exact digest. Source-CAS precedes
the PATCH. Lines 332–337 cite exactly that and explicitly disclaim a fresh-GET
`imagePath` receipt.

**P2 private-repo access.** Step 0 inventories, confirms backend, grants meta
additively only if absent, sequenced after the production provider gate;
cleanup removes exactly that grant.

**P2 environment scope.** Pre-proof before any environment exists;
post-creation branch policy, secret set `{RENDER_API_KEY}`, five-name variable
set, repeated repo-level assertion, repeated again at cleanup. The five names
match the cutover workflow's `env:` block one-for-one — no sixth reader exists.

**Material P3s.** Sentinel/Blueprint pinned without self-reference (the pinning
commit touches 3 runbook lines and leaves the yaml alone); step 0 numbered;
first-publication visibility/linkage/version proof present; the 60-day deadline
matches the real `retention-days: 90` on
`platform-release-<backend_sha>`; rehearsal asserts `./Dockerfile` exactly
while the capture keeps `_PATHS = {"./Dockerfile", "./Dockerfile.bake"}` for
production's separate capture.

## Independent checks that passed

Both sentinels are inert (no checkout/secrets/environment, `contents: read`,
`exit 2`) with input schemas identical to the full workflows, so the probe's
worst case is a harmless refusal. The full image workflow triggers only on
`pull_request` (path-filtered) and `workflow_dispatch` — no `push` — which is
precisely what makes "no run exists for it" satisfiable after publishing four
branches. The no-rerun rule is grounded: publication tags
`$IMAGE_REPOSITORY:$BACKEND_SHA` and the artifact name is SHA-derived.
`bake_runtime_status()` returns `{"state": "local"}` when no bake ready-file is
set, so step 7's expectation is the true value; `r1a-rehearsal-20260801`
matches the coordinator's identity regex. Production mutations are fully
enumerated (new refs, sentinel merge behind a fresh single-use capture,
temporary `production` environment, two GHCR versions, additive App grant) —
I found no unenumerated one.

## P3 (non-blocking)

1. **Stale rationale:** "legacy `./Dockerfile.bake`" is true for master but
   false for `c7c62ad:render.yaml`, which uses `./Dockerfile`; neither file sets
   `branch:`. The executed assertions still discriminate; only the sentence is
   out of date.
2. **No origin-resolution receipt for the Blueprint ref.** Step 1 proves the
   baseline ref resolves to `1aee3e0…`, but the frozen-bytes argument has no
   equivalent. Add: prove origin
   `codex/r1a-rehearsal-blueprint-20260801 == 183336a…` before Deploy Blueprint.
3. **Variable names asserted, values not.** Variables are readable; an exact
   value match against the recorded disposable IDs is free. Residual risk is
   already bounded by the CAS check preceding any PATCH.
4. **Render API key blast radius unstated.** Render keys are generally
   user-account scoped across workspaces; if so the production boundary is
   contractual, not credential-level — unlike the genuinely least-privilege
   GHCR PAT. Verify and state before the window.
5. **Scope of the `RENDER_*` absence proof** is complete for the Pro
   personal-account path; packet §10.6 also allows a Team org, where
   organization-level `RENDER_*` would resolve identically and must be
   inventoried too.
6. **Unenumerated but benign CI:** the sentinel PR triggers
   `postgres-acceptance`, and its merge triggers `postgres-acceptance` +
   `browser-e2e` on master. Both `contents: read`, no provider authority —
   Actions minutes only.

Two accuracy notes, not actions: neither coordinator log prints the observed
`env`/`imagePath` (they prove the check by exiting 0), though the asserted
`imagePath` is exactly recoverable as
`manifest.image.repository@candidateImageDigest` from the receipt plus pinned
manifest — which is why the R8-prescribed citation is sound. And I did not
independently confirm Render exposes `POST /v1/blueprints/validate` with the
documented shape; the step is fail-closed and the post-create receipts, not
validation, now carry the discrimination.

**Next authority to request, in order:** activate/verify Pro → publish the five
immutable refs → step-0 GitHub receipts → fresh production provider capture
then sentinel merge GO → additive Render GitHub App grant → step 1 onward under
action-time confirmation.
