import { defineConfig } from 'vite';
import { publicAnalyticsPlugin } from './scripts/public-analytics-plugin.mjs';
import preact from '@preact/preset-vite';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig({
  plugins: [preact(), publicAnalyticsPlugin()],
  envPrefix: ['VITE_', 'STABLESENSE_'],
  define: { __APP_VERSION__: JSON.stringify('v' + pkg.version) },
});
