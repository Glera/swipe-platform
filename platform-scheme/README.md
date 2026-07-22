# platform-scheme — хай-левел схема платформы

Интерактивная схема контуров swipe-платформы (визуализация VISION v2):
продакшен → шлюз вкуса → каталог → лента, рост, learning loop, мета, агенты.

- `template.html` — исходник страницы (правится руками).
- `build.mjs` — сборка: вшивает актуальный `../VISION.md` (модалка «Читать
  VISION») с провенансом `git-коммит + sha256 байт`. Копия VISION в схеме
  никогда не правится руками — только пересборкой.
- `dist/platform-scheme.html` — собранный артефакт (не коммитится).

```bash
node platform-scheme/build.mjs
open platform-scheme/dist/platform-scheme.html
```

Публикация: Claude публикует dist как приватный Artifact (постоянный URL,
шарится из его share-меню). После любой правки `VISION.md` — пересобрать и
переопубликовать.
