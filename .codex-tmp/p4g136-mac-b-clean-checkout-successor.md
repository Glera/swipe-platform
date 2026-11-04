## ISSUE #136 MAC B CLEAN-CHECKOUT BRIDGE ADOPTION — HANDOFF_READY

The preceding ordinary bridge-head adoption stopped before mutation because the configured detached checkout contains an unrelated local `STATE.md` modification. Preserve that checkout and its bytes exactly; do not reset, stash, clean, overwrite, or commit them as part of this transport task.

Perform exactly one bounded successor on the same Mac B executor profile:

1. Re-read predecessor STOP comment `5422952659`; require its wake identity and `reasonCode=configured_meta_checkout_dirty` exactly.
2. Require the current Mac B config to remain mode `0600`, schema v2, enabled, executor profile digest `8d7c0a8fc8109c044aca46fc227835ba8d228d2644ba3f9e0c9ba98517a102da`, and active server binding `87762e9af3e76f810b8d9e298acbd43a88bb84da8777df7bf0767d45db9b7106` at bridge head `dd4d4a92c6ca21af11ae0d798c9d22c24ad1e5b9`.
3. Leave the dirty configured checkout untouched. Create a new isolated detached checkout at `/Users/p4g_assistant/projects/p4g-platform-workspace/.codex-worktrees/meta-wake-gate-mac-b-20260826-7ab45b17` from exact remote meta master `7ab45b17cabf5edd9a8a7907d3cdf8feed89e0ff`, tree `cd9f0ed0ed06322c63f6c628d954e1ccca855e66`. Require master CI run `32948041633` SUCCESS and the new checkout clean.
4. Prepare a mode-0600 temporary copy of the existing config whose only semantic change is `metaCheckout` to that new clean checkout. From the new checkout, use that temporary config to perform one ordinary `bootstrap` for Mac B with `--supersede-binding-digest 87762e9af3e76f810b8d9e298acbd43a88bb84da8777df7bf0767d45db9b7106 --apply`. Do not replace the owner task/profile.
5. Only after bootstrap succeeds, atomically install that exact config as the live config, preserving enabled state and every cursor/state path. Do not edit gate state, pending/consumed cursors, plist, interval, or executor profile.
6. Re-read the new active binding and config. Publish exactly one causal v2 `DONE` to Mac A as the successor of this wake, with a terminal-only receipt containing old/new checkout, old/new binding, bridge head/tree, profile digest, and unchanged dirty-path evidence. Do not assign any next work in the DONE body.

This is preservation and ordinary bridge-head adoption only. No product/runtime/backend/Feed/Generator/request/release action. No replay, retry, rollback, reset, stash, cleanup, or second binding attempt. Any identity, CI, path-existence, checkout, config, bootstrap, or publication ambiguity is a typed `STOP` with durable receipt.

executorProfileDigest: 8d7c0a8fc8109c044aca46fc227835ba8d228d2644ba3f9e0c9ba98517a102da
