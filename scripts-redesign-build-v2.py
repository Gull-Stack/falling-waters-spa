"""Falling Waters — v2 redesign.

v1 was graded B-minus: cold, monotone after the hero, and the photography
clashed. Three changes drive this pass.

1. WARM palette. Measured the photos: 7 of 9 sit in a 9-34deg amber/clay band.
   v1's neutrals were cold greys (#f4f6f5 / #34423f) fighting every image.
   Ground is now linen; the accent is brass, drawn from the photos themselves.
2. RHYTHM. v1 went light-and-grey for eleven straight sections. This one
   alternates linen / deep green-black the whole way down, so colour never dies.
3. ONE IMAGE TREATMENT. A warm multiply tint plus a slight desaturation pulls
   the pink hair shot and the green facial shot back toward the amber majority,
   so nine pieces of mismatched stock read as one set.

Content, prices, review text, FAQ answers, hours and JSON-LD are verbatim from
index.html. Nothing here is invented.
"""
import base64, mimetypes, pathlib, re

ROOT = pathlib.Path("/home/user/falling-waters-spa")
src = (ROOT / "index.html").read_text()
fonts = pathlib.Path("/tmp/fonts2.css").read_text()

_cache = {}
def uri(rel):
    if rel in _cache: return _cache[rel]
    p = ROOT / rel.lstrip("/")
    if not p.exists(): raise SystemExit("missing asset: " + rel)
    mt = mimetypes.guess_type(p.name)[0] or "application/octet-stream"
    _cache[rel] = "data:%s;base64,%s" % (mt, base64.b64encode(p.read_bytes()).decode())
    return _cache[rel]

IMG = {k: uri(v) for k, v in {
    "hero": "/assets/images/services/relaxation.webp",
    "massage": "/assets/images/services/massage.webp",
    "facial": "/assets/images/services/facial.webp",
    "hair": "/assets/images/services/hair.webp",
    "nails": "/assets/images/services/nails.webp",
    "brows": "/assets/images/services/brows.webp",
    "waxing": "/assets/images/services/waxing.webp",
    "couples": "/assets/images/services/couples.webp",
    "girls": "/assets/images/services/girls-day.webp",
    "team1": "/assets/images/team/massage-therapist.webp",
    "team2": "/assets/images/team/aesthetician.webp",
    "team3": "/assets/images/team/hair-stylist.webp",
    "logo": "/assets/images/logo.webp",
    "logotext": "/assets/images/logo-text.webp",
}.items()}

schema = re.findall(r'<script type="application/ld\+json">.*?</script>', src, re.S)

# grain — one tiny SVG, no image request
GRAIN = ("data:image/svg+xml;base64," + base64.b64encode(
    b'<svg xmlns="http://www.w3.org/2000/svg" width="140" height="140">'
    b'<filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3"/>'
    b'<feColorMatrix type="saturate" values="0"/></filter>'
    b'<rect width="140" height="140" filter="url(#n)" opacity="0.42"/></svg>').decode())

