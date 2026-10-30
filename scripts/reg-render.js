/* hmm site - the register's markup, built from window.REG_INSTRUMENTS (data/reg_instruments.js).

   ONE BUILDER, TWO CALLERS (2026-10-30, handover item 7). register.js calls it in the browser,
   and scripts/build-register.mjs calls it in Node to write the same markup into register.html,
   so the page lists every instrument to a reader, a crawler or a fetch that runs no JavaScript.
   Until this date the markup existed only after register.js ran, and a plain fetch of the page
   returned an empty timeline. Because both callers run this one function, the static copy and
   the live render cannot drift; npm run check:register fails if the committed copy is stale.

   Market order is Japan, Australia, New Zealand on every surface (GP 2026-10-26), then the
   global rows. */
(function(root){
  function e2(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  function cTag(r){return '<span class="tl-c'+(r.global?' tl-c--global':'')+'">'+e2(r.c)+'</span>';}
  function row(r){return '<div class="tl-row u-panel tl-'+r.type+(r.global?' tl-global':'')+'" data-c="'+e2(r.c)+'">'+cTag(r)+'<span class="tl-date">'+e2(r.date)+'</span><span class="tl-name">'+e2(r.name)+'</span><span class="tl-org">'+e2(r.body)+'</span><span class="tl-status tl-st--'+r.status+'">'+e2(r.status)+'</span></div>';}
  var MKT={JP:0,AU:1,NZ:2};function mk(r){return r.global?9:(r.c in MKT?MKT[r.c]:5);}
  function render(list){
    var byYear={};list.forEach(function(r){(byYear[r.yr]=byYear[r.yr]||[]).push(r);});
    var html='';
    // standing base (pre-2020), compact
    var standing=list.filter(function(r){return r.yr<2020;}).sort(function(a,b){return a.yr-b.yr||mk(a)-mk(b);});
    if(standing.length){var items=standing.map(function(r){return '<span class="tl-stand-item u-panel tl-'+r.type+(r.global?' tl-global':'')+'" data-c="'+e2(r.c)+'">'+cTag(r)+e2(r.name)+'</span>';}).join('');
      html+='<div class="tl-year tl-standing"><div class="tl-axis"><span class="tl-node"></span><span class="tl-y">pre-2020</span></div><div class="tl-rows"><div class="tl-stand-label">Standing · the established base</div><div class="tl-stand-wrap">'+items+'</div></div></div>';}
    // the net-new tick, 2020-2030
    for(var y=2020;y<=2030;y++){var future=y>=2027,rows=(byYear[y]||[]).slice().sort(function(a,b){return mk(a)-mk(b);});
      html+='<div class="tl-year'+(future?' tl-future':'')+'"><div class="tl-axis"><span class="tl-node"></span><span class="tl-y">'+y+'</span></div><div class="tl-rows">'+(rows.length?rows.map(row).join(''):'<div class="tl-empty">·</div>')+'</div></div>';}
    return html;
  }
  root.REG_RENDER=render;
})(typeof window!=='undefined'?window:globalThis);
