// ========================= AUTH SYSTEM =========================

function signup() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    if (!username || !password) {
        alert("Username & Password required");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users") || "{}");

    if (users[username]) {
        alert("User already exists!");
        return;
    }

    users[username] = { password, subjects: [], progress: 0 };
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
}

function login() {
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();

    let users = JSON.parse(localStorage.getItem("users") || "{}");

    if (!users[username] || users[username].password !== password) {
        alert("Invalid credentials!");
        return;
    }

    localStorage.setItem("currentUser", username);

    document.getElementById("authScreen").classList.remove("active-screen");
    document.getElementById("homeScreen").classList.add("active-screen");

    loadUser();
}

function logout() {
    localStorage.removeItem("currentUser");

    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active-screen"));
    document.getElementById("authScreen").classList.add("active-screen");
}

// Load user dashboard
function loadUser() {
    let user = getUser();
    if (!user) return;

    document.getElementById("profileName").innerText = "Logged in as: " + localStorage.getItem("currentUser");

    updateProgress();
    loadSubjects();
}


// ========================= USER DATA HELPER =========================

function getUser() {
    let username = localStorage.getItem("currentUser");
    if (!username) return null;

    let users = JSON.parse(localStorage.getItem("users") || "{}");
    return users[username];
}

function saveUser(userData) {
    let username = localStorage.getItem("currentUser");
    let users = JSON.parse(localStorage.getItem("users") || "{}");

    users[username] = userData;
    localStorage.setItem("users", JSON.stringify(users));
}


// ========================= NAVIGATION =========================

function openScreen(id, title) {
    document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active-screen"));
    document.getElementById(id).classList.add("active-screen");
    document.getElementById("topbarTitle").innerText = title;
}


// ========================= SUBJECTS =========================

function loadSubjects() {
    let user = getUser();
    if (!user) return;

    let list = document.getElementById("subjectList");
    list.innerHTML = "";

    user.subjects.forEach((s, index) => {
        let li = document.createElement("li");
        li.innerHTML = `
            ${s.subject} - Difficulty: ${s.difficulty} - Weight: ${s.weight}%
            <button onclick="deleteSubject(${index})">❌</button>
        `;
        list.appendChild(li);
    });
}

function addSubject() {
    let subject = document.getElementById("subjectInput").value.trim();
    let difficulty = parseInt(document.getElementById("difficultyInput").value);
    let weight = parseInt(document.getElementById("weightageInput").value);

    if (!subject || !difficulty || !weight) {
        alert("Fill all fields!");
        return;
    }

    let user = getUser();
    user.subjects.push({ subject, difficulty, weight });
    saveUser(user);

    loadSubjects();
}

function deleteSubject(index) {
    let user = getUser();
    user.subjects.splice(index, 1);
    saveUser(user);

    loadSubjects();
}


// ========================= STUDY HOURS AI =========================

function calculateStudyHours() {
    let user = getUser();
    if (!user) return;

    let output = document.getElementById("study-result");

    let totalWeight = user.subjects.reduce((sum, s) => sum + s.weight, 0);
    let totalDifficulty = user.subjects.reduce((sum, s) => sum + s.difficulty, 0);

    let resultHTML = "<h3>📘 Recommended Study Hours</h3>";

    user.subjects.forEach(s => {
        let hours = ((s.weight / totalWeight) + (s.difficulty / totalDifficulty)) * 5;
        hours = hours.toFixed(1);

        resultHTML += `<p><b>${s.subject}</b> → ${hours} hrs/day</p>`;
    });

    output.innerHTML = resultHTML;
}


// ========================= AI TIMETABLE GENERATOR =========================

function generateTimetable() {
    let examDate = document.getElementById("examDate").value;
    let studyHours = parseInt(document.getElementById("studyHours").value);

    if (!examDate || !studyHours) {
        alert("Please enter exam date & daily hours");
        return;
    }

    let daysLeft = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24));

    let user = getUser();

    let result = `<h3>📅 Days Left: ${daysLeft}</h3>`;
    result += "<h3>📚 Study Plan</h3>";

    user.subjects.forEach(s => {
        let hrs = ((s.weight / 100) * studyHours).toFixed(1);
        result += `<p>${s.subject} → ${hrs} hrs/day</p>`;
    });

    document.getElementById("timetableResult").innerHTML = result;
}


// ========================= PROGRESS SYSTEM =========================

function updateProgress() {
    let user = getUser();
    if (!user) return;

    let progress = user.progress || 0;

    document.getElementById("progressBar").style.width = progress + "%";
    document.getElementById("progressBar").innerText = progress + "%";

    renderChart(progress);
}

// Chart.js Pie Chart
function renderChart(progress) {
    const ctx = document.getElementById("progressChart");

    new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Completed", "Remaining"],
            datasets: [{
                data: [progress, 100 - progress]
            }]
        }
    });
}


// ========================= POMODORO TIMER =========================

let timer;
let timeLeft = 1500; // 25 min

function updateTimer() {
    let min = Math.floor(timeLeft / 60);
    let sec = timeLeft % 60;

    document.getElementById("timer").innerText =
        `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timer);
            timer = null;
            alert("Session Completed!");
            return;
        }
        timeLeft--;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    clearInterval(timer);
    timer = null;
}

function resetTimer() {
    timeLeft = 1500;
    updateTimer();
}