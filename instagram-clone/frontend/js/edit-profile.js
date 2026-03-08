const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("userId");
const profileKey = (key) => `${key}_${currentUser}`;
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

if (!token || !currentUser) {
  window.location.href = "login.html";
}

const nameInput = document.getElementById("nameInput");
const usernameInput = document.getElementById("usernameInput");
const bioInput = document.getElementById("bioInput");
const editAvatar = document.getElementById("editAvatar");
const avatarInput = document.getElementById("avatarInput");
const changePhotoBtn = document.getElementById("changePhotoBtn");
const saveBtn = document.getElementById("saveBtn");

const storedName = localStorage.getItem(profileKey("profileName"));
const storedUsername = localStorage.getItem(profileKey("profileUsername"));
const storedBio = localStorage.getItem(profileKey("profileBio"));
const storedAvatar = localStorage.getItem(profileKey("profileAvatar"));
const blankAvatar = "images/img1.jpg";

const fallbackUsername = `user_${currentUser.slice(0, 6)}`;

nameInput.value = storedName || `User ${currentUser.slice(0, 6)}`;
usernameInput.value = storedUsername || fallbackUsername;
bioInput.value = storedBio || "";
editAvatar.src = storedAvatar || blankAvatar;

changePhotoBtn.addEventListener("click", () => {
  avatarInput.click();
});

avatarInput.addEventListener("change", () => {
  if (!avatarInput.files[0]) return;
  const reader = new FileReader();
  reader.onload = () => {
    editAvatar.src = reader.result;
  };
  reader.readAsDataURL(avatarInput.files[0]);
});

saveBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const username = usernameInput.value.trim();
  const bio = bioInput.value.trim();

  if (!name || !username) {
    showToast("Name and username are required", "error");
    return;
  }

  localStorage.setItem(profileKey("profileName"), name);
  localStorage.setItem(profileKey("profileUsername"), username);
  localStorage.setItem(profileKey("profileBio"), bio);
  localStorage.setItem(profileKey("profileAvatar"), editAvatar.src);

  fetch("http://localhost:5000/api/users/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: JSON.stringify({
      name,
      avatar: editAvatar.src,
      bio,
    }),
  })
    .catch(() => {})
    .finally(() => {
      showToast("Profile updated successfully", "success");
      setTimeout(() => {
        window.location.href = "profile.html";
      }, 700);
    });
});
