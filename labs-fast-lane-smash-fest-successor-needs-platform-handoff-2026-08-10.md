# Smash Fest successor — `NEEDS_PLATFORM_CHANGE` handoff

Date: 2026-08-10 (UTC)  
Ticket: [p4g-workspace-meta #82](https://github.com/Glera/p4g-workspace-meta/issues/82)  
Parent release: `ab5e07b9-f129-4fc3-aa91-3880bb4f1df7`  
Decision: **STOP before source edit; live Fast Lane cannot express safe candidate→rework lineage**.

## Operator decision and bounded successor contract

The current candidate must not be accepted or published. Its requested
successor would ship exactly one playable/session level: the former fifth level
of the five-level source becomes the first and only runtime level. Runtime must
not expose selection, progress or transitions for levels 1–4. Existing
deterministic level-set generation must remain outside shipped executable
session bytes as a pure factory-ready seed/template/config with a test. This
task does not build a factory or series. Technical, trace and gamefeel evidence
must cover a single-level win and restart.

No source change was started because the required server-owned decision and
successor lineage do not exist in the current live contract.

## Exact live evidence

- Parent remains `READY_FOR_APPROVAL` on source
  `a1d86ee337e3d3b0cf4124d881ca8f7c83e530ee`, candidate
  `2773e79724caccc1ba6671a4ff2a5be8859e0187`, intent
  `d38ed2698c503fac48dd23be487b6535ed1149b62aa716de93cb9b0e54c98a51`.
- Its binding has `review.kind=source` and `reworkRequestId=null`. The only READY
  notification remains confirmed attempt `1`, provider message `56`, with no
  replay.
- Live Generator `a90b25f4ff5b4066d168a16455becaf4369b6e84` exposes release
  start/status, auth start/poll, failed-step retry, READY-notification retry and
  local cancel. It has no candidate feedback/successor operation and release
  input has no parent decision identity.
- Generator refuses another non-terminal release for the same mechanic.
  `retry` accepts only `FAILED` and cannot replace this READY source/input.
  `cancel` only appends local `CANCELLED`; it creates no successor lineage and
  does not clear the durable backend READY projection.
- Live Backend `4ceb69889167c084b4976bd15ba81186352b64cf` exposes only GET for
  `/api/operator/playable-releases/{release_id}/review`. Existing
  `/api/operator-playable-reworks` requires an already-active mapping, roster
  activation and runtime occurrence. Unpublished Smash has none of those.
- Live Feed `807185578e544b2732d18c2d4458932f6dab98ea` candidate review supports
  play, manual takeover and restart, but has no candidate feedback decision
  action.
- Generator remote master `a2ffbf790eaa0d6a4092eee857a4a07c403df264` only adds the read-only
  Mechanic Workspace v0 and does not supply this decision loop.

Therefore none of the apparent alternatives is lawful: local cancel, retry,
manual journal edit, synthetic production rework request, second release with a
different source id, or source replacement would lose or forge lineage.

## Minimal dependency

Candidate Decision Loop v0 must provide one narrow platform contract:

1. authenticated append-only `rework` decision bound to the exact READY
   release, actor and intent digest;
2. atomic supersession of the old approval surface while preserving candidate,
   READY outbox and decision evidence;
3. durable `parentReleaseId → successor cycle/reworkRequestId` identity usable
   by add-mode review bindings;
4. Generator intake that accepts only that server-owned successor identity,
   releases the same-mechanic slot after supersession and creates the successor
   through the normal source-agent/Fast Lane path;
5. the corresponding Telegram/feed candidate action and visible decision
   status.

After that contract is reviewed and live, ticket #82 can resume directly with
the bounded single-level source contract above. No factory/series platform,
backend deploy, migration or architecture change belongs to this Tier 0 task
itself.

## Timing and non-actions

Read-only live-contract preflight began at `2026-08-10T14:35:51Z`; terminal
decision was reached at `14:39:11Z`. Wall time and active agent/system time were
both **3m20s**; operator-wait time was **0s**.

No source edit, branch, successor release, Telegram READY, approval, rejection,
cancel, retry, publication, mapping, roster activation, backend mutation or
manual storage/journal change occurred.

