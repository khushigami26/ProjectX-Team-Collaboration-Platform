const chatList = document.getElementById("chatList");
const messageThread = document.getElementById("messageThread");
const messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("messageInput");
const chatName = document.getElementById("chatName");
const chatAvatar = document.getElementById("chatAvatar");
const chatStatus = document.getElementById("chatStatus");
const username = document.getElementById("username");
const searchInput = document.getElementById("searchInput");

const API = "http://localhost:5000/api";
const token = localStorage.getItem("token");
const currentUserId = localStorage.getItem("userId");
const profileKey = (key) => `${key}_${currentUserId}`;
const currentUsername =
  localStorage.getItem(profileKey("profileUsername")) || "user";
const authHeaders = token ? { Authorization: token } : {};
const blankAvatar = "images/img1.jpg";
const pendingChatId = localStorage.getItem("openChatUserId");

if (!token || !currentUserId) {
  window.location.href = "login.html";
}

username.textContent = currentUsername;

let chats = [];
let activeChatId = null;

function renderChats(list) {
  chatList.innerHTML = list
    .map(
      (chat) => `
      <div class="chat ${chat.id === activeChatId ? "active" : ""}" data-id="${chat.id}">
        <img src="${chat.avatar || blankAvatar}" alt="${chat.name}" />
        <div class="chat-info">
          <div class="chat-name">${chat.name}</div>
          <div class="chat-msg">Tap to chat</div>
        </div>
        <div class="chat-right">
          <div class="camera"><i class="fa-solid fa-camera"></i></div>
        </div>
      </div>
    `,
    )
    .join("");

  document.querySelectorAll(".chat").forEach((el) => {
    el.addEventListener("click", () => {
      const id = el.dataset.id;
      setActiveChat(id);
    });
  });
}

async function setActiveChat(id) {
  activeChatId = id;
  const chat = chats.find((c) => c.id === id);
  if (!chat) return;

  chatName.textContent = chat.name;
  chatAvatar.src = chat.avatar || blankAvatar;
  chatStatus.textContent = "Active now";

  await loadMessages(id);
  renderChats(filteredChats());
}

function renderMessages(messages) {
  if (!messages.length) {
    messageThread.innerHTML = "<p class='empty'>Say hi 👋</p>";
    return;
  }

  messageThread.innerHTML = messages
    .map(
      (msg) => `
      <div class="message ${msg.sender === currentUserId ? "you" : ""}">
        <div class="bubble">${msg.message}</div>
      </div>
    `,
    )
    .join("");

  messageThread.scrollTop = messageThread.scrollHeight;
}

async function loadMessages(userId) {
  try {
    const res = await fetch(`${API}/chat/${userId}`, {
      headers: authHeaders,
    });

    if (!res.ok) {
      messageThread.innerHTML = "<p class='empty'>Follow required to chat.</p>";
      return;
    }

    const messages = await res.json();
    renderMessages(Array.isArray(messages) ? messages : []);
  } catch (error) {
    messageThread.innerHTML = "<p class='empty'>Unable to load messages.</p>";
  }
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!activeChatId) return;

  const text = messageInput.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ receiverId: activeChatId, message: text }),
    });

    if (res.ok) {
      await loadMessages(activeChatId);
      messageInput.value = "";
    } else {
      messageThread.innerHTML = "<p class='empty'>Follow required to chat.</p>";
    }
  } catch (error) {
    messageThread.innerHTML = "<p class='empty'>Unable to send message.</p>";
  }
});

function filteredChats() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return chats;
  return chats.filter((chat) => chat.name.toLowerCase().includes(q));
}

searchInput.addEventListener("input", () => {
  renderChats(filteredChats());
});

async function loadConnections() {
  try {
    const res = await fetch(`${API}/users/connections`, {
      headers: authHeaders,
    });
    const data = await res.json();
    chats = Array.isArray(data)
      ? data.map((u) => ({
          id: String(u.id),
          name: u.name || "User",
          avatar: u.avatar || "",
        }))
      : [];
    renderChats(chats);
    if (pendingChatId) {
      const target = chats.find((c) => c.id === pendingChatId);
      if (target) {
        await setActiveChat(pendingChatId);
      }
      localStorage.removeItem("openChatUserId");
    }
  } catch (error) {
    renderChats([]);
  }
}

loadConnections();
