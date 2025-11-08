const SUPPORTED_LANGS = ['ar', 'en', 'fr'];
const COUNTRY_LANG_MAP = {
  EG: 'ar',
  SA: 'ar',
  AE: 'ar',
  FR: 'fr'
};
let featureConfig = null;

async function fetchGeoIpLang(defaultLang) {
  try {
    const cached = JSON.parse(localStorage.getItem('geoip') || 'null');
    const stale = !cached || Date.now() - cached.t > 86_400_000;
    if (stale) {
      const response = await fetch('https://ipapi.co/json/');
      const json = await response.json();
      const countryCode = json.country_code;
      localStorage.setItem('geoip', JSON.stringify({ t: Date.now(), c: countryCode }));
      return COUNTRY_LANG_MAP[countryCode] || defaultLang;
    }
    return COUNTRY_LANG_MAP[cached.c] || defaultLang;
  } catch {
    return defaultLang;
  }
}

async function ensureFeatureFlags() {
  if (featureConfig) {
    return featureConfig;
  }
  if (window.__FEATURES) {
    featureConfig = window.__FEATURES;
    return featureConfig;
  }
  try {
    const response = await fetch('/content/common.json', { cache: 'no-store' });
    const json = await response.json();
    featureConfig = json.features || {};
    window.__FEATURES = featureConfig;
  } catch {
    featureConfig = {};
  }
  return featureConfig;
}

export async function detectLang() {
  const features = await ensureFeatureFlags();
  const geoEnabled = features.useGeoIp === true;

  const stored = localStorage.getItem('lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }

  let lang = (navigator.language || 'ar').slice(0, 2).toLowerCase();
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = 'ar';
  }

  if (!geoEnabled) {
    return lang;
  }

  return fetchGeoIpLang(lang);
}

export async function applyLang(lang) {
  const resolved = SUPPORTED_LANGS.includes(lang) ? lang : 'ar';
  document.documentElement.lang = resolved;
  document.documentElement.dir = resolved === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('lang', resolved);
  return resolved;
}

export async function initLang() {
  const select = document.getElementById('lang-switcher');
  const lang = await detectLang();
  const resolved = await applyLang(lang);

  if (select) {
    select.value = resolved;
    select.addEventListener('change', event => {
      applyLang(event.target.value).then(() => {
        window.location.reload();
      });
    });
  }

  return resolved;
}
