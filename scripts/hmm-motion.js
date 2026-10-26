/* hmm design system. Dot-field motion engine.
   Makes EVERY dot in a dotted visual movable: breath (idle pulse), school
   (coherent heavy drift), click impulse, and reconfigure transitions. Reads the
   <circle> dots of any bare dotted SVG (NecessityMachine bare, dot charts).
   Standalone, no libraries, CSP-safe. See guidelines/docs/motion.md.

     var ctl = window.hmmAnimateDots(svgOrRoot, {
       mode:"breath"|"heartbeat", drift:true, click:true, scroll:false,
       fps:30, pulse:0.12, pulseOpacity:0.12, driftAmp:3
     });
     ctl.reconfigure(points)   // morph dots to new [[x,y],...] over 3s (section transition)
     ctl.setMode("heartbeat")
     ctl.setScroll(0..1)       // wake the field as it enters view
     ctl.impulseAt(x,y)        // programmatic ripple (svg user units)
     ctl.stop()

   Cadence + weight come from tokens.json: breath 4s, transition 3s, impulse 3s,
   easing.weight cubic-bezier(0.65,0,0.35,1). Nothing snaps.

   ONE PHYSICS FOR THE WHOLE SITE (2026-10-26, GP: "100% of visuals should be linked together").
   window.HMM_MOTION is the only place breath, drift, impulse, easing and the necessity colours
   are defined. Every moving dot on every page reads them from here: hmmAnimateDots below, the
   page-wide field (transitions.js), the flock (morph.js), the hero dissolve (fit.js), the gate
   (ai-figures.js) and the register timeline (register.js). A click anywhere is broadcast as one
   "hmm:impulse" event, so the field behind a drawing ripples with the drawing.

     HMM_MOTION.breath(ms, ph)              -1..1, the 4s breath at phase ph (0..1)
     HMM_MOTION.drift(ms, x, y, ph, amp)    [dx, dy], the school: superposed 4s + 3s waves
     HMM_MOTION.push(dist, reach, ageFrac)  0..1, an impulse's radial weight at a distance and age
     HMM_MOTION.easeWeight(t)               the house ease-in-out
     HMM_MOTION.nec(key)                    [r,g,b] of power, eat, heal, reg or pearl, read off the tokens
     HMM_MOTION.onImpulse(fn)               fn(clientX, clientY) on every page click */
