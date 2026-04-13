document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("generateBtn");

    btn.addEventListener("click", generatePlan);
});

function generatePlan() {
    const subject = document.getElementById("subject").value;
    const task = document.getElementById("task").value;
    const examDate = document.getElementById("examDate").value;
    const hours = document.getElementById("hours").value;
    const weightage = document.getElementById("weightage").value;
    const difficulty = document.getElementById("difficulty").value;

    const output = document.getElementById("planner-output");

    if (!subject || !task) {
        output.innerHTML = "<p style='color:red'>Please fill all details</p>";
        return;
    }

    const daysLeft = Math.ceil(
        (new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const priority =
        Number(weightage) * 3 +
        Number(difficulty) * 2 +
        (30 - daysLeft);

    output.innerHTML = `
        <div class="task-card">
            <h3>${subject}</h3>
            <p><b>Task:</b> ${task}</p>
            <p><b>Study Hours:</b> ${hours}</p>
            <p><b>Exam Date:</b> ${examDate}</p>
            <p><b>Days Left:</b> ${daysLeft}</p>
            <p><b>Priority Score:</b> ${priority}</p>
        </div>
    `;
}