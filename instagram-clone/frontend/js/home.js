const API = "http://localhost:5000/api";
const postFeed = document.getElementById("postFeed");
const storySection = document.getElementById("storySection");
const addStoryBtn = document.getElementById("addStoryBtn");
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
const captionCount = document.getElementById("captionCount");
const closeCreatePost = document.getElementById("closeCreatePost");
const sharePostBtn = document.getElementById("sharePostBtn");
const notificationsBtn = document.getElementById("notificationsBtn");
const notificationsBadge = document.getElementById("notificationsBadge");
const postOptions = document.getElementById("postOptions");
const editCaptionBtn = document.getElementById("editCaptionBtn");
const editLocationBtn = document.getElementById("editLocationBtn");
const editMusicBtn = document.getElementById("editMusicBtn");
const toggleLikesBtn = document.getElementById("toggleLikesBtn");
const deletePostBtn = document.getElementById("deletePostBtn");
const closePostOptions = document.getElementById("closePostOptions");
const commentsModal = document.getElementById("commentsModal");
const closeComments = document.getElementById("closeComments");
const commentList = document.getElementById("commentList");
const commentInput = document.getElementById("commentInput");
const commentSend = document.getElementById("commentSend");
const commentUserAvatar = document.getElementById("commentUserAvatar");
const commentEmojiBar = document.getElementById("commentEmojiBar");
const storyModal = document.getElementById("storyModal");
const storyModalImage = document.getElementById("storyModalImage");
const storyModalName = document.getElementById("storyModalName");
const closeStoryModal = document.getElementById("closeStoryModal");
const deleteStoryBtn = document.getElementById("deleteStoryBtn");
const storyPrevBtn = document.getElementById("storyPrevBtn");
const storyNextBtn = document.getElementById("storyNextBtn");
let postsCache = [];
let draftFile = null;
let draftPreviewUrl = null;
let editPostId = null;
const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("userId");
const profileKey = (key) => `${key}_${currentUser}`;
const storedUsername = localStorage.getItem(profileKey("profileUsername"));
const storedAvatar = localStorage.getItem(profileKey("profileAvatar"));
const authHeaderValue = token
  ? token.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`
  : "";
const authHeaders = authHeaderValue ? { Authorization: authHeaderValue } : {};
const blankAvatar = "images/img1.jpg";
let activePostId = null;
let activeCommentPostId = null;
let storiesCache = [];
let myStoryId = null;
let myStoryImage = "";
let activeStoryList = [];
let activeStoryIndex = 0;
const viewedStoriesKey = currentUser ? `viewed_stories_${currentUser}` : "";

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

function openMenu() {
  addMenu.classList.remove("hidden");
}

function closeMenu() {
  addMenu.classList.add("hidden");
}

function openCreateModal({
  mode,
  imageSrc,
  caption = "",
  location = "",
  music = "",
}) {
  createPostTitle.textContent =
    mode === "edit" ? "Edit post" : "Create new post";
  sharePostBtn.textContent = mode === "edit" ? "Save" : "Share";
  createPreview.src = imageSrc || "";
  createUserAvatar.src = storedAvatar || blankAvatar;
  createUsername.textContent = storedUsername || "";
  createCaption.value = caption || "";
  createLocation.value = location || "";
  createMusic.value = music || "";
  if (captionCount) {
    captionCount.textContent = `${createCaption.value.length}/2,200`;
  }
  createPostModal.style.display = "block";
  createPostModal.classList.remove("hidden");
}

function closeCreateModal() {
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
  if (captionCount) {
    captionCount.textContent = "0/2,200";
  }
  draftFile = null;
  editPostId = null;
}

function timeAgo(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function openCommentsModal(postId) {
  if (!commentsModal) return;
  activeCommentPostId = postId;
  commentsModal.style.display = "flex";
  commentsModal.classList.remove("hidden");
  commentUserAvatar.src = storedAvatar || blankAvatar;
  commentInput.value = "";
  loadComments();
}

function closeCommentsModal() {
  if (!commentsModal) return;
  commentsModal.classList.add("hidden");
  commentsModal.style.display = "none";
  commentList.innerHTML = "";
  commentInput.value = "";
  activeCommentPostId = null;
}

function getStoryListByUser(userId) {
  const list = storiesCache.filter((s) => String(s.userId) === String(userId));
  return list.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function updateStoryCircleViewed(userId) {
  const list = getStoryListByUser(userId);
  if (!list.length) return;
  const viewed = loadViewedStories();
  const allViewed = list.every((s) => viewed.has(String(s._id)));
  const circle = storySection.querySelector(
    `.story[data-user-id="${userId}"] .story-img`,
  );
  if (circle) circle.classList.toggle("viewed", allViewed);
}

function renderActiveStory() {
  if (!activeStoryList.length || !storyModal) return;
  const story = activeStoryList[activeStoryIndex];
  if (!story) return;
  storyModalImage.src = `http://localhost:5000/uploads/${story.image}`;
  storyModalName.textContent = story.userName || "";
  if (deleteStoryBtn) {
    deleteStoryBtn.style.display =
      String(story.userId) === String(currentUser) ? "block" : "none";
  }
  const viewed = loadViewedStories();
  if (story._id) {
    viewed.add(String(story._id));
    saveViewedStories(viewed);
  }
  updateStoryCircleViewed(story.userId);
  const hasPrev = activeStoryIndex > 0;
  const hasNext = activeStoryIndex < activeStoryList.length - 1;
  if (storyPrevBtn) storyPrevBtn.classList.toggle("hidden", !hasPrev);
  if (storyNextBtn) storyNextBtn.classList.toggle("hidden", !hasNext);
}

