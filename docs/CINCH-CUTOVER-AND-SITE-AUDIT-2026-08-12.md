# Falling Waters — Cinch cutover readiness + site audit (2026-08-12)

Four questions were asked. This is the answer to each, with the evidence.

1. Does Falling Waters have its own Cinch instance? — **No.**
2. What did Bryce do on the PPA/Pardoe site that we haven't? — **Track B.**
3. What are the SEO/AEO/visual gaps? — **Track C.**
4. How ready are we to turn Cinch on for the day spa? — **Track A. Not ready.
   The engine is done; the public front door does not exist.**

Mobbin could not be reached — but the benchmark it was meant to source is
delivered from public sites instead. See Track D and **Track E**.

---

## Headline verdict

**The spa's website is in good shape. Cinch is not ready to take its bookings.**

Cinch's appointment engine is genuinely finished — 75KB of engine code with
deposits, buffers, add-ons, waitlist auto-fill, time-off, reschedule, policy
cancels, ICS feeds, booth rent, and idempotent reminder comms. It is the most
complete part of this whole review.

But **a guest cannot book online.** The public booking page is a 404, the
appointment-management link inside every confirmation email is a 404, and the
only working booking route redirects to a login screen. Roughly all spa web
traffic is first-time guests, so today Cinch can serve everyone except the
people the website sends it.

That is a build gap, not a config gap. It is also the single cheapest thing on
this list to fix relative to what it unblocks.

---

## Track A — Cinch go-live readiness

### A1 · BLOCKER · No public guest booking surface

`docs/SCHEDULING-MANGOMINT-2026-07.md` describes, as built:

> Public (guest, NO login): `/t/[tenant]/book` — service → add-ons → provider
> → day → slot → contact → deposit/full Checkout.

It does not exist in `main`. `find src/app -type d -name "book*"` returns
`member/appointments/book`, `play/[tenant]/book`, `book-court`, `book-bay` —
no `t/[tenant]/book`.

Verified live:

| URL | Result |
|---|---|
| `app.usecinch.com/t/falling-waters` | 200 |
| `app.usecinch.com/t/falling-waters/book` | **404** |
| `app.usecinch.com/t/falling-waters/book?embed=1` | **404** |
| `app.usecinch.com/member/appointments/book` | **307 → login** |

The public Treatments page (`src/app/t/[tenant]/treatments/page.tsx:63`) sends
"Book" to `/member/appointments/book` — member-gated. A new guest hits a login
wall. Booker, today, lets them straight through.

**This is the cutover blocker.** Everything else on this list is scheduling.

### A2 · BLOCKER · Every appointment email links to a dead page

`src/lib/appointment-comms.ts:346` and `:473` build the manage link as
`https://<host>/appt/<manageToken>`, and the doc states it is included on
*every* appointment email — confirmations, 24h reminders, reschedules,
cancellations, waitlist offers.

`find src/app -type d -name "appt*"` returns nothing.
`GET app.usecinch.com/appt/test-token` → **404**.

So the moment Cinch starts sending appointment mail, every message carries a
broken "manage your appointment" link. Reschedule, cancel, and self-check-in
all hang off that page. Ship A1 without A2 and the support burden lands on the
front desk.

### A3 · HIGH · No embed widget for fallingwatersdayspa.com

The Mangomint doc names `?embed=1` as *"the fallingwatersdayspa.com
integration"* — chrome-less iframe, copyable snippet in setup. It 404s with
its parent route. This is the intended mechanism for swapping the site's ~8
Booker buttons over to Cinch, so it gates the website half of the cutover too.

### A4 · HIGH · Still a row on the shared database

Per `docs/INSTANCE-PER-CLIENT-2026-07.md`, the mandate is one client, one
database, one Vercel project. Falling Waters is listed explicitly among the
three *"still rows on the `cinch` DB — these are the ones to pull off."*

Confirmed: `fallingwaters.usecinch.com/api/version` reports
`{"instance":"shared"}`. The seeder is registered (`INSTANCE_SEEDERS`,
`src/db/seed.ts:44`), so the provisioning path is ready — it just hasn't run.

`scripts/provision-instance.mjs` automates the stand-up. The data move is
`scripts/instance-migrate.mjs`, rig-proven for this tenant on 2026-07-28.

