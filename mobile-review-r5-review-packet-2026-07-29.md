# R5 handoff: mobile-first Lab review queue

Дата: 2026-07-29. Автор исправлений: Codex. Основание:
`mobile-review-independent-review-r4-2026-07-29.md`.

Ветка во всех четырёх репозиториях:
`codex/mobile-review-performance`.

| репозиторий | R4 head | R5 head |
| --- | --- | --- |
| `swipe-backend` | `cfb499d` | `6a526ac` |
| `feed-prototype` | `4fdfa96` | `fd7c6b1` |
| `swipe-generator` | `20e25fa` | `c8cc533` |
| `swipe-agents` | `67fad8a` | `c69f5a8` |

Ничего не мержилось и не деплоилось. Пакет предназначен для независимого
повторного ревью.

## 1. R4-B1 и backend-инертность

- HTML admission декодирует UTF-8 fatal, запрещает NUL и допускает только
  стандартный HTML doctype, включая whitespace, один BOM в позиции 0 и
  `SYSTEM "about:legacy-compat"`. `space + BOM`, двойной BOM и отсутствие
  doctype отклоняются.
- Backend принимает не два маркера по substring, а полный frozen 690-byte
  CSP/challenge bridge ровно один раз и строго сразу после doctype.
  Независимая сверка producer/backend дала одинаковый SHA-256:
  `836a8a24f9039af886fb4dfa4aef77be999e32d04dd415b0e8f39831547d44a4`.
- JSON depth/`parse_constant` тестируются через настоящий HTTP parser с
  permissive Pydantic model; NUL в ключе проверяется на прямой boundary.
- Все пять mobile-review write-путей получают injected `DBAPIError` на
  `flush` и обязаны вернуть `MobileReviewStorageInvalid`.
- PostgreSQL-тест сравнивает реально мигрированную БД с `Base.metadata` через
  Alembic `compare_metadata`, затем читает `pg_get_constraintdef` и проверяет
  критические литералы `524288`, `32768`, `4194304`,
  `publication_prepare`, `completed_elsewhere`.
- Signed preview ticket отдельно отклоняет artifact вне membership bundle.

Фокус: `35 passed`. Полный локальный backend:
`1189 passed, 593 skipped, 10 subtests passed`. PostgreSQL opt-in остаётся
authority CI.

## 2. R4-B2/B3: одни проверенные bytes = одни исполненные bytes

Generator не мутирует исходный experiment artifact. Он детерминированно
создаёт отдельный mobile-only artifact: вставляет frozen CSP-meta и
challenge/receipt bridge после canonical doctype, затем хэширует и загружает
именно эти bytes.

TMA:

1. получает exact short-lived ticket;
2. делает ровно один artifact fetch;
3. до исполнения проверяет `redirected=false`, exact final URL,
   `text/html`, exact HTTP CSP, `X-Content-SHA256`, размер и SHA-256;
4. декодирует те же захваченные bytes и назначает их `iframe.srcdoc`;
5. после каждого load выдаёт новый UUID challenge;
6. выставляет `configured` только после receipt от exact `event.source` и
   exact nonce.

В результате engine reload снова получает challenge и остаётся допустимым,
а 403, redirect, missing CSP и навигация на другой документ не могут создать
configured-evidence. Решение в каждом fault-case не отправляется.

Browser-срез также доказывает:

- один backend artifact request;
- A → B → A возвращает исходный mutationId;
- полное закрытие страницы и новая страница в том же WebView/storage
  context, не только `reload`;
- symlink/relative attack corpus остаётся закрытым.

`npm run lint` в `feed-prototype` завершился успешно.

## 3. R4-B4: restart, terminal publish и stale-close

- Idle `publication_prepare` получает process-stable attempt UUID. Новый
  generator process создаёт новый UUID, поэтому terminal backend bundle не
  реплеится как current после рестарта.
- Любая publish-ошибка становится terminal и видимой. Известный отказ
  сохраняет исходный typed code; неоднозначный transport/5xx превращается в
  `catalog_publish_outcome_unknown`. Authorization инвалидируется.
