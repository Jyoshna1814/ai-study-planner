const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()
app.use(cors())
app.use(express.json())

// ================= DB CONNECT =================
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log("Mongo Error:", err))

// ================= SCHEMA =================
const SubjectSchema = new mongoose.Schema({
  user: String,
  name: String,
  difficulty: Number,
  weightage: Number,
  completedHours: { type: Number, default: 0 }
})

const Subject = mongoose.model("Subject", SubjectSchema)

// ================= GENERATE SMART TIMETABLE =================
app.post("/generate-timetable", async (req, res) => {
  try {

    let { subjects, examDate, hoursPerDay } = req.body
    hoursPerDay = Number(hoursPerDay)

    const today = new Date()
    const exam = new Date(examDate)

    const daysLeft = Math.max(1, Math.ceil((exam - today)/(1000*60*60*24)))

    let timetable = []

    // 🔥 STEP 1: Calculate base score
    subjects.forEach(s => {

      s.completedHours = s.completedHours || 0

      s.baseScore = (s.weightage * 0.6) + (s.difficulty * 0.4)

      // 🔥 Missed target boost
      if (s.completedHours < 2) {
        s.baseScore *= 1.3
      }

    })

    // ================= DAILY PLAN =================
    for (let d = 1; d <= daysLeft; d++) {

      let dayPlan = []
      let totalScore = 0

      subjects.forEach(s => {

        let urgency = 1 + (d / daysLeft)
        let revision = d > daysLeft * 0.7 ? 1.5 : 1

        let adjusted = s.baseScore * urgency * revision

        // weak subject boost
        if (s.difficulty >= 4) adjusted *= 1.2

        s.adjusted = adjusted
        totalScore += adjusted

      })

      subjects.forEach(s => {

        let hours = (s.adjusted / totalScore) * hoursPerDay

        // cap max hours per subject
        if (hours > 3) hours = 3

        dayPlan.push({
          subject: s.name,
          hours: Number(hours.toFixed(2))
        })

      })

      // sort by priority
      dayPlan.sort((a,b)=> b.hours - a.hours)

      timetable.push({
        day: d,
        plan: dayPlan
      })
    }

    res.json({ daysLeft, timetable })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Timetable generation failed" })
  }
})


// ================= UPDATE PROGRESS =================
app.post("/update-progress", async (req, res) => {
  try {

    const { subjectName, hours, user } = req.body

    const subject = await Subject.findOne({
      name: subjectName,
      user: user
    })

    if (!subject) {
      return res.json({ message: "Subject not found" })
    }

    subject.completedHours += Number(hours)
    await subject.save()

    res.json({ message: "Progress updated" })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Progress update failed" })
  }
})


// ================= GET PROGRESS =================
app.get("/progress/:user", async (req, res) => {
  try {

    const subjects = await Subject.find({ user: req.params.user })

    let totalAssigned = 0
    let totalCompleted = 0

    subjects.forEach(s => {

      // realistic expected hours
      let expected = (s.weightage * 2 + s.difficulty * 2)

      totalAssigned += expected
      totalCompleted += s.completedHours
    })

    let progress = 0

    if (totalAssigned > 0) {
      progress = (totalCompleted / totalAssigned) * 100
    }

    res.json({
      progress: progress.toFixed(2),
      subjects
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Progress fetch failed" })
  }
})


// ================= SERVER =================
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})