# Codex cross-review R4: Island Social Core v1.3

Дата: 24.07.2026  
Режим: узкий diff-only review  
Проверено:

- `swipe-backend@9d71a73..17b21c1`;
- единственный изменённый файл:
  `docs/specs/island-social-core.md`;
- основание R3:
  `p4g-workspace-meta@becec04:docs/island-social-core-cross-review-r3-2026-07-24.md`.

## Вердикт

**GO на реализацию Пакета 1 в default-off режиме.**

Открытых P1 в контракте Пакета 1 после R4 нет. GO означает разрешение начать
реализацию exact scope P1 и пройти его code/PG/browser review. Он не разрешает:

- production enable;
- deploy или изменение production flags;
- показ острова friend cohort или внешним гостям;
- молчаливое включение P2–P5;
- расширение authority или scope без новой ревизии.

## Проверка R3-F001

Закрыто.

Первый owner collect теперь всегда создаёт immutable terminal receipt, включая
пустой balance:

```text
disposition = "empty"
gifts = 0
puzzles = 0
response = exact committed projection
```

Повтор того же `claim_id` читает receipt до проверки текущего balance. Поэтому
последовательность:

```text
empty collect(A) → новые accrual → replay collect(A)
```

возвращает исходный пустой response и не собирает новые подарки. Reuse identity
с другим owner/building/input возвращает 409. Exact acceptance case добавлен в
DoD.

Это закрывает последний P1 replay defect Пакета 1.

## Проверка R3-F002

Закрыто на уровне спецификации Пакета 2:

- `island_visit_awards.run_id VARCHAR(96)`;
- тип совпадает с `VerifiedRun.run_id String(96)`;
- избыточный `verified_run_id` удалён;
- `run_id` является единственной verified-run identity chest closure;
- server-derived `roll_id` не предполагает UUID-формат входного run id.

При реализации P2 migration должна физически связать `run_id` FK с
`verified_runs.run_id`; это обычная проверка implementation review, не блокер
P1.

## Scope Пакета 1, получивший GO

- миграции P1;
- completion claims и terminal reward outcomes;
- ordered building event replay;
- стадии домиков;
- owner collect только с пазлами;
- fenced bot daily plans и bot activity;
- typed immutable first-party binding домов ботов;
- friends foundation, remove API и block schema;
- bot/human-separated metrics;
- deep links `f_`/`i_`;
- default-off flags и описанные P1 acceptance tests.

Любой перенос в P1 visit-card, notifications UI, moderation, async theme или
CDN является scope expansion и требует отдельного review.

## Следующий гейт

После реализации Пакета 1:

1. PostgreSQL acceptance из §7;
2. проверка migration upgrade/downgrade и constraints;
3. independent code review с author ≠ reviewer;
4. browser E2E P1;
5. dogfood evidence;
6. отдельное решение оператора о следующем пакете.

**Итог R4: GO P1 implementation, default-off.**

