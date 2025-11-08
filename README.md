# Busaty Static Site

Static multilingual marketing site for Busaty built with vanilla HTML, CSS, and JS. Content is stored in JSON (per language) and managed through Decap CMS.

## Features
- Arabic, English, and French localisation with RTL switching and automatic language detection (navigator + optional GeoIP).
- CMS-driven pages (`home`, `about`, `help`, `terms`) with reusable sections, FAQ tabs, downloadable app cards, and translated Formspree success/error copy.
- Accessible UI: skip links, focus-visible styles, keyboard-friendly tabs/buttons, and ARIA-friendly feedback messaging.
- Vite-based pipeline with a richer service worker + `offline.html`, manifest icons, post-build packaging of `admin/` + `content/`, and automated `sitemap.xml` generation.
- Decap CMS configuration covering logos, app links, contact info, social links, SEO defaults, and per-page blocks.
- Automated DOM regression test (Vitest snapshot), Playwright smoke tests, and Lighthouse CI configuration to guard performance, accessibility, and SEO budgets.
- Privacy-friendly analytics (Plausible) wired in every page head (`data-domain="busaty-site.vercel.app"`).

## Getting Started
1. Install Node.js ≥ 18 (portable build available under `node-v20.11.1-win-x64/` for Windows users).
2. Install dependencies:
   ```bash
   npm install
   ```
   > Without Node on `PATH`, run commands with `.\node-v20.11.1-win-x64\npm.cmd`.
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Building & Previewing
- Production build (`dist/` output):
  ```bash
  npm run build
  ```
  Produces minified HTML/CSS/JS, copies `admin/` + `content/`, includes `sw.js`, `manifest.webmanifest`, and writes `dist/sitemap.xml` with `lastmod` stamps.
- Preview the built bundle locally:
  ```bash
  npm run preview
  ```

### Build Artifacts
`dist/` contains:
- `index.html`, `about.html`, `help.html`, `terms.html`
- `assets/` (static files served from `public/assets/`)
- `content/` (runtime JSON for the site and CMS)
- `admin/` (Decap CMS bundle)
- `sw.js`, `manifest.webmanifest`, `offline.html`, `robots.txt`, `sitemap.xml`

Deploy **all** of `dist/` to your hosting provider (Vercel, FTP, cPanel, etc.).

## Content & CMS
- Update `admin/config.yml`:
  - `backend.repo`: `busatyapp/busaty-site`
  - `backend.base_url`: `https://busaty-oauth.vercel.app`
  - `auth_endpoint`: `/auth`
- Once OAuth is configured, open `/admin/` to edit content.
- Shared strings live in `content/common.json`; per-language copies override via `content/<lang>/common.json`.
- Page-specific data lives in `content/<lang>/<page>.json` (`home.json` drives `index.html` through the `data-page="home"` marker).
- Formspree endpoint: swap `https://formspree.io/f/XXXXXXX` for your project. Success/error messages are sourced from each language’s `form.success` / `form.error`.
- Assets uploaded through the CMS are stored in `public/assets/images/` and bundled automatically.

## QA & Budgets
- DOM regression tests:
  ```bash
  npm run test
  ```
- Content schema validation:
  ```bash
  npm run validate:content
  ```
- Lighthouse checks (requires a local Chrome install):
  ```bash
  npm run build
  npm run lint:perf
  ```
  Budgets enforced by `.lighthouserc.json`:
  - Performance ≥ 0.90 (warn)
  - Accessibility ≥ 0.95 (error)
  - Best Practices ≥ 0.95 (warn)
  - SEO ≥ 0.95 (warn)
- Playwright smoke tests:
  ```bash
  npm run e2e
  ```
- GitHub Actions workflow (`.github/workflows/ci.yml`) runs validation + tests + build + Lighthouse on push/PR (add the secret `LHCI_GITHUB_APP_TOKEN` for status reporting).

## Deployment Checklist
- Configure DNS + HTTPS for the production domain.
- Set OAuth bridge environment variables (`ORIGINS`, `CLIENT_ID`, `CLIENT_SECRET`) on the Vercel project.
- Rotate/Formspree credentials and confirm contact emails in `content/common.json`.
- Enable GeoIP by toggling `USE_GEOIP = true` in `js/i18n.js` (requires public fetch access).
- After CMS updates, wait for the GitHub commit + Vercel redeploy, then hard-refresh to invalidate CDN caches.
- Disable Plausible analytics (if desired) by removing the `<script defer data-domain="busaty-site.vercel.app" src="https://plausible.io/js/script.js"></script>` tag.

## Notes
- Optimise the images in `public/assets/images/` (AVIF/WebP/PNG).
- Add high-resolution icons to `public/manifest.webmanifest` if a full PWA experience is desired.
- Refer to `CHANGELOG.md` for improvement history and `TODO.md` for future enhancements.
