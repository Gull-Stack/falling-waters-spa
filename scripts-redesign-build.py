"""Assemble the Falling Waters v3 redesign as one self-contained page.

Content, prices, review text, FAQ answers, address and hours are lifted verbatim
from index.html. Nothing here is invented. The JSON-LD blocks are carried across
untouched so the SEO/AEO work survives the redesign.
"""
import base64, json, mimetypes, pathlib, re

ROOT = pathlib.Path("/home/user/falling-waters-spa")
src = (ROOT / "index.html").read_text()
fonts = pathlib.Path("/tmp/fonts2.css").read_text()

# ---------------------------------------------------------------- assets
_cache = {}
def uri(rel):
    if rel in _cache:
        return _cache[rel]
    p = ROOT / rel.lstrip("/")
    if not p.exists():
        raise SystemExit("missing asset: " + rel)
    mt = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    _cache[rel] = "data:%s;base64,%s" % (mt, base64.b64encode(p.read_bytes()).decode())
    return _cache[rel]

IMG = {k: uri(v) for k, v in {
    "hero":    "/assets/images/services/relaxation.webp",
    "massage": "/assets/images/services/massage.webp",
    "facial":  "/assets/images/services/facial.webp",
    "hair":    "/assets/images/services/hair.webp",
    "nails":   "/assets/images/services/nails.webp",
    "brows":   "/assets/images/services/brows.webp",
    "waxing":  "/assets/images/services/waxing.webp",
    "couples": "/assets/images/services/couples.webp",
    "girls":   "/assets/images/services/girls-day.webp",
    "team1":   "/assets/images/team/massage-therapist.webp",
    "team2":   "/assets/images/team/aesthetician.webp",
    "team3":   "/assets/images/team/hair-stylist.webp",
    "logo":    "/assets/images/logo.webp",
    "logotext":"/assets/images/logo-text.webp",
}.items()}

# ------------------------------------------------- carry the schema across
schema = re.findall(r'<script type="application/ld\+json">.*?</script>', src, re.S)

SERVICES = [
    ("Massage Therapy", "Swedish, deep tissue, hot stone &amp; prenatal massage. Melt away tension.", "From $105", "/services/massage", "massage"),
    ("Skin Care &amp; Facials", "HydraFacial, chemical peels, microdermabrasion &amp; custom facials for radiant skin.", "From $65", "/services/facials", "facial"),
    ("Hair Services", "Expert cuts, color, highlights, balayage &amp; styling from talented stylists.", "Women from $55", "/services/hair-care", "hair"),
    ("Nail Care", "Luxurious manicures &amp; pedicures with gel polish options for beautiful hands &amp; feet.", "From $40", "/services/nails", "nails"),
    ("Brows &amp; Lashes", "Lash extensions, lifts, brow shaping &amp; tinting for that perfect frame.", "From $23", "https://go.booker.com/#/location/fallingwaters", "brows"),
    ("Waxing", "Professional waxing services for smooth, long-lasting results.", "From $20", "/services/waxing", "waxing"),
]

PACKAGES = [
    ("The Ultimate Spa Day", "$207",
     "The full-body reset: 50-minute Swedish massage, 60-minute custom facial, and a luxury spa pedicure. Relax, refresh, renew.", "girls"),
    ("The Bloom &amp; Bliss Couples Experience", "$349",
     "80 minutes of side-by-side Swedish massage — plus a flower bouquet to take home. Relax. Reconnect. Leave with flowers.", "couples"),
    ("The Birthday Glow Experience", "$210",
     "Your day, your way: 60 min custom facial, 50 min Swedish massage, and a floral arrangement to take home. You deserve it.", "facial"),
]

REVIEWS = [
    ("Dolce Dachs", "I can't say enough amazing things about Alicia Aragon! She is seriously my go-to girl. She is a creative artist with topnotch skills to match! She is personable and fun with a warm and sweet personality that makes every appointment feel like catching up with a good friend."),
    ("Joyce Warner", "Holland is wonderful and a total professional about hair while still being an absolute delight to talk to. The entire staff there is incredible which always makes me want to come back!"),
    ("Chelsea Benson", "Jaiden does a great job on my lashes. I love her!"),
]