### A5 · HIGH · Not in `scripts/instances.json` — nobody is watching it

The fleet file's own warning: *"An instance missing from this file is an
instance nobody is watching — it can sit on a months-old build and every
release will still report all-green."* Falling Waters has no entry. Add one
with `expect: ["email"]` at minimum, at the same time as the instance.

### A6 · MEDIUM · Slug/domain naming conflict — decide before cutover, not after

`CLIENT-DOMAINS.md` Rule 1: *tenant slug === subdomain label*, no hyphens.

- Slug in code: `falling-waters`
- `primaryDomain` in the seed: `fallingwaters.usecinch.com`

These disagree. That is exactly the `platos-draper` mistake the doc lists as a
grandfathered exception and says not to repeat — and the reason it became
permanent is that the slug turned into an FK everywhere. Rename to
`fallingwaters` now, or consciously grandfather it. Doing nothing chooses the
second option by default.

### A7 · BLOCKER (human) · Env parity before the domain moves

The Plato's rollback on 2026-08-06 is the lesson: 14,592 rows copied and
verified fine, but the domain moved before env was at parity — 26 of 48
production vars missing, including the wallet key and the owner password. The
store looked down.

**23 vars are Vercel `type=sensitive` — write-only. No token can read them
back.** A human pastes them onto the new project *before* anything re-points.
Not doable from a session, and not a follow-up item.

Every instance owes `email` (SendGrid). VeyoPool ran for weeks without it,
which silently killed receipts, order pings, *and* magic-link sign-in — the
primary button on their door.

### A8 · BLOCKER (owner) · Payments need the owner's own KYC

The spa is on another processor today. Switching means an owner opens
`/admin/wallet` on the Falling Waters instance, connects a Stripe Express
account, and completes KYC with their EIN and bank details. Only they can do
it, and it must happen on the dedicated instance so the `wallet_merchants` row
is born in their own database. Also needs a per-instance
`WALLET_STRIPE_WEBHOOK_SECRET`.

### A9 · HIGH · No Booker/Mindbody importer exists

`ls scripts | grep import` → customers, podium replies, smartwaiver. Nothing
for Booker. Data that has to come out before cutover:

- Client list with contact details and history
- Future booked appointments (the spa cannot go dark on these)
- **Outstanding gift card balances** — the seed calls gift cards their #1
  seller, "$50–$500, never expire." That is real money owed to real people and
  the riskiest single item in the migration.
- Memberships and any packages in flight

Scope this before picking a cutover date. It is the long pole.

### A10 · MEDIUM · The tenant is a demo and still looks like one

`src/db/seed-fallingwaters.ts` seeds `hidden: true`, demo logins (`demo` /
`demo`), fake members, fake leads, a fake sales opportunity, and seeded
appointment history so reports look full. All of it must be cleared and the
tenant un-hidden before a real guest touches it.

Service prices were taken from the public website. Re-verify the full menu
against Booker's live version — the website is marketing, Booker is truth.

### A11 · LOW · Membership tiers exist in Cinch and nowhere else

The seed defines a Massage Club at $89/mo (one 50-min massage, 10% off
everything else, 90-day rollover). The website never mentions it. That is a
recurring-revenue product that is fully built and completely invisible — see
B7.

---

## Track B — What the Pardoe/PPA site does that we don't

Reference: `utahpickleball.com` — Connor Pardoe's facility, PPA Tour's second
HQ (`docs/UTAH-PICKLEBALL-CENTER.md`). Next.js + Tailwind 4 on Vercel.

**Both PPA-related sites were checked so the reference question is settled.**
`ppatour.com` is the tour's own property — a different species: a live-data
sports portal (world rankings with a men/women toggle, event countdowns,
champion results, broadcast grid, tiered sponsor directory, sticky ticket
bar). It is not a Bryce build and not a useful model for a day spa; almost
nothing on it transfers. `utahpickleball.com` is the facility site, matches
the repo's description of Bryce's build, and is the right comparable — a
local venue selling memberships and bookings, which is exactly Falling
Waters' job. Track B is written against it.

