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
   says which physical system the name stands for. The definition under it is the
   plain-language line set below (GP 2026-10-26: keep the plain lines); the
   institutional definitions that sat here, never rendered, left on the same date. */
var SECCFG={
  power:{title:'The transformer, in <em>blow-out</em>',
    exTitle:"Power",
    exHTML:"",},
  eat:{title:'The reel, in <em>blow-out</em>',
    exTitle:"Eat",
    exHTML:"",},
  heal:{title:'The needle, in <em>blow-out</em>',
    exTitle:"Heal",
    exHTML:"",}
};

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

/* Each section's system diagram is drawn by diagrams.js (2026-10-27): the stages as text on a
   grid, the wires and their dots on the shared engine. It replaced the block schematic, whose
   labels had left the drawing for the 12px floor and the stage-name line under it. */
/* build each necessity section */
["power","eat","heal"].forEach(function(kind){var cfg=SECCFG[kind],sec=document.getElementById(kind);
  var TK='<span class="tk tk--tl"></span><span class="tk tk--tr"></span><span class="tk tk--bl"></span><span class="tk tk--br"></span>';
  sec.innerHTML=''
    +'<div class="eyebrow">'+cfg.exTitle+'</div>'
    +'<div class="stage">'
    +'<div class="machine-wrap"></div></div>'
    +'<div class="panel">'
    +'<div class="card">'+TK+'<h2>'+cfg.exTitle+'</h2><p>'+cfg.exHTML+'</p>'
    /* The instance paragraph is a disclosure (2026-10-26, the 9,000px page ceiling at 390px): open on a
       wide screen, one tap away on a phone, where it was the longest block in each section. */
    +'<details class="card-unit"'+(window.innerWidth>=768?' open':'')+'><summary>The instance</summary><p>'+(cfg.unitHTML||'')+'</p></details></div>'
    +'<div class="card">'+TK+'<div class="schematic-wrap"></div></div>'
    +'</div>';
  HMM.renderBlowout(sec.querySelector('.machine-wrap'),kind);
  /* The part-name list under each drawing was removed on 2026-10-30 (GP: cut what does not add).
     It named the parts of an illustration and carried no part of the argument, and it cost about
     500px of a phone page held to a ceiling (check:clarity). The drawing's own callouts stay hidden by index.css. */
  window.hmmSystemDiagram(sec.querySelector('.schematic-wrap'),kind);
});

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
