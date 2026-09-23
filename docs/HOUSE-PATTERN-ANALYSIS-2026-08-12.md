# What Bryce actually builds — and where Falling Waters sits

Read of the five most recent site repos in `Gull-Stack`, plus the org's own
documented standards. Supersedes the Track B comparison in
`CINCH-CUTOVER-AND-SITE-AUDIT-2026-08-12.md`, which was written against one
public site instead of the source.

---

## The finding everything else hangs on

`gullstack-skills/design-standard-v3.md`, under **"What This Replaces"**:

> **The old "Falling Waters" dark-heavy template is retired for new builds.
> Existing client sites should be migrated to v3 editorial style during their
> next update cycle.**

Falling Waters is not a site that needs polish. It is **the named, retired
template** — and the standard already says what to do about it. This is that
update cycle.

That also explains why my earlier pass didn't move the needle: I was making
small improvements to a pattern the house retired in March.

---

## What the five repos actually are

| Repo | What it is | Stack |
|---|---|---|
| `desert-reef` | Concept pitch site, hot springs, built 11 Aug | **Next 16.3 · React 19.2 · Tailwind 4** |
| `cottonwood-hs` | Sister pitch site, same day | **Next 16.3 · React 19.2 · Tailwind 4** |
| `clutch-cages` | Real client — Cinch's first inbound lead | **Next 16.2 · React 19.2 · Tailwind 4** |
| `ziff` | Internal ops app, not a marketing site | — |
| `osborne-electric-site` | Static HTML, no build step | the *old* generation |

Three of five are the current pattern. `osborne-electric-site` is the same
generation as Falling Waters — static HTML, hand-maintained. So we are not
comparing against one flashy outlier; **we are two stacks behind the house
default.**

---

## The pattern language

`desert-reef` and `cottonwood-hs` ship **the same six components**. That is the
house kit, not a coincidence:

```
components/
  ui.tsx        Section · Eyebrow · Rv · Btn · Wave · Stat   (127 lines total)
  PageHero.tsx  full-bleed image + scrim + bottom-left content
  Chrome.tsx    nav + footer shell
  Reveal.tsx    scroll reveal with fail-safes
  BookFlow.tsx  native booking
```

### Tokens, not a palette

`@theme` in `globals.css`, 5–7 named colors pulled from the client's **real**
brand — Clutch's are annotated *"from their wall logo: black block,
chrome/silver, crimson red."*

```css
--color-ink: #12100d;   --color-sand: #efe6d6;   --color-clay: #a05a33;
--color-reef: #2f9db0;  --color-dusk: #dd9a8c;
```

### Two faces, and the display face is a grotesk

```css
.display  { font-family: Archivo; font-weight: 700; text-transform: uppercase;
            letter-spacing: -0.035em; line-height: 0.94; }
.eyebrow  { text-transform: uppercase; letter-spacing: 0.16em; font-size: 0.68rem; }
```

The standard is explicit: *"**No heavy display serifs.** Playfair, Didot, and
other high-contrast serif headlines are retired — they read stifling and
dated,"* and *"One display face + one text face. A third face is a defect."*

### The hero

```
full-bleed <Image fill priority />
  → gradient scrim (not a flat overlay)
  → content bottom-left, not centre
  → eyebrow · h1 clamp(2.9rem, 10vw, 6.6rem) · lede · two buttons
```

Desert Reef's actual h1: **"Hot water, big sky, room to reset."** — three lines,
middle line in the accent colour. Written, not templated.

### Measure discipline

Every text block carries an explicit character width: `max-w-[15ch]` on the h1,
`max-w-[46ch]` on the lede, `max-w-[18ch]` on section headings.

### Motion with fail-safes

```css
/* Content is VISIBLE by default. The hidden state only applies once JS has
   added .anim to <html>, and three separate nets remove it again if the
   observer never runs. Broken JS can never hide content. */
```

Plus a full `prefers-reduced-motion` block. That is a craft standard, not a
nice-to-have.

### A drawn motif per client

`Wave` in `ui.tsx` — *"Their own scallop-wave motif — off the entrance sign, the
Splash Pass card and the corten wall by the pools. **Drawn, not traced.**"*
Every site gets one bespoke geometric element in inline SVG.

### The sites read from Cinch

`lib/cinch-content.ts`:

> *Cinch → this site. What the front desk changes, the website shows. Events
> live in Cinch. Adding one there puts it here on the next revalidate, so nobody
> keeps two lists in sync. If Cinch is unreachable or the key is not set, we
> fall back to the events read off their own site on 11 Aug — the page is never
> empty and a booking page never goes down because an API blinked.*

