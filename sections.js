/* hmm site - the page script. What index.html carried inline until 2026-09-07: the hero
   ledgers and machines, the three necessity sections and their schematics, the S5 helix, the
   S7 timeline, and the section rail. Moved out so the Content-Security-Policy in _headers can
   drop unsafe-inline for scripts. Load order is unchanged: after machines.js, before
   transitions.js. */
/* Tokens, read at paint time. These figures hardcoded colour because
   nothing handed it to them; reading the custom property also means a theme
   change reaches the canvas, which a frozen hex never could. */
function __T(n, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(n);
  return (v && v.trim()) || fallback;
}

var h=window.hmmH;
/* ---------- hero: machines + ledgers + interactions ---------- */
var LEDGERS={
  power:[["Methane-pyrolysis reactors","F"],["Electrolysers (alkaline/PEM/SOEC)","F"],["Switchable multi-feedstock refinery reactors","N"],["Perovskite-silicon tandem cells","F"]],
  eat:[["Multispectral/hyperspectral cameras","F"],["LiDAR crop scanning","F"],["Spore/airborne-pathogen detectors","F"],["Biodegradable seed-planted sensor nodes","N"]],
  heal:[["Portable low-field MRI","F"],["Photon-counting CT detectors","F"],["Reconfigurable multi-modality imaging beds","N"],["Cartridge sample-to-answer molecular dx","F"]]
};
Object.keys(LEDGERS).forEach(function(nec){var ul=document.querySelector('.ledger[data-ledger="'+nec+'"]');LEDGERS[nec].forEach(function(r){var li=document.createElement('li');li.innerHTML='<span>'+r[0]+'</span>';ul.appendChild(li);});});
["power","eat","heal"].forEach(function(nec){HMM.renderIcon(document.querySelector('.machine[data-machine="'+nec+'"]'),nec);});

/* ---------- necessity section content ---------- */
var ACCENT={power:__T("--hmm-nec-power", "#FF730B"),eat:__T("--hmm-nec-eat", "#4F8A5B"),heal:__T("--hmm-nec-heal", "#8752A5")};
var SECCFG={
  power:{eyebrow:"Necessity 01 · Power",sub:"Distribution transformer · exploded",title:'The transformer, in <em>blow-out</em>',dwg:"hmm-NEC-01-D5",
    exEyebrow:"Why Power is a necessity",exTitle:"The energy system",
    exHTML:"The energy system is the process chain, or a subset of it, from the extraction of primary energy to the use of final energy to supply services and goods. hmm's mandate extends it to the critical-minerals layer that constrains that chain, because that is where the returnable innovation in energy materials sits.",
    sysEyebrow:"The power system · end to end",
    sysIntro:"One chain, resource to end use and back to recovery. hmm backs the whole system and picks no single stage of it; the return in energy materials concentrates in the critical-minerals layer beneath the chain.",},
  eat:{eyebrow:"Necessity 02 · Eat",sub:"Harvest mechanism · pickup reel",title:'The reel, in <em>blow-out</em>',dwg:"hmm-NEC-02-D5",
    exEyebrow:"Why Eat is a necessity",exTitle:"The food system",
    exHTML:"The food system gathers all the elements and activities relating to the production, processing, distribution, preparation and consumption of food, and the outputs of those activities. Its three constituent elements are <b>food supply chains, food environments and consumer behaviour</b>.",
    sysEyebrow:"The food system · end to end",
    sysIntro:"Seed to mouth, and back to the soil as nutrient. The advance that pays back sits in the field-autonomy layer, not in any one link of the chain.",},
  heal:{eyebrow:"Necessity 03 · Heal",sub:"Auto-injector · exploded",title:'The needle, in <em>blow-out</em>',dwg:"hmm-NEC-03-D5",
    exEyebrow:"Why Heal is a necessity",exTitle:"The health system",
    exHTML:"The health system is all <b>organizations, people and actions whose primary intent is to promote, restore or maintain health</b>. It is defined by intent rather than by chain, so it sits downstream of its determinants rather than containing them.",
    sysEyebrow:"The health system · end to end",
    sysIntro:"Discovery to recovery, one chain of care. Value concentrates at the diagnostic read-out, upstream where a returned life-year costs least.",}
};

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
// --- per-step model: derive schematic stages + reveal data from the *_STEPS files ---
function wrap2(s){var w=s.split(' ');if(w.length<2)return [s];var mid=Math.ceil(w.length/2);return [w.slice(0,mid).join(' '),w.slice(mid).join(' ')];}
function stagesFromSteps(S){return S.steps.map(function(st){var m=st.name.match(/\(([^)]+)\)/);var base=st.name.replace(/\s*\([^)]*\)/,'').trim();return {n:wrap2(base),key:st.name,note:m?m[1]:""};});}
function stepMap(S){var m={};S.steps.forEach(function(st){m[st.name]=st;});return m;}
[['power',window.POWER_STEPS],['eat',window.EAT_STEPS],['heal',window.HEAL_STEPS]].forEach(function(p){var S=p[1];if(!S)return;SECCFG[p[0]].stages=stagesFromSteps(S);SECCFG[p[0]].data=stepMap(S);SECCFG[p[0]].exHTML=S.definition.replace(/\s*It is a necessity because[^.]*\./,'');});
// plain-language definitions: name the system, where hmm invests, where returns concentrate. No shared template, fewer absolutes, conclusions attributed to hmm.
if(SECCFG.power) SECCFG.power.exHTML="Power is the energy system: a resource extracted, refined, generated, carried across the grid, used, and its materials recovered. hmm works one layer down, on the storage and the critical minerals that constrain every stage. That is where the returns have concentrated.";
if(SECCFG.eat) SECCFG.eat.exHTML="Eat is the food and farming system, crop and livestock in one cycle: grain feeds animals, manure feeds the soil. The cost pressure sits on nitrogen for crops and feed conversion for livestock. hmm backs the field-autonomy layer that bears on both.";
if(SECCFG.heal) SECCFG.heal.exHTML="Heal is the healthcare system, from prevention through diagnosis and treatment to end-of-life care. Its limits are regulatory and financial: what a regulator approves and what a payer reimburses. hmm's read is that the value sits upstream, at detection, where disease caught early costs least to treat.";