- Scheduler запоминает exact
  `draftId + revision + bindingHash + attemptId` и никогда не повторяет
  failed attempt автоматически. Новый явный attempt снова разрешён.
- Ошибка `closeStaleCurrent` добавляется в bounded `standaloneIssues`, но не
  обрывает tick и не блокирует применение независимого решения.

Фокус generator: `38/38`.

## 4. R4-B5: renderer не расходует transport и потеря видима

- Любая render-ошибка имеет bounded FSM: synthetic `send_started`,
  `outcome_unknown(render_error)` до лимита, затем terminal
  `render_invalid` или `config_missing`.
- Ни один render/config attempt не вызывает HTTP и не считается Telegram
  transport send в iteration cap либо breaker window.
- Terminal failed delivery больше не блокирует повторную постановку того же
  production action после исправления renderer/config.
- Store watcher включает неподтверждённые terminal render-loss в backlog
  evidence и убирает их только после `confirmed` с тем же `event_ref`.
- Breaker channel принимает ограниченный production-алфавит:
  `[a-z][a-z0-9_-]{0,31}`; `prod2` и `ops-a` покрыты.

Полный `swipe-agents`: `70 files / 445 tests passed`.

## 5. Проверки и environment-dispositions

- `swipe-backend`: полный локальный suite зелёный; PostgreSQL acceptance
  **success** на exact head `6a526ac`
  ([run 30489681059](https://github.com/Glera/swipe-backend/actions/runs/30489681059)).
- `feed-prototype`: полный `npm run lint` зелёный.
- `swipe-generator`: R5-фокус зелёный. Обычный workspace suite честно
  отказал на трёх cross-repo fence-тестах и frozen derivation identity,
  потому что соседний `swipe-ugc` checkout находится на `83357fb`, а
  release authority требует `70f50d4`. Это ожидаемый fail-closed, не
  регрессия. Для полной приёмки создан изолированный sibling worktree с
  `swipe-ugc@70f50d4`; официальный dual-checkout CI (`swipe-ugc@b8be78d`
  для текущих factory closures + `swipe-ugc-worker@70f50d4` для frozen
  derivation/worker) завершился **success** на exact head `c8cc533`
  ([run 30489680083](https://github.com/Glera/swipe-generator/actions/runs/30489680083)).
- `swipe-agents`: CI **success** на exact head `c69f5a8`
  ([run 30489679651](https://github.com/Glera/swipe-agents/actions/runs/30489679651)).
- `feed-prototype`: локальный полный lint зелёный; exact-head CI завершился
  **success** на `fd7c6b1`
  ([run 30489679988](https://github.com/Glera/feed-prototype/actions/runs/30489679988)).
- Изолированный локальный generator-прогон в той же dual-UGC топологии:
  `644 passed / 2 skipped / 0 failed`.
- Root `docs-boundary-lint`: clean. Общий root test имеет 7 существующих
  environment-failures: системный `git init` не поддерживает
  `--initial-branch`; mobile-review файлы в них не участвуют.

## 6. Вопросы повторному ревью

1. Можно ли загрузить artifact, который проходит doctype, но не несёт exact
   frozen bridge непосредственно после него?
2. Есть ли путь, где TMA исполняет bytes из второго fetch или выдаёт
   configured без fresh receipt exact iframe?
3. Отличается ли допустимый engine reload от навигации документа без bridge?
4. Может ли restart вернуть терминальную `publication_prepare` карточку как
   current либо scheduler повторить ambiguous publish?
5. Может ли stale close остановить ingestion другого committed phone verdict?
6. Может ли render failure потратить breaker/transport budget, навсегда
   заблокировать повторный production ping или исчезнуть из watcher evidence?
7. Доказывают ли PostgreSQL-тесты реальные миграции, а не модель саму с собой?

Условие merge/deploy не менялось: независимый GO по этому пакету и буквальные
зелёные CI соответствующих R5 head.
