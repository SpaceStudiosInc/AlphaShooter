/* ═══════════════════════════════════════════════════════════
   ALPHA SHOOTER — Woods Patrol
   Top-down soldier shooter · weapon progression · wave shop
   ═══════════════════════════════════════════════════════════ */

const SAVE_KEY = 'alphaShooterWoods_v3';

/* ── Weapon definitions ─────────────────────────────────── */
const WEAPONS = {
  pistol: {
    id: 'pistol', name: 'PISTOL',
    src: 'Assets/pistol.png', frames: 3, fw: 32, fh: 32,
    dmg: 14, fireRate: 0.26, magazine: 10, reload: 1.0, speed: 560,
    spread: 0.05, pellets: 1, auto: false, cost: 0, unlockWave: 1,
  },
  rifle: {
    id: 'rifle', name: 'RIFLE',
    src: 'Assets/rifle.png', frames: 4, fw: 88, fh: 48,
    dmg: 24, fireRate: 0.16, magazine: 22, reload: 1.3, speed: 700,
    spread: 0.035, pellets: 1, auto: true, cost: 80, unlockWave: 3,
  },
  shotgun: {
    id: 'shotgun', name: 'SHOTGUN',
    src: 'Assets/Shotgun.png', frames: 3, fw: 88, fh: 48,
    dmg: 10, fireRate: 0.5, magazine: 6, reload: 1.5, speed: 500,
    spread: 0.2, pellets: 6, auto: false, cost: 120, unlockWave: 4,
  },
  lmg: {
    id: 'lmg', name: 'LMG',
    src: 'Assets/lmg.png', frames: 3, fw: 88, fh: 48,
    dmg: 15, fireRate: 0.085, magazine: 45, reload: 1.9, speed: 620,
    spread: 0.08, pellets: 1, auto: true, cost: 200, unlockWave: 6,
  },
  sniper: {
    id: 'sniper', name: 'SNIPER',
    src: 'Assets/Sniper.png', frames: 5, fw: 88, fh: 48,
    dmg: 90, fireRate: 0.85, magazine: 5, reload: 2.0, speed: 920,
    spread: 0.01, pellets: 1, auto: false, cost: 250, unlockWave: 7,
  },
  minigun: {
    id: 'minigun', name: 'MINIGUN',
    src: 'Assets/Minigun.png', frames: 3, fw: 88, fh: 48,
    dmg: 11, fireRate: 0.04, magazine: 120, reload: 2.6, speed: 640,
    spread: 0.11, pellets: 1, auto: true, cost: 400, unlockWave: 10,
  },
  rocket: {
    id: 'rocket', name: 'ROCKET',
    src: 'Assets/RocketLauncher.png', frames: 3, fw: 88, fh: 48,
    dmg: 130, fireRate: 1.0, magazine: 3, reload: 2.3, speed: 400,
    spread: 0.02, pellets: 1, auto: false, explosive: true, radius: 95,
    cost: 350, unlockWave: 9,
  },
};

const META_UPGRADES = [
  { id: 'maxHp',    name: 'MAX HP',      desc: '+15 max health',          baseCost: 25, mul: 1.45, max: 10, effect: 15 },
  { id: 'regen',    name: 'REGEN',       desc: '+0.35 HP / sec',          baseCost: 40, mul: 1.55, max: 6,  effect: 0.35 },
  { id: 'moveSpd',  name: 'MOVE SPEED',  desc: '+8% movement speed',      baseCost: 30, mul: 1.5,  max: 6,  effect: 0.08 },
  { id: 'dmgBoost', name: 'DAMAGE',      desc: '+10% all weapon damage',  baseCost: 35, mul: 1.5,  max: 8,  effect: 0.10 },
  { id: 'magSize',  name: 'MAG SIZE',    desc: '+15% magazine capacity',  baseCost: 28, mul: 1.45, max: 6,  effect: 0.15 },
  { id: 'reload',   name: 'RELOAD',      desc: '-8% reload time',         baseCost: 30, mul: 1.5,  max: 6,  effect: 0.08 },
  { id: 'credits',  name: 'SCRAP GAIN',  desc: '+12% credits earned',     baseCost: 20, mul: 1.4,  max: 8,  effect: 0.12 },
  { id: 'armor',    name: 'ARMOR',       desc: '-6% damage taken',        baseCost: 45, mul: 1.55, max: 5,  effect: 0.06 },
];

function defaultSave() {
  return {
    credits: 0,
    bestWave: 0,
    bestScore: 0,
    upgrades: Object.fromEntries(META_UPGRADES.map(u => [u.id, 0])),
    unlockedWeapons: ['pistol'],
    settings: {
      sfx: true, sfxVol: 70, music: true, musicVol: 40, particles: true,
      // debug
      godMode: false, infAmmo: false, showHitboxes: false, noEnemyFire: false,
    },
  };
}

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave();
    const p = JSON.parse(raw);
    const d = defaultSave();
    return {
      ...d, ...p,
      upgrades: { ...d.upgrades, ...(p.upgrades || {}) },
      settings: { ...d.settings, ...(p.settings || {}) },
      unlockedWeapons: p.unlockedWeapons || ['pistol'],
    };
  } catch { return defaultSave(); }
}

let save = loadSave();
function writeSave() { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }

function upgradeCost(def) {
  return Math.ceil(def.baseCost * Math.pow(def.mul, save.upgrades[def.id]));
}
function upgradeMaxed(def) { return save.upgrades[def.id] >= def.max; }

function metaStats() {
  const u = save.upgrades;
  return {
    maxHp: 70 + u.maxHp * 15,          // lower base HP — tense, not tanky
    regen: u.regen * 0.35,
    moveMul: 1 + u.moveSpd * 0.08,
    dmgMul: 1 + u.dmgBoost * 0.10,
    magMul: 1 + u.magSize * 0.15,
    reloadMul: Math.max(0.5, 1 - u.reload * 0.08),
    creditMul: 1 + u.credits * 0.12,
    armor: Math.min(0.4, u.armor * 0.06),
  };
}

/* ── Canvas ─────────────────────────────────────────────── */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Zoom: higher = more zoomed in (smaller world visible)
let CAM_ZOOM = 1.85;