function openStoryModal(story) {
  if (!storyModal || !story) return;
  activeStoryList = getStoryListByUser(story.userId);
  activeStoryIndex = Math.max(
    0,
    activeStoryList.findIndex((s) => String(s._id) === String(story._id)),
  );
  renderActiveStory();
  storyModal.style.display = "flex";
  storyModal.classList.remove("hidden");
}

async function handleMyStoryClick() {
  let myStory = storiesCache.find(
    (s) => String(s.userId) === String(currentUser),
  );
  if (!myStory) {
    try {
      await loadStories();
      myStory = storiesCache.find(
        (s) => String(s.userId) === String(currentUser),
      );
    } catch {
      // ignore reload errors
    }
  }
  if (myStory) {
    openStoryModal(myStory);
  } else {
    storyInput.click();
  }
}

function closeStoryViewer() {
  if (!storyModal) return;
  storyModal.classList.add("hidden");
  storyModal.style.display = "none";
  storyModalImage.src = "";
  storyModalName.textContent = "";
  activeStoryList = [];
  activeStoryIndex = 0;
  if (deleteStoryBtn) {
    deleteStoryBtn.style.display = "none";
  }
}

function handleStorySectionClick(event) {
  if (!storySection) return;
  const storyCard = event.target.closest(".story");
  if (!storyCard || !storySection.contains(storyCard)) return;

  if (storyCard.dataset.myStory === "true") {
    handleMyStoryClick();
    return;
  }

  const userId = storyCard.dataset.userId;
  if (!userId) return;
  const list = getStoryListByUser(userId);
  if (!list.length) return;
  const story = list[list.length - 1];
  openStoryModal(story);
}

