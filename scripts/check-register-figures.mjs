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
/* The enacted-record sentence was removed from index.html on 2026-09-15 (GP), so the block
   that checked its six figures went with it. A guard whose target no longer exists reports
   clean, and a clean bill from a checker that read nothing is its most dangerous output.

   ⚠ The register counts are NOT unguarded. They are drawn by the market bars, which read
   data/market_strength.js, and the block further down reconciles that snapshot against
   data/reg_instruments.js on every deploy: per market in force, per market operative since
   2020, and the total. The in-force predicate and the operative-year integrity check above
   still run. What was lost is a check on one sentence, not a check on the arithmetic. */

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


/* ---------------------------------------------------------------------------
   The specialisation matrix, recomputed from its own counts.

   The table under the market charts used to hold eighteen finished ratios and
   nothing else, so nothing in this repository could tell a correct cell from a
   mistyped one. data/necessity_matrix.js now carries the counts each ratio is
   derived from, which makes the derivation checkable here with no access to the
   estate: every index is recomputed from the counts beside it, and every printed
   row total is checked against its own cells.

   This does NOT check the counts against the workspace report, because the report
   is not present at deploy. Refreshing them is one command, named in the failure.
   --------------------------------------------------------------------------- */
let nmBad = 0;
console.log('');
if (!fs.existsSync('data/necessity_matrix.js')) {
  console.error('FAIL  data/necessity_matrix.js is missing. Run: node scripts/necessity-matrix.mjs --write');
  nmBad++;
} else {
  const NMMOD = await import('./necessity-matrix.mjs');
  const nmCtx = {};
  new Function('window', fs.readFileSync('data/necessity_matrix.js', 'utf8') + '\nwindow.__ = NECESSITY_MATRIX;')(nmCtx);
  const nm = nmCtx.__;
  for (const key of Object.keys(nm.bases)) {
    const base = nm.bases[key];
    /* Rebuild the plain count table the formula takes, keyed by full market name. */
    const counts = {};
    for (const m of NMMOD.MARKETS) {
      const mk = base.markets[NMMOD.CODES[m]];
      counts[m] = Object.fromEntries(NMMOD.NEC.map(n => [n, mk.cells[n].n]));
      const sum = NMMOD.NEC.reduce((a, n) => a + counts[m][n], 0);
      const ok = sum === mk.total;
      if (!ok) nmBad++;
      console.log(`${ok ? 'ok  ' : 'FAIL'}  matrix ${key} ${NMMOD.CODES[m]} base       cells ${String(sum).padStart(3)}   stated ${String(mk.total).padStart(3)}`);
    }
    const grand = NMMOD.MARKETS.reduce((a, m) => a + NMMOD.NEC.reduce((b, n) => b + counts[m][n], 0), 0);
    const gok = grand === base.total;
    if (!gok) nmBad++;
    console.log(`${gok ? 'ok  ' : 'FAIL'}  matrix ${key} grand total    cells ${String(grand).padStart(3)}   stated ${String(base.total).padStart(3)}`);
    for (const m of NMMOD.MARKETS) {
      for (const n of NMMOD.NEC) {
        const want = Number(NMMOD.index(counts, m, n).toFixed(4));
        const got = base.markets[NMMOD.CODES[m]].cells[n].idx;
        const ok = Math.abs(want - got) < 5e-4;
        if (!ok) nmBad++;
        if (!ok) console.log(`FAIL  matrix ${key} ${NMMOD.CODES[m]} ${n.padEnd(6)} snapshot ${got.toFixed(4)}   derived ${want.toFixed(4)}`);
      }
    }
  }
  if (!nmBad) console.log(`ok    every index in data/necessity_matrix.js derives from the counts beside it`);
  /* The lead the table marks must be the strongest cell on the basis it claims to use. */
  const lb = nm.bases[nm.lead_basis];
  for (const code of Object.keys(nm.leads)) {
    const cells = lb.markets[code].cells;
    const top = NMMOD.NEC.reduce((a, n) => (cells[n].idx > cells[a].idx ? n : a), NMMOD.NEC[0]);
    const ok = top === nm.leads[code];
    if (!ok) nmBad++;
    console.log(`${ok ? 'ok  ' : 'FAIL'}  matrix lead ${code}          marked ${nm.leads[code].padEnd(6)} strongest on ${nm.lead_basis} ${top}`);
  }
}
console.log(nmBad ? `\n${nmBad} problem(s) in the specialisation matrix. Run: node scripts/necessity-matrix.mjs --write`
                  : '\nevery specialisation index derives from its own base, and each lead is the strongest cell on the innovation row.');

