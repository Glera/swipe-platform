# Reserve Mac A1 Phase-A quiet-week completion receipt

Date: `2026-07-31T19:49:29Z`

Status: **Pass. The base A1 attended quiet-week gate completed on the exact
immutable release. This receipt does not enable unattended A1, A1.1/B1 or the
cohort cron.**

## Authority and scope

The operator authorized the seven-day Phase-A observation window and later
classified the one observed incident as
`tolerated_host_idle_network_pause`, explicitly **not** `false_incident`. The
operator also decided that this classification does not restart the quiet
week.

The classification is tied to the exact event and signal IDs below. It is not
a blanket suppression rule and cannot classify a future incident.

## Window and immutable identity

| Field | Receipt |
|---|---|
| Start | `2026-07-24T19:11:14.000Z` |
| End | `2026-07-31T19:11:14.000Z` |
| Duration | `604800000 ms` (seven consecutive days) |
| Release | `69ed430d1dca3291e893275854d3b90e11aadda5` |
| Events in the closed window | `832922` |
| Config | all nine anchor digests matched again at finish |
| SQLite integrity | `ok` |

The controller and supervised runtime were stopped gracefully before finish.
No unattended process was installed or enabled.

## Run and delivery verification

| Gate | Result |
|---|---|
| Successful daily backups completed inside the closed window | `7` |
| Failed runs | `0` |
| Missed runs | `0` |
| Delivery rows / distinct IDs | `2 / 2` |
| `send_started` | `0` |
| `outcome_unknown` | `0` |
| Duplicate provider message IDs | `0` |

The successful backup completion timestamps were:

1. `2026-07-25T00:00:01.038Z`
2. `2026-07-26T00:00:10.368Z`
3. `2026-07-27T00:00:02.505Z`
4. `2026-07-28T00:00:19.519Z`
5. `2026-07-29T00:00:02.441Z`
6. `2026-07-30T00:00:01.096Z`
7. `2026-07-31T00:00:29.844Z`

The private completion receipt remains under the non-admin runner account:

```text
~/.local/share/swipe-agents-quiet-week/quiet-20260724T191112Z/completion-receipt.log
```

## Incident disposition

Exactly one incident-severity event occurred:

| Field | Receipt |
|---|---|
| Incident UTC | `2026-07-25T05:09:02.171Z` |
| Event ID | `d3043130-5481-4f5a-8546-765177acb08e` |
| Signal ID | `4b113012-7e25-44b8-b935-a6faa5659702` |
| Detector / class | `network / network_down` |
| Final state | `closed_watcher / sustained_normal` |
| Operator classification | `tolerated_host_idle_network_pause` |
| False incident | `no` |
| Quiet-week restart | `no` |

Host power evidence brackets the event: the local display/idle transition
began at `2026-07-25 08:02:46 +0300`, the incident escalated at
`08:09:02 +0300`, and user-active/display-on resumed at `08:12:56 +0300`.
The signal subsequently closed on sustained normal probes. This matches the
runbook's tolerated host sleep/idle-pause category; it is not a detector
threshold waiver.

The typed private receipts are:

```text
~/.local/share/swipe-agents-quiet-week/quiet-20260724T191112Z/incident-dispositions.json
~/.local/share/swipe-agents-quiet-week/quiet-20260724T191112Z/incident-disposition-verification.json
```

The verifier requires exact set equality between observed incidents and
operator dispositions, rejects unknown/missing/duplicate event IDs and fails
the quiet week if any entry is `false_incident`.

## Finish-verifier correction

The first finish attempt exposed two fail-closed wrapper defects; neither
changed runtime data or the immutable release:

1. the wrapper mechanically required `"incidents":[]`, although the runbook
   permits real incidents and tolerated host sleep/idle pauses;
2. daily backups were selected by the append time of their `scheduled` event.
   That omitted the first in-window backup, whose slot had been scheduled
   before the quiet-week anchor, and included the future
   `2026-08-01T00:00:00Z` slot instead.

The host verifier was corrected to require a typed exact-event disposition and
to select backups by authoritative `finished_ts` inside the closed
`[start, end]` window. A synthetic boundary query proved that a run scheduled
before the anchor but completed inside the window is included, while an
unfinished future slot is excluded. Shell syntax validation also passed.

| Wrapper artifact | SHA-256 |
|---|---|
| Installed corrected wrapper | `156a2dbdd239cf1ef4993b46bd36df5d15dbf6d4120d438ac1659e27ac3dcb8e` |
| Preserved pre-correction wrapper | `1d885cb0e757fc4ee770da2ba2791c8e279255ebc24d2fb4d64e6df49858da0e` |

The preserved copy is
`/usr/local/var/p4g/swipe-agents/bin/p4g-agent-quiet-week.pre-dispositions-20260731`.
Both wrappers remain outside immutable release directories. Moving this host
acceptance helper into source control is a follow-up hygiene item, not a
reason to invalidate the completed window.

## Post-completion host state

After the receipt was emitted, `current` was atomically restored to the
previously installed Finance v1-A release:

```text
current -> releases/aa91b2be1cc74632fdc8fb75d355172237c656e8
```

The resolved Git `HEAD` is exact, the release contains no writable path, and
no supervised runtime remained. This restoration does not bind Finance,
enable live billing collection, start its shadow contour, or authorize a
sender.

## Outcome and next gates

The base A1 Phase-A quiet-week criterion is satisfied. The host-idle event is
also operational evidence that future unattended operation needs an explicit
power-management containment (`caffeinate`/service power policy) rather than a
detector threshold change.

Still closed pending separate authority and acceptance:

- unattended A1 installation/enablement;
- A1.1/B1 cohort-watch release and its own acceptance period;
- cohort digest production cron and participant invitations;
- Finance chat binding verification, billing credentials, live collectors,
  shadow start, schedule and Telegram delivery.
