# Veilvex — сайт агентства (Astro, static, Netlify)

## Стек
- Astro 7 (static output, Node ≥ 22.23.4), TypeScript strict, без UI-фреймворков. Стили — обычный CSS с токенами в `src/styles/global.css`.
- Анимации — CSS transitions/animations, WAAPI и IntersectionObserver (`src/scripts/`). Библиотек анимаций нет.
- Контент на 4 языках: `src/i18n/{ru,en,az,de}.ts` — все файлы должны соответствовать `src/i18n/types.ts` (TypeScript проверяет полноту).
- Форма заявки → `netlify/functions/contact.mts` (POST `/api/contact`). Секреты только в переменных окружения (см. `.env.example`).
- Заголовки безопасности (CSP, HSTS и т. д.) — в `netlify.toml`. Инлайн-стили запрещены политикой CSP (`style=""`, `<style>` в разметке). Единственный инлайн-скрипт — `classList.add("js")` в `Base.astro`, его sha256-хеш прописан в CSP; любой новый инлайн-скрипт сломает `npm run check:csp`.

## Команды
- `npm run dev` — сайт (+ `npm run api:dev` в соседнем терминале для формы)
- `npm run verify` — `astro check` + тесты + сборка
- `npm run serve:secure` — раздача `dist/` с теми же заголовками, что и на Netlify (для проверки CSP локально)
- `npm run e2e` — скриншоты и проверка консоли (нужен Chromium: `npx playwright install chromium`)

## Скиллы проекта (`.claude/skills/`)
- `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`, `emil-design-eng` — скиллы Эмиля Ковальски (MIT, https://github.com/emilkowalski/skills). Любая новая анимация должна проходить `review-animations`.
- `vibe-security-audit` — аудит на 20 типовых дыр «навайбкоженных» приложений (4 этапа). Запускать перед релизом и после любого изменения бэкенда.

## Правила анимаций (кратко, подробнее в скиллах)
- Вход/выход — только ease-out (`--ease-out: cubic-bezier(.23,1,.32,1)`), никогда ease-in.
- UI-анимации до 300 мс: нажатие 100–160 мс, меню 150–250 мс, модалки 200–500 мс. Маркетинговые reveal-анимации могут быть дольше.
- Ничего не появляется из `scale(0)` — старт с `scale(.95–.97)` + `opacity: 0`.
- Кнопки сжимаются на `:active` до `scale(.97)`.
- Только `transform`/`opacity` (+ `clip-path`); никакого `transition: all`.
- Hover-движение только под `@media (hover: hover) and (pointer: fine)`; всегда есть ветка `prefers-reduced-motion`.
- То, что пользователь видит 100 раз в день, не анимируется.

## Безопасность (кратко)
- Никаких секретов в репозитории; `.env*` в `.gitignore`.
- Серверная валидация (zod), лимит частоты запросов, honeypot, проверка Origin, общие тексты ошибок наружу.
- Пользовательский текст никогда не вставляется как HTML (ни на странице, ни в сообщениях в Telegram/почту).
