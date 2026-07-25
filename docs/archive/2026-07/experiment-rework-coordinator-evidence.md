# Experiment rework coordinator — review handoff

## Isolation

- Worktree: `/Users/gleb/My projects/p4g-platform-workspace/swipe-generator-coordinator`
- Branch: `experiment-rework-coordinator`
- Base: `2d858a8` (`Merge exact experiment rework executor`)
- State: uncommitted and frozen for independent review
- Main `swipe-generator`, `swipe-ugc`, backend, runner, server and scheduler were not edited

## Changed surface

- `src/experiment-rework-coordinator.mjs` — new exact coordinator
- `src/experiment-rework-executor-handoff.mjs` — append-only authoritative executor handoff/receipt record
- `src/experiment-rework-executor.mjs` — persists the exact handoff before every successful/failed return
- `src/store.mjs` — two narrow exact job-ledger transitions:
  `recordExperimentReworkJobEvidenceExact` and `completeExperimentReworkJobExact`
- `src/lab-store.mjs` — append-only exact `experiment-rework-lineage` collection
- `test/experiment-rework-coordinator.test.mjs` — 13 coordinator tests
- `test/helpers/run-experiment-rework-coordinator.mjs` — real interprocess race helper
- `package.json` — syntax-check includes the new coordinator module

## Authority/order proved

The only accepted input is exact `lab.experiment-rework-executor-handoff.v1`
with `outcome=succeeded`, and its bytes must equal the append-only executor
handoff record written before the executor returned. The coordinator independently replays:

1. deterministic compile attempt 1 (`queued -> deferred`);
2. deterministic physical attempt 2 and release event identities;
3. request/attempt/job/input/model/preflight closure;
4. signed worker RESULT and successful model receipt;
5. manifest, patch, HTML and cover bytes from the trusted UGC root;
6. gate proof and every digest relation.

It then performs exactly this durable order:

1. job result + successful receipt ledger (`state=queued`, `phase=coordinating`);
2. `worker_completed`;
3. `gate_verified`;
4. content-addressed `lab.experiment-rework-lineage.v1`;
5. `delivered`;
6. job `ready` transition.

Thus the result/receipt are durable before server events, while the candidate
cannot become review-ready before the exact delivered event exists.

## Crash/replay matrix

Named fault injection was run after every cut point:

- `job_evidence`
- `worker_completed`
- `gate_verified`
- `lineage`
- `delivered`
- `job_ready`

Every retry reaches the same one delivered event, one lineage record and one
ready job without changing committed bytes. Winner identity comes only from
the final serialized `queued -> ready` transition, never from partial-stage
creation. A deterministic split-stage interleaving and four repeated real
two-process races each produce one `created` winner and one exact `replay`;
busy locks use a bounded retry and never weaken identity checks.

## Negative matrix

- re-signed/forged result body;
- forged gate proof;
- foreign model receipt;
- caller mutations of receipt `startedAt`, `finishedAt`, executable,
  CLI version and fallback reason after executor return;
- forged result identity;
- mutated patch bytes after executor handoff;
- dirty caller-authored `job.result`;
- failed executor handoff.

All fail before delivery; no coordinator path creates attempts, starts a
worker, writes reviews/good/publish state, or touches provider scheduling.

## Reproduced commands

```text
node --test test/experiment-rework-coordinator.test.mjs test/experiment-rework-executor.test.mjs
27 tests, 27 pass, 0 fail

npm run verify
256 tests, 256 pass, 0 fail
syntax check: pass

git diff --check
pass
```

## Review focus

1. Exact mutable job projection in the two narrow store functions.
2. Whether the lineage body has every provenance field expected by the frozen
   specification (parent review/artifact, request/hash, attempt/job,
   instruction digest, receipt digest, result identity/digest and gate proof).
3. Interprocess busy retry bounds (`200 * 5ms`) and fail-closed behavior.
4. Confirmation that `ready` cannot precede `delivered` on every recovery path.