async function loadComments() {
  if (!activeCommentPostId) return;
  try {
    const res = await fetch(`${API}/posts/${activeCommentPostId}/comments`, {
      headers: authHeaders,
    });
    const items = await res.json();
    const list = Array.isArray(items) ? items : [];
    if (!list.length) {
      commentList.innerHTML =
        '<div class="comment-empty">No comments yet</div>';
      return;
    }
    commentList.innerHTML = list
      .map((c) => {
        const avatar = c.userAvatar || blankAvatar;
        const name = c.userName || "user";
        const time = timeAgo(c.createdAt);
        return `
          <div class="comment-item">
            <div class="comment-left">
              <img src="${avatar}" alt="user" />
              <div>
                <div class="comment-text">
                  <strong>${name}</strong> ${c.text || ""}
                </div>
                <div class="comment-meta">
                  <span>${time}</span>
                  <span>Reply</span>
                </div>
              </div>
            </div>
            <div class="comment-like">❤️</div>
          </div>
        `;
      })
      .join("");
  } catch {
    commentList.innerHTML = '<div class="comment-empty">No comments yet</div>';
  }
}

async function submitComment(textOverride) {
  if (!activeCommentPostId) return;
  const text = (textOverride ?? commentInput.value).trim();
  if (!text) return;
  try {
    const res = await fetch(`${API}/posts/${activeCommentPostId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      commentInput.value = "";
      loadComments();
    } else {
      showToast("Failed to add comment", "error");
    }
  } catch {
    showToast("Failed to add comment", "error");
  }
}

window.addEventListener("pageshow", () => {
  closeCreateModal();
  postInput.value = "";
});

async function loadNotifications() {
  try {
    const countRes = await fetch(`${API}/notifications/unread-count`, {
      headers: authHeaders,
    });
    const countData = await countRes.json();
    const count = Number(countData?.count || 0);
    if (count > 0) {
      notificationsBadge.textContent = "";
      notificationsBadge.classList.add("dot");
      notificationsBadge.classList.remove("hidden");
    } else {
      notificationsBadge.classList.add("hidden");
      notificationsBadge.classList.remove("dot");
    }
  } catch {
    notificationsBadge.classList.add("hidden");
    notificationsBadge.classList.remove("dot");
  }
}

function openPostOptions(postId, isOwner, anchorRect) {
  activePostId = postId;
  const current = postsCache.find((p) => p._id === postId);
  const normalize = (value) => {
    if (value === null || value === undefined) return "";
    const text = String(value).trim();
    return text === "undefined" || text === "null" ? "" : text;
  };
  const hasCaption = Boolean(normalize(current?.caption));
  const hasLocation = Boolean(normalize(current?.location));
  const hasMusic = Boolean(normalize(current?.music));
  if (editCaptionBtn) {
    editCaptionBtn.style.display = isOwner ? "block" : "none";
    editCaptionBtn.textContent = hasCaption ? "Edit caption" : "Add caption";
  }
  if (editLocationBtn) {
    editLocationBtn.style.display = isOwner ? "block" : "none";
    editLocationBtn.textContent = hasLocation
      ? "Edit location"
      : "Add location";
  }
  if (editMusicBtn) {
    editMusicBtn.style.display = isOwner ? "block" : "none";
    editMusicBtn.textContent = hasMusic ? "Edit music" : "Add music";
  }
  if (toggleLikesBtn) {
    toggleLikesBtn.style.display = isOwner ? "block" : "none";
    toggleLikesBtn.textContent = current?.hideLikes
      ? "Show like count"
      : "Hide like count";
  }
  if (deletePostBtn) {
    deletePostBtn.style.display = isOwner ? "block" : "none";
  }
  if (anchorRect && postOptions) {
    postOptions.style.top = `${anchorRect.bottom + window.scrollY + 6}px`;
    postOptions.style.left = `${Math.max(12, anchorRect.right - 220 + window.scrollX)}px`;
  }
  postOptions.classList.remove("hidden");
}

function closePostOptionsMenu() {
  postOptions.classList.add("hidden");
  activePostId = null;
}

addBtnBottom.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  if (addMenu.classList.contains("hidden")) {
    openMenu();
  } else {
    closeMenu();
  }
});
addMenu.addEventListener("click", (event) => {
  if (event.target === addMenu) closeMenu();
});
closeAddMenu.addEventListener("click", closeMenu);
closePostOptions.addEventListener("click", closePostOptionsMenu);
postOptions.addEventListener("click", (event) => {
  if (event.target === postOptions) closePostOptionsMenu();
});
document.addEventListener("click", (event) => {
  if (postOptions.classList.contains("hidden")) return;
  if (event.target.closest(".post-options")) return;
  if (event.target.closest(".post-menu-btn")) return;
  closePostOptionsMenu();
});
closeCreatePost.addEventListener("click", closeCreateModal);
createPostModal.addEventListener("click", (event) => {
  if (event.target === createPostModal) closeCreateModal();
});
if (closeComments) {
  closeComments.addEventListener("click", closeCommentsModal);
}
if (commentsModal) {
  commentsModal.addEventListener("click", (event) => {
    if (event.target === commentsModal) closeCommentsModal();
  });
}
if (commentSend) {
  commentSend.addEventListener("click", submitComment);
}
if (commentInput) {
  commentInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitComment();
    }
  });
}
if (commentEmojiBar) {
  commentEmojiBar.addEventListener("click", (event) => {
    const btn = event.target.closest(".emoji-btn");
    if (!btn) return;
    const emoji = btn.dataset.emoji;
    if (!emoji) return;
    submitComment(emoji);
  });
}
if (closeStoryModal) {
  closeStoryModal.addEventListener("click", closeStoryViewer);
}
if (storyModal) {
  storyModal.addEventListener("click", (event) => {
    if (event.target === storyModal) closeStoryViewer();
  });
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
if (deleteStoryBtn) {
  deleteStoryBtn.addEventListener("click", async () => {
    if (!myStoryId) return;
    try {
      const res = await fetch(`${API}/stories/${myStoryId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      if (res.ok) {
        closeStoryViewer();
        await loadStories();
        showToast("Story deleted", "success");
      } else {
        showToast("Unable to delete story", "error");
      }
    } catch {
      showToast("Unable to delete story", "error");
    }
  });
}
addStory.addEventListener("click", () => {
  closeMenu();
  storyInput.click();
});
addPost.addEventListener("click", () => {
  closeMenu();
  postInput.click();
});
if (storySection) {
  storySection.addEventListener("click", handleStorySectionClick);
}

