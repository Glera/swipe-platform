# agents-m2m-read: point-check фикс-волны @ `0e0eb2b` — GO на merge/deploy

Дата: 2026-07-19. Ревьюер: внешняя линия (мягкий пакет CR-r1).

## Вердикт: GO. Открытых P1/P2 нет. CI-свидетельство привязано к точному SHA.

Проверено лично ревьюером:
- CI run `29685404441`: headSha = `0e0eb2b` (exact), branch agents-m2m-read,
  conclusion success — включая Full PostgreSQL acceptance (4m) и
  migration-leg `agents-m2m-read-0046`.
- Контрактный P1 строгого пакета: `_PRINCIPAL_RATE_SQL` теперь условный —
  `DO UPDATE ... WHERE count < :limit RETURNING count`; отсутствие строки =
  429 без расхода, счётчик пинится на лимите.
- Локальный прогон: 62 passed (33 pure M2M + человеческие content-analytics
  после экстракции), 35 PG-gated skip.

Проверено адверсариальным точечным срезом (все шесть фикс-коммитов):
- **Все четыре «неспособных упасть» теста стали способными**, с явным
  разбором регресса: route-матрица без префильтра упадёт и на 4-й ручке, и
  на чужом маршруте; straggler-тест доказуемо падает при регрессе
  `clock_timestamp()`→`now()` (red-пивот на `assert row is not None` —
  механика проверена построчно); NULL-уникальность бьётся в ОБЕИХ
  denial-таблицах; revoke-vs-use — детерминированный interleave с
  незакоммиченным revoke (сильнее и стабильнее threads-гонки).
- Тест лимита закрепляет ровно контракт: 25 конкурентных при лимите 10 →
  admitted 1..10, stored == 10 (отклонённые не расходуют); старый
  `range(1,26)`-ассерт удалён.
- prune ожил (event-driven, ≤1/5мин/worker, не трогает summary/audit;
  sealed-unsummarized неудаляем — тест); downgrade-guard по всем шести
  таблицам с anonymous-only тестом; runbook = принятый v3-паттерн
  (mktemp -d + trap HUP/INT/TERM/EXIT + --proto '=https' + header-file;
  «staging в каталоге назначения» не применим — это read-рецепт без
  публикуемого артефакта, не регресс); flood-recovery ассерт (спад →
  валидный 200); admission-лог структурный, батчированный ≤1/сек, без БД;
  flag-off = реальные 404; экстракция чистых read-функций выполнена
  (машинные ручки больше не зовут HTTP-хендлеры); refill из собственной
  ручки; composite FK `(principal_id, credential_id)` с тестом на
  чужую пару; teardown-truncate после каждого теста, чужие сьюты не задеты.
- Дифф-скан: ослабленных ассертов нет (удалённые заменены строгими),
  новых путей утечки токена нет, скоуп чист.

Остаточное (не блокирует, backlog):
- P3: downgrade-guard тестирован по anonymous-window и mixed; варианты
  summary-only/rate-only/audit-only/credential-only покрыты единым FOREACH,
  но не заассерчены поимённо.
- Заметка: паритет runbook-рецепта с a2-shadow v3 сверен по описанию
  (сам док живёт в swipe-agents), точечная сверка — при следующем касании.

## Дальше (порядок исполнителя подтверждаю)
merge в master → deploy (default-off; health-watcher редеплой уже
переживал) → включение `ENABLE_AGENTS_M2M_READ` отдельным шагом → выпуск
первого принципала + ручной acceptance по runbook → агентский fetch-PR в
swipe-agents после graduation A1-недели.
