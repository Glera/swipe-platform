## ISSUE #177 — MISSION DEPLOY-PROVENANCE PACKAGE / HANDOFF_READY

The #151 row-5 boundary is terminal. Continue the already-audited Mission
enablement plan from durable audit `5420912539` and exact preflight
`5429807317`; do not repeat discovery outside the frozen package.

Mac B owns one bounded Playables package touching exactly these five paths:

1. `deploy-profiles/swipe-release-profile.json`
2. `scripts/catalog-dogfood-release-profile.mjs`
3. `scripts/deploy-swipe.sh`
4. `test/catalog-dogfood-release-profile.test.mjs`
5. `docs/SWIPE_DEPLOY.md`

Required semantics:

- closed deploy profile v2 and release schema v3;
- `mission.gates.VITE_MISSION_ENABLED=false` in the committed/default package;
- pinned-environment tripwire;
- exact profile resolution, bundle/runtime assertion and release receipt;
- existing no-argument Feed-only behavior preserved;
- no mechanic export;
- exact-user `42692410` and all Island gates preserved unchanged.

Use ordinary Mac B authoring on fresh Playables master. Run one blind
cross-provider discovery, one common P1/P2 correction batch if needed, one
correction-only delta verification, exact-head repository CI and green-only
merge. New P1/P2 after delta, scope expansion, identity drift or a need to
retry/reset/recreate => typed STOP.

After merge and green master CI, publish one causal HANDOFF_READY to Mac A
with exact base/reviewed head/tree/merge/master/CI and the five-path census.
Do not deploy static, turn Mission on, mutate backend/DB/settings/credentials,
enroll a user, create funding/case/pool inputs, perform a product/taste act or
touch #151 releases.

Mac A may then perform only the separately audited default-false provenance
rollout. Real funding policy, weights, case contracts, settled pool,
enrollment identity, Mission-on settings/static rollout and final transfer
remain explicit founder/operator inputs exactly as enumerated in
`5429807317`.
