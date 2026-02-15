const API = "http://localhost:5000/api";
const list = document.getElementById("notificationList");
const token = localStorage.getItem("token");
const currentUser = localStorage.getItem("userId");
const authHeaderValue = token
  ? token.startsWith("Bearer ")
    ? token
    : `Bearer ${token}`
  : "";
const authHeaders = authHeaderValue ? { Authorization: authHeaderValue } : {};
const blankAvatar = "images/img1.jpg";

if (!token || !currentUser) {
  window.location.href = "login.html";
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

function renderNotifications(items) {
  if (!Array.isArray(items) || items.length === 0) {
    list.innerHTML = '<div class="empty">No notifications</div>';
    return;
  }

  list.innerHTML = items
    .map((n) => {
      const avatar = n.fromUserAvatar || blankAvatar;
      const thumb = n.postImage
        ? `http://localhost:5000/uploads/${n.postImage}`
        : "";
      const time = timeAgo(n.createdAt);
      const name = n.fromUserName || "Someone";
      const safeMessage = (n.message || "").replace(name, "").trim();

      const typeTextMap = {
        follow_request: "sent you a follow request",
        follow: "started following you",
        like: "liked your post",
        comment: safeMessage ? `commented: ${safeMessage}` : "commented",
        story_like: "liked your story",
        story_comment: safeMessage ? `commented: ${safeMessage}` : "commented",
      };

      const text = typeTextMap[n.type] || n.message || "";
      const formattedMessage = text
        ? `<strong class="notif-username">${name}</strong> ${text}`
        : `<strong class="notif-username">${name}</strong>`;

      const followButtons =
        n.type === "follow_request"
          ? `<div class="follow-actions" data-user="${n.fromUserId || ""}" data-request="${n.requestId || ""}"></div>`
          : "";

      return `
        <div class="notification" data-user-id="${n.fromUserId || ""}">
          <img class="profile-img" src="${avatar}" alt="profile" />
          <div class="notification-text">
            ${formattedMessage}
            <div class="time">${time}</div>
          </div>
          ${thumb ? `<img class="post-thumb" src="${thumb}" alt="post" />` : ""}
          ${followButtons}
        </div>
      `;
    })
    .join("");
}

async function loadNotifications() {
  try {
    const itemsRes = await fetch(`${API}/notifications`, {
      headers: authHeaders,
    });
    if (!itemsRes.ok) throw new Error("Notifications failed");
    const items = await itemsRes.json();
    renderNotifications(items);

    const requestsRes = await fetch(`${API}/follow/requests`, {
      headers: authHeaders,
    });
    const requests = requestsRes.ok ? await requestsRes.json() : [];
    const pendingIds = new Set((requests || []).map((r) => String(r.id)));

    list.querySelectorAll(".follow-actions").forEach(async (el) => {
      const userId = el.dataset.user;
      const requestId = el.dataset.request;
      if (requestId && pendingIds.has(String(requestId))) {
        el.innerHTML = `
          <button class="follow-btn follow" data-action="accept" data-request="${requestId}">Accept</button>
          <button class="follow-btn following" data-action="reject" data-request="${requestId}">Reject</button>
        `;
      } else if (userId) {
        try {
          const statusRes = await fetch(`${API}/follow/status/${userId}`, {
            headers: authHeaders,
          });
          const status = await statusRes.json();
          if (status.following) {
            el.innerHTML =
              '<button class="follow-btn following" disabled>Following</button>';
          } else {
            el.innerHTML = `<button class="follow-btn follow" data-action="follow" data-user="${userId}">Follow</button>`;
          }
        } catch {
          el.innerHTML = "";
        }
      }
    });

    list.querySelectorAll(".follow-btn").forEach((btn) => {
      btn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        const action = btn.dataset.action;
        const requestId = btn.dataset.request;
        const userId = btn.dataset.user;
        if (!action) return;

        const url =
          action === "accept"
            ? `${API}/follow/accept`
            : action === "reject"
              ? `${API}/follow/reject`
              : `${API}/follow/request`;
        const body = action === "follow" ? { toUserId: userId } : { requestId };

        try {
          await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...authHeaders,
            },
            body: JSON.stringify(body),
          });
          loadNotifications();
        } catch {}
      });
    });

    list.querySelectorAll(".notification").forEach((row) => {
      row.addEventListener("click", () => {
        const userId = row.dataset.userId;
        if (!userId) return;
        window.location.href = `user-profile.html?userId=${userId}`;
      });
    });
  } catch {
    renderNotifications([]);
  }
}

async function markSeen() {
  try {
    await fetch(`${API}/notifications/mark-seen`, {
      method: "PATCH",
      headers: authHeaders,
    });
  } catch {}
}

loadNotifications();
markSeen();
