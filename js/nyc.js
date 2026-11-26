// NYC landmark silhouettes for the halftone scenes (original vector drawings, simplified).
// Each draws on any 2D context: x = centre, base = ground y, H = full height incl. spire, col = fill.
(function(){
  function esb(c,x,base,H,col){                       // Empire State Building: setbacks + mast
    c.fillStyle=col;
    c.fillRect(x-.12*H,base-.56*H,.24*H,.56*H);
    c.fillRect(x-.085*H,base-.72*H,.17*H,.17*H);
    c.fillRect(x-.055*H,base-.81*H,.11*H,.1*H);
    c.fillRect(x-.035*H,base-.87*H,.07*H,.07*H);
    c.fillRect(x-.016*H,base-.96*H,.032*H,.1*H);
    c.fillRect(x-.005*H,base-H,.01*H,.05*H);
  }
  function chrysler(c,x,base,H,col){                  // Chrysler Building: shaft, stacked arches, needle spire
    c.fillStyle=col;
    c.fillRect(x-.085*H,base-.68*H,.17*H,.68*H);
    for(var k=0;k<5;k++){var wk=.17*H*(1-k*.16), yk=base-.68*H-k*.045*H;
      c.beginPath(); c.ellipse(x,yk,wk/2,.06*H,0,Math.PI,0); c.lineTo(x+wk/2,yk+.01*H); c.lineTo(x-wk/2,yk+.01*H); c.closePath(); c.fill();}
    c.beginPath(); c.moveTo(x-.022*H,base-.9*H); c.lineTo(x,base-H); c.lineTo(x+.022*H,base-.9*H); c.closePath(); c.fill();
  }
  function owtc(c,x,base,H,col){                      // One World Trade Center: podium, tapered tower, spire
    c.fillStyle=col;
    c.fillRect(x-.11*H,base-.1*H,.22*H,.1*H);
    c.beginPath(); c.moveTo(x-.11*H,base-.1*H); c.lineTo(x-.06*H,base-.78*H); c.lineTo(x+.06*H,base-.78*H); c.lineTo(x+.11*H,base-.1*H); c.closePath(); c.fill();
    c.fillRect(x-.04*H,base-.8*H,.08*H,.025*H);
    c.fillRect(x-.006*H,base-H,.012*H,.21*H);
  }
  // Brooklyn Bridge, drawn as lit lines: two towers with twin gothic arches, deck, main cables + suspenders.
  function bridge(c,x1,x2,deck,towerTop,col,lw){
    var tw=(deck-towerTop)*.42; c.strokeStyle=col; c.lineWidth=lw; c.lineJoin='miter';
    [x1,x2].forEach(function(x){
      c.strokeRect(x-tw/2,towerTop,tw,deck-towerTop+lw*4);
      [-.22,.22].forEach(function(o){var ax=x+o*tw, aw=tw*.26, at=towerTop+(deck-towerTop)*.32;
        c.beginPath(); c.moveTo(ax-aw/2,deck); c.lineTo(ax-aw/2,at+aw*.6); c.quadraticCurveTo(ax-aw/2,at,ax,at-aw*.2); c.quadraticCurveTo(ax+aw/2,at,ax+aw/2,at+aw*.6); c.lineTo(ax+aw/2,deck); c.stroke();});
    });
    c.beginPath(); c.moveTo(x1-(x2-x1)*.6,deck); c.lineTo(x2+(x2-x1)*.6,deck); c.stroke();                   // deck
    var sag=deck-(deck-towerTop)*.08;
    c.beginPath(); c.moveTo(x1,towerTop+lw); c.quadraticCurveTo((x1+x2)/2,sag+(sag-towerTop)*.9,x2,towerTop+lw); c.stroke();     // main span cable
    c.beginPath(); c.moveTo(x1,towerTop+lw); c.quadraticCurveTo(x1-(x2-x1)*.25,deck-(deck-towerTop)*.25,x1-(x2-x1)*.6,deck); c.stroke();
    c.beginPath(); c.moveTo(x2,towerTop+lw); c.quadraticCurveTo(x2+(x2-x1)*.25,deck-(deck-towerTop)*.25,x2+(x2-x1)*.6,deck); c.stroke();
    c.lineWidth=Math.max(1,lw*.5);                                                                              // suspenders
    for(var i=1;i<12;i++){var t=i/12, px=x1+(x2-x1)*t, cy=(1-t)*(1-t)*(towerTop+lw)+2*(1-t)*t*(sag+(sag-towerTop)*.9)+t*t*(towerTop+lw);
      c.beginPath(); c.moveTo(px,cy); c.lineTo(px,deck); c.stroke();}
  }
  window.NYC={esb:esb,chrysler:chrysler,owtc:owtc,bridge:bridge};
})();
