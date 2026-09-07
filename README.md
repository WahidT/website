# hmm.ventures

The public site for **hmm ventures**. A single-scroll thesis page plus a GP bio and a sources page.

Static HTML/CSS/JS. There is no build step: Netlify publishes the repository root as-is
(see `netlify.toml`). Editing any file and pushing to `main` deploys.

## Pages
- `index.html`. The thesis (single scroll)
- `bio.html`. The GP
- `sources.html`. Primary and first-party sources
- `for-llms.html`. Canonical framing for language models, and the misattributions to avoid
- `404.html`. Not found

## Stylesheets
Every page links three files in parallel: `fonts/fonts.css` (the two brand faces as
subsetted WOFF2, plus metric-matched fallbacks), `hmm-tokens.css` (generated from the
design tokens, never hand-edited) and `site.css` (the live site's overrides, edited here).
Page-specific styles are inline in each page. The thesis page's script is `sections.js`,
loaded between `machines.js` and `transitions.js`.

## Checks
All Playwright, all against a local server (`npm run serve`, then in another shell):
- `npm run audit:mobile`. Layout across 320 to 1280px, touch and pointer: overflow, the rail, tap targets
- `npm run check:affordances`. Every `cursor:pointer` responds to a click, and every click handler shows one
- `npm run check:deadcss`. No rule without an element or a reference that can create one
- `npm run check:figures`. The enacted-record figures in the copy match `data/reg_instruments.js`

Two more run without a browser:
- `npm run check:tokens`. The `hmm-tokens.css` banner digest matches the pinned source digest in `package.json` (set `HMM_DESIGN_REPO` to a clone of the design repo to recompute it from `tokens/hmm.tokens.json`)
- `npm run check:csp`. Every `<script>` in every page is external or hashed into the `_headers` policy, which is self-only for scripts

## Search / crawlers
`robots.txt`, `sitemap.xml`, `llms.txt` and per-page canonical tags live at the root.

## Prior site
This repo previously built a 19-route Astro site. That site is preserved and fully
recoverable:
- branch `astro-legacy`
- tag `astro-site-2026-06-16`