FAQS = [
    ("Do I need to book in advance?", "We recommend booking 24-48 hours ahead, especially for weekends. Walk-ins welcome based on availability."),
    ("What should I wear?", "Comfortable clothing is best. We provide robes and slippers for spa services. Wear easy-to-remove clothing for waxing."),
    ("How early should I arrive?", "Please arrive 10-15 minutes early to check in and relax before your treatment begins."),
    ("What's your cancellation policy?", "We require 24-hour notice for cancellations. Late cancellations may incur a fee."),
    ("Do you offer couples treatments?", "Yes! Our couples suite allows you to enjoy massages side-by-side. Perfect for date nights or special occasions."),
    ("Is parking available?", "Free parking is available at Treehouse Athletic Club. We're located inside the club."),
]

BOOK = "https://go.booker.com/#/location/fallingwaters"
TEL = "tel:+18015019000"

def svc_card(i, s):
    name, desc, price, href, img = s
    return f'''
      <a class="svc rv" href="{href}" style="transition-delay:{i*60}ms">
        <div class="svc-img"><img src="{IMG[img]}" alt="" loading="lazy" decoding="async" width="800" height="600"></div>
        <div class="svc-body">
          <h3>{name}</h3>
          <p>{desc}</p>
          <span class="svc-price">{price}</span>
        </div>
      </a>'''

def pkg_row(i, p):
    name, price, desc, img = p
    return f'''
      <div class="pkg rv" style="transition-delay:{i*80}ms">
        <div class="pkg-img"><img src="{IMG[img]}" alt="" loading="lazy" decoding="async" width="900" height="600"></div>
        <div class="pkg-body">
          <span class="pkg-num">{i+1:02d}</span>
          <h3>{name}</h3>
          <p>{desc}</p>
          <div class="pkg-foot">
            <span class="pkg-price">Starting at <strong>{price}</strong></span>
            <a class="btn btn-ghost" href="{TEL}">Call to reserve — (801) 501-9000</a>
          </div>
          <p class="pkg-note">Packages combine multiple providers, so they are booked by phone.</p>
        </div>
      </div>'''

def review(i, r):
    who, quote = r
    return f'''
      <figure class="rev rv" style="transition-delay:{i*70}ms">
        <div class="rev-stars" aria-label="5 out of 5 stars">★★★★★</div>
        <blockquote>{quote}</blockquote>
        <figcaption>{who}<span>Google Review</span></figcaption>
      </figure>'''

def faq(q, a):
    return f'''
      <details class="faq">
        <summary><span>{q}</span><i aria-hidden="true"></i></summary>
        <div class="faq-a"><p>{a}</p></div>
      </details>'''

