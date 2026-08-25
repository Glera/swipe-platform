<!-- mechanics-process-version: 2 -->
# Class Brief: `queens-constraint-placement`

- Дата: 2026-08-25
- Статус: `evidence-ready / copy-ticket-pending`
- Владелец taste-решения: operator (unassigned)
- Автор brief: Mac B / Researcher R1
- Независимый reviewer: not started
- Process version: `reference-replication.v3`
- Process receipt: [`PROCESS-RECEIPT.md`](PROCESS-RECEIPT.md)

> Brief is evidence authority, not implementation or publication authority.

## VISION-триаж

- Неопределённость: можно ли выделить компактное фабричное deduction-ядро,
  пригодное для portrait feed без копирования trade dress.
- Что доказано: правило, mobile input, fail/restart/hints, progression and
  early board bands.
- Требуемое решение: одно касание по durable copy-ticket после review pack.
- Не разрешено: code, dataset shipping, production, economy or deployment.

## Цель

Доказать один neutral first-party vertical slice, где causal rule/input/win
parity читается как Queens-class, а визуальная identity, copy, boards and
economy are original. Reference → Twin verifies rule/input causality; Twin →
Original verifies operator taste on matched logical state.

## Non-goals

- reproduction of ZooDoku visuals, animals, labels, leaderboard or economy;
- exact motion/audio fidelity;
- autoplay, level factory, series scale-out or production adoption;
- claiming a human session-time before a taste-session.

## Точный эталон

