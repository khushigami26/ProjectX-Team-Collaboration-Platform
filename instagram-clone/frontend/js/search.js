const friendSearch = document.getElementById("friendSearch");
const friendsList = document.getElementById("friendsList");
const recentList = document.getElementById("recentList");
const clearRecent = document.getElementById("clearRecent");
const storyInput = document.getElementById("storyInput");
const postInput = document.getElementById("postInput");
const addMenu = document.getElementById("addMenu");
const addStory = document.getElementById("addStory");
const addPost = document.getElementById("addPost");
const closeAddMenu = document.getElementById("closeAddMenu");
const addBtnBottom = document.getElementById("addBtnBottom");
const API = "http://localhost:5000/api";
const currentUser = localStorage.getItem("userId");
const token = localStorage.getItem("token");
const authHeaderValue = token
  ? token.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`
  : "";
const authHeaders = authHeaderValue ? { Authorization: authHeaderValue } : {};
const blankAvatar = "images/img1.jpg";

if (!token || !currentUser) {
  window.location.href = "login.html";
}

let friends = [];

function initAddMenu() {
  if (!addMenu || !addBtnBottom) return;

  const openMenu = () => addMenu.classList.remove("hidden");
  const closeMenu = () => addMenu.classList.add("hidden");

  addBtnBottom.addEventListener("click", (event) => {
    event.preventDefault();
    openMenu();
  });

  if (closeAddMenu) {
    closeAddMenu.addEventListener("click", closeMenu);
  }
  addMenu.addEventListener("click", (event) => {
    if (event.target === addMenu) closeMenu();
  });

  if (addStory) {
    addStory.addEventListener("click", () => {
      closeMenu();
      storyInput?.click();
    });
  }
  if (addPost) {
    addPost.addEventListener("click", () => {
      closeMenu();
      postInput?.click();
    });
  }
}

function getRecentKey() {
  return `recent_searches_${currentUser}`;
}

function loadRecent() {
  const raw = localStorage.getItem(getRecentKey());
  return raw ? JSON.parse(raw) : [];
}

function saveRecent(list) {
  localStorage.setItem(getRecentKey(), JSON.stringify(list));
}

initAddMenu();

storyInput.addEventListener("change", () => {
  if (!storyInput.files[0] || !currentUser) return;
  const file = storyInput.files[0];
  const fd = new FormData();
  fd.append("image", file);

  fetch(`${API}/stories`, {
    method: "POST",
    headers: authHeaders,
    body: fd,
  }).catch(() => {
    showToast("Server error while adding story", "error");
  });
  storyInput.value = "";
});

postInput.addEventListener("change", async () => {
  if (!postInput.files[0] || !currentUser) return;
  const file = postInput.files[0];
  const caption = "";

  const fd = new FormData();
  fd.append("image", file);
  fd.append("caption", caption);
  fd.append("userId", currentUser);

  try {
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: authHeaders,
      body: fd,
    });

    if (!res.ok) {
      showToast("Failed to create post", "error");
    }
  } catch (error) {
    showToast("Server error while posting", "error");
  } finally {
    postInput.value = "";
  }
});

function renderFriends(list) {
  friendsList.innerHTML = list
    .map(
      (friend) => `
      <div class="friend">
        <div class="friend-left">
          <img src="${friend.avatar || blankAvatar}" alt="${friend.name}" />
          <div>
            <div class="friend-name">${friend.name}</div>
            <div class="friend-handle">@${friend.handle}</div>
          </div>
        </div>
        <button class="follow-btn" data-id="${friend.id}">Follow</button>
      </div>
    `,
    )
    .join("");

  friendsList.querySelectorAll(".friend").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.classList.contains("follow-btn")) return;
      const name = row.querySelector(".friend-name")?.textContent || "";
      const handle = row.querySelector(".friend-handle")?.textContent || "";
      const avatar = row.querySelector("img")?.src || "";
      const id = row.querySelector(".follow-btn")?.dataset?.id || name;

      const recent = loadRecent();
      const exists = recent.find((item) => item.id === id);
      if (!exists) {
        recent.unshift({ id, name, handle, avatar });
        saveRecent(recent.slice(0, 10));
      }
      renderRecent();
      window.location.href = `user-profile.html?userId=${encodeURIComponent(id)}`;
    });
  });

  friendsList.querySelectorAll(".follow-btn").forEach((btn) => {
    btn.addEventListener("click", async (event) => {
      event.stopPropagation();
      const id = btn.dataset.id;
      btn.disabled = true;
      try {
        const res = await fetch(`${API}/follow/request`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ toUserId: id }),
        });
        const data = await res.json();
        btn.textContent =
          data.status === "following" ? "Following" : "Requested";
      } catch (error) {
        btn.textContent = "Follow";
      } finally {
        btn.disabled = false;
      }
    });
  });

  friendsList.querySelectorAll(".follow-btn").forEach(async (btn) => {
    const id = btn.dataset.id;
    try {
      const res = await fetch(`${API}/follow/status/${id}`, {
        headers: authHeaders,
      });
      const status = await res.json();
      if (status.following) {
        btn.textContent = "Following";
      } else if (status.requested) {
        btn.textContent = "Requested";
      }
    } catch {}
  });
}

function renderRecent() {
  const recent = loadRecent();
  if (!recent.length) {
    recentList.innerHTML =
      "<div class='friend'><div class='friend-name'>No recent searches</div></div>";
    return;
  }

  recentList.innerHTML = recent
    .map(
      (item) => `
      <div class="friend">
        <div class="friend-left">
          <img src="${item.avatar || blankAvatar}" alt="${item.name}" />
          <div>
            <div class="friend-name">${item.name}</div>
            <div class="friend-handle">${item.handle}</div>
          </div>
        </div>
        <button class="recent-remove" data-id="${item.id}">✕</button>
      </div>
    `,
    )
    .join("");

  recentList.querySelectorAll(".friend").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.classList.contains("recent-remove")) return;
      const id = row.querySelector(".recent-remove")?.dataset?.id;
      if (!id) return;
      window.location.href = `user-profile.html?userId=${encodeURIComponent(id)}`;
    });
  });

  recentList.querySelectorAll(".recent-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const updated = loadRecent().filter((item) => item.id !== id);
      saveRecent(updated);
      renderRecent();
    });
  });
}

function filterFriends() {
  const q = friendSearch.value.trim().toLowerCase();
  if (!q) {
    friendsList.classList.add("hidden");
    recentList.classList.remove("hidden");
    renderRecent();
    return;
  }

  recentList.classList.add("hidden");
  friendsList.classList.remove("hidden");
  searchFriends(q);
}

async function searchFriends(query) {
  try {
    const res = await fetch(
      `${API}/users/search?q=${encodeURIComponent(query)}`,
      {
        headers: authHeaders,
      },
    );
    if (!res.ok) throw new Error("Search failed");
    friends = await res.json();
    renderFriends(Array.isArray(friends) ? friends : []);
  } catch (error) {
    renderFriends([]);
  }
}

friendSearch.addEventListener("input", filterFriends);
clearRecent.addEventListener("click", () => {
  saveRecent([]);
  renderRecent();
});

renderRecent();
