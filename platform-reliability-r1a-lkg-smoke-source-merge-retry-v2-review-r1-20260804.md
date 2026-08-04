# R1-A LKG smoke source-merge retry-v2 — independent review R1

Reviewed: 2026-08-04 UTC.

Verdict: **NO-GO — three P2 findings, zero P1** on exact substantive commit
`d0782c8e72271acb580fbbde2f89f0a5b0125a67`.

Independent Claude Opus/xhigh safe-mode session
`42be90b8-19d0-4e79-8b8c-ab39c9d1b814` used Read and bounded local
read-only commands. It made no fetch, `gh`, web, browser, credential, edit or
external mutation calls. Two broader local commands were denied.

The reviewer confirmed all source/CI/provider/merge pins and the deny-list, but
blocked the packet on three credential-boundary defects: the full non-browser
value-surface ban had been dropped; eventual reveal/Done elements were
incorrectly listed as pre-grounded; and block failures could emit provider
exception text. All three findings and seven P3 advisories are accepted and
fixed in the follow-up delta.

The internal subscription meter reported USD `1.5980635`; this is review
telemetry, not a separate billed API charge assertion.

This NO-GO grants no operator authority and permits no operational action.

## Verbatim result

I have everything I need. Verification performed: purely additive commit (195/99/109 lines, 0 deletions), all four referenced commits (`c7aa22e`, `69430e3`, `29d184e`, `d635398`) resolve and are ancestors of `d0782c8`, JSON parses, and I diffed every pin against the consumed authority packet, the accepted failure receipt/review, and the recovery-v3 NC-2 disposition.

# `NO-GO` — 3 P2 findings, 0 P1

The packet's core idea is sound and the source/CI/provider/merge pins are clean, but three defects sit in exactly the credential-observation area the retry exists to fix.

## What is correct

- **Pins identical (Q5).** `pullRequest`/`ci`/`providerCapture`/`execution` in `…retry-v2-authority-request-20260804.json:16-67,126-142` match `…source-merge-authority-request-20260803.json:8-67,103-119` byte-for-byte on base `f2a8405…`, head `223ab97…`, tree `75dbd88…`, 1 commit, 28 checks, runs `30849622831/1` + `30849622812/1` with 0 artifacts, all five provider IDs, `master` + `./Dockerfile.bake`, all-false automation, and the three capture blobs. The only change, `expectedActiveDeploys` → `expectedActiveDeploysOrPreDeploys` (`:57`), implements accepted P3 #3. `acceptedFailureEvidence` (`:7-15`) matches `…failure-20260804.json:76` and `…failure-review-20260804.md:5-9` exactly.
- **Deny-list intact and extended (Q6).** All ten prior `forbiddenActions` survive verbatim at `:181-193`, plus post-submit browser observation at `:183`; `mergeAttempts:1`, `mergeRetry:false`, `replacementKey:false`, `nextAuthority` (`:194`) and runbook `:108-110` hold the line before candidate-v4, environment creation, rehearsal and cutover. No wording authorizes browser diagnostics, a replacement key, merge retry, publication, provider mutation, deploy or Stage 1.
- **Masked-vs-emitted distinction is precise in itself (Q1).** `:83-84` and `…request.md:38-41` correctly separate "exists in provider DOM" from "enters output"; a masked prefix that is never resolved into output is genuinely not a surface event. Requiring an empty initial inventory (`:71`, runbook `:18`) makes the single key row structurally unique, so the exact non-secret name filter is belt-and-braces, not a text read (Q2, in principle).
- **Fallback direction is right (Q4).** `:124`, `…request.md:60-64` and runbook `:80-85` correctly forbid inspection and replacement keys, route to attended manual revocation, and end terminal with no merge. Because the no-observation window's end conditions (`:82`) can never be met on that branch, the forbidden list stays in force through the stop — a well-formed construction.

## P2 findings

**P2-1 — the prior literal value-surface hard stop is not carried forward (Q1).**
`hardStops` (`…retry-v2…json:153-162`) replaces `"temporary key value appears on any forbidden surface"` (`…20260803.json:133`) with a browser-only, post-submit stop (`:155`). The enumerated `forbiddenValueSurfaces` — argv, shell history, chat, tool parameter, returned object, stdout, stderr, receipt, git, hash (`…20260803.json:83-97`; prose at `…20260803.md:45-48`) — appears nowhere in the new packet; a grep for those terms returns only browser-scoped or masked-representation clauses (`:84,94,183`). The runbook likewise drops "never argv or tool output" (`…runbook-20260803.md:44-45`, cf. retry runbook `:50-51`) and "No key value or derivative enters receipts" (`…runbook-20260803.md:58`, cf. retry runbook `:103-106`, and `:179` "publish bounded receipts" vs the old "commit bounded receipts **without credential material**"). Since the prior authority is declared consumed (`:14`) and the GO form names this packet "only", the executor operates solely under this enumeration. The masked-DOM carve-out is fine; the collateral narrowing of the *real* credential's non-browser surfaces is not. Restate the full surface list and the literal value hard stop.

