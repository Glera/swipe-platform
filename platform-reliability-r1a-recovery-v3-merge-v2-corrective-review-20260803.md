# R1-A recovery-v3 merge-window v2 — independent corrective review

Reviewed substantive commit: `73121940d6c195b7e5277dfd30da88535821f10d`.

Session: `8e4c12fe-111b-44cb-a80e-322701d8ddeb`.

Mode: Claude Opus, xhigh, safe/read-only. Internal subscription usage meter:
`1.2969365`; this is not asserted as a separate invoice.

## Verbatim result

## GO — review evidence only; no P1/P2

Independent read-only review of meta commit `73121940d6c195b7e5277dfd30da88535821f10d` (= `7312194`, adds only the two corrective docs; worktree clean apart from the untracked review prompt).

**1. Identity, receipts, ledger — consistent.**
`preflight.backendBase/backendHead/backendTree` (`…json:14-16`) equal `sourceMerge.firstParent/secondParent/tree` (`…json:55-57`), and match the pre-merge CAS in `platform-reliability-r1a-recovery-v3-merge-failure-20260803.json:24-28`. Timeline is ordered: capture `18:02:38Z` → inventory `18:03:30Z` → merge `18:04:53Z` → receipt `18:07:48Z` → checks closed `18:11:05Z`. Hashes recomputed and matching: capture tracked `c23b3dd…`, capture canonical (JCS form, newline-stripped) `cea5167…`, inventory `2e0659e…`. Capture is `status=PASS`, `autoSync:false`, three services `autoDeploy:false`; inventory shows `activeCount:0` for syncs, all three deploy streams and web jobs, `operations:["GET"]`. `forbiddenActions` (`…json:80-90`) is all-false and matches the prose ledger (`…md:27-29`).

**2. NC-1 correctly classified.** Settled pre-merge authority pins `./Dockerfile.bake`: `platform-reliability-r1a-cutover-preparation-v2-authority-request-20260803.json:68`, `platform-reliability-r1a-cutover-preparation-v2-runbook-20260803.md:70`, and the 2026-08-01/08-02 production captures (all three services). The sole contradictory pre-merge text is the newer `platform-reliability-r1a-recovery-v3-merge-v2-runbook-20260803.md:76`; `./Dockerfile` is the *candidate* manifest shape (`platform-reliability-r1a-production-successor-v2-20260803.md:31`, "three compact `./Dockerfile` paths"). With Auto Sync off, all Auto Deploy off and zero active syncs/deploys/jobs, the source merge was provider-isolated. Classification as authority-document defect, explicitly not relabelled PASS, is correct.

**3. No silent future approval.** `…corrective-disposition-…md:57-64` and `:120-122`, plus the request's `:26-30`, withhold source-path, publication, deploy and cutover authority and require the next packet to separate baseline / candidate / transition.

**4. NC-2 does not understate exposure.** Recorded sequence: DIV `code-snippet` with textbox role → two sanitized attempts failed before writing → count/method/tag/length diagnostics while the reveal stayed open → one non-emitting `textContent` write/fsync/`Done`. `revealValueEmittedOrHashed:false`; key used GET-only, revoked before merge, empty UI inventory, exact 401, `0600` handoff removed. None of count/method/tag/length is a credential byte or derivative that narrows the key (Render keys are fixed-shape). The comparison case is decisive: the prior window's real exposure (`…merge-failure-…json`, `exposed_in_tool_output:true`, only HTTP 400 probes) was escalated as a contained FAIL, so this is not a downgrade of a like event. Terminal classification as process nonconformity is supportable.

**5. Hardening prevents recurrence.** `…disposition:89-97` pins the DIV/`textContent` contract before submit, one non-emitting final call, forbids post-submit diagnostics even when non-secret, and fails to immediate revocation — each maps to a specific step that failed.

**6. NC-3 accurate.** Both bootstrap attempts stopped before any HTTP request (`…json:75`); the capture ran from a disposable venv with only pinned SQLAlchemy/Alembic/rfc8785. Preflight remedy (pin interpreter and deps before key creation) is adequate.

**7. Operator form is disposition-only.** `…corrective-authority-request-…md:20-30` accepts exactly the three dispositions plus the completed merge as source authority, with an explicit deny-list covering dispatch, publication, Render key/provider, GitHub environment, deploy, migration, rehearsal, cutover, Stage 1.

**8. No rollback or key rotation required.** No provider mutation occurred; the only key of this window was revoked pre-merge and proved 401, and the earlier exposed key was already revoked with empty inventory. Nothing to rotate, nothing to revert.

### P3 (non-blocking)

1. `…merge-v2-20260803.md:5` says "TWO … NONCONFORMITIES" and folds the Python bootstrap into §2 (`:66-69`), while the ledger records three (`…json:60-79`). Align counts.
2. Merge identity `f2a840…`, head `8ea6f1d…`, tree `a7e4c64…` and CI runs `30839644353/30839644830` are attestation-only here: the local backend clone (`/tmp/p4g-r1a-backend.5rEEAs`) is stale at `f0cc933` and lacks those objects; read-only scope forbids fetching. State this limitation in the packet.
3. `…disposition:89-91` should note that `code-snippet` cannot be observed pre-submit — the pre-commitment is contractual — and that mismatch detection is in-call, block-local shape validation with no emission.
4. NC-2 could record that the sanitized diagnostics persist in the session transcript (metadata only) as an accepted, non-remediable residue.
5. NC-3 remedy could require recording the interpreter path/venv package set in the receipt.
6. The operator form must have `<exact-reviewed-meta-commit>` replaced with `73121940d6c195b7e5277dfd30da88535821f10d`, and does not carry the body's "no authority to keep `Dockerfile.bake` after a future cutover" caveat.

This GO is review evidence only; it accepts nothing on the operator's behalf and grants no operational authority.
