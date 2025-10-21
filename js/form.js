document.addEventListener('submit', async event => {
  const form = event.target;
  if (!form.matches('[data-formspree]')) return;
  event.preventDefault();
  const endpoint = form.getAttribute('action');
  if (!endpoint) return;
  const data = new FormData(form);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' }
    });
    const message = form.querySelector('.form-message');
    if (!message) return;
    if (response.ok) {
      message.textContent = form.dataset.success || 'تم الإرسال بنجاح';
      form.reset();
    } else {
      message.textContent = form.dataset.error || 'حدث خطأ، حاول لاحقًا';
    }
  } catch (error) {
    const message = form.querySelector('.form-message');
    if (message) {
      message.textContent = form.dataset.error || 'حدث خطأ، حاول لاحقًا';
    }
  }
});
