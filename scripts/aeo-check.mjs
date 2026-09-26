#!/usr/bin/env node
// AEO gate. Fails (exit 1) when a page's machine layer disagrees with what a visitor sees,
// when a fact drifts from brand-facts.json, or when leftover template content is reachable.
// Run: node scripts/aeo-check.mjs [--live https://host]   (--live audits the deployed pages instead of the files)
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { listPages, pageUrl, extractFaq, extractOffers, visibleText, strip, unescape } from './aeo-build.mjs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const BF = JSON.parse(readFileSync(join(ROOT, 'brand-facts.json'), 'utf8'));
const liveIdx = process.argv.indexOf('--live');
const LIVE = liveIdx > -1 ? process.argv[liveIdx + 1].replace(/\/$/, '') : null;
const ORIGIN = 'https://www.fallingwatersdayspa.com';

const fails = [];
const warns = [];
const fail = (file, msg) => fails.push(`${file}: ${msg}`);
const warn = (file, msg) => warns.push(`${file}: ${msg}`);
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// allowed clock times, derived from brand-facts hours (e.g. 09:00-18:00 → 9am, 6pm)
const to12 = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); const ap = h >= 12 ? 'pm' : 'am'; const hh = h % 12 || 12; return m ? `${hh}:${String(m).padStart(2, '0')}${ap}` : `${hh}${ap}`; };
const ALLOWED_TIMES = new Set();
for (const h of Object.values(BF.hours)) if (!/closed/i.test(h)) h.split('-').forEach((t) => ALLOWED_TIMES.add(to12(t)));
const CLOSED_DAYS = Object.entries(BF.hours).filter(([, h]) => /closed/i.test(h)).map(([d]) => d.slice(0, 3));
const phoneDigits = BF.telephone.replace(/\D/g, '').slice(-10);

async function load(file) {
  if (!LIVE) return readFileSync(join(ROOT, file), 'utf8');
  const r = await fetch(LIVE + pageUrl(file), { redirect: 'manual' });
  if (r.status !== 200) { fail(file, `live status ${r.status}`); return ''; }
  return await r.text();
}

const pages = listPages();
const sitemapText = LIVE ? await (await fetch(LIVE + '/sitemap.xml')).text() : readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemapText.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

