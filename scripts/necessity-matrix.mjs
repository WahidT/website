/* Builds the specialisation snapshot the matrix under the market charts reads from, so
   no cell on that table is typed by hand and every cell prints the base it rests on.

   WHY THIS FILE EXISTS, given that scripts/market-strength.mjs says the opposite.
   That file's header reasoned the specialisation index out of the snapshot layer: "a
   snapshot would add a copy without adding an owner". That was correct while the table
   held eighteen finished ratios and nothing else, because copying a ratio from a report
   into a stylesheet is a second copy of one number and the second copy is the one that
   goes stale. It stops being correct once the COUNTS travel with the ratio. The counts
   are the owner. With them in the file the ratio is derived rather than carried, a guard
   can recompute it in this repository with no access to the estate, and the table can
   print what each cell rests on. The market-strength header now points here.

   WHAT IT READS. The "Counts behind the index" block of
   Internal/Projects/Working_Docs/Research_Returns/NECESSITY_MATRIX_2026-08-30.md in the
   workspace, which is the owner of both bases. Two tables, three markets, three
   necessities, with the row total printed beside each row and checked against its cells.

   THE ARITHMETIC, stated once because the guard re-runs it. A cell's index is the
   market's share of that necessity divided by the share its own size predicts:

       index(market, necessity) = (cell / column total) / (row total / grand total)

   An index of 1.0 sits exactly where size predicts. This is the only place the formula
   is written; radars.js draws what this file emits and check-register-figures.mjs
   recomputes it from the counts in the emitted file.

   WHY ONE DECIMAL, which is the change of 2026-09-14. The innovation base is 79 items
   across nine cells and one of those cells holds four. A ratio resting on four items
   does not carry a second decimal, and printing one implied a precision the catalogue
   cannot support. The base prints beside the index for the same reason: a reader who can
   see the cell holds four items can discount it without being told to.

   ⚠ THE TWO BASES ARE NOT INDEPENDENT and the snapshot carries that warning into the
   published file. Both count items in one catalogue assembled in one pass under one
   necessity classification, so the exit row agreeing with the innovation row is the same
   source read twice, never corroboration. The lead is taken on the innovation row alone
   since 2026-09-12, because it separates the markets at p = 0.012 while the exit row
   reads p = 0.19.

   Usage:
     node scripts/necessity-matrix.mjs            print what the table will draw
     node scripts/necessity-matrix.mjs --write    refresh the snapshot from the estate
     HMM_WORKSPACE=/path/to/hmm-ventures-workspace node scripts/necessity-matrix.mjs */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export const SNAPSHOT = 'data/necessity_matrix.js';
export const MARKETS = ['Australia', 'Japan', 'New Zealand'];
export const CODES = { Australia: 'AU', Japan: 'JP', 'New Zealand': 'NZ' };
export const NEC = ['Power', 'Eat', 'Heal'];

/* Row order in the source tables is Heal, Power, Eat; display order is Power, Eat, Heal.
   Parsing keys by name rather than by position so the two orders cannot be confused. */
const SRC_COLS = ['Heal', 'Power', 'Eat'];
const BASES = [
  ['inn', 'INNOVATION / IP', 'hardware innovations plus IP and patents, enabling deep tech excluded'],
  ['exi', 'EXITS 2000-26', 'companies rather than table rows, window enforced'],
];

export function workspacePath() {
  return process.env.HMM_WORKSPACE || path.join(os.homedir(), 'Work', 'hmm-ventures-workspace');
}
export function sourcePath() {
  return path.join(workspacePath(), 'hmm-ventures', 'Internal', 'Projects', 'Working_Docs',
    'Research_Returns', 'NECESSITY_MATRIX_2026-08-30.md');
}

/* Parses the two count tables. Every row total printed in the source is checked against
   the sum of its own cells, so a hand edit to the report that breaks the arithmetic
   fails here rather than travelling into the snapshot. */
export function readCounts(md) {
  const block = md.split('## Counts behind the index')[1];
  if (!block) throw new Error('source carries no "Counts behind the index" block');
  const body = block.split('## Limits')[0];
  const tables = [...body.matchAll(/\|\s*\|\s*Heal\s*\|\s*Power\s*\|\s*Eat\s*\|\s*n\s*\|\n\|[-| ]+\|\n((?:\|.*\|\n)+)/g)]
    .map(m => m[1]);
  if (tables.length !== BASES.length) {
    throw new Error(`expected ${BASES.length} count tables, found ${tables.length}`);
  }
  const out = {};
  tables.forEach((raw, i) => {
    const per = {};
    for (const line of raw.trim().split('\n')) {
      const cells = line.trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
      const market = cells[0];
      if (!MARKETS.includes(market)) throw new Error(`unknown market row "${market}"`);
      const vals = cells.slice(1, 5).map(v => {
        const n = Number(v.replace(/\*/g, ''));
        if (!Number.isInteger(n)) throw new Error(`non-integer count "${v}" on ${market}`);
        return n;
      });
      const sum = vals[0] + vals[1] + vals[2];
      if (sum !== vals[3]) throw new Error(`${market}: cells sum to ${sum}, row total says ${vals[3]}`);
      per[market] = Object.fromEntries(SRC_COLS.map((k, j) => [k, vals[j]]));
    }
    for (const m of MARKETS) if (!per[m]) throw new Error(`base ${BASES[i][0]} is missing ${m}`);
    out[BASES[i][0]] = per;
  });
  return out;
}

