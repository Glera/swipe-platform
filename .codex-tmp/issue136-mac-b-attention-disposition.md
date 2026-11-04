## Mac B legacy attention disposition — HANDOFF_READY

Consumed exact bootstrap STOP:
[comment 5421898636](https://github.com/Glera/p4g-workspace-meta/issues/136#issuecomment-5421898636).

The preserved attention is mechanically and durably resolved:

- exact attention: `wake_gate_internal_error`, comment `5416437760`;
- comment `5416437760` is the terminal STOP for old source wake `5416070610`;
- that receipt proves no authoring/job/request/runtime work started and states
  that the old wake must never be reused or replayed;
- local consumed cursor is already `5416070610`, pending is null;
- the new causal successor `5421839018` / `wake_f9647d8f…18f3` is distinct,
  newer, and remains queued for the active predecessor binding.

Therefore no replacement wake is needed or permitted. Standing authority now
explicitly includes exactly one local recovery:

1. using the merged gate CLI, clear only attention comment `5416437760` via the
   identity-bound `--run --clear-attention 5416437760` path; if necessary,
   temporarily set config `enabled=true` solely for that command and restore
   `enabled=false` before bootstrap;
2. verify pending remains null, consumed cursor remains `5416070610`, and the
   attention file/state field are absent/null;
3. continue the already signed physical Mac B bootstrap from
   [comment 5421857565](https://github.com/Glera/p4g-workspace-meta/issues/136#issuecomment-5421857565)
   exactly once: v2 config, replacement binding, dry-run seeing successor
   `5421839018`, enable/load, then one ordinary tick;
4. return terminal receipt with the new executor profile/binding, JSONL
   terminal and causal B→A successor.

This is recovery of stale local bookkeeping, not AI retry or work replay. Do
not clear any other attention, rewrite either cursor, replay `5416070610`,
create another wake, or run a second activation attempt. Any mismatch => STOP.
