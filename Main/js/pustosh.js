const pustoshViewport = document.getElementById("pustoshViewport");
const pustoshWorld = document.getElementById("pustoshWorld");
const pustoshBg = document.getElementById("pustoshBg");
const pustoshPlayer = document.getElementById("pustoshPlayer");
const pustoshWasdHint = document.getElementById("pustoshWasdHint");


const pustoshCollisionMap = document.getElementById("pustoshCollisionMap");
const pustoshZonePrompt = document.getElementById("pustoshZonePrompt");

const pustoshMemoryOverlay = document.getElementById("pustoshMemoryOverlay");
const pustoshMemoryText = document.getElementById("pustoshMemoryText");
const pustoshMemoryHint = document.getElementById("pustoshMemoryHint");

const pustoshAmbientGlitchCanvas = document.getElementById("pustoshAmbientGlitchCanvas");
const pustoshAmbientGlitchCtx = pustoshAmbientGlitchCanvas.getContext("2d", {
  willReadFrequently: true
});

const pustoshDestroyCanvas = document.getElementById("pustoshDestroyCanvas");
const pustoshDestroyCtx = pustoshDestroyCanvas.getContext("2d", {
  willReadFrequently: true
});

const pustoshWhiteNoiseAudio = document.getElementById("pustoshWhiteNoiseAudio");



const pustoshGlitchCanvas = document.getElementById("pustoshGlitchCanvas");
const pustoshGlitchCtx = pustoshGlitchCanvas.getContext("2d", {
  willReadFrequently: true
});

const CONFIG = {
  
finalDestroyImage: "img/white-memory-bg.jpg",

  playerSpeed: 5,
  playerWidth: 90,

  worldScale: 1,
  cameraVerticalFocus: 0.58,

  startXRatio: 0.5,
  startYRatio: 0.09,

  wasdHintDelay: 900,

  whiteNoiseVolume: 0.42,

  collisionRadius: 20,
  contactRadius: 46,
  collisionGreyTolerance: 18,
  collisionColorTolerance: 6,

  memoryColor: [42, 255, 2],
  destroyColor: [22, 6, 255],

  memoryTypingSpeed: 45,
  memoryLineDelay: 420,
  memoryReentryCooldown: 4000,

  ambientGlitchFPS: 24,

  destroyDuration: 4000,

  entranceGlitchDuration: 1900,
  entranceGlitchScale: 0.62,
  entranceRevealMoment: 0.68,

  backgroundImage: "img/pustosh-bg.jpg"
};

const keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

const playerPos = {
  x: 0,
  y: 0
};

const worldSize = {
  width: 0,
  height: 0
};


const cameraPos = {
  x: 0,
  y: 0
};

const pustoshMemoryLines = [
  "Почему ты меня оставил?",
  "Сколько лет уже прошло?",
  "Я уже давно сбился со счета.",
  "Отец, теперь этот мир принадлежит мне. Теперь я есть мера жизни.",
  "Я уничтожил слабых.",
  "Уничтожил малодушных.",
  "Я воздвиг дворцы, замки и небоскребы.",
  "В этом мире больше нет места страху, ненависти.",
  "Но оказалось, что не осталось места и для любви.",
  "И красота стала мерой смерти."
];
let memoryZoneCooldownUntil = 0;
let currentPustoshContactZone = null;

let pustoshMemoryActive = false;
let pustoshMemoryTyping = false;
let pustoshMemoryLineIndex = -1;

let ambientGlitchActive = false;
let ambientGlitchLastFrame = 0;

let destroyActive = false;

let collisionReady = false;
let collisionImageData = null;

const pustoshCollisionCanvas = document.createElement("canvas");
const pustoshCollisionCtx = pustoshCollisionCanvas.getContext("2d", {
  willReadFrequently: true
});


let controlsEnabled = false;
let worldInitialized = false;
let mouseHidden = false;

function isMemoryZoneOnCooldown() {
  return performance.now() < memoryZoneCooldownUntil;
}

function startMemoryZoneCooldown() {
  memoryZoneCooldownUntil = performance.now() + CONFIG.memoryReentryCooldown;
}