for (const file of pages) {
  const html = await load(file);
  if (!html) continue;
  const url = pageUrl(file);
  const full = ORIGIN + (url === '/' ? '/' : url);
  const text = visibleText(html);
  const ntext = norm(text);

  // 1. exactly one JSON-LD block, valid, a graph
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  if (blocks.length !== 1) fail(file, `${blocks.length} JSON-LD blocks (want exactly 1 generated block)`);
  let graph = [];
  try { const d = JSON.parse(blocks[0] || '{}'); graph = d['@graph'] || []; if (!graph.length) fail(file, 'JSON-LD has no @graph'); } catch (e) { fail(file, `JSON-LD invalid: ${e.message}`); }
  const types = graph.map((n) => n['@type']);

  // 2. FAQ schema ⇔ visible FAQ, same questions
  const faqVisible = extractFaq(html);
  const faqNode = graph.find((n) => n['@type'] === 'FAQPage');
  if (faqNode && !faqVisible.length) fail(file, 'FAQPage schema but no visible FAQ');
  if (faqVisible.length && !faqNode) fail(file, 'visible FAQ but no FAQPage schema');
  if (faqNode && faqVisible.length) {
    const s = faqNode.mainEntity.map((q) => norm(q.name)).sort().join('|');
    const v = faqVisible.map((q) => norm(q.q)).sort().join('|');
    if (s !== v) fail(file, 'FAQPage questions differ from the visible FAQ');
  }

  // 3. every Offer price is on the page
  for (const n of graph) {
    const items = n.hasOfferCatalog?.itemListElement || (n['@type'] === 'OfferCatalog' ? n.itemListElement : []);
    for (const o of items || []) if (!text.includes(`$${o.price}`)) fail(file, `Offer "${o.name}" $${o.price} not visible on page`);
  }
  if (extractOffers(html).length && !graph.some((n) => n.hasOfferCatalog || n['@type'] === 'OfferCatalog')) fail(file, 'visible prices but no Offer schema');

  // 4. business facts on every page equal brand-facts
  const biz = graph.find((n) => n['@id'] === ORIGIN + '/#business');
  if (!biz) fail(file, 'no business node');
  else {
    if (biz.name !== BF.name) fail(file, `business name "${biz.name}"`);
    if (biz.telephone !== BF.telephone) fail(file, `business phone "${biz.telephone}"`);
    if (biz.address?.streetAddress !== BF.location.streetAddress || biz.address?.postalCode !== BF.location.postalCode) fail(file, 'business address differs from brand-facts');
    if (biz.openingHoursSpecification) for (const s of biz.openingHoursSpecification) if (!Object.values(BF.hours).includes(`${s.opens}-${s.closes}`)) fail(file, `schema hours ${s.opens}-${s.closes} not in brand-facts`);
  }

  // 5. visible hours phrases only use brand-facts times; closed days never carry a time
  for (const m of text.matchAll(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b[^.|]{0,80}/gi)) {
    if (!/\d{1,2}(?::\d{2})?\s?[ap]m/i.test(m[0])) continue;
    const phrase = m[0];
    for (const t of phrase.matchAll(/\d{1,2}(?::\d{2})?\s?[ap]m/gi)) {
      const tt = t[0].replace(/\s/g, '').toLowerCase();
      if (!ALLOWED_TIMES.has(tt)) fail(file, `hours phrase "${phrase}" uses ${tt}, not in brand-facts`);
    }
    for (const d of CLOSED_DAYS) if (new RegExp(`\\b${d}[a-z]*\\b[^.|]{0,20}\\d{1,2}\\s?[ap]m`, 'i').test(phrase) && !/closed/i.test(phrase)) fail(file, `"${phrase}" gives hours on a closed day`);
  }

  // 6. NAP visible
  if (!text.replace(/\D/g, '').includes(phoneDigits)) fail(file, 'phone not visible');
  if (!ntext.includes(norm(BF.location.streetAddress))) fail(file, 'street address not visible');

  // 7. head hygiene
  const title = unescape((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '');
  const desc = unescape((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1];
  if (canonical !== full) fail(file, `canonical "${canonical}" ≠ ${full}`);
  if (!title) fail(file, 'no title'); else if (title.length > 60) fail(file, `title ${title.length} chars (max 60): "${title}"`);
  if (!desc) fail(file, 'no meta description'); else if (desc.length < 100 || desc.length > 160) fail(file, `meta description ${desc.length} chars (want 100–160)`);
  if ((html.match(/<h1\b/g) || []).length !== 1) fail(file, `${(html.match(/<h1\b/g) || []).length} H1s`);
  for (const p of ['og:title', 'og:description', 'og:image', 'og:url']) if (!new RegExp(`property="${p}"`).test(html)) fail(file, `missing ${p}`);
  if (/name="robots"[^>]*noindex/.test(html)) fail(file, 'noindex on an indexable page');

  // 8. leftover template content must be gone
  for (const bad of ['Plastic Surgery', 'Dr. Jane', 'premierplasticsurgery', 'Beverly Hills', 'mommy-makeover', '../about.html', '../contact.html', '../gallery.html', 'placehold.co']) if (html.includes(bad)) fail(file, `leftover template string "${bad}"`);

  // 9. local assets/links exist (file mode)
  if (!LIVE) {
    for (const m of html.matchAll(/(?:src|href)="([^"#?]+)(?:[#?][^"]*)?"/g)) {
      const ref = m[1];
      if (/^(https?:|mailto:|tel:|data:|\/\/)/.test(ref)) continue;
      const target = ref.startsWith('/') ? join(ROOT, ref) : join(ROOT, dirname(file), ref);
      const ok = existsSync(target) || existsSync(target + '.html') || existsSync(join(target, 'index.html'));
      if (!ok) fail(file, `broken local ref ${ref}`);
    }
  }

  // 10. sitemap membership
  if (!sitemapUrls.includes(full)) fail(file, 'not in sitemap');

  // 11. thin commercial page
  if (/^(services|areas)\//.test(file) && text.split(' ').length < 300) warn(file, `thin: ${text.split(' ').length} words`);
}

// site-level
for (const u of sitemapUrls) if (!pages.map((f) => ORIGIN + (pageUrl(f) === '/' ? '/' : pageUrl(f))).includes(u)) fail('sitemap.xml', `lists ${u} which is not a built page`);
const llms = LIVE ? await (await fetch(LIVE + '/llms.txt')).text() : readFileSync(join(ROOT, 'llms.txt'), 'utf8');
for (const m of llms.matchAll(/\d{1,2}(?::\d{2})?\s?[ap]m/gi)) if (!ALLOWED_TIMES.has(m[0].replace(/\s/g, '').toLowerCase())) fail('llms.txt', `hours time ${m[0]} not in brand-facts`);
if (!llms.includes(BF.telephone.replace('+1-', '(').replace('-', ') ')) && !llms.includes(BF.telephone)) fail('llms.txt', 'phone differs from brand-facts');
if (LIVE) {
  for (const p of ['/llms-full.txt', '/brand-facts.json', '/.well-known/brand-facts.json', '/robots.txt']) { const r = await fetch(LIVE + p); if (r.status !== 200) fail(p, `live status ${r.status}`); }
  for (const p of ['/contact', '/gallery', '/services/mommy-makeover']) { const r = await fetch(LIVE + p, { redirect: 'manual' }); if (r.status === 200) fail(p, 'leftover template page still served'); }
}

for (const w of warns) console.log('WARN ' + w);
if (fails.length) { console.error(`\naeo-check: ${fails.length} failure(s)\n  ` + fails.join('\n  ')); process.exit(1); }
console.log(`aeo-check: ${pages.length} pages pass${LIVE ? ' (live: ' + LIVE + ')' : ''}${warns.length ? `, ${warns.length} warning(s)` : ''}`);
