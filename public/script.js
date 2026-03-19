let currentUser = null

function signup(){

let username = document.getElementById("username").value
let password = document.getElementById("password").value

fetch("/signup",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({username,password})

})
.then(res=>res.json())
.then(data=>{
alert(data.message)
})

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

loadSubjects()

document.getElementById("authBox").style.display="none"
document.getElementById("logoutBtn").style.display="block"

}

else{

alert("Login failed")

}

})

}

function addSubject(){

let subject=document.getElementById("subjectInput").value

fetch("/add-subject",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({

user:currentUser.username,
subject:subject

})

})

.then(res=>res.json())

.then(data=>{

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

li.innerHTML=

sub.name+

` <button onclick="editSubject('${sub._id}','${sub.name}')">Edit</button>

<button onclick="deleteSubject('${sub._id}')">Delete</button>`

list.appendChild(li)

})

})

}
function deleteSubject(id){

fetch("/delete-subject/"+id,{

method:"DELETE"

})

.then(()=>{

loadSubjects()

})

}
function editSubject(id,name){

let newName = prompt("Edit subject",name)

fetch("/edit-subject/"+id,{

method:"PUT",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({name:newName})

})

.then(()=>{

loadSubjects()

})

}
function generatePlan(){

let examDate=document.getElementById("examDate").value
let hours=document.getElementById("studyHours").value

let subjects=[]

document.querySelectorAll("#subjectList li").forEach(li=>{
subjects.push({name:li.firstChild.textContent,difficulty:3,weightage:1})
})

fetch("/generate-plan",{

method:"POST",

headers:{"Content-Type":"application/json"},

body:JSON.stringify({

subjects:subjects,
examDate:examDate,
hours:hours

})

})

.then(res=>res.json())

.then(data=>{

let result=document.getElementById("planResult")

result.innerHTML=""

result.innerHTML += "<h3>Days Left: "+data.daysLeft+"</h3>"

data.plan.forEach(p=>{

result.innerHTML += `
<div>
${p.subject} : ${p.recommendedHours} hrs
</div>
`

})

showChart(data.plan)

})

}
let chart;

function showChart(plan){

let labels=[]
let data=[]

plan.forEach(p=>{
labels.push(p.subject)
data.push(p.hours)
})

const ctx = document.getElementById('progressChart').getContext('2d')

if(chart){
chart.destroy()
}

chart = new Chart(ctx,{
type:'bar',
data:{
labels:labels,
datasets:[{
label:'Study Hours',
data:data,
borderWidth:1
}]
},
options:{
responsive:true
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

alert("Pomodoro session complete!")

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

}

}
function generateTimetable(){

fetch("/subjects/" + currentUser.username)
.then(res => res.json())
.then(subjects => {

const examDate = document.getElementById("examDate").value
const hoursPerDay = document.getElementById("studyHours").value

fetch("/generate-timetable",{

method:"POST",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({
subjects:subjects,
examDate:examDate,
hoursPerDay:hoursPerDay
})

})

.then(res=>res.json())
.then(data=>{

 console.log(data)   

let result = document.getElementById("planResult")

result.innerHTML=""

data.timetable.forEach(day=>{

let div=document.createElement("div")

div.innerHTML="<h3>Day "+day.day+"</h3>"

day.plan.forEach(p=>{
div.innerHTML+=p.subject+" - "+p.hours+"h <br>"
})

result.appendChild(div)

})

showChart(data.timetable[0].plan)

})

})

}