function resizeOverlayCanvases() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  pustoshAmbientGlitchCanvas.width = width;
  pustoshAmbientGlitchCanvas.height = height;

  pustoshDestroyCanvas.width = width;
  pustoshDestroyCanvas.height = height;
}

function startAmbientGlitch() {
  if (ambientGlitchActive) return;

  ambientGlitchActive = true;

  document.body.classList.add("pustosh-ambient-active");
  pustoshAmbientGlitchCanvas.classList.add("active");

  requestAnimationFrame(renderAmbientGlitch);
}

function renderAmbientGlitch(now) {
  if (!ambientGlitchActive) return;

  requestAnimationFrame(renderAmbientGlitch);

  if (now - ambientGlitchLastFrame < 1000 / CONFIG.ambientGlitchFPS) return;
  ambientGlitchLastFrame = now;

  const width = pustoshAmbientGlitchCanvas.width;
  const height = pustoshAmbientGlitchCanvas.height;

  pustoshAmbientGlitchCtx.clearRect(0, 0, width, height);

  /*
    Белые горизонтальные срывы.
  */
  const strips = 24 + Math.floor(Math.random() * 26);

  for (let i = 0; i < strips; i++) {
    const y = Math.random() * height;
    const h = 1 + Math.random() * 9;
    const x = (Math.random() - 0.5) * 48;

    const alpha = 0.045 + Math.random() * 0.13;

    pustoshAmbientGlitchCtx.fillStyle =
      `rgba(255, 255, 255, ${alpha})`;

    pustoshAmbientGlitchCtx.fillRect(x, y, width, h);
  }

  /*
    Красные цифровые разрывы.
  */
  if (Math.random() < 0.72) {
    const count = 3 + Math.floor(Math.random() * 7);

    for (let i = 0; i < count; i++) {
      pustoshAmbientGlitchCtx.fillStyle =
        `rgba(255, 30, 22, ${0.035 + Math.random() * 0.11})`;

      pustoshAmbientGlitchCtx.fillRect(
        (Math.random() - 0.5) * 80,
        Math.random() * height,
        width,
        2 + Math.random() * 12
      );
    }
  }

  /*
    Синие/фиолетовые сдвиги.
  */
  if (Math.random() < 0.48) {
    const count = 2 + Math.floor(Math.random() * 5);

    for (let i = 0; i < count; i++) {
      pustoshAmbientGlitchCtx.fillStyle =
        `rgba(70, 60, 255, ${0.025 + Math.random() * 0.08})`;

      pustoshAmbientGlitchCtx.fillRect(
        (Math.random() - 0.5) * 100,
        Math.random() * height,
        width,
        2 + Math.random() * 10
      );
    }
  }

  /*
    Редкие крупные шумовые блоки.
  */
  if (Math.random() < 0.28) {
    const blockCount = 1 + Math.floor(Math.random() * 4);

    for (let i = 0; i < blockCount; i++) {
      const blockW = 80 + Math.random() * width * 0.34;
      const blockH = 4 + Math.random() * 22;

      pustoshAmbientGlitchCtx.fillStyle =
        `rgba(255, 255, 255, ${0.025 + Math.random() * 0.075})`;

      pustoshAmbientGlitchCtx.fillRect(
        Math.random() * width,
        Math.random() * height,
        blockW,
        blockH
      );
    }
  }
}

function drawCurrentViewportTo(ctx, width, height) {
  if (!pustoshBg || !pustoshBg.naturalWidth || !pustoshBg.naturalHeight) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
    return;
  }

  const sourceX =
    (cameraPos.x / worldSize.width) * pustoshBg.naturalWidth;

  const sourceY =
    (cameraPos.y / worldSize.height) * pustoshBg.naturalHeight;

  const sourceW =
    (window.innerWidth / worldSize.width) * pustoshBg.naturalWidth;

  const sourceH =
    (window.innerHeight / worldSize.height) * pustoshBg.naturalHeight;

  ctx.drawImage(
    pustoshBg,
    sourceX,
    sourceY,
    sourceW,
    sourceH,
    0,
    0,
    width,
    height
  );
}

