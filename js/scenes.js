// Home page: halftone silhouette scenes (city + people) down the page, continuing the hero.
// Each scene = a glow with black silhouettes in front, printed as purple/cyan offset dots.
// Original procedural art. Scenes fade in when reached, drift with light parallax, and people walk
// slowly only while their scene is on screen (capped at 20fps). Reduced motion: static, no parallax.
(function(){
  var OA=window.OA=window.OA||{cat:0,rat:0,ratBig:false};
  function since(k){return (performance.now()-(OA[k]||0))/1000;}
  // auto-place vignettes in the empty space beside case-study section headings (wide screens only)
  var pool=(document.body.getAttribute('data-ht')||'').split(',').filter(Boolean);
  if(pool.length){ var used=0;
    [].slice.call(document.querySelectorAll('.case-section')).forEach(function(sec,i){
      if(i%2||used>=4) return; var h2=sec.querySelector(':scope>h2'); if(!h2) return;
      var slot=document.createElement('div'); slot.className='ht-slot ht-auto'; slot.setAttribute('aria-hidden','true');
      slot.innerHTML='<canvas data-scene="'+pool[used%pool.length]+'" data-anim="1"></canvas>'; sec.classList.add('ht-host'); sec.insertBefore(slot,sec.firstChild); used++;
    });
  }
  // case studies: a faint skyline you "ride" past along the bottom of the screen as you scroll
  if(pool.length && document.querySelector('.case')){ var ride=document.createElement('div'); ride.className='ht-ride'; ride.setAttribute('aria-hidden','true');
    ride.innerHTML='<canvas data-scene="ride" data-anim="0" data-step="6"></canvas>'; document.body.appendChild(ride); }
  function fitAuto(){
    [].slice.call(document.querySelectorAll('.ht-auto')).forEach(function(slot){
      var sec=slot.parentNode, sr=sec.getBoundingClientRect(), lab=sec.querySelector(':scope>.label'), h2=sec.querySelector(':scope>h2');
      var rg=document.createRange(); rg.selectNodeContents(h2); var hr=rg.getBoundingClientRect();
      var top=lab?lab.getBoundingClientRect().top:hr.top, bottom=h2.getBoundingClientRect().bottom;
      var gap=sr.right-hr.right-64, hh=Math.min(240,bottom-top);
      if(gap<320||hh<120||innerWidth<1100){slot.style.display='none';return;}
      slot.style.display=''; slot.style.width=Math.min(gap,600)+'px'; slot.style.height=hh+'px'; slot.style.top=(top-sr.top)+'px';
    });
  }
  fitAuto(); addEventListener('resize',fitAuto);
  // NYC-subway-style station sign naming the current page (OFF/AXIS line: O and A bullets).
  // Drawn in its own small canvas with fine dots, so it stays legible at text size.
  var FONT='"Helvetica Neue",Helvetica,Arial,sans-serif';
  function signMetrics(label){var m=document.createElement('canvas').getContext('2d'); m.font='700 100px '+FONT;
    var tw=m.measureText(label).width; return {ratio:(55*2+tw+45+92*2+22+20)/165};}
  function drawSign(c,w,h,label){
    var k=h/165, fs=100*k; c.fillStyle='#050505'; c.fillRect(0,0,w,h);
    c.fillStyle='#f4f4f4'; c.fillRect(0,h*.1,w,Math.max(2,h*.06));
    c.font='700 '+fs+'px '+FONT; c.textBaseline='middle'; c.fillText(label,55*k,h*.6);
    var bx=55*k+c.measureText(label).width+45*k, bul=92*k;
    ['O','A'].forEach(function(l,i){var cx=bx+i*(bul+22*k)+bul/2, cy=h*.6;
      c.fillStyle='#f4f4f4'; c.beginPath(); c.arc(cx,cy,bul/2,0,6.2832); c.fill();
      c.fillStyle='#000'; c.font='700 '+(bul*.62)+'px '+FONT; c.textAlign='center'; c.fillText(l,cx,cy+bul*.04); c.textAlign='left'; c.font='700 '+fs+'px '+FONT;});
  }
  [].slice.call(document.querySelectorAll('.ht-band canvas[data-stop]')).forEach(function(cv){
    var label=cv.dataset.stop, box=document.createElement('button'); box.type='button'; box.className='ht-stop'; box.setAttribute('aria-label',label+' station. Open the subway map'); box.setAttribute('aria-expanded','false');
    box.style.setProperty('--ratio',signMetrics(label).ratio.toFixed(3));
    box.innerHTML='<canvas data-scene="stop" data-anim="0" data-step="2"></canvas>'; box.firstChild.dataset.label=label;
    cv.parentNode.parentNode.insertBefore(box,cv.parentNode.nextSibling);
  });

  var all=document.querySelectorAll('canvas[data-scene]'); if(!all.length) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR=Math.min(window.devicePixelRatio||1,2);

  function rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
  function glow(c,x,y,rx,ry,a){c.save();c.translate(x,y);c.scale(1,ry/rx);var g=c.createRadialGradient(0,0,0,0,0,rx);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,rx,0,6.2832);c.fill();c.restore();}
  function skyline(c,w,h,base,minH,maxH,seed,top,bot,windows,towers){
    var r=rng(seed),x=-8;
    var g=c.createLinearGradient(0,base-h*maxH*1.5,0,base); g.addColorStop(0,top); g.addColorStop(1,bot);
    while(x<w){var bw=w*(.035+r()*.07),bh=h*(minH+r()*(maxH-minH)); if(towers&&r()>.82) bh*=1.45;
      c.fillStyle=g; c.fillRect(x,base-bh,bw,bh);
      if(r()>.55) c.fillRect(x+bw*.48,base-bh-h*.07,Math.max(2,w*.004),h*.07);
      if(r()>.7) c.fillRect(x+bw*.15,base-bh-h*.025,bw*.7,h*.025);
      if(windows){ c.fillStyle='#000'; var ww=Math.max(3,w*.006); for(var wy=base-bh+ww*2;wy<base-ww*2;wy+=ww*3){ for(var wx=x+ww*1.5;wx<x+bw-ww*2;wx+=ww*2.6){ if(r()>.45) c.fillRect(wx,wy,ww,ww*1.4);} } }
      c.fillStyle='#000'; c.fillRect(x+bw,base-bh,Math.max(2,w*.004),bh);  // gap between buildings
      x+=bw+Math.max(2,w*.004)+r()*3;}
  }
  // person silhouette; phase drives the walk cycle (0 = standing)
  function person(c,x,ground,h,o){
    o=o||{}; var ph=o.phase||0, walk=o.walk!==false, s=Math.sin(ph), dir=o.dir||1;
    var lw=h*.1, hipY=ground-h*.47, shY=ground-h*.8, headR=h*.075;
    var col=o.col||'#e6e6e6'; c.save(); c.strokeStyle=col; c.fillStyle=col; c.shadowColor='#000'; c.shadowBlur=o.halo?h*.05:0; c.lineCap='round'; c.lineJoin='round'; c.lineWidth=lw;
    var st=walk?s*h*.13:h*.03;
    c.beginPath(); c.moveTo(x,hipY); c.lineTo(x+st*dir,ground-lw*.5); c.moveTo(x,hipY); c.lineTo(x-st*dir,ground-lw*.5); c.stroke();
    // torso (coat)
    c.beginPath(); c.moveTo(x-h*.1,shY); c.lineTo(x+h*.1,shY); c.lineTo(x+h*.085,hipY+h*.04); c.lineTo(x-h*.085,hipY+h*.04); c.closePath(); c.fill();
    c.lineWidth=lw*.8;
    var as=walk?-s*h*.1:0;
    if(o.watch){ c.beginPath(); c.moveTo(x-h*.08*dir,shY+h*.03); c.lineTo(x-h*.02*dir,shY+h*.2); c.lineTo(x+h*.1*dir,shY+h*.14); c.stroke(); }
    if(o.backpack){ c.fillRect(x-h*.2*dir,shY+h*.02,h*.1,h*.2); }
    if(o.phone){ c.beginPath(); c.moveTo(x+h*.08*dir,shY+h*.03); c.lineTo(x+h*.13*dir,shY+h*.2); c.lineTo(x+h*.07*dir,shY+h*.06); c.stroke(); }
    else { c.beginPath(); c.moveTo(x+h*.08*dir,shY+h*.03); c.lineTo(x+h*.08*dir+as*dir,hipY+h*.02); c.stroke(); }
    if(!o.watch){ c.beginPath(); c.moveTo(x-h*.08*dir,shY+h*.03); c.lineTo(x-h*.08*dir-as*dir,hipY+h*.02); c.stroke(); }
    // head / hood
    var hy=shY-headR*1.15;
    c.beginPath(); c.arc(x+h*.01*dir,hy,headR*(o.hood?1.3:1),0,6.2832); c.fill();
    if(o.hood){c.beginPath();c.moveTo(x-headR*1.2,hy);c.lineTo(x-h*.1,shY+h*.02);c.lineTo(x+h*.1,shY+h*.02);c.lineTo(x+headR*1.3,hy);c.fill();}
    if(o.umbrella){ c.lineWidth=lw*.35; c.beginPath(); c.moveTo(x+h*.02,hy+headR); c.lineTo(x+h*.02,hy-h*.28); c.stroke();
      c.beginPath(); c.ellipse(x+h*.02,hy-h*.2,h*.36,h*.16,0,Math.PI,0); c.closePath(); c.fill(); }
    if(o.phone){ c.shadowBlur=0; c.fillStyle='#000'; c.fillRect(x+h*.1*dir-h*.02,shY,h*.045,h*.07); }
    c.restore();
  }

  // scene definitions: draw(ctx,w,h,t) on a white-is-ink canvas (bright = dots)
  function walkers(c,w,h,ground,list,t,halo){
    list.forEach(function(p){var o={phase:t*4+p[2],dir:p[3]||1,halo:halo,hood:p[4]==='hood',umbrella:p[4]==='umb',phone:p[4]==='phone',walk:p[4]!=='stand'&&p[4]!=='phone'&&p[4]!=='umb'&&p[4]!=='watch',watch:p[4]==='watch',backpack:p[4]==='pack'||p[5]==='pack',col:p[6]};
      var dx=o.walk?o.dir*t*(9+p[1]*10):0, span=w*1.2, x=((p[0]*w+dx)%span+span)%span-w*.1; person(c,x,ground,h*p[1],o);});
  }
  // scenes: bright = dots. Silhouettes are made of dots, gaps and windows are dark.
  function cone(c,x,top,bottom,spread,a){var g=c.createLinearGradient(0,top,0,bottom);g.addColorStop(0,'rgba(255,255,255,'+a+')');g.addColorStop(1,'rgba(255,255,255,'+(a*.35)+')');c.fillStyle=g;c.beginPath();c.moveTo(x-spread*.08,top);c.lineTo(x+spread*.08,top);c.lineTo(x+spread,bottom);c.lineTo(x-spread,bottom);c.closePath();c.fill();}
  function ground(c,w,h,y,a){c.fillStyle='rgba(255,255,255,'+(a||.3)+')';c.fillRect(0,y,w,Math.max(2,h*.012));}
  // scenes: bright = dots. Each page gets one, themed to its content.
  var SCENES={
    // home: street level under the hero. Bodega with a cat in the window, halal cart steaming, a subway
    // entrance with globe lamps, a cab rolling by, a hydrant, streetlamps, and people on the sidewalk.
    street:function(c,w,h,t){
      var curb=h*.8, u=h;            // u = scale unit (scene height)
      // building fronts
      c.fillStyle='#202020'; c.fillRect(0,h*.08,w,curb-h*.08);
      for(var bx=0;bx<w;bx+=u*1.3){ c.fillStyle='#000'; c.fillRect(bx,h*.08,u*.03,curb-h*.08);
        c.fillStyle='#2c2c2c'; for(var wy=h*.14;wy<h*.42;wy+=u*.12) for(var wx=bx+u*.12;wx<bx+u*1.2;wx+=u*.26) c.fillRect(wx,wy,u*.14,u*.07); }
      // bodega: awning, lit window, cat on the sill
      var bd=w*.16, bw=u*1.25;
      c.fillStyle='#bdbdbd'; c.beginPath(); c.moveTo(bd,h*.42); c.lineTo(bd+bw,h*.42); c.lineTo(bd+bw+u*.05,h*.5); c.lineTo(bd-u*.05,h*.5); c.fill();
      for(var st=0;st<bw;st+=u*.14){ c.fillStyle='#202020'; c.fillRect(bd+st,h*.42,u*.07,h*.08); }
      c.fillStyle='#d8d8d8'; c.fillRect(bd+u*.08,h*.52,bw*.55,h*.2);
      c.fillStyle='#000'; c.font='700 '+Math.round(u*.06)+'px monospace'; c.fillText('DELI',bd+u*.14,h*.57);
      var pet=since('cat'), str=pet<1.2?Math.sin(Math.PI*pet/1.2):0;
      var tail=Math.sin(t*(pet<1.2?8:2))*u*.03, cx=bd+u*.45, cy=h*.72-str*u*.03;
      OA.catBox=[(cx-u*.1)/w,(cy-u*.16)/h,(u*.24)/w,(u*.2)/h];
      if(pet<1.6){ var hy2=cy-u*.2-pet*u*.12; c.fillStyle='rgba(255,255,255,'+(1-pet/1.6)+')'; c.beginPath(); c.arc(cx+u*.055,hy2,u*.022,Math.PI,0); c.arc(cx+u*.097,hy2,u*.022,Math.PI,0); c.lineTo(cx+u*.076,hy2+u*.05); c.closePath(); c.fill(); c.fillStyle='#000'; }                                                 // bodega cat
      c.beginPath(); c.ellipse(cx,cy-u*.035,u*.07*(1+str*.35),u*.04,0,0,6.2832); c.fill(); c.beginPath(); c.arc(cx+u*.07,cy-u*.07,u*.035,0,6.2832); c.fill();
      c.beginPath(); c.moveTo(cx+u*.045,cy-u*.09); c.lineTo(cx+u*.055,cy-u*.13); c.lineTo(cx+u*.075,cy-u*.1); c.fill(); c.beginPath(); c.moveTo(cx+u*.08,cy-u*.1); c.lineTo(cx+u*.1,cy-u*.13); c.lineTo(cx+u*.105,cy-u*.09); c.fill();
      c.strokeStyle='#000'; c.lineWidth=u*.015; c.beginPath(); c.moveTo(cx-u*.06,cy-u*.03); c.quadraticCurveTo(cx-u*.12,cy-u*.1+tail,cx-u*.09,cy-u*.14+tail); c.stroke();
      c.fillStyle='#5a5a5a'; c.fillRect(bd+bw*.7,h*.52,u*.2,curb-h*.52);                                    // door
      // subway entrance: stair rail + two globe lamps
      var se=w*.47; c.fillStyle='#9a9a9a'; c.fillRect(se,curb-u*.18,u*.7,u*.03); c.fillRect(se,curb-u*.18,u*.03,u*.18); c.fillRect(se+u*.67,curb-u*.18,u*.03,u*.18);
      [se+u*.015,se+u*.685].forEach(function(gx){ c.fillRect(gx-u*.008,curb-u*.38,u*.016,u*.2); c.fillStyle='#f0f0f0'; c.beginPath(); c.arc(gx,curb-u*.42,u*.045,0,6.2832); c.fill(); glow(c,gx,curb-u*.42,u*.12,u*.12,.35); c.fillStyle='#9a9a9a'; });
      // halal cart with steam and umbrella
      var hc=w*.72; OA.cartBox=[hc/w,(curb-u*.62)/h,(u*.45)/w,(u*.62)/h]; c.fillStyle='#cfcfcf'; c.fillRect(hc,curb-u*.3,u*.42,u*.22); c.fillStyle='#202020'; c.fillRect(hc+u*.04,curb-u*.25,u*.16,u*.08);
      c.fillStyle='#9a9a9a'; c.fillRect(hc+u*.2,curb-u*.55,u*.015,u*.25); c.fillStyle='#bdbdbd'; c.beginPath(); c.ellipse(hc+u*.21,curb-u*.55,u*.26,u*.08,0,Math.PI,0); c.fill();
      c.beginPath(); c.arc(hc+u*.08,curb-u*.05,u*.04,0,6.2832); c.arc(hc+u*.34,curb-u*.05,u*.04,0,6.2832); c.fill();
      c.strokeStyle='rgba(255,255,255,.35)'; c.lineWidth=u*.015; for(var sm=0;sm<2;sm++){ c.beginPath(); for(var j=0;j<=6;j++){var yy=curb-u*.32-j*u*.03, xx=hc+u*(.1+sm*.08)+Math.sin(j*.9-t*2+sm)*u*.02; if(j) c.lineTo(xx,yy); else c.moveTo(xx,yy);} c.stroke(); }
      // streetlamps + hydrant
      [w*.06,w*.4,w*.92].forEach(function(lx){ c.fillStyle='#8a8a8a'; c.fillRect(lx,h*.2,u*.02,curb-h*.2); c.fillRect(lx,h*.2,u*.12,u*.02); c.fillStyle='#f0f0f0'; c.fillRect(lx+u*.08,h*.21,u*.06,u*.025); glow(c,lx+u*.11,h*.24,u*.12,u*.18,.25); });
      var hy=w*.62; c.fillStyle='#d8d8d8'; c.fillRect(hy,curb-u*.12,u*.06,u*.12); c.fillRect(hy-u*.02,curb-u*.09,u*.1,u*.025); c.beginPath(); c.arc(hy+u*.03,curb-u*.12,u*.035,Math.PI,0); c.fill();
      // sidewalk + street
      c.fillStyle='#d6d6d6'; c.fillRect(0,curb,w,h*.02); c.fillStyle='#111'; c.fillRect(0,curb+h*.02,w,h);
      c.fillStyle='#3a3a3a'; for(var lm=0;lm<w;lm+=u*.6) c.fillRect(lm+((t*u*.6)%(u*.6))*0,h*.93,u*.3,h*.012);
      // a cab rolling by every ~9s (roof light)
      var cy2=(t%9)/9, cw=u*.95, cxx=-cw+cy2*(w+cw*2);
      c.fillStyle='#e6e6e6'; c.beginPath(); c.moveTo(cxx,h*.97); c.lineTo(cxx,h*.88); c.lineTo(cxx+cw*.2,h*.86); c.lineTo(cxx+cw*.32,h*.78); c.lineTo(cxx+cw*.7,h*.78); c.lineTo(cxx+cw*.82,h*.86); c.lineTo(cxx+cw,h*.88); c.lineTo(cxx+cw,h*.97); c.fill();
      c.fillStyle='#111'; c.fillRect(cxx+cw*.36,h*.795,cw*.14,h*.055); c.fillRect(cxx+cw*.53,h*.795,cw*.14,h*.055);
      c.fillStyle='#fff'; c.fillRect(cxx+cw*.44,h*.75,cw*.12,h*.03);
      c.fillStyle='#000'; c.beginPath(); c.arc(cxx+cw*.2,h*.97,u*.055,0,6.2832); c.arc(cxx+cw*.8,h*.97,u*.055,0,6.2832); c.fill();
      // people on the sidewalk
      walkers(c,w,h,curb,[[.05,.36,0],[.3,.34,1.4,-1,'phone'],[.58,.36,.7,1,'pack'],[.77,.35,0,-1,'stand'],[.9,.33,2.1,-1]],t,true);
    },
    // footer on every page: a subway platform. Tiled wall with a mosaic trim line, ceiling lights, steel columns,
    // a train passing on the far track now and then, and people walking and waiting on the platform.
    station:function(c,w,h,t){
      // platform on top, the track pit below it (where Pizza Rat lives)
      var plat=h*.74, wallTop=h*.12, trackTop=h*.4, trackBot=h*.7;
      c.fillStyle='#1a1a1a'; c.fillRect(0,0,w,h);
      c.fillStyle='#d8d8d8'; for(var x=w*.04;x<w;x+=w*.16){ c.fillRect(x,h*.05,w*.06,h*.016); glow(c,x+w*.03,h*.07,w*.05,h*.05,.18); }
      c.fillStyle='#262626'; c.fillRect(0,wallTop,w,trackTop-wallTop);
      c.fillStyle='#1c1c1c'; var tile=Math.max(6,h*.04); for(var y=wallTop;y<trackTop;y+=tile) c.fillRect(0,y,w,1); for(var x2=0;x2<w;x2+=tile*1.6) c.fillRect(x2,wallTop,1,trackTop-wallTop);
      c.fillStyle='#6e6e6e'; c.fillRect(0,wallTop+(trackTop-wallTop)*.62,w,h*.026);
      // easter egg: a "PRESS START" ad on the wall with pixel hearts
      var ax=w*.4, ay=wallTop+h*.03, aw=w*.11, ah=(trackTop-wallTop)*.5;
      c.fillStyle='#000'; c.fillRect(ax-3,ay-3,aw+6,ah+6); c.fillStyle='#cfcfcf'; c.fillRect(ax,ay,aw,ah);
      c.fillStyle='#000'; c.font='700 '+Math.round(ah*.26)+'px monospace'; c.textAlign='center'; c.textBaseline='middle';
      if(Math.floor(t*1.5)%2===0) c.fillText('PRESS START',ax+aw/2,ay+ah*.36);
      var px3=ah*.07; function heart(hx,hy){[[1,0],[3,0],[0,1],[1,1],[2,1],[3,1],[4,1],[1,2],[2,2],[3,2],[2,3]].forEach(function(p){c.fillRect(hx+p[0]*px3,hy+p[1]*px3,px3,px3);});}
      for(var hi=0;hi<3;hi++) heart(ax+aw/2-px3*8.5+hi*px3*6,ay+ah*.62);
      c.textAlign='left';
      // far track: train every ~16s
      c.fillStyle='#0c0c0c'; c.fillRect(0,trackTop,w,trackBot-trackTop);
      var cyc=(t%16)/16, carW=w*.22, n=4, trainL=n*carW, tx=w+trainL*.05-(cyc*(w+trainL*1.6));
      if(cyc<.75){ for(var k=0;k<n;k++){ var cx=tx+k*(carW+w*.006); c.fillStyle='#8a8a8a'; c.fillRect(cx,trackTop+h*.03,carW,trackBot-trackTop-h*.04);
        c.fillStyle='#202020'; for(var q=cx+carW*.06;q<cx+carW*.94;q+=carW*.16) c.fillRect(q,trackTop+h*.08,carW*.1,h*.08); c.fillRect(cx,trackTop+h*.2,carW,h*.012); } }
      for(var px=w*.07;px<w;px+=w*.14){ c.fillStyle='#000'; c.fillRect(px-w*.009,wallTop,w*.018,plat-wallTop); c.fillStyle='#4a4a4a'; c.fillRect(px-w*.006,wallTop,w*.012,plat-wallTop); }
      // platform slab + bright edge, then the dark pit with a rail
      c.fillStyle='#2e2e2e'; c.fillRect(0,plat,w,h*.06); c.fillStyle='#d6d6d6'; c.fillRect(0,plat,w,h*.018);
      c.fillStyle='#070707'; c.fillRect(0,plat+h*.06,w,h); c.fillStyle='#5a5a5a'; c.fillRect(0,h*.955,w,h*.014);
      for(var tie=0;tie<w;tie+=w*.035) c.fillRect(tie,h*.968,w*.016,h*.02);
      var ph=h*.44, span=w*1.2;
      function loop(x0,speed){return ((x0*w+t*speed)%span+span)%span-w*.1;}
      // regular commuters
      walkers(c,w,h,plat,[[.24,.42,1.4,-1],[.55,.4,.6,1,'phone'],[.8,.44,0,1,'stand']],t,true);
      // dog walker
      var dx=loop(.08,22); person(c,dx,plat,ph,{phase:t*5,halo:true});
      var dogX=dx+ph*.42, dg=ph*.16; c.strokeStyle='#e6e6e6'; c.lineWidth=Math.max(1,ph*.012); c.beginPath(); c.moveTo(dx+ph*.09,plat-ph*.45); c.quadraticCurveTo(dx+ph*.25,plat-ph*.18,dogX-dg*.6,plat-dg*1.2); c.stroke();
      c.fillStyle='#e6e6e6'; c.fillRect(dogX-dg,plat-dg*1.3,dg*1.7,dg*.6);
      c.beginPath(); c.arc(dogX+dg*.85,plat-dg*1.45,dg*.38,0,6.2832); c.fill(); c.fillRect(dogX+dg*.95,plat-dg*1.45,dg*.4,dg*.22);
      c.fillRect(dogX+dg*.6,plat-dg*1.95,dg*.16,dg*.35);
      var lg=Math.sin(t*9)*dg*.25; [[-.8,lg],[-.5,-lg],[.35,-lg],[.6,lg]].forEach(function(l){c.fillRect(dogX+dg*l[0]+l[1]*.4,plat-dg*.75,dg*.14,dg*.75);});
      c.save(); c.translate(dogX-dg,plat-dg*1.2); c.rotate(-.9+Math.sin(t*14)*.4); c.fillRect(-dg*.06,-dg*.6,dg*.12,dg*.6); c.restore();
      // easter egg: a cardboard box sneaking along the platform... with feet
      var bxx=loop(.66,-6), bs=ph*.42, peek=Math.sin(t*.7)>.6;
      c.fillStyle='#bdbdbd'; c.fillRect(bxx,plat-bs*.8-(peek?bs*.12:0),bs,bs*.8);
      c.fillStyle='#000'; c.fillRect(bxx,plat-bs*.56-(peek?bs*.12:0),bs,bs*.04);
      c.fillStyle='#e6e6e6'; var ft=Math.sin(t*6)*bs*.06; c.fillRect(bxx+bs*.2+ft,plat-bs*.12,bs*.14,bs*.12); c.fillRect(bxx+bs*.62-ft,plat-bs*.12,bs*.14,bs*.12);
      if(peek){ c.fillStyle='#e6e6e6'; c.font='700 '+Math.round(bs*.5)+'px monospace'; c.textAlign='center'; c.fillText('!',bxx+bs/2,plat-bs*1.25); c.textAlign='left'; }
      // Pizza Rat, down in the track pit, dragging a slice along the rail
      var fed=since('rat'), rr=h*.042, ry=h*.955, rx=loop(.92,-14);
      if(fed<1.4) rx-=Math.pow(fed/1.4,2)*w*1.2;                       // grabs the slice and bolts
      var big=(OA.ratBig&&fed>=1.4)?1.6:1;
      OA.ratBox=[(rx-rr*4.5*big)/w,(ry-rr*2.4)/h,(rr*8*big)/w,(rr*2.8)/h];
      c.fillStyle='#e6e6e6';
      c.beginPath(); c.ellipse(rx,ry-rr*.8,rr*1.3,rr*.75,0,0,6.2832); c.fill(); c.beginPath(); c.arc(rx-rr*1.3,ry-rr*.95,rr*.5,0,6.2832); c.fill();
      c.strokeStyle='#e6e6e6'; c.lineWidth=Math.max(1,rr*.2); c.beginPath(); c.moveTo(rx+rr*1.2,ry-rr*.6); c.quadraticCurveTo(rx+rr*2.4,ry-rr*1.8+Math.sin(t*6)*rr*.4,rx+rr*3,ry-rr*.4); c.stroke();
      c.beginPath(); c.moveTo(rx-rr*1.7,ry-rr*.7); c.lineTo(rx-rr*(1.7+2.5*big),ry-rr*.3); c.lineTo(rx-rr*(1.7+1.9*big),ry-rr*(.7+1.2*big)); c.closePath(); c.fill();
      c.fillStyle='#000'; [[-3.4,-.7],[-2.9,-1.1]].forEach(function(p){c.beginPath(); c.arc(rx-rr*1.7+rr*(p[0]+1.7)*big,ry-rr*.6+rr*(p[1]+.6)*big,rr*.16*big,0,6.2832); c.fill();});
    },

    stop:function(c,w,h,t,cv){ drawSign(c,w,h,cv.dataset.label); },
    // surveys: a QR flyer on a wall, people stopping to scan it
    flyer:function(c,w,h,t){
      skyline(c,w,h,h*.7,.15,.45,331,'#333','#141414',false,true);
      c.fillStyle='#2e2e2e'; c.fillRect(0,h*.3,w,h*.62);                                 // wall
      var u=Math.min(w,h*2.4), ox=(w-u)/2; c.save(); c.translate(ox,0);
      [[.18,.4,.1,.26],[.68,.36,.11,.3]].forEach(function(p){c.fillStyle='#6a6a6a';c.fillRect(u*p[0],h*p[1],u*p[2],h*p[3]);});   // other posters
      var fx=u*.42, fy=h*.34, fw=u*.16, fh=h*.42; c.fillStyle='#e6e6e6'; c.fillRect(fx,fy,fw,fh);                               // the flyer
      c.fillStyle='#000'; c.fillRect(fx+fw*.12,fy+fh*.08,fw*.76,fh*.06);
      var qx=fx+fw*.2, qy=fy+fh*.26, qs=fw*.6, r=rng(17), n=7, cs=qs/n;                                                        // QR code
      for(var i=0;i<n;i++)for(var j=0;j<n;j++){ var corner=(i<2&&j<2)||(i>4&&j<2)||(i<2&&j>4); if(corner||r()>.5) c.fillRect(qx+i*cs,qy+j*cs,cs,cs); }
      var pulse=(Math.sin(t*2)+1)/2; glow(c,fx+fw/2,qy+qs/2,qs*(.8+pulse*.3),qs*(.8+pulse*.3),.18+pulse*.12);
      c.restore();
      c.fillStyle='#000'; c.fillRect(0,h*.92,w,h);
      walkers(c,w,h,h*.97,[[.08,.34,0],[.47,.4,0,-1,'phone'],[.56,.38,0,1,'phone'],[.9,.33,1.4,-1]],t,true);
    },
    // home about: someone in headphones at a cafe table, laptop open, sipping a coffee; a small city and a passing
    // train through the window. Drawn in a 1000x700 box: smooth silhouette paths + two-bone limbs with fixed lengths.
    cafe:function(c,w,h,t){
      var u=Math.min(w,h*1.43), ox=(w-u)/2; c.save(); c.translate(ox,0); c.scale(u/1000,h/700);
      var W=1000,H=700,ty=500,floor=690;
      function ik(S,T,L1,L2,bend){var dx=T[0]-S[0],dy=T[1]-S[1],d=Math.min(Math.hypot(dx,dy),L1+L2-.01),a=Math.atan2(dy,dx);
        var A=Math.acos(Math.max(-1,Math.min(1,(L1*L1+d*d-L2*L2)/(2*L1*d))));var g=a+bend*A;return [S[0]+Math.cos(g)*L1,S[1]+Math.sin(g)*L1];}
      function seg(A,B,wd,col){c.strokeStyle=col;c.lineWidth=wd;c.lineCap='round';c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();}
      // window: small city + elevated train
      var wx0=20,wy0=24,ww=960,wh=380;
      c.save(); c.beginPath(); c.rect(wx0,wy0,ww,wh); c.clip(); c.fillStyle='#141414'; c.fillRect(wx0,wy0,ww,wh);
      skyline(c,W,H,wy0+wh*.8,.1,.3,307,'#3a3a3a','#222',true,true);
      if(window.NYC){ NYC.chrysler(c,230,wy0+wh,250,'#4a4a4a'); NYC.esb(c,470,wy0+wh,340,'#525252'); NYC.owtc(c,840,wy0+wh,320,'#4a4a4a'); }
      skyline(c,W,H,wy0+wh,.06,.16,311,'#2a2a2a','#1a1a1a',true,false);
      var tY=wy0+wh*.64; c.fillStyle='#555'; c.fillRect(wx0,tY+42,ww,7); for(var px=60;px<W;px+=170) c.fillRect(px,tY+49,9,wh);
      var carW=170,gap=8,n=5,trainL=n*(carW+gap),span=ww+trainL,tx=wx0-trainL+((t*95)%span);
      for(var k=0;k<n;k++){var cx=tx+k*(carW+gap); c.fillStyle='#8e8e8e'; c.fillRect(cx,tY,carW,40); c.fillStyle='#151515'; for(var q=cx+12;q<cx+carW-20;q+=28) c.fillRect(q,tY+8,16,13); c.fillRect(cx,tY+30,carW,3);}
      c.fillStyle='#fff'; c.beginPath(); c.arc(tx+trainL-gap-6,tY+28,5,0,6.2832); c.fill();   // subway headlight
      c.restore();
      c.fillStyle='#000'; c.fillRect(wx0,wy0,ww,8); c.fillRect(wx0,wy0+wh-8,ww,8); c.fillRect(690,wy0,8,wh);
      c.fillStyle='#3a3a3a'; c.fillRect(0,floor,W,5);                                                                     // floor line
      // chair: back, seat, legs
      c.fillStyle='#6a6a6a'; c.fillRect(262,318,16,210); c.fillRect(262,516,150,14); c.fillRect(270,530,10,floor-530); c.fillRect(392,530,10,floor-530);
      var cyc=(t%7)/7, lift=cyc>.58&&cyc<.88?Math.sin((cyc-.58)/.3*Math.PI):0;
      c.save(); c.shadowColor='#000'; c.shadowBlur=14;
      // legs: far leg (darker) then near leg; thigh 175, shin 160
      var hipF=[330,505], kneeF=[492,520], footF=[500,floor-8];
      seg(hipF,kneeF,50,'#7a7a7a'); seg(kneeF,footF,40,'#7a7a7a'); seg([footF[0]-6,footF[1]],[footF[0]+46,footF[1]+2],20,'#7a7a7a');
      var hipN=[338,512], kneeN=[505,535], footN=[526,floor-8];
      seg(hipN,kneeN,54,'#a6a6a6'); seg(kneeN,footN,42,'#a6a6a6'); seg([footN[0]-6,footN[1]],[footN[0]+50,footN[1]+2],22,'#b8b8b8');
      // far arm on the keyboard (behind the body, darker)
      var fS=[400,332], fH=[660,486], fE=ik(fS,fH,150,140,1);
      seg(fS,fE,40,'#8f8f8f'); seg(fE,fH,34,'#8f8f8f');
      // hoodie body (hood down, bunched behind the neck)
      c.fillStyle='#c6c6c6';
      c.fill(new Path2D('M300 520 C286 440 290 372 320 338 C344 318 382 312 408 318 L450 324 C470 342 480 372 484 402 C490 442 486 482 470 520 C430 530 340 530 300 520 Z'));
      c.fillStyle='#a8a8a8'; c.fill(new Path2D('M318 340 C320 312 346 298 372 300 C386 304 394 314 396 322 C370 318 340 326 318 340 Z'));
      // neck + head in profile
      c.fillStyle='#e6e6e6'; c.fill(new Path2D('M404 290 L446 292 L452 326 L408 324 Z'));
      c.fill(new Path2D('M396 300 C368 272 366 206 400 180 C430 158 472 166 484 198 L486 226 L500 244 L487 250 C489 256 485 262 488 268 C483 284 471 292 457 292 C446 300 430 304 416 304 Z'));
      // short hair
      c.fillStyle='#9a9a9a'; c.fill(new Path2D('M376 262 C364 200 398 168 442 170 C472 172 488 188 486 206 C466 194 440 196 420 202 C404 212 396 234 392 262 Z'));
      c.restore();
      // over-ear headphones: band over the top, cup over the ear
      c.strokeStyle='#000'; c.lineWidth=24; c.lineCap='round'; c.beginPath(); c.moveTo(408,240); c.quadraticCurveTo(398,150,454,150); c.stroke();
      c.strokeStyle='#f0f0f0'; c.lineWidth=12; c.beginPath(); c.moveTo(408,240); c.quadraticCurveTo(398,150,454,150); c.stroke();
      c.fillStyle='#000'; c.beginPath(); c.ellipse(410,250,32,40,-.12,0,6.2832); c.fill();
      c.fillStyle='#f4f4f4'; c.beginPath(); c.ellipse(410,250,25,33,-.12,0,6.2832); c.fill();
      c.fillStyle='#000'; c.beginPath(); c.ellipse(410,250,10,15,-.12,0,6.2832); c.fill();
      // table: top + single pedestal (legs stay visible underneath)
      c.fillStyle='#dcdcdc'; c.fillRect(470,ty,500,14); c.fillStyle='#6e6e6e'; c.fillRect(742,ty+14,16,floor-ty-14); c.fillRect(690,floor-10,120,10);
      // laptop with screen glow on the face
      glow(c,620,300,170,130,.2);
      c.fillStyle='#d8d8d8'; c.fillRect(612,ty-10,150,10);
      c.strokeStyle='#e4e4e4'; c.lineWidth=10; c.lineCap='round'; c.beginPath(); c.moveTo(762,ty-6); c.lineTo(800,348); c.stroke();
      // near arm: mug sits on the table, lifted to the lips every ~7s
      var rest=[560,470], sipH=[512,300], hand=[rest[0]+(sipH[0]-rest[0])*lift,rest[1]+(sipH[1]-rest[1])*lift];
      var nS=[424,342], nE=ik(nS,hand,150,140,1);
      c.save(); c.shadowColor='#000'; c.shadowBlur=14; seg(nS,nE,46,'#c6c6c6'); seg(nE,hand,40,'#c6c6c6'); c.restore();
      // mug: wide cup with a clear handle, tips toward the lips while drinking
      c.save(); c.translate(hand[0]+22,hand[1]-6); c.rotate(-.55*lift);
      c.fillStyle='#000'; c.fillRect(-27,-41,54,58); c.fillStyle='#f4f4f4'; c.fillRect(-23,-37,46,50);
      c.strokeStyle='#000'; c.lineWidth=14; c.beginPath(); c.arc(25,-12,14,-1.4,1.4); c.stroke();
      c.strokeStyle='#f4f4f4'; c.lineWidth=7; c.beginPath(); c.arc(25,-12,14,-1.4,1.4); c.stroke();
      c.restore();
      c.fillStyle='#ececec'; c.beginPath(); c.ellipse(hand[0]-4,hand[1]-2,17,14,0,0,6.2832); c.fill();
      // short soft steam, only while the mug is down
      if(lift<.05){ c.lineWidth=5; for(var s2=0;s2<2;s2++){ c.strokeStyle='rgba(255,255,255,'+(.3-s2*.1)+')'; c.beginPath();
        for(var j=0;j<=5;j++){var yy=hand[1]-54-j*9, xx=hand[0]+14+s2*16+Math.sin(j*.9-t*2+s2*2)*6; if(j) c.lineTo(xx,yy); else c.moveTo(xx,yy);} c.stroke(); } }
      c.restore();
    },
    // work: a wall of archived frames, scanned row by row
    archive:function(c,w,h,t){
      var r=rng(211), cols=5, rows=3, gx=w*.012, tw=(w-gx*(cols+1))/cols, th=tw*.68, oy=(h-(th*rows+gx*(rows-1)))/2;
      var scan=((t*.12)%1.3)-.15;
      for(var j=0;j<rows;j++){ for(var i=0;i<cols;i++){
        var x=gx+i*(tw+gx), y=oy+j*(th+gx), lvl=.22+r()*.3, kind=r();
        var d=Math.abs((j+.5)/rows-scan); lvl+=Math.max(0,.45-d*2.2);
        c.fillStyle='rgba(255,255,255,'+Math.min(.95,lvl)+')'; c.fillRect(x,y,tw,th);
        c.fillStyle='#000';
        if(kind<.35){ c.beginPath(); c.moveTo(x+tw*.05,y+th*.9); c.lineTo(x+tw*.35,y+th*.4); c.lineTo(x+tw*.55,y+th*.65); c.lineTo(x+tw*.72,y+th*.3); c.lineTo(x+tw*.95,y+th*.9); c.fill(); }      // landscape
        else if(kind<.6){ c.beginPath(); c.arc(x+tw*.5,y+th*.42,th*.2,0,6.2832); c.fill(); c.fillRect(x+tw*.3,y+th*.66,tw*.4,th*.34); }                                             // portrait
        else if(kind<.8){ c.fillRect(x+tw*.32,y+th*.12,tw*.36,th*.76); c.fillStyle='rgba(255,255,255,.9)'; c.fillRect(x+tw*.36,y+th*.2,tw*.28,th*.55); }                               // phone screen
        else { for(var k=0;k<3;k++) c.fillRect(x+tw*.1,y+th*(.2+k*.22),tw*(.8-k*.2),th*.1); }                                                                                        // text doc
      } }
      c.fillStyle='rgba(255,255,255,.5)'; var sy=oy+scan*(th*rows+gx*(rows-1)); c.fillRect(0,sy,w,Math.max(2,h*.012));
    },
    // contact: rooftop radio tower broadcasting
    signal:function(c,w,h,t){
      skyline(c,w,h,h,.12,.35,223,'#3a3a3a','#141414',true,true);
      var tx=w*.74, top=h*.3, base=h*.88, hw=w*.06;
      c.fillStyle='#8a8a8a'; c.fillRect(tx-w*.16,base,w*.32,h*.14);
      c.strokeStyle='#d0d0d0'; c.lineWidth=Math.max(2,w*.005); c.beginPath();
      c.moveTo(tx-hw,base); c.lineTo(tx,top); c.lineTo(tx+hw,base);
      for(var k=1;k<6;k++){var y=top+(base-top)*k/6, x1=tx-hw*k/6, x2=tx+hw*k/6, y2=top+(base-top)*(k+1)/6, x3=tx-hw*(k+1)/6, x4=tx+hw*(k+1)/6; c.moveTo(x1,y); c.lineTo(x2,y); c.moveTo(x1,y); c.lineTo(x4,y2); c.moveTo(x2,y); c.lineTo(x3,y2);}
      c.stroke();
      c.lineWidth=Math.max(2,h*.012);
      for(var n=0;n<4;n++){ var p=((t*.35+n/4)%1), R=h*.06+p*h*.6; c.strokeStyle='rgba(255,255,255,'+(.85*(1-p))+')';
        c.beginPath(); c.arc(tx,top,R,Math.PI*1.02,Math.PI*1.4); c.stroke(); c.beginPath(); c.arc(tx,top,R,Math.PI*1.6,Math.PI*1.98); c.stroke(); }
      if(Math.sin(t*3)>0){ glow(c,tx,top,h*.06,h*.06,1); }
    },
    // ---- vignettes for negative space beside headings ----
    train:function(c,w,h,t){
      skyline(c,w,h,h*.7,.2,.55,101,'#3a3a3a','#161616',false,true);
      c.fillStyle='#bdbdbd'; c.fillRect(0,h*.72,w,h*.035); for(var x=w*.08;x<w;x+=w*.22){c.fillRect(x,h*.75,w*.02,h*.25);}
      var L=w*1.4, off=((t*w*.12+L*.85)%(L+w))-L; for(var k=0;k<4;k++){var cx=off+k*L/4; c.fillStyle='#d8d8d8'; c.fillRect(cx,h*.5,L/4-w*.012,h*.21); c.fillStyle='#000'; for(var wx=cx+w*.02;wx<cx+L/4-w*.05;wx+=w*.05){c.fillRect(wx,h*.55,w*.03,h*.07);}}
    },
    crossing:function(c,w,h,t){
      skyline(c,w,h,h*.84,.15,.45,113,'#333','#141414',false,true);
      c.fillStyle='#bdbdbd'; for(var x=w*.2;x<w*.8;x+=w*.06){c.fillRect(x,h*.94,w*.035,h*.03);}
      c.fillRect(w*.86,h*.25,Math.max(3,w*.008),h*.72); c.fillStyle='#e0e0e0'; c.fillRect(w*.83,h*.22,w*.06,h*.14);
      person(c,w*.86,h*.35,h*.11,{walk:true,phase:1,col:'#000'});
      walkers(c,w*.8,h,h*.95,[[.15,.36,0],[.4,.4,1.2,-1,'phone'],[.65,.34,2.2]],t,true);
    },
    rooftop:function(c,w,h,t){
      skyline(c,w,h,h*.7,.2,.6,127,'#3a3a3a','#151515',true,true);
      c.fillStyle='#6a6a6a'; c.fillRect(0,h*.74,w,h*.3); c.fillStyle='#000'; c.fillRect(0,h*.72,w,h*.02);
      var tx=w*.12; c.fillStyle='#cfcfcf'; c.fillRect(tx,h*.4,w*.1,h*.2); c.beginPath(); c.moveTo(tx-w*.01,h*.4); c.lineTo(tx+w*.05,h*.3); c.lineTo(tx+w*.11,h*.4); c.fill(); c.fillRect(tx+w*.01,h*.6,w*.008,h*.12); c.fillRect(tx+w*.08,h*.6,w*.008,h*.12);
      person(c,w*.62,h*.72,h*.36,{walk:false,hood:true,halo:true});
    },
    drones:function(c,w,h,t){
      skyline(c,w,h,h,.2,.55,139,'#3c3c3c','#161616',true,true);
      [[.25,.3,0],[.55,.18,1.7],[.8,.36,3.1]].forEach(function(d){var x=w*d[0]+Math.sin(t*.6+d[2])*w*.02, y=h*d[1]+Math.sin(t*1.3+d[2])*h*.03, r=h*.05;
        c.fillStyle='#e0e0e0'; c.fillRect(x-r*1.6,y-r*.12,r*3.2,r*.24); c.fillRect(x-r*.4,y-r*.3,r*.8,r*.6);
        c.beginPath(); c.ellipse(x-r*1.6,y-r*.3,r*.7,r*.15,0,0,6.2832); c.ellipse(x+r*1.6,y-r*.3,r*.7,r*.15,0,0,6.2832); c.fill();
        var g=c.createLinearGradient(0,y,0,h); g.addColorStop(0,'rgba(255,255,255,.35)'); g.addColorStop(1,'rgba(255,255,255,0)'); c.fillStyle=g; c.beginPath(); c.moveTo(x-r*.2,y+r*.3); c.lineTo(x+r*.2,y+r*.3); c.lineTo(x+r*2.2,h); c.lineTo(x-r*2.2,h); c.fill();});
    },
    cams:function(c,w,h,t){
      skyline(c,w,h,h*.9,.15,.45,151,'#333','#121212',false,true);
      var px=w*.7; c.fillStyle='#c8c8c8'; c.fillRect(px,h*.12,Math.max(3,w*.01),h*.8); c.fillRect(px-w*.12,h*.16,w*.13,h*.02);
      [[-.12,.18,-.25],[.012,.25,.3]].forEach(function(k){c.save(); c.translate(px+w*k[0],h*k[1]); c.rotate(k[2]+Math.sin(t*.5)*.15); c.fillStyle='#e0e0e0'; c.fillRect(-w*.04,0,w*.08,h*.07); c.fillStyle='#000'; c.fillRect(w*.03,h*.02,w*.01,h*.03); c.restore();});
      ground(c,w,h,h*.92,.25); walkers(c,w,h,h*.92,[[.3,.38,0],[.5,.34,1.6,-1,'hood']],t,true);
    },
    students:function(c,w,h,t){
      [[.15,.5],[.85,.45]].forEach(function(tr){var x=w*tr[0]; c.fillStyle='#8a8a8a'; c.fillRect(x-w*.006,h*tr[1],w*.012,h*(1-tr[1])); c.fillStyle='#bdbdbd'; c.beginPath(); c.arc(x,h*tr[1],h*.2,0,6.2832); c.arc(x-h*.14,h*(tr[1]+.06),h*.13,0,6.2832); c.arc(x+h*.15,h*(tr[1]+.05),h*.14,0,6.2832); c.fill();});
      ground(c,w,h,h*.95,.25); walkers(c,w,h,h*.95,[[.3,.4,0,1,'pack'],[.5,.42,1.4,-1,'phone','pack'],[.7,.38,2.4,1,'pack']],t,true);
    },
    // home / privacy: night city, umbrella figure + walkers
    wide:function(c,w,h,t){
      skyline(c,w,h,h*.9,.2,.45,41,'#3c3c3c','#151515',false,true);
      if(window.NYC){ var hs=h*.95; NYC.chrysler(c,w*.24,hs,h*.72,'#9a9a9a'); NYC.esb(c,w*.5,hs,h*.92,'#b4b4b4'); NYC.owtc(c,w*.78,hs,h*.86,'#9a9a9a'); }
      skyline(c,w,h,h*.98,.12,.62,33,'#c4c4c4','#2a2a2a',true,true);
      walkers(c,w,h,h*.99,[[.12,.2,0],[.31,.36,0,1,'umb'],[.5,.19,1.5,-1],[.72,.21,.4],[.88,.2,2.2,-1,'hood']],t,true);
    },
    quiet:function(c,w,h,t){ skyline(c,w,h,h*.92,.2,.5,57,'#4a4a4a','#181818',false,true); skyline(c,w,h,h,.15,.55,61,'#bdbdbd','#262626',true,true); },
    // work: people stopping under a big screen
    billboard:function(c,w,h,t){
      skyline(c,w,h,h,.25,.6,71,'#4a4a4a','#1a1a1a',true,true);
      var bx=w*.36,by=h*.08,bw=w*.3,bh=h*.42; c.fillStyle='#000'; c.fillRect(bx-6,by-6,bw+12,bh+12);
      c.fillStyle='#d8d8d8'; c.fillRect(bx,by,bw,bh); c.fillStyle='#000';
      var tw=(bw-4*6)/3, th=(bh-3*6)/2; for(var i=0;i<3;i++)for(var j=0;j<2;j++){c.fillRect(bx+6+i*(tw+6)+tw*.1,by+6+j*(th+6)+th*.15,tw*.8,th*.7);}
      c.fillStyle='#d8d8d8'; c.fillRect(bx+bw*.48,by+bh,bw*.04,h*.2);
      ground(c,w,h,h*.98,.25);
      walkers(c,w,h,h*.98,[[.1,.28,0],[.42,.3,0,1,'stand'],[.5,.27,0,-1,'phone'],[.58,.29,0,1,'stand'],[.85,.26,1.4,-1]],t,true);
    },
    // resume: one figure walking toward the tallest tower
    path:function(c,w,h,t){
      skyline(c,w,h,h*.9,.15,.4,83,'#3a3a3a','#141414',false,false);
      var tx=w*.78; c.fillStyle='#cfcfcf'; c.fillRect(tx,h*.05,w*.06,h*.85); c.fillRect(tx+w*.028,0,w*.004,h*.05);
      c.fillStyle='#000'; for(var y=h*.1;y<h*.85;y+=h*.06){c.fillRect(tx+w*.008,y,w*.044,h*.018);}
      ground(c,w,h,h*.9,.35);
      walkers(c,w,h,h*.9,[[.2,.34,0,1]],t,true);
    },
    // contact: someone on a call under a street lamp
    lamp:function(c,w,h,t){
      skyline(c,w,h,h*.9,.2,.5,91,'#383838','#121212',true,false);
      var lx=w*.55; c.fillStyle='#9a9a9a'; c.fillRect(lx,h*.08,Math.max(3,w*.005),h*.82); c.fillRect(lx-w*.04,h*.08,w*.045,h*.02);
      cone(c,lx-w*.035,h*.1,h*.9,w*.14,.85); glow(c,lx-w*.035,h*.1,w*.03,w*.03,1);
      ground(c,w,h,h*.9,.3);
      person(c,lx-w*.05,h*.9,h*.5,{phone:true,walk:false,col:'#000',dir:1});
      walkers(c,w,h,h*.9,[[.15,.3,0],[.85,.28,1.6,-1]],t,true);
    },
    // 404: one figure alone at the end of the road
    lost:function(c,w,h,t){
      ground(c,w,h,h*.9,.35); skyline(c,w,h,h*.9,.08,.25,13,'#2e2e2e','#101010',false,false);
      c.fillStyle='#c8c8c8'; c.fillRect(w*.62,h*.4,Math.max(3,w*.004),h*.5); c.save(); c.translate(w*.62,h*.42); c.rotate(-.18); c.fillRect(-w*.02,0,w*.09,h*.08); c.restore();
      person(c,w*.48,h*.9,h*.42,{walk:false,hood:true,halo:true});
    },
    // bubble keyboard: commuters, one checking their watch
    watch:function(c,w,h,t){
      skyline(c,w,h,h*.92,.18,.5,23,'#4a4a4a','#181818',true,true); ground(c,w,h,h*.98,.25);
      walkers(c,w,h,h*.98,[[.12,.24,0],[.32,.26,1.1,-1],[.5,.44,0,1,'watch'],[.7,.25,2,1],[.9,.23,.5,-1]],t,true);
    },
    // campusconnect: clock tower and students with backpacks
    campus:function(c,w,h,t){
      skyline(c,w,h,h*.92,.12,.3,29,'#3a3a3a','#141414',false,false);
      var cx=w*.5; c.fillStyle='#cfcfcf'; c.fillRect(cx-w*.2,h*.5,w*.4,h*.45); c.fillRect(cx-w*.04,h*.12,w*.08,h*.4);
      c.beginPath(); c.moveTo(cx-w*.05,h*.12); c.lineTo(cx,0); c.lineTo(cx+w*.05,h*.12); c.fill();
      c.fillStyle='#000'; c.beginPath(); c.arc(cx,h*.26,w*.025,0,6.2832); c.fill(); c.strokeStyle='#cfcfcf'; c.lineWidth=2; c.beginPath(); c.moveTo(cx,h*.26); c.lineTo(cx,h*.215); c.moveTo(cx,h*.26); c.lineTo(cx+w*.015,h*.26); c.stroke();
      for(var k=0;k<7;k++){c.fillRect(cx-w*.18+k*w*.053,h*.6,w*.025,h*.3);}
      ground(c,w,h,h*.98,.25);
      walkers(c,w,h,h*.98,[[.1,.26,0,1,'pack'],[.28,.27,1.3,-1,'pack'],[.62,.25,.6,1,'phone','pack'],[.8,.27,2.2,-1,'pack']],t,true);
    },
    // lifeline: watch towers, cameras, a figure caught in a searchlight
    surveil:function(c,W,h,t){
      skyline(c,W,h,h*.92,.2,.55,47,'#3a3a3a','#141414',true,true);
      [.12,.88].forEach(function(px){var x=W*px; c.fillStyle='#bdbdbd'; c.fillRect(x,h*.15,Math.max(3,W*.004),h*.77); c.fillRect(x-W*.015,h*.15,W*.034,h*.05); c.fillRect(x+W*.015,h*.2,W*.02,h*.03);});
      ground(c,W,h,h*.95,.2);
      var w=Math.min(W,h*2.4); c.save(); c.translate((W-w)/2,0);
      var lx=w*.78, sx=w*(.42+.03*Math.sin(t*.5)); c.fillStyle='#bdbdbd'; c.fillRect(lx,h*.05,Math.max(3,w*.012),h*.9); c.fillRect(lx-w*.03,h*.05,w*.05,h*.06);
      var g=c.createLinearGradient(lx,h*.1,sx,h*.95); g.addColorStop(0,'rgba(255,255,255,.95)'); g.addColorStop(1,'rgba(255,255,255,.7)'); c.fillStyle=g;
      c.beginPath(); c.moveTo(lx-w*.025,h*.1); c.lineTo(lx-w*.005,h*.1); c.lineTo(sx+w*.17,h*.95); c.lineTo(sx-w*.17,h*.95); c.closePath(); c.fill();
      person(c,w*.42,h*.95,h*.6,{hood:true,walk:false,col:'#000'});
      c.restore();
    },
    // ride-along: three depths slide past at different speeds, driven by scroll progress (OA.rideP)
    ride:function(c,w,h){
      var p=OA.rideP||0;
      c.save(); c.translate(-p*w*.35,0); skyline(c,w*1.4,h,h*.8,.12,.34,211,'#2c2c2c','#141414',false,false); c.restore();
      c.save(); c.translate(-p*w*.9,0);
      if(window.NYC){ NYC.chrysler(c,w*.35,h*.82,h*.62,'#4a4a4a'); NYC.esb(c,w*.95,h*.82,h*.74,'#4a4a4a'); NYC.owtc(c,w*1.55,h*.82,h*.72,'#4a4a4a');
        NYC.bridge(c,w*1.15,w*1.45,h*.8,h*.42,'rgba(255,255,255,.35)',Math.max(2,w*.0025)); }
      skyline(c,w*1.95,h,h*.84,.08,.26,223,'#3a3a3a','#181818',true,false); c.restore();
      var o=(p*w*2.2)%(w*.14); c.fillStyle='#8a8a8a'; c.fillRect(0,h*.86,w,h*.03);
      for(var x=-o;x<w+w*.14;x+=w*.14){ c.fillRect(x,h*.86,Math.max(3,w*.006),h*.14); c.save(); c.strokeStyle='#5a5a5a'; c.lineWidth=Math.max(1.5,w*.002); c.beginPath(); c.moveTo(x,h*.89); c.lineTo(x+w*.07,h*.86); c.lineTo(x+w*.14,h*.89); c.stroke(); c.restore(); }
    },
    // mw4: player at a desk, monitor glow, city through the window
    gamer:function(c,W,h,t){
      skyline(c,W,h,h*.7,.12,.4,53,'#3a3a3a','#161616',true,true);
      var w=Math.min(W,h*2.6); c.save(); c.translate((W-w)/2,0);
      var mx=w*.3,mw=w*.4,my=h*.22,mh=h*.42; glow(c,mx+mw/2,my+mh/2,mw*.8,mh*.9,.45); c.fillStyle='#e0e0e0'; c.fillRect(mx,my,mw,mh);
      c.fillStyle='#000'; c.fillRect(mx+mw*.06,my+mh*.16,mw*.28,mh*.1); c.fillRect(mx+mw*.06,my+mh*.34,mw*.18,mh*.07); c.fillRect(mx+mw*.06,my+mh*.68,mw*.24,mh*.14); c.fillRect(mx+mw*.62,my+mh*.16,mw*.3,mh*.66);
      c.fillStyle='#bdbdbd'; c.fillRect(mx+mw*.46,my+mh,mw*.08,h*.09); c.fillRect(w*.12,h*.73,w*.76,h*.035);
      var px=w*.5; c.fillStyle='#000'; c.lineCap='round'; c.strokeStyle='#000';
      c.beginPath(); c.moveTo(px-w*.09,h*1.02); c.lineTo(px-w*.08,h*.5); c.quadraticCurveTo(px,h*.38,px+w*.08,h*.5); c.lineTo(px+w*.09,h*1.02); c.fill();      // chair back
      c.beginPath(); c.arc(px,h*.44,h*.085,0,6.2832); c.fill();                                                                                               // head
      c.lineWidth=h*.022; c.beginPath(); c.arc(px,h*.44,h*.11,Math.PI*1.05,Math.PI*1.95); c.stroke();                                                        // headset
      c.lineWidth=h*.045; c.beginPath(); c.moveTo(px-w*.06,h*.6); c.lineTo(px-w*.12,h*.73); c.moveTo(px+w*.06,h*.6); c.lineTo(px+w*.12,h*.73); c.stroke();   // arms to desk
      c.restore();
    }
  };

  var items=[].slice.call(all).map(function(cv){
    return {cv:cv,ctx:cv.getContext('2d'),fn:SCENES[cv.dataset.scene],anim:cv.dataset.anim==='1',vis:false,t:0,W:0,H:0,step:7,src:document.createElement('canvas')};
  });
  function size(it){var r=it.cv.getBoundingClientRect();it.W=Math.round(r.width);it.H=Math.round(r.height);it.cv.width=it.W*DPR;it.cv.height=it.H*DPR;it.step=+it.cv.dataset.step||(it.W<500?6:7);}
  function render(it){
    if(!it.W) return;
    var cols=Math.ceil(it.W/it.step)+1, rows=Math.ceil(it.H/it.step)+1, S=3, s=it.src;
    s.width=cols*S; s.height=rows*S; var sc=s.getContext('2d'); sc.fillStyle='#000'; sc.fillRect(0,0,s.width,s.height);
    it.fn(sc,s.width,s.height,it.t,it.cv);
    var sm=document.createElement('canvas'); sm.width=cols; sm.height=rows; var mc=sm.getContext('2d'); mc.drawImage(s,0,0,cols,rows);
    var d=mc.getImageData(0,0,cols,rows).data, c=it.ctx, max=it.step*.5, step=it.step;
    c.setTransform(DPR,0,0,DPR,0,0); c.clearRect(0,0,it.W,it.H); c.globalCompositeOperation='lighter';
    [['rgba(118,87,255,.8)',-1.5,0,1],['rgba(64,224,255,.42)',1.5,1,.8]].forEach(function(L){
      c.fillStyle=L[0]; c.beginPath();
      for(var y=0;y<rows;y++){ var ro=(y&1)*step*.5; for(var x=0;x<cols;x++){ var v=d[(y*cols+x)*4]/255; if(v<.12) continue; v=(v-.12)/.88;
        var rad=Math.min(max,Math.sqrt(v)*max*L[3]); if(rad<.45) continue; var px=x*step+ro+L[1], py=y*step+L[2]; c.moveTo(px+rad,py); c.arc(px,py,rad,0,6.2832); } }
      c.fill(); });
    c.globalCompositeOperation='source-over';
  }
  items.forEach(function(it){size(it);render(it);});
  var ro=new ResizeObserver(function(){items.forEach(function(it){size(it);render(it);});}); items.forEach(function(it){ro.observe(it.cv.parentNode);});

  // reveal + animate while visible
  var io=new IntersectionObserver(function(es){es.forEach(function(e){var it=items.filter(function(i){return i.cv===e.target;})[0]; it.vis=e.isIntersecting; if(e.isIntersecting) e.target.classList.add('in');});},{rootMargin:'0px 0px -10% 0px'});
  items.forEach(function(it){io.observe(it.cv);});
  if(reduce){ items.forEach(function(it){it.cv.classList.add('in');}); return; }
  var last=0, acc=0;
  (function loop(now){ requestAnimationFrame(loop); var dt=Math.min((now-last)/1000,.1); last=now; acc+=dt; if(acc<.05) return;
    items.forEach(function(it){ if(it.vis&&it.anim&&!document.hidden){ it.t+=acc; render(it);} }); acc=0; })(0);
  // light parallax
  var rideIt=items.filter(function(i){return i.cv.dataset.scene==='ride';})[0], foot=document.querySelector('.ht-band');
  function rideUpd(){ if(!rideIt) return; var vh=innerHeight, max=Math.max(1,document.documentElement.scrollHeight-vh), y=scrollY;
    OA.rideP=y/max; var ft=foot?foot.getBoundingClientRect().top:vh*2, o=Math.min(1,Math.max(0,(y-vh*.6)/(vh*.4)))*Math.min(1,Math.max(0,(ft-vh*.55)/(vh*.35)));
    rideIt.cv.parentNode.style.setProperty('--o',(o*.22).toFixed(3)); if(o>0) render(rideIt); }
  var tk=0; function par(){tk=0; rideUpd(); var vh=innerHeight; items.forEach(function(it){ if(it===rideIt) return; var r=it.cv.parentNode.getBoundingClientRect(); if(r.bottom<-200||r.top>vh+200) return; var off=(r.top+r.height/2-vh/2)*-.06; it.cv.style.transform='translate3d(0,'+off.toFixed(1)+'px,0)';});}
  addEventListener('scroll',function(){if(!tk) tk=requestAnimationFrame(par);},{passive:true}); par();
})();
