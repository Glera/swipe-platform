# Share/Challenge v1 — V1-A0 bootstrap packet: content-addressed runtime release for `pins-swipe`

> **РАЗРЕШЕНО решением оператора (25.07.2026): Challenge v1 механика =
> `marble-sort-swipe`** (у Sort content-addressed release уже существует и
> production-активирован 14.07). Настоящий stop-the-line по `pins` **снят с
> критического пути v1** — этот документ теперь = **investigation record**
> блокировки pins (content-addressed машинерия hard-bound на Sort/Merge,
> pilot policy отвергает pins `unsupported_runtime_mapping`) + каталог
> **переиспользуемых артефактов** (собранный QA-executable pins, воспроизведённый
> digest `sha256:545a95…bf8f` / `545a95c2…`) для **будущей генерализации**
> runtime-release контура на builtin-механики. ТЗ-ссылка:
> `swipe-backend/docs/specs/share-challenge-v1.md` §Bootstrap/§8 (v1.4.1).

Status: **INVESTIGATION RECORD — pins bootstrap отложен; v1 идёт на
`marble-sort-swipe`.** (Ранее: PREPARED — BLOCKED at stop-the-line.)
Author: V1-A0 agent. Date: 2026-07-25. No production steps taken; no pushes to
`swipe-platform` / `playables` / `swipe-backend` master. This file is a draft for
the orchestrator to finalize — **not committed**.

---

## TL;DR

The QA executable for `pins-swipe` builds cleanly and its content-addressed
artifact digest is reproduced (`sha256:545a95…bf8f`). **But the content-addressed
runtime-release machinery — promotion tool, the backend pilot policy, and the
runtime-contract concept — is hard-bound to the Sort and Merge recipes only. It
cannot register `pins-swipe` as implemented.** This was reproduced end-to-end with
the real backend CLI dry-run, which rejects the pins mapping with
`unsupported_runtime_mapping`. Bootstrapping `pins-swipe` onto content-addressed
delivery is therefore **not a "prepare and hand to operator" task** — it needs a
prior engineering + product decision. See "Stop-the-line" below.

There is also a **durable product-decision conflict**: workspace `CLAUDE.md`
(Island Social Core block) states builtin mechanics like pins ship over **mutable
deploy**, and "exact by-digest delivery waits for a content-addressed contour…
tied to the P5/closed-CDN horizon." Putting pins on a content-addressed runtime
release runs ahead of that boundary.

---

## Step 1 — QA executable (DONE)

- **Playable / mechanic:** `pins-swipe` (the dedicated swipe fork dir), built from
  the living pins engine via the `SWIPE=1` / `__TARGET__=swipe` axis. This is the
  correct source of truth — see "Finding: which pins dir" below.
- **Build:** `cd playables && npm run build:swipe pins-swipe` → exit 0.
  - playables `HEAD` = `231ec0432f77b4d1b9b842ff6ed0528e00bf89fd`
  - `pins-swipe` source tree = `ec008d8397e5480cb3a4e140739e03eaa4814eb0`
  - source working tree clean (excluding the generated `dist-swipe/`).
- **Output:** `playables/pins-swipe/dist-swipe/` — externalized videos + assets +
  blob-boot payload (per the swipe pipeline).

### Exact QA executable file set (29 files + sidecar)

`index.html` (1057 B), `payload.js` (734287 B), 21 × `asset-*.{png,webp,avif}`,
6 × `video-*.mp4`, plus the QA sidecar `runtime-artifact.json` (5139 B,
`releasePlayable` is *not* set on the sidecar — it is a QA artifact, not a release).

Full per-file byte sizes + sha256 are in the staged sidecar (Step 3 path).

---

## Step 2 — Digests

### 2a. `runtimeArtifactDigest` — REPRODUCED ✓

`sha256:545a95c2064c1485e3053dc7fae0c095672f90cd619c94d5a34971529997bf8f`

