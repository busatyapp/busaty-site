(function () {
  const HERO_SELECTOR = '[data-hero-media]';
  const APP_SELECTOR = '[data-role="app-video-card"]';

  function normaliseYouTubeUrl(url) {
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.origin);
      const host = parsed.hostname || '';
      let videoId = '';
      let startParam = '';

      if (host.includes('youtube.com')) {
        if (parsed.pathname.includes('/embed/')) {
          return parsed.toString().replace('www.youtube.com', 'www.youtube-nocookie.com');
        }
        videoId = parsed.searchParams.get('v') || '';
        startParam = parsed.searchParams.get('t') || parsed.searchParams.get('start') || '';
      } else if (host.includes('youtu.be')) {
        videoId = parsed.pathname.replace('/', '');
        startParam = parsed.searchParams.get('t') || '';
      } else {
        return url;
      }

      if (!videoId) {
        return url;
      }

      let embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`;
      if (startParam) {
        const secondsMatch = startParam.match(/(\d+)/);
        const seconds = secondsMatch ? parseInt(secondsMatch[1], 10) : NaN;
        if (!Number.isNaN(seconds) && seconds > 0) {
          embedUrl += `&start=${seconds}`;
        }
      }
      return embedUrl;
    } catch {
      return url;
    }
  }

  function removePlaceholder(container) {
    const placeholder = container.querySelector('.video-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  }

  function replaceHeroImage(container) {
    if (!container.matches(HERO_SELECTOR)) return;
    const heroImage = container.querySelector('[data-hero-image]');
    if (heroImage) {
      heroImage.remove();
    }
  }

  function createIframe(src, title) {
    const iframe = document.createElement('iframe');
    iframe.src = src;
    iframe.loading = 'lazy';
    iframe.title = title || 'Busaty video';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.allow =
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.dataset.videoFrame = 'true';
    return iframe;
  }

  function playVideo(trigger) {
    const rawUrl = (trigger.dataset.videoUrl || '').trim();
    if (!rawUrl) return;
    const container =
      trigger.closest(`${APP_SELECTOR}, ${HERO_SELECTOR}`) ||
      trigger.closest('.video-wrapper') ||
      trigger.closest('.hero-media');
    if (!container || container.dataset.videoActive === 'true') return;

    const embedUrl = normaliseYouTubeUrl(rawUrl);
    if (!embedUrl) {
      window.open(rawUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    container.dataset.videoActive = 'true';
    removePlaceholder(container);
    replaceHeroImage(container);
    const title = trigger.getAttribute('aria-label') || trigger.textContent.trim();
    const iframe = createIframe(embedUrl, title);
    container.appendChild(iframe);
    requestAnimationFrame(() => iframe.focus?.());
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('.video-play-btn');
    if (!trigger) return;
    if (trigger.disabled || trigger.getAttribute('aria-disabled') === 'true') {
      return;
    }
    event.preventDefault();
    playVideo(trigger);
  });
})();
