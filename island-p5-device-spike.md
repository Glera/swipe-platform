# Island P5 — closed UGC delivery device-spike

Дата: 25.07.2026. Статус: **PREPARED; WAITING FOR STORAGE + REAL DEVICES**.

Это не разрешение на P5 rollout. Цель спайка — доказать транспорт в Telegram
WebView до архитектурного коммита, как требует
`swipe-backend/docs/specs/island-social-core.md` §5.3.

## 1. Рекомендованный провайдер для спайка

**Cloudflare R2, Standard storage.**

Почему:

- S3-compatible API и native presigned GET/HEAD/PUT;
- free tier сейчас включает 10 GB-month, 1 млн Class A и 10 млн Class B
  операций в месяц; интернет-egress из R2 бесплатный;
- текущие Island-артефакты занимают около 2.2 MB, поэтому спайк и начальный
  dogfood укладываются в free tier с большим запасом;
- Infrequent Access здесь хуже: отдельная retrieval fee и минимальные 30 дней
  хранения.

Официальные источники:

- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/r2/api/s3/presigned-urls/
- https://developers.cloudflare.com/r2/buckets/cors/

Оговорка: native R2 presigned URL работает только на S3 API domain, не на
custom domain. Поэтому он проверяет **закрытую object delivery**, но не
Cloudflare edge-cache. Для v1 это приемлемо: сначала корректность и отзыв
доступа, затем отдельное решение о Worker-gateway/cache при доказанной нагрузке.

## 2. Найденный pre-spike инвариант упаковки

Текущий guided artifact — минимум два объекта:

```
u/<owner>/<id>.html
u/<owner>/<id>.payload.js
```

HTML использует относительный `./<id>.payload.js`. Подпись GET на HTML не
авторизует sibling-object: URL вложенного script не наследует query-signature.
Значит, «просто подписать существующий `.html`» гарантированно не работает ещё
до device-теста.

Для спайка и P5 v1 выбирается **single-file content-addressed HTML**:

- variant и payload встроены в один HTML;
- network-deny CSP сохраняется;
- identity — `rel + sha256(content)`, URL не является identity;
- один signed GET достаточно для целой механики;
- cover остаётся отдельным объектом и получает отдельный signed GET только для
  карточки/превью.

Альтернатива — token-in-path Worker gateway, который авторизует prefix и
разрешает relative subresources. Она сложнее и не нужна до измеренной причины.

## 3. Конфигурация bucket для спайка

- bucket private; public development URL выключен;
- object key: `spike/<sha256>.html`;
- `Content-Type: text/html; charset=utf-8`;
- `Cache-Control: private, no-store` на этапе спайка;
- CORS:
  - `AllowedOrigins`: production origin `https://swipe-platform.onrender.com`;
  - `AllowedMethods`: `GET`, `HEAD`;
  - `AllowedHeaders`: `Range`;
  - `ExposeHeaders`: `Content-Length`, `Content-Range`, `Accept-Ranges`,
    `ETag`, `Date`;
  - `MaxAgeSeconds`: 600;
- signed GET TTL: 600 секунд;
- API token: только Object Read & Write для одного spike bucket; никогда не
  коммитится и не передаётся клиенту.

Presigned URL — bearer до expiry. Takedown запрещает выдачу новых URL, но уже
открытый iframe и уже выданный URL могут жить до 600 секунд. Это честный
остаточный риск P5 v1, не маскируемый словом «мгновенный».

## 4. Автоматическая матрица до устройств

Один run обязан сохранить evidence без URL/query/credentials:

| Проверка | PASS |
|---|---|
| PUT idempotent по content-addressed key | повторный upload даёт те же bytes/digest |
| HEAD | 200, exact length/type/etag |
| GET | 200, sha256(download) = identity digest |
| Range | `bytes=0-63` → 206 + exact `Content-Range` |
| CORS | GET/HEAD с production `Origin` возвращают разрешающий origin |
| CSP | network-deny policy присутствует; external request из playable блокируется |
| iframe | ready + canvas + autoplay WIN + parent message contract |
| expiry | новый GET после TTL отклонён; backend resolver выдаёт другой URL на ту же identity |
| redaction | URL query отсутствует в state, telemetry, server logs и evidence |
| takedown | resolver после takedown → typed 404/410; уже открытый iframe описан как TTL residual |

## 5. Реальная device-матрица — действие оператора

Открыть один hidden dogfood deep-link и выполнить на каждом клиенте:

| Клиент | Fresh load | background 2–3 мин → resume | reload после expiry | takedown while open |
|---|---|---|---|---|
| Telegram iOS | play → WIN | игра продолжает/восстанавливается | re-resolve → play | открытая сессия может дожить; новый load закрыт |
| Telegram Android | play → WIN | то же | то же | то же |
| Telegram Desktop | play → WIN | то же | то же | то же |

Дополнительно фиксируются: версия Telegram/OS, время до first canvas, ошибки,
скриншот каждого клиента. Ссылка показывает только PASS/FAIL кнопки и локальный
диагностический текст; signed URL никогда не печатается.

## 6. GO / NO-GO

**GO:** вся автоматическая матрица зелёная и три Telegram-клиента проходят
fresh/resume/expiry; takedown совпадает с задокументированным TTL residual.

**NO-GO:** хотя бы один WebView не загружает single-file iframe, теряет runtime
при resume, не может re-resolve после expiry, нарушает parent-message contract,
или URL оказывается в telemetry/logs.

После GO разрешается P5 implementation: private publish, resolver с exact
building/takedown/block authority, state `rel + contentDigest`, миграция всех
`u/*`, production smoke, затем приватизация старого UGC repo.
