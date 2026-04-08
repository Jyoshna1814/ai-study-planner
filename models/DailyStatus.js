const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  completed: { type: Boolean, default: false }
});

const dailyStatusSchema = new mongoose.Schema({
  date: String,
  tasks: [taskSchema],
  studyTime: String,
  streak: Number
});

module.exports = mongoose.model("DailyStatus", dailyStatusSchema);