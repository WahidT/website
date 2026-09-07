/* hmm site - THREE hexagon radar charts (Australia, New Zealand, Japan).
   One panel per market. Six spokes 60 degrees apart, same axis order and rotation
   across all three panels: AI · HARDWARE · REGULATION · STARTUP · EXIT · TRADE.
   Three necessity fills per panel (Power, Eat, Heal). Vertex radius = score/10 of
   the max spoke length. Vanilla SVG (createElementNS), no libraries.
   Renders into an existing #radars container on load; no-ops if it is absent.
   Dark by default (bg #141414) to match the live site; light via prefers-color-scheme
   and [data-theme="light"]. Honours prefers-reduced-motion (disables the dot pulse).
   Tokens are read through __T from theme.js and re-read on __onTheme. The stylesheet
   lives in index.css (the #radars rules); it used to be a <style> element this script
   appended, which style-src-elem 'self' in _headers would now block. */
(function () {
  var SVGNS = "http://www.w3.org/2000/svg";

  var AXES = ["AI", "HARDWARE", "REGULATION", "STARTUP", "EXIT", "TRADE"];

  // Necessity palette (exact hues, matched to the rest of the site). Read
  // from the tokens at every render: hues() is called for the first paint and
  // again on a data-theme flip, and HUES is refreshed in place so every
  // reader of it (the swatches, the series paths, the canvas dots) sees the
  // new value without being rebuilt.
  function hues() { return { Power: __T("--hmm-nec-power-dark", "#FF9732"), Eat: __T("--hmm-nec-eat-dark", "#508B5C"), Heal: __T("--hmm-nec-heal-dark", "#9E69BE") }; }
  var HUES = hues();
  var SERIES = ["Power", "Eat", "Heal"];

  // dots render on <canvas> using the DWG-NEC machine-flock physics; PANELS collects them per panel.
  var PANELS = [];
  function hexA(h, a) { var n = parseInt(h.slice(1), 16); return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")"; }

  // Scores 0 to 10, order: AI, Hardware, Regulation, Startup, Exit, Trade.
  var MARKETS = [
    {
      name: "AUSTRALIA",
      sub: "resource and materials market",
      series: { Power: [8, 10, 10, 3, 5, 9], Eat: [7, 7, 8, 2, 5, 8], Heal: [8, 9, 8, 10, 5, 8] }
    },
    {
      name: "NEW ZEALAND",
      sub: "standard-setting market",
      series: { Power: [3, 3, 6, 5, 4, 4], Eat: [8, 7, 9, 6, 4, 9], Heal: [5, 8, 7, 10, 4, 7] }
    },
    {
      name: "JAPAN",
      sub: "hardware market under demand stress",
      series: { Power: [6, 10, 8, 1, 8, 6], Eat: [6, 8, 6, 1, 8, 4], Heal: [7, 9, 9, 10, 8, 6] }
    }
  ];

  var CAPTION =
    "Scored 0 to 10 relative to each market's own ceiling. Read down a panel's own axes, " +
    "not across markets: a score is not an absolute quantity that carries between markets. " +
    "Two axes are measured from hmm's in-mandate pipeline (startup depth, exit route); " +
    "four are assessed from market structure (AI, hardware, regulation, trade).";

  // ---- geometry ----
  var VB_W = 320, VB_H = 300;   // per-panel viewBox
  var CX = 160, CY = 148;       // chart centre
  var R = 86;                   // max spoke length (score 10)
  var LBL_R = R + 18;           // axis-label radius
  var RINGS = [2, 4, 6, 8, 10];
  var RING_LABELS = [2, 6, 10];

  // AI at top (-90deg), then clockwise every 60deg.
  function angle(i) { return (-90 + i * 60) * Math.PI / 180; }
  function px(i, radius) { return CX + Math.cos(angle(i)) * radius; }
  function py(i, radius) { return CY + Math.sin(angle(i)) * radius; }

  function el(name, attrs) {
    var n = document.createElementNS(SVGNS, name);
    if (attrs) for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }


  function scorePath(scores) {
    var d = "";
    for (var i = 0; i < 6; i++) {
      var rr = (scores[i] / 10) * R;
      d += (i === 0 ? "M" : "L") + px(i, rr).toFixed(2) + " " + py(i, rr).toFixed(2);
    }
    return d + "Z";
  }

  function anchorFor(x) {
    var d = x - CX;
    if (d > 6) return "start";
    if (d < -6) return "end";
    return "middle";
  }


  function cornerTick(pos) {
    // small mono corner tick in the accent, drawn as an L into the panel.
    var w = document.createElement("span");
    w.className = "radar-corner rc-" + pos;
    var s = el("svg", { width: "9", height: "9", viewBox: "0 0 9 9" });
    var horiz, vert;
    if (pos === "tl") { horiz = "M0 0 H9"; vert = "M0 0 V9"; }
    else if (pos === "tr") { horiz = "M9 0 H0"; vert = "M9 0 V9"; }
    else if (pos === "bl") { horiz = "M0 9 H9"; vert = "M0 9 V0"; }
    else { horiz = "M9 9 H0"; vert = "M9 9 V0"; }
    [horiz, vert].forEach(function (d) {
      s.appendChild(el("path", { d: d, stroke: "var(--hmm-accent)", "stroke-width": "1", fill: "none" }));
    });
    w.appendChild(s);
    return w;
  }

  var COUNTRY_PROSE = {
    "AUSTRALIA": "Australia, the resource and materials market. Mining right-to-operate is one of the deepest regulatory regimes, and the government backs critical minerals directly through a national list and export finance. Autonomous mining scaled here first, giving a real edge in field-autonomy hardware and control. Medical-device and biotech hardware runs global through Cochlear, ResMed and CSL, and imaging AI through Harrison.ai. The venture base is mature, and super funds are beginning to fund it. Exits resolve through trade sale to US acquirers, construction-software Aconex to Oracle among them.",
    "NEW ZEALAND": "New Zealand, the standard-setting market. One house of parliament and top-of-table trust let it move a rule fast, and its food-safety regime is among the strongest. The gene-technology reform reopens the Eat biological-input gate. Hardware runs global at the top end through Fisher and Paykel Healthcare and Rocket Lab, and through Halter in animal agriculture. The venture base is small and global from the first customer. Exits go offshore to Australian and US acquirers.",
    "JAPAN": "Japan, the hardware market under demand stress. It imports roughly 90% of its energy, which makes Power a national-security question, and it holds the world's oldest population, which makes Heal a structural demand. The PMDA is a rigorous medical gate with a fast track for novel devices, and the AI regime is among the most permissive, with copyright law broadly allowing training on protected data. Hardware leads the world in robotics, semiconductor materials, image sensors and batteries. The venture base is thin but rising on a government startup plan, and Tokyo Growth gives it an early IPO exit. Examples include Preferred Networks, Sakana, Spiber and SmartHR."
  };
  var COUNTRY_TOKEN = { "AUSTRALIA": ["--hmm-mkt-au-dark", "#A77900"], "NEW ZEALAND": ["--hmm-mkt-nz-dark", "#C0C0C0"], "JAPAN": ["--hmm-mkt-jp-dark", "#687DB8"] };
  function countryAccent(name) { var t = COUNTRY_TOKEN[name]; return t ? __T(t[0], t[1]) : __T("--hmm-accent", "#C44539"); }

  var AXIS_DEFS = {
    "AI": "AI competence. The market's ability to build and apply modern AI, from research base to deployed product.",
    "HARDWARE": "Hardware competence. Strength in physical innovation: robotics, medical devices, materials, sensors, semiconductors.",
    "REGULATION": "Regulation. The depth and favourability of the necessity gates, the right-to-operate regimes a company must clear.",
    "STARTUP": "Startup depth. How many strong companies the market forms, measured from hmm's pipeline.",
    "EXIT": "Exit route. How readily companies exit, by IPO venue and trade sale. Measured from hmm's pipeline.",
    "TRADE": "Global trade. How naturally the market's companies reach global demand: go-to-market, exports, redomicile."
  };

  function buildSVG(market, dotsOut) {
    var svg = el("svg", { class: "radar-svg", viewBox: "0 0 " + VB_W + " " + VB_H, role: "img" });
    svg.appendChild(el("title", {})).textContent = market.name + " necessity radar";

    // no hexagon frame or spokes: the constellation of dots carries the shape

    // axis labels (text ink, uppercase, letter-spaced)
    for (var a = 0; a < 6; a++) {
      var lx = px(a, LBL_R), ly = py(a, LBL_R);
      var dy = ly < CY - 4 ? 0 : (ly > CY + 4 ? 8 : 3);
      var lab = el("text", {
        "class": "axis-lbl", "data-axis": AXES[a], tabindex: "0",
        x: lx.toFixed(1), y: (ly + dy).toFixed(1),
        "text-anchor": anchorFor(lx),
        "font-size": "9", "letter-spacing": ".14em",
        fill: "var(--hmm-text-muted,rgba(242,236,201,.6))"
      });
      lab.textContent = AXES[a];
      svg.appendChild(lab);
    }

    // necessity polygons, dots, and direct labels
    SERIES.forEach(function (name) {
      var scores = market.series[name];
      var hue = HUES[name];
      var g = el("g", { class: "series series--" + name.toLowerCase() });
      g.setAttribute("data-series", name);

      // invisible fill: no visible wash by default, but the focus state can raise it on legend hover
      g.appendChild(el("path", {
        class: "radar-fill",
        d: scorePath(scores),
        fill: hue, "fill-opacity": "0", stroke: "none"
      }));
      // invisible edge, kept in the DOM only so the morph flock can sample the shape; the dots carry it visually
      g.appendChild(el("path", {
        class: "radar-line",
        d: scorePath(scores),
        fill: "none", stroke: hue, "stroke-width": "1", "stroke-opacity": "0",
        "stroke-linejoin": "round"
      }));

      // dot positions collected for the canvas flock engine (drawn on <canvas>, not SVG) at machine-diagram density
      var avg = (scores[0] + scores[1] + scores[2] + scores[3] + scores[4] + scores[5]) / 60; // 0..1
      var FILL = Math.round(64 + avg * 120);             // dense fill; cheap on canvas, matches the DWG-NEC diagrams
      for (var q = 0; q < FILL; q++) {
        var seg = Math.random() * 6, si = seg | 0, fr = seg - si;
        var ri = (scores[si] / 10) * R, rj = (scores[(si + 1) % 6] / 10) * R;
        var bnd = ri + (rj - ri) * fr;                    // polygon boundary radius at this angle (approx)
        var th = angle(si) + fr * (Math.PI / 3);
        var rr2 = bnd * Math.sqrt(Math.random()) * 0.96;  // sqrt for area-uniform fill, 0.96 keeps inside the edge
        var big = Math.random() < 0.22;
        dotsOut.push({ x: CX + Math.cos(th) * rr2, y: CY + Math.sin(th) * rr2, r: big ? 1.9 : 1.2, hue: hue, s: name });
      }
      // vertex dots: the peaks, larger
      for (var vv = 0; vv < 6; vv++) {
        var rr = (scores[vv] / 10) * R;
        dotsOut.push({ x: px(vv, rr), y: py(vv, rr), r: 2.2, hue: hue, s: name, vtx: true });
      }

      svg.appendChild(g);
    });

    return svg;
  }

  // (radar dots are drawn on <canvas> by the shared flock engine in render(); no SVG explode.)

  function buildPanel(market) {
    var panel = document.createElement("div");
    panel.className = "radar-panel";

    ["tl", "tr", "bl", "br"].forEach(function (p) { panel.appendChild(cornerTick(p)); });

    panel.setAttribute("data-market", market.name);
    panel.style.setProperty("--c", countryAccent(market.name));

    var title = document.createElement("h3");
    title.className = "radar-title";
    title.textContent = market.name;
    panel.appendChild(title);

    var sub = document.createElement("p");
    sub.className = "radar-sub";
    sub.textContent = market.sub;
    panel.appendChild(sub);

    // body: chart on the left, prose on the right once the panel opens
    var body = document.createElement("div");
    body.className = "radar-body";
    var viz = document.createElement("div");
    viz.className = "radar-viz";
    body.appendChild(viz);
    panel.appendChild(body);

    var dotsOut = [];
    var svg = buildSVG(market, dotsOut);
    var stage = document.createElement("div");
    stage.className = "radar-stage";
    stage.appendChild(svg);
    var cv = document.createElement("canvas");
    cv.className = "radar-canvas";
    stage.appendChild(cv);
    viz.appendChild(stage);
    PANELS.push({ panel: panel, svg: svg, cv: cv, dots: dotsOut });

    // legend chips (identity never rests on colour alone)
    var legend = document.createElement("ul");
    legend.className = "radar-legend";
    SERIES.forEach(function (name) {
      var li = document.createElement("li");
      var chip = document.createElement("button");
      chip.type = "button";
      chip.className = "radar-chip u-control";
      chip.setAttribute("data-series", name);
      chip.setAttribute("aria-label", "Highlight " + name + " on " + market.name);
      var sw = document.createElement("span");
      sw.className = "swatch";
      sw.style.background = HUES[name];
      chip.appendChild(sw);
      chip.appendChild(document.createTextNode(name));
      li.appendChild(chip);
      legend.appendChild(li);

      function raise() {
        panel.setAttribute("data-focus", name);
        SERIES.forEach(function (s2) {
          var grp = svg.querySelector('.series[data-series="' + s2 + '"]');
          if (grp) grp.classList.toggle("is-active", s2 === name);
        });
      }
      function restore() {
        panel.removeAttribute("data-focus");
        var groups = svg.querySelectorAll(".series");
        for (var i = 0; i < groups.length; i++) groups[i].classList.remove("is-active");
      }
      chip.addEventListener("mouseenter", raise);
      chip.addEventListener("mouseleave", restore);
      chip.addEventListener("focus", raise);
      chip.addEventListener("blur", restore);
    });
    viz.appendChild(legend);

    // the prose the modal used to hold, now read in place
    var read = document.createElement("div");
    read.className = "radar-read";
    var prose = document.createElement("p");
    prose.textContent = COUNTRY_PROSE[market.name] || "";
    read.appendChild(prose);
    body.appendChild(read);

    return panel;
  }

  function render() {
    var root = document.getElementById("radars");
    if (!root) return;

    var wrap = document.createElement("div");
    wrap.className = "radar-wrap";
    MARKETS.forEach(function (m) { wrap.appendChild(buildPanel(m)); });
    root.appendChild(wrap);

    // The re-render path. Refresh HUES in place and re-point every dot, series
    // path, swatch and panel accent; the frame loop below reads d.hue each
    // frame, so the canvas repaints on its own.
    __onTheme(function () {
      var fresh = hues();
      SERIES.forEach(function (n) { HUES[n] = fresh[n]; });
      PANELS.forEach(function (p) { p.dots.forEach(function (d) { d.hue = HUES[d.s]; }); });
      Array.prototype.forEach.call(root.querySelectorAll(".series"), function (g) {
        var n = g.getAttribute("data-series"); if (!n || !HUES[n]) return;
        Array.prototype.forEach.call(g.querySelectorAll(".radar-fill"), function (e) { e.setAttribute("fill", HUES[n]); });
        Array.prototype.forEach.call(g.querySelectorAll(".radar-line"), function (e) { e.setAttribute("stroke", HUES[n]); });
      });
      Array.prototype.forEach.call(root.querySelectorAll(".radar-chip"), function (chip) {
        var sw = chip.querySelector(".swatch"), n = chip.getAttribute("data-series");
        if (sw && n && HUES[n]) sw.style.background = HUES[n];
      });
      Array.prototype.forEach.call(root.querySelectorAll(".radar-panel"), function (p) { p.style.setProperty("--c", countryAccent(p.getAttribute("data-market"))); });
    });

    // ---- canvas flock engine: draw every panel's dots with the DWG-NEC machine physics ----
    var reduceMo = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    var DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    function sizePanel(p) {
      var w = p.cv.clientWidth, h = p.cv.clientHeight;
      if (!w || !h) return false;
      p.cv.width = Math.round(w * DPR); p.cv.height = Math.round(h * DPR);
      p.sx = w / VB_W; p.w = w; p.h = h;
      p.ctx = p.cv.getContext("2d"); p.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      for (var i = 0; i < p.dots.length; i++) {
        var d = p.dots[i]; d.hx = d.x * (w / VB_W); d.hy = d.y * (h / VB_H);
        if (d.cx === undefined) { d.cx = d.hx; d.cy = d.hy; d.ph = Math.random() * 6.283; }
      }
      return true;
    }
    function sizeAll() { for (var i = 0; i < PANELS.length; i++) sizePanel(PANELS[i]); }
    function frame() {
      var rr = root.getBoundingClientRect(), vh = window.innerHeight || 800;
      if (rr.bottom > -80 && rr.top < vh + 80) {          // draw only while in/near the viewport (reliable, no IntersectionObserver)
        var now = Date.now() / 1000;
        for (var pi = 0; pi < PANELS.length; pi++) {
          var p = PANELS[pi];
          if (!p.ctx && !sizePanel(p)) continue;
          var focus = p.panel.getAttribute("data-focus");
          p.ctx.clearRect(0, 0, p.w, p.h);
          for (var i = 0; i < p.dots.length; i++) {
            var d = p.dots[i];
            if (!reduceMo) { var tx = d.hx + Math.cos(now * 0.6 + d.ph) * 2.4, ty = d.hy + Math.sin(now * 0.7 + d.ph) * 2.4; d.cx += (tx - d.cx) * 0.045; d.cy += (ty - d.cy) * 0.045; }
            var a = (focus && focus !== d.s) ? 0.10 : (d.vtx ? 1 : 0.9);
            p.ctx.beginPath(); p.ctx.arc(d.cx, d.cy, d.r * p.sx, 0, 6.283); p.ctx.fillStyle = hexA(d.hue, a); p.ctx.fill();
          }
        }
      }
      requestAnimationFrame(frame);
    }
    sizeAll(); setTimeout(sizeAll, 300);
    var rrt = null; addEventListener("resize", function () { clearTimeout(rrt); rrt = setTimeout(sizeAll, 180); });
    // The panels now change width mid-animation as one expands, so the canvas has
    // to re-measure on every frame of that transition, not just on window resize.
    // Home positions move with it and the dots ease across, which is the effect.
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          for (var j = 0; j < PANELS.length; j++) if (PANELS[j].cv === entries[i].target) sizePanel(PANELS[j]);
        }
      });
      for (var pi2 = 0; pi2 < PANELS.length; pi2++) ro.observe(PANELS[pi2].cv);
    }
    requestAnimationFrame(frame);

    // axis-definition popups (hover or keyboard-focus an axis label)
    var tip = document.createElement("div");
    tip.className = "radar-tip"; tip.setAttribute("role", "tooltip"); tip.setAttribute("aria-hidden", "true");
    root.appendChild(tip);
    function showTip(node) {
      var name = node.getAttribute("data-axis"), def = AXIS_DEFS[name];
      if (!def) return;
      tip.textContent = def; tip.classList.add("on"); tip.setAttribute("aria-hidden", "false");
      var r = node.getBoundingClientRect(), tr = tip.getBoundingClientRect();
      var x = r.left + r.width / 2 - tr.width / 2;
      x = Math.max(10, Math.min(window.innerWidth - tr.width - 10, x));
      var y = r.top - tr.height - 8; if (y < 10) y = r.bottom + 8;
      tip.style.left = x + "px"; tip.style.top = y + "px";
    }
    function hideTip() { tip.classList.remove("on"); tip.setAttribute("aria-hidden", "true"); }
    function axisFrom(e) { var t = e.target; return (t && t.closest) ? t.closest(".axis-lbl") : null; }
    root.addEventListener("mouseover", function (e) { var a = axisFrom(e); if (a) showTip(a); });
    root.addEventListener("mouseout", function (e) { if (axisFrom(e)) hideTip(); });
    root.addEventListener("focusin", function (e) { var a = axisFrom(e); if (a) showTip(a); });
    root.addEventListener("focusout", function (e) { if (axisFrom(e)) hideTip(); });
  }

  if (document.readyState === "complete" || document.readyState === "interactive") {
    render();
  } else {
    window.addEventListener("load", render);
  }
})();
