# Veilvex — сайт агентства (Astro, static, Netlify)

## Стек
- Astro 7 (static output, Node ≥ 22.23.4), TypeScript strict, без UI-фреймворков. Стили — обычный CSS с токенами в `src/styles/global.css`.
- Анимации — CSS transitions/animations, WAAPI и IntersectionObserver (`src/scripts/`). Библиотек анимаций нет.
- Контент на 4 языках: `src/i18n/{ru,en,az,de}.ts` — все файлы должны соответствовать `src/i18n/types.ts` (TypeScript проверяет полноту).
- Форма заявки → `netlify/functions/contact.mts` (POST `/api/contact`). Секреты только в переменных окружения (см. `.env.example`).
- Заголовки безопасности (CSP, HSTS и т. д.) — в `netlify.toml`. Инлайн-стили запрещены политикой CSP (`style=""`, `<style>` в разметке). Единственный инлайн-скрипт — `classList.add("js", mac|pc)` в `Base.astro` (класс `js` включает entrance-анимации, `mac`/`pc` выбирает подпись ⌘K / Ctrl K до первой отрисовки), его sha256-хеш прописан в CSP; любое изменение этого скрипта или новый инлайн-скрипт сломает `npm run check:csp` — пересчитывайте хеш (`printf '%s' '<текст скрипта>' | openssl dgst -sha256 -binary | base64`).
- Шрифты: сабсеты Inter для первой отрисовки (latin + cyrillic для RU, latin-ext для AZ) предзагружаются в `<head>` (`?url`-импорты в `Base.astro`), а `--font` содержит метрически совместимый `Inter Fallback` (`global.css`, три весовых диапазона с `size-adjust`), чтобы смена шрифта не меняла переносы. Заголовок hero ограничен в `em`, не в `ch`. `scroll-behavior: smooth` включается классом `html.is-loaded` после `load` (иначе браузер анимирует переход к `/#section` с верха страницы). Исключение — data-блок `<script type="application/ld+json">` (JSON-LD): он не исполняется, CSP на него не действует; `check:csp` проверяет только, что это валидный JSON без `</script`.
- SEO/GEO: JSON-LD собирается в `src/lib/jsonld.ts` из контента `t` (локализованно, стабильные `@id`). `public/llms.txt`, `public/llms-full.txt` и `public/robots.txt` генерируются из `src/i18n/*.ts` скриптами `scripts/gen-llms.mjs` и `scripts/gen-robots.mjs` на `prebuild` — руками не править. Базовый URL — `SITE_URL` (`scripts/lib/site-url.mjs`). Обложка `public/og.png` — `npm run gen:og` (`scripts/og/`, нужен Playwright; в сборку не входит).

## Команды
- `npm run dev` — сайт (+ `npm run api:dev` в соседнем терминале для формы)
- `npm run verify` — `astro check` + тесты + сборка (с `prebuild`: llms.txt/robots.txt) + `check:csp`
- `npm run gen:og` — перерендерить обложку OG после смены слогана (`hero.eyebrow` RU/EN)
- `npm run serve:secure` — раздача `dist/` с теми же заголовками, что и на Netlify (для проверки CSP локально)
- `npm run e2e` — скриншоты и проверка консоли (нужен Chromium: `npx playwright install chromium`)
- `npm run test:e2e` — браузерные e2e-тесты `tests/e2e/*.test.mjs` (Node `--test` + Playwright из `PLAYWRIGHT_MODULE` или локального пакета; требует `npm run build`; в `verify` не входит — на Netlify нет Chromium)
- `npm run qa:flicker` — детектор мерцаний/скачков (`scripts/qa-flicker.mjs` + `scripts/lib/flicker-analyze.py`, нужны Playwright и `python3` с Pillow/numpy): кадры при загрузке на медленной сети, во всех переходах состояний и при скролле → `qa/flicker/report.md`. Опционально, в `verify` не входит; после правок анимаций/шрифтов/`<head>` — прогнать. На Linux с системным Inter: `npm run qa:flicker -- --realistic-fonts`.

## Скиллы проекта (`.claude/skills/`)
- `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`, `emil-design-eng` — скиллы Эмиля Ковальски (MIT, https://github.com/emilkowalski/skills). Любая новая анимация должна проходить `review-animations`.
- `vibe-security-audit` — аудит на 20 типовых дыр «навайбкоженных» приложений (4 этапа). Запускать перед релизом и после любого изменения бэкенда.

## Правила анимаций (кратко, подробнее в скиллах)
- Вход/выход — только ease-out (`--ease-out: cubic-bezier(.22,1,.36,1)`, для длинных маркетинговых входов `--ease-out-long: cubic-bezier(.16,1,.3,1)`), никогда ease-in.
- UI-анимации до 300 мс: нажатие 140 мс, меню 150–220 мс, модалки до 250 мс. Маркетинговые reveal-анимации 500–700 мс, без блюра.
- Ничего не появляется из `scale(0)` — старт с `scale(.95–.97)` + `opacity: 0`.
- Кнопки и любые нажимаемые элементы сжимаются на `:active` до `scale(.98)` за 140 мс.
- Только `transform`/`opacity` (+ `clip-path`); никакого `transition: all`.
- Hover-движение только под `@media (hover: hover) and (pointer: fine)`; всегда есть ветка `prefers-reduced-motion`.
- То, что пользователь видит 100 раз в день, не анимируется.
- Единственная «тяжёлая» витринная анимация — поле точек в hero (`src/scripts/field.ts`, canvas за заголовком): курсор толкает и подсвечивает точки, при загрузке от строки с акцентом расходится волна, тап/клик по hero пускает свою. Цикл rAF работает только пока что-то движется, вне экрана и в скрытой вкладке стоит, под `prefers-reduced-motion` точки статичны. Не добавлять второй такой элемент — контраст с тихим остальным сайтом и есть эффект.

## Безопасность (кратко)
- Никаких секретов в репозитории; `.env*` в `.gitignore`.
- Серверная валидация (zod), лимит частоты запросов, honeypot, проверка Origin, общие тексты ошибок наружу.
- Пользовательский текст никогда не вставляется как HTML (ни на странице, ни в сообщениях в Telegram/почту).
