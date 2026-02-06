# BUILD SPEC — Surgeon Website Template V2 (Tier-S+)

## Overview
Build the ultimate plastic surgery website template. Static HTML/CSS/JS (no frameworks, no build tools). 
Must be deployable to Vercel as-is. All content is driven by `config.js` (already created).

## Reference
The current V1 template is at `../surgeon-template-reference/` — use it for structural reference but the design must be SIGNIFICANTLY upgraded.

The top S-tier competitor sites to beat:
- drstoker.com — 12K+ photo gallery, signature procedures, fly-in program, video testimonials
- lakeshoreplasticsurgery.com — stunning dark/light design, hero video, 400+ reviews, med spa
- swancenteratlanta.com — luxury aesthetic, promotions, multiple surgeons
- arykraumd.com — voted best positioning, luxury feel

## Tech Stack
- Vanilla HTML5, CSS3 (with custom properties), vanilla JS (ES6+)
- Google Fonts: Inter (body), Playfair Display (headings), Cormorant Garamond (accents)
- Font Awesome 6.x for icons
- No jQuery, no React, no build tools
- Must be fully responsive (mobile-first)

## Design Language
- **Luxury medical aesthetic** — think high-end Beverly Hills clinic
- Dark navy (#1a1f2e) + warm gold (#c9a96e) + off-white (#faf8f5) palette
- Generous whitespace, elegant typography
- Subtle animations on scroll (fade-up, slide-in)
- Smooth transitions everywhere
- Card-based layouts with soft shadows
- Full-bleed hero with overlay

## Files to Create

### 1. `index.html` — Homepage
Sections in order:
1. **Top bar** — phone, email, social icons, optional patient portal link
2. **Navigation** — sticky, transparent on hero → solid on scroll. Logo left, mega-menu style dropdowns, "Book Consultation" CTA button
3. **Hero** — full-viewport with image/video background, overlay, animated headline, trust badges row (Board Certified, X Star Rating, X+ Procedures), dual CTA buttons (Book Consultation + Text Us Now)
4. **Social Proof Counter Bar** — animated counting numbers: Procedures Performed, Years Experience, 5-Star Reviews, Google Rating. Gold accent line above.
5. **Welcome/Intro** — doctor photo + bio excerpt, credentials icons, "Learn More" CTA
6. **Signature Procedures** — 3-card showcase with hover effects, each with image, branded procedure name, tagline, short description
7. **Services Overview** — categorized grid (Breast, Body, Face, Non-Surgical) with procedure lists, expandable on mobile
8. **Before & After Preview** — 4 gallery items with interactive before/after slider (CSS + JS drag slider). "View Full Gallery" CTA
9. **Why Choose Us** — 6 feature cards with icons in a dark-background section
10. **Testimonials** — horizontal scrolling carousel, each card has rating stars, quote text, patient initials, procedure type, source platform badge
11. **Procedure Quiz CTA** — "Not Sure Where to Start?" section with quiz preview, enticing CTA button
12. **Financing** — split layout (text + image), provider logos, feature bullets, CTA
13. **Office/Location** — photo + details + Google Maps embed + hours
14. **Final CTA** — full-width banner with headline + dual buttons
15. **Footer** — 4-column grid (about, links, procedures, contact), social icons, copyright, legal links, disclaimer

### 2. `about.html` — About the Doctor
- Page hero with breadcrumb
- Large doctor portrait + bio narrative
- Education timeline (vertical)
- Awards & recognition grid
- Memberships/certifications logo strip
- Philosophy quote section
- Team section (if multiDoctor)
- CTA section

### 3. `contact.html` — Contact & Consultation
- Page hero
- 2-column: form left, info right
- Form fields: Name, Email, Phone, Procedure Interest (dropdown from config), Preferred Contact Method, Message, optional photo upload area
- Info: address, phone, email, hours, map
- Virtual consultation callout box
- FAQ about consultations

### 4. `gallery.html` — Before & After Gallery
- Page hero
- Category filter buttons (from config)
- Grid of before/after pairs with interactive slider
- Lightbox on click
- Disclaimer text
- CTA section

### 5. `services/mommy-makeover.html` — Service Page Template
- Same structure as V1 reference but with upgraded design
- Add: procedure hero image, procedure benefits grid, recovery timeline (visual), candidate checklist, FAQ accordion with schema markup, related procedures sidebar, financing callout, video embed area
- This serves as the MODEL for all other service pages

### 6. `services/breast-augmentation.html` — Second service page example

### 7. `css/styles.css` — Complete Stylesheet
- CSS custom properties from config theme
- Modern reset
- Typography scale system
- All component styles
- Animations (@keyframes for fade-up, slide-in, counter)
- Before/after slider styles
- Testimonial carousel styles
- Quiz modal styles
- Responsive breakpoints (mobile-first: 480, 768, 1024, 1280)
- Print styles

### 8. `js/main.js` — Complete JavaScript
- Mobile menu (hamburger → slide overlay)
- Sticky header with transparent → solid transition
- Scroll animations (IntersectionObserver)
- Animated counters (count up when in viewport)
- Testimonial carousel (touch-friendly, auto-advance)
- Before/After slider (drag + touch support)
- Procedure quiz (modal, step-by-step, recommendation)
- Gallery category filter
- Gallery lightbox
- FAQ accordion
- Back to top
- Smooth scroll
- Dynamic copyright year
- Form validation
- Lazy loading

### 9. `manifest.json` — PWA manifest
### 10. `robots.txt` — SEO
### 11. `sitemap.xml` — SEO sitemap
### 12. `.gitignore`
### 13. `README.md` — how to use the template, how to customize via config.js
### 14. `vercel.json` — clean URLs config

## Key Design Patterns

### Before/After Slider
```
[container with overflow hidden]
  [before image - full width]
  [after image - clipped by slider position]
  [drag handle - vertical line with circle]
[/container]
```
Use CSS clip-path or width-based approach. Handle mouse + touch events.

### Animated Counter
When counter bar enters viewport, animate from 0 to target number over 2 seconds with easing. Use requestAnimationFrame.

### Testimonial Carousel  
Horizontal scroll with snap points. Auto-advance every 5s, pause on hover/touch. Dot indicators below. Touch/swipe support.

### Procedure Quiz
Modal overlay. Step through questions one at a time. Progress bar. On completion, show recommended procedures with links. Store in sessionStorage.

## SEO Requirements
- Schema.org JSON-LD on every page (PlasticSurgery, Physician, MedicalProcedure, FAQPage, BreadcrumbList)
- Open Graph tags
- Twitter card tags
- Canonical URLs
- Semantic HTML5 (header, nav, main, section, article, aside, footer)
- Proper heading hierarchy (h1 → h6)
- Alt text on all images
- Aria labels on interactive elements

## Performance Requirements
- Preconnect to Google Fonts
- Preload critical font files
- Lazy load all below-fold images
- Defer non-critical JS
- CSS custom properties for theming (one source of truth)
- No render-blocking resources below fold

## Accessibility Requirements
- WCAG 2.1 AA
- Focus styles on all interactive elements
- Skip to content link
- Keyboard navigation for carousel, slider, quiz
- Aria labels and roles
- Sufficient color contrast
- Reduced motion media query

## Image Placeholders
Use placeholder.co or similar for all images since we don't have real assets:
- Hero: 1920x1080
- Doctor portrait: 600x800
- Procedure cards: 800x600
- Gallery items: 600x400
- Office: 800x500
- Team: 400x400

## IMPORTANT
- Config.js is already written — READ IT and use its values everywhere
- The design must look PRODUCTION READY even with placeholder images
- Every section must be responsive and look great on mobile
- The CSS should be one comprehensive file (no separate files per component)
- Navigation dropdowns must work on both desktop (hover) and mobile (tap)
- All colors, fonts, and spacing should use CSS custom properties
