/* hmm site - the page script. What index.html carried inline until 2026-09-07: the hero
   ledgers and machines, the three necessity sections and their schematics, the S5 helix, the
   S7 timeline, and the section rail. Moved out so the Content-Security-Policy in _headers can
   drop unsafe-inline for scripts. Load order is unchanged: after theme.js and machines.js,
   before transitions.js. Tokens are read through __T from theme.js, at render. */

var h=window.hmmH;
/* ---------- hero: machines + ledgers + interactions ---------- */
var LEDGERS={
  power:[["Methane-pyrolysis reactors","F"],["Electrolysers (alkaline/PEM/SOEC)","F"],["Switchable multi-feedstock refinery reactors","N"],["Perovskite-silicon tandem cells","F"]],
  eat:[["Multispectral/hyperspectral cameras","F"],["LiDAR crop scanning","F"],["Spore/airborne-pathogen detectors","F"],["Biodegradable seed-planted sensor nodes","N"]],
  heal:[["Portable low-field MRI","F"],["Photon-counting CT detectors","F"],["Reconfigurable multi-modality imaging beds","N"],["Cartridge sample-to-answer molecular dx","F"]]
};
Object.keys(LEDGERS).forEach(function(nec){var ul=document.querySelector('.ledger[data-ledger="'+nec+'"]');LEDGERS[nec].forEach(function(r){var li=document.createElement('li');li.innerHTML='<span>'+r[0]+'</span>';ul.appendChild(li);});});
["power","eat","heal"].forEach(function(nec){HMM.renderIcon(document.querySelector('.machine[data-machine="'+nec+'"]'),nec);});

/* ---------- necessity section content ----------
   The card heading is the system's name, Power, Eat or Heal (GP 2026-09-15), because that is
   the name the memorandum and every other page use; the definition sentence under it still
   says which physical system the name stands for. */
/* Token names, read at each render rather than captured here, so a data-theme flip reaches the next paint. */
var ACCENT_TOKEN={power:["--hmm-nec-power","#FF730B"],eat:["--hmm-nec-eat","#4F8A5B"],heal:["--hmm-nec-heal","#8752A5"]};
function accentOf(kind){return __T(ACCENT_TOKEN[kind][0],ACCENT_TOKEN[kind][1]);}
var SCHEMATIC_MOUNTS=[];
var SECCFG={
  power:{title:'The transformer, in <em>blow-out</em>',
    exTitle:"Power",
    exHTML:"The energy system is the process chain, or a subset of it, from the extraction of primary energy to the use of final energy to supply services and goods. hmm's mandate extends it to the critical-minerals layer that constrains that chain, because that is where the returnable innovation in energy materials sits.",},
  eat:{title:'The reel, in <em>blow-out</em>',
    exTitle:"Eat",
    exHTML:"The food system gathers all the elements and activities relating to the production, processing, distribution, preparation and consumption of food, and the outputs of those activities. Its three constituent elements are <b>food supply chains, food environments and consumer behaviour</b>.",},
  heal:{title:'The needle, in <em>blow-out</em>',
    exTitle:"Heal",
    exHTML:"The health system is all <b>organizations, people and actions whose primary intent is to promote, restore or maintain health</b>. It is defined by intent rather than by chain, so it sits downstream of its determinants rather than containing them.",}
};

function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
// --- per-step model: derive schematic stages + reveal data from the *_STEPS files ---
function wrap2(s){var w=s.split(' ');if(w.length<2)return [s];var mid=Math.ceil(w.length/2);return [w.slice(0,mid).join(' '),w.slice(mid).join(' ')];}
function stagesFromSteps(S){return S.steps.map(function(st){var m=st.name.match(/\(([^)]+)\)/);var base=st.name.replace(/\s*\([^)]*\)/,'').trim();return {n:wrap2(base),key:st.name,note:m?m[1]:""};});}
function stepMap(S){var m={};S.steps.forEach(function(st){m[st.name]=st;});return m;}
[['power',window.POWER_STEPS],['eat',window.EAT_STEPS],['heal',window.HEAL_STEPS]].forEach(function(p){var S=p[1];if(!S)return;SECCFG[p[0]].stages=stagesFromSteps(S);SECCFG[p[0]].data=stepMap(S);SECCFG[p[0]].exHTML=S.definition.replace(/\s*It is a necessity because[^.]*\./,'');});
// plain-language definitions: name the system, where hmm invests, where returns concentrate. No shared template, fewer absolutes, conclusions attributed to hmm.
if(SECCFG.power) SECCFG.power.exHTML="Power is the energy system: a resource extracted, refined, generated, carried across the grid, used, and its materials recovered. We work one layer down, on the storage and the critical minerals that constrain every stage. That is where the returns have concentrated.";
if(SECCFG.eat) SECCFG.eat.exHTML="Eat is the food and farming system, crop and livestock in one cycle: grain feeds animals, manure feeds the soil. The cost pressure sits on nitrogen for crops and feed conversion for livestock. We back the field-autonomy layer that bears on both.";
if(SECCFG.heal) SECCFG.heal.exHTML="Heal is the healthcare system, from prevention through diagnosis and treatment to end-of-life care. Its limits are regulatory and financial: what a regulator approves and what a payer reimburses. Our read is that the value sits upstream, at detection, where disease caught early costs least to treat.";

