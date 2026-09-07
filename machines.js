/* Tokens, read at paint time. These figures hardcoded colour because
   nothing handed it to them; reading the custom property also means a theme
   change reaches the canvas, which a frozen hex never could. */
function __T(n, fallback) {
  var v = getComputedStyle(document.documentElement).getPropertyValue(n);
  return (v && v.trim()) || fallback;
}
/* hmm site - reusable necessity machines (canonical set, GP-ruled).
   Power = distribution transformer (buildXfmr) · Eat = harvester pickup reel (buildReel) ·
   Heal = needle / auto-injector (buildInjector). Geometry lifted verbatim from the demos
   (_demo/transformer-blowout.html, eat.html, heal-blowout.html). Each builder is closured so its
   helper names never collide. Layers are tagged col in {PEARL, ACC (verb-part), FAINT, AXIS}.
   Necessity accent colours: power #FF730B, eat #4F8A5B, heal #8752A5. Requires scripts/hmm-svg.js (hmmH, hmmRender). */
var HMM = (function(){
  var h = window.hmmH, PEARL=__T("--hmm-pearl-beige", "#F2ECC9");
  function seededRnd(s){s=s||1;return function(){s=(Math.imul(s,1103515245)+12345)&0x7fffffff;return s/0x7fffffff;};}

  /* ===================== transformer ===================== */
  var buildXfmr = (function(){
    function ld(a,b,n){n=n||Math.max(3,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/5));var q=[];for(var i=0;i<=n;i++){var t=i/n;q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return q;}
    function ell(cx,cy,rx,ry,st){st=st||Math.max(20,Math.round(rx*1.2));var q=[];for(var i=0;i<st;i++){var a=i/st*6.2832;q.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);}return q;}
    function box2(x,y,w,hh){return ld([x,y],[x+w,y]).concat(ld([x+w,y],[x+w,y+hh]),ld([x+w,y+hh],[x,y+hh]),ld([x,y+hh],[x,y]));}
    function vcyl(cx,cy,r,H){var ry=r*0.32,q=[];function e(v,st){st=st||30;for(var i=0;i<st;i++){var a=i/st*6.2832;q.push([cx+r*Math.cos(a),cy+v+ry*Math.sin(a)]);}}e(0);e(-H);q=q.concat(ld([cx-r,cy],[cx-r,cy-H],9),ld([cx+r,cy],[cx+r,cy-H],9));return q;}
    function fins(cx,cy,r,H,n){var q=[];for(var i=1;i<n;i++){var t=-1+2*i/n,x=cx+r*t*0.9;q=q.concat(ld([x,cy-H+(r*0.32)*(1-Math.sqrt(1-t*t*0.85))],[x,cy-(r*0.32)*(1-Math.sqrt(1-t*t*0.85))],11));}return q;}
    function core(cx,cy,w,hh,limb){return box2(cx-w/2,cy-hh/2,w,hh).concat(box2(cx-w/2+limb,cy-hh/2+limb,w-2*limb,hh-2*limb));}
    function bushing(x,yb,htop,discs){var q=ld([x,yb],[x,yb-htop],5);for(var i=0;i<discs;i++){var y=yb-htop*(i+0.5)/discs,r=10-6*(i/discs);q=q.concat(ell(x,y,r,3.4,12));}return q;}
    var CX=500;
    return function(){var out=[];
      out.push({pts:vcyl(CX,564,94,152).concat(fins(CX,564,94,152,12),ell(CX,564,94,30)),col:"PEARL",big:true});
      var ccy=404;
      out.push({pts:core(CX,ccy,124,122,22),col:"PEARL"});
      out.push({pts:vcyl(CX-38,ccy+46,33,92).concat(vcyl(CX+38,ccy+46,33,92)),col:"ACC",big:true});
      out.push({pts:ell(CX,252,92,27),col:"PEARL",big:true});
      out.push({pts:bushing(CX,226,74,6).concat(bushing(CX-36,226,48,4),bushing(CX+36,226,48,4)),col:"PEARL",big:true});
      for(var y=150;y<590;y+=12)out.push({pts:[[CX,y]],col:"AXIS"});
      return out;};
  })();
  var XFMR_CALL=[
    ["01","HV + LV BUSHINGS",["the terminals in","and out"],[500,196],"R",120,false],
    ["02","CORE + WINDINGS",["the transform: high","volts to low"],[540,430],"R",286,true],
    ["03","TANK + COOLING FINS",["oil-filled, sealed;","sheds the heat"],[452,520],"L",300,false],
    ["04","THE POLE UNIT",["what steps the grid","down to your street"],[560,150],"R",452,false]
  ];

  /* ===================== reel ===================== */
  var buildReel = (function(){
    var TH=0.15, AX=[Math.cos(TH),Math.sin(TH)], PE=[-Math.sin(TH),Math.cos(TH)], FORE=0.42, ST=[236,282], R=98;
    function at(s){return [ST[0]+AX[0]*s, ST[1]+AX[1]*s];}
    function on(c,r,a){return [c[0]+r*Math.cos(a)*PE[0]+r*Math.sin(a)*AX[0]*FORE, c[1]+r*Math.cos(a)*PE[1]+r*Math.sin(a)*AX[1]*FORE];}
    function ellP(c,r,st){st=st||Math.max(30,Math.round(r*1.0));var a=[];for(var i=0;i<st;i++)a.push(on(c,r,i/st*6.2832));return a;}
    function lineP(a,b,n){n=n||Math.max(2,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/7));var p=[];for(var i=0;i<=n;i++){var t=i/n;p.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return p;}
    function drum(s1,s2,r,rings,cols){var p=ellP(at(s1),r).concat(ellP(at(s2),r));for(var i=1;i<rings;i++)p=p.concat(ellP(at(s1+(s2-s1)*i/rings),r));var da=6.2832/cols;for(var j=0;j<cols;j++){var a=j*da;if(Math.sin(a)>-0.3)p=p.concat(lineP(on(at(s1),r,a),on(at(s2),r,a),Math.round((s2-s1)/9)));}return p;}
    function star(s,r,spokes){var c=at(s),p=ellP(c,r*0.2,10);for(var i=0;i<spokes;i++){var a=i/spokes*6.2832;p=p.concat(lineP(on(c,r*0.2,a),on(c,r,a),8));}return p;}
    function tine(c,a,L){var p=lineP(on(c,R,a),on(c,R+L,a),7);for(var i=1;i<=7;i++){var t=i/7;p.push(on(c,R+L-t*t*10,a-0.95*t));}return p;}
    function tines(){var p=[],rows=7;for(var ri=0;ri<rows;ri++){var s=44+ri*88;var c=at(s);for(var k=0;k<9;k++){var a=k/9*6.2832;if(Math.sin(a)>-0.15)p=p.concat(tine(c,a,60));}}return p;}
    function belt(){var y1=512,y2=548,x1=210,x2=930,p=lineP([x1,y1],[x2,y1]).concat(lineP([x1,y2],[x2,y2]),lineP([x1,y1],[x1,y2]),lineP([x2,y1],[x2,y2]));for(var x=x1+26;x<x2;x+=32){p=p.concat(lineP([x,y1],[x-15,y2],4));p.push([x-7,(y1+y2)/2]);}return p;}
    function drive(){var C=at(600),P=[C[0]+120,C[1]+40];var p=ellP(P,32).concat(ellP(P,13));p=p.concat(lineP([C[0]+R*0.45,C[1]],P,10));p=p.concat(lineP(P,[P[0]+74,P[1]-12],8),ellP([P[0]+74,P[1]-12],11));p=p.concat(lineP([P[0]-26,P[1]-18],[C[0]+R*0.15,C[1]-R*0.6],9),lineP([P[0]-26,P[1]+18],[C[0]+R*0.15,C[1]+R*0.6],9));return p;}
    function frame(){var p=lineP([320,132],[900,132]).concat(lineP([320,132],[308,196]),lineP([900,132],[888,196]));for(var x=352;x<880;x+=32)p.push([x,188]);return p;}
    return function(){return [
      {pts:frame(),col:"FAINT"},{pts:belt(),col:"PEARL"},{pts:drum(0,600,R,10,22),col:"PEARL",big:true},
      {pts:star(0,R,12).concat(star(600,R,12)),col:"PEARL"},{pts:tines(),col:"PEARL",big:true},{pts:drive(),col:"ACC",big:true}
    ];};
  })();
  var REEL_CALL=[
    ["01","REEL DRUM",["the spinning barrel,","carries the tine bars"],[492,321],"L",96,false],
    ["02","SPRING TINES",["the fingers that comb","the crop off the ground"],[472,398],"L",300,false],
    ["03","PICKUP CONVEYOR",["the belt below; carries","crop back to the auger"],[570,530],"R",96,false],
    ["04","REEL DRIVE",["what turns the reel;","sets the sweep"],[949,412],"R",300,true]
  ];

  /* ===================== injector ===================== */
  var buildInjector = (function(){
    function ld(a,b,n){n=n||Math.max(3,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/5));var q=[];for(var i=0;i<=n;i++){var t=i/n;q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return q;}
    function eH(cx,cy,rx,ry,st){st=st||28;var q=[];for(var i=0;i<st;i++){var a=i/st*6.2832;q.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);}return q;}
    function vcyl(cx,y1,y2,r){var ry=r*0.32;return eH(cx,y1,r,ry).concat(eH(cx,y2,r,ry),ld([cx-r,y1],[cx-r,y2],13),ld([cx+r,y1],[cx+r,y2],13));}
    function vspring(cx,y1,y2,r,turns){var q=[],n=turns*24;for(var i=0;i<=n;i++){var t=i/n,y=y1+(y2-y1)*t,a=t*turns*6.2832;q.push([cx+r*Math.sin(a),y]);}return q;}
    function coneDown(cx,yT,yB,r){return ld([cx-r,yT],[cx,yB],10).concat(ld([cx+r,yT],[cx,yB],10),eH(cx,yT,r,r*0.32));}
    var CX=500;
    return function(){var out=[];
      out.push({pts:vcyl(CX,110,154,34).concat(ld([CX-34,126],[CX+34,126],10),ld([CX-34,140],[CX+34,140],10)),col:"PEARL",big:true});
      out.push({pts:vcyl(CX,178,300,48),col:"PEARL",big:true});
      out.push({pts:vspring(CX,320,406,28,6),col:"PEARL",big:true});
      out.push({pts:ld([CX,420],[CX,452],8).concat(eH(CX,420,8,4)),col:"PEARL"});
      out.push({pts:vcyl(CX,466,566,40).concat(eH(CX,540,14,5)),col:"ACC",big:true});
      out.push({pts:ld([CX,578],[CX,610],12).concat(eH(CX,578,10,4)),col:"PEARL",big:true});
      out.push({pts:coneDown(CX,614,648,26),col:"PEARL",big:true});
      for(var y=96;y<648;y+=12)out.push({pts:[[CX,y]],col:"AXIS"});
      return out;};
  })();
  var INJ_CALL=[
    ["04","BODY + DOSE DIAL",["what a patient holds","and turns"],[500,232],"L",120,false],
    ["03","DRIVE SPRING",["fires the plunger","on a click"],[500,362],"R",130,false],
    ["02","DRUG CARTRIDGE",["the payload; the dose","the device meters"],[500,516],"R",300,true],
    ["01","NEEDLE + SHIELD",["hidden until fired;","one clean dose"],[500,628],"L",452,false]
  ];

  var MACH = {
    power:{vb:[0,0,1080,660], iconVB:"384 138 232 476", build:buildXfmr, seed:7,  accent:__T("--hmm-nec-power", "#FF730B"), call:XFMR_CALL, ch1:1056,chy:636},
    eat:  {vb:[0,0,1080,620], iconVB:"128 152 828 420", build:buildReel, seed:11, accent:__T("--hmm-nec-eat", "#4F8A5B"), call:REEL_CALL, ch1:1064,chy:604},
    heal: {vb:[0,0,1080,660], iconVB:"432 92 136 566",  build:buildInjector, seed:17, accent:__T("--hmm-nec-heal", "#8752A5"), call:INJ_CALL, ch1:1064,chy:644}
  };

  function dotsOf(kind){
    var spec=MACH[kind], rnd=seededRnd(spec.seed), kc=0, out=[];
    spec.build().forEach(function(L){L.pts.forEach(function(p){var q=rnd(),big=L.big,acc=L.col==="ACC";
      var r=big?(q<.16?2.0:q<.5?1.4:1.0):(q<.12?1.6:q<.45?1.1:.8);
      var op=big?(q<.16?1:.55+q*.4):(q<.12?.85:.55+q*.35);
      var fill=acc?spec.accent:(L.col==="FAINT"?"rgba(242,236,201,.32)":(L.col==="AXIS"?"rgba(242,236,201,.26)":PEARL));
      out.push(h("circle",{key:kc++,cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:r,fill:fill,opacity:op}));});});
    return out;
  }

  /* bare dotted machine icon (hero) */
  function Icon(kind){return h("svg",{viewBox:MACH[kind].iconVB,style:{width:"100%",height:"100%",overflow:"visible"},role:"img","aria-label":kind+" machine"}, dotsOf(kind));}

  /* full blow-out: dots + leader callouts + corner ticks (necessity sections) */
  function Blowout(kind){
    var spec=MACH[kind], A=spec.accent, FN="rgba(242,236,201,.45)", vb=spec.vb, W=vb[2], BW=232, BH=84, els=[];
    spec.call.forEach(function(c,i){var left=c[4]==="L",bx=left?24:W-24-BW,by=c[5],col=c[6]?A:PEARL,p=c[3],anchor=[left?bx+BW:bx,by+BH/2],midx=(anchor[0]+p[0])/2;
      els.push(h("polyline",{key:"ld"+i,points:anchor[0]+","+anchor[1]+" "+midx+","+anchor[1]+" "+p[0]+","+p[1],fill:"none",stroke:c[6]?A:"rgba(242,236,201,.5)",strokeWidth:1}));
      els.push(h("circle",{key:"fd"+i,cx:p[0],cy:p[1],r:c[6]?4:3,fill:col}));
      if(c[6])els.push(h("circle",{key:"mg"+i,cx:p[0],cy:p[1],r:22,fill:"none",stroke:A,strokeWidth:1}));
      var box=[
        h("rect",{key:"bx",x:bx,y:by,width:BW,height:BH,fill:"rgba(20,20,20,0.9)",stroke:col,strokeWidth:c[6]?1.5:1}),
        h("text",{key:"ix",x:bx+13,y:by+21,fontFamily:"Raela Grotesque",fontWeight:700,fontSize:11,letterSpacing:1.4,fill:c[6]?A:FN},c[0]),
        h("text",{key:"ti",x:bx+36,y:by+21,fontFamily:"Raela Grotesque",fontWeight:700,fontSize:12.5,letterSpacing:.7,fill:col},c[1]),
        h("line",{key:"rl",x1:bx+13,y1:by+30,x2:bx+BW-13,y2:by+30,stroke:"rgba(242,236,201,.2)",strokeWidth:.75})
      ];
      c[2].forEach(function(ln,k){box.push(h("text",{key:"nt"+k,x:bx+13,y:by+50+k*17,fontFamily:"Raela Grotesque",fontSize:12.5,fill:"rgba(242,236,201,.82)"},ln));});
      els.push(h("g",{key:"c"+i,className:"callout callout--"+(left?"L":"R"),tabIndex:0,role:"group","aria-label":c[1]+". "+c[2].join(" ")},box));});
    [[16,16,12,12],[spec.ch1,16,-12,12],[16,spec.chy,12,-12],[spec.ch1,spec.chy,-12,-12]].forEach(function(t,i){els.push(h("line",{key:"ca"+i,x1:t[0],y1:t[1],x2:t[0]+t[2],y2:t[1],stroke:A,strokeWidth:1}));els.push(h("line",{key:"cb"+i,x1:t[0],y1:t[1],x2:t[0],y2:t[1]+t[3],stroke:A,strokeWidth:1}));});
    return h("svg",{viewBox:vb.join(" "),role:"img","aria-label":kind+" machine, blow-out drawing",style:{width:"100%",height:"100%",overflow:"visible"}}, dotsOf(kind), els);
  }

  function breathe(mount){setTimeout(function(){var svg=mount.querySelector('svg');if(svg&&window.hmmAnimateDots)window.hmmAnimateDots(svg,{motion:"breath"});},300);}
  function renderIcon(mount,kind){hmmRender(mount,Icon(kind));breathe(mount);}
  function renderBlowout(mount,kind){hmmRender(mount,Blowout(kind));breathe(mount);}

  return {renderIcon:renderIcon, renderBlowout:renderBlowout, accent:function(k){return MACH[k].accent;}};
})();
