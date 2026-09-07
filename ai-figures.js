/* hmm site - S5 AI figures, dotted engineering register, organic motion.
   05.1 two vectors of opposite sign that cancel; 05.2 (the load-bearing one) value pooling behind the
   gate while erosion is turned away at it; 05.3 the FDA count 6 -> 295 as gates forming. Canvas, DPR-aware.
   Honours prefers-reduced-motion (draws a settled still frame). */
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

  // ---- 05 · Fig hmm-AI-05 · the record the next entrant must rebuild ----
  // One metric (accumulated real-world evidence) vs time. Leader's dotted curve rises to Today;
  // challenger sits at zero until Today, then a Tomato record just begins. The barrier is the horizontal
  // time-gap below the plot: years of record the model can't skip. One accent (Tomato), used twice only.
  var m1=mount('figRecord',320);
  if(m1){
    var rpts=null,cpts=null,lastWR=0,G=null;
    function seedR(W,H){
      var padL=76,padR=62,padT=44,padB=64,baseY=H-padB,topY=padT+6,xT=W-padR;
      var fMid=0.56, xMid=padL+(xT-padL)*fMid;               // challenger enters midway through the timeline
      var yC=baseY-(baseY-topY)*0.5;                          // evidence the challenger holds today (half the leader's)
      var fL=1-Math.pow(0.5,1/1.9), xLead=padL+(xT-padL)*fL;  // where the leader's curve first reached that same level
      G={padL:padL,baseY:baseY,topY:topY,xT:xT,xMid:xMid,yC:yC,xLead:xLead};
      rpts=[];var n=116;
      for(var i=0;i<n;i++){var f=i/(n-1),e=1-Math.pow(1-f,1.9);
        rpts.push({x:padL+(xT-padL)*f,y:baseY-(baseY-topY)*e,born:f,
          s:Math.random()<0.16?2.0:Math.random()<0.5?1.3:0.85,ph:Math.random()*6.28});}
      cpts=[];var m=54;
      for(var j=0;j<m;j++){var u=j/(m-1),e2=1-Math.pow(1-u,1.6);
        cpts.push({x:xMid+(xT-xMid)*u,y:baseY-(baseY-yC)*e2,born:u,
          s:Math.random()<0.16?1.9:Math.random()<0.5?1.25:0.8,ph:Math.random()*6.28});}
    }
    frame(m1,function(t){var ctx=m1.ctx,W=m1.W(),H=m1.H();
      if(W!==lastWR){seedR(W,H);lastWR=W;}
      var padL=G.padL,baseY=G.baseY,topY=G.topY,xT=G.xT,xMid=G.xMid,yC=G.yC,xLead=G.xLead,cy=(topY+baseY)/2;
      ticks(ctx,W,H);
      // axes, recessive
      ctx.strokeStyle=LINE;ctx.lineWidth=0.75;
      ctx.beginPath();ctx.moveTo(padL,topY-4);ctx.lineTo(padL,baseY);ctx.lineTo(xT,baseY);ctx.stroke();
      // Today datum, dashed
      ctx.strokeStyle=FAINT;ctx.setLineDash([2,4]);ctx.beginPath();ctx.moveTo(xT,topY-4);ctx.lineTo(xT,baseY);ctx.stroke();ctx.setLineDash([]);
      mono(ctx,9);ctx.fillStyle=LBL;ctx.textAlign='left';ctx.fillText('2015',padL,baseY+15);
      ctx.textAlign='right';ctx.fillStyle=FAINT;ctx.fillText('TODAY',xT,topY-8);
      ctx.save();ctx.translate(padL-14,cy);ctx.rotate(-Math.PI/2);ctx.textAlign='center';ctx.fillStyle=LBL;mono(ctx,8.5);ctx.fillText('REAL-WORLD EVIDENCE, ACCUMULATED',0,0);ctx.restore();
      var sweep=reduce?2:0.16+((t*0.1)%1.3);
      // leader curve, neutral breathing dots
      rpts.forEach(function(p){if(p.born>sweep)return;
        ctx.beginPath();ctx.arc(p.x,p.y+Math.sin(t*0.7+p.ph)*1.1,p.s,0,6.28);ctx.fillStyle=rgba(PEARL,p.s>1.5?0.85:0.5);ctx.fill();});
      mono(ctx,10.5);ctx.textAlign='right';ctx.fillStyle=rgba(PEARL,0.92);ctx.fillText('LEADER',xT-8,topY+8);
      mono(ctx,8.5);ctx.fillStyle=LBL;ctx.fillText('record accumulated',xT-8,topY+21);
      // challenger curve, Tomato breathing dots, rising from its midway entry (accent use 1 of 2)
      var csweep=reduce?2:0.16+((t*0.1)%1.3);
      cpts.forEach(function(p){if(p.born>csweep)return;
        ctx.beginPath();ctx.arc(p.x,p.y+Math.sin(t*0.8+p.ph)*1.0,p.s,0,6.28);ctx.fillStyle=rgba(C08,p.s>1.5?0.9:0.62);ctx.fill();});
      // challenger entry: matches capability the moment it arrives, at zero record
      ctx.beginPath();ctx.arc(xMid,baseY,2.4,0,6.28);ctx.fillStyle=rgba(C08,0.9);ctx.fill();
      ctx.strokeStyle=FAINT;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(xMid,baseY);ctx.lineTo(xMid,topY+2);ctx.stroke();ctx.setLineDash([]);
      mono(ctx,8.5);ctx.textAlign='center';ctx.fillStyle=LBL;ctx.fillText('challenger enters · matches the model',xMid,baseY+15);
      // challenger head label
      mono(ctx,10.5);ctx.textAlign='left';ctx.fillStyle=rgba(C08,0.95);ctx.fillText('CHALLENGER',xT-4,yC-10);
      // the barrier: horizontal gap at equal evidence, leader reached yC years earlier (accent use 2 of 2)
      var lead=Math.min(1,csweep/1.0);   // reveal the dimension line with the challenger
      // anchor points at the shared evidence level
      ctx.beginPath();ctx.arc(xLead,yC,2.2,0,6.28);ctx.fillStyle=rgba(PEARL,0.85);ctx.fill();
      ctx.beginPath();ctx.arc(xT,yC,2.6,0,6.28);ctx.fillStyle=rgba(C08,0.95);ctx.fill();
      ctx.strokeStyle=ACC;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(xLead,yC);ctx.lineTo(xT,yC);ctx.stroke();
      ctx.fillStyle=ACC;
      ctx.beginPath();ctx.moveTo(xLead,yC);ctx.lineTo(xLead+8,yC-3);ctx.lineTo(xLead+8,yC+3);ctx.closePath();ctx.fill();
      ctx.beginPath();ctx.moveTo(xT,yC);ctx.lineTo(xT-8,yC-3);ctx.lineTo(xT-8,yC+3);ctx.closePath();ctx.fill();
      mono(ctx,10);ctx.textAlign='center';ctx.fillStyle=rgba(C08,0.95);ctx.fillText("the barrier · years of record the model can't skip",(xLead+xT)/2,yC-9);
      mono(ctx,8);ctx.fillStyle=LBL;ctx.fillText('same evidence, reached years apart',(xLead+xT)/2,yC+16);
      // DWG stamp + Rev
      mono(ctx,7.5);ctx.fillStyle=LBL;ctx.textAlign='left';ctx.fillText('DWG hmm-AI-05-D5',padL,H-12);
      ctx.textAlign='right';ctx.fillText('REV A',W-22,20);
    });
  }

  // ---- 09.A · enter at formation ----
  var m4=mount('figFormation',280);
  if(m4){
    var stages=['FORMATION','ANGEL','SEED','SERIES A','SERIES B','EXIT'];
    frame(m4,function(t){var ctx=m4.ctx,W=m4.W(),H=m4.H(),y=H*0.6,L=48,R=W-30,n=stages.length;
      ticks(ctx,W,H);
      for(var i=0;i<=64;i++){var x=L+(R-L)*(i/64);ctx.beginPath();ctx.arc(x,y,1,0,6.28);ctx.fillStyle=LINE;ctx.fill();}
      stages.forEach(function(s,i){var x=L+(R-L)*(i/(n-1)),f=(i===0);
        ctx.strokeStyle=f?ACC:'rgba(242,236,201,0.28)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,y-6);ctx.lineTo(x,y+6);ctx.stroke();
        mono(ctx,7.5);ctx.fillStyle=f?ACC:LBL;ctx.textAlign='center';ctx.fillText(s,x,y+20);});
      ctx.strokeStyle=ACC;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(L,30);ctx.lineTo(L,y-8);ctx.stroke();
      mono(ctx,10);ctx.fillStyle=ACC;ctx.textAlign='left';ctx.fillText('hmm enters',L+6,42);
      var ox=L+(R-L)*(2/(n-1));ctx.setLineDash([2,3]);ctx.strokeStyle='rgba(242,236,201,0.28)';ctx.beginPath();ctx.moveTo(ox,52);ctx.lineTo(ox,y-8);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=LBL;ctx.fillText('others enter',ox+6,60);
      for(var i=0;i<20;i++){var p=((t*0.1+i/20)%1),x=L+(R-L)*p,a=Math.sin(p*Math.PI);ctx.beginPath();ctx.arc(x,y-15,(i%6===0?2:1.2),0,6.28);ctx.fillStyle=rgba(PEARL,0.28+0.5*a);ctx.fill();}
    });
  }

  // ---- 09.B · build the go-to-market ----
  var m5=mount('figGTM',280);
  if(m5){
    frame(m5,function(t){var ctx=m5.ctx,W=m5.W(),H=m5.H(),cy=H*0.44;ticks(ctx,W,H);
      function blob(cx,r,col,alpha,off,label,sub){for(var i=0;i<64;i++){var ang=i*2.399+off,rr=r*Math.sqrt((i%32)/32),x=cx+Math.cos(ang)*rr,yy=cy+Math.sin(ang)*rr+Math.sin(t*0.6+i)*0.5;ctx.beginPath();ctx.arc(x,yy,i%7===0?1.8:1.05,0,6.28);ctx.fillStyle=rgba(col,alpha);ctx.fill();}
        mono(ctx,9);ctx.fillStyle=rgba(col,0.9);ctx.textAlign='center';ctx.fillText(label,cx,cy+r+18);ctx.fillStyle=LBL;ctx.fillText(sub,cx,cy+r+30);}
      var x1=W*0.19,x2=W*0.5,x3=W*0.83;
      blob(x1,30,PEARL,0.55,0,'BUILT','the technical half');
      mono(ctx,15);ctx.fillStyle=LBL;ctx.textAlign='center';ctx.fillText('+',(x1+x2)/2,cy+3);
      blob(x2,30,THESIS,0.5,1.3,'GO-TO-MARKET','hmm adds');
      ctx.strokeStyle=ACC;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x2+40,cy);ctx.lineTo(x3-46,cy);ctx.stroke();
      var ax=x3-46;ctx.fillStyle=ACC;ctx.beginPath();ctx.moveTo(ax,cy-4);ctx.lineTo(ax+6,cy);ctx.lineTo(ax,cy+4);ctx.fill();
      blob(x3,37,PEARL,0.72,2.1,'GLOBAL','a global company');
    });
  }

  // ---- 09.C · entry priced at home, value realised offshore ----
  var m6=mount('figArb',280);
  if(m6){
    frame(m6,function(t){var ctx=m6.ctx,W=m6.W(),H=m6.H(),base=H-42,x1=W*0.3,x2=W*0.7,bw=34,lowH=46,highH=H*0.6;ticks(ctx,W,H);
      function bar(cx,h,col,label,sub){for(var yy=base;yy>base-h;yy-=7){for(var xx=cx-bw/2;xx<=cx+bw/2;xx+=7){ctx.beginPath();ctx.arc(xx,yy,1.15,0,6.28);ctx.fillStyle=rgba(col,0.6);ctx.fill();}}
        mono(ctx,9);ctx.fillStyle=rgba(col,0.9);ctx.textAlign='center';ctx.fillText(label,cx,base+16);ctx.fillStyle=LBL;ctx.fillText(sub,cx,base+27);}
      bar(x1,lowH,PEARL,'HOME','entry valuation');
      bar(x2,highH,THESIS,'OFFSHORE','value realised');
      ctx.strokeStyle=ACC;ctx.lineWidth=1;ctx.setLineDash([2,3]);ctx.beginPath();ctx.moveTo(x1,base-lowH-6);ctx.lineTo(x2,base-highH-6);ctx.stroke();ctx.setLineDash([]);
      mono(ctx,10);ctx.fillStyle=ACC;ctx.textAlign='center';ctx.fillText('the arbitrage',(x1+x2)/2,base-((lowH+highH)/2)-12);
      for(var i=0;i<16;i++){var p=((t*0.12+i/16)%1),x=x1+(x2-x1)*p,y=(base-lowH-6)+((base-highH-6)-(base-lowH-6))*p;ctx.beginPath();ctx.arc(x,y,i%5===0?2:1.15,0,6.28);ctx.fillStyle=rgba(PEARL,0.28+0.5*Math.sin(p*Math.PI));ctx.fill();}
    });
  }

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
