// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark") ? "dark" : "light"
  );
}

// load user theme
(function () {
  if (localStorage.getItem("theme") === "dark")
    document.body.classList.add("dark");
})();

function applyBackgroundFromStorage() {
  const data = localStorage.getItem("bgImage");
  if (data) {
    document.body.style.backgroundImage = `url(${data})`;
    document.body.classList.add("custom-bg");
    return;
  }
  // default  for dashboard
  if (location.pathname && location.pathname.includes("dashboard.html")) {
    document.body.style.backgroundImage = `url(BACKGROUND.JPG)`;
    document.body.classList.add("custom-bg");
  } else {
    document.body.style.backgroundImage = "";
    document.body.classList.remove("custom-bg");
  }
}

function setBackgroundFromFile(input) {
  const f = input && input.files && input.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      localStorage.setItem("bgImage", e.target.result);
      applyBackgroundFromStorage();
      if (window.showToast) window.showToast("Background set", "success");
    } catch (err) {
      if (window.showToast)
        window.showToast("Could not save background", "error");
    }
  };
  reader.readAsDataURL(f);
}

function clearBackground() {
  localStorage.removeItem("bgImage");
  applyBackgroundFromStorage();
  if (window.showToast) window.showToast("Background cleared", "info");
}

applyBackgroundFromStorage();
window.setBackgroundFromFile = setBackgroundFromFile;
window.clearBackground = clearBackground;
