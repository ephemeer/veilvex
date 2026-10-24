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
