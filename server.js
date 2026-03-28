const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log(err))

// Schemas
const SubjectSchema = new mongoose.Schema({
  user: String,
  name: String,
  difficulty: Number,
  weightage: Number,
  completedHours: { type: Number, default: 0 }
})

const Subject = mongoose.model("Subject", SubjectSchema)

// Generate Smart Timetable
app.post("/generate-timetable", async (req, res) => {
  const { subjects, examDate, hoursPerDay } = req.body

  const today = new Date()
  const exam = new Date(examDate)
  const daysLeft = Math.max(1, Math.ceil((exam - today)/(1000*60*60*24)))

  let timetable = []

  // base score
  subjects.forEach(s => {
    s.baseScore = (s.weightage * 0.7) + (s.difficulty * 0.3)
  })

  for (let d = 1; d <= daysLeft; d++) {
    let dayPlan = []
    let dailyTotal = 0

    subjects.forEach(s => {
      let urgency = 1 + (d / daysLeft)
      let revision = d > daysLeft * 0.7 ? 1.5 : 1

      s.adjusted = s.baseScore * urgency * revision

      // weak subject boost
      if (s.difficulty >= 4) s.adjusted *= 1.2

      dailyTotal += s.adjusted
    })

    subjects.forEach(s => {
      let hours = (s.adjusted / dailyTotal) * hoursPerDay

      // cap
      if (hours > 3) hours = 3

      dayPlan.push({
        subject: s.name,
        hours: Number(hours.toFixed(2))
      })
    })

    timetable.push({ day: d, plan: dayPlan })
  }

  res.json({ daysLeft, timetable })
})

// Track Progress
app.post("/update-progress", async (req, res) => {
  const { subjectName, hours } = req.body

  const subject = await Subject.findOne({ name: subjectName })
  subject.completedHours += hours
  await subject.save()

  res.json({ message: "Progress updated" })
})

// Get Progress
app.get("/progress/:user", async (req, res) => {
  const subjects = await Subject.find({ user: req.params.user })

  let totalAssigned = 0
  let totalCompleted = 0

  subjects.forEach(s => {
    totalAssigned += (s.weightage * s.difficulty)
    totalCompleted += s.completedHours
  })

  let progress = (totalCompleted / totalAssigned) * 100

  res.json({ progress: progress.toFixed(2), subjects })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})


