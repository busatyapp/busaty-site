const PAGE_KEY_MAP = { index: 'home' };
const DEFAULT_FEATURES = { enableAnalytics: true };
const DEFAULT_OG_IMAGE = '/assets/images/og-cover.webp';
const DEFAULT_TWITTER_CARD = 'summary_large_image';
const LANG_LOCALE_MAP = {
  ar: 'ar_AR',
  en: 'en_US',
  fr: 'fr_FR'
};
const DEFAULT_LOGO = '/assets/images/logo.png';

let faqModulePromise = null;

function ensureFaqModule() {
  if (!faqModulePromise) {
    faqModulePromise = import('./faq.js');
  }
  return faqModulePromise;
}

async function loadJSON(path) {
  const response = await fetch(path, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  return response.json();
}

function composeVideoPrompt(title, videoCopy = {}) {
  const prompt = (videoCopy.watchPrompt || '').trim();
  const label = (title || '').trim();
  if (prompt && label) {
    return `${prompt} ${label}`.trim();
  }
  return label || prompt;
}

function updateHeroMedia(hero = {}, videoCopy = {}) {
  const heroMedia = document.querySelector('[data-hero-media]');
  if (!heroMedia) return;

  const heroImage = heroMedia.querySelector('[data-hero-image]');
  const heroPlaceholder = heroMedia.querySelector('[data-hero-placeholder]');
  const heroButton = heroPlaceholder?.querySelector('[data-hero-video-button]') || document.querySelector('[data-hero-video-button]');
  const placeholderTextNode = heroPlaceholder?.querySelector('[data-video-text]') || heroPlaceholder;

  const fallbackSrc =
    hero.image || hero.poster || heroMedia.dataset.defaultImage || heroImage?.getAttribute('src') || '/assets/images/hero-bus.webp';
  const fallbackAlt =
    hero.imageAlt ||
    hero.videoTitle ||
    hero.title ||
    heroMedia.dataset.defaultAlt ||
    heroImage?.getAttribute('alt') ||
    'Busaty App Preview';
  const defaultButtonLabel =
    (heroButton?.dataset.defaultLabel || heroButton?.textContent?.trim()) || (videoCopy.button || 'Play video');
  const placeholderCopy =
    composeVideoPrompt(hero.videoTitle || hero.subtitle || hero.title, videoCopy) || fallbackAlt;
  const videoUrl = hero.videoUrl || '';

  heroMedia.dataset.defaultImage = fallbackSrc;
  heroMedia.dataset.defaultAlt = fallbackAlt;

  if (heroImage) {
    heroImage.src = fallbackSrc;
    heroImage.alt = fallbackAlt;
    heroImage.loading = 'eager';
    heroImage.decoding = 'async';
    const width = parseInt(heroMedia.dataset.imageWidth || '1280', 10);
    const height = parseInt(heroMedia.dataset.imageHeight || '720', 10);
    heroImage.width = Number.isFinite(width) ? width : 1280;
    heroImage.height = Number.isFinite(height) ? height : 720;
  }

  if (placeholderTextNode) {
    const shouldHideText = heroPlaceholder?.dataset?.hideText === 'true';
    placeholderTextNode.textContent = shouldHideText ? '' : placeholderCopy;
  } else if (heroPlaceholder) {
    const shouldHideText = heroPlaceholder?.dataset?.hideText === 'true';
    heroPlaceholder.textContent = shouldHideText ? '' : placeholderCopy;
  }

  if (heroButton) {
    heroButton.dataset.defaultLabel = heroButton.dataset.defaultLabel || defaultButtonLabel;
    const nextLabel = hero.videoButtonLabel || videoCopy.button || heroButton.dataset.defaultLabel;
    heroButton.textContent = nextLabel;
    const ariaLabelSource = hero.videoTitle || hero.subtitle || hero.title;
    const ariaLabel = ariaLabelSource ? `${nextLabel} — ${ariaLabelSource}`.trim() : nextLabel;
    heroButton.setAttribute('aria-label', ariaLabel);
    if (videoUrl) {
      heroButton.dataset.videoUrl = videoUrl;
      heroButton.removeAttribute('aria-disabled');
      heroButton.removeAttribute('disabled');
    } else {
      heroButton.dataset.videoUrl = '';
      heroButton.setAttribute('aria-disabled', 'true');
      heroButton.setAttribute('disabled', 'true');
    }
  }
}

function resolvePageKey() {
  const fromDataset = document.body?.dataset?.page;
  if (fromDataset) {
    return fromDataset;
  }
  const filename = window.location.pathname.split('/').pop() || 'index.html';
  const key = filename.replace('.html', '') || 'index';
  return PAGE_KEY_MAP[key] || key;
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

  if (contact.address) {
    document.querySelectorAll('[data-contact-address]').forEach(element => {
      element.textContent = contact.address;
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
    list.hidden = true;
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
    anchor.setAttribute('aria-label', formatSocialLabel(network));
    li.appendChild(anchor);
    list.appendChild(li);
  });

  list.hidden = !list.children.length;
}

function normaliseSameAs(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(entry => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry.url === 'string') return entry.url;
      return null;
    })
    .filter(Boolean);
}

