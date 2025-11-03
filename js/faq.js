let faqData = null;
let lastRenderedKey = 'parent';

function getFaqContainer() {
  return document.getElementById('faq-list');
}

export function setFaqData(data) {
  faqData = data || null;
  if (faqData) {
    renderFaq(lastRenderedKey);
  }
}

export function renderFaq(appKey = 'parent') {
  lastRenderedKey = appKey;
  const container = getFaqContainer();
  if (!container) {
    return;
  }

  container.innerHTML = '';
  if (!faqData || !Array.isArray(faqData[appKey])) {
    return;
  }

  faqData[appKey].forEach(item => {
    if (!item || typeof item.q !== 'string' || typeof item.a !== 'string') {
      return;
    }
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = item.q;
    const paragraph = document.createElement('p');
    paragraph.textContent = item.a;
    details.appendChild(summary);
    details.appendChild(paragraph);
    container.appendChild(details);
  });
}

export function initFaqTabs() {
  const tabs = document.querySelectorAll('.faq-tabs button');
  if (!tabs.length) {
    return;
  }

  tabs.forEach(button => {
    button.addEventListener('click', () => {
      tabs.forEach(tab => tab.classList.remove('active'));
      button.classList.add('active');
      renderFaq(button.dataset.app || 'parent');
    });
  });

  const active = document.querySelector('.faq-tabs button.active');
  const defaultTab = active || tabs[0];
  if (defaultTab) {
    defaultTab.classList.add('active');
    renderFaq(defaultTab.dataset.app || 'parent');
  }
}
