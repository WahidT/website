/* hmm site - the register page (register.html).

   The enacted-instrument timeline, moved here from sections.js on 2026-10-21 under the
   clarity build plan, phase 2: at 390px it made the gate section 6,633px of a 15,660px
   thesis page. The block is unchanged apart from its filter scope, which was #s6 and is
   now #register. It reads window.REG_INSTRUMENTS from data/reg_instruments.js, which
   loads before it on this page and no longer loads on the thesis page. */
(function(){var body=document.getElementById('tlBody');if(!body||!window.REG_INSTRUMENTS)return;
  function e2(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  // lead sentence counts derive from the register. In force is REG_IN_FORCE, defined once in data/reg_instruments.js and shared with scripts/check-register-figures.mjs.
  // The since-2020 count reads op, the operative year, never yr, which is a timeline position (see the field note in data/reg_instruments.js).
  /* The enacted-record sentence was removed on 2026-09-15 (GP). The block that wrote it
     from the live register went with it, and so did its build guard, because a checker
     pointed at a target that no longer exists reports clean and that is its worst output.
     The market bars that drew the per-market counts left with their section on 2026-10-21. */
  var byYear={};REG_INSTRUMENTS.forEach(function(r){(byYear[r.yr]=byYear[r.yr]||[]).push(r);});
  function cTag(r){return '<span class="tl-c'+(r.global?' tl-c--global':'')+'">'+e2(r.c)+'</span>';}
  function row(r){return '<div class="tl-row u-panel tl-'+r.type+(r.global?' tl-global':'')+'" data-c="'+e2(r.c)+'">'+cTag(r)+'<span class="tl-date">'+e2(r.date)+'</span><span class="tl-name">'+e2(r.name)+'</span><span class="tl-org">'+e2(r.body)+'</span><span class="tl-status tl-st--'+r.status+'">'+e2(r.status)+'</span></div>';}
  var html='';
  // standing base (pre-2020), compact
  var standing=REG_INSTRUMENTS.filter(function(r){return r.yr<2020;}).sort(function(a,b){return a.yr-b.yr;});
  if(standing.length){var items=standing.map(function(r){return '<span class="tl-stand-item u-panel tl-'+r.type+(r.global?' tl-global':'')+'" data-c="'+e2(r.c)+'">'+cTag(r)+e2(r.name)+'</span>';}).join('');
    html+='<div class="tl-year tl-standing"><div class="tl-axis"><span class="tl-node"></span><span class="tl-y">pre-2020</span></div><div class="tl-rows"><div class="tl-stand-label">Standing · the established base</div><div class="tl-stand-wrap">'+items+'</div></div></div>';}
  // the net-new tick, 2020-2030
  for(var y=2020;y<=2030;y++){var future=y>=2027,rows=(byYear[y]||[]).slice().sort(function(a,b){return (a.global?1:0)-(b.global?1:0);});
    html+='<div class="tl-year'+(future?' tl-future':'')+'"><div class="tl-axis"><span class="tl-node"></span><span class="tl-y">'+y+'</span></div><div class="tl-rows">'+(rows.length?rows.map(row).join(''):'<div class="tl-empty">·</div>')+'</div></div>';}
  body.innerHTML=html;
  /* click-to-scatter on the timeline. ONE ENGINE (2026-10-26): the year nodes are pushed by the
     same impulse that ripples the page field and the drawings, HMM_MOTION.push over the engine's
     3s weighted decay, from any click on the page within reach of the timeline. The spring this
     replaced was the register's own physics. */
  (function(){
    var M=window.HMM_MOTION; if(!M||M.prefersReduced()) return;
    var nodes=[].slice.call(body.querySelectorAll('.tl-node')).map(function(n){return {n:n,cx:0,cy:0};});
    if(!nodes.length) return;
    var impulses=[], running=false, REACH=420, STRENGTH=60;
    function frame(){
      var t=M.now();
      while(impulses.length&&(t-impulses[0].t0)>M.IMPULSE)impulses.shift();
      for(var i=0;i<nodes.length;i++){var d=nodes[i],ox=0,oy=0;
        for(var k=0;k<impulses.length;k++){var im=impulses[k],ux=d.cx-im.x,uy=d.cy-im.y,dist=Math.hypot(ux,uy)||0.001;
          var pw=STRENGTH*M.push(dist,REACH,(t-im.t0)/M.IMPULSE);ox+=ux/dist*pw;oy+=uy/dist*pw;}
        d.n.style.transform=(ox||oy)?'translate('+ox.toFixed(1)+'px,'+oy.toFixed(1)+'px)':'';
      }
      if(impulses.length){requestAnimationFrame(frame);}
      else{for(var j=0;j<nodes.length;j++)nodes[j].n.style.animation='';running=false;}
    }
    M.onImpulse(function(x,y){
      var br=body.getBoundingClientRect(); if(y<br.top-REACH||y>br.bottom+REACH) return;
      for(var i=0;i<nodes.length;i++){var d=nodes[i];
        d.n.style.animation='none';                       // the CSS pulse would override the transform; pause it
        d.n.style.transform='';var r=d.n.getBoundingClientRect();d.cx=r.left+r.width/2;d.cy=r.top+r.height/2;}
      impulses.push({x:x,y:y,t0:M.now()});
      if(!running){running=true;requestAnimationFrame(frame);}
    });
  })();
  // load-more-on-scroll: each year group starts hidden and reveals as it enters the viewport
  var years=body.querySelectorAll('.tl-year');
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduce&&'IntersectionObserver' in window){
    years.forEach(function(y){y.classList.add('pre');});
    var io=new IntersectionObserver(function(ents){ents.forEach(function(en){if(en.isIntersecting){en.target.classList.remove('pre');en.target.classList.add('show');io.unobserve(en.target);if(window.__layoutSpine)window.__layoutSpine();}});},{rootMargin:'0px 0px -14% 0px',threshold:0.12});
    years.forEach(function(y){io.observe(y);});
  }
  // dotted spine, built here
  var NS='http://www.w3.org/2000/svg', spine=document.createElementNS(NS,'svg');
  spine.setAttribute('class','tl-spine'); spine.setAttribute('aria-hidden','true');
  body.style.position='relative'; body.appendChild(spine);
  // offsetHeight, not scrollHeight: scrollHeight counts the spine's own box and the
  // translateY(30px) that .tl-year.pre carries before it reveals, so measuring it
  // left the rail hanging past the end of the timeline it annotates.
  /* the spine's dots breathe on the engine (scripts/hmm-motion.js) like every other dot on the site;
     a relayout redraws them, so the old controller is stopped and a new one attached */
  var spineCtl=null;
  function layoutSpine(){var h=body.offsetHeight,w=14,g=15,s='',P=window.HMM_MOTION?window.HMM_MOTION.nec('pearl'):[242,236,201];
    for(var y=7;y<h;y+=g){s+='<circle cx="'+(w/2)+'" cy="'+y+'" r="1.4" fill="rgb('+P.join(',')+')" opacity="0.5"/>';}
    if(spineCtl){spineCtl.stop();spineCtl=null;}
    spine.setAttribute('width',w);spine.setAttribute('height',h);spine.setAttribute('viewBox','0 0 '+w+' '+h);spine.style.width=w+'px';spine.style.height=h+'px';spine.innerHTML=s;
    if(window.hmmAnimateDots)spineCtl=window.hmmAnimateDots(spine,{mode:'breath',click:false,driftAmp:1});}
  window.__layoutSpine=layoutSpine;
  layoutSpine();
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(layoutSpine);
  addEventListener('load',layoutSpine);
  addEventListener('resize',function(){clearTimeout(window.__spineRT);window.__spineRT=setTimeout(layoutSpine,200);});
  /* R-D29, 2026-09-14: the Gulf entry left this list with its register row. The `present`
   gate below would already hide the button, and the name goes too, so the list cannot
   carry a banned geography waiting for a row to come back. */
  var FILTERS=[['all','All'],['inmarket','In-market'],['AU','AU'],['JP','JP'],['NZ','NZ'],['AMER','AMER'],['CA','Canada'],['EU','EU'],['UKI','UKI'],['GL','Global']];
  var present={};REG_INSTRUMENTS.forEach(function(r){present[r.c]=1;});
  var fbar=document.getElementById('tlFilters');
  function applyFilter(f){
    document.querySelectorAll('#register .tl-row, #register .tl-stand-item').forEach(function(el){var c=el.getAttribute('data-c');var show=f==='all'||(f==='inmarket'?(c==='AU'||c==='JP'||c==='NZ'):c===f);el.classList.toggle('tl-hidden',!show);});
    document.querySelectorAll('#register .tl-year').forEach(function(y){var vis=y.querySelectorAll('.tl-row:not(.tl-hidden), .tl-stand-item:not(.tl-hidden)').length;y.classList.toggle('tl-hidden',f!=='all'&&vis===0);});
    fbar.querySelectorAll('button').forEach(function(b){var on=b.getAttribute('data-f')===f;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');});
    if(window.__layoutSpine)window.__layoutSpine();
  }
  if(fbar){FILTERS.forEach(function(fl){if(fl[0]==='all'||fl[0]==='inmarket'||present[fl[0]]){var b=document.createElement('button');b.type='button';b.className='u-control';b.textContent=fl[1];b.setAttribute('data-f',fl[0]);b.setAttribute('aria-pressed','false');b.onclick=function(){applyFilter(fl[0]);};fbar.appendChild(b);}});applyFilter('all');}
})();
