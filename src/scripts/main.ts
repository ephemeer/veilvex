import { initReveal } from './reveal';
import { initNav } from './nav';
import { initHero } from './hero';
import { initCounters } from './counters';
import { initSpotlight } from './spotlight';
import { initProcess } from './process';
import { initGeo } from './geo';
import { initCases } from './cases';
import { initCaseSheet } from './case-sheet';
import { initPricing } from './pricing';
import { initFaq } from './faq';
import { initContact } from './contact';
import { initLangLinks } from './lang-links';
import { initCommandBar } from './command-bar';
import { initAmbient } from './ambient';
import { initDraw } from './draw';
import { initFeed } from './feed';
import { initAccent } from './accent';
import { initField } from './field';

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
  initCaseSheet(); // after initContact (its handoff) and initCases (expands the phone grid for a deep link)
  // colour & life layer: ambient loops, stroke draw-ins, the live feed, the headline accent
  initAmbient();
  initDraw(); // after initReveal: its observer must fire first so the reveal stagger (--d) is set
  initFeed();
  initAccent();
  initField(); // after initHero: it waits for the hero's .is-ready to send the load wave
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();

// `html.is-loaded` turns on CSS scroll-behavior: smooth (global.css) — only after the initial scroll to a
// /#section URL has happened, so that one lands instantly instead of gliding through the whole page.
const loaded = () => requestAnimationFrame(() => document.documentElement.classList.add('is-loaded'));
if (document.readyState === 'complete') loaded();
else window.addEventListener('load', loaded, { once: true });
