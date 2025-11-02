async function loadJSON(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

function pageKey() {
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const key = filename.replace('.html', '');
  return key || 'index';
}

function resolveValue(dict, path) {
  return path.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    return acc[key];
  }, dict);
}

function createWhatsappLink(config) {
  if (!config) return null;
  if (typeof config === 'string') {
    return config.startsWith('http') ? config : `https://wa.me/${config.replace(/[^\d]/g, '')}`;
  }
  if (config.link) {
    return config.link;
  }
  if (!config.number) return null;
  const digits = config.number.toString().replace(/[^\d]/g, '');
  let url = `https://wa.me/${digits}`;
  if (config.message) {
    url += `?text=${encodeURIComponent(config.message)}`;
  }
  return url;
}

function applyContactInfo(contact) {
  if (!contact) return;
  if (contact.email) {
    document.querySelectorAll('[data-contact-link="email"]').forEach(anchor => {
      anchor.setAttribute('href', `mailto:${contact.email}`);
      anchor.textContent = contact.email;
    });
  }
  const whatsappHref = createWhatsappLink(contact.whatsapp);
  if (whatsappHref) {
    document.querySelectorAll('[data-contact-link="whatsapp"]').forEach(anchor => {
      anchor.setAttribute('href', whatsappHref);
    });
  }
  if (contact.phone) {
    document.querySelectorAll('[data-contact-link="phone"]').forEach(anchor => {
      anchor.setAttribute('href', `tel:${contact.phone}`);
      anchor.textContent = contact.phone;
    });
  }
}

function formatSocialLabel(key) {
  const labels = {
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    twitter: 'Twitter',
    instagram: 'Instagram',
    tiktok: 'TikTok'
  };
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

function applySocialLinks(social) {
  const list = document.querySelector('[data-social-list]');
  if (!list) return;
  list.innerHTML = '';
  if (!social) {
    list.remove();
    return;
  }
  Object.entries(social).forEach(([network, url]) => {
    if (!url) return;
    const li = document.createElement('li');
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.textContent = formatSocialLabel(network);
    li.appendChild(anchor);
    list.appendChild(li);
  });
  if (!list.children.length) {
    list.remove();
  }
}

function updateStructuredData(globalContent) {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (!script) return;
  try {
    const json = JSON.parse(script.textContent);
    if (globalContent.logoPath) {
      json.logo = `${window.location.origin}${globalContent.logoPath}`;
    }
    if (globalContent.seoDefaults?.siteName) {
      json.name = globalContent.seoDefaults.siteName;
    }
    if (Array.isArray(globalContent.seoDefaults?.sameAs)) {
      json.sameAs = globalContent.seoDefaults.sameAs;
    }
    script.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    console.warn('Unable to update structured data', error);
  }
}

function normaliseVideoUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname || '';
    let videoId = '';
    let startParam = '';

    if (host.includes('youtube.com')) {
      if (parsed.pathname.includes('/embed/')) {
        return url;
      }
      videoId = parsed.searchParams.get('v') || '';
      startParam = parsed.searchParams.get('t') || '';
    } else if (host.includes('youtu.be')) {
      videoId = parsed.pathname.replace('/', '');
      startParam = parsed.searchParams.get('t') || '';
    }

    if (!videoId) {
      return url;
    }

    let embedUrl = `https://www.youtube.com/embed/${videoId}`;
    if (startParam) {
      const seconds = /(\d+)s?$/i.test(startParam) ? parseInt(startParam, 10) : parseInt(startParam, 10);
      if (!Number.isNaN(seconds) && seconds > 0) {
        embedUrl += `?start=${seconds}`;
      }
    }
    return embedUrl;
  } catch (error) {
    return url;
  }
}

function populateAppDetails(details) {
  if (!details) return;
  const sections = document.querySelectorAll('[data-app-detail]');
  sections.forEach(section => {
    const key = section.getAttribute('data-app-detail');
    const data = details[key];
    if (!data) return;

    const featureList = section.querySelector('[data-role="app-features"]');
    if (featureList) {
      featureList.innerHTML = '';
      const items = Array.isArray(data.features) ? data.features : [];
      items.forEach(entry => {
        const raw =
          typeof entry === 'string'
            ? entry
            : (entry && (entry.text || entry.body || entry.label)) || '';
        if (typeof raw !== 'string' || !raw.trim()) return;
        const li = document.createElement('li');
        li.textContent = raw.trim();
        featureList.appendChild(li);
      });
    }

    const downloadsWrap = section.querySelector('[data-role="app-downloads"]');
    if (downloadsWrap) {
      downloadsWrap.innerHTML = '';
      const downloads = Array.isArray(data.downloads) ? data.downloads : [];
      downloads.forEach(item => {
        if (!item || typeof item.url !== 'string' || !item.url) return;
        const label = item.label || item.platform || 'Download';
        const link = document.createElement('a');
        link.className = 'btn btn-download';
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = label;
        downloadsWrap.appendChild(link);
      });
    }

    const videoFrame = section.querySelector('[data-role="app-video"]');
    if (videoFrame && data.videoUrl) {
      const src = normaliseVideoUrl(data.videoUrl);
      if (src) {
        videoFrame.setAttribute('src', src);
      }
      if (data.videoTitle) {
        videoFrame.setAttribute('title', data.videoTitle);
      }
    }
  });
}

async function loadContent() {
  const lang = document.documentElement.lang || 'ar';
  const page = pageKey();
  const base = `/content/${lang}`;

  const globalContent = await loadJSON('/content/common.json').catch(() => ({}));
  const langCommon = await loadJSON(`${base}/common.json`).catch(() => ({}));
  const pageContent = await loadJSON(`${base}/${page}.json`).catch(() => ({}));

  const dict = { ...langCommon, ...pageContent };

  // Document title and description
  if (pageContent.title) {
    document.title = `${pageContent.title} – Busaty`;
  }
  const description = pageContent.description || langCommon.description;
  if (description) {
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description);
  }

  // Logo and apps links
  const logoPath = pageContent.logoPath || langCommon.logoPath || globalContent.logoPath;
  if (logoPath) {
    const logo = document.getElementById('site-logo');
    if (logo) {
      logo.setAttribute('src', logoPath);
    }
  }

  const appsLinks = pageContent.appsLinks || langCommon.appsLinks || globalContent.appsLinks;
  if (appsLinks) {
    ['parent', 'supervisor', 'school'].forEach(appKey => {
      const href = appsLinks[appKey] || '#';
      document.querySelectorAll(`[data-app-link="${appKey}"]`).forEach(link => {
        link.setAttribute('href', href);
      });
    });
  }

  // Apply translations
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = resolveValue(dict, key);
    if (typeof value === 'string') {
      el.textContent = value;
    }
  });

  applyContactInfo(globalContent.contact);
  applySocialLinks(globalContent.social);
  updateStructuredData(globalContent);

  if (dict.appDetails) {
    populateAppDetails(dict.appDetails);
  }

  // FAQ data
  try {
    const faq = await loadJSON(`${base}/faq.json`);
    window.__FAQ = faq;
    if (document.getElementById('faq-list')) {
      window.renderFAQ('parent');
    }
  } catch (error) {
    window.__FAQ = null;
  }
}

document.addEventListener('DOMContentLoaded', loadContent);
