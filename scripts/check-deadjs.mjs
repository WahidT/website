/* Dead JS-selector audit. Reports getElementById / querySelector / querySelectorAll
   string literals in the root scripts that match nothing on any page.

   The probe runs against the rendered DOM, not the markup, because most of the
   site's selectors target elements the scripts build (the schematic mounts, the
   radar chips, the record stream); a grep of the HTML alone would flag all of
   them. A selector that matches nothing after every page has rendered and been
   scrolled is code waiting on an element that no longer exists, which is how the
   S5 helix builder for #aiSplit outlived its section by a full audit cycle.

   ALLOW carries selectors that are legitimately unmatched at rest: a class the
   scripts toggle on interaction, or one built by concatenation whose literal is
   a fragment. An invalid fragment fails querySelector and is skipped as such.

   Usage: node scripts/check-deadjs.mjs [baseURL]    (default http://127.0.0.1:8791) */
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';

const BASE = (process.argv[2] || 'http://127.0.0.1:8791').replace(/\/$/, '');
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;
const ROUTES = ['index.html', 'bio.html', 'sources.html', 'for-llms.html', '404.html'];
const ALLOW = new Set([
  '.blk--active',     // toggled onto one schematic block when a stage is opened
]);

// selector literal -> files that carry it
const CALL = /\.(getElementById|querySelector|querySelectorAll)\(\s*(['"])((?:(?!\2)[^\\]|\\.)*)\2\s*\)/g;
const wanted = new Map();
for (const f of readdirSync('.').filter(f => f.endsWith('.js')).sort()) {
  for (const m of readFileSync(f, 'utf8').matchAll(CALL)) {
    const sel = m[1] === 'getElementById' ? `#${m[3]}` : m[3];
    if (!wanted.has(sel)) wanted.set(sel, new Set());
    wanted.get(sel).add(f);
  }
}

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const unmatched = new Set(wanted.keys());
for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  const hits = await page.evaluate(async sels => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y <= document.body.scrollHeight; y += innerHeight * 0.4) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
    }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
    const out = [];
    for (const s of sels) { try { if (document.querySelector(s)) out.push(s); } catch { out.push(s); } }
    return out;
  }, [...unmatched]);
  for (const s of hits) unmatched.delete(s);
  await page.close();
}
await browser.close();

const dead = [...unmatched].filter(s => !ALLOW.has(s)).sort();
console.log(`${wanted.size} selector literal(s) across the root scripts, probed on ${ROUTES.length} routes`);
for (const s of dead) console.log(`    ${s.padEnd(28)} ${[...wanted.get(s)].join(', ')}`);
console.log(dead.length ? `\n${dead.length} selector(s) matching nothing on any page` : 'no dead selectors: every literal finds an element on at least one page');
process.exit(dead.length ? 1 : 0);
