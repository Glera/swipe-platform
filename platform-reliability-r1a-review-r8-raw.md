# Platform Reliability R1-A — rehearsal closure review R8 raw report

Independent Claude Opus xhigh review, read-only. Nothing was edited, pushed,
dispatched, merged, published or provisioned. External access was GET-only;
no Render API call was made.

Package: meta 0f6bf75, sentinel 5ef857f, candidate c7c62ad, baseline
1aee3e0, client e804c73.

# NO-GO

One P1 and three P2 remained, all in the rehearsal execution contract. R5's
implementation GO was not withdrawn. The absence of GitHub Pro and new remote
refs was deliberately not counted: the contract failed closed without them.

## Confirmed R7 closures

- GitHub Pro/Team is a literal precondition and repository-scoped Render
  authority is rejected; the workflow reads Render values only from its
  production environment and fails closed on empty/malformed values.
- Old reviewed remote refs remain durable. The new publication plan is
  additive and immutable.
- GHCR is explicitly scoped to two retained exact-digest versions; the pull
  credential is classic read:packages only and revoked after rehearsal.
- A fresh single-use production provider capture gates both the sentinel merge
  and the later PR 33 merge.
- Sentinels remain inert and all dated ref names are consistent across the
  Blueprint, environment policy and dispatches.

## P1

### Blueprint binding remained insufficiently discriminating

Production and rehearsal Blueprints use the same four resource names. The
reviewed capture accepted either Dockerfile path and only type-checked branch;
it did not require the rehearsal branch/path. Render Blueprint validation
validates uploaded bytes and returns names/action counts, but does not prove
which repo/branch/path the Dashboard later binds or expose the demanded
plan/region fields. A mistaken production render.yaml could therefore create
production-shaped resources and pass the named checks.

Required closure: state only the documented validation assertions, then
post-create require exact rehearsal branch, Dockerfile, region, schedule,
service plan, database plan/name and temporary owner ID from authenticated
GET receipts. Any mismatch/unreadable field is fatal.

## P2

### Post-switch evidence claim did not match coordinator artifacts

Prepare-source verifies image env/path from the PATCH response; deploy later
fresh-GET checks env only. Neither exact pair is stored in a coordinator
receipt. The runbook incorrectly claimed a fresh-GET receipt proved both.

Required closure: cite the evidence that exists — prepare workflow log bound
to its receipt/run/attempt plus deploy log's fresh-GET env check — or change
reviewed code/add an explicit capture.

### Private Blueprint source lacked a GitHub App access step

Both meta and backend repositories are private. The temporary Render workspace
needs read access to both. Granting meta access changes the shared Render
GitHub App authorization surface and was neither recorded nor ordered.

Required closure: inventory access before/after; confirm backend already
authorized; add only meta if absent after the production provider gate; never
remove another repo; restore only the additive grant during cleanup.

### Repository-secret rejection lacked a verification step

The workflow cannot tell environment-scoped and repository-scoped values
apart. Pro capability alone did not prove the weaker substitution was absent.

Required closure: before environment creation and after cleanup prove no
repository RENDER_ secret/variable; prove production environment did not
pre-exist, then exact branch policy and exact environment secret/variable name
sets after creation.

## P3 observations

- Add exact sentinel and Blueprint source commits to the source table.
- Record projected GHCR transfer versus plan headroom.
- Actions sidecars expire after 90 days while cutover downloads by run ID;
  declare a safe deadline or durable copy.
- Put sentinel capture/merge into numbered step 0.
- Prove package private/linkage state after first publication.
- Rehearsal must require Dockerfile exactly; production may retain the legacy
  Dockerfile allowance in its separate capture.

No external action was authorized.
