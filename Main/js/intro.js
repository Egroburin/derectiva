const dialogueLines = document.getElementById("dialogueLines");
const spaceHint = document.getElementById("spaceHint");

document.body.classList.add("locked");

/*
  Настройки, которые удобно менять
*/
const CONFIG = {
  startDelay: 5000,

  typingSpeed: 58,
  linePause: 700,

  nextHintDelay: 700,
  firstFinalHintDelay: 5000,
  finalHintDelay: 5000,

  eraseSpeed: 8,

  transitionDuration: 1800,
  transitionCanvasScale: 0.58,

  transitionBgImage: "img/intro-bg.jpg",
  transitionCenterImage: "img/center-image.png",

  nextPage: "world.html"
};

const firstSequence = [
  "Скажи, зачем я здесь?",
  "Такова моя воля, что такое?",
  "Я боюсь завтрашнего дня"
];

const secondSequence = [
  "Не беспокойся, это нормально.",
  "Как преодолеть этот страх?",
  "Боюсь, я не могу ответить на этот вопрос."
];

let state = "intro-wait";
let isBusy = false;

let firstIndex = 0;
let secondIndex = 0;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showHint() {
  spaceHint.classList.add("visible");
}

function hideHint() {
  spaceHint.classList.remove("visible");
}

function createLine() {
  const line = document.createElement("div");
  line.className = "dialogue-line";

  const oldLines = dialogueLines.querySelectorAll(".dialogue-line");
  oldLines.forEach(item => item.classList.add("old"));

  dialogueLines.appendChild(line);
  return line;
}

async function typeText(text) {
  const line = createLine();

  for (let i = 0; i < text.length; i++) {
    line.textContent += text[i];
    await sleep(CONFIG.typingSpeed);
  }

  return line;
}

async function eraseAllText() {
  const lines = Array.from(dialogueLines.querySelectorAll(".dialogue-line"));

  for (const line of lines.reverse()) {
    const original = line.textContent;

    for (let i = original.length; i >= 0; i--) {
      line.textContent = original.slice(0, i);
      await sleep(CONFIG.eraseSpeed);
    }

    line.classList.add("erasing");
    await sleep(120);
    line.remove();
  }
}

async function startFirstSequence() {
  state = "typing-first";
  isBusy = true;

  await sleep(CONFIG.startDelay);

  firstIndex = 0;
  await typeText(firstSequence[firstIndex]);

  state = "waiting-first-next";
  isBusy = false;

  await sleep(CONFIG.nextHintDelay);
  showHint();
}

async function continueFirstSequence() {
  hideHint();
  isBusy = true;

  firstIndex++;

  if (firstIndex < firstSequence.length) {
    state = "typing-first";
    await typeText(firstSequence[firstIndex]);

    if (firstIndex === firstSequence.length - 1) {
      state = "waiting-after-first";
      isBusy = false;

      await sleep(CONFIG.firstFinalHintDelay);
      showHint();
    } else {
      state = "waiting-first-next";
      isBusy = false;

      await sleep(CONFIG.nextHintDelay);
      showHint();
    }
  }
}

async function startSecondSequence() {
  hideHint();
  isBusy = true;
  state = "erasing-first";

  await eraseAllText();

  secondIndex = 0;
  state = "typing-second";

  await typeText(secondSequence[secondIndex]);

  state = "waiting-second-next";
  isBusy = false;

  await sleep(CONFIG.nextHintDelay);
  showHint();
}

async function continueSecondSequence() {
  hideHint();
  isBusy = true;

  secondIndex++;

  if (secondIndex < secondSequence.length) {
    state = "typing-second";
    await typeText(secondSequence[secondIndex]);

    if (secondIndex === secondSequence.length - 1) {
      state = "waiting-final";
      isBusy = false;

      await sleep(CONFIG.finalHintDelay);
      showHint();
    } else {
      state = "waiting-second-next";
      isBusy = false;

      await sleep(CONFIG.nextHintDelay);
      showHint();
    }
  }
}

async function goToWorldPage() {
  hideHint();

  isBusy = true;
  document.body.classList.add("transitioning");

  await startPixelSortPageTransition();

  window.location.href = CONFIG.nextPage;
}

/*
  Блокируем управление страницей во вступлении
*/
window.addEventListener("wheel", event => {
  event.preventDefault();
}, { passive: false });

window.addEventListener("touchmove", event => {
  event.preventDefault();
}, { passive: false });

