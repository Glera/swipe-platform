## Outcome

Makes explicit `durable_stop` recovery terminal instead of letting the same STOP reappear on every scan. Ordinary one-shot work and causal DONE remain hands-free; STOP still requires an exact frontier/operator disposition.

## Contract

- `STOP` is never silenced by later model-authored wakes.
- `--run --clear-attention <exact STOP comment id>` is the identity-bound disposition.
- For `durable_stop` only, that command advances scanned/consumed cursors through the exact terminal comment, clears attention, and starts no AI.
- Later causal successor/DONE is then processed by the normal model-free FIFO path.
- Other attention classes retain their existing recovery behavior.

## Verification

- targeted bridge + gate: 118/118 PASS
- full meta suite: 339/339 PASS
- canonical precommit patch SHA-256: `e9193d560e3b00360546e116b147c181f46eee349eda698015017aaa574272d3`

## Blind review

- Claude Opus 5/high discovery session `a28238ae-2ea6-4eff-a8cb-f5a98d14618a`, result `9cb1b7bc-0238-40ef-8edd-5433c7542778`: P1=1, P2=5, P3=2 against the rejected automatic-successor design.
- All F001–F008 fixed in one correction batch by deleting automatic STOP resolution and narrowing recovery to explicit `clear-attention`.
- Disposition validator PASS.
- Correction-only delta, same reviewer session, result `67c4ca6b-bdc0-464b-bb50-74ec196c129c`: PASS; all findings resolved; new P1=0/P2=0.

Closes the last local recovery gap observed in #136. No activation or runtime/product mutation in this PR.
