/* Content-Security-Policy inline-script guard. The policy in _headers allows
   script-src 'self' and nothing else since 2026-09-07, when the 27 KB of inline
   page script moved to sections.js. Any inline <script> that returns would be
   silently blocked in production and work on a local http.server, which sends no
   headers at all, so the failure would be invisible until deploy.

   This script finds every executable inline <script> in every HTML file at the
   root (a JSON-LD block is data, the browser never runs it, and CSP does not
   apply to it), prints the 'sha256-...' source expression the policy would need
   for each, and with --check exits 1 unless every one of those hashes is already
   in the _headers script-src and 'unsafe-inline' is absent from it.

   Usage: node scripts/csp-hashes.mjs            list inline scripts and hashes
          node scripts/csp-hashes.mjs --check    exit 1 unless _headers covers them */
import fs from 'node:fs';
import { createHash } from 'node:crypto';

const EXECUTABLE_TYPES = new Set(['', 'text/javascript', 'application/javascript', 'module']);
const html = fs.readdirSync('.').filter(f => f.endsWith('.html')).sort();

const found = [];
for (const file of html) {
  const text = fs.readFileSync(file, 'utf8');
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(text))) {
    const attrs = m[1];
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const type = ((attrs.match(/\btype\s*=\s*["']?([^"'\s>]*)/i) || [])[1] || '').toLowerCase();
    if (!EXECUTABLE_TYPES.has(type)) continue;
    const line = text.slice(0, m.index).split('\n').length;
    const hash = createHash('sha256').update(m[2], 'utf8').digest('base64');
    found.push({ file, line, bytes: Buffer.byteLength(m[2]), expr: `'sha256-${hash}'` });
  }
}

for (const f of found) console.log(`${f.file}:${f.line}  ${f.bytes} bytes  ${f.expr}`);
if (!found.length) console.log(`no executable inline <script> in ${html.length} HTML files (${html.join(', ')})`);

if (!process.argv.includes('--check')) process.exit(0);

const headers = fs.readFileSync('_headers', 'utf8');
const csp = (headers.match(/Content-Security-Policy:\s*([^\n]*)/) || [])[1] || '';
const scriptSrc = (csp.match(/(?:^|;)\s*script-src\s+([^;]*)/) || [])[1] || '';
let bad = 0;
const line = (ok, s) => { if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'}  ${s}`); };
line(!!scriptSrc, `_headers declares a script-src (${scriptSrc.trim() || 'missing'})`);
line(!/'unsafe-inline'/.test(scriptSrc), `script-src carries no 'unsafe-inline'`);
for (const f of found) line(scriptSrc.includes(f.expr), `${f.file}:${f.line} is hashed into script-src`);
console.log(bad ? `\n${bad} check(s) failed: move the script to a file, or add its hash to script-src in _headers.`
                : '\nevery <script> is external or hashed, and script-src is self-only.');
process.exit(bad ? 1 : 0);
