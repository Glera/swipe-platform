# R1-A LKG smoke source-merge contained failure — independent review

Reviewed: 2026-08-04 UTC.

Verdict: **GO — no P1/P2 findings** on exact execution-evidence commit
`69430e3444497249ca4d623ea403431b511bda47`.

Independent Claude Opus/xhigh safe-mode session
`f9bea6a7-c346-4d53-a2aa-7ca026ccf45e` used Read and bounded local
read-only commands. It made no fetch, `gh`, web, credential, edit or external
mutation calls. Three broader local commands were denied; the reviewer
completed the required file, git and hash checks through allowed surfaces.

The reviewer confirmed that the masked credential prefix on a forbidden
browser-output surface is a literal packet hard stop; the one key was fully
contained and revoked before merge; provider evidence is internally
consistent, GET-only and merge-safe; PR #53 remained draft and no merge was
attempted; and the tracked receipts contain no credential material or
derivative.

The internal subscription meter reported USD `1.2391495`; this is review
telemetry, not a separate billed API charge assertion.

Six P3 advisories are dispositioned separately. This GO grants no operator
authority, merge retry, key creation, provider action, deployment or rollout.

## Verbatim result

## `GO` — no P1/P2 findings

Reviewed exact meta commit `69430e3444497249ca4d623ea403431b511bda47` (purely additive: 4 files, 372 added lines, no modifications or deletions) against authority packet `c7aa22eef03e5290aa73919bd02671c42ec2c212`, its runbook, and the accepted NC-2 reveal hardening. Read-only file inspection plus bounded local git/hash checks only; no fetch, `gh`, web, or external action.

### 1. Hard-stop classification — correct and conservative
`hardStop.code` = `masked_credential_prefix_entered_forbidden_browser_output` (`...failure-20260804.json:76`) maps to the packet's literal stop `"temporary key value appears on any forbidden surface"` (`...authority-request-20260803.json:133`) with `"DOM snapshot"` an enumerated forbidden surface (`:83-96`) and the prose ban on "the credential value **or any derivative**" (`...request-20260803.md:46-47`). Treating a *masked* prefix as a derivative is stricter than strictly required and is the safe reading. No rationalization: `status` is `FAIL_CONTAINED_NO_MERGE`, `operatorAuthority.consumed=true`, `mergeRetryAuthorized=false` (`:3,8-9`), `nextBoundary` (`:119`) and `.md:70-72` all deny replacement key and merge retry. Nothing in either file silently preserves residual authority.

### 2. Containment complete
One key, no replacement, revoked before merge, empty UI inventory, exact HTTP 401 from the former credential, handoff removed, `persistentCredentialRemaining=false` (`json:87-95`; `.md:48-50`) — the full set required by `...request-20260803.json:98-101` and runbook §2. The second masked-prefix occurrence (`.md:38-39`) sits on the revoke path, i.e. inside the *mandated* containment step of `failurePolicy.beforeMerge`, not continued execution.

### 3. Provider evidence consistent, GET-only, merge-safe
- Capture: `status=PASS`, `mergeSafe=true`, exact Blueprint `exs-d95qo3q8qa3s73ea23p0` and all three service IDs, `master` + `./Dockerfile.bake`, `autoSync=false`, every `autoDeploy=false` — identical identity/shape to the previously accepted recovery-v3 capture.
- Hashes verify locally: tracked file SHA-256 `2a5cabcc…` matches, and the claimed canonical receipt SHA-256 `d23c4efa…` reproduces exactly as the JCS/sorted-compact serialization of the file. Inventory tracked SHA-256 `dc8a748f…` matches.
- Inventory: `operations:["GET"]`, `activeCount=0` for blueprint syncs, all three deploy groups and web jobs; every recorded status is terminal (`success`/`live`/`deactivated`/`succeeded`). GET arithmetic reconciles (`authenticatedGetCountBeforeRevoke=13` ≈ capture + 5 inventory GETs + 3 shape-probe GETs; `revokedCredentialGetCount=1` is the 401 check).

### 4. Backend/PR/check facts and negative ledger
`f2a8405…`, PR #53 OPEN/draft/CLEAN, head `223ab97…`, tree `75dbd88…`, 1 commit, 28/28, production environment and repo release authority absent, 0 active runs — all match the packet pins verbatim; `d635398…` is confirmed an ancestor of the named packet. `markReadyAttempted=false`, `mergeAttempted=false`, PR still draft, post-containment master/head/checks unchanged, and all ten `forbiddenActions` false. Coherent pre-merge stop.

### 5. No credential material, no overclaim
Pattern scan of all four files for `rnd_`/bearer/authorization/token: zero matches. Only non-secret resource IDs (`srv-`, `crn-`, `exs-`, `exe-`, `dep-`, `job-`) appear, matching accepted precedent. `credentialMaterialRepeatedInThisReceipt=false`, `credentialHashed=false` (`:83-84`), consistent with the NC-2 "not even a hash" hardening. Every claim a local reviewer *can* check (three SHA-256s, ancestry, commit shape, JSON validity) verifies; GitHub/provider facts are framed as session observations, not as locally reproducible proof — backend objects do not resolve in this meta repo, and the receipts do not claim they do.

### 6. Bootstrap corrections honest and bounded
Pre-key probe cursor correction is disclosed with `preKeyHttpRequests=0` (`:44-45`, `.md:25-26`) — pre-key, non-secret, no HTTP. The inventory bootstrap stop on `state` vs `status` wrote no evidence, and the field-name-only probe (3 GETs) carried no values (`:69-73`, `.md:31-33`). Both are pre-hard-stop, GET-only, and neither softens the terminal disposition.

### P3 advisories (no action required for this receipt)
1. `preflight` (`json:11-26`) records the 28/28 rollup but not the two pinned CI run IDs / zero-artifact fact named at `...request-20260803.json:124`; a reader must rely on the aggregate "all preflight gates passed" (`.md:8-9`).
2. Inventory `count` is uniformly `20` here vs `52/100/32/100` in the accepted 2026-08-03 inventory — history cannot shrink, so `count` is evidently a bounded page size in the re-grounded projection. Benign (any active operation appears in the newest page), but the field's meaning should be stated in-schema.
3. No explicit preDeploy discriminator exists in the inventory; `activeDeploysOrPreDeploys=0` rests on deploy-status semantics. Sound given all statuses are terminal, but worth an explicit phase field next time.
4. `handoffRemoved=true` is attested; teardown of the `0700` receipt directory and the disposable venv (`json:28,30`) is not, though `failurePolicy.beforeMerge` names "receipt temp material". Matches prior house style and the material is non-secret. I could not check those paths — they are outside my working directories and the listing was denied.
5. Clarity nits: `.md:63-68` omits generative-feed expansion, which `json:116` does cover; `hardStop.detectedAfter` uses `+00:00` while `detectedBefore` uses `Z`; and "before the final GitHub CAS" (`.md:10-11`) reads ambiguously against the `postContainment*` fields — worth stating those are read-only confirmations, not the merge-authorizing CAS.
6. Since Render's key-list and revoke dialog inherently render a masked prefix, a future packet should pre-declare that surface explicitly, so the containment-mandated revocation does not structurally re-trigger the same stop.

This review grants no operator authority, merge retry, key creation, provider action, deployment or rollout.
