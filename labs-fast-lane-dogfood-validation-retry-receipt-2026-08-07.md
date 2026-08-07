# Labs Fast Lane dogfood validation + Sorting retry receipt — 2026-08-07

Статус: **implementation complete; exact release ждёт Telegram approval**.

## Product authority

`docs/specs/lab-playable-release-fast-lane.md` фиксирует два уровня:

- technical safety всегда блокирует exact-user dogfood;
- gamefeel внутри существующих versioned bounds оценивает оператор;
- широкий release требует отдельного «Открыть всем» и строгой gamefeel-приёмки.

Универсального `ignore tests` и неявного расширения аудитории нет.

## Reviewed implementation

- Playables source head: `41122bf256556992a25ee629c14e8baca5a09357`;
  PR #11, merge `7358e9ba81ff4c8335926363a1b13daa84787772`.
- Generator source head: `8bfe96ad278c73085fcfb5145209afaa41f28f81`;
  PR #23, merge `bcbe937e9ca2acbecde5e149774c4186028fe43d`.
- Generator exact-head CI: run `31191376316`, `check + node:test` PASS in
  7m33s.
- Independent reviewer: Claude Fable, subscription CLI. Initial verdict GO
  with P2 dispositions; delta verdict GO. Blocking input checks were finally
  moved to dedicated files, which is the reviewer-proposed fail-closed form.

Local Node 24 evidence:

- Sorting technical 20/20;
- Minesweeper engine 8/8 + input 1/1;
- Klondike technical 17/17;
- Arrows core 35/35 + input 2/2;
- remaining gamefeel suites PASS;
- Generator targeted agent/release tests 23/23; syntax check clean.

## Target-value proof

Before consuming the recoverable retry, a detached proof applied the expected
Sorting value `conveyorSpeedMultiplier = 2 / 3`:

- technical suite: 20/20 PASS;
- visual proof before: real win, 25,395 ms;
- visual proof after: real win, 46,194 ms;
- mount true, terminal win, no page errors; 90-second cap not reached.

## Retry state

- Rework request: `01aaf0e3-f744-4697-b431-f0218de6c00b`;
- original instruction preserved: `Хочу уменьшим скорость вращения ленты в 3 раза`;
- previous failure journal and proof archived under
  `playable-rework-agents/v1/archive/.../20260807152034797`;
- execution moved `blocked → accepted` without a new request;
- source agent changed only
  `marble-sort-swipe/src/sort-playfeel-tuning.ts`;
- accepted source commit: `40ef388b87e5fe24cdc9ab6d782beab68c114b79`;
- release: `aae4ffbd-56a0-4eef-a86c-5884a581c15f`;
- state at receipt: `READY_FOR_APPROVAL`;
- exact intent digest:
  `3cde3b2965e3b30eec408e611a96fa67040472c750f6d5bb0c03b6bb4437b62e`.

Next authority is one Telegram approval by the allowlisted operator. No
backend, Render, DB, roster or broad-audience mutation is part of this release.
