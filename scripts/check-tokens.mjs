/* Token freshness guard. hmm-tokens.css is generated from the design repo's
   hmm.tokens.json by its build_tokens.py, and this site holds a copy. A copy
   nothing checks drifts: on 2026-09-05 the site stood at 204 tokens and digest
   9cc0b1e1ecbba8fe while the source stood at 206, missing hmm-ink and
   hmm-c08-ink, and nothing said so.

   Two modes, one exit code:
     default              the banner digest in hmm-tokens.css must equal
                          package.json -> hmm.TOKENS_SOURCE_DIGEST, which is
                          bumped by hand when the CSS is regenerated
     HMM_DESIGN_REPO=...  additionally recompute the digest from
                          $HMM_DESIGN_REPO/tokens/hmm.tokens.json with the
                          generator's own algorithm (hash the VALUES, not the
                          file: a reformat of the JSON is not a change) and
                          require all three to agree

   Usage: node scripts/check-tokens.mjs        (exit 1 on drift) */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const css = fs.readFileSync('hmm-tokens.css', 'utf8');
const m = css.match(/Tokens:\s*(\d+)\s+Source digest:\s*([0-9a-f]{16})/);
if (!m) {
  console.error('FAIL: hmm-tokens.css carries no "Tokens: N   Source digest: X" banner.');
  process.exit(1);
}
const banner = { tokens: +m[1], digest: m[2] };
/* Distinct names: the light theme rebinds seventeen roles at three scopes, and those are
   the same tokens again, not new ones. */
const declared = new Set((css.replace(/\/\*[\s\S]*?\*\//g, '').match(/--hmm-[\w-]+(?=\s*:)/g) || [])).size;

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const pinned = pkg.hmm && pkg.hmm.TOKENS_SOURCE_DIGEST;

/* Python's json.dumps(..., sort_keys=True) with default separators and
   ensure_ascii, reproduced so the digest matches build_tokens.py exactly. */
const pyStr = s => '"' + Array.from(s).map(ch => {
  const c = ch.codePointAt(0);
  if (ch === '"') return '\\"';
  if (ch === '\\') return '\\\\';
  if (ch === '\n') return '\\n';
  if (ch === '\r') return '\\r';
  if (ch === '\t') return '\\t';
  if (ch === '\b') return '\\b';
  if (ch === '\f') return '\\f';
  if (c < 0x20 || c > 0x7e) {
    if (c > 0xffff) {
      const v = c - 0x10000;
      return '\\u' + (0xd800 + (v >> 10)).toString(16).padStart(4, '0')
           + '\\u' + (0xdc00 + (v & 0x3ff)).toString(16).padStart(4, '0');
    }
    return '\\u' + c.toString(16).padStart(4, '0');
  }
  return ch;
}).join('') + '"';
const pyDump = v => Array.isArray(v) ? '[' + v.map(pyDump).join(', ') + ']'
                  : typeof v === 'string' ? pyStr(v) : JSON.stringify(v);
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
function sourceDigest(doc) {
  const flat = [];
  for (const g of doc.groups) for (const t of g.tokens) flat.push([t.name, t.value]);
  flat.sort((a, b) => cmp(a[0], b[0]) || cmp(a[1], b[1]));
  const payload = pyDump([...flat, doc.preamble_css]);
  return { digest: createHash('sha256').update(payload, 'utf8').digest('hex').slice(0, 16), tokens: flat.length };
}

let bad = 0;
const line = (ok, s) => { if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'}  ${s}`); };
line(banner.tokens === declared, `banner says ${banner.tokens} tokens, file declares ${declared}`);
line(!!pinned, `package.json pins hmm.TOKENS_SOURCE_DIGEST (${pinned || 'missing'})`);
line(pinned === banner.digest, `banner digest ${banner.digest}, pinned ${pinned}`);

const repo = process.env.HMM_DESIGN_REPO;
if (repo) {
  const src = path.join(repo, 'tokens', 'hmm.tokens.json');
  const doc = JSON.parse(fs.readFileSync(src, 'utf8'));
  const s = sourceDigest(doc);
  line(s.digest === banner.digest, `source ${src}: digest ${s.digest}, banner ${banner.digest}`);
  line(s.tokens === banner.tokens, `source declares ${s.tokens} tokens, banner ${banner.tokens}`);
} else {
  console.log('      (set HMM_DESIGN_REPO=<path to hmm-design clone> to also recompute the digest from the source JSON)');
}
console.log(bad ? `\n${bad} check(s) failed: regenerate hmm-tokens.css from the design repo and bump TOKENS_SOURCE_DIGEST.`
                : '\nhmm-tokens.css matches the pinned source digest.');
process.exit(bad ? 1 : 0);
