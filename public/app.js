const FOCUS_SECONDS = 25 * 60;
const BREAK_SECONDS = 5 * 60;

const timeEl = document.getElementById("time");
const phaseEl = document.getElementById("phase");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const skipBtn = document.getElementById("skip");

let secondsLeft = FOCUS_SECONDS;
let isRunning = false;
let isFocus = true;
let timerId = null;

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function render() {
  timeEl.textContent = formatTime(secondsLeft);
  phaseEl.textContent = isFocus ? "Focus Session" : "Break Session";
  startPauseBtn.textContent = isRunning ? "Pause" : "Start";
}

function swapPhase() {
  isFocus = !isFocus;
  secondsLeft = isFocus ? FOCUS_SECONDS : BREAK_SECONDS;
  render();
}

function tick() {
  secondsLeft -= 1;

  if (secondsLeft < 0) {
    swapPhase();
    return;
  }

  render();
}

function startTimer() {
  if (timerId) return;
  isRunning = true;
  timerId = setInterval(tick, 1000);
  render();
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerId);
  timerId = null;
  render();
}

startPauseBtn.addEventListener("click", () => {
  if (isRunning) {
    pauseTimer();
  } else {
    startTimer();
  }
});

resetBtn.addEventListener("click", () => {
  pauseTimer();
  isFocus = true;
  secondsLeft = FOCUS_SECONDS;
  render();
});

skipBtn.addEventListener("click", () => {
  swapPhase();
});

render();
