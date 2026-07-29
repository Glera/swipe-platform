# Независимое ревью `block-out-v1` — Review 3

- Дата: **29.07.2026**
- Reviewer: **Claude**
- Автор packet и disposition правок: **Codex**
- Reviewed commit: **`093f175e6cda0bdc68b64d567967605cf924ab1d`**
- Ветка: **`codex/block-out-reference-packet`**
- Вердикт: **conditional GO**
- Prototype implementation: **не разрешена без отдельной authorization**

## Scope disposition

- `BO-A`: может стартовать.
- `BO-E/BO-S`: workstream-ready после редакционных A1′–A3′.
- `BO-P`: blocked на 60 fps feel evidence.
- `BO-F/BO-I/BO-Q`: следуют typed dependencies brief и отдельной prototype
  authorization.

После внесения A1′–A3′ новый review-cycle не требуется; достаточно notification.

## Что проверено и принято

- Review 2 закрыт честно: operator rulings имеют authority, IP boundary
  ограничивает «максимально близко», а неизмеренный feel не выдан за
  `R-native`.
- N-1 закрыт полными SHA-256; N-3 — явной атрибуцией reviewer/author.
- N-2 byte/frame verification корректно процитирована.
- No-timer + no-reachable-stuck сильнее исходного restart/timer-only выбора.
- Schema versioned: `timerMs: null`, `quickFlick: "no-inertia"`,
  `requireStrongSolvability: true`.
- Meta gate не получил новых regressions. Reviewer отметил environment caveat:
  часть новых reliability tests требует git ≥2.28; CI/Codex environment pass
  остаётся валидным.

## A1′ · collision/contact authority

Проблема: `collision-free` не определял, легален ли boundary contact, поэтому
snug corridor мог различаться между clamp, engine и solver.

Disposition:

- collision = overlap положительной площади;
- касание walls/figures легально;
- unit-step BFS по anchor lattice с valid endpoint footprints — discrete
  authority;
- для unit translation swept region равен union endpoints, поэтому BFS
  exact-equivalent continuous reachability при contact-allowed semantics;
- clamp/engine/solver используют одну collision predicate;
- rules digest содержит `collision: "positive-area-overlap"` и
  `reachability: "unit-step-anchor-bfs"`.

## A2′ · exit commit boundary

Проблема: partial gate crossing на release не имел однозначного результата.

Disposition:

- exit commit только после полного crossing footprint за board boundary через
  compatible gate span;
- release до threshold делает обычный nearest in-board snap;
- gate reusable/non-consuming.

## A3′ · deterministic snap

Проблема: snap ошибочно был назван presentation detail, хотя выбранный anchor
меняет stable state и replay.

Disposition:

- gesture translator выбирает nearest legal anchor по squared Euclidean
  distance от clamped pose;
- tie-break: меньший `y`, затем `x`;
- valid clamped pose гарантированно имеет хотя бы один legal anchor в своей
  component; отсутствие anchor — contract violation, не fallback;
- snap rule versioned и используется parity fixtures BO-E↔BO-P.

## Дополнительные dispositions

### V1 monotonicity lemma

При static walls, reusable gates, reversible translations, no timer и exits,
которые только удаляют blocks, initial solvability implies strong solvability:
translation обратима, removal освобождает occupancy, а индукция по exits
сохраняет witness suffix.

Для v1 initial witness + verified lemma premises достаточны. Exhaustive graph
check optional defense-in-depth. Locks/ice/one-way/consuming gates требуют
нового rules version и отдельного proof.

### Takeover и pause mid-carry

Uncommitted autoplay/manual carry при takeover или host pause rollback'ится в
last stable anchor без mutation. Paused snapshot всегда stable.

### Autoplay budget

Используется
`min(2, max(1, floor(0.25 * witnessLength)))`. Один explanatory move — явное
исключение из percentage cap для witness короче `4`.

### Typed fixtures

Brief обязан перечислить:

1. snug-corridor contact-allowed slide;
2. gate release по обе стороны full-crossing threshold;
3. equidistant deterministic snap;
4. flick without inertia;
5. takeover during autoplay-carry;
6. pause during drag;
7. replay byte-equivalence;
8. monotonicity property under random legal sequences.

## Итог

- Review 3: **conditional GO**.
- A1′–A3′: **редакционные blockers; закрываются одной document disposition**.
- После disposition: `BO-A/BO-E/BO-S` workstream-ready.
- `BO-P`: **blocked on 60 fps feel evidence**.
- Code/prototype/rollout: **не разрешены этим review**.