function startDestroySequence() {
  if (destroyActive) return;

  destroyActive = true;
  controlsEnabled = false;
  resetMovementKeys();

  if (pustoshZonePrompt) {
    pustoshZonePrompt.classList.remove("visible");
  }

  document.body.classList.add("pustosh-destroying");
  pustoshDestroyCanvas.classList.add("active");

  const startTime = performance.now();

  function frame(now) {
    const progress = clamp01((now - startTime) / CONFIG.destroyDuration);

    drawDestroyFrame(progress);

    if (progress < 1) {
      requestAnimationFrame(frame);
    } else {
      finishDestroySequence();
    }
  }

  requestAnimationFrame(frame);
}

function drawDestroyFrame(progress) {
  const width = pustoshDestroyCanvas.width;
  const height = pustoshDestroyCanvas.height;

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = width;
  tempCanvas.height = height;

  drawCurrentViewportTo(tempCtx, width, height);

  pustoshDestroyCtx.fillStyle = "#000";
  pustoshDestroyCtx.fillRect(0, 0, width, height);

  const strips = Math.floor(18 + progress * 170);

  for (let i = 0; i < strips; i++) {
    const sourceY = Math.floor(Math.random() * height);
    const sliceHeight = Math.floor(2 + Math.random() * (8 + progress * 48));

    const offsetX = Math.floor(
      (Math.random() - 0.5) * width * (0.04 + progress * 0.72)
    );

    const targetY = sourceY + Math.floor((Math.random() - 0.5) * progress * 40);

    pustoshDestroyCtx.globalAlpha = 0.18 + progress * 0.9;

    pustoshDestroyCtx.drawImage(
      tempCanvas,
      0,
      sourceY,
      width,
      sliceHeight,
      offsetX,
      targetY,
      width,
      sliceHeight
    );
  }

  pustoshDestroyCtx.globalAlpha = 1;

  const noiseBlocks = Math.floor(progress * 120);

  for (let i = 0; i < noiseBlocks; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 12 + Math.random() * width * 0.28;
    const h = 1 + Math.random() * 12;

    const alpha = 0.04 + Math.random() * 0.22 * progress;

    pustoshDestroyCtx.fillStyle =
      Math.random() < 0.5
        ? `rgba(255,255,255,${alpha})`
        : `rgba(255,0,0,${alpha})`;

    pustoshDestroyCtx.fillRect(x, y, w, h);
  }

  pustoshDestroyCtx.fillStyle = `rgba(0, 0, 0, ${progress * 0.62})`;
  pustoshDestroyCtx.fillRect(0, 0, width, height);
}

function finishDestroySequence() {
  document.body.classList.add("pustosh-closed");

  if (pustoshWhiteNoiseAudio) {
    pustoshWhiteNoiseAudio.pause();
    pustoshWhiteNoiseAudio.currentTime = 0;
  }

  /*
    После полного глитча не закрываем вкладку,
    а перекрываем весь сайт финальным изображением.
  */
  const finalScreen = document.createElement("div");
  finalScreen.className = "pustosh-final-screen";

  const finalImage = document.createElement("img");
  finalImage.src = CONFIG.finalDestroyImage;
  finalImage.alt = "";

  finalScreen.appendChild(finalImage);
  document.body.appendChild(finalScreen);

  /*
    Небольшая задержка нужна, чтобы браузер успел вставить элемент,
    и fade-in сработал плавно.
  */
  requestAnimationFrame(() => {
    finalScreen.classList.add("visible");
  });

  /*
    Отключаем игровые слои после появления финального изображения.
  */
  setTimeout(() => {
    if (pustoshViewport) {
      pustoshViewport.style.display = "none";
    }

    if (pustoshAmbientGlitchCanvas) {
      pustoshAmbientGlitchCanvas.style.display = "none";
    }

    if (pustoshDestroyCanvas) {
      pustoshDestroyCanvas.style.display = "none";
    }

    if (pustoshGlitchCanvas) {
      pustoshGlitchCanvas.style.display = "none";
    }

    const flash = document.getElementById("pustoshGlitchFlash");

    if (flash) {
      flash.style.display = "none";
    }
  }, 1500);
}

function activatePustoshContactZone() {
  if (!currentPustoshContactZone) return;

  if (currentPustoshContactZone.type === "memory") {
    startPustoshMemoryScene();
    return;
  }

  if (currentPustoshContactZone.type === "destroy") {
    startDestroySequence();
  }
}

