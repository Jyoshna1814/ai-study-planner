async function generateTimetable(){

const res = await fetch("/subjects/" + currentUser.username)
const subjects = await res.json()

const examDate = document.getElementById("examDate").value
const hoursPerDay = document.getElementById("studyHours").value

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
    div.innerHTML += `${p.subject} - ${p.hours}h <button onclick="markDone('${p.subject}',${p.hours})">Done</button><br>`
  })

  result.appendChild(div)
})

showChart(data.timetable[data.timetable.length-1].plan)
}

// Progress update
async function markDone(subject, hours){

await fetch("/update-progress",{
  method:"POST",
  headers:{"Content-Type":"application/json"},
  body:JSON.stringify({subjectName:subject, hours})
})

loadProgress()
}

// Load progress bar
async function loadProgress(){

const res = await fetch("/progress/" + currentUser.username)
const data = await res.json()

let bar = document.getElementById("progressBar")
bar.style.width = data.progress + "%"
bar.innerText = data.progress + "%"
}

// Chart
function showChart(plan){
let labels = plan.map(p=>p.subject)
let values = plan.map(p=>p.hours)

const ctx = document.getElementById("progressChart").getContext("2d")

new Chart(ctx,{
  type:'bar',
  data:{labels:labels,datasets:[{label:'Hours',data:values}]}
})
}


// ================= EXTRA FEATURE =================
// Missed target recovery

function recoverMissed(subjects){
  subjects.forEach(s=>{
    if(s.completedHours < 2){
      s.difficulty += 1 // increase priority
    }
  })
}
