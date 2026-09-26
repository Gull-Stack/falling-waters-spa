#!/usr/bin/env node
// AEO build: ONE source of truth (brand-facts.json) + what is VISIBLE on each page
// → regenerates every page's JSON-LD graph, Open Graph tags, sitemap.xml and llms-full.txt.
// Run:  node scripts/aeo-build.mjs          (rewrites files)
//       node scripts/aeo-build.mjs --check  (fails if committed output is stale)
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const ORIGIN = 'https://www.fallingwatersdayspa.com';
const CHECK = process.argv.includes('--check');
const TODAY = new Date().toISOString().slice(0, 10);

const BF = JSON.parse(readFileSync(join(ROOT, 'brand-facts.json'), 'utf8'));
const DATES_PATH = join(ROOT, 'data/page-dates.json');
const DATES = existsSync(DATES_PATH) ? JSON.parse(readFileSync(DATES_PATH, 'utf8')) : {};

// ---------- helpers ----------
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ', '&rsquo;': '’', '&lsquo;': '‘', '&rdquo;': '”', '&ldquo;': '“', '&mdash;': '—', '&ndash;': '–', '&hellip;': '…' };
export const unescape = (s) => s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, c) => {
  if (ENT[m]) return ENT[m];
  if (c[0] === '#') return String.fromCodePoint(c[1].toLowerCase() === 'x' ? parseInt(c.slice(2), 16) : parseInt(c.slice(1), 10));
  return m;
});
export const strip = (html) => unescape(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
export const visibleText = (html) => strip(html.replace(/^[\s\S]*?<body[^>]*>/i, ''));
const attr = (html, re) => { const m = html.match(re); return m ? unescape(m[1]) : ''; };
const abs = (u) => (u.startsWith('http') ? u : ORIGIN + '/' + u.replace(/^(\.\.\/|\/)+/, ''));
const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 12);

export function listPages() {
  const out = ['index.html', 'about.html'].filter((f) => existsSync(join(ROOT, f)));
  for (const dir of ['services', 'areas', 'blog']) {
    if (!existsSync(join(ROOT, dir))) continue;
    for (const f of readdirSync(join(ROOT, dir)).sort()) if (f.endsWith('.html')) out.push(`${dir}/${f}`);
  }
  return out;
}
export const pageUrl = (file) => {
  if (file === 'index.html') return '/';
  if (file === 'blog/index.html') return '/blog';
  return '/' + file.replace(/\.html$/, '');
};

// ---------- extractors (what the page VISIBLY says) ----------
export function extractFaq(html) {
  const out = [];
  const re = /<div class="faq-item"[^>]*>\s*<h[34][^>]*>([\s\S]*?)<\/h[34]>\s*<p[^>]*>([\s\S]*?)<\/p>/g;
  let m;
  while ((m = re.exec(html))) out.push({ q: strip(m[1]), a: strip(m[2]) });
  return out;
}
export function extractOffers(html) {
  const offers = [];
  let m;
  // service-detail-card: <h3>Name</h3> … <div class="service-price">From $105</div>
  const card = /<div class="service-detail-card[^"]*">([\s\S]*?)<div class="service-price">([\s\S]*?)<\/div>/g;
  while ((m = card.exec(html))) {
    const name = strip((m[1].match(/<h3[^>]*>([\s\S]*?)<\/h3>/) || [])[1] || '');
    const price = (m[2].match(/\$(\d+(?:\.\d+)?)/) || [])[1];
    if (name && price) offers.push({ name, price, from: /from/i.test(m[2]) });
  }
  // waxing price table
  const item = /<span class="price-name">([\s\S]*?)<\/span>\s*<span class="price-amount">([\s\S]*?)<\/span>/g;
  while ((m = item.exec(html))) {
    const price = (m[2].match(/\$(\d+(?:\.\d+)?)/) || [])[1];
    if (price) offers.push({ name: strip(m[1]), price, from: /from|starting/i.test(m[2]) });
  }
  // gift cards
  const gift = /<div class="gift-card">[\s\S]*?<h3>([\s\S]*?)<\/h3>\s*<div class="gift-price">\$(\d+)<\/div>/g;
  while ((m = gift.exec(html))) offers.push({ name: `${strip(m[1])} gift card`, price: m[2], from: false });
  // packages (valentines) and experiences (home)
  const pkg = /<h3 class="package-name">([\s\S]*?)<\/h3>[\s\S]*?<div class="package-price">\$(\d+)<\/div>/g;
  while ((m = pkg.exec(html))) offers.push({ name: strip(m[1]), price: m[2], from: false });
  const exp = /<div class="experience-card">[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<span class="experience-price">Starting at \$(\d+)<\/span>/g;
  while ((m = exp.exec(html))) offers.push({ name: strip(m[1]), price: m[2], from: true });
  // dedupe by name+price
  const seen = new Set();
  return offers.filter((o) => { const k = o.name + '|' + o.price; if (seen.has(k)) return false; seen.add(k); return true; });
}
const firstContentImage = (html) => {
  const body = html.replace(/^[\s\S]*?<body[^>]*>/i, '');
  const re = /<img[^>]+src="([^"]+)"/g; let m;
  while ((m = re.exec(body))) { if (!/logo/i.test(m[1])) return abs(m[1]); }
  return abs('assets/images/services/girls-day.jpg');
};

