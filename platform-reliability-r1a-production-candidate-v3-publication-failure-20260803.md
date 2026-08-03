# Platform Reliability R1-A — candidate-v3 publication failure receipt

Recorded: 2026-08-03 UTC.

Status: **FAIL CONTAINED; NO IMAGE PUBLISHED; ONE-DISPATCH AUTHORITY
CONSUMED**.

The operator authorized exactly one candidate-v3 image publication from
backend `master` only while it equalled
`f2a840517956c4f480fc9d8aaf6f832ebde489d9`. Full action-time preflight
passed, including two immediate exact-SHA reads, zero prior runs, no exact
GHCR tag, the accepted baseline sidecar and absence of production environment
or repository-level release authority.

The one dispatch created exact workflow run
[`30845173288/1`](https://github.com/Glera/swipe-backend/actions/runs/30845173288)
at exact head `f2a840...`. It failed after 76 seconds at step 17,
`Prove exact pinned LKG against candidate-head PG16`, with:

```text
ImportError: cannot import name 'models' from 'app' (unknown location)
```

## Containment

The failure occurred before candidate build or publication:

- `Build and publish immutable candidate` — skipped;
- manifest and artifact upload — skipped;
- run artifacts — zero;
- private GHCR remained at eight tagged versions and has no `f2a840...` tag;
- backend `master` remained exact;
- no GitHub `production` environment or repository-level Render/release
  authority appeared;
- no Render key/provider mutation, deploy, migration, rehearsal, cutover,
  Stage 1 runtime action, source write, merge, baseline rebuild or second
  dispatch occurred.

The exact full run log is retained by GitHub and hashes to
`6b0a03f90ab5bc438c9cc0ffe6cb6f5a9a5235649ed255400a7ded599fe82613`
(222,086 bytes). The post-run signed-in GHCR DOM observation hashes to
`7ec306daccfc5e049a9b9303c195e00438a9d8cf7b434cd6d653b27cd009508d`.

## Diagnosis boundary

This is a smoke-harness bootstrap failure, not evidence that the accepted
baseline runtime is incompatible with schema `0073`:

1. the LKG image stores application package `app` at `/app/app` and uses
   `WORKDIR /app`;
2. the workflow mounts the current smoke at `/smoke.py` and invokes
   `python /smoke.py`;
3. the `docker run` passes the database/revision and feature flags but not
   `PYTHONPATH=/app`;
4. import therefore fails before any database compatibility query runs.

The minimal expected correction is to pass `PYTHONPATH=/app` into that exact
container invocation and add a regression assertion for the runtime bootstrap.
No source correction or rerun is authorized by this receipt.

The candidate-v3 authority is consumed. Run `30845173288` must not be rerun,
and exact source `f2a840...` must not be redispatched under the old GO. A new
reviewed source-fix packet and a new explicit operator decision are mandatory.

Estimated GitHub usage is two rounded Linux minutes, at most about USD 0.02 if
no included allowance remains. Render spend is zero.