(function () {
  var TAU = 6.283185307;
  var GOLDEN = 0.6180339887;              // low-discrepancy phase spread
  function now() { return (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now(); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  // weighted ease-in-out (approx cubic-bezier(0.65,0,0.35,1))
  function easeWeight(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // slow double-thump envelope over a 0..1 cycle (a calm heartbeat), else long rest
  function heartbeat(u) {
    function bump(c, w) { var d = (u - c) / w; return Math.exp(-d * d); }
    return clamp(bump(0.10, 0.055) + 0.55 * bump(0.26, 0.055), 0, 1) * 2 - 1;
  }
  function prefersReduced() {
    try { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    catch (e) { return false; }
  }

  var BREATH = 4000, TRANS = 3000, IMPULSE = 3000;   // the 3s/4s cadence
  function breath(ms, ph) { var u = ((ms / BREATH) + ph) % 1; if (u < 0) u += 1; return Math.sin(u * TAU); }
  function drift(ms, x, y, ph, amp) {
    var kx = x * 0.012, ky = y * 0.012;
    return [amp * (0.6 * Math.sin(ms / 4000 * TAU + kx + ph * TAU) + 0.4 * Math.sin(ms / 3000 * TAU + ky)),
            amp * (0.6 * Math.cos(ms / 4000 * TAU + ky + ph * TAU) + 0.4 * Math.cos(ms / 3000 * TAU - kx))];
  }
  // an impulse pushes hardest at its centre, nothing past reach, and decays on the weighted ease over 3s
  function push(dist, reach, age) { if (age >= 1 || dist >= reach) return 0; return (1 - dist / reach) * (1 - easeWeight(age)); }
  /* Necessity colours from the tokens, so the field, the flock and the drawings carry one value each.
     Read at call time: a data-theme flip is picked up on the next read. */
  var NEC_TOKEN = { power: ["--hmm-nec-power", "#FF730B"], eat: ["--hmm-nec-eat", "#4F8A5B"], heal: ["--hmm-nec-heal", "#8752A5"],
                    reg: ["--hmm-tomato-jam", "#C44539"], pearl: ["--hmm-pearl-beige", "#F2ECC9"], thesis: ["--hmm-thesis", "#B8863A"] };
  function nec(key) {
    var t = NEC_TOKEN[key] || NEC_TOKEN.reg, v = "";
    try { v = getComputedStyle(document.documentElement).getPropertyValue(t[0]).trim(); } catch (e) {}
    var m = /^#?([0-9a-f]{6})$/i.exec(v) || /^#?([0-9a-f]{6})$/i.exec(t[1]);
    var h = m[1]; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  /* One click, every field. A pointerdown anywhere is re-broadcast as hmm:impulse with its client
     coordinates; each canvas or drawing that listens maps it into its own space. No cursor is set:
     the ripple is decoration, not a destination. */
  var listeners = [];
  function onImpulse(fn) { listeners.push(fn); }
  if (typeof document !== "undefined") document.addEventListener("pointerdown", function (e) {
    for (var i = 0; i < listeners.length; i++) listeners[i](e.clientX, e.clientY);
  }, { passive: true });
  window.HMM_MOTION = { TAU: TAU, GOLDEN: GOLDEN, BREATH: BREATH, TRANS: TRANS, IMPULSE: IMPULSE,
    now: now, clamp: clamp, easeWeight: easeWeight, heartbeat: heartbeat, prefersReduced: prefersReduced,
    breath: breath, drift: drift, push: push, nec: nec, onImpulse: onImpulse };

  window.hmmAnimateDots = function (target, opts) {
    opts = opts || {};
    var root = (target && target.tagName && target.tagName.toLowerCase() === "svg") ? target
      : (target && target.querySelector ? target.querySelector("svg") : null);
    if (!root) return { stop: function () {}, reconfigure: function () {}, setMode: function () {}, setScroll: function () {}, impulseAt: function () {} };

    var mode = opts.mode || "breath";
    var doDrift = opts.drift !== false;
    var doClick = opts.click !== false;
    var fps = opts.fps || 30;
    var PULSE = opts.pulse != null ? opts.pulse : 0.12;
    var PULSE_O = opts.pulseOpacity != null ? opts.pulseOpacity : 0.12;
    var DRIFT = opts.driftAmp != null ? opts.driftAmp : 3;
    var step = typeof opts.step === "function" ? opts.step : null;   // per-frame hook on base positions (the gate's stream)

    var circles = root.querySelectorAll("circle");
    var N = circles.length;
    var D = new Array(N);
    var bbox = { x0: 1e9, y0: 1e9, x1: -1e9, y1: -1e9 };
    for (var i = 0; i < N; i++) {
      var c = circles[i];
      var x = parseFloat(c.getAttribute("cx")) || 0, y = parseFloat(c.getAttribute("cy")) || 0;
      var r = parseFloat(c.getAttribute("r")) || 1;
      var op = c.getAttribute("opacity"); op = op == null ? 1 : parseFloat(op);
      var ph = (i * GOLDEN) % 1;                        // even breath phase spread
      D[i] = { el: c, bx: x, by: y, x: x, y: y, mx: x, my: y, r0: r, op0: op, ph: ph };
      if (x < bbox.x0) bbox.x0 = x; if (y < bbox.y0) bbox.y0 = y;
      if (x > bbox.x1) bbox.x1 = x; if (y > bbox.y1) bbox.y1 = y;
    }
    var span = Math.max(1, Math.hypot(bbox.x1 - bbox.x0, bbox.y1 - bbox.y0));
    var impulses = [];      // {x,y,t0}
    var morph = null;       // {t0}. Reconfigure in flight
    var scrollAmp = 1;      // 0..~1.4, set via setScroll
    var running = false, raf = 0, last = 0, t0 = now();

    function frame() {
      if (!running) return;
      var t = now();
      if (t - last < 1000 / fps) { raf = requestAnimationFrame(frame); return; }
      last = t;
      var el = t - t0;
      var mp = morph ? easeWeight((t - morph.t0) / TRANS) : 0;
      if (step) step(D, el);
      for (var i = 0; i < N; i++) {
        var d = D[i];
        // reconfigure: lerp base position from old -> target with weight
        if (morph) {
          d.x = d.bx + (d.mx - d.bx) * mp; d.y = d.by + (d.my - d.by) * mp;
          if (mp >= 1) { d.bx = d.mx; d.by = d.my; }
        }
        var bx = morph ? d.x : d.bx, by = morph ? d.y : d.by;
        // breath / heartbeat pulse (per-dot phase -> a wave through the field)
        var b;
        if (mode === "heartbeat") { var u = ((el / BREATH) + d.ph) % 1; if (u < 0) u += 1; b = heartbeat(u); }
        else b = breath(el, d.ph);
        var rr = d.r0 * (1 + PULSE * b * scrollAmp);
        var oo = clamp(d.op0 * (1 + PULSE_O * b), 0.15, 1);
        // school: coherent heavy drift (superposed 4s + 3s waves keyed to position)
        var dx = 0, dy = 0;
        if (doDrift) { var dv = drift(el, bx, by, d.ph, DRIFT * scrollAmp); dx = dv[0]; dy = dv[1]; }
        // impulse: heavy ripple from each recent click, decaying over 3s
        var ix = 0, iy = 0;
        for (var k = 0; k < impulses.length; k++) {
          var imp = impulses[k], age = (t - imp.t0) / IMPULSE;
          if (age >= 1) continue;
          var vx = bx - imp.x, vy = by - imp.y, dist = Math.hypot(vx, vy) || 0.001;
          var pw = (span * 0.10) * push(dist, span * 0.45, age);
          ix += vx / dist * pw; iy += vy / dist * pw;
        }
        d.el.setAttribute("cx", (bx + dx + ix).toFixed(2));
        d.el.setAttribute("cy", (by + dy + iy).toFixed(2));
        d.el.setAttribute("r", rr.toFixed(2));
        d.el.setAttribute("opacity", (d.vis == null ? oo : oo * d.vis).toFixed(3));
      }
      while (impulses.length && (t - impulses[0].t0) > IMPULSE) impulses.shift();
      if (morph && mp >= 1) morph = null;
      raf = requestAnimationFrame(frame);
    }

    function start() { if (running || prefersReduced()) return; running = true; last = 0; t0 = now(); raf = requestAnimationFrame(frame); }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); }

    // pause offscreen
    var io = null;
    try {
      io = new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? start() : stop(); }); }, { threshold: 0.05 });
      io.observe(root);
    } catch (e) { start(); }

    // click -> impulse (map client coords to svg user units)
    function svgPoint(evt) {
      var rect = root.getBoundingClientRect();
      var vb = root.viewBox && root.viewBox.baseVal;
      var vw = vb && vb.width ? vb.width : rect.width, vh = vb && vb.height ? vb.height : rect.height;
      var ox = vb ? vb.x : 0, oy = vb ? vb.y : 0;
      return [ox + (evt.clientX - rect.left) / rect.width * vw, oy + (evt.clientY - rect.top) / rect.height * vh];
    }
    function onDown(evt) { var p = svgPoint(evt); impulses.push({ x: p[0], y: p[1], t0: now() }); if (!running) start(); }
    /* A click outside the drawing still reaches it when it lands within half the drawing's size of
       its edge, so a ripple in the page field carries on into the drawing beside it. */
    function onPage(cx, cy) {
      var rect = root.getBoundingClientRect(); if (!rect.width) return;
      if (cx >= rect.left && cx <= rect.right && cy >= rect.top && cy <= rect.bottom) return;   // its own handler took it
      var mx = rect.width / 2, my = rect.height / 2;
      if (cx < rect.left - mx || cx > rect.right + mx || cy < rect.top - my || cy > rect.bottom + my) return;
      onDown({ clientX: cx, clientY: cy });
    }
    // No cursor:pointer here. The impulse is a decorative ripple, not a
    // destination: setting the cursor made the whole diagram claim it was a link.
    if (doClick) { root.addEventListener("pointerdown", onDown); onImpulse(function (x, y) { if (alive) onPage(x, y); }); }
    var alive = true;

    if (prefersReduced()) { /* leave static resting frame */ }

    return {
      reconfigure: function (points) {
        if (!points || !points.length) return;
        for (var i = 0; i < N; i++) { var p = points[i % points.length]; D[i].mx = p[0]; D[i].my = p[1]; D[i].bx = D[i].x; D[i].by = D[i].y; }
        morph = { t0: now() }; if (!running) start();
      },
      setMode: function (m) { mode = m; },
      setScroll: function (v) { scrollAmp = 0.4 + clamp(v, 0, 1) * 1.0; },
      impulseAt: function (x, y) { impulses.push({ x: x, y: y, t0: now() }); if (!running) start(); },
      stop: function () { stop(); alive = false; if (io) io.disconnect(); if (doClick) root.removeEventListener("pointerdown", onDown); }
    };
  };
})();
