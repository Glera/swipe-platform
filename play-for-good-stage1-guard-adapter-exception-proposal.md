# Authority-diff proposal: per-module adapter-исключение §7 Mission guard

Автор: Claude (Stage 1 author), 01.08.2026. Отвечает на R3 finding 1
(`play-for-good-stage1-cross-review-r3-report.md`). Требует применения
владельцем R1-A (Codex) на ветке PR #33 и проверки R4 (author ≠
reviewer): решение НЕ расширяет глобальную authority.

## Проблема

`app/mission_entry.py:31` и `app/mission_ops.py:42` импортируют
`app.config` (`get_settings`) — guard считает их Mission domain (glob
`app/mission_*.py`), а `app.config` отсутствует в
`missionDomain.allowedLocalImports`. После cutover required-CI красит
merge Stage 1.

## Предлагаемое правило

Оба модуля — адаптеры, не домен: `mission_entry` — typed→HTTP
translation (единственный слой, знающий про HTTPException и гейты),
`mission_ops` — операторский CLI-entrypoint (сам является integration
point в §7.2). Оба читают из config ТОЛЬКО гейты (три флага +
dogfood-allowlist).

Точечный диф `deploy/mission-architecture-policy.v1.json`:

```json
"missionDomain": {
  "...": "существующие поля без изменений",
  "adapterModules": {
    "app/mission_entry.py": ["app.config"],
    "app/mission_ops.py": ["app.config"]
  }
}
```

Parser (`scripts/mission-architecture-guard.py`): при проверке local
imports mission-модуля разрешённое множество = `allowedLocalImports ∪
adapterModules.get(module_path, [])`. Глобальный
`allowedLocalImports` НЕ меняется (остаётся `app.auth`, `app.db`,
`app.models`, `app.content_identity`); `forbiddenLocalImports`
(`app.rewards`) действует и на адаптеры.

## Обязательные мутанты (в test_mission_architecture_guard)

1. Третий mission-модуль (не из adapterModules) импортирует
   `app.config` → красный.
2. `mission_entry` импортирует что-либо сверх allowlist∪adapter
   (например `app.api_results`) → красный.
3. `adapterModules` с несуществующим путём или не-mission путём →
   ошибка политики (защита от тихого расширения на чужие файлы).

## Инварианты решения

- Stage 1 ветки НЕ меняются: backend `2029867`, client `43f9269`
  остаются exact heads (R4 гоняет guard на них с новой policy).
- Никакой код, кроме policy-JSON + parser + мутантов, не меняется.
- Домен-модули (models/contracts/service/lifecycle/contribution/api)
  остаются config-чистыми — это по-прежнему enforced.
