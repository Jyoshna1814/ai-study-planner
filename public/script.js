let currentUser = null
let chart;

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

if(data.user){

currentUser = data.user

localStorage.setItem("user", JSON.stringify(currentUser))

document.getElementById("authBox").style.display="none"
document.getElementById("logoutBtn").style.display="block"

loadSubjects()
loadProgress()

}
else{
alert(data.message || "Login failed ❌")
}

})
}
function logout(){
localStorage.removeItem("user")
location.reload()
}

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
.then(res=>res.json())
.then(data=>{
alert("Subject added ✅")
loadSubjects()
})

}
function loadSubjects(){
fetch("/subjects/"+currentUser.username)
.then(res=>res.json())
.then(data=>{
let list=document.getElementById("subjectList")
list.innerHTML=""

data.forEach(sub=>{
let li=document.createElement("li")

li.innerHTML = `
${sub.name} 
<button onclick="editSubject('${sub._id}','${sub.name}')">Edit</button>
<button onclick="deleteSubject('${sub._id}')">Delete</button>
`
list.appendChild(li)
})
})
}
function deleteSubject(id){
fetch("/delete-subject/" + id, { method: "DELETE" })
.then(()=> loadSubjects())
}

function editSubject(id,name){
let newName = prompt("Edit subject", name)

fetch("/edit-subject/" + id, {
method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({ name:newName })
})
.then(()=> loadSubjects())
}
function formatTime(hours){
  let totalMinutes = Math.round(hours * 60)

  let hr = Math.floor(totalMinutes / 60)
  let min = totalMinutes % 60

  if(hr === 0){
    return `${min} min`
  }

  return `${hr} hr ${min} min`
}
async function generateTimetable(){

  const res = await fetch("/subjects/" + currentUser.username)
  const subjects = await res.json()

  const examDate = document.getElementById("examDate").value
  const hoursPerDay = Number(document.getElementById("studyHours").value)

  const response = await fetch("/generate-timetable",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({subjects, examDate, hoursPerDay})
  })

  const data = await response.json()

  let result = document.getElementById("planResult")
  result.innerHTML = ""

  let calendarContainer = document.createElement("div")
calendarContainer.style.display = "grid"
calendarContainer.style.gridTemplateColumns = "repeat(2, 1fr)"
calendarContainer.style.gap = "10px"

data.timetable.slice(0, 7).forEach(day=>{
  let card = document.createElement("div")
  card.style.border = "1px solid #ccc"
  card.style.padding = "10px"
  card.style.borderRadius = "10px"
  card.style.background = "#f9f9f9"

  card.innerHTML = `<h3>📅 Day ${day.day}</h3>`

  day.plan.forEach(p=>{
    card.innerHTML += `
      ${p.subject} - ${formatTime(p.hours)}<br>
    `
  })

  calendarContainer.appendChild(card)
})

result.appendChild(calendarContainer)

let missedDiv = document.createElement("div")
missedDiv.innerHTML = `<h3>⚠ Remaining Target</h3>`

subjects.forEach(s=>{
  let remaining = (s.weightage * 2 + s.difficulty * 2) - (s.completedHours || 0)

  if(remaining > 0){
    missedDiv.innerHTML += `${s.name} - ${remaining.toFixed(1)} hr left <br>`
  }
})

result.appendChild(missedDiv)
let revisionDiv = document.createElement("div")
revisionDiv.innerHTML = `<h3>🔁 Revision Planner</h3>`

subjects.forEach(s=>{
  if((s.completedHours || 0) > 0){
    revisionDiv.innerHTML += `${s.name} - 30 min revision <br>`
  }
})

result.appendChild(revisionDiv)
  if(data.timetable.length > 7){
  let extra = document.createElement("div")
  extra.innerHTML = `<h3>+ ${data.timetable.length - 7} more days remaining</h3>`
  result.appendChild(extra)
}
  showChart(data.timetable[data.timetable.length - 1].plan)
}
async function markDone(subject, hours){

  const res = await fetch("/update-progress",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      subjectName: subject,
      hours: Number(hours),
      user: currentUser.username
    })
  })

  const data = await res.json()

  alert("✅ Session completed successfully!")

  await loadProgress()

  await generateTimetable()
}
async function loadProgress(){

  const res = await fetch("/progress/" + currentUser.username)
  const data = await res.json()

  const bar = document.getElementById("progressBar")

  const progressValue = Number(data.progress)

  bar.style.width = progressValue + "%"
  bar.innerText = progressValue.toFixed(2) + "%"
}
function showChart(plan){

  const canvas = document.getElementById("progressChart")

  if(!canvas){
    console.log("Chart canvas not found")
    return
  }

  const ctx = canvas.getContext("2d")

  let labels = plan.map(p => p.subject)
  let values = plan.map(p => p.hours)

  if(chart){
    chart.destroy()
  }

  chart = new Chart(ctx,{
    type:'bar',
    data:{
      labels: labels,
      datasets:[{
        label:'Study Hours',
        data: values
      }]
    }
  })
}
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