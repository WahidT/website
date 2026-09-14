/* Enumerates every drawn visual on the site from the LIVE DOM, then captures each one.

   WHY THE LIVE DOM. Most of these figures do not exist in the HTML. The three necessity
   machines, the blowouts, the screen sieve, the market bars, the specialisation matrix,
   the AI figures and the instrument drawings are all built by script at render, so a
   sweep of the source files finds containers and misses drawings. The page has to be run.

   WHAT COUNTS AS A VISUAL. A container the site itself treats as one figure: an element
   carrying role="figure", a <figure>, a machine wrap, a chart root, or a data table that
   is drawn rather than typed. An <svg> nested inside one of those is part of that figure
   and is not captured again, which is what the containment pass below is for.

   Usage:
     node scripts/visual-inventory.mjs            list what it finds, capture nothing
     node scripts/visual-inventory.mjs --shoot    write PNGs into .visuals/ and a manifest
     BASE=http://localhost:4321 node scripts/visual-inventory.mjs --shoot */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = '.visuals';
const SHOOT = process.argv.includes('--shoot');
const PAGES = ['index.html', 'bio.html', 'for-llms.html', 'sources.html', 'instruments.html'];

/* Selectors the site uses for a figure. Kept broad, then narrowed by the containment and
   size passes, because a missed figure is the failure here and a spurious one is cheap. */
const SEL = [
  '[role="figure"]', 'figure', '.machine-wrap', '.machine', '.plate', '.fig',
  '#screen', '#radars', '#dotfield', '.bars-spec', '.bars-read',
  '.ai-fig', '.aif', '.ins-machine', '.ins-icon', '.timeline', '.tl',
  'svg', 'canvas', 'table',
].join(',');

async function inventory(page, route) {
  return page.evaluate((route) => {
    const SELECTORS = [
      '[role="figure"]', 'figure', '.machine-wrap', '.machine', '.plate', '.fig',
      '#screen', '#radars', '#dotfield', '.bars-spec', '.bars-read',
      '.ai-fig', '.aif', '.ins-machine', '.ins-icon', '.timeline', '.tl',
      'svg', 'canvas', 'table',
    ].join(',');
    const all = Array.from(document.querySelectorAll(SELECTORS));
    const visible = all.filter(el => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width >= 60 && r.height >= 40 && cs.visibility !== 'hidden' && cs.display !== 'none';
    });
    /* Containment: drop an element that sits inside another element already in the set.
       An <svg> inside a .machine-wrap is that figure, not a second one. */
    const kept = visible.filter(el => !visible.some(other => other !== el && other.contains(el)));
    const section = el => {
      const s = el.closest('section[id], section');
      if (!s) return '';
      const h = s.querySelector('h2, .sec-n, .sec-h');
      return (s.id || '') + (h ? ' ' + h.textContent.trim().replace(/\s+/g, ' ').slice(0, 60) : '');
    };
    const label = el => {
      const a = el.getAttribute('aria-label');
      if (a) return a;
      const cap = el.querySelector('caption, figcaption, .cap, .sc-cap, .bars-cap');
      if (cap) return cap.textContent.trim().replace(/\s+/g, ' ').slice(0, 120);
      const t = el.querySelector('title');
      if (t) return t.textContent.trim().slice(0, 120);
      const d = el.getAttribute('data-machine') || el.getAttribute('data-blowout') || el.getAttribute('data-icon');
      if (d) return d;
      return '';
    };
    return kept.map((el, i) => {
      const r = el.getBoundingClientRect();
      return {
        route,
        i,
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        cls: (el.className && el.className.baseVal !== undefined ? el.className.baseVal : String(el.className || '')).trim().split(/\s+/).slice(0, 3).join(' '),
        section: section(el),
        label: label(el),
        w: Math.round(r.width),
        h: Math.round(r.height),
        svgs: el.tagName.toLowerCase() === 'svg' ? 1 : el.querySelectorAll('svg').length,
        circles: el.querySelectorAll('circle').length,
      };
    });
  }, route);
}

function slug(s, fallback) {
  const t = (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 46);
  return t || fallback;
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const manifest = [];
if (SHOOT) fs.rmSync(OUT, { recursive: true, force: true });
if (SHOOT) fs.mkdirSync(OUT, { recursive: true });

for (const route of PAGES) {
  await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  /* Scroll the page once so every IntersectionObserver fires and every deferred render
     runs, then return to the top. A figure that draws on entry is blank otherwise. */
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 90));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
  });
  await page.waitForTimeout(900);

  const found = await inventory(page, route);
  console.log(`\n${route}   ${found.length} figure(s)`);
  for (const f of found) {
    const name = `${route.replace('.html', '')}-${String(f.i).padStart(2, '0')}-${slug(f.id || f.cls || f.label, f.tag)}`;
    console.log(`  ${String(f.w).padStart(5)}x${String(f.h).padStart(4)}  ${(f.id || f.cls || f.tag).padEnd(24)} svg:${String(f.svgs).padStart(2)} dots:${String(f.circles).padStart(4)}  ${f.section.slice(0, 34).padEnd(34)} ${f.label.slice(0, 60)}`);
    if (SHOOT) {
      const handles = await page.$$(SEL);
      /* Re-resolve by index within the same filtered set the evaluate used, so the shot
         and the row cannot drift apart. */
      const el = await page.evaluateHandle((args) => {
        const SELECTORS = args.sel;
        const all = Array.from(document.querySelectorAll(SELECTORS));
        const visible = all.filter(e => {
          const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
          return r.width >= 60 && r.height >= 40 && cs.visibility !== 'hidden' && cs.display !== 'none';
        });
        const kept = visible.filter(e => !visible.some(o => o !== e && o.contains(e)));
        return kept[args.i];
      }, { sel: SEL, i: f.i });
      const node = el.asElement();
      if (node) {
        try {
          await node.scrollIntoViewIfNeeded();
          await page.waitForTimeout(500);
          const file = path.join(OUT, `${name}.png`);
          await node.screenshot({ path: file, animations: 'disabled' });
          manifest.push({ ...f, file });
        } catch (e) {
          console.log(`        capture failed: ${e.message.split('\n')[0]}`);
        }
      }
      for (const h of handles) await h.dispose();
    }
  }
}

if (SHOOT) {
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nwrote ${manifest.length} PNG(s) and ${OUT}/manifest.json`);
}
await browser.close();
