// Apache-2.0. The research build generates public credit and badges together.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { renderContributors } from '../src/lib/research-contributors.js';

const defaultRegistry = fileURLToPath(new URL('../research/contributors.json', import.meta.url));
const marker = '<!-- contributor-records -->';

export function contributorsPlugin(registry = defaultRegistry) {
  let snapshot;
  let development = false;
  const load = () => renderContributors(JSON.parse(readFileSync(registry, 'utf8')));
  return {
    name: 'stablesense-research-contributors',
    buildStart() {
      this.addWatchFile(registry);
      snapshot = load();
    },
    transformIndexHtml(html) {
      if (!html.includes(marker)) throw new Error('Missing contributor HTML marker');
      if (development || !snapshot) snapshot = load();
      return html.replace(marker, () => snapshot.html);
    },
    generateBundle() {
      for (const [name, source] of Object.entries(snapshot.badges)) {
        this.emitFile({ type: 'asset', fileName: `badges/${name}`, source });
      }
    },
    configureServer(server) {
      development = true;
      server.watcher.add(registry);
      server.watcher.on('change', path => {
        if (path === registry) server.ws.send({ type: 'full-reload' });
      });
      server.middlewares.use((request, response, next) => {
        const path = new URL(request.url, 'http://localhost').pathname;
        const prefix = path.startsWith('/research/badges/') ? '/research/badges/' : '/badges/';
        if (!path.startsWith(prefix)) return next();
        try {
          const badges = load().badges;
          const name = path.slice(prefix.length);
          const badge = Object.hasOwn(badges, name) ? badges[name] : undefined;
          response.setHeader('Cache-Control', 'no-cache');
          response.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
          response.statusCode = badge ? 200 : 404;
          response.end(badge || 'Badge not found');
        } catch (error) {
          next(error);
        }
      });
    },
  };
}
