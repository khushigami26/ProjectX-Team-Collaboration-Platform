const API_URL = "http://localhost:5000/api/auth";

const emailInput = document.getElementById("loginEmail");
const passwordInput = document.getElementById("loginPassword");
const pendingEmail = localStorage.getItem("pendingLoginEmail");
const pendingPassword = localStorage.getItem("pendingLoginPassword");

if (pendingEmail) {
  emailInput.value = pendingEmail;
}

if (pendingPassword) {
  passwordInput.value = pendingPassword;
}

/* Login Function */
async function loginUser() {
  const email = emailInput.value;
  const password = passwordInput.value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.token) {
      localStorage.removeItem("profileName");
      localStorage.removeItem("profileUsername");
      localStorage.removeItem("profileBio");
      localStorage.removeItem("profileAvatar");
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user._id);
      const profileKey = (key) => `${key}_${data.user._id}`;
      const existingAvatar = localStorage.getItem(profileKey("profileAvatar"));
      if (data.user?.name) {
        localStorage.setItem(profileKey("profileName"), data.user.name);
        localStorage.setItem(profileKey("profileUsername"), data.user.name);
      }
      if (data.user?.avatar) {
        localStorage.setItem(profileKey("profileAvatar"), data.user.avatar);
      } else if (existingAvatar) {
        fetch("http://localhost:5000/api/users/me", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: data.token,
          },
          body: JSON.stringify({ avatar: existingAvatar }),
        }).catch(() => {});
      }
      localStorage.removeItem("pendingLoginEmail");
      localStorage.removeItem("pendingLoginPassword");

      showToast("Login successful", "success");

      window.location.href = "home.html";
    } else {
      showToast(data, "error");
    }
  } catch (error) {
    showToast("Server error", "error");
  }
}
