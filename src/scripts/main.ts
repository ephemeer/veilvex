import { initReveal } from './reveal';
import { initNav } from './nav';
import { initHero } from './hero';
import { initCounters } from './counters';
import { initSpotlight } from './spotlight';
import { initMagnetic } from './magnetic';
import { initProcess } from './process';
import { initGeo } from './geo';
import { initCases } from './cases';
import { initFaq } from './faq';
import { initContact } from './contact';

const boot = () => {
  initReveal();
  initNav();
  initHero();
  initCounters();
  initSpotlight();
  initMagnetic();
  initProcess();
  initGeo();
  initCases();
  initFaq();
  initContact();
};

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