- Method (identical to how marble-sort's `sha256:d66b4e…` was produced):
  `playables/scripts/stamp-runtime-artifact.mjs`, framed digest
  `sha256(DOMAIN ++ Σ[u32(len path) ++ path ++ u64(len bytes) ++ bytes])` over the
  sorted file set, with the embedded digest normalized to the
  `sha256:000…000` placeholder before hashing (the file can't hash itself).
  `DOMAIN = "swipe.runtime-artifact.normalized.v1\0"`.
- The `swipe-ugc` verifier (`worker/runtime-artifact.mjs`) uses the **same** DOMAIN
  and framing, so the digest scheme is cross-repo compatible.
- Independently re-verified against the staged archive:
  `node scripts/stamp-runtime-artifact.mjs --verify <staged-dir>` → `sha256:545a95…`.

Note: this is the digest of the **unprefixed dist-swipe file set** (same convention
as marble's content-addressed archive, which held unprefixed `index.html` +
`payload.js`). It is **not** the deployed-in-`swipe-platform` digest — the deploy
step (`export-swipe.sh` → `restamp-runtime-export.mjs`) rewrites payload/asset/video
URLs with the `pins-swipe.` prefix + `?v=` cache-bust and re-stamps a *different*
digest for the flat feed alias. The content-addressed release must use the
unprefixed archive digest above.

### 2b. `runtimeContractDigest` — **FINDING: does not exist for pins** ✗ (BLOCKED)

`runtimeContractDigest` is defined only for recipe mechanics:
- Sort: `sha256(JCS(swipe-ugc/recipes/sort/levels/sort.runtime-contract.v1.json))`
  = `c79a84694f02dad356822fa1b3f3d039b8f056f23f1300ff536a072e54c3b625`
  (computed by `recipes/sort/levels/contract.mjs`).
- Merge: `sha256(JCS(recipes/merge/art-v1/merge.raster-runtime-contract.v1.json))`.

Pins is a hand-authored Canvas2D physics creative in `playables/`. It has **no**
recipe, no LevelSpec/oracle/logical-scheduler contract, and therefore no
`runtime-contract` object and no digest. The descriptor field is required, so this
is a hard gap.

**Minimal proposal (NOT authored — proposal only, per "don't fix deeply"):** if pins
is to be content-addressed, define `playables/pins-swipe/pins.runtime-contract.v1.json`
capturing pins's *stable runtime identity surface* (not sort's oracle constants),
e.g.:

```jsonc
{
  "contract": "pins.runtime-contract.v1",
  "mechanicId": "pins",                 // client's sole runtime authority (fail-closed)
  "levelQuery": { "param": "level", "builtinLevels": [1, 2, 3, 4, 5] },
  "host": { "protocol": "postMessage", "completion": "notifyPlatform:completed" },
  "renderer": "canvas2d",
  "dprCap": 2
}
```

with `runtimeContractDigest = sha256(JCS(object))` via the same canonicalization as
`contract.mjs`. This is a **new contract type**, not a drop-in — it needs design
sign-off (pins has no deterministic-replay/oracle guarantees the way sort does).

### 2c. Descriptor JCS hash — computed for the DRAFT (see Step 3)

`descriptorHash = sha256(JCS(descriptor))` = `b41411c321d62091d556abb78298dcf0337f9ebd0cb396efb3f1e498566f5f58`
— **provisional**, because the draft carries placeholder values for the three blocked
fields (`runtimeContractDigest`, `qaBaselineId`, `qaManifestDigest`). It will change
once those are real.

---

## Step 3 — File set + descriptor (DRAFT, staged locally)

Staged content-addressed archive (scratchpad, not in any repo):

```
<scratchpad>/runtime-releases/pins-swipe/545a95c2064c1485e3053dc7fae0c095672f90cd619c94d5a34971529997bf8f/
  ├── index.html  payload.js  asset-*.{png,webp,avif}×21  video-*.mp4×6   (the 29-file executable set)
  ├── runtime-artifact.json     (QA sidecar; digest = sha256:545a95…)
  └── runtime-release.json      (DRAFT descriptor, releasePlayable:true, canonical RFC 8785 JCS)
```

The draft descriptor validates against `RuntimeReleaseDescriptorV1` and passes the
CLI's canonical-bytes + content-addressed-path checks (`load_exact_runtime_release_descriptor`
→ LOAD OK). Blocked fields hold clearly-marked placeholders:
`runtimeContractDigest = 0…0`, `qaManifestDigest = sha256:0…0`,
`qaBaselineId = pins-swipe-qa-draft-placeholder`, `capabilities = {builtinSwipeRuntime:true}`,
`mechanic = pins`, `variant = base`.

**The authoritative descriptor cannot be produced by the real tool.** The canonical
producer is `swipe-ugc/scripts/promote-runtime-release.mjs`, which is Sort/recipe-only
(see stop-the-line). This draft is a hand-authored stand-in for the dry-run and for
review; it is **not** a promote-tool output.

---

## Step 4 — CLI registration dry-run (RAN — deterministic rejection)

Real backend CLI, dry-run (no `--apply`), env:
`ENABLE_RUNTIME_RELEASE_BOOTSTRAP=true`, `RUNTIME_RELEASE_ORIGIN=https://swipe-platform.onrender.com`,
`RUNTIME_RELEASE_BOOTSTRAP_ACTOR_USER_ID=1`.

```
$ python -m app.runtime_release_bootstrap register \
    --descriptor <staged>/runtime-release.json \
    --release-id 00000000-0000-4000-8000-0000000000a1 \
    --legacy-variant-id 00000000-0000-4000-8000-0000000000b1
{"code":"unsupported_runtime_mapping","message":"the pilot accepts only frozen Sort or Merge raster-art mappings"}
exit=2
```

- The rejection comes from `validate_pilot_runtime_release_candidate`
  (`app/runtime_release_service.py`), a **hard allowlist** of exactly the frozen
  Sort mapping and the Merge raster-art mapping. It runs **before** any DB access,
  so no PostgreSQL is needed to observe it and a disposable-PG-at-head run would
  print the identical rejection. (Local `initdb` is additionally blocked by SysV
  SHM exhaustion on this Mac, per `docs/specs/runtime-release-bootstrap.md`.)
