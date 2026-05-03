let subjects = [];
let timerInterval;

/* NOTIFICATION PERMISSION */
if ("Notification" in window) {
  Notification.requestPermission();
}

/* SERVICE WORKER */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

/* ADD SUBJECT */
function addSubject(){
  let div=document.createElement("div");

  div.innerHTML=`
    <input placeholder="Subject">
    <input type="date">
    <input placeholder="Hours">
    <input placeholder="Weight">
    <input placeholder="Difficulty">
    <button onclick="this.parentElement.remove()">X</button>
  `;

  document.getElementById("subjects").appendChild(div);
}

/* GENERATE PLAN */
function generatePlan(){
  subjects=[];

  document.querySelectorAll("#subjects div").forEach(row=>{
    let i=row.querySelectorAll("input");

    let subject=i[0].value;
    let date=new Date(i[1].value);
    let hours=parseFloat(i[2].value);
    let weight=parseFloat(i[3].value);
    let difficulty=parseFloat(i[4].value);

    if(!subject || isNaN(hours)) return;

    let today=new Date();
    let days=Math.ceil((date-today)/(1000*60*60*24));
    if(days<=0) days=1;

    let total=hours+(weight*difficulty/10);

    subjects.push({subject,days,total,completed:0});
  });

  showPlan();
  showTable();
  updateDashboard();

  sendReminder("Study plan ready!");
}

/* PLAN */
function showPlan(){
  let p=document.getElementById("plan");
  p.innerHTML="";

  subjects.forEach((s,i)=>{
    let daily=s.total/s.days;

    p.innerHTML+=`
      <p>
      <b>${s.subject}</b><br>
      Study: ${format(daily)}<br>
      <button onclick="completeTask(${i})">Done</button>
      </p>
    `;
  });
}

/* COMPLETE */
function completeTask(i){
  subjects[i].completed=1;
  updateDashboard();
}

/* TIMETABLE */
function showTable(){
  let t=document.getElementById("timetable");
  t.innerHTML="";

  let start=8;

  subjects.forEach(s=>{
    let daily=s.total/s.days;
    let end=start+daily;

    t.innerHTML+=`<p>${s.subject}: ${time(start)} - ${time(end)}</p>`;
    start=end;
  });
}

/* DASHBOARD */
function updateDashboard(){
  let total=subjects.reduce((a,b)=>a+b.total,0);
  let completed=subjects.filter(s=>s.completed).length;

  let progress=(completed/subjects.length)*100 || 0;

  document.getElementById("progressText").innerText=progress.toFixed(0)+"%";
  document.getElementById("progressBar").style.width=progress+"%";

  document.getElementById("totalTime").innerText=format(total);

  let min=Math.min(...subjects.map(s=>s.days));
  document.getElementById("daysLeft").innerText=min;
}

/* FORMAT */
function format(h){
  let hr=Math.floor(h);
  let m=Math.round((h-hr)*60);
  return hr+" hr "+m+" min";
}

function time(t){
  let h=Math.floor(t);
  let m=Math.round((t-h)*60);
  return h+":"+m.toString().padStart(2,"0");
}

/* TIMER */
function startTimer(){
  let t=1500;

  clearInterval(timerInterval);

  timerInterval=setInterval(()=>{
    let m=Math.floor(t/60);
    let s=t%60;

    document.getElementById("timer").innerText=
    m+":"+s.toString().padStart(2,"0");

    t--;

    if(t<0){
      clearInterval(timerInterval);
      alert("Break Time!");
    }
  },1000);
}

function resetTimer(){
  clearInterval(timerInterval);
  document.getElementById("timer").innerText="25:00";
}

/* NOTIFICATION */
function sendReminder(msg){
  if(Notification.permission==="granted"){
    new Notification("📚 Reminder",{body:msg});
  }
}