/* hmm site - the gate figure (06): value streams in from the open side and pools behind the
   regulatory barrier. figRecord (05) left with its section on 2026-09-24; the three sourcing
   figures were removed on 2026-09-15.

   ONE ENGINE (2026-10-26). This was the last canvas with its own frame loop and its own sine
   wobble. It is now an SVG of circles handed to window.hmmAnimateDots, so the pool breathes on
   the 4s breath, drifts with the school and ripples on a click exactly as the machines do, and a
   click in the page field beside it reaches it too. The stream is the engine's per-frame step
   hook moving base positions, not a second loop. Because it is now dots in an SVG, morph.js
   finds it as the gate section's drawing and the flock lands here between Heal and the
   sourcing section. Reduced motion: the engine never starts and the drawing is the still frame.
   Colours are the tokens, read at build and again on a theme flip. */
(function(){
  var fig=document.getElementById('regGate'), M=window.HMM_MOTION;
  if(!fig||!window.hmmAnimateDots||!M) return;
  var NS='http://www.w3.org/2000/svg', H=172, svg=null, ctl=null, builtW=0;   // 112 on a phone, set in build()
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
  function el(tag,attrs,text){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);if(text!=null)e.textContent=text;return e;}
  function seeded(s){return function(){s=(Math.imul(s,1103515245)+12345)&0x7fffffff;return s/0x7fffffff;};}

  function build(){
    if(ctl){ctl.stop();ctl=null;}
    if(svg&&svg.parentNode)svg.parentNode.removeChild(svg);
    var W=Math.round(fig.clientWidth||600); builtW=W; if(W<40) return;
    H=innerWidth<=640?112:172;                                   // index.css holds the same two heights
    var gx=W*0.62, rnd=seeded(61), PEARL=M.nec('pearl'), THESIS=M.nec('thesis'), ACC=rgba(M.nec('reg'),0.9);
    svg=el('svg',{viewBox:'0 0 '+W+' '+H,width:W,height:H,'aria-hidden':'true',focusable:'false','class':'reg-gate'});
    // the stream: 15 dots that cross from the open side and fade as they pass the gate
    var streams=[];
    for(var j=0;j<15;j++){var s=rnd()<0.3?1.6:1.0;
      streams.push(el('circle',{cx:(-rnd()*W*0.5).toFixed(1),cy:(16+rnd()*(H-42)).toFixed(1),r:s,fill:rgba(THESIS,1),opacity:'0.5','data-v':(0.75+rnd()*0.95).toFixed(3)}));}
    // the pool: 64 dots settled behind the gate, weighted towards the floor
    for(var i=0;i<64;i++){var q=rnd(),sz=q<0.16?1.9:q<0.58?1.2:0.8;
      svg.appendChild(el('circle',{cx:(gx+10+rnd()*(W-gx-20)).toFixed(1),cy:(H-14-rnd()*rnd()*(H*0.66)).toFixed(1),r:sz,fill:rgba(PEARL,1),opacity:sz>1.5?'0.85':'0.5'}));}
    streams.forEach(function(c){svg.appendChild(c);});
    // the barrier and its labels: static, at 1 user unit to 1 CSS px so the 12px floor holds
    var a=8;[[2,2,1,1],[W-2,2,-1,1],[2,H-2,1,-1],[W-2,H-2,-1,-1]].forEach(function(c){svg.appendChild(el('path',{d:'M'+c[0]+' '+c[1]+'h'+(a*c[2])+'M'+c[0]+' '+c[1]+'v'+(a*c[3]),stroke:ACC,'stroke-width':1,fill:'none'}));});
    svg.appendChild(el('line',{x1:gx,y1:14,x2:gx,y2:H-12,stroke:ACC,'stroke-width':1.5}));
    svg.appendChild(el('path',{d:'M'+(gx-5)+' 26L'+(gx+5)+' 31L'+(gx-5)+' 36Z',fill:ACC}));
    var font='"Raela Grotesque","Helvetica Neue",sans-serif';
    svg.appendChild(el('text',{x:12,y:H-7,'font-family':font,'font-size':12,fill:rgba(PEARL,0.42)},'OPEN'));
    svg.appendChild(el('text',{x:W-12,y:H-7,'text-anchor':'end','font-family':font,'font-size':12,fill:rgba(PEARL,0.8)},'POOLS BEHIND THE GATE'));
    svg.appendChild(el('text',{transform:'translate('+(gx-11)+' '+(H/2)+') rotate(-90)','text-anchor':'middle','font-family':font,'font-size':12,fill:ACC},'THE GATE'));
    var cap=fig.querySelector('figcaption'); if(cap)fig.insertBefore(svg,cap); else fig.appendChild(svg);

    /* the stream advances on the engine's clock: base x moves, the engine adds breath, drift and impulse */
    var lastEl=0, first=64;
    ctl=window.hmmAnimateDots(svg,{mode:'breath',fps:30,driftAmp:1.5,step:function(D,ms){
      var dt=Math.min(100,ms-lastEl)/16.67; lastEl=ms;
      for(var k=first;k<D.length;k++){var d=D[k],v=+d.el.getAttribute('data-v')||1;
        d.bx+=v*dt; if(d.bx>W-10){d.bx=-rnd()*30;d.by=16+rnd()*(H-42);}
        d.vis=d.bx<gx?Math.max(0,Math.min(1,(d.bx+30)/60)):0.7;}
    }});
  }
  var rt=0;
  addEventListener('resize',function(){if(Math.round(fig.clientWidth)===builtW)return;clearTimeout(rt);rt=setTimeout(build,180);});
  if(window.__onTheme)__onTheme(build);
  build(); setTimeout(function(){if(Math.round(fig.clientWidth)!==builtW)build();},300);   // re-read once layout settles
})();
