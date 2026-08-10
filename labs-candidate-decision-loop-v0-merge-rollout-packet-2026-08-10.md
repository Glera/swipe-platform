# Candidate Decision Loop v0 — merge / rollout packet

Date: 2026-08-10  
Ticket: [p4g-workspace-meta #91](https://github.com/Glera/p4g-workspace-meta/issues/91)  
Decision: **DRAFT STACK READY; MERGE AND LIVE GO REQUIRED**

## Product closure

One READY notification opens one authenticated Telegram Mini App review. The
review shows the server-owned original request, the exact frozen 9:16 candidate
and a checklist. It offers exactly two product outcomes:

1. **«Принять в тестовую ленту»** records an append-only `accept` decision and
   enters the existing content-bound Telegram authorization path for the exact
   user/dogfood release. It cannot activate a public roster or publish to all.
2. **«Отправить на доработку»** opens the existing text input with system
   dictation, records an append-only `rework` decision, atomically fences the
   old approval capability, marks the parent superseded and admits exactly one
   Fast Lane successor from server-owned lineage.

«Открыть всем» remains outside this feature. No bot callback command, voice-file
ingestion, webhook, scheduler or agent architecture was added.

## Exact candidate stack

| Repository | Base `origin/master` | Candidate head | Draft PR | Exact-head CI |
| --- | --- | --- | --- | --- |
| `swipe-backend` | `4ceb69889167c084b4976bd15ba81186352b64cf` | `e0682cf8f9c91960ca3827b90b1192695462fde9` | [#63](https://github.com/Glera/swipe-backend/pull/63) | PASS: [run 31408343220](https://github.com/Glera/swipe-backend/actions/runs/31408343220), [image 31408343214](https://github.com/Glera/swipe-backend/actions/runs/31408343214) |
| `feed-prototype` | `807185578e544b2732d18c2d4458932f6dab98ea` | `c5715c4708f1ea6b121c67e3a9cae5544b13d52f` | [#32](https://github.com/Glera/feed-prototype/pull/32) | PASS: [run 31408342859](https://github.com/Glera/feed-prototype/actions/runs/31408342859) |
| `swipe-generator` | `a2ffbf790eaa0d6a4092eee857a4a07c403df264` | `6062202b2eb28f01e82ef72c7244ac27d188b761` | [#29](https://github.com/Glera/swipe-generator/pull/29) | PASS: [run 31408343263, attempt 2](https://github.com/Glera/swipe-generator/actions/runs/31408343263) |

The final meta receipt PR is the authority for its own head because a commit
cannot self-reference its SHA.

## Code-path audit and storage decision

The pre-change backend review was GET-only. The existing playable rework POST
required an active roster occurrence, so it could not represent an unpublished
add candidate. Generator `start` carried no parent decision identity, rejected
a second nonterminal release for the same mechanic, and local cancel left the
durable backend READY projection alive. Feed exposed play/restart/manual only.

Migration `0077` held the exact READY review binding but had no append-only
decision, decision uniqueness, actor binding, approval fence, terminal
supersession or successor lineage. Client JSON could not honestly supply those
facts. The narrow additive `0078_candidate_decision_loop` therefore adds:

- append-only decision and successor-lineage rows with unique parent and
  `reworkRequestId` constraints;
- actor, release, intent digest, `reviewBindingDigest` and exact candidate
  identity closures owned and rederived by the server;
- an atomic parent terminal disposition (`superseded`) and approval fence;
- migration compatibility for historical closed rows without fabricating a
  terminal disposition.

No mutable release/candidate/request identity is accepted from the caller.

## Acceptance evidence

| Invariant | Deterministic evidence | Result |
| --- | --- | --- |
| accept/rework exclusive, idempotent and replay-safe | backend unit + PostgreSQL races and changed-mutation conflicts | PASS |
| foreign user/Telegram ID cannot read or decide | TMA auth, actor and exact-user negative tests | PASS |
| rework fences approval and preserves terminal lineage | same-transaction state-machine tests plus successor contract checks | PASS |
| repeated tap creates no second successor | unique decision/lineage constraints and generator replay/restart tests | PASS |
| one READY notification per successor | generator successor handoff and notification receipt tests | PASS |
| public rollout is impossible | accept retains exact-user/dogfood scope; no public activation endpoint or UI action | PASS |
| mobile review at 390×844 | original request, 9:16 platform play, checklist, two outcomes, dictation, cancel and terminal state browser acceptance | PASS |

Verification:

- backend full suite: **1427 passed, 665 skipped, 10 subtests passed**;
- clean PostgreSQL 16 `0078` migration/state-machine acceptance: **3 passed**;
- feed full `npm run lint`, including browser acceptance: **PASS**;
- generator full `npm run verify`: **791 passed, 2 skipped, 0 failed**;
- root tooling/docs suite: **166 passed, 0 failed**;
- all candidate worktrees: `git diff --check` **PASS**.

Generator CI attempt 1 had one unrelated timing failure in the pre-existing
Series Orders browser test. The exact failing test passed immediately in
isolation; one failed-job rerun on the unchanged head completed green, including
the pinned historical UGC closure. No product patch or review input changed.

## Blind cross-provider review

Exactly one bounded blind read-only review used Claude Fable at high effort
(not max) against isolated pre-fix patches, with no author transcript or
self-assessment. Verdict: findings present — one P1, three P2 and four P3.

Seven findings were fixed and covered by regressions: legacy migration wire,
coordinator failure isolation, local cancel bypass, future device
authorization, bounded authorization history, source namespace and rework-form
escape. F006 was rejected deliberately: permitting the old approval path during
a backend-first window would reopen the authority bypass. The rollout therefore
keeps candidate actions paused and deploys **Feed → Generator → Backend**.
Machine-validated detail:
`labs-candidate-decision-loop-v0-auto-review-dispositions-2026-08-10.json`.
No second review round was run.

## Attended merge / rollout sequence — not executed

After a separate operator GO, re-check every PR head and required CI, then:

1. Pause new Fast Lane admissions and decisions; confirm the three live heads
   and a zero-active-mutation window with read-only checks.
2. Merge and deploy Feed `c5715c4`; verify existing review/feed startup only.
3. Merge Generator `6062202`; perform its normal attended restart and read-only
   health check. Do not cancel or retry a live release.
4. Merge Backend `e0682cf`; apply migration `0078` through the existing
   migration path, deploy once, and verify migration head plus read-only review
   GET/auth denial.
5. Resume admissions only after all three deployed heads are exact. Run a
   deterministic non-live fixture for accept/rework/replay before any real
   candidate. A real Smash successor requires its own attended authority.

Rollback is safe only before a decision row is written: revert Feed and
Generator, revert Backend, then downgrade `0078` through the normal migration
path. After any decision exists, do not erase append-only proof or downgrade;
pause admissions and use a forward fix. Public publication/activation remains
forbidden throughout.

## Dependency and non-mutation receipt

The mandatory add-mode fixture comes from Smash ticket
[#82](https://github.com/Glera/p4g-workspace-meta/issues/82) and its
[durable handoff comment](https://github.com/Glera/p4g-workspace-meta/issues/82#issuecomment-5241803721),
meta commit `58e80b187f05d831ad0b1395000c1afec31d1c5f`, receipt-only
[PR #83](https://github.com/Glera/p4g-workspace-meta/pull/83), file
`labs-fast-lane-smash-fest-successor-needs-platform-handoff-2026-08-10.md`.

No merge, deploy, live migration, restart, Telegram send, candidate decision,
approval, rework, publication or activation occurred. Live Smash release
`ab5e07b9-f129-4fc3-aa91-3880bb4f1df7` at source
`a1d86ee337e3d0cf4124d881ca8f7c83e530ee`, Two Dots and Klondike were not
mutated. Development used deterministic fixtures only.
