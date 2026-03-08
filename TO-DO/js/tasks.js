function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

// Current category filter
let currentCategory = "All";

function setCategory(cat) {
  currentCategory = cat;
  renderTasks();
}

// edit task id
let editingTaskId = null;

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  getTasks()
    .filter(
      (t) =>
        currentCategory === "All" ||
        (t.category || "General") === currentCategory
    )
    .forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";

      const radio = document.createElement("div");
      radio.className = "task-radio" + (task.done ? " done" : "");
      radio.onclick = () => toggleTask(task.id);

      const content = document.createElement("div");
      content.style.flex = "1";

      const title = document.createElement("div");
      title.className = "task-text" + (task.done ? " done" : "");
      title.innerText = task.title;

      const meta = document.createElement("div");
      meta.className = "task-meta";

      const badge = document.createElement("span");
      badge.className = "task-badge";
      badge.innerText = task.category || "General";
      badge.style.background = task.color || "var(--primary)";

      const time = document.createElement("span");
      time.className = "task-time";
      time.innerText = (task.date || "") + (task.time ? " • " + task.time : "");

      const pr = document.createElement("span");
      pr.className = "task-priority";
      pr.innerText = task.priority || "Medium";

      meta.append(badge, time, pr);

      content.append(title, meta);

      // action buttons
      const actions = document.createElement("div");
      actions.className = "task-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "icon-btn";
      editBtn.title = "Edit task";
      editBtn.innerText = "✎";
      editBtn.onclick = (e) => {
        e.stopPropagation();
        openEditTask(task.id);
      };

      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn";
      delBtn.title = "Delete task";
      delBtn.innerText = "🗑️";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        deleteTask(task.id);
      };

      actions.append(editBtn, delBtn);

      li.append(radio, content, actions);
      list.appendChild(li);
    });

  updateProgressCharts();
  if (window.renderOverview) window.renderOverview();
}

function openTaskInput() {
  const modal = document.getElementById("taskModal");
  const form = document.getElementById("taskForm");
  form.reset();
  editingTaskId = null;
  const hdr = document.querySelector("#taskModal .modal-header h3");
  if (hdr) hdr.innerText = "New Task";
  // defaults
  document.getElementById("taskDate").value = new Date()
    .toISOString()
    .split("T")[0];
  const now = new Date();
  document.getElementById("taskTime").value = now.toTimeString().slice(0, 5);
  document.getElementById("taskPriority").value = "Medium";
  const catSel = document.getElementById("taskCategory");
  if (catSel && catSel.options.length) {
    catSel.value = catSel.options[0].value;
  } else {
    document.getElementById("taskCategory").value = "General";
  }

  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("show"), 10);
}

function openEditTask(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;
  editingTaskId = id;
  const hdr = document.querySelector("#taskModal .modal-header h3");
  if (hdr) hdr.innerText = "Edit Task";

  document.getElementById("taskTitle").value = task.title || "";
  document.getElementById("taskDate").value =
    task.date || new Date().toISOString().split("T")[0];
  document.getElementById("taskTime").value = task.time || "";
  document.getElementById("taskCategory").value = task.category || "Work";
  document.getElementById("taskPriority").value = task.priority || "Medium";

  const modal = document.getElementById("taskModal");
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("show"), 10);
}

function closeTaskModal() {
  const modal = document.getElementById("taskModal");
  modal.classList.remove("show");
  setTimeout(() => modal.classList.add("hidden"), 220);
}

function saveTaskFromModal() {
  const title = document.getElementById("taskTitle").value.trim();
  if (!title) {
    showToast("Title is required", "error");
    return;
  }

  const date =
    document.getElementById("taskDate").value ||
    new Date().toISOString().split("T")[0];
  const time = document.getElementById("taskTime").value || "";
  const category = document.getElementById("taskCategory").value || "General";
  const priority = document.getElementById("taskPriority").value || "Medium";
  // choose category color if available; else dusty pink
  let color = "#d8a3b5";
  try {
    const storedCats = getStoredCategories && getStoredCategories();
    if (storedCats && storedCats.length) {
      const found = storedCats.find((c) => c.name === category);
      if (found && found.color) color = found.color;
    }
  } catch (e) {}

  const tasks = getTasks();
  if (editingTaskId) {
    const task = tasks.find((t) => t.id === editingTaskId);
    if (task) {
      task.title = title;
      task.date = date;
      task.time = time;
      task.category = category;
      task.priority = priority;
      task.color = color;
      showToast("Task updated", "success");
    }
  } else {
    tasks.push({
      id: Date.now(),
      title,
      done: false,
      date,
      time,
      category,
      priority,
      color,
    });
    showToast("Task added successfully", "success");
  }

  saveTasks(tasks);
  renderTasks();
  closeTaskModal();
  editingTaskId = null;
  if (window.renderOverview) window.renderOverview();
  if (window.renderCalendar) window.renderCalendar();
}

function toggleTask(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  task.done = !task.done;

  saveTasks(tasks);
  renderTasks();
  showToast(
    task.done ? "Task completed" : "Task marked incomplete",
    task.done ? "success" : "info"
  );
  if (window.renderOverview) window.renderOverview();
  if (window.renderCalendar) window.renderCalendar();
}

function deleteTask(id) {
  if (!confirm("Delete this task?")) return;
  let tasks = getTasks();
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks(tasks);
  renderTasks();
  showToast("Task deleted", "info");
  if (window.renderOverview) window.renderOverview();
  if (window.renderCalendar) window.renderCalendar();
}

function updateProgressCharts() {
  const tasks = getTasks();
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  const circle = document.getElementById("circleProgress");
  const percentEl = document.getElementById("progressPercent");
  const completedBar = document.getElementById("completedBar");
  const pendingBar = document.getElementById("pendingBar");

  if (percentEl) percentEl.innerText = percent + "%";
  if (circle) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  if (completedBar) completedBar.innerText = `Completed (${completed})`;
  if (pendingBar) pendingBar.innerText = `Pending (${total - completed})`;
}

renderTasks();

window.setCategory = setCategory;
window.openEditTask = openEditTask;
window.deleteTask = deleteTask;
