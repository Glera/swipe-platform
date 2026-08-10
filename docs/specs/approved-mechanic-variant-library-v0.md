# DRAFT: библиотека принятых вариаций механик v0

Статус: **proposal / не implementation authority**.

Продуктовый контекст: [`VISION.md`](../../VISION.md) задаёт вариации как один
из источников бесконечного контента, но человеческий вкус остаётся
обязательным шлюзом. Этот документ отвечает только на более узкий вопрос:
**где хранить удачную вариацию после технических проверок и ручного отсмотра,
чтобы её можно было безопасно использовать позже**.

Документ не запускает release-polish, Fast Lane, публикацию, персонализацию,
прогрессию игрока или новую runtime-систему.

## 1. Короткое решение

Удачная вариация хранится не как локальный sandbox и не как вечная Git-ветка.
После release-polish она становится:

1. отдельным самостоятельным playable-source в `playables/master`;
2. маленькой Git-tracked карточкой библиотеки с lineage, правилом и exact
   proof identities;
3. ссылкой на операторское taste-решение в durable meta-ticket.

Это **библиотечная готовность**, а не публикация. Пока вариацию не выбрали для
dogfood или public delivery, backend, mapping, roster и feed её не знают.

Рекомендуемые source identities для первой семьи:

- `orthogonal-link-locked-center-v1`;
- `orthogonal-link-anchored-target-v1`;
- `orthogonal-link-charged-row-v1`.

Каждый source имеет собственные код, tuning, tests, proof и дальнейшее
release-решение. Общая progression, mode switch, DSL и cross-variant runtime
не создаются.

## 2. Почему существующих артефактов недостаточно

Текущий mutation pipeline правильно создаёт candidate-only evidence:

- exact repository/ref/commit/root-tree/source-tree;
- technical/build/action-trace/visual proof;
- packaged HTML;
- `publicationEligible=false`, `catalogEligible=false`,
  `feedEligible=false`, `review=null`.

Но его UGC/Generator roots являются execution sandbox:

- они локальны для Content Factory Mac;
- локальный URL не является долговечной product identity;
- candidate branches могут разойтись, быть удалены или конфликтовать между
  собой;
- три Wave 1 commits изменяют один и тот же `orthogonal-link-v1`, поэтому их
  нельзя просто слить вместе и получить три независимые вариации;
- technical PASS не содержит taste-authority и не даёт права публикации.

Sandbox остаётся доказательством происхождения. Библиотека начинается только
после materialization отдельного source и финального ручного решения.

## 3. Две независимые оси состояния

Нельзя смешивать готовность контента и то, кому он сейчас показывается.

### 3.1 Готовность контента

```text
candidate_only
  → selected_for_polish
  → library_ready
  → retired
```

| Состояние | Смысл |
| --- | --- |
| `candidate_only` | Pipeline PASS; оператор ещё не выбрал продолжение. |
| `selected_for_polish` | Оператору понравилось направление; нужны отдельный source, tuning и финальная проверка. |
| `library_ready` | Самостоятельный source в `playables/master`, финальные proofs и operator acceptance готовы; можно создавать release-пакет. |
| `retired` | Вариация сохраняется для истории, но больше не предлагается для новых release. |

### 3.2 Доставка игрокам

```text
unpublished → dogfood → public → recalled
```

Delivery-state не записывается как текущий факт в библиотечную карточку.
Authority живого состояния остаётся у production manifest, backend mapping,
roster/allocation и typed release receipts.

Следствие: одна `library_ready` вариация может годами оставаться
`unpublished`, не создавая строк в production DB.

## 4. Где живёт каждый тип факта

| Факт | Authority / место хранения |
| --- | --- |
| Исполняемый source, levels и tuning | отдельный каталог в `playables/master` |
| Стабильная библиотечная identity и lineage | `playables/variant-library/<library-key>.json` |
| Technical/runtime/trace/visual digests | библиотечная карточка + компактные воспроизводимые receipts в source `evidence/` |
| Тяжёлые временные видео, raw traces и build roots | UGC/Generator evidence storage; путь сам по себе не authority |
| Human taste decision | durable meta-ticket/comment, на который ссылается карточка |
| Текущий dogfood/public статус | production manifest + backend mapping/roster/allocation + release receipt |
| Персональный прогресс игрока | будущий backend contract; в v0 отсутствует |

Не создаются новая database table, отдельный registry-service или копия
playables-кода в meta-repo.

## 5. Минимальная карточка библиотеки

Предлагаемый schema marker:
`playables.variant-library-entry.v0`.

Пример только для обсуждения формы:

```json
{
  "schema": "playables.variant-library-entry.v0",
  "libraryKey": "orthogonal-link/locked-center/v1",
  "familyKey": "orthogonal-link",
  "title": "Locked Center",
  "sourceId": "orthogonal-link-locked-center-v1",
  "sourcePath": "orthogonal-link-locked-center-v1",
  "sourceTree": "<final Git tree SHA>",
  "parent": {
    "sourceId": "orthogonal-link-v1",
    "commit": "<exact baseline commit>",
    "sourceTree": "<exact baseline source tree>"
  },
  "ruleSummary": {
    "newRule": "Center starts locked and unlocks after an adjacent clear.",
    "decisionDelta": "The player must perform a setup action before using the center."
  },
  "proof": {
    "technicalProfile": "test:orthogonal-link-locked-center-v1:technical",
    "runtimeArtifactDigest": "sha256:<64hex>",
    "actionTraceDigest": "sha256:<64hex>",
    "visualProofDigest": "sha256:<64hex>"
  },
  "operatorDecision": {
    "ticket": "https://github.com/Glera/p4g-workspace-meta/issues/81",
    "comment": "<exact final library-ready decision URL>",
    "decision": "library_ready",
    "decidedAt": "<canonical UTC>"
  }
}
```

