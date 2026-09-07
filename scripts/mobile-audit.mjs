/* Responsive layout audit. Guards the invariants that break silently between
   breakpoints, where nobody looks.

   Two regressions have already shipped through the gaps in this sweep. The
   section rail is a fixed right-edge overlay, so content sized in vw — which
   ignores the padding that clears the rail — slides under it; that is invisible
   at 320 and 390px and only appears at 360, 375 and 412. And the regulation
   split floors its left column at 440px, so between 861 and 1040px the timeline
   rows had less width than they can render in and the page scrolled sideways by
   up to 171px; the sweep stopped at 412px and never saw it.

   Hence widths from 320 to 1280, phones through laptops. Touch is per profile:
   the hover-gated CSS behaves differently under a coarse pointer, and the 44px
   tap-target rule only applies where fingers are.

   Usage: node scripts/mobile-audit.mjs [baseURL]      (default http://127.0.0.1:8791) */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'http://127.0.0.1:8791').replace(/\/$/, '');
/* Playwright resolves its own Chromium (installed by the postinstall script); CHROMIUM_PATH overrides it. */
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;
/* [label, viewport, touch] */
const PROFILES = [
  ['narrow',        { width: 320, height: 640 },  true],
  ['Galaxy S24',    { width: 360, height: 780 },  true],
  ['iPhone SE',     { width: 375, height: 667 },  true],
  ['iPhone 15 Pro', { width: 393, height: 852 },  true],
  ['Pixel 8',       { width: 412, height: 915 },  true],
  ['iPad portrait', { width: 768, height: 1024 }, true],
  ['iPad landscape',{ width: 1024, height: 768 }, true],
  /* the band the regulation split used to overflow in, and its far edge */
  ['squeeze 900',   { width: 900, height: 900 },  false],
  ['squeeze 1000',  { width: 1000, height: 900 }, false],
  ['squeeze 1040',  { width: 1040, height: 900 }, false],
  ['laptop 1280',   { width: 1280, height: 800 }, false],
];
const ROUTES = ['index.html', 'bio.html', 'sources.html', 'for-llms.html'];

/* Probes at every scroll step, not just the end. The overlap this guards
   against appears only where a vw-sized block happens to sit beside the rail,
   so a single-position check reports a false pass. */
const probe = async touch => {
  const out = { hOverflow: 0, railOverlap: [], railTaps: [], clipped: [] };
  const rail = document.getElementById('railnav');
  const step = innerHeight * 0.5;

  for (let y = 0; y <= document.body.scrollHeight; y += step) {
    scrollTo(0, y);
    await new Promise(r => setTimeout(r, 110));
    out.hOverflow = Math.max(out.hOverflow, document.documentElement.scrollWidth - document.documentElement.clientWidth);

    if (rail && rail.classList.contains('is-on')) {
      const rr = rail.getBoundingClientRect();
      document.querySelectorAll('p,h1,h2,h3,li,.box-go,.tl-row,.card,.reg-plate').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.width > 0 && b.bottom > 0 && b.top < innerHeight &&
            b.right > rr.left + 6 && b.left < rr.right && b.top < rr.bottom && b.bottom > rr.top) {
          const sec = el.closest('section');
          out.railOverlap.push(`${el.tagName.toLowerCase()} in #${sec ? sec.id || sec.className.split(' ')[0] : '?'}`);
        }});
      if (touch) rail.querySelectorAll('.rail-item').forEach(el => {
        const b = el.getBoundingClientRect();
        if (b.height < 44) out.railTaps.push(`${el.dataset.sec} ${Math.round(b.width)}x${Math.round(b.height)}`);
      });
    }
    /* Under a fine pointer these are deliberately collapsed to max-height:0 until
       the card is hovered, so a bare scrollHeight test reports the design as a bug.
       Only content that is meant to be on screen can be clipped. */
    document.querySelectorAll('.commentary,.ledger').forEach(el => {
      if (getComputedStyle(el).opacity === '0') return;
      if (el.scrollHeight > el.clientHeight + 2)
        out.clipped.push(`${el.className.split(' ')[0]} ${el.scrollHeight}>${el.clientHeight}`);
    });
  }
  out.railOverlap = [...new Set(out.railOverlap)];
  out.railTaps = [...new Set(out.railTaps)];
  out.clipped = [...new Set(out.clipped)];
  return out;
};

const browser = await chromium.launch({ executablePath: EXECUTABLE });
let failures = 0;

for (const [name, viewport, touch] of PROFILES) {
  for (const route of ROUTES) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: touch ? 3 : 2, hasTouch: touch, isMobile: touch, colorScheme: 'dark' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
    const r = await page.evaluate(probe, touch);

    const problems = [];
    if (r.hOverflow > 0) problems.push(`horizontal overflow ${r.hOverflow}px`);
    if (r.railOverlap.length) problems.push(`rail over content: ${r.railOverlap.join(', ')}`);
    if (r.railTaps.length) problems.push(`rail tap target under 44px: ${r.railTaps.join(', ')}`);
    if (r.clipped.length) problems.push(`clipped: ${r.clipped.join(', ')}`);
    if (errors.length) problems.push(`js error: ${errors[0]}`);

    if (problems.length) failures++;
    console.log(`${(name + ' / ' + route).padEnd(32)} ${problems.length ? 'FAIL — ' + problems.join(' | ') : 'pass'}`);
    await ctx.close();
  }
}

await browser.close();
const total = PROFILES.length * ROUTES.length;
console.log(`\n${failures ? `${failures}/${total} combinations with findings` : `all ${total} combinations pass`}`);
process.exit(failures ? 1 : 0);
