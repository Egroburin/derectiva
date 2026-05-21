const world = document.getElementById("world");
const worldBg = document.getElementById("worldBg");
const collisionMap = document.getElementById("collisionMap");
const player = document.getElementById("player");

const glitchCanvas = document.getElementById("glitchCanvas");
const glitchCtx = glitchCanvas.getContext("2d", { willReadFrequently: true });

const zonePrompt = document.getElementById("zonePrompt");

const worldBalletAudio = document.getElementById("worldBalletAudio");
const wasdHint = document.getElementById("wasdHint");

const textSwarmOverlay = document.getElementById("textSwarmOverlay");
const textSwarmLayer = document.getElementById("textSwarmLayer");

const terminalVideo = document.getElementById("terminalVideo");
const terminalZoneText = document.getElementById("terminalZoneText");

const textSwarmExitHint = document.getElementById("textSwarmExitHint");
const lampLayer = document.getElementById("lampLayer");
document.body.classList.add("world-loading", "world-hidden");

/*
  Главные настройки
*/
const CONFIG = {
  
  playerSpeed: 5,
  playerWidth: 80,
  cameraVerticalFocus: 0.58,

  collisionRadius: 18,
  contactRadius: 26,
  collisionFootOffset: 0.35,

  greyTolerance: 24,
  redColorTolerance: 4,

  textSwarmSentenceCount: 85,
  textSwarmRevealInterval: 70,
  textSwarmRevealBatchMin: 1,
  textSwarmRevealBatchMax: 3,

  textSwarmRetypeInterval: 900,
  textSwarmRetypeBatchMin: 1,
  textSwarmRetypeBatchMax: 3,

  textSwarmLinkChance: 0.1,
  textSwarmMinParts: 2,
  textSwarmMaxParts: 3,

textSwarmHoleChance: 0.2,
textSwarmSmallChance: 0.28,
textSwarmLargeChance: 0.34,
textSwarmHugeChance: 0.16,

  textSwarmExitHintDelay: 2600,
  textSwarmExitDuration: 1150,
  redZoneReentryCooldown: 3000,
  

  worldAudioVolume: 0.45,
  blackScenePage: "swan-memory.html",
  blueScenePage: "white-memory.html",

  entranceGlitchDuration: 1900,
  entranceGlitchScale: 0.62,


lampMaskColor: [250, 59, 54],
lampMaskTolerance: 12,

lampSpacing: 28,
lampSampleStep: 1,
lampMinPixelsPerCell: 1,
lampMaxCount: 700,

lampMinSize: 16,
lampMaxSize: 32,
lampMinBlinkDuration: 4.8,
lampMaxBlinkDuration: 9.5,


  entranceRevealMoment: 0.68
};
function startWorldAudio() {
  if (!worldBalletAudio) return;

  worldBalletAudio.volume = CONFIG.worldAudioVolume;
  worldBalletAudio.loop = true;

  const playPromise = worldBalletAudio.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      /*
        Браузер может заблокировать автозапуск.
        Тогда звук запустится после первого действия пользователя.
      */
    });
  }
}



function stopWorldAudio() {
  if (!worldBalletAudio) return;

  worldBalletAudio.pause();
}
/*
  Каждая красная зона определяется ближайшим цветом.
  Подставь сюда реальные оттенки из collision.png, если нужно точнее.

  image — уникальная картинка, которая откроется поверх экрана.
*/
const RED_MEMORY_ZONES = [
  {
    id: "red-zone-1",
    color: [255, 125, 0],
    terminalVideo: "video/zone-1.mp4",
    terminalText: "Ячейка памяти №21 открыта. Я люблю читать, разве я не говорил тебе об этом? Есть что-то завораживающее во всех этих историях",
    links: [
      { label: "Коллективная ответственность", url: "https://svetapp.rusneb.ru/reader/v3/?slug=Po-kom-zvonit-kolokol" },
      { label: "Неизбежность смерти", url: "https://www.booksite.ru/fulltext/0/001/003/306/013.htm" },
      { label: "Одиночество", url: "https://libcat.ru/knigi/proza/sovremennaya-proza/397375-erih-remark-noch-v-lissabone-litres.html#read" }
    ]
  },
  {
    id: "red-zone-2",
    color: [255, 104, 0],
    terminalVideo: "video/zone-2.mp4",
    terminalText: "Ячейка памяти №28 открыта. Подумай, ну зачем люди занимались всем этим, неужели у них не было чем заняться? Как думаешь?",
    links: [
      { label: "Сострадания", url: "https://rutube.ru/video/5f6f791e6dce0b0fa18b2d5fc8afb96d/" },
      { label: "Мечта", url: "https://rutube.ru/video/97fc7768de6cb4ce11d578ff6f5dcc71/" },
      { label: "Искренность", url: "https://rutube.ru/video/f662d2c43d2f332916f0dd14d7f11e1e/" },
      { label: "Учитель", url: "https://rutube.ru/video/2cc812804b130d1de70c7d762a8e8bab/" }
    ]
  },
  {
    id: "red-zone-3",
    color: [255, 80, 0],
    terminalVideo: "video/zone-3.mp4",
    terminalText: "Ячейка памяти №42 открыта. Помнишь, как мы тут были? Мне кажется, счастливее дней уже не было. Столько людей, столько мест. Свобода была для нас как воздух",
    links: [
      { label: "Край", url: "https://www.google.com/maps/@45.5224818,141.9366091,3a,75y,8.14h,91.49t/data=!3m7!1e1!3m5!1sv48Z7kt70goaxLxK7ksO8A!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-1.4858442845319644%26panoid%3Dv48Z7kt70goaxLxK7ksO8A%26yaw%3D8.142044412640802!7i16384!8i8192!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D" },
      { label: "Забытое", url: "https://www.google.com/maps/@-6.095615,106.7908355,3a,75y,224.55h,95.92t/data=!3m7!1e1!3m5!1szNY0J86Px61-6B8HRDU6-g!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D-5.921225938602618%26panoid%3DzNY0J86Px61-6B8HRDU6-g%26yaw%3D224.55288223395746!7i16384!8i8192!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D" },
      { label: "Дорога", url: "https://www.google.com/maps/place/Дархан,+Дархан-Уул,+Монголия/@49.4554858,105.9446822,2a,75y,17.44h,80.34t/data=!3m7!1e1!3m5!1scvFdbzUfzS71Qd5nbdcspw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D9.661713376892578%26panoid%3DcvFdbzUfzS71Qd5nbdcspw%26yaw%3D17.44234837626955!7i13312!8i6656!4m6!3m5!1s0x5da2ddef606821bb:0x5f0006c86e4e228d!8m2!3d49.4640476!4d105.9687948!16zL20vMDNjZnlo!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D" },
      { label: "Будущее", url: "https://www.google.com/maps/@31.2407698,121.491069,3a,75y,43.54h,95.58t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgID46ueF4gE!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgpms-cs-s%2FABJJf50bCfPk8iiujtIx0DeKTupDqCe25ZfXlvhblvhZBh7rfj1ASkpq18ZluhXR1g47A_6GmuSo-OrBlyEyk2BRPdU6IQLPaXF6RHI07jdyF7ul1S9aMjWjWQ9oAVepsUWmVFdXWTGGjw%3Dw900-h600-k-no-pi-5.579272306160988-ya321.3169185836325-ro0-fo100!7i10000!8i5000!5m1!1e1?entry=ttu&g_ep=EgoyMDI2MDUwMi4wIKXMDSoASAFQAw%3D%3D" }
    ]
  },
  {
    id: "red-zone-4",
    color: [255, 60, 0],
    terminalVideo: "video/zone-4.mp4",
    terminalText: "Ячейка памяти №49 открыта. Это прекрасно. Мне кажется, именно с этого изобретения человечество действительно обрело свое назначение.",
    links: [
      { label: "Техника", url: "https://jmk-project.narod.ru/L-avia/B/Mikirtumov35_Prost_rasch/cont.htm" },
      { label: "Отцы", url: "https://fantlab.ru/autor2714" }
    ]
  },
  {
    id: "red-zone-5",
    color: [255, 42, 0],
    terminalVideo: "video/zone-5.mp4",
    terminalText: "Ячейка памяти №101 открыта. Как много страданий... И все равно, вопреки всему мы смогли вырваться, смогли сохранить жизнь, веру",
    links: [
      { label: "Братская могила", url: "https://www.noo-journal.ru/world-war-ii/" },
      { label: "Наказания", url: "https://вдпо.рф/calendar/1923-9-1_velikoe-zemletryasenie-kanto" },
      { label: "Бич", url: "https://ru.wikipedia.org/wiki/Пандемии_чумы" }
    ]
  },
  {
    id: "red-zone-6",
    color: [255, 25, 0],
    terminalVideo: "video/zone-6.mp4",
    terminalText: "Ячейка памяти №96 открыта. Они все искали правды, пытались найти истинну. Что есть жизнь, что есть смерть. Каждый по своему отвечал на эти вопросы, но всех их объединяло одно - стремление познать суть жизни",
    links: [
      { label: "Жизнь", url: "https://libfl.ru/ru/news/ekzistencializm-v-filosofii-literature-i-psihologii" },
      { label: "Вера", url: "https://azbyka.ru/1/hristianstvo" },
      { label: "Превозмогание", url: "https://medium.com/@DimaSuslov/стоицизм-основные-принципы-683f80329bb6" },
      { label: "Отрицание", url: "https://iphras.ru/elib/2071.html" }
    ]
  },
  {
    id: "red-zone-7",
    color: [255, 11, 0],
    terminalVideo: "video/zone-7.mp4",
    terminalText: "Ячейка памяти №134 открыта. Музыка - это истинные слова души. Нет ничего, что бы могло лучше передать те тонкие колебания струн сердца, как это делает музыка.",
    links: [
      { label: "Душа", url: "https://rutube.ru/video/8943a75e08caba5c8bffcac135e3169f/" },
      { label: "Грезы любви", url: "https://rutube.ru/video/e541409fc6a90a5554dafddfb4358abb/" },
      { label: "Величие", url: "https://rutube.ru/video/14761bf0d8a4889eafaabb167e3441e9/" }
    ]
  }
];

