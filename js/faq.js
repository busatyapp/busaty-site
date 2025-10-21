window.renderFAQ = function renderFAQ(appKey) {
  if (!window.__FAQ) return;
  const container = document.getElementById('faq-list');
  if (!container) return;
  container.innerHTML = '';
  const items = window.__FAQ[appKey] || [];
  items.forEach(item => {
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = item.q;
    const paragraph = document.createElement('p');
    paragraph.textContent = item.a;
    details.appendChild(summary);
    details.appendChild(paragraph);
    container.appendChild(details);
  });
};