createCaption.addEventListener("input", () => {
  if (captionCount) {
    captionCount.textContent = `${createCaption.value.length}/2,200`;
  }
});

/* LOAD POSTS */
async function loadPosts() {
  const res = await fetch(`${API}/posts`, {
    headers: authHeaders,
  });
  const posts = await res.json();

  postsCache = Array.isArray(posts) ? posts : [];

  if (postsCache.length === 0) {
    postFeed.innerHTML = "";
    postFeed.classList.add("hidden");
    return;
  }

  postFeed.classList.remove("hidden");

  postFeed.innerHTML = postsCache
    .map(
      (post) => `

    <div class="post">

      <div class="post-header">
        <div class="post-user">
          <img class="${!post.userAvatar && !(post.userId === currentUser && storedAvatar) ? "empty" : ""}" src="${post.userAvatar || (post.userId === currentUser ? storedAvatar : "") || blankAvatar}" alt="User avatar" />
          <div class="post-user-meta">
            <div class="username">${post.userName || (post.userId === currentUser ? storedUsername : "") || `user_${post.userId?.slice(0, 6) || "guest"}`}</div>
            ${post.location ? `<div class="post-meta">${post.location}</div>` : ""}
            ${post.music ? `<div class="post-meta">🎵 ${post.music}</div>` : ""}
          </div>
        </div>
        <button class="post-menu-btn" data-id="${post._id}" data-owner="${post.userId === currentUser}">⋮</button>
      </div>

      <img
        class="post-img"
        data-id="${post._id}"
        src="http://localhost:5000/uploads/${post.image}"
        alt="Post"
      />

      <div class="post-actions">

        <div class="post-actions-left">
          <i class="${post.likes?.includes(currentUser) ? "fa-solid" : "fa-regular"} fa-heart like-btn ${post.likes?.includes(currentUser) ? "liked" : ""}" data-id="${post._id}" data-liked="${post.likes?.includes(currentUser) ? "true" : "false"}"></i>
          <i class="fa-regular fa-comment comment-btn" data-id="${post._id}"></i>
          <i class="fa-regular fa-paper-plane"></i>
        </div>

        <i class="fa-regular fa-bookmark"></i>

      </div>

      <div class="post-info">
        <strong>
          ${post.hideLikes ? "Likes hidden" : `<span class="like-count" data-id="${post._id}">${post.likes?.length || 0}</span> likes`}
        </strong>
        <p>${post.caption || ""}</p>
      </div>

    </div>

  `,
    )
    .join("");

  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const wasLiked = btn.dataset.liked === "true";
      try {
        const res = await fetch(`${API}/posts/${id}/like`, {
          method: "POST",
          headers: authHeaders,
        });
        if (!res.ok) throw new Error("Like failed");
        const countEl = document.querySelector(`.like-count[data-id="${id}"]`);
        if (countEl) {
          const current = Number(countEl.textContent || "0");
          countEl.textContent = String(wasLiked ? current - 1 : current + 1);
        }
        btn.dataset.liked = wasLiked ? "false" : "true";
        btn.classList.toggle("liked", !wasLiked);
        btn.classList.toggle("fa-solid", !wasLiked);
        btn.classList.toggle("fa-regular", wasLiked);
      } catch {
        showToast("Unable to like post", "error");
      }
    });
  });

  document.querySelectorAll(".post-menu-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const isOwner = btn.dataset.owner === "true";
      openPostOptions(id, isOwner, btn.getBoundingClientRect());
    });
  });

  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      openCommentsModal(id);
    });
  });
}

