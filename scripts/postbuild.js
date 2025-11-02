const fs = require("fs");
const path = require("path");

const adminSourceDir = path.resolve(__dirname, "..", "admin");
const adminOutputDir = path.resolve(__dirname, "..", "dist", "admin");
const contentSourceDir = path.resolve(__dirname, "..", "content");
const contentOutputDir = path.resolve(__dirname, "..", "dist", "content");

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

function safeCopy(src, dest, label) {
  if (!fs.existsSync(src)) {
    console.warn(`${label} directory not found, skipping copy.`);
    return;
  }
  if (fs.existsSync(dest)) {
    fs.rmSync(dest, { recursive: true, force: true });
  }
  copyDirectory(src, dest);
  const relative = path.relative(path.resolve(__dirname, ".."), dest);
  console.log(`${label} copied to ${relative}`);
}

safeCopy(adminSourceDir, adminOutputDir, "Admin dashboard");
safeCopy(contentSourceDir, contentOutputDir, "Content JSON");
