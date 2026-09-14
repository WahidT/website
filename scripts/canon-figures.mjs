/* Reads the tier-liquidity figures out of the estate's canon file and prints them,
   so no figure on this site is ever typed by hand.

   Why a snapshot exists. The canon file lives in the estate at ~/.claude/canon/canon.json
   and is not in this repository, so the Netlify build cannot read it. Without a copy in
   the tree the deploy guard could only check the page against itself, which catches
   nothing. So this script writes data/canon_tier_liquidity.json: the canon entry copied
   verbatim, with the engine fingerprint and the compile date beside it. The guard in
   check-register-figures.mjs reads the snapshot on every build, and re-checks the
   snapshot against live canon whenever the estate file is reachable, which is how a
   recompile of canon is caught rather than silently outrun by the site.

   The figures are parsed out of the canon string rather than restated, because a
   restatement is a hand-entered figure wearing a script's clothes.

   Usage:
     node scripts/canon-figures.mjs            print the figures
     node scripts/canon-figures.mjs --write     refresh the snapshot from live canon
     HMM_CANON=/path/to/canon.json node scripts/canon-figures.mjs   read canon elsewhere */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const SNAPSHOT = 'data/canon_tier_liquidity.json';

export function canonPath() {
  const candidates = [
    process.env.HMM_CANON,
    path.join(os.homedir(), '.claude/canon/canon.json'),
    path.join(os.homedir(), 'Work/hmm-ventures-workspace/brain/canon/canon.json'),
  ].filter(Boolean);
  return candidates.find(p => fs.existsSync(p)) || null;
}

/* Pulls every figure the site prints out of the canon sentence. Each pattern is
   anchored on the canon wording, so a canon rewording fails loudly here instead of
   yielding a wrong number quietly. */
export function parseTierLiquidity(s) {
  const grab = (re, name) => {
    const m = s.match(re);
    if (!m) throw new Error(`canon tier_liquidity no longer states ${name}; the pattern in scripts/canon-figures.mjs needs updating`);
    return m[1];
  };
  return {
    hardApprovalPct: grab(/Hard approval ([\d.]+)%/, 'the hard-approval rate'),
    buyerObligationPct: grab(/Buyer obligation ([\d.]+)%/, 'the buyer-obligation rate'),
    noGatePct: grab(/No gate ([\d.]+)%/, 'the no-gate rate'),
    blendedPct: grab(/blended ([\d.]+)%/, 'the blended rate'),
    registerCount: grab(/on ([\d,]+) companies/, 'the register count'),
    oddsRatio: grab(/Odds ratio ([\d.]+)/, 'the odds ratio'),
    yatesP: grab(/Yates chi-square p = (\d+(?:\.\d+)?(?:e[+-]?\d+)?)/, 'the Yates p-value'),
    fisherP: grab(/Fisher exact p = (\d+(?:\.\d+)?(?:e[+-]?\d+)?)/, 'the Fisher p-value'),
  };
}

export function readLiveCanon() {
  const p = canonPath();
  if (!p) return null;
  const canon = JSON.parse(fs.readFileSync(p, 'utf8'));
  return {
    path: p,
    compiled: canon.compiled,
    tier_liquidity: canon.current.tier_liquidity,
  };
}

export function readSnapshot() {
  return JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
}

const isMain = process.argv[1] && process.argv[1].endsWith('canon-figures.mjs');
if (isMain) {
  const live = readLiveCanon();
  if (!live) {
    console.error('FAIL: canon.json was not found. Set HMM_CANON to its path.');
    process.exit(1);
  }
  const f = parseTierLiquidity(live.tier_liquidity);
  console.log(`canon      ${live.path}`);
  console.log(`compiled   ${live.compiled}`);
  console.log('');
  for (const [k, v] of Object.entries(f)) console.log(`${k.padEnd(20)} ${v}`);

  if (process.argv.includes('--write')) {
    const snap = {
      _note: 'Copied verbatim from canon current.tier_liquidity by scripts/canon-figures.mjs --write. Never hand-edit. The site figures are parsed out of this string, not restated.',
      _public: 'This file sits in the published root and is fetchable by anyone. It carries the register measurement the site already prints and nothing else. No fund term, position count, geographic split or engine identifier goes in here: the public wall of 2026-07-25 applies to this file exactly as it applies to a page.',
      compiled: live.compiled,
      tier_liquidity: live.tier_liquidity,
    };
    fs.writeFileSync(SNAPSHOT, JSON.stringify(snap, null, 2) + '\n');
    console.log(`\nwrote ${SNAPSHOT}`);
  }
}
