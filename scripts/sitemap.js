const fs = require('fs');

const pages = ['/', '/about.html', '/help.html', '/terms.html'];
const base = 'https://busaty.org';

const urls = pages
  .map(path => `<url><loc>${base}${path}</loc><changefreq>weekly</changefreq></url>`)
  .join('');

const xml = `<?xml version="1.0" encoding="UTF-8"?>` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;

fs.writeFileSync('sitemap.xml', xml);
console.log('sitemap.xml generated');
