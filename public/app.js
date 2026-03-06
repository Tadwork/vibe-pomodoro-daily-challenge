const timeEl = document.getElementById("time");
const phaseEl = document.getElementById("phase");
const startPauseBtn = document.getElementById("startPause");
const resetBtn = document.getElementById("reset");
const skipBtn = document.getElementById("skip");
const soundSelect = document.getElementById("soundSelect");
const focusCard = document.getElementById("focusCard");
const breakCard = document.getElementById("breakCard");
const focusValueEl = document.getElementById("focusValue");
const breakValueEl = document.getElementById("breakValue");
const settingsHintEl = document.getElementById("settingsHint");

const defaultPreferences = {
  focusMinutes: 25,
  breakMinutes: 5,
  soundPreset: "chime"
};

function getSafeStorage() {
  try {
    return window.localStorage;
  } catch (_error) {
    return null;
  }
}

const storage = getSafeStorage();
const storedPreferences = PomodoroUtils.loadPreferences(storage, defaultPreferences);

let focusMinutes = storedPreferences.focusMinutes;
let breakMinutes = storedPreferences.breakMinutes;
let soundPreset = storedPreferences.soundPreset;

let secondsLeft = focusMinutes * 60;
let isRunning = false;
let isFocus = true;
let timerId = null;
let editingKind = null;
let audioContext = null;

function formatTime(seconds) {
  const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function persistPreferences() {
  PomodoroUtils.savePreferences(storage, {
    focusMinutes,
    breakMinutes,
    soundPreset
  });
}

function getAudioContext() {
  if (!("AudioContext" in window || "webkitAudioContext" in window)) {
    return null;
  }

  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }

  return audioContext;
}

function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

function getSoundFrequencies() {
  if (soundPreset === "bell") return [523.25, 659.25, 783.99];
  if (soundPreset === "digital") return [880, 660, 880, 660];
  return [659.25, 783.99];
}

function playSessionSound() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state === "suspended") return;

  const frequencies = getSoundFrequencies();
  const now = ctx.currentTime;
  const totalDurationSeconds = 2;
  const patternSteps = 8;
  const stepDuration = totalDurationSeconds / patternSteps;

  Array.from({ length: patternSteps }).forEach((_, index) => {
    const frequency = frequencies[index % frequencies.length];
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const startTime = now + index * stepDuration;
    const endTime = startTime + stepDuration * 0.85;

    oscillator.type = soundPreset === "digital" ? "square" : "sine";
    oscillator.frequency.setValueAtTime(frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.18, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, endTime);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(startTime);
    oscillator.stop(endTime);
  });
}

function render() {
  const canEditDurations = !isRunning;

  timeEl.textContent = formatTime(secondsLeft);
  phaseEl.textContent = isFocus ? "Focus Session" : "Break Session";
  startPauseBtn.textContent = isRunning ? "Pause" : "Start";
  soundSelect.value = soundPreset;
  settingsHintEl.textContent = canEditDurations
    ? "Click Focus or Break to edit directly. Click away to save valid values."
    : "Pause timer to edit durations. Settings are locked while running.";

  if (editingKind !== "focus") {
    focusValueEl.textContent = PomodoroUtils.formatMinutesLabel(focusMinutes);
  }

  if (editingKind !== "break") {
    breakValueEl.textContent = PomodoroUtils.formatMinutesLabel(breakMinutes);
  }

  focusCard.style.cursor = canEditDurations ? "pointer" : "not-allowed";
  breakCard.style.cursor = canEditDurations ? "pointer" : "not-allowed";
  focusCard.title = canEditDurations ? "Click to edit Focus minutes" : "Pause timer to edit Focus minutes";
  breakCard.title = canEditDurations ? "Click to edit Break minutes" : "Pause timer to edit Break minutes";
}

function swapPhase() {
  isFocus = !isFocus;
  secondsLeft = isFocus ? focusMinutes * 60 : breakMinutes * 60;
  render();
}

function tick() {
  secondsLeft -= 1;

  if (secondsLeft < 0) {
    playSessionSound();
    swapPhase();
    return;
  }

  render();
}

function startTimer() {
  if (timerId) return;
  unlockAudio();
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

function startInlineEdit(kind) {
  if (editingKind || isRunning) return;
  editingKind = kind;

  const isFocusCard = kind === "focus";
  const valueEl = isFocusCard ? focusValueEl : breakValueEl;
  const currentValue = isFocusCard ? focusMinutes : breakMinutes;
  const min = 1;
  const max = isFocusCard ? 120 : 60;

  valueEl.textContent = "";

  const input = document.createElement("input");
  input.type = "number";
  input.min = String(min);
  input.max = String(max);
  input.value = String(currentValue);
  input.className = "h-10 w-24 rounded-md border border-slate-400 bg-white px-1 py-0 text-center text-xl font-bold leading-none text-slate-900";
  valueEl.appendChild(input);
  input.focus();
  input.select();

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      input.blur();
      return;
    }

    if (event.key === "Escape") {
      input.dataset.cancel = "1";
      input.blur();
    }
  });

  input.addEventListener("blur", () => {
    const shouldCancel = input.dataset.cancel === "1";
    if (!shouldCancel) {
      const parsed = PomodoroUtils.parseValidMinutes(input.value, min, max);
      if (parsed !== null) {
        if (isFocusCard) {
          focusMinutes = parsed;
          if (isFocus) secondsLeft = focusMinutes * 60;
        } else {
          breakMinutes = parsed;
          if (!isFocus) secondsLeft = breakMinutes * 60;
        }
        persistPreferences();
      }
    }

    editingKind = null;
    render();
  });
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
  secondsLeft = focusMinutes * 60;
  render();
});

skipBtn.addEventListener("click", () => {
  swapPhase();
});

soundSelect.addEventListener("change", () => {
  unlockAudio();
  soundPreset = PomodoroUtils.normalizeSoundPreset(soundSelect.value, soundPreset);
  persistPreferences();
  render();
});

focusCard.addEventListener("click", (event) => {
  if (event.target.tagName === "INPUT") return;
  if (isRunning) return;
  startInlineEdit("focus");
});

breakCard.addEventListener("click", (event) => {
  if (event.target.tagName === "INPUT") return;
  if (isRunning) return;
  startInlineEdit("break");
});

document.addEventListener("click", (event) => {
  if (!editingKind) return;

  if (editingKind === "focus" && !focusCard.contains(event.target)) {
    const input = focusCard.querySelector("input");
    if (input) input.blur();
  }

  if (editingKind === "break" && !breakCard.contains(event.target)) {
    const input = breakCard.querySelector("input");
    if (input) input.blur();
  }
});

render();
