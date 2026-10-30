/* hmm site - the gate figure (06): an exploded view of one approval. figRecord (05) left with its
   section on 2026-09-24; the three sourcing figures were removed on 2026-09-15.

   EXPLODED VIEW (2026-10-30, handover item 3, after deck sheet 5). An approval names a site, a
   process, a quality system and a file. The drawing holds them as one cluster, then separates it
   into the four parts at one uniform spacing and holds there, so the reader sees what a buyer
   receives in one piece and what a rebuild has to earn part by part. It replaces "value pools
   behind the gate", which drew money rather than the mechanism the copy now argues.

   ONE ENGINE (2026-10-26). An SVG of circles handed to window.hmmAnimateDots, so the dots breathe
   on the 4s breath, drift with the school and ripple on a click exactly as the machines do. The
   assemble-and-separate cycle is the engine's per-frame step hook moving base positions, not a
   second loop. morph.js finds it as the gate section's drawing. Reduced motion: the engine never
   starts and the still frame is the exploded view, labels showing. Colours are the tokens, read at
   build and again on a theme flip. */
(function(){
  var fig=document.getElementById('regGate'), M=window.HMM_MOTION;
  if(!fig||!window.hmmAnimateDots||!M) return;
  var NS='http://www.w3.org/2000/svg', H=172, svg=null, ctl=null, builtW=0;   // 112 on a phone, set in build()
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
  function el(tag,attrs,text){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;return e;}
  function seeded(s){return function(){s=(Math.imul(s,1103515245)+12345)&0x7fffffff;return s/0x7fffffff;};}

  /* The SVG's own width: the figure's content box, floored. The figure has a 1px border each side,
     and a viewBox even a fraction wider than the box scales the 12px labels under the floor
     (2026-10-26, found at 0.994 on a phone and 0.998 on a desktop). */
  function boxW(){return Math.floor(fig.getBoundingClientRect().width-(fig.offsetWidth-fig.clientWidth));}

  /* The cycle, in ms: held together, separating, held apart, closing. Apart is held longest because
     it is the frame the caption describes. */
  var HOLD_IN=1800, OPEN=1400, HOLD_OUT=5200, CLOSE=1400, CYCLE=HOLD_IN+OPEN+HOLD_OUT+CLOSE;
  function ease(t){var u=1-t; return t<0.5?2*t*t:1-2*u*u;}       // ease in and out, quadratic
  function apart(ms){var t=ms%CYCLE;
    if(t<HOLD_IN) return 0; t-=HOLD_IN;
    if(t<OPEN) return ease(t/OPEN); t-=OPEN;
    if(t<HOLD_OUT) return 1; t-=HOLD_OUT;
    return 1-ease(t/CLOSE);}

  function build(){
    if(ctl){ctl.stop();ctl=null;}
    if(svg&&svg.parentNode)svg.parentNode.removeChild(svg);
    var W=boxW()||600; builtW=W; if(W<40) return;
    var phone=innerWidth<=640;
    H=phone?112:172;                                             // index.css holds the same two heights
    var rnd=seeded(61), PEARL=M.nec('pearl'), ACC=rgba(M.nec('reg'),0.9);
    var font='"Raela Grotesque","Helvetica Neue",sans-serif';
    svg=el('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H,'aria-hidden':'true',focusable:'false','class':'reg-gate'});

    /* Four parts at one uniform spacing. "Quality system" sets on two lines, so no label is shrunk
       to fit a phone's column. */
    var PARTS=[['SITE'],['PROCESS'],['QUALITY','SYSTEM'],['FILE']];
    var pad=phone?14:28, col=(W-2*pad)/4, cy=phone?50:78, spread=phone?13:24, per=phone?12:28;
    var ax=W/2, ay=cy;                                           // where the parts sit assembled
    var labels=[];

    // the bracket over the four parts: the one approval that names them
    var bx0=pad+col*0.5-spread, bx1=pad+col*3.5+spread, by=phone?18:26;
    svg.appendChild(el('path',{d:'M'+bx0+' '+(by+6)+'V'+by+'H'+bx1+'V'+(by+6),stroke:ACC,'stroke-width':1.2,fill:'none'}));
    svg.appendChild(el('text',{x:W/2,y:by-5,'text-anchor':'middle','font-family':font,'font-size':12,fill:ACC},'ONE APPROVAL'));

    PARTS.forEach(function(lines,i){
      var px=pad+col*(i+0.5);
      for(var j=0;j<per;j++){
        var r=rnd()*spread, a=rnd()*Math.PI*2, q=rnd(), sz=q<0.2?1.9:q<0.6?1.3:0.9;
        var ox=Math.cos(a)*r, oy=Math.sin(a)*r*0.8;
        svg.appendChild(el('circle',{cx:(px+ox).toFixed(1),cy:(cy+oy).toFixed(1),r:sz,
          fill:rgba(PEARL,1),opacity:sz>1.5?'0.9':'0.55',
          'data-ex':(px+ox).toFixed(1),'data-ey':(cy+oy).toFixed(1),
          'data-ax':(ax+ox*0.55).toFixed(1),'data-ay':(ay+oy*0.55).toFixed(1)}));
      }
      var ly=H-8-(lines.length-1)*14;
      lines.forEach(function(t,k){
        var tx=el('text',{x:px.toFixed(1),y:ly+k*14,'text-anchor':'middle','font-family':font,'font-size':12,fill:rgba(PEARL,0.8)},t);
        svg.appendChild(tx); labels.push(tx);
      });
    });

    // corner ticks, one per corner of the frame: [x, y, x-direction, y-direction]
    var t8=8, CORNERS=[[2, 2, 1, 1],[W-2, 2, -1, 1],[2, H-2, 1, -1],[W-2, H-2, -1, -1]];
    CORNERS.forEach(function(c){svg.appendChild(el('path',{d:'M'+c[0]+' '+c[1]+'h'+(t8*c[2])+'M'+c[0]+' '+c[1]+'v'+(t8*c[3]),stroke:ACC,'stroke-width':1,fill:'none'}));});
    var cap=fig.querySelector('figcaption'); if(cap)fig.insertBefore(svg,cap); else fig.appendChild(svg);

    /* assemble and separate on the engine's clock: base positions move, the engine adds breath,
       drift and impulse. The part labels show only while the parts stand apart. */
    ctl=window.hmmAnimateDots(svg,{mode:'breath',fps:30,driftAmp:1.2,step:function(D,ms){
      var p=apart(ms);
      for(var k=0;k<D.length;k++){var c=D[k].el;
        D[k].bx=+c.getAttribute('data-ax')+(+c.getAttribute('data-ex')-+c.getAttribute('data-ax'))*p;
        D[k].by=+c.getAttribute('data-ay')+(+c.getAttribute('data-ey')-+c.getAttribute('data-ay'))*p;}
      for(var j=0;j<labels.length;j++) labels[j].setAttribute('opacity',p.toFixed(3));
    }});
  }
  var rt=0;
  /* Rebuild when the figure's own box changes width, not only the window's: a grid column that
     settles after first paint left the drawing scaled a hair below 1:1, and its 12px labels under
     the floor (2026-10-26). */
  function onSize(){if(boxW()===builtW)return;clearTimeout(rt);rt=setTimeout(build,120);}
  if(window.ResizeObserver)new ResizeObserver(onSize).observe(fig); else addEventListener('resize',onSize);
  if(window.__onTheme)__onTheme(build);
  build(); setTimeout(function(){if(boxW()!==builtW)build();},300);   // re-read once layout settles
})();