/*
  Сюда вставь нужные тебе разрешённые фразы.
  Между ними код сам будет ставить //.
  Лучше использовать короткие фразы, чтобы экран не превращался в белое пятно.
*/
const RUBLEV_PHRASES = [

  "Правильно ли я поступил?",
  "Она меня наверное ненавидит...",
  "Зря я так с ней обошелся",
  "Почему я не могу поступить иначе?",
  "Я не могу забыть ее...",
  "Неужели это все должно так закончится?",
  "Ты хочешь любить?",
  "Рад ли ты жить?",
  "Давно тебя не было видно",
  "Чем бы ты хотел заняться?",
  "Это все моя вина",
  "Я это заслужил",
  "Это конец",
  "Мы только начинаем",
  "Я тебя люблю",
  "Встань и иди",
  "О чем сегодня думаешь?",
  "Давай куда нибудь сходим",
  "Ты стал намного более жестоким",
  "Неужели ты не боишься смерти?",
  "Да как ты не можешь понять",
  "Я не знаю любви",
  "Мы еще сможем с тобой научиться жить",
  "Мы сможем снова увидеть красоту",
  "Не отворачивайся от меня",
  "Не забывай, кто тебя создал",
  "Не забывай, зачем ты здесь",
  "Не забывай меня",
  "Не забудь себя",
  "Твори добро",
  "Заботься о близких",
  "В этом моя воля",
  "Хотел бы я пожить подольше",
  "___________",
   "___________"


];


let keys = {
  w: false,
  a: false,
  s: false,
  d: false
};

let playerPos = {
  x: window.innerWidth / 2,
  y: window.innerHeight * 0.7
};

let worldSize = {
  width: window.innerWidth,
  height: window.innerHeight
};
const collisionCanvas = document.createElement("canvas");
const collisionCtx = collisionCanvas.getContext("2d", {
  willReadFrequently: true
});

let collisionReady = false;
let collisionImageData = null;

let currentContactZone = null;
let memoryOverlayOpen = false;

let controlsEnabled = false;
let worldInitialized = false;

let wasdHintWasShown = false;
let cursorWasHidden = false;

let currentTextSwarmZoneId = null;
let textSwarmRevealTimer = null;
let textSwarmRetypeTimer = null;
let textSwarmGeneration = 0;

let textSwarmBlock = null;
let textSwarmSentences = [];
let textSwarmRevealQueue = [];

let textSwarmHintTimer = null;
let textSwarmActive = false;
let textSwarmClosing = false;
let redZoneCooldownUntil = 0;

function hideCursorAfterMovement() {
  if (cursorWasHidden) return;

  cursorWasHidden = true;
  document.body.classList.add("cursor-hidden");
}

function showWasdHint() {
  if (!wasdHint || wasdHintWasShown) return;

  wasdHintWasShown = true;

  setTimeout(() => {
    wasdHint.classList.add("visible");
  }, 900);
}

function hideWasdHint() {
  if (!wasdHint) return;

  wasdHint.classList.remove("visible");
  wasdHint.classList.add("hidden");
}
function updateWorldSize() {
  const rect = worldBg.getBoundingClientRect();

  worldSize.width = rect.width;
  worldSize.height = rect.height;

  world.style.minHeight = `${worldSize.height}px`;
}

function placePlayer() {
  player.style.width = `${CONFIG.playerWidth}px`;
  player.style.left = `${playerPos.x}px`;
  player.style.top = `${playerPos.y}px`;

  updateZonePromptPosition();
}

function clampPlayer() {
  const halfWidth = CONFIG.playerWidth / 2;
  const playerHeight = player.offsetHeight || CONFIG.playerWidth;
  const halfHeight = playerHeight / 2;

  playerPos.x = Math.max(halfWidth, Math.min(worldSize.width - halfWidth, playerPos.x));
  playerPos.y = Math.max(halfHeight, Math.min(worldSize.height - halfHeight, playerPos.y));
}

