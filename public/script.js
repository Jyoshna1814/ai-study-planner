let streak = 5;

function addSubject() {
    let container = document.getElementById("subjectContainer");

    container.innerHTML += `
        <div class="subject-row">
            <input type="text" class="subject" placeholder="Subject Name">
            <input type="date" class="examDate">
            <input type="number" class="studyHours" placeholder="Hours">
            <input type="number" class="weightage" placeholder="Weightage">
            <input type="number" class="difficulty" placeholder="Difficulty">
            <button onclick="deleteSubject(this)">Delete</button>
        </div>
    `;
}

function deleteSubject(btn) {
    btn.parentElement.remove();
}

function generatePlan() {
    let subjects = document.querySelectorAll(".subject");
    let dates = document.querySelectorAll(".examDate");
    let hours = document.querySelectorAll(".studyHours");
    let weights = document.querySelectorAll(".weightage");
    let difficulties = document.querySelectorAll(".difficulty");

    let output = "";
    let totalHours = 0;

    for (let i = 0; i < subjects.length; i++) {
        let subject = subjects[i].value;
        let examDate = new Date(dates[i].value);
        let studyHour = parseInt(hours[i].value);
        let weight = parseInt(weights[i].value);
        let difficulty = parseInt(difficulties[i].value);

        let today = new Date();
        let daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));

        let requiredHours = Math.ceil((weight * difficulty) / daysLeft);

        if (requiredHours > studyHour) {
            requiredHours = studyHour;
        }

        let revision = Math.ceil(requiredHours * 0.3);

        totalHours += requiredHours;

        output += `
            <div class="card">
                <h3>${subject}</h3>
                <p>Days Left: ${daysLeft}</p>
                <p>Today's Study: ${requiredHours} hrs</p>
                <p>Revision: ${revision} hr</p>
            </div>
        `;

        document.getElementById("daysLeftBox").innerText = daysLeft;
    }

    document.getElementById("planOutput").innerHTML = output;

    document.getElementById("totalSubjects").innerText = subjects.length;
    document.getElementById("totalHours").innerText = totalHours;

    let progress = Math.min(100, totalHours * 10);
    document.getElementById("progressCircle").innerText = progress + "%";

    if (progress >= 80) {
        document.getElementById("badgeText").innerText = "🔥 Study Warrior Badge Unlocked";
    }
}