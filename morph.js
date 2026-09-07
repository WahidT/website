/* hmm site - the flock. One persistent field of reused particles (R8) that FLIES from one necessity's
   machine to the next as you scroll: the same dots leave Power's spot and travel - curved, staggered,
   breathing, like a flock crossing - to land in Eat's, then Heal's, then AI. It does not fade out and
   fade in; it flows, location to location. Each section keeps a DWELL zone at centre where the real
   interactive schematic stands crisp; the flock takes the air only between them, and crossfades under
   the diagram at each end so there is no snap. Begins at the hero. Honours prefers-reduced-motion. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  var K=(typeof innerWidth!=='undefined'&&innerWidth<700)?240:460, PEARL=[242,236,201];   // fewer flock particles on phones
  var DWELL=0.13;    // each object (incl. the DWG-NEC machines) holds crisp around its centre before the flock breaks it apart
  var STAG=0.62;     // per-dot departure spread - higher = more staged, dots peel off in waves over the scroll
  var SMOOTH=0.045;  // temporal lag on the rendered position - low = dots ease into place, never snap even on fast scroll
  var ARC=1.0;       // curvature of the flight path (0 = straight)
  var CHAIN=[
    {id:'power',col:[224,129,46]},
    {id:'eat',  col:[79,138,91]},
    {id:'heal', col:[62,121,166]},
    {id:'s5',   col:[196,69,57]},
    {id:'s6',   col:[196,69,57], spine:true},    // dots transition in, then load straight top-to-bottom
    {id:'s7',   col:[242,236,201], geom:'#radars', sample:'.radar-line,.vtx,.radar-dot', hide:'.series'},   // fill the radar data, keep the grid
    {id:'s9',   col:[242,236,201]},              // sourcing figures (settles on whatever dot-field is present)
    {id:'sfoot',col:[242,236,201], geom:'.site-footer', sample:'.site-logo svg path', hide:'.site-logo'}   // the flock gathers into the wordmark at the very bottom
  ];

  var cv=document.createElement('canvas'); cv.id='morphfield'; cv.setAttribute('aria-hidden','true');
  cv.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:6;pointer-events:none;';
  document.body.appendChild(cv);
  var ctx=cv.getContext('2d'), DPR=Math.min(2,window.devicePixelRatio||1), W=0,H=0;
  function resize(){W=cv.width=Math.floor(innerWidth*DPR);H=cv.height=Math.floor(innerHeight*DPR);cv.style.width=innerWidth+'px';cv.style.height=innerHeight+'px';}
  resize();

  function primarySvg(sec){var best=null,bn=-1;sec.querySelectorAll('svg').forEach(function(s){var n=s.querySelectorAll('circle').length;if(n>bn){bn=n;best=s;}});return bn>20?best:null;}
  function sampleFrom(circles, ref){
    if(!circles.length) return null; var rr=ref.getBoundingClientRect(); if(!rr.width||!rr.height) return null;
    var step=circles.length/K, pts=new Array(K);
    for(var i=0;i<K;i++){var c=circles[Math.min(circles.length-1,Math.floor(i*step))];var r=c.getBoundingClientRect();
      var seed=((i*2654435761)%1000)/1000, seed2=((i*40503)%1000)/1000;
      pts[i]={nx:(r.left+r.width/2-rr.left)/rr.width, ny:(r.top+r.height/2-rr.top)/rr.height,
              s:(seed<0.14?1.9:seed<0.5?1.25:0.8), k:seed, k2:seed2, arc:(seed2<0.5?1:-1)*(0.5+seed)};}
    return pts;
  }
  // sample K points along ANY svg geometry (paths/polygons/lines by length, circles by centre),
  // normalised to a reference element's box - lets the flock trace charts, not just dot-fields.
  function sampleGeom(els, ref){
    var rr=ref.getBoundingClientRect(); if(!rr.width||!rr.height) return null;
    var geoms=[], total=0;
    Array.prototype.forEach.call(els,function(el){
      if(el.tagName.toLowerCase()==='circle'){geoms.push({el:el,kind:'pt',w:6});total+=6;}
      else{try{var Ln=el.getTotalLength();if(Ln>1){geoms.push({el:el,kind:'len',len:Ln,w:Ln});total+=Ln;}}catch(e){}}
    });
    if(!geoms.length||!total) return null;
    var raw=[];
    geoms.forEach(function(g){var n=Math.max(1,Math.round(K*g.w/total));
      for(var i=0;i<n;i++){var cx,cy;
        if(g.kind==='pt'){var r=g.el.getBoundingClientRect();cx=r.left+r.width/2;cy=r.top+r.height/2;}
        else{var m=g.el.getScreenCTM();if(!m)continue;var p=g.el.getPointAtLength(((i+0.5)/n)*g.len);var sp=p.matrixTransform(m);cx=sp.x;cy=sp.y;}
        raw.push([cx,cy]);}});
    if(!raw.length) return null;
    var pts=new Array(K);
    for(var i=0;i<K;i++){var s=raw[Math.floor(i*raw.length/K)]||raw[raw.length-1];var seed=((i*2654435761)%1000)/1000,seed2=((i*40503)%1000)/1000;
      pts[i]={nx:(s[0]-rr.left)/rr.width,ny:(s[1]-rr.top)/rr.height,s:(seed<0.14?1.9:seed<0.5?1.25:0.8),k:seed,k2:seed2,arc:(seed2<0.5?1:-1)*(0.5+seed)};}
    return pts;
  }
  function mk(col, ref, hide, pts){return {col:col,ref:ref,hide:hide,pts:pts};}

  var NODES=[], CX=new Float32Array(K), CY=new Float32Array(K), primed=false;
  function build(){
    NODES=[];
    // first shape: the hero necessity machines. Their dots are what stream down into the sections.
    // (the top-left logo is a plain static mark, deliberately NOT part of the flock.)
    var heroRow=document.getElementById('heroRow');
    if(heroRow){var hc=heroRow.querySelectorAll('circle');if(hc.length>20){var hp=sampleFrom(hc,heroRow);if(hp)NODES.push(mk(PEARL,heroRow,heroRow.querySelectorAll('svg'),hp));}}
    CHAIN.forEach(function(n){var sec=document.getElementById(n.id);if(!sec)return;
      if(n.geom){var cont=document.querySelector(n.geom);if(!cont)return;var els=cont.querySelectorAll(n.sample||'circle,path,polygon,polyline,line');var gp=sampleGeom(els,cont);if(!gp)return;var hideEls=n.hide?cont.querySelectorAll(n.hide):[cont];var gd=mk(n.col,cont,hideEls,gp);gd.spine=false;NODES.push(gd);return;}
      var svg=primarySvg(sec);if(!svg)return;var pts=sampleFrom(svg.querySelectorAll('circle'),svg);if(!pts)return;var nd=mk(n.col,svg,[svg],pts);nd.spine=!!n.spine;NODES.push(nd);});
  }

  function ss(a,b,x){var t=x<a?0:x>b?1:(x-a)/(b-a);return t*t*(3-2*t);}
  function eio(t){return t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;}
  function L(a,b,e){return a+(b-a)*e;}
  function cl01(x){return x<0?0:x>1?1:x;}
  function setOp(list,v){for(var i=0;i<list.length;i++)list[i].style.opacity=(v>=0.999?'':v.toFixed(3));}

  /* One frame per scroll event at most, and a self-sustaining loop only while a flight is in
     progress. The loop used to re-request itself unconditionally, so the page ran a full
     getBoundingClientRect sweep sixty times a second while nothing moved: above the first
     centre, below the last, and through every dwell. Now a scroll (or resize, or a rebuild)
     schedules one frame; that frame re-requests only when a pair is mid-flight, because the
     breath and the SMOOTH lag are the only things that change between scroll events. Hidden
     documents draw nothing; visibilitychange schedules the first frame back. */
  var queued=false;
  function schedule(){if(queued||document.hidden)return;queued=true;requestAnimationFrame(function(){queued=false;frame();});}
  var t0=0;
  function frame(){
    t0+=0.011;
    ctx.clearRect(0,0,W,H);
    if(NODES.length<2)return;
    var vc=innerHeight/2, rects=[], mids=[];
    for(var i=0;i<NODES.length;i++){var r=NODES[i].ref.getBoundingClientRect();rects.push(r);mids.push(r.top+r.height/2);}
    // everyone visible by default; the active pair overrides below
    for(var i=0;i<NODES.length;i++)setOp(NODES[i].hide,1);

    var pair=-1;
    for(var i=0;i<NODES.length-1;i++){if(vc>=mids[i]&&vc<mids[i+1]){pair=i;break;}}
    if(pair<0)return;                                     // above the first / below the last centre (keep prime so nothing snaps on return)

    var raw, sy=window.pageYOffset||document.documentElement.scrollTop||0;
    if(pair===NODES.length-2){
      // final leg: the footer centre sits below the reachable scroll, so drive t by progress to the page bottom
      var docH=document.documentElement.scrollHeight||document.body.scrollHeight;
      var maxY=Math.max(1,docH-innerHeight), startY=sy+mids[pair]-vc, denom=Math.max(1,maxY-startY);
      raw=(sy-startY)/denom;
    } else {
      raw=(vc-mids[pair])/(mids[pair+1]-mids[pair]);
    }
    var t = raw<=DWELL?0 : raw>=1-DWELL?1 : (raw-DWELL)/(1-2*DWELL);    // dwell plateaus at each centre
    var A=NODES[pair], B=NODES[pair+1], ar=rects[pair], br=rects[pair+1], toSpine=!!B.spine;
    setOp(A.hide, 1-ss(0,0.12,t));                                      // A crossfades out as the flock lifts
    setOp(B.hide, ss(0.88,1,t));                                        // B crossfades in as it lands
    if(t<=0.001||t>=0.999)return;                                 // full dwell: real diagram only (prime kept, no snap next flight)

    var acol=A.col, bcol=B.col, pearlMix=1-Math.sin(Math.PI*t), baseA=cl01((t/0.06)), baseB=cl01((1-t)/0.06);
    var fade=Math.min(baseA,baseB)*0.95;                               // dots ramp fast and stay lit across the flight
    for(var i=0;i<K;i++){
      var pa=A.pts[i], pb=B.pts[i];
      var ax=ar.left+pa.nx*ar.width, ay=ar.top+pa.ny*ar.height;        // take-off, inside A's box
      var bx=br.left+pb.nx*br.width, by=br.top+pb.ny*br.height;        // landing, inside B's box
      var lt=cl01((t - (toSpine?pb.ny:pa.k)*STAG)/(1-STAG)), e=eio(lt); // spine: stagger by target y = top-to-bottom load
      var px=L(ax,bx,e), py=L(ay,by,e);
      var dx=bx-ax, dy=by-ay, len=Math.sqrt(dx*dx+dy*dy)||1;
      var bow=toSpine?0:Math.sin(Math.PI*e)*pa.arc*ARC*(24+len*0.10);   // no curve into the spine - straight
      px += (-dy/len)*bow; py += (dx/len)*bow;
      px += Math.cos(t0*0.6+pa.k*6.283)*2.4; py += Math.sin(t0*0.7+pa.k*6.283)*2.4;  // breath
      if(!primed){CX[i]=px;CY[i]=py;}
      CX[i]+=(px-CX[i])*SMOOTH; CY[i]+=(py-CY[i])*SMOOTH;              // calm lag
      var base=[L(acol[0],bcol[0],t),L(acol[1],bcol[1],t),L(acol[2],bcol[2],t)];
      var cr=(L(base[0],PEARL[0],pearlMix)|0),cg=(L(base[1],PEARL[1],pearlMix)|0),cb=(L(base[2],PEARL[2],pearlMix)|0);
      var op=fade*(pa.s>1.5?1:0.82);
      if(op<=0.003) continue;
      ctx.beginPath();ctx.arc(CX[i]*DPR,CY[i]*DPR,pa.s*DPR,0,6.283);
      ctx.fillStyle='rgba('+cr+','+cg+','+cb+','+op.toFixed(3)+')';ctx.fill();
    }
    primed=true;
    schedule();                                                        // mid-flight: keep the breath and the lag moving
  }

  function rebuild(){build();schedule();}
  function boot(){rebuild();setTimeout(rebuild,900);}  // re-sample once late-rendering charts (radars, density) are laid out
  var rt=null; addEventListener('resize',function(){resize();clearTimeout(rt);rt=setTimeout(rebuild,180);});
  addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('visibilitychange',function(){if(!document.hidden)schedule();});
  if(document.readyState==='complete')boot(); else addEventListener('load',boot);
})();
