# Worker-conformance + user WIP integration evidence

## NO-GO fix round · sealed gates and legacy-safe entrypoints

- Fix commit: `431deb973297ed1e3e735adce1042f2c29d31725` on
  `worker-conformance-wip-integration`, directly above `d4d9676`.
- No merge, runner enablement, deploy, or write to the primary `swipe-ugc`
  worktree was performed.

### Authoring checkout is no longer executable evidence

The exact worker now lives at `worker/experiment-rework.mjs`. After the single
provider process exits, it captures the complete binary Git patch once. It then
creates two gate-only clones from the exact baseline commit/tree with
`git clone --no-hardlinks`: one replays the reviewed parent only for the
pre-existing diagnostic comparison, and the candidate clone receives only the
captured candidate patch bytes over stdin. The clone rejects any Git
`objects/info/alternates` file, snapshots its own Git/dependency identity, and
re-runs full diff/path/capability validation. Candidate patch bytes and ordered
file identity must replay exactly before any executable gate.

Typecheck, build, artifact assembly, conformance, cover capture and autoplay
all use the sealed clone. The authoring clone is never read again after the
capture. `test/worktree-integrity.test.mjs` starts a real independent process
that overwrites the authoring source after capture; the sealed clone still
replays the captured diff byte-for-byte and tests the captured source, not the
late mutation.

### Live legacy runner remains unchanged

The historical free-argument worker stays at `worker/experiment.mjs` and is
byte-identical to committed live baseline `65f1d52`:

`sha256 6611825db64308942d22aa8396bee1a9feed58568e32c3f3f65278db312550d4`.

A test pins those bytes and verifies the legacy provider/feedback/attempt
surface remains present. The exact worker remains fail-closed on every CLI key
except `--input-envelope` and `--input-digest`; it is now a different path, so
merging this branch cannot make the live legacy generator send its free argv to
the exact worker by accident.

The rework executor is still intentionally not wired. Before future wiring,
its generator-owned worker path/compatibility identity must move from
`worker/experiment.mjs` to committed `worker/experiment-rework.mjs`. This is a
runner-wiring follow-up, not an authorization to add a compatibility shim or to
enable traffic.

### Executed verification

- `swipe-ugc npm run verify`: lint **13/13**; tests **101 total / 100 pass /
  1 intentional skip / 0 fail**; pinned bake base verified; real preview booted
  and autoplay reached WIN.
- Focused contract/publication/integrity set: **20/20**.
- `swipe-generator npm run verify` on clean master: **291/291**. The legacy
  runner continues to target its unchanged path and provider-scheduler still
  keeps experiment-rework out of the live legacy lane.
- `git diff --check`: clean; fix branch worktree clean after commit.

## Identity and isolation

- Repository: `swipe-ugc`.
- Accepted contract head: `41e4d9d67577ca30ce72235f9379e27de37036eb`.
- Accepted integration on the current local master base `65f1d52`: `29eb99e8f82717828cb75841fd0a7fd36dd81aa7`.
- Integration branch/worktree: `worker-conformance-wip-integration` at
  `/Users/gleb/My projects/p4g-platform-workspace/swipe-ugc-worker-wip-integration`.
- New commit: `d4d96763ce73bc8887bf65a65b74be423e71da49`.
- The primary `swipe-ugc` worktree was never modified, stashed, reset, or used
  for a test write. Its pre-existing WIP remains exactly the five paths visible
  at handoff: `README.md`, `scripts/lint.mjs`, `worker/experiment.mjs`,
  `test/worktree-integrity.test.mjs`, `worker/worktree-integrity.mjs`.

## Accepted semantics preserved

- The only worker authority remains the exact
  `lab.experiment-worker-input.v1` envelope and its `sha256:` digest.
- Exactly one physical provider invocation remains in one worker process; no
  repair loop, fallback instruction, soft autoplay success, or parallel CLI
  provider/model authority was reintroduced.
- Feedback remains exact printable 1..2000 characters from the signed request;
  no trim/slice/default substitution exists.
