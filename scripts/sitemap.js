const fs = require('fs');
const path = require('path');

const baseUrl = 'https://busaty.org';
const pages = [
  { path: '/', source: 'index.html' },
  { path: '/about.html', source: 'about.html' },
  { path: '/help.html', source: 'help.html' },
  { path: '/terms.html', source: 'terms.html' }
];
const languages = ['ar', 'en', 'fr'];

const distDir = path.resolve(__dirname, '..', 'dist');
const outputFile = path.join(distDir, 'sitemap.xml');

function getLastModified(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function buildUrlEntry(loc, lastmod) {
  return [
    '<url>',
    `<loc>${loc}</loc>`,
    `<lastmod>${lastmod}</lastmod>`,
    '<changefreq>weekly</changefreq>',
    '</url>'
  ].join('');
}

const urlEntries = pages
  .map(({ path: pagePath, source }) => {
    const filePath = path.join(distDir, source);
    const lastmod = getLastModified(filePath);
    return languages.map(langCode => {
      const url = new URL(pagePath, baseUrl);
      url.searchParams.set('lang', langCode);
      return buildUrlEntry(url.toString(), lastmod);
    });
  })
  .flat();

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urlEntries,
  '</urlset>'
].join('');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(outputFile, xml);
console.log(`sitemap.xml generated at ${path.relative(path.resolve(__dirname, '..'), outputFile)}`);
