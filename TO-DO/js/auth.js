//  password visibility
function togglePassword(inputId, icon) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    icon.innerText = "🙈";
  } else {
    input.type = "password";
    icon.innerText = "👁️";
  }
}

// Register  new user
function registerUser() {
  const usernameEl = document.getElementById("regUsername");
  const emailEl = document.getElementById("regEmail");
  const passwordEl = document.getElementById("regPassword");

  const username = ((usernameEl && usernameEl.value) || "").trim();
  const email = ((emailEl && emailEl.value) || "").trim().toLowerCase();
  const password = passwordEl ? passwordEl.value : "";

  if (!username || !email || !password) {
    showToast("Fill username, email and password", "error");
    return;
  }

  const storageKey = "user_" + email;
  if (localStorage.getItem(storageKey)) {
    showToast("An account with this email exists", "error");
    return;
  }

  const user = { id: Date.now(), username, email, password, theme: "light" };
  localStorage.setItem(storageKey, JSON.stringify(user));
  showToast("Registered", "success");
  setTimeout(() => (location.href = "index.html"), 900);
}

// Login using email or username
function loginUser() {
  const passwordEl = document.getElementById("loginPassword");
  const emailEl = document.getElementById("loginEmail");
  const usernameEl = document.getElementById("loginUsername");
  const password = passwordEl ? passwordEl.value : "";

  // Prefer email login when field exists
  if (emailEl && emailEl.value) {
    const stored = JSON.parse(
      localStorage.getItem("user_" + (emailEl.value || ""))
    );
    if (!stored || stored.password !== password) {
      showToast("Wrong email or password", "error");
      return;
    }
    createSession(stored);
    showToast("Welcome back", "success");
    setTimeout(() => (location.href = "dashboard.html"), 700);
    return;
  }

  if (usernameEl && usernameEl.value) {
    const input = usernameEl.value.trim();
    if (!input) {
      showToast("Enter username or email", "error");
      return;
    }

    // if @ it is email --check
    if (input.includes("@")) {
      const u = JSON.parse(localStorage.getItem("user_" + input.toLowerCase()));
      if (u && u.password === password) {
        createSession(u);
        showToast("Welcome back", "success");
        setTimeout(() => (location.href = "dashboard.html"), 700);
        return;
      }
      showToast("Wrong email or password", "error");
      return;
    }

    // otherwise scan users for matching username
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !k.startsWith("user_")) continue;
      try {
        const storedUser = JSON.parse(localStorage.getItem(k));
        if (
          storedUser &&
          storedUser.username === input &&
          storedUser.password === password
        ) {
          createSession(storedUser);
          showToast("Welcome back", "success");
          setTimeout(() => (location.href = "dashboard.html"), 700);
          return;
        }
      } catch (err) {
        // skip invalid entries
      }
    }
    showToast("Wrong username or password", "error");
    return;
  }

  showToast("No login fields found", "error");
}

// Simulate forgot/reset flows (simple localStorage demo)
function forgotPassword() {
  const el = document.getElementById("forgotEmail");
  if (!el || !el.value) return showToast("Enter email", "error");
  localStorage.setItem("reset_email", el.value);
  showToast("Reset link sent (simulated)", "info");
  setTimeout(() => (location.href = "reset.html"), 700);
}

function resetPassword() {
  const email = localStorage.getItem("reset_email");
  if (!email) return showToast("No reset requested", "error");
  const user = JSON.parse(localStorage.getItem("user_" + email));
  const newPwdEl = document.getElementById("newPassword");
  if (!user || !newPwdEl || !newPwdEl.value)
    return showToast("Invalid data", "error");
  user.password = newPwdEl.value;
  localStorage.setItem("user_" + email, JSON.stringify(user));
  showToast("Password updated", "success");
  setTimeout(() => (location.href = "index.html"), 800);
}
