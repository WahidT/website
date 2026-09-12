/* Machine-drawing audit for machines.js. Static: it evaluates the module against a
   recording stub of hmmH, so it needs no browser and can run in the Netlify build.

   Four regressions are already behind these assertions.

   A cropped icon that did not crop. iconVB names a crop, and the icon SVG carried
   overflow:visible, which paints the whole drawing outside its own viewBox. overflow clips
   to the ELEMENT box, never to the viewBox, so wherever a mount's aspect differs from the
   crop's the rest of the machine simply lands in the letterbox beside it, and no parent
   overflow:hidden takes it back. It went unseen for three machines because each of their
   crops happened to enclose its whole body; the cell, cropped to one of three views, showed
   all three. The crop is now a clipPath on the dots, and CROP below checks the wiring.

   An empty layer. A builder pushed {pts:[]} through a ternary left in mid-edit. It drew
   nothing and cost nothing, which is exactly why it would have stayed.

   A colour literal inside a builder. Geometry names colour only through the four col tags;
   a literal there escapes both the token pipeline and the theme flip, and an rgb() triple
   is how a retired evergreen survived a hex sweep elsewhere on this estate.

   A callout pointing off the drawing. An anchor or a box outside vb is invisible at every
   viewport and reviewable at none.

   Usage: node scripts/check-machines.mjs      (exit 1 on any failure) */
import { readFileSync } from 'node:fs';

const SRC = readFileSync('machines.js', 'utf8');
const COLS = new Set(['PEARL', 'ACC', 'FAINT', 'AXIS']);
/* the callout box, as Blowout lays it out */
const BW = 232, BH = 84, MARGIN = 24;

let bad = 0;
const line = (ok, s) => { if (!ok) bad++; console.log(`${ok ? 'ok  ' : 'FAIL'}  ${s}`); };

