self.addEventListener("install", e=>{
  e.waitUntil(
    caches.open("study-app").then(cache=>{
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/script.js"
      ]);
    })
  );
});