// Project cards: VHS / cyberpunk tape overlay.
// Rest: scanlines + VCR readout (❚❚ PAUSE, channel, timecode). Hover/focus: ~420ms signal glitch
// (purple/cyan split, two slices tearing sideways, one tracking band rolling down), then PLAY with a
// running timecode. Reduced motion: overlay only, no glitch, timecode stays put. Touch: shows PLAY.
(function(){
  var frames=[].slice.call(document.querySelectorAll('.work-image,.home-card-image')); if(!frames.length) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
  function pad(n){return (n<10?'0':'')+n;}
  frames.forEach(function(f,i){
    var img=f.querySelector('img'); if(!img) return;
    var o=document.createElement('span'); o.className='vhs'; o.setAttribute('aria-hidden','true');
    o.innerHTML='<span class="vhs-ch vhs-p"></span><span class="vhs-ch vhs-c"></span><span class="vhs-tear t1"></span><span class="vhs-tear t2"></span>'+
      '<span class="vhs-scan"></span><span class="vhs-track"></span><span class="vhs-k k1"></span><span class="vhs-k k2"></span><span class="vhs-k k3"></span><span class="vhs-k k4"></span><span class="vhs-bar"><i></i></span>'+
      '<span class="vhs-osd tl"><b>'+(fine?'❚❚ PAUSE':'▶ PLAY')+'</b></span><span class="vhs-osd tr">CH '+pad(i%7+1)+'</span><span class="vhs-osd br">SP <i>00:00:00</i></span>';
    f.appendChild(o);
    function setSrc(){var u='url("'+(img.currentSrc||img.src)+'")';[].forEach.call(o.querySelectorAll('.vhs-ch,.vhs-tear'),function(e){e.style.backgroundImage=u;});}
    if(img.complete) setSrc(); else img.addEventListener('load',setSrc,{once:true});
    var state=o.querySelector('.tl b'), tc=o.querySelector('.br i'), timer=0, frame=0, gT=0;
    function tick(){frame++; var s=Math.floor(frame/30); tc.textContent=pad(Math.floor(s/3600))+':'+pad(Math.floor(s/60)%60)+':'+pad(s%60);}
    function on(){
      state.textContent='▶ PLAY';
      if(reduce) return;
      o.classList.add('playing');
      setSrc();
      o.style.setProperty('--y1',(10+Math.random()*40).toFixed(0)+'%'); o.style.setProperty('--y2',(50+Math.random()*35).toFixed(0)+'%');
      o.classList.remove('glitch'); void o.offsetWidth; o.classList.add('glitch');
      clearTimeout(gT); gT=setTimeout(function(){o.classList.remove('glitch');},460);
      clearInterval(timer); timer=setInterval(tick,1000/30);
    }
    function off(){ state.textContent=fine?'❚❚ PAUSE':'▶ PLAY'; clearInterval(timer); o.classList.remove('playing'); }
    var host=f.closest('a')||f;
    if(fine){ host.addEventListener('pointerenter',on); host.addEventListener('pointerleave',off); }
    host.addEventListener('focus',on); host.addEventListener('blur',off);
  });
})();
