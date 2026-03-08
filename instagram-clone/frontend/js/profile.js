const API = "http://localhost:5000/api";

const profileHandle = document.getElementById("profileHandle");
const profileName = document.getElementById("profileName");
const profileTag = document.getElementById("profileTag");
const profileAvatar = document.getElementById("profileAvatar");
const postCount = document.getElementById("postCount");
const followerCount = document.getElementById("followerCount");
const followingCount = document.getElementById("followingCount");
const gallery = document.getElementById("gallery");
const storySection = document.getElementById("storySection");
const logoutBtn = document.getElementById("logoutBtn");
const addMenu = document.getElementById("addMenu");
const addStory = document.getElementById("addStory");
const addPost = document.getElementById("addPost");
const closeAddMenu = document.getElementById("closeAddMenu");
const addBtn = document.getElementById("addBtn");
const addBtnBottom = document.getElementById("addBtnBottom");

const storyInput = document.getElementById("storyInput");
const postInput = document.getElementById("postInput");
const profileImageWrapper = document.getElementById("profileImageWrapper");
const storyModal = document.getElementById("storyModal");
const storyModalImage = document.getElementById("storyModalImage");
const closeStoryModal = document.getElementById("closeStoryModal");
const deleteStoryBtn = document.getElementById("deleteStoryBtn");
const storyPrevBtn = document.getElementById("storyPrevBtn");
const storyNextBtn = document.getElementById("storyNextBtn");
const profilePostModal = document.getElementById("profilePostModal");
const closePostModal = document.getElementById("closePostModal");
const profilePostMenuBtn = document.getElementById("profilePostMenuBtn");
const modalPostImage = document.getElementById("modalPostImage");
const modalPostCaption = document.getElementById("modalPostCaption");
const modalUserAvatar = document.getElementById("modalUserAvatar");
const modalUsername = document.getElementById("modalUsername");
const modalLocation = document.getElementById("modalLocation");
const modalMusic = document.getElementById("modalMusic");
const profilePostOptions = document.getElementById("profilePostOptions");
const profileEditCaptionBtn = document.getElementById("profileEditCaptionBtn");
const profileEditLocationBtn = document.getElementById(
  "profileEditLocationBtn",
);
const profileEditMusicBtn = document.getElementById("profileEditMusicBtn");
const profileDeletePostBtn = document.getElementById("profileDeletePostBtn");
const profileCloseOptionsBtn = document.getElementById(
  "profileCloseOptionsBtn",
);
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
const shareProfileBtn = document.getElementById("shareProfileBtn");
const qrModal = document.getElementById("qrModal");
const closeQrModal = document.getElementById("closeQrModal");
const qrName = document.getElementById("qrName");
const qrLink = document.getElementById("qrLink");
const profileQrCanvas = document.getElementById("profileQrCanvas");
let postsCache = [];
let activeModalPostId = null;
let activeStoryId = null;
let activeStoryImage = "";
let activeStoryList = [];
let activeStoryIndex = 0;
let draftFile = null;
let draftPreviewUrl = null;

const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("userId");
const profileKey = (key) => `${key}_${currentUser}`;
const authHeaderValue = token
  ? token.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`
  : "";
const authHeaders = authHeaderValue ? { Authorization: authHeaderValue } : {};
const migrateProfileKey = (key) => {
  const scopedKey = profileKey(key);
  if (!localStorage.getItem(scopedKey)) {
    const legacyValue = localStorage.getItem(key);
    if (legacyValue !== null) {
      localStorage.setItem(scopedKey, legacyValue);
      localStorage.removeItem(key);
    }
  }
};
["profileName", "profileUsername", "profileBio", "profileAvatar"].forEach(
  migrateProfileKey,
);
const storedName = localStorage.getItem(profileKey("profileName"));
const storedUsername = localStorage.getItem(profileKey("profileUsername"));
const storedBio = localStorage.getItem(profileKey("profileBio"));
const storedAvatar = localStorage.getItem(profileKey("profileAvatar"));
const blankAvatar = "images/img1.jpg";
const viewedStoriesKey = currentUser ? `viewed_stories_${currentUser}` : "";

function initAddMenu({ triggerIds = [] } = {}) {
  if (!addMenu) return;
  const triggers = triggerIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const openAddMenu = () => addMenu.classList.remove("hidden");
  const closeAddMenuModal = () => addMenu.classList.add("hidden");

  triggers.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openAddMenu();
    });
  });

  if (closeAddMenu) {
    closeAddMenu.addEventListener("click", closeAddMenuModal);
  }
  addMenu.addEventListener("click", (event) => {
    if (event.target === addMenu) closeAddMenuModal();
  });

  if (addStory && storyInput) {
    addStory.addEventListener("click", () => {
      closeAddMenuModal();
      storyInput.click();
    });
  }
  if (addPost && postInput) {
    addPost.addEventListener("click", () => {
      closeAddMenuModal();
      postInput.click();
    });
  }
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

if (!token || !currentUser) {
  window.location.href = "login.html";
}

const fallbackUsername = `user_${currentUser.slice(0, 6)}`;
const username = storedUsername || fallbackUsername;
const name = storedName || `User ${currentUser.slice(0, 6)}`;

profileHandle.textContent = `@${username}`;
profileName.textContent = name;
profileTag.textContent = `@${username}`;
profileAvatar.src = storedAvatar || blankAvatar;
profileAvatar.style.display = "block";
if (storedAvatar) {
  profileImageWrapper.classList.remove("empty");
} else {
  profileImageWrapper.classList.add("empty");
}

const bioText = document.querySelector(".bio-text");
if (bioText) {
  bioText.textContent = storedBio || "";
}

async function syncProfileToServer() {
  if (!token) return;
  if (!storedName && !storedUsername && !storedBio && !storedAvatar) return;
  try {
    await fetch(`${API}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        name: storedName || name,
        avatar: storedAvatar || "",
        bio: storedBio || "",
      }),
    });
  } catch {}
}

