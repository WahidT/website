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
     The counts are still drawn and still guarded: the market bars print 13, 11 and 7 over
     a denominator of 31, from data/market_strength.js, which check-register-figures.mjs
     reconciles against data/reg_instruments.js on every deploy. */
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
  // click-to-explode on the timeline spine: nodes scatter from the click point, then spring home
  (function(){
    var reduceM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches; if(reduceM) return;
    var nodes=[].slice.call(body.querySelectorAll('.tl-node')).map(function(n){return {n:n,x:0,y:0,vx:0,vy:0};});
    if(!nodes.length) return;
    var running=false;
    function frame(){
      var active=false;
      for(var i=0;i<nodes.length;i++){var d=nodes[i];
        d.vx=(d.vx - d.x*0.13)*0.83; d.vy=(d.vy - d.y*0.13)*0.83;
        d.x+=d.vx; d.y+=d.vy;
        d.n.style.transform='translate('+d.x.toFixed(1)+'px,'+d.y.toFixed(1)+'px)';
        if(Math.abs(d.vx)+Math.abs(d.vy)>0.06||Math.abs(d.x)+Math.abs(d.y)>0.5) active=true;
      }
      if(active){ requestAnimationFrame(frame); }
      else { for(var j=0;j<nodes.length;j++){var e=nodes[j];e.n.style.transform='';e.n.style.animation='';e.x=e.y=e.vx=e.vy=0;} running=false; }
    }
    // Deliberately no cursor:pointer on the body. This handler scatters the
    // year nodes for delight; it is not a promise the 58 rows inside can be
    // clicked, and setting the cursor here told every one of them otherwise.
    body.addEventListener('click',function(ev){
      for(var i=0;i<nodes.length;i++){var d=nodes[i];
        d.n.style.animation='none';                       // CSS pulse would override our transform; pause it
        var r=d.n.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2;
        var dx=cx-ev.clientX, dy=cy-ev.clientY, dist=Math.sqrt(dx*dx+dy*dy), ux, uy;
        if(dist<2){var a=Math.random()*6.283;ux=Math.cos(a);uy=Math.sin(a);dist=2;}else{ux=dx/dist;uy=dy/dist;}
        var force=9+420/(dist+34);
        d.vx+=ux*force*(0.6+Math.random()*0.8)+(Math.random()-0.5)*8;
        d.vy+=uy*force*(0.6+Math.random()*0.8)+(Math.random()-0.5)*8;
      }
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
  function layoutSpine(){var h=body.offsetHeight,w=14,g=15,s='';for(var y=7;y<h;y+=g){s+='<circle cx="'+(w/2)+'" cy="'+y+'" r="1.4" fill="rgba(242,236,201,0.5)"/>';}
    spine.setAttribute('width',w);spine.setAttribute('height',h);spine.setAttribute('viewBox','0 0 '+w+' '+h);spine.style.width=w+'px';spine.style.height=h+'px';spine.innerHTML=s;}
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
