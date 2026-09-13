/* Guards the "enacted record" sentence in index.html against the data it describes.

   The sentence states six figures. They are correct today, but nothing stopped
   them drifting from data/reg_instruments.js, and a review of this site did in
   fact mis-read them once, by counting every `enforceable` row regardless of
   status, which sweeps in the four `expected` instruments the same sentence
   separately calls "four more scheduled". That definition is the whole point of
   this check, so it is written down here rather than left to be re-derived:

     IN FORCE   = REG_IN_FORCE in data/reg_instruments.js: in-market (not global), type
                  "enforceable", status "effective" or "transitional". The page's S7 block
                  uses the same function, so the two cannot disagree.
     SINCE 2020 = in force, with op (the operative year of the obligation) 2020 or later.
                  Counted on op and never on yr: yr is a timeline position, and a count taken
                  on it shipped fourteen against the fifteen the sourced instrument tables
                  produce, on one row (Japan's feed-in premium: 2012 parent statute on the
                  axis, operative from 2022). Every in-force row must carry op, as a year or
                  as null, so a row added without it fails here instead of dropping out of
                  the count silently.
     SCHEDULED  = in-market, year 2027-2030

   Usage: node scripts/check-register-figures.mjs        (exit 1 on mismatch) */
import fs from 'node:fs';

const WORDS = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10 };

globalThis.window = {};
new Function(fs.readFileSync('data/reg_instruments.js', 'utf8'))();
const R = globalThis.REG_INSTRUMENTS || globalThis.window.REG_INSTRUMENTS;
const IN_FORCE = globalThis.REG_IN_FORCE || globalThis.window.REG_IN_FORCE;

const inForce = R.filter(IN_FORCE);
const missingOp = inForce.filter(r => !('op' in r) || !(r.op === null || Number.isInteger(r.op)));
if (missingOp.length) {
  console.error('FAIL: in-force rows without an operative year (op, a year or null):');
  for (const r of missingOp) console.error(`  ${r.c}  ${r.name}`);
  process.exit(1);
}
const byCountry = c => inForce.filter(r => r.c === c).length;
const actual = {
  total: inForce.length,
  AU: byCountry('AU'), JP: byCountry('JP'), NZ: byCountry('NZ'),
  since2020: inForce.filter(r => r.op !== null && r.op >= 2020).length,
  scheduled: R.filter(r => !r.global && r.yr >= 2027 && r.yr <= 2030).length,
};

const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/hmm maps (\d+) enforceable instruments in force across the three markets: (\d+) in Australia, (\d+) in Japan, (\d+) in New Zealand, (\d+) of them operative since 2020, with (\w+) more scheduled between 2027 and 2030/);
if (!m) {
  console.error('FAIL: the enacted-record sentence was not found in index.html.');
  console.error('If it was reworded, update the pattern in this file so the guard keeps working.');
  process.exit(1);
}
const stated = {
  total: +m[1], AU: +m[2], JP: +m[3], NZ: +m[4], since2020: +m[5],
  scheduled: WORDS[m[6].toLowerCase()] ?? NaN,
};

let bad = 0;
for (const k of Object.keys(actual)) {
  const ok = stated[k] === actual[k];
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${k.padEnd(10)} page says ${String(stated[k]).padStart(3)}   data says ${String(actual[k]).padStart(3)}`);
}
console.log(bad ? `\n${bad} figure(s) in the enacted-record sentence disagree with the register.`
                : '\nall six figures in the enacted-record sentence match the register.');
process.exit(bad ? 1 : 0);