**P2-2 — post-submit-only elements are listed as pre-grounded, and preflight demands grounding them before submit (Q3).**
`preGroundedCreateLocators` (`:104-111`) includes `"post-submit div[role=textbox]"` (`:109`) and `"dialog-scoped button Done"` (`:110`) — neither exists before submit. `requiredPreflight:150` then requires "all live create locators … are grounded before submit", and runbook `:24-25` says to ground "every live create locator … **named in the authority JSON**". `…request.md:33-34` exempts only key-row/dialog locators. This contradicts accepted NC-2 hardening, which states the reveal element "cannot be inspected before submit" and must be validated block-locally inside the final call (`…recovery-v3-merge-v2-corrective-disposition-20260803.md:95-98`), and the precedent phrasing "the **eventual** post-submit contract" plus the explicit post-submit-`Done`/pre-submit-`Close modal` distinction (`…recovery-v3-merge-v2-runbook-20260803.md:40-41,55-56`). The runbook's own body is correct ("already-**contracted** `div[role=textbox]`", `:33`), so the JSON list is the defect — and it pushes an executor either into a false preflight failure or into a post-submit observation to satisfy the literal clause. Symmetrically misfiled: `"exact No provisioned API keys text"` is groundable pre-submit but sits in `preCommittedRevokeLocatorContract` (`:120`). Split into pre-grounded vs post-submit-contract sets.

**P2-3 — nothing requires the non-emitting blocks to suppress error/exception text (Q2, Q4).**
`:122` claims the revoke block "returns no observation"; `:124` and runbook `:80-81` claim "make no DOM observation" on mismatch. But a class-based `hasText` locator's normal failure modes — strict-mode violation and unmet-wait timeouts — surface provider-supplied element markup/text in the error, which reaches tool output without any "return". That is precisely the branch the fallback contemplates, so the packet's guarantee is unmet exactly where it matters, and it would re-emit the masked row that caused `…failure-20260804.json:76`. Fail-closed behaviour still holds (it trips `:155` and stops), but the packet must state it: require every locator resolution, count, click and wait inside both blocks to be exception-suppressed and to return only a fixed non-textual status code, with re-raising of provider-supplied strings forbidden.

## P3 advisories

1. The accepted source-fix evidence pin `d635398…` and `acceptedReview` (session `ed223f76…`) from `…20260803.json:7,22-28` are not restated; traceability now runs only through the failure receipts. Also dropped: `settledBaselineAuthority` (`…20260803.json:66`).
2. `li.border-b.border-primary` (`:113`, `…request.md:51-52`, runbook `:64-65`) appears nowhere in prior tracked evidence; "pre-committed **reviewed**" overstates it, since no reviewer can validate a selector observed only in the consumed window. State the provenance.
3. NC-2 forbids "method/tag/count diagnostics after submit … even when they do not contain secret bytes" (`…disposition-20260803.md:100-101`); `allowedNonEmittingOperations:99` permits post-submit block-local counts. The relaxation is necessary and non-emitting, but the packet should say it reconciles NC-2 rather than passing over it silently.
4. The exact non-secret key-name string is never pinned ("the exact … key name", runbook `:29,66,70`); say it is generated in-window and recorded in receipts.
5. Repository-level `RENDER_*`/`PLATFORM_RELEASE_*` absence (`…20260803.json:126`) is now the looser "repository release authority remain absent" (`:147`).
6. Dropped without replacement: hard stop on shared-home/`0600` validation failure (`…20260803.json:132`, now preflight-only at `:151`); "restore PR 53 to draft if it was marked ready" in `failurePolicy.beforeMerge` (`:164`, retained only in runbook `:98`); the post-write host-side `0600`/regular/non-zero-size handoff check (`…recovery-v3-merge-v2-runbook-20260803.md:58-60`); and the exact capture CLI invocation (`…runbook-20260803.md:35-42`).
7. `…request.md:79-84` omits "merge any PR other than #53" and auto-merge/retry, which `:188-189` do cover.

Fixing P2-1 through P2-3 is additive text in the two authority files plus one runbook clause; nothing in the source, CI, provider or merge boundary needs to change. This review grants no operator authority and permits no operational action.
