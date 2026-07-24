# Codex cross-review: Island Social Core vision/spec

Дата: 24.07.2026  
Адресат: Клод, автор `island-social-core-vision-v1.md` и
`swipe-backend/docs/specs/island-social-core.md`  
Вердикт: **NO-GO в заявленном виде; направление верное, но нужны продуктовые
решения и исправления trust/measurement boundaries до декомпозиции на
исполняемые пакеты.**

## Граница ревью

Заявленные два исходных файла отсутствовали в доступном workspace и локальных
ветках на момент ревью. Поэтому это cross-review переданных оператором тезисов,
существующих `feed-prototype/ISLAND.md`, `VISION.md` v2.4 и текущего island-кода
backend, а не построчная проверка двух новых документов.

Перед merge автору нужно приложить оба исходника и выполнить disposition
каждого finding по точным секциям.

## VISION-триаж

- **Принципы:** усиливает п. 1 и генеративную мету; использует общий factory
  kernel из п. 6. Конфликтует с п. 3 и Safety/rights, если post-moderation
  заменяет действующий pre-moderation без решения оператора.
- **Лестница / горизонт:** мета «мир-витрина» в VISION находится в горизонте
  «дальше». Боты+друзья до завершения friend-cohort шага являются новым
  контуром и требуют явного исключения из моратория.
- **Вкус / approve:** оператор должен отдельно решить moderation policy,
  допустимость синтетических социальных акторов, auto-friendship и место
  Island Social Core в текущем горизонте.

## Что уже подтверждается кодом

Тезисы корректно опираются на существующий foundation:

- `GET /api/island/public/{owner_id}`;
- `POST /api/island/visits/start`;
- идемпотентный visit identity, TTL и rate limits;
- `POST /api/island/visits/{id}/complete`;
- минимальный dwell перед completion;
- server-owned счётчики plays/likes;
- like только после завершённого визита;
- deep-link `i_<owner_id>`;
- revisioned island state;
- проверка, что hosted artifact принадлежит владельцу.

Но текущий `/complete` доказывает только выдержанный dwell и существование
публичного hosted artifact. Он не доказывает gameplay win.

## Findings

### F001 · P1 · Post-moderation нарушает действующий VISION

VISION v2.4 прямо требует pre-moderation каждого публичного UGC-артефакта до
отдельного решения оператора об автоматизации. Report/takedown обязателен до
расширения аудитории.

Заменить это в техническом ТЗ на post-moderation нельзя: spec не имеет authority
переписать конституцию. Закрытый CDN и takedown enforcement уменьшают ущерб, но
не являются pre-publication решением.

**Требуемая диспозиция:** либо сохранить pre-moderation, либо вынести
отдельный owner decision с предложением VISION v2.5, risk envelope и staged
rollout. До такого решения public delivery новых UGC остаётся закрытым.

### F002 · P1 · Client-asserted «победа» не может называться победой

Минимум 8 секунд, caps и deterministic roll ограничивают фарм, но не доказывают
исход игры. Клиент может вызвать result endpoint без реальной победы. Это
ломает сразу несколько смыслов:

- «лайк только после победы»;
- подарок владельцу за чужую победу;
- коллекционный drop за победу;
- VISION-метрику qualified play;
- анализ реального социального вовлечения.

**Требуемая диспозиция:** выбрать одно:

1. v1 честно называет событие `guest_session_completed` и не использует его как
   win/qualified-play evidence;
2. UGC runtime получает ticket/manifest-bound attestation и сервер принимает
   exact terminal result;
3. награды остаются экспериментальными non-economic counters в отдельном
   namespace, не попадают в North Star, affinity и creator payout.

Даже при варианте 1 endpoint должен связывать result с immutable artifact
identity/revision, а не только с текущим `building_id`.

### F003 · P1 · Боты загрязняют поведенческую аналитику и социальное доказательство

VISION строит спрос из поведения игроков. Server-active bots создают
синтетические visits, gifts, likes или friendship и могут сделать мёртвый остров
визуально живым. Если эти факты неотличимы от человеческих, learning loop
получает ложный спрос.

**Требуемая диспозиция:**

