let subjects = [];

// ADD SUBJECT
function addSubject() {
    const container = document.getElementById("subjects-container");

    const div = document.createElement("div");
    div.classList.add("subject-row");

    div.innerHTML = `
        <input placeholder="Subject Name" class="name">
        <input type="date" class="date">
        <input type="number" placeholder="Hours" class="hours">
        <input type="number" placeholder="Weightage" class="weight">
        <input type="number" placeholder="Difficulty (1-5)" class="difficulty">
        <button onclick="this.parentElement.remove()">Delete</button>
    `;

    container.appendChild(div);
}

// GENERATE PLAN
function generatePlan() {
    subjects = [];

    const rows = document.querySelectorAll(".subject-row");

    rows.forEach(row => {
        const name = row.querySelector(".name").value;
        const date = row.querySelector(".date").value;
        const hours = Number(row.querySelector(".hours").value);
        const weight = Number(row.querySelector(".weight").value);
        const difficulty = Number(row.querySelector(".difficulty").value);

        if (!name || !date || !hours) return;

        const today = new Date();
        const examDate = new Date(date);

        const diffDays = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

        const dailyStudy = (hours * weight * difficulty) / (diffDays || 1);
        const revision = dailyStudy * 0.3;

        subjects.push({
            name,
            daysLeft: diffDays,
            study: dailyStudy.toFixed(1),
            revision: revision.toFixed(1)
        });
    });

    renderOutput();
    updateAnalytics();
}

// OUTPUT UI
function renderOutput() {
    const output = document.getElementById("output");
    output.innerHTML = "";

    subjects.forEach(sub => {
        output.innerHTML += `
            <div class="card">
                <h3>${sub.name}</h3>
                <p>Days Left: ${sub.daysLeft}</p>
                <p>Today's Study: ${sub.study} hrs</p>
                <p>Revision: ${sub.revision} hrs</p>
            </div>
        `;
    });
}

// ANALYTICS + PROGRESS
function updateAnalytics() {
    let totalSubjects = subjects.length;
    let totalHours = 0;

    subjects.forEach(s => {
        totalHours += Number(s.study);
    });

    document.getElementById("totalSubjects").innerText = totalSubjects;
    document.getElementById("totalHours").innerText = totalHours.toFixed(1);

    // progress fake logic (demo)
    let progress = totalSubjects > 0 ? 20 * totalSubjects : 0;
    document.getElementById("progress").innerText = progress + "%";

    // badges
    const badge = document.getElementById("badges");
    if (progress > 50) {
        badge.innerText = "🔥 Consistent Learner";
    } else {
        badge.innerText = "No badges yet";
    }
}