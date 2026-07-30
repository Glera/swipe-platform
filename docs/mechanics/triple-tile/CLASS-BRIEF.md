# Class Brief: `triple-tile-v1`

- Дата authority refreeze: **30.07.2026**
- Статус: **Z2 Reference Twin active / production rollout not authorized**
- Primary reference и taste authority: **Zen Match build `220000.1.755`,
  Levels 6–10**
- Capture session: `2bb6ac89-3da1-4641-b753-52c9f982f0d3`
- Capture manifest SHA-256:
  `70960297ef9308d3fbe537d708f63b442a92c0f4a4de357918a3ee10172febfa`
- Capture report:
  [`CAPTURE-MANIFEST-ZEN-2026-07-30.md`](CAPTURE-MANIFEST-ZEN-2026-07-30.md)
- Reference packet: [`REFERENCE-PACKET.md`](REFERENCE-PACKET.md)

> Этот brief заменяет прежнее решение «clear-all only». Capture Levels 6–10
> доказал две objective-модели. Exact reference layouts разрешены только в
> изолированном, non-shipping Reference Twin; production обязан использовать
> собственные layouts/assets и проходить deny/near-duplicate gates.

## Authority

Факты в документе разделяются на три непересекающиеся категории:

- `R-capture` — непосредственно наблюдаемое поведение immutable capture;
- `O-production` — продуктово-инженерное решение для shipping baseline;
- `G-probe` — точное значение отсутствует или неоднозначно и требует
  короткого targeted probe. Такой пробел не разрешается выдуманным числом.

Старые записи Triple Tile Levels 20/25/30 и Zen Match Level 17 остаются
историческим secondary research. Они не меняют rules, target band или
приёмку Levels 6–10.

## Цель

Сначала воспроизвести причинно-следственную картину Zen Match Levels 6–10 в
пяти exact internal-only neutral fixtures, затем перенести доказанные
rules/feel в пять собственных production levels того же difficulty/density
band без reference layouts, assets, UI, meta и экономики.

## Scope boundary

### Reference Twin

Входит:

- exact geometry, layers, type allocation, goals и captured action traces
  Levels 6–10;
- обе objective-модели;
- fail-on-7th и safe seventh-slot triple;
- Undo, Magnet и Play On за `300` монет как наблюдаемые Twin-only actions;
- presentation events, необходимые для side-by-side.

Reference Twin:

- internal-only и neutral-skinned;
- не регистрируется в production catalog/registry;
- не экспортируется release/ship tooling;
- не используется фабрикой как production candidate;
- хранит capture provenance и явный `referenceTwin: true`.

### Production Original

Входит:

- те же доказанные exposure/tray/triple/objective rules;
- пять собственных solver-verified levels в band Levels 6–10;
- собственные geometry, type allocation, symbols, palette, UI и SkinSpec;
- swipe autoplay/takeover и один короткий round на карточку.

Не входит:

- Undo, Magnet, Continue/Play On, boosters, coins, crowns и meta;
- reference assets, exact layouts и близкие копии;
- реклама, purchases и публикация Reference Twin;
- Block Out, rollout и greenfield rewrite.

## Captured objective matrix

| Level | Objective | Terminal rule | Captured special path |
| ---: | --- | --- | --- |
| 6 | `collect-target-types` | win после закрытия target counters; board/tray могут остаться непустыми | baseline goal onboarding |
| 7 | `collect-target-types` | то же | seventh-slot boundary evidence |
| 8 | `collect-target-types` | то же | free Undo evidence |
| 9 | `clear-all` | board empty и tray empty после resolve | Magnet tutorial |
| 10 | `collect-target-types` | win после закрытия target counters; board/tray могут остаться непустыми | Play On `300` и goal completion |

Точные counters, geometry, tile identity и trace IDs берутся только из
capture manifest/frames. До materialization capture bytes в рабочем checkout
они не заменяются приблизительными данными.

## Core rules

1. Tap принимается только по live exposed tile.
2. Accepted tile немедленно удаляется из logical board и добавляется в
   canonical tray multiset.
3. Три одинаковых type auto-resolve независимо от visual adjacency.
4. Objective проверяется **после triple resolution**.
5. Для `collect-target-types` win наступает сразу после закрытия всех target
   counters; полная очистка board/tray не требуется.
6. Для `clear-all` win требует `remaining.size === 0` и tray occupancy `0`.
7. Если objective ещё не выполнен, post-resolve occupancy `>= 7` даёт fail.
8. Placement в седьмой slot безопасна, если она завершает triple и
   post-resolve occupancy становится `< 7`.

Logical tray остаётся sorted non-zero multiset. Visual insertion/grouping не
входит в gameplay state, solver key или content digest.

## Versioned objective contract

```ts
type TripleTileObjectiveV2 =
  | { kind: 'clear-all' }
  | {
      kind: 'collect-target-types';
      targets: readonly {
        type: TileTypeId;
        count: number; // multiple of three; credited on triple resolution
      }[];
    };
```

