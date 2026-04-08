function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(screenId).classList.add("active");
}

document.querySelectorAll("input[type='checkbox']").forEach(box => {
  box.addEventListener("change", () => {
    box.parentElement.style.opacity = box.checked ? "0.5" : "1";
  });
});