/* The unit and the physical instance, one of each per system (GP structure item 2,
   2026-09-14). Lifted from the memorandum's section 3, which states the incumbent
   position in each necessity as the thing it earns per. The term of art is shown as a
   mechanism on first use, so a reader who has never met a grid connection standard or a
   therapeutic goods approval can follow the chain. */
if(SECCFG.power) SECCFG.power.unitHTML="The instance is a power plant, and it earns per megawatt hour delivered. Nothing is delivered until a network operator agrees to energise it, and that agreement is a grid connection standard: a written performance standard registered against one connection point. What it is negotiated against is the network's measured condition at that point, because the same plant at another point is another negotiation and another position in the queue.";
if(SECCFG.eat) SECCFG.eat.unitHTML="The instance is a paddock, and its input is bought per tonne applied to a hectare. 156 million tonnes of contained nitrogen was synthesised in 2024 on United States Geological Survey data, so a rule constraining what is applied constrains a line item that is already metered.";
if(SECCFG.heal) SECCFG.heal.unitHTML="The instance is a clinic, and it earns per test run and interpreted at a central node, being a laboratory or a hospital department with the instruments, the accreditation and the staff to operate them. A device or a diagnostic reaches that node through the regulator's register, which is what an approval is here: supply is unlawful without an entry, a sponsor in the market holds it, and for a higher-class device or in-vitro diagnostic the entry rests on conformity-assessment evidence naming the manufacturer.";

function Schematic(kind){var cfg=SECCFG[kind],S=cfg.stages,acc=accentOf(kind);
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
    e.push(h("g",{key:"g"+i,className:"blk","data-key":s.key},g));});
  var fw=vbW-4;
  e.unshift(h("rect",{key:"frame",x:2,y:2,width:fw,height:vbH-4,fill:"none",stroke:"rgba(242,236,201,.1)",strokeWidth:1}));
  [[2,2,9,9],[vbW-2,2,-9,9],[2,vbH-2,9,-9],[vbW-2,vbH-2,-9,-9]].forEach(function(t,ti){e.push(h("line",{key:"fa"+ti,x1:t[0],y1:t[1],x2:t[0]+t[2],y2:t[1],stroke:acc,strokeWidth:1}));e.push(h("line",{key:"fb"+ti,x1:t[0],y1:t[1],x2:t[0],y2:t[1]+t[3],stroke:acc,strokeWidth:1}));});
  return h("svg",{viewBox:"0 0 "+vbW+" "+vbH,role:"img","aria-label":cfg.exTitle+" system, end to end, as a block schematic"},e);
}

/* The per-stage panels (a definition, an AI facet and a regulation facet per block) left
   the public page on 2026-09-24: the stage chain is the
   model's own instrument, and the drawing stays as the drawing it is. The *_steps.js files
   still feed the stage names and the schematic geometry. */
/* build each necessity section */
["power","eat","heal"].forEach(function(kind){var cfg=SECCFG[kind],sec=document.getElementById(kind);
  var TK='<span class="tk tk--tl"></span><span class="tk tk--tr"></span><span class="tk tk--bl"></span><span class="tk tk--br"></span>';
  sec.innerHTML=''
    +'<div class="eyebrow">'+cfg.exTitle+'</div>'
    +'<div class="stage">'
    +'<div class="machine-wrap"></div></div>'
    +'<div class="panel">'
    +'<div class="card">'+TK+'<h2>'+cfg.exTitle+'</h2><p>'+cfg.exHTML+'</p><p class="card-unit">'+(cfg.unitHTML||'')+'</p></div>'
    +'<div class="card">'+TK+'<div class="schematic-wrap"></div></div>'
    +'</div>';
  HMM.renderBlowout(sec.querySelector('.machine-wrap'),kind);
  /* Under 600px the drawing renders its callouts at about 5px, so index.css hides the boxes there
     and this list carries the same labels as text (clarity plan phase 3, 2026-10-22). */
  var cl=document.createElement('ol');cl.className='callout-list';
  HMM.callouts(kind).forEach(function(c){var li=document.createElement('li');if(c.key)li.className='is-key';
    li.innerHTML='<span class="cl-n">'+c.n+'</span><span class="cl-t"><b>'+c.name+'</b> '+c.note+'</span>';cl.appendChild(li);});
  sec.querySelector('.stage').appendChild(cl);
  var smount=sec.querySelector('.schematic-wrap');hmmRender(smount,Schematic(kind));SCHEMATIC_MOUNTS.push({mount:smount,kind:kind});
});
/* A theme flip redraws each schematic with the accent re-read. */
__onTheme(function(){SCHEMATIC_MOUNTS.forEach(function(m){hmmRender(m.mount,Schematic(m.kind));});});

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
    // At the foot of the page the last section wins. The close carries the address alone
    // (R-D47), shorter than the section above it, so on area it never would.
    var last=pairs[pairs.length-1];
    if(last&&scrollY+vh>=document.documentElement.scrollHeight-2){
      var lr=last.el.getBoundingClientRect();
      if(lr.bottom>0&&lr.top<vh){best=last;bv=Math.max(bv,1);}
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
