# FIX MUTATION PIPELINE v0 — execution receipt

Date: 2026-08-09

Status: **COMPLETE — `GO FAMILY A`**

Ticket: [Glera/p4g-workspace-meta#78](https://github.com/Glera/p4g-workspace-meta/issues/78).

Authority:

- meta master `d007deea66285a4aca9653bdc17118a2fc6a0168`;
- `labs-mechanic-variation-throughput-audit-execution-receipt-2026-08-09.md`;
- the then-current `STATE.md`;
- `docs/specs/two-mac-development-operating-model.md`.

Implementation PRs:

- [swipe-ugc#7](https://github.com/Glera/swipe-ugc/pull/7), exact head
  `36c15aff1cb59d008833dd09e0c612504dcbb546`;
- [swipe-generator#26](https://github.com/Glera/swipe-generator/pull/26), exact
  head `333d69c16357fc88ea43d0748a008e88e957cfd9`.

Neither PR was merged. No Family A run, production change, publication,
catalog/feed/roster mutation, live-factory write, deploy, credential use or
migration was performed.

## 1. Delivered path

One command now accepts the bounded
`lab.mechanic-mutation-request.v0` document and performs the complete
candidate-only path:

1. validate the fixed request schema; executable `steps` or another DSL are
   not accepted;
2. require a clean exact playables top-level, including no untracked files and
   no hidden index flags;
3. verify credential-free repository URL and live remote CAS for baseline and
   candidate refs;
4. fetch and verify both commits, root trees, source subtrees and baseline
   ancestry;
5. reproduce and verify the bounded full-index binary patch, exact changed
   paths, action-plan blob/bytes and package lock;
6. create a no-hardlinks disposable candidate checkout;
7. run the existing strict technical profile, SWIPE build, real-pointer
   action-trace and before/after visual-proof primitives;
8. canonicalize only volatile capture timing while preserving behavior and
   runtime identity;
9. repeat remote CAS and clean-source checks at the write boundary;
10. call the generic UGC packager and Generator registrar programmatically;
11. write only into new physical marker-gated sandbox roots and return a
    deterministic receipt.

No per-mechanic behavior, role vocabulary or audit candidate ID is hardcoded in
UGC or Generator. A future supported mutation supplies a new bounded request;
it does not require source edits in either repository.

## 2. Golden TD-O2 identity

Request: `labs-fix-mutation-pipeline-v0-td-o2-request-2026-08-09.json`.

| field | exact value |
| --- | --- |
| repository | `https://github.com/Glera/playables.git` |
| baseline ref / commit | `refs/heads/master` / `cb581e71e57f60822247d8ac2077e73adff86e88` |
| baseline tree / source tree | `b9bc5870ee349bf054b632edd0d22d477f6271f7` / `e8173eb409361e4bb2c7667c39dba2292fffb03f` |
| candidate ref / commit | `refs/heads/codex/labs-variation-obstacle-20260809` / `ccfa98692a1512790ee9b199047f5b7e1c0b789d` |
| candidate tree / source tree | `b95c8c11aa0b7c709a1c2435c8b364a9fc1ee501` / `72c133f4c94980d0866e7ac2abc0d4e7645a60e1` |
| full patch | 78,894 bytes, `sha256:448dfb9516540bae345a965f83ef171463693a4ea1d84a0fa747e1ae800beb87` |
| runtime | `sha256:1f00d79ac06adc87413501f9807bafdcca45d51b6030ec2a424644e9d957bf77` |
| canonical trace | `sha256:2c67fc7f00e97c476af1c33589d88afa16665cdd05b4efb9cb3f2bb96651910c` |
| candidate | `orthogonal-link-v1-td-o2-d213b0e79592` |
| research pack | `sha256:c9e36be812a75743f221cedbef1f039f795d904c2b925a54c9961c641a3a7b08` |

Behavior remained the audited Level-2 obstacle behavior: opener
`[[0,1],[0,2],[1,2]]`, locked cell `[2,2]` released only after its subgoal
closed, seven accepted real-pointer actions, zero invalid/autoplay actions, no
page errors and terminal `won`.

## 3. Reproducibility and safety

Two fresh final runs produced:

- identical candidate IDs, runtime, canonical trace and research-pack digest;
- byte-identical seven-file UGC trees, aggregate hash
  `1206957b34ff20c0e56e55a198dd2598b456c06f4b79ecd03807959cc865f9ca`;
- byte-identical five-file Generator trees, aggregate hash
  `b998f824934146015df873d1ea8901a0d9a4dbcad84de669d8f60868516e61b2`;
- projection `technicalOutcome=build_ready` and
  `publicationEligible=false`, `catalogEligible=false`,
  `feedEligible=false`, `review=null`.

Raw browser traces had different capture-duration bytes, as expected. The
candidate identity uses a canonical wrapper that strips only top-level
`timings` and per-action `captureMs`; the complete raw traces and visual-proof
receipts remain in the volatile execution roots.

Both UGC and Generator materializers refuse a nonempty root without their
exact candidate-only marker. The runner narrows child environment propagation
to runtime/tooling variables and does not forward token/key variables.

## 4. Verification

- UGC `npm run verify`, Node `24.14.0`: PASS — 145 pass, 0 fail, 2 skipped;
  base bake verified and preview autoplay reached WIN.
- Generator new suite: PASS — 13/13.
- Generator `npm run check`: PASS.
- UGC exact-head CI for `36c15af`: PASS —
  [run 31334153902](https://github.com/Glera/swipe-ugc/actions/runs/31334153902).
- Generator exact-head CI for `333d69c`: PASS, including the full `npm run
  verify` job and the pinned experiment-worker cross-repo closure —
  [run 31334153674](https://github.com/Glera/swipe-generator/actions/runs/31334153674).
- Golden combined pipeline: PASS twice locally; PASS twice independently in
  Claude review.
- Independent review: **GO, no P1/P2 findings**. Receipt:
  `labs-fix-mutation-pipeline-v0-claude-review-receipt-2026-08-09.md`.

The Generator workflow deliberately checks out two UGC identities: current
factory content at `b8be78d` and the immutable historical worker release at
`70f50d4`, routed through `SWIPE_EXPERIMENT_WORKER_UGC_ROOT` and
`SWIPE_LEVELS_UGC_ROOT`. That declared closure is green in exact-head CI.

A naive local diagnostic with only one sibling cannot represent both contours:

- with current UGC `83357fb`, 757/767 pass and four old exact-pin tests reject
  the worker/derivation drift;
- with accepted worker UGC `70f50d4`, 733/754 pass and 15 later factory tests
  reject the missing Merge recipe introduced after that pin.

Those local results are a checkout-shape caveat, not a failed acceptance: the
worker-pin tests pass on `70f50d4`, the factory contour passes on current
content, and all 13 new tests pass in either checkout. This ticket did not alter
either old authority contour or hide the split with index flags or copied files.

## 5. Bottleneck N before/after

The completed audit measured `0.580` active agent-equivalent hours (`34m48s`)
for manual mutation packaging/admission across UGC and Generator.

The new golden acceptance required:

- zero manual UGC edits;
- zero manual Generator edits;
- one bounded request document;
- one unattended command, independently measured by the reviewer at `1m57s`.

The manual cross-repository part of bottleneck N is therefore eliminated for
the supported golden closure: `34m48s → 0` manual packaging time. Including
unattended compute as a conservative comparison gives `34m48s → 1m57s`, a
`32m51s` (`94.4%`) reduction. The two quantities are not treated as equal
labor metrics: the latter is machine wall time, not active agent time.

## 6. Terminal decision

The exact golden Level-2 mutation passes the new candidate path without manual
cross-repository stitching, stays byte-stable and gains no publication or
product authority.

Frozen terminal decision: **`GO FAMILY A`**.

This is a decision receipt, not authorization to run Family A inside this
ticket. Starting Family A requires a separate active goal and its own bounded
contract.
