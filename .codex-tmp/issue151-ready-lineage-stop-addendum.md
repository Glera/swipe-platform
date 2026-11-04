## Correction to `5439648460`: the same READY blocker affects rows 2 and 5

Fresh five-release census found that row 2 was previously described only as `READY_FOR_APPROVAL`, without carrying its failed notification projection into the portfolio summary. It has the same exact server rejection as row 5 and is therefore also not honestly phone-testable.

### Row 2 exact evidence

- request: `948c42c4-2e87-4c77-86db-b450d11b5de1`
- instruction: `В два раза больше очков за каждый заказ`
- release: `6ef34060-6d20-4a2f-a9ff-64ed712c4c48`
- source: `63b004ad5410ae53673e1d592c44b2f8bd835fb7`
- candidate: https://swipe-platform.onrender.com/playable-previews/6ef34060-6d20-4a2f-a9ff-64ed712c4c48/merge-timepress-v1-swipe.html (`HTTP 200`)
- hosted: `2026-08-27T03:30:15.263Z`
- terminal notification event: `READY_NOTIFICATION_NEEDS_HELP` at `2026-08-27T03:30:15.559Z`
- server code: `playable_rework_conflict`
- status / attempt / provider id / recorded: `failed_terminal / 0 / null / false`
- preserved root execution: `blocked / playable_rework_agent_unsupported`

The same attribution applies: the manually recovered candidate binds READY to an immutable capability-gap root. No notification retry is authorized or useful.

Corrected current truth:

- rows 1, 3, 4: confirmed READY lineage and already LIVE;
- rows 2, 5: physical immutable candidates exist and answer HTTP 200, but confirmed mobile READY projection is absent;
- narrow safe continuation: two server-owned capability successors reusing the already reviewed sources, then first ordinary releases for those successors; no repeated authoring.

Typed blocker remains `manual_source_candidate_bound_to_immutable_capability_gap_root`, now with cardinality `2`.