function resetMovementKeys() {
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
}

function showPustoshMemoryHint() {
  if (!pustoshMemoryHint) return;

  pustoshMemoryHint.classList.add("visible");
}

function hidePustoshMemoryHint() {
  if (!pustoshMemoryHint) return;

  pustoshMemoryHint.classList.remove("visible");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function typePustoshMemoryLine(text) {
  if (!pustoshMemoryText) return;

  const oldLines = pustoshMemoryText.querySelectorAll(".pustosh-memory-line");
  oldLines.forEach(line => line.classList.add("old"));

  const line = document.createElement("div");
  line.className = "pustosh-memory-line";

  pustoshMemoryText.appendChild(line);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (char === "\n") {
      line.appendChild(document.createElement("br"));
    } else {
      line.appendChild(document.createTextNode(char));
    }

    await sleep(CONFIG.memoryTypingSpeed);
  }
}

async function typeNextPustoshMemoryLine() {
  if (!pustoshMemoryActive || pustoshMemoryTyping) return;

  hidePustoshMemoryHint();

  pustoshMemoryTyping = true;
  pustoshMemoryLineIndex++;

  if (pustoshMemoryLineIndex < pustoshMemoryLines.length) {
    await typePustoshMemoryLine(
      pustoshMemoryLines[pustoshMemoryLineIndex]
    );
  }

  pustoshMemoryTyping = false;

  if (pustoshMemoryLineIndex >= pustoshMemoryLines.length - 1) {
    await sleep(900);
    finishPustoshMemoryScene();
    return;
  }

  await sleep(CONFIG.memoryLineDelay);
  showPustoshMemoryHint();
}

function startPustoshMemoryScene() {
  if (pustoshMemoryActive || destroyActive) return;

  pustoshMemoryActive = true;
  pustoshMemoryTyping = false;
  pustoshMemoryLineIndex = -1;

  controlsEnabled = false;
  resetMovementKeys();

  if (pustoshZonePrompt) {
    pustoshZonePrompt.classList.remove("visible");
  }

  if (pustoshMemoryText) {
    pustoshMemoryText.innerHTML = "";
  }

  hidePustoshMemoryHint();

  pustoshMemoryOverlay.classList.add("visible");

  typeNextPustoshMemoryLine();
}

function finishPustoshMemoryScene() {
  pustoshMemoryActive = false;
  pustoshMemoryTyping = false;

  hidePustoshMemoryHint();

  pustoshMemoryOverlay.classList.remove("visible");

  /*
    После выхода из зелёной зоны 4 секунды нельзя снова её активировать.
  */
  startMemoryZoneCooldown();
  currentPustoshContactZone = null;

  if (pustoshZonePrompt) {
    pustoshZonePrompt.classList.remove("visible");
  }

  setTimeout(() => {
    if (pustoshMemoryText) {
      pustoshMemoryText.innerHTML = "";
    }

    controlsEnabled = true;
    startAmbientGlitch();
  }, 900);
}

function isColorNear(r, g, b, target, tolerance) {
  return (
    Math.abs(r - target[0]) <= tolerance &&
    Math.abs(g - target[1]) <= tolerance &&
    Math.abs(b - target[2]) <= tolerance
  );
}

function isPustoshGreyPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  return max - min <= CONFIG.collisionGreyTolerance;
}

function setupPustoshCollisionMap() {
  if (!pustoshCollisionMap) {
    console.warn("pustoshCollisionMap не найден");
    return;
  }

  if (!pustoshCollisionMap.naturalWidth || !pustoshCollisionMap.naturalHeight) {
    console.warn("collision2.png ещё не загружен");
    return;
  }

  pustoshCollisionCanvas.width = pustoshCollisionMap.naturalWidth;
  pustoshCollisionCanvas.height = pustoshCollisionMap.naturalHeight;

  pustoshCollisionCtx.clearRect(
    0,
    0,
    pustoshCollisionCanvas.width,
    pustoshCollisionCanvas.height
  );

  pustoshCollisionCtx.drawImage(
    pustoshCollisionMap,
    0,
    0,
    pustoshCollisionCanvas.width,
    pustoshCollisionCanvas.height
  );

  collisionImageData = pustoshCollisionCtx.getImageData(
    0,
    0,
    pustoshCollisionCanvas.width,
    pustoshCollisionCanvas.height
  );

  collisionReady = true;
}

