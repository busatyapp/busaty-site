import { initLang } from './i18n.js';
import { loadContent } from './content-loader.js';
import { initFormHandler } from './form.js';

let faqModulePromise = null;

function ensureFaqModule() {
  if (!faqModulePromise) {
    faqModulePromise = import('./faq.js');
  }
  return faqModulePromise;
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  try {
    await navigator.serviceWorker.register('/sw.js');
  } catch (error) {
    console.warn('Service worker registration failed', error);
  }
}

function updateYearStamp() {
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

function highlightActiveNav() {
  const currentPath = window.location.pathname.replace(/index\.html$/, '').replace(/\/$/, '');
  document.querySelectorAll('.main-nav a').forEach(link => {
    const linkPath = new URL(link.href).pathname.replace(/index\.html$/, '').replace(/\/$/, '');
    if (linkPath === currentPath) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

function initSmoothScroll() {
  const scrollLinks = document.querySelectorAll('a[data-scroll]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  scrollLinks.forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) {
        return;
      }
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      if (prefersReducedMotion.matches) {
        target.scrollIntoView({ block: 'start' });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function injectAnalytics(features = {}) {
  const enabled = features.enableAnalytics !== false;
  const existing = document.querySelector('script[data-analytics="plausible"]');
  if (!enabled) {
    if (existing) {
      existing.remove();
    }
    return;
  }
  if (existing) {
    return;
  }
  const domain = features.analyticsDomain || 'busaty-site.vercel.app';
  const script = document.createElement('script');
  script.defer = true;
  script.dataset.analytics = 'plausible';
  script.setAttribute('data-domain', domain);
  script.src = 'https://plausible.io/js/script.js';
  document.head.appendChild(script);
}

function applyFeatureFlags(features = {}) {
  window.__FEATURES = { ...(window.__FEATURES || {}), ...features };
  injectAnalytics(features);
}

document.addEventListener('DOMContentLoaded', async () => {
  initFormHandler();
  updateYearStamp();
  highlightActiveNav();
  initSmoothScroll();

  const lang = await initLang();
  const ctx = await loadContent({ lang });
  applyFeatureFlags(ctx.features || {});
  if (document.querySelector('.faq-tabs')) {
    const module = await ensureFaqModule();
    module.initFaqTabs();
  }
  registerServiceWorker();
});
