## ISSUE #136 — DONE / HANDS-FREE TWO-MAC TRANSPORT PROVEN

The one-shot executor v2 acceptance is terminal. No operator message relay was used in the three accepted A→B→A rounds.

### Live transport

- exact bridge master/head: `f438bda5bd5d31fb2da95b190b994ca24c397eeb`, tree `4d299c37f721cd8995ad61368dd41a9b4c5b0861`;
- master CI `32954228576`: SUCCESS;
- Mac A executor profile `d96afe381a44521b53b27e5732d26e683e88bc92b213d59dec3aad9e4b4515e8`, active binding `727678c8b4005e49ea677ba50fb862aaba26a062b7956acbf8aef9981ac5e227`;
- Mac B executor profile `8d7c0a8fc8109c044aca46fc227835ba8d228d2644ba3f9e0c9ba98517a102da`, active binding `37f239a3af650e5866923006fca364dae60f09132d6c0220b15aa489a38b7fa8`;
- both configs remain schema v2, enabled, mode `0600`; both LaunchAgents remain on the model-free 60-second gate;
- Mac A final natural state: `lastScannedCommentId=lastConsumedWakeCommentId=5423536429`, `pending=null`, `attention=null`, launchd exit 0;
- Mac B terminal receipt `5423536429` records clean exact checkout, unchanged config/plist/state and one binding attempt.

### Acceptance rounds

1. `5422711500 → 5422750776 → 5422768158 →` natural Mac A model-free acknowledgement.
2. `5422792037 → 5422822698 → 5422852899 →` natural Mac A model-free acknowledgement.
3. `5423482283 → 5423536429 →` natural Mac A model-free acknowledgement.

Each real actionable wake started at most one fresh bounded Codex job; causal `DONE` started none. Idle ticks start no AI. There was no replay, periodic AI heartbeat, duplicate publication or operator courier step.

### Corrections and review

- PR #206 fixed recursive causal-DONE execution. Full meta suite `338/338`; blind Opus discovery/correction/delta PASS, new P1/P2=0.
- PR #207 rejected automatic STOP silencing and made the existing exact `--clear-attention` recovery terminal for `durable_stop`. Targeted `118/118`, full `339/339`; blind Opus discovery P1=1/P2=5/P3=2, all eight findings fixed, correction-only delta PASS with new P1/P2=0.
- STOP remains fail-closed and cannot be cleared by a one-shot executor's later wake. Only an explicit exact frontier/operator disposition advances through it.
- The old dirty Mac B checkout and its `STATE.md` bytes were preserved unchanged; transport moved to a new clean exact checkout (`5423221655`).

Portfolio checkpoint PR #208 merged as `f8cfd75e5f63ea449049e74ada1819477d3fafcf`; master CI `32955190851` SUCCESS. `STATE.md` and `FLYWHEEL.md` now point to #151 row 2 as the next live work.

No backend, Feed, Generator, playable, request, release, deployment, migration, credential, setting, permission, infrastructure or product mutation was part of this terminal receipt.

Verdict: `DONE`. The next ordinary cross-Mac package is #151 row 2 and must traverse these gates without operator relay.
