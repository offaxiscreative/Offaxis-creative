(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");

  const crosshair = document.createElement("div");
  crosshair.className = "axis-crosshair";
  crosshair.setAttribute("aria-hidden", "true");

  document.body.append(glow, crosshair);

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

    document.body.style.setProperty("--grid-x", `${(time * 5) % 72}px`);
    document.body.style.setProperty("--grid-y", `${(time * 3) % 72}px`);

    glowX += (mouseX - glowX) * .06;
    glowY += (mouseY - glowY) * .06;
    glow.style.transform = `translate3d(${glowX - 325}px,${glowY - 325}px,0)`;

    crosshairX += (mouseX - crosshairX) * .025;
    crosshairY += (mouseY - crosshairY) * .025;
    crosshair.style.transform = `translate3d(${crosshairX - 23}px,${crosshairY - 23}px,0) rotate(${Math.sin(time * .7) * 4}deg)`;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();