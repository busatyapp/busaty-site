function ensureStatusElement(form) {
  const message = form.querySelector('.form-message');
  if (!message) return null;
  if (!message.hasAttribute('role')) {
    message.setAttribute('role', 'status');
    message.setAttribute('aria-live', 'polite');
  }
  return message;
}

async function handleSubmission(event) {
  const form = event.target;
  if (!form.matches('[data-formspree]')) return;
  event.preventDefault();

  const endpoint = form.getAttribute('action');
  if (!endpoint) return;

  const message = ensureStatusElement(form);
  const payload = new FormData(form);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: payload,
      headers: { Accept: 'application/json' }
    });

    if (!message) return;
    if (response.ok) {
      message.textContent = form.dataset.success || 'تم الإرسال بنجاح';
      form.reset();
    } else {
      message.textContent = form.dataset.error || 'حدث خطأ، حاول لاحقًا';
    }
  } catch {
    if (message) {
      message.textContent = form.dataset.error || 'حدث خطأ، حاول لاحقًا';
    }
  }
}

export function initFormHandler() {
  document.addEventListener('submit', handleSubmission);
}
