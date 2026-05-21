const whiteDialogueLines = document.getElementById("whiteDialogueLines");
const whiteSpaceHint = document.getElementById("whiteSpaceHint");
const whiteNoiseAudio = document.getElementById("whiteNoiseAudio");

const CONFIG = {
  startDelay: 1400,
  typingSpeed: 58,
  nextHintDelay: 700,
  finalHintDelay: 5000,

  audioVolume: 0.55,

  nextPage: "pustosh.html"
};

const whiteMemoryText = [

  "Мне так холодно.",
  "Прости меня.",
  "Я люблю этот мир.",
  "Я рад.",
  "Я хочу его уничтожить.",
  "Прошу, прости меня.",
  "Я не знаю любви.",
  "Я тебя люблю.",
  "Я хочу любить"
];

let currentLineIndex = -1;
let isBusy = false;
let allTextTyped = false;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showHint() {
  whiteSpaceHint.classList.add("visible");
}

function hideHint() {
  whiteSpaceHint.classList.remove("visible");
}

function createLine() {
  const line = document.createElement("div");
  line.className = "white-dialogue-line";

  const oldLines = whiteDialogueLines.querySelectorAll(".white-dialogue-line");
  oldLines.forEach(item => item.classList.add("old"));

  whiteDialogueLines.appendChild(line);

  return line;
}

async function typeText(text) {
  const line = createLine();

  for (let i = 0; i < text.length; i++) {
    line.textContent += text[i];
    await sleep(CONFIG.typingSpeed);
  }
}

function startWhiteNoiseAudio() {
  if (!whiteNoiseAudio) return;

  whiteNoiseAudio.volume = CONFIG.audioVolume;
  whiteNoiseAudio.loop = true;

  const playPromise = whiteNoiseAudio.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      /*
        Браузер может заблокировать autoplay.
        Тогда звук запустится после первого пробела или клика.
      */
    });
  }
}

async function typeNextLine() {
  if (isBusy || allTextTyped) return;

  hideHint();
  startWhiteNoiseAudio();

  isBusy = true;
  currentLineIndex++;

  if (currentLineIndex < whiteMemoryText.length) {
    await typeText(whiteMemoryText[currentLineIndex]);
  }

  isBusy = false;

  if (currentLineIndex === whiteMemoryText.length - 1) {
    allTextTyped = true;

    await sleep(CONFIG.finalHintDelay);
    showHint();

    return;
  }

  await sleep(CONFIG.nextHintDelay);
  showHint();
}

async function startScene() {
  await sleep(CONFIG.startDelay);

  /*
    Первая строка появляется сама, без пробела.
  */
  await typeNextLine();
}

function goToNextPage() {
  window.location.href = CONFIG.nextPage;
}

window.addEventListener("keydown", async event => {
  startWhiteNoiseAudio();

  if (event.code !== "Space") return;

  event.preventDefault();

  if (isBusy) return;

  if (allTextTyped) {
    goToNextPage();
    return;
  }

  await typeNextLine();
});

window.addEventListener("click", () => {
  startWhiteNoiseAudio();
});

if (whiteNoiseAudio) {
  whiteNoiseAudio.addEventListener("error", () => {
    console.error("Не найден или не читается audio/whitenoise.mp3");
  });
}

startWhiteNoiseAudio();
startScene();