- Primary: ZooDoku 1.0.7, package `com.nebula.zoodoku`.
- Public link: [Google Play](https://play.google.com/store/apps/details?id=com.nebula.zoodoku).
- Device range: tutorial + levels 1–13.
- Capture manifest:
  `7cac1332cdb24f1133ba5c74402e3fbe04590d220d64a5b45028d3ff8acf34cb`.
- Canonical video:
  `2bc79ecfd6ed61c4887fe0044cb8a3bb43f627ef45edff56b39ae039f91b8f69`.

### Operator must-match moments

| ID | Moment | Why salient | Golden scenario | Status |
| --- | --- | --- | --- | --- |
| `QR1-MM01` | Three constraints become legible on one board | defines the class | `QR1-G01` | provisional |
| `QR1-MM02` | Mark vs placement is intentional and reversible | core control feel | `QR1-G01/G02` | provisional |
| `QR1-MM03` | Final correct placement causes one immediate terminal | causal payoff | `QR1-G01/G03` | provisional |
| `QR1-MM04` | Hint explains a deduction, not merely reveals an answer | learning value | `QR1-G03` | provisional |

MUST parity is not frozen until an operator choice-session assigns disposition.

### Evidence boundary

- Agent-operated Android capture; raw bytes local-only.
- Clean/instrumented pair passes with identical start frame, pHash distance 0.
- JSONL gesture/control trace is local-only; committed docs expose hashes and
  normalized observations, not device identity.
- Targeted probes covered three-heart exhaustion, restart and both hints.
- Ads, store links, payments, login and age/rating responses were forbidden.

### Machine-readable authority

- [`OBSERVATIONS.v1.json`](OBSERVATIONS.v1.json) — SHA-256
  `59cb94b3d43d7353a8b40f9d5839bd8b9bfa5a09e527ae0d93c96432e4452997`.
- [`FIDELITY-CONTRACT.v1.json`](FIDELITY-CONTRACT.v1.json) — SHA-256
  `feb9642769aece0b587b2a4cb17aff2b425210ca6169a2ae854ee66607d3e6b3`.
- [`PRESENTATION-PROFILE.v1.json`](PRESENTATION-PROFILE.v1.json) — SHA-256
  `f4477aba042161de9d12283a9f3e2215fb8a6c72faf451ec53502cbd9d9b7094`.
- [`evidence/manifest.json`](evidence/manifest.json) — SHA-256
  `f3bbda4c7b4672745a08b41d9ee02407c357a0160fc2be0209f792cffe38635f`.

Implementation, if separately authorized, consumes only the presentation
profile. Every provisional or unresolved field fails closed for scale-out.

### Parity checklist

| ID | Parent | Salience | Assertion | Verification | Status |
| --- | --- | --- | --- | --- | --- |
| `QR1-P01` | `MM01` | MUST | row/column/region uniqueness + one-cell adjacency | solver fixtures | evidence-ready |
| `QR1-P02` | `MM01` | MUST | long diagonal remains legal | adversarial fixture | evidence-ready |
| `QR1-P03` | `MM02` | MUST | mark does not become a piece or alter givens | event trace | proposed |
| `QR1-P04` | `MM02` | MUST | takeover swipe cannot place accidentally | device witness | blocked on slice |
| `QR1-P05` | `MM03` | MUST | exactly one win event after last placement | event + video | proposed |
| `QR1-P06` | `MM03` | MAJOR | terminal response begins without submit | PTS bracket | observed |
| `QR1-P07` | `MM04` | MAJOR | hint names a forced move before application | fixture/copy review | proposed |
| `QR1-P08` | rights | MUST | no reference identity/layout in production bytes | deny scan | blocked on build |

### Golden scenarios

| ID | Initial state | Stimulus | Key checkpoints | Channels |
| --- | --- | --- | --- | --- |
| `QR1-G01` | original 4×4, one given | mark, place, final place | mark → piece → win | clean + instrumented |
| `QR1-G02` | original 6×6, zero given | adjacency contrast, remove | conflict → recovery | clean + instrumented |
| `QR1-G03` | original 8×8, zero given | explain hint, finish | explanation → placement → win | clean + instrumented |

### Transition parity matrix

| Pre-state | Input/action script | Reaction checkpoint | Settle/effect checkpoint | Final state | Naive failure caught | Reference evidence | Executable fixture |
| --- | --- | --- | --- | --- | --- | --- | --- |
| empty eligible cell | mark | mark appears | no other cell mutates | marked | tap treated as piece | tutorial | `QR1-G01` planned |
| marked cell | place intent | piece replaces mark | unrelated marks persist | placed | mark/piece cycle corrupts state | tutorial | `QR1-G01` planned |
| two diagonal-neighbor candidates | place second | constraint warning/rejection | first piece preserved | non-winning | classic solver omits adjacency | rule capture | adversarial T01 |
| two distant-diagonal candidates | place second | accepted | both remain | legal partial | classic N-Queens rejects long diagonal | rule capture | adversarial T02 |
| N-1 exact pieces | place final | final piece appears | one terminal begins | completed | submit required / duplicate terminal | Level 13 video | `QR1-G03` planned |

## Rights / Twin boundary

- Never copy: ZooDoku/Meowdoku naming, animal faces, mascot/ribbon UI,
  progression labels, leaderboard names/layout, exact boards, audio or copy.
- Replacements: original geometric pieces, region palette, typography,
  semantic feedback and original generated/curated datasets.
- Exact captured layouts may exist only as internal neutral Twin fixtures with
  provenance and a production deny gate.
- Twin/Original must share one renderer, input state machine, viewport mapping
  and presentation clocks; selector changes data only.
- Release must fail closed to Original and contain no Twin IDs or capture
  provenance.

## Core fantasy and loop

Fantasy: turn a colorful ambiguity into a clean, inevitable placement through
small deductions. Loop: scan row/column/region → mark impossibilities → place
one piece → read newly constrained space.

## First screen / input

First frame shows a complete portrait board, region boundaries, progress `0/N`
or one given, and no timer. Autoplay is not authorized; its solvability and
takeover semantics remain a later design decision.

Captured mapping is tap=mark, double-tap=place, swipe=paint marks. Provisional
profile freezes intents, not gestures. Vertical-feed conflict must be tested
before taste acceptance.

## State machine

```text
boot -> ready
ready --mark/place/remove/hint--> ready
ready --exact solution--> completed
ready --restart--> ready(initial)
```

No fail/economy state is required. The observed hearts/rewarded revive are
excluded.

## Difficulty ladder

- onboarding: 4×4, one given, isolated demonstrations;
- early: 6×6/8×8 sawtooth, one given;
- next: 6×6/8×8, zero givens;
- later tiers must be classified by deduction depth, not N alone.

Exact captured sequence is evidence, not a production level bank.

## Review gates

1. Independent reference-pack review.
2. One authorized neutral vertical slice only.
3. Reference → Twin scenario evidence.
4. Twin → Original operator choice-session, including real novice timing and
   feed takeover.
5. Production deny scan before any release authority.

Until gates 1–4 have durable dispositions, downstream scale-out is `blocked`.
