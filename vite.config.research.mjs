import { defineConfig } from 'vite';
import pkg from './package.json' assert { type: 'json' };
import { contributorsPlugin } from './scripts/research-contributors-plugin.mjs';

// Separate build for the /research hub. The hub is a standalone static page
// (not a Preact route) for SEO: every section renders as real HTML so crawlers
// get the full text without executing JS. main.js is a progressive-enhancement
// layer (counter, scroll reveals, charts, chips, calculator) that sits on top.
export default defineConfig({
  root: 'research',
  base: '/research/',
  publicDir: 'public',
  plugins: [contributorsPlugin()],
  // Derive the hub build marker from package.json rather than hand-editing it.
  // It previously lived as a literal in data.js and silently drifted two
  // releases behind the app version, so the footer badge lied about which
  // build was deployed.
  define: { __HUB_BUILD__: JSON.stringify('v' + pkg.version) },
  build: {
    outDir: '../dist/research',
    emptyOutDir: true,
    assetsInlineLimit: 100000000, // inline CSS into the HTML for first paint
    rollupOptions: {
      input: {
        hub: 'research/index.html',
        changelog: 'research/changelog/index.html',
      },
      output: {
        // keep the og image as a stable, hashed asset instead of inlining it
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});