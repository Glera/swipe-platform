# Island Social Core P1 — Codex diff-only review R2

Дата: 2026-07-25  
Backend: `bb8430b..305505e`  
Client: `c27b58b..60372ac`  
Evidence-only client commit: `91c904e`  
Вердикт: **NO-GO — F002 из R1 закрыт не полностью**

Patch identity проверена в изолированных checkout. Оба delta состоят ровно
из одного заявленного commit; staged/unstaged/untracked, binary и excluded
secrets отсутствуют. База определена через `baseFallback: local-master`.

## R2-F001 [P1] — builtin binding всё ещё не задаёт exact runtime revision

`feed-prototype/src/island.ts:310-342`

Фикс правильно сделал `builtin.mechanicId` authority вместо `tpl` и fail
closed для неизвестного mechanic. Но `rosterRevision` и `versionsDigest`
только логируются. `playableUrl(id)` по-прежнему открывает текущий mutable
deploy этого playable.

Это не выполняет условие R1 F002: runtime должен выбираться по exact immutable
binding. После ротации deploy пользователь может сыграть новые байты под
старым `buildingId/versionsDigest`. Evidence с несовпадающими
`tpl="merge"`/`mechanicId="sort"` доказывает только authority mechanic ID,
но не authority revision/digest.

Нужно одно из двух:

1. резолвить versioned runtime URL/manifest по
   `(mechanicId, rosterRevision, versionsDigest)` и fail closed при
   несовпадении digest; либо
2. если платформа пока технически не умеет versioned delivery, изменить
   P1-контракт и не заявлять immutable runtime binding до появления такого
   контура.

Regression evidence: сменить current deploy при неизменном сохранённом
binding и доказать, что старый домик продолжает загружать старую exact
ревизию либо честно становится unavailable.

## R2-F002 [P2] — лимит retry friend accept сбрасывается каждым reload

`feed-prototype/src/feed.ts:6852-6860`

`persistPendingFriendAccept()` всегда записывает `{attempts: 0}`. Telegram
start param может сохраняться при повторном открытии того же invite, поэтому
устойчивый transient/5xx никогда не достигает лимита 5: каждый boot начинает
с нуля.

При том же code нужно сохранять существующий `attempts`; обнулять его только
для нового code или после definitive outcome.

## Проверка остальных пунктов R1

F001 и F003–F011 закрыты по коду и приложенному evidence:

- bot budget теперь действительно per `(bot, player, day)`;
- replay проверяет caller и outcome fingerprint;
- block закрывает public/start/complete/like;
- seed ротирует bot snapshot и сохраняет history;
- `/result` повторяется по тому же visit ID с `Retry-After`;
- cold-user accept перенесён после `/session`;
- client flag гейтит direct entries;
- HUD/stage/gift marker синхронизируются;
- friend E2E waiter и visibility assertion исправлены.

Слепая находка о replay receipt после последующего block **отклонена**:
receipt terminal и по §2.2 повтор возвращает сохранённый response без
переоценки последующего состояния; новых claim/gift/plays replay не создаёт.

## Verify

- backend pure targeted:
  `pytest -q tests/test_island_bots.py tests/test_island_social_core.py`
  → **12 passed**, exit 0;
- авторский PG/browser evidence из §12:
  core 31, bots 11, migration 2, full pure 846, client tsc/build и шесть
  vertical checks → PASS.

После закрытия R2-F001 достаточно точечного R3 по runtime resolver и
version-rotation test; весь P1 dogfood повторять не требуется.
