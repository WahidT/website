/* Builds the per-market strength snapshot the three market charts read from, so no
   figure on those charts is typed by hand.

   Why the charts changed. The panels used to carry six axes scored 0 to 10, and the
   caption on them declared four of the six "assessed from market structure". An
   assessment has no file behind it, and the site rule is that a figure reads from the
   estate through a script or a guarded snapshot, or the sentence stands without it. The
   two axes the caption called measured are the two facts this file reads from their
   owners instead, so nothing measured was lost when the assessed axes went.

   What each bar reads from, and it is a different owner per bar:

     INSTRUMENTS IN FORCE   data/reg_instruments.js, counted on the same predicate as
                            scripts/check-register-figures.mjs, which is the predicate
                            count_reg_dates.py applies in the estate. One arithmetic,
                            two repositories.
     OPERATIVE SINCE 2020   the same rows, counted on `op`, the operative year of the
                            obligation. Never on `yr`, which is a timeline position.
     LISTING SHARE          canon current.listing_prob, copied verbatim. ⚠ Canon's own
                            warning travels with it: this is the share of WINNER exits
                            by listing, conditional on a company being a winner, and it
                            is never plated as an unconditional listing probability.

   The specialisation index is not in here, and since 2026-09-14 it is not typed either.
   This header used to reason it out of the snapshot layer altogether: a snapshot would
   add a copy without adding an owner. That held while the table carried eighteen
   finished ratios and nothing else. It stopped holding once the COUNTS travelled with
   them, because the counts are the owner and the ratio is then derived rather than
   carried. It has its own generator and its own snapshot,
   scripts/necessity-matrix.mjs and data/necessity_matrix.js, and
   check-register-figures.mjs recomputes every cell from the base beside it.

   Usage:
     node scripts/market-strength.mjs            print what the charts will draw
     node scripts/market-strength.mjs --write    refresh the snapshot from live canon
     HMM_CANON=/path/to/canon.json node scripts/market-strength.mjs */
import fs from 'node:fs';
import { canonPath } from './canon-figures.mjs';

/* The snapshot is a .js file assigning a global, which is the pattern every other data
   file in this repository already uses. One file is read by the browser through a
   <script src> and by node through `new Function`, so the page and the guard cannot
   drift apart, and no fetch is introduced into a site whose CSP comment records that it
   makes none. */
export const SNAPSHOT = 'data/market_strength.js';
export const MARKETS = ['AU', 'JP', 'NZ'];

/* The register side, counted from the data file rather than restated. Kept identical to
   the predicate in check-register-figures.mjs: in-market, type enforceable, status
   effective or transitional. */
export function readRegister(file = 'data/reg_instruments.js') {
  globalThis.window = globalThis.window || {};
  new Function(fs.readFileSync(file, 'utf8'))();
  const rows = globalThis.REG_INSTRUMENTS || globalThis.window.REG_INSTRUMENTS;
  const inForceFn = globalThis.REG_IN_FORCE || globalThis.window.REG_IN_FORCE;
  if (!rows || !inForceFn) throw new Error(`${file} did not define REG_INSTRUMENTS and REG_IN_FORCE`);
  const inForce = rows.filter(inForceFn);
  const out = {};
  for (const c of MARKETS) {
    const mine = inForce.filter(r => r.c === c);
    out[c] = {
      inForce: mine.length,
      since2020: mine.filter(r => r.op !== null && r.op >= 2020).length,
    };
  }
  out.total = inForce.length;
  return out;
}

/* Anchored on canon's own wording, so a canon rewording fails loudly here instead of
   yielding a wrong number quietly. */
export function parseListingProb(s) {
  const out = {};
  for (const c of MARKETS) {
    const m = s.match(new RegExp(`${c} ([\\d.]+)%`));
    if (!m) throw new Error(`canon listing_prob no longer states ${c}; the pattern in scripts/market-strength.mjs needs updating`);
    out[c] = m[1];
  }
  return out;
}

export function readLiveCanon() {
  const p = canonPath();
  if (!p) return null;
  const canon = JSON.parse(fs.readFileSync(p, 'utf8'));
  return { path: p, compiled: canon.compiled, listing_prob: canon.current.listing_prob };
}

export function readSnapshot(file = SNAPSHOT) {
  globalThis.window = globalThis.window || {};
  new Function(fs.readFileSync(file, 'utf8'))();
  const snap = globalThis.MARKET_STRENGTH || globalThis.window.MARKET_STRENGTH;
  if (!snap) throw new Error(`${file} did not define MARKET_STRENGTH`);
  return snap;
}

const isMain = process.argv[1] && process.argv[1].endsWith('market-strength.mjs');
if (isMain) {
  const reg = readRegister();
  const live = readLiveCanon();
  if (!live) {
    console.error('FAIL: canon.json was not found. Set HMM_CANON to its path.');
    process.exit(1);
  }
  const listing = parseListingProb(live.listing_prob);

  console.log(`canon      ${live.path}`);
  console.log(`compiled   ${live.compiled}`);
  console.log('');
  console.log('market   in force   since 2020   listing share of winner exits');
  for (const c of MARKETS) {
    console.log(`  ${c}      ${String(reg[c].inForce).padStart(3)}        ${String(reg[c].since2020).padStart(3)}          ${listing[c]}%`);
  }
  console.log(`  total   ${String(reg.total).padStart(3)}`);

  if (process.argv.includes('--write')) {
    const snap = {
      _note: 'Written by scripts/market-strength.mjs --write. Never hand-edit. listing_prob is copied verbatim from canon current.listing_prob and the chart figures are parsed out of it, not restated. The register block is counted from data/reg_instruments.js on the same predicate as check-register-figures.mjs.',
      _public: 'This file sits in the published root and is fetchable by anyone. It carries a per-market instrument count and a per-market share of winner exits by listing, both of which R-D1 keeps on the public surface as measured facts about a market. No fund allocation goes in here: positions per market, capital share per market and cheque per market are off every public surface under R-D1, and the public wall of 2026-07-25 applies to this file exactly as it applies to a page.',
      compiled: live.compiled,
      listing_prob: live.listing_prob,
      register: reg,
    };
    const body = `/* GENERATED by scripts/market-strength.mjs --write. Do not hand-edit.
   Regenerate after a canon recompile or a change to data/reg_instruments.js:
     node scripts/market-strength.mjs --write
   scripts/check-register-figures.mjs fails the deploy when this file and its two
   owners disagree. */
var MARKET_STRENGTH = ${JSON.stringify(snap, null, 2)};
if (typeof window !== 'undefined') window.MARKET_STRENGTH = MARKET_STRENGTH;
`;
    fs.writeFileSync(SNAPSHOT, body);
    console.log(`\nwrote ${SNAPSHOT}`);
  }
}