The one idea worth lifting from `ppatour.com`: its **sticky footer CTA bar**
that persists the primary action ("tickets") on every scroll position. For a
spa that would be a persistent "Book" bar on mobile — see B10.

| # | Technique | There | Falling Waters |
|---|---|---|---|
| B1 | **Announcement bar** above the header — one urgent line, one CTA ("Founding memberships now open — $250 reserves your spot. Reserve →") | yes | `js/banner.js` exists but no standing offer bar |
| B2 | **Mono accent face** for eyebrow labels — uppercase, `tracking-[0.2em]`, 10.5px. The signature editorial move. | Inter + Archivo + Geist Mono | Cormorant + Montserrat + **Dancing Script** |
| B3 | **Design tokens as CSS variables** — `--color-navy`, `--color-ball`, `--color-line`, `--color-on-dark` | yes | partial |
| B4 | **Responsive images** — 8-width `srcset`, LCP image preloaded with `imageSizes="100vw"` | yes | **zero `srcset`** |
| B5 | **Self-hosted preloaded woff2**, 3 faces | yes | render-blocking Google Fonts request, 3 families |
| B6 | **Sticky header, backdrop blur**, 72px | yes | no |
| B7 | **Tiered pricing cards** with per-tier "reserve at this rate" | $149–$249/mo | none — memberships live only in Cinch (A11) |
| B8 | **Interactive product demo** — the member app, on the marketing page | yes | none |
| B9 | **Urgency mechanic** — countdown to opening | yes | n/a, but seasonal/capacity equivalents exist |
| B10 | **Sticky footer CTA bar** persisting the primary action (from `ppatour.com`) | yes | no — "Book" scrolls away |

**B2 is the one to steal.** A mono eyebrow face over a quiet serif is what
makes that page read as designed rather than assembled, and it is a few lines
of CSS. **Dancing Script should go** — a script face is the fastest way to
make a spa site look like a 2014 template.

**B7 is the one that makes money.** The Massage Club is built, priced, and
unadvertised.

Note: per `docs/CINCH-WEB-DESIGN-STANDARD-2026-08-08.md`, marketing sites run
on **Editorial Light v3**, not the app design standard. The Mobbin-derived
standard in that file governs `/admin` and `/dashboard`, not this site.

---

## Track C — SEO / AEO / technical

### What is already good — do not re-do this

The schema coverage is strong and recent commits show a deliberate AEO pass:
`DaySpa`, `FAQPage` ×13, 75 `Question`/`Answer` pairs, `Service` ×28,
`BreadcrumbList` ×8, `AggregateRating` ×7, `OfferCatalog` ×4, plus
`llms.txt`, six city pages, and eight blog posts. Canonical, OG, Twitter, and
geo meta are all correct on the homepage.

### C1 · HIGH · ~70MB of orphaned plastic-surgery assets

This repo began life as `Surgeon Website Template V2`. The surgeon assets were
never removed. Nothing in any HTML, JS, CSS, or JSON references these files:

```
10.9MB  assets/videos/hero-option-2.mp4
 7.6MB  assets/videos/serious-walk-hero.mp4
 4.8MB  assets/videos/confident-woman.mp4
 4.2MB  assets/videos/smiling-woman.mp4
 4.2MB  assets/videos/smiling-confident-woman.mp4
 3.7MB  assets/videos/footer-video.mp4
 3.3MB  assets/video/hero-spa.mp4
 2.9MB  images/breast-lift-hero.jpg
 2.8MB  images/rhinoplasty-hero.jpg
 2.4MB  images/breast.png
 2.1MB  images/body-2.png
 1.8MB  images/breast-2.png
        … 25 orphans total
```

`assets/` is 57MB and `images/` is 25MB against a site that needs a fraction
of that. Beyond deploy weight: these are publicly reachable URLs on a day
spa's domain containing plastic-surgery imagery. Delete them.

### C2 · HIGH · No responsive images, almost no lazy loading

- `srcset` on the homepage: **0**
- `loading="lazy"`: **8** of **131** `<img>` tags sitewide
- No `fetchpriority` on the LCP image
- No WebP/AVIF — 38 JPG, 13 PNG, 0 next-gen

This is the largest Core Web Vitals lever available and it is pure mechanical
work. B4/B5 are the same fix.

