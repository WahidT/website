/* hmm site - the three system diagrams (2026-10-27). Each draws the system as the GP's own
   materials describe it, so the shape itself carries the understanding:

     Power  a chain that closes on itself: ten stages, recovery at 10 feeding back to 02, and
            the stages on the critical-minerals layer (02 to 06) marked as where the return sits.
     Eat    two chains on one base: the plant chain and the animal chain rise from the
            biological-input base, converge at processing, run to the mouth, and nutrient
            recovery returns to the base. The base is marked as the frontier.
     Heal   a one-way spine, prevention to end of life, with outcome data fed back from 08 to
            discovery and detection. The read-out at 02 is marked as where value concentrates.

   Every label is lifted from data/*_steps.js (the stage names, the Eat chart, the chart notes);
   nothing here restates a claim. The marked layer and its caption are the same device in all
   three, because the through-line is that each system has one such layer.

   Why HTML and not one SVG. The schematic this replaces was an SVG scaled into its card, so
   its 12px labels rendered at 3 to 7px and were removed on 2026-10-26 (the 12px floor). Here
   the stages are an ordered list laid out on a CSS grid, so the text is real text at 12px and
   up at every width, and a screen reader reads the stages in flow order. The wires are an SVG
   drawn over the grid at one user unit to one CSS pixel, measured from the laid-out boxes and
   redrawn when the figure changes width. Two layouts per system: wide (a card of 520px or more)
   and narrow (a phone).

   One engine. A dot rides each wire in the direction of flow, moved by the engine's per-frame
   step hook, so the dots breathe, drift and take the click ripple with every other drawing on
   the page (scripts/hmm-motion.js). Reduced motion: the engine never starts and each dot sits
   at the middle of its wire. Colours are the tokens, read at build and again on a theme flip. */
