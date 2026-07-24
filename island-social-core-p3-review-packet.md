# Island Social Core — P3 (модерация) review packet

Дата: 25.07.2026. Пакет P3 по ТЗ `swipe-backend/docs/specs/island-social-core.md`
v1.3 §2.1/§2.2/§4.2/§5.2. Конституционный гейт пройден: VISION v2.5
(staged post-moderation, утверждено оператором 24.07.2026,
`p4g-workspace-meta@e98fe11`). Автор — Opus-субагент, внутреннее
адверсариальное ревью — независимый субагент, оркестрация — Claude.
Готов к независимому Codex-ревью.

## Ветки / коммиты (стыкованы поверх island-social-core-p1 ПОСЛЕ его
Codex-фикс-раунда)

- **Backend** `swipe-backend`, ветка `island-moderation`
  (base = `origin/island-social-core-p1` @305505e):
  - `0b7ef0a` Island Social Core P3: report + операторская модерация
  - `dea261b` Island Social Core P3-fix: адверсариальное ревью
  - Миграция **0053** `island_mod_action_seq` (seq BIGSERIAL на receipts,
    детерминированный backfill, roundtrip проверен).
- **Client** `feed-prototype`, ветка `island-moderation`
  (base = @91c904e): `a796cc0` + `7fa2809` + `9e4d7a2`.
- Master нигде не пушился; деплоя/enable не было.

## Что реализовано

- **Report:** `POST /island/buildings/{id}/report` — гость (не владелец,
  не заблокированная пара, только публичный не-бот домик), reason enum +
  text≤500, `artifact_rel` пинится на момент жалобы, дедуп
  UNIQUE(building, reporter) → 200 сохранённое, rate-limit 10/день
  (списывается после дедупа/проверок), meta-событие.
- **Операторские** (allowlist `island_moderator_ids` применяется сервером
  на каждом запросе; пусто = никто; 403 без утечки и без receipt; роутер
  за `ENABLE_ISLAND_SOCIAL`):
  - `GET /island/moderation/publications` — все UGC-публикации (боты
    исключены на SQL + double-check по `island_bots`), минимум профиля,
    keyset-пагинация `(created_at, id)` без потерь, добор окон до limit;
  - `GET /island/moderation/reports?status=` — lifecycle-фильтр;
  - `POST takedown {building_id, artifact_rel, reason}` — exact-ревизия,
    stale → 409 с current_rel, идемпотентный повтор = 1 receipt;
  - `POST restore`, `POST reports/{id}/resolve {reviewed|dismissed|
    escalated}` — каждый акт = append-only receipt в
    `island_moderation_actions`.
- **Derived-состояние снятия** = последний takedown/restore receipt по
  **монотонному `seq`** (0053; запись под FOR UPDATE соц-строки → seq =
  commit-порядок per building, не wall-clock). Читается всеми путями:
  public, state, visits/start, visits/complete (legacy), like, result,
  gift_available_today, выбор целей ботов, friends-счётчик публикаций.
- **Закрыто принятое окно P1-B:** бот-план перепроверяет takedown/block
  при исполнении (`_apply_bot_claim` → skip, rollback до любых
  инкрементов). Same-day resumption после restore — намеренная семантика
  («не переносится» = межсуточно), claim дедуплицирован uuid5.
- **Клиент:** репорт-панель гостя (⚑ в шапке play + win-модалка, доступна
  после проигрыша), плашка «снято оператором» владельцу, операторская
  консоль за `?diag=1` (список публикаций + two-tap takedown/restore с
  exact `artifact_rel`, лента жалоб + resolve, «Показать ещё» с keyset
  before) — консоль документирована как навигация, НЕ authorization
  boundary: гейтит сервер.

## Внутреннее адверсариальное ревью → фиксы

Вердикт: GO-с-условиями, ноль P1. Все условия закрыты `dea261b`/`9e4d7a2`:

| Находка | Фикс | Доказательство |
|---|---|---|
| P2-1 «last wins» держался на created_at (transaction-start, без tiebreak) | 0053: seq BIGSERIAL, хелперы сортируют по seq DESC | **red-then-green**: с created_at-сортировкой тест падает на инвертированных метках, с seq — pass |
| P3-1 friends-счётчик публикаций не исключал снятые | `is_taken_down` в подсчёте | тест 2→1 |
| P3-2 комментарий re-check заявлял «never revisits» | честный комментарий; семантика same-day resumption подтверждена оркестратором | тест skip→restore→ровно 1 claim |
| P3-3 пагинация теряла строки с равным created_at и молча обрезала publications | keyset (created_at, id), добор окон, клиентский «Показать ещё» | тесты обеих лент |
| P3-4 тест-пробелы | report blocked/несуществующий/непубличный/бот → 404; resolve на несуществующий → 404; restore-noop = 0 receipts; гонка takedown↔result (Barrier) | все зелёные |

Ревью проверило без находок: серверный allowlist fail-closed на каждом
роуте; exact-revision 409; append-only receipts под FOR UPDATE (1 receipt
даже под гонкой); приватность (без photo_url, репортёр — голый id);
клиентские формы без выдуманных полей; аддитивность guard'ов (0 регрессий
P1-тестов).

## Числа (финальный прогон после фиксов)

- Island PG-сьюты: **64 passed, 2 skipped** (moderation 22, из них 10 —
  фикс-раунд; core/bots/migration без регрессий).
- Миграция 0053: upgrade→downgrade→upgrade чисто; migration-сьют зелёный.
- Полный pure: **843 passed / 325 skipped / 0 failed**.
- Клиент: tsc чисто, vite build зелёный.

## Задокументированные решения / известные ограничения

1. Таблицы `island_takedowns` нет — состояние derived из receipts
  (соответствует ТЗ v1.3; ранний черновик-бриф оркестратора упоминал
  таблицу ошибочно, автор разрешил по источнику истины).
2. Same-day resumption бот-плана после restore — намеренно; межсуточного
  переноса нет (план per utc_date).
3. «Отказ artifact-url» из §7 в P3 не проверяется: signed-URL контур —
  P5 (closed CDN); до него прямой CDN-доступ к снятому артефакту не
  блокируется (public-репо, известное принятое состояние P1).
4. Дубликат derived-хелпера в двух модулях — осознанный (разрыв
  циклического импорта), логика идентична, оба на seq.
5. Обнаруженная и закрытая в P3 дыра P1: guest-пути visits/start,
  visits/complete (legacy), like не проверяли takedown (helper был
  инертен) — теперь 404.

## Вопросы Codex'у

1. Достаточен ли seq-подход (BIGSERIAL под FOR UPDATE) как монотонный
   порядок receipts, или требуете общий event-seq с claims/collect?
2. Приемлема ли same-day resumption бот-плана после restore (п.2 выше)?
3. Консоль за `?diag=1` при серверном allowlist — достаточно для
   одного оператора до P2-роли, или требуете отдельный вход уже сейчас?