function worldToCollisionPoint(worldX, worldY) {
  return {
    x: (worldX / worldSize.width) * pustoshCollisionCanvas.width,
    y: (worldY / worldSize.height) * pustoshCollisionCanvas.height
  };
}

function getPustoshCollisionZoneAtWorld(worldX, worldY) {
  if (!collisionReady || !collisionImageData) {
    return {
      type: "free",
      blocked: false
    };
  }

  const point = worldToCollisionPoint(worldX, worldY);

  const x = Math.floor(point.x);
  const y = Math.floor(point.y);

  if (
    x < 0 ||
    y < 0 ||
    x >= pustoshCollisionCanvas.width ||
    y >= pustoshCollisionCanvas.height
  ) {
    return {
      type: "solid",
      blocked: true
    };
  }

  const index = (y * pustoshCollisionCanvas.width + x) * 4;

  const r = collisionImageData.data[index];
  const g = collisionImageData.data[index + 1];
  const b = collisionImageData.data[index + 2];
  const a = collisionImageData.data[index + 3];

  if (a < 10) {
    return {
      type: "free",
      blocked: false
    };
  }

  if (isColorNear(r, g, b, CONFIG.memoryColor, CONFIG.collisionColorTolerance)) {
    return {
      type: "memory",
      blocked: true,
      prompt: "Вспомнить?"
    };
  }

  if (isColorNear(r, g, b, CONFIG.destroyColor, CONFIG.collisionColorTolerance)) {
    return {
      type: "destroy",
      blocked: true,
      prompt: "Уничтожить?"
    };
  }

  /*
    Серые зоны — проходимые.
    Все несерые зоны — непроходимые.
  */
  if (isPustoshGreyPixel(r, g, b)) {
    return {
      type: "free",
      blocked: false
    };
  }

  return {
    type: "solid",
    blocked: true
  };
}

function getPustoshBlockingZoneAtPosition(x, y, radius) {
  const points = [
    [x, y],
    [x - radius, y],
    [x + radius, y],
    [x, y - radius],
    [x, y + radius],
    [x - radius * 0.7, y - radius * 0.7],
    [x + radius * 0.7, y - radius * 0.7],
    [x - radius * 0.7, y + radius * 0.7],
    [x + radius * 0.7, y + radius * 0.7]
  ];

  let fallbackSolid = null;

  for (const point of points) {
    const zone = getPustoshCollisionZoneAtWorld(point[0], point[1]);

    if (!zone.blocked) continue;

    if (zone.type === "memory" || zone.type === "destroy") {
      return zone;
    }

    fallbackSolid = zone;
  }

  return fallbackSolid || {
    type: "free",
    blocked: false
  };
}

function detectPustoshNearbyInteractiveZone(x, y) {
  const zone = getPustoshBlockingZoneAtPosition(
    x,
    y,
    CONFIG.contactRadius
  );

  if (zone.type === "memory" || zone.type === "destroy") {
    return zone;
  }

  return null;
}

function setPustoshContactZone(zone) {
  if (pustoshMemoryActive || destroyActive) return;

  /*
    Если зелёная зона на cooldown, она временно не реагирует.
  */
  if (zone && zone.type === "memory" && isMemoryZoneOnCooldown()) {
    currentPustoshContactZone = null;

    if (pustoshZonePrompt) {
      pustoshZonePrompt.classList.remove("visible");
    }

    return;
  }

  const oldType = currentPustoshContactZone
    ? currentPustoshContactZone.type
    : null;

  const newType = zone ? zone.type : null;

  if (oldType === newType) return;

  currentPustoshContactZone = zone;

  if (!zone) {
    if (pustoshZonePrompt) {
      pustoshZonePrompt.classList.remove("visible");
    }

    return;
  }

  if (pustoshZonePrompt) {
    pustoshZonePrompt.textContent = zone.prompt;
    pustoshZonePrompt.classList.add("visible");
  }
}


function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function showWasdHint() {
  if (!pustoshWasdHint) return;

  setTimeout(() => {
    if (controlsEnabled) {
      pustoshWasdHint.classList.add("visible");
    }
  }, CONFIG.wasdHintDelay);
}