function updateCamZoom() {
  const portrait = window.innerHeight > window.innerWidth;
  const shortSide = Math.min(window.innerWidth, window.innerHeight);
  // Zoom out more on small / portrait screens so play area stays readable
  if (shortSide < 500) CAM_ZOOM = portrait ? 1.35 : 1.55;
  else if (shortSide < 800) CAM_ZOOM = portrait ? 1.55 : 1.75;
  else CAM_ZOOM = 1.85;
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.imageSmoothingEnabled = false;
  updateCamZoom();
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', () => setTimeout(resizeCanvas, 120));

function loadImg(src) {
  const i = new Image();
  i.src = src;
  return i;
}

const IMG = {
  player: loadImg('Assets/Player.png'),
  enemy1: loadImg('Assets/Enemy1.png'),
  enemy2: loadImg('Assets/Enemy2.png'),
  enemy3: loadImg('Assets/Enemy3.png'),
  tree: loadImg('Assets/Tree.png'),
  tile: loadImg('Assets/tileset.png'),
  projectile: loadImg('Assets/projectile.png'),
  particle: loadImg('Assets/Redparticle.png'),
  ammoPickup: loadImg('Assets/ammo.png'),
  healthPickup: loadImg('Assets/health.png'),
};

const WEAPON_IMG = {};
for (const w of Object.values(WEAPONS)) {
  WEAPON_IMG[w.id] = loadImg(w.src);
}

/* ── Web Audio SFX (no HTMLAudio lag / jitter) ──────────── */
const SFX_SRC = {
  rifle: 'Assets/Rifle.wav',
  hurt: 'Assets/hurt.wav',
  pickup: 'Assets/pickup.wav',
  explosion: 'Assets/Explosion.wav',
  gameover: 'Assets/gameover.wav',
};
let audioCtx = null;
const sfxBuffers = {};
const lastSfxTime = {};
let activeGunSources = 0;
const MAX_GUN_VOICES = 3;

function ensureAudioCtx() {
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

async function loadSfxBuffers() {
  const ctx = ensureAudioCtx();
  if (!ctx) return;
  await Promise.all(Object.entries(SFX_SRC).map(async ([name, src]) => {
    try {
      const res = await fetch(src);
      const arr = await res.arrayBuffer();
      sfxBuffers[name] = await ctx.decodeAudioData(arr.slice(0));
    } catch (e) {
      console.warn('SFX load failed', name, e);
    }
  }));
}
loadSfxBuffers();

// unlock audio on first user gesture
['pointerdown', 'keydown'].forEach(ev => {
  window.addEventListener(ev, () => {
    ensureAudioCtx();
    if (bgMusic && bgMusic.paused && mode === 'run') startBgMusic();
  }, { once: true, passive: true });
});

/* ── Background music (game only) ───────────────────────── */
const bgMusic = new Audio('Assets/BGMusic.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.35;

function startBgMusic() {
  if (!save.settings.music) return;
  bgMusic.volume = (save.settings.musicVol / 100) * 0.5;
  const p = bgMusic.play();
  if (p && p.catch) p.catch(() => {});
}
function stopBgMusic() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
}
function applyMusicVol() {
  bgMusic.volume = (save.settings.musicVol / 100) * 0.5;
}

function playSfx(name, volScale = 1, minInterval = 0) {
  if (!save.settings.sfx) return;
  const now = performance.now();
  if (minInterval > 0 && now - (lastSfxTime[name] || 0) < minInterval) return;
  lastSfxTime[name] = now;

  const ctx = ensureAudioCtx();
  const buf = sfxBuffers[name];
  if (!ctx || !buf) return;

  // hard-cap concurrent gun shots to avoid voice spam / stutter
  if (name === 'rifle') {
    if (activeGunSources >= MAX_GUN_VOICES) return;
    activeGunSources++;
  }

  try {
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const vol = Math.min(1, (save.settings.sfxVol / 100) * volScale);
    gain.gain.value = vol;
    src.connect(gain);
    gain.connect(ctx.destination);
    src.start(0);
    if (name === 'rifle') {
      src.onended = () => { activeGunSources = Math.max(0, activeGunSources - 1); };
      // safety
      setTimeout(() => { activeGunSources = Math.max(0, activeGunSources - 1); }, (buf.duration * 1000) + 50);
    }
  } catch (_) {}
}

/* ── World constants ────────────────────────────────────── */
const TILE = 48;
const WORLD_W = 48;
const WORLD_H = 48;
const BODY_SIZE = 42;       // readable at zoom
const TREE_SIZE = 56;
const PLAYER_SPEED = 195;   // snappier base move
const MOVE_ACCEL = 18;      // smooth acceleration
const MOVE_FRICTION = 12;

/* ── Run state ──────────────────────────────────────────── */
let mode = 'title';
let optionsReturnTo = 'title';

let meta, player, camera;
let enemies, bullets, eBullets, particles, trees, pickups, tileMap;
let score, wave, sessionCredits, kills;
let fireCooldown, reloadTimer, isReloading, gunAnim;
let enemiesInWave, enemiesSpawned, spawnTimer, spawnDelay;
let keys = {};
let mouseX = 0, mouseY = 0, holdFire = false;
let shake = 0;
let lastTime = 0;
let waveClearTimer = 0;
let ownedWeapons = [];
let currentWeaponId = 'pistol';
let ammo = {};
let tempBoosts = { dmg: 0, speed: 0, armor: 0 };
let faceAngle = 0; // smoothed facing for body
let holdZone = null; // {x,y,r} capture point — stand inside for x2 score
let holdingPoint = false;
let holdArrowTimer = 0;

function currentWeapon() { return WEAPONS[currentWeaponId]; }

function magCapacity(w) {
  return Math.max(1, Math.round(w.magazine * meta.magMul));
}

function resetRun() {
  meta = metaStats();
  player = {
    x: (WORLD_W * TILE) / 2,
    y: (WORLD_H * TILE) / 2,
    hp: meta.maxHp,
    maxHp: meta.maxHp,
    angle: 0,
    vx: 0, vy: 0,
  };
  faceAngle = 0;
  camera = { x: player.x, y: player.y };
  enemies = [];
  bullets = [];
  eBullets = [];
  particles = [];
  pickups = [];
  score = 0;
  wave = 0;
  sessionCredits = 0;
  kills = 0;
  fireCooldown = 0;
  reloadTimer = 0;
  isReloading = false;
  gunAnim = 0;
  shake = 0;
  waveClearTimer = 0;
  tempBoosts = { dmg: 0, speed: 0, armor: 0 };
  ownedWeapons = ['pistol'];
  currentWeaponId = 'pistol';
  ammo = { pistol: magCapacity(WEAPONS.pistol) };
  for (const id of save.unlockedWeapons) {
    if (!ownedWeapons.includes(id)) {
      ownedWeapons.push(id);
      ammo[id] = magCapacity(WEAPONS[id]);
    }
  }
  generateWorld();
  nextWave();
  updateHud();
}

/* ── World generation — 4 tiles from tileset ────────────── */
// Tile index 1 (sheet pos 1,0) = water / solid — unwalkable, no trees
const SOLID_TILE = 1;

function isSolidTile(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= WORLD_W || ty >= WORLD_H) return true;
  return tileMap[ty][tx] === SOLID_TILE;
}

function isSolidWorld(wx, wy) {
  return isSolidTile(Math.floor(wx / TILE), Math.floor(wy / TILE));
}

function generateWorld() {
  trees = [];
  tileMap = [];
  const cx = WORLD_W / 2, cy = WORLD_H / 2;
  for (let ty = 0; ty < WORLD_H; ty++) {
    tileMap[ty] = [];
    for (let tx = 0; tx < WORLD_W; tx++) {
      // pick one of 4 tiles (0..3) with slight clustering
      // keep spawn area clear of water
      const nearSpawn = Math.abs(tx - cx) < 4 && Math.abs(ty - cy) < 4;
      const n = Math.sin(tx * 0.37 + 1.2) * Math.cos(ty * 0.29) + Math.sin((tx + ty) * 0.11);
      let t = 0;
      if (!nearSpawn && n > 0.42) t = SOLID_TILE; // water patches
      else if (n > 0.08) t = 2;
      else if (n > -0.22) t = 0;
      else t = 3;
      tileMap[ty][tx] = t;
    }
  }
  const minTreeDist = TREE_SIZE * 0.7;
  for (let i = 0; i < 220; i++) {
    const tx = Math.floor(Math.random() * WORLD_W);
    const ty = Math.floor(Math.random() * WORLD_H);
    if (Math.abs(tx - cx) < 3 && Math.abs(ty - cy) < 3) continue;
    if (tileMap[ty][tx] === SOLID_TILE) continue; // never on water
    const x = tx * TILE + TILE / 2 + (Math.random() - 0.5) * 8;
    const y = ty * TILE + TILE / 2 + (Math.random() - 0.5) * 8;
    let ok = true;
    for (const t of trees) {
      const dx = x - t.x, dy = y - t.y;
      if (dx * dx + dy * dy < minTreeDist * minTreeDist) { ok = false; break; }
    }
    if (!ok) continue;
    trees.push({ x, y, r: TREE_SIZE * 0.26 });
  }

  holdZone = null;
  holdingPoint = false;
  holdArrowTimer = 0;
}

function spawnHoldZone() {
  let hx = (WORLD_W * TILE) / 2;
  let hy = (WORLD_H * TILE) / 2;
  for (let tries = 0; tries < 50; tries++) {
    const tx = 3 + Math.floor(Math.random() * (WORLD_W - 6));
    const ty = 3 + Math.floor(Math.random() * (WORLD_H - 6));
    if (tileMap[ty][tx] === SOLID_TILE) continue;
    hx = tx * TILE + TILE / 2;
    hy = ty * TILE + TILE / 2;
    // Prefer not on top of player spawn
    const dx = hx - player.x, dy = hy - player.y;
    if (dx * dx + dy * dy < 120 * 120) continue;
    break;
  }
  holdZone = { x: hx, y: hy, r: 70 };
  holdingPoint = false;
  holdArrowTimer = 4.0;
  toast('HOLD POINT ACTIVE — x2 SCORE');
}

/* ── Waves — gentle start, ramps hard ───────────────────── */
function nextWave() {
  wave++;
  // Gentle start, slow ramp, gets hard after wave 5+
  if (wave <= 2) enemiesInWave = wave === 1 ? 2 : 4;
  else if (wave <= 5) enemiesInWave = 4 + (wave - 2) * 2;
  else enemiesInWave = Math.min(55, 10 + Math.floor((wave - 5) * 3.5) + Math.floor(wave * wave * 0.05));
  enemiesSpawned = 0;
  spawnDelay = Math.max(0.45, 1.8 - wave * 0.06);
  spawnTimer = 0.8;
  waveClearTimer = 0;
  // Hold point only lasts one wave; random chance from wave 2+
  holdZone = null;
  holdingPoint = false;
  holdArrowTimer = 0;
  toast('WAVE ' + wave);
  if (wave >= 2 && Math.random() < 0.35) {
    spawnHoldZone();
  }
}

function spawnEnemy() {
  const margin = 70;
  const side = Math.floor(Math.random() * 4);
  const halfW = (canvas.width / CAM_ZOOM) / 2;
  const halfH = (canvas.height / CAM_ZOOM) / 2;
  let x, y;
  const viewL = camera.x - halfW - margin;
  const viewR = camera.x + halfW + margin;
  const viewT = camera.y - halfH - margin;
  const viewB = camera.y + halfH + margin;
  if (side === 0) { x = viewL; y = viewT + Math.random() * (viewB - viewT); }
  else if (side === 1) { x = viewR; y = viewT + Math.random() * (viewB - viewT); }
  else if (side === 2) { x = viewL + Math.random() * (viewR - viewL); y = viewT; }
  else { x = viewL + Math.random() * (viewR - viewL); y = viewB; }

  x = Math.max(TILE, Math.min(WORLD_W * TILE - TILE, x));
  y = Math.max(TILE, Math.min(WORLD_H * TILE - TILE, y));

  // Early waves: mostly weak melee-ish runners. Shooting unlocked gradually.
  const kindRoll = Math.random();
  let kind, hp, speed, dmg, fireRate, canShoot;

  if (wave <= 2) {
    // pure runners, low HP
    kind = 0;
    hp = 12 + wave * 3;
    speed = 55 + wave * 4;
    dmg = 4;
    fireRate = 999;
    canShoot = false;
  } else if (wave <= 5) {
    if (kindRoll < 0.55) {
      kind = 0; hp = 16 + wave * 4; speed = 60 + wave * 3; dmg = 5; fireRate = 2.2; canShoot = true;
    } else {
      kind = 1; hp = 28 + wave * 5; speed = 48 + wave * 2; dmg = 7; fireRate = 1.8; canShoot = true;
    }
  } else {
    if (kindRoll < 0.4) {
      kind = 0; hp = 18 + wave * 5; speed = 65 + wave * 2.5; dmg = 6 + wave * 0.4; fireRate = 1.6; canShoot = true;
    } else if (kindRoll < 0.75) {
      kind = 1; hp = 32 + wave * 7; speed = 50 + wave * 2; dmg = 9 + wave * 0.6; fireRate = 1.2; canShoot = true;
    } else {
      kind = 2; hp = 50 + wave * 10; speed = 40 + wave * 1.5; dmg = 12 + wave * 0.8; fireRate = 1.0; canShoot = true;
    }
  }

  // Random player weapon for enemy (exclude heavy: minigun, rocket, sniper)
  const enemyGuns = ['pistol', 'rifle', 'shotgun', 'lmg'];
  const wpn = WEAPONS[enemyGuns[Math.floor(Math.random() * enemyGuns.length)]];
  const gunImg = WEAPON_IMG[wpn.id];
  const gunFrames = wpn.frames;
  const gunFW = wpn.fw;
  const gunFH = wpn.fh;

  const bodies = [IMG.enemy1, IMG.enemy2, IMG.enemy3];
  enemies.push({
    x, y,
    hp, maxHp: hp,
    speed, dmg, fireRate, canShoot,
    fireCd: 0.8 + Math.random() * 1.2,
    body: bodies[kind],
    gun: gunImg,
    gunFrames, gunFW, gunFH,
    angle: 0,
    gunAnim: 0,
    bob: Math.random() * Math.PI * 2,
  });
  enemiesSpawned++;
}

/* ── Combat helpers ─────────────────────────────────────── */
function screenToWorld(sx, sy) {
  return {
    x: (sx - canvas.width / 2) / CAM_ZOOM + camera.x,
    y: (sy - canvas.height / 2) / CAM_ZOOM + camera.y,
  };
}

function firePlayer() {
  const w = currentWeapon();
  if (isReloading) return;
  if (!save.settings.infAmmo && ammo[currentWeaponId] <= 0) {
    startReload();
    return;
  }

  const aim = screenToWorld(mouseX, mouseY);
  const angle = Math.atan2(aim.y - player.y, aim.x - player.x);
  player.angle = angle;

  const barrel = 28;
  const mx = player.x + Math.cos(angle) * barrel;
  const my = player.y + Math.sin(angle) * barrel;

  const dmgMul = meta.dmgMul * (tempBoosts.dmg > 0 ? 1.35 : 1);
  for (let i = 0; i < w.pellets; i++) {
    const spread = (Math.random() - 0.5) * w.spread * 2;
    const a = angle + spread;
    bullets.push({
      x: mx, y: my,
      vx: Math.cos(a) * w.speed,
      vy: Math.sin(a) * w.speed,
      dmg: w.dmg * dmgMul,
      life: 1.5,
      explosive: !!w.explosive,
      radius: w.radius || 0,
    });
  }

  if (!save.settings.infAmmo) ammo[currentWeaponId]--;
  gunAnim = 0.1;
  fireCooldown = w.fireRate;
  // throttle SFX hard — Web Audio + voice cap still need spacing on full-auto
  const minInt = w.id === 'minigun' ? 90 : w.id === 'lmg' ? 70 : w.auto ? 45 : 0;
  playSfx('rifle', w.id === 'minigun' ? 0.22 : w.id === 'lmg' ? 0.35 : w.id === 'pistol' ? 0.5 : 0.6, minInt);
  if (!save.settings.infAmmo && ammo[currentWeaponId] <= 0) startReload();
}

function startReload() {
  if (isReloading || save.settings.infAmmo) return;
  const w = currentWeapon();
  if (ammo[currentWeaponId] >= magCapacity(w)) return;
  isReloading = true;
  reloadTimer = w.reload * meta.reloadMul;
}

function finishReload() {
  isReloading = false;
  ammo[currentWeaponId] = magCapacity(currentWeapon());
}

function explode(x, y, radius, dmg) {
  playSfx('explosion', 0.75, 80);
  shake = Math.max(shake, 8);
  spawnBurst(x, y, 14, 12);
  for (const e of enemies) {
    const dx = e.x - x, dy = e.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < radius) {
      const falloff = 1 - dist / radius;
      e.hp -= dmg * (0.4 + 0.6 * falloff);
    }
  }
}

