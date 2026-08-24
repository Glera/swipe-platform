# Реестр источников Market Researcher (живой)

Дополняется без разморозки charter'а (charter v1.1 ссылается сюда).
Каждая строка — две линзы: **R** (research: сигнал для радара) и
**D** (distribution: канал для наших игр позже). Платные источники
требуют source-policy манифест до первого запроса.

## Активные (Tier-B, платные)

| Источник | Линза | Что даёт | Статус |
|---|---|---|---|
| Sensor Tower (Performance, Advertising, Game IQ, Playliner) | R | загрузки/revenue/рост; креативы и SOV; жанровая таксономия | токен в Keychain Mac A; policy: source-policies/sensortower.md |

## Публичные веб-порталы (Tier-A; R = чарты/полки/рейтинги без аккаунта)

| Источник | Линза | Заметки |
|---|---|---|
| Poki (poki.com) | R+D | чарты; D: exclusive, ads-only, real-player playtesting (dev-аккаунт — когда повезём своё) |
| CrazyGames | R+D | чарты+новинки; D: ads и IAP через SDK |
| itch.io | R+D | popularity/trending; D: self-publishing |
| NewGrounds / Y8 / Silvergames / Miniplay / Addicting Games / iogames.space / WebGamer / Now.gg / Gamejolt | R | вторичные чарты — подтверждение живучести жанра |
| Каталоги порталов: github.com/devcem/HTML5-Game-Platforms; GameMonetize partners | R | пополнение этого реестра |

## Социальные платформы (в основном D, R — где видны рейтинги)

| Источник | Линза | Заметки |
|---|---|---|
| Telegram HTML5 Games | D | мы Telegram-native — ближайший кандидат дистрибуции |
| Discord Activities | R+D | D: IAP/подписки; R: полка активностей |
| Facebook Instant Games | R+D | FRVR-кейс как референс масштаба |
| WeChat Mini Games / Line Games | R | региональные тренды (CN/JP/TH/TW) |
| YouTube Playables | R | полка+plays-счётчики через leash-Android (charter Tier-C) |
| Alexa Games / Playco | — | наблюдение, низкий приоритет |

## Креативные тренды (Tier-A)

TikTok Creative Center (Top Ads, покадровое внимание) · Meta Ad Library.

## Ожидают решения

AppMagic и список сервисов маркетинга (пауза до их ответа) · Sensor Tower
MCP (принятие условий админом организации).
