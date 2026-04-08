function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");
}

async function loadData() {
  const res = await fetch("/api/data");
  const data = await res.json();

  const container = document.querySelector(".tasks");

  container.innerHTML = `
    <h3>Today's Tasks</h3>
    <button id="addTaskBtn">+ Add Task</button>
  `;

  data.tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task";

    div.innerHTML = `
      <span>${task.completed ? "✅" : "📘"} ${task.title}</span>
      <input type="checkbox" ${task.completed ? "checked" : ""}>
    `;

    div.querySelector("input").addEventListener("change", () => {
      toggleTask(index);
    });

    container.appendChild(div);
  });

  document.getElementById("addTaskBtn").onclick = addTask;
}

async function addTask() {
  const title = prompt("Enter your task");

  if (!title) return;

  await fetch("/api/task", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title })
  });

  loadData();
}

async function toggleTask(index) {
  await fetch(`/api/task/${index}`, {
    method: "PUT"
  });

  loadData();
}

loadData();