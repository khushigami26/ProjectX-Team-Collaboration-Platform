// Generate a  token
function generateToken() {
  return "tk_" + Math.random().toString(36).slice(2);
}

// Save session and current user
function createSession(user) {
  const session = {
    accessToken: generateToken(),
    refreshToken: generateToken(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000,
  };
  localStorage.setItem("session", JSON.stringify(session));
  localStorage.setItem("currentUser", JSON.stringify(user));
}

// Check if session is still valid
function isSessionValid() {
  const session = JSON.parse(localStorage.getItem("session"));
  if (!session) return false;
  if (Date.now() > session.expiresAt) refreshSession();
  return true;
}

// Refresh session tokens and expiry
function refreshSession() {
  const session = JSON.parse(localStorage.getItem("session"));
  if (!session) return logout();
  session.accessToken = generateToken();
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  localStorage.setItem("session", JSON.stringify(session));
}

// Logout and clear session
function logout() {
  try {
    localStorage.removeItem("session");
    localStorage.removeItem("currentUser");
  } catch (e) {}
  location.href = "index.html";
}
