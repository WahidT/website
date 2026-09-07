/* Dead CSS audit. Reports rules whose selector matches nothing in the page and
   whose class or id never appears in the markup or in any script.

   Both halves are needed. Matching the DOM alone is far too eager: a rule keyed
   on a class that JS toggles (.tl-hidden, .blk--active, .railnav.is-on) or that
   is built by concatenation (.tl-st-- plus a record's status) is live even
   though nothing carries it at rest. Checking the source alone is too lax: a
   class can be referenced by a querySelector that never finds anything, which
   is how .stage-hint survived.

   The source corpus is markup tags plus script contents, deliberately not the
   visible copy - the words "lens" and "tl" appear in the page's prose and made
   two removed sections look alive.

   ALLOW carries the rules that are legitimately unmatched at rest and cannot be
   inferred: a forward-looking contract, or styling that only applies when the
   copy happens to contain that element.

   Usage: node scripts/check-dead-css.mjs [baseURL]    (default http://127.0.0.1:8791) */
import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = (process.argv[2] || 'http://127.0.0.1:8791').replace(/\/$/, '');
/* Playwright resolves its own Chromium (installed by the postinstall script); CHROMIUM_PATH overrides it. */
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;
const ROUTES = ['index.html', 'bio.html', 'sources.html', 'for-llms.html', '404.html'];

const ALLOW = new Set([
  // the box tiers are a contract: a panel that ever gains a link must show a pointer
  '.u-panel a', '.u-panel button',
  // emphasis inside live prose - absent only because no copy currently uses it
  '.card p b', '.through p b', '.reg-plate p b', '.llm-qa .llm-a b',
  // built as 'tl-st--' + a record's status; absent only because no record has it
  '.tl-st--proposed',
]);

const jsSources = () => {
  const files = [];
  for (const d of ['.', 'scripts', 'data']) {
    for (const f of readdirSync(d)) if (f.endsWith('.js')) files.push(join(d, f));
  }
  return files.map(f => readFileSync(f, 'utf8')).join('\n');
};

const probe = () => {
  const selectors = [];
  const walk = list => { for (let i = 0; i < list.length; i++) {
    const r = list[i];
    // an @import carries its rules on .styleSheet, not .cssRules; the first
    // version of this guard never looked there and so never saw the imported sheets
    if (r.styleSheet) { try { walk(r.styleSheet.cssRules); } catch { /* cross-origin */ } continue; }
    if (r.cssRules && r.cssRules.length) walk(r.cssRules);
    if (r.selectorText) selectors.push(r.selectorText);
  }};
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    // hmm-tokens.css is a generated design-system export shared beyond this site;
    // unused entries there are expected and are not this site's dead code
    if (sheet.href && /hmm-tokens\.css/.test(sheet.href)) continue;
    try { walk(sheet.cssRules); } catch { /* cross-origin */ }
  }
  const PSEUDO = /::?[a-zA-Z-]+(\([^()]*(\([^()]*\))?[^()]*\))?/g;
  const unmatched = [], seen = new Set();
  for (const list of selectors) for (const part of list.split(',')) {
    const raw = part.trim();
    if (!raw || seen.has(raw)) continue;
    seen.add(raw);
    const bare = raw.replace(PSEUDO, '').replace(/\s+/g, ' ').trim();
    if (!bare) continue;
    let hit; try { hit = !!document.querySelector(bare); } catch { hit = true; }
    if (!hit) unmatched.push(raw);
  }
  return unmatched;
};

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const js = jsSources();
let findings = 0;

for (const route of ROUTES) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y <= document.body.scrollHeight; y += innerHeight * 0.4) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 60));
    }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
  const unmatched = await page.evaluate(probe);
  await page.close();

  const html = readFileSync(route, 'utf8').replace(/<style[^>]*>[\s\S]*?<\/style>/g, '');
  const tags = (html.match(/<[^>]+>/g) || []).join(' ');
  const scripts = (html.match(/<script[^>]*>[\s\S]*?<\/script>/g) || []).join('\n');
  const corpus = `${tags}\n${scripts}\n${js}`;
  const referenced = t => new RegExp(`(?<![\\w-])${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`).test(corpus);

  const dead = unmatched.filter(sel => {
    if (ALLOW.has(sel)) return false;
    const tokens = [...sel.matchAll(/[.#]([A-Za-z_][\w-]*)/g)].map(m => m[1]);
    return tokens.length > 0 && !tokens.some(referenced);
  });

  if (!dead.length) { console.log(`${route.padEnd(16)} pass`); continue; }
  findings++;
  console.log(`${route.padEnd(16)} FAIL — ${dead.length} rule(s) with no element and no reference`);
  for (const sel of dead) console.log(`    ${sel}`);
}

await browser.close();
console.log(findings ? `\n${findings} page(s) carrying dead CSS` : '\nno dead CSS: every rule has an element or a reference that can create one');
process.exit(findings ? 1 : 0);