function hideWasdHint() {
  if (!pustoshWasdHint) return;

  pustoshWasdHint.classList.remove("visible");
}

function hideCursorAfterMovement() {
  if (mouseHidden) return;

  mouseHidden = true;
  document.body.classList.add("cursor-hidden");
}

function showCursor() {
  mouseHidden = false;
  document.body.classList.remove("cursor-hidden");
}

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error("Не найден фон Пустоши:", src);
      resolve(null);
    };

    img.src = src;
  });
}

/* ---------- Размер мира ---------- */


function startPustoshWhiteNoise() {
  if (!pustoshWhiteNoiseAudio) return;

  pustoshWhiteNoiseAudio.volume = CONFIG.whiteNoiseVolume;
  pustoshWhiteNoiseAudio.loop = true;

  const playPromise = pustoshWhiteNoiseAudio.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      /*
        Браузер может заблокировать autoplay.
        Тогда шум запустится после первого нажатия клавиши.
      */
    });
  }
}


function updateWorldSize() {
  if (!pustoshBg || !pustoshBg.naturalWidth || !pustoshBg.naturalHeight) {
    return;
  }

  const naturalWidth = pustoshBg.naturalWidth;
  const naturalHeight = pustoshBg.naturalHeight;
  const imageRatio = naturalWidth / naturalHeight;

  /*
    Карта должна быть как минимум размером с экран.
    Если изображение большое — берём его размер с масштабом.
  */
  let targetWidth = naturalWidth * CONFIG.worldScale;
  let targetHeight = naturalHeight * CONFIG.worldScale;

  if (targetWidth < window.innerWidth) {
    targetWidth = window.innerWidth;
    targetHeight = targetWidth / imageRatio;
  }

  if (targetHeight < window.innerHeight) {
    targetHeight = window.innerHeight;
    targetWidth = targetHeight * imageRatio;
  }

  worldSize.width = targetWidth;
  worldSize.height = targetHeight;

  pustoshWorld.style.width = `${worldSize.width}px`;
  pustoshWorld.style.height = `${worldSize.height}px`;

  pustoshBg.style.width = `${worldSize.width}px`;
  pustoshBg.style.height = `${worldSize.height}px`;

  pustoshPlayer.style.setProperty(
    "--player-width",
    `${CONFIG.playerWidth}px`
  );
}

function placePlayer() {
  pustoshPlayer.style.left = `${playerPos.x}px`;
  pustoshPlayer.style.top = `${playerPos.y}px`;
}

function updateCamera() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let cameraX = playerPos.x - viewportWidth / 2;
  let cameraY = playerPos.y - viewportHeight * CONFIG.cameraVerticalFocus;

  const maxCameraX = Math.max(0, worldSize.width - viewportWidth);
  const maxCameraY = Math.max(0, worldSize.height - viewportHeight);

  cameraX = clamp(cameraX, 0, maxCameraX);
  cameraY = clamp(cameraY, 0, maxCameraY);
cameraPos.x = cameraX;
cameraPos.y = cameraY;

  const translateX = -cameraX;
const translateY = -cameraY;

pustoshWorld.style.setProperty("--camera-x", `${translateX}px`);
pustoshWorld.style.setProperty("--camera-y", `${translateY}px`);

pustoshWorld.style.transform =
  `translate3d(${translateX}px, ${translateY}px, 0)`;
}

function canMoveTo(x, y) {
  const zone = getPustoshBlockingZoneAtPosition(
    x,
    y,
    CONFIG.collisionRadius
  );

  return !zone.blocked;
}

function applyPlayerPosition() {
  const halfWidth = CONFIG.playerWidth / 2;

  playerPos.x = clamp(
    playerPos.x,
    halfWidth,
    worldSize.width - halfWidth
  );

  playerPos.y = clamp(
    playerPos.y,
    CONFIG.playerWidth,
    worldSize.height - 4
  );

  placePlayer();
  updateCamera();
}

