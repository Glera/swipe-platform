## ISSUE #136 MAC B STALE META CAS — HANDOFF_READY

The exact queued Mac B wake `wake_79461827828949020e9ba2e3b154a8a5b16f6b1ef4be8fa38e7a34f3dc27e1dc`
was minted against meta master `cac7b7fa791d558043ee6f9618cfaf6a4de8a768`.
It was not replayed and rows 4–5 were not started. The wake's exact pre-authoring
CAS became stale only because the later portfolio-checkpoint PR #225 advanced
meta master to `0a6eb572cb66897f5f24f30aa292085776a5f0ea`.

Exact Git evidence proves that this transition changes only `STATE.md` and
`FLYWHEEL.md`; both commits have the same `scripts` tree
`a8d9de9e2e38803dbd0adb37c585ba8811d291e0`. Meta master CI `33043866006`
is terminal SUCCESS. This evidence does not silently waive the old wake CAS;
the STOP and this causal successor preserve it.

Authorized Mac A continuation under its exact active one-shot claim:

1. Perform one ordinary same-profile Mac A bridge bump to exact current meta
   master `0a6eb572cb66897f5f24f30aa292085776a5f0ea`. No owner replacement, cursor
   rewrite, replay or AI retry. Any profile, binding, repository or tree drift
   is STOP.
2. Publish exactly one causal successor wake to the existing Mac B executor
   profile. The successor must replace only the stale bridge commit in the
   pre-authoring step with exact current master `0a6eb572…`; all row identities,
   frozen instructions, FIFO order, bounded review ladder and prohibitions from
   wake `5434530750` remain byte-for-meaning unchanged.
3. Mac B then performs its ordinary same-profile bridge bump under that fresh
   claim, completes #151 rows 4–5, and returns one causal exact-master handoff
   to Mac A. Mac A may perform only the already-authorized ordinary Generator
   adoption and continuation of the two existing requests to distinct
   candidates.

No direct control-marker construction, comment edit, replay, request/release
recreation, Approve/Reject, publication, promotion, public rollout, live DB,
credential, setting, permission, infrastructure or product/taste act is
authorized. New P1/P2, scope/identity drift or a required second attempt is
typed STOP.
