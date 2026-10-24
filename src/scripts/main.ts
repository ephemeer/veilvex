import { initReveal } from './reveal';
import { initNav } from './nav';
import { initHero } from './hero';
import { initCounters } from './counters';
import { initSpotlight } from './spotlight';
import { initProcess } from './process';
import { initGeo } from './geo';
import { initCases } from './cases';
import { initPricing } from './pricing';
import { initFaq } from './faq';
import { initContact } from './contact';
import { initLangLinks } from './lang-links';
import { initCommandBar } from './command-bar';

const boot = () => {
  initReveal();
  initNav();
  initHero();
  initCounters();
  initSpotlight();
  initProcess();
  initGeo();
  initCases();
  initPricing();
  initFaq();
  initContact();
  initLangLinks();
  initCommandBar();
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

// `html.is-loaded` turns on CSS scroll-behavior: smooth (global.css) — only after the initial scroll to a
// /#section URL has happened, so that one lands instantly instead of gliding through the whole page.
const loaded = () => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
if (document.readyState === 'complete') loaded();
else window.addEventListener('load', loaded, { once: true });