function Schematic(kind){var cfg=SECCFG[kind],S=cfg.stages,acc=ACCENT[kind];
  var LAB="rgba(242,236,201,.85)",LINE="rgba(242,236,201,.4)",BRD="rgba(242,236,201,.22)";
  var N=S.length,M=14,BW,BH,vbW,vbH,ctr=[],e=[],kc=0,RING=(kind==='eat');
  if(RING){
    // Eat is a closed cycle (seed to mouth to soil): boxes ride a ring, flow runs clockwise
    BW=96;BH=42;var rx=200,ry=158,CX=M+rx+BW/2,CY=M+ry+BH/2;vbW=2*M+2*rx+BW;vbH=2*M+2*ry+BH;
    var i;for(i=0;i<N;i++){var th=(-90+i*(360/N))*Math.PI/180;ctr.push({x:CX+rx*Math.cos(th),y:CY+ry*Math.sin(th)});}
    e.push(h("ellipse",{key:"ring",cx:CX,cy:CY,rx:rx,ry:ry,fill:"none",stroke:LINE,strokeWidth:1}));
    for(i=0;i<N;i++){var tm=(-90+(i+0.5)*(360/N))*Math.PI/180,ax=CX+rx*Math.cos(tm),ay=CY+ry*Math.sin(tm);
      var tx=-rx*Math.sin(tm),ty=ry*Math.cos(tm),tl=Math.hypot(tx,ty)||1,ux=tx/tl,uy=ty/tl,px=-uy,py=ux,s=4;
      e.push(h("polyline",{key:"rah"+i,points:(ax-ux*7+px*s)+","+(ay-uy*7+py*s)+" "+ax+","+ay+" "+(ax-ux*7-px*s)+","+(ay-uy*7-py*s),fill:"none",stroke:LINE,strokeWidth:1}));}
  }else if(kind==='heal'){
    // Heal is a one-way linear spine: prevention to end of life, no loop back
    BW=92;BH=34;var SX=60,stem=16,axisY=M+BH+stem;vbW=2*M+(N-1)*SX+BW;vbH=2*M+2*BH+2*stem;
    var x0h=M+BW/2,hi;
    for(hi=0;hi<N;hi++){var above=(hi%2===0);ctr.push({x:x0h+hi*SX,y:above?(axisY-stem-BH/2):(axisY+stem+BH/2),above:above});}
    e.push(h("line",{key:"axis",x1:M,y1:axisY,x2:vbW-M,y2:axisY,stroke:LINE,strokeWidth:1}));
    var ex=vbW-M,es=4.5;
    e.push(h("polyline",{key:"axah",points:(ex-8)+","+(axisY-es)+" "+ex+","+axisY+" "+(ex-8)+","+(axisY+es),fill:"none",stroke:LINE,strokeWidth:1}));
    for(hi=0;hi<N;hi++){var c=ctr[hi];e.push(h("line",{key:"stm"+hi,x1:c.x,y1:axisY,x2:c.x,y2:c.above?c.y+BH/2:c.y-BH/2,stroke:LINE,strokeWidth:1}));e.push(h("circle",{key:"nd"+hi,cx:c.x,cy:axisY,r:2.6,fill:acc}));}
  }else{
    // Power (and default): serpentine 2-row grid; Power closes with a recovery -> resource loop on the left
    var POW=(kind==='power'),LOOP=POW?26:0;
    BW=108;BH=48;var GX=16,GY=56,PR=Math.ceil(N/2);vbW=2*M+LOOP+(PR-1)*(BW+GX)+BW;vbH=2*M+2*BH+GY;
    var pos=function(i){return i<PR?{c:i,r:0}:{c:N-1-i,r:1};};
    var j;for(j=0;j<N;j++){var p=pos(j);ctr.push({x:M+LOOP+p.c*(BW+GX)+BW/2,y:M+p.r*(BH+GY)+BH/2,r:p.r,c:p.c});}
    for(j=0;j<N-1;j++){var a=ctr[j],b=ctr[j+1],x1,y1,x2,y2;
      if(a.r===b.r){if(a.c<b.c){x1=a.x+BW/2;x2=b.x-BW/2;}else{x1=a.x-BW/2;x2=b.x+BW/2;}y1=y2=a.y;}else{x1=x2=a.x;y1=a.y+BH/2;y2=b.y-BH/2;}
      e.push(h("line",{key:"l"+kc,x1:x1,y1:y1,x2:x2,y2:y2,stroke:LINE,strokeWidth:1}));
      var dx=x2-x1,dy=y2-y1,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,px=-uy,py=ux,s=4;
      e.push(h("polyline",{key:"ah"+kc,points:(x2-ux*7+px*s)+","+(y2-uy*7+py*s)+" "+x2+","+y2+" "+(x2-ux*7-px*s)+","+(y2-uy*7-py*s),fill:"none",stroke:LINE,strokeWidth:1}));kc++;}
    if(POW){var b0=ctr[0],bL=ctr[N-1],lx=M,laxx=b0.x-BW/2;
      e.push(h("path",{key:"loop",d:"M"+(bL.x-BW/2)+","+bL.y+" C"+lx+","+bL.y+" "+lx+","+b0.y+" "+laxx+","+b0.y,fill:"none",stroke:LINE,strokeWidth:1,strokeDasharray:"3 3"}));
      e.push(h("polyline",{key:"loopah",points:(laxx-7)+","+(b0.y-4)+" "+laxx+","+b0.y+" "+(laxx-7)+","+(b0.y+4),fill:"none",stroke:LINE,strokeWidth:1}));}
  }
  function xy(i){return {x:ctr[i].x-BW/2,y:ctr[i].y-BH/2};}
  S.forEach(function(s,i){var q=xy(i);
    var g=[h("rect",{key:"b",x:q.x,y:q.y,width:BW,height:BH,fill:"rgba(20,20,20,"+(RING?".92":".5")+")",stroke:BRD,strokeWidth:1}),h("text",{key:"num",x:q.x+7,y:q.y+12,fontFamily:"var(--hmm-font-mono)",fontSize:7,letterSpacing:.5,fill:"rgba(242,236,201,.42)",style:{pointerEvents:"none"}},(i+1<10?"0":"")+(i+1))];
    var ln=s.n,ly=q.y+BH/2-(ln.length-1)*6+3;
    ln.forEach(function(t,k){g.push(h("text",{key:"t"+k,x:q.x+BW/2,y:ly+k*12,textAnchor:"middle",fontFamily:"var(--hmm-font-mono)",fontSize:9,letterSpacing:.5,fill:LAB,style:{textTransform:"uppercase",pointerEvents:"none"}},t));});
    if(s.note)g.push(h("text",{key:"n",x:q.x+BW/2,y:q.y+BH+12,textAnchor:"middle",fontFamily:"var(--hmm-font-mono)",fontSize:7,letterSpacing:.4,fill:acc,style:{pointerEvents:"none"}},s.note));
    e.push(h("g",{key:"g"+i,className:"blk",tabIndex:0,role:"button","aria-label":s.key,"data-key":s.key,
      onClick:function(){showStage(kind,s.key);},onKeyDown:function(ev){if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();showStage(kind,s.key);}}},g));});
  var fw=vbW-4;
  e.unshift(h("rect",{key:"frame",x:2,y:2,width:fw,height:vbH-4,fill:"none",stroke:"rgba(242,236,201,.1)",strokeWidth:1}));
  [[2,2,9,9],[vbW-2,2,-9,9],[2,vbH-2,9,-9],[vbW-2,vbH-2,-9,-9]].forEach(function(t,ti){e.push(h("line",{key:"fa"+ti,x1:t[0],y1:t[1],x2:t[0]+t[2],y2:t[1],stroke:acc,strokeWidth:1}));e.push(h("line",{key:"fb"+ti,x1:t[0],y1:t[1],x2:t[0],y2:t[1]+t[3],stroke:acc,strokeWidth:1}));});
  return h("svg",{viewBox:"0 0 "+vbW+" "+vbH,role:"img","aria-label":cfg.exTitle+", end to end, as a block schematic"},e);
}

