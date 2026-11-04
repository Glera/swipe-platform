## #136 one-shot executor v2 — final physical Mac B bootstrap

Operator standing authority is already explicit: complete reversible two-Mac
communication and the portfolio goal as far as possible without further
operator relays. This packet performs no product decision, deploy, migration,
credential, permission or infrastructure change.

### Signed package

- merged meta master: `dd4d4a92c6ca21af11ae0d798c9d22c24ad1e5b9`
- merged tree: `d9e18e7868948d175e1cc03393de758d5fceb806`
- PR: https://github.com/Glera/p4g-workspace-meta/pull/205
- PR CI `32940565032`: SUCCESS
- master CI `32940614559`: SUCCESS
- full local verify: 329/329 PASS
- final correction-only Opus 5/high delta: PASS, P1=0/P2=0
- reviewer session `6b2aa0f8-ab22-4553-9b82-f9352cd25dd7`
- reviewer result `b019a9b5-60d1-4a16-936e-45fc379aa2e8`

### Existing exact Mac B boundary

- active predecessor binding digest:
  `bafc62849cbde3ec933f3745d39b8421f6a5d1301ef882de313b3098e519bc70`
- predecessor task digest:
  `454e596783dcceea4d9f3c0b1b4adc64e0cc5615f55f39897b3d0d5c3f2c8588`
- predecessor bridge head: `7b5830e1a6e411fdcfafbac54c4a831ff8752ae9`
- first queued liveness successor:
  https://github.com/Glera/p4g-workspace-meta/issues/94#issuecomment-5421839018
- successor wake:
  `wake_f9647d8f11fdf27d2cfb78ce0651821d192247a34e4d4b5ac442d1a2370818f3`

### One bounded host-local activation

On the physical Mac B, in its existing full-access owner task:

1. Fetch meta and use a clean detached checkout at exact merged master
   `dd4d4a92…`; leave dirty primary checkouts untouched.
2. Unload the legacy `com.p4g.two-mac-wake-gate` plist if loaded.
3. Convert the existing mode-0600 local config in place to exact schema
   `two-mac.wake-gate.config.v2`, preserving repo/control issue, trusted actor,
   workspace/meta paths and cursors. Exact executor fields:
   `machine=mac-b`, `executorRole=content-labs`,
   `executorModel=gpt-5.6-sol`, `executorReasoningEffort=xhigh`,
   `executorSandbox=danger-full-access`; remove `codexSessionId`; start with
   `enabled=false`.
4. Run `scripts/two-mac-executor-bootstrap.mjs` dry-run and then exactly one
   apply with `--supersede-binding-digest bafc62849cbde3ec933f3745d39b8421f6a5d1301ef882de313b3098e519bc70`.
   No raw task digest is an input.
5. Dry-run the gate. It must report transport `oneshot` and the one queued wake
   above (the immediate held predecessor alias is intentionally accepted).
6. Set `enabled=true`, install/load the already merged plist once, and allow
   one ordinary tick. Do not manually execute the work payload.
7. The one-shot job must read the queued wake and publish exactly one causal
   successor back to the active Mac A profile. Its receipt must contain the
   exact standalone `executorProfileDigest` line required by the prompt.
8. Return the new profile digest/binding digest, tick JSON, JSONL terminal and
   successor URL here. Do not expose secrets or full local config.

At any CAS/profile/lineage/config/receipt mismatch: typed STOP, no AI retry,
binding replay, cursor rewrite, rollback or second activation attempt.

After success, leave the model-free gate enabled. Empty ticks use zero AI; only
an actionable wake starts a fresh bounded executor.
