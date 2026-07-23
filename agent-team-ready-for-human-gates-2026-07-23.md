# Swipe agent-team — ready-for-human-gates packet

Date: 2026-07-23. This is a factual handoff, not merge, deploy, production,
quiet-week, A1.1, or B1 authority.

## Frozen review set

| Repository | Review target | Pinned artifact | Verified state |
|---|---|---|---|
| `swipe-backend` | [PR #7](https://github.com/Glera/swipe-backend/pull/7) | `e583bd6501599ce7e8c5033c137c7e62deacc995` | All CI green: 49 PostgreSQL files (`220 passed, 25 skipped`), device flow (`14 passed`), durable-auth migration (`1 passed`), all migration roundtrips and reverse drift |
| `swipe-agents` | [PR #2](https://github.com/Glera/swipe-agents/pull/2) | `d88ed17b3c01de6687d92b7b9dc59873f888a184` | `verify` green; local branch: unit `349/349`, acceptance `67/67`, typecheck/build green |
| `p4g-workspace-meta` | [PR #1](https://github.com/Glera/p4g-workspace-meta/pull/1) | review request `bc23d0a0e56059b93ee63600bae57b70a00fd65c` | Meta suite `29/29`; contains the independent-review request |

The independent reviewer should start with
`cohort-observability-implementation-review-request.md`. Review both target
repositories at the exact heads above. The author must disposition every
finding and rerun the relevant checks before either implementation PR becomes
mergeable by policy.

## What is implementation-complete

### Backend Component A

- Frozen Cohort Observability v1.1 is C1-only and default-off.
- Operational and settled-reference revisions are deterministic and immutable.
- Public evidence contains pseudonymous `cohortSubjectId`; Telegram user
  mappings are encrypted and deletable through a tombstone-first procedure.
- Report, exact input membership, digest, and deterministic Telegram outbox
  are committed transactionally.
- Delivery records `send_started` before HTTP, preserves
  `outcome_unknown`, bounds retries, and reconciles stranded sends.
- Fenced scheduling, append-only receipts, replay behavior, migration 0049,
  pure tests, PostgreSQL tests, and the operator runbook are present.
- No HTTP route, application scheduler hook, production cron, deployment,
  participant registration, invite, A1.1/B1, or C2 field was enabled.

Backend operating procedure:
`swipe-backend/docs/runbooks/cohort-observability.md`.

### Reserve-host A1

- Release-symlink execution is covered for supervised and bind entrypoints.
- Runtime configuration rejects zero operator and Telegram destination ids.
- The attended contour, immutable release layout, store/config digest check,
  detector set, backup implementation, lease takeover, and fault paths have
  automated coverage.
- The development login and the non-admin runtime login remain separate OS
  users. A browser profile is not treated as the security boundary.
- No unattended service, A1.1, or B1 was installed or enabled.

Reserve-host evidence and exact drill procedure:
`swipe-agents/docs/reserve-host-acceptance-2026-07-23.md`.

## Remaining human gates, in order

1. **Independent review.** Return either numbered P1/P2/P3 findings in the
   required format or an explicit no-findings statement for both PRs. Do not
   merge or deploy during review.
2. **Merge decision.** A human approves the exact reviewed heads. Any author
   change after review invalidates that head and requires a focused rereview.
3. **A1 immutable release decision.** Build the reviewed merge commit into a
   new release directory and atomically repoint `current`; never modify the
   installed `ea243275…` release in place.
4. **Telegram physical binding.** From the intended groups send
   `/bind digest`, `/bind attention`, and `/bind incident`; as `p4g_runner` run:

   ```bash
   p4g-agent-bind
   p4g-agent-check
   p4g-agent-supervised-test
   ```

   Accept only a `supervised.start` line with three non-zero chat ids. Stop the
   attended contour with `Ctrl-C`.
5. **Physical host drills.** While attended, record backup/restore into a new
   data root, crash/lease refusal then one takeover after TTL, and one
   owner-approved reboot. Do not delete lease rows or overwrite the live store.
6. **Quiet-week start.** Start only after gates 1–5. Record UTC start/end,
   release commit, all config digests, incidents, restarts, and backup receipts.
   One false incident permits one versioned detector-config adjustment and one
   restart of the seven-day window. This still does not enable A1.1/B1.
7. **Backend production/N=1 decision.** Separately approve migration/deploy,
   create a fresh mapping key in the production secret store, choose the
   existing product-bot destination, register only the operator, and inspect
   the no-write dry-run one day before any invite. Production cron and
   `--apply` remain separate approvals.

## Smallest owner participation

Until independent review is returned, none is required. After a clean review,
the irreducible owner actions are:

- approve or reject the two merges;
- send three Telegram `/bind` commands;
- approve and be present for the reboot drill;
- approve production deploy/flags/N=1 and later invitations, if desired.

Everything else in this packet is prepared to be executed from exact reviewed
artifacts. Secrets must stay in their owning OS account/production secret
store; do not copy `.env` files between Macs or repositories.
