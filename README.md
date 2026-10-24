# Veilvex — сайт агентства

Одностраничный сайт AI-маркетингового агентства **Veilvex**: GEO-продвижение в нейросетях, SEO, таргет и Google Ads, сайты, приложения и автоматизация бизнеса. Тёмная тема, минимализм в духе Linear, салатовый акцент, анимации по правилам Эмиля Ковальски. 4 языка (RU / EN / AZ / DE).

## Стек

| Слой | Что используется |
|------|------------------|
| Сайт | [Astro 7](https://astro.build) (статическая сборка), TypeScript strict, чистый CSS, без UI-фреймворков |
| Шрифт | Inter Variable, self-hosted (`@fontsource-variable/inter`) — внешних запросов нет |
| Анимации | CSS transitions/animations, Web Animations API, IntersectionObserver — без библиотек |
| Форма заявки | Netlify Function `netlify/functions/contact.mts` → Telegram и/или email (Resend) |
| Хостинг | Netlify (`netlify.toml` — сборка, функция, заголовки безопасности) |
| Тесты | Vitest (функция формы), Playwright-скрипт e2e (скриншоты, консоль, CSP) |

## Быстрый старт

Требуется Node.js **≥ 22.23.4** (требование Astro 7) и npm ≥ 10.

```bash
npm install
npm run dev          # сайт на http://localhost:4321
npm run api:dev      # (во втором терминале) локальный сервер функции формы на :8788
```

Для формы скопируйте `.env.example` → `.env` и заполните один из каналов доставки (Telegram или Resend). Файл `.env` в `.gitignore` и никогда не коммитится.

## Команды

| Команда | Что делает |
|---------|-----------|
| `npm run build` | Собирает сайт в `dist/` |
| `npm run check` | Проверка типов Astro/TS (включая полноту переводов) |
| `npm run test` | Юнит-тесты функции формы (валидация, лимиты, honeypot, доставка) |
| `npm run verify` | `check` + `test` + `build` |
| `npm run serve:secure` | Раздаёт `dist/` с теми же заголовками, что на Netlify (+ форма на `/api/contact`) |
| `npm run e2e` | Скриншоты всех страниц, проверка консоли и нарушений CSP (нужен Chromium: `npx playwright install chromium`) |
| `npm run audit` | `npm audit` по зависимостям |

## Структура

```
src/
  i18n/            types.ts (модель контента) + ru.ts / en.ts / az.ts / de.ts
  components/      секции лендинга (Hero, Mock, Services, Process, Geo, …)
  layouts/         Base.astro — <head>, навигация, футер, hreflang
  pages/           index (RU), [lang]/index, privacy, 404
  scripts/         клиентские модули (reveal, nav, hero, geo-chat, cases, faq, contact, …)
  styles/          global.css — токены дизайн-системы
  config.ts        публичные контакты (WhatsApp, Telegram, телефон, email)
netlify/functions/ contact.mts — приём заявок
scripts/           dev-api, serve-secure, e2e
tests/             vitest
.claude/skills/    скиллы Эмиля Ковальски (анимации) + vibe-security-audit (20 дыр)
```

## Контент и языки

Весь текст лежит в `src/i18n/<lang>.ts`. Файлы типизированы (`Content`), поэтому пропущенное поле в любом языке ломает `npm run check`. Выделение словa салатовым — `{{слово}}`, принудительный перенос в заголовке — `\n`.

Контакты (кнопки WhatsApp/Telegram/телефон/почта) включаются в `src/config.ts` — пустое поле скрывает кнопку.

## Деплой на Netlify

1. Залейте репозиторий на GitHub и подключите в Netlify («Add new site → Import»). Команда сборки и папка публикации берутся из `netlify.toml`.
2. В **Site configuration → Environment variables** добавьте переменные из `.env.example` (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` и/или `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`; `SITE_URL` — адрес сайта).
3. Привяжите домен и включите HTTPS (Netlify делает это автоматически; заголовок HSTS уже включён).
4. Включите 2FA в аккаунте Netlify и у регистратора домена.

Подробнее о защите — `SECURITY.md`.

## Лицензии

Код проекта — MIT. Скиллы в `.claude/skills/` (кроме `vibe-security-audit`) — © Emil Kowalski, MIT (`.claude/skills/EMIL-KOWALSKI-SKILLS-LICENSE`). Шрифт Inter — SIL OFL 1.1.