(function(){
  var NS='http://www.w3.org/2000/svg', M=window.HMM_MOTION, WIDE=520;

  function first(s,re){var m=String(s||'').match(re);return m?m[0]:'';}
  function sentence(s,i){return (String(s||'').match(/[^.]+\./g)||[])[i].trim();}
  function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
  function chartNode(t){var m=t.match(/^(\S+)\s+(.*)$/);return {id:m[1],name:cap(m[2])};}
  /* Break points for the long stage words, so a narrow box wraps "Establish-ment" rather than
     "Establishmen-t" (CSS hyphens:auto needs a dictionary the browser may not ship). A soft hyphen
     shows only where the line actually breaks; the text is otherwise unchanged. */
  var SHY={establishment:'establish|ment',manufacture:'manu|facture',rehabilitation:'rehabili|tation',
    infrastructure:'infra|structure',distribution:'distri|bution',biosecurity:'bio|security',aquaculture:'aqua|culture',
    transmission:'trans|mission',intervention:'inter|vention',diagnostics:'diag|nostics',processing:'pro|cessing',protection:'pro|tection'};
  function breaks(t){return t.replace(/[A-Za-z]{10,}/g,function(w){var k=SHY[w.toLowerCase()];if(!k)return w;var i=k.indexOf('|');
    return w.slice(0,i)+'\u00AD'+w.slice(i);}).replace(/\//g,'/\u200B');}
  function byId(S){var m={};S.steps.forEach(function(s){m[s.id]=s;});return m;}

  /* ---- geometry over laid-out boxes: every rect is relative to the grid, in CSS px ---- */
  function rectOf(el){return {l:el.offsetLeft,t:el.offsetTop,r:el.offsetLeft+el.offsetWidth,b:el.offsetTop+el.offsetHeight,
    cx:el.offsetLeft+el.offsetWidth/2,cy:el.offsetTop+el.offsetHeight/2};}
  /* Straight when the two boxes share a row or a column, else one elbow: out of a's side or
     foot towards b, then into b. */
  function auto(a,b){
    var ov=Math.min(a.b,b.b)-Math.max(a.t,b.t), oh=Math.min(a.r,b.r)-Math.max(a.l,b.l);
    if(ov>8){var y=(Math.max(a.t,b.t)+Math.min(a.b,b.b))/2;return b.cx>a.cx?[[a.r,y],[b.l,y]]:[[a.l,y],[b.r,y]];}
    if(oh>8){var x=(Math.max(a.l,b.l)+Math.min(a.r,b.r))/2;return b.cy>a.cy?[[x,a.b],[x,b.t]]:[[x,a.t],[x,b.b]];}
    return b.cy>a.cy?[[a.cx,a.b],[a.cx,b.cy],[b.cx>a.cx?b.l:b.r,b.cy]]:[[a.cx,a.t],[a.cx,b.cy],[b.cx>a.cx?b.l:b.r,b.cy]];
  }

  /* ---- the three systems ---- */
  var SPEC={
    power:function(){
      var P=window.POWER_STEPS, nodes=P.steps.map(function(s){var k=+s.id;return {id:s.id,num:s.id,name:s.name,acc:k>=2&&k<=6};});
      var edges=[];for(var i=0;i<nodes.length-1;i++)edges.push({a:nodes[i].id,b:nodes[i+1].id});
      edges.push({a:'10',b:'02',dash:true,route:'ret'});
      return {nodes:nodes,edges:edges,
        key:[{sw:'acc',text:sentence(P.chainNote,1)}],
        wide:{cols:'repeat(5,minmax(0,1fr))',gap:[30,16],pad:[0,0,0,0],
          pos:{'01':[1,1],'02':[1,2],'03':[1,3],'04':[1,4],'05':[1,5],'06':[2,5],'07':[2,4],'08':[2,3],'09':[2,2],'10':[2,1]},
          /* recovery climbs from 10 into the gap between the rows and back up into 02 */
          ret:function(R){var a=R['10'],b=R['02'],y=(R['01'].b+a.t)/2,x0=a.l+(a.r-a.l)*0.72;return [[x0,a.t],[x0,y],[b.cx,y],[b.cx,b.b]];}},
        narrow:{cols:'repeat(2,minmax(0,1fr))',gap:[10,30],pad:[0,0,0,0],
          pos:{'01':[1,1],'02':[2,1],'03':[3,1],'04':[4,1],'05':[5,1],'06':[5,2],'07':[4,2],'08':[3,2],'09':[2,2],'10':[1,2]},
          /* 10 sits beside 01: recovery drops down the gap between the columns into 02 */
          ret:function(R){var a=R['10'],b=R['02'],x=(R['01'].r+a.l)/2;return [[a.l,a.cy],[x,a.cy],[x,b.cy],[b.r,b.cy]];}}};
    },
    eat:function(){
      var E=window.EAT_STEPS, C=E.chart, st=byId(E);
      var base={id:'base',name:cap(first(C.base,/^[^(]+/).trim().toLowerCase()),sub:first(C.base,/\(([^)]+)\)/).slice(1,-1),acc:true,band:true};
      var plant=C.plantChain.map(chartNode).map(function(n){return {id:n.id,num:n.id,name:st[n.id]?st[n.id].name:n.name};});
      var animal=C.animalChain.map(chartNode).map(function(n){return {id:n.id,num:n.id,name:n.name};});
      var shared=C.shared.map(chartNode).map(function(n){return n.id==='10'?{id:'mouth',num:'',name:n.name.charAt(0)+n.name.slice(1).toLowerCase()}:{id:n.id,num:n.id,name:st[n.id]?st[n.id].name:n.name};});
      var rec={id:'10',num:'10',name:st['10'].name};
      var nodes=[base].concat(plant,animal,shared,[rec]);
      var edges=[{a:'base',b:'01'},{a:'base',b:'A1',route:'baseA'}];
      function chain(L){for(var i=0;i<L.length-1;i++)edges.push({a:L[i].id,b:L[i+1].id});}
      chain(plant);chain(animal);
      edges.push({a:'06',b:'07'},{a:'A5',b:'07',route:'conv'});chain(shared);
      edges.push({a:'mouth',b:'10'},{a:'10',b:'base',dash:true,route:'ret'});
      /* The note's second sentence (the chains converge at processing) is what the drawing shows, so the caption keeps the other three. */
      var note=C.note.match(/[^.]+\./g).map(function(s){return s.trim();}), last=note.pop(); note.splice(1,1);
      return {nodes:nodes,edges:edges,
        key:[{sw:'',text:note.join(' ')},{sw:'acc',text:last}],
        /* feed down and manure up between the two chains: the exchange, not a stage link */
        wide:{cols:'repeat(6,minmax(0,1fr))',gap:[30,8],pad:[0,0,0,32],
          pos:{base:[1,'1 / -1'],'01':[2,1],'02':[2,2],'03':[2,3],'04':[2,4],'05':[2,5],'06':[2,6],
               A1:[3,1],A2:[3,2],A3:[3,3],A4:[3,4],A5:[3,5],'07':[4,6],'08':[4,5],'09':[4,4],mouth:[4,3],'10':[4,2]},
          bandBleed:{l:30},
          baseA:function(R){var a=R.base,b=R.A1,x=a.l+12;return [[x,a.b],[x,b.cy],[b.l,b.cy]];},
          /* A5 joins 06's line into processing, just inside it */
          conv:function(R){var a=R.A5,b=R['07'],x=b.cx-10;return [[a.r,a.cy],[x,a.cy],[x,b.t]];},
          /* recovery returns up the outer lane, outside the line that feeds the animal chain */
          ret:function(R){var a=R['10'],b=R.base,x=b.l-12;return [[a.l,a.cy],[x,a.cy],[x,b.cy],[b.l,b.cy]];},
          exch:function(R){var y0=R['03'].b,y1=R.A3.t,x=(R['03'].r+R['04'].l)/2;
            return [{pts:[[x-7,y0],[x-7,y1]],label:'feed',lx:x-12,ly:(y0+y1)/2,anchor:'end'},{pts:[[x+7,y1],[x+7,y0]],label:'manure',lx:x+12,ly:(y0+y1)/2}];}},
        narrow:{cols:'repeat(2,minmax(0,1fr))',gap:[7,22],pad:[0,26,0,0],
          pos:{base:[1,'1 / -1'],'01':[2,1],'02':[3,1],'03':[4,1],'04':[5,1],'05':[6,1],'06':[7,1],
               A1:[2,2],A2:[3,2],A3:[4,2],A4:[5,2],A5:[6,2],'07':[7,2],'08':[8,2],'09':[8,1],mouth:[9,1],'10':[9,2]},
          bandBleed:{r:14},
          baseA:function(R){return auto(R.base,R.A1);},
          conv:function(R){return auto(R.A5,R['07']);},
          ret:function(R){var a=R['10'],b=R.base,x=b.r+8;return [[a.r,a.cy],[x,a.cy],[x,b.cy],[b.r,b.cy]];}}};
    },
    heal:function(){
      var H=window.HEAL_STEPS, nodes=H.steps.map(function(s){return {id:s.id,num:s.id,name:s.name,acc:s.id==='02'};});
      var fb=first(H.steps[H.steps.length-1].def,/feeding real-world outcome data back to discovery and detection/);
      var last=nodes[nodes.length-1];
      return {nodes:nodes,edges:[],spine:true,
        key:[{sw:'acc',text:sentence(H.chartNote,1)},{sw:'dash',text:last.num+' '+last.name+': '+fb+'.'}],
        /* the spine: boxes alternate above and below one axis, each over its own tick */
        wide:{cols:'repeat(17,minmax(0,1fr))',rows:'auto 24px auto',gap:[0,0],pad:[0,0,34,0],
          pos:(function(){var p={};nodes.forEach(function(n,i){p[n.id]=[i%2?3:1,(2*i+1)+' / span 3'];});return p;})(),
          fb:function(R){var a=R['08'],y=a.b+13,b=R['02'],c=R['01'],x1=c.l+8;
            return [{pts:[[a.cx,a.b],[a.cx,y],[b.cx,y],[b.cx,b.b]],dash:true,label:'outcome data',lx:(a.cx+b.cx)/2,ly:y+11,anchor:'middle'},
                    {pts:[[b.cx,y],[x1,y],[x1,c.b]],dash:true,noDot:true}];}},
        narrow:{cols:'minmax(0,1fr)',gap:[5,0],pad:[0,26,0,30],
          pos:(function(){var p={};nodes.forEach(function(n,i){p[n.id]=[i+1,1];});return p;})(),
          fb:function(R){var a=R['08'],b=R['02'],c=R['01'],x=a.r+13;
            return [{pts:[[a.r,a.cy],[x,a.cy],[x,b.cy],[b.r,b.cy]],dash:true},{pts:[[x,b.cy],[x,c.cy],[c.r,c.cy]],dash:true,noDot:true}];}}};
    }
  };

  function el(tag,attrs){var e=document.createElementNS(NS,tag);for(var k in attrs)e.setAttribute(k,attrs[k]);return e;}
  function poly(pts){return pts.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');}
  function head(pts){var b=pts[pts.length-1],a=pts[pts.length-2],dx=b[0]-a[0],dy=b[1]-a[1],L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,s=4;
    return [[b[0]-ux*7+uy*s,b[1]-uy*7-ux*s],b,[b[0]-ux*7-uy*s,b[1]-uy*7+ux*s]];}
  function lengthOf(pts){var L=0;for(var i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return L;}
  function at(pts,u){var L=lengthOf(pts)*u;for(var i=1;i<pts.length;i++){var s=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);
    if(L<=s||i===pts.length-1){var f=s?Math.min(1,L/s):0;return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f];}L-=s;}return pts[0];}

  window.hmmSystemDiagram=function(mount,kind){
    var spec=SPEC[kind](), fig=document.createElement('figure'), ol=document.createElement('ol'), lis={};
    fig.className='sd sd--'+kind; ol.className='sd-nodes';
    spec.nodes.forEach(function(n){var li=document.createElement('li');
      li.className='sd-n'+(n.acc?' is-acc':'')+(n.band?' sd-n--band':'');li.setAttribute('data-id',n.id);
      if(n.num){var s=document.createElement('span');s.className='sd-num';s.textContent=n.num;li.appendChild(s);}
      var t=document.createElement('span');t.className='sd-name';t.textContent=breaks(n.name);
      if(n.sub){var u=document.createElement('span');u.className='sd-sub';u.textContent=n.sub;t.appendChild(u);}
      li.appendChild(t);ol.appendChild(li);lis[n.id]=li;});
    var cap=document.createElement('figcaption');cap.className='sd-key';
    spec.key.forEach(function(k){var p=document.createElement('p');
      if(k.sw){var i=document.createElement('span');i.className='sd-sw sd-sw--'+k.sw;i.setAttribute('aria-hidden','true');p.appendChild(i);}
      var t=document.createElement('span');t.textContent=k.text;p.appendChild(t);cap.appendChild(p);});
    fig.appendChild(ol);fig.appendChild(cap);mount.appendChild(fig);

    var svg=null, labels=[], ctl=null, builtW=0;
    function lay(L){
      ol.style.gridTemplateColumns=L.cols; ol.style.gridTemplateRows=L.rows||'';
      ol.style.rowGap=L.gap[0]+'px'; ol.style.columnGap=L.gap[1]+'px';
      ol.style.padding=L.pad.map(function(v){return v+'px';}).join(' ');
      spec.nodes.forEach(function(n){var li=lis[n.id],p=L.pos[n.id];li.style.gridRow=String(p[0]);li.style.gridColumn=String(p[1]);
        li.style.marginLeft=n.band&&L.bandBleed&&L.bandBleed.l?(-L.bandBleed.l)+'px':'';
        li.style.marginRight=n.band&&L.bandBleed&&L.bandBleed.r?(-L.bandBleed.r)+'px':'';});
    }
    function draw(){
      if(ctl){ctl.stop();ctl=null;}
      if(svg&&svg.parentNode)svg.parentNode.removeChild(svg);
      labels.forEach(function(x){x.parentNode&&x.parentNode.removeChild(x);});labels=[];
      var W=ol.clientWidth; builtW=W; if(W<40)return;
      var L=W>=WIDE?spec.wide:spec.narrow; fig.setAttribute('data-layout',W>=WIDE?'wide':'narrow'); lay(L);
      var H=ol.offsetHeight, R={}; spec.nodes.forEach(function(n){R[n.id]=rectOf(lis[n.id]);});
      svg=el('svg',{'class':'sd-wires',width:W,height:H,viewBox:'0 0 '+W+' '+H,'aria-hidden':'true',focusable:'false'});
      var wires=[];
      spec.edges.forEach(function(e){var pts=e.route?L[e.route](R):auto(R[e.a],R[e.b]);wires.push({pts:pts,dash:e.dash});});
      if(spec.spine){
        var ids=spec.nodes.map(function(n){return n.id;});
        if(W>=WIDE){var y=(R[ids[0]].b+R[ids[1]].t)/2;
          ids.forEach(function(id){var r=R[id];svg.appendChild(el('line',{'class':'sd-w',x1:r.cx,y1:r.b<y?r.b:r.t,x2:r.cx,y2:y}));});
          wires.push({pts:[[R[ids[0]].cx,y],[R[ids[ids.length-1]].cx+22,y]]});
          ids.forEach(function(id){svg.appendChild(el('circle',{'class':'sd-tick',cx:R[id].cx,cy:y,r:2.4}));});}
        else{var x=L.pad[3]/2;
          ids.forEach(function(id){var r=R[id];svg.appendChild(el('line',{'class':'sd-w',x1:x,y1:r.cy,x2:r.l,y2:r.cy}));});
          wires.push({pts:[[x,R[ids[0]].cy],[x,R[ids[ids.length-1]].b+12]]});
          ids.forEach(function(id){svg.appendChild(el('circle',{'class':'sd-tick',cx:x,cy:R[id].cy,r:2.4}));});}
      }
      [L.exch,L.fb].forEach(function(f){if(f)f(R).forEach(function(w){wires.push(w);});});
      var flows=[], rgb=M?M.nec(kind):[242,236,201], fill='rgb('+rgb.join(',')+')';
      wires.forEach(function(w,i){
        svg.appendChild(el('polyline',{'class':'sd-w'+(w.dash?' sd-w--dash':''),points:poly(w.pts)}));
        svg.appendChild(el('polyline',{'class':'sd-w',points:poly(head(w.pts))}));
        if(w.label){var s=document.createElement('span');s.className='sd-lab';s.textContent=w.label;s.setAttribute('aria-hidden','true');
          s.style.left=w.lx+'px';s.style.top=(w.ly-8)+'px';
          if(w.anchor==='end')s.style.transform='translateX(-100%)';else if(w.anchor==='middle')s.style.transform='translateX(-50%)';
          fig.appendChild(s);labels.push(s);}
        if(!w.noDot&&lengthOf(w.pts)>14)flows.push({pts:w.pts,len:lengthOf(w.pts),ph:(i*0.618)%1});
      });
      var firstFlow=svg.querySelectorAll('circle').length;
      flows.forEach(function(f){var p=at(f.pts,0.5);svg.appendChild(el('circle',{'class':'sd-dot',cx:p[0].toFixed(1),cy:p[1].toFixed(1),r:1.8,fill:fill,opacity:'0.9'}));});
      fig.insertBefore(svg,ol);
      if(window.hmmAnimateDots)ctl=window.hmmAnimateDots(svg,{mode:'breath',fps:30,driftAmp:0.35,step:function(D,ms){
        for(var k=0;k<flows.length;k++){var f=flows[k],d=D[firstFlow+k];if(!d)continue;
          var u=((ms/1000)*26/f.len+f.ph)%1,p=at(f.pts,u);d.bx=p[0];d.by=p[1];d.vis=Math.min(1,Math.min(u,1-u)*8);}
      }});
    }
    var rt=0;
    function onSize(){if(ol.clientWidth===builtW)return;clearTimeout(rt);rt=setTimeout(draw,90);}
    if(window.ResizeObserver)new ResizeObserver(onSize).observe(fig);else addEventListener('resize',onSize);
    if(window.__onTheme)__onTheme(draw);
    if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){builtW=-1;onSize();});
    draw();
  };
})();
