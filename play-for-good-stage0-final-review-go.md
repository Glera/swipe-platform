# Play for Good Stage 0 — independent final review

Дата: 31.07.2026.  
Reviewer: fresh read-only Claude Code session, Opus, effort `xhigh`.  
Prompt: `play-for-good-stage0-final-review-prompt.md`.  
Reviewed meta candidate: `6aaf026cfc6b226723d3f95f73b8b37b6b5c4a01`.  
Reviewed backend candidate: `6af6b07525446e753c25e7d8790fc5cc1981ad69`.  
Backend evidence merge after GO: `3e6640ea84f405c3ba29a1b6a7fd3090b5db1b9a`.

## Exact reviewer verdict

**GO** — no P1, no P2. Both worktrees were left unmodified (`git status` clean apart from the review prompt file).

## Facts I reproduced rather than read

**1. T+24 receipt is genuinely clean and self-consistent.** I re-executed `verify_manifests()` from `app/island_off_manifest.py:783` against the committed `docs/receipts/stage0-island-off-initial.json` and the `current` block of the 24h receipt. The recomputed result is **byte-identical** to the receipt's `verification` block: `status=clean`, `elapsedHours=24.13442` (≥ `MINIMUM_VERIFICATION_HOURS=24.0`), 15 freeze + 5 protective tables, `violations=[]`. `baselineDigest` equals `shasum -a 256` of the committed initial receipt = `d0bbe8d7…79c1`, and the verification file hashes to `c050df86…f915c`. All 15 freeze tables are byte-identical between captures — not only `rowCount/maxIdentity/stateDigest` but cumulative `dmlStats` (`app/island_off_manifest.py:1012`), which is the strong proof. Gates, DB identity (`postmasterStartedAt 2026-07-14T14:31:31`), and the HMAC `tokenKeyDigest` are equal, satisfying the baseline review's "no restart, no key rotation, no gate change" advisory; the capture at `15:20:19.98Z` is after the earliest valid time `15:12:16.07Z`.

**2. Protective writes are exactly one protective act.** `newProtectiveRows` = 1 report, 1 moderation action, 3 meta events, 0 blocks, 0 friendships — precisely the footprint of `stage0-island-off-protective-smoke-apply.json` (`2026-07-30T18:09:00Z`, inside the window, sha256 `f9b34b0e…4ff99`, `missionContribution:false`). The verifier enforces the allowlists and act↔receipt pairing (`:1060`–`:1282`), and freeze tables were untouched by it.

**3. Drain really preceded runners-off.** PR #29 merged `13:15:26Z` → drain receipt `observed_at 13:17:20.868543Z`, `bake_nonterminal=0`, `theme_nonterminal=0` (PR #31 comment, posted `13:19:01Z`) → PR #31 merged `13:21:49Z`. Independently corroborated by the immutable manifest: `island_bake_jobs` rowCount 11 = 9 `ready` + 2 `failed`; `island_theme_jobs` rowCount 2 = 2 `failed`; both `max_updated_at` on 2026-07-28.

**4. Island-off is real in code, config and client.** `app/island_surface.py:32-46` mounts each contour under its own gate; `app/config.py:294-300` defaults legacy/runners off and protective on; `start_bot_runner`/`start_notification_runner` fail closed (`island_bots.py:735`, `island_notifications.py:535`). `render.yaml:209-268` matches both manifest gate snapshots exactly. The deployed `swipe-platform` `release.json` at origin/master carries profile `44298d1a…` with all three `VITE_ISLAND_*` false — the P1 target, not just the dry run. The log-check's four signatures are exactly the four `[island-*]` tags that exist in source, and the document correctly demotes itself to supplementary.

**5. Platform scheme is deterministic and provenance-bound.** Rebuilding `platform-scheme/build.mjs` in a scratch tree with the exact git provenance reproduces `9645c1fb…5dc5` — the published digest — from VISION `96df90a` / sha256 `e54ee50f…3da9`. Build inputs are identical at `b7fba12` and HEAD. The scheme's pins (`4fddfd6`, `9ff13fa`) are ancestors of the backend candidate, and the initial receipt's bytes at `4fddfd6` hash to the same `d0bbe8d7…`, confirming immutability. Private-artifact-only publication is consistent with the spec: П5.2 says «пересобрать и переопубликовать», never public exposure.

**6. Authority split holds.** `node scripts/docs-boundary-lint.mjs` is clean, and the enforcing test *"root CLAUDE.md is free of mutable-status claims"* passes (113 pass; the 7 failures are local `git 2.17.1` lacking `--initial-branch`, in `platform-reliability-r1-evidence-scan.test.mjs`, unrelated to Stage 0). The new CLAUDE.md paragraph states the durable boundary and delegates mutable truth to `IMPLEMENTATION-STATUS.md`, which now carries the receipts and reframes the 25–26.07 rollout as historical. Stage 0 ТЗ content at the cited authority `4fd56cf` is identical to HEAD.

**7. No Stage 1 code.** Every "mission" hit in `app/` is a substring of "admission"; migrations end at `0070` (unrelated, already on master). `play-for-good-stage1-v8-review-go.md` is spec-only and restates the Stage 0 precondition. Historical puzzle balances are excluded by CLAUDE.md, `render.yaml:239-241`, and the smoke's `missionContribution:false`.

## Merge sequencing — safe as proposed

Backend PR #40 is a single docs-only commit on top of master (no code, no migration, no behavior change), so merge it first; the meta PR cites those paths and digests. Then finalize meta: flip the acceptance status `DRAFT → GO`, set P5.3 to `PROVEN` citing the backend merge and this review, re-run `docs-boundary-lint` (avoid CI/head phrasing), merge. No blocker found in either direction.

## Non-blocking observations (deliberately not findings)

- `render.yaml:219` / `:225` keep 2026-07-25 "rollout approved / explicitly enabled" comments directly above `false` values. Values and the Stage 0 pre-set comment are correct; a "historical" qualifier would remove the reading hazard.
- `play-for-good-stage0-island-off-tz.md:190` lists `recall` among hand-verified contours and the matrix has no recall row. Substance is proven by construction: none of the 39 Stage 0 backend files touch `api_catalog_recall.py`/`catalog_recall_*.py`, `ENABLE_CATALOG_RECALL` is unchanged across the whole range, and `docs/specs/island-off-route-manifest.md:59` scopes it out with a reason (line 22 of the ТЗ qualifies verification «где применимо», and П4.5's smoke list omits recall). Worth one matrix row saying "unchanged by construction".
- `play-for-good-stage0-platform-scheme-publication.md:4` pins `b7fba12` while HEAD is `6aaf026`; harmless — the digest reproduces at HEAD.
- The Stage 1 spec has changed since the reviewed `4fd56cf` (the R8 header line plus the PR #39–mandated amount-authority paragraph); transparently recorded in the spec header and irrelevant to Stage 0 acceptance.
- P1/P3 receipts live in `Glera/playables`, outside the two candidate worktrees; I verified them against that repo's origin/master (`acc872f` flipping the release profile) and the deployed `release.json`.
