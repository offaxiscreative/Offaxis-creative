// Home hero: cyberpunk glitch-split halftone.
// Source: an original procedural night skyline (or any photo via data-src on the canvas).
// Two dot layers (purple + cyan) offset like a misregistered print/signal; a short glitch every few
// seconds slices bands sideways. Draws only on resize and during a glitch — idle cost is zero.
// Reduced motion: static image, no glitch.
(function(){
  var cv=document.querySelector('.hero-halftone'); if(!cv) return;
  var ctx=cv.getContext('2d'), src=document.createElement('canvas'), sctx=src.getContext('2d');
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W=0,H=0,DPR=1,lum=null,cols=0,rows=0,STEP=7, visible=true, glitchT=0, timer=0;

  function rng(seed){return function(){seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};}
  function drawSkyline(w,h){
    var r=rng(41);
    var g=sctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#000'); g.addColorStop(.55,'#060606'); g.addColorStop(.8,'#262626'); g.addColorStop(1,'#0a0a0a');
    sctx.fillStyle=g; sctx.fillRect(0,0,w,h);
    // moon
    var mx=w*.68,my=h*.3,mr=Math.min(w,h)*.22;
    var mg=sctx.createRadialGradient(mx,my,mr*.2,mx,my,mr*2.2); mg.addColorStop(0,'rgba(255,255,255,.3)'); mg.addColorStop(1,'rgba(255,255,255,0)');
    sctx.fillStyle=mg; sctx.fillRect(0,0,w,h);
    var md=sctx.createLinearGradient(mx-mr,my-mr,mx+mr,my+mr); md.addColorStop(0,'#fff'); md.addColorStop(1,'#9a9a9a');
    sctx.fillStyle=md; sctx.beginPath(); sctx.arc(mx,my,mr,0,Math.PI*2); sctx.fill();
    // moon bands (synthwave cut lines)
    sctx.fillStyle='#000';
    for(var b=0;b<6;b++){var y=my+mr*(.15+b*.16), hh=2+b*1.6; sctx.fillRect(mx-mr,y,mr*2,hh);}
    // back skyline (lighter), front skyline (black) with lit windows
    function row(base,minH,maxH,shade,windows){
      var x=-10; while(x<w){
        var bw=w*(.03+r()*.06), bh=h*(minH+r()*(maxH-minH)); sctx.fillStyle=shade; sctx.fillRect(x,base-bh,bw,bh+h);
        if(r()>.6){sctx.fillRect(x+bw*.45,base-bh-h*.05,2,h*.05);}               // antenna
        if(r()>.75){sctx.fillRect(x+bw*.2,base-bh-h*.02,bw*.6,h*.02);}           // roof unit
        if(windows){ for(var wy=base-bh+8;wy<base-6;wy+=9){ for(var wx=x+5;wx<x+bw-5;wx+=8){ if(r()>.72){sctx.fillStyle='rgba(255,255,255,'+(.35+r()*.5)+')';sctx.fillRect(wx,wy,3,4);} } } sctx.fillStyle=shade; }
        x+=bw+r()*4;
      }
    }
    row(h*.9,.12,.3,'#3a3a3a',false);
    // Manhattan landmarks against the moon: Chrysler, Empire State (spire through the moon), One World Trade
    if(window.NYC){ NYC.chrysler(sctx,w*.54,h*.93,h*.34,'#030303'); NYC.esb(sctx,w*.7,h*.93,h*.42,'#030303'); NYC.owtc(sctx,w*.87,h*.93,h*.4,'#030303'); }
    row(h*1.0,.06,.2,'#030303',true);
    // Brooklyn Bridge in front, lit like it is at night
    if(window.NYC){ NYC.bridge(sctx,w*.62,w*.95,h*.99,h*.76,'rgba(255,255,255,.38)',Math.max(2,w*.0035)); }
    // haze line at street level
    var hz=sctx.createLinearGradient(0,h*.78,0,h); hz.addColorStop(0,'rgba(255,255,255,0)'); hz.addColorStop(1,'rgba(255,255,255,.12)');
    sctx.fillStyle=hz; sctx.fillRect(0,h*.78,w,h*.22);
  }
  function sample(){
    cols=Math.ceil(W/STEP)+1; rows=Math.ceil(H/STEP)+1;
    var small=document.createElement('canvas'); small.width=cols; small.height=rows; var c2=small.getContext('2d');
    if(img){ var s=Math.max(cols/img.width,rows/img.height),iw=img.width*s,ih=img.height*s; c2.drawImage(img,(cols-iw)/2,(rows-ih)/2,iw,ih); }
    else { src.width=cols*4; src.height=rows*4; drawSkyline(src.width,src.height); c2.drawImage(src,0,0,cols,rows); }
    var d=c2.getImageData(0,0,cols,rows).data; lum=new Float32Array(cols*rows);
    for(var i=0;i<cols*rows;i++){var L=(d[i*4]*.299+d[i*4+1]*.587+d[i*4+2]*.114)/255; lum[i]=L<.12?0:(L-.12)/.88;}
  }
  function layer(color,dx,dy,bands,boost){
    ctx.fillStyle=color; ctx.beginPath();
    var max=STEP*.5;
    for(var y=0;y<rows;y++){
      var off=0; for(var b=0;b<bands.length;b++){var B=bands[b]; if(y>=B[0]&&y<B[1]) off=B[2];}
      var py=y*STEP+dy, rowOdd=(y&1)*STEP*.5;
      for(var x=0;x<cols;x++){
        var L=lum[y*cols+x]; if(L<.06) continue;
        var rad=Math.min(max,Math.sqrt(L)*max*boost); if(rad<.5) continue;
        var px=x*STEP+rowOdd+dx+off;
        ctx.moveTo(px+rad,py); ctx.arc(px,py,rad,0,6.2832);
      }
    }
    ctx.fill();
  }
  function draw(glitch){
    ctx.setTransform(DPR,0,0,DPR,0,0); ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    var split=glitch?7+Math.random()*8:2.5, bands=[];
    if(glitch){ for(var k=0;k<3+Math.floor(Math.random()*3);k++){ var y0=Math.floor(Math.random()*rows), h=1+Math.floor(Math.random()*5); bands.push([y0,y0+h,(Math.random()-.5)*60]); } }
    layer('rgba(118,87,255,.8)',-split,0,bands,1);
    layer('rgba(64,224,255,.45)',split,1,bands.map(function(b){return [b[0],b[1],-b[2]*.6];}),.82);
    ctx.globalCompositeOperation='source-over';
  }
  var img=null;
  function resize(){
    var r=cv.getBoundingClientRect(); DPR=Math.min(window.devicePixelRatio||1,2);
    W=Math.round(r.width); H=Math.round(r.height); if(!W||!H) return;
    cv.width=W*DPR; cv.height=H*DPR; STEP=W<600?6:7; sample(); draw(false);
  }
  function glitchBurst(){
    if(reduce||!visible||document.hidden){ schedule(); return; }
    var n=0; (function f(){ draw(true); if(++n<5){ setTimeout(f,45+Math.random()*40); } else { draw(false); schedule(); } })();
  }
  function schedule(){ clearTimeout(timer); timer=setTimeout(glitchBurst,3500+Math.random()*3500); }
  var ds=cv.getAttribute('data-src');
  function boot(){ resize(); new ResizeObserver(function(){resize();}).observe(cv); new IntersectionObserver(function(e){visible=e[0].isIntersecting;},{threshold:0}).observe(cv); if(!reduce) schedule(); }
  if(ds){ img=new Image(); img.onload=boot; img.src=ds; } else boot();
  // page halftone: cyan layer drifts off-register as you scroll (subtle, capped at ±5px)
  var pc=document.querySelector('.page-halftone .ht-c');
  if(pc&&!reduce){var tk=0;addEventListener('scroll',function(){if(tk)return;tk=requestAnimationFrame(function(){tk=0;pc.style.setProperty('--ht-shift',(Math.sin(scrollY/260)*5).toFixed(2)+'px');});},{passive:true});}
})();
