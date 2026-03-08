const API = "http://localhost:5000/api";

const postsContainer = document.getElementById("posts");
const postForm = document.getElementById("postForm");
const imageInput = document.getElementById("image");
const captionInput = document.getElementById("caption");
const postMessage = document.getElementById("postMessage");
const logoutBtn = document.getElementById("logoutBtn");
const refreshBtn = document.getElementById("refreshBtn");
const currentUserPill = document.getElementById("currentUser");

const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("userId");

if (!token || !currentUser) {
  window.location.href = "login.html";
}

currentUserPill.textContent = currentUser
  ? `User: ${currentUser.slice(0, 8)}...`
  : "Guest";

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "login.html";
});

refreshBtn.addEventListener("click", () => {
  loadPosts();
});

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await createPost();
});

async function createPost() {
  postMessage.textContent = "";

  if (!imageInput.files[0]) {
    postMessage.textContent = "Please choose an image.";
    return;
  }

  const fd = new FormData();
  fd.append("image", imageInput.files[0]);
  fd.append("caption", captionInput.value.trim());
  fd.append("userId", currentUser);

  try {
    const res = await fetch(`${API}/posts`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      postMessage.textContent = "Failed to create post.";
      return;
    }

    captionInput.value = "";
    imageInput.value = "";
    await loadPosts();
  } catch (error) {
    postMessage.textContent = "Server error while posting.";
  }
}

async function loadPosts() {
  postsContainer.innerHTML = "<p class='muted'>Loading...</p>";

  try {
    const res = await fetch(`${API}/posts`);
    const posts = await res.json();

    if (!Array.isArray(posts)) {
      postsContainer.innerHTML = "<p class='muted'>No posts yet.</p>";
      return;
    }

    postsContainer.innerHTML = posts
      .map(
        (p) => `
      <article class="post-card">
        <img src="http://localhost:5000/uploads/${p.image}" alt="Post image" />
        <div class="post-body">
          <p class="post-caption">${p.caption || ""}</p>
          <p class="post-meta">${new Date(p.createdAt).toLocaleString()}</p>
        </div>
      </article>
    `,
      )
      .join("");
  } catch (error) {
    postsContainer.innerHTML = "<p class='muted'>Failed to load posts.</p>";
  }
}

loadPosts();
