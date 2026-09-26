# AEO system: one source of truth, one gate

**Why this exists.** On 25 Sep 2026 the live site carried three different sets of opening hours,
FAQ schema on nine pages whose questions were not on the page, no Offer schema for anything it sells,
and four leftover plastic-surgery template pages. Each page carried its own hand-written JSON-LD, so
every fix had to be made 25 times and drifted again. The audit scored 23/45.

## The rule

A page never states a business fact twice. The **visible page** is the source for what that page
sells and answers; `brand-facts.json` is the source for who the business is. Everything machine-readable
is generated from those two.

| Generated from `brand-facts.json` | Generated from the visible page |
|---|---|
| business node (name, phone, address, geo, hours, founded, sameAs, credentials, rating) | `FAQPage` from `.faq-item` blocks |
| `WebSite`, breadcrumbs, `areaServed` | `Offer` catalog from `.service-price`, `.price-item`, `.gift-price`, `.package-price`, `.experience-price` |
| `llms-full.txt` facts header | `BlogPosting` headline, word count, image |
| | Open Graph fallbacks (title, description, first content image) |

## Commands

```
node scripts/aeo-build.mjs            # regenerate JSON-LD, OG tags, sitemap.xml, llms-full.txt, data/page-dates.json
node scripts/aeo-build.mjs --check    # CI: fail if the committed output is stale
node scripts/aeo-check.mjs            # CI: fail on any schema/page disagreement
node scripts/aeo-check.mjs --live https://www.fallingwatersdayspa.com   # same checks against the deployed site
```

## What the gate refuses

- more or fewer than one JSON-LD block per page, or invalid JSON
- `FAQPage` without a visible FAQ, a visible FAQ without `FAQPage`, or different questions
- an `Offer` whose price string is not on the page, or visible prices with no `Offer`
- a business node whose name, phone, address or hours differ from `brand-facts.json`
- any visible hours phrase using a clock time that is not in `brand-facts.json`, or hours on a closed day
- a page without the phone and street address in its visible text
- title over 60 characters, meta description outside 100 to 160, more or fewer than one H1
- missing canonical, `og:title`, `og:description`, `og:image`, `og:url`
- leftover template strings (plastic surgery, placeholder images), broken local links or images
- a built page missing from the sitemap, or a sitemap URL that is not a built page

## How to change things

- **Hours, phone, address, rating, credentials** → edit `brand-facts.json`, run the build, commit.
  Visible hours text on pages must use the same times or the gate goes red.
- **A price or FAQ** → edit it on the page. The build regenerates the schema. Never edit JSON-LD by hand.
- **A new page** → copy a service page, keep the `.faq-item` and price markup, run the build. It lands in the
  sitemap and `llms-full.txt` automatically. `data/page-dates.json` records its first-published date.
- **`llms.txt`** is hand-written and short; `llms-full.txt` is generated and complete.