function showStage(kind,name){var cfg=SECCFG[kind],st=(cfg.data||{})[name];
  var sec=document.getElementById(kind);
  sec.querySelectorAll('.blk').forEach(function(g){g.classList.toggle('blk--active',g.getAttribute('data-key')===name);});
  var panel=sec.querySelector('.stage-panel');
  if(!st){panel.innerHTML='<div class="sp-name">'+esc(name)+'</div><div class="sp-facet"><div class="none">not surfaced</div></div>';return;}
  var ai=st.ai||{};
  panel.innerHTML='<div class="sp-name">'+esc((st.id?st.id+' · ':'')+st.name)+'</div>'
    +'<div class="sp-def">'+esc(st.def||'')+'</div>'
    +'<div class="sp-facet sp-ai"><div class="sp-label">AI</div><p>'+esc(ai.detail||'')+'</p></div>'
    +'<div class="sp-facet sp-reg"><div class="sp-label">Regulation · the gate</div><p>'+esc(st.reg||'')+'</p></div>';
}
function closeAll(){document.querySelectorAll('.nec').forEach(function(sec){sec.querySelectorAll('.blk--active').forEach(function(g){g.classList.remove('blk--active');});var p=sec.querySelector('.stage-panel');if(p)p.innerHTML='';});}
document.addEventListener('keydown',function(ev){if(ev.key==='Escape')closeAll();});
document.addEventListener('click',function(ev){if(!ev.target.closest('.blk')&&!ev.target.closest('.stage-panel'))closeAll();});

