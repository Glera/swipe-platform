# Codex cross-review: Island Social Core v1

Дата: 24.07.2026  
Адресат: Клод, автор документов
Проверенные ревизии:

- `p4g-workspace-meta@a0566d5:island-social-core-vision-v1.md`;
- `swipe-backend@632b88e:docs/specs/island-social-core.md`;
- `p4g-workspace-meta@cf3dd47:VISION.md` v2.4;
- существующие `feed-prototype/ISLAND.md`, `swipe-backend/app/api_island_social.py`
  и `api_island_state.py`.

Вердикт: **NO-GO на реализацию полного среза.** Направление согласовано с
генеративной метой и виральностью VISION, а draft существенно сильнее
первоначального пересказа. До декомпозиции нужны четыре P1-исправления,
диспозиция P2 и отдельный утверждённый патч VISION для moderation policy.

## VISION-триаж

- **Принципы:** усиливает п. 1 и 6, целевую картину «Генеративная мета» и
  раздел «Виральность». Post-moderation конфликтует с действующим п. 3 и
  Safety/rights до принятия новой версии VISION.
- **Лестница / горизонт:** код остаётся скрытым от friend cohort, поэтому
  разработка default-off не меняет продуктовый шаг. Любой показ реальным
  пользователям — отдельное решение оператора. Включение social-core всё равно
  является новым контуром и не наследует разрешение только из feature flag.
- **Вкус / approve:** оператор уже выбрал продуктовые правила в source-доке,
  но отдельно должен утвердить точный VISION diff, rollout и использование
  синтетической активности ботов.

## Что в draft сделано правильно

После чтения исходников снимаются несколько предварительных опасений:

- visit-award описан как server endpoint с deterministic roll, а не client
  random;
- bot facts имеют `source='bot_schedule'`, реестр `island_bots` и явное
  исключение из продуктовых метрик;
- UI обязан показывать badge «бот»;
- visit card не телепортирует автоматически и не блокирует ленту;
- social progression основан на append-only facts;
- UGC и Island скрыты от friend cohort отдельными default-off gates;
- bot generation не вызывает модели;
- post-moderation записан как изменение, требующее отдельного VISION diff, а
  не как молчаливое переопределение authority;
- rebuild создаёт новый `buildingId`, а старая social identity не переносится.

Существующий код действительно даёт хороший foundation: TMA auth, visit
identity, TTL, rate limits, min dwell, server-owned counters, completion-gated
likes, revisioned state и owner-bound hosted artifacts.

## P1 findings

### F001 · Изменение moderation нельзя реализовывать раньше конституционного решения

Источник:

- vision §1.10 и §2;
- spec §4.2, строки 420–427.

Документы честно говорят, что post-moderation заменяет действующую
pre-moderation. Но порядок работ в spec допускает параллельную реализацию
moderation, а VISION v2.4 пока требует pre-moderation каждого публичного UGC.
Решение в чате ещё не является применённой новой конституцией: сам VISION
говорит, что его правки проходят через оператора.

**Требуемое исправление:**

1. подготовить отдельный VISION diff с новым risk envelope;
2. получить явное утверждение оператора;
3. только после merge менять publication/moderation semantics;
4. до этого public UGC сохраняет pre-moderation либо остаётся недоступным
   внешним гостям.

Bake autoplay доказывает проходимость, но не безопасность названия, prompt,
визуала, IP или abusive content. Report/takedown сокращает время реакции, но не
эквивалентен pre-moderation.

### F002 · Client-authored `roll_id` не доказывает существование сундука

Источник:

- spec строки 101–107;
- spec строки 182–195;
- spec строки 381–393;
- открытый вопрос §8.6.

Endpoint принимает созданные клиентом `roll_id` и `context`. Детерминированный
hash предотвращает повтор одного ID, но не мешает клиенту создавать новые UUID
без завершённой серии. Дневной cap ограничивает масштаб, но не восстанавливает
causal invariant «ролл существует только после сундука». Caller-authored
`context` также нельзя использовать как evidence mechanic/series.

**Требуемое исправление:**

- вход — server-owned terminal series/chest receipt identity, а не свободный
  UUID;
- backend проверяет, что receipt принадлежит caller, terminal и ещё не имеет
  island roll;
- `roll_id = uuid5(namespace, chest_receipt_id)` выводится сервером;
- mechanic/series context реконструируется сервером;
- UNIQUE связывает один roll с одним exact chest receipt;
- legacy/builtin chest без серверной identity либо не участвует, либо получает
  отдельный server-issued meta opportunity в транзакции выдачи сундука.

### F003 · `pending_gifts` не пересчитывается только из play facts

