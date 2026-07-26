# Island P5 — closed UGC delivery device-spike

Дата: 25–26.07.2026. Статус: **COMPLETE — device-GO, implementation,
production migration и public-origin cutoff выполнены**.

Спайк доказал транспорт в Telegram WebView до архитектурного коммита, как
требует `swipe-backend/docs/specs/island-social-core.md` §5.3. После device-GO
тот же документ стал evidence-пакетом реализации и production rollout.

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

Исполняемый probe уже merged в `swipe-ugc@768f478` (PR #2):

- `scripts/run-island-p5-origin-interactive.sh` — интерактивно читает endpoint,
  bucket и scoped credentials без shell history и не сохраняет их;
- `scripts/probe-island-p5-origin.mjs` — строит single-file artifact, делает
  idempotent HEAD/PUT, signed HEAD/GET/Range/expiry и browser iframe probe;
- `docs/island-p5-r2-cors.json` — точная R2 CORS policy;
- evidence schema `island.p5.origin-probe.v1` намеренно не содержит endpoint,
  bucket, URL/query или credentials.

После локальной настройки private bucket:

```bash
bash scripts/run-island-p5-origin-interactive.sh
```

CI exact-head `1aaed31` зелёный; локально зелёные 104 Node-теста и реальный
Chromium preview. Это доказывает harness, но не заменяет прогон против выбранного
object storage и Telegram device-матрицу.

### 4.1 Provider-real evidence — PASS

25.07.2026 создан отдельный private Cloudflare R2 Standard bucket в auto-region
WEUR:

- public development URL выключен, custom domain отсутствует;
- CORS после reload подтверждён для production origin, GET/HEAD и Range;
- временный user token был ограничен Object Read & Write только этим bucket и
  TTL 1 week; после прогона удалён, активных token rows — 0;
- credentials не записывались в файлы/репозиторий и были очищены из процесса.

Финальный redacted evidence:

```json
{
  "schema": "island.p5.origin-probe.v1",
  "artifact": {
    "key": "spike/5b60e7b9da01e181ef5a84680c68aae573ae0a3af0e1357a19008be899659503.html",
    "digest": "sha256:5b60e7b9da01e181ef5a84680c68aae573ae0a3af0e1357a19008be899659503",
    "bytes": 140700
  },
  "uploaded": false,
  "ttlSeconds": 600,
  "checks": {
    "immutableHead": "pass",
    "corsPreflight": "pass",
    "signedHead": "pass",
    "signedGet": "pass",
    "range": "pass",
    "expiry": "pass",
    "urlRedaction": "pass"
  },
  "browser": {
    "iframeReady": "pass",
    "autoplayWin": "pass",
    "pageErrors": 0,
    "eventTypes": [
      "swipe-ready",
      "static_ready",
      "boot_timings",
      "interactive_ready",
      "ready",
      "completed"
    ]
  }
}
```

`uploaded=false` — доказательство идемпотентного повторного прогона: object был
загружен первым stop-line запуском и совпал по identity при финальном PASS.

Provider-real прогон нашёл две особенности, закрытые в `swipe-ugc@c03693b`
(PR #3):

1. R2 presigned HEAD отдаёт 200/type/cache/ETag/CORS, но не
   `Content-Length`. Exact length не ослаблен: его подтверждает authenticated
   S3 HeadObject, затем signed GET проверяется byte-for-byte по sha256, а Range
   — по total length. Если provider всё же присылает длину и она неверна, probe
   fail-closed.
2. Загрузка production SPA только ради parent origin создавала отложенные 401 и
   загрязняла iframe error-count. Harness теперь устанавливает тот же exact
   origin через inert text/plain miss, не запуская приложение; browser errors
   остаются URL-redacted и относятся только к тестируемому iframe.

После этих исправлений полный `npm run verify`: 128 tests
(106 pass / 22 standalone skips), base verification и реальный Chromium
autoplay WIN.

Для передачи ссылки на реальные устройства добавлен отдельный безопасный
handoff в `swipe-ugc@ed3a2a7` (PR #4):

- `scripts/prepare-island-p5-device-link.mjs` повторно проверяет immutable
  `HeadObject` (key/digest/length/type/metadata) до подписи;
- короткоживущий bearer передаётся только напрямую в системный clipboard и не
  возвращается из library API;
- stdout содержит только redacted evidence
  `island.p5.device-link.v1`, без endpoint, bucket, URL/query и credentials;
- несовпадение object identity останавливает операцию до signing/clipboard.

Exact-head CI зелёный: 131 tests (109 pass / 22 standalone skips), включая
реальный browser/runtime verify.

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

Оператор получает один 10-минутный URL только через clipboard, вставляет его в
собственные Telegram Saved Messages и открывает на трёх устройствах. Временный
bucket-scoped token остаётся активным только на окно device-теста и удаляется
сразу после expiry/takedown-проверок.

## 6. GO / NO-GO

**GO:** вся автоматическая матрица зелёная и три Telegram-клиента проходят
fresh/resume/expiry; takedown совпадает с задокументированным TTL residual.

**NO-GO:** хотя бы один WebView не загружает single-file iframe, теряет runtime
при resume, не может re-resolve после expiry, нарушает parent-message contract,
или URL оказывается в telemetry/logs.

Автоматическая часть GO выполнена. Полный device-GO и разрешение на P5
implementation наступают только после трёх реальных Telegram-клиентов:
private publish, resolver с exact
building/takedown/block authority, state `rel + contentDigest`, миграция всех
`u/*`, production smoke, затем приватизация старого UGC repo.

## 7. Замороженный implementation delta после device-GO

Аудит текущего production-кода (`swipe-backend@01d3bf2`) фиксирует конкретную
границу следующего PR:

1. Поднять island state schema с v4: добавить обязательный для hosted UGC
   `contentDigest=sha256:<64 hex>`; signed URL никогда не хранить в JSONB.
   Legacy `url` читать только на миграции и перестать принимать в новых PUT.
2. Добавить digest/object identity в `island_bake_jobs`; publish становится
   single-file private upload и завершает job только после проверочного HEAD.
3. Добавить authenticated resolver `GET /island/artifact-url`, который
   серверно находит exact current `buildingId + rel + contentDigest`,
   fail-closed проверяет publishing, двусторонний block и последнее
   takedown/restore по монотонному `seq`, затем возвращает короткий signed GET.
4. `GET /island/public/{owner_id}` возвращает identity, но не bearer URL.
   Start/complete/like/claim продолжают повторно проверять block/takedown;
   resolver не заменяет их authority.
5. Миграционный инструмент перепаковывает существующие multi-file `u/*` в
   content-addressed single-file HTML, загружает private object, сверяет digest
   и только затем CAS-обновляет island state. Повторный запуск идемпотентен;
   несовпадение bytes/digest останавливает миграцию.
6. После production smoke запретить публичную выдачу старых объектов. Rollback
   до окончания окна — возврат read-path на старый origin; private копии и
   state receipts не удаляются.

Этот delta не разрешалось реализовывать до device-GO: иначе архитектура
оказалась бы зафиксированной до проверки реальных Telegram WebView, против
исходного гейта P5. Гейт пройден 26.07.2026 до implementation-merge.

## 8. Device evidence — PASS

26.07.2026 оператор провёл реальную матрицу на iOS, Android и macOS:

| Проверка | iOS | Android | macOS |
|---|---|---|---|
| Fresh load / WIN | PASS | PASS | PASS |
| Resume после background 2–3 мин | PASS | PASS | PASS |
| Старый URL после expiry заблокирован | PASS | PASS | PASS |
| Fresh re-resolve на ту же identity | PASS | PASS | PASS |
| Открытая сессия после revoke продолжает работать | PASS | PASS | PASS |
| Новый load после revoke заблокирован | PASS | PASS | PASS |

macOS-проверка выполнена из нативного Telegram 12.9
(`ru.keepcoder.Telegram`). Этот клиент не предлагает произвольному HTTPS URL
команду «Open in Telegram Browser» и делегирует такую ссылку системному
браузеру. Это принято для direct-link transport spike: Mini App и game tabs
имеют встроенную поверхность, но произвольная presigned ссылка из Saved
Messages идёт другим путём. iOS и Android прошли мобильный Telegram flow.

Временный bucket-scoped R2 token после матрицы удалён; открытые документы
остались работоспособны, а новые GET были заблокированы на всех трёх
платформах. Это напрямую подтверждает замороженную v1-семантику:
revocation/takedown закрывает новую выдачу и новые загрузки, но не пытается
ретроактивно уничтожить уже загруженные в память байты.

Итог: все условия GO выполнены. Раздел 7 разблокирован для реализации.

## 9. Production rollout — PASS

После device-GO закрытая доставка реализована и включена в следующем порядке:

1. `swipe-ugc` PR #5, merge `563f9f4`: single-file content-addressed artifact,
   idempotent private S3/R2 publish + immutable HEAD и migration worker.
2. `swipe-backend` PR #17, merge `dd120a5`: migration `0057`, state schema v5,
   authenticated resolver и default-off storage contour. PR #18, merge
   `89138b8`, включил `ENABLE_ISLAND_CLOSED_DELIVERY=true` после миграции.
3. `feed-prototype` PR #9, merge `c121121`: клиент перестал строить публичные
   UGC URL, получает bearer только через authenticated resolver и начинает
   visit после успешного resolve. Production deploy:
   `swipe-platform@9d2c1ed`; P2-флаги awards/notifications сохранены включёнными.

Production migration:

- dry-run: 7 records / 2 artifacts / 0 writes;
- apply: 7 records scanned, 6 state records changed, 2 artifacts
  uploaded-or-verified;
- exact replay: 0 records changed, 0 uploads — идемпотентность подтверждена;
- после migration все 7 записей имеют schema v5; 2/2 hosted buildings имеют
  валидный `contentDigest`; сохранённых `url` — 0;
- реальный production presigned GET прошёл и совпал с identity digest.

Первый apply остановился до DB-write из-за ошибочно скопированного UI-суффикса
в credentials. После установки exact 32/64-byte значений повторный apply
прошёл; это зафиксировано как fail-closed operational evidence, а не скрыто как
«успешный первый запуск». Credentials живут только в Render secret env.

Cutoff выполнен после backend/client smoke:

- backend `89138b8` live, runtime flag `True`, resolver без auth → 401;
- production bundle содержит resolver path и не содержит
  `swipe-ugc.onrender.com`;
- Render static service `swipe-ugc` suspended, старый object URL → 503;
- GitHub `Glera/swipe-ugc` переведён в private;
- backend после приватизации чисто redeployed и снова показывает
  `bake_runtime.state=ready`, `ugc_commit=563f9f4`;
- private checkout consumers переведены на read-only deploy key; повторные
  CI-прогоны зафиксированы в release handoff.

Остаточный риск v1 не изменился: уже загруженные в память байты нельзя
ретроактивно отозвать. Takedown/block прекращает новый resolve, а выданный URL
живёт не более 600 секунд. Device-матрица в §8 доказала эту семантику на iOS,
Android и macOS.
