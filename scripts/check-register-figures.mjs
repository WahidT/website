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

   No page prints a register count since 2026-10-21, when the market bars that drew them
   left with their section. The in-force predicate and the operative-year integrity check
   above still run on data/reg_instruments.js, which register.html renders row by row. */

/* ---------------------------------------------------------------------------
   THE TIER-LIQUIDITY FIGURE IS WITHDRAWN (GP, 2026-10-26: "Pull it from the site").

   Until this date this block held the homepage gloss and the for-llms.html tier answer to a canon
   snapshot (data/canon_tier_liquidity.json, written by scripts/canon-figures.mjs). Rebuilt on the
   product's approval pathway, with changes of control as the outcome, the register showed no
   measurable acquisition effect (workspace: Research_Library/Datasets/classifier/
   REBUILD_MEMO_2026-10-26.md). The figure, the snapshot and its writer left the site together.

   A guard whose target is gone must not report clean on nothing, so this block now fails if any
   withdrawn figure, or the sentence shape that carried it, comes back to a served page. Served
   text only: the HTML comments that record the withdrawal are history, not claims.
   --------------------------------------------------------------------------- */
let tierBad = 0;
const home = fs.readFileSync('index.html', 'utf8');
function servedText(html) {
  let s = html;
  for (const tag of ['script', 'style', 'svg', 'noscript']) s = s.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'gi'), ' ');
  return s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;|&#\d+;/gi, ' ').replace(/\s+/g, ' ');
}
const WITHDRAWN = [
  [/\b17\.7\d?\s*%/, 'the hard-approval rate (17.7%)'],
  [/\b6\.0?8\s*%|\b6\.1\s*%\s*(?:where|for|against|with no)/, 'the no-gate rate (6.08% / 6.1%)'],
  [/\b5\.82\s*%/, 'the buyer-obligation rate (5.82%)'],
  [/odds ratio (?:of )?3\.3\d?\b/i, 'the odds ratio (3.33)'],
  [/9\.39e-75/, 'the p-value'],
  [/nearly three times the rate/i, 'the "nearly three times" gloss'],
  [/reach(?:ed)? a liquidity event at/i, 'the tier-liquidity sentence'],
];
console.log('');
for (const page of ['index.html', 'for-llms.html', 'sources.html', 'bio.html', 'japan.html', 'australia.html', 'new-zealand.html', 'ja.html', 'register.html', 'instruments.html', '404.html', 'llms.txt']) {
  const raw = fs.readFileSync(page, 'utf8');
  const text = page.endsWith('.txt') ? raw : servedText(raw);
  const hits = WITHDRAWN.filter(([rx]) => rx.test(text)).map(([, what]) => what);
  if (hits.length) { tierBad += hits.length; console.error(`FAIL  ${page} serves a withdrawn tier-liquidity figure: ${hits.join('; ')}`); }
}
if (fs.existsSync('data/canon_tier_liquidity.json')) { tierBad++; console.error('FAIL  data/canon_tier_liquidity.json is back in the published root'); }
if (/id="regFig"|class="reg-note"/.test(home)) { tierBad++; console.error('FAIL  index.html carries the withdrawn figure block or its footnote'); }
console.log(tierBad ? `\n${tierBad} withdrawn tier-liquidity item(s) served.`
                    : 'ok    the withdrawn tier-liquidity figure appears on no served page, and its snapshot is gone');

/* The per-market strength snapshot (data/market_strength.js) and its block here were removed
   on 2026-10-21 with the section that drew it, "Why Australia, Japan and New Zealand." (GP).
   No page read the snapshot after that, and a guard on an unread file reports clean on
   nothing. */



/* ---------------------------------------------------------------------------
   No catalogue company name on any served page.

   Until 2026-09-15 the sourcing section carried a stream of every named company in
   catalogue.js, and until 2026-09-24 a sentence of counts read from a snapshot of it.
   Both left on the general partner's ruling. The ruling that no company name from the
   catalogue is served stands, so this block greps every served page for the names.
   catalogue.js is loaded by no page and stays in the repository as the owner this reads.
   --------------------------------------------------------------------------- */
let ccBad = 0;
console.log('');
{
  const CC = await import('./catalogue-counts.mjs');
  const names = CC.readCatalogue().flatMap(r => String(r.name).split(',').map(x => x.trim())).filter(n => n.length > 3);
  /* sources.html is a bibliography: a company named there is the issuer or subject of a
     cited source (a regulator's approval notice, a listed company's filing), which is a
     citation and never the catalogue. It is reported, never failed. */
  for (const page of ['index.html', 'bio.html', 'japan.html', 'australia.html', 'new-zealand.html', 'ja.html', 'for-llms.html', 'instruments.html', '404.html', 'llms.txt', 'sources.html', 'register.html']) {
    const text = fs.readFileSync(page, 'utf8').replace(/<script\b[\s\S]*?<\/script>/gi, ' ');
    const hit = names.filter(n => new RegExp('(?<![\\w-])' + n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\w-])').test(text));
    if (!hit.length) continue;
    if (page === 'sources.html') { console.log(`note  sources.html cites ${hit.join(', ')} as the issuer or subject of a source row`); continue; }
    ccBad++; console.error(`FAIL  ${page} serves catalogue names: ${hit.slice(0, 6).join(', ')}${hit.length > 6 ? '...' : ''}`);
  }
  if (!ccBad) console.log('ok    no catalogue company name on any served page');
  if (/src="catalogue/.test(home)) { ccBad++; console.error('FAIL  index.html still loads the catalogue or its stream'); }
}
console.log(ccBad ? `\n${ccBad} problem(s) in the catalogue sweep.`
                  : '\nno catalogued name is served.');

process.exit(tierBad || ccBad ? 1 : 0);
