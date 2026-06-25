const canvas = document.getElementById("draw");
const ctx = canvas.getContext("2d");
const accuracyEl = document.getElementById("accuracy");
const hintEl = document.getElementById("hint");
const successEl = document.getElementById("success");
const clearBtn = document.getElementById("clear-btn");

const TARGET_ACCURACY = 45;
const MIN_POINTS = 12;

let drawing = false;
let points = [];
let passed = false;

function getPos(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  if (event.touches && event.touches.length) {
    return {
      x: (event.touches[0].clientX - rect.left) * scaleX,
      y: (event.touches[0].clientY - rect.top) * scaleY,
    };
  }

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
}

function clearCanvas() {
  ctx.fillStyle = "#faf8f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#e8e4df";
  ctx.lineWidth = 1;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, 100, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawStroke() {
  clearCanvas();

  if (points.length < 2) return;

  ctx.strokeStyle = "#535353";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }

  ctx.stroke();
}

function calculateAccuracy(pts) {
  if (pts.length < MIN_POINTS) return 0;

  const cx = pts.reduce((sum, p) => sum + p.x, 0) / pts.length;
  const cy = pts.reduce((sum, p) => sum + p.y, 0) / pts.length;

  const radii = pts.map((p) => Math.hypot(p.x - cx, p.y - cy));
  const meanR = radii.reduce((a, b) => a + b, 0) / radii.length;

  if (meanR < 20) return 0;

  const radiusVariance =
    radii.reduce((sum, r) => sum + (r - meanR) ** 2, 0) / radii.length;
  const radiusStd = Math.sqrt(radiusVariance);
  const radiusScore = Math.max(0, 1 - radiusStd / (meanR * 0.55));

  const first = pts[0];
  const last = pts[pts.length - 1];
  const gap = Math.hypot(first.x - last.x, first.y - last.y);
  const closureScore = Math.max(0, 1 - gap / (meanR * 0.7));

  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  const aspectScore = Math.min(width, height) / Math.max(width, height);

  let pathLength = 0;
  for (let i = 1; i < pts.length; i++) {
    pathLength += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }

  const expectedLength = 2 * Math.PI * meanR;
  const lengthScore =
    Math.min(pathLength, expectedLength) / Math.max(pathLength, expectedLength);

  const score =
    (radiusScore * 0.4 +
      closureScore * 0.2 +
      aspectScore * 0.2 +
      lengthScore * 0.2) *
    100;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function finishCircle() {
  passed = true;
  sessionStorage.setItem("circlePassed", "true");
  successEl.hidden = false;
  clearBtn.hidden = true;
  hintEl.textContent = "ok close enough. moving on…";

  window.setTimeout(() => {
    window.location.href = "cool.html";
  }, 1200);
}

function updateUI(accuracy) {
  accuracyEl.textContent = accuracy;

  if (accuracy >= TARGET_ACCURACY) {
    finishCircle();
    return;
  }

  successEl.hidden = true;
  clearBtn.hidden = false;
  hintEl.textContent =
    accuracy < 25
      ? "just scribble a round-ish loop. seriously."
      : `almost. ${TARGET_ACCURACY}% to pass — try again.`;
}

function startDraw(event) {
  if (passed) return;

  event.preventDefault();
  drawing = true;
  points = [getPos(event)];
  accuracyEl.textContent = "…";
  successEl.hidden = true;
  clearBtn.hidden = true;
  hintEl.textContent = "keep going…";
  drawStroke();
}

function moveDraw(event) {
  if (!drawing || passed) return;

  event.preventDefault();
  const pos = getPos(event);
  const last = points[points.length - 1];

  if (Math.hypot(pos.x - last.x, pos.y - last.y) > 2) {
    points.push(pos);
    drawStroke();
  }
}

function endDraw(event) {
  if (!drawing || passed) return;

  event.preventDefault();
  drawing = false;

  if (points.length < MIN_POINTS) {
    accuracyEl.textContent = "—";
    hintEl.textContent = "too short — just draw something round";
    clearBtn.hidden = false;
    return;
  }

  const accuracy = calculateAccuracy(points);
  updateUI(accuracy);
}

function reset() {
  drawing = false;
  points = [];
  passed = false;
  accuracyEl.textContent = "—";
  successEl.hidden = true;
  clearBtn.hidden = true;
  hintEl.textContent = "draw any loop — doesnt have to be perfect";
  clearCanvas();
}

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", moveDraw);
window.addEventListener("mouseup", endDraw);

canvas.addEventListener("touchstart", startDraw, { passive: false });
canvas.addEventListener("touchmove", moveDraw, { passive: false });
canvas.addEventListener("touchend", endDraw, { passive: false });

clearBtn.addEventListener("click", reset);

reset();
