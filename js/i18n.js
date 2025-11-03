const USE_GEOIP = false; // فعّل عند الحاجة

const SUPPORTED_LANGS = ['ar', 'en', 'fr'];
const COUNTRY_LANG_MAP = {
  EG: 'ar',
  SA: 'ar',
  AE: 'ar',
  FR: 'fr'
};

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

export async function detectLang() {
  const stored = localStorage.getItem('lang');
  if (stored && SUPPORTED_LANGS.includes(stored)) {
    return stored;
  }

  let lang = (navigator.language || 'ar').slice(0, 2).toLowerCase();
  if (!SUPPORTED_LANGS.includes(lang)) {
    lang = 'ar';
  }

  if (!USE_GEOIP) {
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
