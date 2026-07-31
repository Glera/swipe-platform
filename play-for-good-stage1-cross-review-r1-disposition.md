# Disposition кросс-ревью R1 — Stage 1 Mission-slice v0

Автор: Claude (фиксы — Opus-агенты, внутреннее ревью — Fable),
31.07.2026. Отчёт R1: `play-for-good-stage1-cross-review-r1-report.md`
(ветка codex/stage1-cross-review-r1, коммит 8529b6d). Все шесть
findings **приняты**, ни один не оспорен.

## Fixed exact SHAs

- **Часть A backend**: `swipe-backend` ветка
  `claude/stage1-p1-mission-core`, head
  **`b63b26e704e0456d6b2865e6ef1c216c36fe4e21`**.
  Draft PR #41 (DO NOT MERGE) открыт ради CI: **PostgreSQL acceptance
  run 30662531166 на exact `b63b26e` — success, 26/26 джоб** (включая
  обе mission-roundtrip и явный mission-шаг) — PG16-receipt, которого
  не хватало в R1.
- **Часть B client**: `feed-prototype` ветка
  `claude/stage1-p4-mission-client`, head
  **`7c8f8d7ca6aac237c8a35e492b9bcb757e527d62`**.

## Таблица

| # | Finding | Disposition |
|---|---------|-------------|
| 1 | [P1] pinned policy не была денежной authority | **Принято, исправлено.** (а) Закрытая исполняемая схема v1: ровно 7 ключей, у каждого денежного поля единственное легальное значение, именующее реализованное поведение; свободного текста нет; enforced дважды — сервисом и IMMUTABLE-функциями в БД (прямой INSERT '{}' и prose-формулы отбит констрейнтом). Добавлено поле `poolConsumption` (порядок расходования — тоже денежная семантика, не должна оставаться неявной). (б) Typed `source_breakdown` на allocation (DB-CHECK формы и суммы) + FIFO-по-seq потребление; eligible pool кейса считается только по источникам его пиннутой policy, за вычетом потреблённого ВСЕМИ allocations; инвариант переведён с глобального на **per-source** (глобальный — ровно дыра R1). (в) Регрессии: точная проба ревьюера (partner-ledger + seed-policy → gift 0), READY из исключённого источника → отказ, двух-policy партиционирование без двойного счёта, отказы регистрации сервисом И констрейнтом; reconciliation-свип стал per-source |
| 2 | [P1] unlock-cutoff раньше опубликованной даты | **Принято, исправлено.** Fail-closed против `unlock_cutoff_at` по **часам БД** (не процесса); кейс без опубликованного cutoff операторской ветки не имеет вовсе; boundary-тесты по обе стороны; смена даты возможна только новой identity (доказано тестом: v2-контракт регистрируется, но не биндится) |
| 3 | [P2] NULL-permissive JSONB CHECKs | **Принято, исправлено.** Все предикаты `IS TRUE` + явные existence/type-проверки; касты обёрнуты в CASE (AND не гарантирует порядок вычисления); контракт согласован с money-колонками by construction; негативные migration-тесты бьют в констрейнт напрямую. 0072 проверен — не затронут (NOT NULL колонки) |
| 4 | [P2] retry-success daily терял receipt | **Принято, исправлено.** Оба success-пути через единый presenter, дедуп по immutable `seq` (bounded ring); browser-тест «503 → retry → ровно одна церемония + одна строка истории». Red-then-green зафиксирован буквально |
| 5 | [P2] нет «зарезервировано и открыто» | **Принято, исправлено.** Ячейка = полный `reservedAndOpenedCents` с деталью «+€Y открыто игрой»; четыре обязательных числа на экране, «Мои лапки» — дополнительная; assertions чек-скрипта обновлены (93→114) |
| 6 | [P2] revoke оставлял mission-DOM | **Принято, исправлено сильнее предложенного.** Ретеминг аддитивный (CSS скрывает исходный бейдж, лапка — соседний узел): revoke = снять атрибут, восстановление exact by construction; попутно закрыт скрытый дефект detached-ссылки на счётчик. Browser-тест grant→revoke: атрибуты/ARIA/актуальный баланс, ноль запросов /api/mission/* |

## Прогоны после фиксов

Backend: gate ON 1303 passed / gate OFF 1249 passed, 0 failures; CI
26/26 на exact SHA. Client: полный `npm run lint` зелёный (включая
новый `check-mission-browser` на прод-билде и 114 assertions ядра);
сборка в обоих режимах флага; `merge-tree` против текущего master — 0
конфликтов; бюджеты: feed.ts 41/90, mission-модули 3144/3200 (backend)
и 1323/1800 (client), island.ts 0.

## Примечание к R2

Findings 1–3 закрыты одним коммитом (общие предикаты 0071 и общий
writer) — сообщение коммита структурировано по-находочно. Поправка
автора: заявленная в отчёте П4 поломка `check:mobile-review-browser`
была ложной тревогой (прочитан грязный локальный чекаут, не master) —
ревьюер был прав, lint цел. Просьба к R2: повторить money-пробы на
`b63b26e`, клиентские browser-пути на `7c8f8d7`; PG16-receipt уже
приложен.
