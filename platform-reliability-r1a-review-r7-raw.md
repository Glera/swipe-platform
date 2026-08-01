# Platform Reliability R1-A — rehearsal delta review R7 raw report

The independent Claude Opus xhigh reviewer ran read-only against meta
1ffc90d, registration sentinel 5ef857f, backend candidate c7c62ad, backend
baseline 1aee3e0 and client e804c73. Nothing was edited, created, dispatched,
pushed or deployed. GitHub/Render access was GET-only.

# NO-GO

Two P1 and three P2 remained. R5's implementation GO was not withdrawn: every
reviewed patch was byte-identical after the later master advances. All
blockers were in the rehearsal execution contract, not packages A–G.

## Confirmed checks

- Candidate range: b3c18d3..301504a → 058c772..c7c62ad, 15/15 pairs equal.
- Baseline range: b3c18d3..66819a8 → 058c772..1aee3e0, 15/15 pairs equal.
- Client range: 61d57f8..dd3d021 → 96780f5..e804c73, 4/4 pairs equal.
- Stage 0 stayed preserved; Stage 1 remained outside the R1-A ranges.
- Both sentinel names and workflow_dispatch schemas matched the full
  workflows. The sentinels had contents:read only, no uses step, environment
  or secret reference, and one unconditional exit 2.
- All twelve baseline/candidate image inputs were coherent with the manifest
  implementation. Container SHA proof, source CAS, LKG linkage and pre-switch
  versus post-switch provider evidence were sound.
- The Blueprint's plan/region/service fields were valid for the selected
  Render plans.

## P1

### P1-1 — GitHub Free cannot provide the private production environment

The backend repository is private and owned by a personal account. GitHub
documents private-repository environment secrets/variables and selected
deployment branches as GitHub Pro/Team features. The account's existing Free
capability cannot create/configure the production environment required by the
cutover workflow. Empty environment secrets/variables make its input
validation fail closed. Moving the Render key and IDs to repository secrets
would grant every branch broader authority and would not rehearse the approved
production model.

Required closure: GitHub Pro/Team, or an explicit authority decision to accept
the weaker repository-secret model. The reviewer recommended Pro/Team.

### P1-2 — exact rebased refs were absent from origin

The old remote baseline/candidate refs still pointed to pre-rebase 66819a8 and
301504a; the sentinel ref was absent; the meta evidence ref stopped at
e2466b9. The runbook had no publication step. Force-pushing old refs would
orphan the durable remote anchors cited by R4/R5.

Required closure: publish the rebased package under new immutable ref names,
including sentinel and meta Blueprint source, and record exact remote values.

## P2

### P2-1 — Blueprint source triple was unspecified

The rehearsal Blueprint lives in the meta repository, while all services use
the backend repo. Without exact source repository, branch and custom path, the
natural backend/default-path setup loads production render.yaml instead. Its
production-shaped resources can share expected names and therefore pass the
later name-bound capture.

Required closure: exact meta repo/frozen branch/custom path; validate the file
against the temporary workspace before creation; assert the returned plan.

### P2-2 — images publish into the shared private GHCR package

The full image workflow hardcodes ghcr.io/glera/swipe-backend and publishes
two immutable versions plus provenance/SBOM and 90-day sidecars. Cleanup did
not name them, while the runbook claimed no production namespace was touched.
The temporary pull credential was also underspecified.

Required closure: explicitly retain or delete exact package versions; state
their role and cleanup policy; specify a classic PAT with exact package scope,
holder and revocation.

### P2-3 — sentinel merge lacked the production provider gate

The sentinel must merge to backend master, whose production Blueprint still
omits autoDeployTrigger and therefore defaults new Git-backed services to
commit deployment. The same fresh production provider capture required for
backend PR 33 must precede this earlier master mutation as well.

Required closure: fresh capture of Blueprint Auto Sync and web/two-cron Auto
Deploy OFF, exact paths, timestamp and digest immediately before the sentinel
merge. The receipt is single-use.

## P3 observations

1. Treat exact-ref workflow-version semantics as a fail-closed baseline probe;
   primary docs do not spell out all version-selection details.
2. Dispatch by workflow path rather than display name.
3. Live Render response shape may still stop the fail-closed capture; never
   patch it during the window.
4. Off versus After CI Checks Pass needs an attended dashboard receipt because
   the read API exposes only a boolean.
5. Freeze Blueprint source bytes before its brief initial Auto Sync window.
6. Do not invent an unreviewed post-image capture; coordinator fresh-GET proof
   already covers imagePath and env.
7. Name the exact cutover workflow ref in every operation.
8. Blind rerun --failed can collide with immutable artifacts and republish a
   mutable SHA tag; release workflows need a stricter exception.
9. Save the exact health payload separately because coordinator checks only
   ok/service.
10. A positive provider-preflight refusal control is useful but non-blocking.
11. The legacy Dockerfile.bake live API path is captured but not source-built.
12. The prompt's stated meta head was one docs-only commit behind local HEAD.

The verdict authorized no merge, publication, paid resource, external
mutation or production action.
