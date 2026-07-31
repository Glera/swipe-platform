# Stage 0 P5 — private platform-scheme Artifact

Дата: 31.07.2026.  
Source tree at build: `b7fba126dc1208db74e2e320ec3bb42c0319fd95`.  
Source review: `play-for-good-stage0-platform-scheme-review-r5.md` — EARLY GO.  
VISION provenance: commit `96df90a`, SHA-256
`e54ee50f2959faba03a2d6fa970033ae0474cc053869d5c178ea52ce6fb63da9`.  
Built HTML SHA-256:
`9645c1fb6b32ace7d5464e4800d8af9ef9fe21400e7e94be340db96ad3ba5dc5`.

Private Artifact URL (требует authenticated Claude account):
https://claude.ai/chat/6ed81cbd-a95d-48b3-8062-f49c09504bd7

## Проверки

- `node platform-scheme/build.mjs` собрал self-contained
  `platform-scheme.html` и вшил exact VISION provenance.
- Локальный browser smoke подтвердил header, все diagram-блоки, переключение
  `Вижен / Сегодня / Authority`, модалку `Читать VISION` и provenance footer.
- Claude Artifact создан из self-contained HTML и открыт в Preview; wide
  preview визуально подтвердил тот же заголовок, контуры, labels, colors,
  режимы и provenance footer.
- Artifact остаётся приватным внутри чата. Диалог `Publish artifact` явно
  предупреждает, что `Publish & copy link` сделает его доступным всем и
  потенциально индексируемым; эта публичная операция **не выполнялась**.

Это permanent authenticated URL, а не публичный share URL. Перепубликация
нужна после любого изменения VISION или source template.