Level schema version `2` обязан содержать `objective`. Legacy version `1`
нормализуется только как `clear-all`; новые production/Twin fixtures не
создаются в v1.

## State and transition order

```text
accepted tap
  -> remove tile from remaining
  -> update exposure cache
  -> add type to canonical tray multiset
  -> resolve triple, if formed
  -> credit objective progress
  -> evaluate objective win
  -> otherwise evaluate fail-on-7th
  -> enqueue presentation events
```

Canonical state содержит remaining IDs, canonical tray entries, objective
progress и phase. Derived blocker counts и visual order не являются
authority.

## Reference Twin actions

Twin harness моделирует captured actions поверх того же pure engine:

- `Undo`: возвращает exact pre-action state для последнего accepted tile
  action; бесплатный captured use не создаёт production economy;
- `Magnet`: deterministic trace action, выбирающий captured legal tiles и
  пропускающий их через обычный tap/resolve contract;
- `Continue(300)`: после fail восстанавливает captured continue state и
  записывает стоимость `300` virtual coins; никаких real-money/ad paths;
- replay хранит action kind, before/after state digests и expected terminal.

Эти actions запрещены в shipping baseline и не расширяют production engine
API.

## Presentation contract

Must-match causal order:

1. animated board assembly;
2. accepted tap даёт immediate visible board→tray flight;
3. следующий exposed tap может быть принят до landing предыдущего;
4. same-type items визуально группируются, остальные сжимаются в stable order;
5. только landing третьей запускает recognition;
6. triple удаляется последовательно с particles;
7. unavailable tap не меняет logical state;
8. goal-complete/win/fail UI начинается после обязательной presentation
   очереди;
9. audio off;
10. manual haptics: `light accepted / soft triple / rigid unavailable+fail`.

Точные timing values обязаны иметь frame/trace measurement либо disposition
в [`PARITY-CHECKLIST.md`](PARITY-CHECKLIST.md). Неоднозначные места идут в
[`PROBE-MATRIX.md`](PROBE-MATRIX.md), а не запускают повторный полный capture.

## Engine and solver recovery

Сохраняются, пока Twin traces не докажут несовместимость:

- geometry-derived exposure graph;
- canonical tray multiset;
- pure deterministic transition;
- replay/state digest;
- exhaustive bounded solver;
- reverse-construction generator.

Solver использует objective-aware terminal state. Для
`collect-target-types` witness может законно закончиться с непустыми
remaining/tray. `unknown` при budget cutoff не считается отрицательным
доказательством.

## Production originality gates

Каждый production level содержит first-party provenance и проходит:

1. `referenceTwin !== true`;
2. отсутствие Twin/capture IDs и exact fixture imports;
3. layout/type-allocation similarity ниже утверждённого threshold;
4. собственный SkinSpec и asset provenance;
5. solver witness без boosters;
6. fail-closed production build при любом импорте из Twin namespace.

Near-duplicate gate сравнивает normalized geometry graph, layer histogram,
type-allocation signature и objective shape. Он не заменяет human visual
review.

## Swipe integration

- Autoplay default-on только в swipe.
- Autoplay следует solver witness до objective текущего round.
- Первый accepted user tap атомарно отменяет только будущие autoplay actions
  и применяется к exact current state без reset.
- Blocked/background tap autoplay не отменяет.
- Host pause замораживает clocks и не меняет logical result.
- Terminal completion отправляется ровно один раз после drain обязательной
  presentation очереди.

## Acceptance

### Authority

- [ ] CLASS-BRIEF, REFERENCE-PACKET и mechanics index называют capture
  Levels 6–10 единственным primary.
- [ ] В документации нет clear-all-only или no-goals конфликта.
- [ ] Observed facts, production decisions и timing gaps явно разделены.

### Reference Twin

- [ ] Все пять exact fixtures воспроизводят captured state/action traces.
- [ ] Goal win, clear-all, seventh-slot fail/safe triple, Undo, Magnet и
  Continue имеют deterministic replay tests.
- [ ] Twin namespace не достижим из production registry/build.

### Production Original

- [ ] Пять собственных levels соответствуют target difficulty/density band.
- [ ] Каждый level solver-verified без boosters.
- [ ] Exact assets/layouts отсутствуют; provenance и near-duplicate gate
  зелёные.

### Presentation and platform

- [ ] Каждая must-match строка имеет measurement либо explicit disposition.
- [ ] Side-by-side подтверждает совпадающую причинно-следственную картину.
- [ ] Compact/tall/landscape, pause/resume, autoplay/takeover и single
  completion проверены.
- [ ] Visual proof, montage Levels 6–10, delta list и independent review
  приложены.

## Explicit decision boundary

Завершение этой цели не разрешает merge в `master` или rollout. Оба действия
требуют отдельного явного решения оператора.
