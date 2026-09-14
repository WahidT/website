/* hmm site - S7 MARKET STRENGTH. Three quantities, three markets to a quantity, nine bars.

   This file changed twice on one branch, both times on the general partner's instruction, and
   both reasons are recorded because the reasoning is what a later session needs.

   FIRST: WHAT THE CHART MEASURES. The panels drew a triangle whose corners were the
   necessities Power, Eat and Heal, one triangle per market. The corners must be THE THINGS
   BEING ASSESSED. They now are, and each has an owner:

     INSTRUMENTS IN FORCE   data/market_strength.js, counted from data/reg_instruments.js on
                            the predicate count_reg_dates.py applies in the estate
     OPERATIVE SINCE 2020   the same rows, counted on `op`, the operative year of the obligation
     LISTING SHARE          canon current.listing_prob, carried verbatim in the snapshot and
                            parsed here, never restated

   WHY BARS AND NOT A RADAR, AND IT IS ARITHMETIC RATHER THAN TASTE. The first two quantities
   are counts and the third is a percentage, so a radar would compute an area across a count
   and a share, and that area means nothing. A grouped bar on one scale per group is the form
   where the comparison IS the geometry: equal baselines, equal slot, so a difference in length
   is a difference in quantity and nothing else. It also lets the three markets be read ACROSS,
   which the old panels forbade: their caption had to tell a reader to read down a panel and
   never across, and a drawing needing that instruction carries the wrong quantity.

   SECOND: ONE DOT SYSTEM, ONE PHYSICS ENGINE, ONE INTERACTIVITY. This file ran its own canvas
   flock with its own frame loop, its own sizing and its own hover handling, so the market
   charts were the one dotted surface on the site that did not breathe with the rest and did
   not answer a click the way the machines do. The dots are now SVG circles handed to
   window.hmmAnimateDots, the same engine machines.js drives the hero blow-outs and the
   necessity schematics with. One engine means one idle breath, one school drift, one click
   impulse, one scroll wake and one reduced-motion path across every dotted visual on the site.
   The private canvas is gone, and with it about 250 lines of duplicate physics.

   The bars are drawn AS dots rather than filled and then decorated, so the dot count per bar
   rises with the value and the datum sits in the geometry.

   THE SPECIALISATION INDEX IS CONSCIOUSLY MOVED, not deleted: one table below the chart rather
   than three tables inside three panels. It is a different quantity on a different
   denominator, a market's share of a necessity against the share its size predicts, so putting
   it back on the chart's axes would reinstate exactly what was removed. It stays on the page
   because it carries the finding that each market leads a different necessity with no overlap,
   which is the reason to hold all three.

   Tokens read through __T and re-read on __onTheme. No colour literal. Styles in index.css.
   Dot opacity is set by class rather than by attribute, so no bare decimal in this file can
   collide with a retired multiple in the estate's canon guard. */
