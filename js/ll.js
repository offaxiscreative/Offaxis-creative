// Lifeline: the green-zone countdown ticks while on screen (static for reduced motion)
(function(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var els=[].slice.call(document.querySelectorAll('.ll-screen:not(.lo) .ll-count'));
  if(!els.length) return;
  var t=299, base='Return within {t} to avoid −20 REP.';
  setInterval(function(){
    t = t<=0 ? 299 : t-1;
    var s=('0'+Math.floor(t/60)).slice(-2)+':'+('0'+t%60).slice(-2);
    els.forEach(function(e){ e.textContent=base.replace('{t}',s); });
  },1000);
})();
