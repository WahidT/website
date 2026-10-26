/* Clarity guard. Holds the thesis page to the targets in the clarity build plan
   (2026-10-21, after SITE_CLARITY_AUDIT_2026-10-20), so a later edit cannot quietly
   grow the page back, shrink type under the floor, or drop a section's label.

   At a 390px phone it fails on:
     - a section taller than its ceiling below,
     - the page taller than PAGE_CEILING,
     - any rendered text under 12px (SVG text is scaled by its screen transform,
       so a drawing callout that shrinks with its box is caught),
     - a section whose first element is not its eyebrow.
   At 1440px it checks the eyebrows and the type floor only.

   Ceilings were set on 2026-10-21 against the audit's 390px measurement of main at
   b11aa45: the gate to the plan's 1,700px target, every other section to its audit
   height plus the 15 percent the type-scale phase is allowed, plus the eyebrow's row.
   Change a ceiling only with a measured reason in the commit.

   Usage: node scripts/check-clarity.mjs [baseURL]   (default http://127.0.0.1:8791) */
import { measure } from './measure-clarity.mjs';

const BASE = (process.argv[2] || 'http://127.0.0.1:8791').replace(/\/$/, '');
const FLOOR = 12;
const PAGE_CEILING = 9000;
/* section id -> ceiling in px at 390. Audit heights: mandate 844, hero 2031, power 1224,
   eat 1238, heal 1258, s6 6633, s8 1115, s9 973, s10 234. */
const CEILINGS = {
  mandate: 1000, hero: 2400, power: 1460, eat: 1480, heal: 1500,
  s6: 1700, s8: 1340, s9: 1170, s10: 320,
};

const r = await measure(BASE);
const problems = [];
for (const [name, m] of Object.entries(r)) {
  const phone = name.startsWith('phone');
  for (const s of m.sections) {
    if (!s.eyebrow) problems.push(`${name}: #${s.id} does not open on an eyebrow`);
    if (phone) {
      const cap = CEILINGS[s.id];
      if (cap == null) problems.push(`${name}: #${s.id} has no ceiling; add one`);
      else if (s.height > cap) problems.push(`${name}: #${s.id} ${s.height}px over its ${cap}px ceiling`);
    }
  }
  if (phone && m.pageHeight > PAGE_CEILING) problems.push(`${name}: page ${m.pageHeight}px over ${PAGE_CEILING}px`);
  for (const [where, px] of m.under12) problems.push(`${name}: ${where} text at ${px}px, under ${FLOOR}px`);
}

for (const p of problems) console.log('FAIL ' + p);
console.log(problems.length ? `\n${problems.length} clarity findings` : 'clarity: all checks pass');
process.exit(problems.length ? 1 : 0);
