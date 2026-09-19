document.addEventListener("DOMContentLoaded", () => {
  const button = document.querySelector(".nav-toggle");
  const nav = document.querySelector("header nav");

  if (!button || !nav) return;

  const setMenu = open => {
    document.body.classList.toggle("nav-open", open);
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };

  button.addEventListener("click", event => {
    event.stopPropagation();
    setMenu(!document.body.classList.contains("nav-open"));
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => setMenu(false));
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("header")) setMenu(false);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") setMenu(false);
  });

  window.addEventListener("resize", () => {
    if (innerWidth > 760) setMenu(false);
  });
});