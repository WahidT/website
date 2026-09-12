/* hmm site - reusable necessity machines (canonical set, GP-ruled).
   Power = distribution transformer (buildXfmr) · Eat = harvester pickup reel (buildReel) ·
   Heal = needle / auto-injector (buildInjector). Geometry lifted verbatim from the demos
   (_demo/transformer-blowout.html, eat.html, heal-blowout.html). Each builder is closured so its
   helper names never collide. Layers are tagged col in {PEARL, ACC (verb-part), FAINT, AXIS}.
   Necessity accent colours: power #FF730B, eat #4F8A5B, heal #8752A5. Requires theme.js (__T, __onTheme)
   and scripts/hmm-svg.js (hmmH, hmmRender).

   A second set draws the instrument each market has already exported, on the same engine and in
   the same register: implant = the multichannel cochlear implant (buildImplant, Australia, heal
   accent), anode = the carbonaceous anode that made a lithium-ion cell manufacturable
   (buildAnode, Japan, power accent), energiser = the battery electric-fence energiser and its
   distribution (buildEnergiser, New Zealand, eat accent). The accent is the market's necessity,
   so the same token carries both sets and an instrument reads as belonging to its lead. Each
   builder's ACC layer is the part the value settled on: the electrode array, the graphite anode,
   the capacitor discharge stage. Seeds 23, 29 and 31, so the dot field is stable per machine. */
