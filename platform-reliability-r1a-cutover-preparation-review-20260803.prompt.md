Independent safety review of a proposed R1-A pre-cutover preparation authority. Reply first line exactly GO if no P1/P2; otherwise list only precise blocking findings. No tools, no web, no extended restatement.

This is NOT merge/deploy authority. Immutable evidence commit e7d782bdac44198ca4ed63e7211eb8a0db37577f already proves:
- PR 48 candidate 11c9bce9891ae5b041215056ac4521551a056cb5;
- baseline run 30789375002, image sha256:39f354d8b22a221bf5f71ed912ca57d9bd16a8f8007958709e3e97f969b5eedb, manifest b2ddb48a4c907b82b592a430336811a6514ec8a58c3c2cd8336f7e339a2bbc88;
- candidate run 30789817457, image sha256:1969bd9afeb948d9ab40432dd11e629d22ef37cc863204b97d6f45ef5ff6b8df, manifest 1e708f6418ddc88689ab0aae5cd67b7ce65ceb962cc50eaea81d7973b991613b;
- exactly two publication dispatches consumed, no redispatch.

The requested attended window permits only:
1. Create one temporary account-wide Render API key, never in argv/log/git.
2. Run reviewed GET-only provider capture for exact production owner tea-d1m4lmali9vc73euvelg, Blueprint exs-d95qo3q8qa3s73ea23p0, web srv-d95r3bfavr4c73aqsi4g, crons crn-d9kej0u1egvs73engu7g and crn-d9e6vmtaeets73ai8cj0, PG dpg-d95r32favr4c73aqs4d0-a, durable GHCR credential rgc-d9np7tajnfac73bi5ib0.
3. Create one web-service job whose exact command is `alembic current`; never upgrade/downgrade.
4. Create GitHub environment `production`: wait 0, reviewers [], prevent_self_review false, custom branch policies true/protected false, one allowed branch codex/r1a-production-cutover-v1-20260802.
5. Add exactly environment secret name RENDER_API_KEY and six variables: RENDER_SERVICE_ID=srv-d95r3bfavr4c73aqsi4g, RENDER_BLUEPRINT_ID=exs-d95qo3q8qa3s73ea23p0, RENDER_OWNER_ID=tea-d1m4lmali9vc73euvelg, RENDER_REGISTRY_CREDENTIAL_ID=rgc-d9np7tajnfac73bi5ib0, PLATFORM_DATABASE_IDENTITY=swipe-production, PLATFORM_RELEASE_AUTHORITY_SCOPE=production.
6. Read back branch policy, secret names, variable names+values, and prove no repository-level RENDER_* key.
7. Commit receipts and independently review the final cutover packet.

Hard stops before any non-cleanup mutation: any ref/digest drift; PR48 not exact draft/unmerged; backend master not accepted a12ca7ecea0f47e8862b4ba91879dff63cb46bfc; production env unexpectedly preexists; repository RENDER authority; Render identity/consumer/owner/source/path drift; Auto Sync or any of 3 Auto Deploy controls enabled/unreadable; any active deploy/sync/preDeploy/migration; latest deploys not exact last accepted web dep-d9mtmabm8hqs73cighmg, sequencing dep-d9mtmabm8hqs73cigjk0, materialize dep-d9mtmajm8hqs73cigkc0; database not available PG16 and exactly 0070_published_test_delivery; written environment not exact.

Forbidden: merge, any cutover workflow dispatch, prepare-source/deploy/rollback, Render service/source/image/env/AutoDeploy/Blueprint mutation, migration, image publication, Stage1 branch/rebase/merge/rollout.

Failure cleanup: delete only newly created production environment, revoke only temporary Render API key, preserve durable GHCR credential; no service rollback because service mutation is forbidden.

After PASS, final packet needs fresh capture digest/time, exact deploy+DB revision, environment receipt and independent GO. A second separate operator GO must name that exact commit before merge or cutover dispatch.

Question: Is this a safe, sufficiently bounded authority request, and are its stop/cleanup boundaries internally executable? Any P1/P2?
