// Easter egg: click the footer station sign to open the OFF/AXIS line map. Pick a stop and a train
// rolls through the platform, then you arrive at that page. The real nav stays the main way around.
(function(){
  var sign=document.querySelector('.ht-stop'), band=document.querySelector('.ht-band'); if(!sign||!band) return;
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root=document.querySelector('script[src^="/js/"]')?'/':'';
  var STOPS=[['Home','index.html'],['Work','work.html'],['About','index.html#about'],['Resume','resume.html'],['Contact','contact.html']];
  var here=location.pathname.split('/').pop()||'index.html';
  var current=({'index.html':'Home','work.html':'Work','resume.html':'Resume','contact.html':'Contact'})[here]||(/bubble|campus|lifeline|mw4/.test(here)?'Work':'');
  var map=document.createElement('div'); map.className='subway-map'; map.hidden=true; map.setAttribute('role','dialog'); map.setAttribute('aria-label','OFF/AXIS line map');
  map.innerHTML='<p class="subway-title"><span class="bullet">O</span><span class="bullet">A</span> OFF/AXIS LINE · PICK A STOP</p><ol class="subway-line">'+
    STOPS.map(function(s){var on=s[0]===current; return '<li'+(on?' class="here"':'')+'><button type="button" data-href="'+root+s[1]+'"'+(on?' aria-current="page"':'')+'><i aria-hidden="true"></i><span>'+s[0]+'</span>'+(on?'<em>YOU ARE HERE</em>':'')+'</button></li>';}).join('')+'</ol>';
  sign.insertAdjacentElement('afterend',map);
  function open(v){map.hidden=!v; sign.setAttribute('aria-expanded',String(v)); if(v&&window.OAunlock) OAunlock('map'); if(v){var b=map.querySelector('li:not(.here) button'); b&&b.focus();}}
  sign.addEventListener('click',function(e){e.stopPropagation(); open(map.hidden);});
  document.addEventListener('click',function(e){if(!map.hidden&&!map.contains(e.target)) open(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!map.hidden){open(false); sign.focus();}});
  map.addEventListener('click',function(e){
    var b=e.target.closest('button[data-href]'); if(!b) return; e.stopPropagation();
    var href=b.dataset.href; if(b.closest('.here')){open(false); return;}
    try{ if(!JSON.parse(localStorage.getItem('oa-achievements')||'{}').ride) sessionStorage.setItem('oa-pending','ride'); }catch(err){}
    if(reduce){location.href=href; return;}
    map.classList.add('departing'); b.closest('li').classList.add('picked');
    // MetroCard swipe first, then the train
    var swipe=document.createElement('div'); swipe.className='metrocard'; swipe.setAttribute('role','status');
    swipe.innerHTML='<span class="reader" aria-hidden="true"><span class="card">OFF/AXIS</span></span><b>SWIPE CARD…</b>';
    map.appendChild(swipe);
    setTimeout(function(){ swipe.querySelector('b').textContent='GO · STAND CLEAR'; swipe.classList.add('ok'); },650);
    setTimeout(function(){ var train=document.createElement('div'); train.className='express'; band.appendChild(train); band.style.opacity='1'; },850);
    setTimeout(function(){location.href=href;},1950);
  });
})();
