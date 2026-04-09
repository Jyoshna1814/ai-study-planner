function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

async function loadData() {
  const res = await fetch("/api/data");
  const data = await res.json();

  // 🔥 UPDATE DASHBOARD
  document.querySelector(".progress-circle span").innerText = data.progress + "%";
  document.querySelector(".stats h3").innerText = data.streak + " Day Streak 🔥";

  document.querySelectorAll(".small p")[0].innerText =
    `${data.completed}/${data.total} Today`;

  // 🔥 TASKS
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
  saveTasksOffline(data.tasks);

  document.getElementById("addTaskBtn").onclick = addTask;

  // 🔥 ANALYTICS UPDATE
  document.querySelector("#analytics .big-circle").innerText = data.progress + "%";

  // 🔥 BADGES SYSTEM
  updateBadges(data);
}

function updateBadges(data) {
  const badges = document.querySelectorAll(".badge");

  badges.forEach(b => b.classList.add("locked"));

  if (data.completed >= 1) badges[0].classList.add("unlocked");
  if (data.streak >= 3) badges[1].classList.add("unlocked");
  if (data.completed >= 5) badges[2].classList.add("unlocked");
}

async function addTask() {
  const title = prompt("Enter your task");
  if (!title) return;

  await fetch("/api/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title })
  });

  loadData();
}

async function toggleTask(index) {
  await fetch(`/api/task/${index}`, { method: "PUT" });
  loadData();
}

loadData();
let timeLeft = 1500;
let timerInterval;

function updateTimerDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  document.getElementById("timerDisplay").innerText =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      alert("🎉 Focus session completed!");
      generateSuggestion();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timeLeft = 1500;
  updateTimerDisplay();
}

function generateSuggestion() {
  const suggestions = [
    "Revise Chemistry reactions now.",
    "Take a 5 min break and continue Biology.",
    "Focus on weak subjects first.",
    "Practice Maths numericals next."
  ];

  const random =
    suggestions[Math.floor(Math.random() * suggestions.length)];

  document.getElementById("aiSuggestion").innerText = random;
}

updateTimerDisplay();
// 🔥 offline backup
function saveTasksOffline(tasks) {
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

function getOfflineTasks() {
  return JSON.parse(localStorage.getItem("studyTasks")) || [];
}

// 🔔 reminder notification
function showReminder() {
  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        new Notification("📚 Study Reminder", {
          body: "Time to complete your daily tasks!"
        });
      }
    });
  }
}

// reminder every 1 min demo
setInterval(showReminder, 60000);
function generateAIPlan() {
  const plans = [
    "📘 8 AM - Maths practice\n⚡ 10 AM - Physics numericals\n🧪 4 PM - Chemistry revision",
    "📖 9 AM - Biology notes\n📝 11 AM - English writing\n📊 5 PM - History revision",
    "🧠 Focus weak subjects first: Maths + Chemistry\n⏱ 2 Pomodoro sessions recommended",
    "🔥 Tomorrow priority: Physics + Biology\n🎯 Target 3 completed tasks"
  ];

  const randomPlan = plans[Math.floor(Math.random() * plans.length)];

  document.getElementById("aiPlanText").innerText = randomPlan;
}