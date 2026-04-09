const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static("public"));

mongoose.connect("YOUR_MONGODB_URL")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const taskSchema = new mongoose.Schema({
    subject: String,
    task: String,
    examDate: String,
    availableHours: Number,
    weightage: Number,
    difficulty: Number,
    completed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Task = mongoose.model("Task", taskSchema);

function generatePriority(task) {
    const daysLeft = Math.ceil(
        (new Date(task.examDate) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
        task.weightage * 3 +
        task.difficulty * 2 +
        (30 - daysLeft)
    );
}

app.post("/add-task", async (req, res) => {
    const newTask = new Task(req.body);
    await newTask.save();
    res.json({ message: "Task Added" });
});

app.get("/planner", async (req, res) => {
    const tasks = await Task.find({ completed: false });

    const planner = tasks
        .map(task => ({
            ...task._doc,
            priority: generatePriority(task)
        }))
        .sort((a, b) => b.priority - a.priority);

    res.json(planner);
});

app.put("/complete-task/:id", async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, {
        completed: true
    });

    res.json({ message: "Task Completed" });
});

app.put("/edit-task/:id", async (req, res) => {
    await Task.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: "Task Updated" });
});

app.delete("/delete-task/:id", async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task Deleted" });
});

app.listen(10000, () => {
    console.log("Server running on 10000");
});