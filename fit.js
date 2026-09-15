/* hmm site - S1 THE FIT BREAKS INTO DOTS ON SCROLL (GP 2026-09-15: "The intro prose should
   break into dots on scroll").

   AT REST THE PARAGRAPHS ARE REAL TEXT. They stay in the DOM, selectable, read by a screen
   reader and by scripts/dump-served-text.mjs; nothing here touches their content. What is
   added is one <svg> overlay the size of the section, aria-hidden, pointer-events none, whose
   circles sit exactly on the glyph pixels of the three paragraphs.

   HOW THE GLYPHS BECOME DOTS. Every word of the section is drawn once onto an offscreen canvas
   at the position the browser laid it out at, read back through a Range rect per word, in the
   paragraph's own computed font and colour. The canvas alpha is then sampled on a square pitch:
   a sample over ink becomes a circle, and the alpha it lands on becomes the circle's opacity,
   so the lead paragraph's dots carry its full pearl and the two body paragraphs' dots carry the
   muted role's own alpha, read off the rendered colour rather than typed. The pitch opens until
   the count sits under the cap, so the sample can never outgrow what the engine already
   breathes on the hero (5,005 circles across the three machines). Re-sampled on a width change
   only; a height-only change is a phone's address bar and would re-sample on every scroll.

   ONE ENGINE. The circles are handed to window.hmmAnimateDots, which breathes and drifts them
   the way it does the machines and the market dots. This file runs no frame loop: a scroll
   schedules one frame through requestAnimationFrame, the way morph.js does. That frame reads
   the section's position once, then writes a transform and a fill-opacity on each dot whose
   own progress has moved: a dot leaves its glyph home on the engine's ease-in-out cubic (the
   easeWeight curve in hmm-motion.js, reproduced below because the engine does not export it),
   at a moment staggered by its phase the way morph.js staggers the flock, downward and to one
   side the way the flock leaves the hero, and thins to nothing as it goes. Scrolling back
   reverses it, because every position is a function of scroll and of nothing else. The
   engine's setScroll raises the breath and the drift with progress, so the field wakes as it
   breaks.

   WHY THE MATH IS HERE AND NOT IN THE STYLESHEET. A first cut resolved the flight in CSS, with
   the progress as a custom property on the section and the easing as a calc() chain on every
   circle. Measured in headless Chromium against the page without this file: the fit screen
   idled at 75 ms a frame where the hero, with more than twice the circles, idled at 16.7. The
   engine sets four presentation attributes on every circle thirty times a second, each set
   restyles that circle, and each restyle re-expanded the chain, so the page paid for the
   dissolve while nothing dissolved. An inline transform costs the restyle nothing, and a dot
   at rest or arrived is not written at all.

   NO WORK OFF SCREEN. At progress 0 the overlay is display:none, so the engine's own observer
   holds its loop and the first screen costs what it cost before this file. The section's
   IntersectionObserver gates the scroll handler, and the engine pauses itself the same way.
   Reduced motion: nothing is built and the text stays. No colour literal: the dot fill is the
   lead paragraph's rendered colour, re-read on a theme flip, and the mask is drawn in each
   paragraph's rendered colour. */