**This is the biggest structural difference and nobody asked about it.** The new
sites are Cinch front-ends with a static fallback. `POST /api/book` →
`cinch_reservations` → the desk sees it at `<tenant>.usecinch.com`.

---

## On centering — your instinct was right

Not a style opinion; it's in the code. Desert Reef's hero is
`flex min-h-[86svh] flex-col justify-end` with everything left-aligned. Section
headings are left-aligned at `max-w-[18ch]`.

The **only** centered component is `Stat`, and it carries a comment explaining
why they went back to centering it:

> *"Figure sits centred over its label, at 75% of its old size. Joe's note,
> 11 Aug: left-aligned and oversized, it fought the label underneath it."*

So centering is a deliberate, argued exception for one component. On Falling
Waters it is the default for all fifteen sections.

---

## Falling Waters vs. the written standard

Verified in this repo today:

| # | Standard | Falling Waters |
|---|---|---|
| 1 | "No heavy display serifs… retired, stifling and dated" | **Cormorant Garamond** on every heading |
| 2 | §9 hard rule: icon/text tile grids **banned** | `.value-props` → `.value-grid` → 4 `.value-item` tiles |
| 3 | "Bottom dock is **mobile-only**. Never at a desktop viewport" | `.sticky-book` is unscoped — shows on desktop |
| 4 | "**No pixel, no launch**" — GA4 + Meta + conversion events | **No analytics, no pixel, no GTM anywhere** |
| 5 | "'Config-driven' must be true" (a named anti-lesson) | `config.js` — 14KB, **never loaded by any page** |
| 6 | Hero: full-bleed, scrim ≤30%, text at bottom | Heavy overlay, text vertically centered |
| 7 | Mandatory: Hero + Partners + Showcase + Comparison + FAQ + Contact | Has FAQ. No logos, no comparison table, no homepage form |
| 8 | Images: WebP + `srcset` + explicit dimensions | WebP + dimensions ✓ (this week), **`srcset` still missing** |
| 9 | Next + Tailwind, App Router | Static HTML, hand-maintained |

Items 4 and 5 are listed in `bryce-method.md` as **hard gates** — *"do not call
a site done if any of these fail."* Both fail on a site that is live.

---

## Scoring my earlier passes honestly

| What I did | Verdict |
|---|---|
| Added mono eyebrow labels | Right — §3 of the standard |
| Dropped Dancing Script (3rd face) | Right — "a third face is a defect" |
| WebP + intrinsic dimensions | Half — `srcset` is required and still absent |
| Deleted the surgeon pages | Right, and overdue |
| Fixed the mobile nav/logo bug | Right |
| **Added a Call button to the desktop sticky bar** | **Wrong** — hardened a violation of the mobile-only rule |
| **Kept Cormorant Garamond** | **Wrong** — it is the retired face |
| **Framed the work as "small wins"** | **Wrong** — the standard calls for migration |

---

## Recommendation

**Rebuild on the `desert-reef` / `cottonwood-hs` skeleton rather than patching
this one.** Reasons, in order of weight:

1. **The standard already says to.** Falling Waters is the named retired
   template, due for migration at its next update cycle.
2. **Two reference implementations exist**, built four weeks ago, sharing an
   identical 127-line component kit. This is a known quantity, not R&D.
3. **It solves the booking problem at the same time.** The earlier audit's
   blockers — A1, A2, A3 — were that Cinch has no public guest booking surface.
   `BookFlow.tsx` + `POST /api/book` + `cinch_reservations` is that surface,
   already working on two sites. Migrating the website and turning Cinch on stop
   being two projects.
4. **It closes the hard gates** — analytics and pixel ship as part of the
   deployment checklist rather than as a to-do.

The SEO/AEO work is the one thing to carry across intact. Per the earlier
benchmark our structured data is the strongest in the field; `bryce-method.md`
calls `brand-facts.json` *"the moat."* We already ship it. Port it, don't
rewrite it.

### What I'd want before starting

- Confirmation this is a rebuild, not a patch — it is a different size of job.
- Whether Falling Waters gets its own Cinch tenant wiring on day one (the
  `cinch-content` + `cinch_reservations` path) or ships static-fallback first.
- The brand input the motif is drawn from — the house pattern gives every site
  one bespoke drawn element, and "falling water" is an unusually good starting
  point for one.
