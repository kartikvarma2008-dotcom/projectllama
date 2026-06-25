const whyBtn = document.getElementById("why-btn");
const frownFlash = document.getElementById("frown-flash");

whyBtn.addEventListener("click", (event) => {
  event.preventDefault();

  frownFlash.hidden = false;
  frownFlash.setAttribute("aria-hidden", "false");

  const emoji = frownFlash.querySelector("span");
  emoji.style.animation = "none";
  emoji.offsetHeight;
  emoji.style.animation = "";

  window.setTimeout(() => {
    window.location.href = whyBtn.href;
  }, 850);
});