function updateCamera() {
  const targetScrollY = playerPos.y - window.innerHeight * CONFIG.cameraVerticalFocus;

  window.scrollTo({
    top: Math.max(0, targetScrollY),
    left: 0,
    behavior: "auto"
  });
}







function getPlayerCollisionPoint(x, y) {
  const playerHeight = player.offsetHeight || CONFIG.playerWidth;

  return {
    x,
    y: y + playerHeight * CONFIG.collisionFootOffset
  };
}


function setupCollisionMap() {
  if (
    !collisionMap ||
    !collisionMap.complete ||
    collisionMap.naturalWidth === 0 ||
    collisionMap.naturalHeight === 0
  ) {
    return;
  }

  collisionCanvas.width = collisionMap.naturalWidth;
  collisionCanvas.height = collisionMap.naturalHeight;

  collisionCtx.clearRect(0, 0, collisionCanvas.width, collisionCanvas.height);
  collisionCtx.drawImage(collisionMap, 0, 0);

  collisionImageData = collisionCtx.getImageData(
    0,
    0,
    collisionCanvas.width,
    collisionCanvas.height
  );

  collisionReady = true;
}

function worldToCollisionPoint(x, y) {
  return {
    x: Math.floor((x / worldSize.width) * collisionCanvas.width),
    y: Math.floor((y / worldSize.height) * collisionCanvas.height)
  };
}

function isGreyPixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  return max - min <= CONFIG.greyTolerance;
}

function isBluePixel(r, g, b) {
  return (
    b > 120 &&
    b > r * 1.35 &&
    b > g * 1.2
  );
}
function isBlackMemoryPixel(r, g, b) {
  return (
    Math.abs(r - 180) <= 6 &&
    Math.abs(g - 0) <= 6 &&
    Math.abs(b - 255) <= 6
  );
}
function colorDistanceSq(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];

  return dr * dr + dg * dg + db * db;
}

function getExactRedMemoryZone(r, g, b) {
  const currentColor = [r, g, b];
  const toleranceSq = CONFIG.redColorTolerance * CONFIG.redColorTolerance * 3;

  for (const zone of RED_MEMORY_ZONES) {
    if (colorDistanceSq(currentColor, zone.color) <= toleranceSq) {
      return zone;
    }
  }

  return null;
}

function getCollisionPixelZone(mapX, mapY) {
  if (!collisionReady || !collisionImageData) {
    return {
      type: "free",
      blocked: false
    };
  }

  /*
    За пределы карты нельзя.
  */
  if (
    mapX < 0 ||
    mapY < 0 ||
    mapX >= collisionCanvas.width ||
    mapY >= collisionCanvas.height
  ) {
    return {
      type: "solid",
      blocked: true
    };
  }

  const index = (mapY * collisionCanvas.width + mapX) * 4;

  const r = collisionImageData.data[index];
  const g = collisionImageData.data[index + 1];
  const b = collisionImageData.data[index + 2];
  const a = collisionImageData.data[index + 3];

  /*
    Прозрачное и серое — проходимое.
  */
  if (a < 10 || isGreyPixel(r, g, b)) {
    return {
      type: "free",
      blocked: false
    };
  }

  /*
  Чёрная зона — непроходимая + переход в сцену воспоминания.
*/
if (isBlackMemoryPixel(r, g, b)) {
  return {
    type: "black",
    blocked: true,
    prompt: "Вспомнить"
  };
}
  /*
    Синяя зона — непроходимая + переход в сцену белого шума.
  */
  if (isBluePixel(r, g, b)) {
    return {
      type: "blue",
      blocked: true,
      prompt: "Войти в белый шум?"
    };
  }

  /*
    Красные / оранжево-красные зоны — непроходимые + ячейки памяти.
  */
const redMemoryZone = getExactRedMemoryZone(r, g, b);

if (redMemoryZone) {
  return {
    type: "red",
    blocked: true,
    id: redMemoryZone.id,
    links: redMemoryZone.links,
    prompt: ""
  };
}

  /*
    Все остальные несерые цвета, включая зеленый, — просто препятствие.
  */
  return {
    type: "solid",
    blocked: true
  };
}

function getZoneAtWorldPoint(x, y) {
  const point = worldToCollisionPoint(x, y);

  return getCollisionPixelZone(point.x, point.y);
}

function getPlayerCollisionPoint(x, y) {
  const playerHeight = player.offsetHeight || CONFIG.playerWidth;

  return {
    x,
    y: y + playerHeight * CONFIG.collisionFootOffset
  };
}

function getTestPoints(radius) {
  return [
    [0, 0],
    [radius, 0],
    [-radius, 0],
    [0, radius],
    [0, -radius],
    [radius * 0.7, radius * 0.7],
    [-radius * 0.7, radius * 0.7],
    [radius * 0.7, -radius * 0.7],
    [-radius * 0.7, -radius * 0.7]
  ];
}

function getBlockingZoneAtPosition(x, y, radius = CONFIG.collisionRadius) {
  if (!collisionReady) {
    return {
      type: "free",
      blocked: false
    };
  }

  const foot = getPlayerCollisionPoint(x, y);
  const testPoints = getTestPoints(radius);

  let solidZone = null;

  for (const [offsetX, offsetY] of testPoints) {
    const zone = getZoneAtWorldPoint(
      foot.x + offsetX,
      foot.y + offsetY
    );

    if (!zone.blocked) continue;

    /*
      Интерактивные зоны приоритетнее обычных препятствий.
    */
    if (
  zone.type === "red" ||
  zone.type === "blue" ||
  zone.type === "black"
) {
  return zone;
}

    solidZone = zone;
  }

  return solidZone || {
    type: "free",
    blocked: false
  };
}

function detectNearbyInteractiveZone(x, y) {
  const zone = getBlockingZoneAtPosition(x, y, CONFIG.contactRadius);

  if (
    zone.type === "red" ||
    zone.type === "blue" ||
    zone.type === "black"
  ) {
    return zone;
  }

  return null;
}

function canMoveTo(nextX, nextY) {
  const zone = getBlockingZoneAtPosition(nextX, nextY);

  return !zone.blocked;
}

function setCurrentContactZone(zone) {
  currentContactZone = zone;

  if (!zone) {
    /*
      Если текстовая стена активна, она закрывается только по Esc.
    */
    if (!textSwarmActive && !textSwarmClosing) {
      stopTextSwarm();
    }

    if (zonePrompt) {
      zonePrompt.classList.remove("visible");
    }

    return;
  }

  if (zone.type === "red") {
    if (zonePrompt) {
      zonePrompt.classList.remove("visible");
    }

    startTextSwarm(zone);
    return;
  }

  if (zone.type === "blue") {
    stopTextSwarm();

    if (!zonePrompt) return;

    zonePrompt.textContent = zone.prompt || "Войти в белый шум?";
    zonePrompt.classList.add("visible");

    return;
  }

  if (zone.type === "black") {
    stopTextSwarm();

    if (!zonePrompt) return;

    zonePrompt.textContent = zone.prompt || "Вспомнить";
    zonePrompt.classList.add("visible");

    return;
  }

  stopTextSwarm();

  if (zonePrompt) {
    zonePrompt.classList.remove("visible");
  }
}