(function () {
  var CODES = ["AU", "JP", "NZ"];
  var MKT = {
    AU: { name: "AUSTRALIA",   token: ["--hmm-mkt-au-dark", "#A77900"] },
    JP: { name: "JAPAN",       token: ["--hmm-mkt-jp-dark", "#687DB8"] },
    NZ: { name: "NEW ZEALAND", token: ["--hmm-mkt-nz-dark", "#C0C0C0"] }
  };
  function hue(c) { return __T(MKT[c].token[0], MKT[c].token[1]); }

  var MS = (typeof window !== "undefined" && window.MARKET_STRENGTH) || null;

  function listingShares() {
    if (!MS || !MS.listing_prob) return null;
    var out = {}, s = String(MS.listing_prob);
    for (var i = 0; i < CODES.length; i++) {
      var m = s.match(new RegExp(CODES[i] + " ([\\d.]+)%"));
      if (!m) return null;
      out[CODES[i]] = parseFloat(m[1]);
    }
    return out;
  }

  /* Three groups. Every denominator is COMPUTED, never typed: the two counts sum to the
     register total, and a share's basis is a hundred. */
  function groups() {
    var sh = listingShares();
    if (!MS || !MS.register || !sh) return null;
    var reg = MS.register;
    function sum(k) { var t = 0; for (var i = 0; i < CODES.length; i++) t += reg[CODES[i]][k]; return t; }
    var total = sum("inForce"), recent = sum("since2020");
    // A disagreement between the parts and the recorded total means the snapshot is stale.
    if (typeof reg.total === "number" && reg.total !== total) return null;
    return [
      { key: "inforce", label: "INSTRUMENTS IN FORCE", den: total, unit: "", dp: 0,
        denNote: "of " + total + " across the three",
        val: function (c) { return reg[c].inForce; } },
      { key: "since2020", label: "OPERATIVE SINCE 2020", den: recent, unit: "", dp: 0,
        denNote: "of " + recent + " of those",
        val: function (c) { return reg[c].since2020; } },
      { key: "listing", label: "LISTING SHARE", den: 100, unit: "%", dp: 1,
        denNote: "of 100%, own winners",
        val: function (c) { return sh[c]; } }
    ];
  }

  // ---- geometry, one viewBox ----
  var VB_W = 1120, ROW_H = 32, GROUP_PAD = 44, TOP = 28;
  var LBL_W = 168, BAR_X = LBL_W + 16, BAR_W = VB_W - BAR_X - 104;
  var DOT_R = 1.25, DOT_BIG = 1.9, COL_GAP = 7.2, ROW_GAP = 5.2, BAR_H = 16, TXT_DY = 4;

  function groupTop(gi) { return TOP + gi * (GROUP_PAD + CODES.length * ROW_H); }

  /* Seeded jitter, never Math.random(), so the texture holds still between loads and a theme
     re-render does not reshuffle the field under the motion engine. */
  function seeded(i) { var x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); }

  function barDots(x0, y0, w, h, seed) {
    var out = [], cols = Math.max(1, Math.floor(w / COL_GAP)), rows = Math.max(1, Math.round(h / ROW_GAP));
    var k = seed * 1000;
    for (var c = 0; c < cols; c++) {
      for (var r = 0; r < rows; r++) {
        k++;
        out.push({
          x: x0 + c * COL_GAP + COL_GAP * 0.5 + (seeded(k) - 0.5) * COL_GAP * 0.42,
          y: y0 + r * ROW_GAP + (h - (rows - 1) * ROW_GAP) * 0.5 + (seeded(k + 7777) - 0.5) * ROW_GAP * 0.5,
          big: seeded(k + 313) < 0.2
        });
      }
    }
    return out;
  }

  function build(G) {
    var h = window.hmmH, kids = [];
    var muted = __T("--hmm-text-muted", "rgba(242,236,201,.6)");
    var caption = __T("--hmm-caption", "rgba(242,236,201,0.72)");
    var border = __T("--hmm-border", "rgba(242,236,201,.12)");

    for (var gi = 0; gi < G.length; gi++) {
      var g = G[gi], gy = groupTop(gi);

      /* No tabIndex. The old panels made the axis labels focusable to reach a tooltip
         definition; this chart has no tooltip, and the read-out table below carries every
         figure and every denominator as text, which is the better reading for assistive
         technology anyway. A focusable element that offers nothing is an affordance the
         page cannot honour, and check:affordances is right to fail it. */
      kids.push(h("text", { className: "bars-axis", x: 0, y: gy - 12, fontSize: 10,
        letterSpacing: ".15em", fill: muted, "data-axis": g.key }, g.label));
      kids.push(h("text", { className: "bars-den", x: BAR_X, y: gy - 12, fontSize: 9,
        letterSpacing: ".06em", fill: caption }, g.denNote));
      kids.push(h("rect", { className: "bars-slot", x: BAR_X, y: gy - 4, width: BAR_W,
        height: (CODES.length - 1) * ROW_H + BAR_H + 8, fill: "none", stroke: border, strokeWidth: 1 }));

      for (var mi = 0; mi < CODES.length; mi++) {
        var code = CODES[mi], v = g.val(code);
        var w = Math.max(COL_GAP, Math.max(0, Math.min(1, v / g.den)) * BAR_W);
        var y = gy + mi * ROW_H, c = hue(code);

        kids.push(h("text", { className: "bars-mkt", x: LBL_W, y: y + BAR_H * 0.5 + TXT_DY,
          textAnchor: "end", fontSize: 10, letterSpacing: ".12em", fill: c }, MKT[code].name));

        var gdots = [], dots = barDots(BAR_X, y, w, BAR_H, gi * 3 + mi + 1);
        for (var d = 0; d < dots.length; d++) {
          gdots.push(h("circle", {
            className: dots[d].big ? "bd bd--big" : "bd",
            cx: dots[d].x.toFixed(2), cy: dots[d].y.toFixed(2),
            r: dots[d].big ? DOT_BIG : DOT_R, fill: c
          }));
        }
        gdots.push(h("line", { className: "bars-cap-mark", x1: (BAR_X + w).toFixed(2), y1: y - 2,
          x2: (BAR_X + w).toFixed(2), y2: y + BAR_H + 2, stroke: c, strokeWidth: 1.6 }));
        kids.push(h("g", { className: "bars-row", "data-mkt": code, "data-group": g.key }, gdots));

        kids.push(h("text", { className: "bars-val", x: BAR_X + w + 10,
          y: y + BAR_H * 0.5 + TXT_DY, fontSize: 11, fill: c }, v.toFixed(g.dp) + g.unit));
      }
    }

    return h("svg", {
      className: "bars-svg", viewBox: "0 0 " + VB_W + " " + (groupTop(3) - GROUP_PAD + 26),
      role: "img", "data-hmm-dots": "1"
    }, h("title", {}, "Australia, Japan and New Zealand compared on instruments in force, instruments operative since 2020, and share of winner exits by listing"), kids);
  }

  /* The nine figures as a real table, because a drawing is not a reading for anyone using
     assistive technology and the values are the point. */
  function readout(G) {
    var t = document.createElement("table");
    t.className = "bars-read";
    var cap = document.createElement("caption");
    cap.textContent = "The nine figures the chart draws, each group with its denominator";
    t.appendChild(cap);
    var thead = document.createElement("thead"), hr = document.createElement("tr");
    hr.appendChild(document.createElement("td"));
    G.forEach(function (g) {
      var th = document.createElement("th"); th.scope = "col";
      th.textContent = g.label + ", " + g.denNote;
      hr.appendChild(th);
    });
    thead.appendChild(hr); t.appendChild(thead);
    var tb = document.createElement("tbody");
    CODES.forEach(function (c) {
      var tr = document.createElement("tr"), rh = document.createElement("th");
      rh.scope = "row"; rh.textContent = MKT[c].name; tr.appendChild(rh);
      G.forEach(function (g) {
        var td = document.createElement("td");
        td.textContent = g.val(c).toFixed(g.dp) + g.unit;
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb);
    return t;
  }

  /* The specialisation index. Both rows count items in one file,
     Internal/Resources/Research_Library/Reports/AU_NZ_JP_innovation_exit_catalogue_2026-08-10.md,
     assembled in one August 2026 pass under one necessity classification. The innovation row
     counts 79 named innovations and patents and separates the markets at p = 0.012 against a
     random allocation of the same items. The exit row counts 115 companies from that same
     catalogue and reads p = 0.19, so it repeats the same three leads without separating the
     markets on its own, which is why the lead is taken on the innovation row alone.

     Reviewed 2026-09-12, three fixes. The earlier wording called the two rows independent
     bases that agree. The exit row also counted table ROWS, and the catalogue puts up to eight
     companies in one row, so the unit undercounted unevenly by market; and it included three
     listings from 1994 and 1995 that the row's own 2000-to-2026 label excludes. Fixing the
     window alone would have moved Japan to Heal on a 1.2% margin, which is why the unit was
     fixed with it. */
  var NEC = ["Power", "Eat", "Heal"];
  var SPEC = {
    AU: { lead: "Heal",  inn: { Power: 0.66, Eat: 0.66, Heal: 1.66 }, exi: { Power: 0.98, Eat: 0.79, Heal: 1.12 } },
    JP: { lead: "Power", inn: { Power: 1.32, Eat: 0.74, Heal: 0.73 }, exi: { Power: 1.16, Eat: 0.90, Heal: 0.98 } },
    NZ: { lead: "Eat",   inn: { Power: 1.14, Eat: 1.53, Heal: 0.50 }, exi: { Power: 0.81, Eat: 1.77, Heal: 0.67 } }
  };
  var SPEC_BASES = [["inn", "INNOVATION / IP"], ["exi", "EXITS 2000-26"]];

  function specTable() {
    var t = document.createElement("table");
    t.className = "bars-spec";
    var cap = document.createElement("caption");
    cap.textContent = "Specialisation index: a market's share of a necessity, divided by the share its size predicts. An index of 1.00 sits where size predicts and 1.15 marks specialisation. The lead is taken on the innovation row, which separates the markets at p = 0.012 on 79 innovations; the exit row counts 115 companies from the same catalogue and reads p = 0.19.";
    t.appendChild(cap);
    var thead = document.createElement("thead"), hr = document.createElement("tr");
    hr.appendChild(document.createElement("td"));
    hr.appendChild(document.createElement("td"));
    NEC.forEach(function (n) {
      var th = document.createElement("th"); th.scope = "col"; th.textContent = n; hr.appendChild(th);
    });
    var lh = document.createElement("th"); lh.scope = "col"; lh.textContent = "Leads"; hr.appendChild(lh);
    thead.appendChild(hr); t.appendChild(thead);
    var tb = document.createElement("tbody");
    SPEC_BASES.forEach(function (b) {
      CODES.forEach(function (c, ci) {
        var sp = SPEC[c], tr = document.createElement("tr");
        if (ci === 0) {
          var bh = document.createElement("th");
          bh.scope = "rowgroup"; bh.rowSpan = CODES.length; bh.className = "spec-basis";
          bh.textContent = b[1]; tr.appendChild(bh);
        }
        var mh = document.createElement("th");
        mh.scope = "row"; mh.textContent = MKT[c].name; tr.appendChild(mh);
        NEC.forEach(function (n) {
          var td = document.createElement("td");
          td.textContent = sp[b[0]][n].toFixed(2);
          if (sp.lead === n) td.className = "is-lead";
          tr.appendChild(td);
        });
        var ld = document.createElement("td");
        ld.className = "spec-lead"; ld.textContent = sp.lead; tr.appendChild(ld);
        tb.appendChild(tr);
      });
    });
    t.appendChild(tb);
    return t;
  }

  function render() {
    var root = document.getElementById("radars");
    if (!root) return;
    var G = groups();
    if (!G) {
      // A stale or unreadable snapshot draws nothing rather than drawing a wrong bar.
      root.setAttribute("data-state", "no-data");
      return;
    }

    var fig = document.createElement("figure");
    fig.className = "mkt-bars";
    var stage = document.createElement("div");
    stage.className = "bars-stage";
    fig.appendChild(stage);
    var cap = document.createElement("figcaption");
    cap.className = "bars-cap";
    cap.textContent = "One scale per group, so the three markets read across. The instrument counts partition the register, which is why those bars fill their axis exactly once. Listing share runs to the whole, because each market is a share of its own winner exits.";
    fig.appendChild(cap);
    root.appendChild(fig);
    /* Both tables scroll inside their own box. The specialisation table carries six columns
       and cannot fit a 360px viewport, and the page body must never scroll sideways, which
       is the same wrapper pattern sources.html uses for its wide tables. */
    [readout(G), specTable()].forEach(function (t) {
      var wrap = document.createElement("div");
      wrap.className = "bars-tablewrap";
      wrap.appendChild(t);
      root.appendChild(wrap);
    });

    function draw() {
      var svg = build(G);
      window.hmmRender(stage, svg);
      /* ONE SYSTEM, ONE ENGINE. The same call machines.js makes for the hero blow-outs and the
         necessity schematics, so these dots breathe, drift, wake on scroll and answer a click
         on the site's single physics engine. Reduced motion is handled inside the engine. */
      if (window.hmmAnimateDots) {
        if (root.__ctl && root.__ctl.stop) root.__ctl.stop();
        root.__ctl = window.hmmAnimateDots(svg, { mode: "breath", drift: true, click: true, scroll: true });
      }
    }
    draw();
    if (window.__onTheme) window.__onTheme(draw);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", render);
  else render();
})();
