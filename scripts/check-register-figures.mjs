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
                  on it comes out one short of what the sourced instrument tables produce, on
                  one row (Japan's feed-in premium: 2012 parent statute on the axis, operative
                  from 2022). Every in-force row must carry op, as a year or as null, so a row
                  added without it fails here instead of dropping out of the count silently.
                  The totals moved on 2026-09-14 under R-D29, when the two emissions-accounting
                  instruments left the counted stack; count_reg_dates.py in the estate is the
                  same computation and the two now agree at 31 in force, 14 of them post-2020.
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

/* ---------------------------------------------------------------------------
   The tier-liquidity sentence on for-llms.html, against canon.

   Same defect, a second surface. The page states a register size, two tier rates,
   an odds ratio and a p-value, and those belong to the engine, not to this
   repository: they move whenever canon is recompiled on a new plate. Nothing here
   noticed the 2026-09-13 re-strike, so the page went on printing the figures from
   before it.

   canon.json is not in this tree and the Netlify build cannot reach it, so the
   build compares the page against data/canon_tier_liquidity.json, the canon entry
   copied verbatim by scripts/canon-figures.mjs --write. Where the estate's canon
   file IS reachable, which is every local run and every run on the GP's machine,
   the snapshot is checked against it too, so a recompile fails here rather than
   waiting to be spotted on the live site. Both sides are parsed; neither is
   restated. --------------------------------------------------------------- */
const { parseTierLiquidity, readLiveCanon, readSnapshot, SNAPSHOT } = await import('./canon-figures.mjs');

let tierBad = 0;
const snap = readSnapshot();
const live = readLiveCanon();

console.log('');
if (live) {
  if (live.tier_liquidity !== snap.tier_liquidity) {
    console.error(`FAIL  ${SNAPSHOT} is behind ${live.path}. Run: node scripts/canon-figures.mjs --write`);
    tierBad++;
  } else {
    console.log(`ok    ${SNAPSHOT} matches canon compiled ${live.compiled}`);
  }
} else {
  console.log(`note  canon.json not reachable here; checking the page against ${SNAPSHOT} (compiled ${snap.compiled}).`);
}

const canonFigs = parseTierLiquidity(snap.tier_liquidity);
const llms = fs.readFileSync('for-llms.html', 'utf8');
const t = llms.match(/Across ([\d,]+) companies in Australia, Japan and New Zealand, companies whose product requires a hard regulatory approval exit at ([\d.]+)% against ([\d.]+)% for companies facing no regulatory gate, an odds ratio of ([\d.]+) at p = ([\d.e+-]+)\. The effect sits at one tier only: companies selling into a buyer under a compliance obligation exit at ([\d.]+)%/);
if (!t) {
  console.error('FAIL: the tier-liquidity sentence was not found in for-llms.html.');
  console.error('If it was reworded, update the pattern in this file so the guard keeps working.');
  process.exit(1);
}
const pageFigs = {
  registerCount: t[1], hardApprovalPct: t[2], noGatePct: t[3],
  oddsRatio: t[4], yatesP: t[5], buyerObligationPct: t[6],
};
for (const k of Object.keys(pageFigs)) {
  const ok = pageFigs[k] === canonFigs[k];
  if (!ok) tierBad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${k.padEnd(20)} page says ${String(pageFigs[k]).padStart(9)}   canon says ${String(canonFigs[k]).padStart(9)}`);
}
/* THE SECOND COPY, on the homepage, added 2026-09-14 with plate 06.D.
   The tier finding now prints on a human page as well as on the machine page, and two copies
   of one canon figure drift the moment one is edited alone, with the stale copy being the one
   that loads first. So both are parsed against the same snapshot, and either disagreeing
   fails the deploy. Neither is restated here. */
const home = fs.readFileSync('index.html', 'utf8');
const h = home.match(/Companies whose product cannot be sold without an approval reach a liquidity event at ([\d.]+)%, against ([\d.]+)% where no approval gates the sale, measured on ([\d,]+) companies across the three markets at an odds ratio of ([\d.]+)\. The tier between them, where a buyer sits under a compliance obligation, reaches ([\d.]+)%/);
if (!h) {
  console.error('FAIL: plate 06.D\'s measured sentence was not found in index.html.');
  console.error('If it was reworded, update the pattern in this file so the guard keeps working.');
  process.exit(1);
}
const homeFigs = {
  hardApprovalPct: h[1], noGatePct: h[2], registerCount: h[3],
  oddsRatio: h[4], buyerObligationPct: h[5],
};
console.log('');
for (const k of Object.keys(homeFigs)) {
  const ok = homeFigs[k] === canonFigs[k];
  if (!ok) tierBad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  06.D ${k.padEnd(19)} page says ${String(homeFigs[k]).padStart(9)}   canon says ${String(canonFigs[k]).padStart(9)}`);
}