function spawnBurst(x, y, count, size) {
  if (!save.settings.particles) return;
  const n = Math.min(count, 12);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const spd = 40 + Math.random() * 140;
    particles.push({
      x, y,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd,
      life: 0.2 + Math.random() * 0.3,
      maxLife: 0.5,
      size: size * (0.5 + Math.random() * 0.6),
    });
  }
}

function damagePlayer(amount) {
  if (save.settings.godMode) return;
  const arm = meta.armor + (tempBoosts.armor > 0 ? 0.15 : 0);
  const taken = amount * (1 - arm);
  player.hp -= taken;
  shake = Math.max(shake, 5);
  playSfx('hurt', 0.55, 120);
  if (player.hp <= 0) {
    player.hp = 0;
    endRun();
  }
}

/* ── Update ─────────────────────────────────────────────── */
function update(dt) {
  for (const k of Object.keys(tempBoosts)) {
    if (tempBoosts[k] > 0) tempBoosts[k] = Math.max(0, tempBoosts[k] - dt);
  }

  // smooth movement with accel + friction (+ virtual stick on mobile)
  let ix = 0, iy = 0;
  if (keys['w'] || keys['arrowup']) iy -= 1;
  if (keys['s'] || keys['arrowdown']) iy += 1;
  if (keys['a'] || keys['arrowleft']) ix -= 1;
  if (keys['d'] || keys['arrowright']) ix += 1;
  if (touchMove.active) {
    ix = touchMove.mx;
    iy = touchMove.my;
  }
  if (ix || iy) {
    const len = Math.sqrt(ix * ix + iy * iy);
    ix /= len; iy /= len;
  }
  const spd = PLAYER_SPEED * meta.moveMul * (tempBoosts.speed > 0 ? 1.28 : 1);
  const targetVx = ix * spd;
  const targetVy = iy * spd;
  // accelerate toward target velocity
  player.vx += (targetVx - player.vx) * Math.min(1, MOVE_ACCEL * dt);
  player.vy += (targetVy - player.vy) * Math.min(1, MOVE_ACCEL * dt);
  // extra friction when no input
  if (!ix && !iy) {
    player.vx *= Math.max(0, 1 - MOVE_FRICTION * dt);
    player.vy *= Math.max(0, 1 - MOVE_FRICTION * dt);
  }

  let nx = player.x + player.vx * dt;
  let ny = player.y + player.vy * dt;

  // block solid (water) tiles — axis separated
  const pr = BODY_SIZE * 0.28;
  if (isSolidWorld(nx - pr, player.y) || isSolidWorld(nx + pr, player.y) ||
      isSolidWorld(nx, player.y - pr) || isSolidWorld(nx, player.y + pr)) {
    nx = player.x;
    player.vx = 0;
  }
  if (isSolidWorld(nx - pr, ny) || isSolidWorld(nx + pr, ny) ||
      isSolidWorld(nx, ny - pr) || isSolidWorld(nx, ny + pr)) {
    ny = player.y;
    player.vy = 0;
  }

  for (const t of trees) {
    const dx = nx - t.x, dy = ny - t.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minD = t.r + BODY_SIZE * 0.3;
    if (dist < minD && dist > 0.01) {
      const push = (minD - dist) / dist;
      nx += dx * push;
      ny += dy * push;
    }
  }
  player.x = Math.max(TILE, Math.min(WORLD_W * TILE - TILE, nx));
  player.y = Math.max(TILE, Math.min(WORLD_H * TILE - TILE, ny));

  // aim — body + gun share the exact same facing (no lag)
  const aim = screenToWorld(mouseX, mouseY);
  const targetAngle = Math.atan2(aim.y - player.y, aim.x - player.x);
  player.angle = targetAngle;
  faceAngle = targetAngle;

  // camera
  camera.x += (player.x - camera.x) * Math.min(1, 10 * dt);
  camera.y += (player.y - camera.y) * Math.min(1, 10 * dt);

  // hold point x2 score
  if (holdZone) {
    const hdx = player.x - holdZone.x, hdy = player.y - holdZone.y;
    holdingPoint = (hdx * hdx + hdy * hdy) < holdZone.r * holdZone.r;
  } else {
    holdingPoint = false;
  }
  if (holdArrowTimer > 0) holdArrowTimer -= dt;

  if (meta.regen > 0 && player.hp < player.maxHp) {
    player.hp = Math.min(player.maxHp, player.hp + meta.regen * dt);
  }

  if (gunAnim > 0) gunAnim -= dt;
  if (isReloading) {
    reloadTimer -= dt;
    if (reloadTimer <= 0) finishReload();
  }
  fireCooldown -= dt;
  const w = currentWeapon();
  if (holdFire && fireCooldown <= 0 && !isReloading) {
    if (w.auto) firePlayer();
  }

  // player bullets (pass through trees)
  const hitR2 = (BODY_SIZE * 0.38) ** 2;
  bullets = bullets.filter(b => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) return false;

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const dx = b.x - e.x, dy = b.y - e.y;
      if (dx * dx + dy * dy < hitR2) {
        if (b.explosive) explode(b.x, b.y, b.radius, b.dmg);
        else {
          e.hp -= b.dmg;
          spawnBurst(b.x, b.y, 3, 7);
        }
        if (e.hp <= 0) killEnemy(i);
        return false;
      }
    }
    return true;
  });

  // enemy bullets
  const pHitR2 = (BODY_SIZE * 0.32) ** 2;
  eBullets = eBullets.filter(b => {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (b.life <= 0) return false;
    const dx = b.x - player.x, dy = b.y - player.y;
    if (dx * dx + dy * dy < pHitR2) {
      damagePlayer(b.dmg);
      spawnBurst(b.x, b.y, 2, 6);
      return false;
    }
    return true;
  });

  // enemies
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.bob += dt * 5;
    const dx = player.x - e.x, dy = player.y - e.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    e.angle = Math.atan2(dy, dx);

    if (dist > 70) {
      let mx2 = (dx / dist) * e.speed * dt;
      let my2 = (dy / dist) * e.speed * dt;
      let nx = e.x + mx2;
      let ny = e.y + my2;
      const er = BODY_SIZE * 0.28;
      for (const t of trees) {
        const tdx = nx - t.x, tdy = ny - t.y;
        const td = Math.sqrt(tdx * tdx + tdy * tdy) || 0.01;
        const minD = t.r + er;
        if (td < minD) {
          const push = (minD - td) / td;
          nx += tdx * push;
          ny += tdy * push;
        }
      }
      e.x = nx;
      e.y = ny;
    }

    e.fireCd -= dt;
    if (e.canShoot && !save.settings.noEnemyFire && e.fireCd <= 0 && dist < 380 && dist > 50) {
      e.fireCd = e.fireRate * (0.9 + Math.random() * 0.25);
      e.gunAnim = 0.08;
      const spd = 240 + Math.min(wave, 15) * 6;
      eBullets.push({
        x: e.x + Math.cos(e.angle) * 16,
        y: e.y + Math.sin(e.angle) * 16,
        vx: Math.cos(e.angle) * spd,
        vy: Math.sin(e.angle) * spd,
        dmg: e.dmg,
        life: 2.0,
      });
    }
    if (e.gunAnim > 0) e.gunAnim -= dt;

    if (dist < BODY_SIZE * 0.5) {
      damagePlayer(e.dmg * 0.35 * dt * 2.5);
    }
  }

  if (enemiesSpawned < enemiesInWave) {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnEnemy();
      spawnTimer = spawnDelay;
    }
  }

  if (enemiesSpawned >= enemiesInWave && enemies.length === 0) {
    waveClearTimer += dt;
    if (waveClearTimer > 1.0) {
      if (wave % 3 === 0) openShop();
      else nextWave();
    }
  }

  particles = particles.filter(p => {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.95; p.vy *= 0.95;
    p.life -= dt;
    return p.life > 0;
  });

  if (shake > 0) shake = Math.max(0, shake - dt * 30);
  updateHud();
}