editCaptionBtn.addEventListener("click", async () => {
  if (!activePostId) return;
  const current = postsCache.find((p) => p._id === activePostId);
  editPostId = activePostId;
  openCreateModal({
    mode: "edit",
    imageSrc: `http://localhost:5000/uploads/${current?.image}`,
    caption: current?.caption || "",
    location: current?.location || "",
    music: current?.music || "",
  });
  closePostOptionsMenu();
});

editLocationBtn.addEventListener("click", async () => {
  if (!activePostId) return;
  const current = postsCache.find((p) => p._id === activePostId);
  editPostId = activePostId;
  openCreateModal({
    mode: "edit",
    imageSrc: `http://localhost:5000/uploads/${current?.image}`,
    caption: current?.caption || "",
    location: current?.location || "",
    music: current?.music || "",
  });
  closePostOptionsMenu();
});

editMusicBtn.addEventListener("click", async () => {
  if (!activePostId) return;
  const current = postsCache.find((p) => p._id === activePostId);
  editPostId = activePostId;
  openCreateModal({
    mode: "edit",
    imageSrc: `http://localhost:5000/uploads/${current?.image}`,
    caption: current?.caption || "",
    location: current?.location || "",
    music: current?.music || "",
  });
  closePostOptionsMenu();
});

toggleLikesBtn.addEventListener("click", async () => {
  if (!activePostId) return;
  const current = postsCache.find((p) => p._id === activePostId);
  const nextValue = !current?.hideLikes;

  try {
    const res = await fetch(`${API}/posts/${activePostId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ hideLikes: nextValue }),
    });
    if (res.ok) {
      closePostOptionsMenu();
      await loadPosts();
      showToast(
        current?.hideLikes ? "Like count shown" : "Like count hidden",
        "success",
      );
    } else {
      showToast("Unable to update like count setting", "error");
    }
  } catch {
    showToast("Unable to update like count setting", "error");
  }
});

deletePostBtn.addEventListener("click", async () => {
  if (!activePostId) return;
  if (!confirm("Delete this post?")) return;

  try {
    const res = await fetch(`${API}/posts/${activePostId}`, {
      method: "DELETE",
      headers: authHeaders,
    });
    if (res.ok) {
      closePostOptionsMenu();
      await loadPosts();
      showToast("Post deleted", "success");
    } else {
      showToast("Unable to delete post", "error");
    }
  } catch {
    showToast("Unable to delete post", "error");
  }
});

async function loadStories() {
  const res = await fetch(`${API}/stories`, {
    headers: authHeaders,
  });
  const stories = await res.json();

  storiesCache = Array.isArray(stories) ? stories : [];

  const myStories = Array.isArray(stories)
    ? stories.filter((s) => String(s.userId) === String(currentUser))
    : [];
  const otherStories = Array.isArray(stories)
    ? stories.filter((s) => String(s.userId) !== String(currentUser))
    : [];
  const sortByTime = (a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  const mySorted = [...myStories].sort(sortByTime);
  const myLatest = mySorted[mySorted.length - 1];
  const myStoryThumb = myLatest?.image
    ? `http://localhost:5000/uploads/${myLatest.image}`
    : null;
  myStoryId = myLatest?._id || null;
  myStoryImage = myLatest?.image || "";
  const viewed = loadViewedStories();
  const myStoryViewed =
    mySorted.length > 0 && mySorted.every((s) => viewed.has(String(s._id)));

  storySection.innerHTML = `
    <div class="story" data-my-story="true" data-user-id="${currentUser}">
      <div class="story-img add-story ${myStoryViewed ? "viewed" : ""}" id="addStoryBtn">
        ${myStoryThumb ? `<img src="${myStoryThumb}" alt="Your story" />` : "+"}
      </div>
      <div class="story-name">Your story</div>
    </div>
  `;

  const grouped = new Map();
  otherStories.forEach((story) => {
    const key = String(story.userId);
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(story);
  });

  grouped.forEach((list, userId) => {
    const sorted = list.sort(sortByTime);
    const latest = sorted[sorted.length - 1];
    const allViewed = sorted.every((s) => viewed.has(String(s._id)));
    storySection.innerHTML += `
      <div class="story" data-user-id="${userId}">
        <div class="story-img ${allViewed ? "viewed" : ""}">
          <img src="http://localhost:5000/uploads/${latest.image}" alt="story" />
        </div>
        <div class="story-name">${latest.userName || ""}</div>
      </div>
    `;
  });
}

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
  openCreateModal({ mode: "create", imageSrc: draftPreviewUrl });
  postInput.value = "";
});

postInput.addEventListener("click", () => {
  postInput.value = "";
});

sharePostBtn.addEventListener("click", async () => {
  const caption = createCaption.value.trim();
  const location = createLocation.value.trim();
  const music = createMusic.value.trim();

  if (editPostId) {
    try {
      const res = await fetch(`${API}/posts/${editPostId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ caption, location, music }),
      });
      if (res.ok) {
        closeCreateModal();
        await loadPosts();
        showToast("Post updated", "success");
      } else {
        showToast("Unable to update post", "error");
      }
    } catch {
      showToast("Unable to update post", "error");
    }
    return;
  }

  if (!draftFile) {
    showToast("Please select an image", "error");
    return;
  }

  const fd = new FormData();
  fd.append("image", draftFile);
  fd.append("caption", caption);
  fd.append("location", location);
  fd.append("music", music);
  fd.append("userId", currentUser);

  try {
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      headers: authHeaders,
      body: fd,
    });
    if (res.ok) {
      closeCreateModal();
      try {
        await loadPosts();
      } catch {
        // ignore refresh errors
      }
      showToast("Post added successfully", "success");
    } else {
      showToast("Failed to create post", "error");
    }
  } catch {
    showToast("Server error while posting", "error");
  }
});

loadStories();
loadPosts();
loadNotifications();
