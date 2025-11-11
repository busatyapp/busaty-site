import { defineConfig } from 'vite';
import { resolve } from 'path';

const assetFileNames = assetInfo => {
  const name = assetInfo.name || '';
  const ext = name.split('.').pop();
  if (ext === 'css') {
    return 'assets/[name]-[hash].min.[ext]';
  }
  return 'assets/[name]-[hash].[ext]';
};

export default defineConfig({
  base: '/',
  build: {
    target: 'es2018',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        help: resolve(__dirname, 'help.html'),
        terms: resolve(__dirname, 'terms.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].min.js',
        chunkFileNames: 'assets/[name]-[hash].min.js',
        assetFileNames
      }
    }
  }
});