followerCount.textContent = "0";
followingCount.textContent = "0";

async function loadCounts() {
  try {
    const res = await fetch(`${API}/users/me`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Failed to load counts");
    const data = await res.json();
    followerCount.textContent = String(data.followers || 0);
    followingCount.textContent = String(data.following || 0);
  } catch {
    followerCount.textContent = "0";
    followingCount.textContent = "0";
  }
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

function buildProfileLink() {
  const base =
    window.location.origin && window.location.origin !== "null"
      ? window.location.origin
      : window.location.href.replace(/profile\.html.*$/i, "");
  return `${base}user-profile.html?userId=${currentUser}`;
}

function openQrModal() {
  if (!qrModal || !profileQrCanvas) return;
  const link = buildProfileLink();
  qrName.textContent = storedUsername ? `@${storedUsername}` : "";
  qrLink.textContent = link;
  qrModal.style.display = "flex";
  qrModal.classList.remove("hidden");
  if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
    window.QRCode.toCanvas(profileQrCanvas, link, { width: 220 }, () => {});
  }
}

function closeQr() {
  if (!qrModal) return;
  qrModal.classList.add("hidden");
  qrModal.style.display = "none";
}

function renderConnections(list, type) {
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
          <button class="connection-action" data-id="${u.id}" data-type="${type}">
            ${type === "followers" ? "Remove" : "Unfollow"}
          </button>
        </div>
      `,
    )
    .join("");

  connectionsList.querySelectorAll(".connection-action").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const actionType = btn.dataset.type;
      const url =
        actionType === "followers"
          ? `${API}/follow/remove-follower`
          : `${API}/follow/unfollow`;
      try {
        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders,
          },
          body: JSON.stringify({ userId: id }),
        });
        await loadCounts();
        await loadConnections(actionType);
      } catch {
        showToast("Unable to delete story", "error");
      }
    });
  });

  connectionsList.querySelectorAll(".connection-item").forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest(".connection-action")) return;
      const userId = row.dataset.userId;
      if (!userId) return;
      window.location.href = `user-profile.html?userId=${userId}`;
    });
  });
}

async function loadConnections(type) {
  try {
    const res = await fetch(`${API}/users/${currentUser}/${type}`, {
      headers: authHeaders,
    });
    const list = await res.json();
    renderConnections(list, type);
  } catch {
    renderConnections([], type);
  }
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

function openPostModal(post) {
  if (!post) return;
  modalUserAvatar.src = storedAvatar || blankAvatar;
  modalUsername.textContent = storedUsername || username;
  modalLocation.textContent = post.location ? post.location : "";
  modalMusic.textContent = post.music ? `🎵 ${post.music}` : "";
  modalPostImage.src = `http://localhost:5000/uploads/${post.image}`;
  modalPostCaption.textContent = post.caption || "";
  activeModalPostId = post._id;
  profilePostModal.classList.remove("hidden");
  closeProfilePostOptions();
}

function renderActiveStory() {
  if (!storyModal || !activeStoryList.length) return;
  const story = activeStoryList[activeStoryIndex];
  if (!story) return;
  storyModalImage.src = `http://localhost:5000/uploads/${story.image}`;
  deleteStoryBtn.style.display = activeStoryImage ? "block" : "none";

  const viewed = loadViewedStories();
  viewed.add(String(story._id));
  saveViewedStories(viewed);

  const allViewed = activeStoryList.every((s) => viewed.has(String(s._id)));
  if (allViewed) {
    profileImageWrapper.classList.remove("has-story");
    profileImageWrapper.classList.add("viewed-story");
  }

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
  deleteStoryBtn.style.display = "block";
  activeStoryList = [];
  activeStoryIndex = 0;
}

function closePostModalView() {
  profilePostModal.classList.add("hidden");
  activeModalPostId = null;
  closeProfilePostOptions();
}

function setPostOptionsPosition() {
  if (!profilePostMenuBtn || !profilePostOptions || !profilePostModal) return;
  const menuButtonRect = profilePostMenuBtn.getBoundingClientRect();
  const modalRect = profilePostModal
    .querySelector(".post-modal-card")
    ?.getBoundingClientRect();
  if (!modalRect) return;

  const top = Math.max(menuButtonRect.bottom - modalRect.top + 8, 44);
  const right = Math.max(modalRect.right - menuButtonRect.right + 8, 16);

  profilePostOptions.style.top = `${top}px`;
  profilePostOptions.style.right = `${right}px`;
}

function openProfilePostOptions() {
  if (!profilePostOptions) return;
  setPostOptionsPosition();
  profilePostOptions.classList.add("open");
  profilePostOptions.classList.remove("hidden");
  profilePostOptions.setAttribute("aria-hidden", "false");
}

function closeProfilePostOptions() {
  if (!profilePostOptions) return;
  profilePostOptions.classList.remove("open");
  profilePostOptions.classList.add("hidden");
  profilePostOptions.setAttribute("aria-hidden", "true");
}

initAddMenu({ triggerIds: ["addBtn", "addBtnBottom"] });
profilePostModal.addEventListener("click", (event) => {
  if (event.target === profilePostModal) closePostModalView();
});
if (closePostModal) {
  closePostModal.addEventListener("click", closePostModalView);
}
if (profilePostMenuBtn) {
  profilePostMenuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (profilePostOptions?.classList.contains("open")) {
      closeProfilePostOptions();
    } else {
      openProfilePostOptions();
    }
  });
}
if (profileCloseOptionsBtn) {
  profileCloseOptionsBtn.addEventListener("click", closeProfilePostOptions);
}
document.addEventListener("click", (event) => {
  if (!profilePostOptions?.classList.contains("open")) return;
  if (event.target.closest("#profilePostOptions")) return;
  if (event.target.closest("#profilePostMenuBtn")) return;
  closeProfilePostOptions();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closePostModalView();
    closeProfilePostOptions();
  }
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
if (shareProfileBtn) {
  shareProfileBtn.addEventListener("click", openQrModal);
}
if (closeQrModal) {
  closeQrModal.addEventListener("click", closeQr);
}
if (qrModal) {
  qrModal.addEventListener("click", (event) => {
    if (event.target === qrModal) closeQr();
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
  closeProfilePostOptions();
  if (profilePostModal) profilePostModal.classList.add("hidden");
  closeStoryModalView();
  postInput.value = "";
  loadCounts();
  loadPosts();
  syncProfileToServer();
});

if (storyModal) {
  storyModal.addEventListener("click", (event) => {
    if (event.target === storyModal) closeStoryModalView();
  });
}
if (closeStoryModal) {
  closeStoryModal.addEventListener("click", closeStoryModalView);
}
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
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeStoryModalView();
    closeProfilePostOptions();
  }
});
if (profileAvatar) {
  profileAvatar.addEventListener("click", () => {
    if (!activeStoryList.length) return;
    openStoryModal();
  });
}

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "login.html";
});

