const beakerZone = document.getElementById("beaker-zone");
const beaker = document.querySelector(".beaker");
const beakerLiquid = document.getElementById("beaker-liquid");
const beakerLabel = document.getElementById("beaker-label");
const message = document.getElementById("potion-message");
const secretIngredient = document.getElementById("secret-ingredient");
const continueBtn = document.getElementById("potion-continue");
const ingredients = document.querySelectorAll(".ingredient, .secret-ingredient");

const requiredIngredients = ["asphodel", "hair", "dust", "moonstone"];
const cringeWords = ["oh god", "this is so cringe", "why did i do this"];
const added = new Set();
let currentDrag = "";
let secretRevealed = false;
let finished = false;
let cringeLoop = null;

function setMessage(text) {
  message.textContent = text;
  message.classList.remove("potion-message--pulse");
  message.offsetHeight;
  message.classList.add("potion-message--pulse");
}

function updateBeaker() {
  const baseCount = requiredIngredients.filter((ingredient) => added.has(ingredient)).length;
  const fill = finished ? 82 : 18 + baseCount * 13;
  beakerLiquid.style.height = `${fill}%`;

  if (finished) {
    beakerLabel.textContent = "love potion";
    beakerZone.classList.add("beaker-zone--love");
    return;
  }

  beakerLabel.textContent = baseCount === 0 ? "empty" : `${baseCount} / 4`;
}

function revealSecret() {
  if (secretRevealed) return;
  secretRevealed = true;
  secretIngredient.hidden = false;
  secretIngredient.classList.add("secret-ingredient--show");
  setMessage("missing another one.");
}

function emitCringeParticle() {
  const rect = beaker.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const beakerBottom = rect.bottom - rect.height * 0.16;
  const particle = document.createElement("span");
  const phrase = cringeWords[Math.floor(Math.random() * cringeWords.length)];
  const drift = -36 + Math.random() * 72;

  particle.className = "potion-word-particle";
  particle.textContent = phrase;
  particle.style.left = `${centerX + (Math.random() - 0.5) * 52}px`;
  particle.style.top = `${beakerBottom}px`;
  particle.style.setProperty("--px", `${drift}px`);
  particle.style.setProperty("--py", `${-(rect.height * 1.05 + Math.random() * 90)}px`);
  particle.style.setProperty("--rot", `${-7 + Math.random() * 14}deg`);

  document.body.appendChild(particle);
  window.setTimeout(() => particle.remove(), 5200);
}

function startCringeLoop() {
  if (cringeLoop) return;
  emitCringeParticle();
  cringeLoop = window.setInterval(emitCringeParticle, 900);
}

function finishPotion() {
  finished = true;
  sessionStorage.setItem("potionPassed", "true");
  updateBeaker();
  setMessage("love potion brewed.");
  startCringeLoop();
  continueBtn.hidden = false;
  continueBtn.classList.add("potion-continue--show");
}

function addIngredient(name, sourceEl) {
  if (!name || finished || added.has(name)) return;

  if (name === "you") {
    if (!secretRevealed) return;
    added.add(name);
    sourceEl.hidden = true;
    finishPotion();
    return;
  }

  if (!requiredIngredients.includes(name)) return;

  added.add(name);
  sourceEl.disabled = true;
  sourceEl.classList.add("ingredient--used");
  updateBeaker();

  if (requiredIngredients.every((ingredient) => added.has(ingredient))) {
    revealSecret();
  } else {
    setMessage("keep brewing.");
  }
}

ingredients.forEach((ingredient) => {
  ingredient.addEventListener("dragstart", (event) => {
    currentDrag = ingredient.dataset.ingredient;
    event.dataTransfer.setData("text/plain", currentDrag);
  });

  ingredient.addEventListener("click", () => {
    addIngredient(ingredient.dataset.ingredient, ingredient);
  });
});

beakerZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  beakerZone.classList.add("beaker-zone--ready");
});

beakerZone.addEventListener("dragleave", () => {
  beakerZone.classList.remove("beaker-zone--ready");
});

beakerZone.addEventListener("drop", (event) => {
  event.preventDefault();
  beakerZone.classList.remove("beaker-zone--ready");

  const name = event.dataTransfer.getData("text/plain") || currentDrag;
  const sourceEl = document.querySelector(`[data-ingredient="${name}"]`);
  addIngredient(name, sourceEl);
});

updateBeaker();
