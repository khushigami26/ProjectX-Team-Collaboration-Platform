//  calendar category buttons
function renderCalendarCategoryButtons() {
  const container = document.querySelector(".category-tabs");
  if (!container) return;

  const categories = ["All", "Work", "Study", "Personal"];
  container.innerHTML = "";

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    btn.innerText = cat;
    container.appendChild(btn);
  });
}

renderCalendarCategoryButtons();