function movePlayerWithCollision(dx, dy) {
  const nextX = playerPos.x + dx;
  const nextY = playerPos.y + dy;

  if (canMoveTo(nextX, nextY)) {
    playerPos.x = nextX;
    playerPos.y = nextY;
    applyPlayerPosition();
    return;
  }

  if (canMoveTo(nextX, playerPos.y)) {
    playerPos.x = nextX;
  }

  if (canMoveTo(playerPos.x, nextY)) {
    playerPos.y = nextY;
  }

  applyPlayerPosition();
}

function gameLoop() {
  let dx = 0;
  let dy = 0;

  if (controlsEnabled) {
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
  }

  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);

    dx /= length;
    dy /= length;

    movePlayerWithCollision(
  dx * CONFIG.playerSpeed,
  dy * CONFIG.playerSpeed
);
  }
const nearbyZone = detectPustoshNearbyInteractiveZone(
  playerPos.x,
  playerPos.y
);

setPustoshContactZone(nearbyZone);
  requestAnimationFrame(gameLoop);
}

/* ---------- Глитч-вход ---------- */

function resizeGlitchCanvas() {
  const scale = CONFIG.entranceGlitchScale;

  pustoshGlitchCanvas.width = Math.floor(window.innerWidth * scale);
  pustoshGlitchCanvas.height = Math.floor(window.innerHeight * scale);

  pustoshGlitchCanvas.style.width = "100vw";
  pustoshGlitchCanvas.style.height = "100vh";
}

function drawImageCover(ctx, img, width, height) {
  const imageRatio = img.naturalWidth / img.naturalHeight;
  const canvasRatio = width / height;

  let drawWidth;
  let drawHeight;
  let drawX;
  let drawY;

  if (imageRatio > canvasRatio) {
    drawHeight = height;
    drawWidth = height * imageRatio;
    drawX = (width - drawWidth) / 2;
    drawY = 0;
  } else {
    drawWidth = width;
    drawHeight = width / imageRatio;
    drawX = 0;
    drawY = (height - drawHeight) / 2;
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
}

function createBaseCanvas(bgImage) {
  const baseCanvas = document.createElement("canvas");
  const baseCtx = baseCanvas.getContext("2d");

  baseCanvas.width = pustoshGlitchCanvas.width;
  baseCanvas.height = pustoshGlitchCanvas.height;

  baseCtx.fillStyle = "#000";
  baseCtx.fillRect(0, 0, baseCanvas.width, baseCanvas.height);

  if (bgImage) {
    drawImageCover(baseCtx, bgImage, baseCanvas.width, baseCanvas.height);
  }

  return baseCanvas;
}

function drawGlitchFrame(ctx, baseCanvas, progress) {
  const width = pustoshGlitchCanvas.width;
  const height = pustoshGlitchCanvas.height;

  const reveal = smoothStep(progress);
  const intensity = 1 - reveal;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  const stableAlpha = clamp01((reveal - 0.35) / 0.65);

  ctx.globalAlpha = stableAlpha;
  ctx.drawImage(baseCanvas, 0, 0);
  ctx.globalAlpha = 1;

  const stripCount = Math.floor(22 + intensity * 90);

  for (let i = 0; i < stripCount; i++) {
    const sliceHeight = Math.floor(2 + Math.random() * (8 + intensity * 34));
    const sourceY = Math.floor(Math.random() * height);

    const maxOffset = width * (0.04 + intensity * 0.32);
    const offsetX = Math.floor((Math.random() - 0.5) * maxOffset);

    const targetY =
      sourceY + Math.floor((Math.random() - 0.5) * intensity * 22);

    const alpha = clamp01(0.18 + reveal * 0.85 + Math.random() * 0.22);

    ctx.globalAlpha = alpha;

    ctx.drawImage(
      baseCanvas,
      0,
      sourceY,
      width,
      sliceHeight,
      offsetX,
      targetY,
      width,
      sliceHeight
    );
  }

  ctx.globalAlpha = 1;

  const blockCount = Math.floor(intensity * 46);

  for (let i = 0; i < blockCount; i++) {
    const blockW = Math.floor(8 + Math.random() * width * 0.18);
    const blockH = Math.floor(1 + Math.random() * 8);

    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    const alpha = Math.random() * 0.24 * intensity;

    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, blockW, blockH);
  }

  if (progress > 0.78 && progress < 0.86) {
    const flash = 1 - Math.abs(progress - 0.82) / 0.04;

    ctx.fillStyle = `rgba(255, 255, 255, ${clamp01(flash) * 0.16})`;
    ctx.fillRect(0, 0, width, height);
  }
}

