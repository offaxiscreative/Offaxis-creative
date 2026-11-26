// Case study: click-to-load Figma prototype, and sections that settle in on scroll.
(() => {
  const frame = document.querySelector(".proto-frame");
  const btn = frame && frame.querySelector(".proto-load");
  if (btn) btn.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = frame.dataset.embed;
    iframe.title = "Interactive Figma prototype of the Bubble Keyboard";
    iframe.allowFullscreen = true;
    iframe.setAttribute("allow", "fullscreen");
    frame.replaceChildren(iframe);
    iframe.focus();
  });

  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    items.forEach(el => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), {rootMargin: "0px 0px -10% 0px"});
  items.forEach(el => io.observe(el));
})();
