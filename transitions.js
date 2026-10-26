/* hmm site - the threading dot-field. One persistent field of reused particles (R8) behind every
   page. It breathes, flows in the scroll direction (the flock / school), and shifts colour to
   the necessity of the section in view: Power -> Eat -> Heal -> the gate.
   Metaphorical continuity, not entity mapping. Honours prefers-reduced-motion (static faint field).

   ONE ENGINE (2026-10-26). Breath, drift, the click impulse and the colours come from
   window.HMM_MOTION in scripts/hmm-motion.js, the same functions that move the machines, the
   hero dissolve, the flock, the gate and the register. A click anywhere ripples this field on the
   engine's 3s weighted decay, and the same click reaches any drawing beside it. The colours are
   the necessity tokens, read at each retarget, so the field cannot drift from the drawings.
   Pages without necessity sections keep the gate colour, the accent the site shares. */
(function(){
  var cv=document.getElementById('dotfield'), M=window.HMM_MOTION; if(!cv||!M) return;
  var ctx=cv.getContext('2d'), DPR=Math.min(2,window.devicePixelRatio||1), W=0,H=0;
  function resize(){W=cv.width=Math.floor(innerWidth*DPR);H=cv.height=Math.floor(innerHeight*DPR);cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';}
  resize(); addEventListener('resize',function(){resize();retarget();});

  var COLKEY={power:'power',eat:'eat',heal:'heal',s6:'reg'};
  function currentColor(){
    var vc=innerHeight/2, best=null, bd=1e9;
    Object.keys(COLKEY).forEach(function(id){var el=document.getElementById(id);if(!el)return;var r=el.getBoundingClientRect();var c=r.top+r.height/2;var d=Math.abs(c-vc);if(d<bd){bd=d;best=COLKEY[id];}});
    return M.nec(best||'reg');
  }

  var N=Math.max(140,Math.min(360,Math.round(innerWidth*innerHeight/13000))), dots=[];
  for(var i=0;i<N;i++){var q=Math.random();dots.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:(q<.14?2.0:q<.5?1.3:.85)*DPR,ph:(i*M.GOLDEN)%1,q:q});}

  var col=currentColor(), last=window.scrollY, sv=0, t0=M.now();
  var reduced=M.prefersReduced();

  /* The section nearest the viewport centre only changes when the page scrolls or the layout
     moves, so the rect sweep in currentColor runs once per scroll event, coalesced through
     a single rAF, and once on resize, load and font arrival. The draw loop reads the cached
     target and the cached scroll position. */
  var sy=window.scrollY, tc=col.slice(), queued=false;
  function retarget(){if(queued)return;queued=true;requestAnimationFrame(function(){queued=false;sy=window.scrollY;tc=currentColor();});}
  addEventListener('scroll',retarget,{passive:true});
  addEventListener('load',retarget);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(retarget);
  if(window.ResizeObserver)new ResizeObserver(retarget).observe(document.body);
  if(window.__onTheme)__onTheme(retarget);

  /* the shared impulse: a click pushes the field out from the pointer, in device pixels */
  var impulses=[], REACH=Math.max(160,Math.min(420,innerWidth*0.35));
  M.onImpulse(function(x,y){impulses.push({x:x*DPR,y:y*DPR,t0:M.now()});start();});

  var running=false;
  function frame(){
    if(document.hidden){running=false;return;}   // nothing to paint for; visibilitychange restarts the loop
    var t=M.now(), el=t-t0;
    var s=sy; sv=sv*0.86+(s-last)*0.14; last=s;
    for(var k=0;k<3;k++)col[k]+=(tc[k]-col[k])*0.035;
    var flow=Math.max(-7,Math.min(7,sv*DPR*0.28)), reach=REACH*DPR, amp=0.6*DPR;
    while(impulses.length&&(t-impulses[0].t0)>M.IMPULSE)impulses.shift();
    ctx.clearRect(0,0,W,H);
    var cs='rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',';
    for(var i=0;i<N;i++){var d=dots[i];
      d.x+=d.vx*DPR; d.y+=d.vy*DPR+flow;
      if(d.y>H+12)d.y=-12; else if(d.y<-12)d.y=H+12;
      if(d.x>W+12)d.x=-12; else if(d.x<-12)d.x=W+12;
      var dv=M.drift(el,d.x/DPR,d.y/DPR,d.ph,amp), px=d.x+dv[0], py=d.y+dv[1];
      for(var j=0;j<impulses.length;j++){var im=impulses[j],ux=px-im.x,uy=py-im.y,dist=Math.hypot(ux,uy)||0.001;
        var pw=reach*0.18*M.push(dist,reach,(t-im.t0)/M.IMPULSE);if(pw>0){px+=ux/dist*pw;py+=uy/dist*pw;}}
      var op=(0.09+0.11*(0.5+0.5*M.breath(el,d.ph)))*(d.q<.14?1.5:1);
      ctx.beginPath();ctx.arc(px,py,d.r,0,6.2832);
      ctx.fillStyle=cs+op.toFixed(3)+')';ctx.fill();
    }
    requestAnimationFrame(frame);
  }
  function start(){if(reduced||running||document.hidden)return;running=true;requestAnimationFrame(frame);}
  if(reduced){ctx.clearRect(0,0,W,H);dots.forEach(function(d){ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,6.2832);ctx.fillStyle='rgba('+(col[0]|0)+','+(col[1]|0)+','+(col[2]|0)+',0.12)';ctx.fill();});}
  else{start();document.addEventListener('visibilitychange',start);}
})();
