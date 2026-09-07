/* hmm site - S10 the record. An infinite, slow-scrolling stream of the AU/JP/NZ innovation and exit
   catalogue (window.CATALOGUE from catalogue.js). Reads as film credits: exits, hardware, software,
   patents drifting up behind the closing prose. Pauses on hover; honours prefers-reduced-motion
   (becomes a static scrollable list). No-ops if the data or the mount is absent. */
(function(){
  function boot(){
    if(!window.CATALOGUE||!window.CATALOGUE.length) return;
    if(!document.getElementById('s9stream')&&!document.getElementById('s10stream')) return;
    var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;');}
    var CATMAP={Hardware:'HW',Software:'SW',IP:'IP'};
    function row(e){
      var m='<span class="rec-m rec-m--'+esc(e.m)+'">'+esc(e.m)+'</span>';
      if(e.cat==='Exit'){
        var tag='<span class="rec-tag rec-nec--'+esc(e.nec||'DeepTech')+'">'+esc(e.nec||'')+'</span>';
        var name='<span class="rec-name">'+esc(e.name)+(e.cohort?'<sup>&dagger;</sup>':'')+'</span>';
        var meta=[e.type,e.year,e.value].filter(function(x){return x&&x!=='';}).map(esc).join(' · ');
        var what=[e.what,e.ctp].filter(function(x){return x&&x!=='';}).map(esc).join(' · ');
        return '<div class="rec-row">'+m+tag+name+'<span class="rec-meta">'+meta+'</span><span class="rec-what">'+what+'</span></div>';
      }
      var tag2='<span class="rec-tag">'+esc(CATMAP[e.cat]||e.cat)+'</span>';
      return '<div class="rec-row">'+m+tag2+'<span class="rec-name">'+esc(e.name)+'</span><span class="rec-what">'+esc(e.detail||'')+'</span></div>';
    }
    // interleave the three markets so AU/JP/NZ are spaced evenly through the stream, not grouped.
    // each entry keeps its market's internal order; markets are spread by fractional position.
    var byM={}; window.CATALOGUE.forEach(function(e){(byM[e.m]=byM[e.m]||[]).push(e);});
    Object.keys(byM).forEach(function(m){var arr=byM[m];arr.forEach(function(e,i){e.__pos=(i+0.5)/arr.length;});});
    var mixed=window.CATALOGUE.slice().sort(function(a,b){return (a.__pos||0)-(b.__pos||0);});
    var html=mixed.map(row).join('');
    function mount(root, phase){
      if(!root||root.dataset.built) return; root.dataset.built='1';
      var track=document.createElement('div'); track.className='rec-track';
      track.innerHTML=reduce?html:(html+html);   // duplicate for a seamless loop
      root.appendChild(track);
      if(reduce) return;
      var half=track.scrollHeight/2, y=-(phase||0)*half, paused=false, offscreen=false, speed=0.5, running=false;
      /* The loop runs only while the stream is on screen, unhovered and the document is visible.
         It used to re-request itself every frame regardless, so two idle streams cost a frame
         each for the whole visit. Every condition that can lift calls start(), which is a
         no-op while the loop is already running. */
      function loop(){
        if(paused||offscreen||document.hidden){running=false;return;}
        y-=speed; if(-y>=half) y+=half; track.style.transform='translateY('+y.toFixed(2)+'px)';
        requestAnimationFrame(loop);
      }
      function start(){if(running)return;running=true;requestAnimationFrame(loop);}
      root.addEventListener('mouseenter',function(){paused=true;});
      root.addEventListener('mouseleave',function(){paused=false;start();});
      if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){offscreen=!e.isIntersecting;});start();},{threshold:0});io.observe(root);}
      document.addEventListener('visibilitychange',start);
      addEventListener('scroll',start,{passive:true});
      start();
    }
    mount(document.getElementById('s9stream'), 0.5);   // the record beside the sourcing thesis (offset so the two do not mirror)
    mount(document.getElementById('s10stream'), 0);    // the dedicated record section
  }
  if(document.readyState==='complete') boot(); else addEventListener('load',boot);
})();
