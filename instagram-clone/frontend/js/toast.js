(function () {
  const CONTAINER_ID = "toastContainer";
  const STYLE_ID = "toastStyles";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${CONTAINER_ID} {
        position: fixed;
        top: 16px;
        right: 16px;
        display: grid;
        gap: 10px;
        z-index: 9999;
      }
      .toast {
        background: rgba(20, 20, 20, 0.92);
        color: #fff;
        padding: 10px 14px;
        border-radius: 8px;
        font-size: 14px;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
        max-width: 280px;
      }
      .toast.success { background: #1f7a3f; }
      .toast.error { background: #b42318; }
      .toast.info { background: #1f3a8a; }
    `;
    document.head.appendChild(style);
  }

  function ensureContainer() {
    let container = document.getElementById(CONTAINER_ID);
    if (!container) {
      container = document.createElement("div");
      container.id = CONTAINER_ID;
      document.body.appendChild(container);
    }
    return container;
  }

  window.showToast = function (message, type = "info", duration = 2200) {
    if (!message) return;
    ensureStyles();
    const container = ensureContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
      if (!container.childElementCount) container.remove();
    }, duration);
  };
})();