(function () {
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var sec = document.getElementById('mandate');
  if (!sec || !window.hmmAnimateDots || !document.createRange) return;

  var NS = 'http://www.w3.org/2000/svg';
  var CAP_DESK = 2000, CAP_PHONE = 1200;   // dots; the hero row breathes 5,005 on the same engine
  /* read at build, never at load: a pane that lays out late reports no width at load, and a
     cap captured then would give a desktop the phone's count */
  function cap() { return innerWidth < 768 ? CAP_PHONE : CAP_DESK; }
  var PITCH = 3;                   // CSS px between samples before the cap opens it
  var INK = 90;                    // of 255: an alpha at or above this is ink, not an anti-aliased edge
  var SPREAD = 160;                // px of lateral drift at most, bounded by the section edge
  var STAG = 0.62;                 // morph.js's departure spread: dots peel off in waves over the scroll
  var TEXT_GONE = 0.30;            // progress at which the text has faded out
  var DOTS_IN = 0.10;              // progress at which the dots are fully lit
  var SPAN = 0.90;                 // the flight completes when this much of the section has scrolled by
  var JITTER = 2 / 3;              // of the pitch: the sample point wanders so the dots read as a field, not a grid

  var svg = null, ctl = null, builtW = 0, visible = true, p = -1;
  var N = 0, DOTS = [], K = null, DX = null, DY = null, E = null;   // per-dot phase, flight vector, last written ease

  function seededRnd(s) { return function () { s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
  function cl01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ss(a, b, x) { var t = cl01((x - a) / (b - a)); return t * t * (3 - 2 * t); }
  /* the engine's easeWeight, cubic-bezier(0.65,0,0.35,1) approximated as ease-in-out cubic */
  function easeWeight(t) { t = cl01(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function paras() { return [].slice.call(sec.querySelectorAll('p')); }
  function fillOf() { var lead = sec.querySelector('.through-lead') || paras()[0]; return lead ? getComputedStyle(lead).color : ''; }

  /* every word, at the rect the browser gave it */
  function eachWord(P, fn) {
    var tw = document.createTreeWalker(P, NodeFilter.SHOW_TEXT), n, rg = document.createRange();
    while ((n = tw.nextNode())) {
      var s = n.nodeValue, re = /\S+/g, m;
      while ((m = re.exec(s))) {
        rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length);
        var r = rg.getClientRects()[0];
        if (r && r.width) fn(m[0], r);
      }
    }
  }

  /* the section's text as an alpha mask, in section coordinates at 1 CSS px */
  function mask(rect) {
    var cv = document.createElement('canvas');
    cv.width = Math.max(1, Math.ceil(rect.width)); cv.height = Math.max(1, Math.ceil(rect.height));
    var ctx = cv.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.textBaseline = 'alphabetic';
    paras().forEach(function (P) {
      var cs = getComputedStyle(P);
      ctx.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
      if ('letterSpacing' in ctx) ctx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing;
      ctx.fillStyle = cs.color;
      eachWord(P, function (w, r) {
        var mt = ctx.measureText(w), asc = mt.fontBoundingBoxAscent;
        if (!asc) asc = r.height * 0.8;
        ctx.fillText(w, r.left - rect.left, r.top - rect.top + asc);
      });
    });
    return ctx.getImageData(0, 0, cv.width, cv.height);
  }

  /* sample the mask on a square pitch with a little jitter; returns [x, y, alpha] per hit */
  function sample(img, pitch) {
    var w = img.width, h = img.height, d = img.data, rnd = seededRnd(19), out = [];
    for (var y = pitch / 2; y < h; y += pitch) {
      for (var x = pitch / 2; x < w; x += pitch) {
        var jx = Math.min(w - 1, Math.max(0, Math.round(x + (rnd() - 0.5) * pitch * JITTER)));
        var jy = Math.min(h - 1, Math.max(0, Math.round(y + (rnd() - 0.5) * pitch * JITTER)));
        var a = d[(jy * w + jx) * 4 + 3];
        if (a >= INK) out.push([jx, jy, a]);
      }
    }
    return out;
  }

  function teardown() {
    if (ctl) { ctl.stop(); ctl = null; }
    if (svg) { svg.parentNode && svg.parentNode.removeChild(svg); svg = null; }
    sec.classList.remove('fit-live');
    sec.style.removeProperty('--fit-text');
    N = 0; DOTS = []; K = DX = DY = E = null;
  }

  function build() {
    teardown();
    builtW = innerWidth;
    var rect = sec.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    var img = mask(rect);
    if (!img) return;
    var CAP = cap(), pitch = PITCH, pts = sample(img, pitch), guard = 0;
    while (pts.length > CAP && guard++ < 8) {
      pitch = Math.ceil(pitch * Math.sqrt(pts.length / CAP) * 10) / 10;
      pts = sample(img, pitch);
    }
    if (!pts.length) return;

    var W = img.width, H = img.height, rnd = seededRnd(23);
    N = pts.length; DOTS = new Array(N);
    K = new Float32Array(N); DX = new Float32Array(N); DY = new Float32Array(N); E = new Float32Array(N);
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'fit-dots fit-rest');
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('fill', fillOf());
    svg.setAttribute('data-pitch', String(pitch));
    var frag = document.createDocumentFragment();
    for (var i = 0; i < N; i++) {
      var q = rnd(), k = ((i * 2654435761) % 1000) / 1000, k2 = ((i * 40503) % 1000) / 1000;
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', pts[i][0]); c.setAttribute('cy', pts[i][1]);
      c.setAttribute('r', q < 0.16 ? 2.0 : q < 0.5 ? 1.4 : 1.0);           // the machines' big-layer weights
      c.setAttribute('opacity', Math.min(1, pts[i][2] / 255).toFixed(2));   // the paragraph's own alpha
      /* flight: downward, the way the flock leaves the hero, by a third to the whole of the
         section's height; sideways by up to SPREAD, bounded so no dot leaves the section box */
      var room = Math.min(SPREAD, pts[i][0], W - pts[i][0]);
      K[i] = k; DX[i] = (k2 < 0.5 ? 1 : -1) * (0.5 + k) * room; DY[i] = (0.35 + 0.65 * k2) * H; E[i] = 0;
      DOTS[i] = c;
      frag.appendChild(c);
    }
    svg.appendChild(frag);
    sec.appendChild(svg);
    sec.classList.add('fit-live');
    ctl = window.hmmAnimateDots(svg, { mode: 'breath', click: false, fps: 30 });
    p = -1;
    frame();
  }

  /* progress through the section, from its top reaching the viewport top to SPAN of it gone.
     One rect read, then writes only: the paragraphs' opacity, the overlay's, and each dot that
     has moved since the last frame. A dot still waiting (ease 0) or already gone (ease 1)
     costs nothing. */
  function frame() {
    if (!svg) return;
    var r = sec.getBoundingClientRect();
    var np = cl01(-r.top / Math.max(1, r.height * SPAN));
    if (np === p) return;
    p = np;
    sec.style.setProperty('--fit-text', (1 - ss(0, TEXT_GONE, p)).toFixed(3));
    svg.classList.toggle('fit-rest', p <= 0);
    svg.style.opacity = ss(0, DOTS_IN, p).toFixed(3);
    for (var i = 0; i < N; i++) {
      var e = easeWeight((p - K[i] * STAG) / (1 - STAG));
      if (Math.abs(e - E[i]) < 0.002 && (e > 0 || E[i] === 0)) continue;
      E[i] = e;
      var st = DOTS[i].style;
      if (e <= 0) { st.transform = ''; st.fillOpacity = ''; }
      else { st.transform = 'translate(' + (DX[i] * e).toFixed(1) + 'px,' + (DY[i] * e).toFixed(1) + 'px)'; st.fillOpacity = (1 - e).toFixed(3); }
    }
    if (ctl) ctl.setScroll(p);
  }
  var queued = false;
  function schedule() {
    if (queued || !visible || document.hidden) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; frame(); });
  }

  try {
    new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) visible = es[i].isIntersecting;
      if (visible) schedule();
    }, { threshold: 0 }).observe(sec);
  } catch (e) { visible = true; }

  addEventListener('scroll', schedule, { passive: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) schedule(); });
  var rt = 0;
  addEventListener('resize', function () {
    if (innerWidth === builtW) return;   // a height-only change is the address bar, not a relayout
    clearTimeout(rt); rt = setTimeout(build, 180);
  });
  __onTheme(function () { if (svg) svg.setAttribute('fill', fillOf()); });

  function boot() {
    var ready = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    ready.then(build, build);
  }
  if (document.readyState === 'complete') boot(); else addEventListener('load', boot);

  /* the count, the pitch and the progress, for the browser check and the record */
  window.hmmFitDissolve = {
    count: function () { return N; },
    pitch: function () { return svg ? +svg.getAttribute('data-pitch') : 0; },
    progress: function () { return p; }
  };
})();
