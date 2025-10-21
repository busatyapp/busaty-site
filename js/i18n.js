const USE_GEOIP = false; // فعّل عند الحاجة

const SUPPORTED_LANGS = ['ar', 'en', 'fr'];
const COUNTRY_LANG_MAP = {
  EG: 'ar',
  SA: 'ar',
  AE: 'ar',
  FR: 'fr'
};

async function detectLang() {
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

  try {
    const cached = JSON.parse(localStorage.getItem('geoip') || 'null');
    if (!cached || Date.now() - cached.t > 86_400_000) {
      const response = await fetch('https://ipapi.co/json/');
      const json = await response.json();
      localStorage.setItem('geoip', JSON.stringify({ t: Date.now(), c: json.country_code }));
      lang = COUNTRY_LANG_MAP[json.country_code] || lang;
    } else {
      lang = COUNTRY_LANG_MAP[cached.c] || lang;
    }
  } catch (error) {
    // silent fallback to detected language
  }

  return lang;
}

async function applyLang(lang) {
  const resolved = SUPPORTED_LANGS.includes(lang) ? lang : 'ar';
  document.documentElement.lang = resolved;
  document.documentElement.dir = resolved === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('lang', resolved);
}

async function initLang() {
  const select = document.getElementById('lang-switcher');
  const lang = await detectLang();
  await applyLang(lang);
  if (select) {
    select.value = lang;
    select.addEventListener('change', event => {
      applyLang(event.target.value).then(() => {
        window.location.reload();
      });
    });
  }
}

document.addEventListener('DOMContentLoaded', initLang);

window.applyLang = applyLang;