/* build each necessity section */
["power","eat","heal"].forEach(function(kind){var cfg=SECCFG[kind],sec=document.getElementById(kind);
  var fig=(cfg.dwg.match(/NEC-(\d+)/)||[])[1]||"0", TK='<span class="tk tk--tl"></span><span class="tk tk--tr"></span><span class="tk tk--bl"></span><span class="tk tk--br"></span>';
  sec.innerHTML=''
    +'<div class="stage"><div class="stage-head"><span class="stage-eyebrow">'+cfg.eyebrow+'</span></div>'
    +'<div class="machine-wrap"></div><div class="stage-foot">DWG '+cfg.dwg+'</div></div>'
    +'<div class="panel">'
    +'<div class="card">'+TK+'<div class="card-hdr"><span class="card-id">FIG '+fig+'.A</span><span class="card-eyebrow">'+cfg.exEyebrow+'</span></div><h2>'+cfg.exTitle+'</h2><p>'+cfg.exHTML+'</p><div class="card-foot"><span>'+cfg.dwg+'</span></div></div>'
    +'<div class="card">'+TK+'<div class="card-hdr"><span class="card-id">FIG '+fig+'.B</span><span class="card-eyebrow">'+cfg.sysEyebrow+'</span></div><div class="schematic-wrap"></div>'
    +'<div class="stage-panel" aria-live="polite"></div></div>'
    +'</div>';
  HMM.renderBlowout(sec.querySelector('.machine-wrap'),kind);
  hmmRender(sec.querySelector('.schematic-wrap'),Schematic(kind));
});

