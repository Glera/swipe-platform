# Операторские шаги feed-sequencing (снимок 04.08.2026)

Источник: разведка по `origin/master` swipe-backend; хэндофф
`feed-sequencing-orchestration-handoff-2026-07-27.md` устарел — пакеты 11–12
(§14-отчёт, «факт vs тень», миграция `0067`) уже слиты 29.07, инженерно
контур закрыт целиком, всё default-off. Осталось только операторское.

Все шаги — на бэкенде из авторизованной Render-сессии сервиса (прецедент
28.07: production bootstrap, «вариант А», деплой `2fe216e`). Перед O2/O4
сверить `/api/health`, что задеплоенный код содержит миграции ≥ `0067`
(прод `09fa0cd` от 01.08 — содержит).

## O1 — Включение операторской консоли («Числа ленты» в Lab)
- env: `ENABLE_FEED_SEQUENCING_CONSOLE=true` +
  `ENABLE_FEED_SEQUENCING_CONSOLE_APPLY=true` (apply требует console,
  console требует `enable_catalog_lab_auth`).
- Выдать singleton-грант `feed.sequencing:write` обычным Telegram
  device-flow (миграция `0066`).
- При выключенных флагах роуты физически отсутствуют в приложении.

## O2 — Активация бандла прогонщика (одноразовый exact JSON)
Документ `feed.sequencing-shadow-activation.v1`: `schema`, `requestId`,
`activationVersion`, опц. `slotConfigVersion`/`slotConfigDigest`,
`shadowArms`, `runner`, `registeredBy`.

```bash
python -m app.feed_sequencing_shadow_runner bootstrap --bundle /abs/pilot.json
```

```bash
ENABLE_FEED_SEQUENCING_SHADOW_OPS=true python -m app.feed_sequencing_shadow_runner bootstrap --bundle /abs/pilot.json --apply
```

Сдвиг указателя slot-конфига между валидацией и apply → типизированный
отказ `activation_slot_config_mismatch` (молчаливого пиннинга нет).

## O3 — Прогоны тени
```bash
ENABLE_FEED_SEQUENCING_SHADOW_OPS=true python -m app.feed_sequencing_shadow_runner run-once --worker-id seq-shadow-01
```
`status` — read-only, флага не требует. Внешнее расписание (cron в
`render.yaml`) в репо намеренно отсутствует — отдельное операторское решение.

## O4 — Первый §14-отчёт
```bash
python -m app.feed_sequencing_evidence report --date <UTC-дата>
```
`--apply` — под тем же `ENABLE_FEED_SEQUENCING_SHADOW_OPS`. Окно — UTC-сутки,
settlement-cutoff +24 ч (`window_not_settled` для незавершённого дня). O2
обязана каузально предшествовать измеряемому дню, иначе
`evidence_activation_missing`. Первый отчёт ожидаемо `inconclusive`
(нужно ≥100 независимых игроков) — это штатный выход, не ошибка.

## O5 — Посмотреть «факт vs тень»
- env: `ENABLE_FEED_SEQUENCING_DEBUG=true` +
  `FEED_SEQUENCING_DEBUG_USER_IDS=<id оператора>`.
- `GET /api/feed/sequencing/debug/shadow-vs-actual`; клиент — вкладка «Vs»
  под `?diag=1`.

Примечание: наличие evidence не разрешает player routing — это отдельное
решение оператора (§15).
