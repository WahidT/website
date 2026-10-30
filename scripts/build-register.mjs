/* Writes the register's rows into register.html, between the reg:static markers inside #tlBody,
   so the page lists every instrument without JavaScript (2026-10-30, handover item 7).

   It runs scripts/reg-render.js, the same builder register.js calls in the browser, over
   data/reg_instruments.js, so the static copy is the live render by construction. With --check
   it writes nothing and exits 1 if the committed copy differs from what the data now builds,
   which is how an edit to the data without a rebuild is caught.

   Usage: node scripts/build-register.mjs           (rewrite register.html)
          node scripts/build-register.mjs --check   (exit 1 when stale) */
import fs from 'node:fs';
import vm from 'node:vm';

const ctx = { window: {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('data/reg_instruments.js', 'utf8'), ctx);
vm.runInContext(fs.readFileSync('scripts/reg-render.js', 'utf8'), ctx);
const html = ctx.window.REG_RENDER(ctx.window.REG_INSTRUMENTS);

const START = '<!-- reg:static:start -->', END = '<!-- reg:static:end -->';
const page = fs.readFileSync('register.html', 'utf8');
const a = page.indexOf(START), b = page.indexOf(END);
if (a < 0 || b < a) { console.error('FAIL  register.html has no reg:static markers inside #tlBody'); process.exit(1); }
const built = page.slice(0, a + START.length) + html + page.slice(b);
const rows = (html.match(/class="tl-row /g) || []).length + (html.match(/class="tl-stand-item /g) || []).length;

if (process.argv.includes('--check')) {
  if (built !== page) { console.error('FAIL  register.html static rows are stale: run node scripts/build-register.mjs'); process.exit(1); }
  console.log(`ok    register.html carries all ${rows} instruments without JavaScript, and they match the data.`);
} else {
  fs.writeFileSync('register.html', built);
  console.log(`wrote ${rows} instruments into register.html`);
}
