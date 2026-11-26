(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Grid gets its own layer so the per-frame drift only moves a transform
  // (setting a CSS variable on <body> every frame restyled the whole page).
  const grid = document.createElement("div");
  grid.className = "axis-grid";
  grid.setAttribute("aria-hidden", "true");

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");

  const crosshair = document.createElement("div");
  crosshair.className = "axis-crosshair";
  crosshair.setAttribute("aria-hidden", "true");

  document.body.prepend(grid);
  document.body.append(glow, crosshair);
  document.body.classList.add("has-axis-grid");

  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  let mouseX = innerWidth / 2;
  let mouseY = innerHeight / 2;
  let glowX = mouseX;
  let glowY = mouseY;
  let crosshairX = mouseX;
  let crosshairY = mouseY;
  const start = performance.now();

  addEventListener("pointermove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  }, {passive: true});

  function animate(now) {
    const time = (now - start) / 1000;

    // wrap at 288px (the large purple tile) so neither grid layer ever jumps
    grid.style.transform = `translate3d(${(time * 5) % 288}px,${(time * 3) % 288}px,0) rotate(.15deg)`;

    if (finePointer) {
      glowX += (mouseX - glowX) * .06;
      glowY += (mouseY - glowY) * .06;
      glow.style.transform = `translate3d(${glowX - 325}px,${glowY - 325}px,0)`;

      crosshairX += (mouseX - crosshairX) * .025;
      crosshairY += (mouseY - crosshairY) * .025;
      crosshair.style.transform = `translate3d(${crosshairX - 23}px,${crosshairY - 23}px,0) rotate(${Math.sin(time * .7) * 4}deg)`;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
