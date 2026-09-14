# hmm.ventures, the structure as proposed

Written 2026-09-14, before the build, on the general partner's ordered list of eight items. This
file is the proposal and the record of what the build decided; it is a working document and not a
distribution surface, so the prose gate refuses it by design.

Branch `claude/site-rebuild-2026-09-14`, cut from `claude/site-w1-canon-tier-figures-2026-09-13`,
which is website #15's head. One merge sequence deploys without conflict: #14, then #15, then this.
Website merges stay with the general partner, because a merge deploys (R-MERGE, 2026-09-13).

---

## 0. The opener, set by the general partner on 2026-09-14

**The general partner gave the opening prose directly during this build, and it is carried
verbatim.** A direct instruction outranks a recorded ruling, so it is the text on the page, and
what it moves is written here rather than left to drift.

> What if the necessities we take most for granted are the ones changing fastest? Energy, food and
> care reach us through systems designed for another technological era.
>
> Now their physical foundations are being rebuilt. In the power plant, the paddock and the clinic,
> founders are applying advances in intelligence, biology and engineering within markets governed by
> rules that predate those capabilities. Technology enters these markets by earning permission,
> because they are systems society cannot afford to fail.
>
> We lead seed rounds for founders rebuilding how populations are powered, fed and healed.

**It supersedes the R-D24 and R-D25 form in two places.** Both were live rulings of 2026-09-14 and
both are recorded so the estate keeps the reasoning rather than only the outcome.

| Where | R-D24 / R-D25 | The general partner's text | What moved |
|---|---|---|---|
| The concrete noun in the triple | "Energy, food and **medicine**" | "Energy, food and **care**" | R-D25 chose "medicine" on parallelism, three mass nouns of one grade. R-D25's other half is untouched: the system is named **Heal** everywhere a system is named, and it is, on every page |
| The entry condition | "Working gets a technology to the door of these markets. Permission gets it through, because they are systems society cannot afford to fail." | "Technology enters these markets by earning permission, because they are systems society cannot afford to fail." | R-D24 replaced a two-sentence reframe with a forward sequence. This is the single forward sentence, which settles OR-4a in the other direction: one sentence, no denial, and the cross-sentence reframe does not arise |

**It clears all eight rules of `LANGUAGE.md` 7.3**, checked one at a time: the question re-ranks a
belief the reader already holds rather than introducing a doubt; no regulator appears as an actor;
the three places run one per system in the system's order; the fund arrives last, once, as the
subject of one sentence carrying the construction; no figure, market name or adjective of scale
appears; every sentence takes a verb; the rhythm is the mechanism's length; and the chain runs its
six links. It also clears both R-D26 patterns at build.

⚠ **What is owed.** `14_NARRATIVE_INTRO_2026-09-14.md` and `LANGUAGE.md` 7.3 still carry the
R-D24 and R-D25 form as the standard for the deck's first sheet. This branch changes the site
only. If the general partner wants one text across both surfaces, the intro file and 7.3 move to
this wording, and that is a ruling in `hmm-prose`, never a site edit.

---

## 0b. The second round of GP feedback, 2026-09-14

Five instructions, each answered, and two of them changed the structure above.

| # | Instruction | What changed |
|---|---|---|
| A | "07 The screen ... needs to be visualised" | The four lead paragraphs and the five-row filter table became one shrinking bar: ten fixed market columns, one row per filter, bar width being the count still standing. Standing reads 10, 8, 5, 3, 3, 3 and the live cells equal the printed count on every row. **The section went 710 words of prose to 71** |
| B | "We have way too much prose" | **index.html static prose 2,370 to 1,317 words, a 44% cut**, on 38 merged edits from three independent passes, every one verified byte-exact before it was applied. Rendered prose 2,639 to 1,622. Prose runs 153 words per screen at worst |
| C | "the strength chart should be the things being assessed not three necessities per corner" | Nine bars: instruments in force, instruments operative since 2020, listing share of winner exits. Three markets to a group, one scale and one printed denominator per group. **The form is arithmetic rather than taste**: two quantities are counts and the third is a percentage, so a radar would compute an area across a count and a share, and that area means nothing. The five stacked visual languages per panel are gone |
| D | "Rewrite and be punchier" | The sourcing question is 9 words from 17: "How do we reach these founders before a round exists?" |
| E | "You elaborated too much use my simpler prose" | The fit is the GP's three paragraphs alone, 95 words from 179. The two paragraphs after the opener were mine and are cut; the permission mechanism they carried is section 06's whole subject |

