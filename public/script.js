// ===== GLOBAL DATA =====
let subjects = [];
let history = JSON.parse(localStorage.getItem("studyData")) || [];

// ===== HELPER: FORMAT HOURS =====
function formatTime(hours) {
    let h = Math.floor(hours);
    let m = Math.round((hours - h) * 60);
    return `${h} hr ${m} min`;
}

// ===== ADD SUBJECT ROW =====
function addSubject() {
    const container = document.getElementById("subjects-container");

    const div = document.createElement("div");
    div.className = "subject-row";

    div.innerHTML = `
        <input placeholder="Subject Name" class="name">
        <input type="date" class="date">
        <input type="number" placeholder="Total Study Hours" class="hours">
        <input type="number" placeholder="Weightage" class="weight">
        <input type="number" placeholder="Difficulty (1-5)" class="difficulty">
        <button onclick="this.parentElement.remove()">Delete</button>
    `;

    container.appendChild(div);
}

// ===== GENERATE AI PLAN =====
function generatePlan() {
    subjects = [];
    const rows = document.querySelectorAll(".subject-row");

    rows.forEach(row => {
        const name = row.querySelector(".name").value.trim();
        const date = row.querySelector(".date").value;
        const hours = Number(row.querySelector(".hours").value);
        const weight = Number(row.querySelector(".weight").value);
        const difficulty = Number(row.querySelector(".difficulty").value);

        if (!name || !date || !hours) return;

        const today = new Date();
        const examDate = new Date(date);

        const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

        if (daysLeft <= 0) return;

        // BASE CALCULATION
        let dailyStudy = (hours * (weight || 1) * (difficulty || 1)) / daysLeft;

        // MISSED TASK CARRY FORWARD
        const prev = history.find(h => h.name === name);
        if (prev && prev.remaining > 0) {
            dailyStudy += prev.remaining / daysLeft;
        }

        const revision = dailyStudy * 0.3;

        subjects.push({
            name,
            daysLeft,
            study: dailyStudy,
            revision,
            remaining: hours - dailyStudy
        });
    });

    // SAVE DATA
    localStorage.setItem("studyData", JSON.stringify(subjects));

    renderPlan();
    generateTimetable();
    updateDashboard();
}

// ===== SHOW STUDY PLAN =====
function renderPlan() {
    const output = document.getElementById("output");
    output.innerHTML = "";

    subjects.forEach(sub => {
        output.innerHTML += `
            <div class="card">
                <h3>${sub.name}</h3>
                <p>Days Left: ${sub.daysLeft}</p>
                <p>Study: ${formatTime(sub.study)}</p>
                <p>Revision: ${formatTime(sub.revision)}</p>
            </div>
        `;
    });
}

// ===== DAILY TIMETABLE =====
function generateTimetable() {
    const table = document.getElementById("timetable");
    table.innerHTML = "";

    let startHour = 9;

    subjects.forEach(sub => {
        let duration = sub.study;
        let end = startHour + duration;

        table.innerHTML += `
            <div class="card">
                <p><b>${sub.name}</b></p>
                <p>${Math.floor(startHour)}:00 - ${Math.floor(end)}:00</p>
            </div>
        `;

        startHour = Math.ceil(end);
    });
}

// ===== DASHBOARD UPDATE =====
function updateDashboard() {
    let totalSubjects = subjects.length;
    let totalHours = 0;
    let totalDays = 0;

    subjects.forEach(s => {
        totalHours += s.study;
        totalDays += s.daysLeft;
    });

    document.getElementById("totalSubjects").innerText = totalSubjects;
    document.getElementById("totalHours").innerText = formatTime(totalHours);
    document.getElementById("daysLeft").innerText = totalDays;

    // PROGRESS CALCULATION
    let progress = totalSubjects ? (100 - (totalDays / (totalSubjects * 10)) * 100) : 0;
    progress = Math.max(0, Math.min(100, progress));

    document.getElementById("progress").innerText = progress.toFixed(0) + "%";

    // BADGES
    const badge = document.getElementById("badges");

    if (progress > 80) badge.innerText = "🏆 Top Performer";
    else if (progress > 50) badge.innerText = "🔥 Consistent";
    else badge.innerText = "📘 Beginner";
}