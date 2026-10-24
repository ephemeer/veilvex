<!-- Независимый аудит по 20 пунктам (скилл vibe-security-audit), 2026-10-24. Пункты этапа 2 применены — см. SECURITY.md, раздел «Изменения после независимого аудита». -->

## Аудит безопасности — Veilvex — 2026-10-24

Режим: только чтение. Проверено: конфиги, `netlify/functions/*`, `scripts/*`, `src/*`, `public/*`, `dist/`; `npx vitest run` — 57/57 проходят; `npm audit` — 0 уязвимостей (412 пакетов); `node scripts/check-csp.mjs` — OK; ручные запросы к :4322 (503 `not_configured` на валидный payload) и :4323 (502, 502, затем 429 + `Retry-After: 600`). Код проекта соответствует описанию в `SECURITY.md` — расхождений между документом и кодом не нашёл.

| # | Пункт | Статус | Где | Опасность | Комментарий |
|---|-------|--------|-----|-----------|-------------|
| 1 | Секреты в гите | нет (история не проверена) | `.gitignore:5-12`, рабочее дерево | — | Репозиторий **не инициализирован** (`.git` нет) — историю проверить нельзя. В дереве только `.env.example` с пустыми значениями; grep по `sk-`/`AKIA`/`ghp_`/`xox`/`-----BEGIN`/`password=`/токенам Telegram — пусто; `.env`, `.env.*`, `.netlify/`, `dist/` игнорируются. |
| 2 | Ключи во фронтенде | нет | `src/config.ts:16-30`, `dist/` | — | В конфиге только публичные контакты (пустые). В `dist/` один бандл, без sourcemap, без локальных путей и токенов. |
| 3 | RLS / чужие строки | не применимо | — | — | Базы нет; Netlify Blobs хранит только хеши IP для rate limit. |
| 4 | Права только на фронте | не применимо | `contact-core.ts:590-686` | — | Авторизации нет; единственный серверный экшен сам валидирует всё, фронтовая валидация — только UX. |
| 5 | Rate limit | нет | `contact.mts:128`, `contact-core.ts:334-360` | — | Два уровня: платформенный 20/60 с и скользящее окно 5/600 с на SHA-256(IP) в Blobs (`strong`). Подтверждено: 3-й запрос → 429; подмена `X-Forwarded-For` не обходит (`context.ip` первым, `:289-297`). Fail-open при отказе хранилища (`:342-345`) — осознанно и залогировано. |
| 6 | SQL-склейка | не применимо | — | — | Запросов к БД нет. |
| 7 | Валидация на сервере | нет | `contact-core.ts:143-157, 597-633` | — | `z.strictObject`, строгий `application/json` (415 проверено), лимит 16 КБ по `Content-Length` и по факту (413 на 300 КБ проверено), fatal UTF-8, срез управляющих/bidi-символов. Наружу — только имена полей. |
| 8 | Сырой HTML | нет | `Geo.astro:52`, `Mock.astro:84`, `SectionHead.astro:14-15`, `About.astro:12` | — | Все 5 `set:html` получают **статичные** строки i18n через `hl()`/`rich()`, которые сначала экранируют (`src/i18n/index.ts:40-61`); в контенте нет `<`/`>`. Клиент пишет только `textContent` (`contact.ts:29,66,103`), ответ API не вставляется в DOM. Telegram без `parse_mode` (`:502`), Resend только `text` (`:518`). |
| 9 | Пароли | не применимо | — | — | — |
| 10 | Токены в localStorage | не применимо | `src/scripts/*` | — | `localStorage`/`sessionStorage`/`cookie` не используются вообще. |
| 11 | Админка без авторизации | нет | `src/pages/*`, `robots.txt` | — | Только index/[lang]/privacy/404; `/admin`, `/api/debug`, `/.env`, `/netlify.toml` → 404; dev-серверы слушают 127.0.0.1 (`dev-api.mjs:12`). |
| 12 | CORS `*` | нет | `contact-core.ts:572-576, 224-234` | — | CORS-заголовков нет (тест `:695-712`, OPTIONS → 405 без ACAO). Чужой `Origin`, `Origin: null`, `Sec-Fetch-Site: cross-site` → 403 (проверено). |
| 13 | Подтверждение email | не применимо | — | — | Регистрации нет. |
| 14 | Предсказуемые ID / IDOR | не применимо | — | — | Объектов с ID нет. |
| 15 | Mass assignment | нет | `contact-core.ts:143` | — | `strictObject`: лишнее поле → 400 (тест `:283`, проверено вживую). |
| 16 | Вебхуки без подписи | не применимо | — | — | Входящих вебхуков нет, только исходящие вызовы. |
| 17 | Стектрейсы наружу | нет | `contact-core.ts:692-701, 546-565`, `function-host.mjs:107-118` | — | Catch-all → `{error:"server"}`; в лог — с вырезанными секретами (`redact`), без текста заявки, IP только как 8 символов хеша. |
| 18 | Зависимости | нет | `package.json:23-35`, `package-lock.json` | — | Версии закреплены точно, lockfile v3, `npm audit` чистый, внешних CDN-скриптов нет (шрифт self-hosted). Мелочь: лишний `@img/sharp-wasm32` (extraneous), README пишет «Astro 6» при 7.4.2. |
| 19 | Надёжность пароля | не применимо | — | — | — |
| 20 | Загрузка файлов | не применимо | — | — | Загрузок нет; тело только JSON ≤ 16 КБ. |

