# Независимое ревью `block-out-v1` — Review 1

- Дата: **29.07.2026**
- Reviewer: **Claude**
- Автор reference packet и disposition правок: **Codex**
- Reviewed commit: **`2e392ea70c88292c9e42f257152d6f9e4351c28e`**
- Ветка: **`codex/block-out-reference-packet`**
- Вердикт: **accept as research**
- Gate: **Review 2 blocked on operator packet**
- Primary recommendation: **Grand Games Block Out! поддержана**

## Верификация

- Taxonomy split принят: семь соседних loops разведены по core rule, а
  Unblock Me используется как negative control, не fidelity source.
- Diff reviewed commit содержал только
  `REFERENCE-PACKET.md`, `CLASS-BRIEF.md` и mechanics `README.md`; кода не было.
- Ветка была опубликована на `origin`; `master` не изменялся. Формулировка
  «ничего не отправлено в remote» в исходном handoff была неточной.
- В изолированном worktree: meta tests **50/50 pass**,
  `docs-boundary-lint` clean. Оговорка reviewer: lint проверяет только
  документированный root boundary.
- Store facts подтверждены: exact Grand Games identity и
  slide-to-matching-doors; Color Block Jam free-slide wording; Wood Out
  Arrow/Locked/Ice/Double Layer modifiers.
- YouTube metadata: `9:49`, `6:50`, `11:34`, `15:08`. Поэтому gross estimates
  сохраняются около `27–29 s` и `35–45 s` на уровень, но сами montage не
  являются feel authority.

## Что принято

- Research достаточен, чтобы запросить operator Review 2.
- Candidate A, Grand Games Block Out!, остаётся recommended primary (`P`).
- Levels `6–10` либо эквивалентный static pre-modifier band остаются
  recommended fidelity target (`P`).
- Duration proposal `20–45 s`, hard review boundary `60 s`, честное отделение
  spatial solvability от human timer feasibility и обязательные
  accessibility markers переносят применимые уроки triple-tile.
- Implementation остаётся не разрешена.

## Findings и disposition

### F1 · P1 — movement recording должен содержать различающие probes

Обычный success run может не различить `free-stop`, `slide-stop` и `unit-step`.
Review 2 должен явно заказать:

1. release посреди свободного коридора;
2. смену направления без release, то есть L-траекторию;
3. быстрый flick;
4. диагональную попытку;
5. invalid release: rollback против clamp к последнему legal anchor.

**Disposition:** принято. Probes добавлены в minimum logic packet. Полученные
после ревью success clips L11–13 подтверждают continuous carry, но не закрывают
эти пять вопросов.

### F2 · P2 — stuck/unsolvable state не определён

Legal move может сделать уровень нерешаемым, а runtime solver намеренно не
входит в baseline. Игрок иначе узнает о тупике только по timer expiry.

**Disposition:** принято. Review 2 выбирает timer-only fail либо явный restart
affordance. Generator receipt считает `deadEndExposure`; v1 должен отклонять
ранние/нечитаемые irreversible cliffs.

### F3 · P3 — time-to-rule нужен стабильный anchor

`First live frame -> first completed exit` смешивал load/settle и autoplay.

**Disposition:** принято. Canon переякорен на `scene visible`; отдельно
предложен scene-visible -> input-ready settle `≤450 ms` (`P`), а первый
completed exit остаётся `≤1.50 s` от scene-visible frame (`P`).

### F4 · P3 — evidence authority должна быть однозначной

Один `R` смешивал store-copy, public montage и native measurement; blocking
обозначался только прозой.

**Disposition:** принято. Легенда выровнена на
`R-web / R-native / O / P / B`.

### F5 · P3 — timer не должен раздувать solver identity

Фраза про stable state могла читаться как включение timer/resource в spatial
search key, хотя search contract использовал canonical anchors.

**Disposition:** принято. Runtime snapshot может хранить timer/phase, но solver
identity ограничен `rulesVersion + live block ids + anchors`.

## Дополнительные замечания

- Timer during host pause уже определён proposed invariant: он заморожен.
  Открытая часть Review 2 сужена до timer during autoplay.
- Duration evidence теперь фиксирует метод: YouTube metadata duration делится
  на заявленное число уровней; transitions остаются внутри gross duration.
- Operator attention разделён: exact link + movement probe clip разблокируют
  logic workstreams; success/fail feel, must-preserve, defaults и haptic нужны
  до presentation workstream.

## Итоговая диспозиция

- Taxonomy: **accept split**.
- Research: **достаточен для operator Review 2**.
- Primary/band: **поддержаны как `P`, не утверждены как `O`**.
- Code: **не разрешён**.
- Review 2: **blocked** на exact link/build, target slice, movement probes,
  fail/invalid evidence, must-preserve и defaults/exceptions.
