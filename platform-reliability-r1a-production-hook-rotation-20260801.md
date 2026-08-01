# Platform Reliability R1-A — production deploy-hook rotation receipt

Provider: Render authenticated dashboard  
Target: web service `swipe-backend`
(`srv-d95r3bfavr4c73aqsi4g`)  
Operator authority: explicit `да, rotate hook` in the active Codex task.

The web-service settings page was freshly loaded and showed Auto-Deploy
**Off**. The existing deploy-hook value was captured only in browser memory,
the provider's `Regenerate deploy hook` confirmation was applied, and the
replacement value was read back as non-empty and byte-different from the old
value. Both in-memory values were then cleared without being printed or written
to the repository.

Render closed the confirmation dialog and the same settings page continued to
show Auto-Deploy **Off**. No hook was invoked, no deploy or Blueprint sync was
started, and no service setting other than the deploy-hook credential was
changed.

The prior hook is invalidated. Any unknown external caller that retained it
must receive a new credential through a separately authorized secret-delivery
path; this receipt deliberately contains neither the old nor the replacement
URL.

This rotation authorizes no merge, workflow dispatch, rehearsal or production
cutover.

