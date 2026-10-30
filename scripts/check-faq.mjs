// Fails the deploy when the visible FAQ in index.html and its FAQPage JSON-LD drift apart.
// Run from the repo root: node scripts/check-faq.mjs (also the first half of the wrangler.jsonc build).
import { readFileSync } from 'node:fs';

// Comments dropped first: the shape note above the FAQ in index.html would otherwise parse as a question.
const html = readFileSync('index.html', 'utf8').replace(/<!--[\s\S]*?-->/g, '');
// Only the words have to match: tags dropped, quotes and whitespace normalized.
const norm = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();

const visible = [...html.matchAll(/<details\s+class=["']faq["'][^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/details>/g)]
  .map(([, q, a]) => [norm(q), norm(a)]);

const faqPage = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map(([, json]) => JSON.parse(json))
  .find((d) => d['@type'] === 'FAQPage');
const schema = (faqPage ? faqPage.mainEntity : []).map((q) => [norm(q.name), norm(q.acceptedAnswer.text)]);

// An empty match on both sides means the markup contract broke, not that they agree.
if (!visible.length || JSON.stringify(visible) !== JSON.stringify(schema)) {
  console.error('FAQ and FAQPage JSON-LD differ.\nVisible:', visible, '\nJSON-LD:', schema);
  process.exit(1);
}
console.log(`FAQ ok: ${visible.length} questions match the JSON-LD.`);
