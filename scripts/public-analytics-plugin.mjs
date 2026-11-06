// Deployment-owned analytics: no tracker is included in an unconfigured checkout.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const snippet = fileURLToPath(new URL('.analytics-head.local.html', root));
const publicPages = new Set(['index.html', 'research/index.html', 'research/changelog/index.html']
  .map(file => fileURLToPath(new URL(file, root))));

export function publicAnalyticsPlugin() {
  return {
    name: 'deployment-public-analytics',
    apply: (_config, { command, mode }) => command === 'build' && mode === 'production',
    transformIndexHtml: {
      order: 'post',
      handler(html, context) {
        if (!publicPages.has(context.filename) || !existsSync(snippet)) return html;
        const tag = readFileSync(snippet, 'utf8').trim();
        const match = tag.match(/^<script defer src="(https:\/\/stats\.withkeshav\.com\/script\.js\?siteId=[a-f0-9-]{36})"><\/script>$/i);
        if (!match) throw new Error('Invalid deployment analytics tag in .analytics-head.local.html');
        if (html.includes('stats.withkeshav.com/script.js')) throw new Error('Duplicate analytics tracker');
        return [{ tag: 'script', attrs: { defer: true, src: match[1] }, injectTo: 'head' }];
      },
    },
  };
}
