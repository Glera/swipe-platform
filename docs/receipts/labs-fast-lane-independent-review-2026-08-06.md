# Labs Fast Lane — independent review receipt

Date: 2026-08-06

Scope: the bounded v0 implementation described by
`docs/specs/lab-playable-release-fast-lane.md`. The author/implementer was
Codex Sol; the independent reviewer was Claude Fable in fresh read-only review
rounds. This receipt records review disposition, not production approval.

## Reviewed heads

| Repository | Reviewed head | Result |
| --- | --- | --- |
| `swipe-backend` | `3640b75c87b58cda54b437cedeb36c553bec3de3` | GO after three source rounds + CI-fixture delta |
| `swipe-generator` | `ec2d43aeb88b9353e417f47d90b856e881845ccb` | GO after source, CI-portability and final UX delta rounds |
| `feed-prototype` | `965486d9b177584ed2e495e97ec34abd117693b4` | GO after delta review |

## Backend disposition

The first pass returned NO-GO with five actionable contract/authority findings.
They were resolved in the reviewed head, including exact one-shot scope and
intent binding, transactional add/replay behavior, active-roster invariants,
server-owned projection, and the architecture-policy boundary. The second full
pass returned GO. A final delta pass over the last fixes also returned GO; no
P1/P2 remained.

The review is deliberately scoped to source correctness. Migration/application
in production remains a separate enabling-deploy act.

## Generator disposition

The first pass found six blocking product/recovery gaps:

1. no explicit candidate cancellation path;
2. incomplete crash/restart recovery;
3. authorization could wedge after expiry or memory-only token loss;
4. concurrent authorization polls were not guarded;
5. before/after covers were not fully surfaced and validated;
6. add completion did not reread the exact active-roster projection.

All six were fixed. The next delta pass returned GO. A subsequent review found
two bounded P2 hardening gaps: a torn final journal record and a crash window
between candidate/static push and journal persistence. Both were fixed with
red-then-green coverage. The final exact delta verdict was GO, with no remaining
P1/P2.

The reviewer kept one nonblocking note about an explicit add-apply replay test.
That invariant is covered at the backend boundary by the PostgreSQL test that
replays the exact request and receives the same activation/receipt.

## CI portability delta

The first exact-head CI exposed two test-fixture failures: the backend synthetic
LKG removed the old literal 0073 instead of the new graph head 0074, and the
generator tests cloned private sibling repositories that CI intentionally does
not check out. Runtime source did not fail.

The bounded test-only fixes are backend `3640b75` and generator `4c8c833`.
An independent Claude Fable delta review returned **GO**, with no P1/P2:

- the backend fixture once again means “candidate graph minus exactly its
  current head” and still fails loudly if its literal pin becomes stale;
- hermetic generator repositories implement the same CLI/layout contract while
  leaving worktree pinning, command execution, JPEG validation, frozen bytes,
  candidate hosting, add authority and recovery assertions unstubbed.

Three P3 notes were accepted: the backend literal will require maintenance at
the next migration, the test JPEG helper is duplicated inside one generated
fixture script, and real private `playables` script drift remains a dogfood/
release integration responsibility rather than a generator-CI responsibility.

The next exact generator CI exposed one further hermetic-fixture assumption:
fresh GitHub runners do not provide a global Git author. Commit `7435b90`
adds repository-local `example.invalid` identity only inside the disposable test
repositories. A final bounded Claude Fable review returned **GO** with no
P1/P2/P3 and confirmed that production command construction and publishing
behavior are unchanged.

The final enabling-packet review returned **GO** with no P1/P2. Its source-
drift P3 was closed on generator head `ec2d43a`: a frozen release no longer
offers a retry that cannot change either expected SHA, and the failure card
explains that the operator must cancel and prepare a new exact release. Two
bounded follow-ups over that UI delta ended with **GO, no P1/P2**. The other
packet P3 notes were dispositioned in the packet itself: the feed-only command
uses the committed release profile, flag-off semantics are proven, and static
propagation timeout remains a measured dogfood concern rather than a new
subsystem.

The final byte-bound delta recheck covered packet SHA-256
`b2528ed5b261b5c65bdb4ff5a0a1209c9f3b6f48b7a3833b4c1463f7fddb32c0`
and returned **GO, no P1/P2**. The reviewer confirmed that the document grants
no authority by itself and that merge, migration, credentials, deploy and
dogfood remain inside the future operator-gated enabling window.

## Feed disposition

The first pass found six issues:

1. mobile rework submission was not idempotent;
2. the operator action accidentally depended on the global control plane;
3. missing screenshots were described as if capture had occurred;
4. level/run context could become stale before submit;
5. an unsafe non-HTTPS candidate could still reach approval UI;
6. browser coverage did not prove the new mobile path.

The implementation now reuses exact mutation bytes on retry, derives fresh
server-owned context, reports `not_attached` honestly, keeps the action
independent of the global control plane, and blocks/rechecks unsafe candidate
URLs. The final delta review returned GO with no P1/P2.

## Authority boundary

This review authorizes neither merge nor deployment by itself. It proves the
author/independent-reviewer split for the three implementation packages.
Production deploy, migration, service restart, secrets, and external mutations
remain outside this receipt and require the operator's separate GO.
