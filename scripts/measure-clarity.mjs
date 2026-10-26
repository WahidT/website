/* Clarity measurement. Prints, for the thesis page at a phone and a desktop width,
   each section's height, word count and whether it opens on an eyebrow, the page
   height, and the smallest rendered text with where it sits.

   This is the measurement behind SITE_CLARITY_AUDIT_2026-10-20 made repeatable, so
   the before-and-after table in each clarity PR comes from one command rather than
   from a session's own probe. check-clarity.mjs runs the same probe and holds the
   result to ceilings; this script only reports.

   Rendered size, not declared size. An SVG drawing scales with its box, so a callout
   authored at 12px renders at about half that on a phone; the probe multiplies an
   SVG text's font size by the element's screen transform. Text that occupies no box
   (a collapsed rail label, a display:none branch) is not counted.

   Usage: node scripts/measure-clarity.mjs [baseURL] [--json]
          (default http://127.0.0.1:8791) */
import { chromium } from 'playwright';

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const BASE = (args.find(a => !a.startsWith('--')) || 'http://127.0.0.1:8791').replace(/\/$/, '');
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;

/* [label, viewport, touch]. 390 is the width the audit and the plan's targets use. */
export const PROFILES = [
  ['phone 390',    { width: 390, height: 844 },  true],
  ['desktop 1440', { width: 1440, height: 900 }, false],
];

/* Runs in the page. Scrolls to the foot first, because sections build on scroll. */
export const probe = async () => {
  for (let i = 0; i < 40; i++) {
    scrollTo(0, scrollY + innerHeight * 0.6);
    await new Promise(r => setTimeout(r, 90));
    if (scrollY + innerHeight >= document.documentElement.scrollHeight - 2) break;
  }
  scrollTo(0, 0);
  await new Promise(r => setTimeout(r, 300));

  const sizeOf = node => {
    const el = node.parentElement;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || +cs.opacity === 0) return null;
    /* A display:none ancestor hides the text, but over SVG text inside a hidden <g> Chromium still
       reports a Range box, and checkVisibility() still returns true, so the hidden blow-out
       callouts read as rendered 4 to 6px text (found 2026-10-26; the schematic's 2.9px labels
       had masked it, because the report keeps the smallest size per place). Walk the ancestors. */
    for (let a = el; a; a = a.parentElement) if (getComputedStyle(a).display === 'none') return null;
    const rg = document.createRange(); rg.selectNodeContents(node);
    const b = rg.getBoundingClientRect();
    if (b.width < 1 || b.height < 1) return null;
    let px = parseFloat(cs.fontSize);
    if (el instanceof SVGElement && el.getScreenCTM) {
      const m = el.getScreenCTM();
      if (m) px *= Math.hypot(m.a, m.b);
    }
    return px;
  };
  const where = el => {
    const sec = el.closest('section,footer,nav');
    const own = el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : el.tagName.toLowerCase();
    return `${sec ? '#' + (sec.id || sec.className.split(' ')[0]) : 'page'} ${own}`;
  };

  const sections = [...document.querySelectorAll('main > section')].map(s => {
    const first = s.firstElementChild;
    const words = (s.innerText || '').trim().split(/\s+/).filter(Boolean).length;
    return {
      id: s.id || s.className.split(' ')[0],
      height: Math.round(s.getBoundingClientRect().height),
      words,
      /* the page's h1 is its own label (GP 2026-10-26), so a section opening on the h1 counts as labelled */
      eyebrow: !!(first && (first.classList.contains('eyebrow') || first.tagName === 'H1') && first.getBoundingClientRect().height > 0),
    };
  });

  /* Smallest rendered text, by place. Aria-hidden decoration is still read by sighted
     readers, so it counts. */
  const small = new Map();
  let min = Infinity;
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode: n => n.nodeValue.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT,
  });
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const p = n.parentElement;
    if (!p || p.closest('script,style,noscript,.skip-link')) continue;
    const px = sizeOf(n);
    if (px == null) continue;
    min = Math.min(min, px);
    if (px < 12) {
      const k = where(p);
      small.set(k, Math.min(small.get(k) ?? Infinity, px));
    }
  }
  return {
    pageHeight: document.documentElement.scrollHeight,
    sections,
    minText: Math.round(min * 10) / 10,
    under12: [...small].map(([k, v]) => [k, Math.round(v * 10) / 10]).sort((a, b) => a[1] - b[1]),
  };
};

export async function measure(base = BASE, route = 'index.html') {
  const browser = await chromium.launch({ executablePath: EXECUTABLE });
  const out = {};
  for (const [name, viewport, touch] of PROFILES) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, hasTouch: touch, isMobile: touch, colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(`${base}/${route}`, { waitUntil: 'networkidle' });
    out[name] = await page.evaluate(probe);
    await ctx.close();
  }
  await browser.close();
  return out;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await measure();
  if (JSON_OUT) { console.log(JSON.stringify(r, null, 2)); process.exit(0); }
  for (const [name, m] of Object.entries(r)) {
    console.log(`\n${name}: page ${m.pageHeight}px, smallest text ${m.minText}px`);
    console.log('  section'.padEnd(14) + 'height'.padStart(8) + 'words'.padStart(8) + '  eyebrow');
    for (const s of m.sections)
      console.log(`  ${s.id.padEnd(12)}${String(s.height).padStart(8)}${String(s.words).padStart(8)}  ${s.eyebrow ? 'yes' : 'no'}`);
    console.log(`  total words ${m.sections.reduce((a, s) => a + s.words, 0)}, eyebrows ${m.sections.filter(s => s.eyebrow).length} of ${m.sections.length}`);
    if (m.under12.length) console.log('  under 12px: ' + m.under12.map(([k, v]) => `${k} ${v}`).join('; '));
  }
}