/* ---- 1. no colour literal inside a builder ---------------------------------------- */
const COLOUR = /#[0-9a-fA-F]{3,8}\b|\brgba?\(/g;
for (const m of SRC.matchAll(/var (build\w+) = \(function\(\)\{/g)) {
  const start = m.index;
  const end = SRC.indexOf('\n  })();', start);
  const body = SRC.slice(start, end < 0 ? SRC.length : end);
  const hits = [...body.matchAll(COLOUR)].map(h => h[0]);
  line(hits.length === 0, `${m[1]} names no colour literal${hits.length ? `: ${hits.join(', ')}` : ''}`);
}

/* ---- 2. evaluate the module against a recording stub ------------------------------ */
const node = (tag, props, ...kids) => ({
  tag, props: props || {},
  kids: kids.flat(Infinity).filter(k => k != null && k !== false && k !== true),
});
const flat = el => [el, ...(el.kids || []).flatMap(flat)];
let captured = null;
globalThis.window = { hmmH: node };
globalThis.hmmH = node;
globalThis.hmmRender = (mount, el) => { captured = el; };
globalThis.__T = (name, fallback) => fallback;
globalThis.__onTheme = () => () => {};
globalThis.getComputedStyle = () => ({ getPropertyValue: () => '' });
globalThis.document = { documentElement: {} };
const mount = { querySelector: () => null, replaceChildren: () => {} };

/* the builders are closured, so reach them the way the module does: record the layer list each
   one returns by wrapping MACH's build entries through the public render path. */
const LAYERS = {};
const patched = SRC.replace(
  '  function dotsOf(kind){',
  '  window.__layers=function(k){return MACH[k].build();};\n  window.__mach=function(k){return MACH[k];};\n  window.__kinds=function(){return Object.keys(MACH);};\n  function dotsOf(kind){');
const HMM = new Function(patched + '\n return HMM;')();
const kinds = window.__kinds();
line(kinds.length >= 6, `MACH declares ${kinds.length} machines: ${kinds.join(', ')}`);

for (const kind of kinds) {
  const spec = window.__mach(kind);
  const layers = window.__layers(kind);
  LAYERS[kind] = layers;
  const vb = spec.vb, icon = String(spec.iconVB).trim().split(/\s+/).map(Number);

  /* ---- 3. layer tags, and no empty layer ---------------------------------------- */
  const wrongCol = layers.filter(L => !COLS.has(L.col)).map(L => L.col);
  line(wrongCol.length === 0, `${kind}: every layer is tagged PEARL/ACC/FAINT/AXIS${wrongCol.length ? ` (saw ${wrongCol.join(', ')})` : ''}`);
  const empty = layers.filter(L => !L.pts || !L.pts.length).length;
  line(empty === 0, `${kind}: no empty layer${empty ? ` (${empty} of ${layers.length} draw nothing)` : ''}`);
  const acc = layers.filter(L => L.col === 'ACC');
  line(acc.length === 1, `${kind}: exactly one ACC layer, the load-bearing part (saw ${acc.length})`);

  /* ---- 4. the geometry sits inside its own viewBox ------------------------------- */
  const pts = layers.flatMap(L => L.pts);
  const out = pts.filter(p => p[0] < vb[0] || p[0] > vb[0] + vb[2] || p[1] < vb[1] || p[1] > vb[1] + vb[3]);
  line(out.length === 0, `${kind}: every point inside vb ${vb.join(' ')}${out.length ? ` (${out.length} outside)` : ''}`);

  /* ---- 5. the crop is inside the drawing, and holds the ACC part ----------------- */
  line(icon.length === 4 && icon.every(Number.isFinite), `${kind}: iconVB parses (${spec.iconVB})`);
  const inCrop = p => p[0] >= icon[0] && p[0] <= icon[0] + icon[2] && p[1] >= icon[1] && p[1] <= icon[1] + icon[3];
  const accIn = acc.length ? acc[0].pts.filter(inCrop).length : 0;
  line(accIn > 0, `${kind}: the crop holds ${accIn} of the ACC layer's ${acc.length ? acc[0].pts.length : 0} points`);

  /* ---- 6. the crop is enforced by a clipPath, not by overflow -------------------- */
  captured = null;
  HMM.renderIcon(mount, kind);
  const els = flat(captured);
  const clip = els.find(e => e.tag === 'clipPath');
  const rect = clip && clip.kids.find(e => e.tag === 'rect');
  const g = els.find(e => e.tag === 'g' && typeof e.props.clipPath === 'string');
  const fits = rect && +rect.props.x === icon[0] && +rect.props.y === icon[1]
    && +rect.props.width === icon[2] && +rect.props.height === icon[3];
  line(!!clip && !!rect && !!g, `${kind}: the icon clips its dots with a clipPath`);
  line(!!fits, `${kind}: the clip rect is exactly iconVB`);
  line(!!g && g.props.clipPath === `url(#${clip && clip.props.id})`, `${kind}: the clipped group references that clipPath`);
  const dots = els.filter(e => e.tag === 'circle').length;
  line(dots > 100, `${kind}: the icon draws ${dots} dots`);

  /* ---- 7. callouts land on the drawing ------------------------------------------ */
  captured = null;
  HMM.renderBlowout(mount, kind);
  const bels = flat(captured);
  line(bels.filter(e => e.tag === 'circle').length > 100, `${kind}: the blow-out draws its dots`);
  const groups = bels.filter(e => e.tag === 'g' && /callout/.test(e.props.className || ''));
  line(groups.length === spec.call.length, `${kind}: ${groups.length} callout groups for ${spec.call.length} callouts`);
  spec.call.forEach(c => {
    const [idx, title, , p, side, by] = c;
    const bx = side === 'L' ? MARGIN : vb[2] - MARGIN - BW;
    const okAnchor = p[0] >= vb[0] && p[0] <= vb[0] + vb[2] && p[1] >= vb[1] && p[1] <= vb[1] + vb[3];
    const okBox = by >= vb[1] && by + BH <= vb[1] + vb[3] && bx >= vb[0] && bx + BW <= vb[0] + vb[2];
    line(okAnchor && okBox, `${kind} ${idx} ${title}: anchor ${p.join(',')} and box at y ${by} are inside the drawing`);
  });
  /* two callout boxes on the same side may not overlap: the far one is then unreadable */
  ['L', 'R'].forEach(side => {
    const ys = spec.call.filter(c => c[4] === side).map(c => c[5]).sort((a, b) => a - b);
    const clash = ys.some((y, i) => i && y - ys[i - 1] < BH);
    line(!clash, `${kind}: the ${side} callout boxes do not overlap (y ${ys.join(', ')})`);
  });
}

console.log(bad ? `\n${bad} check(s) failed in machines.js.`
                : '\nevery machine draws inside its viewBox, crops with a clipPath, tags every layer, and lands every callout.');
process.exit(bad ? 1 : 0);
