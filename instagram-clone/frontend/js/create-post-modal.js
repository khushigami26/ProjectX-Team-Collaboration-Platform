(function injectCreatePostModal() {
  const mount = document.getElementById("createPostMount");
  if (!mount) return;

  mount.innerHTML = `
    <div id="createPostModal" class="create-post-overlay hidden">
      <div class="create-post-container">
        <div class="create-header">
          <button id="closeCreatePost" class="create-back">←</button>
          <div id="createPostTitle">Create new post</div>
          <button id="sharePostBtn" class="create-share">Share</button>
        </div>
        <div class="create-body">
          <div class="preview-section">
            <img id="createPreview" src="" alt="preview" />
          </div>
          <div class="caption-section">
            <div class="user-info">
              <img id="createUserAvatar" src="" alt="user" />
              <span id="createUsername"></span>
            </div>
            <div class="caption-box">
              <textarea
                id="createCaption"
                placeholder="Write a caption..."
              ></textarea>
            </div>
            <div class="option-item">
              <input
                id="createLocation"
                type="text"
                placeholder="Add location"
              />
              <span class="icon">📍</span>
            </div>
            <div class="option-item">
              <input id="createMusic" type="text" placeholder="Add music" />
              <span class="icon">🎵</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
})();
