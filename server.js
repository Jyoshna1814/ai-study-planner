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
password:String
})

const User = mongoose.model("User", UserSchema)

// SUBJECT SCHEMA
const SubjectSchema = new mongoose.Schema({
user:String,
name:String
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

const {user,subject} = req.body

const newSubject = new Subject({

user:user,
name:subject

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
app.post("/generate-timetable", (req,res)=>{

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

})
app.get("/", (req,res)=>{
res.sendFile(__dirname + "/public/index.html")
})

const PORT = process.env.PORT || 3000
app.post("/generate-timetable", (req,res)=>{

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

})
app.listen(PORT, () => {
console.log("Server running on port", PORT)
})