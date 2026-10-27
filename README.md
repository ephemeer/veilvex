# Veilvex — сайт агентства

Одностраничный сайт AI-маркетингового агентства **Veilvex**: GEO-продвижение в нейросетях, SEO, таргет и Google Ads, сайты, приложения и автоматизация бизнеса. Тёмная тема, минимализм в духе Linear, салатовый акцент, анимации по правилам Эмиля Ковальски. 4 языка: английский по умолчанию на `/`, русский на `/ru/`, азербайджанский на `/az/`, немецкий на `/de/` (старые ссылки `/en/…` переадресуются на `/…` правилом в `netlify.toml`).

## Стек

| Слой | Что используется |
|------|------------------|
| Сайт | [Astro 7](https://astro.build) (статическая сборка), TypeScript strict, чистый CSS, без UI-фреймворков |
| Шрифт | Inter Variable, self-hosted (`@fontsource-variable/inter`) — внешних запросов нет; нужные сабсеты (latin + cyrillic/latin-ext по языку) предзагружаются в `<head>`, на время загрузки работает метрически совместимый fallback `Inter Fallback` (Arial/Helvetica с `size-adjust`), так что смена шрифта не двигает вёрстку |
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
| `npm run test:e2e` | Браузерные e2e-тесты (`tests/e2e/`, `node --test`): ⌘K-палитра, арена кейсов, шторка кейса, переход «услуга → форма», SEO/GEO-файлы и JSON-LD, a11y. Нужны собранный `dist/` и Playwright с Chromium (`PLAYWRIGHT_MODULE=<путь к playwright>` или локальная установка); в `verify` не входит |
| `npm run qa:flicker` | Детектор мерцаний и скачков вёрстки (опционально, в `verify` не входит). Пишет кадры компоновщика (CDP screencast, ~50 fps) при загрузке на Slow 4G + 4× CPU, во всех переходах состояний (меню, язык, ⌘K, фильтры кейсов, арена кейсов — колесо и мелкие шаги по 53px, шторка кейса, FAQ, форма, переход к форме, смена языка) и при скролле; у арены ожидаемые области — только кольцо и отражение, а тексты заголовка и пагинации не должны пустеть ни в одном кадре; кадры сравнивает PIL (`python3` + Pillow + numpy): вспышки «было → исчезло → вернулось», FOUT, CLS, скачки sticky/nav, двойные появления. Отчёт — `qa/flicker/report.md` + кадры-доказательства. Нужны `dist/` и Playwright (`PLAYWRIGHT_MODULE`); на Linux с системным Inter добавьте `-- --realistic-fonts`. Флаги: `--pages`, `--scenarios load,transitions,scroll,nojs,reduced`, `--only <id>` (один сценарий переходов), `--viewports`, `--cpu`, `--net`, `--base` |
| `npm run gen:llms`, `npm run gen:robots` | Генерируют `public/llms.txt`, `public/llms-full.txt` и `public/robots.txt` из контента `src/i18n/*.ts` и `SITE_URL`; запускаются автоматически перед сборкой (`prebuild`) |
| `npm run gen:og` | Рендерит обложку `public/og.png` (1200×630) из `scripts/og/og.html` через Playwright — вручную, после смены слогана; в сборку не входит |
| `npm run audit` | `npm audit` по зависимостям |

## Структура

```
src/
  i18n/            types.ts (модель контента) + ru.ts / en.ts / az.ts / de.ts
  components/      секции лендинга (Hero, Mock, Services, Process, Geo, …); Cases — кейсы: сетка карточек, с JS и motion — арена (кольцо карточек на CSS 3D, scripts/arena.ts); CaseSheet — шторка кейса (role=dialog, открывается с карточки и по #case-N, все кейсы в HTML)
  layouts/         Base.astro — <head>, навигация, футер, hreflang, JSON-LD
  lib/             jsonld.ts — локализованный JSON-LD (Organization, WebSite, Service, FAQPage); legal.ts — дата редакции и пути юридических страниц
  pages/           index (EN, язык по умолчанию), [lang]/index (ru, az, de), privacy и terms (+ [lang]/…), 404
  scripts/         клиентские модули (reveal, nav, hero, field — поле точек в hero, geo-chat, cases, arena — арена кейсов, case-sheet, faq, contact, …)
  styles/          global.css — токены дизайн-системы
  config.ts        публичные контакты (WhatsApp, Telegram, телефон, email)
netlify/functions/ contact.mts — приём заявок
public/            llms.txt, llms-full.txt, robots.txt (генерируются), og.png, favicon
scripts/           dev-api, serve-secure, e2e, check-csp, gen-llms, gen-robots, og/ (обложка), lib/site-url
tests/             vitest
.claude/skills/    скиллы Эмиля Ковальски (анимации) + vibe-security-audit (20 дыр)
```

## Контент и языки

Весь текст лежит в `src/i18n/<lang>.ts`. Файлы типизированы (`Content`), поэтому пропущенное поле в любом языке ломает `npm run check`. Выделение словa салатовым — `{{слово}}`, принудительный перенос в заголовке — `\n`.

Контакты (кнопки WhatsApp/Telegram/телефон/почта) включаются в `src/config.ts` — пустое поле скрывает кнопку.

## Юридические страницы

Политика конфиденциальности (`/privacy/`) и условия сотрудничества (`/terms/`) на всех языках — один компонент `src/components/LegalPage.astro`, текст в `privacy` / `terms` файлов `src/i18n/<lang>.ts` (разделы со стабильными `id`, абзацы, списки, таблицы, блок контактов из `src/config.ts`; `[[privacy|текст]]` / `[[terms|текст]]` — ссылка на другой документ). Дата редакции одна на все языки — `LEGAL_UPDATED` в `src/lib/legal.ts`: меняйте её вместе с текстом. Политика описывает ровно то, что делает код (`netlify/functions/lib/contact-core.ts`, `netlify.toml`, отсутствие cookies и хранилищ браузера) — при изменении формы, каналов доставки, хостинга или подключении аналитики сначала обновите политику. Проверка — `tests/e2e/legal.test.mjs`.

### Юридические данные (заполнить владельцу)

Страницы написаны так, чтобы быть корректными и без этих данных («сторона, указанная в договоре», «реквизиты по запросу»), но закон в ряде стран ждёт их прямо на сайте:

- [ ] **Юридическое наименование** оператора / исполнителя (компания или ИП) и **форма** (ООО, MMC, GmbH, ИП…).
- [ ] **Регистрационный номер** (ОГРН/ИНН, VÖEN, Handelsregister и т. п.) и, если есть, **VAT ID / USt-IdNr.**
- [ ] **Юридический адрес** (почтовый адрес, по которому принимаются претензии и запросы субъектов данных).
- [ ] **Контактный email** для запросов о данных — сейчас `email` в `src/config.ts` пуст, на страницах показаны только WhatsApp и Telegram; для запросов по GDPR письменный канал (почта) крайне желателен.
- [ ] **DPO** (специалист по защите данных), если назначен; если компания вне ЕС, но работает с клиентами из ЕС — оценить необходимость **представителя в ЕС** (ст. 27 GDPR).
- [ ] **Применимое право и суд** по умолчанию (страна регистрации исполнителя) — сверить с типовым договором.
- [ ] **Германия:** при коммерческой работе на немецкий рынок нужен **Impressum** (§ 5 DDG) — отдельная страница с наименованием, адресом, представителем, контактами (email обязателен), регистром и USt-IdNr. Также проверить обязанность сообщать об участии в Verbraucherschlichtung (§ 36 VSBG) — актуально при работе с потребителями и > 10 сотрудниках.
- [ ] **Россия (152-ФЗ), если ориентируетесь на граждан РФ:** уведомление Роскомнадзора об обработке ПДн, локализация первичного сбора в БД на территории РФ (ст. 18 ч. 5 — заявки сейчас уходят в Netlify / Telegram / Resend за рубежом), с 01.09.2025 согласие оформляется отдельно от других документов — при необходимости вынести текст согласия на отдельную страницу.
- [ ] **Азербайджан:** проверить требования Закона «О персональных данных» к форме согласия и к регистрации информационных систем с ПДн.
- [ ] **Договоры с обработчиками:** принять DPA Netlify и Resend (в их панелях), убедиться в действующей сертификации по EU–U.S. Data Privacy Framework или SCC; уточнить почтового провайдера ящика `CONTACT_TO_EMAIL` (политика упоминает его без имени).
- [ ] **Сроки хранения, обещанные политикой:** удалять заявки без договора из Telegram-чата и почты через 12 месяцев после последнего контакта (например, раз в квартал); регулярно чистить хранилище Netlify Blobs `contact-rate-limit` — функция пишет туда хеш IP с временем отправок и сама записи не удаляет (метаданные `expiresAt` есть, автоудаления нет); уточнить срок хранения журналов функций на вашем тарифе Netlify.
- [ ] **Условия по умолчанию** в `terms` (срок действия предложения 30 дней, проверка этапа 5 рабочих дней, два круга правок, гарантия 30 дней, NDA 3 года, отказ от договора за 14 дней, лимит ответственности — оплаченная сумма / 3 месяца) — сверить с типовым договором.
- [ ] Перед публикацией показать обе страницы юристу в стране регистрации: тексты — добросовестный шаблон по коду сайта, не юридическая консультация.

## SEO и GEO (поисковики и нейросети)

- **JSON-LD** — `src/lib/jsonld.ts` собирает граф schema.org из контента страницы: Organization, WebSite, WebPage на всех индексируемых страницах; на главных дополнительно 9 Service (в OfferCatalog), 12 кейсов как ItemList из CreativeWork (`@id` = deep link `#case-N`) и FAQPage. Сериализация экранирует `<`, `>`, `&`, поэтому блок безопасен внутри `<script type="application/ld+json">` (CSP на data-блоки не распространяется).
- **llms.txt / llms-full.txt** (https://llmstxt.org) и **robots.txt** генерируются из `src/i18n/*.ts` перед каждой сборкой — не редактируйте их руками, правьте контент. Базовый URL всех ссылок — `SITE_URL` (`scripts/lib/site-url.mjs`, общий с `astro.config.mjs`).
- robots.txt разрешает весь сайт, кроме `/api/`, и явно приветствует поисковые и AI-краулеры (GPTBot, ClaudeBot, PerplexityBot, Google-Extended и др.).
- **og.png** — обложка 1200×630 для соцсетей и мессенджеров: `npm run gen:og` (шаблон `scripts/og/og.html`, слоганы берутся из `hero.eyebrow` RU/EN).

## Выпуск: Netlify и домен

1. **Подключить репозиторий.** Netlify → Add new site → Import an existing project → GitHub → `ephemeer/veilvex`, ветка `main`. Команда сборки, папка публикации и версия Node берутся из `netlify.toml`, в интерфейсе ничего вводить не нужно. Первый деплой даст адрес вида `https://<имя>.netlify.app`.
2. **Переменные окружения** (Site configuration → Environment variables): для заявок в Telegram — `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`; для заявок на почту — `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` (можно оба канала). `SITE_URL` задавать не нужно: сборка и функция формы берут адрес сайта из переменной Netlify `URL`. Необязательно: `CONTACT_RATE_LIMIT`, `CONTACT_RATE_WINDOW`, `CONTACT_GLOBAL_RATE_LIMIT`.
3. **Домен.** Domain management → Add a domain. Либо делегируйте домен на Netlify DNS (у регистратора указать nameservers, которые покажет Netlify), либо добавьте у регистратора записи из подсказки Netlify (A/ALIAS для корня, CNAME для `www`). Сделайте домен **primary**: Netlify сам выпустит сертификат (HTTPS) и будет редиректить `*.netlify.app` и `www` на него; HSTS уже включён в `netlify.toml`.
4. **После смены домена — Deploys → Trigger deploy.** Канонические ссылки, hreflang, sitemap, robots.txt, llms.txt и JSON-LD «запекаются» при сборке с адресом из `URL`, поэтому нужна одна пересборка.
5. **Контакты.** `src/config.ts`: `phone`, `email`, `instagram` — пустые поля просто не показываются; заполните и закоммитьте, Netlify пересоберёт сайт сам.
6. **Проверка после выпуска:** открыть `https://домен/robots.txt`, `/sitemap-index.xml` и `/llms.txt` (внутри должен быть ваш домен); отправить тестовую заявку с сайта и получить её в Telegram/на почту; проверить заголовки на securityheaders.com (ожидается A+); Google Search Console → добавить домен и отправить `sitemap-index.xml`; при желании — заявка на hstspreload.org.
7. **Аккаунты.** 2FA в Netlify, GitHub и у регистратора домена. Токен бота и ключ Resend живут только в переменных Netlify, в репозитории их нет.

Подробнее о защите — `SECURITY.md`.

## Лицензии

Код проекта — MIT. Скиллы в `.claude/skills/` (кроме `vibe-security-audit`) — © Emil Kowalski, MIT (`.claude/skills/EMIL-KOWALSKI-SKILLS-LICENSE`). Шрифт Inter — SIL OFL 1.1.
