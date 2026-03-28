let currentUser = null
let chart;

// ================= AUTH =================
function signup(){
let username = document.getElementById("username").value
let password = document.getElementById("password").value

fetch("/signup",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,password})
})
.then(res=>res.json())
.then(data=> alert(data.message))
}

function login(){
let username = document.getElementById("username").value
let password = document.getElementById("password").value

fetch("/login",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,password})
})
.then(res=>res.json())
.then(data=>{
if(data.message=="Login successful"){
currentUser=data.user
localStorage.setItem("user", JSON.stringify(currentUser))

document.getElementById("authBox").style.display="none"
document.getElementById("logoutBtn").style.display="block"

loadSubjects()
loadProgress()
}
else alert("Login failed")
})
}

function logout(){
localStorage.removeItem("user")
location.reload()
}

// ================= SUBJECT =================
function addSubject(){
let subject = document.getElementById("subjectInput").value
let difficulty = document.getElementById("difficultyInput").value
let weightage = document.getElementById("weightageInput").value

fetch("/add-subject",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
user: currentUser.username,
name: subject,
difficulty: Number(difficulty),
weightage: Number(weightage)
})
})
.then(()=> loadSubjects())
}

function loadSubjects(){
fetch("/subjects/"+currentUser.username)
.then(res=>res.json())
.then(data=>{
let list=document.getElementById("subjectList")
list.innerHTML=""

data.forEach(sub=>{
let li=document.createElement("li")
li.innerHTML = sub.name
list.appendChild(li)
})
})
}

// ================= TIMETABLE =================
async function generateTimetable(){

const res = await fetch("/subjects/" + currentUser.username)
let subjects = await res.json()
subjects = subjects.map(s => ({
  name: s.name,
  difficulty: Number(s.difficulty) || 1,
  weightage: Number(s.weightage) || 1,
  completedHours: s.completedHours || 0
}))

// 🔥 apply missed recovery
subjects.forEach(s=>{
if(s.completedHours < 2){
s.difficulty += 1
}
})

const examDate = document.getElementById("examDate").value
const hoursPerDay = Number(document.getElementById("studyHours").value)
const response = await fetch("/generate-timetable",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({subjects, examDate, hoursPerDay})
})

const data = await response.json()

let result = document.getElementById("planResult")
result.innerHTML=""

data.timetable.forEach(day=>{
let div = document.createElement("div")
div.innerHTML = `<h3>Day ${day.day}</h3>`

day.plan.forEach(p=>{
div.innerHTML += `${p.subject} - ${p.hours}h 
<button onclick="markDone('${p.subject}',${p.hours})">Done</button><br>`
})

result.appendChild(div)
})

showChart(data.timetable[data.timetable.length-1].plan)
}

// ================= PROGRESS =================
async function markDone(subject, hours){

await fetch("/update-progress",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({
  subjectName: subject,
  hours: Number(hours),
  user: currentUser.username
})
})
alert("Done marked ✅")
loadProgress()
}
async function loadProgress(){

const res = await fetch("/progress/" + currentUser.username)
const data = await res.json()

let bar = document.getElementById("progressBar")

bar.style.width = data.progress + "%"
bar.innerText = data.progress + "%"
}

// ================= CHART =================
function showChart(plan){

let labels = plan.map(p=>p.subject)
let values = plan.map(p=>p.hours)

const ctx = document.getElementById("progressChart").getContext("2d")

if(chart){
chart.destroy()
}

chart = new Chart(ctx,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'Study Hours',
data:values
}]
}
})
}

// ================= TIMER =================
let timer
let timeLeft = 25 * 60

function updateTimer(){
let minutes = Math.floor(timeLeft / 60)
let seconds = timeLeft % 60

document.getElementById("timer").textContent =
minutes.toString().padStart(2,"0") + ":" +
seconds.toString().padStart(2,"0")
}

function startTimer(){
if(timer) return
timer = setInterval(()=>{
timeLeft--
updateTimer()
if(timeLeft <= 0){
clearInterval(timer)
timer=null
alert("Session complete!")
}
},1000)
}

function stopTimer(){
clearInterval(timer)
timer=null
}

function resetTimer(){
clearInterval(timer)
timer=null
timeLeft = 25 * 60
updateTimer()
}

updateTimer()

// ================= AUTO LOGIN =================
window.onload = function(){
let savedUser = localStorage.getItem("user")

if(savedUser){
currentUser = JSON.parse(savedUser)
document.getElementById("authBox").style.display="none"
document.getElementById("logoutBtn").style.display="block"

loadSubjects()
loadProgress()
}
}