### C3 · MEDIUM · Repo identity still says plastic surgery

`README.md` opens *"The ultimate plastic surgery website template"* and
`BUILD_SPEC.md` benchmarks against four surgeons' sites. Both ship in the
repo. Confusing for anyone new, and a real hazard now that agents and crawlers
read repositories as context.

### C4 · MEDIUM · Booking is an uninstrumented offsite handoff

Every "Book Now" leaves for `go.booker.com/#/location/fallingwaters` — a
hash-routed SPA that is uncrawlable, unindexable, and invisible to analytics.
There is no conversion tracking on the single most important action on the
site. Packages are worse: **$207–$349 products that require a phone call.**

A1–A3 fix this properly. Until then, at minimum put click tracking on the
Booker buttons so there is a conversion baseline to measure the cutover
against.

### C5 · LOW · Practitioner E-E-A-T is unclaimed

Reviews name Alicia, Holland, and Jaiden; the site advertises "59+ combined
years." There is no `Person` schema, no practitioner bios, no per-therapist
pages. For a local service business where people book a *person*, this is the
cheapest remaining organic gain — and it feeds A1's provider picker directly.

### C7 · MEDIUM · Three Vercel projects deploy this repo

Surfaced incidentally by the PR #7 preview builds — one push produced three
separate deployments, across three teams:

| Team | Project id |
|---|---|
| `gull-stack` | `prj_HoHsW2KV7Ed8kzEyOozUZfe0ioth` |
| `gullstackteam` | `prj_CnTbvi3DNNIosNydL04X6Ew9IzG2` |
| `gullstack-projects` | `prj_UOicL0E1ZcplDAugzhNEmMrTn5ct` |

All three built successfully, so nothing is broken today. **Which one holds
`fallingwatersdayspa.com` was not determined** — response headers confirm
Vercel serves the domain but not the project behind it. Worth 60 seconds in
the dashboard.

This is the same hazard class `cinch-app/scripts/instances.json` warns about
for the Cinch fleet: duplicate deployments that all report green while only
one is real. The failure mode is a change that looks shipped because two
projects deployed it, on a domain pinned to the third. Retire the two that
aren't serving production, or write down which is canonical and why.

### C6 · LOW · `meta keywords`

Twelve keywords in a tag no engine has used since 2009. Harmless, but it is
the kind of thing an auditor spots and then distrusts everything else.

---

## Track E — Top-tier spa benchmark

Mobbin was the proposed source, not the deliverable. The deliverable is a
comparison against top spa sites, so it was built from sites whose source can
actually be read — which is better evidence than a screenshot anyway.

Seven comparables, inspected live on 2026-08-12:

| Site | Platform | Booking | Structured data | srcset | webp |
|---|---|---|---|---|---|
| PRESS Modern Massage (Brooklyn) | Squarespace | **Boulevard, embedded** | MassageTherapist, Place, hours | 14 | 26 |
| Othership | Webflow + Shopify | on-site | HealthClub, AggregateRating, Geo | 4 | 7 |
| Remedy Place | Next.js | **Zenoti, 96 refs — deep** | Organization only | 0 | 0 |
| Glen Ivy | WordPress | on-site | WebPage, Breadcrumb | 5 | 13 |
| Heyday Skincare | Shopify + Wix | Square | BreadcrumbList only | 0 | 0 |
| Burke Williams | — | on-site | none detected | 3 | 0 |
| AIRE Ancient Baths | — | on-site | Organization | 0 | 0 |
| **Falling Waters** | Vanilla HTML | **Booker, offsite** | **DaySpa, 13× FAQPage, 28× Service, AggregateRating, OfferCatalog** | **0** | **0** |

### E1 · Our structured data is the best in the set — defend it, don't redo it

Not one of these sites carries FAQ markup at our depth. Most have less
structured data than a single Falling Waters service page. Heyday — a
national, well-funded facial chain — ships `BreadcrumbList` and nothing else.

For AEO specifically this is a live advantage: when an assistant answers
"what should I expect at my first spa visit in Draper," our 75 Question/Answer
pairs are machine-readable and our competitors' are not. **C0 stands: leave
the schema alone.** The work is elsewhere.

### E2 · We are the only site in the set with no modern image pipeline

