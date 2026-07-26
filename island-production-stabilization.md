# Island Production Stabilization

Дата: 26.07.2026. Решение оператора: GO.

## Цель

Закрыть острова как наблюдаемый production-контур после P1–P5, не добавляя
новую экономику или автоматическую модерацию:

1. вернуть owner-facing ощущение «мою механику играют», но только из реальных
   human/server-bot completion facts;
2. дать оператору компактный PII-free health-срез;
3. привести Island-документацию в соответствие private R2/P5;
4. проверить rollout на production без возврата локального симулятора.

## Замороженная семантика activity

- Источник: `island_completion_claims`, не visit-start и не клиентский таймер.
- Human = `guest_visit`; bot = `bot_schedule`, всегда визуально различимы.
- Первый read устанавливает server high-water cursor без historical replay.
- Следующие reads идут по monotone `seq`; cursor хранится per Telegram user.
- Удалённый/taken-down building и текущий block скрывают факт, но не
  останавливают cursor.
- UI — глобальный slide-down toast поверх любой вкладки; polling fail-quiet,
  не удерживает session/gameplay.

## Health

Read-only `python -m app.island_health --hours 24` возвращает
`island.health.v1` без user ids, имён и промптов:

- runtime gates и Island inventory;
- visits/completions + human/bot claims + bot plans;
- bake/theme status и oldest active;
- notification outbox/attempt outcomes и oldest pending;
- report/moderation status и oldest open.

Resolver failures пока остаются логовым, а не persisted фактом; отчёт обязан
указывать это ограничение.

## Exit

- чистая PostgreSQL base→head + Island PG suite;
- production-client browser acceptance: baseline, cursor resume, human toast,
  bot toast;
- полный client lint/build и backend CI;
- независимое review до merge;
- production smoke: exact client/backend heads, Island gates без изменений,
  первый read не показывает исторических ботов.