### One dot system, one physics engine, one interactivity

`radars.js` ran its own canvas flock with its own frame loop, sizing and hover handling, so the
market charts were **the one dotted surface on the site that did not breathe with the rest** and
did not answer a click the way the machines do. The dots are now SVG circles handed to
`window.hmmAnimateDots`, the same engine `machines.js` drives the hero blow-outs and the necessity
schematics with. Confirmed moving on that engine in the browser: a sampled dot's position, radius
and opacity all change once the figure enters view. The file went 688 lines to 298 and its CSS
22.6KB to 2.8KB. `morph.js` samples the bar dots now, because the selectors it sampled are gone.

### How the two drawings were chosen

A design panel ran three approaches per drawing, scored on legibility, one visual language,
datum-in-geometry, house compliance and prose economy. The elimination bar won the screen against
a thread-and-plate sieve. **A two-axis field lost on its own terms and was ruled out separately**,
because it would have needed invented positions for six of the ten markets, and only four of the
ten have an owned output-per-dollar figure. Two grafts from the losers were taken: the register
figure reads the counted block in `data/market_strength.js` rather than re-deriving the in-force
predicate inline, which is one arithmetic across three surfaces, and ink roles read `--hmm-text`
rather than `--hmm-pearl`, which does not rebind on a light ground.

**The specialisation index is still consciously kept**, now as one table below the chart rather than
three tables inside three panels. It is a different quantity on a different denominator, so putting
it on the chart's axes would reinstate what C removed.

### Two faults of my own, both caught by the checks

**I deleted the radar CSS as a byte range and took the section 06 register timeline and the
regulation split layout with it.** Restored from git, then redone by selector after enumerating the
set, which is what the plan-first gate asks for and what I skipped. Enumerating surfaced two shared
rules where only the radar half was dead, and one of them gave the timeline filter buttons their
44px touch target. Splitting rather than sweeping kept it.

**The chart's group labels were left focusable with nothing to offer**, which `check:affordances`
failed correctly. The read-out table carries every figure and denominator as text, so the focus
handling was vestigial and went.

---

## 1. The question this file has to put back to the general partner

**The opening item reads "GoodFit", and that word has two readings.** The build takes the first and
records the second here, because the estate resolves it rather than leaving it open.

**The reading taken: the fund's fit.** What hmm backs, and why it is the right buyer of that risk.

**The evidence for it, and the whole of it.** The general partner's own list puts the GoodFit role
on the bio page at item 8, dated 2022 to 2026 as on #13 and #14. Two items cannot both own it, so
item 1 is the other reading. Item 1 also instructs that the page opens on the ruled opener text
from `14_NARRATIVE_INTRO_2026-09-14.md` verbatim, and that text is a frame carrying no actor and no
company. `LANGUAGE.md` 7.3.4 puts the fund last, once, as the subject of one sentence, and 7.3.5
bans a figure, a market name and an adjective of scale from the same passage; an operating history
opening the page breaches both. Section 7.2 sets the clearance test for a public page: it passes if
it would still be worth publishing in a world where the fund did not exist. A prior employer's
history fails that test and the fund's fit passes it.

**The alternative, offered for the general partner to rule on this pull request.** If the intended
opening is GoodFit the company, the opening section becomes the mechanism the role taught: a data
platform built to identify companies before they enter a sales pipeline is the same problem as
reaching a founder before a first round, which is how the memorandum's section 12 states it. That
passage exists in house form already and sits on the bio page in this build. Moving it to the
homepage lead costs the ruled opener its position, because the two cannot both be first.

---

## 2. The eight items, at page level

### Homepage, `index.html`, seven sections in the general partner's order

