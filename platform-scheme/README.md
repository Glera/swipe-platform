# platform-scheme — хай-левел схема платформы

Интерактивная схема контуров Play for Good (визуализация VISION v3.0.1):
продакшен → шлюз вкуса → каталог → лента → миссионный слой, а также рост,
learning loop, экономика доверия и агенты.

- `template.html` — исходник страницы (правится руками).
- `build.mjs` — сборка: вшивает актуальный `../VISION.md` (модалка «Читать
  VISION») с провенансом `git-коммит + sha256 байт`. Копия VISION в схеме
  никогда не правится руками — только пересборкой.
- `dist/platform-scheme.html` — собранный артефакт (не коммитится).

```bash
node platform-scheme/build.mjs
open platform-scheme/dist/platform-scheme.html
```

Публикация: Claude создаёт dist как Artifact в приватном чате; authority URL —
постоянная authenticated chat-ссылка. Не использовать `Publish artifact`, если
его диалог предупреждает, что ссылка станет публичной и индексируемой: это уже
другая, не разрешённая Stage 0 поверхность. После любой правки `VISION.md` —
пересобрать и заново создать приватный Artifact.
