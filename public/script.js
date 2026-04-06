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
  const totalStudyHoursLeft = data.daysLeft * hoursPerDay

  let result = document.getElementById("planResult")
  result.innerHTML = ""

  // CALENDAR GRID
  let calendarContainer = document.createElement("div")
  calendarContainer.className= "calendar-grid"

  data.timetable.slice(0,4).forEach(day=>{
    let div = document.createElement("div")
    div.className = "day-card"

    div.style.background = "white"
    div.style.color = "black"
    div.style.padding = "20px"
    div.style.borderRadius = "15px"
    div.style.boxShadow = "0 4px 10px rgba(0,0,0,0.2)"

    div.innerHTML = `<h3>📅 Day ${day.day}</h3>`

    day.plan.forEach(p=>{
      div.innerHTML += `
        <p>
          ${p.subject} - ${formatTime(p.hours)}
          <button onclick="markDone('${p.subject}', ${p.hours})">
            Done
          </button>
        </p>
      `
    })

    calendarContainer.appendChild(div)
  })

  result.appendChild(calendarContainer)

  // REMAINING TARGET
  let remainingDiv = document.createElement("div")
  remainingDiv.style.marginTop = "20px"
  remainingDiv.style.background = "white"
  remainingDiv.style.color = "black"
  remainingDiv.style.padding = "15px"
  remainingDiv.style.borderRadius = "15px"

  remainingDiv.innerHTML = "<h3>⚠ Remaining Target</h3>"
subjects.forEach(s => {
  let targetHours = (totalStudyHoursLeft * s.weightage) / 100

  let completedHours = Number(s.completedHours || 0)

  let remainingHours = Math.max(0, targetHours - completedHours)

  let completedPercent =
    targetHours > 0
      ? ((completedHours / targetHours) * 100).toFixed(1)
      : 0

  remainingDiv.innerHTML += `
    <p>
      <b>${s.name}</b> - 
      ${formatTime(remainingHours)} left 
      (${completedPercent}% completed)
    </p>
  `
})

  result.appendChild(remainingDiv)

  // REVISION PLANNER
  let revisionDiv = document.createElement("div")
  revisionDiv.style.marginTop = "20px"
  revisionDiv.style.background = "white"
  revisionDiv.style.color = "black"
  revisionDiv.style.padding = "15px"
  revisionDiv.style.borderRadius = "15px"

  revisionDiv.innerHTML = "<h3>🔁 Revision Planner</h3>"

  subjects.forEach(s=>{
    revisionDiv.innerHTML += `
      <p>${s.name} - 30 min revision</p>
    `
  })

  result.appendChild(revisionDiv)

  // EXTRA DAYS
if(data.daysLeft > 4){
  let extra = document.createElement("div")
  extra.style.marginTop = "20px"
  extra.innerHTML = `<h3>+ ${data.daysLeft - 4} more days remaining</h3>`
  result.appendChild(extra)
}

  showChart(data.timetable[data.timetable.length - 1].plan)
}
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

  alert("✅ Session completed successfully!")

  await loadProgress()

  setTimeout(() => {
    generateTimetable()
  }, 300)
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
  if(!canvas) return

  const ctx = canvas.getContext("2d")

  const labels = plan.map(p => p.subject)
  const values = plan.map(p => p.hours)

  const colors = [
    "#4CAF50",
    "#2196F3",
    "#FF9800",
    "#9C27B0",
    "#F44336"
  ]

  if(chart){
    chart.destroy()
    chart = null
  }

  chart = new Chart(ctx,{
    type:'bar',
    data:{
      labels: labels,
      datasets:[{
        label:'Study Time',
        data: values,
        backgroundColor: colors.slice(0, values.length),
        borderRadius: 8
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      animation:false,
      interaction:{
        mode:'nearest',
        intersect:false
      },
      plugins:{
        tooltip:{
          enabled:true,
          backgroundColor:'#222',
          titleColor:'#fff',
          bodyColor:'#fff',
          titleFont:{
            size:14
          },
          bodyFont:{
            size:13
          },
          callbacks:{
            label:function(context){
              return context.label + " - " + formatTime(context.raw)
            }
          }
        },
        legend:{
          labels:{
            color:'#222',
            font:{
              size:14
            }
          }
        }
      },
      scales:{
        y:{
          ticks:{
            color:'#222',
            font:{
              size:13,
              weight:'bold'
            },
            callback:function(value){
              return formatTime(value)
            }
          }
        },
        x:{
          ticks:{
            color:'#222',
            font:{
              size:13,
              weight:'bold'
            }
          }
        }
      }
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