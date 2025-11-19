(function () {
  function normaliseUrl(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    try {
      return new URL(trimmed, window.location.origin).toString();
    } catch {
      return trimmed;
    }
  }

  function handleVideoRequest(event) {
    const trigger = event.target.closest('.video-play-btn');
    if (!trigger) return;
    if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') {
      return;
    }
    const url = normaliseUrl(trigger.dataset.videoUrl);
    if (!url) return;
    event.preventDefault();
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  document.addEventListener('click', handleVideoRequest);
})();
