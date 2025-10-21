document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const tabs = document.querySelectorAll('.faq-tabs button');
  const list = document.getElementById('faq-list');
  if (tabs.length && list) {
    tabs.forEach(btn => {
      btn.addEventListener('click', () => {
        tabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const app = btn.dataset.app;
        if (typeof window.renderFAQ === 'function') {
          window.renderFAQ(app);
        }
      });
    });
  }

  const scrollLinks = document.querySelectorAll('a[data-scroll]');
  scrollLinks.forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');
      if (!href || !href.startsWith('#')) {
        return;
      }
      const target = document.querySelector(href);
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
});
