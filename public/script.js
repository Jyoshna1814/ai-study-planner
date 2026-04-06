let currentUser = null
let chart = null
let currentDayIndex = 0
let fullTimetable = []

// ================= AUTH =================
function signup() {
  let username = document.getElementById("username").value
  let password = document.getElementById("password").value

  fetch("/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => alert(data.message))
}

function login() {
  let username = document.getElementById("username").value
  let password = document.getElementById("password").value

  fetch("/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  })
    .then(res => res.json())
    .then(data => {
      if (data.user) {
        currentUser = data.user

        localStorage.setItem("user", JSON.stringify(currentUser))

        document.getElementById("authBox").style.display = "none"
        document.getElementById("logoutBtn").style.display = "block"

        loadSubjects()
        loadProgress()

        let savedPlan = localStorage.getItem("savedTimetable")
        let savedDay = localStorage.getItem("currentDayIndex")

        if (savedPlan) {
          fullTimetable = JSON.parse(savedPlan)
          currentDayIndex = Number(savedDay || 0)
          showSingleDayPlanner()
        }
      } else {
        alert(data.message || "Login failed ❌")
      }
    })
}

function logout() {
  localStorage.clear()
  location.reload()
}

// ================= SUBJECTS =================
function addSubject() {
  let subject = document.getElementById("subjectInput").value
  let difficulty = document.getElementById("difficultyInput").value
  let weightage = document.getElementById("weightageInput").value

  fetch("/add-subject", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user: currentUser.username,
      name: subject,
      difficulty: Number(difficulty),
      weightage: Number(weightage)
    })
  })
    .then(res => res.json())
    .then(() => {
      alert("Subject added ✅")
      loadSubjects()
    })
}

function loadSubjects() {
  fetch("/subjects/" + currentUser.username)
    .then(res => res.json())
    .then(data => {
      let list = document.getElementById("subjectList")
      list.innerHTML = ""

      data.forEach(sub => {
        let li = document.createElement("li")

        li.innerHTML = `
          ${sub.name}
          <button onclick="editSubject('${sub._id}','${sub.name}')">Edit</button>
          <button onclick="deleteSubject('${sub._id}')">Delete</button>
        `
        list.appendChild(li)
      })
    })
}

function deleteSubject(id) {
  fetch("/delete-subject/" + id, { method: "DELETE" })
    .then(() => loadSubjects())
}

function editSubject(id, name) {
  let newName = prompt("Edit subject", name)

  fetch("/edit-subject/" + id, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName })
  })
    .then(() => loadSubjects())
}

// ================= TIME FORMAT =================
function formatTime(hours) {
  let totalMinutes = Math.round(hours * 60)
  let hr = Math.floor(totalMinutes / 60)
  let min = totalMinutes % 60

  if (hr === 0) return `${min} min`
  return `${hr} hr ${min} min`
}

// ================= TIMETABLE =================
async function generateTimetable() {
  const res = await fetch("/subjects/" + currentUser.username)
  const subjects = await res.json()

  const examDate = document.getElementById("examDate").value
  const hoursPerDay = Number(document.getElementById("studyHours").value)

  const response = await fetch("/generate-timetable", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subjects,
      examDate,
      hoursPerDay
    })
  })

  const data = await response.json()

  fullTimetable = data.timetable
  currentDayIndex = 0

  localStorage.setItem("savedTimetable", JSON.stringify(fullTimetable))
  localStorage.setItem("currentDayIndex", currentDayIndex)

  showSingleDayPlanner()
}

function showSingleDayPlanner() {
  let result = document.getElementById("planResult")
  result.innerHTML = ""

  let day = fullTimetable[currentDayIndex]

  if (!day) {
    result.innerHTML = "<h3>🎉 All study days completed</h3>"
    return
  }

  let div = document.createElement("div")
  div.className = "day-card"

  div.innerHTML = `<h2>📅 Day ${day.day}</h2>`

  day.plan.forEach(p => {
    div.innerHTML += `
      <p>
        ${p.subject} - ${formatTime(p.hours)}
        <button onclick="markDone('${p.subject}', ${p.hours})">
          Done
        </button>
      </p>
    `
  })

  div.innerHTML += `
    <button onclick="goToNextDay()">➡ Next Day</button>
  `

  result.appendChild(div)

  showChart(day.plan)
}

function goToNextDay() {
  currentDayIndex++

  localStorage.setItem("currentDayIndex", currentDayIndex)

  showSingleDayPlanner()
}

async function markDone(subject, hours) {
  await fetch("/update-progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subjectName: subject,
      hours: Number(hours),
      user: currentUser.username
    })
  })

  alert("✅ Session completed successfully!")

  await loadProgress()
}

// ================= PROGRESS =================
async function loadProgress() {
  const res = await fetch("/progress/" + currentUser.username)
  const data = await res.json()

  const bar = document.getElementById("progressBar")
  const progressValue = Number(data.progress)

  bar.style.width = progressValue + "%"
  bar.innerText = progressValue.toFixed(2) + "%"
}

// ================= CHART =================
function showChart(plan) {
  const canvas = document.getElementById("progressChart")
  if (!canvas) return

  const ctx = canvas.getContext("2d")

  const labels = plan.map(p => p.subject)
  const values = plan.map(p => p.hours)

  const colors = [
    "#4CAF50",
    "#2196F3",
    "#FF9800",
    "#9C27B0",
    "#F44336"
  ]

  if (chart) {
    chart.destroy()
    chart = null
  }

  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Study Time",
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.label + " - " + formatTime(context.raw)
            }
          }
        }
      },
      scales: {
        y: {
          ticks: {
            callback: function (value) {
              return formatTime(value)
            }
          }
        }
      }
    }
  })
}

// ================= POMODORO =================
let timer
let timeLeft = 25 * 60

function updateTimer() {
  let minutes = Math.floor(timeLeft / 60)
  let seconds = timeLeft % 60

  document.getElementById("timer").textContent =
    minutes.toString().padStart(2, "0") +
    ":" +
    seconds.toString().padStart(2, "0")
}

function startTimer() {
  if (timer) return

  timer = setInterval(() => {
    timeLeft--
    updateTimer()

    if (timeLeft <= 0) {
      clearInterval(timer)
      timer = null
      alert("Session complete!")
    }
  }, 1000)
}

function stopTimer() {
  clearInterval(timer)
  timer = null
}

function resetTimer() {
  clearInterval(timer)
  timer = null
  timeLeft = 25 * 60
  updateTimer()
}

updateTimer()

// ================= AUTO LOAD =================
window.onload = function () {
  let savedUser = localStorage.getItem("user")

  if (savedUser) {
    currentUser = JSON.parse(savedUser)

    document.getElementById("authBox").style.display = "none"
    document.getElementById("logoutBtn").style.display = "block"

    loadSubjects()
    loadProgress()

    let savedPlan = localStorage.getItem("savedTimetable")
    let savedDay = localStorage.getItem("currentDayIndex")

    if (savedPlan) {
      fullTimetable = JSON.parse(savedPlan)
      currentDayIndex = Number(savedDay || 0)

      showSingleDayPlanner()
    }
  }
}