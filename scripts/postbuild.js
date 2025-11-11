const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');
const adminSourceDir = path.join(projectRoot, 'admin');
const adminOutputDir = path.join(distDir, 'admin');
const contentSourceDir = path.join(projectRoot, 'content');
const contentOutputDir = path.join(distDir, 'content');
const staticFiles = ['robots.txt'];

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

function safeCopyDirectory(src, dest, label) {
  if (!fs.existsSync(src)) {
    console.warn(`${label} directory not found, skipping copy.`);
    return;
  }
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDirectory(src, dest);
  const relative = path.relative(projectRoot, dest);
  console.log(`${label} copied to ${relative}`);
}

function safeCopyFile(filename, label) {
  const src = path.join(projectRoot, filename);
  const dest = path.join(distDir, filename);
  if (!fs.existsSync(src)) {
    console.warn(`${label} file not found, skipping copy.`);
    return;
  }
  fs.copyFileSync(src, dest);
  const relative = path.relative(projectRoot, dest);
  console.log(`${label} copied to ${relative}`);
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

safeCopyDirectory(adminSourceDir, adminOutputDir, 'Admin dashboard');
safeCopyDirectory(contentSourceDir, contentOutputDir, 'Content JSON');
staticFiles.forEach(file => safeCopyFile(file, file));
