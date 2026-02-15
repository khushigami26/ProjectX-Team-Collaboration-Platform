const overlay = document.getElementById("overlay");
const sideMenu = document.getElementById("sideMenu");

// navigation stack for back btn
window._navStack = window._navStack || [];
if (!window._navStack.length) window._navStack.push("tasksScreen");

function updateBackButton() {
  const btn = document.getElementById("backBtn");
  if (!btn) return;
  const top =
    window._navStack && window._navStack.length
      ? window._navStack[window._navStack.length - 1]
      : null;
  if (
    top === "tasksScreen" ||
    !(window._navStack && window._navStack.length > 1)
  ) {
    btn.classList.add("hidden");
  } else btn.classList.remove("hidden");
}

function goBack() {
  if (!window._navStack || window._navStack.length <= 1) return;
  window._navStack.pop();
  const prev = window._navStack[window._navStack.length - 1] || "tasksScreen";
  const titleMap = {
    tasksScreen: "Tasks",
    calendarScreen: "Calendar",
    profileScreen: "Mine",
    analyticsScreen: "Overview",
    settingsScreen: "Settings",
  };
  showScreen(prev, titleMap[prev] || "", null, { noPush: true });
  updateBackButton();
}
window.goBack = goBack;

function openMenu() {
  sideMenu.classList.remove("hidden");
  sideMenu.classList.add("show");
  overlay.classList.remove("hidden");
}

function closeMenu() {
  sideMenu.classList.remove("show");
  sideMenu.classList.add("hidden");
  overlay.classList.add("hidden");
}

function resetTopNav() {
  document
    .querySelectorAll(".top-nav button")
    .forEach((btn) => btn.classList.remove("active"));
}

function showScreen(screenId, title, btn, options) {
  options = options || {};
  [
    "tasksScreen",
    "calendarScreen",
    "profileScreen",
    "analyticsScreen",
    "settingsScreen",
  ].forEach((id) => document.getElementById(id).classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
  resetTopNav();
  if (btn) btn.classList.add("active");
  if (!options.noPush) {
    if (
      !window._navStack ||
      window._navStack[window._navStack.length - 1] !== screenId
    )
      window._navStack.push(screenId);
  }
  updateBackButton();
}

function openAnalytics(btn) {
  showScreen("analyticsScreen", "Overview", btn);
  if (window.renderOverview) setTimeout(() => window.renderOverview(), 60);
}

function openTasks(btn) {
  showScreen("tasksScreen", "Tasks", btn);
  if (window.renderCategories) setTimeout(() => window.renderCategories(), 30);
}

function openCalendar(btn) {
  showScreen("calendarScreen", "Calendar", btn);
}
function openProfile(btn) {
  showScreen("profileScreen", "Mine", btn);
}
function openSettings(btn) {
  showScreen("settingsScreen", "Settings", btn);
}
