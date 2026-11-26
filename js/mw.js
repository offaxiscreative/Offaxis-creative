// MW4 case study: in-hand loadout sequence as one continuous camera timeline (not a slideshow).
// Storyboard (ms per step = hold + transition):
//   01 stock     hold 1900 → PUSH 900   camera pushes into the rail, next shot settles in from the same point
//   02 equipping hold 1400 → PULL 850   camera pulls back to the full gun, lock-on pulse where the Reflex lands
//   03 built     hold 2100 → FADE 500   tab switch, gun holds still
//   04 base      hold 1500 → PAINT 1150 gold paints up the gun with a glint at the leading edge
//   05 gold      hold 2400 → FADE 700   loop back to stock
// Plays only while visible; reduced motion = no drift, no transitions, starts paused.
(function(){
  var p=document.querySelector('[data-player]'); if(!p) return;
  var stage=p.querySelector('.mw-stage');
  var frames=[].slice.call(p.querySelectorAll('.mw-frame')), steps=[].slice.call(p.querySelectorAll('.mw-dot')), cap=p.querySelector('.mw-caption'), btn=p.querySelector('.mw-play');
  var SEG=[
    {hold:1900,x:900, type:'push', focus:[.57,.39]},
    {hold:1400,x:850, type:'pull', focus:[.64,.43]},
    {hold:2100,x:500, type:'fade', focus:[.70,.30]},
    {hold:1500,x:1150,type:'paint',focus:[.60,.42]},
    {hold:2400,x:700, type:'fade', focus:[.55,.40]}
  ];
  var DRIFT=.03; // slow camera creep across each step so nothing ever sits dead still
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var start=[],total=0; SEG.forEach(function(s){start.push(total);total+=s.hold+s.x;});
  var ring=document.createElement('i'); ring.className='mw-ring'; ring.setAttribute('aria-hidden','true');
  var glint=document.createElement('i'); glint.className='mw-glint'; glint.setAttribute('aria-hidden','true');
  stage.appendChild(ring); stage.appendChild(glint);

  var t=0, last=0, raf=0, visible=false, userPaused=reduce, cur=-1;
  function ease(x){return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2;}          // in-out cubic
  function out(x){return 1-Math.pow(1-x,3);}                              // ease-out cubic
  function clamp(x){return x<0?0:x>1?1:x;}
  // sweep ∩ ellipse around the gun; the ellipse opens to full frame at the end so the UI catches up after the gun
  function setMask(el,m,r){
    if(m===null){el.style.webkitMaskImage=el.style.maskImage='';return;}
    var g='linear-gradient(8deg,#000 '+(m-14)+'%,transparent '+m+'%), radial-gradient(ellipse '+r+'% '+(r*1.5)+'% at 58% 48%,#000 60%,transparent 100%)';
    el.style.webkitMaskImage=g;el.style.maskImage=g;el.style.webkitMaskComposite='source-in';el.style.maskComposite='intersect';
  }
  function place(el,f,scale,op,blur){
    el.style.visibility=op>0?'visible':'hidden';
    el.style.opacity=op;
    el.style.transformOrigin=(f[0]*100)+'% '+(f[1]*100)+'%';
    el.style.transform='scale('+scale.toFixed(4)+')';
    el.style.filter=blur?'blur('+blur.toFixed(2)+'px)':'';
  }
  function render(){
    var k=0; while(k<SEG.length-1&&t>=start[k+1]) k++;
    var s=SEG[k], u=t-start[k], len=s.hold+s.x, n=(k+1)%SEG.length, nx=SEG[n];
    var A=frames[k], B=frames[n], dA=reduce?1:1+DRIFT*(u/len);
    frames.forEach(function(f,i){if(i!==k&&i!==n){f.style.visibility='hidden';f.style.opacity=0;setMask(f,null);}});setMask(glint,null);
    A.style.zIndex=1; B.style.zIndex=2; setMask(A,null);
    ring.style.opacity=0; glint.style.opacity=0;
    if(u<=s.hold||reduce){
      place(A,s.focus,dA,1,0); place(B,nx.focus,1,0,0); setMask(B,null);
    } else {
      var q=clamp((u-s.hold)/s.x), e=ease(q);
      if(s.type==='push'){
        // one camera move: A keeps pushing into the rail and softens, B arrives from the same push
        place(A,s.focus,dA*(1+.22*e),1-clamp((q-.35)/.4),5*e);
        place(B,s.focus,1.12-.12*out(q),out(clamp((q-.2)/.4)),3*(1-out(clamp((q-.2)/.6))));
      } else if(s.type==='pull'){
        place(A,s.focus,dA*(1-.04*e),1-clamp((q-.2)/.6),0);
        place(B,nx.focus,1.09-.09*out(q),clamp(q/.55),0);
        var r=clamp((q-.35)/.65);                                         // lock-on pulse at the Reflex
        ring.style.left=(nx.focus[0]*100)+'%'; ring.style.top=(nx.focus[1]*100)+'%';
        ring.style.transform='translate(-50%,-50%) scale('+(.5+1.1*out(r)).toFixed(3)+')';
        ring.style.opacity=(r>0?Math.sin(Math.PI*r):0).toFixed(3);
      } else if(s.type==='paint'){
        // gold paints up the gun: feathered mask sweep + light band riding its edge
        var m=-6+120*ease(clamp(q/.75)), rad=26+140*ease(clamp((q-.6)/.4)), m2=q<.75?m:200;
        place(A,s.focus,dA,1,0); place(B,nx.focus,1,1,0); setMask(B,m2,rad);
        glint.style.background='linear-gradient(8deg,transparent '+(m-10)+'%,rgba(255,214,130,.5) '+(m-3)+'%,rgba(255,244,214,.8) '+(m-1)+'%,transparent '+(m+4)+'%)';
        setMask(glint,200,22); glint.style.opacity=(q<.75?Math.sin(Math.PI*q/.75):0).toFixed(3);
      } else {
        place(A,s.focus,dA,1,0); place(B,nx.focus,1,e,0); setMask(B,null);
      }
    }
    if(cur!==k){
      if(cur!==-1){var d=steps[k];cap.querySelector('.n').textContent=('0'+(k+1))+' / 0'+steps.length;cap.querySelector('b').textContent=d.dataset.t;cap.querySelector('.d').textContent=d.dataset.d;cap.classList.remove('swap');void cap.offsetWidth;cap.classList.add('swap');}
      cur=k;steps.forEach(function(st,i){st.classList.toggle('is-on',i===k);if(i===k)st.setAttribute('aria-current','step');else st.removeAttribute('aria-current');});
    }
    steps.forEach(function(st,i){st.querySelector('.bar').style.transform='scaleX('+(i===k?(u/len).toFixed(4):0)+')';});
  }
  function tick(now){
    var dt=Math.min(now-last,64); last=now; t=(t+dt)%total; render();
    raf=requestAnimationFrame(tick);
  }
  function stop(){cancelAnimationFrame(raf);raf=0;p.classList.remove('playing');}
  function run(){stop();if(userPaused||!visible)return;p.classList.add('playing');last=performance.now();raf=requestAnimationFrame(tick);}
  function setBtn(){btn.setAttribute('aria-pressed',String(!userPaused));btn.setAttribute('aria-label',userPaused?'Play animation':'Pause animation');}
  steps.forEach(function(st,k){st.addEventListener('click',function(){t=start[k];userPaused=true;setBtn();stop();render();});});
  btn.addEventListener('click',function(){userPaused=!userPaused;setBtn();run();});
  frames.forEach(function(f){f.querySelector('img').loading='eager';});
  new IntersectionObserver(function(e){visible=e[0].isIntersecting;run();},{threshold:.35}).observe(p);
  setBtn(); render();
})();
