const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

mongoose.connect("mongodb+srv://jyoshna:sasmal1814@cluster0.0fnvv0m.mongodb.net/studyplanner")

.then(()=>{

console.log("MongoDB connected")

})

.catch(err=>{

console.log(err)

})

const UserSchema = new mongoose.Schema({
username:String,
password:String,
difficulty: Number,
weightage: Number
})

const User = mongoose.model("User", UserSchema)

// SUBJECT SCHEMA
const SubjectSchema = new mongoose.Schema({
user:String,
name:String,
difficulty: Number,
weightage: Number
})

const Subject = mongoose.model("Subject",SubjectSchema)

// SIGNUP API
app.post("/signup", async (req,res)=>{

const {username,password} = req.body

const existingUser = await User.findOne({username})

if(existingUser){
return res.json({message:"User already exists"})
}

const newUser = new User({
username,
password
})

await newUser.save()

res.json({message:"Signup successful"})

})

// LOGIN API
app.post("/login", async (req,res)=>{

const {username,password} = req.body

const user = await User.findOne({username,password})

if(!user){
return res.json({message:"Invalid login"})
}

res.json({message:"Login successful",user})

})

// ADD SUBJECT
app.post("/add-subject", async (req,res)=>{

const { user, name, difficulty, weightage } = req.body

const newSubject = new Subject({
    user,
    name,
    difficulty,
    weightage
})
await newSubject.save()

res.json({message:"Subject added"})

})
// GET SUBJECTS
app.get("/subjects/:user", async (req,res)=>{

const subjects = await Subject.find({user:req.params.user})

res.json(subjects)

})
// DELETE SUBJECT
app.delete("/delete-subject/:id", async (req,res)=>{

await Subject.findByIdAndDelete(req.params.id)

res.json({message:"Subject deleted"})

})
// EDIT SUBJECT
app.put("/edit-subject/:id", async (req,res)=>{

await Subject.findByIdAndUpdate(

req.params.id,
{name:req.body.name}

)

res.json({message:"Subject updated"})

})
// AI STUDY PLAN GENERATOR 

const subjects = req.body.subjects
const examDate = new Date(req.body.examDate)
const hoursPerDay = Number(req.body.hoursPerDay)

const today = new Date()

const daysLeft = Math.ceil((examDate - today)/(1000*60*60*24))

let timetable = []

for(let i=1;i<=daysLeft;i++){

let dailyPlan=[]

subjects.forEach(sub=>{

let hours = (hoursPerDay / subjects.length).toFixed(1)

dailyPlan.push({
subject:sub.name,
hours:hours
})

})

timetable.push({
day:i,
plan:dailyPlan
})

}

res.json({
timetable:timetable
})

app.post("/generate-timetable", (req, res) => {

    const { subjects, examDate, hoursPerDay } = req.body

    const today = new Date()
    const exam = new Date(examDate)

    const daysLeft = Math.ceil((exam - today) / (1000 * 60 * 60 * 24))

    let timetable = []

    // STEP 1: Calculate score
    let totalScore = 0

    subjects.forEach(s => {
        s.score = (s.difficulty || 1) * (s.weightage || 1)
        totalScore += s.score
    })

    // STEP 2: Generate dynamic plan
    for (let d = 1; d <= daysLeft; d++) {

        let dayPlan = []

        subjects.forEach(s => {

            // 🔥 PRIORITY BOOST (closer to exam → more focus)
            let urgencyFactor = 1 + (d / daysLeft)

            // 🔥 REVISION MODE (last 30% days)
            let revisionBoost = d > daysLeft * 0.7 ? 1.5 : 1

            // 🔥 FINAL SCORE
            let adjustedScore = s.score * urgencyFactor * revisionBoost

            let hours = (adjustedScore / totalScore) * hoursPerDay

            dayPlan.push({
                subject: s.name,
                hours: hours.toFixed(2)
            })
        })

        // 🔥 SORT: Hardest first
        dayPlan.sort((a, b) => b.hours - a.hours)

        timetable.push({
            day: d,
            plan: dayPlan
        })
    }

    res.json({
        daysLeft,
        timetable
    })
})

const axios = require("axios");

app.post("/ai-plan", async (req, res) => {
    const { subjects, examDate, hoursPerDay } = req.body;

    const prompt = `
Create a highly optimized study plan.

Subjects: ${JSON.stringify(subjects)}
Exam Date: ${examDate}
Daily Available Hours: ${hoursPerDay}

Rules:
1. Hard subjects should get more time.
2. Subjects with high weightage should appear earlier.
3. Include revision slots.
4. Format result in clean HTML.
5. Show Day 1, Day 2, Day 3... until exam date.
`;

    try {
        const result = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
            },
            {
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        res.json({ plan: result.data.choices[0].message.content });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "AI generation failed." });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
console.log("Server running on port", PORT)
})