function upsertMeta(attr, key, value) {
  if (!value) return;
  let meta = document.querySelector(`meta[${attr}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', value);
}

function upsertLink(rel, href) {
  if (!href) return;
  let link = document.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function updateStructuredData(globalContent, pageContent = {}) {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (!script) return;

  try {
    const json = JSON.parse(script.textContent);
    const seo = pageContent.seo || {};
    const defaults = globalContent.seoDefaults || {};

    if (seo.logoPath) {
      json.logo = seo.logoPath.startsWith('http')
        ? seo.logoPath
        : `${window.location.origin}${seo.logoPath}`;
    } else if (globalContent.logoPath) {
      json.logo = `${window.location.origin}${globalContent.logoPath}`;
    }

    if (seo.siteName) {
      json.name = seo.siteName;
    } else if (defaults.siteName) {
      json.name = defaults.siteName;
    }

    const sameAs = normaliseSameAs(seo.sameAs || defaults.sameAs);
    if (sameAs.length) {
      json.sameAs = sameAs;
    }
    script.textContent = JSON.stringify(json, null, 2);
  } catch (error) {
    console.warn('Unable to update structured data', error);
  }
}

function populateAppDetails(details, videoCopy = {}) {
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

    const videoButton = section.querySelector('[data-role="app-video-button"]');
    const placeholder = section.querySelector('[data-role="app-video-card"] .video-placeholder');
    const videoUrl = data.videoUrl || '';
    const videoTitle = data.videoTitle || data.title || '';

    if (videoButton) {
      const defaultLabel =
        videoButton.dataset.defaultLabel || videoButton.textContent.trim() || videoCopy.button || 'Play video';
      videoButton.dataset.defaultLabel = defaultLabel;
      const nextLabel = data.videoButtonLabel || videoCopy.button || defaultLabel;
      videoButton.textContent = nextLabel;
      const ariaLabel = videoTitle ? `${nextLabel} — ${videoTitle}`.trim() : nextLabel;
      videoButton.setAttribute('aria-label', ariaLabel);
      if (videoUrl) {
        videoButton.dataset.videoUrl = videoUrl;
        videoButton.removeAttribute('aria-disabled');
        videoButton.removeAttribute('disabled');
      } else {
        videoButton.dataset.videoUrl = '';
        videoButton.setAttribute('aria-disabled', 'true');
        videoButton.setAttribute('disabled', 'true');
      }
    }

    if (placeholder) {
      const textNode = placeholder.querySelector('[data-video-text]') || placeholder;
      textNode.textContent = composeVideoPrompt(videoTitle, videoCopy) || videoTitle;
    }
  });
}

function updateMetaTags(pageContent, langCommon) {
  const seo = pageContent.seo || {};
  const lang = (document.documentElement.lang || 'ar').slice(0, 2);
  const title = seo.title || pageContent.title;
  if (title) {
    document.title = title;
  }

  const description = seo.description || pageContent.description || langCommon.description;
  if (description) {
    upsertMeta('name', 'description', description);
  }

  const canonicalUrl = seo.canonical;
  if (canonicalUrl) {
    upsertLink('canonical', canonicalUrl);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('name', 'twitter:url', canonicalUrl);
  }

  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const ogImage = seo.ogImage || seo.ogImageUrl || langCommon.ogImage || DEFAULT_OG_IMAGE;
  const twitterImage = seo.twitterImage || ogImage;
  const twitterTitle = seo.twitterTitle || ogTitle;
  const twitterDescription = seo.twitterDescription || ogDescription;
  const locale = seo.locale || LANG_LOCALE_MAP[lang] || 'ar_AR';
  const siteName = seo.siteName || 'Busaty';

  upsertMeta('property', 'og:title', ogTitle);
  upsertMeta('property', 'og:description', ogDescription);
  upsertMeta('property', 'og:image', ogImage);
  upsertMeta('property', 'og:locale', locale);
  upsertMeta('property', 'og:site_name', siteName);

  upsertMeta('name', 'twitter:card', seo.twitterCard || DEFAULT_TWITTER_CARD);
  upsertMeta('name', 'twitter:title', twitterTitle);
  upsertMeta('name', 'twitter:description', twitterDescription);
  upsertMeta('name', 'twitter:image', twitterImage);
}

function setLogoSource(img, nextSrc, fallbackSrc) {
  if (!nextSrc) {
    img.setAttribute('src', fallbackSrc);
    return;
  }
  if (img.getAttribute('src') === nextSrc) {
    return;
  }
  const handleError = () => {
    img.removeEventListener('load', handleLoad);
    img.setAttribute('src', fallbackSrc);
  };
  const handleLoad = () => {
    img.removeEventListener('error', handleError);
  };
  img.addEventListener('error', handleError, { once: true });
  img.addEventListener('load', handleLoad, { once: true });
  img.setAttribute('src', nextSrc);
}

function applyLogoAndApps(pageContent, langCommon, globalContent) {
  const resolvedLogo = pageContent.logoPath || langCommon.logoPath || globalContent.logoPath;
  const fallbackLogo = globalContent.defaultLogoPath || DEFAULT_LOGO;

  document.querySelectorAll('[data-site-logo]').forEach(img => {
    const storedFallback =
      img.dataset.defaultLogo ||
      img.getAttribute('data-default-logo') ||
      img.dataset.initialLogo ||
      img.getAttribute('src') ||
      fallbackLogo;
    img.dataset.defaultLogo = storedFallback;
    img.dataset.initialLogo = storedFallback;
    const nextSrc = resolvedLogo || storedFallback;
    setLogoSource(img, nextSrc, storedFallback);
  });

  const appsLinks = pageContent.appsLinks || langCommon.appsLinks || globalContent.appsLinks;
  if (appsLinks) {
    ['parent', 'supervisor', 'school'].forEach(appKey => {
      const href = appsLinks[appKey] || '#';
      document.querySelectorAll(`[data-app-link="${appKey}"]`).forEach(link => {
        link.setAttribute('href', href);
      });
    });
  }
}

function applyTranslations(dict) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const value = resolveValue(dict, key);
    if (typeof value === 'string') {
      element.textContent = value;
    }
  });
}

export async function loadContent(options = {}) {
  const lang = options.lang || document.documentElement.lang || 'ar';
  const page = resolvePageKey();
  const base = `/content/${lang}`;

  const globalContent = await loadJSON('/content/common.json').catch(() => ({}));
  const features = { ...DEFAULT_FEATURES, ...(globalContent.features || {}) };
  window.__FEATURES = { ...(window.__FEATURES || {}), ...features };
  const langCommon = await loadJSON(`${base}/common.json`).catch(() => ({}));
  const pageContent = await loadJSON(`${base}/${page}.json`).catch(() => ({}));

  const dictionary = { ...langCommon, ...pageContent };
  const videoCopy = dictionary.video || {};

  updateMetaTags(pageContent, langCommon);
  applyTranslations(dictionary);
  applyLogoAndApps(pageContent, langCommon, globalContent);
  updateHeroMedia(dictionary.hero || {}, videoCopy);

  const formMessages = dictionary.form;
  if (formMessages && typeof formMessages === 'object') {
    document.querySelectorAll('[data-formspree]').forEach(form => {
      if (formMessages.success) {
        form.dataset.success = formMessages.success;
      }
      if (formMessages.error) {
        form.dataset.error = formMessages.error;
      }
    });
  }

  const contact = pageContent.contact || langCommon.contact || globalContent.contact;
  applyContactInfo(contact);

  const social = pageContent.social || langCommon.social || globalContent.social;
  applySocialLinks(social);

  updateStructuredData(globalContent, pageContent);

  if (dictionary.appDetails) {
    populateAppDetails(dictionary.appDetails, videoCopy);
  }

  try {
    const faq = await loadJSON(`${base}/faq.json`);
    const module = await ensureFaqModule();
    module.setFaqData(faq);
    if (document.getElementById('faq-list')) {
      module.renderFaq(options.defaultFaqKey || 'parent');
    }
  } catch {
    if (faqModulePromise) {
      const module = await faqModulePromise;
      module.setFaqData(null);
    }
  }

  return {
    lang,
    pageKey: page,
    globalContent,
    langCommon,
    pageContent,
    features
  };
}