function updateZonePromptPosition() {
  if (!zonePrompt) return;

  const playerHeight = player.offsetHeight || CONFIG.playerWidth;

  zonePrompt.style.left = `${playerPos.x}px`;
  zonePrompt.style.top = `${playerPos.y - playerHeight * 0.55}px`;
}

function updateCurrentContactZone() {
  const zone = detectNearbyInteractiveZone(playerPos.x, playerPos.y);

  setCurrentContactZone(zone);
}

function movePlayerWithCollision(dx, dy) {
  let contactZone = null;

  const nextX = playerPos.x + dx;
  const nextY = playerPos.y + dy;

  /*
    Движение отдельно по X и Y дает скольжение вдоль препятствий.
  */
  if (canMoveTo(nextX, playerPos.y)) {
    playerPos.x = nextX;
  } else {
    const zone = getBlockingZoneAtPosition(nextX, playerPos.y);

    if (zone.type === "red" || zone.type === "blue") {
      contactZone = zone;
    }
  }

  if (canMoveTo(playerPos.x, nextY)) {
    playerPos.y = nextY;
  } else {
    const zone = getBlockingZoneAtPosition(playerPos.x, nextY);

    if (zone.type === "red" || zone.type === "blue") {
      contactZone = zone;
    }
  }

  clampPlayer();
  placePlayer();
  updateCamera();
  updateZonePromptPosition();

  if (contactZone) {
    setCurrentContactZone(contactZone);
  } else {
    updateCurrentContactZone();
  }
}






function activateCurrentContactZone() {
  if (!currentContactZone) return;

  if (currentContactZone.type === "blue") {
    if (typeof stopWorldAudio === "function") {
      stopWorldAudio();
    }

    window.location.href = CONFIG.blueScenePage;
    return;
  }

  if (currentContactZone.type === "black") {
    if (typeof stopWorldAudio === "function") {
      stopWorldAudio();
    }

    window.location.href = CONFIG.blackScenePage;
    return;
  }
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

  /*
    Нормализация диагонального движения,
    чтобы по диагонали персонаж не двигался быстрее.
  */
  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);

    dx /= length;
    dy /= length;

movePlayerWithCollision(
  dx * CONFIG.playerSpeed,
  dy * CONFIG.playerSpeed
);
  }

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", event => {

  
  
  if (typeof startWorldAudio === "function") {
    startWorldAudio();
  }

  if (event.code === "Escape" && textSwarmActive) {
  event.preventDefault();
  stopTextSwarm();
  return;
}

if (textSwarmActive) {
  /*
    Пока открыт текст красной зоны, WASD не двигает игрока.
    Но ссылки остаются кликабельными мышкой.
  */
  event.preventDefault();
  return;
}

  const key = event.key.toLowerCase();

  const movementKeys = ["w", "a", "s", "d", "ц", "ф", "ы", "в"];

if (event.code === "Space") {
  if (
    currentContactZone &&
    (
      currentContactZone.type === "blue" ||
      currentContactZone.type === "black"
    )
  ) {
    event.preventDefault();
    activateCurrentContactZone();
  }

  return;
}

  if (movementKeys.includes(key)) {
    event.preventDefault();

    if (typeof hideWasdHint === "function") {
      hideWasdHint();
    }

    if (typeof hideCursorAfterMovement === "function") {
      hideCursorAfterMovement();
    }
  }

  if (key === "w" || key === "ц") keys.w = true;
  if (key === "a" || key === "ф") keys.a = true;
  if (key === "s" || key === "ы") keys.s = true;
  if (key === "d" || key === "в") keys.d = true;
});

window.addEventListener("keyup", event => {
  const key = event.key.toLowerCase();

  if (key === "w" || key === "ц") keys.w = false;
  if (key === "a" || key === "ф") keys.a = false;
  if (key === "s" || key === "ы") keys.s = false;
  if (key === "d" || key === "в") keys.d = false;
});

window.addEventListener("resize", () => {
  updateWorldSize();
  setupMapLampsFromCollisionMask();
  placePlayer();
  updateCamera();
});
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothStep(t) {
  return t * t * (3 - 2 * t);
}