Источник:

- spec строки 76–84;
- spec строки 140–167;
- invariant §1.3.1, строки 219–223;
- DoD строки 486–492.

`pending_gifts` меняется и чужими wins, и owner collect. Более того, cap 9
делает результат зависимым от порядка событий:

```text
win × 12 → collect → win
```

не равен простому `count(play_facts) - sum(collect_claims.gifts)` без
последовательной replay-семантики. Фраза «recompute derived == facts» неверна,
если `facts` означает только `island_play_facts`.

**Требуемое исправление:**

- источник истины — объединённый ordered ledger `play_fact | owner_collect`,
  либо два append-only журнала с однозначным total order;
- collect claim хранит точный causal cutoff/version social state;
- replay применяет события по DB-owned sequence, включая cap после каждого
  события;
- инвариант и DoD называют оба журнала;
- concurrency test покрывает `win ↔ collect` в обоих commit order.

Если такой replay не нужен, удалить обещание полного пересчёта и честно назвать
`pending_gifts` transactional materialized balance, а facts — основанием только
для `foreign_wins`.

### F004 · Планировщик ботов не имеет безопасной multi-instance семантики

Источник:

- spec §2.3, строки 303–319;
- открытый вопрос §8.3.

Фраза «конкурентных инстансов нет; при появлении — advisory lock» — deploy
assumption, не инвариант. Rolling restart, Render overlap, ручной запуск и
повторный worker уже могут дать два исполнителя. UUID5 предотвращает двойной
INSERT факта, но если инкременты выполнены не строго по факту `INSERT ...
RETURNING`, можно задвоить materialized effects. План также не фиксируется
immutable документом: изменение config/persona в течение UTC-дня способно
переинтерпретировать тот же seed.

**Требуемое исправление:**

- не откладывать fencing: DB lease/advisory lock обязателен с v1;
- immutable daily plan identity включает bot, player, UTC date и config digest;
- effect применяется только транзакцией, где first insert факта доказан через
  `RETURNING`;
- bounded catch-up и terminal receipt определяют поведение после downtime;
- disable/re-enable и config rotation имеют точную семантику;
- использовать supervisor/agent-team scheduling pattern либо отдельный cron,
  но не lifespan runner без ownership contract.

## P2 findings

### F005 · Client-asserted событие нельзя смешивать с verified win

Источник:

- vision §1.1 и §1.4;
- spec строки 24–34;
- spec строки 133–156;
- invariant §1.3.5, строки 234–239;
- accepted limitation §7.

Сервер проверяет только caller, visit, artifact visibility и elapsed time.
`postMessage completed/success` остаётся клиентским утверждением. Дополнительный
`min_win_time` из bake-манифеста не превращает его в серверный oracle.

Для закрытого dogfood риск можно принять, но терминология и метрики должны быть
честными:

- durable факт называется `guest_completion_claim`, не verified win;
- он не входит в основной qualified-play denominator, affinity, retention,
  creator payout или рекламное evidence;
- `guest_win` в `island_meta_events` переименовывается;
- аналитика отдельно хранит claimed и в будущем verified outcomes;
- rollout реальным друзьям имеет отдельный fraud/abuse gate.

Текущие caps допускают до 200 visit claims/день, а guest grant по умолчанию —
3 пазла на уникальный домик/сутки. Формулировка «экономических необратимостей
нет» неверна: `puzzle_ledger` — authoritative balance. Нужен отдельный
island-earned daily cap на пазлы и kill switch наград.

### F006 · Bot progression допустим как UX, но не как organic evidence

Источник:

- vision §1.2, §3;
- spec строки 55–74, 230–233 и §2.

Draft уже хранит bot source, исключает ботов из продуктовых метрик и показывает
badge — это правильно. Однако боты всё же:

- растят визуальную стадию;
- начисляют owner accrual;
- ставят likes в обход visit gate;
- автоматически занимают friend slot.

Это допустимый bootstrap empty-state только при явной семантике:

- UI различает рост от людей и системных соседей хотя бы в деталях;
- bot likes не смешиваются с human likes либо маркируются source;
- bot accrual имеет отдельный дневной/global cap;
- bot-minted пазлы не участвуют в будущей creator economy;
- scoreboard не называет bot activity социальной валидацией;
- exit bot-фазы — наблюдаемая человеческая активность, после которой bot share
  снижается.

Фраза «боты неотличимы для системы» в vision §3 противоречит фактическим
`source`/`is_bot` веткам и должна быть заменена на «используют общий ledger и
projection path, но остаются различимы как actor/source».

### F007 · Builtin bot house должен ссылаться на exact first-party identity

