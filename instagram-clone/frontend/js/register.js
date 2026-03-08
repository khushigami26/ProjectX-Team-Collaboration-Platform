const API_URL = "http://localhost:5000/api/auth";

const usernameInput = document.getElementById("registerUsername");
const emailInput = document.getElementById("registerEmail");
const passwordInput = document.getElementById("registerPassword");

async function registerUser() {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!username || !email || !password) {
    showToast("Please fill all fields", "error");
    return;
  }

  if (username.includes(" ")) {
    showToast("Username must not contain spaces", "error");
    return;
  }

  if (!email.includes("@")) {
    showToast("Email must contain @", "error");
    return;
  }

  if (password.length < 6) {
    showToast("Password must be at least 6 characters", "error");
    return;
  }

  if (!/[A-Z]/.test(password)) {
    showToast("Password must include one uppercase letter", "error");
    return;
  }

  if (!/[a-zA-Z]/.test(password)) {
    showToast("Password must include one alphabet letter", "error");
    return;
  }

  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    showToast("Password must include one special character", "error");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("pendingLoginEmail", email);
      localStorage.setItem("pendingLoginPassword", password);
      showToast("Account created. Please log in.", "success");
      window.location.href = "login.html";
    } else {
      showToast(data || "Registration failed", "error");
    }
  } catch (error) {
    showToast("Server error", "error");
  }
}
