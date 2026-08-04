# Reference Device Lab

- Статус: **process and CLI contract**
- Решение оператора: **30.07.2026**
- Parent process:
  [`REFERENCE-REPLICATION-PROCESS.md`](REFERENCE-REPLICATION-PROCESS.md)

## Зачем

Снять с оператора роль ручного исследователя и recorder. Агент должен сам:

- запускать мобильную игру;
- проходить целевые уровни;
- пробовать ошибки и граничные жесты;
- записывать video, screenshots и input trace;
- собирать воспроизводимый reference packet.

Оператор подключается только для install/auth/purchase/captcha, taste-решений,
haptic calibration и финального device A/B.

## Рекомендуемый baseline

### Устройство

Выделенный физический Android-телефон:

- без личных данных;
- с отдельным research Google account;
- без личной почты, Telegram, фотографий и контактов;
- без payment method по умолчанию;
- с USB debugging;
- с фиксированной orientation/resolution/refresh-rate конфигурацией;
- с возможностью очистить app data и начать progression заново.

Физический Android — основной reference device: он сохраняет настоящие
render/performance/input условия. Emulator полезен для дешёвой навигации и
повторяемых smoke runs, но не является финальным authority для feel,
performance и haptic.

iOS можно добавить позже. Для сторонних App Store builds управление физическим
iPhone и воспроизводимая установка обычно сложнее; Xcode Simulator не заменяет
реальное приложение из App Store.

### Host

Mac, на котором доступны:

- актуальные
  [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools)
  (`adb`);
- встроенный Android `screenrecord` для Lab 0–1;
- `scrcpy` и `ffmpeg`/`ffprobe` позднее для mirror, audio и Lab 2 analysis;
- Node CLI `scripts/reference-lab.mjs`;
- workspace `.artifacts/reference-lab/`.

## CLI runbook

CLI использует только Node built-ins и официальный `adb`. Порядок поиска:

1. `--adb <path>`;
2. `REFERENCE_LAB_ADB`;
3. `.artifacts/reference-lab/tools/platform-tools/adb`;
4. `ANDROID_HOME` / `ANDROID_SDK_ROOT`;
5. `adb` из `PATH`.

Проверка подключения:

```bash
node scripts/reference-lab.mjs doctor
node scripts/reference-lab.mjs info
```

После ручной установки/авторизации игры:

```bash
node scripts/reference-lab.mjs session start \
  --mechanic zen-match \
  --package <foreground-package-id> \
  --target-levels 6-10 \
  --account-cohort fresh-a
```

Команда возвращает `captureId` и `sessionDir`. Следующие команды принимают
любой из них:

```bash
node scripts/reference-lab.mjs launch --session <captureId>
node scripts/reference-lab.mjs stop --session <captureId>
node scripts/reference-lab.mjs screenshot --session <captureId> --label opening
node scripts/reference-lab.mjs tap --session <captureId> --nx 0.5 --ny 0.4
node scripts/reference-lab.mjs swipe --session <captureId> \
  --from-nx 0.5 --from-ny 0.8 \
  --to-nx 0.5 --to-ny 0.2 \
  --duration-ms 700
node scripts/reference-lab.mjs key --session <captureId> --key back
node scripts/reference-lab.mjs record start \
  --session <captureId> --time-limit-seconds 180
node scripts/reference-lab.mjs record status --session <captureId>
node scripts/reference-lab.mjs record stop \
  --session <captureId> --label level-6-success
node scripts/reference-lab.mjs record rotate \
  --session <captureId> \
  --label level-6-part-01 \
  --time-limit-seconds 150
node scripts/reference-lab.mjs export --session <captureId>
```

Pixel coordinates (`--x/--y`, `--from-x/...`) и normalized coordinates
(`0..1`) взаимоисключающие. Normalized coordinates — default для
воспроизводимых probes.

Все команды печатают JSON. `tap`, `swipe` и `record start` fail-closed, если
allowlisted session package не является foreground app. `screenshot` остаётся
read-only и фиксирует наблюдаемый foreground package.