- отдельный actor kind `human | system_bot`;
- отдельные event namespaces и раздельные агрегаты;
- bot activity исключена из qualified plays, affinity, retention, K-factor,
  creator payout и product evidence;
- UI не выдаёт бот-действие за действие реального человека;
- bot registry server-owned, versioned и content-addressed;
- builtin-здания ботов имеют отдельную first-party content closure, а не
  исключение, обходящее `_require_public_artifact`.

Лучшее продуктовое название — «NPC-соседи» или «служебные жители», если именно
это соответствует UX; скрытая имитация друзей неприемлема.

### F004 · P1 · Автоматические взаимные друзья смешивают разные графы и согласия

Автоматически создать взаимную дружбу после случайного визита или bot action —
это не тот же факт, что явный referral/friend acceptance. Он влияет на privacy,
доступность острова, веса rewards и социальные метрики.

**Требуемая диспозиция:** разделить:

- `acquaintance` — серверно наблюдавшийся контакт;
- `friend` — явное действие/acceptance человека;
- `system_neighbor` — связь с ботом.

Только явный human action может создавать friend edge. Автоматический
positive-sum контакт допустим как acquaintance, если UI и policy это честно
показывают.

### F005 · P1 · Client-owned коллекции несовместимы с server-owned drops

Если сервер выдаёт детерминированный drop, но владение карточками остаётся
только на клиенте, сервер не может доказать:

- получил ли игрок карточку;
- была ли она уже получена;
- закрыта ли коллекция;
- можно ли выдать социальную награду;
- переживает ли состояние смену устройства и очистку storage.

**Требуемая диспозиция:** либо коллекции остаются чистой локальной игрушкой без
экономических/социальных последствий, либо появляется append-only
server-owned collection ledger. Промежуточная модель не должна называться
authoritative.

### F006 · P2 · 30% visit-card должен быть server-owned policy

«30% карточка визита» — решение ленты. Оно не должно вычисляться клиентским
random и не может обходить roster/effectful authority.

Нужны:

- versioned policy/config;
- deterministic server-owned assignment;
- exact denominator и opportunity identity;
- frequency cap;
- safe fallback;
- раздельная атрибуция organic human / system bot;
- exclusion из текущего friend-cohort outcome, если rollout не получил
  отдельный approve.

Число 30% должно быть pilot config, а не конституционный инвариант.

### F007 · P2 · «Серия = победа» требует точного определения

Это направление совпадает с VISION только если «серия» действительно означает
ordered `1..N` уровней и terminal chest. Завершение одного island-building
playable или выдержанный dwell серией не являются.

В vision/spec нужно отдельно определить:

- guest series identity;
- количество/порядок уровней;
- terminal condition;
- связь visit, ticket, artifact и series;
- что происходит при reload/retry/replacement/takedown.

Если Island v1 содержит один раунд, его результат нельзя включать в основной
qualified-play denominator.

### F008 · P2 · Builtin-здания ботов не должны обходить publication boundary

Текущая public-island поверхность допускает только hosted artifact владельца.
Предлагаемое исключение для bot registry создаёт второй публикационный путь.

Нужен typed union:

```text
ugc_artifact       → owner-bound artifact + moderation decision
first_party_entry  → catalog/runtime release + promotion authority
```

Проверка по `owner is bot` недостаточна. Любой builtin обязан ссылаться на
exact active/reviewed first-party identity; bot registry не превращается в
publication credential.

### F009 · P2 · Signed URL — транспорт, не identity и не moderation

Закрытый CDN полезен для privacy и takedown enforcement, но:

- в state хранится immutable artifact identity, не истекающий URL;
- backend выдаёт короткоживущий URL после проверки viewer policy;
- replacement/rebuild создаёт новую identity;
- отзыв блокирует новые URL и загрузку существующего iframe;
- CDN caching не должен пережить takedown;
- CSP/frame policy и отсутствие внешней сети сохраняются;
- deep-link не содержит подписанный URL.

Нужно определить поведение уже открытой вкладки при revoke и refresh.

### F010 · P2 · Детерминированный bot-plan требует production-grade scheduler semantics

Seed `(bot, player, date)` предотвращает reroll, но не обеспечивает exactly-once
эффект. Нужны:

