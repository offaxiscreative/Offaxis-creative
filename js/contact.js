// Contact form: inline validation and sending without leaving the page.
// Without JavaScript the form still posts straight to Formspree.
(() => {
  const form = document.querySelector(".contact-form");
  if (!form) return;

  const success = document.querySelector(".form-success");
  const status = form.querySelector(".form-status");
  const button = form.querySelector(".send-button");
  const label = button.querySelector(".send-label");
  const fields = ["name", "email", "message"].map(id => form.querySelector(`#${id}`));
  const touched = new Set();

  const clean = el => el.value.trim();
  const isValid = el => {
    if (el.id === "email") return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(el));
    return clean(el).length > 0;
  };

  function showError(el, show) {
    const msg = document.getElementById(`${el.id}-error`);
    el.setAttribute("aria-invalid", show ? "true" : "false");
    if (msg) msg.hidden = !show;
  }

  fields.forEach(el => {
    // validate on blur the first time; once an error shows, re-check while typing
    el.addEventListener("blur", () => {
      if (clean(el) === "" && !touched.has(el)) return;
      touched.add(el);
      showError(el, !isValid(el));
    });
    el.addEventListener("input", () => {
      if (el.getAttribute("aria-invalid") === "true") showError(el, !isValid(el));
    });
  });

  // accept stray spaces and capitals in the email
  const email = form.querySelector("#email");
  email.addEventListener("blur", () => { email.value = email.value.trim().toLowerCase(); });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    status.textContent = "";

    const invalid = fields.filter(el => !isValid(el));
    fields.forEach(el => { touched.add(el); showError(el, invalid.includes(el)); });
    if (invalid.length) {
      const first = invalid[0];
      const wrap = first.closest(".field");
      wrap.classList.remove("shake");
      void wrap.offsetWidth;
      wrap.classList.add("shake");
      first.focus();
      return;
    }

    // disable at once; only show "Sending…" if it takes longer than 300ms
    button.disabled = true;
    let shownAt = 0;
    const slow = setTimeout(() => { label.textContent = "SENDING…"; shownAt = performance.now(); }, 300);

    let ok = false;
    try {
      const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {Accept: "application/json"}
      });
      ok = res.ok;
    } catch (e) {
      ok = false;
    }

    clearTimeout(slow);
    if (shownAt) {
      const wait = 500 - (performance.now() - shownAt);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
    }

    if (ok) {
      success.querySelector(".success-email").textContent = clean(email);
      form.hidden = true;
      success.hidden = false;
      success.focus();
      return;
    }

    // keep everything they typed, and say what to do
    button.disabled = false;
    label.textContent = "TRY AGAIN";
    status.innerHTML = 'Your message didn’t send. Check your connection and try again, or message me on <a href="https://www.linkedin.com/in/offaxiscreative" target="_blank" rel="noopener noreferrer">LinkedIn</a>.';
  });
})();