window.addEventListener("keydown", async event => {
  const key = event.code;

  const blockedKeys = [
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "PageUp",
    "PageDown",
    "Home",
    "End"
  ];

  if (blockedKeys.includes(key)) {
    event.preventDefault();
  }

  if (key !== "Space") return;

  event.preventDefault();

  if (isBusy) return;

  if (state === "waiting-first-next") {
    await continueFirstSequence();
    return;
  }

  if (state === "waiting-after-first") {
    await startSecondSequence();
    return;
  }

  if (state === "waiting-second-next") {
    await continueSecondSequence();
    return;
  }

  if (state === "waiting-final") {
    goToWorldPage();
  }
});
///////////////////////////////////////////////////////////////////////
function loadTransitionImage(src) {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);

    img.src = src;
  });
}

function drawImageCover(ctx, img, canvasWidth, canvasHeight) {
  const imageRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth;
  let drawHeight;
  let drawX;
  let drawY;

  if (imageRatio > canvasRatio) {
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imageRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imageRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

function drawImageContain(ctx, img, centerX, centerY, maxWidth, maxHeight, opacity = 1) {
  const imageRatio = img.naturalWidth / img.naturalHeight;
  const boxRatio = maxWidth / maxHeight;

  let drawWidth;
  let drawHeight;

  if (imageRatio > boxRatio) {
    drawWidth = maxWidth;
    drawHeight = maxWidth / imageRatio;
  } else {
    drawHeight = maxHeight;
    drawWidth = maxHeight * imageRatio;
  }

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.drawImage(
    img,
    centerX - drawWidth / 2,
    centerY - drawHeight / 2,
    drawWidth,
    drawHeight
  );
  ctx.restore();
}

function getLineTexts() {
  return Array.from(document.querySelectorAll(".dialogue-line"))
    .map(line => line.textContent)
    .filter(Boolean);
}

function drawCurrentTextToCanvas(ctx, canvasWidth, canvasHeight, scale) {
  const lines = getLineTexts();

  if (!lines.length) return;

  const computed = window.getComputedStyle(dialogueLines);
  const fontSize = (parseFloat(computed.fontSize) || 24) * scale;
  const lineHeight = fontSize * 1.42;

  ctx.save();

  ctx.font = `${fontSize}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";

  ctx.shadowColor = "rgba(255, 255, 255, 0.35)";
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  const startY = canvasHeight / 2 - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((text, index) => {
    ctx.fillText(text, canvasWidth / 2, startY + index * lineHeight);
  });

  ctx.restore();
}

function columnRandom(x) {
  const value = Math.sin(x * 127.1 + 311.7) * 43758.5453123;
  return value - Math.floor(value);
}

function createVerticalPixelSort(sourceImageData, width, height) {
  const source = sourceImageData.data;
  const output = new Uint8ClampedArray(source);

  for (let x = 0; x < width; x++) {
    const pixels = [];

    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;

      const r = source[index];
      const g = source[index + 1];
      const b = source[index + 2];
      const a = source[index + 3];

      const brightness = r * 0.299 + g * 0.587 + b * 0.114;

      pixels.push({
        r,
        g,
        b,
        a,
        brightness: brightness + columnRandom(x + y * 0.13) * 22
      });
    }

    /*
      Сортировка по яркости.
      Темные пиксели уходят выше, светлые собираются ниже.
      Это дает ощущение стекания изображения вниз.
    */
    pixels.sort((a, b) => a.brightness - b.brightness);

    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;
      const pixel = pixels[y];

      output[index] = pixel.r;
      output[index + 1] = pixel.g;
      output[index + 2] = pixel.b;
      output[index + 3] = pixel.a;
    }
  }

  return new ImageData(output, width, height);
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function renderPixelSortFrame(ctx, sourceImageData, sortedImageData, width, height, progress) {
  const source = sourceImageData.data;
  const sorted = sortedImageData.data;

  const frame = ctx.createImageData(width, height);
  const output = frame.data;

  const easedProgress = smoothStep(progress);

  for (let x = 0; x < width; x++) {
    const columnDelay = columnRandom(x) * 0.24;
    const localProgress = clamp01((easedProgress - columnDelay) / (1 - columnDelay));

    const randomPower = 0.75 + columnRandom(x * 4.91) * 1.45;
    const fallDistance = Math.floor(localProgress * localProgress * height * randomPower);

    /*
      Чем дальше эффект, тем выше начинается длинный след.
      Главное: след всегда продолжается до самого низа.
    */
    const trailStart = Math.floor(height * (1 - localProgress * randomPower));
    const safeTrailStart = Math.max(0, Math.min(height - 1, trailStart));

    for (let y = 0; y < height; y++) {
      const index = (y * width + x) * 4;

      const shiftedY = Math.max(0, y - fallDistance);
      const shiftedIndex = (shiftedY * width + x) * 4;

      const sortedIndex = index;

      let r = source[shiftedIndex] * (1 - localProgress) + sorted[sortedIndex] * localProgress;
      let g = source[shiftedIndex + 1] * (1 - localProgress) + sorted[sortedIndex + 1] * localProgress;
      let b = source[shiftedIndex + 2] * (1 - localProgress) + sorted[sortedIndex + 2] * localProgress;
      let a = 255;

      /*
        Вертикальное растягивание вниз.
        Если пиксель ниже точки начала следа — он берёт цвет сверху
        и превращается в длинную стекающую полосу до самого низа.
      */
      if (localProgress > 0.04 && y >= safeTrailStart) {
        const trailLength = height - safeTrailStart;
        const trailProgress = trailLength > 0
          ? (y - safeTrailStart) / trailLength
          : 1;

        const smearSourceY = Math.max(
          0,
          Math.min(
            height - 1,
            safeTrailStart - Math.floor(columnRandom(x * 8.13) * 18)
          )
        );

        const smearIndex = (smearSourceY * width + x) * 4;

        const pulse = 0.65 + columnRandom(x * 2.77 + y * 0.011) * 0.35;
        const trailMix = clamp01(localProgress * 1.35) * pulse;

        const fade = 1 - trailProgress * 0.18;

        r = r * (1 - trailMix) + source[smearIndex] * trailMix * fade;
        g = g * (1 - trailMix) + source[smearIndex + 1] * trailMix * fade;
        b = b * (1 - trailMix) + source[smearIndex + 2] * trailMix * fade;
      }

      /*
        Ближе к концу усиливаем отсортированное состояние,
        чтобы изображение окончательно распалось.
      */
      const finalMix = clamp01((localProgress - 0.58) / 0.42);

      output[index] = r * (1 - finalMix) + sorted[sortedIndex] * finalMix;
      output[index + 1] = g * (1 - finalMix) + sorted[sortedIndex + 1] * finalMix;
      output[index + 2] = b * (1 - finalMix) + sorted[sortedIndex + 2] * finalMix;
      output[index + 3] = a;
    }
  }

  ctx.putImageData(frame, 0, 0);
}

async function drawCurrentIntroScene(ctx, canvasWidth, canvasHeight, scale) {
  const bgImage = await loadTransitionImage(CONFIG.transitionBgImage);
  const centerImage = await loadTransitionImage(CONFIG.transitionCenterImage);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (bgImage) {
    drawImageCover(ctx, bgImage, canvasWidth, canvasHeight);
  }

  ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (centerImage) {
    const boxWidth = Math.min(520, window.innerWidth * 0.82) * scale;
    const boxHeight = 320 * scale;

    drawImageContain(
      ctx,
      centerImage,
      canvasWidth / 2,
      canvasHeight / 2,
      boxWidth,
      boxHeight,
      0.82
    );
  }

  drawCurrentTextToCanvas(ctx, canvasWidth, canvasHeight, scale);
}

function animatePixelSortTransition(ctx, sourceImageData, sortedImageData, width, height) {
  return new Promise(resolve => {
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = clamp01(elapsed / CONFIG.transitionDuration);

      renderPixelSortFrame(
        ctx,
        sourceImageData,
        sortedImageData,
        width,
        height,
        progress
      );

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(frame);
  });
}

async function startPixelSortPageTransition() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const scale = CONFIG.transitionCanvasScale;

  canvas.className = "transition-canvas";
  canvas.width = Math.floor(window.innerWidth * scale);
  canvas.height = Math.floor(window.innerHeight * scale);
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";

  document.body.appendChild(canvas);

  await drawCurrentIntroScene(ctx, canvas.width, canvas.height, scale);

  canvas.classList.add("visible");

  await sleep(180);

  const sourceImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const sortedImageData = createVerticalPixelSort(
    sourceImageData,
    canvas.width,
    canvas.height
  );

  await animatePixelSortTransition(
    ctx,
    sourceImageData,
    sortedImageData,
    canvas.width,
    canvas.height
  );
}

startFirstSequence();