- DB-owned UTC date/window;
- immutable plan identity и config digest;
- lease/fencing;
- idempotency key на каждый action;
- bounded catch-up после downtime;
- replay exact committed outcome;
- caps per player/bot/global;
- kill switch;
- receipts;
- отсутствие LLM в scheduled runtime.

Следует переиспользовать паттерны agent-team/A1, а не создавать новый scheduler.

### F011 · P2 · `10 + 10 + MAX` должно быть конфигурацией с семантикой

В исходном тезисе недостаточно контекста, чтобы проверить это решение.
Документ должен назвать сущности, единицы, cap/floor, момент сброса,
authoritative owner и поведение на границе. Если это баланс, число живёт в
versioned config и не зашивается в VISION.

### F012 · P2 · Не зафиксированы replacement и накопленный social value

Существующий Island допускает rebuild слота и фактически создаёт новый
`building_id`; старый social state не переиспользуется. Новое ТЗ должно явно
решить:

- сгорают ли gifts, likes, visits и коллекционный прогресс;
- можно ли завершить визит после replacement;
- к какой artifact revision относится result;
- как takedown отличается от добровольного rebuild;
- что видит гость при stale deep-link.

Рекомендация: result остаётся append-only фактом старой identity, но не создаёт
новую награду после replacement/takedown; committed reward replay остаётся
идемпотентным.

### F013 · P2 · Нет минимального abuse/privacy пакета для social rollout

До расширения за пределы founder dogfood нужны:

- block/report/takedown;
- запрет взаимодействия с заблокированным владельцем/гостем;
- caps и retroactive audit;
- политика Telegram profile exposure;
- удаление/деактивация аккаунта;
- защита от циклического gift farming;
- отдельные bot/human metrics;
- журнал moderation decision.

Rate limit `60/hour` сам по себе не является anti-abuse контрактом.

## Продуктовый комментарий

Сильная сторона инициативы — она превращает остров из редактора декораций в
социальный двигатель: чужая игра создаёт ценность владельцу, а игрок получает
причину переходить между мирами. Это прямо поддерживает VISION: «здания растут
от чужих плеев», «коллекции — социальный клей», «гостевой визит как награда».

Но боты полезны только как bootstrap пустого мира, а не как доказательство
социального спроса. Их задача — показать affordance и дать игроку первый
положительный опыт. Exit-критерий bot-фазы должен быть сформулирован как
появление достаточного человеческого взаимодействия, после которого доля
синтетической активности уменьшается.

Рекомендуемый MVP:

1. один явно обозначенный system neighbor;
2. одна server-owned visit card с низким configurable cap;
3. `guest_session_completed`, не «win», пока нет trustworthy result;
4. отдельные bot counters, не входящие в продуктовую аналитику;
5. acquaintance вместо auto-friend;
6. никаких экономических коллекций до server ledger;
7. pre-moderation сохраняется;
8. сначала founder dogfood и отдельный owner-approved exception к мораторию.

## Вопросы, требующие решения оператора

1. Разрешаем ли изменение VISION с pre- на post-moderation, или сохраняем
   действующий шлюз?
2. Должен ли пользователь явно видеть, что взаимодействует с ботом?
3. Может ли система автоматически создавать только acquaintance, но не friend?
4. Считаются ли island-сессии qualified play или отдельной метрикой?
5. Разрешён ли Island Social Core как исключение из текущего моратория?
6. Имеют ли коллекции экономические/социальные последствия в v1?
7. Что именно означает `10 + 10 + MAX`?

## Условия GO для следующего ревью

- оба исходных документа доступны в репозитории;
- у каждого finding есть accepted/fixed/rejected disposition;
- moderation и bot disclosure утверждены оператором;
- event taxonomy разделяет human, bot, session completion и verified win;
- content identity закрыта для UGC и builtin bot buildings;
- collection authority определена без client/server split-brain;
- visit-card включается versioned server policy;
- scope либо помещён после friend cohort, либо имеет явное исключение из
  моратория;
- spec содержит исполняемые acceptance cases для replay, concurrency,
  replacement, takedown и abuse caps.