/* ---------------------------------------------------------------------------
   The market table, every derived cell against the data it was derived from.

   R-D37 (2026-09-15) folded the market section into one table drawn by markets.js. Five of
   its rows are figures or facts read from data files, and one of them, the exit route, is
   DERIVED: listings lead where a market's listing share of winner exits is above half.
   A derivation that runs only in the browser is a derivation nobody checks, so markets.js
   exports its row builder on window and this block runs the same file under node, feeds
   it the snapshots, and reconciles: leads against data/necessity_matrix.js, the two
   register counts against a fresh count of data/reg_instruments.js, the share against the
   canon string, and the route against the share it must follow. The static markup of the
   section is also checked to carry no digit, because the rule for this section is that
   nothing numeric is typed into index.html.
   --------------------------------------------------------------------------- */
let mtBad = 0;
console.log('');
{
  const nmCtx = {};
  new Function('window', fs.readFileSync('data/necessity_matrix.js', 'utf8') + '\nwindow.__ = NECESSITY_MATRIX;')(nmCtx);
  const msSnap = MSMOD.readSnapshot();
  const win = { MARKET_STRENGTH: msSnap, NECESSITY_MATRIX: nmCtx.__ };
  new Function('window', 'document', fs.readFileSync('markets.js', 'utf8'))(win, undefined);
  const rowsFn = win.hmmMarketRows;
  if (typeof rowsFn !== 'function') { console.error('FAIL  markets.js did not export hmmMarketRows'); mtBad++; }
  const R = rowsFn ? rowsFn(msSnap, nmCtx.__) : null;
  if (!R) { console.error('FAIL  markets.js drew no rows from the snapshots'); mtBad++; }
  else {
    const byKey = Object.fromEntries(R.map(r => [r.key, r]));
    const freshReg = MSMOD.readRegister();
    const shares = MSMOD.parseListingProb(msSnap.listing_prob);
    for (const c of MSMOD.MARKETS) {
      const checks = [
        ['leads', byKey.leads.cells[c], nmCtx.__.leads[c]],
        ['inforce', byKey.inforce.cells[c], String(freshReg[c].inForce)],
        ['since2020', byKey.since2020.cells[c], String(freshReg[c].since2020)],
        ['listing', byKey.listing.cells[c], shares[c] + '%'],
        ['route', byKey.route.cells[c], parseFloat(shares[c]) > 50 ? 'Listing' : 'Trade sale'],
      ];
      for (const [k, got, want] of checks) {
        const ok = got === want;
        if (!ok) mtBad++;
        console.log(`${ok ? 'ok  ' : 'FAIL'}  table ${(c + ' ' + k).padEnd(14)} drawn ${String(got).padStart(10)}   owner ${String(want).padStart(10)}`);
      }
    }
  }
  const sec = home.match(/<section class="mkt" id="s7">([\s\S]*?)<\/section>/);
  const typed = sec ? sec[1].replace(/<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, ' ').match(/\d/g) : null;
  if (!sec) { console.error('FAIL  the markets section was not found in index.html'); mtBad++; }
  else if (typed) { console.error(`FAIL  the markets section markup types ${typed.length} digit(s); every figure in it must come from markets.js`); mtBad++; }
  else console.log('ok    the markets section markup carries no typed digit');
}
console.log(mtBad ? `\n${mtBad} problem(s) in the market table against its owners.`
                  : '\nevery derived cell of the market table matches the data it reads.');

process.exit(tierBad || msBad || nmBad || mtBad ? 1 : 0);