storyInput.addEventListener("change", async () => {
  if (!storyInput.files[0]) return;
  const file = storyInput.files[0];
  const fd = new FormData();
  fd.append("image", file);

  try {
    const res = await fetch(`${API}/stories`, {
      method: "POST",
      headers: authHeaders,
      body: fd,
    });

    if (res.ok) {
      await loadStories();
      showToast("Story added", "success");
    } else {
      showToast("Failed to add story", "error");
    }
  } catch (error) {
    showToast("Server error while adding story", "error");
  }
  storyInput.value = "";
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
    if (!draftFile) {
      if (typeof showToast === "function") {
        showToast("Please select an image", "error");
      }
      return;
    }

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
    } catch (error) {
      if (typeof showToast === "function") {
        showToast("Server error while posting", "error");
      }
    }
  });
}

async function loadStories() {
  const res = await fetch(`${API}/stories`, {
    headers: authHeaders,
  });
  const stories = await res.json();

  const myStories = Array.isArray(stories)
    ? stories.filter((s) => s.userId === currentUser)
    : [];
  const sorted = myStories.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const latest = sorted[sorted.length - 1];
  activeStoryList = sorted;
  activeStoryIndex = Math.max(sorted.length - 1, 0);
  activeStoryId = latest?._id || null;
  activeStoryImage = latest?.image
    ? `http://localhost:5000/uploads/${latest.image}`
    : "";
  const myThumb = activeStoryImage || null;
  if (activeStoryImage) {
    const viewed = loadViewedStories();
    const allViewed = sorted.every((s) => viewed.has(String(s._id)));
    if (allViewed) {
      profileImageWrapper.classList.remove("has-story");
      profileImageWrapper.classList.add("viewed-story");
    } else {
      profileImageWrapper.classList.add("has-story");
      profileImageWrapper.classList.remove("viewed-story");
    }
  } else {
    profileImageWrapper.classList.remove("has-story");
    profileImageWrapper.classList.remove("viewed-story");
  }

  storySection.innerHTML = `
    <div class="story">
      <div class="story-img add-story" id="addStoryBtn">
        ${myThumb ? `<img src="${myThumb}" alt="story" />` : "+"}
      </div>
      <div class="story-name">New</div>
    </div>
  `;

  const addStoryButton = document.getElementById("addStoryBtn");
  addStoryButton.addEventListener("click", () => storyInput.click());
}

