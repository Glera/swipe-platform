# Experiment rework worker switch — independent review packet

## Scope and branches

- `swipe-ugc` branch `codex/experiment-worker-switch`
  - `f5e65ca608390e0fc349529e096133d375f83161` — exact server-bound legacy-parent bootstrap
  - `bd3c29604c0ed124d17109332085de7bb0d38332` — deterministic fenced success-process fixture
- `swipe-generator` branch `codex/experiment-worker-switch`
  - `e5c8eacb9662adfc5ceff199643742ff94e70ac8` — exact release identity, path switch, cross-repo acceptance
  - `065034d` — scheduler boundary comment only

Both branches are pushed. Neither branch is merged and no runtime/scheduler flag
was enabled.

## Stop-the-line findings fixed before the switch

1. The accepted worker initially rejected every existing parent: local inventory
   was 8 legacy manifests and 0 typed manifests. `loadParentClosure` now admits a
   legacy parent only when the server-owned input binds the exact canonical
   manifest, patch, HTML, cover, baseline and review evidence. Unknown schemas,
   partial typed shapes and any byte drift fail closed. The derived artifact does
   not inherit a verdict and still emits the current typed RESULT after all gates.
2. `workerRuntime.gateVersion` used to be caller-authored and the shared golden
   contained a placeholder. `experiment-worker-release.mjs` now owns a
   content-addressed gate definition containing the exact worker commit/path,
   contract digest and executable gate list; release rejects any foreign
   gateVersion or seed.
3. The executor used the legacy free-argument `worker/experiment.mjs`. Its default
   is now the exact `worker/experiment-rework.mjs`, and before claiming a lease it
   verifies the clean `swipe-ugc` checkout, exact commit and committed worker
   bytes.

The historical ordinal-1 `EXPERIMENT_REWORK_WORKER_BLOCKER` was intentionally
not rewritten. Existing compile-boundary jobs still replay their exact stored
bytes; attempt 2 carries the new server-owned runtime identity.

## Fenced acceptance evidence

- Real pinned worker process: release → lease → provider_started → typed ERROR →
  failed receipt/event, using the actual `worker/experiment-rework.mjs` and exact
  envelope argv.
- Deterministic UGC process fixture: release → lease → executor → recaptured
  artifact → coordinator → `worker_completed → gate_verified → lineage →
  delivered → ready`, then byte-identical replay.
- Negative coverage retained: dirty job, foreign lease, expired lease, timeout,
  crash, ambiguous stdout, nonempty stderr, artifact tamper, coordinator crash
  cuts and concurrent winner/replay.
- `provider-scheduler` still excludes every `experiment-rework`; the legacy
  original-experiment path remains `worker/experiment.mjs`.

## Executed verification

- `swipe-ugc npm run verify`: 102 tests, 101 pass, 1 intentional skip; lint 14;
  frozen bake base verified; preview autoplay reached WIN.
- `swipe-generator npm run verify`: 376/376 pass.
- Focused generator worker/release/executor/coordinator/scheduler set: 67/67.
- `git diff --check`: clean; both worktrees clean after commits.

Generator CI now checks out the exact UGC commit
`bd3c29604c0ed124d17109332085de7bb0d38332` and additionally runs UGC's
generator-owned cross-repo contract/publication/integrity suites. The UGC branch
must be merged by fast-forward or the generator pin must be deliberately bumped
to the reviewed merge commit in the same integration change.

## Deliberately still OFF

- No server route, ordinary runner case or provider-scheduler launch was added.
- No real subscription/model invocation was spent in this acceptance.
- After independent GO and merge, the next separate step is one manual local
  canary with a real reviewed legacy parent and real subscription. Only its
  evidence can authorize a later auto-launch discussion.

## Review focus

1. Whether server-bound legacy admission is narrow enough and preserves the
   typed-result trust boundary.
2. Whether `EXPERIMENT_REWORK_GATE_DEFINITION` completely names the accepted
   executable closure.
3. Runtime checkout verification occurring before `release.claim()`.
4. Workflow ref/path agreement and preservation of the historical attempt-1
   blocker.
5. Confirmation that scheduler/provider auto-launch remains structurally off.
