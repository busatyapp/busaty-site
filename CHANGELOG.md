# Changelog

## 2025-11-03

- Consolidated client-side code into ES modules with a single `main.js` entrypoint orchestrating language detection, content loading, FAQ tabs, and Formspree handling.
- Ensured CMS-driven content propagates site-wide by mapping `index.html` to `home.json`, expanding JSON overrides (contact, social, SEO), and dynamically rendering FAQ/app details without global state.
- Hardened build pipeline: `npm run build` now copies admin/content/assets/robots into `dist/` and emits `sitemap.xml` with `lastmod` metadata for SEO tooling.
- Added `data-page` markers, semantic skip link support across pages, focus-safe FAQ buttons, and scripts to set canonical/OG tags per page for stronger accessibility and SEO.
- Introduced workspace hygiene (`.gitignore`, preview script) and documented workflows (README, TODO) to streamline future maintenance and audits.

## 2025-11-04

- Migrated static assets into `public/` so Vite serves/copied files automatically, and added PWA surface (`sw.js`, `manifest.webmanifest`) registered from `main.js`.
- Localised Formspree success/error strings across languages via CMS content and wired runtime datasets for accessibility-friendly messaging.
- Added Vitest + jsdom test harness with DOM snapshot coverage for `loadContent`, including mocks for FAQ rendering, and documented `npm run test`.
- Introduced Lighthouse CI configuration (`npm run lint:perf`) with performance/accessibility budgets, and expanded `.gitignore` for artefacts.
- Updated README/TODO to reflect the new workflows, future automation plan, and moved build scripts to rely on Vite-managed static assets.
