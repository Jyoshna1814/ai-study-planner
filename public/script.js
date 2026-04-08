console.log("App Loaded");

// simple interaction
document.querySelectorAll("input[type='checkbox']").forEach(box => {
  box.addEventListener("change", () => {
    if (box.checked) {
      box.parentElement.style.opacity = "0.5";
    } else {
      box.parentElement.style.opacity = "1";
    }
  });
});