Ограничения карточки:

- `libraryKey` — человекочитаемый stable key, не backend UUID;
- сама карточка не исполняет правило и не является DSL;
- source code остаётся единственным executable definition;
- `sourceTree` относится к отдельному source-каталогу, поэтому добавление
  карточки вне него не создаёт hash recursion;
- backend `variantId`, mapping и roster identity появляются только при
  реальной публикации;
- карточка не утверждает «сейчас live» и не дублирует изменчивый production
  state.

## 6. Путь одной вариации на полку

### Шаг 1. Candidate selection

Mutation pipeline создаёт bounded candidate и proofs. Оператор выбирает
`reject`, `continue` или `polish`.

- `reject`: сохранить terminal receipt, candidate не materialize;
- `polish`: зафиксировать `selected_for_polish` в meta-ticket;
- `continue`: допустимо только если candidate уже удовлетворяет будущему
  release-polish contract; taste acceptance всё равно требуется отдельно.

### Шаг 2. Standalone materialization

Release-polish goal переносит exact candidate в новый source-каталог от
актуального `playables/master`:

- не изменяет исходный `orthogonal-link-v1`;
- не объединяет три правила;
- не добавляет mode selector;
- сохраняет parent lineage и candidate evidence identities;
- после переноса запускает проверки уже под новым stable `sourceId`.

В v0 осознанно допустимо небольшое дублирование кода между тремя sources.
Shared runtime/refactor можно обсуждать только после фактической боли от
нескольких принятых семейств, а не заранее.

### Шаг 3. Release polish

Для каждого source отдельно:

1. настроить legibility, feel, tutorial/autoplay и уровни;
2. пройти strict technical profile;
3. собрать SWIPE artifact и covers;
4. пройти real-pointer action trace;
5. получить visual proof в platform-like slot;
6. дать оператору in-platform founder play;
7. записать отдельное решение `library_ready` или вернуть в polish.

Один успешный variant не проталкивает два остальных.

### Шаг 4. Merge в библиотеку

В `playables/master` попадают:

- самостоятельный source-каталог;
- его tests/evidence;
- одна library card.

После подтверждения master CI временную candidate branch можно удалить:
история и exact source tree уже сохранены в Git. Local sandbox может быть
очищен по обычной retention policy только после проверки, что компактные
receipts и operator decision доступны из durable sources.

### Шаг 5. Отдельный release, когда понадобится

Выбор вариации для dogfood/public создаёт обычный Fast Lane/onboarding
release от `library_ready` source. Перед публикацией проверки выполняются
заново на exact current source; старый library proof не подменяет release
proof.

## 7. Текущее положение Wave 1

[Решение оператора от 10.08.2026](https://github.com/Glera/p4g-workspace-meta/issues/81#issuecomment-5237737574):
три самостоятельные вариации выбраны для polish. Это taste-authority на
продолжение, но ещё не `library_ready`.

| Вариация | Candidate commit | Сейчас |
| --- | --- | --- |
| Locked Center | `ccfa98692a1512790ee9b199047f5b7e1c0b789d` | `selected_for_polish` |
| Anchored Target | `a87e81b0c870b1aeaaaf8d3bb76e9742d874526b` | `selected_for_polish` |
| Charged Row | `243b7c1d94d79695abe8aa3bf8afa28eac8db861` | `selected_for_polish` |

Следующая цель для этой семьи — bounded release-polish с тремя независимыми
source outputs и тремя отдельными operator decisions. Публикация не входит в
неё автоматически.

## 8. Как библиотека сможет использоваться позже

Возможные потребители одной и той же `library_ready` полки:

- ручной dogfood отдельной вариации;
- тематическая или сезонная подборка;
- A/B или friend-cohort experiment;
- периодическая подстановка вариации любимой механики;
- input для фабрики уровней/сеттингов конкретного variant source.

Для будущей персонализации достаточно сохранить границу:

1. affinity/favorite относится к `familyKey`, а не к случайному source slug;
2. прогресс и completion относятся к exact delivered variant/series identity;
3. backend выбирает только delivery-eligible варианты и пишет server-owned
   decision/receipt;
4. cooldown и частота не живут внутри playable;
5. вариация никогда не публикуется автоматически только потому, что прошла
   machine gates.

Конкретные favorite signals, интервалы ротации, progress schema и selection
policy намеренно отложены. Сначала нужна небольшая полка реальных
`library_ready` вариаций и ручное понимание, какие из них действительно
поддерживают разнообразие.

## 9. Не строим в v0

- variant DSL или универсальный rule engine;
- runtime mode switch внутри базовой механики;
- общую progression из Locked/Anchored/Charged;
- UI управления библиотекой;
- backend variant-library table;
- автоматическую ротацию по любимым механикам;
- recommendation model;
- публикацию из candidate sandbox;
- бессрочное хранение рабочих веток как product catalog;
- копирование изменчивого live-state в meta-документы.

## 10. Критерий полезности v0

Подход достаточен, если release-polish одной Wave может закончиться тремя
независимыми `library_ready` entries, которые:

- воспроизводятся из чистого `playables/master` без старого Mac/sandbox;
- имеют понятное правило и parent lineage;
- несут exact technical/runtime/trace/visual identities;
- имеют отдельное ручное taste-решение;
- не видны production до отдельного release;
- можно независимо dogfood, publish, recall или retire.

Если это достигается обычным Git + существующими proof/release primitives,
строить дополнительный registry service не нужно.