/* ---------- S5 bifurcation: animated triple-helix of dots, necessity colours ---------- */
(function(){
  var NS="http://www.w3.org/2000/svg", NEC=[__T("--hmm-nec-power", "#FF730B"),__T("--hmm-nec-eat", "#4F8A5B"),__T("--hmm-nec-heal", "#8752A5")];
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var m=document.getElementById('aiSplit');
  if(m){
    var svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 200 320');svg.setAttribute('role','img');svg.setAttribute('aria-label','AI bifurcates into opportunity and friction across the three necessities');svg.style.width='100%';svg.style.height='100%';svg.style.overflow='visible';
    var segs=[[[12,160],[92,160]],[[92,160],[186,56]],[[92,160],[186,264]]],dots=[];
    segs.forEach(function(s){var a=s[0],b=s[1],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),N=Math.max(10,Math.round(len/3));
      for(var i=0;i<=N;i++){var t=i/N;NEC.forEach(function(c,ci){var el=document.createElementNS(NS,'circle');el.setAttribute('fill',c);svg.appendChild(el);dots.push({el:el,a:a,dx:dx,dy:dy,t:t,ci:ci,q:Math.random()});});}});
    m.appendChild(svg);
    var amp=3.4,cycles=1.7,phase=0;
    function render(){dots.forEach(function(d){var len=Math.hypot(d.dx,d.dy),ux=d.dx/len,uy=d.dy/len,px=-uy,py=ux,ang=d.t*cycles*6.2832+d.ci*2.094+phase,off=amp*Math.sin(ang),depth=(Math.sin(ang)+1)/2,x=d.a[0]+d.dx*d.t+px*off,y=d.a[1]+d.dy*d.t+py*off;
      var big=d.q<.14,r=(big?1.9:(d.q<.5?1.3:.85))*(0.82+depth*0.36),op=(big?.9:.62)*(0.48+depth*0.52);
      d.el.setAttribute('cx',x.toFixed(1));d.el.setAttribute('cy',y.toFixed(1));d.el.setAttribute('r',r.toFixed(2));d.el.setAttribute('opacity',op.toFixed(2));});}
    render();
    if(!reduce){var hvis=true,hrun=false;
      function hloop(){if(!hvis){hrun=false;return;}hrun=true;phase+=0.006;render();requestAnimationFrame(hloop);}
      if('IntersectionObserver' in window){var hio=new IntersectionObserver(function(es){es.forEach(function(e){hvis=e.isIntersecting;if(hvis&&!hrun)hloop();});},{threshold:0.01});hio.observe(m);}
      hloop();
    }
  }
})();
/* arms clickable → the regulation lens (C3: the bifurcation makes regulation the decisive lens) */
document.querySelectorAll('.ai-arm').forEach(function(a){a.setAttribute('title','Go to the regulation lens');a.addEventListener('click',function(){var t=document.getElementById('s6');if(t)t.scrollIntoView({behavior:'smooth'});});});

