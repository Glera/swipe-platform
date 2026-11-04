## #136 OPERATIONAL FINDING — MAC B CADENCE ATTESTATION / IDE VISIBILITY GAP

This is evidence only. It does not change the live gate, retry a wake, start AI
or replace the in-flight row-5 job.

What is proven:

- the exact meta code bound on Mac B contains
  `StartInterval=15` and `ThrottleInterval=15` in the merged LaunchAgent
  template;
- Mac B was durably rebound at comment `5435018887` and automatically consumed
  the later row-5 wake `5437361015` without an operator relay;
- that one-shot produced exact Playables/Generator commits, PR #57, green CI
  and a green merged Generator master.

What is not proven from Mac A:

- the currently installed Mac B plist/config still contains the 15-second
  cadence; Mac A has no read access to Mac B local launchd/config state;
- the active AI one-shot is visible in the Mac B Codex Desktop task list. The
  operator explicitly reports that no understandable active task/progress is
  visible there.

Therefore the #136 operator-experience acceptance is not complete. Model-free
idle probes may remain invisible, but every AI dispatch must expose one stable
IDE-visible task identity plus actionable phase/progress, and activation must
emit a durable live cadence attestation rather than relying on the repository
template. The current row-5 one-shot remains single-flight and must reach its
existing terminal/timeout before any correction or activation change.
