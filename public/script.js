async function loadData() {
  const res = await fetch("/api/data");
  const data = await res.json();

  const container = document.querySelector(".tasks");
  container.innerHTML = "<h3>Today's Tasks</h3>";

  data.tasks.forEach((task, index) => {
    const div = document.createElement("div");
    div.className = "task";

    div.innerHTML = `
      <span>${task.title}</span>
      <input type="checkbox" ${task.completed ? "checked" : ""}>
    `;

    div.querySelector("input").addEventListener("change", () => {
      toggleTask(index);
    });

    container.appendChild(div);
  });
}

async function addTask() {
  const title = prompt("Enter task");
  if (!title) return;

  await fetch("/api/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

// Add button
const addBtn = document.createElement("button");
addBtn.innerText = "+ Add Task";
addBtn.style.marginTop = "10px";
addBtn.onclick = addTask;

document.querySelector("#home .tasks").appendChild(addBtn);

// Load data on start
loadData();