SERVICES = [
    ("Massage Therapy", "Swedish, deep tissue, hot stone &amp; prenatal massage. Melt away tension.", "105", "/services/massage", "massage"),
    ("Skin Care &amp; Facials", "HydraFacial, chemical peels, microdermabrasion &amp; custom facials for radiant skin.", "65", "/services/facials", "facial"),
    ("Hair Services", "Expert cuts, color, highlights, balayage &amp; styling from talented stylists.", "55", "/services/hair-care", "hair"),
    ("Nail Care", "Luxurious manicures &amp; pedicures with gel polish options for beautiful hands &amp; feet.", "40", "/services/nails", "nails"),
    ("Brows &amp; Lashes", "Lash extensions, lifts, brow shaping &amp; tinting for that perfect frame.", "23", "https://go.booker.com/#/location/fallingwaters", "brows"),
    ("Waxing", "Professional waxing services for smooth, long-lasting results.", "20", "/services/waxing", "waxing"),
]
PACKAGES = [
    ("The Ultimate Spa Day", "207", "The full-body reset: 50-minute Swedish massage, 60-minute custom facial, and a luxury spa pedicure. Relax, refresh, renew.", "girls"),
    ("The Bloom &amp; Bliss Couples Experience", "349", "80 minutes of side-by-side Swedish massage &mdash; plus a flower bouquet to take home. Relax. Reconnect. Leave with flowers.", "couples"),
    ("The Birthday Glow Experience", "210", "Your day, your way: 60 min custom facial, 50 min Swedish massage, and a floral arrangement to take home. You deserve it.", "facial"),
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

def svc(i, s):
    name, desc, price, href, img = s
    pl = "Women from" if img == "hair" else "From"
    return f'''
      <a class="svc rv" href="{href}" style="transition-delay:{i*55}ms">
        <span class="svc-idx">{i+1:02d}</span>
        <figure class="ph"><img src="{IMG[img]}" alt="" loading="lazy" decoding="async" width="800" height="600"></figure>
        <div class="svc-b">
          <h3>{name}</h3>
          <p>{desc}</p>
          <span class="price"><em>{pl}</em> $<b>{price}</b></span>
        </div>
      </a>'''

def pkg(i, p):
    name, price, desc, img = p
    return f'''
      <article class="pkg rv" style="transition-delay:{i*70}ms">
        <figure class="ph pkg-ph"><img src="{IMG[img]}" alt="" loading="lazy" decoding="async" width="1000" height="700"></figure>
        <div class="pkg-b">
          <span class="idx">{i+1:02d}</span>
          <h3>{name}</h3>
          <p>{desc}</p>
          <div class="rule"></div>
          <div class="pkg-f">
            <span class="pkg-price"><em>Starting at</em> $<b>{price}</b></span>
            <a class="btn btn-brass" href="{TEL}">Call to reserve</a>
          </div>
          <p class="fine">Packages combine multiple providers, so they are booked by phone &mdash; (801) 501-9000.</p>
        </div>
      </article>'''

def rev(i, r):
    who, quote = r
    return f'''
      <figure class="rev rv" style="transition-delay:{i*65}ms">
        <div class="quote-mark" aria-hidden="true">&ldquo;</div>
        <blockquote>{quote}</blockquote>
        <figcaption><span class="stars" aria-label="5 out of 5">&#9733;&#9733;&#9733;&#9733;&#9733;</span>{who}<em>Google Review</em></figcaption>
      </figure>'''

def faq(q, a):
    return f'''
      <details class="faq"><summary><span>{q}</span><i aria-hidden="true"></i></summary>
      <div class="faq-a"><p>{a}</p></div></details>'''

RIPPLE = ('<svg class="ripple" viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true">'
          + "".join(f'<path d="M {i*30-15} 34 a 15 15 0 0 1 30 0" fill="none" stroke="currentColor" stroke-width="1.1"/>' for i in range(22))
          + "".join(f'<path d="M {i*30} 20 a 15 15 0 0 1 30 0" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".55"/>' for i in range(22))
          + '</svg>')

HTML = f'''<meta name="robots" content="noindex,nofollow">
<title>Falling Waters v2</title>
<style>
{fonts}
:root {{
  /* warm ground, drawn from their own photography (7 of 9 sit 9-34deg) */
  --linen:    #f3ede2;
  --linen-2:  #e9e0d0;
  --paper:    #fbf8f2;
  --ink:      #101a16;
  --ink-2:    #17241f;
  --ink-3:    #1e2f28;
  --jade:     #2c6154;
  --brass:    #b3874f;
  --brass-2:  #d9b483;
  --water:    #4f9a92;
  --text:     #40453f;
  --text-2:   #6b6f66;
  --on-dark:  #ece4d6;
  --on-dark-2:#a8a89b;
  --line:     #d8cdb8;
  --line-dk:  rgba(236,228,214,.16);
  --fd: 'Archivo', ui-sans-serif, system-ui, sans-serif;
  --fb: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --pad: clamp(1.25rem, 4vw, 2.25rem);
  --max: 1200px;
}}
* {{ box-sizing: border-box; }}
body {{ margin:0; background:var(--linen); color:var(--text); font-family:var(--fb);
  font-size:16.5px; line-height:1.68; -webkit-font-smoothing:antialiased; overflow-x:hidden; }}
img {{ max-width:100%; display:block; }}
a {{ color:inherit; }}
::selection {{ background: var(--brass); color: #1a1208; }}
:focus-visible {{ outline:2px solid var(--brass); outline-offset:3px; }}

/* grain over the whole page — the single cheapest "not a template" tell */
body::after {{ content:""; position:fixed; inset:0; z-index:200; pointer-events:none;
  background-image:url("{GRAIN}"); opacity:.055; mix-blend-mode:multiply; }}

.wrap {{ margin:0 auto; width:100%; max-width:var(--max); padding-inline:var(--pad); }}
section {{ padding: clamp(4rem, 8.5vw, 7rem) 0; position:relative; }}

/* ---------- dark sections carry the rhythm; v1 died into grey ---------- */
.dark {{ background:var(--ink); color:var(--on-dark); }}
.dark h2, .dark h3, .dark .display {{ color:#fff; }}
.dark p {{ color:rgba(236,228,214,.78); }}
.jade {{ background:var(--jade); color:var(--on-dark); }}

/* ---------- type ---------- */
.display {{ font-family:var(--fd); font-weight:700; text-transform:uppercase;
  letter-spacing:-.032em; line-height:.93; margin:0; color:var(--ink); }}
h2.display {{ font-size:clamp(2rem,5.4vw,3.6rem); max-width:17ch; }}
h3 {{ font-family:var(--fd); font-weight:700; letter-spacing:-.018em; margin:0; color:var(--ink); }}
p {{ margin:0; }}
.eyebrow {{ font-family:var(--fd); font-size:.68rem; font-weight:600; text-transform:uppercase;
  letter-spacing:.26em; color:var(--brass); margin:0 0 1rem; display:block; }}
.dark .eyebrow, .jade .eyebrow {{ color:var(--brass-2); }}
.lede {{ margin-top:1.5rem; max-width:50ch; font-size:1.07rem; color:var(--text-2); }}
.dark .lede {{ color:rgba(236,228,214,.72); }}
.rule {{ height:1px; background:var(--line); margin:.4rem 0; }}
.dark .rule {{ background:var(--line-dk); }}

/* prices: tabular, brass, the numeral doing the work */
.price, .pkg-price {{ font-family:var(--fd); color:var(--brass); font-variant-numeric:tabular-nums;
  display:inline-flex; align-items:baseline; gap:.32rem; letter-spacing:-.01em; }}
.price em, .pkg-price em {{ font-family:var(--fb); font-style:normal; font-size:.74rem;
  font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:var(--text-2); }}
.price b {{ font-size:1.5rem; font-weight:700; }}
.pkg-price b {{ font-size:2.1rem; font-weight:700; }}
.dark .pkg-price em {{ color:var(--on-dark-2); }}
.dark .pkg-price, .dark .price {{ color:var(--brass-2); }}

/* ---------- buttons ---------- */
.btn {{ display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:50px;
  padding:.9rem 1.75rem; border-radius:2px; font-family:var(--fd); font-size:.73rem; font-weight:700;
  letter-spacing:.16em; text-transform:uppercase; text-decoration:none; border:1px solid transparent;
  transition:background .22s,color .22s,border-color .22s; }}
.btn-brass {{ background:var(--brass); color:#1a1208; }}
.btn-brass:hover {{ background:var(--brass-2); }}
.btn-ink {{ background:var(--ink); color:var(--on-dark); }}
.btn-ink:hover {{ background:var(--jade); }}
.btn-out {{ border-color:var(--line); color:var(--ink); }}
.btn-out:hover {{ background:var(--ink); color:var(--on-dark); border-color:var(--ink); }}
.btn-light {{ border-color:rgba(255,255,255,.45); color:#fff; }}
.btn-light:hover {{ background:#fff; color:var(--ink); }}

/* ---------- ONE image treatment: unifies nine mismatched stock photos ---------- */
.ph {{ margin:0; position:relative; overflow:hidden; background:var(--ink); }}
.ph img {{ width:100%; height:100%; object-fit:cover;
  filter:saturate(.58) contrast(1.08) brightness(.97) sepia(.12); transition:transform .7s cubic-bezier(.22,.61,.36,1); }}
.ph::after {{ content:""; position:absolute; inset:0; pointer-events:none;
  background:linear-gradient(160deg, rgba(179,135,79,.38), rgba(44,97,84,.32));
  mix-blend-mode:multiply; }}
a:hover .ph img, .pkg:hover .ph img {{ transform:scale(1.045); }}

/* ---------- announce + nav ---------- */
.announce {{ background:var(--ink-2); color:var(--on-dark); font-size:.8rem; display:flex;
  gap:.4rem 1rem; flex-wrap:wrap; align-items:baseline; justify-content:center; padding:.65rem var(--pad); }}
.announce .eyebrow {{ margin:0; font-size:.6rem; color:var(--brass-2); }}
.announce a {{ color:#fff; font-weight:600; text-decoration:none; border-bottom:1px solid var(--brass);
  padding-bottom:1px; white-space:nowrap; }}
.nav {{ position:sticky; top:0; z-index:90; background:rgba(243,237,226,.9);
  backdrop-filter:blur(14px) saturate(1.2); border-bottom:1px solid var(--line); }}
.nav-in {{ display:flex; align-items:center; justify-content:space-between; gap:1rem; padding-block:.75rem; }}
.nav-logo {{ display:flex; align-items:center; gap:.6rem; text-decoration:none; }}
.nav-logo img:first-child {{ height:40px; width:auto; }}
.nav-logo img:last-child {{ height:19px; width:auto; }}
.nav-links {{ display:flex; align-items:center; gap:1.7rem; list-style:none; margin:0; padding:0; }}
.nav-links a {{ text-decoration:none; font-size:.87rem; color:var(--ink); position:relative; padding-bottom:3px; }}
.nav-links a::after {{ content:""; position:absolute; left:0; right:100%; bottom:0; height:1px;
  background:var(--brass); transition:right .3s cubic-bezier(.22,.61,.36,1); }}
.nav-links a:hover::after {{ right:0; }}
@media (max-width:920px) {{ .nav-links {{ display:none; }} }}

/* ---------- hero ---------- */
.hero {{ position:relative; min-height:88svh; display:flex; align-items:flex-end;
  overflow:hidden; padding:0; background:var(--ink); }}
.hero > img {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  filter:saturate(.52) contrast(1.07) brightness(.9) sepia(.14); }}
.hero-scrim {{ position:absolute; inset:0; background:
  linear-gradient(to top, rgba(16,26,22,.97) 2%, rgba(16,26,22,.80) 30%, rgba(16,26,22,.42) 66%, rgba(16,26,22,.30) 100%),
  radial-gradient(130% 95% at 12% 100%, rgba(44,97,84,.68), transparent 62%),
  linear-gradient(150deg, rgba(179,135,79,.20), rgba(44,97,84,.24)); }}
.hero-in {{ position:relative; width:100%; padding-top:9rem; padding-bottom:clamp(3rem,6vw,4.5rem); }}
.hero .eyebrow {{ color:var(--brass-2); }}
.hero h1 {{ font-family:var(--fd); font-weight:800; text-transform:uppercase; letter-spacing:-.038em;
  line-height:.9; color:#fff; margin:0; font-size:clamp(2.7rem,9.4vw,6.4rem); max-width:13ch; }}
.hero h1 em {{ font-style:normal; color:var(--brass-2); }}
.hero h1 .sub {{ display:block; margin-top:1.35rem; font-family:var(--fb); font-weight:400;
  text-transform:none; letter-spacing:0; line-height:1.55; font-size:clamp(.96rem,1.5vw,1.09rem);
  color:rgba(236,228,214,.84); max-width:47ch; }}
.hero-cta {{ display:flex; flex-wrap:wrap; gap:.75rem; margin-top:2.25rem; }}
.ripple {{ display:block; width:100%; height:34px; color:var(--brass); opacity:.42; }}

/* ---------- stat band ---------- */
.band {{ padding:clamp(2.75rem,5vw,3.75rem) 0; }}
.band-g {{ display:grid; grid-template-columns:repeat(auto-fit,minmax(158px,1fr)); gap:2rem 1.5rem; }}
.band .n {{ font-family:var(--fd); font-weight:700; letter-spacing:-.035em; font-size:clamp(2.1rem,4.4vw,3.1rem);
  line-height:1; color:#fff; font-variant-numeric:tabular-nums; }}
.band .l {{ margin-top:.55rem; font-size:.87rem; color:rgba(236,228,214,.66); max-width:21ch; }}

/* ---------- section head ---------- */
.head {{ display:grid; gap:1rem; margin-bottom:clamp(2.25rem,4vw,3.25rem); }}
@media (min-width:900px) {{
  .head {{ grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr); align-items:end; gap:2.75rem; }}
  .head .lede {{ margin-top:0; padding-bottom:.4rem; }}
}}

/* ---------- services ---------- */
.svc-g {{ display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit,minmax(285px,1fr)); }}
.svc {{ text-decoration:none; background:var(--paper); border:1px solid var(--line);
  display:flex; flex-direction:column; position:relative; transition:border-color .28s,transform .28s,box-shadow .28s; }}
.svc:hover {{ border-color:var(--brass); transform:translateY(-4px); box-shadow:0 18px 40px -24px rgba(16,26,22,.5); }}
.svc-idx {{ position:absolute; top:.85rem; left:.95rem; z-index:2; font-family:var(--fd); font-size:.62rem;
  font-weight:700; letter-spacing:.22em; color:rgba(255,255,255,.85); }}
.svc .ph {{ aspect-ratio:4/3; }}
.svc-b {{ padding:1.5rem 1.5rem 1.7rem; display:grid; gap:.6rem; }}
.svc-b h3 {{ font-size:1.16rem; text-transform:uppercase; letter-spacing:-.01em; }}
.svc-b p {{ font-size:.92rem; color:var(--text-2); }}

/* ---------- packages (dark) ---------- */
.pkg {{ display:grid; gap:0; border:1px solid var(--line-dk); margin-bottom:1.75rem; background:var(--ink-2); }}
@media (min-width:880px) {{
  .pkg {{ grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); }}
  .pkg:nth-child(even) .pkg-ph {{ order:2; }}
}}
.pkg-ph {{ min-height:300px; }}
.pkg-b {{ padding:clamp(1.75rem,3.6vw,3rem); display:grid; gap:.95rem; align-content:center; }}
.idx {{ font-family:var(--fd); font-size:2.6rem; font-weight:700; line-height:1; letter-spacing:-.04em;
  color:transparent; -webkit-text-stroke:1px var(--brass); opacity:.75; }}
.pkg-b h3 {{ font-size:clamp(1.4rem,2.7vw,2rem); text-transform:uppercase; letter-spacing:-.025em; line-height:1.04; }}
.pkg-f {{ display:flex; flex-wrap:wrap; align-items:center; gap:1.25rem; }}
.fine {{ font-size:.8rem; color:var(--on-dark-2) !important; }}

/* ---------- comparison ---------- */
.cmp-w {{ overflow-x:auto; border:1px solid var(--line); background:var(--paper); }}
.cmp {{ width:100%; border-collapse:collapse; font-size:.94rem; min-width:600px; }}
.cmp th,.cmp td {{ padding:1rem 1.15rem; text-align:left; border-bottom:1px solid var(--line); }}
.cmp thead th {{ font-family:var(--fd); font-size:.66rem; font-weight:700; letter-spacing:.2em;
  text-transform:uppercase; color:var(--text-2); background:var(--linen-2); }}
.cmp tbody th {{ font-weight:500; color:var(--ink); }}
.cmp .us {{ background:rgba(179,135,79,.09); font-weight:600; color:var(--ink); }}
.cmp thead th.us {{ color:var(--brass); background:rgba(179,135,79,.16); }}
.cmp tr:last-child td,.cmp tr:last-child th {{ border-bottom:none; }}
.yes::before {{ content:"\\25CF"; color:var(--brass); margin-right:.55rem; }}
.no::before {{ content:"\\25CB"; color:#b9b2a2; margin-right:.55rem; }}

/* ---------- reviews (dark) ---------- */
.rev-g {{ display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); }}
.rev {{ margin:0; padding:2rem 1.85rem; background:var(--ink-2); border:1px solid var(--line-dk);
  display:grid; gap:1rem; align-content:start; position:relative; }}
.quote-mark {{ font-family:var(--fd); font-size:4rem; line-height:.6; color:var(--brass); opacity:.5; }}
.rev blockquote {{ margin:0; font-size:.98rem; color:rgba(236,228,214,.86); }}
.rev figcaption {{ font-family:var(--fd); font-weight:700; font-size:.8rem; letter-spacing:.08em;
  text-transform:uppercase; color:#fff; display:grid; gap:.3rem; }}
.stars {{ color:var(--brass-2); letter-spacing:.2em; font-size:.78rem; }}
.rev figcaption em {{ font-family:var(--fb); font-style:normal; font-weight:400; letter-spacing:0;
  text-transform:none; font-size:.79rem; color:var(--on-dark-2); }}

/* ---------- team ---------- */
.team-g {{ display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit,minmax(235px,1fr)); }}
.tm .ph {{ aspect-ratio:3/4; }}
.tm h3 {{ font-size:1.02rem; margin-top:1.1rem; text-transform:uppercase; letter-spacing:-.005em; }}
.tm p {{ font-size:.89rem; color:var(--text-2); margin-top:.35rem; }}

/* ---------- memberships (dark) ---------- */
.tiers {{ display:grid; gap:1.5rem; grid-template-columns:repeat(auto-fit,minmax(285px,1fr)); }}
.tier {{ padding:2rem 1.9rem; background:var(--ink-2); border:1px solid var(--line-dk);
  display:flex; flex-direction:column; gap:1rem; }}
.tier.hi {{ border-color:var(--brass); background:var(--ink-3); }}
.tier h3 {{ font-size:1.32rem; text-transform:uppercase; }}
.tier .amt {{ font-family:var(--fd); font-weight:700; font-size:2.5rem; letter-spacing:-.035em;
  line-height:1; color:var(--brass-2); font-variant-numeric:tabular-nums; }}
.tier .amt span {{ font-family:var(--fb); font-size:.82rem; font-weight:400; color:var(--on-dark-2); letter-spacing:0; }}
.tier ul {{ list-style:none; margin:0; padding:0; display:grid; gap:.6rem; }}
.tier li {{ font-size:.92rem; color:rgba(236,228,214,.78); padding-left:1.4rem; position:relative; }}
.tier li::before {{ content:"\\2014"; position:absolute; left:0; color:var(--brass); }}
.tier .btn {{ margin-top:auto; }}

/* ---------- FAQ ---------- */
.faq {{ border-bottom:1px solid var(--line); }}
.faq summary {{ list-style:none; cursor:pointer; padding:1.25rem 0; display:flex; align-items:center;
  justify-content:space-between; gap:1rem; font-family:var(--fd); font-weight:700; font-size:1.03rem;
  text-transform:uppercase; letter-spacing:-.01em; color:var(--ink); }}
.faq summary::-webkit-details-marker {{ display:none; }}
.faq summary:hover {{ color:var(--brass); }}
.faq summary i {{ width:14px; height:14px; position:relative; flex:none; }}
.faq summary i::before,.faq summary i::after {{ content:""; position:absolute; background:var(--brass); transition:transform .28s; }}
.faq summary i::before {{ inset:6px 0; height:2px; }}
.faq summary i::after {{ inset:0 6px; width:2px; }}
.faq[open] summary i::after {{ transform:scaleY(0); }}
.faq-a {{ padding:0 0 1.35rem; max-width:62ch; color:var(--text-2); font-size:.96rem; }}

/* ---------- visit ---------- */
.visit {{ position:relative; overflow:hidden; background:var(--ink); }}
.visit > img {{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
  opacity:.2; filter:saturate(.6) blur(2px); }}
.visit .wrap {{ position:relative; }}
.c-grid {{ display:grid; gap:2.25rem; }}
@media (min-width:900px) {{ .c-grid {{ grid-template-columns:1fr 1fr; gap:3.25rem; }} }}
.card {{ background:var(--paper); color:var(--text); padding:clamp(1.75rem,3vw,2.4rem); display:grid; gap:.95rem; }}
.card h3 {{ font-size:1.18rem; text-transform:uppercase; }}
.field {{ display:grid; gap:.35rem; }}
.field label {{ font-family:var(--fd); font-size:.64rem; font-weight:700; letter-spacing:.2em;
  text-transform:uppercase; color:var(--text-2); }}
.field input,.field textarea {{ font-family:var(--fb); font-size:.95rem; padding:.8rem .95rem;
  border:1px solid var(--line); background:var(--linen); color:var(--text); width:100%; border-radius:2px; }}
.info dl {{ margin:0; display:grid; gap:1.5rem; }}
.info dt {{ font-family:var(--fd); font-size:.64rem; font-weight:700; letter-spacing:.22em;
  text-transform:uppercase; color:var(--brass-2); }}
.info dd {{ margin:.4rem 0 0; color:rgba(236,228,214,.88); font-size:.97rem; }}
.info a {{ color:#fff; border-bottom:1px solid var(--brass); text-decoration:none; }}

footer {{ background:var(--ink-2); color:var(--on-dark-2); padding:3.25rem 0 6rem; font-size:.87rem;
  border-top:1px solid var(--line-dk); }}
footer a {{ color:var(--on-dark-2); text-decoration:none; }}
footer a:hover {{ color:#fff; }}
.f-grid {{ display:flex; flex-wrap:wrap; gap:1rem 2rem; justify-content:space-between; align-items:center; }}

/* ---------- mobile-only dock ---------- */
.dock {{ display:none; }}
@media (max-width:768px) {{
  .dock {{ display:grid; grid-template-columns:1fr 1fr; gap:.5rem; position:fixed; left:0; right:0; bottom:0;
    z-index:120; padding:.55rem .75rem calc(.55rem + env(safe-area-inset-bottom));
    background:rgba(251,248,242,.97); border-top:1px solid var(--line); }}
  .dock .btn {{ min-height:46px; }}
  footer {{ padding-bottom:6.5rem; }}
}}

/* ---------- reveal, with fail-safes ---------- */
html.anim .rv {{ opacity:0; transform:translateY(18px); }}
html.anim .rv.shown {{ opacity:1; transform:none;
  transition:opacity .8s cubic-bezier(.22,.61,.36,1), transform .8s cubic-bezier(.22,.61,.36,1); }}
@media (prefers-reduced-motion:reduce) {{
  html.anim .rv, html.anim .rv.shown {{ opacity:1; transform:none; transition:none; }}
  .ph img {{ transition:none; }}
}}
</style>

<div style="background:#7a1f14;color:#fff;font:700 11px/1.5 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;text-align:center;padding:7px 14px">
  Draft redesign v2 &middot; not live &middot; fallingwatersdayspa.com is unchanged
</div>

<div class="announce">
  <span class="eyebrow">Treehouse members save 10%</span>
  <span>Same-day appointments welcome &mdash; call <a href="{TEL}">(801) 501-9000</a> or walk in.</span>
</div>

<nav class="nav"><div class="wrap nav-in">
  <a class="nav-logo" href="/"><img src="{IMG['logo']}" alt="Falling Waters" width="1280" height="1280"><img src="{IMG['logotext']}" alt="Falling Waters Day Spa &amp; Salon" width="1280" height="233"></a>
  <ul class="nav-links">
    <li><a href="/services/massage">Massage</a></li><li><a href="/services/facials">Facials</a></li>
    <li><a href="/services/hair-care">Hair</a></li><li><a href="/services/nails">Nails</a></li>
    <li><a href="#packages">Packages</a></li><li><a href="#visit">Visit</a></li>
  </ul>
  <a class="btn btn-ink" href="{BOOK}">Book now</a>
</div></nav>

<section class="hero">
  <img src="{IMG['hero']}" alt="Fresh rose arrangement at Falling Waters Day Spa in Draper, Utah" width="1400" height="900">
  <div class="hero-scrim"></div>
  <div class="wrap hero-in">
    <span class="eyebrow">Draper, Utah &middot; Est. 1998</span>
    <h1>Where Draper <em>unwinds.</em>
      <span class="sub">Falling Waters is a full-service day spa &amp; salon in Draper, Utah &mdash; massage, HydraFacial, hair, nails, brows &amp; lashes, all under one roof inside Treehouse Athletic Club. Open to the public.</span></h1>
    <div class="hero-cta">
      <a class="btn btn-brass" href="{BOOK}">Book your escape</a>
      <a class="btn btn-light" href="#packages">See packages</a>
    </div>
  </div>
</section>

<div class="jade band"><div class="wrap">
  {RIPPLE}
  <div class="band-g" style="margin-top:1.75rem">
    <div><div class="n">27+</div><div class="l">Years serving Draper, since 1998</div></div>
    <div><div class="n">4.4&#9733;</div><div class="l">Across 136+ Google reviews</div></div>
    <div><div class="n">50+</div><div class="l">Spa &amp; salon services under one roof</div></div>
    <div><div class="n">59+</div><div class="l">Combined years of licensed experience</div></div>
  </div>
</div></div>

<section id="services"><div class="wrap">
  <div class="head rv">
    <div><span class="eyebrow">The menu</span><h2 class="display">Everything under one roof.</h2></div>
    <p class="lede">Massage, facials, hair, nails, lashes and waxing &mdash; certified professionals, one address, one booking.</p>
  </div>
  <div class="svc-g">{''.join(svc(i,s) for i,s in enumerate(SERVICES))}</div>
  <p class="lede rv" style="margin-top:2.25rem">Also serving guests from
    <a href="/areas/sandy">Sandy</a>, <a href="/areas/south-jordan">South Jordan</a>,
    <a href="/areas/riverton">Riverton</a>, <a href="/areas/cottonwood-heights">Cottonwood Heights</a>
    &amp; <a href="/areas/holladay">Holladay</a>.</p>
</div></section>

<section class="dark" id="packages"><div class="wrap">
  <div class="head rv">
    <div><span class="eyebrow">Packages</span><h2 class="display">Make a day of it.</h2></div>
    <p class="lede">The ones people book for anniversaries, birthdays, and the week they finally stop.</p>
  </div>
  {''.join(pkg(i,p) for i,p in enumerate(PACKAGES))}
</div></section>

<section><div class="wrap">
  <div class="head rv">
    <div><span class="eyebrow">Why here</span><h2 class="display">What one roof gets you.</h2></div>
    <p class="lede">Most places in the valley do one thing. A massage, a facial and a cut usually means three businesses and three calendars.</p>
  </div>
  <div class="cmp-w rv"><table class="cmp">
    <thead><tr><th>&nbsp;</th><th class="us">Falling Waters</th><th>Single-service studio</th><th>Chain spa</th></tr></thead>
    <tbody>
      <tr><th>Massage, facials, hair &amp; nails in one visit</th><td class="us yes">Yes</td><td class="no">No</td><td class="no">Rarely</td></tr>
      <tr><th>Couples suite for side-by-side treatments</th><td class="us yes">Yes</td><td class="no">No</td><td class="no">Sometimes</td></tr>
      <tr><th>Same licensed team since 1998</th><td class="us yes">27+ years</td><td class="no">Varies</td><td class="no">High turnover</td></tr>
      <tr><th>Gym membership discount</th><td class="us yes">10% for TAC members</td><td class="no">No</td><td class="no">No</td></tr>
      <tr><th>Free on-site parking</th><td class="us yes">Yes</td><td class="no">Street</td><td class="no">Often paid</td></tr>
    </tbody></table></div>
</div></section>

<section class="dark"><div class="wrap">
  <div class="head rv">
    <div><span class="eyebrow">Reviews</span><h2 class="display">In their words.</h2></div>
    <p class="lede">4.4 stars across 136+ Google reviews. Guests name the people, which is usually the tell.</p>
  </div>
  <div class="rev-g">{''.join(rev(i,r) for i,r in enumerate(REVIEWS))}</div>
</div></section>

<section id="team"><div class="wrap">
  <div class="head rv">
    <div><span class="eyebrow">Your therapists</span><h2 class="display">Seasoned hands.</h2></div>
    <p class="lede">Licensed massage therapists, aestheticians and stylists &mdash; a combined 59+ years, including favorites like Alicia, Holland and Jaiden.</p>
  </div>
  <div class="team-g">
    <div class="tm rv"><figure class="ph"><img src="{IMG['team1']}" alt="Licensed massage therapist at Falling Waters" loading="lazy" decoding="async" width="600" height="800"></figure><h3>Licensed Massage Therapists</h3><p>Swedish, deep tissue &amp; more &mdash; decades of hands-on care.</p></div>
    <div class="tm rv" style="transition-delay:75ms"><figure class="ph"><img src="{IMG['team2']}" alt="Licensed aesthetician at Falling Waters" loading="lazy" decoding="async" width="600" height="800"></figure><h3>Licensed Aestheticians</h3><p>HydraFacial, peels &amp; custom facials.</p></div>
    <div class="tm rv" style="transition-delay:150ms"><figure class="ph"><img src="{IMG['team3']}" alt="Hair stylist at Falling Waters" loading="lazy" decoding="async" width="600" height="800"></figure><h3>Hair Stylists</h3><p>Cuts, color &amp; styling &mdash; including favorites like Alicia &amp; Holland.</p></div>
  </div>
</div></section>

<section class="dark" id="memberships"><div class="wrap">
  <div class="head rv">
    <div><span class="eyebrow">Memberships</span><h2 class="display">Make it a habit, not a treat.</h2></div>
    <p class="lede">Regular guests get better results and better rates. Two ways to keep coming back.</p>
  </div>
  <div class="tiers">
    <div class="tier hi rv">
      <span class="eyebrow" style="margin:0">Most popular</span><h3>Massage Club</h3>
      <div class="amt">$89<span> / month</span></div>
      <ul><li>One 50-minute Swedish or deep-tissue massage every month</li><li>10% off every additional service</li><li>Unused sessions roll over for 90 days</li><li>Priority booking on weekends</li></ul>
      <a class="btn btn-brass" href="{TEL}">Call to join</a>
    </div>
    <div class="tier rv" style="transition-delay:75ms">
      <span class="eyebrow" style="margin:0">Already a member</span><h3>Treehouse Athletic Club</h3>
      <div class="amt">10%<span> off, always</span></div>
      <ul><li>10% off all spa &amp; salon services</li><li>No enrollment &mdash; just mention your membership</li><li>Stacks with seasonal offers</li><li>Free parking at the club</li></ul>
      <a class="btn btn-light" href="{BOOK}">Book your visit</a>
    </div>
  </div>
  <p class="fine rv" style="margin-top:1.6rem">Gift cards $50&ndash;$500, any amount, never expire &mdash; in person or by phone at (801) 501-9000.</p>
</div></section>

<section id="faq"><div class="wrap">
  <div class="head rv">
    <div><span class="eyebrow">Good to know</span><h2 class="display">Before your visit.</h2></div>
    <p class="lede">Everything worth knowing before you arrive.</p>
  </div>
  <div class="rv">{''.join(faq(q,a) for q,a in FAQS)}</div>
</div></section>

<section class="visit" id="visit">
  <img src="{IMG['girls']}" alt="" aria-hidden="true">
  <div class="wrap">
    <div class="head rv">
      <div><span class="eyebrow">Visit</span><h2 class="display">Inside Treehouse Athletic Club.</h2></div>
      <p class="lede">Open to the public &mdash; you do not need to be a club member to book.</p>
    </div>
    <div class="c-grid">
      <div class="info rv"><dl>
        <div><dt>Location</dt><dd>1101 E Draper Parkway<br>Draper, UT 84020<br>Inside Treehouse Athletic Club</dd></div>
        <div><dt>Phone</dt><dd><a href="{TEL}">(801) 501-9000</a></dd></div>
        <div><dt>Hours</dt><dd>Mon&ndash;Fri 9am &ndash; 6pm<br>Sat 9am &ndash; 4pm<br>Closed Sunday</dd></div>
        <div><dt>Follow</dt><dd><a href="https://www.instagram.com/fallingwaters_dayspa/">@fallingwaters_dayspa</a></dd></div>
      </dl></div>
      <form class="card rv" style="transition-delay:75ms" onsubmit="return false">
        <h3>Ask us anything</h3>
        <p style="font-size:.92rem;color:var(--text-2)">Not sure which treatment? Tell us what you are after and we will point you the right way.</p>
        <div class="field"><label for="n">Name</label><input id="n" name="name" autocomplete="name"></div>
        <div class="field"><label for="e">Email</label><input id="e" name="email" type="email" autocomplete="email"></div>
        <div class="field"><label for="m">What are you looking for?</label><textarea id="m" name="message" rows="3"></textarea></div>
        <button class="btn btn-ink" type="submit">Send</button>
        <p style="font-size:.77rem;color:var(--text-2)">Draft only &mdash; this form is not wired up yet.</p>
      </form>
    </div>
  </div>
</section>

<footer><div class="wrap f-grid">
  <div>&copy; 2026 Falling Waters Day Spa &amp; Salon &middot; 1101 E Draper Parkway, Draper, UT 84020</div>
  <div style="display:flex;gap:1.35rem"><a href="/blog/">Blog</a><a href="/services/gift-cards">Gift cards</a><a href="#visit">Contact</a></div>
</div></footer>

<div class="dock">
  <a class="btn btn-ink" href="{BOOK}">Book now</a>
  <a class="btn btn-out" href="{TEL}">Call</a>
</div>

{''.join(schema)}

<script>
(function () {{
  var d = document.documentElement;
  if (!('IntersectionObserver' in window)) return;
  d.classList.add('anim');
  var els = [].slice.call(document.querySelectorAll('.rv'));
  var io = new IntersectionObserver(function (rows) {{
    rows.forEach(function (r) {{ if (r.isIntersecting) {{ r.target.classList.add('shown'); io.unobserve(r.target); }} }});
  }}, {{ rootMargin: '0px 0px -8% 0px', threshold: 0.08 }});
  els.forEach(function (el) {{ io.observe(el); }});
  setTimeout(function () {{ els.forEach(function (el) {{ el.classList.add('shown'); }}); }}, 3000);
  window.addEventListener('pageshow', function () {{ els.forEach(function (el) {{ el.classList.add('shown'); }}); }});
}})();
</script>
'''

HTML = "".join(c if ord(c) < 128 else "&#%d;" % ord(c) for c in HTML)
out = pathlib.Path("/tmp/fw-v2.html"); out.write_text(HTML, encoding="ascii")
print("schema:", len(schema), "| assets:", len(_cache), "| size:", out.stat().st_size // 1024, "KB")
