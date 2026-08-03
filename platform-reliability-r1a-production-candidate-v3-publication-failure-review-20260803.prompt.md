# Independent review — R1-A candidate-v3 contained publication failure

Review exact meta commit
`1844a592e9afbb3f19960513c4bf01e2467b88a4` in
`/private/tmp/p4g-r1a-meta.YPUxDz`.

Use Read only. Do not edit, fetch, browse, call external APIs or perform any
mutation. Return first line exactly `GO` if no P1/P2 remains; otherwise
`NO-GO` with only exact P1/P2 findings and file/line. Keep under 900 words.

Review these exact files and cited committed authority/evidence as needed:

- `platform-reliability-r1a-production-candidate-v3-publication-failure-20260803.json`;
- `platform-reliability-r1a-production-candidate-v3-publication-failure-20260803.md`;
- `platform-reliability-r1a-production-candidate-v3-publication-failure-disposition-20260803.md`;
- candidate-v3 request/runbook/reviews and baseline receipts.

Verify:

1. The one-dispatch operator authority was consumed exactly once by run
   `30845173288/1` at exact source `f2a840...`, with no retry or implied reuse.
2. Containment claims are internally supported: build/publish/manifest/upload
   steps skipped, zero artifacts, exact GHCR tag absent after the run, source
   unchanged, and no Render/environment/deploy/migration/rehearsal/cutover or
   Stage 1 runtime action.
3. The failure evidence supports classification as a container Python-path
   bootstrap defect: baseline Dockerfile uses WORKDIR `/app` and stores code
   at `/app/app`; the current workflow invokes mounted `/smoke.py` without
   `PYTHONPATH=/app`; the exact ImportError occurs before DB compatibility
   work. Flag if this reasoning overclaims or hides a plausible real LKG/schema
   incompatibility.
4. Adding exact `-e PYTHONPATH=/app` plus a mutation-resistant workflow test is
   the narrow sufficient proposed correction, without weakening the LKG smoke,
   widening compatibility or changing product/Mission runtime behavior.
5. The proposed next sequence correctly requires a new source-fix authority,
   source diff/CI/review/merge, then a new candidate-v4 publication authority;
   it does not authorize rerunning run `30845173288`, redispatching `f2a840...`,
   editing source, merging, publishing, provider actions or later rollout now.
6. The machine/human receipts agree on identities, timestamps, log hash,
   failure point, containment, cost and deny-list. Note any unsupported claim
   as P1/P2 if it affects the next authority boundary.

A GO is review evidence only. It grants no corrective source work, workflow
dispatch or operational authority.
