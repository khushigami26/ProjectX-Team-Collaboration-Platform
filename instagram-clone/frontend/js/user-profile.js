const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("userId");
const authHeaders = token ? { Authorization: token } : {};

const profileHandle = document.getElementById("profileHandle");
const profileAvatar = document.getElementById("profileAvatar");
const profileImageWrapper = document.querySelector(".profile-img-wrapper");
const profileName = document.getElementById("profileName");
const profileBio = document.getElementById("profileBio");
const postCount = document.getElementById("postCount");
const followerCount = document.getElementById("followerCount");
const followingCount = document.getElementById("followingCount");
const postGrid = document.getElementById("postGrid");
const followBtn = document.getElementById("followBtn");
const highlights = document.getElementById("highlights");
const storyModal = document.getElementById("storyModal");
const storyModalImage = document.getElementById("storyModalImage");
const storyPrevBtn = document.getElementById("storyPrevBtn");
const storyNextBtn = document.getElementById("storyNextBtn");
const messageBtn = document.getElementById("messageBtn");

const addBtnBottom = document.getElementById("addBtnBottom");
const addMenu = document.getElementById("addMenu");
const addStory = document.getElementById("addStory");
const addPost = document.getElementById("addPost");
const closeAddMenu = document.getElementById("closeAddMenu");
const storyInput = document.getElementById("storyInput");
const postInput = document.getElementById("postInput");
const createPostModal = document.getElementById("createPostModal");
const createPostTitle = document.getElementById("createPostTitle");
const createPreview = document.getElementById("createPreview");
const createUserAvatar = document.getElementById("createUserAvatar");
const createUsername = document.getElementById("createUsername");
const createCaption = document.getElementById("createCaption");
const createLocation = document.getElementById("createLocation");
const createMusic = document.getElementById("createMusic");
const closeCreatePost = document.getElementById("closeCreatePost");
const sharePostBtn = document.getElementById("sharePostBtn");
const connectionsModal = document.getElementById("connectionsModal");
const connectionsTitle = document.getElementById("connectionsTitle");
const connectionsList = document.getElementById("connectionsList");
const closeConnections = document.getElementById("closeConnections");

const profileKey = (key) => `${key}_${currentUser}`;
const storedUsername = localStorage.getItem(profileKey("profileUsername"));
const storedAvatar = localStorage.getItem(profileKey("profileAvatar"));
const blankAvatar = "images/img1.jpg";
const viewedStoriesKey = currentUser ? `viewed_stories_${currentUser}` : "";
let activeStoryId = null;
let activeStoryImage = "";
let activeStoryList = [];
let activeStoryIndex = 0;
let draftFile = null;
let draftPreviewUrl = null;

if (!token || !currentUser) {
  window.location.href = "login.html";
}

const params = new URLSearchParams(window.location.search);
const userId = params.get("userId");

if (!userId) {
  window.location.href = "search.html";
}

if (userId && String(userId) === String(currentUser)) {
  window.location.href = "profile.html";
}

function openMenu() {
  addMenu.classList.remove("hidden");
}

function closeMenu() {
  addMenu.classList.add("hidden");
}

function openCreateModal({ imageSrc }) {
  if (!createPostModal) return;
  createPostTitle.textContent = "Create new post";
  sharePostBtn.textContent = "Share";
  createPreview.src = imageSrc || "";
  createUserAvatar.src = storedAvatar || blankAvatar;
  createUsername.textContent = storedUsername || "";
  createCaption.value = "";
  createLocation.value = "";
  createMusic.value = "";
  createPostModal.style.display = "block";
  createPostModal.classList.remove("hidden");
}

function closeCreateModal() {
  if (!createPostModal) return;
  createPostModal.classList.add("hidden");
  createPostModal.style.display = "none";
  createPreview.src = "";
  if (draftPreviewUrl) {
    URL.revokeObjectURL(draftPreviewUrl);
    draftPreviewUrl = null;
  }
  createCaption.value = "";
  createLocation.value = "";
  createMusic.value = "";
  draftFile = null;
}

