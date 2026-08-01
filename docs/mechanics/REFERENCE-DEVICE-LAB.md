# Reference Device Lab — Android v3

Статус: runbook для agent-operated capture. Оператор не является default
recorder.

## Authority

- Process: `reference-replication.v3`.
- CLI: [`../../scripts/reference-lab.mjs`](../../scripts/reference-lab.mjs).
- Declarative gesture runner:
  [`../../scripts/reference-gesture-replay.mjs`](../../scripts/reference-gesture-replay.mjs).
- Artifact root задаётся явно; capture bytes не коммитятся в git.

## Preflight

Перед первым device action выполняется:

```text
node scripts/reference-lab.mjs doctor --artifact-root <absolute-path>
```

`doctor` fail-closed проверяет Node host, `adb`, `ffmpeg`, `ffprobe`, доступное
устройство, animation scales, display/refresh и writable storage. Battery,
battery saver и доступное thermal state входят в receipt и предупреждения.

Нельзя начинать capture после красного doctor. Doctor не меняет device
settings автоматически.

## Command surface v3.0

```text
doctor
scenario init
scenario attach
scenario verify
```

Команды прежнего Lab 0–1 (`info`, `launch`, `screenshot`, `tap`, `swipe`,
`record`, `export`) должны восстанавливаться поверх v3 scenario receipts; до их
появления capture выполняется только явно задокументированным безопасным
fallback и не объявляется Lab v3-complete.

## Scenario pair contract

`scenario init` создаёт immutable-planned scenario receipt с двумя channels:
`clean` и `instrumented`. `scenario verify` принимает только уже созданные
media/state receipts и ничего не записывает на устройство.

Scenario не закрывается, пока:

- обе записи существуют и проходят content hash/media probe;
- совпадают app/build, scenario/level и normalized state fingerprint;
- perceptual start-frame distance не превышает declared threshold;
- clean channel не содержит instrumentation;
- instrumented channel содержит declared input ground truth;
- fragment gaps перечислены.

Если native pair получить нельзя, это explicit gap/disposition, а не
автоматический pass.

## Device baseline

Receipt фиксирует:

- manufacturer/model/Android/API;
- resolution, density, orientation, refresh rate;
- `animator_duration_scale`, `transition_animation_scale`,
  `window_animation_scale` — ожидается `1`;
- Show taps и Pointer location отдельно для каждого channel;
- battery level/charging, battery saver и thermal status, если доступны;
- app package/version/build;
- wall clock и monotonic anchor.

## Timing

- Измерения используют media frame PTS, не nominal FPS.
- Допуск не уже frame interval и source uncertainty.
- Нельзя измерять continuous interval через fragment boundary.
- Android `screenrecord` bounded; recorder обязан закончить fragment до hard
  deadline. Авто-ротация не должна создавать недекларированный gap.
- Device gestures задаются как versioned trace с абсолютными offsets и
  исполняются одинаково для clean/instrumented channel. Receipt сохраняет как
  planned offset, так и фактические invoke/complete timestamps для каждого
  события.
- Одинаковый trace связывает state/action, но не media clock. Event onset и
  source-frame bracket измеряются независимо в clean и instrumented channel;
  перенос PTS/offset между каналами запрещён и fail-closed проверяется перед
  semantic raw comparison.
- `adb shell input touchscreen motionevent` не считается real-time transport:
  длительность каждого subprocess и schedule drift входят в uncertainty. Если
  drift меняет смысл probe, такой прогон отклоняется либо переводится в
  event-bracket evidence; запланированные offsets не выдаются за ground truth.

## Initial-state binding

Exact screenshot SHA-256 идентифицирует artifact, но не связывает clean и
instrumented runs. Pair binding использует:

```text
app/build + scenario/level
+ normalized logical/state fingerprint
+ counters/object classes
+ cropped perceptual hash + threshold
```

Метод crop/classification и threshold объявляются до capture.

## Safety

- Install/login/captcha требуют оператора, когда автоматизация не имеет
  authority.
- Purchase и real-money actions запрещены без отдельного явного разрешения.
- Реклама не открывается ради capture.
- Game-currency action допускается только в утверждённом scope и отражается в
  receipt.
- Device disconnect выполняется после подтверждённого export/verification.

Секреты, credentials и платежные данные не записываются.
