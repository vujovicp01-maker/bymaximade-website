// Builds sitemap.xml from the public HTML pages at the repo root. No dependencies.
//   node scripts/build-sitemap.mjs            (CI runs it on every push to main)
// - URL: each page's <link rel="canonical">. Required, so a page without one fails the build.
// - Skipped: pages with <meta name="robots" content="noindex">, 404.html, files in .assetsignore.
// - lastmod: date of the last commit that changed the page's content. Cache-busting
//   ?v= bumps on the CSS/JS links don't count, so they don't make every page look new.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const ORIGIN = 'https://bymaximade.com';
const today = () => new Date().toISOString().slice(0, 10);
const git = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 << 20 });
const norm = (html) => html.replace(/\r\n/g, '\n').replace(/\?v=\d+/g, '');
const show = (rev, file) => { try { return git('show', `${rev}:${file}`); } catch { return null; } };

const ignored = new Set(readFileSync('.assetsignore', 'utf8').split(/\r?\n/).map((s) => s.trim()).filter(Boolean));

function lastChanged(file) {
  const current = norm(readFileSync(file, 'utf8'));
  const head = show('HEAD', file);
  if (head === null || norm(head) !== current) return today(); // new or edited but not committed yet
  for (const line of git('log', '--format=%H %cs', '--', file).trim().split('\n')) {
    const [hash, date] = line.split(' ');
    const before = show(`${hash}^`, file);
    if (before === null || norm(before) !== norm(show(hash, file) ?? '')) return date;
  }
  return today();
}

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return m ? m[1] : null;
}

const pages = [];
for (const file of readdirSync('.').filter((f) => f.endsWith('.html')).sort()) {
  if (ignored.has(file) || file === '404.html') continue;
  const html = readFileSync(file, 'utf8');
  const metas = html.match(/<meta\b[^>]*>/gi) || [];
  if (metas.some((t) => /^robots$/i.test(attr(t, 'name') || '') && /noindex/i.test(attr(t, 'content') || ''))) continue;

  const link = (html.match(/<link\b[^>]*>/gi) || []).find((t) => /^canonical$/i.test(attr(t, 'rel') || ''));
  const loc = link && attr(link, 'href');
  if (!loc) throw new Error(`${file}: missing <link rel="canonical">`);
  const path = loc.startsWith(ORIGIN + '/') ? loc.slice(ORIGIN.length) : null;
  if (!path || path.endsWith('.html') || (path !== '/' && path.endsWith('/'))) {
    throw new Error(`${file}: canonical must be ${ORIGIN}/... without www, .html or a trailing slash (got ${loc})`);
  }
  pages.push({ loc, lastmod: lastChanged(file) });
}

pages.sort((a, b) => (a.loc === ORIGIN + '/' ? -1 : b.loc === ORIGIN + '/' ? 1 : a.loc.localeCompare(b.loc)));
const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + pages.map((p) => `  <url><loc>${p.loc}</loc><lastmod>${p.lastmod}</lastmod></url>\n`).join('')
  + '</urlset>\n';

if (!existsSync('sitemap.xml') || readFileSync('sitemap.xml', 'utf8') !== xml) writeFileSync('sitemap.xml', xml);
process.stdout.write(xml);
