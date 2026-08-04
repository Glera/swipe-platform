# Independent R2 review — retry-v2 authority hardening

Verdict: **GO** — 0 P1, 0 P2, 5 optional P3 advisories.

- Reviewed delta: `d0782c8e72271acb580fbbde2f89f0a5b0125a67` →
  `26f3f2352b3b6e4ca003bf5e50ab0b967285d786`.
- Session: `f3b4be96-66ef-4221-862c-0faf15e54336`.
- Reviewer: Claude Opus, xhigh, safe mode, read-only `Read`/bounded `Bash`.
- Network/browser/provider/GitHub/credential/edit access: none.
- Web search/fetch: 0/0. Permission denials: 4 broad Python/compound-loop
  commands; the reviewer replaced them with allowed `jq` and single-git reads.
- CLI internal cost meter: `1.8473955000000002` USD-equivalent; this is review
  telemetry, not an assertion of incremental billing.

The reviewer confirmed that all three P2 findings and all seven P3 advisories
from R1 were resolved: the complete credential-surface prohibition is restored;
locator contracts are separated by lifecycle; provider exceptions and DOM text
cannot escape either post-submit block; source/review/baseline evidence pins are
restored; selector provenance and NC-2 reconciliation are honest; operational
hard stops and exact capture semantics are present; and no authority creep was
introduced.

The five remaining P3 advisories were:

1. name the post-submit create contract in allowed non-emitting click/wait
   operations;
2. explicitly prohibit queueing a merge as well as auto-merge/retry;
3. require `mergeSafe=true` alongside provider-capture `PASS`;
4. pin the exact command that restores PR #53 to draft after merge failure;
5. ground the empty-inventory anchor before opening the create dialog.

The review explicitly grants no operational authority and is not permission to
execute the retry.