**Не удалось проверить:** историю git (репозитория нет); применяет ли Netlify `config.rateLimit` на вашем тарифе и заголовки из `netlify.toml` к ответам функции (локально `serve-secure` их добавляет — в проде это надо подтвердить `curl -I`); реальные Telegram/Resend (токен фейковый); HTTPS/HSTS на стороне Netlify; e2e в реальном браузере (Playwright/Chromium здесь нет).

### Дополнительно

- **Заголовки** (`netlify.toml:20-32`, подтверждены на `/`, `/404`, `/api/contact`): HSTS 2 года + `includeSubDomains; preload`, `nosniff`, `X-Frame-Options: DENY` + `frame-ancestors 'none'`, `Referrer-Policy`, `Permissions-Policy`, COOP, CORP, `Cache-Control: no-store` для `/api/*`. Полный набор.
- **CSP** (`netlify.toml:23`): `default-src 'self'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, без `unsafe-inline`/`unsafe-eval`. Хеш `sha256-qOhFsq0Q…` **совпадает** с единственным инлайн-скриптом `Base.astro:34` (`classList.add("js")`) — пересчитал вручную; `check-csp.mjs` страхует при каждом `verify`. Замечания: (а) `img-src 'self' data:` — `data:`-картинок в `dist/` нет, директиву можно ужать; (б) нет `report-to`/`report-uri` — нарушения в проде невидимы; (в) `CLAUDE.md` запрещает `is:inline`, а он есть (защищён хешем) — расхождение правила и кода, не уязвимость.
- **HTTPS/HSTS**: `upgrade-insecure-requests` + HSTS есть; `preload` имеет смысл только после отправки в hstspreload.org (см. этап 4).
- **Honeypot/антиспам**: поле `website` (`Contact.astro:77-81`: за экраном, `tabindex=-1`, `autocomplete=off`) + метка `t`; сервер молча отвечает 200 без доставки (`contact-core.ts:395-402, 653-658`; проверено на :4323). Ограничение по сути: `t` задаёт клиент, целевой бот обходит эвристику за секунды — страховка только rate limit, капчи нет (осознанно).
- **SSRF**: нет — исходящие URL константы (`contact-core.ts:42-43, 498, 514`), пользовательские данные в URL не попадают; в путь Telegram подставляется только `TELEGRAM_BOT_TOKEN` из env.
- **Открытые редиректы**: нет — серверных редиректов нет, в клиенте нет записей в `location`; `?service=` используется только для чекбокса через `CSS.escape` (`contact.ts:19,25`); внешние ссылки с `rel="noopener noreferrer"`.

## ЭТАП 2 — ПЛАН

Уязвимостей уровня «критично»/«средне» не найдено. Всё ниже — мелочь. Жду «го».

**Реальные замечания (мелочь)**

1. `contact-core.ts:188-193` — при отсутствии и `CONTEXT`, и `NODE_ENV` функция считает себя dev и принимает `localhost`-origin'ы. На Netlify неактуально (CONTEXT задан всегда), но безопаснее дефолт «прод»: `return env.NODE_ENV === 'development'`, а в `scripts/dev-api.mjs` и `scripts/serve-secure.mjs` выставлять `process.env.CONTEXT ??= 'dev'`; поправить тест `tests/contact.test.ts:378-379`.
2. `netlify.toml:23` — `img-src 'self' data:` → `img-src 'self'` (data: не используется).
3. `CLAUDE.md` («никаких `is:inline`») vs `Base.astro:34` — переформулировать правило: «инлайн-скрипт только этот, под хешем в CSP»; README: Astro 6 → 7; `npm prune` (лишний `@img/sharp-wasm32`).

**Усиление (по желанию)**

4. Fail-closed по `Origin`: в `checkOrigin` (`contact-core.ts:228-232`) отклонять POST **без** `Origin` (браузеры всегда шлют его на POST). Минус: curl без заголовка получит 403; обновить тесты `:353-359` и `:791-808`.
5. IPv6: перед `hashIp` (`:608`) нормализовать адрес до /64 в `clientIp` (`:289-297`), иначе лимит обходится ротацией адресов внутри одного префикса.
6. Проверять форму env в `configuredChannels` (`:528-530`): `TELEGRAM_BOT_TOKEN` ~ `/^\d+:[\w-]{30,}$/`, `TELEGRAM_CHAT_ID` ~ `/^-?\d+$/`; иначе — 503 как misconfig (защита от кривого значения, не от атаки).
7. CSP-отчёты: добавить `report-to` к политике (нужен приёмник — пункт этапа 4).
8. Тесты: отдельный unit на `redact()` и на то, что `clientIp` игнорирует `X-Forwarded-For` при наличии `context.ip`.

## ЭТАП 4 — ЧТО НЕЛЬЗЯ ПОЧИНИТЬ КОДОМ

1. **Инициализация git**: перед первым коммитом убедиться, что `.env` и `dist/` не попали в индекс (`git status`); желательно pre-commit сканер секретов (gitleaks).
2. **Переменные в панели Netlify** (Site configuration → Environment variables). `TELEGRAM_*`/`RESEND_*` ограничить контекстом *production*: deploy preview'ы иначе выполняют функцию с боевым токеном, а их origin разрешён (`contact-core.ts:207`). Для публичного репозитория отключить превью чужих PR.
3. **2FA**: Netlify, GitHub, регистратор/DNS, Telegram-аккаунт владельца бота, Resend.
4. **После деплоя проверить**: `curl -I https://<site>/api/contact` — какие заголовки реально отдаёт функция; активен ли `config.rateLimit` (зависит от тарифа); HSTS. В hstspreload.org подавать только когда все поддомены на HTTPS.
5. **Ротация секретов**: BotFather `/revoke`, Resend → API Keys; после смены — передеплой (env читается при первом вызове, `contact.mts:109-120`).
6. **Мониторинг логов функции**: `rate_limited`, `bot_dropped`, `delivery_failed`, `contact_not_configured`, и особенно `rate_limit_store {backend:"memory"}` в проде — значит Blobs недоступен и лимит стал per-instance.
7. **Blobs без TTL**: периодически чистить стор `contact-rate-limit` по `metadata.expiresAt` (`contact.mts:75`).
8. **Зависимости**: Dependabot/Renovate + `npm run audit` в CI; lockfile держать в репозитории.
9. **Персональные данные**: хеш IP — псевдонимизация (`SECURITY.md:180`); Telegram и Resend — обработчики. Отразить в политике конфиденциальности и сроках хранения.
10. **Перед релизом** прогнать `npm run e2e` с Chromium — подтвердить ноль CSP-нарушений в настоящем браузере.
