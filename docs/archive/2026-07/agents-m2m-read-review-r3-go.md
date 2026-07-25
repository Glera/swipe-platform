# agents-m2m-read v2.1 (`swipe-backend@d83abc7`) — diff-ревью: GO

Дата: 2026-07-19. Ревьюер: внешняя линия.

## Вердикт: GO на реализацию за флагом (§12-rollout). Оба конвергентных P2 закрыты структурно, третьего раунда не требуется.

- **Коалесценция ≠ append-only** — закрыто чисто: живой счёт в мутабельной
  bounded `agents_read_denial_window`, в аудит — одна ленивая идемпотентная
  summary-строка закрытого окна через `INSERT ... ON CONFLICT DO NOTHING`
  (append-only не нарушен), заморожены ключ окна, rollover, crash-семантика
  и UNION-view незакрытого окна. Ровно предложенный breaker-паттерн, доведён
  до исполнимой точности.
- **Lockout** — закрыто в главном: PostgreSQL-бюджет считает ТОЛЬКО
  неуспешные lookup'ы (путь валидного credential его не расходует — выедать
  нечего), admission-бакет per-worker до БД с честно признанной
  мультипликацией, acceptance меряет bounded DB-операции и содержит
  прямой lockout-тест (валидный credential читает во время флуда).
- Остальное: ротация исполнима (`POST /{id}/credentials`, FOR-UPDATE
  сериализация, линеаризация по commit'у revoke), полный wire-outcome на
  2xx/404/422/5xx с serialize-once→digest→audit→send, containment добит
  (https заморожен, `AGENTS_M2M_READ_EXPECTED_PRINCIPAL_ID` против
  `X-Agents-Principal-Id`, `X-Agents-Audit-Id` в receipt, отказ на
  неожиданный Content-Encoding), иммутабельность колонок триггерами,
  грамматика имени, лимиты длин, fail-fast на пустом `DEV_USER_IDS`,
  route-матрица runtime-обходом `app.routes`.

## Две правки при реализации (не блокируют GO, проверю на code review)

1. **Задокументировать остаточный admission-lockout в §3.** Admission-бакет
   считает ВСЕ `AgentsRead`-запросы до auth — устойчивый флуд по-прежнему
   может отдавать 429 легитимному агенту на этом слое (уже не трогая БД).
   Это врождённое свойство любого pre-auth admission; вписать как принятый
   остаточный риск с ограниченным импактом (fail прогона → attention,
   ручной мост — fallback) и, опционально, будущей опцией
   self-authenticating token prefix (keyed-MAC префикс, который worker
   проверяет без БД: мусор отсекается statelessly, валидный токен admission
   не делит с мусором).
2. **Определить источник `last_used` в GET-листинге §4a.** Колонки
   principal/credential объявлены иммутабельными триггерами, а колонка
   `last_used_at` в схеме v2.1 не объявлена вовсе — как колонка она
   противоречила бы собственным триггерам. Зафиксировать: `last_used`
   деривируется из аудита (`MAX(ts)` по credential_id), не хранится.

## Дальше
Реализация по §12: миграция 0046+ и код за `enable_agents_m2m_read=false` →
деплой → флаг → операторский acceptance §9 → агентский PR (§8). Мой чек на
code review: две правки выше + DB-триггеры + wire-outcome инъекции.
