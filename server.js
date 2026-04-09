const express = require("express");
const path = require("path");
const mongoose = require("mongoose");

const DailyStatus = require("./models/DailyStatus");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// 🔥 CONNECT MONGODB
mongoose.connect("mongodb+srv://jyoshna:sasmal1814@cluster0.0fnvv0m.mongodb.net/studyplanner?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// ROUTES

app.get("/api/data", async (req, res) => {
  const today = new Date().toDateString();

  let data = await DailyStatus.findOne({ date: today });

  if (!data) {
    data = await DailyStatus.create({
      date: today,
      tasks: [],
      studyTime: "0h",
      streak: 0
    });
  }

  // 🔥 CALCULATE PROGRESS
  const total = data.tasks.length;
  const completed = data.tasks.filter(t => t.completed).length;

  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  // 🔥 UPDATE STREAK (basic logic)
  if (completed > 0) {
    data.streak = data.streak + 1;
    await data.save();
  }

  res.json({
    ...data.toObject(),
    progress,
    total,
    completed
  });
});
// Add task
app.post("/api/task", async (req, res) => {
  const today = new Date().toDateString();
  const { title } = req.body;

  let data = await DailyStatus.findOne({ date: today });

  if (!data) {
    data = await DailyStatus.create({ date: today, tasks: [] });
  }

  data.tasks.push({ title });
  await data.save();

  res.json(data);
});

// Toggle task
app.put("/api/task/:index", async (req, res) => {
  const today = new Date().toDateString();

  let data = await DailyStatus.findOne({ date: today });

  data.tasks[req.params.index].completed =
    !data.tasks[req.params.index].completed;

  await data.save();

  res.json(data);
});

// Serve frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});