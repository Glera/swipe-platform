## ISSUE #151 ROW 2 — BOUNDED BASELINE ATTRIBUTION / CONTINUE EXISTING DRAFT

This is the frontier disposition of the exact causal STOP in Issue #94 comment `5423775179`. Do not replay wake `5423597580` and do not recreate the already-started authoring work.

Mac A supplied the missing server-owned projection read-only at `2026-08-26T10:09Z` through its already-authorized live Generator client. The canonical compact row SHA-256 is `b724f649c21de69c865fda0859c593dffa4af8c1eb99798e796eac91ff514eb4` and it proves:

- request `948c42c4-2e87-4c77-86db-b450d11b5de1` exists exactly once;
- request hash `d423195c1bdaa8c6e1739a3b8a158d9046bb43cfaa1d67ac002c506a4d6abf60`;
- playable `merge-timepress-v1-swipe`, source commit `138add5624183a7ba573abd993bedde6ec9cc5e1`;
- exact instruction “В два раза больше очков за каждый заказ”;
- state `open`, queue disposition `queued`, `releaseId=null`, no manual source/release/closure;
- execution remains `blocked / playable_rework_agent_unsupported`.

The fresh projection closes `issue151_live_backend_projection_unavailable_on_mac_b`; Mac B must not receive or infer live credentials.

The repeated `premium 9fps < 45fps` release failure is not waived. One bounded same-machine attribution is authorized:

1. Locate the existing isolated worktree/branch `codex/issue151-timepress-double-points-20260826`. Require the draft to remain uncommitted and limited to the exact paths recorded in STOP `5423775179`; STOP on drift or unrelated mutation.
2. In a separate clean detached worktree at exact playables master `9b4f97fdd538ace4e1de6fcb11f7318b48a7ed70`, run the single matching native `merge-timepress-v1` runtime/release FPS gate once, under the same machine/runtime configuration. This is baseline attribution, not a retry of the changed package.
3. Continue only if the untouched-master run has the same named premium FPS assertion and compatible signature while the package-specific deterministic points tests, TypeScript, focused technical/browser checks and all non-FPS release gates remain green. In that case classify the FPS result as a one-time machine-relative environmental baseline for this package only; it is not an allowlist and creates no future waiver. If master passes, a different test/signature appears, or any package-owned/non-FPS gate fails, return typed STOP without commit/push.
4. Preserve the existing exact `×2` mapping and deterministic test. Complete the required `npm run visual-proof merge-timepress-v1 -- --include <changed paths>` evidence. Commit the existing draft once, push one normal PR, require exact-head repository CI, and merge once under Mac B playables authority only when CI and every admitted package gate are terminal green.
5. Return one causal `HANDOFF_READY` to Mac A with the fresh projection identity above, baseline command/result/signature, exact merged commit/root tree/source tree, changed paths, tests, CI and visual-proof receipt. Mac A may then re-CAS and append exactly one `MANUAL_SOURCE_READY`, and the existing coordinator may materialize the candidate and continue #151 FIFO.

No second baseline run, changed-package release retry, new discovery, backend/Generator/DB/Feed/static mutation, request replay/reset/recreation, manual-source admission, release/candidate, approval/promotion, deploy, credential, setting, permission or infrastructure action is authorized. Any ambiguity is STOP.

