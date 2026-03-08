// Category UI  hlpr
function getStoredCategories() {
  try {
    const raw = JSON.parse(localStorage.getItem("categories") || "[]");
    return raw
      .map((c) => {
        if (!c) return null;
        if (typeof c === "string") return { name: c, emoji: "", color: "" };
        if (typeof c === "object")
          return {
            name: c.name || "",
            emoji: c.emoji || "",
            color: c.color || "",
          };
        return null;
      })
      .filter(Boolean);
  } catch (e) {
    return [];
  }
}

function saveStoredCategories(arr) {
  localStorage.setItem("categories", JSON.stringify(arr || []));
}

function getRemovedDefaults() {
  try {
    return JSON.parse(localStorage.getItem("removedDefaults") || "[]");
  } catch (e) {
    return [];
  }
}

function saveRemovedDefaults(arr) {
  localStorage.setItem("removedDefaults", JSON.stringify(arr || []));
}

function addCategory(name, emoji, color) {
  if (!name) return;
  const trimmed = name.trim();
  if (!trimmed) return;
  const base = ["All"]; // only 'All' cat is reserved default
  const stored = getStoredCategories();
  const trimmedLower = trimmed.toLowerCase();
  if (
    base.some((b) => b.toLowerCase() === trimmedLower) ||
    stored.some((s) => s.name && s.name.toLowerCase() === trimmedLower)
  ) {
    if (window.showToast) window.showToast("Category already exists", "info");
    return;
  }
  stored.push({ name: trimmed, emoji: emoji || "", color: color || "" });
  saveStoredCategories(stored);

  setTimeout(() => {
    if (window.renderCategories) window.renderCategories();
  }, 80);
  if (window.showToast) window.showToast("Category added", "success");
}

function removeCategoryByName(name) {
  const stored = getStoredCategories();
  const filtered = stored.filter((s) => s.name !== name);
  saveStoredCategories(filtered);
  renderCategories();
  if (window.showToast) window.showToast("Category removed", "success");
}

function promptAddCategory() {
  openAddCategoryModal();
}