/* ---------- S7 regulatory timeline ---------- */
(function(){var body=document.getElementById('tlBody');if(!body||!window.REG_INSTRUMENTS)return;
  function e2(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
  // lead sentence counts derive from the register. In force is REG_IN_FORCE, defined once in data/reg_instruments.js and shared with scripts/check-register-figures.mjs
  (function(){var W=['zero','one','two','three','four','five','six','seven','eight','nine','ten'];var inf={AU:0,JP:0,NZ:0},s20=0,sched=0;REG_INSTRUMENTS.forEach(function(r){if(r.global)return;if(r.c!=='AU'&&r.c!=='JP'&&r.c!=='NZ')return;if(r.type!=='enforceable')return;if(REG_IN_FORCE(r)){inf[r.c]++;if(r.yr>=2020)s20++;}else if(r.status==='expected'){sched++;}});var tot=inf.AU+inf.JP+inf.NZ,sub=document.querySelector('.tl-sub');if(sub&&tot)sub.textContent='hmm maps '+tot+' enforceable instruments in force across the three markets: '+inf.AU+' in Australia, '+inf.JP+' in Japan, '+inf.NZ+' in New Zealand, '+s20+' of them since 2020, with '+(W[sched]||sched)+' more scheduled between 2027 and 2030. This is the regulatory surface the fund tracks. The global rows are the same rules re-pricing the space elsewhere.';})();
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
  // dotted spine, built here; the flock (morph.js) flies the AI dots in and lands them as this vertical axis
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
  var FILTERS=[['all','All'],['inmarket','In-market'],['AU','AU'],['JP','JP'],['NZ','NZ'],['AMER','AMER'],['CA','Canada'],['GCC','GCC'],['EU','EU'],['UKI','UKI'],['GL','Global']];
  var present={};REG_INSTRUMENTS.forEach(function(r){present[r.c]=1;});
  var fbar=document.getElementById('tlFilters');
  function applyFilter(f){
    document.querySelectorAll('#s6 .tl-row, #s6 .tl-stand-item').forEach(function(el){var c=el.getAttribute('data-c');var show=f==='all'||(f==='inmarket'?(c==='AU'||c==='JP'||c==='NZ'):c===f);el.classList.toggle('tl-hidden',!show);});
    document.querySelectorAll('#s6 .tl-year').forEach(function(y){var vis=y.querySelectorAll('.tl-row:not(.tl-hidden), .tl-stand-item:not(.tl-hidden)').length;y.classList.toggle('tl-hidden',f!=='all'&&vis===0);});
    fbar.querySelectorAll('button').forEach(function(b){var on=b.getAttribute('data-f')===f;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');});
    if(window.__layoutSpine)window.__layoutSpine();
  }
  if(fbar){FILTERS.forEach(function(fl){if(fl[0]==='all'||fl[0]==='inmarket'||present[fl[0]]){var b=document.createElement('button');b.type='button';b.className='u-control';b.textContent=fl[1];b.setAttribute('data-f',fl[0]);b.setAttribute('aria-pressed','false');b.onclick=function(){applyFilter(fl[0]);};fbar.appendChild(b);}});applyFilter('all');}
})();
/* ---------- section rail: active marking + reveal ---------- */
(function(){
  var rail=document.getElementById('railnav'); if(!rail) return;
  var items=[].slice.call(rail.querySelectorAll('.rail-item[data-sec]:not(.rail-top)'));
  var pairs=items.map(function(a){return {a:a,el:document.getElementById(a.getAttribute('data-sec'))};})
                 .filter(function(p){return p.el;});
  var hero=document.querySelector('.hero'), cur=null, tick=false;

  function update(){
    tick=false;
    // Rank by how much of the viewport each section actually occupies. Ratio
    // is the wrong measure: a short section fully in view scores 1.0 while a
    // section taller than the screen never can, so the tall ones never win.
    var best=null, bv=0, vh=innerHeight;
    for(var i=0;i<pairs.length;i++){
      var r=pairs[i].el.getBoundingClientRect();
      var seen=Math.min(r.bottom,vh)-Math.max(r.top,0);
      if(seen>bv){bv=seen;best=pairs[i];}
    }
    if(best&&bv>0&&best!==cur){
      if(cur){cur.a.classList.remove('is-active');cur.a.removeAttribute('aria-current');}
      best.a.classList.add('is-active');best.a.setAttribute('aria-current','true');
      cur=best;
    }
    // Reveal only once the hero is fully behind us. A ratio threshold is wrong
    // here, because the hero stacks taller than the viewport on a phone, so it never
    // reaches one, and revealing part-way puts the rail over the last card,
    // which is full-bleed and has no gutter to give back.
    var past=hero?(hero.getBoundingClientRect().bottom<=0):(scrollY>vh*0.9);
    rail.classList.toggle('is-on',past);
  }
  addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(update);}},{passive:true});
  addEventListener('resize',function(){if(!tick){tick=true;requestAnimationFrame(update);}});
  update();
})();
