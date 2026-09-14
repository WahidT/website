/* hmm site - S8 THE SCREEN. Ten markets in, three out, drawn as one shrinking bar.
   FILE: screen.js  (load after theme.js and data/reg_instruments.js, beside radars.js)

   THE FORM. One row per filter, top to bottom in the memorandum's order. The track is ten
   fixed columns, one per market in the starting set, so every row is read against the same
   axis and a market that is cut takes its column's width with it. Bar width is therefore the
   count of markets still standing, the count prints beside it with its denominator, and the
   names of the markets a filter removed sit in the columns the bar gave up. Ten to three
   reads as a shrinking bar.

   WHY THIS REPLACES THE PROSE. The section carried four lead paragraphs and a five-row table
   saying, per filter, what it reads, what it removes and what the removal rests on. Those are
   three short fields per row, which a row of a drawing carries. What is left in prose is the
   claim the drawing cannot make and the cost of the Europe grain.

   FIGURE OWNERS. Filter 4's count is struck at render from data/reg_instruments.js through
   REG_IN_FORCE, the same predicate sections.js applies to the register sentence and
   scripts/check-register-figures.mjs applies at build, so the three surfaces are one
   arithmetic. Where that file is absent the line renders without the figure. The other two
   evidence lines are external and carry their edition. Filter 5 has no public figure and its
   row stands without one.

   Colour is read through __T at render and re-read on __onTheme; the three surviving markets
   carry the market tokens the panels in section 08 use, which is the whole legend. Motion is
   an entrance only: the bars arrive full at ten and retract row by row. The static state is
   the final state, so reduced motion, a missing IntersectionObserver and a stalled observer
   all land on the correct drawing. */