console.log(tierBad ? `\n${tierBad} problem(s) in the tier-liquidity sentences against canon.`
                    : '\nboth tier-liquidity sentences, on the homepage and the machine page, match canon.');

/* ---------------------------------------------------------------------------
   The per-market strength snapshot, against its two owners.

   Same defect a third time, and the third surface is a chart rather than a sentence.
   data/market_strength.js carries a per-market instrument count and a per-market
   listing share, and the two come from different owners: the counts from
   data/reg_instruments.js, the share from canon. A chart is the easiest place for a
   figure to go stale, because nobody re-reads a bar. So the snapshot is recomputed here
   from the register on every build and compared, and its canon half is compared against
   live canon wherever the estate file is reachable. Neither side is restated.
   --------------------------------------------------------------------------- */
const MSMOD = await import('./market-strength.mjs');

let msBad = 0;
console.log('');
{
  const snap = MSMOD.readSnapshot();
  const freshReg = MSMOD.readRegister();
  for (const c of [...MSMOD.MARKETS, 'total']) {
    if (c === 'total') {
      const ok = snap.register.total === freshReg.total;
      if (!ok) msBad++;
      console.log(`${ok ? 'ok  ' : 'FAIL'}  strength total      snapshot ${String(snap.register.total).padStart(3)}   register ${String(freshReg.total).padStart(3)}`);
      continue;
    }
    for (const k of ['inForce', 'since2020']) {
      const ok = snap.register[c][k] === freshReg[c][k];
      if (!ok) msBad++;
      console.log(`${ok ? 'ok  ' : 'FAIL'}  strength ${(c + ' ' + k).padEnd(17)} snapshot ${String(snap.register[c][k]).padStart(3)}   register ${String(freshReg[c][k]).padStart(3)}`);
    }
  }

  const msLive = MSMOD.readLiveCanon();
  if (msLive) {
    if (msLive.listing_prob !== snap.listing_prob) {
      console.error(`FAIL  ${MSMOD.SNAPSHOT} listing_prob is behind ${msLive.path}. Run: node scripts/market-strength.mjs --write`);
      msBad++;
    } else {
      console.log(`ok    ${MSMOD.SNAPSHOT} listing_prob matches canon compiled ${msLive.compiled}`);
    }
  } else {
    console.log(`note  canon.json not reachable here; ${MSMOD.SNAPSHOT} listing_prob checked for shape only.`);
  }
  // The parse has to keep working whether or not canon is reachable, because the chart
  // parses the same string in the browser.
  try {
    const shares = MSMOD.parseListingProb(snap.listing_prob);
    console.log(`ok    listing share parses: AU ${shares.AU}% JP ${shares.JP}% NZ ${shares.NZ}%`);
  } catch (e) {
    console.error(`FAIL  ${e.message}`);
    msBad++;
  }
}
console.log(msBad ? `\n${msBad} problem(s) in the market-strength snapshot against its owners.`
                  : '\nthe market-strength snapshot matches the register and canon.');


process.exit(bad || tierBad || msBad ? 1 : 0);
