let currentDate = new Date();
let selectedDate = new Date();

// Render calendar grid
function renderCalendar() {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  calendarTitle.innerText = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++)
    grid.appendChild(document.createElement("div"));

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.className = "calendar-day";
    // wrap number in a span so we can layer a small today marker behind it
    cell.innerHTML = `<span class="day-num">${day}</span>`;

    const cellDate = new Date(year, month, day);
    // format local YYYY-MM-DD to avoid timezone shifts from toISOString
    const iso = `${cellDate.getFullYear()}-${String(
      cellDate.getMonth() + 1
    ).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;

    // mark days that have tasks
    if (getTasks().some((t) => t.date === iso)) cell.classList.add("has-task");

    // highlight today
    const today = new Date();
    if (
      cellDate.getFullYear() === today.getFullYear() &&
      cellDate.getMonth() === today.getMonth() &&
      cellDate.getDate() === today.getDate()
    ) {
      cell.classList.add("today");
    }

    cell.onclick = () => {
      selectedDate = new Date(year, month, day);
      renderCalendarTasks();
    };

    grid.appendChild(cell);
  }
}

// Render tasks for selected calendar date
function renderCalendarTasks() {
  const list = document.getElementById("calendarTaskList");
  list.innerHTML = "";

  const iso = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
  getTasks()
    .filter((t) => t.date === iso)
    .forEach((task) => {
      const li = document.createElement("li");
      li.className = "task-item";
      li.innerText = task.title;
      list.appendChild(li);
    });
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}
function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}

renderCalendar();
window.renderCalendar = renderCalendar;

// Render overview counts and charts
function renderOverview() {
  const tasks = getTasks();

  // Completed -  pending count
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const pending = total - completed;
  const completedEl = document.getElementById("overviewCompletedCount");
  const pendingEl = document.getElementById("overviewPendingCount");
  if (completedEl) completedEl.innerText = completed;
  if (pendingEl) pendingEl.innerText = pending;

  // 7-day completed counts
  const days = [];
  const counts = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().split("T")[0];
    days.push(d.toLocaleString("default", { weekday: "short" }));
    counts.push(tasks.filter((t) => t.date === iso && t.done).length);
  }

  drawBarChart(document.getElementById("overviewBarChart"), days, counts);

  // pie: pending by category
  const pendingTasks = tasks.filter((t) => !t.done);

  const byCat = {};
  pendingTasks.forEach((t) => {
    const cat = t.category || "No Category";
    byCat[cat] = (byCat[cat] || 0) + 1;
  });

  const categories = Object.keys(byCat);
  const values = categories.map((c) => byCat[c]);

  drawDonut(
    document.getElementById("overviewDonut"),
    categories,
    values,
    document.getElementById("donutLegend")
  );
}

// bar chart
function drawBarChart(canvas, labels, values) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  // retry if canvas dont have layout
  if (!rect.width || rect.width < 20) {
    setTimeout(() => drawBarChart(canvas, labels, values), 80);
    return;
  }
  const w = Math.max(200, Math.floor(rect.width));
  const h = Math.max(120, Math.floor(rect.height || 160));
  canvas.width = Math.floor(w * dpr);
  canvas.height = Math.floor(h * dpr);
  canvas.style.width = w + "px";
  canvas.style.height = h + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);

  const paddingLeft = 20;
  const paddingBottom = 24;
  const chartHeight = h - paddingBottom - 20;
  const max = Math.max(1, ...values);
  const gap = 14;
  const barWidth = Math.max(
    12,
    Math.min(
      36,
      (w - paddingLeft - gap * (labels.length - 1)) / labels.length - 2
    )
  );

  ctx.font = "12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#6b7280";

  labels.forEach((lab, i) => {
    const val = values[i] || 0;
    const x = paddingLeft + i * (barWidth + gap);
    const barH = (val / max) * chartHeight;
    ctx.fillStyle = "#f78fb3";
    ctx.fillRect(x, 10 + (chartHeight - barH), barWidth, barH);
    ctx.fillStyle = "#6b7280";
    ctx.fillText(lab, x + barWidth / 2, 12 + chartHeight + 4);
  });
}

// Draw pie chart in an SVG
function drawDonut(svgEl, categories, values, legendEl) {
  if (!svgEl) return;
  // clear
  while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
  if (legendEl) legendEl.innerHTML = "";

  const total = values.reduce((a, b) => a + b, 0) || 1;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  // colors
  const palette = [
    "#d8a3b5",
    "#b39fd6",
    "#86a8d3",
    "#e6c97a",
    "#8fb99a",
    "#f9a8d4",
    "#fb7185",
  ];

  let offset = 0;
  categories.forEach((cat, i) => {
    const val = values[i] || 0;
    const portion = val / total;
    const dash = portion * circumference;

    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("r", radius);
    circle.setAttribute("cx", 100);
    circle.setAttribute("cy", 100);
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", palette[i % palette.length]);
    circle.setAttribute("stroke-width", 30);
    circle.setAttribute("stroke-dasharray", `${dash} ${circumference - dash}`);
    circle.setAttribute("stroke-dashoffset", -offset);
    circle.setAttribute("stroke-linecap", "butt");
    svgEl.appendChild(circle);

    offset += dash;

    if (legendEl) {
      const row = document.createElement("div");
      const dot = document.createElement("span");
      dot.className = "dot";
      dot.style.background = palette[i % palette.length];
      row.appendChild(dot);
      const text = document.createTextNode(` ${cat} `);
      row.appendChild(text);
      const bold = document.createElement("b");
      bold.innerText = val;
      row.appendChild(bold);
      legendEl.appendChild(row);
    }
  });
}
