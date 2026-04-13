// ==========================
// LOCAL STORAGE DATA
// ==========================
let missedTasks = JSON.parse(localStorage.getItem("missedTasks")) || [];
let completedTasks = JSON.parse(localStorage.getItem("completedTasks")) || [];
let streak = parseInt(localStorage.getItem("streak")) || 5;

// ==========================
// UPDATE DASHBOARD
// ==========================
function updateDashboard() {
    document.getElementById("streakCount").innerText = `${streak} Day Streak 🔥`;

    let total = completedTasks.length + missedTasks.length;
    let progress = total === 0 ? 0 : Math.round((completedTasks.length / total) * 100);

    document.getElementById("progressCircle").innerText = `${progress}%`;

    let taskList = document.getElementById("taskList");
    if (taskList) {
        taskList.innerHTML = "";

        completedTasks.forEach(task => {
            taskList.innerHTML += `
                <div class="task-item completed">
                    ✅ ${task}
                </div>
            `;
        });

        missedTasks.forEach(task => {
            taskList.innerHTML += `
                <div class="task-item missed">
                    ❌ ${task}
                </div>
            `;
        });
    }
}

// ==========================
// GENERATE AI STUDY PLAN
// ==========================
function generatePlan() {
    const subject = document.getElementById("subject").value;
    const task = document.getElementById("task").value;
    const examDate = document.getElementById("examDate").value;
    const studyHours = parseInt(document.getElementById("studyHours").value);
    const weightage = parseInt(document.getElementById("weightage").value);
    const difficulty = parseInt(document.getElementById("difficulty").value);

    if (!subject || !task || !examDate || !studyHours || !weightage || !difficulty) {
        alert("Please fill all fields");
        return;
    }

    const today = new Date();
    const exam = new Date(examDate);

    const diffTime = exam - today;
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
        alert("Exam date must be future date");
        return;
    }

    let totalHoursNeeded = weightage * difficulty;
    let dailyHours = Math.ceil(totalHoursNeeded / daysLeft);

    if (dailyHours > studyHours) {
        dailyHours = studyHours;
    }

    let revisionHours = Math.ceil(dailyHours * 0.3);

    let tomorrowCarryTask = missedTasks.length > 0
        ? `<p><b>Missed Task Added:</b> ${missedTasks.join(", ")}</p>`
        : "";

    let finalPlan = `
        <div class="card">
            <h3>📚 AI Smart Study Plan</h3>
            <p><b>Subject:</b> ${subject}</p>
            <p><b>Main Task:</b> ${task}</p>
            <p><b>Days Left for Exam:</b> ${daysLeft}</p>
            <p><b>Today's Study Time:</b> ${dailyHours} hours</p>
            <p><b>Revision Time:</b> ${revisionHours} hour</p>
            ${tomorrowCarryTask}
            <button onclick="completeTask('${task}')">Mark Complete</button>
            <button onclick="missTask('${task}')">Miss Task</button>
        </div>
    `;

    document.getElementById("planOutput").innerHTML = finalPlan;

    saveTomorrowPlan(task, dailyHours, revisionHours, daysLeft);
}

// ==========================
// SAVE TOMORROW PLAN
// ==========================
function saveTomorrowPlan(task, hours, revision, daysLeft) {
    let tomorrow = {
        task: task,
        hours: hours,
        revision: revision,
        daysLeft: daysLeft - 1
    };

    localStorage.setItem("tomorrowPlan", JSON.stringify(tomorrow));
}

// ==========================
// COMPLETE TASK
// ==========================
function completeTask(taskName) {
    completedTasks.push(taskName);

    localStorage.setItem("completedTasks", JSON.stringify(completedTasks));

    streak += 1;
    localStorage.setItem("streak", streak);

    alert("Task completed successfully 🎉");

    updateDashboard();
}

// ==========================
// MISS TASK
// ==========================
function missTask(taskName) {
    missedTasks.push(taskName);

    localStorage.setItem("missedTasks", JSON.stringify(missedTasks));

    alert("Task moved to tomorrow plan");

    updateDashboard();
}

// ==========================
// RESET ALL DATA
// ==========================
function resetPlanner() {
    localStorage.clear();
    location.reload();
}

// ==========================
// LOAD ON START
// ==========================
window.onload = function () {
    updateDashboard();
};