| # | Section | What a reader does with it | Words | Figures, and who owns each |
|---|---|---|---:|---|
| 1 | **The fit** | Decides whether the rest of the page is about anything they care about | 95 | None. 7.3.5 bans them here |
| 2 | **Power, Eat, Heal** | Learns what the three systems are, from nothing, and what each sells by | 3 x 120 | The unit per system, lifted from memorandum section 3 |
| 3 | **The capability, and the permission** | Learns why now, and that the approval is the asset rather than the obstacle | 230 | The FDA series (R-D27), two papers named |
| 4 | **Density against capital** | Sees the filter that cuts the two largest venture markets in the world | 180 | 1.09 and 0.16 per USD 1B, Side Stage with Dealroom June 2026; WIPO 2025 ranks |
| 5 | **The rest of the screen** | Sees the other four filters in the memorandum's order, Europe as a bloc | 220 | PIC/S 57 and Jordan; the instrument count from the register |
| 6 | **The three markets** | Reads one strength chart per market off estate data | 210 | Register by market, listing share by market, specialisation index |
| 7 | **The first conversation** | Knows the single thing being asked of them | 70 | None |

Section 3's register block keeps the enacted-record timeline it already carries, re-struck under
R-D29. Section 6 keeps the specialisation matrix, which is owned; what leaves it is named in part 4
below.

**One section is not on the general partner's list, and this is where it went.** The live site's
sourcing block, three moves headed "How we find them", sits between the markets and the close. The
list names seven homepage items and the sourcing block is none of them, so it was placed rather
than assumed: the close asks for a research conversation, and a research conversation is what
mapping a market before a round exists produces, so the block is the premise of the ask that
follows it. Moving it earlier would separate the two. **If the general partner wants it out, the
close still stands on its own.**

### The bio page, `bio.html`, item 8

Moved out of the homepage flow, which it already was. What changes on it:

- **The loss-adjusting origin arrives.** R-D5 keeps that opener on the memorandum's page one, and
  the general partner's instruction places it on the bio page for the site. It is the only passage
  in the estate that says why this manager ranks these three systems and not another three.
- **GoodFit reads 2022 to 2026**, as on #13 and #14, and the departure is stated: the memorandum
  records the general partner leaving to work on hmm full time, and the live page still describes
  the role in the present tense.
- **"We" for the fund, the general partner in the third person.** GP 2026-09-03.
- **No retired jurisdiction.** The sweep in part 5 is the check, and it runs over served text.

---

## 3. The emerging-manager template, and what this site does instead

**The measured record is why this section exists.** `08_EMERGING_MANAGER_EVIDENCE.md` reports that
the debut funds closing fast are spin-outs with institutional lineage, that 73% of surveyed
emerging managers left an existing venture firm, that the solo funds which scaled are media brands
or spin-outs, and that every named debut in Australia, Japan and New Zealand across 2024 to 2026
closed on a state programme, a fund-of-funds anchor, a corporate limited partner or a named family
syndicate. This general partner's background is loss adjusting, a merchant-of-record payments
business, an accelerator-to-fund sourcing rebuild and a revenue function at a data platform. **None
of those is a venture spin-out or a media brand, so the measured record carries no precedent for
this debut.** A site built to the template competes on the axis the record says decides it, and
loses on that axis by construction.

**So the difference is structural, meaning it is what is on the page.** "We are different" is
banned and appears nowhere.

| Step | What the template does | What this site does instead |
|---|---|---|
| The lead | Names the firm, the stage and the cheque in the first line | Opens on a question that re-ranks a belief the reader already holds, then runs a six-link causal chain. The fund arrives last, in one sentence |
| Why now | Asserts a macro trend and dates it loosely | Counts enforceable instruments by the operative date of the obligation, computed from sourced statutory tables by a script, with the dating rule stated on the page |
| The team | A team slide with photographs and prior logos, placed early | One page, reached from the footer, carrying a dated record and the mechanism each role taught. No logo wall, because no portfolio exists and naming founders backed is ruled off every external surface |
| The track record | Prior deals, marks, a net multiple | None. The evidence offered is a register finding a reader can re-derive: an exit rate measured across the three markets on a population the page names |
| The market | A market-size number and a bottom-up build | An absence test that ranks systems by what their failure costs, and a filter set that cuts the two largest venture markets in the world on output against the capital already bidding |
| The edge | "Proprietary network", "differentiated access" | Three sourcing moves with the mechanism written out, and the exit route stated as differing by market including where it constrains |
| The risk | A risks slide that answers objections before they arrive | The costs stated forward inside the sentences that carry the claims. Content whose only job is to meet an objection is out (GP 2026-09-02) |
| The ask | A data-room link, a deck download, "let's talk about the fund" | A research conversation, and nothing else. Outreach is cold and the first meeting is a research conversation |

---