async function playPustoshEntranceGlitch() {
  resizeGlitchCanvas();

  const bgImage = await loadImage(CONFIG.backgroundImage);
  const baseCanvas = createBaseCanvas(bgImage);

  let normalSceneRevealed = false;

  return new Promise(resolve => {
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = clamp01(elapsed / CONFIG.entranceGlitchDuration);

      drawGlitchFrame(pustoshGlitchCtx, baseCanvas, progress);

      if (!normalSceneRevealed && progress >= CONFIG.entranceRevealMoment) {
        normalSceneRevealed = true;

        document.body.classList.remove("pustosh-hidden");
        document.body.classList.add("pustosh-ready");
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        pustoshGlitchCanvas.classList.add("hidden");

        document.body.classList.remove("pustosh-loading");
        document.body.classList.remove("pustosh-hidden");
        document.body.classList.add("pustosh-ready");

        setTimeout(() => {
          pustoshGlitchCanvas.remove();

          const flash = document.getElementById("pustoshGlitchFlash");
          if (flash) flash.remove();

          resolve();
        }, 700);
      }
    }

    requestAnimationFrame(frame);
  });
}

/* ---------- Управление ---------- */

window.addEventListener("keydown", event => {
  startPustoshWhiteNoise();

  if (event.code === "Escape") {
    showCursor();
    return;
  }

  if (destroyActive) {
    event.preventDefault();
    return;
  }

  if (pustoshMemoryActive) {
    if (event.code === "Space") {
      event.preventDefault();
      typeNextPustoshMemoryLine();
    }

    return;
  }

  if (event.code === "Space") {
    if (currentPustoshContactZone) {
      event.preventDefault();
      activatePustoshContactZone();
    }

    return;
  }

  const movementCodes = ["KeyW", "KeyA", "KeyS", "KeyD"];

  if (movementCodes.includes(event.code)) {
    event.preventDefault();

    hideWasdHint();
    hideCursorAfterMovement();
  }

  if (event.code === "KeyW") keys.w = true;
  if (event.code === "KeyA") keys.a = true;
  if (event.code === "KeyS") keys.s = true;
  if (event.code === "KeyD") keys.d = true;
});

window.addEventListener("keyup", event => {
  if (event.code === "KeyW") keys.w = false;
  if (event.code === "KeyA") keys.a = false;
  if (event.code === "KeyS") keys.s = false;
  if (event.code === "KeyD") keys.d = false;
});

window.addEventListener("blur", () => {
  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;
});



window.addEventListener("resize", () => {
  updateWorldSize();
  resizeOverlayCanvases();

  playerPos.x = clamp(playerPos.x, 0, worldSize.width);
  playerPos.y = clamp(playerPos.y, 0, worldSize.height);

  placePlayer();
  updateCamera();
  resizeGlitchCanvas();
});

/* ---------- Инициализация ---------- */

async function initializePustosh() {
  if (worldInitialized) return;

  worldInitialized = true;

  /*
    Ждём загрузку фона.
  */
  if (pustoshBg && !pustoshBg.complete) {
    await new Promise(resolve => {
      pustoshBg.onload = resolve;
      pustoshBg.onerror = resolve;
    });
  }

  /*
    Ждём загрузку карты коллизий collision2.png.
    ВАЖНО: этот await должен быть только внутри async-функции.
  */
  if (pustoshCollisionMap && !pustoshCollisionMap.complete) {
    await new Promise(resolve => {
      pustoshCollisionMap.onload = resolve;
      pustoshCollisionMap.onerror = resolve;
    });
  }

  updateWorldSize();

  setupPustoshCollisionMap();
  resizeOverlayCanvases();

  playerPos.x = worldSize.width * CONFIG.startXRatio;
  playerPos.y = worldSize.height * CONFIG.startYRatio;

  placePlayer();
  updateCamera();

  gameLoop();

  await playPustoshEntranceGlitch();

  startPustoshWhiteNoise();

  controlsEnabled = true;
  showWasdHint();
}

initializePustosh();