(function () {
  var SLOTS = [
    { code: "AU",  name: "Australia",             axis: "AUSTRALIA",         token: ["--hmm-mkt-au-dark", "#A77900"] },
    { code: "JP",  name: "Japan",                 axis: "JAPAN",             token: ["--hmm-mkt-jp-dark", "#687DB8"] },
    { code: "NZ",  name: "New Zealand",           axis: "NEW ZEALAND",       token: ["--hmm-mkt-nz-dark", "#C0C0C0"] },
    { code: "CN",  name: "China",                 axis: "CHINA" },
    { code: "IN",  name: "India",                 axis: "INDIA" },
    { code: "NA",  name: "North America",         axis: "NORTH AMERICA" },
    { code: "EU",  name: "Europe",                axis: "EUROPE" },
    { code: "KR",  name: "the Republic of Korea", axis: "REPUBLIC OF KOREA" },
    { code: "SEA", name: "Southeast Asia",        axis: "SOUTHEAST ASIA" },
    { code: "SAM", name: "South America",         axis: "SOUTH AMERICA" }
  ];
  var BY_CODE = {};
  SLOTS.forEach(function (s) { BY_CODE[s.code] = s; });

  /* Filter 4's figure. Counted here, never typed: in-force is REG_IN_FORCE, defined once in
     data/reg_instruments.js, and the operative-date test is r.op >= 2020, which is the rule
     count_reg_dates.py applies in the estate. */
  function regLine() {
    /* GRAFT, 2026-09-14. This read the register directly and re-implemented the in-force
       predicate inline (r.global, r.type, the country list, r.op >= 2020). That is a second
       arithmetic for a figure that already has one owner, and it drifts the moment the
       predicate moves. It now reads the counted block in data/market_strength.js, which
       scripts/market-strength.mjs writes from that same predicate and which
       scripts/check-register-figures.mjs re-checks against both the register and canon on
       every build. One arithmetic, three surfaces.

       The fallback is a correct sentence carrying no figure, never a blank and never a
       number this file invented, because a silent fallback to a different string is the
       drift that survives review. */
    var MS = (typeof window !== "undefined" && window.MARKET_STRENGTH) || null;
    var BARE = "instruments dated on the day the obligation commences · the register in section 06";
    if (!MS || !MS.register) return BARE;
    var reg = MS.register, since = 0, total = reg.total;
    var codes = ["AU", "JP", "NZ"];
    for (var i = 0; i < codes.length; i++) {
      var row = reg[codes[i]];
      if (!row || typeof row.since2020 !== "number") return BARE;
      since += row.since2020;
    }
    if (!since || typeof total !== "number" || !total) return BARE;
    return since + " of " + total + " instruments in force are operative since 2020 · the register in section 06";
  }

  var STEPS = [
    { n: "",  name: "The starting set", reads: "a research base that reaches a regulated physical product",
      cuts: [], notes: ["markets outside the mandate were never screened"] },
    { n: "1", name: "The layer", reads: "research carried into a product made in a named facility",
      cuts: ["SEA", "SAM"], notes: ["judgement, no measured figure on either cut"] },
    { n: "2", name: "Density against capital", reads: "output per venture dollar, against the capital already bidding",
      cuts: ["NA", "EU", "KR"], notes: [
        /* One evidence line per row, so no row is taller than its neighbours. The pair
           1.09 and 0.16 is the June 2026 edition and the edition is named at the point of
           use, which is what settles it: the memorandum's section 9 still carries 1.22 and
           0.12 from the earlier edition, and the 2026-09 fact-check ruled the June 2026
           reading the sourced one and queued the memorandum's pair for the rewrite. A
           figure with a ruled edition has an owner. NOT PRINTED here, deliberately: every
           quantity in filter 5 (the net factors, the exit ceilings, the necessity weight),
           because they are multiples and an allocation and the public wall of 2026-07-25
           keeps those off this surface. */
        "Australia returns 0.16 companies above USD 10B per USD 1B of venture invested since 2000, first of the hubs compared, and 1.09 above USD 1B, third · Side Stage Ventures with Dealroom, June 2026 edition"
      ] },
    /* GP ruling 2026-09-14: name both schemes and keep the cut. Four simulated readers
       objected that PIC/S is a pharmaceutical GMP scheme while this register is mostly not
       medicines, and they were right. The reliance instrument differs by what the product is,
       so the filter names the scheme per lane, all three from the memorandum's section 5.
       ⚠ MDSAP cannot simply replace PIC/S here: New Zealand is not an MDSAP participant, so
       a cut run on MDSAP alone would remove New Zealand from the fund's own three. */
    { n: "3", name: "Inspection reliance", reads: "one inspection the network accepts, on whichever scheme covers the product",
      cuts: ["CN", "IN"], notes: [
        "medicines travel on PIC/S, where all three are among the 57 participating authorities, the 57th Jordan from 1 January 2026; devices travel on MDSAP, where one audit serves Australia and Japan and New Zealand sits outside it; electrical equipment travels on the IECEE CB scheme, recognised in 54 member countries"
      ] },
    { n: "4", name: "Regulation that is moving", reads: "a new condition, dated",
      cuts: [], held: "removes nothing · confirms the three", notes: [regLine] },
    { n: "5", name: "The arbitrage, netted", reads: "entry against the exit it reaches, on United States scale",
      cuts: [], held: "removes nothing · prices what the three carry", notes: [] }
  ];

  function hue(slot) { return slot.token ? __T(slot.token[0], slot.token[1]) : ""; }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function paint(node, slot) {
    node.classList.add("is-mkt");
    node.setAttribute("data-mkt", slot.code);
    node.style.setProperty("--c", hue(slot));
  }

  function render() {
    var root = document.getElementById("screen");
    if (!root) return;
    root.setAttribute("role", "figure");
    root.setAttribute("aria-label", "Five filters run on ten markets. Bar width is the number of markets still standing.");

    /* The axis names the ten columns once. Every row below reads against it, which is why
       no row carries a market name of its own and why the figure needs no legend. */
    var axis = el("div", "sc-axis sc-grid");
    axis.appendChild(el("div", "sc-axhead", "Filter"));
    var axtrack = el("div", "sc-track sc-track--axis");
    SLOTS.forEach(function (s, i) {
      var lbl = el("div", "sc-axlbl", s.axis);
      lbl.style.gridColumn = String(i + 1);
      if (s.token) paint(lbl, s);
      axtrack.appendChild(lbl);
    });
    axis.appendChild(axtrack);
    axis.appendChild(el("div", "sc-axhead sc-axhead--r", "Standing"));
    root.appendChild(axis);

    var live = {};
    SLOTS.forEach(function (s) { live[s.code] = 1; });

    STEPS.forEach(function (step, ri) {
      step.cuts.forEach(function (c) { delete live[c]; });
      var standing = 0;
      SLOTS.forEach(function (s) { if (live[s.code]) standing++; });

      var row = el("div", "sc-row sc-grid");
      row.style.setProperty("--r", String(ri));

      var head = el("div", "sc-head");
      var lbl = el("div", "sc-lbl");
      lbl.appendChild(el("span", "sc-num", step.n));   /* empty on the starting set: the slot holds the names in one column */
      lbl.appendChild(el("span", "sc-name", step.name));
      head.appendChild(lbl);
      head.appendChild(el("p", "sc-reads", step.reads));
      row.appendChild(head);

      var mid = el("div", "sc-mid");
      var track = el("div", "sc-track");
      SLOTS.forEach(function (s, i) {
        var cell = el("div", "sc-cell");
        cell.style.gridColumn = String(i + 1);
        cell.setAttribute("aria-hidden", "true");
        if (!live[s.code]) cell.classList.add("is-out");
        if (s.token) paint(cell, s);
        track.appendChild(cell);
      });
      /* The removed names sit in the columns the bar gave up, starting at the column the bar
         now ends on. A filter that removes nothing says so in the same place. */
      var gap = step.cuts.length
        ? step.cuts.map(function (c) { return BY_CODE[c].name; }).join(" · ")
        : (step.held || "");
      if (gap) {
        var g = el("div", "sc-gap", gap);
        g.style.setProperty("--from", String(standing + 1));
        track.appendChild(g);
      }
      mid.appendChild(track);
      (step.notes || []).forEach(function (t) {
        var s = (typeof t === "function") ? t() : t;
        if (s) mid.appendChild(el("p", "sc-ev", s));
      });
      row.appendChild(mid);

      var count = el("div", "sc-count", String(standing));
      count.appendChild(el("span", "sc-d", " / " + SLOTS.length));
      row.appendChild(count);

      root.appendChild(row);
    });

    root.appendChild(el("p", "sc-cap", "Bar width is the markets still standing. Names sit in the gap the bar gave up."));

    __onTheme(function () {
      Array.prototype.forEach.call(root.querySelectorAll("[data-mkt]"), function (n) {
        var s = BY_CODE[n.getAttribute("data-mkt")];
        if (s && s.token) n.style.setProperty("--c", hue(s));
      });
    });

    /* Entrance only. The armed state draws every row full at ten; dropping the class lets each
       row retract on its own delay. Every path that cannot animate skips arming, so the drawing
       a reader lands on is the finished one. */
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    root.classList.add("is-arm");
    var fired = false;
    function run() { if (fired) return; fired = true; root.classList.remove("is-arm"); }
    var io = new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) if (es[i].isIntersecting) { run(); io.disconnect(); return; }
    }, { rootMargin: "-8% 0px -8% 0px", threshold: 0 });
    io.observe(root);
    setTimeout(run, 6000);
  }

  if (document.readyState === "complete" || document.readyState === "interactive") render();
  else window.addEventListener("load", render);
})();