Android `screenrecord` ограничивает один segment `180 s` и не является
authority для audio/haptic. Для длинного уровня рекомендуется segment
`150 s`: `record status` возвращает `deadlineAt`, `remainingSeconds`,
`active` и `finalizable`, а `record rotate` одним вызовом архивирует текущий
segment и запускает следующий. Новый `record start` fail-closed, если
предыдущий segment уже завершился по лимиту, но ещё не был сохранён через
`record stop`/`record rotate`.

Lab 0–1 не обещает background auto-rotation: агент должен вызвать `rotate`
до `deadlineAt`. Непрерывная unattended rotation без зазора относится к
Lab 1.1; до неё `uncut` означает последовательность сегментов без
незафиксированного интервала, что проверяется по timestamps action log.
Audio и frame/input synchronization относятся к Lab 2. Официальное описание
USB authorization и `screenrecord`:
[Android Debug Bridge](https://developer.android.com/tools/adb).

### Session storage

```text
.artifacts/reference-lab/<mechanic>/<captureId>/
  session.json
  actions.jsonl
  captures/*.png
  recordings/*.mp4
  manifest.json
  .device.json       # private, excluded from export
  .recording.json    # transient, excluded from export
```

`actions.jsonl` имеет монотонный `seq` и SHA-256 hash chain. `manifest.json`
содержит app/build/device metadata и SHA-256/bytes каждого экспортируемого
артефакта. Raw adb serial хранится только в `.device.json`, не выводится CLI и
не попадает в manifest.

## Минимальный device-control contract

Агенту нужен небольшой allowlisted интерфейс:

```text
device.doctor
device.info
device.list_apps
device.launch(package)
device.stop(package)
device.clear_app_data(package)        # только explicit scoped target
device.screenshot
device.tap(x, y)
device.swipe(points[], duration_ms)
device.key(back|home)
device.record.start
device.record.stop
device.pull_artifact
device.session.export
```

Каждая mutating команда пишет timestamped log. Координаты сохраняются и в
device pixels, и в normalized portrait coordinates.

Raw `adb shell input` подходит для первого exploration MVP. Для точных
gesture paths и сопоставления input→frame следующий слой должен использовать
instrumented driver/helper, который:

- отправляет multi-point gesture с известными timestamps;
- логирует фактическое dispatch time;
- синхронизирует clock с video frames;
- не требует root и не читает память приложения.

## Что lab не делает

- не root'ит устройство;
- не декомпилирует приложение;
- не обходит DRM, paywall, anti-bot или access control;
- не перехватывает credentials/сетевой трафик;
- не кликает рекламу ради вознаграждения;
- не делает покупку без отдельного разрешения;
- не публикует captured media;
- не хранит reference assets в production bundle.

Если появляется login approval, captcha, purchase или юридически/ToS
неоднозначное действие, session останавливается и просит оператора.

## Session manifest

Каждая исследовательская сессия имеет immutable `capture-id` и manifest:

```json
{
  "schema": "reference-capture.v1",
  "captureId": "<uuid>",
  "capturedAt": "<UTC timestamp>",
  "packageId": "<android package>",
  "appVersionName": "<version>",
  "appVersionCode": "<build>",
  "deviceModel": "<model>",
  "androidVersion": "<version>",
  "displayPx": [0, 0],
  "refreshRateHz": 0,
  "orientation": "portrait",
  "accountCohort": "<opaque local label>",
  "targetLevels": [],
  "files": [
    {
      "path": "<artifact-relative path>",
      "sha256": "<digest>",
      "bytes": 0
    }
  ]
}
```

В Git сохраняется sanitized manifest без account credentials и device serial.
Raw artifacts остаются в `.artifacts/reference-lab/`.

## Autonomous exploration loop

1. `doctor`: устройство online, unlocked, package/version известны.
2. Агент делает screenshot и классифицирует экран.
3. Выполняет один осмысленный action или gesture.
4. Сохраняет action, coordinates, timestamps и post-state screenshot.
5. При неизвестном modal сначала классифицирует его; purchase/auth не
   подтверждает автоматически.
6. Продолжает до terminal state или bounded action/time budget.
7. Отдельно запускает scripted probe matrix.
8. Экспортирует session manifest, video, frames и trace.
9. Строит измерения и Reference Twin packet.

Autoplay-исследователь не обязан сразу играть оптимально. Сначала он должен
понять state/action semantics и научиться воспроизводить observed trace.
Solver/strategy подключается после того, как canonical rules закрыты.

## Capture profiles

### Exploration

- screen stream с низкой задержкой;
- screenshots после значимых переходов;
- полный action log;
- bounded retries;
- достаточен для навигации и discovery.

### Fidelity

- 60 fps минимум, 120 fps при доступности;
- uncut video;
- touch indicator либо собственный logged cursor overlay;
- original audio отдельной дорожкой;
- холодный старт и real-time pacing;
- timestamps input dispatch;
- фиксированные device settings.

### Physical feel

Финальная проверка на реальном устройстве:

- input latency;
- frame pacing;
- gesture friction;
- readability;
- haptic.

Video и ADB не измеряют субъективную силу haptic. Нужна короткая человеческая
разметка либо отдельный физический sensor setup. В первом варианте оператор
один раз отмечает `none/light/medium/strong` и момент события.

## Probe runner

Probe описывается данными, а не свободным рассказом:

```yaml
id: gate-partial-entry
precondition: block aligned with matching gate
actions:
  - gesture: drag
    path: [[0.45, 0.62], [0.45, 0.35], [0.45, 0.21]]
    duration_ms: 900
  - release: true
observe:
  - carried_pose
  - collision_response
  - capture_threshold
  - final_anchor_or_exit
```

Runner сохраняет video range и before/after frames на каждый probe. Результат
получает `observed`, `not-observed`, `ambiguous` или `blocked`.

## Recovery и воспроизводимость

- App build/session, а не «текущая версия», является taste authority.
- Если уровень зависит от A/B cohort, manifest фиксирует opaque cohort label и
  captured session становится authority.
- Перед destructive `clear_app_data` подтверждается exact package ID; операция
  не применяется к другим приложениям.
- Сессия может продолжаться после reconnect по manifest/checkpoint.
- Все artifacts content-hashed.
- Любое ручное действие оператора помечается в trace.

## Инкрементальная реализация

### Lab 0 — usable exploration

- dedicated Android;
- `adb` doctor/info/screenshot/tap/swipe;
- screen recording;
- timestamped JSONL action log;
- session export с hashes.

Этого достаточно, чтобы агент самостоятельно открыть игру, пройти ранние
уровни и собрать большую часть reference packet.

### Lab 1 — evidence session

- coordinate normalization;
- app/build/device manifest;
- JSONL action log с hash chain;
- screenshots и bounded screen-record segments;
- sanitized export с content hashes;
- allowlisted foreground guard.

### Lab 1.1 — declarative probes

- declarative probe files;
- automatic before/after frames;
- unattended screen-record rotation с overlap/gap receipt;
- bounded recovery from обычных ads/modals;
- capture report;
- `back/home` только через явный allowlisted policy.

### Lab 2 — fidelity measurements

- input/video clock synchronization;
- multi-point gestures;
- frame/phase extraction;
- side-by-side renderer;
- timing assertions и reference delta generation.

### Lab 3 — optional extensions

- iOS device bridge;
- physical haptic sensor;
- device farm;
- OCR/model-assisted screen state classifier.

Lab 0–1 нужно сделать до новой ручной записи Zen Match или Block Out. Lab 2
можно развивать на их реальных probe cases; это полезнее абстрактной
автоматизации без живого класса.

## Acceptance Lab 0–1

- агент без помощи оператора запускает allowlisted package;
- проходит минимум один ранний уровень;
- записывает полный input trace и video segments без незаявленного gap;
- export содержит app/build/device identity и hashes;
- повторный probe попадает в те же normalized target regions;
- session не раскрывает credentials/device serial;
- input не уходит в launcher, Settings, login или purchase surface;
- запрещённые действия требуют явного human step;
- никакие captured media/assets не попадают в production repos.
