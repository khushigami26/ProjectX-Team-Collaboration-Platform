//  toast system
(function () {
  function ensureContainer() {
    let c = document.getElementById("toastContainer");
    if (!c) {
      c = document.createElement("div");
      c.id = "toastContainer";
      c.className = "toast-container";
      document.body.appendChild(c);
    }
    return c;
  }

  function showToast(message, type = "info", duration = 3000) {
    const container = ensureContainer();
    const toast = document.createElement("div");
    toast.className = "toast " + type;
    toast.innerText = message;

    container.appendChild(toast);
    // trigger enter
    requestAnimationFrame(() => toast.classList.add("show"));

    const hide = () => {
      toast.classList.remove("show");
      toast.addEventListener("transitionend", () => toast.remove(), {
        once: true,
      });
    };

    const timer = setTimeout(hide, duration);

    toast.addEventListener("click", () => {
      clearTimeout(timer);
      hide();
    });

    return toast;
  }

  window.showToast = showToast;
})();
