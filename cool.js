const rightBtn = document.getElementById("right-btn");
const wrongBtn = document.getElementById("wrong-btn");
const progressEl = document.getElementById("progress");
const progressWrap = document.getElementById("progress-wrap");
const instruction = document.getElementById("instruction");
const popLayer = document.getElementById("pop-layer");
const stage = document.getElementById("stage");
const kartikName = document.getElementById("kartik-name");
const trushtiName = document.getElementById("trushti-name");
const kartikSword = document.getElementById("kartik-sword");
const victimWrap = document.getElementById("victim-wrap");
const heroWrap = document.getElementById("hero-wrap");

const TARGET_CLICKS = 10;
const POP_WORDS = [
  "aww you think so",
  "ikrrr",
  "opinion valid",
  "real",
  "soo coool right",
];

let clicks = 0;
let rightScale = 0.7;
let wrongScale = 1.5;
let finished = false;

function updateSizes() {
  rightBtn.style.fontSize = `${0.7 + rightScale * 0.78}rem`;
  wrongBtn.style.fontSize = `${1.25 + wrongScale * 0.85}rem`;
}

function spawnPop(text, x, y, kind) {
  const el = document.createElement("span");
  el.className = `cool-pop cool-pop--${kind}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  popLayer.appendChild(el);

  window.setTimeout(() => el.remove(), 900);
}

function spawnBurst(x, y) {
  const colors = ["#8b6914", "#c9a87c", "#535353", "#e8a0bf", "#ffd166", "#b7336a"];

  for (let i = 0; i < 18; i++) {
    const dot = document.createElement("span");
    dot.className = "cool-burst";
    const angle = (Math.PI * 2 * i) / 18;
    const dist = 42 + Math.random() * 42;
    dot.style.left = `${x}px`;
    dot.style.top = `${y}px`;
    dot.style.background = colors[i % colors.length];
    dot.style.setProperty("--bx", `${Math.cos(angle) * dist}px`);
    dot.style.setProperty("--by", `${Math.sin(angle) * dist}px`);
    popLayer.appendChild(dot);

    window.setTimeout(() => dot.remove(), 700);
  }
}

function playFinale() {
  finished = true;
  sessionStorage.setItem("coolPassed", "true");

  instruction.style.opacity = "0";
  progressWrap.style.opacity = "0";
  rightBtn.disabled = true;
  wrongBtn.disabled = true;

  stage.classList.add("cool-stage--finale");

  window.setTimeout(() => {
    kartikSword.classList.add("cool-sword--drawn");
    kartikName.classList.add("cool-name--armed");
  }, 350);

  window.setTimeout(() => {
    heroWrap.classList.add("cool-hero-wrap--lunge");
  }, 900);

  window.setTimeout(() => {
    trushtiName.classList.add("cool-name--stabbed");
    victimWrap.classList.add("cool-victim-wrap--hit");
    spawnPop("💥", wrongBtn.getBoundingClientRect().left + 40, wrongBtn.getBoundingClientRect().top + 10, "bad");
  }, 1350);

  window.setTimeout(() => {
    victimWrap.classList.add("cool-victim-wrap--flung");
    wrongBtn.classList.add("cool-wrong--gone");
  }, 1750);

  window.setTimeout(() => {
    kartikName.classList.add("cool-name--victory");
    heroWrap.classList.remove("cool-hero-wrap--lunge");
    heroWrap.classList.add("cool-hero-wrap--pose");
    spawnPop("justice served", rightBtn.getBoundingClientRect().left, rightBtn.getBoundingClientRect().top - 20, "good");
  }, 2200);

  window.setTimeout(() => {
    document.body.classList.add("cool-page--exit");
  }, 2800);

  window.setTimeout(() => {
    window.location.href = "regret.html";
  }, 3400);
}

function handleRightClick() {
  if (finished) return;

  clicks = Math.min(TARGET_CLICKS, clicks + 1);
  progressEl.textContent = clicks;

  rightScale += 0.42;
  wrongScale = Math.max(0.18, wrongScale - 0.18);
  updateSizes();

  rightBtn.classList.remove("cool-right--pop");
  rightBtn.offsetHeight;
  rightBtn.classList.add("cool-right--pop");

  progressWrap.classList.remove("cool-progress--pulse");
  progressWrap.offsetHeight;
  progressWrap.classList.add("cool-progress--pulse");

  const word = POP_WORDS[Math.floor(Math.random() * POP_WORDS.length)];
  const rect = rightBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2 + (Math.random() - 0.5) * 50;
  const y = rect.top - 10 + (Math.random() - 0.5) * 24;
  spawnPop(word, x, y, "good");
  spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);

  if (clicks >= TARGET_CLICKS) {
    playFinale();
  }
}

function handleWrongClick() {
  if (finished) return;

  clicks = Math.max(0, clicks - 1);
  progressEl.textContent = clicks;

  wrongBtn.classList.remove("cool-wrong--shake", "cool-wrong--flash");
  wrongBtn.offsetHeight;
  wrongBtn.classList.add("cool-wrong--shake", "cool-wrong--flash");

  stage.classList.remove("cool-stage--buzz");
  stage.offsetHeight;
  stage.classList.add("cool-stage--buzz");

  const rect = wrongBtn.getBoundingClientRect();
  spawnPop("nope", rect.left + rect.width / 2, rect.top - 8, "bad");
  spawnPop("wrong one bestie", rect.left + rect.width / 2 + 20, rect.top + 20, "bad");
}

rightBtn.addEventListener("click", handleRightClick);
wrongBtn.addEventListener("click", handleWrongClick);

updateSizes();