function openConnectionsModal(title) {
  if (!connectionsModal) return;
  connectionsTitle.textContent = title;
  connectionsModal.style.display = "flex";
  connectionsModal.classList.remove("hidden");
}

function closeConnectionsModal() {
  if (!connectionsModal) return;
  connectionsModal.classList.add("hidden");
  connectionsModal.style.display = "none";
  connectionsList.innerHTML = "";
}

function loadViewedStories() {
  if (!viewedStoriesKey) return new Set();
  try {
    const raw = localStorage.getItem(viewedStoriesKey);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function saveViewedStories(set) {
  if (!viewedStoriesKey) return;
  localStorage.setItem(viewedStoriesKey, JSON.stringify(Array.from(set)));
}

function updateStoryHighlightState({ hasStory, viewed }) {
  if (!profileImageWrapper) return;
  if (hasStory && !viewed) {
    profileImageWrapper.classList.add("has-story");
    profileImageWrapper.classList.remove("viewed-story");
  } else if (hasStory && viewed) {
    profileImageWrapper.classList.remove("has-story");
    profileImageWrapper.classList.add("viewed-story");
  } else {
    profileImageWrapper.classList.remove("has-story");
    profileImageWrapper.classList.remove("viewed-story");
  }
}

function renderActiveStory() {
  if (!storyModal || !activeStoryList.length) return;
  const story = activeStoryList[activeStoryIndex];
  if (!story) return;
  storyModalImage.src = `http://localhost:5000/uploads/${story.image}`;

  const viewed = loadViewedStories();
  viewed.add(String(story._id));
  saveViewedStories(viewed);

  const allViewed = activeStoryList.every((s) => viewed.has(String(s._id)));
  updateStoryHighlightState({ hasStory: true, viewed: allViewed });

  if (storyPrevBtn)
    storyPrevBtn.classList.toggle("hidden", activeStoryIndex <= 0);
  if (storyNextBtn) {
    storyNextBtn.classList.toggle(
      "hidden",
      activeStoryIndex >= activeStoryList.length - 1,
    );
  }
}

function openStoryModal() {
  if (!storyModal || !activeStoryList.length) return;
  renderActiveStory();
  storyModal.classList.remove("hidden");
}

function closeStoryModalView() {
  if (!storyModal) return;
  storyModal.classList.add("hidden");
  storyModalImage.src = "";
  activeStoryIndex = 0;
}

function renderConnections(list) {
  if (!Array.isArray(list) || list.length === 0) {
    connectionsList.innerHTML =
      '<div class="connections-empty">No users yet</div>';
    return;
  }
  connectionsList.innerHTML = list
    .map(
      (u) => `
        <div class="connection-item" data-user-id="${u.id}">
          <img src="${u.avatar || blankAvatar}" alt="user" />
          <div>
            <div class="connection-name">${u.name || ""}</div>
            <div class="connection-handle">@${u.handle || u.name || ""}</div>
          </div>
        </div>
      `,
    )
    .join("");

  connectionsList.querySelectorAll(".connection-item").forEach((row) => {
    row.addEventListener("click", () => {
      const targetId = row.dataset.userId;
      if (!targetId) return;
      window.location.href = `user-profile.html?userId=${targetId}`;
    });
  });
}

async function loadConnections(type) {
  try {
    const res = await fetch(`${API}/users/${userId}/${type}`, {
      headers: authHeaders,
    });
    const list = await res.json();
    renderConnections(list);
  } catch {
    renderConnections([]);
  }
}

addBtnBottom.addEventListener("click", openMenu);
addMenu.addEventListener("click", (event) => {
  if (event.target === addMenu) closeMenu();
});
closeAddMenu.addEventListener("click", closeMenu);
addStory.addEventListener("click", () => {
  closeMenu();
  storyInput.click();
});
addPost.addEventListener("click", () => {
  closeMenu();
  postInput.click();
});
if (closeCreatePost) {
  closeCreatePost.addEventListener("click", closeCreateModal);
}
if (createPostModal) {
  createPostModal.addEventListener("click", (event) => {
    if (event.target === createPostModal) closeCreateModal();
  });
}
if (closeConnections) {
  closeConnections.addEventListener("click", closeConnectionsModal);
}
if (connectionsModal) {
  connectionsModal.addEventListener("click", (event) => {
    if (event.target === connectionsModal) closeConnectionsModal();
  });
}
const followerStat = followerCount ? followerCount.parentElement : null;
const followingStat = followingCount ? followingCount.parentElement : null;

if (followerStat) {
  followerStat.addEventListener("click", () => {
    openConnectionsModal("Followers");
    loadConnections("followers");
  });
}
if (followingStat) {
  followingStat.addEventListener("click", () => {
    openConnectionsModal("Following");
    loadConnections("following");
  });
}
window.addEventListener("pageshow", () => {
  closeCreateModal();
  postInput.value = "";
  loadUser();
  loadPosts();
});

storyModal.addEventListener("click", (event) => {
  if (event.target === storyModal) {
    closeStoryModalView();
  }
});

if (storyPrevBtn) {
  storyPrevBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (activeStoryIndex > 0) {
      activeStoryIndex -= 1;
      renderActiveStory();
    }
  });
}
if (storyNextBtn) {
  storyNextBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (activeStoryIndex < activeStoryList.length - 1) {
      activeStoryIndex += 1;
      renderActiveStory();
    }
  });
}