//  modal to add a category
function openAddCategoryModal() {
  let modal = document.getElementById("catAddModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "catAddModal";
    modal.className = "modal hidden";
    modal.innerHTML = `
      <div class="modal-content">
        <header class="modal-header">
          <h3>Add Category</h3>
          <button type="button" class="modal-close" data-close>✕</button>
        </header>
        <div class="modal-body">
          <div class="form-row">
            <label for="newCategoryName">Name</label>
            <input id="newCategoryName" class="rounded-input" placeholder="e.g. Shopping" />
          </div>
          <div class="form-row">
            <label>Tag Emoji</label>
            <div class="emoji-palette" id="emojiPalette">
              <button type="button" class="emoji">🎯</button>
              <button type="button" class="emoji">🛒</button>
              <button type="button" class="emoji">📚</button>
              <button type="button" class="emoji">📝</button>
              <button type="button" class="emoji">💡</button>
              <button type="button" class="emoji">🎉</button>
            </div>
          </div>
          <div class="form-row">
            <label>Color</label>
            <div class="emoji-palette" id="colorPalette">
              <button type="button" class="color-opt" data-color="#d8a3b5" style="background:#d8a3b5"></button>
              <button type="button" class="color-opt" data-color="#b39fd6" style="background:#b39fd6"></button>
              <button type="button" class="color-opt" data-color="#86a8d3" style="background:#86a8d3"></button>
              <button type="button" class="color-opt" data-color="#e6c97a" style="background:#e6c97a"></button>
              <button type="button" class="color-opt" data-color="#8fb99a" style="background:#8fb99a"></button>
            </div>
          </div>
          <div class="form-actions">
            <button type="button" class="btn primary" id="catAddConfirm">Add</button>
            <button type="button" class="btn secondary" data-cancel>Cancel</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.addEventListener("click", (ev) => {
      // close when outside click or close/cancel
      const trigger =
        ev.target.closest && ev.target.closest("[data-close],[data-cancel]");
      if (ev.target === modal || trigger) {
        closeModal(modal);
        setTimeout(() => {
          if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
          if (window.renderCategories) window.renderCategories();
        }, 240);
      }
    });

    modal.querySelectorAll(".emoji").forEach((b) =>
      b.addEventListener("click", (ev) => {
        modal
          .querySelectorAll(".emoji")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      })
    );

    modal.querySelectorAll(".color-opt").forEach((b) =>
      b.addEventListener("click", (ev) => {
        modal
          .querySelectorAll(".color-opt")
          .forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
      })
    );

    modal.querySelector("#catAddConfirm").addEventListener("click", () => {
      const input = document.getElementById("newCategoryName");
      const val = input && input.value && input.value.trim();
      if (!val)
        return window.showToast && window.showToast("Enter a name", "error");
      const activeEmoji = modal.querySelector(".emoji.active");
      const emoji = activeEmoji ? activeEmoji.innerText : "";
      const activeColor = modal.querySelector(".color-opt.active");
      const color = activeColor ? activeColor.getAttribute("data-color") : "";
      addCategory(val, emoji, color);
      closeModal(modal);

      // remove modal after animation
      setTimeout(() => {
        if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
        if (window.renderCategories) window.renderCategories();
      }, 240);
    });
  }

  modal.classList.add("show");
  modal.classList.remove("hidden");
  const input = document.getElementById("newCategoryName");
  if (input) {
    input.value = "";
    setTimeout(() => input.focus(), 120);
  }
}

function closeModal(el) {
  if (!el) return;
  el.classList.remove("show");
  el.classList.add("hidden");
}

function renderCategories() {
  const container = document.querySelector(".category-tabs");
  if (!container) return;

  const base = ["All"];
  let stored = getStoredCategories();
  const forbidden = ["all"];
  const filteredStored = stored.filter(
    (s) => !(s.name && forbidden.includes(s.name.toLowerCase()))
  );
  if (filteredStored.length !== stored.length) {
    stored = filteredStored;
    saveStoredCategories(stored);
  }
  const visibleDefaults = base;
  const categories = visibleDefaults.concat(stored.map((s) => s.name));

  container.innerHTML = "";

  categories.forEach((cat) => {
    const btn = document.createElement("button");
    const found = stored.find((s) => s.name === cat);
    btn.innerText = (found && found.emoji ? found.emoji + " " : "") + cat;
    //  custom color
    if (found && found.color) {
      btn.style.background = found.color;
      btn.style.color = "white";
    }
    btn.setAttribute("data-cat", cat);
    btn.addEventListener("click", () => {
      container
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (window.setCategory) window.setCategory(cat);
    });
    container.appendChild(btn);
  });

  if (!container.querySelector("button.active")) {
    const allBtn = container.querySelector("button[data-cat='All']");
    if (allBtn) allBtn.classList.add("active");
  }

  const addGlobal = document.createElement("button");
  addGlobal.className = "add-global-btn";
  addGlobal.title = "Add category";
  addGlobal.innerText = "+";
  addGlobal.addEventListener("click", (e) => {
    e.stopPropagation();
    promptAddCategory();
  });
  container.appendChild(addGlobal);

  const removeGlobal = document.createElement("button");
  removeGlobal.className = "remove-global-btn";
  removeGlobal.title = "Remove last category";
  removeGlobal.innerText = "-";
  removeGlobal.addEventListener("click", (e) => {
    e.stopPropagation();

    const storedNow = getStoredCategories();
    if (storedNow.length > 0) {
      const last = storedNow[storedNow.length - 1];
      const confirmDel = confirm(`Remove last added category '${last.name}'?`);
      if (!confirmDel) return;
      storedNow.pop();
      saveStoredCategories(storedNow);
      renderCategories();
      if (window.showToast) window.showToast("Category removed", "success");
      return;
    }

    if (window.showToast)
      window.showToast("No custom categories to remove", "info");
  });
  container.appendChild(removeGlobal);

  try {
    const sel = document.getElementById("taskCategory");
    if (sel) {
      const prev = sel.value;
      sel.innerHTML = "";
      categories.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c;
        opt.innerText = c;
        const f = stored.find((s) => s.name === c);
        if (f && f.color) opt.setAttribute("data-color", f.color);
        sel.appendChild(opt);
      });
      if (prev && Array.from(sel.options).some((o) => o.value === prev))
        sel.value = prev;
      else if (sel.options.length) sel.value = sel.options[0].value;
    }
  } catch (e) {}
}

window.addCategory = addCategory;
window.promptAddCategory = promptAddCategory;

window.renderCategories = renderCategories;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", renderCategories);
} else {
  renderCategories();
}
