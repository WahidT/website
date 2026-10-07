/* Renders every page with its scripts running and writes out the text a reader actually gets.

   WHY THIS EXISTS. The prose gate, the retired-figure sweep and the scope sweeps were all
   being run over the static HTML, and on this site that reads roughly a quarter of the
   homepage. The necessity stage panels come from data/*_steps.js, the instrument timeline
   rows from data/reg_instruments.js, until 2026-09-24 a market table from markets.js, and until
   2026-09-15 a sourcing stream from catalogue.js. On 2026-09-14 the homepage measured 2,448
   words static and 9,308 rendered, so 6,860 words of served text had never been through a
   gate at all. A checker pointed at the wrong target reports something confident and wrong,
   which is the recurring failure shape on this estate.

   TWO OUTPUTS, because they answer different questions.

     full   Everything a reader can read, data rows and chart labels included. This is the
            target for the LEXICAL checks: a retired figure, a banned jurisdiction or an
            R-D26 pattern is just as live inside a table cell as inside a paragraph.
     prose  Paragraphs, headings, list items and figure captions, excluding tables, the
            sourcing stream, the timeline body and the drawing strips. This is the target
            for the STRUCTURAL gate, because antithesis rate, causal density, opener share
            and burstiness are measurements of writing, and a column of instrument names
            scored as sentences reports layout as prose.

   Usage:  node scripts/dump-served-text.mjs [outDir]     (default: .served-text/)
           HMM_SERVE_PORT=8791 to point at an already-running server */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium } from 'playwright';

const PAGES = ['index.html', 'bio.html', 'for-llms.html', 'sources.html', 'instruments.html'];
const OUT = process.argv[2] || '.served-text';
const PORT = Number(process.env.HMM_SERVE_PORT || 8799);

/* The gate needs paragraph breaks to split sentences, and innerText already supplies them,
   so nothing is reconstructed here. Runs in the page. */
const EXTRACT = `(() => {
  const skip = 'table,.src-stream,.tl-body,.stage-foot,.ins-cap,.radar-meas';
  /* A heading that is a bare noun phrase is furniture, not prose. The gate's own
     deck_prose() already blanks bare labels and all-caps rows, on the stated ground that a
     detector reporting layout as prose gets ignored, and a card title with no verb and no
     terminal punctuation is the same object: "The energy system", "The carbonaceous anode".
     Measured as sentences they distort opener share on a short sample while telling a reader
     nothing about the writing. They stay in the FULL text, so a banned word in a title is
     still caught by the lexical sweeps. A heading that IS a sentence is kept. */
  const isSentence = t => /[.!?]$/.test(t) && /\\b(is|are|was|were|has|have|does|do|can|will|runs|sits|reads|carries|marks|makes|takes|leads|holds|comes|moves|earns|predicts|applies|enters|reaches)\\b/i.test(t);

  /* ⚠ A HEIGHT-CAPPED, OVERFLOW-HIDDEN REGION IS NOT A WALL OF TEXT, AND FLATTENING ONE
     REPORTS LAYOUT AS CONTENT. Found on 2026-09-14 by a persona simulation: ten of eleven
     simulated readers said their attention died in the section 09 record, and the reason was
     this dump. On the page, .src-stream is height:min(72vh,620px) with overflow:hidden and a
     gradient mask, so it is one capped panel beside the sourcing prose that scrolls itself.
     In the dump it became 2,060 of 2,689 lines, 77% of the text, because innerText walks
     straight through an overflow-hidden box. A reader never sees that, so a measurement taken
     on it is a measurement of the wrong artefact, which is this estate's recurring failure
     shape in its other direction: earlier the same day this same file was written because the
     gates were reading static HTML and missing two thirds of the page.

     So a capped region is replaced by ONE marker line naming what sits behind the cap. The
     marker keeps the region visible to the lexical sweeps (a banned term inside it is still a
     banned term on a public page) while stopping it from dominating the structural reading. */
  function cappedRegions() {
    const out = [];
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.overflowY !== 'hidden' && cs.overflow !== 'hidden') return;
      const h = el.clientHeight, sh = el.scrollHeight;
      if (!h || sh < h * 1.6) return;                 // not meaningfully capped
      const words = (el.innerText || '').trim().split(/\\s+/).filter(Boolean).length;
      if (words < 120) return;                        // small clipped label, not a region
      out.push({ el, words, h, sh });
    });
    return out;
  }
  const capped = cappedRegions();
  const inCapped = el => capped.some(c => c.el !== el && c.el.contains(el));

  const parts = [];
  document.querySelectorAll('p,h1,h2,h3,h4,li,figcaption,blockquote').forEach(el => {
    if (el.closest(skip)) return;
    if (inCapped(el)) return;
    const t = (el.innerText || '').trim();
    if (!t) return;
    if (/^H[1-4]$/.test(el.tagName) && !isSentence(t)) return;
    parts.push(t);
  });

  /* The full text keeps every word, because a lexical sweep must still see inside a capped
     region, and marks the boundary so a later reader of the dump knows the shape. */
  let full = document.body.innerText || '';
  const notes = capped.map(function (c) {
    return '[capped region: ' + c.words + ' words behind a ' + c.h +
      'px cap that scrolls itself, ' + Math.round(c.sh / c.h) + 'x its own height]';
  });
  if (notes.length) full = full + '\\n\\n' + notes.join('\\n');

  return { full, prose: parts.join('\\n\\n'), capped: capped.map(c => ({ words: c.words, h: c.h, sh: c.sh })) };
})()`;

function serve(root, port) {
  const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
                  '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
                  '.png': 'image/png', '.ico': 'image/x-icon', '.txt': 'text/plain',
                  '.xml': 'application/xml', '.webmanifest': 'application/manifest+json' };
  const srv = http.createServer((req, res) => {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const file = path.resolve(root, rel);
    if (!file.startsWith(path.resolve(root))) { res.writeHead(403).end(); return; }
    fs.readFile(file, (err, buf) => {
      if (err) { res.writeHead(404).end('not found'); return; }
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      res.end(buf);
    });
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
}

const srv = process.env.HMM_SERVE_PORT ? null : await serve(process.cwd(), PORT);
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'prose'), { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let bad = 0;

for (const p of PAGES) {
  const url = `http://127.0.0.1:${PORT}/${p}`;
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto(url, { waitUntil: 'networkidle' });
  // the charts and the stream mount on load, then settle
  await page.waitForTimeout(1200);
  const { full, prose, capped } = await page.evaluate(EXTRACT);
  const stem = p.replace(/\.html$/, '');
  fs.writeFileSync(path.join(OUT, stem + '.txt'), full + '\n');
  fs.writeFileSync(path.join(OUT, 'prose', stem + '.txt'), prose + '\n');
  const fw = full.trim().split(/\s+/).filter(Boolean).length;
  const pw = prose.trim().split(/\s+/).filter(Boolean).length;
  const stat = fs.statSync(p).size;
  const capNote = (capped && capped.length) ? `   [${capped.length} capped region(s), ${capped.reduce((a, c) => a + c.words, 0)} words behind a cap]` : "";
  console.log(`${p.padEnd(18)} rendered ${String(fw).padStart(5)} words   prose ${String(pw).padStart(5)}   (${Math.round(stat / 1024)} KB source)${capNote}`);
  if (errors.length) { bad++; console.error(`  page errors: ${errors.join(' | ')}`); }
}

await browser.close();
if (srv) srv.close();
console.log(`\nwrote ${OUT}/ (lexical target) and ${OUT}/prose/ (structural target)`);
process.exit(bad ? 1 : 0);