function killEnemy(idx) {
  const e = enemies[idx];
  spawnBurst(e.x, e.y, 8, 10);
  const base = 40 + wave * 8;
  score += holdingPoint ? base * 2 : base;
  kills++;
  const cred = Math.round((3 + wave * 1.3) * meta.creditMul);
  sessionCredits += holdingPoint ? cred * 2 : cred;
  if (Math.random() < 0.14) pickups.push({ x: e.x, y: e.y, type: 'hp', life: 14 });
  else if (Math.random() < 0.1) pickups.push({ x: e.x, y: e.y, type: 'ammo', life: 14 });
  enemies.splice(idx, 1);
}

function updatePickups(dt) {
  for (let i = pickups.length - 1; i >= 0; i--) {
    const p = pickups[i];
    p.life -= dt;
    if (p.life <= 0) { pickups.splice(i, 1); continue; }
    const dx = player.x - p.x, dy = player.y - p.y;
    if (dx * dx + dy * dy < 24 * 24) {
      if (p.type === 'hp') {
        player.hp = Math.min(player.maxHp, player.hp + 20);
        toast('+HP');
      } else {
        ammo[currentWeaponId] = magCapacity(currentWeapon());
        toast('+AMMO');
      }
      playSfx('pickup', 0.65, 50);
      pickups.splice(i, 1);
    }
  }
}