Источник:

- spec строки 21–23;
- spec §2.1, строки 276–293;
- открытый вопрос §8.2.

Строкового mechanic id из «текущего ростера» недостаточно. Ростер меняется, а
public house должен быть привязан к точному reviewed runtime/content closure.
Сам факт `owner ∈ island_bots` не является publication authority.

Нужен typed source:

```text
ugc_artifact
  → owner-bound artifact identity + moderation state

first_party_builtin
  → roster/config revision + playable/variant/runtime release identity
```

Seed CLI обязан сохранить immutable binding. Runtime должен загружаться по этой
binding, а не по mutable current roster lookup. Replacement создаёт новую house
revision/identity.

### F008 · Friendship без удаления создаёт неустранимую связь

Источник:

- vision §1.8;
- spec строки 92–99 и 169–180;
- accepted limitation §7.

Для human invite взаимность имеет разумное implicit consent: один человек
поделился ссылкой, второй её открыл. Auto-friend с явно обозначенным ботом также
может быть частью onboarding. Но отсутствие remove/block при лимите 20 создаёт
неустранимое состояние и privacy-проблему.

Минимум до внешнего rollout:

- remove friendship;
- block, исключающий visits, awards, notifications и profile exposure;
- invite preview до accept;
- bot friendship не расходует human friend cap либо удаляется;
- notification не отправляется пользователю без write access.

### F009 · Server drop + client-only collection создаёт split-brain

Источник:

- spec строки 149–167;
- spec §1.4, строки 249–254;
- client §3.2–3.3;
- accepted limitation §7.

Endpoint сохраняет выпавшую card и может вернуть её при replay — это лучше,
чем видно из исходного пересказа. Но backend не знает, была ли карта применена
в `localStorage`, пережила ли смену устройства и закрыла ли коллекцию.

Допустимы два честных варианта v1:

1. сервер выдаёт только puzzles; cards ждут server-owned collection ledger;
2. card — локальный cosmetic bonus без server metrics, economy, collection
   completion rewards и социальных последствий.

Нельзя считать `gift_claimed` доказательством владения карточкой.
Дублированный registry в backend усугубляет drift; shared versioned registry с
digest предпочтителен уже в первом срезе.

### F010 · Visit-card конкурирует за внимание после сундука

Источник:

- vision §1.3;
- spec §3.5.

То, что visit roll не мутирует feed-policy trigger, закрывает технический
конфликт, но не продуктовый: после сундука одновременно возникают continuation
следующей серии и meta-card. 30% карточка меняет внимание и может исказить
измерение возврата/continuity.

Нужны:

- отдельная randomized holdout assignment;
- exact denominator: eligible terminal chests;
- mutually exclusive UX slot после ceremony;
- измерение `card shown → accepted → claimed completion → own island`;
- guardrail на продолжение ленты и time-to-next-series;
- число 30% остаётся versioned config;
- bot-target и human-target анализируются отдельно.

### F011 · Moderation queue не имеет lifecycle

Источник:

- spec строки 109–117 и 197–211;
- spec §4.2.

`island_reports` immutable и `island_takedowns` one-row-per-building, но нет:

- reviewed/dismissed/escalated resolution;
- moderator receipt и reason taxonomy;
- SLA/oldest-unreviewed;
- restore/appeal policy;
- action по owner/account, если контент повторяется;
- exact artifact revision в report/takedown.

Без этого «операторская лента постфактум» не доказывает, что публикации
просмотрены, а report queue нельзя закрыть без takedown.

### F012 · Signed URL — транспорт, не artifact identity

Источник:

- vision §2;
- spec §4.3.

В state должен оставаться `rel + content digest + artifact revision`, а не
presigned URL. Endpoint обязан выдавать URL только после проверки exact current
building identity и takedown. Дополнительно нужны acceptance cases:

- URL не попадает в telemetry/logs;
- expired URL корректно re-resolve'ится после foreground/reload;
- takedown блокирует новые URLs;
- поведение уже открытого iframe при takedown зафиксировано;
- range/CORS/content-type/CSP проверены в Telegram iOS/Android/Desktop;
- cover и HTML связаны одним manifest digest;
- «недоступно без платформы» формулируется честно: bearer URL доступен любому
  получателю до expiry.

### F013 · Async theme queue недоспецифицирована

Источник: spec §4.1.

Нужны хотя бы:

- immutable input/request digest;
- bounded attempts и terminal failure;
- lease owner/fencing;
- exact replay готового ответа;
- cancellation/timeout;
- no second physical model run под тем же attempt;
- model/profile/effort receipt;
- quota consumed once;
- migration semantics для lost 200/202 response.

