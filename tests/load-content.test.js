import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../js/faq.js', () => {
  return {
    renderFaq: vi.fn(),
    setFaqData: vi.fn()
  };
});

import { loadContent } from '../js/content-loader.js';
import { renderFaq, setFaqData } from '../js/faq.js';

const FIXTURES = new Map();

const resetFixtures = () => {
  FIXTURES.clear();

  FIXTURES.set('/content/common.json', {
    logoPath: '/assets/images/logo.png',
    contact: {
      email: 'support@example.com',
      phone: '+20123456789'
    },
    social: {
      facebook: 'https://facebook.example.com'
    },
    seoDefaults: {
      siteName: 'Busaty',
      sameAs: ['https://facebook.example.com']
    }
  });

  FIXTURES.set('/content/ar/common.json', {
    description: 'وصف افتراضي',
    form: {
      name: 'الاسم',
      email: 'البريد',
      message: 'الرسالة',
      send: 'إرسال',
      success: 'تم الإرسال!',
      error: 'حدث خطأ'
    }
  });

  FIXTURES.set('/content/ar/home.json', {
    title: 'الصفحة الرئيسية',
    description: 'وصف الصفحة',
    hero: {
      title: 'عنوان البطل',
      subtitle: 'نص توضيحي'
    },
    appDetails: {
      parent: {
        videoUrl: 'https://www.youtube.com/watch?v=abc123',
        videoTitle: 'فيديو',
        features: ['ميزة 1'],
        downloads: [{ label: 'تحميل', url: 'https://example.com/app.apk' }]
      }
    }
  });

  FIXTURES.set('/content/ar/faq.json', {
    parent: [{ q: 'سؤال', a: 'إجابة' }]
  });
};

const mockFetch = () => {
  global.fetch = vi.fn(async url => {
    const key = typeof url === 'string' ? url : url.url;
    const payload = FIXTURES.get(key);
    if (!payload) {
      return { ok: false, status: 404, json: async () => ({}) };
    }
    return { ok: true, json: async () => payload };
  });
};

describe('loadContent', () => {
  beforeEach(() => {
    resetFixtures();
    mockFetch();

    document.documentElement.lang = 'ar';
    document.head.innerHTML = `
      <meta name="description" content="">
      <meta property="og:title" content="">
      <meta property="og:description" content="">
      <meta property="og:image" content="">
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"Organization","name":"Busaty","logo":"/assets/images/logo.png","sameAs":[]}
      </script>
    `;
    document.body.dataset.page = 'home';
    document.body.innerHTML = `
      <header>
        <img id="site-logo" data-site-logo src="" alt="">
      </header>
      <main>
        <h1 data-i18n="hero.title"></h1>
        <p data-i18n="hero.subtitle"></p>
      </main>
      <section data-app-detail="parent">
        <ul data-role="app-features"></ul>
        <div data-role="app-downloads"></div>
        <iframe data-role="app-video"></iframe>
      </section>
      <div id="faq-list"></div>
      <ul data-social-list></ul>
      <form data-formspree>
        <p class="form-message"></p>
      </form>
    `;
  });

  it('hydrates the DOM using fetched content and updates datasets', async () => {
    await loadContent({ lang: 'ar' });

    expect(document.querySelector('[data-i18n="hero.title"]').textContent).toBe('عنوان البطل');
    expect(document.querySelector('[data-i18n="hero.subtitle"]').textContent).toBe('نص توضيحي');
    expect(document.getElementById('site-logo').getAttribute('src')).toBe('/assets/images/logo.png');

    const form = document.querySelector('[data-formspree]');
    expect(form.dataset.success).toBe('تم الإرسال!');
    expect(form.dataset.error).toBe('حدث خطأ');

    expect(setFaqData).toHaveBeenCalledWith({ parent: [{ q: 'سؤال', a: 'إجابة' }] });
    expect(renderFaq).toHaveBeenCalledWith('parent');

    expect(document.body.innerHTML).toMatchSnapshot();
  });
});
