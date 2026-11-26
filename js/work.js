// Project viewer: opens a project's details in a native <dialog>
// (focus trap, Esc to close and focus return come from the browser).
(() => {
  const dialog = document.querySelector(".project-dialog");
  const body = dialog && dialog.querySelector(".dialog-body");
  const closeBtn = dialog && dialog.querySelector(".dialog-close");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const EXIT_MS = 180; // matches --dur-exit
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opener = null;

  function open(item, {updateHash = true} = {}) {
    const detail = item.querySelector(".work-detail");
    if (!detail) return;

    const text = document.createElement("div");
    text.className = "detail-text";
    const images = document.createElement("div");
    images.className = "detail-images";

    [...detail.children].forEach(node => {
      (node.matches("figure") ? images : text).append(node.cloneNode(true));
    });
    // images inside the viewer load right away
    images.querySelectorAll("img").forEach(img => img.removeAttribute("loading"));

    const heading = text.querySelector("h2");
    if (heading) heading.id = "dialog-title";

    body.replaceChildren(text, images);
    opener = item.querySelector(".work-open");
    dialog.classList.remove("closing");
    dialog.showModal();
    document.body.classList.add("dialog-open");
    dialog.scrollTop = 0;
    closeBtn.focus();

    if (updateHash) history.replaceState(null, "", `#${item.id}`);
  }

  function close() {
    if (!dialog.open || dialog.classList.contains("closing")) return;
    const finish = () => {
      dialog.classList.remove("closing");
      dialog.close();
    };
    if (reduced) return finish();
    dialog.classList.add("closing");
    setTimeout(finish, EXIT_MS);
  }

  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
    history.replaceState(null, "", location.pathname);
    if (opener) opener.focus();
  });

  // Esc: run the exit animation instead of an instant close
  dialog.addEventListener("cancel", event => {
    event.preventDefault();
    close();
  });

  closeBtn.addEventListener("click", close);

  // click on the backdrop (outside the dialog box) closes it
  dialog.addEventListener("click", event => {
    const r = dialog.getBoundingClientRect();
    const inside = event.clientX >= r.left && event.clientX <= r.right && event.clientY >= r.top && event.clientY <= r.bottom;
    if (!inside) close();
  });

  // cards with a case study are plain links; the rest open the viewer
  document.querySelectorAll(".work-item").forEach(item => {
    const trigger = item.querySelector("button.work-open");
    if (trigger) trigger.addEventListener("click", () => open(item));
  });

  // deep links from the home page, e.g. work.html#lifeline
  const target = location.hash && document.getElementById(location.hash.slice(1));
  if (target && target.classList.contains("work-item")) {
    const link = target.querySelector("a.work-open");
    if (link) { location.replace(link.href); return; }
    target.scrollIntoView({block: "center"});
    open(target, {updateHash: false});
  }
})();
