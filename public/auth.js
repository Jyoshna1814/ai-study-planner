async function signup(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  let res=await fetch("/signup",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  });

  let data=await res.text();
  document.getElementById("msg").innerText=data;
}

async function login(){
  const email=document.getElementById("email").value;
  const password=document.getElementById("password").value;

  let res=await fetch("/login",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({email,password})
  });

  let data=await res.text();

  if(data==="Login success"){
    window.location.href="index.html";
  } else {
    document.getElementById("msg").innerText=data;
  }
}