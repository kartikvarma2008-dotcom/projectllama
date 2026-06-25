const hint = document.getElementById("regret-hint");

window.setTimeout(() => {
  hint.style.opacity = "1";
}, 1800);

window.setTimeout(() => {
  document.body.classList.add("regret-page--exit");
}, 3200);

window.setTimeout(() => {
  window.location.href = "potion.html";
}, 4000);

document.body.addEventListener("click", () => {
  window.location.href = "potion.html";
}, { once: true });
