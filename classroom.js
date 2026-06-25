const boardTitle = document.getElementById("board-title");
const boardLines = [
  document.getElementById("board-line-1"),
  document.getElementById("board-line-2"),
  document.getElementById("board-line-3"),
];
const continueBtn = document.getElementById("classroom-continue");
const students = document.querySelectorAll(".student");

const lesson = [
  { element: boardTitle, text: "reasons why kartik is a good boyfriend" },
  { element: boardLines[0], text: "chalant and caring" },
  { element: boardLines[1], text: "emotional and expressive" },
  { element: boardLines[2], text: "soft and sensitive" },
];

let lineIndex = 0;
let charIndex = 0;

function revealThoughts() {
  students.forEach((student, index) => {
    window.setTimeout(() => {
      student.classList.add("student--thinking");
    }, index * 220);
  });
}

function typeNext() {
  const current = lesson[lineIndex];

  if (!current) {
    sessionStorage.setItem("classroomPassed", "true");
    revealThoughts();
    continueBtn.hidden = false;
    continueBtn.classList.add("classroom-continue--show");
    return;
  }

  current.element.textContent = current.text.slice(0, charIndex + 1);
  charIndex += 1;

  if (charIndex < current.text.length) {
    window.setTimeout(typeNext, 55);
    return;
  }

  current.element.classList.add("board-line--done");
  lineIndex += 1;
  charIndex = 0;
  window.setTimeout(typeNext, 420);
}

window.setTimeout(typeNext, 700);
