/* Affordance audit. The rule this enforces: cursor:pointer is a promise that
   clicking does something, and every element that does something on click must
   make that visible.

   Two regressions have already shipped against this rule. The timeline scatter
   handler set body.style.cursor and told 58 rows they were links; the dot-field
   motion engine set it on the whole machine diagram for a decorative ripple.
   Both were invisible in review because a pointer cursor looks like intent.

   The audit reports only elements that DECLARE cursor:pointer — where the
   parent's computed cursor differs — because cursor inherits, so a naive sweep
   reports every descendant of a genuine link and buries the real finding.

   Cursors other than pointer are allowed on interactive elements when they name
   the actual effect: zoom-in on the magnifying callouts, help on the tooltip
   axis labels. Those are listed in ALLOW.

   Usage: node scripts/check-affordances.mjs [baseURL]   (default http://127.0.0.1:8791) */
import { chromium } from 'playwright';

const BASE = (process.argv[2] || 'http://127.0.0.1:8791').replace(/\/$/, '');
/* Playwright resolves its own Chromium (installed by the postinstall script); CHROMIUM_PATH overrides it. */
const EXECUTABLE = process.env.CHROMIUM_PATH || undefined;
const ROUTES = ['index.html', 'bio.html', 'sources.html', 'for-llms.html', '404.html'];

/* selector -> cursor deliberately not `pointer`, because the effect is not activation */
const ALLOW = [
  ['.callout',  'zoom-in'],   // hover/focus magnifies the callout, it does not navigate
  ['.axis-lbl', 'help'],      // hover/focus opens a definition tooltip
];

const probe = allow => {
  const isInteractive = el => {
    const t = el.tagName;
    if (t === 'A' && el.hasAttribute('href')) return true;
    if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY', 'LABEL'].includes(t)) return true;
    if (el.hasAttribute('onclick')) return true;
    if (el.hasAttribute('tabindex') && el.getAttribute('tabindex') !== '-1') return true;
    return ['button', 'link', 'tab', 'checkbox', 'radio', 'menuitem', 'option', 'switch']
      .includes(el.getAttribute('role'));
  };
  const name = el => el.tagName +
    (el.id ? '#' + el.id : '') +
    (el.getAttribute('class') ? '.' + el.getAttribute('class').trim().split(/\s+/).join('.') : '');

  const lies = [], silent = [];
  for (const el of document.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const inter = isInteractive(el);
    const parent = el.parentElement;

    // declares pointer but nothing here or above it responds to a click
    if (cs.cursor === 'pointer' && (!parent || getComputedStyle(parent).cursor !== 'pointer') && !inter) {
      let a = parent, owner = null;
      while (a) { if (isInteractive(a)) { owner = a; break; } a = a.parentElement; }
      if (!owner) lies.push({ el: name(el), text: (el.textContent || '').trim().slice(0, 48) });
    }

    // responds to a click but gives the pointer no signal
    if (inter && cs.cursor !== 'pointer' && el.getBoundingClientRect().width > 0) {
      const excused = allow.some(([sel, cur]) => cs.cursor === cur && el.matches(sel));
      if (!excused) silent.push({ el: name(el), cursor: cs.cursor, text: (el.textContent || '').trim().slice(0, 48) });
    }
  }
  return { lies, silent };
};

const roll = rows => {
  const m = new Map();
  for (const r of rows) {
    const k = r.el + '|' + (r.cursor || '');
    const v = m.get(k) || { ...r, n: 0 };
    v.n++; if (!v.text && r.text) v.text = r.text;
    m.set(k, v);
  }
  return [...m.values()].sort((a, b) => b.n - a.n);
};

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
let bad = 0;

for (const route of ROUTES) {
  await page.goto(`${BASE}/${route}`, { waitUntil: 'networkidle' });
  const { lies, silent } = await page.evaluate(probe, ALLOW);
  const l = roll(lies), s = roll(silent);
  if (!l.length && !s.length) { console.log(`${route.padEnd(16)} pass`); continue; }
  bad++;
  console.log(`${route.padEnd(16)} FAIL`);
  for (const r of l) console.log(`  pointer, but nothing responds   ${String(r.n).padStart(3)}x  ${r.el}  ${r.text}`);
  for (const r of s) console.log(`  responds, but cursor:${r.cursor.padEnd(8)} ${String(r.n).padStart(3)}x  ${r.el}  ${r.text}`);
}

await browser.close();
console.log(bad ? `\n${bad} page(s) with affordance mismatches` : '\nevery cursor:pointer is clickable, and every clickable thing says so');
process.exit(bad ? 1 : 0);