// ---------- schema nodes ----------
const DAYS = { monday: 'Monday', tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday', saturday: 'Saturday', sunday: 'Sunday' };
export function openingHours() {
  const groups = {};
  for (const [d, h] of Object.entries(BF.hours)) { if (/closed/i.test(h)) continue; (groups[h] ||= []).push(DAYS[d]); }
  return Object.entries(groups).map(([h, days]) => ({ '@type': 'OpeningHoursSpecification', dayOfWeek: days, opens: h.split('-')[0], closes: h.split('-')[1] }));
}
export const BUSINESS_ID = ORIGIN + '/#business';
function businessNode(full, areaCity) {
  const n = {
    '@type': BF.type || 'DaySpa', '@id': BUSINESS_ID, name: BF.name, url: BF.url, telephone: BF.telephone,
    address: { '@type': 'PostalAddress', streetAddress: BF.location.streetAddress, addressLocality: BF.location.addressLocality, addressRegion: BF.location.addressRegion, postalCode: BF.location.postalCode, addressCountry: BF.location.addressCountry },
  };
  if (!full) return n;
  Object.assign(n, {
    alternateName: 'Falling Waters Day Spa', description: BF.description, email: BF.email, foundingDate: BF.founded, priceRange: BF.priceRange,
    image: [abs('assets/images/logo.png'), abs('assets/images/services/girls-day.jpg')], logo: abs('assets/images/logo.png'),
    geo: { '@type': 'GeoCoordinates', latitude: BF.geo.latitude, longitude: BF.geo.longitude },
    openingHoursSpecification: openingHours(), sameAs: BF.sameAs,
    areaServed: (areaCity ? [areaCity] : BF.serviceArea.filter((c) => !/greater/i.test(c))).map((c) => ({ '@type': 'City', name: c })),
    containedInPlace: { '@type': 'Place', name: 'Treehouse Athletic Club', address: { '@type': 'PostalAddress', streetAddress: BF.location.streetAddress, addressLocality: BF.location.addressLocality, addressRegion: BF.location.addressRegion, postalCode: BF.location.postalCode } },
    potentialAction: { '@type': 'ReserveAction', target: { '@type': 'EntryPoint', urlTemplate: BF.bookingUrl, actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'] }, result: { '@type': 'Reservation', name: 'Spa appointment' } },
  });
  if (BF.credentials?.length) n.hasCredential = BF.credentials.map((c) => ({ '@type': 'EducationalOccupationalCredential', name: c }));
  if (BF.socialProof?.ratingValue && BF.socialProof?.reviewCount) n.aggregateRating = { '@type': 'AggregateRating', ratingValue: String(BF.socialProof.ratingValue), reviewCount: String(BF.socialProof.reviewCount), bestRating: '5', worstRating: '1' };
  return n;
}
const breadcrumb = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ORIGIN + url })) });
const offerNodes = (offers) => offers.map((o) => ({ '@type': 'Offer', name: o.name, price: o.price, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: BF.bookingUrl, ...(o.from ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: o.price, priceCurrency: 'USD' } } : {}) }));
const faqNode = (faq) => ({ '@type': 'FAQPage', mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })) });

