const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const continueBtn = document.getElementById("continue-btn");
const hintEl = document.getElementById("hint");

const TARGET_SCORE = 250;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const GROUND = 150;
const GRAVITY = 0.55;
const JUMP_FORCE = -10.5;

let runScore = 0;
let maxScore = 0;
let speed = 5.5;
let frame = 0;
let running = true;
let crashed = false;
let obstacles = [];
let nextSpawn = 90;

const dino = {
  x: 40,
  y: GROUND - 42,
  w: 40,
  h: 42,
  vy: 0,
  grounded: true,
  legFrame: 0,
};

function resetRun() {
  runScore = 0;
  speed = 5.5;
  frame = 0;
  running = true;
  crashed = false;
  obstacles = [];
  nextSpawn = 90;
  dino.y = GROUND - dino.h;
  dino.vy = 0;
  dino.grounded = true;
  updateUI();
}

function jump() {
  if (crashed) {
    resetRun();
    return;
  }

  if (dino.grounded && running) {
    dino.vy = JUMP_FORCE;
    dino.grounded = false;
  }
}

function spawnObstacle() {
  const tall = Math.random() > 0.65;
  const h = tall ? 48 : 28;
  const w = tall ? 22 : 18 + Math.floor(Math.random() * 12);

  obstacles.push({
    x: WIDTH + 10,
    y: GROUND - h,
    w,
    h,
  });
}

function hit(a, b) {
  const pad = 6;
  return (
    a.x + pad < b.x + b.w - pad &&
    a.x + a.w - pad > b.x + pad &&
    a.y + pad < b.y + b.h &&
    a.y + a.h > b.y + pad
  );
}

function updateUI() {
  scoreEl.textContent = runScore;

  if (maxScore >= TARGET_SCORE) {
    continueBtn.hidden = false;
    sessionStorage.setItem("dinoPassed", "true");
    hintEl.textContent = "you made it. you can move ahead now.";
  } else if (crashed) {
    hintEl.textContent = `crashed at ${runScore}. need ${TARGET_SCORE} — tap or press space to retry.`;
  } else {
    hintEl.textContent = "space or tap to jump · press again after crashing to retry";
  }
}

function drawGround() {
  ctx.strokeStyle = "#535353";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, GROUND + 1);
  ctx.lineTo(WIDTH, GROUND + 1);
  ctx.stroke();

  ctx.fillStyle = "#535353";
  for (let x = (frame * speed) % 20; x < WIDTH; x += 20) {
    ctx.fillRect(x, GROUND + 8, 2, 2);
    ctx.fillRect(x + 10, GROUND + 14, 2, 2);
  }
}

function drawLlama() {
  const { x, y, w, h } = dino;
  ctx.fillStyle = "#535353";

  // Body
  ctx.fillRect(x + 2, y + 22, 36, 14);

  // Neck (rises from front/right of body)
  ctx.fillRect(x + 28, y + 10, 8, 14);

  // Head (horizontal, facing right)
  ctx.fillRect(x + 22, y + 5, 18, 10);

  // Ears (two narrow tabs atop head)
  ctx.fillRect(x + 25, y + 0, 4, 7);
  ctx.fillRect(x + 33, y + 0, 4, 7);

  // Eye (light sclera with dark pupil)
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(x + 36, y + 7, 4, 4);
  ctx.fillStyle = "#535353";
  ctx.fillRect(x + 37, y + 8, 2, 2);

  // Tail (short stub at back/left of body)
  ctx.fillRect(x, y + 20, 4, 6);

  // Four legs with alternating walk animation
  if (dino.grounded && running && !crashed) {
    const leg = Math.floor(frame / 6) % 2;
    const h1 = leg ? 3 : 6;
    const h2 = leg ? 6 : 3;
    ctx.fillRect(x + 4,  y + h - h1, 6, h1);
    ctx.fillRect(x + 12, y + h - h2, 6, h2);
    ctx.fillRect(x + 20, y + h - h1, 6, h1);
    ctx.fillRect(x + 28, y + h - h2, 6, h2);
  } else {
    ctx.fillRect(x + 4,  y + h - 5, 6, 5);
    ctx.fillRect(x + 12, y + h - 5, 6, 5);
    ctx.fillRect(x + 20, y + h - 5, 6, 5);
    ctx.fillRect(x + 28, y + h - 5, 6, 5);
  }
}

function drawCactus(obs) {
  ctx.fillStyle = "#535353";
  ctx.fillRect(obs.x, obs.y, obs.w, obs.h);

  if (obs.h > 35) {
    ctx.fillRect(obs.x - 8, obs.y + 10, 8, 4);
    ctx.fillRect(obs.x + obs.w, obs.y + 18, 8, 4);
  }
}

function drawOverlay() {
  if (!crashed) return;

  ctx.fillStyle = "rgba(250, 248, 245, 0.75)";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#535353";
  ctx.font = "600 16px Nunito, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("game over — tap or press space", WIDTH / 2, HEIGHT / 2);
}

function update() {
  if (!running) return;

  frame++;

  if (!crashed) {
    if (frame % 5 === 0) {
      runScore++;
      if (runScore > maxScore) maxScore = runScore;
    }

    speed = 5.5 + Math.min(runScore / 120, 4);

    dino.vy += GRAVITY;
    dino.y += dino.vy;

    if (dino.y >= GROUND - dino.h) {
      dino.y = GROUND - dino.h;
      dino.vy = 0;
      dino.grounded = true;
    }

    nextSpawn--;
    if (nextSpawn <= 0) {
      spawnObstacle();
      nextSpawn = 55 + Math.floor(Math.random() * 50) - Math.min(runScore / 30, 15);
    }

    obstacles.forEach((obs) => {
      obs.x -= speed;
    });
    obstacles = obstacles.filter((obs) => obs.x + obs.w > -20);

    for (const obs of obstacles) {
      if (hit(dino, obs)) {
        crashed = true;
        running = false;
        updateUI();
        break;
      }
    }

    updateUI();
  }
}

function draw() {
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  drawGround();

  obstacles.forEach(drawCactus);
  drawLlama();

  ctx.fillStyle = "#535353";
  ctx.font = "600 14px Nunito, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(`HI ${String(maxScore).padStart(5, "0")}`, WIDTH - 12, 24);

  drawOverlay();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    jump();
    if (crashed) running = true;
  }
});

canvas.addEventListener("pointerdown", () => {
  jump();
  if (crashed) running = true;
});

continueBtn.addEventListener("click", (event) => {
  if (maxScore < TARGET_SCORE) {
    event.preventDefault();
  }
});

resetRun();
loop();