Следует переиспользовать существующие job/receipt contracts, а не только UI
паттерн polling.

### F014 · Документы не исполняют обязательный VISION-триаж v1.2

Оба новых документа появились после AGENT-ROLES v1.2, но не открываются
трёхстрочной секцией: принцип, лестница/горизонт, человеческий approve.
Содержание частично разбросано по введению, однако обязательная форма нужна
именно для автоматической сверки.

Также ссылка spec `../../..//island-social-core-vision-v1.md` не является
стабильной внут­рирепозиторной ссылкой: target живёт в sibling meta-repo. Нужно
указать repository + pinned commit/path либо canonical web link, не
маскировать cross-repo boundary относительным путём.

### F015 · Authority и privacy для operator moderation требуют отдельного контракта

Config allowlist `island_moderator_ids` даёт TMA-пользователю чтение prompt,
report и artifact, а также takedown. Это effectful content authority.

Нужны:

- отдельный scoped grant/role, а не только числовой allowlist;
- CSRF/TMA replay и audit expectations;
- exact artifact/building revision в action;
- idempotent actor receipt;
- отсутствие moderation route из обычной client navigation;
- минимизация выдаваемых profile/prompt данных;
- rotation/revocation.

## Ответы на вопросы автора

### Анти-абьюз

Текущих мер достаточно только для закрытого dogfood без значимой экономики.
Дешёвые усиления:

- island-specific earned-puzzle cap per human/day;
- pair cap `(guest, owner, day)` и diminishing returns;
- отдельные human/bot/source projections;
- block связанных self-controlled аккаунтов хотя бы по anomaly report, не
  автоматическим баном;
- server-bound chest opportunity;
- claimed completion не считать verified win;
- replay одного exact result возвращает byte-identical reward.

### Каталог/feed

Island может оставаться отдельным namespace, но first-party builtin identity и
visit opportunity должны ссылаться на server-owned catalog/feed evidence.
Caller-authored mechanic/series context запрещён как аналитический факт.

### 30% после сундука

Storage-конфликта с continuity trigger нет, если meta opportunity не потребляет
его. Measurement-конфликт есть; нужен holdout и один UX arbitration point после
ceremony.

### Post-moderation

Для «боты + оператор», без внешней доступности, guardrails достаточны как
закрытый QA. До реальных друзей нужны применённый VISION patch, report/block,
moderation lifecycle, takedown по exact artifact и наблюдаемый review SLA.

### Боты

`source` и `is_bot` обязательны во всех сырых фактах. Бот может использовать
общий projection path, но не должен быть неотличим в аналитике, UI, likes и
economy.

### CDN

Нужен отдельный device spike до архитектурного commit: Telegram iOS, Android и
Desktop, iframe navigation, CORS, range, caching, expiry during play, resume и
takedown. Лучше выдавать short-lived platform URL/redirect или CDN token,
оставляя canonical content identity стабильной.

### Метрики

Кроме трёх заявленных:

- eligible chest → card shown;
- shown → accept;
- accept → play claimed completion;
- human vs bot target;
- time-to-next-feed-series и continuation rate после card;
- bot share of house growth/rewards;
- report rate, oldest-unreviewed, takedown latency;
- repeat visits и D1/D7 island return;
- operator review minutes per public artifact.

## Рекомендуемый scope первого GO

Чтобы не смешивать четыре больших риска, первый срез лучше ограничить:

1. migration и append-only claimed-completion facts;
2. один явно обозначенный system neighbor;
3. exact first-party binding для его домов;
4. bot activity с отдельным source, caps и fenced daily plan;
5. house visual progress без cards и без значимой currency;
6. owner collect как cosmetic/dogfood feedback;
7. Island остаётся скрытым от friend cohort;
8. async-theme можно делать отдельным независимым пакетом;
9. CDN — отдельный device-proven vertical;
10. human friendship, visit-card и post-moderation rollout идут следующими
    пакетами после своих acceptance gates.

## Условия GO для повторного ревью

- применена диспозиция F001–F015;
- P1 исправлены в тексте, а не оставлены open questions;
- VISION-triage добавлен в оба документа;
- visit opportunity server-bound к terminal chest evidence;
- pending accrual имеет воспроизводимую replay-модель;
- bot scheduler fenced с immutable daily plan;
- claimed/verified outcomes разведены;
- first-party bot house имеет exact immutable binding;
- moderation policy либо остаётся pre-moderated, либо уже утверждена новой
  версией VISION;
- rollout разбит на independently gated пакеты;
- DoD покрывает concurrency, lost response, config rotation, replacement,
  takedown и bot/human metric separation.
