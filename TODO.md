# TODO

- Wire `npm run test` and `npm run lint:perf` into a CI pipeline (e.g., GitHub Actions) so every CMS commit is validated automatically.
- Add high-resolution PWA icons + splash screens and extend `sw.js` with an offline status page.
- Validate JSON content via a schema (AJV/Zod) before committing to prevent malformed CMS entries.
- Introduce end-to-end smoke tests (Playwright) to cover language switching, FAQ toggles, and Formspree integration.
- Instrument privacy-friendly analytics (e.g., Plausible) and surface metrics inside the CMS dashboard.
