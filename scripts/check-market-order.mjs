/* Market order: Japan, Australia, New Zealand, on every surface (GP 2026-10-26).

   Reads the served text of every page (no scripts, styles, SVG or comments) and the source of
   llms.txt and the register data, splits it into sentences, and fails on any sentence that names
   two of the three markets with Japan not first or New Zealand before Australia. Codes count as
   names (JP, AU, NZ), so a filter row or a jurisdiction cell is held to the same order.

   ONE EXCEPTION, BY NAME: the biography's life order ("He grew up between New Zealand, Australia
   and Saudi Arabia ..."), which is a person's history, not a market list. Add an exception only
   with the GP's ruling and its date beside it.

   Usage: node scripts/check-market-order.mjs        (exit 1 on any hit) */
import fs from 'node:fs';

const PAGES = ['index.html', 'bio.html', 'japan.html', 'australia.html', 'new-zealand.html', 'ja.html', 'for-llms.html', 'sources.html', 'register.html', 'instruments.html', '404.html'];
const RAW = ['llms.txt', 'register.js'];
const EXCEPTIONS = [/He grew up between New Zealand, Australia and Saudi Arabia/];   // GP spec v1.1, 2026-10-26: biography life order

function served(html) {
  let s = html;
  for (const tag of ['script', 'style', 'svg', 'noscript']) s = s.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'gi'), ' ');
  /* Each pre-2020 chip on the register is one instrument, a unit of its own like a table cell, so
     it is split here. The chips run in date order (New Zealand's 1981 Act before Australia's 1988
     Act), which is a timeline and names no market list. Read as one run-on sentence they failed
     this check once register.html carried them as static markup (2026-10-30). */
  s = s.replace(/<span class="tl-stand-item/g, ' . $&');
  s = s.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<\/(td|th|li|p|div|h\d)>/gi, ' . ').replace(/<[^>]+>/g, ' ');
  return s.replace(/&[a-z]+;|&#\d+;/gi, ' ').replace(/\s+/g, ' ');
}
const RX = { JP: /\b(Japan(?:ese)?|JP)\b/, AU: /\b(Australian?|AU)\b/, NZ: /\b(New Zealand|NZ)\b/ };
const RANK = { JP: 0, AU: 1, NZ: 2 };

let hits = 0;
function scan(file, text) {
  for (const sent of text.split(/(?<=[.;!?])\s+|\n/)) {
    if (EXCEPTIONS.some(rx => rx.test(sent))) continue;
    const at = Object.entries(RX).map(([k, rx]) => { const m = sent.match(rx); return m ? [k, m.index] : null; }).filter(Boolean);
    if (at.length < 2) continue;
    const order = at.sort((a, b) => a[1] - b[1]).map(([k]) => RANK[k]);
    if (order.some((v, i) => i && v < order[i - 1])) {
      hits++;
      console.error(`FAIL  ${file}: ${sent.trim().slice(0, 160)}`);
    }
  }
}
for (const f of PAGES) scan(f, served(fs.readFileSync(f, 'utf8')));
for (const f of RAW) scan(f, fs.readFileSync(f, 'utf8'));

console.log(hits ? `\n${hits} sentence(s) out of market order. The order is Japan, Australia, New Zealand.`
                 : 'market order: Japan, Australia, New Zealand on every surface.');
process.exit(hits ? 1 : 0);