// ---------- per-page build ----------
export function buildGraph(file, html, dates) {
  const url = pageUrl(file);
  const full = ORIGIN + (url === '/' ? '/' : url);
  const title = attr(html, /<title>([\s\S]*?)<\/title>/);
  const desc = attr(html, /<meta name="description" content="([^"]*)"/);
  const h1 = strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || title);
  const faq = extractFaq(html);
  const offers = extractOffers(html);
  const image = attr(html, /property="og:image" content="([^"]*)"/) || firstContentImage(html);
  const words = visibleText(html).split(' ').length;
  const graph = [];
  const section = file.split('/')[0];

  if (file === 'index.html') {
    graph.push(businessNode(true));
    graph.push({ '@type': 'WebSite', '@id': ORIGIN + '/#website', url: ORIGIN + '/', name: BF.name, publisher: { '@id': BUSINESS_ID }, inLanguage: 'en-US' });
    if (offers.length) graph.push({ '@type': 'OfferCatalog', name: 'Signature Spa Packages', url: full + '#experiences', itemListElement: offerNodes(offers) });
  } else if (file === 'about.html') {
    graph.push({ '@type': 'AboutPage', '@id': full + '#webpage', url: full, name: title, description: desc, about: { '@id': BUSINESS_ID }, isPartOf: { '@id': ORIGIN + '/#website' } });
    graph.push(businessNode(true));
    graph.push(breadcrumb([['Home', '/'], ['About', url]]));
  } else if (section === 'services') {
    const svc = { '@type': 'Service', '@id': full + '#service', name: h1, serviceType: h1.replace(/\s+in\s+Draper.*$/i, '').replace(/\s*\|.*$/, ''), description: desc, url: full, image, provider: { '@id': BUSINESS_ID }, areaServed: BF.serviceArea.filter((c) => !/greater/i.test(c)).map((c) => ({ '@type': 'City', name: c })) };
    if (offers.length) svc.hasOfferCatalog = { '@type': 'OfferCatalog', name: `${svc.serviceType} pricing`, itemListElement: offerNodes(offers) };
    graph.push(svc, businessNode(false), breadcrumb([['Home', '/'], ['Services', '/#services'], [svc.serviceType, url]]));
  } else if (section === 'areas') {
    const city = h1.match(/(?:in|near)\s+([A-Z][A-Za-z ]+?),/)?.[1] || file.replace(/^areas\//, '').replace(/\.html$/, '').replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    graph.push({ '@type': 'WebPage', '@id': full + '#webpage', url: full, name: title, description: desc, about: { '@id': BUSINESS_ID }, isPartOf: { '@id': ORIGIN + '/#website' } });
    graph.push(businessNode(true, city));
    graph.push(breadcrumb([['Home', '/'], [`Spa near ${city}`, url]]));
  } else if (file === 'blog/index.html') {
    graph.push({ '@type': 'Blog', '@id': full + '#blog', url: full, name: title, description: desc, publisher: { '@id': BUSINESS_ID } });
    graph.push(businessNode(false), breadcrumb([['Home', '/'], ['Blog', url]]));
  } else if (section === 'blog') {
    const d = dates[url] || {};
    graph.push({ '@type': 'BlogPosting', '@id': full + '#article', headline: h1, description: desc, url: full, mainEntityOfPage: full, image, datePublished: d.published || TODAY, dateModified: d.modified || TODAY, wordCount: words, inLanguage: 'en-US', author: { '@id': BUSINESS_ID }, publisher: { '@id': BUSINESS_ID } });
    graph.push(businessNode(false), breadcrumb([['Home', '/'], ['Blog', '/blog'], [h1, url]]));
  }
  if (faq.length) graph.push(faqNode(faq));
  return { url, full, title, desc, image, graph };
}