Every comparable that invested anywhere invested here first. PRESS ships 26
WebP and 14 `srcset`; Othership self-hosts woff2 and ships both. We ship
zero of each, on 82MB of assets. This is now confirmed as table stakes rather
than polish — it is the same fix as B4, B5 and C2, and it is the single
clearest deficit against the field.

### E3 · The tier that converts embeds booking; we hand off

The pattern is unambiguous. Remedy Place carries **96 Zenoti references** —
booking is woven through the page, not linked from it. PRESS runs Boulevard
inline. Nobody in this set bounces a guest to a bare hash-routed external
domain the way `go.booker.com/#/location/fallingwaters` does.

This is the strongest external validation of the Cinch cutover: **A1–A3 are
not a platform preference, they are how the top of this market operates.**
Boulevard and Zenoti are the products Cinch is competing with here, and the
appointment engine already matches them on capability — it is the front door
that is missing.

### E4 · What the premium tier does that isn't a platform choice

Common to PRESS, Othership and Remedy Place, all cheap for us:

- **Price and duration on the menu, inline** — no "call for pricing." We
  mostly do this; packages are the exception, and they are our costliest
  services (C4).
- **A named practitioner attached to the booking** — reinforces C5.
- **Membership as a first-class page**, not a footnote — reinforces B7.
- **One persistent booking affordance** on mobile — reinforces B10.

Nothing in this track needs a redesign. Every item lands on something already
in Tracks B and C, which is a good sign the earlier read was right.

---

## Track D — Mobbin: blocked

`mobbin.com` returns **403** without a session. I cannot log in — I have no
credentials, and the fetch tool cannot hold an authenticated session even if I
did. I did not attempt a workaround.

**Track E delivers the benchmark anyway**, from public sites whose source can
be read directly. Mobbin would still add one thing E cannot: captured
*interaction* flows — the step-by-step of how a booking or onboarding actually
moves. If that is what you want, export the spa/wellness collections as
screenshots or PDF and drop them in, and I will analyze from there.

I am not asking for credentials — I can't hold an authenticated session with
them regardless, and it likely breaks Mobbin's terms.

Worth knowing: `cinch-app/docs/mobbin-study/` already holds a committed Mobbin
**Pro** study from 2026-08-07 — a design standard and a screen/flow taxonomy.
It is fintech and merchant-ops apps (Monzo, Mercury, Shopify, Linear, Jobber),
not spa websites, so it does not answer this question. Two notes on it:

- The 38 raw captures are **licensed material living on one Mac**, git-ignored,
  with no backup. The README flags this and it is still true.
- That study is about *product apps*. This site is governed by Editorial Light
  v3 instead — don't let the two standards cross.

---

## Suggested order

Nothing here is started. Sequenced by what unblocks what:

**First — unblocks everything else in Cinch**
- A1 public guest booking page
- A2 `/appt/[token]` manage page
- A3 embed widget

**Then — the cutover itself, gated on a human and the owner**
- A9 scope the Booker export (long pole — start the ask now, in parallel)
- A4 + A5 provision the instance, add it to the fleet file
- A6 settle the slug question before any FK is written
- A7 env parity, human-pasted, before the domain moves
- A8 owner completes Stripe KYC
- A10 de-demo the tenant

**In parallel — no dependency on Cinch**
- C1 delete the orphaned surgeon assets
- C2 / B4 / B5 responsive images, lazy loading, next-gen formats, fonts
- C4 conversion tracking on the Booker buttons, now, for a baseline
- B2 typography — mono eyebrow in, Dancing Script out
- B7 put the Massage Club on the website
- B1 announcement bar
- B10 sticky mobile "Book" bar
- C3 rewrite README and BUILD_SPEC
- C5 practitioner bios and `Person` schema

**Decide before starting**
- D whether you want Mobbin's interaction flows on top of Track E
- Whether the site stays vanilla HTML or moves to the Next.js stack the
  Pardoe site uses. B4/B5/B6 are close to free on that stack and hand-built
  here. Track E raises the stakes on this one: every comparable that invested
  in images did it through a framework's pipeline rather than by hand. Still
  not a recommendation — but it is the decision that makes C2 cheap or
  expensive.
