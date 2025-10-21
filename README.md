# Busaty Static Site

Static multilingual marketing site for Busaty built with vanilla HTML, CSS, and JS. Content is driven through JSON files and managed via Decap CMS.

## Features
- Arabic, English, and French localisation with RTL support.
- Content-driven pages: home, about, help, and terms.
- FAQ component powered by JSON content.
- Contact form wired to Formspree (update the endpoint before launch).
- WhatsApp CTA replicated across header, hero, and footer.
- Decap CMS configuration for easy content management.
- Vite bundling and sitemap generation script for SEO.

## Getting Started
```bash
npm install
npm run dev
```

## Building for Production
```bash
npm run build
```
The build command runs Vite and then generates `sitemap.xml`. Deploy the contents of the `dist/` folder (plus `sitemap.xml`) to your hosting (FTP/cPanel, etc.).

## Content & CMS
- Update `admin/config.yml` with your GitHub repo (`backend.repo`) and OAuth bridge URL (`backend.base_url`).
- Replace `YOUR-OAUTH-BRIDGE.example.com` with the URL of a hosted `netlify-cms-github-oauth-provider`.
- Edit content through `/admin/` once GitHub authentication is configured.
- Replace the Formspree endpoint `https://formspree.io/f/XXXXXXX` with your own ID.
- Assets uploaded via the CMS are stored in `assets/images/`.

## Deployment Checklist
- Configure DNS/hosting to serve the built files.
- Ensure HTTPS is enabled (required for GeoIP and modern browsers).
- Update `content/common.json` with the production logo path and app download URLs.
- Enable GeoIP detection by setting `USE_GEOIP = true` in `js/i18n.js` if you have the quota.
- Verify WhatsApp links and social profiles inside the JSON-LD schema.

## Notes
- Replace placeholder images in `assets/images/` with optimised WebP/AVIF/PNG assets.
- Add real translations through the CMS as content becomes available.
- Run `npm install` in your deployment pipeline to download `vite` before building.
