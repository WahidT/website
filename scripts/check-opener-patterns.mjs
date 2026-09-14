/* The two lexical patterns of R-D26 (2026-09-14), run over the served text of every page.

   WHY ONLY TWO. LANGUAGE.md 7.3 carries eight rules for a broadcast opener, and six of them
   are judgement: whether a question re-ranks a belief rather than introducing a doubt, whether
   a triple of places is exhaustive and ordered, whether a closing sentence carries a fact. A
   check cannot read any of those, and the estate's standing disposition is that a check firing
   on a line the general partner has already ruled fine stops being read. That is why aphoristic
   closers were kept off the memorandum's gate rather than tuned onto it.

   So R-D26 put exactly two patterns on this site's guard, and picked them on one test: a
   lexical pattern that never fires on a ruled line can run at build.

     1. THE REGULATOR AS A CHARACTER.  Regulation appears as a rule, a permission or a relation
        between dates. It never appears as an actor who is ready, unready, slow, behind or
        catching up. Both forms carry the same fact; the actor form states it as a judgement of
        an institution's competence, which anyone who works in one will contest, so it hands the
        reader an argument instead of a frame. It also tells an allocator the fund's companies
        have a problem, when the house position is that the permission is the asset. The live
        site carried this exact form until this branch: "Regulators who are not ready for the
        next wave of innovation brought by physical AI and World Models."

     2. A FIRST-PERSON OR POINTER CLOSE.  A sentence that only points backwards at the paragraph
        above carries no fact of its own, and the disposition on finding one is the same at both
        ends of a document: delete the pointer, and let the sentence that replaces it carry the
        fact. "That's what I'm investing in" fails twice over, because it also makes the general
        partner the subject where the house rule is "we", never "I".

   Neither pattern fires on the opener the general partner set for this surface on 2026-09-14,
   which is the test R-D26 set for putting a pattern here at all.

   Usage: node scripts/check-opener-patterns.mjs [file...]   (exit 1 on any hit) */
import fs from 'node:fs';

const DEFAULT_FILES = ['index.html', 'bio.html', 'for-llms.html', 'sources.html', 'instruments.html'];

/* Served text, not source. An attribute value, a class name or an SVG path is not prose, and a
   guard that reads them reports on things no reader can see. */
function served(html) {
  let s = html;
  for (const tag of ['script', 'style', 'svg', 'noscript']) {
    s = s.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'gi'), ' ');
  }
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  s = s.replace(/<[^>]+>/g, ' ');
  s = s.replace(/&[a-z]+;|&#\d+;/gi, ' ');
  return s.replace(/\s+/g, ' ');
}

/* ⚠ THE PATTERN IS PREDICATIVE, AND IT WAS NARROWED ON A FALSE POSITIVE.

   The first version matched a regulator noun within a few words of any of these words in
   either direction, which is how R-D26 words it. Run over the site it fired on
   "the regulator's timeline or the accumulated evidence behind an existing approval",
   where "behind" is a preposition and the sentence is sound. A check that flags a line a
   human has already ruled fine stops being read, which is the whole reason six of the
   eight rules in 7.3 were kept off this guard. So the pattern now requires the actor word
   to sit in a PREDICATE about the regulator: a linking verb between the two, or a
   participle directly after it. "Regulators who are not ready" is caught, "the evidence
   behind an approval" is not, and "an acquirer re-enters the review queue behind everyone
   already in it" is not either. */
const ACTOR_WORDS = 'ready|unready|prepared|unprepared|slow|slower|sluggish|behind|lagging|laggard|asleep|failing|unable|overwhelmed|outpaced|outrun';
const LINK = "is|are|was|were|isn't|aren't|wasn't|weren't|seems?|remains?|stays?|gets?|looks?|feels?|proves?|appears?|becomes?|been|being";
const REG = "regulators?|regulatory bodies|regulating bodies|regulatory authorit(?:y|ies)";
const PARTICIPLE = 'lagging|falling behind|catching up|struggling|scrambling|playing catch';

const PATTERNS = [
  {
    name: 'regulator as an actor',
    re: new RegExp(
      // a linking verb between the regulator and the judgement
      `(?:${REG})\\b[^.;]{0,40}?\\b(?:${LINK})\\b[^.;]{0,24}?\\b(?:${ACTOR_WORDS})\\b`
      // or a participle sitting directly on it
      + `|(?:${REG})\\b(?:\\s+\\w+){0,2}\\s+(?:${PARTICIPLE})\\b`
      // or the judgement first, with its own copula, and the regulator as the subject after
      + `|\\b(?:${ACTOR_WORDS})\\b[^.;]{0,24}?\\b(?:${LINK})\\b[^.;]{0,24}?\\b(?:${REG})\\b`
      /* or the judgement fronted as a participial phrase with no copula at all, which is the
         form that escaped the first break test: "Not ready for any of this, the regulator
         writes the rule late." The comma is what marks the fronting, and requiring it keeps
         this alternative off every sound sentence in the pass corpus. */
      + `|\\b(?:not|never|un)\\s*(?:${ACTOR_WORDS})\\b[^.;]{0,60}?,\\s*(?:the\\s+|a\\s+|no\\s+)?(?:${REG})\\b`,
      'gi'),
    fix: 'State the fact as a rule, a permission or a relation between dates. "markets governed by rules that predate those capabilities" carries the same fact and nobody argues with it.',
  },
  {
    name: 'first-person or pointer close',
    re: /\b(?:that(?:'s|\u2019s| is) what (?:i|we)\b|that(?:'s|\u2019s| is) what i(?:'m|\u2019m| am)\b|this is what (?:i|we) (?:invest|back|do)\b|that(?:'s|\u2019s| is) the fund\b)/gi,
    fix: 'Delete the pointer and let the replacement sentence carry the fact. The ruled close is "We lead seed rounds for founders rebuilding how populations are powered, fed and healed."',
  },
];

const files = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_FILES;
let hits = 0;

for (const f of files) {
  if (!fs.existsSync(f)) {
    console.error(`FAIL  ${f} does not exist`);
    hits++;
    continue;
  }
  const text = served(fs.readFileSync(f, 'utf8'));
  let fileHits = 0;
  for (const pat of PATTERNS) {
    pat.re.lastIndex = 0;
    let m;
    while ((m = pat.re.exec(text)) !== null) {
      fileHits++;
      hits++;
      const lo = Math.max(0, m.index - 60);
      const hi = Math.min(text.length, m.index + m[0].length + 60);
      console.error(`FAIL  ${f}  ${pat.name}`);
      console.error(`      ...${text.slice(lo, hi).trim()}...`);
      console.error(`      ${pat.fix}`);
      if (m[0].length === 0) pat.re.lastIndex++;
    }
  }
  if (!fileHits) console.log(`ok    ${f.padEnd(18)} neither R-D26 pattern fires`);
}

console.log(hits
  ? `\n${hits} R-D26 pattern hit(s). Regulation is a mechanism and never an antagonist; a close carries a fact and never a pointer.`
  : `\nneither R-D26 pattern fires on any served page.`);
process.exit(hits ? 1 : 0);
