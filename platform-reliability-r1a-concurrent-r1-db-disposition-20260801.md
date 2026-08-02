# R1-A — concurrent Platform Reliability R1 database disposition

Date: 2026-08-01.

Status: **attribution proven; separate R1 remains incomplete**. This document
only explains the R1-A production database before/after delta. It does not mark
Platform Reliability R1 complete and does not authorize Gate C, further
credential deletion, Blueprint sync, ingress closure or production cutover.

## Observed R1-A boundary delta

The bounded R1-A production database projection changed from SHA-256
`cd85b3008ee358e224c59ef191d0027d75be087906cef518ea1051d6d97771a9`
to
`5ee7c1433d4ee2ddef254a5d575a673ed3a200c0a0ce2e223b3dc220c422685a`.
The exact production database identity and plan remained the same. The observed
control-plane delta was:

- broad external rule → one operator `/32`;
- old default credential → new Render-managed default credential;
- provider `updatedAt=2026-08-01T18:18:05.206484Z`.

No credential value, username or exact operator IP is recorded here.

## Independent concurrent-R1 evidence

Meta PR [#53](https://github.com/Glera/p4g-workspace-meta/pull/53), exact head
`5d1a3158b81844b36f96fbe7cd49e7db8d84ea1d`, was opened at
`2026-08-01T18:42:29Z` specifically for the live Gate B behavior. Its immutable
review surface records:

- live read-only old/new profiles on the operator `/32`;
- new Render-managed session credential while preserving the effective
  database owner;
- `profilesEqual=true`;
- `rotationMode=delegated-effective-role-preserved`;
- zero capability differences;
- 70/70 Platform Reliability tests PASS;
- Gate C remains closed.

The owner comment
[`5152957423`](https://github.com/Glera/p4g-workspace-meta/pull/53#issuecomment-5152957423)
adds the exact live timestamp and receipts:

- new credential created at `2026-08-01T18:18:01.183671162Z`;
- old credential retained;
- Blueprint not synced;
- capability comparison SHA-256
  `eb767885d3d4e4f97122fa9be7fcb153af9cea6ac2a8053ecfc4ec412903a542`;
- terminal read-only Alembic check SHA-256
  `855ec70c7cc363a04545a6aeda90722c1b342770f1acb1d0445a2323a01de652`.

The credential timestamp precedes the Render database `updatedAt` by about four
seconds and exactly explains the new-default-credential portion of the R1-A
delta. The same PR's live `/32` statement explains the ingress portion.

Backend PR
[#47](https://github.com/Glera/swipe-backend/pull/47), exact head
`01409e41bcaa36e981593a9da1d990fa4dc4c3ae`, independently records why the
first read-only Alembic preflight failed closed and the metadata-only correction
needed to check the live schema. Its owner comment
[`5152951801`](https://github.com/Glera/swipe-backend/pull/47#issuecomment-5152951801)
records terminal PASS on that exact head: `alembic check` exit 0,
`default_transaction_read_only=on`, no pending operations and the same bounded
receipt SHA-256 above. Backend CI run `30713744834` is green.

Canonical API projection SHA-256 values captured for this disposition:

- PR #53 metadata/body:
  `a73d9fc500c00c8146b9f7fa0b3163b468a70f2fe2f7e89cb5fdb4fa5812838d`;
- PR #53 comments:
  `167e576769e7d9e24c096ec3f760d8bfe9e9df16911515d42e243a07a715384a`;
- backend PR #47 metadata/body:
  `94325e30bac29da9ae8dc4ce46a6d6aaf7312d78d7c734d5dac1a4bc8b098ee8`;
- backend PR #47 comments:
  `2fad98fd7bab26f9dac2da3b74b508c78646e1214d70da83a84360f0cc399783`.

## R1-A disposition

The R1-A executable authority independently rejects the production owner,
Blueprint, service, cron and database identities; its post-window deny replay
is PASS with SHA-256
`65cd67bd57e18e71806af31b6479c491d1a29f4fd34aad2901c2f56c52461f9a`.
Production Blueprint/web/cron projections are normalized-byte-equal across the
R1-A window. The only mismatch is therefore attributable to the separately
recorded R1 Gate A/B window above rather than an R1-A action.

The earlier R1 runbook still says the window was deferred and must be updated by
the R1 owner before that initiative can claim completion. For R1-A, the
appropriate claim is narrower: **production database boundary state changed
concurrently under separately recorded R1 Gate A/B evidence; R1-A did not cause
or authorize that mutation**.
