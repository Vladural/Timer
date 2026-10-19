const minutesInput = document.getElementById("minutes");
const timer = document.getElementById("timer");
const progress = document.getElementById("progress");
const startPause = document.getElementById("startPause");
const reset = document.getElementById("reset");
const spinner = document.getElementById("spinner");
const message = document.getElementById("message");

const circleLength = 2 * Math.PI * 90;

let timerId = null;
let status = "ready";
let totalMs = 0;
let remainingMs = 0;
let deadline = 0;

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  const minutesText = String(minutes).padStart(2, "0");
  const secondsText = String(restSeconds).padStart(2, "0");

  return `${minutesText}:${secondsText}`;
}

function showTime(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  timer.textContent = formatTime(seconds);
}

function showProgress(value) {
  const offset = circleLength * (1 - value);
  progress.style.strokeDashoffset = offset;
}

function getMinutes() {
  const value = Number(minutesInput.value);

  if (!Number.isInteger(value) || value < 1 || value > 99) {
    return null;
  }

  return value;
}

function updatePreview() {
  const minutes = getMinutes();

  if (minutes === null) {
    timer.textContent = "--:--";
    message.textContent = "Введите целое число от 1 до 99.";
    showProgress(0);
    return;
  }

  totalMs = minutes * 60 * 1000;
  remainingMs = totalMs;

  timer.textContent = formatTime(minutes * 60);
  message.textContent = "";
  showProgress(0);
}

function finishTimer() {
  clearInterval(timerId);
  timerId = null;
  status = "finished";

  remainingMs = 0;
  timer.textContent = "00:00";
  showProgress(1);

  startPause.textContent = "Запустить снова";
  minutesInput.disabled = false;
  spinner.hidden = true;
  message.textContent = "Время вышло!";
}

function updateTimer() {
  remainingMs = Math.max(0, deadline - Date.now());

  showTime(remainingMs);

  const passedTime = totalMs - remainingMs;
  const progressValue = totalMs > 0 ? passedTime / totalMs : 0;

  showProgress(progressValue);

  if (remainingMs === 0) {
    finishTimer();
  }
}

function startTimer() {
  const minutes = getMinutes();

  if (minutes === null) {
    message.textContent = "Введите целое число от 1 до 99.";
    return;
  }

  if (status === "ready" || status === "finished") {
    totalMs = minutes * 60 * 1000;
    remainingMs = totalMs;
  }

  deadline = Date.now() + remainingMs;
  status = "running";

  minutesInput.disabled = true;
  startPause.textContent = "Пауза";
  spinner.hidden = false;
  message.textContent = "";

  updateTimer();
  timerId = setInterval(updateTimer, 100);
}

function pauseTimer() {
  remainingMs = Math.max(0, deadline - Date.now());

  clearInterval(timerId);
  timerId = null;

  if (remainingMs === 0) {
    finishTimer();
    return;
  }

  status = "paused";
  startPause.textContent = "Продолжить";
  spinner.hidden = true;
  message.textContent = "Таймер на паузе.";
}

startPause.addEventListener("click", () => {
  if (status === "running") {
    pauseTimer();
  } else {
    startTimer();
  }
});

reset.addEventListener("click", () => {
  clearInterval(timerId);
  timerId = null;

  status = "ready";
  minutesInput.disabled = false;
  startPause.textContent = "Старт";
  spinner.hidden = true;

  updatePreview();
});

minutesInput.addEventListener("input", () => {
  if (status !== "running" && status !== "paused") {
    status = "ready";
    startPause.textContent = "Старт";
    updatePreview();
  }
});

// Длина окружности нужна для расчёта заполнения SVG-круга
progress.style.strokeDasharray = circleLength;

// Показываем выбранное время при открытии страницы
updatePreview();
