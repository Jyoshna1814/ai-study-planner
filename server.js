const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"))
})

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log("Mongo Error:", err))


const SubjectSchema = new mongoose.Schema({
  user: String,
  name: String,
  difficulty: Number,
  weightage: Number,
  completedHours: { type: Number, default: 0 }
})

const Subject = mongoose.model("Subject", SubjectSchema)

const UserSchema = new mongoose.Schema({
  username: String,
  password: String
})

const User = mongoose.model("User", UserSchema)

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body

    const existing = await User.findOne({ username })
    if (existing) {
      return res.json({ message: "User already exists" })
    }

    const user = new User({ username, password })
    await user.save()

    res.json({ message: "Signup successful" })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Signup failed" })
  }
})

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username, password })

    if (!user) {
      return res.json({ message: "Invalid credentials" })
    }

    res.json({
      message: "Login successful",
      user: { username }
    })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Login failed" })
  }
})

app.post("/generate-timetable", async (req, res) => {
  try {

    let { subjects, examDate, hoursPerDay } = req.body
    hoursPerDay = Number(hoursPerDay)

    const today = new Date()
    const exam = new Date(examDate)

    const daysLeft = Math.max(1, Math.ceil((exam - today)/(1000*60*60*24)))

    let timetable = []

  
    subjects.forEach(s => {

  s.completedHours = Number(s.completedHours) || 0

  const weight = Number(s.weightage) || 1
  const diff = Number(s.difficulty) || 1

  // total target hours per subject
  const targetHours = (weight * 2) + (diff * 2)

  // remaining target after completed session
  const remainingHours = Math.max(0, targetHours - s.completedHours)

  // smart score based on remaining target
  s.baseScore = (remainingHours * 0.7) + (diff * 0.3)

  // difficult subjects priority
  if (diff >= 4) s.baseScore *= 1.4

  // missed target boost
  if (remainingHours > 5) s.baseScore *= 1.3

  // revision boost
  if (s.completedHours > 0) s.baseScore *= 1.1
})
  
    for (let d = 1; d <= daysLeft; d++) {

      let dayPlan = []
      let totalScore = 0

      subjects.forEach(s => {

  const weight = Number(s.weightage) || 1
  const diff = Number(s.difficulty) || 1

  let urgency = 1 + (d / daysLeft)

  let subjectFactor = (weight * 0.7) + (diff * 0.3)

  let revision = d > daysLeft * 0.7 ? 1.5 : 1

  let adjusted = s.baseScore * urgency * revision * subjectFactor


  if(diff >= 4) adjusted *= 1.3

  s.adjusted = adjusted
  totalScore += adjusted
})
      subjects.forEach(s => {

        let hours = 0

        if(totalScore > 0){
          hours = (s.adjusted / totalScore) * hoursPerDay
        }

        dayPlan.push({
          id: s._id,  
          subject: s.name,
          hours: Number(hours.toFixed(2))
        })

      })


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

app.get("/subjects/:user", async (req, res) => {
  const subjects = await Subject.find({ user: req.params.user })
  res.json(subjects)
})
// DELETE SUBJECT
app.delete("/delete-subject/:id", async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id)
    res.json({ message: "Deleted" })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Delete failed" })
  }
})
app.post("/add-subject", async (req, res) => {
  try {

    const { user, name, difficulty, weightage } = req.body

    const newSubject = new Subject({
      user,
      name,
      difficulty: Number(difficulty),
      weightage: Number(weightage)
    })

    await newSubject.save()

    res.json({ message: "Subject added" })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Add subject failed" })
  }
})

app.post("/update-progress", async (req, res) => {
  try {

    const { subjectName, hours, user } = req.body

    if(!user){
      return res.json({ message: "User missing" })
    }

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

app.get("/progress/:user", async (req, res) => {
  try {

    const subjects = await Subject.find({ user: req.params.user })
  
    if (!subjects || subjects.length === 0) {
      return res.json({ progress: 0, subjects: [] })
    }

    let totalAssigned = 0
    let totalCompleted = 0

    subjects.forEach(s => {

    
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

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log("Server running on port", PORT)
})