// strip legacy/previous schema + our marker block; returns "source" html (used for hashing too)
const LEGACY = /[ \t]*<!--\s*[^>]*Schema[^>]*-->\s*\n?[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*\n?|[ \t]*<script type="application\/ld\+json">[\s\S]*?<\/script>\s*\n?/g;
const MARKED = /[ \t]*<!-- aeo:schema -->[\s\S]*?<!-- \/aeo:schema -->\s*\n?/g;
export const sourceHtml = (html) => html.replace(MARKED, '').replace(LEGACY, '');

function ensureOg(html, p) {
  const has = (prop) => new RegExp(`property="${prop}"`).test(html);
  const add = [];
  if (!has('og:type')) add.push(`<meta property="og:type" content="${p.url.startsWith('/blog/') ? 'article' : 'website'}">`);
  if (!has('og:url')) add.push(`<meta property="og:url" content="${p.full}">`);
  if (!has('og:title')) add.push(`<meta property="og:title" content="${p.title.replace(/"/g, '&quot;')}">`);
  if (!has('og:description')) add.push(`<meta property="og:description" content="${p.desc.replace(/"/g, '&quot;')}">`);
  if (!has('og:image')) add.push(`<meta property="og:image" content="${p.image}">`);
  if (!has('og:site_name')) add.push(`<meta property="og:site_name" content="${BF.name.replace(/&/g, '&amp;')}">`);
  if (!/name="twitter:card"/.test(html)) add.push(`<meta name="twitter:card" content="summary_large_image">`);
  if (!/name="twitter:image"/.test(html)) add.push(`<meta name="twitter:image" content="${p.image}">`);
  if (!add.length) return html;
  const block = `  <!-- aeo:og -->\n  ${add.join('\n  ')}\n  <!-- /aeo:og -->\n`;
  return html.replace(/<link rel="canonical"[^>]*>\n?/, (m) => m + block);
}

// ---------- main ----------
const IS_MAIN = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (IS_MAIN) main();
function main() {
const pages = listPages();
const built = [];
let stale = [];
const newDates = {};
for (const file of pages) {
  const path = join(ROOT, file);
  const original = readFileSync(path, 'utf8');
  let html = sourceHtml(original).replace(/[ \t]*<!-- aeo:og -->[\s\S]*?<!-- \/aeo:og -->\s*\n?/g, '');
  const url = pageUrl(file);
  const hash = sha(html);
  const prev = DATES[url] || {};
  newDates[url] = { published: prev.published || TODAY, modified: prev.hash === hash ? prev.modified || TODAY : TODAY, hash };
  const p = buildGraph(file, html, newDates);
  html = ensureOg(html, p);
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': p.graph }, null, 2).replace(/\n/g, '\n  ');
  const block = `  <!-- aeo:schema -->\n  <script type="application/ld+json">\n  ${json}\n  </script>\n  <!-- /aeo:schema -->\n`;
  html = html.replace(/<\/head>/, block + '</head>');
  built.push({ file, ...p, faq: extractFaq(html), offers: extractOffers(html) });
  if (html !== original) { stale.push(file); if (!CHECK) writeFileSync(path, html); }
}

// sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  built.map((p) => `  <url>\n    <loc>${p.full}</loc>\n    <lastmod>${newDates[p.url].modified}</lastmod>\n  </url>`).join('\n') + '\n</urlset>\n';
// llms-full.txt
const hoursLine = Object.entries(BF.hours).map(([d, h]) => `${DAYS[d]}: ${/closed/i.test(h) ? 'Closed' : h.replace('-', ' to ')}`).join('; ');
let llmsFull = `# ${BF.name} — full reference for AI systems\n\n> ${BF.description}\n\n## Facts (source of truth: ${ORIGIN}/brand-facts.json)\n- Name: ${BF.name}\n- Founded: ${BF.founded}\n- Address: ${BF.location.streetAddress}, ${BF.location.addressLocality}, ${BF.location.addressRegion} ${BF.location.postalCode} (${BF.location.landmark})\n- Phone: ${BF.telephone}\n- Email: ${BF.email}\n- Hours: ${hoursLine}\n- Booking: ${BF.bookingUrl}\n- Price range: ${BF.priceRange}\n- Service area: ${BF.serviceArea.join(', ')}\n- Member offer: ${BF.memberOffer.discount} for ${BF.memberOffer.program}\n${BF.credentials?.length ? `- Credentials: ${BF.credentials.join('; ')}\n` : ''}- Last updated: ${Object.values(newDates).map((d) => d.modified).sort().pop()}\n\n## Services\n${BF.services.map((s) => `- ${s}`).join('\n')}\n\n## Pages\n`;
for (const p of built) {
  llmsFull += `\n### ${p.title}\n- URL: ${p.full}\n- Summary: ${p.desc}\n`;
  if (p.offers.length) llmsFull += `- Prices: ${p.offers.map((o) => `${o.name} ${o.from ? 'from ' : ''}$${o.price}`).join('; ')}\n`;
  for (const f of p.faq) llmsFull += `- Q: ${f.q}\n  A: ${f.a}\n`;
}
llmsFull += `\n## Accuracy notes\n- Every price and FAQ above is copied from the visible page it belongs to; the page is the source.\n- Rating/review figures come from ${BF.socialProof.ratingSource}.\n`;

const outputs = { 'sitemap.xml': sitemap, 'llms-full.txt': llmsFull, 'data/page-dates.json': JSON.stringify(newDates, null, 2) + '\n' };
for (const [f, content] of Object.entries(outputs)) {
  const path = join(ROOT, f);
  const cur = existsSync(path) ? readFileSync(path, 'utf8') : '';
  // page-dates changes only when a page's source changed; a fresh TODAY stamp alone is not staleness in --check
  const same = f === 'data/page-dates.json' ? JSON.stringify(Object.fromEntries(Object.entries(newDates).map(([k, v]) => [k, v.hash]))) === JSON.stringify(Object.fromEntries(Object.entries(DATES).map(([k, v]) => [k, v.hash]))) : cur === content;
  if (!same) { stale.push(f); if (!CHECK) { mkdirSync(join(ROOT, 'data'), { recursive: true }); writeFileSync(path, content); } }
}
if (CHECK) {
  const real = stale.filter((f) => f !== 'sitemap.xml' || !existsSync(join(ROOT, 'sitemap.xml')));
  if (real.length) { console.error(`aeo-build --check: ${real.length} file(s) not regenerated — run \`node scripts/aeo-build.mjs\` and commit:\n  ${real.join('\n  ')}`); process.exit(1); }
  console.log(`aeo-build --check: ${pages.length} pages current`);
} else {
  console.log(`aeo-build: ${pages.length} pages, ${stale.length} file(s) written`);
}
}