deleteStoryBtn.addEventListener("click", async () => {
  if (!activeStoryId) return;
  try {
    const res = await fetch(`${API}/stories/${activeStoryId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) {
      storyModal.classList.add("hidden");
      storyModalImage.src = "";
      activeStoryId = null;
      activeStoryImage = "";
      await loadStories();
      showToast("Story deleted", "success");
    } else {
      showToast("Unable to delete story", "error");
    }
  } catch {
    showToast("Unable to delete story", "error");
  }
});

async function loadPosts() {
  try {
    const res = await fetch(`${API}/posts/user/${currentUser}`, {
      headers: authHeaders,
    });
    if (!res.ok) throw new Error("Failed to load posts");
    const posts = await res.json();
    const userPosts = Array.isArray(posts) ? posts : [];

    postsCache = userPosts;

    postCount.textContent = String(userPosts.length);

    gallery.innerHTML = userPosts
      .map(
        (post) => `
          <div class="post-thumb" data-id="${post._id}">
            <img src="http://localhost:5000/uploads/${post.image}" alt="post" />
            <button class="post-view-btn" type="button" data-id="${post._id}">
              View
            </button>
          </div>
        `,
      )
      .join("");

    gallery.querySelectorAll(".post-view-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const post = postsCache.find((p) => p._id === btn.dataset.id);
        openPostModal(post);
      });
    });
  } catch (error) {
    gallery.innerHTML = "";
    postCount.textContent = "0";
  }
}

profileEditCaptionBtn.addEventListener("click", async () => {
  const postId = activeModalPostId;
  if (!postId) return;
  const current = postsCache.find((p) => p._id === postId);
  const nextCaption = prompt("Edit caption", current?.caption || "");
  if (nextCaption === null) return;

  try {
    const res = await fetch(`${API}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ caption: nextCaption }),
    });
    if (res.ok) {
      closeProfilePostOptions();
      await loadPosts();
      showToast("Caption updated", "success");
    } else {
      showToast("Unable to update caption", "error");
    }
  } catch (error) {
    showToast("Unable to update caption", "error");
  }
});

profileEditLocationBtn.addEventListener("click", async () => {
  const postId = activeModalPostId;
  if (!postId) return;
  const current = postsCache.find((p) => p._id === postId);
  const nextLocation = prompt("Edit location", current?.location || "");
  if (nextLocation === null) return;

  try {
    const res = await fetch(`${API}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ location: nextLocation }),
    });
    if (res.ok) {
      closeProfilePostOptions();
      await loadPosts();
      showToast("Location updated", "success");
    } else {
      showToast("Unable to update location", "error");
    }
  } catch (error) {
    showToast("Unable to update location", "error");
  }
});

profileEditMusicBtn.addEventListener("click", async () => {
  const postId = activeModalPostId;
  if (!postId) return;
  const current = postsCache.find((p) => p._id === postId);
  const nextMusic = prompt("Add music", current?.music || "");
  if (nextMusic === null) return;

  try {
    const res = await fetch(`${API}/posts/${postId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ music: nextMusic }),
    });
    if (res.ok) {
      closeProfilePostOptions();
      await loadPosts();
      showToast("Music updated", "success");
    } else {
      showToast("Unable to update music", "error");
    }
  } catch (error) {
    showToast("Unable to update music", "error");
  }
});

profileDeletePostBtn.addEventListener("click", async () => {
  const postId = activeModalPostId;
  if (!postId) return;

  try {
    const res = await fetch(`${API}/posts/${postId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) {
      closeProfilePostOptions();
      closePostModalView();
      await loadPosts();
      showToast("Post deleted", "success");
    } else {
      showToast("Unable to delete post", "error");
    }
  } catch (error) {
    showToast("Unable to delete post", "error");
  }
});

loadStories();
loadPosts();
loadCounts();
