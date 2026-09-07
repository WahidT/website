# Regulation map (staged, unreviewed)

This folder is the regulation map from `Hmm-Ventures/regulation-map`, staged on the site under `/regulation/` by GP ruling 2026-09-07 that the map deploys from this Netlify site. It is deploy-safe and deliberately undiscoverable: both pages carry `noindex,nofollow`, nothing in the site's nav or `sitemap.xml` points here, and `robots.txt` is unchanged.

**The copy has not been reviewed.** Before any link to it ships, `safety-officer` and the tells gate review the map's text and data. Known items: the dataset carries a GCC region and a "Defence & Dual-Use" sector inside a "Defence & Regulation" sector group, all under estate bans; the biography and one objection paragraph mention Singapore, out of fund scope since 2026-07-13.

## What is here

| File | Purpose |
|---|---|
| `index.html` | The map's landing page and LP interest form |
| `reg-map.html` | The map interface |
| `reg-map.js`, `app.js` | Map filtering and rendering; navigation and form submission |
| `base.css`, `style.css`, `reg-map.css` | Page styles, bound to the site's `hmm-tokens.css` |
| `data/regulations.json` | The dataset (source of truth) |
| `data/regulations-data.js` | Generated from the JSON by `build_data.py`; regenerate and commit both after editing |
| `assets/` | Thesis visualisation PNGs and the two logos |

Shared with the site and referenced by relative path, not duplicated: `../hmm-tokens.css` and `../fonts/`.

## Deployment

- Headers: `_headers` at the site root carries a `/regulation/*` block with the Content-Security-Policy the map needs (Leaflet from unpkg, Chart.js from jsDelivr, tiles from Carto, all scripts pinned with subresource integrity). The site's root CSP is untouched.
- Form: `lp-interest` is a Netlify Form (`data-netlify="true"`, honeypot `bot-field`). It works only once Forms is enabled for the site in the Netlify dashboard; until then the page reports an error on submit.
- Guards: the site's guards (`check:csp`, `check:tokens`, `check:affordances`, `check:deadcss`, `check:figures`) enumerate the root pages by name and do not read this folder.

## Source

Authored in `Hmm-Ventures/regulation-map`. Edit there and copy over, or edit here and carry the change back; the two are not linked.
