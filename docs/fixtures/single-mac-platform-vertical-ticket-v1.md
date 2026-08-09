# Bootstrap ticket: LOCAL-SM-001

`dry_run=true`; этот файл разрешает только local implementation до первого
реального GitHub Issue. До official candidate/PR/merge/deploy ветка должна
быть импортирована в ticket `Glera/p4g-workspace-meta#N` без пересоздания.

## Request identity

- Type: `platform`
- Source: operator decision `SINGLE-MAC PRODUCT DEVELOPMENT LOOP v1`
- Original request: `Telegram platform request → durable ticket → Main Mac → READY_TO_PLAY/NEEDS_HELP → operator notification`
- Second Mac participation: `forbidden`

## Expected outcome and acceptance

- operator-only Telegram/TMA request сохраняет exact text/build/context;
- GitHub App bridge создаёт один replay-safe Issue;
- GitHub Issue является единственной Main Mac queue; один active ticket —
  attended WIP discipline, не backend scheduler;
- exact attended terminal command даёт `READY_TO_PLAY` с candidate identity либо
  `NEEDS_HELP` с safe blocker;
- terminal transition создаёт durable backend-owned Telegram notification;
- notification failure не меняет durable ticket state;
- Content Factory code/runtime остаётся byte-identical.

## Main Mac execution

- Queue: `MAIN_MAC_PLATFORM`
- Implementer: `Codex`
- Reviewer: `one blind Claude review on the complete bounded patch`
- Review tier: `2` — backend migration/outbox plus bounded feed UI
- Meta branch/imported head:
  `codex/single-mac-product-development-loop-v1@8c62e58`
- Backend branch/base:
  `codex/single-mac-product-development-loop-v1` from
  `origin/master@bbc8026bfc775470b257ffecf8e56adb977506bb`; local candidate
  `c88090850fdfa7eb4f1c525d28d37399b2dea11c`
- Feed branch/base:
  `codex/single-mac-product-development-loop-v1` from
  `origin/master@d9cbafc870ede74503a16f800075b3cf701b3363`; local candidate
  `c53d94e82fc0d2b23afc193f6bc5db3daaf98d21`
- Diff-only checkpoints (never ancestry): backend `feac8523356a932452be763819520bbd1bddd582`,
  feed `337609f72552de7450f394f4a6682dcbd71d6761`.
- Intended paths: meta authority/template/fixture; backend only
  `development_ticket*`, intake API/config/models/migration/tests; feed only
  platform intake UI/API/tests.

## Explicit non-scope

- mechanic rework linkage or Content Factory code;
- Mac A/B routing or cross-Mac handoff;
- AI routing, provider selection, quotas, repo-lock/lease, merge queue;
- credentials/settings, real Issue, PR, merge, deploy or schedule;
- `swipe-agents`.
- background agent runner, polling supervisor, subscription launcher или
  generic candidate builder.
