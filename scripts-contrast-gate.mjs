// Walks every text node on the page, resolves the real painted background by
// climbing ancestors, and fails on anything under WCAG AA. Written because v3
// shipped a heading at contrast 1.00 that eyeballing screenshots did not catch.
import { chromium } from 'playwright';
const file = process.argv[2];
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto('file://' + file, { waitUntil: 'load' });
await p.waitForTimeout(1200);
await p.evaluate(async () => { for (let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,35));} });
const findings = await p.evaluate(() => {
  const L = c => { const m=c.match(/[\d.]+/g); if(!m) return null;
    const [r,g,bl]=m.slice(0,3).map(Number).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});
    return .2126*r+.7152*g+.0722*bl; };
  const bgOf = el => { let n=el; while(n){ const c=getComputedStyle(n).backgroundColor;
      if(c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) return c; n=n.parentElement; } return 'rgb(255,255,255)'; };
  const out=[];
  document.querySelectorAll('h1,h2,h3,p,span,a,li,dt,dd,summary,blockquote,figcaption,label,td,th').forEach(e=>{
    const t=(e.textContent||'').trim(); if(!t || e.children.length) return;
    const st=getComputedStyle(e); if(st.display==='none'||st.visibility==='hidden'||+st.opacity===0) return;
    if(st.webkitTextStrokeWidth && parseFloat(st.webkitTextStrokeWidth)>0) return;  // outlined by design
    if(getComputedStyle(e).position==='absolute' && /rgba?\(255, 255, 255/.test(st.color)) return;  // sits on a photo
    const fg=L(st.color), bg=L(bgOf(e)); if(fg===null||bg===null) return;
    const ratio=(Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
    const size=parseFloat(st.fontSize), bold=+st.fontWeight>=700;
    const min=(size>=24||(size>=18.66&&bold))?3:4.5;
    if(ratio<min) out.push({ratio:+ratio.toFixed(2),min,color:st.color,bg:bgOf(e),size,text:t.slice(0,48)});
  });
  return out;
});
await b.close();
if (!findings.length) { console.log('CONTRAST GATE: pass — no text below WCAG AA'); process.exit(0); }
console.log('CONTRAST GATE: ' + findings.length + ' FAILING');
findings.slice(0,12).forEach(f => console.log(`  ${f.ratio} (need ${f.min})  ${f.color} on ${f.bg}  "${f.text}"`));
process.exit(1);
