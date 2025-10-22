const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', 'admin');
const outputDir = path.resolve(__dirname, '..', 'dist', 'admin');

function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

if (!fs.existsSync(sourceDir)) {
  console.warn('Admin directory not found, skipping copy.');
  process.exit(0);
}

if (fs.existsSync(outputDir)) {
  fs.rmSync(outputDir, { recursive: true, force: true });
}

copyDirectory(sourceDir, outputDir);
console.log('Admin dashboard copied to dist/admin');
