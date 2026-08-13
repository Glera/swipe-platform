---
name: Development ticket v1
about: Durable cross-repo ticket for the two-Mac development model
title: "[dev] "
labels: []
assignees: []
---

<!-- schema: development-ticket.v1 -->
<!-- Authority: docs/specs/telegram-development-intake-v1.md -->
<!-- Preserve the operator request verbatim. Do not paste an author transcript. -->

## Request identity

- Ticket ID: `Glera/p4g-workspace-meta#<issue-number>`
- Request actor: `<telegram user id or local operator>`
- Requested at: `<canonical UTC>`
- Source request ID/hash: `<id + digest, or none for a manual ticket>`
- Type: `mechanic | labs | platform | impact | engineering-os`

## Original request

> <verbatim submitted text / editable voice-dictation result>

## Captured context

- Surface/route: `<value or unavailable:reason>`
- Mechanic/playable: `<value or unavailable:reason>`
- Client/platform build SHA: `<value or unavailable:reason>`
- Runtime/candidate identity: `<value or unavailable:reason>`
- Screenshot/evidence: `<content-addressed link or unavailable:reason>`

## Expected outcome

<Observable user/operator result.>

## Acceptance criteria

- [ ] <criterion 1>
- [ ] <criterion 2>

## Routing

- Assigned cell: `Mac A | Mac B`
- Line owner: `<frontier owner>`
- Ticket author: `<provider/session or unassigned>`
- Review tier: `0 | 1 | 2`
- Tier reason: `<authority actually touched>`
- Intended repositories/paths: `<repo:path list>`
- Overlap check: `<clear | conflict with ticket>`

## Execution identity

- State: `SUBMITTED`
- Branch/worktree: `<unassigned>`
- Imported head: `<none or exact SHA>`
- Candidate/PR identity: `<none until exact candidate exists>`
- Evidence: `<CI/review/visual-proof/release links>`

## Review contract

- Discovery: `<not required for Tier 0 | pending | exact review link>`
- P1/P2 batch disposition: `<pending | exact summary link>`
- Delta verification: `<not needed | pending | exact-head signature link>`
- Deferred non-blocking P3: `<none | one bounded list>`
- Full rediscovery requested by operator: `<no | exact request>`

## Safe operator status

- Current summary: `Задача принята; изменения не опубликованы.`
- Blocker/NEEDS_HELP: `<none or safe bounded explanation>`

## Authority checklist

- [ ] Ticket itself grants no merge, deploy, publication, impact or financial authority.
- [ ] Original request and exact context remain linked to every candidate.
- [ ] Reviewer input excludes the author transcript/self-assessment.
- [ ] One review round means one discovery batch plus at most one narrow
      author-blind delta verification; P3 does not block by default.
- [ ] A handoff that authorizes next work contains its typed discoverable wake
      in the same Issue/PR record.
- [ ] Production/Telegram/GitHub credentials are not exposed to author or reviewer.
