/* Captures one PNG per figure from a capture list, against the running dev server.

   WHY A LIST RATHER THAN A SWEEP. A selector sweep finds containers and gets the grain
   wrong: it captured #radars as one picture when that box held a bar stage and two
   tables, and it drops the register timeline because the timeline's own svg is fourteen
   pixels wide. The list is the decision about what counts as one figure; this file only
   carries it out.

   THE SCROLL PASS matters. Most of these figures draw on an IntersectionObserver, so a
   page that has never been scrolled hands back empty boxes. Every page is walked top to
   bottom before anything is captured, then walked back, and each element is scrolled into
   view again before its own shot.

   MOTION. Screenshots are taken with animations disabled, so a dot field lands on its
   settled frame rather than mid-breath. The list records which figures move, because a
   still of a moving figure is a fair picture of it and not the whole of it.

   Usage:
     node scripts/capture-visuals.mjs .visuals/list.json
     BASE=http://localhost:4321 node scripts/capture-visuals.mjs <list> [--pad 16] */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE || 'http://localhost:4321';
const OUT = process.env.OUT || '.visuals';
const listPath = process.argv[2];
if (!listPath) { console.error('usage: node scripts/capture-visuals.mjs <list.json>'); process.exit(1); }
const padIx = process.argv.indexOf('--pad');
const PAD = padIx > -1 ? Number(process.argv[padIx + 1]) : 18;

const list = JSON.parse(fs.readFileSync(listPath, 'utf8'));
fs.mkdirSync(OUT, { recursive: true });

const byPage = new Map();
for (const f of list) {
  if (!byPage.has(f.page)) byPage.set(f.page, []);
  byPage.get(f.page).push(f);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1500, height: 1050 }, deviceScaleFactor: 2 });
const page = await ctx.newPage();
const done = [];
let n = 0;

for (const [route, figures] of byPage) {
  await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.55);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 110));
    }
    window.scrollTo(0, document.body.scrollHeight);
    await new Promise(r => setTimeout(r, 500));
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 500));
  });
  await page.waitForTimeout(1000);

  for (const f of figures) {
    n += 1;
    const file = path.join(OUT, `${String(n).padStart(2, '0')}-${f.slug}.png`);

    /* A viewport entry, for the two full-page canvas layers. The flock and the threading
       field are not elements a reader looks at on their own; they are what the page looks
       like at a moment between two sections. So these are captured as the viewport at a
       named scroll fraction, with motion left RUNNING and a settle wait, because disabling
       animation on a canvas driven by requestAnimationFrame freezes it before the flock
       has taken the air. */
    if (f.at !== undefined) {
      try {
        await page.evaluate(async (frac) => {
          const y = (document.body.scrollHeight - innerHeight) * frac;
          window.scrollTo({ top: y, behavior: 'instant' });
          await new Promise(r => setTimeout(r, 120));
        }, f.at);
        await page.waitForTimeout(f.settle || 2200);
        await page.screenshot({ path: file });
        const kb = Math.round(fs.statSync(file).size / 1024);
        console.log(`ok    viewport @${String(f.at).padEnd(5)} ${String(kb).padStart(4)}KB  ${f.name}`);
        done.push({ ...f, file, w: 1500, h: 1050 });
      } catch (e) {
        console.log(`FAIL  viewport @${f.at}  ${e.message.split('\n')[0].slice(0, 70)}`);
      }
      continue;
    }

    try {
      const el = page.locator(f.selector).first();
      const count = await page.locator(f.selector).count();
      if (!count) { console.log(`MISS  ${f.selector.padEnd(34)} ${f.name}`); continue; }
      /* Centre rather than scrollIntoViewIfNeeded. The flock in morph.js keeps a DWELL zone
         at the middle of the viewport where the real drawing stands crisp and dims the
         content either side of it, so a minimal scroll that only just reveals a figure
         captures it mid-fade. The specialisation matrix came back washed out exactly that
         way on the first pass. */
      await el.evaluate(n => n.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' }));
      await page.waitForTimeout(f.settle || 1600);
      const box = await el.boundingBox();
      if (!box || box.width < 8 || box.height < 8) { console.log(`EMPTY ${f.selector.padEnd(34)} ${f.name}`); continue; }
      /* Padded clip rather than an element shot, so a drawing that overflows its own box
         by a hairline is not sliced at the edge. Clamped to the document. */
      const clip = {
        x: Math.max(0, box.x - PAD),
        y: Math.max(0, box.y - PAD),
        width: box.width + PAD * 2,
        height: box.height + PAD * 2,
      };
      await page.screenshot({ path: file, clip, animations: 'disabled' });
      const kb = Math.round(fs.statSync(file).size / 1024);
      console.log(`ok    ${String(Math.round(box.width)).padStart(4)}x${String(Math.round(box.height)).padStart(4)}  ${String(kb).padStart(4)}KB  ${f.name}`);
      done.push({ ...f, file, w: Math.round(box.width), h: Math.round(box.height), matches: count });
    } catch (e) {
      console.log(`FAIL  ${f.selector.padEnd(34)} ${e.message.split('\n')[0].slice(0, 70)}`);
    }
  }
}

fs.writeFileSync(path.join(OUT, 'captured.json'), JSON.stringify(done, null, 2));
console.log(`\ncaptured ${done.length} of ${list.length} figures into ${OUT}/`);
await browser.close();
