# Независимый delta-review deploy-среза B, редакция 2

- Дата: 05.08.2026.
- Ревьюер: Codex / R1-A.
- Target: meta `abc3f8f344f3381a5c280c708517dcdf1eb0e272`,
  `platform-reliability-variant-b-deploy-slice-v2-2026-08-05.md`.
- Режим: read-only delta-проход по исправлениям редакции 2. Dispatch, Render,
  migration и merge не выполнялись.
- Вердикт: **NO-GO**.

Прежние четыре P1 действительно закрыты по форме: маршрут теперь содержит три
dispatch, входы перечислены полностью, code ref пинится перед обеими cutover
фазами, а сапёр вынесен из deploy acceptance. Ниже — новые находки в самих
исправлениях.

## [P1] Межфазная CAS не защищает подготовленную конфигурацию сервиса

**Срез:** строки 99–100.

Между `prepare-source` и `deploy` повторяются только latest deploy ID и backend
master. Render service configuration может измениться без смены latest deploy
ID. Координатор на exact backend `0e9e940`:

- `scripts/platform-release-coordinator.py:423-439` читает Blueprint/service и
  latest deploy;
- `:440-482` в `prepare-source` PATCH-ит candidate image, registry credential,
  health path и preDeploy command;
- `:483-484` в `deploy` повторно доказывает только `runtime == image`;
- `:486-528` не сверяет exact `imagePath`, registry credential, health path и
  preDeploy command перед env staging и deploy POST.

Сценарий отказа: после успешной фазы 2 ручная/параллельная конфигурационная
мутация удаляет `preDeployCommand`, не создавая deploy. Обе заявленные CAS
проходят, фаза 3 запускает candidate image без обязательной migration guard.

**Требуется:** непосредственно перед dispatch фазы 3 снять read-only exact
service/Blueprint projection и потребовать одновременно:

- тот же service и Blueprint ID, `blueprint.autoSync=false`;
- `runtime=image`, exact candidate `imagePath@digest`;
- exact owner и registry credential;
- `autoDeploy=no`, `healthCheckPath=/api/health`;
- `preDeployCommand="python -m app.platform_release predeploy-env"`;
- latest live deploy равен исходному CAS.

Либо те же проверки должны стать fail-closed кодом coordinator. Проверка
только deploy ID недостаточна.

## [P1] STOP-ветки предполагают исход мутации и не классифицируют ambiguous state

**Срез:** строки 131–153; фаза 4 — строки 110–118; terminal cleanup — строки
120–129.

Фраза «фаза 2 упала после PATCH — сервис уже image-backed» не следует из
наблюдаемой ошибки. HTTP timeout/ошибка может означать: PATCH не применён,
применён полностью либо применён частично, а локальная verification упала.
Аналогично ошибка фазы 3 может означать: deploy не создан; создан и ещё идёт;
failed; стал live, но verification job/receipt path упал. В последнем случае
БД и runtime уже могли измениться.

Кроме того, нет отдельной STOP-ветки для провала acceptance фазы 4 и для
провала любого обязательного шага cleanup. Это важно, потому что
`.github/workflows/platform-release-cutover.yml:182-192` выгружает receipt
только при success.

**Требуется:** таблица переходов по фактически прочитанному состоянию, а не по
предполагаемой точке ошибки:

1. prepare-source failure → read-only GET и классификация `unchanged source` /
   `exact prepared image` / `partial-or-other`; никаких retry до классификации;
2. deploy failure → capture latest/current deploy IDs и statuses, service
   config, имена `PLATFORM_*`, DB revision/release receipt при безопасной
   доступности; отдельно `no deploy`, `in progress`, `failed`,
   `live-but-verification-failed`; пока async outcome не терминален, retry
   запрещён;
3. phase 4 failure → STOP, manual state receipt, пакет сапёра не начинается;
4. cleanup failure → terminal NO-GO, незакрытый credential/state называется
   буквально, успешное завершение не объявляется.

## [P1] Доказательство отзыва ключа не исполнимо без заранее удержанной копии

**Срез:** строки 120–129, особенно 5.2–5.4.

После помещения `RENDER_API_KEY` в GitHub environment оператор не может
прочитать secret обратно как plaintext. Если после UI revoke удалить/потерять
единственную локальную копию, шаг 5.3 физически нечем выполнить. Создание нового
ключа проверит новый ключ, а не отозванный.

**Требуется как preflight до фазы 1:** тот же exact key остаётся в одном
non-emitting memory/secure holder до конца cleanup; до манёвра exact
`GET https://api.render.com/v1/users` с ним даёт `200`; после UI revoke тот же
GET с теми же bytes обязан дать `401`; только после этого удаляются GitHub
secret и локальный holder. «Любой API-вызов» заменить на этот точный endpoint,
потому что иные статусы не доказывают invalid credential.

Render документирует `GET /v1/users` как authenticated probe с ответами 200 и
401: <https://api-docs.render.com/reference/get-user>. GitHub secret доступен
workflow только через явную injection, а не как операторский readback:
<https://docs.github.com/en/actions/concepts/security/secrets>.

## [P2] Restart и redeploy ошибочно сведены в одно поведение

**Срез:** строки 92–95.

После `prepare-source` живой source-built deploy действительно остаётся live,
а стандартный новый deploy использует текущую image-backed конфигурацию. Но
Render `Restart service` — особый deploy, который использует exact commit и
configuration текущего live instance. Обычный restart поэтому не обязан
подтянуть candidate image.

Фразу нужно разделить: «обычный restart сохраняет live source-built
configuration; стандартный deploy/redeploy после PATCH использует текущую
image-backed configuration». Это не ослабляет STOP-правила, а делает описание
промежуточного состояния буквальным. Authority:
<https://render.com/docs/deploys#restarting-a-service>.

## Закрытие review

Новый двойной GO возможен после закрытия трёх P1 и исправления P2. Повторный
проход может быть delta-only по изменённым STOP/CAS/cleanup формулировкам.