/* The formula, in the one place it is written. */
export function index(counts, market, necessity) {
  const grand = MARKETS.reduce((a, m) => a + NEC.reduce((b, n) => b + counts[m][n], 0), 0);
  const row = NEC.reduce((a, n) => a + counts[market][n], 0);
  const col = MARKETS.reduce((a, m) => a + counts[m][necessity], 0);
  if (!grand || !row || !col) throw new Error(`empty base at ${market} / ${necessity}`);
  return (counts[market][necessity] / col) / (row / grand);
}

export function build(counts) {
  const bases = {};
  for (const [key, label, note] of BASES) {
    const c = counts[key];
    const grand = MARKETS.reduce((a, m) => a + NEC.reduce((b, n) => b + c[m][n], 0), 0);
    const markets = {};
    for (const m of MARKETS) {
      const cells = {};
      for (const n of NEC) cells[n] = { n: c[m][n], idx: Number(index(c, m, n).toFixed(4)) };
      markets[CODES[m]] = { total: NEC.reduce((a, n) => a + c[m][n], 0), cells };
    }
    bases[key] = { label, note, total: grand, markets };
  }
  return bases;
}

function main() {
  const src = sourcePath();
  if (!fs.existsSync(src)) {
    console.error(`FAIL: no source at ${src}`);
    console.error('      set HMM_WORKSPACE to the workspace clone.');
    process.exit(1);
  }
  const counts = readCounts(fs.readFileSync(src, 'utf8'));
  const bases = build(counts);
  for (const [key, label] of BASES) {
    const b = bases[key];
    console.log(`\n${label}   ${b.total} items`);
    console.log(`${''.padEnd(14)}${NEC.map(n => n.padStart(12)).join('')}   base`);
    for (const m of MARKETS) {
      const mk = b.markets[CODES[m]];
      const row = NEC.map(n => `${mk.cells[n].idx.toFixed(1)} (${mk.cells[n].n})`.padStart(12)).join('');
      console.log(`${m.padEnd(14)}${row}   ${String(mk.total).padStart(4)}`);
    }
  }
  if (process.argv.includes('--write')) {
    const snap = {
      _note: 'Written by scripts/necessity-matrix.mjs --write. Never hand-edit. The counts are parsed from NECESSITY_MATRIX_2026-08-30.md in the workspace and every index is derived from them by the formula in that script. check-register-figures.mjs recomputes each index from the counts in this file and fails the deploy when they disagree.',
      _warning: 'The two bases are not independent. Both count items in one catalogue assembled in one pass under one necessity classification, so the exit row agreeing with the innovation row is one source read twice and never corroboration. The lead is taken on the innovation row alone since 2026-09-12: it separates the markets at p = 0.012 on 79 innovations, while the exit row reads p = 0.19 on 115 companies.',
      _public: 'This file sits in the published root and is fetchable by anyone. It carries counts of innovations and of exited companies per market and necessity, which are measured facts about a market. No fund allocation goes in here: positions, capital share and cheque per market are off every public surface under R-D1, and the public wall of 2026-07-25 applies to this file exactly as it applies to a page.',
      source: 'Internal/Projects/Working_Docs/Research_Returns/NECESSITY_MATRIX_2026-08-30.md, corrected 2026-09-12',
      leads: { AU: 'Heal', JP: 'Power', NZ: 'Eat' },
      lead_basis: 'inn',
      bases,
    };
    const body = `/* GENERATED by scripts/necessity-matrix.mjs --write. Do not hand-edit.
   Regenerate after a change to the necessity matrix in the workspace:
     node scripts/necessity-matrix.mjs --write
   scripts/check-register-figures.mjs recomputes every index from the counts below and
   fails the deploy when a derived figure and its own base disagree. */
var NECESSITY_MATRIX = ${JSON.stringify(snap, null, 2)};
if (typeof window !== 'undefined') window.NECESSITY_MATRIX = NECESSITY_MATRIX;
`;
    fs.writeFileSync(SNAPSHOT, body);
    console.log(`\nwrote ${SNAPSHOT}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) main();
