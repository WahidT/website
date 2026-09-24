/* hmm site - the one canvas figure, dotted engineering register, organic motion.
   regGate (06): value pooling behind the gate. figRecord (05) left with its section on
   2026-09-24. Canvas, DPR-aware. Honours prefers-reduced-motion (draws a settled still frame).
   The three sourcing figures (formation, go-to-market, arbitrage) were removed on 2026-09-15:
   their mounts existed on no page, so the builders ran for nothing. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* A token as an [r,g,b] triple for the canvas, parsed from the custom
     property so the triple cannot drift from the hex. Four bare triples sat
     here where a hex sweep could not see them. __T comes from theme.js, which
     loads first. */
  function __RGB(n,fallback){var v=__T(n,fallback).trim().replace('#','');return [parseInt(v.slice(0,2),16),parseInt(v.slice(2,4),16),parseInt(v.slice(4,6),16)];}
  function rgba(c,a){return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')';}
  var PEARL=__RGB('--hmm-pearl-beige','#F2ECC9'), THESIS=__RGB('--hmm-thesis','#B8863A'), C08=__RGB('--hmm-c08','#A83B2E'), TOMATO=__RGB('--hmm-tomato-jam','#C44539'),
      ACC=rgba(TOMATO,0.9), LINE=rgba(PEARL,0.22), FAINT=rgba(PEARL,0.5), LBL=rgba(PEARL,0.42);
  function mono(ctx,px){ctx.font=px+'px "Raela Grotesque","Helvetica Neue",sans-serif';}

  function mount(id,h){
    var fig=document.getElementById(id); if(!fig) return null;
    var cap=fig.querySelector('figcaption'), cv=document.createElement('canvas');
    if(cap) fig.insertBefore(cv,cap); else fig.appendChild(cv);
    var ctx=cv.getContext('2d'), DPR=Math.min(2,window.devicePixelRatio||1), W=0,H=h;
    function size(){W=cv.clientWidth||fig.clientWidth||600;H=cv.clientHeight||h;cv.width=W*DPR;cv.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0);}
    size(); addEventListener('resize',size); setTimeout(size,300);   // re-read once layout settles (dynamic-height figures)
    return {ctx:ctx,W:function(){return W;},H:function(){return H;},fig:fig};
  }
  // rAF loop, gated by an IntersectionObserver so off-screen figures stop animating (battery/CPU on mobile)
  function frame(m,draw){var t=0,vis=true,running=false;
    function loop(){if(!vis){running=false;return;}running=true;t+=0.016;m.ctx.clearRect(0,0,m.W(),m.H());draw(t);if(!reduce)requestAnimationFrame(loop);else running=false;}
    if('IntersectionObserver' in window && m.fig){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){vis=e.isIntersecting;if(vis&&!running){loop();}});},{threshold:0.01});
      io.observe(m.fig);
    }
    loop();
  }
  function ticks(ctx,W,H){var a=8;[[2,2,1,1],[W-2,2,-1,1],[2,H-2,1,-1],[W-2,H-2,-1,-1]].forEach(function(c){ctx.strokeStyle=ACC;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(c[0],c[1]);ctx.lineTo(c[0]+a*c[2],c[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(c[0],c[1]+a*c[3]);ctx.stroke();});}

  // ---- 06 · the gate: value streams in from the open side and pools behind the regulatory barrier ----
  var mg=mount('regGate',172);
  if(mg){
    var pool=[],adds=[],lastWG=0;
    function seedG(W,H){var gx=W*0.62;pool=[];for(var i=0;i<64;i++){pool.push({bx:gx+10+Math.random()*(W-gx-20),by:H-14-Math.random()*Math.random()*(H*0.66),ph:Math.random()*6.28,s:Math.random()<0.16?1.9:Math.random()<0.5?1.2:0.8});}
      adds=[];for(var j=0;j<15;j++)adds.push({x:-Math.random()*W*0.5,y:16+Math.random()*(H-42),v:0.75+Math.random()*0.95,s:Math.random()<0.3?1.6:1.0});}
    frame(mg,function(t){var ctx=mg.ctx,W=mg.W(),H=mg.H(),gx=W*0.62;if(W!==lastWG){seedG(W,H);lastWG=W;}
      ticks(ctx,W,H);
      adds.forEach(function(d){d.x+=d.v;if(d.x>W-10){d.x=-Math.random()*30;d.y=16+Math.random()*(H-42);}
        var a=d.x<gx?Math.min(1,(d.x+30)/60):0.7;
        ctx.beginPath();ctx.arc(d.x,d.y+Math.sin(t*0.8+d.x*0.05)*1.5,d.s,0,6.28);ctx.fillStyle=rgba(THESIS,0.5*a);ctx.fill();});
      pool.forEach(function(p){var y=p.by+Math.sin(t*0.6+p.ph)*1.3,x=p.bx+Math.cos(t*0.5+p.ph)*1;
        ctx.beginPath();ctx.arc(x,y,p.s,0,6.28);ctx.fillStyle=rgba(PEARL,p.s>1.5?0.85:0.5);ctx.fill();});
      ctx.strokeStyle=ACC;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(gx,14);ctx.lineTo(gx,H-12);ctx.stroke();
      ctx.fillStyle=ACC;ctx.beginPath();ctx.moveTo(gx-5,26);ctx.lineTo(gx+5,31);ctx.lineTo(gx-5,36);ctx.closePath();ctx.fill();
      mono(ctx,8.5);ctx.fillStyle=LBL;ctx.textAlign='left';ctx.fillText('OPEN',12,H-7);
      ctx.textAlign='right';ctx.fillStyle=rgba(PEARL,0.8);ctx.fillText('POOLS BEHIND THE GATE',W-12,H-7);
      ctx.save();ctx.translate(gx-11,H/2);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillStyle=ACC;mono(ctx,8.5);ctx.fillText('THE GATE',0,0);ctx.restore();
    });
  }
})();