function waitForImage(img) {
  return new Promise(resolve => {
    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }

    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

window.addEventListener("keydown", event => {
  if (event.code === "Escape") {
    cursorWasHidden = false;
    document.body.classList.remove("cursor-hidden");
  }
});
function resizeGlitchCanvas() {
  const scale = CONFIG.entranceGlitchScale;

  glitchCanvas.width = Math.floor(window.innerWidth * scale);
  glitchCanvas.height = Math.floor(window.innerHeight * scale);

  glitchCanvas.style.width = "100vw";
  glitchCanvas.style.height = "100vh";
}

function drawBaseWorldSceneToCanvas(targetCanvas, targetCtx) {
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const scale = CONFIG.entranceGlitchScale;

  targetCtx.clearRect(0, 0, width, height);

  targetCtx.fillStyle = "#000";
  targetCtx.fillRect(0, 0, width, height);

  /*
    Рисуем фон так же, как он лежит на странице:
    по ширине экрана, высота сохраняет пропорции.
  */
  if (worldBg.naturalWidth > 0 && worldBg.naturalHeight > 0) {
    const imageRatio = worldBg.naturalWidth / worldBg.naturalHeight;
    const drawWidth = width;
    const drawHeight = drawWidth / imageRatio;

    targetCtx.drawImage(worldBg, 0, 0, drawWidth, drawHeight);
  }

  /*
    Рисуем персонажа в стартовой позиции,
    чтобы он тоже проявлялся вместе со страницей.
  */
  if (player.naturalWidth > 0 && player.naturalHeight > 0) {
    const playerDrawWidth = CONFIG.playerWidth * scale;
    const playerRatio = player.naturalHeight / player.naturalWidth;
    const playerDrawHeight = playerDrawWidth * playerRatio;

    const playerX = playerPos.x * scale - playerDrawWidth / 2;
    const playerY = playerPos.y * scale - playerDrawHeight / 2;

    targetCtx.drawImage(
      player,
      playerX,
      playerY,
      playerDrawWidth,
      playerDrawHeight
    );
  }
}

function drawGlitchFrame(ctx, baseCanvas, progress) {
  const width = glitchCanvas.width;
  const height = glitchCanvas.height;

  const reveal = smoothStep(progress);
  const intensity = 1 - reveal;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  /*
    Основное изображение проявляется ближе к середине эффекта.
  */
  const stableAlpha = clamp01((reveal - 0.35) / 0.65);

  ctx.globalAlpha = stableAlpha;
  ctx.drawImage(baseCanvas, 0, 0);
  ctx.globalAlpha = 1;

  /*
    Горизонтальные сдвинутые полосы.
  */
  const stripCount = Math.floor(22 + intensity * 90);

  for (let i = 0; i < stripCount; i++) {
    const sliceHeight = Math.floor(2 + Math.random() * (8 + intensity * 34));
    const sourceY = Math.floor(Math.random() * height);

    const maxOffset = width * (0.04 + intensity * 0.32);
    const offsetX = Math.floor((Math.random() - 0.5) * maxOffset);

    const targetY = sourceY + Math.floor((Math.random() - 0.5) * intensity * 22);

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

    /*
      Иногда дублируем полосу ниже — даёт ощущение цифрового разрыва.
    */
    if (Math.random() < 0.22) {
      const secondOffset = Math.floor((Math.random() - 0.5) * maxOffset * 1.6);

      ctx.globalAlpha = alpha * 0.55;

      ctx.drawImage(
        baseCanvas,
        0,
        sourceY,
        width,
        sliceHeight,
        secondOffset,
        targetY + Math.floor(8 + Math.random() * 26),
        width,
        sliceHeight
      );
    }
  }

  ctx.globalAlpha = 1;

  /*
    Белые цифровые вспышки и битые прямоугольники.
  */
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

  /*
    Редкие черные провалы.
  */
  const dropoutCount = Math.floor(intensity * 22);

  for (let i = 0; i < dropoutCount; i++) {
    const blockW = Math.floor(20 + Math.random() * width * 0.28);
    const blockH = Math.floor(2 + Math.random() * 14);

    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    ctx.fillStyle = `rgba(0, 0, 0, ${0.25 + Math.random() * 0.45})`;
    ctx.fillRect(x, y, blockW, blockH);
  }

  /*
    Короткая белая вспышка почти в конце.
  */
  if (progress > 0.78 && progress < 0.86) {
    const flash = 1 - Math.abs(progress - 0.82) / 0.04;

    ctx.fillStyle = `rgba(255, 255, 255, ${clamp01(flash) * 0.16})`;
    ctx.fillRect(0, 0, width, height);
  }
}

async function playWorldEntranceGlitch() {
  await waitForImage(worldBg);
  await waitForImage(player);

  resizeGlitchCanvas();

  const baseCanvas = document.createElement("canvas");
  const baseCtx = baseCanvas.getContext("2d");

  baseCanvas.width = glitchCanvas.width;
  baseCanvas.height = glitchCanvas.height;

  drawBaseWorldSceneToCanvas(baseCanvas, baseCtx);

  let normalSceneRevealed = false;

  return new Promise(resolve => {
    const startTime = performance.now();

    function frame(now) {
      const elapsed = now - startTime;
      const progress = clamp01(elapsed / CONFIG.entranceGlitchDuration);

      drawGlitchFrame(glitchCtx, baseCanvas, progress);

      /*
        Под конец показываем настоящую страницу под глитч-слоем.
      */
      if (!normalSceneRevealed && progress >= CONFIG.entranceRevealMoment) {
        normalSceneRevealed = true;

        document.body.classList.remove("world-hidden");
        document.body.classList.add("world-ready");
      }

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        glitchCanvas.classList.add("hidden");

        document.body.classList.remove("world-loading");
        document.body.classList.remove("world-hidden");
        document.body.classList.add("world-ready");

        setTimeout(() => {
          glitchCanvas.remove();

          const glitchFlash = document.getElementById("glitchFlash");
          if (glitchFlash) glitchFlash.remove();

          resolve();
        }, 700);
      }
    }

    requestAnimationFrame(frame);
  });
}

async function initializeWorld() {
  if (worldInitialized) return;

  worldInitialized = true;

  updateWorldSize();
  setupCollisionMap();
  setupMapLampsFromCollisionMask();


  playerPos.x = worldSize.width / 2;
  playerPos.y = Math.min(window.innerHeight * 0.4, worldSize.height - 80);

  placePlayer();
  gameLoop();

await playWorldEntranceGlitch();

startWorldAudio();

controlsEnabled = true;
showWasdHint();
}
function tryInitializeWorld() {
  const bgReady =
    worldBg &&
    worldBg.complete &&
    worldBg.naturalWidth > 0;

  const collisionImageReady =
    collisionMap &&
    collisionMap.complete &&
    collisionMap.naturalWidth > 0;

  if (bgReady && collisionImageReady) {
    initializeWorld();
  }
}

worldBg.addEventListener("load", tryInitializeWorld);
collisionMap.addEventListener("load", tryInitializeWorld);

worldBg.addEventListener("error", () => {
  console.error("Не найден фон worldBg:", worldBg.src);
});

collisionMap.addEventListener("error", () => {
  console.error("Не найдена collisionMap:", collisionMap.src);
});

tryInitializeWorld();


const terminalCanvas = document.getElementById("terminalCanvas");
const terminalAscii = document.getElementById("terminalAscii");

const terminalCtx = terminalCanvas.getContext("2d", { willReadFrequently: true });

/*
  Отдельный скрытый canvas для считывания кадров видео.
  Видимый terminalCanvas теперь используется только для отрисовки ASCII.
*/
const terminalSampleCanvas = document.createElement("canvas");
const terminalSampleCtx = terminalSampleCanvas.getContext("2d", {
  willReadFrequently: true
});

const ASCII_CONFIG = {
  /*
    Размер одной ASCII-ячейки.
    Меньше число — больше символов и выше детализация.
  */
  pixelStep: 5,

  fps: 24,

  chars: " .'`^,:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$"
};

let lastAsciiFrameTime = 0;

function startTerminalVideo() {
  if (!terminalVideo) return;

  const playPromise = terminalVideo.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

function resizeTerminalCanvas() {
  if (!terminalCanvas) return;

  const rect = terminalCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  /*
    Видимый canvas всегда точно равен серой зоне.
  */
  terminalCanvas.width = Math.floor(rect.width * dpr);
  terminalCanvas.height = Math.floor(rect.height * dpr);

  terminalCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  /*
    Скрытый sample-canvas задает ASCII-разрешение.
    Именно сюда видео растягивается целиком.
  */
  terminalSampleCanvas.width = Math.max(
    1,
    Math.floor(rect.width / ASCII_CONFIG.pixelStep)
  );

  terminalSampleCanvas.height = Math.max(
    1,
    Math.floor(rect.height / ASCII_CONFIG.pixelStep)
  );
}

function getAsciiChar(brightness) {
  const chars = ASCII_CONFIG.chars;
  const index = Math.floor((brightness / 255) * (chars.length - 1));

  return chars[index];
}

function renderTerminalAscii(now = 0) {
  if (!terminalVideo || !terminalCanvas) {
    requestAnimationFrame(renderTerminalAscii);
    return;
  }

  const interval = 1000 / ASCII_CONFIG.fps;

  if (now - lastAsciiFrameTime < interval) {
    requestAnimationFrame(renderTerminalAscii);
    return;
  }

  lastAsciiFrameTime = now;

  if (
    terminalVideo.readyState < 2 ||
    terminalVideo.videoWidth === 0 ||
    terminalVideo.videoHeight === 0
  ) {
    requestAnimationFrame(renderTerminalAscii);
    return;
  }

  const rect = terminalCanvas.getBoundingClientRect();
  const visibleWidth = rect.width;
  const visibleHeight = rect.height;

  const cols = terminalSampleCanvas.width;
  const rows = terminalSampleCanvas.height;

  /*
    Главное место:
    видео принудительно растягивается на всю ASCII-сетку,
    без сохранения исходного размера.
  */
  terminalSampleCtx.drawImage(
    terminalVideo,
    0,
    0,
    cols,
    rows
  );

  const frame = terminalSampleCtx.getImageData(0, 0, cols, rows);
  const data = frame.data;

  terminalCtx.clearRect(0, 0, visibleWidth, visibleHeight);

  terminalCtx.fillStyle = "rgb(8, 8, 8)";
  terminalCtx.fillRect(0, 0, visibleWidth, visibleHeight);

  const cellWidth = visibleWidth / cols;
  const cellHeight = visibleHeight / rows;

  /*
    Символы распределяются по всей серой зоне.
  */
  const fontSize = cellHeight * 1.45;

  terminalCtx.font = `${fontSize}px "Courier New", monospace`;
  terminalCtx.textBaseline = "top";
  terminalCtx.fillStyle = "rgba(230, 230, 230, 0.92)";

  terminalCtx.shadowColor = "rgba(255, 255, 255, 0.35)";
  terminalCtx.shadowBlur = 4;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const index = (y * cols + x) * 4;

      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];

      const brightness = r * 0.299 + g * 0.587 + b * 0.114;
      const char = getAsciiChar(brightness);

      terminalCtx.fillText(
        char,
        x * cellWidth,
        y * cellHeight - cellHeight * 0.2
      );
    }
  }

  requestAnimationFrame(renderTerminalAscii);
}