## 4. Every figure on the page, and the owner it reads from

**The rule: a figure reads from the estate through a script or a guarded snapshot, never typed.
Where a figure has no owner, the sentence stands without it.**

| Figure | Owner | How the page gets it | Guard |
|---|---|---|---|
| Register total, per-market split, since-2020, scheduled | `data/reg_instruments.js`, matching `count_reg_dates.py` | Sentence checked against the data file | `check-register-figures.mjs` |
| Tier rates, odds ratio, p-value | canon `current.tier_liquidity` | `canon-figures.mjs` copies canon verbatim to `data/canon_tier_liquidity.json`; the page is parsed against it | `check-register-figures.mjs` |
| Listing share by market | canon `current.listing_prob` | `market-strength.mjs` copies canon verbatim to `data/market_strength.json` | `check-register-figures.mjs` |
| Specialisation index | `AU_NZ_JP_innovation_exit_catalogue_2026-08-10.md` | Held in `radars.js` with its p-values and its 2026-09-12 correction | None; it is a fixed research output |
| 1.09 unicorns, 0.16 decacorns per USD 1B | Side Stage Ventures with Dealroom, June 2026 | Typed with the edition named, as an external publication | Sources page row |
| WIPO 2025 ranks, 18th inputs and 30th outputs | WIPO Global Innovation Index 2025 | Typed with the edition named | Sources page row |
| FDA series, six a year before 2016 and 331 in 2025 | Singh 2025 and Golshani and Joseph 2026 | Typed with both papers named, never the FDA list page | Sources page rows |

**What has no owner and therefore leaves the page.** The radar's six 0-to-10 axes. Its own caption
declares four of them "assessed from market structure", which is a judgement with no file behind it,
and the site rule is that a figure reads from the estate or the sentence stands without it. The two
axes the caption calls measured are the same two facts the new chart reads from canon and the
register, so nothing measured is lost. **The specialisation matrix is kept**, because it is owned,
carries its p-values and states which of its two rows the lead is taken on.

**The instrument machines are kept** and stay where they are: three drawings on `instruments.html`,
a review harness whose own banner marks its placement unsettled, plus the three necessity machines
in the homepage hero. The dot motion is unchanged, because it is the core identity and the rule is
to keep it smooth and legible rather than to extend it.

---

## 5. What the build must prove, and the command that proves it

| Standard | Instrument |
|---|---|
| Voice and tells, per page | `IM_2026-08-31/gate.py` on a text dump of served prose |
| The two lexical patterns of R-D26 | `scripts/check-opener-patterns.mjs`, new, in the Netlify build |
| No retired figure on any served page | Every `retired` pattern in `canon.json`, run through the canon guard's own matcher |
| No Singapore, no GCC, no retired jurisdiction | The same sweep, plus a direct grep |
| Figures match their owners | `check-register-figures.mjs`, extended |
| Colour from tokens only | `check:tokens`, and no literal in any new code |
| Build integrity | `node --check`, `check:csp`, `check:machines` |
| Scope and compliance | `safety-officer` on every page |
| Template break | `hmm-circuit-breaker` on the built pages |

---

## 6. Record: what leaves the repository on this branch

| Row | File | Why |
|---|---|---|
| Safeguard Mechanism (Crediting) Amendment Act 2023 | `data/reg_instruments.js` | R-D29. An emissions-accounting instrument leads the regulation clock, which the carbon-accounting ban forbids |
| Climate Change Response Act 2002 Part 4, the NZ emissions trading scheme | `data/reg_instruments.js` | R-D29, same mechanism |
| GCC centralized registration procedure | `data/reg_instruments.js`, the legend, the filter list, the sources page | R-D29. The Gulf is a hard geography ban and a register row is a surface |
| MENA venture data, MAGNiTT | `sources.html` | Not named by R-D29. It supports "GCC LP-capital context", and GCC is a hard LP-geography ban (GP 2026-08-27) |
| The radar's six assessed axes | `radars.js` | Four had no owner. Part 4 above |

The two emissions rows are held verbatim at
`hmm-ventures/Archive/2026-09-14_emissions_instruments_out_of_count/`. The GCC row as it stood:

```
{c:"GCC",name:"GCC centralized registration procedure",body:"GCC-DR",date:"standing",
 yr:2019,type:"enforceable",status:"effective",global:true},
```