HTML = f'''<meta name="robots" content="noindex,nofollow">
<title>Falling Waters Redesign</title>
<style>
{fonts}

:root {{
  --ink:      #0f1a1e;
  --ink-2:    #17272d;
  --mist:     #f4f6f5;
  --paper:    #ffffff;
  --stone:    #dfe5e3;
  --stone-2:  #9aa8a6;
  --water:    #2f7f93;
  --water-2:  #5fb0c2;
  --brass:    #bf9d6e;
  --text:     #34423f;
  --font-display: 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --pad: clamp(1.25rem, 4vw, 2rem);
  --max: 1180px;
}}

* {{ box-sizing: border-box; }}
body {{
  margin: 0; background: var(--mist); color: var(--text);
  font-family: var(--font-body); font-size: 16.5px; line-height: 1.65;
  -webkit-font-smoothing: antialiased; overflow-x: hidden;
}}
img {{ max-width: 100%; display: block; }}
a {{ color: inherit; }}

.wrap {{ margin: 0 auto; width: 100%; max-width: var(--max); padding-left: var(--pad); padding-right: var(--pad); }}
section {{ padding: clamp(3.5rem, 8vw, 6rem) 0; }}

/* ---- type ---------------------------------------------------------- */
.display {{
  font-family: var(--font-display); font-weight: 700; text-transform: uppercase;
  letter-spacing: -0.03em; line-height: 0.94; margin: 0; color: var(--ink);
}}
h2.display {{ font-size: clamp(1.9rem, 5.2vw, 3.4rem); max-width: 18ch; }}
h3 {{ font-family: var(--font-display); font-weight: 700; letter-spacing: -0.015em; margin: 0; color: var(--ink); }}
p {{ margin: 0; }}
.eyebrow {{
  font-family: var(--font-display); font-size: 0.7rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.25em; color: var(--water);
  margin: 0 0 1rem; display: block;
}}
.lede {{ margin-top: 1.4rem; max-width: 52ch; font-size: 1.06rem; color: var(--text); }}

/* ---- buttons ------------------------------------------------------- */
.btn {{
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  min-height: 48px; padding: .85rem 1.6rem; border-radius: 999px;
  font-family: var(--font-display); font-size: .74rem; font-weight: 700;
  letter-spacing: .14em; text-transform: uppercase; text-decoration: none;
  transition: background .2s, color .2s, border-color .2s; border: 1px solid transparent;
}}
.btn-solid  {{ background: var(--water); color: #fff; }}
.btn-solid:hover {{ background: var(--ink); }}
.btn-ghost  {{ border-color: var(--stone-2); color: var(--ink); }}
.btn-ghost:hover {{ background: var(--ink); color: #fff; border-color: var(--ink); }}
.btn-light  {{ border-color: rgba(255,255,255,.5); color: #fff; }}
.btn-light:hover {{ background: #fff; color: var(--ink); }}

/* ---- ripple motif (falling water, drawn) --------------------------- */
.ripple {{ display: block; width: 100%; height: auto; color: var(--water); opacity: .5; }}

/* ---- reveal: visible by default; hidden only once JS confirms ------- */
html.anim .rv {{ opacity: 0; transform: translateY(16px); }}
html.anim .rv.shown {{
  opacity: 1; transform: none;
  transition: opacity .75s cubic-bezier(.22,.61,.36,1), transform .75s cubic-bezier(.22,.61,.36,1);
}}
@media (prefers-reduced-motion: reduce) {{
  html.anim .rv, html.anim .rv.shown {{ opacity: 1; transform: none; transition: none; }}
  html {{ scroll-behavior: auto; }}
}}

/* ---- top bar + nav -------------------------------------------------- */
.announce {{
  background: var(--ink); color: #e9efee; font-size: .8rem;
  display: flex; gap: .4rem 1rem; flex-wrap: wrap; align-items: baseline;
  justify-content: center; padding: .6rem var(--pad);
}}
.announce .eyebrow {{ margin: 0; color: var(--brass); font-size: .62rem; }}
.announce a {{ color: #fff; text-decoration: underline; text-underline-offset: 4px;
  text-decoration-color: var(--brass); white-space: nowrap; font-weight: 600; }}
.nav {{
  position: sticky; top: 0; z-index: 90; background: rgba(244,246,245,.86);
  backdrop-filter: blur(12px); border-bottom: 1px solid var(--stone);
}}
.nav-in {{ display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding-top: .7rem; padding-bottom: .7rem; }}
.nav-logo {{ display: flex; align-items: center; gap: .6rem; text-decoration: none; }}
.nav-logo img:first-child {{ height: 40px; width: auto; }}
.nav-logo img:last-child {{ height: 20px; width: auto; }}
.nav-links {{ display: flex; align-items: center; gap: 1.6rem; list-style: none; margin: 0; padding: 0; }}
.nav-links a {{ text-decoration: none; font-size: .88rem; color: var(--ink); }}
.nav-links a:hover {{ color: var(--water); }}
@media (max-width: 900px) {{ .nav-links {{ display: none; }} }}

/* ---- hero ----------------------------------------------------------- */
.hero {{ position: relative; min-height: 84svh; display: flex; align-items: flex-end;
  overflow: hidden; padding: 0; background: var(--ink); }}
.hero > img {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }}
.hero-scrim {{ position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(15,26,30,.92) 4%, rgba(15,26,30,.55) 34%, rgba(15,26,30,.10) 70%); }}
.hero-in {{ position: relative; width: 100%; padding-top: 8rem; padding-bottom: clamp(2.5rem,6vw,4rem); }}
.hero .eyebrow {{ color: #b9d4db; }}
.hero h1 {{
  font-family: var(--font-display); font-weight: 800; text-transform: uppercase;
  letter-spacing: -0.035em; line-height: .92; color: #fff; margin: 0;
  font-size: clamp(2.6rem, 9vw, 6rem); max-width: 13ch;
}}
.hero h1 em {{ font-style: normal; color: var(--water-2); }}
.hero h1 .h1-sub {{
  display: block; margin-top: 1.1rem; font-family: var(--font-body); font-weight: 400;
  text-transform: none; letter-spacing: 0; line-height: 1.5;
  font-size: clamp(.95rem, 1.5vw, 1.08rem); color: rgba(255,255,255,.86); max-width: 46ch;
}}
.hero-cta {{ display: flex; flex-wrap: wrap; gap: .7rem; margin-top: 2rem; }}

/* ---- stat band (replaces the icon-tile grid) ------------------------ */
.band {{ background: var(--ink); color: #e9efee; padding: clamp(2.5rem,5vw,3.5rem) 0; }}
.band-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(160px,1fr)); gap: 2rem 1.5rem; }}
.band .n {{ font-family: var(--font-display); font-weight: 700; letter-spacing: -.03em;
  font-size: clamp(2rem,4.2vw,3rem); line-height: 1; color: #fff; }}
.band .l {{ margin-top: .5rem; font-size: .88rem; color: rgba(233,239,238,.62); max-width: 22ch; }}

/* ---- section header ------------------------------------------------- */
.sec-head {{ display: grid; gap: 1rem; margin-bottom: clamp(2rem,4vw,3rem); }}
@media (min-width: 900px) {{
  .sec-head {{ grid-template-columns: minmax(0,1.05fr) minmax(0,.95fr); align-items: end; gap: 2.5rem; }}
  .sec-head .lede {{ margin-top: 0; padding-bottom: .35rem; }}
}}

/* ---- services ------------------------------------------------------- */
.svc-grid {{ display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); }}
.svc {{ text-decoration: none; background: var(--paper); border: 1px solid var(--stone);
  display: flex; flex-direction: column; transition: border-color .25s, transform .25s; }}
.svc:hover {{ border-color: var(--water); transform: translateY(-3px); }}
.svc-img {{ aspect-ratio: 4/3; overflow: hidden; }}
.svc-img img {{ width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }}
.svc:hover .svc-img img {{ transform: scale(1.04); }}
.svc-body {{ padding: 1.4rem 1.4rem 1.6rem; display: grid; gap: .55rem; }}
.svc-body h3 {{ font-size: 1.18rem; }}
.svc-body p {{ font-size: .93rem; color: #5b6b68; }}
.svc-price {{ font-family: var(--font-display); font-weight: 700; font-size: .78rem;
  letter-spacing: .12em; text-transform: uppercase; color: var(--water); margin-top: .2rem; }}

/* ---- packages: alternating full-bleed rows -------------------------- */
.pkg {{ display: grid; gap: 0; background: var(--paper); border: 1px solid var(--stone); margin-bottom: 1.5rem; }}
@media (min-width: 860px) {{
  .pkg {{ grid-template-columns: minmax(0,1fr) minmax(0,1fr); }}
  .pkg:nth-child(even) .pkg-img {{ order: 2; }}
}}
.pkg-img {{ min-height: 260px; }}
.pkg-img img {{ width: 100%; height: 100%; object-fit: cover; }}
.pkg-body {{ padding: clamp(1.6rem,3.5vw,2.6rem); display: grid; gap: .8rem; align-content: center; }}
.pkg-num {{ font-family: var(--font-display); font-size: .72rem; font-weight: 700;
  letter-spacing: .25em; color: var(--stone-2); }}
.pkg-body h3 {{ font-size: clamp(1.35rem,2.6vw,1.9rem); text-transform: uppercase; letter-spacing: -.02em; line-height: 1.05; }}
.pkg-body > p {{ color: #5b6b68; max-width: 46ch; }}
.pkg-foot {{ display: flex; flex-wrap: wrap; align-items: center; gap: 1rem; margin-top: .5rem; }}
.pkg-price {{ font-size: .95rem; color: var(--ink); }}
.pkg-price strong {{ font-family: var(--font-display); font-size: 1.5rem; letter-spacing: -.02em; }}
.pkg-note {{ font-size: .82rem; color: var(--stone-2); }}

/* ---- comparison table ----------------------------------------------- */
.cmp {{ width: 100%; border-collapse: collapse; background: var(--paper); border: 1px solid var(--stone); font-size: .94rem; }}
.cmp th, .cmp td {{ padding: .95rem 1.1rem; text-align: left; border-bottom: 1px solid var(--stone); }}
.cmp thead th {{ font-family: var(--font-display); font-size: .68rem; font-weight: 700;
  letter-spacing: .18em; text-transform: uppercase; color: var(--stone-2); background: var(--mist); }}
.cmp tbody th {{ font-weight: 500; color: var(--ink); }}
.cmp .us {{ background: rgba(47,127,147,.06); font-weight: 600; color: var(--ink); }}
.cmp thead th.us {{ color: var(--water); background: rgba(47,127,147,.1); }}
.yes::before {{ content: "\\25CF"; color: var(--water); margin-right: .5rem; }}
.no::before  {{ content: "\\25CB"; color: var(--stone-2); margin-right: .5rem; }}
.cmp-wrap {{ overflow-x: auto; }}

/* ---- reviews --------------------------------------------------------- */
.rev-grid {{ display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); }}
.rev {{ margin: 0; background: var(--paper); border: 1px solid var(--stone); padding: 1.75rem; display: grid; gap: .9rem; align-content: start; }}
.rev-stars {{ color: var(--brass); letter-spacing: .16em; font-size: .9rem; }}
.rev blockquote {{ margin: 0; font-size: .98rem; color: #46554f; }}
.rev figcaption {{ font-family: var(--font-display); font-weight: 700; font-size: .82rem;
  letter-spacing: .06em; text-transform: uppercase; color: var(--ink); }}
.rev figcaption span {{ display: block; font-family: var(--font-body); font-weight: 400;
  letter-spacing: 0; text-transform: none; font-size: .8rem; color: var(--stone-2); margin-top: .15rem; }}

/* ---- team ------------------------------------------------------------ */
.team-grid {{ display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(240px,1fr)); }}
.tm img {{ aspect-ratio: 3/4; width: 100%; object-fit: cover; }}
.tm h3 {{ font-size: 1.05rem; margin-top: 1rem; }}
.tm p {{ font-size: .9rem; color: #5b6b68; margin-top: .3rem; }}

/* ---- memberships ------------------------------------------------------ */
.tiers {{ display: grid; gap: 1.5rem; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); }}
.tier {{ background: var(--paper); border: 1px solid var(--stone); padding: 1.9rem; display: flex; flex-direction: column; gap: 1rem; }}
.tier.hi {{ border-color: var(--water); }}
.tier h3 {{ font-size: 1.35rem; text-transform: uppercase; }}
.tier .price {{ font-family: var(--font-display); font-weight: 700; font-size: 2.4rem;
  letter-spacing: -.03em; line-height: 1; color: var(--water); }}
.tier .price span {{ font-family: var(--font-body); font-size: .85rem; font-weight: 400; color: var(--stone-2); letter-spacing: 0; }}
.tier ul {{ list-style: none; margin: 0; padding: 0; display: grid; gap: .55rem; }}
.tier li {{ font-size: .93rem; color: #5b6b68; padding-left: 1.3rem; position: relative; }}
.tier li::before {{ content: "\\2014"; position: absolute; left: 0; color: var(--brass); }}
.tier .btn {{ margin-top: auto; }}

/* ---- FAQ -------------------------------------------------------------- */
.faq {{ border-bottom: 1px solid var(--stone); }}
.faq summary {{ list-style: none; cursor: pointer; padding: 1.15rem 0; display: flex;
  align-items: center; justify-content: space-between; gap: 1rem;
  font-family: var(--font-display); font-weight: 700; font-size: 1.02rem; color: var(--ink); }}
.faq summary::-webkit-details-marker {{ display: none; }}
.faq summary i {{ width: 14px; height: 14px; position: relative; flex: none; }}
.faq summary i::before, .faq summary i::after {{
  content: ""; position: absolute; background: var(--water); transition: transform .25s; }}
.faq summary i::before {{ inset: 6px 0 6px 0; height: 2px; }}
.faq summary i::after  {{ inset: 0 6px 0 6px; width: 2px; }}
.faq[open] summary i::after {{ transform: scaleY(0); }}
.faq-a {{ padding: 0 0 1.2rem; max-width: 62ch; color: #5b6b68; font-size: .96rem; }}

/* ---- contact ----------------------------------------------------------- */
.contact {{ position: relative; background: var(--ink); color: #e9efee; overflow: hidden; }}
.contact > img {{ position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .22; filter: blur(3px); }}
.contact .wrap {{ position: relative; }}
.contact .display {{ color: #fff; }}
.contact .eyebrow {{ color: var(--water-2); }}
.contact-grid {{ display: grid; gap: 2rem; }}
@media (min-width: 900px) {{ .contact-grid {{ grid-template-columns: 1fr 1fr; gap: 3rem; }} }}
.card {{ background: var(--paper); color: var(--text); padding: clamp(1.6rem,3vw,2.2rem); display: grid; gap: .9rem; }}
.card h3 {{ font-size: 1.2rem; text-transform: uppercase; }}
.field {{ display: grid; gap: .35rem; }}
.field label {{ font-family: var(--font-display); font-size: .66rem; font-weight: 700;
  letter-spacing: .18em; text-transform: uppercase; color: var(--stone-2); }}
.field input, .field textarea {{
  font-family: var(--font-body); font-size: .95rem; padding: .75rem .9rem;
  border: 1px solid var(--stone); background: var(--mist); color: var(--text); width: 100%; }}
.field input:focus, .field textarea:focus {{ outline: 2px solid var(--water); outline-offset: 1px; }}
.info dl {{ margin: 0; display: grid; gap: 1.4rem; }}
.info dt {{ font-family: var(--font-display); font-size: .66rem; font-weight: 700;
  letter-spacing: .2em; text-transform: uppercase; color: var(--water-2); }}
.info dd {{ margin: .35rem 0 0; color: rgba(233,239,238,.85); font-size: .97rem; }}
.info a {{ color: #fff; }}

/* ---- footer -------------------------------------------------------------- */
footer {{ background: var(--ink-2); color: rgba(233,239,238,.72); padding: 3rem 0 6rem; font-size: .88rem; }}
footer a {{ color: rgba(233,239,238,.72); text-decoration: none; }}
footer a:hover {{ color: #fff; }}
.foot-grid {{ display: flex; flex-wrap: wrap; gap: 1rem 2rem; justify-content: space-between; align-items: center; }}

/* ---- mobile-only booking bar (desktop keeps the header nav) ------------- */
.dock {{ display: none; }}
@media (max-width: 768px) {{
  .dock {{
    display: grid; grid-template-columns: 1fr 1fr; gap: .5rem;
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 120;
    padding: .55rem .75rem calc(.55rem + env(safe-area-inset-bottom));
    background: rgba(255,255,255,.97); border-top: 1px solid var(--stone);
  }}
  .dock .btn {{ min-height: 46px; }}
  footer {{ padding-bottom: 6.5rem; }}
}}
:focus-visible {{ outline: 2px solid var(--water); outline-offset: 2px; }}
</style>

<div style="background:#7a1f14;color:#fff;font:700 11px/1.5 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;text-align:center;padding:7px 14px">
  Draft redesign — not live · fallingwatersdayspa.com is unchanged
</div>

<div class="announce">
  <span class="eyebrow">Treehouse members save 10%</span>
  <span>Same-day appointments welcome — call <a href="{TEL}">(801) 501-9000</a> or walk in.</span>
</div>

<nav class="nav">
  <div class="wrap nav-in">
    <a class="nav-logo" href="/"><img src="{IMG['logo']}" alt="Falling Waters" width="1280" height="1280"><img src="{IMG['logotext']}" alt="Falling Waters Day Spa &amp; Salon" width="1280" height="233"></a>
    <ul class="nav-links">
      <li><a href="/services/massage">Massage</a></li>
      <li><a href="/services/facials">Facials</a></li>
      <li><a href="/services/hair-care">Hair</a></li>
      <li><a href="/services/nails">Nails</a></li>
      <li><a href="#packages">Packages</a></li>
      <li><a href="#visit">Visit</a></li>
    </ul>
    <a class="btn btn-solid" href="{BOOK}">Book now</a>
  </div>
</nav>

<section class="hero">
  <img src="{IMG['hero']}" alt="Fresh rose arrangement at Falling Waters Day Spa in Draper, Utah" width="1400" height="900">
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <span class="eyebrow">Draper, Utah · Est. 1998</span>
    <h1>Where Draper <em>unwinds.</em>
      <span class="h1-sub">Falling Waters is a full-service day spa &amp; salon in Draper, Utah — massage, HydraFacial, hair, nails, brows &amp; lashes, all under one roof inside Treehouse Athletic Club. Open to the public.</span>
    </h1>
    <div class="hero-cta">
      <a class="btn btn-solid" href="{BOOK}">Book your escape</a>
      <a class="btn btn-light" href="#packages">See packages</a>
    </div>
  </div>
</section>

<div class="band">
  <div class="wrap band-grid">
    <div><div class="n">27+</div><div class="l">Years serving Draper, since 1998</div></div>
    <div><div class="n">4.4★</div><div class="l">Across 136+ Google reviews</div></div>
    <div><div class="n">50+</div><div class="l">Spa &amp; salon services under one roof</div></div>
    <div><div class="n">59+</div><div class="l">Combined years of licensed experience</div></div>
  </div>
</div>

<section id="services">
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">The menu</span><h2 class="display">Everything under one roof.</h2></div>
      <p class="lede">Massage, facials, hair, nails, lashes and waxing — certified professionals, one address, one booking. Prices start where they say they start.</p>
    </div>
    <div class="svc-grid">{''.join(svc_card(i,s) for i,s in enumerate(SERVICES))}</div>
    <p class="lede rv" style="margin-top:2rem">Also serving guests from
      <a href="/areas/sandy">Sandy</a>, <a href="/areas/south-jordan">South Jordan</a>,
      <a href="/areas/riverton">Riverton</a>, <a href="/areas/cottonwood-heights">Cottonwood Heights</a>
      &amp; <a href="/areas/holladay">Holladay</a>.</p>
  </div>
</section>

<section id="packages" style="background:var(--paper);border-block:1px solid var(--stone)">
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">Packages</span><h2 class="display">Make a day of it.</h2></div>
      <p class="lede">More than treatments — these are the ones people book for anniversaries, birthdays and the week they finally stop.</p>
    </div>
    {''.join(pkg_row(i,p) for i,p in enumerate(PACKAGES))}
  </div>
</section>

<section>
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">Why here</span><h2 class="display">What a full-service spa gets you.</h2></div>
      <p class="lede">Most places in the valley do one thing. Booking a massage, a facial and a cut usually means three businesses and three calendars.</p>
    </div>
    <div class="cmp-wrap rv">
      <table class="cmp">
        <thead><tr><th>&nbsp;</th><th class="us">Falling Waters</th><th>Single-service studio</th><th>Chain spa</th></tr></thead>
        <tbody>
          <tr><th>Massage, facials, hair &amp; nails in one visit</th><td class="us yes">Yes</td><td class="no">No</td><td class="no">Rarely</td></tr>
          <tr><th>Couples suite for side-by-side treatments</th><td class="us yes">Yes</td><td class="no">No</td><td class="no">Sometimes</td></tr>
          <tr><th>Same licensed team since 1998</th><td class="us yes">27+ years</td><td class="no">Varies</td><td class="no">High turnover</td></tr>
          <tr><th>Gym membership discount</th><td class="us yes">10% for TAC members</td><td class="no">No</td><td class="no">No</td></tr>
          <tr><th>Free on-site parking</th><td class="us yes">Yes</td><td class="no">Street</td><td class="no">Often paid</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section style="background:var(--paper);border-block:1px solid var(--stone)">
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">Reviews</span><h2 class="display">In their words.</h2></div>
      <p class="lede">4.4 stars across 136+ Google reviews. Guests name the people, which is usually the tell.</p>
    </div>
    <div class="rev-grid">{''.join(review(i,r) for i,r in enumerate(REVIEWS))}</div>
  </div>
</section>

<section id="team">
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">Your therapists</span><h2 class="display">Seasoned hands.</h2></div>
      <p class="lede">Licensed massage therapists, aestheticians and stylists — a combined 59+ years of professional experience, including favorites like Alicia, Holland and Jaiden.</p>
    </div>
    <div class="team-grid">
      <div class="tm rv"><img src="{IMG['team1']}" alt="Licensed massage therapist at Falling Waters" loading="lazy" decoding="async" width="600" height="800"><h3>Licensed Massage Therapists</h3><p>Swedish, deep tissue &amp; more — decades of hands-on care.</p></div>
      <div class="tm rv" style="transition-delay:80ms"><img src="{IMG['team2']}" alt="Licensed aesthetician at Falling Waters" loading="lazy" decoding="async" width="600" height="800"><h3>Licensed Aestheticians</h3><p>HydraFacial, peels &amp; custom facials.</p></div>
      <div class="tm rv" style="transition-delay:160ms"><img src="{IMG['team3']}" alt="Hair stylist at Falling Waters" loading="lazy" decoding="async" width="600" height="800"><h3>Hair Stylists</h3><p>Cuts, color &amp; styling — including favorites like Alicia &amp; Holland.</p></div>
    </div>
  </div>
</section>

<section id="memberships" style="background:var(--paper);border-block:1px solid var(--stone)">
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">Memberships</span><h2 class="display">Make it a habit, not a treat.</h2></div>
      <p class="lede">Regular guests get better results and better rates. Two ways to keep coming back.</p>
    </div>
    <div class="tiers">
      <div class="tier hi rv">
        <span class="eyebrow" style="margin:0">Most popular</span>
        <h3>Massage Club</h3>
        <div class="price">$89<span> / month</span></div>
        <ul><li>One 50-minute Swedish or deep-tissue massage every month</li><li>10% off every additional service</li><li>Unused sessions roll over for 90 days</li><li>Priority booking on weekends</li></ul>
        <a class="btn btn-solid" href="{TEL}">Call to join</a>
      </div>
      <div class="tier rv" style="transition-delay:80ms">
        <span class="eyebrow" style="margin:0">Already a member</span>
        <h3>Treehouse Athletic Club</h3>
        <div class="price">10%<span> off, always</span></div>
        <ul><li>10% off all spa &amp; salon services</li><li>No enrollment — just mention your membership</li><li>Stacks with seasonal offers</li><li>Free parking at the club</li></ul>
        <a class="btn btn-ghost" href="{BOOK}">Book your visit</a>
      </div>
    </div>
    <p class="lede rv" style="margin-top:1.5rem;font-size:.85rem;color:var(--stone-2)">Gift cards $50–$500, any amount, never expire — in person or by phone at (801) 501-9000.</p>
  </div>
</section>

<section id="faq">
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">Good to know</span><h2 class="display">Before your visit.</h2></div>
      <p class="lede">Everything you need to know before you arrive.</p>
    </div>
    <div class="rv">{''.join(faq(q,a) for q,a in FAQS)}</div>
  </div>
</section>

<section class="contact" id="visit">
  <img src="{IMG['girls']}" alt="" aria-hidden="true">
  <div class="wrap">
    <div class="sec-head rv">
      <div><span class="eyebrow">Visit</span><h2 class="display">Inside Treehouse Athletic Club.</h2></div>
      <p class="lede" style="color:rgba(233,239,238,.85)">Open to the public — you do not need to be a club member to book.</p>
    </div>
    <div class="contact-grid">
      <div class="info rv">
        <dl>
          <div><dt>Location</dt><dd>1101 E Draper Parkway<br>Draper, UT 84020<br>Inside Treehouse Athletic Club</dd></div>
          <div><dt>Phone</dt><dd><a href="{TEL}">(801) 501-9000</a></dd></div>
          <div><dt>Hours</dt><dd>Mon–Fri 9am – 6pm<br>Sat 9am – 4pm<br>Closed Sunday</dd></div>
          <div><dt>Follow</dt><dd><a href="https://www.instagram.com/fallingwaters_dayspa/">@fallingwaters_dayspa</a></dd></div>
        </dl>
      </div>
      <form class="card rv" style="transition-delay:80ms" onsubmit="return false">
        <h3>Ask us anything</h3>
        <p style="font-size:.92rem;color:#5b6b68">Not sure which treatment? Tell us what you are after and we will point you the right way.</p>
        <div class="field"><label for="n">Name</label><input id="n" name="name" autocomplete="name"></div>
        <div class="field"><label for="e">Email</label><input id="e" name="email" type="email" autocomplete="email"></div>
        <div class="field"><label for="m">What are you looking for?</label><textarea id="m" name="message" rows="3"></textarea></div>
        <button class="btn btn-solid" type="submit">Send</button>
        <p style="font-size:.78rem;color:var(--stone-2)">Draft only — this form is not wired up yet.</p>
      </form>
    </div>
  </div>
</section>

<footer>
  <div class="wrap foot-grid">
    <div>© 2026 Falling Waters Day Spa &amp; Salon · 1101 E Draper Parkway, Draper, UT 84020</div>
    <div style="display:flex;gap:1.25rem"><a href="/blog/">Blog</a><a href="/services/gift-cards">Gift cards</a><a href="#visit">Contact</a></div>
  </div>
</footer>

<div class="dock">
  <a class="btn btn-solid" href="{BOOK}">Book now</a>
  <a class="btn btn-ghost" href="{TEL}">Call</a>
</div>

{''.join(schema)}

<script>
(function () {{
  var d = document.documentElement;
  if (!('IntersectionObserver' in window)) return;      // net 1: no IO, no hiding
  d.classList.add('anim');
  var els = [].slice.call(document.querySelectorAll('.rv'));
  var io = new IntersectionObserver(function (rows) {{
    rows.forEach(function (r) {{ if (r.isIntersecting) {{ r.target.classList.add('shown'); io.unobserve(r.target); }} }});
  }}, {{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 }});
  els.forEach(function (el) {{ io.observe(el); }});
  // net 2: anything still hidden after 3s gets shown regardless
  setTimeout(function () {{ els.forEach(function (el) {{ el.classList.add('shown'); }}); }}, 3000);
  // net 3: never leave content hidden if the tab was restored from bfcache
  window.addEventListener('pageshow', function () {{ els.forEach(function (el) {{ el.classList.add('shown'); }}); }});
}})();
</script>
'''

HTML = "".join(c if ord(c) < 128 else "&#%d;" % ord(c) for c in HTML)
pathlib.Path("/tmp/fw-redesign.html").write_text(HTML, encoding="ascii")
print("schema blocks carried:", len(schema))
print("assets embedded:", len(_cache))
print("size:", pathlib.Path("/tmp/fw-redesign.html").stat().st_size // 1024, "KB")