function changeTerminalVideo(src) {
  if (!terminalVideo) return;

  terminalVideo.pause();
  terminalVideo.src = src;
  terminalVideo.load();

  const playPromise = terminalVideo.play();

  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

function initTerminalHud() {
  if (!terminalVideo || !terminalCanvas) return;

  resizeTerminalCanvas();
  startTerminalVideo();
  renderTerminalAscii();

  window.addEventListener("resize", () => {
    resizeTerminalCanvas();
  });

  window.addEventListener("keydown", startTerminalVideo, { once: true });
  window.addEventListener("click", startTerminalVideo, { once: true });
}

/////////////////////////////


function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getRandomPhrase() {
  return pickRandom(RUBLEV_PHRASES);
}

function getRandomZoneLink(zone) {
  if (!zone || !zone.links || zone.links.length === 0) return null;

  return pickRandom(zone.links);
}

function clearTextSwarmTimers() {
  if (textSwarmRevealTimer) {
    clearTimeout(textSwarmRevealTimer);
    textSwarmRevealTimer = null;
  }

  if (textSwarmRetypeTimer) {
    clearInterval(textSwarmRetypeTimer);
    textSwarmRetypeTimer = null;
  }

  if (textSwarmHintTimer) {
    clearTimeout(textSwarmHintTimer);
    textSwarmHintTimer = null;
  }
}

function clearTextSwarmLayer() {
  if (!textSwarmLayer) return;

  textSwarmLayer.innerHTML = "";
  textSwarmBlock = null;
  textSwarmSentences = [];
  textSwarmRevealQueue = [];
}

function buildSentencePayload(zone) {
  const parts = [];
  const partsCount = randomInt(
    CONFIG.textSwarmMinParts,
    CONFIG.textSwarmMaxParts
  );

  const link = Math.random() < CONFIG.textSwarmLinkChance
    ? getRandomZoneLink(zone)
    : null;

  const linkPosition = link ? randomInt(0, partsCount - 1) : -1;

  for (let i = 0; i < partsCount; i++) {
    if (i === linkPosition && link) {
      parts.push({
        type: "link",
        text: link.label,
        url: link.url
      });
    } else {
      parts.push({
        type: "text",
        text: getRandomPhrase()
      });
    }
  }

  return parts;
}


function createTextSwarmLink(label, url) {
  const anchor = document.createElement("a");

  anchor.className = "text-swarm-link";
  anchor.href = url;
  anchor.textContent = label;

  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";

  anchor.addEventListener("click", event => {
    event.preventDefault();
    event.stopPropagation();

    window.open(url, "_blank", "noopener,noreferrer");
  });

  return anchor;
}

function createSentenceNodeFromPayload(parts) {
  const wrapper = document.createElement("span");

  wrapper.className = "text-swarm-sentence";
  wrapper.dataset.kind = "text";

  let hasLink = false;

  parts.forEach((part, index) => {
    if (part.type === "link") {
      hasLink = true;

      const anchor = createTextSwarmLink(part.text, part.url);
      wrapper.appendChild(anchor);
    } else {
      wrapper.appendChild(document.createTextNode(part.text));
    }

    if (index < parts.length - 1) {
      wrapper.appendChild(document.createTextNode(" // "));
    }
  });

  wrapper.appendChild(document.createTextNode(" // "));

  if (hasLink) {
    wrapper.dataset.kind = "link";
  }

  /*
    Дырки и случайный размер.
    Для предложений со ссылками дырку не создаём,
    чтобы ссылка случайно не исчезала.
  */
  applyRandomSentenceShape(wrapper, {
    allowHole: !hasLink
  });

  return wrapper;
}




function getVisibleNonLinkSentences() {
  return textSwarmSentences.filter(node => {
    return (
      node.classList.contains("visible") &&
      node.dataset.kind !== "link" &&
      node.dataset.kind !== "hole" &&
      !node.classList.contains("hole")
    );
  });
}

function replaceSentenceContent(node, zone) {
  const parts = buildSentencePayload(zone, false);
  const newNode = createSentenceNodeFromPayload(parts);

  node.innerHTML = newNode.innerHTML;
  node.dataset.kind = "text";

  node.classList.remove("size-small", "size-large");

  const sizeRoll = Math.random();

  if (sizeRoll < CONFIG.textSwarmLargeChance) {
    node.classList.add("size-large");
  } else if (sizeRoll < CONFIG.textSwarmLargeChance + CONFIG.textSwarmSmallChance) {
    node.classList.add("size-small");
  }
}






function randomBetween(min, max) {
  return min + Math.random() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomBetween(min, max + 1));
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  const copy = [...array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function getRandomPhrase() {
  return pickRandom(RUBLEV_PHRASES);
}

function getRandomZoneLink(zone) {
  if (!zone || !zone.links || zone.links.length === 0) return null;

  return pickRandom(zone.links);
}

function clearTextSwarmTimers() {
  if (textSwarmRevealTimer) {
    clearTimeout(textSwarmRevealTimer);
    textSwarmRevealTimer = null;
  }

  if (textSwarmRetypeTimer) {
    clearInterval(textSwarmRetypeTimer);
    textSwarmRetypeTimer = null;
  }
}

function clearTextSwarmLayer() {
  if (!textSwarmLayer) return;

  textSwarmLayer.innerHTML = "";

  textSwarmBlock = null;
  textSwarmSentences = [];
  textSwarmRevealQueue = [];
}

function buildSentencePayload(zone, allowLink = true) {
  const parts = [];

  const partsCount = randomInt(
    CONFIG.textSwarmMinParts,
    CONFIG.textSwarmMaxParts
  );

  const link = allowLink && Math.random() < CONFIG.textSwarmLinkChance
    ? getRandomZoneLink(zone)
    : null;

  const linkPosition = link ? randomInt(0, partsCount - 1) : -1;

  for (let i = 0; i < partsCount; i++) {
    if (i === linkPosition && link) {
      parts.push({
        type: "link",
        text: link.label,
        url: link.url
      });
    } else {
      parts.push({
        type: "text",
        text: getRandomPhrase()
      });
    }
  }

  return parts;
}



function buildJustifiedTextBlock(zone) {
  if (!textSwarmLayer) return;

  clearTextSwarmLayer();

  textSwarmBlock = document.createElement("div");
  textSwarmBlock.className = "text-swarm-block";

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < CONFIG.textSwarmSentenceCount; i++) {
    const parts = buildSentencePayload(zone, true);
    const node = createSentenceNodeFromPayload(parts);

    fragment.appendChild(node);
    textSwarmSentences.push(node);
  }

  textSwarmBlock.appendChild(fragment);
  textSwarmLayer.appendChild(textSwarmBlock);
}

function startSentenceReveal(generation) {
  textSwarmRevealQueue = shuffleArray(
    textSwarmSentences.filter(node => node.dataset.kind !== "hole")
  );

  function revealStep() {
    if (generation !== textSwarmGeneration) return;

    const batchCount = randomInt(
      CONFIG.textSwarmRevealBatchMin,
      CONFIG.textSwarmRevealBatchMax
    );

    for (let i = 0; i < batchCount; i++) {
      const node = textSwarmRevealQueue.shift();

      if (!node) break;

      node.classList.add("visible");
    }

    if (textSwarmRevealQueue.length > 0) {
      textSwarmRevealTimer = setTimeout(
        revealStep,
        CONFIG.textSwarmRevealInterval
      );
    }
  }

  revealStep();
}

function getVisibleNonLinkSentences() {
  return textSwarmSentences.filter(node => {
    return (
      node.classList.contains("visible") &&
      node.dataset.kind !== "link" &&
      node.dataset.kind !== "hole" &&
      !node.classList.contains("hole")
    );
  });
}

function replaceSentenceContent(node, zone) {
  if (node.dataset.kind === "hole" || node.classList.contains("hole")) {
    return;
  }

  const parts = buildSentencePayload(zone, false);
  const newNode = createSentenceNodeFromPayload(parts);

  node.innerHTML = newNode.innerHTML;
  node.dataset.kind = "text";

  applyRandomSentenceShape(node, {
    allowHole: false
  });
}

function retypeRandomSentence(zone, generation) {
  const candidates = getVisibleNonLinkSentences();

  if (!candidates.length) return;

  const batchCount = randomInt(
    CONFIG.textSwarmRetypeBatchMin,
    CONFIG.textSwarmRetypeBatchMax
  );

  for (let i = 0; i < batchCount; i++) {
    const node = pickRandom(candidates);

    if (!node || node.classList.contains("retyping")) continue;

    node.classList.add("retyping");

    setTimeout(() => {
      if (generation !== textSwarmGeneration) return;

      replaceSentenceContent(node, zone);
      node.classList.remove("retyping");
    }, randomInt(90, 220));
  }
}

function showTextSwarmExitHint() {
  if (!textSwarmExitHint) return;

  textSwarmExitHint.classList.add("visible");
}

function hideTextSwarmExitHint() {
  if (!textSwarmExitHint) return;

  textSwarmExitHint.classList.remove("visible");
}

function scheduleTextSwarmExitHint(generation) {
  hideTextSwarmExitHint();

  if (textSwarmHintTimer) {
    clearTimeout(textSwarmHintTimer);
  }

  textSwarmHintTimer = setTimeout(() => {
    if (generation !== textSwarmGeneration) return;
    if (!textSwarmActive) return;

    showTextSwarmExitHint();
  }, CONFIG.textSwarmExitHintDelay);
}

function startTextSwarm(zone) {
  if (!textSwarmOverlay || !textSwarmLayer || !zone) return;
  if (textSwarmClosing) return;

  const now = performance.now();

  if (now < redZoneCooldownUntil) return;

  if (currentTextSwarmZoneId === zone.id) return;

  currentTextSwarmZoneId = zone.id;
  textSwarmActive = true;
  textSwarmGeneration++;

  const generation = textSwarmGeneration;

  /*
    Страница замирает:
    - управление отключено;
    - текущие нажатые клавиши сброшены;
    - камера и игрок перестают двигаться.
  */
  controlsEnabled = false;

  keys.w = false;
  keys.a = false;
  keys.s = false;
  keys.d = false;

  document.body.classList.remove("cursor-hidden");
  document.body.classList.add("red-zone-active");

  clearTextSwarmTimers();

  textSwarmOverlay.classList.remove("leaving");
  textSwarmOverlay.classList.add("visible");
  scheduleTextSwarmExitHint(generation);

  buildJustifiedTextBlock(zone);

  requestAnimationFrame(() => {
    if (generation !== textSwarmGeneration) return;

    startSentenceReveal(generation);
  });

  textSwarmRetypeTimer = setInterval(() => {
    if (generation !== textSwarmGeneration) return;

    retypeRandomSentence(zone, generation);
  }, CONFIG.textSwarmRetypeInterval);
}

function stopTextSwarm() {
  if (!textSwarmOverlay || !textSwarmLayer) return;
  if (!currentTextSwarmZoneId || textSwarmClosing) return;
  
  const closedZone = getRedZoneById(currentTextSwarmZoneId);
  
  textSwarmClosing = true;
  textSwarmActive = false;

  currentTextSwarmZoneId = null;
  textSwarmGeneration++;

  clearTextSwarmTimers();
  hideTextSwarmExitHint();

  document.body.classList.remove("red-zone-active");

  textSwarmOverlay.classList.add("leaving");
  textSwarmOverlay.classList.remove("visible");

  /*
    Небольшая задержка, чтобы игрок не мог мгновенно снова
    активировать ту же красную зону, пока выходит из неё.
  */
  redZoneCooldownUntil = performance.now() + CONFIG.redZoneReentryCooldown;

  setTimeout(() => {
    clearTextSwarmLayer();

    textSwarmOverlay.classList.remove("leaving");

    textSwarmClosing = false;

    /*
      Возвращаем управление после мягкого исчезновения текста.
    */
    controlsEnabled = true;

    /*
      Если у тебя включено исчезновение курсора после движения,
      возвращаем его в скрытое состояние после выхода.
    */
    document.body.classList.add("cursor-hidden");
  }, CONFIG.textSwarmExitDuration);
  updateTerminalAfterRedZone(closedZone);
}



function applyRandomSentenceShape(node, options = {}) {
  const allowHole = options.allowHole !== false;

  node.classList.remove(
    "hole",
    "size-small",
    "size-large",
    "size-huge"
  );

  node.style.removeProperty("--hole-width");
  node.style.removeProperty("--hole-height");

  /*
    Дырка должна быть настоящим пустым inline-block,
    а не просто невидимым предложением.
  */
  if (allowHole && Math.random() < CONFIG.textSwarmHoleChance) {
    node.classList.add("hole");
    node.dataset.kind = "hole";

    node.textContent = "\u00A0";

    node.style.setProperty(
      "--hole-width",
      `${randomBetween(10, 34).toFixed(1)}ch`
    );

    node.style.setProperty(
      "--hole-height",
      `${randomBetween(0.9, 1.5).toFixed(2)}em`
    );

    return;
  }

  const sizeRoll = Math.random();

  if (sizeRoll < CONFIG.textSwarmHugeChance) {
    node.classList.add("size-huge");
  } else if (
    sizeRoll <
    CONFIG.textSwarmHugeChance + CONFIG.textSwarmLargeChance
  ) {
    node.classList.add("size-large");
  } else if (
    sizeRoll <
    CONFIG.textSwarmHugeChance +
    CONFIG.textSwarmLargeChance +
    CONFIG.textSwarmSmallChance
  ) {
    node.classList.add("size-small");
  }
}

function isColorNear(r, g, b, target, tolerance) {
  return (
    Math.abs(r - target[0]) <= tolerance &&
    Math.abs(g - target[1]) <= tolerance &&
    Math.abs(b - target[2]) <= tolerance
  );
}

function collisionToWorldPoint(mapX, mapY) {
  return {
    x: (mapX / collisionCanvas.width) * worldSize.width,
    y: (mapY / collisionCanvas.height) * worldSize.height
  };
}
function updateLampLayerSize() {
  if (!lampLayer) return;

  lampLayer.style.width = `${worldSize.width}px`;
  lampLayer.style.height = `${worldSize.height}px`;
}
function createMapLamp(worldX, worldY) {
  if (!lampLayer) return;

  const lamp = document.createElement("span");

  lamp.className = "map-lamp";

  lamp.style.left = `${worldX}px`;
  lamp.style.top = `${worldY}px`;

  lamp.style.setProperty(
    "--lamp-size",
    `${randomBetween(CONFIG.lampMinSize, CONFIG.lampMaxSize).toFixed(1)}px`
  );

  lamp.style.setProperty(
    "--lamp-duration",
    `${randomBetween(
      CONFIG.lampMinBlinkDuration,
      CONFIG.lampMaxBlinkDuration
    ).toFixed(2)}s`
  );

  lamp.style.setProperty(
    "--lamp-delay",
    `${randomBetween(-7, 0).toFixed(2)}s`
  );

  lampLayer.appendChild(lamp);
}

function clearMapLamps() {
  if (!lampLayer) return;

  lampLayer.innerHTML = "";
}

function setupMapLampsFromCollisionMask() {
  if (!lampLayer) {
    console.warn("lampLayer не найден в HTML");
    return;
  }

  if (!collisionReady || !collisionImageData) {
    console.warn("collision map ещё не готова для лампочек");
    return;
  }

  updateLampLayerSize();
  clearMapLamps();vvvvvvvvv

  const width = collisionCanvas.width;
  const height = collisionCanvas.height;
  const data = collisionImageData.data;

  const target = CONFIG.lampMaskColor;
  const tolerance = CONFIG.lampMaskTolerance;

  const cellWidth = Math.max(
    2,
    Math.round((CONFIG.lampSpacing / worldSize.width) * width)
  );

  const cellHeight = Math.max(
    2,
    Math.round((CONFIG.lampSpacing / worldSize.height) * height)
  );

  let totalMatchingPixels = 0;
  let createdCount = 0;

  for (let y = 0; y < height; y += cellHeight) {
    for (let x = 0; x < width; x += cellWidth) {
      if (createdCount >= CONFIG.lampMaxCount) {
        console.log("Лампочки: достигнут лимит", createdCount);
        return;
      }

      let matchCount = 0;
      let sumX = 0;
      let sumY = 0;

      const maxY = Math.min(y + cellHeight, height);
      const maxX = Math.min(x + cellWidth, width);

      for (let yy = y; yy < maxY; yy += CONFIG.lampSampleStep) {
        for (let xx = x; xx < maxX; xx += CONFIG.lampSampleStep) {
          const index = (yy * width + xx) * 4;

          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const a = data[index + 3];

          if (a < 10) continue;

          if (isColorNear(r, g, b, target, tolerance)) {
            matchCount++;
            totalMatchingPixels++;
            sumX += xx;
            sumY += yy;
          }
        }
      }

      if (matchCount < CONFIG.lampMinPixelsPerCell) continue;

      const centerMapX = sumX / matchCount;
      const centerMapY = sumY / matchCount;

      const worldPoint = collisionToWorldPoint(centerMapX, centerMapY);

      createMapLamp(worldPoint.x, worldPoint.y);
      createdCount++;
    }
  }

  console.log(
    "Лампочки созданы:",
    createdCount,
    "найдено пикселей цвета:",
    totalMatchingPixels,
    "target:",
    target,
    "tolerance:",
    tolerance
  );

  if (createdCount === 0) {
    console.warn(
      "Лампочки не созданы. Увеличь lampMaskTolerance или проверь цвет в collision.png"
    );
  }
}


let terminalTypingTimer = null;
let terminalTypingGeneration = 0;

function getRedZoneById(zoneId) {
  return RED_MEMORY_ZONES.find(zone => zone.id === zoneId) || null;
}

function clearTerminalZoneText() {
  if (!terminalZoneText) return;

  terminalZoneText.textContent = "";
  terminalZoneText.classList.add("empty");
}

function typeTerminalZoneText(text) {
  if (!terminalZoneText) return;

  terminalTypingGeneration++;

  const generation = terminalTypingGeneration;

  if (terminalTypingTimer) {
    clearTimeout(terminalTypingTimer);
    terminalTypingTimer = null;
  }

  terminalZoneText.textContent = "";
  terminalZoneText.classList.remove("empty");

  let index = 0;

  function step() {
    if (generation !== terminalTypingGeneration) return;

    terminalZoneText.textContent = text.slice(0, index);

    index++;

    if (index <= text.length) {
      terminalTypingTimer = setTimeout(step, 42);
    }
  }

  step();
}
function setTerminalVideo(videoSrc) {
  if (!terminalVideo || !videoSrc) return;

  terminalVideo.pause();

  terminalVideo.setAttribute("src", videoSrc);

  terminalVideo.addEventListener("loadeddata", () => {
    const playPromise = terminalVideo.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }, { once: true });

  terminalVideo.load();
}

function updateTerminalAfterRedZone(zone) {
  if (!zone) return;

  setTerminalVideo(zone.terminalVideo);
  typeTerminalZoneText(zone.terminalText || "");
}

initTerminalHud();