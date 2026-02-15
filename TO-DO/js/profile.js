// Load current user  profile form
function loadProfile() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) return;
  profileName.innerText = user.username;
  profileEmail.innerText = user.email;
  editUsername.value = user.username;
  editEmail.value = user.email;
}

// Update profile &  save
function updateProfile() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (oldPassword.value && oldPassword.value !== user.password)
    return showToast("Wrong current password", "error");
  user.username = editUsername.value || user.username;
  user.email = editEmail.value || user.email;
  if (newProfilePassword.value) user.password = newProfilePassword.value;
  localStorage.setItem("user_" + user.email, JSON.stringify(user));
  localStorage.setItem("currentUser", JSON.stringify(user));
  showToast("Profile updated", "success");
  loadProfile();
}

loadProfile();

// Cancel profile edit & restore
function cancelProfileEdit(ev) {
  if (ev && ev.preventDefault) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  loadProfile();
  if (window.openTasks) window.openTasks();
  else location.href = "dashboard.html";
  const first = document.getElementById("editUsername");
  if (first) first.blur();
}
