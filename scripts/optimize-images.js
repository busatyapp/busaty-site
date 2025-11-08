const path = require('path');
const fs = require('fs');
const fg = require('fast-glob');
const sharp = require('sharp');

async function optimize() {
  const patterns = ['public/assets/images/**/*.{png,jpg,jpeg}'];
  const files = await fg(patterns, { ignore: ['**/*.webp', '**/*.avif'] });

  if (!files.length) {
    console.log('No raster images found, skipping optimisation.');
    return;
  }

  await Promise.all(
    files.map(async file => {
      const source = path.resolve(file);
      const webpTarget = source.replace(/\.(png|jpe?g)$/i, '.webp');
      const avifTarget = source.replace(/\.(png|jpe?g)$/i, '.avif');

      try {
        await sharp(source).webp({ quality: 80 }).toFile(webpTarget);
        await sharp(source).avif({ quality: 60 }).toFile(avifTarget);
        const stats = fs.statSync(source);
        console.log(`Optimised ${path.relative(process.cwd(), source)} (${Math.round(stats.size / 1024)} kB)`);
      } catch (error) {
        console.warn(`Failed to optimise ${file}`, error.message);
      }
    })
  );
}

optimize();