- **Control:** the same harness against the real marble-sort descriptor passes the
  pilot gate and proceeds to the DB layer (fails only on the intentionally-dead DB
  connection) — proving the pins rejection is a pins-specific policy gate, not an
  environment artifact.

Fresh trusted probe: **operator step, deferred.** The probe re-fetches the hosted
descriptor+sidecar+every executable from the server-owned origin and is only
invoked at `activate` — it cannot run until bytes are hosted (flow step 2) and, for
pins, until the mapping is admitted. Not reachable in this packet.

---

## STOP-THE-LINE (why this cannot proceed to activation)

Content-addressed runtime-release for `pins-swipe` is blocked at **three code layers
plus a product boundary**. None are "prepare-and-hand-off"; each is an explicit
decision/implementation:

1. **Promotion tool is Sort/recipe-only.**
   `swipe-ugc/scripts/promote-runtime-release.mjs` requires a pinned QA baseline
   (`generator/baselines.json`) with `template ∈ {sort}` and a QA wrapper whose
   `purpose ∈ {level-spec-oracle-qa-base-only, skin-spec-presentation-qa-base-only}`.
   It hard-fails for `mechanic != pin.template`. There is no pins baseline, no pins
   QA wrapper, no pins recipe. It **cannot emit a pins descriptor.**

2. **Backend pilot policy rejects pins** (reproduced above):
   `validate_pilot_runtime_release_candidate` admits only the frozen Sort mapping
   (`sort/base/marble-sort-swipe`) and the Merge raster-art mapping
   (`merge-locked-v1-swipe`). Adding pins means adding a new mapping + a pins
   capability set (+ `_PILOT_CAPABILITY_SETS`) — a deliberate policy change.

3. **No pins runtime contract exists** (Step 2b): `runtimeContractDigest` is
   undefined for pins; a new contract type must be designed and signed off.

4. **Product-decision boundary** (workspace `CLAUDE.md`, Island Social Core block):
   builtin mechanics like pins **ship over mutable deploy** today; "exact by-digest
   delivery waits for a content-addressed contour and is tied to the P5/closed-CDN
   horizon." Content-addressing pins now runs ahead of that stated horizon and
   should be an explicit operator/product decision, not inherited from this task.

**Recommendation:** escalate to the orchestrator/human. Either (a) formally decide to
generalize the runtime-release contour to builtin non-recipe mechanics (design the
pins runtime contract, a pins QA-baseline path, generalize the promote tool, extend
the pilot policy — then re-run this packet), or (b) confirm pins stays on mutable
deploy for Share/Challenge v1 and content-addressing is deferred to the P5 horizon.
The QA executable + reproduced artifact digest in this packet are reusable inputs
for path (a).

---

## What IS verified / ready (reusable regardless of decision)

- ✓ pins-swipe QA executable builds deterministically from a clean, pinned source
  (commit/tree above); exact 29-file set captured.
- ✓ `runtimeArtifactDigest = sha256:545a95…bf8f` reproduced by the canonical method
  and independently re-verified against the staged archive.
- ✓ Content-addressed archive is self-consistent: it byte-verifies to its digest
  and the draft descriptor passes the CLI's schema + canonical + archive-path load.
- ✓ Backend behavior proven by dry-run: pins is rejected by policy; marble-sort (the
  control) passes the same gate.

## Operator sequence — the approved flow, and where it currently halts

1. playables prepares QA executable → **done** (this packet).
2. swipe-platform hosts immutable bytes at
   `runtime-releases/pins-swipe/545a95…/` → **do NOT do yet** (blocked: no admissible
   mapping; would host bytes for a release that cannot be registered).
3. backend CLI `register` candidate + fresh probe → **BLOCKED** at the pilot gate
   (`unsupported_runtime_mapping`), reproduced.
4. human authorizes activation → **not reachable.**

## Secondary findings / prep items

- **Which pins dir is canonical for swipe:** `pins-swipe/` (the fork), not the base
  `pins/`. Evidence: `pins-swipe/src` is newer than `pins/src` (resynced 2026-07-10),
  it carries a swipe-specific `playable.config.ts` (`id:'pins-swipe'`, `dprCap:2`),
  the feed manifest id is `pins-swipe`, and `build-swipe.sh`/`export-swipe.sh` treat
  the dedicated fork as the deploy source of truth. The auto-memory note tagging
  `pins-swipe/` as "STALE" is **superseded** by the later "swipe forks are canonical
  & independent" resolution and should be reconciled.
- **No canonical lock for pins-swipe:** `playables/canonical/swipe-locks.json` locks
  only `marble-sort-swipe`. A real pins release should add a `pins-swipe` lock
  (approvedCommit/Tree) so `check-swipe-canonical.mjs` freezes the release source —
  a prerequisite prep item, mirroring marble-sort.
- **No branch/push needed:** the build required no fork fixes, so branch
  `playables-challenge-v1a0` was not created and nothing was pushed.
