// Easter eggs: achievements, the bodega cat, Pizza Rat, the halal cart, and live NYC weather on the home page.
// Achievements are remembered in this browser only (localStorage), nothing is sent anywhere.
(function(){
  var OA=window.OA=window.OA||{cat:0,rat:0,ratBig:false};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LIST={
    cat:  'Pet the bodega cat',
    rat:  'Feed Pizza Rat',
    cart: 'Grab a bite',
    map:  'Mind the gap',
    ride: 'Stand clear of the closing doors'
  };
  var TOTAL=Object.keys(LIST).length;
  function load(){try{return JSON.parse(localStorage.getItem('oa-achievements')||'{}');}catch(e){return {};}}
  function save(o){try{localStorage.setItem('oa-achievements',JSON.stringify(o));}catch(e){}}

  // toast
  var toast=document.createElement('div'); toast.className='oa-toast'; toast.setAttribute('role','status'); toast.setAttribute('aria-live','polite'); document.body.appendChild(toast);
  var tTimer=0;
  function show(name,n){
    var m=''; for(var k=0;k<TOTAL;k++) m+='<span'+(k<n?' class="on"':'')+'></span>';
    toast.innerHTML='<i aria-hidden="true"></i><span><small>ACHIEVEMENT UNLOCKED · '+n+'/'+TOTAL+'</small><b>'+name+'</b><span class="oa-meter" aria-hidden="true">'+m+'</span></span>';
    toast.classList.remove('on'); void toast.offsetWidth; toast.classList.add('on');
    clearTimeout(tTimer); tTimer=setTimeout(function(){toast.classList.remove('on');},3400);
  }
  function unlock(id){
    var got=load(); if(got[id]) return; got[id]=1; save(got);
    show(LIST[id],Object.keys(got).length);
  }
  window.OAunlock=unlock;
  // an achievement earned right before leaving the page (the subway ride) shows on arrival
  try{var pend=sessionStorage.getItem('oa-pending'); if(pend){sessionStorage.removeItem('oa-pending'); setTimeout(function(){unlock(pend);},700);}}catch(e){}

  // hotspot buttons that follow a moving thing drawn on a scene canvas
  function hotspot(cv,boxKey,label,onHit){
    var host=cv.parentNode, b=document.createElement('button'); b.type='button'; b.className='oa-hot'; b.setAttribute('aria-label',label); b.innerHTML='<span class="uv" aria-hidden="true"></span>';
    host.appendChild(b);
    function place(){
      var box=OA[boxKey]; if(!box){requestAnimationFrame(place);return;}
      var cr=cv.getBoundingClientRect(), hr=host.getBoundingClientRect();
      b.style.left=(cr.left-hr.left+box[0]*cr.width)+'px'; b.style.top=(cr.top-hr.top+box[1]*cr.height)+'px';
      b.style.width=Math.max(44,box[2]*cr.width)+'px'; b.style.height=Math.max(44,box[3]*cr.height)+'px';
      requestAnimationFrame(place);
    }
    requestAnimationFrame(place);
    b.addEventListener('click',function(e){e.stopPropagation(); onHit(b,cv,host);});
    return b;
  }
  function floatText(host,b,text){
    var f=document.createElement('span'); f.className='oa-float'; f.textContent=text; f.setAttribute('aria-hidden','true');
    f.style.left=(parseFloat(b.style.left)+parseFloat(b.style.width)/2)+'px'; f.style.top=b.style.top;
    host.appendChild(f); setTimeout(function(){f.remove();},1300);
  }

  var street=document.querySelector('canvas[data-scene="street"]');
  if(street){
    var pets=0;
    hotspot(street,'catBox','Pet the bodega cat',function(b,cv,host){OA.cat=performance.now(); pets++; if(pets===1) unlock('cat');});
    hotspot(street,'cartBox','Get food from the halal cart',function(b,cv,host){floatText(host,b,'+1 HP'); unlock('cart');});
  }
  var station=document.querySelector('canvas[data-scene="station"]');
  if(station){
    hotspot(station,'ratBox','Feed Pizza Rat',function(b){ if(performance.now()-OA.rat<1400) return; OA.rat=performance.now(); OA.ratBig=true; unlock('rat'); });
  }

  // ---- live NYC weather on the home page: rain, snow or clear (Open-Meteo, no key, no cookies) ----
  var hero=document.querySelector('.hero');
  if(hero&&!reduce){
    var q=new URLSearchParams(location.search).get('weather');
    function code2(k){ if(k>=71&&k<=77||k===85||k===86) return 'snow'; if(k>=51&&k<=67||k>=80&&k<=82||k>=95) return 'rain'; return 'clear'; }
    function start(kind){
      if(kind==='clear') return;
      [hero,document.querySelector('.ht-street')].forEach(function(host){ if(host) weather(host,kind); });
    }
    if(q) start(q);
    else{
      var cached=null; try{cached=JSON.parse(sessionStorage.getItem('oa-wx')||'null');}catch(e){}
      if(cached&&Date.now()-cached.at<30*60*1000) start(cached.kind);
      else fetch('https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.01&current=weather_code')
        .then(function(r){return r.json();}).then(function(d){var kind=code2(d.current.weather_code);
          try{sessionStorage.setItem('oa-wx',JSON.stringify({kind:kind,at:Date.now()}));}catch(e){} start(kind);})
        .catch(function(){});
    }
  }
  function weather(host,kind){
    var cv=document.createElement('canvas'); cv.className='oa-weather'; cv.setAttribute('aria-hidden','true'); host.appendChild(cv);
    var ctx=cv.getContext('2d'), W=0,H=0, P=[], vis=true, last=0, DPR=Math.min(devicePixelRatio||1,2);
    function size(){var r=cv.getBoundingClientRect(); W=r.width; H=r.height; cv.width=W*DPR; cv.height=H*DPR;
      var n=Math.round(W*H/(kind==='snow'?5200:3600)); P=[]; for(var i=0;i<n;i++) P.push([Math.random()*W,Math.random()*H,.5+Math.random()]);}
    size(); new ResizeObserver(size).observe(cv);
    new IntersectionObserver(function(e){vis=e[0].isIntersecting;}).observe(cv);
    (function loop(now){ requestAnimationFrame(loop); if(!vis||document.hidden) return; var dt=Math.min((now-last)/1000,.05); last=now;
      ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
      P.forEach(function(p){
        if(kind==='snow'){ p[1]+=dt*28*p[2]; p[0]+=Math.sin(now/900+p[2]*9)*dt*10; ctx.fillStyle='rgba(220,230,255,'+(.35+.3*p[2])+')'; ctx.beginPath(); ctx.arc(p[0],p[1],1.2+p[2],0,6.2832); ctx.fill(); }
        else { p[1]+=dt*420*p[2]; p[0]-=dt*60*p[2]; ctx.fillStyle='rgba(95,230,255,'+(.25+.25*p[2])+')'; for(var k=0;k<4;k++){ ctx.beginPath(); ctx.arc(p[0]+k*1.2,p[1]-k*7,1,0,6.2832); ctx.fill(); } }
        if(p[1]>H+20){p[1]=-20;p[0]=Math.random()*W*1.1;} if(p[0]<-20) p[0]=W+10;
      });
    })(0);
  }
})();
// Black light: the cursor glow works like a UV lamp. Easter eggs near it fluoresce, the closer the brighter.
(function(){
  if(!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var R=260, mx=-9999, my=-9999, raf=0;
  function eggs(){return document.querySelectorAll('.oa-hot,.ht-stop');}
  function update(){ raf=0;
    eggs().forEach(function(el){ var r=el.getBoundingClientRect(); if(!r.width) return;
      var cx=r.left+r.width/2, cy=r.top+r.height/2, d=Math.hypot(mx-cx,my-cy);
      var uv=Math.max(0,1-d/R); el.style.setProperty('--uv',(uv*uv).toFixed(3)); });
  }
  addEventListener('pointermove',function(e){mx=e.clientX; my=e.clientY; if(!raf) raf=requestAnimationFrame(update);},{passive:true});
  addEventListener('scroll',function(){if(!raf) raf=requestAnimationFrame(update);},{passive:true});
  document.addEventListener('pointerleave',function(){mx=my=-9999; update();});
})();
