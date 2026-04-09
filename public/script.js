async function addTask() {
    const data = {
        subject: document.getElementById("subject").value,
        task: document.getElementById("task").value,
        examDate: document.getElementById("examDate").value,
        availableHours: Number(document.getElementById("hours").value),
        weightage: Number(document.getElementById("weightage").value),
        difficulty: Number(document.getElementById("difficulty").value)
    };

    await fetch("/add-task", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    loadPlanner();
}

async function loadPlanner() {
    const res = await fetch("/planner");
    const tasks = await res.json();

    const output = document.getElementById("planner-output");

    output.innerHTML = tasks.map(task => `
        <div class="task-card">
            <h3>${task.subject}</h3>
            <p>${task.task}</p>
            <p>Priority: ${task.priority}</p>
            <p>Exam: ${task.examDate}</p>
            <button onclick="completeTask('${task._id}')">Complete</button>
        </div>
    `).join("");
}

async function completeTask(id) {
    await fetch(`/complete-task/${id}`, {
        method: "PUT"
    });

    loadPlanner();
}

loadPlanner();