profileAvatar.addEventListener("click", () => {
  if (!activeStoryList.length) return;
  openStoryModal();
});

storyInput.addEventListener("change", async () => {
  if (!storyInput.files[0]) return;
  const fd = new FormData();
  fd.append("image", storyInput.files[0]);

  try {
    const res = await fetch(`${API}/stories`, {
      method: "POST",
      headers: authHeaders,
      body: fd,
    });
    if (res.ok) {
      await loadStories();
      if (typeof showToast === "function") {
        showToast("Story added", "success");
      }
    } else if (typeof showToast === "function") {
      showToast("Failed to add story", "error");
    }
  } catch {
    if (typeof showToast === "function") {
      showToast("Server error while adding story", "error");
    }
  } finally {
    storyInput.value = "";
  }
});

postInput.addEventListener("change", async () => {
  if (!postInput.files[0]) return;
  draftFile = postInput.files[0];
  if (draftPreviewUrl) {
    URL.revokeObjectURL(draftPreviewUrl);
  }
  draftPreviewUrl = URL.createObjectURL(draftFile);
  openCreateModal({ imageSrc: draftPreviewUrl });
  postInput.value = "";
});

postInput.addEventListener("click", () => {
  postInput.value = "";
});

if (sharePostBtn) {
  sharePostBtn.addEventListener("click", async () => {
    if (!draftFile) return;

    const fd = new FormData();
    fd.append("image", draftFile);
    fd.append("caption", createCaption.value.trim());
    fd.append("location", createLocation.value.trim());
    fd.append("music", createMusic.value.trim());
    fd.append("userId", currentUser);

    try {
      const res = await fetch(`${API}/posts`, {
        method: "POST",
        headers: authHeaders,
        body: fd,
      });
      if (res.ok) {
        closeCreateModal();
        await loadPosts();
        if (typeof showToast === "function") {
          showToast("Post added successfully", "success");
        }
      } else if (typeof showToast === "function") {
        showToast("Failed to create post", "error");
      }
    } catch {
      if (typeof showToast === "function") {
        showToast("Server error while posting", "error");
      }
    }
  });
}