- RESULT/ERROR identity, parent closure, gate evidence, append-only publication,
  and the generator-owned cross-repo golden are unchanged.

## Compatible user-WIP hardening integrated

- Model prompts travel on stdin rather than process arguments. Claude local
  settings are disabled and permission mode is non-interactive.
- Provider subprocesses receive an explicit subscription environment allowlist;
  immediately before the one model invocation the worker verifies first-party
  `claude.ai` or ChatGPT authentication.
- All trusted Git operations disable hooks, fsmonitor, untracked cache,
  replacement objects, external diff/attributes/excludes, and inherited `GIT_*`
  indirection.
- The disposable clone snapshots protected Git metadata, normalizes and rejects
  assume-unchanged/skip-worktree flags, and uses a private scratch index for
  intent-to-add diff construction. The real index is never dirtied to observe
  untracked source files.
- The trusted `node_modules` symlink and its target inode are checked before and
  after typecheck/build/diff gates. Changed source must be a regular file;
  ignored files outside `node_modules` fail closed before build.

## Semantic conflicts resolved fail-closed

The following portions of the user WIP were deliberately **not** ported:

1. `MAX_ATTEMPTS`/repair loops and multiple `invokeAgent` calls: conflict with
   one invocation = one job/attempt/receipt.
2. `trim().slice(...)` feedback and default tuning text: conflict with the exact
   signed 1..2000-character instruction.
3. `UGC_EXPERIMENT_CONTEXT_FILE` / `UGC_EXPERIMENT_CONTEXT_HASH`: this is a
   second unsigned prompt authority outside the worker input envelope. A future
   memory/context field requires a new versioned envelope, contract digest, and
   shared golden before it may reach the worker.
4. Free `--provider`, `--model`, `--baseline`, `--prompt`, `--concept`,
   `--parent`, or `--feedback` arguments: all remain forbidden.
5. The old first-implementation/parent-optional path: the accepted worker is an
   exact rework worker and remains parent-evidence-required.

## Executed verification

- `npm run lint`: 11 worker/generator modules passed syntax validation.
- `npm test`: 99 tests, 98 passed, 1 intentionally skipped, 0 failed.
- Existing contract tests still prove one provider invocation, no parallel CLI
  authority, exact cross-repo golden bytes, re-sign rejection, parent closure,
  append-only publication, and interprocess race safety.
- New tests prove protected metadata detection, dependency-link replacement and
  redirection rejection, target inode replacement rejection, hidden-index-flag
  handling, separate clear actions, and source-level composition without
  weakening the frozen wire.
- `git diff --check`: clean. Integration worktree is clean after commit.

## Runner wiring that remains forbidden / pending

This commit is **not** permission to enable runner traffic:

1. `swipe-generator/src/runner.mjs` still handles legacy `job.type ===
   'experiment'` by sending the now-forbidden free CLI arguments and optional
   learning-context environment. Pointing that path at this worker will and
   must fail closed. It needs a separate legacy worker or a versioned,
   generator-signed input contract; do not add an argument compatibility shim.
2. `runExperimentReworkExecutor` exists and has focused tests, but no production
   runner/scheduler call currently invokes it; `provider-scheduler` explicitly
   skips `experiment-rework`. Wiring release claim → executor → coordinator,
   including cancellation/lease behavior, requires its own reviewed slice.
3. `experiment-rework-dispatch.mjs` still records the observed worker surface at
   `swipe-ugc/worker/experiment.mjs@65f1d52...`. That compatibility identity
   must move only after this branch is independently reviewed and merged; it
   must identify the committed worker/contract, never the dirty primary
   worktree.
4. No runner may set `SWIPE_UGC_ROOT` to the dirty primary `swipe-ugc` checkout.
   Operational execution must use a clean committed tree containing the exact
   worker integration and matching generator-owned golden.

Therefore the safe handoff is: independent review of `d4d9676` → merge into a
clean `swipe-ugc` master → update the generator compatibility identity → add a
separate fenced runner-wiring slice and cross-repo process acceptance. No merge
or enablement was performed here.