/* ── Render ─────────────────────────────────────────────── */
function render() {
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#0a0f0a';
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;
  ctx.translate(w / 2 + sx, h / 2 + sy);
  ctx.scale(CAM_ZOOM, CAM_ZOOM);
  ctx.translate(-camera.x, -camera.y);

  // ground — use the 4 tiles from tileset (16x16 each in 32x32 sheet)
  const halfW = (w / CAM_ZOOM) / 2 + TILE;
  const halfH = (h / CAM_ZOOM) / 2 + TILE;
  const startTX = Math.max(0, Math.floor((camera.x - halfW) / TILE));
  const endTX = Math.min(WORLD_W - 1, Math.floor((camera.x + halfW) / TILE));
  const startTY = Math.max(0, Math.floor((camera.y - halfH) / TILE));
  const endTY = Math.min(WORLD_H - 1, Math.floor((camera.y + halfH) / TILE));

  // Draw tiles with 1px overlap and integer coords to avoid sub-pixel seams under zoom
  if (IMG.tile.complete) {
    for (let ty = startTY; ty <= endTY; ty++) {
      for (let tx = startTX; tx <= endTX; tx++) {
        const t = tileMap[ty][tx];
        const sx2 = (t % 2) * 16;
        const sy2 = Math.floor(t / 2) * 16;
        const dx = Math.floor(tx * TILE);
        const dy = Math.floor(ty * TILE);
        ctx.drawImage(IMG.tile, sx2, sy2, 16, 16, dx, dy, TILE + 1, TILE + 1);
      }
    }
  } else {
    for (let ty = startTY; ty <= endTY; ty++) {
      for (let tx = startTX; tx <= endTX; tx++) {
        ctx.fillStyle = tileMap[ty][tx] % 2 === 0 ? '#1a2a1a' : '#243024';
        ctx.fillRect(Math.floor(tx * TILE), Math.floor(ty * TILE), TILE + 1, TILE + 1);
      }
    }
  }

  // hold zone (x2 score while inside)
  if (holdZone) {
    const pulse = 0.35 + 0.15 * Math.sin(performance.now() / 280);
    ctx.beginPath();
    ctx.arc(holdZone.x, holdZone.y, holdZone.r, 0, Math.PI * 2);
    ctx.fillStyle = holdingPoint ? `rgba(80,220,120,${pulse + 0.15})` : `rgba(80,160,255,${pulse})`;
    ctx.fill();
    ctx.strokeStyle = holdingPoint ? 'rgba(120,255,160,0.9)' : 'rgba(120,190,255,0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = holdingPoint ? 'rgba(180,255,200,0.95)' : 'rgba(180,220,255,0.85)';
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(holdingPoint ? 'x2 HOLD' : 'HOLD POINT', holdZone.x, holdZone.y + 4);
  }

  for (const t of trees) {
    if (IMG.tree.complete) {
      ctx.drawImage(IMG.tree, 0, 0, 32, 32,
        t.x - TREE_SIZE / 2, t.y - TREE_SIZE / 2, TREE_SIZE, TREE_SIZE);
    }
  }

  for (const p of pickups) {
    const pulse = 0.7 + 0.3 * Math.sin(performance.now() / 150);
    ctx.globalAlpha = Math.min(1, p.life / 2) * pulse;
    const img = p.type === 'hp' ? IMG.healthPickup : IMG.ammoPickup;
    const sz = 22;
    if (img && img.complete) {
      ctx.drawImage(img, p.x - sz / 2, p.y - sz / 2, sz, sz);
    } else {
      ctx.fillStyle = p.type === 'hp' ? '#f44' : '#fd4';
      ctx.fillRect(p.x - 5, p.y - 5, 10, 10);
    }
    ctx.globalAlpha = 1;
  }

  for (const b of eBullets) {
    ctx.fillStyle = '#f88';
    ctx.fillRect(b.x - 3.5, b.y - 3.5, 7, 7);
  }

  for (const b of bullets) {
    if (b.explosive) {
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (IMG.projectile.complete) {
      // projectile art faces UP — rotate so tip points along velocity
      const ang = Math.atan2(b.vy, b.vx);
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(ang + Math.PI / 2);
      ctx.drawImage(IMG.projectile, -14, -14, 28, 28);
      ctx.restore();
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    }
  }

  for (const e of enemies) {
    drawSoldier(e.x, e.y, e.angle, e.body, e.gun, e.gunFW, e.gunFH, e.gunFrames, e.gunAnim > 0, e.bob, false);
    if (e.hp < e.maxHp) {
      const bw = 22, bh = 2;
      ctx.fillStyle = '#000';
      ctx.fillRect(e.x - bw / 2, e.y - BODY_SIZE * 0.55, bw, bh);
      ctx.fillStyle = '#fff';
      ctx.fillRect(e.x - bw / 2, e.y - BODY_SIZE * 0.55, bw * (e.hp / e.maxHp), bh);
    }
    if (save.settings.showHitboxes) {
      ctx.strokeStyle = 'rgba(255,80,80,0.6)';
      ctx.beginPath();
      ctx.arc(e.x, e.y, BODY_SIZE * 0.38, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const wpn = currentWeapon();
  const wImg = WEAPON_IMG[currentWeaponId];
  drawSoldier(player.x, player.y, faceAngle, IMG.player, wImg, wpn.fw, wpn.fh, wpn.frames, gunAnim > 0, 0, true);

  // Temp arrow pointing to hold zone
  if (holdZone && holdArrowTimer > 0) {
    const adx = holdZone.x - player.x;
    const ady = holdZone.y - player.y;
    const adist = Math.sqrt(adx * adx + ady * ady) || 1;
    const ang = Math.atan2(ady, adx);
    const arrowDist = Math.min(48, adist * 0.35);
    const ax = player.x + Math.cos(ang) * arrowDist;
    const ay = player.y + Math.sin(ang) * arrowDist;
    const alpha = Math.min(1, holdArrowTimer / 1.2);
    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(ang);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#6cf';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, -8);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  if (save.settings.showHitboxes) {
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(player.x, player.y, BODY_SIZE * 0.32, 0, Math.PI * 2);
    ctx.stroke();
  }

  for (const p of particles) {
    const a = Math.max(0, p.life / p.maxLife);
    ctx.globalAlpha = a;
    if (IMG.particle.complete) {
      ctx.drawImage(IMG.particle, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    } else {
      ctx.fillStyle = '#fff';
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // vignette
  const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.8);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawSoldier(x, y, angle, bodyImg, gunImg, gw, gh, frames, firing, bob, isPlayer) {
  const bobY = Math.sin(bob || 0) * 1.2;
  const size = BODY_SIZE;
  // Flip when aiming left so face / gun grip don't look mirrored wrong
  const facingLeft = Math.cos(angle) < 0;

  ctx.save();
  ctx.translate(x, y + bobY);

  // Body art faces UP (face at top). Rotate so face points along aim.
  // When facing left, flip X in body-local space after that rotation.
  ctx.save();
  ctx.rotate(angle + Math.PI / 2);
  if (facingLeft) ctx.scale(-1, 1);
  if (bodyImg && bodyImg.complete) {
    ctx.drawImage(bodyImg, 0, 0, 16, 16, -size / 2, -size / 2, size, size);
  } else {
    ctx.fillStyle = isPlayer ? '#ccc' : '#888';
    ctx.fillRect(-size / 2, -size / 2, size, size);
  }
  ctx.restore();

  // Gun art faces RIGHT. Rotate to aim; flip across barrel axis when facing left.
  if (gunImg && gunImg.complete) {
    ctx.save();
    ctx.rotate(angle);
    if (facingLeft) ctx.scale(1, -1);
    const frame = firing ? (1 + Math.floor((performance.now() / 45) % Math.max(1, frames - 1))) : 0;
    const scale = isPlayer ? (gw <= 32 ? 1.15 : 0.85) : (gw <= 32 ? 0.9 : 0.65);
    const dw = gw * scale, dh = gh * scale;
    // Offset gun forward so it sits in front of body, not on face
    const gunOff = isPlayer ? size * 0.38 : size * 0.22;
    ctx.drawImage(gunImg, frame * gw, 0, gw, gh, gunOff, -dh / 2, dw, dh);
    ctx.restore();
  }

  ctx.restore();
}

/* ── HUD ────────────────────────────────────────────────── */
function updateHud() {
  if (!player) return;
  document.getElementById('hudWave').textContent = wave;
  const left = Math.max(0, (enemiesInWave - enemiesSpawned) + enemies.length);
  document.getElementById('hudEnemiesLeft').textContent = left;
  document.getElementById('hudCredits').textContent = sessionCredits + (holdingPoint ? ' x2' : '');
  document.getElementById('hudKills').textContent = kills;
  document.getElementById('healthBarInner').style.width = Math.max(0, (player.hp / player.maxHp) * 100) + '%';
  const w = currentWeapon();
  document.getElementById('hudWeapon').textContent = w.name + (isReloading ? ' [REL]' : '');
  const mag = magCapacity(w);
  const cur = save.settings.infAmmo ? mag : (ammo[currentWeaponId] ?? 0);
  document.getElementById('hudAmmo').textContent = save.settings.infAmmo ? '∞' : (cur + ' / ' + mag);

  // Bullet ticks — max 30 so huge/inf mags don't flood the HUD
  const MAX_TICKS = 30;
  const ticksEl = document.getElementById('ammoTicks');
  const showMag = Math.min(mag, MAX_TICKS);
  const showCur = Math.min(cur, MAX_TICKS);
  let html = '';
  for (let i = 0; i < showMag; i++) {
    html += `<span class="tick${i < showCur ? '' : ' empty'}"></span>`;
  }
  ticksEl.innerHTML = html;
}

/* ── Loop ───────────────────────────────────────────────── */
function loop(t) {
  if (!lastTime) lastTime = t;
  const dt = Math.min(0.05, (t - lastTime) / 1000);
  lastTime = t;

  if (mode === 'run') {
    update(dt);
    updatePickups(dt);
  }
  if (mode === 'run' || mode === 'paused' || mode === 'tutorial') render();

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ── Input ──────────────────────────────────────────────── */
const touchMove = { active: false, mx: 0, my: 0 };
let aimTouchId = null;

window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
window.addEventListener('mousedown', e => {
  if (mode !== 'run' || e.target.closest('button') || e.target.closest('#mobileControls')) return;
  holdFire = true;
  if (!currentWeapon().auto && fireCooldown <= 0) firePlayer();
});
window.addEventListener('mouseup', () => { holdFire = false; });

// Prevent page scroll while playing
document.addEventListener('touchmove', e => {
  if (document.body.classList.contains('in-run')) e.preventDefault();
}, { passive: false });
document.addEventListener('gesturestart', e => e.preventDefault());

// Right-side aim / fire via touch on canvas (not on UI controls)
window.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse') return;
  if (mode !== 'run') return;
  if (e.target.closest('#mobileControls') || e.target.closest('button') || e.target.closest('.overlay')) return;
  aimTouchId = e.pointerId;
  mouseX = e.clientX; mouseY = e.clientY;
  holdFire = true;
  if (!currentWeapon().auto && fireCooldown <= 0) firePlayer();
}, { passive: true });
window.addEventListener('pointermove', e => {
  if (e.pointerType === 'mouse') return;
  if (e.pointerId === aimTouchId) {
    mouseX = e.clientX; mouseY = e.clientY;
  }
}, { passive: true });
window.addEventListener('pointerup', e => {
  if (e.pointerId === aimTouchId) {
    aimTouchId = null;
    holdFire = false;
  }
}, { passive: true });
window.addEventListener('pointercancel', e => {
  if (e.pointerId === aimTouchId) {
    aimTouchId = null;
    holdFire = false;
  }
}, { passive: true });

window.addEventListener('keydown', e => {
  keys[e.key.toLowerCase()] = true;
  if (e.key === 'Escape') {
    if (mode === 'run') openPause();
    else if (mode === 'paused') resumeRun();
  }
  if (mode === 'run') {
    if (e.key.toLowerCase() === 'r') startReload();
    const nums = ['1','2','3','4','5','6','7'];
    const ids = ['pistol','rifle','shotgun','lmg','sniper','minigun','rocket'];
    const idx = nums.indexOf(e.key);
    if (idx >= 0 && ownedWeapons.includes(ids[idx])) {
      currentWeaponId = ids[idx];
      isReloading = false;
      toast(WEAPONS[ids[idx]].name);
    }
  }
});
window.addEventListener('keyup', e => { keys[e.key.toLowerCase()] = false; });

/* ── Mobile virtual controls ────────────────────────────── */
function isCoarsePointer() {
  try {
    return window.matchMedia('(pointer: coarse)').matches ||
      ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  } catch (_) { return 'ontouchstart' in window; }
}

function refreshMobileControls() {
  const on = isCoarsePointer() && document.body.classList.contains('in-run') &&
    (mode === 'run' || mode === 'paused' || mode === 'tutorial');
  document.body.classList.toggle('show-mobile-controls', on);
}

function setupMobileControls() {
  const stick = document.getElementById('mcJoystick');
  const knob = document.getElementById('mcKnob');
  const fireBtn = document.getElementById('mcFire');
  const reloadBtn = document.getElementById('mcReload');
  const weaponBtn = document.getElementById('mcWeapon');
  if (!stick || !fireBtn) return;

  const obs = new MutationObserver(refreshMobileControls);
  obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  window.addEventListener('resize', refreshMobileControls);
  window.addEventListener('orientationchange', () => setTimeout(refreshMobileControls, 150));
  refreshMobileControls();

  let stickId = null;
  function stickPos(clientX, clientY) {
    const r = stick.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    let dx = clientX - cx, dy = clientY - cy;
    const max = r.width * 0.38;
    const len = Math.hypot(dx, dy) || 1;
    if (len > max) { dx = dx / len * max; dy = dy / len * max; }
    if (knob) knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const ndx = dx / max, ndy = dy / max;
    const dead = 0.18;
    touchMove.mx = Math.abs(ndx) < dead ? 0 : ndx;
    touchMove.my = Math.abs(ndy) < dead ? 0 : ndy;
  }
  function stickEnd() {
    stickId = null;
    touchMove.active = false;
    touchMove.mx = 0; touchMove.my = 0;
    if (knob) knob.style.transform = 'translate(0,0)';
  }
  stick.addEventListener('pointerdown', e => {
    e.preventDefault(); e.stopPropagation();
    stickId = e.pointerId;
    touchMove.active = true;
    try { stick.setPointerCapture(e.pointerId); } catch (_) {}
    stickPos(e.clientX, e.clientY);
  }, { passive: false });
  stick.addEventListener('pointermove', e => {
    if (e.pointerId !== stickId) return;
    e.preventDefault();
    stickPos(e.clientX, e.clientY);
  }, { passive: false });
  stick.addEventListener('pointerup', e => { if (e.pointerId === stickId) stickEnd(); });
  stick.addEventListener('pointercancel', e => { if (e.pointerId === stickId) stickEnd(); });

  function bindHold(btn, onDown, onUp) {
    if (!btn) return;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      try { btn.setPointerCapture(e.pointerId); } catch (_) {}
      btn.classList.add('active');
      onDown();
    }, { passive: false });
    const end = () => { btn.classList.remove('active'); onUp(); };
    btn.addEventListener('pointerup', end);
    btn.addEventListener('pointercancel', end);
    btn.addEventListener('pointerleave', end);
  }
  bindHold(fireBtn, () => {
    holdFire = true;
    if (mode === 'run' && !currentWeapon().auto && fireCooldown <= 0) firePlayer();
  }, () => { holdFire = false; });
  if (reloadBtn) {
    reloadBtn.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      if (mode === 'run') startReload();
    }, { passive: false });
  }
  if (weaponBtn) {
    weaponBtn.addEventListener('pointerdown', e => {
      e.preventDefault(); e.stopPropagation();
      if (mode !== 'run' || ownedWeapons.length < 2) return;
      const i = ownedWeapons.indexOf(currentWeaponId);
      currentWeaponId = ownedWeapons[(i + 1) % ownedWeapons.length];
      isReloading = false;
      toast(WEAPONS[currentWeaponId].name);
      updateHud();
    }, { passive: false });
  }
}
setupMobileControls();

/* ── Screens ────────────────────────────────────────────── */
const screens = {
  tutorial: document.getElementById('tutorialScreen'),
  title: document.getElementById('titleScreen'),
  pause: document.getElementById('pauseScreen'),
  options: document.getElementById('optionsScreen'),
  upgrades: document.getElementById('upgradesScreen'),
  shop: document.getElementById('shopScreen'),
  end: document.getElementById('endScreen'),
};

function show(name) {
  Object.values(screens).forEach(el => el.classList.remove('show'));
  if (name) screens[name].classList.add('show');
  document.body.classList.toggle('in-run', mode === 'run' || mode === 'paused' || mode === 'tutorial');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 1100);
}

function refreshTitle() {
  document.getElementById('titleBestWave').textContent = save.bestWave;
  document.getElementById('titleCredits').textContent = save.credits;
}

function startGame() {
  // Load world, show tutorial over paused game, then Close starts play
  mode = 'tutorial';
  resetRun();
  document.body.classList.add('in-run');
  show('tutorial');
}

function closeTutorial() {
  mode = 'run';
  show(null);
  document.body.classList.add('in-run');
  startBgMusic();
}

function openPause() {
  mode = 'paused';
  show('pause');
}

function resumeRun() {
  mode = 'run';
  show(null);
  document.body.classList.add('in-run');
  startBgMusic();
}

function quitToTitle() {
  mode = 'title';
  document.body.classList.remove('in-run');
  stopBgMusic();
  refreshTitle();
  show('title');
}

function endRun() {
  mode = 'end';
  document.body.classList.remove('in-run');
  stopBgMusic();
  playSfx('gameover', 0.75, 0);
  save.credits += sessionCredits;
  save.bestWave = Math.max(save.bestWave, wave);
  save.bestScore = Math.max(save.bestScore, score);
  for (const id of ownedWeapons) {
    if (!save.unlockedWeapons.includes(id)) save.unlockedWeapons.push(id);
  }
  writeSave();
  document.getElementById('endWave').textContent = wave;
  document.getElementById('endScore').textContent = score;
  document.getElementById('endKills').textContent = kills;
  document.getElementById('endCreditsEarned').textContent = sessionCredits;
  document.getElementById('endCreditsTotal').textContent = save.credits;
  show('end');
}

/* ── Options + Debug ────────────────────────────────────── */
function refreshOptionsUI() {
  const s = save.settings;
  const setBtn = (id, on) => {
    const b = document.getElementById(id);
    if (!b) return;
    b.textContent = on ? 'ON' : 'OFF';
    b.classList.toggle('off', !on);
  };
  setBtn('btnToggleSfx', s.sfx);
  setBtn('btnToggleMusic', s.music);
  setBtn('btnToggleParticles', s.particles);
  setBtn('btnGodMode', s.godMode);
  setBtn('btnInfAmmo', s.infAmmo);
  setBtn('btnHitboxes', s.showHitboxes);
  setBtn('btnNoEnemyFire', s.noEnemyFire);
  document.getElementById('sfxVolSlider').value = s.sfxVol;
  document.getElementById('sfxVolLabel').textContent = s.sfxVol + '%';
  document.getElementById('musicVolSlider').value = s.musicVol;
  document.getElementById('musicVolLabel').textContent = s.musicVol + '%';
}

function openOptions(from) {
  optionsReturnTo = from;
  refreshOptionsUI();
  show('options');
}

document.getElementById('btnTitleOptions').addEventListener('click', () => openOptions('title'));
document.getElementById('btnPauseOptions').addEventListener('click', () => openOptions('pause'));
document.getElementById('btnOptionsBack').addEventListener('click', () => {
  if (optionsReturnTo === 'pause') show('pause'); else show('title');
});

function toggleSetting(key) {
  save.settings[key] = !save.settings[key];
  writeSave();
  refreshOptionsUI();
}
document.getElementById('btnToggleSfx').addEventListener('click', () => toggleSetting('sfx'));
document.getElementById('btnToggleMusic').addEventListener('click', () => {
  toggleSetting('music');
  if (!save.settings.music) stopBgMusic();
  else if (mode === 'run' || mode === 'paused') startBgMusic();
});
document.getElementById('btnToggleParticles').addEventListener('click', () => toggleSetting('particles'));
document.getElementById('btnGodMode').addEventListener('click', () => toggleSetting('godMode'));
document.getElementById('btnInfAmmo').addEventListener('click', () => toggleSetting('infAmmo'));
document.getElementById('btnHitboxes').addEventListener('click', () => toggleSetting('showHitboxes'));
document.getElementById('btnNoEnemyFire').addEventListener('click', () => toggleSetting('noEnemyFire'));

document.getElementById('sfxVolSlider').addEventListener('input', e => {
  save.settings.sfxVol = +e.target.value;
  writeSave();
  refreshOptionsUI();
});
document.getElementById('musicVolSlider').addEventListener('input', e => {
  save.settings.musicVol = +e.target.value;
  writeSave();
  refreshOptionsUI();
  applyMusicVol();
});
document.getElementById('btnResetData').addEventListener('click', () => {
  if (!confirm('Reset all progress? Credits, upgrades and unlocked weapons will be lost.')) return;
  save = defaultSave();
  writeSave();
  refreshOptionsUI();
  refreshTitle();
  toast('PROGRESS RESET');
});

/* ── Wave shop ──────────────────────────────────────────── */
const SHOP_ITEMS = [
  { id: 'buy_rifle', name: 'RIFLE', desc: 'Unlock / equip Rifle', cost: 80, type: 'weapon', weapon: 'rifle' },
  { id: 'buy_shotgun', name: 'SHOTGUN', desc: 'Unlock / equip Shotgun', cost: 120, type: 'weapon', weapon: 'shotgun' },
  { id: 'buy_lmg', name: 'LMG', desc: 'Unlock / equip LMG', cost: 200, type: 'weapon', weapon: 'lmg' },
  { id: 'buy_sniper', name: 'SNIPER', desc: 'Unlock / equip Sniper', cost: 250, type: 'weapon', weapon: 'sniper' },
  { id: 'buy_minigun', name: 'MINIGUN', desc: 'Unlock / equip Minigun', cost: 400, type: 'weapon', weapon: 'minigun' },
  { id: 'buy_rocket', name: 'ROCKET', desc: 'Unlock / equip Rocket Launcher', cost: 350, type: 'weapon', weapon: 'rocket' },
  { id: 'refill_ammo', name: 'REFILL AMMO', desc: 'Full magazines for all owned weapons', cost: 25, type: 'ammo' },
  { id: 'heal', name: 'MEDKIT', desc: 'Restore 40 HP', cost: 30, type: 'heal' },
  { id: 'boost_dmg', name: 'DAMAGE BOOST', desc: '+35% damage for 30s', cost: 40, type: 'boost', key: 'dmg', dur: 30 },
  { id: 'boost_spd', name: 'SPEED BOOST', desc: '+28% move speed for 25s', cost: 35, type: 'boost', key: 'speed', dur: 25 },
  { id: 'boost_armor', name: 'ARMOR BOOST', desc: '+15% damage resist for 30s', cost: 40, type: 'boost', key: 'armor', dur: 30 },
];

function openShop() {
  mode = 'shop';
  document.body.classList.remove('in-run');
  stopBgMusic();
  document.getElementById('shopWave').textContent = wave;
  document.getElementById('shopCredits').textContent = sessionCredits;
  renderShop();
  show('shop');
}

function renderShop() {
  document.getElementById('shopCredits').textContent = sessionCredits;
  const grid = document.getElementById('shopGrid');
  grid.innerHTML = '';

  function section(title) {
    const sec = document.createElement('div');
    sec.className = 'shop-section';
    sec.innerHTML = `<div class="shop-section-title">${title}</div>`;
    const row = document.createElement('div');
    row.className = 'shop-row';
    sec.appendChild(row);
    grid.appendChild(sec);
    return row;
  }

  // SURVIVAL upgrades
  const survivalIds = ['maxHp', 'regen', 'armor', 'moveSpd'];
  const combatIds = ['dmgBoost', 'magSize', 'reload', 'credits'];
  const rowSurv = section('SURVIVAL');
  for (const def of META_UPGRADES.filter(d => survivalIds.includes(d.id))) {
    const lvl = save.upgrades[def.id];
    const maxed = upgradeMaxed(def);
    const cost = upgradeCost(def);
    const card = document.createElement('div');
    card.className = 'card' + (maxed ? ' maxed' : '');
    card.innerHTML = `
      <div class="card-name">${def.name} <span class="card-level">LV ${lvl}/${def.max}</span></div>
      <div class="card-desc">${def.desc}</div>
      <button class="card-buy" ${maxed || sessionCredits < cost ? 'disabled' : ''}>
        ${maxed ? 'MAX' : cost}
      </button>`;
    card.querySelector('.card-buy').addEventListener('click', () => {
      if (maxed || sessionCredits < cost) return;
      sessionCredits -= cost;
      save.upgrades[def.id]++;
      writeSave();
      meta = metaStats();
      if (def.id === 'maxHp') {
        player.maxHp = meta.maxHp;
        player.hp = Math.min(player.maxHp, player.hp + def.effect);
      }
      playSfx('pickup', 0.7, 0);
      toast(def.name + ' LV ' + save.upgrades[def.id]);
      renderShop();
      updateHud();
    });
    rowSurv.appendChild(card);
  }

  // COMBAT upgrades
  const rowCombat = section('COMBAT');
  for (const def of META_UPGRADES.filter(d => combatIds.includes(d.id))) {
    const lvl = save.upgrades[def.id];
    const maxed = upgradeMaxed(def);
    const cost = upgradeCost(def);
    const card = document.createElement('div');
    card.className = 'card' + (maxed ? ' maxed' : '');
    card.innerHTML = `
      <div class="card-name">${def.name} <span class="card-level">LV ${lvl}/${def.max}</span></div>
      <div class="card-desc">${def.desc}</div>
      <button class="card-buy" ${maxed || sessionCredits < cost ? 'disabled' : ''}>
        ${maxed ? 'MAX' : cost}
      </button>`;
    card.querySelector('.card-buy').addEventListener('click', () => {
      if (maxed || sessionCredits < cost) return;
      sessionCredits -= cost;
      save.upgrades[def.id]++;
      writeSave();
      meta = metaStats();
      playSfx('pickup', 0.7, 0);
      toast(def.name + ' LV ' + save.upgrades[def.id]);
      renderShop();
      updateHud();
    });
    rowCombat.appendChild(card);
  }

  // GEAR — weapons + supplies
  const rowGear = section('GEAR');
  for (const item of SHOP_ITEMS) {
    if (item.type === 'weapon' && wave < WEAPONS[item.weapon].unlockWave) continue;
    const owned = item.type === 'weapon' && ownedWeapons.includes(item.weapon);
    const canAfford = sessionCredits >= item.cost;
    const card = document.createElement('div');
    card.className = 'card' + (owned ? ' owned' : '');
    card.innerHTML = `
      <div class="card-name">${item.name}</div>
      <div class="card-desc">${item.desc}</div>
      <button class="card-buy" ${(!canAfford && !owned) || (item.type === 'weapon' && owned) ? 'disabled' : ''}>
        ${owned ? 'OWNED' : item.cost}
      </button>`;
    card.querySelector('.card-buy').addEventListener('click', () => {
      if (item.type === 'weapon') {
        if (ownedWeapons.includes(item.weapon)) return;
        if (sessionCredits < item.cost) return;
        sessionCredits -= item.cost;
        ownedWeapons.push(item.weapon);
        ammo[item.weapon] = magCapacity(WEAPONS[item.weapon]);
        currentWeaponId = item.weapon;
        if (!save.unlockedWeapons.includes(item.weapon)) {
          save.unlockedWeapons.push(item.weapon);
          writeSave();
        }
        playSfx('pickup', 0.7, 0);
        toast('ACQUIRED ' + item.name);
      } else if (item.type === 'ammo') {
        if (sessionCredits < item.cost) return;
        sessionCredits -= item.cost;
        for (const id of ownedWeapons) ammo[id] = magCapacity(WEAPONS[id]);
        playSfx('pickup', 0.7, 0);
        toast('AMMO REFILLED');
      } else if (item.type === 'heal') {
        if (sessionCredits < item.cost) return;
        sessionCredits -= item.cost;
        player.hp = Math.min(player.maxHp, player.hp + 40);
        playSfx('pickup', 0.7, 0);
        toast('+40 HP');
      } else if (item.type === 'boost') {
        if (sessionCredits < item.cost) return;
        sessionCredits -= item.cost;
        tempBoosts[item.key] = Math.max(tempBoosts[item.key], item.dur);
        playSfx('pickup', 0.7, 0);
        toast(item.name + ' ACTIVE');
      }
      renderShop();
      updateHud();
    });
    rowGear.appendChild(card);
  }
}

document.getElementById('btnShopContinue').addEventListener('click', () => {
  mode = 'run';
  show(null);
  document.body.classList.add('in-run');
  startBgMusic();
  nextWave();
});

/* ── Menu buttons ───────────────────────────────────────── */
document.getElementById('btnTutorialClose').addEventListener('click', closeTutorial);
document.getElementById('btnStart').addEventListener('click', startGame);
document.getElementById('btnResume').addEventListener('click', resumeRun);
document.getElementById('btnQuit').addEventListener('click', quitToTitle);
document.getElementById('pauseBtn').addEventListener('click', openPause);
document.getElementById('btnPlayAgain').addEventListener('click', startGame);
document.getElementById('btnEndTitle').addEventListener('click', quitToTitle);

/* ── Boot ───────────────────────────────────────────────── */
refreshTitle();
show('title');