async function loadUser() {
  try {
    const res = await fetch(`${API}/users/${userId}`, { headers: authHeaders });
    if (!res.ok) throw new Error();
    const data = await res.json();
    profileHandle.textContent = data.handle || data.name || "user";
    profileName.textContent = data.name || "User";
    profileAvatar.src = data.avatar || blankAvatar;
    followerCount.textContent = String(data.followers || 0);
    followingCount.textContent = String(data.following || 0);
    profileBio.textContent = data.bio || "";
  } catch {
    // ignore
  }
}

async function loadStories() {
  try {
    const res = await fetch(`${API}/stories`, { headers: authHeaders });
    const items = await res.json();
    const list = Array.isArray(items)
      ? items.filter((s) => String(s.userId) === String(userId))
      : [];
    const sorted = list.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const latest = sorted[sorted.length - 1];
    activeStoryList = sorted;
    activeStoryIndex = Math.max(sorted.length - 1, 0);
    activeStoryId = latest?._id || null;
    activeStoryImage = latest?.image
      ? `http://localhost:5000/uploads/${latest.image}`
      : "";
    const viewed = loadViewedStories();
    const allViewed = sorted.length
      ? sorted.every((s) => viewed.has(String(s._id)))
      : false;
    updateStoryHighlightState({
      hasStory: Boolean(activeStoryImage),
      viewed: Boolean(allViewed),
    });
  } catch {
    activeStoryImage = "";
    activeStoryId = null;
    updateStoryHighlightState({ hasStory: false, viewed: false });
  }
}

async function loadHighlights() {
  try {
    const res = await fetch(`${API}/stories/highlights/${userId}`, {
      headers: authHeaders,
    });
    const items = await res.json();
    const list = Array.isArray(items) ? items : [];
    if (!list.length) return;
    highlights.innerHTML = list
      .slice(0, 8)
      .map(
        (story, index) => `
        <div class="highlight-item">
          <div class="highlight-circle" style="background-image:url('http://localhost:5000/uploads/${story.image}'); background-size: cover;"></div>
          Highlight ${index + 1}
        </div>
      `,
      )
      .join("");
  } catch {
    // ignore
  }
}

async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts/user/${userId}`, {
      headers: authHeaders,
    });
    const posts = await res.json();
    const list = Array.isArray(posts) ? posts : [];
    postCount.textContent = String(list.length);
    postGrid.innerHTML = list
      .map(
        (post) =>
          `<img src="http://localhost:5000/uploads/${post.image}" alt="post" />`,
      )
      .join("");
  } catch {
    postGrid.innerHTML = "";
  }
}

async function updateFollowState() {
  try {
    const res = await fetch(`${API}/follow/status/${userId}`, {
      headers: authHeaders,
    });
    const status = await res.json();
    if (status.following) {
      followBtn.textContent = "Following";
      followBtn.classList.add("following");
      followBtn.disabled = false;
      followBtn.dataset.state = "following";
    } else if (status.requested) {
      followBtn.textContent = "Requested";
      followBtn.classList.add("following");
      followBtn.disabled = true;
      followBtn.dataset.state = "requested";
    } else {
      followBtn.textContent = "Follow";
      followBtn.classList.remove("following");
      followBtn.disabled = false;
      followBtn.dataset.state = "follow";
    }
  } catch {
    followBtn.textContent = "Follow";
    followBtn.classList.remove("following");
    followBtn.disabled = false;
    followBtn.dataset.state = "follow";
  }
}

followBtn.addEventListener("click", async () => {
  try {
    const state = followBtn.dataset.state;
    const url =
      state === "following"
        ? `${API}/follow/unfollow`
        : `${API}/follow/request`;
    const body = state === "following" ? { userId } : { toUserId: userId };

    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(body),
    });
    await updateFollowState();
    await loadUser();
  } catch {
    // ignore
  }
});

messageBtn.addEventListener("click", () => {
  localStorage.setItem("openChatUserId", userId);
  window.location.href = "messages.html";
});

loadUser();
loadPosts();
updateFollowState();
loadStories();
loadHighlights();
