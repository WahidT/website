/* Reads the innovation and exit catalogue, catalogue.js, for the guard that keeps every
   catalogued company name off the served pages.

   Until 2026-09-15 the sourcing section carried a scrolling stream of every named company in
   catalogue.js; the general partner ruled the names off the served page. Until 2026-09-24 the
   section stated the counts instead, read from a snapshot this script wrote; the general
   partner ruled the sentence off too, and the snapshot went with it. catalogue.js is loaded
   by no page and stays in the repository as the owner this script reads.

   Usage:  node scripts/catalogue-counts.mjs            print the counts per market */
import fs from 'node:fs';

export const MARKETS = ['AU', 'JP', 'NZ'];
const INNOVATION = new Set(['Hardware', 'Software', 'IP']);

export function readCatalogue(file = 'catalogue.js') {
  const ctx = {};
  new Function('window', fs.readFileSync(file, 'utf8') + '\nwindow.__ = CATALOGUE;')(ctx);
  if (!Array.isArray(ctx.__)) throw new Error(`${file} did not define CATALOGUE`);
  return ctx.__;
}

export function count(rows) {
  const out = { total: { companies: 0, innovations: 0 } };
  for (const c of MARKETS) out[c] = { companies: 0, innovations: 0 };
  for (const r of rows) {
    if (!out[r.m]) throw new Error(`catalogue row for an unknown market: ${r.m}`);
    if (r.cat === 'Exit') {
      const n = String(r.name).split(',').map(s => s.trim()).filter(Boolean).length;
      out[r.m].companies += n; out.total.companies += n;
    } else if (INNOVATION.has(r.cat)) {
      out[r.m].innovations += 1; out.total.innovations += 1;
    } else {
      throw new Error(`catalogue row with an unknown category: ${r.cat}`);
    }
  }
  return out;
}

const isMain = process.argv[1] && process.argv[1].endsWith('catalogue-counts.mjs');
if (isMain) {
  const counts = count(readCatalogue());
  console.log('market   companies   innovations');
  for (const c of [...MARKETS, 'total']) console.log(`${c.padEnd(8)} ${String(counts[c].companies).padStart(9)}   ${String(counts[c].innovations).padStart(11)}`);
}
