(function () {
  const SELECTOR = '[data-hero-media]';

  function setPlaceholder(container, src, alt) {
    container.innerHTML = '';
    if (!src) {
      return;
    }
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = src;
    img.alt = alt || 'Busaty video preview';
    container.appendChild(img);
  }

  function swapToIframe(container, videoId, title) {
    container.classList.add('is-loading');
    container.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1`;
    iframe.loading = 'lazy';
    iframe.title = title || 'Busaty video';
    iframe.allow =
      'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.addEventListener(
      'load',
      () => {
        container.classList.remove('is-loading');
      },
      { once: true }
    );
    container.appendChild(iframe);
    container.dataset.previewRendered = 'iframe';
  }

  function buildPreview(container) {
    const videoId = container.dataset.videoId;
    const image = container.dataset.image || container.dataset.defaultImage;
    const title = container.dataset.videoTitle || 'تشغيل الفيديو';
    container.innerHTML = '';

    if (image) {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = image;
      img.alt = title;
      container.appendChild(img);
    }

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'hero-video-play';
    button.setAttribute('aria-label', title);
    button.innerHTML = '<span></span>';
    container.appendChild(button);

    button.addEventListener('click', () => {
      swapToIframe(container, videoId, title);
    });

    container.dataset.previewRendered = 'preview';
  }

  function renderHeroVideo() {
    const container = document.querySelector(SELECTOR);
    if (!container) {
      return;
    }

    const videoId = container.dataset.videoId;
    const image = container.dataset.image || container.dataset.defaultImage;

    if (!videoId) {
      setPlaceholder(container, image, container.dataset.videoTitle);
      return;
    }

    if (container.dataset.previewRendered === 'iframe') {
      return;
    }

    buildPreview(container);
  }

  document.addEventListener('DOMContentLoaded', renderHeroVideo);
  window.renderHeroVideo = renderHeroVideo;
})();