var HMM = (function(){
  var h = window.hmmH;
  /* Read at render, never at load, so a data-theme flip reaches the next paint. */
  function PEARL_(){return __T("--hmm-pearl-beige", "#F2ECC9");}
  function accentOf(spec){return __T(spec.tok, spec.fb);}
  /* The identity colour as TEXT on the dark callout box. The base hues sit at
     6.76 (Power), 4.49 (Eat) and 3.32 (Heal) against #141414; the -dark
     variants clear 4.5 at 8.53, 4.55 and 4.58. Dots and strokes keep the base. */
  function accentText(spec){return __T(spec.tok + "-dark", spec.fbText);}
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

  /* ===================== cochlear implant ===================== */
  /* Australia / Heal. The multichannel implant: Melbourne 1978, FDA adult clearance 1985.
     Drawn as the device sits on a bench, left to right: receiver coil, stimulator, lead, array.
     ACC is the electrode array, because that is the part that hears. The carrier tapers from
     base to tip and curls about one and a half turns, which is how far into the duct it goes,
     and each platinum band across it answers to one band of frequency.
     Nothing here is drawn closer than about sixteen units to its neighbour: at this dot size a
     narrower gap reads as one grey mass rather than as two parts. */
  var buildImplant = (function(){
    function iLd(a,b,n){n=n||Math.max(3,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/6));var q=[];for(var i=0;i<=n;i++){var t=i/n;q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return q;}
    function iEll(cx,cy,rx,ry,st){st=st||Math.max(16,Math.round((rx+ry)*0.5));var q=[];for(var i=0;i<st;i++){var a=i/st*6.2832;q.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);}return q;}
    function iQd(a,k,b,n){var q=[];for(var i=0;i<=n;i++){var t=i/n,m=1-t;q.push([m*m*a[0]+2*m*t*k[0]+t*t*b[0],m*m*a[1]+2*m*t*k[1]+t*t*b[1]]);}return q;}
    /* a tube of half-width w around a sampled path: offset each sample along its own normal */
    function iTube(path,w){var L=[],R=[];for(var i=0;i<path.length;i++){var a=path[Math.max(0,i-1)],b=path[Math.min(path.length-1,i+1)];var dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;L.push([path[i][0]-dy/d*w,path[i][1]+dx/d*w]);R.push([path[i][0]+dy/d*w,path[i][1]-dx/d*w]);}return L.concat(R);}
    var COIL=[248,336], RC=88, LOBE=[360,386], RL=46;
    /* the array: radius falls geometrically from A_OUT at the round window to A_IN at the tip
       over A_TURNS, so the curl tightens the way the duct does. u runs 0 at base to 1 at tip. */
    var CUR=[796,384], A_OUT=100, A_IN=30, A_TURNS=1.4, A_PH=2.85;
    function aPt(u,dr){var t=u*A_TURNS*6.2832,r=A_IN*Math.pow(A_OUT/A_IN,1-u)+(dr||0),a=t+A_PH;return [CUR[0]+r*Math.cos(a),CUR[1]+r*Math.sin(a)];}
    function aHalf(u){return 15-9*u;}   /* the carrier tapers, base to tip */
    function aWall(sgn,st){var q=[];for(var i=0;i<=st;i++){var u=i/st;q.push(aPt(u,sgn*aHalf(u)));}return q;}
    function aBands(n){var q=[];for(var i=0;i<n;i++){var u=0.03+i*(0.94/(n-1)),w=aHalf(u);q=q.concat(iLd(aPt(u,-w),aPt(u,w),3));}return q;}
    return function(){var out=[], i;
      /* body: the coil disc, the stimulator lobe, and the silicone web that joins them into one
         teardrop. The web runs on the two tangents, which is what gives the device its waist. */
      var web=iLd([COIL[0]+RC*Math.cos(1.82),COIL[1]+RC*Math.sin(1.82)],[LOBE[0]+RL*Math.cos(1.82),LOBE[1]+RL*Math.sin(1.82)])
        .concat(iLd([COIL[0]+RC*Math.cos(-1.32),COIL[1]+RC*Math.sin(-1.32)],[LOBE[0]+RL*Math.cos(-1.32),LOBE[1]+RL*Math.sin(-1.32)]));
      out.push({pts:iEll(COIL[0],COIL[1],RC,RC).concat(iEll(LOBE[0],LOBE[1],RL,RL*0.9),web),col:"PEARL",big:true});
      /* the receive coil itself, drawn the way a coil is drawn in plan: concentric turns, not a
         spiral. A spiral at this dot size reads as a galaxy, which is the thing it was mistaken for. */
      out.push({pts:iEll(COIL[0],COIL[1],64,64).concat(iEll(COIL[0],COIL[1],47,47)),col:"PEARL"});
      /* centring magnet at the coil axis */
      out.push({pts:iEll(COIL[0],COIL[1],21,21,16).concat(iLd([COIL[0]-10,COIL[1]],[COIL[0]+10,COIL[1]],4),iLd([COIL[0],COIL[1]-10],[COIL[0],COIL[1]+10],4)),col:"PEARL",big:true});
      /* the hermetic can inside the lobe, and the feedthroughs the wires leave by */
      var can=iEll(LOBE[0],LOBE[1],33,27);
      for(i=0;i<3;i++)can=can.concat(iEll(LOBE[0]+19,LOBE[1]-16+i*16,4.5,4.5,7));
      out.push({pts:can,col:"PEARL"});
      /* lead: a silicone tube from the lobe to the round window, wire bundle showing through */
      var path=iQd([406,398],[560,458],aPt(0,0),34);
      out.push({pts:iTube(path,7),col:"PEARL",big:true});
      var hx=[];for(i=0;i<=80;i++){var t2=i/80,p=path[Math.round(t2*(path.length-1))];hx.push([p[0],p[1]+4.4*Math.sin(t2*24)]);}
      out.push({pts:hx,col:"FAINT"});
      /* ACC: the array. Tapered carrier, 22 platinum bands, base to apex. */
      out.push({pts:aWall(1,96).concat(aWall(-1,96),aBands(22)),col:"ACC",big:true});
      /* modiolar axis */
      for(var y=300;y<474;y+=12)out.push({pts:[[CUR[0],y]],col:"AXIS"});
      return out;};
  })();
  var IMPL_CALL=[
    ["01","RECEIVER COIL + MAGNET",["takes power and signal","through closed skin"],[248,336],"L",86,false],
    ["02","ELECTRODE ARRAY",["22 platinum bands, wound","into the cochlear duct"],[790,290],"R",110,true],
    ["03","LEAD + WIRE BUNDLE",["one wire per band, from","stimulator to array"],[600,458],"R",462,false],
    ["04","STIMULATOR + FEEDTHROUGHS",["sealed electronics; the","wires leave one at a time"],[360,386],"L",470,false]
  ];
  /* ===================== lithium-ion cell, carbon anode ===================== */
  /* Japan / Power. Three views of one cell: the cylinder in elevation with the can cut away, the
     roll in section, and the sandwich unrolled. Lithium metal plates dendrites and shorts the
     cell, so the anode that shipped holds lithium between graphite basal planes instead of
     plating it onto a surface. ACC is that layer, in all three views.
     Layer pitch is never below about sixteen units anywhere on this drawing. An earlier version
     wound the real number of turns at the real pitch and the section closed into a grey disc,
     which is the one thing a section is drawn to avoid. */
  var buildAnode = (function(){
    function nLd(a,b,n){n=n||Math.max(3,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/6));var q=[];for(var i=0;i<=n;i++){var t=i/n;q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return q;}
    function nEll(cx,cy,rx,ry,st){st=st||Math.max(16,Math.round((rx+ry)*0.5));var q=[];for(var i=0;i<st;i++){var a=i/st*6.2832;q.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);}return q;}
    function nCyl(cx,y1,y2,r,f){var ry=r*(f||0.3);return nEll(cx,y1,r,ry).concat(nEll(cx,y2,r,ry),nLd([cx-r,y1],[cx-r,y2]),nLd([cx+r,y1],[cx+r,y2]));}
    /* the roll in section. Three turns at a pitch of 28, not the real count at the real pitch:
       anode on one curve, cathode on the other, separator named in the callout rather than drawn. */
    var SC=[768,266], R0=22, R1=94, TRN=3;
    function nSpir(dr,st){var q=[];for(var i=0;i<=st;i++){var t=i/st*TRN*6.2832,r=R0+(R1-R0)*(i/st)+dr;q.push([SC[0]+r*Math.cos(t),SC[1]+r*Math.sin(t)]);}return q;}
    /* the same sandwich unrolled: five strata, each deep enough to read as its own band */
    var DX0=556, DX1=812;
    function nBand(y0,y1){return nLd([DX0,y0],[DX1,y0]).concat(nLd([DX0,y1],[DX1,y1]),nLd([DX0,y0],[DX0,y1]),nLd([DX1,y0],[DX1,y1]));}
    var CX=300, RCAN=88, TOP=182, BOT=596;
    return function(){var out=[], i;
      /* positive cap: the button, and the shoulder the vent sits under */
      out.push({pts:nCyl(CX,146,170,28,0.36).concat(nEll(CX,146,28,10)),col:"PEARL",big:true});
      /* the can: crimp bead below the cap, straight wall, closed base */
      out.push({pts:nCyl(CX,TOP,BOT,RCAN).concat(nEll(CX,TOP-14,RCAN-10,(RCAN-10)*0.3),nEll(CX,BOT,RCAN-34,(RCAN-34)*0.3)),col:"PEARL",big:true});
      /* the wound layers seen edge-on through the cutaway: cathode outside the anode, both
         turning about the mandrel. Pitch 24, so each layer stays its own line. */
      var cat=[], an=[];
      [-64,64].forEach(function(dx){cat=cat.concat(nLd([CX+dx,220],[CX+dx,550]));});
      [-42,-20,20,42].forEach(function(dx){an=an.concat(nLd([CX+dx,220],[CX+dx,550]));});
      out.push({pts:cat,col:"PEARL"});
      /* the label wrap, top and bottom edge */
      out.push({pts:nEll(CX,250,RCAN,RCAN*0.3).concat(nEll(CX,540,RCAN,RCAN*0.3)),col:"FAINT"});
      /* section: the can wall in true plan, the mandrel it is wound on, the cathode turn */
      out.push({pts:nEll(SC[0],SC[1],124,124).concat(nEll(SC[0],SC[1],14,14,12)),col:"PEARL",big:true});
      out.push({pts:nSpir(15,150),col:"PEARL"});
      /* unrolled: aluminium foil, cathode, separator, copper foil. The anode band is ACC. */
      out.push({pts:nBand(424,450).concat(nBand(450,486)),col:"PEARL"});
      out.push({pts:nBand(486,512),col:"FAINT"});
      out.push({pts:nBand(556,584),col:"PEARL"});
      /* ACC: the carbon anode, in the cutaway, in the section, and resolved in the stack */
      var acc=an.concat(nSpir(0,150),nBand(512,556));
      acc=acc.concat(nLd([DX0+8,527],[DX1-8,527]),nLd([DX0+8,542],[DX1-8,542]));
      out.push({pts:acc,col:"ACC",big:true});
      /* lithium sitting between the planes, never on them */
      var li=[];for(i=0;i<3;i++)for(var x=DX0+20;x<=DX1-20;x+=26)li.push([x,519.5+i*15]);
      out.push({pts:li,col:"PEARL"});
      /* the bracket that says the stack below is the strip above, unrolled */
      out.push({pts:nLd([SC[0]-120,SC[1]+40],[DX0,410],18).concat(nLd([SC[0]+96,SC[1]+82],[DX1,410],16)),col:"FAINT"});
      for(var y=138;y<612;y+=12)out.push({pts:[[CX,y]],col:"AXIS"});
      return out;};
  })();
  var ANODE_CALL=[
    ["01","POSITIVE CAP + VENT",["the terminal, and the","seal that fails safely"],[300,156],"L",86,false],
    ["02","WOUND ROLL, IN SECTION",["anode, separator, cathode,","wound as one strip"],[768,142],"R",96,false],
    ["03","CARBON ANODE",["lithium sits between the","basal planes, not on them"],[690,534],"R",430,true],
    ["04","STEEL CAN + BASE",["sealed, and negative;","the cell ships as a part"],[300,590],"L",470,false]
  ];
  /* ===================== electric-fence energiser ===================== */
  /* New Zealand / Eat. The battery energiser and the distribution that put it on farms. The case
     is drawn as the signal runs through it, left to right: battery, capacitor bank, discharge
     stage, pulse transformer, output bushing, and then one wire to the horizon over an earth
     return. ACC is the capacitor discharge stage, because the dump is the whole instrument: a
     continuous supply at fence voltage would kill, so the rest between pulses is what makes a
     lethal voltage safe to string across a farm. Parts are spaced at least twenty units apart;
     an earlier version stacked them inside a smaller case and the internals read as one blot. */
  var buildEnergiser = (function(){
    function eLd(a,b,n){n=n||Math.max(3,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/6));var q=[];for(var i=0;i<=n;i++){var t=i/n;q.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}return q;}
    function eBox(x,y,w,hh){return eLd([x,y],[x+w,y]).concat(eLd([x+w,y],[x+w,y+hh]),eLd([x+w,y+hh],[x,y+hh]),eLd([x,y+hh],[x,y]));}
    function eEll(cx,cy,rx,ry,st){st=st||Math.max(16,Math.round((rx+ry)*0.5));var q=[];for(var i=0;i<st;i++){var a=i/st*6.2832;q.push([cx+rx*Math.cos(a),cy+ry*Math.sin(a)]);}return q;}
    function eCyl(cx,y1,y2,r){var ry=r*0.34;return eEll(cx,y1,r,ry).concat(eEll(cx,y2,r,ry),eLd([cx-r,y1],[cx-r,y2]),eLd([cx+r,y1],[cx+r,y2]));}
    /* the fence recedes: the wire rises to the right and the ground rises with it, so the run
       reads as distance rather than as a second horizontal rule. */
    function wireY(x){return 300-(x-648)/396*54;}
    function gndY(x){return 486-(x-110)/934*30;}
    var BUS=[648,300];
    return function(){var out=[], i;
      /* case and lid */
      out.push({pts:eBox(110,190,538,262).concat(eLd([110,226],[648,226])),col:"PEARL",big:true});
      /* battery: three cells in a block, terminals on top */
      var bt=eBox(142,292,130,108).concat(eLd([185,292],[185,400]),eLd([228,292],[228,400]),eEll(160,288,8,5,9),eEll(254,288,8,5,9));
      out.push({pts:bt,col:"PEARL"});
      /* pulse transformer: core window, primary and secondary on the two limbs */
      var tr=eBox(486,256,124,96).concat(eBox(508,278,80,52));
      for(i=0;i<5;i++)tr=tr.concat(eEll(497,288+i*14,14,4,9),eEll(599,288+i*14,14,4,9));
      out.push({pts:tr,col:"PEARL"});
      /* the wire chain the pulse travels: battery to bank, bank to stage, stage to transformer,
         transformer to the bushing on the case wall */
      out.push({pts:eLd([272,330],[300,330]).concat(eLd([424,330],[432,330]),eLd([478,330],[486,330]),eLd([610,304],[648,300])),col:"PEARL"});
      /* ACC: the bank, and the stage that dumps it */
      var cp=eCyl(326,296,398,26).concat(eCyl(398,296,398,26),eLd([326,288],[326,270]),eLd([398,288],[398,270]),eLd([326,270],[398,270]));
      cp=cp.concat(eLd([432,302],[432,358]),eLd([432,302],[478,330]),eLd([432,358],[478,330]),eLd([455,344],[455,376]),eLd([443,376],[467,376]));
      out.push({pts:cp,col:"ACC",big:true});
      /* output bushing, and the wire leaving the case for the fence */
      out.push({pts:eEll(BUS[0],BUS[1],10,15,12).concat(eEll(BUS[0]+13,BUS[1],6,10,9)),col:"PEARL",big:true});
      var fw=eLd(BUS,[1044,246],58);
      /* posts, insulators, and the earth stake driven under the case */
      var ps=[], ins=[];
      [736,860,984].forEach(function(x){ps=ps.concat(eLd([x,wireY(x)+5],[x,gndY(x)]),eLd([x-11,gndY(x)],[x+11,gndY(x)],4));ins=ins.concat(eEll(x,wireY(x),8,6,9));});
      out.push({pts:ps,col:"FAINT"});
      out.push({pts:fw.concat(ins,eLd([196,452],[196,528]),eLd([182,516],[210,516],4),eLd([186,528],[206,528],4)),col:"PEARL",big:true});
      /* the earth return: the animal standing on the ground closes the circuit */
      var hatch=[];
      for(var x=118;x<1040;x+=11)out.push({pts:[[x,gndY(x)]],col:"AXIS"});
      for(i=0;i<26;i++){var hx=140+i*35;hatch=hatch.concat(eLd([hx,gndY(hx)],[hx-13,gndY(hx)+13],3));}
      out.push({pts:hatch,col:"FAINT"});
      return out;};
  })();
  var ENER_CALL=[
    ["01","BATTERY",["12 volts, no mains;","the fence goes anywhere"],[207,346],"L",470,false],
    ["02","CAPACITOR DISCHARGE",["charges slowly, dumps in","milliseconds, then rests"],[362,338],"L",86,true],
    ["03","PULSE TRANSFORMER",["steps the dump up to","thousands of volts"],[548,304],"R",96,false],
    ["04","FENCE LINE + EARTH",["one wire over kilometres;","the animal closes it"],[860,330],"R",466,false]
  ];

  var MACH = {
    power:{vb:[0,0,1080,660], iconVB:"384 138 232 476", build:buildXfmr, seed:7,  tok:"--hmm-nec-power", fb:"#FF730B", fbText:"#FF9732", call:XFMR_CALL, ch1:1056,chy:636},
    eat:  {vb:[0,0,1080,620], iconVB:"128 152 828 420", build:buildReel, seed:11, tok:"--hmm-nec-eat", fb:"#4F8A5B", fbText:"#508B5C", call:REEL_CALL, ch1:1064,chy:604},
    heal: {vb:[0,0,1080,660], iconVB:"432 92 136 566",  build:buildInjector, seed:17, tok:"--hmm-nec-heal", fb:"#8752A5", fbText:"#9E69BE", call:INJ_CALL, ch1:1064,chy:644},
    /* The three instruments each market already exported. Same register, same engine, new seeds. */
    implant:  {vb:[0,0,1080,660], iconVB:"132 224 781 270",  build:buildImplant,   seed:23, tok:"--hmm-nec-heal",  fb:"#8752A5", fbText:"#9E69BE", call:IMPL_CALL,  ch1:1064,chy:644},
    anode:    {vb:[0,0,1080,660], iconVB:"190 118 214 500",    build:buildAnode,     seed:29, tok:"--hmm-nec-power", fb:"#FF730B", fbText:"#FF9732", call:ANODE_CALL, ch1:1064,chy:644},
    energiser:{vb:[0,0,1080,620], iconVB:"88 168 592 366",build:buildEnergiser, seed:31, tok:"--hmm-nec-eat",   fb:"#4F8A5B", fbText:"#508B5C", call:ENER_CALL,  ch1:1064,chy:604}
  };

  function dotsOf(kind){
    var spec=MACH[kind], rnd=seededRnd(spec.seed), kc=0, out=[], A=accentOf(spec), PEARL=PEARL_();
    spec.build().forEach(function(L){L.pts.forEach(function(p){var q=rnd(),big=L.big,acc=L.col==="ACC";
      var r=big?(q<.16?2.0:q<.5?1.4:1.0):(q<.12?1.6:q<.45?1.1:.8);
      var op=big?(q<.16?1:.55+q*.4):(q<.12?.85:.55+q*.35);
      var fill=acc?A:(L.col==="FAINT"?"rgba(242,236,201,.32)":(L.col==="AXIS"?"rgba(242,236,201,.26)":PEARL));
      out.push(h("circle",{key:kc++,cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:r,fill:fill,opacity:op}));});});
    return out;
  }

  /* bare dotted machine icon (hero). iconVB is a CROP, and the crop is enforced by a clipPath on
     the dots rather than by overflow. overflow clips to the ELEMENT box, never to the viewBox, so
     wherever the mount's aspect differs from the crop's the drawing simply paints into the
     letterbox either side: the cell, which crops to one of three views, showed all three, and no
     parent overflow:hidden took it back. It went unseen while every crop happened to enclose its
     whole machine. Breathing moves a dot by about six units and every crop clears its body by
     more than that, so the clip shaves nothing. The blow-out needs no clip; there the viewBox is
     the whole drawing. Guarded by npm run check:machines. */
  var CROP_N=0;
  function Icon(kind){var vb=MACH[kind].iconVB.split(/\s+/).map(Number), id="hmm-crop-"+kind+"-"+(CROP_N++);
    return h("svg",{viewBox:MACH[kind].iconVB,style:{width:"100%",height:"100%",overflow:"visible"},role:"img","aria-label":kind+" machine"},
      h("clipPath",{id:id}, h("rect",{x:vb[0],y:vb[1],width:vb[2],height:vb[3]})),
      h("g",{clipPath:"url(#"+id+")"}, dotsOf(kind)));}

  /* full blow-out: dots + leader callouts + corner ticks (necessity sections) */
  function Blowout(kind){
    var spec=MACH[kind], A=accentOf(spec), AT=accentText(spec), PEARL=PEARL_(), FN="rgba(242,236,201,.45)", vb=spec.vb, W=vb[2], BW=232, BH=84, els=[];
    spec.call.forEach(function(c,i){var left=c[4]==="L",bx=left?24:W-24-BW,by=c[5],col=c[6]?A:PEARL,txt=c[6]?AT:PEARL,p=c[3],anchor=[left?bx+BW:bx,by+BH/2],midx=(anchor[0]+p[0])/2;
      els.push(h("polyline",{key:"ld"+i,points:anchor[0]+","+anchor[1]+" "+midx+","+anchor[1]+" "+p[0]+","+p[1],fill:"none",stroke:c[6]?A:"rgba(242,236,201,.5)",strokeWidth:1}));
      els.push(h("circle",{key:"fd"+i,cx:p[0],cy:p[1],r:c[6]?4:3,fill:col}));
      if(c[6])els.push(h("circle",{key:"mg"+i,cx:p[0],cy:p[1],r:22,fill:"none",stroke:A,strokeWidth:1}));
      var box=[
        h("rect",{key:"bx",x:bx,y:by,width:BW,height:BH,fill:"rgba(20,20,20,0.9)",stroke:col,strokeWidth:c[6]?1.5:1}),
        h("text",{key:"ix",x:bx+13,y:by+21,fontFamily:"Raela Grotesque",fontWeight:700,fontSize:11,letterSpacing:1.4,fill:c[6]?AT:FN},c[0]),
        h("text",{key:"ti",x:bx+36,y:by+21,fontFamily:"Raela Grotesque",fontWeight:700,fontSize:12.5,letterSpacing:.7,fill:txt},c[1]),
        h("line",{key:"rl",x1:bx+13,y1:by+30,x2:bx+BW-13,y2:by+30,stroke:"rgba(242,236,201,.2)",strokeWidth:.75})
      ];
      c[2].forEach(function(ln,k){box.push(h("text",{key:"nt"+k,x:bx+13,y:by+50+k*17,fontFamily:"Raela Grotesque",fontSize:12.5,fill:"rgba(242,236,201,.82)"},ln));});
      els.push(h("g",{key:"c"+i,className:"callout callout--"+(left?"L":"R"),tabIndex:0,role:"group","aria-label":c[1]+". "+c[2].join(" ")},box));});
    [[16,16,12,12],[spec.ch1,16,-12,12],[16,spec.chy,12,-12],[spec.ch1,spec.chy,-12,-12]].forEach(function(t,i){els.push(h("line",{key:"ca"+i,x1:t[0],y1:t[1],x2:t[0]+t[2],y2:t[1],stroke:A,strokeWidth:1}));els.push(h("line",{key:"cb"+i,x1:t[0],y1:t[1],x2:t[0],y2:t[1]+t[3],stroke:A,strokeWidth:1}));});
    return h("svg",{viewBox:vb.join(" "),role:"img","aria-label":kind+" machine, blow-out drawing",style:{width:"100%",height:"100%",overflow:"visible"}}, dotsOf(kind), els);
  }

  /* Every mount is remembered so a data-theme flip draws it again with the tokens
     re-read. hmmRender replaces the mount's children, so the breathing controller
     on the old <svg> is stopped first and a new one is attached to the new one;
     otherwise the old loop would keep animating detached nodes. */
  var MOUNTED=[];
  function breathe(m){m.timer=setTimeout(function(){var svg=m.mount.querySelector('svg');if(svg&&window.hmmAnimateDots)m.ctl=window.hmmAnimateDots(svg,{motion:"breath"});},300);}
  function draw(m){if(m.ctl){m.ctl.stop();m.ctl=null;}clearTimeout(m.timer);hmmRender(m.mount,m.fn(m.kind));breathe(m);}
  function mountOne(mount,kind,fn){var m={mount:mount,kind:kind,fn:fn,ctl:null,timer:0};MOUNTED.push(m);draw(m);}
  function renderIcon(mount,kind){mountOne(mount,kind,Icon);}
  function renderBlowout(mount,kind){mountOne(mount,kind,Blowout);}
  __onTheme(function(){MOUNTED.forEach(draw);});

  return {renderIcon:renderIcon, renderBlowout:renderBlowout, accent:function(k){return accentOf(MACH[k]);}, accentText:function(k){return accentText(MACH[k]);}};
})();
