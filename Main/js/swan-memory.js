
const swanWhiteNoiseAudio = document.getElementById("swanWhiteNoiseAudio");
const swanVideo = document.getElementById("swanVideo");
const swanAsciiCanvas = document.getElementById("swanAsciiCanvas");
const swanAsciiCtx = swanAsciiCanvas.getContext("2d", {
  willReadFrequently: true
});

const swanDialogueLines = document.getElementById("swanDialogueLines");
const swanSpaceHint = document.getElementById("swanSpaceHint");

const CONFIG = {

 
  typingSpeed: 48,
  startDelay: 1200,
  nextHintDelay: 700,
  returnDelay: 2600,
  whiteNoiseVolume: 0.52,
  asciiScale: 0.34,
  asciiCellSize: 7,
  asciiFontSize: 7,
  asciiFPS: 18,

  nextPage: "world.html"
};

const swanText = [
  "Прекрасный балет, не находишь?",
  "Не знаю.",
  "Музыка просто невероятная.",
  "Это ни о чем мне не говорит.",
  "Как хорошо вот так просто сидеть вместе.",
  "Я ничего не чувствую.",
  "Поэтому тебе предстоит найти то, что ты сможешь назвать\nкрасивым. Это есть свобода воли."
];

const ASCII_CHARS = " .:-=+*#%@";

let currentLineIndex = -1;
let isBusy = false;
let sceneFinished = false;
let asciiLastFrameTime = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showHint() {
  swanSpaceHint.classList.add("visible");
}

function hideHint() {
  swanSpaceHint.classList.remove("visible");
}

function createLine() {
  const line = document.createElement("div");
  line.className = "swan-dialogue-line";

  const oldLines = swanDialogueLines.querySelectorAll(".swan-dialogue-line");
  oldLines.forEach(item => item.classList.add("old"));

  swanDialogueLines.appendChild(line);

  return line;
}

async function typeText(text) {
  const line = createLine();

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "\n") {
      line.appendChild(document.createElement("br"));
    } else {
      line.appendChild(document.createTextNode(char));
    }

    await sleep(CONFIG.typingSpeed);
  }
}

async function typeNextLine() {
  if (isBusy || sceneFinished) return;

  hideHint();

  isBusy = true;
  currentLineIndex++;

  if (currentLineIndex < swanText.length) {
    await typeText(swanText[currentLineIndex]);
  }

  isBusy = false;

  if (currentLineIndex === swanText.length - 1) {
    sceneFinished = true;

    await sleep(CONFIG.returnDelay);


if (swanWhiteNoiseAudio) {
  swanWhiteNoiseAudio.pause();
  swanWhiteNoiseAudio.currentTime = 0;
}

window.location.href = CONFIG.nextPage;
return;

  }

  await sleep(CONFIG.nextHintDelay);
  showHint();
}

function resizeAsciiCanvas() {
  swanAsciiCanvas.width = Math.floor(window.innerWidth * CONFIG.asciiScale);
  swanAsciiCanvas.height = Math.floor(window.innerHeight * CONFIG.asciiScale);

  swanAsciiCanvas.style.width = "100vw";
  swanAsciiCanvas.style.height = "100vh";

  swanAsciiCtx.font = `${CONFIG.asciiFontSize}px monospace`;
  swanAsciiCtx.textBaseline = "top";
}

function getCoverDrawRect(videoWidth, videoHeight, canvasWidth, canvasHeight) {
  const videoRatio = videoWidth / videoHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth;
  let drawHeight;
  let drawX;
  let drawY;

  if (videoRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * videoRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / videoRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  return {
    drawX,
    drawY,
    drawWidth,
    drawHeight
  };
}

function renderAsciiFrame(now) {
  requestAnimationFrame(renderAsciiFrame);

  if (now - asciiLastFrameTime < 1000 / CONFIG.asciiFPS) return;
  asciiLastFrameTime = now;

  const width = swanAsciiCanvas.width;
  const height = swanAsciiCanvas.height;

  swanAsciiCtx.clearRect(0, 0, width, height);
  swanAsciiCtx.fillStyle = "#000";
  swanAsciiCtx.fillRect(0, 0, width, height);

  if (
    !swanVideo ||
    swanVideo.readyState < 2 ||
    !swanVideo.videoWidth ||
    !swanVideo.videoHeight
  ) {
    return;
  }

  const rect = getCoverDrawRect(
    swanVideo.videoWidth,
    swanVideo.videoHeight,
    width,
    height
  );

  swanAsciiCtx.drawImage(
    swanVideo,
    rect.drawX,
    rect.drawY,
    rect.drawWidth,
    rect.drawHeight
  );

  const imageData = swanAsciiCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  swanAsciiCtx.fillStyle = "#000";
  swanAsciiCtx.fillRect(0, 0, width, height);

  swanAsciiCtx.font = `${CONFIG.asciiFontSize}px monospace`;
  swanAsciiCtx.fillStyle = "rgba(235, 235, 235, 0.78)";

  for (let y = 0; y < height; y += CONFIG.asciiCellSize) {
    for (let x = 0; x < width; x += CONFIG.asciiCellSize) {
      const index = (y * width + x) * 4;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const brightness = (r + g + b) / 3;
      const charIndex = Math.floor(
        (brightness / 255) * (ASCII_CHARS.length - 1)
      );

      const char = ASCII_CHARS[charIndex];

      swanAsciiCtx.fillText(char, x, y);
    }
  }
}

function startVideo() {
  if (!swanVideo) return;

  swanVideo.muted = true;
  swanVideo.loop = true;
  swanVideo.playsInline = true;

  const playPromise = swanVideo.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

window.addEventListener("keydown", async event => {
  startVideo();
  startSwanWhiteNoise();

  if (event.code !== "Space") return;

  event.preventDefault();

  if (isBusy || sceneFinished) return;

  await typeNextLine();
});

window.addEventListener("click", () => {
  startVideo();
  startSwanWhiteNoise();
});

window.addEventListener("resize", () => {
  resizeAsciiCanvas();
});

resizeAsciiCanvas();
startVideo();
startSwanWhiteNoise();
requestAnimationFrame(renderAsciiFrame);

setTimeout(() => {
  showHint();
}, CONFIG.startDelay);

function startSwanWhiteNoise() {
  if (!swanWhiteNoiseAudio) return;

  swanWhiteNoiseAudio.volume = CONFIG.whiteNoiseVolume;
  swanWhiteNoiseAudio.loop = true;

  const playPromise = swanWhiteNoiseAudio.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      /*
        Браузер может заблокировать autoplay.
        Тогда звук включится после первого пробела или клика.
      */
    });
  }
}