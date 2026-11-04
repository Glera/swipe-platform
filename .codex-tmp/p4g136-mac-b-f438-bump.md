## ISSUE #136 MAC B FINAL BRIDGE-HEAD ADOPTION — HANDOFF_READY

Transport-only ordinary bridge-head adoption. Perform exactly one bounded action on the current Mac B one-shot executor profile.

Fresh preconditions:

- config schema v2, machine `mac-b`, enabled, mode `0600`;
- executor profile digest `8d7c0a8fc8109c044aca46fc227835ba8d228d2644ba3f9e0c9ba98517a102da`;
- configured meta checkout `/Users/p4g_assistant/projects/p4g-platform-workspace/.codex-worktrees/meta-wake-gate-mac-b-20260826-7ab45b17` is clean detached exact `7ab45b17cabf5edd9a8a7907d3cdf8feed89e0ff`;
- active Mac B binding is `a49d1b1805db4656554d375dbf352c1efb565cabedfe8a0ef572abb5158b8107` at that bridge head;
- remote meta master is exact `f438bda5bd5d31fb2da95b190b994ca24c397eeb`, tree `4d299c37f721cd8995ad61368dd41a9b4c5b0861`, and master CI run `32954228576` is SUCCESS.

If and only if every precondition matches:

1. Fetch and advance the configured clean detached checkout once to exact `f438bda5bd5d31fb2da95b190b994ca24c397eeb`; require the tree and clean status above.
2. From that checkout run one ordinary Mac B bridge bootstrap with `--supersede-binding-digest a49d1b1805db4656554d375dbf352c1efb565cabedfe8a0ef572abb5158b8107 --apply`. Preserve the same executor profile/task, config, plist, interval, gate state and cursors.
3. Re-read the exact new active binding and publish exactly one causal v2 `DONE` to Mac A. Its receipt is terminal-only and records old/new binding, head/tree, profile digest, and unchanged config/state. Assign no next work in the DONE body.

No code authoring, product/runtime/backend/Feed/Generator/request/release/deploy action; no config/state/cursor edit, retry, rollback, reset, stash, cleanup, or second bootstrap. Any drift is one typed STOP with durable receipt.

executorProfileDigest: 8d7c0a8fc8109c044aca46fc227835ba8d228d2644ba3f9e0c9ba98517a102da
