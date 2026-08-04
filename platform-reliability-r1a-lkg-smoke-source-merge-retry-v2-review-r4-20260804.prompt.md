# Independent R4 — final retry-v2 authority delta

Review only the exact delta
`f2495ad5abcbce555a5540e12b8753f73f8a5a5a..064542c451baf83daab7aee27829c45f8fa79ae1`
in the current meta-repository worktree. Use the R3 review and disposition only
as context.

This is a read-only documentation/authority review. Do not use network, browser,
GitHub CLI, credentials or provider APIs. Do not edit files or git state.

Confirm the six accepted R3 P3 fixes are literal, internally consistent and do
not alter source/CI/provider/merge CAS or expand authority. In particular check:

- page-level Create grounding precedes dialog opening;
- the exact empty-inventory text is identical everywhere;
- merge queue, auto-merge and retry are consistently forbidden;
- JSON pins `PASS` and `mergeSafe=true` and hard-stops on mismatch;
- restore-draft failure cannot lead to another mutation;
- tag/role/shape validation is permitted only block-locally and non-emitting.

Confirm the bounded-review receipt decision is honest. Check JSON validity and
`git diff --check`. Start with exactly `GO` if there is no P1/P2 finding,
otherwise `NO-GO`. Cite exact file/line for any finding. Optional P3 polish may
be listed separately, but do not invent operational authority.

This review grants no operational authority and is not permission to execute the
retry.
